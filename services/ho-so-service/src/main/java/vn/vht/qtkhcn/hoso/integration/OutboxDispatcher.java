package vn.vht.qtkhcn.hoso.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import vn.vht.qtkhcn.hoso.domain.DossierStatus;
import vn.vht.qtkhcn.hoso.domain.HoSo;
import vn.vht.qtkhcn.hoso.domain.OutboxEvent;
import vn.vht.qtkhcn.hoso.repository.HoSoRepository;
import vn.vht.qtkhcn.hoso.repository.OutboxEventRepository;

@Component
public class OutboxDispatcher {
    private static final Logger log = LoggerFactory.getLogger(OutboxDispatcher.class);
    private final OutboxEventRepository outboxRepository;
    private final HoSoRepository hoSoRepository;
    private final ObjectMapper json;
    private final RestClient workflow;
    private final TransactionTemplate transactions;

    public OutboxDispatcher(OutboxEventRepository outboxRepository, HoSoRepository hoSoRepository,
            ObjectMapper json, TransactionTemplate transactions,
            @Value("${qtkhcn.workflow.base-url:http://127.0.0.1:8090}") String baseUrl,
            @Value("${qtkhcn.workflow.service-token:}") String serviceToken) {
        this.outboxRepository = outboxRepository;
        this.hoSoRepository = hoSoRepository;
        this.json = json;
        this.transactions = transactions;
        this.workflow = RestClient.builder().baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + serviceToken).build();
    }

    @Scheduled(fixedDelayString = "${qtkhcn.outbox.dispatch-ms:1000}")
    public synchronized void dispatch() {
        List<UUID> ids = transactions.execute(status -> outboxRepository
                .findTop20ByStatusInAndNextAttemptAtLessThanEqualOrderByCreatedAt(
                        List.of(OutboxEvent.Status.PENDING, OutboxEvent.Status.FAILED,
                                OutboxEvent.Status.PROCESSING), now()).stream()
                .map(OutboxEvent::getId).toList());
        if (ids == null) return;
        ids.forEach(this::dispatchOne);
    }

    void dispatchOne(UUID id) {
        OutboxEvent claimed = transactions.execute(status -> {
            OutboxEvent event = outboxRepository.findById(id).orElse(null);
            if (event == null || event.getStatus() == OutboxEvent.Status.SENT
                    || (event.getStatus() == OutboxEvent.Status.PROCESSING
                        && event.getNextAttemptAt().isAfter(now()))) return null;
            event.setStatus(OutboxEvent.Status.PROCESSING);
            event.setAttempts(event.getAttempts() + 1);
            // Lease: a process crash after claim must not strand the row forever. A later dispatcher
            // retries the same request id, which the workflow inbox handles idempotently.
            event.setNextAttemptAt(now().plusSeconds(60));
            return outboxRepository.saveAndFlush(event);
        });
        if (claimed == null) return;

        try {
            StartProcessCommand command = json.readValue(claimed.getPayloadJson(), StartProcessCommand.class);
            StartProcessResponse response = workflow.post().uri("/internal/v1/process-instances")
                    .header("Idempotency-Key", command.requestId().toString())
                    .header("traceparent", traceparent(command.requestId()))
                    .body(command).retrieve().body(StartProcessResponse.class);
            if (response == null || !"STARTED".equals(response.status())) {
                throw new IllegalStateException("Workflow service tra response khong hop le.");
            }
            transactions.executeWithoutResult(status -> markSent(id, response));
        } catch (Exception e) {
            boolean terminal = e instanceof RestClientResponseException response
                    && response.getStatusCode().is4xxClientError();
            transactions.executeWithoutResult(status -> markFailed(id, e, terminal));
        }
    }

    private void markSent(UUID id, StartProcessResponse response) {
        OutboxEvent event = outboxRepository.findById(id).orElseThrow();
        HoSo hoSo = hoSoRepository.findById(event.getAggregateId()).orElseThrow();
        hoSo.setZeebeProcessInstanceKey(Long.valueOf(response.processInstanceId()));
        hoSo.setTrangThai(DossierStatus.PROCESSING);
        hoSo.setStartFailure(null);
        event.setStatus(OutboxEvent.Status.SENT);
        event.setSentAt(now());
        event.setLastError(null);
        hoSoRepository.save(hoSo);
        outboxRepository.save(event);
    }

    private void markFailed(UUID id, Exception failure, boolean terminal) {
        OutboxEvent event = outboxRepository.findById(id).orElseThrow();
        String message = abbreviate(failure.getMessage() == null ? failure.getClass().getSimpleName()
                : failure.getMessage());
        event.setLastError(message);
        if (terminal) {
            event.setStatus(OutboxEvent.Status.FAILED);
            event.setNextAttemptAt(now().plusYears(100));
            HoSo hoSo = hoSoRepository.findById(event.getAggregateId()).orElseThrow();
            hoSo.setTrangThai(DossierStatus.START_FAILED);
            hoSo.setStartFailure(message);
            hoSoRepository.save(hoSo);
        } else {
            // Network errors, 5xx and ambiguous timeouts remain retryable indefinitely. Turning an
            // UNKNOWN start into START_FAILED could let a user create a new request and duplicate
            // an instance that Camunda accepted but has not exposed to search yet.
            event.setStatus(OutboxEvent.Status.FAILED);
            event.setNextAttemptAt(now().plus(retryDelay(event.getAttempts())));
        }
        outboxRepository.save(event);
        log.warn("Outbox {} attempt {} failed: {}", id, event.getAttempts(), message);
    }

    private static Duration retryDelay(int attempts) {
        return Duration.ofSeconds(Math.min(60, 1L << Math.min(attempts, 6)));
    }

    private static OffsetDateTime now() { return OffsetDateTime.now(ZoneOffset.UTC); }
    private static String abbreviate(String value) { return value.length() <= 512 ? value : value.substring(0, 512); }
    private static String traceparent(UUID id) {
        String hex = id.toString().replace("-", "");
        return "00-" + hex + "-" + hex.substring(0, 16) + "-01";
    }
}

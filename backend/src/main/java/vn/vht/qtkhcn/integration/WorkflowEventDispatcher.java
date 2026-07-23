package vn.vht.qtkhcn.integration;

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
import vn.vht.qtkhcn.domain.WorkflowEventOutbox;
import vn.vht.qtkhcn.repository.WorkflowEventOutboxRepository;

@Component
public class WorkflowEventDispatcher {
    private static final Logger log = LoggerFactory.getLogger(WorkflowEventDispatcher.class);
    private final WorkflowEventOutboxRepository repository;
    private final TransactionTemplate transactions;
    private final RestClient hoSo;

    public WorkflowEventDispatcher(WorkflowEventOutboxRepository repository,
            TransactionTemplate transactions,
            @Value("${qtkhcn.ho-so.base-url:http://127.0.0.1:8093}") String baseUrl,
            @Value("${qtkhcn.ho-so.service-token:}") String token) {
        this.repository = repository;
        this.transactions = transactions;
        this.hoSo = RestClient.builder().baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token).build();
    }

    @Scheduled(fixedDelayString = "${qtkhcn.workflow-events.dispatch-ms:1000}")
    public synchronized void dispatch() {
        List<UUID> ids = repository.findTop50ByStatusInAndNextAttemptAtLessThanEqualOrderByCreatedAt(
                List.of(WorkflowEventOutbox.Status.PENDING, WorkflowEventOutbox.Status.FAILED,
                        WorkflowEventOutbox.Status.PROCESSING), now()).stream()
                .map(WorkflowEventOutbox::getEventId).toList();
        ids.forEach(this::dispatchOne);
    }

    void dispatchOne(UUID id) {
        WorkflowEventOutbox event = transactions.execute(status -> {
            var row = repository.findById(id).orElse(null);
            if (row == null || row.getStatus() == WorkflowEventOutbox.Status.SENT
                    || (row.getStatus() == WorkflowEventOutbox.Status.PROCESSING
                        && row.getNextAttemptAt().isAfter(now()))) return null;
            row.setStatus(WorkflowEventOutbox.Status.PROCESSING);
            row.setAttempts(row.getAttempts() + 1);
            row.setNextAttemptAt(now().plusSeconds(60));
            return repository.saveAndFlush(row);
        });
        if (event == null) return;
        try {
            hoSo.post().uri("/internal/v1/workflow-events")
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .body(event.getPayloadJson()).retrieve().toBodilessEntity();
            transactions.executeWithoutResult(status -> {
                var row = repository.findById(id).orElseThrow();
                row.setStatus(WorkflowEventOutbox.Status.SENT);
                row.setSentAt(now());
                row.setLastError(null);
                repository.save(row);
            });
        } catch (Exception e) {
            boolean terminal = e instanceof RestClientResponseException response
                    && response.getStatusCode().is4xxClientError()
                    && response.getStatusCode().value() != 408
                    && response.getStatusCode().value() != 429;
            transactions.executeWithoutResult(status -> {
                var row = repository.findById(id).orElseThrow();
                row.setStatus(WorkflowEventOutbox.Status.FAILED);
                row.setLastError(abbreviate(e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage()));
                row.setNextAttemptAt(terminal ? now().plusYears(100)
                        : now().plus(retryDelay(row.getAttempts())));
                repository.save(row);
            });
            log.warn("Workflow event {} chua gui duoc: {}", id, e.getMessage());
        }
    }

    private static Duration retryDelay(int attempts) {
        return Duration.ofSeconds(Math.min(60, 1L << Math.min(attempts, 6)));
    }
    private static OffsetDateTime now() { return OffsetDateTime.now(ZoneOffset.UTC); }
    private static String abbreviate(String value) { return value.length() <= 512 ? value : value.substring(0, 512); }
}

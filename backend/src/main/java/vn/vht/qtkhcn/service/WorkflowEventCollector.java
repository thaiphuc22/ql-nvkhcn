package vn.vht.qtkhcn.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;
import vn.vht.qtkhcn.domain.WorkflowEventOutbox;
import vn.vht.qtkhcn.domain.WorkflowProcessMapping;
import vn.vht.qtkhcn.integration.WorkflowEventEnvelope;
import vn.vht.qtkhcn.repository.WorkflowEventOutboxRepository;
import vn.vht.qtkhcn.repository.WorkflowProcessMappingRepository;
import vn.vht.qtkhcn.workflow.WorkflowRuntimeEventReader;

@Component
public class WorkflowEventCollector {
    private static final Logger log = LoggerFactory.getLogger(WorkflowEventCollector.class);
    private final WorkflowProcessMappingRepository mappings;
    private final WorkflowEventOutboxRepository outbox;
    private final WorkflowRuntimeEventReader reader;
    private final ObjectMapper json;
    private final TransactionTemplate transactions;

    public WorkflowEventCollector(WorkflowProcessMappingRepository mappings,
            WorkflowEventOutboxRepository outbox, WorkflowRuntimeEventReader reader,
            ObjectMapper json, TransactionTemplate transactions) {
        this.mappings = mappings;
        this.outbox = outbox;
        this.reader = reader;
        this.json = json;
        this.transactions = transactions;
    }

    @Scheduled(fixedDelayString = "${qtkhcn.workflow-events.collect-ms:1000}")
    public void collect() {
        for (WorkflowProcessMapping mapping : mappings.findAll()) {
            try {
                long processKey = Long.parseLong(mapping.getProcessInstanceId());
                reader.read(processKey).forEach(event -> transactions.executeWithoutResult(status -> {
                    String sourceKey = mapping.getProcessInstanceId() + ":" + event.sourceKey();
                    if (outbox.existsBySourceKey(sourceKey)) return;
                    UUID eventId = UUID.nameUUIDFromBytes(sourceKey.getBytes(StandardCharsets.UTF_8));
                    WorkflowEventEnvelope envelope = new WorkflowEventEnvelope(eventId, event.eventType(),
                            event.occurredAt().toString(), mapping.getRequestId().toString(), mapping.getHoSoId(),
                            mapping.getProcessInstanceId(), event.payload());
                    WorkflowEventOutbox row = new WorkflowEventOutbox();
                    row.setEventId(eventId);
                    row.setSourceKey(sourceKey);
                    row.setEventType(event.eventType().name());
                    row.setCorrelationId(mapping.getRequestId().toString());
                    row.setHoSoId(mapping.getHoSoId());
                    row.setProcessInstanceId(mapping.getProcessInstanceId());
                    row.setOccurredAt(event.occurredAt());
                    row.setPayloadJson(write(envelope));
                    row.setStatus(WorkflowEventOutbox.Status.PENDING);
                    row.setNextAttemptAt(now());
                    row.setCreatedAt(now());
                    outbox.saveAndFlush(row);
                }));
            } catch (Exception e) {
                log.warn("Khong the thu thap workflow event cho process {}: {}",
                        mapping.getProcessInstanceId(), e.getMessage());
            }
        }
    }

    private String write(WorkflowEventEnvelope envelope) {
        try { return json.writeValueAsString(envelope); }
        catch (JsonProcessingException e) { throw new IllegalStateException(e); }
    }
    private static OffsetDateTime now() { return OffsetDateTime.now(ZoneOffset.UTC); }
}

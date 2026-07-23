package vn.vht.qtkhcn.hoso.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.hoso.domain.WorkflowEventInbox;
import vn.vht.qtkhcn.hoso.integration.WorkflowEventEnvelope;
import vn.vht.qtkhcn.hoso.repository.WorkflowEventInboxRepository;

@Service
public class WorkflowEventInboxService {
    private final WorkflowEventInboxRepository repository;
    private final ObjectMapper json;
    private final WorkflowProjectionService projection;

    public WorkflowEventInboxService(WorkflowEventInboxRepository repository, ObjectMapper json,
            WorkflowProjectionService projection) {
        this.repository = repository;
        this.json = json;
        this.projection = projection;
    }

    @Transactional
    public Result receive(WorkflowEventEnvelope envelope) {
        String canonical = canonicalJson(envelope);
        String hash = sha256(canonical);
        int inserted = repository.insertIfAbsent(envelope.eventId(), envelope.eventType().name(), hash,
                envelope.correlationId(), envelope.hoSoId(), envelope.processInstanceId(),
                envelope.occurredAt(), canonical, OffsetDateTime.now(ZoneOffset.UTC));
        if (inserted == 0) {
            WorkflowEventInbox existing = repository.findById(envelope.eventId()).orElseThrow();
            if (!MessageDigest.isEqual(existing.getPayloadHash().getBytes(StandardCharsets.UTF_8),
                    hash.getBytes(StandardCharsets.UTF_8))) {
                throw new WorkflowEventConflictException(envelope.eventId());
            }
            if (existing.getProcessedAt() == null) projection.rebuild(envelope.hoSoId());
            return new Result(false);
        }
        projection.rebuild(envelope.hoSoId());
        return new Result(true);
    }

    private String canonicalJson(WorkflowEventEnvelope envelope) {
        try {
            Map<String, Object> canonical = new LinkedHashMap<>();
            canonical.put("eventId", envelope.eventId().toString());
            canonical.put("eventType", envelope.eventType().name());
            canonical.put("occurredAt", envelope.occurredAt().toString());
            canonical.put("correlationId", envelope.correlationId());
            canonical.put("hoSoId", envelope.hoSoId());
            canonical.put("processInstanceId", envelope.processInstanceId());
            canonical.put("payload", envelope.payload());
            JsonNode tree = json.valueToTree(canonical);
            return json.writer().with(com.fasterxml.jackson.databind.SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS)
                    .writeValueAsString(tree);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Workflow event payload khong hop le", e);
        }
    }

    private static String sha256(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException(impossible);
        }
    }

    public record Result(boolean created) { }
}

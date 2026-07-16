package vn.vht.qtkhcn.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import vn.vht.qtkhcn.camunda.BpmnTestEngineGateway;
import vn.vht.qtkhcn.domain.*;
import vn.vht.qtkhcn.repository.*;
import vn.vht.qtkhcn.web.dto.*;

@Service
public class BpmnTestSessionService {
    public static final String CORRELATION_VARIABLE = "qtkhcnTestCorrelationId";
    private final BpmnTestSessionRepository sessions;
    private final ProcessDefinitionDraftRevisionRepository revisions;
    private final ProcessDefinitionImportValidator validator;
    private final BpmnTestEngineGateway engine;
    private final ObjectMapper json;
    private final Clock clock;
    private final long defaultTtl;
    private final long maxTtl;

    @Autowired
    public BpmnTestSessionService(BpmnTestSessionRepository sessions,
            ProcessDefinitionDraftRevisionRepository revisions,
            ProcessDefinitionImportValidator validator, BpmnTestEngineGateway engine,
            @Qualifier("bpmnTestObjectMapper") ObjectMapper json,
            @Value("${qtkhcn.bpmn-test.default-ttl-seconds:900}") long defaultTtl,
            @Value("${qtkhcn.bpmn-test.max-ttl-seconds:3600}") long maxTtl) {
        this(sessions, revisions, validator, engine, json, Clock.systemUTC(), defaultTtl, maxTtl);
    }

    BpmnTestSessionService(BpmnTestSessionRepository sessions,
            ProcessDefinitionDraftRevisionRepository revisions,
            ProcessDefinitionImportValidator validator, BpmnTestEngineGateway engine,
            ObjectMapper json, Clock clock, long defaultTtl, long maxTtl) {
        this.sessions = sessions; this.revisions = revisions; this.validator = validator;
        this.engine = engine; this.json = json; this.clock = clock;
        this.defaultTtl = defaultTtl; this.maxTtl = maxTtl;
    }

    public BpmnTestSessionResponse create(CreateBpmnTestRequest request, String actorHeader) {
        var revision = revisions.findByDraftIdAndRevision(request.draftId(), request.revision())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy draft/revision được yêu cầu."));
        var bpmn = validator.validate(revision.getBpmnXml(), revision.getResourceName());
        if (bpmn.hasErrors()) {
            throw new ProcessImportException(ProcessImportException.Kind.VALIDATION,
                    "BPMN còn lỗi chặn chạy thử.", bpmn.issues().stream()
                            .filter(issue -> issue.severity() == BpmnIssueSeverity.ERROR)
                            .map(issue -> "[%s] %s".formatted(issue.code(), issue.message())).toList());
        }
        if (!bpmn.bpmnProcessId().equals(revision.getBpmnProcessId())) {
            throw new ProcessImportException(ProcessImportException.Kind.VALIDATION,
                    "Metadata draft không khớp BPMN XML.", List.of("bpmnProcessId không khớp process executable."));
        }
        long ttl = request.ttlSeconds() == null ? defaultTtl : request.ttlSeconds();
        if (ttl > maxTtl) throw new IllegalArgumentException("TTL tối đa là " + maxTtl + " giây.");
        String correlation = "bpmn-test-" + UUID.randomUUID();
        Map<String, Object> variables = new HashMap<>(request.variables() == null ? Map.of() : request.variables());
        variables.put(CORRELATION_VARIABLE, correlation);
        OffsetDateTime now = OffsetDateTime.now(clock);
        BpmnTestSession session = new BpmnTestSession();
        session.setId(UUID.randomUUID()); session.setDraftId(request.draftId());
        session.setDraftRevision(request.revision()); session.setCorrelationId(correlation);
        session.setActor(actor(actorHeader)); session.setStatus(BpmnTestStatus.STARTING);
        session.setInitialVariables(writeJson(variables)); session.setCreatedAt(now);
        session.setExpiresAt(now.plusSeconds(ttl));
        sessions.save(session);
        try {
            var started = engine.deployAndStart(bpmn.bytes(), bpmn.resourceName(), variables);
            session.setProcessDefinitionKey(started.processDefinitionKey());
            session.setProcessInstanceKey(started.processInstanceKey());
            session.setStatus(BpmnTestStatus.RUNNING);
            sessions.save(session);
        } catch (RuntimeException e) {
            session.setStatus(BpmnTestStatus.FAILED); session.setEndedAt(OffsetDateTime.now(clock));
            session.setFailureMessage(rootMessage(e)); sessions.save(session);
            throw new IllegalStateException("Không thể khởi tạo BPMN test session trên test engine cô lập: "
                    + rootMessage(e), e);
        }
        return get(session.getId());
    }

    public BpmnTestSessionResponse get(UUID id) {
        BpmnTestSession s = find(id);
        if (s.getStatus().terminal() || s.getProcessInstanceKey() == null) return response(s, emptySnapshot());
        expireIfNeeded(s);
        if (s.getStatus().terminal()) return response(s, emptySnapshot());
        BpmnTestEngineGateway.EngineSnapshot snapshot;
        try {
            snapshot = engine.snapshot(s.getProcessInstanceKey());
        } catch (RuntimeException e) {
            s.setFailureMessage("Không đọc được snapshot test engine: " + rootMessage(e));
            sessions.save(s);
            throw new IllegalStateException(s.getFailureMessage(), e);
        }
        if ("COMPLETED".equals(snapshot.processState())) end(s, BpmnTestStatus.COMPLETED, null);
        else if ("TERMINATED".equals(snapshot.processState())) end(s, BpmnTestStatus.CANCELLED, null);
        else s.setStatus(snapshot.blockedJobs().isEmpty() ? BpmnTestStatus.RUNNING : BpmnTestStatus.BLOCKED);
        sessions.save(s);
        return response(s, snapshot);
    }

    public BpmnTestSessionResponse completeTask(UUID id, long taskKey, Map<String, Object> variables) {
        BpmnTestSession s = find(id); requireActive(s); expireIfNeeded(s); requireActive(s);
        try {
            engine.completeTask(s.getProcessInstanceKey(), taskKey, variables == null ? Map.of() : variables);
        } catch (NoSuchElementException e) {
            throw e;
        } catch (RuntimeException e) {
            s.setFailureMessage("Không complete được user task trên test engine: " + rootMessage(e));
            sessions.save(s);
            throw new IllegalStateException(s.getFailureMessage(), e);
        }
        s.setStatus(BpmnTestStatus.RUNNING); sessions.save(s);
        return get(id);
    }

    public BpmnTestSessionResponse resolveIncident(UUID id, long incidentKey, Map<String, Object> variables) {
        BpmnTestSession s = find(id); requireActive(s); expireIfNeeded(s); requireActive(s);
        try {
            engine.setVariables(s.getProcessInstanceKey(), variables == null ? Map.of() : variables);
            engine.resolveIncident(incidentKey);
        } catch (RuntimeException e) {
            s.setFailureMessage("Không sửa được incident trên test engine: " + rootMessage(e));
            sessions.save(s);
            throw new IllegalStateException(s.getFailureMessage(), e);
        }
        s.setStatus(BpmnTestStatus.RUNNING); sessions.save(s);
        return get(id);
    }

    public BpmnTestSessionResponse bypassServiceTask(UUID id, long jobKey, Map<String, Object> variables) {
        BpmnTestSession s = find(id); requireActive(s); expireIfNeeded(s); requireActive(s);
        try {
            engine.bypassServiceTask(s.getProcessInstanceKey(), jobKey, variables == null ? Map.of() : variables);
        } catch (NoSuchElementException e) {
            throw e;
        } catch (RuntimeException e) {
            s.setFailureMessage("Không bypass được service task trên test engine: " + rootMessage(e));
            sessions.save(s);
            throw new IllegalStateException(s.getFailureMessage(), e);
        }
        s.setStatus(BpmnTestStatus.RUNNING); sessions.save(s);
        return get(id);
    }

    public BpmnTestSessionResponse cancel(UUID id) {
        BpmnTestSession s = find(id);
        if (!s.getStatus().terminal() && s.getProcessInstanceKey() != null) {
            try {
                engine.cancel(s.getProcessInstanceKey());
            } catch (RuntimeException e) {
                s.setFailureMessage("Không cancel được test engine instance: " + rootMessage(e));
                sessions.save(s);
                throw new IllegalStateException(s.getFailureMessage(), e);
            }
        }
        if (!s.getStatus().terminal()) end(s, BpmnTestStatus.CANCELLED, null);
        return response(s, emptySnapshot());
    }

    @Scheduled(fixedDelayString = "${qtkhcn.bpmn-test.expiry-scan-ms:30000}")
    public void expireSessions() {
        var active = List.of(BpmnTestStatus.STARTING, BpmnTestStatus.RUNNING, BpmnTestStatus.BLOCKED);
        for (BpmnTestSession s : sessions.findByExpiresAtBeforeAndStatusIn(OffsetDateTime.now(clock), active)) {
            try { expire(s); } catch (RuntimeException e) {
                s.setFailureMessage("TTL cleanup chưa cancel được engine instance: " + rootMessage(e));
                sessions.save(s);
            }
        }
    }

    private void expireIfNeeded(BpmnTestSession s) {
        if (!OffsetDateTime.now(clock).isBefore(s.getExpiresAt())) expire(s);
    }
    private void expire(BpmnTestSession s) {
        if (s.getProcessInstanceKey() != null) engine.cancel(s.getProcessInstanceKey());
        end(s, BpmnTestStatus.TIMED_OUT, null);
    }
    private void end(BpmnTestSession s, BpmnTestStatus status, String failure) {
        s.setStatus(status); s.setEndedAt(OffsetDateTime.now(clock)); s.setFailureMessage(failure); sessions.save(s);
    }
    private BpmnTestSession find(UUID id) { return sessions.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Không tìm thấy BPMN test session " + id + ".")); }
    private static void requireActive(BpmnTestSession s) {
        if (s.getStatus().terminal()) throw new IllegalStateException("Test session đã kết thúc: " + s.getStatus());
    }
    private BpmnTestSessionResponse response(BpmnTestSession s, BpmnTestEngineGateway.EngineSnapshot x) {
        return new BpmnTestSessionResponse(s.getId(), s.getDraftId(), s.getDraftRevision(),
                s.getCorrelationId(), s.getActor(), s.getStatus(), s.getProcessDefinitionKey(),
                s.getProcessInstanceKey(), s.getCreatedAt(), s.getExpiresAt(), s.getEndedAt(),
                s.getFailureMessage(), x.elements(), x.tasks(), x.variables(), x.incidents(), x.blockedJobs());
    }
    private static BpmnTestEngineGateway.EngineSnapshot emptySnapshot() {
        return new BpmnTestEngineGateway.EngineSnapshot("UNKNOWN", List.of(), List.of(), Map.of(), List.of(), List.of());
    }
    private String writeJson(Object value) { try { return json.writeValueAsString(value); }
        catch (Exception e) { throw new IllegalArgumentException("Variables không serialize được thành JSON.", e); } }
    private static String actor(String value) { return value == null || value.isBlank() ? "dev-api-user" : value.trim(); }
    private static String rootMessage(Throwable e) { Throwable r=e; while(r.getCause()!=null) r=r.getCause();
        return r.getMessage() == null ? r.getClass().getSimpleName() : r.getMessage(); }
}

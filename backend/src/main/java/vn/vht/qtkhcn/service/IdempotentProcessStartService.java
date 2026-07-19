package vn.vht.qtkhcn.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import vn.vht.qtkhcn.camunda.CamundaReliableWorkflowEngine.ProcessNotActiveException;
import vn.vht.qtkhcn.domain.WorkflowProcessMapping;
import vn.vht.qtkhcn.domain.WorkflowStartInbox;
import vn.vht.qtkhcn.repository.WorkflowProcessMappingRepository;
import vn.vht.qtkhcn.repository.WorkflowStartInboxRepository;
import vn.vht.qtkhcn.web.dto.StartProcessRequest;
import vn.vht.qtkhcn.web.dto.StartProcessResponse;
import vn.vht.qtkhcn.workflow.ReliableWorkflowEngine;

@Service
public class IdempotentProcessStartService {
    private static final Set<String> ALLOWED_VARIABLES = Set.of("maHoSo", "cap", "loaiNhiemVu");
    private final WorkflowStartInboxRepository inboxRepository;
    private final WorkflowProcessMappingRepository mappingRepository;
    private final ReliableWorkflowEngine engine;
    private final ObjectMapper json;
    private final TransactionTemplate transactions;

    public IdempotentProcessStartService(WorkflowStartInboxRepository inboxRepository,
            WorkflowProcessMappingRepository mappingRepository, ReliableWorkflowEngine engine,
            ObjectMapper json, TransactionTemplate transactions) {
        this.inboxRepository = inboxRepository;
        this.mappingRepository = mappingRepository;
        this.engine = engine;
        this.json = json;
        this.transactions = transactions;
    }

    public Result start(StartProcessRequest request) {
        validateVariables(request);
        String canonical = canonical(request);
        String hash = sha256(canonical);
        WorkflowStartInbox inbox = register(request, canonical, hash);
        verifyHash(inbox, hash, request);

        if (inbox.getStatus() == WorkflowStartInbox.Status.STARTED) return result(inbox, false);
        if (inbox.getStatus() == WorkflowStartInbox.Status.FAILED) {
            throw new WorkflowStartException(inbox.getErrorCode(), HttpStatus.UNPROCESSABLE_ENTITY,
                    inbox.getErrorMessage());
        }

        if (inbox.getStatus() == WorkflowStartInbox.Status.UNKNOWN) {
            try {
                var recovered = engine.findByRequestId(request.requestId());
                if (recovered.isPresent()) return complete(request, recovered.get(), false);
                throw new WorkflowStartException("START_RESULT_UNKNOWN", HttpStatus.SERVICE_UNAVAILABLE,
                        "Ket qua start chua xac dinh; retry se reconcile, khong start trung.");
            } catch (WorkflowStartException e) {
                throw e;
            } catch (Exception e) {
                throw new WorkflowStartException("WORKFLOW_UNAVAILABLE", HttpStatus.SERVICE_UNAVAILABLE,
                        "Khong the reconcile workflow engine; request van duoc giu an toan.");
            }
        }

        transactions.executeWithoutResult(status -> {
            WorkflowStartInbox current = inboxRepository.findById(request.requestId()).orElseThrow();
            current.setStatus(WorkflowStartInbox.Status.UNKNOWN);
            current.setAttempts(current.getAttempts() + 1);
            current.setUpdatedAt(now());
            inboxRepository.save(current);
        });
        try {
            return complete(request, engine.start(request.processCode(), request.businessKey(),
                    request.requestId(), request.initialVariables()), true);
        } catch (ProcessNotActiveException e) {
            fail(request, "PROCESS_NOT_ACTIVE", e.getMessage());
            throw new WorkflowStartException("PROCESS_NOT_ACTIVE", HttpStatus.UNPROCESSABLE_ENTITY, e.getMessage());
        } catch (Exception e) {
            throw new WorkflowStartException("WORKFLOW_UNAVAILABLE", HttpStatus.SERVICE_UNAVAILABLE,
                    "Workflow engine tam thoi khong san sang; request duoc giu de reconcile.");
        }
    }

    private WorkflowStartInbox register(StartProcessRequest request, String canonical, String hash) {
        WorkflowStartInbox existing = inboxRepository.findById(request.requestId()).orElse(null);
        if (existing != null) return existing;
        try {
            return transactions.execute(status -> {
                WorkflowStartInbox inbox = new WorkflowStartInbox();
                inbox.setRequestId(request.requestId());
                inbox.setPayloadHash(hash);
                inbox.setPayloadJson(canonical);
                inbox.setStatus(WorkflowStartInbox.Status.RECEIVED);
                inbox.setCreatedAt(now());
                inbox.setUpdatedAt(inbox.getCreatedAt());
                return inboxRepository.saveAndFlush(inbox);
            });
        } catch (DataIntegrityViolationException race) {
            return inboxRepository.findById(request.requestId()).orElseThrow(() -> race);
        }
    }

    private Result complete(StartProcessRequest request, ReliableWorkflowEngine.StartedProcess started,
            boolean created) {
        return transactions.execute(status -> {
            WorkflowStartInbox inbox = inboxRepository.findById(request.requestId()).orElseThrow();
            if (inbox.getStatus() == WorkflowStartInbox.Status.STARTED) return result(inbox, false);
            inbox.setStatus(WorkflowStartInbox.Status.STARTED);
            inbox.setProcessInstanceId(started.processInstanceId());
            inbox.setProcessDefinitionId(started.processDefinitionId());
            inbox.setProcessVersion(started.processVersion());
            inbox.setUpdatedAt(now());
            inboxRepository.save(inbox);

            WorkflowProcessMapping mapping = new WorkflowProcessMapping();
            mapping.setRequestId(request.requestId());
            mapping.setBusinessKey(request.businessKey());
            mapping.setHoSoId(request.hoSoId());
            mapping.setNhiemVuId(request.nhiemVuId());
            mapping.setProcessInstanceId(started.processInstanceId());
            mapping.setProcessDefinitionId(started.processDefinitionId());
            mapping.setProcessVersion(started.processVersion());
            mapping.setStartedAt(now());
            mappingRepository.save(mapping);
            return result(inbox, created);
        });
    }

    private void fail(StartProcessRequest request, String code, String message) {
        transactions.executeWithoutResult(status -> {
            WorkflowStartInbox inbox = inboxRepository.findById(request.requestId()).orElseThrow();
            inbox.setStatus(WorkflowStartInbox.Status.FAILED);
            inbox.setErrorCode(code);
            inbox.setErrorMessage(message);
            inbox.setUpdatedAt(now());
            inboxRepository.save(inbox);
        });
    }

    private static void verifyHash(WorkflowStartInbox inbox, String hash, StartProcessRequest request) {
        if (!MessageDigest.isEqual(inbox.getPayloadHash().getBytes(StandardCharsets.US_ASCII),
                hash.getBytes(StandardCharsets.US_ASCII))) {
            throw new WorkflowStartException("IDEMPOTENCY_CONFLICT", HttpStatus.CONFLICT,
                    "Idempotency-Key da duoc dung voi payload khac: " + request.requestId());
        }
    }

    private static void validateVariables(StartProcessRequest request) {
        Map<String, Object> variables = request.initialVariables();
        if (!ALLOWED_VARIABLES.containsAll(variables.keySet())) {
            throw new WorkflowStartException("VARIABLE_NOT_ALLOWED", HttpStatus.UNPROCESSABLE_ENTITY,
                    "initialVariables chua field ngoai allowlist.");
        }
        for (Object value : variables.values()) {
            boolean scalar = value instanceof String || value instanceof Number || value instanceof Boolean;
            boolean stringList = value instanceof List<?> list && list.stream().allMatch(String.class::isInstance);
            if (!scalar && !stringList) {
                throw new WorkflowStartException("VARIABLE_NOT_ALLOWED", HttpStatus.UNPROCESSABLE_ENTITY,
                        "initialVariables chi duoc chua scalar hoac string array.");
            }
        }
        if (!request.hoSoId().equals(variables.get("maHoSo"))) {
            throw new WorkflowStartException("VARIABLE_NOT_ALLOWED", HttpStatus.UNPROCESSABLE_ENTITY,
                    "maHoSo phai trung hoSoId.");
        }
        if ("RD01.01".equals(request.processCode())
                && !(variables.get("cap") instanceof String cap && Set.of("CS", "TD").contains(cap))) {
            throw new WorkflowStartException("VARIABLE_NOT_ALLOWED", HttpStatus.UNPROCESSABLE_ENTITY,
                    "RD01.01 yeu cau cap CS hoac TD.");
        }
    }

    private String canonical(StartProcessRequest request) {
        Map<String, Object> root = new TreeMap<>();
        root.put("businessKey", request.businessKey());
        root.put("hoSoId", request.hoSoId());
        root.put("initialVariables", new TreeMap<>(request.initialVariables()));
        root.put("initiatorUserId", request.initiatorUserId());
        root.put("nhiemVuId", request.nhiemVuId());
        root.put("processCode", request.processCode());
        root.put("requestId", request.requestId().toString());
        try { return json.writeValueAsString(root); }
        catch (JsonProcessingException e) { throw new IllegalArgumentException("Payload JSON khong hop le.", e); }
    }

    private static String sha256(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                .digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch (NoSuchAlgorithmException impossible) { throw new IllegalStateException(impossible); }
    }
    private static OffsetDateTime now() { return OffsetDateTime.now(ZoneOffset.UTC); }
    private static Result result(WorkflowStartInbox inbox, boolean created) {
        return new Result(new StartProcessResponse(inbox.getRequestId(), inbox.getProcessInstanceId(),
                inbox.getProcessDefinitionId(), inbox.getProcessVersion(), "STARTED"), created);
    }
    public record Result(StartProcessResponse response, boolean created) {}
}

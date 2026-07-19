package vn.vht.qtkhcn.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.SimpleTransactionStatus;
import org.springframework.transaction.support.TransactionTemplate;
import vn.vht.qtkhcn.domain.WorkflowProcessMapping;
import vn.vht.qtkhcn.domain.WorkflowStartInbox;
import vn.vht.qtkhcn.repository.WorkflowProcessMappingRepository;
import vn.vht.qtkhcn.repository.WorkflowStartInboxRepository;
import vn.vht.qtkhcn.web.dto.StartProcessRequest;
import vn.vht.qtkhcn.workflow.ReliableWorkflowEngine;

class IdempotentProcessStartServiceTest {
    private final Map<UUID, WorkflowStartInbox> inboxes = new HashMap<>();
    private WorkflowStartInboxRepository inboxRepository;
    private WorkflowProcessMappingRepository mappingRepository;
    private ReliableWorkflowEngine engine;
    private IdempotentProcessStartService service;

    @BeforeEach
    void setUp() {
        inboxes.clear();
        inboxRepository = mock(WorkflowStartInboxRepository.class);
        mappingRepository = mock(WorkflowProcessMappingRepository.class);
        engine = mock(ReliableWorkflowEngine.class);
        when(inboxRepository.findById(any())).thenAnswer(a -> Optional.ofNullable(inboxes.get(a.getArgument(0))));
        when(inboxRepository.saveAndFlush(any())).thenAnswer(a -> save(a.getArgument(0)));
        when(inboxRepository.save(any())).thenAnswer(a -> save(a.getArgument(0)));
        when(mappingRepository.save(any())).thenAnswer(a -> a.getArgument(0, WorkflowProcessMapping.class));
        service = new IdempotentProcessStartService(inboxRepository, mappingRepository, engine,
                new ObjectMapper(), new TransactionTemplate(new NoopTransactionManager()));
    }

    @Test
    void sameKeyAndPayloadStartsOnceAndReturnsStoredResult() {
        StartProcessRequest request = request(UUID.randomUUID(), "HS-001");
        when(engine.start(any(), any(), any(), any())).thenReturn(started("1001"));

        var first = service.start(request);
        var duplicate = service.start(request);

        assertTrue(first.created());
        assertFalse(duplicate.created());
        assertEquals("1001", duplicate.response().processInstanceId());
        verify(engine, times(1)).start(any(), any(), any(), any());
        verify(mappingRepository, times(1)).save(any());
    }

    @Test
    void sameKeyWithDifferentPayloadReturnsConflictWithoutSecondStart() {
        UUID id = UUID.randomUUID();
        when(engine.start(any(), any(), any(), any())).thenReturn(started("1002"));
        service.start(request(id, "HS-001"));

        WorkflowStartException conflict = assertThrows(WorkflowStartException.class,
                () -> service.start(request(id, "HS-OTHER")));

        assertEquals("IDEMPOTENCY_CONFLICT", conflict.getCode());
        verify(engine, times(1)).start(any(), any(), any(), any());
    }

    @Test
    void timeoutAfterEngineAcceptedIsReconciledOnRetryWithoutStartingAgain() {
        StartProcessRequest request = request(UUID.randomUUID(), "HS-003");
        when(engine.start(any(), any(), any(), any())).thenThrow(new RuntimeException("timeout"));
        when(engine.findByRequestId(request.requestId())).thenReturn(Optional.of(started("1003")));

        WorkflowStartException unavailable = assertThrows(WorkflowStartException.class,
                () -> service.start(request));
        var recovered = service.start(request);

        assertEquals("WORKFLOW_UNAVAILABLE", unavailable.getCode());
        assertFalse(recovered.created());
        assertEquals("1003", recovered.response().processInstanceId());
        verify(engine, times(1)).start(any(), any(), any(), any());
    }

    @Test
    void objectVariableFailsClosedBeforeInboxOrEngine() {
        UUID id = UUID.randomUUID();
        StartProcessRequest invalid = new StartProcessRequest(id, "HS", "RD01.01", "HS", "NV", "U",
                Map.of("maHoSo", Map.of("leak", true)));
        WorkflowStartException error = assertThrows(WorkflowStartException.class, () -> service.start(invalid));
        assertEquals("VARIABLE_NOT_ALLOWED", error.getCode());
        assertTrue(inboxes.isEmpty());
    }

    private WorkflowStartInbox save(WorkflowStartInbox value) {
        inboxes.put(value.getRequestId(), value);
        return value;
    }
    private static StartProcessRequest request(UUID id, String hoSoId) {
        return new StartProcessRequest(id, hoSoId, "RD01.01", hoSoId, "NV-001", "U-001",
                Map.of("maHoSo", hoSoId, "cap", "TD"));
    }
    private static ReliableWorkflowEngine.StartedProcess started(String id) {
        return new ReliableWorkflowEngine.StartedProcess(id, "RD01_01", 3);
    }
    private static final class NoopTransactionManager implements PlatformTransactionManager {
        @Override public TransactionStatus getTransaction(TransactionDefinition definition) {
            return new SimpleTransactionStatus();
        }
        @Override public void commit(TransactionStatus status) { }
        @Override public void rollback(TransactionStatus status) { }
    }
}

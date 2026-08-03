package vn.vht.qtkhcn.hoso.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.hoso.domain.WorkflowEventInbox;
import vn.vht.qtkhcn.hoso.integration.WorkflowEventEnvelope;
import vn.vht.qtkhcn.hoso.repository.WorkflowEventInboxRepository;

class WorkflowEventInboxServiceTest {
    private final WorkflowEventInboxRepository repository = mock(WorkflowEventInboxRepository.class);
    private final WorkflowProjectionService projection = mock(WorkflowProjectionService.class);
    private final WorkflowEventInboxService service = new WorkflowEventInboxService(repository,
            new ObjectMapper().findAndRegisterModules(), projection);

    @Test void storesFirstDeliveryAndDeduplicatesSameEnvelope() {
        WorkflowEventEnvelope event = event(UUID.randomUUID(), "Task_1");
        AtomicReference<String> hash = captureFirstInsertThenDeduplicate(event.eventId());
        assertTrue(service.receive(event).created());
        assertFalse(service.receive(event).created());
        assertTrue(hash.get() != null && hash.get().length() == 64);
        verify(projection).rebuild("HS-1");
    }

    @Test void rejectsReusedEventIdWithDifferentPayload() {
        UUID id = UUID.randomUUID();
        WorkflowEventEnvelope first = event(id, "Task_1");
        captureFirstInsertThenDeduplicate(id);
        service.receive(first);
        assertThrows(WorkflowEventConflictException.class,
                () -> service.receive(event(id, "Task_2")));
    }

    private AtomicReference<String> captureFirstInsertThenDeduplicate(UUID id) {
        AtomicReference<String> hash = new AtomicReference<>();
        when(repository.insertIfAbsent(any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenAnswer(invocation -> { hash.set(invocation.getArgument(2)); return 1; })
                .thenReturn(0);
        when(repository.findById(id)).thenAnswer(invocation -> {
            WorkflowEventInbox inbox = new WorkflowEventInbox();
            inbox.setEventId(id);
            inbox.setPayloadHash(hash.get());
            inbox.setProcessedAt(OffsetDateTime.parse("2026-07-18T10:00:01Z"));
            return Optional.of(inbox);
        });
        return hash;
    }

    private static WorkflowEventEnvelope event(UUID id, String task) {
        return new WorkflowEventEnvelope(id, WorkflowEventEnvelope.EventType.TASK_CREATED,
                OffsetDateTime.parse("2026-07-18T10:00:00Z"), "req-1", "HS-1", "1001",
                Map.of("taskKey", "2001", "taskDefinitionKey", task));
    }
}

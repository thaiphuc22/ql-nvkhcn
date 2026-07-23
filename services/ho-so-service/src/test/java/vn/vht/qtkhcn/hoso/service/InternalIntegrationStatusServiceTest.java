package vn.vht.qtkhcn.hoso.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.hoso.domain.DossierStatus;
import vn.vht.qtkhcn.hoso.domain.HoSo;
import vn.vht.qtkhcn.hoso.domain.OutboxEvent;
import vn.vht.qtkhcn.hoso.domain.WorkflowEventInbox;
import vn.vht.qtkhcn.hoso.repository.HoSoRepository;
import vn.vht.qtkhcn.hoso.repository.OutboxEventRepository;
import vn.vht.qtkhcn.hoso.repository.WorkflowEventInboxRepository;

class InternalIntegrationStatusServiceTest {
    private final OutboxEventRepository outbox = mock(OutboxEventRepository.class);
    private final WorkflowEventInboxRepository inbox = mock(WorkflowEventInboxRepository.class);
    private final HoSoRepository hoSo = mock(HoSoRepository.class);
    private final InternalIntegrationStatusService service =
            new InternalIntegrationStatusService(outbox, inbox, hoSo);

    @Test
    void aggregatesOutboxInboxAndStartFailuresWithoutCreatingASecondStore() {
        when(outbox.countByStatus(OutboxEvent.Status.PENDING)).thenReturn(2L);
        when(outbox.countByStatus(OutboxEvent.Status.FAILED)).thenReturn(1L);
        when(outbox.findFirstByStatusOrderBySentAtDesc(OutboxEvent.Status.SENT))
                .thenReturn(Optional.of(sentEvent()));
        when(inbox.findFirstByEventTypeOrderByOccurredAtDescEventIdDesc("TASK_CREATED"))
                .thenReturn(Optional.of(inboxEvent()));
        when(hoSo.findByTrangThaiOrderById(DossierStatus.START_FAILED))
                .thenReturn(List.of(failedDossier()));

        var result = service.getStatus();

        assertEquals(2, result.outboxPending());
        assertEquals(1, result.outboxFailed());
        assertNotNull(result.latestSent());
        assertEquals("HS-2026-001", result.latestSent().hoSoId());
        assertEquals(1, result.latestInboxByType().size());
        assertEquals("TASK_CREATED", result.latestInboxByType().getFirst().eventType());
        assertEquals("Workflow service timeout", result.startFailedDossiers().getFirst().reason());
    }

    private static OutboxEvent sentEvent() {
        var event = new OutboxEvent();
        event.setId(UUID.fromString("00000000-0000-0000-0000-000000000001"));
        event.setAggregateId("HS-2026-001");
        event.setEventType("START_WORKFLOW");
        event.setStatus(OutboxEvent.Status.SENT);
        event.setCreatedAt(OffsetDateTime.parse("2026-07-18T10:00:00+07:00"));
        event.setSentAt(OffsetDateTime.parse("2026-07-18T10:00:02+07:00"));
        return event;
    }

    private static WorkflowEventInbox inboxEvent() {
        var event = new WorkflowEventInbox();
        event.setEventId(UUID.fromString("00000000-0000-0000-0000-000000000002"));
        event.setEventType("TASK_CREATED");
        event.setHoSoId("HS-2026-001");
        event.setProcessInstanceId("1001");
        event.setOccurredAt(OffsetDateTime.parse("2026-07-18T10:00:03+07:00"));
        event.setReceivedAt(OffsetDateTime.parse("2026-07-18T10:00:04+07:00"));
        return event;
    }

    private static HoSo failedDossier() {
        var dossier = new HoSo();
        dossier.setId("HS-2026-099");
        dossier.setTrangThai(DossierStatus.START_FAILED);
        dossier.setStartFailure("Workflow service timeout");
        return dossier;
    }
}

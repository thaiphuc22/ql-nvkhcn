package vn.vht.qtkhcn.hoso.service;

import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.hoso.domain.DossierStatus;
import vn.vht.qtkhcn.hoso.domain.OutboxEvent;
import vn.vht.qtkhcn.hoso.domain.WorkflowEventInbox;
import vn.vht.qtkhcn.hoso.repository.HoSoRepository;
import vn.vht.qtkhcn.hoso.repository.OutboxEventRepository;
import vn.vht.qtkhcn.hoso.repository.WorkflowEventInboxRepository;
import vn.vht.qtkhcn.hoso.web.dto.InternalIntegrationStatusResponse;

@Service
public class InternalIntegrationStatusService {
    private static final List<String> WORKFLOW_EVENT_TYPES = List.of(
            "TASK_CREATED", "TASK_COMPLETED", "TASK_ACTION_APPLIED", "PROCESS_COMPLETED",
            "PROCESS_REJECTED", "PROCESS_CANCELLED", "INCIDENT_CREATED");

    private final OutboxEventRepository outbox;
    private final WorkflowEventInboxRepository inbox;
    private final HoSoRepository hoSo;

    public InternalIntegrationStatusService(
            OutboxEventRepository outbox,
            WorkflowEventInboxRepository inbox,
            HoSoRepository hoSo) {
        this.outbox = outbox;
        this.inbox = inbox;
        this.hoSo = hoSo;
    }

    @Transactional(readOnly = true)
    public InternalIntegrationStatusResponse getStatus() {
        var latestSent = outbox.findFirstByStatusOrderBySentAtDesc(OutboxEvent.Status.SENT)
                .map(event -> new InternalIntegrationStatusResponse.OutboxEventSummary(
                        event.getId(), event.getAggregateId(), event.getEventType(),
                        event.getCreatedAt(), event.getSentAt()))
                .orElse(null);

        var latestInbox = WORKFLOW_EVENT_TYPES.stream()
                .map(inbox::findFirstByEventTypeOrderByOccurredAtDescEventIdDesc)
                .flatMap(java.util.Optional::stream)
                .map(InternalIntegrationStatusService::toInboxSummary)
                .toList();

        var failedDossiers = hoSo.findByTrangThaiOrderById(DossierStatus.START_FAILED).stream()
                .map(item -> new InternalIntegrationStatusResponse.StartFailedDossier(
                        item.getId(), Objects.requireNonNullElse(item.getStartFailure(), "Không rõ nguyên nhân")))
                .toList();

        return new InternalIntegrationStatusResponse(
                outbox.countByStatus(OutboxEvent.Status.PENDING),
                outbox.countByStatus(OutboxEvent.Status.FAILED),
                latestSent,
                latestInbox,
                failedDossiers);
    }

    private static InternalIntegrationStatusResponse.InboxEventSummary toInboxSummary(WorkflowEventInbox event) {
        return new InternalIntegrationStatusResponse.InboxEventSummary(
                event.getEventId(), event.getEventType(), event.getHoSoId(), event.getProcessInstanceId(),
                event.getOccurredAt(), event.getReceivedAt());
    }
}

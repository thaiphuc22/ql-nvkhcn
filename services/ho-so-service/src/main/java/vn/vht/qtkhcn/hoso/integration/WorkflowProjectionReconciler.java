package vn.vht.qtkhcn.hoso.integration;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import vn.vht.qtkhcn.hoso.repository.WorkflowEventInboxRepository;
import vn.vht.qtkhcn.hoso.service.WorkflowProjectionService;

@Component
public class WorkflowProjectionReconciler {
    private static final Logger log = LoggerFactory.getLogger(WorkflowProjectionReconciler.class);
    private final WorkflowEventInboxRepository inboxRepository;
    private final WorkflowProjectionService projection;

    public WorkflowProjectionReconciler(WorkflowEventInboxRepository inboxRepository,
            WorkflowProjectionService projection) {
        this.inboxRepository = inboxRepository;
        this.projection = projection;
    }

    @Scheduled(fixedDelayString = "${qtkhcn.workflow.projection-reconcile-ms:5000}")
    public void reconcile() {
        List<String> hoSoIds = inboxRepository.findHoSoIdsAwaitingProjection();
        for (String hoSoId : hoSoIds) {
            try {
                projection.rebuild(hoSoId);
            } catch (RuntimeException failure) {
                inboxRepository.recordProjectionError(hoSoId, abbreviate(failure.getMessage()));
                log.warn("Workflow projection reconcile failed for {}: {}", hoSoId, failure.getMessage());
            }
        }
    }

    private static String abbreviate(String value) {
        String safe = value == null ? "Unknown projection failure" : value;
        return safe.length() <= 512 ? safe : safe.substring(0, 512);
    }
}

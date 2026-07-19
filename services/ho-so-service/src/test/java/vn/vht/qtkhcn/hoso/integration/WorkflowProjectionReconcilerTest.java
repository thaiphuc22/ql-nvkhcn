package vn.vht.qtkhcn.hoso.integration;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.hoso.repository.WorkflowEventInboxRepository;
import vn.vht.qtkhcn.hoso.service.WorkflowProjectionService;

class WorkflowProjectionReconcilerTest {
    @Test void rebuildsPendingDossiersAndRecordsPoisonErrorWithoutStoppingBatch() {
        WorkflowEventInboxRepository inbox = mock(WorkflowEventInboxRepository.class);
        WorkflowProjectionService projection = mock(WorkflowProjectionService.class);
        when(inbox.findHoSoIdsAwaitingProjection()).thenReturn(List.of("HS-BAD", "HS-GOOD"));
        doThrow(new IllegalStateException("bad payload")).when(projection).rebuild("HS-BAD");

        new WorkflowProjectionReconciler(inbox, projection).reconcile();

        verify(inbox).recordProjectionError("HS-BAD", "bad payload");
        verify(projection).rebuild("HS-GOOD");
    }
}

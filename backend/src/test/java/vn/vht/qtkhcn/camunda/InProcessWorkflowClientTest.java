package vn.vht.qtkhcn.camunda;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.domain.ActionOutcome;
import vn.vht.qtkhcn.domain.Cap;
import vn.vht.qtkhcn.workflow.StartWorkflowCommand;
import vn.vht.qtkhcn.workflow.WorkflowAction;
import vn.vht.qtkhcn.workflow.WorkflowActionCommand;

class InProcessWorkflowClientTest {

    private Rd0101ProcessService rd0101ProcessService;
    private InProcessWorkflowClient client;

    @BeforeEach
    void setUp() {
        rd0101ProcessService = mock(Rd0101ProcessService.class);
        client = new InProcessWorkflowClient(rd0101ProcessService);
    }

    @Test
    void mapsApplicationStartCommandToExistingRd0101Service() {
        StartWorkflowCommand command = command("RD01.01", Cap.TD);
        when(rd0101ProcessService.startInstance("HS-2026-001", Cap.TD)).thenReturn(73L);

        var result = client.startWorkflow(command);

        assertEquals("73", result.orElseThrow().processInstanceId());
        verify(rd0101ProcessService).startInstance("HS-2026-001", Cap.TD);
    }

    @Test
    void preservesLegacyFailSoftAsAnEmptyStartResult() {
        StartWorkflowCommand command = command("RD01.01", Cap.CS);
        when(rd0101ProcessService.startInstance("HS-2026-001", Cap.CS)).thenReturn(null);

        assertTrue(client.startWorkflow(command).isEmpty());
    }

    @Test
    void mapsApplicationActionWithoutExposingCamundaTaskDtos() {
        client.applyAction(new WorkflowActionCommand("42", WorkflowAction.RETURN_STEP));

        verify(rd0101ProcessService).applyAction(42L, ActionOutcome.RETURN_STEP);
    }

    @Test
    void rejectsUnsupportedProcessBeforeCallingRd0101Service() {
        assertThrows(UnsupportedOperationException.class,
                () -> client.startWorkflow(command("RD02.02", Cap.TD)));
    }

    private static StartWorkflowCommand command(String processCode, Cap cap) {
        return new StartWorkflowCommand(
                "HS-2026-001",
                processCode,
                "HS-2026-001",
                "NV-001",
                "U-001",
                Map.of("maHoSo", "HS-2026-001", "cap", cap.name()));
    }
}

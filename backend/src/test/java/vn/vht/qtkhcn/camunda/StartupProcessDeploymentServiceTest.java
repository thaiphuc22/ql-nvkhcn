package vn.vht.qtkhcn.camunda;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.service.ProcessImportException;

class StartupProcessDeploymentServiceTest {

    private CamundaProcessDefinitionLookup lookup;
    private CamundaDeploymentService deployments;
    private StartupProcessDeploymentService service;

    @BeforeEach
    void setUp() {
        lookup = mock(CamundaProcessDefinitionLookup.class);
        deployments = mock(CamundaDeploymentService.class);
        service = new StartupProcessDeploymentService(lookup, deployments);
    }

    @Test
    void firstBootDeploysExactlyOnce() {
        when(lookup.findLatest("RD01_01")).thenReturn(Optional.empty());
        when(deployments.deployClasspath("processes/rd0101.bpmn"))
                .thenReturn(new CamundaDeploymentService.DeploymentResult(10L, "RD01_01", 1, 11L,
                        "rd0101.bpmn"));

        var result = service.deployIfAbsent("RD01_01", "processes/rd0101.bpmn");

        assertTrue(result.deployed());
        assertEquals(1, result.version());
        verify(deployments).deployClasspath("processes/rd0101.bpmn");
    }

    @Test
    void repeatedStartupSkipsExistingDefinition() {
        when(lookup.findLatest("RD01_01")).thenReturn(Optional.of(
                new CamundaProcessDefinitionLookup.ProcessDefinitionInfo("RD01_01", 3, 33L)));

        var first = service.deployIfAbsent("RD01_01", "processes/rd0101.bpmn");
        var second = service.deployIfAbsent("RD01_01", "processes/rd0101.bpmn");

        assertFalse(first.deployed());
        assertFalse(second.deployed());
        assertEquals(3, second.version());
        verify(deployments, never()).deployClasspath("processes/rd0101.bpmn");
    }

    @Test
    void mismatchedBundledProcessFailsClosed() {
        when(lookup.findLatest("RD01_01")).thenReturn(Optional.empty());
        when(deployments.deployClasspath("processes/rd0101.bpmn"))
                .thenReturn(new CamundaDeploymentService.DeploymentResult(10L, "other", 1, 11L,
                        "rd0101.bpmn"));

        assertThrows(ProcessImportException.class,
                () -> service.deployIfAbsent("RD01_01", "processes/rd0101.bpmn"));
    }

    @Test
    void unavailableLookupFailsClosedWithoutDeploying() {
        when(lookup.findLatest("RD01_01")).thenThrow(new ProcessImportException(
                ProcessImportException.Kind.DEPLOYMENT, "Camunda unavailable", java.util.List.of("timeout")));

        assertThrows(ProcessImportException.class,
                () -> service.deployIfAbsent("RD01_01", "processes/rd0101.bpmn"));

        verify(deployments, never()).deployClasspath("processes/rd0101.bpmn");
    }
}

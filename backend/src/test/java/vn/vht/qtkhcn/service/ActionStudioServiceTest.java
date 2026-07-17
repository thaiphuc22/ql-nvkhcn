package vn.vht.qtkhcn.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.domain.ActionAvailabilityPolicy;
import vn.vht.qtkhcn.domain.ActionStudioAction;
import vn.vht.qtkhcn.repository.ActionAvailabilityPolicyRepository;
import vn.vht.qtkhcn.repository.ActionExceptionPolicyRepository;
import vn.vht.qtkhcn.repository.ActionStudioActionRepository;
import vn.vht.qtkhcn.repository.ActionStudioAuditRepository;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.AvailabilityRequest;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.SimulationRequest;

class ActionStudioServiceTest {
    private ActionStudioActionRepository actions;
    private ActionAvailabilityPolicyRepository policies;
    private ActionStudioService service;

    @BeforeEach
    void setUp() {
        actions = mock(ActionStudioActionRepository.class);
        policies = mock(ActionAvailabilityPolicyRepository.class);
        service = new ActionStudioService(actions, policies, mock(ActionExceptionPolicyRepository.class),
                mock(ActionStudioAuditRepository.class), new ActionStudioRoutingCatalog());
    }

    @Test
    void simulationUsesExactPolicyAndFailsClosedOnMissingPermission() {
        ActionStudioAction approve = action("APPROVE_STEP", true, 1);
        ActionAvailabilityPolicy generic = policy("AP-GENERIC", null, null, 20);
        ActionAvailabilityPolicy exact = policy("AP-EXACT", "RD01.01", "t2", 30);
        when(actions.findAllByOrderByDisplayOrderAsc()).thenReturn(List.of(approve));
        when(policies.findAllByOrderByDisplayOrderAscIdAsc()).thenReturn(List.of(generic, exact));

        var result = service.simulate(new SimulationRequest("DOSSIER_DETAIL", "RD01.01", "t2",
                "processing", List.of("TD"), List.of(), false)).getFirst();

        assertThat(result.visible()).isTrue();
        assertThat(result.enabled()).isFalse();
        assertThat(result.policyId()).isEqualTo("AP-EXACT");
        assertThat(result.reasons()).contains("Thiếu quyền: PROCESS_STEP.");
    }

    @Test
    void stalePresentationUpdateIsRejectedBeforeMutation() {
        ActionStudioAction approve = action("APPROVE_STEP", true, 3);
        when(actions.findById("APPROVE_STEP")).thenReturn(Optional.of(approve));

        assertThatThrownBy(() -> service.updatePresentation("APPROVE_STEP",
                new vn.vht.qtkhcn.web.dto.ActionStudioDtos.PresentationRequest(
                        "Duyệt", "check", "PRIMARY", "primary", 1, null), 2, "alice"))
                .isInstanceOf(ActionStudioConflictException.class)
                .hasMessageContaining("expected version 2");
    }

    @Test
    void scaffoldCreatesOnlyTrulyMissingRows() {
        when(policies.findAllByOrderByDisplayOrderAscIdAsc()).thenReturn(List.of());
        when(actions.findById(any())).thenAnswer(invocation -> Optional.of(action(invocation.getArgument(0), true, 1)));
        when(policies.existsById(any())).thenReturn(false);
        when(policies.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.scaffold("RD05.01", "alice");

        assertThat(response.createdCount()).isEqualTo(4);
        assertThat(response.createdPolicies()).allMatch(item -> item.processCode().equals("RD05.01"));
    }

    @Test
    void availabilityRejectsTaskWithoutProcess() {
        when(actions.findById("APPROVE_STEP")).thenReturn(Optional.of(action("APPROVE_STEP", true, 1)));
        AvailabilityRequest request = new AvailabilityRequest("AP-X", "APPROVE_STEP", "DOSSIER_DETAIL",
                null, "t2", "processing", List.of(), List.of("PROCESS_STEP"), null, null, 1, true);

        assertThatThrownBy(() -> service.createAvailability(request, "alice"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("taskDefinitionKey");
    }

    private static ActionStudioAction action(String code, boolean active, long version) {
        ActionStudioAction item = new ActionStudioAction();
        item.setActionCode(code);
        item.setActionName(code);
        item.setActionType(code.startsWith("REQUEST_") ? "EXCEPTION" : "STANDARD");
        item.setActive(active);
        item.setLabel(code);
        item.setIcon("thunderbolt");
        item.setUiGroup("PRIMARY");
        item.setTone("primary");
        item.setDisplayOrder(10);
        item.setVersion(version);
        item.setUpdatedBy("seed");
        item.setUpdatedAt(OffsetDateTime.now());
        return item;
    }

    private static ActionAvailabilityPolicy policy(String id, String process, String task, int order) {
        ActionAvailabilityPolicy item = new ActionAvailabilityPolicy();
        item.setId(id);
        item.setActionCode("APPROVE_STEP");
        item.setSurface("DOSSIER_DETAIL");
        item.setProcessCode(process);
        item.setTaskDefinitionKey(task);
        item.setDossierStatus("processing");
        item.setAllowedRoleCodes(new LinkedHashSet<>(List.of("TD")));
        item.setRequiredPermissions(new LinkedHashSet<>(List.of("PROCESS_STEP")));
        item.setDisplayOrder(order);
        item.setEnabled(true);
        item.setVersion(1);
        item.setUpdatedBy("seed");
        item.setUpdatedAt(OffsetDateTime.now());
        return item;
    }
}

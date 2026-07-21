package vn.vht.qtkhcn.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.domain.ActionAvailabilityPolicy;
import vn.vht.qtkhcn.domain.ActionStudioAction;
import vn.vht.qtkhcn.domain.ActionStudioAudit;
import vn.vht.qtkhcn.domain.Eform;
import vn.vht.qtkhcn.repository.ActionAvailabilityPolicyRepository;
import vn.vht.qtkhcn.repository.ActionExceptionPolicyRepository;
import vn.vht.qtkhcn.repository.ActionStudioActionRepository;
import vn.vht.qtkhcn.repository.ActionStudioAuditRepository;
import vn.vht.qtkhcn.repository.EformRepository;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.AvailabilityRequest;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.SimulationRequest;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ProcessRoutingResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ProcessStepResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.RouteBranchResponse;

class ActionStudioServiceTest {
    private ActionStudioActionRepository actions;
    private ActionAvailabilityPolicyRepository policies;
    private ActionStudioAuditRepository audits;
    private EformRepository eforms;
    private ActionStudioRoutingCatalog routing;
    private ActionStudioService service;

    @BeforeEach
    void setUp() {
        actions = mock(ActionStudioActionRepository.class);
        policies = mock(ActionAvailabilityPolicyRepository.class);
        audits = mock(ActionStudioAuditRepository.class);
        eforms = mock(EformRepository.class);
        routing = mock(ActionStudioRoutingCatalog.class);
        service = new ActionStudioService(actions, policies, mock(ActionExceptionPolicyRepository.class),
                audits, routing, eforms);
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
        when(routing.require("RD05_01")).thenReturn(new ProcessRoutingResponse("RD05_01", "Quy trình",
                List.of(new ProcessStepResponse("Task_1", "Bước 1", "PM", "phieu-phe-duyet",
                        List.of(new RouteBranchResponse("dong_y", "Đồng ý", "Hoàn tất", "complete"))))));
        when(policies.findAllByOrderByDisplayOrderAscIdAsc()).thenReturn(List.of());
        when(actions.findById(any())).thenAnswer(invocation -> Optional.of(action(invocation.getArgument(0), true, 1)));
        when(policies.existsById(any())).thenReturn(false);
        when(policies.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.scaffold("RD05_01", "alice");

        assertThat(response.createdCount()).isEqualTo(1);
        assertThat(response.createdPolicies()).allMatch(item -> item.processCode().equals("RD05_01"));
    }

    @Test
    void scaffoldUsesApproveAndRejectActionCodesDeclaredByRd0202() {
        when(routing.require("RD02_02")).thenReturn(new ProcessRoutingResponse("RD02_02", "Quy trình",
                List.of(new ProcessStepResponse("T14_GD_TTMS", "Ký duyệt", "GD_TTMS", "phieu-phe-duyet",
                        List.of(new RouteBranchResponse("APPROVE", "Đồng ý", "Bước sau", "forward"),
                                new RouteBranchResponse("REJECT", "Từ chối", "Kết thúc", "reject"))))));
        when(policies.findAllByOrderByDisplayOrderAscIdAsc()).thenReturn(List.of());
        when(actions.findById(any())).thenAnswer(invocation -> Optional.of(action(invocation.getArgument(0), true, 1)));
        when(policies.existsById(any())).thenReturn(false);
        when(policies.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.scaffold("RD02_02", "alice");

        assertThat(response.createdPolicies()).extracting(item -> item.actionCode())
                .containsExactly("APPROVE_STEP", "REJECT_STEP");
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

    @Test
    void availabilityRejectsAnotherEnabledRuleWithSameSelector() {
        ActionAvailabilityPolicy existing = policy("AP-EXISTING", "RD01.01", "t2", 10);
        when(actions.findById("APPROVE_STEP")).thenReturn(Optional.of(action("APPROVE_STEP", true, 1)));
        when(policies.findAllByOrderByDisplayOrderAscIdAsc()).thenReturn(List.of(existing));
        AvailabilityRequest request = new AvailabilityRequest("AP-NEW", "APPROVE_STEP", "DOSSIER_DETAIL",
                "RD01.01", "t2", "processing", List.of(" TD "), List.of(" PROCESS_STEP "),
                null, null, 20, true);

        assertThatThrownBy(() -> service.createAvailability(request, "alice"))
                .isInstanceOf(ActionStudioConflictException.class)
                .hasMessageContaining("AP-EXISTING");
        verify(policies, never()).saveAndFlush(any());
    }

    @Test
    void historyRemainsReadableAfterRuleWasDeleted() {
        ActionStudioAudit deleted = new ActionStudioAudit();
        deleted.setEntityType("AVAILABILITY");
        deleted.setEntityId("AP-DELETED");
        deleted.setAction("DELETE");
        deleted.setActor("alice");
        deleted.setEventAt(OffsetDateTime.parse("2026-07-20T03:00:00Z"));
        deleted.setDetail("Xóa luật hiển thị nút.");
        when(audits.findByEntityTypeAndEntityIdOrderByEventAtDesc("AVAILABILITY", "AP-DELETED"))
                .thenReturn(List.of(deleted));

        var history = service.availabilityHistory("AP-DELETED");

        assertThat(history).singleElement().satisfies(item -> {
            assertThat(item.action()).isEqualTo("DELETE");
            assertThat(item.actor()).isEqualTo("alice");
        });
        verify(policies, never()).findById(any());
    }

    @Test
    void loadProvidesReferenceCatalogsAndFormsFromDatabase() {
        Eform form = new Eform();
        form.setKey("bm-phe-duyet");
        form.setTen("Biểu mẫu phê duyệt");
        when(actions.findAllByOrderByDisplayOrderAsc()).thenReturn(List.of());
        when(policies.findAllByOrderByDisplayOrderAscIdAsc()).thenReturn(List.of());
        when(eforms.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(form));

        var referenceData = service.load().referenceData();

        assertThat(referenceData.surfaces()).extracting(item -> item.value())
                .contains("DOSSIER_DETAIL", "WORKLIST");
        assertThat(referenceData.roles()).extracting(item -> item.value())
                .contains("PM", "CQ_KHCN_TD", "BTGD_TD");
        assertThat(referenceData.forms()).singleElement().satisfies(item -> {
            assertThat(item.value()).isEqualTo("bm-phe-duyet");
            assertThat(item.label()).isEqualTo("Biểu mẫu phê duyệt");
        });
    }

    @Test
    void validatesRequiredEvidenceFieldsFromTheBoundFormSchema() {
        Eform form = new Eform();
        form.setKey("bm-major-step");
        form.setSchemaJson("""
                {"components":[
                  {"type":"textarea","key":"nhanXet","label":"Nhận xét","validate":{"required":true}},
                  {"type":"textfield","key":"ghiChu","label":"Ghi chú"}
                ]}
                """);
        when(eforms.findById("bm-major-step")).thenReturn(Optional.of(form));

        assertThat(service.missingRequiredFormFields("bm-major-step", java.util.Map.of("ghiChu", "ok")))
                .containsExactly("Nhận xét");
        assertThat(service.missingRequiredFormFields("bm-major-step", java.util.Map.of("nhanXet", "Đạt")))
                .isEmpty();
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

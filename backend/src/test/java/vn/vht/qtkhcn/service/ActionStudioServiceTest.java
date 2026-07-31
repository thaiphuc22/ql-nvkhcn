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
import vn.vht.qtkhcn.domain.ActionAvailabilityPolicyStatus;
import vn.vht.qtkhcn.domain.ActionStudioAction;
import vn.vht.qtkhcn.domain.ActionStudioAudit;
import vn.vht.qtkhcn.domain.Eform;
import vn.vht.qtkhcn.repository.ActionAvailabilityPolicyRepository;
import vn.vht.qtkhcn.repository.ActionExceptionPolicyRepository;
import vn.vht.qtkhcn.repository.ActionStudioActionRepository;
import vn.vht.qtkhcn.repository.ActionStudioAuditRepository;
import vn.vht.qtkhcn.repository.EformRepository;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.AvailabilityRequest;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.BulkDeleteAvailabilityItem;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.BulkDeleteAvailabilityRequest;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.BulkStatusAvailabilityRequest;
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
        when(eforms.findById(any())).thenAnswer(invocation -> {
            vn.vht.qtkhcn.domain.Eform form = new vn.vht.qtkhcn.domain.Eform();
            form.setKey(invocation.getArgument(0));
            form.setVersion(1);
            return Optional.of(form);
        });
        routing = mock(ActionStudioRoutingCatalog.class);
        service = new ActionStudioService(actions, policies, mock(ActionExceptionPolicyRepository.class),
                audits, routing, eforms);
    }

    @Test
    void simulationUsesExactPolicyWithoutCouplingActionPolicyToFunctionPermissions() {
        ActionStudioAction approve = action("APPROVE_STEP", true, 1);
        ActionAvailabilityPolicy generic = policy("AP-GENERIC", null, null, 20);
        ActionAvailabilityPolicy exact = policy("AP-EXACT", "RD01.01", "t2", 30);
        when(actions.findAllByOrderByDisplayOrderAsc()).thenReturn(List.of(approve));
        when(policies.findAllByOrderByDisplayOrderAscIdAsc()).thenReturn(List.of(generic, exact));

        var result = service.simulate(new SimulationRequest("DOSSIER_DETAIL", "RD01.01", "t2",
                "processing", List.of("TD"), List.of(), false)).getFirst();

        assertThat(result.visible()).isTrue();
        assertThat(result.enabled()).isTrue();
        assertThat(result.policyId()).isEqualTo("AP-EXACT");
        assertThat(result.reasons()).contains("Khớp luật hiển thị và vai trò được phép.");
    }

    @Test
    void simulationMatchesPolicyRegardlessOfProcessCodeSeparator() {
        ActionStudioAction approve = action("APPROVE_STEP", true, 1);
        ActionAvailabilityPolicy storedWithUnderscore = policy("AP-BPMN-RD02_02-T01-APPROVE", "RD02_02", "T01", 10);
        when(actions.findAllByOrderByDisplayOrderAsc()).thenReturn(List.of(approve));
        when(policies.findAllByOrderByDisplayOrderAscIdAsc()).thenReturn(List.of(storedWithUnderscore));

        var dotted = service.simulate(new SimulationRequest("DOSSIER_DETAIL", "RD02.02", "T01",
                "processing", List.of("TD"), List.of("PROCESS_STEP"), false)).getFirst();
        var dashed = service.simulate(new SimulationRequest("DOSSIER_DETAIL", "rd02-02", "T01",
                "processing", List.of("TD"), List.of("PROCESS_STEP"), false)).getFirst();

        assertThat(dotted.visible()).isTrue();
        assertThat(dotted.policyId()).isEqualTo("AP-BPMN-RD02_02-T01-APPROVE");
        assertThat(dashed.visible()).isTrue();
        assertThat(dashed.policyId()).isEqualTo("AP-BPMN-RD02_02-T01-APPROVE");
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
    void presentationRejectsInvalidActionTypeGroupAndToneCombinations() {
        ActionStudioAction support = action("ADD_COMMENT", true, 1);
        support.setActionType("SUPPORT");
        when(actions.findById("ADD_COMMENT")).thenReturn(Optional.of(support));
        assertThatThrownBy(() -> service.updatePresentation("ADD_COMMENT",
                new vn.vht.qtkhcn.web.dto.ActionStudioDtos.PresentationRequest(
                        "Ý kiến", "comment", "PRIMARY", "primary", 50, null), 1, "alice"))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("Support Action");

        ActionStudioAction exception = action("REQUEST_SKIP_STEP", true, 1);
        exception.setActionType("EXCEPTION");
        when(actions.findById("REQUEST_SKIP_STEP")).thenReturn(Optional.of(exception));
        assertThatThrownBy(() -> service.updatePresentation("REQUEST_SKIP_STEP",
                new vn.vht.qtkhcn.web.dto.ActionStudioDtos.PresentationRequest(
                        "Bỏ qua", "safety", "PRIMARY", "warning", 100, null), 1, "alice"))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("Exception Action");

        ActionStudioAction reject = action("REJECT_STEP", true, 1);
        when(actions.findById("REJECT_STEP")).thenReturn(Optional.of(reject));
        assertThatThrownBy(() -> service.updatePresentation("REJECT_STEP",
                new vn.vht.qtkhcn.web.dto.ActionStudioDtos.PresentationRequest(
                        "Từ chối", "close", "PRIMARY", "primary", 13, null), 1, "alice"))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("REJECT_STEP");
    }

    @Test
    void resetPresentationRestoresSafeDefaultsAndAudits() {
        ActionStudioAction reject = action("REJECT_STEP", true, 4);
        reject.setLabel("Tùy chỉnh");
        reject.setIcon("edit");
        reject.setUiGroup("MORE");
        reject.setTone("default");
        when(actions.findById("REJECT_STEP")).thenReturn(Optional.of(reject));
        when(actions.saveAndFlush(reject)).thenReturn(reject);

        var result = service.resetPresentation("REJECT_STEP", 4, "alice");

        assertThat(result.label()).isEqualTo("REJECT_STEP");
        assertThat(result.icon()).isEqualTo("thunderbolt");
        assertThat(result.uiGroup()).isEqualTo("PRIMARY");
        assertThat(result.tone()).isEqualTo("danger");
        assertThat(result.order()).isEqualTo(13);
        verify(audits).save(any());
    }

    @Test
    void scaffoldCreatesOnlyTrulyMissingRows() {
        when(routing.require("RD05_01")).thenReturn(new ProcessRoutingResponse("RD05_01", "Quy trình",
                List.of(new ProcessStepResponse("Task_1", "Bước 1", "PM", "phieu-phe-duyet",
                        List.of(new RouteBranchResponse("dong_y", "Đồng ý", "Hoàn tất", "complete", "ketQua"))))));
        when(policies.findAllByOrderByDisplayOrderAscIdAsc()).thenReturn(List.of());
        when(actions.findById(any())).thenAnswer(invocation -> Optional.of(action(invocation.getArgument(0), true, 1)));
        when(policies.existsById(any())).thenReturn(false);
        when(policies.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.scaffold("RD05_01", "alice");

        assertThat(response.createdCount()).isEqualTo(1);
        assertThat(response.createdPolicies()).allMatch(item -> item.processCode().equals("RD05_01"));
        assertThat(response.createdPolicies()).allMatch(item -> item.lifecycleStatus().equals("DRAFT"));
        assertThat(response.createdPolicies()).allSatisfy(item ->
                assertThat(item.allowedRoleCodes()).containsExactly("PM"));
    }

    @Test
    void scaffoldMapsEveryCandidateGroupToAllowedRolesWithoutDuplicates() {
        when(routing.require("RD05_02")).thenReturn(new ProcessRoutingResponse("RD05_02", "Process",
                List.of(new ProcessStepResponse("Task_Approve", "Approve", " CQ_KHCN,PM,CQ_KHCN ",
                        "phieu-phe-duyet", List.of(new RouteBranchResponse(
                                "APPROVE", "Approve", "Done", "complete", "result"))))));
        when(policies.findAllByOrderByDisplayOrderAscIdAsc()).thenReturn(List.of());
        when(actions.findById(any())).thenAnswer(invocation -> Optional.of(action(invocation.getArgument(0), true, 1)));
        when(policies.existsById(any())).thenReturn(false);
        when(policies.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.scaffold("RD05_02", "alice");

        assertThat(response.createdPolicies()).singleElement().satisfies(policy ->
                assertThat(policy.allowedRoleCodes()).containsExactly("CQ_KHCN", "PM"));
    }

    @Test
    void scaffoldUsesApproveAndRejectActionCodesDeclaredByRd0202() {
        when(routing.require("RD02_02")).thenReturn(new ProcessRoutingResponse("RD02_02", "Quy trình",
                List.of(new ProcessStepResponse("T14_GD_TTMS", "Ký duyệt", "GD_TTMS", "phieu-phe-duyet",
                        List.of(new RouteBranchResponse("APPROVE", "Đồng ý", "Bước sau", "forward", null),
                                new RouteBranchResponse("REJECT", "Từ chối", "Kết thúc", "reject", null))))));
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
                null, "t2", "processing", List.of("TD"), null, null, 1, "ACTIVE");

        assertThatThrownBy(() -> service.createAvailability(request, "alice"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("taskDefinitionKey");
    }

    @Test
    void availabilityRejectsAnotherEnabledRuleWithSameSelector() {
        ActionAvailabilityPolicy existing = policy("AP-EXISTING", "RD01.01", "t2", 10);
        when(actions.findById("APPROVE_STEP")).thenReturn(Optional.of(action("APPROVE_STEP", true, 1)));
        when(routing.require("RD01.01", 1)).thenReturn(process("RD01.01", "t2", "TD", "APPROVE"));
        existing.setProcessVersion(1);
        when(policies.findAllByOrderByDisplayOrderAscIdAsc()).thenReturn(List.of(existing));
        AvailabilityRequest request = new AvailabilityRequest("AP-NEW", "APPROVE_STEP", "DOSSIER_DETAIL",
                "RD01.01", "t2", "processing", List.of(" TD "), null, null, 20, "ACTIVE",
                1, null, null, null, null, null, null);

        assertThatThrownBy(() -> service.createAvailability(request, "alice"))
                .isInstanceOf(ActionStudioConflictException.class)
                .hasMessageContaining("AP-EXISTING");
        verify(policies, never()).saveAndFlush(any());
    }

    @Test
    void bulkDeleteValidatesEveryVersionBeforeDeletingAnything() {
        ActionAvailabilityPolicy first = policy("AP-1", null, null, 1);
        ActionAvailabilityPolicy second = policy("AP-2", null, null, 2);
        second.setVersion(3);
        when(policies.findAllById(any())).thenReturn(List.of(first, second));

        assertThatThrownBy(() -> service.deleteAvailabilityBulk(new BulkDeleteAvailabilityRequest(List.of(
                new BulkDeleteAvailabilityItem("AP-1", 1), new BulkDeleteAvailabilityItem("AP-2", 2))), "admin"))
                .isInstanceOf(ActionStudioConflictException.class);

        verify(policies, never()).deleteAll(any());
    }

    @Test
    void bulkDeleteRemovesAllSelectedPoliciesAndReturnsTheirIds() {
        ActionAvailabilityPolicy first = policy("AP-1", null, null, 1);
        ActionAvailabilityPolicy second = policy("AP-2", null, null, 2);
        when(policies.findAllById(any())).thenReturn(List.of(first, second));

        var result = service.deleteAvailabilityBulk(new BulkDeleteAvailabilityRequest(List.of(
                new BulkDeleteAvailabilityItem("AP-1", 1), new BulkDeleteAvailabilityItem("AP-2", 1))), "admin");

        assertThat(result.deletedCount()).isEqualTo(2);
        assertThat(result.deletedIds()).containsExactly("AP-1", "AP-2");
        verify(policies).deleteAll(any());
        verify(policies).flush();
    }

    @Test
    void bulkStatusDisablesAllSelectedPolicies() {
        ActionAvailabilityPolicy first = policy("AP-1", null, null, 1);
        ActionAvailabilityPolicy second = policy("AP-2", null, null, 2);
        when(policies.findAllById(any())).thenReturn(List.of(first, second));

        var result = service.setAvailabilityStatusBulk(new BulkStatusAvailabilityRequest(false, List.of(
                new BulkDeleteAvailabilityItem("AP-1", 1), new BulkDeleteAvailabilityItem("AP-2", 1))), "admin");

        assertThat(result.updatedCount()).isEqualTo(2);
        assertThat(result.updatedPolicies()).extracting(item -> item.lifecycleStatus())
                .containsOnly("DISABLED");
        verify(policies).saveAll(any());
        verify(policies).flush();
    }

    @Test
    void activeStandardActionRejectsMissingBpmnRoute() {
        when(actions.findById("REJECT_STEP")).thenReturn(Optional.of(action("REJECT_STEP", true, 1)));
        when(routing.require("RD01.01", 1)).thenReturn(process("RD01.01", "t2", "TD", "APPROVE"));
        AvailabilityRequest request = new AvailabilityRequest("AP-REJECT", "REJECT_STEP", "DOSSIER_DETAIL",
                "RD01.01", "t2", "processing", List.of("TD"), null, null, 20, "ACTIVE",
                1, null, null, null, null, null, null);

        assertThatThrownBy(() -> service.createAvailability(request, "alice"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("không có route");
        verify(policies, never()).saveAndFlush(any());
    }

    @Test
    void activeStandardActionRejectsRolesOutsideTaskCandidateGroups() {
        when(actions.findById("APPROVE_STEP")).thenReturn(Optional.of(action("APPROVE_STEP", true, 1)));
        when(routing.require("RD01.01", 1)).thenReturn(process("RD01.01", "t2", "TD, TP_CLKHCN", "APPROVE"));
        AvailabilityRequest request = new AvailabilityRequest("AP-ROLE", "APPROVE_STEP", "DOSSIER_DETAIL",
                "RD01.01", "t2", "processing", List.of("TD", "LD"), null, null, 20, "ACTIVE",
                1, null, null, null, null, null, null);

        assertThatThrownBy(() -> service.createAvailability(request, "alice"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("LD");
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

    /**
     * Hồi quy cho bug CÓ SẴN: trường bắt buộc bên trong `dynamiclist` được đối chiếu với formData GỐC
     * thay vì dữ liệu của từng dòng, nên luôn báo thiếu dù người dùng đã nhập đủ. Hệ quả thực tế:
     * bm-02-08-qdh-nv (QĐ thành lập HĐXD) có "Họ và tên"/"Vai trò trong Hội đồng" bắt buộc trong danh
     * sách thành viên ⇒ duyệt T05 luôn trả FORM_VALIDATION_FAILED và Hội đồng không bao giờ được sinh.
     */
    @Test
    void validatesRequiredFieldsInsideADynamicListAgainstEachRowNotTheRootFormData() {
        Eform form = new Eform();
        form.setKey("bm-hoi-dong");
        form.setSchemaJson("""
                {"components":[
                  {"type":"dynamiclist","key":"danhSachThanhVien","label":"Danh sách thành viên",
                   "validate":{"required":true},"components":[
                     {"type":"textfield","key":"hoTen","label":"Họ và tên","validate":{"required":true}},
                     {"type":"select","key":"userId","label":"Tài khoản","validate":{"required":true}},
                     {"type":"textfield","key":"chucVu","label":"Chức vụ"}
                   ]}
                ]}
                """);
        when(eforms.findById("bm-hoi-dong")).thenReturn(Optional.of(form));

        assertThat(service.missingRequiredFormFields("bm-hoi-dong", java.util.Map.of(
                "danhSachThanhVien", java.util.List.of(
                        java.util.Map.of("hoTen", "Nguyễn Văn A", "userId", "a@example.com"),
                        java.util.Map.of("hoTen", "Trần Thị B", "userId", "b@example.com")))))
                .as("Mọi dòng đã nhập đủ ⇒ không được báo thiếu")
                .isEmpty();

        assertThat(service.missingRequiredFormFields("bm-hoi-dong", java.util.Map.of(
                "danhSachThanhVien", java.util.List.of(
                        java.util.Map.of("hoTen", "Nguyễn Văn A"),
                        java.util.Map.of("hoTen", "Trần Thị B")))))
                .as("Hai dòng cùng thiếu một trường ⇒ nhắc một lần, không lặp theo số dòng")
                .containsExactly("Tài khoản");

        assertThat(service.missingRequiredFormFields("bm-hoi-dong", java.util.Map.of()))
                .as("Danh sách rỗng báo ở chính nó, không moi tiếp trường con không tồn tại")
                .containsExactly("Danh sách thành viên");
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

    /**
     * Bộ seed V10 có 4 luật CHUNG ({@code process_code}/{@code task_definition_key} đều NULL) gắn sẵn
     * biểu mẫu của RD01.01. Không có ngoại lệ này thì mọi quy trình người dùng mới vẽ đều bị đối soát
     * chấm "generic" (không phải "missing"), scaffold thành no-op, và bước của họ mở lên hiện biểu mẫu
     * của RD01.01 — server còn validate trường bắt buộc theo đúng biểu mẫu sai đó.
     */
    @Test
    void scaffoldPinsAStepCoveredOnlyByAGenericRuleWhenTheBpmnDeclaresItsOwnForm() {
        when(routing.require("quy_trinh_moi")).thenReturn(new ProcessRoutingResponse("quy_trinh_moi",
                "Quy trình mới", List.of(new ProcessStepResponse("Duyet", "Duyệt", "CQ_KHCN", "phieu-rieng",
                        List.of(new RouteBranchResponse("dong_y", "Đồng ý", "Hoàn tất", "complete", "ketQua"))))));
        when(policies.findAllByOrderByDisplayOrderAscIdAsc())
                .thenReturn(List.of(policy("AP-06", null, null, 21)));
        when(actions.findById(any())).thenAnswer(invocation -> Optional.of(action(invocation.getArgument(0), true, 1)));
        when(policies.existsById(any())).thenReturn(false);
        when(policies.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.scaffold("quy_trinh_moi", "alice");

        assertThat(response.createdCount()).isEqualTo(1);
        assertThat(response.createdPolicies().getFirst().formKey()).isNull();
        assertThat(response.createdPolicies().getFirst().formBundle().items().getFirst().formKey())
                .isEqualTo("phieu-rieng");
        assertThat(response.createdPolicies().getFirst().taskDefinitionKey()).isEqualTo("Duyet");
    }

    /** Bước không tự khai biểu mẫu thì luật chung vẫn hợp lệ — không đẻ thêm luật thừa. */
    @Test
    void scaffoldLeavesAGenericallyCoveredStepAloneWhenTheBpmnHasNoFormOfItsOwn() {
        when(routing.require("quy_trinh_moi")).thenReturn(new ProcessRoutingResponse("quy_trinh_moi",
                "Quy trình mới", List.of(new ProcessStepResponse("Duyet", "Duyệt", "CQ_KHCN", null,
                        List.of(new RouteBranchResponse("dong_y", "Đồng ý", "Hoàn tất", "complete", "ketQua"))))));
        when(policies.findAllByOrderByDisplayOrderAscIdAsc())
                .thenReturn(List.of(policy("AP-06", null, null, 21)));

        var response = service.scaffold("quy_trinh_moi", "alice");

        assertThat(response.createdCount()).isZero();
        verify(policies, never()).saveAndFlush(any());
    }

    @Test
    void reconcileReportsUnknownAndDynamicCandidateGroupsWithoutScaffoldingThem() {
        when(routing.require("unknown_roles")).thenReturn(new ProcessRoutingResponse("unknown_roles", "Quy trình",
                List.of(
                        new ProcessStepResponse("Task_unknown", "Sai mã", "TD_KHCN", null,
                                List.of(new RouteBranchResponse("APPROVE", "Duyệt", "End", "complete", null))),
                        new ProcessStepResponse("Task_dynamic", "Vai trò động", "= dossier.reviewerGroup", null,
                                List.of(new RouteBranchResponse("APPROVE", "Duyệt", "End", "complete", null))))));
        when(policies.findAllByOrderByDisplayOrderAscIdAsc()).thenReturn(List.of());

        var rows = service.reconcile("unknown_roles");

        assertThat(rows).extracting(vn.vht.qtkhcn.web.dto.ActionStudioDtos.ReconcileResponse::status)
                .containsExactly("ROLE_MISMATCH", "ROLE_MISMATCH");
        assertThat(rows.get(0).reason()).contains("không tồn tại").contains("TD_KHCN");
        assertThat(rows.get(1).reason()).contains("động").contains("= dossier.reviewerGroup");

        var scaffold = service.scaffold("unknown_roles", "alice");
        assertThat(scaffold.createdCount()).isZero();
        verify(policies, org.mockito.Mockito.never()).saveAndFlush(any());
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
        item.setDisplayOrder(order);
        item.setLifecycleStatus(ActionAvailabilityPolicyStatus.ACTIVE);
        item.setVersion(1);
        item.setUpdatedBy("seed");
        item.setUpdatedAt(OffsetDateTime.now());
        return item;
    }

    private static ProcessRoutingResponse process(String code, String task, String candidateGroups, String outcome) {
        return new ProcessRoutingResponse(code, "Quy trình", List.of(
                new ProcessStepResponse(task, "Bước xử lý", candidateGroups, null,
                        List.of(new RouteBranchResponse(outcome, outcome, "Bước sau", "forward", null)))));
    }
}

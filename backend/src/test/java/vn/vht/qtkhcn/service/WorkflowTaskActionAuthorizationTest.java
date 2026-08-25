package vn.vht.qtkhcn.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.support.TransactionTemplate;
import vn.vht.qtkhcn.camunda.CamundaWorkflowTaskRuntime;
import vn.vht.qtkhcn.camunda.CamundaWorkflowTaskRuntime.TaskSnapshot;
import vn.vht.qtkhcn.camunda.HoiDongMembershipGateway;
import vn.vht.qtkhcn.camunda.WorkflowTaskActionRouting;
import vn.vht.qtkhcn.domain.WorkflowProcessMapping;
import vn.vht.qtkhcn.repository.WorkflowActionInboxRepository;
import vn.vht.qtkhcn.repository.WorkflowEventOutboxRepository;
import vn.vht.qtkhcn.repository.WorkflowProcessMappingRepository;
import vn.vht.qtkhcn.security.WorkflowDemoIdentity;
import vn.vht.qtkhcn.security.WorkflowDemoIdentityProvider;

/**
 * Vai trò mở việc CHỈ KHI task chưa xác định được người cụ thể.
 *
 * <p>Bối cảnh nghiệp vụ: các bước họp Hội đồng xét duyệt của RD02.02 (T07/T10 cấp Cơ sở, T21/T24 cấp
 * Tập đoàn) chỉ khai được {@code candidateGroups="HDXD"/"HDXD_TD"} trong BPMN. Vai trò là danh mục
 * tĩnh "ai đủ tư cách ngồi hội đồng", còn thành phần hội đồng là dữ liệu động theo từng hồ sơ và một
 * người có thể ngồi nhiều hội đồng. Nếu vai trò tự nó đủ để thao tác thì mọi người giữ HDXD sẽ chấm
 * điểm được hồ sơ của bất kỳ ai.</p>
 */
class WorkflowTaskActionAuthorizationTest {

    private static final String TASK_KEY = "2001";
    private static final String HO_SO = "HS-2026-001";

    private CamundaWorkflowTaskRuntime runtime;
    private WorkflowDemoIdentityProvider identities;
    private HoiDongMembershipGateway hoiDong;
    private ActionStudioService actionStudio;
    private WorkflowTaskActionService service;

    @BeforeEach
    void setUp() {
        runtime = mock(CamundaWorkflowTaskRuntime.class);
        identities = mock(WorkflowDemoIdentityProvider.class);
        hoiDong = mock(HoiDongMembershipGateway.class);
        actionStudio = mock(ActionStudioService.class);
        WorkflowProcessMappingRepository mappings = mock(WorkflowProcessMappingRepository.class);

        WorkflowProcessMapping mapping = new WorkflowProcessMapping();
        mapping.setProcessInstanceId("1001");
        mapping.setHoSoId(HO_SO);
        mapping.setProcessDefinitionId("RD02_02");
        mapping.setRequestId(UUID.randomUUID());
        when(mappings.findByProcessInstanceId("1001")).thenReturn(Optional.of(mapping));
        when(actionStudio.simulate(any())).thenReturn(List.of());

        service = new WorkflowTaskActionService(mock(WorkflowActionInboxRepository.class),
                mock(vn.vht.qtkhcn.repository.ActionFormSubmissionRepository.class), mappings,
                mock(WorkflowEventOutboxRepository.class), runtime, mock(WorkflowTaskActionRouting.class),
                hoiDong, identities, actionStudio, new ActionVariableBindingCatalog(), new ObjectMapper(),
                mock(TransactionTemplate.class));
    }

    @Test
    void aCouncilRoleAloneNoLongerOpensAStepBelongingToAnotherDossiersCouncil() {
        councilTask();
        when(hoiDong.candidateUsers(HO_SO, Set.of("HDXD")))
                .thenReturn(Set.of("thanhvien@example.com"));
        identity("nguoi-ngoai@example.com", "HDXD");

        assertThatThrownBy(() -> service.available(TASK_KEY, "nguoi-ngoai@example.com"))
                .isInstanceOf(TaskActionException.class)
                .hasMessageContaining("vai trò không đủ");
    }

    @Test
    void anActualCouncilMemberIsAllowedEvenWithoutMatchingTheGroup() {
        councilTask();
        when(hoiDong.candidateUsers(HO_SO, Set.of("HDXD")))
                .thenReturn(Set.of("thanhvien@example.com"));
        identity("thanhvien@example.com");

        assertThat(service.available(TASK_KEY, "thanhvien@example.com").actions()).isEmpty();
    }

    @Test
    void roleStillOpensAStepWhoseCouncilHasNoBoundAccounts() {
        councilTask();
        when(hoiDong.candidateUsers(HO_SO, Set.of("HDXD"))).thenReturn(Set.of());
        identity("bat-ky-ai@example.com", "HDXD");

        assertThat(service.available(TASK_KEY, "bat-ky-ai@example.com").actions())
                .as("Hội đồng chưa gắn tài khoản (dữ liệu cũ) ⇒ giữ nguyên hành vi theo vai trò, không kẹt")
                .isEmpty();
    }

    @Test
    void anAdministratorSkipsTheLookupEntirely() {
        councilTask();
        when(identities.resolve("admin@example.com"))
                .thenReturn(new WorkflowDemoIdentity("admin@example.com", Set.of(), Set.of(), Set.of(), Map.of(), true));

        assertThat(service.available(TASK_KEY, "admin@example.com").actions()).isEmpty();
        verifyNoInteractions(hoiDong);
    }

    @Test
    void availabilityRequiresApplicationAndDossierViewAccessBeforeTaskAuthorization() {
        councilTask();
        when(identities.resolve("no-app@example.com")).thenReturn(new WorkflowDemoIdentity(
                "no-app@example.com", Set.of("HDXD"), Set.of(), Set.of(),
                Map.of("DOSSIER", Set.of("VIEW_DETAIL")), false));
        when(identities.resolve("no-view@example.com")).thenReturn(new WorkflowDemoIdentity(
                "no-view@example.com", Set.of("HDXD"), Set.of(), Set.of("qlnvkhcn"), Map.of(), false));

        assertThatThrownBy(() -> service.available(TASK_KEY, "no-app@example.com"))
                .isInstanceOfSatisfying(TaskActionException.class,
                        error -> assertThat(error.getCode()).isEqualTo("APP_ACCESS_FORBIDDEN"));
        assertThatThrownBy(() -> service.available(TASK_KEY, "no-view@example.com"))
                .isInstanceOfSatisfying(TaskActionException.class,
                        error -> assertThat(error.getCode()).isEqualTo("FEATURE_ACCESS_FORBIDDEN"));
        verifyNoInteractions(hoiDong);
    }

    @Test
    void executionRejectsAStalePolicySnapshot() {
        assertThatThrownBy(() -> WorkflowTaskActionService.assertPolicySnapshot("AP-01", 3, "AP-01", 4L))
                .isInstanceOfSatisfying(TaskActionException.class, error -> {
                    assertThat(error.getCode()).isEqualTo("ACTION_POLICY_CHANGED");
                    assertThat(error.getStatus()).isEqualTo(org.springframework.http.HttpStatus.CONFLICT);
                });
    }

    @Test
    void anAssigneeNamedByTheEngineStillWinsOverEveryoneSharingTheRole() {
        when(runtime.requireActive(TASK_KEY)).thenReturn(new TaskSnapshot(TASK_KEY, "1001", "RD02_02",
                "T05", "Lap QD", "nguoi-duoc-giao@example.com", Set.of(), Set.of("CQ_QLKHCN"), true, false));
        when(hoiDong.candidateUsers(anyString(), any())).thenReturn(Set.of());
        identity("dong-nghiep@example.com", "CQ_QLKHCN");

        assertThatThrownBy(() -> service.available(TASK_KEY, "dong-nghiep@example.com"))
                .isInstanceOf(TaskActionException.class);
    }

    private void councilTask() {
        when(runtime.requireActive(TASK_KEY)).thenReturn(new TaskSnapshot(TASK_KEY, "1001", "RD02_02",
                "T07", "Hop HDXD cap Co so phien 1", null, Set.of(), Set.of("HDXD"), true, false));
    }

    private void identity(String userId, String... roleCodes) {
        when(identities.resolve(userId))
                .thenReturn(new WorkflowDemoIdentity(userId, Set.of(roleCodes), Set.of(), Set.of("qlnvkhcn"),
                        Map.of("DOSSIER", Set.of("VIEW_DETAIL")), false));
    }
}

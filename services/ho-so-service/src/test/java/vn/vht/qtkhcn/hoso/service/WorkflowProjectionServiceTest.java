package vn.vht.qtkhcn.hoso.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.hoso.domain.DossierStatus;
import vn.vht.qtkhcn.hoso.domain.DossierStep;
import vn.vht.qtkhcn.hoso.domain.HoSo;
import vn.vht.qtkhcn.hoso.domain.StepStatus;
import vn.vht.qtkhcn.hoso.domain.WorkflowEventInbox;
import vn.vht.qtkhcn.hoso.domain.WorkflowProcessProjection;
import vn.vht.qtkhcn.hoso.domain.WorkflowTaskProjection;
import vn.vht.qtkhcn.hoso.repository.HoSoRepository;
import vn.vht.qtkhcn.hoso.repository.WorkflowEventInboxRepository;
import vn.vht.qtkhcn.hoso.repository.WorkflowProcessProjectionRepository;
import vn.vht.qtkhcn.hoso.repository.WorkflowTaskProjectionRepository;

class WorkflowProjectionServiceTest {
    private final WorkflowEventInboxRepository inbox = mock(WorkflowEventInboxRepository.class);
    private final WorkflowTaskProjectionRepository tasks = mock(WorkflowTaskProjectionRepository.class);
    private final WorkflowProcessProjectionRepository processes = mock(WorkflowProcessProjectionRepository.class);
    private final HoSoRepository hoSoRepository = mock(HoSoRepository.class);
    private final HoiDongXetDuyetService hoiDong = mock(HoiDongXetDuyetService.class);
    private final AtomicReference<List<WorkflowTaskProjection>> savedTasks = new AtomicReference<>();
    private HoSo hoSo;
    private WorkflowProjectionService service;

    @SuppressWarnings("unchecked")
    @BeforeEach void setUp() {
        hoSo = dossier();
        when(hoSoRepository.findForWorkflowProjection("HS-1")).thenReturn(Optional.of(hoSo));
        when(processes.findById("1001")).thenReturn(Optional.empty());
        when(tasks.saveAll(any())).thenAnswer(call -> {
            List<WorkflowTaskProjection> value = new ArrayList<>();
            ((Iterable<WorkflowTaskProjection>) call.getArgument(0)).forEach(value::add);
            savedTasks.set(value);
            return value;
        });
        service = new WorkflowProjectionService(inbox, tasks, processes, hoSoRepository, hoiDong,
                new ObjectMapper().findAndRegisterModules());
    }

    @Test void completionDeliveredBeforeCreationNeverReopensTask() {
        WorkflowEventInbox completed = taskEvent("TASK_COMPLETED", "2026-07-18T10:02:00Z");
        when(inbox.findByHoSoIdOrderByOccurredAtAscEventIdAsc("HS-1")).thenReturn(List.of(completed));
        service.rebuild("HS-1");
        assertEquals(WorkflowTaskProjection.State.COMPLETED, savedTasks.get().getFirst().getState());

        WorkflowEventInbox created = taskEvent("TASK_CREATED", "2026-07-18T10:01:00Z");
        when(inbox.findByHoSoIdOrderByOccurredAtAscEventIdAsc("HS-1"))
                .thenReturn(List.of(created, completed));
        service.rebuild("HS-1");

        WorkflowTaskProjection task = savedTasks.get().getFirst();
        assertEquals(WorkflowTaskProjection.State.COMPLETED, task.getState());
        assertNotNull(task.getCreatedAt());
        assertNotNull(task.getCompletedAt());
        assertEquals(java.util.Set.of("PM"), task.getCandidateGroups());
        assertEquals(StepStatus.DONE, hoSo.getSteps().get(1).getTrangThai());
        assertEquals(DossierStatus.PROCESSING, hoSo.getTrangThai());
    }

    @Test void terminalProcessDominatesLateActiveTaskAndUpdatesDossier() {
        WorkflowEventInbox created = taskEvent("TASK_CREATED", "2026-07-18T10:01:00Z");
        WorkflowEventInbox terminal = event("PROCESS_COMPLETED", "2026-07-18T10:03:00Z", "{}");
        when(inbox.findByHoSoIdOrderByOccurredAtAscEventIdAsc("HS-1"))
                .thenReturn(List.of(created, terminal));

        service.rebuild("HS-1");

        assertEquals(WorkflowTaskProjection.State.COMPLETED, savedTasks.get().getFirst().getState());
        assertEquals(DossierStatus.APPROVED, hoSo.getTrangThai());
        assertEquals(StepStatus.DONE, hoSo.getSteps().get(1).getTrangThai());
    }

    @Test void businessRejectionIsNotProjectedAsOperationalCancellation() {
        WorkflowEventInbox created = taskEvent("TASK_CREATED", "2026-07-18T10:01:00Z");
        WorkflowEventInbox action = event("TASK_ACTION_APPLIED", "2026-07-18T10:02:00Z",
                "{\"taskKey\":\"2001\",\"actionCode\":\"REJECT_STEP\",\"actorId\":\"pm@example.com\"}");
        WorkflowEventInbox rejected = event("PROCESS_REJECTED", "2026-07-18T10:03:00Z", "{}");
        when(inbox.findByHoSoIdOrderByOccurredAtAscEventIdAsc("HS-1"))
                .thenReturn(List.of(created, action, rejected));

        service.rebuild("HS-1");

        assertEquals(DossierStatus.REJECTED, hoSo.getTrangThai());
        assertEquals(WorkflowTaskProjection.State.COMPLETED, savedTasks.get().getFirst().getState());
    }

    @Test void materializesWorkflowStepsWhenDossierOnlyHasInitializationStep() {
        hoSo.getSteps().remove(1);
        WorkflowEventInbox created = taskEvent("TASK_CREATED", "2026-07-18T10:01:00Z");
        when(inbox.findByHoSoIdOrderByOccurredAtAscEventIdAsc("HS-1")).thenReturn(List.of(created));

        service.rebuild("HS-1");

        assertEquals(2, hoSo.getSteps().size());
        assertEquals("Task_1", hoSo.getSteps().get(1).getTaskDefinitionKey());
        assertEquals(StepStatus.CURRENT, hoSo.getSteps().get(1).getTrangThai());
        assertEquals(1, hoSo.getBuocHienTai());
        assertEquals(java.util.Set.of("PM"), hoSo.getSteps().get(1).getVaiTroCodes());
    }

    @Test void reopenedStepDoesNotKeepCompletionMetadataFromPreviousExecution() {
        WorkflowEventInbox created = taskEvent("TASK_CREATED", "2026-07-18T10:01:00Z");
        WorkflowEventInbox completed = taskEvent("TASK_COMPLETED", "2026-07-18T10:02:00Z");
        WorkflowEventInbox action = event("TASK_ACTION_APPLIED", "2026-07-18T10:02:01Z",
                "{\"taskKey\":\"2001\",\"actionCode\":\"APPROVE_STEP\","
                        + "\"actorId\":\"pm@example.com\",\"comment\":\"Da xu ly\"}");
        WorkflowEventInbox reopened = event("TASK_CREATED", "2026-07-18T10:03:00Z", """
                {"taskKey":"2002","taskDefinitionKey":"Task_1","name":"Tham muu",
                 "assignee":"","candidateGroups":["PM"],"candidateUsers":[],
                 "dueDate":"2026-07-21T10:00:00Z","formKey":"bm-rd01"}
                """);
        when(inbox.findByHoSoIdOrderByOccurredAtAscEventIdAsc("HS-1"))
                .thenReturn(List.of(created, completed, action, reopened));

        service.rebuild("HS-1");

        DossierStep step = hoSo.getSteps().get(1);
        assertEquals(StepStatus.CURRENT, step.getTrangThai());
        assertNull(step.getNguoi());
        assertNull(step.getYKien());
        assertNull(step.getThoiDiem());
        assertEquals("2026-07-21T10:00Z", step.getHanXuLy());
    }

    @Test void capturesFormDataFromCompletedActionIntoStep() {
        WorkflowEventInbox created = taskEvent("TASK_CREATED", "2026-07-18T10:01:00Z");
        WorkflowEventInbox completed = taskEvent("TASK_COMPLETED", "2026-07-18T10:02:00Z");
        WorkflowEventInbox action = event("TASK_ACTION_APPLIED", "2026-07-18T10:02:01Z", """
                {"taskKey":"2001","actionCode":"APPROVE_STEP","actorId":"tgd@example.com",
                 "formData":{"capHoiDong":"vht","danhSachThanhVien":[{"hoTen":"Nguyen Van A"}]}}
                """);
        when(inbox.findByHoSoIdOrderByOccurredAtAscEventIdAsc("HS-1"))
                .thenReturn(List.of(created, completed, action));

        service.rebuild("HS-1");

        DossierStep step = hoSo.getSteps().get(1);
        assertNotNull(step.getFormDataJson());
        assertTrue(step.getFormDataJson().contains("danhSachThanhVien"));
    }

    private static HoSo dossier() {
        HoSo dossier = new HoSo();
        dossier.setId("HS-1");
        dossier.setZeebeProcessInstanceKey(1001L);
        dossier.setTrangThai(DossierStatus.PROCESSING);
        DossierStep created = new DossierStep();
        created.setHoSo(dossier);
        created.setBuocIndex(0);
        created.setTen("Khoi tao");
        created.setTrangThai(StepStatus.DONE);
        DossierStep task = new DossierStep();
        task.setHoSo(dossier);
        task.setBuocIndex(1);
        task.setTaskDefinitionKey("Task_1");
        task.setTen("Tham muu");
        task.setTrangThai(StepStatus.PENDING);
        dossier.setSteps(new ArrayList<>(List.of(created, task)));
        return dossier;
    }

    @Test void councilStepIsNarrowedToTheMembersOfThisDossier() {
        when(hoiDong.candidateUsersTheoNhom("HS-1", Set.of("HDXD")))
                .thenReturn(List.of("hoidong1@example.com", "hoidong2@example.com"));
        when(inbox.findByHoSoIdOrderByOccurredAtAscEventIdAsc("HS-1")).thenReturn(List.of(
                event("TASK_CREATED", "2026-07-18T10:00:00Z", """
                        {"taskKey":"2001","taskDefinitionKey":"T07","name":"Hop HDXD cap Co so phien 1",
                         "assignee":"","candidateGroups":["HDXD"],"candidateUsers":[]}
                        """)));

        service.rebuild("HS-1");

        assertEquals(Set.of("hoidong1@example.com", "hoidong2@example.com"),
                savedTasks.get().getFirst().getCandidateUsers(),
                "candidateGroups=HDXD mới chỉ nói 'ai đủ tư cách'; projection phải chốt về đúng hội đồng của hồ sơ này");
    }

    @Test void enginesOwnCandidateUsersAreNeverOverwrittenByTheCouncilLookup() {
        when(inbox.findByHoSoIdOrderByOccurredAtAscEventIdAsc("HS-1")).thenReturn(List.of(
                event("TASK_CREATED", "2026-07-18T10:00:00Z", """
                        {"taskKey":"2001","taskDefinitionKey":"T07","name":"Hop HDXD cap Co so phien 1",
                         "assignee":"","candidateGroups":["HDXD"],"candidateUsers":["nguoi-duoc-chi-dinh@example.com"]}
                        """)));

        service.rebuild("HS-1");

        assertEquals(Set.of("nguoi-duoc-chi-dinh@example.com"), savedTasks.get().getFirst().getCandidateUsers());
        verifyNoInteractions(hoiDong);
    }

    private static WorkflowEventInbox taskEvent(String type, String at) {
        return event(type, at, """
                {"taskKey":"2001","taskDefinitionKey":"Task_1","name":"Tham muu",
                 "assignee":"","candidateGroups":["PM"],"candidateUsers":[],
                 "dueDate":"2026-07-20T10:00:00Z","formKey":"bm-rd01"}
                """);
    }

    private static WorkflowEventInbox event(String type, String at, String payload) {
        WorkflowEventInbox event = new WorkflowEventInbox();
        event.setEventId(UUID.randomUUID());
        event.setEventType(type);
        event.setHoSoId("HS-1");
        event.setProcessInstanceId("1001");
        event.setOccurredAt(OffsetDateTime.parse(at));
        event.setPayloadJson("{\"payload\":" + payload + "}");
        return event;
    }
}

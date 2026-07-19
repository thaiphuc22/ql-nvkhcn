package vn.vht.qtkhcn.hoso.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.hoso.domain.WorkflowTaskProjection;
import vn.vht.qtkhcn.hoso.repository.WorkflowTaskProjectionRepository;
import vn.vht.qtkhcn.hoso.security.DemoIdentity;

class MyTaskQueryServiceTest {

    private final WorkflowTaskProjectionRepository repository = mock(WorkflowTaskProjectionRepository.class);
    private final MyTaskQueryService service = new MyTaskQueryService(repository);

    @Test
    void filtersByUserAndNormalizedGroupsAndMapsProjectionNamesToThePublicContract() {
        WorkflowTaskProjection task = task();
        when(repository.findActiveForUserOrGroups("pm@example.com", Set.of("PM", "PA")))
                .thenReturn(List.of(task));

        var result = service.findActiveTasks(new DemoIdentity("pm@example.com", Set.of("PM", "PA"), false));

        verify(repository).findActiveForUserOrGroups("pm@example.com", Set.of("PM", "PA"));
        assertEquals(1, result.size());
        assertEquals("1001", result.getFirst().processInstanceKey());
        assertEquals("HS-2026-001", result.getFirst().maHoSo());
        assertEquals(List.of("PA", "PM"), result.getFirst().candidateGroups());
    }

    @Test
    void usesTheEmptyGroupQuerySoNoEmptyInClauseCanBroadenAccess() {
        when(repository.findActiveForUser("u-001")).thenReturn(List.of());

        assertEquals(List.of(), service.findActiveTasks(new DemoIdentity("u-001", Set.of(), false)));

        verify(repository).findActiveForUser("u-001");
    }

    @Test
    void administratorCanSeeEveryActiveTaskWithoutForgingEveryCandidateGroup() {
        when(repository.findByStateOrderByDueAtAscCreatedAtAscTaskKeyAsc(WorkflowTaskProjection.State.ACTIVE))
                .thenReturn(List.of(task()));

        var result = service.findActiveTasks(new DemoIdentity("admin@example.com", Set.of(), true));

        assertEquals(1, result.size());
        verify(repository).findByStateOrderByDueAtAscCreatedAtAscTaskKeyAsc(WorkflowTaskProjection.State.ACTIVE);
    }

    private static WorkflowTaskProjection task() {
        WorkflowTaskProjection task = new WorkflowTaskProjection();
        task.setTaskKey("2001");
        task.setProcessInstanceId("1001");
        task.setTaskDefinitionKey("Task_1");
        task.setHoSoId("HS-2026-001");
        task.setTaskName("Phan cong tham muu");
        task.setState(WorkflowTaskProjection.State.ACTIVE);
        task.setCandidateUsers(new LinkedHashSet<>());
        task.setCandidateGroups(new LinkedHashSet<>(List.of("PM", "PA")));
        task.setCreatedAt(OffsetDateTime.parse("2026-07-18T10:00:00+07:00"));
        task.setDueAt(OffsetDateTime.parse("2026-07-23T17:00:00+07:00"));
        task.setFormKey("form-pm-review");
        return task;
    }
}

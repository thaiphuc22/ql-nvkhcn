package vn.vht.qtkhcn.hoso.service;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.hoso.domain.WorkflowTaskProjection;
import vn.vht.qtkhcn.hoso.repository.WorkflowTaskProjectionRepository;
import vn.vht.qtkhcn.hoso.security.DemoIdentity;
import vn.vht.qtkhcn.hoso.web.dto.MyTaskResponse;

@Service
public class MyTaskQueryService {

    private final WorkflowTaskProjectionRepository repository;

    public MyTaskQueryService(WorkflowTaskProjectionRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<MyTaskResponse> findActiveTasks(DemoIdentity identity) {
        List<WorkflowTaskProjection> tasks;
        if (identity.administrator()) {
            tasks = repository.findByStateOrderByDueAtAscCreatedAtAscTaskKeyAsc(WorkflowTaskProjection.State.ACTIVE);
        } else if (identity.roleCodes().isEmpty()) {
            tasks = repository.findActiveForUser(identity.userId());
        } else {
            tasks = repository.findActiveForUserOrGroups(identity.userId(), identity.roleCodes());
        }
        return tasks.stream().map(MyTaskQueryService::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public Optional<MyTaskResponse> findActiveTaskForHoSo(DemoIdentity identity, String hoSoId) {
        List<WorkflowTaskProjection> tasks;
        if (identity.administrator()) {
            tasks = repository.findActiveByHoSoId(hoSoId);
        } else if (identity.roleCodes().isEmpty()) {
            tasks = repository.findActiveByHoSoIdForUser(hoSoId, identity.userId());
        } else {
            tasks = repository.findActiveByHoSoIdForUserOrGroups(hoSoId, identity.userId(), identity.roleCodes());
        }
        return tasks.stream().findFirst().map(MyTaskQueryService::toResponse);
    }

    private static MyTaskResponse toResponse(WorkflowTaskProjection task) {
        return new MyTaskResponse(
                task.getProcessInstanceId(),
                task.getTaskKey(),
                task.getTaskDefinitionKey(),
                task.getHoSoId(),
                task.getTaskName(),
                task.getAssignee(),
                task.getCandidateUsers().stream().sorted().toList(),
                task.getCandidateGroups().stream().sorted().toList(),
                task.getCreatedAt(),
                task.getDueAt(),
                task.getFormKey());
    }

}

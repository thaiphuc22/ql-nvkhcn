package vn.vht.qtkhcn.hoso.repository;

import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.vht.qtkhcn.hoso.domain.WorkflowTaskProjection;

public interface WorkflowTaskProjectionRepository extends JpaRepository<WorkflowTaskProjection, String> {
    List<WorkflowTaskProjection> findByHoSoId(String hoSoId);
    long deleteByHoSoId(String hoSoId);

    List<WorkflowTaskProjection> findByStateOrderByDueAtAscCreatedAtAscTaskKeyAsc(
            WorkflowTaskProjection.State state);

    @Query("""
            select task from WorkflowTaskProjection task
            where task.state = vn.vht.qtkhcn.hoso.domain.WorkflowTaskProjection.State.ACTIVE
              and task.hoSoId = :hoSoId
            order by task.dueAt asc, task.createdAt asc, task.taskKey asc
            """)
    List<WorkflowTaskProjection> findActiveByHoSoId(@Param("hoSoId") String hoSoId);

    @Query("""
            select distinct task from WorkflowTaskProjection task
            left join task.candidateUsers candidateUser
            where task.state = vn.vht.qtkhcn.hoso.domain.WorkflowTaskProjection.State.ACTIVE
              and (task.assignee = :userId or candidateUser = :userId)
            order by task.dueAt asc, task.createdAt asc, task.taskKey asc
            """)
    List<WorkflowTaskProjection> findActiveForUser(@Param("userId") String userId);

    @Query("""
            select distinct task from WorkflowTaskProjection task
            left join task.candidateUsers candidateUser
            where task.state = vn.vht.qtkhcn.hoso.domain.WorkflowTaskProjection.State.ACTIVE
              and task.hoSoId = :hoSoId
              and (task.assignee = :userId or candidateUser = :userId)
            order by task.dueAt asc, task.createdAt asc, task.taskKey asc
            """)
    List<WorkflowTaskProjection> findActiveByHoSoIdForUser(
            @Param("hoSoId") String hoSoId,
            @Param("userId") String userId);

    /**
     * Vai trò chỉ mở việc khi task KHÔNG chỉ đích danh ai. Trước đây ba vế nối bằng OR thuần, nên một
     * task họp Hội đồng khai {@code candidateGroups="HDXD"} hiện trong worklist của mọi người giữ vai
     * trò HDXD — kể cả hồ sơ họ không thuộc hội đồng. Nay {@code assignee}/{@code candidateUsers} là
     * lớp THU HẸP: có mặt thì chỉ đúng những người đó thấy; vắng mặt thì giữ nguyên hành vi cũ theo
     * vai trò (điều kiện sống còn để hồ sơ/instance cũ — chưa gắn userId — không bị kẹt).
     */
    @Query("""
            select distinct task from WorkflowTaskProjection task
            left join task.candidateUsers candidateUser
            left join task.candidateGroups candidateGroup
            where task.state = vn.vht.qtkhcn.hoso.domain.WorkflowTaskProjection.State.ACTIVE
              and (task.assignee = :userId
                   or candidateUser = :userId
                   or (task.assignee is null and task.candidateUsers is empty
                       and candidateGroup in :roleCodes))
            order by task.dueAt asc, task.createdAt asc, task.taskKey asc
            """)
    List<WorkflowTaskProjection> findActiveForUserOrGroups(
            @Param("userId") String userId,
            @Param("roleCodes") Set<String> roleCodes);

    /** Cùng luật thu hẹp như {@link #findActiveForUserOrGroups}, giới hạn trong một hồ sơ. */
    @Query("""
            select distinct task from WorkflowTaskProjection task
            left join task.candidateUsers candidateUser
            left join task.candidateGroups candidateGroup
            where task.state = vn.vht.qtkhcn.hoso.domain.WorkflowTaskProjection.State.ACTIVE
              and task.hoSoId = :hoSoId
              and (task.assignee = :userId
                   or candidateUser = :userId
                   or (task.assignee is null and task.candidateUsers is empty
                       and candidateGroup in :roleCodes))
            order by task.dueAt asc, task.createdAt asc, task.taskKey asc
            """)
    List<WorkflowTaskProjection> findActiveByHoSoIdForUserOrGroups(
            @Param("hoSoId") String hoSoId,
            @Param("userId") String userId,
            @Param("roleCodes") Set<String> roleCodes);
}

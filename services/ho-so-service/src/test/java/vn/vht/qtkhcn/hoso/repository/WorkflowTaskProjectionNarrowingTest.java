package vn.vht.qtkhcn.hoso.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.persistence.EntityManager;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import vn.vht.qtkhcn.hoso.domain.WorkflowTaskProjection;

/**
 * Luật thu hẹp quyền: {@code assignee}/{@code candidateUsers} có mặt thì vai trò KHÔNG còn mở việc.
 *
 * <p>Đây là lớp chặn duy nhất khiến một bước "Họp Hội đồng xét duyệt" của hồ sơ A không hiện trong
 * worklist của người chỉ tình cờ giữ vai trò {@code HDXD} nhưng không thuộc hội đồng hồ sơ đó — vai
 * trò là danh mục tĩnh, tư cách thành viên hội đồng là dữ liệu động theo hồ sơ. Logic nằm hoàn toàn
 * trong JPQL nên không mock được; phải chạy trên Postgres thật vì dựa vào {@code is empty} trên
 * collection và trên chính schema Flyway của production.</p>
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class WorkflowTaskProjectionNarrowingTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    private static final String HO_SO = "HS-2026-001";
    private static final String HO_SO_KHAC = "HS-2026-002";
    private static final Set<String> VAI_TRO_HOI_DONG = Set.of("HDXD");

    @Autowired
    private WorkflowTaskProjectionRepository repository;

    @Autowired
    private EntityManager entityManager;

    /**
     * {@code workflow_task_projection.ho_so_id} có khoá ngoại tới {@code ho_so}, nên phải có hồ sơ
     * thật trước. Dựng bằng SQL thay vì entity: bài test này nói về câu truy vấn phân quyền, không
     * nên phụ thuộc vào đồ thị đối tượng NhiemVu/HoSo vốn còn nhiều ràng buộc không liên quan.
     */
    @BeforeEach
    void reset() {
        repository.deleteAll();
        repository.flush();
        entityManager.createNativeQuery("""
                insert into nhiem_vu (ma, ten, cap, chu_nhiem_ho_ten, don_vi_chu_tri, giai_doan)
                values ('NV-TEST', 'Nhiem vu kiem thu', 'CS', 'Nguyen Van A', 'VHT', 'XET_DUYET')
                on conflict (ma) do nothing
                """).executeUpdate();
        for (String hoSoId : new String[] { HO_SO, HO_SO_KHAC }) {
            entityManager.createNativeQuery("""
                    insert into ho_so (id, ma_nv, loai, nguoi_khoi_tao, ngay_tao, trang_thai, buoc_hien_tai)
                    values (?1, 'NV-TEST', 'XET_DUYET', 'pm@example.com', current_date, 'PROCESSING', 1)
                    on conflict (id) do nothing
                    """).setParameter(1, hoSoId).executeUpdate();
        }
    }

    @Test
    void roleAloneNoLongerOpensATaskThatAlreadyNamesItsCouncilMembers() {
        repository.saveAndFlush(task("2001", "T07", null, Set.of("hoidong1@example.com"), VAI_TRO_HOI_DONG));

        assertThat(repository.findActiveForUserOrGroups("nguoi-ngoai-hoi-dong@example.com", VAI_TRO_HOI_DONG))
                .as("Giữ vai trò HDXD nhưng không thuộc hội đồng của hồ sơ này ⇒ không thấy việc")
                .isEmpty();
        assertThat(repository.findActiveForUserOrGroups("hoidong1@example.com", VAI_TRO_HOI_DONG))
                .extracting(WorkflowTaskProjection::getTaskKey)
                .containsExactly("2001");
    }

    @Test
    void roleStillOpensATaskThatNamesNobody() {
        repository.saveAndFlush(task("2002", "T02", null, Set.of(), VAI_TRO_HOI_DONG));

        assertThat(repository.findActiveForUserOrGroups("bat-ky-ai@example.com", VAI_TRO_HOI_DONG))
                .as("Không chỉ đích danh ai ⇒ hành vi cũ theo vai trò giữ nguyên (hồ sơ cũ không kẹt)")
                .extracting(WorkflowTaskProjection::getTaskKey)
                .containsExactly("2002");
    }

    @Test
    void anAssigneeAlsoClosesTheRoleBranchForEveryoneElse() {
        repository.saveAndFlush(task("2003", "T05", "nguoi-duoc-giao@example.com", Set.of(), VAI_TRO_HOI_DONG));

        assertThat(repository.findActiveForUserOrGroups("dong-nghiep@example.com", VAI_TRO_HOI_DONG)).isEmpty();
        assertThat(repository.findActiveForUserOrGroups("nguoi-duoc-giao@example.com", Set.of()))
                .extracting(WorkflowTaskProjection::getTaskKey)
                .containsExactly("2003");
    }

    @Test
    void narrowingIsScopedPerDossierSoOneUserCanSitOnSeveralCouncils() {
        repository.saveAndFlush(task("2004", "T07", null, Set.of("kiem-nhiem@example.com"), VAI_TRO_HOI_DONG));
        WorkflowTaskProjection other = task("2005", "T07", null,
                Set.of("kiem-nhiem@example.com", "nguoi-khac@example.com"), VAI_TRO_HOI_DONG);
        other.setHoSoId(HO_SO_KHAC);
        repository.saveAndFlush(other);

        assertThat(repository.findActiveForUserOrGroups("kiem-nhiem@example.com", VAI_TRO_HOI_DONG))
                .as("Một người ngồi nhiều hội đồng ⇒ thấy đúng việc của từng hồ sơ, không xung đột")
                .extracting(WorkflowTaskProjection::getTaskKey)
                .containsExactlyInAnyOrder("2004", "2005");
        assertThat(repository.findActiveByHoSoIdForUserOrGroups(HO_SO_KHAC, "nguoi-khac@example.com",
                VAI_TRO_HOI_DONG))
                .extracting(WorkflowTaskProjection::getTaskKey)
                .containsExactly("2005");
        assertThat(repository.findActiveByHoSoIdForUserOrGroups(HO_SO, "nguoi-khac@example.com",
                VAI_TRO_HOI_DONG))
                .as("Thành viên hội đồng hồ sơ khác không được lây quyền sang hồ sơ này")
                .isEmpty();
    }

    private static WorkflowTaskProjection task(String taskKey, String definitionKey, String assignee,
            Set<String> candidateUsers, Set<String> candidateGroups) {
        WorkflowTaskProjection task = new WorkflowTaskProjection();
        task.setTaskKey(taskKey);
        task.setHoSoId(HO_SO);
        task.setProcessInstanceId("1001");
        task.setTaskDefinitionKey(definitionKey);
        task.setTaskName(definitionKey);
        task.setState(WorkflowTaskProjection.State.ACTIVE);
        task.setAssignee(assignee);
        task.setCandidateUsers(new LinkedHashSet<>(candidateUsers));
        task.setCandidateGroups(new LinkedHashSet<>(candidateGroups));
        task.setCreatedAt(OffsetDateTime.parse("2026-07-30T10:00:00Z"));
        task.setUpdatedAt(OffsetDateTime.parse("2026-07-30T10:00:00Z"));
        return task;
    }
}

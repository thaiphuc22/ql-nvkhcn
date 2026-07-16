package vn.vht.qtkhcn.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Một bước trong chuỗi phê duyệt của {@link HoSo}. Port từ webapp/src/data/dossiers.ts::DossierStep.
 * {@code vaiTroCodes} rỗng = fail-closed, chỉ admin xử lý được (D9) — KHÔNG đổi mặc định thành
 * "cho phép tất cả" ở tầng service.
 */
@Entity
@Table(name = "dossier_step")
@Getter
@Setter
@NoArgsConstructor
public class DossierStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ho_so_id", nullable = false)
    private HoSo hoSo;

    /** Thứ tự bước trong hồ sơ (0-based), khớp index của mảng steps ở mock. */
    @Column(name = "buoc_index", nullable = false)
    private int buocIndex;

    /** Key user task trong BPMN (vd "Task_5") — dùng để pin action/form policy theo bước (D10). */
    @Column(name = "task_definition_key")
    private String taskDefinitionKey;

    @Column(name = "ten", nullable = false)
    private String ten;

    /** Nhãn vai trò hiển thị (tiếng Việt, tự do). */
    @Column(name = "vai_tro")
    private String vaiTro;

    /**
     * Mã candidateGroup (Role.code) — khớp zeebe:assignmentDefinition candidateGroups. Kiểu
     * {@code Set} (không phải {@code List}) có chủ đích: HoSo.steps cũng là collection kiểu bag
     * (List không @OrderColumn) — 2 bag lồng nhau (steps + steps.vaiTroCodes) không fetch-join
     * cùng lúc được (Hibernate `MultipleBagFetchException`, gặp thật khi test API 2026-07-15, xem
     * HoSoRepository). Set phá vỡ tính "bag", cũng hợp lý ngữ nghĩa — mã vai trò không cần thứ tự,
     * không nên trùng lặp.
     */
    @ElementCollection
    @CollectionTable(name = "dossier_step_code", joinColumns = @JoinColumn(name = "dossier_step_id"))
    @Column(name = "code")
    private Set<String> vaiTroCodes = new HashSet<>();

    @Column(name = "nguoi")
    private String nguoi;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false, length = 16)
    private StepStatus trangThai;

    @Column(name = "thoi_diem")
    private String thoiDiem;

    @Column(name = "y_kien", columnDefinition = "text")
    private String yKien;

    @Column(name = "han_xu_ly")
    private String hanXuLy;

    @Column(name = "form_key")
    private String formKey;
}

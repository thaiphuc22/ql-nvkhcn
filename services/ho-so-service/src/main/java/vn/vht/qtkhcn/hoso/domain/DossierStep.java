package vn.vht.qtkhcn.hoso.domain;

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

    @Column(name = "buoc_index", nullable = false)
    private int buocIndex;

    @Column(name = "task_definition_key")
    private String taskDefinitionKey;

    @Column(name = "ten", nullable = false)
    private String ten;

    @Column(name = "vai_tro")
    private String vaiTro;

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

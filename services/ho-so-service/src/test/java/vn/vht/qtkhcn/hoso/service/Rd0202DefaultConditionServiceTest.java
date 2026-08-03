package vn.vht.qtkhcn.hoso.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.hoso.domain.Cap;
import vn.vht.qtkhcn.hoso.domain.ChuNhiem;
import vn.vht.qtkhcn.hoso.domain.HoSo;
import vn.vht.qtkhcn.hoso.domain.NhiemVu;
import vn.vht.qtkhcn.hoso.domain.TaiLieu;
import vn.vht.qtkhcn.hoso.repository.HoSoRepository;
import vn.vht.qtkhcn.hoso.repository.NhiemVuRepository;

class Rd0202DefaultConditionServiceTest {
    private HoSoRepository hoSoRepository;
    private NhiemVuRepository nhiemVuRepository;
    private Rd0202DefaultConditionService service;

    @BeforeEach
    void setUp() {
        hoSoRepository = mock(HoSoRepository.class);
        nhiemVuRepository = mock(NhiemVuRepository.class);
        service = new Rd0202DefaultConditionService(hoSoRepository, nhiemVuRepository);
    }

    @Test
    void acceptsACompleteTdDossierWithStoredEvidence() {
        HoSo hoSo = dossier();
        NhiemVu mission = mission();
        when(hoSoRepository.findById("HS-1")).thenReturn(Optional.of(hoSo));
        when(nhiemVuRepository.findById("NV-1")).thenReturn(Optional.of(mission));

        assertThat(service.validate("HS-1").valid()).isTrue();
        assertThat(service.validate("HS-1").reasons()).isEmpty();
    }

    @Test
    void rejectsIncompleteEvidenceSoTheWorkflowCanReturnToT02() {
        HoSo hoSo = dossier();
        hoSo.getTaiLieu().clear();
        NhiemVu mission = mission();
        mission.setDuToan(" ");
        when(hoSoRepository.findById("HS-1")).thenReturn(Optional.of(hoSo));
        when(nhiemVuRepository.findById("NV-1")).thenReturn(Optional.of(mission));

        var result = service.validate("HS-1");

        assertThat(result.valid()).isFalse();
        assertThat(result.reasons()).contains("Thiếu dự toán nhiệm vụ.")
                .anyMatch(reason -> reason.contains("Thiếu tài liệu HSXD"));
    }

    private static HoSo dossier() {
        HoSo hoSo = new HoSo();
        hoSo.setId("HS-1");
        hoSo.setMaNV("NV-1");
        TaiLieu document = new TaiLieu();
        document.setHoSo(hoSo);
        document.setTen("HSXD.pdf");
        document.setContentType("application/pdf");
        document.setStorageKey("evidence-key");
        document.setSizeBytes(128L);
        hoSo.getTaiLieu().add(document);
        return hoSo;
    }

    private static NhiemVu mission() {
        NhiemVu mission = new NhiemVu();
        mission.setMa("NV-1");
        mission.setCap(Cap.TD);
        mission.setThoiGianThucHien("12 tháng");
        mission.setDuToan("1000000000");
        mission.setDonViChuTri("VHT");
        ChuNhiem owner = new ChuNhiem();
        owner.setHoTen("Nguyễn Văn A");
        owner.setMaNhanVien("VHT001");
        mission.setChuNhiem(owner);
        return mission;
    }
}

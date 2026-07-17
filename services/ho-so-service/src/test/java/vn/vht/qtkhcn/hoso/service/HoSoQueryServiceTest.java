package vn.vht.qtkhcn.hoso.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.hoso.domain.Cap;
import vn.vht.qtkhcn.hoso.domain.ChuNhiem;
import vn.vht.qtkhcn.hoso.domain.DossierStatus;
import vn.vht.qtkhcn.hoso.domain.GiaiDoan;
import vn.vht.qtkhcn.hoso.domain.HoSo;
import vn.vht.qtkhcn.hoso.domain.HoSoLoai;
import vn.vht.qtkhcn.hoso.domain.NhiemVu;
import vn.vht.qtkhcn.hoso.repository.HoSoRepository;
import vn.vht.qtkhcn.hoso.repository.NhiemVuRepository;

class HoSoQueryServiceTest {

    private HoSoRepository hoSoRepository;
    private NhiemVuRepository nhiemVuRepository;
    private HoSoQueryService service;

    @BeforeEach
    void setUp() {
        hoSoRepository = mock(HoSoRepository.class);
        nhiemVuRepository = mock(NhiemVuRepository.class);
        service = new HoSoQueryService(hoSoRepository, nhiemVuRepository);
    }

    @Test
    void listBulkLoadsReferencedNhiemVuAndBuildsLegacyView() {
        HoSo first = hoSo("HS-001", "NV-001");
        HoSo second = hoSo("HS-002", "NV-001");
        NhiemVu nhiemVu = nhiemVu("NV-001");
        when(hoSoRepository.findAll()).thenReturn(List.of(first, second));
        when(nhiemVuRepository.findAllById(List.of("NV-001"))).thenReturn(List.of(nhiemVu));

        var result = service.findAll();

        assertEquals(2, result.size());
        assertEquals("Nhiệm vụ NV-001", result.get(0).tenDeTai());
        verify(nhiemVuRepository).findAllById(List.of("NV-001"));
    }

    @Test
    void detailFailsLoudlyWhenProjectionReferencesMissingNhiemVu() {
        HoSo hoSo = hoSo("HS-001", "NV-MISSING");
        when(hoSoRepository.findById("HS-001")).thenReturn(Optional.of(hoSo));
        when(nhiemVuRepository.findById("NV-MISSING")).thenReturn(Optional.empty());

        IllegalStateException error = assertThrows(IllegalStateException.class,
                () -> service.findById("HS-001"));

        assertEquals("Hồ sơ HS-001 tham chiếu NhiemVu không tồn tại NV-MISSING", error.getMessage());
    }

    private static HoSo hoSo(String id, String maNhiemVu) {
        HoSo hoSo = new HoSo();
        hoSo.setId(id);
        hoSo.setMaNV(maNhiemVu);
        hoSo.setLoai(HoSoLoai.CHU_TRUONG);
        hoSo.setNguoiKhoiTao("U-001");
        hoSo.setNgayTao(LocalDate.of(2026, 7, 16));
        hoSo.setTrangThai(DossierStatus.DRAFT);
        return hoSo;
    }

    private static NhiemVu nhiemVu(String ma) {
        ChuNhiem chuNhiem = new ChuNhiem();
        chuNhiem.setHoTen("Nguyễn Văn A");
        NhiemVu nhiemVu = new NhiemVu();
        nhiemVu.setMa(ma);
        nhiemVu.setTen("Nhiệm vụ " + ma);
        nhiemVu.setCap(Cap.TD);
        nhiemVu.setChuNhiem(chuNhiem);
        nhiemVu.setDonViChuTri("VHT");
        nhiemVu.setGiaiDoan(GiaiDoan.CHU_TRUONG);
        return nhiemVu;
    }
}

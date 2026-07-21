package vn.vht.qtkhcn.hoso.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import vn.vht.qtkhcn.hoso.domain.DossierStep;
import vn.vht.qtkhcn.hoso.domain.HoSo;
import vn.vht.qtkhcn.hoso.domain.HoiDongCap;
import vn.vht.qtkhcn.hoso.domain.HoiDongXetDuyet;
import vn.vht.qtkhcn.hoso.domain.TaiLieu;
import vn.vht.qtkhcn.hoso.repository.HoSoRepository;
import vn.vht.qtkhcn.hoso.repository.HoiDongXetDuyetRepository;
import vn.vht.qtkhcn.hoso.repository.TaiLieuRepository;

class HoiDongXetDuyetServiceTest {
    @TempDir
    Path tempDir;

    private HoSoRepository hoSoRepository;
    private HoiDongXetDuyetRepository hoiDongRepository;
    private TaiLieuRepository taiLieuRepository;
    private HoiDongXetDuyetService service;

    @BeforeEach void setUp() {
        hoSoRepository = mock(HoSoRepository.class);
        hoiDongRepository = mock(HoiDongXetDuyetRepository.class);
        taiLieuRepository = mock(TaiLieuRepository.class);
        when(hoiDongRepository.saveAndFlush(any())).thenAnswer(call -> {
            HoiDongXetDuyet entity = call.getArgument(0);
            entity.setId(1L);
            return entity;
        });
        when(taiLieuRepository.saveAndFlush(any())).thenAnswer(call -> {
            TaiLieu entity = call.getArgument(0);
            entity.setId(9L);
            return entity;
        });
        DocumentStorageService storage = new DocumentStorageService(tempDir.toString());
        storage.initialize();
        service = new HoiDongXetDuyetService(hoSoRepository, hoiDongRepository, taiLieuRepository, storage,
                new ObjectMapper().findAndRegisterModules());
    }

    @Test void createsCouncilWithMembersAndAttachesGeneratedDocument() {
        when(hoiDongRepository.findByHoSoIdAndCapAndSourceTaskDefinitionKey("HS-1", HoiDongCap.CO_SO, "T05"))
                .thenReturn(Optional.empty());
        when(hoSoRepository.findById("HS-1")).thenReturn(Optional.of(dossierWithStep05("""
                {"capHoiDong":"vht","canCuPhapLy":"QD so 01","danhSachThanhVien":[
                 {"hoTen":"Nguyen Van A","vaiTroTrongHoiDong":"Chu tich"},
                 {"hoTen":"Tran Thi B","vaiTroTrongHoiDong":"Thu ky"}]}
                """)));

        HoiDongXetDuyet result = service.sinhTuBuoc05("HS-1");

        assertEquals(HoiDongCap.CO_SO, result.getCap());
        assertEquals("QD so 01", result.getCanCuPhapLy());
        assertEquals(2, result.getThanhVien().size());
        assertEquals("Nguyen Van A", result.getThanhVien().get(0).getHoTen());
        verify(taiLieuRepository).saveAndFlush(any());
    }

    @Test void alreadyExistingCouncilIsReturnedWithoutTouchingHoSoOrDocuments() {
        HoiDongXetDuyet existing = new HoiDongXetDuyet();
        existing.setId(5L);
        when(hoiDongRepository.findByHoSoIdAndCapAndSourceTaskDefinitionKey("HS-1", HoiDongCap.CO_SO, "T05"))
                .thenReturn(Optional.of(existing));

        HoiDongXetDuyet result = service.sinhTuBuoc05("HS-1");

        assertEquals(5L, result.getId());
        verify(hoSoRepository, never()).findById(any());
        verify(taiLieuRepository, never()).saveAndFlush(any());
    }

    @Test void throwsWhenStep05HasNoFormData() {
        when(hoiDongRepository.findByHoSoIdAndCapAndSourceTaskDefinitionKey("HS-1", HoiDongCap.CO_SO, "T05"))
                .thenReturn(Optional.empty());
        when(hoSoRepository.findById("HS-1")).thenReturn(Optional.of(dossierWithStep05(null)));

        assertThrows(IllegalStateException.class, () -> service.sinhTuBuoc05("HS-1"));
    }

    @Test void createsTapDoanCouncilFromStep18B() {
        when(hoiDongRepository.findByHoSoIdAndCapAndSourceTaskDefinitionKey("HS-1", HoiDongCap.TAP_DOAN, "T18B"))
                .thenReturn(Optional.empty());
        when(hoSoRepository.findById("HS-1")).thenReturn(Optional.of(dossierWithStep("T18B", """
                {"canCuPhapLy":"QD so 02","danhSachThanhVien":[
                 {"hoTen":"Le Van C","vaiTroTrongHoiDong":"Chu tich"},
                 {"hoTen":"Pham Thi D","vaiTroTrongHoiDong":"Uy vien"},
                 {"hoTen":"Vo Van E","vaiTroTrongHoiDong":"Uy vien"}]}
                """)));

        HoiDongXetDuyet result = service.sinhTuBuoc18B("HS-1");

        assertEquals(HoiDongCap.TAP_DOAN, result.getCap());
        assertEquals("T18B", result.getSourceTaskDefinitionKey());
        assertEquals(3, result.getThanhVien().size());
        verify(taiLieuRepository).saveAndFlush(any());
    }

    @Test void alreadyExistingTapDoanCouncilIsReturnedWithoutTouchingHoSo() {
        HoiDongXetDuyet existing = new HoiDongXetDuyet();
        existing.setId(7L);
        when(hoiDongRepository.findByHoSoIdAndCapAndSourceTaskDefinitionKey("HS-1", HoiDongCap.TAP_DOAN, "T18B"))
                .thenReturn(Optional.of(existing));

        HoiDongXetDuyet result = service.sinhTuBuoc18B("HS-1");

        assertEquals(7L, result.getId());
        verify(hoSoRepository, never()).findById(any());
    }

    private static HoSo dossierWithStep05(String formDataJson) {
        return dossierWithStep("T05", formDataJson);
    }

    private static HoSo dossierWithStep(String taskDefinitionKey, String formDataJson) {
        HoSo dossier = new HoSo();
        dossier.setId("HS-1");
        DossierStep step = new DossierStep();
        step.setHoSo(dossier);
        step.setBuocIndex(5);
        step.setTaskDefinitionKey(taskDefinitionKey);
        step.setTen("Lap, trinh QD thanh lap HDXD");
        step.setFormDataJson(formDataJson);
        List<DossierStep> steps = new ArrayList<>();
        steps.add(step);
        dossier.setSteps(steps);
        return dossier;
    }
}

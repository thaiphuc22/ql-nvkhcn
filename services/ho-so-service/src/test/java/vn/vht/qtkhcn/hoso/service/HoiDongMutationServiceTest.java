package vn.vht.qtkhcn.hoso.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.hoso.domain.HoiDongCap;
import vn.vht.qtkhcn.hoso.domain.HoiDongXetDuyet;
import vn.vht.qtkhcn.hoso.repository.HoSoRepository;
import vn.vht.qtkhcn.hoso.repository.HoiDongXetDuyetRepository;
import vn.vht.qtkhcn.hoso.web.dto.CreateHoiDongRequest;
import vn.vht.qtkhcn.hoso.web.dto.ThanhVienHoiDongRequest;
import vn.vht.qtkhcn.hoso.web.dto.UpdateHoiDongRequest;

class HoiDongMutationServiceTest {

    private HoiDongXetDuyetRepository repository;
    private HoSoRepository hoSoRepository;
    private MutationSupport mutations;
    private HoiDongMutationService service;

    @BeforeEach void setUp() {
        repository = mock(HoiDongXetDuyetRepository.class);
        hoSoRepository = mock(HoSoRepository.class);
        mutations = mock(MutationSupport.class);
        when(mutations.requireActor("alice")).thenReturn("alice");
        when(repository.saveAndFlush(any())).thenAnswer(call -> {
            HoiDongXetDuyet entity = call.getArgument(0);
            if (entity.getId() == null) entity.setId(1L);
            return entity;
        });
        service = new HoiDongMutationService(repository, hoSoRepository, mutations);
    }

    @Test void createsManualCouncilWithNullSourceTaskKey() {
        when(hoSoRepository.existsById("HS-1")).thenReturn(true);
        when(repository.existsByMaHoiDong("HD-2026-01")).thenReturn(false);
        CreateHoiDongRequest request = new CreateHoiDongRequest("HD-2026-01", "HS-1", HoiDongCap.CO_SO, "QD so 05",
                List.of(new ThanhVienHoiDongRequest("Nguyen Van A", "A@Example.COM", "Chu tich")));

        HoiDongXetDuyet result = service.create(request, "alice");

        assertEquals("HD-2026-01", result.getMaHoiDong());
        assertEquals("HS-1", result.getHoSoId());
        assertEquals(HoiDongCap.CO_SO, result.getCap());
        assertNull(result.getSourceTaskDefinitionKey(), "Hội đồng tạo thủ công không gắn task nào sinh ra nó");
        assertEquals("a@example.com", result.getThanhVien().get(0).getUserId(),
                "userId phải viết thường để khớp X-QTKHCN-User-Id ở mọi nơi so khớp downstream");
        verify(mutations).audit("HOI_DONG_XET_DUYET", "1", 0L, "CREATE", "alice", null);
    }

    @Test void createThrowsWhenDossierDoesNotExist() {
        when(hoSoRepository.existsById("HS-MISSING")).thenReturn(false);
        CreateHoiDongRequest request = new CreateHoiDongRequest("HD-2026-01", "HS-MISSING", HoiDongCap.CO_SO, null,
                List.of());

        assertThrows(EntityNotFoundException.class, () -> service.create(request, "alice"));
    }

    @Test void createThrowsWhenMaHoiDongAlreadyExists() {
        when(hoSoRepository.existsById("HS-1")).thenReturn(true);
        when(repository.existsByMaHoiDong("HD-2026-01")).thenReturn(true);
        CreateHoiDongRequest request = new CreateHoiDongRequest("HD-2026-01", "HS-1", HoiDongCap.CO_SO, null,
                List.of());

        assertThrows(IllegalArgumentException.class, () -> service.create(request, "alice"));
    }

    @Test void updateReplacesLegalBasisAndMemberList() {
        HoiDongXetDuyet existing = new HoiDongXetDuyet();
        existing.setId(5L);
        existing.setHoSoId("HS-1");
        existing.setCap(HoiDongCap.CO_SO);
        when(repository.findById(5L)).thenReturn(Optional.of(existing));
        when(repository.existsByMaHoiDongAndIdNot("HD-2026-01", 5L)).thenReturn(false);
        UpdateHoiDongRequest request = new UpdateHoiDongRequest("HD-2026-01", "QD moi",
                List.of(new ThanhVienHoiDongRequest("Tran Thi B", null, "Thu ky")));

        HoiDongXetDuyet result = service.update(5L, 0L, request, "alice");

        assertEquals("HD-2026-01", result.getMaHoiDong());
        assertEquals("QD moi", result.getCanCuPhapLy());
        assertEquals(1, result.getThanhVien().size());
        assertEquals("Tran Thi B", result.getThanhVien().get(0).getHoTen());
        assertNull(result.getThanhVien().get(0).getUserId());
    }

    @Test void updateThrowsWhenMaHoiDongTakenByAnotherCouncil() {
        HoiDongXetDuyet existing = new HoiDongXetDuyet();
        existing.setId(5L);
        existing.setHoSoId("HS-1");
        existing.setCap(HoiDongCap.CO_SO);
        when(repository.findById(5L)).thenReturn(Optional.of(existing));
        when(repository.existsByMaHoiDongAndIdNot("HD-TAKEN", 5L)).thenReturn(true);
        UpdateHoiDongRequest request = new UpdateHoiDongRequest("HD-TAKEN", null, List.of());

        assertThrows(IllegalArgumentException.class, () -> service.update(5L, 0L, request, "alice"));
    }

    @Test void updateThrowsOnVersionMismatch() {
        HoiDongXetDuyet existing = new HoiDongXetDuyet();
        existing.setId(5L);
        existing.setVersion(2L);
        when(repository.findById(5L)).thenReturn(Optional.of(existing));
        org.mockito.Mockito.doThrow(new VersionConflictException("HOI_DONG_XET_DUYET", "5", 0L, 2L))
                .when(mutations).verifyVersion("HOI_DONG_XET_DUYET", "5", 0L, 2L);
        UpdateHoiDongRequest request = new UpdateHoiDongRequest("HD-2026-01", null, List.of());

        assertThrows(VersionConflictException.class, () -> service.update(5L, 0L, request, "alice"));
    }

    @Test void deleteRemovesEntityAndAudits() {
        HoiDongXetDuyet existing = new HoiDongXetDuyet();
        existing.setId(5L);
        existing.setHoSoId("HS-1");
        existing.setCap(HoiDongCap.CO_SO);
        when(repository.findById(5L)).thenReturn(Optional.of(existing));

        service.delete(5L, "alice");

        verify(repository).delete(existing);
        verify(mutations).audit("HOI_DONG_XET_DUYET", "5", 0L, "DELETE", "alice",
                "hoSoId=HS-1,cap=CO_SO");
    }

    @Test void deleteThrowsWhenMissing() {
        when(repository.findById(9L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.delete(9L, "alice"));
    }
}

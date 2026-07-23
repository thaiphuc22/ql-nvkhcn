package vn.vht.qtkhcn.hoso.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.nio.file.Path;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import vn.vht.qtkhcn.hoso.domain.Cap;
import vn.vht.qtkhcn.hoso.domain.ChuNhiem;
import vn.vht.qtkhcn.hoso.domain.HoSo;
import vn.vht.qtkhcn.hoso.domain.NhiemVu;
import vn.vht.qtkhcn.hoso.domain.TaiLieu;
import vn.vht.qtkhcn.hoso.repository.HoSoRepository;
import vn.vht.qtkhcn.hoso.repository.NhiemVuRepository;
import vn.vht.qtkhcn.hoso.web.dto.AiSummaryContextResponse;

class AiSummaryServiceTest {
    @TempDir
    Path tempDir;

    private HoSoRepository hoSoRepository;
    private NhiemVuRepository nhiemVuRepository;
    private DocumentStorageService storage;
    private AiSummaryService service;

    @BeforeEach
    void setUp() {
        hoSoRepository = mock(HoSoRepository.class);
        nhiemVuRepository = mock(NhiemVuRepository.class);
        storage = new DocumentStorageService(tempDir.toString());
        storage.initialize();
        service = new AiSummaryService(hoSoRepository, nhiemVuRepository, storage, new DocumentTextExtractor(),
                5, 4000, 8000);
        when(nhiemVuRepository.findById("NV-1")).thenReturn(Optional.of(nhiemVu()));
    }

    @Test
    void includesExtractedTextFromReadableAttachments() {
        DocumentStorageService.StoredFile stored = storage.store(multipart("noi-dung-tai-lieu"));
        when(hoSoRepository.findById("HS-1"))
                .thenReturn(Optional.of(hoSo(List.of(taiLieu("thuyet-minh.txt", "File", stored.storageKey())))));

        AiSummaryContextResponse context = service.buildContext("HS-1");

        assertEquals(1, context.tepDinhKem().size());
        assertEquals("noi-dung-tai-lieu", context.tepDinhKem().get(0).noiDung());
        assertFalse(context.tepDinhKem().get(0).daCatBot());
    }

    @Test
    void skipsAttachmentsWithoutStorageKeyOrUnsupportedType() {
        when(hoSoRepository.findById("HS-1")).thenReturn(Optional.of(hoSo(List.of(
                taiLieu("chi-metadata.pdf", "PDF", null),
                taiLieu("nen.zip", "Archive", "khong-quan-trong")))));

        AiSummaryContextResponse context = service.buildContext("HS-1");

        assertTrue(context.tepDinhKem().isEmpty());
    }

    @Test
    void truncatesAttachmentTextAccordingToConfiguredLimit() {
        service = new AiSummaryService(hoSoRepository, nhiemVuRepository, storage, new DocumentTextExtractor(),
                5, 5, 5);
        DocumentStorageService.StoredFile stored = storage.store(multipart("0123456789"));
        when(hoSoRepository.findById("HS-1"))
                .thenReturn(Optional.of(hoSo(List.of(taiLieu("dai.txt", "File", stored.storageKey())))));

        AiSummaryContextResponse context = service.buildContext("HS-1");

        assertEquals("01234", context.tepDinhKem().get(0).noiDung());
        assertTrue(context.tepDinhKem().get(0).daCatBot());
    }

    private static MockMultipartFile multipart(String content) {
        return new MockMultipartFile("file", "f.txt", "text/plain", content.getBytes());
    }

    private static TaiLieu taiLieu(String ten, String loai, String storageKey) {
        TaiLieu taiLieu = new TaiLieu();
        taiLieu.setTen(ten);
        taiLieu.setLoai(loai);
        taiLieu.setStorageKey(storageKey);
        return taiLieu;
    }

    private static HoSo hoSo(List<TaiLieu> files) {
        HoSo hoSo = new HoSo();
        hoSo.setId("HS-1");
        hoSo.setMaNV("NV-1");
        hoSo.getTaiLieu().addAll(files);
        return hoSo;
    }

    private static NhiemVu nhiemVu() {
        NhiemVu nv = new NhiemVu();
        nv.setTen("De tai test");
        ChuNhiem chuNhiem = new ChuNhiem();
        chuNhiem.setHoTen("Nguyen Van A");
        nv.setChuNhiem(chuNhiem);
        nv.setDonViChuTri("VHT-RD");
        nv.setThoiGianThucHien("2026-2027");
        nv.setDuToan("1 ty");
        nv.setCap(Cap.CS);
        return nv;
    }
}

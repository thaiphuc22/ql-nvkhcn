package vn.vht.qtkhcn.hoso.service;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.nio.file.Path;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import vn.vht.qtkhcn.hoso.domain.DossierStatus;
import vn.vht.qtkhcn.hoso.domain.HoSo;
import vn.vht.qtkhcn.hoso.domain.TaiLieu;
import vn.vht.qtkhcn.hoso.repository.HoSoRepository;
import vn.vht.qtkhcn.hoso.repository.TaiLieuRepository;

class DocumentFileServiceTest {
    @TempDir
    Path tempDir;

    private HoSoRepository hoSoRepository;
    private TaiLieuRepository taiLieuRepository;
    private DocumentFileService service;

    @BeforeEach
    void setUp() {
        hoSoRepository = mock(HoSoRepository.class);
        taiLieuRepository = mock(TaiLieuRepository.class);
        MutationSupport mutations = mock(MutationSupport.class);
        when(mutations.requireActor("alice")).thenReturn("alice");
        when(taiLieuRepository.saveAndFlush(any())).thenAnswer(invocation -> {
            TaiLieu document = invocation.getArgument(0);
            document.setId(9L);
            return document;
        });
        DocumentStorageService storage = new DocumentStorageService(tempDir.toString());
        storage.initialize();
        service = new DocumentFileService(hoSoRepository, taiLieuRepository, storage, mutations);
    }

    @Test
    void storesContentWithGeneratedPhysicalNameAndReadsItBack() throws Exception {
        HoSo dossier = dossier(DossierStatus.DRAFT);
        when(hoSoRepository.findById("HS-1")).thenReturn(Optional.of(dossier));
        byte[] bytes = "pdf-content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file", "../bao-cao.pdf", MediaType.APPLICATION_PDF_VALUE, bytes);

        TaiLieu uploaded = service.upload("HS-1", file, "alice");

        assertEquals("bao-cao.pdf", uploaded.getTen());
        assertEquals("PDF", uploaded.getLoai());
        assertEquals(bytes.length, uploaded.getSizeBytes());
        when(taiLieuRepository.findByIdAndHoSoId(9L, "HS-1")).thenReturn(Optional.of(uploaded));
        assertArrayEquals(bytes, service.content("HS-1", 9L).resource().getContentAsByteArray());
    }

    @Test
    void uploadsWhenDossierIsAlreadyProcessing() {
        when(hoSoRepository.findById("HS-1")).thenReturn(Optional.of(dossier(DossierStatus.PROCESSING)));
        MockMultipartFile file = new MockMultipartFile("file", "a.pdf", MediaType.APPLICATION_PDF_VALUE,
                new byte[] {1});

        TaiLieu uploaded = service.upload("HS-1", file, "alice");

        assertEquals("a.pdf", uploaded.getTen());
        assertEquals(1L, uploaded.getSizeBytes());
    }

    private static HoSo dossier(DossierStatus status) {
        HoSo dossier = new HoSo();
        dossier.setId("HS-1");
        dossier.setTrangThai(status);
        return dossier;
    }
}

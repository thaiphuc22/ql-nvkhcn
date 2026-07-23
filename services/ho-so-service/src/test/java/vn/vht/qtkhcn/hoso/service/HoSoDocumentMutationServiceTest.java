package vn.vht.qtkhcn.hoso.service;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.hoso.domain.DossierStatus;
import vn.vht.qtkhcn.hoso.domain.HoSo;
import vn.vht.qtkhcn.hoso.domain.TaiLieu;
import vn.vht.qtkhcn.hoso.repository.HoSoRepository;
import vn.vht.qtkhcn.hoso.repository.NhiemVuRepository;
import vn.vht.qtkhcn.hoso.repository.OutboxEventRepository;
import vn.vht.qtkhcn.hoso.repository.TaiLieuRepository;
import vn.vht.qtkhcn.hoso.repository.WorkflowEventInboxRepository;
import vn.vht.qtkhcn.hoso.repository.WorkflowProcessProjectionRepository;
import vn.vht.qtkhcn.hoso.repository.WorkflowTaskProjectionRepository;
import vn.vht.qtkhcn.hoso.web.dto.CreateTaiLieuRequest;

class HoSoDocumentMutationServiceTest {
    private HoSoRepository hoSoRepository;
    private TaiLieuRepository taiLieuRepository;
    private MutationSupport mutations;
    private DocumentStorageService storage;
    private HoSoMutationService service;

    @BeforeEach
    void setUp() {
        hoSoRepository = mock(HoSoRepository.class);
        taiLieuRepository = mock(TaiLieuRepository.class);
        mutations = mock(MutationSupport.class);
        storage = mock(DocumentStorageService.class);
        when(mutations.requireActor("alice")).thenReturn("alice");
        service = new HoSoMutationService(
                hoSoRepository, mock(NhiemVuRepository.class), taiLieuRepository,
                mock(BusinessIdGenerator.class), mutations, mock(OutboxEventRepository.class),
                mock(WorkflowProcessProjectionRepository.class), mock(WorkflowTaskProjectionRepository.class),
                mock(WorkflowEventInboxRepository.class), storage);
    }

    @Test
    void addsMetadataWhenDossierIsProcessing() {
        HoSo dossier = processingDossier();
        when(hoSoRepository.findById("HS-1")).thenReturn(Optional.of(dossier));
        when(taiLieuRepository.saveAndFlush(org.mockito.ArgumentMatchers.any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        service.addDocument("HS-1", new CreateTaiLieuRequest("bao-cao.pdf", "PDF"), "alice");

        verify(taiLieuRepository).saveAndFlush(org.mockito.ArgumentMatchers.any(TaiLieu.class));
    }

    @Test
    void deletesStoredDocumentWhenDossierIsProcessing() {
        HoSo dossier = processingDossier();
        TaiLieu document = new TaiLieu();
        document.setId(7L);
        document.setStorageKey("01234567-89ab-cdef-0123-456789abcdef");
        when(hoSoRepository.findById("HS-1")).thenReturn(Optional.of(dossier));
        when(taiLieuRepository.findByIdAndHoSoId(7L, "HS-1")).thenReturn(Optional.of(document));

        service.deleteDocument("HS-1", 7L, 0L, "alice");

        verify(taiLieuRepository).delete(document);
        verify(storage).deleteAfterCommit(document.getStorageKey());
    }

    private static HoSo processingDossier() {
        HoSo dossier = new HoSo();
        dossier.setId("HS-1");
        dossier.setTrangThai(DossierStatus.PROCESSING);
        return dossier;
    }
}

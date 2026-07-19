package vn.vht.qtkhcn.hoso.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.hoso.domain.Cap;
import vn.vht.qtkhcn.hoso.domain.DossierStatus;
import vn.vht.qtkhcn.hoso.domain.HoSo;
import vn.vht.qtkhcn.hoso.domain.NhiemVu;
import vn.vht.qtkhcn.hoso.domain.OutboxEvent;
import vn.vht.qtkhcn.hoso.repository.HoSoRepository;
import vn.vht.qtkhcn.hoso.repository.NhiemVuRepository;
import vn.vht.qtkhcn.hoso.repository.OutboxEventRepository;
import vn.vht.qtkhcn.hoso.web.dto.SubmitHoSoRequest;

class WorkflowSubmissionServiceTest {
    private HoSoRepository hoSoRepository;
    private NhiemVuRepository nhiemVuRepository;
    private OutboxEventRepository outboxRepository;
    private WorkflowSubmissionService service;

    @BeforeEach void setUp() {
        hoSoRepository = mock(HoSoRepository.class);
        nhiemVuRepository = mock(NhiemVuRepository.class);
        outboxRepository = mock(OutboxEventRepository.class);
        MutationSupport mutations = mock(MutationSupport.class);
        when(mutations.requireActor("alice")).thenReturn("alice");
        when(hoSoRepository.saveAndFlush(any())).thenAnswer(a -> a.getArgument(0));
        service = new WorkflowSubmissionService(hoSoRepository, nhiemVuRepository, outboxRepository,
                mutations, new ObjectMapper());
    }

    @Test void submitAtomicallyMovesToPendingAndWritesMinimalOutboxCommand() {
        HoSo hoSo = draft();
        NhiemVu nhiemVu = new NhiemVu();
        nhiemVu.setMa("NV-001");
        nhiemVu.setCap(Cap.TD);
        when(hoSoRepository.findById("HS-001")).thenReturn(Optional.of(hoSo));
        when(nhiemVuRepository.findById("NV-001")).thenReturn(Optional.of(nhiemVu));

        HoSo submitted = service.submit("HS-001", new SubmitHoSoRequest("RD01.01", "Chu truong"), "alice");

        assertEquals(DossierStatus.START_PENDING, submitted.getTrangThai());
        assertNotNull(submitted.getStartRequestId());
        verify(outboxRepository).save(org.mockito.ArgumentMatchers.argThat(event ->
                event.getId().equals(submitted.getStartRequestId())
                && event.getStatus() == OutboxEvent.Status.PENDING
                && event.getPayloadJson().contains("\"maHoSo\":\"HS-001\"")
                && !event.getPayloadJson().contains("taiLieu")));
    }

    @Test void parallelOrRepeatedSubmitFailsBeforeWritingAnotherOutboxEvent() {
        HoSo hoSo = draft();
        hoSo.setTrangThai(DossierStatus.START_PENDING);
        when(hoSoRepository.findById("HS-001")).thenReturn(Optional.of(hoSo));

        assertThrows(IllegalStateException.class,
                () -> service.submit("HS-001", new SubmitHoSoRequest("RD01.01", "RD01"), "alice"));
        verify(outboxRepository, never()).save(any());
    }

    @Test void startFailedDossierCanBeRetriedWithANewRequestId() {
        HoSo hoSo = draft();
        hoSo.setTrangThai(DossierStatus.START_FAILED);
        java.util.UUID oldRequest = java.util.UUID.randomUUID();
        hoSo.setStartRequestId(oldRequest);
        NhiemVu nhiemVu = new NhiemVu();
        nhiemVu.setMa("NV-001");
        nhiemVu.setCap(Cap.CS);
        when(hoSoRepository.findById("HS-001")).thenReturn(Optional.of(hoSo));
        when(nhiemVuRepository.findById("NV-001")).thenReturn(Optional.of(nhiemVu));

        HoSo retried = service.submit("HS-001", new SubmitHoSoRequest("RD01.01", "RD01"), "alice");

        assertEquals(DossierStatus.START_PENDING, retried.getTrangThai());
        org.junit.jupiter.api.Assertions.assertNotEquals(oldRequest, retried.getStartRequestId());
    }

    private static HoSo draft() {
        HoSo hoSo = new HoSo();
        hoSo.setId("HS-001");
        hoSo.setMaNV("NV-001");
        hoSo.setTrangThai(DossierStatus.DRAFT);
        return hoSo;
    }
}

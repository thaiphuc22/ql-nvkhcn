package vn.vht.qtkhcn.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import vn.vht.qtkhcn.camunda.Rd0101ProcessService;
import vn.vht.qtkhcn.domain.ActionOutcome;
import vn.vht.qtkhcn.domain.DossierStatus;
import vn.vht.qtkhcn.domain.DossierStep;
import vn.vht.qtkhcn.domain.HoSo;
import vn.vht.qtkhcn.domain.StepStatus;
import vn.vht.qtkhcn.repository.HoSoRepository;
import vn.vht.qtkhcn.repository.NhiemVuRepository;
import vn.vht.qtkhcn.web.dto.HoSoActionRequest;

class HoSoServiceTest {

    private HoSoRepository hoSoRepository;
    private Rd0101ProcessService processService;
    private HoSoService service;

    @BeforeEach
    void setUp() {
        hoSoRepository = mock(HoSoRepository.class);
        processService = mock(Rd0101ProcessService.class);
        service = new HoSoService(hoSoRepository, mock(NhiemVuRepository.class), processService);
        when(hoSoRepository.save(any(HoSo.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void approveCompletesCamundaBeforeSavingDomainState() {
        HoSo hoSo = processingHoSo();
        when(hoSoRepository.findById(hoSo.getId())).thenReturn(Optional.of(hoSo));

        service.applyAction(hoSo.getId(),
                new HoSoActionRequest(ActionOutcome.APPROVE_STEP, "actor", "Đồng ý"));

        assertEquals(StepStatus.DONE, hoSo.getSteps().get(0).getTrangThai());
        assertEquals(StepStatus.CURRENT, hoSo.getSteps().get(1).getTrangThai());
        assertEquals(2, hoSo.getBuocHienTai());
        InOrder order = inOrder(processService, hoSoRepository);
        order.verify(processService).applyAction(42L, ActionOutcome.APPROVE_STEP);
        order.verify(hoSoRepository).save(hoSo);
    }

    @Test
    void camundaFailureDoesNotAdvanceOrSaveDomainState() {
        HoSo hoSo = processingHoSo();
        when(hoSoRepository.findById(hoSo.getId())).thenReturn(Optional.of(hoSo));
        when(processService.applyAction(42L, ActionOutcome.APPROVE_STEP))
                .thenThrow(new IllegalStateException("Camunda unavailable"));

        assertThrows(IllegalStateException.class, () -> service.applyAction(hoSo.getId(),
                new HoSoActionRequest(ActionOutcome.APPROVE_STEP, "actor", "Đồng ý")));

        assertEquals(StepStatus.CURRENT, hoSo.getSteps().get(0).getTrangThai());
        assertEquals(StepStatus.PENDING, hoSo.getSteps().get(1).getTrangThai());
        verify(hoSoRepository, never()).save(any());
    }

    @Test
    void missingProcessKeyFailsClosedWithoutCallingCamunda() {
        HoSo hoSo = processingHoSo();
        hoSo.setZeebeProcessInstanceKey(null);
        when(hoSoRepository.findById(hoSo.getId())).thenReturn(Optional.of(hoSo));

        assertThrows(IllegalStateException.class, () -> service.applyAction(hoSo.getId(),
                new HoSoActionRequest(ActionOutcome.APPROVE_STEP, "actor", null)));

        verify(processService, never()).applyAction(any(Long.class), any(ActionOutcome.class));
        verify(hoSoRepository, never()).save(any());
    }

    private static HoSo processingHoSo() {
        HoSo hoSo = new HoSo();
        hoSo.setId("HS-2026-001");
        hoSo.setTrangThai(DossierStatus.PROCESSING);
        hoSo.setBuocHienTai(1);
        hoSo.setZeebeProcessInstanceKey(42L);
        hoSo.setSteps(new ArrayList<>());

        DossierStep current = new DossierStep();
        current.setBuocIndex(1);
        current.setTrangThai(StepStatus.CURRENT);
        current.setHoSo(hoSo);
        hoSo.getSteps().add(current);

        DossierStep next = new DossierStep();
        next.setBuocIndex(2);
        next.setTrangThai(StepStatus.PENDING);
        next.setHoSo(hoSo);
        hoSo.getSteps().add(next);
        return hoSo;
    }
}

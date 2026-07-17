package vn.vht.qtkhcn.service;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import vn.vht.qtkhcn.domain.ActionOutcome;
import vn.vht.qtkhcn.domain.Cap;
import vn.vht.qtkhcn.domain.DossierStatus;
import vn.vht.qtkhcn.domain.DossierStep;
import vn.vht.qtkhcn.domain.HoSo;
import vn.vht.qtkhcn.domain.HoSoLoai;
import vn.vht.qtkhcn.domain.NhiemVu;
import vn.vht.qtkhcn.domain.StepStatus;
import vn.vht.qtkhcn.repository.HoSoRepository;
import vn.vht.qtkhcn.repository.NhiemVuRepository;
import vn.vht.qtkhcn.web.dto.CreateHoSoRequest;
import vn.vht.qtkhcn.web.dto.CreateTaiLieuRequest;
import vn.vht.qtkhcn.web.dto.HoSoActionRequest;
import vn.vht.qtkhcn.web.dto.SubmitHoSoRequest;
import vn.vht.qtkhcn.workflow.StartWorkflowCommand;
import vn.vht.qtkhcn.workflow.WorkflowAction;
import vn.vht.qtkhcn.workflow.WorkflowActionCommand;
import vn.vht.qtkhcn.workflow.WorkflowClient;
import vn.vht.qtkhcn.workflow.WorkflowInstance;

class HoSoServiceTest {

    private HoSoRepository hoSoRepository;
    private NhiemVuRepository nhiemVuRepository;
    private WorkflowClient workflowClient;
    private HoSoService service;

    @BeforeEach
    void setUp() {
        hoSoRepository = mock(HoSoRepository.class);
        nhiemVuRepository = mock(NhiemVuRepository.class);
        workflowClient = mock(WorkflowClient.class);
        service = new HoSoService(hoSoRepository, nhiemVuRepository, workflowClient);
        when(hoSoRepository.save(any(HoSo.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void createDraftLocksDefaultsSeedDataAndBidirectionalStepLink() {
        NhiemVu nhiemVu = nhiemVu("NV-001", Cap.TD);
        HoSo existing = new HoSo();
        existing.setId("HS-%d-007".formatted(LocalDate.now().getYear()));
        when(nhiemVuRepository.findById("NV-001")).thenReturn(Optional.of(nhiemVu));
        when(hoSoRepository.findAll()).thenReturn(List.of(existing));

        HoSo created = service.createDraft(new CreateHoSoRequest("NV-001", null, "Nguyễn Văn A"));

        assertAll(
                () -> assertEquals("HS-%d-008".formatted(LocalDate.now().getYear()), created.getId()),
                () -> assertEquals("NV-001", created.getMaNV()),
                () -> assertEquals(HoSoLoai.CHU_TRUONG, created.getLoai()),
                () -> assertEquals("", created.getQuyTrinh()),
                () -> assertEquals("Chưa vào quy trình", created.getQuyTrinhTen()),
                () -> assertEquals("Nguyễn Văn A", created.getNguoiKhoiTao()),
                () -> assertEquals(LocalDate.now(), created.getNgayTao()),
                () -> assertEquals(DossierStatus.DRAFT, created.getTrangThai()),
                () -> assertEquals(0, created.getBuocHienTai()),
                () -> assertNull(created.getZeebeProcessInstanceKey()));

        assertEquals(1, created.getSteps().size());
        DossierStep initialStep = created.getSteps().get(0);
        assertAll(
                () -> assertSame(created, initialStep.getHoSo()),
                () -> assertEquals(0, initialStep.getBuocIndex()),
                () -> assertEquals("Khởi tạo hồ sơ", initialStep.getTen()),
                () -> assertEquals("Chủ nhiệm đề tài (PM)", initialStep.getVaiTro()),
                () -> assertEquals(java.util.Set.of("PM"), initialStep.getVaiTroCodes()),
                () -> assertEquals("Nguyễn Văn A", initialStep.getNguoi()),
                () -> assertEquals(StepStatus.DONE, initialStep.getTrangThai()),
                () -> assertTrue(initialStep.getThoiDiem().matches("\\d{2}/\\d{2}/\\d{4} \\d{2}:\\d{2}")));

        assertEquals(2, created.getTaiLieu().size());
        assertAll(
                () -> assertEquals("Thuyết minh đề tài.pdf", created.getTaiLieu().get(0).getTen()),
                () -> assertEquals("PDF", created.getTaiLieu().get(0).getLoai()),
                () -> assertEquals("Dự toán PL1-PL6.xlsx", created.getTaiLieu().get(1).getTen()),
                () -> assertEquals("Excel", created.getTaiLieu().get(1).getLoai()));
        verify(hoSoRepository).save(created);
        verify(workflowClient, never()).startWorkflow(any(StartWorkflowCommand.class));
    }

    @Test
    void createDraftUsesSelectedDateDocumentsAndTrimsUserInput() {
        when(nhiemVuRepository.findById("NV-001"))
                .thenReturn(Optional.of(nhiemVu("NV-001", Cap.TD)));
        when(hoSoRepository.findAll()).thenReturn(List.of());

        HoSo created = service.createDraft(new CreateHoSoRequest(
                "NV-001",
                HoSoLoai.NGHIEM_THU,
                "  TS. Trần Văn Nam  ",
                LocalDate.of(2026, 7, 15),
                List.of(
                        new CreateTaiLieuRequest("  Báo cáo tổng kết.pdf ", " PDF "),
                        new CreateTaiLieuRequest("Sản phẩm.zip", "Archive"))));

        assertAll(
                () -> assertEquals(HoSoLoai.NGHIEM_THU, created.getLoai()),
                () -> assertEquals("TS. Trần Văn Nam", created.getNguoiKhoiTao()),
                () -> assertEquals(LocalDate.of(2026, 7, 15), created.getNgayTao()),
                () -> assertEquals("TS. Trần Văn Nam", created.getSteps().get(0).getNguoi()),
                () -> assertEquals(2, created.getTaiLieu().size()),
                () -> assertEquals("Báo cáo tổng kết.pdf", created.getTaiLieu().get(0).getTen()),
                () -> assertEquals("PDF", created.getTaiLieu().get(0).getLoai()));
    }

    @Test
    void submitStartsCamundaBeforeSavingAndBuildsRd0101Steps() {
        HoSo draft = draftHoSo();
        when(hoSoRepository.findById(draft.getId())).thenReturn(Optional.of(draft));
        when(nhiemVuRepository.findById(draft.getMaNV()))
                .thenReturn(Optional.of(nhiemVu(draft.getMaNV(), Cap.TD)));
        when(workflowClient.startWorkflow(any(StartWorkflowCommand.class)))
                .thenReturn(Optional.of(new WorkflowInstance("73")));

        HoSo submitted = service.submit(draft.getId(), new SubmitHoSoRequest("RD01.01", "Xét duyệt chủ trương"));

        assertAll(
                () -> assertEquals("RD01.01", submitted.getQuyTrinh()),
                () -> assertEquals("Xét duyệt chủ trương", submitted.getQuyTrinhTen()),
                () -> assertEquals(DossierStatus.PROCESSING, submitted.getTrangThai()),
                () -> assertEquals(1, submitted.getBuocHienTai()),
                () -> assertEquals(73L, submitted.getZeebeProcessInstanceKey()),
                () -> assertEquals(6, submitted.getSteps().size()));

        DossierStep firstWorkflowStep = submitted.getSteps().get(1);
        assertAll(
                () -> assertSame(submitted, firstWorkflowStep.getHoSo()),
                () -> assertEquals(1, firstWorkflowStep.getBuocIndex()),
                () -> assertEquals("t2", firstWorkflowStep.getTaskDefinitionKey()),
                () -> assertEquals("Ký duyệt cấp Trung tâm/Khối", firstWorkflowStep.getTen()),
                () -> assertEquals(StepStatus.CURRENT, firstWorkflowStep.getTrangThai()),
                () -> assertEquals(LocalDate.now().plusDays(7).toString(), firstWorkflowStep.getHanXuLy()));
        assertTrue(submitted.getSteps().subList(2, 6).stream()
                .allMatch(step -> step.getTrangThai() == StepStatus.PENDING && step.getHoSo() == submitted));
        assertEquals(List.of("t2", "t3", "t4", "t5", "t6"), submitted.getSteps().subList(1, 6).stream()
                .map(DossierStep::getTaskDefinitionKey)
                .toList());

        InOrder order = inOrder(workflowClient, hoSoRepository);
        order.verify(workflowClient).startWorkflow(argThat(command ->
                command.businessKey().equals(draft.getId())
                        && command.processCode().equals("RD01.01")
                        && command.hoSoId().equals(draft.getId())
                        && command.nhiemVuId().equals(draft.getMaNV())
                        && command.initiatorUserId().equals("U-001")
                        && command.initialVariables().equals(java.util.Map.of(
                                "maHoSo", draft.getId(), "cap", Cap.TD.name()))));
        order.verify(hoSoRepository).save(draft);
    }

    @Test
    void submitKeepsLegacyFailSoftWhenCamundaStartReturnsNull() {
        HoSo draft = draftHoSo();
        when(hoSoRepository.findById(draft.getId())).thenReturn(Optional.of(draft));
        when(nhiemVuRepository.findById(draft.getMaNV()))
                .thenReturn(Optional.of(nhiemVu(draft.getMaNV(), Cap.CS)));
        when(workflowClient.startWorkflow(any(StartWorkflowCommand.class))).thenReturn(Optional.empty());

        HoSo submitted = service.submit(draft.getId(), new SubmitHoSoRequest("RD01.01", "Xét duyệt chủ trương"));

        assertEquals(DossierStatus.PROCESSING, submitted.getTrangThai());
        assertEquals(1, submitted.getBuocHienTai());
        assertNull(submitted.getZeebeProcessInstanceKey());
        InOrder order = inOrder(workflowClient, hoSoRepository);
        order.verify(workflowClient).startWorkflow(argThat(command ->
                command.hoSoId().equals(draft.getId())
                        && command.initialVariables().get("cap").equals(Cap.CS.name())));
        order.verify(hoSoRepository).save(draft);
    }

    @Disabled("Documents the legacy read-max-then-increment collision; replace with a DB-generated sequence")
    @Test
    void parallelDraftCreationCanGenerateTheSameId() {
        when(nhiemVuRepository.findById("NV-001"))
                .thenReturn(Optional.of(nhiemVu("NV-001", Cap.TD)));
        when(hoSoRepository.findAll()).thenReturn(List.of());

        HoSo first = service.createDraft(new CreateHoSoRequest("NV-001", null, "actor-1"));
        HoSo concurrent = service.createDraft(new CreateHoSoRequest("NV-001", null, "actor-2"));

        assertEquals(first.getId(), concurrent.getId(),
                "Both transactions can observe the same max id before either commit becomes visible");
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
        InOrder order = inOrder(workflowClient, hoSoRepository);
        order.verify(workflowClient).applyAction(
                new WorkflowActionCommand("42", WorkflowAction.APPROVE_STEP));
        order.verify(hoSoRepository).save(hoSo);
    }

    @Test
    void camundaFailureDoesNotAdvanceOrSaveDomainState() {
        HoSo hoSo = processingHoSo();
        when(hoSoRepository.findById(hoSo.getId())).thenReturn(Optional.of(hoSo));
        doThrow(new IllegalStateException("Camunda unavailable"))
                .when(workflowClient)
                .applyAction(new WorkflowActionCommand("42", WorkflowAction.APPROVE_STEP));

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

        verify(workflowClient, never()).applyAction(any(WorkflowActionCommand.class));
        verify(hoSoRepository, never()).save(any());
    }

    @Test
    void returnMovesCurrentStepBackAfterCamundaCompletes() {
        HoSo hoSo = processingHoSo();
        DossierStep previous = hoSo.getSteps().get(0);
        DossierStep current = hoSo.getSteps().get(1);
        previous.setTrangThai(StepStatus.DONE);
        current.setTrangThai(StepStatus.CURRENT);
        hoSo.setBuocHienTai(2);
        when(hoSoRepository.findById(hoSo.getId())).thenReturn(Optional.of(hoSo));

        service.applyAction(hoSo.getId(),
                new HoSoActionRequest(ActionOutcome.RETURN_STEP, "reviewer", "Cần bổ sung"));

        assertAll(
                () -> assertEquals(StepStatus.CURRENT, previous.getTrangThai()),
                () -> assertEquals(LocalDate.now().plusDays(7).toString(), previous.getHanXuLy()),
                () -> assertEquals(StepStatus.PENDING, current.getTrangThai()),
                () -> assertEquals("Cần bổ sung", current.getYKien()),
                () -> assertEquals(1, hoSo.getBuocHienTai()),
                () -> assertEquals(DossierStatus.PROCESSING, hoSo.getTrangThai()));
        InOrder order = inOrder(workflowClient, hoSoRepository);
        order.verify(workflowClient).applyAction(
                new WorkflowActionCommand("42", WorkflowAction.RETURN_STEP));
        order.verify(hoSoRepository).save(hoSo);
    }

    @Test
    void rejectMarksCurrentStepAndDossierRejectedAfterCamundaCompletes() {
        HoSo hoSo = processingHoSo();
        DossierStep current = hoSo.getSteps().get(0);
        when(hoSoRepository.findById(hoSo.getId())).thenReturn(Optional.of(hoSo));

        service.applyAction(hoSo.getId(),
                new HoSoActionRequest(ActionOutcome.REJECT_STEP, "reviewer", "Không đạt"));

        assertAll(
                () -> assertEquals(StepStatus.REJECTED, current.getTrangThai()),
                () -> assertEquals("reviewer", current.getNguoi()),
                () -> assertEquals("Không đạt", current.getYKien()),
                () -> assertTrue(current.getThoiDiem().matches("\\d{2}/\\d{2}/\\d{4} \\d{2}:\\d{2}")),
                () -> assertEquals(DossierStatus.REJECTED, hoSo.getTrangThai()));
        InOrder order = inOrder(workflowClient, hoSoRepository);
        order.verify(workflowClient).applyAction(
                new WorkflowActionCommand("42", WorkflowAction.REJECT_STEP));
        order.verify(hoSoRepository).save(hoSo);
    }

    private static HoSo draftHoSo() {
        HoSo hoSo = new HoSo();
        hoSo.setId("HS-2026-001");
        hoSo.setMaNV("NV-001");
        hoSo.setNguoiKhoiTao("U-001");
        hoSo.setTrangThai(DossierStatus.DRAFT);
        hoSo.setBuocHienTai(0);

        DossierStep initial = new DossierStep();
        initial.setBuocIndex(0);
        initial.setTen("Khởi tạo hồ sơ");
        initial.setTrangThai(StepStatus.DONE);
        initial.setHoSo(hoSo);
        hoSo.getSteps().add(initial);
        return hoSo;
    }

    private static NhiemVu nhiemVu(String ma, Cap cap) {
        NhiemVu nhiemVu = new NhiemVu();
        nhiemVu.setMa(ma);
        nhiemVu.setCap(cap);
        return nhiemVu;
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

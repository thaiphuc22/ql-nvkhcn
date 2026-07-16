package vn.vht.qtkhcn.service;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.camunda.Rd0101ProcessService;
import vn.vht.qtkhcn.domain.ActionOutcome;
import vn.vht.qtkhcn.domain.DossierStatus;
import vn.vht.qtkhcn.domain.DossierStep;
import vn.vht.qtkhcn.domain.HoSo;
import vn.vht.qtkhcn.domain.HoSoLoai;
import vn.vht.qtkhcn.domain.NhiemVu;
import vn.vht.qtkhcn.domain.StepStatus;
import vn.vht.qtkhcn.domain.TaiLieu;
import vn.vht.qtkhcn.repository.HoSoRepository;
import vn.vht.qtkhcn.repository.NhiemVuRepository;
import vn.vht.qtkhcn.web.dto.CreateHoSoRequest;
import vn.vht.qtkhcn.web.dto.HoSoActionRequest;
import vn.vht.qtkhcn.web.dto.SubmitHoSoRequest;
import vn.vht.qtkhcn.web.dto.TaskStepDef;

/**
 * Port từ webapp/src/data/dossiers.ts (createDraftHoSo/stepsFromTaskSteps) +
 * webapp/src/store/DossierContext.tsx (approveStep/returnStep/rejectStep, RÚT GỌN).
 *
 * GAP có chủ đích so với mock (flagged, không âm thầm bỏ qua):
 * - Chỉ hỗ trợ "Gửi duyệt" quy trình RD01.01 (submit ném lỗi rõ ràng cho quy trình khác) — các
 *   luồng khác (RD01.02/RD02.01/RD05.01...) là việc của Mốc 6+ (strangler migration).
 * - RETURN_STEP dùng mô hình tuyến tính "lùi 1 bước" thay vì port đầy đủ
 *   webapp/src/data/stepRouting.ts::ROUTING_TABLES (chọn nhánh đích tuỳ nghiệp vụ) — cùng độ rút
 *   gọn RD01_01_SUBMIT_STEPS đã ghi trong Rd01Steps.
 */
@Service
public class HoSoService {

    private static final DateTimeFormatter THOI_DIEM_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final Pattern HO_SO_ID_SEQ = Pattern.compile("HS-\\d{4}-(\\d+)");

    private final HoSoRepository hoSoRepository;
    private final NhiemVuRepository nhiemVuRepository;
    private final Rd0101ProcessService rd0101ProcessService;

    public HoSoService(HoSoRepository hoSoRepository, NhiemVuRepository nhiemVuRepository,
                        Rd0101ProcessService rd0101ProcessService) {
        this.hoSoRepository = hoSoRepository;
        this.nhiemVuRepository = nhiemVuRepository;
        this.rd0101ProcessService = rd0101ProcessService;
    }

    @Transactional
    public HoSo createDraft(CreateHoSoRequest req) {
        NhiemVu nv = nhiemVuRepository.findById(req.maNV())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy NhiemVu " + req.maNV()));

        HoSo h = new HoSo();
        h.setId(nextHoSoId());
        h.setMaNV(nv.getMa());
        h.setLoai(req.loai() != null ? req.loai() : HoSoLoai.CHU_TRUONG);
        h.setQuyTrinh("");
        h.setQuyTrinhTen("Chưa vào quy trình");
        h.setNguoiKhoiTao(req.nguoiKhoiTao());
        h.setNgayTao(LocalDate.now());
        h.setTrangThai(DossierStatus.DRAFT);
        h.setBuocHienTai(0);

        DossierStep khoiTao = new DossierStep();
        khoiTao.setBuocIndex(0);
        khoiTao.setTen("Khởi tạo hồ sơ");
        khoiTao.setVaiTro("Chủ nhiệm đề tài (PM)");
        khoiTao.setVaiTroCodes(Set.of("PM"));
        khoiTao.setNguoi(req.nguoiKhoiTao());
        khoiTao.setTrangThai(StepStatus.DONE);
        khoiTao.setThoiDiem(LocalDateTime.now().format(THOI_DIEM_FMT));
        khoiTao.setHoSo(h);
        h.getSteps().add(khoiTao);

        h.getTaiLieu().add(new TaiLieu("Thuyết minh đề tài.pdf", "PDF"));
        h.getTaiLieu().add(new TaiLieu("Dự toán PL1-PL6.xlsx", "Excel"));

        return hoSoRepository.save(h);
    }

    @Transactional
    public HoSo submit(String hoSoId, SubmitHoSoRequest req) {
        HoSo h = getOrThrow(hoSoId);
        if (h.getTrangThai() != DossierStatus.DRAFT) {
            throw new IllegalStateException("Hồ sơ " + hoSoId + " không ở trạng thái draft, không thể Gửi duyệt lại.");
        }
        if (!"RD01.01".equals(req.quyTrinh())) {
            throw new UnsupportedOperationException(
                    "Quy trình " + req.quyTrinh() + " chưa được hỗ trợ ở Mốc 2 — chỉ RD01.01. "
                            + "Xem active-task.md Mốc 6+ (strangler migration).");
        }

        h.setQuyTrinh(req.quyTrinh());
        h.setQuyTrinhTen(req.quyTrinhTen());

        List<TaskStepDef> steps = Rd01Steps.RD01_01_SUBMIT_STEPS;
        for (int i = 0; i < steps.size(); i++) {
            TaskStepDef def = steps.get(i);
            DossierStep s = new DossierStep();
            s.setBuocIndex(i + 1); // buocIndex 0 = bước "Khởi tạo hồ sơ" đã có từ createDraft
            s.setTaskDefinitionKey(def.key());
            s.setTen(def.ten());
            s.setVaiTro(def.vaiTro());
            s.setVaiTroCodes(new HashSet<>(def.vaiTroCodes()));
            s.setFormKey(def.formKey());
            s.setTrangThai(i == 0 ? StepStatus.CURRENT : StepStatus.PENDING);
            if (i == 0) {
                s.setHanXuLy(LocalDate.now().plusDays(7).toString());
            }
            s.setHoSo(h);
            h.getSteps().add(s);
        }
        h.setTrangThai(DossierStatus.PROCESSING);
        h.setBuocHienTai(1);

        NhiemVu nv = nhiemVuRepository.findById(h.getMaNV())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy NhiemVu " + h.getMaNV()));
        h.setZeebeProcessInstanceKey(rd0101ProcessService.startInstance(h.getId(), nv.getCap()));

        return hoSoRepository.save(h);
    }

    @Transactional
    public HoSo applyAction(String hoSoId, HoSoActionRequest req) {
        HoSo h = getOrThrow(hoSoId);
        if (h.getTrangThai() != DossierStatus.PROCESSING) {
            throw new IllegalStateException("Hồ sơ " + hoSoId + " không ở trạng thái đang xử lý.");
        }
        List<DossierStep> steps = h.getSteps();
        DossierStep current = steps.stream()
                .filter(s -> s.getTrangThai() == StepStatus.CURRENT)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Hồ sơ " + hoSoId + " không có bước đang xử lý."));

        DossierStep previous = req.outcome() == ActionOutcome.RETURN_STEP
                ? findByIndex(steps, current.getBuocIndex() - 1)
                : null;
        if (req.outcome() == ActionOutcome.RETURN_STEP && previous == null) {
            throw new IllegalStateException("Bước hiện tại của " + hoSoId
                    + " không có bước liền trước để trả lại.");
        }

        Long processInstanceKey = h.getZeebeProcessInstanceKey();
        if (processInstanceKey == null) {
            throw new IllegalStateException("Hồ sơ " + hoSoId
                    + " không có Zeebe process instance; từ chối cập nhật domain để tránh lệch trạng thái.");
        }

        // Apply to Camunda first. A Camunda error aborts this transaction, so PostgreSQL is not
        // advanced independently. The request/response REST contract remains unchanged.
        rd0101ProcessService.applyAction(processInstanceKey, req.outcome());

        String now = LocalDateTime.now().format(THOI_DIEM_FMT);

        if (req.outcome() == ActionOutcome.APPROVE_STEP) {
            current.setTrangThai(StepStatus.DONE);
            current.setNguoi(req.actor());
            current.setThoiDiem(now);
            current.setYKien(req.yKien());

            DossierStep next = findByIndex(steps, current.getBuocIndex() + 1);
            if (next != null) {
                next.setTrangThai(StepStatus.CURRENT);
                next.setHanXuLy(LocalDate.now().plusDays(7).toString());
                h.setBuocHienTai(next.getBuocIndex());
            } else {
                h.setTrangThai(DossierStatus.APPROVED);
            }
        } else if (req.outcome() == ActionOutcome.REJECT_STEP) {
            current.setTrangThai(StepStatus.REJECTED);
            current.setNguoi(req.actor());
            current.setThoiDiem(now);
            current.setYKien(req.yKien());
            h.setTrangThai(DossierStatus.REJECTED);
        } else { // RETURN_STEP — mô hình tuyến tính rút gọn, xem GAP ở Javadoc lớp này
            current.setTrangThai(StepStatus.PENDING);
            current.setYKien(req.yKien());
            previous.setTrangThai(StepStatus.CURRENT);
            previous.setHanXuLy(LocalDate.now().plusDays(7).toString());
            h.setBuocHienTai(previous.getBuocIndex());
        }

        return hoSoRepository.save(h);
    }

    public HoSo getOrThrow(String id) {
        return hoSoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy HoSo " + id));
    }

    private static DossierStep findByIndex(List<DossierStep> steps, int index) {
        return steps.stream().filter(s -> s.getBuocIndex() == index).findFirst().orElse(null);
    }

    /** Port từ webapp/src/data/dossiers.ts::nextHoSoId — HS-<year>-<seq3>. */
    private String nextHoSoId() {
        int year = LocalDate.now().getYear();
        int max = 0;
        for (HoSo h : hoSoRepository.findAll()) {
            Matcher m = HO_SO_ID_SEQ.matcher(h.getId());
            if (m.matches()) {
                max = Math.max(max, Integer.parseInt(m.group(1)));
            }
        }
        return "HS-%d-%03d".formatted(year, max + 1);
    }
}

package vn.vht.qtkhcn.hoso.service;

import jakarta.persistence.EntityNotFoundException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.hoso.domain.Cap;
import vn.vht.qtkhcn.hoso.domain.HoSo;
import vn.vht.qtkhcn.hoso.domain.NhiemVu;
import vn.vht.qtkhcn.hoso.domain.TaiLieu;
import vn.vht.qtkhcn.hoso.repository.HoSoRepository;
import vn.vht.qtkhcn.hoso.repository.NhiemVuRepository;

/** Business validation owned by the dossier aggregate for RD02.02's Check service task. */
@Service
public class Rd0202DefaultConditionService {
    private final HoSoRepository hoSoRepository;
    private final NhiemVuRepository nhiemVuRepository;

    public Rd0202DefaultConditionService(HoSoRepository hoSoRepository,
            NhiemVuRepository nhiemVuRepository) {
        this.hoSoRepository = hoSoRepository;
        this.nhiemVuRepository = nhiemVuRepository;
    }

    @Transactional(readOnly = true)
    public ValidationResult validate(String hoSoId) {
        HoSo hoSo = hoSoRepository.findById(hoSoId)
                .orElseThrow(() -> new EntityNotFoundException("Khong tim thay HoSo " + hoSoId));
        NhiemVu nhiemVu = nhiemVuRepository.findById(hoSo.getMaNV())
                .orElseThrow(() -> new EntityNotFoundException("Khong tim thay NhiemVu " + hoSo.getMaNV()));

        List<String> reasons = new ArrayList<>();
        if (nhiemVu.getCap() != Cap.TD) reasons.add("Nhiệm vụ chưa có cấp Tập đoàn.");
        if (blank(nhiemVu.getThoiGianThucHien())) reasons.add("Thiếu thời gian thực hiện.");
        if (blank(nhiemVu.getDuToan())) reasons.add("Thiếu dự toán nhiệm vụ.");
        if (nhiemVu.getChuNhiem() == null || blank(nhiemVu.getChuNhiem().getHoTen())
                || blank(nhiemVu.getChuNhiem().getMaNhanVien())) {
            reasons.add("Thiếu thông tin nhân sự đăng ký chủ trì.");
        }
        if (blank(nhiemVu.getDonViChuTri())) reasons.add("Thiếu đơn vị chủ trì.");

        List<TaiLieu> evidence = hoSo.getTaiLieu().stream().filter(Rd0202DefaultConditionService::validEvidence).toList();
        if (evidence.isEmpty()) {
            reasons.add("Thiếu tài liệu HSXD có nội dung tệp để kiểm tra thể thức và làm minh chứng.");
        }
        return new ValidationResult(reasons.isEmpty(), List.copyOf(reasons));
    }

    private static boolean validEvidence(TaiLieu document) {
        return !blank(document.getTen()) && !blank(document.getContentType())
                && !blank(document.getStorageKey()) && document.getSizeBytes() != null
                && document.getSizeBytes() > 0;
    }

    private static boolean blank(String value) { return value == null || value.isBlank(); }

    public record ValidationResult(boolean valid, List<String> reasons) {}
}

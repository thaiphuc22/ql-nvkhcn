package vn.vht.qtkhcn.hoso.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.hoso.domain.DossierStep;
import vn.vht.qtkhcn.hoso.domain.HoSo;
import vn.vht.qtkhcn.hoso.domain.HoiDongCap;
import vn.vht.qtkhcn.hoso.domain.HoiDongXetDuyet;
import vn.vht.qtkhcn.hoso.domain.TaiLieu;
import vn.vht.qtkhcn.hoso.domain.ThanhVienHoiDong;
import vn.vht.qtkhcn.hoso.repository.HoSoRepository;
import vn.vht.qtkhcn.hoso.repository.HoiDongXetDuyetRepository;
import vn.vht.qtkhcn.hoso.repository.TaiLieuRepository;

/**
 * Sinh Hội đồng xét duyệt (HĐXD) cấp Cơ sở ngay sau khi QĐ thành lập được ký (T06 trong
 * RD02.02), đọc formData đã lưu ở bước T05 (V8). Được gọi từ service task BPMN
 * "Generate_HDXD" qua API nội bộ — PHẢI idempotent vì Zeebe có thể gọi lại job khi retry.
 */
@Service
public class HoiDongXetDuyetService {
    private static final String TASK_LAP_QD_CO_SO = "T05";
    private static final String TASK_LAP_QD_TAP_DOAN = "T18B";

    private final HoSoRepository hoSoRepository;
    private final HoiDongXetDuyetRepository hoiDongRepository;
    private final TaiLieuRepository taiLieuRepository;
    private final DocumentStorageService storage;
    private final ObjectMapper json;

    public HoiDongXetDuyetService(HoSoRepository hoSoRepository, HoiDongXetDuyetRepository hoiDongRepository,
            TaiLieuRepository taiLieuRepository, DocumentStorageService storage, ObjectMapper json) {
        this.hoSoRepository = hoSoRepository;
        this.hoiDongRepository = hoiDongRepository;
        this.taiLieuRepository = taiLieuRepository;
        this.storage = storage;
        this.json = json;
    }

    @Transactional
    public HoiDongXetDuyet sinhTuBuoc05(String hoSoId) {
        return sinh(hoSoId, HoiDongCap.CO_SO, TASK_LAP_QD_CO_SO, "cấp Cơ sở", "co-so");
    }

    /** Cấp Tập đoàn: cùng mẫu QĐ (bm-02-08-qdh-nv), ký ở T18B, dùng cho Hội đồng họp T21/T24. */
    @Transactional
    public HoiDongXetDuyet sinhTuBuoc18B(String hoSoId) {
        return sinh(hoSoId, HoiDongCap.TAP_DOAN, TASK_LAP_QD_TAP_DOAN, "cấp Tập đoàn", "tap-doan");
    }

    public List<ThanhVienHoiDong> thanhVienTheoCap(String hoSoId, HoiDongCap cap) {
        return hoiDongRepository.findByHoSoIdAndCapOrderByCreatedAtAsc(hoSoId, cap).stream()
                .flatMap(hoiDong -> hoiDong.getThanhVien().stream())
                .toList();
    }

    /**
     * Danh sách định danh tài khoản của hội đồng — nguồn cho {@code candidateUsers} của các user task
     * họp hội đồng. Thành viên chưa gắn tài khoản (QĐ chỉ ghi họ tên) bị loại thay vì đẩy chuỗi rỗng
     * xuống dưới; danh sách rỗng là tín hiệu hợp lệ, nghĩa là "không thu hẹp được, cứ theo vai trò".
     */
    public List<String> userIdTheoCap(String hoSoId, HoiDongCap cap) {
        return thanhVienTheoCap(hoSoId, cap).stream()
                .map(ThanhVienHoiDong::getUserId)
                .filter(userId -> userId != null && !userId.isBlank())
                .distinct()
                .toList();
    }

    /**
     * Dịch {@code candidateGroups} của một user task thành danh sách người thật của ĐÚNG hồ sơ đó.
     *
     * <p>Đây là nơi duy nhất trong hệ thống biết "nhóm HDXD ứng với hội đồng cấp Cơ sở, HDXD_TD ứng
     * với cấp Tập đoàn" — backend chỉ chuyển tiếp nguyên si candidateGroups đọc từ Camunda và không
     * cần biết gì về RD02.02. Nhóm không phải hội đồng bị bỏ qua; kết quả rỗng nghĩa là bước này
     * không thu hẹp được và giữ nguyên phạm vi theo vai trò (fail-open có chủ đích cho hồ sơ cũ,
     * xem luật thu hẹp ở {@code WorkflowTaskProjectionRepository}).</p>
     */
    public List<String> candidateUsersTheoNhom(String hoSoId, Collection<String> candidateGroups) {
        if (candidateGroups == null || candidateGroups.isEmpty()) return List.of();
        return candidateGroups.stream()
                .map(HoiDongCap::theoRoleCode)
                .flatMap(Optional::stream)
                .distinct()
                .flatMap(cap -> userIdTheoCap(hoSoId, cap).stream())
                .distinct()
                .toList();
    }

    private HoiDongXetDuyet sinh(String hoSoId, HoiDongCap cap, String taskDefinitionKey, String tenCap,
            String fileSlug) {
        var existing = hoiDongRepository
                .findByHoSoIdAndCapAndSourceTaskDefinitionKey(hoSoId, cap, taskDefinitionKey);
        if (existing.isPresent()) return existing.get();

        HoSo hoSo = hoSoRepository.findById(hoSoId)
                .orElseThrow(() -> new EntityNotFoundException("Khong tim thay HoSo " + hoSoId));
        DossierStep step = hoSo.getSteps().stream()
                .filter(candidate -> taskDefinitionKey.equals(candidate.getTaskDefinitionKey()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "HoSo " + hoSoId + " chua co buoc " + taskDefinitionKey + "."));
        String formDataJson = step.getFormDataJson();
        if (formDataJson == null || formDataJson.isBlank()) {
            throw new IllegalStateException(
                    "Buoc " + taskDefinitionKey + " cua HoSo " + hoSoId + " chua co formData de sinh HDXD.");
        }

        HoiDongXetDuyet hoiDong = build(hoSoId, cap, taskDefinitionKey, parse(formDataJson));
        try {
            hoiDong = hoiDongRepository.saveAndFlush(hoiDong);
        } catch (DataIntegrityViolationException race) {
            return hoiDongRepository
                    .findByHoSoIdAndCapAndSourceTaskDefinitionKey(hoSoId, cap, taskDefinitionKey)
                    .orElseThrow(() -> race);
        }

        attachGeneratedDocument(hoSo, hoiDong, tenCap, fileSlug);
        return hoiDong;
    }

    private static HoiDongXetDuyet build(String hoSoId, HoiDongCap cap, String taskDefinitionKey, JsonNode form) {
        HoiDongXetDuyet hoiDong = new HoiDongXetDuyet();
        hoiDong.setHoSoId(hoSoId);
        hoiDong.setMaHoiDong(maHoiDongTuDong(hoSoId, cap));
        hoiDong.setCap(cap);
        hoiDong.setSourceTaskDefinitionKey(taskDefinitionKey);
        hoiDong.setCanCuPhapLy(blankToNull(text(form, "canCuPhapLy")));
        hoiDong.setCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));
        for (JsonNode item : form.path("danhSachThanhVien")) {
            ThanhVienHoiDong member = new ThanhVienHoiDong();
            member.setHoiDong(hoiDong);
            member.setHoTen(text(item, "hoTen"));
            // Chuẩn hoá về chữ thường ngay tại đây: mọi phép so khớp downstream (authorize(),
            // truy vấn worklist) đều so chuỗi thô với X-QTKHCN-User-Id vốn đã được lowercase.
            member.setUserId(blankToNull(text(item, "userId").toLowerCase(Locale.ROOT)));
            member.setVaiTroTrongHoiDong(blankToNull(text(item, "vaiTroTrongHoiDong")));
            hoiDong.getThanhVien().add(member);
        }
        return hoiDong;
    }

    private void attachGeneratedDocument(HoSo hoSo, HoiDongXetDuyet hoiDong, String tenCap, String fileSlug) {
        String html = renderQuyetDinhHtml(hoSo, hoiDong, tenCap);
        DocumentStorageService.StoredFile stored = storage.storeGenerated(html.getBytes(StandardCharsets.UTF_8));

        TaiLieu taiLieu = new TaiLieu();
        taiLieu.setHoSo(hoSo);
        taiLieu.setTen("QD-thanh-lap-HDXD-" + fileSlug + ".html");
        taiLieu.setLoai("QuyetDinh");
        taiLieu.setContentType("text/html; charset=UTF-8");
        taiLieu.setSizeBytes(stored.sizeBytes());
        taiLieu.setStorageKey(stored.storageKey());
        taiLieu.setUploadedAt(OffsetDateTime.now(ZoneOffset.UTC));
        taiLieuRepository.saveAndFlush(taiLieu);
    }

    private static String renderQuyetDinhHtml(HoSo hoSo, HoiDongXetDuyet hoiDong, String tenCap) {
        StringBuilder members = new StringBuilder();
        for (ThanhVienHoiDong member : hoiDong.getThanhVien()) {
            members.append("<tr><td>").append(escape(member.getHoTen())).append("</td><td>")
                    .append(escape(member.getVaiTroTrongHoiDong())).append("</td></tr>");
        }
        return "<!doctype html><html><head><meta charset=\"UTF-8\"><title>Quyet dinh thanh lap HDXD</title></head>"
                + "<body>"
                + "<h2>QUYẾT ĐỊNH</h2>"
                + "<h3>Về việc thành lập Hội đồng xét duyệt " + escape(tenCap) + "</h3>"
                + "<p><b>Hồ sơ:</b> " + escape(hoSo.getId()) + "</p>"
                + "<p><b>Căn cứ ban hành:</b> " + escape(hoiDong.getCanCuPhapLy()) + "</p>"
                + "<table border=\"1\" cellspacing=\"0\" cellpadding=\"4\">"
                + "<tr><th>Họ và tên</th><th>Vai trò trong Hội đồng</th></tr>"
                + members
                + "</table>"
                + "</body></html>";
    }

    private JsonNode parse(String formDataJson) {
        try { return json.readTree(formDataJson); }
        catch (Exception invalid) {
            throw new IllegalStateException("DossierStep.formDataJson khong hop le.", invalid);
        }
    }

    /** Mã hội đồng cho luồng tự sinh — không có form nhập, nên suy ra từ hoSoId + cấp (ổn định qua các lần retry). */
    private static String maHoiDongTuDong(String hoSoId, HoiDongCap cap) {
        String goc = hoSoId.startsWith("HS-") ? "HD-" + hoSoId.substring(3) : "HD-" + hoSoId;
        return goc + (cap == HoiDongCap.CO_SO ? "-CS" : "-TD");
    }

    private static String text(JsonNode node, String name) { return node.path(name).asText("").trim(); }
    private static String blankToNull(String value) { return value == null || value.isBlank() ? null : value; }
    private static String escape(String value) {
        return value == null ? "" : value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}

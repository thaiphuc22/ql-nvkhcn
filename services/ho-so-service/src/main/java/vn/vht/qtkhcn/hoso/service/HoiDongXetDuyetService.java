package vn.vht.qtkhcn.hoso.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
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
        hoiDong.setCap(cap);
        hoiDong.setSourceTaskDefinitionKey(taskDefinitionKey);
        hoiDong.setCanCuPhapLy(blankToNull(text(form, "canCuPhapLy")));
        hoiDong.setCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));
        for (JsonNode item : form.path("danhSachThanhVien")) {
            ThanhVienHoiDong member = new ThanhVienHoiDong();
            member.setHoiDong(hoiDong);
            member.setHoTen(text(item, "hoTen"));
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

    private static String text(JsonNode node, String name) { return node.path(name).asText("").trim(); }
    private static String blankToNull(String value) { return value == null || value.isBlank() ? null : value; }
    private static String escape(String value) {
        return value == null ? "" : value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}

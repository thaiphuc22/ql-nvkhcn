package vn.vht.qtkhcn.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.CatalogOptionResponse;

/**
 * Danh mục mã vai trò dùng chung. Trước đây danh sách này nằm private trong
 * {@link ActionStudioService#referenceData()}, nên màn đối soát quy trình không có cách nào biết
 * {@code candidateGroups} trong BPMN có phải vai trò thật hay không — người vẽ gõ nhầm "TD_KHCN"
 * thay vì "TP_CLKHCN" thì task tạo ra nhưng không ai nhìn thấy để xử lý.
 *
 * <p>Giữ static thay vì bean: đây là hằng số nghiệp vụ, và biến nó thành bean sẽ kéo theo đổi chữ ký
 * constructor của {@code ActionStudioService} (7 test dựng bằng tay) mà không đổi được gì về hành vi.
 *
 * <p><b>Giới hạn đã biết:</b> danh sách hardcode, chưa nối vào nguồn danh mục vai trò thật (chưa có
 * bảng/dịch vụ nào giữ nó). Vì thế nơi dùng phải coi "mã lạ" là CẢNH BÁO, không phải lỗi chặn.
 */
public final class RoleCatalog {
    private static final Map<String, String> ROLES = roles();

    private RoleCatalog() {
    }

    /** Mọi mã vai trò hợp lệ. */
    public static Set<String> codes() {
        return ROLES.keySet();
    }

    public static boolean isKnown(String code) {
        return code != null && ROLES.containsKey(code.trim());
    }

    public static List<CatalogOptionResponse> options() {
        return ROLES.entrySet().stream()
                .map(entry -> new CatalogOptionResponse(entry.getKey(), entry.getValue()))
                .toList();
    }

    private static Map<String, String> roles() {
        Map<String, String> map = new LinkedHashMap<>();
        map.put("PM", "Chủ nhiệm đề tài");
        map.put("PA", "Trợ lý đề tài");
        map.put("NNC", "Người nghiên cứu");
        map.put("TD", "Phòng Thẩm định");
        map.put("TCKT", "Phòng Tài chính - Kế toán");
        map.put("LD", "Lãnh đạo");
        map.put("ADMIN", "Quản trị hệ thống");
        map.put("CQ_KHCN", "Chuyên quản KHCN");
        map.put("CQ_MS", "Chuyên quản Mua sắm");
        map.put("CQ_NS", "Chuyên quản Nhân sự");
        map.put("CQ_TCKT", "Chuyên quản TCKT");
        map.put("TP_CLKHCN", "Trưởng phòng CLKHCN");
        map.put("TP_TCKT", "Trưởng phòng TCKT");
        map.put("TP_NS", "Trưởng phòng Nhân sự");
        map.put("GD_TTMS", "Giám đốc TT Mua sắm");
        map.put("BGD_TT", "BGĐ Trung tâm");
        map.put("BGD_KHOI", "BGĐ Khối");
        map.put("CQ_QLKHCN", "Cơ quan QLKHCN");
        map.put("HDKHCN", "Hội đồng KHCN VHT");
        map.put("HDXD", "Hội đồng Xét duyệt");
        map.put("HDXD_DC", "Hội đồng Xét duyệt điều chỉnh");
        map.put("HDNT", "Hội đồng Nghiệm thu");
        map.put("HD_DGHT", "Hội đồng Đánh giá hoàn thành");
        map.put("PTGD_CT", "Phó TGĐ Chuyên trách");
        map.put("TGD_VHT", "Tổng Giám đốc VHT");
        map.put("CQ_KHCN_TD", "Cơ quan KHCN Tập đoàn");
        map.put("CQNV_TD", "Cơ quan nghiệp vụ Tập đoàn");
        map.put("HDKHCN_TD", "Hội đồng KHCN Tập đoàn");
        map.put("HDXD_TD", "Hội đồng Xét duyệt Tập đoàn");
        map.put("HDNT_TD", "Hội đồng Nghiệm thu Tập đoàn");
        map.put("BTGD_TD", "Ban TGĐ Tập đoàn");
        // unmodifiableMap chứ không phải Map.copyOf: Map.copyOf không giữ thứ tự chèn, mà thứ tự này
        // chính là thứ tự hiển thị trong dropdown vai trò của Ma trận Hành động.
        return java.util.Collections.unmodifiableMap(map);
    }
}

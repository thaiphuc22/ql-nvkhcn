package vn.vht.qtkhcn.hoso.domain;

import java.util.Locale;
import java.util.Optional;

public enum HoiDongCap {
    CO_SO("HDXD"),
    TAP_DOAN("HDXD_TD");

    /**
     * Mã vai trò (candidateGroup trong BPMN) tương ứng với cấp hội đồng này.
     *
     * <p>Đây là bản lề giữa hai lớp của mô hình phân quyền: vai trò là danh mục TĨNH ("người này đủ
     * tư cách ngồi hội đồng xét duyệt cấp đó"), còn tư cách thành viên là dữ liệu ĐỘNG theo từng hồ
     * sơ. Một bước BPMN khai {@code candidateGroups="HDXD"} tự nó chỉ nói được vế tĩnh; ánh xạ này
     * cho phép ho-so-service dịch tiếp sang vế động — "hội đồng cấp Cơ sở của đúng hồ sơ này".</p>
     */
    private final String roleCode;

    HoiDongCap(String roleCode) {
        this.roleCode = roleCode;
    }

    public String roleCode() {
        return roleCode;
    }

    /** Rỗng khi mã vai trò không phải nhóm hội đồng — nghĩa là bước đó không có gì để thu hẹp. */
    public static Optional<HoiDongCap> theoRoleCode(String code) {
        if (code == null || code.isBlank()) return Optional.empty();
        String normalized = code.trim().toUpperCase(Locale.ROOT);
        for (HoiDongCap cap : values()) {
            if (cap.roleCode.equals(normalized)) return Optional.of(cap);
        }
        return Optional.empty();
    }
}

package vn.vht.qtkhcn.domain;

/** Giai đoạn vòng đời NV KHCN (RD01→RD06). Port từ webapp/src/data/nhiemVu.ts::GiaiDoan. */
public enum GiaiDoan {
    CHU_TRUONG("Chủ trương"),
    XET_DUYET("Xét duyệt"),
    THUC_HIEN("Thực hiện"),
    DIEU_CHINH("Điều chỉnh"),
    NGHIEM_THU("Nghiệm thu"),
    QUYET_TOAN("Quyết toán");

    private final String label;

    GiaiDoan(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }
}

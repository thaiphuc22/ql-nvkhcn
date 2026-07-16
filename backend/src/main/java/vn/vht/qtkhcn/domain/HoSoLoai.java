package vn.vht.qtkhcn.domain;

/** Loại hồ sơ theo giai đoạn (RD01→RD06). Port từ webapp/src/data/dossiers.ts::HoSoLoai. */
public enum HoSoLoai {
    CHU_TRUONG("Chủ trương", "RD01", GiaiDoan.CHU_TRUONG),
    XET_DUYET("Xét duyệt", "RD02", GiaiDoan.XET_DUYET),
    BAO_CAO("Báo cáo", "RD03", GiaiDoan.THUC_HIEN),
    DIEU_CHINH("Điều chỉnh", "RD04", GiaiDoan.DIEU_CHINH),
    NGHIEM_THU("Nghiệm thu", "RD05", GiaiDoan.NGHIEM_THU),
    QUYET_TOAN("Quyết toán", "RD06", GiaiDoan.QUYET_TOAN);

    private final String label;
    /** Nhóm quy trình (data/processes.ts::NHOM) — lọc quy trình khả dụng khi "Gửi duyệt". */
    private final String nhomQuyTrinh;
    private final GiaiDoan giaiDoan;

    HoSoLoai(String label, String nhomQuyTrinh, GiaiDoan giaiDoan) {
        this.label = label;
        this.nhomQuyTrinh = nhomQuyTrinh;
        this.giaiDoan = giaiDoan;
    }

    public String label() {
        return label;
    }

    public String nhomQuyTrinh() {
        return nhomQuyTrinh;
    }

    public GiaiDoan giaiDoan() {
        return giaiDoan;
    }
}

package vn.vht.qtkhcn.domain;

/** Port từ webapp/src/data/dossiers.ts::DossierStatus. */
public enum DossierStatus {
    DRAFT("Khởi tạo"),
    PROCESSING("Đang xử lý"),
    APPROVED("Đã phê duyệt"),
    REJECTED("Bị từ chối");

    private final String label;

    DossierStatus(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }
}

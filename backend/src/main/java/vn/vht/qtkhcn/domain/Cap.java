package vn.vht.qtkhcn.domain;

/**
 * Cấp nhiệm vụ. Slug ("CS"/"TD") khớp process variable {@code cap} trong
 * webapp/src/data/variableContract.ts — KHÔNG tự đổi giá trị, đây là contract dùng chung với BPMN.
 */
public enum Cap {
    CS("Cơ sở"),
    TD("Tập đoàn");

    private final String label;

    Cap(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }
}

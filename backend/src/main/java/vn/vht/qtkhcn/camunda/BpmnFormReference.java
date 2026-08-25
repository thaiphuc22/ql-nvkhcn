package vn.vht.qtkhcn.camunda;

import org.w3c.dom.Element;

/**
 * Tham chiếu biểu mẫu của một {@code userTask}, giải mã từ {@code <zeebe:formDefinition>}.
 *
 * <p><b>Vì sao cần lớp này</b> — trước đây hai chỗ đọc runtime
 * ({@link BpmnUserTaskMetadataCatalog}, {@code DeployedBpmnRoutingReader}) đều lấy đúng attribute
 * {@code formKey}. Nhưng khi khách khai eForm THẲNG trên Camunda rồi gắn vào task, Modeler 8.9 ghi
 * {@code formId} (linked form) chứ không phải {@code formKey} — nên cả hai trả rỗng, scaffold không
 * ghim được form vào bước nào và màn Chi tiết Hồ sơ bấm nút ra form trống.
 * {@code ProcessDefinitionImportValidator} vốn ĐÃ biết cả hai attribute, chỉ hai reader thật là
 * chưa — dấu hiệu nhánh {@code formId} chưa từng chạy end-to-end.
 *
 * <p>Bốn dạng, phân biệt vì chúng lấy schema từ NƠI KHÁC NHAU:
 * <ul>
 *   <li>{@link Kind#APP} — {@code formKey="phieu-chu-truong"}: khoá biểu mẫu của chính app, dạng các
 *       BPMN bundled đang dùng. Schema nằm sẵn ở bảng {@code eform}.</li>
 *   <li>{@link Kind#EMBEDDED} — {@code formKey="camunda-forms:bpmn:UserTaskForm_1"}: schema nằm ngay
 *       trong BPMN XML (thẻ {@code <zeebe:userTaskForm>} cấp process), app đã lưu sẵn XML nên hút
 *       được lúc đồng bộ, không cần gọi engine.</li>
 *   <li>{@link Kind#LINKED} — {@code formId="approval-form"}: schema nằm ở resource {@code .form}
 *       deploy riêng trên engine. Camunda 8.9 KHÔNG có API lấy form theo id (đã probe thật:
 *       {@code /v2/forms/{key}} không tồn tại) — chỉ lấy được qua một user task ĐANG CHẠY. Vì vậy
 *       nhánh này bắt buộc phải hydrate lười lúc runtime, không hút được lúc đồng bộ.</li>
 *   <li>{@link Kind#EXTERNAL} — {@code externalReference}: form nằm ngoài Camunda. App không render
 *       được, {@link #formKey()} trả null có chủ ý.</li>
 * </ul>
 */
public record BpmnFormReference(Kind kind, String id) {

    public enum Kind { APP, EMBEDDED, LINKED, EXTERNAL }

    /** Tiền tố Camunda dùng để trỏ {@code formKey} về một form nhúng trong chính BPMN. */
    public static final String EMBEDDED_PREFIX = "camunda-forms:bpmn:";

    public static final BpmnFormReference NONE = new BpmnFormReference(null, null);

    /**
     * Khoá app dùng để tra bảng {@code eform} và ghim vào {@code action_availability_policy.form_key}.
     *
     * <p>Giữ NGUYÊN VĂN id của Camunda, không hạ chữ thường: {@code eformRepository.findById} là so
     * khớp chính xác, mà id trong BPMN thì phân biệt hoa thường. Hạ chữ thường ở đây (theo thói quen
     * của {@code EformService.create}) sẽ làm khoá ghim lúc scaffold lệch với khoá tra lúc chạy.
     */
    public String formKey() {
        return kind == null || kind == Kind.EXTERNAL ? null : id;
    }

    public static BpmnFormReference of(Element formDefinition) {
        if (formDefinition == null) return NONE;
        String formKey = attribute(formDefinition, "formKey");
        if (!formKey.isEmpty()) {
            return formKey.startsWith(EMBEDDED_PREFIX)
                    ? new BpmnFormReference(Kind.EMBEDDED, formKey.substring(EMBEDDED_PREFIX.length()))
                    : new BpmnFormReference(Kind.APP, formKey);
        }
        String formId = attribute(formDefinition, "formId");
        if (!formId.isEmpty()) return new BpmnFormReference(Kind.LINKED, formId);
        String external = attribute(formDefinition, "externalReference");
        if (!external.isEmpty()) return new BpmnFormReference(Kind.EXTERNAL, external);
        return NONE;
    }

    private static String attribute(Element element, String name) {
        String value = element.getAttribute(name);
        return value == null ? "" : value.trim();
    }
}

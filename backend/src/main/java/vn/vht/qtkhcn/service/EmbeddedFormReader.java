package vn.vht.qtkhcn.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import vn.vht.qtkhcn.camunda.BpmnFormReference;

/**
 * Bóc biểu mẫu NHÚNG ra khỏi BPMN XML.
 *
 * <p>Form nhúng (khách bấm "Create new form" ngay trong Modeler) nằm luôn trong file BPMN dưới dạng
 * {@code <zeebe:userTaskForm id="UserTaskForm_1">{...json form-js...}</zeebe:userTaskForm>} ở
 * {@code extensionElements} cấp process, còn task trỏ tới nó bằng
 * {@code formKey="camunda-forms:bpmn:UserTaskForm_1"}.
 *
 * <p><b>Vì sao nhánh này rẻ hơn hẳn linked form:</b> app ĐÃ lưu sẵn BPMN XML ở
 * {@code process_definition_version.bpmn_xml}, nên lấy được schema ngay lúc đồng bộ, không gọi
 * engine, và có mặt TRƯỚC khi scaffold chạy. Linked form thì Camunda 8.9 chỉ trả schema qua một user
 * task đang chạy, nên bắt buộc hydrate lười lúc runtime — xem {@link BpmnFormReference}.
 */
final class EmbeddedFormReader {

    private static final String BPMN_NS = "http://www.omg.org/spec/BPMN/20100524/MODEL";

    private EmbeddedFormReader() {
    }

    /**
     * @param id         id nguyên văn trong BPMN, cũng là khoá dùng để tra bảng {@code eform}
     * @param schemaJson thân JSON của thẻ — schema form-js, đúng thứ FormRendererComponent render
     * @param ten        tên hiển thị: lấy tên bước dùng biểu mẫu này, không có thì lấy chính id
     */
    record EmbeddedForm(String id, String schemaJson, String ten) {
    }

    static List<EmbeddedForm> parse(String bpmnXml) {
        try {
            Document document = SecureXml.parse(bpmnXml);
            Map<String, String> tenByFormId = taskNamesByEmbeddedFormId(document);
            List<EmbeddedForm> forms = new ArrayList<>();
            for (Element element : elements(document, "userTaskForm")) {
                String id = element.getAttribute("id").trim();
                String schema = element.getTextContent();
                // Thẻ không id thì không task nào trỏ tới được; thân rỗng thì không có gì để render.
                if (id.isEmpty() || schema == null || schema.isBlank()) continue;
                forms.add(new EmbeddedForm(id, schema.trim(), tenByFormId.getOrDefault(id, id)));
            }
            return List.copyOf(forms);
        } catch (Exception exception) {
            throw new IllegalArgumentException("Không đọc được biểu mẫu nhúng trong BPMN.", exception);
        }
    }

    private static Map<String, String> taskNamesByEmbeddedFormId(Document document) {
        Map<String, String> names = new HashMap<>();
        for (Element task : elements(document, "userTask")) {
            // Chỉ lấy userTask của chính mô hình BPMN. Modeler gắn thêm marker `<zeebe:userTask />`
            // trùng tên cục bộ trong extensionElements — cùng cái bẫy đã ghi ở DeployedBpmnRoutingReader.
            if (task.getNamespaceURI() != null && !BPMN_NS.equals(task.getNamespaceURI())) continue;
            List<Element> definitions = elements(task, "formDefinition");
            if (definitions.isEmpty()) continue;
            BpmnFormReference reference = BpmnFormReference.of(definitions.get(0));
            if (reference.kind() != BpmnFormReference.Kind.EMBEDDED) continue;
            String ten = task.getAttribute("name").trim();
            if (!ten.isEmpty()) names.putIfAbsent(reference.id(), ten);
        }
        return names;
    }

    private static List<Element> elements(Object root, String localName) {
        NodeList nodes = root instanceof Document document
                ? document.getElementsByTagNameNS("*", localName)
                : ((Element) root).getElementsByTagNameNS("*", localName);
        List<Element> result = new ArrayList<>();
        for (int i = 0; i < nodes.getLength(); i++) result.add((Element) nodes.item(i));
        return result;
    }
}

package vn.vht.qtkhcn.camunda;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import org.springframework.stereotype.Component;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import vn.vht.qtkhcn.domain.ProcessDefinitionVersion;
import vn.vht.qtkhcn.repository.ProcessDefinitionVersionRepository;

/**
 * Tên bước, assignee/candidate và form key — những thứ response element-instance/job của Camunda
 * KHÔNG trả về. Nguồn duy nhất: BPMN XML của bản đã deploy, lưu trong {@code process_definition_version}.
 *
 * <p>Trước Lát 3, lớp này có thêm một nhánh dự phòng đọc thẳng {@code processes/rd0101.bpmn} trong
 * classpath khi catalog không có dòng nào cho RD01.01. Nhánh đó tồn tại vì
 * {@code ProcessDeploymentRunner} deploy RD01.01 lên Zeebe nhưng chỉ đồng bộ catalog cho RD02.02.
 * Nay runner đồng bộ cả hai, nên nhánh dự phòng bị bỏ: nó đặc cách đúng một quy trình bundled, che
 * mất chính lỗi "quy trình chạy trên engine nhưng vô hình với app" mà Lát 1 sinh ra nút đồng bộ để
 * xử lý — và với quy trình người dùng tự vẽ thì nó chẳng giúp được gì.
 */
@Component
public class BpmnUserTaskMetadataCatalog {
    private static final String BPMN_NS = "http://www.omg.org/spec/BPMN/20100524/MODEL";

    private final ProcessDefinitionVersionRepository versions;
    private final Map<Long, Map<String, UserTaskMetadata>> cache = new ConcurrentHashMap<>();

    public BpmnUserTaskMetadataCatalog(ProcessDefinitionVersionRepository versions) {
        this.versions = versions;
    }

    public UserTaskMetadata resolve(long processDefinitionKey, String elementId) {
        Map<String, UserTaskMetadata> parsed = cache.get(processDefinitionKey);
        if (parsed == null) {
            parsed = load(processDefinitionKey);
            // CHỈ cache kết quả có nội dung. Cache cả map rỗng thì một lượt tra trước khi quy trình
            // được hút về catalog (nút "Đồng bộ từ Camunda", Lát 1) sẽ đóng băng trạng thái "không
            // biết bước nào" đến hết vòng đời tiến trình — mọi bước hiện ra không tên, không role.
            if (!parsed.isEmpty()) cache.put(processDefinitionKey, parsed);
        }
        return parsed.getOrDefault(elementId, UserTaskMetadata.EMPTY);
    }

    private Map<String, UserTaskMetadata> load(long processDefinitionKey) {
        return versions.findByCamundaProcessDefinitionKey(processDefinitionKey)
                .map(ProcessDefinitionVersion::getBpmnXml)
                .filter(xml -> xml != null && !xml.isBlank())
                .map(BpmnUserTaskMetadataCatalog::parse)
                .orElseGet(Map::of);
    }

    static Map<String, UserTaskMetadata> parse(String xml) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
            factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
            factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
            factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");
            var document = factory.newDocumentBuilder().parse(
                    new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));
            Map<String, UserTaskMetadata> result = new java.util.LinkedHashMap<>();
            NodeList tasks = document.getElementsByTagNameNS(BPMN_NS, "userTask");
            for (int i = 0; i < tasks.getLength(); i++) {
                Element task = (Element) tasks.item(i);
                Element assignment = descendant(task, "assignmentDefinition");
                // Không đọc thẳng attribute `formKey` nữa: form khai trên Camunda rồi gắn vào task
                // sinh ra `formId`, xem BpmnFormReference.
                String formKey = BpmnFormReference.of(descendant(task, "formDefinition")).formKey();
                result.put(task.getAttribute("id"), new UserTaskMetadata(
                        task.getAttribute("name"),
                        attribute(assignment, "assignee"),
                        csv(attribute(assignment, "candidateUsers")),
                        csv(attribute(assignment, "candidateGroups")),
                        formKey == null ? "" : formKey));
            }
            return Map.copyOf(result);
        } catch (Exception e) {
            throw new IllegalArgumentException("BPMN XML không hợp lệ khi đọc user-task metadata.", e);
        }
    }

    private static Element descendant(Element parent, String localName) {
        NodeList nodes = parent.getElementsByTagNameNS("*", localName);
        return nodes.getLength() == 0 ? null : (Element) nodes.item(0);
    }

    private static String attribute(Element element, String name) {
        return element == null ? "" : element.getAttribute(name).trim();
    }

    private static List<String> csv(String value) {
        if (value == null || value.isBlank()) return List.of();
        return Arrays.stream(value.split(","))
                .map(String::trim).filter(item -> !item.isEmpty()).toList();
    }

    public record UserTaskMetadata(String name, String assignee, List<String> candidateUsers,
            List<String> candidateGroups, String formKey) {
        static final UserTaskMetadata EMPTY = new UserTaskMetadata("", "", List.of(), List.of(), "");

        public UserTaskMetadata {
            candidateUsers = List.copyOf(candidateUsers);
            candidateGroups = List.copyOf(candidateGroups);
        }
    }
}

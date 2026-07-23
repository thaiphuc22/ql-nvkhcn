package vn.vht.qtkhcn.camunda;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import vn.vht.qtkhcn.repository.ProcessDefinitionVersionRepository;

/**
 * Resolves assignment and form metadata which is not present on Camunda element-instance/job search
 * responses. The deployed BPMN catalog is preferred; the bundled RD01.01 resource covers the startup
 * deployment which intentionally predates a catalog import row.
 */
@Component
public class BpmnUserTaskMetadataCatalog {
    private static final String BPMN_NS = "http://www.omg.org/spec/BPMN/20100524/MODEL";
    private static final String BUNDLED_RD0101 = "processes/rd0101.bpmn";

    private final ProcessDefinitionVersionRepository versions;
    private final Map<Long, Map<String, UserTaskMetadata>> cache = new ConcurrentHashMap<>();

    public BpmnUserTaskMetadataCatalog(ProcessDefinitionVersionRepository versions) {
        this.versions = versions;
    }

    public UserTaskMetadata resolve(long processDefinitionKey, String processDefinitionId, String elementId) {
        return cache.computeIfAbsent(processDefinitionKey,
                        ignored -> load(processDefinitionKey, processDefinitionId))
                .getOrDefault(elementId, UserTaskMetadata.EMPTY);
    }

    private Map<String, UserTaskMetadata> load(long processDefinitionKey, String processDefinitionId) {
        Optional<String> catalogXml = versions.findByCamundaProcessDefinitionKey(processDefinitionKey)
                .map(item -> item.getBpmnXml());
        if (catalogXml.isPresent()) {
            return parse(catalogXml.get());
        }
        if ("RD01_01".equals(processDefinitionId)) {
            try {
                return parse(new String(new ClassPathResource(BUNDLED_RD0101)
                        .getInputStream().readAllBytes(), StandardCharsets.UTF_8));
            } catch (Exception e) {
                throw new IllegalStateException("Không đọc được BPMN bundled " + BUNDLED_RD0101, e);
            }
        }
        return Map.of();
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
                Element form = descendant(task, "formDefinition");
                result.put(task.getAttribute("id"), new UserTaskMetadata(
                        task.getAttribute("name"),
                        attribute(assignment, "assignee"),
                        csv(attribute(assignment, "candidateUsers")),
                        csv(attribute(assignment, "candidateGroups")),
                        attribute(form, "formKey")));
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

package vn.vht.qtkhcn.service;

import java.io.StringReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import vn.vht.qtkhcn.domain.ProcessDefinitionCatalog;
import vn.vht.qtkhcn.domain.ProcessDefinitionVersion;
import vn.vht.qtkhcn.repository.ProcessDefinitionCatalogRepository;
import vn.vht.qtkhcn.repository.ProcessDefinitionVersionRepository;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ProcessRoutingResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ProcessStepResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.RouteBranchResponse;

@Component
public class DeployedBpmnRoutingReader {
    private static final Logger log = LoggerFactory.getLogger(DeployedBpmnRoutingReader.class);
    private static final Pattern FEEL_STRING = Pattern.compile("=\\s*[^=]+?=\\s*\"([^\"]+)\"");
    private static final String BPMN_NS = "http://www.omg.org/spec/BPMN/20100524/MODEL";
    private final ProcessDefinitionCatalogRepository catalogRepository;
    private final ProcessDefinitionVersionRepository versionRepository;
    private final Map<Long, ProcessRoutingResponse> cache = new ConcurrentHashMap<>();

    public DeployedBpmnRoutingReader(ProcessDefinitionCatalogRepository catalogRepository,
            ProcessDefinitionVersionRepository versionRepository) {
        this.catalogRepository = catalogRepository;
        this.versionRepository = versionRepository;
    }

    public List<ProcessRoutingResponse> processes() {
        return catalogRepository.findAllByOrderByBpmnProcessIdAsc().stream()
                .map(this::latestRouting).flatMap(java.util.Optional::stream).toList();
    }

    public ProcessRoutingResponse require(String code) {
        return catalogRepository.findByBpmnProcessId(code).flatMap(this::latestRouting)
                .orElseThrow(() -> new IllegalArgumentException("Quy trình chưa được deploy: " + code));
    }

    private java.util.Optional<ProcessRoutingResponse> latestRouting(ProcessDefinitionCatalog catalog) {
        return versionRepository.findFirstByCatalogIdOrderByCamundaVersionDesc(catalog.getId())
                .filter(version -> version.getBpmnXml() != null && !version.getBpmnXml().isBlank())
                .map(version -> cache.computeIfAbsent(version.getCamundaProcessDefinitionKey(),
                        ignored -> parse(catalog, version)));
    }

    ProcessRoutingResponse parse(ProcessDefinitionCatalog catalog, ProcessDefinitionVersion version) {
        try {
            Document document = secureFactory().newDocumentBuilder()
                    .parse(new InputSource(new StringReader(version.getBpmnXml())));
            Map<String, Element> nodes = new HashMap<>();
            for (Element element : elements(document, "*")) {
                if (!element.getAttribute("id").isBlank()) nodes.put(element.getAttribute("id"), element);
            }
            Map<String, List<Element>> outgoing = new LinkedHashMap<>();
            for (Element flow : elements(document, "sequenceFlow")) {
                outgoing.computeIfAbsent(flow.getAttribute("sourceRef"), ignored -> new ArrayList<>()).add(flow);
            }
            List<Element> tasks = bpmnElements(document, "userTask");
            Map<String, Integer> taskOrder = new HashMap<>();
            for (int i = 0; i < tasks.size(); i++) taskOrder.put(tasks.get(i).getAttribute("id"), i);
            Element process = elements(document, "process").stream().findFirst().orElseThrow();
            List<String> defaultUserTaskActions = actionCodes(propertyValue(process, "qtkhcn.userTaskActions"));
            List<ProcessStepResponse> steps = tasks.stream()
                    .map(task -> step(task, nodes, outgoing, taskOrder, defaultUserTaskActions)).toList();
            return new ProcessRoutingResponse(catalog.getBpmnProcessId(), catalog.getName(), steps);
        } catch (Exception exception) {
            throw new IllegalStateException("Không đọc được BPMN đã deploy: " + catalog.getBpmnProcessId(), exception);
        }
    }

    private ProcessStepResponse step(Element task, Map<String, Element> nodes, Map<String, List<Element>> outgoing,
            Map<String, Integer> taskOrder, List<String> defaultUserTaskActions) {
        String taskId = task.getAttribute("id");
        List<Element> flows = outgoing.getOrDefault(taskId, List.of());
        List<String> taskActions = actionCodes(propertyValue(task, "qtkhcn.actions"));
        if (taskActions.isEmpty()) taskActions = defaultUserTaskActions;
        if (!taskActions.isEmpty()) {
            String forwardTarget = flows.stream().findFirst().map(flow -> nodes.get(flow.getAttribute("targetRef")))
                    .map(DeployedBpmnRoutingReader::displayName).orElse("Tiếp tục");
            List<RouteBranchResponse> actionBranches = taskActions.stream()
                    .map(code -> actionBranch(code, forwardTarget)).toList();
            return new ProcessStepResponse(taskId, displayName(task),
                    descendantAttribute(task, "assignmentDefinition", "candidateGroups"),
                    descendantAttribute(task, "formDefinition", "formKey"), actionBranches);
        }
        List<RouteBranchResponse> routes = new ArrayList<>();
        for (Element flow : flows) {
            Element target = nodes.get(flow.getAttribute("targetRef"));
            if (target != null && "exclusiveGateway".equals(target.getLocalName())) {
                outgoing.getOrDefault(target.getAttribute("id"), List.of()).stream()
                        .map(branch -> branch(branch, taskId, nodes, taskOrder, true)).forEach(routes::add);
            } else routes.add(branch(flow, taskId, nodes, taskOrder, false));
        }
        return new ProcessStepResponse(taskId, displayName(task), descendantAttribute(task, "assignmentDefinition", "candidateGroups"),
                descendantAttribute(task, "formDefinition", "formKey"), routes);
    }

    private static RouteBranchResponse actionBranch(String actionCode, String forwardTarget) {
        return switch (actionCode) {
            case "APPROVE_STEP" -> new RouteBranchResponse("APPROVE", "Đồng ý duyệt", forwardTarget, "forward");
            case "REJECT_STEP" -> new RouteBranchResponse("REJECT", "Từ chối duyệt", "Kết thúc — từ chối", "reject");
            case "RETURN_STEP" -> new RouteBranchResponse("RETURN", "Yêu cầu điều chỉnh", "Bước trước", "rework");
            case "SUBMIT" -> new RouteBranchResponse("SUBMIT", "Gửi duyệt", forwardTarget, "forward");
            default -> new RouteBranchResponse(actionCode, actionCode, forwardTarget, "forward");
        };
    }

    private RouteBranchResponse branch(Element flow, String taskId, Map<String, Element> nodes,
            Map<String, Integer> taskOrder, boolean gatewayBranch) {
        Element target = nodes.get(flow.getAttribute("targetRef"));
        String label = blankFallback(flow.getAttribute("name"), target == null ? "Tiếp tục" : displayName(target));
        String condition = childText(flow, "conditionExpression");
        Matcher matcher = FEEL_STRING.matcher(condition);
        String outcome = matcher.find() ? matcher.group(1) : gatewayBranch ? slug(label) : "SUBMIT";
        String targetName = target == null ? flow.getAttribute("targetRef") : displayName(target);
        String kind = "forward";
        if (target != null && "endEvent".equals(target.getLocalName())) {
            String normalized = slug(label + " " + targetName);
            kind = normalized.contains("khong") || normalized.contains("tu_choi") ? "reject" : "complete";
        } else if (target != null && taskOrder.containsKey(target.getAttribute("id"))
                && taskOrder.get(target.getAttribute("id")) <= taskOrder.getOrDefault(taskId, -1)) kind = "rework";
        return new RouteBranchResponse(outcome, label, targetName, kind);
    }

    private static DocumentBuilderFactory secureFactory() throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
        factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
        factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");
        return factory;
    }

    /**
     * Như {@link #elements} nhưng CHỈ lấy phần tử của chính mô hình BPMN — loại các phần tử trùng
     * tên cục bộ ở namespace mở rộng. Bắt buộc cho {@code userTask}: Camunda Modeler / bpmn-js gắn
     * marker {@code <zeebe:userTask />} (không có id) vào {@code extensionElements}, nên bản deploy
     * thật sinh ra các "bước ma" key rỗng — scaffold khi đó đụng id trùng AP-BPMN-<mã>--APPROVE.
     */
    private static List<Element> bpmnElements(Node root, String localName) {
        return elements(root, localName).stream()
                .filter(element -> element.getNamespaceURI() == null || BPMN_NS.equals(element.getNamespaceURI()))
                .toList();
    }

    private static List<Element> elements(Node root, String localName) {
        List<Element> result = new ArrayList<>();
        NodeList nodes = root instanceof Document document ? document.getElementsByTagNameNS("*", localName)
                : ((Element) root).getElementsByTagNameNS("*", localName);
        for (int i = 0; i < nodes.getLength(); i++) result.add((Element) nodes.item(i));
        return result;
    }

    private static String descendantAttribute(Element parent, String name, String attribute) {
        List<Element> matches = elements(parent, name);
        return matches.isEmpty() ? null : blankToNull(matches.get(0).getAttribute(attribute));
    }

    private static String propertyValue(Element scope, String propertyName) {
        for (Element property : elements(scope, "property")) {
            if (propertyName.equals(property.getAttribute("name"))) return property.getAttribute("value").trim();
        }
        return "";
    }

    private static List<String> actionCodes(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return java.util.Arrays.stream(csv.split(",")).map(String::trim).filter(value -> !value.isEmpty()).toList();
    }

    private static String childText(Element parent, String name) {
        List<Element> matches = elements(parent, name);
        return matches.isEmpty() ? "" : matches.get(0).getTextContent().trim();
    }

    private static String displayName(Element element) {
        return blankFallback(element.getAttribute("name"), element.getAttribute("id"));
    }

    private static String blankFallback(String value, String fallback) { return value == null || value.isBlank() ? fallback : value; }
    private static String blankToNull(String value) { return value == null || value.isBlank() ? null : value; }
    private static String slug(String value) {
        String ascii = java.text.Normalizer.normalize(value, java.text.Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return ascii.toLowerCase(Locale.ROOT).replace('đ', 'd').replaceAll("[^a-z0-9]+", "_").replaceAll("^_|_$", "");
    }
}

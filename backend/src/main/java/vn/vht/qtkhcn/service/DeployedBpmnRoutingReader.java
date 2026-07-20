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
            List<Element> tasks = elements(document, "userTask");
            Map<String, Integer> taskOrder = new HashMap<>();
            for (int i = 0; i < tasks.size(); i++) taskOrder.put(tasks.get(i).getAttribute("id"), i);
            List<ProcessStepResponse> steps = tasks.stream().map(task -> step(task, nodes, outgoing, taskOrder)).toList();
            return new ProcessRoutingResponse(catalog.getBpmnProcessId(), catalog.getName(), steps);
        } catch (Exception exception) {
            throw new IllegalStateException("Không đọc được BPMN đã deploy: " + catalog.getBpmnProcessId(), exception);
        }
    }

    private ProcessStepResponse step(Element task, Map<String, Element> nodes, Map<String, List<Element>> outgoing,
            Map<String, Integer> taskOrder) {
        String taskId = task.getAttribute("id");
        List<Element> flows = outgoing.getOrDefault(taskId, List.of());
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

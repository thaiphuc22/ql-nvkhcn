package vn.vht.qtkhcn.service;

import static vn.vht.qtkhcn.service.ProcessImportException.Kind.VALIDATION;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXParseException;
import org.xml.sax.helpers.DefaultHandler;

/** Hardened BPMN parser and deterministic static lint engine. */
@Component
public class ProcessDefinitionImportValidator {
    private static final String BPMN_NS = "http://www.omg.org/spec/BPMN/20100524/MODEL";
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/xml", "text/xml", "application/octet-stream", "application/bpmn+xml");
    private static final Set<String> FLOW_NODE_TYPES = Set.of(
            "startEvent", "endEvent", "intermediateCatchEvent", "intermediateThrowEvent", "boundaryEvent",
            "task", "userTask", "serviceTask", "manualTask", "scriptTask", "businessRuleTask", "sendTask",
            "receiveTask", "callActivity", "subProcess", "exclusiveGateway", "inclusiveGateway",
            "parallelGateway", "complexGateway", "eventBasedGateway");

    private final long maxFileSizeBytes;

    public ProcessDefinitionImportValidator(
            @Value("${qtkhcn.process-import.max-file-size-bytes:5242880}") long maxFileSizeBytes) {
        this.maxFileSizeBytes = maxFileSizeBytes;
    }

    public ValidatedBpmn validate(MultipartFile file) {
        List<String> errors = new ArrayList<>();
        if (file == null || file.isEmpty()) throw invalid("File BPMN không hợp lệ.", "File rỗng hoặc chưa được gửi.");
        String resourceName = safeResourceName(file.getOriginalFilename());
        if (!resourceName.toLowerCase(Locale.ROOT).endsWith(".bpmn")) errors.add("Tên file phải có phần mở rộng .bpmn.");
        if (file.getSize() > maxFileSizeBytes) errors.add("Kích thước file vượt giới hạn %d byte.".formatted(maxFileSizeBytes));
        String contentType = file.getContentType();
        if (contentType != null && !contentType.isBlank()
                && !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            errors.add("Content-Type không được hỗ trợ: " + contentType + ".");
        }
        if (!errors.isEmpty()) throw new ProcessImportException(VALIDATION, "File BPMN không hợp lệ.", errors);
        try {
            byte[] bytes = file.getBytes();
            if (bytes.length == 0 || bytes.length > maxFileSizeBytes) {
                throw invalid("File BPMN không hợp lệ.", bytes.length == 0 ? "File rỗng."
                        : "Kích thước file vượt giới hạn %d byte.".formatted(maxFileSizeBytes));
            }
            return validateBytes(bytes, resourceName);
        } catch (ProcessImportException e) {
            throw e;
        } catch (Exception e) {
            throw new ProcessImportException(VALIDATION, "Không đọc được file BPMN.",
                    List.of("Không thể đọc nội dung upload."), e);
        }
    }

    public ValidatedBpmn validate(String bpmnXml, String requestedResourceName) {
        if (bpmnXml == null || bpmnXml.isBlank()) throw invalid("BPMN XML không hợp lệ.", "Nội dung BPMN XML rỗng.");
        String resourceName = safeResourceName(requestedResourceName);
        if (!resourceName.toLowerCase(Locale.ROOT).endsWith(".bpmn")) {
            throw invalid("Tên file BPMN không hợp lệ.", "Tên file phải có phần mở rộng .bpmn.");
        }
        byte[] bytes = bpmnXml.getBytes(StandardCharsets.UTF_8);
        if (bytes.length > maxFileSizeBytes) {
            throw invalid("BPMN XML không hợp lệ.", "Kích thước file vượt giới hạn %d byte.".formatted(maxFileSizeBytes));
        }
        return validateBytes(bytes, resourceName);
    }

    private static ValidatedBpmn validateBytes(byte[] bytes, String resourceName) {
        Element process = parseSingleExecutableProcess(bytes);
        String processId = attr(process, "id");
        if (processId.isEmpty()) throw invalid("PROCESS_ID_MISSING", "BPMN thiếu thông tin bắt buộc.",
                "Process executable phải có thuộc tính id.");
        List<BpmnLintIssue> issues = lint(process);
        String name = attr(process, "name");
        if (name.isEmpty()) {
            name = processId;
            issues.add(issue("PROCESS_NAME_MISSING", BpmnIssueSeverity.SUGGESTION,
                    "Process chưa có tên hiển thị.", process));
        }
        List<String> warnings = issues.stream().filter(i -> i.severity() == BpmnIssueSeverity.WARNING
                        || "PROCESS_NAME_MISSING".equals(i.code()))
                .map(BpmnLintIssue::message).toList();
        String xml = new String(bytes, StandardCharsets.UTF_8);
        return new ValidatedBpmn(bytes, xml, resourceName, processId, name, sha256(bytes), warnings, List.copyOf(issues));
    }

    private static List<BpmnLintIssue> lint(Element process) {
        List<BpmnLintIssue> issues = new ArrayList<>();
        Map<String, Element> elements = new LinkedHashMap<>();
        Set<String> duplicateIds = new LinkedHashSet<>();
        collectElements(process, elements, duplicateIds);
        duplicateIds.forEach(id -> issues.add(new BpmnLintIssue("DUPLICATE_ELEMENT_ID", BpmnIssueSeverity.ERROR,
                "ID phần tử BPMN bị trùng: " + id + ".", id, elementName(elements.get(id)))));

        List<Element> flows = elementsByName(process, "sequenceFlow");
        Map<String, List<Element>> outgoing = new HashMap<>();
        for (Element flow : flows) {
            String source = attr(flow, "sourceRef");
            String target = attr(flow, "targetRef");
            if (source.isEmpty() || target.isEmpty() || !elements.containsKey(source) || !elements.containsKey(target)) {
                issues.add(issue("SEQUENCE_FLOW_BROKEN", BpmnIssueSeverity.ERROR,
                        "Luồng nối thiếu hoặc tham chiếu sai sourceRef/targetRef.", flow));
                continue;
            }
            outgoing.computeIfAbsent(source, ignored -> new ArrayList<>()).add(flow);
        }

        List<Element> starts = elementsByName(process, "startEvent");
        if (starts.isEmpty()) issues.add(issue("START_EVENT_MISSING", BpmnIssueSeverity.ERROR,
                "Process executable phải có Start Event.", process));
        for (Element start : starts) {
            if (outgoing.getOrDefault(attr(start, "id"), List.of()).isEmpty()) {
                issues.add(issue("START_EVENT_NO_OUTGOING", BpmnIssueSeverity.ERROR, "Start Event chưa có luồng đi ra.", start));
            }
        }
        lintGraph(process, elements, starts, outgoing, issues);
        lintGateways(process, outgoing, issues);
        lintTasks(process, issues);
        lintReferences(process, elements, issues);
        lintNames(process, flows, outgoing, issues);
        return issues;
    }

    private static void collectElements(Element root, Map<String, Element> elements, Set<String> duplicates) {
        elements.put(attr(root, "id"), root);
        NodeList all = root.getElementsByTagNameNS(BPMN_NS, "*");
        for (int i = 0; i < all.getLength(); i++) {
            Element element = (Element) all.item(i);
            String id = attr(element, "id");
            if (!id.isEmpty() && elements.putIfAbsent(id, element) != null) duplicates.add(id);
        }
        elements.remove("");
    }

    private static void lintGraph(Element process, Map<String, Element> elements, List<Element> starts,
            Map<String, List<Element>> outgoing, List<BpmnLintIssue> issues) {
        Set<String> reachable = new HashSet<>();
        ArrayDeque<String> queue = new ArrayDeque<>();
        starts.stream().map(e -> attr(e, "id")).filter(id -> !id.isEmpty()).forEach(queue::add);
        while (!queue.isEmpty()) {
            String current = queue.removeFirst();
            if (!reachable.add(current)) continue;
            outgoing.getOrDefault(current, List.of()).stream().map(f -> attr(f, "targetRef"))
                    .filter(elements::containsKey).forEach(queue::addLast);
        }
        for (Element node : flowNodes(process)) {
            String id = attr(node, "id");
            if (!id.isEmpty() && !reachable.contains(id) && !"boundaryEvent".equals(node.getLocalName())) {
                issues.add(issue("FLOW_NODE_UNREACHABLE", BpmnIssueSeverity.ERROR,
                        "Phần tử không đi tới được từ Start Event.", node));
            }
            if (reachable.contains(id) && outgoing.getOrDefault(id, List.of()).isEmpty()
                    && !Set.of("endEvent", "boundaryEvent").contains(node.getLocalName())) {
                issues.add(issue("ACTIVE_PATH_DEAD_END", BpmnIssueSeverity.ERROR,
                        "Luồng thực thi kết thúc cụt trước End Event.", node));
            }
        }
        if (elementsByName(process, "endEvent").isEmpty()) issues.add(issue("END_EVENT_MISSING", BpmnIssueSeverity.WARNING,
                "Process chưa có End Event rõ ràng.", process));
    }

    private static void lintGateways(Element process, Map<String, List<Element>> outgoing, List<BpmnLintIssue> issues) {
        for (String type : List.of("exclusiveGateway", "inclusiveGateway", "parallelGateway", "complexGateway")) {
            for (Element gateway : elementsByName(process, type)) {
                List<Element> branches = outgoing.getOrDefault(attr(gateway, "id"), List.of());
                if (branches.isEmpty()) issues.add(issue("GATEWAY_NO_OUTGOING", BpmnIssueSeverity.ERROR,
                        "Gateway chưa có luồng đi ra.", gateway));
                else if (branches.size() == 1) issues.add(issue("GATEWAY_SINGLE_OUTGOING", BpmnIssueSeverity.WARNING,
                        "Gateway chỉ có một nhánh ra; có thể đang dư thừa hoặc chưa hoàn thiện.", gateway));
                if (branches.size() < 2 || !(type.equals("exclusiveGateway") || type.equals("inclusiveGateway"))) continue;
                String defaultFlow = attr(gateway, "default");
                if (defaultFlow.isEmpty()) issues.add(issue("GATEWAY_DEFAULT_FLOW_MISSING", BpmnIssueSeverity.WARNING,
                        "Gateway '" + displayName(gateway) + "' có nhiều nhánh nhưng chưa có default flow; "
                                + "có nguy cơ CONDITION_ERROR.", gateway));
                for (Element branch : branches) {
                    if (!attr(branch, "id").equals(defaultFlow) && !hasBpmnChild(branch, "conditionExpression")) {
                        issues.add(issue("GATEWAY_CONDITION_MISSING", BpmnIssueSeverity.ERROR,
                                "Nhánh không phải default flow phải có condition expression.", branch));
                    }
                }
            }
        }
    }

    private static void lintTasks(Element process, List<BpmnLintIssue> issues) {
        for (Element task : elementsByName(process, "userTask")) {
            if (!hasExtensionAttribute(task, "assignmentDefinition", Set.of("assignee", "candidateUsers", "candidateGroups"))
                    && !hasDynamicAssignmentMarker(task)) {
                issues.add(issue("USER_TASK_ASSIGNMENT_MISSING", BpmnIssueSeverity.WARNING,
                        "User Task chưa có assignee, candidate user/group hoặc cơ chế phân công động.", task));
            }
            if (!hasExtensionAttribute(task, "formDefinition", Set.of("formId", "formKey"))) {
                issues.add(issue("USER_TASK_FORM_MISSING", BpmnIssueSeverity.WARNING,
                        "User Task chưa cấu hình biểu mẫu.", task));
            }
        }
        for (Element task : elementsByName(process, "serviceTask")) {
            if (!hasExtensionAttribute(task, "taskDefinition", Set.of("type"))) {
                issues.add(issue("SERVICE_TASK_JOB_TYPE_MISSING", BpmnIssueSeverity.ERROR,
                        "Service Task thiếu zeebe:taskDefinition type.", task));
            }
            if (!hasExtensionAttribute(task, "taskDefinition", Set.of("retries"))) {
                issues.add(issue("SERVICE_TASK_RETRY_MISSING", BpmnIssueSeverity.WARNING,
                        "Service Task chưa khai báo số lần retry.", task));
            }
        }
    }

    private static void lintReferences(Element process, Map<String, Element> elements, List<BpmnLintIssue> issues) {
        for (Element activity : elementsByName(process, "callActivity")) {
            if (attr(activity, "calledElement").isEmpty()
                    && !hasExtensionAttribute(activity, "calledElement", Set.of("processId"))) {
                issues.add(issue("CALLED_PROCESS_MISSING", BpmnIssueSeverity.ERROR,
                        "Call Activity chưa khai báo process được gọi.", activity));
            }
        }
        Set<String> activityTypes = Set.of("task", "userTask", "serviceTask", "manualTask", "scriptTask",
                "businessRuleTask", "sendTask", "receiveTask", "callActivity", "subProcess");
        for (Element boundary : elementsByName(process, "boundaryEvent")) {
            Element target = elements.get(attr(boundary, "attachedToRef"));
            if (target == null || !activityTypes.contains(target.getLocalName())) {
                issues.add(issue("BOUNDARY_EVENT_TARGET_INVALID", BpmnIssueSeverity.ERROR,
                        "Boundary Event thiếu hoặc tham chiếu sai activity đích.", boundary));
            }
        }
    }

    private static void lintNames(Element process, List<Element> flows, Map<String, List<Element>> outgoing,
            List<BpmnLintIssue> issues) {
        Set<String> namedTypes = Set.of("task", "userTask", "serviceTask", "manualTask", "businessRuleTask",
                "callActivity", "exclusiveGateway", "inclusiveGateway", "parallelGateway", "complexGateway");
        for (Element node : flowNodes(process)) {
            if (namedTypes.contains(node.getLocalName()) && attr(node, "name").isEmpty()) {
                issues.add(issue("ELEMENT_NAME_MISSING", BpmnIssueSeverity.SUGGESTION, "Phần tử nên có tên dễ hiểu.", node));
            }
            if (node.getLocalName().endsWith("Gateway") && outgoing.getOrDefault(attr(node, "id"), List.of()).size() > 1
                    && attr(node, "name").isEmpty()) {
                issues.add(issue("GATEWAY_QUESTION_MISSING", BpmnIssueSeverity.SUGGESTION,
                        "Gateway phân nhánh nên diễn đạt câu hỏi/quyết định.", node));
            }
        }
        for (Element flow : flows) {
            Element source = findById(process, attr(flow, "sourceRef"));
            if (source != null && source.getLocalName().endsWith("Gateway")
                    && outgoing.getOrDefault(attr(source, "id"), List.of()).size() > 1 && attr(flow, "name").isEmpty()) {
                issues.add(issue("SEQUENCE_FLOW_LABEL_MISSING", BpmnIssueSeverity.SUGGESTION,
                        "Nhánh ra khỏi gateway nên có nhãn.", flow));
            }
        }
    }

    private static List<Element> flowNodes(Element process) {
        List<Element> result = new ArrayList<>();
        NodeList all = process.getElementsByTagNameNS(BPMN_NS, "*");
        for (int i = 0; i < all.getLength(); i++) {
            Element element = (Element) all.item(i);
            if (FLOW_NODE_TYPES.contains(element.getLocalName())) result.add(element);
        }
        return result;
    }

    private static List<Element> elementsByName(Element process, String localName) {
        NodeList nodes = process.getElementsByTagNameNS(BPMN_NS, localName);
        List<Element> result = new ArrayList<>(nodes.getLength());
        for (int i = 0; i < nodes.getLength(); i++) result.add((Element) nodes.item(i));
        return result;
    }

    private static boolean hasBpmnChild(Element element, String localName) {
        return element.getElementsByTagNameNS(BPMN_NS, localName).getLength() > 0;
    }

    private static boolean hasExtensionAttribute(Element element, String localName, Collection<String> attrs) {
        NodeList all = element.getElementsByTagNameNS("*", localName);
        for (int i = 0; i < all.getLength(); i++) {
            Element extension = (Element) all.item(i);
            if (attrs.stream().anyMatch(name -> !attr(extension, name).isEmpty())) return true;
        }
        return false;
    }

    private static boolean hasDynamicAssignmentMarker(Element element) {
        NodeList all = element.getElementsByTagNameNS("*", "dynamicAssignment");
        for (int i = 0; i < all.getLength(); i++) {
            String enabled = attr((Element) all.item(i), "enabled");
            if (enabled.isEmpty() || "true".equalsIgnoreCase(enabled) || "1".equals(enabled)) return true;
        }
        return false;
    }

    private static Element findById(Element process, String id) {
        NodeList all = process.getElementsByTagNameNS(BPMN_NS, "*");
        for (int i = 0; i < all.getLength(); i++) {
            Element element = (Element) all.item(i);
            if (id.equals(attr(element, "id"))) return element;
        }
        return null;
    }

    public static String checksum(String content) { return sha256(content.getBytes(StandardCharsets.UTF_8)); }

    private static Element parseSingleExecutableProcess(byte[] bytes) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            factory.setXIncludeAware(false);
            factory.setExpandEntityReferences(false);
            factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
            factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
            factory.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
            factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
            factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");
            var builder = factory.newDocumentBuilder();
            builder.setEntityResolver((publicId, systemId) -> { throw new SAXParseException("External entity is not allowed", null); });
            builder.setErrorHandler(new DefaultHandler() {
                @Override public void error(SAXParseException e) throws SAXParseException { throw e; }
                @Override public void fatalError(SAXParseException e) throws SAXParseException { throw e; }
            });
            var document = builder.parse(new ByteArrayInputStream(bytes));
            NodeList processes = document.getElementsByTagNameNS(BPMN_NS, "process");
            List<Element> executable = new ArrayList<>();
            for (int i = 0; i < processes.getLength(); i++) {
                Element candidate = (Element) processes.item(i);
                String flag = candidate.getAttribute("isExecutable");
                if ("true".equalsIgnoreCase(flag) || "1".equals(flag)) executable.add(candidate);
            }
            if (executable.isEmpty()) throw invalid("PROCESS_MISSING", "BPMN thiếu process executable.",
                    "Cần đúng một bpmn:process có isExecutable=\"true\".");
            if (executable.size() > 1) throw invalid("MULTIPLE_EXECUTABLE_PROCESS", "BPMN có nhiều process executable.",
                    "API import mỗi lần chỉ hỗ trợ một process executable.");
            return executable.getFirst();
        } catch (ProcessImportException e) {
            throw e;
        } catch (Exception e) {
            String detail = e instanceof SAXParseException sax && sax.getLineNumber() > 0
                    ? "XML không hợp lệ tại dòng %d, cột %d.".formatted(sax.getLineNumber(), sax.getColumnNumber())
                    : "XML không hợp lệ hoặc chứa DTD/external entity bị cấm.";
            throw new ProcessImportException(VALIDATION, "Không thể phân tích BPMN XML.", List.of(detail), e);
        }
    }

    private static String safeResourceName(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) return "process.bpmn";
        String normalized = originalFilename.replace('\\', '/');
        String basename = normalized.substring(normalized.lastIndexOf('/') + 1).trim();
        if (basename.isEmpty() || basename.length() > 255) throw invalid("Tên file BPMN không hợp lệ.",
                "Tên file phải có từ 1 đến 255 ký tự.");
        return basename;
    }

    private static String sha256(byte[] bytes) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)); }
        catch (NoSuchAlgorithmException e) { throw new IllegalStateException("JVM không hỗ trợ SHA-256.", e); }
    }

    private static String attr(Element element, String name) { return element == null ? "" : element.getAttribute(name).trim(); }
    private static String elementName(Element element) { String name = attr(element, "name"); return name.isEmpty() ? null : name; }
    private static String displayName(Element element) {
        String name = attr(element, "name");
        return name.isEmpty() ? attr(element, "id") : name;
    }
    private static BpmnLintIssue issue(String code, BpmnIssueSeverity severity, String message, Element element) {
        return new BpmnLintIssue(code, severity, message, attr(element, "id"), elementName(element));
    }
    private static ProcessImportException invalid(String message, String error) {
        return invalid("XML_INVALID", message, error);
    }
    private static ProcessImportException invalid(String code, String message, String error) {
        return new ProcessImportException(VALIDATION, message, List.of(error), code);
    }
}

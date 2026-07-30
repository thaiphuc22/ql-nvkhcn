package vn.vht.qtkhcn.service;

import jakarta.persistence.EntityNotFoundException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import vn.vht.qtkhcn.camunda.JobWorkerRegistry;
import vn.vht.qtkhcn.domain.ProcessDefinitionCatalog;
import vn.vht.qtkhcn.domain.ProcessDefinitionVersion;
import vn.vht.qtkhcn.repository.EformRepository;
import vn.vht.qtkhcn.repository.ProcessDefinitionCatalogRepository;
import vn.vht.qtkhcn.repository.ProcessDefinitionVersionRepository;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ReconcileResponse;
import vn.vht.qtkhcn.web.dto.ProcessReadinessResponse;
import vn.vht.qtkhcn.web.dto.ProcessReadinessResponse.ServiceTaskReadiness;
import vn.vht.qtkhcn.web.dto.ProcessReadinessResponse.UserTaskReadiness;

/**
 * Trả lời một câu hỏi: <b>quy trình này deploy rồi thì chạy được chưa, hay sẽ chết ở đâu?</b>
 *
 * <p>Ra đời vì quyết định 2026-07-28 của user: cho deploy tự do, không warning, không chặn cứng. Ba
 * kiểm tra vốn định đặt ở cổng deploy (Lát 0, đã huỷ) chuyển hết về đây dưới dạng chẩn đoán đọc-thôi:
 * <ol>
 *   <li><b>Biểu mẫu</b> — {@code formKey} trong BPMN có thật trong thư viện biểu mẫu không. Sai thì
 *       người xử lý mở bước lên là trắng màn.</li>
 *   <li><b>Vai trò</b> — {@code candidateGroups} có nằm trong danh mục vai trò không. Gõ nhầm thì
 *       task vẫn được tạo nhưng KHÔNG AI nhìn thấy để xử lý; hồ sơ đứng im mà không báo lỗi gì.</li>
 *   <li><b>Service task</b> — job type có worker nào lắng nghe không. Không có thì hồ sơ treo tại đó,
 *       đúng lớp bug RD02.02 {@code Check} ngày 2026-07-20.</li>
 * </ol>
 * Cộng thêm: nhánh nào trong BPMN chưa có luật hiển thị nút ghim đúng bước.
 *
 * <p>Không có tác dụng phụ, không chặn gì. Bảng này chỉ nói ra sự thật sớm hơn hồ sơ đầu tiên.
 */
@Service
public class ProcessReadinessService {
    private static final String BPMN_NS = "http://www.omg.org/spec/BPMN/20100524/MODEL";
    private static final String OK = "ok";
    private static final String WARN = "warn";
    private static final String ERROR = "error";

    private final ProcessDefinitionCatalogRepository catalogRepository;
    private final ProcessDefinitionVersionRepository versionRepository;
    private final ActionStudioService actionStudio;
    private final EformRepository eformRepository;
    private final JobWorkerRegistry jobWorkers;

    public ProcessReadinessService(ProcessDefinitionCatalogRepository catalogRepository,
            ProcessDefinitionVersionRepository versionRepository,
            ActionStudioService actionStudio,
            EformRepository eformRepository,
            JobWorkerRegistry jobWorkers) {
        this.catalogRepository = catalogRepository;
        this.versionRepository = versionRepository;
        this.actionStudio = actionStudio;
        this.eformRepository = eformRepository;
        this.jobWorkers = jobWorkers;
    }

    @Transactional(readOnly = true)
    public ProcessReadinessResponse readiness(String bpmnProcessId) {
        ProcessDefinitionCatalog catalog = catalogRepository.findByBpmnProcessId(bpmnProcessId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy quy trình " + bpmnProcessId));
        ProcessDefinitionVersion version = versionRepository
                .findFirstByCatalogIdOrderByCamundaVersionDesc(catalog.getId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Quy trình " + bpmnProcessId + " chưa có version deploy thành công."));

        List<String> notes = new ArrayList<>();
        BpmnElements elements = parse(version.getBpmnXml());
        List<ReconcileResponse> reconcile = reconcileRows(bpmnProcessId, notes);
        List<UserTaskReadiness> userTasks = elements.userTasks().stream()
                .map(task -> userTask(task, reconcile))
                .toList();
        List<ServiceTaskReadiness> serviceTasks = elements.serviceTasks().stream()
                .map(this::serviceTask).toList();

        if (userTasks.isEmpty()) {
            notes.add("Quy trình không có user task nào — hồ sơ khởi động xong sẽ chạy thẳng tới cuối, "
                    + "không ai phải xử lý bước nào.");
        }
        String status = worst(java.util.stream.Stream.concat(
                userTasks.stream().map(UserTaskReadiness::status),
                serviceTasks.stream().map(ServiceTaskReadiness::status)).toList());
        return new ProcessReadinessResponse(catalog.getBpmnProcessId(), catalog.getName(),
                version.getCamundaVersion(), version.getSource().name(), status, userTasks, serviceTasks,
                List.copyOf(notes));
    }

    /**
     * Đối soát luật hành động dùng chung với màn Ma trận Hành động. Tính một lần rồi dùng lại cho mọi
     * bước; lỗi đối soát (vd outcome BPMN chưa ánh xạ được) chỉ thành một ghi chú chứ không làm hỏng
     * cả bảng chẩn đoán — phần biểu mẫu/vai trò/worker vẫn đọc được.
     */
    private List<ReconcileResponse> reconcileRows(String bpmnProcessId, List<String> notes) {
        try {
            return actionStudio.reconcile(bpmnProcessId);
        } catch (RuntimeException failure) {
            notes.add("Không đối soát được luật hành động: " + failure.getMessage());
            return List.of();
        }
    }

    private UserTaskReadiness userTask(ParsedUserTask task, List<ReconcileResponse> reconcile) {
        List<String> issues = new ArrayList<>();

        boolean formExists = task.formKey() != null && eformRepository.existsById(task.formKey());
        if (task.formKey() == null) {
            issues.add("Bước chưa gắn biểu mẫu — người xử lý chỉ có nút bấm, không có gì để nhập.");
        } else if (!formExists) {
            issues.add("Biểu mẫu \"" + task.formKey() + "\" không có trong thư viện biểu mẫu.");
        }

        List<String> unknownRoles = task.candidateGroups().stream()
                .filter(code -> !RoleCatalog.isKnown(code)).toList();
        if (!unknownRoles.isEmpty()) {
            issues.add("Vai trò không có trong danh mục: " + String.join(", ", unknownRoles)
                    + " — task vẫn được tạo nhưng sẽ không ai nhìn thấy để xử lý.");
        }
        boolean nobodyAssigned = task.candidateGroups().isEmpty() && task.candidateUsers().isEmpty()
                && (task.assignee() == null || task.assignee().isBlank()) && !task.dynamicAssignment();
        if (nobodyAssigned) {
            issues.add("Bước không có assignee, candidate user/group hay phân công động — hồ sơ sẽ dừng ở đây.");
        }

        List<ReconcileResponse> stepRows = reconcile.stream()
                .filter(row -> row.stepKey().equals(task.elementId())).toList();
        List<String> bound = stepRows.stream()
                .filter(row -> Set.of("ok", "unfilled").contains(row.status()))
                .map(ReconcileResponse::actionCode).distinct().toList();
        List<String> missing = stepRows.stream()
                .filter(row -> row.status().equals("missing"))
                .map(ReconcileResponse::actionCode).distinct().toList();
        if (!missing.isEmpty()) {
            issues.add("Chưa có luật hiển thị nút cho: " + String.join(", ", missing)
                    + " — bấm \"Tạo luật còn thiếu từ BPMN\" ở Ma trận Hành động.");
        }
        stepRows.stream().filter(row -> row.status().equals("generic")).findFirst().ifPresent(row ->
                issues.add("Đang dùng luật chung (không ghim theo bước) — biểu mẫu kèm nút có thể là của quy trình khác."));
        stepRows.stream().filter(row -> row.status().equals("unmapped")).forEach(row ->
                issues.add("Nhánh \"" + row.outcome() + "\" chưa ánh xạ được sang action code nào."));

        String status = nobodyAssigned || (task.formKey() != null && !formExists) ? ERROR
                : issues.isEmpty() ? OK : WARN;
        return new UserTaskReadiness(task.elementId(), task.name(), task.formKey(), formExists,
                task.candidateGroups(), unknownRoles, task.dynamicAssignment(), bound, missing, status,
                List.copyOf(issues));
    }

    private ServiceTaskReadiness serviceTask(ParsedServiceTask task) {
        if (task.jobType() == null || task.jobType().isBlank()) {
            return new ServiceTaskReadiness(task.elementId(), task.name(), null, false, ERROR,
                    "Service task chưa khai zeebe:taskDefinition type — Zeebe không biết giao việc cho ai.");
        }
        if (task.jobType().startsWith("=")) {
            // Job type là biểu thức FEEL, chỉ biết giá trị lúc chạy nên không đối chiếu tĩnh được.
            return new ServiceTaskReadiness(task.elementId(), task.name(), task.jobType(), false, WARN,
                    "Job type là biểu thức FEEL — không kiểm tra tĩnh được là có worker hay không.");
        }
        boolean registered = jobWorkers.hasWorker(task.jobType());
        return new ServiceTaskReadiness(task.elementId(), task.name(), task.jobType(), registered,
                registered ? OK : ERROR,
                registered ? null : "Không có job worker nào lắng nghe \"" + task.jobType()
                        + "\" — hồ sơ sẽ TREO tại bước này cho tới khi có worker.");
    }

    private static String worst(List<String> statuses) {
        if (statuses.contains(ERROR)) return ERROR;
        return statuses.contains(WARN) ? WARN : OK;
    }

    // --- Đọc BPMN ---

    private static BpmnElements parse(String xml) {
        if (xml == null || xml.isBlank()) {
            throw new IllegalStateException("Version đã deploy không lưu BPMN XML nên không đối soát được.");
        }
        try {
            Document document = SecureXml.parse(xml);
            List<ParsedUserTask> userTasks = new ArrayList<>();
            for (Element task : bpmnElements(document, "userTask")) {
                Element assignment = extension(task, "assignmentDefinition");
                Element form = extension(task, "formDefinition");
                userTasks.add(new ParsedUserTask(task.getAttribute("id"),
                        blankFallback(task.getAttribute("name"), task.getAttribute("id")),
                        blankToNull(attribute(form, "formKey")),
                        blankToNull(attribute(assignment, "assignee")),
                        csv(attribute(assignment, "candidateUsers")),
                        csv(attribute(assignment, "candidateGroups")),
                        extension(task, "dynamicAssignment") != null));
            }
            List<ParsedServiceTask> serviceTasks = new ArrayList<>();
            for (Element task : bpmnElements(document, "serviceTask")) {
                serviceTasks.add(new ParsedServiceTask(task.getAttribute("id"),
                        blankFallback(task.getAttribute("name"), task.getAttribute("id")),
                        blankToNull(attribute(extension(task, "taskDefinition"), "type"))));
            }
            return new BpmnElements(List.copyOf(userTasks), List.copyOf(serviceTasks));
        } catch (Exception e) {
            throw new IllegalStateException("Không đọc được BPMN đã deploy để đối soát.", e);
        }
    }

    /**
     * Chỉ lấy phần tử của chính mô hình BPMN. Bắt buộc với {@code userTask}: Camunda Modeler gắn marker
     * {@code <zeebe:userTask />} (không có id) vào {@code extensionElements}, đọc lẫn vào sẽ sinh ra
     * "bước ma" id rỗng — cùng cái bẫy đã ghi ở {@code DeployedBpmnRoutingReader#bpmnElements}.
     */
    private static List<Element> bpmnElements(Document document, String localName) {
        List<Element> result = new ArrayList<>();
        NodeList nodes = document.getElementsByTagNameNS("*", localName);
        for (int i = 0; i < nodes.getLength(); i++) {
            Element element = (Element) nodes.item(i);
            if (element.getNamespaceURI() == null || BPMN_NS.equals(element.getNamespaceURI())) {
                result.add(element);
            }
        }
        return result;
    }

    private static Element extension(Element parent, String localName) {
        NodeList nodes = parent.getElementsByTagNameNS("*", localName);
        return nodes.getLength() == 0 ? null : (Element) nodes.item(0);
    }

    private static String attribute(Element element, String name) {
        return element == null ? "" : element.getAttribute(name).trim();
    }

    private static List<String> csv(String value) {
        if (value == null || value.isBlank()) return List.of();
        return List.copyOf(new LinkedHashSet<>(Arrays.stream(value.split(","))
                .map(String::trim).filter(item -> !item.isEmpty()).toList()));
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static String blankFallback(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private record BpmnElements(List<ParsedUserTask> userTasks, List<ParsedServiceTask> serviceTasks) {
    }

    private record ParsedUserTask(String elementId, String name, String formKey, String assignee,
            List<String> candidateUsers, List<String> candidateGroups, boolean dynamicAssignment) {
    }

    private record ParsedServiceTask(String elementId, String name, String jobType) {
    }
}

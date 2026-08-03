package vn.vht.qtkhcn.service;

import jakarta.persistence.EntityNotFoundException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.vht.qtkhcn.camunda.CamundaDeploymentService;
import vn.vht.qtkhcn.domain.ProcessDefinitionCatalog;
import vn.vht.qtkhcn.domain.ProcessDefinitionStatus;
import vn.vht.qtkhcn.domain.ProcessDefinitionVersion;
import vn.vht.qtkhcn.repository.ProcessDefinitionCatalogRepository;
import vn.vht.qtkhcn.repository.ProcessDefinitionVersionRepository;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionDetailResponse;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionImportResponse;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionSummaryResponse;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionVersionResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ProcessRoutingResponse;
import vn.vht.qtkhcn.web.dto.SelectableProcessResponse;

@Service
public class ProcessDefinitionService {

    private final ProcessDefinitionImportValidator validator;
    private final CamundaDeploymentService deploymentService;
    private final ProcessDefinitionCatalogRepository catalogRepository;
    private final ProcessDefinitionVersionRepository versionRepository;
    private final DeployedBpmnRoutingReader routingReader;
    private final ApplicationEventPublisher events;

    public ProcessDefinitionService(ProcessDefinitionImportValidator validator,
            CamundaDeploymentService deploymentService,
            ProcessDefinitionCatalogRepository catalogRepository,
            ProcessDefinitionVersionRepository versionRepository,
            DeployedBpmnRoutingReader routingReader,
            ApplicationEventPublisher events) {
        this.validator = validator;
        this.deploymentService = deploymentService;
        this.catalogRepository = catalogRepository;
        this.versionRepository = versionRepository;
        this.routingReader = routingReader;
        this.events = events;
    }

    /**
     * Validation happens before deploy. Catalog/version rows are committed only after Camunda returns
     * a successful deployment result. Camunda and PostgreSQL are still separate transaction domains;
     * an outbox/reconciler for the rare "deploy succeeded, DB commit failed" case is Mốc 6+.
     */
    @Transactional
    public ProcessDefinitionImportResponse importBpmn(MultipartFile file, String actor) {
        ValidatedBpmn bpmn = validator.validate(file);
        return publishValidated(bpmn, actor);
    }

    /** Shared publication path for uploads and explicitly deployed drafts. */
    @Transactional
    public ProcessDefinitionImportResponse publishValidated(ValidatedBpmn bpmn, String actor) {
        if (bpmn.hasErrors()) {
            throw new ProcessImportException(ProcessImportException.Kind.VALIDATION,
                    "BPMN còn lỗi chặn deploy.", bpmn.issues().stream()
                            .filter(issue -> issue.severity() == BpmnIssueSeverity.ERROR)
                            .map(issue -> "[%s] %s".formatted(issue.code(), issue.message())).toList());
        }
        var deployed = deploymentService.deploy(bpmn.bytes(), bpmn.resourceName());
        if (!bpmn.bpmnProcessId().equals(deployed.bpmnProcessId())) {
            throw new ProcessImportException(ProcessImportException.Kind.DEPLOYMENT,
                    "Kết quả deploy không khớp BPMN đã validate.",
                    List.of("Process id mong đợi %s nhưng Camunda trả %s."
                            .formatted(bpmn.bpmnProcessId(), deployed.bpmnProcessId())));
        }

        // Zeebe deploy là content-addressable: nội dung BPMN giống hệt bản đã deploy trả về CÙNG
        // processDefinitionKey thay vì tạo version engine mới. Không chặn ở đây thì insert bên dưới
        // vỡ unique constraint camunda_process_definition_key -> 500 thay vì lỗi rõ ràng cho UI.
        versionRepository.findByCamundaProcessDefinitionKey(deployed.processDefinitionKey())
                .ifPresent(existing -> {
                    throw new ProcessImportException(ProcessImportException.Kind.DEPLOYMENT,
                            "Nội dung BPMN giống hệt phiên bản đã deploy trước đó — Camunda không tạo version mới nên không có gì để nhập.",
                            List.of("Process-definition key %d đã gắn với %s version %d (nhập lúc %s)."
                                    .formatted(deployed.processDefinitionKey(), bpmn.bpmnProcessId(),
                                            existing.getCamundaVersion(), existing.getImportedAt())));
                });

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        ProcessDefinitionCatalog catalog = catalogRepository.findByBpmnProcessId(bpmn.bpmnProcessId())
                .orElseGet(() -> newCatalog(bpmn, now));
        catalog.setName(bpmn.processName());
        catalog.setUpdatedAt(now);
        catalog = catalogRepository.save(catalog);

        ProcessDefinitionVersion version = new ProcessDefinitionVersion();
        version.setId(UUID.randomUUID());
        version.setCatalogId(catalog.getId());
        version.setCamundaVersion(deployed.version());
        version.setResourceName(deployed.resourceName());
        version.setChecksumSha256(bpmn.checksumSha256());
        version.setCamundaDeploymentKey(deployed.deploymentKey());
        version.setCamundaProcessDefinitionKey(deployed.processDefinitionKey());
        version.setStatus(ProcessDefinitionStatus.DEPLOYED);
        version.setImportedBy(normalizeActor(actor));
        version.setImportedAt(now);
        version.setBpmnXml(bpmn.xml());
        version.getWarnings().addAll(bpmn.warnings());
        version = versionRepository.save(version);

        // Sinh luật hành động chạy SAU COMMIT (xem DeployedProcessPolicyScaffolder) — quy trình mới
        // vẽ xong là bấm duyệt được luôn, mà lỗi sinh luật không kéo đổ dòng catalog vừa ghi.
        events.publishEvent(new ProcessDeployedEvent(catalog.getBpmnProcessId(), actor));

        return new ProcessDefinitionImportResponse(catalog.getId(), version.getId(), catalog.getBpmnProcessId(),
                catalog.getName(), version.getResourceName(), version.getCamundaDeploymentKey(),
                version.getCamundaProcessDefinitionKey(), version.getCamundaVersion(), version.getStatus(),
                version.getChecksumSha256(), version.getImportedBy(), version.getImportedAt(),
                List.copyOf(version.getWarnings()));
    }

    @Transactional(readOnly = true)
    public List<ProcessDefinitionSummaryResponse> list() {
        return catalogRepository.findAll().stream().map(catalog -> {
            ProcessDefinitionVersion latest = latest(catalog.getId());
            return new ProcessDefinitionSummaryResponse(catalog.getId(), catalog.getBpmnProcessId(),
                    catalog.getName(), latest.getCamundaVersion(), latest.getResourceName(), latest.getStatus(),
                    latest.getSource(), catalog.getUpdatedAt());
        }).toList();
    }

    /**
     * Danh sách quy trình người dùng chọn được khi gửi duyệt — thay cho bảng hardcode 4 mã theo
     * (loại hồ sơ, cấp) từng nằm ở `ho-so-detail.ts`.
     *
     * Catalog chưa có version deploy thành công thì bị bỏ qua (không ném lỗi như {@link #list()}):
     * một dòng catalog hỏng không được phép làm rỗng cả danh sách chọn của người dùng.
     */
    @Transactional(readOnly = true)
    public List<SelectableProcessResponse> selectable() {
        Map<String, Integer> userTaskCounts = routingReader.processes().stream()
                .collect(Collectors.toMap(ProcessRoutingResponse::code, routing -> routing.steps().size(),
                        (first, ignored) -> first));
        return catalogRepository.findAllByOrderByBpmnProcessIdAsc().stream()
                .map(catalog -> versionRepository.findFirstByCatalogIdOrderByCamundaVersionDesc(catalog.getId())
                        .map(version -> new SelectableProcessResponse(catalog.getId(), catalog.getBpmnProcessId(),
                                catalog.getName(), version.getCamundaVersion(),
                                userTaskCounts.getOrDefault(catalog.getBpmnProcessId(), 0),
                                catalog.getUpdatedAt())))
                .flatMap(Optional::stream)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProcessDefinitionDetailResponse get(UUID id) {
        ProcessDefinitionCatalog catalog = catalog(id);
        return new ProcessDefinitionDetailResponse(catalog.getId(), catalog.getBpmnProcessId(), catalog.getName(),
                catalog.getCreatedAt(), catalog.getUpdatedAt(), ProcessDefinitionVersionResponse.from(latest(id)));
    }

    /** Read model used by dossier detail, where the workflow reference is the BPMN process id. */
    @Transactional(readOnly = true)
    public ProcessDefinitionDetailResponse getByBpmnProcessId(String bpmnProcessId) {
        ProcessDefinitionCatalog catalog = catalogRepository.findByBpmnProcessId(bpmnProcessId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy process definition " + bpmnProcessId));
        return new ProcessDefinitionDetailResponse(catalog.getId(), catalog.getBpmnProcessId(), catalog.getName(),
                catalog.getCreatedAt(), catalog.getUpdatedAt(),
                ProcessDefinitionVersionResponse.from(latest(catalog.getId())));
    }

    @Transactional(readOnly = true)
    public List<ProcessDefinitionVersionResponse> versions(UUID id) {
        catalog(id);
        return versionRepository.findByCatalogIdOrderByCamundaVersionDesc(id).stream()
                .map(ProcessDefinitionVersionResponse::from).toList();
    }

    private ProcessDefinitionCatalog catalog(UUID id) {
        return catalogRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy process definition catalog " + id));
    }

    private ProcessDefinitionVersion latest(UUID id) {
        return versionRepository.findFirstByCatalogIdOrderByCamundaVersionDesc(id)
                .orElseThrow(() -> new IllegalStateException("Catalog " + id + " chưa có version deploy thành công."));
    }

    private static ProcessDefinitionCatalog newCatalog(ValidatedBpmn bpmn, OffsetDateTime now) {
        ProcessDefinitionCatalog catalog = new ProcessDefinitionCatalog();
        catalog.setId(UUID.randomUUID());
        catalog.setBpmnProcessId(bpmn.bpmnProcessId());
        catalog.setName(bpmn.processName());
        catalog.setCreatedAt(now);
        catalog.setUpdatedAt(now);
        return catalog;
    }

    public static String normalizeActor(String actor) {
        if (actor == null || actor.isBlank()) {
            return "dev-api-key";
        }
        String normalized = actor.trim();
        if (normalized.regionMatches(true, 0, "UTF-8''", 0, 7)) {
            try {
                normalized = URLDecoder.decode(normalized.substring(7), StandardCharsets.UTF_8);
            } catch (IllegalArgumentException ignored) {
                // Keep the original value so malformed audit metadata never blocks the business request.
            }
        }
        normalized = normalized.trim();
        return normalized.length() <= 255 ? normalized : normalized.substring(0, 255);
    }
}

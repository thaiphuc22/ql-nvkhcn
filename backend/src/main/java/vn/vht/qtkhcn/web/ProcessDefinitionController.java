package vn.vht.qtkhcn.web;

import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import vn.vht.qtkhcn.service.DeployedProcessImportService;
import vn.vht.qtkhcn.service.ProcessDefinitionService;
import vn.vht.qtkhcn.service.ProcessInstanceOverviewService;
import vn.vht.qtkhcn.service.ProcessReadinessService;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionDetailResponse;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionImportResponse;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionSummaryResponse;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionVersionResponse;
import vn.vht.qtkhcn.web.dto.ProcessInstanceOverviewDtos.RunningInstanceCountsResponse;
import vn.vht.qtkhcn.web.dto.ProcessInstanceOverviewDtos.RunningInstanceListResponse;
import vn.vht.qtkhcn.web.dto.ProcessReadinessResponse;
import vn.vht.qtkhcn.web.dto.ProcessSyncResponse;
import vn.vht.qtkhcn.web.dto.SelectableProcessResponse;

@RestController
@RequestMapping("/api/process-definitions")
public class ProcessDefinitionController {

    private final ProcessDefinitionService service;
    private final ProcessInstanceOverviewService instanceOverviewService;
    private final DeployedProcessImportService importService;
    private final ProcessReadinessService readinessService;

    public ProcessDefinitionController(ProcessDefinitionService service,
            ProcessInstanceOverviewService instanceOverviewService,
            DeployedProcessImportService importService,
            ProcessReadinessService readinessService) {
        this.service = service;
        this.instanceOverviewService = instanceOverviewService;
        this.importService = importService;
        this.readinessService = readinessService;
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProcessDefinitionImportResponse> importBpmn(
            @RequestPart("file") MultipartFile file,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        // X-QTKHCN-Actor is audit metadata only. DevApiKeyFilter remains the authorization gate;
        // production identity/permission enforcement replaces both when OQ-021/OQ-006 are decided.
        return ResponseEntity.status(HttpStatus.CREATED).body(service.importBpmn(file, actor));
    }

    @GetMapping
    public List<ProcessDefinitionSummaryResponse> list() {
        return service.list();
    }

    /**
     * Hút quy trình deploy thẳng lên Camunda về catalog. POST vì có ghi dữ liệu, và chủ động (bấm
     * nút) thay vì chạy nền — xem {@link vn.vht.qtkhcn.service.DeployedProcessImportService}.
     */
    @PostMapping("/sync-from-camunda")
    public ProcessSyncResponse syncFromCamunda(
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return importService.syncFromCamunda(actor);
    }

    /**
     * Quy trình người dùng chọn được khi gửi duyệt. Tách khỏi {@link #list()} vì đây là read model
     * nghiệp vụ (ai cũng gọi được để chọn), còn {@code list()} là màn quản trị `/quy-trinh`.
     */
    @GetMapping("/selectable")
    public List<SelectableProcessResponse> selectable() {
        return service.selectable();
    }

    /**
     * Separate from {@link #list()} on purpose: the catalog is a PostgreSQL read, this one talks to
     * Camunda. Keeping them apart means an engine outage degrades one column instead of the whole grid.
     */
    @GetMapping("/running-instances")
    public RunningInstanceCountsResponse runningInstanceCounts() {
        return instanceOverviewService.runningCounts();
    }

    @GetMapping("/{id}/running-instances")
    public RunningInstanceListResponse runningInstances(@PathVariable UUID id) {
        return instanceOverviewService.runningInstances(id);
    }

    @GetMapping("/by-bpmn-process-id/{bpmnProcessId}")
    public ProcessDefinitionDetailResponse getByBpmnProcessId(@PathVariable String bpmnProcessId) {
        return service.getByBpmnProcessId(bpmnProcessId);
    }

    /**
     * Đối soát quy trình: biểu mẫu, vai trò, luật hành động, service task có worker chưa. Đọc-thôi,
     * không chặn gì — xem {@link vn.vht.qtkhcn.service.ProcessReadinessService}.
     */
    @GetMapping("/by-bpmn-process-id/{bpmnProcessId}/readiness")
    public ProcessReadinessResponse readiness(@PathVariable String bpmnProcessId) {
        return readinessService.readiness(bpmnProcessId);
    }

    @GetMapping("/{id}")
    public ProcessDefinitionDetailResponse get(@PathVariable UUID id) {
        return service.get(id);
    }

    @GetMapping("/{id}/versions")
    public List<ProcessDefinitionVersionResponse> versions(@PathVariable UUID id) {
        return service.versions(id);
    }
}

package vn.vht.qtkhcn.web;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import vn.vht.qtkhcn.service.ProcessDefinitionDraftService;
import vn.vht.qtkhcn.domain.ProcessDefinitionDraftStatus;
import vn.vht.qtkhcn.web.dto.CreateProcessDefinitionDraftRequest;
import vn.vht.qtkhcn.web.dto.ExpectedDraftRevisionRequest;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionDraftResponse;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionDraftSummaryResponse;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionDraftValidationResponse;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionImportResponse;
import vn.vht.qtkhcn.web.dto.UpdateProcessDefinitionDraftRequest;

@RestController
@RequestMapping("/api/process-definition-drafts")
public class ProcessDefinitionDraftController {
    private final ProcessDefinitionDraftService service;

    public ProcessDefinitionDraftController(ProcessDefinitionDraftService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ProcessDefinitionDraftResponse> create(
            @Valid @RequestBody CreateProcessDefinitionDraftRequest request,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request, actor));
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProcessDefinitionDraftResponse> importBpmn(
            @RequestParam("file") MultipartFile file,
            @RequestParam("bpmnProcessId") String bpmnProcessId,
            @RequestParam("name") String name,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.importBpmn(file, bpmnProcessId, name, actor));
    }

    @GetMapping
    public List<ProcessDefinitionDraftSummaryResponse> list(
            @RequestParam(value = "status", required = false) ProcessDefinitionDraftStatus status,
            @RequestParam(value = "bpmnProcessId", required = false) String bpmnProcessId,
            @RequestParam(value = "q", required = false) String query) {
        return service.list(status, bpmnProcessId, query);
    }

    @GetMapping("/{id}")
    public ProcessDefinitionDraftResponse get(@PathVariable UUID id) {
        return service.get(id);
    }

    @PutMapping("/{id}")
    public ProcessDefinitionDraftResponse update(@PathVariable UUID id,
            @Valid @RequestBody UpdateProcessDefinitionDraftRequest request,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return service.update(id, request, actor);
    }

    @PostMapping("/{id}/validate")
    public ProcessDefinitionDraftValidationResponse validate(@PathVariable UUID id,
            @Valid @RequestBody ExpectedDraftRevisionRequest request,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return service.validate(id, request.expectedRevision(), actor);
    }

    @PostMapping("/{id}/deploy")
    public ProcessDefinitionImportResponse deploy(@PathVariable UUID id,
            @Valid @RequestBody ExpectedDraftRevisionRequest request,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return service.deploy(id, request.expectedRevision(), actor);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id,
            @RequestParam("expectedRevision") long expectedRevision) {
        service.delete(id, expectedRevision);
        return ResponseEntity.noContent().build();
    }
}

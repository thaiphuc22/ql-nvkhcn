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
import vn.vht.qtkhcn.service.ProcessDefinitionService;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionDetailResponse;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionImportResponse;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionSummaryResponse;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionVersionResponse;

@RestController
@RequestMapping("/api/process-definitions")
public class ProcessDefinitionController {

    private final ProcessDefinitionService service;

    public ProcessDefinitionController(ProcessDefinitionService service) {
        this.service = service;
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

    @GetMapping("/{id}")
    public ProcessDefinitionDetailResponse get(@PathVariable UUID id) {
        return service.get(id);
    }

    @GetMapping("/{id}/versions")
    public List<ProcessDefinitionVersionResponse> versions(@PathVariable UUID id) {
        return service.versions(id);
    }
}

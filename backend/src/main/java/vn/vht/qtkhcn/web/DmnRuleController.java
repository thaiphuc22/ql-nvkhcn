package vn.vht.qtkhcn.web;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.vht.qtkhcn.domain.DmnRuleCategory;
import vn.vht.qtkhcn.domain.DmnRuleStatus;
import vn.vht.qtkhcn.service.DmnRuleService;
import vn.vht.qtkhcn.web.dto.CreateDmnRuleRequest;
import vn.vht.qtkhcn.web.dto.DmnRuleDetailResponse;
import vn.vht.qtkhcn.web.dto.DmnRuleSummaryResponse;
import vn.vht.qtkhcn.web.dto.DmnRuleVersionResponse;
import vn.vht.qtkhcn.web.dto.DmnRuleVersionSummaryResponse;
import vn.vht.qtkhcn.web.dto.ExpectedDmnVersionRequest;
import vn.vht.qtkhcn.web.dto.SaveDmnRuleVersionRequest;
import vn.vht.qtkhcn.web.dto.EvaluateDmnDecisionRequest;
import vn.vht.qtkhcn.web.dto.EvaluateDmnDecisionResponse;
import vn.vht.qtkhcn.domain.DmnDeployStatus;
import vn.vht.qtkhcn.camunda.DmnCamundaException;

@RestController
@RequestMapping("/api/dmn-rules")
public class DmnRuleController {
    private final DmnRuleService service;

    public DmnRuleController(DmnRuleService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<DmnRuleDetailResponse> create(
            @Valid @RequestBody CreateDmnRuleRequest request,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request, actor));
    }

    @GetMapping
    public List<DmnRuleSummaryResponse> list(
            @RequestParam(value = "status", required = false) DmnRuleStatus status,
            @RequestParam(value = "category", required = false) DmnRuleCategory category,
            @RequestParam(value = "q", required = false) String query) {
        return service.list(status, category, query);
    }

    @GetMapping("/{id}")
    public DmnRuleDetailResponse get(@PathVariable UUID id) {
        return service.get(id);
    }

    @GetMapping("/{id}/versions")
    public List<DmnRuleVersionSummaryResponse> listVersions(@PathVariable UUID id) {
        return service.listVersions(id);
    }

    @GetMapping("/{id}/versions/{version}")
    public DmnRuleVersionResponse getVersion(@PathVariable UUID id, @PathVariable int version) {
        return service.getVersion(id, version);
    }

    @PostMapping("/{id}/versions")
    public ResponseEntity<DmnRuleVersionResponse> saveVersion(
            @PathVariable UUID id,
            @Valid @RequestBody SaveDmnRuleVersionRequest request,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.saveVersion(id, request, actor));
    }

    @PostMapping("/{id}/versions/{version}/activate")
    public DmnRuleDetailResponse activate(
            @PathVariable UUID id,
            @PathVariable int version,
            @Valid @RequestBody ExpectedDmnVersionRequest request,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        DmnRuleDetailResponse response = service.activate(id, version, request.expectedVersion(), actor);
        var deployedVersion = response.versions().stream()
                .filter(item -> item.version() == version).findFirst().orElseThrow();
        if (deployedVersion.deployStatus() == DmnDeployStatus.FAILED) {
            throw new DmnCamundaException("Camunda từ chối hoặc không thể deploy DMN.",
                    deployedVersion.deployError(), null);
        }
        return response;
    }

    @PostMapping("/{id}/evaluate")
    public EvaluateDmnDecisionResponse evaluate(@PathVariable UUID id,
            @Valid @RequestBody EvaluateDmnDecisionRequest request) {
        return service.evaluate(id, request.variables());
    }

    @PostMapping("/{id}/disable")
    public DmnRuleDetailResponse disable(
            @PathVariable UUID id,
            @Valid @RequestBody ExpectedDmnVersionRequest request,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return service.disable(id, request.expectedVersion(), actor);
    }
}

package vn.vht.qtkhcn.web;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vht.qtkhcn.service.ApprovalMatrixService;
import vn.vht.qtkhcn.web.dto.AnalyzeApprovalRequest;
import vn.vht.qtkhcn.web.dto.ApprovalRuleAuditResponse;
import vn.vht.qtkhcn.web.dto.ApprovalRuleResponse;
import vn.vht.qtkhcn.web.dto.ApprovalRuleVersionResponse;
import vn.vht.qtkhcn.web.dto.ApprovalRuleWarningResponse;
import vn.vht.qtkhcn.web.dto.CreateApprovalRuleRequest;
import vn.vht.qtkhcn.web.dto.ResolveApprovalRequest;
import vn.vht.qtkhcn.web.dto.ResolveApprovalResponse;
import vn.vht.qtkhcn.web.dto.SetApprovalStatusRequest;
import vn.vht.qtkhcn.web.dto.UpdateApprovalRuleRequest;

@RestController
@RequestMapping("/api/approval-matrix")
public class ApprovalMatrixController {
    private final ApprovalMatrixService service;

    public ApprovalMatrixController(ApprovalMatrixService service) {
        this.service = service;
    }

    @GetMapping("/rules")
    public List<ApprovalRuleResponse> list() {
        return service.list();
    }

    @GetMapping("/rules/{id}")
    public ApprovalRuleResponse get(@PathVariable String id) {
        return service.get(id);
    }

    @PostMapping("/rules")
    public ResponseEntity<ApprovalRuleResponse> create(@Valid @RequestBody CreateApprovalRuleRequest request,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request, actor));
    }

    @PutMapping("/rules/{id}")
    public ApprovalRuleResponse update(@PathVariable String id,
            @RequestHeader("If-Match") int expectedVersion,
            @Valid @RequestBody UpdateApprovalRuleRequest request,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return service.update(id, expectedVersion, request, actor);
    }

    @PostMapping("/rules/{id}/status")
    public ApprovalRuleResponse setStatus(@PathVariable String id,
            @Valid @RequestBody SetApprovalStatusRequest request,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        if (request.expectedVersion() == null) {
            throw new IllegalArgumentException("expectedVersion là bắt buộc khi đổi trạng thái luật.");
        }
        String status = request.status().trim().toLowerCase(java.util.Locale.ROOT);
        if (!java.util.Set.of("active", "inactive", "enabled", "disabled").contains(status)) {
            throw new IllegalArgumentException("Trạng thái luật chỉ chấp nhận active/inactive.");
        }
        return service.setEnabled(id, request.expectedVersion(),
                status.equals("active") || status.equals("enabled"), actor);
    }

    @DeleteMapping("/rules/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id,
            @RequestHeader("If-Match") int expectedVersion,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        service.delete(id, expectedVersion, actor);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/rules/{id}/versions")
    public List<ApprovalRuleVersionResponse> versions(@PathVariable String id) {
        return service.versions(id);
    }

    @GetMapping("/rules/{id}/audit")
    public List<ApprovalRuleAuditResponse> audit(@PathVariable String id) {
        return service.audit(id);
    }

    @PostMapping("/resolve")
    public ResolveApprovalResponse resolve(@Valid @RequestBody ResolveApprovalRequest request) {
        return service.resolve(request);
    }

    @PostMapping("/analyze")
    public List<ApprovalRuleWarningResponse> analyze(
            @RequestBody(required = false) AnalyzeApprovalRequest request) {
        return service.analyze(request);
    }
}

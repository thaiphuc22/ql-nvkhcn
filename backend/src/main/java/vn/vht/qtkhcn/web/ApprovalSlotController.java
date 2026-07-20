package vn.vht.qtkhcn.web;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.vht.qtkhcn.service.ApprovalSlotService;
import vn.vht.qtkhcn.web.dto.ApprovalSlotResponse;
import vn.vht.qtkhcn.web.dto.CreateApprovalSlotRequest;
import vn.vht.qtkhcn.web.dto.SetApprovalStatusRequest;
import vn.vht.qtkhcn.web.dto.UpdateApprovalSlotRequest;

@RestController
@RequestMapping("/api/approval-matrix/slots")
public class ApprovalSlotController {
    private final ApprovalSlotService service;

    public ApprovalSlotController(ApprovalSlotService service) {
        this.service = service;
    }

    @GetMapping
    public List<ApprovalSlotResponse> list() {
        return service.list();
    }

    @PostMapping
    public ResponseEntity<ApprovalSlotResponse> create(@Valid @RequestBody CreateApprovalSlotRequest request,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request, actor));
    }

    @PutMapping("/{code}")
    public ApprovalSlotResponse update(@PathVariable String code,
            @Valid @RequestBody UpdateApprovalSlotRequest request,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return service.update(code, request, actor);
    }

    @PostMapping("/{code}/status")
    public ApprovalSlotResponse setStatus(@PathVariable String code,
            @RequestParam(defaultValue = "false") boolean force,
            @Valid @RequestBody SetApprovalStatusRequest request,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return service.setStatus(code, request.status(), force, actor);
    }
}

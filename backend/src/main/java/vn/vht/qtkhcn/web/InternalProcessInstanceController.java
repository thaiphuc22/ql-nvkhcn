package vn.vht.qtkhcn.web;

import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vht.qtkhcn.service.IdempotentProcessStartService;
import vn.vht.qtkhcn.web.dto.StartProcessRequest;
import vn.vht.qtkhcn.web.dto.StartProcessResponse;

@RestController
@RequestMapping("/internal/v1/process-instances")
public class InternalProcessInstanceController {
    private final IdempotentProcessStartService service;
    public InternalProcessInstanceController(IdempotentProcessStartService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<StartProcessResponse> start(
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @RequestHeader("traceparent") String traceparent,
            @Valid @RequestBody StartProcessRequest request) {
        UUID headerId;
        try { headerId = UUID.fromString(idempotencyKey); }
        catch (IllegalArgumentException e) { throw new IllegalArgumentException("Idempotency-Key phai la UUID."); }
        if (!headerId.equals(request.requestId())) {
            throw new IllegalArgumentException("Idempotency-Key phai trung requestId.");
        }
        if (traceparent.isBlank()) throw new IllegalArgumentException("traceparent khong duoc rong.");
        var result = service.start(request);
        return ResponseEntity.status(result.created() ? HttpStatus.CREATED : HttpStatus.OK)
                .body(result.response());
    }
}

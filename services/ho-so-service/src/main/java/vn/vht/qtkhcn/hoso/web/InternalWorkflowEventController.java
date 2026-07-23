package vn.vht.qtkhcn.hoso.web;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vht.qtkhcn.hoso.integration.WorkflowEventEnvelope;
import vn.vht.qtkhcn.hoso.service.WorkflowEventInboxService;

@RestController
@RequestMapping("/internal/v1/workflow-events")
public class InternalWorkflowEventController {
    private final WorkflowEventInboxService service;

    public InternalWorkflowEventController(WorkflowEventInboxService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Void> receive(@Valid @RequestBody WorkflowEventEnvelope event) {
        var result = service.receive(event);
        return ResponseEntity.status(result.created() ? HttpStatus.ACCEPTED : HttpStatus.OK).build();
    }
}

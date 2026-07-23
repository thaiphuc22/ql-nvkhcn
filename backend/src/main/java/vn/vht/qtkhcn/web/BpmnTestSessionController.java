package vn.vht.qtkhcn.web;

import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import vn.vht.qtkhcn.service.BpmnTestSessionService;
import vn.vht.qtkhcn.web.dto.*;

@RestController
@RequestMapping("/api/bpmn-tests")
public class BpmnTestSessionController {
    private final BpmnTestSessionService service;
    public BpmnTestSessionController(BpmnTestSessionService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<BpmnTestSessionResponse> create(@Valid @RequestBody CreateBpmnTestRequest request,
            @RequestHeader(value="X-QTKHCN-Actor", required=false) String actor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request, actor));
    }
    @GetMapping("/{id}") public BpmnTestSessionResponse get(@PathVariable UUID id) { return service.get(id); }
    @PostMapping("/{id}/tasks/{taskKey}/complete")
    public BpmnTestSessionResponse complete(@PathVariable UUID id, @PathVariable long taskKey,
            @RequestBody(required=false) CompleteBpmnTestTaskRequest request) {
        return service.completeTask(id, taskKey, request == null ? null : request.variables());
    }
    @PostMapping("/{id}/incidents/{incidentKey}/resolve")
    public BpmnTestSessionResponse resolveIncident(@PathVariable UUID id, @PathVariable long incidentKey,
            @RequestBody(required=false) ResolveBpmnTestIncidentRequest request) {
        return service.resolveIncident(id, incidentKey, request == null ? null : request.variables());
    }
    @PostMapping("/{id}/jobs/{jobKey}/bypass")
    public BpmnTestSessionResponse bypassServiceTask(@PathVariable UUID id, @PathVariable long jobKey,
            @RequestBody(required=false) BypassBpmnTestServiceTaskRequest request) {
        return service.bypassServiceTask(id, jobKey, request == null ? null : request.variables());
    }
    @DeleteMapping("/{id}") public BpmnTestSessionResponse cancel(@PathVariable UUID id) { return service.cancel(id); }
}

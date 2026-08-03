package vn.vht.qtkhcn.web;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.vht.qtkhcn.service.DossierActionService;
import vn.vht.qtkhcn.web.dto.DossierActionDtos.*;

@RestController
@RequestMapping("/api/dossiers")
public class DossierActionController {
    private final DossierActionService service;
    public DossierActionController(DossierActionService service) { this.service = service; }
    @GetMapping("/{id}/available-actions")
    public AvailableActionsResponse available(@PathVariable String id,
            @RequestHeader(name="X-QTKHCN-User-Id", required=false) String user) { return service.available(id, user); }
    @PostMapping("/{id}/actions")
    public ResponseEntity<ExecuteActionResponse> execute(@PathVariable String id,
            @RequestHeader(name="X-QTKHCN-User-Id", required=false) String user,
            @Valid @RequestBody ExecuteActionRequest request) {
        return ResponseEntity.accepted().body(service.execute(id, request, user));
    }
}

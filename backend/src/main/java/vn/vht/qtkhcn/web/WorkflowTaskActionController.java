package vn.vht.qtkhcn.web;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vht.qtkhcn.service.WorkflowTaskActionService;
import vn.vht.qtkhcn.web.dto.TaskActionDtos.AvailableActionsResponse;
import vn.vht.qtkhcn.web.dto.TaskActionDtos.ExecuteActionRequest;
import vn.vht.qtkhcn.web.dto.TaskActionDtos.ExecuteActionResponse;

@RestController
@RequestMapping("/api/tasks")
public class WorkflowTaskActionController {
    private static final String USER_ID = "X-QTKHCN-User-Id";
    private final WorkflowTaskActionService service;

    public WorkflowTaskActionController(WorkflowTaskActionService service) {
        this.service = service;
    }

    @GetMapping("/{taskKey}/available-actions")
    public AvailableActionsResponse available(@PathVariable String taskKey,
            @RequestHeader(name = USER_ID, required = false) String userId) {
        return service.available(taskKey, userId);
    }

    @PostMapping("/{taskKey}/actions")
    public ResponseEntity<ExecuteActionResponse> execute(@PathVariable String taskKey,
            @RequestHeader(name = USER_ID, required = false) String userId,
            @Valid @RequestBody ExecuteActionRequest request) {
        return ResponseEntity.accepted().body(service.execute(taskKey, request, userId));
    }
}

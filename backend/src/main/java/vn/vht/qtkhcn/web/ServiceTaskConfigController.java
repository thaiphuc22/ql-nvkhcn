package vn.vht.qtkhcn.web;

import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import jakarta.validation.Valid;
import vn.vht.qtkhcn.service.ServiceTaskCommandService;
import vn.vht.qtkhcn.web.dto.ServiceTaskDtos.DefinitionWriteRequest;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.vht.qtkhcn.domain.ServiceTaskDefinitionStatus;
import vn.vht.qtkhcn.service.ServiceTaskQueryService;
import vn.vht.qtkhcn.web.dto.ServiceTaskDtos.Binding;
import vn.vht.qtkhcn.web.dto.ServiceTaskDtos.DefinitionDetail;
import vn.vht.qtkhcn.web.dto.ServiceTaskDtos.DefinitionSummary;

/** API CRUD cấu hình tác vụ hệ thống. Mỗi lần cập nhật tạo một config version bất biến mới. */
@RestController
@RequestMapping("/api/service-tasks")
public class ServiceTaskConfigController {

    private final ServiceTaskQueryService service;
    private final ServiceTaskCommandService commands;

    public ServiceTaskConfigController(ServiceTaskQueryService service, ServiceTaskCommandService commands) {
        this.service = service;
        this.commands = commands;
    }

    @GetMapping
    public List<DefinitionSummary> list(
            @RequestParam(value = "status", required = false) ServiceTaskDefinitionStatus status,
            @RequestParam(value = "q", required = false) String query) {
        return service.list(status, query);
    }

    @GetMapping("/bindings")
    public List<Binding> listBindings() {
        return service.listBindings();
    }

    @GetMapping("/{id}")
    public DefinitionDetail get(@PathVariable UUID id) {
        return service.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DefinitionDetail create(@Valid @RequestBody DefinitionWriteRequest request) {
        return service.get(commands.create(request));
    }

    @PutMapping("/{id}")
    public DefinitionDetail update(@PathVariable UUID id, @Valid @RequestBody DefinitionWriteRequest request) {
        commands.update(id, request);
        return service.get(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        commands.delete(id);
    }
}

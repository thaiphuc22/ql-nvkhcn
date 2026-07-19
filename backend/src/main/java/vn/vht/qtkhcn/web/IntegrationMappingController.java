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
import vn.vht.qtkhcn.service.IntegrationMappingService;
import vn.vht.qtkhcn.web.dto.IntegrationMappingDtos.CreateMappingRequest;
import vn.vht.qtkhcn.web.dto.IntegrationMappingDtos.IntegrationMappingResponse;
import vn.vht.qtkhcn.web.dto.IntegrationMappingDtos.StatusChangeResult;
import vn.vht.qtkhcn.web.dto.IntegrationMappingDtos.UpdateFieldsRequest;
import vn.vht.qtkhcn.web.dto.IntegrationMappingDtos.UpdateStatusRequest;

@RestController
@RequestMapping("/api/integration-mappings")
public class IntegrationMappingController {
    private final IntegrationMappingService service;

    public IntegrationMappingController(IntegrationMappingService service) {
        this.service = service;
    }

    @GetMapping
    public List<IntegrationMappingResponse> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public IntegrationMappingResponse get(@PathVariable String id) {
        return service.get(id);
    }

    @PostMapping
    public ResponseEntity<IntegrationMappingResponse> create(@Valid @RequestBody CreateMappingRequest request,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request, actor));
    }

    @PutMapping("/{id}/fields")
    public IntegrationMappingResponse updateFields(@PathVariable String id, @Valid @RequestBody UpdateFieldsRequest request,
            @RequestHeader("If-Match") String ifMatch,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return service.updateFields(id, request, version(ifMatch), actor);
    }

    @PutMapping("/{id}/status")
    public StatusChangeResult updateStatus(@PathVariable String id, @Valid @RequestBody UpdateStatusRequest request,
            @RequestHeader("If-Match") String ifMatch,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return service.updateStatus(id, request.status(), version(ifMatch), actor);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id, @RequestHeader("If-Match") String ifMatch) {
        service.delete(id, version(ifMatch));
        return ResponseEntity.noContent().build();
    }

    private static long version(String header) {
        try {
            String normalized = header.trim();
            if (normalized.startsWith("W/")) normalized = normalized.substring(2);
            normalized = normalized.replace("\"", "");
            return Long.parseLong(normalized);
        } catch (RuntimeException e) {
            throw new IllegalArgumentException("If-Match phải là version số hợp lệ.");
        }
    }
}

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
import vn.vht.qtkhcn.service.EformService;
import vn.vht.qtkhcn.web.dto.EformDtos.CreateEformRequest;
import vn.vht.qtkhcn.web.dto.EformDtos.EformResponse;
import vn.vht.qtkhcn.web.dto.EformDtos.UpdateMetaRequest;
import vn.vht.qtkhcn.web.dto.EformDtos.UpdateSchemaRequest;

@RestController
@RequestMapping("/api/eform")
public class EformController {
    private final EformService service;

    public EformController(EformService service) {
        this.service = service;
    }

    @GetMapping
    public List<EformResponse> list() {
        return service.list();
    }

    @GetMapping("/{key}")
    public EformResponse get(@PathVariable String key) {
        return service.get(key);
    }

    @GetMapping("/{key}/versions/{version}")
    public EformResponse getVersion(@PathVariable String key, @PathVariable long version) {
        return service.getVersion(key, version);
    }

    @PostMapping
    public ResponseEntity<EformResponse> create(@Valid @RequestBody CreateEformRequest request,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request, actor));
    }

    @PutMapping("/{key}/meta")
    public EformResponse updateMeta(@PathVariable String key, @Valid @RequestBody UpdateMetaRequest request,
            @RequestHeader("If-Match") String ifMatch,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return service.updateMeta(key, request, version(ifMatch), actor);
    }

    @PutMapping("/{key}/schema")
    public EformResponse updateSchema(@PathVariable String key, @Valid @RequestBody UpdateSchemaRequest request,
            @RequestHeader("If-Match") String ifMatch,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return service.updateSchema(key, request, version(ifMatch), actor);
    }

    @DeleteMapping("/{key}")
    public ResponseEntity<Void> delete(@PathVariable String key, @RequestHeader("If-Match") String ifMatch) {
        service.delete(key, version(ifMatch));
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

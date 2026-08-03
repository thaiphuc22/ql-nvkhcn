package vn.vht.qtkhcn.web;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vht.qtkhcn.service.IntegrationSystemService;
import vn.vht.qtkhcn.web.dto.IntegrationSystemDtos.ConnectSystemRequest;
import vn.vht.qtkhcn.web.dto.IntegrationSystemDtos.IntegrationSystemResponse;
import vn.vht.qtkhcn.web.dto.IntegrationSystemDtos.JobRunResponse;

@RestController
@RequestMapping("/api/integration-systems")
public class IntegrationSystemController {
    private final IntegrationSystemService service;

    public IntegrationSystemController(IntegrationSystemService service) {
        this.service = service;
    }

    @GetMapping
    public List<IntegrationSystemResponse> list() {
        return service.list();
    }

    @GetMapping("/{key}/job-runs")
    public List<JobRunResponse> jobRuns(@PathVariable String key) {
        return service.jobRuns(key);
    }

    @PostMapping("/{key}/connect")
    public IntegrationSystemResponse connect(@PathVariable String key, @Valid @RequestBody ConnectSystemRequest request,
            @RequestHeader("If-Match") String ifMatch,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return service.connect(key, request, version(ifMatch), actor);
    }

    @PostMapping("/{key}/disconnect")
    public IntegrationSystemResponse disconnect(@PathVariable String key,
            @RequestHeader("If-Match") String ifMatch,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return service.disconnect(key, version(ifMatch), actor);
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

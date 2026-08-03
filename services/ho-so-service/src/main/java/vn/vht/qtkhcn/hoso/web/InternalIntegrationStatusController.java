package vn.vht.qtkhcn.hoso.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vht.qtkhcn.hoso.service.InternalIntegrationStatusService;
import vn.vht.qtkhcn.hoso.web.dto.InternalIntegrationStatusResponse;

@RestController
@RequestMapping("/api/internal-integration/status")
public class InternalIntegrationStatusController {
    private final InternalIntegrationStatusService service;

    public InternalIntegrationStatusController(InternalIntegrationStatusService service) {
        this.service = service;
    }

    @GetMapping
    public InternalIntegrationStatusResponse getStatus() {
        return service.getStatus();
    }
}

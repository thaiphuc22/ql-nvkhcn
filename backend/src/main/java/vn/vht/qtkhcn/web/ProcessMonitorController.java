package vn.vht.qtkhcn.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vht.qtkhcn.service.ProcessMonitorService;
import vn.vht.qtkhcn.web.dto.ProcessMonitorResponse;

@RestController
@RequestMapping("/api/process-monitor")
public class ProcessMonitorController {
    private final ProcessMonitorService service;

    public ProcessMonitorController(ProcessMonitorService service) {
        this.service = service;
    }

    @GetMapping
    public ProcessMonitorResponse snapshot() {
        return service.snapshot();
    }
}

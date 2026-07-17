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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.vht.qtkhcn.service.ActionStudioService;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ActionResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.AvailabilityRequest;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.AvailabilityResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ConfigResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ExceptionRequest;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ExceptionResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.PresentationRequest;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.PresentationResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ReconcileResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ScaffoldResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.SimulatedActionResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.SimulationRequest;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.StatusRequest;

@RestController
@RequestMapping("/api/action-studio")
public class ActionStudioController {
    private final ActionStudioService service;

    public ActionStudioController(ActionStudioService service) {
        this.service = service;
    }

    @GetMapping
    public ConfigResponse load() {
        return service.load();
    }

    @PutMapping("/actions/{code}/presentation")
    public PresentationResponse updatePresentation(@PathVariable String code,
            @Valid @RequestBody PresentationRequest request,
            @RequestHeader("If-Match") String ifMatch,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return service.updatePresentation(code, request, version(ifMatch), actor);
    }

    @PostMapping("/actions/{code}/status")
    public ActionResponse setActionStatus(@PathVariable String code,
            @Valid @RequestBody StatusRequest request,
            @RequestHeader("If-Match") String ifMatch,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return service.setActionStatus(code, request.enabled(), version(ifMatch), actor);
    }

    @PostMapping("/availability-policies")
    public ResponseEntity<AvailabilityResponse> createAvailability(@Valid @RequestBody AvailabilityRequest request,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createAvailability(request, actor));
    }

    @PutMapping("/availability-policies/{id}")
    public AvailabilityResponse updateAvailability(@PathVariable String id,
            @Valid @RequestBody AvailabilityRequest request,
            @RequestHeader("If-Match") String ifMatch,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return service.updateAvailability(id, request, version(ifMatch), actor);
    }

    @DeleteMapping("/availability-policies/{id}")
    public ResponseEntity<Void> deleteAvailability(@PathVariable String id,
            @RequestHeader("If-Match") String ifMatch,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        service.deleteAvailability(id, version(ifMatch), actor);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/exception-policies")
    public ResponseEntity<ExceptionResponse> createException(@Valid @RequestBody ExceptionRequest request,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createException(request, actor));
    }

    @PutMapping("/exception-policies/{id}")
    public ExceptionResponse updateException(@PathVariable String id,
            @Valid @RequestBody ExceptionRequest request,
            @RequestHeader("If-Match") String ifMatch,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return service.updateException(id, request, version(ifMatch), actor);
    }

    @DeleteMapping("/exception-policies/{id}")
    public ResponseEntity<Void> deleteException(@PathVariable String id,
            @RequestHeader("If-Match") String ifMatch,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        service.deleteException(id, version(ifMatch), actor);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/simulate")
    public List<SimulatedActionResponse> simulate(@Valid @RequestBody SimulationRequest request) {
        return service.simulate(request);
    }

    @GetMapping("/reconcile")
    public List<ReconcileResponse> reconcile(@RequestParam String processCode) {
        return service.reconcile(processCode);
    }

    @PostMapping("/reconcile/{processCode}/scaffold")
    public ScaffoldResponse scaffold(@PathVariable String processCode,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        return service.scaffold(processCode, actor);
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

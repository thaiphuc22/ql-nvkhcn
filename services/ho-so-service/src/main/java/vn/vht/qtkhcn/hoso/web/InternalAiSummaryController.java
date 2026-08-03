package vn.vht.qtkhcn.hoso.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vht.qtkhcn.hoso.service.AiSummaryService;
import vn.vht.qtkhcn.hoso.web.dto.AiSummaryContextResponse;
import vn.vht.qtkhcn.hoso.web.dto.SaveAiSummaryRequest;

@RestController
@RequestMapping("/internal/v1/ho-so/{id}/ai-summary")
public class InternalAiSummaryController {
    private final AiSummaryService service;

    public InternalAiSummaryController(AiSummaryService service) {
        this.service = service;
    }

    @GetMapping("/context")
    public AiSummaryContextResponse context(@PathVariable String id) {
        return service.buildContext(id);
    }

    @PutMapping
    public ResponseEntity<Void> save(@PathVariable String id, @RequestBody SaveAiSummaryRequest request) {
        service.saveSummary(id, request.tomTat());
        return ResponseEntity.ok().build();
    }
}

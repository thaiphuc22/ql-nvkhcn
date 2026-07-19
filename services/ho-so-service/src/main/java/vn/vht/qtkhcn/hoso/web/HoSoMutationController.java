package vn.vht.qtkhcn.hoso.web;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vht.qtkhcn.hoso.domain.HoSo;
import vn.vht.qtkhcn.hoso.domain.TaiLieu;
import vn.vht.qtkhcn.hoso.service.HoSoMutationService;
import vn.vht.qtkhcn.hoso.service.HoSoQueryService;
import vn.vht.qtkhcn.hoso.service.WorkflowSubmissionService;
import vn.vht.qtkhcn.hoso.web.dto.CreateHoSoRequest;
import vn.vht.qtkhcn.hoso.web.dto.CreateTaiLieuRequest;
import vn.vht.qtkhcn.hoso.web.dto.DocumentResponse;
import vn.vht.qtkhcn.hoso.web.dto.HoSoResponse;
import vn.vht.qtkhcn.hoso.web.dto.UpdateHoSoRequest;
import vn.vht.qtkhcn.hoso.web.dto.SubmitHoSoRequest;

@RestController
@RequestMapping("/api/ho-so")
public class HoSoMutationController {
    private final HoSoMutationService service;
    private final HoSoQueryService queryService;
    private final WorkflowSubmissionService workflowSubmissionService;

    public HoSoMutationController(HoSoMutationService service, HoSoQueryService queryService,
            WorkflowSubmissionService workflowSubmissionService) {
        this.service = service;
        this.queryService = queryService;
        this.workflowSubmissionService = workflowSubmissionService;
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<HoSoResponse> submit(
            @PathVariable String id,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor,
            @Valid @RequestBody SubmitHoSoRequest request) {
        HoSo entity = workflowSubmissionService.submit(id, request, actor);
        HoSoResponse body = queryService.findById(entity.getId()).body();
        return ResponseEntity.accepted().eTag(HttpVersion.etag(entity.getVersion())).body(body);
    }

    @PostMapping
    public ResponseEntity<HoSoResponse> create(
            @Valid @RequestBody CreateHoSoRequest request,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        HoSo entity = service.create(request, actor);
        HoSoResponse body = queryService.findById(entity.getId()).body();
        return ResponseEntity.status(HttpStatus.CREATED).eTag(HttpVersion.etag(entity.getVersion())).body(body);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HoSoResponse> update(
            @PathVariable String id,
            @RequestHeader("If-Match") String ifMatch,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor,
            @Valid @RequestBody UpdateHoSoRequest request) {
        HoSo entity = service.update(id, HttpVersion.parse(ifMatch), request, actor);
        HoSoResponse body = queryService.findById(entity.getId()).body();
        return ResponseEntity.ok().eTag(HttpVersion.etag(entity.getVersion())).body(body);
    }

    @PostMapping("/{id}/documents")
    public ResponseEntity<DocumentResponse> addDocument(
            @PathVariable String id,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor,
            @Valid @RequestBody CreateTaiLieuRequest request) {
        TaiLieu document = service.addDocument(id, request, actor);
        return ResponseEntity.status(HttpStatus.CREATED).eTag(HttpVersion.etag(document.getVersion()))
                .body(DocumentResponse.from(document));
    }

    @PutMapping("/{id}/documents/{documentId}")
    public ResponseEntity<DocumentResponse> updateDocument(
            @PathVariable String id, @PathVariable long documentId,
            @RequestHeader("If-Match") String ifMatch,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor,
            @Valid @RequestBody CreateTaiLieuRequest request) {
        TaiLieu document = service.updateDocument(id, documentId, HttpVersion.parse(ifMatch), request, actor);
        return ResponseEntity.ok().eTag(HttpVersion.etag(document.getVersion()))
                .body(DocumentResponse.from(document));
    }

    @DeleteMapping("/{id}/documents/{documentId}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable String id, @PathVariable long documentId,
            @RequestHeader("If-Match") String ifMatch,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        service.deleteDocument(id, documentId, HttpVersion.parse(ifMatch), actor);
        return ResponseEntity.noContent().build();
    }
}

package vn.vht.qtkhcn.hoso.web;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vht.qtkhcn.hoso.domain.NhiemVu;
import vn.vht.qtkhcn.hoso.service.NhiemVuMutationService;
import vn.vht.qtkhcn.hoso.web.dto.CreateNhiemVuRequest;
import vn.vht.qtkhcn.hoso.web.dto.NhiemVuResponse;
import vn.vht.qtkhcn.hoso.web.dto.UpdateNhiemVuRequest;

@RestController
@RequestMapping("/api/nhiem-vu")
public class NhiemVuMutationController {
    private final NhiemVuMutationService service;

    public NhiemVuMutationController(NhiemVuMutationService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<NhiemVuResponse> create(
            @Valid @RequestBody CreateNhiemVuRequest request,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        NhiemVu entity = service.create(request, actor);
        return ResponseEntity.status(HttpStatus.CREATED).eTag(HttpVersion.etag(entity.getVersion()))
                .body(NhiemVuResponse.from(entity));
    }

    @PutMapping("/{ma}")
    public ResponseEntity<NhiemVuResponse> update(
            @PathVariable String ma,
            @RequestHeader("If-Match") String ifMatch,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor,
            @Valid @RequestBody UpdateNhiemVuRequest request) {
        NhiemVu entity = service.update(ma, HttpVersion.parse(ifMatch), request, actor);
        return ResponseEntity.ok().eTag(HttpVersion.etag(entity.getVersion()))
                .body(NhiemVuResponse.from(entity));
    }

    @DeleteMapping("/{ma}")
    public ResponseEntity<Void> delete(
            @PathVariable String ma,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        service.delete(ma, actor);
        return ResponseEntity.noContent().build();
    }
}

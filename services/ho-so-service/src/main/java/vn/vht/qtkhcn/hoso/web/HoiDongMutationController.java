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
import vn.vht.qtkhcn.hoso.domain.HoiDongXetDuyet;
import vn.vht.qtkhcn.hoso.service.HoiDongMutationService;
import vn.vht.qtkhcn.hoso.web.dto.CreateHoiDongRequest;
import vn.vht.qtkhcn.hoso.web.dto.HoiDongXetDuyetResponse;
import vn.vht.qtkhcn.hoso.web.dto.UpdateHoiDongRequest;

/** Màn quản trị "Quản lý hội đồng" — tạo mới/sửa/xóa Hội đồng xét duyệt thủ công. */
@RestController
@RequestMapping("/api/hoi-dong")
public class HoiDongMutationController {

    private final HoiDongMutationService service;

    public HoiDongMutationController(HoiDongMutationService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<HoiDongXetDuyetResponse> create(
            @Valid @RequestBody CreateHoiDongRequest request,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        HoiDongXetDuyet entity = service.create(request, actor);
        return ResponseEntity.status(HttpStatus.CREATED).eTag(HttpVersion.etag(entity.getVersion()))
                .body(HoiDongXetDuyetResponse.from(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HoiDongXetDuyetResponse> update(
            @PathVariable long id,
            @RequestHeader("If-Match") String ifMatch,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor,
            @Valid @RequestBody UpdateHoiDongRequest request) {
        HoiDongXetDuyet entity = service.update(id, HttpVersion.parse(ifMatch), request, actor);
        return ResponseEntity.ok().eTag(HttpVersion.etag(entity.getVersion()))
                .body(HoiDongXetDuyetResponse.from(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable long id,
            @RequestHeader(value = "X-QTKHCN-Actor", required = false) String actor) {
        service.delete(id, actor);
        return ResponseEntity.noContent().build();
    }
}

package vn.vht.qtkhcn.hoso.web;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vht.qtkhcn.hoso.service.HoiDongQueryService;
import vn.vht.qtkhcn.hoso.web.dto.HoiDongXetDuyetResponse;

/** Màn quản trị "Quản lý hội đồng" — xem danh sách/chi tiết mọi Hội đồng xét duyệt. */
@RestController
@RequestMapping("/api/hoi-dong")
public class HoiDongQueryController {

    private final HoiDongQueryService service;

    public HoiDongQueryController(HoiDongQueryService service) {
        this.service = service;
    }

    @GetMapping
    public List<HoiDongXetDuyetResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<HoiDongXetDuyetResponse> findById(@PathVariable long id) {
        var result = service.findById(id);
        return ResponseEntity.ok().eTag(HttpVersion.etag(result.version())).body(result.body());
    }
}

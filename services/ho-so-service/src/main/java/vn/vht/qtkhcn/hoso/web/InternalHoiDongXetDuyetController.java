package vn.vht.qtkhcn.hoso.web;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vht.qtkhcn.hoso.domain.HoiDongCap;
import vn.vht.qtkhcn.hoso.service.HoiDongXetDuyetService;
import vn.vht.qtkhcn.hoso.web.dto.ThanhVienHoiDongResponse;

@RestController
@RequestMapping("/internal/v1/ho-so/{id}/hoi-dong-xet-duyet")
public class InternalHoiDongXetDuyetController {
    private final HoiDongXetDuyetService service;

    public InternalHoiDongXetDuyetController(HoiDongXetDuyetService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Void> sinh(@PathVariable String id) {
        service.sinhTuBuoc05(id);
        return ResponseEntity.ok().build();
    }

    /** Hội đồng cấp Tập đoàn (T18B→T20), tiền đề cho phiên họp T21/T24. */
    @PostMapping("/tap-doan")
    public ResponseEntity<Void> sinhTapDoan(@PathVariable String id) {
        service.sinhTuBuoc18B(id);
        return ResponseEntity.ok().build();
    }

    /** Danh sách thành viên Hội đồng cấp Tập đoàn — dùng làm inputCollection cho T24 multi-instance. */
    @GetMapping("/tap-doan/thanh-vien")
    public ResponseEntity<List<ThanhVienHoiDongResponse>> thanhVienTapDoan(@PathVariable String id) {
        List<ThanhVienHoiDongResponse> members = service.thanhVienTheoCap(id, HoiDongCap.TAP_DOAN).stream()
                .map(ThanhVienHoiDongResponse::from).toList();
        return ResponseEntity.ok(members);
    }
}

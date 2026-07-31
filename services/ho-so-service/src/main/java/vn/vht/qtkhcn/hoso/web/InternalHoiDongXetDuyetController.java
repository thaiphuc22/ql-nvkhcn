package vn.vht.qtkhcn.hoso.web;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    /** Thành viên Hội đồng cấp Cơ sở (T05→T06), tiền đề cho phiên họp T07/T10. */
    @GetMapping("/co-so/thanh-vien")
    public ResponseEntity<List<ThanhVienHoiDongResponse>> thanhVienCoSo(@PathVariable String id) {
        return ResponseEntity.ok(thanhVien(id, HoiDongCap.CO_SO));
    }

    /** Danh sách thành viên Hội đồng cấp Tập đoàn — dùng làm inputCollection cho T24 multi-instance. */
    @GetMapping("/tap-doan/thanh-vien")
    public ResponseEntity<List<ThanhVienHoiDongResponse>> thanhVienTapDoan(@PathVariable String id) {
        return ResponseEntity.ok(thanhVien(id, HoiDongCap.TAP_DOAN));
    }

    /**
     * Dịch candidateGroups của một user task thành danh sách người thật của hồ sơ này — seam để
     * backend kiểm tra quyền thao tác mà không phải biết gì về hội đồng hay về RD02.02.
     *
     * <p>Nhận nguyên si danh sách nhóm đọc từ Camunda; nhóm không phải hội đồng bị bỏ qua. Trả rỗng
     * nghĩa là "không thu hẹp được" (bước không thuộc hội đồng, hoặc hội đồng chưa gắn tài khoản),
     * và người gọi phải hiểu đó là giữ nguyên phạm vi theo vai trò chứ không phải cấm tất cả.</p>
     */
    @GetMapping("/candidate-users")
    public ResponseEntity<List<String>> candidateUsers(@PathVariable String id,
            @RequestParam(name = "groups", required = false) List<String> groups) {
        return ResponseEntity.ok(service.candidateUsersTheoNhom(id, groups));
    }

    private List<ThanhVienHoiDongResponse> thanhVien(String hoSoId, HoiDongCap cap) {
        return service.thanhVienTheoCap(hoSoId, cap).stream().map(ThanhVienHoiDongResponse::from).toList();
    }
}

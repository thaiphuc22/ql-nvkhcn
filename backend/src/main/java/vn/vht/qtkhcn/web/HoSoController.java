package vn.vht.qtkhcn.web;

import jakarta.validation.Valid;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vht.qtkhcn.domain.HoSo;
import vn.vht.qtkhcn.domain.NhiemVu;
import vn.vht.qtkhcn.repository.HoSoRepository;
import vn.vht.qtkhcn.repository.NhiemVuRepository;
import vn.vht.qtkhcn.service.HoSoService;
import vn.vht.qtkhcn.web.dto.CreateHoSoRequest;
import vn.vht.qtkhcn.web.dto.HoSoActionRequest;
import vn.vht.qtkhcn.web.dto.HoSoResponse;
import vn.vht.qtkhcn.web.dto.SubmitHoSoRequest;

/**
 * Port từ webapp/src/pages/Worklist.tsx + DossierDetail.tsx (chỉ phần dữ liệu — form/routing UI
 * đầy đủ vẫn ở Mốc 4/5). "Worklist" ở Mốc 2 = danh sách hồ sơ processing (chưa lọc theo
 * candidateGroup của actor — RBAC thật chờ F3, xem decisions.md D9).
 */
@RestController
@RequestMapping("/api/ho-so")
public class HoSoController {

    private final HoSoRepository hoSoRepository;
    private final NhiemVuRepository nhiemVuRepository;
    private final HoSoService hoSoService;

    public HoSoController(HoSoRepository hoSoRepository, NhiemVuRepository nhiemVuRepository,
                           HoSoService hoSoService) {
        this.hoSoRepository = hoSoRepository;
        this.nhiemVuRepository = nhiemVuRepository;
        this.hoSoService = hoSoService;
    }

    @GetMapping
    public List<HoSoResponse> list() {
        return hoSoRepository.findAll().stream().map(this::toResponse).toList();
    }

    @GetMapping("/{id}")
    public HoSoResponse get(@PathVariable String id) {
        return toResponse(hoSoService.getOrThrow(id));
    }

    @PostMapping
    public ResponseEntity<HoSoResponse> create(@Valid @RequestBody CreateHoSoRequest req) {
        HoSo h = hoSoService.createDraft(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(h));
    }

    @PostMapping("/{id}/submit")
    public HoSoResponse submit(@PathVariable String id, @Valid @RequestBody SubmitHoSoRequest req) {
        return toResponse(hoSoService.submit(id, req));
    }

    @PostMapping("/{id}/actions")
    public HoSoResponse applyAction(@PathVariable String id, @Valid @RequestBody HoSoActionRequest req) {
        return toResponse(hoSoService.applyAction(id, req));
    }

    private HoSoResponse toResponse(HoSo h) {
        NhiemVu nv = nhiemVuRepository.findById(h.getMaNV())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy NhiemVu " + h.getMaNV()));
        return HoSoResponse.from(h, nv);
    }
}

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
import vn.vht.qtkhcn.domain.ChuNhiem;
import vn.vht.qtkhcn.domain.GiaiDoan;
import vn.vht.qtkhcn.domain.NhiemVu;
import vn.vht.qtkhcn.repository.NhiemVuRepository;
import vn.vht.qtkhcn.web.dto.CreateNhiemVuRequest;
import vn.vht.qtkhcn.web.dto.NhiemVuResponse;

/** Port từ webapp/src/data/nhiemVu.ts (D8 — NhiemVu là entity master, tách biệt HoSo). */
@RestController
@RequestMapping("/api/nhiem-vu")
public class NhiemVuController {

    private final NhiemVuRepository repository;

    public NhiemVuController(NhiemVuRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<NhiemVuResponse> list() {
        return repository.findAll().stream().map(NhiemVuResponse::from).toList();
    }

    @GetMapping("/{ma}")
    public NhiemVuResponse get(@PathVariable String ma) {
        return NhiemVuResponse.from(repository.findById(ma)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy NhiemVu " + ma)));
    }

    @PostMapping
    public ResponseEntity<NhiemVuResponse> create(@Valid @RequestBody CreateNhiemVuRequest req) {
        NhiemVu n = new NhiemVu();
        n.setMa(nextMa());
        n.setTen(req.ten());
        n.setCap(req.cap());
        n.setChuNhiem(new ChuNhiem(req.chuNhiemHoTen(), req.chuNhiemHocHamHocVi(),
                req.chuNhiemMaNhanVien(), req.chuNhiemEmail(), null, null));
        n.setDonViChuTri(req.donViChuTri());
        n.setThoiGianThucHien(req.thoiGianThucHien());
        n.setDuToan(req.duToan());
        n.setGiaiDoan(GiaiDoan.CHU_TRUONG);
        n = repository.save(n);
        return ResponseEntity.status(HttpStatus.CREATED).body(NhiemVuResponse.from(n));
    }

    /** Port từ webapp/src/data/nhiemVu.ts::nextNhiemVuMa — RD.<year>.<seq3>. */
    private String nextMa() {
        int year = java.time.LocalDate.now().getYear();
        int max = 0;
        var pattern = java.util.regex.Pattern.compile("RD\\.\\d{4}\\.(\\d+)");
        for (NhiemVu n : repository.findAll()) {
            var m = pattern.matcher(n.getMa());
            if (m.matches()) {
                max = Math.max(max, Integer.parseInt(m.group(1)));
            }
        }
        return "RD.%d.%03d".formatted(year, max + 1);
    }
}

package vn.vht.qtkhcn.hoso.web;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vht.qtkhcn.hoso.service.NhiemVuQueryService;
import vn.vht.qtkhcn.hoso.web.dto.NhiemVuResponse;

@RestController
@RequestMapping("/api/nhiem-vu")
public class NhiemVuQueryController {

    private final NhiemVuQueryService service;

    public NhiemVuQueryController(NhiemVuQueryService service) {
        this.service = service;
    }

    @GetMapping
    public List<NhiemVuResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{ma}")
    public NhiemVuResponse findById(@PathVariable String ma) {
        return service.findById(ma);
    }
}

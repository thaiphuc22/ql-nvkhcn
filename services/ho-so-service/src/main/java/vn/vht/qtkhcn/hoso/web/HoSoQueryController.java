package vn.vht.qtkhcn.hoso.web;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vht.qtkhcn.hoso.service.HoSoQueryService;
import vn.vht.qtkhcn.hoso.web.dto.HoSoResponse;

@RestController
@RequestMapping("/api/ho-so")
public class HoSoQueryController {

    private final HoSoQueryService service;

    public HoSoQueryController(HoSoQueryService service) {
        this.service = service;
    }

    @GetMapping
    public List<HoSoResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public HoSoResponse findById(@PathVariable String id) {
        return service.findById(id);
    }
}

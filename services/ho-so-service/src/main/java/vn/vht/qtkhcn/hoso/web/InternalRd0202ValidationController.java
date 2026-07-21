package vn.vht.qtkhcn.hoso.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.vht.qtkhcn.hoso.service.Rd0202DefaultConditionService;
import vn.vht.qtkhcn.hoso.service.Rd0202DefaultConditionService.ValidationResult;

@RestController
@RequestMapping("/internal/v1/ho-so/{id}/validations/rd0202-default-condition")
public class InternalRd0202ValidationController {
    private final Rd0202DefaultConditionService service;

    public InternalRd0202ValidationController(Rd0202DefaultConditionService service) {
        this.service = service;
    }

    @GetMapping
    public ValidationResult validate(@PathVariable String id) {
        return service.validate(id);
    }
}

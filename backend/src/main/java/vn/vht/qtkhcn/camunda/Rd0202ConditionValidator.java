package vn.vht.qtkhcn.camunda;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import vn.vht.qtkhcn.repository.WorkflowProcessMappingRepository;

/** Resolves the dossier correlation and asks its owning service to run the real business check. */
@Component
public class Rd0202ConditionValidator {
    private static final Logger log = LoggerFactory.getLogger(Rd0202ConditionValidator.class);
    private final WorkflowProcessMappingRepository mappings;
    private final RestClient hoSo;

    public Rd0202ConditionValidator(WorkflowProcessMappingRepository mappings,
            @Value("${qtkhcn.ho-so.base-url:http://127.0.0.1:8093}") String baseUrl,
            @Value("${qtkhcn.ho-so.service-token:}") String token) {
        this.mappings = mappings;
        this.hoSo = RestClient.builder().baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token).build();
    }

    public boolean validate(long processInstanceKey) {
        String processInstanceId = String.valueOf(processInstanceKey);
        String hoSoId = mappings.findByProcessInstanceId(processInstanceId)
                .orElseThrow(() -> new IllegalStateException(
                        "Khong tim thay WorkflowProcessMapping cho processInstanceKey " + processInstanceId))
                .getHoSoId();
        ValidationResponse response = hoSo.get()
                .uri("/internal/v1/ho-so/{id}/validations/rd0202-default-condition", hoSoId)
                .retrieve().body(ValidationResponse.class);
        if (response == null) throw new IllegalStateException("Ho-so-service tra response validation rong.");
        if (!response.valid()) log.info("RD02.02 Check khong dat cho HoSo {}: {}", hoSoId, response.reasons());
        return response.valid();
    }

    record ValidationResponse(boolean valid, List<String> reasons) {}
}

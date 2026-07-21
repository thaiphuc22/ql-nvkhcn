package vn.vht.qtkhcn.camunda;

import io.camunda.client.annotation.JobWorker;
import io.camunda.client.api.response.ActivatedJob;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import vn.vht.qtkhcn.repository.WorkflowProcessMappingRepository;

/**
 * Job worker cho service task "Generate_HDXD" (type khcn.rd0202.generate-hdxd-decision) trong
 * RD02.02 — chèn ngay sau T06 (ký QĐ thành lập HĐXD cấp Cơ sở). Gọi đồng bộ sang ho-so-service
 * để sinh Hội đồng xét duyệt + tài liệu đính kèm từ formData đã lưu ở bước T05; nếu lỗi thì ném
 * exception để Zeebe tự retry theo "retries=3" đã khai báo trên BPMN — API phía ho-so-service
 * idempotent nên retry an toàn.
 */
@Component
public class GenerateHdxdDocumentJobWorker {

    private static final Logger log = LoggerFactory.getLogger(GenerateHdxdDocumentJobWorker.class);

    private final WorkflowProcessMappingRepository mappings;
    private final RestClient hoSo;

    public GenerateHdxdDocumentJobWorker(WorkflowProcessMappingRepository mappings,
            @Value("${qtkhcn.ho-so.base-url:http://127.0.0.1:8093}") String baseUrl,
            @Value("${qtkhcn.ho-so.service-token:}") String token) {
        this.mappings = mappings;
        this.hoSo = RestClient.builder().baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token).build();
    }

    @JobWorker(type = "khcn.rd0202.generate-hdxd-decision")
    public Map<String, Object> generate(ActivatedJob job) {
        String processInstanceId = String.valueOf(job.getProcessInstanceKey());
        String hoSoId = mappings.findByProcessInstanceId(processInstanceId)
                .orElseThrow(() -> new IllegalStateException(
                        "Khong tim thay WorkflowProcessMapping cho processInstanceKey " + processInstanceId))
                .getHoSoId();

        log.info("Sinh HDXD cap Co so cho HoSo {} (processInstanceKey={})", hoSoId, processInstanceId);
        hoSo.post().uri("/internal/v1/ho-so/{id}/hoi-dong-xet-duyet", hoSoId)
                .retrieve().toBodilessEntity();
        return Map.of();
    }
}

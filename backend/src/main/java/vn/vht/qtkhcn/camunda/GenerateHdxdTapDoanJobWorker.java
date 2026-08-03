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
 * Job worker cho service task "Generate_HDXD_TD" (type khcn.rd0202.generate-hdxd-decision-td) trong
 * RD02.02 — chèn ngay sau T20 (phê duyệt QĐ thành lập HĐXD cấp Tập đoàn). Cùng mẫu với
 * {@link GenerateHdxdDocumentJobWorker} (cấp Cơ sở sau T06) nhưng đọc formData ở bước T18B và gọi
 * endpoint riêng cho cấp Tập đoàn; là tiền đề để T24 (Họp HĐXD Tập đoàn phiên 2) có danh sách
 * thành viên thật cho multi-instance chấm điểm.
 */
@Component
public class GenerateHdxdTapDoanJobWorker {

    private static final Logger log = LoggerFactory.getLogger(GenerateHdxdTapDoanJobWorker.class);

    private final WorkflowProcessMappingRepository mappings;
    private final RestClient hoSo;

    public GenerateHdxdTapDoanJobWorker(WorkflowProcessMappingRepository mappings,
            @Value("${qtkhcn.ho-so.base-url:http://127.0.0.1:8093}") String baseUrl,
            @Value("${qtkhcn.ho-so.service-token:}") String token) {
        this.mappings = mappings;
        this.hoSo = RestClient.builder().baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token).build();
    }

    @JobWorker(type = "khcn.rd0202.generate-hdxd-decision-td")
    public Map<String, Object> generate(ActivatedJob job) {
        String processInstanceId = String.valueOf(job.getProcessInstanceKey());
        String hoSoId = mappings.findByProcessInstanceId(processInstanceId)
                .orElseThrow(() -> new IllegalStateException(
                        "Khong tim thay WorkflowProcessMapping cho processInstanceKey " + processInstanceId))
                .getHoSoId();

        log.info("Sinh HDXD cap Tap doan cho HoSo {} (processInstanceKey={})", hoSoId, processInstanceId);
        hoSo.post().uri("/internal/v1/ho-so/{id}/hoi-dong-xet-duyet/tap-doan", hoSoId)
                .retrieve().toBodilessEntity();
        return Map.of();
    }
}

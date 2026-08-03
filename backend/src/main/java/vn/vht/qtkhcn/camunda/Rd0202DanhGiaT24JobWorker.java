package vn.vht.qtkhcn.camunda;

import io.camunda.client.annotation.JobWorker;
import io.camunda.client.api.response.ActivatedJob;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import vn.vht.qtkhcn.repository.WorkflowProcessMappingRepository;

/**
 * Job worker phục vụ nhánh chấm điểm HĐXD Tập đoàn phiên 2 (T24) trong RD02.02:
 * <ol>
 *   <li>{@code khcn.rd0202.load-hoi-dong-td} — nạp danh sách thành viên HĐXD cấp Tập đoàn (sinh ở
 *   Generate_HDXD_TD sau T20) thành một collection Zeebe tạm thời để multi-instance T24 lặp theo
 *   đúng số thành viên thật. Đây là business data sống ngắn hạn trong process, đúng mẫu đã dùng ở
 *   {@link SystemCheckJobWorker#checkChuTruongTapDoan} cho tongDuToan/loaiNhiemVu — KHÔNG vi phạm D3
 *   vì không lưu lâu dài, chỉ để lấy input cho vòng lặp/DMN.</li>
 *   <li>{@code khcn.rd0202.compute-diem-trung-binh-t24} — tính điểm trung bình từ mảng
 *   {@code danhSachDiemDanhGiaT24} (outputCollection Zeebe tự gom sau khi multi-instance hoàn tất),
 *   làm đầu vào cho business rule task DMN {@code ketQuaDanhGiaT24}. Hội đồng rỗng (chưa từng sinh,
 *   hồ sơ cũ) trả điểm 0 — fail-closed, không để DMN nhận input rỗng rồi xử lý mập mờ.</li>
 * </ol>
 */
@Component
public class Rd0202DanhGiaT24JobWorker {

    private static final Logger log = LoggerFactory.getLogger(Rd0202DanhGiaT24JobWorker.class);

    private final WorkflowProcessMappingRepository mappings;
    private final RestClient hoSo;

    public Rd0202DanhGiaT24JobWorker(WorkflowProcessMappingRepository mappings,
            @Value("${qtkhcn.ho-so.base-url:http://127.0.0.1:8093}") String baseUrl,
            @Value("${qtkhcn.ho-so.service-token:}") String token) {
        this.mappings = mappings;
        this.hoSo = RestClient.builder().baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token).build();
    }

    @JobWorker(type = "khcn.rd0202.load-hoi-dong-td")
    public Map<String, Object> loadHoiDongTapDoan(ActivatedJob job) {
        String processInstanceId = String.valueOf(job.getProcessInstanceKey());
        String hoSoId = mappings.findByProcessInstanceId(processInstanceId)
                .orElseThrow(() -> new IllegalStateException(
                        "Khong tim thay WorkflowProcessMapping cho processInstanceKey " + processInstanceId))
                .getHoSoId();

        List<Map<String, Object>> members;
        try {
            members = hoSo.get().uri("/internal/v1/ho-so/{id}/hoi-dong-xet-duyet/tap-doan/thanh-vien", hoSoId)
                    .retrieve().body(new org.springframework.core.ParameterizedTypeReference<>() {});
        } catch (RestClientResponseException failed) {
            log.warn("Khong doc duoc danh sach HDXD Tap doan cho HoSo {}: HTTP {}", hoSoId,
                    failed.getStatusCode().value());
            members = List.of();
        }
        if (members == null || members.isEmpty()) {
            log.warn("HoSo {} chua co HDXD cap Tap doan — T24 se khong co vong lap cham diem nao.", hoSoId);
            members = List.of();
        }
        log.info("Nap {} thanh vien HDXD Tap doan cho HoSo {} (processInstanceKey={})",
                members.size(), hoSoId, processInstanceId);
        return Map.of("danhSachThanhVienHDXDTD", members);
    }

    @JobWorker(type = "khcn.rd0202.compute-diem-trung-binh-t24")
    public Map<String, Object> computeDiemTrungBinh(ActivatedJob job) {
        Object raw = job.getVariablesAsMap().get("danhSachDiemDanhGiaT24");
        double diemTrungBinh = 0d;
        int soPhieu = 0;
        if (raw instanceof List<?> list && !list.isEmpty()) {
            double sum = 0d;
            for (Object item : list) {
                if (item instanceof Number number) sum += number.doubleValue();
            }
            soPhieu = list.size();
            diemTrungBinh = sum / soPhieu;
        }
        if (soPhieu == 0) {
            log.warn("T24 (processInstanceKey={}) khong co phieu cham diem nao — diemTrungBinhT24=0 (fail-closed).",
                    job.getProcessInstanceKey());
        } else {
            log.info("T24 (processInstanceKey={}) diemTrungBinhT24={} tu {} phieu",
                    job.getProcessInstanceKey(), diemTrungBinh, soPhieu);
        }
        return Map.of("diemTrungBinhT24", diemTrungBinh);
    }
}

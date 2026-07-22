package vn.vht.qtkhcn.camunda;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/** Đọc ngữ cảnh + ghi tóm tắt AI cho một HoSo qua API nội bộ của ho-so-service (D3: business data sống ở đó). */
@Component
public class AiSummaryHoSoGateway {
    private final RestClient hoSo;

    public AiSummaryHoSoGateway(@Value("${qtkhcn.ho-so.base-url:http://127.0.0.1:8093}") String baseUrl,
            @Value("${qtkhcn.ho-so.service-token:}") String token) {
        this.hoSo = RestClient.builder().baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token).build();
    }

    public AiSummaryContext fetchContext(String hoSoId) {
        AiSummaryContext context = hoSo.get()
                .uri("/internal/v1/ho-so/{id}/ai-summary/context", hoSoId)
                .retrieve().body(AiSummaryContext.class);
        if (context == null) throw new IllegalStateException("Ho-so-service tra ngu canh tom tat AI rong.");
        return context;
    }

    public void saveSummary(String hoSoId, String tomTat) {
        hoSo.put().uri("/internal/v1/ho-so/{id}/ai-summary", hoSoId)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("tomTat", tomTat))
                .retrieve().toBodilessEntity();
    }

    /** Mirrors AiSummaryContextResponse ở ho-so-service — hai service triển khai độc lập nên không share class. */
    public record AiSummaryContext(
            String hoSoId, String tenDeTai, String chuNhiem, String donVi, String thoiGianThucHien,
            String duToan, String cap, List<BuocHoanTat> cacBuocDaHoanTat, List<TepDinhKem> tepDinhKem) {

        public record BuocHoanTat(String ten, String nguoi, String yKien) {}

        /** noiDung là trích đoạn text từ PDF/Word/Excel, đã cắt bớt theo giới hạn cấu hình ở ho-so-service. */
        public record TepDinhKem(String ten, String loai, String noiDung, boolean daCatBot) {}
    }
}

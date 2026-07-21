package vn.vht.qtkhcn.camunda;

import io.camunda.client.annotation.JobWorker;
import io.camunda.client.api.response.ActivatedJob;
import java.util.Map;
import java.util.StringJoiner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import vn.vht.qtkhcn.ai.AiSummaryGenerator;
import vn.vht.qtkhcn.camunda.AiSummaryHoSoGateway.AiSummaryContext;
import vn.vht.qtkhcn.repository.WorkflowProcessMappingRepository;

/**
 * Job worker cho service task "AI_Summarize" (type khcn.rd0202.summarize-dossier) trong
 * RD02.02 — chèn ngay sau GCheck (nhánh FCheckOK), trước khi hồ sơ vào thẩm định song song 4 cơ
 * quan. Gọi LLM thật (OpenAI, xem OpenAiSummaryClient) để tóm tắt hồ sơ và ghi lại vào
 * HoSo.tomTatAi qua ho-so-service, để 4 cơ quan thẩm định có ngữ cảnh đọc trước.
 *
 * KHÔNG được phép chặn luồng phê duyệt thật: nếu LLM lỗi hoặc chưa cấu hình OPENAI_API_KEY,
 * worker vẫn hoàn tất job với tóm tắt fallback thay vì ném lỗi — khác với Check/Generate_HDXD
 * (điều kiện nghiệp vụ thật, lỗi phải retry/tạo incident). Chỉ lỗi hạ tầng thật sự (không tìm
 * thấy mapping hoSoId, hoặc ho-so-service không phản hồi) mới ném exception để Zeebe retry theo
 * retries="1" khai báo trên BPMN.
 */
@Component
public class AiSummarizeDossierJobWorker {
    private static final Logger log = LoggerFactory.getLogger(AiSummarizeDossierJobWorker.class);
    private static final String FALLBACK_SUMMARY =
            "Chưa sinh được tóm tắt tự động (dịch vụ AI tạm thời không khả dụng).";

    private final WorkflowProcessMappingRepository mappings;
    private final AiSummaryHoSoGateway gateway;
    private final AiSummaryGenerator generator;

    public AiSummarizeDossierJobWorker(WorkflowProcessMappingRepository mappings, AiSummaryHoSoGateway gateway,
            AiSummaryGenerator generator) {
        this.mappings = mappings;
        this.gateway = gateway;
        this.generator = generator;
    }

    @JobWorker(type = "khcn.rd0202.summarize-dossier")
    public Map<String, Object> summarize(ActivatedJob job) {
        String processInstanceId = String.valueOf(job.getProcessInstanceKey());
        String hoSoId = mappings.findByProcessInstanceId(processInstanceId)
                .orElseThrow(() -> new IllegalStateException(
                        "Khong tim thay WorkflowProcessMapping cho processInstanceKey " + processInstanceId))
                .getHoSoId();

        AiSummaryContext context = gateway.fetchContext(hoSoId);
        String prompt = buildPrompt(context);
        boolean usedFallback = false;
        String summary = generator.summarize(prompt).orElse(null);
        if (summary == null) {
            summary = FALLBACK_SUMMARY;
            usedFallback = true;
        }
        gateway.saveSummary(hoSoId, summary);

        log.info("Da tom tat HoSo {} (processInstanceKey={}, do dai={} ky tu, dung fallback={})",
                hoSoId, processInstanceId, summary.length(), usedFallback);
        return Map.of();
    }

    private static String buildPrompt(AiSummaryContext context) {
        StringJoiner steps = new StringJoiner("\n");
        context.cacBuocDaHoanTat().forEach(buoc -> steps.add("- " + buoc.ten()
                + (buoc.nguoi() == null ? "" : " (" + buoc.nguoi() + ")")
                + (buoc.yKien() == null || buoc.yKien().isBlank() ? "" : ": " + buoc.yKien())));
        return """
                Bạn là trợ lý tóm tắt hồ sơ xét duyệt nhiệm vụ khoa học công nghệ. Hãy viết một đoạn \
                tóm tắt ngắn gọn (3-5 câu, tiếng Việt) cho các cơ quan thẩm định đọc trước khi thẩm \
                định song song. KHÔNG đưa ra kết luận đạt/không đạt, chỉ mô tả khách quan.

                Tên đề tài: %s
                Chủ nhiệm: %s
                Đơn vị: %s
                Thời gian thực hiện: %s
                Dự toán: %s
                Cấp: %s

                Các bước đã hoàn tất:
                %s
                """.formatted(context.tenDeTai(), context.chuNhiem(), context.donVi(),
                context.thoiGianThucHien(), context.duToan(), context.cap(),
                steps.length() == 0 ? "(chưa có)" : steps.toString());
    }
}

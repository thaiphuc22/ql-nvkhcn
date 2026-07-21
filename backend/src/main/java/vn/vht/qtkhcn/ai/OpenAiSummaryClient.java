package vn.vht.qtkhcn.ai;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Gọi OpenAI Chat Completions API thật (https://platform.openai.com/docs/api-reference/chat).
 * Không dùng SDK riêng để tránh thêm dependency mới — chỉ cần RestClient đã có sẵn
 * (spring-boot-starter-web, đã dùng ở WorkflowEventDispatcher/Rd0202ConditionValidator).
 *
 * Không cấu hình api-key (OPENAI_API_KEY) thì trả Optional.empty() thay vì ném lỗi: tóm tắt
 * AI chỉ hỗ trợ đọc, KHÔNG được phép chặn luồng phê duyệt thật khi thiếu cấu hình hoặc LLM lỗi —
 * caller (AiSummarizeDossierJobWorker) tự quyết định fallback.
 */
@Component
public class OpenAiSummaryClient implements AiSummaryGenerator {
    private static final Logger log = LoggerFactory.getLogger(OpenAiSummaryClient.class);

    private final RestClient client;
    private final String apiKey;
    private final String model;
    private final int maxTokens;

    public OpenAiSummaryClient(
            @Value("${qtkhcn.ai.openai.base-url:https://api.openai.com}") String baseUrl,
            @Value("${qtkhcn.ai.openai.api-key:}") String apiKey,
            @Value("${qtkhcn.ai.openai.model:gpt-4o-mini}") String model,
            @Value("${qtkhcn.ai.openai.max-tokens:512}") int maxTokens) {
        this.client = RestClient.builder().baseUrl(baseUrl).build();
        this.apiKey = apiKey;
        this.model = model;
        this.maxTokens = maxTokens;
    }

    @Override
    public Optional<String> summarize(String prompt) {
        if (apiKey.isBlank()) {
            log.warn("qtkhcn.ai.openai.api-key (OPENAI_API_KEY) chua duoc cau hinh — bo qua goi LLM that.");
            return Optional.empty();
        }
        try {
            Map<String, Object> body = Map.of(
                    "model", model,
                    "max_tokens", maxTokens,
                    "messages", List.of(Map.of("role", "user", "content", prompt)));
            JsonNode response = client.post().uri("/v1/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + apiKey)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);
            String text = response == null
                    ? ""
                    : response.path("choices").path(0).path("message").path("content").asText("");
            return text.isBlank() ? Optional.empty() : Optional.of(text.trim());
        } catch (Exception e) {
            log.warn("Goi OpenAI API that bai: {}", e.getMessage());
            return Optional.empty();
        }
    }
}

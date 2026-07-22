package vn.vht.qtkhcn.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
 * Calls the configured LLM provider for dossier summaries. Missing keys or provider failures return
 * Optional.empty() so the workflow can continue with fallback text.
 */
@Component
public class OpenAiSummaryClient implements AiSummaryGenerator {
    private static final Logger log = LoggerFactory.getLogger(OpenAiSummaryClient.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final RestClient openAiClient;
    private final RestClient geminiClient;
    private final String provider;
    private final String openAiApiKey;
    private final String openAiModel;
    private final int openAiMaxTokens;
    private final String geminiApiKey;
    private final String geminiModel;
    private final int geminiMaxOutputTokens;

    public OpenAiSummaryClient(
            @Value("${qtkhcn.ai.provider:auto}") String provider,
            @Value("${qtkhcn.ai.openai.base-url:https://api.openai.com}") String openAiBaseUrl,
            @Value("${qtkhcn.ai.openai.api-key:}") String openAiApiKey,
            @Value("${qtkhcn.ai.openai.model:gpt-4o-mini}") String openAiModel,
            @Value("${qtkhcn.ai.openai.max-tokens:512}") int openAiMaxTokens,
            @Value("${qtkhcn.ai.gemini.base-url:https://generativelanguage.googleapis.com}") String geminiBaseUrl,
            @Value("${qtkhcn.ai.gemini.api-key:}") String geminiApiKey,
            @Value("${qtkhcn.ai.gemini.model:gemini-flash-latest}") String geminiModel,
            @Value("${qtkhcn.ai.gemini.max-output-tokens:1024}") int geminiMaxOutputTokens) {
        this.openAiClient = RestClient.builder().baseUrl(openAiBaseUrl).build();
        this.geminiClient = RestClient.builder().baseUrl(geminiBaseUrl).build();
        this.provider = provider;
        this.openAiApiKey = openAiApiKey;
        this.openAiModel = openAiModel;
        this.openAiMaxTokens = openAiMaxTokens;
        this.geminiApiKey = geminiApiKey;
        this.geminiModel = geminiModel;
        this.geminiMaxOutputTokens = geminiMaxOutputTokens;
    }

    @Override
    public Optional<String> summarize(String prompt) {
        return switch (selectedProvider()) {
            case "openai" -> summarizeWithOpenAi(prompt);
            case "gemini" -> summarizeWithGemini(prompt);
            default -> {
                log.warn("Chua cau hinh OPENAI_API_KEY hoac GEMINI_API_KEY - bo qua goi LLM that.");
                yield Optional.empty();
            }
        };
    }

    private String selectedProvider() {
        String normalizedProvider = provider == null ? "auto" : provider.trim().toLowerCase();
        if ("openai".equals(normalizedProvider)) return openAiApiKey.isBlank() ? "missing" : "openai";
        if ("gemini".equals(normalizedProvider)) return geminiApiKey.isBlank() ? "missing" : "gemini";
        if (!openAiApiKey.isBlank()) return "openai";
        if (!geminiApiKey.isBlank()) return "gemini";
        return "missing";
    }

    private Optional<String> summarizeWithOpenAi(String prompt) {
        if (openAiApiKey.isBlank()) {
            log.warn("qtkhcn.ai.openai.api-key (OPENAI_API_KEY) chua duoc cau hinh - bo qua goi LLM that.");
            return Optional.empty();
        }
        try {
            Map<String, Object> body = Map.of(
                    "model", openAiModel,
                    "max_tokens", openAiMaxTokens,
                    "messages", List.of(Map.of("role", "user", "content", prompt)));
            String responseBody = openAiClient.post().uri("/v1/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + openAiApiKey)
                    .body(body)
                    .retrieve()
                    .body(String.class);
            JsonNode response = responseBody == null || responseBody.isBlank()
                    ? null
                    : objectMapper.readTree(responseBody);
            String text = response == null
                    ? ""
                    : response.path("choices").path(0).path("message").path("content").asText("");
            return text.isBlank() ? Optional.empty() : Optional.of(text.trim());
        } catch (Exception e) {
            log.warn("Goi OpenAI API that bai: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private Optional<String> summarizeWithGemini(String prompt) {
        if (geminiApiKey.isBlank()) {
            log.warn("qtkhcn.ai.gemini.api-key (GEMINI_API_KEY) chua duoc cau hinh - bo qua goi LLM that.");
            return Optional.empty();
        }
        try {
            Map<String, Object> body = Map.of(
                    "contents", List.of(Map.of(
                            "role", "user",
                            "parts", List.of(Map.of("text", prompt)))),
                    "generationConfig", Map.of("maxOutputTokens", geminiMaxOutputTokens));
            String responseBody = geminiClient.post()
                    .uri("/v1beta/models/{model}:generateContent", geminiModel)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("x-goog-api-key", geminiApiKey)
                    .body(body)
                    .retrieve()
                    .body(String.class);
            JsonNode response = responseBody == null || responseBody.isBlank()
                    ? null
                    : objectMapper.readTree(responseBody);
            String text = response == null
                    ? ""
                    : response.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText("");
            return text.isBlank() ? Optional.empty() : Optional.of(text.trim());
        } catch (Exception e) {
            log.warn("Goi Gemini API that bai: {}", e.getMessage());
            return Optional.empty();
        }
    }
}

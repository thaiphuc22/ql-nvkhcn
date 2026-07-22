package vn.vht.qtkhcn.ai;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

import java.util.Optional;
import org.junit.jupiter.api.Test;

class OpenAiSummaryClientGeminiSmokeTest {

    @Test
    void callsGeminiWhenApiKeyIsConfigured() {
        String geminiApiKey = System.getenv("GEMINI_API_KEY");
        assumeTrue(geminiApiKey != null && !geminiApiKey.isBlank(),
                "GEMINI_API_KEY is not configured for smoke test");

        OpenAiSummaryClient client = new OpenAiSummaryClient(
                "gemini",
                "https://api.openai.com",
                "",
                "gpt-4o-mini",
                512,
                "https://generativelanguage.googleapis.com",
                geminiApiKey,
                System.getenv().getOrDefault("QTKHCN_AI_GEMINI_MODEL", "gemini-flash-latest"),
                1024);

        Optional<String> summary = client.summarize("""
                Tóm tắt trong đúng một câu tiếng Việt:
                Hồ sơ nhiệm vụ KHCN về nền tảng mô phỏng số, chủ nhiệm TS. Nguyễn Văn A,
                đã hoàn tất bước khởi tạo và đang chuẩn bị thẩm định song song.
                """);

        assertTrue(summary.isPresent(), "Gemini should return a non-empty summary");
        assertTrue(summary.get().length() >= 20, "Summary should contain useful text");
    }
}

package vn.vht.qtkhcn.ai;

import java.util.Optional;

/** Sinh tóm tắt văn bản từ một prompt — tách interface để job worker test được mà không gọi LLM thật. */
public interface AiSummaryGenerator {
    Optional<String> summarize(String prompt);
}

package vn.vht.qtkhcn.hoso.service;

import jakarta.persistence.EntityNotFoundException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.hoso.domain.HoSo;
import vn.vht.qtkhcn.hoso.domain.NhiemVu;
import vn.vht.qtkhcn.hoso.domain.TaiLieu;
import vn.vht.qtkhcn.hoso.repository.HoSoRepository;
import vn.vht.qtkhcn.hoso.repository.NhiemVuRepository;
import vn.vht.qtkhcn.hoso.web.dto.AiSummaryContextResponse;
import vn.vht.qtkhcn.hoso.web.dto.AiSummaryContextResponse.TepDinhKem;

/**
 * Ngữ cảnh + lưu tóm tắt cho service task "AI_Summarize" (RD02.02, ngay sau GCheck) — worker ở
 * backend gọi 2 API nội bộ này để đọc ngữ cảnh rồi ghi lại tóm tắt do LLM sinh ra. Tóm tắt chỉ
 * hỗ trợ đọc cho 4 cơ quan thẩm định song song, KHÔNG phải điều kiện nghiệp vụ nên việc ghi lại
 * không áp validate/ràng buộc gì — khác với UPDATE_DOSSIER trong service-task.ts phía frontend.
 *
 * Ngữ cảnh còn kèm trích đoạn text từ tệp đính kèm (PDF/Word/Excel/Text/Markdown, xem DocumentTextExtractor) —
 * giới hạn số tệp/độ dài theo qtkhcn.ai.attachments.* để tránh phình prompt/chi phí gọi LLM; tệp
 * không đọc được (Archive/Image/lỗi trích xuất) bị bỏ qua âm thầm, không chặn tóm tắt.
 */
@Service
public class AiSummaryService {
    private final HoSoRepository hoSoRepository;
    private final NhiemVuRepository nhiemVuRepository;
    private final DocumentStorageService storage;
    private final DocumentTextExtractor extractor;
    private final int maxFiles;
    private final int maxCharsPerFile;
    private final int maxCharsTotal;

    public AiSummaryService(HoSoRepository hoSoRepository, NhiemVuRepository nhiemVuRepository,
            DocumentStorageService storage, DocumentTextExtractor extractor,
            @Value("${qtkhcn.ai.attachments.max-files:5}") int maxFiles,
            @Value("${qtkhcn.ai.attachments.max-chars-per-file:4000}") int maxCharsPerFile,
            @Value("${qtkhcn.ai.attachments.max-chars-total:8000}") int maxCharsTotal) {
        this.hoSoRepository = hoSoRepository;
        this.nhiemVuRepository = nhiemVuRepository;
        this.storage = storage;
        this.extractor = extractor;
        this.maxFiles = maxFiles;
        this.maxCharsPerFile = maxCharsPerFile;
        this.maxCharsTotal = maxCharsTotal;
    }

    @Transactional(readOnly = true)
    public AiSummaryContextResponse buildContext(String hoSoId) {
        HoSo hoSo = hoSoRepository.findById(hoSoId)
                .orElseThrow(() -> new EntityNotFoundException("Khong tim thay HoSo " + hoSoId));
        NhiemVu nhiemVu = nhiemVuRepository.findById(hoSo.getMaNV())
                .orElseThrow(() -> new IllegalStateException(
                        "Ho so " + hoSoId + " tham chieu NhiemVu khong ton tai " + hoSo.getMaNV()));
        return AiSummaryContextResponse.from(hoSo, nhiemVu, extractAttachments(hoSo));
    }

    private List<TepDinhKem> extractAttachments(HoSo hoSo) {
        List<TepDinhKem> result = new ArrayList<>();
        int totalChars = 0;
        for (TaiLieu tep : hoSo.getTaiLieu()) {
            if (result.size() >= maxFiles || totalChars >= maxCharsTotal) break;
            if (tep.getStorageKey() == null || "Archive".equals(tep.getLoai()) || "Image".equals(tep.getLoai())) {
                continue;
            }
            Optional<String> noiDung;
            try {
                noiDung = extractor.extract(tep, storage.load(tep.getStorageKey()));
            } catch (Exception e) {
                noiDung = Optional.empty();
            }
            if (noiDung.isEmpty() || noiDung.get().isBlank()) continue;

            String text = noiDung.get().strip();
            int budget = Math.min(maxCharsPerFile, maxCharsTotal - totalChars);
            boolean daCatBot = text.length() > budget;
            String trimmed = daCatBot ? text.substring(0, budget) : text;
            totalChars += trimmed.length();
            result.add(new TepDinhKem(tep.getTen(), tep.getLoai(), trimmed, daCatBot));
        }
        return result;
    }

    @Transactional
    public void saveSummary(String hoSoId, String tomTat) {
        HoSo hoSo = hoSoRepository.findById(hoSoId)
                .orElseThrow(() -> new EntityNotFoundException("Khong tim thay HoSo " + hoSoId));
        hoSo.setTomTatAi(tomTat);
        hoSo.setTomTatAiLuc(OffsetDateTime.now(ZoneOffset.UTC));
        hoSoRepository.save(hoSo);
    }
}

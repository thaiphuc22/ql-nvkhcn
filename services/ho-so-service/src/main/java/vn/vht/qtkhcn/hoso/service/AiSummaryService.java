package vn.vht.qtkhcn.hoso.service;

import jakarta.persistence.EntityNotFoundException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.hoso.domain.HoSo;
import vn.vht.qtkhcn.hoso.domain.NhiemVu;
import vn.vht.qtkhcn.hoso.repository.HoSoRepository;
import vn.vht.qtkhcn.hoso.repository.NhiemVuRepository;
import vn.vht.qtkhcn.hoso.web.dto.AiSummaryContextResponse;

/**
 * Ngữ cảnh + lưu tóm tắt cho service task "AI_Summarize" (RD02.02, ngay sau GCheck) — worker ở
 * backend gọi 2 API nội bộ này để đọc ngữ cảnh rồi ghi lại tóm tắt do LLM sinh ra. Tóm tắt chỉ
 * hỗ trợ đọc cho 4 cơ quan thẩm định song song, KHÔNG phải điều kiện nghiệp vụ nên việc ghi lại
 * không áp validate/ràng buộc gì — khác với UPDATE_DOSSIER trong service-task.ts phía frontend.
 */
@Service
public class AiSummaryService {
    private final HoSoRepository hoSoRepository;
    private final NhiemVuRepository nhiemVuRepository;

    public AiSummaryService(HoSoRepository hoSoRepository, NhiemVuRepository nhiemVuRepository) {
        this.hoSoRepository = hoSoRepository;
        this.nhiemVuRepository = nhiemVuRepository;
    }

    @Transactional(readOnly = true)
    public AiSummaryContextResponse buildContext(String hoSoId) {
        HoSo hoSo = hoSoRepository.findById(hoSoId)
                .orElseThrow(() -> new EntityNotFoundException("Khong tim thay HoSo " + hoSoId));
        NhiemVu nhiemVu = nhiemVuRepository.findById(hoSo.getMaNV())
                .orElseThrow(() -> new IllegalStateException(
                        "Ho so " + hoSoId + " tham chieu NhiemVu khong ton tai " + hoSo.getMaNV()));
        return AiSummaryContextResponse.from(hoSo, nhiemVu);
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

package vn.vht.qtkhcn.hoso.service;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.hoso.repository.HoiDongXetDuyetRepository;
import vn.vht.qtkhcn.hoso.web.dto.HoiDongXetDuyetResponse;

/** Đọc cho màn quản trị {@code /api/hoi-dong} — mọi hội đồng, không phân biệt tự sinh hay thủ công. */
@Service
@Transactional(readOnly = true)
public class HoiDongQueryService {

    private final HoiDongXetDuyetRepository repository;

    public HoiDongQueryService(HoiDongXetDuyetRepository repository) {
        this.repository = repository;
    }

    public List<HoiDongXetDuyetResponse> findAll() {
        return repository.findAll().stream().map(HoiDongXetDuyetResponse::from).toList();
    }

    public VersionedResponse<HoiDongXetDuyetResponse> findById(long id) {
        return repository.findById(id)
                .map(entity -> new VersionedResponse<>(HoiDongXetDuyetResponse.from(entity), entity.getVersion()))
                .orElseThrow(() -> new EntityNotFoundException("Khong tim thay HoiDongXetDuyet " + id));
    }
}

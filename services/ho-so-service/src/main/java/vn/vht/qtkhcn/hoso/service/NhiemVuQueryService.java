package vn.vht.qtkhcn.hoso.service;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.hoso.repository.NhiemVuRepository;
import vn.vht.qtkhcn.hoso.web.dto.NhiemVuResponse;

@Service
@Transactional(readOnly = true)
public class NhiemVuQueryService {

    private final NhiemVuRepository repository;

    public NhiemVuQueryService(NhiemVuRepository repository) {
        this.repository = repository;
    }

    public List<NhiemVuResponse> findAll() {
        return repository.findAll().stream().map(NhiemVuResponse::from).toList();
    }

    public NhiemVuResponse findById(String ma) {
        return repository.findById(ma)
                .map(NhiemVuResponse::from)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy NhiemVu " + ma));
    }
}

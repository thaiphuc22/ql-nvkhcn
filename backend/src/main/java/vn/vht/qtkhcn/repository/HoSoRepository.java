package vn.vht.qtkhcn.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.HoSo;

public interface HoSoRepository extends JpaRepository<HoSo, String> {

    List<HoSo> findByMaNV(String maNV);

    /**
     * Ghi đè findById/findAll để fetch sẵn `steps` VÀ `steps.vaiTroCodes` (@EntityGraph) —
     * HoSoResponse.from()/DossierStepResponse.from() đọc cả 2 SAU khi transaction của HoSoService
     * đã đóng (controller không @Transactional có chủ đích, theo đúng layering service/controller).
     * Thiếu 1 trong 2 path → LazyInitializationException "no session" — cả 2 lỗi này thật sự xảy
     * ra khi test API (2026-07-15, sửa lần lượt khi phát hiện qua chạy thật, xem backend/README.md).
     */
    @EntityGraph(attributePaths = {"steps", "steps.vaiTroCodes"})
    @Override
    Optional<HoSo> findById(String id);

    @EntityGraph(attributePaths = {"steps", "steps.vaiTroCodes"})
    @Override
    List<HoSo> findAll();
}

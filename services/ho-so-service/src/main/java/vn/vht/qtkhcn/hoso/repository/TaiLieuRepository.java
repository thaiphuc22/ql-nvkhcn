package vn.vht.qtkhcn.hoso.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.hoso.domain.TaiLieu;

public interface TaiLieuRepository extends JpaRepository<TaiLieu, Long> {
    Optional<TaiLieu> findByIdAndHoSoId(Long id, String hoSoId);
}

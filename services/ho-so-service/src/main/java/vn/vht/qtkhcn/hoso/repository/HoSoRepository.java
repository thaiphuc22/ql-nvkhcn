package vn.vht.qtkhcn.hoso.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.hoso.domain.HoSo;

public interface HoSoRepository extends JpaRepository<HoSo, String> {

    @EntityGraph(attributePaths = {"steps", "steps.vaiTroCodes"})
    @Override
    Optional<HoSo> findById(String id);

    @EntityGraph(attributePaths = {"steps", "steps.vaiTroCodes"})
    @Override
    List<HoSo> findAll();
}

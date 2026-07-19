package vn.vht.qtkhcn.hoso.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;
import vn.vht.qtkhcn.hoso.domain.HoSo;
import vn.vht.qtkhcn.hoso.domain.DossierStatus;

public interface HoSoRepository extends JpaRepository<HoSo, String> {

    @EntityGraph(attributePaths = {"steps", "steps.vaiTroCodes"})
    @Override
    Optional<HoSo> findById(String id);

    @EntityGraph(attributePaths = {"steps", "steps.vaiTroCodes"})
    @Override
    List<HoSo> findAll();

    List<HoSo> findByTrangThaiOrderById(DossierStatus trangThai);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"steps", "steps.vaiTroCodes"})
    @Query("select h from HoSo h where h.id = :id")
    Optional<HoSo> findForWorkflowProjection(String id);
}

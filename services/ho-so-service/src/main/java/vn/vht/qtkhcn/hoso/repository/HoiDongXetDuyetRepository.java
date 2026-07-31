package vn.vht.qtkhcn.hoso.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.hoso.domain.HoiDongCap;
import vn.vht.qtkhcn.hoso.domain.HoiDongXetDuyet;

public interface HoiDongXetDuyetRepository extends JpaRepository<HoiDongXetDuyet, Long> {
    Optional<HoiDongXetDuyet> findByHoSoIdAndCapAndSourceTaskDefinitionKey(
            String hoSoId, HoiDongCap cap, String sourceTaskDefinitionKey);

    @Override
    @EntityGraph(attributePaths = "thanhVien")
    List<HoiDongXetDuyet> findAll();

    @Override
    @EntityGraph(attributePaths = "thanhVien")
    Optional<HoiDongXetDuyet> findById(Long id);

    @EntityGraph(attributePaths = "thanhVien")
    List<HoiDongXetDuyet> findByHoSoIdOrderByCreatedAtAsc(String hoSoId);

    @EntityGraph(attributePaths = "thanhVien")
    List<HoiDongXetDuyet> findByHoSoIdAndCapOrderByCreatedAtAsc(String hoSoId, HoiDongCap cap);

    @EntityGraph(attributePaths = "thanhVien")
    List<HoiDongXetDuyet> findByHoSoIdInOrderByCreatedAtAsc(List<String> hoSoIds);

    boolean existsByMaHoiDong(String maHoiDong);

    boolean existsByMaHoiDongAndIdNot(String maHoiDong, long id);
}

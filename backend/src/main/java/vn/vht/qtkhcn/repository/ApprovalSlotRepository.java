package vn.vht.qtkhcn.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.ApprovalSlot;

public interface ApprovalSlotRepository extends JpaRepository<ApprovalSlot, String> {
    List<ApprovalSlot> findAllByOrderBySortOrderAscCodeAsc();
}

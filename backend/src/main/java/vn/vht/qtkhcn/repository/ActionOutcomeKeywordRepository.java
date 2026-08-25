package vn.vht.qtkhcn.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.ActionOutcomeKeyword;

public interface ActionOutcomeKeywordRepository extends JpaRepository<ActionOutcomeKeyword, String> {
    List<ActionOutcomeKeyword> findAllByOrderByActionCodeAscKeywordAsc();

    List<ActionOutcomeKeyword> findAllByActionCodeOrderByKeywordAsc(String actionCode);
}

package vn.vht.qtkhcn.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.vht.qtkhcn.domain.ProcessDefinitionDraftRevision;

public interface ProcessDefinitionDraftRevisionRepository
        extends JpaRepository<ProcessDefinitionDraftRevision, UUID> {
    List<ProcessDefinitionDraftRevision> findByDraftIdOrderByRevisionDesc(UUID draftId);
    Optional<ProcessDefinitionDraftRevision> findByDraftIdAndRevision(UUID draftId, long revision);
    void deleteByDraftId(UUID draftId);
}

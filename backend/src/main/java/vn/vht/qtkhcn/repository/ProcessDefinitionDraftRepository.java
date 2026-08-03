package vn.vht.qtkhcn.repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.vht.qtkhcn.domain.ProcessDefinitionDraft;

public interface ProcessDefinitionDraftRepository extends JpaRepository<ProcessDefinitionDraft, UUID> {
    List<ProcessDefinitionDraft> findAllByOrderByUpdatedAtDesc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from ProcessDefinitionDraft d where d.id = :id")
    Optional<ProcessDefinitionDraft> findByIdForUpdate(@Param("id") UUID id);
}

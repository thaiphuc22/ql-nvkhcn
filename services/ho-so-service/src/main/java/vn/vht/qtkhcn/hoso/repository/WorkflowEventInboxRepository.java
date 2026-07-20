package vn.vht.qtkhcn.hoso.repository;

import java.util.UUID;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import vn.vht.qtkhcn.hoso.domain.WorkflowEventInbox;

public interface WorkflowEventInboxRepository extends JpaRepository<WorkflowEventInbox, UUID> {
    void deleteByHoSoId(String hoSoId);
    List<WorkflowEventInbox> findByHoSoIdOrderByOccurredAtAscEventIdAsc(String hoSoId);

    Optional<WorkflowEventInbox> findFirstByEventTypeOrderByOccurredAtDescEventIdDesc(String eventType);

    @Query(value = "SELECT DISTINCT ho_so_id FROM workflow_event_inbox WHERE processed_at IS NULL ORDER BY ho_so_id LIMIT 20",
            nativeQuery = true)
    List<String> findHoSoIdsAwaitingProjection();

    @Modifying
    @Transactional
    @Query(value = "UPDATE workflow_event_inbox SET processing_error = :error WHERE ho_so_id = :hoSoId AND processed_at IS NULL",
            nativeQuery = true)
    int recordProjectionError(@Param("hoSoId") String hoSoId, @Param("error") String error);
    @Modifying
    @Query(value = """
            INSERT INTO workflow_event_inbox
              (event_id, event_type, payload_hash, correlation_id, ho_so_id,
               process_instance_id, occurred_at, payload_json, received_at)
            VALUES (:eventId, :eventType, :payloadHash, :correlationId, :hoSoId,
                    :processInstanceId, :occurredAt, :payloadJson, :receivedAt)
            ON CONFLICT (event_id) DO NOTHING
            """, nativeQuery = true)
    int insertIfAbsent(@Param("eventId") UUID eventId, @Param("eventType") String eventType,
            @Param("payloadHash") String payloadHash, @Param("correlationId") String correlationId,
            @Param("hoSoId") String hoSoId, @Param("processInstanceId") String processInstanceId,
            @Param("occurredAt") OffsetDateTime occurredAt, @Param("payloadJson") String payloadJson,
            @Param("receivedAt") OffsetDateTime receivedAt);
}

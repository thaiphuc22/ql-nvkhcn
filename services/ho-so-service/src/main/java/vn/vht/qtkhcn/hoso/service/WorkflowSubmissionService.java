package vn.vht.qtkhcn.hoso.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.hoso.domain.DossierStatus;
import vn.vht.qtkhcn.hoso.domain.HoSo;
import vn.vht.qtkhcn.hoso.domain.NhiemVu;
import vn.vht.qtkhcn.hoso.domain.OutboxEvent;
import vn.vht.qtkhcn.hoso.integration.StartProcessCommand;
import vn.vht.qtkhcn.hoso.repository.HoSoRepository;
import vn.vht.qtkhcn.hoso.repository.NhiemVuRepository;
import vn.vht.qtkhcn.hoso.repository.OutboxEventRepository;
import vn.vht.qtkhcn.hoso.web.dto.SubmitHoSoRequest;

@Service
public class WorkflowSubmissionService {
    static final String EVENT_TYPE = "START_WORKFLOW_REQUESTED";

    private final HoSoRepository hoSoRepository;
    private final NhiemVuRepository nhiemVuRepository;
    private final OutboxEventRepository outboxRepository;
    private final MutationSupport mutations;
    private final ObjectMapper json;

    public WorkflowSubmissionService(HoSoRepository hoSoRepository, NhiemVuRepository nhiemVuRepository,
            OutboxEventRepository outboxRepository, MutationSupport mutations, ObjectMapper json) {
        this.hoSoRepository = hoSoRepository;
        this.nhiemVuRepository = nhiemVuRepository;
        this.outboxRepository = outboxRepository;
        this.mutations = mutations;
        this.json = json;
    }

    @Transactional
    public HoSo submit(String id, SubmitHoSoRequest request, String actorHeader) {
        String actor = mutations.requireActor(actorHeader);
        HoSo hoSo = hoSoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Khong tim thay HoSo " + id));
        if (hoSo.getTrangThai() != DossierStatus.DRAFT
                && hoSo.getTrangThai() != DossierStatus.START_FAILED) {
            throw new IllegalStateException("Ho so " + id + " da duoc gui hoac dang xu ly.");
        }
        String nhiemVuId = hoSo.getMaNV();
        NhiemVu nhiemVu = nhiemVuRepository.findById(nhiemVuId)
                .orElseThrow(() -> new EntityNotFoundException("Khong tim thay NhiemVu " + nhiemVuId));

        UUID requestId = UUID.randomUUID();
        StartProcessCommand command = new StartProcessCommand(requestId, hoSo.getId(), request.quyTrinh(),
                hoSo.getId(), hoSo.getMaNV(), actor,
                Map.of("maHoSo", hoSo.getId(), "cap", nhiemVu.getCap().name()));

        hoSo.setQuyTrinh(request.quyTrinh().trim());
        hoSo.setQuyTrinhTen(request.quyTrinhTen().trim());
        hoSo.setTrangThai(DossierStatus.START_PENDING);
        hoSo.setStartRequestId(requestId);
        hoSo.setStartFailure(null);
        hoSo = hoSoRepository.saveAndFlush(hoSo);

        OutboxEvent event = new OutboxEvent();
        event.setId(requestId);
        event.setAggregateId(id);
        event.setEventType(EVENT_TYPE);
        event.setPayloadJson(write(command));
        event.setStatus(OutboxEvent.Status.PENDING);
        event.setAttempts(0);
        event.setCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));
        event.setNextAttemptAt(event.getCreatedAt());
        outboxRepository.save(event);
        mutations.audit("HO_SO", id, hoSo.getVersion(), "SUBMIT_REQUESTED", actor,
                "requestId=" + requestId);
        return hoSo;
    }

    private String write(StartProcessCommand command) {
        try {
            return json.writeValueAsString(command);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Khong the tao outbox payload.", e);
        }
    }
}

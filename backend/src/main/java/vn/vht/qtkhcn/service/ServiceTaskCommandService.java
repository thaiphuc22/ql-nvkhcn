package vn.vht.qtkhcn.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.domain.ServiceTaskConfigVersion;
import vn.vht.qtkhcn.domain.ServiceTaskConfigVersionStatus;
import vn.vht.qtkhcn.domain.ServiceTaskDefinition;
import vn.vht.qtkhcn.domain.ServiceTaskDefinitionStatus;
import vn.vht.qtkhcn.repository.ServiceTaskBindingRepository;
import vn.vht.qtkhcn.repository.ServiceTaskConfigVersionRepository;
import vn.vht.qtkhcn.repository.ServiceTaskDefinitionRepository;
import vn.vht.qtkhcn.web.dto.ServiceTaskDtos.DefinitionWriteRequest;

/** Mutations for service-task definitions. Configuration versions are append-only. */
@Service
public class ServiceTaskCommandService {
    private final ServiceTaskDefinitionRepository definitions;
    private final ServiceTaskConfigVersionRepository versions;
    private final ServiceTaskBindingRepository bindings;
    private final ObjectMapper objectMapper;

    public ServiceTaskCommandService(ServiceTaskDefinitionRepository definitions,
            ServiceTaskConfigVersionRepository versions, ServiceTaskBindingRepository bindings,
            ObjectMapper objectMapper) {
        this.definitions = definitions;
        this.versions = versions;
        this.bindings = bindings;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public UUID create(DefinitionWriteRequest request) {
        String code = normalizeCode(request.code());
        ensureCodeAvailable(code, null);
        OffsetDateTime now = OffsetDateTime.now();
        String actor = actor(request.actor());
        ServiceTaskDefinition definition = new ServiceTaskDefinition();
        definition.setId(UUID.randomUUID());
        definition.setCode(code);
        applyMetadata(definition, request);
        definition.setStatus(ServiceTaskDefinitionStatus.DRAFT);
        definition.setLatestVersion(1);
        definition.setActiveVersion(null);
        definition.setCreatedBy(actor);
        definition.setCreatedAt(now);
        definition.setUpdatedBy(actor);
        definition.setUpdatedAt(now);
        definitions.save(definition);
        versions.save(newVersion(definition.getId(), 1, request, actor, now));
        return definition.getId();
    }

    @Transactional
    public void update(UUID id, DefinitionWriteRequest request) {
        ServiceTaskDefinition definition = requireDefinition(id);
        String code = normalizeCode(request.code());
        ensureCodeAvailable(code, id);
        definition.setCode(code);
        applyMetadata(definition, request);
        int nextVersion = definition.getLatestVersion() + 1;
        definition.setLatestVersion(nextVersion);
        // Giữ version ACTIVE hiện tại tiếp tục chi phối worker; version mới chỉ là draft.
        if (definition.getActiveVersion() == null) {
            definition.setStatus(ServiceTaskDefinitionStatus.DRAFT);
        }
        definition.setUpdatedBy(actor(request.actor()));
        definition.setUpdatedAt(OffsetDateTime.now());
        definitions.save(definition);
        versions.save(newVersion(id, nextVersion, request, definition.getUpdatedBy(), definition.getUpdatedAt()));
    }

    @Transactional
    public void delete(UUID id) {
        ServiceTaskDefinition definition = requireDefinition(id);
        if (!bindings.findByDefinitionIdOrderByBpmnProcessIdAscElementIdAsc(id).isEmpty()) {
            throw new IllegalStateException("Không thể xóa cấu hình đang có binding; hãy gỡ binding trước.");
        }
        definitions.delete(definition);
    }

    private ServiceTaskDefinition requireDefinition(UUID id) {
        return definitions.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy cấu hình tác vụ hệ thống " + id));
    }

    private void ensureCodeAvailable(String code, UUID currentId) {
        definitions.findByCode(code).filter(found -> !found.getId().equals(currentId)).ifPresent(found -> {
            throw new IllegalArgumentException("Mã cấu hình đã tồn tại: " + code);
        });
    }

    private void applyMetadata(ServiceTaskDefinition definition, DefinitionWriteRequest request) {
        definition.setName(request.name().trim());
        definition.setDescription(request.description() == null ? "" : request.description().trim());
        definition.setTypeCode(request.typeCode());
        definition.setOwnerModule(request.ownerModule().trim());
        definition.setTags(new LinkedHashSet<>(request.tags() == null ? List.of() : request.tags()));
    }

    private ServiceTaskConfigVersion newVersion(UUID definitionId, int versionNo,
            DefinitionWriteRequest request, String actor, OffsetDateTime now) {
        ServiceTaskConfigVersion version = new ServiceTaskConfigVersion();
        version.setId(UUID.randomUUID());
        version.setDefinitionId(definitionId);
        version.setVersion(versionNo);
        version.setConfigJson(json(request.config()));
        version.setInputMapping(json(request.inputMapping() == null ? List.of() : request.inputMapping()));
        version.setOutputMapping(json(request.outputMapping() == null ? List.of() : request.outputMapping()));
        version.setErrorPolicy(json(request.errorPolicy()));
        version.setStatus(ServiceTaskConfigVersionStatus.DRAFT);
        version.setChangeNote(request.changeNote() == null ? "" : request.changeNote().trim());
        version.setCreatedBy(actor);
        version.setCreatedAt(now);
        return version;
    }

    private String json(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Cấu hình JSON không hợp lệ.", e);
        }
    }

    private String normalizeCode(String code) {
        return code.trim().toUpperCase(Locale.ROOT);
    }

    private String actor(String value) {
        return value == null || value.isBlank() ? "admin" : value.trim();
    }
}

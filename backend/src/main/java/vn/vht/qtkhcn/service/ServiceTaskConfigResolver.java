package vn.vht.qtkhcn.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.domain.ServiceTaskBinding;
import vn.vht.qtkhcn.domain.ServiceTaskBindingStatus;
import vn.vht.qtkhcn.domain.ServiceTaskConfigVersion;
import vn.vht.qtkhcn.domain.ServiceTaskConfigVersionStatus;
import vn.vht.qtkhcn.domain.ServiceTaskDefinition;
import vn.vht.qtkhcn.domain.ServiceTaskDefinitionStatus;
import vn.vht.qtkhcn.repository.ServiceTaskBindingRepository;
import vn.vht.qtkhcn.repository.ServiceTaskConfigVersionRepository;
import vn.vht.qtkhcn.repository.ServiceTaskDefinitionRepository;

/**
 * Tra cấu hình chi phối một service task lúc chạy.
 *
 * Đường resolve, dừng ở bước đầu tiên khớp:
 *   1. binding ACTIVE ghim đúng {@code (bpmnProcessId, elementId)};
 *   2. binding ACTIVE rộng theo {@code jobType} ({@code element_id IS NULL}).
 *
 * Sau khi có binding vẫn phải qua đủ ba cửa: definition ACTIVE → có {@code activeVersion} → version
 * đó tồn tại và ở trạng thái ACTIVE. Thiếu bất kỳ cửa nào ⇒ trả rỗng kèm log WARN nêu rõ lý do.
 *
 * Trả {@link Optional} chứ không ném exception là có chủ ý: worker phải tự quyết định fallback,
 * resolver không được phép làm process đang chạy sinh incident chỉ vì thiếu cấu hình quản trị.
 */
@Service
public class ServiceTaskConfigResolver {

    private static final Logger log = LoggerFactory.getLogger(ServiceTaskConfigResolver.class);

    private final ServiceTaskBindingRepository bindings;
    private final ServiceTaskDefinitionRepository definitions;
    private final ServiceTaskConfigVersionRepository versions;
    private final ObjectMapper objectMapper;

    public ServiceTaskConfigResolver(
            ServiceTaskBindingRepository bindings,
            ServiceTaskDefinitionRepository definitions,
            ServiceTaskConfigVersionRepository versions,
            ObjectMapper objectMapper) {
        this.bindings = bindings;
        this.definitions = definitions;
        this.versions = versions;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public Optional<ResolvedServiceTaskConfig> resolve(String bpmnProcessId, String elementId, String jobType) {
        Optional<ServiceTaskBinding> binding = findBinding(bpmnProcessId, elementId, jobType);
        if (binding.isEmpty()) {
            log.warn("Không có binding ACTIVE cho service task {}#{} (jobType={})", bpmnProcessId, elementId, jobType);
            return Optional.empty();
        }
        return resolveFrom(binding.get());
    }

    private Optional<ServiceTaskBinding> findBinding(String bpmnProcessId, String elementId, String jobType) {
        if (bpmnProcessId != null && elementId != null) {
            Optional<ServiceTaskBinding> pinned = bindings
                    .findByBpmnProcessIdAndElementIdAndBindingStatus(
                            bpmnProcessId, elementId, ServiceTaskBindingStatus.ACTIVE);
            if (pinned.isPresent()) {
                return pinned;
            }
        }
        if (jobType == null) {
            return Optional.empty();
        }
        return bindings.findByJobTypeAndElementIdIsNullAndBindingStatus(jobType, ServiceTaskBindingStatus.ACTIVE);
    }

    private Optional<ResolvedServiceTaskConfig> resolveFrom(ServiceTaskBinding binding) {
        ServiceTaskDefinition definition = definitions.findById(binding.getDefinitionId()).orElse(null);
        if (definition == null) {
            log.warn("Binding {} trỏ tới definition {} không còn tồn tại.", binding.getId(), binding.getDefinitionId());
            return Optional.empty();
        }
        if (definition.getStatus() != ServiceTaskDefinitionStatus.ACTIVE) {
            log.warn("Definition {} đang ở trạng thái {} (cần ACTIVE).", definition.getCode(), definition.getStatus());
            return Optional.empty();
        }
        Integer activeVersion = definition.getActiveVersion();
        if (activeVersion == null) {
            log.warn("Definition {} chưa active version nào.", definition.getCode());
            return Optional.empty();
        }

        ServiceTaskConfigVersion version = versions
                .findByDefinitionIdAndVersion(definition.getId(), activeVersion)
                .orElse(null);
        if (version == null || version.getStatus() != ServiceTaskConfigVersionStatus.ACTIVE) {
            log.warn("Definition {} trỏ activeVersion={} nhưng version đó không tồn tại hoặc chưa ACTIVE.",
                    definition.getCode(), activeVersion);
            return Optional.empty();
        }

        JsonNode config;
        try {
            config = objectMapper.readTree(version.getConfigJson());
        } catch (JsonProcessingException e) {
            // Không để config hỏng làm chết job — worker sẽ tự fallback.
            log.warn("config_json của {} v{} không parse được: {}", definition.getCode(), activeVersion, e.getMessage());
            return Optional.empty();
        }

        return Optional.of(new ResolvedServiceTaskConfig(
                definition.getCode(), definition.getTypeCode(), version.getVersion(), config));
    }
}

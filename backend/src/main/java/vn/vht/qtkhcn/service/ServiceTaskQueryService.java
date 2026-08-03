package vn.vht.qtkhcn.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.domain.ServiceTaskBinding;
import vn.vht.qtkhcn.domain.ServiceTaskConfigVersion;
import vn.vht.qtkhcn.domain.ServiceTaskDefinition;
import vn.vht.qtkhcn.domain.ServiceTaskDefinitionStatus;
import vn.vht.qtkhcn.repository.ServiceTaskBindingRepository;
import vn.vht.qtkhcn.repository.ServiceTaskConfigVersionRepository;
import vn.vht.qtkhcn.repository.ServiceTaskDefinitionRepository;
import vn.vht.qtkhcn.web.dto.ServiceTaskDtos.Binding;
import vn.vht.qtkhcn.web.dto.ServiceTaskDtos.ConfigVersion;
import vn.vht.qtkhcn.web.dto.ServiceTaskDtos.DefinitionDetail;
import vn.vht.qtkhcn.web.dto.ServiceTaskDtos.DefinitionSummary;

/**
 * Đọc cấu hình tác vụ hệ thống cho màn quản trị.
 *
 * CHỈ ĐỌC — chưa có ghi. Mục đích trước mắt là chấm dứt tình trạng màn `/cau-hinh-tac-vu` hiển thị
 * seed in-memory của frontend trong khi runtime lại chạy theo dữ liệu trong DB: hai nguồn đó đang
 * lệch nhau và người dùng không có cách nào biết.
 *
 * Cùng đọc một bộ bảng mà {@link ServiceTaskConfigResolver} dùng, nên những gì màn hình hiện ra
 * đúng là những gì chi phối worker.
 */
@Service
public class ServiceTaskQueryService {

    private static final Logger log = LoggerFactory.getLogger(ServiceTaskQueryService.class);

    private final ServiceTaskDefinitionRepository definitions;
    private final ServiceTaskConfigVersionRepository versions;
    private final ServiceTaskBindingRepository bindings;
    private final ObjectMapper objectMapper;

    public ServiceTaskQueryService(
            ServiceTaskDefinitionRepository definitions,
            ServiceTaskConfigVersionRepository versions,
            ServiceTaskBindingRepository bindings,
            ObjectMapper objectMapper) {
        this.definitions = definitions;
        this.versions = versions;
        this.bindings = bindings;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<DefinitionSummary> list(ServiceTaskDefinitionStatus status, String query) {
        Map<UUID, Long> bindingCounts = bindings.findAll().stream()
                .collect(Collectors.groupingBy(ServiceTaskBinding::getDefinitionId, Collectors.counting()));
        String needle = query == null ? null : query.trim().toLowerCase(Locale.ROOT);

        List<DefinitionSummary> result = new ArrayList<>();
        for (ServiceTaskDefinition definition : definitions.findAllByOrderByCodeAsc()) {
            if (status != null && definition.getStatus() != status) {
                continue;
            }
            if (needle != null && !needle.isEmpty() && !matches(definition, needle)) {
                continue;
            }
            result.add(new DefinitionSummary(
                    definition.getId(),
                    definition.getCode(),
                    definition.getName(),
                    definition.getDescription(),
                    definition.getTypeCode(),
                    definition.getStatus(),
                    definition.getOwnerModule(),
                    definition.getLatestVersion(),
                    definition.getActiveVersion(),
                    List.copyOf(definition.getTags()),
                    bindingCounts.getOrDefault(definition.getId(), 0L).intValue(),
                    definition.getUpdatedAt()));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public DefinitionDetail get(UUID id) {
        ServiceTaskDefinition definition = definitions.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy cấu hình tác vụ hệ thống " + id));

        List<ConfigVersion> versionDtos = versions.findByDefinitionIdOrderByVersionDesc(id).stream()
                .map(this::toVersion)
                .toList();
        List<Binding> bindingDtos = bindings.findByDefinitionIdOrderByBpmnProcessIdAscElementIdAsc(id).stream()
                .map(binding -> toBinding(binding, definition.getCode()))
                .toList();

        return new DefinitionDetail(
                definition.getId(),
                definition.getCode(),
                definition.getName(),
                definition.getDescription(),
                definition.getTypeCode(),
                definition.getStatus(),
                definition.getOwnerModule(),
                definition.getLatestVersion(),
                definition.getActiveVersion(),
                List.copyOf(definition.getTags()),
                definition.getCreatedBy(),
                definition.getCreatedAt(),
                definition.getUpdatedBy(),
                definition.getUpdatedAt(),
                versionDtos,
                bindingDtos);
    }

    /** Toàn bộ binding — góc nhìn "service task nào trong BPMN đang bị cấu hình nào chi phối". */
    @Transactional(readOnly = true)
    public List<Binding> listBindings() {
        Map<UUID, String> codeById = definitions.findAll().stream()
                .collect(Collectors.toMap(ServiceTaskDefinition::getId, ServiceTaskDefinition::getCode));
        return bindings.findAllByOrderByBpmnProcessIdAscElementIdAsc().stream()
                .map(binding -> toBinding(binding, codeById.get(binding.getDefinitionId())))
                .toList();
    }

    private boolean matches(ServiceTaskDefinition definition, String needle) {
        return contains(definition.getCode(), needle)
                || contains(definition.getName(), needle)
                || contains(definition.getOwnerModule(), needle)
                || definition.getTags().stream().anyMatch(tag -> contains(tag, needle));
    }

    private boolean contains(String value, String needle) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(needle);
    }

    private ConfigVersion toVersion(ServiceTaskConfigVersion version) {
        return new ConfigVersion(
                version.getId(),
                version.getVersion(),
                readObject(version.getConfigJson(), version, "config_json"),
                readArray(version.getInputMapping(), version, "input_mapping"),
                readArray(version.getOutputMapping(), version, "output_mapping"),
                readObject(version.getErrorPolicy(), version, "error_policy"),
                version.getStatus(),
                version.getChangeNote(),
                version.getCreatedBy(),
                version.getCreatedAt());
    }

    private Binding toBinding(ServiceTaskBinding binding, String definitionCode) {
        return new Binding(
                binding.getId(),
                binding.getBpmnProcessId(),
                binding.getElementId(),
                binding.getJobType(),
                binding.getDefinitionId(),
                definitionCode,
                binding.getBindingStatus(),
                binding.getProcessCode(),
                binding.getTaskName(),
                binding.getEffectiveFrom(),
                binding.getEffectiveTo(),
                binding.getCreatedBy(),
                binding.getUpdatedAt());
    }

    private Map<String, Object> readObject(String raw, ServiceTaskConfigVersion version, String field) {
        return readJson(raw, version, field, new TypeReference<Map<String, Object>>() {});
    }

    private List<Map<String, Object>> readArray(String raw, ServiceTaskConfigVersion version, String field) {
        return readJson(raw, version, field, new TypeReference<List<Map<String, Object>>>() {});
    }

    /**
     * JSON hỏng trả về {@code null} thay vì ném lỗi: cùng lý do resolver trả rỗng — một row hỏng
     * không được làm sập cả danh sách. Log ERROR để chỗ hỏng vẫn lộ ra.
     */
    private <T> T readJson(String raw, ServiceTaskConfigVersion version, String field, TypeReference<T> type) {
        try {
            return objectMapper.readValue(raw, type);
        } catch (JsonProcessingException e) {
            log.error("{} của service_task_config_version {} (v{}) không đọc được thành {}",
                    field, version.getId(), version.getVersion(), type.getType(), e);
            return null;
        }
    }
}

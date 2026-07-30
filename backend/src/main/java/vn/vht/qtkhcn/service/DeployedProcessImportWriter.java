package vn.vht.qtkhcn.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.camunda.CamundaProcessDefinitionLookup.DeployedProcessDefinition;
import vn.vht.qtkhcn.domain.ProcessDefinitionCatalog;
import vn.vht.qtkhcn.domain.ProcessDefinitionSource;
import vn.vht.qtkhcn.domain.ProcessDefinitionStatus;
import vn.vht.qtkhcn.domain.ProcessDefinitionVersion;
import vn.vht.qtkhcn.repository.ProcessDefinitionCatalogRepository;
import vn.vht.qtkhcn.repository.ProcessDefinitionVersionRepository;
import vn.vht.qtkhcn.web.dto.ProcessSyncResponse.ImportedProcess;

/**
 * Ghi MỘT quy trình hút từ Camunda vào catalog, mỗi lần một transaction riêng.
 *
 * Tách khỏi {@link DeployedProcessImportService} không phải để cho gọn mà vì transaction: nếu cả
 * lượt đồng bộ nằm trong một transaction thì một lỗi ghi (ví dụ đụng unique
 * {@code (catalog_id, camunda_version)} do dữ liệu catalog cũ lệch) sẽ đánh dấu rollback-only và
 * kéo đổ luôn những quy trình đã nhập thành công trước đó. {@code REQUIRES_NEW} giữ đúng tinh thần
 * "hút được cái nào chắc cái đó".
 */
@Component
public class DeployedProcessImportWriter {

    private final ProcessDefinitionCatalogRepository catalogRepository;
    private final ProcessDefinitionVersionRepository versionRepository;
    private final ApplicationEventPublisher events;

    public DeployedProcessImportWriter(ProcessDefinitionCatalogRepository catalogRepository,
            ProcessDefinitionVersionRepository versionRepository,
            ApplicationEventPublisher events) {
        this.catalogRepository = catalogRepository;
        this.versionRepository = versionRepository;
        this.events = events;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ImportedProcess write(DeployedProcessDefinition definition, String bpmnXml, String actor) {
        OffsetDateTime now = OffsetDateTime.now();
        String displayName = trim(blankFallback(definition.name(), definition.bpmnProcessId()), 512);

        // Cùng `bpmnProcessId` deploy qua app rồi lại deploy thẳng lên Camunda là hợp lệ: hai đường
        // cùng trỏ về MỘT dòng catalog (unique bpmn_process_id), khác nhau ở dòng version. Không tạo
        // catalog thứ hai, cũng không từ chối bản EXTERNAL.
        Optional<ProcessDefinitionCatalog> existing = catalogRepository
                .findByBpmnProcessId(definition.bpmnProcessId());
        boolean newCatalog = existing.isEmpty();
        ProcessDefinitionCatalog catalog = existing.orElseGet(() -> {
            ProcessDefinitionCatalog fresh = new ProcessDefinitionCatalog();
            fresh.setId(UUID.randomUUID());
            fresh.setBpmnProcessId(definition.bpmnProcessId());
            fresh.setCreatedAt(now);
            return fresh;
        });
        catalog.setName(displayName);
        catalog.setUpdatedAt(now);
        catalog = catalogRepository.save(catalog);

        ProcessDefinitionVersion version = new ProcessDefinitionVersion();
        version.setId(UUID.randomUUID());
        version.setCatalogId(catalog.getId());
        version.setCamundaVersion(definition.version());
        version.setResourceName(trim(blankFallback(definition.resourceName(),
                definition.bpmnProcessId() + ".bpmn"), 255));
        version.setChecksumSha256(sha256(bpmnXml));
        // Search API của Camunda không trả deployment key. 0 = "không biết", chấp nhận được vì cột này
        // chỉ dùng để truy vết ngược lên Operate, không tham gia khoá hay logic nào.
        version.setCamundaDeploymentKey(0L);
        version.setCamundaProcessDefinitionKey(definition.processDefinitionKey());
        version.setStatus(ProcessDefinitionStatus.DEPLOYED);
        version.setSource(ProcessDefinitionSource.EXTERNAL);
        version.setImportedBy(ProcessDefinitionService.normalizeActor(actor));
        version.setImportedAt(now);
        version.setBpmnXml(bpmnXml);
        version = versionRepository.save(version);

        // Quy trình vẽ ngoài app cũng cần luật hành động, không thì hút về xong vẫn không bấm được nút
        // nào. Sự kiện được xử lý sau khi transaction REQUIRES_NEW này commit.
        events.publishEvent(new ProcessDeployedEvent(catalog.getBpmnProcessId(), actor));

        return new ImportedProcess(catalog.getId(), version.getId(), catalog.getBpmnProcessId(),
                catalog.getName(), version.getCamundaVersion(), newCatalog);
    }

    private static String blankFallback(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private static String trim(String value, int maxLength) {
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }

    private static String sha256(String value) {
        try {
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("JVM không hỗ trợ SHA-256.", e);
        }
    }
}

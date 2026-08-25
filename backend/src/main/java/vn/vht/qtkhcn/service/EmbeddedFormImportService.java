package vn.vht.qtkhcn.service;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import vn.vht.qtkhcn.domain.ProcessDefinitionVersion;
import vn.vht.qtkhcn.repository.ProcessDefinitionCatalogRepository;
import vn.vht.qtkhcn.repository.ProcessDefinitionVersionRepository;
import vn.vht.qtkhcn.service.EformService.ImportOutcome;
import vn.vht.qtkhcn.service.EmbeddedFormReader.EmbeddedForm;

/**
 * Hút biểu mẫu NHÚNG của một quy trình từ BPMN đã nằm trong catalog vào thư viện biểu mẫu.
 *
 * <p>Phải chạy XONG TRƯỚC {@link DeployedProcessPolicyScaffolder}: scaffold ghim {@code formKey} của
 * bước vào luật hành động, mà {@code ActionStudioService.validateBundle} đòi biểu mẫu phải có sẵn
 * trong bảng {@code eform} — không có thì ném "Bieu mau khong ton tai" và hỏng CẢ LƯỢT scaffold, tức
 * quy trình hút về xong không bấm được nút nào. Thứ tự được bảo đảm bằng {@code @Order} trên hai
 * listener cùng nghe {@link ProcessDeployedEvent}.
 */
@Service
public class EmbeddedFormImportService {

    private static final Logger log = LoggerFactory.getLogger(EmbeddedFormImportService.class);

    private final ProcessDefinitionCatalogRepository catalogRepository;
    private final ProcessDefinitionVersionRepository versionRepository;
    private final EformService eforms;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public EmbeddedFormImportService(ProcessDefinitionCatalogRepository catalogRepository,
            ProcessDefinitionVersionRepository versionRepository, EformService eforms,
            com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        this.catalogRepository = catalogRepository;
        this.versionRepository = versionRepository;
        this.eforms = eforms;
        this.objectMapper = objectMapper;
    }

    /**
     * {@code AFTER_COMMIT} vì cùng lý do đã ghi ở {@link DeployedProcessPolicyScaffolder}: lúc này
     * dòng version mới thật sự hiện hữu để đọc lại BPMN XML, và lỗi hút biểu mẫu không được phép kéo
     * đổ transaction deploy khi BPMN thì đã nằm trên Zeebe rồi.
     *
     * <p>{@code @Order} nhỏ hơn scaffolder — ràng buộc THẬT, không phải cho gọn: scaffold chạy trước
     * khi biểu mẫu có trong bảng sẽ ném "Bieu mau khong ton tai" và hỏng cả lượt.
     */
    @Order(10)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onProcessDeployed(ProcessDeployedEvent event) {
        try {
            importFor(event.bpmnProcessId(), event.actor());
        } catch (RuntimeException failure) {
            // Quy trình không có form nhúng, hoặc thân thẻ không phải JSON hợp lệ — đều là "quy trình
            // cần xem lại", không phải "đồng bộ hỏng". Scaffold vẫn chạy tiếp sau đó.
            log.warn("Không hút được biểu mẫu nhúng của quy trình {}", event.bpmnProcessId(), failure);
        }
    }

    /** @return số biểu mẫu đã tạo mới hoặc cập nhật. */
    @Transactional
    public int importFor(String bpmnProcessId, String actor) {
        String bpmnXml = catalogRepository.findByBpmnProcessId(bpmnProcessId)
                .flatMap(catalog -> versionRepository.findFirstByCatalogIdOrderByCamundaVersionDesc(catalog.getId()))
                .map(ProcessDefinitionVersion::getBpmnXml)
                .filter(xml -> xml != null && !xml.isBlank())
                .orElse(null);
        if (bpmnXml == null) {
            log.warn("Không có BPMN XML cho quy trình {} — bỏ qua lượt hút biểu mẫu nhúng.", bpmnProcessId);
            return 0;
        }

        List<EmbeddedForm> forms = EmbeddedFormReader.parse(bpmnXml);
        int changed = 0;
        for (EmbeddedForm form : forms) {
            // Chặn JSON hỏng NGAY TẠI CỬA. Lọt vào bảng thì mỗi lần đọc form đều ném — kể cả
            // `missingRequiredFormFields` lúc submit và `toResponse` lúc mở thư viện — và lỗi hiện ra
            // ở nơi rất xa nguyên nhân. Một form hỏng cũng không được làm hỏng lượt hút cả quy trình.
            if (!isJson(form.schemaJson())) {
                log.warn("Biểu mẫu nhúng '{}' của quy trình {} có thân không phải JSON hợp lệ — bỏ qua.",
                        form.id(), bpmnProcessId);
                continue;
            }
            ImportOutcome outcome = eforms.importFromCamunda(form.id(), form.id(), form.ten(),
                    "Biểu mẫu khai trên Camunda, hút từ quy trình " + bpmnProcessId, form.schemaJson(), actor);
            if (outcome == ImportOutcome.CREATED || outcome == ImportOutcome.UPDATED) changed++;
            if (outcome == ImportOutcome.SKIPPED_APP_OWNED) {
                // Không tự đổi tên để né: khoá này đang được BPMN trỏ tới, đổi đi thì bước vẫn không có
                // form mà lại thêm một dòng rác. Người dùng phải chọn đổi bên nào.
                log.warn("Biểu mẫu nhúng '{}' của quy trình {} trùng khoá với biểu mẫu do app tự vẽ — "
                        + "BỎ QUA để không đè mất bản của BA. Đổi id trong BPMN hoặc đổi khoá biểu mẫu trong app.",
                        form.id(), bpmnProcessId);
            }
        }
        if (!forms.isEmpty()) {
            log.info("Hút {} biểu mẫu nhúng từ quy trình {}, {} dòng thay đổi.", forms.size(), bpmnProcessId, changed);
        }
        return changed;
    }

    private boolean isJson(String value) {
        try {
            objectMapper.readTree(value);
            return true;
        } catch (com.fasterxml.jackson.core.JsonProcessingException invalid) {
            return false;
        }
    }
}

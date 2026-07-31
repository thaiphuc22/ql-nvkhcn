package vn.vht.qtkhcn.service;

import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import vn.vht.qtkhcn.camunda.CamundaProcessDefinitionLookup;
import vn.vht.qtkhcn.camunda.CamundaProcessDefinitionLookup.DeployedProcessDefinition;
import vn.vht.qtkhcn.camunda.CamundaProcessDefinitionLookup.DeployedProcessPage;
import vn.vht.qtkhcn.repository.ProcessDefinitionVersionRepository;
import vn.vht.qtkhcn.web.dto.ProcessSyncResponse;
import vn.vht.qtkhcn.web.dto.ProcessSyncResponse.ImportedProcess;
import vn.vht.qtkhcn.web.dto.ProcessSyncResponse.SyncFailure;

/**
 * Hút quy trình deploy THẲNG lên Camunda (Modeler, zbctl, CI) về catalog của app.
 *
 * Lý do tồn tại: trước đây catalog chỉ biết quy trình đi qua {@code /api/process-definitions/import}
 * hoặc deploy draft, nên một BPMN deploy ngoài app là vô hình với toàn hệ thống — không chọn được
 * khi gửi duyệt, {@code DeployedBpmnRoutingReader} không dựng được bước, màn {@code /quy-trinh}
 * không thấy. Đây là một trong hai đường tạo BPMN mà người dùng đã chốt ngày 2026-07-28.
 *
 * Chủ động (bấm nút), KHÔNG tự chạy nền: đồng bộ ngầm mỗi lần khởi động sẽ âm thầm kéo cả process
 * rác trên engine dev vào danh sách người dùng chọn khi gửi duyệt.
 *
 * KHÔNG chạy lint/validate lúc nhập — theo quyết định của người dùng cùng ngày ("chưa cần warning
 * hoặc chặn cứng"). Quy trình nhập về có thể thiếu form, sai vai trò, hay có service task không
 * worker; các chẩn đoán đó thuộc màn đối soát ở lát sau.
 */
@Service
public class DeployedProcessImportService {

    /**
     * Trần một lượt quét. Engine của dự án đếm bằng chục quy trình; đặt trần để một engine lạ có
     * hàng nghìn definition không kéo về hết trong một request. Vượt trần thì báo warning chứ không
     * im lặng — xem {@link CamundaProcessDefinitionLookup#countLatest()}.
     */
    static final int MAX_SCAN = 500;

    private static final Logger log = LoggerFactory.getLogger(DeployedProcessImportService.class);

    private final CamundaProcessDefinitionLookup lookup;
    private final ProcessDefinitionVersionRepository versionRepository;
    private final DeployedProcessImportWriter writer;

    public DeployedProcessImportService(CamundaProcessDefinitionLookup lookup,
            ProcessDefinitionVersionRepository versionRepository, DeployedProcessImportWriter writer) {
        this.lookup = lookup;
        this.versionRepository = versionRepository;
        this.writer = writer;
    }

    public ProcessSyncResponse syncFromCamunda(String actor) {
        DeployedProcessPage page = lookup.listLatest(MAX_SCAN);
        List<DeployedProcessDefinition> definitions = page.items();
        List<String> warnings = new ArrayList<>();
        if (page.totalOnEngine() > definitions.size()) {
            warnings.add("Engine đang có %d quy trình nhưng lượt này chỉ quét %d — chạy lại sau khi nhập xong đợt đầu."
                    .formatted(page.totalOnEngine(), definitions.size()));
        }

        List<ImportedProcess> imported = new ArrayList<>();
        List<SyncFailure> failures = new ArrayList<>();
        int alreadyKnown = 0;
        for (DeployedProcessDefinition definition : definitions) {
            // Khoá đối chiếu là `camundaProcessDefinitionKey` chứ không phải `bpmnProcessId`: bản
            // deploy qua app đã lưu đúng key này, nên quy trình do chính app deploy sẽ được nhận ra
            // là "đã biết" thay vì bị nhập lại thành dòng version trùng.
            if (versionRepository.findByCamundaProcessDefinitionKey(definition.processDefinitionKey()).isPresent()) {
                alreadyKnown++;
                continue;
            }
            try {
                imported.add(writer.write(definition, lookup.fetchXml(definition.processDefinitionKey()), actor));
            } catch (RuntimeException exception) {
                log.warn("Không nhập được quy trình {} từ Camunda", definition.bpmnProcessId(), exception);
                failures.add(new SyncFailure(definition.bpmnProcessId(), rootMessage(exception)));
            }
        }
        return new ProcessSyncResponse(definitions.size(), imported.size(), alreadyKnown,
                List.copyOf(imported), List.copyOf(failures), List.copyOf(warnings));
    }

    private static String rootMessage(RuntimeException exception) {
        Throwable root = exception;
        while (root.getCause() != null) {
            root = root.getCause();
        }
        return root.getMessage() == null ? root.getClass().getSimpleName() : root.getMessage();
    }
}

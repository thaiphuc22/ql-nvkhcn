package vn.vht.qtkhcn.camunda;

import io.camunda.client.CamundaClient;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import vn.vht.qtkhcn.service.ProcessImportException;

/** Read-only engine lookup used to keep bundled startup deployment idempotent. */
@Service
public class CamundaProcessDefinitionLookup {

    private final CamundaClient camundaClient;

    public CamundaProcessDefinitionLookup(CamundaClient camundaClient) {
        this.camundaClient = camundaClient;
    }

    public Optional<ProcessDefinitionInfo> findLatest(String bpmnProcessId) {
        try {
            List<io.camunda.client.api.search.response.ProcessDefinition> definitions = camundaClient
                    .newProcessDefinitionSearchRequest()
                    .filter(filter -> filter.processDefinitionId(bpmnProcessId))
                    .send().join().items();
            return definitions.stream()
                    .max(Comparator.comparingInt(
                            io.camunda.client.api.search.response.ProcessDefinition::getVersion))
                    .map(definition -> new ProcessDefinitionInfo(definition.getProcessDefinitionId(),
                            definition.getVersion(), definition.getProcessDefinitionKey()));
        } catch (Exception e) {
            throw lookupFailure(bpmnProcessId, e);
        }
    }

    /**
     * Mọi process definition bản mới nhất đang có trên engine — nguồn của importer "Đồng bộ từ
     * Camunda" (quy trình deploy thẳng lên Camunda, không qua app, nên catalog không biết).
     *
     * Chỉ lấy `isLatestVersion(true)`: mục tiêu là đưa quy trình vào catalog để chọn được khi gửi
     * duyệt, mà runtime luôn khởi động bản mới nhất. Kéo về toàn bộ lịch sử version chỉ làm phình
     * bảng `process_definition_version` bằng dữ liệu không ai dùng tới.
     *
     * Phân trang một lượt với {@code limit}: engine dev/staging của dự án đếm bằng chục quy trình.
     * Trả kèm {@code totalOnEngine} lấy từ chính response phân trang, để người gọi biết lượt quét có
     * bị cắt hay không mà không phải gọi engine lần hai.
     */
    public DeployedProcessPage listLatest(int limit) {
        try {
            var response = camundaClient.newProcessDefinitionSearchRequest()
                    .filter(filter -> filter.isLatestVersion(true))
                    .page(page -> page.limit(limit))
                    .send().join();
            List<DeployedProcessDefinition> items = response.items().stream()
                    .map(definition -> new DeployedProcessDefinition(definition.getProcessDefinitionId(),
                            definition.getName(), definition.getResourceName(), definition.getVersion(),
                            definition.getProcessDefinitionKey()))
                    .toList();
            Long total = response.page() == null ? null : response.page().totalItems();
            return new DeployedProcessPage(items, total == null ? items.size() : total);
        } catch (Exception e) {
            throw lookupFailure("(tất cả)", e);
        }
    }

    /**
     * BPMN XML gốc của một process definition. Bắt buộc cho importer: {@code process_definition_version.bpmn_xml}
     * là NOT NULL, và {@code DeployedBpmnRoutingReader} đọc chính cột này để dựng bước/route — nhập
     * quy trình mà không có XML thì nó vào catalog nhưng không sinh được bước nào.
     */
    public String fetchXml(long processDefinitionKey) {
        try {
            return camundaClient.newProcessDefinitionGetXmlRequest(processDefinitionKey).send().join();
        } catch (Exception e) {
            throw lookupFailure("processDefinitionKey " + processDefinitionKey, e);
        }
    }

    private static ProcessImportException lookupFailure(String bpmnProcessId, Exception e) {
        Throwable root = e;
        while (root.getCause() != null) {
            root = root.getCause();
        }
        String detail = root.getMessage() == null ? root.getClass().getSimpleName() : root.getMessage();
        return new ProcessImportException(ProcessImportException.Kind.DEPLOYMENT,
                "Không thể kiểm tra process definition hiện có trên Camunda.",
                List.of("Process id: " + bpmnProcessId, detail), e);
    }

    public record ProcessDefinitionInfo(String bpmnProcessId, int version, long processDefinitionKey) {
    }

    /**
     * Tách khỏi {@link ProcessDefinitionInfo} thay vì thêm field: record kia đang là chữ ký của
     * {@link #findLatest(String)} mà {@code StartupProcessDeploymentService} phụ thuộc, còn importer
     * cần thêm {@code name}/{@code resourceName} để dựng dòng catalog.
     *
     * {@code name} có thể null — BPMN không bắt buộc đặt tên process; người gọi phải tự fallback.
     */
    public record DeployedProcessDefinition(String bpmnProcessId, String name, String resourceName,
            int version, long processDefinitionKey) {
    }

    /**
     * @param items        các definition thực sự lấy về (đã bị cắt theo {@code limit})
     * @param totalOnEngine tổng số trên engine — lớn hơn {@code items.size()} nghĩa là lượt quét bị cắt
     */
    public record DeployedProcessPage(List<DeployedProcessDefinition> items, long totalOnEngine) {
    }
}

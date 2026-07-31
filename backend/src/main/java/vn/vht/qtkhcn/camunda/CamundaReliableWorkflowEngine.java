package vn.vht.qtkhcn.camunda;

import io.camunda.client.CamundaClient;
import io.camunda.client.api.search.response.ProcessDefinition;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.vht.qtkhcn.workflow.ReliableWorkflowEngine;

@Component
public class CamundaReliableWorkflowEngine implements ReliableWorkflowEngine {
    static final String REQUEST_VARIABLE = "qtkhcnStartRequestId";
    private final CamundaClient client;

    public CamundaReliableWorkflowEngine(CamundaClient client) {
        this.client = client;
    }

    /**
     * {@code processCode} được hiểu THẲNG là `bpmnProcessId`, để quy trình do người dùng tự vẽ (id
     * bất kỳ, kể cả có dấu `_` thật) khởi động được mà không phải theo quy ước đặt tên nào.
     *
     * Fallback `replace('.','_')` giữ lại CHỈ vì dữ liệu cũ: `HoSo.quyTrinh` của các hồ sơ tạo trước
     * 2026-07-28 lưu dạng `"RD01.01"` trong khi BPMN id là `RD01_01`. Bỏ fallback này sẽ làm mọi hồ
     * sơ cũ không gửi duyệt lại được. Chỉ chạy lượt tra thứ hai khi chuỗi thực sự khác nhau.
     */
    @Override
    public StartedProcess start(String processCode, String businessKey, UUID requestId,
            Map<String, Object> variables) {
        var definitions = findLatestByProcessId(processCode);
        if (definitions.size() != 1) {
            String legacyProcessId = processCode.replace('.', '_');
            if (!legacyProcessId.equals(processCode)) {
                definitions = findLatestByProcessId(legacyProcessId);
            }
        }
        if (definitions.size() != 1) {
            throw new ProcessNotActiveException("Khong co dung mot process active cho " + processCode);
        }
        var definition = definitions.getFirst();
        Map<String, Object> safeVariables = new HashMap<>(variables);
        safeVariables.put(REQUEST_VARIABLE, requestId.toString());
        var result = client.newCreateInstanceCommand()
                .processDefinitionKey(definition.getProcessDefinitionKey())
                .businessId(businessKey)
                .variables(safeVariables).send().join();
        return new StartedProcess(String.valueOf(result.getProcessInstanceKey()),
                result.getBpmnProcessId(), result.getVersion());
    }

    @Override
    public Optional<StartedProcess> findByRequestId(UUID requestId) {
        String jsonValue = "\"" + requestId + "\"";
        var variables = client.newVariableSearchRequest()
                .filter(f -> f.name(REQUEST_VARIABLE).value(jsonValue))
                .page(p -> p.limit(2)).send().join().items();
        if (variables.isEmpty()) return Optional.empty();
        long instanceKey = variables.getFirst().getProcessInstanceKey();
        var instances = client.newProcessInstanceSearchRequest()
                .filter(f -> f.processInstanceKey(instanceKey)).page(p -> p.limit(1)).send().join().items();
        if (instances.isEmpty()) return Optional.empty();
        var instance = instances.getFirst();
        return Optional.of(new StartedProcess(String.valueOf(instance.getProcessInstanceKey()),
                instance.getProcessDefinitionId(), instance.getProcessDefinitionVersion()));
    }

    private List<ProcessDefinition> findLatestByProcessId(String bpmnProcessId) {
        return client.newProcessDefinitionSearchRequest()
                .filter(f -> f.processDefinitionId(bpmnProcessId).isLatestVersion(true))
                .page(p -> p.limit(2)).send().join().items();
    }

    public static class ProcessNotActiveException extends RuntimeException {
        public ProcessNotActiveException(String message) { super(message); }
    }
}

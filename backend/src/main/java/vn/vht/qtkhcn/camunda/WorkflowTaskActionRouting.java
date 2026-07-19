package vn.vht.qtkhcn.camunda;

import java.util.Map;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import vn.vht.qtkhcn.service.TaskActionException;

/** Control-variable contract consumed by gateways immediately following RD01.01 user tasks. */
@Component
public class WorkflowTaskActionRouting {
    private static final Set<String> ACTIONS = Set.of("APPROVE_STEP", "RETURN_STEP", "REJECT_STEP");

    public boolean supports(String processDefinitionId, String taskDefinitionKey, String actionCode) {
        if (!ACTIONS.contains(actionCode)) return false;
        if (!"RETURN_STEP".equals(actionCode)) return true;
        if (!"RD01_01".equals(processDefinitionId)) return false;
        return Set.of("Task_5", "Task_6", "Task_9", "Task_11_HD", "Task_11_TGD")
                .contains(taskDefinitionKey);
    }

    public Map<String, Object> variables(String processDefinitionId, String taskDefinitionKey,
            String actionCode, String requestId, String actorId) {
        if (!supports(processDefinitionId, taskDefinitionKey, actionCode)) {
            throw new TaskActionException("ACTION_NOT_SUPPORTED", HttpStatus.UNPROCESSABLE_ENTITY,
                    "Action " + actionCode + " không được BPMN hỗ trợ tại " + taskDefinitionKey + ".");
        }
        Map<String, Object> routing = routingVariables(taskDefinitionKey, actionCode);
        Map<String, Object> result = new java.util.LinkedHashMap<>(routing);
        result.put("qtkhcnActionRequestId", requestId);
        result.put("qtkhcnActionCode", actionCode);
        result.put("qtkhcnActorId", actorId);
        return Map.copyOf(result);
    }

    private static Map<String, Object> routingVariables(String elementId, String actionCode) {
        if ("APPROVE_STEP".equals(actionCode)) {
            return switch (elementId) {
                case "Task_5" -> Map.of("ketQuaXetDuyet", "dong_y");
                case "Task_6" -> Map.of("ketQuaThamDinh", "dong_y_bo_sung");
                case "Task_9" -> Map.of("ketQuaKyDuyet", "dong_y");
                case "Task_11_HD" -> Map.of("ketQuaHDKHCN", "dong_y");
                case "Task_11_TGD" -> Map.of("ketQuaPheDuyet", "dong_y");
                default -> Map.of();
            };
        }
        if ("RETURN_STEP".equals(actionCode)) {
            return switch (elementId) {
                case "Task_5", "Task_9", "Task_11_HD" -> Map.of();
                case "Task_6" -> Map.of("ketQuaThamDinh", "hieu_chinh");
                case "Task_11_TGD" -> Map.of("ketQuaPheDuyet", "hieu_chinh");
                default -> Map.of(); // supports() already rejects this branch.
            };
        }
        return Map.of();
    }
}

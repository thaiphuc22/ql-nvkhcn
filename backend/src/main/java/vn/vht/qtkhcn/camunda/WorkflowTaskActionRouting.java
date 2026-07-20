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

    private static final Set<String> RD01_01_RETURNABLE =
            Set.of("Task_5", "Task_6", "Task_9", "Task_11_HD", "Task_11_TGD");
    /** RD02.02: mọi bước có gateway "hiệu chỉnh" phía sau đều trả lại được (Task_QDTL thì không). */
    private static final Set<String> RD02_02_RETURNABLE =
            Set.of("Task_2", "Task_3", "Task_4", "Task_7");

    public boolean supports(String processDefinitionId, String taskDefinitionKey, String actionCode) {
        if (!ACTIONS.contains(actionCode)) return false;
        if (!"RETURN_STEP".equals(actionCode)) return true;
        return switch (processDefinitionId) {
            case "RD01_01" -> RD01_01_RETURNABLE.contains(taskDefinitionKey);
            case "RD02_02" -> RD02_02_RETURNABLE.contains(taskDefinitionKey);
            default -> false;
        };
    }

    public Map<String, Object> variables(String processDefinitionId, String taskDefinitionKey,
            String actionCode, String requestId, String actorId) {
        if (!supports(processDefinitionId, taskDefinitionKey, actionCode)) {
            throw new TaskActionException("ACTION_NOT_SUPPORTED", HttpStatus.UNPROCESSABLE_ENTITY,
                    "Action " + actionCode + " không được BPMN hỗ trợ tại " + taskDefinitionKey + ".");
        }
        Map<String, Object> routing = routingVariables(processDefinitionId, taskDefinitionKey, actionCode);
        Map<String, Object> result = new java.util.LinkedHashMap<>(routing);
        result.put("qtkhcnActionRequestId", requestId);
        result.put("qtkhcnActionCode", actionCode);
        result.put("qtkhcnActorId", actorId);
        return Map.copyOf(result);
    }

    private static Map<String, Object> routingVariables(String processDefinitionId, String elementId,
            String actionCode) {
        // Element id trùng tên giữa các quy trình (cả RD01_01 lẫn RD02_02 đều có "Task_6") nên PHẢI
        // phân nhánh theo processDefinitionId trước — nếu không, action ở RD02.02 sẽ set biến điều
        // khiển của RD01.01 và gateway rẽ sai nhánh mà không báo lỗi.
        return switch (processDefinitionId) {
            case "RD01_01" -> rd0101(elementId, actionCode);
            case "RD02_02" -> rd0202(elementId, actionCode);
            default -> Map.of();
        };
    }

    private static Map<String, Object> rd0101(String elementId, String actionCode) {
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

    /**
     * RD02.02. Task_1/Task_QDTL/Task_6 không có gateway phía sau nên không cần biến điều khiển.
     * Lưu ý Gateway_3 và Gateway_7 có nhánh MẶC ĐỊNH là "không đạt"/"không đồng ý" — nên RETURN_STEP
     * ở Task_3/Task_7 bắt buộc set biến "hieu_chinh" tường minh, nếu để rỗng thì rơi vào nhánh từ
     * chối và hồ sơ bị đóng thay vì trả lại.
     */
    private static Map<String, Object> rd0202(String elementId, String actionCode) {
        if ("APPROVE_STEP".equals(actionCode)) {
            return switch (elementId) {
                case "Task_2" -> Map.of("ketQuaKyDuyet", "dong_y");
                case "Task_3" -> Map.of("ketQuaThamDinh", "dong_y");
                case "Task_4" -> Map.of("ketQuaHDKHCN", "dong_y");
                case "Task_7" -> Map.of("ketQuaPheDuyet", "dong_y");
                default -> Map.of();
            };
        }
        if ("RETURN_STEP".equals(actionCode)) {
            return switch (elementId) {
                case "Task_2", "Task_4" -> Map.of(); // gateway default đã là "hiệu chỉnh"
                case "Task_3" -> Map.of("ketQuaThamDinh", "hieu_chinh");
                case "Task_7" -> Map.of("ketQuaPheDuyet", "hieu_chinh");
                default -> Map.of(); // supports() already rejects this branch.
            };
        }
        return Map.of();
    }
}

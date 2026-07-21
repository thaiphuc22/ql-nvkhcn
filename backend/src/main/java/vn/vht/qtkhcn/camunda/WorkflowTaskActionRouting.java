package vn.vht.qtkhcn.camunda;

import java.util.Map;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import vn.vht.qtkhcn.service.TaskActionException;

/** Control-variable contract consumed by gateways immediately following RD01.01/RD02.02 user tasks. */
@Component
public class WorkflowTaskActionRouting {
    private static final Set<String> ACTIONS = Set.of("APPROVE_STEP", "RETURN_STEP", "REJECT_STEP");

    private static final Set<String> RD01_01_RETURNABLE =
            Set.of("Task_5", "Task_6", "Task_9", "Task_11_HD", "Task_11_TGD");
    /**
     * RD02.02 v3 ({@code processes/rd0202.bpmn}, 33 user task {@code T01}…{@code T33}, một số bước
     * còn tách 4 lane song song như {@code T03_CQ_KHCN}) không có bất kỳ exclusiveGateway nào đọc biến
     * do user action set — hai gateway điều kiện duy nhất của quy trình, {@code GCheck} (biến
     * {@code dieuKienMacDinhDat}) và {@code G24} (biến {@code ketQuaDanhGiaT24Result}), đều do
     * service/DMN task tính, không do RETURN_STEP. Nếu "bật" RETURN_STEP cho một task ở đây mà chưa có
     * gateway rẽ theo nó, task vẫn hoàn tất qua đúng 1 outgoing flow — tức RETURN_STEP sẽ có tác dụng
     * y hệt APPROVE_STEP (âm thầm tiến tới, không hề "trả lại"). Vì vậy fail-closed rỗng ở đây cho tới
     * khi BPMN thực sự có gateway hiệu chỉnh cho một bước cụ thể.
     */
    private static final Set<String> RD02_02_RETURNABLE = Set.of();

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
     * RD02.02 v3 ({@code T01}…{@code T33}, xem {@link #RD02_02_RETURNABLE}). Không có task nào trong
     * quy trình hiện tại đứng trước một exclusiveGateway đọc biến do user action set — mọi task chỉ có
     * đúng 1 outgoing flow (hoặc là parallelGateway fork/join, không cần điều kiện) nên APPROVE_STEP
     * không cần set gì để "trúng nhánh đúng". RETURN_STEP chưa bao giờ supports() == true (xem
     * {@link #RD02_02_RETURNABLE}) nên nhánh dưới đây không thể được gọi tới trong thực tế; giữ lại chỉ
     * để đối xứng với {@link #rd0101} và không throw bất ngờ nếu supports() đổi trong tương lai mà quên
     * cập nhật chỗ này.
     */
    private static Map<String, Object> rd0202(String elementId, String actionCode) {
        return Map.of();
    }
}

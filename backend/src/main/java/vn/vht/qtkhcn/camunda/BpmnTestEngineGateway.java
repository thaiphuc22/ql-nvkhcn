package vn.vht.qtkhcn.camunda;

import java.util.List;
import java.util.Map;
import vn.vht.qtkhcn.web.dto.BpmnTestSessionResponse;

public interface BpmnTestEngineGateway {
    StartedInstance deployAndStart(byte[] bpmn, String resourceName, Map<String, Object> variables);
    EngineSnapshot snapshot(long processInstanceKey);
    void completeTask(long processInstanceKey, long taskKey, Map<String, Object> variables);
    void cancel(long processInstanceKey);
    /** Ghi đè/thêm biến ở scope của {@code elementInstanceKey} (bản đầu tiên dùng processInstanceKey — xem D/lát 2). */
    void setVariables(long elementInstanceKey, Map<String, Object> variables);
    /** Đánh dấu một incident (vd. CONDITION_ERROR ở gateway) đã được xử lý; engine đánh giá lại và đi tiếp. */
    void resolveIncident(long incidentKey);
    /**
     * Tạm thời hoàn tất (bypass) một Service Task job đang BLOCKED trên test engine — dùng khi chưa có
     * worker production thật cho type đó, thay vì để session kẹt vô thời hạn. CHỈ áp dụng trên test
     * engine cô lập (không bao giờ dùng cho production).
     */
    void bypassServiceTask(long processInstanceKey, long jobKey, Map<String, Object> variables);

    record StartedInstance(long processDefinitionKey, long processInstanceKey) {}
    record EngineSnapshot(String processState,
            List<BpmnTestSessionResponse.Element> elements,
            List<BpmnTestSessionResponse.Task> tasks,
            Map<String, Object> variables,
            List<BpmnTestSessionResponse.Incident> incidents,
            List<BpmnTestSessionResponse.BlockedJob> blockedJobs) {}
}

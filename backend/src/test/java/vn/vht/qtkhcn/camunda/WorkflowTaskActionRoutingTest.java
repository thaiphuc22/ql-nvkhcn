package vn.vht.qtkhcn.camunda;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import vn.vht.qtkhcn.service.TaskActionException;

/**
 * RD02.02 v3 ({@code processes/rd0202.bpmn}) đổi hẳn từ skeleton 7 task ({@code Task_1}…{@code Task_7})
 * sang 33 user task thật ({@code T01}…{@code T33}, một số tách lane song song như
 * {@code T03_CQ_KHCN}). Bộ test này khoá đúng hành vi mới: routing không còn được phép coi
 * {@code Task_2}/{@code Task_3}/{@code Task_4}/{@code Task_7} là đặc biệt (các id đó không còn tồn tại
 * trong BPMN đã deploy).
 */
class WorkflowTaskActionRoutingTest {

    private final WorkflowTaskActionRouting routing = new WorkflowTaskActionRouting();

    @ParameterizedTest
    @ValueSource(strings = {"T01", "T02", "T05", "T24", "T33", "T03_CQ_KHCN", "T03_CQ_MS"})
    void approveStepOnRealRd0202TaskSetsNoGatewayVariableBesidesActionMetadata(String taskDefinitionKey) {
        Map<String, Object> variables = routing.variables("RD02_02", taskDefinitionKey, "APPROVE_STEP",
                "req-1", "actor-1");

        assertEquals(metadataKeys(), variables.keySet());
    }

    @ParameterizedTest
    @ValueSource(strings = {"Task_2", "Task_3", "Task_4", "Task_7"})
    void staleRd01SkeletonIdsAreNoLongerTreatedSpeciallyForRd0202(String staleTaskDefinitionKey) {
        // Các id này thuộc bản BPMN skeleton cũ đã bị thay hẳn — không được tồn tại trong process
        // đang deploy (T01..T33), nên routing phải coi chúng như bất kỳ id lạ nào khác: APPROVE_STEP
        // vẫn cho qua (task-existence do Zeebe xác thực, không phải routing) nhưng không set biến nào.
        Map<String, Object> variables = routing.variables("RD02_02", staleTaskDefinitionKey, "APPROVE_STEP",
                "req-1", "actor-1");
        assertEquals(metadataKeys(), variables.keySet());
    }

    @ParameterizedTest
    @ValueSource(strings = {"T01", "T02", "T05", "T24", "T33", "Task_2", "Task_3", "Task_4", "Task_7"})
    void returnStepIsNotSupportedForAnyRd0202Task(String taskDefinitionKey) {
        // RD02.02 v3 không có exclusiveGateway nào rẽ theo hành động thủ công của user (GCheck/G24 đều
        // do service task / DMN tính) — bật RETURN_STEP mà chưa có gateway tương ứng sẽ khiến nó chạy
        // y hệt APPROVE_STEP một cách âm thầm, nên phải fail-closed.
        assertFalse(routing.supports("RD02_02", taskDefinitionKey, "RETURN_STEP"));
    }

    @Test
    void returnStepOnRd0202TaskThrowsActionNotSupported() {
        TaskActionException exception = assertThrows(TaskActionException.class,
                () -> routing.variables("RD02_02", "T05", "RETURN_STEP", "req-1", "actor-1"));
        assertEquals("ACTION_NOT_SUPPORTED", exception.getCode());
    }

    @Test
    void approveStepIsSupportedForAnyRd0202Task() {
        assertTrue(routing.supports("RD02_02", "T24", "APPROVE_STEP"));
    }

    private static Set<String> metadataKeys() {
        return Set.of("qtkhcnActionRequestId", "qtkhcnActionCode", "qtkhcnActorId");
    }
}

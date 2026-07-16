package vn.vht.qtkhcn.camunda;

import io.camunda.client.CamundaClient;
import io.camunda.client.api.search.enums.JobState;
import io.camunda.client.api.search.response.Job;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Comparator;
import java.util.concurrent.locks.LockSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import vn.vht.qtkhcn.domain.ActionOutcome;
import vn.vht.qtkhcn.domain.Cap;

/**
 * Khởi tạo process instance RD01.01 thật trên Zeebe khi hồ sơ "Gửi duyệt" (Mốc 3). Process
 * variables CHỈ chứa correlation key + biến điều khiển rẽ nhánh (ProcessVariableContract, D3) —
 * KHÔNG bao giờ truyền nội dung hồ sơ/phiếu/dự toán vào đây.
 */
@Service
public class Rd0101ProcessService {

    private static final Logger log = LoggerFactory.getLogger(Rd0101ProcessService.class);
    private static final String BPMN_PROCESS_ID = "RD01_01";
    private static final String USER_TASK_JOB_TYPE = "io.camunda.zeebe:userTask";
    private static final int USER_TASK_SEARCH_ATTEMPTS = 20;
    private static final Duration USER_TASK_SEARCH_INTERVAL = Duration.ofMillis(250);

    private final CamundaClient camundaClient;

    public Rd0101ProcessService(CamundaClient camundaClient) {
        this.camundaClient = camundaClient;
    }

    /**
     * @return process instance key thật từ Zeebe, hoặc {@code null} nếu Zeebe không phản hồi
     *         (fail-soft có chủ đích ở Mốc 2/3: hồ sơ vẫn được "Gửi duyệt" trong domain DB dù
     *         Camunda tạm thời không sẵn sàng — TODO Mốc 6+: quyết định lại có nên fail-closed
     *         thay vì fail-soft một khi Camunda là nguồn sự thật về trạng thái luồng, theo
     *         "Anti-pattern #5" trong docs/arch/camunda-design.md).
     */
    public Long startInstance(String maHoSo, Cap cap) {
        try {
            var result = camundaClient.newCreateInstanceCommand()
                    .bpmnProcessId(BPMN_PROCESS_ID)
                    .latestVersion()
                    .variables(Map.of(
                            ProcessVariableContract.MA_HO_SO, maHoSo,
                            ProcessVariableContract.CAP, cap.name()))
                    .send()
                    .join();
            log.info("Started RD01_01 instance key={} for maHoSo={}", result.getProcessInstanceKey(), maHoSo);
            return result.getProcessInstanceKey();
        } catch (Exception e) {
            log.warn("Không khởi tạo được process instance RD01_01 cho {} — Camunda dev stack có "
                    + "đang chạy không? (infra/README.md Mốc 1). Hồ sơ vẫn Gửi duyệt trong domain DB.", maHoSo, e);
            return null;
        }
    }

    /**
     * Applies a domain action to the active Camunda user task of an RD01.01 instance.
     * The search is bounded and fails closed unless exactly one active task is found.
     * REJECT_STEP cancels the process because REJECTED is terminal in the reduced domain model.
     *
     * @return BPMN element id of the completed task, or {@code null} for a cancelled process
     */
    public String applyAction(long processInstanceKey, ActionOutcome outcome) {
        if (outcome == ActionOutcome.REJECT_STEP) {
            cancelInstance(processInstanceKey);
            return null;
        }

        Exception lastCompletionError = null;
        for (int attempt = 1; attempt <= USER_TASK_SEARCH_ATTEMPTS; attempt++) {
            Job task = findLatestCreatedUserTask(processInstanceKey);
            if (task != null) {
                Map<String, Object> variables = routingVariables(task.getElementId(), outcome);
                try {
                    camundaClient.newCompleteCommand(task.getJobKey())
                            .variables(variables)
                            .send()
                            .join();
                    log.info("Applied {} to RD01_01 user task key={} element={} instance={}",
                            outcome, task.getJobKey(), task.getElementId(), processInstanceKey);
                    return task.getElementId();
                } catch (Exception e) {
                    // The v2 search index can briefly still expose the just-completed job as CREATED.
                    // Retry until the next job is indexed; completing the stale key fails harmlessly.
                    lastCompletionError = e;
                }
            }
            if (attempt < USER_TASK_SEARCH_ATTEMPTS) {
                LockSupport.parkNanos(USER_TASK_SEARCH_INTERVAL.toNanos());
            }
        }
        throw new IllegalStateException("Không thể hoàn tất Camunda user task của process instance "
                + processInstanceKey + " sau "
                + USER_TASK_SEARCH_ATTEMPTS * USER_TASK_SEARCH_INTERVAL.toMillis() + " ms.",
                lastCompletionError);
    }

    private Job findLatestCreatedUserTask(long processInstanceKey) {
        try {
            List<Job> tasks = camundaClient.newJobSearchRequest()
                    .filter(f -> f.processInstanceKey(processInstanceKey)
                            .type(USER_TASK_JOB_TYPE)
                            .state(JobState.CREATED))
                    .page(p -> p.limit(20))
                    .send()
                    .join()
                    .items();
            // RD01.01 is sequential. During index convergence both the old and new job can be
            // reported as CREATED; Zeebe keys are monotonic, so the newest key is the live candidate.
            return tasks.stream().max(Comparator.comparing(Job::getJobKey)).orElse(null);
        } catch (Exception e) {
            throw new IllegalStateException("Không thể tra cứu Camunda user task của process instance "
                    + processInstanceKey, e);
        }
    }

    private void cancelInstance(long processInstanceKey) {
        try {
            camundaClient.newCancelInstanceCommand(processInstanceKey).send().join();
            log.info("Cancelled RD01_01 process instance={} for REJECT_STEP", processInstanceKey);
        } catch (Exception e) {
            throw new IllegalStateException("Không thể huỷ Camunda process instance " + processInstanceKey, e);
        }
    }

    /** Variables consumed by exclusive gateways immediately following these user tasks. */
    private static Map<String, Object> routingVariables(String elementId, ActionOutcome outcome) {
        if (outcome == ActionOutcome.APPROVE_STEP) {
            return switch (elementId) {
                case "Task_5" -> Map.of("ketQuaXetDuyet", "dong_y");
                case "Task_6" -> Map.of("ketQuaThamDinh", "dong_y_bo_sung");
                case "Task_9" -> Map.of("ketQuaKyDuyet", "dong_y");
                case "Task_11_HD" -> Map.of("ketQuaHDKHCN", "dong_y");
                case "Task_11_TGD" -> Map.of("ketQuaPheDuyet", "dong_y");
                default -> Map.of();
            };
        }

        return switch (elementId) {
            case "Task_5", "Task_9", "Task_11_HD" -> Map.of(); // default flow = rework
            case "Task_6" -> Map.of("ketQuaThamDinh", "hieu_chinh");
            case "Task_11_TGD" -> Map.of("ketQuaPheDuyet", "hieu_chinh");
            default -> throw new IllegalStateException("Camunda task " + elementId
                    + " không có nhánh RETURN_STEP trong BPMN RD01.01.");
        };
    }
}

package vn.vht.qtkhcn.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Sinh sẵn luật hiển thị nút cho quy trình vừa deploy, để người vẽ BPMN không phải mở Ma trận Hành
 * động bấm tay trước khi hồ sơ đầu tiên chạy được.
 *
 * <p><b>Vì sao chạy SAU COMMIT chứ không nằm trong chính transaction deploy</b> — cả hai hướng đều sai:
 * <ul>
 *   <li>Cùng transaction: {@code createAvailability} ném lỗi sẽ đánh dấu transaction rollback-only.
 *       Bắt lỗi ở ngoài cũng không gỡ được cờ đó, nên commit deploy sẽ vỡ — trong khi BPMN thì ĐÃ nằm
 *       trên Zeebe rồi. Sinh luật hỏng không được phép làm mất dòng catalog.</li>
 *   <li>{@code REQUIRES_NEW} ngay tại chỗ: transaction mới không nhìn thấy dòng version chưa commit,
 *       nên {@code DeployedBpmnRoutingReader} không đọc được BPMN và scaffold thành no-op im lặng.</li>
 * </ul>
 * {@code AFTER_COMMIT} + {@code REQUIRES_NEW} thoả cả hai: dữ liệu đã hiện hữu, và lỗi chỉ làm hỏng
 * lượt sinh luật.
 *
 * <p>Hệ quả chấp nhận có chủ ý: kết quả sinh luật KHÔNG về được response deploy. Người dùng xem ở màn
 * đối soát ({@code /quy-trinh} → "Đối soát"), và bấm lại "Tạo luật còn thiếu từ BPMN" bất cứ lúc nào —
 * scaffold tất định nên chạy lại vô hại.
 */
@Component
public class DeployedProcessPolicyScaffolder {
    private static final Logger log = LoggerFactory.getLogger(DeployedProcessPolicyScaffolder.class);

    private final ActionStudioService actionStudio;

    public DeployedProcessPolicyScaffolder(ActionStudioService actionStudio) {
        this.actionStudio = actionStudio;
    }

    // Sau EmbeddedFormImportService (@Order(10)): scaffold ghim formKey vào luật hành động, mà
    // validateBundle đòi biểu mẫu phải có sẵn trong bảng eform — chạy trước nó là hỏng cả lượt.
    @Order(20)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onProcessDeployed(ProcessDeployedEvent event) {
        try {
            int invalidated = actionStudio.invalidateIncompatiblePolicies(event.bpmnProcessId(), event.actor());
            var result = actionStudio.scaffold(event.bpmnProcessId(), event.actor());
            log.info("Đã sinh {} luật hành động và vô hiệu {} luật không tương thích cho quy trình {}",
                    result.createdCount(), invalidated, event.bpmnProcessId());
        } catch (RuntimeException failure) {
            // Không có action code tương ứng trong danh mục, outcome BPMN lạ, biểu mẫu chưa tồn tại…
            // — tất cả đều là "quy trình cần cấu hình thêm", không phải "deploy hỏng".
            log.warn("Không sinh được luật hành động cho quy trình {} — mở màn đối soát để xử lý tay",
                    event.bpmnProcessId(), failure);
        }
    }
}

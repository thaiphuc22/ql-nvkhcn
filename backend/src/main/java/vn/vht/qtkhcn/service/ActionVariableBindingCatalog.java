package vn.vht.qtkhcn.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import vn.vht.qtkhcn.domain.ActionVariableBinding;
import vn.vht.qtkhcn.repository.ActionVariableBindingRepository;

/**
 * Tra quy tắc <b>trường biểu mẫu đến biến Camunda</b> lúc bấm nút, thay cho hàm cứng
 * {@code WorkflowTaskActionService.withDiemSoForT24()}.
 *
 * <p><b>Chỉ giá trị vô hướng mới được đi.</b> Chuỗi dài, danh sách, object đều bị bỏ — chúng là dữ
 * liệu nghiệp vụ, thuộc CSDL của app chứ không thuộc Camunda (D3). Binding chỉ mở đúng khe cho con
 * số hoặc cờ mà business rule task ở chặng ngay sau cần.
 */
@Component
public class ActionVariableBindingCatalog {
    private static final Logger log = LoggerFactory.getLogger(ActionVariableBindingCatalog.class);
    /** Chuỗi dài hơn ngưỡng này là văn bản nghiệp vụ, không phải biến điều khiển. */
    private static final int MAX_STRING_LENGTH = 200;

    private final ActionVariableBindingRepository repository;
    private final Map<String, Map<String, String>> cache = new ConcurrentHashMap<>();
    private volatile boolean loaded;

    public ActionVariableBindingCatalog(ActionVariableBindingRepository repository) {
        this.repository = repository;
    }

    /** Không có binding nào — cho unit test không dựng CSDL. */
    public ActionVariableBindingCatalog() {
        this(null);
    }

    /**
     * Chèn các trường biểu mẫu đã khai vào tập biến gửi Zeebe.
     *
     * @return map mới nếu có trường được chèn, ngược lại trả về chính {@code variables} — giữ đúng
     *         nếp cũ là không tạo rác khi không có gì thay đổi.
     */
    public Map<String, Object> apply(String processDefinitionId, String taskDefinitionKey, String actionCode,
            Map<String, Object> variables, Map<String, Object> formData) {
        if (formData == null || formData.isEmpty()) return variables;
        Map<String, String> bindings = bindings(processDefinitionId, taskDefinitionKey, actionCode);
        if (bindings.isEmpty()) return variables;
        Map<String, Object> merged = null;
        for (Map.Entry<String, String> binding : bindings.entrySet()) {
            Object value = formData.get(binding.getKey());
            if (!isTransportable(value)) continue;
            if (merged == null) merged = new LinkedHashMap<>(variables);
            merged.put(binding.getValue(), value);
        }
        return merged == null ? variables : merged;
    }

    /** @return map {@code formField -> variableName} đã khai cho đúng bước và nút này. */
    public Map<String, String> bindings(String processDefinitionId, String taskDefinitionKey, String actionCode) {
        if (repository == null) return Map.of();
        load();
        return cache.getOrDefault(key(processDefinitionId, taskDefinitionKey, actionCode), Map.of());
    }

    /** Toàn bộ binding của một quy trình, để màn Đối soát hiển thị. */
    public List<ActionVariableBinding> forProcess(String processCode) {
        if (repository == null) return List.of();
        try {
            return repository.findByProcessCodeOrderByTaskDefinitionKeyAscFormFieldAsc(normalizeProcess(processCode));
        } catch (RuntimeException failure) {
            log.warn("Không đọc được bảng binding biến cho quy trình {}", processCode, failure);
            return List.of();
        }
    }

    /** Xoá cache sau khi ghi. Lượt tra kế tiếp nạp lại từ CSDL. */
    public void invalidate() {
        loaded = false;
        cache.clear();
    }

    private static boolean isTransportable(Object value) {
        if (value instanceof Number || value instanceof Boolean) return true;
        return value instanceof String text && text.length() <= MAX_STRING_LENGTH;
    }

    /** {@code RD02.02} và {@code RD02_02} là cùng một quy trình, hai nơi trong app ghi hai kiểu. */
    static String normalizeProcess(String processCode) {
        return processCode == null ? "" : processCode.trim().toUpperCase(Locale.ROOT).replace('.', '_');
    }

    private static String key(String processCode, String taskDefinitionKey, String actionCode) {
        return normalizeProcess(processCode) + " " + taskDefinitionKey + " " + actionCode;
    }

    private void load() {
        if (loaded) return;
        synchronized (this) {
            if (loaded) return;
            try {
                List<ActionVariableBinding> all = repository.findAll();
                cache.clear();
                for (ActionVariableBinding item : all) {
                    cache.computeIfAbsent(
                            key(item.getProcessCode(), item.getTaskDefinitionKey(), item.getActionCode()),
                            unused -> new LinkedHashMap<>())
                            .put(item.getFormField(), item.getVariableName());
                }
                loaded = true;
            } catch (RuntimeException failure) {
                // Không ném: đường gọi này nằm trên thao tác bấm nút. Mất binding thì nhánh vẫn đi
                // đúng (biến điều khiển lấy từ bản vẽ), chỉ thiếu dữ liệu phụ cho business rule task.
                log.warn("Không đọc được bảng binding biến, tạm coi như chưa khai dòng nào", failure);
            }
        }
    }
}

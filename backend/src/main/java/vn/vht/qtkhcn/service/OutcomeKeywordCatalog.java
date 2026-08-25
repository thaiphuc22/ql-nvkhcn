package vn.vht.qtkhcn.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import vn.vht.qtkhcn.domain.ActionOutcomeKeyword;
import vn.vht.qtkhcn.repository.ActionOutcomeKeywordRepository;

/**
 * Từ điển <b>từ khoá outcome trong BPMN → mã nút</b>, đọc từ CSDL thay cho bảng {@code switch} cứng
 * của {@link BpmnOutcomeCodes}.
 *
 * <p><b>Từ điển này chỉ dùng để NHẬN DIỆN, không dùng để gửi.</b> Nó trả lời "nhánh này thuộc về nút
 * nào"; còn biến điều khiển gửi vào Zeebe vẫn lấy nguyên văn tên biến lẫn giá trị từ chính
 * {@code conditionExpression} của nhánh đó (xem {@link DeployedBpmnRoutingReader#actionVariables}).
 * Không bao giờ gửi cả danh sách từ khoá, cũng không lấy phần tử đầu danh sách làm giá trị.
 *
 * <p><b>Fail-safe:</b> tra hụt hoặc CSDL lỗi thì rơi về {@link BpmnOutcomeCodes#actionCode(String)}.
 * Đường gọi này nằm trên thao tác bấm nút của người dùng, không được phép sập vì lý do siêu dữ liệu
 * — cùng nguyên tắc "quy trình chưa deploy trả map rỗng thay vì ném".
 */
@Component
public class OutcomeKeywordCatalog {
    private static final Logger log = LoggerFactory.getLogger(OutcomeKeywordCatalog.class);
    /** Từ khoá hợp lệ: chữ thường không dấu, số và gạch dưới — đúng dạng người vẽ ghi trong FEEL. */
    private static final Pattern VALID_KEYWORD = Pattern.compile("^[a-z][a-z0-9_]*$");

    private final ActionOutcomeKeywordRepository repository;
    private volatile Map<String, String> cache;

    public OutcomeKeywordCatalog(ActionOutcomeKeywordRepository repository) {
        this.repository = repository;
    }

    /** Chỉ dùng bảng cứng — cho unit test không cần CSDL. */
    public OutcomeKeywordCatalog() {
        this(null);
    }

    /**
     * @return mã nút tương ứng, hoặc {@code null} nếu từ khoá chưa nút nào nhận. Khi đó
     *         {@code reconcile} sẽ báo dòng {@code UNMAPPED_BRANCH} kèm đề xuất, còn
     *         {@code actionVariables} bỏ qua nhánh thay vì đoán bừa.
     */
    public String actionCode(String outcome) {
        String normalized = normalize(outcome);
        String fromCatalog = keywords().get(normalized);
        return fromCatalog != null ? fromCatalog : BpmnOutcomeCodes.actionCode(normalized);
    }

    /** Các từ khoá một nút đang nhận, đã sắp xếp — để đổ vào Danh mục nút. */
    public List<String> keywordsFor(String actionCode) {
        return keywords().entrySet().stream()
                .filter(entry -> entry.getValue().equals(actionCode))
                .map(Map.Entry::getKey).sorted().toList();
    }

    /** Nút đang giữ từ khoá này, hoặc {@code null} nếu chưa ai giữ. Dùng để chặn trùng khi thêm. */
    public String ownerOf(String keyword) {
        return keywords().get(normalize(keyword));
    }

    /** Xoá cache sau khi ghi. Lượt tra kế tiếp nạp lại từ CSDL. */
    public void invalidate() {
        cache = null;
    }

    public static String normalize(String outcome) {
        return outcome == null ? "" : outcome.trim().toLowerCase(Locale.ROOT);
    }

    public static boolean isValidKeyword(String keyword) {
        return VALID_KEYWORD.matcher(normalize(keyword)).matches();
    }

    private Map<String, String> keywords() {
        Map<String, String> current = cache;
        if (current != null) return current;
        if (repository == null) return Map.of();
        try {
            Map<String, String> loaded = new LinkedHashMap<>();
            for (ActionOutcomeKeyword item : repository.findAllByOrderByActionCodeAscKeywordAsc()) {
                loaded.put(normalize(item.getKeyword()), item.getActionCode());
            }
            current = Map.copyOf(loaded);
            cache = current;
            return current;
        } catch (RuntimeException failure) {
            // Không ném: mất từ điển thì vẫn còn bảng cứng, còn ném ở đây là chặn người dùng bấm nút.
            log.warn("Không đọc được từ điển outcome, tạm dùng bảng mặc định", failure);
            return Map.of();
        }
    }
}

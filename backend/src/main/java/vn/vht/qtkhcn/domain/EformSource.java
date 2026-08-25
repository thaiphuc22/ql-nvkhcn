package vn.vht.qtkhcn.domain;

/**
 * Chủ sở hữu của một biểu mẫu — quyết định app có được sửa nó không.
 *
 * <p>Để nguyên là hằng {@code String} chứ không dựng enum: cột {@code eform.source} đã có
 * {@code CHECK} ở tầng DB (V39), và {@code EformService} đang trả thẳng giá trị cột ra DTO. Thêm
 * enum ở đây chỉ đẻ ra một lớp chuyển đổi nữa mà không chặn thêm được trạng thái sai nào.
 */
public final class EformSource {

    /** BA vẽ trong Thư viện biểu mẫu của app. Sửa/xoá được. */
    public static final String APP = "APP";

    /** Hút từ BPMN khách deploy lên Camunda. Read-only với app, lượt đồng bộ sau ghi đè được. */
    public static final String CAMUNDA = "CAMUNDA";

    private EformSource() {
    }
}

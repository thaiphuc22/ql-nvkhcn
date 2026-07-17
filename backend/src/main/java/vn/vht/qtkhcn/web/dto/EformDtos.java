package vn.vht.qtkhcn.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.OffsetDateTime;

public final class EformDtos {
    private EformDtos() {
    }

    /** {@code schema} là JSON form-js tuỳ ý (Map/List/scalar sau khi Jackson đọc) — không có kiểu cố định,
     * tương tự {@code unknown} phía Angular; xem {@code EformService} về cách lưu dạng text trong DB. */
    public record EformResponse(String key, String ten, String moTa, String loai, Object schema,
            long version, String updatedBy, OffsetDateTime updatedAt, OffsetDateTime createdAt) {
    }

    public record CreateEformRequest(
            @NotBlank @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$",
                    message = "formKey chỉ gồm chữ thường/số, nối bằng dấu -") String key,
            @NotBlank String ten, String moTa, String loai, @NotNull Object schema) {
    }

    public record UpdateMetaRequest(@NotBlank String ten, String moTa, String loai) {
    }

    public record UpdateSchemaRequest(@NotNull Object schema) {
    }
}

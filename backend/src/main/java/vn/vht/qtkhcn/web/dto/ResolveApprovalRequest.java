package vn.vht.qtkhcn.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.Map;

public record ResolveApprovalRequest(@NotBlank String slot, LocalDate ngay,
        @NotNull Map<String, Object> context) {
}

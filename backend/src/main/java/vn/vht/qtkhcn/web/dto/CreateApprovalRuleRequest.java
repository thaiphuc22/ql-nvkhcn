package vn.vht.qtkhcn.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.Map;

public record CreateApprovalRuleRequest(
        String id,
        String domainCode,
        @NotBlank String ten,
        @NotBlank String slot,
        @NotNull Map<String, Object> conditions,
        @NotNull Map<String, Object> assignment,
        @PositiveOrZero int priority,
        boolean enabled,
        String changeNote) {
}

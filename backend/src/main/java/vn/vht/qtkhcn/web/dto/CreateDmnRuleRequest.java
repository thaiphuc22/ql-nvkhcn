package vn.vht.qtkhcn.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.Set;
import vn.vht.qtkhcn.domain.DmnRuleCategory;

public record CreateDmnRuleRequest(
        @NotBlank @Size(max = 128)
        @Pattern(regexp = "[A-Za-z0-9][A-Za-z0-9._-]*", message = "chỉ gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang")
        String code,
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Size(max = 1000) String description,
        @NotNull DmnRuleCategory category,
        @NotEmpty @Size(max = 50) Set<@Valid @NotBlank @Size(max = 255) String> appliedProcesses
) {
}


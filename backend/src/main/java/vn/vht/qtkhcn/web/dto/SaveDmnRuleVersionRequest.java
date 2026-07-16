package vn.vht.qtkhcn.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record SaveDmnRuleVersionRequest(
        @PositiveOrZero int expectedVersion,
        @NotBlank @Size(max = 5_242_880) String dmnXml,
        @NotBlank @Size(max = 500) String changeNote
) {
}


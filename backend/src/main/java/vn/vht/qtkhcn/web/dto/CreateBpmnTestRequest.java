package vn.vht.qtkhcn.web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.Map;
import java.util.UUID;

public record CreateBpmnTestRequest(
        @NotNull UUID draftId,
        @PositiveOrZero long revision,
        Map<String, Object> variables,
        @Positive Long ttlSeconds) {
}

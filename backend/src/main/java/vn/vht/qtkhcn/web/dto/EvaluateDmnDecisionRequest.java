package vn.vht.qtkhcn.web.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Map;

public record EvaluateDmnDecisionRequest(@NotNull Map<String, Object> variables) {}

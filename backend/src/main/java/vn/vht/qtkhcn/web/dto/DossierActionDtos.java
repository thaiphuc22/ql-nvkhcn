package vn.vht.qtkhcn.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public final class DossierActionDtos {
    private DossierActionDtos() {}
    public record AvailableActionsResponse(String dossierId, List<ActionStudioDtos.SimulatedActionResponse> actions) {}
    public record ExecuteActionRequest(@NotBlank String actionCode, @NotBlank String expectedPolicyId,
            @NotNull Long expectedPolicyVersion, @NotBlank String processCode, @NotBlank String processName) {}
    public record ExecuteActionResponse(String dossierId, String status) {}
}

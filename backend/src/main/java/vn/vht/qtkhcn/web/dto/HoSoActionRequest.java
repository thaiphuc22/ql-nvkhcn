package vn.vht.qtkhcn.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import vn.vht.qtkhcn.domain.ActionOutcome;

/** Xử lý bước hiện tại của hồ sơ (D10: APPROVE_STEP/RETURN_STEP/REJECT_STEP theo outcome). */
public record HoSoActionRequest(
        @NotNull ActionOutcome outcome,
        @NotBlank String actor,
        String yKien
) {
}

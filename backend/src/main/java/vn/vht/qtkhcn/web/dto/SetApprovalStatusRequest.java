package vn.vht.qtkhcn.web.dto;

import jakarta.validation.constraints.NotBlank;

public record SetApprovalStatusRequest(@NotBlank String status, Integer expectedVersion) {
}

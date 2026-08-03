package vn.vht.qtkhcn.hoso.web.dto;

import jakarta.validation.constraints.NotBlank;

public record SubmitHoSoRequest(@NotBlank String quyTrinh, @NotBlank String quyTrinhTen) {
}

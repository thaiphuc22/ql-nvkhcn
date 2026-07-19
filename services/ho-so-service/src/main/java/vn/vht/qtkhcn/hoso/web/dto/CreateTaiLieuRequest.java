package vn.vht.qtkhcn.hoso.web.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateTaiLieuRequest(@NotBlank String ten, @NotBlank String loai) {
}

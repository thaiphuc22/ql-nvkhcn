package vn.vht.qtkhcn.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class IntegrationSystemDtos {
    private IntegrationSystemDtos() {
    }

    public record IntegrationSystemResponse(
            String key, String ten, String moTa, String giaoThuc, String kieu, String syncMode,
            String trangThai, String lanDongBoCuoi, int banGhi24h, int loi24h, int doTreMs, int hangDoi,
            String endpoint, String apiKeyTail, String ref, long version) {
    }

    public record JobRunResponse(
            String id, String jobType, String he, String maHoSo, String thoiDiem, String ketQua,
            int retries, String thongDiep) {
    }

    public record ConnectSystemRequest(
            @NotBlank @Size(min = 8, message = "API key tối thiểu 8 ký tự.") String apiKey,
            @NotBlank String endpoint) {
    }
}

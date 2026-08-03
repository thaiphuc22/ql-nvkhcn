package vn.vht.qtkhcn.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public final class IntegrationMappingDtos {
    private IntegrationMappingDtos() {
    }

    public record ValueMappingDto(String qtkhcn, String heNgoai) {
    }

    /** Không kiểm tra ràng buộc @NotBlank ở đây — cho phép lưu bản nháp thiếu trường tạm
     * thời (validate đầy đủ chỉ chạy khi chuyển trạng thái sang Active, xem validateFields). */
    public record FieldMappingDto(
            String id, String truongQTKHCN, String kieuDuLieu, String truongHeNgoai, boolean batBuoc,
            Boolean khoaDinhDanh, String transform, String giaTriMacDinh, List<ValueMappingDto> valueMappings) {
    }

    public record IntegrationMappingResponse(
            String id, String he, String doiTuong, String chieu, String trangThai, long version,
            String capNhatLuc, String capNhatBoi, List<FieldMappingDto> fields, String jobType) {
    }

    public record CreateMappingRequest(
            @NotBlank String he, @NotBlank String doiTuong, @NotBlank String chieu) {
    }

    public record UpdateFieldsRequest(@NotNull List<FieldMappingDto> fields) {
    }

    public record UpdateStatusRequest(@NotBlank String status) {
    }

    /** Kết quả đổi trạng thái — luôn trả về mapping đã ghi (kể cả khi chuyển 'active' thất
     * bại thì mapping vẫn được ghi ở trạng thái 'error'), kèm danh sách lỗi validate nếu có. */
    public record StatusChangeResult(boolean ok, List<String> errors, IntegrationMappingResponse mapping) {
    }
}

package vn.vht.qtkhcn.web.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record CreateApprovalSlotRequest(@NotBlank String code, @NotBlank String ten, String moTa,
        List<String> nhomQuyTrinh, Integer thuTu) {
}

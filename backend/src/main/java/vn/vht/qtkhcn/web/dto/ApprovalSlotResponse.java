package vn.vht.qtkhcn.web.dto;

import java.time.OffsetDateTime;
import java.util.List;
import vn.vht.qtkhcn.domain.ApprovalSlot;

public record ApprovalSlotResponse(String code, String ten, String moTa, List<String> nhomQuyTrinh,
        String trangThai, int thuTu, long usageCount, OffsetDateTime updatedAt, String updatedBy) {
    public static ApprovalSlotResponse from(ApprovalSlot slot, long usageCount) {
        return new ApprovalSlotResponse(slot.getCode(), slot.getName(), slot.getDescription(),
                List.copyOf(slot.getProcessGroups()), slot.getStatus(), slot.getSortOrder(), usageCount,
                slot.getUpdatedAt(), slot.getUpdatedBy());
    }
}

package vn.vht.qtkhcn.web.dto;

import java.util.List;

public record UpdateApprovalSlotRequest(String ten, String moTa, List<String> nhomQuyTrinh,
        Integer thuTu) {
}

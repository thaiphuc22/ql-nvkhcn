package vn.vht.qtkhcn.service;

import jakarta.persistence.EntityNotFoundException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.domain.ApprovalSlot;
import vn.vht.qtkhcn.repository.ApprovalRuleRepository;
import vn.vht.qtkhcn.repository.ApprovalSlotRepository;
import vn.vht.qtkhcn.web.dto.ApprovalSlotResponse;
import vn.vht.qtkhcn.web.dto.CreateApprovalSlotRequest;
import vn.vht.qtkhcn.web.dto.UpdateApprovalSlotRequest;

@Service
public class ApprovalSlotService {
    private final ApprovalSlotRepository slots;
    private final ApprovalRuleRepository rules;

    public ApprovalSlotService(ApprovalSlotRepository slots, ApprovalRuleRepository rules) {
        this.slots = slots;
        this.rules = rules;
    }

    @Transactional(readOnly = true)
    public List<ApprovalSlotResponse> list() {
        return slots.findAllByOrderBySortOrderAscCodeAsc().stream().map(this::response).toList();
    }

    @Transactional
    public ApprovalSlotResponse create(CreateApprovalSlotRequest request, String actorHeader) {
        String code = normalizeCode(request.code());
        if (code.isBlank()) throw new IllegalArgumentException("Mã slot không được để trống.");
        if (slots.existsById(code)) {
            throw new ApprovalMatrixConflictException("Mã slot đã tồn tại: " + code);
        }
        ApprovalSlot slot = new ApprovalSlot();
        slot.setCode(code);
        slot.setName(request.ten().trim());
        slot.setDescription(trimToNull(request.moTa()));
        slot.setProcessGroups(normalizeGroups(request.nhomQuyTrinh()));
        slot.setStatus("active");
        slot.setSortOrder(request.thuTu() == null ? nextSortOrder() : nonNegative(request.thuTu(), "thuTu"));
        slot.setUpdatedBy(ProcessDefinitionService.normalizeActor(actorHeader));
        slot.setUpdatedAt(now());
        return response(slots.saveAndFlush(slot));
    }

    @Transactional
    public ApprovalSlotResponse update(String rawCode, UpdateApprovalSlotRequest request, String actorHeader) {
        ApprovalSlot slot = slot(rawCode);
        if (request.ten() != null) {
            if (request.ten().isBlank()) throw new IllegalArgumentException("Tên slot không được để trống.");
            slot.setName(request.ten().trim());
        }
        if (request.moTa() != null) slot.setDescription(trimToNull(request.moTa()));
        if (request.nhomQuyTrinh() != null) slot.setProcessGroups(normalizeGroups(request.nhomQuyTrinh()));
        if (request.thuTu() != null) slot.setSortOrder(nonNegative(request.thuTu(), "thuTu"));
        slot.setUpdatedBy(ProcessDefinitionService.normalizeActor(actorHeader));
        slot.setUpdatedAt(now());
        return response(slots.saveAndFlush(slot));
    }

    @Transactional
    public ApprovalSlotResponse setStatus(String rawCode, String status, boolean force, String actorHeader) {
        ApprovalSlot slot = slot(rawCode);
        String normalized = status == null ? "" : status.trim().toLowerCase(Locale.ROOT);
        if (!normalized.equals("active") && !normalized.equals("inactive")) {
            throw new IllegalArgumentException("Trạng thái slot chỉ chấp nhận active hoặc inactive.");
        }
        long usage = rules.countBySlotCode(slot.getCode());
        if (normalized.equals("inactive") && usage > 0 && !force) {
            throw new ApprovalMatrixConflictException("Slot " + slot.getCode() + " đang được " + usage
                    + " luật tham chiếu; truyền force=true sau khi người dùng xác nhận.");
        }
        slot.setStatus(normalized);
        slot.setUpdatedBy(ProcessDefinitionService.normalizeActor(actorHeader));
        slot.setUpdatedAt(now());
        return response(slots.saveAndFlush(slot));
    }

    private ApprovalSlot slot(String code) {
        String normalized = normalizeCode(code);
        return slots.findById(normalized)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy slot " + normalized));
    }

    private ApprovalSlotResponse response(ApprovalSlot slot) {
        return ApprovalSlotResponse.from(slot, rules.countBySlotCode(slot.getCode()));
    }

    private int nextSortOrder() {
        return slots.findAllByOrderBySortOrderAscCodeAsc().stream()
                .mapToInt(ApprovalSlot::getSortOrder).max().orElse(0) + 10;
    }

    public static String normalizeCode(String raw) {
        if (raw == null) return "";
        String normalized = raw.trim().toUpperCase(Locale.ROOT).replaceAll("[\\s-]+", "_");
        if (!normalized.matches("[A-Z0-9_]{1,128}")) {
            throw new IllegalArgumentException("Mã slot chỉ gồm A-Z, 0-9 và dấu gạch dưới.");
        }
        return normalized;
    }

    private static List<String> normalizeGroups(List<String> values) {
        if (values == null) return new java.util.ArrayList<>();
        return values.stream().filter(java.util.Objects::nonNull).map(String::trim)
                .filter(value -> !value.isBlank()).distinct().toList();
    }

    private static int nonNegative(int value, String field) {
        if (value < 0) throw new IllegalArgumentException(field + " không được âm.");
        return value;
    }

    private static String trimToNull(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }

    private static OffsetDateTime now() {
        return OffsetDateTime.now(ZoneOffset.UTC);
    }
}

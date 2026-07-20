package vn.vht.qtkhcn.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;
import vn.vht.qtkhcn.domain.ApprovalRule;
import vn.vht.qtkhcn.domain.ApprovalSlot;
import vn.vht.qtkhcn.web.dto.ApprovalRuleWarningResponse;

@Component
public class ApprovalMatrixAnalyzer {
    public List<ApprovalRuleWarningResponse> analyze(List<ApprovalRule> rules, List<ApprovalSlot> slots) {
        List<ApprovalRuleWarningResponse> out = new ArrayList<>();
        for (ApprovalRule rule : rules) {
            if (!hasTarget(rule)) {
                out.add(warning("error", rule.getId(), rule.getSlotCode(),
                        "Luật \"" + rule.getName() + "\" chưa có đích phân công — sẽ không ra được người."));
            }
        }
        for (ApprovalSlot slot : slots.stream().filter(s -> "active".equals(s.getStatus())).toList()) {
            List<ApprovalRule> enabled = rules.stream()
                    .filter(r -> r.isEnabled() && slot.getCode().equals(r.getSlotCode()))
                    .sorted(java.util.Comparator.comparingInt(ApprovalRule::getPriority).thenComparing(ApprovalRule::getId))
                    .toList();
            Map<Integer, List<ApprovalRule>> priorities = new LinkedHashMap<>();
            enabled.forEach(rule -> priorities.computeIfAbsent(rule.getPriority(), ignored -> new ArrayList<>()).add(rule));
            priorities.forEach((priority, same) -> {
                if (same.size() > 1) out.add(warning("warning", null, slot.getCode(),
                        "Loại phê duyệt \"" + slot.getCode() + "\": " + same.size()
                                + " luật trùng ưu tiên " + priority + " — thứ tự first-match không xác định."));
            });
            ApprovalRule wildcard = enabled.stream().filter(ApprovalMatrixAnalyzer::isWildcard).findFirst().orElse(null);
            if (wildcard != null) {
                enabled.stream().filter(rule -> rule.getPriority() > wildcard.getPriority()).forEach(rule ->
                        out.add(warning("warning", rule.getId(), slot.getCode(),
                                "Bị luật \"" + wildcard.getName() + "\" che khuất — không bao giờ được chọn.")));
            }
            List<ApprovalRule> allWildcards = rules.stream()
                    .filter(rule -> slot.getCode().equals(rule.getSlotCode()) && isWildcard(rule)).toList();
            if (allWildcards.stream().noneMatch(ApprovalRule::isEnabled)) {
                String level = allWildcards.isEmpty() ? "info" : "warning";
                String message = allWildcards.isEmpty()
                        ? "Loại phê duyệt \"" + slot.getCode() + "\": chưa có luật fallback (điều kiện bất kỳ)."
                        : "Loại phê duyệt \"" + slot.getCode() + "\": luật fallback đang bị tắt.";
                out.add(warning(level, null, slot.getCode(), message));
            }
        }
        return out;
    }

    private static boolean isWildcard(ApprovalRule rule) {
        return rule.getConditions().path("items").isArray() && rule.getConditions().path("items").isEmpty();
    }

    private static boolean hasTarget(ApprovalRule rule) {
        for (var target : rule.getAssignment().path("targets")) {
            String type = target.path("type").asText();
            if ("GROUP".equals(type) && !target.path("roleCodes").isEmpty()) return true;
            if ("USER".equals(type) && !target.path("userIds").isEmpty()) return true;
            if (!"GROUP".equals(type) && !"USER".equals(type)) return true;
        }
        return false;
    }

    private static ApprovalRuleWarningResponse warning(String level, String ruleId, String slot, String message) {
        return new ApprovalRuleWarningResponse(level, ruleId, slot, message);
    }
}

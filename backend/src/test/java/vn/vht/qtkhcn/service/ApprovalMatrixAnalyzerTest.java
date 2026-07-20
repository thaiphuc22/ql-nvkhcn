package vn.vht.qtkhcn.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.domain.ApprovalRule;
import vn.vht.qtkhcn.domain.ApprovalSlot;

class ApprovalMatrixAnalyzerTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private final ApprovalMatrixAnalyzer analyzer = new ApprovalMatrixAnalyzer();

    @Test
    void reportsEmptyAssignmentDuplicatePriorityShadowAndMissingFallback() throws Exception {
        ApprovalRule wildcard = rule("AM-W", 10, true, "[]",
                "{\"mode\":\"ANY_ONE\",\"targets\":[{\"type\":\"GROUP\",\"roleCodes\":[\"A\"]}]}");
        ApprovalRule shadowed = rule("AM-S", 20, true,
                "[{\"kind\":\"condition\",\"field\":\"x\",\"operator\":\"eq\",\"value\":1}]",
                "{\"mode\":\"ANY_ONE\",\"targets\":[]}");
        ApprovalRule duplicate = rule("AM-D", 20, true,
                "[{\"kind\":\"condition\",\"field\":\"x\",\"operator\":\"eq\",\"value\":2}]",
                "{\"mode\":\"ANY_ONE\",\"targets\":[{\"type\":\"USER\",\"userIds\":[\"U-001\"]}]}");

        var warnings = analyzer.analyze(List.of(wildcard, shadowed, duplicate), List.of(slot("PHE_DUYET"), slot("OTHER")));

        assertThat(warnings).anyMatch(w -> w.level().equals("error") && "AM-S".equals(w.ruleId()));
        assertThat(warnings).anyMatch(w -> w.message().contains("trùng ưu tiên 20"));
        assertThat(warnings).anyMatch(w -> w.message().contains("che khuất"));
        assertThat(warnings).anyMatch(w -> w.slot().equals("OTHER") && w.message().contains("fallback"));
    }

    private ApprovalRule rule(String id, int priority, boolean enabled, String items, String assignment) throws Exception {
        ApprovalRule rule = new ApprovalRule();
        rule.setId(id);
        rule.setName(id);
        rule.setSlotCode("PHE_DUYET");
        rule.setPriority(priority);
        rule.setEnabled(enabled);
        rule.setConditions(mapper.readTree("{\"kind\":\"group\",\"logic\":\"AND\",\"items\":" + items + "}"));
        rule.setAssignment(mapper.readTree(assignment));
        return rule;
    }

    private ApprovalSlot slot(String code) {
        ApprovalSlot slot = new ApprovalSlot();
        slot.setCode(code);
        slot.setStatus("active");
        return slot;
    }
}

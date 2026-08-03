package vn.vht.qtkhcn.web.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import vn.vht.qtkhcn.domain.DmnRule;
import vn.vht.qtkhcn.domain.DmnRuleCategory;
import vn.vht.qtkhcn.domain.DmnRuleStatus;

public record DmnRuleSummaryResponse(
        UUID id,
        String code,
        String name,
        String description,
        DmnRuleCategory category,
        DmnRuleStatus status,
        List<String> appliedProcesses,
        int latestVersion,
        Integer activeVersion,
        String createdBy,
        OffsetDateTime createdAt,
        String updatedBy,
        OffsetDateTime updatedAt
) {
    public static DmnRuleSummaryResponse from(DmnRule rule) {
        return new DmnRuleSummaryResponse(rule.getId(), rule.getCode(), rule.getName(),
                rule.getDescription(), rule.getCategory(), rule.getStatus(),
                rule.getAppliedProcesses().stream().sorted().toList(), rule.getLatestVersion(),
                rule.getActiveVersion(), rule.getCreatedBy(), rule.getCreatedAt(),
                rule.getUpdatedBy(), rule.getUpdatedAt());
    }
}


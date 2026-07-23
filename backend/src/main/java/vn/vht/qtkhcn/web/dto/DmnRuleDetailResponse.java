package vn.vht.qtkhcn.web.dto;

import java.util.List;
import vn.vht.qtkhcn.domain.DmnRule;

public record DmnRuleDetailResponse(
        DmnRuleSummaryResponse rule,
        List<DmnRuleVersionSummaryResponse> versions
) {
    public static DmnRuleDetailResponse from(DmnRule rule, List<DmnRuleVersionSummaryResponse> versions) {
        return new DmnRuleDetailResponse(DmnRuleSummaryResponse.from(rule), versions);
    }
}

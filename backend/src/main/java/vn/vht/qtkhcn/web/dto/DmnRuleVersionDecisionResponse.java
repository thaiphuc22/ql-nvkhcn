package vn.vht.qtkhcn.web.dto;

import vn.vht.qtkhcn.domain.DmnRuleVersionDecision;

public record DmnRuleVersionDecisionResponse(
        String decisionId,
        String decisionName,
        long camundaDecisionKey,
        int camundaDecisionVersion,
        boolean root
) {
    public static DmnRuleVersionDecisionResponse from(DmnRuleVersionDecision decision) {
        return new DmnRuleVersionDecisionResponse(decision.getDecisionId(), decision.getDecisionName(),
                decision.getCamundaDecisionKey(), decision.getCamundaDecisionVersion(), decision.isRoot());
    }
}

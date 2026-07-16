package vn.vht.qtkhcn.web.dto;

import java.util.List;
import java.util.Map;
import vn.vht.qtkhcn.camunda.DmnCamundaGateway;

public record EvaluateDmnDecisionResponse(long evaluationKey, String decisionId, int decisionVersion,
        Map<String, Object> outputs, List<MatchedRuleResponse> matchedRules) {
    public static EvaluateDmnDecisionResponse from(DmnCamundaGateway.EvaluationResult result) {
        return new EvaluateDmnDecisionResponse(result.evaluationKey(), result.decisionId(),
                result.decisionVersion(), result.outputs(), result.matchedRules().stream()
                        .map(item -> new MatchedRuleResponse(item.ruleId(), item.ruleIndex(), item.outputs()))
                        .toList());
    }

    public record MatchedRuleResponse(String ruleId, int ruleIndex, Map<String, Object> outputs) {}
}

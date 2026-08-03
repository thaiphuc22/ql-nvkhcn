package vn.vht.qtkhcn.web.dto;

import java.util.List;
import java.util.Map;
import vn.vht.qtkhcn.camunda.DmnCamundaGateway;

/**
 * Kết quả evaluate một DRD: mỗi decision được Camunda chạy qua (kể cả các decision trung gian bị
 * decision gốc kéo theo) là một phần tử, giữ đúng thứ tự Camunda trả về.
 */
public record EvaluateDmnDecisionResponse(List<DecisionResultResponse> decisions) {
    public static EvaluateDmnDecisionResponse from(DmnCamundaGateway.EvaluationResult result) {
        return new EvaluateDmnDecisionResponse(result.decisions().stream()
                .map(DecisionResultResponse::from)
                .toList());
    }

    public record DecisionResultResponse(long evaluationKey, String decisionId, String decisionName,
            int decisionVersion, Map<String, Object> outputs, List<MatchedRuleResponse> matchedRules) {
        static DecisionResultResponse from(DmnCamundaGateway.EvaluatedDecisionResult result) {
            return new DecisionResultResponse(result.evaluationKey(), result.decisionId(),
                    result.decisionName(), result.decisionVersion(), result.outputs(),
                    result.matchedRules().stream()
                            .map(item -> new MatchedRuleResponse(item.ruleId(), item.ruleIndex(), item.outputs()))
                            .toList());
        }
    }

    public record MatchedRuleResponse(String ruleId, int ruleIndex, Map<String, Object> outputs) {}
}

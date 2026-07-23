package vn.vht.qtkhcn.camunda;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.camunda.client.CamundaClient;
import io.camunda.client.api.response.EvaluatedDecision;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import vn.vht.qtkhcn.service.DmnDrdAnalyzer;

@Service
public class DmnCamundaGateway {
    private final CamundaClient client;
    private final ObjectMapper objectMapper;
    private final DmnDrdAnalyzer drdAnalyzer;

    public DmnCamundaGateway(CamundaClient client, ObjectMapper objectMapper, DmnDrdAnalyzer drdAnalyzer) {
        this.client = client;
        this.objectMapper = objectMapper;
        this.drdAnalyzer = drdAnalyzer;
    }

    /**
     * Deploy một tài nguyên DMN có thể chứa NHIỀU decision nối chuỗi (DRD). Camunda client không
     * mang thông tin phụ thuộc chéo giữa các decision trả về, nên phải tự phân tích lại đúng
     * {@code dmnXml} vừa gửi để biết decision nào là "gốc" (terminal — không bị decision nào khác
     * yêu cầu qua {@code requiredDecision}).
     */
    public DeploymentResult deploy(String dmnXml, String resourceName) {
        try {
            var event = client.newDeployResourceCommand()
                    .addResourceBytes(dmnXml.getBytes(StandardCharsets.UTF_8), resourceName)
                    .send().join();
            if (event.getDecisions().isEmpty()) {
                throw new IllegalStateException("Camunda phải trả về ít nhất một decision.");
            }
            Set<String> terminalIds = drdAnalyzer.terminalDecisionIds(dmnXml);
            List<DeployedDecision> decisions = event.getDecisions().stream()
                    .map(decision -> new DeployedDecision(decision.getDecisionKey(), decision.getDmnDecisionId(),
                            decision.getDmnDecisionName(), decision.getVersion(),
                            terminalIds.contains(decision.getDmnDecisionId())))
                    .toList();
            return new DeploymentResult(event.getKey(), decisions);
        } catch (Exception e) {
            throw new DmnCamundaException("Camunda từ chối hoặc không thể deploy DMN.", rootMessage(e), e);
        }
    }

    /**
     * Evaluate một hoặc nhiều decision "gốc" (terminal) của một DRD. Mỗi lần gọi
     * {@code EvaluateDecision} trên một decision đã tự động kéo theo kết quả của toàn bộ decision
     * mà nó phụ thuộc (Camunda trả về trong {@code getEvaluatedDecisions()}); khi có nhiều decision
     * gốc độc lập (không nối chuỗi với nhau), gọi tuần tự từng cái rồi gộp + khử trùng theo
     * {@code decisionKey} (giữ lần xuất hiện đầu tiên) để không lặp lại decision tổ tiên chung.
     */
    public EvaluationResult evaluate(List<Long> decisionKeys, Map<String, Object> variables) {
        try {
            LinkedHashMap<Long, EvaluatedDecisionResult> merged = new LinkedHashMap<>();
            for (long decisionKey : decisionKeys) {
                var response = client.newEvaluateDecisionCommand().decisionKey(decisionKey)
                        .variables(variables).send().join();
                if (response.getFailureMessage() != null && !response.getFailureMessage().isBlank()) {
                    throw new IllegalStateException(response.getFailureMessage());
                }
                long evaluationKey = response.getDecisionEvaluationKey();
                for (EvaluatedDecision evaluated : response.getEvaluatedDecisions()) {
                    merged.computeIfAbsent(evaluated.getDecisionKey(),
                            key -> toEvaluatedDecisionResult(evaluationKey, evaluated));
                }
            }
            return new EvaluationResult(List.copyOf(merged.values()));
        } catch (Exception e) {
            throw new DmnCamundaException("Không thể evaluate decision trên Camunda.", rootMessage(e), e);
        }
    }

    private EvaluatedDecisionResult toEvaluatedDecisionResult(long evaluationKey, EvaluatedDecision evaluated) {
        List<MatchedRule> matchedRules = evaluated.getMatchedRules().stream()
                .map(rule -> new MatchedRule(rule.getRuleId(), rule.getRuleIndex(),
                        rule.getEvaluatedOutputs().stream().collect(LinkedHashMap::new,
                                (map, item) -> map.put(item.getOutputName(), readValue(item.getOutputValue())),
                                LinkedHashMap::putAll)))
                .toList();
        Map<String, Object> output = readOutputs(evaluated.getDecisionOutput(), matchedRules);
        return new EvaluatedDecisionResult(evaluationKey, evaluated.getDecisionId(), evaluated.getDecisionName(),
                evaluated.getDecisionVersion(), output, matchedRules);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> readOutputs(String json, List<MatchedRule> matchedRules) {
        if (json != null && !json.isBlank()) {
            try {
                Object value = objectMapper.readValue(json, Object.class);
                if (value instanceof Map<?, ?> map) return (Map<String, Object>) map;
            } catch (JsonProcessingException ignored) {
                // falls through to matched-rule aggregation below
            }
        }
        LinkedHashMap<String, Object> outputs = new LinkedHashMap<>();
        matchedRules.forEach(rule -> outputs.putAll(rule.outputs()));
        return outputs;
    }

    private Object readValue(String json) {
        try {
            return objectMapper.readValue(json, Object.class);
        } catch (JsonProcessingException e) {
            return json;
        }
    }

    private static String rootMessage(Throwable error) {
        Throwable root = error;
        while (root.getCause() != null) root = root.getCause();
        return root.getMessage() == null ? root.getClass().getSimpleName() : root.getMessage();
    }

    public record DeployedDecision(long decisionKey, String decisionId, String decisionName, int decisionVersion,
            boolean root) {}

    public record DeploymentResult(long deploymentKey, List<DeployedDecision> decisions) {}

    public record EvaluatedDecisionResult(long evaluationKey, String decisionId, String decisionName,
            int decisionVersion, Map<String, Object> outputs, List<MatchedRule> matchedRules) {}

    public record EvaluationResult(List<EvaluatedDecisionResult> decisions) {}

    public record MatchedRule(String ruleId, int ruleIndex, Map<String, Object> outputs) {}
}

package vn.vht.qtkhcn.camunda;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.camunda.client.CamundaClient;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class DmnCamundaGateway {
    private final CamundaClient client;
    private final ObjectMapper objectMapper;

    public DmnCamundaGateway(CamundaClient client, ObjectMapper objectMapper) {
        this.client = client;
        this.objectMapper = objectMapper;
    }

    public DeploymentResult deploy(String dmnXml, String resourceName) {
        try {
            var event = client.newDeployResourceCommand()
                    .addResourceBytes(dmnXml.getBytes(StandardCharsets.UTF_8), resourceName)
                    .send().join();
            if (event.getDecisions().size() != 1) {
                throw new IllegalStateException("Camunda phải trả về đúng một decision, thực tế: "
                        + event.getDecisions().size());
            }
            var decision = event.getDecisions().getFirst();
            return new DeploymentResult(event.getKey(), decision.getDecisionKey(),
                    decision.getDmnDecisionId(), decision.getVersion());
        } catch (Exception e) {
            throw new DmnCamundaException("Camunda từ chối hoặc không thể deploy DMN.", rootMessage(e), e);
        }
    }

    public EvaluationResult evaluate(long decisionKey, Map<String, Object> variables) {
        try {
            var response = client.newEvaluateDecisionCommand().decisionKey(decisionKey)
                    .variables(variables).send().join();
            if (response.getFailureMessage() != null && !response.getFailureMessage().isBlank()) {
                throw new IllegalStateException(response.getFailureMessage());
            }
            var evaluated = response.getEvaluatedDecisions().stream()
                    .filter(item -> item.getDecisionKey() == decisionKey)
                    .findFirst().orElseGet(() -> response.getEvaluatedDecisions().getLast());
            List<MatchedRule> matchedRules = evaluated.getMatchedRules().stream()
                    .map(rule -> new MatchedRule(rule.getRuleId(), rule.getRuleIndex(),
                            rule.getEvaluatedOutputs().stream().collect(LinkedHashMap::new,
                                    (map, item) -> map.put(item.getOutputName(), readValue(item.getOutputValue())),
                                    LinkedHashMap::putAll)))
                    .toList();
            Map<String, Object> output = readOutputs(response.getDecisionOutput(), matchedRules);
            return new EvaluationResult(response.getDecisionEvaluationKey(), response.getDecisionId(),
                    response.getDecisionVersion(), output, matchedRules);
        } catch (Exception e) {
            throw new DmnCamundaException("Không thể evaluate decision trên Camunda.", rootMessage(e), e);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> readOutputs(String json, List<MatchedRule> matchedRules)
            throws JsonProcessingException {
        if (json != null && !json.isBlank()) {
            Object value = objectMapper.readValue(json, Object.class);
            if (value instanceof Map<?, ?> map) return (Map<String, Object>) map;
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

    public record DeploymentResult(long deploymentKey, long decisionKey, String decisionId, int decisionVersion) {}
    public record EvaluationResult(long evaluationKey, String decisionId, int decisionVersion,
            Map<String, Object> outputs, List<MatchedRule> matchedRules) {}
    public record MatchedRule(String ruleId, int ruleIndex, Map<String, Object> outputs) {}
}

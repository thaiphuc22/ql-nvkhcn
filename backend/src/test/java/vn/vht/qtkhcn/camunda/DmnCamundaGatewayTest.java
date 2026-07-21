package vn.vht.qtkhcn.camunda;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.camunda.client.CamundaClient;
import io.camunda.client.api.CamundaFuture;
import io.camunda.client.api.command.DeployResourceCommandStep1;
import io.camunda.client.api.command.EvaluateDecisionCommandStep1;
import io.camunda.client.api.response.Decision;
import io.camunda.client.api.response.DeploymentEvent;
import io.camunda.client.api.response.EvaluateDecisionResponse;
import io.camunda.client.api.response.EvaluatedDecision;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.service.DmnDrdAnalyzer;

class DmnCamundaGatewayTest {

    @Test
    void deployMarksOnlyTerminalDecisionAsRootInAChain() {
        CamundaClient client = mock(CamundaClient.class);
        DmnCamundaGateway gateway = new DmnCamundaGateway(client, new ObjectMapper(), new DmnDrdAnalyzer());

        DeployResourceCommandStep1 step1 = mock(DeployResourceCommandStep1.class);
        DeployResourceCommandStep1.DeployResourceCommandStep2 step2 =
                mock(DeployResourceCommandStep1.DeployResourceCommandStep2.class);
        @SuppressWarnings("unchecked")
        CamundaFuture<DeploymentEvent> future = mock(CamundaFuture.class);
        DeploymentEvent event = mock(DeploymentEvent.class);

        when(client.newDeployResourceCommand()).thenReturn(step1);
        when(step1.addResourceBytes(any(byte[].class), anyString())).thenReturn(step2);
        when(step2.send()).thenReturn(future);
        when(future.join()).thenReturn(event);

        Decision cap = mockDecision(10L, "capNhiemVu", "Phân cấp", 1);
        Decision canHoiDong = mockDecision(20L, "canHoiDong", "Cần hội đồng", 1);
        Decision loaiHoiDong = mockDecision(30L, "loaiHoiDong", "Loại hội đồng", 1);
        when(event.getDecisions()).thenReturn(List.of(cap, canHoiDong, loaiHoiDong));
        when(event.getKey()).thenReturn(999L);

        DmnCamundaGateway.DeploymentResult result = gateway.deploy(threeDecisionChainXml(), "test.dmn");

        assertEquals(999L, result.deploymentKey());
        assertEquals(3, result.decisions().size());
        assertTrue(rootOf(result, "loaiHoiDong"));
        assertFalse(rootOf(result, "capNhiemVu"));
        assertFalse(rootOf(result, "canHoiDong"));
    }

    @Test
    void deployMarksBothIndependentDecisionsAsRoot() {
        CamundaClient client = mock(CamundaClient.class);
        DmnCamundaGateway gateway = new DmnCamundaGateway(client, new ObjectMapper(), new DmnDrdAnalyzer());

        DeployResourceCommandStep1 step1 = mock(DeployResourceCommandStep1.class);
        DeployResourceCommandStep1.DeployResourceCommandStep2 step2 =
                mock(DeployResourceCommandStep1.DeployResourceCommandStep2.class);
        @SuppressWarnings("unchecked")
        CamundaFuture<DeploymentEvent> future = mock(CamundaFuture.class);
        DeploymentEvent event = mock(DeploymentEvent.class);

        when(client.newDeployResourceCommand()).thenReturn(step1);
        when(step1.addResourceBytes(any(byte[].class), anyString())).thenReturn(step2);
        when(step2.send()).thenReturn(future);
        when(future.join()).thenReturn(event);

        Decision a = mockDecision(10L, "decision_a", "A", 1);
        Decision b = mockDecision(20L, "decision_b", "B", 1);
        when(event.getDecisions()).thenReturn(List.of(a, b));
        when(event.getKey()).thenReturn(111L);

        DmnCamundaGateway.DeploymentResult result = gateway.deploy(twoIndependentDecisionsXml(), "test.dmn");

        assertTrue(rootOf(result, "decision_a"));
        assertTrue(rootOf(result, "decision_b"));
    }

    @Test
    void evaluateMergesAndDedupesAcrossMultipleTerminalCalls() {
        CamundaClient client = mock(CamundaClient.class);
        DmnCamundaGateway gateway = new DmnCamundaGateway(client, new ObjectMapper(), new DmnDrdAnalyzer());

        EvaluateDecisionCommandStep1 step1 = mock(EvaluateDecisionCommandStep1.class);
        when(client.newEvaluateDecisionCommand()).thenReturn(step1);

        EvaluateDecisionCommandStep1.EvaluateDecisionCommandStep2 stepA =
                mock(EvaluateDecisionCommandStep1.EvaluateDecisionCommandStep2.class);
        EvaluateDecisionCommandStep1.EvaluateDecisionCommandStep2 stepB =
                mock(EvaluateDecisionCommandStep1.EvaluateDecisionCommandStep2.class);
        when(step1.decisionKey(100L)).thenReturn(stepA);
        when(step1.decisionKey(200L)).thenReturn(stepB);
        when(stepA.variables(anyMap())).thenReturn(stepA);
        when(stepB.variables(anyMap())).thenReturn(stepB);

        @SuppressWarnings("unchecked")
        CamundaFuture<EvaluateDecisionResponse> futureA = mock(CamundaFuture.class);
        @SuppressWarnings("unchecked")
        CamundaFuture<EvaluateDecisionResponse> futureB = mock(CamundaFuture.class);
        when(stepA.send()).thenReturn(futureA);
        when(stepB.send()).thenReturn(futureB);

        EvaluateDecisionResponse responseA = mock(EvaluateDecisionResponse.class);
        EvaluateDecisionResponse responseB = mock(EvaluateDecisionResponse.class);
        when(futureA.join()).thenReturn(responseA);
        when(futureB.join()).thenReturn(responseB);
        when(responseA.getFailureMessage()).thenReturn(null);
        when(responseB.getFailureMessage()).thenReturn(null);
        when(responseA.getDecisionEvaluationKey()).thenReturn(1L);
        when(responseB.getDecisionEvaluationKey()).thenReturn(2L);

        EvaluatedDecision ancestor = mockEvaluatedDecision(50L, "capNhiemVu", "Phân cấp", 1, "{\"cap\":\"CS\"}");
        EvaluatedDecision terminalA = mockEvaluatedDecision(100L, "canHoiDong", "Cần hội đồng", 1,
                "{\"canHoiDong\":false}");
        EvaluatedDecision terminalB = mockEvaluatedDecision(200L, "loaiHoiDong", "Loại hội đồng", 1,
                "{\"loaiHoiDong\":\"KHONG\"}");
        when(responseA.getEvaluatedDecisions()).thenReturn(List.of(ancestor, terminalA));
        when(responseB.getEvaluatedDecisions()).thenReturn(List.of(ancestor, terminalB));

        DmnCamundaGateway.EvaluationResult result =
                gateway.evaluate(List.of(100L, 200L), Map.of("tongDuToan", 1_000_000));

        assertEquals(3, result.decisions().size());
        assertEquals("capNhiemVu", result.decisions().get(0).decisionId());
        assertEquals("canHoiDong", result.decisions().get(1).decisionId());
        assertEquals("loaiHoiDong", result.decisions().get(2).decisionId());
    }

    private static boolean rootOf(DmnCamundaGateway.DeploymentResult result, String decisionId) {
        return result.decisions().stream()
                .filter(d -> d.decisionId().equals(decisionId))
                .findFirst()
                .orElseThrow()
                .root();
    }

    private static Decision mockDecision(long key, String id, String name, int version) {
        Decision decision = mock(Decision.class);
        when(decision.getDecisionKey()).thenReturn(key);
        when(decision.getDmnDecisionId()).thenReturn(id);
        when(decision.getDmnDecisionName()).thenReturn(name);
        when(decision.getVersion()).thenReturn(version);
        return decision;
    }

    private static EvaluatedDecision mockEvaluatedDecision(long key, String id, String name, int version,
            String outputJson) {
        EvaluatedDecision decision = mock(EvaluatedDecision.class);
        when(decision.getDecisionKey()).thenReturn(key);
        when(decision.getDecisionId()).thenReturn(id);
        when(decision.getDecisionName()).thenReturn(name);
        when(decision.getDecisionVersion()).thenReturn(version);
        when(decision.getDecisionOutput()).thenReturn(outputJson);
        when(decision.getMatchedRules()).thenReturn(List.of());
        return decision;
    }

    private static String threeDecisionChainXml() {
        return """
                <?xml version="1.0" encoding="UTF-8"?>
                <definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
                             id="definitions_rd02" name="RD02 routing" namespace="urn:qtkhcn:test">
                  <inputData id="in_tongDuToan" name="tongDuToan">
                    <variable id="var_tongDuToan" name="tongDuToan" typeRef="number" />
                  </inputData>
                  <decision id="capNhiemVu" name="Phân cấp nhiệm vụ">
                    <informationRequirement id="ir_cap_ind"><requiredInput href="#in_tongDuToan" /></informationRequirement>
                    <decisionTable id="dt_cap" hitPolicy="FIRST">
                      <input id="i1"><inputExpression id="i1e" typeRef="number"><text>tongDuToan</text></inputExpression></input>
                      <output id="o1" name="cap" typeRef="string" />
                      <rule id="r1"><inputEntry id="r1i1"><text>-</text></inputEntry><outputEntry id="r1o1"><text>"CS"</text></outputEntry></rule>
                    </decisionTable>
                  </decision>
                  <decision id="canHoiDong" name="Cần Hội đồng">
                    <informationRequirement id="ir_ch_cap"><requiredDecision href="#capNhiemVu" /></informationRequirement>
                    <informationRequirement id="ir_ch_ind"><requiredInput href="#in_tongDuToan" /></informationRequirement>
                    <decisionTable id="dt_ch" hitPolicy="FIRST">
                      <input id="i2"><inputExpression id="i2e" typeRef="string"><text>cap</text></inputExpression></input>
                      <output id="o2" name="canHoiDong" typeRef="boolean" />
                      <rule id="r2"><inputEntry id="r2i1"><text>-</text></inputEntry><outputEntry id="r2o1"><text>false</text></outputEntry></rule>
                    </decisionTable>
                  </decision>
                  <decision id="loaiHoiDong" name="Loại hội đồng">
                    <informationRequirement id="ir_lh_cap"><requiredDecision href="#capNhiemVu" /></informationRequirement>
                    <informationRequirement id="ir_lh_ch"><requiredDecision href="#canHoiDong" /></informationRequirement>
                    <decisionTable id="dt_lh" hitPolicy="UNIQUE">
                      <input id="i3"><inputExpression id="i3e" typeRef="boolean"><text>canHoiDong</text></inputExpression></input>
                      <output id="o3" name="loaiHoiDong" typeRef="string" />
                      <rule id="r3"><inputEntry id="r3i1"><text>-</text></inputEntry><outputEntry id="r3o1"><text>"KHONG"</text></outputEntry></rule>
                    </decisionTable>
                  </decision>
                </definitions>
                """;
    }

    private static String twoIndependentDecisionsXml() {
        return """
                <?xml version="1.0" encoding="UTF-8"?>
                <definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
                             id="definitions_two" name="Two independent" namespace="urn:qtkhcn:test">
                  <decision id="decision_a" name="A">
                    <decisionTable id="dt_a" hitPolicy="FIRST">
                      <input id="ai1"><inputExpression id="ai1e" typeRef="number"><text>x</text></inputExpression></input>
                      <output id="ao1" name="resultA" typeRef="string" />
                      <rule id="ar1"><inputEntry id="ar1i1"><text>-</text></inputEntry><outputEntry id="ar1o1"><text>"A"</text></outputEntry></rule>
                    </decisionTable>
                  </decision>
                  <decision id="decision_b" name="B">
                    <decisionTable id="dt_b" hitPolicy="FIRST">
                      <input id="bi1"><inputExpression id="bi1e" typeRef="number"><text>y</text></inputExpression></input>
                      <output id="bo1" name="resultB" typeRef="string" />
                      <rule id="br1"><inputEntry id="br1i1"><text>-</text></inputEntry><outputEntry id="br1o1"><text>"B"</text></outputEntry></rule>
                    </decisionTable>
                  </decision>
                </definitions>
                """;
    }
}

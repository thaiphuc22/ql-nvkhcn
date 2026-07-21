package vn.vht.qtkhcn.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.Set;
import org.junit.jupiter.api.Test;

class DmnDrdAnalyzerTest {
    private final DmnDrdAnalyzer analyzer = new DmnDrdAnalyzer();

    @Test
    void singleDecisionIsTerminal() {
        Set<String> terminal = analyzer.terminalDecisionIds(DmnArtifactValidatorTest.validDmn());

        assertEquals(Set.of("decision_1"), terminal);
    }

    @Test
    void chainedThreeDecisionsOnlyLastIsTerminal() {
        Set<String> terminal = analyzer.terminalDecisionIds(threeDecisionChain());

        assertEquals(Set.of("loaiHoiDong"), terminal);
    }

    @Test
    void twoIndependentDecisionsAreBothTerminal() {
        Set<String> terminal = analyzer.terminalDecisionIds(twoIndependentDecisions());

        assertEquals(Set.of("decision_a", "decision_b"), terminal);
    }

    @Test
    void rejectsDrdWithNoTerminalDecision() {
        assertThrows(IllegalStateException.class, () -> analyzer.terminalDecisionIds(cyclicDrd()));
    }

    private static String threeDecisionChain() {
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

    private static String twoIndependentDecisions() {
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

    private static String cyclicDrd() {
        return """
                <?xml version="1.0" encoding="UTF-8"?>
                <definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
                             id="definitions_cycle" name="Cycle" namespace="urn:qtkhcn:test">
                  <decision id="decision_a" name="A">
                    <informationRequirement id="ir_a"><requiredDecision href="#decision_b" /></informationRequirement>
                    <decisionTable id="dt_a" hitPolicy="FIRST">
                      <input id="ai1"><inputExpression id="ai1e" typeRef="string"><text>b</text></inputExpression></input>
                      <output id="ao1" name="a" typeRef="string" />
                      <rule id="ar1"><inputEntry id="ar1i1"><text>-</text></inputEntry><outputEntry id="ar1o1"><text>"A"</text></outputEntry></rule>
                    </decisionTable>
                  </decision>
                  <decision id="decision_b" name="B">
                    <informationRequirement id="ir_b"><requiredDecision href="#decision_a" /></informationRequirement>
                    <decisionTable id="dt_b" hitPolicy="FIRST">
                      <input id="bi1"><inputExpression id="bi1e" typeRef="string"><text>a</text></inputExpression></input>
                      <output id="bo1" name="b" typeRef="string" />
                      <rule id="br1"><inputEntry id="br1i1"><text>-</text></inputEntry><outputEntry id="br1o1"><text>"B"</text></outputEntry></rule>
                    </decisionTable>
                  </decision>
                </definitions>
                """;
    }
}

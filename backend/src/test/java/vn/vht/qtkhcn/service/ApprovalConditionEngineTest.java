package vn.vht.qtkhcn.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ApprovalConditionEngineTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private final ApprovalConditionEngine engine = new ApprovalConditionEngine();

    @Test
    void evaluatesNestedTreeAndAllOperatorFamiliesFailClosed() throws Exception {
        var tree = mapper.readTree("""
                {"kind":"group","logic":"AND","items":[
                  {"kind":"condition","field":"capNhiemVu","operator":"in","value":["CS","TD"]},
                  {"kind":"group","logic":"OR","items":[
                    {"kind":"condition","field":"tongDuToan","operator":"between","value":5,"valueTo":10},
                    {"kind":"condition","field":"tags","operator":"contains","value":"urgent"}
                  ]},
                  {"kind":"condition","field":"optional","operator":"notExists"}
                ]}
                """);

        assertThat(engine.evaluate(tree, Map.of("capNhiemVu", "TD", "tongDuToan", "7"))).isTrue();
        assertThat(engine.evaluate(tree, Map.of("capNhiemVu", "TD", "tongDuToan", "not-a-number"))).isFalse();
        assertThat(engine.evaluate(tree, Map.of("capNhiemVu", "TD", "tags", List.of("urgent")))).isTrue();
        assertThat(engine.evaluate(tree, Map.of("tongDuToan", 7))).isFalse();
    }

    @Test
    void emptyGroupIsWildcardAndInvalidTreesAreRejected() throws Exception {
        assertThat(engine.evaluate(mapper.readTree("""
                {"kind":"group","logic":"AND","items":[]}
                """), Map.of())).isTrue();

        assertThatThrownBy(() -> engine.validate(mapper.readTree("""
                {"kind":"condition","field":"x","operator":"eq","value":1}
                """))).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Node gốc");
        assertThatThrownBy(() -> engine.validate(mapper.readTree("""
                {"kind":"group","logic":"XOR","items":[]}
                """))).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("AND hoặc OR");
    }
}

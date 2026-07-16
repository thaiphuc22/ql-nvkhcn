package vn.vht.qtkhcn.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class DmnArtifactValidatorTest {
    private final DmnArtifactValidator validator = new DmnArtifactValidator();

    @Test
    void acceptsDecisionTableAndReturnsStableChecksum() {
        String checksum = validator.validateAndChecksum(validDmn());

        assertEquals(DmnArtifactValidator.checksum(validDmn()), checksum);
        assertEquals(64, checksum.length());
    }

    @Test
    void rejectsNonDmnAndDmnWithoutDecisionTable() {
        assertThrows(DmnValidationException.class,
                () -> validator.validateAndChecksum("<definitions/>"));
        assertThrows(DmnValidationException.class,
                () -> validator.validateAndChecksum("""
                        <definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/">
                          <decision id="d1" name="D1"/>
                        </definitions>
                        """));
    }

    @Test
    void rejectsDoctypeAndExternalEntity() {
        String xml = """
                <!DOCTYPE definitions [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
                <definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/">
                  <decision id="d1" name="&xxe;"><decisionTable id="t1"/></decision>
                </definitions>
                """;

        assertThrows(DmnValidationException.class, () -> validator.validateAndChecksum(xml));
    }

    static String validDmn() {
        return """
                <?xml version="1.0" encoding="UTF-8"?>
                <definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
                             id="definitions_1" name="Demo" namespace="urn:qtkhcn:test">
                  <decision id="decision_1" name="Demo decision">
                    <decisionTable id="table_1" hitPolicy="FIRST">
                      <input id="input_1"><inputExpression id="expr_1" typeRef="number"><text>amount</text></inputExpression></input>
                      <output id="output_1" name="result" typeRef="string"/>
                      <rule id="rule_1"><inputEntry id="in_1"><text>-</text></inputEntry><outputEntry id="out_1"><text>"OK"</text></outputEntry></rule>
                    </decisionTable>
                  </decision>
                </definitions>
                """;
    }
}


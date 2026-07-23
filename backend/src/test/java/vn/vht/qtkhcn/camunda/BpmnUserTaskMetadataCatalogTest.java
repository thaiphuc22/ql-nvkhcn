package vn.vht.qtkhcn.camunda;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class BpmnUserTaskMetadataCatalogTest {

    @Test
    void parsesAssignmentAndFormMetadataFromBpmn() {
        String xml = """
                <?xml version="1.0" encoding="UTF-8"?>
                <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                    xmlns:zeebe="http://camunda.org/schema/zeebe/1.0">
                  <bpmn:process id="P1">
                    <bpmn:userTask id="Task_1" name="Phê duyệt hồ sơ">
                      <bpmn:extensionElements>
                        <zeebe:assignmentDefinition assignee="owner@example.com"
                            candidateUsers="u1, u2" candidateGroups="PM, CQ_KHCN" />
                        <zeebe:formDefinition formKey="phieu-phe-duyet" />
                      </bpmn:extensionElements>
                    </bpmn:userTask>
                  </bpmn:process>
                </bpmn:definitions>
                """;

        var task = BpmnUserTaskMetadataCatalog.parse(xml).get("Task_1");

        assertEquals("Phê duyệt hồ sơ", task.name());
        assertEquals("owner@example.com", task.assignee());
        assertEquals(java.util.List.of("u1", "u2"), task.candidateUsers());
        assertEquals(java.util.List.of("PM", "CQ_KHCN"), task.candidateGroups());
        assertEquals("phieu-phe-duyet", task.formKey());
    }
}

package vn.vht.qtkhcn.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class EmbeddedFormReaderTest {

    private static final String HEADER = """
            <?xml version="1.0" encoding="UTF-8"?>
            <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                xmlns:zeebe="http://camunda.org/schema/zeebe/1.0">
            """;

    @Test
    void bocSchemaVaLayTenBuocLamTenBieuMau() {
        String xml = HEADER + """
              <bpmn:process id="RD07">
                <bpmn:extensionElements>
                  <zeebe:userTaskForm id="UserTaskForm_1">{"type":"default","components":[]}</zeebe:userTaskForm>
                </bpmn:extensionElements>
                <bpmn:userTask id="Task_1" name="Thẩm định nội dung">
                  <bpmn:extensionElements>
                    <zeebe:userTask />
                    <zeebe:formDefinition formKey="camunda-forms:bpmn:UserTaskForm_1" />
                  </bpmn:extensionElements>
                </bpmn:userTask>
              </bpmn:process>
            </bpmn:definitions>
            """;

        var forms = EmbeddedFormReader.parse(xml);

        assertEquals(1, forms.size());
        assertEquals("UserTaskForm_1", forms.get(0).id());
        assertEquals("{\"type\":\"default\",\"components\":[]}", forms.get(0).schemaJson());
        assertEquals("Thẩm định nội dung", forms.get(0).ten());
    }

    /** Không bước nào trỏ tới thì vẫn hút — nhưng không có tên bước để mượn, lấy chính id. */
    @Test
    void khongCoBuocTroToiThiLayIdLamTen() {
        String xml = HEADER + """
              <bpmn:process id="RD07">
                <bpmn:extensionElements>
                  <zeebe:userTaskForm id="UserTaskForm_9">{"components":[]}</zeebe:userTaskForm>
                </bpmn:extensionElements>
              </bpmn:process>
            </bpmn:definitions>
            """;

        assertEquals("UserTaskForm_9", EmbeddedFormReader.parse(xml).get(0).ten());
    }

    /**
     * Linked form KHÔNG có thân trong BPMN — schema nằm ở resource .form trên engine, mà Camunda 8.9
     * chỉ trả qua user task đang chạy. Reader này phải im lặng bỏ qua, không được sinh dòng rỗng.
     */
    @Test
    void boQuaLinkedFormVaTheKhongIdHoacThanRong() {
        String xml = HEADER + """
              <bpmn:process id="RD07">
                <bpmn:extensionElements>
                  <zeebe:userTaskForm>{"components":[]}</zeebe:userTaskForm>
                  <zeebe:userTaskForm id="UserTaskForm_2">   </zeebe:userTaskForm>
                </bpmn:extensionElements>
                <bpmn:userTask id="Task_2" name="Ký duyệt">
                  <bpmn:extensionElements>
                    <zeebe:formDefinition formId="approval-form" />
                  </bpmn:extensionElements>
                </bpmn:userTask>
              </bpmn:process>
            </bpmn:definitions>
            """;

        assertTrue(EmbeddedFormReader.parse(xml).isEmpty());
    }
}

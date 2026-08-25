package vn.vht.qtkhcn.camunda;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.domain.ProcessDefinitionVersion;
import vn.vht.qtkhcn.repository.ProcessDefinitionVersionRepository;

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

    /**
     * Khách khai eForm trên Camunda rồi gắn vào task ⇒ Modeler ghi {@code formId}, không phải
     * {@code formKey}. Trước khi có {@link BpmnFormReference}, lớp này trả rỗng cho mọi task như vậy,
     * nên bước hiện ra không có biểu mẫu nào dù bản vẽ đã gắn đủ.
     */
    @Test
    void docDuocLinkedFormKhaiBangFormId() {
        String xml = """
                <?xml version="1.0" encoding="UTF-8"?>
                <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                    xmlns:zeebe="http://camunda.org/schema/zeebe/1.0">
                  <bpmn:process id="P1">
                    <bpmn:userTask id="Task_1" name="Ký duyệt">
                      <bpmn:extensionElements>
                        <zeebe:userTask />
                        <zeebe:formDefinition formId="approval-form" />
                      </bpmn:extensionElements>
                    </bpmn:userTask>
                  </bpmn:process>
                </bpmn:definitions>
                """;

        assertEquals("approval-form", BpmnUserTaskMetadataCatalog.parse(xml).get("Task_1").formKey());
    }

    /**
     * Lượt tra trước khi quy trình được hút về catalog (nút "Đồng bộ từ Camunda", Lát 1) KHÔNG được
     * đóng băng kết quả rỗng: nếu cache cả map rỗng thì mọi bước của quy trình đó hiện ra không tên,
     * không role cho tới khi restart backend.
     */
    @Test
    void aLookupBeforeTheProcessReachesTheCatalogIsRetriedInsteadOfCachedEmpty() {
        var versions = mock(ProcessDefinitionVersionRepository.class);
        var catalog = new BpmnUserTaskMetadataCatalog(versions);
        when(versions.findByCamundaProcessDefinitionKey(77L))
                .thenReturn(Optional.empty())
                .thenReturn(Optional.of(version(oneTaskBpmn())));

        assertEquals("", catalog.resolve(77L, "Task_1").name());
        assertEquals("Phê duyệt hồ sơ", catalog.resolve(77L, "Task_1").name());
        // Lượt thứ ba đọc từ cache — bản có nội dung mới được giữ lại.
        assertEquals("Phê duyệt hồ sơ", catalog.resolve(77L, "Task_1").name());
        verify(versions, times(2)).findByCamundaProcessDefinitionKey(77L);
    }

    private static ProcessDefinitionVersion version(String xml) {
        var version = new ProcessDefinitionVersion();
        version.setBpmnXml(xml);
        return version;
    }

    private static String oneTaskBpmn() {
        return """
                <?xml version="1.0" encoding="UTF-8"?>
                <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                    xmlns:zeebe="http://camunda.org/schema/zeebe/1.0">
                  <bpmn:process id="P1">
                    <bpmn:userTask id="Task_1" name="Phê duyệt hồ sơ" />
                  </bpmn:process>
                </bpmn:definitions>
                """;
    }
}

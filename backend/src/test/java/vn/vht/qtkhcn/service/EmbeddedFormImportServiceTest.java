package vn.vht.qtkhcn.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.domain.ProcessDefinitionCatalog;
import vn.vht.qtkhcn.domain.ProcessDefinitionVersion;
import vn.vht.qtkhcn.repository.ProcessDefinitionCatalogRepository;
import vn.vht.qtkhcn.repository.ProcessDefinitionVersionRepository;
import vn.vht.qtkhcn.service.EformService.ImportOutcome;

class EmbeddedFormImportServiceTest {

    private final ProcessDefinitionCatalogRepository catalogs = mock(ProcessDefinitionCatalogRepository.class);
    private final ProcessDefinitionVersionRepository versions = mock(ProcessDefinitionVersionRepository.class);
    private final EformService eforms = mock(EformService.class);
    private final EmbeddedFormImportService service =
            new EmbeddedFormImportService(catalogs, versions, eforms, new ObjectMapper());

    @Test
    void hutFormNhungVaoThuVienVoiKhoaLaIdTrongBpmn() {
        stubProcess("RD07", """
                <?xml version="1.0" encoding="UTF-8"?>
                <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                    xmlns:zeebe="http://camunda.org/schema/zeebe/1.0">
                  <bpmn:process id="RD07">
                    <bpmn:extensionElements>
                      <zeebe:userTaskForm id="UserTaskForm_1">{"components":[]}</zeebe:userTaskForm>
                    </bpmn:extensionElements>
                    <bpmn:userTask id="T01" name="Thẩm định"><bpmn:extensionElements>
                      <zeebe:formDefinition formKey="camunda-forms:bpmn:UserTaskForm_1" />
                    </bpmn:extensionElements></bpmn:userTask>
                  </bpmn:process>
                </bpmn:definitions>
                """);
        when(eforms.importFromCamunda(anyString(), anyString(), anyString(), any(), anyString(), any()))
                .thenReturn(ImportOutcome.CREATED);

        assertThat(service.importFor("RD07", "tester")).isEqualTo(1);

        // Khoá phải là id nguyên văn trong BPMN — đúng khoá mà scaffold ghim vào luật hành động.
        verify(eforms).importFromCamunda(eq("UserTaskForm_1"), eq("UserTaskForm_1"), eq("Thẩm định"),
                anyString(), eq("{\"components\":[]}"), eq("tester"));
    }

    /**
     * Thân thẻ không phải JSON thì phải chặn NGAY, không để lọt vào bảng: lọt rồi thì mỗi lần đọc
     * biểu mẫu đều ném, ở chỗ rất xa nguyên nhân (lúc submit, lúc mở thư viện).
     */
    @Test
    void boQuaFormCoThanKhongPhaiJson() {
        stubProcess("RD07", """
                <?xml version="1.0" encoding="UTF-8"?>
                <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                    xmlns:zeebe="http://camunda.org/schema/zeebe/1.0">
                  <bpmn:process id="RD07">
                    <bpmn:extensionElements>
                      <zeebe:userTaskForm id="Hong_1">day khong phai json</zeebe:userTaskForm>
                    </bpmn:extensionElements>
                  </bpmn:process>
                </bpmn:definitions>
                """);

        assertThat(service.importFor("RD07", "tester")).isZero();
        verify(eforms, never()).importFromCamunda(anyString(), anyString(), anyString(), any(), anyString(), any());
    }

    /** Trùng khoá với biểu mẫu BA tự vẽ ⇒ đếm là "không đổi", tuyệt đối không ghi đè. */
    @Test
    void khongDemDongBiBoQuaVaTrungKhoaVoiBieuMauCuaApp() {
        stubProcess("RD07", """
                <?xml version="1.0" encoding="UTF-8"?>
                <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                    xmlns:zeebe="http://camunda.org/schema/zeebe/1.0">
                  <bpmn:process id="RD07">
                    <bpmn:extensionElements>
                      <zeebe:userTaskForm id="phieu-chu-truong">{"components":[]}</zeebe:userTaskForm>
                    </bpmn:extensionElements>
                  </bpmn:process>
                </bpmn:definitions>
                """);
        when(eforms.importFromCamunda(anyString(), anyString(), anyString(), any(), anyString(), any()))
                .thenReturn(ImportOutcome.SKIPPED_APP_OWNED);

        assertThat(service.importFor("RD07", "tester")).isZero();
    }

    /** Quy trình chưa có XML trong catalog: cảnh báo rồi thôi, không được ném làm hỏng lượt đồng bộ. */
    @Test
    void khongCoXmlThiKhongNem() {
        when(catalogs.findByBpmnProcessId("RD09")).thenReturn(Optional.empty());

        assertThat(service.importFor("RD09", "tester")).isZero();
    }

    private void stubProcess(String bpmnProcessId, String xml) {
        ProcessDefinitionCatalog catalog = new ProcessDefinitionCatalog();
        catalog.setId(UUID.randomUUID());
        catalog.setBpmnProcessId(bpmnProcessId);
        ProcessDefinitionVersion version = new ProcessDefinitionVersion();
        version.setBpmnXml(xml);
        when(catalogs.findByBpmnProcessId(bpmnProcessId)).thenReturn(Optional.of(catalog));
        when(versions.findFirstByCatalogIdOrderByCamundaVersionDesc(catalog.getId()))
                .thenReturn(Optional.of(version));
    }
}

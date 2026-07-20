package vn.vht.qtkhcn.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.domain.ProcessDefinitionCatalog;
import vn.vht.qtkhcn.domain.ProcessDefinitionVersion;
import vn.vht.qtkhcn.repository.ProcessDefinitionCatalogRepository;
import vn.vht.qtkhcn.repository.ProcessDefinitionVersionRepository;

class DeployedBpmnRoutingReaderTest {
    @Test
    void parsesRealTasksRolesFormsAndGatewayOutcomes() throws Exception {
        ProcessDefinitionCatalog catalog = new ProcessDefinitionCatalog();
        catalog.setId(UUID.randomUUID());
        catalog.setBpmnProcessId("RD01_01");
        catalog.setName("Xét duyệt Chủ trương cấp Cơ sở");
        ProcessDefinitionVersion version = new ProcessDefinitionVersion();
        version.setBpmnXml(Files.readString(Path.of("src/main/resources/processes/rd0101.bpmn"), StandardCharsets.UTF_8));

        DeployedBpmnRoutingReader reader = new DeployedBpmnRoutingReader(
                mock(ProcessDefinitionCatalogRepository.class), mock(ProcessDefinitionVersionRepository.class));
        var routing = reader.parse(catalog, version);

        assertThat(routing.code()).isEqualTo("RD01_01");
        assertThat(routing.steps()).hasSize(13);
        var task6 = routing.steps().stream().filter(step -> step.key().equals("Task_6")).findFirst().orElseThrow();
        assertThat(task6.role()).isEqualTo("HDKHCN");
        assertThat(task6.formKey()).isEqualTo("phieu-nhan-xet");
        assertThat(task6.branches()).extracting(branch -> branch.outcome())
                .contains("dong_y_bo_sung", "hieu_chinh", "khong_dong_y");
    }
}

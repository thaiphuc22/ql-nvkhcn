package vn.vht.qtkhcn.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import vn.vht.qtkhcn.camunda.CamundaProcessDefinitionLookup.DeployedProcessDefinition;
import vn.vht.qtkhcn.domain.ProcessDefinitionCatalog;
import vn.vht.qtkhcn.domain.ProcessDefinitionSource;
import vn.vht.qtkhcn.domain.ProcessDefinitionVersion;
import vn.vht.qtkhcn.repository.ProcessDefinitionCatalogRepository;
import vn.vht.qtkhcn.repository.ProcessDefinitionVersionRepository;

class DeployedProcessImportWriterTest {

    private ProcessDefinitionCatalogRepository catalogRepository;
    private ProcessDefinitionVersionRepository versionRepository;
    private DeployedProcessImportWriter writer;

    @BeforeEach
    void setUp() {
        catalogRepository = mock(ProcessDefinitionCatalogRepository.class);
        versionRepository = mock(ProcessDefinitionVersionRepository.class);
        writer = new DeployedProcessImportWriter(catalogRepository, versionRepository,
                mock(org.springframework.context.ApplicationEventPublisher.class));
        when(catalogRepository.save(any(ProcessDefinitionCatalog.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(versionRepository.save(any(ProcessDefinitionVersion.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    /** `source = EXTERNAL` là thứ duy nhất phân biệt bản hút về với bản deploy qua app trên UI. */
    @Test
    void marksTheImportedVersionAsExternalAndKeepsTheXmlForTheRoutingReader() {
        when(catalogRepository.findByBpmnProcessId("ve_ngoai_app")).thenReturn(Optional.empty());

        var result = writer.write(new DeployedProcessDefinition("ve_ngoai_app", "Quy trình vẽ ngoài app",
                "ngoai.bpmn", 2, 99L), "<definitions/>", "tester");

        var saved = ArgumentCaptor.forClass(ProcessDefinitionVersion.class);
        verify(versionRepository).save(saved.capture());
        assertEquals(ProcessDefinitionSource.EXTERNAL, saved.getValue().getSource());
        assertEquals("<definitions/>", saved.getValue().getBpmnXml());
        assertEquals(99L, saved.getValue().getCamundaProcessDefinitionKey());
        assertEquals(2, saved.getValue().getCamundaVersion());
        assertEquals(64, saved.getValue().getChecksumSha256().length());
        // Search API không trả deployment key; 0 là "không biết", không được để null vì cột NOT NULL.
        assertEquals(0L, saved.getValue().getCamundaDeploymentKey());
        assertTrue(result.newCatalog());
        assertEquals("Quy trình vẽ ngoài app", result.name());
    }

    /**
     * Cùng một `bpmnProcessId` deploy qua app rồi lại deploy thẳng lên Camunda phải dùng CHUNG dòng
     * catalog — `bpmn_process_id` là unique, tạo dòng thứ hai sẽ vỡ constraint.
     */
    @Test
    void reusesTheCatalogRowWhenTheProcessWasAlreadyDeployedThroughTheApp() {
        ProcessDefinitionCatalog existing = new ProcessDefinitionCatalog();
        existing.setId(UUID.randomUUID());
        existing.setBpmnProcessId("RD01_01");
        existing.setName("Tên cũ");
        existing.setCreatedAt(OffsetDateTime.now().minusDays(3));
        existing.setUpdatedAt(OffsetDateTime.now().minusDays(3));
        when(catalogRepository.findByBpmnProcessId("RD01_01")).thenReturn(Optional.of(existing));

        var result = writer.write(new DeployedProcessDefinition("RD01_01", "Tên mới trên engine",
                "rd0101.bpmn", 5, 100L), "<definitions/>", "tester");

        assertFalse(result.newCatalog());
        assertEquals(existing.getId(), result.catalogId());
        assertEquals("Tên mới trên engine", existing.getName());
    }

    /** BPMN không bắt buộc đặt tên process; catalog.name là NOT NULL nên phải có fallback. */
    @Test
    void fallsBackToTheProcessIdWhenTheDeployedBpmnHasNoName() {
        when(catalogRepository.findByBpmnProcessId("khong_ten")).thenReturn(Optional.empty());

        var result = writer.write(new DeployedProcessDefinition("khong_ten", null, null, 1, 101L),
                "<definitions/>", null);

        assertEquals("khong_ten", result.name());
        var saved = ArgumentCaptor.forClass(ProcessDefinitionVersion.class);
        verify(versionRepository).save(saved.capture());
        assertEquals("khong_ten.bpmn", saved.getValue().getResourceName());
        assertEquals("dev-api-key", saved.getValue().getImportedBy());
    }
}

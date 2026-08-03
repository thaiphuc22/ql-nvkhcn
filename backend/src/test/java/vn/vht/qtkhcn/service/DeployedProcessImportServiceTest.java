package vn.vht.qtkhcn.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.camunda.CamundaProcessDefinitionLookup;
import vn.vht.qtkhcn.camunda.CamundaProcessDefinitionLookup.DeployedProcessDefinition;
import vn.vht.qtkhcn.camunda.CamundaProcessDefinitionLookup.DeployedProcessPage;
import vn.vht.qtkhcn.domain.ProcessDefinitionVersion;
import vn.vht.qtkhcn.repository.ProcessDefinitionVersionRepository;
import vn.vht.qtkhcn.web.dto.ProcessSyncResponse.ImportedProcess;

class DeployedProcessImportServiceTest {

    private CamundaProcessDefinitionLookup lookup;
    private ProcessDefinitionVersionRepository versionRepository;
    private DeployedProcessImportWriter writer;
    private DeployedProcessImportService service;

    @BeforeEach
    void setUp() {
        lookup = mock(CamundaProcessDefinitionLookup.class);
        versionRepository = mock(ProcessDefinitionVersionRepository.class);
        writer = mock(DeployedProcessImportWriter.class);
        service = new DeployedProcessImportService(lookup, versionRepository, writer);
        when(versionRepository.findByCamundaProcessDefinitionKey(anyLong())).thenReturn(Optional.empty());
    }

    /**
     * Bảo vệ tính idempotent của nút "Đồng bộ": quy trình do CHÍNH APP deploy đã có
     * `camundaProcessDefinitionKey` trong catalog, bấm đồng bộ không được nhập lại nó thành dòng
     * version thứ hai (sẽ đụng unique key và làm hỏng cả lượt).
     */
    @Test
    void skipsDefinitionsTheCatalogAlreadyKnowsByProcessDefinitionKey() {
        when(lookup.listLatest(anyLimit())).thenReturn(new DeployedProcessPage(List.of(
                definition("da_deploy_qua_app", 33L), definition("ve_ngoai_app", 44L)), 2));
        when(versionRepository.findByCamundaProcessDefinitionKey(33L))
                .thenReturn(Optional.of(new ProcessDefinitionVersion()));
        when(lookup.fetchXml(44L)).thenReturn("<definitions/>");
        when(writer.write(any(), eq("<definitions/>"), eq("tester")))
                .thenReturn(imported("ve_ngoai_app", true));

        var response = service.syncFromCamunda("tester");

        assertEquals(2, response.scanned());
        assertEquals(1, response.imported());
        assertEquals(1, response.alreadyKnown());
        assertEquals("ve_ngoai_app", response.importedProcesses().getFirst().bpmnProcessId());
        verify(lookup, never()).fetchXml(33L);
    }

    /**
     * Một quy trình hỏng trên engine không được chặn những quy trình còn lại vào catalog — đây là
     * lý do chính khiến importer trả `failures` thay vì ném lỗi.
     */
    @Test
    void oneUnreadableDefinitionDoesNotStopTheOthers() {
        when(lookup.listLatest(anyLimit())).thenReturn(new DeployedProcessPage(List.of(
                definition("hong", 55L), definition("lanh_lan", 66L)), 2));
        when(lookup.fetchXml(55L)).thenThrow(new IllegalStateException("Không đọc được XML"));
        when(lookup.fetchXml(66L)).thenReturn("<definitions/>");
        when(writer.write(any(), eq("<definitions/>"), any())).thenReturn(imported("lanh_lan", true));

        var response = service.syncFromCamunda("tester");

        assertEquals(1, response.imported());
        assertEquals(1, response.failures().size());
        assertEquals("hong", response.failures().getFirst().bpmnProcessId());
        assertEquals("Không đọc được XML", response.failures().getFirst().message());
        assertEquals("lanh_lan", response.importedProcesses().getFirst().bpmnProcessId());
    }

    /** Quét bị cắt phải nói ra, không được im lặng bỏ sót quy trình. */
    @Test
    void warnsWhenTheEngineHasMoreProcessesThanOneScanCanTake() {
        when(lookup.listLatest(anyLimit()))
                .thenReturn(new DeployedProcessPage(List.of(definition("mot", 77L)), 900));
        when(lookup.fetchXml(77L)).thenReturn("<definitions/>");
        when(writer.write(any(), any(), any())).thenReturn(imported("mot", true));

        var response = service.syncFromCamunda("tester");

        assertEquals(1, response.warnings().size());
        assertTrue(response.warnings().getFirst().contains("900"));
    }

    @Test
    void reportsNothingToDoWhenEveryDeployedProcessIsAlreadyInTheCatalog() {
        when(lookup.listLatest(anyLimit()))
                .thenReturn(new DeployedProcessPage(List.of(definition("da_biet", 88L)), 1));
        when(versionRepository.findByCamundaProcessDefinitionKey(88L))
                .thenReturn(Optional.of(new ProcessDefinitionVersion()));

        var response = service.syncFromCamunda("tester");

        assertEquals(0, response.imported());
        assertEquals(1, response.alreadyKnown());
        assertTrue(response.importedProcesses().isEmpty());
        assertTrue(response.failures().isEmpty());
        assertTrue(response.warnings().isEmpty());
    }

    private static int anyLimit() {
        return DeployedProcessImportService.MAX_SCAN;
    }

    private static DeployedProcessDefinition definition(String bpmnProcessId, long key) {
        return new DeployedProcessDefinition(bpmnProcessId, bpmnProcessId + " name", bpmnProcessId + ".bpmn", 1, key);
    }

    private static ImportedProcess imported(String bpmnProcessId, boolean newCatalog) {
        return new ImportedProcess(UUID.randomUUID(), UUID.randomUUID(), bpmnProcessId, bpmnProcessId, 1, newCatalog);
    }
}

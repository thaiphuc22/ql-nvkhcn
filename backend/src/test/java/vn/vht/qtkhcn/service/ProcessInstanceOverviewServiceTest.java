package vn.vht.qtkhcn.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import jakarta.persistence.EntityNotFoundException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.camunda.CamundaProcessInstanceQuery;
import vn.vht.qtkhcn.domain.ProcessDefinitionCatalog;
import vn.vht.qtkhcn.repository.ProcessDefinitionCatalogRepository;

class ProcessInstanceOverviewServiceTest {

    private static final UUID CATALOG_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final OffsetDateTime NOW = OffsetDateTime.of(2026, 7, 20, 10, 0, 0, 0, ZoneOffset.UTC);

    private CamundaProcessInstanceQuery query;
    private ProcessDefinitionCatalogRepository catalogRepository;
    private ProcessInstanceOverviewService service;

    @BeforeEach
    void setUp() {
        query = mock(CamundaProcessInstanceQuery.class);
        catalogRepository = mock(ProcessDefinitionCatalogRepository.class);
        service = new ProcessInstanceOverviewService(query, catalogRepository);
    }

    @Test
    void countsAndInstancesAreMappedThroughWhenCamundaAnswers() {
        when(query.runningCountsByProcessId()).thenReturn(Map.of("RD01_01", 2));
        when(catalogRepository.findById(CATALOG_ID)).thenReturn(Optional.of(catalog("RD01_01")));
        when(query.runningInstances("RD01_01")).thenReturn(List.of(
                new CamundaProcessInstanceQuery.RunningInstance("42", "HS-2026-004", 3, NOW, false,
                        List.of(new CamundaProcessInstanceQuery.CurrentStep("Task_2", "Thẩm định hồ sơ",
                                "USER_TASK", NOW, false)))));

        var counts = service.runningCounts();
        assertThat(counts.available()).isTrue();
        assertThat(counts.countsByProcessId()).containsEntry("RD01_01", 2);

        var instances = service.runningInstances(CATALOG_ID);
        assertThat(instances.available()).isTrue();
        assertThat(instances.bpmnProcessId()).isEqualTo("RD01_01");
        assertThat(instances.instances()).singleElement().satisfies(instance -> {
            assertThat(instance.processInstanceKey()).isEqualTo("42");
            assertThat(instance.currentSteps()).singleElement()
                    .satisfies(step -> assertThat(step.name()).isEqualTo("Thẩm định hồ sơ"));
        });
    }

    /** Camunda and PostgreSQL fail independently; an engine outage must not 500 the catalog screen. */
    @Test
    void camundaFailureDegradesToUnavailableInsteadOfPropagating() {
        when(query.runningCountsByProcessId()).thenThrow(new IllegalStateException("connection refused"));
        when(catalogRepository.findById(CATALOG_ID)).thenReturn(Optional.of(catalog("RD01_01")));
        when(query.runningInstances("RD01_01")).thenThrow(new IllegalStateException("connection refused"));

        var counts = service.runningCounts();
        assertThat(counts.available()).isFalse();
        assertThat(counts.countsByProcessId()).isEmpty();
        assertThat(counts.message()).contains("connection refused");

        var instances = service.runningInstances(CATALOG_ID);
        assertThat(instances.available()).isFalse();
        assertThat(instances.instances()).isEmpty();
        assertThat(instances.bpmnProcessId()).isEqualTo("RD01_01");
    }

    /** An unknown catalog id is a caller error, not an outage — it must stay a 404, not a silent empty list. */
    @Test
    void unknownCatalogStillThrows() {
        when(catalogRepository.findById(CATALOG_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.runningInstances(CATALOG_ID))
                .isInstanceOf(EntityNotFoundException.class);
    }

    private static ProcessDefinitionCatalog catalog(String bpmnProcessId) {
        ProcessDefinitionCatalog catalog = new ProcessDefinitionCatalog();
        catalog.setId(CATALOG_ID);
        catalog.setBpmnProcessId(bpmnProcessId);
        catalog.setName("Demo");
        return catalog;
    }
}

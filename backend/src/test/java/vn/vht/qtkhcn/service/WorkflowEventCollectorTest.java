package vn.vht.qtkhcn.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionTemplate;
import vn.vht.qtkhcn.domain.WorkflowEventOutbox;
import vn.vht.qtkhcn.domain.WorkflowProcessMapping;
import vn.vht.qtkhcn.repository.WorkflowEventOutboxRepository;
import vn.vht.qtkhcn.repository.WorkflowProcessMappingRepository;
import vn.vht.qtkhcn.workflow.WorkflowRuntimeEvent;
import vn.vht.qtkhcn.workflow.WorkflowRuntimeEventReader;

class WorkflowEventCollectorTest {
    @Test void createsOneDeterministicOutboxRowAndDeduplicatesBySourceKey() {
        WorkflowProcessMappingRepository mappings = mock(WorkflowProcessMappingRepository.class);
        WorkflowEventOutboxRepository outbox = mock(WorkflowEventOutboxRepository.class);
        WorkflowRuntimeEventReader reader = mock(WorkflowRuntimeEventReader.class);
        WorkflowProcessMapping mapping = new WorkflowProcessMapping();
        mapping.setRequestId(UUID.fromString("b89823fa-0000-4000-8000-000000000001"));
        mapping.setHoSoId("HS-1");
        mapping.setProcessInstanceId("1001");
        when(mappings.findAll()).thenReturn(List.of(mapping));
        when(reader.read(1001)).thenReturn(List.of(new WorkflowRuntimeEvent(
                "TASK_CREATED:2001:created", WorkflowRuntimeEvent.EventType.TASK_CREATED,
                OffsetDateTime.parse("2026-07-18T10:00:00Z"),
                Map.of("taskKey", "2001", "taskDefinitionKey", "Task_1"))));
        when(outbox.existsBySourceKey(any())).thenReturn(false);
        PlatformTransactionManager tx = mock(PlatformTransactionManager.class);
        when(tx.getTransaction(any())).thenReturn(mock(TransactionStatus.class));
        WorkflowEventCollector collector = new WorkflowEventCollector(mappings, outbox, reader,
                new ObjectMapper().findAndRegisterModules(), new TransactionTemplate(tx));

        collector.collect();

        var saved = org.mockito.ArgumentCaptor.forClass(WorkflowEventOutbox.class);
        verify(outbox).saveAndFlush(saved.capture());
        assertEquals("1001:TASK_CREATED:2001:created", saved.getValue().getSourceKey());
        assertEquals(WorkflowEventOutbox.Status.PENDING, saved.getValue().getStatus());
        assertEquals(UUID.nameUUIDFromBytes(saved.getValue().getSourceKey()
                .getBytes(java.nio.charset.StandardCharsets.UTF_8)), saved.getValue().getEventId());
    }
}

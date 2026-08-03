package vn.vht.qtkhcn.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.*;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import vn.vht.qtkhcn.camunda.BpmnTestEngineGateway;
import vn.vht.qtkhcn.domain.*;
import vn.vht.qtkhcn.repository.*;
import vn.vht.qtkhcn.web.dto.*;

class BpmnTestSessionServiceTest {
    private static final UUID DRAFT_ID = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final String BPMN = """
            <?xml version="1.0" encoding="UTF-8"?>
            <definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
              xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" targetNamespace="test">
              <process id="safe_test" name="Safe test" isExecutable="true">
                <startEvent id="start"/><sequenceFlow id="f1" sourceRef="start" targetRef="task"/>
                <userTask id="task" name="Review"><extensionElements><zeebe:userTask/></extensionElements></userTask>
                <sequenceFlow id="f2" sourceRef="task" targetRef="end"/><endEvent id="end"/>
              </process>
            </definitions>
            """;
    private final BpmnTestSessionRepository sessions = mock(BpmnTestSessionRepository.class);
    private final ProcessDefinitionDraftRevisionRepository revisions = mock(ProcessDefinitionDraftRevisionRepository.class);
    private final BpmnTestEngineGateway engine = mock(BpmnTestEngineGateway.class);
    private final Map<UUID, BpmnTestSession> store = new HashMap<>();
    private final Clock clock = Clock.fixed(Instant.parse("2026-07-15T10:00:00Z"), ZoneOffset.UTC);
    private BpmnTestSessionService service;

    @BeforeEach
    void setUp() {
        when(sessions.save(any())).thenAnswer(i -> { BpmnTestSession s=i.getArgument(0); store.put(s.getId(), s); return s; });
        when(sessions.findById(any())).thenAnswer(i -> Optional.ofNullable(store.get(i.getArgument(0))));
        when(revisions.findByDraftIdAndRevision(DRAFT_ID, 3)).thenReturn(Optional.of(revision()));
        service = new BpmnTestSessionService(sessions, revisions, new ProcessDefinitionImportValidator(5_242_880),
                engine, new ObjectMapper(), clock, 900, 3600);
    }

    @Test
    void startsFromExactRevisionWithForcedCorrelationAndNeverUsesDomainRepositories() {
        when(engine.deployAndStart(any(), eq("safe-test.bpmn"), anyMap()))
                .thenReturn(new BpmnTestEngineGateway.StartedInstance(101, 202));
        when(engine.snapshot(202)).thenReturn(snapshot("ACTIVE", List.of(), List.of()));

        var result = service.create(new CreateBpmnTestRequest(DRAFT_ID, 3, Map.of("approved", false), 60L), "tester");

        assertEquals(BpmnTestStatus.RUNNING, result.status());
        assertEquals(101, result.processDefinitionKey());
        assertEquals(202, result.processInstanceKey());
        assertTrue(result.correlationId().startsWith("bpmn-test-"));
        verify(engine).deployAndStart(any(), eq("safe-test.bpmn"), argThat(v ->
                result.correlationId().equals(v.get(BpmnTestSessionService.CORRELATION_VARIABLE))));
    }

    @Test
    void unknownWorkerIsReportedBlockedInsteadOfFakeSuccess() {
        when(engine.deployAndStart(any(), anyString(), anyMap()))
                .thenReturn(new BpmnTestEngineGateway.StartedInstance(101, 202));
        var blocked = new BpmnTestSessionResponse.BlockedJob(303, "sendSap", "sap-connector", "mock not allowlisted");
        when(engine.snapshot(202)).thenReturn(snapshot("ACTIVE", List.of(), List.of(blocked)));

        var result = service.create(new CreateBpmnTestRequest(DRAFT_ID, 3, Map.of(), 60L), null);

        assertEquals(BpmnTestStatus.BLOCKED, result.status());
        assertEquals("sap-connector", result.blockedJobs().getFirst().type());
    }

    @Test
    void completesOnlyTaskBelongingToSessionThenRefreshesSnapshot() {
        when(engine.deployAndStart(any(), anyString(), anyMap()))
                .thenReturn(new BpmnTestEngineGateway.StartedInstance(101, 202));
        when(engine.snapshot(202)).thenReturn(snapshot("ACTIVE", List.of(), List.of()));
        UUID id = service.create(new CreateBpmnTestRequest(DRAFT_ID, 3, Map.of(), 60L), null).id();

        service.completeTask(id, 404, Map.of("decision", "approve"));

        verify(engine).completeTask(202, 404, Map.of("decision", "approve"));
    }

    @Test
    void resolveIncidentSetsVariablesThenResolvesInOrderAndRefreshesSnapshot() {
        when(engine.deployAndStart(any(), anyString(), anyMap()))
                .thenReturn(new BpmnTestEngineGateway.StartedInstance(101, 202));
        when(engine.snapshot(202)).thenReturn(snapshot("ACTIVE", List.of(), List.of()));
        UUID id = service.create(new CreateBpmnTestRequest(DRAFT_ID, 3, Map.of(), 60L), null).id();

        var result = service.resolveIncident(id, 707, Map.of("decision", "approve"));

        InOrder order = inOrder(engine);
        order.verify(engine).setVariables(202, Map.of("decision", "approve"));
        order.verify(engine).resolveIncident(707);
        assertEquals(BpmnTestStatus.RUNNING, result.status());
    }

    @Test
    void resolveIncidentFailsClosedAndRecordsFailureWhenEngineRejects() {
        when(engine.deployAndStart(any(), anyString(), anyMap()))
                .thenReturn(new BpmnTestEngineGateway.StartedInstance(101, 202));
        when(engine.snapshot(202)).thenReturn(snapshot("ACTIVE", List.of(), List.of()));
        UUID id = service.create(new CreateBpmnTestRequest(DRAFT_ID, 3, Map.of(), 60L), null).id();
        doThrow(new IllegalStateException("gateway condition still false"))
                .when(engine).resolveIncident(707);

        var error = assertThrows(IllegalStateException.class,
                () -> service.resolveIncident(id, 707, Map.of("decision", "approve")));

        assertTrue(error.getMessage().contains("gateway condition still false"));
        assertTrue(store.get(id).getFailureMessage().contains("Không sửa được incident"));
    }

    @Test
    void resolveIncidentRejectsAlreadyTerminalSession() {
        when(engine.deployAndStart(any(), anyString(), anyMap()))
                .thenReturn(new BpmnTestEngineGateway.StartedInstance(101, 202));
        when(engine.snapshot(202)).thenReturn(snapshot("ACTIVE", List.of(), List.of()));
        UUID id = service.create(new CreateBpmnTestRequest(DRAFT_ID, 3, Map.of(), 60L), null).id();
        service.cancel(id);

        assertThrows(IllegalStateException.class, () -> service.resolveIncident(id, 707, Map.of()));
        verify(engine, never()).setVariables(anyLong(), anyMap());
        verify(engine, never()).resolveIncident(anyLong());
    }

    @Test
    void bypassServiceTaskCompletesJobWithSuppliedVariablesThenRefreshesSnapshot() {
        when(engine.deployAndStart(any(), anyString(), anyMap()))
                .thenReturn(new BpmnTestEngineGateway.StartedInstance(101, 202));
        when(engine.snapshot(202)).thenReturn(snapshot("ACTIVE", List.of(), List.of()));
        UUID id = service.create(new CreateBpmnTestRequest(DRAFT_ID, 3, Map.of(), 60L), null).id();

        var result = service.bypassServiceTask(id, 909, Map.of("draft1Valid", true));

        verify(engine).bypassServiceTask(202, 909, Map.of("draft1Valid", true));
        assertEquals(BpmnTestStatus.RUNNING, result.status());
    }

    @Test
    void bypassServiceTaskFailsClosedAndRecordsFailureWhenEngineRejects() {
        when(engine.deployAndStart(any(), anyString(), anyMap()))
                .thenReturn(new BpmnTestEngineGateway.StartedInstance(101, 202));
        when(engine.snapshot(202)).thenReturn(snapshot("ACTIVE", List.of(), List.of()));
        UUID id = service.create(new CreateBpmnTestRequest(DRAFT_ID, 3, Map.of(), 60L), null).id();
        doThrow(new IllegalStateException("job không còn tồn tại"))
                .when(engine).bypassServiceTask(202, 909, Map.of("draft1Valid", true));

        var error = assertThrows(IllegalStateException.class,
                () -> service.bypassServiceTask(id, 909, Map.of("draft1Valid", true)));

        assertTrue(error.getMessage().contains("job không còn tồn tại"));
        assertTrue(store.get(id).getFailureMessage().contains("Không bypass được service task"));
    }

    @Test
    void bypassServiceTaskRejectsAlreadyTerminalSession() {
        when(engine.deployAndStart(any(), anyString(), anyMap()))
                .thenReturn(new BpmnTestEngineGateway.StartedInstance(101, 202));
        when(engine.snapshot(202)).thenReturn(snapshot("ACTIVE", List.of(), List.of()));
        UUID id = service.create(new CreateBpmnTestRequest(DRAFT_ID, 3, Map.of(), 60L), null).id();
        service.cancel(id);

        assertThrows(IllegalStateException.class, () -> service.bypassServiceTask(id, 909, Map.of()));
        verify(engine, never()).bypassServiceTask(anyLong(), anyLong(), anyMap());
    }

    @Test
    void cancelIsIdempotentAndTerminal() {
        when(engine.deployAndStart(any(), anyString(), anyMap()))
                .thenReturn(new BpmnTestEngineGateway.StartedInstance(101, 202));
        when(engine.snapshot(202)).thenReturn(snapshot("ACTIVE", List.of(), List.of()));
        UUID id = service.create(new CreateBpmnTestRequest(DRAFT_ID, 3, Map.of(), 60L), null).id();

        assertEquals(BpmnTestStatus.CANCELLED, service.cancel(id).status());
        assertEquals(BpmnTestStatus.CANCELLED, service.cancel(id).status());
        verify(engine, times(1)).cancel(202);
    }

    @Test
    void unavailableDedicatedEngineFailsClosedAndRecordsFailure() {
        when(engine.deployAndStart(any(), anyString(), anyMap())).thenThrow(new IllegalStateException("test engine offline"));

        var error = assertThrows(IllegalStateException.class, () -> service.create(
                new CreateBpmnTestRequest(DRAFT_ID, 3, Map.of(), 60L), null));

        assertTrue(error.getMessage().contains("test engine offline"));
        assertEquals(1, store.size());
        assertEquals(BpmnTestStatus.FAILED, store.values().iterator().next().getStatus());
    }

    @Test
    void rejectsTtlAboveSafetyMaximumBeforeDeployment() {
        assertThrows(IllegalArgumentException.class, () -> service.create(
                new CreateBpmnTestRequest(DRAFT_ID, 3, Map.of(), 3601L), null));
        verifyNoInteractions(engine);
    }

    @Test
    void invalidXmlAndUnserializableVariablesFailBeforeEngineDeployment() {
        ProcessDefinitionDraftRevision invalid = revision();
        invalid.setBpmnXml("<definitions><broken>");
        when(revisions.findByDraftIdAndRevision(DRAFT_ID, 4)).thenReturn(Optional.of(invalid));
        assertThrows(ProcessImportException.class, () -> service.create(
                new CreateBpmnTestRequest(DRAFT_ID, 4, Map.of(), 60L), null));

        Map<String, Object> cyclic = new HashMap<>();
        cyclic.put("self", cyclic);
        assertThrows(IllegalArgumentException.class, () -> service.create(
                new CreateBpmnTestRequest(DRAFT_ID, 3, cyclic, 60L), null));
        verifyNoInteractions(engine);
    }

    @Test
    void schedulerCancelsExpiredSessionAndRecordsTimedOutAudit() {
        when(engine.deployAndStart(any(), anyString(), anyMap()))
                .thenReturn(new BpmnTestEngineGateway.StartedInstance(101, 202));
        when(engine.snapshot(202)).thenReturn(snapshot("ACTIVE", List.of(), List.of()));
        UUID id = service.create(new CreateBpmnTestRequest(DRAFT_ID, 3, Map.of(), 60L), null).id();
        BpmnTestSession session = store.get(id);
        session.setExpiresAt(OffsetDateTime.ofInstant(clock.instant().minusSeconds(1), ZoneOffset.UTC));
        when(sessions.findByExpiresAtBeforeAndStatusIn(any(), anyList())).thenReturn(List.of(session));

        service.expireSessions();

        verify(engine).cancel(202);
        assertEquals(BpmnTestStatus.TIMED_OUT, session.getStatus());
        assertNotNull(session.getEndedAt());
    }

    @Test
    void incidentSnapshotIsExposedWithoutPretendingCompletion() {
        when(engine.deployAndStart(any(), anyString(), anyMap()))
                .thenReturn(new BpmnTestEngineGateway.StartedInstance(101, 202));
        var incident = new BpmnTestSessionResponse.Incident(505, "serviceTask", "JOB_NO_RETRIES",
                "mock worker failed", "ACTIVE");
        when(engine.snapshot(202)).thenReturn(new BpmnTestEngineGateway.EngineSnapshot("ACTIVE", List.of(),
                List.of(), Map.of("attempt", 3), List.of(incident), List.of()));

        var result = service.create(new CreateBpmnTestRequest(DRAFT_ID, 3, Map.of(), 60L), null);

        assertEquals(BpmnTestStatus.RUNNING, result.status());
        assertEquals("JOB_NO_RETRIES", result.incidents().getFirst().type());
        assertEquals(3, result.variables().get("attempt"));
    }

    @Test
    void snapshotOutageFailsClosedAndKeepsAuditMessageForRetry() {
        when(engine.deployAndStart(any(), anyString(), anyMap()))
                .thenReturn(new BpmnTestEngineGateway.StartedInstance(101, 202));
        when(engine.snapshot(202)).thenThrow(new IllegalStateException("REST unavailable"));

        var error = assertThrows(IllegalStateException.class, () -> service.create(
                new CreateBpmnTestRequest(DRAFT_ID, 3, Map.of(), 60L), null));

        BpmnTestSession session = store.values().iterator().next();
        assertTrue(error.getMessage().contains("Không đọc được snapshot test engine"));
        assertEquals(BpmnTestStatus.RUNNING, session.getStatus());
        assertTrue(session.getFailureMessage().contains("snapshot test engine"));
    }

    private static ProcessDefinitionDraftRevision revision() {
        var r = new ProcessDefinitionDraftRevision(); r.setId(UUID.randomUUID()); r.setDraftId(DRAFT_ID);
        r.setRevision(3); r.setResourceName("safe-test.bpmn"); r.setBpmnProcessId("safe_test");
        r.setName("Safe test"); r.setBpmnXml(BPMN); r.setChecksumSha256("a".repeat(64));
        r.setStatus(ProcessDefinitionDraftStatus.VALID); r.setActor("editor"); r.setCreatedAt(OffsetDateTime.now());
        return r;
    }

    private static BpmnTestEngineGateway.EngineSnapshot snapshot(String state,
            List<BpmnTestSessionResponse.Task> tasks, List<BpmnTestSessionResponse.BlockedJob> blocked) {
        return new BpmnTestEngineGateway.EngineSnapshot(state, List.of(), tasks, Map.of(), List.of(), blocked);
    }
}

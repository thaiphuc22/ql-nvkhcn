package vn.vht.qtkhcn.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import vn.vht.qtkhcn.domain.ProcessDefinitionDraft;
import vn.vht.qtkhcn.domain.ProcessDefinitionDraftRevision;
import vn.vht.qtkhcn.domain.ProcessDefinitionDraftStatus;
import vn.vht.qtkhcn.domain.ProcessDefinitionStatus;
import vn.vht.qtkhcn.repository.ProcessDefinitionDraftRepository;
import vn.vht.qtkhcn.repository.ProcessDefinitionDraftRevisionRepository;
import vn.vht.qtkhcn.web.dto.CreateProcessDefinitionDraftRequest;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionImportResponse;
import vn.vht.qtkhcn.web.dto.UpdateProcessDefinitionDraftRequest;

class ProcessDefinitionDraftServiceTest {
    private static final String XML = "<xml>one</xml>";
    private ProcessDefinitionDraftRepository drafts;
    private ProcessDefinitionDraftRevisionRepository revisions;
    private ProcessDefinitionImportValidator validator;
    private ProcessDefinitionService publisher;
    private ProcessDefinitionDraftService service;

    @BeforeEach
    void setUp() {
        drafts = mock(ProcessDefinitionDraftRepository.class);
        revisions = mock(ProcessDefinitionDraftRevisionRepository.class);
        validator = mock(ProcessDefinitionImportValidator.class);
        publisher = mock(ProcessDefinitionService.class);
        service = new ProcessDefinitionDraftService(drafts, revisions, validator, publisher);
        when(drafts.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(revisions.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(revisions.findByDraftIdOrderByRevisionDesc(any())).thenReturn(List.of());
    }

    @Test
    void createAndSaveDraftNeverCallCamundaPublication() {
        var created = service.create(new CreateProcessDefinitionDraftRequest(
                "demo.bpmn", "demo", "Demo", XML), "alice");
        ProcessDefinitionDraft draft = draft(created.id(), 0, XML);
        when(drafts.findByIdForUpdate(draft.getId())).thenReturn(Optional.of(draft));

        var saved = service.update(draft.getId(), new UpdateProcessDefinitionDraftRequest(
                0, "demo.bpmn", "demo", "Demo 2", "<xml>two</xml>"), "bob");

        assertEquals(ProcessDefinitionDraftStatus.DRAFT, saved.status());
        verify(publisher, never()).publishValidated(any(), any());
        verify(revisions, times(2)).save(any(ProcessDefinitionDraftRevision.class));
    }

    @Test
    void importUploadCreatesDraftAndNeverCallsCamundaPublication() {
        var file = new MockMultipartFile("file", "demo.bpmn", "application/xml", XML.getBytes());
        when(validator.validate(file)).thenReturn(validated());

        var created = service.importBpmn(file, " demo ", " Demo imported ", "alice");

        assertEquals("demo", created.bpmnProcessId());
        assertEquals("Demo imported", created.name());
        assertEquals(ProcessDefinitionDraftStatus.DRAFT, created.status());
        verify(drafts, times(1)).saveAndFlush(any(ProcessDefinitionDraft.class));
        verify(revisions, times(1)).save(any(ProcessDefinitionDraftRevision.class));
        verify(publisher, never()).publishValidated(any(), any());
    }

    @Test
    void importUploadRejectsProcessIdMismatchWithoutWriting() {
        var file = new MockMultipartFile("file", "demo.bpmn", "application/xml", XML.getBytes());
        when(validator.validate(file)).thenReturn(validated());

        assertThrows(ProcessImportException.class,
                () -> service.importBpmn(file, "other", "Demo", "alice"));

        verify(drafts, never()).saveAndFlush(any());
        verify(revisions, never()).save(any());
        verify(publisher, never()).publishValidated(any(), any());
    }

    @Test
    void listDraftsFiltersCaseInsensitivelyAndKeepsRepositoryOrder() {
        ProcessDefinitionDraft newest = draft(UUID.randomUUID(), 2, XML);
        newest.setBpmnProcessId("Process_RD0202");
        newest.setName("Xét duyệt cấp Tập đoàn");
        newest.setStatus(ProcessDefinitionDraftStatus.VALID);
        ProcessDefinitionDraft older = draft(UUID.randomUUID(), 0, XML);
        older.setBpmnProcessId("other");
        when(drafts.findAllByOrderByUpdatedAtDesc()).thenReturn(List.of(newest, older));

        var result = service.list(ProcessDefinitionDraftStatus.VALID, " process_rd0202 ", "TẬP ĐOÀN");

        assertEquals(1, result.size());
        assertEquals(newest.getId(), result.get(0).id());
        assertEquals("Process_RD0202", result.get(0).bpmnProcessId());
    }

    @Test
    void staleSaveReturnsConflictBeforeWriting() {
        ProcessDefinitionDraft draft = draft(UUID.randomUUID(), 4, XML);
        when(drafts.findByIdForUpdate(draft.getId())).thenReturn(Optional.of(draft));

        assertThrows(DraftRevisionConflictException.class, () -> service.update(draft.getId(),
                new UpdateProcessDefinitionDraftRequest(3, "demo.bpmn", "demo", "Demo", "changed"), "bob"));

        verify(drafts, never()).saveAndFlush(any());
        verify(revisions, never()).save(any());
        verify(publisher, never()).publishValidated(any(), any());
    }

    @Test
    void identicalSaveIsIdempotentAndCreatesNoRevision() {
        ProcessDefinitionDraft draft = draft(UUID.randomUUID(), 2, XML);
        when(drafts.findByIdForUpdate(draft.getId())).thenReturn(Optional.of(draft));

        var response = service.update(draft.getId(), new UpdateProcessDefinitionDraftRequest(
                2, "demo.bpmn", "demo", "Demo", XML), "bob");

        assertEquals(2, response.revision());
        verify(drafts, never()).saveAndFlush(any());
        verify(revisions, never()).save(any());
    }

    @Test
    void validateChangesStatusButDoesNotPublish() {
        ProcessDefinitionDraft draft = draft(UUID.randomUUID(), 1, XML);
        when(drafts.findByIdForUpdate(draft.getId())).thenReturn(Optional.of(draft));
        when(validator.validate(XML, "demo.bpmn")).thenReturn(validated());

        var response = service.validate(draft.getId(), 1, "validator");

        assertEquals(true, response.valid());
        assertEquals(ProcessDefinitionDraftStatus.VALID, response.status());
        verify(publisher, never()).publishValidated(any(), any());
    }

    @Test
    void validateReturnsStructuredIssuesAndMarksDraftInvalidOnError() {
        ProcessDefinitionDraft draft = draft(UUID.randomUUID(), 1, XML);
        when(drafts.findByIdForUpdate(draft.getId())).thenReturn(Optional.of(draft));
        ValidatedBpmn invalid = new ValidatedBpmn(XML.getBytes(), XML, "demo.bpmn", "demo", "Demo",
                ProcessDefinitionImportValidator.checksum(XML), List.of("Gateway chỉ có một nhánh."), List.of(
                        new BpmnLintIssue("GATEWAY_SINGLE_OUTGOING", BpmnIssueSeverity.WARNING,
                                "Gateway chỉ có một nhánh.", "gate", "Kiểm tra"),
                        new BpmnLintIssue("ACTIVE_PATH_DEAD_END", BpmnIssueSeverity.ERROR,
                                "Luồng kết thúc cụt.", "task", "Duyệt")));
        when(validator.validate(XML, "demo.bpmn")).thenReturn(invalid);

        var response = service.validate(draft.getId(), 1, "validator");

        assertEquals(false, response.valid());
        assertEquals(ProcessDefinitionDraftStatus.INVALID, response.status());
        assertEquals(2, response.issues().size());
        assertEquals("ACTIVE_PATH_DEAD_END", response.issues().get(1).code());
    }

    @Test
    void deployFailureDoesNotMarkDraftDeployed() {
        ProcessDefinitionDraft draft = draft(UUID.randomUUID(), 1, XML);
        when(drafts.findByIdForUpdate(draft.getId())).thenReturn(Optional.of(draft));
        when(validator.validate(XML, "demo.bpmn")).thenReturn(validated());
        when(publisher.publishValidated(any(), any())).thenThrow(new ProcessImportException(
                ProcessImportException.Kind.DEPLOYMENT, "offline", List.of("connection refused")));

        assertThrows(ProcessImportException.class, () -> service.deploy(draft.getId(), 1, "deployer"));

        assertEquals(ProcessDefinitionDraftStatus.DRAFT, draft.getStatus());
        verify(drafts, never()).saveAndFlush(any());
        verify(revisions, never()).save(any());
    }

    @Test
    void deployPublishesExactlyOnceAndCorrelatesVersion() {
        ProcessDefinitionDraft draft = draft(UUID.randomUUID(), 1, XML);
        UUID versionId = UUID.randomUUID();
        when(drafts.findByIdForUpdate(draft.getId())).thenReturn(Optional.of(draft));
        when(validator.validate(XML, "demo.bpmn")).thenReturn(validated());
        when(publisher.publishValidated(any(), any())).thenReturn(new ProcessDefinitionImportResponse(
                UUID.randomUUID(), versionId, "demo", "Demo", "demo.bpmn", 10, 11, 3,
                ProcessDefinitionStatus.DEPLOYED, "a".repeat(64), "deployer", OffsetDateTime.now(), List.of()));

        service.deploy(draft.getId(), 1, "deployer");

        assertEquals(ProcessDefinitionDraftStatus.DEPLOYED, draft.getStatus());
        assertEquals(versionId, draft.getDeployedVersionId());
        verify(publisher, times(1)).publishValidated(any(), any());
    }

    @Test
    void deleteRemovesDraftAndItsRevisions() {
        ProcessDefinitionDraft draft = draft(UUID.randomUUID(), 2, XML);
        when(drafts.findByIdForUpdate(draft.getId())).thenReturn(Optional.of(draft));

        service.delete(draft.getId(), 2);

        verify(revisions, times(1)).deleteByDraftId(draft.getId());
        verify(drafts, times(1)).delete(draft);
    }

    @Test
    void deleteWithStaleRevisionThrowsConflictWithoutDeleting() {
        ProcessDefinitionDraft draft = draft(UUID.randomUUID(), 4, XML);
        when(drafts.findByIdForUpdate(draft.getId())).thenReturn(Optional.of(draft));

        assertThrows(DraftRevisionConflictException.class, () -> service.delete(draft.getId(), 3));

        verify(revisions, never()).deleteByDraftId(any());
        verify(drafts, never()).delete(any());
    }

    @Test
    void deleteDeployedDraftIsRejected() {
        ProcessDefinitionDraft draft = draft(UUID.randomUUID(), 1, XML);
        draft.setStatus(ProcessDefinitionDraftStatus.DEPLOYED);
        when(drafts.findByIdForUpdate(draft.getId())).thenReturn(Optional.of(draft));

        assertThrows(IllegalStateException.class, () -> service.delete(draft.getId(), 1));

        verify(revisions, never()).deleteByDraftId(any());
        verify(drafts, never()).delete(any());
    }

    private static ProcessDefinitionDraft draft(UUID id, long revision, String xml) {
        ProcessDefinitionDraft draft = new ProcessDefinitionDraft();
        draft.setId(id);
        draft.setResourceName("demo.bpmn");
        draft.setBpmnProcessId("demo");
        draft.setName("Demo");
        draft.setBpmnXml(xml);
        draft.setChecksumSha256(ProcessDefinitionImportValidator.checksum(xml));
        draft.setStatus(ProcessDefinitionDraftStatus.DRAFT);
        draft.setRevision(revision);
        draft.setCreatedBy("alice");
        draft.setCreatedAt(OffsetDateTime.now());
        draft.setUpdatedBy("alice");
        draft.setUpdatedAt(OffsetDateTime.now());
        return draft;
    }

    private static ValidatedBpmn validated() {
        return new ValidatedBpmn(XML.getBytes(), XML, "demo.bpmn", "demo", "Demo",
                ProcessDefinitionImportValidator.checksum(XML), List.of());
    }
}

package vn.vht.qtkhcn.service;

import jakarta.persistence.EntityNotFoundException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.vht.qtkhcn.domain.ProcessDefinitionDraft;
import vn.vht.qtkhcn.domain.ProcessDefinitionDraftRevision;
import vn.vht.qtkhcn.domain.ProcessDefinitionDraftStatus;
import vn.vht.qtkhcn.repository.ProcessDefinitionDraftRepository;
import vn.vht.qtkhcn.repository.ProcessDefinitionDraftRevisionRepository;
import vn.vht.qtkhcn.web.dto.CreateProcessDefinitionDraftRequest;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionDraftResponse;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionDraftRevisionResponse;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionDraftSummaryResponse;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionDraftValidationResponse;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionImportResponse;
import vn.vht.qtkhcn.web.dto.UpdateProcessDefinitionDraftRequest;

@Service
public class ProcessDefinitionDraftService {
    private final ProcessDefinitionDraftRepository draftRepository;
    private final ProcessDefinitionDraftRevisionRepository revisionRepository;
    private final ProcessDefinitionImportValidator validator;
    private final ProcessDefinitionService processDefinitionService;
    private final BpmnSourceExportService bpmnSourceExportService;

    public ProcessDefinitionDraftService(ProcessDefinitionDraftRepository draftRepository,
            ProcessDefinitionDraftRevisionRepository revisionRepository,
            ProcessDefinitionImportValidator validator,
            ProcessDefinitionService processDefinitionService,
            BpmnSourceExportService bpmnSourceExportService) {
        this.draftRepository = draftRepository;
        this.revisionRepository = revisionRepository;
        this.validator = validator;
        this.processDefinitionService = processDefinitionService;
        this.bpmnSourceExportService = bpmnSourceExportService;
    }

    @Transactional
    public ProcessDefinitionDraftResponse create(CreateProcessDefinitionDraftRequest request, String actorHeader) {
        OffsetDateTime now = now();
        String actor = ProcessDefinitionService.normalizeActor(actorHeader);
        ProcessDefinitionDraft draft = new ProcessDefinitionDraft();
        draft.setId(UUID.randomUUID());
        applyContent(draft, request.resourceName(), request.bpmnProcessId(), request.name(), request.bpmnXml());
        draft.setStatus(ProcessDefinitionDraftStatus.DRAFT);
        draft.setCreatedBy(actor);
        draft.setCreatedAt(now);
        draft.setUpdatedBy(actor);
        draft.setUpdatedAt(now);
        draft = draftRepository.saveAndFlush(draft);
        revisionRepository.save(snapshot(draft, actor, now));
        return response(draft);
    }

    /** Imports an uploaded BPMN as an application draft; this path never publishes to Camunda. */
    @Transactional
    public ProcessDefinitionDraftResponse importBpmn(MultipartFile file, String requestedProcessId,
            String requestedName, String actorHeader) {
        String processId = requiredMetadata(requestedProcessId, "Mã quy trình", 255);
        String name = requiredMetadata(requestedName, "Tên quy trình", 512);
        ValidatedBpmn validated = validator.validate(file);
        if (!processId.equals(validated.bpmnProcessId())) {
            throw new ProcessImportException(ProcessImportException.Kind.VALIDATION,
                    "Mã quy trình không khớp BPMN XML.",
                    List.of("BPMN process id trong XML (%s) không khớp mã quy trình đã nhập (%s)."
                            .formatted(validated.bpmnProcessId(), processId)));
        }
        return create(new CreateProcessDefinitionDraftRequest(validated.resourceName(), processId, name,
                validated.xml()), actorHeader);
    }

    @Transactional(readOnly = true)
    public List<ProcessDefinitionDraftSummaryResponse> list(ProcessDefinitionDraftStatus status,
            String bpmnProcessId, String query) {
        String normalizedProcessId = normalizeFilter(bpmnProcessId);
        String normalizedQuery = normalizeFilter(query);
        return draftRepository.findAllByOrderByUpdatedAtDesc().stream()
                .filter(draft -> status == null || draft.getStatus() == status)
                .filter(draft -> normalizedProcessId.isEmpty()
                        || draft.getBpmnProcessId().toLowerCase(Locale.ROOT).equals(normalizedProcessId))
                .filter(draft -> normalizedQuery.isEmpty()
                        || draft.getBpmnProcessId().toLowerCase(Locale.ROOT).contains(normalizedQuery)
                        || draft.getName().toLowerCase(Locale.ROOT).contains(normalizedQuery))
                .map(ProcessDefinitionDraftSummaryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProcessDefinitionDraftResponse get(UUID id) {
        return response(draft(id));
    }

    @Transactional
    public ProcessDefinitionDraftResponse update(UUID id, UpdateProcessDefinitionDraftRequest request,
            String actorHeader) {
        ProcessDefinitionDraft draft = mutableDraftForUpdate(id);
        assertRevision(draft, request.expectedRevision());
        boolean identical = Objects.equals(draft.getResourceName(), request.resourceName().trim())
                && Objects.equals(draft.getBpmnProcessId(), request.bpmnProcessId().trim())
                && Objects.equals(draft.getName(), request.name().trim())
                && Objects.equals(draft.getChecksumSha256(), ProcessDefinitionImportValidator.checksum(request.bpmnXml()));
        if (identical) {
            return response(draft);
        }
        String actor = ProcessDefinitionService.normalizeActor(actorHeader);
        OffsetDateTime now = now();
        applyContent(draft, request.resourceName(), request.bpmnProcessId(), request.name(), request.bpmnXml());
        draft.setStatus(ProcessDefinitionDraftStatus.DRAFT);
        draft.setValidatedAt(null);
        draft.setUpdatedBy(actor);
        draft.setUpdatedAt(now);
        draft = draftRepository.saveAndFlush(draft);
        revisionRepository.save(snapshot(draft, actor, now));
        return response(draft);
    }

    @Transactional
    public ProcessDefinitionDraftValidationResponse validate(UUID id, long expectedRevision, String actorHeader) {
        ProcessDefinitionDraft draft = mutableDraftForUpdate(id);
        assertRevision(draft, expectedRevision);
        String actor = ProcessDefinitionService.normalizeActor(actorHeader);
        OffsetDateTime now = now();
        List<String> warnings = List.of();
        List<String> errors = List.of();
        List<BpmnLintIssue> issues = List.of();
        boolean valid;
        try {
            ValidatedBpmn validated = validator.validate(draft.getBpmnXml(), draft.getResourceName());
            if (!draft.getBpmnProcessId().equals(validated.bpmnProcessId())) {
                errors = List.of("BPMN process id trong XML (%s) không khớp metadata draft (%s)."
                        .formatted(validated.bpmnProcessId(), draft.getBpmnProcessId()));
                issues = List.of(new BpmnLintIssue("PROCESS_ID_MISMATCH", BpmnIssueSeverity.ERROR,
                        errors.getFirst(), validated.bpmnProcessId(), validated.processName()));
                valid = false;
            } else {
                warnings = validated.warnings();
                issues = validated.issues();
                errors = issues.stream().filter(issue -> issue.severity() == BpmnIssueSeverity.ERROR)
                        .map(BpmnLintIssue::message).toList();
                valid = errors.isEmpty();
            }
        } catch (ProcessImportException e) {
            errors = e.getErrors();
            String code = e.getValidationCode() == null ? "XML_INVALID" : e.getValidationCode();
            issues = errors.stream().map(message -> new BpmnLintIssue(code, BpmnIssueSeverity.ERROR,
                    message, null, null)).toList();
            valid = false;
        }
        draft.setStatus(valid ? ProcessDefinitionDraftStatus.VALID : ProcessDefinitionDraftStatus.INVALID);
        draft.setValidatedAt(now);
        draft.setUpdatedBy(actor);
        draft.setUpdatedAt(now);
        draft = draftRepository.saveAndFlush(draft);
        revisionRepository.save(snapshot(draft, actor, now));
        return new ProcessDefinitionDraftValidationResponse(valid, draft.getRevision(), draft.getStatus(),
                draft.getChecksumSha256(), warnings, errors, issues);
    }

    @Transactional
    public ProcessDefinitionImportResponse deploy(UUID id, long expectedRevision, String actorHeader) {
        ProcessDefinitionDraft draft = mutableDraftForUpdate(id);
        assertRevision(draft, expectedRevision);
        ValidatedBpmn validated = validator.validate(draft.getBpmnXml(), draft.getResourceName());
        if (!draft.getBpmnProcessId().equals(validated.bpmnProcessId())) {
            throw new ProcessImportException(ProcessImportException.Kind.VALIDATION,
                    "Metadata draft không khớp BPMN XML.",
                    List.of("BPMN process id trong XML (%s) không khớp metadata draft (%s)."
                            .formatted(validated.bpmnProcessId(), draft.getBpmnProcessId())));
        }
        String actor = ProcessDefinitionService.normalizeActor(actorHeader);
        ProcessDefinitionImportResponse published = processDefinitionService.publishValidated(validated, actor);
        OffsetDateTime now = now();
        draft.setStatus(ProcessDefinitionDraftStatus.DEPLOYED);
        draft.setDeployedVersionId(published.versionId());
        draft.setValidatedAt(now);
        draft.setUpdatedBy(actor);
        draft.setUpdatedAt(now);
        draft = draftRepository.saveAndFlush(draft);
        revisionRepository.save(snapshot(draft, actor, now));
        bpmnSourceExportService.exportAfterDeploy(draft.getResourceName(), draft.getBpmnXml());
        return published;
    }

    @Transactional
    public void delete(UUID id, long expectedRevision) {
        ProcessDefinitionDraft draft = mutableDraftForUpdate(id);
        assertRevision(draft, expectedRevision);
        revisionRepository.deleteByDraftId(draft.getId());
        draftRepository.delete(draft);
    }

    private ProcessDefinitionDraft mutableDraftForUpdate(UUID id) {
        ProcessDefinitionDraft draft = draftRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy process definition draft " + id));
        if (draft.getStatus() == ProcessDefinitionDraftStatus.DEPLOYED) {
            throw new IllegalStateException("Draft đã deploy là bất biến; hãy tạo draft mới để chỉnh sửa.");
        }
        return draft;
    }

    private ProcessDefinitionDraft draft(UUID id) {
        return draftRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy process definition draft " + id));
    }

    private ProcessDefinitionDraftResponse response(ProcessDefinitionDraft draft) {
        List<ProcessDefinitionDraftRevisionResponse> revisions = revisionRepository
                .findByDraftIdOrderByRevisionDesc(draft.getId()).stream()
                .map(ProcessDefinitionDraftRevisionResponse::from).toList();
        return ProcessDefinitionDraftResponse.from(draft, revisions);
    }

    private static void assertRevision(ProcessDefinitionDraft draft, long expected) {
        if (draft.getRevision() != expected) {
            throw new DraftRevisionConflictException(expected, draft.getRevision());
        }
    }

    private static void applyContent(ProcessDefinitionDraft draft, String resourceName, String processId,
            String name, String xml) {
        draft.setResourceName(resourceName.trim());
        draft.setBpmnProcessId(processId.trim());
        draft.setName(name.trim());
        draft.setBpmnXml(xml);
        draft.setChecksumSha256(ProcessDefinitionImportValidator.checksum(xml));
    }

    private static String requiredMetadata(String value, String label, int maxLength) {
        String normalized = value == null ? "" : value.trim();
        if (normalized.isEmpty()) {
            throw new ProcessImportException(ProcessImportException.Kind.VALIDATION,
                    "Metadata quy trình không hợp lệ.", List.of(label + " là bắt buộc."));
        }
        if (normalized.length() > maxLength) {
            throw new ProcessImportException(ProcessImportException.Kind.VALIDATION,
                    "Metadata quy trình không hợp lệ.",
                    List.of(label + " không được vượt quá " + maxLength + " ký tự."));
        }
        return normalized;
    }

    private static String normalizeFilter(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private static ProcessDefinitionDraftRevision snapshot(ProcessDefinitionDraft draft, String actor,
            OffsetDateTime createdAt) {
        ProcessDefinitionDraftRevision revision = new ProcessDefinitionDraftRevision();
        revision.setId(UUID.randomUUID());
        revision.setDraftId(draft.getId());
        revision.setRevision(draft.getRevision());
        revision.setResourceName(draft.getResourceName());
        revision.setBpmnProcessId(draft.getBpmnProcessId());
        revision.setName(draft.getName());
        revision.setBpmnXml(draft.getBpmnXml());
        revision.setChecksumSha256(draft.getChecksumSha256());
        revision.setStatus(draft.getStatus());
        revision.setActor(actor);
        revision.setCreatedAt(createdAt);
        return revision;
    }

    private static OffsetDateTime now() {
        return OffsetDateTime.now(ZoneOffset.UTC);
    }
}

package vn.vht.qtkhcn.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.domain.ActionAvailabilityPolicy;
import vn.vht.qtkhcn.domain.ActionAvailabilityPolicyStatus;
import vn.vht.qtkhcn.domain.ActionOutcomeKeyword;
import vn.vht.qtkhcn.domain.ActionFormBundleItem;
import vn.vht.qtkhcn.domain.ActionFormBundleSnapshot;
import vn.vht.qtkhcn.domain.ActionExceptionPolicy;
import vn.vht.qtkhcn.domain.ActionStudioAction;
import vn.vht.qtkhcn.domain.ActionStudioAudit;
import vn.vht.qtkhcn.domain.ActionVariableBinding;
import vn.vht.qtkhcn.domain.Eform;
import vn.vht.qtkhcn.repository.ActionAvailabilityPolicyRepository;
import vn.vht.qtkhcn.repository.ActionOutcomeKeywordRepository;
import vn.vht.qtkhcn.repository.ActionExceptionPolicyRepository;
import vn.vht.qtkhcn.repository.ActionStudioActionRepository;
import vn.vht.qtkhcn.repository.ActionStudioAuditRepository;
import vn.vht.qtkhcn.repository.EformRepository;
import vn.vht.qtkhcn.repository.ActionFormBundleSnapshotRepository;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ActionResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.AuditResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.AvailabilityRequest;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.AvailabilityResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.BulkDeleteAvailabilityRequest;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.BulkDeleteAvailabilityResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.BulkStatusAvailabilityRequest;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.BulkStatusAvailabilityResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.CatalogOptionResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ConfigResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ExceptionRequest;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ExceptionResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.FormBundleItemResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.FormBundleResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.FormBundleItemRequest;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.FormBundleRequest;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.PresentationRequest;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.PresentationResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ProcessRoutingResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ProcessStepResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ReconcileResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ReferenceDataResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ScaffoldResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.SimulatedActionResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.SimulationRequest;

@Service
public class ActionStudioService {
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final Set<String> ACTION_TYPES = Set.of("STANDARD", "SUPPORT", "EXCEPTION");
    private static final Set<String> UI_GROUPS = Set.of("PRIMARY", "MORE", "EXCEPTION");
    private static final Set<String> TONES = Set.of("primary", "default", "danger", "warning");
    private static final Set<String> SURFACES = Set.of("DOSSIER_DETAIL", "WORKLIST", "MOBILE", "ACTION_STUDIO");
    private static final Set<String> STATUSES = Set.of("draft", "processing", "approved", "rejected");
    private static final Set<String> TARGET_TYPES = Set.of("STEP", "STATUS", "COMPLETE");
    private static final Set<String> OBJECT_TYPES = Set.of("DOSSIER", "MISSION", "PROPOSAL");
    private static final Set<String> POLICY_STATUSES = Set.of("DRAFT", "ACTIVE", "DISABLED", "INVALID");

    private final ActionStudioActionRepository actionRepository;
    private final ActionAvailabilityPolicyRepository availabilityRepository;
    private final ActionExceptionPolicyRepository exceptionRepository;
    private final ActionStudioAuditRepository auditRepository;
    private final ActionStudioRoutingCatalog routingCatalog;
    private final EformRepository eformRepository;
    private final ActionBusinessConditionEvaluator conditions;
    private final ActionFormBundleSnapshotRepository bundleSnapshots;
    private final ActionOutcomeKeywordRepository keywordRepository;
    private final OutcomeKeywordCatalog outcomeKeywords;
    private final ActionVariableBindingCatalog variableBindings;

    @Autowired
    public ActionStudioService(ActionStudioActionRepository actionRepository,
            ActionAvailabilityPolicyRepository availabilityRepository,
            ActionExceptionPolicyRepository exceptionRepository,
            ActionStudioAuditRepository auditRepository,
            ActionStudioRoutingCatalog routingCatalog,
            EformRepository eformRepository, ActionBusinessConditionEvaluator conditions,
            ActionFormBundleSnapshotRepository bundleSnapshots,
            ActionOutcomeKeywordRepository keywordRepository,
            OutcomeKeywordCatalog outcomeKeywords,
            ActionVariableBindingCatalog variableBindings) {
        this.actionRepository = actionRepository;
        this.availabilityRepository = availabilityRepository;
        this.exceptionRepository = exceptionRepository;
        this.auditRepository = auditRepository;
        this.routingCatalog = routingCatalog;
        this.eformRepository = eformRepository;
        this.conditions = conditions;
        this.bundleSnapshots = bundleSnapshots;
        this.keywordRepository = keywordRepository;
        this.outcomeKeywords = outcomeKeywords;
        this.variableBindings = variableBindings;
    }

    ActionStudioService(ActionStudioActionRepository actionRepository,
            ActionAvailabilityPolicyRepository availabilityRepository,
            ActionExceptionPolicyRepository exceptionRepository,
            ActionStudioAuditRepository auditRepository,
            ActionStudioRoutingCatalog routingCatalog, EformRepository eformRepository) {
        this(actionRepository, availabilityRepository, exceptionRepository, auditRepository, routingCatalog,
                eformRepository, new ActionBusinessConditionEvaluator(new ObjectMapper(), new ApprovalConditionEngine()),
                null, null, new OutcomeKeywordCatalog(), new ActionVariableBindingCatalog());
    }

    /** Như trên nhưng có từ điển outcome thật — cho test phần Danh mục nút nhận thêm từ khoá. */
    ActionStudioService(ActionStudioActionRepository actionRepository,
            ActionAvailabilityPolicyRepository availabilityRepository,
            ActionExceptionPolicyRepository exceptionRepository,
            ActionStudioAuditRepository auditRepository,
            ActionStudioRoutingCatalog routingCatalog, EformRepository eformRepository,
            ActionOutcomeKeywordRepository keywordRepository) {
        this(actionRepository, availabilityRepository, exceptionRepository, auditRepository, routingCatalog,
                eformRepository, new ActionBusinessConditionEvaluator(new ObjectMapper(), new ApprovalConditionEngine()),
                null, keywordRepository, new OutcomeKeywordCatalog(keywordRepository),
                new ActionVariableBindingCatalog());
    }

    @Transactional(readOnly = true)
    public ConfigResponse load() {
        List<ActionStudioAction> actions = actionRepository.findAllByOrderByDisplayOrderAsc();
        return new ConfigResponse(actions.stream().map(this::toAction).toList(),
                actions.stream().map(ActionStudioService::toPresentation).toList(),
                availabilityRepository.findAllByOrderByDisplayOrderAscIdAsc().stream().map(ActionStudioService::toAvailability).toList(),
                exceptionRepository.findAllByOrderByIdAsc().stream().map(ActionStudioService::toException).toList(),
                routingCatalog.processes(), referenceData());
    }

    private ReferenceDataResponse referenceData() {
        return new ReferenceDataResponse(
                List.of(option("DOSSIER_DETAIL", "Chi tiết hồ sơ"), option("WORKLIST", "Việc của tôi"),
                        option("MOBILE", "Ứng dụng di động"), option("ACTION_STUDIO", "Ma trận Hành động")),
                List.of(option("draft", "Khởi tạo"), option("processing", "Đang xử lý"),
                        option("approved", "Đã duyệt"), option("rejected", "Từ chối")),
                RoleCatalog.options(),
                List.of(option("SUBMIT_DOSSIER", "Gửi duyệt hồ sơ"),
                        option("PROCESS_STEP", "Xử lý bước"),
                        option("REQUEST_EXCEPTION", "Xin Chi tiết"),
                        option("ADD_COMMENT", "Bổ sung ý kiến"),
                        option("DOWNLOAD_DOCUMENT", "Tải tài liệu"),
                        option("VIEW_AUDIT", "Xem lịch sử/audit")),
                eformRepository.findAllByOrderByCreatedAtDesc().stream()
                        .map(item -> option(item.getKey(), item.getTen()))
                        .toList());
    }

    private static CatalogOptionResponse option(String value, String label) {
        return new CatalogOptionResponse(value, label);
    }

    @Transactional
    public PresentationResponse updatePresentation(String code, PresentationRequest request, long expectedVersion,
            String actorHeader) {
        ActionStudioAction action = action(code);
        assertVersion(code, expectedVersion, action.getVersion());
        requireOneOf("nhóm hiển thị", request.uiGroup(), UI_GROUPS);
        requireOneOf("tone", request.tone(), TONES);
        validatePresentation(action, request.uiGroup(), request.tone());
        action.setLabel(request.label().trim());
        action.setIcon(request.icon().trim());
        action.setUiGroup(request.uiGroup());
        action.setTone(request.tone());
        action.setDisplayOrder(request.order());
        action.setHelpText(blankToNull(request.helpText()));
        touch(action, actorHeader);
        action = actionRepository.saveAndFlush(action);
        audit("ACTION", code, "UPDATE_PRESENTATION", actorHeader, "Cập nhật cách hiển thị nút.");
        return toPresentation(action);
    }

    @Transactional
    public PresentationResponse resetPresentation(String code, long expectedVersion, String actorHeader) {
        ActionStudioAction action = action(code);
        assertVersion(code, expectedVersion, action.getVersion());
        action.setLabel(action.getActionName());
        action.setIcon(defaultIcon(action));
        action.setUiGroup(defaultUiGroup(action));
        action.setTone(defaultTone(action));
        action.setDisplayOrder(defaultDisplayOrder(action));
        action.setHelpText("EXCEPTION".equals(action.getActionType())
                ? "Hành động ngoại lệ cần được kiểm soát và phê duyệt riêng." : null);
        validatePresentation(action, action.getUiGroup(), action.getTone());
        touch(action, actorHeader);
        action = actionRepository.saveAndFlush(action);
        audit("ACTION", code, "RESET_PRESENTATION", actorHeader, "Khôi phục trình bày mặc định.");
        return toPresentation(action);
    }

    @Transactional
    public ActionResponse setActionStatus(String code, boolean active, long expectedVersion, String actorHeader) {
        ActionStudioAction action = action(code);
        assertVersion(code, expectedVersion, action.getVersion());
        action.setActive(active);
        touch(action, actorHeader);
        action = actionRepository.saveAndFlush(action);
        audit("ACTION", code, active ? "ACTIVATE" : "DEACTIVATE", actorHeader,
                active ? "Kích hoạt hành động." : "Khóa hành động.");
        return toAction(action);
    }

    /**
     * Cho nút này nhận thêm một từ khoá outcome trong BPMN.
     *
     * <p>Chỉ mở rộng tập TỪ NGỮ được nhận diện, không mở rộng tập mã nút (D10). Từ khoá là tài sản
     * toàn cục: thêm ở đây là tuyên bố cho mọi quy trình, kể cả quy trình chưa vẽ — nên nó phải
     * UNIQUE và phải có người ký trong audit.
     */
    @Transactional
    public ActionResponse addOutcomeKeyword(String code, String keyword, String actorHeader) {
        ActionStudioAction action = action(code);
        String normalized = OutcomeKeywordCatalog.normalize(keyword);
        if (!OutcomeKeywordCatalog.isValidKeyword(normalized)) {
            throw new IllegalArgumentException("Từ khoá outcome phải là chữ thường không dấu, số và gạch "
                    + "dưới, bắt đầu bằng chữ cái: " + keyword);
        }
        String owner = outcomeKeywords.ownerOf(normalized);
        if (code.equals(owner)) return toAction(action);
        if (owner != null) {
            throw new ActionStudioConflictException("Từ khoá \"" + normalized + "\" đã thuộc nút " + owner
                    + ". Một từ khoá chỉ được thuộc đúng một nút — nếu không, hai nhánh cùng ánh xạ về một "
                    + "nút và nhánh vẽ sau bị bỏ qua mà không báo lỗi.");
        }
        ActionOutcomeKeyword entity = new ActionOutcomeKeyword();
        entity.setKeyword(normalized);
        entity.setActionCode(action.getActionCode());
        entity.setCreatedBy(ProcessDefinitionService.normalizeActor(actorHeader));
        entity.setCreatedAt(now());
        try {
            keywordRepository.saveAndFlush(entity);
        } catch (DataIntegrityViolationException raced) {
            // Khoá chính mới là trọng tài thật; kiểm ở trên đọc cache nên có thể lỡ một lượt ghi song song.
            throw new ActionStudioConflictException("Từ khoá \"" + normalized + "\" vừa được nút khác nhận.");
        } finally {
            outcomeKeywords.invalidate();
        }
        audit("ACTION", code, "ADD_OUTCOME_KEYWORD", actorHeader, "Nhận thêm từ khoá outcome: " + normalized);
        return toAction(action);
    }

    /** Bỏ một từ khoá khỏi nút. Nhánh BPMN dùng từ khoá đó sẽ quay lại trạng thái chưa ai nhận. */
    @Transactional
    public ActionResponse removeOutcomeKeyword(String code, String keyword, String actorHeader) {
        ActionStudioAction action = action(code);
        String normalized = OutcomeKeywordCatalog.normalize(keyword);
        ActionOutcomeKeyword existing = keywordRepository.findById(normalized)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy từ khoá outcome " + normalized));
        if (!existing.getActionCode().equals(code)) {
            throw new ActionStudioConflictException("Từ khoá \"" + normalized + "\" thuộc nút "
                    + existing.getActionCode() + ", không thuộc " + code + ".");
        }
        keywordRepository.delete(existing);
        keywordRepository.flush();
        outcomeKeywords.invalidate();
        audit("ACTION", code, "REMOVE_OUTCOME_KEYWORD", actorHeader, "Bỏ từ khoá outcome: " + normalized);
        return toAction(action);
    }

    @Transactional
    public AvailabilityResponse createAvailability(AvailabilityRequest request, String actorHeader) {
        request = normalizeLegacyForm(request);
        String id = request.id().trim();
        if (availabilityRepository.existsById(id)) {
            throw new ActionStudioConflictException("Mã luật khả dụng đã tồn tại: " + id);
        }
        validateAvailability(request);
        assertNoDuplicateAvailability(request, null);
        ActionAvailabilityPolicy entity = new ActionAvailabilityPolicy();
        apply(entity, request);
        if (request.formBundle() != null) entity.setBundleVersion(1L);
        entity.setVersion(0);
        touch(entity, actorHeader);
        entity = availabilityRepository.saveAndFlush(entity);
        snapshotBundle(entity, actorHeader);
        audit("AVAILABILITY", entity.getId(), "CREATE", actorHeader, "Tạo luật hiển thị nút.");
        return toAvailability(entity);
    }

    @Transactional
    public AvailabilityResponse updateAvailability(String id, AvailabilityRequest request, long expectedVersion,
            String actorHeader) {
        request = normalizeLegacyForm(request);
        if (!id.equals(request.id().trim())) {
            throw new IllegalArgumentException("Không được đổi mã luật khả dụng.");
        }
        ActionAvailabilityPolicy entity = availability(id);
        assertVersion(id, expectedVersion, entity.getVersion());
        String previousBundle = bundleJson(toBundle(entity));
        long previousBundleVersion = entity.getBundleVersion() == null ? 0 : entity.getBundleVersion();
        validateAvailability(request);
        assertNoDuplicateAvailability(request, id);
        apply(entity, request);
        if (request.formBundle() != null) {
            String nextBundle = bundleJson(toBundle(entity));
            entity.setBundleVersion(previousBundle.equals(nextBundle) ? Math.max(1, previousBundleVersion)
                    : Math.max(1, previousBundleVersion + 1));
        }
        touch(entity, actorHeader);
        entity = availabilityRepository.saveAndFlush(entity);
        snapshotBundle(entity, actorHeader);
        audit("AVAILABILITY", id, "UPDATE", actorHeader, "Cập nhật luật hiển thị nút.");
        return toAvailability(entity);
    }

    @Transactional
    public void deleteAvailability(String id, long expectedVersion, String actorHeader) {
        ActionAvailabilityPolicy entity = availability(id);
        assertVersion(id, expectedVersion, entity.getVersion());
        availabilityRepository.delete(entity);
        availabilityRepository.flush();
        audit("AVAILABILITY", id, "DELETE", actorHeader, "Xóa luật hiển thị nút.");
    }

    @Transactional(readOnly = true)
    public List<AuditResponse> availabilityHistory(String id) {
        List<ActionStudioAudit> history = auditRepository
                .findByEntityTypeAndEntityIdOrderByEventAtDesc("AVAILABILITY", id);
        if (history.isEmpty()) availability(id);
        return history.stream()
                .map(ActionStudioService::toAudit)
                .toList();
    }

    @Transactional
    public ExceptionResponse createException(ExceptionRequest request, String actorHeader) {
        if (exceptionRepository.existsById(request.id().trim())) {
            throw new ActionStudioConflictException("Mã chính sách Chi tiết đã tồn tại: " + request.id().trim());
        }
        validateException(request);
        ActionExceptionPolicy entity = new ActionExceptionPolicy();
        apply(entity, request);
        entity.setVersion(0);
        touch(entity, actorHeader);
        entity = exceptionRepository.saveAndFlush(entity);
        audit("EXCEPTION", entity.getId(), "CREATE", actorHeader, "Tạo chính sách Chi tiết.");
        return toException(entity);
    }

    @Transactional
    public ExceptionResponse updateException(String id, ExceptionRequest request, long expectedVersion,
            String actorHeader) {
        if (!id.equals(request.id())) {
            throw new IllegalArgumentException("Không được đổi mã chính sách Chi tiết.");
        }
        validateException(request);
        ActionExceptionPolicy entity = exceptionPolicy(id);
        assertVersion(id, expectedVersion, entity.getVersion());
        apply(entity, request);
        touch(entity, actorHeader);
        entity = exceptionRepository.saveAndFlush(entity);
        audit("EXCEPTION", id, "UPDATE", actorHeader, "Cập nhật chính sách Chi tiết.");
        return toException(entity);
    }

    @Transactional
    public void deleteException(String id, long expectedVersion, String actorHeader) {
        ActionExceptionPolicy entity = exceptionPolicy(id);
        assertVersion(id, expectedVersion, entity.getVersion());
        exceptionRepository.delete(entity);
        exceptionRepository.flush();
        audit("EXCEPTION", id, "DELETE", actorHeader, "Xóa chính sách Chi tiết.");
    }

    @Transactional(readOnly = true)
    public List<SimulatedActionResponse> simulate(SimulationRequest request) {
        requireOneOf("surface", request.surface(), SURFACES);
        requireOneOf("trạng thái hồ sơ", request.dossierStatus(), STATUSES);
        List<ActionAvailabilityPolicy> policies = availabilityRepository.findAllByOrderByDisplayOrderAscIdAsc();
        return actionRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(action -> simulate(action, policies, request))
                .sorted(Comparator.comparingInt(SimulatedActionResponse::order))
                .toList();
    }

    /** Server-side required-field validation for the form bound to a concrete task policy. */
    @Transactional(readOnly = true)
    public List<String> missingRequiredFormFields(String formKey, Map<String, Object> formData) {
        if (formKey == null || formKey.isBlank()) return List.of();
        var form = eformRepository.findById(formKey)
                .orElseThrow(() -> new IllegalArgumentException("Biểu mẫu không tồn tại: " + formKey));
        try {
            List<String> missing = new ArrayList<>();
            collectMissingRequired(JSON.readTree(form.getSchemaJson()), formData, missing);
            // Nhiều dòng dynamiclist cùng thiếu một trường ⇒ cùng một nhãn lặp lại; người dùng chỉ cần
            // biết trường nào thiếu, không cần nghe nhắc n lần.
            return missing.stream().distinct().toList();
        } catch (com.fasterxml.jackson.core.JsonProcessingException invalidSchema) {
            throw new IllegalStateException("Schema biểu mẫu không hợp lệ: " + formKey, invalidSchema);
        }
    }

    /**
     * Trường con của một {@code dynamiclist} sống trong dữ liệu CỦA TỪNG DÒNG, không phải ở gốc
     * formData — nên phải đổi ngữ cảnh khi đi xuống, đúng như renderer làm (xem
     * {@code FormDynamicListComponent}: mỗi dòng render với context riêng).
     *
     * <p>Trước đây hàm này đệ quy phẳng với formData gốc, nên mọi trường con bắt buộc đều bị báo
     * thiếu dù người dùng đã nhập đủ: {@code bm-02-08-qdh-nv} (QĐ thành lập HĐXD) có "Họ và tên" và
     * "Vai trò trong Hội đồng" bắt buộc bên trong dynamiclist, khiến thao tác duyệt T05 luôn trả
     * FORM_VALIDATION_FAILED và Hội đồng xét duyệt không bao giờ được sinh. Lỗi này có sẵn, phát hiện
     * khi thêm trường "Tài khoản" vào chính biểu mẫu đó.</p>
     */
    private static void collectMissingRequired(JsonNode node, Map<String, Object> formData, List<String> missing) {
        if (node == null) return;
        if (node.isArray()) {
            node.elements().forEachRemaining(child -> collectMissingRequired(child, formData, missing));
            return;
        }
        if (!node.isObject()) return;

        String key = node.path("key").asText("").trim();
        boolean required = node.path("validate").path("required").asBoolean(false);
        Object value = key.isEmpty() ? null : formData.get(key);
        if (!key.isEmpty() && required && emptyFormValue(value)) {
            missing.add(node.path("label").asText(key));
            // Danh sách rỗng đã báo thiếu ở chính nó; soi tiếp từng dòng là thừa (không có dòng nào).
            if ("dynamiclist".equals(node.path("type").asText(""))) return;
        }
        if ("dynamiclist".equals(node.path("type").asText(""))) {
            collectMissingRequiredInRows(node.path("components"), value, missing);
            return;
        }
        node.elements().forEachRemaining(child -> collectMissingRequired(child, formData, missing));
    }

    @SuppressWarnings("unchecked")
    private static void collectMissingRequiredInRows(JsonNode template, Object rows, List<String> missing) {
        if (!(rows instanceof List<?> items)) return;
        for (Object row : items) {
            if (!(row instanceof Map<?, ?> values)) continue;
            collectMissingRequired(template, (Map<String, Object>) values, missing);
        }
    }

    private static boolean emptyFormValue(Object value) {
        if (value == null) return true;
        if (value instanceof String text) return text.isBlank();
        if (value instanceof java.util.Collection<?> values) return values.isEmpty();
        if (value instanceof Map<?, ?> values) return values.isEmpty();
        return false;
    }

    @Transactional(readOnly = true)
    public List<ReconcileResponse> reconcile(String processCode) {
        return reconcile(processCode, availabilityRepository.findAllByOrderByDisplayOrderAscIdAsc());
    }

    /**
     * Sinh luật hiển thị nút cho các nhánh trong BPMN chưa được ghim.
     *
     * <p>Chạy lại được: id tất định theo (quy trình, bước, outcome).
     *
     * <p><b>Không chỉ tạo cho {@code missing}.</b> Bộ seed V10 có 4 luật CHUNG
     * ({@code process_code IS NULL AND task_definition_key IS NULL}) gắn sẵn biểu mẫu của RD01.01
     * ({@code phieu-phe-duyet}, {@code phieu-y-kien}). Nghĩa là một quy trình người dùng mới vẽ luôn
     * được đối soát chấm là {@code generic} chứ không phải {@code missing} — nút vẫn hiện ra, nhưng
     * mở lên là biểu mẫu của RD01.01, và server còn validate trường bắt buộc theo biểu mẫu sai đó.
     * Vì vậy khi BPMN của bước tự khai {@code formKey} riêng thì phải ghim đè lên luật chung.
     */
    @Transactional
    public ScaffoldResponse scaffold(String processCode, String actorHeader) {
        // Tra routing đúng một lần: vòng lặp cũ gọi require() lại cho mỗi dòng, tức parse lại BPMN
        // theo số nhánh.
        Map<String, String> formKeyByStep = new java.util.HashMap<>();
        Map<String, List<String>> roleCodesByStep = new java.util.HashMap<>();
        ProcessRoutingResponse scaffoldProcess = routingCatalog.require(processCode);
        for (var step : scaffoldProcess.steps()) {
            if (step.formKey() != null) formKeyByStep.put(step.key(), step.formKey());
            roleCodesByStep.put(step.key(), List.copyOf(csvCodes(step.role())));
        }
        List<ActionAvailabilityPolicy> current = availabilityRepository.findAllByOrderByDisplayOrderAscIdAsc();
        List<ReconcileResponse> candidates = reconcile(processCode, current).stream()
                .filter(row -> row.status().equals("MISSING_POLICY")
                        || (formKeyByStep.containsKey(row.stepKey()) && row.policyId() != null
                                && current.stream().anyMatch(policy -> policy.getId().equals(row.policyId())
                                        && policy.getProcessCode() == null
                                        && policy.getTaskDefinitionKey() == null)))
                .toList();
        List<AvailabilityResponse> created = new ArrayList<>();
        Set<String> seen = new LinkedHashSet<>();
        for (ReconcileResponse row : candidates) {
            String id = "AP-BPMN-" + processCode + "-" + row.stepKey() + "-" + row.outcome();
            // Bỏ qua id đã có (vd luật cũ đang bị khoá nên đối soát vẫn báo "missing") thay vì ném
            // xung đột làm rollback cả lượt scaffold.
            if (!seen.add(id) || availabilityRepository.existsById(id)) continue;
            String formKey = formKeyByStep.get(row.stepKey());
            FormBundleRequest bundle = formKey == null ? null : new FormBundleRequest("STEPPER", false,
                    "ALL_REQUIRED_VALID", 1L, List.of(new FormBundleItemRequest(formKey, null, 1,
                            null, true, "EDIT", false, null, "form")));
            AvailabilityRequest request = new AvailabilityRequest(id, row.actionCode(), "DOSSIER_DETAIL",
                    processCode, row.stepKey(), row.outcome().equals("SUBMIT") ? "draft" : "processing",
                    roleCodesByStep.getOrDefault(row.stepKey(), List.of()), null,
                    row.actionCode().equals("SUBMIT") ? "dossier.docsComplete = true"
                            : "user in currentStep.candidateGroups",
                    10, "DRAFT", scaffoldProcess.processVersion(), null, null, null, null, null, bundle);
            created.add(createAvailability(request, actorHeader));
        }
        return new ScaffoldResponse(created.size(), created, reconcile(processCode));
    }

    private SimulatedActionResponse simulate(ActionStudioAction action, List<ActionAvailabilityPolicy> policies,
            SimulationRequest request) {
        ActionAvailabilityPolicy policy = policies.stream()
                .filter(ActionStudioService::isActive)
                .filter(item -> item.getActionCode().equals(action.getActionCode()))
                .filter(item -> item.getSurface() == null || item.getSurface().equals(request.surface()))
                .filter(item -> item.getProcessCode() == null
                        || normalizeProcessCode(item.getProcessCode()).equals(normalizeProcessCode(request.processCode())))
                .filter(item -> item.getProcessVersion() == null
                        || Objects.equals(item.getProcessVersion(), request.processVersion()))
                .filter(item -> item.getTaskDefinitionKey() == null || item.getTaskDefinitionKey().equals(request.taskDefinitionKey()))
                .filter(item -> item.getDossierStatus() == null || item.getDossierStatus().equals(request.dossierStatus()))
                .max(Comparator.comparingInt(ActionStudioService::specificity)
                        .thenComparing(Comparator.comparingInt(ActionAvailabilityPolicy::getDisplayOrder).reversed()))
                .orElse(null);
        List<String> reasons = new ArrayList<>();
        if (!action.isActive()) reasons.add("Action đang bị khóa trong danh mục.");
        if (policy == null) reasons.add("Không có luật khớp surface/quy trình/bước/trạng thái.");
        boolean roleOk = policy == null || request.isAdmin() || policy.getAllowedRoleCodes().isEmpty()
                || policy.getAllowedRoleCodes().stream().anyMatch(request.roleCodes()::contains);
        if (!roleOk) reasons.add("Người dùng không có vai trò được luật cho phép.");
        boolean conditionOk = policy == null || conditions.evaluate(policy.getConditionExpression(),
                conditionContext(request));
        if (!conditionOk) reasons.add("Chua thoa dieu kien nghiep vu cua luat.");
        boolean visible = action.isActive() && policy != null && roleOk;
        if (reasons.isEmpty()) reasons.add("Khớp luật hiển thị và vai trò được phép.");
        FormBundleResponse applicableBundle = applicableBundle(toBundle(policy), conditionContext(request));
        return new SimulatedActionResponse(action.getActionCode(), action.getActionName(), action.getActionType(),
                action.getOutcome(), action.isRequiresReason(), action.isRequiresEvidence(), action.isRequiresConfirm(),
                action.isActive(), override(policy == null ? null : policy.getDisplayLabel(), action.getLabel()),
                override(policy == null ? null : policy.getDisplayIcon(), action.getIcon()),
                override(policy == null ? null : policy.getUiGroup(), action.getUiGroup()),
                override(policy == null ? null : policy.getTone(), action.getTone()),
                policy == null ? action.getDisplayOrder() : policy.getDisplayOrder(),
                override(policy == null ? null : policy.getHelpText(), action.getHelpText()), visible,
                visible && conditionOk, policy == null ? null : policy.getId(), reasons,
                effectiveFormKey(policy), policy == null ? null : policy.getVersion(), applicableBundle);
    }

    private FormBundleResponse applicableBundle(FormBundleResponse bundle, Map<String, Object> context) {
        if (bundle == null) return null;
        List<FormBundleItemResponse> items = bundle.items().stream()
                .filter(item -> conditions.evaluate(item.conditionExpression(), context))
                .toList();
        return new FormBundleResponse(bundle.displayMode(), bundle.allowDraft(), bundle.completionPolicy(),
                bundle.version(), items);
    }

    private List<ReconcileResponse> reconcile(String processCode, List<ActionAvailabilityPolicy> policies) {
        var process = routingCatalog.require(processCode);
        List<ReconcileResponse> rows = new ArrayList<>(process.steps().stream().flatMap(step -> step.branches().stream().map(branch -> {
            String actionCode = outcomeAction(branch.outcome());
            if (actionCode == null) {
                String suggestion = suggestedAction(branch.kind());
                // Kèm nhãn + đích của nhánh để người duyệt đề xuất có căn cứ quyết, thay vì phải mở
                // lại bản vẽ BPMN mới biết nhánh này đi đâu.
                String context = "Nhánh \"" + branch.label() + "\" đi tới \"" + branch.target() + "\".";
                return new ReconcileResponse(processCode, step.key(), step.name(), branch.outcome(), null,
                        "UNMAPPED_BRANCH", null,
                        suggestion == null
                                ? "Từ khoá outcome chưa nút nào nhận và không suy được đề xuất. " + context
                                : "Từ khoá outcome chưa nút nào nhận. " + context,
                        suggestion);
            }
            if (branch.target() == null || branch.target().isBlank()) {
                return new ReconcileResponse(processCode, step.key(), step.name(), branch.outcome(), actionCode,
                        "INVALID_TARGET", null, "Nhánh BPMN không có đích hợp lệ.");
            }
            ActionAvailabilityPolicy exact = policies.stream().filter(ActionStudioService::isActive)
                    .filter(item -> item.getProcessCode() != null
                            && normalizeProcessCode(item.getProcessCode()).equals(normalizeProcessCode(processCode)))
                    .filter(item -> item.getProcessVersion() == null
                            || Objects.equals(item.getProcessVersion(), process.processVersion()))
                    .filter(item -> step.key().equals(item.getTaskDefinitionKey()))
                    .filter(item -> actionCode.equals(item.getActionCode())).findFirst().orElse(null);
            ActionAvailabilityPolicy generic = policies.stream().filter(ActionStudioService::isActive)
                    .filter(item -> item.getProcessCode() == null && item.getTaskDefinitionKey() == null)
                    .filter(item -> actionCode.equals(item.getActionCode())).findFirst().orElse(null);
            ActionAvailabilityPolicy matched = exact != null ? exact : generic;
            Set<String> candidates = csvCodes(step.role());
            List<String> dynamicCandidates = candidates.stream().filter(ActionStudioService::isDynamicRoleExpression).toList();
            List<String> unknownCandidates = candidates.stream()
                    .filter(candidate -> !isDynamicRoleExpression(candidate) && !RoleCatalog.isKnown(candidate)).toList();
            boolean invalidCandidateMapping = candidates.isEmpty() || !dynamicCandidates.isEmpty() || !unknownCandidates.isEmpty();
            boolean roleMismatch = invalidCandidateMapping
                    || matched != null && !candidates.containsAll(matched.getAllowedRoleCodes());
            boolean conflict = matched != null && policies.stream().filter(ActionStudioService::isActive)
                    .filter(item -> !item.getId().equals(matched.getId()))
                    .filter(item -> actionCode.equals(item.getActionCode()))
                    .anyMatch(item -> sameSelector(item, matched));
            String status = conflict ? "CONFLICT" : roleMismatch ? "ROLE_MISMATCH"
                    : matched == null ? "MISSING_POLICY" : exact == null ? "GENERIC_POLICY"
                    : matched.getFormKey() == null && matched.getFormBundleItems().isEmpty()
                            && isOutcomeAction(actionCode) ? "MISSING_FORM" : "OK";
            String reason = switch (status) {
                case "OK" -> "Đã ghim đúng bước và đủ cấu hình.";
                case "GENERIC_POLICY" -> "Đang được phủ bởi luật chung.";
                case "MISSING_FORM" -> "Đã có luật nhưng chưa gắn biểu mẫu.";
                case "ROLE_MISMATCH" -> !dynamicCandidates.isEmpty()
                        ? "Candidate Group động không thể phân tích tĩnh: " + String.join(", ", dynamicCandidates) + "."
                        : !unknownCandidates.isEmpty()
                                ? "Candidate Group không tồn tại trong danh mục vai trò: " + String.join(", ", unknownCandidates) + "."
                                : candidates.isEmpty() ? "User Task chưa khai báo Candidate Group."
                                : "Vai trò của luật nằm ngoài Candidate Group của bước.";
                case "CONFLICT" -> "Có nhiều luật ACTIVE trùng selector cho nhánh này.";
                default -> "Chưa có luật hiển thị cho nhánh này.";
            };
            return new ReconcileResponse(processCode, step.key(), step.name(), branch.outcome(), actionCode,
                    status, matched == null ? null : matched.getId(), reason);
        })).toList());

        Set<String> routed = process.steps().stream().flatMap(step -> step.branches().stream()
                .map(branch -> step.key() + "\u0000" + outcomeAction(branch.outcome())))
                .collect(java.util.stream.Collectors.toSet());
        policies.stream().filter(ActionStudioService::isActive)
                .filter(item -> item.getProcessCode() != null
                        && normalizeProcessCode(item.getProcessCode()).equals(normalizeProcessCode(processCode)))
                .filter(item -> item.getTaskDefinitionKey() != null && isStandardAction(item.getActionCode()))
                .filter(item -> !routed.contains(item.getTaskDefinitionKey() + "\u0000" + item.getActionCode()))
                .forEach(item -> rows.add(new ReconcileResponse(processCode, item.getTaskDefinitionKey(),
                        item.getTaskDefinitionKey(), null, item.getActionCode(), "ORPHAN_POLICY", item.getId(),
                        "Luật ACTIVE không còn nhánh tương ứng trong BPMN.")));
        return withVariableBindingRows(processCode, rows, policies);
    }

    /**
     * Gắn các quy tắc "trường biểu mẫu đến biến Camunda" vào đúng dòng đối soát, và báo động khi một
     * quy tắc trỏ vào trường không còn tồn tại trong biểu mẫu.
     *
     * <p>Đây là phần trả lời cho khiếm khuyết đã biết: trước đây quy tắc nằm cứng trong
     * {@code withDiemSoForT24}, không hiện ở đâu cả, nên đổi tên trường biểu mẫu là hỏng im lặng —
     * hồ sơ vẫn đi đúng nhánh nhưng business rule task nhận thiếu biến.
     */
    private List<ReconcileResponse> withVariableBindingRows(String processCode, List<ReconcileResponse> rows,
            List<ActionAvailabilityPolicy> policies) {
        var bindings = variableBindings.forProcess(processCode);
        if (bindings.isEmpty()) return List.copyOf(rows);

        Map<String, List<ActionVariableBinding>> bySelector = new LinkedHashMap<>();
        for (ActionVariableBinding binding : bindings) {
            bySelector.computeIfAbsent(binding.getTaskDefinitionKey() + "\u0000" + binding.getActionCode(),
                    unused -> new ArrayList<>()).add(binding);
        }

        List<ReconcileResponse> result = new ArrayList<>();
        Set<String> matchedSelectors = new LinkedHashSet<>();
        for (ReconcileResponse row : rows) {
            String selector = row.stepKey() + "\u0000" + row.actionCode();
            List<ActionVariableBinding> declared = bySelector.get(selector);
            if (declared == null) {
                result.add(row);
                continue;
            }
            matchedSelectors.add(selector);
            result.add(row.withVariableBindings(declared.stream()
                    .map(binding -> binding.getFormField() + " → " + binding.getVariableName()).toList()));
            Set<String> fields = formFieldKeys(policyById(policies, row.policyId()));
            // fields rỗng = không đọc được biểu mẫu (chưa gắn form, hoặc schema hỏng). Im lặng còn
            // hơn báo động giả: chỉ kết luận "trường không tồn tại" khi thực sự đọc được danh sách.
            if (fields.isEmpty()) continue;
            for (ActionVariableBinding binding : declared) {
                if (fields.contains(binding.getFormField())) continue;
                result.add(new ReconcileResponse(processCode, row.stepKey(), row.stepName(), row.outcome(),
                        row.actionCode(), "BINDING_FIELD_MISSING", row.policyId(),
                        "Quy tắc gửi biến trỏ vào trường \"" + binding.getFormField()
                                + "\" nhưng biểu mẫu đang gắn không có trường này.",
                        null, List.of(binding.getFormField() + " → " + binding.getVariableName())));
            }
        }

        bySelector.forEach((selector, declared) -> {
            if (matchedSelectors.contains(selector)) return;
            ActionVariableBinding first = declared.get(0);
            result.add(new ReconcileResponse(processCode, first.getTaskDefinitionKey(),
                    first.getTaskDefinitionKey(), null, first.getActionCode(), "ORPHAN_BINDING", null,
                    "Quy tắc gửi biến khai cho bước/nút không còn nhánh tương ứng trong BPMN.", null,
                    declared.stream().map(binding -> binding.getFormField() + " → " + binding.getVariableName())
                            .toList()));
        });
        return List.copyOf(result);
    }

    private static ActionAvailabilityPolicy policyById(List<ActionAvailabilityPolicy> policies, String policyId) {
        if (policyId == null) return null;
        return policies.stream().filter(item -> policyId.equals(item.getId())).findFirst().orElse(null);
    }

    /** Khoá của mọi trường trong các biểu mẫu mà luật này gắn. Rỗng nghĩa là không đọc được. */
    private Set<String> formFieldKeys(ActionAvailabilityPolicy policy) {
        if (policy == null) return Set.of();
        List<String> formKeys = new ArrayList<>(policy.getFormBundleItems().stream()
                .map(ActionFormBundleItem::getFormKey).filter(Objects::nonNull).toList());
        if (policy.getFormKey() != null) formKeys.add(policy.getFormKey());
        Set<String> fields = new LinkedHashSet<>();
        for (String formKey : formKeys) {
            eformRepository.findById(formKey).ifPresent(form -> collectFieldKeys(form.getSchemaJson(), fields));
        }
        return fields;
    }

    /** Gom {@code key} của mọi component trong schema form-js, kể cả component lồng trong nhóm. */
    private static void collectFieldKeys(String schemaJson, Set<String> into) {
        if (schemaJson == null || schemaJson.isBlank()) return;
        try {
            collectFieldKeys(JSON.readTree(schemaJson), into);
        } catch (RuntimeException | com.fasterxml.jackson.core.JsonProcessingException malformed) {
            // Schema hỏng thì bỏ qua — đối soát không phải nơi báo lỗi biểu mẫu.
        }
    }

    private static void collectFieldKeys(JsonNode node, Set<String> into) {
        if (node == null) return;
        if (node.isArray()) {
            node.forEach(child -> collectFieldKeys(child, into));
            return;
        }
        if (!node.isObject()) return;
        var key = node.get("key");
        if (key != null && key.isTextual()) into.add(key.asText());
        collectFieldKeys(node.get("components"), into);
    }

    private static boolean sameSelector(ActionAvailabilityPolicy left, ActionAvailabilityPolicy right) {
        return Objects.equals(left.getSurface(), right.getSurface())
                && Objects.equals(normalizeProcessCode(left.getProcessCode()), normalizeProcessCode(right.getProcessCode()))
                && Objects.equals(left.getProcessVersion(), right.getProcessVersion())
                && Objects.equals(left.getTaskDefinitionKey(), right.getTaskDefinitionKey())
                && Objects.equals(left.getDossierStatus(), right.getDossierStatus());
    }

    private void validateAvailability(AvailabilityRequest request) {
        action(request.actionCode());
        if (request.surface() != null) requireOneOf("surface", request.surface(), SURFACES);
        if (request.dossierStatus() != null) requireOneOf("trạng thái hồ sơ", request.dossierStatus(), STATUSES);
        if (request.taskDefinitionKey() != null && request.processCode() == null) {
            throw new IllegalArgumentException("taskDefinitionKey yêu cầu processCode.");
        }
        requireOneOf("lifecycleStatus", request.lifecycleStatus(), POLICY_STATUSES);
        if (request.uiGroup() != null) requireOneOf("uiGroup", request.uiGroup(), UI_GROUPS);
        if (request.tone() != null) requireOneOf("tone", request.tone(), TONES);
        ActionStudioAction definition = action(request.actionCode());
        String group = override(request.uiGroup(), definition.getUiGroup());
        String tone = override(request.tone(), definition.getTone());
        if ((request.uiGroup() != null || request.tone() != null) && "SUPPORT".equals(definition.getActionType())
                && (!"MORE".equals(group) || !"default".equals(tone)))
            throw new IllegalArgumentException("Support Action chi duoc dung MORE/default.");
        if (request.uiGroup() != null && "EXCEPTION".equals(definition.getActionType()) && !"EXCEPTION".equals(group))
            throw new IllegalArgumentException("Exception Action phai nam trong nhom EXCEPTION.");
        if (request.tone() != null && "REJECT_STEP".equals(request.actionCode()) && "primary".equals(tone))
            throw new IllegalArgumentException("REJECT_STEP khong duoc dung tone primary.");
        validateBundle(request);
        if ("ACTIVE".equals(request.lifecycleStatus()) && isStandardAction(request.actionCode())) {
            validateStandardActionActivation(request);
        }
    }

    @Transactional
    public BulkDeleteAvailabilityResponse deleteAvailabilityBulk(BulkDeleteAvailabilityRequest request,
            String actorHeader) {
        List<String> ids = request.items().stream().map(item -> item.id().trim()).toList();
        if (new java.util.HashSet<>(ids).size() != ids.size()) {
            throw new IllegalArgumentException("Danh sach xoa co ma luat bi trung.");
        }
        Map<String, ActionAvailabilityPolicy> policies = availabilityRepository.findAllById(ids).stream()
                .collect(java.util.stream.Collectors.toMap(ActionAvailabilityPolicy::getId, item -> item));
        for (var requested : request.items()) {
            ActionAvailabilityPolicy policy = policies.get(requested.id().trim());
            if (policy == null) throw new EntityNotFoundException("Khong tim thay luat kha dung " + requested.id());
            assertVersion(policy.getId(), requested.version(), policy.getVersion());
        }
        availabilityRepository.deleteAll(policies.values());
        availabilityRepository.flush();
        ids.forEach(id -> audit("AVAILABILITY", id, "DELETE", actorHeader, "Xoa hang loat luat hien thi nut."));
        return new BulkDeleteAvailabilityResponse(ids.size(), List.copyOf(ids));
    }

    @Transactional
    public BulkStatusAvailabilityResponse setAvailabilityStatusBulk(BulkStatusAvailabilityRequest request,
            String actorHeader) {
        List<String> ids = request.items().stream().map(item -> item.id().trim()).toList();
        if (new java.util.HashSet<>(ids).size() != ids.size()) {
            throw new IllegalArgumentException("Danh sach cap nhat co ma luat bi trung.");
        }
        Map<String, ActionAvailabilityPolicy> policies = availabilityRepository.findAllById(ids).stream()
                .collect(java.util.stream.Collectors.toMap(ActionAvailabilityPolicy::getId, item -> item));
        for (var requested : request.items()) {
            ActionAvailabilityPolicy policy = policies.get(requested.id().trim());
            if (policy == null) throw new EntityNotFoundException("Khong tim thay luat kha dung " + requested.id());
            assertVersion(policy.getId(), requested.version(), policy.getVersion());
            if (request.enabled()) validateAvailability(toAvailabilityRequest(policy, "ACTIVE"));
        }
        for (String id : ids) {
            ActionAvailabilityPolicy policy = policies.get(id);
            policy.setLifecycleStatus(request.enabled()
                    ? ActionAvailabilityPolicyStatus.ACTIVE : ActionAvailabilityPolicyStatus.DISABLED);
            touch(policy, actorHeader);
        }
        availabilityRepository.saveAll(policies.values());
        availabilityRepository.flush();
        List<AvailabilityResponse> updated = ids.stream().map(id -> toAvailability(policies.get(id))).toList();
        ids.forEach(id -> audit("AVAILABILITY", id, "UPDATE", actorHeader,
                request.enabled() ? "Bat hang loat luat hien thi nut." : "Tat hang loat luat hien thi nut."));
        return new BulkStatusAvailabilityResponse(updated.size(), List.copyOf(updated));
    }

    private AvailabilityRequest toAvailabilityRequest(ActionAvailabilityPolicy policy, String lifecycleStatus) {
        return new AvailabilityRequest(policy.getId(), policy.getActionCode(), policy.getSurface(),
                policy.getProcessCode(), policy.getTaskDefinitionKey(), policy.getDossierStatus(),
                List.copyOf(policy.getAllowedRoleCodes()), policy.getFormKey(), policy.getConditionExpression(),
                policy.getDisplayOrder(), lifecycleStatus, policy.getProcessVersion(), policy.getDisplayLabel(),
                policy.getDisplayIcon(), policy.getUiGroup(), policy.getTone(), policy.getHelpText(), null);
    }

    @Transactional(readOnly = true)
    public List<String> missingRequiredBundleFields(FormBundleResponse bundle, Map<String, Object> formData,
            Map<String, Object> context) {
        if (bundle == null) return List.of();
        List<String> missing = new ArrayList<>();
        for (FormBundleItemResponse item : bundle.items()) {
            if (!conditions.evaluate(item.conditionExpression(), context)) continue;
            Object namespaced = formData.get(item.outputNamespace());
            Map<String, Object> values = namespaced instanceof Map<?, ?> map
                    ? (Map<String, Object>) map : Map.of();
            if (item.required() && values.isEmpty()) missing.add(item.displayTitle() == null ? item.formKey() : item.displayTitle());
            missing.addAll(missingRequiredFormFields(item.formKey(), values));
        }
        return missing.stream().distinct().toList();
    }

    @Transactional
    public int invalidateIncompatiblePolicies(String processCode, String actorHeader) {
        int changed = 0;
        for (ActionAvailabilityPolicy policy : availabilityRepository.findAllByOrderByDisplayOrderAscIdAsc()) {
            if (!isActive(policy) || policy.getProcessCode() == null
                    || !normalizeProcessCode(policy.getProcessCode()).equals(normalizeProcessCode(processCode))) continue;
            try {
                if (policy.getProcessVersion() == null) throw new IllegalArgumentException("missing process version");
                ProcessStepResponse step = routingCatalog.require(policy.getProcessCode(), policy.getProcessVersion()).steps().stream()
                        .filter(item -> Objects.equals(item.key(), policy.getTaskDefinitionKey())).findFirst().orElseThrow();
                if (isStandardAction(policy.getActionCode()) && step.branches().stream()
                        .map(branch -> outcomeAction(branch.outcome())).noneMatch(policy.getActionCode()::equals)) throw new IllegalArgumentException("orphan route");
                Set<String> candidates = csvCodes(step.role());
                if (!candidates.containsAll(policy.getAllowedRoleCodes())) throw new IllegalArgumentException("role mismatch");
            } catch (RuntimeException incompatible) {
                policy.setLifecycleStatus(ActionAvailabilityPolicyStatus.INVALID);
                touch(policy, actorHeader);
                availabilityRepository.save(policy);
                audit("AVAILABILITY", policy.getId(), "INVALIDATE", actorHeader, incompatible.getMessage());
                changed++;
            }
        }
        return changed;
    }

    private void validateStandardActionActivation(AvailabilityRequest request) {
        if (blankToNull(request.processCode()) == null || request.processVersion() == null
                || blankToNull(request.taskDefinitionKey()) == null) {
            throw new IllegalArgumentException(
                    "Luật Standard Action ACTIVE phải ghim vào processCode và taskDefinitionKey cụ thể.");
        }
        if (request.allowedRoleCodes().isEmpty()) {
            throw new IllegalArgumentException("Luật Standard Action ACTIVE phải có ít nhất một vai trò được phép.");
        }

        ProcessRoutingResponse process = routingCatalog.require(request.processCode(), request.processVersion());
        ProcessStepResponse step = process.steps().stream()
                .filter(item -> item.key().equals(request.taskDefinitionKey()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Task không tồn tại trong BPMN đã deploy: " + request.taskDefinitionKey()));

        boolean routeExists = step.branches().stream()
                .map(branch -> outcomeAction(branch.outcome()))
                .anyMatch(request.actionCode()::equals);
        if (!routeExists) {
            throw new IllegalArgumentException("BPMN không có route cho Action " + request.actionCode()
                    + " tại task " + request.taskDefinitionKey() + ".");
        }

        Set<String> candidateGroups = csvCodes(step.role());
        List<String> dynamicCandidateGroups = candidateGroups.stream()
                .filter(ActionStudioService::isDynamicRoleExpression).toList();
        if (!dynamicCandidateGroups.isEmpty()) {
            throw new IllegalArgumentException("Candidate Group động cần được ánh xạ thủ công: "
                    + String.join(", ", dynamicCandidateGroups) + ".");
        }
        List<String> unknownCandidateGroups = candidateGroups.stream().filter(role -> !RoleCatalog.isKnown(role)).toList();
        if (!unknownCandidateGroups.isEmpty()) {
            throw new IllegalArgumentException("Candidate Group không tồn tại trong danh mục vai trò: "
                    + String.join(", ", unknownCandidateGroups) + ".");
        }
        List<String> rolesOutsideCandidateGroups = normalizeCodes(request.allowedRoleCodes()).stream()
                .filter(role -> !candidateGroups.contains(role)).toList();
        if (!rolesOutsideCandidateGroups.isEmpty()) {
            throw new IllegalArgumentException("Vai trò không thuộc Candidate Group của task: "
                    + String.join(", ", rolesOutsideCandidateGroups) + ".");
        }
    }

    private void assertNoDuplicateAvailability(AvailabilityRequest request, String currentId) {
        if (!"ACTIVE".equals(request.lifecycleStatus())) return;
        ActionAvailabilityPolicy duplicate = availabilityRepository.findAllByOrderByDisplayOrderAscIdAsc().stream()
                .filter(ActionStudioService::isActive)
                .filter(item -> !item.getId().equals(currentId))
                .filter(item -> item.getActionCode().equals(request.actionCode().trim()))
                .filter(item -> Objects.equals(item.getSurface(), blankToNull(request.surface())))
                .filter(item -> Objects.equals(normalizeProcessCode(item.getProcessCode()),
                        normalizeProcessCode(blankToNull(request.processCode()))))
                .filter(item -> Objects.equals(item.getProcessVersion(), request.processVersion()))
                .filter(item -> Objects.equals(item.getTaskDefinitionKey(), blankToNull(request.taskDefinitionKey())))
                .filter(item -> Objects.equals(item.getDossierStatus(), blankToNull(request.dossierStatus())))
                .findFirst().orElse(null);
        if (duplicate != null) {
            throw new ActionStudioConflictException("Luật " + duplicate.getId()
                    + " đang bật cho cùng hành động và ngữ cảnh. Hãy tắt hoặc cập nhật luật đó trước.");
        }
        ActionAvailabilityPolicy overlap = availabilityRepository.findAllByOrderByDisplayOrderAscIdAsc().stream()
                .filter(ActionStudioService::isActive).filter(item -> !item.getId().equals(currentId))
                .filter(item -> item.getActionCode().equals(request.actionCode().trim()))
                .filter(item -> intersects(item, request) && !contains(item, request) && !contains(request, item))
                .findFirst().orElse(null);
        if (overlap != null) throw new ActionStudioConflictException("CONFLICT with policy " + overlap.getId());
    }

    private void validateBundle(AvailabilityRequest request) {
        if (request.formBundle() == null) return;
        requireOneOf("bundle displayMode", request.formBundle().displayMode(), Set.of("STEPPER", "TABS"));
        requireOneOf("bundle completionPolicy", request.formBundle().completionPolicy(), Set.of("ALL_REQUIRED_VALID"));
        Set<Integer> orders = new java.util.HashSet<>();
        Set<String> namespaces = new java.util.HashSet<>();
        request.formBundle().items().forEach(item -> {
            requireOneOf("form mode", item.mode(), Set.of("VIEW", "EDIT"));
            if (!orders.add(item.displayOrder())) throw new IllegalArgumentException("Form Bundle bi trung displayOrder.");
            if (!namespaces.add(item.outputNamespace().trim())) throw new IllegalArgumentException("Form Bundle bi trung outputNamespace.");
            var form = eformRepository.findById(item.formKey().trim())
                    .orElseThrow(() -> new IllegalArgumentException("Bieu mau khong ton tai: " + item.formKey()));
            if (item.formVersion() != null && item.formVersion() != form.getVersion())
                throw new IllegalArgumentException("Phien ban bieu mau khong ton tai: " + item.formKey());
        });
    }

    private static boolean intersects(ActionAvailabilityPolicy a, AvailabilityRequest b) {
        return intersects(a.getSurface(), b.surface()) && intersects(normalizeProcessCode(a.getProcessCode()), normalizeProcessCode(b.processCode()))
                && intersects(a.getProcessVersion(), b.processVersion()) && intersects(a.getTaskDefinitionKey(), b.taskDefinitionKey())
                && intersects(a.getDossierStatus(), b.dossierStatus());
    }
    private static boolean contains(ActionAvailabilityPolicy a, AvailabilityRequest b) {
        return contains(a.getSurface(), b.surface()) && contains(normalizeProcessCode(a.getProcessCode()), normalizeProcessCode(b.processCode()))
                && contains(a.getProcessVersion(), b.processVersion()) && contains(a.getTaskDefinitionKey(), b.taskDefinitionKey())
                && contains(a.getDossierStatus(), b.dossierStatus());
    }
    private static boolean contains(AvailabilityRequest a, ActionAvailabilityPolicy b) {
        return contains(a.surface(), b.getSurface()) && contains(normalizeProcessCode(a.processCode()), normalizeProcessCode(b.getProcessCode()))
                && contains(a.processVersion(), b.getProcessVersion()) && contains(a.taskDefinitionKey(), b.getTaskDefinitionKey())
                && contains(a.dossierStatus(), b.getDossierStatus());
    }
    private static boolean intersects(Object a, Object b) { return a == null || b == null || Objects.equals(a, b); }
    private static boolean contains(Object parent, Object child) { return parent == null || Objects.equals(parent, child); }

    private void validateException(ExceptionRequest request) {
        ActionStudioAction action = action(request.actionCode());
        if (!ACTION_TYPES.contains(action.getActionType()) || !"EXCEPTION".equals(action.getActionType())) {
            throw new IllegalArgumentException("Chính sách Chi tiết phải tham chiếu action loại EXCEPTION.");
        }
        requireOneOf("objectType", request.objectType(), OBJECT_TYPES);
        requireOneOf("targetType", request.targetType(), TARGET_TYPES);
        if ("STEP".equals(request.targetType()) && blankToNull(request.targetStepKey()) == null) {
            throw new IllegalArgumentException("targetStepKey là bắt buộc khi targetType=STEP.");
        }
    }

    private ActionStudioAction action(String code) {
        return actionRepository.findById(code)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy hành động " + code));
    }

    private ActionAvailabilityPolicy availability(String id) {
        return availabilityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy luật khả dụng " + id));
    }

    private ActionExceptionPolicy exceptionPolicy(String id) {
        return exceptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy chính sách Chi tiết " + id));
    }

    private void audit(String type, String id, String event, String actorHeader, String detail) {
        ActionStudioAudit audit = new ActionStudioAudit();
        audit.setId(UUID.randomUUID());
        audit.setEntityType(type);
        audit.setEntityId(id);
        audit.setAction(event);
        audit.setActor(ProcessDefinitionService.normalizeActor(actorHeader));
        audit.setEventAt(now());
        audit.setDetail(detail);
        auditRepository.save(audit);
    }

    private static void apply(ActionAvailabilityPolicy entity, AvailabilityRequest request) {
        entity.setId(request.id().trim());
        entity.setActionCode(request.actionCode().trim());
        entity.setSurface(blankToNull(request.surface()));
        entity.setProcessCode(blankToNull(request.processCode()));
        entity.setProcessVersion(request.processVersion());
        entity.setTaskDefinitionKey(blankToNull(request.taskDefinitionKey()));
        entity.setDossierStatus(blankToNull(request.dossierStatus()));
        entity.setAllowedRoleCodes(normalizeCodes(request.allowedRoleCodes()));
        entity.setFormKey(request.formBundle() == null ? blankToNull(request.formKey()) : null);
        entity.setDisplayLabel(blankToNull(request.displayLabel()));
        entity.setDisplayIcon(blankToNull(request.displayIcon()));
        entity.setUiGroup(blankToNull(request.uiGroup()));
        entity.setTone(blankToNull(request.tone()));
        entity.setHelpText(blankToNull(request.helpText()));
        entity.getFormBundleItems().clear();
        if (request.formBundle() != null) {
            entity.setBundleDisplayMode(blankToNull(request.formBundle().displayMode()));
            entity.setBundleAllowDraft(request.formBundle().allowDraft());
            entity.setBundleCompletionPolicy(blankToNull(request.formBundle().completionPolicy()));
            entity.setBundleVersion(request.formBundle().version() == null ? 1L : request.formBundle().version());
            request.formBundle().items().forEach(source -> {
                ActionFormBundleItem item = new ActionFormBundleItem();
                item.setFormKey(source.formKey().trim());
                item.setFormVersion(source.formVersion());
                item.setDisplayOrder(source.displayOrder());
                item.setDisplayTitle(blankToNull(source.displayTitle()));
                item.setRequired(source.required());
                item.setMode(source.mode());
                item.setSkippable(source.skippable());
                item.setConditionExpression(blankToNull(source.conditionExpression()));
                item.setOutputNamespace(source.outputNamespace().trim());
                entity.getFormBundleItems().add(item);
            });
        } else {
            entity.setBundleDisplayMode(null);
            entity.setBundleCompletionPolicy(null);
            entity.setBundleVersion(null);
        }
        entity.setConditionExpression(blankToNull(request.conditionExpression()));
        entity.setDisplayOrder(request.displayOrder());
        entity.setLifecycleStatus(ActionAvailabilityPolicyStatus.valueOf(request.lifecycleStatus()));
    }

    private static void apply(ActionExceptionPolicy entity, ExceptionRequest request) {
        entity.setId(request.id().trim());
        entity.setActionCode(request.actionCode());
        entity.setObjectType(request.objectType());
        entity.setProcessCode(blankToNull(request.processCode()));
        entity.setFromStepKey(blankToNull(request.fromStepKey()));
        entity.setTargetType(request.targetType());
        entity.setTargetStepKey(blankToNull(request.targetStepKey()));
        entity.setAllowedRoleCodes(new LinkedHashSet<>(request.allowedRoleCodes()));
        entity.setRequiredPermissions(new LinkedHashSet<>(request.requiredPermissions()));
        entity.setRequiresApproval(request.requiresApproval());
        entity.setRequiresReason(request.requiresReason());
        entity.setRequiresEvidence(request.requiresEvidence());
        entity.setEnabled(request.enabled());
    }

    private static void touch(ActionStudioAction entity, String actorHeader) {
        entity.setUpdatedBy(ProcessDefinitionService.normalizeActor(actorHeader));
        entity.setUpdatedAt(now());
    }

    private static void touch(ActionAvailabilityPolicy entity, String actorHeader) {
        entity.setUpdatedBy(ProcessDefinitionService.normalizeActor(actorHeader));
        entity.setUpdatedAt(now());
    }

    private static void touch(ActionExceptionPolicy entity, String actorHeader) {
        entity.setUpdatedBy(ProcessDefinitionService.normalizeActor(actorHeader));
        entity.setUpdatedAt(now());
    }

    private ActionResponse toAction(ActionStudioAction item) {
        return new ActionResponse(item.getActionCode(), item.getActionName(), item.getActionType(), item.getOutcome(),
                item.isRequiresReason(), item.isRequiresEvidence(), item.isRequiresConfirm(), item.isActive(),
                item.getVersion(), item.getUpdatedBy(), item.getUpdatedAt(),
                outcomeKeywords.keywordsFor(item.getActionCode()));
    }

    private static PresentationResponse toPresentation(ActionStudioAction item) {
        return new PresentationResponse(item.getActionCode(), item.getLabel(), item.getIcon(), item.getUiGroup(),
                item.getTone(), item.getDisplayOrder(), item.getHelpText(), item.getVersion());
    }

    private static AvailabilityResponse toAvailability(ActionAvailabilityPolicy item) {
        return new AvailabilityResponse(item.getId(), item.getActionCode(), item.getSurface(), item.getProcessCode(),
                item.getTaskDefinitionKey(), item.getDossierStatus(), List.copyOf(item.getAllowedRoleCodes()),
                item.getFormKey(), item.getConditionExpression(), item.getDisplayOrder(),
                item.getLifecycleStatus().name(), item.getVersion(), item.getUpdatedBy(), item.getUpdatedAt(),
                item.getProcessVersion(), item.getDisplayLabel(), item.getDisplayIcon(), item.getUiGroup(),
                item.getTone(), item.getHelpText(), toBundle(item));
    }

    private static ExceptionResponse toException(ActionExceptionPolicy item) {
        return new ExceptionResponse(item.getId(), item.getActionCode(), item.getObjectType(), item.getProcessCode(),
                item.getFromStepKey(), item.getTargetType(), item.getTargetStepKey(),
                List.copyOf(item.getAllowedRoleCodes()), List.copyOf(item.getRequiredPermissions()),
                item.isRequiresApproval(), item.isRequiresReason(), item.isRequiresEvidence(), item.isEnabled(),
                item.getVersion(), item.getUpdatedBy(), item.getUpdatedAt());
    }

    private static AuditResponse toAudit(ActionStudioAudit item) {
        return new AuditResponse(item.getEntityType(), item.getEntityId(), item.getAction(), item.getActor(),
                item.getEventAt(), item.getDetail());
    }

    private static LinkedHashSet<String> normalizeCodes(List<String> values) {
        return values.stream().map(String::trim)
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
    }

    /**
     * Mã quy trình tồn tại song song ở 2 dạng không chủ ý thống nhất: dấu chấm (nghiệp vụ,
     * {@code dossier.quyTrinh}) và gạch dưới ({@code bpmn:process id}). Chuẩn hoá về chữ hoa,
     * bỏ mọi ký tự không phải chữ/số trước khi so khớp để luật không phụ thuộc người nhập/hệ
     * thống gọi dùng dấu chấm, gạch dưới, gạch ngang hay khoảng trắng.
     */
    private static String normalizeProcessCode(String value) {
        return value == null ? null : value.toUpperCase(java.util.Locale.ROOT).replaceAll("[^A-Z0-9]", "");
    }

    private static int specificity(ActionAvailabilityPolicy item) {
        return (item.getSurface() == null ? 0 : 1) + (item.getProcessCode() == null ? 0 : 1)
                + (item.getProcessVersion() == null ? 0 : 1)
                + (item.getTaskDefinitionKey() == null ? 0 : 1) + (item.getDossierStatus() == null ? 0 : 1);
    }

    private String outcomeAction(String outcome) {
        return outcomeKeywords.actionCode(outcome);
    }

    /**
     * Nút mà App ĐỀ XUẤT cho một nhánh có từ khoá chưa ai nhận, suy từ {@code kind} mà
     * {@link DeployedBpmnRoutingReader} đã tính sẵn từ node đích.
     *
     * <p>Chỉ là đề xuất để người chốt: App không tự ghi vào Danh mục nút. Đoán sai mà tự ghi thì nút
     * hiện nhãn "Đồng ý duyệt" nhưng hồ sơ chạy vào nhánh từ chối — không lỗi, không cảnh báo. Ngoài
     * ra từ khoá là tài sản toàn cục (một từ khoá chỉ thuộc một nút), nên việc thêm nó phải có người
     * ký trong audit.
     */
    private static String suggestedAction(String kind) {
        return switch (kind == null ? "" : kind) {
            case "reject" -> "REJECT_STEP";
            case "rework" -> "RETURN_STEP";
            case "forward", "complete" -> "APPROVE_STEP";
            default -> null;
        };
    }

    private static boolean isOutcomeAction(String actionCode) {
        return BpmnOutcomeCodes.isOutcomeAction(actionCode);
    }

    private AvailabilityRequest normalizeLegacyForm(AvailabilityRequest request) {
        String legacyFormKey = blankToNull(request.formKey());
        if (request.formBundle() != null || legacyFormKey == null) return request;
        Long formVersion = eformRepository.findById(legacyFormKey).map(Eform::getVersion).orElse(null);
        FormBundleRequest bundle = new FormBundleRequest("STEPPER", false, "ALL_REQUIRED_VALID", 1L,
                List.of(new FormBundleItemRequest(legacyFormKey, formVersion, 1, null,
                        true, "EDIT", false, null, "form")));
        return new AvailabilityRequest(request.id(), request.actionCode(), request.surface(), request.processCode(),
                request.taskDefinitionKey(), request.dossierStatus(), request.allowedRoleCodes(), null,
                request.conditionExpression(), request.displayOrder(), request.lifecycleStatus(),
                request.processVersion(), request.displayLabel(), request.displayIcon(), request.uiGroup(),
                request.tone(), request.helpText(), bundle);
    }

    private static FormBundleResponse toBundle(ActionAvailabilityPolicy policy) {
        if (policy == null || policy.getFormBundleItems().isEmpty()) return null;
        return new FormBundleResponse(policy.getBundleDisplayMode(), policy.isBundleAllowDraft(),
                policy.getBundleCompletionPolicy(), policy.getBundleVersion(), policy.getFormBundleItems().stream()
                        .sorted(Comparator.comparingInt(ActionFormBundleItem::getDisplayOrder))
                        .map(item -> new FormBundleItemResponse(item.getFormKey(), item.getFormVersion(),
                                item.getDisplayOrder(), item.getDisplayTitle(), item.isRequired(), item.getMode(),
                                item.isSkippable(), item.getConditionExpression(), item.getOutputNamespace()))
                        .toList());
    }

    private static String bundleJson(FormBundleResponse bundle) {
        if (bundle == null) return "null";
        com.fasterxml.jackson.databind.node.ObjectNode node = JSON.valueToTree(bundle);
        node.remove("version");
        try { return JSON.writeValueAsString(node); }
        catch (com.fasterxml.jackson.core.JsonProcessingException impossible) { throw new IllegalStateException(impossible); }
    }

    private void snapshotBundle(ActionAvailabilityPolicy policy, String actorHeader) {
        FormBundleResponse bundle = toBundle(policy);
        if (bundleSnapshots == null || bundle == null || bundle.version() == null) return;
        String id = policy.getId() + ":" + bundle.version();
        if (bundleSnapshots.existsById(id)) return;
        ActionFormBundleSnapshot snapshot = new ActionFormBundleSnapshot();
        snapshot.setId(id);
        snapshot.setPolicyId(policy.getId());
        snapshot.setBundleVersion(bundle.version());
        try { snapshot.setConfigJson(JSON.writeValueAsString(bundle)); }
        catch (com.fasterxml.jackson.core.JsonProcessingException impossible) { throw new IllegalStateException(impossible); }
        snapshot.setCreatedBy(ProcessDefinitionService.normalizeActor(actorHeader));
        snapshot.setCreatedAt(now());
        bundleSnapshots.save(snapshot);
    }

    private static String effectiveFormKey(ActionAvailabilityPolicy policy) {
        if (policy == null) return null;
        return policy.getFormBundleItems().stream().sorted(Comparator.comparingInt(ActionFormBundleItem::getDisplayOrder))
                .map(ActionFormBundleItem::getFormKey).findFirst().orElse(policy.getFormKey());
    }

    private static String override(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private static Map<String, Object> conditionContext(SimulationRequest request) {
        Map<String, Object> context = new java.util.LinkedHashMap<>(request.businessContext() == null
                ? Map.of() : request.businessContext());
        context.putIfAbsent("user", request.roleCodes());
        context.putIfAbsent("currentStep", Map.of("candidateGroups", request.roleCodes()));
        return context;
    }

    private static LinkedHashSet<String> csvCodes(String values) {
        if (values == null || values.isBlank()) return new LinkedHashSet<>();
        return java.util.Arrays.stream(values.split(",")).map(String::trim).filter(value -> !value.isEmpty())
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
    }

    private static boolean isDynamicRoleExpression(String value) {
        if (value == null) return false;
        String candidate = value.trim();
        return candidate.startsWith("=") || candidate.contains("${") || candidate.contains("#{");
    }

    private boolean isStandardAction(String actionCode) {
        return "STANDARD".equals(action(actionCode).getActionType());
    }

    private static boolean isActive(ActionAvailabilityPolicy policy) {
        return policy.getLifecycleStatus() == ActionAvailabilityPolicyStatus.ACTIVE;
    }

    private static void validatePresentation(ActionStudioAction action, String uiGroup, String tone) {
        switch (action.getActionType()) {
            case "SUPPORT" -> {
                if (!"MORE".equals(uiGroup) || !"default".equals(tone))
                    throw new IllegalArgumentException("Support Action chỉ được dùng nhóm MORE và tone default.");
            }
            case "EXCEPTION" -> {
                if (!"EXCEPTION".equals(uiGroup) || !Set.of("warning", "danger").contains(tone))
                    throw new IllegalArgumentException("Exception Action phải ở nhóm EXCEPTION với tone warning hoặc danger.");
            }
            case "STANDARD" -> {
                if (!Set.of("PRIMARY", "MORE").contains(uiGroup)
                        || !Set.of("primary", "default", "danger").contains(tone))
                    throw new IllegalArgumentException("Standard Action chỉ được dùng nhóm PRIMARY/MORE và tone primary/default/danger.");
                if ("REJECT_STEP".equals(action.getActionCode()) && "primary".equals(tone))
                    throw new IllegalArgumentException("REJECT_STEP không được dùng tone primary.");
            }
            default -> throw new IllegalArgumentException("Loại Action không hợp lệ: " + action.getActionType());
        }
    }

    private static String defaultIcon(ActionStudioAction action) {
        return "EXCEPTION".equals(action.getActionType()) ? "safety"
                : "SUPPORT".equals(action.getActionType()) ? "appstore" : "thunderbolt";
    }

    private static String defaultUiGroup(ActionStudioAction action) {
        return "EXCEPTION".equals(action.getActionType()) ? "EXCEPTION"
                : "SUPPORT".equals(action.getActionType()) ? "MORE" : "PRIMARY";
    }

    private static String defaultTone(ActionStudioAction action) {
        if ("REJECT_STEP".equals(action.getActionCode())) return "danger";
        if ("EXCEPTION".equals(action.getActionType())) return "warning";
        if (Set.of("SUBMIT", "APPROVE_STEP").contains(action.getActionCode())) return "primary";
        return "default";
    }

    private static int defaultDisplayOrder(ActionStudioAction action) {
        return switch (action.getActionCode()) {
            case "SUBMIT" -> 10;
            case "APPROVE_STEP" -> 11;
            case "RETURN_STEP" -> 12;
            case "REJECT_STEP" -> 13;
            default -> "SUPPORT".equals(action.getActionType()) ? 50
                    : "EXCEPTION".equals(action.getActionType()) ? 100 : 20;
        };
    }

    private static void requireOneOf(String field, String value, Set<String> allowed) {
        if (!allowed.contains(value)) {
            throw new IllegalArgumentException(field + " không hợp lệ: " + value);
        }
    }

    private static void assertVersion(String id, long expected, long actual) {
        if (expected != actual) throw ActionStudioConflictException.stale(id, expected, actual);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static OffsetDateTime now() {
        return OffsetDateTime.now(ZoneOffset.UTC);
    }
}

package vn.vht.qtkhcn.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.domain.ApprovalRule;
import vn.vht.qtkhcn.domain.ApprovalRuleAudit;
import vn.vht.qtkhcn.domain.ApprovalRuleVersion;
import vn.vht.qtkhcn.repository.ApprovalRuleAuditRepository;
import vn.vht.qtkhcn.repository.ApprovalRuleRepository;
import vn.vht.qtkhcn.repository.ApprovalRuleVersionRepository;
import vn.vht.qtkhcn.repository.ApprovalSlotRepository;
import vn.vht.qtkhcn.web.dto.AnalyzeApprovalRequest;
import vn.vht.qtkhcn.web.dto.ApprovalRuleAuditResponse;
import vn.vht.qtkhcn.web.dto.ApprovalRuleResponse;
import vn.vht.qtkhcn.web.dto.ApprovalRuleVersionResponse;
import vn.vht.qtkhcn.web.dto.ApprovalRuleWarningResponse;
import vn.vht.qtkhcn.web.dto.CreateApprovalRuleRequest;
import vn.vht.qtkhcn.web.dto.ResolveApprovalRequest;
import vn.vht.qtkhcn.web.dto.ResolveApprovalResponse;
import vn.vht.qtkhcn.web.dto.ResolveApprovalResponse.ApprovalResolveAuditResponse;
import vn.vht.qtkhcn.web.dto.ResolveApprovalResponse.SkippedRuleResponse;
import vn.vht.qtkhcn.web.dto.UpdateApprovalRuleRequest;

@Service
public class ApprovalMatrixService {
    private final ApprovalRuleRepository rules;
    private final ApprovalSlotRepository slots;
    private final ApprovalRuleVersionRepository versions;
    private final ApprovalRuleAuditRepository audits;
    private final ApprovalConditionEngine conditions;
    private final ApprovalDirectory directory;
    private final ApprovalMatrixAnalyzer analyzer;
    private final ObjectMapper objectMapper;

    public ApprovalMatrixService(ApprovalRuleRepository rules, ApprovalSlotRepository slots,
            ApprovalRuleVersionRepository versions, ApprovalRuleAuditRepository audits,
            ApprovalConditionEngine conditions, ApprovalDirectory directory,
            ApprovalMatrixAnalyzer analyzer, ObjectMapper objectMapper) {
        this.rules = rules;
        this.slots = slots;
        this.versions = versions;
        this.audits = audits;
        this.conditions = conditions;
        this.directory = directory;
        this.analyzer = analyzer;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<ApprovalRuleResponse> list() {
        return rules.findAllByOrderByPriorityAscIdAsc().stream()
                .map(rule -> ApprovalRuleResponse.from(rule, objectMapper)).toList();
    }

    @Transactional(readOnly = true)
    public ApprovalRuleResponse get(String id) {
        return ApprovalRuleResponse.from(rule(id), objectMapper);
    }

    @Transactional
    public ApprovalRuleResponse create(CreateApprovalRuleRequest request, String actorHeader) {
        JsonNode conditionTree = objectMapper.valueToTree(request.conditions());
        JsonNode assignment = objectMapper.valueToTree(request.assignment());
        validateRule(request.slot(), conditionTree, assignment, request.priority());
        String id = normalizeId(request.id());
        if (rules.existsById(id)) throw new ApprovalMatrixConflictException("Mã luật đã tồn tại: " + id);
        String actor = ProcessDefinitionService.normalizeActor(actorHeader);
        OffsetDateTime now = now();
        ApprovalRule rule = new ApprovalRule();
        rule.setId(id);
        rule.setDomainCode(normalizeDomain(request.domainCode()));
        rule.setName(request.ten().trim());
        rule.setSlotCode(ApprovalSlotService.normalizeCode(request.slot()));
        rule.setConditions(conditionTree.deepCopy());
        rule.setAssignment(assignment.deepCopy());
        rule.setPriority(request.priority());
        rule.setEnabled(request.enabled());
        rule.setVersion(1);
        rule.setCreatedBy(actor);
        rule.setCreatedAt(now);
        rule.setUpdatedBy(actor);
        rule.setUpdatedAt(now);
        rule = rules.saveAndFlush(rule);
        saveVersion(rule, note(request.changeNote(), "Tạo luật."), actor, now);
        saveAudit(rule, "CREATE", actor, "Tạo luật \"" + rule.getName() + "\".", now);
        return ApprovalRuleResponse.from(rule, objectMapper);
    }

    @Transactional
    public ApprovalRuleResponse update(String id, int expectedVersion, UpdateApprovalRuleRequest request,
            String actorHeader) {
        ApprovalRule rule = lockedRule(id);
        assertVersion(rule, expectedVersion);
        String slot = request.slot() == null ? rule.getSlotCode() : request.slot();
        JsonNode conditionTree = request.conditions() == null ? rule.getConditions()
                : objectMapper.valueToTree(request.conditions());
        JsonNode assignment = request.assignment() == null ? rule.getAssignment()
                : objectMapper.valueToTree(request.assignment());
        int priority = request.priority() == null ? rule.getPriority() : request.priority();
        validateRule(slot, conditionTree, assignment, priority);
        if (request.ten() != null) {
            if (request.ten().isBlank()) throw new IllegalArgumentException("Tên luật không được để trống.");
            rule.setName(request.ten().trim());
        }
        rule.setSlotCode(ApprovalSlotService.normalizeCode(slot));
        rule.setConditions(conditionTree.deepCopy());
        rule.setAssignment(assignment.deepCopy());
        rule.setPriority(priority);
        if (request.enabled() != null) rule.setEnabled(request.enabled());
        String actor = ProcessDefinitionService.normalizeActor(actorHeader);
        OffsetDateTime now = now();
        rule.setVersion(rule.getVersion() + 1);
        rule.setUpdatedBy(actor);
        rule.setUpdatedAt(now);
        rule = rules.saveAndFlush(rule);
        saveVersion(rule, note(request.changeNote(), "Cập nhật luật."), actor, now);
        saveAudit(rule, "UPDATE", actor, "Cập nhật luật \"" + rule.getName() + "\".", now);
        return ApprovalRuleResponse.from(rule, objectMapper);
    }

    @Transactional
    public ApprovalRuleResponse setEnabled(String id, int expectedVersion, boolean enabled,
            String actorHeader) {
        ApprovalRule rule = lockedRule(id);
        assertVersion(rule, expectedVersion);
        String actor = ProcessDefinitionService.normalizeActor(actorHeader);
        OffsetDateTime now = now();
        rule.setEnabled(enabled);
        rule.setVersion(rule.getVersion() + 1);
        rule.setUpdatedBy(actor);
        rule.setUpdatedAt(now);
        rule = rules.saveAndFlush(rule);
        saveVersion(rule, enabled ? "Bật luật." : "Tắt luật.", actor, now);
        saveAudit(rule, "TOGGLE", actor, enabled ? "Bật luật." : "Tắt luật.", now);
        return ApprovalRuleResponse.from(rule, objectMapper);
    }

    @Transactional
    public void delete(String id, int expectedVersion, String actorHeader) {
        ApprovalRule rule = lockedRule(id);
        assertVersion(rule, expectedVersion);
        String actor = ProcessDefinitionService.normalizeActor(actorHeader);
        saveAudit(rule, "DELETE", actor, "Xoá luật \"" + rule.getName() + "\".", now());
        rules.delete(rule);
    }

    @Transactional(readOnly = true)
    public List<ApprovalRuleVersionResponse> versions(String id) {
        rule(id);
        return versions.findByRuleIdOrderByVersionDesc(id).stream()
                .map(version -> ApprovalRuleVersionResponse.from(version, objectMapper)).toList();
    }

    @Transactional(readOnly = true)
    public List<ApprovalRuleAuditResponse> audit(String id) {
        if (!rules.existsById(id) && audits.findByRuleIdOrderByTimestampDesc(id).isEmpty()) {
            throw new EntityNotFoundException("Không tìm thấy luật " + id);
        }
        return audits.findByRuleIdOrderByTimestampDesc(id).stream()
                .map(ApprovalRuleAuditResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ResolveApprovalResponse resolve(ResolveApprovalRequest request) {
        String slot = ApprovalSlotService.normalizeCode(request.slot());
        if (!slots.existsById(slot)) throw new EntityNotFoundException("Không tìm thấy slot " + slot);
        List<ApprovalRule> candidates = rules.findBySlotCodeOrderByPriorityAscIdAsc(slot);
        List<SkippedRuleResponse> skipped = new ArrayList<>();
        ApprovalRule matched = null;
        for (ApprovalRule candidate : candidates) {
            boolean conditionMatched = candidate.isEnabled() && conditions.evaluate(candidate.getConditions(), request.context());
            if (conditionMatched && matched == null) {
                matched = candidate;
            } else {
                String reason = !candidate.isEnabled() ? "Đã tắt"
                        : conditionMatched ? "Khớp nhưng ưu tiên thấp hơn" : "Điều kiện không khớp";
                skipped.add(new SkippedRuleResponse(candidate.getId(), reason));
            }
        }
        LocalDate at = request.ngay() == null ? LocalDate.now(ZoneOffset.UTC) : request.ngay();
        if (matched == null) {
            var audit = new ApprovalResolveAuditResponse(Map.copyOf(request.context()), slot, null, null,
                    null, List.of(), List.of(), List.of(), skipped, at.toString());
            return new ResolveApprovalResponse(null, null, List.of(),
                    "Không có luật nào khớp — không cấp người xử lý (fail-closed).",
                    List.of("Không có luật khớp cho slot + context này."), audit);
        }
        var resolved = directory.resolve(matched.getAssignment(), at);
        List<String> finalIds = resolved.approvers().stream().filter(item -> !item.placeholder())
                .map(ResolveApprovalResponse.ResolvedApproverResponse::userId).toList();
        var audit = new ApprovalResolveAuditResponse(Map.copyOf(request.context()), slot, matched.getId(),
                matched.getVersion(), resolved.mode(), targetMaps(matched.getAssignment()), finalIds,
                resolved.delegations(), skipped, at.toString());
        return new ResolveApprovalResponse(matched.getId(), resolved.mode(), resolved.approvers(),
                "Khớp luật \"" + matched.getName() + "\" (ưu tiên " + matched.getPriority() + ").",
                resolved.warnings(), audit);
    }

    @Transactional(readOnly = true)
    public List<ApprovalRuleWarningResponse> analyze(AnalyzeApprovalRequest request) {
        List<ApprovalRule> selected = rules.findAllByOrderByPriorityAscIdAsc();
        if (request != null && request.ruleIds() != null && !request.ruleIds().isEmpty()) {
            var wanted = java.util.Set.copyOf(request.ruleIds());
            selected = selected.stream().filter(rule -> wanted.contains(rule.getId())).toList();
        }
        return analyzer.analyze(selected, slots.findAllByOrderBySortOrderAscCodeAsc());
    }

    private void validateRule(String rawSlot, JsonNode conditionTree, JsonNode assignment, int priority) {
        String slot = ApprovalSlotService.normalizeCode(rawSlot);
        if (!slots.existsById(slot)) throw new IllegalArgumentException("Slot không tồn tại: " + slot);
        if (priority < 0) throw new IllegalArgumentException("priority không được âm.");
        conditions.validate(conditionTree);
        validateAssignment(assignment);
    }

    private static void validateAssignment(JsonNode assignment) {
        if (assignment == null || !assignment.isObject()) {
            throw new IllegalArgumentException("assignment phải là một JSON object.");
        }
        String mode = assignment.path("mode").asText();
        if (!java.util.Set.of("ANY_ONE", "ALL", "SEQUENTIAL").contains(mode)) {
            throw new IllegalArgumentException("Chế độ assignment không hợp lệ: " + mode);
        }
        JsonNode targets = assignment.get("targets");
        if (targets == null || !targets.isArray()) {
            throw new IllegalArgumentException("assignment.targets phải là một mảng.");
        }
        for (JsonNode target : targets) {
            String type = target.path("type").asText();
            if (!java.util.Set.of("GROUP", "USER", "ORG_POSITION", "COUNCIL", "EXPRESSION").contains(type)) {
                throw new IllegalArgumentException("Loại target không hợp lệ: " + type);
            }
            if (type.equals("GROUP") && !target.path("roleCodes").isArray())
                throw new IllegalArgumentException("GROUP target cần mảng roleCodes.");
            if (type.equals("USER") && !target.path("userIds").isArray())
                throw new IllegalArgumentException("USER target cần mảng userIds.");
        }
    }

    private void saveVersion(ApprovalRule rule, String changeNote, String actor, OffsetDateTime at) {
        ApprovalRuleVersion version = new ApprovalRuleVersion();
        version.setId(UUID.randomUUID());
        version.setRuleId(rule.getId());
        version.setVersion(rule.getVersion());
        version.setSnapshot(snapshot(rule));
        version.setChangeNote(changeNote);
        version.setCreatedBy(actor);
        version.setCreatedAt(at);
        versions.save(version);
    }

    private void saveAudit(ApprovalRule rule, String action, String actor, String detail, OffsetDateTime at) {
        ApprovalRuleAudit audit = new ApprovalRuleAudit();
        audit.setId(UUID.randomUUID());
        audit.setRuleId(rule.getId());
        audit.setAction(action);
        audit.setVersion(rule.getVersion());
        audit.setActor(actor);
        audit.setTimestamp(at);
        audit.setDetail(detail);
        audits.save(audit);
    }

    private JsonNode snapshot(ApprovalRule rule) {
        ObjectNode node = objectMapper.createObjectNode();
        node.put("id", rule.getId());
        node.put("domainCode", rule.getDomainCode());
        node.put("ten", rule.getName());
        node.put("slot", rule.getSlotCode());
        node.set("conditions", rule.getConditions().deepCopy());
        node.set("assignment", rule.getAssignment().deepCopy());
        node.put("priority", rule.getPriority());
        node.put("enabled", rule.isEnabled());
        node.put("version", rule.getVersion());
        node.put("updatedAt", rule.getUpdatedAt().toString());
        node.put("updatedBy", rule.getUpdatedBy());
        return node;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> targetMaps(JsonNode assignment) {
        return objectMapper.convertValue(assignment.path("targets"), List.class);
    }

    private ApprovalRule rule(String id) {
        return rules.findById(id).orElseThrow(() -> new EntityNotFoundException("Không tìm thấy luật " + id));
    }

    private ApprovalRule lockedRule(String id) {
        return rules.findByIdForUpdate(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy luật " + id));
    }

    private static void assertVersion(ApprovalRule rule, int expected) {
        if (rule.getVersion() != expected) throw ApprovalMatrixConflictException.staleVersion(expected, rule.getVersion());
    }

    private static String normalizeId(String raw) {
        String value = raw == null || raw.isBlank() ? "AM-" + UUID.randomUUID() : raw.trim();
        if (!value.matches("[A-Za-z0-9_-]{1,64}")) {
            throw new IllegalArgumentException("Mã luật chỉ gồm chữ, số, gạch ngang và gạch dưới.");
        }
        return value;
    }

    private static String normalizeDomain(String raw) {
        if (raw == null || raw.isBlank()) return "KHCN";
        String value = raw.trim().toUpperCase(Locale.ROOT);
        if (!value.matches("[A-Z0-9_]{1,32}")) throw new IllegalArgumentException("domainCode không hợp lệ.");
        return value;
    }

    private static String note(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private static OffsetDateTime now() {
        return OffsetDateTime.now(ZoneOffset.UTC);
    }
}

package vn.vht.qtkhcn.service;

import jakarta.persistence.EntityNotFoundException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.domain.DmnRule;
import vn.vht.qtkhcn.domain.DmnRuleCategory;
import vn.vht.qtkhcn.domain.DmnRuleStatus;
import vn.vht.qtkhcn.domain.DmnRuleVersion;
import vn.vht.qtkhcn.domain.DmnDeployStatus;
import vn.vht.qtkhcn.camunda.DmnCamundaException;
import vn.vht.qtkhcn.camunda.DmnCamundaGateway;
import vn.vht.qtkhcn.repository.DmnRuleRepository;
import vn.vht.qtkhcn.repository.DmnRuleVersionRepository;
import vn.vht.qtkhcn.web.dto.CreateDmnRuleRequest;
import vn.vht.qtkhcn.web.dto.DmnRuleDetailResponse;
import vn.vht.qtkhcn.web.dto.DmnRuleSummaryResponse;
import vn.vht.qtkhcn.web.dto.DmnRuleVersionResponse;
import vn.vht.qtkhcn.web.dto.DmnRuleVersionSummaryResponse;
import vn.vht.qtkhcn.web.dto.SaveDmnRuleVersionRequest;
import vn.vht.qtkhcn.web.dto.EvaluateDmnDecisionResponse;

@Service
public class DmnRuleService {
    private final DmnRuleRepository ruleRepository;
    private final DmnRuleVersionRepository versionRepository;
    private final DmnArtifactValidator validator;
    private final DmnCamundaGateway camunda;

    public DmnRuleService(DmnRuleRepository ruleRepository,
            DmnRuleVersionRepository versionRepository,
            DmnArtifactValidator validator,
            DmnCamundaGateway camunda) {
        this.ruleRepository = ruleRepository;
        this.versionRepository = versionRepository;
        this.validator = validator;
        this.camunda = camunda;
    }

    @Transactional
    public DmnRuleDetailResponse create(CreateDmnRuleRequest request, String actorHeader) {
        String code = request.code().trim().toUpperCase(Locale.ROOT);
        if (ruleRepository.existsByCodeIgnoreCase(code)) {
            throw new DmnRuleConflictException("Mã luật DMN đã tồn tại: " + code);
        }
        String actor = ProcessDefinitionService.normalizeActor(actorHeader);
        OffsetDateTime now = now();
        DmnRule rule = new DmnRule();
        rule.setId(UUID.randomUUID());
        rule.setCode(code);
        rule.setName(request.name().trim());
        rule.setDescription(request.description().trim());
        rule.setCategory(request.category());
        rule.setStatus(DmnRuleStatus.DRAFT);
        rule.setLatestVersion(0);
        rule.setAppliedProcesses(normalizeProcesses(request.appliedProcesses()));
        rule.setCreatedBy(actor);
        rule.setCreatedAt(now);
        rule.setUpdatedBy(actor);
        rule.setUpdatedAt(now);
        rule = ruleRepository.saveAndFlush(rule);
        return DmnRuleDetailResponse.from(rule, List.of());
    }

    @Transactional(readOnly = true)
    public List<DmnRuleSummaryResponse> list(DmnRuleStatus status, DmnRuleCategory category, String query) {
        String q = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        return ruleRepository.findAllByOrderByUpdatedAtDesc().stream()
                .filter(rule -> status == null || rule.getStatus() == status)
                .filter(rule -> category == null || rule.getCategory() == category)
                .filter(rule -> q.isEmpty()
                        || rule.getCode().toLowerCase(Locale.ROOT).contains(q)
                        || rule.getName().toLowerCase(Locale.ROOT).contains(q)
                        || rule.getDescription().toLowerCase(Locale.ROOT).contains(q))
                .map(DmnRuleSummaryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public DmnRuleDetailResponse get(UUID id) {
        DmnRule rule = rule(id);
        return DmnRuleDetailResponse.from(rule, listVersionSummaries(id));
    }

    @Transactional(readOnly = true)
    public List<DmnRuleVersionSummaryResponse> listVersions(UUID id) {
        rule(id);
        return listVersionSummaries(id);
    }

    @Transactional(readOnly = true)
    public DmnRuleVersionResponse getVersion(UUID id, int version) {
        rule(id);
        return DmnRuleVersionResponse.from(version(id, version));
    }

    @Transactional
    public DmnRuleVersionResponse saveVersion(UUID id, SaveDmnRuleVersionRequest request, String actorHeader) {
        DmnRule rule = lockedRule(id);
        assertExpectedVersion(rule, request.expectedVersion());
        String checksum = validator.validateAndChecksum(request.dmnXml());

        String actor = ProcessDefinitionService.normalizeActor(actorHeader);
        OffsetDateTime now = now();
        DmnRuleVersion artifact = new DmnRuleVersion();
        artifact.setId(UUID.randomUUID());
        artifact.setRuleId(id);
        artifact.setVersion(rule.getLatestVersion() + 1);
        artifact.setDmnXml(request.dmnXml());
        artifact.setChecksumSha256(checksum);
        artifact.setChangeNote(request.changeNote().trim());
        artifact.setCreatedBy(actor);
        artifact.setCreatedAt(now);
        artifact.setDeployStatus(DmnDeployStatus.NOT_DEPLOYED);
        artifact = versionRepository.saveAndFlush(artifact);

        rule.setLatestVersion(artifact.getVersion());
        rule.setUpdatedBy(actor);
        rule.setUpdatedAt(now);
        ruleRepository.saveAndFlush(rule);
        return DmnRuleVersionResponse.from(artifact);
    }

    @Transactional
    public DmnRuleDetailResponse activate(UUID id, int version, int expectedVersion, String actorHeader) {
        DmnRule rule = lockedRule(id);
        assertExpectedVersion(rule, expectedVersion);
        DmnRuleVersion artifact = version(id, version);
        String actor = ProcessDefinitionService.normalizeActor(actorHeader);
        if (artifact.getDeployStatus() != DmnDeployStatus.DEPLOYED) {
            try {
                var deployed = camunda.deploy(artifact.getDmnXml(), rule.getCode() + "-v" + version + ".dmn");
                artifact.setDeployStatus(DmnDeployStatus.DEPLOYED);
                artifact.setCamundaDeploymentKey(deployed.deploymentKey());
                artifact.setCamundaDecisionKey(deployed.decisionKey());
                artifact.setCamundaDecisionId(deployed.decisionId());
                artifact.setCamundaDecisionVersion(deployed.decisionVersion());
                artifact.setDeployedAt(now());
                artifact.setDeployError(null);
                versionRepository.saveAndFlush(artifact);
            } catch (DmnCamundaException e) {
                artifact.setDeployStatus(DmnDeployStatus.FAILED);
                artifact.setCamundaDeploymentKey(null);
                artifact.setCamundaDecisionKey(null);
                artifact.setCamundaDecisionId(null);
                artifact.setCamundaDecisionVersion(null);
                artifact.setDeployedAt(null);
                artifact.setDeployError(e.getDetail());
                versionRepository.saveAndFlush(artifact);
                return DmnRuleDetailResponse.from(rule, listVersionSummaries(id));
            }
        }
        rule.setStatus(DmnRuleStatus.ACTIVE);
        rule.setActiveVersion(version);
        rule.setUpdatedBy(actor);
        rule.setUpdatedAt(now());
        rule = ruleRepository.saveAndFlush(rule);
        return DmnRuleDetailResponse.from(rule, listVersionSummaries(id));
    }

    @Transactional(readOnly = true)
    public EvaluateDmnDecisionResponse evaluate(UUID id, Map<String, Object> variables) {
        DmnRule rule = rule(id);
        if (rule.getStatus() != DmnRuleStatus.ACTIVE || rule.getActiveVersion() == null) {
            throw new IllegalStateException("Luật DMN chưa được kích hoạt.");
        }
        DmnRuleVersion artifact = version(id, rule.getActiveVersion());
        if (artifact.getDeployStatus() != DmnDeployStatus.DEPLOYED
                || artifact.getCamundaDecisionKey() == null) {
            throw new IllegalStateException("Phiên bản đang kích hoạt chưa deploy thành công lên Camunda.");
        }
        return EvaluateDmnDecisionResponse.from(camunda.evaluate(artifact.getCamundaDecisionKey(), variables));
    }

    @Transactional
    public DmnRuleDetailResponse disable(UUID id, int expectedVersion, String actorHeader) {
        DmnRule rule = lockedRule(id);
        assertExpectedVersion(rule, expectedVersion);
        String actor = ProcessDefinitionService.normalizeActor(actorHeader);
        rule.setStatus(DmnRuleStatus.DISABLED);
        rule.setActiveVersion(null);
        rule.setUpdatedBy(actor);
        rule.setUpdatedAt(now());
        rule = ruleRepository.saveAndFlush(rule);
        return DmnRuleDetailResponse.from(rule, listVersionSummaries(id));
    }

    private DmnRule rule(UUID id) {
        return ruleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy luật DMN " + id));
    }

    private DmnRule lockedRule(UUID id) {
        return ruleRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy luật DMN " + id));
    }

    private DmnRuleVersion version(UUID id, int version) {
        return versionRepository.findByRuleIdAndVersion(id, version)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy phiên bản DMN v" + version + " của luật " + id));
    }

    private List<DmnRuleVersionSummaryResponse> listVersionSummaries(UUID id) {
        return versionRepository.findByRuleIdOrderByVersionDesc(id).stream()
                .map(DmnRuleVersionSummaryResponse::from)
                .toList();
    }

    private static void assertExpectedVersion(DmnRule rule, int expectedVersion) {
        if (rule.getLatestVersion() != expectedVersion) {
            throw DmnRuleConflictException.staleVersion(expectedVersion, rule.getLatestVersion());
        }
    }

    private static LinkedHashSet<String> normalizeProcesses(Iterable<String> processes) {
        LinkedHashSet<String> normalized = new LinkedHashSet<>();
        for (String process : processes) {
            normalized.add(process.trim());
        }
        return normalized;
    }

    private static OffsetDateTime now() {
        return OffsetDateTime.now(ZoneOffset.UTC);
    }
}

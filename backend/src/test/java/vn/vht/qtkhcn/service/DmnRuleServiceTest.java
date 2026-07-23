package vn.vht.qtkhcn.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import vn.vht.qtkhcn.domain.DmnRule;
import vn.vht.qtkhcn.domain.DmnRuleCategory;
import vn.vht.qtkhcn.domain.DmnRuleStatus;
import vn.vht.qtkhcn.domain.DmnRuleVersion;
import vn.vht.qtkhcn.domain.DmnRuleVersionDecision;
import vn.vht.qtkhcn.repository.DmnRuleRepository;
import vn.vht.qtkhcn.repository.DmnRuleVersionDecisionRepository;
import vn.vht.qtkhcn.repository.DmnRuleVersionRepository;
import vn.vht.qtkhcn.web.dto.CreateDmnRuleRequest;
import vn.vht.qtkhcn.web.dto.SaveDmnRuleVersionRequest;
import vn.vht.qtkhcn.camunda.DmnCamundaGateway;
import vn.vht.qtkhcn.camunda.DmnCamundaException;
import vn.vht.qtkhcn.domain.DmnDeployStatus;

class DmnRuleServiceTest {
    private static final String XML = DmnArtifactValidatorTest.validDmn();
    private static final String CHECKSUM = "a".repeat(64);
    private DmnRuleRepository rules;
    private DmnRuleVersionRepository versions;
    private DmnRuleVersionDecisionRepository decisions;
    private DmnArtifactValidator validator;
    private DmnRuleService service;
    private DmnCamundaGateway camunda;

    @BeforeEach
    void setUp() {
        rules = mock(DmnRuleRepository.class);
        versions = mock(DmnRuleVersionRepository.class);
        decisions = mock(DmnRuleVersionDecisionRepository.class);
        validator = mock(DmnArtifactValidator.class);
        camunda = mock(DmnCamundaGateway.class);
        service = new DmnRuleService(rules, versions, decisions, validator, camunda);
        when(rules.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(versions.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(versions.findByRuleIdOrderByVersionDesc(any())).thenReturn(List.of());
        when(decisions.findByRuleVersionIdOrderByDisplayOrder(any())).thenReturn(List.of());
        when(decisions.findByRuleVersionIdInOrderByDisplayOrder(any())).thenReturn(List.of());
        when(validator.validateAndChecksum(XML)).thenReturn(CHECKSUM);
    }

    @Test
    void createNormalizesCodeAndStartsWithoutArtifact() {
        var created = service.create(new CreateDmnRuleRequest(
                " br-rd02 ", " Routing ", " Route RD02 ", DmnRuleCategory.ROUTING,
                Set.of(" RD02.01 ", "RD01.01")), "alice");

        assertEquals("BR-RD02", created.rule().code());
        assertEquals(DmnRuleStatus.DRAFT, created.rule().status());
        assertEquals(0, created.rule().latestVersion());
        assertEquals(List.of("RD01.01", "RD02.01"), created.rule().appliedProcesses());
        assertEquals(List.of(), created.versions());
    }

    @Test
    void duplicateCodeFailsBeforeWriting() {
        when(rules.existsByCodeIgnoreCase("BR-RD02")).thenReturn(true);

        assertThrows(DmnRuleConflictException.class, () -> service.create(new CreateDmnRuleRequest(
                "BR-RD02", "Routing", "Route RD02", DmnRuleCategory.ROUTING,
                Set.of("RD02.01")), "alice"));

        verify(rules, never()).saveAndFlush(any());
    }

    @Test
    void saveCreatesImmutableNextVersionAndUpdatesLatestPointer() {
        DmnRule rule = rule(0);
        when(rules.findByIdForUpdate(rule.getId())).thenReturn(Optional.of(rule));

        var saved = service.saveVersion(rule.getId(),
                new SaveDmnRuleVersionRequest(0, XML, "Initial table"), "bob");

        assertEquals(1, saved.version());
        assertEquals(XML, saved.dmnXml());
        assertEquals(1, rule.getLatestVersion());
        assertEquals(DmnRuleStatus.DRAFT, rule.getStatus());
        assertNull(rule.getActiveVersion());
        verify(versions).saveAndFlush(any(DmnRuleVersion.class));
    }

    @Test
    void staleSaveAndInvalidDmnNeverWriteVersion() {
        DmnRule rule = rule(2);
        when(rules.findByIdForUpdate(rule.getId())).thenReturn(Optional.of(rule));

        assertThrows(DmnRuleConflictException.class, () -> service.saveVersion(rule.getId(),
                new SaveDmnRuleVersionRequest(1, XML, "stale"), "bob"));
        verify(validator, never()).validateAndChecksum(any());
        verify(versions, never()).saveAndFlush(any());

        when(validator.validateAndChecksum("bad")).thenThrow(
                new DmnValidationException("DMN XML không hợp lệ.", List.of("bad")));
        assertThrows(DmnValidationException.class, () -> service.saveVersion(rule.getId(),
                new SaveDmnRuleVersionRequest(2, "bad", "invalid"), "bob"));
        verify(versions, never()).saveAndFlush(any());
    }

    @Test
    void activateCanPointToOlderImmutableVersionAndDisableClearsPointer() {
        DmnRule rule = rule(3);
        when(rules.findByIdForUpdate(rule.getId())).thenReturn(Optional.of(rule));
        when(versions.existsByRuleIdAndVersion(rule.getId(), 2)).thenReturn(true);
        DmnRuleVersion artifact = new DmnRuleVersion();
        artifact.setId(UUID.randomUUID());
        artifact.setRuleId(rule.getId());
        artifact.setVersion(2);
        artifact.setDmnXml(XML);
        when(versions.findByRuleIdAndVersion(rule.getId(), 2)).thenReturn(Optional.of(artifact));
        when(camunda.deploy(XML, "BR-RD02-v2.dmn"))
                .thenReturn(new DmnCamundaGateway.DeploymentResult(10L, List.of(
                        new DmnCamundaGateway.DeployedDecision(20L, "decision-main", "Main", 1, true))));

        var active = service.activate(rule.getId(), 2, 3, "approver");
        assertEquals(DmnRuleStatus.ACTIVE, active.rule().status());
        assertEquals(2, active.rule().activeVersion());
        assertEquals(20L, artifact.getCamundaDecisionKey());

        var disabled = service.disable(rule.getId(), 3, "approver");
        assertEquals(DmnRuleStatus.DISABLED, disabled.rule().status());
        assertNull(disabled.rule().activeVersion());
    }

    @Test
    void failedDeploymentIsStoredAndRuleIsNotActivated() {
        DmnRule rule = rule(1);
        DmnRuleVersion artifact = new DmnRuleVersion();
        artifact.setRuleId(rule.getId());
        artifact.setVersion(1);
        artifact.setDmnXml(XML);
        artifact.setDeployStatus(DmnDeployStatus.NOT_DEPLOYED);
        when(rules.findByIdForUpdate(rule.getId())).thenReturn(Optional.of(rule));
        when(versions.findByRuleIdAndVersion(rule.getId(), 1)).thenReturn(Optional.of(artifact));
        when(camunda.deploy(XML, "BR-RD02-v1.dmn"))
                .thenThrow(new DmnCamundaException("deploy failed", "invalid FEEL", null));

        service.activate(rule.getId(), 1, 1, "approver");

        assertEquals(DmnDeployStatus.FAILED, artifact.getDeployStatus());
        assertEquals("invalid FEEL", artifact.getDeployError());
        assertEquals(DmnRuleStatus.DRAFT, rule.getStatus());
        assertNull(rule.getActiveVersion());
        verify(versions).saveAndFlush(artifact);
    }

    @Test
    void activateStoresEveryDeployedDecisionAndPointsSingularColumnsAtFirstRoot() {
        DmnRule rule = rule(1);
        when(rules.findByIdForUpdate(rule.getId())).thenReturn(Optional.of(rule));
        DmnRuleVersion artifact = new DmnRuleVersion();
        artifact.setId(UUID.randomUUID());
        artifact.setRuleId(rule.getId());
        artifact.setVersion(1);
        artifact.setDmnXml(XML);
        when(versions.findByRuleIdAndVersion(rule.getId(), 1)).thenReturn(Optional.of(artifact));
        // DRD 3 bảng nối chuỗi: chỉ loaiHoiDong là terminal, dù nó đứng cuối tài liệu.
        when(camunda.deploy(XML, "BR-RD02-v1.dmn"))
                .thenReturn(new DmnCamundaGateway.DeploymentResult(10L, List.of(
                        new DmnCamundaGateway.DeployedDecision(21L, "capNhiemVu", "Cấp", 1, false),
                        new DmnCamundaGateway.DeployedDecision(22L, "canHoiDong", "Cần", 1, false),
                        new DmnCamundaGateway.DeployedDecision(23L, "loaiHoiDong", "Loại", 1, true))));

        service.activate(rule.getId(), 1, 1, "approver");

        assertEquals(23L, artifact.getCamundaDecisionKey());
        assertEquals("loaiHoiDong", artifact.getCamundaDecisionId());
        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<DmnRuleVersionDecision>> saved = ArgumentCaptor.forClass(List.class);
        verify(decisions).deleteByRuleVersionId(artifact.getId());
        verify(decisions).saveAllAndFlush(saved.capture());
        assertEquals(List.of("capNhiemVu", "canHoiDong", "loaiHoiDong"),
                saved.getValue().stream().map(DmnRuleVersionDecision::getDecisionId).toList());
        assertEquals(List.of(0, 1, 2),
                saved.getValue().stream().map(DmnRuleVersionDecision::getDisplayOrder).toList());
        assertEquals(List.of(false, false, true),
                saved.getValue().stream().map(DmnRuleVersionDecision::isRoot).toList());
    }

    @Test
    void evaluateStartsFromEveryRootDecisionAndReturnsResultPerDecision() {
        DmnRule rule = rule(1);
        rule.setStatus(DmnRuleStatus.ACTIVE);
        rule.setActiveVersion(1);
        DmnRuleVersion artifact = new DmnRuleVersion();
        artifact.setId(UUID.randomUUID());
        artifact.setRuleId(rule.getId());
        artifact.setVersion(1);
        artifact.setDeployStatus(DmnDeployStatus.DEPLOYED);
        artifact.setCamundaDecisionKey(23L);
        when(rules.findById(rule.getId())).thenReturn(Optional.of(rule));
        when(versions.findByRuleIdAndVersion(rule.getId(), 1)).thenReturn(Optional.of(artifact));
        when(decisions.findByRuleVersionIdOrderByDisplayOrder(artifact.getId())).thenReturn(List.of(
                decisionRow(artifact.getId(), "capNhiemVu", 21L, false, 0),
                decisionRow(artifact.getId(), "loaiHoiDong", 23L, true, 1)));
        when(camunda.evaluate(List.of(23L), Map.of("budget", 10)))
                .thenReturn(new DmnCamundaGateway.EvaluationResult(List.of(
                        new DmnCamundaGateway.EvaluatedDecisionResult(30L, "capNhiemVu", "Cấp", 1,
                                Map.of("cap", "TAP_DOAN"), List.of()),
                        new DmnCamundaGateway.EvaluatedDecisionResult(30L, "loaiHoiDong", "Loại", 2,
                                Map.of("result", "APPROVE"),
                                List.of(new DmnCamundaGateway.MatchedRule("R1", 0,
                                        Map.of("result", "APPROVE")))))));

        var result = service.evaluate(rule.getId(), Map.of("budget", 10));

        assertEquals(List.of("capNhiemVu", "loaiHoiDong"),
                result.decisions().stream().map(d -> d.decisionId()).toList());
        var terminal = result.decisions().get(1);
        assertEquals("R1", terminal.matchedRules().getFirst().ruleId());
        assertEquals("APPROVE", terminal.outputs().get("result"));
    }

    @Test
    void evaluateFallsBackToSingularDecisionKeyForVersionsDeployedBeforeDrdSupport() {
        DmnRule rule = rule(1);
        rule.setStatus(DmnRuleStatus.ACTIVE);
        rule.setActiveVersion(1);
        DmnRuleVersion artifact = new DmnRuleVersion();
        artifact.setId(UUID.randomUUID());
        artifact.setRuleId(rule.getId());
        artifact.setVersion(1);
        artifact.setDeployStatus(DmnDeployStatus.DEPLOYED);
        artifact.setCamundaDecisionKey(20L);
        when(rules.findById(rule.getId())).thenReturn(Optional.of(rule));
        when(versions.findByRuleIdAndVersion(rule.getId(), 1)).thenReturn(Optional.of(artifact));
        // Bảng con rỗng: version deploy trước migration V25.
        when(camunda.evaluate(List.of(20L), Map.of("budget", 10)))
                .thenReturn(new DmnCamundaGateway.EvaluationResult(List.of(
                        new DmnCamundaGateway.EvaluatedDecisionResult(30L, "decision-main", "Main", 2,
                                Map.of("result", "APPROVE"), List.of()))));

        var result = service.evaluate(rule.getId(), Map.of("budget", 10));

        assertEquals(1, result.decisions().size());
        assertEquals("APPROVE", result.decisions().getFirst().outputs().get("result"));
    }

    private static DmnRuleVersionDecision decisionRow(UUID versionId, String decisionId, long key,
            boolean root, int order) {
        DmnRuleVersionDecision row = new DmnRuleVersionDecision();
        row.setId(UUID.randomUUID());
        row.setRuleVersionId(versionId);
        row.setDecisionId(decisionId);
        row.setCamundaDecisionKey(key);
        row.setCamundaDecisionVersion(1);
        row.setRoot(root);
        row.setDisplayOrder(order);
        return row;
    }

    private static DmnRule rule(int latestVersion) {
        DmnRule rule = new DmnRule();
        rule.setId(UUID.randomUUID());
        rule.setCode("BR-RD02");
        rule.setName("Routing");
        rule.setDescription("Route RD02");
        rule.setCategory(DmnRuleCategory.ROUTING);
        rule.setStatus(DmnRuleStatus.DRAFT);
        rule.setLatestVersion(latestVersion);
        rule.setAppliedProcesses(new LinkedHashSet<>(Set.of("RD02.01")));
        rule.setCreatedBy("alice");
        rule.setCreatedAt(OffsetDateTime.now());
        rule.setUpdatedBy("alice");
        rule.setUpdatedAt(OffsetDateTime.now());
        return rule;
    }

}

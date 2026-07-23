package vn.vht.qtkhcn.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.domain.ServiceTaskBinding;
import vn.vht.qtkhcn.domain.ServiceTaskBindingStatus;
import vn.vht.qtkhcn.domain.ServiceTaskConfigVersion;
import vn.vht.qtkhcn.domain.ServiceTaskConfigVersionStatus;
import vn.vht.qtkhcn.domain.ServiceTaskDefinition;
import vn.vht.qtkhcn.domain.ServiceTaskDefinitionStatus;
import vn.vht.qtkhcn.domain.ServiceTaskTypeCode;
import vn.vht.qtkhcn.repository.ServiceTaskBindingRepository;
import vn.vht.qtkhcn.repository.ServiceTaskConfigVersionRepository;
import vn.vht.qtkhcn.repository.ServiceTaskDefinitionRepository;

class ServiceTaskConfigResolverTest {

    private static final String PROCESS = "RD02_02";
    private static final String ELEMENT = "Check_ChuTruongTD";
    private static final String JOB_TYPE = "khcn.rd0202.check-chu-truong-td";
    private static final UUID DEFINITION_ID = UUID.randomUUID();

    private ServiceTaskBindingRepository bindings;
    private ServiceTaskDefinitionRepository definitions;
    private ServiceTaskConfigVersionRepository versions;
    private ServiceTaskConfigResolver resolver;

    @BeforeEach
    void setUp() {
        bindings = mock(ServiceTaskBindingRepository.class);
        definitions = mock(ServiceTaskDefinitionRepository.class);
        versions = mock(ServiceTaskConfigVersionRepository.class);
        resolver = new ServiceTaskConfigResolver(bindings, definitions, versions, new ObjectMapper());
    }

    @Test
    void resolvesPinnedBindingThroughActiveDefinitionAndVersion() {
        givenPinnedBinding();
        givenDefinition(ServiceTaskDefinitionStatus.ACTIVE, 1);
        givenVersion(1, ServiceTaskConfigVersionStatus.ACTIVE,
                "{\"typeCode\":\"EVALUATE_DECISION\",\"resultVariable\":\"dieuKienMacDinhDat\",\"stubResult\":true}");

        ResolvedServiceTaskConfig config = resolver.resolve(PROCESS, ELEMENT, JOB_TYPE).orElseThrow();

        assertEquals("CHECK_CHU_TRUONG_TD", config.definitionCode());
        assertEquals(ServiceTaskTypeCode.EVALUATE_DECISION, config.typeCode());
        assertEquals(1, config.versionNo());
        assertEquals(Optional.of("dieuKienMacDinhDat"), config.resultVariable());
        assertEquals(Optional.of(true), config.stubResult());
    }

    @Test
    void pinnedBindingWinsOverJobTypeBinding() {
        givenPinnedBinding();
        givenDefinition(ServiceTaskDefinitionStatus.ACTIVE, 1);
        givenVersion(1, ServiceTaskConfigVersionStatus.ACTIVE, "{\"resultVariable\":\"a\"}");

        assertTrue(resolver.resolve(PROCESS, ELEMENT, JOB_TYPE).isPresent());

        // Không được chạm tới nhánh binding rộng khi đã có binding ghim đúng element.
        verify(bindings, never()).findByJobTypeAndElementIdIsNullAndBindingStatus(any(), any());
    }

    @Test
    void fallsBackToJobTypeBindingWhenElementNotPinned() {
        when(bindings.findByBpmnProcessIdAndElementIdAndBindingStatus(PROCESS, ELEMENT, ServiceTaskBindingStatus.ACTIVE))
                .thenReturn(Optional.empty());
        ServiceTaskBinding wide = binding(null);
        when(bindings.findByJobTypeAndElementIdIsNullAndBindingStatus(JOB_TYPE, ServiceTaskBindingStatus.ACTIVE))
                .thenReturn(Optional.of(wide));
        givenDefinition(ServiceTaskDefinitionStatus.ACTIVE, 2);
        givenVersion(2, ServiceTaskConfigVersionStatus.ACTIVE, "{\"resultVariable\":\"tuJobType\"}");

        ResolvedServiceTaskConfig config = resolver.resolve(PROCESS, ELEMENT, JOB_TYPE).orElseThrow();

        assertEquals(Optional.of("tuJobType"), config.resultVariable());
        assertEquals(2, config.versionNo());
    }

    @Test
    void emptyWhenNoBinding() {
        when(bindings.findByBpmnProcessIdAndElementIdAndBindingStatus(any(), any(), any()))
                .thenReturn(Optional.empty());
        when(bindings.findByJobTypeAndElementIdIsNullAndBindingStatus(any(), any()))
                .thenReturn(Optional.empty());

        assertTrue(resolver.resolve(PROCESS, ELEMENT, JOB_TYPE).isEmpty());
        verify(definitions, never()).findById(any());
    }

    @Test
    void emptyWhenDefinitionNotActive() {
        givenPinnedBinding();
        givenDefinition(ServiceTaskDefinitionStatus.DEPRECATED, 1);
        givenVersion(1, ServiceTaskConfigVersionStatus.ACTIVE, "{}");

        assertTrue(resolver.resolve(PROCESS, ELEMENT, JOB_TYPE).isEmpty());
    }

    @Test
    void emptyWhenDefinitionHasNoActiveVersionPointer() {
        givenPinnedBinding();
        givenDefinition(ServiceTaskDefinitionStatus.ACTIVE, null);

        assertTrue(resolver.resolve(PROCESS, ELEMENT, JOB_TYPE).isEmpty());
        verify(versions, never()).findByDefinitionIdAndVersion(any(), eq(1));
    }

    @Test
    void emptyWhenPointedVersionIsNotActive() {
        givenPinnedBinding();
        givenDefinition(ServiceTaskDefinitionStatus.ACTIVE, 1);
        givenVersion(1, ServiceTaskConfigVersionStatus.ARCHIVED, "{}");

        assertTrue(resolver.resolve(PROCESS, ELEMENT, JOB_TYPE).isEmpty());
    }

    @Test
    void emptyWhenConfigJsonIsMalformed() {
        givenPinnedBinding();
        givenDefinition(ServiceTaskDefinitionStatus.ACTIVE, 1);
        givenVersion(1, ServiceTaskConfigVersionStatus.ACTIVE, "{ khong-phai-json");

        assertTrue(resolver.resolve(PROCESS, ELEMENT, JOB_TYPE).isEmpty());
    }

    @Test
    void stubResultEmptyWhenFieldAbsentOrNotBoolean() {
        givenPinnedBinding();
        givenDefinition(ServiceTaskDefinitionStatus.ACTIVE, 1);
        givenVersion(1, ServiceTaskConfigVersionStatus.ACTIVE, "{\"stubResult\":\"true\"}");

        ResolvedServiceTaskConfig config = resolver.resolve(PROCESS, ELEMENT, JOB_TYPE).orElseThrow();

        // Chuỗi "true" KHÔNG được coi là boolean — tránh cấu hình sai kiểu lọt thành true.
        assertTrue(config.stubResult().isEmpty());
        assertTrue(config.resultVariable().isEmpty());
    }

    private void givenPinnedBinding() {
        when(bindings.findByBpmnProcessIdAndElementIdAndBindingStatus(PROCESS, ELEMENT, ServiceTaskBindingStatus.ACTIVE))
                .thenReturn(Optional.of(binding(ELEMENT)));
    }

    private ServiceTaskBinding binding(String elementId) {
        ServiceTaskBinding binding = new ServiceTaskBinding();
        binding.setId(UUID.randomUUID());
        binding.setBpmnProcessId(PROCESS);
        binding.setElementId(elementId);
        binding.setJobType(JOB_TYPE);
        binding.setDefinitionId(DEFINITION_ID);
        binding.setBindingStatus(ServiceTaskBindingStatus.ACTIVE);
        binding.setProcessCode("RD02.02");
        binding.setTaskName("Hệ thống — Kiểm tra QĐ phê duyệt chủ trương cấp TĐ");
        binding.setEffectiveFrom(LocalDate.now());
        binding.setCreatedBy("test");
        binding.setUpdatedAt(OffsetDateTime.now());
        return binding;
    }

    private void givenDefinition(ServiceTaskDefinitionStatus status, Integer activeVersion) {
        ServiceTaskDefinition definition = new ServiceTaskDefinition();
        definition.setId(DEFINITION_ID);
        definition.setCode("CHECK_CHU_TRUONG_TD");
        definition.setName("Kiểm tra QĐ phê duyệt chủ trương cấp TĐ");
        definition.setDescription("test");
        definition.setTypeCode(ServiceTaskTypeCode.EVALUATE_DECISION);
        definition.setStatus(status);
        definition.setOwnerModule("RD02");
        definition.setLatestVersion(activeVersion == null ? 0 : activeVersion);
        definition.setActiveVersion(activeVersion);
        definition.setCreatedBy("test");
        definition.setCreatedAt(OffsetDateTime.now());
        definition.setUpdatedBy("test");
        definition.setUpdatedAt(OffsetDateTime.now());
        when(definitions.findById(DEFINITION_ID)).thenReturn(Optional.of(definition));
    }

    private void givenVersion(int versionNo, ServiceTaskConfigVersionStatus status, String configJson) {
        ServiceTaskConfigVersion version = new ServiceTaskConfigVersion();
        version.setId(UUID.randomUUID());
        version.setDefinitionId(DEFINITION_ID);
        version.setVersion(versionNo);
        version.setConfigJson(configJson);
        version.setInputMapping("[]");
        version.setOutputMapping("[]");
        version.setErrorPolicy("{}");
        version.setStatus(status);
        version.setChangeNote("test");
        version.setCreatedBy("test");
        version.setCreatedAt(OffsetDateTime.now());
        when(versions.findByDefinitionIdAndVersion(DEFINITION_ID, versionNo)).thenReturn(Optional.of(version));
    }
}

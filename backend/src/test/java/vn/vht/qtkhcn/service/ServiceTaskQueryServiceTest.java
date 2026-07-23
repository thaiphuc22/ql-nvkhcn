package vn.vht.qtkhcn.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;
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
import vn.vht.qtkhcn.web.dto.ServiceTaskDtos.Binding;
import vn.vht.qtkhcn.web.dto.ServiceTaskDtos.DefinitionDetail;
import vn.vht.qtkhcn.web.dto.ServiceTaskDtos.DefinitionSummary;

class ServiceTaskQueryServiceTest {

    private static final UUID DEF_ID = UUID.randomUUID();
    private static final UUID OTHER_ID = UUID.randomUUID();

    private ServiceTaskDefinitionRepository definitions;
    private ServiceTaskConfigVersionRepository versions;
    private ServiceTaskBindingRepository bindings;
    private ServiceTaskQueryService service;

    @BeforeEach
    void setUp() {
        definitions = mock(ServiceTaskDefinitionRepository.class);
        versions = mock(ServiceTaskConfigVersionRepository.class);
        bindings = mock(ServiceTaskBindingRepository.class);
        service = new ServiceTaskQueryService(definitions, versions, bindings, new ObjectMapper());
    }

    @Test
    void listCountsBindingsPerDefinition() {
        when(definitions.findAllByOrderByCodeAsc())
                .thenReturn(List.of(definition(DEF_ID, "CHECK_CHU_TRUONG_TD", ServiceTaskDefinitionStatus.ACTIVE),
                        definition(OTHER_ID, "ZZ_KHAC", ServiceTaskDefinitionStatus.DRAFT)));
        when(bindings.findAll()).thenReturn(List.of(binding(DEF_ID, "Check_ChuTruongTD"), binding(DEF_ID, "Check_Khac")));

        List<DefinitionSummary> result = service.list(null, null);

        assertEquals(2, result.size());
        assertEquals(2, result.get(0).bindingCount());
        assertEquals(0, result.get(1).bindingCount());
    }

    @Test
    void listFiltersByStatus() {
        when(definitions.findAllByOrderByCodeAsc())
                .thenReturn(List.of(definition(DEF_ID, "CHECK_CHU_TRUONG_TD", ServiceTaskDefinitionStatus.ACTIVE),
                        definition(OTHER_ID, "ZZ_KHAC", ServiceTaskDefinitionStatus.DRAFT)));
        when(bindings.findAll()).thenReturn(List.of());

        List<DefinitionSummary> result = service.list(ServiceTaskDefinitionStatus.DRAFT, null);

        assertEquals(1, result.size());
        assertEquals("ZZ_KHAC", result.get(0).code());
    }

    @Test
    void listSearchesCodeNameModuleAndTags() {
        when(definitions.findAllByOrderByCodeAsc())
                .thenReturn(List.of(definition(DEF_ID, "CHECK_CHU_TRUONG_TD", ServiceTaskDefinitionStatus.ACTIVE)));
        when(bindings.findAll()).thenReturn(List.of());

        // Tag 'rd02' — chữ hoa/thường không được ảnh hưởng kết quả.
        assertEquals(1, service.list(null, "RD02").size());
        assertEquals(1, service.list(null, "chu_truong").size());
        assertEquals(0, service.list(null, "khong-co-gi").size());
    }

    @Test
    void getReturnsVersionsWithParsedJsonNotRawString() {
        when(definitions.findById(DEF_ID))
                .thenReturn(Optional.of(definition(DEF_ID, "CHECK_CHU_TRUONG_TD", ServiceTaskDefinitionStatus.ACTIVE)));
        when(versions.findByDefinitionIdOrderByVersionDesc(DEF_ID)).thenReturn(List.of(
                version(1, "{\"resultVariable\":\"dieuKienMacDinhDat\",\"stubResult\":true}")));
        when(bindings.findByDefinitionIdOrderByBpmnProcessIdAscElementIdAsc(DEF_ID))
                .thenReturn(List.of(binding(DEF_ID, "Check_ChuTruongTD")));

        DefinitionDetail detail = service.get(DEF_ID);

        assertEquals("dieuKienMacDinhDat", detail.versions().get(0).config().get("resultVariable"));
        assertEquals(Boolean.TRUE, detail.versions().get(0).config().get("stubResult"));
        assertEquals("CHECK_CHU_TRUONG_TD", detail.bindings().get(0).definitionCode());
    }

    @Test
    void getThrowsNotFoundWhenDefinitionMissing() {
        when(definitions.findById(DEF_ID)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> service.get(DEF_ID));
    }

    @Test
    void malformedConfigJsonDoesNotBreakTheWholeDetail() {
        when(definitions.findById(DEF_ID))
                .thenReturn(Optional.of(definition(DEF_ID, "CHECK_CHU_TRUONG_TD", ServiceTaskDefinitionStatus.ACTIVE)));
        when(versions.findByDefinitionIdOrderByVersionDesc(DEF_ID))
                .thenReturn(List.of(version(1, "{ khong-phai-json")));
        when(bindings.findByDefinitionIdOrderByBpmnProcessIdAscElementIdAsc(DEF_ID)).thenReturn(List.of());

        DefinitionDetail detail = service.get(DEF_ID);

        // Một row hỏng không được làm sập cả màn hình — trả null cho riêng trường đó.
        assertNull(detail.versions().get(0).config());
        assertEquals(1, detail.versions().get(0).version());
        assertEquals(List.of(), detail.versions().get(0).inputMapping());
    }

    @Test
    void listBindingsJoinsDefinitionCode() {
        when(definitions.findAll())
                .thenReturn(List.of(definition(DEF_ID, "CHECK_CHU_TRUONG_TD", ServiceTaskDefinitionStatus.ACTIVE)));
        when(bindings.findAllByOrderByBpmnProcessIdAscElementIdAsc())
                .thenReturn(List.of(binding(DEF_ID, "Check_ChuTruongTD")));

        List<Binding> result = service.listBindings();

        assertEquals("CHECK_CHU_TRUONG_TD", result.get(0).definitionCode());
        assertEquals("khcn.rd0202.check-chu-truong-td", result.get(0).jobType());
    }

    private ServiceTaskDefinition definition(UUID id, String code, ServiceTaskDefinitionStatus status) {
        ServiceTaskDefinition definition = new ServiceTaskDefinition();
        definition.setId(id);
        definition.setCode(code);
        definition.setName("Kiểm tra QĐ phê duyệt chủ trương cấp TĐ");
        definition.setDescription("test");
        definition.setTypeCode(ServiceTaskTypeCode.EVALUATE_DECISION);
        definition.setStatus(status);
        definition.setOwnerModule("RD02");
        definition.setLatestVersion(1);
        definition.setActiveVersion(1);
        definition.setTags(Set.of("rd02", "precondition"));
        definition.setCreatedBy("system-seed");
        definition.setCreatedAt(OffsetDateTime.now());
        definition.setUpdatedBy("system-seed");
        definition.setUpdatedAt(OffsetDateTime.now());
        return definition;
    }

    private ServiceTaskConfigVersion version(int versionNo, String configJson) {
        ServiceTaskConfigVersion version = new ServiceTaskConfigVersion();
        version.setId(UUID.randomUUID());
        version.setDefinitionId(DEF_ID);
        version.setVersion(versionNo);
        version.setConfigJson(configJson);
        version.setInputMapping("[]");
        version.setOutputMapping("[]");
        version.setErrorPolicy("{}");
        version.setStatus(ServiceTaskConfigVersionStatus.ACTIVE);
        version.setChangeNote("test");
        version.setCreatedBy("system-seed");
        version.setCreatedAt(OffsetDateTime.now());
        return version;
    }

    private ServiceTaskBinding binding(UUID definitionId, String elementId) {
        ServiceTaskBinding binding = new ServiceTaskBinding();
        binding.setId(UUID.randomUUID());
        binding.setBpmnProcessId("RD02_02");
        binding.setElementId(elementId);
        binding.setJobType("khcn.rd0202.check-chu-truong-td");
        binding.setDefinitionId(definitionId);
        binding.setBindingStatus(ServiceTaskBindingStatus.ACTIVE);
        binding.setProcessCode("RD02.02");
        binding.setTaskName("Hệ thống — Kiểm tra QĐ phê duyệt chủ trương cấp TĐ");
        binding.setEffectiveFrom(LocalDate.now());
        binding.setCreatedBy("system-seed");
        binding.setUpdatedAt(OffsetDateTime.now());
        return binding;
    }
}

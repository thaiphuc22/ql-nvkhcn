package vn.vht.qtkhcn.web;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mock.web.MockServletContext;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import vn.vht.qtkhcn.domain.ServiceTaskBindingStatus;
import vn.vht.qtkhcn.domain.ServiceTaskConfigVersionStatus;
import vn.vht.qtkhcn.domain.ServiceTaskDefinitionStatus;
import vn.vht.qtkhcn.domain.ServiceTaskTypeCode;
import vn.vht.qtkhcn.security.DevApiKeyFilter;
import vn.vht.qtkhcn.service.ServiceTaskQueryService;
import vn.vht.qtkhcn.service.ServiceTaskCommandService;
import vn.vht.qtkhcn.web.dto.ServiceTaskDtos.Binding;
import vn.vht.qtkhcn.web.dto.ServiceTaskDtos.ConfigVersion;
import vn.vht.qtkhcn.web.dto.ServiceTaskDtos.DefinitionDetail;
import vn.vht.qtkhcn.web.dto.ServiceTaskDtos.DefinitionSummary;

class ServiceTaskConfigHttpContractTest {

    private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-07-20T09:00:00Z");
    private static final UUID DEF_ID = UUID.fromString("0e1d6b8a-5c34-4f21-9f8e-2b7a4c9d1e30");

    private AnnotationConfigWebApplicationContext context;
    private ServiceTaskQueryService service;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        context = new AnnotationConfigWebApplicationContext();
        context.setServletContext(new MockServletContext());
        context.register(Config.class);
        context.refresh();
        service = context.getBean(ServiceTaskQueryService.class);
        DevApiKeyFilter filter = context.getBean(DevApiKeyFilter.class);
        ReflectionTestUtils.setField(filter, "expectedKey", "dev-local-only");
        mvc = MockMvcBuilders.webAppContextSetup(context).addFilters(filter).build();
    }

    @AfterEach
    void close() {
        context.close();
    }

    @Test
    void listRequiresDevKey() throws Exception {
        mvc.perform(get("/api/service-tasks")).andExpect(status().isUnauthorized());
    }

    @Test
    void listPassesStatusAndQueryThrough() throws Exception {
        when(service.list(eq(ServiceTaskDefinitionStatus.ACTIVE), eq("rd02")))
                .thenReturn(List.of(summary()));

        mvc.perform(get("/api/service-tasks")
                        .param("status", "ACTIVE")
                        .param("q", "rd02")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("CHECK_CHU_TRUONG_TD"))
                .andExpect(jsonPath("$[0].activeVersion").value(1))
                .andExpect(jsonPath("$[0].bindingCount").value(1))
                .andExpect(jsonPath("$[0].tags[0]").value("rd02"));
    }

    @Test
    void detailReturnsConfigAsJsonObjectNotString() throws Exception {
        when(service.get(DEF_ID)).thenReturn(detail());

        mvc.perform(get("/api/service-tasks/{id}", DEF_ID)
                        .header("X-QTKHCN-Dev-Key", "dev-local-only"))
                .andExpect(status().isOk())
                // Frontend đọc thẳng object, không phải parse chuỗi lần hai. Trước đây dùng JsonNode
                // của Jackson 2 ở DTO thì Jackson 3 (converter của Spring 7) serialize nó ra
                // {"array":false,"object":true,...} — test này là cái chốt chặn.
                .andExpect(jsonPath("$.versions[0].config.resultVariable").value("dieuKienMacDinhDat"))
                .andExpect(jsonPath("$.versions[0].config.stubResult").value(true))
                .andExpect(jsonPath("$.versions[0].inputMapping[0].expression").value("${variables.maHoSo}"))
                .andExpect(jsonPath("$.bindings[0].jobType").value("khcn.rd0202.check-chu-truong-td"))
                .andExpect(jsonPath("$.bindings[0].elementId").value("Check_ChuTruongTD"));
    }

    @Test
    void unknownDefinitionReturns404() throws Exception {
        UUID missing = UUID.randomUUID();
        when(service.get(missing)).thenThrow(new NoSuchElementException("Không tìm thấy"));

        mvc.perform(get("/api/service-tasks/{id}", missing)
                        .header("X-QTKHCN-Dev-Key", "dev-local-only"))
                .andExpect(status().isNotFound());
    }

    @Test
    void bindingsPathIsNotSwallowedByTheIdRoute() throws Exception {
        when(service.listBindings()).thenReturn(List.of(binding()));

        mvc.perform(get("/api/service-tasks/bindings")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].definitionCode").value("CHECK_CHU_TRUONG_TD"))
                .andExpect(jsonPath("$[0].bpmnProcessId").value("RD02_02"));
    }

    @Test
    void malformedIdIsRejectedAsBadRequestNotServerError() throws Exception {
        mvc.perform(get("/api/service-tasks/{id}", "khong-phai-uuid")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only"))
                .andExpect(status().isBadRequest());
    }

    private DefinitionSummary summary() {
        return new DefinitionSummary(DEF_ID, "CHECK_CHU_TRUONG_TD",
                "Kiểm tra QĐ phê duyệt chủ trương cấp TĐ", "BR-RD0202-001",
                ServiceTaskTypeCode.EVALUATE_DECISION, ServiceTaskDefinitionStatus.ACTIVE,
                "RD02", 1, 1, List.of("rd02", "precondition"), 1, NOW);
    }

    private DefinitionDetail detail() throws Exception {
        ConfigVersion version = new ConfigVersion(UUID.randomUUID(), 1,
                Map.of("resultVariable", "dieuKienMacDinhDat", "stubResult", true),
                List.of(Map.of("target", "maHoSo", "expression", "${variables.maHoSo}")),
                List.of(), Map.of("maxRetry", 3),
                ServiceTaskConfigVersionStatus.ACTIVE, "Seed ban đầu", "system-seed", NOW);
        return new DefinitionDetail(DEF_ID, "CHECK_CHU_TRUONG_TD",
                "Kiểm tra QĐ phê duyệt chủ trương cấp TĐ", "BR-RD0202-001",
                ServiceTaskTypeCode.EVALUATE_DECISION, ServiceTaskDefinitionStatus.ACTIVE,
                "RD02", 1, 1, List.of("rd02"), "system-seed", NOW, "system-seed", NOW,
                List.of(version), List.of(binding()));
    }

    private Binding binding() {
        return new Binding(UUID.randomUUID(), "RD02_02", "Check_ChuTruongTD",
                "khcn.rd0202.check-chu-truong-td", DEF_ID, "CHECK_CHU_TRUONG_TD",
                ServiceTaskBindingStatus.ACTIVE, "RD02.02",
                "Hệ thống — Kiểm tra QĐ phê duyệt chủ trương cấp TĐ",
                LocalDate.parse("2026-07-20"), null, "system-seed", NOW);
    }

    @Configuration
    @EnableWebMvc
    static class Config {
        @Bean ServiceTaskQueryService service() { return mock(ServiceTaskQueryService.class); }
        @Bean ServiceTaskCommandService commands() { return mock(ServiceTaskCommandService.class); }
        @Bean ServiceTaskConfigController controller(ServiceTaskQueryService service, ServiceTaskCommandService commands) {
            return new ServiceTaskConfigController(service, commands);
        }
        @Bean GlobalExceptionHandler errors() { return new GlobalExceptionHandler(); }
        @Bean DevApiKeyFilter filter() { return new DevApiKeyFilter(); }
    }
}

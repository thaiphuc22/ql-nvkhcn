package vn.vht.qtkhcn.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.mock.web.MockServletContext;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import vn.vht.qtkhcn.config.WebConfig;
import vn.vht.qtkhcn.domain.ProcessDefinitionStatus;
import vn.vht.qtkhcn.security.DevApiKeyFilter;
import vn.vht.qtkhcn.service.ProcessDefinitionService;
import vn.vht.qtkhcn.service.ProcessImportException;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionDetailResponse;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionImportResponse;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionSummaryResponse;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionVersionResponse;

class ProcessDefinitionHttpContractTest {

    private static final String KEY = "dev-local-only";
    private static final UUID CATALOG_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID VERSION_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
    private static final OffsetDateTime NOW = OffsetDateTime.of(2026, 7, 15, 10, 0, 0, 0, ZoneOffset.UTC);

    private AnnotationConfigWebApplicationContext context;
    private ProcessDefinitionService service;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        context = new AnnotationConfigWebApplicationContext();
        context.setServletContext(new MockServletContext());
        context.register(TestMvcConfig.class);
        context.refresh();
        service = context.getBean(ProcessDefinitionService.class);
        DevApiKeyFilter filter = context.getBean(DevApiKeyFilter.class);
        ReflectionTestUtils.setField(filter, "expectedKey", KEY);
        mvc = MockMvcBuilders.webAppContextSetup(context).addFilters(filter).build();
    }

    @AfterEach
    void tearDown() {
        context.close();
    }

    @Test
    void multipartFileFieldReturns201AndStableImportBody() throws Exception {
        when(service.importBpmn(any(), eq("tester"))).thenReturn(importResponse());
        var file = new MockMultipartFile("file", "demo.bpmn", MediaType.APPLICATION_XML_VALUE,
                "<definitions/>".getBytes());

        mvc.perform(multipart("/api/process-definitions/import").file(file)
                        .header("X-QTKHCN-Dev-Key", KEY).header("X-QTKHCN-Actor", "tester"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(CATALOG_ID.toString()))
                .andExpect(jsonPath("$.versionId").value(VERSION_ID.toString()))
                .andExpect(jsonPath("$.bpmnProcessId").value("demo"))
                .andExpect(jsonPath("$.version").value(4))
                .andExpect(jsonPath("$.camundaProcessDefinitionKey").value(44));
    }

    @Test
    void listDetailAndVersionsKeepBpmnXmlReadable() throws Exception {
        var version = versionResponse();
        when(service.list()).thenReturn(List.of(new ProcessDefinitionSummaryResponse(CATALOG_ID, "demo", "Demo",
                4, "demo.bpmn", ProcessDefinitionStatus.DEPLOYED, NOW)));
        when(service.get(CATALOG_ID)).thenReturn(new ProcessDefinitionDetailResponse(CATALOG_ID, "demo", "Demo",
                NOW, NOW, version));
        when(service.versions(CATALOG_ID)).thenReturn(List.of(version));

        mvc.perform(get("/api/process-definitions").header("X-QTKHCN-Dev-Key", KEY))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].latestVersion").value(4));
        mvc.perform(get("/api/process-definitions/{id}", CATALOG_ID).header("X-QTKHCN-Dev-Key", KEY))
                .andExpect(status().isOk()).andExpect(jsonPath("$.latestVersion.bpmnXml").value("<xml/>"));
        mvc.perform(get("/api/process-definitions/{id}/versions", CATALOG_ID)
                        .header("X-QTKHCN-Dev-Key", KEY))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].bpmnXml").value("<xml/>"));
    }

    @Test
    void validationAndDeploymentFailuresHaveStableErrorEnvelope() throws Exception {
        var file = new MockMultipartFile("file", "demo.bpmn", MediaType.APPLICATION_XML_VALUE, "x".getBytes());
        when(service.importBpmn(any(), any()))
                .thenThrow(new ProcessImportException(ProcessImportException.Kind.VALIDATION,
                        "File BPMN không hợp lệ.", List.of("broken xml")))
                .thenThrow(new ProcessImportException(ProcessImportException.Kind.DEPLOYMENT,
                        "Camunda unavailable.", List.of("connection refused")));
        mvc.perform(multipart("/api/process-definitions/import").file(file)
                        .header("X-QTKHCN-Dev-Key", KEY))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("File BPMN không hợp lệ."))
                .andExpect(jsonPath("$.errors[0]").value("broken xml"));

        mvc.perform(multipart("/api/process-definitions/import").file(file)
                        .header("X-QTKHCN-Dev-Key", KEY))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.message").value("Camunda unavailable."))
                .andExpect(jsonPath("$.errors[0]").value("connection refused"));
    }

    @Test
    void apiKeyIsRequiredButAngularCorsPreflightIsAllowed() throws Exception {
        mvc.perform(get("/api/process-definitions"))
                .andExpect(status().isUnauthorized());

        mvc.perform(options("/api/process-definitions")
                        .header("Origin", "http://localhost:4200")
                        .header("Access-Control-Request-Method", "GET")
                        .header("Access-Control-Request-Headers", "X-QTKHCN-Dev-Key"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:4200"));
    }

    private static ProcessDefinitionImportResponse importResponse() {
        return new ProcessDefinitionImportResponse(CATALOG_ID, VERSION_ID, "demo", "Demo", "demo.bpmn",
                43L, 44L, 4, ProcessDefinitionStatus.DEPLOYED, "a".repeat(64), "tester", NOW, List.of());
    }

    private static ProcessDefinitionVersionResponse versionResponse() {
        return new ProcessDefinitionVersionResponse(VERSION_ID, 4, "demo.bpmn", "a".repeat(64), 43L, 44L,
                ProcessDefinitionStatus.DEPLOYED, "tester", NOW, "<xml/>", List.of());
    }

    @Configuration
    @EnableWebMvc
    static class TestMvcConfig {
        @Bean
        ProcessDefinitionService processDefinitionService() {
            return mock(ProcessDefinitionService.class);
        }

        @Bean
        ProcessDefinitionController processDefinitionController(ProcessDefinitionService service) {
            return new ProcessDefinitionController(service);
        }

        @Bean
        GlobalExceptionHandler globalExceptionHandler() {
            return new GlobalExceptionHandler();
        }

        @Bean
        DevApiKeyFilter devApiKeyFilter() {
            return new DevApiKeyFilter();
        }

        @Bean
        WebConfig webConfig(org.springframework.core.env.Environment environment) {
            return new WebConfig(environment);
        }
    }
}

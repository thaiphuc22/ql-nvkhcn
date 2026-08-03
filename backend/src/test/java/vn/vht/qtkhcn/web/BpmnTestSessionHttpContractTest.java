package vn.vht.qtkhcn.web;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockServletContext;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.context.support.TestPropertySourceUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import vn.vht.qtkhcn.config.WebConfig;
import vn.vht.qtkhcn.security.DevApiKeyFilter;
import vn.vht.qtkhcn.service.BpmnTestSessionService;

class BpmnTestSessionHttpContractTest {
    private static final String KEY = "dev-local-only";
    private AnnotationConfigWebApplicationContext context;
    private BpmnTestSessionService service;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        context = new AnnotationConfigWebApplicationContext();
        context.setServletContext(new MockServletContext());
        TestPropertySourceUtils.addInlinedPropertiesToEnvironment(context,
                "qtkhcn.cors.allowed-origins=http://localhost:4200,https://drab-quail.runlocal.eu");
        context.register(Config.class);
        context.refresh();
        service = context.getBean(BpmnTestSessionService.class);
        DevApiKeyFilter filter = context.getBean(DevApiKeyFilter.class);
        ReflectionTestUtils.setField(filter, "expectedKey", KEY);
        mvc = MockMvcBuilders.webAppContextSetup(context).addFilters(filter).build();
    }

    @AfterEach
    void close() {
        context.close();
    }

    @Test
    void apiKeyProtectsEverySessionMutation() throws Exception {
        mvc.perform(post("/api/bpmn-tests").contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").exists());
        mvc.perform(delete("/api/bpmn-tests/{id}", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
                        .header("X-QTKHCN-Dev-Key", "wrong"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/bpmn-tests/{id}/incidents/{key}/resolve",
                        "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", 707)
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/bpmn-tests/{id}/jobs/{key}/bypass",
                        "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", 909)
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }

    @Test
    void resolveIncidentRoutesToServiceAndSurfacesTerminalConflictAsStable409() throws Exception {
        String id = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
        when(service.resolveIncident(eq(java.util.UUID.fromString(id)), eq(707L), eq(Map.of("decision", "approve"))))
                .thenThrow(new IllegalStateException("Test session đã kết thúc: CANCELLED"));

        mvc.perform(post("/api/bpmn-tests/{id}/incidents/{key}/resolve", id, 707)
                        .header("X-QTKHCN-Dev-Key", KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variables\":{\"decision\":\"approve\"}}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Test session đã kết thúc: CANCELLED"));
    }

    @Test
    void bypassServiceTaskRoutesToServiceAndSurfacesTerminalConflictAsStable409() throws Exception {
        String id = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
        when(service.bypassServiceTask(eq(java.util.UUID.fromString(id)), eq(909L), eq(Map.of("draft1Valid", true))))
                .thenThrow(new IllegalStateException("Test session đã kết thúc: CANCELLED"));

        mvc.perform(post("/api/bpmn-tests/{id}/jobs/{key}/bypass", id, 909)
                        .header("X-QTKHCN-Dev-Key", KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variables\":{\"draft1Valid\":true}}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Test session đã kết thúc: CANCELLED"));
    }

    @Test
    void angularPreflightIsAllowedButUnknownOriginIsRejected() throws Exception {
        mvc.perform(options("/api/bpmn-tests")
                        .header("Origin", "http://localhost:4200")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "Content-Type, X-QTKHCN-Dev-Key"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:4200"));
        mvc.perform(options("/api/bpmn-tests")
                        .header("Origin", "https://attacker.example")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden());
    }

    @Test
    void configuredRunlocalOriginCanCallBpmnMutationButUnknownOriginRemainsRejected() throws Exception {
        mvc.perform(post("/api/bpmn-tests")
                        .header("Origin", "https://drab-quail.runlocal.eu")
                        .header("X-QTKHCN-Dev-Key", KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://drab-quail.runlocal.eu"));

        mvc.perform(post("/api/bpmn-tests")
                        .header("Origin", "https://attacker.example")
                        .header("X-QTKHCN-Dev-Key", KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void invalidTtlAndNonObjectVariablesHaveStable400Envelopes() throws Exception {
        String draftId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
        mvc.perform(post("/api/bpmn-tests").header("X-QTKHCN-Dev-Key", KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"draftId\":\"" + draftId + "\",\"revision\":1,\"variables\":{},\"ttlSeconds\":0}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Request không hợp lệ."))
                .andExpect(jsonPath("$.errors[0]").exists());

        mvc.perform(post("/api/bpmn-tests").header("X-QTKHCN-Dev-Key", KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"draftId\":\"" + draftId + "\",\"revision\":1,\"variables\":[1,2]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("JSON request không hợp lệ."))
                .andExpect(jsonPath("$.errors[0]").value(
                        "Kiểm tra kiểu dữ liệu và cấu trúc JSON; variables phải là một object."));
        verifyNoInteractions(service);
    }

    @Configuration
    @EnableWebMvc
    static class Config {
        @Bean BpmnTestSessionService service() { return mock(BpmnTestSessionService.class); }
        @Bean BpmnTestSessionController controller(BpmnTestSessionService service) {
            return new BpmnTestSessionController(service);
        }
        @Bean GlobalExceptionHandler errors() { return new GlobalExceptionHandler(); }
        @Bean DevApiKeyFilter filter() { return new DevApiKeyFilter(); }
        @Bean WebConfig webConfig(org.springframework.core.env.Environment environment) {
            return new WebConfig(environment);
        }
    }
}

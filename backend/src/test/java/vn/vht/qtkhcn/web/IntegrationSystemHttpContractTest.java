package vn.vht.qtkhcn.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockServletContext;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import vn.vht.qtkhcn.security.DevApiKeyFilter;
import vn.vht.qtkhcn.service.IntegrationConflictException;
import vn.vht.qtkhcn.service.IntegrationSystemService;
import vn.vht.qtkhcn.web.dto.IntegrationSystemDtos.IntegrationSystemResponse;

class IntegrationSystemHttpContractTest {
    private AnnotationConfigWebApplicationContext context;
    private IntegrationSystemService service;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        context = new AnnotationConfigWebApplicationContext();
        context.setServletContext(new MockServletContext());
        context.register(Config.class);
        context.refresh();
        service = context.getBean(IntegrationSystemService.class);
        DevApiKeyFilter filter = context.getBean(DevApiKeyFilter.class);
        ReflectionTestUtils.setField(filter, "expectedKey", "dev-local-only");
        mvc = MockMvcBuilders.webAppContextSetup(context).addFilters(filter).build();
    }

    @AfterEach
    void close() {
        context.close();
    }

    private IntegrationSystemResponse response(String key, String trangThai, long version) {
        return new IntegrationSystemResponse(key, "Hệ " + key, "", "REST/JSON", "connector", "realtime",
                trangThai, "01/07/2026 00:00", 0, 0, 0, 0, "https://x", "AB12", "REF-1", version);
    }

    @Test
    void listRequiresDevKey() throws Exception {
        mvc.perform(get("/api/integration-systems"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listReturnsSystems() throws Exception {
        when(service.list()).thenReturn(List.of(response("SAP", "down", 0)));

        mvc.perform(get("/api/integration-systems").header("X-QTKHCN-Dev-Key", "dev-local-only"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].key").value("SAP"));
    }

    @Test
    void connectRequiresIfMatch() throws Exception {
        mvc.perform(post("/api/integration-systems/SAP/connect")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"apiKey\":\"vht_live_xxxxxxxx\",\"endpoint\":\"https://x\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void connectRejectsShortApiKey() throws Exception {
        mvc.perform(post("/api/integration-systems/SAP/connect")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .header("If-Match", "0")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"apiKey\":\"short\",\"endpoint\":\"https://x\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void connectRoutesActorAndReturnsUpdatedSystem() throws Exception {
        when(service.connect(eq("SAP"), any(), eq(0L), eq("alice"))).thenReturn(response("SAP", "healthy", 1));

        mvc.perform(post("/api/integration-systems/SAP/connect")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .header("X-QTKHCN-Actor", "alice")
                        .header("If-Match", "0")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"apiKey\":\"vht_live_xxxxxxxx\",\"endpoint\":\"https://sap-gw.vht.vn/odata/v2\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trangThai").value("healthy"));

        verify(service).connect(eq("SAP"), any(), eq(0L), eq("alice"));
    }

    @Test
    void staleConnectHasStableConflictEnvelope() throws Exception {
        when(service.connect(eq("SAP"), any(), eq(1L), eq("alice")))
                .thenThrow(IntegrationConflictException.staleSystem("SAP", 1, 2));

        mvc.perform(post("/api/integration-systems/SAP/connect")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .header("X-QTKHCN-Actor", "alice")
                        .header("If-Match", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"apiKey\":\"vht_live_xxxxxxxx\",\"endpoint\":\"https://x\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(
                        "Hệ tích hợp SAP đã thay đổi: expected version 1 nhưng version hiện tại là 2."));
    }

    @Test
    void disconnectRoutesIfMatch() throws Exception {
        when(service.disconnect(eq("SAP"), eq(2L), eq("alice"))).thenReturn(response("SAP", "down", 3));

        mvc.perform(post("/api/integration-systems/SAP/disconnect")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .header("X-QTKHCN-Actor", "alice")
                        .header("If-Match", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trangThai").value("down"));
    }

    @Configuration
    @EnableWebMvc
    static class Config {
        @Bean IntegrationSystemService service() { return mock(IntegrationSystemService.class); }
        @Bean IntegrationSystemController controller(IntegrationSystemService service) { return new IntegrationSystemController(service); }
        @Bean GlobalExceptionHandler errors() { return new GlobalExceptionHandler(); }
        @Bean DevApiKeyFilter filter() { return new DevApiKeyFilter(); }
    }
}

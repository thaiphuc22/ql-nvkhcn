package vn.vht.qtkhcn.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.util.Map;
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
import vn.vht.qtkhcn.service.EformConflictException;
import vn.vht.qtkhcn.service.EformService;
import vn.vht.qtkhcn.web.dto.EformDtos.EformResponse;

class EformHttpContractTest {
    private AnnotationConfigWebApplicationContext context;
    private EformService service;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        context = new AnnotationConfigWebApplicationContext();
        context.setServletContext(new MockServletContext());
        context.register(Config.class);
        context.refresh();
        service = context.getBean(EformService.class);
        DevApiKeyFilter filter = context.getBean(DevApiKeyFilter.class);
        ReflectionTestUtils.setField(filter, "expectedKey", "dev-local-only");
        mvc = MockMvcBuilders.webAppContextSetup(context).addFilters(filter).build();
    }

    @AfterEach
    void close() {
        context.close();
    }

    private EformResponse response(String key, long version) {
        return new EformResponse(key, "Phiếu " + key, "", "Soạn thảo", Map.of("type", "default"),
                version, "alice", OffsetDateTime.now(), OffsetDateTime.now());
    }

    @Test
    void createRequiresBlankKeyRejection() throws Exception {
        mvc.perform(post("/api/eform")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"key\":\"\",\"ten\":\"Phiếu\",\"schema\":{}}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Request không hợp lệ."));
    }

    @Test
    void createRoutesActorAndReturnsCreated() throws Exception {
        when(service.create(any(), eq("alice"))).thenReturn(response("phieu-x", 1));

        mvc.perform(post("/api/eform")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .header("X-QTKHCN-Actor", "alice")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"key\":\"phieu-x\",\"ten\":\"Phiếu X\",\"schema\":{\"type\":\"default\"}}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.key").value("phieu-x"));

        verify(service).create(any(), eq("alice"));
    }

    @Test
    void updateSchemaRequiresIfMatch() throws Exception {
        mvc.perform(put("/api/eform/phieu-x/schema")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"schema\":{}}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void staleUpdateHasStableConflictEnvelope() throws Exception {
        when(service.updateSchema(eq("phieu-x"), any(), eq(1L), eq("alice")))
                .thenThrow(EformConflictException.stale("phieu-x", 1, 2));

        mvc.perform(put("/api/eform/phieu-x/schema")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .header("X-QTKHCN-Actor", "alice")
                        .header("If-Match", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"schema\":{}}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(
                        "Biểu mẫu phieu-x đã thay đổi: expected version 1 nhưng version hiện tại là 2."));
    }

    @Test
    void deleteRoutesIfMatchVersion() throws Exception {
        mvc.perform(delete("/api/eform/phieu-x")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .header("If-Match", "\"2\""))
                .andExpect(status().isNoContent());

        verify(service).delete("phieu-x", 2L);
    }

    @Configuration
    @EnableWebMvc
    static class Config {
        @Bean EformService service() { return mock(EformService.class); }
        @Bean EformController controller(EformService service) { return new EformController(service); }
        @Bean GlobalExceptionHandler errors() { return new GlobalExceptionHandler(); }
        @Bean DevApiKeyFilter filter() { return new DevApiKeyFilter(); }
    }
}

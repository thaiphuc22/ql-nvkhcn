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
import vn.vht.qtkhcn.service.IntegrationMappingService;
import vn.vht.qtkhcn.web.dto.IntegrationMappingDtos.IntegrationMappingResponse;
import vn.vht.qtkhcn.web.dto.IntegrationMappingDtos.StatusChangeResult;

class IntegrationMappingHttpContractTest {
    private AnnotationConfigWebApplicationContext context;
    private IntegrationMappingService service;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        context = new AnnotationConfigWebApplicationContext();
        context.setServletContext(new MockServletContext());
        context.register(Config.class);
        context.refresh();
        service = context.getBean(IntegrationMappingService.class);
        DevApiKeyFilter filter = context.getBean(DevApiKeyFilter.class);
        ReflectionTestUtils.setField(filter, "expectedKey", "dev-local-only");
        mvc = MockMvcBuilders.webAppContextSetup(context).addFilters(filter).build();
    }

    @AfterEach
    void close() {
        context.close();
    }

    private IntegrationMappingResponse response(String id, String trangThai, long version) {
        return new IntegrationMappingResponse(id, "SAP", "DuToan", "out", trangThai, version,
                "2026-07-08 09:10", "alice", List.of(), "sap:sync-budget");
    }

    @Test
    void createRequiresBlankHeRejection() throws Exception {
        mvc.perform(post("/api/integration-mappings")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"he\":\"\",\"doiTuong\":\"DuToan\",\"chieu\":\"out\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Request không hợp lệ."));
    }

    @Test
    void createRoutesActorAndReturnsCreated() throws Exception {
        when(service.create(any(), eq("alice"))).thenReturn(response("map-sap-1", "draft", 0));

        mvc.perform(post("/api/integration-mappings")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .header("X-QTKHCN-Actor", "alice")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"he\":\"SAP\",\"doiTuong\":\"DuToan\",\"chieu\":\"out\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("map-sap-1"));

        verify(service).create(any(), eq("alice"));
    }

    @Test
    void updateFieldsRequiresIfMatch() throws Exception {
        mvc.perform(put("/api/integration-mappings/map-sap-1/fields")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fields\":[]}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void staleUpdateFieldsHasStableConflictEnvelope() throws Exception {
        when(service.updateFields(eq("map-sap-1"), any(), eq(1L), eq("alice")))
                .thenThrow(IntegrationConflictException.staleMapping("map-sap-1", 1, 2));

        mvc.perform(put("/api/integration-mappings/map-sap-1/fields")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .header("X-QTKHCN-Actor", "alice")
                        .header("If-Match", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fields\":[]}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(
                        "Mapping map-sap-1 đã thay đổi: expected version 1 nhưng version hiện tại là 2."));
    }

    @Test
    void updateStatusReturnsOkFalseWithErrorsWhenActivateInvalid() throws Exception {
        when(service.updateStatus(eq("map-sap-1"), eq("active"), eq(1L), eq("alice")))
                .thenReturn(new StatusChangeResult(false, List.of("Chưa có field mapping nào."), response("map-sap-1", "error", 2)));

        mvc.perform(put("/api/integration-mappings/map-sap-1/status")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .header("X-QTKHCN-Actor", "alice")
                        .header("If-Match", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"active\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ok").value(false))
                .andExpect(jsonPath("$.mapping.trangThai").value("error"));
    }

    @Test
    void deleteRoutesIfMatchVersion() throws Exception {
        mvc.perform(delete("/api/integration-mappings/map-sap-1")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .header("If-Match", "\"2\""))
                .andExpect(status().isNoContent());

        verify(service).delete("map-sap-1", 2L);
    }

    @Configuration
    @EnableWebMvc
    static class Config {
        @Bean IntegrationMappingService service() { return mock(IntegrationMappingService.class); }
        @Bean IntegrationMappingController controller(IntegrationMappingService service) { return new IntegrationMappingController(service); }
        @Bean GlobalExceptionHandler errors() { return new GlobalExceptionHandler(); }
        @Bean DevApiKeyFilter filter() { return new DevApiKeyFilter(); }
    }
}

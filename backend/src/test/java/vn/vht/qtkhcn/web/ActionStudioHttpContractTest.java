package vn.vht.qtkhcn.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
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
import vn.vht.qtkhcn.service.ActionStudioConflictException;
import vn.vht.qtkhcn.service.ActionStudioService;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.ActionResponse;
import vn.vht.qtkhcn.web.dto.ActionStudioDtos.PresentationResponse;

class ActionStudioHttpContractTest {
    private AnnotationConfigWebApplicationContext context;
    private ActionStudioService service;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        context = new AnnotationConfigWebApplicationContext();
        context.setServletContext(new MockServletContext());
        context.register(Config.class);
        context.refresh();
        service = context.getBean(ActionStudioService.class);
        DevApiKeyFilter filter = context.getBean(DevApiKeyFilter.class);
        ReflectionTestUtils.setField(filter, "expectedKey", "dev-local-only");
        mvc = MockMvcBuilders.webAppContextSetup(context).addFilters(filter).build();
    }

    @AfterEach
    void close() {
        context.close();
    }

    @Test
    void presentationRoutesIfMatchAndActor() throws Exception {
        when(service.updatePresentation(eq("APPROVE_STEP"), any(), eq(4L), eq("alice")))
                .thenReturn(new PresentationResponse("APPROVE_STEP", "Duyệt", "check", "PRIMARY",
                        "primary", 1, null, 5));

        mvc.perform(put("/api/action-studio/actions/APPROVE_STEP/presentation")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .header("X-QTKHCN-Actor", "alice")
                        .header("If-Match", "\"4\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"label":"Duyệt","icon":"check","uiGroup":"PRIMARY",
                                 "tone":"primary","order":1,"helpText":null}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value(5));

        verify(service).updatePresentation(eq("APPROVE_STEP"), any(), eq(4L), eq("alice"));
    }

    @Test
    void mutationRequiresIfMatch() throws Exception {
        mvc.perform(post("/api/action-studio/actions/APPROVE_STEP/status")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"enabled\":false}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void staleVersionHasStableConflictEnvelope() throws Exception {
        when(service.setActionStatus(eq("APPROVE_STEP"), eq(false), eq(1L), any()))
                .thenThrow(ActionStudioConflictException.stale("APPROVE_STEP", 1, 2));

        mvc.perform(post("/api/action-studio/actions/APPROVE_STEP/status")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .header("If-Match", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"enabled\":false}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(
                        "Cấu hình APPROVE_STEP đã thay đổi: expected version 1 nhưng version hiện tại là 2."));
    }

    @Test
    void simulationValidatesRequiredContext() throws Exception {
        mvc.perform(post("/api/action-studio/simulate")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"surface\":\"DOSSIER_DETAIL\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("JSON request không hợp lệ."));
    }

    @Configuration
    @EnableWebMvc
    static class Config {
        @Bean ActionStudioService service() { return mock(ActionStudioService.class); }
        @Bean ActionStudioController controller(ActionStudioService service) { return new ActionStudioController(service); }
        @Bean GlobalExceptionHandler errors() { return new GlobalExceptionHandler(); }
        @Bean DevApiKeyFilter filter() { return new DevApiKeyFilter(); }
    }
}

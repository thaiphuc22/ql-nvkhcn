package vn.vht.qtkhcn.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
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
import vn.vht.qtkhcn.security.DevApiKeyFilter;
import vn.vht.qtkhcn.service.DraftRevisionConflictException;
import vn.vht.qtkhcn.service.ProcessDefinitionDraftService;
import vn.vht.qtkhcn.domain.ProcessDefinitionDraftStatus;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionDraftSummaryResponse;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionDraftValidationResponse;
import vn.vht.qtkhcn.service.BpmnIssueSeverity;
import vn.vht.qtkhcn.service.BpmnLintIssue;

class ProcessDefinitionDraftHttpContractTest {
    private AnnotationConfigWebApplicationContext context;
    private ProcessDefinitionDraftService service;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        context = new AnnotationConfigWebApplicationContext();
        context.setServletContext(new MockServletContext());
        context.register(Config.class);
        context.refresh();
        service = context.getBean(ProcessDefinitionDraftService.class);
        DevApiKeyFilter filter = context.getBean(DevApiKeyFilter.class);
        ReflectionTestUtils.setField(filter, "expectedKey", "dev-local-only");
        mvc = MockMvcBuilders.webAppContextSetup(context).addFilters(filter).build();
    }

    @AfterEach
    void close() {
        context.close();
    }

    @Test
    void staleUpdateHasStable409Envelope() throws Exception {
        UUID id = UUID.randomUUID();
        when(service.update(any(), any(), any())).thenThrow(new DraftRevisionConflictException(2, 3));

        mvc.perform(put("/api/process-definition-drafts/{id}", id)
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"expectedRevision":2,"resourceName":"demo.bpmn","bpmnProcessId":"demo",
                                 "name":"Demo","bpmnXml":"<xml/>"}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(
                        "Draft đã được thay đổi: expected revision 2 nhưng revision hiện tại là 3."));
    }

    @Test
    void multipartImportRoutesFileAndMetadataToDraftService() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "demo.bpmn", "application/xml",
                "<definitions/>".getBytes());

        mvc.perform(multipart("/api/process-definition-drafts/import")
                        .file(file)
                        .param("bpmnProcessId", "demo")
                        .param("name", "Demo")
                        .header("X-QTKHCN-Actor", "alice")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only"))
                .andExpect(status().isCreated());

        verify(service).importBpmn(any(), eq("demo"), eq("Demo"), eq("alice"));
    }

    @Test
    void listDraftsSupportsFiltersAndOmitsHeavyContent() throws Exception {
        UUID id = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.parse("2026-07-16T01:00:00Z");
        when(service.list(ProcessDefinitionDraftStatus.DRAFT, "Process_RD0202", "xet duyet"))
                .thenReturn(List.of(new ProcessDefinitionDraftSummaryResponse(id, "rd0202.bpmn",
                        "Process_RD0202", "Xét duyệt", ProcessDefinitionDraftStatus.DRAFT, 0,
                        "alice", now, "alice", now, null, null)));

        mvc.perform(get("/api/process-definition-drafts")
                        .param("status", "DRAFT")
                        .param("bpmnProcessId", "Process_RD0202")
                        .param("q", "xet duyet")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(id.toString()))
                .andExpect(jsonPath("$[0].bpmnProcessId").value("Process_RD0202"))
                .andExpect(jsonPath("$[0].bpmnXml").doesNotExist())
                .andExpect(jsonPath("$[0].revisions").doesNotExist());

        verify(service).list(ProcessDefinitionDraftStatus.DRAFT, "Process_RD0202", "xet duyet");
    }

    @Test
    void validationContractCarriesStableSeverityCodeAndElementId() throws Exception {
        UUID id = UUID.randomUUID();
        when(service.validate(eq(id), eq(2L), eq("alice"))).thenReturn(new ProcessDefinitionDraftValidationResponse(
                false, 3, ProcessDefinitionDraftStatus.INVALID, "a".repeat(64), List.of(),
                List.of("Gateway chưa có luồng ra."), List.of(new BpmnLintIssue("GATEWAY_NO_OUTGOING",
                        BpmnIssueSeverity.ERROR, "Gateway chưa có luồng ra.", "Gateway_1", "Kiểm tra"))));

        mvc.perform(post("/api/process-definition-drafts/{id}/validate", id)
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .header("X-QTKHCN-Actor", "alice")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expectedRevision\":2}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(false))
                .andExpect(jsonPath("$.issues[0].code").value("GATEWAY_NO_OUTGOING"))
                .andExpect(jsonPath("$.issues[0].severity").value("ERROR"))
                .andExpect(jsonPath("$.issues[0].elementId").value("Gateway_1"));
    }

    @Test
    void deleteRemovesDraftAndReturnsNoContent() throws Exception {
        UUID id = UUID.randomUUID();

        mvc.perform(delete("/api/process-definition-drafts/{id}", id)
                        .param("expectedRevision", "2")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only"))
                .andExpect(status().isNoContent());

        verify(service).delete(id, 2);
    }

    @Test
    void deleteWithStaleRevisionHasStable409Envelope() throws Exception {
        UUID id = UUID.randomUUID();
        doThrow(new DraftRevisionConflictException(2, 3)).when(service).delete(id, 2);

        mvc.perform(delete("/api/process-definition-drafts/{id}", id)
                        .param("expectedRevision", "2")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(
                        "Draft đã được thay đổi: expected revision 2 nhưng revision hiện tại là 3."));
    }

    @Configuration
    @EnableWebMvc
    static class Config {
        @Bean ProcessDefinitionDraftService service() { return mock(ProcessDefinitionDraftService.class); }
        @Bean ProcessDefinitionDraftController controller(ProcessDefinitionDraftService service) {
            return new ProcessDefinitionDraftController(service);
        }
        @Bean GlobalExceptionHandler errors() { return new GlobalExceptionHandler(); }
        @Bean DevApiKeyFilter filter() { return new DevApiKeyFilter(); }
    }
}

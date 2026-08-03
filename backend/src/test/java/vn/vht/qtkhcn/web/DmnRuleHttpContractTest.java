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

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
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
import vn.vht.qtkhcn.domain.DmnRuleCategory;
import vn.vht.qtkhcn.domain.DmnRuleStatus;
import vn.vht.qtkhcn.security.DevApiKeyFilter;
import vn.vht.qtkhcn.service.DmnRuleConflictException;
import vn.vht.qtkhcn.service.DmnRuleService;
import vn.vht.qtkhcn.service.DmnValidationException;
import vn.vht.qtkhcn.web.dto.DmnRuleSummaryResponse;
import vn.vht.qtkhcn.web.dto.DmnRuleVersionResponse;
import vn.vht.qtkhcn.web.dto.DmnRuleVersionSummaryResponse;
import vn.vht.qtkhcn.web.dto.DmnRuleDetailResponse;
import vn.vht.qtkhcn.domain.DmnDeployStatus;
import vn.vht.qtkhcn.web.dto.EvaluateDmnDecisionResponse;
import java.util.Map;

class DmnRuleHttpContractTest {
    private AnnotationConfigWebApplicationContext context;
    private DmnRuleService service;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        context = new AnnotationConfigWebApplicationContext();
        context.setServletContext(new MockServletContext());
        context.register(Config.class);
        context.refresh();
        service = context.getBean(DmnRuleService.class);
        DevApiKeyFilter filter = context.getBean(DevApiKeyFilter.class);
        ReflectionTestUtils.setField(filter, "expectedKey", "dev-local-only");
        mvc = MockMvcBuilders.webAppContextSetup(context).addFilters(filter).build();
    }

    @AfterEach
    void close() {
        context.close();
    }

    @Test
    void createRequiresMetadataAndAtLeastOneAppliedProcess() throws Exception {
        mvc.perform(post("/api/dmn-rules")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"code":"BR-RD02","name":"Routing","description":"Route RD02",
                                 "category":"ROUTING","appliedProcesses":[]}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Request không hợp lệ."));
    }

    @Test
    void saveVersionRoutesActorAndReturnsCreatedArtifact() throws Exception {
        UUID id = UUID.randomUUID();
        UUID versionId = UUID.randomUUID();
        when(service.saveVersion(eq(id), any(), eq("alice"))).thenReturn(new DmnRuleVersionResponse(
                versionId, id, 1, "<definitions/>", "a".repeat(64), "Initial", "alice",
                OffsetDateTime.parse("2026-07-16T02:00:00Z"), DmnDeployStatus.NOT_DEPLOYED,
                null, null, null, null, null, null, List.of()));

        mvc.perform(post("/api/dmn-rules/{id}/versions", id)
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .header("X-QTKHCN-Actor", "alice")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"expectedVersion":0,"dmnXml":"<definitions/>","changeNote":"Initial"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.dmnXml").value("<definitions/>"));

        verify(service).saveVersion(eq(id), any(), eq("alice"));
    }

    @Test
    void staleAndInvalidDmnHaveStableEnvelopes() throws Exception {
        UUID id = UUID.randomUUID();
        when(service.saveVersion(eq(id), any(), any()))
                .thenThrow(DmnRuleConflictException.staleVersion(1, 2));

        mvc.perform(post("/api/dmn-rules/{id}/versions", id)
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"expectedVersion":1,"dmnXml":"bad","changeNote":"Change"}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(
                        "Luật DMN đã thay đổi: expected version 1 nhưng version hiện tại là 2."));

        when(service.saveVersion(eq(id), any(), any())).thenThrow(
                new DmnValidationException("DMN XML không hợp lệ.", List.of("Thiếu decisionTable.")));
        mvc.perform(post("/api/dmn-rules/{id}/versions", id)
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"expectedVersion":2,"dmnXml":"bad","changeNote":"Change"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("DMN XML không hợp lệ."))
                .andExpect(jsonPath("$.errors[0]").value("Thiếu decisionTable."));
    }

    @Test
    void listSupportsFiltersAndNeverContainsDmnXml() throws Exception {
        UUID id = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.parse("2026-07-16T02:00:00Z");
        when(service.list(DmnRuleStatus.ACTIVE, DmnRuleCategory.ROUTING, "rd02"))
                .thenReturn(List.of(new DmnRuleSummaryResponse(id, "BR-RD02", "Routing", "Route RD02",
                        DmnRuleCategory.ROUTING, DmnRuleStatus.ACTIVE, List.of("RD02.01"),
                        2, 1, "alice", now, "bob", now)));

        mvc.perform(get("/api/dmn-rules")
                        .param("status", "ACTIVE")
                        .param("category", "ROUTING")
                        .param("q", "rd02")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("BR-RD02"))
                .andExpect(jsonPath("$[0].activeVersion").value(1))
                .andExpect(jsonPath("$[0].dmnXml").doesNotExist());
    }

    @Test
    void evaluateAcceptsVariablesObjectAndReturnsMatchedRule() throws Exception {
        UUID id = UUID.randomUUID();
        when(service.evaluate(eq(id), eq(Map.of("budget", 10))))
                .thenReturn(new EvaluateDmnDecisionResponse(List.of(
                        new EvaluateDmnDecisionResponse.DecisionResultResponse(30L, "capNhiemVu",
                                "Cấp nhiệm vụ", 1, Map.of("cap", "TAP_DOAN"), List.of()),
                        new EvaluateDmnDecisionResponse.DecisionResultResponse(30L, "decision-main",
                                "Main", 2, Map.of("result", "APPROVE"),
                                List.of(new EvaluateDmnDecisionResponse.MatchedRuleResponse(
                                        "R1", 0, Map.of("result", "APPROVE")))))));

        mvc.perform(post("/api/dmn-rules/{id}/evaluate", id)
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"variables":{"budget":10}}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.decisions[0].decisionId").value("capNhiemVu"))
                .andExpect(jsonPath("$.decisions[0].outputs.cap").value("TAP_DOAN"))
                .andExpect(jsonPath("$.decisions[1].outputs.result").value("APPROVE"))
                .andExpect(jsonPath("$.decisions[1].matchedRules[0].ruleId").value("R1"));

        mvc.perform(post("/api/dmn-rules/{id}/evaluate", id)
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"variables\":null}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void activateReturnsStable422AfterFailedDeploymentWasStored() throws Exception {
        UUID id = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.parse("2026-07-16T02:00:00Z");
        var rule = new DmnRuleSummaryResponse(id, "BR-RD02", "Routing", "Route RD02",
                DmnRuleCategory.ROUTING, DmnRuleStatus.DRAFT, List.of("RD02.01"),
                1, null, "alice", now, "alice", now);
        var failed = new DmnRuleVersionSummaryResponse(UUID.randomUUID(), 1, "a".repeat(64),
                "Initial", "alice", now, DmnDeployStatus.FAILED,
                null, null, null, null, null, "invalid FEEL expression", List.of());
        when(service.activate(eq(id), eq(1), eq(1), eq("alice")))
                .thenReturn(new DmnRuleDetailResponse(rule, List.of(failed)));

        mvc.perform(post("/api/dmn-rules/{id}/versions/1/activate", id)
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .header("X-QTKHCN-Actor", "alice")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expectedVersion\":1}"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.message").value("Camunda từ chối hoặc không thể deploy DMN."))
                .andExpect(jsonPath("$.errors[0]").value("invalid FEEL expression"));
    }

    @Configuration
    @EnableWebMvc
    static class Config {
        @Bean DmnRuleService service() { return mock(DmnRuleService.class); }
        @Bean DmnRuleController controller(DmnRuleService service) { return new DmnRuleController(service); }
        @Bean GlobalExceptionHandler errors() { return new GlobalExceptionHandler(); }
        @Bean DevApiKeyFilter filter() { return new DevApiKeyFilter(); }
    }
}

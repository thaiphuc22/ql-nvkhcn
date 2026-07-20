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
import java.util.List;
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
import vn.vht.qtkhcn.service.ApprovalMatrixService;
import vn.vht.qtkhcn.service.ApprovalSlotService;
import vn.vht.qtkhcn.web.dto.ApprovalRuleResponse;
import vn.vht.qtkhcn.web.dto.ApprovalSlotResponse;
import vn.vht.qtkhcn.web.dto.ResolveApprovalResponse;
import vn.vht.qtkhcn.web.dto.ResolveApprovalResponse.ApprovalResolveAuditResponse;

class ApprovalMatrixHttpContractTest {
    private AnnotationConfigWebApplicationContext context;
    private ApprovalMatrixService matrix;
    private ApprovalSlotService slots;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        context = new AnnotationConfigWebApplicationContext();
        context.setServletContext(new MockServletContext());
        context.register(Config.class);
        context.refresh();
        matrix = context.getBean(ApprovalMatrixService.class);
        slots = context.getBean(ApprovalSlotService.class);
        DevApiKeyFilter filter = context.getBean(DevApiKeyFilter.class);
        ReflectionTestUtils.setField(filter, "expectedKey", "dev-local-only");
        mvc = MockMvcBuilders.webAppContextSetup(context).addFilters(filter).build();
    }

    @AfterEach
    void close() {
        context.close();
    }

    @Test
    void createValidatesContractAndRoutesActor() throws Exception {
        when(matrix.create(any(), eq("alice"))).thenReturn(new ApprovalRuleResponse(
                "AM-99", "KHCN", "Luật mới", "PHE_DUYET",
                Map.of("kind", "group", "logic", "AND", "items", List.of()),
                Map.of("mode", "ANY_ONE", "targets", List.of()),
                10, true, 1, OffsetDateTime.parse("2026-07-16T02:00:00Z"), "alice"));

        mvc.perform(post("/api/approval-matrix/rules")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .header("X-QTKHCN-Actor", "alice")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"id":"AM-99","ten":"Luật mới","slot":"PHE_DUYET","priority":10,
                                 "enabled":true,"conditions":{"kind":"group","logic":"AND","items":[]},
                                 "assignment":{"mode":"ANY_ONE","targets":[]}}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("AM-99"))
                .andExpect(jsonPath("$.version").value(1));
        verify(matrix).create(any(), eq("alice"));

        mvc.perform(post("/api/approval-matrix/rules")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"slot\":\"PHE_DUYET\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateRequiresIfMatchAndResolveKeepsStableShape() throws Exception {
        mvc.perform(put("/api/approval-matrix/rules/AM-01")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ten\":\"Changed\"}"))
                .andExpect(status().isBadRequest());

        var audit = new ApprovalResolveAuditResponse(Map.of("capNhiemVu", "TD"), "PHE_DUYET",
                "AM-05", 3, "ANY_ONE", List.of(), List.of("U-013"),
                List.of(), List.of(), "2026-07-16");
        when(matrix.resolve(any())).thenReturn(new ResolveApprovalResponse("AM-05", "ANY_ONE",
                List.of(new ResolveApprovalResponse.ResolvedApproverResponse(
                        "U-013", "BTGD_TD", "GROUP", false, null, null)),
                "matched", List.of(), audit));

        mvc.perform(post("/api/approval-matrix/resolve")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"slot":"PHE_DUYET","ngay":"2026-07-16","context":{"capNhiemVu":"TD"}}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matchedRuleId").value("AM-05"))
                .andExpect(jsonPath("$.approvers[0].userId").value("U-013"))
                .andExpect(jsonPath("$.audit.finalUserIds[0]").value("U-013"));
    }

    @Test
    void slotDeactivationCarriesExplicitForceConfirmation() throws Exception {
        when(slots.setStatus(eq("PHE_DUYET"), eq("inactive"), eq(true), eq("alice")))
                .thenReturn(new ApprovalSlotResponse("PHE_DUYET", "Phê duyệt", null, List.of(),
                        "inactive", 30, 3, OffsetDateTime.parse("2026-07-16T02:00:00Z"), "alice"));

        mvc.perform(post("/api/approval-matrix/slots/PHE_DUYET/status")
                        .queryParam("force", "true")
                        .header("X-QTKHCN-Dev-Key", "dev-local-only")
                        .header("X-QTKHCN-Actor", "alice")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"inactive\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trangThai").value("inactive"))
                .andExpect(jsonPath("$.usageCount").value(3));
        verify(slots).setStatus("PHE_DUYET", "inactive", true, "alice");
    }

    @Configuration
    @EnableWebMvc
    static class Config {
        @Bean ApprovalMatrixService matrix() { return mock(ApprovalMatrixService.class); }
        @Bean ApprovalSlotService slots() { return mock(ApprovalSlotService.class); }
        @Bean ApprovalMatrixController matrixController(ApprovalMatrixService service) {
            return new ApprovalMatrixController(service);
        }
        @Bean ApprovalSlotController slotController(ApprovalSlotService service) {
            return new ApprovalSlotController(service);
        }
        @Bean GlobalExceptionHandler errors() { return new GlobalExceptionHandler(); }
        @Bean DevApiKeyFilter filter() { return new DevApiKeyFilter(); }
    }
}

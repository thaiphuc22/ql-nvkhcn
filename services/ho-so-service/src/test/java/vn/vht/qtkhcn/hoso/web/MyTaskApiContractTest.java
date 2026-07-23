package vn.vht.qtkhcn.hoso.web;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import vn.vht.qtkhcn.hoso.security.InternalServiceTokenFilter;
import vn.vht.qtkhcn.hoso.security.DemoIdentity;
import vn.vht.qtkhcn.hoso.security.DemoIdentityProvider;
import vn.vht.qtkhcn.hoso.service.MyTaskQueryService;
import vn.vht.qtkhcn.hoso.web.dto.MyTaskResponse;

class MyTaskApiContractTest {

    private static final String AUTHORIZATION = "Bearer test-service-token";
    private MyTaskQueryService service;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        service = mock(MyTaskQueryService.class);
        mvc = MockMvcBuilders.standaloneSetup(new MyTaskQueryController(service, new DemoIdentityProvider()))
                .setControllerAdvice(new GlobalExceptionHandler())
                .addFilters(new InternalServiceTokenFilter("test-service-token"))
                .build();
    }

    @Test
    void returnsTheActiveTaskContractAndPassesTrustedIdentityToServerSideFilter() throws Exception {
        DemoIdentity identity = new DemoIdentity("pm@example.com", Set.of("PM", "PA", "NNC"), false);
        when(service.findActiveTasks(identity)).thenReturn(List.of(task()));

        mvc.perform(get("/api/my-tasks")
                        .header(HttpHeaders.AUTHORIZATION, AUTHORIZATION)
                        .header(MyTaskQueryController.USER_ID_HEADER, " PM@EXAMPLE.COM ")
                        .header("X-QTKHCN-Role-Codes", "ADMIN,UNAUTHORIZED_ROLE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].*").value(org.hamcrest.Matchers.hasSize(11)))
                .andExpect(jsonPath("$[0].processInstanceKey").value("1001"))
                .andExpect(jsonPath("$[0].taskKey").value("2001"))
                .andExpect(jsonPath("$[0].taskDefinitionKey").value("Task_1"))
                .andExpect(jsonPath("$[0].maHoSo").value("HS-2026-001"))
                .andExpect(jsonPath("$[0].tenBuoc").value("Phan cong tham muu"))
                .andExpect(jsonPath("$[0].dueAt").value("2026-07-23T17:00:00+07:00"))
                .andExpect(jsonPath("$[0].formKey").value("form-pm-review"))
                .andExpect(jsonPath("$[0].candidateGroups[0]").value("PM"));

        verify(service).findActiveTasks(eq(identity));
    }

    @Test
    void requiresIdentityInsteadOfAllowingAQueryParameterToImpersonateAnotherUser() throws Exception {
        mvc.perform(get("/api/my-tasks").queryParam("userId", "pm@example.com")
                        .header(HttpHeaders.AUTHORIZATION, AUTHORIZATION))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("X-QTKHCN-User-Id is required."));
    }

    @Test
    void returnsTheCurrentUsersActiveTaskForADossier() throws Exception {
        DemoIdentity identity = new DemoIdentity("pm@example.com", Set.of("PM", "PA", "NNC"), false);
        when(service.findActiveTaskForHoSo(identity, "HS-2026-001")).thenReturn(Optional.of(task()));

        mvc.perform(get("/api/ho-so/HS-2026-001/active-task")
                        .header(HttpHeaders.AUTHORIZATION, AUTHORIZATION)
                        .header(MyTaskQueryController.USER_ID_HEADER, " PM@EXAMPLE.COM "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.taskKey").value("2001"))
                .andExpect(jsonPath("$.maHoSo").value("HS-2026-001"));

        verify(service).findActiveTaskForHoSo(eq(identity), eq("HS-2026-001"));
    }

    @Test
    void returnsNotFoundWhenTheDossierHasNoActiveTaskForTheCurrentUser() throws Exception {
        DemoIdentity identity = new DemoIdentity("pm@example.com", Set.of("PM", "PA", "NNC"), false);
        when(service.findActiveTaskForHoSo(identity, "HS-2026-999")).thenReturn(Optional.empty());

        mvc.perform(get("/api/ho-so/HS-2026-999/active-task")
                        .header(HttpHeaders.AUTHORIZATION, AUTHORIZATION)
                        .header(MyTaskQueryController.USER_ID_HEADER, "pm@example.com"))
                .andExpect(status().isNotFound());
    }

    @Test
    void remainsProtectedByTheServiceBoundaryToken() throws Exception {
        mvc.perform(get("/api/my-tasks")
                        .header(MyTaskQueryController.USER_ID_HEADER, "pm@example.com"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rejectsAnUnknownIdentityInsteadOfTreatingItsSelfDeclaredRolesAsTrusted() throws Exception {
        mvc.perform(get("/api/my-tasks")
                        .header(HttpHeaders.AUTHORIZATION, AUTHORIZATION)
                        .header(MyTaskQueryController.USER_ID_HEADER, "attacker@example.com")
                        .header("X-QTKHCN-Role-Codes", "PM"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Demo identity is not allowed."));
    }

    private static MyTaskResponse task() {
        return new MyTaskResponse(
                "1001", "2001", "Task_1", "HS-2026-001", "Phan cong tham muu", null,
                List.of(), List.of("PM"), OffsetDateTime.parse("2026-07-18T10:00:00+07:00"),
                OffsetDateTime.parse("2026-07-23T17:00:00+07:00"), "form-pm-review");
    }
}

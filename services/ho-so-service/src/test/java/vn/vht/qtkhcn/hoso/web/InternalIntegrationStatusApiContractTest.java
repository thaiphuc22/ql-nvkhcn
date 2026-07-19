package vn.vht.qtkhcn.hoso.web;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import vn.vht.qtkhcn.hoso.security.InternalServiceTokenFilter;
import vn.vht.qtkhcn.hoso.service.InternalIntegrationStatusService;
import vn.vht.qtkhcn.hoso.web.dto.InternalIntegrationStatusResponse;

class InternalIntegrationStatusApiContractTest {
    private InternalIntegrationStatusService service;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        service = mock(InternalIntegrationStatusService.class);
        mvc = MockMvcBuilders.standaloneSetup(new InternalIntegrationStatusController(service))
                .addFilters(new InternalServiceTokenFilter("test-service-token"))
                .build();
    }

    @Test
    void returnsTheReadOnlyInternalChannelStatusContract() throws Exception {
        when(service.getStatus()).thenReturn(statusResponse());

        mvc.perform(get("/api/internal-integration/status")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer test-service-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.outboxPending").value(2))
                .andExpect(jsonPath("$.outboxFailed").value(1))
                .andExpect(jsonPath("$.latestSent.hoSoId").value("HS-2026-001"))
                .andExpect(jsonPath("$.latestInboxByType[0].eventType").value("TASK_CREATED"))
                .andExpect(jsonPath("$.startFailedDossiers[0].reason").value("Workflow service timeout"));
    }

    @Test
    void remainsProtectedByTheServiceBoundaryToken() throws Exception {
        mvc.perform(get("/api/internal-integration/status")).andExpect(status().isUnauthorized());
    }

    private static InternalIntegrationStatusResponse statusResponse() {
        var now = OffsetDateTime.parse("2026-07-18T10:00:00+07:00");
        return new InternalIntegrationStatusResponse(
                2, 1,
                new InternalIntegrationStatusResponse.OutboxEventSummary(
                        UUID.fromString("00000000-0000-0000-0000-000000000001"),
                        "HS-2026-001", "START_WORKFLOW", now, now.plusSeconds(2)),
                List.of(new InternalIntegrationStatusResponse.InboxEventSummary(
                        UUID.fromString("00000000-0000-0000-0000-000000000002"),
                        "TASK_CREATED", "HS-2026-001", "1001", now.plusSeconds(3), now.plusSeconds(4))),
                List.of(new InternalIntegrationStatusResponse.StartFailedDossier(
                        "HS-2026-099", "Workflow service timeout")));
    }
}

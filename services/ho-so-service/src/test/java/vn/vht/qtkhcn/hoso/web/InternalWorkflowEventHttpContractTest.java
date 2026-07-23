package vn.vht.qtkhcn.hoso.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import vn.vht.qtkhcn.hoso.security.InternalServiceTokenFilter;
import vn.vht.qtkhcn.hoso.service.WorkflowEventInboxService;

class InternalWorkflowEventHttpContractTest {
    private WorkflowEventInboxService service;
    private MockMvc mvc;

    @BeforeEach void setUp() {
        service = mock(WorkflowEventInboxService.class);
        mvc = MockMvcBuilders.standaloneSetup(new InternalWorkflowEventController(service))
                .setControllerAdvice(new GlobalExceptionHandler())
                .addFilters(new InternalServiceTokenFilter("test-token")).build();
    }

    @Test void firstDeliveryIs202DuplicateIs200AndAuthIsRequired() throws Exception {
        when(service.receive(any())).thenReturn(new WorkflowEventInboxService.Result(true),
                new WorkflowEventInboxService.Result(false));
        mvc.perform(request()).andExpect(status().isAccepted());
        mvc.perform(request()).andExpect(status().isOk());
        mvc.perform(post("/internal/v1/workflow-events").contentType(MediaType.APPLICATION_JSON)
                .content(body())).andExpect(status().isUnauthorized());
    }

    @Test void invalidEventTypeFailsClosed() throws Exception {
        mvc.perform(post("/internal/v1/workflow-events")
                .header(HttpHeaders.AUTHORIZATION, "Bearer test-token")
                .contentType(MediaType.APPLICATION_JSON).content(body().replace("TASK_CREATED", "UNKNOWN")))
                .andExpect(status().isBadRequest());
    }

    private static org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder request() {
        return post("/internal/v1/workflow-events")
                .header(HttpHeaders.AUTHORIZATION, "Bearer test-token")
                .contentType(MediaType.APPLICATION_JSON).content(body());
    }

    private static String body() {
        return """
                {"eventId":"1415e004-f82f-4a5d-9194-10232ad4264a","eventType":"TASK_CREATED",
                 "occurredAt":"2026-07-18T10:00:00Z","correlationId":"req-1","hoSoId":"HS-1",
                 "processInstanceId":"1001","payload":{"taskKey":"2001","taskDefinitionKey":"Task_1"}}
                """;
    }
}

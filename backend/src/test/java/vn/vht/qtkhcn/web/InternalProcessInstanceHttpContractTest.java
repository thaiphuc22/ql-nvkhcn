package vn.vht.qtkhcn.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import vn.vht.qtkhcn.security.InternalServiceTokenFilter;
import vn.vht.qtkhcn.service.IdempotentProcessStartService;
import vn.vht.qtkhcn.web.dto.StartProcessResponse;

class InternalProcessInstanceHttpContractTest {
    private IdempotentProcessStartService service;
    private MockMvc mvc;

    @BeforeEach void setUp() {
        service = mock(IdempotentProcessStartService.class);
        mvc = MockMvcBuilders.standaloneSetup(new InternalProcessInstanceController(service))
                .setControllerAdvice(new GlobalExceptionHandler())
                .addFilters(new InternalServiceTokenFilter("test-token")).build();
    }

    @Test void firstStartReturns201AndRequiresInternalBearer() throws Exception {
        UUID id = UUID.randomUUID();
        when(service.start(any())).thenReturn(new IdempotentProcessStartService.Result(
                new StartProcessResponse(id, "1001", "RD01_01", 3, "STARTED"), true));
        mvc.perform(post("/internal/v1/process-instances")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer test-token")
                        .header("Idempotency-Key", id).header("traceparent", "00-trace-span-01")
                        .contentType(MediaType.APPLICATION_JSON).content(body(id)))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.processInstanceId").value("1001"));
        mvc.perform(post("/internal/v1/process-instances").contentType(MediaType.APPLICATION_JSON)
                        .content(body(id))).andExpect(status().isUnauthorized());
    }

    @Test void mismatchedHeaderAndRequestIdReturns400WithoutCallingService() throws Exception {
        UUID id = UUID.randomUUID();
        mvc.perform(post("/internal/v1/process-instances")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer test-token")
                        .header("Idempotency-Key", UUID.randomUUID()).header("traceparent", "x")
                        .contentType(MediaType.APPLICATION_JSON).content(body(id)))
                .andExpect(status().isBadRequest());
    }

    private static String body(UUID id) {
        return """
                {"requestId":"%s","businessKey":"HS-001","processCode":"RD01.01",
                 "hoSoId":"HS-001","nhiemVuId":"NV-001","initiatorUserId":"U-001",
                 "initialVariables":{"maHoSo":"HS-001","cap":"TD"}}
                """.formatted(id);
    }
}

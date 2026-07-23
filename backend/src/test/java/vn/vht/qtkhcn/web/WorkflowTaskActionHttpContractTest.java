package vn.vht.qtkhcn.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import vn.vht.qtkhcn.service.TaskActionException;
import vn.vht.qtkhcn.service.WorkflowTaskActionService;
import vn.vht.qtkhcn.web.dto.TaskActionDtos.AvailableActionResponse;
import vn.vht.qtkhcn.web.dto.TaskActionDtos.AvailableActionsResponse;
import vn.vht.qtkhcn.web.dto.TaskActionDtos.ExecuteActionResponse;

class WorkflowTaskActionHttpContractTest {
    private WorkflowTaskActionService service;
    private MockMvc mvc;

    @BeforeEach void setUp() {
        service = mock(WorkflowTaskActionService.class);
        mvc = MockMvcBuilders.standaloneSetup(new WorkflowTaskActionController(service))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    @Test void listsServerFilteredAvailableActions() throws Exception {
        when(service.available("2001", "pm@example.com")).thenReturn(new AvailableActionsResponse(
                "2001", "1001", "Task_1", List.of(new AvailableActionResponse(
                        "APPROVE_STEP", "Đồng ý duyệt", "primary", false, false, true, "phieu-phe-duyet"))));

        mvc.perform(get("/api/tasks/2001/available-actions")
                        .header("X-QTKHCN-User-Id", "pm@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.taskKey").value("2001"))
                .andExpect(jsonPath("$.actions[0].actionCode").value("APPROVE_STEP"));
    }

    @Test void executeReturns202AndLocksTaskKeyInPathAndBody() throws Exception {
        UUID id = UUID.randomUUID();
        when(service.execute(eq("2001"), any(), eq("pm@example.com")))
                .thenReturn(new ExecuteActionResponse(id, "2001", "1001", "ACCEPTED"));

        mvc.perform(post("/api/tasks/2001/actions")
                        .header("X-QTKHCN-User-Id", "pm@example.com")
                        .contentType(MediaType.APPLICATION_JSON).content(body(id, "2001")))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.requestId").value(id.toString()))
                .andExpect(jsonPath("$.status").value("ACCEPTED"));
    }

    @Test void invalidBodyReturns400AndDomainAuthorizationCanReturn403() throws Exception {
        mvc.perform(post("/api/tasks/2001/actions")
                        .header("X-QTKHCN-User-Id", "pm@example.com")
                        .contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());

        when(service.available("2001", "unknown@example.com")).thenThrow(new TaskActionException(
                "IDENTITY_FORBIDDEN", org.springframework.http.HttpStatus.FORBIDDEN, "forbidden"));
        mvc.perform(get("/api/tasks/2001/available-actions")
                        .header("X-QTKHCN-User-Id", "unknown@example.com"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("IDENTITY_FORBIDDEN"));
    }

    private static String body(UUID id, String taskKey) {
        return """
                {"requestId":"%s","taskKey":"%s","actionCode":"APPROVE_STEP",
                 "comment":"ok","formData":{},"expectedTaskState":"ACTIVE"}
                """.formatted(id, taskKey);
    }
}

package vn.vht.qtkhcn.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
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
import vn.vht.qtkhcn.config.WebConfig;
import vn.vht.qtkhcn.domain.ProcessDefinitionSource;
import vn.vht.qtkhcn.domain.ProcessDefinitionStatus;
import vn.vht.qtkhcn.security.DevApiKeyFilter;
import vn.vht.qtkhcn.service.DeployedProcessImportService;
import vn.vht.qtkhcn.service.ProcessDefinitionService;
import vn.vht.qtkhcn.service.ProcessImportException;
import vn.vht.qtkhcn.service.ProcessInstanceOverviewService;
import vn.vht.qtkhcn.service.ProcessReadinessService;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionDetailResponse;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionImportResponse;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionSummaryResponse;
import vn.vht.qtkhcn.web.dto.ProcessDefinitionVersionResponse;
import vn.vht.qtkhcn.web.dto.ProcessInstanceOverviewDtos.CurrentStepResponse;
import vn.vht.qtkhcn.web.dto.ProcessInstanceOverviewDtos.RunningInstanceCountsResponse;
import vn.vht.qtkhcn.web.dto.ProcessInstanceOverviewDtos.RunningInstanceListResponse;
import vn.vht.qtkhcn.web.dto.ProcessInstanceOverviewDtos.RunningInstanceResponse;
import vn.vht.qtkhcn.web.dto.ProcessReadinessResponse;
import vn.vht.qtkhcn.web.dto.ProcessSyncResponse;
import vn.vht.qtkhcn.web.dto.SelectableProcessResponse;

class ProcessDefinitionHttpContractTest {

    private static final String KEY = "dev-local-only";
    private static final UUID CATALOG_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID VERSION_ID = UUID.fromString("22222222-2222-2222-2222-222222222222");
    private static final OffsetDateTime NOW = OffsetDateTime.of(2026, 7, 15, 10, 0, 0, 0, ZoneOffset.UTC);

    private AnnotationConfigWebApplicationContext context;
    private ProcessDefinitionService service;
    private ProcessInstanceOverviewService instanceOverviewService;
    private DeployedProcessImportService importService;
    private ProcessReadinessService readinessService;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        context = new AnnotationConfigWebApplicationContext();
        context.setServletContext(new MockServletContext());
        context.register(TestMvcConfig.class);
        context.refresh();
        service = context.getBean(ProcessDefinitionService.class);
        instanceOverviewService = context.getBean(ProcessInstanceOverviewService.class);
        importService = context.getBean(DeployedProcessImportService.class);
        readinessService = context.getBean(ProcessReadinessService.class);
        DevApiKeyFilter filter = context.getBean(DevApiKeyFilter.class);
        ReflectionTestUtils.setField(filter, "expectedKey", KEY);
        mvc = MockMvcBuilders.webAppContextSetup(context).addFilters(filter).build();
    }

    @AfterEach
    void tearDown() {
        context.close();
    }

    @Test
    void multipartFileFieldReturns201AndStableImportBody() throws Exception {
        when(service.importBpmn(any(), eq("tester"))).thenReturn(importResponse());
        var file = new MockMultipartFile("file", "demo.bpmn", MediaType.APPLICATION_XML_VALUE,
                "<definitions/>".getBytes());

        mvc.perform(multipart("/api/process-definitions/import").file(file)
                        .header("X-QTKHCN-Dev-Key", KEY).header("X-QTKHCN-Actor", "tester"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(CATALOG_ID.toString()))
                .andExpect(jsonPath("$.versionId").value(VERSION_ID.toString()))
                .andExpect(jsonPath("$.bpmnProcessId").value("demo"))
                .andExpect(jsonPath("$.version").value(4))
                .andExpect(jsonPath("$.camundaProcessDefinitionKey").value(44));
    }

    @Test
    void listDetailAndVersionsKeepBpmnXmlReadable() throws Exception {
        var version = versionResponse();
        when(service.list()).thenReturn(List.of(new ProcessDefinitionSummaryResponse(CATALOG_ID, "demo", "Demo",
                4, "demo.bpmn", ProcessDefinitionStatus.DEPLOYED, ProcessDefinitionSource.APP, NOW)));
        when(service.get(CATALOG_ID)).thenReturn(new ProcessDefinitionDetailResponse(CATALOG_ID, "demo", "Demo",
                NOW, NOW, version));
        when(service.getByBpmnProcessId("demo")).thenReturn(
                new ProcessDefinitionDetailResponse(CATALOG_ID, "demo", "Demo", NOW, NOW, version));
        when(service.versions(CATALOG_ID)).thenReturn(List.of(version));

        mvc.perform(get("/api/process-definitions").header("X-QTKHCN-Dev-Key", KEY))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].latestVersion").value(4));
        mvc.perform(get("/api/process-definitions/{id}", CATALOG_ID).header("X-QTKHCN-Dev-Key", KEY))
                .andExpect(status().isOk()).andExpect(jsonPath("$.latestVersion.bpmnXml").value("<xml/>"));
        mvc.perform(get("/api/process-definitions/{id}/versions", CATALOG_ID)
                        .header("X-QTKHCN-Dev-Key", KEY))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].bpmnXml").value("<xml/>"));
        mvc.perform(get("/api/process-definitions/by-bpmn-process-id/{bpmnProcessId}", "demo")
                        .header("X-QTKHCN-Dev-Key", KEY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bpmnProcessId").value("demo"))
                .andExpect(jsonPath("$.latestVersion.bpmnXml").value("<xml/>"));
    }

    /**
     * Hợp đồng của màn "Gửi duyệt": FE đọc `bpmnProcessId` để gửi đúng `quyTrinh`, và `userTaskCount`
     * để cảnh báo quy trình rỗng. Đổi tên field ở đây là làm vỡ dropdown chọn quy trình.
     */
    @Test
    void selectableExposesBpmnProcessIdAndUserTaskCountForTheSubmitPicker() throws Exception {
        when(service.selectable()).thenReturn(List.of(
                new SelectableProcessResponse(CATALOG_ID, "quy_trinh_moi", "Quy trình tự vẽ", 3, 2, NOW)));

        mvc.perform(get("/api/process-definitions/selectable").header("X-QTKHCN-Dev-Key", KEY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(CATALOG_ID.toString()))
                .andExpect(jsonPath("$[0].bpmnProcessId").value("quy_trinh_moi"))
                .andExpect(jsonPath("$[0].name").value("Quy trình tự vẽ"))
                .andExpect(jsonPath("$[0].latestVersion").value(3))
                .andExpect(jsonPath("$[0].userTaskCount").value(2));
    }

    /**
     * Hợp đồng nút "Đồng bộ từ Camunda". Điểm quan trọng: một quy trình nhập lỗi vẫn trả 200 kèm
     * `failures`, KHÔNG đổi thành lỗi HTTP — nếu đổi thì một BPMN hỏng trên engine sẽ chặn luôn
     * những quy trình khác vào catalog.
     */
    @Test
    void syncFromCamundaReportsPerProcessOutcomeInsteadOfFailingTheWholeRequest() throws Exception {
        when(importService.syncFromCamunda("tester")).thenReturn(new ProcessSyncResponse(3, 1, 1,
                List.of(new ProcessSyncResponse.ImportedProcess(CATALOG_ID, VERSION_ID, "quy_trinh_ngoai",
                        "Quy trình vẽ ngoài app", 2, true)),
                List.of(new ProcessSyncResponse.SyncFailure("quy_trinh_hong", "Không đọc được XML")),
                List.of()));

        mvc.perform(post("/api/process-definitions/sync-from-camunda")
                        .header("X-QTKHCN-Dev-Key", KEY).header("X-QTKHCN-Actor", "tester"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scanned").value(3))
                .andExpect(jsonPath("$.imported").value(1))
                .andExpect(jsonPath("$.alreadyKnown").value(1))
                .andExpect(jsonPath("$.importedProcesses[0].bpmnProcessId").value("quy_trinh_ngoai"))
                .andExpect(jsonPath("$.importedProcesses[0].newCatalog").value(true))
                .andExpect(jsonPath("$.failures[0].bpmnProcessId").value("quy_trinh_hong"));
    }

    /**
     * Đối soát quy trình là CHẨN ĐOÁN, không phải cổng chặn: kể cả khi mọi thứ đều đỏ, endpoint vẫn
     * trả 200 với đầy đủ chi tiết để người dùng biết phải sửa gì — không đổi thành lỗi HTTP.
     */
    @Test
    void readinessReturnsPerElementDiagnosticsWithHttp200EvenWhenEverythingIsBroken() throws Exception {
        when(readinessService.readiness("quy_trinh_moi")).thenReturn(new ProcessReadinessResponse(
                "quy_trinh_moi", "Quy trình mới", 1, "APP", "error",
                List.of(new ProcessReadinessResponse.UserTaskReadiness("Duyet", "Duyệt hồ sơ",
                        "phieu-khong-ton-tai", false, List.of("TD_KHCN"), List.of("TD_KHCN"), false,
                        List.of(), List.of("APPROVE_STEP"), "error",
                        List.of("Biểu mẫu \"phieu-khong-ton-tai\" không có trong thư viện biểu mẫu."))),
                List.of(new ProcessReadinessResponse.ServiceTaskReadiness("Check", "Kiểm tra", "khcn.chua-ai-lam",
                        false, "error", "Không có job worker nào lắng nghe \"khcn.chua-ai-lam\".")),
                List.of()));

        mvc.perform(get("/api/process-definitions/by-bpmn-process-id/quy_trinh_moi/readiness")
                        .header("X-QTKHCN-Dev-Key", KEY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.userTasks[0].elementId").value("Duyet"))
                .andExpect(jsonPath("$.userTasks[0].formExists").value(false))
                .andExpect(jsonPath("$.userTasks[0].unknownRoleCodes[0]").value("TD_KHCN"))
                .andExpect(jsonPath("$.userTasks[0].missingActions[0]").value("APPROVE_STEP"))
                .andExpect(jsonPath("$.serviceTasks[0].jobType").value("khcn.chua-ai-lam"))
                .andExpect(jsonPath("$.serviceTasks[0].workerRegistered").value(false));
    }

    /** Cột `source` phải ra tới JSON, nếu không màn `/quy-trinh` không phân biệt được nguồn. */
    @Test
    void listExposesTheSourceOfTheLatestVersion() throws Exception {
        when(service.list()).thenReturn(List.of(new ProcessDefinitionSummaryResponse(CATALOG_ID, "quy_trinh_ngoai",
                "Quy trình vẽ ngoài app", 2, "quy_trinh_ngoai.bpmn", ProcessDefinitionStatus.DEPLOYED,
                ProcessDefinitionSource.EXTERNAL, NOW)));

        mvc.perform(get("/api/process-definitions").header("X-QTKHCN-Dev-Key", KEY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].source").value("EXTERNAL"));
    }

    @Test
    void runningInstanceCountsAndDetailExposeCurrentStep() throws Exception {
        when(instanceOverviewService.runningCounts())
                .thenReturn(RunningInstanceCountsResponse.of(java.util.Map.of("demo", 3)));
        when(instanceOverviewService.runningInstances(CATALOG_ID)).thenReturn(
                RunningInstanceListResponse.of("demo", List.of(new RunningInstanceResponse("2251799813685249",
                        "HS-2026-004", 4, NOW, false,
                        List.of(new CurrentStepResponse("Task_2", "Thẩm định hồ sơ", "USER_TASK", NOW, false))))));

        mvc.perform(get("/api/process-definitions/running-instances").header("X-QTKHCN-Dev-Key", KEY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true))
                .andExpect(jsonPath("$.countsByProcessId.demo").value(3));

        mvc.perform(get("/api/process-definitions/{id}/running-instances", CATALOG_ID)
                        .header("X-QTKHCN-Dev-Key", KEY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bpmnProcessId").value("demo"))
                .andExpect(jsonPath("$.instances[0].processInstanceKey").value("2251799813685249"))
                .andExpect(jsonPath("$.instances[0].currentSteps[0].name").value("Thẩm định hồ sơ"));
    }

    /** A Camunda outage must degrade the runtime column, not the catalog grid. */
    @Test
    void camundaOutageIsReportedAsUnavailableInsteadOfHttpError() throws Exception {
        when(instanceOverviewService.runningCounts())
                .thenReturn(RunningInstanceCountsResponse.unavailable("Không đọc được trạng thái runtime từ Camunda: refused"));

        mvc.perform(get("/api/process-definitions/running-instances").header("X-QTKHCN-Dev-Key", KEY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false))
                .andExpect(jsonPath("$.countsByProcessId").isEmpty());
    }

    @Test
    void validationAndDeploymentFailuresHaveStableErrorEnvelope() throws Exception {
        var file = new MockMultipartFile("file", "demo.bpmn", MediaType.APPLICATION_XML_VALUE, "x".getBytes());
        when(service.importBpmn(any(), any()))
                .thenThrow(new ProcessImportException(ProcessImportException.Kind.VALIDATION,
                        "File BPMN không hợp lệ.", List.of("broken xml")))
                .thenThrow(new ProcessImportException(ProcessImportException.Kind.DEPLOYMENT,
                        "Camunda unavailable.", List.of("connection refused")));
        mvc.perform(multipart("/api/process-definitions/import").file(file)
                        .header("X-QTKHCN-Dev-Key", KEY))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("File BPMN không hợp lệ."))
                .andExpect(jsonPath("$.errors[0]").value("broken xml"));

        mvc.perform(multipart("/api/process-definitions/import").file(file)
                        .header("X-QTKHCN-Dev-Key", KEY))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.message").value("Camunda unavailable."))
                .andExpect(jsonPath("$.errors[0]").value("connection refused"));
    }

    @Test
    void apiKeyIsRequiredButAngularCorsPreflightIsAllowed() throws Exception {
        mvc.perform(get("/api/process-definitions"))
                .andExpect(status().isUnauthorized());

        mvc.perform(options("/api/process-definitions")
                        .header("Origin", "http://localhost:4200")
                        .header("Access-Control-Request-Method", "GET")
                        .header("Access-Control-Request-Headers", "X-QTKHCN-Dev-Key"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:4200"));
    }

    private static ProcessDefinitionImportResponse importResponse() {
        return new ProcessDefinitionImportResponse(CATALOG_ID, VERSION_ID, "demo", "Demo", "demo.bpmn",
                43L, 44L, 4, ProcessDefinitionStatus.DEPLOYED, "a".repeat(64), "tester", NOW, List.of());
    }

    private static ProcessDefinitionVersionResponse versionResponse() {
        return new ProcessDefinitionVersionResponse(VERSION_ID, 4, "demo.bpmn", "a".repeat(64), 43L, 44L,
                ProcessDefinitionStatus.DEPLOYED, ProcessDefinitionSource.APP, "tester", NOW, "<xml/>", List.of());
    }

    @Configuration
    @EnableWebMvc
    static class TestMvcConfig {
        @Bean
        ProcessDefinitionService processDefinitionService() {
            return mock(ProcessDefinitionService.class);
        }

        @Bean
        ProcessInstanceOverviewService processInstanceOverviewService() {
            return mock(ProcessInstanceOverviewService.class);
        }

        @Bean
        DeployedProcessImportService deployedProcessImportService() {
            return mock(DeployedProcessImportService.class);
        }

        @Bean
        ProcessReadinessService processReadinessService() {
            return mock(ProcessReadinessService.class);
        }

        @Bean
        ProcessDefinitionController processDefinitionController(ProcessDefinitionService service,
                ProcessInstanceOverviewService instanceOverviewService,
                DeployedProcessImportService importService,
                ProcessReadinessService readinessService) {
            return new ProcessDefinitionController(service, instanceOverviewService, importService,
                    readinessService);
        }

        @Bean
        GlobalExceptionHandler globalExceptionHandler() {
            return new GlobalExceptionHandler();
        }

        @Bean
        DevApiKeyFilter devApiKeyFilter() {
            return new DevApiKeyFilter();
        }

        @Bean
        WebConfig webConfig(org.springframework.core.env.Environment environment) {
            return new WebConfig(environment);
        }
    }
}

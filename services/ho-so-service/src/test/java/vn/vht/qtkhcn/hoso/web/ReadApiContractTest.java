package vn.vht.qtkhcn.hoso.web;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDate;
import java.util.List;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import vn.vht.qtkhcn.hoso.domain.Cap;
import vn.vht.qtkhcn.hoso.domain.DossierStatus;
import vn.vht.qtkhcn.hoso.domain.GiaiDoan;
import vn.vht.qtkhcn.hoso.domain.HoSoLoai;
import vn.vht.qtkhcn.hoso.domain.StepStatus;
import vn.vht.qtkhcn.hoso.web.dto.TaiLieuResponse;
import vn.vht.qtkhcn.hoso.observability.ReadAuditFilter;
import vn.vht.qtkhcn.hoso.security.InternalServiceTokenFilter;
import vn.vht.qtkhcn.hoso.service.HoSoQueryService;
import vn.vht.qtkhcn.hoso.service.NhiemVuQueryService;
import vn.vht.qtkhcn.hoso.service.VersionedResponse;
import vn.vht.qtkhcn.hoso.web.dto.DossierStepResponse;
import vn.vht.qtkhcn.hoso.web.dto.HoSoResponse;
import vn.vht.qtkhcn.hoso.web.dto.NhiemVuResponse;

class ReadApiContractTest {

    private static final String AUTHORIZATION = "Bearer test-service-token";
    private NhiemVuQueryService nhiemVuService;
    private HoSoQueryService hoSoService;
    private MockMvc mvc;
    private SimpleMeterRegistry meterRegistry;

    @BeforeEach
    void setUp() {
        nhiemVuService = mock(NhiemVuQueryService.class);
        hoSoService = mock(HoSoQueryService.class);
        meterRegistry = new SimpleMeterRegistry();
        mvc = MockMvcBuilders.standaloneSetup(
                        new NhiemVuQueryController(nhiemVuService),
                        new HoSoQueryController(hoSoService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .addFilters(new InternalServiceTokenFilter("test-service-token"), new ReadAuditFilter(meterRegistry))
                .build();
    }

    @Test
    void nhiemVuListKeepsTheEightFieldLegacyContractAndAddsCorrelationHeader() throws Exception {
        when(nhiemVuService.findAll()).thenReturn(List.of(nhiemVu()));

        mvc.perform(get("/api/nhiem-vu")
                        .header(HttpHeaders.AUTHORIZATION, AUTHORIZATION)
                        .header(ReadAuditFilter.CORRELATION_HEADER, "corr-001"))
                .andExpect(status().isOk())
                .andExpect(header().string(ReadAuditFilter.CORRELATION_HEADER, "corr-001"))
                .andExpect(jsonPath("$[0].*").value(org.hamcrest.Matchers.hasSize(8)))
                .andExpect(jsonPath("$[0].ma").value("RD.2026.001"))
                .andExpect(jsonPath("$[0].cap").value("TD"))
                .andExpect(jsonPath("$[0].giaiDoan").value("CHU_TRUONG"));
    }

    @Test
    void hoSoListIncludesDocumentsAndMissionDurationWithTheStepContract() throws Exception {
        when(hoSoService.findAll()).thenReturn(List.of(hoSo()));

        mvc.perform(get("/api/ho-so").header(HttpHeaders.AUTHORIZATION, AUTHORIZATION))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].*").value(org.hamcrest.Matchers.hasSize(20)))
                .andExpect(jsonPath("$[0].id").value("HS-2026-001"))
                .andExpect(jsonPath("$[0].steps[0].*").value(org.hamcrest.Matchers.hasSize(11)))
                .andExpect(jsonPath("$[0].steps[0].taskDefinitionKey").value("t2"))
                .andExpect(jsonPath("$[0].taiLieu[0].ten").value("Thuyết minh.pdf"))
                .andExpect(jsonPath("$[0].thoiGianThucHien").value("2026-2027"))
                .andExpect(jsonPath("$[0].hoiDongXetDuyet").isArray());
    }

    @Test
    void notFoundKeepsLegacyMessageEnvelope() throws Exception {
        when(nhiemVuService.findById("missing"))
                .thenThrow(new EntityNotFoundException("Không tìm thấy NhiemVu missing"));

        mvc.perform(get("/api/nhiem-vu/missing").header(HttpHeaders.AUTHORIZATION, AUTHORIZATION))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.*").value(org.hamcrest.Matchers.hasSize(1)))
                .andExpect(jsonPath("$.message").value("Không tìm thấy NhiemVu missing"));
    }

    @Test
    void internalApiRejectsMissingServiceToken() throws Exception {
        mvc.perform(get("/api/ho-so"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Unauthorized"));
    }

    @Test
    void scaffoldDoesNotExposeWriteEndpoints() throws Exception {
        mvc.perform(post("/api/ho-so").header(HttpHeaders.AUTHORIZATION, AUTHORIZATION))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    void readMetricsSeparateCanaryTrafficAndNormalizeItemRoutes() throws Exception {
        when(hoSoService.findById("HS-2026-001")).thenReturn(new VersionedResponse<>(hoSo(), 0));

        mvc.perform(get("/api/ho-so/HS-2026-001")
                        .header(HttpHeaders.AUTHORIZATION, AUTHORIZATION)
                        .header(ReadAuditFilter.CANARY_HEADER, "true"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"));

        double count = meterRegistry.get("qtkhcn.read.requests")
                .tag("traffic", "canary")
                .tag("route", "/api/ho-so/{id}")
                .tag("outcome", "success")
                .timer()
                .count();
        org.junit.jupiter.api.Assertions.assertEquals(1.0, count);
    }

    private static NhiemVuResponse nhiemVu() {
        return new NhiemVuResponse(
                "RD.2026.001",
                "Nhiệm vụ thử nghiệm",
                Cap.TD,
                "TS. Nguyễn Văn A",
                "VHT",
                "2026-2027",
                "1.000.000.000 đ",
                GiaiDoan.CHU_TRUONG);
    }

    private static HoSoResponse hoSo() {
        DossierStepResponse step = new DossierStepResponse(
                1,
                "t2",
                "Ký duyệt",
                "Lãnh đạo",
                List.of("LD"),
                null,
                StepStatus.CURRENT,
                null,
                null,
                "2026-07-23",
                "form-t2");
        return new HoSoResponse(
                "HS-2026-001",
                "RD.2026.001",
                HoSoLoai.CHU_TRUONG,
                "RD01.01",
                "Xét duyệt chủ trương",
                "U-001",
                LocalDate.of(2026, 7, 16),
                DossierStatus.PROCESSING,
                1,
                42L,
                List.of(step),
                List.of(new TaiLieuResponse(1L, "Thuyết minh.pdf", "PDF", 0L, null, null, false)),
                "RD.2026.001",
                "Nhiệm vụ thử nghiệm",
                "TS. Nguyễn Văn A",
                "VHT",
                "2026-2027",
                "1.000.000.000 đ",
                Cap.TD,
                List.of());
    }
}

package vn.vht.qtkhcn.web;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
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
import vn.vht.qtkhcn.config.WebConfig;
import vn.vht.qtkhcn.domain.Cap;
import vn.vht.qtkhcn.domain.ChuNhiem;
import vn.vht.qtkhcn.domain.GiaiDoan;
import vn.vht.qtkhcn.domain.NhiemVu;
import vn.vht.qtkhcn.repository.NhiemVuRepository;
import vn.vht.qtkhcn.security.DevApiKeyFilter;

class NhiemVuHttpContractTest {

    private static final String KEY = "dev-local-only";

    private AnnotationConfigWebApplicationContext context;
    private NhiemVuRepository repository;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        context = new AnnotationConfigWebApplicationContext();
        context.setServletContext(new MockServletContext());
        context.register(TestMvcConfig.class);
        context.refresh();
        repository = context.getBean(NhiemVuRepository.class);
        DevApiKeyFilter filter = context.getBean(DevApiKeyFilter.class);
        ReflectionTestUtils.setField(filter, "expectedKey", KEY);
        mvc = MockMvcBuilders.webAppContextSetup(context).addFilters(filter).build();
    }

    @AfterEach
    void tearDown() {
        context.close();
    }

    @Test
    void listReturnsJsonWithExactlyEightLegacyFields() throws Exception {
        when(repository.findAll()).thenReturn(List.of(nhiemVu("RD.2026.012")));

        mvc.perform(get("/api/nhiem-vu").header("X-QTKHCN-Dev-Key", KEY))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].length()").value(8))
                .andExpect(jsonPath("$[0].ma").value("RD.2026.012"))
                .andExpect(jsonPath("$[0].ten").value("Nhiem vu thu nghiem"))
                .andExpect(jsonPath("$[0].cap").value("TD"))
                .andExpect(jsonPath("$[0].chuNhiem").value("TS. Nguyen Van A"))
                .andExpect(jsonPath("$[0].donViChuTri").value("Trung tam A"))
                .andExpect(jsonPath("$[0].thoiGianThucHien").value("2026-2027"))
                .andExpect(jsonPath("$[0].duToan").value("1.000.000.000 d"))
                .andExpect(jsonPath("$[0].giaiDoan").value("CHU_TRUONG"));
    }

    @Test
    void missingDetailReturnsStable404Envelope() throws Exception {
        when(repository.findById("RD.404")).thenReturn(Optional.empty());

        mvc.perform(get("/api/nhiem-vu/RD.404").header("X-QTKHCN-Dev-Key", KEY))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Không tìm thấy NhiemVu RD.404"));
    }

    @Test
    void validCreateReturns201GeneratedCodeAndChuTruongDefault() throws Exception {
        when(repository.findAll()).thenReturn(List.of(nhiemVu("RD.2026.012")));
        when(repository.save(any(NhiemVu.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mvc.perform(post("/api/nhiem-vu")
                        .header("X-QTKHCN-Dev-Key", KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"ten":"Nhiem vu moi","cap":"TD","chuNhiemHoTen":"Tran Van B",
                                 "chuNhiemHocHamHocVi":"PGS.TS.","chuNhiemMaNhanVien":"NV002",
                                 "chuNhiemEmail":"b@example.test","donViChuTri":"Trung tam B",
                                 "thoiGianThucHien":"2026-2028","duToan":"2.000.000.000 d"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(8))
                .andExpect(jsonPath("$.ma").value("RD.%d.013".formatted(LocalDate.now().getYear())))
                .andExpect(jsonPath("$.chuNhiem").value("PGS.TS. Tran Van B"))
                .andExpect(jsonPath("$.giaiDoan").value("CHU_TRUONG"));
    }

    @Test
    void invalidCreateReturnsLegacyValidationEnvelope() throws Exception {
        mvc.perform(post("/api/nhiem-vu")
                        .header("X-QTKHCN-Dev-Key", KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Request không hợp lệ."))
                .andExpect(jsonPath("$.errors", hasSize(4)));
    }

    @Test
    void apiKeyIsRequiredButAngularCorsPreflightIsAllowed() throws Exception {
        mvc.perform(get("/api/nhiem-vu"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/nhiem-vu").header("X-QTKHCN-Dev-Key", "wrong"))
                .andExpect(status().isUnauthorized());

        mvc.perform(options("/api/nhiem-vu")
                        .header("Origin", "http://localhost:4200")
                        .header("Access-Control-Request-Method", "GET")
                        .header("Access-Control-Request-Headers", "X-QTKHCN-Dev-Key"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:4200"));
    }

    private static NhiemVu nhiemVu(String ma) {
        NhiemVu n = new NhiemVu();
        n.setMa(ma);
        n.setTen("Nhiem vu thu nghiem");
        n.setCap(Cap.TD);
        n.setChuNhiem(new ChuNhiem("Nguyen Van A", "TS.", "NV001", "a@example.test", null, null));
        n.setDonViChuTri("Trung tam A");
        n.setThoiGianThucHien("2026-2027");
        n.setDuToan("1.000.000.000 d");
        n.setGiaiDoan(GiaiDoan.CHU_TRUONG);
        return n;
    }

    @Configuration
    @EnableWebMvc
    static class TestMvcConfig {
        @Bean NhiemVuRepository repository() { return mock(NhiemVuRepository.class); }
        @Bean NhiemVuController controller(NhiemVuRepository repository) {
            return new NhiemVuController(repository);
        }
        @Bean GlobalExceptionHandler errors() { return new GlobalExceptionHandler(); }
        @Bean DevApiKeyFilter filter() { return new DevApiKeyFilter(); }
        @Bean WebConfig webConfig(org.springframework.core.env.Environment environment) {
            return new WebConfig(environment);
        }
    }
}

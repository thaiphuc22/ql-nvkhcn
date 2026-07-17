package vn.vht.qtkhcn.web;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
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
import vn.vht.qtkhcn.domain.DossierStatus;
import vn.vht.qtkhcn.domain.DossierStep;
import vn.vht.qtkhcn.domain.HoSo;
import vn.vht.qtkhcn.domain.HoSoLoai;
import vn.vht.qtkhcn.domain.NhiemVu;
import vn.vht.qtkhcn.domain.StepStatus;
import vn.vht.qtkhcn.domain.TaiLieu;
import vn.vht.qtkhcn.repository.HoSoRepository;
import vn.vht.qtkhcn.repository.NhiemVuRepository;
import vn.vht.qtkhcn.security.DevApiKeyFilter;
import vn.vht.qtkhcn.service.HoSoService;
import vn.vht.qtkhcn.web.dto.CreateHoSoRequest;
import vn.vht.qtkhcn.web.dto.HoSoActionRequest;
import vn.vht.qtkhcn.web.dto.SubmitHoSoRequest;

class HoSoHttpContractTest {

    private static final String KEY = "dev-local-only";
    private static final String HO_SO_ID = "HS-2026-001";

    private AnnotationConfigWebApplicationContext context;
    private HoSoRepository hoSoRepository;
    private NhiemVuRepository nhiemVuRepository;
    private HoSoService service;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        context = new AnnotationConfigWebApplicationContext();
        context.setServletContext(new MockServletContext());
        context.register(TestMvcConfig.class);
        context.refresh();
        hoSoRepository = context.getBean(HoSoRepository.class);
        nhiemVuRepository = context.getBean(NhiemVuRepository.class);
        service = context.getBean(HoSoService.class);
        DevApiKeyFilter filter = context.getBean(DevApiKeyFilter.class);
        ReflectionTestUtils.setField(filter, "expectedKey", KEY);
        mvc = MockMvcBuilders.webAppContextSetup(context).addFilters(filter).build();
    }

    @AfterEach
    void tearDown() {
        context.close();
    }

    @Test
    void listReturnsDetailViewIncludingDocumentsAndMissionDuration() throws Exception {
        HoSo hoSo = draft();
        hoSo.getTaiLieu().add(new TaiLieu("Thuyet minh.pdf", "PDF"));
        when(hoSoRepository.findAll()).thenReturn(List.of(hoSo));
        when(nhiemVuRepository.findById(hoSo.getMaNV())).thenReturn(Optional.of(nhiemVu()));

        mvc.perform(get("/api/ho-so").header("X-QTKHCN-Dev-Key", KEY))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].length()").value(19))
                .andExpect(jsonPath("$[0].id").value(HO_SO_ID))
                .andExpect(jsonPath("$[0].maNV").value("RD.2026.001"))
                .andExpect(jsonPath("$[0].loai").value("CHU_TRUONG"))
                .andExpect(jsonPath("$[0].trangThai").value("DRAFT"))
                .andExpect(jsonPath("$[0].steps", hasSize(1)))
                .andExpect(jsonPath("$[0].steps[0].length()").value(11))
                .andExpect(jsonPath("$[0].steps[0].buocIndex").value(0))
                .andExpect(jsonPath("$[0].steps[0].vaiTroCodes[0]").value("PM"))
                .andExpect(jsonPath("$[0].steps[0].trangThai").value("DONE"))
                .andExpect(jsonPath("$[0].taiLieu[0].ten").value("Thuyet minh.pdf"))
                .andExpect(jsonPath("$[0].maDeTai").value("RD.2026.001"))
                .andExpect(jsonPath("$[0].tenDeTai").value("Nhiem vu thu nghiem"))
                .andExpect(jsonPath("$[0].chuNhiem").value("TS. Nguyen Van A"))
                .andExpect(jsonPath("$[0].donVi").value("Trung tam A"))
                .andExpect(jsonPath("$[0].thoiGianThucHien").value("2026-2027"))
                .andExpect(jsonPath("$[0].duToan").value("1.000.000.000 d"))
                .andExpect(jsonPath("$[0].cap").value("TD"));
    }

    @Test
    void createReturnsDraftDefaultsAndPersistedDocuments() throws Exception {
        HoSo created = draft();
        created.getTaiLieu().add(new TaiLieu("Thuyet minh.pdf", "PDF"));
        created.getTaiLieu().add(new TaiLieu("Du toan.xlsx", "Excel"));
        when(service.createDraft(any(CreateHoSoRequest.class))).thenReturn(created);
        when(nhiemVuRepository.findById(created.getMaNV())).thenReturn(Optional.of(nhiemVu()));

        mvc.perform(post("/api/ho-so")
                        .header("X-QTKHCN-Dev-Key", KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"maNV":"RD.2026.001","nguoiKhoiTao":"alice"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.length()").value(19))
                .andExpect(jsonPath("$.trangThai").value("DRAFT"))
                .andExpect(jsonPath("$.buocHienTai").value(0))
                .andExpect(jsonPath("$.steps", hasSize(1)))
                .andExpect(jsonPath("$.steps[0].trangThai").value("DONE"))
                .andExpect(jsonPath("$.taiLieu", hasSize(2)))
                .andExpect(jsonPath("$.taiLieu[1].loai").value("Excel"));

        verify(service).createDraft(any(CreateHoSoRequest.class));
    }

    @Test
    void createBindsDateTypeAndSelectedDocuments() throws Exception {
        HoSo created = draft();
        when(service.createDraft(any(CreateHoSoRequest.class))).thenReturn(created);
        when(nhiemVuRepository.findById(created.getMaNV())).thenReturn(Optional.of(nhiemVu()));

        mvc.perform(post("/api/ho-so")
                        .header("X-QTKHCN-Dev-Key", KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "maNV":"RD.2026.001",
                                  "loai":"NGHIEM_THU",
                                  "nguoiKhoiTao":"TS. Tran Van Nam",
                                  "ngayTao":"2026-07-15",
                                  "taiLieu":[{"ten":"Bao cao.pdf","loai":"PDF"}]
                                }
                                """))
                .andExpect(status().isCreated());

        ArgumentCaptor<CreateHoSoRequest> request = ArgumentCaptor.forClass(CreateHoSoRequest.class);
        verify(service, atLeastOnce()).createDraft(request.capture());
        CreateHoSoRequest value = request.getValue();
        org.junit.jupiter.api.Assertions.assertAll(
                () -> org.junit.jupiter.api.Assertions.assertEquals(HoSoLoai.NGHIEM_THU, value.loai()),
                () -> org.junit.jupiter.api.Assertions.assertEquals(LocalDate.of(2026, 7, 15), value.ngayTao()),
                () -> org.junit.jupiter.api.Assertions.assertEquals("Bao cao.pdf", value.taiLieu().get(0).ten()));
    }

    @Test
    void createMapsMissingMissionTo404AndInvalidRequestTo400() throws Exception {
        when(service.createDraft(any(CreateHoSoRequest.class)))
                .thenThrow(new java.util.NoSuchElementException("Không tìm thấy NhiemVu RD.404"));

        mvc.perform(post("/api/ho-so")
                        .header("X-QTKHCN-Dev-Key", KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"maNV\":\"RD.404\",\"nguoiKhoiTao\":\"alice\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Không tìm thấy NhiemVu RD.404"));

        mvc.perform(post("/api/ho-so")
                        .header("X-QTKHCN-Dev-Key", KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Request không hợp lệ."))
                .andExpect(jsonPath("$.errors", hasSize(2)));
    }

    @Test
    void submitRd0101ReturnsProcessingStepChainAndProcessKey() throws Exception {
        HoSo submitted = submitted();
        when(service.submit(eq(HO_SO_ID), any(SubmitHoSoRequest.class))).thenReturn(submitted);
        when(nhiemVuRepository.findById(submitted.getMaNV())).thenReturn(Optional.of(nhiemVu()));

        mvc.perform(post("/api/ho-so/{id}/submit", HO_SO_ID)
                        .header("X-QTKHCN-Dev-Key", KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quyTrinh\":\"RD01.01\",\"quyTrinhTen\":\"Chu truong\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quyTrinh").value("RD01.01"))
                .andExpect(jsonPath("$.trangThai").value("PROCESSING"))
                .andExpect(jsonPath("$.buocHienTai").value(1))
                .andExpect(jsonPath("$.zeebeProcessInstanceKey").value(2251799813689001L))
                .andExpect(jsonPath("$.steps", hasSize(6)))
                .andExpect(jsonPath("$.steps[0].trangThai").value("DONE"))
                .andExpect(jsonPath("$.steps[1].taskDefinitionKey").value("t2"))
                .andExpect(jsonPath("$.steps[1].trangThai").value("CURRENT"))
                .andExpect(jsonPath("$.steps[2].taskDefinitionKey").value("t3"))
                .andExpect(jsonPath("$.steps[3].taskDefinitionKey").value("t4"))
                .andExpect(jsonPath("$.steps[4].taskDefinitionKey").value("t5"))
                .andExpect(jsonPath("$.steps[5].taskDefinitionKey").value("t6"));
    }

    @Test
    void unsupportedAndDuplicateSubmitKeep501And409Contracts() throws Exception {
        when(service.submit(eq(HO_SO_ID), any(SubmitHoSoRequest.class)))
                .thenThrow(new UnsupportedOperationException("Quy trình RD02.01 chưa được hỗ trợ."))
                .thenThrow(new IllegalStateException("Hồ sơ đã được gửi duyệt."));

        mvc.perform(post("/api/ho-so/{id}/submit", HO_SO_ID)
                        .header("X-QTKHCN-Dev-Key", KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quyTrinh\":\"RD02.01\",\"quyTrinhTen\":\"Xet duyet\"}"))
                .andExpect(status().isNotImplemented())
                .andExpect(jsonPath("$.message").value("Quy trình RD02.01 chưa được hỗ trợ."));

        mvc.perform(post("/api/ho-so/{id}/submit", HO_SO_ID)
                        .header("X-QTKHCN-Dev-Key", KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quyTrinh\":\"RD01.01\",\"quyTrinhTen\":\"Chu truong\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Hồ sơ đã được gửi duyệt."));
    }

    @Test
    void missingGetAndActionReturn404() throws Exception {
        when(service.getOrThrow("HS-404")).thenThrow(new EntityNotFoundException("Không tìm thấy HoSo HS-404"));
        when(service.applyAction(eq("HS-404"), any(HoSoActionRequest.class)))
                .thenThrow(new EntityNotFoundException("Không tìm thấy HoSo HS-404"));

        mvc.perform(get("/api/ho-so/HS-404").header("X-QTKHCN-Dev-Key", KEY))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Không tìm thấy HoSo HS-404"));

        mvc.perform(post("/api/ho-so/HS-404/actions")
                        .header("X-QTKHCN-Dev-Key", KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"outcome\":\"APPROVE_STEP\",\"actor\":\"alice\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Không tìm thấy HoSo HS-404"));
    }

    @Test
    void actionWithoutProcessKeyReturns409() throws Exception {
        when(service.applyAction(eq(HO_SO_ID), any(HoSoActionRequest.class)))
                .thenThrow(new IllegalStateException(
                        "Hồ sơ HS-2026-001 không có Zeebe process instance; từ chối cập nhật domain."));

        mvc.perform(post("/api/ho-so/{id}/actions", HO_SO_ID)
                        .header("X-QTKHCN-Dev-Key", KEY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"outcome\":\"APPROVE_STEP\",\"actor\":\"alice\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(
                        "Hồ sơ HS-2026-001 không có Zeebe process instance; từ chối cập nhật domain."));
    }

    @Test
    void apiKeyIsRequiredButAngularCorsPreflightIsAllowed() throws Exception {
        mvc.perform(get("/api/ho-so"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/ho-so").header("X-QTKHCN-Dev-Key", "wrong"))
                .andExpect(status().isUnauthorized());

        mvc.perform(options("/api/ho-so")
                        .header("Origin", "http://localhost:4200")
                        .header("Access-Control-Request-Method", "GET")
                        .header("Access-Control-Request-Headers", "X-QTKHCN-Dev-Key"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:4200"));
    }

    private static NhiemVu nhiemVu() {
        NhiemVu n = new NhiemVu();
        n.setMa("RD.2026.001");
        n.setTen("Nhiem vu thu nghiem");
        n.setCap(Cap.TD);
        n.setChuNhiem(new ChuNhiem("Nguyen Van A", "TS.", "NV001", "a@example.test", null, null));
        n.setDonViChuTri("Trung tam A");
        n.setThoiGianThucHien("2026-2027");
        n.setDuToan("1.000.000.000 d");
        return n;
    }

    private static HoSo draft() {
        HoSo h = new HoSo();
        h.setId(HO_SO_ID);
        h.setMaNV("RD.2026.001");
        h.setLoai(HoSoLoai.CHU_TRUONG);
        h.setQuyTrinh("");
        h.setQuyTrinhTen("Chua vao quy trinh");
        h.setNguoiKhoiTao("alice");
        h.setNgayTao(LocalDate.of(2026, 7, 16));
        h.setTrangThai(DossierStatus.DRAFT);
        h.setBuocHienTai(0);
        h.setSteps(new ArrayList<>());
        addStep(h, 0, null, "Khoi tao ho so", StepStatus.DONE, Set.of("PM"));
        return h;
    }

    private static HoSo submitted() {
        HoSo h = draft();
        h.setQuyTrinh("RD01.01");
        h.setQuyTrinhTen("Chu truong");
        h.setTrangThai(DossierStatus.PROCESSING);
        h.setBuocHienTai(1);
        h.setZeebeProcessInstanceKey(2251799813689001L);
        addStep(h, 1, "t2", "Ky duyet", StepStatus.CURRENT, Set.of("BGD_TT", "BGD_KHOI"));
        addStep(h, 2, "t3", "Tham dinh", StepStatus.PENDING, Set.of("TP_CLKHCN"));
        addStep(h, 3, "t4", "Bao cao tham dinh", StepStatus.PENDING, Set.of("CQ_QLKHCN"));
        addStep(h, 4, "t5", "Hoi dong phe duyet", StepStatus.PENDING, Set.of("HDKHCN"));
        addStep(h, 5, "t6", "TGD phe duyet", StepStatus.PENDING, Set.of("TGD_VHT"));
        return h;
    }

    private static void addStep(HoSo h, int index, String key, String name, StepStatus status, Set<String> roles) {
        DossierStep step = new DossierStep();
        step.setHoSo(h);
        step.setBuocIndex(index);
        step.setTaskDefinitionKey(key);
        step.setTen(name);
        step.setVaiTro("Role");
        step.setVaiTroCodes(roles);
        step.setTrangThai(status);
        h.getSteps().add(step);
    }

    @Configuration
    @EnableWebMvc
    static class TestMvcConfig {
        @Bean HoSoRepository hoSoRepository() { return mock(HoSoRepository.class); }
        @Bean NhiemVuRepository nhiemVuRepository() { return mock(NhiemVuRepository.class); }
        @Bean HoSoService service() { return mock(HoSoService.class); }
        @Bean HoSoController controller(HoSoRepository hoSoRepository, NhiemVuRepository nhiemVuRepository,
                                         HoSoService service) {
            return new HoSoController(hoSoRepository, nhiemVuRepository, service);
        }
        @Bean GlobalExceptionHandler errors() { return new GlobalExceptionHandler(); }
        @Bean DevApiKeyFilter filter() { return new DevApiKeyFilter(); }
        @Bean WebConfig webConfig(org.springframework.core.env.Environment environment) {
            return new WebConfig(environment);
        }
    }
}

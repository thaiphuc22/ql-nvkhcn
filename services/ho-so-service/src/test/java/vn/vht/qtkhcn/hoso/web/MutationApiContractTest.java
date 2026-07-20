package vn.vht.qtkhcn.hoso.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import vn.vht.qtkhcn.hoso.domain.Cap;
import vn.vht.qtkhcn.hoso.domain.ChuNhiem;
import vn.vht.qtkhcn.hoso.domain.DossierStatus;
import vn.vht.qtkhcn.hoso.domain.GiaiDoan;
import vn.vht.qtkhcn.hoso.domain.HoSo;
import vn.vht.qtkhcn.hoso.domain.HoSoLoai;
import vn.vht.qtkhcn.hoso.domain.NhiemVu;
import vn.vht.qtkhcn.hoso.domain.TaiLieu;
import vn.vht.qtkhcn.hoso.security.InternalServiceTokenFilter;
import vn.vht.qtkhcn.hoso.service.HoSoMutationService;
import vn.vht.qtkhcn.hoso.service.HoSoQueryService;
import vn.vht.qtkhcn.hoso.service.NhiemVuMutationService;
import vn.vht.qtkhcn.hoso.service.VersionConflictException;
import vn.vht.qtkhcn.hoso.service.VersionedResponse;
import vn.vht.qtkhcn.hoso.service.WorkflowSubmissionService;
import vn.vht.qtkhcn.hoso.web.dto.HoSoResponse;

class MutationApiContractTest {
    private static final String AUTH = "Bearer test-service-token";
    private NhiemVuMutationService nhiemVuService;
    private HoSoMutationService hoSoService;
    private HoSoQueryService queryService;
    private WorkflowSubmissionService workflowSubmissionService;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        nhiemVuService = mock(NhiemVuMutationService.class);
        hoSoService = mock(HoSoMutationService.class);
        queryService = mock(HoSoQueryService.class);
        workflowSubmissionService = mock(WorkflowSubmissionService.class);
        mvc = MockMvcBuilders.standaloneSetup(
                        new NhiemVuMutationController(nhiemVuService),
                        new HoSoMutationController(hoSoService, queryService, workflowSubmissionService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .addFilters(new InternalServiceTokenFilter("test-service-token"))
                .build();
    }

    @Test
    void createsNhiemVuWithActorAndReturnsVersionAsEtagWithoutChangingLegacyBody() throws Exception {
        NhiemVu entity = nhiemVu();
        when(nhiemVuService.create(any(), eq("alice"))).thenReturn(entity);

        mvc.perform(post("/api/nhiem-vu")
                        .header(HttpHeaders.AUTHORIZATION, AUTH)
                        .header("X-QTKHCN-Actor", "alice")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"ten":"Mission","cap":"TD","chuNhiemHoTen":"Alice",
                                 "donViChuTri":"VHT"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(header().string(HttpHeaders.ETAG, "\"0\""))
                .andExpect(jsonPath("$.*").value(org.hamcrest.Matchers.hasSize(8)))
                .andExpect(jsonPath("$.ma").value("RD.2026.006"));
    }

    @Test
    void updateRequiresIfMatchAndReturnsConflictForStaleVersion() throws Exception {
        when(nhiemVuService.update(eq("RD.2026.006"), eq(2L), any(), eq("alice")))
                .thenThrow(new VersionConflictException("NhiemVu", "RD.2026.006", 2, 3));

        mvc.perform(put("/api/nhiem-vu/RD.2026.006")
                        .header(HttpHeaders.AUTHORIZATION, AUTH)
                        .header("X-QTKHCN-Actor", "alice")
                        .header(HttpHeaders.IF_MATCH, "\"2\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"ten":"Mission","cap":"TD","chuNhiemHoTen":"Alice",
                                 "donViChuTri":"VHT","giaiDoan":"CHU_TRUONG"}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("expected 2")));
    }

    @Test
    void createsDraftAndSubmitNowReturnsAcceptedStartPending() throws Exception {
        HoSo entity = hoSo();
        HoSoResponse response = mock(HoSoResponse.class);
        when(hoSoService.create(any(), eq("alice"))).thenReturn(entity);
        when(queryService.findById("HS-2026-006")).thenReturn(new VersionedResponse<>(response, 0));

        mvc.perform(post("/api/ho-so")
                        .header(HttpHeaders.AUTHORIZATION, AUTH)
                        .header("X-QTKHCN-Actor", "alice")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"maNV":"RD.2026.006","loai":"CHU_TRUONG","nguoiKhoiTao":"alice"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(header().string(HttpHeaders.ETAG, "\"0\""));

        entity.setTrangThai(DossierStatus.START_PENDING);
        when(workflowSubmissionService.submit(eq("HS-2026-006"), any(), eq("alice"))).thenReturn(entity);
        mvc.perform(post("/api/ho-so/HS-2026-006/submit")
                        .header(HttpHeaders.AUTHORIZATION, AUTH)
                        .header("X-QTKHCN-Actor", "alice")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quyTrinh\":\"RD01.01\",\"quyTrinhTen\":\"RD01\"}"))
                .andExpect(status().isAccepted());
    }

    @Test
    void documentCrudUsesIndependentOptimisticVersion() throws Exception {
        TaiLieu document = document();
        when(hoSoService.addDocument(eq("HS-2026-006"), any(), eq("alice"))).thenReturn(document);
        when(hoSoService.updateDocument(eq("HS-2026-006"), eq(91L), eq(0L), any(), eq("alice")))
                .thenReturn(document);

        String body = "{\"ten\":\"document.pdf\",\"loai\":\"PDF\"}";
        mvc.perform(post("/api/ho-so/HS-2026-006/documents")
                        .header(HttpHeaders.AUTHORIZATION, AUTH).header("X-QTKHCN-Actor", "alice")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.id").value(91));
        mvc.perform(put("/api/ho-so/HS-2026-006/documents/91")
                        .header(HttpHeaders.AUTHORIZATION, AUTH).header("X-QTKHCN-Actor", "alice")
                        .header(HttpHeaders.IF_MATCH, "0")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andExpect(header().string(HttpHeaders.ETAG, "\"0\""));
        mvc.perform(delete("/api/ho-so/HS-2026-006/documents/91")
                        .header(HttpHeaders.AUTHORIZATION, AUTH).header("X-QTKHCN-Actor", "alice")
                        .header(HttpHeaders.IF_MATCH, "0"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deletesNhiemVuAndHoSoWithoutStatusOrVersionPrecondition() throws Exception {
        mvc.perform(delete("/api/nhiem-vu/RD.2026.006")
                        .header(HttpHeaders.AUTHORIZATION, AUTH)
                        .header("X-QTKHCN-Actor", "alice"))
                .andExpect(status().isNoContent());
        verify(nhiemVuService).delete("RD.2026.006", "alice");

        mvc.perform(delete("/api/ho-so/HS-2026-006")
                        .header(HttpHeaders.AUTHORIZATION, AUTH)
                        .header("X-QTKHCN-Actor", "alice"))
                .andExpect(status().isNoContent());
        verify(hoSoService).delete("HS-2026-006", "alice");
    }

    @Test
    void everyMutationRemainsFailClosedWithoutServiceToken() throws Exception {
        mvc.perform(post("/api/nhiem-vu").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
    }

    private static NhiemVu nhiemVu() {
        NhiemVu entity = new NhiemVu();
        ChuNhiem owner = new ChuNhiem();
        owner.setHoTen("Alice");
        entity.setMa("RD.2026.006");
        entity.setTen("Mission");
        entity.setCap(Cap.TD);
        entity.setChuNhiem(owner);
        entity.setDonViChuTri("VHT");
        entity.setGiaiDoan(GiaiDoan.CHU_TRUONG);
        return entity;
    }

    private static HoSo hoSo() {
        HoSo entity = new HoSo();
        entity.setId("HS-2026-006");
        entity.setMaNV("RD.2026.006");
        entity.setLoai(HoSoLoai.CHU_TRUONG);
        entity.setNguoiKhoiTao("alice");
        entity.setNgayTao(LocalDate.now());
        entity.setTrangThai(DossierStatus.DRAFT);
        return entity;
    }

    private static TaiLieu document() {
        TaiLieu document = new TaiLieu();
        document.setId(91L);
        document.setTen("document.pdf");
        document.setLoai("PDF");
        return document;
    }
}

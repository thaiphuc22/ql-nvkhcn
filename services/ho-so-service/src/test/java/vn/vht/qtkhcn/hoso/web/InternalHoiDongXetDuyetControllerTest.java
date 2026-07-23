package vn.vht.qtkhcn.hoso.web;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import vn.vht.qtkhcn.hoso.domain.HoiDongCap;
import vn.vht.qtkhcn.hoso.domain.ThanhVienHoiDong;
import vn.vht.qtkhcn.hoso.security.InternalServiceTokenFilter;
import vn.vht.qtkhcn.hoso.service.HoiDongXetDuyetService;

class InternalHoiDongXetDuyetControllerTest {
    private HoiDongXetDuyetService service;
    private MockMvc mvc;

    @BeforeEach void setUp() {
        service = mock(HoiDongXetDuyetService.class);
        mvc = MockMvcBuilders.standaloneSetup(new InternalHoiDongXetDuyetController(service))
                .setControllerAdvice(new GlobalExceptionHandler())
                .addFilters(new InternalServiceTokenFilter("test-token")).build();
    }

    @Test void generatesWithValidTokenAndRejectsWithoutIt() throws Exception {
        mvc.perform(post("/internal/v1/ho-so/HS-1/hoi-dong-xet-duyet")
                .header(HttpHeaders.AUTHORIZATION, "Bearer test-token")).andExpect(status().isOk());
        verify(service).sinhTuBuoc05("HS-1");

        mvc.perform(post("/internal/v1/ho-so/HS-1/hoi-dong-xet-duyet"))
                .andExpect(status().isUnauthorized());
    }

    @Test void generatesTapDoanCouncil() throws Exception {
        mvc.perform(post("/internal/v1/ho-so/HS-1/hoi-dong-xet-duyet/tap-doan")
                .header(HttpHeaders.AUTHORIZATION, "Bearer test-token")).andExpect(status().isOk());
        verify(service).sinhTuBuoc18B("HS-1");
    }

    @Test void listsTapDoanMembers() throws Exception {
        ThanhVienHoiDong member = new ThanhVienHoiDong();
        member.setHoTen("Nguyen Van A");
        member.setVaiTroTrongHoiDong("Chu tich");
        when(service.thanhVienTheoCap(eq("HS-1"), eq(HoiDongCap.TAP_DOAN))).thenReturn(List.of(member));

        mvc.perform(get("/internal/v1/ho-so/HS-1/hoi-dong-xet-duyet/tap-doan/thanh-vien")
                .header(HttpHeaders.AUTHORIZATION, "Bearer test-token")).andExpect(status().isOk());
    }
}

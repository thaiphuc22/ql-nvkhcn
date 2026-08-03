package vn.vht.qtkhcn.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import vn.vht.qtkhcn.domain.IntegrationJobRun;
import vn.vht.qtkhcn.domain.IntegrationSystem;
import vn.vht.qtkhcn.repository.IntegrationJobRunRepository;
import vn.vht.qtkhcn.repository.IntegrationSystemRepository;
import vn.vht.qtkhcn.web.dto.IntegrationSystemDtos.ConnectSystemRequest;

class IntegrationSystemServiceTest {
    private IntegrationSystemRepository systems;
    private IntegrationJobRunRepository jobRuns;
    private IntegrationSystemService service;

    @BeforeEach
    void setUp() {
        systems = mock(IntegrationSystemRepository.class);
        jobRuns = mock(IntegrationJobRunRepository.class);
        service = new IntegrationSystemService(systems, jobRuns);
    }

    private IntegrationSystem entity(String key, String trangThai, long version) {
        IntegrationSystem s = new IntegrationSystem();
        s.setKey(key);
        s.setTen("Hệ " + key);
        s.setMoTa("");
        s.setGiaoThuc("REST/JSON");
        s.setKieu("connector");
        s.setSyncMode("realtime");
        s.setTrangThai(trangThai);
        s.setLanDongBoCuoi("01/07/2026 00:00");
        s.setBanGhi24h(0);
        s.setLoi24h(0);
        s.setDoTreMs(0);
        s.setHangDoi(0);
        s.setEndpoint("https://example.vht.vn/api");
        s.setRef("REF-1");
        s.setVersion(version);
        s.setUpdatedBy("seed");
        s.setUpdatedAt(OffsetDateTime.now());
        s.setCreatedAt(OffsetDateTime.now());
        return s;
    }

    @Test
    void connectRejectsStaleVersion() {
        when(systems.findById("SAP")).thenReturn(Optional.of(entity("SAP", "down", 3)));

        assertThatThrownBy(() -> service.connect("SAP", new ConnectSystemRequest("vht_live_xxxxxxxx", "https://x"), 2, "alice"))
                .isInstanceOf(IntegrationConflictException.class)
                .hasMessageContaining("expected version 2");
    }

    @Test
    void connectHashesApiKeyAndSetsHealthy() {
        when(systems.findById("SAP")).thenReturn(Optional.of(entity("SAP", "down", 0)));
        when(systems.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.connect("SAP", new ConnectSystemRequest("vht_live_abcdWXYZ", "https://sap-gw.vht.vn/odata/v2"), 0, "alice");

        assertThat(response.trangThai()).isEqualTo("healthy");
        assertThat(response.apiKeyTail()).isEqualTo("WXYZ");
        assertThat(response.endpoint()).isEqualTo("https://sap-gw.vht.vn/odata/v2");
    }

    @Test
    void disconnectClearsApiKeyAndSetsDown() {
        IntegrationSystem entity = entity("SAP", "healthy", 1);
        entity.setApiKeyHash("hash");
        entity.setApiKeyTail("WXYZ");
        when(systems.findById("SAP")).thenReturn(Optional.of(entity));
        when(systems.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.disconnect("SAP", 1, "alice");

        assertThat(response.trangThai()).isEqualTo("down");
        assertThat(response.apiKeyTail()).isNull();
    }

    @Test
    void jobRunsUnknownSystemThrowsNotFound() {
        when(systems.findById("XX")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.jobRuns("XX")).isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void jobRunsReturnsSortedDescByRepository() {
        when(systems.findById("SAP")).thenReturn(Optional.of(entity("SAP", "down", 0)));
        IntegrationJobRun run = new IntegrationJobRun();
        run.setId("j-1");
        run.setJobType("sap:sync-budget");
        run.setHe("SAP");
        run.setMaHoSo("HS-2026-033");
        run.setThoiDiem("02/07/2026 14:06");
        run.setKetQua("failed");
        run.setRetries(0);
        run.setThongDiep("HTTP 504 timeout");
        when(jobRuns.findByHeOrderByThoiDiemDesc("SAP")).thenReturn(List.of(run));

        var result = service.jobRuns("SAP");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).ketQua()).isEqualTo("failed");
    }
}

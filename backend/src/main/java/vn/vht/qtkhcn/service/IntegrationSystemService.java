package vn.vht.qtkhcn.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.domain.IntegrationJobRun;
import vn.vht.qtkhcn.domain.IntegrationSystem;
import vn.vht.qtkhcn.repository.IntegrationJobRunRepository;
import vn.vht.qtkhcn.repository.IntegrationSystemRepository;
import vn.vht.qtkhcn.web.dto.IntegrationSystemDtos.ConnectSystemRequest;
import vn.vht.qtkhcn.web.dto.IntegrationSystemDtos.IntegrationSystemResponse;
import vn.vht.qtkhcn.web.dto.IntegrationSystemDtos.JobRunResponse;

/** Backend cho màn Tích hợp (`/tich-hop`) — đăng ký hệ tích hợp ngoài (Seam B) và job run
 * gần đây (đọc-chỉ). Port của webapp/src/pages/IntegrationStatus.tsx (handleConnect/
 * handleDisconnect) + webapp/src/data/camundaOps.ts (phần Seam B). */
@Service
public class IntegrationSystemService {
    private static final DateTimeFormatter STAMP_FORMAT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneOffset.of("+07:00"));

    private final IntegrationSystemRepository systems;
    private final IntegrationJobRunRepository jobRuns;

    public IntegrationSystemService(IntegrationSystemRepository systems, IntegrationJobRunRepository jobRuns) {
        this.systems = systems;
        this.jobRuns = jobRuns;
    }

    @Transactional(readOnly = true)
    public List<IntegrationSystemResponse> list() {
        return systems.findAllByOrderByKeyAsc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<JobRunResponse> jobRuns(String key) {
        find(key);
        return jobRuns.findByHeOrderByThoiDiemDesc(key).stream().map(this::toJobRunResponse).toList();
    }

    @Transactional
    public IntegrationSystemResponse connect(String key, ConnectSystemRequest request, long expectedVersion, String actor) {
        IntegrationSystem entity = find(key);
        assertVersion(key, expectedVersion, entity.getVersion());
        String apiKey = request.apiKey().trim();
        entity.setEndpoint(request.endpoint().trim());
        entity.setApiKeyHash(sha256(apiKey));
        entity.setApiKeyTail(tail(apiKey));
        entity.setTrangThai("healthy");
        entity.setLanDongBoCuoi(STAMP_FORMAT.format(OffsetDateTime.now()));
        touch(entity, actor);
        entity = systems.saveAndFlush(entity);
        return toResponse(entity);
    }

    @Transactional
    public IntegrationSystemResponse disconnect(String key, long expectedVersion, String actor) {
        IntegrationSystem entity = find(key);
        assertVersion(key, expectedVersion, entity.getVersion());
        entity.setTrangThai("down");
        entity.setApiKeyHash(null);
        entity.setApiKeyTail(null);
        touch(entity, actor);
        entity = systems.saveAndFlush(entity);
        return toResponse(entity);
    }

    private IntegrationSystem find(String key) {
        return systems.findById(key)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy hệ tích hợp: " + key));
    }

    private void assertVersion(String key, long expected, long actual) {
        if (expected != actual) {
            throw IntegrationConflictException.staleSystem(key, expected, actual);
        }
    }

    private void touch(IntegrationSystem entity, String actor) {
        entity.setUpdatedBy(actor == null || actor.isBlank() ? "system" : actor);
        entity.setUpdatedAt(OffsetDateTime.now());
    }

    private static String tail(String apiKey) {
        String upper = apiKey.toUpperCase();
        return upper.length() <= 4 ? upper : upper.substring(upper.length() - 4);
    }

    private static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Không thể tính hash API key.", e);
        }
    }

    private IntegrationSystemResponse toResponse(IntegrationSystem e) {
        return new IntegrationSystemResponse(e.getKey(), e.getTen(), e.getMoTa(), e.getGiaoThuc(), e.getKieu(),
                e.getSyncMode(), e.getTrangThai(), e.getLanDongBoCuoi(), e.getBanGhi24h(), e.getLoi24h(),
                e.getDoTreMs(), e.getHangDoi(), e.getEndpoint(), e.getApiKeyTail(), e.getRef(), e.getVersion());
    }

    private JobRunResponse toJobRunResponse(IntegrationJobRun j) {
        return new JobRunResponse(j.getId(), j.getJobType(), j.getHe(), j.getMaHoSo(), j.getThoiDiem(),
                j.getKetQua(), j.getRetries(), j.getThongDiep());
    }
}

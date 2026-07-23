package vn.vht.qtkhcn.security;

import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import vn.vht.qtkhcn.service.TaskActionException;

/** Temporary server-owned demo identities; replace only the source with OIDC/IAM claims. */
@Component
public class WorkflowDemoIdentityProvider {
    private static final Set<String> PROCESS_PERMISSIONS = Set.of("PROCESS_STEP");
    // ⚠️ Danh mục tài khoản demo này tồn tại ở BA nơi và phải giữ đồng bộ tay:
    //   1. frontend-angular/src/app/core/auth/demo-users.ts  (màn đăng nhập)
    //   2. services/ho-so-service/.../security/DemoIdentityProvider.java  (8093 — lọc /api/my-tasks)
    //   3. file này  (8090 — phân quyền thao tác task)
    // Thiếu ở (3) thì user vẫn THẤY việc nhưng bấm nút sẽ 403. Khi thay bằng OIDC/IAM thật (OQ-021)
    // thì gộp về một nguồn claim duy nhất và xoá cả ba bản sao này.
    private static final Map<String, WorkflowDemoIdentity> IDENTITIES = Map.ofEntries(
            Map.entry("admin@example.com", identity("admin@example.com", true)),
            Map.entry("pm@example.com", identity("pm@example.com", false, "PM", "PA", "NNC")),
            Map.entry("cqnv@example.com", identity("cqnv@example.com", false,
                    "CQ_KHCN", "CQ_MS", "CQ_NS", "CQ_TCKT", "CQ_QLKHCN", "TP_CLKHCN")),
            Map.entry("tgd@example.com", identity("tgd@example.com", false, "TGD_VHT", "BGD_TT", "BGD_KHOI", "PTGD_CT")),
            Map.entry("hdkhcn@example.com", identity("hdkhcn@example.com", false,
                    "HDKHCN", "HDXD", "HDXD_DC", "HDNT", "HD_DGHT")),
            Map.entry("gd-ttms@example.com", identity("gd-ttms@example.com", false, "GD_TTMS")),
            Map.entry("tp-ns@example.com", identity("tp-ns@example.com", false, "TP_NS")),
            Map.entry("tp-tckt@example.com", identity("tp-tckt@example.com", false, "TP_TCKT")),
            // Cấp Tập đoàn (RD02.02) — mỗi vai một tài khoản.
            Map.entry("cqkhcn-td@example.com", identity("cqkhcn-td@example.com", false, "CQ_KHCN_TD")),
            Map.entry("cqtckt-td@example.com", identity("cqtckt-td@example.com", false, "CQ_TCKT_TD")),
            Map.entry("cqdtxd-td@example.com", identity("cqdtxd-td@example.com", false, "CQ_DTXD_TD")),
            Map.entry("cqtcnl-td@example.com", identity("cqtcnl-td@example.com", false, "CQ_TCNL_TD")),
            Map.entry("hdxd-td@example.com", identity("hdxd-td@example.com", false, "HDXD_TD")),
            Map.entry("hdkhcn-td@example.com", identity("hdkhcn-td@example.com", false, "HDKHCN_TD")),
            Map.entry("btgd-td@example.com", identity("btgd-td@example.com", false, "BTGD_TD")));

    public WorkflowDemoIdentity resolve(String header) {
        if (header == null || header.isBlank()) {
            throw new TaskActionException("IDENTITY_REQUIRED", HttpStatus.BAD_REQUEST,
                    "X-QTKHCN-User-Id is required.");
        }
        String normalized = header.trim().toLowerCase(Locale.ROOT);
        if (normalized.length() > 128) {
            throw new TaskActionException("IDENTITY_INVALID", HttpStatus.BAD_REQUEST,
                    "X-QTKHCN-User-Id must not exceed 128 characters.");
        }
        WorkflowDemoIdentity identity = IDENTITIES.get(normalized);
        if (identity == null) {
            throw new TaskActionException("IDENTITY_FORBIDDEN", HttpStatus.FORBIDDEN,
                    "Demo identity is not allowed.");
        }
        return identity;
    }

    private static WorkflowDemoIdentity identity(String userId, boolean admin, String... roles) {
        return new WorkflowDemoIdentity(userId, Set.of(roles), PROCESS_PERMISSIONS, admin);
    }
}

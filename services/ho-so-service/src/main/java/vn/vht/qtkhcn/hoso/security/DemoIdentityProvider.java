package vn.vht.qtkhcn.hoso.security;

import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Component;

/**
 * Temporary backend identity/role mapping for the five accounts exposed by the Angular demo.
 * Replace this catalog with claims/groups supplied by the chosen OIDC/IAM provider.
 */
@Component
public class DemoIdentityProvider {

    private static final Map<String, DemoIdentity> IDENTITIES = Map.ofEntries(
            Map.entry("admin@example.com", identity("admin@example.com", true)),
            Map.entry("pm@example.com", identity("pm@example.com", false, "PM", "PA", "NNC")),
            Map.entry("cqnv@example.com", identity("cqnv@example.com", false,
                    "CQ_KHCN", "CQ_MS", "CQ_NS", "CQ_TCKT", "CQ_QLKHCN", "TP_CLKHCN")),
            Map.entry("tgd@example.com", identity("tgd@example.com", false,
                    "TGD_VHT", "BGD_TT", "BGD_KHOI", "PTGD_CT")),
            Map.entry("hdkhcn@example.com", identity("hdkhcn@example.com", false,
                    "HDKHCN", "HDXD", "HDXD_DC", "HDNT", "HD_DGHT")),
            Map.entry("gd-ttms@example.com", identity("gd-ttms@example.com", false, "GD_TTMS")),
            Map.entry("tp-ns@example.com", identity("tp-ns@example.com", false, "TP_NS")),
            Map.entry("tp-tckt@example.com", identity("tp-tckt@example.com", false, "TP_TCKT")),
            // Bốn vai trò cấp Tập đoàn cho RD02.02 — MỖI VAI MỘT TÀI KHOẢN, cố ý không gộp: luồng
            // xét duyệt cấp TĐ đi qua 4 cấp thẩm quyền khác nhau, gộp lại thì không chứng minh được
            // phân tách quyền. Phải giữ đồng bộ với frontend-angular/src/app/core/auth/demo-users.ts.
            Map.entry("cqkhcn-td@example.com", identity("cqkhcn-td@example.com", false, "CQ_KHCN_TD")),
            Map.entry("cqtckt-td@example.com", identity("cqtckt-td@example.com", false, "CQ_TCKT_TD")),
            Map.entry("cqdtxd-td@example.com", identity("cqdtxd-td@example.com", false, "CQ_DTXD_TD")),
            Map.entry("cqtcnl-td@example.com", identity("cqtcnl-td@example.com", false, "CQ_TCNL_TD")),
            Map.entry("hdxd-td@example.com", identity("hdxd-td@example.com", false, "HDXD_TD")),
            Map.entry("hdkhcn-td@example.com", identity("hdkhcn-td@example.com", false, "HDKHCN_TD")),
            Map.entry("btgd-td@example.com", identity("btgd-td@example.com", false, "BTGD_TD")));

    public DemoIdentity resolve(String userIdHeader) {
        if (userIdHeader == null || userIdHeader.isBlank()) {
            throw new IllegalArgumentException("X-QTKHCN-User-Id is required.");
        }
        String normalized = userIdHeader.trim().toLowerCase(Locale.ROOT);
        if (normalized.length() > 128) {
            throw new IllegalArgumentException("X-QTKHCN-User-Id must not exceed 128 characters.");
        }
        DemoIdentity identity = IDENTITIES.get(normalized);
        if (identity == null) {
            throw new UnknownDemoIdentityException("Demo identity is not allowed.");
        }
        return identity;
    }

    private static DemoIdentity identity(String userId, boolean administrator, String... roleCodes) {
        return new DemoIdentity(userId, Set.of(roleCodes), administrator);
    }
}

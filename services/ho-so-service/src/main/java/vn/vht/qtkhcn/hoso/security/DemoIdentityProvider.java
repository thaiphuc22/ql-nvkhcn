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

    private static final Map<String, DemoIdentity> IDENTITIES = Map.of(
            "admin@example.com", identity("admin@example.com", true),
            "pm@example.com", identity("pm@example.com", false, "PM", "PA", "NNC"),
            "cqnv@example.com", identity("cqnv@example.com", false,
                    "CQ_KHCN", "CQ_MS", "CQ_NS", "CQ_TCKT", "CQ_QLKHCN", "TP_CLKHCN"),
            "tgd@example.com", identity("tgd@example.com", false,
                    "TGD_VHT", "BGD_TT", "BGD_KHOI"),
            "hdkhcn@example.com", identity("hdkhcn@example.com", false,
                    "HDKHCN", "HDXD", "HDXD_DC", "HDNT", "HD_DGHT"));

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

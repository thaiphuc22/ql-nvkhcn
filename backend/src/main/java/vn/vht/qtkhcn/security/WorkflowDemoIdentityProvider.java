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
    private static final Map<String, WorkflowDemoIdentity> IDENTITIES = Map.of(
            "admin@example.com", identity("admin@example.com", true),
            "pm@example.com", identity("pm@example.com", false, "PM", "PA", "NNC"),
            "cqnv@example.com", identity("cqnv@example.com", false,
                    "CQ_KHCN", "CQ_MS", "CQ_NS", "CQ_TCKT", "CQ_QLKHCN", "TP_CLKHCN"),
            "tgd@example.com", identity("tgd@example.com", false, "TGD_VHT", "BGD_TT", "BGD_KHOI"),
            "hdkhcn@example.com", identity("hdkhcn@example.com", false,
                    "HDKHCN", "HDXD", "HDXD_DC", "HDNT", "HD_DGHT"));

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

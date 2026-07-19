package vn.vht.qtkhcn.hoso.security;

import java.util.Set;

/**
 * Server-owned identity used by the demo RBAC seam. The role set is never populated
 * from request headers; it comes exclusively from {@link DemoIdentityProvider}.
 */
public record DemoIdentity(String userId, Set<String> roleCodes, boolean administrator) {

    public DemoIdentity {
        roleCodes = Set.copyOf(roleCodes);
    }
}

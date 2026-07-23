package vn.vht.qtkhcn.security;

import java.util.Set;

public record WorkflowDemoIdentity(String userId, Set<String> roleCodes, Set<String> permissions,
        boolean administrator) {
    public WorkflowDemoIdentity {
        roleCodes = Set.copyOf(roleCodes);
        permissions = Set.copyOf(permissions);
    }
}

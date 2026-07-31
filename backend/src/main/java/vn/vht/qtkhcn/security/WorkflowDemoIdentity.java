package vn.vht.qtkhcn.security;

import java.util.Map;
import java.util.Set;

public record WorkflowDemoIdentity(String userId, Set<String> roleCodes, Set<String> permissions,
        Set<String> apps, Map<String, Set<String>> featurePermissions, boolean administrator) {
    public WorkflowDemoIdentity {
        roleCodes = Set.copyOf(roleCodes);
        permissions = Set.copyOf(permissions);
        apps = Set.copyOf(apps);
        featurePermissions = featurePermissions.entrySet().stream().collect(java.util.stream.Collectors.toUnmodifiableMap(
                Map.Entry::getKey, entry -> Set.copyOf(entry.getValue())));
    }

    public boolean hasFeaturePermission(String featureCode, String permissionCode) {
        return featurePermissions.getOrDefault(featureCode, Set.of()).contains(permissionCode);
    }
}

package vn.vht.qtkhcn.identity.domain;
import java.io.Serializable; import java.util.UUID;
public record RoleFeaturePermissionId(UUID role,UUID feature,UUID permission) implements Serializable {}

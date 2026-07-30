package vn.vht.qtkhcn.identity.web.dto;
import jakarta.validation.constraints.*; import java.time.*; import java.util.*;
public final class IdentityDtos { private IdentityDtos(){}
 public record OrganizationRequest(@NotBlank @Size(max=64) String code,@NotBlank String name,UUID parentId,Boolean active){}
 public record OrganizationResponse(UUID id,String code,String name,UUID parentId,boolean active){}
 public record PermissionRequest(@NotBlank @Size(max=64) String code,@NotBlank String name,String description,Boolean active){}
 public record PermissionResponse(UUID id,String code,String name,String description,boolean active){}
 public record FeatureResponse(UUID id,String code,String name,String group,String description,boolean active,boolean legacy){}
 public record MatrixEntryRequest(@NotBlank String featureCode,Set<String> permissionCodes,Boolean enabled){}
 public record MatrixEntryResponse(String featureCode,Set<String> permissionCodes,boolean enabled){}
 public record RoleRequest(@NotBlank @Size(max=64) String code,@NotBlank String name,@NotBlank String kind,Boolean active,Set<String> permissionCodes,List<MatrixEntryRequest> matrix){}
 public record RoleResponse(UUID id,String code,String name,String kind,boolean active,Set<String> permissionCodes,List<MatrixEntryResponse> matrix){}
 public record UserRequest(@Email @NotBlank String email,String employeeCode,@NotBlank String fullName,String jobTitle,UUID organizationId,String status,Boolean administrator){}
 public record UserResponse(UUID id,String email,String employeeCode,String fullName,String jobTitle,UUID organizationId,String status,boolean administrator){}
 public record AssignmentRequest(@NotBlank String roleCode,@NotBlank String dataScope,UUID organizationId,LocalDate effectiveFrom,LocalDate effectiveTo){}
 public record AssignmentResponse(UUID id,UUID userId,String roleCode,String dataScope,UUID organizationId,LocalDate effectiveFrom,LocalDate effectiveTo){}
 public record DataScopeResponse(String code,String name,String description,int rank,boolean active){}
 public record AppResponse(String code,String name,String description,boolean active){}
 public record UserAppsRequest(@NotNull Set<String> appCodes){}
 public record UserAppsResponse(UUID userId,Set<String> appCodes){}
 public record EffectiveAssignmentResponse(String roleCode,String dataScope,UUID organizationId,LocalDate effectiveFrom,LocalDate effectiveTo){}
 public record EffectivePermissionsResponse(UUID id,String userId,String email,String fullName,UUID organizationId,Set<String> roleCodes,Set<String> permissions,List<MatrixEntryResponse> featurePermissions,List<EffectiveAssignmentResponse> assignments,Set<String> apps,boolean administrator){}
 public record AuditLogResponse(UUID id,String eventType,String actorId,String entityType,String entityId,String details,Instant occurredAt){}
}

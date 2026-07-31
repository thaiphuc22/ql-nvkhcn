package vn.vht.qtkhcn.identity.service;

import static vn.vht.qtkhcn.identity.web.dto.IdentityDtos.*;

import jakarta.persistence.EntityNotFoundException;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.vht.qtkhcn.identity.domain.*;
import vn.vht.qtkhcn.identity.repository.*;

@Service @Transactional
public class IdentityService {
 private final OrganizationRepository orgs; private final RoleRepository roles; private final PermissionRepository permissions;
 private final FeatureRepository features; private final RoleFeaturePermissionRepository matrix; private final UserRepository users;
 private final UserRoleAssignmentRepository assignments; private final DataScopeTypeRepository scopes; private final AppDefinitionRepository apps;
 private final UserAppRepository userApps; private final AuditLogRepository audits;

 public IdentityService(OrganizationRepository o,RoleRepository r,PermissionRepository p,FeatureRepository f,RoleFeaturePermissionRepository m,
   UserRepository u,UserRoleAssignmentRepository a,DataScopeTypeRepository s,AppDefinitionRepository apps,UserAppRepository ua,AuditLogRepository l){
  orgs=o;roles=r;permissions=p;features=f;matrix=m;users=u;assignments=a;scopes=s;this.apps=apps;userApps=ua;audits=l;
 }

 @Transactional(readOnly=true) public List<OrganizationResponse> organizations(){return orgs.findAll().stream().map(this::org).toList();}
 public OrganizationResponse createOrganization(OrganizationRequest x){if(orgs.existsByCodeIgnoreCase(x.code()))throw new IllegalArgumentException("Organization code already exists.");Organization parent=x.parentId()==null?null:org(x.parentId());Organization e=orgs.save(new Organization(norm(x.code()),x.name().trim(),parent));audit("ORGANIZATION_CREATED","ORGANIZATION",e.id,e.code);return org(e);}
 public OrganizationResponse updateOrganization(UUID id,OrganizationRequest x){Organization e=org(id);e.code=norm(x.code());e.name=x.name().trim();e.parent=x.parentId()==null?null:org(x.parentId());if(x.active()!=null)e.active=x.active();e.updatedAt=Instant.now();return org(e);}
 public void deleteOrganization(UUID id){Organization e=org(id);orgs.delete(e);audit("ORGANIZATION_DELETED","ORGANIZATION",id,e.code);}

 @Transactional(readOnly=true) public List<PermissionResponse> permissions(){return permissions.findAll().stream().filter(p->p.active).map(this::permission).toList();}
 public PermissionResponse createPermission(PermissionRequest x){if(permissions.existsByCodeIgnoreCase(x.code()))throw new IllegalArgumentException("Permission code already exists.");return permission(permissions.save(new Permission(norm(x.code()),x.name().trim(),x.description())));}
 public PermissionResponse updatePermission(UUID id,PermissionRequest x){Permission e=permission(id);e.code=norm(x.code());e.name=x.name().trim();e.description=x.description();if(x.active()!=null)e.active=x.active();return permission(e);}
 public void deletePermission(UUID id){permissions.delete(permission(id));}
 @Transactional(readOnly=true) public List<FeatureResponse> features(){return features.findAll().stream().sorted(Comparator.comparing(f->f.code)).map(this::feature).toList();}

 /**
  * Thứ tự ỔN ĐỊNH: vai trò hệ thống trước, rồi theo mã. `findAll()` không có ORDER BY nên trả
  * theo thứ tự vật lý của heap Postgres — mỗi lần UPDATE một dòng (sửa vai trò, lưu ma trận) là
  * dòng đó nhảy xuống cuối, khiến bảng/ma trận trên UI tự xáo trộn ngay sau khi người dùng bấm Lưu.
  */
 @Transactional(readOnly=true) public List<RoleResponse> roles(){
  return roles.findAll().stream()
    .sorted(Comparator.comparing((Role r)->"SYSTEM".equals(r.kind)?0:1).thenComparing(r->r.code))
    .map(this::role).toList();
 }
 public RoleResponse createRole(RoleRequest x){if(roles.existsByCodeIgnoreCase(x.code()))throw new IllegalArgumentException("Role code already exists.");String appCode=activeAppCode(x.appCode());Role e=roles.save(new Role(norm(x.code()),x.name().trim(),norm(x.kind()),appCode));setMatrix(e,x);audit("ROLE_CREATED","ROLE",e.id,e.code);return role(e);}
 public RoleResponse updateRole(UUID id,RoleRequest x){Role e=role(id);e.code=norm(x.code());e.name=x.name().trim();e.kind=norm(x.kind());e.appCode=activeAppCode(x.appCode());if(x.active()!=null)e.active=x.active();e.updatedAt=Instant.now();setMatrix(e,x);audit("ROLE_MATRIX_UPDATED","ROLE",e.id,e.code);return role(e);}
 public void deleteRole(UUID id){roles.delete(role(id));}

 @Transactional(readOnly=true) public List<UserResponse> users(){return users.findAll().stream().map(this::user).toList();}
 public UserResponse createUser(UserRequest x){if(users.existsByEmailIgnoreCase(x.email()))throw new IllegalArgumentException("Email already exists.");User e=users.save(new User(x.email().trim().toLowerCase(Locale.ROOT),x.employeeCode(),x.fullName().trim(),x.jobTitle(),x.organizationId()==null?null:org(x.organizationId()),status(x.status()),Boolean.TRUE.equals(x.administrator())));audit("USER_CREATED","USER",e.id,e.email);return user(e);}
 public UserResponse updateUser(UUID id,UserRequest x){User e=user(id);e.email=x.email().trim().toLowerCase(Locale.ROOT);e.employeeCode=x.employeeCode();e.fullName=x.fullName().trim();e.jobTitle=x.jobTitle();e.organization=x.organizationId()==null?null:org(x.organizationId());e.status=status(x.status());if(x.administrator()!=null)e.administrator=x.administrator();e.updatedAt=Instant.now();return user(e);}
 public void deleteUser(UUID id){User e=user(id);users.delete(e);audit("USER_DELETED","USER",id,e.email);}

 @Transactional(readOnly=true) public List<DataScopeResponse> dataScopes(){return scopes.findAll().stream().sorted(Comparator.comparingInt(s->s.rank)).map(s->new DataScopeResponse(s.code,s.name,s.description,s.rank,s.active)).toList();}
 @Transactional(readOnly=true) public List<AssignmentResponse> assignments(UUID userId){user(userId);return assignments.findByUserId(userId).stream().map(this::assignment).toList();}
 public AssignmentResponse assign(UUID userId,AssignmentRequest x){if(x.effectiveFrom()!=null&&x.effectiveTo()!=null&&x.effectiveTo().isBefore(x.effectiveFrom()))throw new IllegalArgumentException("effectiveTo must not precede effectiveFrom.");String scope=norm(x.dataScope());DataScopeType scopeType=scopes.findById(scope).filter(s->s.active).orElseThrow(()->new IllegalArgumentException("Unsupported data scope: "+x.dataScope()));User u=user(userId);Role r=roles.findByCodeIgnoreCase(x.roleCode()).orElseThrow(()->new EntityNotFoundException("Role not found: "+x.roleCode()));Organization o=x.organizationId()==null?null:org(x.organizationId());UserRoleAssignment a=assignments.save(new UserRoleAssignment(u,r,scopeType.code,o,x.effectiveFrom(),x.effectiveTo()));audit("ROLE_ASSIGNED","USER_ROLE_ASSIGNMENT",a.id,"user="+userId+",role="+r.getCode());return assignment(a);}
 public void revoke(UUID userId,UUID assignmentId){UserRoleAssignment a=assignments.findByIdAndUserId(assignmentId,userId).orElseThrow(()->new EntityNotFoundException("Assignment not found."));String role=a.role.getCode();assignments.delete(a);audit("ROLE_REVOKED","USER_ROLE_ASSIGNMENT",assignmentId,"user="+userId+",role="+role);}

 /** Toàn bộ assignment của mọi user (1 query) — nguồn cho cột "Vai trò" ở bảng danh sách người dùng. */
 @Transactional(readOnly=true) public List<AssignmentResponse> allAssignments(){return assignments.findAllDetailed().stream().map(this::assignment).toList();}

 /**
  * Gán N vai trò cùng lúc với cùng phạm vi/đơn vị/hiệu lực. Validate scope + đơn vị + khoảng
  * hiệu lực ĐÚNG MỘT LẦN cho cả lô (khác {@link #assign} làm từng lượt), và **idempotent**:
  * vai trò đã có assignment y hệt `(role, scope, đơn vị, from, to)` thì bỏ qua thay vì sinh
  * dòng trùng — `assign()` hiện cho phép trùng vô hạn nên bấm 2 lần là nhân đôi dữ liệu.
  * Trả về CHỈ các assignment vừa tạo (rỗng = không có gì mới).
  */
 public List<AssignmentResponse> assignBulk(UUID userId,BulkAssignmentRequest x){
  if(x.effectiveFrom()!=null&&x.effectiveTo()!=null&&x.effectiveTo().isBefore(x.effectiveFrom()))throw new IllegalArgumentException("effectiveTo must not precede effectiveFrom.");
  String scope=norm(x.dataScope());
  DataScopeType scopeType=scopes.findById(scope).filter(s->s.active).orElseThrow(()->new IllegalArgumentException("Unsupported data scope: "+x.dataScope()));
  User u=user(userId);
  Organization o=x.organizationId()==null?null:org(x.organizationId());
  Set<String> requested=x.roleCodes().stream().map(IdentityService::norm).collect(Collectors.toCollection(TreeSet::new));
  List<Role> roleList=new ArrayList<>();
  for(String code:requested)roleList.add(roles.findByCodeIgnoreCase(code).orElseThrow(()->new EntityNotFoundException("Role not found: "+code)));
  List<UserRoleAssignment> existing=assignments.findByUserId(userId);
  List<AssignmentResponse> created=new ArrayList<>();
  for(Role r:roleList){
   boolean duplicate=existing.stream().anyMatch(a->a.role.getId().equals(r.getId())&&a.dataScope.equals(scopeType.code)
     &&Objects.equals(a.organization==null?null:a.organization.getId(),o==null?null:o.getId())
     &&Objects.equals(a.effectiveFrom,x.effectiveFrom())&&Objects.equals(a.effectiveTo,x.effectiveTo()));
   if(duplicate)continue;
   UserRoleAssignment a=assignments.save(new UserRoleAssignment(u,r,scopeType.code,o,x.effectiveFrom(),x.effectiveTo()));
   audit("ROLE_ASSIGNED","USER_ROLE_ASSIGNMENT",a.id,"user="+userId+",role="+r.getCode());
   created.add(assignment(a));
  }
  return created;
 }

 /**
  * Lưu một CỘT chức năng của ma trận Role×Permission: với mỗi vai trò trong payload, thay tập
  * quyền của đúng cặp `(role, feature)` này. Vai trò không có trong payload và 11 chức năng còn
  * lại KHÔNG bị đụng tới — lý do phải có method riêng thay vì tái dùng {@link #updateRole}:
  * `setMatrix()` xoá theo `deleteByRoleId` (cả mọi feature) rồi ghi lại từ payload, nên lưu
  * ma trận theo từng chức năng qua đường ấy sẽ xoá sạch các chức năng khác.
  */
 public List<RoleResponse> replaceFeatureMatrix(String featureCode,List<RoleMatrixCellRequest> cells){
  Feature f=feature(featureCode);
  List<RoleResponse> out=new ArrayList<>();
  for(RoleMatrixCellRequest cell:cells){
   Role r=roles.findByCodeIgnoreCase(cell.roleCode()).orElseThrow(()->new EntityNotFoundException("Role not found: "+cell.roleCode()));
   if(!r.appCode.equals(f.appCode))throw new IllegalArgumentException("Role "+r.code+" does not belong to app "+f.appCode+".");
   matrix.deleteByRoleIdAndFeatureId(r.getId(),f.getId());
   matrix.flush();
   boolean enabled=!Boolean.FALSE.equals(cell.enabled());
   Set<String> codes=nullable(cell.permissionCodes()).stream().map(IdentityService::norm).collect(Collectors.toCollection(TreeSet::new));
   for(String code:codes)matrix.save(new RoleFeaturePermission(r,f,permission(code),enabled));
   r.updatedAt=Instant.now();
   audit("ROLE_MATRIX_UPDATED","ROLE",r.getId(),"role="+r.getCode()+",feature="+f.code+",permissions="+codes);
   out.add(role(r));
  }
  return out;
 }

 @Transactional(readOnly=true) public List<AppResponse> apps(){return apps.findAll().stream().sorted(Comparator.comparing(a->a.code)).map(a->new AppResponse(a.code,a.name,a.description,a.active)).toList();}
 @Transactional(readOnly=true) public UserAppsResponse userApps(UUID userId){user(userId);return new UserAppsResponse(userId,appCodes(userId));}
 public UserAppsResponse replaceUserApps(UUID userId,Set<String> requested){User u=user(userId);Set<String> codes=requested.stream().map(IdentityService::appCode).collect(Collectors.toCollection(TreeSet::new));Map<String,AppDefinition> catalog=apps.findAllById(codes).stream().filter(a->a.active).collect(Collectors.toMap(a->a.code,a->a));if(catalog.size()!=codes.size()){Set<String> invalid=new TreeSet<>(codes);invalid.removeAll(catalog.keySet());throw new IllegalArgumentException("Unsupported app code(s): "+invalid);}Set<String> before=appCodes(userId);userApps.deleteByUserId(userId);userApps.flush();codes.forEach(c->userApps.save(new UserApp(u,catalog.get(c))));Set<String> added=new TreeSet<>(codes);added.removeAll(before);Set<String> removed=new TreeSet<>(before);removed.removeAll(codes);added.forEach(c->audit("APP_GRANTED","USER_APP",userId,"app="+c));removed.forEach(c->audit("APP_REVOKED","USER_APP",userId,"app="+c));return new UserAppsResponse(userId,codes);}

 @Transactional(readOnly=true) public List<AuditLogResponse> auditLog(){return audits.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC,"occurredAt")).stream().map(a->new AuditLogResponse(a.id,a.eventType,a.actorId,a.entityType,a.entityId,a.details,a.occurredAt)).toList();}
 @Transactional(readOnly=true) public EffectivePermissionsResponse effective(String identity){User u=parseUser(identity);List<UserRoleAssignment> active=assignments.findEffective(u.id,LocalDate.now());Set<String> rc=active.stream().map(a->a.role.code).collect(Collectors.toCollection(TreeSet::new));List<RoleFeaturePermission> grants=active.stream().flatMap(a->matrix.findDetailedByRoleId(a.role.id).stream()).filter(g->g.enabled&&g.feature.active&&g.permission.active).toList();Set<String> pc=grants.stream().map(g->g.permission.code).collect(Collectors.toCollection(TreeSet::new));List<MatrixEntryResponse> fp=toMatrix(grants);List<EffectiveAssignmentResponse> ea=active.stream().map(a->new EffectiveAssignmentResponse(a.role.code,a.dataScope,a.organization==null?null:a.organization.id,a.effectiveFrom,a.effectiveTo)).toList();return new EffectivePermissionsResponse(u.id,u.email,u.email,u.fullName,u.organization==null?null:u.organization.id,rc,pc,fp,ea,appCodes(u.id),u.administrator);}

 private void setMatrix(Role role,RoleRequest request){if(request.matrix()==null&&request.permissionCodes()==null)return;matrix.deleteByRoleId(role.id);matrix.flush();if(request.matrix()!=null){for(MatrixEntryRequest entry:request.matrix()){Feature f=feature(entry.featureCode());if(!role.appCode.equals(f.appCode))throw new IllegalArgumentException("Feature "+f.code+" does not belong to role app "+role.appCode+".");boolean enabled=!Boolean.FALSE.equals(entry.enabled());for(String code:nullable(entry.permissionCodes()))matrix.save(new RoleFeaturePermission(role,f,permission(code),enabled));}}else{Feature general=feature("GENERAL");if(!role.appCode.equals(general.appCode))throw new IllegalArgumentException("Legacy flat permissions are only supported for app "+general.appCode+".");for(String code:nullable(request.permissionCodes()))matrix.save(new RoleFeaturePermission(role,general,permission(code),true));}}
 private RoleResponse role(Role e){List<RoleFeaturePermission> grants=matrix.findDetailedByRoleId(e.id).stream().filter(g->g.permission.active).toList();Set<String> flat=grants.stream().filter(g->g.enabled).map(g->g.permission.code).collect(Collectors.toCollection(TreeSet::new));return new RoleResponse(e.id,e.code,e.name,e.kind,e.appCode,e.active,flat,toMatrix(grants));}
 private List<MatrixEntryResponse> toMatrix(Collection<RoleFeaturePermission> grants){Map<String,List<RoleFeaturePermission>> grouped=grants.stream().collect(Collectors.groupingBy(g->g.feature.code,TreeMap::new,Collectors.toList()));List<MatrixEntryResponse> out=new ArrayList<>();grouped.forEach((feature,items)->{Map<Boolean,Set<String>> byEnabled=items.stream().collect(Collectors.groupingBy(g->g.enabled,Collectors.mapping(g->g.permission.code,Collectors.toCollection(TreeSet::new))));byEnabled.forEach((enabled,codes)->out.add(new MatrixEntryResponse(feature,codes,enabled)));});return out;}
 private Set<String> appCodes(UUID userId){return userApps.findByUserId(userId).stream().filter(x->x.app.active).map(x->x.app.code).collect(Collectors.toCollection(TreeSet::new));}
 private String activeAppCode(String code){String normalized=appCode(code);return apps.findById(normalized).filter(a->a.active).map(a->a.code).orElseThrow(()->new IllegalArgumentException("Unsupported app code: "+code));}
 private User parseUser(String identity){try{return users.findById(UUID.fromString(identity)).orElseThrow();}catch(IllegalArgumentException|NoSuchElementException ignored){return users.findByEmailIgnoreCase(identity).orElseThrow(()->new EntityNotFoundException("Active user not found."));}}
 private Organization org(UUID id){return orgs.findById(id).orElseThrow(()->new EntityNotFoundException("Organization not found."));} private Role role(UUID id){return roles.findById(id).orElseThrow(()->new EntityNotFoundException("Role not found."));} private Permission permission(UUID id){return permissions.findById(id).orElseThrow(()->new EntityNotFoundException("Permission not found."));} private Permission permission(String code){return permissions.findByCodeIgnoreCase(code).orElseThrow(()->new EntityNotFoundException("Permission not found: "+code));} private Feature feature(String code){return features.findByCodeIgnoreCase(code).filter(f->f.active).orElseThrow(()->new EntityNotFoundException("Feature not found: "+code));} private User user(UUID id){return users.findById(id).orElseThrow(()->new EntityNotFoundException("User not found."));}
 private OrganizationResponse org(Organization e){return new OrganizationResponse(e.id,e.code,e.name,e.parent==null?null:e.parent.id,e.active);} private PermissionResponse permission(Permission e){return new PermissionResponse(e.id,e.code,e.name,e.description,e.active);} private FeatureResponse feature(Feature e){return new FeatureResponse(e.id,e.code,e.name,e.group,e.appCode,e.description,e.active,e.legacy);} private UserResponse user(User e){return new UserResponse(e.id,e.email,e.employeeCode,e.fullName,e.jobTitle,e.organization==null?null:e.organization.id,e.status,e.administrator);} // getCode()/getId() chứ KHÔNG phải `.code`/`.id`: getter khởi tạo proxy lazy, field access thì
 // không và trả null. Lớp phòng thủ thứ hai cạnh join fetch ở UserRoleAssignmentRepository.
 private AssignmentResponse assignment(UserRoleAssignment a){return new AssignmentResponse(a.id,a.user.getId(),a.role.getCode(),a.dataScope,a.organization==null?null:a.organization.getId(),a.effectiveFrom,a.effectiveTo);}
 private static <T> Set<T> nullable(Set<T> value){return value==null?Set.of():value;} private static String norm(String x){return x.trim().toUpperCase(Locale.ROOT);} private static String appCode(String x){return x.trim().toLowerCase(Locale.ROOT);} private static String status(String x){return x==null||x.isBlank()?"ACTIVE":norm(x);}
 private void audit(String event,String type,UUID id,String details){audits.save(new AuditLog(event,type,id.toString(),details));}
}

package vn.vht.qtkhcn.identity;
import static org.junit.jupiter.api.Assertions.*; import static vn.vht.qtkhcn.identity.web.dto.IdentityDtos.*; import jakarta.persistence.EntityNotFoundException; import java.time.LocalDate; import java.util.*; import org.junit.jupiter.api.*; import org.springframework.beans.factory.annotation.Autowired; import org.springframework.boot.test.context.SpringBootTest; import org.springframework.boot.testcontainers.service.connection.ServiceConnection; import org.testcontainers.junit.jupiter.Container; import org.testcontainers.junit.jupiter.Testcontainers; import org.testcontainers.postgresql.PostgreSQLContainer; import vn.vht.qtkhcn.identity.service.IdentityService;
@Testcontainers @SpringBootTest(properties="qtkhcn.internal.service-token=test-token")
class IdentityServiceIntegrationTest { @Container @ServiceConnection static PostgreSQLContainer db=new PostgreSQLContainer("postgres:16-alpine"); @Autowired IdentityService service;
 // Từ V6, catalog quyền hoạt động chỉ còn 4 mục (VIEW_LIST/VIEW_DETAIL/CREATE/EDIT) cho lưới
 // card "Ma trận phân quyền" — PROCESS_STEP (và mọi mã khác) vẫn còn trong DB (audit/FK) nhưng
 // bị ẩn khỏi permissions()/featurePermissions() vì đã deactivate, nên assert đổi sang CREATE.
 @Test void migrationSeedsCatalogAndPreservesLegacyPermissions(){assertEquals(4,service.permissions().size());assertEquals(13,service.features().size());assertEquals(Set.of("qlnvkhcn","quytrinh","he-thong"),service.features().stream().map(FeatureResponse::appCode).collect(java.util.stream.Collectors.toSet()));assertEquals(4,service.dataScopes().size());assertTrue(service.roles().size()>=30);EffectivePermissionsResponse e=service.effective("pm@example.com");assertEquals(Set.of("NNC","PA","PM"),e.roleCodes());assertTrue(e.permissions().contains("CREATE"));assertTrue(e.featurePermissions().stream().anyMatch(x->x.featureCode().equals("DOSSIER")&&x.permissionCodes().contains("CREATE")));assertEquals(3,e.assignments().size());assertTrue(e.apps().contains("qlnvkhcn"));}
 @Test void createsUserAssignmentAndRejectsFreeTextScope(){var u=service.createUser(new UserRequest("new.user@example.com","NV001","Người dùng mới","Kỹ sư",null,"ACTIVE",false));var a=service.assign(u.id(),new AssignmentRequest("PM","OWN_MISSION",null,null,null));assertEquals("PM",a.roleCode());assertEquals(Set.of("PM"),service.effective(u.id().toString()).roleCodes());assertThrows(IllegalArgumentException.class,()->service.assign(u.id(),new AssignmentRequest("PM","ARBITRARY",null,null,null)));service.revoke(u.id(),a.id());service.deleteUser(u.id());assertTrue(service.auditLog().stream().anyMatch(x->x.eventType().equals("ROLE_REVOKED")));}
 @Test void replacesUserAppsAndAuditsDelta(){var user=service.users().stream().filter(x->x.email().equals("pm@example.com")).findFirst().orElseThrow();var result=service.replaceUserApps(user.id(),Set.of("qlnvkhcn","quytrinh"));assertEquals(Set.of("qlnvkhcn","quytrinh"),result.appCodes());assertEquals(result.appCodes(),service.effective(user.id().toString()).apps());assertTrue(service.auditLog().stream().anyMatch(x->x.eventType().equals("APP_GRANTED")));}
 @Test void createsRoleWithFeatureMatrix(){var created=service.createRole(new RoleRequest("TEST_MATRIX","Test matrix","BUSINESS","qlnvkhcn",true,null,List.of(new MatrixEntryRequest("DOSSIER",Set.of("CREATE","EDIT"),true))));assertEquals("qlnvkhcn",created.appCode());assertEquals(Set.of("CREATE","EDIT"),created.permissionCodes());assertEquals("DOSSIER",created.matrix().getFirst().featureCode());}
 @Test void rejectsCrossAppRolePermissions(){assertThrows(IllegalArgumentException.class,()->service.replaceFeatureMatrix("PROCESS",List.of(new RoleMatrixCellRequest("PM",Set.of("VIEW"),true))));assertThrows(IllegalArgumentException.class,()->service.createRole(new RoleRequest("BAD_APP_MATRIX","Bad","BUSINESS","he-thong",true,null,List.of(new MatrixEntryRequest("DOSSIER",Set.of("VIEW"),true)))));}

 /**
  * V3 phải seed baseline theo chức năng thật NHƯNG không được làm mất dòng GENERAL của V2.
  *
  * Từ V6, catalog hoạt động chỉ còn CREATE/EDIT/VIEW_LIST/VIEW_DETAIL — các mã seed V3 gốc
  * (VIEW/APPROVE/REJECT/RETURN/COMMENT/EXPORT/SIGN/CONFIGURE/AUDIT/...) đều bị deactivate nên
  * biến mất khỏi `matrix`/`permsOf`. Số liệu dưới đây đã đối chiếu lại theo catalog mới; grant
  * gốc vẫn còn nguyên trong DB (không xoá), chỉ ẩn khỏi API.
  *
  * V7 cấp thêm VIEW_DETAIL cho mọi (role, feature) đã có SẴN ít nhất 1 dòng grant (kể cả dòng
  * trỏ tới mã cũ đã bị V6 deactivate) — sửa regression 2 gate backend thật
  * (WorkflowTaskActionService/DossierActionService) chặn cứng theo VIEW_DETAIL nhưng chưa role
  * nào được cấp mã này. Vì vậy HDKHCN/DOSSIER KHÔNG còn rỗng nữa (dù 5 mã seed V3 gốc vẫn
  * inactive) — có đúng 1 mã `VIEW_DETAIL` do V7 cấp lại.
  */
 @Test void migrationV3SeedsBaselineMatrixAndKeepsLegacyGeneralGrants(){
  var pm=role("PM");
  assertEquals(Set.of("CREATE","EDIT","VIEW_DETAIL"),permsOf(pm,"DOSSIER"));
  assertEquals(Set.of("CREATE","EDIT","VIEW_DETAIL"),permsOf(pm,"MISSION"));
  assertTrue(permsOf(pm,"GENERAL").isEmpty(),"Role qlnvkhcn không được giữ Feature của App hệ thống");
  assertEquals(Set.of("VIEW_DETAIL"),permsOf(role("HDKHCN"),"DOSSIER"),
      "V7 cấp lại VIEW_DETAIL vì HDKHCN vẫn còn dòng grant cũ (dù mã cũ đã bị V6 deactivate)");
  // V5 scope ADMIN vào App hệ thống và loại các grant xuyên App.
  assertEquals(0,permsOf(role("ADMIN"),"REPORT").size());
  assertEquals(Set.of("CREATE","EDIT","VIEW_DETAIL"),permsOf(role("ADMIN"),"RBAC_ADMIN"));
  assertEquals(Set.of("CREATE","EDIT"),permsOf(role("ADMIN"),"GENERAL"),
      "V7 loại trừ GENERAL (legacy) khỏi quy tắc cấp VIEW_DETAIL");
  // Vai trò không nằm trong 8 role baseline thì không bị chạm.
  assertTrue(permsOf(role("HDNT_TD"),"DOSSIER").isEmpty());
 }

 /**
  * Hồi quy quan trọng nhất của lát ma trận: lưu 1 chức năng KHÔNG được xoá các chức năng khác.
  * Nếu ai đó "đơn giản hoá" replaceFeatureMatrix thành deleteByRoleId (như setMatrix của
  * updateRole), test này đỏ ngay.
  */
 @Test void replaceFeatureMatrixTouchesOnlyTheGivenFeatureAndRoles(){
  var before=permsOf(role("CQ_KHCN"),"DOSSIER");
  assertFalse(before.isEmpty(),"cần baseline V3 để phép thử có ý nghĩa (EDIT còn active sau V6)");
  // CREATE/EDIT (thay vì VIEW/EXPORT cũ) vì chỉ 2 mã này còn active sau V6 — dùng mã đã bị
  // deactivate sẽ khiến grant vừa lưu biến mất khỏi matrix ngay, làm phép thử vô nghĩa.
  var updated=service.replaceFeatureMatrix("REPORT",List.of(
    new RoleMatrixCellRequest("CQ_KHCN",Set.of("CREATE","EDIT"),true),
    new RoleMatrixCellRequest("HDKHCN",Set.of("CREATE"),true)));
  assertEquals(List.of("CQ_KHCN","HDKHCN"),updated.stream().map(RoleResponse::code).toList());
  assertEquals(Set.of("CREATE","EDIT"),permsOf(role("CQ_KHCN"),"REPORT"));
  assertEquals(before,permsOf(role("CQ_KHCN"),"DOSSIER"),"DOSSIER không được đổi khi lưu REPORT");
  assertTrue(permsOf(role("PM"),"REPORT").isEmpty(),"role ngoài payload không được đụng");
  // Gửi tập rỗng = thu hồi đúng ô đó, vẫn không lan sang chức năng khác.
  service.replaceFeatureMatrix("REPORT",List.of(new RoleMatrixCellRequest("CQ_KHCN",Set.of(),true)));
  assertTrue(permsOf(role("CQ_KHCN"),"REPORT").isEmpty());
  assertEquals(before,permsOf(role("CQ_KHCN"),"DOSSIER"));
  assertThrows(EntityNotFoundException.class,()->service.replaceFeatureMatrix("KHONG_TON_TAI",List.of(new RoleMatrixCellRequest("PM",Set.of("VIEW"),true))));
  assertTrue(service.auditLog().stream().anyMatch(x->x.eventType().equals("ROLE_MATRIX_UPDATED")&&x.details().contains("feature=REPORT")));
 }

 @Test void assignBulkGrantsManyRolesOnceAndSkipsDuplicates(){
  var u=service.createUser(new UserRequest("bulk.assign@example.com",null,"Gán lô",null,null,"ACTIVE",false));
  var first=service.assignBulk(u.id(),new BulkAssignmentRequest(Set.of("PM","PA","NNC"),"OWN_MISSION",null,null,null));
  assertEquals(3,first.size());
  assertEquals(Set.of("NNC","PA","PM"),service.effective(u.id().toString()).roleCodes());
  assertEquals(0,service.assignBulk(u.id(),new BulkAssignmentRequest(Set.of("PM","PA"),"OWN_MISSION",null,null,null)).size(),"gán lại y hệt không được sinh dòng trùng");
  // Khác phạm vi dữ liệu = assignment khác, vẫn được tạo.
  assertEquals(1,service.assignBulk(u.id(),new BulkAssignmentRequest(Set.of("PM"),"OWN_CENTER",null,null,null)).size());
  assertEquals(4,service.assignments(u.id()).size());
  assertThrows(IllegalArgumentException.class,()->service.assignBulk(u.id(),new BulkAssignmentRequest(Set.of("PM"),"ARBITRARY",null,null,null)));
  assertThrows(EntityNotFoundException.class,()->service.assignBulk(u.id(),new BulkAssignmentRequest(Set.of("KHONG_TON_TAI"),"OWN_MISSION",null,null,null)));
  assertThrows(IllegalArgumentException.class,()->service.assignBulk(u.id(),new BulkAssignmentRequest(Set.of("PM"),"OWN_MISSION",null,LocalDate.of(2026,3,1),LocalDate.of(2026,1,1))));
  service.deleteUser(u.id());
 }

 /**
  * Hồi quy bug thật phát hiện qua click-through 2026-07-30: drawer "Phân quyền" hiện phạm vi dữ
  * liệu nhưng KHÔNG hiện mã vai trò. Nguyên nhân: DTO đọc `a.role.code` bằng field access, mà
  * field trên proxy lazy chưa khởi tạo trả null; `findByUserId` khi đó không join fetch role.
  * Các test cũ không bắt được vì chúng gọi assignments() ngay sau assign() — Role đã nằm sẵn
  * trong persistence context nên là entity thật chứ không phải proxy. Test này đọc user được
  * seed từ migration trong một transaction sạch, đúng điều kiện sinh bug.
  */
 @Test void assignmentsOfASeededUserExposeRoleCodeNotNull(){
  var pm=service.users().stream().filter(x->x.email().equals("pm@example.com")).findFirst().orElseThrow();
  var rows=service.assignments(pm.id());
  assertEquals(3,rows.size());
  assertTrue(rows.stream().noneMatch(a->a.roleCode()==null),"roleCode không được null (proxy lazy chưa khởi tạo)");
  assertEquals(Set.of("PM","PA","NNC"),rows.stream().map(AssignmentResponse::roleCode).collect(java.util.stream.Collectors.toSet()));
  assertTrue(rows.stream().allMatch(a->a.userId().equals(pm.id())));
 }

 /**
  * Hồi quy bug thật phát hiện qua click-through 2026-07-30: sau khi bấm "Lưu ma trận", các vai trò
  * vừa sửa biến mất khỏi đầu bảng và nhảy xuống cuối — `findAll()` không có ORDER BY nên trả theo
  * thứ tự heap, mà UPDATE làm dòng đổi vị trí vật lý.
  */
 @Test void rolesKeepAStableOrderAcrossUpdates(){
  var before=service.roles().stream().map(RoleResponse::code).toList();
  assertEquals(List.of("ADMIN","OPERATOR","VIEWER"),before.subList(0,3),"vai trò hệ thống đứng trước, theo mã");
  assertEquals(before.stream().sorted(Comparator.comparing((String c)->List.of("ADMIN","OPERATOR","VIEWER").contains(c)?0:1).thenComparing(c->c)).toList(),before);
  service.replaceFeatureMatrix("REPORT",List.of(new RoleMatrixCellRequest("VIEWER",Set.of("VIEW"),true)));
  assertEquals(before,service.roles().stream().map(RoleResponse::code).toList(),"lưu ma trận không được xáo trộn thứ tự");
 }

 @Test void allAssignmentsReturnsEveryUserRowWithUserIdResolved(){
  var all=service.allAssignments();
  assertFalse(all.isEmpty());
  assertTrue(all.stream().allMatch(a->a.userId()!=null),"userId phải resolve được (join fetch user)");
  var pm=service.users().stream().filter(x->x.email().equals("pm@example.com")).findFirst().orElseThrow();
  assertEquals(service.assignments(pm.id()).size(),all.stream().filter(a->a.userId().equals(pm.id())).count());
  assertTrue(all.stream().map(AssignmentResponse::userId).distinct().count()>1,"phải phủ nhiều user, không chỉ 1");
 }

 private RoleResponse role(String code){return service.roles().stream().filter(r->r.code().equals(code)).findFirst().orElseThrow();}
 private Set<String> permsOf(RoleResponse role,String featureCode){return role.matrix().stream().filter(m->m.featureCode().equals(featureCode)&&m.enabled()).flatMap(m->m.permissionCodes().stream()).collect(java.util.stream.Collectors.toSet());}
}

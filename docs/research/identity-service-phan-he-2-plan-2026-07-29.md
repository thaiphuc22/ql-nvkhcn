# Nâng cấp User/Role/Permission/Auth: xây Phân hệ 2 — Phân quyền và Xác thực tập trung

> Ghi nhận: 2026-07-29. Kế hoạch nâng cấp User/Role/Permission/Auth từ mock sang backend thật, theo
> chỉ đạo trực tiếp của user. Chưa triển khai — cần duyệt trước khi bắt đầu Bước 1 và cập nhật
> `.harness/state/decisions.md` / `DELIVERY_STATE.md` / `active-task.md` theo mục "Cập nhật harness"
> bên dưới trước khi coi đây là active task.

## Context

Toàn bộ User/Role/Permission hiện là **mock 100%**, xác nhận qua khảo sát trực tiếp code:

- `webapp/src/data/{roles,permissions,rbac}.ts` — mảng TS tĩnh, không gọi API.
- `backend/src/main/java/vn/vht/qtkhcn/service/RoleCatalog.java` — `Map` hardcode ~30 role code, tự nhận "chưa nối vào nguồn danh mục vai trò thật".
- `backend/.../security/WorkflowDemoIdentityProvider.java` + `services/ho-so-service/.../security/DemoIdentityProvider.java` — 2 bản `Map` demo-identity trùng lặp thủ công, đồng bộ tay với `frontend-angular/src/app/core/auth/demo-users.ts` (bản thứ 3).
- `frontend-angular/.../auth/auth.service.ts` — "Auth stub", so sánh `DEMO_PASSWORD` tĩnh, không gọi backend, không phát hành token.
- Không có Spring Security, không `SecurityFilterChain`, không JWT ở `backend` (8090) hay `ho-so-service` (8093) — chỉ có `DevApiKeyFilter` (header tĩnh) + `InternalServiceTokenFilter` (bearer tĩnh giữa 2 service).
- 3 route Angular `/phan-he/PH2/{nguoi-dung,phan-quyen,co-cau-to-chuc}` đều trỏ vào `PlaceholderPage` chung — chưa có UI thật.

Đây là gap đã track chính thức: quyết định **D9** (role model "LOCKED (shape) — enforcement layer still open") và Foundation **F2/F3/F5** (`PARTIAL`) trong `DELIVERY_STATE.md`, chặn bởi **OQ-021** (giao thức SSO/IAM) và **OQ-006** (độ hạt RBAC). Mô hình Role/Assignment mục tiêu (role định nghĩa năng lực, assignment định nghĩa phạm vi áp dụng) đã được thống nhất trước đó ở `docs/research/recfactor-module-user-role.md` và implement phía mock qua quyết định D11 — kế hoạch này giữ nguyên đúng mô hình đó, chỉ chuyển từ mock sang schema DB thật.

User đã chỉ đạo nâng cấp thật (BE + FE), với các quyết định đã chốt qua trao đổi:

1. **IdP cho SSO**: dùng tích hợp SSO **của VHT đã có sẵn** — nhưng **tạm bỏ qua phần code đăng nhập thật (redirect/callback OIDC) trong đợt này**, vì chưa có endpoint/thông tin kết nối từ VHT.
2. **Kiến trúc**: Phân hệ 2 là **service Spring Boot mới, độc lập** (giống pattern D18/D20/D21 đã tách `backend` ↔ `ho-so-service`), không gộp vào `backend`.
3. **MVP "tạo mới người dùng"**: admin tạo trực tiếp trong Phân hệ 2, lưu **hoàn toàn local trong DB của identity-service** — không dựng Keycloak hay bất kỳ IdP ngoài nào ở đợt này (đã cân nhắc và loại bỏ phương án dựng Keycloak tạm: sẽ phải bỏ đi khi VHT cấp SSO thật, lãng phí hạ tầng). Khi VHT cung cấp endpoint SSO thật, thêm 1 bước liên kết/đồng bộ tài khoản (theo email/mã nhân viên) vào `users` đã có sẵn — không phải thiết kế lại model.

**Làm rõ quan hệ Keycloak ↔ Camunda (đã hỏi lại, xác nhận không liên quan tới phạm vi này)**: Camunda 8 Self-Managed có một Keycloak riêng (định nghĩa trong `infra/camunda/docker-compose-full.yaml`, KHÔNG chạy trong stack dev hiện tại), chỉ phục vụ (a) đăng nhập console vận hành Operate/Tasklist/Optimize/Web Modeler/Console và (b) xác thực service-to-service tới Zeebe gRPC nếu bật auth (hiện chưa bật, theo D16 stack nhẹ). Theo D9/D20, `candidateGroup` trong BPMN chỉ là chuỗi ký tự thô — Zeebe không biết và không cần biết ai thuộc nhóm nào; toàn bộ kiểm tra role/permission diễn ra trong code `backend`/`ho-so-service` **trước khi** gọi Zeebe. Do đó **Phân hệ 2 chỉ cần xây trên App nghiệp vụ, không cần bất kỳ thay đổi nào ở Camunda/BPMN/Zeebe**, và không cần dựng Keycloak ở đợt này.

## Phạm vi (trong đợt này) vs. hoãn lại

**Trong đợt này:**

- Service mới `identity-service` sở hữu Organization/Role/Permission/User/UserRoleAssignment/Audit — CRUD thật, DB Postgres thật, không phụ thuộc IdP ngoài.
- `backend` (8090) và `ho-so-service` (8093) **giữ nguyên cơ chế xác thực hiện tại** (`DevApiKeyFilter` + header `X-QTKHCN-User-Id`) — KHÔNG làm resource-server/JWT ở đợt này (không có issuer thật để validate). Chỉ đổi phần "tra cứu role/permission của user đó là gì": `WorkflowDemoIdentityProvider`/`DemoIdentityProvider` gọi `identity-service` (`/internal/users/{id}/effective-permissions` hoặc theo email) thay vì đọc `Map` hardcode nội bộ. Đây là cách gỡ 2 trong 3 bản hardcode trùng lặp mà không cần chờ SSO.
- `frontend-angular`: `AuthService.login()` vẫn dùng cơ chế demo hiện tại để xác định "đăng nhập là ai" (giữ nguyên `LoginPage`/`authGuard`/`appGuard`/`app-registry.ts` — khớp cam kết D19), nhưng sau khi xác định user, gọi `identity-service` để lấy role/permission/org thật thay vì đọc tĩnh từ `demo-users.ts` — gỡ bản hardcode thứ 3.
- Angular: 3 trang PH2 (Người dùng/Phân quyền/Cơ cấu tổ chức) từ `PlaceholderPage` → CRUD thật gọi `identity-service`.

**Hoãn lại (task/OQ riêng, chờ VHT cung cấp thông tin):**

- Luồng đăng nhập SSO thật (Angular OIDC Authorization Code + PKCE, redirect/callback) trỏ vào IdP thật của VHT.
- `backend`/`ho-so-service` chuyển sang OAuth2 resource-server thật (validate JWT theo issuer VHT) — phụ thuộc thông tin SSO.
- Liên kết tài khoản `identity-service` với danh tính SSO thật (map theo email/mã nhân viên).
- Đồng bộ danh mục cán bộ từ HR/LDAP ngoài (không có trong scope, MVP admin nhập tay).

## Kiến trúc & quyết định kỹ thuật

- **Service mới**: `services/identity-service/` — Maven, package `vn.vht.qtkhcn.identity`, artifact `qtkhcn-identity-service`, port đề xuất **8095** (8090/8093 đã dùng). DB riêng `qtkhcn_identity` trên cùng Postgres container (`qtkhcn-postgres`), Flyway bắt đầu từ V1 (không đụng schema 2 service kia).
- **Cấu trúc thư mục/lớp**: mirror `services/ho-so-service/` đã có — `domain/`, `repository/` (Spring Data JPA), `service/`, `web/` + `web/dto/` (record DTO), `GlobalExceptionHandler` theo mẫu `backend/.../web/GlobalExceptionHandler.java`, validation `jakarta.validation`. Endpoint nghiệp vụ dưới `/api/...`; endpoint cho backend/ho-so-service tra cứu dưới `/internal/...`, dùng lại cơ chế `InternalServiceTokenFilter` đã có (copy pattern, token riêng `qtkhcn.internal.service-token` cho identity-service).
- **Schema V1 (identity-service)**: `organizations` (đơn vị/phòng ban, cây cha-con), `roles` (code, label — thay `RoleCatalog.java` hardcode), `permissions` (18 permission chuẩn theo tài liệu "Danh mục vai trò và Permission nghiệp vụ" đã đọc trước đó), `role_permissions`, `users` (email, họ tên, chức danh, đơn vị, trạng thái — chưa có cột liên kết IdP ngoài, sẽ thêm khi cần), `user_role_assignments` (user + role + dataScope + orgUnit + effective dates — mirror đúng shape `UserRoleAssignment` trong `webapp/src/data/rbac.ts`), `audit_log` (login/access/permission-change — theo yêu cầu "Nhật ký" trong `docs/research/userflow-sso-app-portal-phan-he-2026-07-09.md` mục 2).
- **`backend`/`ho-so-service`**: thay ruột `WorkflowDemoIdentityProvider`/`DemoIdentityProvider` — vẫn nhận `userId` qua header như hiện tại, nhưng resolve role/permission bằng 1 lệnh gọi `RestClient` tới `identity-service` (giống pattern `RestClient` đã dùng trong `OutboxDispatcher.java`) thay vì tra `Map` tĩnh. Không đổi chữ ký API hiện có, không đổi cách controller nhận identity — chỉ đổi nguồn dữ liệu phía sau, rủi ro thấp, không cần test lại toàn bộ luồng auth.
- **Angular**: `core/services/{user,role,organization}.service.ts` mới gọi `identity-service`; 3 trang PH2 dựng CRUD thật thay `PlaceholderPage` (tham khảo UX cũ ở `webapp/src/pages/UserManagement.tsx`/`RolePermission.tsx` đã retire, không copy nguyên vì đó là mock). `AuthService.login()` giữ nguyên bước xác thực demo, thêm 1 lệnh gọi `identity-service` sau khi login thành công để lấy role/permission/apps thật.

## Cập nhật harness (bắt buộc theo protocol)

Trước khi implement bước 1:

- Thêm 1 quyết định mới vào `decisions.md` (ví dụ D22): chốt kiến trúc `identity-service` độc lập, không dựng IdP tạm; ghi rõ OQ-021 vẫn **chưa đóng** (chỉ mở khoá phần "quản lý user/role/permission", phần "đăng nhập SSO thật" vẫn chờ VHT cấp thông tin kết nối).
- Cập nhật `DELIVERY_STATE.md`: F2/F3 chuyển từ `PARTIAL (frontend-only mock)` sang trạng thái phản ánh service thật đang xây; thêm 1 Active Feature Workstream mới.
- Cập nhật `active-task.md` để phản ánh đây là task đang chạy — cần xác nhận thứ tự ưu tiên so với "RD02.02 v3" đang ghi là active task hiện tại trước khi đổi.

## Các bước triển khai

1. **Scaffold `identity-service`** — Maven pom mirror `services/ho-so-service/pom.xml`, `application.yml` (port 8095, DB `qtkhcn_identity`), Flyway V1 schema như trên, `GlobalExceptionHandler`, health endpoint. Đăng ký DB mới cạnh `qtkhcn_ho_so` trong stack Postgres dev hiện có.
2. **CRUD Organization/Role/Permission** — API + entity + repository, seed data từ danh mục 18 permission + role đã đọc trong "Danh mục vai trò và Permission nghiệp vụ" (30 role ưu tiên).
3. **CRUD User + UserRoleAssignment** — bao gồm endpoint "tạo mới người dùng" (local-only), API gán vai trò kèm dataScope/orgUnit/effective date, endpoint `/internal/users/{id}/effective-permissions` cho backend/ho-so-service tra cứu.
4. **Nối `backend` + `ho-so-service` vào identity-service** — thay ruột `WorkflowDemoIdentityProvider`/`DemoIdentityProvider` gọi `identity-service` qua `RestClient` (giữ nguyên header `X-QTKHCN-User-Id` + `DevApiKeyFilter`); chạy lại test hiện có (đặc biệt `BundledBpmnDeployedConsistencyTest`, `ProcessDefinitionHttpContractTest`, các test action-routing đã thấy trong git status) để đảm bảo không vỡ.
5. **Angular PH2 pages thật** — service layer + 3 trang CRUD thay `PlaceholderPage`, dùng ng-zorro table/form/modal theo convention hiện có trong `process-catalog`.
6. **Nối `AuthService` Angular vào identity-service** — sau login demo thành công, gọi identity-service lấy role/permission/apps thật thay `demo-users.ts` tĩnh.
7. **Xoá dần mock** — sau khi (2)(3)(4)(6) chạy được: gỡ `RoleCatalog.java` hardcode, gỡ `webapp/src/data/{roles,rbac}.ts` tương ứng nếu `webapp/` còn được dùng (xác nhận với user vì `webapp/` có thể đã coi là legacy).

## Xác minh

- `identity-service`: unit test cho service/repository (mirror style test hiện có trong `backend/src/test/...`), test tích hợp cho luồng CRUD user/role/assignment.
- `backend`/`ho-so-service`: chạy lại toàn bộ test suite hiện có (`mvn test` mỗi service) sau khi đổi nguồn identity-provider — không được có regression; chạy lại smoke E2E RD02.02 đã có (tránh lặp lại sự cố token lệch 8090↔8093 đã từng gặp).
- Angular: `ng build` xanh, `ng test` xanh; click-through thủ công 3 trang PH2 mới qua `ng serve` — tạo 1 user demo, gán role, xác nhận role/permission mới hiển thị đúng khi đăng nhập demo bằng user đó.
- Không phá luồng demo login hiện tại (`/dang-nhap` vẫn hoạt động như cũ) trong suốt đợt này.

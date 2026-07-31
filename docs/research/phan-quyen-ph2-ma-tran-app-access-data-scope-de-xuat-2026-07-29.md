# Đề xuất nâng cấp Phân hệ 2 (Phân quyền) — Ma trận quyền, App-access, Data scope mở rộng

## Context

User vừa review màn `/phan-he/PH2/phan-quyen` (Angular, nối `services/identity-service` — service này
mới build **hôm nay 2026-07-29**, quyết định **D22**) và đưa 3 nhận xét. Đây chính là nội dung của
**OQ-006** (RBAC granularity) đang để mở trong `decisions.md` — bản đề xuất này nhằm trả lời OQ-006 phần
"độ hạt ma trận vai trò × phân hệ" (NFR-SEC-002) chứ không phải một bug thường.

**Quan trọng — theo lựa chọn trực tiếp của user**: đây chỉ là **bản đánh giá/đề xuất để duyệt**, CHƯA
triển khai code. Việc coi đây là active task (và thứ tự so với "Runtime quy trình động (process-agnostic)"
đang IN PROGRESS) sẽ quyết định sau khi user xem plan này.

Nguyên nhân gốc đã xác nhận qua code: khi xây `identity-service` để thay 3 bản mock trùng lặp
(`webapp/`, `RoleCatalog.java`, `demo-users.ts` — theo kế hoạch
`docs/research/identity-service-phan-he-2-plan-2026-07-29.md`), team ưu tiên tốc độ CRUD và **không mang
theo** mô hình ma trận đã có sẵn trong mock cũ (D11), đồng thời App-access và data-scope bị đơn giản hoá
tới mức không kiểm soát được.

## Hiện trạng đã xác minh trong code (không suy đoán)

| Vấn đề | webapp/ (mock cũ, đã bỏ) | frontend-angular + identity-service (thật, đang chạy) |
|---|---|---|
| **#1 Ma trận quyền** | Đã là ma trận thật: `MatrixTab` (`webapp/src/pages/RolePermission.tsx:373-627`) — hàng = 12 `FEATURE_DEFINITIONS` (Dashboard, Nhiệm vụ, Hồ sơ, Quy trình, Biểu mẫu, Người dùng, Cơ cấu tổ chức, Phân quyền, Báo cáo, Audit...), cột = 11 `PERMISSION_DEFINITIONS` (Xem/Tạo/Sửa/Duyệt/Từ chối/Trả lại/Xuất/Bình luận/Ký/Cấu hình/Audit) — `webapp/src/data/rbac.ts:34-175` | Chỉ còn danh sách phẳng: `Permission.java` (id/code/name/description) không có chiều "đối tượng/feature"; `Role↔Permission` là `@ManyToMany` phẳng (`Role.java`); Angular tab "Quyền" (`role-permission.html:72-136`) và modal gán quyền cho role chỉ là multi-select phẳng (`role-permission.html:189-198`), không nhóm theo đối tượng nào |
| **#2 App-access** | Không có UI gán — chỉ hàm `hasPermission` hardcode theo boolean (`webapp/src/data/phanHe.ts:83,94,114`) | Khái niệm App (`qlnvkhcn/quytrinh/he-thong`, D19) chỉ tồn tại dưới dạng mảng tĩnh `DemoUser.apps` trong `frontend-angular/src/app/core/auth/demo-users.ts:24,31-48` — **không UI, không cột DB nào** ở `identity-service` (`User.java` không có field apps) |
| **#3 Data scope** | Enum 4 giá trị có `<Select>` ràng buộc: `DataScopeCode` (`webapp/src/data/rbac.ts:34,170-175`), gắn 1 org + hiệu lực (`UserRoleAssignment`, D11) | **Đã thoái hoá thành free-text**: `UserRoleAssignment.java:4` — cột `data_scope varchar(32)` không enum/constraint; UI là `<input placeholder="VD: OWN, OWN_MISSION, ORG, ALL">` (`user-management.html:178`) — gõ gì cũng lưu được, không kiểm tra. `EffectivePermissionsResponse` (`IdentityService.effective()` dòng 29) **không trả `dataScope`/`organizationId` theo từng assignment** — chỉ union phẳng roleCodes + permissions, nên chưa service nào có thể enforce theo phạm vi dù đã lưu dữ liệu. |

**Điểm đáng chú ý**: cấu trúc "1 user nhiều assignment" (nhiều role/scope/org cùng lúc) **đã tồn tại sẵn** —
`assignments.findByUserId()` trả về `List`, `assign()` chỉ thêm dòng mới (`IdentityService.java:25-26`).
Đây không phải gap schema — gap thật là **projection `effective()` làm phẳng mất thông tin scope/org
theo từng assignment**, khiến consuming service (`backend`/`ho-so-service`) không có gì để filter theo
phạm vi.

## Mô hình đề xuất

### A. Ma trận quyền: Feature × Action

- Thêm catalog `features` vào `identity-service` (code/name/group/description) — seed lại đúng 12 dòng từ
  `FEATURE_DEFINITIONS` cũ (`webapp/src/data/rbac.ts:155-168`) làm điểm khởi đầu, có thể chỉnh sau khi
  duyệt (KHÔNG bịa domain object mới nếu user muốn khác — xem câu hỏi mở bên dưới).
- Giữ `permissions` làm catalog HÀNH ĐỘNG (giữ tên bảng để giảm rủi ro migrate), nhưng thay
  `role_permissions` (many-to-many phẳng) bằng `role_feature_permissions (role_id, feature_id,
  permission_id, enabled)` — đúng shape `RolePermissionPolicy{roleCode, featureCode, permissionCodes[],
  enabled}` đã duyệt ở D11, chỉ chuyển từ mock TS sang bảng thật.
- **Điểm cần quyết định trước khi chạy migration**: 30+ role hiện tại đã có `role_permissions` thật (seed
  hôm nay) không có chiều feature — cần chọn 1 trong 2: (a) gán tất cả pair cũ vào 1 feature "GENERAL" tạm
  rồi user rà soát lại qua UI ma trận, hoặc (b) rebuild seed hoàn toàn theo ma trận mới. Đề xuất (a), rủi ro
  thấp hơn, nhưng cần user xác nhận.
- API: `RoleRequest/Response` đổi `permissionCodes: Set<string>` → `matrix: {featureCode, permissionCodes[]}[]`.
  `EffectivePermissionsResponse` **giữ nguyên** field `permissions: Set<code>` phẳng hiện có (consumer thật
  duy nhất — `WorkflowDemoIdentityProvider`/`DemoIdentityProvider` — chỉ check permission code phẳng kiểu
  `PROCESS_STEP` theo D9, không quan tâm feature) và **thêm** field mới `featurePermissions` — zero
  blast-radius cho luồng workflow đang chạy thật.
- Angular: thay tab "Quyền" bằng tab "Ma trận quyền" — theo đúng pattern đã có ở Approval Matrix
  (`frontend-angular/src/app/pages/approval-matrix/` + `core/services/approval-matrix.service.ts`: tab
  service load/save có version, toggle enable/disable không xoá — pattern này copy được nguyên si thay vì
  thiết kế lại).

### B. App-access

- Chọn theo hướng user đã duyệt: **per-user, lưu thật trong identity-service** (không chỉ theo role).
- Bảng mới `user_apps (user_id, app_code, granted_at)` — di chuyển catalog `AppCode`
  (`app-registry.ts:1-9`: `qlnvkhcn/quytrinh/he-thong`) thành nguồn phía server; giữ file Angular hiện tại
  làm bản dịch nhãn/icon (label/icon vẫn hợp lý ở FE, chỉ danh sách "user này được vào app nào" chuyển
  sang server).
- API: `GET/PUT /api/users/{id}/apps` (replace-set, ghi `audit_log` giống `ROLE_ASSIGNED/REVOKED`).
- `EffectivePermissionsResponse` thêm field `apps: Set<string>`.
- Angular: `user-management` drawer thêm khối "Ứng dụng" (checkbox 3 app) cạnh drawer "Phân quyền" đã có;
  `AuthService.refreshCurrentUser()` (đã tồn tại, vừa thêm hôm nay để nạp roleCodes/administrator thật) mở
  rộng để ghi đè luôn `DemoUser.apps` — cùng pattern zero-blast-radius vừa dùng, không đổi chữ ký
  `login()`.

### C. Data scope

1. **Sửa ngay phần thoái hoá** (rủi ro thấp, nên làm trước tiên dù có làm phần khác hay không): thay cột
   `data_scope` tự do bằng catalog `data_scope_types` (4 giá trị y hệt cũ, có `rank`) + FK — khôi phục đúng
   mức an toàn mà bản mock từng có (`<Select>` thay vì `<input>` tự do).
2. **"1 user nhiều phạm vi cùng lúc"** — không cần đổi schema (đã hỗ trợ qua nhiều dòng
   `UserRoleAssignment`). Chỉ cần sửa `EffectivePermissionsResponse` để trả **danh sách assignment**
   (`{roleCode, dataScope, organizationId}[]`) thay vì permission set đã làm phẳng — đây là chỗ thật sự
   thiếu để `backend`/`ho-so-service` sau này lọc dữ liệu theo phạm vi.
3. **"Uỷ quyền/xử lý hộ tạm thời" (act-on-behalf)** — khái niệm mới, chưa có gì trong schema hiện tại.
   Đề xuất bảng riêng `delegations (id, delegator_user_id, delegate_user_id, role_code, scope_snapshot,
   valid_from, valid_to, reason, revoked_at)` — khớp yêu cầu đã ghi nhận nhưng chưa xây
   (`REQ-ENG-012`: "ghi vết người thực hiện + người đại diện"). Đề xuất tách thành **Phase 3 riêng**, không
   gộp vào đợt sửa matrix/app-access vì đây là năng lực mới hoàn toàn, cần thiết kế audit/hiển thị riêng.
4. **"Phạm vi theo tiêu chí nghiệp vụ khác ngoài đơn vị"** (vd. loại nhiệm vụ/lĩnh vực/luồng RD) — đề xuất
   tổng quát hoá scope thành cặp `(scopeType, scopeValue)` thay vì giả định trục duy nhất là đơn vị tổ chức.
   **Không tự chốt danh sách `scopeType` cụ thể** — cần 1-2 ví dụ use case thật từ user trước khi khoá
   schema (giống cách các OQ khác trong `decisions.md` đang chờ, không đoán).

## Lộ trình triển khai (khi được duyệt bắt đầu code)

- **Phase 1 (rủi ro thấp nhất, sửa thoái hoá)**: data-scope free-text → catalog có enum; App-access CRUD
  (hoàn toàn mới, không đụng dữ liệu cũ); `EffectivePermissionsResponse` trả thêm `assignments[]`.
- **Phase 2 (ma trận quyền)**: bảng `features` + `role_feature_permissions`, tab Angular mới, xử lý
  migrate 30+ role hiện có (cần user chốt cách xử lý dữ liệu cũ ở mục A bên trên).
- **Phase 3 (năng lực mới, cần thêm yêu cầu)**: `delegations` (act-on-behalf); mở rộng `scopeType` phi-tổ-chức
  — chờ ví dụ use case cụ thể.

## Cập nhật harness bắt buộc trước khi bắt đầu Phase 1

- Thêm quyết định mới (D23) vào `decisions.md` — chốt mô hình ma trận/app-access/scope ở trên, tu chỉnh D9
  (shape role/permission), D11 (data scope), D19 (nguồn App-access chuyển từ client-static sang
  identity-service).
- Cập nhật `DELIVERY_STATE.md` mục F3 (hiện `PARTIAL`) phản ánh phạm vi mới.
- Xác nhận lại thứ tự với `active-task.md` — hiện active task là "Runtime quy trình động
  (process-agnostic)" IN PROGRESS; theo lựa chọn của user, việc này **chưa** chèn vào làm active task ngay.

## Xác minh (khi triển khai thật)

- `identity-service`: test Flyway migration mới + service/repository (mirror
  `IdentityServiceHttpContractTest` đã có), đặc biệt test "dữ liệu role_permissions cũ vẫn đọc được sau
  migrate sang role_feature_permissions".
- Chạy lại full suite `backend` + `ho-so-service` (không được regression — đúng kỷ luật đã áp dụng khi
  build D22 hôm nay).
- Angular: cập nhật/viết lại test cho `role-permission` (tab ma trận mới) + `user-management` (App-access);
  `ng build`/`ng test` xanh; click-through Playwright thật (đã có tiền lệ ngay trong đợt build hôm nay) cho
  luồng: sửa ma trận 1 role → gán App cho 1 user → gán data scope hợp lệ → xác nhận hiển thị đúng ở tab
  "Mô phỏng"/effective-permissions.

## Câu hỏi còn mở (cần user/kiến trúc sư chốt trước Phase 2–3, không tự đoán)

- Danh sách 12 "feature" có đúng là bộ đối tượng user muốn hay cần khác (vd. tách theo RD stage cụ thể)?
- Cách xử lý 30+ role/permission pair đã seed thật hôm nay khi thêm chiều feature (gán "GENERAL" tạm hay
  rebuild seed)?
- Ví dụ cụ thể cho scope phi-tổ-chức (loại nhiệm vụ/lĩnh vực nào cần phân biệt?) trước khi khoá
  `scopeType` enum.

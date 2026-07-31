# Refactor "Ma trận phân quyền" → card-grid theo ảnh mẫu

## Context

Ảnh mẫu người dùng đưa (mã phân hệ QLGSCK/TTCK/GDTCK...) là tham khảo LAYOUT, không phải mã
thật của hệ thống — mục tiêu là áp dụng kiểu bố cục **lưới card** (mỗi chức năng 1 card: toggle +
icon lịch sử + icon sửa + checkbox phân quyền cuộn được) vào đúng trang Phân quyền hiện có.

Ban đầu tôi tưởng trang mock React cũ (`webapp/src/pages/RolePermission.tsx`) là mục tiêu, nhưng
sau khi kiểm tra `git status` phát hiện đây KHÔNG phải trang đang phát triển thật — trang thật là
**`frontend-angular/src/app/pages/role-permission/`**, đã nối `services/identity-service` thật
(D22), và đang có một khối thay đổi lớn **chưa commit** (App-scoping vai trò/chức năng + API lưu
ma trận theo từng chức năng). Plan này build tiếp trên nền chưa-commit đó, không phải từ scratch.

**Quyết định đã chốt với user (qua AskUserQuestion):**
1. Bỏ hẳn tab **"Quyền"** (CRUD danh mục quyền dùng chung) khỏi trang.
2. Tab **"Ma trận phân quyền"** đổi trục: thay vì ghim 1 Chức năng rồi liệt kê Vai trò dạng bảng
   → ghim 1 **Vai trò**, liệt kê 12 Chức năng dạng **lưới card** (đúng ảnh mẫu).
3. Mỗi card tạm dùng đúng **4 quyền chuẩn**: Xem danh sách / Xem chi tiết / Thêm mới / Sửa.
   Chính thức về sau BA sẽ định nghĩa item theo từng chức năng và nhờ Dev seed DB — ngoài phạm
   vi lần này, chỉ cần kiến trúc không cản trở việc đó sau này.
4. Icon đồng hồ (lịch sử) = placeholder, disabled, chưa có hành vi.
5. Icon bút chì (sửa) = mở drawer chi tiết (feature/role/quyền/toggle) — tinh thần giống
   `PolicyDrawer` cũ của bản mock React, viết lại bằng `nz-drawer` vì Angular chưa có component
   này.

**Rủi ro đã kiểm tra và loại trừ:** đã grep toàn bộ `frontend-angular` — trường `permissions` /
`featurePermissions` của `EffectivePermissionsResponse` **không được đọc ở đâu để gate tính năng
thật** (`auth.service.ts` chỉ dùng `roleCodes` + `administrator`). Việc gate hành động thật trong
`backend/` (RD01-10) dùng `vaiTroCodes`/candidateGroup riêng (quyết định D9), không phụ thuộc
catalog `permissions` của identity-service. Vì vậy thu gọn catalog quyền về 4 mục không phá gating
thật nào đang chạy — an toàn để làm ngay.

**Lưu ý harness:** việc này nằm ngoài active task hiện tại (RD02.02 v3 — 3 gap chặn luồng, chưa
sửa). Đây là quyết định có chủ ý của user để chuyển hướng làm trước; khi bắt đầu implement cần cập
nhật `.harness/state/active-task.md` phản ánh việc tạm chuyển sang task này (hoặc xác nhận lại với
user trình tự ưu tiên) trước khi động vào code.

## Backend — `services/identity-service`

1. **Migration mới** `V6__simplify_matrix_permission_catalog.sql` (tiếp theo V5):
   - `insert into permissions(...)` 2 mã mới: `VIEW_LIST` ("Xem danh sách"), `VIEW_DETAIL` ("Xem
     chi tiết") — catalog hiện chỉ có 1 mã `VIEW` gộp chung, không tách list/detail được.
   - `update permissions set name='Thêm mới' where code='CREATE'`, `name='Sửa' where code='EDIT'`
     — tái dùng nguyên mã, chỉ đổi nhãn hiển thị cho khớp ảnh mẫu.
   - `update permissions set active=false where code not in ('VIEW_LIST','VIEW_DETAIL','CREATE','EDIT')`
     — **không xoá**: giữ nguyên vẹn FK của `role_feature_permissions` (seed V3) và `audit_log`,
     chỉ ẩn khỏi catalog đang hoạt động.

2. **`IdentityService.java`**:
   - `permissions()` (dòng 31): thêm filter `.filter(p -> p.active)` trước khi map — API
     `/api/permissions` giờ chỉ trả 4 mục đang hoạt động cho lưới card.
   - `role(Role e)` và `toMatrix(...)`: thêm filter `g.permission.active` khi gom `grants` (đối
     xứng với filter đã có sẵn trong `effective()`) — để các grant cũ trỏ tới quyền vừa
     deactivate không hiện lại như ô đã tick "ma" trên UI.
   - Không cần endpoint mới cho lưu ma trận: `replaceFeatureMatrix(featureCode, cells)` (đã có,
     dùng `RoleFeaturePermissionRepository.deleteByRoleIdAndFeatureId`) gọi với **đúng 1 cell**
     (vai trò đang ghim) là đủ cho mô hình "ghim Vai trò, lưu từng card" — tái dùng nguyên xi.

3. **`IdentityController.java`**: không đổi route. Có thể cân nhắc bỏ `/api/permissions`
   POST/PUT/DELETE khỏi controller vì UI không còn CRUD quyền — nhưng **giữ nguyên** cho lần này
   (chưa có yêu cầu xoá, và BA/Dev seed tương lai có thể vẫn cần API này).

4. **Test cần rà lại** (không sửa trước, chỉ verify sau khi migrate):
   `IdentityServiceIntegrationTest.java` dùng mã `VIEW`/`EDIT` trực tiếp
   (`Set.of("VIEW","EDIT")` dòng 8) — `permission(String code)` lookup theo code **không lọc
   active**, nên các test này vẫn pass (VIEW vẫn tồn tại, chỉ đổi cờ active, EDIT không đổi code).
   Chạy lại bộ test để xác nhận không có test nào assert `permissions().size()` bằng số cũ.

## Frontend — `frontend-angular/src/app/pages/role-permission/`

### `role-permission.html`
- **Xoá** toàn bộ `<nz-tab nzTitle="Quyền">` (dòng 215–279) và `<nz-modal>` "Sửa/Thêm quyền"
  (dòng 378–401).
- **Viết lại** `<nz-tab nzTitle="Ma trận phân quyền">` (dòng 74–213):
  - Toolbar: giữ select "Ứng dụng" (`matrixAppCode`); đổi select "Chức năng" → select **"Vai
    trò"** (`matrixRoleCode`, options từ `roles()` lọc theo `appCode`, hiển thị `code — name`);
    có thể giữ ô tìm-kiếm/lọc card theo tên/nhóm chức năng thay cho "Tìm vai trò" cũ. Nút "Lưu ma
    trận" giữ nguyên vị trí, disabled khi không có card nào dirty.
  - Thay bảng `<table class="rp-matrix rp-matrix-grid">` bằng lưới card:
    `<div class="rp-feature-grid">` lặp `matrixFeatures()`, mỗi phần tử là 1
    `<div class="rp-feature-card">` gồm:
    - Header: tên + mã chức năng, `nz-switch` (bind `isFeatureEnabled(f.code)` /
      `toggleFeatureEnabled(f.code, $event)`), icon lịch sử (`<button nz-button nzType="text"
      disabled nz-tooltip nzTooltipTitle="Lịch sử thay đổi — chưa hỗ trợ"><span nz-icon
      nzType="history"></span></button>`), icon sửa (mở drawer:
      `openMatrixDetail(f.code)`).
    - Body: nhãn "Phân quyền" + lưới 2 cột checkbox từ `permissions()` (4 mục), mỗi checkbox
      dùng `nz-checkbox` bind `isMatrixCellChecked(f.code, p.code)` /
      `toggleMatrixGridCell(f.code, p.code)` — trong khối `max-height` + `overflow:auto` để
      khớp thanh cuộn trong ảnh mẫu (phòng khi sau này BA seed nhiều hơn 4 item/feature).
  - Thêm `<nz-drawer>` mới cho "sửa" (thay tinh thần `PolicyDrawer`): hiện tên/mã chức năng, vai
    trò đang ghim, `nz-switch` enabled (dùng chung state với card), danh sách tag các quyền đã
    tick (`nz-tag` theo `permissions()` đã chọn).

### `role-permission.ts`
- Xoá state/method chỉ phục vụ tab "Quyền": `permissionModalOpen`, `permissionSaving`,
  `editingPermission`, `permissionFormCode/Name/Description/Active`, `openCreatePermission`,
  `openEditPermission`, `closePermissionModal`, `submitPermission`, `removePermission`. Giữ
  `permissions`/`permissionsLoading`/`permissionsError`/`reloadPermissions()` (lưới card vẫn cần
  danh sách 4 quyền).
- Đổi trục ghim của tab ma trận: `matrixFeatureCode` (ghim feature) → `matrixRoleCode` (ghim vai
  trò). `onMatrixFeatureChange` → `onMatrixRoleChange`.
- `resetMatrixDraft()`: đổi từ "duyệt `roles()` xây `Record<roleCode, Set<permission>>` cho 1
  feature" sang "duyệt `matrixFeatures()` xây `Record<featureCode, Set<permission>>` +
  `Record<featureCode, boolean>` (enabled) cho **1 role đang ghim** — đọc từ
  `roles().find(r => r.code === matrixRoleCode()).matrix` (đã có sẵn field `matrix` trên
  `RoleResponse`, không cần API mới).
- Đổi dirty-tracking từ theo-role sang theo-feature: `matrixDirtyFeatures: Set<featureCode>`.
- `toggleMatrixGridCell(featureCode, permCode)`, `toggleFeatureEnabled(featureCode, checked)`:
  sửa draft + đánh dấu dirty đúng featureCode đó.
- `saveMatrix()`: với mỗi `featureCode` trong `matrixDirtyFeatures()`, gọi
  `roleMatrixService.replaceFeature(featureCode, { roles: [{ roleCode: matrixRoleCode(),
  permissionCodes: [...draft[featureCode]], enabled: enabledDraft[featureCode] }] })`; gom các
  request bằng `forkJoin` (đã có `HttpClient`/rxjs sẵn trong project) rồi mới `reloadRoles()` +
  reset draft một lần — giữ đúng tinh thần "sửa nhiều, lưu 1 lượt" của code cũ.
- `openMatrixDetail(featureCode)` / đóng drawer: signal mới `matrixDetailFeatureCode`.
- Xoá `matrixRoleQuery`, `matrixKindFilter`, `matrixRows` (không còn ý nghĩa khi trục là feature
  cố định theo app, không phải role list có thể lọc) — nếu vẫn muốn filter card theo tên/nhóm thì
  thêm `matrixFeatureQuery` tương tự nhưng lọc trên `matrixFeatures()`.

### `role-permission.scss`
- Xoá các rule chỉ phục vụ bảng ma trận cũ nếu không còn dùng (`.rp-matrix-role*`,
  `.rp-matrix-row-dirty`) sau khi đổi sang card; giữ `.rp-matrix` nếu modal "Sửa vai trò" (ma
  trận trong `nz-modal` Vai trò, dòng 338-369 của html) vẫn dùng dạng bảng — **không đổi khối modal
  Vai trò**, chỉ đổi tab chính.
- Thêm `.rp-feature-grid` (CSS grid, `repeat(auto-fill, minmax(340px, 1fr))`, gap 12-16px),
  `.rp-feature-card` (border + radius theo `--vht-border`/`--vht-radius` có sẵn, giống `.rp-card`),
  `.rp-feature-card-header` (flex, switch bên trái tên, 2 icon bên phải), `.rp-feature-card-perms`
  (CSS grid 2 cột, `max-height` ~120px, `overflow-y:auto`) — bám theo tỷ lệ trong ảnh mẫu.

## Việc KHÔNG làm trong lần này
- Không xây model "mỗi feature có danh sách quyền riêng do BA seed" — vẫn dùng chung 1 catalog 4
  quyền toàn cục cho mọi card, đúng như user xác nhận ("để tạm 4 Permission chuẩn").
- Không hiện thực icon lịch sử (audit trail theo từng policy) — chỉ đặt placeholder.
- Không đổi khối "Ma trận quyền theo tính năng" bên trong modal Thêm/Sửa Vai trò — modal đó vẫn
  giữ dạng bảng như hiện tại (không nằm trong scope ảnh mẫu).

## Kiểm thử
1. Backend: chạy migration trên DB dev của `identity-service`, chạy lại
   `IdentityServiceIntegrationTest` + `IdentityServiceHttpContractTest`
   (`mvn -pl services/identity-service test` hoặc tương đương), xác nhận không fail vì đếm số
   permission hay giả định code cũ.
2. Frontend: `cd frontend-angular && npm start` (proxy tới identity-service theo
   `proxy.conf.json`), mở `/phan-he/PH2/phan-quyen` → tab "Ma trận phân quyền": chọn Vai trò, xác
   nhận lưới card hiện đủ 12 chức năng, tick/untick checkbox + toggle, bấm "Lưu ma trận", tải lại
   trang để xác nhận đã lưu đúng qua `GET /api/roles`. Xác nhận tab "Quyền" đã biến mất và tab
   "Vai trò"/"Nhật ký" không bị ảnh hưởng.
3. Xác nhận icon lịch sử disabled không throw lỗi khi bấm; icon sửa mở đúng drawer với đúng
   feature/role đang chọn.

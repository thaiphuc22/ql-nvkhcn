# EPIC03 Coding Plan - Role & Permission

## Huong tiep can

Lam man rieng `/phan-quyen`, du lieu mock in-memory, nhung model dat theo huong backend de sau nay co the thay bang API.

EPIC03 duoc tach thanh cac lop:

- Role: system role va business role.
- Permission: quyen thao tac nhu view, create, edit, approve, reject, export, comment, sign.
- Feature: module/man hinh nghiep vu.
- Policy: role nao co permission nao tren feature nao.
- Scope: pham vi du lieu nhu own mission, own department, own center, all.

## Phase 1 - Data model

Tao `webapp/src/data/rbac.ts`:

- `SystemRoleCode`: `ADMIN`, `OPERATOR`, `VIEWER`.
- `BusinessRole`: dung lai `ROLES` tu `webapp/src/data/roles.ts`.
- `PermissionCode`: `VIEW`, `CREATE`, `EDIT`, `APPROVE`, `REJECT`, `RETURN`, `EXPORT`, `COMMENT`, `SIGN`, `CONFIGURE`, `AUDIT`.
- `FeatureCode`: `DASHBOARD`, `WORKLIST`, `MISSION`, `DOSSIER`, `PROCESS`, `FORM`, `ACTION_CONFIG`, `USER_ADMIN`, `ORG_ADMIN`, `RBAC_ADMIN`, `REPORT`, `AUDIT`.
- `DataScopeCode`: `OWN_MISSION`, `OWN_DEPARTMENT`, `OWN_CENTER`, `ALL`.
- `RolePermissionPolicy`: role + feature + permission list + data scope + enabled.

## Phase 2 - Permission engine

Tao `webapp/src/data/rbacEngine.ts`:

- `getPrincipal(user)`: suy ra system roles va business roles cua user hien tai.
- `getEffectivePermissions(user, feature, policies)`: gom permission tu cac policy dang bat.
- `hasPermission(user, feature, permission, policies)`: tra loi user co quyen hay khong.
- `getEffectiveDataScopes(user, feature, policies)`: tinh scope du lieu hieu luc.
- `canAccessFeature(user, feature, policies)`: co quyen vao feature hay khong.

Tam thoi giu cac ham cu trong `permissions.ts` de khong lam vo cac man dang chay. Sau do refactor dan sang engine moi.

## Phase 3 - UI `/phan-quyen`

Tao `webapp/src/pages/RolePermission.tsx` voi cac tab:

- Role Catalog: danh muc system role va business role.
- Permission Policies: bang policy role x feature x permissions x scope, co toggle enabled.
- Matrix: chon role de xem permission matrix theo feature.
- Simulator: chon user + feature + permission de kiem tra ket qua.

## Phase 4 - Routing/menu

Cap nhat `webapp/src/App.tsx`:

- Lazy load `RolePermission`.
- Them route `/phan-quyen`.
- Them menu item `Phan quyen` trong nhom `Quan tri to chuc`.
- Guard route bang `canManageSystem` trong phase dau.

## Phase 5 - Tich hop sau

Sau khi man `/phan-quyen` on dinh:

- Dong bo `actionAvailabilityPolicy.ts` dung permission registry chung.
- Chuyen menu guard trong `App.tsx` tu cac ham cu sang `canAccessFeature`.
- Nang cap `UserManagement` de gan system role, business role, data scope.
- Ap dung data scope cho danh sach nhiem vu, ho so, worklist, bao cao, audit.

## Quy tac thiet ke

- Mock in-memory, khong goi API that.
- Model giong backend: co id, code, enabled, created concept co the bo sung sau.
- Khong cho user tao permission tuy tien trong phase dau; permission la registry he thong.
- Policy duoc cau hinh, permission/action logic do he thong dinh nghia.

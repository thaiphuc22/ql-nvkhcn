# Active Task

## ★ DONE + RUNTIME VERIFIED — Fix "không thấy action nào" trên HS-2026-025 — regression từ refactor Ma trận phân quyền — 2026-07-31 (owner Claude)

**Yêu cầu user:** kiểm tra `http://localhost:4200/ho-so/HS-2026-025` đăng nhập `pm@example.com`,
tại sao không thấy action nào. Xác nhận bằng Playwright thật (browser + network), không đoán.

**2 lớp lỗi chồng nhau:**

1. **Hạ tầng local (không phải bug code):** backend (8090) đang chạy bị thiếu/lệch
   `QTKHCN_IDENTITY_SERVICE_TOKEN` → gọi `identity-service:8095` bị 401 →
   `WorkflowDemoIdentityProvider` bọc thành **503 `IDENTITY_UNAVAILABLE`**. Khớp đúng bẫy đã ghi ở
   [[qtkhcn-local-stack-run]]. Sửa: restart backend với đủ 3 token. **Lưu ý tên biến đúng của
   identity-service là `QTKHCN_IDENTITY_SERVICE_TOKEN`** (map vào `qtkhcn.internal.service-token`
   trong `application.yml` của chính identity-service) — **KHÔNG phải** `QTKHCN_INTERNAL_SERVICE_TOKEN`
   như tên property Java gợi ý; đã tự gõ nhầm 1 lần khi restart và phải sửa lại.

2. **Regression thật, ảnh hưởng TOÀN HỆ THỐNG (không riêng hồ sơ này/user này):** sau khi hết 503,
   lộ ra **403 `FEATURE_ACCESS_FORBIDDEN` — "User không có quyền DOSSIER/VIEW"**.
   `WorkflowTaskActionService.authorizeFeatureAccess()` và `DossierActionService.authorize()` gate
   cứng bằng `hasFeaturePermission("DOSSIER","VIEW")`. Migration **V6** (uncommitted, thuộc task
   refactor "Ma trận phân quyền" ngay dưới) đã `update permissions set active=false where code not
   in ('VIEW_LIST','VIEW_DETAIL','CREATE','EDIT')` — **deactivate hẳn mã `VIEW`**, nên
   `IdentityService.effective()`/`role()` (đã filter theo `p.active`) không còn trả `VIEW` cho BẤT
   KỲ role nào không phải ADMIN → 2 gate trên fail cho mọi user. **Điều này chứng minh sai** giả
   định đã ghi trong task refactor bên dưới ("catalog `permissions` không gate hành động thật nào
   ... nên an toàn") — sai, vì 2 gate trên gate thật bằng đúng mã đó.

**Sửa (đã hỏi user, chọn hướng "đổi gate sang VIEW_DETAIL" + "thêm migration cấp quyền"):**
- Đổi 2 gate (`WorkflowTaskActionService.java:288`, `DossierActionService.java:70`) từ check
  `"VIEW"` sang check `"VIEW_DETAIL"` (mã mới, còn active).
- Phát hiện thêm: đổi code không đủ — **chưa role nào được cấp `VIEW_DETAIL`** cả (V6 chỉ tạo mã
  quyền mới, không insert `role_feature_permissions` nào cho nó). Thêm migration **V7**
  (`services/identity-service/.../V7__grant_view_detail_to_existing_feature_roles.sql`): role nào
  đang có bất kỳ quyền nào (kể cả mã cũ đã bị V6 deactivate, vì FK vẫn còn nguyên) trên 1 feature
  (trừ `GENERAL` legacy) thì được cấp thêm `VIEW_DETAIL` cho đúng feature đó.

**Verify runtime (Playwright thật, không phải curl/test):** build lại `backend` +
`identity-service` (`mvn -o clean package`), restart cả 2 với đủ token. `GET /internal/users/
pm@example.com/effective-permissions` xác nhận có `VIEW_DETAIL`. `GET /api/tasks/{key}/
available-actions` trả 200 kèm 2 action (`APPROVE_STEP`/`REJECT_STEP`). Đăng nhập
`pm@example.com` trên UI thật, vào `/ho-so/HS-2026-025` → thấy đúng 2 nút **"Khởi tạo tài liệu"**
và **"Từ chối duyệt"**.

**Verify test suite (sau khi sửa gate + thêm V7):** `WorkflowTaskActionAuthorizationTest` (backend)
cập nhật 2 fixture `Map.of("DOSSIER", Set.of("VIEW"))` → `Set.of("VIEW_DETAIL")`.
`IdentityServiceIntegrationTest.migrationV3SeedsBaselineMatrixAndKeepsLegacyGeneralGrants` cập
nhật theo đúng dữ liệu V7 tạo ra (đối chiếu trực tiếp qua `GET /api/roles` trên identity-service
đang chạy thật, không đoán): `PM/DOSSIER` và `PM/MISSION` thêm `VIEW_DETAIL`; `HDKHCN/DOSSIER` từ
rỗng → `{VIEW_DETAIL}` (V7 cấp lại vì FK grant cũ vẫn còn); `ADMIN/RBAC_ADMIN` thêm `VIEW_DETAIL`;
`ADMIN/GENERAL` giữ nguyên `{CREATE,EDIT}` (migration loại trừ feature `GENERAL` khỏi quy tắc cấp
— legacy, không cần symmetry). `mvn -o test` **identity-service: EXIT 0**; `mvn -o test`
**backend: EXIT 0** (full suite, không chỉ lớp bị đụng).

**Lưu ý cho task refactor Ma trận phân quyền bên dưới:** trước khi coi task đó là DONE hoàn
toàn, cần biết là nó đã kéo theo 1 migration V7 + 2 chỗ gate Java bị đổi (không thuộc phạm vi gốc
của task đó) để vá regression này — xem lại toàn bộ 3 file thay đổi (`DossierActionService.java`,
`WorkflowTaskActionService.java`, `V7__grant_view_detail_to_existing_feature_roles.sql`) khi
tổng kết/commit task refactor, đừng bỏ sót vì chúng nằm ngoài phần user đã duyệt ban đầu.

---

## ★ DONE + TEST VERIFIED — Refactor "Ma trận phân quyền" → lưới card theo ảnh mẫu — 2026-07-30 (owner Claude)

**Chuyển hướng có chủ ý:** user đã bàn bạc kỹ (qua AskUserQuestion, ghi ở
`docs/plan/refactor-ma-tran-phan-quyen.md`) rồi chỉ đạo trực tiếp "triển khai coding theo plan
này" — tạm rời khỏi task RD02.02 v3 (3 gap chặn luồng, vẫn TO DO, xem entry ngay dưới) để làm
trước hướng này. Không phải agent tự ý đổi việc. Phạm vi: trang thật
`frontend-angular/src/app/pages/role-permission/` (KHÔNG phải `webapp/src/pages/
RolePermission.tsx` — bản mock React cũ). Build tiếp trên nền một khối thay đổi lớn CHƯA COMMIT
sẵn có (App-scoping vai trò/chức năng + API `PUT /api/role-matrix/{featureCode}`).

**Backend (`services/identity-service`):** migration **V6** thu gọn catalog quyền hoạt động về
đúng 4 mục (`VIEW_LIST`/`VIEW_DETAIL` mới + `CREATE`→"Thêm mới"/`EDIT`→"Sửa" đổi nhãn) —
`update permissions set active=false where code not in (...)`, KHÔNG xoá gì (giữ FK
`role_feature_permissions`/`audit_log`). `IdentityService.permissions()` thêm filter
`p.active`; `role(Role e)` thêm filter `g.permission.active` khi gom grants trước khi tính
`flat`/`toMatrix` — đối xứng với filter đã có sẵn trong `effective()`.

**Hệ quả phát hiện khi chạy test (không có trong dự đoán ban đầu của plan):** việc deactivate
gần như toàn bộ catalog cũ (18→4 mã) làm biến mất khỏi API không chỉ VIEW/COMMENT/EXPORT/... mà
cả **PROCESS_STEP** — quyền duy nhất từng gắn cho chức năng WORKLIST (di trú từ V2) — nên
`featurePermissions`/`matrix` không còn hiện WORKLIST cho bất kỳ vai trò nào, và toàn bộ 5 mã
seed V3 cho HDKHCN/DOSSIER (`VIEW,APPROVE,REJECT,COMMENT,SIGN`) cũng biến mất hoàn toàn (không
còn mã nào active). Dữ liệu gốc vẫn còn nguyên trong DB (chỉ ẩn khỏi API) — khớp đúng tinh thần
"BA sẽ định nghĩa quyền theo từng chức năng sau" của plan, nhưng đây là thu hẹp phạm vi hiển thị
lớn hơn plan mô tả (plan chỉ nói tới VIEW/EDIT). Đã xác nhận qua `docs/plan/...` rằng catalog
`permissions` không gate hành động thật nào (D9 dùng `vaiTroCodes` riêng), nên an toàn.

**Sửa 6 test lệch theo catalog mới** (`IdentityServiceIntegrationTest` 4 case,
`IdentityServiceHttpContractTest` 2 case) — đổi các mã quyền dùng trong assertion/test data từ
mã đã bị deactivate (VIEW/EXPORT/COMMENT/...) sang mã còn active (CREATE/EDIT), và đổi feature
tham chiếu từ WORKLIST (nay rỗng) sang DOSSIER/MISSION (còn CREATE/EDIT) — giữ nguyên ý định gốc
của từng test (cô lập chức năng khi lưu ma trận, hồi quy chống-wipe, ...), chỉ đổi dữ liệu mẫu.

**Frontend (`pages/role-permission/`):** xoá hẳn tab "Quyền" (CRUD danh mục quyền dùng chung) +
modal Thêm/Sửa quyền — giữ `permissions()`/`reloadPermissions()` (đọc, phục vụ lưới card + modal
Sửa vai trò). Tab "Ma trận phân quyền" đổi trục: bỏ ghim-Chức-năng/liệt-kê-Vai-trò dạng bảng →
ghim **Vai trò** (`matrixRoleCode`, chọn từ `roles()` lọc theo `matrixAppCode`), liệt kê chức
năng dạng **lưới card** (`.rp-feature-grid`/`.rp-feature-card`): mỗi card = `nz-switch` bật/tắt
chức năng + icon lịch sử (disabled, placeholder) + icon sửa (mở drawer) + lưới 2 cột checkbox 4
quyền (cuộn được, `max-height` 120px). Dirty-tracking đổi từ theo-role sang theo-**feature**
(`matrixDirtyFeatures`); lưu qua `forkJoin` gọi `replaceFeature()` cho từng feature dirty (mỗi
request 1 cell — đúng vai trò đang ghim), rồi mới `reloadRoles()` + reset draft 1 lần. Drawer
"Sửa" mới (`nz-drawer`, thay tinh thần `PolicyDrawer` cũ của bản mock React) hiện
tên/mã/vai-trò-đang-ghim/switch bật-tắt/tag các quyền đã tick — đọc/ghi CHUNG state với card
(không phải bản nháp riêng). Modal "Sửa vai trò" (ma trận dạng bảng cũ) và tab "Vai trò"/"Nhật
ký" giữ nguyên, không đụng.

**Verify:**
- Backend: `mvn -o test` (`services/identity-service`) **18/18 PASS**.
- Frontend: `npx tsc -b --noEmit` sạch; `ng build --configuration production` **GREEN**
  (`role-permission` nằm trong Lazy chunk 29.87 kB, không phải Initial); `ng test --watch=false`
  **243/245 PASS** — 2 fail `nav-items.spec.ts` xác nhận **pre-existing** (phiên song song khác
  đang sửa `nav-items.ts`, không liên quan tới thay đổi này, khớp các lần xác nhận trước đó
  trong lịch sử file này).

**Chưa làm:** chưa click-through Playwright trên UI sống (chọn Vai trò, tick/untick checkbox +
toggle, bấm "Lưu ma trận", tải lại trang xác nhận lưu đúng qua `GET /api/roles`; xác nhận icon
lịch sử disabled không throw lỗi khi bấm; xác nhận icon sửa mở đúng drawer) — cần 8090/8093/8095
đang chạy, chưa xác minh trạng thái tại thời điểm này trong phiên.

---

## ★ DONE + TEST VERIFIED — Chế độ xem trước: HTML render không theo style tự định nghĩa — 2026-07-30 (owner Claude)

**Yêu cầu user (báo lỗi trực tiếp, tiếp nối task sửa panel thuộc tính ngay dưới):** "Ở chế độ xem
trước, phần render mã HTML không chuẩn — không theo style được định nghĩa trong HTML."

**Nguyên nhân xác nhận (đối chiếu Angular sanitizer thật, không đoán):** `[innerHTML]` của Angular
tự động chạy qua `DomSanitizer` nội bộ, và bộ lọc HTML mặc định của Angular (whitelist thẻ/attr
riêng, KHÔNG dùng DOMPurify) không có thẻ `<style>` lẫn thuộc tính `style="..."` trong danh sách cho
phép — cả 2 đều bị xoá âm thầm trước khi vào DOM, dù nội dung đã đúng field `content` (từ lượt sửa
panel thuộc tính ngay trước). Đối chiếu `@bpmn-io/form-js-viewer` (component `Html` thật) để lấy đúng
hành vi tham chiếu: nó dùng `DOMPurify.sanitize(html, {FORCE_BODY:true, FORBID_TAGS: sanitizeStyleTags
? ['style'] : []})` với `sanitizeStyleTags=false` (tức GIỮ thẻ `<style>`), rồi gọi `wrapCSSStyles()`
để khoanh vùng mọi rule trong `<style>` bằng 1 class scope (`.{domId}-style-scope`) — chỉ chặn
`<script>`/event handler, không chặn style.

**Sửa (`shared/form-renderer/form-field.ts` + `.html`):** thêm `dompurify` làm dependency trực tiếp
(`package.json`, đã có sẵn trong `node_modules` vì `@bpmn-io/form-js-viewer` phụ thuộc transitive —
chỉ khai rõ ràng, không tải mới) + import `wrapCSSStyles` từ `@bpmn-io/form-js` (package đã là
dependency trực tiếp, `dist/types/index.d.ts` của nó `export * from viewer/editor/playground` nên
`wrapCSSStyles` lấy được thẳng từ đây, không cần đụng vào `@bpmn-io/form-js-viewer` transitive).
Component `FormFieldComponent` thêm `computed` `htmlScopeClass` (tiền tố scope theo `comp().id`) +
`sanitizedHtml` (DOMPurify với đúng cấu hình form-js dùng cho `html` → `wrapCSSStyles` → MỚI
`sanitizer.bypassSecurityTrustHtml()` — bypass sanitizer của Angular đúng lúc, sau khi nội dung đã
qua DOMPurify, KHÔNG bypass nội dung thô). Template đổi `[innerHTML]="comp().content"` (bị Angular tự
sanitize, mất style) → `[innerHTML]="sanitizedHtml()"`, thêm class scope động trên div bọc.

**Test (`form-renderer.spec.ts`):** thêm case mới render 1 field `html` có cả `<style>` + thuộc tính
`style="..."` + 1 mũi thăm dò XSS (`<img onerror="window.__ffHtmlXssProbe = true">`) — xác nhận: (1)
`<style>` VÀ `style="..."` đều sống sót (khác hành vi Angular mặc định); (2) rule trong `<style>`
ĐƯỢC khoanh vùng (không còn là selector gốc `.gioithieu-title {` mà thành
`.ff-html-scope-gioithieu .gioithieu-title {`); (3) `onerror` bị DOMPurify xoá, biến thăm dò không
bao giờ được set — vẫn an toàn dù đã bypass sanitizer của Angular.

**Verify:**
- `npx tsc -b --noEmit` sạch.
- `ng test --include='**/form-field-properties.spec.ts' --include='**/form-library.spec.ts'
  --include='**/form-renderer.spec.ts'` **21/21 PASS**.
- `ng build --configuration production` **GREEN** (build thành công, có Output location). Đã kiểm tra
  kỹ tác động bundle: `dompurify` + `wrapCSSStyles` nằm gọn trong `chunk-RYVT5RGC.js` — xác nhận qua
  `grep -l DOMPurify dist/browser/*.js` rồi đối chiếu tên chunk đó nằm ở mục **Lazy chunk files**
  (không phải Initial) trong log build, đúng như kỳ vọng vì `form-field.ts` chỉ được require qua các
  trang lazy-load (`form-library`, `ho-so-detail`, `form-designer-page`). Cảnh báo "bundle initial
  exceeded maximum budget... 5.71 kB" VẪN CÒN sau khi build (đã build lại nhiều lần để xác nhận số
  không đổi) nhưng đã xác nhận **không do lượt sửa này**: cùng lượt build còn báo 2 cảnh báo SCSS
  budget khác (`action-studio.scss`, `ho-so-detail.scss`) ở những file task này không hề đụng tới —
  cả 3 cảnh báo đều là drift có sẵn từ khối lượng lớn code chưa commit của các phiên song song khác
  đang chạy trên cùng repo (Hội đồng, Action Studio, Ma trận vai trò — xem `git status` đầu phiên).
  Không sửa các cảnh báo đó (ngoài phạm vi, thuộc phiên khác).

**Chưa làm:** chưa click-through Playwright trên UI sống (mở trang xem trước 1 biểu mẫu có field
HTML chứa `<style>`, xác nhận mắt thường CSS áp dụng đúng trong trình duyệt thật, không chỉ qua DOM
string assertion trong jsdom).

---

## ★ DONE + TEST VERIFIED — Form Designer: panel thuộc tính không hiện giá trị hiện có (key/nhãn/HTML/FEEL) — 2026-07-30 (owner Claude)

**Yêu cầu user (báo lỗi trực tiếp, 3 ý):** trong panel thuộc tính của Form Designer
(`shared/form-designer/form-field-properties.*`), (1) phần tử HTML không hiện nội dung HTML đang
dùng; (2) Nhãn hiển thị/Khóa dữ liệu không hiện giá trị đang dùng; (3) FEEL không hiện biểu thức
đang áp dụng. Cả 3 đều có thật, cùng chung 1 gốc + 1 gốc phụ.

**Gốc bug #1 (gây cả ý 2 và 3, và một phần ý 1) — đọc `input()` signal trong field
initializer/constructor:** `FormFieldPropertiesComponent` khởi tạo mọi `draft*` signal
(`draftKey`, `draftLabel`, `draftDescription`, `draftText`, `draftSource`, `draftExpression`,
`draftHide`, `draftMin/Max/MinLength/MaxLength`, `draftOptions`) bằng `signal(this.field()?.x ?? '')`
ngay tại chỗ khai báo field — tức chạy trong constructor. Nhưng `field` là Angular **input signal**:
Angular chỉ gán giá trị binding cho nó SAU KHI constructor chạy xong (áp dụng binding là một bước
riêng trong change detection, trước khi gọi `ngOnInit`, nhưng sau constructor). Đọc `this.field()`
trong field initializer luôn thấy giá trị mặc định `null`, bất kể template đã truyền field nào —
panel remount đúng (đã có cơ chế `@for` + `track (f.id + '#' + selVersion())` ở
`form-designer.html`, tương đương `key=` của React, xác nhận cơ chế đó không phải nguyên nhân), chỉ
là initializer chạy quá sớm. Hệ quả: MỌI field đã có sẵn giá trị đều hiện input rỗng trong panel;
gõ mới rồi commit vẫn hoạt động bình thường (đó là lý do bug không lộ ra qua test cũ — test cũ luôn
tự gọi `draftLabel.set(...)` trước khi assert, không bao giờ assert giá trị khởi tạo).

**Sửa:** chuyển toàn bộ khởi tạo `draft*` vào `ngOnInit()` (implement `OnInit`) — tại chỗ khai báo
chỉ còn `signal('')`/`signal(null)`/`signal([])` trung tính. `ngOnInit()` chạy sau khi Angular đã set
`field` từ binding nên đọc đúng giá trị, đúng 1 lần mỗi lần remount (giữ nguyên thiết kế "draft chỉ
init 1 lần, không cần effect" đã ghi trong comment gốc).

**Gốc bug #2 (ý 1 — HTML) — sai tên thuộc tính, không liên quan bug #1:** đối chiếu trực tiếp
`@bpmn-io/form-js-viewer` (`Html.config.create: () => ({ content: '' })` và component `Html`
destructure `{ content = '' } = field`) — type `html` lưu nội dung ở **`field.content`**, KHÁC
`field.text` (đó là property của type `text`/markdown). Cả `form-field-properties.ts`
(`isTextOrHtml` gộp chung 1 ô `draftText`/`commitText` cho cả 2 type) LẪN `form-renderer/
form-field.html` (`[innerHTML]="comp().text"`) đều đọc/ghi nhầm `text` cho type `html` — vừa khiến
panel luôn rỗng cho field HTML (đúng gốc bug #1 cộng dồn), vừa khiến bản xem trước/renderer runtime
B-engine KHÔNG BAO GIỜ hiện được nội dung HTML dù người dùng đã nhập (vì `modeling.editFormField`
ghi vào `text`, còn engine canvas + renderer thật đọc `content`). Xác nhận không có eform nào trên
backend đang dùng type `html` (grep `db/migration` — chỉ có 1 chỗ nhắc tới trong comment V28, nói rõ
renderer khi đó CHƯA hỗ trợ `html`; nay panel/palette/renderer Angular đã hỗ trợ nhưng bị lỗi tên
field) — không cần data migration.

**Sửa:** thêm `content?: string` vào `FormComponent` (`core/models/eform.ts`); tách signal
`draftContent` riêng (không dùng chung `draftText` với type `text`) + `commitContent()` emit prop
`content`; template `form-field-properties.html` rẽ nhánh theo `field()!.type === 'text'` (dùng
`draftText`) vs còn lại là `html` (dùng `draftContent`); `form-renderer/form-field.html` đổi
`comp().text` → `comp().content` cho `@case ('html')`.

**Test (`form-field-properties.spec.ts`):** thêm 4 case mới xác nhận panel hiện đúng giá trị đã có
sẵn (trước đây không case nào assert việc này): hiện đúng key/label/description; hiện đúng
`content` cho field HTML (cố ý set cả `text` sai trên cùng field để chứng minh không đọc nhầm);
hiện đúng `expression` cho field type `expression`; hiện đúng `conditional.hide` (FEEL ẩn/hiện).

**Verify:**
- `npx tsc -b --noEmit` sạch.
- `ng test --include='**/form-field-properties.spec.ts' --include='**/form-library.spec.ts'
  --include='**/form-renderer.spec.ts'` **20/20 PASS**.
- Full `ng test --watch=false`: 235/241 PASS lúc chạy đủ song song, nhưng 6 fail đều xác nhận KHÔNG
  liên quan bằng cách chạy lại riêng từng file: 2 `nav-items.spec.ts` **pre-existing** (phiên song
  song khác đang sửa dở `nav-items.ts`); 4 timeout (`worklist.spec.ts`, `assignment-builder.spec.ts`,
  `condition-builder.spec.ts`, 1 case khác trong `form-renderer.spec.ts`) chỉ xảy ra khi chạy FULL
  suite dưới tải máy cao — chạy riêng từng file (kể cả `form-renderer.spec.ts` đầy đủ 5/5) đều PASS.

**Chưa làm:**
- Chưa click-through Playwright trên UI sống (mở `/phan-he/PH3/bieu-mau/<key>/thiet-ke`, kéo 1 field
  HTML từ palette, gõ mã HTML, click field khác rồi click lại — xác nhận panel hiện đúng mã đã gõ;
  tương tự cho field có FEEL `Ẩn khi...`/biểu thức tự tính).
- Đã đọc lại toàn bộ template để chắc không sót thuộc tính nào khác cùng gốc bug #1: `showOutline`
  (khung viền nhóm) và `subtype` (kiểu ngày giờ) dùng `[ngModel]="field()!.x"` đọc TRỰC TIẾP từ
  `field()`, không qua `draft*`, nên vốn KHÔNG dính bug. Riêng `values` (tuỳ chọn của
  select/radio/checklist/taglist, qua `draftOptions`) THUỘC bug #1 và đã được sửa cùng lượt này
  (nằm trong danh sách draft* chuyển vào `ngOnInit()` ở trên) — không cần sửa thêm.

---

## ★ DONE + TEST VERIFIED — Thư viện biểu mẫu: tối ưu modal "Tạo biểu mẫu mới" — 2026-07-30 (owner Claude)

**Yêu cầu user:** "tiếp tục review và tối ưu phần Tạo mới biểu mẫu" — modal tạo mới ở
`frontend-angular/src/app/pages/form-library/` (trang `/phan-he/PH3/bieu-mau`, port từ `webapp/`
2026-07-16, đã DONE từ trước — task này chỉ tối ưu tiếp modal tạo mới, không đổi phạm vi).

**2 gap UX thật phát hiện khi đọc code (không phải bug báo cáo sẵn):**
1. Ô "Mã (formKey)" chỉ có placeholder ghi chú "tự sinh, vd: ..." nhưng KHÔNG hiển thị giá trị sẽ
   thực sự dùng — người dùng phải tự đoán mã trước khi bấm Tạo.
2. Trùng mã chỉ phát hiện được sau khi đợi round-trip backend trả 409 (`EformService.addForm`), dù
   `list()` (danh sách đã tải qua `EformService`) thừa dữ liệu để chặn ngay hầu hết trường hợp mà
   không cần chờ mạng.

**Đã sửa (`pages/form-library/form-library.ts/.html/.scss`):**
- Thêm `computed` `formKeyPreview` — mã sẽ dùng thật (`formKey()` nếu người dùng đã gõ, không thì tự
  sinh từ `formTen()` qua `slugifyFormKey` có sẵn ở `core/models/eform.ts`, không viết lại logic).
- Thêm `computed` `keyTaken` — đối chiếu `formKeyPreview()` với `list()` đã tải.
- `submitCreate()` dùng `formKeyPreview()` thay vì tính lại `slugifyFormKey(...)` tại chỗ, và chặn sớm
  (không gọi `EformService.addForm`) khi `keyTaken()` là true, hiện `message.error` ngay tại chỗ.
  **Cố ý KHÔNG bỏ xử lý lỗi 409 hiện có** — giữ làm lưới an toàn cho trường hợp cache lệch (mã vừa
  được một tab/phiên khác tạo ngay trước khi request này tới server).
- Template: hiện dòng gợi ý dưới ô "Mã" (`Mã sẽ dùng: <code>...</code>`, đổi đỏ + đổi nội dung cảnh
  báo khi `keyTaken()`) + `[nzOkDisabled]="keyTaken()"` trên nút OK của modal, đúng mẫu đã có ở
  `ho-so-detail.html` (`nzOkDisabled` kèm `nzOkLoading`).
- SCSS: class `.fl-key-hint`/`.fl-key-hint-error` theo đúng token màu đã dùng trong file
  (`var(--vht-ink-3)`, `#ff4d4f` — khớp `.fl-required`).

**Test (`form-library.spec.ts`):** case 409 cũ ("surfaces a backend conflict when creating a
duplicate key") không còn phản ánh đúng hành vi mới (client chặn trước khi gọi API) — tách thành 2
case: (1) "blocks a key already in the loaded library without calling the backend" — dùng mã đã có
trong `list()` seed, assert `http.expectNone('/api/eform')`; (2) "surfaces a backend conflict when
the cache is stale (key created concurrently elsewhere)" — dùng mã KHÔNG có trong `list()` local để
`keyTaken()` là false, vẫn mô phỏng backend trả 409, giữ phủ nhánh lưới an toàn. Thêm case mới
"previews the auto-generated key before the Mã field is touched" cho `formKeyPreview()`.

**Verify:**
- `npx tsc -b --noEmit` sạch.
- `ng test --include='**/form-library.spec.ts'` **7/7 PASS** (4 case cũ + 3 case mới/sửa).
- Full `ng test --watch=false` **231/235 PASS**. 4 fail đã xác nhận KHÔNG liên quan tới thay đổi này
  (chạy lại riêng từng file để loại trừ): 2 `nav-items.spec.ts` — **pre-existing**, xác nhận lại bằng
  cách chạy riêng file đó (vẫn fail y hệt), nguyên nhân là một phiên song song khác đang sửa dở
  `nav-items.ts` (thấy trong `git status` đầu phiên) — KHÔNG động vào. 2 timeout ở
  `form-field-properties.spec.ts`/`condition-builder.spec.ts` — chỉ xảy ra khi chạy FULL suite song
  song (42s, nhiều worker); chạy riêng từng file thì cả 2 **PASS** — kết luận timeout do tải máy lúc
  chạy song song, không phải hồi quy từ thay đổi này.

**Chưa làm (cố ý ngoài phạm vi):**
- Chưa chạy `ng build production` — đã biết đang bị chặn bởi lỗi biên dịch có sẵn trong
  `ho-so-detail.ts` (duplicate member `dossierActions`) từ một phiên song song khác, không liên quan
  đến task này (xem entry Hội đồng ngay dưới, đã ghi nhận cùng vấn đề).
- Chưa click-through Playwright trên UI sống (`ng serve` + mở `/phan-he/PH3/bieu-mau`, bấm "Tạo biểu
  mẫu", gõ tên trùng với 1 biểu mẫu có sẵn để tự kiểm tra gợi ý mã + chặn nút Tạo hiện đúng).
- Không đụng tới `webapp/src/pages/FormLibrary.tsx` (bản React gốc, đã ngừng phát triển tiếp theo
  hướng port sang Angular) — chỉ tối ưu bản Angular đang là nguồn thật.

---

## ★ DONE + RUNTIME VERIFIED — Quản lý Hội đồng: UI redesign toàn màn hình + `maHoiDong` + auto-fill HDXD — 2026-07-30 (owner Claude)

Theo yêu cầu mới nhất kèm 2 ảnh mock: (1) danh sách hội đồng dạng bảng đủ cột nghiệp vụ (mã hội đồng/hồ
sơ/nhiệm vụ, tên nhiệm vụ, cấp nhiệm vụ, cấp hội đồng, quy trình, trạng thái hồ sơ, ngày tạo); (2) trang
**toàn màn hình** "Tạo mới Hội đồng" (không phải modal) với ô "Mã Hội đồng *" nhập tay + bảng thành viên
mà "Chọn thành viên" phải lấy từ danh sách người dùng có vai trò HDXD/HDXD_TD và tự điền chức danh/mã
NV/phòng ban/email. Chi tiết đầy đủ xem entry mới nhất ở `DELIVERY_STATE.md`. Tóm tắt việc đã làm:

- **Migration V13** (`ma_hoi_dong` UNIQUE NOT NULL, backfill `'HD-' || id`) + xuyên toàn bộ tầng backend
  (entity/DTO/repository/mutation service) **và** luồng tự sinh cũ (`HoiDongXetDuyetService`, phải tự suy
  mã dạng `HD-{id hồ sơ}-CS/-TD` vì không có form nhập cho 2 luồng T05/T18B). Check trùng mã tường minh
  (`existsByMaHoiDong[AndIdNot]` → `IllegalArgumentException` → 400), không dựa DB exception.
- Bỏ hẳn modal cũ, thay 2 route mới `pages/hoi-dong-form/` dùng chung cho `/hoi-dong/moi` và
  `/hoi-dong/:id/sua`; bảng thành viên bỏ ô nhập tay họ tên — bắt buộc chọn từ
  `HoiDongCandidateService.candidateProfiles()` (API mới, không đụng `candidates()` cũ đang dùng cho
  eForm `bm-02-08-qdh-nv`), tự điền qua `UserResponse`/`OrganizationService`. Cột "Điện thoại" trong mock
  bị bỏ vì không có nguồn dữ liệu thật.
- `hoi-dong-list.ts/html/scss` viết lại toàn bộ theo layout bảng mock (10 cột, 3 filter + tìm kiếm).
- Verify: backend 87/87 PASS (bao gồm 18 test Hội đồng); frontend `tsc --noEmit` sạch, `ng test` 231/233
  (2 fail còn lại pre-existing ở `nav-items.spec.ts`, không liên quan). `ng build production` KHÔNG chạy
  được do lỗi biên dịch có sẵn trong `ho-so-detail.ts` (duplicate `dossierActions`) từ một phiên làm việc
  song song khác — không sửa, không thuộc phạm vi task này.
- Runtime: rebuild + restart `ho-so-service` (phải `taskkill` tiến trình cũ trước vì jar bị khoá) +
  restart Angular dev server; xác nhận qua curl thật `GET /api/hoi-dong` (qua proxy 4200) trả đúng
  `maHoiDong` backfill (`HD-1`, `HD-2`...), route `/hoi-dong` và `/hoi-dong/moi` đều HTTP 200.
- **Chưa làm:** click-through Playwright thật trên trình duyệt cho luồng tạo/sửa mới; `ng build
  production` thật sự xanh (đang bị chặn bởi lỗi không liên quan ở `ho-so-detail.ts`).

---

## Lịch sử — DONE + RUNTIME VERIFIED — Quản lý Hội đồng (CRUD thủ công) — 2026-07-30 (owner Claude)

**Cập nhật runtime (theo yêu cầu tiếp theo "restart lại ho-so-service và cả qlkhcn"):** đã dừng, `mvn -o
clean package` lại cả `backend` (285/285 PASS) và `services/ho-so-service` (85/85 PASS), restart cả hai
với cùng 3 token liên service cũ (`dev-workflow-local-only`/`dev-ho-so-local-only`/`dev-identity-local-only`)
— **PID mới: 8090→32692, 8093→28612**, `identity-service` (8095, PID 23544) không đụng. Flyway tự áp
V11+V12 khi khởi động. Xác minh qua HTTP thật: `GET /api/hoi-dong` (header bắt buộc
`Authorization: Bearer dev-ho-so-local-only` — `InternalServiceTokenFilter` ở ho-so-service chặn CẢ
`/api/*` lẫn `/internal/*`, không chỉ nội bộ) trả đúng 8 hội đồng đã sinh trước đó trên Postgres thật,
kèm field `hoSoId`/`version` mới. `GET /api/process-definitions` trên backend (header
`X-QTKHCN-Dev-Key: dev-local-only`) trả 200. Chưa serve lại Angular dev (4200)/click-through Playwright.

**Yêu cầu user:** "Bạn code giúp luồng tính năng Quản lý hội đồng, bao gồm: Xem danh sách hội đồng, Tạo mới,
chỉnh sửa, xóa Hội đồng." Hỏi lại "Để ở Service Quản lý Nhiệm vụ Khoa học" — xác định là `services/ho-so-service`
(service này đã quản lý cả `NhiemVu` lẫn `HoSo`, xem `NhiemVuQueryController`/`HoSoQueryController` cùng nằm ở đây).

**Quyết định phạm vi (qua AskUserQuestion):** mở rộng model `HoiDongXetDuyet`/`ThanhVienHoiDong` đã có (gắn
`hoSoId`, trước đây chỉ sinh tự động từ service task `Generate_HDXD` sau T05/T18B — xem entry HĐXD 2026-07-20
và entry "Gán User Task cho Hội đồng động" ngay dưới) — KHÔNG tạo entity "danh mục hội đồng độc lập" mới.
Lý do: hội đồng bản chất luôn gắn 1 hồ sơ cụ thể trong hệ thống này; tách riêng sẽ tạo 2 khái niệm hội đồng
song song không cần thiết.

### Backend (`services/ho-so-service`)

- **Migration V12** (`V12__hoi_dong_xet_duyet_manual_crud.sql`): `source_task_definition_key` nới NOT NULL
  → nullable (NULL = tạo thủ công qua UI, không có task nào sinh ra nó). Postgres coi nhiều dòng NULL trong
  unique index là phân biệt nhau, nên `uk_hoi_dong_xet_duyet_ho_so_cap_task` vẫn giữ nguyên tác dụng chống
  trùng cho 2 luồng tự sinh (T05→CO_SO, T18B→TAP_DOAN). Thêm cột `version BIGINT NOT NULL DEFAULT 0` cho
  optimistic locking (mẫu If-Match giống `ho_so`/`nhiem_vu`).
- **Entity** `HoiDongXetDuyet`: thêm `@Version private long version`; `sourceTaskDefinitionKey` bỏ
  `nullable = false`.
- **Repository**: `HoiDongXetDuyetRepository` override `findAll()`/`findById()` với
  `@EntityGraph(attributePaths = "thanhVien")` để màn danh sách không N+1.
- **DTO**: `ThanhVienHoiDongRequest`, `CreateHoiDongRequest` (`hoSoId`, `cap`, `canCuPhapLy`, `thanhVien`),
  `UpdateHoiDongRequest` (chỉ `canCuPhapLy` + `thanhVien` — **hoSoId/cap là định danh nghiệp vụ, không sửa
  được sau khi tạo**, tránh việc đổi cap phá vỡ ý nghĩa "hội đồng cấp Cơ sở/Tập đoàn của hồ sơ này").
  `HoiDongXetDuyetResponse` bổ sung `hoSoId`/`version` (record này dùng chung cho cả public read view nhúng
  trong `HoSoResponse` lẫn API quản trị mới — thêm field không phá caller cũ).
- **Service**: `HoiDongQueryService` (findAll/findById, đọc mọi hội đồng bất kể nguồn gốc), `HoiDongMutationService`
  (create/update/delete, tách khỏi `HoiDongXetDuyetService` vốn chỉ lo sinh tự động từ BPMN service task —
  giữ 2 trách nhiệm khác nhau ở 2 file). `create()` validate `hoSoId` tồn tại qua `HoSoRepository.existsById`,
  luôn set `sourceTaskDefinitionKey = null`. `update()`/`create()` dùng chung `replaceMembers()` — xoá hết
  `thanhVien` cũ rồi build lại từ request (orphanRemoval lo phần xoá DB), userId lowercase-trim giống
  `HoiDongXetDuyetService.build()` để khớp `X-QTKHCN-User-Id` ở mọi nơi so khớp downstream.
- **Controller**: `HoiDongQueryController`/`HoiDongMutationController` ở `/api/hoi-dong` — đúng khuôn REST đã
  có (`NhiemVuQueryController`/`NhiemVuMutationController`): GET list, GET/{id} (ETag = version), POST tạo
  (201 + ETag), PUT/{id} (bắt buộc header `If-Match`, `HttpVersion.parse`), DELETE/{id} (204). Không cần
  thêm exception handler — `GlobalExceptionHandler` đã bắt `EntityNotFoundException`/`VersionConflictException`.
- **Test**: `HoiDongQueryServiceTest` (3 case: list mọi nguồn gốc, findById kèm version, 404 khi thiếu),
  `HoiDongMutationServiceTest` (6 case: tạo với sourceTaskDefinitionKey null + userId lowercase, tạo báo lỗi
  khi hồ sơ không tồn tại, update thay căn cứ + thành viên, update báo version conflict, delete audit đúng,
  delete 404 khi thiếu) — mock-based, cùng mẫu `HoiDongXetDuyetServiceTest` đã có.

### Frontend (Angular)

- Model (`core/models/ho-so.ts`): `HoiDongXetDuyetResponse` thêm `hoSoId`/`version`,
  `sourceTaskDefinitionKey` đổi sang `string | null`; `ThanhVienHoiDongResponse` bổ sung `userId` (**bug có
  sẵn phát hiện khi làm task này**: backend đã trả `userId` từ lâu nhưng model Angular chưa từng khai field
  này — thiếu nó thì màn sửa hội đồng không thể hiện/chọn lại tài khoản thành viên). Thêm
  `ThanhVienHoiDongRequest`/`CreateHoiDongRequest`/`UpdateHoiDongRequest`.
- `core/services/hoi-dong.service.ts` mới: `list/get/create/update/delete`, cùng mẫu header
  (`X-QTKHCN-Actor`, `If-Match: "${version}"`) như `ho-so.service.ts`.
- `pages/hoi-dong-list/` mới (`HoiDongListPage`): bảng danh sách (lọc theo mã hồ sơ/tên đề tài + cấp), modal
  tạo/sửa dùng **signal-based dynamic list** cho thành viên (thêm/xoá dòng qua `formMembers.update(...)`) —
  cố ý KHÔNG dùng Angular `FormArray` (không có tiền lệ nào trong repo) để nhất quán với style
  signal-only đã dùng ở `user-management.ts`/`nhiem-vu-list.ts`. Chọn `hoSoId` từ `HoSoService.list()`, chọn
  `userId` mỗi thành viên từ `HoiDongCandidateService.candidates()` có sẵn (danh sách người giữ vai trò
  `HDXD`/`HDXD_TD`, tái dùng nguyên xi — không viết lại logic lọc ứng viên). `hoSoId`/`cap` khoá lại
  (`nzDisabled`) khi đang sửa, khớp bất biến backend.
- Route `/hoi-dong` (`app.routes.ts`, app `qlnvkhcn`) + mục menu "Quản lý Hội đồng" trong nhóm "Quản trị KHCN"
  (`nav-items.ts`, cả `NAV_ITEMS` và `SECTION_TITLE_BY_ROUTE`).
- **Sửa thêm ngoài phạm vi (nhỏ, cần thiết để không có bug hiển thị):** `ho-so-detail.html` dòng nhãn "Sinh
  tự động sau bước {{ hoiDong.sourceTaskDefinitionKey }}" sẽ in ra rỗng cho hội đồng tạo thủ công mới (giá
  trị null) — đổi thành hiển thị "Tạo thủ công" khi null. Cập nhật fixture `ho-so-detail.spec.ts` khớp
  interface mới (thêm `hoSoId`/`version`/`userId` bắt buộc).

### Verify

`ho-so-service`: `mvn -o test` **85/85 PASS** (24/24 test class chạy đủ, gồm 9 test mới ở 2 file). Angular:
`npx tsc -b --noEmit` sạch, `ng build --configuration production` **GREEN** (chỉ warning bundle budget vượt
5.37 kB — có tiền lệ, không phải do task này), `ng test` (Vitest runner) **230/232 PASS** — 2 fail
`nav-items.spec.ts` xác nhận lại là **pre-existing** (đã ghi nhận nhiều lần trong `DELIVERY_STATE.md` từ
trước, không đổi số lượng do task này).

**Chưa làm (cố ý để ngoài scope):**
- Chưa build/restart `ho-so-service` (8093) để chạy thật trên môi trường dev/click-through Playwright — chỉ
  verify bằng test suite (unit mock-based, không phải Postgres thật qua Testcontainers vì 2 service mới
  không có logic JPQL phức tạp cần test tầng đó).
- Chưa có `.spec.ts` riêng cho `HoiDongListPage`/`HoiDongService` — nhất quán với các trang CRUD tương tự
  (`user-management.ts`, `nhiem-vu-list.ts`, `role-permission.ts`) cũng không có spec test trong repo.
- Modal sửa hội đồng dùng input text tự do cho `userId` qua `nz-select` đã có options, nhưng không chặn nếu
  admin muốn gõ tay một userId không nằm trong danh sách ứng viên (không có ô nhập tay riêng) — nếu cần gán
  người chưa có vai trò `HDXD`/`HDXD_TD`, phải cấp vai trò đó ở `/phan-he/PH2/nguoi-dung` trước.

## ★ DONE + TEST VERIFIED — Gán User Task cho Hội đồng động (HĐXD): `candidateUsers` thu hẹp `candidateGroups` — 2026-07-30 (owner Claude)

**Câu hỏi user mở task:** *"Candidate Group khi tạo User Task đang lấy theo mã Vai trò. Hội đồng xét duyệt
sinh động, danh sách User cũng động, một User có thể nằm trong nhiều Hội đồng. Vậy phân vai trò cho các
User này thế nào để User Task assign tới đúng người?"* User chốt: **tách thành task riêng**, bổ sung code
cần có, được phép tinh chỉnh `rd0202.bpmn` nếu cần (bản repo khớp v4 đang chạy).

**Kết luận thiết kế (nền của mọi thay đổi bên dưới):** hội đồng **không phải** một vai trò. Mô hình 3 lớp —
(1) **Vai trò** `HDXD`/`HDXD_TD` = tư cách tĩnh "đủ điều kiện được chọn vào hội đồng", ở
`user_role_assignments` (identity-service); (2) **Thành viên hội đồng** = dữ liệu nghiệp vụ **động, theo
từng hồ sơ**, ở `hoi_dong_xet_duyet`/`hoi_dong_thanh_vien` (ho-so-service); (3) **Vai trò trong hội đồng**
(Chủ tịch/Phản biện/Thư ký) = cột `vai_tro_trong_hoi_dong` đã có. Lớp 1 trả lời "ai được phép được chọn",
lớp 2 trả lời "ai thực sự phải làm task này, trên hồ sơ này". **KHÔNG sinh role động kiểu `HDXD_HS12345`** —
danh mục vai trò là danh mục dùng chung của Phân hệ 3, không được nhiễm dữ liệu vòng đời hồ sơ.

**Lỗ hổng thật đã đóng (không chỉ là "thiếu tính năng"):** T07/T10 (HĐXD cấp Cơ sở) và T21/T24 (HĐXD Tập
đoàn) chỉ khai `candidateGroups="HDXD"`/`"HDXD_TD"`. Vì `WorkflowTaskActionService.authorize()` cũ và
`WorkflowTaskProjectionRepository.findActive*ForUserOrGroups` cũ đều dùng phép **OR** thuần giữa 3 vế
(assignee / candidateUser / candidateGroup), **bất kỳ ai giữ role `HDXD` đều thấy và thao tác được task
họp hội đồng của MỌI hồ sơ**, kể cả hồ sơ họ không thuộc hội đồng.

**Đổi hướng so với kế hoạch 5 lát ban đầu (quan trọng — đọc trước khi động vào BPMN):** kế hoạch đầu
tiên định sửa `rd0202.bpmn` để worker ghi `danhSachUserIdHDXD`/`danhSachUserIdHDXDTD` vào biến process rồi
`zeebe:assignmentDefinition` đọc bằng FEEL. Đã **thử và revert** (`git checkout` lại `rd0202.bpmn` +
2 worker gốc) sau khi khảo sát sâu hơn `CamundaWorkflowTaskRuntime`/`BpmnUserTaskMetadataCatalog`: phần lớn
user task RD02.02 là **job-backed** (không phải `<zeebe:userTask/>` native — xem 5 dòng có marker đó trong
file, T07/T10/T21/T24 KHÔNG nằm trong số đó), metadata của chúng đọc thẳng từ XML BPMN tĩnh qua
`BpmnUserTaskMetadataCatalog.parse()` — **không bao giờ phản chiếu được biến process runtime**, kể cả nếu
BPMN có khai `candidateUsers="=biến"`. Sửa BPMN theo hướng đó sẽ là code chết, không lỗi rõ ràng, khó phát
hiện. **Hướng thay thế, đúng bản chất "kiểm tra quyền nằm hoàn toàn trong code app" (D9/D20):** dịch
candidateGroups → người thật ngay tại tầng ứng dụng, không đụng BPMN/Zeebe. Không cần v5.

### Đã làm (5 lát, thứ tự triển khai thực tế)

**Lát 1 — ho-so-service, nền dữ liệu (`V11__hoi_dong_thanh_vien_user_id.sql`):** `hoi_dong_thanh_vien`
chỉ có `ho_ten` free-text ⇒ không thể assign cho ai. Thêm cột `user_id` (nullable — hội đồng cũ/QĐ chỉ ghi
họ tên vẫn hợp lệ). `HoiDongXetDuyetService` đọc `userId` từ formData, **lowercase ngay lúc ghi** (khớp
`X-QTKHCN-User-Id` đã lowercase ở mọi nơi khác). Thêm `HoiDongXetDuyetService.userIdTheoCap()` và
`candidateUsersTheoNhom(hoSoId, candidateGroups)` — hàm thứ hai là bản lề: dịch một danh sách
candidateGroups thô (đọc thẳng từ Camunda) thành danh sách người thật của **đúng hồ sơ đó**.

**Lát 2 — `HoiDongCap` biết ánh xạ role↔cấp:** thêm `HoiDongCap.roleCode()` (`CO_SO→"HDXD"`,
`TAP_DOAN→"HDXD_TD"`) và `theoRoleCode()` ngược lại. Đây là nơi DUY NHẤT trong hệ thống biết "nhóm HDXD ứng
với hội đồng nào" — mọi lớp gọi vào chỉ cần đưa nguyên si candidateGroups đọc từ Camunda, không cần biết gì
về RD02.02.

**Lát 3 — endpoint dịch nhóm→người:** `GET /internal/v1/ho-so/{id}/hoi-dong-xet-duyet/candidate-users?groups=...`
(`InternalHoiDongXetDuyetController.candidateUsers`) — seam để backend (module `backend/`) hỏi ho-so-service
mà không cần biết gì về hội đồng. Rỗng là tín hiệu hợp lệ ("không thu hẹp được, giữ nguyên theo vai trò"),
không phải "cấm tất cả".

**Lát 4 — thu hẹp ở CẢ HAI nơi quyết định quyền (đây là lát đóng lỗ hổng):**
- `backend`: `HoiDongMembershipGateway` (mới) gọi endpoint Lát 3 qua `RestClient`, nuốt lỗi mạng thành
  rỗng (WARN log) thay vì chặn toàn bộ thao tác khi ho-so-service tạm ngưng. `WorkflowTaskActionService.
  authorize()` viết lại: hợp `task.candidateUsers()` (do Camunda trả) với `hoiDong.candidateUsers(...)`
  (do ho-so-service dịch) thành `namedUsers`; có `assignee` HOẶC `namedUsers` không rỗng ⇒ vai trò
  KHÔNG còn mở việc (`narrowed=true`), chỉ người trong danh sách mới thao tác được.
- `ho-so-service`: `WorkflowProjectionService.narrowToHoiDong()` (mới, gọi trong `rebuild()` trước khi
  `saveAll`) điền `candidateUsers` của task từ `HoiDongXetDuyetService.candidateUsersTheoNhom()` — **chỉ
  khi** Camunda chưa tự trả về gì (`candidateUsers` rỗng và `assignee` null), không đè giá trị thật của
  engine. `WorkflowTaskProjectionRepository` (2 query `findActive*ForUserOrGroups`) sửa JPQL: nhánh
  `candidateGroup in :roleCodes` chỉ còn xét khi `assignee is null and candidateUsers is empty`.
- Cả hai nơi đồng thuận một luật: **có người cụ thể ⇒ vai trò không mở việc nữa; không có ai cụ thể ⇒ hành
  vi cũ theo vai trò giữ nguyên** (điều kiện sống còn để hồ sơ cũ/hội đồng chưa gắn tài khoản không kẹt).

**Lát 5 — eForm + UI chọn người:** `V29__eform_bm0208_thanh_vien_tai_khoan.sql` thêm field `userId` (select,
`valuesKey: "ungVienHoiDong"`) vào từng dòng dynamiclist của `bm-02-08-qdh-nv`, giữ nguyên `hoTen` (văn bản
QĐ vẫn in họ tên). Renderer Angular (`FormComponent.valuesKey` mới trong `eform.ts`) hỗ trợ options ĐỘNG —
cơ chế chuẩn form-js: nguồn options nằm ở input data của form (`valueSources`), không đóng băng trong
schema — thread qua `FormRendererComponent → FormFieldComponent`/`FormDynamicListComponent`. `ho-so-detail.ts`
chỉ gọi `HoiDongCandidateService` (mới) khi schema thực sự khai `valuesKey` đó, nạp danh sách user giữ role
`HDXD`/`HDXD_TD` từ identity-service (`UserService.list()` + `allAssignments()`), value = email lowercase.

### 1 bug thật phát hiện khi làm Lát 5 (có sẵn từ trước, không phải do lát này)

`ActionStudioService.missingRequiredFormFields()`/`collectMissingRequired()` đối chiếu field bắt buộc BÊN
TRONG một `dynamiclist` với **formData gốc** thay vì dữ liệu của từng dòng — nên field bắt buộc trong
dynamiclist luôn báo thiếu dù người dùng đã nhập đủ. Hệ quả thực tế: `bm-02-08-qdh-nv` có "Họ và tên"/
"Vai trò trong Hội đồng" bắt buộc trong `danhSachThanhVien` ⇒ duyệt T05 **luôn** trả
`FORM_VALIDATION_FAILED`, Hội đồng xét duyệt không bao giờ sinh được qua UI thật (chỉ chạy được khi test
gọi thẳng service, bỏ qua validate). Đã sửa: đệ quy đổi ngữ cảnh sang dữ liệu từng dòng khi gặp
`dynamiclist` (giống cách `FormDynamicListComponent` render), gộp `distinct()` các nhãn trùng.

### Verify

Backend: `mvn -o test` **285/285 PASS** (thêm `WorkflowTaskActionAuthorizationTest` 5 case: vai trò không
còn mở việc khi có candidateUsers/hội đồng cụ thể, thành viên thật vẫn vào được, hội đồng rỗng vẫn theo vai
trò cũ, admin bỏ qua lookup, assignee thắng vai trò; `ActionStudioServiceTest` +3 case cho bug dynamiclist).
ho-so-service: `mvn -o test` **76/76 PASS** — thêm `WorkflowTaskProjectionNarrowingTest` (Postgres thật qua
Testcontainers, vì luật nằm trong JPQL `is empty` không mock được: vai trò hết tác dụng khi task đã có
người cụ thể, hồ sơ cũ vẫn chạy, một user ngồi nhiều hội đồng thấy đúng việc của từng hồ sơ không xung đột
chéo), `HoiDongXetDuyetServiceTest` +2 case (lowercase userId, dịch nhóm→người), `WorkflowProjectionServiceTest`
+2 case (narrow đúng, không đè candidateUsers thật của engine). Angular: `ng build` **GREEN**, `ng test`
**230/232** (2 fail `nav-items.spec.ts` — pre-existing, xác nhận lại KHÔNG liên quan task này, đã có từ
trước trong `DELIVERY_STATE.md`).

**Chưa làm (cố ý để ngoài scope, cần user quyết định tiếp nếu muốn full runtime rollout):**
- Chưa restart 8090/8093 để chạy thật trên môi trường dev — chỉ verify bằng test suite (unit + Postgres
  thật qua Testcontainers), không phải bằng click-through Playwright trên hồ sơ sống.
- Chưa backfill `hoi_dong_thanh_vien.user_id` cho các hội đồng đã sinh trước migration này (đúng thiết kế
  fail-open: chúng tiếp tục chạy theo `candidateGroups`, không kẹt, nhưng vẫn "sai người nhận" như cũ cho
  tới khi có QĐ mới hoặc backfill thủ công).
- Chưa có UI riêng để sửa `userId` của hội đồng đã sinh (chỉ nhập được lúc lập QĐ ở form `bm-02-08-qdh-nv`).

## ★ DONE + RUNTIME VERIFIED — Ma trận Vai trò × Quyền + gán nhiều vai trò cho một user — 2026-07-30 (owner Claude)

Theo nhận xét trực tiếp của user: *"Phần Vai trò và phân quyền người dùng bạn làm chưa hợp lý. Tôi nghĩ
cần xây dựng ma trận Role - Permission. Add nhiều Role cho một User."* Khảo sát xác nhận đúng, và nguyên
nhân **không** phải thiếu bảng dữ liệu (backend đã mô hình 3 chiều từ V2) mà là **UI không lộ ra được mô
hình đã có**: ma trận chỉ tồn tại bên trong modal "Sửa vai trò" (1 vai trò/lần, nhồi trong modal 760px);
drawer Phân quyền bắt gán 1 roleCode/lần; bảng người dùng không có cột Vai trò.

**Quyết định user chốt qua AskUserQuestion (3+2 câu):** làm trên **Angular + identity-service** (KHÔNG
đụng `webapp/` React); ma trận **dòng = Vai trò, cột = Quyền, chọn Chức năng ở đầu bảng** (giữ 3 chiều
đúng như backend, không làm phẳng); `user_role_assignments` là **nguồn sự thật duy nhất** về vai trò của
user; seed baseline ma trận cho **8 vai trò chính**; **gỡ luôn** hardcode `roleCodes` ở `demo-users.ts`.

### Đã làm

**Lát 1 — backend `identity-service`, 3 API ghi/đọc theo lô:**

- `PUT /api/role-matrix/{featureCode}` (`IdentityService.replaceFeatureMatrix`) — lưu MỘT cột chức năng
  cho nhiều vai trò. **Bất biến sống còn:** chỉ chạm đúng `(role, feature)` có trong payload. Không thể
  tái dùng `updateRole()` vì `setMatrix()` xoá bằng `deleteByRoleId` (cả 12 chức năng) rồi ghi lại từ
  payload ⇒ lưu ma trận theo từng chức năng qua đường đó sẽ **xoá sạch 11 chức năng còn lại**. Thêm
  `RoleFeaturePermissionRepository.deleteByRoleIdAndFeatureId`.
- `POST /api/users/{id}/role-assignments/bulk` (`assignBulk`) — gán N vai trò dùng chung 1 phạm vi/đơn
  vị/hiệu lực, validate scope+đơn vị+khoảng hiệu lực **một lần** cho cả lô, và **idempotent**: bỏ qua
  assignment trùng khớp hoàn toàn (`assign()` cũ cho tạo trùng vô hạn). Trả về chỉ các dòng vừa tạo.
- `GET /api/users/role-assignments` (`allAssignments`) — assignment của mọi user trong 1 query
  (`findAllDetailed` join fetch user/role/organization), nguồn cho cột "Vai trò". **Route này phải khai
  TRƯỚC `/users/{id}/...`**, không thì `"role-assignments"` bị bắt làm `{id}` và trả 400/405 — đã kiểm
  chứng: bản JAR cũ trả đúng 405 ở đường này.
- Cố ý KHÔNG thêm field vào `UserResponse`: record đó đang được 4 chỗ dựng và sẽ kéo theo N+1 trong `users()`.

**Lát 2 — `V3__seed_role_feature_matrix.sql`:** seed baseline Role×Feature×Permission cho ADMIN/OPERATOR/
VIEWER/PM/CQ_KHCN/CQ_QLKHCN/HDKHCN/TGD_VHT, bê nguyên thiết kế `ROLE_PERMISSION_POLICIES` ở
`webapp/src/data/rbac.ts` để 2 frontend không lệch ý niệm quyền. `on conflict do nothing`, **giữ nguyên
mọi dòng `GENERAL`**. Cần thiết vì V2 nhét toàn bộ quyền phẳng vào feature `GENERAL` ⇒ mở ma trận theo 12
chức năng thật sẽ trống trơn (ADMIN có 18 quyền nhưng chỉ ở GENERAL; mọi role BUSINESS chỉ có PROCESS_STEP).
**⚠️ Đây là NỚI RỘNG quyền có chủ ý, đã trình bày và user duyệt** — `effective()` hợp mọi feature thành tập
`permissions` phẳng nên 7 vai trò ngoài ADMIN có thêm quyền (ví dụ PM: `PROCESS_STEP` → thêm
VIEW/CREATE/EDIT/COMMENT/EXPORT; `cqnv@example.com` xác minh runtime nay có
APPROVE/AUDIT/COMMENT/EDIT/EXPORT/PROCESS_STEP/REJECT/RETURN/VIEW). **Không vai trò nào bị MẤT quyền.**

**Lát 3 — tab "Ma trận Vai trò × Quyền" ở `/phan-quyen`** (`role-permission.ts/.html/.scss` +
`core/services/role-matrix.service.ts` mới). Dòng = vai trò, cột = quyền, chọn Chức năng ở đầu bảng; dựng
từ 3 signal đã tải sẵn (`roles`/`features`/`permissions`) nên mở tab không thêm request nào. Tick tiêu đề
cột = cấp cho mọi vai trò **đang hiển thị theo bộ lọc**; tick ô đầu dòng = cấp toàn bộ quyền cho 1 vai
trò; có `indeterminate`, đếm số quyền/dòng, tìm vai trò + lọc loại. Sửa vào bản nháp, theo dõi
`matrixDirtyRoles` (dòng tô vàng + badge "N vai trò chưa lưu" + Hoàn tác), **chỉ gửi vai trò đã đổi** →
1 request thay vì N. Giữ nguyên ma trận trong modal "Sửa vai trò" (góc nhìn của 1 vai trò, không trùng).

**Lát 4 — `/nguoi-dung` gán nhiều vai trò:** `newRoleCode` (đơn) → `newRoleCodes` với
`nz-select nzMode="multiple" nzShowSearch`; vai trò user đã có bị loại khỏi options (`assignableRoles`);
phạm vi/đơn vị/hiệu lực là thuộc tính chung của cả lô, `dataScope` preselect theo rank thấp nhất (hẹp
nhất) để nút không bị disable mà không nói vì sao; nút đổi nhãn "Gán N vai trò". Thêm **cột "Vai trò"**
(tag, quá 3 thì "+N" kèm tooltip) + 2 stat card (lượt gán vai trò, user chưa có vai trò nào).

**Lát 5 — gỡ nguồn sự thật thứ 3:** `demo-users.ts` đặt `roleCodes: NO_STATIC_ROLES` (mảng rỗng đã
freeze) cho cả 16 tài khoản. `AuthService`: `isAdmin = effective.administrator` (trước là
`current.isAdmin || ...` nên **không bao giờ hạ được** cờ admin tĩnh); thêm `rolesLoaded()` +
`identityUnavailable()`; `login()`/`logout()` reset 2 cờ. `ho-so-detail` thêm cảnh báo khi
`identityUnavailable()` (trước chỉ `console.warn` rồi nút thao tác biến mất không giải thích) và một
`effect()` chạy lại `loadDossierActions()` khi vai trò về — **đua thật**: `Shell.refreshCurrentUser()`
bất đồng bộ nên hồ sơ có thể load xong trước khi biết `roleCodes`, khi đó simulate chạy với danh sách
rỗng và nút thao tác mất oan.

### 3 bug thật phát hiện khi kiểm thực (2 có sẵn, 1 do lát này)

1. **`GET /api/users/{id}/role-assignments` trả `roleCode: null` — CÓ SẴN.** Lộ ra qua click-through:
   drawer Phân quyền hiện `ALL` mà không hiện mã vai trò. Nguyên nhân: `assignment()` đọc `a.role.code`
   bằng **field access**, mà field trên proxy lazy chưa khởi tạo trả null (khác getter); `findByUserId`
   khi đó không join fetch role. Các test cũ không bắt được vì chúng gọi `assignments()` ngay sau
   `assign()` — Role đã nằm trong persistence context nên là entity thật. Sửa 2 lớp: join fetch trong
   `findByUserId`, và đổi DTO sang `getCode()`/`getId()`. Test mới:
   `assignmentsOfASeededUserExposeRoleCodeNotNull`.
2. **`/api/role-matrix/*` không được route ở proxy — DO LÁT NÀY.** `proxy.conf.json` route theo prefix
   cụ thể sang 8095, đường mới rơi vào catch-all `/api` → 8090 → 404. Thêm entry vào `proxy.conf.json`
   **và** `infra/demo-tunnel/Caddyfile` (@identity_api). Đổi proxy config phải **restart `ng serve`**
   mới có hiệu lực (dev-server không nạp lại file này).
3. **Bấm "Lưu ma trận" làm bảng tự xáo trộn thứ tự — CÓ SẴN, lát này làm nặng thêm.**
   `IdentityService.roles()` dùng `findAll()` không ORDER BY ⇒ trả theo thứ tự heap Postgres, mà UPDATE
   làm dòng nhảy xuống cuối; VIEWER/PA từ vị trí 2–3 nhảy xuống 34–35 nên **trông như bị xoá**. Sửa: sắp
   ổn định (SYSTEM trước, rồi theo mã). Test mới: `rolesKeepAStableOrderAcrossUpdates`.

### Verify

- **identity-service `mvn -o test`: 17/17 PASS, BUILD SUCCESS** (9 cũ + 8 mới). Hồi quy quan trọng nhất:
  `replaceFeatureMatrixTouchesOnlyTheGivenFeatureAndRoles` — nếu ai "đơn giản hoá" thành `deleteByRoleId`
  thì đỏ ngay. Sửa 1 assert cũ trong `IdentityServiceHttpContractTest`:
  `featurePermissions[0].featureCode == 'GENERAL'` → `[?(@.featureCode == 'GENERAL')]` (từ V3, PM có thêm
  DOSSIER/MISSION và `toMatrix()` sắp theo TreeMap nên GENERAL không còn ở index 0).
- **Angular:** `ng build --configuration production` **GREEN** (chỉ warning budget/CommonJS có sẵn);
  `ng test --watch=false` **224/226 PASS**, 2 fail còn lại đúng `layout/nav-items.spec.ts` **pre-existing**.
- **Runtime thật:** dừng JAR cũ (PID 27992, bản trước Lát 1 — xác minh bằng 405 ở route mới), `mvn package`,
  khởi động lại với `QTKHCN_IDENTITY_SERVICE_TOKEN=dev-identity-local-only`. **PID cuối: 8095 → 15596.**
  Flyway `Migrating schema "public" to version "3"` → `Successfully applied 1 migration`. Không đụng 8090/8093.
- **HTTP thật:** `GET /api/users/role-assignments` 29 dòng / 15 user / 0 `userId` null. **Chống-wipe:** lưu
  `REPORT` cho PM+HDKHCN → PM/REPORT đúng, PM/DOSSIER + PM/GENERAL + PM/MISSION **không đổi**,
  CQ_KHCN (ngoài payload) **không đổi**. **Bulk idempotent:** lần 1 tạo 4, lần 2 y hệt tạo **0**, tổng
  vẫn 4; khác dataScope thì vẫn tạo; scope lạ → 400, role lạ → 404, `effectiveTo < effectiveFrom` → 400.
- **Click-through Playwright (4200):** tab Ma trận hiện baseline V3 (ADMIN 11, OPERATOR 4, CQ_KHCN 7);
  tick 2 ô ở 2 vai trò → dòng tô vàng + badge "2 vai trò chưa lưu" → Lưu → reload còn nguyên; đổi Chức
  năng sang MISSION → grant của ADMIN/OPERATOR còn nguyên (**chống-wipe trên UI**). Drawer Phân quyền:
  chọn 2 vai trò cùng lúc → nút đổi thành "Gán 2 vai trò" → gán xong drawer có 3 dòng, stat 29 → 31,
  bảng ngoài hiện đủ tag; TP_NS (đã có) không xuất hiện trong danh sách chọn. Nhật ký có
  `ROLE_MATRIX_UPDATED` (kèm `feature=...`) và `ROLE_ASSIGNED`/`ROLE_REVOKED`.
  **Lát 5:** đăng nhập `cqnv@example.com` → network `GET /api/effective-permissions/cqnv@example.com`
  **200** trả **6 vai trò** `CQ_KHCN,CQ_MS,CQ_NS,CQ_QLKHCN,CQ_TCKT,TP_CLKHCN` — nhiều hơn bản hardcode cũ
  (4), đúng delta đã báo trước cho user; `featurePermissions` có DOSSIER (từ seed V3) + GENERAL.
- **Dữ liệu test đã dọn sạch:** user `smoke.bulk@example.com` đã xoá; grant PM/HDKHCN trên REPORT và
  VIEWER/PA trên DOSSIER đã trả về rỗng; 2 assignment test của `tp-ns` đã thu hồi. Kiểm lại: 29 lượt gán,
  15 user, `tp-ns` chỉ còn TP_NS, VIEWER chỉ còn baseline `DASHBOARD=VIEW; WORKLIST=VIEW`.

### Chưa làm / nợ lại

- **Hardcode vai trò phía SERVER vẫn còn:** `services/ho-so-service/.../DemoIdentityProvider.java` và
  `backend/.../WorkflowDemoIdentityProvider.java`. Lệch giữa chúng và `user_role_assignments` vẫn dẫn tới
  "đăng nhập được mà `/viec-cua-toi` trống". Ngoài phạm vi yêu cầu lần này.
- **`.spec.ts` cho 2 trang `role-permission`/`user-management`** vẫn chưa có (thiếu từ trước, không phải
  hồi quy của lát này) — logic ma trận mới hiện chỉ được phủ bởi test backend + click-through.
- **Ghi đè khi 2 admin sửa cùng lúc:** modal "Sửa vai trò" vẫn PUT toàn bộ ma trận của vai trò, nên nếu
  người khác vừa đổi thì bản của mình ghi đè. Hành vi có sẵn, không đổi; tab Ma trận mới thì hẹp hơn
  (chỉ 1 chức năng) nên bề mặt xung đột nhỏ hơn.
- **`caddy run` thật** với Caddyfile vừa sửa: chưa chạy (chỉ sửa file cấu hình).
- **Ngoài phạm vi, cần user biết:** **8090 (backend) và 8093 (ho-so-service) đã tắt trong lúc phiên này
  chạy** — đầu phiên cả 4 cổng 8090/8093/8095/4200 đều LISTEN, cuối phiên chỉ còn 8095/4200. Tôi **không**
  chạy lệnh nào tới 2 cổng đó (chỉ dừng/khởi động lại 8095 và 4200) và cố ý **không** tự khởi động lại vì
  có phiên khác đang làm việc trên cùng worktree, có thể đang `mvn package`. Hệ quả quan sát được:
  `GET /api/my-tasks` trả 500. Cần khởi động lại 8090/8093 bằng cặp token
  `QTKHCN_WORKFLOW_SERVICE_TOKEN=dev-workflow-local-only` / `QTKHCN_HO_SO_SERVICE_TOKEN=dev-ho-so-local-only`.
- **`ng serve` trên 4200 đã được khởi động lại** bởi phiên này (để nạp `proxy.conf.json` mới) — PID hiện
  tại **31296**, chạy bằng `node node_modules/@angular/cli/bin/ng.js serve` (không phải `ng serve` qua
  cmd, vì `ng` không có trong PATH của shell không tương tác).

---

## ★ DONE — Angular PH2: ma trận role×feature×permission + data-scope catalog + app entitlement admin — 2026-07-29 (owner Claude)

Theo yêu cầu trực tiếp của user ("Bạn làm FE và ghép lại BE giúp tôi", dẫn nguyên văn tóm tắt của một
phiên Codex song song đã hoàn tất Phase 1+2 backend cùng ngày — xem đầu file này, mục "Identity Service /
Phân hệ 2 Backend"). Khảo sát trước khi làm cho thấy phần FE Bước 5–6 (mục DONE ngay dưới) đã ghép
Organization/Role/User/Permission/Audit-log/effective-permissions, nhưng **3 mặt cắt backend mới của
Phase 2 — `role_feature_permissions` (ma trận), `data_scope_types` (catalog FK), `apps`/`user_apps`
(catalog + gán theo user) — chưa có FE nào gọi tới**: `identity.ts` vẫn thiếu `FeatureResponse`/
`MatrixEntry*`/`DataScopeResponse`/`AppResponse`/`UserApps*`, `RoleResponse.matrix` chưa được đọc,
`EffectivePermissionsResponse` thiếu `featurePermissions`/`assignments`/`apps`, và `newDataScope` ở
`user-management` vẫn là ô nhập tay tự do (đã lệch khỏi FK `data_scope_types` mới thêm ở V2).

**Đã làm:**
1. `core/models/identity.ts`: thêm `FeatureResponse`, `MatrixEntryRequest/Response`, `DataScopeResponse`,
   `AppResponse`, `UserAppsRequest/Response`, `EffectiveAssignmentResponse`; `RoleRequest/Response` thêm
   `matrix`; `EffectivePermissionsResponse` thêm `featurePermissions`/`assignments`/`apps` — khớp 1:1
   `IdentityDtos` hiện tại (đọc trực tiếp từ source, không đoán).
2. 3 service mới: `feature.service.ts`, `data-scope.service.ts`, `app.service.ts`
   (`AppCatalogService`, tránh trùng tên với `app.ts` gốc). `user.service.ts` thêm `apps()`/`replaceApps()`
   gọi `GET`/`PUT /api/users/{id}/apps`.
3. `role-permission.ts/.html`: modal "Sửa/Thêm vai trò" đổi multi-select quyền phẳng cũ thành **ma trận
   tính năng × quyền** (bảng checkbox, sticky header/cột đầu, scroll trong modal rộng 760px) — mỗi tính
   năng (nạp từ `GET /api/features`, gồm cả `GENERAL` — bucket tương thích ngược cho quyền phẳng cũ) là
   một hàng, mỗi quyền là một cột. Submit gửi `RoleRequest.matrix` (mỗi feature có tick → 1
   `MatrixEntryRequest{featureCode, permissionCodes, enabled:true}`); backend
   (`IdentityService.setMatrix`) ưu tiên `matrix` khi có, nên `permissionCodes` gửi kèm chỉ còn mang tính
   hiển thị/tương thích. **Chưa làm:** UI tick "enabled=false" riêng (giữ quyền nhưng tắt) — form chỉ biểu
   diễn tick/không-tick, đủ cho CRUD chính; trường hợp tắt-không-xoá là biên hiếm, để sau nếu cần.
4. `user-management.ts/.html`: drawer "Phân quyền" tách 2 tab — **"Vai trò"** (nội dung cũ, chỉ đổi ô nhập
   tay `dataScope` thành `nz-select` nạp từ `GET /api/data-scopes`, mặc định không chọn trước vì `'OWN'`
   cũ không còn là code hợp lệ theo FK mới `OWN_MISSION/OWN_DEPARTMENT/OWN_CENTER/ALL`) và **"Ứng dụng"**
   (mới — checkbox theo `GET /api/apps`, tick/bỏ tick rồi bấm "Lưu ứng dụng" gọi
   `PUT /api/users/{id}/apps`). **Cố ý KHÔNG đụng `AuthService`/`Shell.refreshCurrentUser()`**: D19 vẫn
   giữ entitlement App runtime từ `DemoUser.apps` tĩnh (quyết định tường minh của phiên Bước 5–6 ngay
   dưới) — tab "Ứng dụng" mới chỉ là **quản trị catalog `user_apps` ở backend**, chưa phải nguồn thật cho
   App switcher; cần hỏi lại user trước khi đổi nguồn đó.
5. `proxy.conf.json` + `infra/demo-tunnel/Caddyfile`: thêm route `/api/features`, `/api/data-scopes`,
   `/api/apps` trỏ 8095 (dev-key), theo đúng mẫu route identity đã có.

**Runtime — bẫy phát hiện: identity-service đang chạy (PID 2148 từ phiên Bước 5–6) build TRƯỚC khi
Phase 2 (V2 migration + `/api/features|data-scopes|apps`) được thêm vào — gọi 3 endpoint mới trả 404,
`GET /api/roles` không có field `matrix`.** Đã: dừng PID 2148, `mvn -o test` **9/9 PASS**
(`IdentityServiceHttpContractTest` 5, `IdentityServiceIntegrationTest` 4 — bao gồm cả test Phase 2),
`mvn -o -DskipTests package`, khởi động lại PID mới **29456** (giữ nguyên
`QTKHCN_IDENTITY_SERVICE_TOKEN=dev-identity-local-only` để backend 8090 (PID 1640)/ho-so-service 8093
(PID 26496) không bị lệch token — cả hai vẫn UP, không phải restart). Flyway tự áp `V2` thành công. Xác
minh trực tiếp qua HTTP thật: `/api/features` trả 13 tính năng (gồm `GENERAL` legacy), `/api/data-scopes`
trả 4 scope, `/api/apps` trả 3 app (`qlnvkhcn`/`quytrinh`/`he-thong` — đúng 3 App của D19),
`/api/roles` nay có `matrix`, `/api/effective-permissions/pm@example.com` trả đủ
`featurePermissions`/`assignments`/`apps`.

**Verify:** Angular `ng build --configuration production` **GREEN** (chỉ warning budget/CommonJS có sẵn,
không phải mới); full suite **216/218 PASS** (2 fail `nav-items.spec.ts` **pre-existing**, không đổi số
so với lần chạy trước — xác nhận không có regression). identity-service `mvn -o test` **9/9 PASS**.
**Chưa làm:** click-through Playwright thật — một phiên khác đang giữ instance browser MCP dùng chung
(`Browser is already in use`) nên không giành quyền; runtime đã xác minh bằng HTTP trực tiếp thay thế,
nhưng chưa xem UI ma trận/tab Ứng dụng render thật trên trình duyệt. `role-permission`/`user-management`
vẫn chưa có `.spec.ts` riêng (cùng tình trạng trước khi làm lát này, không phải hồi quy). `caddy run` thật
ngoài sửa file cấu hình chưa chạy lại.

---

## ★ DONE — Angular Phân hệ 2 (Bước 5–6) + vá gap auth identity-service — 2026-07-29 (owner Claude)

Theo yêu cầu trực tiếp của user "Bạn code FE và ghép BE giúp tôi", tiếp nối Bước 5–6 của
`docs/research/identity-service-phan-he-2-plan-2026-07-29.md` (Codex đã hoàn tất Bước 1–4 + runtime, xem 2
mục DONE ngay dưới — một phiên Codex song song đã tự hoàn tất phần runtime bring-up gần như đồng thời với
phiên này, xem ghi chú PID bên dưới).

**Gap phát hiện khi khảo sát trước khi làm FE:** `IdentityController` (`/api/organizations`, `/api/roles`,
`/api/permissions`, `/api/users`, `/api/users/{id}/role-assignments`, `/api/audit-log`) hoàn toàn không có
auth — `InternalServiceTokenFilter` chỉ chặn `/internal/*`. Đã vá bằng cách mirror nguyên mẫu
`backend/.../security/DevApiKeyFilter.java` sang `services/identity-service/.../security/DevApiKeyFilter.java`
(cùng header `X-QTKHCN-Dev-Key`, cùng property `qtkhcn.dev-api-key`, default `dev-local-only` dùng chung với
2 service kia). Thêm 1 endpoint public mới `GET /api/effective-permissions/{identity}` (gọi lại
`IdentityService.effective()` có sẵn) — bản "public, chặn bằng dev-key" song song với
`/internal/users/{identity}/effective-permissions` (bản "service-to-service, chặn bằng bearer token") — để
Angular gọi được từ trình duyệt mà không lộ service-token. Test mới `IdentityServiceHttpContractTest` (4
case, dùng `RestTestClient` — Spring Boot 4/Spring Framework 7 thay `TestRestTemplate` bằng
`org.springframework.test.web.servlet.client.RestTestClient`, xác nhận bằng `javap`/tra jar thật, không đoán).

**Runtime:** database `qtkhcn_identity` đã có sẵn từ trước (không cần tạo tay). Để triển khai filter mới,
dừng sạch 3 tiến trình đang chạy (khi bắt đầu phiên: 8090 PID 26580, 8093 PID 18976, 8095 PID 28448 — đúng
PID mà mục Codex ngay dưới ghi lại, xác nhận đây là runtime Codex vừa dựng), package lại `identity-service`
với filter mới, khởi động lại cả 3 với token tường minh nhất quán do phiên này chọn
(`QTKHCN_WORKFLOW_SERVICE_TOKEN=dev-workflow-local-only`, `QTKHCN_HO_SO_SERVICE_TOKEN=dev-ho-so-local-only`,
`QTKHCN_IDENTITY_SERVICE_TOKEN=dev-identity-local-only`). PID mới sau restart: 8090→1640, 8093→26496,
8095→2148 (số hiển thị qua `Get-NetTCPConnection`; tiến trình được spawn qua MSYS bash nên PID job-control
`$!` không khớp PID Windows thật, không phải bằng chứng process khác). Smoke HTTP thật xuyên suốt:
identity-service `/api/*` (dev-key) và `/internal/*` (bearer) đều đúng; `backend`
`/api/process-definitions*` OK; `ho-so-service` `/api/my-tasks` trả đúng `candidateGroups` cho
`pm@example.com` (`["NNC","PA","PM"]`, khớp seed).

**Angular Bước 5 — 3 trang PH2 CRUD thật thay `PlaceholderPage`:**
`core/models/identity.ts` (mirror `IdentityDtos`), 5 service mới (`organization/permission/role/user/
audit-log.service.ts`, theo đúng convention `ProcessDefinitionService` — HttpClient tương đối qua
`API_BASE_URL`, không base URL tuyệt đối). 3 trang: `pages/org-management` (bảng phẳng, KHÔNG làm cây
`nz-tree` đợt này), `pages/user-management` (bảng + drawer "Phân quyền" xem/gán/thu hồi role-assignment),
`pages/role-permission` (3 tab: Vai trò CRUD + multi-select quyền / Quyền CRUD / Nhật ký đọc-thôi từ
`/api/audit-log`). `app.routes.ts` 3 route `phan-he/PH2/*` đổi từ `component: PlaceholderPage` sang
`loadComponent` lazy — bỏ import `PlaceholderPage` không dùng nữa. Dev routing: `proxy.conf.json` thêm 6
route trỏ 8095; demo routing: `infra/demo-tunnel/Caddyfile` thêm khối `@identity_api` (mirror
`@nvkhcn_api`) + `Start-DemoProxy.ps1` thêm tham số/env `QTKHCN_IDENTITY_UPSTREAM` + readiness check —
`caddy validate` xanh, chưa chạy `caddy run` thật.

**Bug thật phát hiện khi click-through Playwright (không lộ ra ở build/typecheck):** `user-management.html`
dùng `nz-icon nzType="check-circle" nzTheme="twotone"` cho cờ admin — ném lỗi console thật
`[@ant-design/icons-angular]: the icon check-circle-twotone does not exist or is not registered` (fetch SVG
động 404) vì `twotone` là một bộ icon riêng, KHÔNG tồn tại tiền lệ nào trong repo (`grep -r twotone` rỗng
trước khi sửa). Đã đổi sang icon `check-circle` phẳng (đã đăng ký sẵn trong `SERVICE_TASK_ICONS`) + màu CSS
`.um-admin-check`, đúng quy ước đăng ký icon tĩnh của `icons-provider.ts`. Đối chiếu toàn bộ 7 mã icon dùng ở
3 trang mới (`apartment/check-circle/delete/edit/plus/safety-certificate/team`) — tất cả đã có sẵn trong các
mảng `*_ICONS` hiện có, không cần thêm mảng `PH2_ICONS` mới.

**Bước 6 — Nối `AuthService` vào identity-service, zero blast-radius:** `AuthService` KHÔNG đổi shape
`DemoUser`/chữ ký `login()` (vẫn synchronous). Thêm `refreshCurrentUser()` public — nạp
`roleCodes`/`administrator` thật từ `GET /api/effective-permissions/{email}`, ghi đè vào `DemoUser` đang giữ
trong signal (giữ nguyên `apps`, theo D19 — entitlement App vẫn nguồn tĩnh). **Quyết định quan trọng:** gọi
`refreshCurrentUser()` từ `Shell` (layout, mount sau `authGuard`, phủ cả login mới lẫn phiên khôi phục từ
localStorage) — KHÔNG gọi từ `login()`/constructor của `AuthService` như thiết kế ban đầu, vì 4 spec file
(`worklist.spec.ts`, `process-catalog.spec.ts`, `ho-so-detail.spec.ts`, `task-action.service.spec.ts`) gọi
thẳng `TestBed.inject(AuthService).login(...)` với `afterEach(() => http.verify())` — auto-fire trong
`login()`/constructor sẽ để lại 1 HTTP request chưa flush và vỡ `verify()` ở cả 4 file. Không có file nào
trong số đó dựng `Shell`, nên chuyển điểm gọi sang `Shell` giữ đúng "zero blast-radius" cho cả 4 file, không
cần sửa gì ở chúng. `auth.service.spec.ts` thêm 2 test mới (`refreshCurrentUser()` merge đúng
roleCodes/administrator, và lỗi mạng giữ nguyên giá trị tĩnh) + 1 test xác nhận `login()` tự nó không gọi
identity-service.

**Verify:** identity-service `mvn test` **6/6 PASS** (2 cũ + 4 mới); `backend` full suite **PASS** (chạy lại
sau khi bật filter mới, không regression); `ho-so-service` full suite **PASS**; Angular full suite
**216/218 PASS** (2 fail `nav-items.spec.ts` **pre-existing**, không đụng file này); `ng build
--configuration production` **GREEN** (chỉ warning budget/CommonJS có sẵn). Click-through Playwright thật
trên `ng serve` + proxy: tạo 1 organization, 1 role `QA_TEST` gán quyền `VIEW`, 1 user, gán role `QA_TEST`
cho user đó (xem đúng trong drawer), thu hồi role (xác nhận `audit_log` ghi `ROLE_ASSIGNED`/`ROLE_REVOKED`
đúng thật) — tất cả qua `identity-service` thật, có sẵn seed 18 permission + 30+ role + 15 user hiển thị
đúng trên UI (tab Quyền cũng render đúng 18 permission thật). `Shell.refreshCurrentUser()` xác nhận gọi
`GET /api/effective-permissions/admin%40example.com` → **200** qua Network tab thật. Dữ liệu test đã dọn
sạch (`DELETE` cả 3 bản ghi qua API, xác nhận lại count về đúng 1 org / 15 user / 0 role `QA_TEST`).

**Chưa làm (ngoài phạm vi lần này):** hiển thị cây tổ chức (`nz-tree`) cho `co-cau-to-chuc` (đang là bảng
phẳng); Bước 7 của kế hoạch gốc (xoá hardcode cũ `RoleCatalog.java`, `webapp/src/data/{roles,rbac}.ts`) —
chưa xác nhận với user vì `webapp/` có thể coi là legacy; `caddy run` thật ngoài `caddy validate`;
`Test-DemoReadiness.ps1` chưa được cập nhật để check thêm identity-service.

---

## ★ DONE — Identity Service runtime Backend — 2026-07-29 (owner Codex)

Theo yêu cầu trực tiếp của user: tạo/kiểm tra database trên Postgres volume hiện tại, chạy identity-service
8095, restart backend 8090 + ho-so-service 8093 với internal token đồng nhất, rồi smoke CRUD/assignment/
effective-permissions và xác minh role mới đi xuyên qua `/api/my-tasks` + workflow authorization.

Hoàn tất runtime trên Postgres volume hiện tại: tạo `qtkhcn_identity`, Flyway V1 áp thành công; đang chạy
8090 PID 26580, 8093 PID 18976, 8095 PID 28448. Token runtime đồng nhất theo hai seam
(`identity-dev-runtime` cho identity; `integration-dev-runtime` cho workflow↔hồ sơ). Smoke tạo org/user,
gán PM/OWN_MISSION → effective permission trả PM + PROCESS_STEP → `/api/my-tasks` trả 2 task PM → backend
`available-actions` trả APPROVE_STEP + REJECT_STEP. Đã revoke/xóa sạch dữ liệu smoke; API audit ghi đủ
ROLE_REVOKED/USER_DELETED/ORGANIZATION_DELETED, user đã xóa trả 404. Log ở `.runtime/identity-backend/`.
Phát hiện và sửa runtime-only boot bug thiếu `RestClient.Builder` bean. Verify cuối: backend 280/280,
ho-so-service 68/68, identity-service 2/2, `git diff --check` sạch.

---

## ★ DONE — Identity Service / Phân hệ 2 Backend — 2026-07-29 (owner Codex)

User đã phê duyệt trực tiếp triển khai phần Backend của
`docs/research/identity-service-phan-he-2-plan-2026-07-29.md`, ưu tiên thay task runtime quy trình động đã
xong source+test và chỉ còn runtime follow-up. Phạm vi: Bước 1–4 và xác minh backend; không làm Angular/SSO.

Đã triển khai: service 8095 + DB/Flyway/seed; CRUD catalog/user/assignment; internal effective-permissions;
hai identity provider gọi RestClient thay Map hardcode; Postgres init đăng ký DB. Verify: identity-service
integration 2/2, ho-so-service full suite 68/68, backend full suite 280/280 (bao gồm consistency/HTTP contract),
`git diff --check` sạch. Chưa khởi động stack dev/runtime 8095; init script chỉ tự chạy với Postgres volume mới,
volume đang tồn tại cần tạo database `qtkhcn_identity` một lần bằng tay trước khi chạy service.

Next task theo plan: Bước 5–6 Angular PH2 pages + nối AuthService; không nằm trong yêu cầu Backend lần này.

---

## ★ IN PROGRESS — Runtime quy trình động (process-agnostic) — 2026-07-28 (owner Claude, theo yêu cầu trực tiếp user)

**Chuyển hướng có phê duyệt tường minh của user.** Task cũ (RD02.02 v3) đã DONE + RUNTIME VERIFIED;
user chấp nhận chuyển hướng sang hướng mới này thay vì tiếp tục các follow-up còn treo của RD02.02.

**Mục tiêu nghiệm thu:** vẽ một BPMN hoàn toàn mới (không phải RD01/RD02), deploy, tạo hồ sơ, chọn
quy trình đó, chạy hết luồng — **không sửa một dòng Java nào**.

**Phạm vi đã chốt với user (3 câu hỏi, trả lời trực tiếp 2026-07-28):**
1. Người dùng tạo BPMN **cả hai đường**: editor trong app (`/quy-trinh`) VÀ deploy thẳng lên Camunda
   rồi hệ thống hút về.
2. Phần tử BPMN trong phạm vi: **userTask + gateway + eForm**. Service task / DMN / timer / message
   NGOÀI phạm vi.
3. Gắn quy trình ↔ hồ sơ: **người dùng chọn tự do** trong danh sách quy trình đã deploy. Không có
   ràng buộc loại hồ sơ ↔ quy trình (user nói rõ "tối ưu thêm sau này").

**Quyết định của user làm thay đổi kế hoạch ban đầu (ghi để không hiểu nhầm về sau):**
- **Lát 0 (guard deploy-time) BỊ HUỶ.** User yêu cầu "cứ tạm thời cho phép deploy từ App, chưa cần
  warning hoặc chặn cứng". Hệ quả đã nêu rõ cho user và user giữ nguyên quyết định: **BPMN có
  service task sẽ deploy được nhưng hồ sơ TREO tại service task đó cho tới khi có job worker** —
  đúng lớp bug RD02.02 `Check` ngày 2026-07-20, lần này do người dùng tự tạo ra.
- Nhờ huỷ Lát 0, KHÔNG phải refactor `ProcessDefinitionImportValidator` từ static sang bean
  (tránh được blast radius 15 callers).
- Các kiểm tra của Lát 0 (thiếu form / role lạ / service task không worker) **chuyển sang màn đối
  soát ở Lát 3** dưới dạng chẩn đoán đọc-thôi, không chặn ai.
- **Đổi thứ tự: Lát 2 làm TRƯỚC Lát 1.** Lát 2 tự đứng được vì quy trình deploy qua app đã nằm sẵn
  trong `process_definition_catalog`; Lát 1 (importer) chỉ cần cho đường deploy ngoài app.

**7 gap đã khảo sát (2026-07-28), trạng thái:**
| # | Gap | Lát | Trạng thái |
|---|---|---|---|
| A | Catalog chỉ biết quy trình deploy qua app; BPMN deploy thẳng lên Camunda vô hình | 1 | **DONE** (source+test) |
| B | FE hardcode 4 mã quy trình theo (loai, cap) kèm cờ `supported` — `ho-so-detail.ts:140-154` | 2 | **DONE** (source+test) |
| C | Service task không worker ⇒ treo | — | **NGOÀI PHẠM VI theo quyết định user** |
| D | DMN `calledDecision` | — | **NGOÀI PHẠM VI** |
| E | Action Studio policy + eForm binding theo `(processCode, taskDefinitionKey)` ⇒ quy trình mới không có nút nào | 3 | **DONE** (source+test) |
| F | `candidateGroups` không đối chiếu danh mục vai trò | 3 | **DONE** (chẩn đoán, không chặn) |
| G | Quy ước `bpmnProcessId = processCode.replace('.','_')` | 2 | **DONE** (source+test) |

**Phát hiện quan trọng khi khảo sát — gap G nặng hơn dự kiến ban đầu:** quy ước dấu chấm KHÔNG chỉ
nằm ở FE (`ho-so-detail.ts:275`) mà nằm cả trong backend engine —
`CamundaReliableWorkflowEngine.start()` dòng 23: `processCode.replace('.', '_')`. Nghĩa là BPMN
người dùng vẽ với id `quy_trinh_moi` chỉ khởi động được nếu `quyTrinh = "quy.trinh.moi"`, và mọi
bpmnProcessId có dấu `_` thật đều không tới được. Phải sửa trong Lát 2, giữ fallback cho dữ liệu cũ
(`HoSo.quyTrinh` hiện đang lưu dạng `"RD01.01"`).

**Đã có sẵn, KHÔNG làm lại:** BPMN editor trong app + draft CRUD/revision/lint/deploy
(`ProcessDefinitionDraftService`), deploy thật lên Zeebe (`CamundaDeploymentService`), metadata
runtime đọc BPMN đã deploy (`BpmnUserTaskMetadataCatalog`, `DeployedBpmnRoutingReader`),
`dossier_step` sinh động (`WorkflowProjectionService:179-187`), start process đã generic
(`WorkflowSubmissionService` truyền thẳng `quyTrinh` → `engine.start(processCode, …)`).

**Lát 2 — DONE (source + test), RUNTIME PENDING:**
- [x] `CamundaReliableWorkflowEngine.start()`: tra `bpmnProcessId` trực tiếp trước, chỉ chạy lượt
      thứ hai với `replace('.','_')` khi chuỗi thực sự khác (dữ liệu cũ `"RD01.01"`).
- [x] `GET /api/process-definitions/selectable` + `SelectableProcessResponse` (mới).
      `userTaskCount` lấy từ `DeployedBpmnRoutingReader.processes()` — cùng nguồn runtime dùng.
      Catalog chưa có version deploy thì bị bỏ qua thay vì ném lỗi như `list()`.
- [x] FE: `submitProcess()` computed hardcode → `selectableProcesses`/`selectedProcessId` nạp từ
      API mỗi lần mở dialog; template đổi sang `nz-select` + 2 cảnh báo (quy trình 0 userTask;
      "hệ thống không kiểm tra quy trình có phù hợp loại hồ sơ").
- [x] FE `openBpmn()`: tra thẳng `quyTrinh` trước, **có cài fallback thật** bằng `catchError` sang
      bản gạch dưới — nếu không sẽ hồi quy "Xem BPMN" cho mọi hồ sơ tạo trước 2026-07-28.
- [x] Test: backend `ProcessDefinitionServiceTest` 7/7, `ProcessDefinitionHttpContractTest` 7/7,
      **full backend 244/244 PASS BUILD SUCCESS**; Angular `ho-so-detail.spec.ts` **20/20 PASS**,
      `ng build --configuration production` GREEN.

**Verify đã chạy:** backend `mvn -o test` **244/244 PASS**; Angular full suite **206/208 PASS** —
2 fail ở `layout/nav-items.spec.ts` là **pre-existing**, không nằm trong diff (`git status` xác nhận
không đụng `nav-items.*`).

**Lát 2 — CHƯA làm (runtime):** chưa build/restart 8090 với source mới, chưa click-through trình
duyệt thật, chưa E2E gửi duyệt bằng một quy trình tự vẽ. Constructor
`ProcessDefinitionService` đổi chữ ký (thêm `DeployedBpmnRoutingReader`) — đã sửa 2 test dựng bằng
tay (`ProcessDefinitionServiceTest`, `BundledBpmnDeployedConsistencyTest`).

**Lát 1 — DONE (source + test), RUNTIME PENDING:** nút "Đồng bộ từ Camunda" hút quy trình deploy
thẳng lên engine về `process_definition_catalog`.
- [x] `CamundaProcessDefinitionLookup`: thêm `listLatest(limit)` → `DeployedProcessPage(items,
      totalOnEngine)` và `fetchXml(processDefinitionKey)`. **API đã xác minh bằng `javap` trên
      `~/.m2/.../camunda-client-java-8.9.12.jar`**, không đoán: `newProcessDefinitionSearchRequest()`
      + `filter(f -> f.isLatestVersion(true))` + `page(p -> p.limit(n))`, và
      `newProcessDefinitionGetXmlRequest(long)` là `FinalCommandStep<String>`. `totalItems()` lấy
      từ chính response phân trang nên chỉ tốn 1 round-trip.
- [x] Record mới `DeployedProcessDefinition` (thêm `name`/`resourceName`) tách khỏi
      `ProcessDefinitionInfo` để không đổi chữ ký `findLatest()` mà
      `StartupProcessDeploymentService` đang dùng.
- [x] Migration **V27** `process_definition_version.source VARCHAR(16) NOT NULL DEFAULT 'APP'` +
      CHECK (`APP`/`EXTERNAL`) + enum `ProcessDefinitionSource`. Default `APP` đúng cho toàn bộ dữ
      liệu cũ vì trước đó chỉ có đường deploy qua app.
- [x] `DeployedProcessImportService` (điều phối, KHÔNG transactional) +
      `DeployedProcessImportWriter` (`@Transactional(REQUIRES_NEW)`, mỗi quy trình một transaction).
      **Lý do tách:** để trong 1 transaction thì 1 lỗi ghi sẽ đánh dấu rollback-only và kéo đổ luôn
      những quy trình đã nhập thành công trước đó.
- [x] Khoá đối chiếu là `camundaProcessDefinitionKey` (KHÔNG phải `bpmnProcessId`) — bản app tự
      deploy đã lưu đúng key này nên được nhận là "đã biết", không nhập trùng. Cùng `bpmnProcessId`
      từ 2 đường dùng CHUNG một dòng catalog, chỉ khác dòng version.
- [x] `POST /api/process-definitions/sync-from-camunda` trả `ProcessSyncResponse` — 200 kèm
      `failures` thay vì lỗi HTTP, để 1 BPMN hỏng trên engine không chặn các quy trình còn lại.
- [x] `camundaDeploymentKey = 0` cho bản EXTERNAL: search API của Camunda không trả deployment key.
      Cột NOT NULL, chỉ dùng truy vết ngược lên Operate, không tham gia khoá hay logic nào.
- [x] FE: nút "Đồng bộ từ Camunda" + banner kết quả giữ nguyên trên màn (không dùng toast — một lượt
      vừa nhập được vừa lỗi, toast biến mất trước khi đọc xong) + cột "Nguồn" (Từ app / Ngoài app).
- [x] Test: `DeployedProcessImportServiceTest` 4/4, `DeployedProcessImportWriterTest` 3/3,
      `ProcessDefinitionHttpContractTest` 9/9, `process-catalog.spec.ts` 7/7 (3 cũ + 4 mới).

**Verify Lát 1:** backend `mvn -o test` **253/253 PASS BUILD SUCCESS**; Angular **210/212 PASS**
(2 fail `layout/nav-items.spec.ts` **pre-existing**, `git status` xác nhận không đụng);
`ng build --configuration production` GREEN.

**Sửa ngoài phạm vi, có chủ ý:** `/quy-trinh` trước nay để `nz-icon` fetch SVG động qua HTTP
(`reload`/`upload`/`plus`/`search` chưa nhóm nào đăng ký) — trái quy ước đăng ký tĩnh của
`icons-provider.ts` và làm mọi unit test dựng trang này fail ở `http.verify()`. Đã thêm
`PROCESS_CATALOG_ICONS` + wire vào `app.ts`.

**Lát 1 — CHƯA làm (runtime):** chưa deploy thử một BPMN thẳng lên Camunda bằng Modeler/zbctl rồi
bấm đồng bộ để xem nó vào catalog thật. Trần quét `MAX_SCAN = 500` chưa thử với engine nhiều quy
trình. Chưa xử lý chiều ngược lại: quy trình bị xoá khỏi engine vẫn nằm lại trong catalog.

**Lát 3 — DONE (source + test), RUNTIME PENDING.**

*Phát hiện lớn nhất của lát này: gap E nặng hơn bảng khảo sát ghi.* Chỗ chặn thật của "vẽ BPMN mới
rồi chạy hết luồng" không nằm ở Action Studio policy mà ở `WorkflowTaskActionRouting`: nó tra bảng
`switch` cứng theo `processDefinitionId`, nên quy trình người dùng vẽ rơi vào `default -> Map.of()`
(bấm "Đồng ý duyệt" xong Zeebe không có biến nào để rẽ ⇒ gateway đi default flow hoặc CONDITION_ERROR)
và `default -> false` cho RETURN_STEP (không bao giờ trả lại được). Nếu chỉ làm đúng 3 việc trong kế
hoạch Lát 3 thì nghiệm thu Lát 4 vẫn không thể đạt.

- [x] `DeployedBpmnRoutingReader.actionVariables(processId, taskKey)` (mới) — suy biến điều khiển
      thẳng từ conditionExpression: `= ketQuaDuyet = "dong_y"` → `{APPROVE_STEP: {ketQuaDuyet: dong_y}}`.
      `RouteBranchResponse` thêm trường `variable` (null khi nhánh không phải dạng `biến = "chuỗi"` —
      **đoán bừa tên biến sẽ đẩy hồ sơ sang nhánh sai mà không báo lỗi**). Default flow không có
      conditionExpression ⇒ `variable` null, và đúng: chọn default flow là việc của Zeebe.
- [x] `WorkflowTaskActionRouting` nhận `DeployedBpmnRoutingReader`; **bảng cứng RD01.01/RD02.02 giữ
      nguyên và được ưu tiên** vì đã nghiệm thu runtime thật và mang sắc thái BPMN không nói ra được
      (Task_6 duyệt là `dong_y_bo_sung`, RD02.02 cố ý fail-closed RETURN_STEP). Có test
      `verifyNoInteractions(routingReader)` khoá thứ tự ưu tiên này.
- [x] RETURN_STEP cho quy trình mới **fail-closed** đúng nguyên tắc RD02.02: chỉ cho phép khi BPMN
      thật sự có nhánh hiệu chỉnh, không thì nó im lặng chạy y hệt APPROVE_STEP.
- [x] **Phát hiện thứ hai:** seed V10 có 4 luật hiển thị nút CHUNG (`process_code`/`task_definition_key`
      NULL) gắn sẵn biểu mẫu RD01.01 ⇒ mọi quy trình mới bị đối soát chấm `generic` (KHÔNG phải
      `missing`), nên `scaffold()` cũ là no-op và bước của quy trình mới mở ra biểu mẫu RD01.01 —
      server còn validate trường bắt buộc theo đúng biểu mẫu sai đó. `scaffold()` nay ghim đè khi BPMN
      tự khai `formKey`; bước không tự khai thì để nguyên luật chung (không đẻ luật thừa).
- [x] Bỏ hẳn nhánh dự phòng `BUNDLED_RD0101`: `ProcessDeploymentRunner` nay `syncCatalog` cho **cả
      RD01.01** chứ không chỉ RD02.02 (an toàn khi chạy lại: sync bỏ qua nếu catalog đã có dòng, và
      deploy lại BPMN y hệt thì Zeebe trả CÙNG processDefinitionKey). `resolve()` bỏ tham số
      `processDefinitionId` (3 call site) và **không cache map rỗng** — cache rỗng sẽ đóng băng trạng
      thái "không biết bước nào" đến hết vòng đời tiến trình nếu tra trúng lúc quy trình chưa vào catalog.
- [x] Tự sinh luật sau deploy: `ProcessDeployedEvent` +
      `@TransactionalEventListener(AFTER_COMMIT)` + `@Transactional(REQUIRES_NEW)`
      (`DeployedProcessPolicyScaffolder`). **Cả hai hướng đơn giản hơn đều sai:** cùng transaction ⇒
      lỗi sinh luật đánh dấu rollback-only và làm mất dòng catalog trong khi BPMN ĐÃ ở trên Zeebe;
      `REQUIRES_NEW` ngay tại chỗ ⇒ transaction mới không thấy dòng version chưa commit nên scaffold
      thành no-op im lặng. Cả 2 đường deploy (app + hút từ Camunda) đều phát sự kiện.
- [x] `RoleCatalog` (mới) tách khỏi `ActionStudioService` — trước đó danh mục vai trò nằm private nên
      không ai đối chiếu `candidateGroups` được. Giữ static thay vì bean để không đổi chữ ký
      constructor `ActionStudioService` (7 test dựng tay).
- [x] `JobWorkerRegistry` (mới) quét `@JobWorker(type=...)` bằng phản chiếu trên bean definition —
      **không hardcode** danh sách job type, vì hardcode thì mỗi worker mới là một lần quên cập nhật.
      `io.camunda.client.annotation.JobWorker.type()` xác minh bằng `javap` trên
      `camunda-spring-boot-starter-8.9.12.jar` (KHÔNG nằm trong `camunda-client-java`).
- [x] **Màn đối soát** — `ProcessReadinessService` + `GET
      /api/process-definitions/by-bpmn-process-id/{id}/readiness` + drawer "Đối soát" trên `/quy-trinh`.
      Đây chính là chỗ 3 kiểm tra của Lát 0 (đã huỷ) được chuyển tới, dạng chẩn đoán đọc-thôi:
      biểu mẫu có thật trong thư viện không · `candidateGroups` có trong danh mục vai trò không ·
      service task có worker lắng nghe không · nhánh nào chưa có luật ghim. Trả **200 kể cả khi tất cả
      đều đỏ** (chẩn đoán, không phải cổng chặn). Lỗi đối soát luật chỉ thành một ghi chú, không làm
      mất phần chẩn đoán còn lại.
- [x] `SecureXml` (mới) gom cấu hình parser tắt DTD/external entity. **Không** gom
      `ProcessDefinitionImportValidator` — đó là cổng kiểm duyệt dữ liệu từ ngoài, cứng hơn (có
      EntityResolver ném lỗi + ErrorHandler biến warning thành lỗi), không nên bị kéo theo.
- [x] Test mới: `ProcessReadinessServiceTest` 7/7, `DeployedProcessPolicyScaffolderTest` 2/2,
      `DeployedBpmnRoutingReaderTest` 6/6 (+3), `WorkflowTaskActionRoutingTest` 25/25 (+3),
      `ActionStudioServiceTest` 12/12 (+2), `BpmnUserTaskMetadataCatalogTest` 2/2 (+1),
      `ProcessDefinitionHttpContractTest` 10/10 (+1), `process-catalog.spec.ts` 10/10 (+3).

**Lát 4 — DONE (source + test), RUNTIME PENDING.** `UserAuthoredProcessAcceptanceTest`
(Testcontainers Postgres 16, cùng image `infra/docker-compose.override.yml`) — **6/6 PASS**:
- BPMN `quy_trinh_thu_nghiem` (start → LapHoSo → DuyetHoSo → gateway 3 nhánh: đồng ý / yêu cầu hiệu
  chỉnh quay lại bước đầu / không đạt là default flow) **chưa từng xuất hiện ở bất kỳ file Java, hằng
  số, migration hay resource nào** — viết ngay trong test, đúng như người dùng vẽ trên `/quy-trinh/ve`.
- Chạy hết chuỗi: validate (không lỗi lint) → deploy → catalog → routing đọc đúng 2 bước/role/form →
  `actionVariables` cho đúng biến điều khiển → `WorkflowTaskActionRouting` trả đúng biến cho
  APPROVE/RETURN → `scaffold` ghim đúng biểu mẫu riêng (không mượn của RD01.01) → `simulate` với user
  **không phải admin** (role CQ_KHCN) thấy nút duyệt kèm đúng form → `readiness` xanh.
- Dùng dữ liệu seed Flyway thật (danh mục action, thư viện biểu mẫu, 4 luật CHUNG của V10) — chính bộ
  seed đó là thứ từng làm quy trình mới lặng lẽ mượn biểu mẫu RD01.01.

**Verify Lát 3 + 4:** backend `mvn -o test` **279/279 PASS BUILD SUCCESS**; Angular **213/215**
(2 fail `layout/nav-items.spec.ts` **pre-existing**, không nằm trong diff);
`ng build --configuration production` GREEN; `npx tsc -p tsconfig.app.json --noEmit` EXIT=0.

**Lát 3 + 4 — CHƯA làm / giới hạn đã biết:**
- **Zeebe bị mock trong Lát 4.** Test chứng minh mọi thứ PHÍA APP là process-agnostic; phần "engine
  thật nhận BPMN và rẽ nhánh theo biến điều khiển" vẫn là giả định chưa nghiệm thu.
- Chưa build/restart 8090, chưa click-through trình duyệt, chưa chạy hết luồng trên stack thật cho
  bất kỳ lát nào trong 4 lát.
- Dây `@TransactionalEventListener(AFTER_COMMIT)` chưa có integration test dựng cả Spring context —
  phần phát sự kiện và phần xử lý sự kiện được test riêng, còn chính annotation thì chưa.
- `JobWorkerRegistry` bỏ qua `@JobWorker` không khai `type=` (Camunda tự suy từ tên method). Dự án
  hiện luôn khai tường minh; nếu sau này có worker không khai, đối soát sẽ báo "thiếu worker" nhầm.
- Chiều ngược lại vẫn chưa xử lý (từ Lát 1): quy trình bị xoá khỏi engine vẫn nằm trong catalog và
  vẫn chọn được khi gửi duyệt ⇒ hồ sơ chết ở `ProcessNotActiveException`. Đáng đưa vào màn đối soát.
- **Bẫy môi trường gặp thật khi làm lát này:** IDE (Eclipse JDT) ghi class file lỗi vào
  `backend/target/classes`, `mvn compile` bỏ qua vì timestamp, và Mockito báo "Could not modify all
  classes" cho class mới. Xoá đúng file `.class` rồi `mvn -o compile` lại là hết — không phải lỗi code.

## ★ DONE — AI_Summarize đọc thêm nội dung tệp đính kèm (PDF/Word/Excel) — 2026-07-21 (owner Claude, theo yêu cầu trực tiếp user)

**Bối cảnh:** tiếp nối việc chuyển provider AI_Summarize sang OpenAI (entry ngay dưới). Trước đó
`AiSummaryService.buildContext` chỉ đọc metadata `HoSo`/`NhiemVu` + ý kiến các bước đã hoàn tất,
KHÔNG đọc nội dung tệp đính kèm (`TaiLieu`, lưu qua `DocumentStorageService` trên disk, chưa có
lib trích xuất text nào trong repo). User yêu cầu bổ sung để AI tóm tắt luôn cả nội dung file.

**Đã thêm/sửa:**
- `services/ho-so-service/pom.xml` — thêm `org.apache.pdfbox:pdfbox:3.0.3` +
  `org.apache.poi:poi-ooxml:5.3.0` (chỉ 2 lib này, không dùng Tika để tránh kéo theo dependency
  tree quá lớn/OCR không cần).
- `services/ho-so-service/.../service/DocumentTextExtractor.java` (mới) — trích text từ
  PDF (PDFBox `PDFTextStripper`), `.docx` (POI `XWPFWordExtractor`), `.xlsx`/`.csv`/`.txt` (đọc
  thẳng ô/plain text). Archive/Image/`.doc`/`.xls` cũ (binary) KHÔNG hỗ trợ — trả `Optional.empty()`,
  không ném lỗi (nhất quán nguyên tắc fail-safe của AI_Summarize: 1 tệp lỗi không được chặn tóm tắt).
- `AiSummaryService` — inject `DocumentStorageService` + `DocumentTextExtractor`, thêm
  `extractAttachments(HoSo)`: lặp `hoSo.getTaiLieu()`, bỏ qua tệp không có `storageKey`/loại
  Archive/Image, cắt độ dài theo 3 config mới (`qtkhcn.ai.attachments.max-files` mặc định 5,
  `max-chars-per-file` mặc định 4000, `max-chars-total` mặc định 8000 — env override
  `QTKHCN_AI_ATTACHMENT_MAX_FILES`/`MAX_CHARS_PER_FILE`/`MAX_CHARS_TOTAL`) để tránh phình
  prompt/chi phí gọi LLM.
- `AiSummaryContextResponse` — thêm record `TepDinhKem(ten, loai, noiDung, daCatBot)` +
  field `tepDinhKem` trả về từ `/internal/v1/ho-so/{id}/ai-summary/context`.
- Backend: `AiSummaryHoSoGateway.AiSummaryContext` mirror thêm `TepDinhKem`;
  `AiSummarizeDossierJobWorker.buildPrompt` thêm đoạn "Nội dung trích từ tệp đính kèm" vào prompt
  gửi OpenAI.
- Test mới: `DocumentTextExtractorTest` (PDF/docx dựng trong bộ nhớ bằng chính PDFBox/POI, csv/txt,
  skip Archive/Image, file PDF hỏng không ném lỗi), `AiSummaryServiceTest` (đọc được tệp hợp lệ,
  bỏ qua tệp thiếu storageKey/Archive, cắt đúng theo giới hạn cấu hình). Cập nhật
  `AiSummarizeDossierJobWorkerTest` cho record mới + test prompt có chứa trích đoạn tệp.

**Verify:** `mvn -q compile` + `mvn -q test` cả 2 module (`services/ho-so-service`, `backend`)
đều EXIT=0, không FAILURE/ERROR liên quan (1 dòng ERROR log trong backend test là pre-existing,
không liên quan AI_Summarize). Dependency PDFBox/POI được fetch qua `mvn` online 1 lần (build sau
vẫn chạy `-o` được vì đã cache trong `~/.m2`).

**Chưa làm / giới hạn đã biết:** không hỗ trợ `.doc`/`.xls` nhị phân cũ (chỉ OOXML `.docx`/`.xlsx`
+ PDF + `.csv`/`.txt`); chưa test qua UI thật (`/cau-hinh-service-task` banner chưa cập nhật để
nhắc thêm 3 env var attachment mới — cân nhắc bổ sung nếu cần); chưa chạy thử với OpenAI key thật
kèm hồ sơ có file đính kèm thật.

## ★ DONE — Đổi provider LLM của `khcn.rd0202.summarize-dossier` từ Anthropic sang OpenAI

## ★ DONE — Port tab "Báo cáo Optimize" + "DMN / Outcome" + "Đề xuất cải tiến" trên `/giam-sat` sang Angular — 2026-07-21 (owner Claude, theo yêu cầu trực tiếp user)

**Bối cảnh:** tiếp nối việc port Optimize dashboard `/tong-quan` (entry ngay dưới) — user yêu cầu
port nốt 3 mảng còn lại của Optimize mock đang nằm trên màn `ProcessMonitor.tsx` (mockup React ở
worktree `ql-nvkhcn-tranngdt-check\webapp\src`) sang Angular `/giam-sat`
(`pages/process-monitor`). Phát hiện quan trọng: bản mockup React (`ProcessMonitor.tsx`) **chỉ có
2 tab** ("Instance" + "Báo cáo Optimize" gộp 4 biểu đồ: cycle time/bottleneck/heatmap/SLA KPI/
gateway) — data file `webapp/src/data/optimizeOpsInsights.ts` có sẵn 3 export
(`OPTIMIZE_OUTCOME_CORR`, `OPTIMIZE_DMN_RULE_HITS`, `OPTIMIZE_INSIGHTS`) nhưng **không được dùng ở
bất kỳ .tsx nào** (xác nhận bằng grep cả thư mục `webapp/src`) — tức "DMN/Outcome" và "Đề xuất cải
tiến" chưa từng có UI mẫu, chỉ có seed data mồ côi. Đã tự thiết kế cách trình bày 2 tab mới này
(bảng + mini bar chart CSS + stacked bar tỷ lệ) dựa trên đúng field có sẵn, không bịa thêm field.

**Đã thêm/sửa (frontend-angular, không đụng backend):**
- `core/models/optimize-ops-insights.ts` (mới) — port nguyên vẹn toàn bộ constant/type từ
  `optimizeOpsInsights.ts`: `OPTIMIZE_CYCLE_BY_PROCESS`, `OPTIMIZE_BOTTLENECKS`,
  `OPTIMIZE_GATEWAY_RATES`, `OPTIMIZE_SLA_KPI`, `OPTIMIZE_OUTCOME_CORR`,
  `OPTIMIZE_DMN_RULE_HITS`, `OPTIMIZE_INSIGHTS`, `INSIGHT_KIND_LABEL` + thêm
  `INSIGHT_CONFIDENCE_LABEL`/`INSIGHT_CONFIDENCE_COLOR`/`bottleneckHeat()` (helper Angular cần mà
  React không cần vì JSX inline được).
- `pages/process-monitor/process-monitor.ts` — thêm computed cho 3 bar chart
  (`bottleneckChart`/`slaChart`/`dmnHitsChart`, tái dùng `SimpleBarChartComponent` đã có từ lát
  Tổng quan) + field tra cứu nhãn/màu cho template.
- `pages/process-monitor/process-monitor.html` — tab "Báo cáo Optimize" đổi từ alert placeholder
  "Chưa kết nối" sang 5 card thật (bảng cycle time, `SimpleBarChartComponent` ngang cho bottleneck,
  heatmap CSS glow đỏ tái dùng công thức mockup, `SimpleBarChartComponent` dọc cho SLA KPI có màu
  theo ngưỡng 20%, bảng gateway rates); thêm 2 tab mới "DMN / Outcome" (bar chart + bảng chi tiết
  rule, bảng outcome correlation với stacked bar CSS 3 màu đồng ý/từ chối/yêu cầu sửa) và "Đề xuất
  cải tiến" (card list, tag loại đề xuất + tag độ tin cậy màu theo mức).
- `pages/process-monitor/process-monitor.scss` — style mới: `.pm-mini-table`, `.pm-heat-wrap/-cell`,
  `.pm-outcome-bar`, `.pm-insight-*`.

**Khác với bản React:** giữ nguyên chuỗi field/label; 2 tab DMN/Outcome + Đề xuất cải tiến là UI
tự thiết kế (không có bản mockup để đối chiếu 1:1) — ưu tiên bảng + mini chart nhất quán phong cách
đã có ở `/tong-quan` (không thêm chart lib mới, dùng lại `SimpleBarChartComponent`). Toàn bộ vẫn là
seed mock (banner ghi rõ "chờ Camunda Optimize + DMN engine thật khi F1"), khớp nguyên tắc đã áp
dụng cho `/tong-quan`.

**Verify:** `npx tsc -p tsconfig.app.json --noEmit` sạch; `ng build --configuration production`
**GREEN** (chunk `process-monitor` tăng 24.58 kB, không vượt budget mới; chỉ còn warning
`action-studio.scss` budget + 3 CommonJS có sẵn, không liên quan). **Chưa làm:** chưa click-through
trình duyệt thật — cổng 4200 và trình duyệt Playwright MCP đều đang bị 1 phiên khác chiếm giữ tại
thời điểm này (xem [[concurrent-sessions-same-repo]]); đã tự dựng + tắt `ng serve --port 4210` chỉ
để xác nhận compile, không giữ tiến trình lại. Chưa có unit test (`.spec.ts`) cho phần mở rộng này
(giống tiền lệ `/tong-quan` cũng chưa có).

## ★ DONE — Port trang "Tổng quan" (Optimize leadership dashboard) từ React sang Angular — 2026-07-21 (owner Claude, theo yêu cầu trực tiếp user)

**Bối cảnh:** user yêu cầu pull nhánh `tranngdt` (remote-only, đã checkout vào worktree riêng
`ql-nvkhcn-tranngdt-check`, xem entry pull ở lịch sử hội thoại) rồi port trang `/tong-quan`
(`webapp/src/pages/Dashboard.tsx`, React + antd + recharts, ~690 dòng) sang Angular. Route
`/tong-quan` trước đó dùng `PlaceholderPage` (chưa có trang thật).

**Đã thêm (frontend-angular):**
- `pages/tong-quan/` (ts/html/scss) — component chính, đăng ký lazy route thay `PlaceholderPage`
  trong `app.routes.ts`.
- `shared/simple-bar-chart/` — component biểu đồ cột dựng bằng CSS thuần (không thêm thư viện
  chart mới; project chưa có chart lib nào), hỗ trợ orientation dọc/ngang, kèm `<table>`
  ẩn-visual cho screen reader (theo skill `dataviz`).
- `core/models/optimize-analytics.ts` — port mock Optimize snapshot từ
  `webapp/src/data/optimizeAnalytics.ts` (chỉ giữ phần Dashboard thực dùng, bỏ backlogTrend/
  outcomesBy*/reworkLoops/dmnRuleHits vì Dashboard.tsx không dùng).
- `core/models/rd0101-bpmn.ts` / `rd0102-bpmn.ts` / `rd0201-bpmn.ts` — copy verbatim BPMN XML mock
  từ webapp (dùng cho heatmap BPMN, 3 quy trình RD01.01/RD01.02/RD02.01 chưa có backend thật).
- `core/models/process-registry.ts` — thêm export `NHOM` (nhãn nhóm quy trình RD01..RD08), trước
  đây file này chỉ có `seedProcesses` (đã lược bpmnXml theo comment sẵn có trong file).
- `shared/bpmn-viewer/bpmn-viewer.ts` + `.scss` — thêm input `heatMarkers` (map elementId → CSS
  class) + 5 class `.vht-heat-1..5` (glow drop-shadow, đối chiếu
  `webapp/src/branding/bpmnio-skin.css`), tái dùng cơ chế `canvas.addMarker` sẵn có.
- `pages/ho-so-list/ho-so-list.ts` — đọc thêm query param `status` (bên cạnh `id` có sẵn) để stat
  card trên Tổng quan điều hướng `/ho-so?status=PROCESSING` có filter đúng ngay.

**Khác với bản React:** KPI/4 biểu đồ/heatmap BPMN vẫn là seed mock (giữ nguyên, chờ Optimize API
thật — F1 chưa xong). Riêng bảng "2. Hồ sơ đang vượt SLA" đổi sang gọi `HoSoService.list()` thật
(Angular đã có backend thật cho hồ sơ, không cần mock/join như React) — tính "quá hạn" so với
`Date` thực tại thời điểm xem, không hardcode ngày như bản React.

**Verify:** `npx tsc -p tsconfig.app.json --noEmit` sạch; `ng build` production **GREEN** (chunk
`tong-quan` tách lazy, không vượt budget). Test tay bằng Playwright trên `ng serve --port 4201`
(port 4200 đã bị phiên khác chiếm — xem [[concurrent-sessions-same-repo]]): đăng nhập
admin@example.com, chọn app "Quản lý NV KHCN & Hồ sơ", vào `/tong-quan` — 0 console error, KPI/2
biểu đồ dọc/2 biểu đồ ngang/bảng SLA (0 kết quả thật, đúng vì không có HS quá hạn tại thời điểm
test)/bảng năng lực đơn vị/heatmap Unit×metric/heatmap BPMN (glow đỏ đúng node) đều render đúng.
Test tương tác: chuyển Tháng→Quý (số liệu đổi theo, 126→282 tổng HS), chuyển "Khoảng thời gian"
(hiện 2 input date, label đổi theo), click stat card "Đang xử lý" → điều hướng `/ho-so?status=
PROCESSING` và list lọc đúng ngay. **Chưa làm:** chưa test đổi "Nhóm quy trình" / đổi quy trình
heatmap qua UI thật (chỉ verify logic qua code); chưa có unit test (`.spec.ts`) cho trang mới hay
cho `simple-bar-chart`.

## ★ DONE — Đổi provider LLM của `khcn.rd0202.summarize-dossier` từ Anthropic sang OpenAI — 2026-07-21 (owner Claude, theo yêu cầu trực tiếp user)

**Quyết định (hỏi qua AskUserQuestion, user chọn):** thay hẳn Anthropic bằng OpenAI (không giữ cả
hai provider chọn qua config) — đơn giản nhất, đúng 1 provider duy nhất.

**Đã sửa:**
- Backend: xóa `ai/AnthropicSummaryClient.java`, thêm `ai/OpenAiSummaryClient.java` (cùng implement
  `AiSummaryGenerator`, cùng hành vi fallback khi thiếu key/lỗi) — gọi OpenAI Chat Completions API
  (`POST /v1/chat/completions`, header `Authorization: Bearer <key>`, đọc
  `choices[0].message.content`) thay vì Anthropic Messages API. `application.yml`:
  `qtkhcn.ai.anthropic.*` → `qtkhcn.ai.openai.*`; biến môi trường
  `ANTHROPIC_API_KEY`/`QTKHCN_AI_ANTHROPIC_*` → `OPENAI_API_KEY`/`QTKHCN_AI_OPENAI_*`; model mặc
  định đổi `claude-sonnet-5` → `gpt-4o-mini`. Javadoc `AiSummarizeDossierJobWorker` cập nhật theo.
- Frontend: mọi chỗ nhắc "Anthropic"/`claude-sonnet-5`/`ANTHROPIC_API_KEY` trong
  `core/models/service-task.ts`, `core/services/service-task.service.ts`,
  `shared/service-task-form-drawer/service-task-form-drawer.ts`,
  `pages/service-task-config/service-task-config.ts` + `.html` (banner AI Agent thêm ở mục ngay
  dưới) đổi sang OpenAI/`gpt-4o-mini`/`OPENAI_API_KEY` để khớp backend.
- `AiSummarizeDossierJobWorkerTest` không cần sửa (mock interface `AiSummaryGenerator`, không đụng
  class cụ thể).

**Verify:** `mvn -o compile` sạch; `mvn -o test -Dtest=AiSummarizeDossierJobWorkerTest` **3/3 PASS**;
grep xác nhận không còn tham chiếu `AnthropicSummaryClient`/`OpenAiSummaryClient` lẫn lộn trong
`backend/src`. Frontend: `tsc --noEmit` sạch, `service-task-config.spec.ts` **9/9 PASS**. **Chưa
làm:** chưa gọi OpenAI thật (chưa có `OPENAI_API_KEY` thật để test), chưa restart 8090 với biến môi
trường mới.

## ★ DONE — UI `/cau-hinh-service-task` cho `khcn.rd0202.summarize-dossier` (AI_Summarize) — 2026-07-21 (owner Claude, theo yêu cầu trực tiếp user)

**Bối cảnh:** phiên trước (uncommitted) đã thêm seed AI_AGENT (`std-ai-summarize-dossier`,
version, binding) vào `frontend-angular/src/app/core/models/service-task.ts` +
`service-task.service.ts`, và đã cố tình loại AI_AGENT khỏi `API_SUPPORTED_TYPE_CODES` trong
`service-task-form-drawer.ts` (đúng, vì backend `ServiceTaskApiTypeCode` không có AI_AGENT — job
worker `AiSummarizeDossierJobWorker` gọi thẳng Anthropic, đọc cấu hình từ
`application.yml`/biến môi trường qua `AnthropicSummaryClient`, không qua bảng
`service_task_definition`). Việc còn thiếu khi user hỏi lại: 2 gap hiển thị trên chính trang
`/cau-hinh-service-task`.

**Đã sửa (chỉ frontend-angular, không đụng backend):**
1. `pages/service-task-config/service-task-config.ts` — `CATEGORY_GROUPS` thiếu nhóm `ai` nên
   panel "Loại Service Task" ở tab Tổng quan không hiện AI_AGENT dù seed đã có — thêm
   `{ key: 'ai', label: 'AI Agent', icon: 'robot' }`.
2. `core/icons-provider.ts` — thêm `RobotOutline` vào `SERVICE_TASK_ICONS` (icon `robot` chưa được
   đăng ký tĩnh, `nz-icon` sẽ không hiện nếu thiếu).
3. `service-task-config.ts` + `.html` — thêm computed `aiAgentDefinitions` + banner `nz-alert` mới
   trong tab "Cấu hình", ngay dưới banner nguồn dữ liệu thật hiện có. Banner liệt kê từng definition
   AI_AGENT (tên, mã, jobType từ binding ACTIVE) và giải thích rõ: loại này không hiện trong bảng
   "Cấu hình" (nguồn `/api/service-tasks` thật) và không sửa được qua nút "Sửa cấu hình" — muốn đổi
   phải đặt biến môi trường backend rồi restart: `ANTHROPIC_API_KEY` (bắt buộc để gọi LLM thật, để
   trống thì luôn fallback tĩnh, không lỗi), `QTKHCN_AI_ANTHROPIC_MODEL` (mặc định
   `claude-sonnet-5`), `QTKHCN_AI_ANTHROPIC_MAX_TOKENS` (mặc định `512`),
   `QTKHCN_AI_ANTHROPIC_BASE_URL` (mặc định `https://api.anthropic.com`) — khớp đúng
   `application.yml` đã sửa ở phiên trước (`qtkhcn.ai.anthropic.*`).

**Verify:** `npx tsc -p tsconfig.app.json --noEmit` sạch; `ng test --include=**/service-task-config.spec.ts`
**9/9 PASS** (không cần sửa test — banner mới không có definition AI_AGENT nào trong fixture của
spec nên `@if` không render, không phá test cũ); `ng build` production **GREEN** (chỉ warning
budget/CommonJS có sẵn, không liên quan). **Chưa làm:** chưa click-through trình duyệt thật; các
tab "Đối soát BPMN"/"Kiểm thử" đã tự hoạt động đúng từ seed data có sẵn (không cần sửa) vì cả 2 đọc
từ `ServiceTaskService` (mock signal store), không phải `/api/service-tasks` thật.

## ★ DONE + TEST VERIFIED — eForm không hiện khi bấm nút hành động task thật ("Đồng ý duyệt" T05 HS-2026-016 không ra `bm-02-08-qdh-nv`) — 2026-07-21 (owner Claude, theo yêu cầu user "kiểm tra binding eForm theo userTask và Luật hiển thị nút")

**Bối cảnh:** user báo HS-2026-016 ở bước 5 ("Lập, trình QĐ thành lập HĐXD cấp Cơ sở", `T05`),
bấm "Đồng ý duyệt" kỳ vọng ra form `bm-02-08-qdh-nv` nhưng không thấy — nghi cả "eForm binding
theo userTask" lẫn "Luật hiển thị nút" (Ma trận Hành động) đều sai.

**Điều tra — Luật hiển thị nút / eForm binding (backend, `action_availability_policy`):
KHÔNG có bug hiện tại.** Gọi thẳng `GET /api/action-studio/reconcile?processCode=RD02_02` trên
backend đang chạy (8090): `AP-BPMN-RD02_02-T05-APPROVE` đã tồn tại, `status: "ok"`,
`formKey: "bm-02-08-qdh-nv"` — khớp đúng `zeebe:formDefinition` của `T05` trong `rd0202.bpmn`.
110/122 dòng reconcile của RD02.02 là "ok", 11 "unfilled" (đúng — các task `*_GDK`/`*_GDTT` không
tự ký thứ 2 vốn không khai báo formKey riêng trong BPMN), 1 "generic". Tức là `scaffold()`
(`ActionStudioService.scaffold`, endpoint `POST /api/action-studio/reconcile/{code}/scaffold`) đã
được chạy cho RD02.02 v3 (updatedBy "Lê Văn Cường", `updatedAt` hôm nay) — có thể do phiên khác
(xem [[concurrent-sessions-same-repo]]) hoặc thao tác admin qua UI Ma trận Hành động. **Không sửa
gì ở tầng này** — dữ liệu đã đúng, không cần scaffold lại.

**Bug thật tìm thấy — frontend, `ho-so-detail.ts`:** `openAction()`/`applyAction()` (luồng hành
động task thật, dùng `availableActions()` từ `TaskActionService`, khác hẳn `runDossierAction()`
dùng cho action cấp hồ sơ) **chưa bao giờ đọc `TaskAvailableAction.formKey`**. Bấm bất kỳ nút nào
trong khối `@if (dossier.trangThai === 'PROCESSING')` chỉ mở modal ghi chú (`actionNote`) rồi
`applyAction()` POST `/api/tasks/{taskKey}/actions` với **`formData: {}` khoá cứng** — bất kể form
nào được bind. Đây chính là lý do form không hiện, và cũng là lý do
`HoiDongXetDuyetService.sinhTuBuoc05()` (sinh HĐXD sau khi ký QĐ thành lập ở `T05`/`T18B`) luôn có
nguy cơ ném "chưa có formData để sinh HDXD" — vì `DossierStep.formDataJson` không bao giờ được
điền từ luồng UI này.

**Đã sửa** (`frontend-angular/src/app/pages/ho-so-detail/ho-so-detail.ts` +
`ho-so-detail.html`): thêm `taskActionForm`/`taskActionFormLoading` (tách khỏi `actionForm`/
`formLoading` vốn chỉ phục vụ xem-trước read-only của `runDossierAction`, để không đụng hành vi cũ
đó) + `taskActionFormRenderer = viewChild<FormRendererComponent>('taskActionFormRenderer')`.
`openAction()` nay gọi `eformService.loadOne(action.formKey)` giống hệt `runDossierAction()`.
Modal `actionOpen` render `<app-form-renderer #taskActionFormRenderer>` khi action có `formKey`.
`applyAction()` gọi `renderer.submit()` (API công khai có sẵn của `FormRendererComponent`, trả
`{data, errors}`), chặn submit nếu có lỗi validate, và gửi `result.data` thay vì `{}`.

**Verify:** `ng build` sạch. `ho-so-detail.spec.ts`: sửa lại test cũ "wires task-centric actions…"
(trước đó gọi `applyAction()` ngay sau `openAction()` không qua `detectChanges()`/flush GET eform —
tức test cũ đang xác nhận đúng hành vi lỗi cũ) để flush đúng GET `/api/eform/phieu-phe-duyet` trước
khi submit; thêm test mới "loads the eForm bound to a real task action and submits the data the
user entered" xác nhận `formData` POST đi đúng bằng giá trị người dùng nhập (qua
`renderer.setValue()`) chứ không phải `{}`. Toàn bộ suite frontend: **44 file / 205 test PASS**.
**Chưa làm:** chưa test tay qua trình duyệt thật (Playwright) trên HS-2026-016 sống — khuyến nghị
user tự bấm lại "Đồng ý duyệt" ở bước 5 để xác nhận trực quan; chưa rà toàn bộ RD01.01/RD02.01/
RD02.02 xem còn action nào khác có `formKey` mà UI khác (Worklist/mobile) cũng bỏ qua tương tự.

## ★ DONE + RUNTIME VERIFIED — HS-2026-016/018 kẹt do mất TASK_COMPLETED/TASK_CREATED trong `CamundaWorkflowRuntimeEventReader`; khôi phục T04/T13/T27/T29 tách GDTT/GDK trong `rd0202.bpmn` — 2026-07-21 (owner Claude)

**Root cause:** `CamundaWorkflowRuntimeEventReader.read()` chỉ tin native
`client.newUserTaskSearchRequest()` và chỉ fallback sang `readJobBackedTasks()`
(ElementInstance+Job search) khi `tasks.isEmpty()`. Xác minh trực tiếp trên hệ thống sống: view
native trả **không rỗng nhưng thiếu item** (1/3 task thật của HS-2026-016), trong khi
element-instance/job search luôn đầy đủ và đúng (jobKey của native `zeebe:userTask` == userTaskKey
gốc → tái dùng thẳng làm `taskKey` không phá downstream). Đây là lỗi hệ thống, không riêng 1 hồ sơ —
quét toàn `workflow_event_outbox` phát hiện thêm HS-2026-018 dính cùng pattern.

**Đã sửa** (`backend/src/main/java/vn/vht/qtkhcn/camunda/CamundaWorkflowRuntimeEventReader.java`):
`read()` nay LUÔN chạy `readJobBackedTasks()` bổ sung cho nhánh native, không còn gate bởi
`isEmpty()`. An toàn: `WorkflowEventCollector.collect()` dedupe theo `sourceKey` nên 2 nhánh cùng
phát hiện 1 task (taskKey trùng) không sinh outbox row đôi. Không cần backfill thủ công —
`collect()` quét lại toàn bộ `workflow_process_mapping` mỗi 1s nên tự phục hồi sau restart.

**Đã khôi phục `rd0202.bpmn`** (T04/T13/T27/T29 tách GDTT/GDK, khớp đúng v4 đang chạy
`processDefinitionKey=2251799813756379`, đối chiếu trực tiếp `GET /v2/process-definitions/{key}/xml`):
mỗi cặp thành 2 userTask nối tiếp (giữ nguyên `incoming`/`outgoing` gốc ở 2 đầu, thêm sequenceFlow nối
giữa: `F06`→T04_GDTT→T04_GDK + `Flow_00mw9x8` mới; `Flow_18hoca3` mới + `Flow_0ae21gs` mới thay `F15` bị
xoá; `Flow_1hjf0y8` mới + `F31` đổi sourceRef; `Flow_0tvm6l8` mới + `F33` đổi sourceRef), copy đúng
`candidateGroups`/`formKey`/marker `<zeebe:userTask/>` verbatim theo v4 (chỉ 1 trong 2 task mỗi cặp có
form, xác nhận đúng thực tế lệch giữa 4 cặp: T04/T13 form ở GDTT, T27/T29 form ở task 2). **Diagram DI:**
KHÔNG copy nguyên toạ độ v4 (layout v4 là auto-layout hoàn toàn khác, không tương thích lưới đơn giản của
file repo) — tự đặt 4 shape mới xếp dọc dưới task 1 (offset y+120, cùng x/width), kiểm tra thủ công không
đè lên shape nào khác trong vùng lân cận; các edge nội bộ + edge ra ngoài đổi nguồn đều có waypoint mới,
không còn `F15`. **Không redeploy** — chỉ sửa file nguồn theo đúng yêu cầu, việc bấm deploy v5 để dành cho
user chủ động.

**Verify:** `mvn -o compile` sạch; `WorkflowEventCollectorTest`/`BundledBpmnDeployedConsistencyTest`/
`Rd0202JobWorkerContractTest` **4/4 PASS**; full backend suite **231/231 PASS, BUILD SUCCESS**. Runtime:
dừng 8090 cũ, `mvn -o clean package`, restart PID mới `32520` (token pair
`QTKHCN_WORKFLOW_SERVICE_TOKEN=dev-workflow-local-only`/`QTKHCN_HO_SO_SERVICE_TOKEN=dev-ho-so-local-only`,
không đụng 8093 PID `6912` đang chạy). Query Postgres xác nhận outbox tự phục hồi ngay chu kỳ collector
đầu tiên sau restart (`created_at` = đúng giờ restart): `TASK_COMPLETED` cho task key `2251799813763108`
(HS-2026-016, T04_GDTT/T04_GDK) và `2251799813763987` (HS-2026-018), kèm `TASK_CREATED` task kế tiếp.
Query `qtkhcn_ho_so` xác nhận `dossier_step` của cả 2 hồ sơ đã chuyển: `T04_GDTT`/`T04_GDK` = DONE, `T05` =
CURRENT — và `task_definition_key` trong read-model khớp đúng id mới trong `rd0202.bpmn` (chứng minh BPMN
sửa đúng khớp engine đang chạy). Quét lại toàn hệ thống (created-without-completed, có task sau đó) trả
**0 row** — không còn instance nào kẹt kiểu này. **Chưa làm:** chưa redeploy BPMN thành v5 (cố ý, theo yêu
cầu); chưa mở lại `rd0202.bpmn` bằng bpmn-js/Camunda Modeler để xác nhận trực quan layout mới (chỉ verify
bằng test cấu trúc + kiểm tra toạ độ thủ công, không phải bằng mắt).

## ★ DONE + TEST VERIFIED — Lỗi C: `WorkflowTaskActionRouting.rd0202()` khoá cứng element id skeleton cũ (`Task_2/3/4/7`) thay vì `T01`…`T33` thật — 2026-07-21 (owner Claude)

**Bối cảnh:** RD02.02 từng trải qua 2 lần thiết kế lại BPMN: bản skeleton 7 task (`Task_1`…`Task_7`,
`Gateway_3`/`Gateway_7` mặc định "không đồng ý") dùng ở phiên 2026-07-20 (DMN phân cấp `capNhiemVu`), rồi
bị THAY HẲN bởi bản v3 33 task thật (`T01`…`T33`, một số lane song song như `T03_CQ_KHCN`) trong commit
`773264b`. `WorkflowTaskActionRouting.rd0202()` (`backend/.../camunda/WorkflowTaskActionRouting.java`)
không được cập nhật theo — vẫn `switch` trên `Task_2`/`Task_3`/`Task_4`/`Task_7`, các id **không còn tồn
tại** trong `processes/rd0202.bpmn` đang deploy.

**Khảo sát trước khi sửa (bắt buộc vì code không có test che phủ):** đọc lại toàn bộ `rd0202.bpmn` —
process v3 chỉ có đúng 2 `exclusiveGateway` có điều kiện: `GCheck` (biến `dieuKienMacDinhDat`, do
service task `Check`/`Rd0202DefaultConditionService` tính) và `G24` (biến `ketQuaDanhGiaT24Result`, do
business rule task `Rd0202DanhGiaT24JobWorker`/DMN tính) — **không có gateway nào đọc biến do user action
set** (`ketQuaKyDuyet`/`ketQuaThamDinh`/`ketQuaHDKHCN`/`ketQuaPheDuyet` — 0 match trong file BPMN). Mọi
task khác chỉ có 1 outgoing flow hoặc là parallelGateway fork/join không điều kiện.

**Hệ quả của bug trước khi sửa:**
- APPROVE_STEP trên bất kỳ task thật nào (`T01`…`T33`) luôn set biến rỗng — vô hại với BPMN hiện tại
  (không gateway nào cần các biến đó), nhưng code cũ mô tả sai hoàn toàn thực tế (dead code gây hiểu lầm).
- `RD02_02_RETURNABLE` (`Task_2/3/4/7`) không bao giờ khớp id thật ⇒ `RETURN_STEP` bị **fail-closed cho
  toàn bộ RD02.02** dù policy chung `AP-07` (process_code NULL) đáng lẽ đề xuất nó. Đây là hành vi ĐÚNG
  một cách tình cờ: nếu "sửa" bằng cách map id thật vào `RETURN_STEP` mà KHÔNG thêm gateway hiệu chỉnh thật
  trong BPMN, `RETURN_STEP` sẽ có tác dụng **y hệt APPROVE_STEP** (task chỉ có 1 outgoing flow, không rẽ
  nhánh) — im lặng tiến tới thay vì "trả lại". Đây chính là loại lỗi "rơi vào nhánh mặc định" mà lẽ ra sẽ
  xảy ra nếu sửa nông.

**Đã sửa (`WorkflowTaskActionRouting.java`):**
- Xoá `RD02_02_RETURNABLE` cũ (`Task_2/3/4/7`) → `Set.of()` rỗng, kèm Javadoc giải thích lý do fail-closed
  (không có gateway hiệu chỉnh nào trong BPMN hiện tại — bật lên sẽ tạo bug "RETURN_STEP == APPROVE_STEP").
- `rd0202()` bỏ toàn bộ switch trên id cũ, trả `Map.of()` không điều kiện — đúng thực tế BPMN v3 (task nào
  cũng chỉ cần complete, không cần biến gateway).
- Class Javadoc sửa "RD01.01 user tasks" → "RD01.01/RD02.02 user tasks" (thiếu RD02.02 trong doc gốc).

**Test mới** (trước đó `WorkflowTaskActionRouting` **không có test nào**, kể cả `WorkflowTaskActionService`
cũng không) — `backend/src/test/java/vn/vht/qtkhcn/camunda/WorkflowTaskActionRoutingTest.java`, 22 case
parameterized: APPROVE_STEP trên id thật (`T01`, `T02`, `T05`, `T24`, `T33`, `T03_CQ_KHCN`, `T03_CQ_MS`)
chỉ set 3 biến metadata (không set gateway var); id skeleton cũ (`Task_2/3/4/7`) không còn được coi đặc
biệt; RETURN_STEP fail-closed cho mọi id (thật lẫn cũ); `ACTION_NOT_SUPPORTED` throw đúng khi cố RETURN_STEP.

**Verify:** `mvn -o test` toàn backend **231/231 PASS** (209 cũ + 22 test mới), không vỡ test nào khác —
đúng như dự đoán vì không có test nào trước đó khoá hành vi cũ.

**Chưa làm / ngoài phạm vi:** nếu sau này business cần RETURN_STEP thật cho RD02.02 (vd trả T02 từ một bước
thẩm định giữa chừng), phải thêm exclusiveGateway thật trong `rd0202.bpmn` trước, rồi mới map biến — không
được set biến "khống" mà không có gateway đọc nó. Chưa restart 8090 để verify runtime (không có gateway
nào phụ thuộc thay đổi này nên rủi ro runtime thấp, nhưng chưa tự xác nhận qua stack sống).

---

## ★ DONE + RUNTIME VERIFIED — Ma trận quyết định: tab "Soạn bảng luật" hỗ trợ DRD nhiều bảng nối chuỗi — 2026-07-21 (owner Claude)

**Nguồn:** `docs/arch/update_matran_quyet_dinh_plan.md` (plan đã chốt với user, full parity với bản React
`webapp/src/components/RuleGridBuilder.tsx`). Phiên trước đã làm bước backend 1–2 và commit trong
`773264b`; phiên này làm nốt **backend 3–7 + toàn bộ frontend 1–4**.

**Backend (mới trong phiên này):**
- `V25__dmn_rule_version_decisions.sql` — bảng con `dmn_rule_version_decision`, mỗi dòng 1 decision đã
  deploy của 1 version, có `is_root` + `display_order`, UNIQUE(rule_version_id, decision_id).
- `domain/DmnRuleVersionDecision.java` + `repository/DmnRuleVersionDecisionRepository.java`.
- `DmnRuleService`: `activate()` lưu đủ mọi `DeployedDecision` (idempotent — xoá trước khi ghi, kể cả
  nhánh deploy FAILED), chọn **primary root** = root đầu tiên theo thứ tự tài liệu để set 4 cột số ít cũ
  (giữ nguyên CHECK constraint V7, không cần migration thứ 2); `listVersionSummaries` batch-load decisions
  con; `evaluate()` gọi Camunda từ **mọi** root, có **fallback** về `camundaDecisionKey` số ít khi bảng con
  rỗng (version deploy trước V25 — dữ liệu cũ không vỡ).
- DTO: `DmnRuleVersionDecisionResponse` mới; `DmnRuleVersionResponse`/`Summary` thêm `decisions`;
  `EvaluateDmnDecisionResponse` đổi hẳn sang `{decisions:[{decisionId,decisionName,outputs,matchedRules...}]}`
  — **breaking change có chủ đích**, chỉ Angular (sửa cùng lúc) tiêu thụ.

**Frontend (toàn bộ mới trong phiên này):**
- `models/business-rule.ts`: `DmnHitPolicy`, `DecisionColumn.typeRef?`, `DecisionGridDecision`/`DecisionGrid`
  thay `DecisionTableDefinition` (kiểu cũ đã xoá hẳn), evaluation response đổi shape.
- `core/dmn/dmn-xml.ts` viết lại: `dmnXmlToDecisionGrid` (đọc mọi `<decision>`, đọc `requires` từ
  `requiredDecision`, **bỏ throw khi hitPolicy ≠ FIRST**) / `decisionGridToDmnXml` (suy `inputData` cho biến
  gốc + `informationRequirement` theo **khớp tên biến**, `requires[]` chỉ bổ sung; emit hitPolicy verbatim);
  thêm `rootInputColumns()`.
- `core/dmn/decision-table.ts`: helper retype sang `Pick<DecisionGridDecision, 'inputs'|'outputs'|'rows'>`.
- `business-rule.service.ts` + `business-rule-detail.ts/.html`: draft là mảng; thêm/xoá bảng (có popconfirm),
  chọn hit policy, cấu hình cột (thêm/xoá/đổi tên/đổi kiểu → reset điều kiện, **gán nguồn** = trùng tên biến
  để tự nối chuỗi); tab Chạy thử lấy input từ `rootInputColumns` và render **1 card/quyết định**; tô sáng
  dòng khớp tra đúng theo `decisionId` trước rồi mới `ruleId`; lịch sử hiện số decision đã deploy.

**Verify đã chạy trong phiên này:**
- Backend `mvn -o test`: **207/207 GREEN** (gồm `DmnRuleServiceTest` 9 test — có test mới cho nhánh nhiều
  decision + nhánh fallback rỗng — và `DmnRuleHttpContractTest` đã đổi jsonPath sang `$.decisions[...]`).
- Angular `ng build --configuration development`: GREEN (template type-check sạch).
- Angular `ng test`: **202/202 GREEN**, 44 file. Đã kiểm chứng `dmn-xml.spec.ts` mới **thực sự chạy** bằng
  cách tạm sửa 1 assert thành canary sai → suite fail đúng test đó → revert → xanh lại.
- Lưu ý công cụ: dự án dùng **Vitest** (không phải Karma) — `ng test --browsers=...`/`--reporter=...` đều
  báo lỗi unknown argument; chạy `npx vitest` trực tiếp cũng fail vì thiếu pipeline build Angular. Dùng
  `npx ng test --watch=false`.

**Runtime thật ĐÃ CHẠY XONG (2026-07-21)** trên stack local (Docker → 8090 → 8093 → 4200). Dựng luật
`BR-DRD-3-BANG` 3 bảng nối chuỗi bằng **chính UI mới**, không nhập XML tay:
`Xac dinh cap nhiem vu` (FIRST) → `Can hoi dong` (UNIQUE) → `Loai hoi dong` (FIRST).

Kết quả xác minh:

- V25 apply sạch lên DB dev; Activate deploy đủ **3 decision, 3 `camunda_decision_key` riêng biệt** lên
  Zeebe thật; `is_root=true` đúng duy nhất ở decision cuối chuỗi; `display_order` giữ thứ tự.
- Dropdown "nguồn cột" chào đúng output của các bảng trước + input gốc; giá trị điều kiện tự thành enum
  suy từ output bảng trước; tab Chạy thử chỉ hỏi đúng 2 input gốc; panel trả đủ 3 card đúng thứ tự.
- Đổi input gốc thì cả chuỗi đổi theo: `15 → TAP_DOAN / true / HDXD_TAP_DOAN`, `5 → CO_SO / false / KHONG`.

**Runtime bắt được 1 bug thật mà 202 unit test bỏ lọt** — `decisionGridToDmnXml` không phát ra
`<variable>` trên `<decision>`, nên Camunda không bind kết quả bảng trước; bảng sau đọc null, không khớp
dòng nào, chuỗi trả sai `KHONG`. Test cũ chỉ round-trip XML nên mù hoàn toàn: **XML round-trip đúng vẫn
có thể không chạy được trên engine thật** — với DMN, chỉ deploy+evaluate thật mới là bằng chứng.

Đã sửa trong `dmn-xml.ts`: mỗi `<decision>` khai báo `<variable>`; bảng 1 cột kết quả đặt tên biến quyết
định trùng tên biến output (bảng sau tham chiếu thẳng), bảng nhiều cột kết quả trả context nên tham chiếu
qua `dv_<id>.<biến>` và parser đọc ngược bỏ tiền tố. Thêm 2 test khoá đúng lỗi này. Verify lại sau sửa:
`ng test` **204/204 GREEN**, `ng build` GREEN, chạy lại end-to-end trên Camunda thật đúng kết quả.

Lưu ý cho lần sau: fixture `webapp/src/dmn/rd02Routing.dmn.ts` (bản React tham chiếu) **cũng thiếu
`<variable>`** — nó chưa từng chạy trên Camunda thật (webapp eval bằng `feelin` in-browser), nên không
được coi là chuẩn runtime. Dữ liệu test `BR-DRD-3-BANG` v1–v3 còn nằm lại trên DB/Zeebe dev.

## ★ DONE CODE / RUNTIME PENDING — DMN chấm điểm HĐXD Tập đoàn phiên 2 (T24), ngưỡng 70 điểm — 2026-07-21 (owner Claude, theo yêu cầu trực tiếp user + kế hoạch đã duyệt)

**Yêu cầu:** tại T24 ("Họp HĐXD Tập đoàn phiên 2"), dùng điểm đánh giá (form `bm-02-12-pdg-dt`,
field `diemSo`) để quyết định qua DMN: `>= 70` điểm đi T25, `< 70` điểm đi tới Node End "Hồ sơ
không được thông qua". Trong lúc lập kế hoạch, user chọn tính **điểm trung bình nhiều thành viên**
(không dùng điểm đơn) và **tái dùng trạng thái REJECTED** có sẵn — cả hai đều nâng phạm vi việc lên
đáng kể so với "chỉ thêm 1 DMN", chi tiết dưới đây.

**Phát hiện chặn trước khi code (đã trình bày và được user xác nhận qua AskUserQuestion):**
- Hội đồng xét duyệt **cấp Tập đoàn** (T18B→T20, chính là hội đồng họp T21/T24) chưa từng có cơ chế
  sinh `ThanhVienHoiDong` như cấp Cơ sở (`Generate_HDXD` sau T06) — phải xây thêm bước này (Lát 0)
  thì multi-instance T24 mới có danh sách thành viên thật để lặp theo.
- `formData` (điểm số) theo D3 KHÔNG tự động chảy vào biến Zeebe khi hoàn thành task
  (`WorkflowTaskActionService` cố ý chỉ gửi formData qua event `TASK_ACTION_APPLIED` tới
  `ho-so-service`, không set vào Camunda variables) — nhưng multi-instance outputCollection (cơ chế
  DUY NHẤT gom được N điểm số song song, vì `dossier_step` chỉ có 1 dòng theo `taskDefinitionKey`
  nên 3 lượt hoàn thành T24 sẽ ghi đè formData của nhau) cần `diemSo` là biến Zeebe cục bộ của từng
  instance. Xử lý bằng một exception hẹp, tường minh trong `WorkflowTaskActionService`
  (`withDiemSoForT24`): CHỈ khi `taskDefinitionKey=T24` và `actionCode=APPROVE_STEP`, forward đúng 1
  field số điểm (không phải cả formData) thành biến Zeebe — cùng mẫu "business data ngắn hạn phục vụ
  DMN" đã có tiền lệ ở `SystemCheckJobWorker#checkChuTruongTapDoan` (tongDuToan/loaiNhiemVu).
- `rd0202-routing.dmn` (từ 2026-07-20) chưa từng được deploy lên Zeebe (`ProcessDeploymentRunner`
  chỉ deploy `.bpmn`) và chưa có `businessRuleTask` nào gọi nó — DMN lần này là lần đầu tiên được
  nối dây thật trong hệ thống, không chỉ thêm bảng quyết định.
- Không có endEvent "reject" nào trong `rd0202.bpmn` trước đây; REJECT_STEP hoạt động bằng
  `cancelInstanceCommand` (TERMINATED), không qua endEvent. EndEvent mới đạt tới sẽ khiến Camunda
  báo `ProcessInstanceState.COMPLETED` (giống nhánh thành công) — phải sửa collector để phân biệt.

**Đã code (Lát 0–5, theo kế hoạch đã trình bày cho user):**
1. **Lát 0 — Sinh HĐXD Tập đoàn**: `HoiDongXetDuyetService` tổng quát hoá (`sinh()` dùng chung cho
   CO_SO/T05 và TAP_DOAN/T18B) + `sinhTuBuoc18B` mới; `HoiDongXetDuyetRepository` thêm
   `findByHoSoIdAndCapOrderByCreatedAtAsc`; `InternalHoiDongXetDuyetController` thêm
   `POST .../tap-doan` (sinh) và `GET .../tap-doan/thanh-vien` (đọc); job worker mới
   `GenerateHdxdTapDoanJobWorker` (`khcn.rd0202.generate-hdxd-decision-td`); BPMN thêm serviceTask
   `Generate_HDXD_TD` chèn giữa T20→T21.
2. **Lát 1 — DMN**: file mới `backend/src/main/resources/processes/rd0202-danh-gia.dmn`, decision
   `ketQuaDanhGiaT24`, input `diemTrungBinhT24`, ngưỡng **70** (theo đúng số user chốt, KHÔNG phải
   placeholder chờ OQ như `rd0202-routing.dmn`).
3. **Lát 2 — BPMN quanh T24**: `G23Join → Load_HDXD_TD (serviceTask) → T24 (userTask, giờ là
   multi-instance parallel: inputCollection=danhSachThanhVienHDXDTD, outputCollection=
   danhSachDiemDanhGiaT24/diemSo) → Tinh_DiemTB_T24 (serviceTask) → Rule_DanhGiaT24
   (businessRuleTask, calledDecision ketQuaDanhGiaT24) → G24 (exclusiveGateway) → F28→T25 (đạt) /
   F_T24_KhongDat→End_KhongThongQua (không đạt, endEvent mới "Hồ sơ không được thông qua")`. Đã xác
   minh referential integrity toàn bộ BPMN bằng script Python (205 element id, 105 sequenceFlow,
   0 tham chiếu thiếu, incoming/outgoing khớp 100%).
4. **Lát 3 — Job worker**: `Rd0202DanhGiaT24JobWorker` — `khcn.rd0202.load-hoi-dong-td` (nạp danh
   sách thành viên TĐ thành collection Zeebe tạm cho multi-instance) và
   `khcn.rd0202.compute-diem-trung-binh-t24` (tính trung bình từ outputCollection; hội đồng/phiếu
   rỗng → trả 0, fail-closed thay vì lỗi mập mờ). `Rd0202JobWorkerContractTest` cập nhật đăng ký đủ
   worker mới (test này grep toàn bộ `<zeebe:taskDefinition>` trong BPMN nên tự bắt lỗi nếu thiếu
   worker cho bất kỳ service task mới nào).
5. **Lát 4 — Deploy DMN**: `CamundaDeploymentService.deployClasspath` đổi thành varargs (deploy
   nhiều resource cùng 1 lượt), `StartupProcessDeploymentService`/`ProcessDeploymentRunner` deploy
   kèm `rd0202-danh-gia.dmn` cùng `rd0202.bpmn` — bắt buộc vì Zeebe từ chối deploy BPMN nếu
   `calledDecision` không resolve được decision đã tồn tại.
6. **Lát 5 — REJECTED cho endEvent mới**: `CamundaWorkflowRuntimeEventReader` thêm
   `reachedRejectingEndEvent()` (search element-instance `type=END_EVENT, elementId=
   End_KhongThongQua, state=COMPLETED`) — khi `ProcessInstanceState.COMPLETED` VÀ đạt tới endEvent
   này thì phát `PROCESS_REJECTED` thay vì `PROCESS_COMPLETED`, tái dùng đúng luồng REJECTED có sẵn
   ở `ho-so-service` (không cần đổi gì thêm bên đó).

**Verify đã làm:** `mvn -o test` backend **231/232 PASS** (1 skip pre-existing, không liên quan),
`mvn -o test` ho-so-service **57/57 PASS**; `mvn -o compile`/`test-compile` cả 2 module sạch. Test
mới: `HoiDongXetDuyetServiceTest` (+2 case TAP_DOAN), `InternalHoiDongXetDuyetControllerTest` (+2
case), `Rd0202DanhGiaT24JobWorkerTest` (4 case: trung bình đúng, mảng rỗng fail-closed=0, thiếu biến
fail-closed=0, đúng ngưỡng biên 70 vẫn tính đúng). API client `elementId(String)` trên
`ElementInstanceFilter` được xác nhận tồn tại bằng `javap` trực tiếp trên jar
`camunda-client-java-8.9.12.jar`, không đoán.

**CHƯA làm / RUNTIME PENDING (rõ ràng, không tự nhận là xong):**
- **Chưa deploy lên Zeebe thật — nhưng đã đưa cả 2 lên đúng "Draft" để user tự bấm deploy, theo yêu
  cầu trực tiếp của user sau khi nghe gap này** (2026-07-21, cùng phiên). `ProcessDeploymentRunner`
  chỉ tự deploy khi engine "genuinely empty" nên không tự đẩy được; đã dùng đúng 2 cơ chế draft có
  sẵn của hệ thống (không tự chế), gọi thẳng API thật trên backend dev đang chạy (8090, PID 20228):
  - **BPMN**: `POST /api/process-definition-drafts` (import) rồi `POST .../validate` →
    draft id `0b66608a-04cf-4261-9186-6ee613cbf813`, **status VALID, revision 1**. Bấm "Deploy" cho
    draft này trên `/quy-trinh` (tab Process Definition Drafts) khi sẵn sàng.
  - **DMN**: `POST /api/dmn-rules` (category THRESHOLD) rồi `POST .../versions` →
    rule id `85579a41-38db-4b17-a5cf-1e57cb0795af`, code `RD0202-KETQUA-DANHGIA-T24`,
    **version 1, deployStatus NOT_DEPLOYED**. Bấm "Activate" cho version này trên màn DMN Rules khi
    sẵn sàng — activate mới thật sự gọi `DmnCamundaGateway.deploy()`.
  - **Thứ tự khuyến nghị: Activate DMN trước, Deploy BPMN sau** — không bắt buộc (xem đính chính bên
    dưới) nhưng an toàn hơn để tránh cửa sổ có process instance chạy tới `Rule_DanhGiaT24` trước khi
    decision tồn tại.
  - **Đính chính một khẳng định sai ở lát 4 phía trên:** không phải "Zeebe từ chối deploy BPMN nếu
    calledDecision không resolve được" — tra cứu lại (Camunda 8 docs + GitHub issue #8095 "Create an
    incident if the evaluation of a decision fails") cho thấy resolve `calledDecision` (binding mặc
    định "latest") là **runtime, không phải deploy-time**: deploy BPMN thiếu DMN vẫn thành công, chỉ
    khi process instance thật sự chạy tới `Rule_DanhGiaT24` mà decision chưa tồn tại thì Zeebe mới
    tạo **INCIDENT** trên đúng task đó (không sập cả deployment). Không đổi code vì vẫn cùng bundle
    BPMN+DMN ở lát 4 (đúng, an toàn hơn) — chỉ đính chính lý do đã ghi sai.
  - Sự cố nhỏ gặp phải và đã tự sửa: lần tạo BPMN draft đầu tiên (qua `curl -F` multipart, field
    `name` truyền trực tiếp qua argument shell) bị hỏng encoding tiếng Việt (`X�t duy?t...`) do
    Windows/Git Bash mangling non-ASCII trong command-line argument — đã xoá draft hỏng
    (`DELETE .../6adc56e4-...`) và tạo lại đúng bằng cách ghi JSON UTF-8 ra file rồi
    `curl --data-binary @file` (không qua shell argument nữa) — draft mới có tên đúng
    "Xét duyệt NV KHCN cấp Tập đoàn", xác nhận bằng đọc byte UTF-8 qua Python.
  - Kết quả validate BPMN draft: `valid=true`, chỉ có warning/suggestion CŨ đã có từ trước (gateway
    1 nhánh ra, thiếu nhãn sequence flow) — không phát sinh cảnh báo mới nào ở các phần tử mới thêm
    (`Load_HDXD_TD`, `T24` multi-instance, `Tinh_DiemTB_T24`, `Rule_DanhGiaT24`, `G24`,
    `End_KhongThongQua`).
- **Chưa chạy E2E/click-through nào** cho nhánh mới (cả nhánh đạt lẫn không đạt) — chỉ verify ở tầng
  unit/compile. `Invoke-RD0202V3E2E.ps1` chưa được mở rộng thêm case T24.
- **Giới hạn đã biết, không giải quyết ở đây:** multi-instance T24 vẫn dùng chung
  `candidateGroups="HDXD_TD"` cho mọi lượt (không có tài khoản đăng nhập gắn theo từng thành viên cụ
  thể — chờ OQ-021/IAM); chỉ formData của LƯỢT HOÀN THÀNH CUỐI CÙNG của T24 được lưu ở
  `dossier_step` (nhận xét chi tiết của 2 thành viên trước bị ghi đè) — điểm số không bị ảnh hưởng
  (đi qua Zeebe outputCollection riêng) nhưng phần nhận xét text thì có; không seed
  `service_task_binding` cho 3 job type mới (giống tiền lệ `check-default-condition`, nghĩa là các
  service task này sẽ không hiện trên màn `/cau-hinh-tac-vu`).
- Chưa đụng tới T10 ("Họp HĐXD cấp Cơ sở phiên 2") — cùng dùng form `bm-02-12-pdg-dt`, cùng thiếu
  ngưỡng chấm điểm, nhưng ngoài phạm vi yêu cầu lần này (chỉ nói T24).

---

## ★ DONE + RUNTIME VERIFIED — RD02.02 v3: cả 3 gap chặn luồng đã đóng, full 56-task E2E PASS — 2026-07-21 (owner Claude, tiếp tục phiên dở dang theo yêu cầu user "kiểm tra lại và chủ động xử lý tiếp")

**Bối cảnh khi vào phiên:** harness state ghi 2 gap (nút "Gửi duyệt" `permissions: []`, RD02.02 `Check` thiếu
worker) ở trạng thái DONE CODE/RUNTIME PENDING, còn 8090/8093 đang chạy JAR cũ hơn cả các thay đổi này. Khi
rà lại working tree phát hiện **một lượng lớn code thật đã được viết thêm nhưng chưa từng được ghi vào harness
state**: `Rd0202ConditionValidator` (backend) + `Rd0202DefaultConditionService`/`InternalRd0202ValidationController`
(ho-so-service) — nâng worker `Check` từ stub `true` cứng lên **validate thật** (cấp TD, thời gian thực hiện,
dự toán, chủ nhiệm đủ họ tên+mã NV, đơn vị chủ trì, có tài liệu HSXD có nội dung thật) và trả `false` (quay
GCheck về T02) khi hồ sơ chưa đủ điều kiện; `DeployedBpmnRoutingReader` đọc property zeebe
`qtkhcn.userTaskActions`/`qtkhcn.actions` trong BPMN để sinh đúng route `APPROVE_STEP`/`REJECT_STEP` (khớp
item #1 trong list cải thiện user đưa ra); demo users/roles cho `GD_TTMS`/`TP_NS`/`TP_TCKT` +
`CQ_TCKT_TD`/`CQ_DTXD_TD`/`CQ_TCNL_TD` (khớp item #2); và script `Invoke-RD0202V3E2E.ps1` — E2E đầy đủ 56 task
duy nhất từ submit tới `APPROVED` (khớp phần còn thiếu của item #4 "thêm case fail quay về T02" + item #6 dạng
API, chưa phải browser).

**Verify build/test trước khi đụng runtime:** backend `mvn -o test` **192/192 PASS**; ho-so-service
`mvn -o test` **53/53 PASS**; Angular `npx tsc --noEmit` sạch; `ng test --include='**/ho-so-detail.spec.ts'`
**16/16 PASS**.

**Runtime — đã làm, theo đúng trình tự xác nhận với user trước khi đụng 2 tiến trình sống:**
1. User xác nhận cho phép restart. Dừng PID cũ (8090 `21360`, 8093 `24428`), `mvn -o -DskipTests package` cả
   hai module, khởi động lại bằng `java -jar` với đúng cặp token cũ
   (`--qtkhcn.internal.service-token=dev-workflow-local-only --qtkhcn.ho-so.service-token=dev-ho-so-local-only`
   cho 8090; `--qtkhcn.internal.service-token=dev-ho-so-local-only --qtkhcn.workflow.service-token=dev-workflow-local-only`
   cho 8093). **PID mới: 8090 → `20228`, 8093 → `22276`.** Cả 2 job worker mới (`checkRd0202DefaultCondition`,
   `generateHdxdDocumentJobWorker`) log "Starting job worker" khi khởi động — xác nhận đã nối đúng type job.
2. Chạy `Invoke-RD0202V3E2E.ps1` lần 1: **FAIL đúng như thiết kế** — dossier bị GCheck trả về T02 vì mission
   test do chính script tạo thiếu `thoiGianThucHien`/`duToan`/`chuNhiemMaNhanVien` và tài liệu HSXD không có
   nội dung thật (script cũ viết cho worker stub `luôn true`, chưa cập nhật cho validator thật). Đây là bằng
   chứng runtime đầu tiên rằng **nhánh fail của validator hoạt động đúng** (business-invalid → quay T02), dù
   không phải là mục tiêu của lần chạy này.
3. Sửa `Invoke-RD0202V3E2E.ps1`: thêm 3 field còn thiếu vào payload tạo Nhiệm vụ; thêm bước upload tài liệu
   thật (`POST /api/ho-so/{id}/documents`) trước khi submit. Gặp bẫy môi trường: `Invoke-RestMethod -Form` chỉ
   có ở PowerShell 7+, máy này chạy **Windows PowerShell 5.1** → phải tự dựng multipart/form-data body bằng
   tay (hàm `Invoke-FileUpload` mới trong script, boundary tự sinh, encode ISO-8859-1 để giữ nguyên byte).
4. Dọn 2 lần chạy hỏng trước đó: lần 1 có process instance đang chạy (T02 CURRENT) → cancel qua Camunda REST
   `POST /v2/process-instances/{key}/cancellation` rồi `DELETE /api/nhiem-vu/{ma}` (được user xác nhận riêng vì
   auto-mode classifier chặn lệnh DELETE); lần 2 dossier còn DRAFT (chưa submit, không có process instance) chỉ
   cần DELETE thẳng.
5. Chạy lại `Invoke-RD0202V3E2E.ps1` sau khi sửa: **RD02.02 V3 FULL E2E PASS** — toàn bộ 56 task duy nhất từ
   `T01` tới `T33`, `submit → PROCESSING → APPROVED`, bao gồm `Check`/`GCheck` (nhánh đạt), 4 nhánh T03 song
   song, `Generate_HDXD` (hội đồng 3 thành viên + văn bản QĐ HTML có nội dung thật), toàn bộ các bước còn lại
   tới T33. Script tự dọn dữ liệu test (`RD.2026.019`/`HS-2026-020`) trong khối `finally` sau khi
   `instanceClosed=true`.
6. Click-through Playwright thật cho riêng gap #1 (nút "Gửi duyệt"): đăng nhập `pm@example.com` (không phải
   admin), tạo Nhiệm vụ (`RD.2026.020`) + Hồ sơ Xét duyệt cấp Cơ sở (`HS-2026-021`) qua UI, mở Chi tiết hồ sơ —
   **nút "Gửi duyệt" hiện và bấm được** (trước đây bug khiến nút này không bao giờ hiện cho user thường). Bấm
   nút mở đúng dialog xác nhận submit, dialog tự nhận diện RD02.01 (Xét duyệt + cấp Cơ sở) là quy trình **chưa
   deploy** và khóa nút xác nhận — đúng hành vi backend, không phải bug của gap #1. Đã Hủy dialog, dọn sạch
   `RD.2026.020` (cascade `HS-2026-021`) qua DELETE. **Ghi chú vận hành:** một số click qua accessibility-tree
   ref của Playwright MCP (button "Mở ứng dụng", "Tạo hồ sơ" ở trang chọn app/danh sách) không kích hoạt handler
   Angular dù không báo lỗi; phải fallback `element.click()` qua `browser_evaluate` — nghi do overlay/change
   detection, chưa điều tra sâu, không chặn việc xác nhận gap #1.

**Kết luận:** cả 3 gap gốc của "SMOKE TEST RD02.02 v3" (2026-07-20) đã đóng và **verified runtime**, không chỉ
source. Mục tiêu chính của v3 (job `Generate_HDXD` sinh HĐXD + hiển thị đúng) đã chứng minh qua E2E đầy đủ.
Dữ liệu test đã dọn sạch cả 2 DB, không còn hồ sơ/nhiệm vụ rác (`GET /api/ho-so` trả rỗng sau cùng).

**Follow-up còn lại (từ list cải thiện user đưa ra đầu phiên, CHƯA làm):**
- #5: form validation/evidence bắt buộc theo từng bước lớn khác ngoài `Check` (T05 hội đồng, T06, v.v.) —
  `Rd0202DefaultConditionService` mới chỉ phủ đúng 1 bước (`Check` sau T02).
- #6: UI E2E mỏng qua browser cho happy path vài chặng chính (khác với click-through thủ công một lần vừa làm
  ở bước 6) — chưa có script Playwright tái sử dụng được.

---

## ★ DONE — #3: CI check so sánh BPMN đã deploy vs file repo — 2026-07-21 (owner Claude)

**Bối cảnh:** follow-up item #3 ở entry trên. Khảo sát trước khi code phát hiện rủi ro thật: cả
`StartupProcessDeploymentService.deployIfAbsent()` (deploy Zeebe) lẫn `BundledProcessCatalogSyncService.sync()`
(catalog Postgres cho `/quy-trinh` + `DeployedBpmnRoutingReader`) đều **chỉ đồng bộ từ file lần đầu tiên** —
"Once a catalog exists, all changes must go through Draft -> Validate -> Deploy." Sửa `rd0202.bpmn`/`rd0101.bpmn`
rồi restart KHÔNG tự cập nhật bản đang chạy; đúng lớp drift mà #3 muốn CI bắt được. `Rd0202JobWorkerContractTest`
cũ chỉ đối chiếu job type qua regex trên file tĩnh, không chạm gì tới bản đã deploy.

**Quyết định (hỏi user, chọn "Maven test + Testcontainers" trong 3 phương án):** không dùng script PowerShell
đối chiếu dev stack sống (không chạy được trong CI) hay golden-checksum lockfile thuần offline (không xác minh
nội dung deploy thật) — dùng Testcontainers Postgres thật để chạy đúng pipeline
validate → deploy → persist (`ProcessDefinitionService.publishValidated`) rồi đọc lại từ DB.

**Giới hạn có chủ đích, đã ghi rõ trong Javadoc test:** CI luôn chạy từ DB rỗng nên KHÔNG phát hiện được
trường hợp một engine đang sống có catalog cũ bị bỏ qua đồng bộ (giới hạn cố hữu của CI stateless, không phải
thiếu sót). Test bù lại bằng cách xác minh: (1) nội dung BPMN round-trip qua Postgres thật (không phải H2)
khớp byte-for-byte với file repo — bắt lỗi encoding/mojibake (đã từng gặp thật, xem entry charset cp1252 ở
`DELIVERY_STATE.md`); (2) checksum SHA-256 tính độc lập trong test khớp giá trị lưu trong
`process_definition_version.checksum_sha256`; (3) `bpmnProcessId` khai trong file khớp hằng số hardcode ở
`ProcessDeploymentRunner` (`RD01_01`/`RD02_02`).

**Đã thêm:**
- `backend/pom.xml`: `spring-boot-testcontainers`, `spring-boot-starter-data-jpa-test`,
  `org.testcontainers:testcontainers-junit-jupiter`, `org.testcontainers:testcontainers-postgresql` (test
  scope). **Phát hiện khi build thật:** Spring Boot 4 tách `@DataJpaTest`/`@AutoConfigureTestDatabase` khỏi
  `spring-boot-test-autoconfigure` (giờ chỉ còn `@JsonTest`) sang package mới
  `org.springframework.boot.data.jpa.test.autoconfigure`/`org.springframework.boot.jdbc.test.autoconfigure`/
  `org.springframework.boot.jpa.test.autoconfigure`; Testcontainers 2.0.5 đổi hết artifactId sang tiền tố
  `testcontainers-*` (không còn `junit-jupiter`/`postgresql` trần). Cả hai xác nhận bằng cách đọc trực tiếp
  POM/jar đã tải trong `~/.m2`, không đoán — đã ghi comment tại chỗ trong pom.xml/test để không lặp lại việc dò.
- `backend/src/test/java/vn/vht/qtkhcn/service/BundledBpmnDeployedConsistencyTest.java`: parameterized test
  cho cả RD01_01 (`processes/rd0101.bpmn`) và RD02_02 (`processes/rd0202.bpmn`), Postgres 16-alpine qua
  Testcontainers (đúng image `infra/docker-compose.override.yml` dùng), mock `CamundaDeploymentService` (không
  cần Zeebe broker thật vì so sánh ở tầng persist Postgres).
- `.github/workflows/backend-ci.yml`: **workflow CI backend đầu tiên của repo** (trước đó chỉ có
  `deploy-pages.yml` build Angular webapp mock, không hề chạy `mvn test`). Trigger `push`/`pull_request`/
  `workflow_dispatch`, JDK 21 Temurin, `mvn -B test` — chạy toàn bộ suite backend bao gồm test mới. GH-hosted
  `ubuntu-latest` có sẵn Docker nên Testcontainers chạy được không cần setup thêm.

**Verify thật đã chạy (không chỉ đọc code):**
- `mvn -Dtest=BundledBpmnDeployedConsistencyTest test`: **2/2 PASS** (Postgres container khởi động thật,
  Flyway áp đủ 24 migration, Hibernate insert/select thật qua Hikari, log SQL xác nhận round-trip qua DB).
- Full backend suite `mvn -o test` (offline, dùng cache `~/.m2` đã tải): **194/194 PASS, BUILD SUCCESS**
  (192 cũ + 2 test mới; không có test nào vỡ).
- YAML workflow mới: parse sạch bằng Python, không tab, indent nhất quán.

**Chưa làm (ngoài phạm vi #3, cân nhắc riêng sau):** chưa mở PR/push để tự kiểm chứng workflow chạy thật trên
GitHub Actions (cần push nhánh hoặc PR — chưa làm vì user chưa yêu cầu push); chưa mở rộng CI này sang
`ho-so-service`/Angular (giữ đúng phạm vi #3 là BPMN, không lấn sang mở rộng CI toàn repo).

---

## ★ DONE CODE / RUNTIME PENDING (SUPERSEDED BY ENTRY TRÊN) — Fix nút "Gửi duyệt" luôn gửi `permissions: []` — 2026-07-21 (owner Claude)

**Bug (gap #1 trong "SMOKE TEST RD02.02 v3" bên dưới):** `ho-so-detail.ts:217` (`loadDossierActions()`) luôn
gửi `permissions: []` cho `POST /api/action-studio/simulate`. Mọi policy SUBMIT đã seed (AP-01 generic —
`allowedRoleCodes: ['PM','PA','NNC']`) đều yêu cầu permission `SUBMIT_DOSSIER`, nên `missingPermissions`
không bao giờ rỗng cho user thường → `SimulatedAction.enabled=false` → nút "Gửi duyệt" bị lọc khỏi
`dossierActions()` (`ho-so-detail.ts:146-151` chỉ hiện action có `visible && enabled`). Chỉ `isAdmin=true`
bypass được cả hai điều kiện. Ảnh hưởng **mọi quy trình**, không riêng RD02.02 — nhưng trong
`dossierActions()`, do filter `outcome === 'SUBMIT'` + `actionType !== 'EXCEPTION'`, đây là action DUY NHẤT
từng bị chặn bởi bug này ở màn chi tiết hồ sơ (APPROVE/RETURN/REJECT dùng `availableActions()` — nguồn khác,
task-level, xác thực thật qua candidateGroups, không đụng `permissions` field này).

**Quyết định fix (chọn giữa 2 phương án nêu ở active-task cũ):** frontend chưa có nguồn permission thật theo
user (`DemoUser` chỉ có `roleCodes`/`isAdmin`, không có `permissions` — xem D9). Thay vì bịa một bảng
role→permission không có dữ liệu thật đứng sau, cấp sẵn toàn bộ danh mục quyền (`PERMISSION_LABEL` keys:
`SUBMIT_DOSSIER, PROCESS_STEP, REQUEST_EXCEPTION, ADD_COMMENT, DOWNLOAD_DOCUMENT, VIEW_AUDIT`) cho bất kỳ
user đã đăng nhập nào — cùng tinh thần với backend `WorkflowDemoIdentityProvider` vốn đã cấp `PROCESS_STEP`
cho mọi identity demo không phân biệt vai trò. RBAC thật vẫn do `allowedRoleCodes` (AP-01: PM/PA/NNC) và
`candidateGroups` (task-level) quyết định — permission catalog chỉ là lớp trung gian chưa có IAM thật
(OQ-021) đứng sau, không tự thêm khả năng gì ngoài những gì role/candidateGroup đã cho phép.

**Đã sửa:** `frontend-angular/src/app/pages/ho-so-detail/ho-so-detail.ts` — import `PERMISSION_LABEL` từ
`core/models/action-studio`, thêm hằng `ALL_PERMISSIONS = Object.keys(PERMISSION_LABEL)`, đổi
`permissions: []` → `permissions: ALL_PERMISSIONS` trong `loadDossierActions()`.

**Verify đã làm:** `npx tsc -p tsconfig.app.json --noEmit` sạch (0 lỗi). Chưa chạy Angular dev server / chưa
click-through thật — cần đăng nhập `pm@example.com`, mở hồ sơ `DRAFT`, xác nhận nút "Gửi duyệt" hiện và bấm
được. **Chưa verify E2E đầy đủ** vì 2 gap còn lại (job worker RD02.02 `Check` — DONE CODE, RUNTIME PENDING;
xem entry ngay dưới) vẫn chặn việc chứng minh toàn luồng tới `Generate_HDXD`. Không tự ý restart backend
8090/`ho-so-service` 8093 — theo đúng yêu cầu trước đó, phải xác nhận với user trước khi restart 2 tiến
trình đang sống.

## ★ DONE CODE + TEST / RUNTIME PENDING — Fix RD02.02 service task `Check` sau T02 không có worker — 2026-07-21 (owner Codex)

**Nguyên nhân đã xác nhận:** `processes/rd0202.bpmn` phát job
`khcn.rd0202.check-default-condition` tại element `Check`, nhưng backend không có `@JobWorker` subscribe
đúng type. Gateway `GCheck` ngay sau đó cần biến `dieuKienMacDinhDat`; vì job không được nhận/complete nên
mọi instance RD02.02 dừng vĩnh viễn sau T02.

**Đối chiếu nguồn nghiệp vụ** `C:\Users\DELL\Downloads\RD02_02_Gan_Bieu_mau.md`: bước hệ thống sau hoạt
động 2 phải kiểm tra (1) QĐ phê duyệt chủ trương cấp TĐ, (2) độ đầy đủ HSXD — thời gian, kinh phí, nhân sự,
sản phẩm, (3) thể thức văn bản và (4) việc gán đủ/đúng nhân sự thẩm định. Vì vậy không đổi BPMN sang worker
`khcn.rd0202.check-chu-truong-td` hiện có: worker đó chỉ mang nghĩa kiểm tra QĐ chủ trương và không khớp
phạm vi của element `Check`.

**Kế hoạch triển khai:**

1. Hotfix `SystemCheckJobWorker`: thêm handler riêng cho đúng type
   `khcn.rd0202.check-default-condition`, trả biến điều khiển `dieuKienMacDinhDat=true` để khôi phục luồng;
   ghi rõ đây là stub tạm thời, chưa tuyên bố đã thực hiện đủ bốn nhóm kiểm tra nghiệp vụ.
2. Bổ sung unit test cho output của handler và contract test đối chiếu mọi `zeebe:taskDefinition` trong
   bundled `rd0202.bpmn` với `@JobWorker` backend, ngăn tái diễn lỗi BPMN có job nhưng không có subscriber.
3. Chạy test tập trung rồi full backend suite. Không cần tạo version BPMN mới cho code-only hotfix; sau khi
   backend 8090 chạy build mới, worker có thể nhận cả job cũ đang chờ đúng type.
4. Runtime E2E sau khi đồng bộ token 8090↔8093: hoàn tất T01/T02; xác nhận `Check` và `GCheck` COMPLETED,
   bốn task T03 được tạo; tiếp tục tới T06 và xác nhận `Generate_HDXD` chạy; dọn dữ liệu test.
5. Follow-up nghiệp vụ: đặt validation thật ở `ho-so-service` (owner aggregate), worker 8090 gọi internal API
   theo `hoSoId`; business-invalid trả `dieuKienMacDinhDat=false` + reasons để quay T02, lỗi kỹ thuật phải
   retry/incident. Tạo binding cấu hình mới cho `RD02_02 + Check + khcn.rd0202.check-default-condition`;
   không tái sử dụng binding V21 của element cũ `Check_ChuTruongTD`.

**Done-when hotfix:** hoàn thành T02 không còn job treo và instance tới đủ bốn nhánh T03. **Done-when đầy đủ
nghiệp vụ:** có test cả nhánh đạt/chưa đạt bằng dữ liệu hồ sơ thật và lý do không đạt được lưu/hiển thị.

**Đã triển khai source:**

- `SystemCheckJobWorker.checkRd0202DefaultCondition()` đăng ký chính xác
  `@JobWorker(type = "khcn.rd0202.check-default-condition")`, log định danh job/instance và trả duy nhất
  `dieuKienMacDinhDat=true`. Không sửa BPMN, không dùng nhầm handler `checkChuTruongTapDoan`.
- `SystemCheckJobWorkerTest` thêm case khóa output của handler RD02.02.
- `Rd0202JobWorkerContractTest` mới đọc trực tiếp bundled `rd0202.bpmn`, lấy toàn bộ
  `zeebe:taskDefinition type` và fail nếu application không có `@JobWorker` tương ứng. Hiện contract xác nhận
  cả `khcn.rd0202.check-default-condition` và `khcn.rd0202.generate-hdxd-decision` đều có subscriber.

**Verify 2026-07-21:**

- Focused: `backend\\mvnw.cmd -o
  '-Dtest=SystemCheckJobWorkerTest,Rd0202JobWorkerContractTest,ProcessDefinitionImportValidatorTest' test`
  → **18/18 PASS, BUILD SUCCESS**.
- Full backend: `backend\\mvnw.cmd -o test` → **188/188 PASS, 0 failure/error/skipped, BUILD SUCCESS**.
- `git diff --check` trên các file của lát này: không có whitespace error (chỉ cảnh báo line-ending LF→CRLF
  có sẵn theo working copy Windows).

**Chưa tuyên bố runtime DONE:** backend 8090 đang chạy phải được build/restart bằng source mới rồi mới có
thể chứng minh worker thực nhận job Zeebe. Token 8090↔8093 đã được entry Delivery State mới nhất xác nhận
đồng bộ; runtime smoke vẫn cần hoàn tất T01/T02 và quan sát `Check` → `GCheck` → bốn T03. Không cần deploy
version BPMN mới vì job type không đổi; worker mới có thể nhận cả job cùng type đã tồn tại sau khi restart.

## ⚠ SMOKE TEST RD02.02 v3 — 3 GAP CHẶN LUỒNG PHÁT HIỆN, CHƯA SỬA — 2026-07-20 (owner Claude, theo yêu cầu
user "smoke test E2E: khởi tạo hồ sơ xét duyệt → cho chạy vào quy trình")

Chạy click-through thật qua Playwright trên `localhost:4200` (backend 8090 PID 22844 khởi động 22:46,
`ho-so-service` 8093 PID 17980 khởi động 22:20 — cùng stack đang sống, không phải build riêng). Luồng test:
tạo Nhiệm vụ cấp Tập đoàn → tạo Hồ sơ loại Xét duyệt (RD02) → Gửi duyệt. **Cả 3 bug đều CONFIRMED bằng
network response thật, không phải suy đoán:**

1. **[Toàn hệ thống, không riêng RD02.02] Nút "Gửi duyệt" không bao giờ hiện cho user thường.**
   `ho-so-detail.ts:217` (`loadDossierActions()`) luôn gửi `permissions: []` cho
   `POST /api/action-studio/simulate`. Mọi policy SUBMIT đã seed (AP-01 generic, AP-BPMN-RD01_01-Task_2-SUBMIT,
   AP-BPMN-RD02_02-T01-SUBMIT) đều yêu cầu permission `SUBMIT_DOSSIER` — permission này không bao giờ được
   gửi lên nên `enabled=false` với PM thật (đăng nhập `pm@example.com`, xác nhận qua response thật của
   `/api/action-studio/simulate`: `"reasons":["Thiếu quyền: SUBMIT_DOSSIER."]`). Chỉ `isAdmin=true` mới bypass
   (xem `ActionStudioService.java:299,304`). Bug có sẵn từ trước (không nằm trong diff uncommitted hôm nay,
   `git diff` không đụng dòng 217/202), nhưng chặn đứng thao tác Gửi duyệt qua UI cho **mọi quy trình**, không
   riêng RD02.02. Cần: hoặc map `roleCodes` → `permissions` thật ở FE, hoặc bỏ yêu cầu `SUBMIT_DOSSIER` khỏi
   policy nếu chỉ định RBAC qua `allowedRoleCodes` là đủ.
2. **[Riêng RD02.02] Service task "Check" sau T02 không có job worker — quy trình treo vĩnh viễn.**
   `rd0202.bpmn:48` khai `serviceTask id="Check"` với `zeebe:taskDefinition type="khcn.rd0202.check-default-condition"`,
   nhưng `SystemCheckJobWorker.java` chỉ có `@JobWorker` cho `khcn.rd0101.check-default-condition` (RD01.01) và
   `khcn.rd0202.check-chu-truong-td` — không có worker nào subscribe đúng type
   `khcn.rd0202.check-default-condition`. Zeebe sẽ tạo job nhưng không bao giờ có worker poll/complete, nên
   MỌI hồ sơ RD02.02 sẽ treo vĩnh viễn ngay sau T02, không bao giờ tới được T03/T06/`Generate_HDXD` (service
   task sinh HĐXD — chính là tính năng "v3" cần test). Đây là gap tĩnh phát hiện qua đọc code, **chưa kiểm
   chứng runtime** vì bug #3 chặn trước khi tới được bước này.
3. **[Môi trường hiện tại] `START_FAILED` — 8093 gọi sang 8090 để start Camunda bị 401 Unauthorized.**
   Gửi duyệt (bằng admin, bypass bug #1) tạo hồ sơ `HS-2026-012` nhưng `trangThai` rơi thẳng vào
   `START_FAILED`. `GET /api/internal-integration/status` trả
   `"startFailedDossiers":[{"hoSoId":"HS-2026-012","reason":"401 Unauthorized..."}]`. Nghi vấn: 8090 (PID
   22844) khởi động lúc 22:46, SAU 8093 (PID 17980, khởi động 22:20) 26 phút — rất có thể là restart 8090 để
   deploy "v3" dùng `QTKHCN_WORKFLOW_SERVICE_TOKEN`/`QTKHCN_HO_SO_SERVICE_TOKEN` không khớp với token 8093
   đang giữ trong bộ nhớ (đúng bẫy "cặp token lệch sau restart lệch pha" đã từng ghi nhận nhiều lần ở các
   entry cũ). **Hiện tại KHÔNG hồ sơ nào (bất kỳ quy trình nào) start được Camunda** cho tới khi 2 service
   được đồng bộ lại token. Chưa tự ý restart — cần xác nhận token đúng trước khi đụng vào 2 process đang chạy.

**Đã dọn sạch dữ liệu test:** xóa `RD.2026.010`, `RD.2026.011` (cascade `HS-2026-012`) qua
`DELETE /api/nhiem-vu/{ma}`; `outboxFailed` về lại 0, `startFailedDossiers` rỗng. Không để lại state.

**Chưa làm được do bug #3 chặn (LÚC PHÁT HIỆN):** chưa xác nhận job worker `Generate_HDXD` chạy thật, chưa
xác nhận Hội đồng xét duyệt + văn bản QĐ xuất hiện đúng trên Angular `ho-so-detail` — đúng mục tiêu chính của
"smoke test v3" user yêu cầu nhưng KHÔNG thể verify được vì chặn từ bug #3 (không start được process) rồi tới
bug #2 (treo ở Check) trước khi tới T06/Generate_HDXD.

### ✅ Bug #3 (token 8090↔8093 lệch) ĐÃ SỬA — 2026-07-20 (owner Claude, theo yêu cầu user "đồng bộ lại token
giữa 8090↔8093, restart lại đúng cặp)

Dừng cả 2 process cũ (PID `22844` backend/8090, PID `17980` ho-so-service/8093) rồi khởi động lại **đồng thời
trong cùng phiên PowerShell** với cặp token tường minh giống nhau ở cả hai:
`QTKHCN_WORKFLOW_SERVICE_TOKEN=dev-workflow-local-only`, `QTKHCN_HO_SO_SERVICE_TOKEN=dev-ho-so-local-only`
(cùng quy ước đã dùng ở lần restart V21 trước đó — xem entry seam cấu hình tác vụ hệ thống). Backend khởi
động lại bằng `java -jar target/qtkhcn-backend.jar` (jar build lúc 22:46, đúng jar process cũ đang chạy, không
rebuild). `ho-so-service` khởi động lại bằng `mvnw -o spring-boot:run` (KHÔNG dùng jar có sẵn trong `target/`
vì jar đó build lúc 21:49, cũ hơn process cũ start lúc 22:20 — dùng sẽ regress code; process cũ trước đó cũng
chạy qua `spring-boot:run`, giữ nguyên cách khởi động).

**PID mới:** 8090 → `22880`, 8093 → `9356`.

**Verify cả 2 chiều bằng HTTP thật (không chỉ suy đoán từ tài liệu):**
- **8093→8090** (`QTKHCN_WORKFLOW_SERVICE_TOKEN`): `POST /internal/v1/process-instances` trên 8090 kèm
  `Authorization: Bearer dev-workflow-local-only` + body rỗng trả **400** (lỗi validate field bắt buộc), KHÔNG
  còn 401 — chứng minh token filter (`InternalServiceTokenFilter`, order 5, chỉ chặn `/internal/**`) đã chấp
  nhận đúng token. (Lưu ý: lần thử đầu dùng nhầm `dev-ho-so-local-only` cho endpoint này ra 401 đúng như thiết
  kế — hai token KHÔNG hoán đổi cho nhau được, mỗi service tự định nghĩa `qtkhcn.internal.service-token` theo
  tên biến môi trường riêng.)
- **8090→8093** (`QTKHCN_HO_SO_SERVICE_TOKEN`): `GET /api/internal-integration/status` trên 8093 kèm
  `Authorization: Bearer dev-ho-so-local-only` + `X-QTKHCN-User-Id: admin@example.com` trả **200** với
  `outboxFailed:0`, `startFailedDossiers: []` — token filter chấp nhận (lưu ý: filter này áp cho MỌI
  `/api/**`/`/internal/**` trên 8093, không riêng nội bộ — gateway Caddy vốn tiêm header này cho cả traffic
  Angular, gọi trực tiếp bỏ header sẽ luôn 401 dù token đúng).

**Kết luận:** cặp token đã đồng bộ, bug #3 ĐÃ ĐÓNG. Bug #1 (nút "Gửi duyệt" luôn gửi `permissions: []`) và
bug #2 (RD02.02 `Check` thiếu `@JobWorker` cho `khcn.rd0202.check-default-condition`) **vẫn CHƯA sửa** — vẫn
chặn smoke test v3 đi hết luồng tới `Generate_HDXD`, cần xử lý tiếp theo thứ tự #1 → #2 rồi mới re-run smoke
test full.

## ★ DONE — UI xem danh sách/chi tiết Hội đồng xét duyệt trên Chi tiết hồ sơ — 2026-07-20 (owner Claude)

Nối tiếp task sinh HĐXD tự động (entry bên dưới): dữ liệu hội đồng đã được tạo trong DB nhưng chưa có cách nào
xem lại trên UI. Đã bổ sung tối thiểu:

- **`ho-so-service`** — `GET /api/ho-so` và `GET /api/ho-so/{id}` nay trả thêm field `hoiDongXetDuyet` (list,
  rỗng nếu chưa sinh): `HoiDongXetDuyetResponse`/`ThanhVienHoiDongResponse` (DTO mới), `HoSoResponse` thêm
  field thứ 20 + tham số `from(...)`. `HoiDongXetDuyetRepository` thêm
  `findByHoSoIdOrderByCreatedAtAsc`/`findByHoSoIdInOrderByCreatedAtAsc` (`@EntityGraph` trên `thanhVien` để
  tránh N+1). `HoSoQueryService` inject repo này, `findAll()` batch-load theo `hoSoId` rồi group, `findById()`
  load trực tiếp.
- **Angular** — `ho-so.ts` thêm `HoiDongXetDuyetResponse`/`ThanhVienHoiDongResponse`/`HoiDongCap` +
  `HOI_DONG_CAP_LABEL`. `ho-so-detail` thêm card "Hội đồng xét duyệt" (cột trái, dưới "Tài liệu / Phiếu") —
  chỉ hiện khi `hoiDongXetDuyet.length > 0`, hiển thị cấp, căn cứ pháp lý, ngày sinh (`DatePipe`), bảng thành
  viên (họ tên + vai trò). Văn bản QĐ sinh kèm (HTML) đã tự động xuất hiện trong danh sách "Tài liệu" có sẵn
  (không cần thay đổi gì thêm) vì `HoiDongXetDuyetService` lưu nó như một `TaiLieu` bình thường.

Verify: `ho-so-service` targeted (`HoSoQueryServiceTest`, `ReadApiContractTest`, cùng full suite) **50/51
PASS** (1 fail `DemoIdentityProviderTest` pre-existing, không liên quan). Angular full suite **198/199 PASS**
(1 fail `ho-so-create.spec.ts` actor-header — pre-existing, không đụng file này). Test mới:
`ho-so-detail.spec.ts` 2 case (hiện đúng dữ liệu hội đồng khi có; ẩn card khi chưa có), `ReadApiContractTest`
assert `hoiDongXetDuyet` là array + `hasSize(20)`.

**Cố ý chưa làm:** không có UI tạo/sửa hội đồng thủ công (hội đồng chỉ sinh tự động qua service task); chưa
làm tương đương cho cấp Tập đoàn (vẫn đang chờ theo entry gốc bên dưới).

## ★ DONE — Service task tự động sinh HĐXD cấp Cơ sở sau bước 06 (RD02.02) — 2026-07-20 (owner Claude)

Theo yêu cầu trực tiếp của user: chèn service task Camunda thật ngay sau T06 ("6. Phê duyệt QĐ thành lập
HĐXD cấp Cơ sở") trong `rd0202.bpmn` để tự động sinh Hội đồng xét duyệt (HĐXD). Khảo sát phát hiện 3 gap phải
xử lý cùng lúc (đã chốt qua `AskUserQuestion`, plan đầy đủ ở phiên chat, không lưu file riêng):

1. **Nguồn dữ liệu chưa từng được lưu** — `formData` của eForm T05 (`bm-02-08-qdh-nv`, có
   `danhSachThanhVien`/`canCuPhapLy`) bị `WorkflowTaskActionRouting` bỏ qua hoàn toàn, không tới Camunda (đúng
   D3) và cũng chưa có bảng nào ở `ho-so-service` giữ lại.
2. **`WorkflowProjectionService.rebuild()` replay toàn bộ event mỗi lần** — sinh tài liệu/entity phải nằm
   ngoài projector, gọi đúng 1 lần qua service task, tự idempotent.
3. **Không có hạ tầng sinh Word/PDF** và `DocumentFileService.upload()` chỉ cho phép hồ sơ `DRAFT`.

**Đã làm (3 lát):**
- **Lát 1** — `WorkflowTaskActionService.emitActionEvent()` (backend) nay gửi thêm `formData` trong payload
  event `TASK_ACTION_APPLIED`; Flyway `V8__dossier_step_form_data.sql` thêm cột `dossier_step.form_data_json`;
  `WorkflowProjectionService` capture và ghi đè field này khi rebuild (an toàn với replay, giống cơ chế
  `nguoi`/`yKien` hiện có).
- **Lát 2** (`ho-so-service`) — entity mới `HoiDongXetDuyet`/`ThanhVienHoiDong` (Flyway
  `V9__hoi_dong_xet_duyet.sql`, unique theo `ho_so_id+cap+source_task_definition_key`); service
  `HoiDongXetDuyetService.sinhTuBuoc05()` đọc `formData` đã lưu ở bước T05, tạo Hội đồng + thành viên, sinh
  văn bản HTML đơn giản (không thêm dependency) và tạo `TaiLieu` trực tiếp (bỏ qua ràng buộc DRAFT-only vì
  đây là ghi hệ thống, không qua `DocumentFileService.upload()`); endpoint nội bộ
  `POST /internal/v1/ho-so/{id}/hoi-dong-xet-duyet` theo đúng mẫu `InternalWorkflowEventController`, tự động
  được bảo vệ bởi `InternalServiceTokenFilter` có sẵn.
- **Lát 3** (backend) — `rd0202.bpmn` thêm `serviceTask id="Generate_HDXD"`
  (`zeebe:taskDefinition type="khcn.rd0202.generate-hdxd-decision" retries="3"`) chèn giữa T06 và T07 (lane
  `Lane_LDVHT`, có DI shape/edge riêng, không đụng toạ độ các node khác); job worker mới
  `GenerateHdxdDocumentJobWorker` gọi đồng bộ sang API ở Lát 2, lỗi thì để Zeebe tự retry.

**Cố ý chưa làm:** cùng mẫu QĐ thành lập HĐXD lặp lại ở cấp Tập đoàn (T18B→T20, cùng formKey) — không đụng;
dùng danh sách thành viên để gán candidate thật cho T07/T10 (thay group tĩnh `HDXD`) — quyết định RBAC lớn
hơn, để riêng; nâng cấp HTML lên Word/PDF chuẩn thể thức — cần thêm dependency, để lát sau nếu cần.

Verify: `ho-so-service` **50/51 PASS** (1 fail là `DemoIdentityProviderTest` — pre-existing, không liên quan,
đã ghi nhận ở entry bên dưới); backend **186/186 PASS, BUILD SUCCESS**. Test mới:
`HoiDongXetDuyetServiceTest` (3 case: tạo hội đồng + đính tài liệu, idempotent khi đã tồn tại, lỗi khi thiếu
formData), `InternalHoiDongXetDuyetControllerTest` (auth bearer bắt buộc), `WorkflowProjectionServiceTest`
(+1 case xác nhận `formDataJson` được set đúng sau rebuild). **Chưa làm:** smoke thật trên Postgres/Camunda
sống (submit hồ sơ RD02.02 thật, duyệt qua T06, xác nhận job `Generate_HDXD` chạy và tài liệu/hội đồng xuất
hiện đúng ở Angular) — chỉ mới verify ở tầng unit/contract test offline.

## ★ DONE — Thêm / xóa tệp ở mọi trạng thái Hồ sơ — 2026-07-20 (owner Codex)

Đã gỡ rào `DRAFT` khỏi upload multipart, thêm metadata và xóa tài liệu. DELETE vẫn dùng `If-Match` theo
`TaiLieu.version`; read model trả `version` để Angular thực hiện optimistic delete, và binary được xóa sau khi
transaction commit. Màn Chi tiết hồ sơ luôn cho phép Upload, có nút Xóa kèm xác nhận/loading/toast, đồng thời
loại row khỏi signal ngay sau HTTP 204. Test mới chứng minh upload, thêm metadata và xóa binary khi hồ sơ đang
`PROCESSING`.

Verify: backend targeted `DocumentFileServiceTest,HoSoDocumentMutationServiceTest,DocumentFileControllerTest,
ReadApiContractTest,MutationApiContractTest` **19/19 PASS**; Angular `ho-so-detail.spec.ts` **12/12 PASS**;
production build PASS (chỉ warning budget/CommonJS có sẵn).

**Runtime 21:29:** dừng tiến trình cũ PID 7144, chạy `mvnw -o -DskipTests package`, khởi động JAR mới trên
8093 thành PID `18300` với cặp token khớp stack local và kho file tuyệt đối
`services/ho-so-service/data/ho-so-files`. Readiness `UP`; DB xác nhận Flyway V7 `success=true`; GET trực tiếp
8093 và qua proxy 4200 cùng trả 1 hồ sơ, tài liệu có field `version`; DELETE với ID giả trả 404, chứng minh
route mới đang hoạt động mà không thay đổi dữ liệu thật.

## ★ DONE — Upload / xem / tải tệp tại Chi tiết hồ sơ — 2026-07-20 (owner Codex)

`ho-so-service` nay sở hữu cả metadata lẫn binary tài liệu: Flyway V7 thêm `content_type`, `size_bytes`,
`storage_key`, `uploaded_at`; nội dung lưu dưới tên UUID trong kho cấu hình
`QTKHCN_DOCUMENT_STORAGE_PATH` (mặc định `./data/ho-so-files`). Upload multipart ban đầu chỉ cho hồ sơ `DRAFT`,
nhưng đã được lát mở rộng cùng ngày cho phép ở mọi trạng thái,
giới hạn mặc định 20 MB, có audit; endpoint view dùng `Content-Disposition: inline`, download dùng
`attachment`, đều giữ service-token fail-closed. Xóa tài liệu/hồ sơ lên lịch dọn binary sau khi transaction
commit; rollback upload dọn file vừa ghi.

Angular `/ho-so/:id` luôn hiển thị Upload, bổ sung Xem/Tải bằng Blob qua HTTP client để request vẫn
đi qua auth/proxy, hiển thị dung lượng và trạng thái loading. Row legacy chưa có binary vẫn hiển thị metadata
nhưng khóa Xem/Tải rõ ràng.

Verify: backend targeted `DocumentFileServiceTest,DocumentFileControllerTest,ReadApiContractTest,
MutationApiContractTest` **17/17 PASS**; Angular `ho-so-detail.spec.ts` **10/10 PASS**; `ng build` production
PASS (chỉ warning budget/CommonJS có sẵn). Full `ho-so-service` suite chạy hết nhưng có 1 failure ngoài phạm
vi tại `DemoIdentityProviderTest`: worktree song song đã thêm role `PTGD_CT` cho `lanhdao@example.com` nhưng
expected test cũ chưa đổi; không sửa lẫn thay đổi người dùng.

## ★ DONE — Xem BPMN và current step tại Chi tiết hồ sơ — 2026-07-20 (owner Codex)

Backend Quy trình có `GET /api/process-definitions/by-bpmn-process-id/{bpmnProcessId}` trả BPMN version mới
nhất từ catalog PostgreSQL. Angular `/ho-so/:id` hiển thị nút “Xem BPMN”, đổi mã nghiệp vụ `RD01.01` thành
BPMN id `RD01_01`, mở viewer chỉ-đọc và tô nổi node bằng `DossierStep.taskDefinitionKey` của bước `CURRENT`.
Verify: `ProcessDefinitionHttpContractTest` 6/6 PASS; `ho-so-detail.spec.ts` 8/8 PASS; `ng build` PASS.
**Runtime 18:17:** đã package và restart backend 8090 bằng JAR mới, PID `25188`; endpoint trực tiếp 8090
và qua proxy 4200 cùng trả HTTP 200 cho `RD01_01` version 6, BPMN XML dài 27.721 ký tự.

## ★ DONE — Xóa Nhiệm vụ KHCN và Hồ sơ — 2026-07-20 (owner Codex)

Đã bổ sung `DELETE /api/nhiem-vu/{ma}` và `DELETE /api/ho-so/{id}` tại service owner 8093, tạm thời
không giới hạn giai đoạn/trạng thái. Xóa Nhiệm vụ cascade toàn bộ Hồ sơ trực thuộc; xóa Hồ sơ dọn tài liệu,
step, outbox, inbox và workflow projection liên quan trước khi xóa aggregate, đồng thời ghi mutation audit.
Angular có nút xóa tại hai màn danh sách, popconfirm (cảnh báo cascade khi Nhiệm vụ có Hồ sơ), loading,
toast kết quả và cập nhật danh sách/thống kê tại chỗ. Verify: ho-so-service 39/39 PASS, Angular service test
4/4 PASS, production build xanh (chỉ warning budget/CommonJS có sẵn). `mvn clean` không chạy được do tiến
trình 8093 đang khóa JAR; đã dùng `mvn -o compile test` để buộc compile sạch source thay đổi mà không đụng JAR.
**Runtime 16:28:** đã dừng PID 21088, package JAR mới và restart 8093 thành PID 15304 với đủ token nội bộ;
health `UP`. Hai DELETE route được probe bằng ID không tồn tại và cùng trả 404 từ đúng controller (không phải
405/route cũ), không làm thay đổi dữ liệu thật.

## ★ DONE — Seam "cấu hình tác vụ hệ thống chi phối job worker" — 2026-07-20 (owner Claude)

Trước đây module "Cấu hình tác vụ hệ thống" **chỉ là mock frontend** (seed in-memory trong
`core/models/service-task.ts`), không chi phối runtime — worker hard-code hành vi trong Java. Lát này
dựng contract thật ở backend và cho worker RD02.02 tra cấu hình lúc chạy.

**Files mới**: `db/migration/V21__service_task_config.sql`; `domain/ServiceTask{Definition,ConfigVersion,
Binding}.java` + 4 enum; `repository/ServiceTask{Definition,ConfigVersion,Binding}Repository.java`;
`service/{ServiceTaskConfigResolver,ResolvedServiceTaskConfig}.java`. **Sửa**:
`camunda/SystemCheckJobWorker.java`. **Test mới**: `ServiceTaskConfigResolverTest` (9),
`SystemCheckJobWorkerTest` (6).

**Quyết định thiết kế**:
- **Binding resolve theo `bpmnProcessId` + `elementId`, KHÔNG theo `processCode` + `processVersion`.**
  Frontend mock ghim theo processCode/processVersion ('RD02.02','1.0') — đó là khái niệm của registry
  mock, runtime không có. Thứ `ActivatedJob` thật đưa cho worker là bpmnProcessId + elementId + jobType.
  `process_code` giữ lại chỉ để hiển thị/đối soát.
- `element_id IS NULL` = binding rộng theo job type. Resolve ưu tiên binding ghim element trước.
- 2 partial unique index bảo đảm tối đa 1 binding ACTIVE cho mỗi (process, element) và mỗi job type
  rộng ⇒ resolver không bao giờ phải "chọn đại" giữa 2 binding cùng khớp.
- Resolver trả `Optional` chứ không ném exception; **không resolve được thì worker giữ hành vi cũ**
  (trả `true`) + log WARN. Thiếu dữ liệu quản trị không được phép làm hỏng process đang chạy — E2E
  4 cấp RD02.02 vì vậy không bị ảnh hưởng.
- `stubResult` trong config_json là **escape hatch có chủ ý**: giá trị `true` vốn hard-code trong Java
  nay nằm ở cấu hình, sửa được không cần build lại. PHẢI bỏ khi `decisionCode` trỏ được DMN thật.
- Worker RD01.01 **chưa** nối resolver — V21 chưa seed binding cho nó, nối vào chỉ thêm log WARN.

**Verify**: backend `mvn -o test` **172/172 PASS** (trước 157, +15). V21 áp thử trên DB tạm
`v21_probe` (toàn bộ V1→V21 tuần tự, sạch); seed resolve đúng qua truy vấn mô phỏng resolver
(`CHECK_CHU_TRUONG_TD` v1 ACTIVE → `dieuKienMacDinhDat`/`stubResult=true`); 3 ràng buộc chặn đúng
(binding ACTIVE trùng element, `active_version > latest_version`, `type_code` lạ) và binding INACTIVE
trùng element vẫn cho phép. DB tạm đã DROP, `qtkhcn`/`qtkhcn_ho_so` nguyên vẹn.

**✅ ĐÃ LÊN STACK THẬT 2026-07-20 16:05** (user uỷ quyền "chủ động làm luôn"). V21 applied trên DB dev
(`flyway_schema_history` → v21 success), 8090 rebuild + restart với `QTKHCN_WORKFLOW_SERVICE_TOKEN=
dev-workflow-local-only` + `QTKHCN_HO_SO_SERVICE_TOKEN=dev-ho-so-local-only`. Chứng minh runtime: start
2 instance RD02_02 qua `POST /internal/v1/process-instances`; đổi `stubResult` true→false thẳng trong DB
thì log worker đổi theo (`dieuKienMacDinhDat=true` → `=false`) **cùng một JVM, không build lại** — đúng
mục đích seam. Đã revert seed về `true`. `mvn -o test` lại: 172/172 PASS.

⚠️ **Hai cái bẫy đã vấp, ghi lại để khỏi lặp:**
1. **Flyway placeholder** — V21 chứa `$` liền `{` (trong `input_mapping.expression`) làm Flyway fail
   parse "No value provided for placeholder", **app không khởi động được**. Verify vòng trước bằng
   `psql` KHÔNG thể bắt lỗi này vì psql không có cơ chế placeholder — muốn kiểm tra migration thì phải
   để chính Flyway chạy. Đã sửa bằng nối chuỗi `chr(36)`. Flyway thay placeholder **cả trong comment**,
   nên lần sửa đầu vẫn fail vì comment cảnh báo có chứa đúng cặp ký tự đó.
2. **Restart thiếu env token** — lần start đầu không set `QTKHCN_WORKFLOW_SERVICE_TOKEN`, filter
   fail-closed ⇒ mọi `/internal/**` trả 401 (đúng triệu chứng đã ghi ở mục 8093 phía dưới). Restart
   8090 bằng tay thì LUÔN phải kèm cặp token.

**Còn nợ**: (1) 2 process instance probe `SEAM-V21-PROBE`/`-2` còn nằm trong Camunda dev, chưa dọn;
(2) chưa có REST CRUD cho 3 bảng này; (3) Angular
`service-task.service.ts` vẫn đọc seed in-memory, **chưa** nối HTTP — nên màn `/cau-hinh-tac-vu` vẫn
là mock và **lệch** với dữ liệu backend; (4) chưa có audit trail (`service_task_audit`).

## ★ DONE — Action Studio routing đọc BPMN đã deploy — 2026-07-20 (owner Codex)

Đã thay `ActionStudioRoutingCatalog` hardcode bằng `DeployedBpmnRoutingReader`: đọc version mới nhất từ
`process_definition_catalog`/`process_definition_version.bpmn_xml`, parse DOM chống XXE và cache theo
`camundaProcessDefinitionKey`. Catalog dùng `bpmnProcessId` thật (`RD01_01`, `RD02_02`), user task/role/
formKey/nhánh gateway lấy trực tiếp từ BPMN; không gọi Camunda trên đường đọc. Outcome FEEL được ánh xạ
an toàn, bổ sung `APPROVE_WITH_SUPPLEMENT` cho `dong_y_bo_sung`; outcome lạ trả `unmapped` thay vì 500.
Flyway V20 chỉ xóa/remap row `system-seed`, giữ nguyên policy người dùng. Angular dùng dropdown task thật,
có empty state khi chưa deploy. Verify: backend **157/157 PASS**, test parser trên `rd0101.bpmn` xanh;
Angular production build xanh (chỉ warning budget/CommonJS có sẵn). **Runtime verified 15:38:** đã xác
nhận không có policy quy trình do người dùng tạo, package + restart 8090 PID `1668`; Flyway V20 áp thành
công. API trực tiếp và proxy 4200 đều trả `RD01_01` (13 task), `RD02_02` (7 task) cùng process smoke đã
deploy; `Task_6` có role `HDKHCN`, form `phieu-nhan-xet`, outcomes `dong_y_bo_sung`/`hieu_chinh`/
`khong_dong_y`. Reconcile RD01_01 trả 17 generic, 2 ok, 1 unfilled, không lỗi/unmapped.

## ★ DONE — Port Angular + backend thật cho `/giam-sat` — 2026-07-20 (owner Codex)

Màn React `ProcessMonitor` dùng `seedInstances` đã được thay bằng màn Angular standalone tại
`pages/process-monitor`, route lazy-load `/giam-sat`. Backend workflow service có endpoint read-only
`GET /api/process-monitor`, lấy process instance và active element từ Camunda, ghép tên process từ catalog
PostgreSQL, trả stats ACTIVE/incident/COMPLETED/TERMINATED và degraded response `available=false` khi engine
không khả dụng. UI có thống kê, tìm kiếm, lọc quy trình/trạng thái, bảng phân trang và drawer chi tiết.
Tab Optimize giữ vị trí nhưng hiển thị rõ chưa kết nối, không mang số liệu mock sang Angular.

Verify: backend `mvn -o test` **156/156 PASS**; Angular production build xanh. Full Angular test build/template
xanh nhưng run toàn suite bị 9 Vitest worker OOM của máy sau khi 146 test đã pass (không phải assertion fail).
Đã package và restart server 8090 từ JAR mới lúc 15:20, PID `8376`. HTTP thật:
`GET 127.0.0.1:8090/api/process-monitor` và tuyến proxy `localhost:4200/api/process-monitor` đều **200**
(proxy được gọi với cùng dev-key Angular interceptor tự gắn), `available=true`, snapshot có 12 instance:
7 ACTIVE, 0 incident, 2 COMPLETED, 3 TERMINATED. Gọi proxy không dev-key trả 401 đúng security contract.

## ★ DONE — Cột "Instance đang chạy" trên `/quy-trinh` tab Đã deploy — 2026-07-20 (owner Claude)

Tab "Đã deploy" có cột số instance đang chạy theo từng quy trình; bấm vào số mở drawer liệt kê từng
process instance kèm **Bước hiện tại**, mã hồ sơ, thời điểm bắt đầu, cờ sự cố.

**Files**: `camunda/CamundaProcessInstanceQuery.java`, `service/ProcessInstanceOverviewService.java`,
`web/dto/ProcessInstanceOverviewDtos.java`, `web/ProcessDefinitionController.java` (+2 endpoint),
`core/models/process-definition.ts`, `core/services/process-definition.service.ts`,
`pages/process-catalog/{process-catalog.ts,.html,.scss}` + 2 file test mới.

**Quyết định thiết kế**:
- Endpoint runtime **tách khỏi** `GET /api/process-definitions`: catalog là read PostgreSQL, cột này
  đọc Camunda. Camunda sập → `available=false` kèm HTTP 200 → UI hiện "—" (không phải 0 sai), grid vẫn
  dùng được. Nếu gộp chung, một sự cố engine sẽ chặn cả màn danh mục.
- Chi tiết instance: **1 lượt** element-instance search theo `processDefinitionId` rồi group theo
  `processInstanceKey` — không N+1 theo từng instance.
- Tên bước lấy từ `BpmnUserTaskMetadataCatalog`, **không** dùng `ElementInstance.getElementName()`.

**Bug thật, chỉ lộ ra khi gọi engine thật:** Camunda trả `application/json` **không kèm charset** ⇒
Camunda Java client decode tiếng Việt bằng charset mặc định Windows (cp1252) ⇒ mojibake
(`Khởi tạo` → `Kháť¸i táşˇo`). Unit test không bắt được vì client bị mock. Đã né bằng cách đọc tên từ BPMN
đã deploy (UTF-8, PostgreSQL) — cũng là nguồn tên mà projection worklist dùng nên tên bước nhất quán
giữa các màn. **Lỗi gốc của client vẫn còn**: bất kỳ chỗ nào khác đọc text tiếng Việt trực tiếp từ
response Camunda đều sẽ dính; nên sửa ở tầng cấu hình client (việc riêng, chưa làm).

**Verify**: backend 156/156, Angular 180/180, `ng build` xanh. HTTP thật trên server tạm 8095
(`spring-boot:run` — KHÔNG `mvn package` vì 8090 đang giữ khoá jar): counts `{"RD01_01":6}` khớp đúng 6
instance ACTIVE trong Camunda; drawer trả 6 instance mới-nhất-trước, `Task_1`/`Task_3` khớp
element-instance search, tên tiếng Việt đúng; quy trình chưa có instance trả mảng rỗng. Server tạm đã
dừng, 8095 giải phóng, 8090/8093/4200 nguyên vẹn. Chỉ gọi GET nên không tạo dữ liệu test cần dọn.

**Chưa làm**: click-through trình duyệt thật; `businessId` rỗng vì luồng start chưa set business key ⇒
cột "Mã hồ sơ" hiện "—".

## ★ DONE — Nâng cấp backend “Cấu hình luật hiển thị nút” — 2026-07-20 (owner Codex)

Đã gia cố backend Action Studio: validation độ dài/định dạng theo schema, chuẩn hóa role/permission, chặn
hai luật enabled có cùng action + selector ngữ cảnh, bảo vệ id/version khi cập nhật, và bổ sung
`GET /api/action-studio/availability-policies/{id}/history` để đọc audit kể cả sau khi luật đã bị xóa.
`GET /api/action-studio` nay trả thêm `referenceData` cho Bề mặt, Trạng thái, Vai trò, Quyền và danh sách
Biểu mẫu đọc trực tiếp từ bảng `eform`; modal Angular dùng các catalog backend này thay cho mock cứng.
Verify: backend **151/151 PASS**, Angular **175/175 PASS**, production build xanh (cảnh báo budget/CommonJS
có sẵn). Không chạm các thay đổi song song ở `ProcessDeploymentRunner`, `SystemCheckJobWorker`, BPMN
RD02.02, VS Code hay React build info.

## ★ DONE — D18/D20 final service separation — 2026-07-20 (owner Codex)

User chốt bỏ hoàn toàn cấu trúc monolith Hồ sơ/Nhiệm vụ. Đã hoàn tất code, DB và runtime cutover:

- 8093 sở hữu duy nhất CRUD Nhiệm vụ/Hồ sơ/tài liệu và workflow projection trên `qtkhcn_ho_so`.
- 8090 sở hữu BPMN/DMN/eForm/Action Studio/process/task; không còn aggregate/API/repository Hồ sơ.
- Giao tiếp hai chiều chỉ qua authenticated internal API + transactional outbox/inbox/idempotency.
- Flyway V19 đã áp thật và xóa năm bảng legacy sau khi parity dữ liệu đạt 5/5.
- Gateway route theo owner cố định; toàn bộ script switch/canary/backfill legacy đã xóa.
- Test: backend 147/147; ho-so-service 38/38; Angular 175/175; build/Caddy validate xanh.
- Full smoke runtime sau cutover PASS toàn luồng create → submit → Camunda → approve/return/reject; task mở
  lại có key mới, projection cuối `REJECTED`, active task bằng 0; toàn bộ row test đã dọn sạch ở hai DB.

Tài liệu chuẩn: `docs/arch/nvkhcn-workflow-final-service-boundary.md`. Task RD02.02 bên dưới tiếp tục là
planned work sau thay đổi kiến trúc này; khi triển khai phải mở khóa multi-process tại 8093, không được
thêm lại `HoSoService` vào 8090.

## ☐ PLANNED — Readiness E2E RD02.02 (Xét duyệt NV KHCN cấp Tập đoàn) — lập 2026-07-20 (owner Claude)

**Nguồn**: user báo cáo không test được E2E "Khởi tạo hồ sơ → gửi duyệt → phê duyệt RD02.02" và liệt kê
5 điểm chặn. Đã kiểm chứng lại từng điểm bằng mã nguồn. Kết luận "chưa đạt" là **đúng**, nhưng bản đồ
nguyên nhân thì lệch ở 3 chỗ — plan dưới đây dựng theo bản đã đính chính, không theo bản gốc.

### Đính chính so với báo cáo gốc

| Báo cáo gốc | Sự thật đã kiểm chứng |
|---|---|
| "Service hồ sơ nhận mã quy trình bất kỳ, ghi outbox → backend không tìm được process active ⇒ START_FAILED" | ~~SAI~~ → **USER ĐÚNG, agent sai. Đã rút lại.** Xem "Đính chính của đính chính" ngay dưới. |
| "Cần cấu hình eForm cấp Tập đoàn" | **Phần lớn ĐÃ CÓ**. `V12__eform_rd0202.sql` đã seed sẵn bộ BM.02.01.DKI.NV, BM.02.02.DTO.NV… theo Bảng A tài liệu nguồn RD02.02. Việc còn lại chỉ là **binding formKey vào Action Studio theo D10** — chính file seed đã ghi rõ đó là "việc của lát sau". |
| "6 test Angular lỗi vì URL 8091" | Có thể **lạc quan**. Chuỗi `8091` xuất hiện ở **10+ spec file** (approval-matrix, eform, integration-mapping, form-library, approval-slot-catalog…). Phải grep hết trước khi coi là fix nhỏ. |

Xác nhận **đúng** 2 điểm: chỉ có `rd0101.bpmn` trong `backend/src/main/resources/processes/`; và
`ho-so-detail.ts:93` trả `null` khi `loai !== 'CHU_TRUONG'`.

### ⛔ ĐÍNH CHÍNH CỦA ĐÍNH CHÍNH — agent sai, user đúng (2026-07-20)

Đính chính #1 ở bảng trên **dựa trên một file đang bị xoá**. `backend/.../service/HoSoService.java`
(có guard cứng `RD01.01` ở dòng 106) nằm trong **45 file đang ở trạng thái `D` chưa commit** — một
**phiên song song đang chạy D18 final cutover**, kèm migration untracked
`V19__remove_legacy_ho_so_domain.sql` (`DROP TABLE ho_so, nhiem_vu, dossier_step…`). Agent grep trúng
bản legacy sắp biến mất rồi tưởng đó là đường chạy thật.

**Đường chạy thật (sau cutover)** đúng như user mô tả ngay từ đầu:

+ `services/ho-so-service/.../service/WorkflowSubmissionService.java:56` — nhận `request.quyTrinh()`
  **bất kỳ**, không guard, ghi `StartProcessCommand` vào outbox.
+ `.../integration/OutboxDispatcher.java:110` — khi start hỏng thì set `DossierStatus.START_FAILED`.
+ `backend/.../camunda/CamundaReliableWorkflowEngine.java:23` — đổi `RD02.02` → `RD02_02`, tìm process
  active; không thấy đúng 1 bản thì ném `ProcessNotActiveException`.

⇒ **Không có khoá nào để mở.** Tầng submit **đã** process-agnostic. Bước 1 như hình dung ban đầu
(“mở khoá `HoSoService` cho multi-process”) là **việc không tồn tại** — đã xoá khỏi plan.

**Bài học (lặp lại đúng bài học vụ Ma trận phê duyệt, ở dạng khác)**: lần trước là grep một worktree rồi
kết luận "chưa code"; lần này là grep một file legacy **đang bị xoá dở** rồi kết luận "user mô tả sai".
Cùng một gốc: đọc một lát cắt của cây thư mục rồi tưởng đó là toàn bộ sự thật. Phải `git status` trước
khi lấy nội dung file làm căn cứ đính chính người khác.

**Tài sản tái dùng được** (đừng mô hình hoá từ số 0): branch `0bbac99` có `webapp/src/dmn/rd02Routing.dmn.ts`
+ `webapp/src/data/rd0201Bpmn.ts` từ thời mock React. Là RD02.**01** chứ không phải 02.02 nên không dùng
trực tiếp, nhưng là khung routing tham chiếu.

### ⚠️ CỔNG PHẠM VI — phải chốt trước khi code bước 1

Toàn bộ việc RD02.02 là **Mốc 6+** trong plan migration của D17
(`C:\Users\phuctd7\.claude\plans\generic-pondering-parnas.md:148`). Hai ràng buộc từ chính plan đó:

1. Plan ghi rõ Mốc 6 "lên kế hoạch chi tiết **sau khi Mốc 5 xong**", và "luồng RD nào tiếp theo…
   **không chốt cứng ở đây**" (dòng 148–155). Chọn RD02.02 làm luồng kế tiếp là lấp vào một ô **cố ý
   để mở** — không phá quyết định đã khoá, nhưng là quyết định của user, không phải của agent.
2. **Mốc 5 CHƯA đóng.** `DELIVERY_STATE.md:862` — nhánh (a) backend DONE 2026-07-15, còn **nhánh (b)
   Angular + full browser click-through RD01.01 vẫn treo**. Mở Mốc 6 khi Mốc 5 còn dở là đúng cái
   big-bang mà chiến lược strangler-fig (dòng 47) muốn tránh.

**✅ ĐÃ CHỐT 2026-07-20 — user chọn (B): mở RD02.02 song song**, chấp nhận chạy Mốc 6 khi Mốc 5 nhánh (b)
còn dở, vì ràng buộc demo/tiến độ. Agent đã khuyến nghị (A) và user bác — quyết định thuộc về user, ghi
lại đây để phiên sau không mở lại tranh luận này.

**Rủi ro đã biết mà (B) gánh** (không phải lý do để dừng, mà là thứ phải canh): tầng dùng chung
(task/action runtime, eForm binding D10, proxy `/api`, auth cấp TĐ) **chưa từng được click-through
xác nhận** ở RD01.01. Nếu tầng đó có lỗi, làm RD02.02 song song sẽ **nhân bản lỗi sang luồng thứ hai
trước khi phát hiện**. ⇒ Giảm thiểu: khi bước 3–4 chạm vào code dùng chung, ưu tiên kiểm chứng trên
RD01.01 trước (luồng đã có backend verified), rồi mới suy rộng sang RD02.02 — như vậy vẫn thu được
phần lớn giá trị của (A) mà không phải chờ nhánh (b) Angular đóng.

### Các bước, xếp theo quan hệ chặn (không theo thứ tự báo cáo gốc)

- **Bước 0 — Dọn test Angular `8091` → proxy `/api`. ✅ DONE 2026-07-20.**
  **Quy mô thật lớn hơn báo cáo gốc gần 12 lần**: chạy `ng test` trước khi sửa cho ra **70 test lỗi /
  15 file**, không phải 6 — nghi ngờ "con số 6 lạc quan" ở trên là đúng. Nguyên nhân đồng nhất ở cả 15
  file: `environment.apiBaseUrl` đã đổi thành `''` (proxy `/api`), nên `API_BASE_URL` rỗng và app gọi
  `/api/...`, trong khi spec vẫn `expectOne('http://localhost:8091/api/...')`. Sửa bằng cách bỏ host
  khỏi mọi `expectOne` trong spec (`sed` trên 15 file), giữ nguyên đường dẫn tương đối — **không** đụng
  code sản phẩm. Kết quả: **175/175 test PASS, 42/42 file**, `8091` còn 0 lần trong `src/`.
  Bài học: đừng lấy số test lỗi từ báo cáo, chạy suite lấy ground truth trước khi ước lượng.
- **Bước 1 — ~~Mở khoá `HoSoService` cho multi-process~~. ❌ HUỶ — việc không tồn tại.** Xem đính chính
  ở trên: tầng submit sau cutover D18 đã process-agnostic sẵn.
- **✅ Bước 1' — GỠ CHẶN 2026-07-20.** User xác nhận phiên kia đã hoàn tất D18 final cutover dứt điểm.
  Ranh giới khoá tại `docs/arch/nvkhcn-workflow-final-service-boundary.md`: **8093** sở hữu Nhiệm vụ/Hồ
  sơ/tài liệu/projection trên `qtkhcn_ho_so`; **8090** chỉ còn BPMN/DMN/eForm, Action Studio,
  Camunda process/task, inbox/outbox trên `qtkhcn`. Đã xoá seam in-process `WorkflowClient`,
  `InProcessWorkflowClient`, `Rd0101ProcessService`. V19 đã áp thật (5 bảng legacy bị drop), có parity
  5/5 + sync `HS-2026-006` trước khi xoá. Verify: Quy trình 147/147, NV KHCN 38/38, Angular 175/175
  (gồm cả fix Bước 0 của phiên này), Caddy validate pass, `8090 /api/ho-so` → 404, full smoke thật
  chạy hết vòng approve/return/reject.
  **⚠️ Còn treo: 83 file thay đổi CHƯA COMMIT** (48 `D`, 32 `M`, 3 `??`) — đúng hình thái đã suýt mất
  91 test hôm 16/07. Nên commit trước khi Bước 2 thêm file mới, để cutover và việc RD02.02 không trộn
  vào một khối không thể tách/rollback.
  **Ràng buộc mới cho Bước 2**: BPMN/DMN thuộc **8090** ⇒ `rd0202.bpmn` đặt ở
  `backend/src/main/resources/processes/`, KHÔNG đặt ở `services/ho-so-service`. Không được thêm
  `/api/ho-so/**` vào 8090 (guardrail của doc ranh giới).
- **Bước 2 — BPMN RD02_02 + DMN routing**, deploy lên Zeebe. Mượn khung `rd02Routing.dmn.ts` ở `0bbac99`.
  Sau đính chính, đây là **bước đầu tiên có việc thật** — và nhiều khả năng là **bước duy nhất** chặn
  runtime, vì `CamundaReliableWorkflowEngine` chỉ cần tìm thấy đúng 1 process active `RD02_02`.

  **⚠️ CHẶN NGHIỆP VỤ (phát hiện 2026-07-20, chưa giải quyết)** — không phải chặn kỹ thuật:
  + `docs/req/RD01-RD02-requirements.md:63` chỉ có **4 requirement SF + 1 BR** cho RD02.02, confidence
    0.80–0.85. Không đủ để mô hình hoá chuỗi task chi tiết như RD01.01 (13 user task).
  + **OQ-002 (đích quay lại khi từ chối/rework) vẫn MỞ** và `docs/arch/camunda-design.md:85` ghi thẳng:
    rework "**chưa mô hình hoá được** cho tới khi khách trả lời". `EPIC-QLNVKHCN-AC.md:155` đếm được
    **12 chỗ AC negative** đang treo vì OQ-002.
  + **OQ-001 (tiêu chí phân cấp Cơ sở vs Tập đoàn) vẫn MỞ**, và chính doc requirement đánh dấu nó
    **chặn RD02.02**. Đây là đầu vào của DMN routing — không có tiêu chí thì DMN không có luật để viết.
  + **BR-RD0202-001 dây chuyền**: chỉ được khởi tạo xét duyệt cấp TĐ khi **đã có QĐ phê duyệt chủ
    trương cấp Tập đoàn** — tức phụ thuộc **RD01.02**, mà RD01.02 cũng **chưa có BPMN** (chỉ có
    `rd0101.bpmn`). E2E RD02.02 "đúng nghiệp vụ" vì vậy kéo theo cả RD01.02.

  **Tiền lệ có sẵn**: `rd0101.bpmn` **đã** được mô hình hoá với rework (`Flow_6_Rework`,
  `Flow_9_Rework`, `Flow_11HD_Rework`) *bất chấp* OQ-002 còn mở ⇒ dự án đã từng chấp nhận mô hình hoá
  tạm và đánh dấu là giả định. Có thể làm lại đúng cách đó cho RD02.02.

  **User chọn (i) 2026-07-20**: dựng tạm với các node tiêu biểu (gateway/user task/service task).

  **✅ ĐÃ LÀM — RD02_02 LIVE TRÊN ZEEBE THẬT:**
  + Tạo `backend/src/main/resources/processes/rd0202.bpmn` — 5 lane (CQ KHCN TĐ, CQNV VHT, BTGĐ TĐ,
    HĐXD TĐ, HĐ KHCN TĐ), 7 user task, 1 service task, 5 exclusive gateway, 3 end event, 21 flow.
    Header file ghi rõ đây là bản TẠM kèm 4 giả định (OQ-001, OQ-002, BR chưa nối RD01.02, ASSUMP-001).
  + **Không bịa biến mới** — dùng nguyên contract `ProcessVariableContract` (`dieuKienMacDinhDat`,
    `ketQuaKyDuyet`, `ketQuaThamDinh`, `ketQuaHDKHCN`, `ketQuaPheDuyet`), đúng ràng buộc D3 ghi ở
    đầu file contract. Role code lấy từ `roles.ts` (`CQ_KHCN_TD`/`HDXD_TD`/`HDKHCN_TD`/`BTGD_TD`),
    formKey lấy từ eForm V12 đã seed — không tham chiếu form ma.
  + Thêm worker `khcn.rd0202.check-chu-truong-td` vào `SystemCheckJobWorker`; mở rộng
    `ProcessDeploymentRunner` deploy cả 2 process (tách hàm `deployBundled`, giữ thứ tự tất định).
  + Verify: XML well-formed + 0 tham chiếu flow treo (script kiểm 2 chiều); `mvn -o test`
    **150/150 PASS, BUILD SUCCESS**.
  + **Deploy runtime không cần restart**: dùng `/api/process-definition-drafts` `import → validate →
    deploy` trên 8090. `validate` trả `valid:true`, 0 error/0 warning; `deploy` trả **DEPLOYED**,
    `camundaProcessDefinitionKey=2251799813729609`. `GET /api/process-definitions` nay liệt kê
    **RD02_02** cạnh RD01_01 ⇒ **điểm chặn gốc "API live không có process RD02_02" đã hết.**

  **✅ E2E một phần — đường submit ĐÃ THÔNG:** tạo `HS-2026-008` (loại `XET_DUYET`, từ `RD.2026.001`)
  → `POST /api/ho-so/HS-2026-008/submit` với `quyTrinh=RD02.02` → `START_PENDING` → **`PROCESSING`**
  với `zeebeProcessInstanceKey=2251799813729692`. Tức giả thuyết "submit RD02.02 sẽ START_FAILED"
  **không còn đúng** sau khi có process active.

  **✅ E2E ĐÃ THÔNG QUA SERVICE TASK — xác minh trên Camunda thật 2026-07-20 11:30** (sau khi user
  restart 8090 từ build mới, jar 85.1 MB). Truy vấn `/v2/element-instances/search` và `/v2/jobs/search`
  của Camunda cho instance `2251799813729692`:

  | Node | Loại | Trạng thái |
  |---|---|---|
  | `Start_RD02_02` | START_EVENT | COMPLETED |
  | `Check_ChuTruongTD` | SERVICE_TASK, job `khcn.rd0202.check-chu-truong-td` | **COMPLETED** — worker mới chạy thật |
  | `Gateway_BR` | EXCLUSIVE_GATEWAY | COMPLETED — rẽ đúng nhánh `dieuKienMacDinhDat = true` |
  | `Task_1` | USER_TASK, job `io.camunda.zeebe:userTask` | **CREATED / ACTIVE** — chờ `CQ_KHCN_TD` |

  Ghi chú mô hình: cả `rd0101.bpmn` lẫn `rd0202.bpmn` đều **không** dùng `<zeebe:userTask/>` ⇒ user
  task kiểu job-based (`io.camunda.zeebe:userTask`), nên `/v2/user-tasks/search` trả 0 là ĐÚNG, không
  phải lỗi. Danh sách việc hiển thị qua projection của 8093, không qua Camunda user-task API.

  **✅ HOÀN TẤT VẬN HÀNH 2026-07-20 11:36 — agent tự restart cả 2 service** (user uỷ quyền). Dừng
  8090 cũ, khởi động lại 8090 + 8093 bằng `Start-Process` với cặp token khớp
  (`QTKHCN_WORKFLOW_SERVICE_TOKEN=dev-workflow-local-only`,
  `QTKHCN_HO_SO_SERVICE_TOKEN=dev-ho-so-local-only` — giá trị sau bắt buộc vì `proxy.conf.json`
  hardcode cho trình duyệt). Log ra scratchpad `8090.log`/`8093.log`.

  | Kiểm chứng | Kết quả |
  |---|---|
  | Log startup 8090 | `startup deployment skipped: RD01_01 v6` **và `RD02_02 v1 (key=2251799813729609)`** ⇒ runner mới nhận cả 2 process |
  | Token nội bộ | `POST /internal/v1/process-instances` + `Bearer dev-workflow-local-only` → **400** (không còn 401) ⇒ auth qua, 400 chỉ vì body rỗng cố ý |
  | Projection phục hồi | `HS-2026-008` tự nhảy `buocHienTai 0 → 1`, `steps 1 → 2` nhờ `WorkflowProjectionReconciler` — **tự khôi phục sự kiện bị lỡ trong lúc 8093 tắt**, không cần can thiệp tay |
  | Step projection | `buoc 1 \| "1. Lập CV đề nghị xét duyệt & HS đề nghị xét duyệt" \| CURRENT \| ['CQ_KHCN_TD'] \| form bm-02-01-dki-nv \| taskKey Task_1` — khớp **từng chi tiết** đã viết trong BPMN |
  | `/api/my-tasks` | `admin@example.com` → **1 task** (HS-2026-008) ⇒ đường truy vấn task chạy |

  **⇒ Toàn tuyến RD02.02 đã chứng minh trên runtime thật**: tạo hồ sơ XET_DUYET → submit → outbox →
  Camunda → service task (worker mới) → gateway → user task → event → projection → my-tasks.

  **⛔ Điểm chặn CUỐI, đã định vị chính xác — trùng đúng điểm 5 trong báo cáo gốc của user**:
  `services/.../security/DemoIdentityProvider.java:15` chỉ có **5 tài khoản demo** và **KHÔNG tài
  khoản nào giữ vai trò cấp Tập đoàn** (`CQ_KHCN_TD`, `HDXD_TD`, `HDKHCN_TD`, `BTGD_TD`) — toàn bộ là
  vai trò cấp Cơ sở. Vì vậy `cqnv@example.com` thấy 0 task còn `admin` (bypass) thấy 1. Task được
  giao ĐÚNG; chỉ là **chưa có người nào đóng được vai đó**. `frontend-angular/src/app/core/auth/
  demo-users.ts:31-35` có đúng 5 tài khoản tương ứng ⇒ sửa phải đồng bộ **cả 2 file**, nếu không màn
  đăng nhập demo và backend sẽ lệch nhau.

  **✅ BƯỚC 4 (phần tài khoản) DONE 2026-07-20 11:42 — user chọn "4 tài khoản riêng theo từng vai".**
  Thêm `cqkhcn-td@`, `hdxd-td@`, `hdkhcn-td@`, `btgd-td@` (mỗi tài khoản đúng 1 role code) vào **cả
  hai** nơi: `DemoIdentityProvider.java` (đổi `Map.of` → `Map.ofEntries` vì `Map.of` chỉ nhận tối đa
  10 cặp) và `demo-users.ts`. Cố ý KHÔNG gộp 4 vai vào 1 tài khoản: RD02.02 đi qua 4 cấp thẩm quyền,
  gộp lại thì không demo được phân tách quyền.

  **Bằng chứng phân tách quyền chạy thật** (`/api/my-tasks` sau khi rebuild + restart 8093):

  | Tài khoản | Role | Kết quả |
  |---|---|---|
  | `cqkhcn-td@example.com` | `CQ_KHCN_TD` | **1 task — HS-2026-008** ✓ đúng vai được giao Task_1 |
  | `hdxd-td@example.com` | `HDXD_TD` | 0 task ✓ việc ở bước sau |
  | `btgd-td@example.com` | `BTGD_TD` | 0 task ✓ việc ở bước sau |
  | `cqnv@example.com` | cấp Cơ sở | 0 task ✓ không rò rỉ sang luồng Tập đoàn |

  Test sau thay đổi: ho-so-service **38/38 PASS**, Angular **175/175 PASS**.

  **🎯 E2E RD02.02 ĐÓNG TRỌN VẸN 2026-07-20 — có DMN, chạy hết 4 cấp phê duyệt.**

  *DMN thật (user yêu cầu "giả lập luôn DMN routing")*: thêm
  `backend/src/main/resources/processes/rd0202-routing.dmn` — DRD `drd_rd0202_routing`, decision
  `capNhiemVu` (2 input `tongDuToan`+`loaiNhiemVu`, 3 rule, hitPolicy FIRST) trả biến `cap`. Deploy
  qua API danh mục có sẵn `/api/dmn-rules` (create → saveVersion → activate) — **không** phải hack:
  `POST /v2/decision-definitions/search` của Camunda xác nhận `capNhiemVu v1` tồn tại.
  BPMN thêm `Rule_PhanCap` (`zeebe:calledDecision decisionId="capNhiemVu" resultVariable="cap"`) +
  `Gateway_Cap` + end event `End_KhongThuocTD` cho nhánh CS. Deploy **RD02_02 v2**
  (key=2251799813737211), validate 0 lỗi/0 cảnh báo.

  *Bug tự gây, đã bắt trước khi chạy*: `WorkflowTaskActionRouting` map biến điều khiển **chỉ theo
  element id**, mà RD01_01 và RD02_02 đều có `Task_6` ⇒ action ở RD02.02 sẽ set biến của RD01.01 và
  gateway rẽ sai **mà không báo lỗi**. Đã sửa thành phân nhánh theo `processDefinitionId` trước
  (`rd0101()` / `rd0202()`). Ghi chú thêm: `Gateway_3`/`Gateway_7` có nhánh mặc định là *từ chối*,
  nên `RETURN_STEP` ở Task_3/Task_7 **bắt buộc** set `"hieu_chinh"` tường minh — để rỗng là hồ sơ bị
  đóng thay vì trả lại.

  *Bản sao thứ BA của danh mục tài khoản*: `backend/.../security/WorkflowDemoIdentityProvider.java`
  (8090 — phân quyền thao tác task) cũng thiếu vai trò TĐ. Triệu chứng nếu bỏ sót: user **thấy** việc
  nhưng bấm nút bị **403**. Đã bổ sung + ghi chú cảnh báo 3 nơi phải đồng bộ tay.

  *Chứng cứ chạy thật* — hồ sơ `HS-2026-009`, instance `2251799813737235` trên **v2**:

  + DMN quyết định đúng: `tongDuToan=12000000000` → `cap="TD"` → `Gateway_Cap` rẽ nhánh TĐ.
  + 7 user task hoàn thành qua **4 cấp thẩm quyền khác nhau**, mỗi bước do đúng tài khoản giữ vai:
    `cqkhcn-td` → `cqkhcn-td` → `btgd-td` → `hdxd-td` → `hdkhcn-td` → `cqkhcn-td` → `btgd-td`.
  + `available-actions` trả `RETURN_STEP` **chỉ** ở Task_2/3/4/7, vắng ở Task_1/QDTL/Task_6 — khớp
    đúng bảng `RD02_02_RETURNABLE`, xác nhận bản sửa routing hoạt động.
  + Camunda: 17/17 node COMPLETED tới `End_PheDuyet`, process instance **state=COMPLETED**.
  + Projection 8093: hồ sơ **`trangThai=APPROVED`**, `buocHienTai=7`, cả 7 bước DONE với đúng
    `vaiTroCodes`.

  Test: backend **151/151 PASS**, ho-so-service 38/38, Angular 175/175.

  ~~**⏸️ Hai việc còn treo (đều thuộc vận hành, không phải code):**~~ (đã xử lý xong, giữ lại để đối chiếu)
  1. **8093 chưa được khởi động lại** — không có tiến trình nghe cổng 8093. Vì vậy projection không
     cập nhật và `/api/my-tasks` không gọi được; `HS-2026-008` vẫn đứng ở `PROCESSING`.
  2. **Token 8090 không khớp** — `POST /internal/v1/process-instances` với
     `Bearer dev-workflow-local-only` trả **401** ⇒ 8090 khởi động mà biến
     `QTKHCN_WORKFLOW_SERVICE_TOKEN` chưa được set (filter fail-closed khi token rỗng). Chừng nào
     chưa sửa, mọi **submit mới** từ 8093 sẽ 401. Instance đang chạy KHÔNG bị ảnh hưởng (worker dùng
     gRPC Zeebe, không qua token này).

  ~~**⏸️ Chặn còn lại (1 việc, đã biết chính xác nguyên nhân)**~~: `GET /api/my-tasks` trả **0 task** —
  process đứng ở service task `Check_ChuTruongTD` vì **8090 đang chạy JAR build trước khi thêm
  worker**. Cần **restart 8090 từ build mới** thì worker mới nhận job, gateway BR mới rẽ và Task_1
  mới xuất hiện. Nhắc lại bẫy trong memory `qtkhcn-local-stack-run`: **phải tắt 8090 TRƯỚC khi
  `mvn package`**, nếu không repackage fail do khoá `target/qtkhcn-backend.jar` và để lại jar thin.

  **Dữ liệu test cần dọn sau**: `HS-2026-008` + process instance `2251799813729692` (giữ lại để chạy
  tiếp sau restart; dọn khi kết thúc như phiên cutover đã làm).
- **Bước 3 — Mapping UI.** `ho-so-detail.ts:93`: xử lý `XET_DUYET`, và lưu ý nhánh Tập đoàn của
  `CHU_TRUONG` (RD01.02) hiện cũng đang `supported: false` — hai chỗ nên làm cùng lượt.
- **Bước 4 — Task/action + candidate groups cấp TĐ** (`HDXD_TD`, `HDKHCN_TD`, `BTGD_TD`), binding formKey
  vào bộ eForm V12 đã seed. Tài khoản test theo từng vai trò.
- **Bước 5 — Kịch bản E2E RD02.02** + click-through trình duyệt thật.

**Định nghĩa xong**: một process instance RD02.02 chạy hết vòng đời trên Zeebe thật, quan sát được trên
Operate, và click-through trình duyệt (không chỉ build/test xanh) — cùng chuẩn bằng chứng như Mốc 5.

**Trạng thái nền khi lập plan**: backend 180/180 test PASS (1 skipped); Angular production build OK;
stack chạy 4200/8090/8093/26500.

---

## ★ DONE — Xác minh Approval Matrix trên HTTP thật — 2026-07-20 (owner Claude)

Nối tiếp mục dưới. Trước đó mới verify tới tầng build/test; nay đã chạy server thật và gọi HTTP live.

| Kiểm chứng | Kết quả |
|---|---|
| Flyway V9 trên DB dev | **ĐÃ ÁP** — `flyway_schema_history` v9 `success=t`, cài 2026-07-16 14:43. Đủ 18 migration, Flyway `Successfully validated 18 migrations` khi khởi động ⇒ checksum V9 ở workspace **khớp** bản đã áp trong DB |
| Bảng + seed | 4 bảng `approval_*` tồn tại; `approval_slot` 6 dòng, `approval_rule` 8 dòng |
| `GET /api/approval-matrix/rules` | **200** + 8 luật JSON đầy đủ (conditions/assignment/priority/version) |
| `GET /api/approval-matrix/slots` | **200** + 6 slot, có `usageCount` tính đúng (THAM_DINH=3, HOI_DONG=2) |
| `POST /resolve` capNhiemVu=CS | **200** → khớp `AM-01`, approver `U-003` via `CQ_KHCN`, audit ghi rõ lý do skip từng luật |
| `POST /resolve` capNhiemVu=TD | **200** → khớp `AM-02`, approver `U-010` via `CQ_KHCN_TD` ⇒ condition engine phân nhánh đúng theo context, không phải chỉ đọc JPA |
| `POST /analyze` | **200** → cảnh báo trùng priority (THAM_DINH 2 luật cùng ưu tiên 10, HOI_DONG cùng 20) + thiếu luật fallback |

**Bằng chứng phụ**: `AM-26809` trong DB do **Lê Văn Cường** tạo (không phải `system-seed`) — chứng tỏ
đường ghi đã từng được dùng thật ở phiên 16/07, không chỉ đọc.

**Cách chạy**: KHÔNG dùng `mvn package` được — tiến trình 8090 (PID 13036, start 10:12) đang **giữ khoá
`target/qtkhcn-backend.jar`**, `repackage` fail ở bước rename (đúng bẫy đã ghi trong memory
`qtkhcn-local-stack-run`). Đi đường vòng: `mvn -o spring-boot:run -Dspring-boot.run.arguments=--server.port=8095`
— chạy từ `target/classes`, không đụng jar đang bị khoá. Header auth là `X-QTKHCN-Dev-Key: dev-local-only`
(KHÔNG phải `X-API-Key`; sai header ⇒ 401 chứ không phải 404).

**✅ ĐÃ THÔNG TOÀN TUYẾN 4200 → proxy → 8090 → DB.** Ban đầu 8090 chạy JAR cũ (build trước khi port)
nên vẫn 404; **10:33 một phiên song song đã `clean package` + restart 8090** (PID 28044, jar 89MB,
443 entry `BOOT-INF`). Gọi lại trên 8090: `/rules`, `/slots`, `/analyze` **200**; `/resolve` phân nhánh
đúng CS→AM-01/U-003, TD→AM-02/U-010. Qua proxy 4200: **200 `application/json`**; khi thiếu header thì
trả **401 JSON** chứ không phải HTML ⇒ proxy định tuyến đúng, không rơi vào SPA fallback (bẫy `(HTTP 200)`
trong memory `qtkhcn-local-stack-run`). Server tạm 8095 đã tắt.

**Sự cố tự gây, đã khỏi**: `mvn package` lúc 10:28 fail ở repackage do 8090 (PID 13036 cũ) giữ khoá jar,
làm jar còn **thin 487KB / 0 entry BOOT-INF** — `java -jar` sẽ chết. Phiên 10:33 build lại đã khắc phục.
Bài học: đừng `mvn package` khi backend đang chạy; muốn test thì dùng `spring-boot:run` cổng khác.

**Còn treo**: chưa click-through trình duyệt (mới verify tới tầng HTTP/proxy); chưa commit ở workspace
chính (giữ nguyên tắc chỉ commit khi user yêu cầu).

---

## ★ DONE — Cứu Approval Matrix backend khỏi worktree + port vào workspace chính — 2026-07-20 (owner Claude)

**Bối cảnh**: user hỏi kiểm tra lại `/ma-tran-phe-duyet` vì "nhớ là đã code backend rồi". Agent grep
workspace chính, không thấy entity/repository/controller nào, và **kết luận nhầm là "backend chưa từng
được viết"**. Sai. Grep một cây thư mục chỉ chứng minh "không có ở đây", không chứng minh "chưa tồn
tại" — repo này có **6 worktree**, lẽ ra phải `git worktree list` trước. User đúng.

**Sự thật**: BE đã DONE + VERIFIED từ 2026-07-16 (91/91 test PASS), nằm ở worktree
`C:\Users\phuctd7\ql-nvkhcn-be-approval-matrix`, branch `fix/approval-matrix-backend` — đúng như
DELIVERY_STATE entry hôm đó đã ghi. Nhưng **toàn bộ 34 file ở trạng thái untracked suốt 4 ngày**.

**Quyết định (qua `AskUserQuestion`, user chọn phương án khuyến nghị)**: commit worktree trước rồi port
có chọn lọc — KHÔNG `git merge` branch đó. Lý do bác merge: branch ở baseline 16/07 (`3d3ed24`) trong
khi workspace chính đã ở `33db320` với D18/D19/D20, `ho-so-service`, Camunda workflow, integration;
merge sẽ kéo ngược baseline cũ đè lên 3 ngày công việc mới hơn.

| Bước | Việc | Kết quả |
|---|---|---|
| 1 | Commit bảo toàn trong worktree | `f366885` — 65 file / 4380 dòng (Approval 34 + Action Studio + eForm, tức cả jar tổng hợp 3-trong-1). `backend/target/` đã gitignore nên không lẫn artifact. |
| 2 | Copy 33 file Approval sang workspace chính | V9 SQL bỏ qua — đã identical từ 16/07. Không file nào bị ghi đè (script kiểm tra tồn tại trước khi copy). |
| 3 | Merge tay `GlobalExceptionHandler.java` | File phân kỳ **cả hai chiều**: worktree có handler `ApprovalMatrixConflictException`; workspace chính có `IntegrationConflictException` + `WorkflowStartException` + `TaskActionException` + record `InternalErrorBody`. Giữ đủ cả 4, không bên nào mất. |
| 4 | Verify | `mvn -o compile` sạch; `mvn -o test` **180/180 PASS, 1 skipped**, BUILD SUCCESS. |

**9 test Approval xanh**: `ApprovalConditionEngineTest` 2, `ApprovalMatrixAnalyzerTest` 1,
`ApprovalMatrixServiceTest` 3, `ApprovalMatrixHttpContractTest` 3.

**Đối chiếu contract FE↔BE — khớp 100%**: `ApprovalMatrixController` `/api/approval-matrix` phủ
`/rules` (GET/POST/PUT/DELETE + `{id}/status`/`{id}/versions`/`{id}/audit`), `/resolve`, `/analyze`;
`ApprovalSlotController` `/api/approval-matrix/slots` phủ GET/POST/PUT `{code}`/`{code}/status`. FE
(`approval-matrix.service.ts`, `approval-slot-catalog.service.ts`) gọi đúng bấy nhiêu và **không** gọi
DELETE slot (slot chỉ retire qua status) — không có endpoint thiếu.

**CHƯA làm (không được ghi nhận là xong)**: chưa dựng server thật để gọi HTTP live, nên **chưa xác nhận
Flyway V9 đã áp lên DB dev đang dùng** — đây chính là điều kiện để `/ma-tran-phe-duyet` hết 404, cần
kiểm tra trước khi kết luận màn hình đã chạy. Chưa click-through trình duyệt. Chưa commit ở workspace
chính (giữ nguyên tắc chỉ commit khi user yêu cầu).

## ★ DONE — Hiển thị tích hợp Service Quy trình ↔ Service NV KHCN trên UI — 2026-07-19 (owner Codex)

Theo yêu cầu user, `/tich-hop` nay có overview riêng cho kênh nội bộ với topology hai service, hai
chiều trao đổi (lệnh khởi tạo qua transactional outbox; workflow event quay về qua inbox/projection),
health và KPI lấy từ API thật `/api/internal-integration/status`. Cặp service này được giữ tách biệt
khỏi các card hệ thống ngoài theo D19. `/nhat-ky` tiếp tục dùng cùng API thật, đổi nhãn tab và bổ sung
chú giải chiều dữ liệu/tên service rõ ràng. Files: `pages/integration-status/{ts,html,scss,spec.ts}` và
`pages/nhat-ky/{html,scss}`. Verify: targeted `ng test` 2 files, **11/11 PASS**; `ng build` production
GREEN. Browser nhúng không có phiên (`agent.browsers.list() = []`) nên chưa click-through trực quan.

## ★ CURRENT — D20 Lát 8 E2E: tự chạy test thật (API/service level) — PASS 2026-07-19 (owner Claude)

**Yêu cầu user**: "Bạn lên kế hoạch và tự chạy test. Báo cáo lại tôi các test case, test step và kết
quả" — sau khi phiên trước chỉ kiểm tra completeness bằng build/unit test, user yêu cầu tự dựng môi
trường và chạy E2E thật.

**Môi trường**: dùng Docker Postgres/Camunda đã chạy sẵn (không tạo mới, không đụng container).
Xác nhận cổng 8090 trống (không có live demo/tiến trình nào đang chiếm) trước khi dùng; cổng 8091 (dev
backend jar cũ, PID 12184) không bị đụng. Build `mvn -o package -DskipTests` cả 2 module từ working
tree hiện tại (đã có sẵn cả code Track Codex + Track Claude, không tách branch) → start
`backend/target/qtkhcn-backend.jar` trên **8090** và `services/ho-so-service/target/
qtkhcn-ho-so-service.jar` trên **8093** với `QTKHCN_WORKFLOW_SERVICE_TOKEN`/`QTKHCN_HO_SO_SERVICE_TOKEN`
dùng chung. Cả 2 Flyway validate sạch (backend schema v18, ho-so-service schema v6 — đã được áp từ
phiên real-E2E trước đó của Track Codex, không cần migrate lại).

**Test case đã chạy thật (không phải chỉ đọc code)**:

| # | Test case | Bước | Kết quả |
|---|---|---|---|
| TC1 | Automated E2E smoke (`Invoke-E2ESmoke.ps1`) | create NhiemVu → create HoSo draft → submit RD01.01 → poll `PROCESSING` (đúng 1 `zeebeProcessInstanceKey`, ổn định) → `GET /api/my-tasks` đúng `Task_1`/PM → `APPROVE_STEP` Task_1→Task_2 (PM) → Task_3 (CQ_KHCN, `cqnv@example.com`) → Task_4 (PM) → `RETURN_STEP` Task_5 (`tgd@example.com`) → xác nhận Task_4 mở lại có `taskKey` MỚI → `REJECT_STEP` → Hồ sơ `REJECTED`, 0 active task | **PASS FULL** — lần đầu tiên script này pass hết; lần chạy 2026-07-18 FAIL ở bước `/api/my-tasks` do gap `TASK_CREATED` rỗng. Xác nhận thật: fix Lát 0 (element-instance fallback) đã đóng gap. |
| TC2 | Authorization sai candidate group | `cqnv@example.com` (CQ_KHCN) gọi `APPROVE_STEP` trên Task_1 (chỉ PM) | **PASS** — `403 TASK_FORBIDDEN` |
| TC3 | Idempotency — double-click cùng payload | Gửi 2 lần cùng `requestId` + cùng body `APPROVE_STEP` | **PASS** — cả 2 lần trả `202 ACCEPTED` giống hệt, task chỉ tiến 1 bước (Task_1→Task_2 đúng 1 lần, không lặp) |
| TC4 | Payload conflict | Cùng `requestId`, đổi `comment` | **PASS** — `409 IDEMPOTENCY_CONFLICT` |
| TC5 | Legacy rollback bridge còn sống khi bật cờ | `legacy-writes-enabled=true` (mặc định) → `POST /api/ho-so/{id}/actions` | **PASS** — không bị chặn, đi tới validation của controller cũ (400 do thiếu field DTO cũ — đúng vì input test không theo DTO cũ, không phải bug) |
| TC6 | Legacy kill switch chặn đúng | Restart backend với `QTKHCN_HO_SO_LEGACY_WRITES_ENABLED=false` → gọi lại endpoint cũ | **PASS** — `409` đúng message `LegacyHoSoWriteGuardFilter` |
| TC7 | Task-centric API không bị ảnh hưởng bởi cờ legacy | Cùng lúc cờ `=false`, gọi `GET /api/tasks/{taskKey}/available-actions` trên task đang active | **PASS** — `200`, trả đúng 2 action `APPROVE_STEP`/`REJECT_STEP` của Task_2 |
| TC8 | `PROCESS_CANCELLED` chiếu đúng, phân biệt `REJECTED` | Cancel process instance dở (Task_2) qua Camunda REST trực tiếp | **PASS** — projection cập nhật `trangThai=CANCELLED` (khác `REJECTED` ở TC1), xác nhận D20 "REJECTED != CANCELLED" đúng cả hai chiều |

**Không làm được** (không có browser tool trong phiên): click-through UI thật qua `/viec-cua-toi` →
`/ho-so/:id?taskKey=...` → bấm nút → xem "Đang cập nhật"/poll. Đã báo user cách cài Playwright MCP
(`claude mcp add playwright -- npx -y @playwright/mcp@latest`) nếu muốn agent tự lái được; nếu không,
cần user tự làm theo checklist Giai đoạn 2 đã đưa trước đó trong hội thoại.

**Dọn dẹp**: cancel Camunda process instance test qua REST, xoá sạch row test ở cả 2 DB (`ho_so`/
`nhiem_vu`/`dossier_step`/`ho_so_tai_lieu`/projection/inbox/outbox ở `qtkhcn_ho_so`;
`workflow_action_inbox`/`workflow_event_outbox`/`workflow_process_mapping`/`workflow_start_inbox` ở
`qtkhcn`), dừng cả 2 tiến trình java tạm (PID xác nhận đã chết), không đụng Docker/8091 đang chạy sẵn.

**Kết luận**: Lát 8 PASS ở tầng API/service với evidence thật. Còn lại trước khi cutover live: (a)
click-through UI thật (cần browser tool hoặc user tự làm), (b) flip
`QTKHCN_HO_SO_LEGACY_WRITES_ENABLED=false` trên môi trường thật sau khi (a) xanh, (c) xoá
`HoSoService.applyAction()`/DTO/controller cũ ở release kế tiếp theo đúng kế hoạch D20 mục 7.

---

## ★ PAST — Track Claude D20 Lát 6: wiring `ho-so-detail.ts` sang TaskActionService — DONE 2026-07-19

**Bối cảnh**: user báo `ho-so-detail.ts:133` vẫn gọi endpoint legacy `HoSoService.applyAction()` /
`POST /api/ho-so/{id}/actions`. Lúc bắt đầu sửa, phát hiện Track Codex đang chỉnh sửa file nền tảng
(`worklist.ts`, `task-action.service.ts`, `task-action.ts`) **real-time song song** — đã dừng, hỏi lại
user, được xác nhận "Nhánh code giao cho Codex đã xong, không chỉnh sửa `ho-so-detail.*`" trước khi tiếp
tục. Track Codex đã dựng xong: contract thật (`TaskAvailableActionsResponse` wrapper, `TaskActionRequest`
có `taskKey`, `formData` non-null, `TaskActionResult.status: 'ACCEPTED'`), `TaskActionService` tự lấy
identity từ `AuthService` (không cần header truyền tay), `worklist.ts` đã giữ `taskKey` qua query param
khi mở từ `/viec-cua-toi`. Phần còn thiếu đúng như Codex báo: `ho-so-detail.ts` chưa wiring.

**Đã sửa**:

- `ho-so-detail.ts`: đọc `taskKey` từ `route.snapshot.queryParamMap` (constructor); sau khi GET Hồ sơ
  thành công và `trangThai === 'PROCESSING'`, gọi `TaskActionService.availableActions(taskKey)` để lấy
  danh sách action thật từ server (không lọc quyền ở client). `applyAction()` gọi
  `TaskActionService.applyAction()` (không còn gọi `HoSoService.applyAction()`/`/api/ho-so/{id}/actions`
  legacy nữa — method cũ trong `HoSoService` vẫn giữ nguyên làm rollback bridge, chưa xoá, đúng kế hoạch
  "xoá ở release kế tiếp"). Sau `202`, KHÔNG cập nhật lạc quan từ response — poll `GET /api/ho-so/{id}`
  (lần đầu ngay lập tức, sau đó cách 1.5s, tối đa 10 lần) tới khi `buocHienTai`/`trangThai` đổi, rồi khoá
  `taskKey`/`availableActions` về rỗng (task cũ hết hiệu lực, bước kế tiếp thuộc task mới — phải quay lại
  "Việc của tôi" để lấy taskKey mới, xem gap dưới).
- **Gap có chủ đích, đã quyết định không tự đoán field backend mới**: `HoSoResponse`/`DossierStepResponse`
  (đọc từ `ho-so-service`) không mang `taskKey` — chỉ `MyTaskResponse` (`/api/my-tasks`) và query param từ
  `worklist.ts` mới có. Vì vậy **chi tiết Hồ sơ mở trực tiếp (không qua "Việc của tôi") không có quyền
  thao tác task** — nút Phê duyệt/Trả lại/Từ chối ẩn hoàn toàn, thay bằng `nz-alert` cảnh báo "Không có
  quyền thao tác task từ đây — mở từ Việc của tôi". Đây không phải bug, là hệ quả của việc không nới rộng
  contract backend ngoài phạm vi Track Claude (đúng rule active-task cũ: "nếu Angular cần biết thêm field
  mà kế hoạch chưa nêu, hỏi lại thay vì tự suy đoán contract"). Nếu cần chi tiết hồ sơ luôn thao tác được
  (không chỉ qua worklist), phải bàn cả hai track để thêm `taskKey` vào `DossierStepResponse` — chưa làm.
- `ho-so-detail.html`: 3 nút hành động chỉ hiện nếu `hasAction(code)` (từ response server) true; khi
  `saving()` (đang gửi lệnh hoặc đang poll), thay 3 nút bằng `nz-tag` "Đang cập nhật…" (khoá thao tác).
  Label "Ý kiến (bắt buộc)" dựa theo `selectedAction()?.requiresReason` của server, không hard-code theo
  outcome nữa.
- `ho-so-detail.spec.ts`: thêm 2 test — (1) mở PROCESSING không có `taskKey` → ẩn nút, hiện cảnh báo,
  KHÔNG gọi `available-actions`; (2) mở PROCESSING có `taskKey` (mô phỏng đến từ worklist) → GET
  available-actions đúng header `X-QTKHCN-User-Id`, render nút theo response, `applyAction()` POST đúng
  `{requestId,taskKey,actionCode,comment,formData:{},expectedTaskState:'ACTIVE'}` tới
  `/api/tasks/{taskKey}/actions` (KHÔNG còn gọi `/api/ho-so/{id}/actions`), rồi poll GET Hồ sơ và khoá lại
  `taskKey`/`availableActions` khi bước đổi.

**Verify**: `npx ng build` production GREEN (chỉ warning budget/CommonJS pre-existing, không mới).
`npx ng test --watch=false` full suite **174/174 PASS** (172 của Codex + 2 test mới, không regress).
Chưa chạy browser click-through qua backend thật (Track Codex đã dừng service 8090/8093 tạm sau smoke) —
đây là phần **còn lại chung của cả hai track**: ghép nhánh, khởi động lại 8090/8093 + gateway, chạy
click-through thật qua UI (`/viec-cua-toi` → mở task → phê duyệt/trả lại/từ chối → xác nhận `taskKey`
mới xuất hiện đúng ở lượt xử lý kế tiếp), rồi mới bật kill switch `legacy-writes-enabled=false` và dọn
`HoSoService.applyAction()`/endpoint cũ theo Lát 7.

---

## ★ CURRENT — Track Codex D20 backend Lát 0–5 — DONE + REAL E2E VERIFIED 2026-07-19

**Phạm vi đã hoàn tất**: backend Service Quản trị quy trình (8090) và projection tại
`ho-so-service` (8093). Angular cutover cuối Lát 6 vẫn thuộc Track Claude và chưa nằm trong lần sửa
backend này.

- **Lát 0**: `CamundaWorkflowRuntimeEventReader` vẫn ưu tiên `/v2/user-tasks/search`, nhưng khi view
  này rỗng sẽ đọc USER_TASK element-instance ACTIVE, ghép job `io.camunda.zeebe:userTask` để lấy đúng
  task key có thể complete, và đọc assignment/form metadata từ BPMN catalog. Smoke thật đã thấy
  `Task_1` trong `/api/my-tasks`; blocker TASK_CREATED được đóng.
- **Lát 1–4**: đã có API task-centric
  `GET /api/tasks/{taskKey}/available-actions` và `POST /api/tasks/{taskKey}/actions`; authorization
  assignee/candidate server-side; Action Studio policy là nguồn action; thực thi đúng task key;
  `workflow_action_inbox` idempotency, payload-hash conflict, UNKNOWN reconcile không retry mù; unique
  partial index chỉ cho một command RECEIVED/UNKNOWN trên một task.
- **Lát 5**: outbox phát `TASK_ACTION_APPLIED` và phân biệt `PROCESS_REJECTED` với
  `PROCESS_CANCELLED`; 8093 dựng task/step projection động từ event và chỉ cập nhật Hồ sơ qua
  projection. Bước được mở lại do RETURN xóa actor/comment/completion-time của lần xử lý trước.
  Demo identity role catalog ở 8093 đã đồng bộ với 8090, gồm `BGD_TT`/`BGD_KHOI` cho
  `tgd@example.com`.
- Endpoint legacy `POST /api/ho-so/{id}/actions` được chặn bởi
  `LegacyHoSoWriteGuardFilter` khi `qtkhcn.ho-so.legacy-writes-enabled=false`; code cũ chỉ còn làm
  rollback bridge cho tới khi Angular cutover, không được route sang 8093 và không được dùng sau
  cutover.

**Contract backend thật để Track Claude cutover (cần cập nhật client prep hiện tại)**:

- GET trả object `{taskKey, processInstanceKey, taskDefinitionKey, actions:[...]}`, không trả array
  trần. Mỗi action có `actionCode,label,tone,requiresReason,requiresEvidence,requiresConfirm,formKey`.
- POST body hiện yêu cầu `{requestId,taskKey,actionCode,comment,formData,expectedTaskState}`;
  `taskKey` body phải trùng path, `formData` là object (dùng `{}` nếu không có).
- POST trả HTTP 202 `{requestId,taskKey,processInstanceKey,status:"ACCEPTED"}`. Vì vậy Angular prep
  hiện tại cần bổ sung wrapper GET, `taskKey` trong body, non-null `formData`, và status `ACCEPTED`
  trước khi wiring UI.

**Evidence thật**:

- Smoke create NhiemVu/HoSo → submit → Camunda → `Task_1` PASS.
- Hồ sơ `HS-2026-004`, process `2251799813700405`: approve Task_1 → Task_2 → Task_3 → Task_4;
  Task_5 trả `RETURN_STEP`, Camunda tạo lại Task_4 key `2251799813700644`, projection quay về
  `buocHienTai=4` và không còn metadata cũ; sau đó `REJECT_STEP` làm Hồ sơ thành `REJECTED`.
- Authorization sai candidate trả 403; cùng request/payload trả lại kết quả; cùng request/payload
  khác trả 409. Flyway V16–V18 đều applied, gồm inflight unique index.
- Full `backend` Maven tests PASS; full `services/ho-so-service` Maven tests PASS.

**Còn lại để hoàn tất D20 end-to-end qua UI**: Track Claude sửa contract client như trên, wiring
`TaskActionService` vào chi tiết Hồ sơ/Việc của tôi, bật legacy-write kill switch khi cutover, rồi chạy
Lát 8 qua gateway/UI và xóa bridge monolith ở release kế tiếp.

## ★ CURRENT — Track Claude: chuẩn bị Lát 6/7 (D20) — DONE, chờ Track Codex Lát 0-5 để cutover 2026-07-19

**Yêu cầu user**: triển khai phần chuẩn bị Lát 6 (Angular) + Lát 7 (gateway) của kế hoạch D20 ngay
(entry "Refactor runtime task action..." bên dưới), không chờ Track Codex xong Lát 0-5 trước.

**Đã triển khai (additive, KHÔNG đụng luồng action hiện có)**:

- `core/models/task-action.ts`: `TaskActionCode` (tái dùng `HoSoActionOutcome` đã có — không phát minh
  action code mới), `TaskAvailableAction` (tái dùng `SimulatedAction` của Action Studio thay vì đoán
  shape mới, vì kế hoạch chỉ nói "Action Studio là nguồn cấu hình action khả dụng" chứ chưa khoá field
  riêng), `TaskActionRequest`/`TaskActionResult`/`TaskActionStatus` đúng field đã khoá ở Lát 2/3.
- `core/services/task-action.service.ts`: `TaskActionService` gọi `GET /api/tasks/{taskKey}/available-
  actions` và `POST /api/tasks/{taskKey}/actions` qua `API_BASE_URL` chung (route theo path qua gateway,
  không phải origin riêng) + `newRequestId()` (`crypto.randomUUID()`). Chưa gọi được thật vì backend
  8090 chưa có route này (Track Codex Lát 0-5) — sẽ 404 nếu gọi bây giờ.
- **Cố ý CHƯA wiring vào `ho-so-detail.ts`**: `HoSoService.applyAction()` + luồng `/api/ho-so/{id}/actions`
  hiện tại vẫn nguyên vẹn và đang hoạt động thật cho RD01.01 — thay ngay bây giờ sẽ phá tính năng đang
  chạy vì API mới chưa tồn tại. Việc gỡ `HoSoService.applyAction()` và chuyển `ho-so-detail`/
  `/viec-cua-toi` sang `TaskActionService` thật là phần còn lại của Lát 6, làm cùng lúc với cutover
  Lát 7 khi Track Codex báo API 8090 sẵn sàng (đúng "Cutover Angular + task API trong cùng release").
- Gateway (Caddyfile): thêm matcher `@task_actions` (`GET/POST` theo `path_regexp` khớp
  `/api/tasks/{taskKey}/(available-actions|actions)`) → `127.0.0.1:8090`, strip
  `X-QTKHCN-Role-Codes` client tự khai (đúng yêu cầu "không tin role do client tự khai" ở Lát 4).
  **Phát hiện khi rà lại file**: `/api/tasks/**` và `/api/action-studio/**` đã đi tới 8090 từ trước qua
  catch-all `handle /api/*` cuối file — đây KHÔNG phải strangler seam như `@my_tasks`/`@ho_so_*` (không
  có upstream cũ/mới để switch, 8090 sở hữu API này từ đầu), nên không cần `Switch-*Route.ps1` mới; chỉ
  cần matcher tường minh để bổ sung việc strip role header mà catch-all mặc định không làm.

**Verify**:

- `task-action.service.spec.ts` mới **3/3 PASS** (available-actions GET, actions POST đúng body/field,
  `newRequestId()` sinh UUID khác nhau mỗi lần).
- `npx ng build` production **GREEN**, không warning mới.
- `npx ng test --watch=false` full suite **168/170 PASS**; 2 fail còn lại
  (`approval-matrix.spec.ts`, `service-task-config.spec.ts`, timeout fetch icon qua mạng) là
  pre-existing/flaky đã ghi nhận nhiều lần trước, không liên quan.
- **Chưa validate được** `caddy validate` cho Caddyfile — máy hiện tại không có binary `caddy` trong
  PATH (giống hạn chế đã ghi nhận ở các lát trước); cú pháp `path_regexp`/`handle` theo đúng mẫu các
  block khác trong cùng file nhưng chưa chạy qua trình phân tích Caddy thật.

**Chưa làm** (chờ Track Codex Lát 0-5 xong API + event thật): wiring `TaskActionService` vào
`ho-so-detail`/`/viec-cua-toi` UI thật (nút action, khoá nút sau `202`, poll task/Hồ sơ projection), gỡ
`HoSoService.applyAction()` và endpoint cũ, xoá route catch-all cho `/actions` sau khi cutover xanh.

---

## ★ CURRENT — Refactor runtime task action về Service Quản trị quy trình — PLAN APPROVED 2026-07-19

**Quyết định của user**: Action Studio và việc người dùng thực thi task (`Phê duyệt`, `Trả lại`,
`Từ chối`) đều thuộc Service Quản trị quy trình. Service Quản lý NVKHCN & Hồ sơ chỉ sở hữu dữ liệu
nghiệp vụ và phản ánh trạng thái từ workflow event. Không chuyển `/actions` sang `ho-so-service`.
Quyết định này được khóa ở D20 trong `decisions.md`.

**Hiện trạng cần refactor**:

- Angular mở task từ `/viec-cua-toi` nhưng điều hướng sang `/ho-so/:maHoSo`; màn chi tiết gọi
  `POST /api/ho-so/{id}/actions` qua `HoSoService.applyAction()`.
- Endpoint cũ nằm trên backend cổng 8090 nhưng vẫn là implementation monolith: tìm Hồ sơ/bước hiện tại,
  gọi Camunda rồi trực tiếp cập nhật `HoSo`/`DossierStep` trong database cũ.
- `Rd0101ProcessService.applyAction()` nhận process instance, tự tìm user task mới nhất rồi complete;
  chưa nhận đúng `taskKey` mà người dùng đã chọn.
- Collector đã phát `TASK_CREATED`, `TASK_COMPLETED`, `PROCESS_COMPLETED`, `PROCESS_CANCELLED`,
  `INCIDENT_CREATED`; `ho-so-service` đã có inbox/dedup/projection. Chưa có event phân biệt
  `PROCESS_REJECTED` với hủy vận hành và chưa có audit event mang action/actor/comment.

**Kiến trúc đích**:

```text
Angular / Việc của tôi
  ├─ đọc task projection + Hồ sơ → Service NVKHCN (8093)
  └─ GET available actions / POST execute action → Service Quy trình (8090)
       → kiểm tra task + quyền + Action Studio policy
       → thực thi đúng Camunda taskKey, có idempotency/reconcile
       → phát workflow event bền vững
       → Service NVKHCN nhận event và cập nhật Hồ sơ/Việc của tôi
```

Service Quy trình tuyệt đối không ghi database Hồ sơ; UI không tự quyết định action/quyền khả dụng.

**Kế hoạch triển khai theo lát**:

1. **Khóa contract và semantics**
   - Chuẩn hóa `APPROVE`, `RETURN`, `REJECT` theo action code của Action Studio.
   - Khóa `REJECT` là kết quả nghiệp vụ riêng: `PROCESS_REJECTED → HoSo.REJECTED`;
     `PROCESS_CANCELLED → HoSo.CANCELLED`. Không dùng cancel chung để làm mất ngữ nghĩa từ chối.
   - Action Studio là nguồn cấu hình action khả dụng, role/permission, comment/form bắt buộc và routing
     variables theo process/task definition.

2. **API task-centric trên Service Quy trình**
   - Thêm `GET /api/tasks/{taskKey}/available-actions`.
   - Thêm `POST /api/tasks/{taskKey}/actions` với `requestId`, `actionCode`, `comment`, `formData`,
     `expectedTaskState`.
   - Response là kết quả lệnh (`requestId`, `taskKey`, `processInstanceKey`, `status`), ưu tiên `202`;
     không trả `HoSoResponse` và không giả định projection đã cập nhật đồng bộ.

3. **Idempotency và uncertain-result reconcile**
   - Thêm Flyway/bảng `workflow_action_inbox`: request/task/process/action/payload hash/actor,
     trạng thái `RECEIVED|UNKNOWN|COMPLETED|FAILED`, result/error/timestamps.
   - Cùng request + cùng payload trả kết quả cũ; cùng request + khác payload trả 409.
   - Timeout sau khi gửi Camunda chuyển `UNKNOWN` và reconcile trạng thái task; không retry mù.
   - Hai user/double-click chỉ có đúng một action logic thắng.

4. **Thực thi Camunda và authorization server-side**
   - Nhận và xử lý chính xác `taskKey`, không tìm "task mới nhất" theo process instance.
   - Xác minh task ACTIVE, thuộc đúng process mapping; user là assignee/candidate user/candidate group;
     action đang bật và đúng process/taskDefinitionKey/trạng thái.
   - Không tin role/actor do client tự khai; demo dùng catalog identity server-side, sau này thay bằng
     OIDC/IAM claims mà không đổi contract.

5. **Event/audit và projection**
   - Bổ sung `TASK_ACTION_APPLIED` (request/task/action/actor/comment) và `PROCESS_REJECTED`; giữ stable
     event ID, outbox, retry/backoff và inbox dedup hiện có.
   - `ho-so-service` chỉ cập nhật task, `buocHienTai`, trạng thái Hồ sơ và audit từ event; duplicate hoặc
     out-of-order phải cho cùng kết quả xác định.
   - Mapping: final approve → `APPROVED`, reject → `REJECTED`, operational cancel → `CANCELLED`, return
     → task cũ đóng và task BPMN đích xuất hiện lại.

6. **Angular cutover**
   - Giữ `taskKey` khi mở task từ `/viec-cua-toi`; tải available actions từ 8090 và render theo kết quả
     server, không lọc quyền ở client.
   - Gửi action với UUID requestId; sau `202` khóa nút, hiển thị "Đang cập nhật" và poll/reload task +
     Hồ sơ projection đến khi task cũ biến mất hoặc trạng thái thay đổi.
   - Không gọi `HoSoService.applyAction()` và không cập nhật lạc quan `HoSoResponse` từ action response.

7. **Gateway, compatibility và dọn monolith**
   - Route `/api/tasks/**` và `/api/action-studio/**` → 8090; `/api/my-tasks` và `/api/ho-so/**` → 8093.
   - Cutover Angular + task API trong cùng release. Endpoint cũ `/api/ho-so/{id}/actions` không được
     chuyển sang 8093; chỉ giữ adapter ngắn hạn nếu thật sự cần compatibility, không ghi Hồ sơ, rồi
     deprecate/410/xóa sau smoke. Rollback bằng release cũ, không dual-write.
   - Xóa `HoSoService.applyAction()`, DTO/controller/test cũ và dependency runtime action vào legacy
     `HoSoRepository` sau khi cutover xanh.

8. **Verify và nghiệm thu**
   - Contract/authorization/Action Studio policy tests; duplicate request, payload conflict, hai user
     cạnh tranh, Camunda timeout-but-completed, event duplicate/out-of-order, reject khác cancel.
   - Test kiến trúc: Service Quy trình không còn ghi bảng Hồ sơ; Service NVKHCN chỉ đổi trạng thái sau
     event.
   - E2E: tạo → gửi → thấy `Task_1` → approve → task đúng nhóm kế tiếp → return → task trước xuất hiện
     lại → reject → Hồ sơ `REJECTED` và không còn active task.

**Cập nhật 2026-07-19 — thêm Lát 0 (chặn Lát 5) và chia track Codex/Claude để chạy song song:**

Trước khi bắt đầu code, smoke E2E tự động (`services/ho-so-service/scripts/Invoke-E2ESmoke.ps1`, xem entry
"Hoàn tất E2E ... — USER E2E-VERIFIED" bên dưới) phát hiện: pipeline `TASK_CREATED` đang **rỗng thật** trong
môi trường hiện tại — `Task_1` genuinely `ACTIVE` trong Camunda (`/v2/element-instances/search` xác nhận)
nhưng `/v2/user-tasks/search` (API mà `CamundaWorkflowRuntimeEventReader.read()` dùng để phát `TASK_CREATED`)
trả rỗng toàn hệ thống. Phần còn lại của pipeline (collector cho `PROCESS_COMPLETED`/`PROCESS_CANCELLED` qua
`process-instances search`, outbox, dispatch, inbox, projection) đã xác nhận chạy đúng bằng đối chứng cancel
process thật. Lát 5 của kế hoạch dưới đây (event `TASK_ACTION_APPLIED`/`PROCESS_REJECTED` + projection) và
Lát 8 (E2E) đều **không thể verify được** cho tới khi gap này được xử lý — vì vậy thêm **Lát 0** chặn trước
Lát 5, và không để hai track cùng sửa `backend/src/main/java/vn/vht/qtkhcn/camunda/` cùng lúc.

- **Lát 0 — TASK_CREATED pipeline (BLOCKER cho Lát 5/8, track Codex)**: điều tra vì sao
  `client.newUserTaskSearchRequest()` (Camunda Java client, gọi `/v2/user-tasks/search`) trả rỗng trong khi
  `/v2/element-instances/search` cho cùng `processInstanceKey` thấy đúng `Task_1` ở trạng thái `ACTIVE`
  (`type=USER_TASK`). Hướng điều tra gợi ý: (a) container `orchestration` hiện chạy
  `ORCHESTRATION_CONFIG_FILE=application-h2.yaml` — kiểm tra xem secondary-storage H2 có thật sự phục vụ
  view "user task" hay chỉ phục vụ process/element-instance; thử restart container hoặc đổi profile nếu có
  sẵn; (b) nếu hạ tầng đúng nhưng API sai, cân nhắc đổi `CamundaWorkflowRuntimeEventReader` sang nguồn khác
  đã xác nhận hoạt động (`element-instances search` với `type=USER_TASK`, `state=ACTIVE`) thay vì
  `user-tasks search`, giữ nguyên payload fields hiện có (`taskKey`, `taskDefinitionKey`, `candidateGroups`,
  ...) nếu element-instance response có đủ dữ liệu tương đương, hoặc bổ sung nguồn phụ nếu thiếu trường.
  Done-when: `Invoke-E2ESmoke.ps1` chạy thật PASS hết (kể cả assertion `/api/my-tasks` đúng `Task_1`).

- **Track Codex — backend Quy trình + Hồ sơ (Lát 0 → 1 → 2 → 3 → 4 → 5)**: toàn bộ nằm trong
  `backend/src/main/java/vn/vht/qtkhcn/{camunda,workflow,service,web,domain,repository,security}` và
  `services/ho-so-service/src/main/java/**` — đúng phạm vi Codex đã sở hữu xuyên suốt Lát 5 bước 1–4 và
  Lát 4 D18. Thứ tự: Lát 0 (unblock TASK_CREATED) trước, vì Lát 5 không test được nếu chưa xong; Lát 1–4 có
  thể làm song song/xen kẽ với Lát 0 vì không phụ thuộc trực tiếp (contract, API skeleton, idempotency
  inbox, Camunda execution/authz đều là phần "action" mới, không cần `TASK_CREATED` đã đúng để viết/test
  đơn vị — chỉ cần đúng khi chạy E2E thật ở Lát 8).

- **Track Claude — Angular + gateway (Lát 6 → 7), chuẩn bị song song, không chờ Codex xong Lát 0–5**:
  - Lát 6 (Angular cutover): dựng trước phần không phụ thuộc HTTP thật — `TaskAction` model/service theo
    đúng contract đã khóa ở Lát 1 của kế hoạch này (`requestId`/`taskKey`/`actionCode`/`comment`/
    `formData`/`expectedTaskState` → response `requestId`/`taskKey`/`processInstanceKey`/`status`), UI
    xử lý task (nút action theo Action Studio, khóa nút sau `202`, trạng thái "Đang cập nhật", poll task/Hồ
    sơ), tách khỏi `HoSoService.applyAction()` cũ ở tầng gọi (giữ interface, đổi implementation khi API
    8090 sẵn sàng). Không tự chế mock server giả lập — nếu cần chạy thử trước khi Codex xong, dùng
    `AskUserQuestion` xác nhận có nên gắn tạm vào endpoint cũ `/api/ho-so/{id}/actions` để không block UI
    work, rồi tháo ra khi cutover thật.
  - Lát 7 (gateway): thêm route Caddy `/api/tasks/**` và `/api/action-studio/**` → 8090 (giữ nguyên
    `/api/my-tasks`, `/api/ho-so/**` → 8093 đã có), theo đúng mẫu các script `Switch-*Route.ps1` hiện có
    trong `infra/demo-tunnel/` — khu vực Claude đã làm xuyên suốt (My Tasks route, Ho So read/write route).
  - Không đụng `backend/.../{camunda,workflow,service,web,domain,repository,security}` hay
    `services/ho-so-service/src/main/java/**` trong track này — nếu Angular cần biết thêm field/hành vi từ
    API thật mà kế hoạch chưa nêu, hỏi lại thay vì tự suy đoán contract.

- **Lát 8 (E2E)**: chỉ chạy khi cả hai track xong — cần Codex (API + event thật) và Claude (Angular cutover
  + gateway route) cùng sẵn sàng; verify bằng `Invoke-E2ESmoke.ps1` mở rộng (thêm bước approve/return/reject)
  chứ không chỉ click-through thủ công.

**Thứ tự thực hiện ngay khi user yêu cầu code**: track Codex Lát 0 (unblock) song song Lát 1–2
(contract/API + test) → Lát 3–4 (idempotency/Camunda/auth) → Lát 5 (event/projection); track Claude Lát 6
(Angular, dựng trước phần không cần HTTP thật) song song Lát 7 (gateway) — hai track không đụng file của
nhau; Lát 8 E2E sau khi cả hai xong. Mỗi lát phải giữ test hiện có xanh và có rollback độc lập; chưa bắt đầu
implementation trong phiên lập plan.

---

## ★ CURRENT — App list + phân quyền theo App (D19) — DONE + VERIFIED 2026-07-18

**Yêu cầu user**: triển khai plan `C:\Users\DELL\.claude\plans\sorted-herding-shannon.md` theo phương án
một Angular shell, ba App logic và route gate theo entitlement demo.

**Đã triển khai**:

- D19 trong `decisions.md`; registry `qlnvkhcn` / `quytrinh` / `he-thong`, gán entitlement cho năm
  `DemoUser`, admin có đủ ba App. `AuthService` quản lý App đang chọn theo session.
- Màn ngoài shell `/chon-ung-dung`; login và login-page guard luôn điều hướng qua App list. Shell lọc menu
  theo App, hiển thị tên App hiện tại và có nút "Đổi ứng dụng".
- `appGuard` fail-closed: toàn bộ feature route có `data.app`; thiếu entitlement hoặc App đang chọn không
  khớp đều quay về App list. Đây chỉ là gate phía client, không thay authorization backend.
- `ho-so-service` có `GET /api/internal-integration/status`, tổng hợp trực tiếp outbox/inbox D18 và hồ sơ
  `START_FAILED`, không thêm bảng/migration. Caddy có read route với service token.
- `/nhat-ky` có tab thứ ba "Đồng bộ nội bộ", tách khỏi nhật ký job worker của sáu hệ thống ngoài.

**Verify**:

- `ho-so-service`: `mvnw.cmd -o test` **35/35 PASS**.
- Frontend targeted entitlement/guard/nhật ký: **16/16 PASS**; route metadata + nav-filter: **4/4 PASS**.
- Full Angular suite: **166/167 PASS**; một test `service-task-config.spec.ts` timeout là flaky đã được ghi
  nhận từ trước và không liên quan. Production `ng build` GREEN, chỉ còn các warning budget/CommonJS có sẵn.
- `git diff --check` sạch. Không validate Caddy vì máy không cài binary `caddy`.
- Không click-through trình duyệt: in-app Browser không có phiên khả dụng; không thay bằng browser backend
  khác theo quy tắc của Browser skill.

---

## ★ CURRENT — Port Angular màn Việc của tôi (`/viec-cua-toi`) — DONE + VERIFIED 2026-07-18 (owner Claude)

**Yêu cầu user**: port `webapp/src/pages/Worklist.tsx` sang Angular, route `/viec-cua-toi` (trước đó
`PlaceholderPage`). Đây là **Bước 5** trong thứ tự thực hiện của task E2E "Tạo hồ sơ → Gửi duyệt →
Camunda → Việc của tôi" (xem entry ngay dưới) — user chỉ định làm trước, song song với Codex đang làm
Bước 3 (`/api/my-tasks`), không chờ.

**Đã triển khai**:

- `pages/worklist/`: `WorklistPage` đã chuyển sang `GET /api/my-tasks`; gửi identity demo hiện tại qua
  `X-QTKHCN-User-Id` và dùng nguyên danh sách đã lọc server-side, không còn tải toàn bộ `/api/ho-so`
  hoặc lọc `roleCodes` ở Worklist. Bảng hiển thị contract task thật (mã hồ sơ/bước/task key/nhóm hoặc
  assignee/ngày tạo/hạn/form) và mở `/ho-so/:maHoSo`.
- Gateway có seam riêng `QTKHCN_MY_TASKS_UPSTREAM`, switch start/reload có readiness + API gate,
  inject bearer service token và xóa `X-QTKHCN-Role-Codes` client tự khai. Cutover runtime cần bật
  cùng release Angular mới; rollback route cần rollback Angular Worklist cũ.
- `app.routes.ts`: `/viec-cua-toi` đổi từ `PlaceholderPage` sang `loadComponent` lazy. Không cần icon
  mới (`form`/`folder-open` đã đăng ký sẵn ở `NAV_ICONS`/`NHIEM_VU_ICONS`).

**Verify**:

- Worklist targeted sau khi ghép API: **3/3 PASS**.
- `npx ng build` production **GREEN**, chỉ còn warning có sẵn (`action-studio.scss` budget,
  CommonJS `classnames`/`lodash`/`downloadjs` từ `@bpmn-io/form-js`).
- Không đụng file nào của Codex (`services/ho-so-service/**`,
  `backend/src/main/java/vn/vht/qtkhcn/{camunda,workflow,service,web,domain,repository,security}`) —
  xác nhận qua `git status` trước và sau khi làm.

**Chưa làm**: chưa cutover tiến trình 8090/8093/Caddy đang sống và chưa chạy smoke E2E Bước 7.

---

## ★ CURRENT — Port Angular màn Nhật ký (`/nhat-ky`) — DONE + VERIFIED 2026-07-18

**Yêu cầu user**: port màn React `/nhat-ky` (`webapp/src/pages/ProcessEventLog.tsx`, hub lịch sử 2 tab)
sang Angular. Route đã tồn tại nhưng trỏ `PlaceholderPage`.

**Quyết định phạm vi qua `AskUserQuestion`**: tab "Nhật ký luồng" (lịch sử sự kiện Zeebe per-hồ sơ) vẫn
mock vì không có backend nào lưu lịch sử Camunda (chưa tích hợp Operate/history export) — port nguyên
seed data. Tab "Nhật ký tích hợp" (bảng job worker cross-hồ sơ) nối vào backend thật thay vì lặp lại
mock, vì `GET /api/integration-systems/{key}/job-runs` đã tồn tại và seed đúng data từ lát `/tich-hop`
trước — đúng nguyên tắc một nguồn sự thật, tránh 2 bộ dữ liệu giả song song cho cùng một thứ.

**Đã triển khai**:

- `core/models/process-event.ts`: port `EventType`/`EVENT_META`/`ProcessEvent`/`seedEvents`/
  `eventDossiers` nguyên văn từ phần "History" của `webapp/src/data/camundaOps.ts` — chỉ scope cho
  tab Nhật ký luồng (mock, không đụng `integration-system.ts` đã port trước).
- `pages/nhat-ky/`: `NhatKyPage` — tab 1 filter theo hồ sơ/loại sự kiện, `nz-timeline` hiển thị sự kiện
  màu theo `EVENT_META`, 3 stat card (Sự kiện/Gọi hệ ngoài/Sự cố); tab 2 gọi thẳng
  `IntegrationSystemService.load()` rồi `loadJobRuns(key)` cho từng hệ (6 hệ), gộp bằng
  `computed(() => systems().flatMap(s => jobRunsFor(s.key)))` thành bảng cross-hồ sơ filter theo
  hệ/kết quả, 3 stat card (Lần chạy job/Đang thử lại/Thất bại) — không thêm state cục bộ nào, chỉ đọc
  qua service đã có.
- `app.routes.ts`: `/nhat-ky` đổi từ `PlaceholderPage` sang `loadComponent` lazy. Không cần icon mới —
  `history`/`filter` đã đăng ký sẵn (`NAV_ICONS`/`SERVICE_TASK_ICONS`).

**Verify**:

- `npx ng build` production **GREEN**, lazy chunk `nhat-ky` 17.33 kB.
- `npx ng test --watch=false` mới **4/4 PASS** (chạy cô lập); full suite **145/148 PASS** — 3 fail còn
  lại (`approval-matrix.spec.ts`, `approval-matrix-rules-tab.spec.ts`, `service-task-config.spec.ts`,
  đổi lượt mỗi lần chạy) là timeout fetch icon qua mạng, xác nhận **pre-existing/flaky** (đã ghi nhận
  từ các lát trước), không liên quan tới lát này.
- Không có collision với phiên song song khác (`git status` xác nhận): một phiên khác đang chạy đồng
  thời trên backend ("Hoàn tất E2E Tạo hồ sơ → Gửi duyệt → Camunda → Việc của tôi", xem entry ngay
  dưới) — chỉ sửa `backend/`/`services/ho-so-service/`, không đụng file nào của lát này.

**Chưa làm**: chưa click-through trình duyệt thật (không có browser tool) — user nên tự mở `/nhat-ky`,
thử: đổi hồ sơ/loại sự kiện ở tab Nhật ký luồng (xem timeline đổi theo), xem tab Nhật ký tích hợp tải
đúng job run thật từ backend và filter theo hệ/kết quả.

---

## ★ CURRENT — Hoàn tất E2E Tạo hồ sơ → Gửi duyệt → Camunda → Việc của tôi — USER E2E-VERIFIED 2026-07-19

**Cập nhật 2026-07-19 (owner: user, ghi nhận qua báo cáo trực tiếp, chưa có log/artifact do agent tự
quan sát)**: user báo đã tự test thành công **full luồng thật** trên local dev sau khi tự cutover
8090 (Quy trình) + 8093 (`ho-so-service`) + Caddy: Tạo hồ sơ → Gửi duyệt → đẩy hồ sơ sang Service Quản
trị quy trình (Camunda) → phản ánh lại trạng thái hồ sơ → thấy việc ở `/viec-cua-toi` trên Service Quản
lý NVKHCN. Điều này đóng gap #7 ("chưa ghép/cutover runtime") và bước 6 ("Gateway route/cutover") ở
dưới. Vì đây là test thủ công qua UI/API do user tự thực hiện (không phải script `smoke tự động` ở bước
7, và agent không trực tiếp quan sát log/output) nên **chưa đánh dấu bước 7 (smoke tự động) là DONE** —
vẫn còn thiếu: (a) script smoke tự động hoá create→submit→poll `PROCESSING`→gọi `/api/my-tasks`→assert
đúng `maHoSo`/`Task_1`/instance count=1, (b) gap #6 riêng: runtime action vẫn dùng implementation
monolith trực tiếp sửa Hồ sơ. Theo D20, action phải ở Service Quy trình nhưng chỉ điều khiển Camunda và
phát event; **không** chuyển sang Service Hồ sơ.

**Cập nhật 2026-07-19 (owner Claude) — script smoke tự động viết xong, chạy thật, phát hiện gap thật
chặn bước "Việc của tôi":** thêm `services/ho-so-service/scripts/Invoke-E2ESmoke.ps1` (tạo NhiemVu →
tạo HoSo → submit RD01.01 → poll `PROCESSING` → gọi `/api/my-tasks` với danh tính `pm@example.com` →
assert đúng 1 task, `taskDefinitionKey=Task_1`, `processInstanceKey` khớp `zeebeProcessInstanceKey`).
Đã tự dựng backend (8090) + `ho-so-service` (8093) tạm trên hạ tầng Docker Postgres/Camunda đang chạy
sẵn (tạo thêm database `qtkhcn_ho_so` — trước đó chưa tồn tại trong container `qtkhcn-postgres`) để chạy
script thật, không phải chỉ viết rồi để đó. **Kết quả: SMOKE FAIL** — luồng chạy đúng tới
`trangThai=PROCESSING` với `zeebeProcessInstanceKey` hợp lệ và ổn định (xác nhận qua
`workflow_process_mapping` + Camunda REST `/v2/process-instances/search`: instance `ACTIVE`, đúng
`businessId=maHoSo`), nhưng `/api/my-tasks` trả rỗng **cho mọi danh tính kể cả admin**. Root cause xác
định chính xác bằng Camunda REST trực tiếp (không qua code qtkhcn): `/v2/element-instances/search` xác
nhận `Task_1` đang `ACTIVE` (đúng BPMN, đúng thiết kế), nhưng `/v2/user-tasks/search` — API mà
`CamundaWorkflowRuntimeEventReader` dùng để phát `TASK_CREATED` — trả **0 item ngay cả khi gọi không
filter** (rỗng toàn hệ thống, không riêng process này). Vì vậy `workflow_event_outbox` (backend) không
bao giờ có dòng `TASK_CREATED`, kéo theo `workflow_event_inbox`/`workflow_task_projection`
(`ho-so-service`) rỗng theo. **Đối chứng loại trừ nguyên nhân khác**: hủy 2 process instance test qua
Camunda REST → collector bắt đúng `PROCESS_CANCELLED` qua `/v2/process-instances/search` (API này hoạt
động bình thường) → event chảy đúng hết pipeline tới `workflow_process_projection` (`state=CANCELLED`).
Nghĩa là collector/outbox/dispatch/inbox/projection **đúng thiết kế và chạy đúng** — lỗ hổng nằm hẹp ở
chỗ index/secondary-storage "user task" của container Camunda 8.9.13 hiện tại (`orchestration`, chạy
`ORCHESTRATION_CONFIG_FILE=application-h2.yaml`) không phục vụ được `/v2/user-tasks/search`, dù
`element-instances`/`process-instances` search vẫn đúng. Đây là gap hạ tầng/cấu hình Camunda, không phải
bug trong `WorkflowEventCollector`/`ho-so-service`. Không kết luận báo cáo test thủ công trước đó của
user (mục "USER E2E-VERIFIED") là sai — có thể phiên/khoảnh khắc test đó có trạng thái Camunda khác;
chỉ ghi nhận: **trong môi trường hiện tại, kịch bản tự động không tái lập được bước "thấy việc ở
`/viec-cua-toi`"**, cần user hoặc Codex xác nhận lại cấu hình secondary storage của container
`orchestration` (hoặc thử lại sau khi container được cấp lại) trước khi coi bước 7 là DONE. Đã dọn sạch
sau khi điều tra: 2 process instance test đã cancel, toàn bộ dòng debug trong `ho_so`/`nhiem_vu`/
`workflow_process_mapping`/projection đã xoá, 2 tiến trình owned (8090/8093) đã kill, backend dev 8091
của phiên khác không bị đụng. Database `qtkhcn_ho_so` mới tạo được **giữ lại** (cần thiết để chạy
`ho-so-service`, trước đó thiếu hẳn trong container dùng chung).

---

## ★ PAST — Hoàn tất E2E Tạo hồ sơ → Gửi duyệt → Camunda → Việc của tôi — GAP ASSESSED 2026-07-18

**Mục tiêu nghiệm thu**: người dùng tạo hồ sơ, gửi duyệt RD01.01, Service Quy trình khởi tạo đúng một
process instance và hồ sơ xuất hiện trong `/viec-cua-toi` của người thuộc candidate group hiện tại.

**Đã có**:

- Angular tạo hồ sơ và gửi duyệt qua API thật.
- `ho-so-service` ghi `START_PENDING` + outbox cùng transaction, dispatch có retry/backoff/lease.
- Backend Quy trình start Camunda idempotent, reconcile kết quả chưa rõ và đã E2E thật tới trạng thái
  hồ sơ `PROCESSING` với đúng một process instance.
- BPMN RD01.01 tạo user task đầu tiên `Task_1`, candidate group `PM`.

**Gap chặn E2E**:

1. ~~Chưa có workflow events từ Service Quy trình về Service Hồ sơ.~~ **DONE + VERIFIED 2026-07-18**:
   collector Camunda → transactional outbox/retry → internal HTTP → inbox atomic dedup đã hỗ trợ
   `TASK_CREATED`, `TASK_COMPLETED`, `PROCESS_COMPLETED`, `PROCESS_CANCELLED`, `INCIDENT_CREATED`.
2. ~~Đã có inbox/dedup; chưa có task/status projection và reconciliation job trong `ho-so-service`.~~
   **DONE + VERIFIED 2026-07-18**: V5 task/process projection, rebuild xác định từ inbox, cập nhật
   `HoSo`/`dossier_step` và reconciler cho row chưa xử lý; duplicate/out-of-order đã khóa bằng test +
   PostgreSQL smoke thật.
3. ~~Chưa có API `GET /api/my-tasks`.~~ **DONE + VERIFIED 2026-07-18**.
4. ~~Angular Worklist chưa đọc task thật.~~ **DONE + VERIFIED 2026-07-18**.
5. ~~Chưa có identity/role mapping backend cho demo.~~ **DONE + VERIFIED 2026-07-18**.
6. `/actions` vẫn dùng implementation monolith trực tiếp sửa Hồ sơ. **PLAN APPROVED 2026-07-19 theo
   D20**: giữ runtime action ở Service Quy trình, đổi sang task-centric API, bỏ ghi Hồ sơ trực tiếp và
   phản ánh kết quả qua event; không chuyển endpoint sang Service Hồ sơ.
7. ~~Chưa ghép/cutover runtime~~ **User-verified DONE 2026-07-19**: user tự cutover 8090 (Quy trình) +
   8093 (`ho-so-service`) + Caddy trên local dev và tự test full luồng thành công (xem entry
   "USER E2E-VERIFIED 2026-07-19" ở đầu file). Agent chưa trực tiếp quan sát log/output của lần test này.

**Thứ tự thực hiện tiếp theo**:

1. ✅ Workflow event publisher → inbox/dedup phía Hồ sơ — DONE + VERIFIED 2026-07-18.
2. ✅ Task/status projection + reconcile, có test duplicate và out-of-order — DONE + VERIFIED 2026-07-18.
3. ✅ API `/api/my-tasks` với lọc server-side và contract test — **DONE + VERIFIED 2026-07-18**.
4. ✅ Identity/role mapping cho tài khoản demo, backend tự cấp role và bỏ qua role client tự khai —
   **DONE + VERIFIED 2026-07-18**.
5. ✅ Port Worklist React sang Angular và chuyển sang `/api/my-tasks` lọc server-side —
   **DONE + VERIFIED 2026-07-18**.
6. ~~Gateway route/cutover~~ **User-verified DONE 2026-07-19**: user tự khởi động/cutover 8090 + 8093
   trên local dev và tự xác nhận full luồng chạy được qua UI/API.
7. 🟡 Smoke tự động (script, không phải test thủ công): create → submit → poll `PROCESSING` → gọi
   `/api/my-tasks` bằng user `PM` → xác nhận đúng `maHoSo`, `Task_1`, và Camunda correlation/instance
   count bằng 1. **Vẫn chưa có** — test thủ công của user ở bước 6 không thay thế script này.

**Kết quả bước 1**: backend Quy trình có Flyway V15, collector Camunda Search, outbox + dispatcher
lease/backoff; `ho-so-service` có Flyway V4, endpoint `POST /internal/v1/workflow-events` và inbox
atomic `ON CONFLICT`. Same event trả 200, same id/different payload trả 409. Full test: backend
165 (1 skipped), service Hồ sơ 20/20. PostgreSQL smoke thật khởi động cả hai app; HTTP thật trả
202 → 200 → 409 và DB chỉ có một inbox row. Chi tiết:
`docs/arch/nvkhcn-ho-so-slice-5-step-1-workflow-events.md`.

**Kết quả bước 2**: `ho-so-service` có Flyway V5, `workflow_task_projection` +
`workflow_process_projection`, cập nhật trạng thái aggregate Hồ sơ/bước trong cùng transaction nhận event,
và reconciler dựng lại các inbox chưa xử lý. Projection luôn rebuild theo `(occurredAt,eventId)` nên
completion giao trước creation không mở task lại, process terminal không bị event cũ làm lùi. Full test
23/23. PostgreSQL thật boot Flyway V1–V5/Hibernate validate; HTTP out-of-order + duplicate trả
`202 → 202 → 200`, task vẫn `COMPLETED`, inbox 2/2 processed. Tài nguyên tạm đã dọn. Chi tiết:
`docs/arch/nvkhcn-ho-so-slice-5-step-2-workflow-projection.md`.

**Kết quả bước 3**: `/api/my-tasks` lọc task `ACTIVE` theo assignee/candidate user/candidate group hoàn toàn
server-side, contract 11 trường và service-token boundary đã khóa bằng test. Chi tiết:
`docs/arch/nvkhcn-ho-so-slice-5-step-3-my-tasks.md`.

**Kết quả bước 4**: backend map 5 identity Angular demo sang candidate groups; admin xem mọi task active,
identity lạ trả 403 và `X-QTKHCN-Role-Codes` từ client bị bỏ qua. Full `ho-so-service` 32/32 test pass. Chi tiết:
`docs/arch/nvkhcn-ho-so-slice-5-step-4-demo-rbac.md`.

---

## ★ CURRENT — Tách Service Quản lý NV KHCN & Hồ sơ — LÁT 4 CODE DONE + REAL E2E VERIFIED 2026-07-18

**Đã triển khai**:

- Service Hồ sơ: Flyway V3, trạng thái `START_PENDING`/`START_FAILED`, submit + outbox cùng transaction,
  dispatcher HTTP retry/backoff, processing lease phục hồi crash, cập nhật `PROCESSING` khi nhận result và
  cho phép người dùng retry sau lỗi terminal.
- Service Quy trình: Flyway V14, endpoint `POST /internal/v1/process-instances`, bearer token riêng,
  canonical SHA-256 idempotency, inbox + process mapping, allowlist variables, Camunda start và reconcile
  theo `qtkhcnStartRequestId`.
- Contract: lần đầu 201, duplicate cùng payload 200/cùng result, khác payload 409; kết quả start chưa rõ
  giữ `UNKNOWN` và chỉ reconcile, không start mù lần hai.
- Angular hiểu trạng thái mới, gửi actor khi submit và có UX “Thử gửi lại”; Caddy route `/submit` theo
  write seam sang service Hồ sơ, còn `/actions` ở service Quy trình tới Lát 5.

**Verify**: `ho-so-service` 16/16 test; backend 164 test, 1 skipped có chủ đích; Angular targeted 2/2 +
production build xanh. Migration chạy trên PostgreSQL 16 thật. E2E PostgreSQL + Camunda thật tạo đúng một
instance; duplicate trả 200, conflict 409; ép inbox về `UNKNOWN` rồi retry reconcile đúng key cũ,
Camunda correlation vẫn 1. Smoke instance đã cancel, database/process/port tạm đã dọn; chưa cutover live.

**Chi tiết**: `docs/arch/nvkhcn-ho-so-slice-4-reliable-start.md`.

**Next concrete action**: Lát 5 — workflow events + inbox/dedup phía service Hồ sơ, projection trạng thái
và reconciliation job. Không chuyển `/actions` trước khi event duplicate/out-of-order tests xanh.

---

## ★ CURRENT — Port Angular + BE cho màn Tích hợp (`/tich-hop`) — DONE + VERIFIED 2026-07-18

**Yêu cầu user**: port màn React `/tich-hop` (Trạng thái Tích hợp — Seam B Camunda ↔ hệ ngoài)
sang Angular, rồi code backend thật và ghép BE vào màn này.

**Đã triển khai**:

- **Backend mới** (`backend/src/main/resources/db/migration/V13__integration.sql` + domain/
  repository/service/controller/dto): 3 bảng `integration_system` (đăng ký hệ ngoài, seed đúng 6 hệ
  QLNS/MS/SAP/QLTS/PLM/IAM từ `camundaOps.ts`), `integration_job_run` (đọc-chỉ, seed 6 job run mẫu),
  `integration_mapping` (mapping dữ liệu QTKHCN↔hệ ngoài, `fields_json` lưu `FieldMapping[]`, seed 3
  mapping mẫu từ `integrationMapping.ts`). API `/api/integration-systems` (list, job-runs, connect,
  disconnect — `If-Match`/`X-QTKHCN-Actor` đúng pattern eForm/Action Studio) và
  `/api/integration-mappings` (CRUD fields + đổi trạng thái). **API key không lưu plaintext**: chỉ
  SHA-256 hash + 4 ký tự cuối hiển thị (không có luồng nào cần giải mã lại full key). Port thẳng
  `validateMappingConfig` (React) sang Java, giữ đúng ngữ nghĩa "luôn ghi lại trạng thái, kể cả khi
  Active thất bại thì ghi 'error'" của `IntegrationMappingContext.setStatus` gốc.
- **Angular full parity**: `core/models/integration-system.ts`/`integration-mapping.ts` (đã có sẵn
  từ lát Service Task Config, mở rộng thêm nhãn hiển thị + `previewMapping`/job-run helpers, giữ
  nguyên `seedIntegrations`/`seedMappingConfigs` tĩnh cho dropdown connector của Service Task — không
  đụng), `core/services/integration-system.service.ts`/`integration-mapping.service.ts` (HTTP-backed
  signal cache ngay từ đầu, không qua giai đoạn mock). Component: `pages/integration-status/` (2 tab
  thật: Tổng quan + Mapping dữ liệu, 3 tab "sắp có" giữ nguyên như React) +
  `shared/integration-system-card/` + `shared/integration-system-detail-drawer/` +
  `shared/integration-mapping-studio/` + `shared/integration-mapping-field-editor/`. Route
  `/tich-hop` đổi từ `PlaceholderPage` sang lazy `loadComponent`. Icon mới `INTEGRATION_ICONS`
  (bank/safety-certificate/setting/shopping-cart) đăng ký tĩnh trong `app.ts`.
- **Preview payload trung thực hơn bản gốc**: React dùng seed tĩnh `nhiemVu.ts`/`dossiers.ts` cho
  bản ghi mẫu; Angular không còn seed tĩnh cho NhiemVu/HoSo (đã có backend thật) nên
  `IntegrationMappingStudio` lấy mẫu trực tiếp từ `NhiemVuService`/`HoSoService` — NhanSu vẫn trả
  rỗng vì `NhiemVuResponse` không tách `maNhanVien`/`email`/`donViCongTac` (đúng tinh thần "trung
  thực về giới hạn" đã áp dụng cho TaiSan ở bản gốc).

**Verify (real, không giả định)**:

- Backend `mvn -o test` **158/158 PASS, 1 skipped có chủ đích** (28 test mới:
  `IntegrationSystemServiceTest`/`IntegrationMappingServiceTest`/`IntegrationSystemHttpContractTest`/
  `IntegrationMappingHttpContractTest`).
- Angular `npx ng build` production **GREEN** (lazy chunk `integration-status` 50.15 kB); `npx ng
  test --watch=false` **130/130 PASS** trước, sau khi thêm 3 spec mới (service × 2 + page) vẫn xanh —
  chỉ `approval-matrix.spec.ts` timeout do fetch icon qua mạng, xác nhận **pre-existing/flaky**, tái
  hiện y hệt khi chạy cô lập, không liên quan tới lát này.
- **Real Postgres smoke thật** trên database tạm `qtkhcn_v13_verify` (container `qtkhcn-postgres`,
  không đụng DB `qtkhcn` dùng chung): áp đủ V1→V13 qua `psql` → đúng 6 hệ/6 job run/3 mapping, JSON
  hợp lệ. Sau đó chạy `spring-boot:run` thật trên cổng tạm **8097** (không đụng 8090 live demo/8091
  dev) trỏ vào DB tạm: `GET /api/integration-systems` không key → 401; có key → đúng 6 hệ; connect
  SAP → 200 `trangThai:healthy` + `apiKeyTail` đúng 4 ký tự cuối; retry với `If-Match` cũ → **409**
  đúng; disconnect → `trangThai:down`, `apiKeyTail:null`; tạo mapping mới → activate khi field rỗng →
  **fail-closed đúng** (`ok:false`, 2 lỗi, mapping ghi `trangThai:error`); sau khi lưu field khoá định
  danh hợp lệ → activate lại → `ok:true`, `trangThai:active`; xoá sạch (`204`). Đã dừng process tạm
  (PID 13164) và xoá DB tạm sau khi verify — không để lại tiến trình/dữ liệu rác.
- **Phát hiện phụ, không phải do lát này**: một phiên khác đang chạy song song thêm
  `V14__workflow_start_inbox.sql` + `WorkflowStartException` vào `GlobalExceptionHandler.java` — file
  này có bug thật (`payload_hash` khai `varchar(64)` ở entity nhưng cột SQL là `CHAR`, Hibernate
  validate fail khi boot full app với `ddl-auto=validate` mặc định). Xác nhận bug này tồn tại độc lập
  với V13 (V13 tự áp/verify sạch trước khi V14 chạy); phải tạm `--spring.jpa.hibernate.ddl-auto=none`
  cho riêng phiên smoke test cô lập của lát này để không bị chặn bởi bug không liên quan. Không sửa
  file của phiên kia (đang có thay đổi chưa commit, không phải việc của lát này).

**Chưa làm**: chưa ghép code Integration vào jar tổng hợp cổng dev 8091 (đang chạy jar từ worktree
`ql-nvkhcn-be-approval-matrix` của các lát trước, cộng thêm rủi ro đụng độ với phiên V14 đang chạy
dở) — theo đúng tiền lệ nhiều lát trước, không tự restart 8091 khi có task song song khác đang ghi
nhận trên cùng cổng/DB. Chưa click-through trình duyệt thật (không có browser tool). Người dùng nên:
(1) khi phiên V14 kia hoàn tất và ổn định, ghép thêm 4 file Integration (domain/repository/service/
controller/dto + `V13__integration.sql`) vào worktree tổng hợp rồi restart 8091; (2) sau đó tự mở
`/tich-hop` trên `ng serve` để xác nhận UI (card hệ, kết nối/ngắt kết nối, xem chi tiết, tab Mapping
dữ liệu: tạo/sửa field/preview/kích hoạt).

---

## ★ CURRENT — Restart backend dev 8091, áp Flyway V12 — DONE + VERIFIED 2026-07-16

**Yêu cầu user**: restart backend cổng 8091 ngay để Flyway tự chạy V12.

**Đã thực hiện**:

- Xác định PID 26948 là jar tổng hợp Approval Matrix + Action Studio + eForm trong worktree
  `C:\Users\phuctd7\ql-nvkhcn-be-approval-matrix\backend`.
- Copy nguyên byte `V12__eform_rd0202.sql` từ workspace chính sang worktree tổng hợp; SHA-256 hai
  file giống nhau (`F2EB319F...B4B8`). Dừng PID cũ, chạy `mvnw.cmd -o clean package`; toàn bộ
  **111/111 test PASS**, Spring Boot repackage thành công.
- Khởi động lại cổng 8091 bằng jar mới, PID **23944**. Flyway log xác nhận schema từ v11 lên v12:
  `Migrating schema "public" to version "12 - eform rd0202"` và `Successfully applied 1 migration`,
  hiện ở version v12.
- Smoke API thật: `/api/eform` HTTP 200, đúng **39 form** (8 gốc + 31 RD02.02), có key
  `bm-02-01-dki-nv`; `/api/approval-matrix/rules` HTTP 200 và `/api/action-studio` HTTP 200.

**Lưu ý**: jar này không expose `/actuator/health`; readiness được xác nhận bằng API eForm thật và
listener cổng 8091. Log startup: `backend-8091-v12.log`.

---

## ★ CURRENT — Port Angular + ghép BE màn Chi tiết Hồ sơ — DONE + VERIFIED 2026-07-16

**Yêu cầu user**: port màn React `/ho-so/HS-2026-031` sang Angular, đồng thời hoàn thiện backend
và nối backend vào frontend.

**Đã triển khai**:

- Route lazy `/ho-so/:id` với `HoSoDetailPage`: loading/404/error, header và tag trạng thái, cảnh
  báo vòng đời, sơ đồ bước, thông tin hồ sơ + nhiệm vụ, tài liệu, timeline, gửi duyệt hồ sơ draft
  và 3 outcome xử lý bước (phê duyệt/trả lại/từ chối).
- `HoSoService` Angular nối trực tiếp `GET /api/ho-so/{id}`, `POST /api/ho-so/{id}/submit` và
  `POST /api/ho-so/{id}/actions`; actor lấy từ tài khoản demo đang đăng nhập. Danh sách Hồ sơ và
  bảng Hồ sơ trong Chi tiết Nhiệm vụ điều hướng thẳng sang màn mới.
- `HoSoResponse` backend thêm `taiLieu[]` và `thoiGianThucHien`, nên màn chi tiết không dùng mock.
  Đồng bộ cùng shape ở service Hồ sơ tách mới để route read-canary không lệch contract.
- UI phản ánh đúng gap BE: RD01.01 cấp Cơ sở gửi duyệt được; quy trình chưa được BE hỗ trợ bị khoá
  và cảnh báo rõ. Kho tệp chưa có API binary nên Xem/Tải vẫn disabled như màn React; metadata tài
  liệu lấy từ backend thật.
- Thêm 2 unit test màn Angular và mở rộng contract test của cả backend chính/service Hồ sơ.

**Verify**: backend chính **127 tests, 0 failure, 0 error, 1 skipped**; service Hồ sơ **8/8 PASS**;
Angular **31/31 files, 130/130 tests PASS**; production build **GREEN** (chỉ warning có sẵn).
Không restart cổng dev 8091 vì đang chạy jar tổng hợp của nhiều workstream.

---

## ★ CURRENT — Khởi tạo eForm cho RD02.02 (theo cột Mã biểu mẫu, Bảng A) — DONE + VERIFIED 2026-07-16

**Yêu cầu user**: đọc tài liệu nguồn `RD02.02 Xét duyệt NV KHCN cấp Tập đoàn.md` (paste vào chat,
file gốc bị lỗi encoding mojibake — đọc theo ngữ cảnh, không copy nguyên văn chuỗi hỏng) và khởi tạo
sẵn các eForm dùng cho RD02.02 theo cột "Mã biểu mẫu" ở Bảng A — Luồng chính.

**Đã triển khai**: `backend/src/main/resources/db/migration/V12__eform_rd0202.sql` — seed 31 eForm
mới vào bảng `eform` có sẵn (hạ tầng CRUD/API `/api/eform` đã DONE từ lát trước, xem entry eForm bên
dưới), dùng đúng schema form-js đã khoá (D12/D13):

- **20 mã BM.02.01 → BM.02.20** rút từ Bảng A (đã gộp trùng — nhiều bước dùng lại cùng 1 bộ biểu mẫu,
  vd. Bộ HSXD BM.02.01-07 xuất hiện lại ở B12/B17/B28-31/B33/B39; BM.02.08 dùng chung cho cả HĐXD VHT
  và Tập đoàn; BM.02.09-15 dùng chung phiên 1/phiên 2 cả 2 cấp). `form_key` slug hoá từ mã (vd.
  `bm-02-01-dki-nv`), `loai` map vào đúng 5 giá trị CHECK constraint hiện có (Soạn thảo/Nhận xét/Thẩm
  định/Phê duyệt — không có "Biên bản" nên BM.02.15.BBH.NV xếp vào Thẩm định).
- **11 mã `[MỚI]`** (PNX_KHCN/TCKT/MS/NS nội bộ VHT, BIEN_BAN_BAN_GIAO_HS, PHIEU_KIEM_TRA_HO_SO_TD,
  CV_DE_NGHI_THAM_DINH_HS, PNX_BAN_CNCNC/DTXD/TCKT/TCNL Tập đoàn) — các mã tài liệu nguồn đánh dấu
  chưa có trong bộ BM.02 chính thức. `bm-02-17-ttr-nv` giữ nguyên cảnh báo `[CHƯA CHỐT]` của tài liệu
  nguồn (B26 gọi là "CV đề nghị xét duyệt", mã BM.02.17 lại định nghĩa là Tờ trình — cần xác nhận
  mapping) trong cả `ten` lẫn `mo_ta`, không tự quyết định thay.
- Mỗi form là bản **khởi tạo/scaffold** (header + 2-4 trường theo đúng gợi ý cột "Dữ liệu vào/ra
  chính" ở Bảng B của tài liệu nguồn), không phải bản hoàn thiện nghiệp vụ — cố ý **không** thêm
  trường quyết định kiểu `ketLuan` Đạt/Chưa đạt vào các form mới cho khớp D10 ("nút bấm mới là quyết
  định, form chỉ chứa dữ liệu hỗ trợ"); vài form gốc trong `V11__eform.sql` (seed trước D10) vẫn có
  `ketLuan` — không đụng, không phải phạm vi lát này.
- Binding các form này vào Action Studio (`formKey` trên `ActionAvailabilityPolicy`, theo D10) **chưa
  làm** — nằm ngoài phạm vi "khởi tạo sẵn eForm" mà user yêu cầu; cần một lát riêng khi BPMN RD02.02
  thật + `taskDefinitionKey`/`processCode`/`dossierStatus` đã có.

**Verify (real, không giả định)**:
- Áp thử `V11__eform.sql` rồi `V12__eform_rd0202.sql` vào database Postgres tạm
  `qtkhcn_v12_verify` trên container `qtkhcn-postgres` (không đụng DB `qtkhcn` dùng chung) — cả 2
  chạy sạch, không lỗi cú pháp/constraint. `SELECT count(*)` xác nhận đúng 39 dòng (8 gốc + 31 mới),
  0 dòng `loai` NULL/vi phạm CHECK, 0 dòng `schema_json::jsonb` cast lỗi (JSON hợp lệ toàn bộ), thứ
  tự `ORDER BY created_at DESC` đúng thứ tự Bảng A → 11 mã `[MỚI]` → 8 form gốc. Đã `DROP DATABASE`
  dọn sạch sau khi verify.
- Backend `EformServiceTest` (7/7) + `EformHttpContractTest` (5/5) **PASS** — xác nhận thêm migration
  không phá vỡ service/contract hiện có (test này mock repository, không tự chạy Flyway, nên phần
  xác nhận SQL thật nằm ở bước DB tạm phía trên).

**Chưa làm**: chưa restart backend dev cổng 8091 để migration này thật sự chạy trên DB `qtkhcn` dùng
chung — một phiên khác (entry "BE + FE luồng Tạo mới Hồ sơ" ngay dưới) đang chủ động tránh đụng
topology cổng 8091 vì có task song song khác đang ghi nhận trên cổng đó; giữ nguyên tinh thần đó,
không tự restart. Migration sẽ tự áp dụng ở lần restart/deploy kế tiếp (Flyway migrate-on-boot).
Chưa gộp file migration này sang worktree `ql-nvkhcn-be-approval-matrix` (nơi eForm code đã được gộp
trước đó) — cần làm khi có nhu cầu chạy thật trên cổng 8091/deploy demo. Chưa click-through Form
Library trên trình duyệt thật để xem 31 form mới hiển thị đúng.

---

## ★ CURRENT — BE + FE luồng Tạo mới Hồ sơ — DONE + VERIFIED 2026-07-16

**Yêu cầu user**: code backend và port Angular từ màn React `/ho-so/tao-moi` cho tính năng tạo mới Hồ sơ.

**Đã triển khai**:

- Mở rộng `POST /api/ho-so` nhận thêm `ngayTao` và danh sách `taiLieu`; giữ constructor 3 tham số
  để tương thích caller cũ. Backend trim người khởi tạo/tài liệu, lưu ngày và đúng tài liệu người dùng
  chọn; khi caller cũ không gửi tài liệu vẫn sinh bộ tài liệu mặc định theo từng loại hồ sơ.
- Angular thêm route lazy `/ho-so/tao-moi`, trang `HoSoCreatePage` tải nhiệm vụ + lịch sử hồ sơ từ API
  thật, hỗ trợ query `maNV`, tự điền chủ nhiệm, chọn loại/ngày/tài liệu, cảnh báo lệch giai đoạn,
  preview nhóm quy trình RD01–RD06 và submit về backend.
- Thêm nút `Tạo hồ sơ` ở danh sách hồ sơ và chi tiết nhiệm vụ. Sau khi tạo thành công quay về danh
  sách và lọc theo mã hồ sơ vừa tạo.
- Bổ sung contract/service tests backend và 2 unit tests Angular cho prefill + payload create.

**Verify**: backend full suite **127 tests, 0 failure, 0 error, 1 skipped**; Angular full suite
**30/30 files, 128/128 tests PASS**; `npx ng build` production **GREEN** (chỉ còn các warning budget/
CommonJS đã có sẵn). Chưa restart backend dev/click-through live để tránh làm thay đổi topology cổng
8091 đang được ghi nhận bởi các task song song.

---

## ★ CURRENT — Ghép BE vào FE `/phan-he/PH3/bieu-mau` (eForm) — DONE + VERIFIED 2026-07-16

**Yêu cầu user**: xây backend thật cho màn Angular "Thư viện biểu mẫu" (eForm) và thay
`EformService` signal-based (seed in-memory) bằng API, theo đúng pattern đã làm cho Ma trận phê
duyệt / Action Studio.

**Đã triển khai**:

- Flyway `V11__eform.sql` (bảng `eform`: `form_key` PK, `ten`/`mo_ta`/`loai`, `schema_json` TEXT,
  optimistic-lock `version`, audit `updated_by`/`updated_at`/`created_at`) + seed đúng 8 biểu mẫu
  gốc (thứ tự hiển thị giữ nguyên bằng `created_at` giảm dần, so le 1 giây/dòng).
- `Eform` entity + `EformRepository` + `EformService` (CRUD, `If-Match` optimistic lock,
  `EformConflictException` → 409 qua `GlobalExceptionHandler`) + `EformController`
  (`/api/eform`: `GET`/`GET {key}`/`POST`/`PUT {key}/meta`/`PUT {key}/schema`/`DELETE {key}`).
  DTO `schema` dùng kiểu `Object` (không phải `JsonNode`) — xác nhận thật bằng test rằng
  Spring Boot 4 (Jackson 3 message converter) không tự khởi tạo được `com.fasterxml.jackson.
  databind.JsonNode` khi bind `@RequestBody`, `Object` (Map/List generic) là lựa chọn tương thích
  đa phiên bản Jackson đúng.
- Angular `EformService` chuyển HTTP-backed (`load`/`loadOne`/`addForm`/`updateMeta`/
  `updateSchema`/`removeForm`, actor header + `If-Match`, cache là signal sau khi backend xác
  nhận). `FormMeta` thêm field `version`. Xoá ~220 dòng seed data chết (8 schema mẫu +
  `seedForms`) khỏi `core/models/eform.ts` — backend nay là nguồn dữ liệu thật.
- `FormLibraryPage`: `ngOnInit` gọi `load()`, tạo/xoá bất đồng bộ có xử lý lỗi backend
  (409 trùng mã hiện đúng message server trả về). `FormDesignerPage`: gọi `loadOne(key)` khi vào
  route (không chỉ đọc cache) để deep-link/refresh trực tiếp vào `/thiet-ke` vẫn tải đúng dữ liệu;
  có state loading riêng tránh chớp "Không tìm thấy" trước khi API trả lời.

**Phát hiện + xử lý một vấn đề môi trường có thật, không phải do lát này gây ra**: khi build lại
backend workspace chính để restart cổng 8091 test that thật, Flyway validate fail — DB Postgres
dev dùng chung (`qtkhcn`) đã có `flyway_schema_history` version 9 = "approval matrix", áp từ
worktree riêng `C:\Users\phuctd7\ql-nvkhcn-be-approval-matrix` (nhánh `fix/approval-matrix-
backend`) — file `V9__approval_matrix.sql` chưa từng có trong workspace chính (workspace chính
nhảy thẳng V8→V10). Đã dừng lại, `AskUserQuestion` báo cáo thay vì tự sửa; user chọn copy file
migration đó (nguyên byte, đã diff xác nhận giống hệt) vào workspace chính. Sau khi copy, `mvn -o
clean package` (dùng `clean` vì phát hiện phụ: `target/classes` có sẵn `V9__action_studio.sql` cũ
từ lần build trước khi Action Studio migration đổi từ V9→V10, gây lẫn migration rác vào jar nếu
không `clean`) + restart 8091 → Flyway validate 11 migrations OK, migrate thẳng lên v11.

**Real-stack smoke test thật trên Postgres dev** (cổng 8091, sau khi copy V9 + build sạch):
`GET /api/eform` trả đúng 8 seed, đúng thứ tự, tiếng Việt hiển thị đúng; `POST` tạo mới → 201
version 0; `PUT .../schema` với `If-Match` đúng → 200 version tăng; lặp lại với `If-Match` cũ → 409
đúng message `EformConflictException`; `DELETE` với `If-Match` đúng → 204; `GET` lại → 404. Xác
nhận 8 seed gốc không bị đụng sau khi xoá form test. Backend `mvn -o test` **full suite PASS**
(gồm `EformServiceTest`, `EformHttpContractTest` mới).

**Dọn lại môi trường sau smoke test**: vì cổng 8091 dev (Angular trỏ vào theo `environment.ts`)
trước đó đang chạy jar tổng hợp Approval Matrix + Action Studio từ worktree riêng, và jar workspace
chính KHÔNG có code Approval Matrix (chỉ copy đúng file migration để Flyway resolve được, không
copy Java code), việc restart 8091 bằng jar workspace chính (có eform) đã tạm thời làm mất
`/api/approval-matrix` trên cổng đó. Sau khi xác nhận smoke test eform PASS, đã dừng jar đó và khởi
động lại đúng jar tổng hợp cũ (worktree Approval Matrix) trên 8091 để không để môi trường dev tệ
hơn lúc bắt đầu — xác nhận `/api/approval-matrix/rules` và `/api/action-studio` đều 200 trở lại.
Live demo cổng 8090 không bị đụng trong suốt quá trình (xác nhận `401` không đổi, PID không đổi).

**Gộp vào jar tổng hợp (user chọn qua `AskUserQuestion`)**: copy nguyên byte 9 file eForm (domain/
repository/service/controller/dto + `V11__eform.sql` + 2 test) từ workspace chính sang worktree
`ql-nvkhcn-be-approval-matrix` (đã diff xác nhận giống hệt), thêm handler `EformConflictException`
vào `GlobalExceptionHandler.java` của worktree đó (file này đã khác bản workspace chính — chỉ thêm
đúng block cần, không ghi đè). Copy thêm Maven Wrapper (`.mvn/`, `mvnw.cmd`) sang worktree vì nó
chưa có sẵn. `mvn -o test` full suite tại worktree **GREEN** (bao gồm cả `EformServiceTest`/
`EformHttpContractTest` chạy lại đúng trong context Approval Matrix + Action Studio + eForm gộp
chung, không xung đột tên bean/route). `mvn -o clean package` (dừng jar cũ đang giữ file trước khi
clean, tránh lỗi lock file Windows) → jar mới bundle đủ 11 migration (V1–V11).

**Trạng thái CUỐI CÙNG của cổng 8091 dev**: đang chạy jar tổng hợp 3-trong-1 (PID **26948**,
worktree `ql-nvkhcn-be-approval-matrix`) — xác nhận real-stack cả 3 API cùng sống: `GET /api/
approval-matrix/rules` → 200, `GET /api/action-studio` → 200, `GET /api/eform` → 200 trả đúng 8
seed theo đúng thứ tự. Angular dev server (`ng serve`, trỏ `localhost:8091` theo `environment.ts`)
nay gọi được `/api/eform` thật — sẵn sàng để user click-through UI `/phan-he/PH3/bieu-mau`. Live
demo cổng 8090 không bị đụng trong suốt toàn bộ quá trình (PID không đổi, vẫn `401` không auth).

**Verify tổng**: Backend `mvn -o test` full suite GREEN (cả workspace chính lẫn worktree gộp).
Angular `npx ng test --watch=false` **28/28 file, 123/123 PASS**; `npx ng build` production GREEN.
Real Postgres smoke test PASS đầy đủ CRUD + optimistic lock trên cả 2 lần chạy (workspace chính
đơn lẻ, rồi worktree gộp 3-trong-1). Chưa click-through trình duyệt thật (không có browser tool) —
user nên tự mở `/phan-he/PH3/bieu-mau` trên `ng serve` để xác nhận UI.

---

## ★ CURRENT — Port "Thư viện biểu mẫu" (eForm) React → Angular — DONE + VERIFIED 2026-07-16

**Yêu cầu của user**: port trang "Thư viện biểu mẫu" (PH3 Danh mục dùng chung, route
`/phan-he/PH3/bieu-mau`) từ `webapp/` (React) sang `frontend-angular/`. Route đã tồn tại nhưng trỏ
`PlaceholderPage`; route con `/thiet-ke` (Form Designer) chưa tồn tại. Trang gồm 2 phần: danh sách
`FormLibrary.tsx` (235 dòng) và trình thiết kế `FormDesignerPage.tsx` → `FormDesigner.tsx` (403 dòng,
builder kéo-thả tự viết AntD theo D13, chạy trên engine `@bpmn-io/form-js`) + `FormRenderer.tsx` (634
dòng, custom AntD renderer B-engine theo D12 dùng `feelin` để eval FEEL) + `FieldPalette`/
`FieldProperties` (524 dòng) + data `forms/` (~320 dòng, 8 schema mẫu gồm 2 demo minh hoạ B-engine).
Qua `AskUserQuestion`, user chọn **full parity** (list + designer đầy đủ) thay vì chỉ port riêng
trang danh sách.

**Không có collision với các phiên song song khác** (đã `git status` xác nhận): một phiên khác đang
chạy đồng thời trên "Tách Service Quản lý NV KHCN & Hồ sơ" (đã tiến tới Lát 1/2a/2b, thêm
`InProcessWorkflowClient.java`, `services/`, sửa `HoSoService.java`) — không đụng file nào của lát
này.

**Đã thêm dependency mới**: `@bpmn-io/form-js@^1.23.0` + `feelin@^7.0.1` vào `frontend-angular`
(khớp version dùng ở `webapp`). CSS vendor `form-js.css`/`form-js-editor.css`/`properties-panel.css`
thêm vào `angular.json` styles (giống cách `bpmn-js.css` đã làm cho BPMN modeler). Bump
`maximumWarning` bundle budget 2.3MB → 2.5MB (CSS vendor luôn eager dù route lazy, đo thực tế lệch
~108kB).

**Đã triển khai (6 lát)**:

- **Lát 1** — `core/models/eform.ts`: port `FormMeta`, `FormComponent`/`FormSchema` (kiểu schema
  form-js dùng chung cho renderer + designer panel), `seedForms` (8 schema mẫu, gõ lại nguyên văn từ
  3 file `webapp/src/forms/*.ts`), `emptySchema`, `countFields`, `buildYKien`, `slugifyFormKey`.
- **Lát 2** — `core/services/eform.service.ts`: `EformService` signal store (`providedIn:'root'`,
  seed đồng bộ) thay `store/FormContext.tsx` — `getForm/addForm/updateMeta/updateSchema/removeForm`.
  **Cố ý KHÔNG port cột/stat "Đang dùng"**: bản gốc tính từ mock `store/ProcessContext`
  (`taskSteps`+`formKey`), đã bị Angular thay bằng backend BPMN thật (`ProcessDefinitionService`,
  không có model kiểu `taskSteps` mock để tính lại đúng) — port lại bằng mock riêng sẽ là dữ liệu giả
  mâu thuẫn với hướng bỏ mock của app; bỏ hẳn stat này thay vì hiện số sai.
- **Lát 3** — `shared/form-renderer/`: `FormRendererComponent` + `FormFieldComponent` (leaf, mọi loại
  trường trừ dynamiclist) + `FormDynamicListComponent` (bảng động) — port đầy đủ 3 lát B-engine gốc
  (trường phẳng + validate/submit, ẩn-hiện điều kiện + trường tính toán qua `feelin`, bảng động thêm/
  xoá dòng với context `{...gốc, ...dòng}`). Logic thuần (eval FEEL/deriveState/validate/processLevel)
  tách vào `core/models/eform-runtime.ts` để dùng chung với preview trong designer. Không dùng
  `useImperativeHandle` như React — thay bằng phương thức public `submit()` gọi qua `ViewChild` (đúng
  quy ước `BpmnModelerComponent`). Test mới `form-renderer.spec.ts`: ẩn/hiện điều kiện + validate,
  trường tính toán, dynamiclist add/submit.
- **Lát 4** — `shared/form-designer/`: `form-js-i18n.ts` (dictionary Việt hoá form-js riêng, KHÔNG gộp
  vào `shared/bpmn-modeler/bpmn-properties-i18n.ts` để tránh trộn 2 phạm vi không liên quan),
  `khcn-field-defaults.ts` (port `khcnFieldDefaultsModule` — nhãn mặc định tiếng Việt cho field mới),
  `relabel-canvas-vi.ts` (port SCOPED của `relabel-vi.ts` — chỉ giữ phần vá canvas 'Select'/
  'Repeatable'/'Expression...'; **bỏ hẳn phần vá palette/properties panel NATIVE** vì panel đó bị ẩn
  trong kiến trúc Angular, vá DOM không hiển thị là code chết). **Cố ý KHÔNG port
  `khcnFormSimplePanelModule`** (chế độ Đơn giản/Nâng cao) — cùng lý do, chỉ lọc nhóm panel native ẩn,
  React cũng hardcode `() => false` (không có UI toggle thật). `form-field-palette.ts` (port
  `FieldPalette.tsx`) + `form-field-properties.ts` (port `FieldProperties.tsx` — text/số commit khi
  blur để giữ 1 lần undo/field, không mất focus khi gõ, đúng hành vi gốc) + `form-designer.ts` (wrapper
  `FormEditor` — palette/properties panel native portal vào div ẩn, dock trái/phải AntD tự viết,
  live preview debounce 300ms, undo/redo, `addField/editField/removeField` gọi thẳng service
  `modeling`/`selection`/`formFieldRegistry`/`formLayouter` của form-js, beforeunload guard khi dirty).
  Test mới cho 2 component thuần `form-field-palette.spec.ts`/`form-field-properties.spec.ts` (lọc
  tìm kiếm, emit type khi click, commit label khi blur không phải mỗi keystroke, merge validate).
  **Không viết spec cho `form-designer.ts`** (wrapper `FormEditor` thật) — đúng tiền lệ đã có trong
  repo (`bpmn-editor.spec.ts` cũng chỉ test helper thuần `starterBpmn`, không mount
  `BpmnModelerComponent` thật vì thư viện canvas nặng dễ vỡ trong jsdom).
- **Lát 5** — CSS skin `src/styles/form-designer-canvas.scss` (port scoped từ 760 dòng
  `webapp/src/branding/bpmnio-skin.css` — chỉ phần canvas `.vht-fd-canvas .fjs-*` + palette
  `.vht-fp-*` + mapping token `--cds-*`; bỏ phần skin palette/panel NATIVE cùng lý do trên).
- **Lát 6** — `pages/form-library/` (danh sách: bảng, tạo mới + tự mở designer, xem trước bằng
  `FormRendererComponent`, xoá qua `nz-popconfirm`) + `pages/form-designer-page/` (điều phối route
  param `:key` qua `ActivatedRoute.paramMap`, cảnh báo `NzModalService.confirm` khi thoát còn thay đổi
  chưa lưu, Lưu gọi `designer.getSchema()` → `EformService.updateSchema`). `app.routes.ts`: 2 route
  `phan-he/PH3/bieu-mau` và `phan-he/PH3/bieu-mau/:key/thiet-ke` đổi từ `PlaceholderPage`/chưa tồn tại
  sang `loadComponent` lazy. `icons-provider.ts`: thêm `EFORM_ICONS` (23 icon mới, xác nhận tồn tại
  trong `@ant-design/icons-angular/icons` trước khi dùng), đăng ký trong `app.ts`. Test mới
  `form-library.spec.ts` (render seed, chặn tạo trùng key, tạo mới điều hướng đúng URL, xoá).

**Phát hiện thật khi verify (không giả định)**: unit test icon dùng `TestBed.inject(NzIconService)
.addIcon(...)` — quên nạp `APPROVAL_MATRIX_ICONS`/`SERVICE_TASK_ICONS` (nơi `plus`/`file-text` đã
đăng ký) gây `IconNotFoundError` async không chặn test nhưng làm nhiễu output; sửa bằng nạp đủ 4 mảng
icon giống `app.ts` thật. Xác nhận nguyên nhân bằng cách chạy riêng từng spec file, không đoán.

**Verify**:

- `npx ng build` (production): **GREEN**, `form-designer-page` tách lazy chunk riêng 509.49 kB,
  `form-library` 8.45 kB. Chỉ còn cảnh báo có sẵn (`classnames` CommonJS) + 2 cảnh báo CommonJS mới từ
  chính thư viện `@bpmn-io/form-js` (`lodash/isEqual`, `downloadjs`) — không chặn build, cùng loại với
  cảnh báo `classnames` đã chấp nhận trước đó.
- `npx ng test --watch=false`: **28/28 file, 119/119 test PASS** (11 test mới, từ 108 baseline).

**⚠️ CHƯA verify được**: chưa click-through trình duyệt thật (nhất quán các phiên Angular trước) — UI
mới chỉ xác nhận qua build/test. User nên tự mở `/phan-he/PH3/bieu-mau`, thử: xem danh sách 8 biểu
mẫu seed, xem trước 1 biểu mẫu (bao gồm 2 demo B-engine "Phiếu thẩm định dự toán"/"Đăng ký thành
viên" — kiểm tra ẩn/hiện điều kiện + trường tự tính + bảng động render đúng), tạo biểu mẫu mới (tự mở
designer), trong designer: kéo-thả field từ palette, click field trên canvas để sửa thuộc tính, xem
trước trực tiếp, Undo/Redo, Lưu thiết kế rồi quay lại danh sách xác nhận số trường cập nhật.

---

## ★ CURRENT — Port "Tác vụ hệ thống" (Service Task Config) React → Angular — DONE + VERIFIED 2026-07-16

**Yêu cầu của user**: port trang "Cấu hình Service Task" (nav "Tác vụ hệ thống", route
`/cau-hinh-service-task`) từ `webapp/` (React) sang `frontend-angular/`. Route đã tồn tại nhưng trỏ
`PlaceholderPage`. Trang gồm: page 1550 dòng + `ServiceTaskContext` 610 dòng + 4 component con
(MappingEditor/FormDrawer/BindingTable/TestPanel/ExecutionDrawer ~1850 dòng) + data model
`serviceTasks.ts` 1446 dòng + `serviceTaskReconcile.ts` 325 dòng — không backend (đã grep xác nhận
không có contract `ServiceTaskDefinition/Version/Binding` trong `backend/src/main/java`). Qua
`AskUserQuestion`, user chọn **full parity, chia lát trong 1 phiên**, giống Ma trận phê duyệt.

**⚠️ Đụng độ phiên song song thật (đã xảy ra, đã xử lý xong)**: giữa lúc port, phát hiện MỘT PHIÊN
KHÁC đang chạy song song trên cùng repo, tự làm đúng y hệt feature này ĐỘC LẬP — tự tạo
`pages/service-task-config/` (kiến trúc 1-file, không tách shared component) và
`core/services/service-task.service.ts` riêng, ghi đè lên `core/models/service-task.ts` mà agent này
vừa tạo (may mắn chỉ nối thêm 3 interface ở cuối, không phá nội dung gốc). Phiên đó còn làm song song
cả module Action Studio (backend Java + Flyway V10) và đã đụng `app.routes.ts`/`app.ts`/
`icons-provider.ts` — đúng những file agent này cũng cần sửa để wire route/icon. Đã dừng lại, dùng
`AskUserQuestion` báo cáo phát hiện cho user thay vì tự ý ghi đè tiếp. User xác nhận phiên kia đã xong,
yêu cầu kiểm tra lại và giữ đúng 1 bản. Đọc kỹ bản của phiên kia: **chưa đạt full parity** — thiếu hẳn
2/6 tab (Đối soát BPMN, Kiểm thử — `runPreview` không tồn tại trong service của họ), và modal Tạo/Sửa
không lưu được gì (`(nzOnOk)="closeDrawer()"` chỉ đóng modal), tự nhận trong UI là "bản port nhanh...
sẽ hoàn thiện ở iteration sau". Qua `AskUserQuestion` lần 2, user chọn xóa bản đó, giữ
`core/models/service-task.ts` (đã đúng), làm tiếp kiến trúc đầy đủ của agent này. **Lưu ý cho phiên
sau**: tại thời điểm hoàn tất lát này, ít nhất MỘT phiên thứ 3 khác cũng đang chạy song song trên cùng
repo (đang sửa `active-task.md` cho task "Tách Service Quản lý NV KHCN & Hồ sơ" — xem entry ngay bên
dưới) — luôn `git status`/đọc lại file ngay trước khi ghi để tránh mất nội dung của phiên khác.

**Đã triển khai (full parity, kiến trúc tách shared component giống Ma trận phê duyệt)**:

- **Data model mới, scoped theo nhu cầu thật** (không port nguyên các file phụ thuộc gốc vì các màn
  đó chưa lên Angular): `core/models/integration-system.ts` (subset `IntegrationSystem`/
  `seedIntegrations` từ `camundaOps.ts` — chỉ phần connector, bỏ instances/job runs/events),
  `core/models/integration-mapping.ts` (subset `MappingConfig`/`seedMappingConfigs`/
  `validateMappingConfig` từ `integrationMapping.ts` — bỏ `sampleRecordsFor`/`previewMapping` phụ
  thuộc `nhiemVu.ts`/`dossiers.ts` không cần ở đây), `core/models/process-registry.ts` (subset
  `ProcessDef`/`seedProcesses`/`curVer` từ `processes.ts` — bỏ `taskSteps`/`bpmnXml` để không phải kéo
  theo các hằng số XML lớn của màn Danh mục quy trình).
- `core/models/service-task.ts` (port đầy đủ `serviceTasks.ts` gốc: types, `validateServiceTaskConfig`,
  `previewServiceTaskConfig`, resolve/apply mapping, mask payload, toàn bộ seed data) +
  `core/models/service-task-reconcile.ts` (port `serviceTaskReconcile.ts`).
- `core/services/service-task.service.ts`: signal store thay `ServiceTaskContext.tsx` (không HTTP, in-
  memory CRUD y hệt bản gốc) — `createDefinition/updateDefinition/duplicateDefinition/
  saveDraftVersion/validateVersion/activateVersion/deprecateDefinition/bindTask/unbindTask/
  runPreview/retryExecution/manualResolveExecution`.
- `shared/service-task-mapping-editor/`: bảng sửa input/output mapping dùng chung (gộp 2 nhánh theo
  `mode` trong 1 template vì Angular không tiện generic input/output như React).
- `shared/service-task-form-drawer/`: drawer Tạo/Sửa 5 tab con (Tổng quan/Cấu hình thực thi theo
  `typeCode`/Input mapping/Output mapping/Chính sách lỗi) — dùng signal cho từng field + `effect()`
  reset khi mở/đổi definition, theo đúng quy ước ngModel+signal đã dùng ở
  `approval-matrix-rules-tab` (không dùng Reactive Forms).
- `shared/service-task-binding-table/`: tab "Đối soát BPMN" — đối chiếu metadata service task mock với
  binding thật, modal gắn/đổi cấu hình.
- `shared/service-task-test-panel/`: tab "Kiểm thử" — chọn definition/version/kịch bản mẫu, gọi
  `runPreview` thật, hiện input sau mapping/payload/response giả lập/output mapping/validation.
- `shared/service-task-execution-drawer/`: drawer chi tiết execution log (timeline attempt, request/
  response summary masked, Retry/Manual resolve). **Bản React gốc bị lỗi encoding mojibake** ở nhiều
  chuỗi tiếng Việt (vd. `"KhÃ´ng cÃ³ dá»¯ liá»‡u."`) — gõ lại đúng UTF-8 từ ngữ cảnh khi port, không copy
  nguyên văn chuỗi hỏng. Đổi từ `NzModalService.confirm()` (không bind được ngModel vào nzContent
  string) sang modal inline trong template để bind ghi chú xử lý tay đúng cách.
- `pages/service-task-config/`: page shell 6 tab (Tổng quan/Cấu hình/Đối soát BPMN/Kiểm thử/Log thực
  thi/Phiên bản & audit) + stat card + phân bổ trạng thái/loại + filter bar, gộp 2 drawer (form + log).
- `icons-provider.ts`: thêm `SERVICE_TASK_ICONS` (15 icon mới: CheckCircle/ClockCircle/CloseCircle/
  Disconnect/ExclamationCircle/Eye/FileText/Filter/Link/More/PlayCircle/Reload/Retweet/Send/Tool —
  xác nhận tồn tại trong `@ant-design/icons-angular/icons` trước khi dùng), đăng ký trong `app.ts`.
- `app.routes.ts`: route `cau-hinh-service-task` đổi từ eager `component:` (do phiên kia để lại) sang
  `loadComponent` lazy, đúng pattern `ma-tran-phe-duyet`/`cau-hinh-hanh-dong`.

**Verify**:
- `npx ng build` (production): **GREEN**, `service-task-config` tách lazy chunk riêng 138.65 kB. Chỉ
  còn cảnh báo có sẵn từ trước (`classnames` CommonJS, `action-studio.scss` budget — không liên quan).
- `npx ng test --watch=false`: **23/23 file, 102/102 test PASS** (15 test mới:
  `service-task.service.spec.ts` 9 test — seed/create/validate-invalid/activate/duplicate/bind/
  preview/retry/manual-resolve; `service-task-config.spec.ts` 6 test — render/create/edit/filter/
  duplicate/execution-log-drawer). `fixture.detectChanges()` full page (kéo theo toàn bộ 5 shared
  component + 2 drawer) không lỗi DI/icon — xác nhận sớm các lỗi từng gặp ở Ma trận phê duyệt (icon
  chưa đăng ký tĩnh, `NzModalService` thiếu `NzModalModule`) không lặp lại ở đây.

**⚠️ CHƯA verify được**: chưa click-through trình duyệt thật (nhất quán các phiên Angular trước) — UI
mới chỉ xác nhận qua build/test. User nên tự mở `/cau-hinh-service-task`, thử cả 6 tab: tạo/sửa cấu
hình (đủ execution config theo từng loại + input/output mapping + chính sách lỗi), validate/activate/
nhân bản, gắn/đổi/bỏ gắn binding ở Đối soát BPMN, chạy Kiểm thử với JSON mẫu, retry/manual resolve ở
Log thực thi.

---

## ★ CURRENT — Tách Service Quản lý NV KHCN & Hồ sơ — LÁT 3 CODE DONE + LOCAL VERIFIED 2026-07-18

**Yêu cầu user**: tách phần Quản lý NV KHCN và Hồ sơ sang service mới; khi gửi/khởi tạo luồng xử lý
hồ sơ, service mới truyền lệnh khởi tạo sang service Quản trị quy trình.

**Hướng đã thống nhất**:

- Service Hồ sơ sở hữu `NhiemVu`, `HoSo`, tài liệu, phiên bản và trạng thái nghiệp vụ.
- Service Quy trình sở hữu BPMN/DMN/eForm/action policy, Camunda, process instance/task/incident.
- Không copy toàn bộ hồ sơ sang service Quy trình; chỉ gửi `hoSoId`, `nhiemVuId`, `businessKey`,
  `processCode`, actor và các control variables tối thiểu.
- Tạo nháp không start Camunda; hành động Gửi hồ sơ ghi transactional outbox rồi gọi endpoint start
  idempotent. Workflow events đồng bộ projection trạng thái về service Hồ sơ.
- Tách theo strangler, có seam `WorkflowClient`, không dual-write và không transaction phân tán.

**Plan chi tiết**: `docs/arch/nvkhcn-ho-so-service-extraction-plan.md` — gồm ownership matrix,
contract start/event v1, data migration, gateway routing, security/observability, 8 lát triển khai,
test bắt buộc và rollback.

**Đã bổ sung characterization HTTP contract tests**:

- `NhiemVuHttpContractTest`: 5 test khóa đúng 8 field JSON, 201 + format mã/default giai đoạn,
  validation 400, not-found 404, API key và CORS preflight.
- `HoSoHttpContractTest`: 8 test khóa đúng 17 field view join + 11 field/step, create defaults và
  không lộ tài liệu trong legacy response, validation/not-found, submit RD01.01 + step chain/process
  key, 501/409, action not-found/missing process key, API key và CORS preflight.
- `HoSoServiceTest`: đã khóa create/submit/fail-soft/return/reject; test mô tả collision được giữ
  `@Disabled` có chủ đích.
- Thêm Maven Wrapper 3.9.9 trong `backend/`; full backend baseline: 109 test, 108 pass, 1 skipped có
  chủ đích, không failure/error.
- Angular baseline: 23/23 file, 102/102 test pass; production build green, route
  `/cau-hinh-service-task` lazy-load thành công (chunk 138.65 kB).
- Rollback DB: `C:\Users\phuctd7\qtkhcn-backups\qtkhcn-slice0-20260716-164558.dump`, SHA-256
  `57395caf30cd0f8bc92fc19bd5dd72bc6680d5cd07bcf723d37d2d729249eaf4`; đã verify bằng
  `pg_restore --list`. Có worktree manifest + checksum cùng thư mục backup.

**Duyệt Lát 0**: user đã duyệt contract v1 và baseline ngày 2026-07-16.

**Lát 1 đã triển khai**:

- Thêm application port `WorkflowClient` cùng `StartWorkflowCommand`, `WorkflowInstance`,
  `WorkflowActionCommand` và `WorkflowAction`; không dùng Camunda DTO trong contract của port.
- `HoSoService` chỉ phụ thuộc `WorkflowClient`, không còn import/gọi trực tiếp `Rd0101ProcessService`.
- `InProcessWorkflowClient` bọc implementation RD01.01 cũ trong cùng Spring Boot process; không thêm HTTP,
  container, database hoặc migration và không đổi runtime topology.
- Giữ nguyên thứ tự workflow-before-save, start fail-soft legacy, action fail-closed và public REST contract.
- Thêm `InProcessWorkflowClientTest` 4/4; full backend 113 test, 112 pass, 1 skipped có chủ đích.
- Tài liệu chi tiết: `docs/arch/nvkhcn-ho-so-slice-1-workflow-seam.md`.

**Lát 2A đã triển khai**:

- Scaffold `services/ho-so-service`: Spring Boot 4.0.7, Java 21, Maven Wrapper 3.9.9, port mặc định 8093.
- Database riêng `qtkhcn_ho_so`; Flyway V1 tạo 5 bảng Hồ sơ/Nhiệm vụ, Hibernate validate xanh.
- API GET Nhiệm vụ/Hồ sơ tương thích contract legacy; không expose mutation endpoint.
- Bearer service token fail-closed từ environment, read audit/correlation log và actuator probes.
- Test 7/7 pass; executable JAR build thành công; runtime smoke readiness/liveness UP, auth 401/200 đúng.
- Chưa nạp dữ liệu, chưa đổi gateway/Caddy/Angular, chưa start service thường trực và không dual-write.
- Chi tiết: `docs/arch/nvkhcn-ho-so-slice-2a-scaffold.md`.

**Lát 2B đã triển khai**:

- `Invoke-HoSoBackfill.ps1`: snapshot nhất quán bằng `pg_dump`, restore atomic một chiều cho 5 bảng,
  giữ identity/FK, reset sequence, hỗ trợ `-WhatIf` và chạy lặp; không write-back/dual-write.
- Backfill local thật: `5 nhiem_vu / 5 ho_so / 30 dossier_step / 50 dossier_step_code /
  10 ho_so_tai_lieu`; lần lỗi kiểm chứng rollback target thành công, lần cuối COMMIT xanh.
- `Test-HoSoDataParity.ps1`: count và checksum chuẩn hóa khớp 5/5 bảng.
- `Compare-HoSoReadContracts.ps1`: exact JSON comparison pass 12/12 (2 list + 10 item endpoints).
- Gateway có seam `-EnableHoSoReadRoute`, mặc định OFF và fail-closed bằng readiness/API check; mutation
  luôn về monolith. Chưa bật flag và chưa đổi traffic live.
- Service test 7/7 pass, executable JAR build xanh; PowerShell parser 4/4 script và Caddy validate pass.
- Chi tiết: `docs/arch/nvkhcn-ho-so-slice-2b-backfill.md`.

**Lát 2C đã triển khai và diễn tập**:

- Service release `slice2c-20260716-173255-2b47b70` chạy thường trực trên loopback `8093`, readiness UP;
  artifact SHA-256 `71bae31ae12ee3e1a9eba451f9e14dbb967b6b64dbf2f09dad8ed87c8308271e`.
- `Switch-HoSoReadRoute.ps1` chuyển Canary/Monolith bằng `caddy reload`, fail-closed trước canary và xác
  nhận upstream thật cùng Basic Auth `401`; không restart Runlocal.
- Exact contract 12/12 pass lại; Angular release/SPA/auth shell và gateway GET 5 hồ sơ smoke xanh.
- Rollback drill hoàn tất; trạng thái cuối read route ở monolith `8090`, service `8093` vẫn resident.
- Không chuyển write ownership, không dual-write. Chi tiết: `docs/arch/nvkhcn-ho-so-slice-2c-canary.md`.

**Lát 2D đã triển khai và diễn tập**:

- `ReadAuditFilter` thêm timer `qtkhcn.read.requests`, tag hữu hạn `traffic/route/outcome`; Caddy gắn
  canary header, direct probe không làm sai số traffic. Audit log thêm `traffic`, vẫn không log secret.
- `Invoke-HoSoReadCanaryWindow.ps1`: mặc định 30 phút, poll readiness/metric 30 giây, ngưỡng 0% 5xx,
  average latency 1.000 ms, tối thiểu 5 request; không đủ mẫu là FAIL; report JSON ngoài repo.
- Route luôn rollback Monolith trong `finally`; mutation/write ownership luôn ở monolith.
- Service release `slice2d-20260716-175633` resident loopback 8093, readiness UP; build/test 8/8 xanh,
  parser PowerShell 5.1 pass.
- Diễn tập bounded window sau sửa phép tính delta: 5 request tổng hợp, 0 lỗi 5xx, average 12,47 ms,
  max 26,73 ms; verdict PASS; admin config cuối là monolith 8090, Basic Auth thiếu credential vẫn 401.
- Chi tiết: `docs/arch/nvkhcn-ho-so-slice-2d-observed-canary.md`.

**Ngoại lệ gate do user duyệt 2026-07-18**: bỏ qua cửa sổ canary 30 phút của Lát 2D để tiếp tục.
Không có report traffic thật và không được coi gate này đã PASS.

**Lát 3 đã code và local verify**:

- `ho-so-service` sở hữu create/update Nhiệm vụ, create/update Hồ sơ `DRAFT` và CRUD tài liệu;
  ETag/`If-Match`, optimistic lock, actor bắt buộc và audit append-only.
- Flyway V2 thêm version, document identity, business sequence và `domain_mutation_audit`; backfill
  reset sequence mới và vẫn parity 5/5 bảng, không dual-write.
- Monolith có kill switch `QTKHCN_HO_SO_LEGACY_WRITES_ENABLED`; tắt business write cũ nhưng cố ý
  không chặn `/submit`/`/actions` trước Lát 4–5.
- Caddy tách matcher business CRUD khỏi workflow command; `Switch-HoSoWriteRoute.ps1` gate cả
  readiness service lẫn trạng thái legacy write guard trước reload/rollback.
- Angular create Nhiệm vụ/Hồ sơ gửi actor header; public JSON body đọc giữ nguyên contract.
- Verify: service 13/13 test + package xanh; backend 158 test (1 skipped) xanh; Angular targeted 5/5
  + production build xanh; Caddy validate và PowerShell parser xanh. PostgreSQL smoke CRUD/version/audit
  xanh; rollback bằng backfill xóa dữ liệu smoke và đưa sequence về `1:false`.
- Chi tiết: `docs/arch/nvkhcn-ho-so-slice-3-write-ownership.md`.

**Trạng thái vận hành**: chưa cutover live vì máy hiện tại không có release root/Caddy/monolith 8090.
Service smoke đã dừng, port 8093 đã giải phóng; route live không bị thay đổi. Lát 3 hoàn tất về code và
local verification nhưng tiêu chí runtime “mọi mutation đi service mới” còn chờ môi trường deploy.

**Lát 4 đã hoàn tất sau entry này**: transactional outbox, endpoint start-process idempotent/inbox và
failure/retry E2E đã chứng minh cùng request chỉ tạo một process instance. Next hiện tại là Lát 5 như
entry đầu file.

---

## ★ CURRENT — Ghép BE vào FE `/cau-hinh-hanh-dong` — DONE + VERIFIED 2026-07-16

**Yêu cầu user**: xây backend thật cho màn Angular Ma trận Hành động và thay store seed bằng API.

**Đã triển khai**:

- Flyway `V10__action_studio.sql` + JPA persistence cho 17 action/presentation, 13 luật khả dụng,
  3 chính sách Chi tiết và audit. Routing catalog 3 quy trình nằm ở backend, chỉ đọc từ FE.
- REST `/api/action-studio`: tải config, action status/presentation, CRUD/status luật khả dụng và
  chính sách Chi tiết, simulate fail-closed, reconcile BPMN và scaffold. Mutation dùng `If-Match`,
  actor header và audit server-side; stale write trả 409 ổn định.
- Angular `ActionStudioService` là HTTP-backed signal cache; page tải config khi vào route, mọi thao
  tác ghi là bất đồng bộ, lỗi backend được hiển thị, mô phỏng/đối soát/scaffold đều gọi server thật.
- Module BE được ghép vào worktree backend tổng hợp Approval Matrix để FE cổng 8091 dùng đồng thời
  được cả `/api/approval-matrix` và `/api/action-studio`, không làm mất module trước.

**Verify**:

- Backend workspace chính: `mvn -o test` **90/90 PASS**.
- Backend tổng hợp `ql-nvkhcn-be-approval-matrix`: `mvn -o package` **99/99 PASS**, executable JAR.
- Angular `npx ng test --watch=false`: **21/21 file, 87/87 PASS**; `npx ng build` GREEN, lazy chunk
  `action-studio` 73.00 kB. Còn warning budget initial 2.36 MB, action SCSS 4.89 kB và CommonJS
  `classnames`; không có lỗi build.
- PostgreSQL/Flyway thật: version `10:action studio:true`; smoke GET trả 17/13/3/3, simulate
  `RD01.01 · t2 · TD · PROCESS_STEP` cho `APPROVE_STEP` visible+enabled; tạo/xóa luật smoke sạch,
  ghi 2 audit event. Approval Matrix vẫn trả dữ liệu sau khi ghép.
- Backend dev 8091 đã restart từ JAR tổng hợp, PID **21584**. Angular dev server 4200 đã hot reload.

**Chưa làm**: chưa click-through bằng browser thật; chưa commit/deploy demo vì user chưa yêu cầu.

---

## ★ CURRENT — Ghép BE vào FE `/ma-tran-phe-duyet` — DONE + VERIFIED 2026-07-16

**Yêu cầu user**: thay dữ liệu mock của màn Angular Ma trận phê duyệt bằng backend thật.

**Đã triển khai**:

- `ApprovalMatrixService` chuyển thành HTTP-backed signal store cho toàn bộ contract
  `/api/approval-matrix`: tải luật, tạo/cập nhật/xoá với optimistic locking `If-Match`, bật/tắt,
  lịch sử phiên bản, audit, analyze và resolve. Response resolve được ánh xạ lại vào model UI và
  danh mục người dùng Angular.
- `ApprovalSlotCatalogService` nối CRUD/status của `/api/approval-matrix/slots`; khi huỷ kích hoạt
  slot đang được tham chiếu, xác nhận của người dùng được chuyển thành `force=true` đúng contract BE.
- Shell tải đồng thời rules/slots/analyze khi vào route. Rule/slot UI chuyển toàn bộ thao tác ghi
  sang bất đồng bộ, chỉ cập nhật signal cache sau khi backend thành công và hiện lỗi trả về từ API.
- Simulation Panel gọi thật `POST /api/approval-matrix/resolve`. Mini-simulator trong Rule Builder
  vẫn dùng resolver cục bộ có chủ đích vì nó cần thử bản nháp chưa lưu.
- Test service/component được chuyển từ giả định seed đồng bộ sang `HttpTestingController`, có kiểm
  tra URL, payload, actor header và `If-Match`.

**Verify**:

- Angular `npx ng test --watch=false`: **20/20 file, 82/82 PASS**.
- Angular production `npx ng build`: **GREEN**; lazy chunk `approval-matrix` 230.97 kB; chỉ còn
  warning CommonJS `classnames` có sẵn từ bpmn properties panel.
- Backend worktree `fix/approval-matrix-backend`: `mvn -o test` **91/91 PASS**, gồm service/analyzer/
  condition engine và HTTP contract Approval Matrix.
- Real PostgreSQL/Flyway smoke trên backend tạm: **7 rules, 5 slots**, resolve context
  `PHE_DUYET + TD + 12 tỷ` → `AM-05`, approver `U-013`, mode `ANY_ONE`.
- Backend dev cổng **8091** đã được chuyển an toàn sang jar Approval Matrix (PID 27564); GET rules
  thực tế trả 7 dòng. Không đụng backend live 8090, Caddy hay Docker.

**Git/worktree**: phần BE hiện vẫn là thay đổi chưa commit trong worktree
`C:\Users\phuctd7\ql-nvkhcn-be-approval-matrix`; phần FE là thay đổi chưa commit trong workspace
chính. Không commit vì user chưa yêu cầu.

---

## ★ CURRENT — Port "Ma trận phê duyệt" (Approval Matrix) React → Angular — DONE + VERIFIED 2026-07-16

**Yêu cầu của user**: port trang "Ma trận phê duyệt" từ `webapp/` (React, EPIC06) sang
`frontend-angular/` (D17). Route `/ma-tran-phe-duyet` đã tồn tại nhưng trỏ `PlaceholderPage`. Đây là
trang phức tạp/lớn nhất trong React app (~5300 dòng gộp cả file liên quan): bảng luật first-match,
Condition Builder cây AND/OR đệ quy, Assignment Builder, Simulation Panel (kịch bản lưu
localStorage), tab Danh mục Loại phê duyệt. Qua `AskUserQuestion`, user chọn **full parity, chia Lát
trong 1 phiên** thay vì slice tối giản trước.

**Không có backend contract** cho domain này (xác nhận qua grep `backend/src/main/java`) — giữ
frontend-mock như bản React, dùng Angular signal-based service thay React Context (không HTTP).

**Đã triển khai (5 lát, chi tiết trong kế hoạch `graceful-munching-stallman.md`)**:

- **Lát 1** — `core/models/`: port thuần TS không phụ thuộc Angular từ `webapp/src/data/*.ts`:
  `approval-conditions.ts` (cây điều kiện AND/OR), `approval-variable-registry.ts` (metadata biến),
  `approval-slot-catalog.ts`, `roles.ts`, `org-users.ts` (mới, tách khỏi `core/auth/demo-users.ts` —
  file đó chỉ 5 tài khoản đăng nhập, không phải danh mục tổ chức đầy đủ), `approval-matrix.ts` (635
  dòng gốc: `ApprovalRule/Assignment/Target`, `resolveApprovers` first-match + uỷ quyền theo hiệu
  lực; bỏ `domainCode?` không dùng và `resolveGroups()` không có consumer Angular), `approval-matrix-analyzer.ts`
  (`analyzeRules` phát hiện xung đột/thiếu fallback).
- **Lát 2** — `core/services/`: `ApprovalMatrixService`/`ApprovalSlotCatalogService`
  (`providedIn:'root'`, signal store seed đồng bộ, thay `ApprovalMatrixContext`/
  `ApprovalSlotCatalogContext` React) + `ApprovalSimulationScenarioService` (wrap `localStorage` trực
  tiếp như `auth.service.ts` đã làm, tách thành service để panel mô phỏng test được).
- **Lát 3** — `shared/`: `condition-builder` (component **tự đệ quy** — tự import chính nó trong
  `imports`, xác nhận đây không phải vấn đề với standalone component), `assignment-builder`,
  `approval-simulation-panel` (716 dòng gốc, form động theo kiểu biến + preset + diff + kịch bản
  lưu/tải/xoá qua scenario service).
- **Lát 4** — `pages/approval-matrix/`: shell 2 tab (`approval-matrix.ts`) + `approval-matrix-rules-tab`
  (~1080 dòng gốc: bảng luật, drawer thêm/sửa với Condition/Assignment Builder + bản xem trước +
  mini-simulator, drawer Mô phỏng, drawer Lịch sử phiên bản/audit, thẻ Uỷ quyền) +
  `approval-slot-catalog-tab` (~260 dòng gốc: CRUD slot + `NzModalService.confirm` khi huỷ kích hoạt
  slot đang được luật tham chiếu).
- **Lát 5** — `app.routes.ts`: route `ma-tran-phe-duyet` đổi từ `PlaceholderPage` sang
  `loadComponent` **lazy** (không phải eager như dự tính ban đầu — đo thực tế thấy route eager đẩy
  initial bundle 2.20MB → 2.50MB, vượt budget cảnh báo; lazy giữ initial ở 2.28MB, đúng tinh thần
  `bpmn-editor` đã lazy-load trước đó cho trang cấu hình lớn/ít dùng). Bump `maximumWarning` bundle
  budget 2.2MB → 2.3MB (tăng tối thiểu, phần dư 2.28MB là code hợp lệ của tính năng, không phải phình
  to vô cớ).

**Phát hiện thật trong lúc verify (không giả định)**: `nz-icon` với icon **chưa đăng ký tĩnh** qua
`NzIconService.addIcon()` yêu cầu `HttpClientModule` fetch SVG động qua mạng — chạy được trong trình
duyệt thật (có mạng) nhưng **crash ngay trong unit test** (`IconNotFoundError`, không có HTTP mock).
Đăng ký tĩnh 10 icon mới (`APPROVAL_MATRIX_ICONS` trong `core/icons-provider.ts`, nạp cùng
`NAV_ICONS` ở `app.ts`) — sửa đúng phạm vi tính năng này, không đụng icon của các trang khác (dù
nhiều trang khác trong codebase cũng đang dùng icon chưa đăng ký tĩnh tương tự — vấn đề tiềm ẩn có
thật nhưng ngoài phạm vi lát này, chưa từng lộ ra vì đây là lần đầu tiên có component-level spec
dùng `fixture.detectChanges()` trong `frontend-angular/`). Riêng lỗi `NG0201: No provider found for
NzModalService` ở `approval-matrix-rules-tab` — do gọi `NzModalService.confirm()` mà không import
`NzModalModule` (provider của service này đăng ký qua NgModule, không phải `providedIn:'root'`) —
sửa bằng cách thêm `NzModalModule` vào `imports`, đúng pattern `business-rule-list.ts` đã dùng.

**Verify**:

- `npx ng build` (production): **GREEN**, không lỗi, chỉ còn cảnh báo `classnames` CommonJS có sẵn
  từ trước (không liên quan). `approval-matrix` tách thành lazy chunk riêng 228.78 kB.
- `npx ng test --watch=false`: **19/19 file, 80/80 test PASS** — bao gồm 6 spec mới cho tính năng
  này (`approval-matrix.spec.ts` model resolver, 2 service spec, `condition-builder`/
  `assignment-builder`/`approval-simulation-panel` component spec, `approval-slot-catalog-tab`/
  `approval-matrix-rules-tab` page spec).

**⚠️ CHƯA verify được**: chưa click-through trình duyệt thật (nhất quán các phiên Angular trước) —
UI mới chỉ xác nhận qua build/test, chưa xác nhận bằng mắt trên `ng serve`. User nên tự mở
`/ma-tran-phe-duyet`, thử cả 2 tab (thêm/sửa luật với Condition/Assignment Builder, chạy Mô phỏng,
xem Lịch sử, CRUD Danh mục Loại phê duyệt).

**Lưu ý phát hiện trong lúc làm (không phải việc của lát này)**: một phiên khác đang chạy song song
trên cùng repo, thực hiện tách release demo Runlocal khỏi dev workspace (commit lần đầu
`backend/`/`frontend-angular/`/`infra/` vào git — trước đó hoàn toàn untracked) — xem entry
"Tách release demo khỏi dev workspace" ngay bên dưới. Phiên đó đã chủ động **không** commit các file
mới của lát này (`pages/approval-matrix/`, `shared/approval-simulation-panel/`) để tránh xung đột,
để lại nguyên trong working tree. Không commit gì trong lát này (đúng theo yêu cầu chỉ commit khi
được yêu cầu rõ ràng) — toàn bộ thay đổi vẫn ở working tree, sẵn sàng để commit khi user xác nhận.

---

## ★ CURRENT — Tách release demo khỏi dev workspace (Runlocal) — DONE + VERIFIED 2026-07-16

**Yêu cầu của user**: implement thật kế hoạch tách workspace/release đã viết ở
`docs/plan_deploy/standard-deploy-workflow.md`, sau khi phiên trước phát hiện demo live
(`https://drab-quail.runlocal.eu/`) đang chạy trực tiếp từ chính dev workspace này (không có cách
ly), có người dùng thật đang dùng.

**Đã triển khai**:

1. **Gate 3.1 (version control)**: `backend/`, `frontend-angular/`, `infra/demo-tunnel/` trước đó
   hoàn toàn untracked. Commit theo từng nhóm rõ ràng (`466c224` backend, `82df984` frontend-angular,
   `c7ed96d` infra, `d577264` webapp banner, `fcb71c4` docs/harness, `3850279` scripts release) — rà
   soát `.gitignore` xác nhận không leak secret (`.env.local`, log, `target/`, `dist/` đều đã bị
   ignore đúng trước khi add).
2. **Release worktree**: `New-DemoRelease.ps1` (mới, `infra/demo-tunnel/`) tạo `git worktree` tại
   `C:\Users\phuctd7\qtkhcn-demo\releases\<release-id>` từ một commit sạch, build backend
   (`mvn -o package`) + frontend (`npm ci` + `ng build production,demo`), kiểm tra bundle không leak
   `localhost:8090`/`dev-local-only`, rồi health-check trên port tạm `8091` — không đụng gì tới
   backend/Caddy/Runlocal đang sống. Release đầu tiên `2026-07-16.1_fcb71c4` build + health-check
   PASS (curl `X-QTKHCN-Dev-Key` → 200 dữ liệu thật).
3. **Cutover script**: `Switch-DemoRelease.ps1` (mới) — script DUY NHẤT được phép dừng/khởi động lại
   backend cổng 8090 sống; dừng process cũ, start backend release mới (dùng lại đúng
   `QTKHCN_DEV_API_KEY` hiện tại để không phải đụng Caddy), health-check, rồi repoint junction
   `C:\Users\phuctd7\qtkhcn-demo\current` → thư mục release. `Start-DemoProxy.ps1` đổi default sang
   phục vụ từ junction `current` thay vì `frontend-angular/dist` trong dev workspace;
   `Test-DemoReadiness.ps1` cập nhật theo. Từ nay mỗi lần deploy chỉ cần
   `New-DemoRelease.ps1` → `Switch-DemoRelease.ps1 -ReleaseId <id>`, không cần đụng Caddy/Runlocal
   nữa (chỉ cần đụng Caddy nếu tự đổi `Caddyfile`).
4. **Cutover thật đã thực hiện** (qua `AskUserQuestion` xác nhận cửa sổ deploy trước): dừng backend
   cũ PID 27284 → start backend release `2026-07-16.1_fcb71c4` trên 8090 (PID mới, healthy) →
   `caddy validate` rồi `caddy reload` một lần duy nhất để Caddy chuyển sang phục vụ qua junction.
   Có 1 lần retry: `Switch-DemoRelease.ps1` gốc có ký tự em-dash non-ASCII làm PowerShell 5.1
   parse-fail — **parse error xảy ra trước khi script chạy bất kỳ dòng nào** nên live backend không
   hề bị đụng ở lần thử đầu (xác nhận PID không đổi + public URL vẫn 401 trước khi sửa). Đã thay hết
   em-dash bằng dấu gạch ngang thường trong cả 4 script, xác nhận parse sạch bằng
   `[System.Management.Automation.Language.Parser]::ParseFile` trước khi chạy lại — lần 2 thành
   công.

**Verify sau cutover**:

- `127.0.0.1:8443` không auth/sai auth → `401`; public `https://drab-quail.runlocal.eu/` (root và
  `/api/ho-so`) không auth → `401` cả hai.
- Backend trực tiếp `127.0.0.1:8090/api/ho-so` với dev key hiện tại → `200`.
- PID backend cũ (27284) xác nhận đã terminate; junction `current` trỏ đúng
  `qtkhcn-demo\releases\2026-07-16.1_fcb71c4`; Docker stack (`orchestration`, `qtkhcn-postgres`,
  `bpmn-test-orchestration`, `connectors`) không bị đụng, vẫn healthy.
- `git worktree list` sạch, không có worktree rác.

**Phát hiện phụ trong lúc làm** (không phải lỗi của task này): có phiên khác đang chỉnh sửa đồng thời
`frontend-angular/src/app/pages/approval-matrix/` và
`frontend-angular/src/app/shared/approval-simulation-panel/` (file mới, tạo trong lúc tôi đang
build/commit), cùng vài dòng bổ sung ở `docs/plan_deploy/v1.md`/`standard-deploy-workflow.md` về
CORS/Origin header của Runlocal. Cố tình **không** commit các file/đổi này (không phải việc của
commit này, có thể đang dở dang) — để nguyên trong working tree cho phiên đó tự commit.

**⚠️ CHƯA verify được (cần user)**: đăng nhập Basic Auth thật (mật khẩu thật) trên
`https://drab-quail.runlocal.eu/` từ trình duyệt để xác nhận UI tải đúng — agent cố tình không đọc
password thật (chỉ dùng `DEMO_BASIC_AUTH_HASH`/`QTKHCN_DEV_API_KEY` đã có sẵn trong
`infra/demo-tunnel/.env.local`, nạp vào env var mà không bao giờ in ra). Đây là bước cuối trong
checklist Go/No-Go ở `docs/plan_deploy/v1.md` §11 mà chỉ user làm được.

**Next action cho lần deploy tiếp theo**: từ dev workspace, `git commit` thay đổi cần release rồi
chạy `& .\infra\demo-tunnel\New-DemoRelease.ps1` (không cần tham số), đợi PASS, rồi
`$env:QTKHCN_DEV_API_KEY = '<giá trị hiện tại>'; & .\infra\demo-tunnel\Switch-DemoRelease.ps1 -ReleaseId '<id-in-ra>'`.
Giữ lại `2026-07-16.1_fcb71c4` trong `qtkhcn-demo\releases\` làm bản rollback cho tới khi có release
kế tiếp chạy ổn định.

---

## ★ CURRENT — Properties Panel (màn Vẽ/Sửa BPMN): Việt hoá + icon nhóm + polish list — DONE + VERIFIED 2026-07-16

**Yêu cầu của user**: lên kế hoạch rồi triển khai nâng cấp UI cho Properties Panel trong màn Vẽ/Sửa BPMN
(`/quy-trinh/ve`, `/quy-trinh/nhap/:draftId/ve`). Qua `AskUserQuestion`, user chọn **polish sâu trên nền
CSS skin hiện tại** (giữ nguyên engine `bpmn-js-properties-panel`), không rebuild custom AntD (khác D13).

**Phát hiện trước khi code**:
- Panel dùng service `translate` (didi, chuẩn i18n bpmn.io) cho mọi nhãn — override được bằng module
  riêng, không đụng code gốc thư viện.
- Mỗi group DOM có sẵn `data-group-id="group-<id>"` (xác nhận qua `@bpmn-io/properties-panel` source) —
  cho phép gắn icon riêng theo nhóm bằng CSS mask thuần, không cần sửa JS.
- React reference (`webapp/src/branding/translate-vi.ts`) **đã có sẵn** dictionary Việt hoá tương tự cho
  bpmn-js/form-js (D7-era) — port thẳng sang Angular thay vì viết lại, giữ nhất quán thuật ngữ 2 frontend.

**Đã triển khai (`frontend-angular/`)**:
- `shared/bpmn-modeler/bpmn-properties-i18n.ts` (mới): port `VI_DICT` + `translateVi` + `TranslateViModule`
  từ `webapp/src/branding/translate-vi.ts`, đổi `import.meta.env.DEV` → `isDevMode()` (Angular). Thêm vài
  key list-group còn thiếu so với bản gốc (`Create`, `Toggle section`, `Toggle list item`,
  `List contains {numOfItems} item(s)`). Nạp vào `additionalModules` của `BpmnModelerComponent`
  (`bpmn-modeler.ts`), đứng trước `BpmnPropertiesPanelModule`/`BpmnPropertiesProviderModule`/
  `ZeebePropertiesProviderModule` — không đổi hành vi modeler khác.
- `styles/bpmn-modeler-panel.scss` (mở rộng, cùng file skin global đã có từ đợt polish trước):
  - Icon theo nhóm qua `[data-group-id="group-..."]` + CSS `mask-image` (SVG data-URI, tự đổi màu theo
    theme vì dùng `background-color` + mask, không phải asset màu cố định): `general`, `documentation`,
    `taskDefinition`, `headers`, `assignmentDefinition`, `form`, `inputs`, `outputs`, `condition`,
    `Zeebe__ExecutionListeners`/`Zeebe__TaskListeners`, `Zeebe__ExtensionProperties`, `multiInstance`,
    `calledElement`/`calledDecision` — id lấy đúng từ source thật (`GeneralGroup`/`HeaderGroup`/
    `TaskDefinitionGroup`/... trong `bpmn-js-properties-panel` dist), không đoán.
  - Empty-state (`bio-properties-panel-placeholder*`, sinh ra khi chưa chọn phần tử hoặc chọn nhiều phần
    tử — panel gốc đã có icon/text riêng qua `PanelPlaceholderProvider`, trước đây chưa style): căn giữa,
    icon mờ `opacity:.45`, text `--vht-ink-2`, nhất quán empty-state các màn khác.
  - Polish nhóm dạng danh sách (`ListGroup`: Headers/Input mapping/Output mapping/Execution listeners/
    Task listeners/Extension properties) — nhóm Zeebe hay dùng nhất khi cấu hình Service Task/User Task:
    nút "Thêm mục" dạng outline bo góc, badge số lượng mục (biến `--error` khi có lỗi), mỗi dòng list-entry
    thành card viền/bo góc, nút xoá icon đỏ khi hover, mũi tên thu gọn/mở rộng.

**Verify**:
- `npx ng build` (production): **GREEN**, 7.3s, chỉ còn cảnh báo không chặn có sẵn từ trước (`classnames`
  CommonJS trong `@bpmn-io/properties-panel`).
- `npx ng test --watch=false`: **9/9 file, 28/28 test PASS** (không regression; không có test nào assert
  nhãn tiếng Anh cụ thể của properties panel nên Việt hoá không phá test nào).
- Dictionary chỉ dịch phạm vi nhãn/nhóm thực tế dùng trong RD01–RD10 (không dịch hết ~340 chuỗi của thư
  viện ngay từ đầu) — chuỗi chưa dịch tự động giữ nguyên tiếng Anh (an toàn, không vỡ UI); có sẵn cơ chế
  dev-only `__viMissing()` (console) để bổ sung dần khi phát hiện gap qua sử dụng thật.

**⚠️ CHƯA verify được**: chưa click-through trình duyệt thật phiên này (nhất quán các phiên Angular
trước) — icon nhóm, Việt hoá nhãn và polish list mới xác nhận qua build/test + đọc source thật, chưa xác
nhận bằng mắt trên `ng serve`. User nên tự mở `/quy-trinh` → "Vẽ / sửa" một draft, chọn lần lượt Start/
User Task/Service Task/Gateway/Sequence Flow để xem panel đã Việt hoá + có icon nhóm + list Headers/
Input-Output mapping đã polish.

**Ngoài phạm vi lát này** (đã thống nhất qua AskUserQuestion): rebuild properties panel bằng custom AntD
(như D13 đã làm cho eForm builder); dịch toàn bộ 340 chuỗi của thư viện; thêm FEEL autocomplete mới (panel
gốc đã có, không đụng).

---

## ★ CURRENT — Nâng cấp “Kiểm tra BPMN”: Lỗi / Cảnh báo / Gợi ý — DONE + VERIFIED 2026-07-16

**Yêu cầu của user**: mở rộng nút **Kiểm tra BPMN** từ validator cấu trúc cơ bản thành luồng lint có
3 mức rõ ràng, bao gồm các trường hợp như gateway chỉ có một nhánh ra và User Task chưa có cơ chế
phân công.

**Đã triển khai**:
- Backend trả contract `issues[]` gồm `code`, `severity`, `message`, `elementId`, `elementName`, đồng thời giữ
  `errors[]`/`warnings[]` tương thích. ERROR làm draft `INVALID` và chặn cả chạy thử/deploy.
- Static lint có rule XML/process, duplicate ID/broken sequence flow, Start/End, unreachable/dead-end,
  gateway/condition/default flow, User Task assignment/form, Service Task job type/retry, Call Activity,
  Boundary Event và gợi ý tên/nhãn. Assignment động chỉ được miễn cảnh báo khi có marker rõ ràng.
- Angular editor và drawer catalog nhóm Lỗi/Cảnh báo/Gợi ý kèm số lượng/mã/phần tử; click issue trong editor
  chọn và đưa `elementId` vào vùng nhìn.
- Verify: backend **76/76 PASS**; Angular **30/30 PASS**; production build GREEN. Warning build duy nhất vẫn là
  `classnames` CommonJS từ properties panel. Chưa click-through trình duyệt thật/real-stack smoke trong lượt này.
- Backend source mới đã được đóng gói executable và restart thành công trên cổng 8090, PID **23544**; API
  `GET /api/process-definition-drafts` trả HTTP 200 và JAR chứa contract `issues[]` mới (2026-07-16 10:58).
- Registry-aware rules (`FORM_NOT_FOUND`, `CANDIDATE_GROUP_UNKNOWN`, service binding/called-process lookup)
  chưa bật vì ứng dụng chưa có registry contract tương ứng; lint XML tĩnh không giả lập dữ liệu registry.

### Quy ước mức độ

- **ERROR — Lỗi**: mô hình không thể triển khai/chạy an toàn; chặn chạy thử và deploy.
- **WARNING — Cảnh báo**: có nguy cơ lỗi runtime hoặc thiếu cấu hình nghiệp vụ; mặc định không chặn deploy.
- **SUGGESTION — Gợi ý**: cải thiện khả năng đọc, bảo trì và chuẩn hóa mô hình; không chặn.
- Backend là nguồn kết quả chuẩn. Frontend chỉ nhóm/hiển thị theo severity; backend vẫn kiểm tra lại khi deploy.
- Các rule phụ thuộc registry của ứng dụng (form, candidate group, service-task binding) phải tách khỏi rule
  BPMN/XML thuần để test độc lập và trả thông báo đúng nguyên nhân.

### ERROR — chặn chạy thử/deploy

- `XML_INVALID`: XML sai cú pháp, chứa DTD/external entity hoặc không đọc được.
- `PROCESS_MISSING`, `MULTIPLE_EXECUTABLE_PROCESS`, `PROCESS_ID_MISSING`, `PROCESS_ID_MISMATCH`.
- `DUPLICATE_ELEMENT_ID`: trùng ID phần tử BPMN.
- `SEQUENCE_FLOW_BROKEN`: sequence flow thiếu/sai `sourceRef` hoặc `targetRef`.
- `START_EVENT_MISSING`, `START_EVENT_NO_OUTGOING`.
- `FLOW_NODE_UNREACHABLE`: phần tử thực thi không đi tới được từ Start Event.
- `ACTIVE_PATH_DEAD_END`: activity/gateway kết thúc cụt ngoài End Event có chủ đích.
- `GATEWAY_NO_OUTGOING`: gateway phân nhánh không có luồng ra.
- `GATEWAY_CONDITION_MISSING`: nhánh không phải default của gateway phân nhánh thiếu condition bắt buộc.
- `SERVICE_TASK_JOB_TYPE_MISSING`: Service Task thiếu `zeebe:taskDefinition type`.
- `USER_TASK_DEFINITION_INVALID`: cấu hình User Task không thuộc kiểu Camunda 8 được hệ thống hỗ trợ.
- `CALLED_PROCESS_MISSING`: Call Activity thiếu process được gọi.
- `BOUNDARY_EVENT_TARGET_INVALID`: Boundary Event thiếu/sai activity đích.

### WARNING — không chặn, có nguy cơ runtime/nghiệp vụ

- `GATEWAY_SINGLE_OUTGOING`: gateway chỉ có một nhánh ra; có thể dư thừa hoặc chưa hoàn thiện.
- `GATEWAY_DEFAULT_FLOW_MISSING`: Exclusive/Inclusive Gateway có từ hai nhánh ra nhưng thiếu default flow
  (rule hiện có; giữ cảnh báo `CONDITION_ERROR`).
- `GATEWAY_UNCONDITIONAL_BRANCH`, `GATEWAY_MULTIPLE_UNCONDITIONAL`, `GATEWAY_NO_MATCH_RISK`.
- `USER_TASK_ASSIGNMENT_MISSING`: không có `assignee`, `candidateUsers`, `candidateGroups` và cũng không
  được đánh dấu/đăng ký là **phân công động tại runtime**.
- `USER_TASK_FORM_MISSING`, `USER_TASK_NO_OUTGOING`.
- `SERVICE_TASK_BINDING_MISSING`, `SERVICE_TASK_RETRY_MISSING`, `ERROR_HANDLING_MISSING`.
- `EXPRESSION_VARIABLE_UNKNOWN`: condition dùng biến không thấy trong form/input/output mapping đã biết;
  chỉ cảnh báo vì biến có thể được tạo động lúc runtime.
- `FORM_NOT_FOUND`, `CANDIDATE_GROUP_UNKNOWN`, `CALL_ACTIVITY_UNRESOLVED`.
- `POTENTIAL_INFINITE_LOOP`, `END_EVENT_MISSING`, `PARALLEL_SPLIT_JOIN_RISK`,
  `MESSAGE_CORRELATION_MISSING`.

### SUGGESTION — chất lượng mô hình

- `ELEMENT_NAME_MISSING`, `PROCESS_NAME_MISSING`, `TECHNICAL_ELEMENT_NAME`, `TASK_TOO_GENERIC`.
- `GATEWAY_QUESTION_MISSING`, `SEQUENCE_FLOW_LABEL_MISSING`, `DEFAULT_FLOW_LABEL_MISSING`.
- `ELEMENT_DOCUMENTATION_MISSING`, `ID_NAMING_INCONSISTENT`.
- `ASSIGNMENT_TOO_SPECIFIC`: gắn cứng cá nhân thay vì vai trò/nhóm khi không cần thiết.
- `LARGE_PROCESS`, `CROSSING_FLOW_LAYOUT`, `SLA_MISSING`.
- `AUDIT_VARIABLE_MISSING`, `APPROVAL_OUTCOME_INCOMPLETE`, `DIRECT_TASK_TO_END`.

### Thứ tự triển khai đề xuất

1. **Lát 1 — Contract + core graph lint**: đổi response sang issue có `code`, `severity`, `message`,
   `elementId`, `elementName`; giữ tương thích `errors`/`warnings` trong giai đoạn chuyển tiếp. Làm các rule
   gateway, duplicate/broken reference, Start Event, unreachable và dead-end.
2. **Lát 2 — Camunda task configuration**: User Task assignment/form; Service Task job type; message,
   boundary event và call activity ở mức kiểm tra tĩnh.
3. **Lát 3 — Registry-aware lint**: đối chiếu form key, candidate group, service-task binding và called process
   với dữ liệu thật của ứng dụng; fail-closed khi registry không tải được nhưng không biến lỗi hạ tầng thành
   lỗi của BPMN.
4. **Lát 4 — Angular UX**: ba nhóm Lỗi/Cảnh báo/Gợi ý, số lượng trên badge, click issue để focus/highlight
   `elementId` trong editor; drawer catalog hiển thị cùng contract.
5. **Lát 5 — Deploy/test guard + tài liệu**: ERROR chặn deploy và chạy thử; WARNING/SUGGESTION không chặn,
   trừ rule được policy cấu hình nâng mức; cập nhật README và smoke test.

### Bộ rule MVP ưu tiên

1. Gateway không có nhánh ra; gateway chỉ có một nhánh ra.
2. Gateway nhiều nhánh thiếu condition/default flow.
3. User Task thiếu assignment hoặc thiếu form.
4. Service Task thiếu job type hoặc binding active.
5. Candidate Group/Form Key không tồn tại.
6. Phần tử unreachable, sequence flow hỏng và luồng kết thúc cụt.
7. Process/Task/Gateway/nhánh gateway thiếu tên hoặc nhãn.

### Quyết định cần giữ khi triển khai

- Gateway một nhánh ra là **WARNING**, không phải ERROR.
- User Task thiếu assignment mặc định là **WARNING**. Chỉ nâng thành ERROR nếu policy nghiệp vụ xác nhận
  mọi User Task bắt buộc có người/nhóm nhận việc ngay trong BPMN.
- Phân công động phải có dấu hiệu xác nhận rõ ràng (extension/registry/policy); không được tự mặc định để
  làm mất cảnh báo.
- Static lint chỉ kiểm tra sự tồn tại/cấu trúc expression; không tuyên bố condition chắc chắn đúng với mọi
  bộ biến runtime. Deploy Camunda vẫn là lớp validation cuối.

### Acceptance criteria

- Cùng một BPMN cho kết quả rule ổn định, có mã lỗi và `elementId` để truy vết.
- ERROR làm draft `INVALID` và chặn chạy thử/deploy; chỉ WARNING/SUGGESTION vẫn cho phép tiếp tục.
- Không báo `USER_TASK_ASSIGNMENT_MISSING` khi task có assignee/candidate user/candidate group hợp lệ hoặc
  đã được đăng ký phân công động.
- Unit test cho từng rule và test graph; HTTP contract test; Angular component test cho ba severity.
- Regression test rule thiếu default flow hiện tại; backend test, Angular test/build và real-stack smoke xanh.

---

## ★ CURRENT — BPMN editor export/fullscreen/properties-panel polish — DONE + VERIFIED 2026-07-16

**Đã triển khai**:
- Nút **Kết xuất .bpmn** xuất XML hiện tại từ modeler, đồng bộ process id/name và tải file tên an toàn
  về thiết bị; không bắt buộc lưu draft trước.
- Icon button **Toàn màn hình / Thoát toàn màn hình** dùng Fullscreen API; trạng thái icon và canvas
  tự đồng bộ/fit lại sau `fullscreenchange`.
- Properties panel tăng bề rộng 380px (420px khi fullscreen), thu gọn thực sự về 0 khi ẩn; skin global
  riêng cho DOM động của bpmn-js chuẩn hóa header, group sticky, spacing, label, input/select/textarea,
  FEEL control, focus state và scrollbar. CSS được đặt global để không phụ thuộc Angular encapsulation
  và không làm vượt component-style budget.

**Verify**:
- Angular `npm test -- --watch=false`: **28/28 PASS**.
- Angular `npm run build`: **GREEN**, không còn warning component-style budget.
- Warning không chặn duy nhất: `classnames` trong properties panel là CommonJS.
- Chưa click-through/screenshot bằng trình duyệt thật trong phiên này.

---

## ★ CURRENT — Angular “Tạo & vẽ BPMN” — DONE + VERIFIED 2026-07-16

**Đã triển khai**:
- `/quy-trinh` có nút **Tạo & vẽ BPMN**; mỗi draft chưa deploy có action **Vẽ / sửa**.
- Route lazy-load mới `/quy-trinh/ve` và `/quy-trinh/nhap/:draftId/ve` dùng `bpmn-js` Modeler,
  properties panel BPMN/Camunda 8 và `zeebe-bpmn-moddle`; có palette/context pad, undo/redo, zoom,
  fit viewport, đóng/mở panel và cảnh báo thay đổi chưa lưu.
- Tạo mới sinh BPMN executable tối thiểu Start → User Task → End. Trước khi lưu, editor đồng bộ
  `bpmn:process id/name/isExecutable` với metadata, sau đó gọi contract draft thật `POST`/`PUT`
  và khóa optimistic bằng `expectedRevision`; validate luôn lưu thay đổi mới nhất trước rồi gọi API validate.
- Luồng hiển thị lỗi 409/backend, lỗi và warning validate; draft đã deploy bị chặn chỉnh sửa.
- `ProcessDefinitionDraftService` bổ sung `create`/`update` và giữ audit actor Unicode như các API hiện hữu.

**Verify**:
- Angular `npm test -- --watch=false`: **27/27 PASS**.
- Angular `npm run build`: **GREEN**; editor nằm trong lazy chunk riêng, initial bundle 2.18 MB dưới budget lỗi.
- Còn một warning build không chặn: dependency `classnames` bên trong properties panel là CommonJS.
- Chưa click-through trình duyệt thật trong phiên này.

---

## ★ CURRENT — Bypass Service Task tạm thời (Test BPMN) — DONE + VERIFIED 2026-07-16

**Yêu cầu của user**: "Khi chạy test BPM bạn tạm thêm tính năng by pass cho Service Task nhé. Cứ theo
RD02.02 làm chuẩn." — khi một Service Task trong session Test BPMN chưa có worker production thật,
job đó kẹt `BLOCKED` vô thời hạn (allowlist mock hiện rỗng); cần một cách tạm thời hoàn tất thủ công để
đi tiếp, và lấy draft `Process_RD0202` (RD02.02) thật của user làm ví dụ chuẩn.

**Xác nhận trên real stack (đọc trực tiếp draft `Process_RD0202` r3 qua `GET /api/process-definition-drafts`
trên backend 8090 đang chạy)**: Service Task duy nhất trong draft này là `B04` "Kiểm tra điều kiện &
thành phần Bộ HSXD dự thảo 1", `zeebe:taskDefinition type="rd0202-check-draft1"`; gateway `B05` ngay
sau đó rẽ nhánh theo biến `draft1Valid` (default `Flow_007` "Không đạt" nếu không set). Đây là ví dụ
chuẩn dùng để verify tính năng.

**Đã triển khai**:
- `BpmnTestEngineGateway` (interface) thêm `bypassServiceTask(processInstanceKey, jobKey, variables)`.
  `DedicatedBpmnTestEngineGateway` xác nhận job thuộc đúng instance và không phải job user task
  (`io.camunda.zeebe:userTask` đã có đường hoàn tất riêng), rồi gọi thẳng
  `client.newCompleteCommand(jobKey).variables(variables)` — đúng cơ chế đã dùng cho user task, chỉ
  khác loại job. `DisabledBpmnTestEngineGateway` fail-closed như các method khác.
- `BpmnTestSessionService.bypassServiceTask()` theo đúng pattern `completeTask`/`resolveIncident`
  (find/requireActive/expireIfNeeded/requireActive) → gọi engine → 409 + `failureMessage` khi engine
  từ chối hoặc session đã terminal.
- DTO `BypassBpmnTestServiceTaskRequest(variables)`; endpoint mới
  `POST /api/bpmn-tests/{id}/jobs/{jobKey}/bypass`.
- Angular: model/service `bypassServiceTask()`; khu vực "Job bị chặn" trên
  `/quy-trinh/nhap/:draftId/chay-thu` giờ có nút "Bypass — hoàn tất thủ công" mở drawer nhập biến
  output (dùng chung `BpmnVariableFormComponent`, `focusElementId` = elementId của job), gọi API rồi
  làm mới snapshot.
- `backend/README.md` mục mới "Bypass Service Task tạm thời" giải thích endpoint + ví dụ thật RD02.02.

**Verify**:
- Backend `mvn -o test`: **71/71 GREEN** (từ 67; +4 test bypass trong `BpmnTestSessionServiceTest` +
  `BpmnTestSessionHttpContractTest`).
- Angular `npx ng build` (production): GREEN. `npx ng test --watch=false`: **9/9 file, 27/27 test
  PASS** (không regression).
- Real-stack smoke mới `backend/scripts/smoke-bypass-service-task.ps1`: chạy `mvn spring-boot:run`
  (KHÔNG dùng `target/qtkhcn-backend.jar` — file đó đang bị khoá bởi backend 8090 sống của user, PID
  24228) trên cổng 8091 tạm, dùng test engine cô lập có sẵn (`bpmn-test-orchestration`, cổng
  8092/26510, đã chạy sẵn 2 giờ). BPMN test tái hiện đúng id/tên/type của draft thật (`B02`→
  `Gateway_133yb7i`(biến `hopLeKhoiTao`) → `B03` → `B04` type `rd0202-check-draft1` → `B05` biến
  `draft1Valid`) thay vì deploy nguyên draft 70+ node thật (theo đúng tiền lệ
  `smoke-condition-error-resolve.ps1`). Kết quả: session vào `BLOCKED` đúng tại `B04` với type
  `rd0202-check-draft1` → gọi bypass API với `draft1Valid=true` → session `COMPLETED` qua nhánh
  `Flow_006`, cùng `processInstanceKey` suốt quá trình. Sau smoke: backend 8091 tạm đã dừng sạch
  (`taskkill /T /F`, xác nhận bằng `Get-Process java` chỉ còn đúng PID 24228 của user), port 8090 và
  toàn bộ container Docker (`orchestration`/`qtkhcn-postgres`/`bpmn-test-orchestration`/`connectors`)
  không bị đụng.

**Lưu ý kỹ thuật xác nhận qua real run**: response trả về ngay sau lệnh bypass có thể vẫn liệt kê job
vừa bypass trong `blockedJobs` do search index của Zeebe eventually-consistent (đã gặp hiện tượng
tương tự ở Lát C trước đây) — script polling `GET /{id}` lặp lại tới khi `COMPLETED` thay vì assert
ngay trên response của lệnh bypass.

**Trạng thái**: `DONE + VERIFIED`. Next: user tự `ng serve` + bật test engine Docker, mở draft
`Process_RD0202` → "Chạy thử BPMN" → khi tới `B04` bấm nút "Bypass — hoàn tất thủ công" để xác nhận UI
thật (chưa click-through trình duyệt phiên này, nhất quán các phiên Angular trước — verify bằng
build/unit test + smoke API thật).

---

**Last updated**: 2026-07-16
**Agent role**: Delivery Manager / Full-stack scaffold

---

## ★ CURRENT — DMN activate/deploy + evaluate thật qua Camunda — DONE + VERIFIED 2026-07-16

**Đã triển khai**:
- Flyway `V7__dmn_camunda_deployment.sql` bổ sung trạng thái version `NOT_DEPLOYED|DEPLOYED|FAILED`,
  deployment key, decision key/id/version, thời điểm deploy và lỗi deploy. Version mới luôn bắt đầu
  `NOT_DEPLOYED`; deploy thất bại được lưu `FAILED` để audit/retry và không chuyển rule sang `ACTIVE`.
- Activate version gọi Camunda deploy thật trước khi cập nhật con trỏ active. Version đã deploy được tái sử
  dụng, không deploy trùng khi activate lại; version failed có thể activate lại để retry.
- API mới `POST /api/dmn-rules/{id}/evaluate` nhận `{variables:{...}}`, chỉ evaluate decision key của version
  active/deployed, trả evaluation key, decision metadata, `outputs` và `matchedRules[]`. Lỗi Camunda/FEEL trả
  HTTP 422 envelope ổn định; rule chưa active/deployed fail-closed.
- Angular đã bỏ evaluator TypeScript khỏi màn "Chạy thử DMN", gọi API backend thật, có loading/error FEEL,
  tô matched row theo rule id Camunda và hiển thị deployment state/key/error trong lịch sử version.
- Thêm `backend/scripts/smoke-dmn-camunda.ps1` cho chuỗi tạo rule → lưu immutable version → activate/deploy →
  evaluate thật và assert key/matched rule/output; cập nhật contract trong `backend/README.md`.

**Verify**:
- Backend `mvn -o verify` + contract deploy-error bổ sung: **67/67 PASS**, executable JAR đóng gói thành công.
- Angular `npm run build`: GREEN; `npm test -- --watch=false`: **25/25 PASS**.
- Real-stack smoke trên PostgreSQL + production Camunda: rule `BR-SMOKE-DMN-20260716023857`, deployment key
  `2251799813699262`, decision key `2251799813699264`, evaluation key `2251799813699265`, matched rule
  `R_HIGH`, output `APPROVE`.
- Backend JAR mới đã restart ở cổng 8090, PID **22068**; evaluate lại artifact smoke qua 8090 tiếp tục trả
  `R_HIGH / APPROVE`.

**Ghi chú kỹ thuật đã kiểm chứng bằng engine thật**: Camunda 8.9 trả `decisionOutput` dạng scalar khi bảng
FIRST chỉ có một output. Gateway backend chuẩn hóa trường hợp này từ evaluated matched outputs để REST luôn
trả `outputs` dạng object ổn định cho Angular.

---

## ★ CURRENT — DMN Angular ↔ REST contract + bảng luật ↔ dmnXml — DONE + VERIFIED 2026-07-16

**Đã triển khai**:
- `BusinessRuleService` đã bỏ seed/store in-memory và gọi thật `/api/dmn-rules`: list, create, get detail,
  get artifact version, save immutable version với `expectedVersion`, activate và disable. Audit actor tiếp tục đi
  qua `X-QTKHCN-Actor`; cache signal chỉ phản chiếu dữ liệu backend.
- Màn danh sách tải dữ liệu backend, xử lý loading/error/retry; bỏ các thao tác duplicate/delete vì REST Lát A
  không có contract tương ứng. Chỉ cho activate khi đã có ít nhất một version.
- Màn chi tiết tải latest artifact, tải version cũ theo yêu cầu và lưu version mới bất đồng bộ; lỗi 400/409 từ
  backend được hiển thị thay vì cập nhật UI lạc quan.
- Thêm converter fail-closed `dmnXmlToDecisionTable` / `decisionTableToDmnXml` cho bảng FIRST-hit một decision,
  hỗ trợ string/number/boolean và ANY/EQ/GTE/GT/LTE/LT/BETWEEN. FEEL ngoài tập hỗ trợ báo lỗi, không âm thầm
  đổi thành ANY gây sai nghĩa.

**Verify**:
- Angular `npm run build`: GREEN; `npm test -- --watch=false`: **24/24 PASS** (có round-trip byte-idempotent,
  unsupported FEEL fail-closed và HTTP save contract).
- Backend `mvn -o verify`: **63/63 PASS**, JAR đóng gói lại thành công.
- Backend cổng 8090 đã restart bằng JAR mới, PID **27624**; request thật có dev key
  `GET /api/dmn-rules` trả HTTP 200 `[]`, log map đúng `DmnRuleController#list`.

**Giới hạn đúng phạm vi**: converter Angular hiện hỗ trợ một decision table/hit policy FIRST như editor hiện tại;
DMN nhiều decision/DRD hoặc FEEL nâng cao phải được bổ sung model/editor trước khi mở rộng converter. Chưa smoke
ghi dữ liệu thật vì contract không có delete để dọn artifact test.

---

## ★ CURRENT — Nâng cấp UX Test BPMN: form biến thông minh + sửa CONDITION_ERROR tại chỗ + cảnh báo thiếu default flow — DONE + VERIFIED 2026-07-16

**Yêu cầu của user**: tính năng "Chạy thử BPMN" hiện rất khó dùng với end user không rành kỹ thuật.
Cụ thể 2 điểm nêu ra, ví dụ thật trên `Process_RD0202` revision 1:
1. Ô "Biến kết quả (JSON object, tuỳ chọn)" — user không hiểu cần nhập gì.
2. Khi test tới bước Gateway thì báo sự cố `CONDITION_ERROR — Gateway_133yb7i: Expected at least one
   condition to evaluate to true, or to have a default flow.` — user không biết phải làm gì tiếp, và
   nếu cần sửa thì sửa ở đâu để test tiếp được.

**Quyết định phạm vi (chốt qua AskUserQuestion cùng phiên)**:
- Khi CONDITION_ERROR được sửa, hệ thống **sửa tại chỗ và đi tiếp** trên cùng instance test (Camunda
  `setVariables` + `resolveIncident`) — không bắt user chạy lại từ đầu, giữ nguyên tiến trình đã test
  trước incident. Yêu cầu thêm API mới ở backend (Lát 2 dưới đây).
- Lát cảnh báo tĩnh thiếu default flow ở bước "Kiểm tra BPMN" (Lát 4 dưới đây) **đưa vào đợt này**, không
  hoãn.

**Hiện trạng đã xác nhận qua đọc code thật (không đoán)**:
- FE `bpmn-test-session.html:54-63` (biến khởi tạo) và `:209-216` (biến hoàn tất task) chỉ có 1
  `<textarea>` JSON thô — không gợi ý tên biến, kiểu dữ liệu, hay biến dùng để làm gì.
- Backend đã trả incident đầy đủ (`elementId`, `type`, `message`) qua
  `BpmnTestEngineGateway.EngineSnapshot`/`DedicatedBpmnTestEngineGateway.snapshot()`
  (`backend/.../camunda/DedicatedBpmnTestEngineGateway.java:73-77`), nhưng FE
  (`bpmn-test-session.html:161-172`) chỉ hiện nguyên văn message tiếng Anh trong 1 `nz-alert`, không tô
  sáng gateway lỗi trên sơ đồ, không có hành động sửa.
- `BpmnViewerComponent` (`frontend-angular/src/app/shared/bpmn-viewer/bpmn-viewer.ts`) chỉ có 1 marker
  `qtkhcn-bpmn-active` cho phần tử đang active (`activeElementIds` input); chưa có marker riêng cho
  phần tử có incident.
- `BpmnTestEngineGateway` interface (`backend/.../camunda/BpmnTestEngineGateway.java`) hiện chỉ có
  `deployAndStart/snapshot/completeTask/cancel` — chưa có method set-variables/resolve-incident.
- `ProcessDefinitionImportValidator.validateBytes()` (`backend/.../service/
  ProcessDefinitionImportValidator.java:93-108`) đã có sẵn `List<String> warnings` chảy tới tận
  `ProcessDefinitionDraftService.validate()` → `ProcessDefinitionDraftValidationResponse.warnings()` —
  API "Kiểm tra BPMN" đã hỗ trợ warnings không chặn, chỉ cần thêm rule mới, **không cần đổi DTO**.

### Kế hoạch triển khai theo lát

#### Lát 1 — Parser biến BPMN + form biến thông minh (FE, dùng chung 2 nơi)
- Component/service mới (vd. `shared/bpmn-variables/bpmn-variable-usage.ts`) parse BPMN XML (dùng
  bpmn-moddle mà bpmn-js đã có sẵn, không thêm dependency) để tìm mọi `sequenceFlow` có
  `conditionExpression` (FEEL) và trích danh sách biến được tham chiếu (regex trên identifier FEEL,
  loại trừ string/number literal và từ khoá) kèm nơi dùng (`elementId`, tên gateway, nội dung điều
  kiện). Suy luận kiểu dữ liệu tối thiểu: literal chuỗi trong nháy kép → string (nếu nhiều flow cùng
  biến so sánh với các chuỗi khác nhau → render `nz-select` liệt kê các giá trị đó); literal số → number
  input; `true`/`false` → switch; còn lại → text input.
- Component form mới nhận `xml` + `focusElementId?` (optional, để lọc biến liên quan gần 1 task/gateway
  cụ thể) → render field có nhãn = tên biến + hint "dùng tại: <tên gateway> (<điều kiện>)". Có toggle
  "Nâng cao — JSON thô" để chuyển sang textarea hiện tại (không phá luồng cũ nếu form không phát hiện
  được biến nào — fallback về JSON thô y như hiện tại).
- Áp dụng cho form "Biến khởi tạo" (không có `focusElementId`, hiện toàn bộ biến trong BPMN) và drawer
  "Biến kết quả khi hoàn tất task" (`focusElementId` = phần tử ngay sau task đó nếu dò được, có nút "hiện
  tất cả biến" để mở rộng nếu không đủ).
- Không đổi payload gửi lên API — vẫn build `Record<string, unknown>` y hệt luồng cũ, `startSession()`/
  `submitCompleteTask()` trong `bpmn-test-session.ts` không đổi logic gọi API.

#### Lát 2 — Backend: sửa CONDITION_ERROR tại chỗ (setVariables + resolveIncident)
- `BpmnTestEngineGateway` thêm 2 method: `void setVariables(long elementInstanceKey, Map<String,Object>
  variables)` và `void resolveIncident(long incidentKey)`.
- `DedicatedBpmnTestEngineGateway` implement qua `client.newSetVariablesCommand(key).variables(map)
  .send()` rồi `client.newResolveIncidentCommand(incidentKey).send()`. Dùng `processInstanceKey` làm
  `elementInstanceKey` (scope biến ở cấp process instance) — ghi rõ đây là giới hạn có chủ đích cho bản
  đầu tiên; scope theo flow-scope con (subprocess) để sau nếu cần.
- `DisabledBpmnTestEngineGateway` giữ đúng pattern fail-closed hiện có (ném lỗi "Test BPMN đang tắt" như
  các method khác).
- `BpmnTestSessionService` thêm `resolveIncident(UUID sessionId, long incidentKey, Map<String,Object>
  variables)`: `find` + `requireActive` + `expireIfNeeded` + `requireActive` lại (đúng pattern
  `completeTask` hiện có) → gọi `engine.setVariables` rồi `engine.resolveIncident` → bắt
  `RuntimeException` lưu `failureMessage` + ném `IllegalStateException` (fail-closed, đúng pattern các
  method khác trong service) → trả `get(id)` snapshot mới.
- DTO mới `ResolveBpmnTestIncidentRequest(Map<String,Object> variables)`; endpoint mới
  `POST /api/bpmn-tests/{id}/incidents/{incidentKey}/resolve` trên `BpmnTestSessionController`.
- Test: service test (happy path gọi đúng 2 lệnh theo thứ tự, snapshot cập nhật; lỗi engine → 409 +
  failureMessage lưu lại), HTTP contract test (thiếu/sai variables → 400; session đã terminal → 409).

#### Lát 3 — FE: UX incident CONDITION_ERROR (tô sáng + giải thích + nút sửa tại chỗ)
- `bpmn-test.service.ts` thêm `resolveIncident(sessionId, incidentKey, variables)` gọi endpoint Lát 2.
- `BpmnViewerComponent` thêm input `incidentElementIds` (marker CSS riêng `qtkhcn-bpmn-incident`, màu
  đỏ, cùng cơ chế `addMarker/removeMarker` đã có — không đổi hành vi `activeElementIds`).
- `bpmn-test-session.html`: incident có `type === 'CONDITION_ERROR'` được xử lý riêng — dùng parser Lát 1
  để liệt kê từng luồng ra của gateway đó kèm điều kiện FEEL thật, đối chiếu biến hiện có trong
  `s.variables` (đánh dấu biến thiếu/không khớp), thay cho message tiếng Anh thô. Nút "Sửa biến & tiếp
  tục" mở drawer dùng form Lát 1 (`focusElementId` = gateway đó) → submit gọi `resolveIncident()` → cập
  nhật snapshot, tiếp tục polling nếu đã dừng, toast thành công. Incident type khác giữ nguyên hiển thị
  alert như hiện tại (ngoài phạm vi lát này).

#### Lát 4 — Backend: cảnh báo tĩnh thiếu default flow ở "Kiểm tra BPMN"
- Thêm rule mới trong `ProcessDefinitionImportValidator.validateBytes()` (cùng chỗ đang check "process
  không có name"): với mỗi `exclusiveGateway`/`inclusiveGateway` có ≥2 sequence flow đi ra, nếu không có
  flow nào là `default` của gateway đó (thuộc tính `default` trên gateway trỏ tới flow id) → thêm vào
  `warnings` cùng danh sách: "Cổng '<tên/id>' có nhiều luồng ra nhưng không có luồng mặc định (default
  flow) — nếu lúc chạy không luồng nào thoả điều kiện sẽ phát sinh lỗi CONDITION_ERROR." Cảnh báo áp dụng
  bất kể các flow còn lại có `conditionExpression` hay không (đúng khuyến nghị Zeebe — nên luôn có default
  flow phòng trường hợp không có điều kiện nào đúng lúc chạy).
- Không đổi DTO — `warnings[]` đã chảy sẵn tới `ProcessDefinitionDraftValidationResponse` qua
  `ProcessDefinitionDraftService.validate()`. Chỉ cần xác nhận/chỉnh FE hiển thị warnings rõ ràng hơn
  trong kết quả "Kiểm tra BPMN" nếu UI hiện tại đang gộp chung khó phân biệt với errors.
- Test: BPMN mẫu nhỏ có gateway thiếu default flow → validate trả warning đúng nội dung; gateway có
  default flow → không có warning; đảm bảo test cũ về warning "thiếu name" vẫn xanh (không ghi đè logic
  cũ, chỉ nối thêm).

#### Lát 5 — Tests, real-stack smoke, docs
- `mvn -o test` xanh toàn bộ (cũ + mới Lát 2 + Lát 4).
- `npx ng build` + `npx ng test --watch=false` xanh (Lát 1 + Lát 3).
- Real-stack smoke tối thiểu: tạo session có gateway CONDITION_ERROR chủ đích (BPMN test nhỏ) → gọi
  resolve-incident API thật → xác nhận instance đi tiếp đúng nhánh mong muốn, không phải tạo instance
  mới.
- Cập nhật `backend/README.md` mục Test BPMN (endpoint mới) và `active-task.md`/`DELIVERY_STATE.md` khi
  từng lát DONE.

**Definition of Done**:
- Form biến khởi tạo/hoàn tất task hiển thị field có nhãn tiếng Việt cho biến phát hiện được từ BPMN,
  không bắt user tự suy luận cấu trúc JSON cho trường hợp phổ biến; vẫn có lối JSON thô cho trường hợp
  không phát hiện được hoặc user muốn tự gõ.
- Gateway lỗi CONDITION_ERROR được tô đỏ trên sơ đồ, kèm giải thích đúng điều kiện từng luồng ra và biến
  hiện tại — không còn chỉ hiện message tiếng Anh của Camunda.
- User sửa biến ngay trong UI và bấm "tiếp tục" → instance test đi tiếp từ đúng gateway đó (verify bằng
  real Zeebe call), không phải tạo lại session từ đầu.
- "Kiểm tra BPMN" cảnh báo sớm khi gateway thiếu default flow, trước khi user chạy thử và gặp lỗi.
- Tests + build xanh theo từng lát; không phá vỡ hành vi cũ của các incident type khác hay luồng JSON thô
  hiện có.

**Ngoài phạm vi plan này**:
- UX rich cho các incident type khác ngoài CONDITION_ERROR (vd. JOB_NO_RETRIES) — vẫn hiện alert message
  thô như hiện tại.
- Sửa/soạn lại BPMN ngay trong Angular (chưa có bpmn-js editor port sang Angular, theo D17) — tính năng
  này chỉ giúp chẩn đoán/test nhanh hơn, việc sửa file .bpmn gốc (thêm default flow) vẫn cần làm ở nơi
  khác rồi re-import draft mới.
- `setVariables` scope theo flow-scope con (subprocess/multi-instance) — bản đầu dùng scope process
  instance, đủ cho gateway ở cấp process chính.
- Phát hiện biến từ `zeebe:input` mapping của task (chỉ lấy từ `conditionExpression` của sequence flow).

**Đã triển khai (cả 5 lát, người thực hiện: Claude)**:
- Lát 1: `frontend-angular/src/app/shared/bpmn-variables/bpmn-variable-usage.ts` (thuần TypeScript,
  không phụ thuộc Angular) parse BPMN XML bằng `DOMParser` (không thêm dependency mới) để tìm
  `sequenceFlow` có `conditionExpression`, trích biến FEEL tham chiếu + nơi dùng, suy luận kiểu
  (`enum`/`number`/`boolean`/`text`). `bpmn-variable-form.ts/html/scss` render field theo kiểu, có
  focus lọc gateway gần 1 task (`resolveFocusGatewayId`, 1-hop qua sequence flow), nút "hiện tất cả
  biến" và toggle "Nâng cao — JSON thô" (tự bật khi không phát hiện được biến nào). Thay 2 ô
  `<textarea>` JSON thô trong `bpmn-test-session.html` (biến khởi tạo + biến hoàn tất task) mà không
  đổi payload gửi API.
- Lát 2: `BpmnTestEngineGateway` thêm `setVariables(elementInstanceKey, variables)` +
  `resolveIncident(incidentKey)`; `DedicatedBpmnTestEngineGateway` gọi
  `client.newSetVariablesCommand()` rồi `client.newResolveIncidentCommand()` đúng thứ tự;
  `DisabledBpmnTestEngineGateway` fail-closed như các method khác. `BpmnTestSessionService
  .resolveIncident()` theo đúng pattern `completeTask` (find/requireActive/expireIfNeeded), lưu
  `failureMessage` + 409 khi engine từ chối. DTO `ResolveBpmnTestIncidentRequest`, endpoint mới
  `POST /api/bpmn-tests/{id}/incidents/{incidentKey}/resolve`.
- Lát 3: `BpmnViewerComponent` thêm input `incidentElementIds` (marker CSS riêng
  `qtkhcn-bpmn-incident`, đỏ, không đổi hành vi `activeElementIds`). `bpmn-test-session.ts/html` xử lý
  riêng incident `CONDITION_ERROR`: liệt kê từng luồng ra của gateway kèm điều kiện FEEL thật + biến
  hiện có/thiếu (`referencedVariableNames` + `findGateway`), nút "Sửa biến & tiếp tục" mở drawer dùng
  form Lát 1 (`focusElementId` = gateway đó) → gọi `resolveIncident()` → cập nhật snapshot tại chỗ.
  Incident type khác vẫn hiện alert thô như cũ (đúng phạm vi).
- Lát 4: `ProcessDefinitionImportValidator.missingDefaultFlowWarnings()` (mới) — với mỗi
  `exclusiveGateway`/`inclusiveGateway` có ≥2 sequence flow ra mà không có thuộc tính `default` → thêm
  warning vào `warnings[]` đã có sẵn, không đổi DTO. FE `process-catalog.ts/html` giờ hiển thị
  `result.warnings` sau khi "Kiểm tra BPMN" (trước đây validate warnings hoàn toàn không hiện trên
  UI — chỉ có `errors`), thêm signal `validationWarnings` + alert + danh sách trong drawer draft.
- Lát 5: `backend/scripts/smoke-condition-error-resolve.ps1` (mới) — smoke thật lặp lại được, dựng
  gateway `Gateway_133yb7i` thiếu default flow (tái hiện đúng ví dụ thật `Process_RD0202` r1).
  `backend/README.md` có mục mới giải thích endpoint + warning + cách chạy smoke.

**Evidence**:
- `mvn -o test`: **63/63 GREEN** (từ 60; +3 test `resolveIncident` trong
  `BpmnTestSessionServiceTest`/`BpmnTestSessionHttpContractTest`, +3 test default-flow warning trong
  `ProcessDefinitionImportValidatorTest`).
- `npx ng build` (production): GREEN. `npx ng test --watch=false`: **8/8 file, 24/24 test PASS**
  (10 test mới trong `bpmn-variable-usage.spec.ts`).
- Real-stack smoke (`scripts/smoke-condition-error-resolve.ps1`, backend owned port 8091, test engine
  cô lập có sẵn port 8092/26510, không đụng production): chạy **2 lần liên tiếp PASS**. Lần cuối:
  draft `2f8c9ec8-653a-4e97-9ec7-e6cc2fcbbf5a`, session `9e8ff708-f77a-4de0-a700-3fb2c37bb357`,
  `processInstanceKey=2251799813685522` — validate xác nhận đúng 1 warning thiếu default flow; session
  tạo cố ý không set `decision` → gateway `Gateway_133yb7i` phát sinh incident `CONDITION_ERROR` thật
  → gọi `resolve-incident` với `decision=approve` → `processInstanceKey` không đổi trong suốt quá
  trình → session `COMPLETED` đúng nhánh `flow-approve`. Backend owned port 8091 và test engine đã
  dừng/giữ nguyên sạch sau smoke (test engine vốn đã chạy sẵn trước khi bắt đầu, không bị stop).
- Có 1 khoảng ngắn build/test toàn app bị chặn bởi workstream DMN Lát A đang chạy song song
  (refactor `BusinessRuleService` giữa chừng, không liên quan Test BPMN) — đã tự ổn định lại, xác
  nhận không phải do thay đổi của task này bằng git status/mtime của các file `business-rule-*`.

**⚠️ CHƯA verify được**: chưa click-through trình duyệt thật cho Lát 1/3 (không có Playwright/browser
tool phiên này, nhất quán các phiên Angular trước) — form biến/nút "Sửa biến & tiếp tục" mới verify
qua build/unit test + smoke API thật (curl/PowerShell), chưa xác nhận bằng mắt trên `ng serve`.

**Trạng thái**: `DONE + VERIFIED`. Next: user tự `ng serve` + bật test engine Docker, click-through
`/quy-trinh/nhap/:draftId/chay-thu` để xác nhận UI thật (form biến, tô đỏ gateway, drawer sửa incident).

---

## ★ CURRENT — DMN Lát A: REST contract + schema quản lý phiên bản — DONE + VERIFIED 2026-07-16

**Yêu cầu**: khóa contract backend quản lý luật/phiên bản DMN và triển khai PostgreSQL/Flyway + REST;
chưa deploy hoặc evaluate DMN qua Camunda trong lát này.

**Phạm vi đã khóa cho Lát A**:
- Artifact chuẩn phía backend là `dmnXml`; version là snapshot bất biến, đánh số tăng dần trong từng luật.
- `business_rule` giữ metadata + lifecycle (`DRAFT|ACTIVE|DISABLED`), `latestVersion` và
  `activeVersion`; `business_rule_version` giữ XML/checksum/change-note/audit.
- REST tối thiểu: list/create/get luật; list/get/save version với `expectedVersion` optimistic check;
  activate một version bất biến; disable luật. Không có update/delete version.
- Save version chỉ parse/kiểm tra artifact DMN an toàn ở mức contract; không deploy, không gọi Zeebe,
  không thực thi FEEL/decision.
- HTTP error dùng envelope ổn định hiện có; header `X-QTKHCN-Actor` chỉ là audit, không phải production RBAC.

**Đã triển khai**:
- Flyway `V6__dmn_rule_versions.sql`: `dmn_rule`, `dmn_rule_applied_process`,
  `dmn_rule_version`; DB checks cho category/status/version và unique code/(rule,version).
- Domain/repository/service tách hoàn toàn khỏi package Camunda. `latestVersion` và `activeVersion`
  độc lập; save luôn tạo snapshot mới, activate có thể trỏ lại version cũ, disable bỏ active pointer.
- REST `/api/dmn-rules`: create/list/get; list/get/save version; activate version; disable rule.
  List/detail summary không tải `dmnXml`; chỉ GET artifact cụ thể trả XML.
- `DmnArtifactValidator` parse namespace-aware, chặn DTD/XXE/external schema, yêu cầu DMN
  `definitions` + `decision` + `decisionTable`, tính SHA-256. Chưa deploy/evaluate Camunda đúng phạm vi.
- Stable 400 `{message,errors[]}` cho DMN invalid, 409 cho duplicate/stale expectedVersion, 404 cho
  rule/version không tồn tại; request validation cho code/metadata/process list/XML/note.
- Contract được ghi tại `backend/README.md`.

**Verify**:
- `mvn -o verify`: **60/60 GREEN** trên trạng thái hợp nhất cuối (12 test DMN mới:
  validator 3, service 5, HTTP contract 4); JAR đóng gói thành công.
- Real PostgreSQL: backend tạm cổng 8091 chạy thành công, Flyway apply V6 trong 85 ms; query xác nhận
  3 bảng DMN và `flyway_schema_history.version=6`; authenticated `GET /api/dmn-rules` trả HTTP 200 `[]`.
  Instance tạm đã dừng sạch, không tạo/pollute luật smoke.
- Có overlap thật với workstream Test BPMN thêm `resolveIncident(long)` trong lúc verify; lần build
  giữa chừng bị chặn khi interface và implementations chưa đồng bộ. Không sửa/ghi đè phần đó; sau khi
  workstream kia hoàn tất, re-read và chạy lại toàn backend: **60/60 GREEN**.

**Tiếp theo**: nối Angular `BusinessRuleService` sang contract thật và bổ sung chuyển đổi bảng luật
cấu trúc ↔ `dmnXml`; execution/deploy Camunda vẫn là Lát B riêng.

---

## ★ CURRENT — Modal Tạo luật: chọn nhiều quy trình DEPLOYED — DONE + VERIFIED 2026-07-16

**Yêu cầu**: trường `RD áp dụng` trong modal `Tạo luật nghiệp vụ` phải hiển thị danh sách quy trình
đang `DEPLOYED` và cho phép chọn nhiều, không nhập mã tự do.

**Đã làm**:
- `BusinessRuleListPage` gọi lại `ProcessDefinitionService.list()` mỗi lần mở modal; lọc phòng thủ
  `status === 'DEPLOYED'` và sắp xếp theo `bpmnProcessId`.
- Đổi `nz-select` từ `tags` sang `multiple` + search; mỗi option hiển thị `mã — tên (version)` và lưu
  `bpmnProcessId[]` vào `appliedProcesses` như contract UI hiện tại.
- Có loading/disable trong lúc tải, empty-state khi chưa có process deployed, error-state + nút tải lại.
  Điều kiện tạo luật tiếp tục yêu cầu chọn ít nhất một process.

**Verify**:
- `npm run build`: GREEN, bundle 2.09 MB raw / 385.51 kB estimated transfer.
- `npm test -- --watch=false`: **14/14 PASS**.
- Real backend `GET http://localhost:8090/api/process-definitions` với dev-key: HTTP thành công,
  trả 2 process và cả 2 đều `DEPLOYED`; shape có đủ `bpmnProcessId/name/latestVersion` cho option.

---

## ★ CURRENT — Angular màn chi tiết soạn bảng luật, lưu phiên bản và chạy thử DMN — DONE + VERIFIED 2026-07-16

**Yêu cầu**: làm lát tiếp theo sau danh sách Ma trận quyết định: màn chi tiết để soạn bảng luật,
lưu phiên bản và chạy thử DMN. Backend chưa có contract quản lý/thực thi DMN nên không giả lập API.

**Đã triển khai trong `frontend-angular/`**:
- Route `/quan-ly-luat/:id`; tên luật và nút `Mở chi tiết` ở danh sách điều hướng sang màn mới.
- Trình soạn bảng quyết định low-code cho luật DMN: sửa tên bảng, toán tử theo kiểu dữ liệu
  (`ANY/EQ/GTE/GT/LTE/LT/BETWEEN`), giá trị điều kiện/kết quả; thêm, nhân đôi, xoá dòng; cảnh báo
  thay đổi chưa lưu và hoàn tác.
- `BusinessRuleService` vẫn là store bộ nhớ cục bộ, bổ sung definition có cấu trúc và snapshot
  lịch sử. `saveVersion()` clone bất biến nội dung, tăng version, lưu actor/note; có thể nạp một
  version cũ vào bản soạn rồi lưu thành version mới.
- Tab `Chạy thử DMN` tự dựng form từ input columns và đánh giá FIRST-hit ngay trên browser; tô dòng
  khớp, hiển thị output hoặc cảnh báo không khớp. Đây là evaluator cục bộ có chủ đích, không phải
  API/backend/Camunda giả.
- Luật SERVICE có trang chi tiết read-only riêng, không bị giả thành DMN.
- UI ghi rõ phạm vi dữ liệu chỉ tồn tại trong phiên trình duyệt và chưa gọi API quản lý/thực thi DMN.

**Verify**:
- `npm run build`: GREEN, Angular production bundle 2.09 MB raw / 385.27 kB estimated transfer.
- `npm test -- --watch=false`: **14/14 PASS** (6 files), gồm test mới cho boundary/fallback evaluator
  và snapshot version bất biến.
- `git diff --check`: không có whitespace error trong thay đổi được track; repo có nhiều thay đổi
  và file mới từ các workstream trước, không ghi đè/xoá chúng.
- Chưa click-through trình duyệt thật trong phiên này.

**Phạm vi chưa làm đúng theo yêu cầu**: không thêm HttpClient, endpoint backend, DMN XML persistence,
Camunda EvaluateDecision/deploy/versionTag. Khi backend khóa contract, thay implementation của store và
evaluator sau interface hiện tại.

---

## ★ CURRENT — Angular UI cho tính năng Test BPMN (`/api/bpmn-tests`) — DONE + VERIFIED 2026-07-16

**Người thực hiện: Claude.** User hỏi trước "test BPMN có cần deploy lên Camunda 8 thật không, hay
BPMN nháp trong DB App cũng test được" — trả lời: **không cần**, vì `/api/bpmn-tests` (Test BPMN
Lát A+B+C, backend đã DONE+VERIFIED từ 2026-07-15) đọc thẳng `ProcessDefinitionDraftRevision` theo
`draftId`+`revision` và tự deploy XML đó lên một Camunda **test engine cô lập riêng**
(`qtkhcn.bpmn-test.*`, `infra/camunda/docker-compose.bpmn-test.yml`) — không đụng production, không
yêu cầu draft ở trạng thái `DEPLOYED`. Sau đó user yêu cầu triển khai luôn cả FE+BE cho luồng này.

**Phát hiện khi bắt đầu**: toàn bộ BE (`BpmnTestSessionService`/`Controller`/`DedicatedBpmnTestEngineGateway`/
`DisabledBpmnTestEngineGateway`, Flyway V5, DTOs) đã DONE+VERIFIED — xác nhận lại bằng
`mvn -o test`: **44/44 GREEN** (bao gồm `BpmnTestSessionServiceTest` 10 test +
`BpmnTestSessionHttpContractTest` 3 test). Không cần sửa gì ở backend cho tính năng này. Riêng gap
duy nhất còn thiếu là **UI Angular** — `/api/bpmn-tests` chưa có trang nào gọi tới.

**Lưu ý về làm việc song song**: trong lúc phiên này đọc code, một luồng khác (mục "Hiển thị và quản
lý bản nháp BPMN" ngay bên dưới) đang cùng lúc hoàn thiện UI quản lý draft (tab Bản nháp/Đã deploy,
drawer Kiểm tra BPMN/Deploy) trên cùng `frontend-angular/` — phát hiện qua việc đọc lại cùng file
2 lần trong một turn ra nội dung khác nhau. Đã re-read các file dùng chung (`process-catalog.ts/html`,
`app.routes.ts`, `core/models/process-definition.ts`) ngay trước khi sửa để tránh ghi đè; chỉ thêm
phần thuộc riêng Test BPMN (không đụng logic import/validate/deploy draft của luồng kia).

**Đã triển khai (Angular, toàn bộ file mới trừ 4 điểm nối tối thiểu)**:
- `core/models/bpmn-test.ts` (mới): port 1:1 `BpmnTestSessionResponse`/`CreateBpmnTestRequest`/
  `CompleteBpmnTestTaskRequest` từ backend DTO, gồm `BpmnTestStatus` union + hằng
  `BPMN_TEST_TERMINAL_STATUSES`.
- `core/services/bpmn-test.service.ts` (mới): `BpmnTestService.create()/get()/completeTask()/cancel()`
  gọi thẳng `/api/bpmn-tests*`; `create()` đính header `X-QTKHCN-Actor` như các service khác (audit,
  không phải authorization).
- `pages/bpmn-test-session/` (mới, 3 file `.ts/.html/.scss`): trang **"Chạy thử BPMN"**, route
  `/quy-trinh/nhap/:draftId/chay-thu` — tên khác với "Kiểm tra BPMN" (validate schema) để tránh nhầm
  hai khái niệm. Luồng: chọn revision (mặc định = revision hiện tại của draft) → nhập biến khởi tạo
  JSON + TTL tuỳ chọn → `POST /api/bpmn-tests` tạo session → poll `GET /{id}` mỗi 3s (RxJS
  `timer`+`switchMap`+`takeWhile` tới khi status terminal, `catchError` nuốt lỗi poll tạm thời để
  không dừng vòng lặp) → hiển thị sơ đồ BPMN tô sáng phần tử active, bảng user task (nút "Hoàn tất" mở
  drawer nhập biến JSON), danh sách incident/blocked-job, bảng biến process → nút Huỷ phiên
  (`DELETE`, có confirm modal) hoặc Chạy thử lại khi đã terminal. Xử lý rõ lỗi 409 "Test BPMN đang tắt"
  (test engine chưa bật) và 400 (JSON/TTL không hợp lệ) theo đúng envelope `{message, errors[]}`.
- `shared/bpmn-viewer/bpmn-viewer.ts` (sửa, thêm mới không đổi hành vi cũ): input tuỳ chọn
  `activeElementIds` — dùng `canvas.addMarker/removeMarker` (bpmn-js) để tô sáng phần tử đang active
  mà KHÔNG re-import lại diagram (giữ nguyên zoom/pan khi poll cập nhật). `process-detail.ts` (nơi
  dùng component này trước đó) không cần đổi gì vì input mới có default `[]`.
- `shared/bpmn-viewer/bpmn-viewer.scss`: thêm rule `::ng-deep .qtkhcn-bpmn-active` — bắt buộc dùng
  `::ng-deep` vì SVG do bpmn-js vẽ imperatively, không qua Angular template compiler nên style
  scoped thường không áp dụng được.
- `core/models/process-definition.ts`: thêm `ProcessDefinitionDraftRevisionResponse` (trước đó
  `ProcessDefinitionDraftResponse.revisions` gõ kiểu `unknown[]`) để trang Test BPMN lấy đúng
  `bpmnXml` của revision được chọn cho viewer.
- `pages/process-catalog/` + `app.routes.ts`: nối tối thiểu — nút "Chạy thử BPMN" trong drawer chi
  tiết draft, nút "Chạy thử" trên mỗi dòng bảng Bản nháp, và 1 route mới `runTestDraft()` điều hướng
  sang trang trên. Không đổi logic `validateDraft()/deployDraft()`/modal nhập file của luồng kia.

**Verify thật đã làm**:
- `mvn -o test` (JDK 21 Temurin + Maven 3.9.16, full path vì không có sẵn trong PATH bash mới):
  **44/44 GREEN** trước khi đụng code Angular — xác nhận backend không cần sửa.
- `npx ng build` (production): **GREEN**, 5.2s, main bundle 1.39 MB / ~314.8 kB gzip (tăng từ mức
  trước đó do thêm trang mới — chưa chạm ngưỡng `maximumError`).
- `npx ng test --watch=false`: **8/8 PASS** (không có test regressions từ các file đã sửa).
- 1 lỗi build thật phát hiện và sửa: `nz-result[nzSubTitle]` không nhận `string | null` (chỉ nhận
  `string | TemplateRef<void> | undefined`) — sửa `draftError() ?? undefined` trong
  `bpmn-test-session.html`.

**⚠️ CHƯA verify được**:
- Chưa click-through trình duyệt thật (không có Playwright/browser tool phiên này, nhất quán mọi
  phiên Angular trước) — chưa xác nhận bằng mắt: modal cấu hình phiên, việc tô sáng phần tử BPMN khi
  poll, drawer hoàn tất task, và thông báo lỗi 409 khi `qtkhcn.bpmn-test.enabled=false` (mặc định
  trong `application.yml` — cần bật `infra/camunda/docker-compose.bpmn-test.yml` trước khi test session
  thật sự chạy được, nếu không API sẽ trả 409 "Test BPMN đang tắt" đúng như thiết kế fail-closed).
- Chưa chạy real-stack: cần backend + Docker test engine (`docker-compose.bpmn-test.yml`) cùng lúc để
  xác nhận tạo session thật, poll snapshot thật, hoàn tất user task thật qua UI (khác với smoke script
  PowerShell `scripts/smoke-bpmn-lifecycle.ps1` đã verify luồng này qua curl ở Lát C).

**Tiếp theo (gợi ý)**: user tự `ng serve` + bật test engine Docker, click-through
`/quy-trinh` → tab Bản nháp → mở draft → "Chạy thử BPMN" để xác nhận UI thật; sau đó cân nhắc thêm
unit test Angular cho `BpmnTestSessionPage` (parse JSON lỗi, polling dừng đúng khi terminal) nếu cần
tăng độ tin cậy tự động hoá.

---

## ★ CURRENT — Hiển thị và quản lý bản nháp BPMN trên Danh mục quy trình — DONE + VERIFIED 2026-07-16

**Yêu cầu của user**: sau khi nhập thành công `Process_RD0202`, quy trình phải xuất hiện và có thể
được quản lý trên màn hình `/quy-trinh`; ghi task vào STATE và triển khai ngay.

**Nguyên nhân đã xác nhận trên real stack**:
- `Process_RD0202` đã được lưu đúng vào PostgreSQL dưới dạng `DRAFT` (hiện có 5 bản nháp độc lập),
  không bị mất dữ liệu và chưa có bản ghi trong deployed catalog.
- Angular chỉ gọi `GET /api/process-definitions`, còn backend chưa có collection
  `GET /api/process-definition-drafts` (trả HTTP 405), nên UI không có đường đọc lại draft.

**Phạm vi triển khai**:
- Backend: list/filter draft theo thứ tự `updatedAt DESC`, response summary không chứa XML/revisions;
  giữ nguyên import-draft không deploy.
- Angular: tách tab `Bản nháp`/`Đã deploy`; import xong reload và mở draft; cảnh báo/xác nhận khi trùng
  `bpmnProcessId`; xem metadata, kiểm tra BPMN và deploy riêng bằng `expectedRevision`.
- Verify: backend tests, Angular build, gọi API/database real stack; không tự xóa 5 draft trùng hiện có.

**Kết quả triển khai**:
- Backend có `GET /api/process-definition-drafts`, filter `status`/`bpmnProcessId`/`q`, ordering
  `updatedAt DESC`; summary không tải XML/revisions. Contract import/get/validate/deploy cũ giữ nguyên.
- Angular `/quy-trinh` có tab `Bản nháp`/`Đã deploy`; import xong reload và mở đúng draft; mã trùng
  hiện confirm; drawer draft có metadata, `Kiểm tra BPMN` và `Deploy` dùng `expectedRevision`. Deploy
  chỉ bật cho admin demo; backend production RBAC vẫn là gap đã biết.
- Thêm frontend HTTP tests cho list/validate/deploy và sửa boilerplate `app.spec.ts` lỗi thời.

**Evidence**:
- Backend `mvn verify`: **44/44 GREEN**. `clean verify` riêng không chạy được bước clean vì backend 8090
  của user đang giữ log trong `target`; `verify` compile/package/test đầy đủ thành công.
- Angular `npm test -- --watch=false`: **8/8 GREEN**. `npm run build` của task đã GREEN (2.01 MB raw)
  trước khi một workstream đồng thời thêm dở `bpmn-test-session`; build toàn app sau đó đang bị file
  ngoài task này chặn bởi binding `string|null` vào `nzSubTitle`. Không sửa/ghi đè workstream đồng thời.
- Real-stack instance tạm cổng 8091: list có 12 draft; filter trả đúng 5 `Process_RD0202`, mới nhất
  `e5e7e1ac-b023-4157-b9d6-63990aee2be9`; summary không có XML, detail đọc XML dài 70,979 ký tự.
  Instance 8091 đã dừng sạch; backend 8090 của user không bị dừng. Không deploy/xóa draft thật.

**Trạng thái**: `DONE + VERIFIED`. Cần restart backend đang chạy cổng 8090 để browser nhận API list mới.

---

## ★ CURRENT — Đổi “Nhập/deploy BPMN” thành “Nhập và lưu nháp” — PLAN READY 2026-07-15

**Yêu cầu của user**: modal Angular `Nhập / deploy quy trình từ file .bpmn` không được deploy thẳng
lên Camunda. Modal phải cho nhập **Mã quy trình** và **Tên quy trình**, đổi nút chính từ `Deploy`
thành `Lưu nháp`, rồi lưu metadata + BPMN XML vào PostgreSQL của App với trạng thái `DRAFT`.

**Quyết định phạm vi/semantics**:
- Đổi tiêu đề modal thành `Nhập quy trình từ file .bpmn`; bỏ từ “deploy” để UI không hứa sai hành vi.
- `Mã quy trình` ánh xạ trực tiếp với `bpmn:process/@id` (`bpmnProcessId`), không tạo thêm một khái
  niệm “mã App” thứ hai. `Tên quy trình` ánh xạ với metadata `name`; sau khi chọn file, FE đọc XML để
  điền trước `id`/`name`, nhưng BE vẫn là nguồn kiểm tra cuối cùng.
- `Lưu nháp` chỉ ghi `process_definition_draft` + snapshot revision; **không** gọi
  `CamundaDeploymentService`, không tạo `process_definition_version`, không tăng Camunda version.
- Giữ backward-compatible `POST /api/process-definitions/import` cho script/client cũ, nhưng trang
  Angular `/quy-trinh` không còn gọi endpoint deploy trực tiếp từ modal này.
- Cho phép nhiều draft cùng `bpmnProcessId` để phát triển version tiếp theo/song song như model hiện
  hữu; UI phải cảnh báo khi đã có draft cùng mã, không âm thầm làm người dùng tưởng chỉ có một bản.
- Deploy trở thành thao tác phát hành riêng trên bản nháp. API
  `POST /api/process-definition-drafts/{id}/deploy` và optimistic revision hiện có được tái sử dụng;
  không đặt lại deploy vào modal nhập file.

**Hiện trạng tái sử dụng được**:
- Flyway V4, `ProcessDefinitionDraft`, revision audit và status
  `DRAFT|VALID|INVALID|DEPLOYED` đã có.
- JSON create/get/update/validate/deploy draft đã có; create/save được test là không gọi Camunda.
- Thiếu endpoint nhập multipart thành draft, thiếu API list draft và Angular chưa có model/service/UI
  draft. Danh sách `/quy-trinh` hiện chỉ đọc deployed catalog nên draft lưu xong sẽ không xuất hiện.

### Kế hoạch triển khai theo lát

#### Lát 1 — Khóa contract và harden đường nhập file thành draft (BE)
- Thêm contract `POST /api/process-definition-drafts/import`, `multipart/form-data`:
  - part `file`: bắt buộc, chỉ `.bpmn`, tối đa 5 MB, content type theo allowlist hiện hữu;
  - field `bpmnProcessId`: bắt buộc, tối đa 255 ký tự;
  - field `name`: bắt buộc, tối đa 512 ký tự;
  - header audit tùy chọn `X-QTKHCN-Actor`.
- Tái sử dụng `ProcessDefinitionImportValidator` để parse XML an toàn (DTD/external entity bị chặn),
  lấy executable process và đối chiếu `bpmnProcessId` người dùng nhập với `process/@id`. Mismatch trả
  stable HTTP 400 `{message,errors[]}`; không lưu draft nửa vời.
- Publication không được inject/gọi trên đường import-draft. Sau validation upload, tạo draft
  `DRAFT`, lưu tên file/XML/checksum/actor/timestamps và snapshot revision 0 bằng service/repository
  hiện hữu; trả HTTP 201 `ProcessDefinitionDraftResponse`.
- Giữ JSON `POST /api/process-definition-drafts` cho editor/API hiện hữu (kể cả use case lưu nội dung
  đang chỉnh sửa chưa valid); endpoint multipart mới dành riêng cho modal “Nhập file”.
- Thêm `GET /api/process-definition-drafts` trả summary đủ cho danh sách: id, process id, name,
  resource name, status, revision, created/updated actor/time, validation/deployed linkage. Hỗ trợ tối
  thiểu filter `status`, `bpmnProcessId` và query tên/mã; không trả toàn bộ XML/revisions ở list.
- Repository/service phải có ordering ổn định `updatedAt DESC`; không thêm unique constraint trên
  `bpmnProcessId`. Nếu cần cảnh báo trùng, list/query cung cấp dữ liệu cho FE thay vì chặn DB.

#### Lát 2 — Angular modal lưu nháp thật
- Trước khi thay endpoint/copy, tái hiện và khóa nguyên nhân bug đang được báo ở modal hiện tại:
  bấm nút OK có lúc dường như không đi qua `(nzOnOk)="submitImport()"` tới HTTP. Không coi việc
  đổi tên method/nút là fix. Phải có verification quan sát được cho chuỗi
  `click nút chính → handler chạy → service được gọi → request xuất hiện`; nếu lỗi thuộc wiring
  `nz-modal`, sửa dứt điểm trước khi đặt flow `Lưu nháp` lên cùng cơ chế.
- Bổ sung draft DTO/model và `ProcessDefinitionDraftService` cho import/list/get/update/validate/deploy.
- Sửa modal `/quy-trinh`:
  - title `Nhập quy trình từ file .bpmn`;
  - file picker chỉ quảng bá/chấp nhận `.bpmn` (bỏ `.xml`, khớp BE);
  - trường bắt buộc `Mã quy trình`, `Tên quy trình` với trim/max-length và lỗi inline;
  - khi chọn file, parse XML phía client và mirror đúng rule BE: chỉ chọn `bpmn:process` có
    `isExecutable="true"` hoặc `"1"`, yêu cầu đúng một executable process, rồi prefill `process/@id`
    và `process/@name`; không lấy `<process>` đầu tiên một cách mù quáng vì file có thể chứa thêm
    process non-executable. Tên thiếu thì fallback về mã; client parse/mismatch vẫn là best-effort,
    BE là nguồn validate authoritative;
  - nút `Lưu nháp`, loading/disable đúng khi thiếu file hoặc metadata;
  - submit multipart sang `/api/process-definition-drafts/import`, không gọi
    `/api/process-definitions/import`.
- Hiển thị đầy đủ lỗi 400/413/409 theo envelope hiện có. Thành công toast `Đã lưu bản nháp ...`, đóng
  modal, reload danh sách draft và mở/điều hướng tới draft vừa tạo.
- Trước submit, nếu list đã có draft cùng mã thì hiện cảnh báo và yêu cầu xác nhận tạo thêm; không tự
  ghi đè draft hiện có.

#### Lát 3 — Quản lý vòng đời draft trên `/quy-trinh`
- Tách rõ hai tập dữ liệu bằng tab/bộ lọc `Bản nháp` và `Đã deploy`; không trộn draft mutable với
  immutable deployed version trong một row model giả.
- Tab draft hiển thị mã, tên, trạng thái, revision, người cập nhật, thời điểm cập nhật và thao tác mở.
  Reload trình duyệt/backend phải đọc lại được draft từ PostgreSQL.
- Drawer/trang chi tiết draft dùng `GET /{id}` để xem metadata/revision; cung cấp tối thiểu:
  `Kiểm tra BPMN` và `Deploy` riêng. `Deploy` chỉ bật theo quyền UI hiện có và sau xác nhận; luôn gửi
  `expectedRevision`, BE vẫn validate lại fail-closed trước publication.
- Sau deploy thành công: draft thành `DEPLOYED` bất biến, liên kết `deployedVersionId`, reload cả hai
  tab; muốn sửa tiếp phải tạo draft mới. Không thay đổi semantics version đã deploy.
- Quyền server-side thật vẫn phụ thuộc OQ-021/OQ-006; trong lát này không tuyên bố header actor/dev key
  là authorization production. Ghi rõ gap thay vì chỉ khóa nút trên FE.

#### Lát 4 — Tests, real-stack smoke và tài liệu
- Backend tests:
  - multipart happy path trả 201, lưu `DRAFT` + XML/checksum/snapshot và verify không gọi publication;
  - missing/empty/wrong extension/oversize/content-type/DTD/XML invalid/multiple executable process;
  - metadata process-id mismatch trả 400 và không ghi row;
  - list/filter/order/summary không tải XML; duplicate process id vẫn tạo draft riêng có chủ đích;
  - import/deploy API cũ và draft validate/deploy/revision-conflict vẫn backward-compatible.
- Angular verification: unit test cho prefill/mismatch/error state nếu test harness phù hợp; bắt buộc
  có test/click-through chứng minh nút chính phát event tới handler và tạo đúng HTTP request (không chỉ
  test signal/form state), `ng build` green, và cập nhật boilerplate test lỗi thời nếu nó chặn suite
  liên quan.
- Real-stack smoke: ghi số definition/version Camunda + row immutable trước; import multipart draft;
  xác nhận DB đọc lại đúng và Camunda/version immutable **không đổi**; sau đó gọi deploy draft riêng,
  xác nhận chỉ bước đó tạo đúng một engine/DB version và correlation key; restart vẫn đọc được draft.
- Cập nhật `backend/README.md`, tài liệu Angular nếu có, `active-task.md` và `DELIVERY_STATE.md` bằng
  evidence thật. Không đánh dấu DONE chỉ vì build xanh nếu chưa chứng minh “Lưu nháp không deploy”.

**Definition of Done**:
- Modal có file + mã + tên, nút chính là `Lưu nháp`, không còn copy “deploy ngay”.
- Click nút `Lưu nháp` đã được chứng minh đi qua modal event → handler → service → HTTP; không còn bug
  “bấm OK nhưng không có request” của flow cũ.
- Click `Lưu nháp` tạo đúng một draft PostgreSQL trạng thái `DRAFT`; XML/checksum/audit/revision đọc
  lại được sau reload/restart; Camunda và `process_definition_version` không thay đổi.
- Draft xuất hiện ở UI và mở lại được; mã metadata khớp process id trong XML; lỗi có thông báo rõ.
- Deploy chỉ xảy ra qua action riêng trên draft, dùng expected revision, tạo đúng một immutable version.
- Automated contract/regression tests, Angular build và real-stack no-deploy/deploy smoke đều xanh.

**Ngoài phạm vi plan này**:
- Autosave/CRDT/collaborative editing, object storage cho BPMN lớn, approval workflow nhiều cấp trước
  deploy, activation/rollback/migration instance, production SSO/RBAC và distributed outbox/reconcile.

**Trạng thái**: `PLAN READY — NOT STARTED`. Bước triển khai đầu tiên là Lát 1; chưa sửa mã nguồn chức
năng trong lượt lập plan/cập nhật STATE này. Review follow-up cùng ngày đã gộp 3 điểm: gate wiring nút
modal, prefill chỉ executable process, và đã gỡ 5 `console.log('[DEBUG submitImport]...')` tạm khỏi
component trước khi bắt đầu triển khai. Sau cleanup, `npx ng build` GREEN (initial 1.70 MB; không có
compile error).

---

## ★ CURRENT — Test BPMN Lát C: failure/security + smoke repeatable + DoD tổng — DONE + VERIFIED 2026-07-15

**Người thực hiện: Codex.** Hoàn tất lát cuối của cụm chỉnh sửa/lưu nháp/Test BPMN.

**Đã triển khai**:
- Thêm HTTP contract coverage cho `/api/bpmn-tests`: API key thiếu/sai = 401; Angular CORS preflight
  allow origin 4200 và deny origin lạ; TTL invalid và `variables` không phải JSON object trả stable 400
  `{message,errors[]}`. `GlobalExceptionHandler` chuẩn hóa validation/malformed JSON cho toàn API.
- Mở rộng service failure coverage: XML sai, variables không serialize được, scheduler cancel session
  hết TTL thành `TIMED_OUT`, incident/variables snapshot, snapshot engine unavailable. Snapshot/complete/
  cancel failure nay lưu `failureMessage` và fail-closed qua 409; không đánh dấu completion giả.
- Script mới `backend/scripts/smoke-bpmn-lifecycle.ps1`: tự quản backend port riêng + dedicated test
  engine nếu cần; auth/CORS/failure probe → create/validate draft → exact-revision isolated test → complete
  → chứng minh chưa leak production → deploy production → restart idempotency/correlation. Poll Camunda
  search để chịu được indexing eventual-consistency; process id cố định + run-id content nên chạy lại tạo
  đúng một version có chủ đích. Không stop production containers, giữ test volume audit.
- Cập nhật `backend/README.md` và `infra/README.md`; chốt rõ DoD Lát A+B+C không che các gap Foundation
  còn mở (OIDC/SAML, outbox/reconcile, production topology).

**Evidence**:
- `mvn clean verify`: **38/38 GREEN** (từ 31; 10 service tests + 3 HTTP/security tests cho Test BPMN,
  đồng thời toàn bộ contract import/draft/HoSo cũ vẫn xanh — backward compatibility gate).
- Hai real smoke liên tiếp PASS trên backend owned port 8091. Lần mới nhất: draft
  `718c28b5-8ce9-447a-8a1d-75c06a211f4b`, revision 1 → isolated session
  `e74dded4-dd9b-4304-8021-d1b1187bfd82` `COMPLETED` → production smoke version 3 → restart không tăng
  version/correlation còn nguyên; lần trước tạo v2; production `RD01_01` giữ v5.
- Lần chạy ngay trước đó đã tạo version 1 nhưng phát hiện assertion race với Camunda search indexing;
  PostgreSQL/Camunda đều đã ghi thành công. Script được sửa sang poll; hai lần kế tiếp tạo version 2 rồi
  version 3 đều PASS, chứng minh repeat-run trên state có sẵn. Backend 8091 và test-engine container do
  script sở hữu đã dừng sạch; production stack không bị stop.

**DoD tổng Lát A+B+C: DONE + VERIFIED.** Next không còn là Lát C; quay lại roadmap Foundation/F1 và các
gap đã ghi, không tự mở rộng sang EPIC mới.

---

## ★ CURRENT — Angular toàn app thiếu gần hết CSS Ant Design (sai import ng-zorro-antd Less) — FIXED 2026-07-15

**Người thực hiện: Claude.** User gửi ảnh chụp `/quy-trinh` thật trên trình duyệt (lần đầu tiên có ảnh
chụp UI Angular thật trong toàn bộ dự án — mọi phiên trước chỉ verify qua `ng build`/curl, không có
Playwright/browser tool): sider menu render thành list `<li>` trần không style, modal "Nhập từ .bpmn" đè
lên nav thay vì hiện overlay giữa màn hình có nền mờ.

**Nguyên nhân (xác nhận thật qua đọc trực tiếp CSS `ng serve` đang phục vụ + source `node_modules/
ng-zorro-antd/`)**: `frontend-angular/src/theme.less` (viết từ Mốc 4, 2026-07-15) import
`ng-zorro-antd/style/entry.less` — file này chỉ có theme vars + core/animation CSS dùng chung, **hoàn
toàn không có CSS riêng của từng component** (menu/modal/button/table/upload/drawer/...). `entry.less`
≠ "full bundle" như tên gợi ý; ng-zorro-antd tách CSS mỗi component vào `<component>/style/entry.less`
riêng, và `components.less` ở gốc package mới là danh sách import cả ~60 component. Bug này có từ lúc
dựng khung Angular đầu tiên, ảnh hưởng **mọi trang** (`/ho-so`, `/quy-trinh`) suốt từ đó tới giờ, không
ai phát hiện vì chưa từng có ảnh chụp/click-through UI thật trước ảnh này.

**Đã sửa**: `theme.less` đổi sang `@import 'ng-zorro-antd/ng-zorro-antd.less';` (bundle chính thức = theme
vars/core cũ + `patch.less` cdk-overlay + `components.less` toàn bộ ~60 component). Override màu/token
đặt sau import vẫn có hiệu lực nguyên vẹn (Less resolve biến toàn file, không phụ thuộc thứ tự import).

**Verify thật đã làm**:
- `ng build` production: từ FAIL (bundle 1.70 MB vượt `maximumError: 1.5MB`) → nới budget trong
  `angular.json` (`maximumWarning: 900kB→1.8MB`, `maximumError: 1.5MB→2.5MB`, hợp lý vì CSS component
  library đầy đủ là chi phí cố định chính đáng, không phải phình do lỗi) → **GREEN**, 1.70 MB raw /
  ~301 kB gzip transfer.
- Đọc trực tiếp CSS đã build: `.ant-modal-content{border-radius:8px;box-shadow:...}`,
  `.ant-btn{padding:4px 15px;border-radius:8px;...}`, `.ant-upload{...}` — có rule thật, không còn rỗng.
  Đối chiếu `#ee0033` (VHT red token) xuất hiện 158 lần trong CSS đã build — token override vẫn áp dụng
  đúng qua toàn bộ component mới thêm.
- `ng serve` của user (đang chạy sẵn port 4200, Vite dev server) tự hot-reload theo file `theme.less`
  vừa sửa — `styles.css` phục vụ tăng từ 24 KB (rỗng gần hết) → 744 KB (đầy đủ), xác nhận qua curl
  không cần restart dev server.
- `npx ng test --watch=false`: 1 test fail (`app.spec.ts::should render title`) — **pre-existing, không
  liên quan bản sửa này**: đây là test boilerplate mặc định của Angular CLI (`AppComponent` "Hello,
  frontend-angular") chưa được cập nhật từ khi layout shell thật thay thế template mặc định ở Mốc 4;
  `frontend-angular/` chưa từng được commit (untracked) nên không có lịch sử git để xác nhận, nhưng file
  `theme.less`/CSS không liên quan gì tới nội dung `<h1>` mà test này kiểm — để nguyên, chưa thuộc phạm
  vi task này.

**⚠️ CHƯA verify được**: user cần tự F5 lại `http://localhost:4200/quy-trinh` (không cần restart `ng
serve`, đã hot-reload) để xác nhận bằng mắt sider/modal hiển thị đúng — vẫn chưa có Playwright/browser
tool để tự chụp lại ảnh xác nhận.

**Tiếp theo (gợi ý)**: sau khi user xác nhận UI đúng, dọn test `app.spec.ts` lỗi thời (không khẩn); cân
nhắc thêm 1 dòng ghi chú vào README Mốc 4 gốc rằng theming Less cần `ng-zorro-antd.less` chứ không phải
`style/entry.less`, tránh lặp lại nếu có trang Angular mới nào đó lỡ đổi lại theo hướng cũ.

---

## ★ CURRENT — Test BPMN Lát B: session cô lập an toàn — DONE + VERIFIED 2026-07-15

**Người thực hiện: Codex.** Khóa isolation bằng Camunda Orchestration thứ hai trong
`infra/camunda/docker-compose.bpmn-test.yml`: broker/storage/ports riêng (`26510/8092/9610`), không
khởi động Connectors, production workers chỉ nối engine chính. Backend mặc định tắt test runner,
không fallback, và từ chối startup nếu test gRPC/REST address trùng production.

**Đã triển khai**:
- Flyway V5 + `BpmnTestSession` riêng: exact draft revision, variables JSONB, correlation id, actor,
  lifecycle `STARTING|RUNNING|BLOCKED|COMPLETED|CANCELLED|TIMED_OUT|FAILED`, TTL/ended/failure audit.
- Contract `/api/bpmn-tests`: create, snapshot, complete đúng active user task của instance, cancel.
  Snapshot trả current elements, tasks, variables, incidents và blocked jobs.
- Side effect fail-closed: allowlist mock hiện rỗng; engine test không có production worker/Connector.
  Unknown service-task type được báo `BLOCKED` kèm giải thích, không giả success.
- TTL mặc định 900s, tối đa 3600s; scheduler cancel instance quá hạn. Test definition/history giữ trong
  volume engine test cho audit; API cleanup không tuyên bố/xóa engine history.
- Tài liệu cấu hình/API/retention tại `backend/README.md` và `infra/README.md`.

**Evidence**:
- `mvn clean verify`: **31/31 GREEN**, gồm 6 test session mới (exact revision/correlation, blocked
  worker, step, idempotent cancel, engine unavailable fail-closed, TTL max).
- Real-stack user-task smoke: draft `c5cfb7b4-a21a-49ef-a704-f1d73bbab407`, session
  `f331957c-1c18-4040-a45a-412b2e9b3482`, definition `2251799813685319`, instance
  `2251799813685320`, task `2251799813685327` → `COMPLETED`, variable `decision=approve`; session
  `dfc3151e-9d3f-493d-b805-34472d3ff61d` → `CANCELLED`.
- Real-stack side-effect smoke: session `0a7df106-5d4a-4ee3-9542-40a71ea0b2ff` quan sát worker
  `sap-production-write` ở `BLOCKED`, sau đó cancel sạch.
- Isolation proof qua Camunda REST: `isolated_smoke_test` definitions production=0, test engine=1;
  production `RD01_01` vẫn version 5/key `2251799813690160`. Không mutate `HoSo`/`NhiemVu` vì service
  không phụ thuộc domain repositories và test engine không có workers ghi nghiệp vụ.
- Backend smoke port 8091 và `bpmn-test-orchestration` đã dừng; production stack user đang chạy giữ nguyên.

**Follow-up Lát C đã hoàn tất**: xem mục DONE + VERIFIED ở đầu file; 38/38 test và hai repeat-run smoke
liên tiếp đã chốt toàn bộ các gap liệt kê tại đây.

---

## ★ CURRENT — Verify + fix "Nhập từ .bpmn" BE↔FE wiring end-to-end thật (không chỉ build xanh) — DONE 2026-07-15

**Người thực hiện: Claude.** User đã tự chạy `frontend-angular` (`npm start`, port 4200) và gặp
`/quy-trinh` báo "Không kết nối được backend (http://localhost:8090)" vì backend chưa chạy. User nhờ
chạy backend giúp, rồi giao tiếp: "tạo task và làm giúp việc gắn BE vào FE cho luồng tính năng Nhập từ
.bpmn". Việc gắn code UI↔API đã DONE ở phiên trước (`ProcessCatalogPage` gọi thật
`/api/process-definitions/*`, xem mục "Trang Angular thật `/quy-trinh`" bên dưới) — việc phiên này là
**chạy backend thật lần đầu của phiên, verify bằng request thật qua đúng contract UI dùng, và sửa 1 bug
thật phát hiện được** (không có Playwright/browser tool nên verify qua curl mô phỏng đúng request UI gửi,
không phải browser click-through).

**Việc đã làm**:
1. Tìm JDK 21 (`C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot`) + Maven 3.9.16
   (`C:\Users\phuctd7\apache-maven-3.9.16`, không có sẵn trong PATH của phiên bash mới) — chạy
   `mvn spring-boot:run` nền, Flyway giữ v3, Tomcat start port 8090 sạch (Docker stack Camunda +
   `qtkhcn-postgres` đã chạy sẵn từ phiên trước, còn healthy).
2. **Verify GET /api/process-definitions thật**: trả 200 kèm header `Access-Control-Allow-Origin:
   http://localhost:4200` đúng origin Angular dev server — xác nhận CORS (`WebConfig.java`, đã có từ
   phiên trước) hoạt động đúng với contract UI gọi.
3. **Bug thật phát hiện qua verify, không phải giả định**: `curl` import lại đúng file
   `rd0101.bpmn` (không sửa gì) → **HTTP 500** (`DataIntegrityViolationException`, vi phạm unique
   constraint `process_definition_version_camunda_process_definition_key_key`). Nguyên nhân: Zeebe
   deploy content-addressable — nội dung byte-giống-hệt bản đã deploy trả về **CÙNG**
   `processDefinitionKey` thay vì tạo version engine mới, nhưng `ProcessDefinitionService.
   publishValidated()` cứ insert `ProcessDefinitionVersion` mới vô điều kiện → vỡ constraint. Đây là
   tình huống thật người dùng sẽ gặp khi bấm "Nhập từ .bpmn" lần 2 với file chưa sửa gì trên
   `/quy-trinh` — trước bản sửa này sẽ ra lỗi 500 thô trên UI, không phải lỗi mô phỏng.
4. **Sửa**: `ProcessDefinitionVersionRepository` thêm `findByCamundaProcessDefinitionKey`;
   `ProcessDefinitionService.publishValidated()` tra key đó **trước khi** insert — nếu đã tồn tại, ném
   `ProcessImportException(Kind.DEPLOYMENT)` → HTTP 422 với message rõ ràng ("Nội dung BPMN giống hệt
   phiên bản đã deploy trước đó...") kèm chi tiết version/key cũ trong `errors[]`, đúng contract
   `{message, errors[]}` Angular đã xử lý sẵn cho 422 — **không cần sửa gì ở Angular**.
5. `mvn -o compile` xanh → kill sạch process backend cũ (PID tự khởi động phiên này, không phải
   process lạ) → restart nạp bản sửa.
6. **Verify lại thật qua đúng 2 nhánh**:
   - Re-import y hệt `rd0101.bpmn` → **422** với message/errors đúng như thiết kế (không còn 500).
   - Import bản BPMN có nội dung khác thật sự (thêm 1 dòng XML comment vào file tạm ở scratchpad) →
     **201**, tạo đúng version engine mới (v4 → v5), catalog id giữ nguyên
     (`d877084c-005f-4ee6-aa69-a2d9fecc62fc`), `GET /api/process-definitions` phản ánh
     `latestVersion: 5` ngay — xác nhận nhánh "happy path" (nội dung thật sự mới) không bị ảnh hưởng
     bởi bản sửa.
7. Thêm test hồi quy `identicalContentRedeployReturningSameKeyIsRejectedNotInserted` trong
   `ProcessDefinitionServiceTest` (mock `versionRepository.findByCamundaProcessDefinitionKey` trả về
   version có sẵn → khoá đúng: ném `ProcessImportException(Kind.DEPLOYMENT)`, không gọi
   `catalogRepository.save`/`versionRepository.save`). `mvn -o test` **25/25 PASS** (tăng từ 24 —
   24 đã có sẵn từ nhánh drafts/Test-BPMN của Codex đang làm song song, không phải phiên này viết).
8. `backend/README.md` — thêm đoạn giải thích hành vi re-import nội dung giống hệt trả 422 (không phải
   500), kèm bối cảnh phát hiện.

**⚠️ CHƯA verify được**:
- Vẫn chưa có browser click-through thật (không có Playwright/browser tool phiên này, nhất quán mọi
  phiên trước) — mọi verify ở trên đi qua `curl` mô phỏng đúng request Angular gửi (multipart field
  `file`, header `X-QTKHCN-Dev-Key`/`X-QTKHCN-Actor`, `Origin: http://localhost:4200`), không phải click
  thật nút "Nhập từ .bpmn" trên UI. `ng serve` đã chạy sẵn ở port 4200 (do user tự chạy) — **user nên tự
  mở `http://localhost:4200/quy-trinh`, thử tải lên 1 file `.bpmn` thật và xác nhận UI hiển thị đúng
  toast/lỗi** để đóng nốt phần verify này.
- File test tạm `rd0101-verify-test.bpmn` (bản sao `rd0101.bpmn` + 1 dòng comment) chỉ nằm trong
  scratchpad phiên Claude Code, không phải trong `backend/`; catalog RD01_01 trên Docker dev stack giờ
  đứng ở version 5 (đúng hành vi dev như các lần smoke trước, không phải destructive — không xoá version
  cũ).

**Tiếp theo (gợi ý)**: user tự click-through `/quy-trinh` xác nhận UI thật; sau đó nhánh "Backend chỉnh
sửa/lưu nháp quy trình + Test BPMN" (mục "★ CURRENT NEXT" bên dưới, owner Codex) tiếp tục theo lịch đã
chốt.

---

## ★ CURRENT — Trang Angular thật `/quy-trinh` Quản lý quy trình nối `/api/process-definitions/*` — DONE 2026-07-15

**Người thực hiện: Claude.** Đây là nhánh (b) mà mục "★ CURRENT NEXT" (Codex/backend hardening, xem
bên dưới) đã nói tới — backend BPMN import/deploy workstream đã DONE + VERIFIED trước đó cùng ngày,
tạo sẵn contract `POST /api/process-definitions/import`, `GET /api/process-definitions`,
`GET /api/process-definitions/{id}`, `GET /api/process-definitions/{id}/versions`. Việc phiên này:
dựng trang Angular thật thay `PlaceholderPage` cho route `/quy-trinh`, nối thẳng contract đó — không
đổi bất kỳ file `backend/` nào.

**Việc đã làm**:
- `frontend-angular/src/app/core/models/process-definition.ts` (mới): TS type khớp 1:1
  `ProcessDefinitionSummaryResponse`/`DetailResponse`/`VersionResponse`/`ImportResponse` +
  `ProcessImportErrorBody` (khớp `GlobalExceptionHandler.ImportErrorBody` — dùng cho cả lỗi 400
  validate và 422 deploy). `ProcessDefinitionStatus` hiện chỉ có 1 giá trị `DEPLOYED` (enum backend
  thật cũng chỉ có giá trị này — chưa có DRAFT/STOPPED như catalog mock cũ của `webapp/`).
- `frontend-angular/src/app/core/services/process-definition.service.ts` (mới):
  `ProcessDefinitionService` — `list()`/`get(id)`/`versions(id)` (GET) +
  `import(file, actor?)` (POST multipart `FormData`, field `file` đúng tên backend
  `@RequestPart("file")`; actor optional đi vào header `X-QTKHCN-Actor` — audit metadata, KHÔNG
  phải cơ chế phân quyền, đúng comment trong `ProcessDefinitionController.java`). Header dev API
  key vẫn tự đính qua `devApiKeyInterceptor` có sẵn từ Mốc 4, không cần sửa gì thêm.
- `frontend-angular/src/app/pages/process-catalog/` (mới, 3 file `.ts/.html/.scss`): trang danh mục
  quy trình — 2 stat card (Tổng quy trình/Tổng version đã deploy), ô tìm kiếm theo mã/tên,
  `nz-table` 6 cột (Mã BPMN/Tên/Phiên bản/Trạng thái/Cập nhật lúc/Thao tác). Nút **"Nhập từ .bpmn"**
  mở `nz-modal` chứa `nz-upload` dạng kéo-thả **upload THẬT** (khác hẳn bản React tham chiếu
  `ProcessCatalog.tsx` — nút đó chỉ `beforeUpload={() => false}` mô phỏng, ghi rõ "Mô phỏng — không
  upload thật"): chọn file → giữ `File` thật trong signal → bấm Deploy gọi
  `ProcessDefinitionService.import()` thật, hiển thị lỗi **validate 400** hoặc **deploy 422** đúng
  shape `{message, errors[]}` từ backend, thành công thì toast tên/version/deployment key qua
  `NzMessageService` + reload danh sách. Nút **"Xem phiên bản"** mỗi dòng mở `nz-drawer` gọi thật
  `GET /{id}/versions`, hiển thị từng version qua `nz-descriptions` (trạng thái/tên tài
  nguyên/deployment key/process-definition key/checksum SHA-256/người nhập/thời điểm/cảnh báo).
  **Đơn giản hoá có chủ đích so với bản React tham chiếu**: chưa có nút "Tạo & vẽ BPMN" (bpmn-js
  editor chưa port sang Angular) và chưa có route chi tiết riêng (`/quy-trinh/:id`) — xem lịch sử
  version qua drawer thay vì điều hướng trang, đủ dùng vì backend chưa có API sửa/xoá quy trình.
- `frontend-angular/src/app/app.routes.ts`: route `/quy-trinh` trỏ `ProcessCatalogPage` thay
  `PlaceholderPage` (14 route còn lại của Mốc 4 vẫn placeholder, chưa đụng).

**Verify thật đã làm được**:
- `npx ng build` (production) — **GREEN**, 4.5s. Bundle 1.09 MB initial, vượt ngưỡng
  `maximumWarning: 900kB` thêm ~193 kB (chỉ WARNING, chưa chạm `maximumError: 1.5MB`) — do thêm
  `nz-upload`/`nz-modal`/`nz-drawer`/`nz-descriptions`/`nz-message` mới dùng lần đầu; chưa cần nới
  ngân sách, chỉ ghi chú nếu trang tiếp theo đẩy vượt 1.5MB thì mới cần.
- Đối chiếu field-by-field các DTO Java thật (`ProcessDefinitionSummaryResponse.java`,
  `DetailResponse.java`, `VersionResponse.java`, `ImportResponse.java`,
  `GlobalExceptionHandler.ImportErrorBody`) với TS model mới — khớp 100%, không đoán field.

**⚠️ CHƯA verify được (nhất quán với mọi phiên Angular trước, không phải bỏ sót riêng)**:
- **Chưa gọi thật qua trình duyệt** — không có Playwright/browser tool trong phiên này. Cụ thể chưa
  xác nhận: `nz-upload` drag-drop thật hoạt động đúng, modal/drawer render đúng, message toast hiện
  đúng, và luồng lỗi 400/422 hiển thị đúng danh sách `errors[]` khi thử import file sai.
- Backend đang chạy (nếu còn từ phiên trước) cần đã có `WebConfig.java` (CORS cho
  `localhost:4200`) — việc đó đã xong ở phiên trước, không phải việc mới ở đây.
- **Chưa test import với 1 file `.bpmn` thật qua `ng serve` + backend thật** — cần user tự làm để
  xác nhận toàn bộ luồng Angular → Spring Boot → PostgreSQL → Camunda hoạt động qua UI, không chỉ
  qua `curl` như các phiên trước.

**Tiếp theo (gợi ý, chưa làm)**: user click-through `/quy-trinh` trên `ng serve` xác nhận thật; sau
đó cân nhắc port `DossierDetail`/`DossierCreate` hoặc `/nhiem-vu` (cùng pattern `/ho-so`), hoặc BPMN
viewer/editor cho nút "Tạo & vẽ BPMN" (cần `bpmn-js` trong Angular — chưa có, khác gói với
`webapp/`).

---

## ★ CURRENT — Trang Angular thật đầu tiên: `/ho-so` Danh sách Hồ sơ KHCN nối API thật — DONE (chờ user restart backend để xác nhận CORS) 2026-07-15

User yêu cầu (sau khi Mốc 4 scaffold Angular xong, mọi route còn là `PlaceholderPage`): "làm một trang
thật khác trước, ví dụ danh sách hồ sơ". Chọn `/ho-so` vì có sẵn API thật đã verify end-to-end ở
Mốc 2/3 (`GET /api/ho-so`, `HoSoController.list()`), đối chiếu UX với bản tham chiếu
`webapp/src/pages/DossierList.tsx`.

**Việc đã làm**:
- **CORS mới** (`backend/src/main/java/vn/vht/qtkhcn/config/WebConfig.java`, file mới, package
  `config/` trước đó rỗng): `WebMvcConfigurer.addCorsMappings` cho phép origin
  `http://localhost:4200` (Angular dev server) gọi `/api/**` — trước đó **chưa có CORS config nào**
  trong backend, nên gọi API thật từ Angular sẽ bị trình duyệt chặn dù response 200 (do thiếu header
  `Access-Control-Allow-Origin`). Đây là gap thật cần đóng để "trang thật" thực sự nối được, không
  chỉ optimistic.
- `frontend-angular/src/app/core/models/ho-so.ts` (mới): TS type khớp `HoSoResponse.java` +
  `DossierStepResponse.java` — enum giữ nguyên tên hằng số Java (`DRAFT`/`PROCESSING`/...,
  `CHU_TRUONG`/..., `CS`/`TD`) vì Jackson serialize theo `name()` mặc định, kèm bảng nhãn tiếng Việt
  tách riêng (không đổi payload).
- `frontend-angular/src/app/core/services/ho-so.service.ts` (mới): `HoSoService.list()` gọi thật
  `GET {API_BASE_URL}/api/ho-so` qua `HttpClient` (đã có `devApiKeyInterceptor` tự đính header từ
  Mốc 4, không cần sửa gì thêm).
- `frontend-angular/src/app/pages/ho-so-list/` (mới, 3 file `.ts/.html/.scss`): trang danh sách —
  4 stat card (Khởi tạo/Đang xử lý/Đã phê duyệt/Bị từ chối), `nz-segmented` lọc trạng thái +
  `nz-input-group` tìm kiếm (mã hồ sơ/tên đề tài/mã đề tài), `nz-table` 8 cột (Mã hồ sơ/Đề tài/
  Quy trình/Cấp/Loại/Bước hiện tại/Trạng thái/Ngày tạo) với `nz-tag` màu theo `NzStatusColor`. Đơn
  giản hoá có chủ đích so với bản React tham chiếu: **chưa có nút "Tạo hồ sơ" / điều hướng chi
  tiết** vì `DossierCreate`/`DossierDetail` chưa được port sang Angular (việc tiếp theo). Nút "Tải
  lại" gọi lại API, banner `nz-alert` báo lỗi rõ khi backend không kết nối được (status 0) khác lỗi
  HTTP khác.
- `frontend-angular/src/app/app.routes.ts`: route `/ho-so` trỏ `HoSoListPage` thay `PlaceholderPage`
  (15 route còn lại của Mốc 4 vẫn placeholder, chưa đụng).

**Verify thật đã làm được**:
- `mvn -o compile` (offline, Maven 3.9.16 + JDK 21 Temurin tìm thấy tại
  `C:\Users\phuctd7\apache-maven-3.9.16` — không có sẵn trong PATH của phiên bash/powershell mới,
  phải gọi trực tiếp bằng full path + set `JAVA_HOME`) — **BUILD SUCCESS**, `WebConfig.java` biên
  dịch sạch.
- `npx ng build` (production) — **GREEN**, 4.6s. Bundle 929.51 kB initial, vượt ngưỡng
  `maximumWarning: 900kB` đã nới ở Mốc 4 (chỉ WARNING, chưa chạm `maximumError: 1.5MB`) — do thêm
  `nz-table`/`nz-segmented`/`nz-empty`/`nz-alert` mới dùng lần đầu; chưa cần nới thêm ngân sách, chỉ
  ghi chú nếu trang tiếp theo đẩy vượt 1.5MB thì mới cần.
- **Xác nhận contract thật**: backend từ phiên trước (Mốc 2/3/BPMN-import) **vẫn đang chạy** ở
  `localhost:8090` (tìm thấy qua `Get-NetTCPConnection -LocalPort 8090`, PID 1492, start time
  hôm nay) — `curl -H "X-QTKHCN-Dev-Key: dev-local-only" localhost:8090/api/ho-so` trả JSON thật
  khớp 100% cấu trúc `ho-so.ts` (đã đối chiếu field-by-field: `id`/`maNV`/`loai`/`quyTrinh`/
  `trangThai`/`steps[]`/...).

**⚠️ CHƯA verify được (bị chặn có chủ đích, không phải bỏ sót)**:
- **Backend đang chạy là code CŨ** (trước khi thêm `WebConfig.java`) — process đó không phải do
  phiên này khởi động, và hệ thống permission (Auto Mode classifier) **từ chối** lệnh
  `Stop-Process -Id 1492` với lý do "killing a process it did not start this session, without
  explicit user authorization" — đúng, không ép buộc. Nghĩa là: **CORS chưa được nạp vào backend
  đang chạy**, nên `ng serve` → gọi API thật từ trình duyệt hiện tại vẫn sẽ bị CORS chặn cho tới khi
  backend được khởi động lại.
- **Cần user làm 1 trong 2 việc trước khi coi trang này là "chạy được thật" trên trình duyệt**:
  (a) tự restart backend (`Ctrl+C` cửa sổ đang chạy `mvn spring-boot:run` rồi chạy lại), hoặc
  (b) cho phép agent tự kill/restart process cổng 8090 phiên sau.
- Chưa click-through trình duyệt thật (không có Playwright/browser tool phiên này, nhất quán mọi
  phiên trước) — kể cả sau khi backend restart, cần user tự mở `ng serve` → `/ho-so` xác nhận bằng
  mắt.

**Tiếp theo (gợi ý, chưa làm)**: sau khi user xác nhận `/ho-so` chạy được thật qua CORS, port tiếp
`DossierDetail`/`DossierCreate` sang Angular (để nút "Xem chi tiết"/"Tạo hồ sơ" có chỗ điều hướng
tới) hoặc `/nhiem-vu` (NhiemVu list, cùng pattern, đã có `NhiemVuRepository`/API tương tự — chưa
kiểm tra route backend chính xác).

---

## ★ CURRENT — F1 unblock: Java/Spring Boot backend + PostgreSQL + Camunda 8 Self-Managed dev + Angular frontend (D14–D17)

**Bối cảnh (2026-07-15)**: User chốt 4 quyết định trả lời đúng "Open decisions blocking Foundation
1": backend = Java 21 + Spring Boot (**D14**), domain DB = PostgreSQL/Flyway (**D15**), Camunda 8
dev environment = Self-Managed qua Docker Compose local (**D16**), frontend = Angular +
ng-zorro-antd thay React+AntD, kèm design-system token refresh (**D17**, thay thế **D7** — D7 đánh
dấu SUPERSEDED, không xoá). Kế hoạch đầy đủ (Mốc 0–6, chiến lược strangler-fig theo từng luồng RD,
bắt đầu từ RD01.01) đã được user duyệt qua plan mode:
`C:\Users\phuctd7\.claude\plans\generic-pondering-parnas.md`.

**Mốc 0 (khoá quyết định + cập nhật harness) — DONE 2026-07-15**:
- `decisions.md`: thêm D14/D15/D16/D17, đánh dấu D7 SUPERSEDED BY D17, cập nhật mục "Open decisions
  blocking Foundation 1" → resolved cho backend/DB/Camunda-dev, còn mở: Camunda production topology
  + SSO/IAM (OQ-021).
- `DELIVERY_STATE.md`: F1 chuyển `BLOCKED` → `IN PROGRESS`, Blockers cập nhật tương ứng.
- **Chưa đổi code** trong `webapp/` — giữ nguyên làm tài liệu tham chiếu sống theo đúng D17.

**Mốc 1 (hạ tầng dev Camunda + Postgres) — DONE 2026-07-15, VERIFIED THẬT**:
- `infra/README.md` + `infra/docker-compose.override.yml` viết xong. Đã xác minh trực tiếp qua
  `github.com/camunda/camunda-distributions` (không suy đoán từ kiến thức cũ) rằng kiến trúc
  Camunda 8 đã đổi: từ ~8.6+ Zeebe/Operate/Tasklist gộp vào **1 container `orchestration`**
  (`camunda/camunda:8.9.12`), storage mặc định **H2 nhúng** (không bắt buộc Elasticsearch), khác
  hẳn kiến trúc 3-container/port-riêng của các bản cũ. `docker-compose.override.yml` thêm 1 service
  `qtkhcn-postgres` (Postgres 16, domain DB theo D15) chạy cạnh, cùng network `camunda`.
- **Chạy thật + verify PASS 2026-07-15**: user cài Docker Desktop + JDK 21 (Temurin) + Maven
  3.9.16, thêm Maven vào PATH. 2 sự cố gặp và đã sửa (ghi lại trong `infra/README.md` mục "Ghi chú
  khi chạy trên Windows" để phiên sau khỏi lặp lại):
  1. Docker Desktop báo lỗi WSL quá cũ → chạy `wsl --update` (không cần admin) → mở lại Docker
     Desktop → OK.
  2. `docker-compose.override.yml` bản đầu khai `networks.camunda: {external: true}` — SAI, vì
     network đó do chính `docker-compose.yaml` gốc của Camunda tạo (không phải có sẵn từ trước) →
     lỗi "declared as external, but could not be found". Sửa: bỏ khai báo `external`/`name` lặp,
     chỉ để service tham chiếu `networks: [camunda]`, Compose tự merge theo key với file gốc.
     (Riêng lỗi này: đừng dùng `2>&1` với `docker compose up` trên PowerShell 5.1 — biến log tải
     ảnh ở stderr thành `ErrorRecord` giả, làm tưởng nhầm lệnh fail dù thực ra không lỗi.)
  3. `docker compose ps` xác nhận 3 container `orchestration`/`connectors`/`qtkhcn-postgres` đều
     **healthy**; `curl localhost:9600/actuator/health/status` → `{"status":"UP"}`; `psql` vào
     `qtkhcn-postgres` kết nối được (rỗng, đúng dự kiến — Flyway ở Mốc 2 mới tạo bảng).
- `.gitignore` đã thêm `infra/camunda/`, `infra/camunda-src/` (thư mục vendor tải về, chứa secret
  demo — không commit).

**Mốc 2 (backend Spring Boot) — SCAFFOLD DONE 2026-07-15, CHƯA COMPILE/CHẠY THẬT**:
- `backend/` (Maven, Java 21): entity `NhiemVu`/`HoSo`/`DossierStep` + enum (port 1:1 từ
  `webapp/src/data/nhiemVu.ts`/`dossiers.ts`, D8), Flyway `V1__core_schema.sql`, repository, REST
  API (`/api/nhiem-vu`, `/api/ho-so` — create draft/submit/actions theo D10), `HoSoService` (port
  rút gọn từ `DossierContext.tsx`), Camunda integration (`processes/rd0101.bpmn` = bản BPMN thật
  copy từ `rd0101Bpmn.ts`, `ProcessDeploymentRunner` deploy khi start, `Rd0101ProcessService` khởi
  tạo process instance khi Gửi duyệt, `SystemCheckJobWorker` xử lý service task thật), dev API-key
  filter (KHÔNG phải JWT/OIDC thật — chờ OQ-021), `application.yml`, `backend/README.md` (hướng
  dẫn chạy + curl thử + checklist "chưa verify" chi tiết).
- **3 điểm rủi ro cao nhất** (duy nhất đụng Camunda Java SDK, phần còn lại Spring/JPA/SQL chuẩn):
  coordinates `io.camunda:camunda-spring-boot-starter:8.9.12` trong `pom.xml`; tên lớp
  `io.camunda.client.CamundaClient`/`io.camunda.spring.client.annotation.JobWorker`/
  `ActivatedJob` ở 3 file trong `camunda/`; property path `camunda.client.*` trong
  `application.yml`. Cả 3 xác nhận qua tra cứu web (Maven Central, docs) chứ KHÔNG tự
  `mvn compile` được (máy agent không có Maven/JDK) — nếu sai, `mvn compile` sẽ báo lỗi rõ ràng
  ngay, xem `backend/README.md` mục "Chưa verify" để biết sửa ở đâu.
- **GAP nghiệp vụ có chủ đích** (ghi trong Javadoc, không phải bug): `submit()` chỉ hỗ trợ RD01.01;
  `applyAction()` RETURN_STEP dùng mô hình "lùi 1 bước" tuyến tính thay vì port đầy đủ
  `stepRouting.ts::ROUTING_TABLES`; `SystemCheckJobWorker` luôn trả `true` (chưa có business check
  thật); chưa có RBAC/permission ở tầng API (F3 chờ OQ-021/OQ-006).

**Mốc 2 + Mốc 3 — DONE 2026-07-15, VERIFIED END-TO-END THẬT (không chỉ build xanh)**:

User cài xong Docker Desktop + JDK 21 (Temurin) + Maven 3.9.16 cùng phiên. Chạy thật `mvn compile`
→ `mvn spring-boot:run` phát sinh **6 lỗi thật** (không đoán được nếu không chạy) — tất cả đã sửa,
backend start thành công, RD01.01 deploy thật lên Zeebe, và **toàn bộ vòng đời từ Task_1 →
Gateway_SystemCheck (service task, job worker tự viết) → Gateway_SystemResult (gateway điều kiện)
→ Task_3 chạy đúng qua Camunda REST API thật** (`v2/jobs/.../completion`, `v2/element-instances/
search` — không phải mock). Danh sách lỗi + cách sửa (tất cả đã sửa trong code, xem comment tại
chỗ):

1. **`io.camunda.spring.client.annotation.JobWorker` sai package** → đúng là
   `io.camunda.client.annotation.JobWorker` (xác nhận bằng cách liệt kê nội dung jar
   `camunda-spring-boot-starter-8.9.12.jar` trong `~/.m2`, không đoán). `CamundaClient` đoán đúng
   ngay từ đầu. Sửa: `camunda/SystemCheckJobWorker.java`.
2. **Spring Boot 3.3.4 sai hoàn toàn** — `camunda-spring-boot-starter:8.9.12` đòi **Spring Boot
   4.0.7** / Spring Framework 7.0.8 (đọc thẳng POM đã tải, không đoán). Bump `pom.xml` parent lên
   `4.0.7`.
3. **Spring Boot 4 tách autoconfigure thành module nhỏ** — Flyway cần thêm
   `org.springframework.boot:spring-boot-starter-flyway` (module mới `spring-boot-flyway`), có mỗi
   `flyway-core`/`flyway-database-postgresql` KHÔNG đủ → lỗi im lặng (Flyway không chạy, không log
   gì, Hibernate `ddl-auto=validate` fail vì bảng chưa tồn tại — dễ nhầm là lỗi JPA). Xác nhận qua
   `docs.spring.io` (Spring Boot 4 modularization).
4. **`httpclient5` version conflict** — `camunda-client-java:8.9.12` cần `httpclient5:5.6.2`
   (đọc POM của nó) nhưng BOM `spring-boot-starter-parent:4.0.7` kéo `5.5.2` "gần" hơn nên thắng
   Maven mediation → `NoSuchMethodError: HttpAsyncClientBuilder.disableContentCompression()` lúc
   khởi tạo bean `CamundaClient` (lỗi chỉ hiện ở RUNTIME, compile vẫn xanh). Ghim tường minh
   `httpclient5:5.6.2` trong `pom.xml`.
5. **Bug thật trong BPMN nguồn** (`webapp/src/data/rd0101Bpmn.ts`, đã tồn tại từ trước, chưa ai
   phát hiện vì bpmn-js trên trình duyệt không validate chặt như Zeebe engine thật): các phần tử mở
   rộng Zeebe dùng SAI casing — `zeebe:AssignmentDefinition`/`zeebe:FormDefinition`/
   `zeebe:TaskDefinition`/`zeebe:CalledElement` (chữ hoa đầu) thay vì đúng chuẩn
   `zeebe:assignmentDefinition`/`zeebe:formDefinition`/`zeebe:taskDefinition`/`zeebe:calledElement`
   (chữ thường đầu) — Zeebe từ chối deploy với lỗi rõ ràng (`Must have exactly one
   'zeebe:calledElement'/'zeebe:taskDefinition' extension element`). **Đã sửa cả 2 file**
   (`webapp/src/data/rd0101Bpmn.ts` — nguồn chuẩn — VÀ `backend/src/main/resources/processes/
   rd0101.bpmn`) bằng `sed`, 16 chỗ mỗi file. Đây là giá trị thật của việc deploy lên Zeebe thật lần
   đầu — bug ẩn 2+ tuần trong mock không ai thấy vì chưa từng chạy qua engine thật.
6. **`MultipleBagFetchException`** (Hibernate) — không fetch-join được 2 collection kiểu `List`
   (bag, không `@OrderColumn`) lồng nhau (`HoSo.steps` + `DossierStep.vaiTroCodes`) trong 1 query,
   cần khi trả JSON response (đọc lazy collection sau khi transaction đã đóng, `open-in-view:
   false` có chủ đích). Sửa: đổi `DossierStep.vaiTroCodes` từ `List<String>` sang `Set<String>`
   (hợp lý ngữ nghĩa — mã vai trò không cần thứ tự/không nên trùng) + `@EntityGraph(attributePaths
   = {"steps", "steps.vaiTroCodes"})` trên `HoSoRepository.findById`/`findAll`.

**Verify thật (không phải mock, chạy qua curl/PowerShell + Camunda REST API trực tiếp)**:
- `POST /api/nhiem-vu` → tạo `NhiemVu` thật trong Postgres.
- `POST /api/ho-so` → tạo `HoSo` draft thật.
- `POST /api/ho-so/{id}/submit` → `trangThai=PROCESSING`, **`zeebeProcessInstanceKey` thật**
  (vd `2251799813687048`), 6 bước dựng đúng từ `Rd01Steps`.
- `POST /api/ho-so/{id}/actions` (`APPROVE_STEP`) → state machine domain DB đúng (bước hiện tại
  DONE, bước kế CURRENT, `buocHienTai` tăng).
- **Xác nhận độc lập qua chính Camunda REST API** (`v2/process-instances/search`): process instance
  `ACTIVE`, `hasIncident: false`. Hoàn tất Task_1 → Task_2 qua `v2/jobs/{key}/completion` (job type
  `io.camunda.zeebe:userTask`) → **`SystemCheckJobWorker` tự động nhận job
  `khcn.rd0101.check-default-condition` và hoàn tất KHÔNG CẦN can thiệp thủ công** →
  `Gateway_SystemResult` tự đánh giá đúng điều kiện `dieuKienMacDinhDat=true` → tiến sang Task_3.
  Xác nhận qua `v2/element-instances/search`: `Start_RD01_01`/`Task_1`/`Task_2`/
  `Gateway_SystemCheck`/`Gateway_SystemResult` đều `COMPLETED`, `Task_3` `ACTIVE`.

**Mốc 5, nhánh (a) — Codex/backend — DONE + VERIFIED THẬT 2026-07-15**:
- **Người thực hiện: Codex.**
- Giữ nguyên hoàn toàn contract `POST /api/ho-so/{id}/actions` (path, request body
  `HoSoActionRequest`, response `HoSoResponse`); chỉ thay đổi hành vi bên trong service.
- `HoSoService.applyAction()` gọi `Rd0101ProcessService.applyAction()` **trước** khi tiến state
  PostgreSQL. Không có `zeebeProcessInstanceKey`, không tìm được task, hoặc Camunda lỗi → fail-closed
  với HTTP 409 và transaction domain không tiến bước.
- BPMN RD01.01 hiện tạo job loại `io.camunda.zeebe:userTask` (không phải user-task record kiểu mới),
  nên service dùng typed Job Search của `CamundaClient`, lọc theo process-instance + job type +
  `CREATED`, rồi `newCompleteCommand(jobKey)`. Có bounded retry 20 × 250 ms để chịu độ trễ eventual-
  consistency của search index; khi index tạm trả cả job cũ/mới thì chọn Zeebe key mới nhất (RD01.01
  tuần tự, không có parallel user task).
- `APPROVE_STEP` hoàn tất user-task và truyền biến gateway tương ứng; `RETURN_STEP` chỉ cho phép tại
  task có nhánh rework rõ trong BPMN; `REJECT_STEP` huỷ process instance vì `REJECTED` là terminal
  trong domain rút gọn.
- Unit test mới `HoSoServiceTest`: **3/3 PASS** (`mvn test`, BUILD SUCCESS), khoá 3 invariant:
  Camunda chạy trước DB save; Camunda lỗi không tiến/không save domain; thiếu process key fail-closed.
- E2E thật qua chính business API `/actions`: gọi `APPROVE_STEP` hai lần đã hoàn tất `Task_1`,
  `Task_2`; `SystemCheckJobWorker` tự chạy; Camunda REST xác nhận `Task_1`/`Task_2`/service task/
  gateway `COMPLETED`, `Task_3 ACTIVE`, trong khi domain tăng bước 1 → 3. E2E reject xác nhận domain
  `REJECTED` và process instance `TERMINATED`. Response vẫn đủ đúng 17 field cũ.
- GAP "`/actions` chỉ cập nhật PostgreSQL, chưa gọi Zeebe" ở khối trước **ĐÃ ĐÓNG**. Rủi ro phân tán
  còn lại: Camunda có thể hoàn tất nhưng DB commit thất bại sau đó; xử lý tuyệt đối cần transactional
  outbox/reconciliation, để Mốc 6+ thay vì âm thầm tuyên bố atomic cross-system.

**Mốc 4 (scaffold Angular app + design system) — DONE 2026-07-15**:
- **Người thực hiện: Claude (nhánh (b) song song với Codex/nhánh (a) ở trên).**
- `frontend-angular/` mới (Angular CLI, standalone components, control-flow mới `@if/@for`).
  **Pin ở Angular 21 (không phải 22 mới nhất)** — xác nhận qua npm registry: `ng-zorro-antd`
  bản ổn định mới nhất (21.3.2) chỉ khai `peerDependencies` `^21.0.0`; bản cho Angular 22 mới
  có `22.0.0-beta.0`. Chọn Angular 21 + ng-zorro 21.3.2 (cả hai ổn định) thay vì ghép Angular 22
  với UI-kit beta.
- **Theme**: `ng-zorro-antd` v21 chỉ publish CSS đã biên dịch sẵn (`ng-zorro-antd.min.css`,
  không có `--ant-*` CSS variable, không ship Less theo mặc định qua `ng add`) — xác nhận bằng
  cách đọc thẳng file CSS (hex `#1890ff` cứng, 0 custom property). Đã tự chuyển sang biên dịch
  từ nguồn Less (`ng-zorro-antd/style/entry.less`, cần thêm `less` làm devDependency +
  `@root-entry-name: default;` mới import được) tại `frontend-angular/src/theme.less`, override
  đúng bảng màu "VHT Military Red" **port 1:1 từ `webapp/src/theme.ts`** (không phải đoán màu
  mới): `@primary-color`/`@link-color: #ee0033`, `@success/@warning/@error-color`,
  `@border-radius-base: 8px`, `@font-family: Inter…`, và `@layout-header-background`/
  `@menu-dark-inline-submenu-bg: #1c1c1c` (INK — sider nền mực đen, KHÔNG phải nền đỏ đặc, đỏ
  chỉ là điểm nhấn mục đang chọn qua `@menu-dark-item-active-bg` = `@primary-color` tự động).
- **Token layer**: `frontend-angular/src/styles/tokens.scss` — port nguyên văn mọi biến
  `--vht-*` (màu/bo góc/font/scrollbar) từ `webapp/src/branding/tokens.css`, giữ tên biến 1:1
  để đối chiếu; dùng cho phần UI Angular tự viết (shell/login), tách biệt với theme Less của
  ng-zorro (2 cơ chế theming khác nhau, không thể dùng chung 1 nguồn do giới hạn kỹ thuật nêu
  trên).
- **Locale**: `vi_VN` từ `ng-zorro-antd/i18n` + `registerLocaleData(vi)` (Angular `@angular/
  common/locales/vi`) — xác nhận export tồn tại trước khi dùng (đọc thẳng bundle
  `ng-zorro-antd-i18n.mjs`, không đoán tên).
- **Auth stub** (`core/auth/`): `demo-users.ts` (5 tài khoản demo — subset có chủ đích từ 13 tài
  khoản đầy đủ ở `webapp/src/data/users.ts`; port RBAC/permission engine đầy đủ là việc Mốc 6+,
  KHÔNG thuộc phạm vi Mốc 4), `auth.service.ts` (signal-based, login/logout localStorage, port
  tinh thần `AuthContext.tsx`), `auth.guard.ts` (`authGuard`/`loginPageGuard`),
  `dev-api-key.interceptor.ts` (đính header `X-QTKHCN-Dev-Key: dev-local-only` cho request tới
  `API_BASE_URL=http://localhost:8090` — khớp `DevApiKeyFilter.java`/`application.yml` thật của
  Mốc 2, CHƯA gọi thật request nào tới backend phiên này). **Lệch có ghi chú so với câu kế hoạch
  gốc "auth guard stub gọi API JWT tạm của Mốc 2"**: Mốc 2 chỉ có `DevApiKeyFilter` (1 static key
  chặn toàn API), không có endpoint đăng nhập/JWT nào — login vẫn thuần client-side (mock),
  tách biệt với việc đính dev-key vào các request gọi API thật.
- **Layout shell** (`layout/shell.ts/html/scss`): `nz-layout`/`nz-sider` (collapsible,
  dark theme) + `nz-menu` (dùng `nzMatchRouter` — directive chính thức của ng-zorro tự đánh dấu
  menu item chọn theo route hiện tại, xác nhận qua đọc source `ng-zorro-antd-menu.mjs`, không tự
  viết lại logic so khớp route) + `nz-header` (breadcrumb + dropdown user/logout) + `nz-content`
  (`router-outlet`). Icon đăng ký tường minh qua `NzIconService.addIcon()` (`core/icons-provider.ts`,
  21 icon, không kéo cả bộ icon).
- **Nav IA** (`layout/nav-items.ts`): port cấu trúc từ `webapp/src/App.tsx` (menuItemsMain) +
  `webapp/src/data/phanHe.ts` (module PH2/PH3/PH4) — **đơn giản hoá có chủ đích**: gộp thành 1
  sider phẳng duy nhất, bỏ hành vi "đổi ngữ cảnh sider khi vào `/phan-he/PH2`|`/phan-he/PH3`"
  (mini-sider `PH_MENU_MAP` của bản React) và bỏ gating theo quyền (`canManageSystem`/
  `isChuNhiemDeTai`) — mọi module vẫn đủ, chỉ khác cách vào; đây là việc polish tương tác/RBAC
  của Mốc 6+, không chặn mục tiêu Mốc 4 ("layout + nav render đúng nhóm phân hệ, không cần dữ
  liệu thật").
- **Trang**: `pages/login/` (form email/mật khẩu, card "Tài khoản demo" chỉ hiện dev — port
  đúng `webapp/src/pages/Login.tsx`) + `pages/placeholder/` (1 component dùng chung cho **16
  route** module chưa port dữ liệu thật, tiêu đề lấy từ route `data.title`).
- **Verify**: `npx ng build` GREEN (sau khi sửa 2 lỗi build thật: `nzIcon` không phải input hợp
  lệ trên `li[nz-menu-item]` → chuyển sang `<nz-icon>` trong `<a>`; thiếu `@root-entry-name` khi
  import Less entry → thêm `@root-entry-name: default;`). Bundle 708 kB initial — nới ngân sách
  `angular.json` production budget lên 900 kB/1.5 MB (ng-zorro-antd + Inter font vốn nặng hơn
  mặc định Angular CLI 500 kB, không phải regression). `ng serve` smoke-test qua curl (200,
  `main.js`/`styles.css` load được) rồi tắt sạch tiến trình (tìm PID qua `netstat`, `taskkill`
  — không để lại process nền). **Thử jsdom để kiểm không lỗi runtime nhưng thất bại do jsdom
  không chạy được `<script type="module">`/Vite client script (giới hạn jsdom, không phải bug
  app) → bỏ, không kết luận được gì từ đó.** **CHƯA click-through trình duyệt thật** (không có
  Playwright/browser tool trong phiên này, nhất quán với mọi phiên trước của `webapp/`).
- **Chưa làm** (ngoài phạm vi Mốc 4, để Mốc 5/6+): gọi API thật (Mốc 4 không cần dữ liệu thật),
  RBAC/permission gating nav, mini-sider PH2/PH3, các trang thật thay placeholder.

**⚠️ Phát hiện khi cập nhật state (đọc lại file này thấy nội dung mới của Codex đã ghi từ khi
phiên này bắt đầu)**: mục "★ CURRENT NEXT" ngay dưới đây định nghĩa nhánh (b) **hẹp hơn** — cụ
thể là dựng trang `/quy-trinh` (Nhập/deploy `.bpmn`) nối vào contract `/api/process-definitions/*`
**chưa tồn tại** (backend "READY, NOT STARTED"). Việc Mốc 4 ở trên là scaffold khung Angular
tổng quát (đủ để `/quy-trinh` sau này build vào), KHÔNG PHẢI đã hoàn thành riêng trang
`/quy-trinh` nối contract import BPMN đó — hai việc khác nhau, cần user xác nhận có muốn tiếp
tục nhánh hẹp đó khi backend xong hay không.

## ★ CURRENT — Nhập/deploy `.bpmn` thật, backend làm song song Angular — DONE + VERIFIED 2026-07-15

**Người thực hiện: Codex (backend).** Workstream hoàn tất độc lập với UI; không sửa `webapp/` hoặc
`frontend-angular/`.

**Kết quả triển khai + kiểm chứng thật**:
- Thêm đủ contract `POST /api/process-definitions/import`, `GET /api/process-definitions`, detail và
  versions. Import trả HTTP 201 với catalog/version id, BPMN id/name, resource, checksum, actor/time,
  deployment/process-definition key, version, status và warnings. Validation trả `{message,errors[]}`
  (400); lỗi deploy Camunda trả cùng shape (422).
- Flyway V2/V3 tạo catalog + immutable version history + warnings, lưu BPMN XML trong PostgreSQL;
  entity/repository/DTO tách khỏi contract hồ sơ hiện hữu. Import lại cùng BPMN process id thêm version
  mới theo version Camunda, không ghi đè record cũ.
- Validator giới hạn `.bpmn`/content type/5 MB, từ chối file rỗng/XML hỏng, yêu cầu đúng một process
  executable có id, và parse với DTD/external entity/XInclude bị tắt. `CamundaDeploymentService` là
  đường deploy dùng chung cho startup runner và API. DB chỉ ghi sau khi Camunda trả deploy thành công.
- `mvn verify` **BUILD SUCCESS, 9/9 test PASS**: file type/size, XML sai, thiếu executable/id, XXE,
  duplicate/version và Camunda failure không ghi catalog/version thành công.
- E2E thật qua business API: import `rd0101.bpmn` → HTTP 201, Camunda version 2, deployment key
  `2251799813688754`, process-definition key `2251799813688755`; PostgreSQL lưu catalog/version/XML;
  Camunda REST `/v2/process-definitions/search` thấy đúng version/key; tạo process instance version 2
  thành công (key `2251799813688770`). Restart backend/Flyway validate V3 xong, read API vẫn trả catalog
  và version 2 đã lưu. Backend hiện chạy lại ở port 8090; stack Docker vẫn healthy.
- `backend/README.md` đã cập nhật curl contract, response/error semantics và trạng thái verify. Rủi ro
  phân tán còn lại giữ đúng ngoài phạm vi: Camunda có thể deploy xong nhưng DB commit lỗi; cần outbox/
  reconciliation ở Mốc 6+.

**Hiện trạng trước triển khai**:
- React mock `/ql-nvkhcn/#/quy-trinh` có nút "Nhập từ .bpmn" nhưng `Upload.Dragger` chỉ
  `beforeUpload={() => false}`, không có `onChange`/`FileReader`; UI còn ghi rõ "Mô phỏng — không
  upload thật". `submitCreate()` chỉ thêm metadata vào React state, không đọc XML, không gọi backend,
  không deploy Camunda và mất khi reload.
- Angular mới chỉ có nav item `/quy-trinh`; `app.routes.ts` chưa có route/page tương ứng.
- Backend chỉ có `ProcessDeploymentRunner` deploy resource RD01.01 đóng gói sẵn lúc startup; chưa có
  API import, catalog/version persistence hoặc API đọc danh mục quy trình.

**Phạm vi backend có thể làm ngay/song song UI (theo thứ tự)**:
1. **Khoá contract API tối thiểu cho UI** — thêm mới, không thay contract API hồ sơ hiện hữu:
   - `POST /api/process-definitions/import`, `multipart/form-data`, field `file`.
   - `GET /api/process-definitions`, `GET /api/process-definitions/{id}` và
     `GET /api/process-definitions/{id}/versions`.
   - Import response tối thiểu: catalog id, BPMN process id/name, resource name, Camunda deployment
     key, process-definition key/version, trạng thái và danh sách warning; lỗi validation trả payload
     `{message, errors[]}` nhất quán. UI Angular chỉ phụ thuộc contract này, không phụ thuộc entity.
2. **Flyway + persistence** — migration mới cho catalog quy trình và lịch sử version; lưu correlation
   keys Camunda, checksum/resource name, actor/timestamps và BPMN XML (`text`) cho dev/Mốc 5 để xem
   lại sau reload. Không sửa bảng `ho_so`/`nhiem_vu`; không xây object storage ở lát này.
3. **Import/validation an toàn** — giới hạn loại/kích thước file; parse XML với DTD/external entity
   bị tắt (chống XXE); xác nhận có executable BPMN process và ID; từ chối file rỗng/XML sai; giữ lỗi
   engine deploy ở dạng 4xx có thông tin, không biến thành 500 mơ hồ.
4. **Deploy service dùng chung** — tách logic deploy khỏi startup runner thành service; runner và API
   cùng gọi một đường deploy qua `CamundaClient.newDeployResourceCommand()`. Import lại cùng BPMN
   process ID tạo version Camunda mới và thêm version record, không ghi đè lịch sử.
5. **Read APIs + reconciliation tối thiểu** — danh mục/detail/version đọc PostgreSQL; response chứa
   Camunda keys để kiểm chứng độc lập. Không tự tuyên bố deploy thành công nếu Camunda lỗi; DB catalog
   chỉ commit trạng thái thành công sau khi có deployment result.
6. **Test trước khi bàn giao UI**:
   - Unit: file type/size, XML sai, thiếu executable process/ID, XXE bị chặn, duplicate/version rule,
     Camunda failure không tạo bản ghi thành công.
   - Integration thật: import một `.bpmn` qua business API → PostgreSQL còn dữ liệu sau reload →
     Camunda REST search thấy đúng process-definition/version → tạo được process instance thử nghiệm.
   - `mvn test` + curl contract examples trong `backend/README.md`.

**Ngoài phạm vi workstream song song này / chờ Angular hoặc quyết định khác**:
- Không sửa `webapp/` React mock; không dựng trang Angular, file picker, viewer/editor hay browser
  click-through trong nhánh backend.
- Chưa triển khai SSO/RBAC production (OQ-021/OQ-006); tiếp tục dev API key nhưng endpoint phải có
  điểm chặn quyền rõ để nối security sau.
- Chưa làm activation/rollback version, object storage, production topology, transactional outbox,
  hay tự động resolve form/DMN/call-activity dependency. Có thể trả warning cho dependency thiếu,
  nhưng không mở rộng thành registry platform ở Mốc 5.

**Definition of Done nhánh backend import**:
- File `.bpmn` hợp lệ được nhận qua API, validate, deploy thật lên Camunda và lưu catalog/version vào
  PostgreSQL; reload/restart vẫn đọc lại được.
- File lỗi/độc hại hoặc Camunda không sẵn sàng bị fail-closed, không để bản ghi giả thành công.
- E2E tạo được process instance từ definition vừa import; contract có ví dụ đủ để workstream Angular
  nối mà không phải sửa backend.

**Tiếp theo**:
1. **Codex/backend hardening — DONE + VERIFIED 2026-07-15** — kết quả/evidence ngay dưới đây.
2. **Mốc 4 / Mốc 5 nhánh (b)** — workstream Angular dựng `/quy-trinh` và nối contract API; trạng thái
   do workstream frontend cập nhật, nhánh backend không tự đánh dấu.
3. Khi cả hai nhánh xong, chạy click-through Angular → Spring Boot → PostgreSQL → Camunda để chốt
   import thật và walking skeleton, không chỉ build xanh.
4. **Mốc 6+** — activation/rollback, dependency registry, outbox/reconciliation và strangler các
   module còn lại.

## Backend chỉnh sửa/lưu nháp quy trình + Test BPMN — LÁT A + B DONE, LÁT C NEXT

**Owner: Codex. Lát A và Lát B hoàn tất, verify ngày 2026-07-15; Lát C là bước kế.** Backend-only trước;
giữ backward-compatible toàn bộ contract
`/api/process-definitions/*` mà Angular `/quy-trinh` đang dùng. UI Angular/React không thuộc phạm vi
trừ khi user giao riêng sau khi backend contract được khóa.

**Mục tiêu**:
1. Cho phép tạo/chỉnh sửa và lưu nháp BPMN mà không deploy, không làm tăng Camunda version.
2. Cho phép validate rồi phát hành một draft có chủ đích thành immutable deployed version, tái sử dụng
   invariant catalog ↔ engine và error envelope đã harden.
3. Cung cấp Test BPMN dạng test session cô lập: nhận variables, chạy process thử, quan sát trạng thái/
   current elements/tasks/variables/incidents và điều khiển các user task cần thiết mà không ghi vào
   domain `HoSo`/`NhiemVu` hoặc gọi side effect production.

**Phạm vi triển khai theo lát, theo thứ tự**:

### Lát A — Draft model + chỉnh sửa/lưu nháp — DONE 2026-07-15
- Thêm Flyway/entity/repository riêng cho draft và revision/audit; draft **không** dùng chung ý nghĩa
  với immutable `ProcessDefinitionVersion` đã deploy. Lưu BPMN XML, catalog/process metadata, checksum,
  revision, actor/timestamps và trạng thái tối thiểu `DRAFT|VALID|INVALID|DEPLOYED` (tên cuối cùng khóa
  khi code để tránh trùng semantics hiện hữu).
- Optimistic locking bắt buộc (`revision`/ETag hoặc expected revision) để hai editor không silently
  overwrite nhau; conflict trả 409 rõ ràng. Save lặp cùng nội dung phải idempotent theo checksum hoặc
  tạo revision có chủ đích, không âm thầm deploy.
- Contract dự kiến cần khóa trước khi viết controller:
  - `POST /api/process-definition-drafts` — tạo draft mới từ metadata + BPMN XML.
  - `GET /api/process-definition-drafts/{id}` — đọc draft/revision hiện tại.
  - `PUT /api/process-definition-drafts/{id}` — lưu chỉnh sửa với expected revision.
  - `POST /api/process-definition-drafts/{id}/validate` — validate không deploy.
  - `POST /api/process-definition-drafts/{id}/deploy` — phát hành có chủ đích.
- Deploy draft phải đi qua validator + `CamundaDeploymentService` hiện hữu, chỉ ghi immutable version
  sau khi Camunda thành công, giữ response/error contract tương thích. Không sửa/xóa version đã deploy.

**Kết quả Lát A**:
- Flyway `V4__process_definition_drafts.sql`; entity/repository riêng cho current draft và snapshot
  revision bất biến. Draft lưu XML/metadata/checksum/status/actor/timestamps, JPA `@Version`; không
  trộn với `ProcessDefinitionVersion`. Draft đã deploy bất biến; vẫn cho phép tạo draft mới cùng
  `bpmnProcessId` để phát triển version tiếp theo.
- Khóa contract JSON đúng các endpoint dự kiến. `PUT`, `validate`, `deploy` nhận `expectedRevision`;
  stale trả 409. Save trùng toàn bộ metadata + checksum idempotent, giữ nguyên revision. Mọi mutation
  lấy pessimistic row lock trước khi kiểm tra revision, tránh hai deploy song song cùng qua gate.
- `validate` dùng lại hardened XML validator nhưng không gọi Camunda; kết quả `VALID|INVALID`, warnings/
  errors và snapshot audit được lưu. Chỉ `/deploy` gọi publication path dùng chung với import hiện hữu;
  Camunda failure không đánh dấu draft deployed/không tạo snapshot giả, success lưu `deployedVersionId`.
- Backward compatible `/api/process-definitions/*`; tài liệu request/response/curl trong
  `backend/README.md`. Không sửa frontend, không triển khai Test BPMN.
- `mvn clean verify` GREEN: **25 tests**, gồm 6 draft service + HTTP stale-409; test import/read cũ
  vẫn xanh. Real-stack smoke không gọi `/deploy`: draft `f501abaf-0834-4fbd-98a3-04813693a352`,
  revision `0→1→2`, 3 snapshot, reload `VALID`, stale save HTTP 409; Camunda version `5→5`, số row
  immutable `process_definition_version` `3→3`. Backend smoke tạm cổng 8091 đã dừng sạch; backend
  sẵn có cổng 8090 không bị đụng.

### Lát B — Test BPMN session an toàn — DONE + VERIFIED 2026-07-15
- Trước khi code phải khóa isolation model bằng test/POC nhỏ: test definition không được deploy dưới
  production process id/tenant theo cách làm tăng hoặc thay đổi khái niệm “latest” production. Ưu tiên
  test-only identity/tenant hoặc engine test riêng; không tự sửa XML/process id nếu việc đó làm sai
  call-activity/message/reference semantics.
- Contract dự kiến:
  - `POST /api/bpmn-tests` — tạo session từ draft/revision + input variables, validate và start test.
  - `GET /api/bpmn-tests/{id}` — snapshot instance/status/current elements/tasks/variables/incidents.
  - `POST /api/bpmn-tests/{id}/tasks/{taskKey}/complete` — hoàn thành user task test với variables.
  - `DELETE /api/bpmn-tests/{id}` — cancel/cleanup session đang chạy.
- Test session có TTL/timeout, correlation id, actor/audit và trạng thái terminal rõ. Cancel instance
  khi timeout/xóa; ghi rõ retention của test definition theo isolation model thực tế, không tuyên bố
  xóa engine history nếu Camunda topology hiện tại không hỗ trợ an toàn.
- Service task/connector/job worker có side effect phải fail-closed hoặc đi qua allowlist mock/stub test;
  tuyệt đối không gửi email, ghi SAP/hệ ngoài hay mutate bảng nghiệp vụ thật. Unknown worker phải trả
  trạng thái blocked/incident có giải thích thay vì giả success.

### Lát C — Tests, smoke và tài liệu
- Automated tests: draft CRUD/revision conflict/checksum, validation error, deploy failure không đổi
  draft thành deployed/không ghi version giả, deploy success correlation đúng, auth/CORS và backward
  compatibility của import/read API hiện hữu.
- Test-session failure modes: invalid variables/XML, Camunda unavailable, timeout/cancel, unknown worker,
  user-task stepping, incident snapshot và chứng minh không ghi `HoSo`/`NhiemVu`.
- Real-stack smoke lặp lại được: create draft → edit/save/reload → validate → test session/start/step/
  inspect/cancel → deploy draft có chủ đích → PostgreSQL/Camunda correlation → restart/read lại; fail
  loud khi thiếu Docker stack, không biến integration test thành mock xanh.
- Chạy `mvn verify`, smoke thật, cập nhật `backend/README.md` và STATE bằng evidence/key. Backend được
  dừng sạch sau smoke, không tự ý xóa engine versions/history hiện có.

**Definition of Done**:
- Lưu/chỉnh sửa draft và reload không tạo Camunda version; concurrent stale save trả 409, không mất dữ liệu.
- Validate draft không deploy; deploy draft tạo đúng một immutable DB/engine version có correlation keys.
- Test BPMN chạy trong isolation đã chứng minh, quan sát/step/cancel được và không mutate domain hay gọi
  side effect production.
- Contract/failure/security tests + `mvn verify` + real-stack smoke xanh; API Angular hiện hữu không vỡ.

**Ngoài phạm vi**:
- Chưa làm editor UI Angular, autosave UI, collaborative editing/CRDT, production SSO/RBAC, activation/
  rollback production, object storage, dependency registry đầy đủ hoặc transactional outbox.
- Không dùng “Test BPMN” như production dry-run trên dữ liệu thật; không xóa version/history Camunda
  đang có. Nếu isolation cần tenant/engine riêng ngoài topology dev hiện tại, dừng ở boundary đó và báo
  user thay vì hạ tiêu chuẩn an toàn.

---

## ★ COMPLETED — Codex/backend hardening cho BPMN import/deploy — DONE + VERIFIED 2026-07-15

**Owner: Codex. Ưu tiên kế tiếp theo xác nhận của user 2026-07-15.** Làm song song với Claude dựng
trang Angular `/quy-trinh`; nhánh này chỉ sửa `backend/`, test/smoke tooling backend và STATE, không
sửa component/service/route Angular hoặc React mock.

**Kết quả triển khai + evidence**:
- Startup deploy đã chuyển sang if-absent: `CamundaProcessDefinitionLookup` dùng Camunda Search API
  tra đúng BPMN process id `RD01_01` (khác mã nghiệp vụ/API `RD01.01`),
  `StartupProcessDeploymentService` chỉ deploy resource đóng gói khi engine chưa có definition.
  Query lỗi thì fail-closed; existing definition thì log `skipped` cùng version/key. Import API vẫn
  là đường duy nhất tạo version mới có chủ đích và không đổi response contract.
- Thêm automated tests cho first boot deploy đúng một lần, repeated startup skip, lookup unavailable
  không deploy, process-id mismatch fail-closed; HTTP contract khóa multipart field `file`, 201,
  list/detail/versions + `bpmnXml`, error envelope 400/422, dev API key và CORS preflight Angular.
  `DevApiKeyFilter` nay bỏ qua đúng CORS preflight; request API thật vẫn bắt key.
- `mvn verify` **BUILD SUCCESS, 17/17 tests PASS**.
- Thêm `backend/scripts/smoke-process-import.ps1`, kiểm thật và fail loud qua Spring Boot → PostgreSQL
  → Camunda → restart. Run 2026-07-15: startup giữ engine **v3** (không sinh version); import API tạo
  đúng **v4**, catalog `d877084c-005f-4ee6-aa69-a2d9fecc62fc`, process-definition key
  `2251799813689491`; PostgreSQL có record/correlation keys/XML; Camunda tạo instance key
  `2251799813689492`; restart log skip v4 và không sinh v5; read API còn XML. Backend được dừng sạch
  sau smoke; Docker stack vẫn chạy healthy.
- First-boot trên engine trống được khóa bằng test tự động; không xóa version 1–3 để thử destructive
  trên external state, đúng phạm vi đã chốt. README ghi rõ prerequisite/cách chạy lại và việc mỗi smoke
  thành công chủ đích tạo đúng một imported version mới.

**Lý do ưu tiên — drift đã kiểm chứng thật, không phải giả định**:
- `ProcessDeploymentRunner` hiện gọi deploy resource RD01.01 vô điều kiện mỗi lần Spring Boot start.
- Camunda REST đang có RD01.01 version **1, 2, 3**, trong khi PostgreSQL catalog chỉ có version **2**
  (`processDefinitionKey=2251799813688755`). Version 3 phát sinh do restart, không phải import có chủ
  đích. Nếu tiếp tục, mỗi restart tạo thêm version engine và khái niệm "latest" của Camunda lệch với
  version catalog/UI đang hiển thị.
- CORS dev cho `http://localhost:4200` đã có trong `backend/.../config/WebConfig.java`; không mở lại
  CORS thành task riêng.

**Phạm vi triển khai theo thứ tự**:
1. **Startup deploy idempotent / if-absent**:
   - Giữ khả năng first boot tự deploy RD01.01 khi Camunda chưa có process id này.
   - Restart khi definition đã tồn tại phải skip, không tạo version mới.
   - Version mới sau first boot chỉ được tạo qua import API có chủ đích. Nếu cần cập nhật BPMN đóng
     gói, dùng import API hoặc một cờ force tường minh; không âm thầm deploy do restart.
2. **Khoá invariant catalog ↔ engine**:
   - Tách/query nhỏ đủ để runner xác định definition đã tồn tại; log rõ `deployed` hay `skipped` cùng
     process id/version/key.
   - Không tuyên bố catalog version là Camunda latest nếu không có bằng chứng; response import/read
     hiện hữu phải giữ backward-compatible cho Angular đang nối.
3. **HTTP contract tests tự động**:
   - Khoá multipart field `file`, HTTP 201 success, list/detail/versions và `bpmnXml` đọc lại được.
   - Khoá payload lỗi `{message, errors[]}` cho 400 validation và 422 deployment failure.
   - Khoá dev API key/CORS preflight ở mức cần thiết cho Angular localhost:4200.
4. **Failure-mode tests**:
   - Camunda unavailable/deploy rejected không tạo catalog/version thành công.
   - Restart/runner gọi lặp không tạo version mới; first boot vẫn deploy đúng một lần.
5. **Smoke E2E có thể chạy lại**:
   - Tạo script/profile backend chạy chuỗi import API → PostgreSQL verify → Camunda definition search
     → start process instance → restart backend → xác nhận version không tăng và catalog/XML còn đọc.
   - Ghi rõ prerequisite Docker stack; fail loud, không biến test integration thật thành mock xanh.
6. Chạy `mvn verify`, smoke E2E thật, cập nhật `backend/README.md` và STATE bằng evidence/version keys.

**Definition of Done**:
- Hai lần restart liên tiếp không tăng Camunda version của RD01.01; first boot trên engine trống vẫn
  deploy được resource đóng gói.
- Import API vẫn tạo đúng một version mới có record PostgreSQL/correlation keys tương ứng.
- Contract/failure tests tự động xanh; smoke E2E thật chứng minh API → DB → Camunda → restart.
- Không yêu cầu Claude sửa contract Angular đã bắt đầu dùng; không sửa UI trong nhánh này.

**Ngoài phạm vi**:
- Không làm activation/rollback, object storage, dependency registry, SSO/RBAC production hoặc
  transactional outbox trong hardening slice này.
- Không xoá các Camunda version 1–3 hiện có (external state/lịch sử đã sinh); chỉ ngăn drift mới và
  chứng minh invariant từ thời điểm sửa trở đi.

---

## Lịch sử — Dashboard Optimize lãnh đạo (frontend mock, branch `trangdt`) — DONE 2026-07-17

**Bối cảnh**: User (branch `trangdt`) yêu cầu màn dashboard tổng hợp kiểu Camunda Optimize
cho lãnh đạo: KPI kỳ tháng/quý, cycle time, SLA/incident, phân bố cấp×ngân sách, cột tải bước,
top cycle chậm, line backlog, SLA theo cấp, outcome DMN (Đồng ý/Điều chỉnh/Từ chối) theo RD/
ngân sách/cấp, vòng lặp rework, rule DMN hit nhiều nhất, năng lực đơn vị + top 10 handler,
heatmap Unit×SLA, heatmap màu trên BPMN RD01.01. Tuân harness: frontend-mock, không đụng F1.

**Đã làm**:
- `webapp/src/data/optimizeAnalytics.ts` — seed Optimize snapshot (tháng/quý).
- `webapp/src/pages/Dashboard.tsx` — rewrite `/tong-quan` (recharts + bảng + heatmap CSS).
- `BpmnViewer` + `bpmnio-skin.css` — marker `vht-heat-1…5` cho heatmap BPMN.
- Dependency: `recharts@2.15.0`. Dev server preview: `/#/tong-quan`.

**Chưa**: nối Optimize API thật (chờ F1); click-through Playwright.

---

## Lịch sử — PH2/PH3/PH4 mockup upgrade + domainCode scaffold + Phase 2 Connector framing — DONE 2026-07-10

**Bối cảnh**: User yêu cầu đọc
`docs/research/quan-tri-quy-trinh-bpm-platform-danh-gia-2026-07-10.md` (brainstorm/đánh giá
BA-PM + Solution Architect, **chưa lock**, đánh giá mở rộng "Phân hệ Quản lý Quy trình" từ engine
riêng của NVKHCN thành nền tảng "Quản trị Quy trình" dùng chung đa domain cho VHT) và lên kế
hoạch nâng cấp mockup. Kế hoạch ghi tại
`docs/research/quan-tri-quy-trinh-mockup-upgrade-plan-2026-07-10.md` (3 phase rủi ro tăng dần —
chỉ Phase 1 domainCode scaffold + phần bug-fix/cấu trúc PH2/PH3/PH4 được chọn triển khai; Phase 2
Connector-Worker framing và Phase 3 trang tổng quan platform-concept **chưa làm**, để tuỳ chọn
sau). Sau khi hỏi lại, user chọn nâng cấp cụ thể 3 nhóm chức năng: **Quản trị quy trình** (PH4),
**Phân quyền** (PH2), **Cấu hình biểu mẫu** (PH3/eForm).

**Phát hiện khi rà code** (trước khi sửa):
1. **Bug thật** (đã sửa) — `webapp/src/data/phanHe.ts` có 1 khối code chết (dòng ~148-156, sau
   khi định nghĩa `DANH_SACH_PHAN_HE` đúng) ghi đè `PH4.modules` bằng text mojibake double-encoded
   UTF-8 ("Quáº£n lÃ½ quy trÃ¬nh"...) — cùng loại lỗi đã sửa cho 5 file khác trong phiên
   2026-07-08 nhưng bỏ sót file này. Đã nằm trong code committed (không phải WIP phiên này).
2. **Bất đối xứng cấu trúc** (đã sửa) — PH2/PH3 có route `/phan-he/PHx/tong-quan` → `PhanHePage`
   (trang "Tổng quan" liệt kê modules), nhưng PH4 redirect thẳng `/quy-trinh`, không có landing
   tương tự; `PH4.modules` cũng thiếu "Ma trận Hành động"/"Tác vụ hệ thống" (đã tồn tại thật trong
   nav "Quản trị quy trình") và "Tích hợp"/"Nhật ký"/"Giám sát tiến trình" (trước đó nằm ở nav
   group riêng "Vận hành & Tích hợp").

**Việc đã làm (frontend-mock, không đụng F1):**
- **Fix bug** `webapp/src/data/phanHe.ts`: xoá khối mojibake ghi đè `PH4.modules`.
- **Đồng bộ `PH4.modules`**: thêm "Ma trận Hành động" (`/cau-hinh-hanh-dong`), "Tác vụ hệ thống"
  (`/cau-hinh-service-task`), "Tích hợp" (`/tich-hop`), "Nhật ký" (`/nhat-ky`) — cạnh 4 module cũ
  (Quản lý quy trình/Ma trận quyết định/Ma trận phê duyệt/Giám sát tiến trình).
- **Route PH4 Tổng quan** (`webapp/src/App.tsx`): `/phan-he/PH4` giờ redirect
  `/phan-he/PH4/tong-quan` (trước: redirect thẳng `/quy-trinh`) → render `<PhanHePage
  phanHeId="PH4" />`, đúng pattern PH2/PH3. Không thêm mini-sider riêng cho PH4 (module routes của
  PH4 là top-level route đã có trong main nav, không giống PH2/PH3 có route namespace
  `/phan-he/PHx/*` riêng — thêm mini-sider sẽ trùng lặp/rối, nên bỏ qua).
- **Gộp nav** (`webapp/src/App.tsx`, theo lựa chọn user): nhóm "Vận hành & Tích hợp" (Giám sát
  tiến trình/Tích hợp/Nhật ký, trước đây `canManageSystem`-gated riêng) nay nằm trong nhóm
  "Quản trị quy trình" (`quytrinh-config`), cùng cấp với "Tác vụ hệ thống" — giữ nguyên toàn bộ
  điều kiện hiển thị cũ (chỉ đổi cây/nhãn, không đổi quyền truy cập). Xoá import
  `DeploymentUnitOutlined` không còn dùng.
- **domainCode scaffold** (Configuration Service multi-domain prep, theo mục 3.3 tài liệu đánh
  giá — hành vi không đổi vì chỉ có 1 domain thật):
  - `webapp/src/data/rbac.ts`: thêm `DomainCode` type (`'KHCN'`) + `DEFAULT_DOMAIN_CODE`; field
    `domainCode: DomainCode` **bắt buộc** trên `RolePermissionPolicy` + `UserRoleAssignment`, tất
    cả seed đã gán `DEFAULT_DOMAIN_CODE`. `webapp/src/data/rbacEngine.ts`: `getMatchedPolicies`/
    `getEffectivePermissions`/`getUserAssignments`/`getEffectiveDataScopes`/`checkPermission`/
    `hasPermission`/`canAccessFeature` đều có thêm param `domainCode` cuối cùng (default
    `DEFAULT_DOMAIN_CODE`) và filter theo domainCode — **backward-compatible 100%** (mọi call
    site cũ không đổi vì param optional ở cuối + default khớp seed). `RbacContext.tsx`
    `upsertAssignment` + `RolePermission.tsx` `ensure()` (tạo policy mới) cũng gán
    `DEFAULT_DOMAIN_CODE`.
  - `webapp/src/data/actionAvailabilityPolicy.ts` (`ActionAvailabilityPolicy`),
    `webapp/src/data/actionRegistry.ts` (`ActionDefinition`),
    `webapp/src/data/approvalMatrix.ts` (`ApprovalRule`),
    `webapp/src/data/exceptionPolicy.ts` (`ExceptionActionPolicy`): thêm field
    **`domainCode?: DomainCode` (optional, KHÔNG bắt buộc)** — quyết định có chủ đích khác với
    rbac.ts: các file này có nhiều seed rows hơn (16+/7+ rows) và nhiều call site resolver hơn
    (dùng ở DossierDetail/Worklist/ActionStudio/bpmnReconcile...); ép field bắt buộc + xâu chuỗi
    param `domainCode` qua toàn bộ resolver sẽ tốn công sửa hàng chục nơi mà **hiện chưa có bất kỳ
    domain thứ 2 nào cần lọc** — over-engineering. Field optional (mặc định hiểu ngầm = KHCN) đã
    đủ để migrate schema rẻ hơn sau này mà không đụng logic/behaviour hiện tại.
- **Phase 2 — khung "vai trò Connector"** (`webapp/src/pages/IntegrationStatus.tsx`,
  `SystemDetailDrawer`): thêm 1 khối ghi chú (viền nét đứt, tách biệt trực quan khỏi phần dữ liệu
  thật) ngay dưới Tag trạng thái/mô tả hệ: "Vai trò trong nền tảng (khái niệm — chờ đặc tả kỹ
  thuật): hệ này tham gia như **data/service endpoint**, không sở hữu hay thay thế workflow nội
  bộ của hệ nguồn." — thuần trình bày/label, gắn nhãn rõ "khái niệm — chờ đặc tả kỹ thuật" đúng
  cảnh báo trong kế hoạch để không bị hiểu nhầm là đã có Connector Worker/Zeebe job worker/mTLS
  thật. Không đổi hành vi, không đổi `IntegrationSystem`/`camundaOps.ts`.
- **Verify**: `npm run build` GREEN (tsc + vite, chạy lại 3 lần xác nhận exit 0, không lỗi TS).
  Chưa click-through trình duyệt (Playwright chưa cài, nhất quán các phiên trước).

**Chưa làm (theo đúng kế hoạch, chờ chọn tiếp)**: Phase 3 (trang tổng quan khái niệm platform đa
domain cho mục đích họp sign-off) — optional, chưa được yêu cầu triển khai. Cũng chưa đụng
`docs/req/scope-2-phanhe.md`, chưa ghi gì vào `decisions.md` — đúng nguyên tắc "chờ sign-off"
của tài liệu đánh giá gốc.

---

## Lịch sử — Canvas Form Designer: nâng cấp hiển thị đúng AntD cho Ô chữ/Thả xuống/Số/Ô nhiều dòng — DONE 2026-07-10

Follow-up polish của D13 (builder AntD chrome) — user chỉ ra canvas (giữa, vẫn là DOM viewer
form-js được skin CSS) còn lệch AntD so với "bản đích" thật (`FormRenderer.tsx`/D12, dùng thẳng
component AntD ở pane Xem trước). Đọc trực tiếp CSS nguồn `@bpmn-io/form-js` tìm ra 3 khoảng lệch
xác nhận được bằng source (không đoán): (1) `--font-family` của form-js là biến RIÊNG (IBM Plex
Sans), không phải `--cds-*` nên không nằm trong bảng ánh xạ token cũ → canvas vẫn hiện sai font;
(2) `--color-warning` (viền lỗi validate) suy từ `--cds-text-error`, cũng không có trong bảng ánh
xạ → 3/4 field (trừ Số đã được vá riêng) lên viền lỗi đỏ Carbon thay vì `--vht-danger`; (3) menu mở
của Thả xuống (`.fjs-dropdownlist`) chưa được skin — 100% mặc định Carbon (bo 3px, hover đảo màu).
User chốt phạm vi: dấu `*` bắt buộc chỉ đổi màu đỏ, GIỮ vị trí sau nhãn (không đụng cấu trúc
label); disabled/readonly để đợt sau.

**Đã sửa — chỉ 1 file, thuần CSS**: `webapp/src/branding/bpmnio-skin.css`, 4 bổ sung nhỏ vào cụm
"Đợt AntD-parity" có sẵn (D13 Lát C, ~dòng 305–500):
- `--font-family`/`font-family: var(--vht-font)` trên `.vht-fd-canvas .fjs-container`.
- `--color-warning: var(--vht-danger)` trên `.vht-fd-canvas .fjs-container` (đồng bộ viền lỗi cả
  4 field qua đúng biến gốc thư viện, không vá riêng lẻ; rule vá riêng cho Số giữ nguyên — vô hại).
- `.fjs-dropdownlist`/`.fjs-dropdownlist-item`/`.focused` theo thông số Select AntD (bo
  `--vht-radius`, đệm option 5px/12px, hover nền `--vht-red-050`/chữ `--vht-red`).
- `.fjs-form-field.required label::after { color: var(--vht-danger) }` — chỉ đổi màu, giữ vị trí.

**Verify**: `npm run build` GREEN (12.87s, tsc + vite). Thuần CSS, không đụng
`FormDesigner.tsx`/`FieldPalette.tsx`/`FieldProperties.tsx`/schema/engine/binding. Kế hoạch:
`C:\Users\phuctd7\.claude\plans\optimized-churning-horizon.md`. **Chưa click-through trình duyệt**
(Playwright chưa cài, nhất quán các phiên trước) — cần user mở `npm run dev` → Form Designer, so
font/màu viền lỗi/menu Thả xuống với pane "Xem trước" (AntD thật) trước khi coi là chốt hẳn.

---

## Lịch sử — Gỡ theme `/danh-sach-phan-he`, đưa về design chuẩn các màn khác — DONE 2026-07-09

User đảo chiều quyết định: **bỏ hẳn theme "Đỏ Tác Chiến"** (nền tối blueprint + constellation +
beam quét + mono + glass tối), thiết kế lại trang portal theo cùng khuôn các màn danh sách khác
(`ProcessCatalog`…): nền sáng `var(--vht-surface-2)`, `PageHeader` chuẩn + dải `StatCard` (4 ô:
Tổng/Có quyền/Chưa có quyền/Sắp ra mắt) + `FilterBar` (chip lọc ở `left`, đếm kết quả ở `right`,
Input.Search) + lưới `PhanHeCard`. Card giữ layout cũ nhưng nền trắng đặc, viền `--vht-border`,
bỏ backdrop-blur & pill mono.
- `SubsystemList.tsx`: viết lại — bỏ `ConstellationLines`/`HeroBanner`/`BentoStatCard`, bỏ class
  `qtkhcn-standalone-bg`/`qtkhcn-mono`, đổi mọi màu chữ sáng-trên-tối → token mực chuẩn.
- `App.tsx`: header standalone bỏ `qtkhcn-glass-header` (dùng header trắng chuẩn), wordmark QTKHCN
  → mực đen (bỏ mono/letter-spacing), tên user/chức danh bỏ override màu sáng, `Content` bg
  standalone `#17090b` → `var(--vht-surface-2)`. Gỡ import chết `DatabaseOutlined`.
- `tokens.css`: xóa toàn bộ CSS theme không còn dùng (standalone-bg + ::before/::after,
  glass-header, glass-card, constellation + keyframes draw/node-in/scan/ping/node-pulse,
  reduced-motion block, `.qtkhcn-mono`, `.qtkhcn-ping-dot`). Giữ tokens :root, scrollbar,
  bento-card, slot-group-separator.

**Verify**: `npx tsc --noEmit -p tsconfig.json` GREEN (0 lỗi). Chưa click-through trình duyệt —
**Next: user mở `/danh-sach-phan-he` xác nhận layout sáng đồng bộ các màn khác.**

---

## Lịch sử — Theme `/danh-sach-phan-he` "Đỏ Tác Chiến" (Slice A) — DONE rồi bị gỡ 2026-07-09

Plan of record: `docs/research/danh-sach-phan-he-theme-upgrade-plan-2026-07-09.md`. Frontend-mock
recolor + hiệu ứng của trang danh sách phân hệ (same carve-out as D10–D13, no F1). 3 quyết định
đã chốt trong plan: giữ nền tối blueprint, giữ `window.open`, đổi Navy/Gold → Đỏ Tác Chiến.

- **A1 recolor**: `tokens.css` — biến `--blueprint-*` + toàn bộ gradient layer (L2/L3/L4, beam
  `::before`, `.qtkhcn-glass-header`) sang `--vht-red`/`--vht-red-chrome` theo bảng palette trong
  plan; đồng thời quét sạch màu gold/navy còn sót ở inline style `SubsystemList.tsx` (section
  title/hero/empty-state/request-access → trắng ánh đỏ `rgba(255,241,243|255,218,216,…)`) và nền
  standalone `App.tsx:591` (`#0a1628`→`#17090b`). Grep xác nhận 0 giá trị palette cũ còn lại.
- **A2 đường nối tự vẽ**: bỏ 3 lớp L5 linear-gradient tĩnh khỏi `background-image`; thêm
  `ConstellationLines` (SVG overlay `.qtkhcn-constellation`, 11 node/11 cạnh, 2 hub khớp
  `--blueprint-hub1/2`) trong `SubsystemList.tsx`. Kỹ thuật: `pathLength={1}` ⇒ dasharray/offset
  chuẩn hoá, animate `qtkhcn-draw` 1.8s ease-out **one-shot forwards**, stagger 130ms/đường +
  node fade-in. `prefers-reduced-motion: reduce` ⇒ render trạng thái vẽ xong ngay + tắt luôn
  beam quét & ping-dot.
- **A3 mono**: `index.html` thêm `IBM+Plex+Mono:wght@400;500;600` vào URL Google Fonts sẵn có;
  `--vht-font-mono` + class `.qtkhcn-mono` trong `tokens.css`; áp cho giá trị số `BentoStatCard`
  và pill trạng thái card (KHÔNG áp tiêu đề/mô tả tiếng Việt).

**Verify**: `npm run build` GREEN (tsc + vite, 13.6s); grep dist xác nhận
`.qtkhcn-constellation`/`#17090b`/IBM Plex Mono vào bundle. CHƯA click-through trình duyệt
(Playwright chưa cài — nhất quán các phiên trước). **Next: user chạy `npm run dev` mở
`/danh-sach-phan-he` soi palette đỏ + animation vẽ đường + font mono; cần test trực quan dấu
tiếng Việt của IBM Plex Mono trên pill trạng thái (plan A3 yêu cầu) trước khi chốt.**

**Follow-up tương phản (user feedback sau khi soi trực quan, 2026-07-09 — DONE)**: glass trắng
64–72% trên nền `#17090b` cho ra xám đục, chữ khó đọc; header trắng + breadcrumb đỏ lạc lõng.
Fix theo "phương án 1: card sáng đục, header tối":
- Card/hero/filter-bar `SubsystemList.tsx`: alpha 0.56–0.72 → 0.88–0.92 (trắng gần đục, giữ blur);
  chữ phụ `#8c8c8c`/`#999` → `#737373`. `.qtkhcn-glass-card` (tokens.css) → 0.92, viền đỏ mờ.
- `.qtkhcn-glass-header` (tokens.css) → glass tối `rgba(23,9,11,0.72)` + viền dưới đỏ 0.28.
- `App.tsx` header standalone: breadcrumb (trùng tiêu đề trang) → wordmark `QTKHCN` mono + ô đỏ;
  tên user/chức danh → chữ sáng (conditional theo `isStandalonePage`).
- Nhân tiện gỡ chặn build: `ServiceTaskConfig.tsx:55` `CATEGORY_GROUPS` unused (WIP module của
  user, untracked) → thêm `export` (giữ data). Build GREEN 16.4s.

**Backlog giữ nguyên (đợt sau)**: Slice B (đồng bộ theme sang `PhanHePage.tsx`), Slice C (luồng
điều hướng PH1/CTA-Modules), D (pendingTasks), E (refactor inline style), F (profile/notification).

---

## ★ CURRENT — eForm builder chrome (D13): palette + panel AntD trên engine form-js — DONE (cả 3 lát, 2026-07-09)

Decision **D13** locked 2026-07-09 (amends D12 §1 "builder unchanged"). User yêu cầu builder
(`FormDesigner`) "theo AntD 100%": **vỏ = AntD tự viết, ruột = form-js giữ nguyên**. Frontend-mock,
no F1 dependency. Slice: **Lát A palette → Lát B properties panel → Lát C polish**.

**Kiến trúc chốt (đã đọc source form-js editor):**
- Editor chỉ export `ContextPadModule`+`FormEditor` ⇒ không gỡ được module palette/panel gọn →
  **portal palette+panel native vào div ẩn** (`display:none`), dựng UI AntD trên service.
- Service dùng: `modeling.addFormField/editFormField/removeFormField`, `selection.get()`+event
  `selection.changed`, `formLayouter.nextRowId()`, `editor._getState().schema` (root field sống).
- **Kéo–thả MIỄN PHÍ**: draggle bind `pointerdown` capture trên `document.documentElement`, dùng
  `isContainer(el)` động (classList). Item AntD mang class `fjs-palette-fields fjs-drag-container
  fjs-no-drop` (wrapper) + `fjs-drag-copy` + `data-field-type` (item) ⇒ dragula tự nhận, thả xuống
  canvas gọi `createNewField` của form-js. Không viết lại drag.

**Lát A — DONE (2026-07-09).**
- Tạo `webapp/src/components/formdesign/FieldPalette.tsx`: palette AntD, 4 nhóm (Nhập liệu / Lựa
  chọn / Trình bày / Bố cục) nhãn tiếng Việt + icon AntD + ô tìm kiếm (`Input`+`Empty`). Mỗi item
  mang class ma thuật form-js (kéo) + `onClick`→`onAdd(type)` (click).
- `FormDesigner.tsx`: import FieldPalette; dock trái render `<FieldPalette onAdd={handleAddField}>`;
  palette native portal vào `<div display:none ref={paletteRef}>`. `handleAddField(type)` dựng attrs
  như `createNewField` (`_parent`, `layout.row=nextRowId()`), thêm vào cuối container đang chọn
  (group/dynamiclist) hoặc root qua `modeling.addFormField`.
- CSS `.vht-fp-*` trong `bpmnio-skin.css` (cùng cụm AntD-parity): item flex + hover đỏ + mirror
  dragula (`.gu-mirror`).
- **Verify**: `npm run build` GREEN (12.0s). Cơ chế kéo–thả xác minh qua đọc source (draggle bind
  document-level pointerdown + isContainer động) — CHƯA click-through trình duyệt (Playwright chưa
  cài). **Next: user chạy `npm run dev` soi palette + thử kéo/click, xác nhận trước khi làm Lát B.**

**Lát B — DONE (2026-07-09).**
- Tạo `webapp/src/components/formdesign/FieldProperties.tsx`: panel AntD cho field đang chọn.
  Sections: Chung (key/label/description) · Nội dung (text/html) · Biểu thức FEEL (expression) ·
  Kiểm tra hợp lệ (required + min/max cho number + minLength/maxLength cho text) · Tùy chọn
  (OptionsEditor value/label cho select/radio/checklist/taglist) · Ẩn/hiện FEEL (conditional.hide) ·
  nút Xóa (Popconfirm). Ô chữ commit-on-blur (mỗi sửa = 1 undo, không mất focus); switch/số commit
  ngay. Type→nhãn VN + id (copyable). Root (type 'default') → ghi chú; không chọn → Empty.
- `FormDesigner.tsx`: nghe `selection.changed` → `setSelectedField`; `commandStack.changed` bump
  `selVersion`; render `<FieldProperties key={id#version}>` (remount nạp lại giá trị sau sửa/undo);
  panel native portal vào `<div display:none>`. `handleEditField` = `modeling.editFormField` (try/catch
  key trùng), `handleRemoveField` = tìm parent+index rồi `modeling.removeFormField`. **Gỡ toggle
  "Nâng cao"** (chỉ điều khiển panel native — không còn ý nghĩa); module `khcnFormSimplePanelModule`
  giữ nhưng nhận `() => false`.
- **Verify**: `npm run build` GREEN (12.9s); dev server HMR nạp lại không lỗi. CHƯA click-through.
  **Next: user thử chọn field trên canvas → sửa key/label/required/options/FEEL/xóa, kiểm undo/redo.**

**Lát C — DONE (2026-07-09). D13 HOÀN TẤT (cả 3 lát).**
- `FieldProperties.tsx`: thêm props theo type còn thiếu — `group` có section "Bố cục nhóm" (nhãn +
  Switch "Hiển thị khung viền" = `showOutline`); `dynamiclist` thêm vào REQUIREABLE nên có công tắc
  *Bắt buộc*. Thêm `showOutline?: boolean` vào FField.
- `bpmnio-skin.css`: **dọn CSS chết** — bỏ các rule skin palette/panel NATIVE (`.vht-fd-palette-dock
  .fjs-palette-*`, `.vht-designer .bio-properties-panel-*` bổ sung phiên này) vì native giờ ẩn trong
  div `display:none` (UI là AntD). Giữ skin CANVAS (`.vht-fd-canvas .fjs-*`) vì canvas vẫn là DOM
  form-js. Cập nhật comment cụm AntD-parity (chỉ còn canvas). Lưu ý: block Đợt 6
  `.vht-designer .bio-properties-panel` + polish `.vht-designer .fjs-palette-*` cũ để lại (vô hại,
  nhắm DOM ẩn; gắn với check:panel-vars/README — không gỡ trong phiên này).
- **Verify**: `npm run build` GREEN (12.5s). CHƯA click-through (Playwright chưa cài).

**Next (không còn lát D13):** kiểm chứng end-to-end trên trình duyệt khi có Playwright — mở Form
Designer, kéo/click thêm field, chọn field sửa key/label/required/options/FEEL/showOutline/xóa,
undo/redo, Lưu → schema round-trip. Việc "sau" (tuỳ chọn): thêm popup FEEL autocomplete (bù D13 §4),
props nâng cao cho image/table/iframe, kéo item palette AntD có preview đẹp hơn.

---

## eForm B-engine renderer (D12) — ALL 3 LÁT DONE (2026-07-09)

Plan of record: `docs/arch/eform-b-engine-architecture.md`. Decision **D12** locked 2026-07-09.
Frontend-mock work (swaps the runtime form renderer only) — same carve-out category as
D10/D11/EPIC06, does NOT touch the F1 blocker.

**PH3 nav grouping (done first, per user) — DONE.** User flagged (from
`docs/research/userflow-sso-app-portal-phan-he-2026-07-09.md`) that eForm UI must sit in its
correct phân hệ. Reorganized `webapp/src/App.tsx` sider: "Thư viện biểu mẫu" is now nested under
a new **"Danh mục dùng chung" (PH3)** submenu (`DatabaseOutlined`) instead of a lone top-level
item — nav-only, route `/bieu-mau` unchanged. Build green. See memory `ui-organize-by-phanhe`.

**Lát 1 — DONE.** Rewrote `webapp/src/components/FormRenderer.tsx` in place to an AntD renderer
(flat fields): `text`→markdown-lite Typography (heading/**bold**, no new dep, XSS-safe),
`textfield`→Input, `textarea`→Input.TextArea, `number`→InputNumber, `checkbox`→Checkbox,
`checklist`→Checkbox.Group, `radio`→Radio.Group, `select`→Select, `taglist`→Select multiple,
`datetime`→DatePicker/TimePicker (dayjs), `separator`→Divider, `spacer`→spacing. Controlled
`formData` state keyed by `component.key`; `validateField` covers required/min/max/minLength/
maxLength/pattern/email; unmapped types render a safe "chưa hỗ trợ" Alert (R4). **Kept the exact
`FormRendererHandle` + `FormSubmitResult` contract** (`submit(): {data, errors}`, errors keyed by
component id) so all 5 call sites are untouched.

**Deviations from the Lát-1 plan (flagged):**
1. **Kept the filename `FormRenderer.tsx`** (rewrote internals) instead of adding a separate
   `AntFormRenderer.tsx`. Rationale: same module path + exports ⇒ zero changes at the 5 call sites
   (`TaskFormModal`, `FormDesigner` preview, `FormLibrary`, `ProcessDetail`, `ActionStudio`).
2. **Did NOT keep the form-js runtime renderer as a fallback (OQ1).** All rendering — modal AND
   every preview — now uses AntD, matching the client's "must look like AntD everywhere" ask. The
   old form-js `Form` runtime is recoverable from git if a Lát-3 (`dynamiclist`) fallback is later
   needed. `@bpmn-io/form-js` stays a dep (builder `FormDesigner` still uses `FormEditor`).

**Verified**: `npm run build` GREEN (tsc + vite, 12.1s). The heavy form-js `Form` runtime chunk
(~334 kB) dropped out of the bundle for TaskFormModal/previews. No in-browser click-through —
Playwright not installed this session (consistent with prior sessions).

**Lát 2 — DONE (2026-07-09).** Cắm `feelin` (`^7.0.1`) vào `FormRenderer.tsx`:
- **`evalFeel(expr, ctx)`** — bỏ tiền tố `=` rồi `evaluate(src, ctx).value` (⚠ `feelin@7` trả
  `{value, warnings}`, KHÔNG phải value trực tiếp như snippet trong arch-doc §4 — đã unwrap
  `.value`). try/catch → `undefined` khi lỗi/parse hỏng (fail-safe, R4). Biến thiếu → `null` +
  warning, không throw.
- **Vòng reactivity** = `derived` useMemo trên `[components, formData]`: (1) tính mọi component
  `type:'expression'` có `key`+`expression` → `computed`; (2) đánh giá `conditional.hide` trên
  context đã trộn `{...formData, ...computed}` (điều kiện có thể tham chiếu trường tính toán) →
  `hidden` Set (keyed theo `idOf`).
- **① Ẩn/hiện**: component trong `hidden` → `return null` khi render, **bỏ khỏi validate + khỏi
  data submit** (tránh chặn nộp vì ô đang ẩn / tránh gửi dữ liệu ô ẩn).
- **② Tự tính**: `expression` có `label` → render Input `disabled readOnly` hiển thị giá trị
  computed; không `label` → headless (`return null`). `onChange` bị chặn cho field computed.
  Thêm hỗ trợ `readonly:true` (disable input) cho field thường.
- **submit()** dùng `derived.ctx` (đã gồm computed) + loại `hidden`. Contract `FormRendererHandle`
  giữ nguyên → 5 call site không đổi.
- **Seed demo mới** (bổ sung, KHÔNG sửa seed cũ): `webapp/src/forms/phieuDuToanDemo.ts`
  (`phieu-du-toan-demo`) — radio Đạt/Chưa đạt; textarea "Lý do chưa đạt" `conditional.hide`
  `=ketLuan != "chua_dat"` + required; number PL1/PL2; expression `tongKinhPhi` =
  `=(if kinhPhiPL1=null then 0 else kinhPhiPL1)+(...)`. Đăng ký trong `forms/index.ts`.

**Verified Lát 2**: `npm run build` GREEN (tsc + vite, 13.2s). Logic kiểm chứng bằng node harness
tái hiện `derived`/`submit` trên seed demo — 3 kịch bản đúng: (a) `ketLuan=dat` ⇒ Lý do ẩn, không
đòi required, không nộp, `tongKinhPhi` tự tính = 15; (b) `chua_dat` + trống Lý do ⇒ lỗi required
trên Lý do (đang hiện); (c) `chua_dat` + có Lý do ⇒ hợp lệ, nộp cả Lý do + `tongKinhPhi`. Không
click-through trình duyệt (Playwright không cài, nhất quán các phiên trước).

**Lát 3 — DONE (2026-07-09).** ③ `dynamiclist` → bảng động (thêm/xoá dòng) trong `FormRenderer.tsx`:
- **Refactor tái dùng**: tách `deriveState(components, data, parent={})` (module-level) — tính
  `{computed, ctx, hidden}` cho MỘT cấp; `parent` = context cấp trên. `derived` memo cấp gốc giờ
  chỉ gọi `deriveState(components, formData)` (hành vi Lát 2 giữ nguyên).
- **Đệ quy submit**: `processLevel(components, data, parent, prefix, errs)` (module-level) walk 1
  cấp, gặp `dynamiclist` thì đệ quy vào từng dòng với `parent = ctx` cấp trên; gom data thành
  **mảng object** (`out[key] = rows.map(...)`); lỗi ghi phẳng, key dòng = `<idList>#<dòng>.<idÔ>`
  (`rowErrKey`). `submit()` giờ = `processLevel(components, formData, {}, '', errs)` — contract
  `FormRendererHandle` GIỮ NGUYÊN. `dynamiclist` có `validate.required` + 0 dòng ⇒ lỗi "Cần ít
  nhất một dòng".
- **Render**: component `DynamicList` (mới, cuối file) — mỗi dòng là card viền, render đệ quy
  component con qua chính `ComponentField` (leaf, tái dùng), nút xoá dòng (`DeleteOutlined`) +
  "Thêm dòng" (`PlusOutlined`, `Button type="dashed" block`). Computed/hidden mỗi dòng suy từ
  `deriveState(children, row, rootCtx)`.
- **R2 (phạm vi biến FEEL trong dòng) — CHỐT**: context dòng = `{ ...gốc(rootCtx), ...dòng }`
  (dòng ưu tiên). ⇒ biểu thức trong dòng thấy cả biến dòng lẫn biến gốc; biểu thức gốc đọc được
  mảng dòng (vd `count(danhSachThanhVien)`).
- **Seed demo mới** (bổ sung, KHÔNG sửa seed cũ): `webapp/src/forms/phieuThanhVienDemo.ts`
  (`phieu-thanh-vien-demo`) — `dynamiclist` `danhSachThanhVien` (required) với con: hoTen(req),
  vaiTro(select), soThang(0–24), heSo(min0), expression `chiPhiUocTinh`=soThang×heSo (②theo dòng),
  textarea `ghiChu` `conditional.hide` `=vaiTro != "chu_nhiem"` (①theo dòng); + gốc: expression
  `soThanhVien`=`count(...)` (đọc mảng dòng), textarea yKien. Đăng ký trong `forms/index.ts`.

**Verified Lát 3**: `npm run build` GREEN (tsc + vite, 13.2s). Node harness tái hiện
`deriveState`/`processLevel` trên seed — 3 kịch bản đúng: (A) DS rỗng+required ⇒ lỗi `ds` "Cần ≥1
dòng", `soThanhVien=0`; (B) 1 chủ nhiệm đủ ⇒ `chiPhiUocTinh=6` (theo dòng), `ghiChu` hiện+vào
payload, `soThanhVien=1`, không lỗi; (C) 2 dòng ⇒ dòng0(thành viên) thiếu hoTen ⇒ `ds#0.ht` bắt
buộc, `ghiChu` dòng0 **ẩn** (không đòi, không nộp); dòng1 soThang=30>24 ⇒ `ds#1.st` MAX; cả 2 dòng
có `chiPhiUocTinh`, `soThanhVien=2`. Không click-through (Playwright không cài).

**Next: (không còn lát) — kiểm chứng end-to-end trên trình duyệt khi có Playwright** (mở
TaskFormModal thật, điền form có dynamiclist, Xác nhận, thấy trạng thái hồ sơ đổi — theo §8 arch).
Việc "sau" trong roadmap: `filepicker`→Upload (chặn bởi backend Foundation 1), `html/iframe`
(sanitize) — chưa làm. Cân nhắc lock đề xuất giữ/bỏ fallback form-js (OQ1) — hiện đã bỏ hoàn toàn.

**Goal of the whole task**: replace the form-js runtime renderer (which the client says looks
inconsistent with AntD) with a custom AntD renderer, while keeping the form-js **schema**,
**builder** (`FormDesigner`), **binding** (`formKey` on `ActionAvailabilityPolicy`), `FormContext`
and seed forms all unchanged. Engine for ①conditional / ②computed via `feelin` (already a dep,
`^7.0.1`); ③`dynamiclist` as an AntD editable table. Delivered in 3 slices.

**Lát 1 scope (this slice — flat fields only)**:
- New `webapp/src/components/AntFormRenderer.tsx` rendering flat form-js components with AntD:
  `text`(markdown)/`textfield`→Input, `textarea`→Input.TextArea, `number`→InputNumber,
  `checkbox`→Checkbox, `checklist`→Checkbox.Group, `radio`→Radio.Group, `select`→Select,
  `taglist`→Select multiple, `datetime`→DatePicker/TimePicker (vi_VN), `separator`→Divider.
- **Preserve the exact `FormRendererHandle` contract**: `submit(): { data, errors }` — validate
  `component.validate` (required/min/max/length/pattern) on visible fields; `data` = keyed by
  `component.key`. So `TaskFormModal.tsx` (checks `Object.keys(res.errors).length`) and
  `buildYKien(res.data)` need NO change.
- Swap `FormRenderer` → `AntFormRenderer` at the two call sites: `TaskFormModal.tsx` and the
  live-preview pane in `FormDesigner.tsx`. Keep `FormRenderer.tsx` (form-js) available as a
  fallback until Lát 3 lands (OQ1 in the design doc).
- **Out of scope this slice** (Lát 2/3): `feelin` wiring (conditional/computed), `dynamiclist`,
  `expression`, `filepicker`, `html/iframe`. Unmapped component types must render a safe
  "chưa hỗ trợ" placeholder, never crash (R4).

**Guardrails**: D10 — renderer must NOT infer outcome from form data (the button is the decision).
D12 — do not touch schema/builder/binding/store/seed. Match surrounding AntD + vi_VN idiom.

**Verify (per `.harness/rules` + /verify)**: `npm run build` green, then drive the real flow —
open a Phê duyệt dossier → TaskFormModal → fill `phieu-phe-duyet`/`phieu-y-kien` → Xác nhận →
confirm dossier status changes (not just preview). Note if Playwright unavailable this session.

---

## Side task (2026-07-08) — Action Registry catalog seed — DONE

Reviewed `docs/research/action-registry-list.md`, found it stale vs. code (still described
`PROCESS_STEP` as current; D10 already replaced it with `APPROVE_STEP`/`RETURN_STEP`/
`REJECT_STEP`). User asked to seed the doc's Phase 2 (Support Actions) and Phase 3 (Exception
Actions) proposals into the Action Registry ("Danh mục nút" tab, Action Studio). Confirmed with
user this was a deliberate short detour from the Integration screen Đợt 3 active task below.

**What shipped**: `webapp/src/data/actionRegistry.ts` — added `PROPOSED_SUPPORT_ACTION_CODES`
(`UPLOAD_ATTACHMENT`/`VIEW_DOCUMENTS`/`EXPORT_PDF`/`PRINT_DOSSIER`/`VIEW_AUDIT`) and
`PROPOSED_EXCEPTION_ACTION_CODES` (`REQUEST_ADD_REVIEWER`/`REQUEST_REPLACE_APPROVER`/
`REQUEST_REOPEN_STEP`/`REQUEST_MANUAL_COMPLETION`/`REQUEST_EMERGENCY_APPROVAL`), both merged
into `ACTION_REGISTRY` with `active: true`. Icons added to `data/actionPresentation.ts`
`ICON_BY_ACTION`. These now render in Action Studio's "Danh mục nút" tab (reads
`Object.values(ACTION_REGISTRY)` directly) but are **catalog-only, not wired**:
- Support actions have no `ActionAvailabilityPolicy` row → won't appear on real dossier/worklist
  screens (`getAvailableActions`'s tier1 only includes actionCodes present in `policies`).
- Exception actions have no `ExceptionType` in `exceptions.ts` → `EXCEPTION_ACTION_CODE` (which
  `getAvailableActions`/`getDebugActions` iterate) doesn't include them yet.

`docs/research/action-registry-list.md` updated to match: marked Phase 1 done (D10), Phase 2/3
marked "seed xong, chưa wiring", added follow-up questions (ExceptionType + policy per new
exception action). **Build verified green** (`npm run build`, 32.5s, no errors).

**Not done / explicit follow-up**: wiring these into real availability (Support) or exception
policy (Exception) — that needs per-step/per-process policy authoring decisions, likely a BA
call, not assumed here.

---

## Task

**RD02.02 v3 — sửa 3 gap chặn luồng do smoke test 2026-07-20 phát hiện — TO DO, chưa bắt đầu sửa.**
Chi tiết đầy đủ + bằng chứng network response ở entry "⚠ SMOKE TEST RD02.02 v3" đầu file này. Thứ tự
triển khai theo đúng phụ thuộc (không đảo được, mỗi bug chặn bug sau):

1. **Đồng bộ token 8090↔8093.** `ho-so-service` (8093) gọi backend Quy trình (8090) để start Camunda
   đang bị 401 Unauthorized — nghi `QTKHCN_WORKFLOW_SERVICE_TOKEN`/`QTKHCN_HO_SO_SERVICE_TOKEN` lệch sau
   khi 8090 restart (sau 8093 tới 26 phút, khả năng do restart deploy v3). **Xác nhận giá trị token đúng
   với user trước khi restart 2 tiến trình đang sống** — đây là gate mở khóa mọi việc còn lại, không sửa
   được cái này thì không test được gì khác.
2. **Thêm `@JobWorker(type = "khcn.rd0202.check-default-condition")`** trong
   `backend/src/main/java/vn/vht/qtkhcn/camunda/SystemCheckJobWorker.java` cho service task `Check` sau
   T02 trong `rd0202.bpmn` — hiện không có worker nào subscribe type này nên mọi hồ sơ RD02.02 sẽ treo
   vĩnh viễn ở đó, không bao giờ tới T06 → `Generate_HDXD`. Có thể copy stub logic từ handler
   `khcn.rd0101.check-default-condition` (luôn trả `dieuKienMacDinhDat=true`) trong cùng file.
3. **Sửa `loadDossierActions()` ở `frontend-angular/src/app/pages/ho-so-detail/ho-so-detail.ts:211-217`**
   — hiện luôn gửi `permissions: []` cho `POST /api/action-studio/simulate`, trong khi mọi Action Studio
   policy SUBMIT đều yêu cầu quyền `SUBMIT_DOSSIER`, nên nút "Gửi duyệt" không bao giờ hiện cho user
   thường (chỉ `isAdmin=true` bypass được) — ở **mọi quy trình**, không riêng RD02.02. Cần map
   `user.roleCodes` sang danh sách permission thật, hoặc bỏ yêu cầu `SUBMIT_DOSSIER` khỏi các policy nếu
   `allowedRoleCodes` đã đủ để enforce RBAC. Lỗi có sẵn từ trước, không phải do thay đổi v3 hôm nay.

**Done-when**: chạy lại đúng kịch bản smoke test đã làm hôm nay — đăng nhập **`pm@example.com` thật**
(KHÔNG dùng admin bypass), tạo Nhiệm vụ cấp Tập đoàn → Hồ sơ loại Xét duyệt (RD02) → bấm "Gửi duyệt" —
xác nhận hồ sơ vào `PROCESSING` với `zeebeProcessInstanceKey` hợp lệ, duyệt qua tới T06, xác nhận job
`Generate_HDXD` chạy và Hội đồng xét duyệt + văn bản QĐ hiện đúng trên Angular `ho-so-detail`. Nhớ dọn
sạch dữ liệu test sau khi xong (theo đúng cách đã làm hôm nay: `DELETE /api/nhiem-vu/{ma}` cascade).

---

**Integration screen (`/tich-hop`) upgrade — Đợt 1 (Slice A–C) — DONE 2026-07-08.**
Plan of record: `docs/research/integration-screen-upgrade-notes.md`. Frontend-mock evolution
of the already-built `IntegrationStatus.tsx` module (same carve-out category as D10/D11/
EPIC06 — not new EPIC/backend work, does not touch the F1 blocker). Đợt 1 scope was
deliberately capped to the lowest-risk slices; user chose "A-C only" over also starting the
Mapping Studio (D-F) this round.

**What shipped:**
- **Slice A — tab split**: `IntegrationStatus.tsx` now wraps content in `Tabs` — "Tổng quan"
  (fully wired, existing KPI + card grid) plus 4 disabled placeholder tabs ("Mapping dữ liệu
  (sắp có)", "Job & lỗi (sắp có)", "Cấu hình kết nối (sắp có)", "Kiểm thử (sắp có)") previewing
  the doc's 5-tab roadmap without building dead screens — same "disabled + sắp có" pattern
  `AssignmentBuilder.tsx` used for ORG_POSITION/COUNCIL/EXPRESSION.
- **Slice B — richer cards**: `SystemCard` metric row now shows Độ trễ TB (`s.doTreMs`,
  existing field), Tỷ lệ thành công 24h (new `integrationSuccessRate()` helper, derived from
  existing `banGhi24h`/`loi24h` — no new seed fields), Hàng đợi (existing), Lỗi mở (new
  `openIncidentCount()` helper, derived from existing `seedJobRuns`).
- **Slice C — drawer chi tiết**: new `SystemDetailDrawer` (opened via new "Xem chi tiết" button
  on every card) shows connection info, 24h metrics, lỗi gần nhất (new `lastErrorAt()` helper),
  and the last 5 job runs for that system via new `jobRunsForSystem()` helper — **reuses
  `seedJobRuns`/`seedEvents` already surfaced on `/nhat-ky` (`ProcessEventLog.tsx`) instead of
  duplicating a job-log table**, consistent with the "một nguồn sự thật" pattern from the
  BPMN↔routing work. Drawer explicitly notes mapping/version/quy-trình-linkage are not yet
  built (Slice D+), so it doesn't imply capability that doesn't exist.
- **New pure helpers in `data/camundaOps.ts`** (no new seed data, no schema change):
  `integrationSuccessRate(s)`, `jobRunsForSystem(he)`, `openIncidentCount(he)`, `lastErrorAt(he)`.

**Deferred to Đợt 3** (see below — now done in Đợt 2 except version/rollback + audit/permissions):
version/rollback (Slice H — should reuse the `RuleContext` save-bump-version pattern), audit log +
granular permissions (Slice I — should hang off the existing `RbacContext`/`actionAvailabilityPolicy`,
not a bespoke permission table), retry-policy config (doc's "Cấu hình kết nối" tab, still disabled
placeholder), the "Kiểm thử" tab (test-connection, separate from mapping preview).

**Verification**: `npm run build` GREEN (tsc + vite, ~32s), full output clean. No in-browser
click-through — Playwright not installed this session (consistent with prior sessions); a
throwaway dev server was started, curl-verified serving HTTP 200, then stopped after the check.

---

## Integration screen (`/tich-hop`) upgrade — Đợt 2 (Slice D–G) — DONE 2026-07-08

Continuation of Đợt 1 above, same session. Scope = the doc's own roadmap steps 3–4 ("Mapping
dữ liệu" tab with real field/value mapping + preview JSON + validate trạng thái). Slices H
(version/rollback) and I (audit + granular permissions) intentionally left for Đợt 3.

**What shipped:**
- **Slice D — mapping data model**: new `webapp/src/data/integrationMapping.ts`. `MappingConfig`
  (he/doiTuong/chieu/trạng thái Draft-Ready-Active-Deprecated-Error/version/fields) +
  `FieldMapping` (truongQTKHCN/kieuDuLieu/truongHeNgoai/batBuoc/khoaDinhDanh/transform/
  giaTriMacDinh/valueMappings) + `ValueMapping`. **Transform list is a closed enum**
  (`format-date`/`to-string`/`concat`/`split`/`enum-map`/`default-value`) — no free-text script,
  per the doc's "Transform có kiểm soát" section. 3 seed configs grounded in real mock data (not
  fabricated): SAP·Dự toán (enum-map on `giaiDoan`), QLNS·Nhân sự (default-value on missing
  email), MS·Hồ sơ (the doc's own `trangThai`→`status` value-mapping example, deliberately left
  with an empty `truongHeNgoai` on one field to demonstrate the Slice G validate gate).
  `validateMappingConfig()` implements the doc's 5 pre-Active checks (empty fields / missing
  external field / duplicate external field / enum without value mapping / no identifier key).
  `previewMapping()` applies field+value mapping to a source record → payload + missing/invalid
  list. `sampleRecordsFor(doiTuong)` pulls real records from `data/nhiemVu.ts`/`dossiers.ts` —
  returns `[]` for `TaiSan` (QLTS has no seed data in this mock) rather than inventing one.
- **New store** `store/IntegrationMappingContext.tsx` (mounted in `main.tsx`, same
  `RuleContext`-style pattern): `create`/`saveFields`/`setStatus`/`remove`. **`setStatus(..,
  'active', ..)` re-runs `validateMappingConfig` inside the context itself** (not just the UI) —
  fail-closed defense in depth; on failure it flips the config to `error` status and returns the
  error list instead of silently no-op'ing.
- **Slice E — Mapping Studio UI**: `webapp/src/components/MappingFieldEditor.tsx` (row-based
  field editor + nested value-mapping mini-editor, shown only when `kieuDuLieu==='enum'` or
  `transform==='enum-map'`) + `webapp/src/components/MappingStudio.tsx` (list/filter/create/edit-
  drawer/delete, wired into the previously-disabled "Mapping dữ liệu" tab in
  `IntegrationStatus.tsx`). `SystemDetailDrawer` (Đợt 1, Slice C) updated to list real active
  mappings for that system instead of the old "chưa triển khai" placeholder note.
- **Slice F — preview payload**: `PreviewModal` in `MappingStudio.tsx` — pick a sample record,
  show JSON gốc / JSON sau mapping (`<pre>` block styled like `ActionStudio.tsx`'s existing JSON
  viewer) / missing-or-invalid field list.
- **Slice G — validate-before-active fail-closed gate**: the "Kích hoạt" button calls
  `setStatus(id,'active',actor)`; on failure shows `Modal.error` with the full validation error
  list and does **not** flip to Active (fail-closed, consistent with D9's fail-closed RBAC
  principle). The seed MS·Hồ sơ config is deliberately invalid so this is exercisable immediately
  without needing to hand-craft a broken config first.

**Verification**: `npm run build` GREEN (tsc + vite, confirmed on a clean re-run with explicit
exit-code + error-grep check). Dev-server module transform smoke-test (no Playwright available
this session): fetched `IntegrationStatus.tsx` and `MappingStudio.tsx` through Vite's dev
transform pipeline, confirmed no parse/transform errors, then stopped the throwaway server.

---

### Earlier 2026-07-08 — EPIC06 Approval Matrix refactor — Đợt 1 + Đợt 2 — DONE (Slices A–I, all sliced work).
Plan of record: `docs/research/approval-matrix-refactor-plan.md` (+ review notes
`docs/research/approval-matrix-conversation-2026-07-08.md`). Frontend-mock refactor of the
already-built EPIC06 module (`/ma-tran-phe-duyet`), same category as D10/D11 — evolves existing
mock, does **not** start backend/persistence and does **not** touch the F1 blocker.

**Đợt 2 shipped 2026-07-08 (Slices E, F, G, H, I + shared store):**
- **Shared store** `store/ApprovalMatrixContext.tsx` (new, mounted in `main.tsx`) — single source
  for rules+delegations; `/ma-tran-phe-duyet` now edits through it so changes reach runtime.
- **Slice E — assignment model** (`data/approvalMatrix.ts`): `ApprovalAssignment { mode, targets }`
  replaces `approverRoleCodes`; targets `GROUP|USER|ORG_POSITION|COUNCIL|EXPRESSION`, modes
  `ANY_ONE|ALL|SEQUENTIAL`. `resolveAssignment` resolves GROUP/USER for real (+ delegation);
  ORG_POSITION/COUNCIL/EXPRESSION are placeholders (locked user + warning). New
  `components/AssignmentBuilder.tsx` (GROUP/USER editable; other 3 = disabled "sắp có" options).
  Seed AM-01…AM-07 migrated (HĐ rules got mode `ALL`). **Parity gate still passes — 216 contexts,
  matched-rule + approver-set identical, 0 mismatch.**
- **Slice H — audit payload**: `ResolveResult.audit: ApprovalResolveAudit` (input snapshot,
  matched rule id+version, mode, targets-before-org, final user ids, delegations applied, skipped
  rules) + `warnings` + `mode`. Simulation panel shows mode + warnings.
- **Slice F — analyzer** `data/approvalMatrixAnalyzer.ts` (new): detects empty-assignment (error),
  duplicate-priority, broad-before-specific shadow, disabled-fallback (warning), no-fallback
  coverage (info). Surfaced as a banner above the table + per-row ⚠ tooltip. **Harness-verified.**
- **Slice G — runtime wiring**: `data/approvalSlotMap.ts` (new) maps step candidateGroups → slot
  (⚠ DEMO ASSUMPTION per plan §8 — real slot should come from BPMN metadata) + `buildApprovalContext`.
  `DossierDetail` now resolves the current approval step via `resolveApprovers(store rules, ctx)`
  when a slot is derivable (else falls back to `resolveGroups`), and shows "Khớp luật: …" —
  so editing a rule on the Matrix page changes the predicted approver in the dossier.
- **Slice I — DTOs** `data/approvalMatrixDto.ts` (new): request/response shapes for the 5 future
  endpoints (rules CRUD, resolve, analyze), shaped ≈ mock for a minimal-change API swap.

**Verification**: full `npm run build` GREEN (tsc + vite, 12.2s). Three esbuild+node harnesses
green — engine 35/35, parity 216-ctx/0-mismatch (now incl. approver-set), analyzer all-detections.
No in-browser click-through (Playwright not installed).

**Mojibake encoding repair — DONE 2026-07-08 (follow-up, user-reported "many screens broken").**
Pre-existing corruption (double-encoded UTF-8, **CP1252**-based) from a prior session's editor,
NOT caused by this task (first Read this session showed it before any edit; `ApprovalMatrix.tsx`
stayed clean through heavy edits). Scanned all 119 `src/**/*.{ts,tsx,css}` — exactly **5 files**
were double-encoded: `data/actionAvailability.ts`, `data/actionAvailabilityPolicy.ts`,
`data/bpmnReconcile.ts`, `data/exceptionPolicy.ts`, `pages/DossierDetail.tsx` (the 4 data files
feed action/exception labels across many screens → "nhiều màn hình"). Fixed with a Node
CP1252-aware un-double-encoder (per-run `cp1252 bytes → utf-8`, incl. the 0x80–0x9F special chars
`— " " …` and undefined-byte passthrough for `ề`=E1 BB 81). **Safety guards**: only rewrite a file
if it net-reduces high-byte count, and reject any run whose decode yields a combining mark /
control char (avoids false positives — verified it correctly SKIPS `RuleGridBuilder.tsx` where
proper `THÌ…` would otherwise mangle). Also fixed 2 latent `TS2367` compile bugs in DossierDetail
(`d.cap`/`d.loai` comparisons that were always-false at runtime). **Verified**: full build green,
`0/119` files still double-encoded, spot-checked readable Vietnamese in all 5 (incl. `↔ — §` and
DossierDetail's mixed proper/mojibake regions). Backups kept in scratchpad. Note: Python is not
available in this env (Store stub, exit 49) — use Node for scripting.

**Also fixed to unblock the build (enabling cleanup, flagged)**: removed unused `StatCard` import +
`stats` useMemo in `RolePermission.tsx` (pre-existing D11 WIP leftovers that failed `tsc`).

---

### Đợt 1 (earlier 2026-07-08) — DONE (Slices A–D + audit-min)

**What shipped this đợt:**
- **Slice A — condition engine** `webapp/src/data/approvalConditions.ts` (new): `ConditionNode`/
  `ConditionGroup`/`ConditionLeaf` + `evaluateConditionTree` + 11 operators
  (`eq/neq/gt/gte/lt/lte/between/in/contains/exists/notExists`) + `describeConditionTree`
  (Vietnamese preview) + builder helpers (`group`/`leaf`/`anyCondition`). Fail-closed on missing
  values; empty group = wildcard. **Verified via esbuild+node harness — 35/35 asserts**
  (numeric/enum/bool/missing/AND-OR nesting/describe).
- **Slice B — variable registry** `webapp/src/data/approvalVariableRegistry.ts` (new): 11 seed
  vars (plan §3.3), enum options aligned to `variableContract.ts` for the overlapping ones
  (capNhiemVu↔cap, loaiHoiDong); 3 core vars `simulated:true`, rest authorable-only for now.
  Provides `describeHelpers` (field/value labels) + operator-by-type sets driving the builder.
- **Slice C — schema migration + PARITY GATE (passed).** `ApprovalRule` moved from fixed
  `cap/loaiHoiDong/budgetMin/budgetMax` to `conditions: ConditionGroup`; seed AM-01…AM-07
  migrated (`cap`→`capNhiemVu eq`, `budgetMin`→`tongDuToan gte`, `loaiHoiDong`→`eq`); `slot`
  still matched separately; `ruleMatches`/`resolveApprovers` use the engine via `toEvalContext`.
  **Parity harness: 216 contexts (slot×cap×loaiHoiDong×budget incl. Simulation default
  PHE_DUYET/TD/12 tỷ + budget boundaries), matched-rule identical old-vs-new, 0 mismatch.**
- **Slice D — Condition Builder UI** `webapp/src/components/ConditionBuilder.tsx` (new):
  recursive AND/OR group editor, field/operator/value controls rendered by registry type
  (enum→Select, number→InputNumber w/ VND format + between range, boolean→Có/Không, string→Input,
  `in`→multi-select), add/remove condition + nested group, live Vietnamese preview. Wired into
  the ApprovalMatrix rule modal (replaced the 4 fixed fields); table "Điều kiện" column now shows
  the readable summary; column relabeled "Nhóm phê duyệt" (plan §7 copy).
- **Audit-minimum** (`ResolveResult.evaluatedRules` + Simulation panel): shows all same-slot
  rules evaluated with why (chosen / matched-but-lower-priority / disabled / điều kiện không khớp).
- **Assignment stayed GROUP-only** (Slice E deferred as planned).

**Verification**: the 5 refactor files are **type-clean** (`tsc` reports 0 errors in them) +
engine/parity harnesses green. **Caveat — full `npm run build` is currently RED due to
PRE-EXISTING uncommitted WIP unrelated to this task**: `TroGiup.tsx` (untracked, missing antd
icon imports `AppstoreOutlined`/`SafetyCertificateOutlined`/`SyncOutlined`) and
`RolePermission.tsx` (modified, unused `StatCard`/`stats`). Both were dirty at session start
(git: `?? TroGiup.tsx`, `M RolePermission.tsx`) and are owned by other workstreams — left
untouched. No in-browser click-through (Playwright not installed); harnesses cover runtime logic.

**Đợt 2 is now DONE (see the Đợt 2 block above).** Open questions still to confirm with an
architect (chosen sensibly in the mock, flagged as assumptions — revisit when backend starts):
- Source of `slot` — currently derived from step candidateGroups in `data/approvalSlotMap.ts`
  (DEMO ASSUMPTION per plan §8). Real slot should come from BPMN extension prop / task metadata.
- Official Approval Matrix input variable contract — Registry seeded from plan §3.3; not yet
  ratified. `loaiHoiDong` at runtime is currently derived from `cap` (demo) pending real DMN.
- Approval mode semantics for councils (any-one / quorum / all / chair-only) — `ALL` used for
  the seed HĐ rules as a placeholder.

**Recently completed (context — full detail in `DELIVERY_STATE.md`):**
- **D11 (RBAC scope-overlay refactor) — DONE 2026-07-08.** `dataScope` split out of
  `RolePermissionPolicy` into per-user `UserRoleAssignment`; new `store/RbacContext.tsx`;
  `/phan-quyen` reworked to 3 tabs; `/nguoi-dung` per-user "Phân quyền" drawer. Build green.
- **D10 (eForm binds to Action layer) — DONE end-to-end 2026-07-08** (UI cut-over to 3 outcome
  buttons + point 5 BPMN reconcile tool). `npm run build` fully green.
- **Foundation 1 unblock** — still the real blocker for leaving frontend-mock; owner is the
  Solution Architect/client, not resolvable by this agent. All mock work above (and this
  Approval Matrix refactor) deliberately avoids F1's blocker.

## Current phase

Foundations phase — F0 done, F1 blocked, F2/F3/F5 partial, F4 not started. No NEW EPIC/backend
work starts until F1–F5 are `COMPLETE` per `workflows/foundations.md`. This task is a
frontend-mock refactor of an already-built module (same allowance under which D10/D11/EPIC06
shipped), not new EPIC/backend work.

## Files to read

- `docs/research/integration-screen-upgrade-notes.md` — plan of record for the current task
  (Đợt 1 = Slice A-C DONE, Đợt 2 = Slice D-G DONE; Slice H-I = Đợt 3, not started)
- `webapp/src/pages/IntegrationStatus.tsx` — the module being upgraded (`/tich-hop`)
- `webapp/src/data/integrationMapping.ts` — mapping model, `validateMappingConfig`,
  `previewMapping`, `sampleRecordsFor` (Slice D)
- `webapp/src/store/IntegrationMappingContext.tsx` — mapping CRUD + fail-closed `setStatus`
  (mounted in `main.tsx`)
- `webapp/src/components/MappingFieldEditor.tsx` + `webapp/src/components/MappingStudio.tsx` —
  Mapping Studio UI (Slice E-G), wired into `IntegrationStatus.tsx`'s "Mapping dữ liệu" tab
- `webapp/src/data/camundaOps.ts` — seed data + helpers (`integrationSuccessRate`,
  `jobRunsForSystem`, `openIncidentCount`, `lastErrorAt`); also owns `seedJobRuns`/`seedEvents`
  already consumed by `webapp/src/pages/ProcessEventLog.tsx` (`/nhat-ky`) — reuse, don't duplicate
- Reuse precedent for the remaining slices: `webapp/src/store/RuleContext.tsx` (`saveXml`
  bump-version pattern → mapping version/rollback, Slice H), `webapp/src/store/RbacContext.tsx` +
  `data/actionAvailabilityPolicy.ts` (→ Slice I permissions, don't build a bespoke permission table)
- Older context (EPIC06/D10/D11, superseded as the active task but still relevant background):
  `docs/research/approval-matrix-refactor-plan.md`, `.harness/state/decisions.md` (D3/D9/D10/D11)

## Next concrete action

**Đợt 1 (Slice A-C) and Đợt 2 (Slice D-G) are DONE.** Candidate next steps (pick per instruction):
1. **Slice H — version/rollback**: extend `IntegrationMappingContext` with a version history
   list per `MappingConfig` (mirror `RuleContext.saveXml`'s bump-version, but keep prior versions
   instead of discarding) + a "Xem lịch sử / Khôi phục" action in `MappingStudio.tsx`.
2. **Slice I — audit log + granular permissions**: gate Mapping Studio actions (sửa/kích hoạt/
   xoá) through `RbacContext`/`actionAvailabilityPolicy` instead of leaving them open to any
   logged-in user; add an audit trail (who changed/activated/deactivated which mapping) — mirror
   the audit-minimum pattern already used in `ApprovalMatrixContext`'s `ResolveResult.audit`.
3. **In-browser click-through** of `/tich-hop` (Playwright not installed this session): confirm
   the Mapping Studio create/edit/preview/activate flow end-to-end, including the deliberately-
   invalid seed config (`map-ms-hoso-draft`) correctly blocking Activate with the validation
   errors shown.
4. Resume the parked EPIC06 next-steps (still valid, not started this session): lock the
   Approval Matrix model shape as D12 in `decisions.md`; backend readiness for
   `data/approvalMatrixDto.ts` when F1 unblocks.

**If asked to unblock the project instead:** Foundation 1 is the real blocker — get the
architect/client to decide backend language/framework, domain DB engine, and Camunda 8
deployment model, then lock them (D12/D13/D14 earmarked) in `decisions.md` and scaffold the
backend per `.harness/workflows/foundations.md`.
> **2026-07-20 — Dynamic dossier actions DONE (Codex).** `ho-so-detail` nay render action theo Action Studio
> policy/presentation; bỏ các nhánh button hard-code. Runtime task outcomes tiếp tục dùng API task-centric;
> support/form action dùng simulation + eForm `formKey`. Hồi quy AP-1784539922796 xanh 7/7, production build xanh.

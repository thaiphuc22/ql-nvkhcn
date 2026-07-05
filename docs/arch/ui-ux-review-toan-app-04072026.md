# Review UI/UX toàn bộ webapp QTKHCN (thủ công, đọc mã nguồn)

> **Ngày**: 2026-07-04 · **Người thực hiện**: Claude Code (đọc mã nguồn thủ công, không qua
> skill chuyên dụng — repo hiện chưa có skill UI/UX audit, xem trao đổi trước khi review này).
> **Phạm vi**: toàn bộ `webapp/src` (19 trang, layout `App.tsx`, 9 shared UI component,
> BPMN editor/viewer, eForm, văn bản đầu ra).
> **Phương pháp**: đọc mã nguồn từng file (không phải click-test trình duyệt — dev server
> chưa được chạy trong phiên này). Vì vậy các nhận xét về *hành vi thực tế khi tương tác*
> (animation, focus trap, thứ tự tab...) cần xác nhận thêm bằng click-test tay; các nhận xét
> về *cấu trúc/logic UI* (thiếu xác nhận, thiếu feedback, bất nhất định dạng, nút chết...)
> đã được xác minh trực tiếp trong code kèm số dòng.
> **Không trùng phạm vi** với `docs/arch/bpmn-editor-ux-upgrade-plan.md` (đã review rất sâu
> riêng phần trình vẽ BPMN, đã thực thi Đợt 1–6) — báo cáo này review **phần còn lại của app**
> và đối chiếu nhanh xem các hạng mục trong plan đó có thật sự nằm trong code hay chỉ trong
> tài liệu kế hoạch.

---

## 1. Điểm mạnh (giữ nguyên, không cần sửa)

1. **Hệ thống component dùng chung nhất quán**: `PageHeader`, `StatCard`, `StatusTag`/
   `ProcessStatusTag`/`DossierStatusTag`, `FilterBar`, `EntityTable`, `NotFound` — dùng lặp
   lại ở hầu hết trang danh sách/chi tiết, sửa một nơi đổi mọi nơi (đúng chủ đích ghi trong
   `STATE.md`).
2. **Breadcrumb gộp về một nơi** (`BreadcrumbContext` + `PageHeader`) — tránh trùng lặp,
   đúng nguyên tắc 1 nguồn sự thật.
3. **Trạng thái không chỉ dựa vào màu** ở phần lớn nơi: `StatusTag`/`Tag` luôn đi kèm nhãn
   chữ (Quá hạn/Còn hạn, Đang chạy/Incident...), không chỉ đổi màu — đây là điểm tốt hiếm
   gặp, đa số app tự phát không làm được.
4. **Feedback sau hành động khá đầy đủ** ở các trang nghiệp vụ chính (`ProcessDetail`,
   `ProcessCreate`, `ProcessCatalog`, `FormLibrary`, `TaskFormModal`) — `message.success/
   error/warning` phân hoá theo kết quả, không im lặng.
5. **404 chuẩn hoá** qua component `NotFound` dùng đúng ở mọi trang chi tiết có param
   (`ProcessDetail`, `DossierDetail`, `NhiemVuDetail`).
6. **Cổng chất lượng cho BPMN editor** (lint chặn lưu, gateway fail-safe mặc định "Từ chối",
   contract biến chuẩn hoá) — hiếm thấy ở giai đoạn prototype, cho thấy tư duy "an toàn hơn
   đẹp" đúng thứ tự ưu tiên.
7. **BPMN editor UX plan đã thực thi thật trong code**, không chỉ nằm trên giấy — đã xác
   minh trực tiếp: Việt hoá (`TranslateViModule`, `observeViLabels`), palette drawer
   (`BpmnTemplateDrawer` + `startKhcnTemplate`), live-lint overlay (debounce 600ms,
   `khcn-lint-dot`), undo/redo, zoom %, lưới on/off (`GRID_KEY` localStorage), panel 2 chế độ
   (Đơn giản/Nâng cao), tô màu (`khcnColorModule`) — tất cả có bằng chứng code, không phải
   tài liệu "nói suông".
8. Nhiều nơi minh bạch về việc đang dùng dữ liệu mô phỏng (`ProcessMonitor`,
   `IntegrationStatus`: Alert "mock — chưa nối engine thật") — tốt cho kỳ vọng người xem demo.

---

## 2. Vấn đề mức **Cao** (ảnh hưởng lòng tin người dùng / rủi ro khi đem ra ngoài)

### 2.1 Nút "chết" không có visual cue — trông như hoạt động nhưng không làm gì
**`pages/UserManagement.tsx:82-87, 99`** — 3 nút **"Thêm người dùng"**, **"Sửa"**, **"Khoá"**
không gắn `onClick`, không `disabled`, không tooltip/badge "sắp ra mắt". Người dùng bấm sẽ
không thấy phản hồi gì, không rõ đó là bug hay tính năng chưa có. Đây là trang duy nhất
trong cụm quản trị **không** có Alert "mock/chưa nối" như `ProcessMonitor`/`IntegrationStatus`
đã làm — bất nhất trong cách báo hiệu "tính năng đang mock".
→ Đề xuất: tối thiểu `disabled` + `Tooltip title="Sắp ra mắt (F4 — RBAC)"`, nhất quán với
cách `ProcessMonitor` đã làm bằng Alert banner.

### 2.2 Link tài liệu chết, trông như tải được
**`pages/DossierDetail.tsx:156`** — mục "Xem"/"Tải" cho "Tài liệu / Phiếu" là thẻ `<a>` tĩnh,
không `href`, không `onClick`. Giống lỗi 2.1 nhưng ở ngữ cảnh nhạy cảm hơn (tài liệu pháp lý
của hồ sơ KHCN) — người phê duyệt có thể tưởng đã xem tài liệu đính kèm trong khi chưa có gì.

### 2.3 Hành động "Tạm ngừng" quy trình không có xác nhận
**`pages/ProcessDetail.tsx:88-92, 323`** — nút `danger` "Tạm ngừng" gọi `onToggle()` ngay lập
tức, không qua `Modal.confirm`/`Popconfirm`. Đây là hành động ảnh hưởng phạm vi rộng (ngừng
một quy trình đang active) — nên có bước xác nhận như `FormLibrary` đã làm đúng cho việc xoá
biểu mẫu (`Popconfirm`, `pages/FormLibrary.tsx:156-174`).
→ **Bất nhất pattern**: cùng là hành động phá huỷ/rủi ro cao, `FormLibrary` xác nhận,
`ProcessDetail` không — nên chuẩn hoá 1 quy tắc "hành động không hoàn tác luôn qua
`useConfirm()`" (đã có sẵn hook `components/ui/feedback.tsx:53-66`, chỉ chưa được áp dụng
đều).

### 2.4 In tài liệu không xác nhận + có thể gọi `print()` 2 lần
**`components/OfficialDocument.tsx:110-111`** — `printOfficialDoc` gọi `w.print()` cả trong
callback `onload` **và** một `setTimeout(400ms)` dự phòng; nếu cả hai cùng fire, trình duyệt
có thể mở hộp thoại in 2 lần. Ngoài ra, ở `DossierDetail.tsx:238` (nút trong Modal footer),
giá trị trả về của `printOfficialDoc` (báo popup có bị chặn không) **không được kiểm tra** —
nếu trình duyệt chặn popup tại điểm gọi này, người dùng không nhận được cảnh báo nào (so với
`DossierDetail.tsx:176` có kiểm tra và hiện `message.warning`) → 2 call-site cùng hàm nhưng
xử lý lỗi khác nhau.

### 2.5 Mật khẩu demo lộ công khai ngay trên màn hình đăng nhập
**`pages/Login.tsx:94-136`** — card "Tài khoản demo" hiển thị trực tiếp `DEMO_PASSWORD`
("Mật khẩu chung: 123456") và nút "Điền nhanh" tự động điền email+mật khẩu cho **bất kỳ**
user nào trong danh sách — kể cả vai trò duyệt cấp cao. Hợp lý cho giai đoạn demo nội bộ,
nhưng **là một pattern rủi ro nếu vô tình mang nguyên UI này ra ngoài** (staging public, demo
khách hàng ngoài). Vì đây là *UI pattern* (không phải chỉ dữ liệu mock), nên cần một cách
tắt rõ ràng trước khi hệ thống có SSO/IAM thật (F4) — ví dụ gate bằng biến môi trường
`VITE_SHOW_DEMO_ACCOUNTS`, không chỉ dựa vào việc nhớ xoá code sau này.

---

## 3. Vấn đề mức **Trung bình** (nhất quán & chất lượng cảm nhận)

### 3.1 `EmptyState` (component có thiết kế riêng theo design system) không được dùng ở đâu cả
**`components/ui/EmptyState.tsx`** — component vẽ SVG line-art đỏ mờ theo đúng
`design-system.md` (Stitch), có `compact` mode, đã hoàn chỉnh — nhưng:
- **không được export** trong `components/ui/index.ts` (chỉ export `PageHeader, StatCard,
  NotFound, StatusTag, FilterBar, EntityTable`);
- **không có nơi nào import** nó (đã grep toàn repo, 0 kết quả ngoài chính file định nghĩa).

Hệ quả: mọi empty-state thực tế trong app đang rơi về 1 trong 3 kiểu khác nhau, không đồng bộ
thương hiệu:
- `EntityTable`'s built-in `<Empty description={emptyText}/>` (icon generic AntD) — dùng ở
  `ProcessCatalog`, `DossierList`, `NhiemVuList`, `UserManagement`, `ProcessMonitor`...
- `<Empty description=.../>` viết tay trực tiếp, không qua `EntityTable` — `Dashboard.tsx:164,
  221`, `ProcessDetail.tsx:266`, `ProcessEventLog.tsx:99` (khác `:174` trong cùng file dùng
  `EntityTable`).
- Text tự chế có emoji: `Worklist.tsx:146` (`"Không có việc nào chờ xử lý 🎉"`).

→ Đây là một component đã đầu tư thiết kế (SVG riêng, đúng brand) nhưng bị "mồ côi" — nên
hoặc (a) export + áp dụng cho ít nhất các empty-state cấp trang (Worklist rỗng, Dashboard 2
khối rỗng), hoặc (b) xoá nếu quyết định không dùng nữa (tránh code chết gây hiểu nhầm khi
review sau này).

### 3.2 Định dạng ngày tháng không nhất quán giữa các trang mock
- `Dashboard.tsx:14` — `new Date(2026, 6, 3)` (object).
- `Worklist.tsx:21` — `'03/07/2026'` (chuỗi dd/mm/yyyy).
- `ProcessCatalog.tsx:75`, `ProcessCreate.tsx:28` — `'2026-07-03'` (chuỗi ISO).

Không phải lỗi hiển thị (vì đều là dữ liệu mock độc lập), nhưng cho thấy **chưa có 1 tiện
ích format ngày dùng chung** (`utils/date.ts` hay tương tự) — khi nối dữ liệu thật từ nhiều
trang, rủi ro hiển thị lệch định dạng ngày cho người dùng cuối là có thật.

### 3.3 Hằng số "người dùng hiện tại" định nghĩa độc lập ở 2 nơi
**`pages/Worklist.tsx:20`** và **`components/TaskFormModal.tsx:9`** đều tự khai
`CURRENT_USER = 'Nguyễn Gia Vinh'` — trùng giá trị nhưng không chung 1 nguồn. Vì app đã có
`AuthContext` (đăng nhập thật, biết `user.hoTen`), 2 hằng số hardcode này nên được thay bằng
`useAuth().user` — hiện tại nếu đổi tài khoản demo đăng nhập, "người xử lý" trong worklist/
modal vẫn hiển thị cứng "Nguyễn Gia Vinh" bất kể ai đang đăng nhập (không khớp session thật).

### 3.4 Pattern xác nhận hành động phá huỷ không đồng nhất
- `FormLibrary.tsx:156-174` — xoá biểu mẫu: có `Popconfirm`, nội dung cảnh báo rõ, có ghi chú
  "không thể hoàn tác (mock)".
- `ProcessDetail.tsx` "Tạm ngừng" — không xác nhận (mục 2.3).
- `UserManagement.tsx` "Khoá" — không xác nhận (nhưng cũng không hoạt động — mục 2.1).
- `NhiemVuCreate.tsx:221` — nút "Hủy" có thể mất dữ liệu đã nhập, không `Popconfirm`.
- `ProcessCatalog.tsx:169` — đóng Modal tạo quy trình mất dữ liệu đã nhập, không xác nhận.

→ Không có quy tắc chung "khi nào cần confirm". Nên chuẩn hoá: *bất kỳ hành động nào xoá dữ
liệu đã nhập hoặc đổi trạng thái không dễ đảo ngược → bắt buộc qua `useConfirm()`* (hook đã
có sẵn, chỉ thiếu áp dụng đều).

### 3.5 Trùng lặp code giữa `BpmnEditor` và `BpmnViewer`
**`components/BpmnEditor.tsx:267-280`** và **`components/BpmnViewer.tsx:69-80`** — logic
zoom/fullscreen gần như giống hệt nhau, viết 2 lần độc lập. Hệ quả UX gián tiếp: 2 component
đã lệch nhau ở ít nhất 2 điểm ngay bây giờ —
- chiều cao canvas khác nhau: Editor `74vh` (`BpmnEditor.tsx:346`) vs Viewer `64vh`
  (`BpmnViewer.tsx:16,85`), không có hằng số dùng chung;
- xử lý lỗi khác nhau: Editor hiện `Alert` đỏ khi import XML lỗi (`BpmnEditor.tsx:350-360`),
  Viewer **nuốt lỗi im lặng** (`BpmnViewer.tsx:46-48`, `.catch(() => {})`) — nếu sơ đồ hỏng,
  người chỉ xem (không có quyền sửa) sẽ thấy canvas trống/im lặng không rõ vì sao, trong khi
  người sửa lại thấy thông báo rõ ràng.

### 3.6 Thao tác chọn mẫu trong `BpmnTemplateDrawer` không dùng được bằng bàn phím
**`components/BpmnTemplateDrawer.tsx:110`** — dùng `onMouseDown` để bắt đầu đặt phần tử lên
canvas, không có `onKeyDown`/`onClick` fallback → người dùng chỉ dùng bàn phím (hoặc công cụ
hỗ trợ) không thể chọn mẫu nào trong drawer này, dù các phần khác của app (nút, menu) đều
điều hướng được bằng bàn phím qua AntD mặc định.

### 3.7 Chỉ báo màu-đơn (color-only) ở một chỉ số
**`pages/IntegrationStatus.tsx:104`** — số liệu "nguy hiểm" chỉ đổi màu chữ
(`color: danger ? '#cf1322' : undefined`), không kèm icon/nhãn phụ như các nơi khác trong
cùng trang đã làm tốt (Badge + StatusTag kèm text, dòng 72-75). Vi phạm nhẹ nguyên tắc "không
dùng màu làm kênh truyền đạt duy nhất" (WCAG 1.4.1) — nên thêm icon cảnh báo nhỏ cạnh số khi
`danger`.

### 3.8 Định dạng số tiền (dự toán) không đồng nhất
`pages/NhiemVuList.tsx:74` hiển thị chuỗi có sẵn dạng `"x.xxx.xxx.xxx đ"` từ mock, trong khi
`pages/NhiemVuCreate.tsx:72` tự format bằng `toLocaleString('vi-VN')` — cùng một khái niệm
"dự toán" nhưng 2 cách sinh chuỗi khác nhau, rủi ro lệch định dạng khi nối API thật (vd. số
âm, số lẻ, đơn vị nghìn/triệu).

### 3.9 Trạng thái bước hồ sơ không dùng `StatusTag` chuẩn ở một chỗ
**`pages/DossierDetail.tsx:206-208`** — gán `Tag color` trực tiếp ('blue'/'red'/'green') tại
chỗ thay vì qua `DossierStatusTag`/`StatusTag` như phần còn lại của app — nếu sau này đổi
bảng màu trạng thái ở 1 nguồn (`STATUS_META`), điểm này sẽ không đổi theo, gây lệch màu.

### 3.10 Bảng dữ liệu không có vùng cuộn riêng → phải cuộn toàn trang
**`components/ui/EntityTable.tsx`** không nhận/forward prop `scroll`, và **không trang nào
trong 12 nơi dùng `EntityTable`** (`DossierList.tsx:107`, `ProcessCatalog.tsx:155`,
`Worklist.tsx:142`, `NhiemVuList.tsx:124`, `UserManagement.tsx:135`, `ProcessMonitor.tsx:128`,
`ProcessEventLog.tsx:169`, `Dashboard.tsx:151`, `NhiemVuDetail.tsx:134`, `ProcessDetail.tsx:259`
— đã grep xác nhận, 0 kết quả `scroll=`) truyền `scroll={{ y: ... }}`. Kết quả: bảng luôn cao
bằng đúng số dòng dữ liệu, không có vùng cuộn dọc riêng — khi danh sách dài, người dùng phải
cuộn **toàn bộ trang** (qua cả `PageHeader`, `FilterBar`, `StatCard`) thay vì chỉ cuộn phần
bảng, mất ngữ cảnh bộ lọc/tiêu đề khi kéo xuống các dòng cuối.
→ Nên thêm `scroll={{ y: <chiều cao cố định hoặc calc> }}` cho các bảng danh sách chính
(`Worklist`, `ProcessCatalog`, `DossierList`, `NhiemVuList`, `UserManagement`,
`ProcessMonitor`), giữ `FilterBar`/`StatCard`/`PageHeader` cố định phía trên.

### 3.11 Có/không phân trang không nhất quán giữa các trang danh sách
`EntityTable` mặc định bật phân trang (`hideOnSinglePage: true`,
`components/ui/EntityTable.tsx:29`) và phần lớn trang danh sách chính dùng đúng mặc định này
(`DossierList`, `ProcessCatalog`, `Worklist`, `NhiemVuList`, `UserManagement`,
`ProcessMonitor`). Nhưng **`FormLibrary.tsx:203`** — cũng là một trang danh sách cấp đầu (ngang
hàng `DossierList`/`ProcessCatalog` về vai trò), lại truyền `pagination={false}`, tức là hiển
thị toàn bộ danh sách biểu mẫu trên 1 trang dài. (`ProcessEventLog.tsx:173`,
`ProcessDetail.tsx:263`, `Dashboard.tsx:155`, `NhiemVuDetail.tsx:138` cũng tắt phân trang nhưng
đó là bảng phụ/nhúng trong trang chi tiết — hợp lý hơn vì thường ít dòng.) Khi nối dữ liệu biểu
mẫu thật (có thể hàng trăm), `FormLibrary` sẽ là trang danh sách chính duy nhất không phân
trang — nên đưa về cùng mặc định như các trang danh sách còn lại.

### 3.12 Bộ phân trang chưa có tuỳ chọn số dòng/trang
**`components/ui/EntityTable.tsx:29`** — cấu hình phân trang mặc định chỉ có `pageSize` (cố
định 10) và `hideOnSinglePage`, **không có `showSizeChanger`** (đã grep toàn `webapp/src`, 0
kết quả `showSizeChanger`) — nghĩa là không trang nào trong app cho người dùng chọn hiển thị
20/50/100 dòng mỗi trang, khác chuẩn thường gặp ở bảng dữ liệu nghiệp vụ (nhất là các trang có
khả năng nhiều dòng như `Worklist`, `DossierList`, `NhiemVuList`). Vì đây là hành vi mặc định
tại 1 nơi (`EntityTable`), sửa một chỗ (thêm `showSizeChanger: true` + `pageSizeOptions`) sẽ
lan ra toàn bộ bảng dùng chung, effort thấp so với lợi ích.

### 3.13 Trang Tạo/Sửa quy trình chưa có chiều cao cố định cho toàn trang
**`pages/ProcessCreate.tsx`** (và tab sửa BPMN trong `pages/ProcessDetail.tsx:288`) xếp dọc:
`PageHeader` → Card "Thông tin chung" (chiều cao tự nhiên theo nội dung form) → Card "Sơ đồ
BPMN" chứa `BpmnEditor` cao cố định `74vh` (`components/BpmnEditor.tsx:346`). Vì `74vh` được
tính theo *viewport*, không theo *phần không gian còn lại sau Card phía trên*, tổng chiều cao
trang dễ vượt quá 100vh trên màn hình thấp (laptop 13"–14", hoặc khi form "Thông tin chung"
xuống dòng nhiều ở màn hẹp) — khi đó toàn trang (`#app-scroll`, `App.tsx:271`, không có
`overflow`/chiều cao cố định riêng) phải cuộn, kéo theo cả Card "Thông tin chung" và tiêu đề
"Sơ đồ BPMN" trôi khỏi màn hình trong khi đang thao tác trên canvas.

Đáng chú ý: 2 panel dock bên trong `BpmnEditor` — **drawer "Mẫu nghiệp vụ KHCN"**
(`BpmnTemplateDrawer.tsx:88`, `overflow: auto` trong khung `flex:1`) và **panel "Thuộc tính
phần tử"** (`BpmnEditor.tsx:506`, `overflow: auto` tương tự) — **đã có cuộn dọc riêng bên
trong**, đúng như đề xuất, chỉ là bị giới hạn bởi khung cha `74vh` cố định thay vì bởi chiều
cao thực còn lại của trang. Vấn đề còn thiếu là ở cấp trang: layout tổng (`PageHeader` + Card
"Thông tin chung" + Card "Sơ đồ BPMN") chưa được đặt trong một khung `flex column` chiếm phần
còn lại của viewport (vd. `calc(100vh - <header height>)`), để chỉ có phần canvas/drawer/panel
cuộn nội bộ còn khung ngoài (header, tiêu đề form) luôn cố định — đúng như hướng đã đề xuất.

---

## 4. Vấn đề mức **Thấp** (tinh chỉnh, không khẩn cấp)

- **Magic number lặp lại không chia sẻ hằng số**: `DRAWER_W = 264` khai riêng ở cả
  `BpmnEditor.tsx:46` và dùng lại trong `BpmnTemplateDrawer.tsx:50,56` (2 nơi, phải tự đồng bộ
  tay); `width={640}` cho Modal lặp ở `ProcessDetail.tsx:373` và `TaskFormModal.tsx:61` không
  chia sẻ constant.
- **Cột bảng width cố định bằng px** (`Worklist.tsx:60-121` với các giá trị 128/250/110/130/
  170) thay vì tỷ lệ/`minWidth` + `scroll={{x: true}}` — có thể tràn ngang ở màn hình hẹp/
  tablet dù `Row/Col` phía trên đã responsive.
- **`<a onClick>` không có `href`** ở `Dashboard.tsx:148` — không đúng ngữ nghĩa link, nên
  đổi thành `Button type="link"` hoặc thêm `href` hợp lệ + `preventDefault`.
- **Thanh cuộn ẩn mặc định** (`branding/tokens.css:53-79`, chỉ hiện khi hover) — giảm khả năng
  nhận biết nội dung có thể cuộn được đối với người dùng lần đầu/không dùng chuột; cân nhắc
  giữ thumb mờ thường trực (opacity thấp) thay vì ẩn hoàn toàn khi không hover.
- **Progress hiển thị 2 kiểu trong cùng `Dashboard.tsx`**: dùng component `Progress` chuẩn
  của AntD ở một khối (dòng 139) nhưng tự vẽ thanh tiến độ bằng `div` ở khối khác (dòng
  209-211) — nên hợp nhất về 1 cách.
- **`dangerouslySetInnerHTML`** trong `components/OfficialDocument.tsx:122` — hiện tại nội
  dung chỉ đến từ template nội bộ (`docTemplates.ts`) nên chưa phải lỗ hổng thật, nhưng cần
  ghi chú/rào chắn (sanitize hoặc comment cảnh báo) trước khi bất kỳ phần nào của nội dung
  văn bản có thể đến từ input người dùng (vd. phần "lý do", "ghi chú" nhập tay).
- **Message lỗi field mặc định AntD chưa cấu hình `validateMessages`** — các field `required`
  không có message riêng (`nhom`/`pha` trong `ProcessCatalog`/`ProcessCreate`, `cap` trong
  `NhiemVuCreate`) sẽ dùng thông báo mặc định của AntD, có thể ra tiếng Anh tuỳ locale
  `ConfigProvider` — nên xác nhận `ConfigProvider locale={viVN}` đã bọc toàn app (chưa thấy
  trong các file đã đọc) hoặc set `Form.Item rules` message rõ ràng cho mọi field required.

---

## 5. Điểm cần "click-test tay" trước khi coi là xong (không thể xác nhận chỉ qua đọc code)

`STATE.md` đã tự ghi nhận toàn bộ đợt nâng cấp BPMN editor **"CHƯA click-test trình duyệt"**
— review này xác nhận thêm, và mở rộng danh sách cần test tay ra ngoài phạm vi BPMN:

1. Toàn bộ danh sách checklist đã có trong `STATE.md` mục "Next action (0)" — vẫn còn treo.
2. `UserManagement`: xác nhận 3 nút chết (2.1) bằng mắt — có đúng là không phản hồi gì không.
3. `DossierDetail`: bấm "Xem"/"Tải" tài liệu (2.2) và "In / Lưu PDF" từ Modal footer (2.4) —
   kiểm tra có mở 2 hộp thoại in hay không, có cảnh báo khi popup bị chặn ở call-site đó
   không.
4. `BpmnTemplateDrawer`: thử chọn mẫu chỉ bằng bàn phím (Tab + Enter/Space) — xác nhận 3.6.
5. Responsive thật ở màn hình ≤768px cho các bảng có width cột cố định (`Worklist`,
   `ProcessMonitor`, `ProcessEventLog`) — xem có tràn ngang không dù đã có `scroll-x` ẩn của
   trình duyệt.
6. Kiểm tra `ConfigProvider` locale tiếng Việt có bọc toàn app không (ảnh hưởng message lỗi
   field mặc định, định dạng ngày trong DatePicker nếu có dùng).

---

## 6. Khuyến nghị ưu tiên (nếu chỉ chọn làm trước một ít)

| # | Việc | Vì sao ưu tiên | Effort |
|---|---|---|---|
| 1 | `UserManagement`: disable 3 nút chết + tooltip "Sắp ra mắt" (2.1) | Nút trông hoạt động nhưng chết — hại lòng tin nhanh nhất, chỉ vài dòng | Rất nhỏ |
| 2 | `DossierDetail`: disable/ẩn link "Xem/Tải" chưa nối (2.2) | Cùng lý do, ở màn hình nghiệp vụ chính (hồ sơ) | Rất nhỏ |
| 3 | Thêm `useConfirm()` cho "Tạm ngừng" quy trình (2.3) | Hành động rủi ro cao nhất hiện không có rào chắn nào | Nhỏ |
| 4 | Sửa double-print + kiểm tra popup-blocked ở mọi call-site `printOfficialDoc` (2.4) | Bug hành vi rõ ràng, đã thấy qua đọc code | Nhỏ |
| 5 | Gate card "Tài khoản demo" (mật khẩu lộ) sau biến môi trường trước khi demo ra ngoài VHT/khách hàng (2.5) | Rủi ro nếu môi trường này bị chia sẻ nhầm | Nhỏ |
| 6 | Quyết định số phận `EmptyState.tsx`: dùng thật hoặc xoá (3.1) | Code đã đầu tư thiết kế nhưng mồ côi — để lâu gây nhầm lẫn cho người review sau | Nhỏ–vừa |
| 7 | Thay `CURRENT_USER` hardcode bằng `useAuth().user` ở `Worklist`/`TaskFormModal` (3.3) | Sai lệch rõ khi demo đổi tài khoản đăng nhập | Nhỏ |
| 8 | Gộp logic zoom/fullscreen dùng chung giữa `BpmnEditor`/`BpmnViewer`, thống nhất xử lý lỗi import XML (3.5) | Đang lệch hành vi giữa 2 component tưởng như song sinh | Vừa |
| 9 | Thêm `showSizeChanger` + `pageSizeOptions` vào mặc định của `EntityTable` (3.12) | Sửa 1 nơi, lan ra mọi bảng trong app | Rất nhỏ |
| 10 | Thêm `scroll={{ y }}` cho các bảng danh sách chính + đưa `FormLibrary` về cùng mặc định phân trang (3.10, 3.11) | Tránh cuộn toàn trang khi danh sách dài, đồng bộ hành vi phân trang | Nhỏ–vừa |
| 11 | Bọc `ProcessCreate`/tab sửa BPMN trong khung `flex column` chiếm phần còn lại viewport thay vì `74vh` tuyệt đối (3.13) | Panel/drawer đã tự cuộn tốt, chỉ còn thiếu khung trang cố định để tránh cuộn toàn trang | Vừa |

---

## 7. Bảng tổng hợp theo trang (nhanh)

| Trang | Loading state | Empty/404 | Confirm hành động phá huỷ | Feedback sau hành động | Ghi chú nổi bật |
|---|---|---|---|---|---|
| Login | n/a | n/a | n/a | `message` success/error | Lộ mật khẩu demo công khai (2.5) |
| Dashboard | không cần (mock) | Empty AntD trực tiếp | n/a | n/a | 2 kiểu progress khác nhau |
| Worklist | không cần | Empty text tự chế (emoji) | n/a | qua modal con | `CURRENT_USER` hardcode (3.3) |
| ProcessCatalog | không cần | `EntityTable` chuẩn | không (đóng modal mất dữ liệu) | Đầy đủ | — |
| ProcessCreate | `Spin` khi lazy-load editor | n/a | không (rời trang chỉ có beforeunload) | Đầy đủ | — |
| ProcessDetail | `Spin` khi lazy-load | `NotFound` chuẩn | **thiếu** ở "Tạm ngừng" (2.3) | Đầy đủ, nhất quán | Nút "Xem" biểu mẫu icon-only không tooltip |
| DossierList | không cần | `EntityTable` chuẩn | n/a | n/a | — |
| DossierDetail | không cần | `NotFound` chuẩn | thiếu ở "In/PDF" | thiếu khi in thành công (im lặng) | Link tài liệu chết (2.2), double-print (2.4) |
| NhiemVuList | không cần | `EntityTable` chuẩn | n/a | n/a | Định dạng dự toán khác NhiemVuCreate (3.8) |
| NhiemVuCreate | không cần | n/a | không (nút Hủy mất dữ liệu) | Đầy đủ | — |
| NhiemVuDetail | không cần | `NotFound` chuẩn | n/a | n/a | — |
| FormLibrary | `Spin` khi lazy-load designer | Mixed (Empty mặc định) | **Có** (`Popconfirm`, mẫu tốt nhất) | Đầy đủ | Chuẩn tham chiếu cho pattern confirm |
| UserManagement | không cần | `EntityTable` chuẩn | n/a (nút không hoạt động) | **Không có gì** | 3 nút chết không cue (2.1) |
| ProcessMonitor | không cần | `EntityTable` chuẩn | n/a | n/a | Có Alert "mock" minh bạch |
| IntegrationStatus | không cần | n/a (data tĩnh) | n/a | n/a | 1 chỉ số color-only (3.7) |
| ProcessEventLog | không cần | 2 kiểu Empty khác nhau trong cùng file | n/a | n/a | — |

---

## 8. Kết luận

App đã có **nền tảng UX tốt hơn mức trung bình của một prototype** cùng giai đoạn: hệ thống
component dùng chung thật sự được tái sử dụng, trạng thái không phụ thuộc màu đơn, feedback
sau hành động khá đầy đủ ở các luồng nghiệp vụ chính, và BPMN editor đã được đầu tư một đợt
UX nghiêm túc và **đã lên code thật** (không chỉ nằm trong kế hoạch).

Khoảng trống chính không nằm ở "thiếu ý tưởng thiết kế" mà ở **độ đồng nhất khi nhân rộng ra
toàn app**: cùng một loại hành động (xoá/tạm ngừng/huỷ nhập liệu) được xử lý khác nhau ở các
trang khác nhau, một vài nút "chưa nối" bị bỏ quên không có visual cue, và một component
empty-state đã thiết kế xong nhưng chưa từng được dùng. Đây đều là các sửa nhỏ, rủi ro thấp,
và nên làm **trước khi bất kỳ ai ngoài đội dự án nhìn thấy app** (đặc biệt mục 2.1/2.2/2.5) —
vì chúng ảnh hưởng trực tiếp đến ấn tượng "có phải cái này bị hỏng không" của người xem demo.

Bổ sung sau khi rà lại theo góp ý (2026-07-04): cùng một dạng "thiếu đồng nhất" cũng xuất hiện
ở tầng **bảng dữ liệu** — không bảng nào có vùng cuộn riêng (3.10) nên danh sách dài buộc phải
cuộn toàn trang; `FormLibrary` là trang danh sách chính duy nhất tắt phân trang trong khi các
trang cùng vai trò đều bật (3.11); và không trang nào cho chọn số dòng/trang vì `EntityTable`
chưa bật `showSizeChanger` (3.12) — cả 3 điểm này sửa tập trung ở `EntityTable` sẽ lan ra toàn
bộ 10+ bảng cùng lúc, effort thấp so với phạm vi ảnh hưởng. Riêng màn **Tạo/Sửa quy trình**
(3.13): 2 panel dock nội bộ (drawer mẫu, panel thuộc tính) **đã cuộn riêng đúng như mong muốn**
— điểm còn thiếu là khung trang tổng thể chưa được ghim theo chiều cao viewport còn lại, nên
khi Card "Thông tin chung" cao hơn bình thường, cả trang (bao gồm cả tiêu đề "Sơ đồ BPMN")
trôi theo khi cuộn thay vì chỉ có canvas/panel cuộn nội bộ.

**Việc cần làm tiếp theo**: click-test tay theo mục 5 (đã gộp với checklist chưa test của đợt
nâng UX BPMN trong `STATE.md`), sau đó cập nhật `STATE.md` đánh dấu foundation F3 tiến thêm
một bước khi các mục ưu tiên ở mục 6 được xử lý.

---

## 9. Nhật ký xử lý (2026-07-04) — đã fix trong code

> Đã sửa và **typecheck sạch** (`tsc -b`, exit 0). Vẫn cần click-test tay theo mục 5 để xác
> nhận hành vi thực tế (đặc biệt các mục layout/scroll và in tài liệu).

| Mục | Trạng thái | Thay đổi chính |
|---|---|---|
| 2.1 | ✅ Đã fix | `UserManagement`: 3 nút Thêm/Sửa/Khoá → `disabled` + `Tooltip "Sắp ra mắt (F4 — RBAC/IAM)"`; thêm `Alert` "màn mô phỏng" như `ProcessMonitor` |
| 2.2 | ✅ Đã fix | `DossierDetail`: link "Xem/Tải" tài liệu → `Button disabled` + tooltip "Sắp ra mắt — chưa nối kho tài liệu" |
| 2.3 | ✅ Đã fix | `ProcessDetail`: bọc nút "Tạm ngừng" bằng `Popconfirm` (nút OK `danger`) — nhất quán pattern xác nhận với `FormLibrary` |
| 2.4 | ✅ Đã fix | `OfficialDocument.printOfficialDoc`: cờ `printed` đảm bảo `print()` chỉ gọi 1 lần; `DossierDetail` Modal footer nay kiểm tra popup-blocked → `message.warning` (đồng bộ với call-site còn lại) |
| 2.5 | ✅ Đã fix | `Login`: card "Tài khoản demo" chỉ hiện khi `import.meta.env.DEV` hoặc `VITE_SHOW_DEMO_ACCOUNTS=true` |
| 3.3 | ✅ Đã fix | `Worklist` + `TaskFormModal`: bỏ hằng `CURRENT_USER`, dùng `useAuth().user.hoTen` |
| 3.7 | ✅ Đã fix | `IntegrationStatus`: chỉ số `danger` thêm icon `ExclamationCircleFilled` (không còn chỉ dựa màu) |
| 3.9 | ✅ Đã fix | `DossierDetail`: tag trạng thái bước gom về 1 meta `STEP_TAG` + render qua `StatusTag` (thay 3 `Tag color` inline) |
| 3.10 | ✅ Đã fix | `EntityTable` forward `scroll` + default `scroll.x='max-content'`; 7 trang danh sách (`DossierList`, `Worklist`, `ProcessCatalog`, `NhiemVuList`, `UserManagement`, `ProcessMonitor`, `ProcessEventLog`, `FormLibrary`) truyền `scroll={{ y: LIST_SCROLL_Y }}` |
| 3.11 | ✅ Đã fix | `FormLibrary`: bỏ `pagination={false}` → về mặc định phân trang như các trang danh sách khác |
| 3.12 | ✅ Đã fix | `EntityTable`: mặc định thêm `showSizeChanger`, `pageSizeOptions=[10,20,50,100]`, `showTotal` — lan ra mọi bảng |
| 3.13 | ✅ Đã fix (một phần) | `ProcessCreate`: bọc khung `flex column` `height: calc(100vh - 112px)`, form "Thông tin chung" cố định, Card "Sơ đồ BPMN" `flex:1`; `BpmnEditor` thêm prop `height` (mặc định `74vh`), ProcessCreate truyền `height="100%"`. **Chưa áp dụng** cho tab BPMN trong `ProcessDetail` (nằm trong `Tabs` chung, ghim cả trang rủi ro layout — để lại sau khi click-test) |

**Chưa xử lý (cần quyết định/scope lớn hơn, giữ nguyên):**
- **3.1** `EmptyState` mồ côi — cần quyết định *dùng hay xoá* (quyết định sản phẩm, không tự ý).
- **3.2 / 3.8** Bất nhất định dạng ngày/tiền — nên có `utils/format` dùng chung; để lại tới khi nối dữ liệu thật.
- **3.4** Chuẩn hoá quy tắc confirm toàn app (`NhiemVuCreate` "Hủy", `ProcessCatalog` đóng modal mất dữ liệu) — đã xử lý 2 điểm nóng nhất (2.3, 3.9-adjacent), phần còn lại là mở rộng dần.
- **3.5** Gộp `BpmnEditor`/`BpmnViewer` — refactor vừa, cần click-test kỹ, tách PR riêng.
- **3.6** `BpmnTemplateDrawer` bàn phím — cần test tay với thao tác create.start; tách riêng.
- Các mục §4 (magic number, `<a>` không href, scrollbar ẩn, progress 2 kiểu, `dangerouslySetInnerHTML`, `validateMessages`) — tinh chỉnh, chưa khẩn cấp.

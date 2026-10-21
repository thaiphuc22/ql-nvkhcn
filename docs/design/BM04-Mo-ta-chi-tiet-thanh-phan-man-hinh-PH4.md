# BM.04 — Mô tả chi tiết màn hình (theo mẫu thành phần + luồng)

| Trường | Giá trị |
|---|---|
| **Dự án** | QTKHCN — Quản trị Khoa học Công nghệ (VHT) |
| **Mã tài liệu** | BM.04-QTKHCN-UI-DETAIL-v1.1 |
| **Ngày** | 31/07/2026 |
| **Nguồn UI** | Screenshot thiết kế/mock PH4 (Chi tiết quy trình, Ma trận phê duyệt, Ma trận hành động, Dashboard Optimize/DMN) |
| **Lưu ý** | Ví dụ BHXH trong template gốc **không** áp dụng. Toàn bộ mapping dưới đây thuộc miền QTKHCN. API/DB ghi **mục tiêu**; hiện trạng repo có thể còn mock đơn giản hơn UI trong ảnh. |

**Tham chiếu ảnh (thứ tự đính kèm chat):**

| # | Màn hình |
|---|---|
| 1–2 | Chi tiết quy trình (BPMN + lịch sử phiên bản) — RD02.02 |
| 3 | Danh sách luật phê duyệt |
| 4 | Tạo mới luật phê duyệt |
| 5 | Chi tiết luật phê duyệt |
| 6 | Danh sách loại phê duyệt |
| 7 | Popup tạo mới loại phê duyệt |
| 8 | Ma trận hành động — Luật hiển thị nút |
| 9 | Tạo mới luật hiển thị nút |
| 10–11 | Ma trận hành động — Danh mục nút |
| 12 | Dashboard / Báo cáo Optimize |
| 13 | Báo cáo DMN outcome |

---

# 3. THIẾT KẾ CHI TIẾT — PHÂN HỆ QUẢN TRỊ QUY TRÌNH (PH4)

## 3.1 QT-03 — Chi tiết quy trình

### 3.1.1 Thông tin chung chức năng

| Trường | Nội dung |
|---|---|
| **Mã chức năng** | QT-03 |
| **Mục đích** | Xem/cấu hình sơ đồ BPMN của một quy trình (VD `RD02.02`), xem thuộc tính phần tử và lịch sử phiên bản |
| **Người dùng mục tiêu** | Quản trị hệ thống / cấu hình quy trình (`canManageSystem` hoặc `!isChuNhiemDeTai` tùy chính sách) |
| **Đường dẫn truy cập** | Menu **Quản lý quy trình** → chọn quy trình → **Chi tiết quy trình**; URL mục tiêu `/quy-trinh/:ma` (VD `/quy-trinh/RD02.02`) |
| **Tiền điều kiện** | Đã đăng nhập; quy trình tồn tại; user đủ quyền mở chi tiết |
| **Hậu điều kiện** | Có thể xem sơ đồ; khi bật thuộc tính nâng cao và chọn node → panel thuộc tính có dữ liệu; có thể chuyển phiên bản lịch sử (xem) |
| **RTM** | PH4 — Quản lý quy trình; RD02.02 Xét duyệt NV KHCN cấp Tập đoàn |

### 3.1.2 Màn hình

Bố cục (theo screenshot):

1. Sidebar menu PH4 (Trang chủ, Quản lý quy trình, Ma trận phê duyệt, Ma trận hành động, Tác vụ hệ thống, Giám sát, Tích hợp, Nhật ký)  
2. Header: tiêu đề **Chi tiết quy trình** + nút **Thoát**  
3. Khối **Thông tin quy trình** (Mã, Tên)  
4. Canvas **Sơ đồ BPMN** + toolbar zoom + toggle **Thuộc tính nâng cao** + panel **Thuộc tính phần tử**  
5. Cột phải **Lịch sử phiên bản** (v1…v4)

### 3.1.3 Mô tả chi tiết các thành phần

| STT | Tên | Kiểu dữ liệu [Độ dài] | Input/Output | Giá trị khởi tạo | Mô tả (Mapping CSDL nếu có) |
|---|---|---|---|---|---|
| 1 | `lblPageTitle` | Label | OUTPUT | Chi tiết quy trình | Tiêu đề trang |
| 2 | `btnExit` | Button | — | ENABLED | Thoát về danh mục quy trình `/quy-trinh` |
| 3 | `txtProcessCode` | Textbox / Label readonly — VARCHAR(20) | OUTPUT | Theo `:ma` (VD `RD02.02`) | Mã quy trình. Mapping mục tiêu: `PROCESS_DEF.CODE` |
| 4 | `txtProcessName` | Textbox / Label readonly — NVARCHAR(255) | OUTPUT | VD `Xét duyệt NVKHCN cấp Tập đoàn` | Tên quy trình. Mapping: `PROCESS_DEF.NAME` |
| 5 | `pnlBpmnCanvas` | Canvas BPMN | I/O | XML phiên bản hiện hành | Hiển thị BPMN (swimlane, task, gateway). Mapping: `PROCESS_VERSION.BPMN_XML` |
| 6 | `btnZoomIn` / `btnZoomOut` / `btnHand` / `btnResetView` | Icon Button | — | ENABLED | Điều khiển viewport sơ đồ (client-only) |
| 7 | `swAdvancedProps` | Switch | INPUT | ON (theo ảnh) | Bật/tắt panel thuộc tính nâng cao bên phải canvas |
| 8 | `pnlElementProps` | Panel | OUTPUT | Empty state khi chưa chọn node | Text: *Chưa chọn phần tử…*. Khi chọn node: hiển thị cấu hình (id, name, candidateGroup, formKey, needRole…). Mapping: headers/extension trên element BPMN + bảng `PROCESS_STEP` (mục tiêu) |
| 9 | `lstVersionHistory` | List / Timeline | OUTPUT | Danh sách version DESC | Mỗi item: version (v4.0…), nhãn, thời điểm cập nhật, trạng thái **Hiện hành**. Mapping: `PROCESS_VERSION(VERSION_NO, LABEL, UPDATED_AT, IS_CURRENT)` |
| 10 | `tagVersionStatus` | Badge | OUTPUT | Hiện hành (xanh) | Đánh dấu phiên bản đang active |

### 3.1.4 Luồng nghiệp vụ

**Khởi tạo**

1. User mở chi tiết từ danh mục (mã `RD02.02`).  
2. Hệ thống load `PROCESS_DEF` + version `IS_CURRENT=1` → bind mã/tên; render BPMN XML lên canvas.  
3. Load `PROCESS_VERSION` order by version desc → panel lịch sử.  
4. Panel thuộc tính: empty (chưa chọn phần tử). Switch thuộc tính nâng cao theo preference (mặc định ON như ảnh).

**Thực hiện**

1. Zoom/pan trên canvas (client).  
2. Click một node → nếu `swAdvancedProps=ON` → panel hiển thị thuộc tính phần tử.  
3. Click một dòng lịch sử phiên bản → (mục tiêu) load BPMN của version đó ở chế độ xem; version hiện hành giữ badge Hiện hành.  
4. **Thoát** → về `/quy-trinh` (không lưu nếu chỉ xem).

**Case lỗi**

| Case | Xử lý |
|---|---|
| Không tìm thấy mã quy trình | Thông báo lỗi + điều hướng về danh mục |
| BPMN XML lỗi / rỗng | Canvas empty + message “Không tải được sơ đồ” |
| Không quyền | Ẩn menu / redirect theo guard |

**Kết quả:** User xem được sơ đồ và lịch sử; cấu hình chi tiết node (khi có quyền sửa — màn edit riêng hoặc mode sửa, TBD so với mock hiện tại).

### 3.1.5 API & DB (mục tiêu)

| API | Mô tả |
|---|---|
| `GET /api/processes/{code}` | Thông tin quy trình + version hiện hành |
| `GET /api/processes/{code}/versions` | Lịch sử phiên bản |
| `GET /api/processes/{code}/versions/{ver}/bpmn` | XML BPMN |

**DB:** `PROCESS_DEF`, `PROCESS_VERSION`, `PROCESS_STEP` (optional).

---

## 3.2 APPR-LIST — Danh sách luật phê duyệt

### 3.2.1 Thông tin chung

| Trường | Nội dung |
|---|---|
| **Mã** | APPR-01 |
| **Mục đích** | Quản lý danh sách luật phê duyệt (List View) |
| **User** | Admin / cấu hình PH4 |
| **URL** | Menu **Ma trận phê duyệt → Luật phê duyệt** |
| **Tiền ĐK** | Đã login + quyền |
| **Hậu ĐK** | Xem/tìm/xuất/thêm/xem chi tiết luật |

### 3.2.2 Thành phần

| STT | Tên | Kiểu [Độ dài] | I/O | Khởi tạo | Mô tả / Mapping |
|---|---|---|---|---|---|
| 1 | `lblTitle` | Label | OUT | Ma trận phê duyệt / Danh sách luật phê duyệt | Tiêu đề |
| 2 | `btnExportExcel` | Button | — | ENABLED | Xuất Excel theo bộ lọc hiện tại |
| 3 | `btnAddNew` | Button primary | — | ENABLED | Mở **Tạo mới luật phê duyệt** |
| 4 | `txtSearch` | Textbox — NVARCHAR(200) | IN | Placeholder “Tìm kiếm” | Tìm theo mã/tên luật (contains, trim) |
| 5 | `btnFilter` | Icon Button | IN | — | Bộ lọc nâng cao (loại phê duyệt, trạng thái, khoảng ngày — mục tiêu) |
| 6 | `chkSelectAll` | Checkbox | IN | UNCHECKED | Chọn tất cả dòng trang hiện tại |
| 7 | `chkRow` | Checkbox | IN | UNCHECKED | Chọn từng dòng (bulk — mục tiêu) |
| 8 | `colSTT` | Label Column | OUT | 1..n | Số thứ tự trang |
| 9 | `colRuleCode` | Label Column — VARCHAR(50) | OUT | VD `TLPD-2026-01`, `SUBMIT` | Mapping `APPROVAL_RULE.CODE` |
| 10 | `colRuleName` | Label Column — NVARCHAR(255) | OUT | VD Luật phê duyệt thẩm định cấp cơ sở | Mapping `APPROVAL_RULE.NAME` |
| 11 | `colApprovalType` | Label Column | OUT | Thẩm định hồ sơ / Gửi duyệt… | Mapping `APPROVAL_TYPE.NAME` via `APPROVAL_RULE.TYPE_ID` |
| 12 | `colCreatedAt` | Label Column — Date | OUT | DD/MM/YYYY | `APPROVAL_RULE.CREATED_AT` |
| 13 | `colUpdatedAt` | Label Column — Date | OUT | DD/MM/YYYY | `APPROVAL_RULE.UPDATED_AT` |
| 14 | `colStatus` | Badge | OUT | Đang chạy (xanh) | `APPROVAL_RULE.STATUS` (1=Đang chạy, …) |
| 15 | `btnView` | Icon (eye) | — | ENABLED | Mở **Chi tiết luật phê duyệt** |
| 16 | `lblTotal` | Label | OUT | Tổng số bản ghi: N | Tổng sau lọc |
| 17 | `cboPageSize` | Combobox | IN | 10/20 | Số dòng/trang |
| 18 | `pagination` | Pagination | I/O | Page 1 | First/Prev/Next/Last; giữ filter khi đổi trang |

### 3.2.3 Luồng nghiệp vụ

**Khởi tạo:** Load page 1, pageSize mặc định (10 hoặc 20 theo UI), status mặc định tất cả hoặc “Đang chạy”.

**Thực hiện:** Search debounce → reload list (AND với filter). Thêm mới → form tạo. Eye → chi tiết. Xuất Excel → file theo filter (log xuất — mục tiêu).

**Lỗi:** API lỗi → toast; không quyền → ẩn Thêm mới/Xuất.

### 3.2.4 API/DB

- `GET /api/approval-rules?q&type&status&page&size`  
- `GET /api/approval-rules/export`  
- Bảng: `APPROVAL_RULE`, `APPROVAL_TYPE`

---

## 3.3 APPR-CREATE — Tạo mới luật phê duyệt

### 3.3.1 Thông tin chung

| | |
|---|---|
| **Mã** | APPR-02 |
| **Mục đích** | Tạo luật: thông tin chung + bộ điều kiện (AND/OR) + nhóm phê duyệt |
| **URL** | Từ `btnAddNew` danh sách luật |
| **Tiền ĐK** | Quyền thêm |
| **Hậu ĐK** | Bản ghi `APPROVAL_RULE` + `APPROVAL_RULE_CONDITION` (+ gán group) |

### 3.3.2 Thành phần

| STT | Tên | Kiểu [Độ dài] | I/O | Khởi tạo | Mô tả / Mapping |
|---|---|---|---|---|---|
| 1 | `lblTitle` | Label | OUT | Tạo mới luật phê duyệt | |
| 2 | `btnCancel` | Button outline | — | ENABLED | Hủy; cảnh báo nếu form dirty |
| 3 | `btnSave` | Button primary | — | ENABLED | Validate + lưu |
| 4 | `cbxRuleName` | Combobox — NVARCHAR(255) * | IN | VD Thẩm định cấp cơ sở | Tên luật / mẫu tên. Mapping `APPROVAL_RULE.NAME` |
| 5 | `cbxTypeCode` | Combobox — VARCHAR(50) * | IN | `THAM_DINH` | Mã loại phê duyệt. Load `APPROVAL_TYPE.CODE` |
| 6 | `cbxTypeName` | Combobox — NVARCHAR(255) * | IN | Thẩm định hồ sơ | Tên loại; sync theo `cbxTypeCode`. `APPROVAL_TYPE.NAME` |
| 7 | `cbxCondField[i]` | Combobox * | IN | VD Cấp nhiệm vụ | Trường điều kiện (catalog attribute). `APPROVAL_RULE_CONDITION.FIELD_CODE` |
| 8 | `cbxCondOperator[i]` | Combobox * | IN | Bằng | Toán tử: Bằng / Khác / In… `OPERATOR` |
| 9 | `cbxCondValue[i]` | Combobox/Text * | IN | VD Cơ sở | Giá trị so khớp. `VALUE` |
| 10 | `cbxLogic[i]` | Combobox | IN | VÀ (từ dòng 2) | AND/OR giữa các điều kiện. `LOGIC_OP` |
| 11 | `btnAddCond` | Icon + | — | | Thêm dòng điều kiện |
| 12 | `btnGroupCond` | Icon group | — | | Nhóm điều kiện (ngoặc) — mục tiêu |
| 13 | `btnDelCond` | Icon trash | — | | Xóa dòng (≥1 dòng bắt buộc) |
| 14 | `cbxApprovalGroup` | Combobox * | IN | Chuyên quản KHCN | Nhóm phê duyệt / candidateGroup. Mapping `APPROVAL_RULE.GROUP_CODE` ↔ role/candidateGroup |

### 3.3.3 Luồng nghiệp vụ

**Khởi tạo:** Load danh mục loại phê duyệt, catalog field điều kiện, danh mục nhóm phê duyệt; 1 dòng điều kiện trống; logic dòng 1 ẩn.

**Lưu:**

1. Validate required (*).  
2. Validate ≥1 điều kiện đủ field/operator/value.  
3. Insert `APPROVAL_RULE` (STATUS=Đang chạy, CREATED_BY, timestamps).  
4. Insert N `APPROVAL_RULE_CONDITION` theo thứ tự.  
5. Toast thành công → về danh sách hoặc chi tiết.

**Hủy:** Confirm nếu có thay đổi → về list.

**Lỗi:** Trùng mã luật (nếu hệ thống sinh/nhập mã) → báo lỗi field.

---

## 3.4 APPR-DETAIL — Chi tiết luật phê duyệt

### 3.4.1 Thông tin chung

| | |
|---|---|
| **Mã** | APPR-03 |
| **Mục đích** | Xem luật (readonly) + chuyển sang chỉnh sửa |
| **URL** | Từ icon eye danh sách |

### 3.4.2 Thành phần

| STT | Tên | Kiểu | I/O | Khởi tạo | Mô tả |
|---|---|---|---|---|---|
| 1 | `btnCancel` | Button | — | | Về danh sách |
| 2 | `btnEdit` | Button primary | — | | Sang mode sửa (form giống tạo, pre-fill) |
| 3 | `lblRuleName` | Label | OUT | Thẩm định cấp cơ sở | `APPROVAL_RULE.NAME` |
| 4 | `lblTypeCode` | Label | OUT | THAM_DINH | |
| 5 | `lblTypeName` | Label | OUT | Thẩm định hồ sơ | |
| 6 | Khối điều kiện | Combobox/Text (readonly hoặc disabled) | OUT | Cấp nhiệm vụ = Cơ sở; VÀ Loại hồ sơ = Xét duyệt | Hiển thị cấu hình đã lưu |
| 7 | `lblApprovalGroup` | Label/Text | OUT | Chuyên quản KHCN | |
| 8 | `btnAddCond` / copy / delete | Icon | — | Disabled ở view; enable ở edit | |

### 3.4.3 Luồng

Load rule + conditions → bind. **Chỉnh sửa** → enable input + **Lưu** (update). **Hủy** → list.

---

## 3.5 APPR-TYPE-LIST — Danh sách loại phê duyệt

### 3.5.1 Thông tin chung

| | |
|---|---|
| **Mã** | APPR-TYPE-01 |
| **Mục đích** | Danh mục loại phê duyệt dùng cho luật |
| **Menu** | Ma trận phê duyệt → Loại phê duyệt |

### 3.5.2 Thành phần

| STT | Tên | Kiểu | I/O | Khởi tạo | Mô tả / Mapping |
|---|---|---|---|---|---|
| 1 | `btnExportExcel` | Button | — | | Xuất Excel |
| 2 | `btnAddNew` | Button | — | | Mở popup **Tạo mới Loại phê duyệt** |
| 3 | `txtSearch` | Textbox | IN | Tìm kiếm | Theo mã/tên loại |
| 4 | `colTypeCode` | Column VARCHAR(50) | OUT | `THAM_DINH`, `XET_DUYET`, `SUBMIT` | `APPROVAL_TYPE.CODE` |
| 5 | `colTypeName` | Column NVARCHAR(255) | OUT | Thẩm định hồ sơ… | `APPROVAL_TYPE.NAME` |
| 6 | `colCreatedAt` / `colUpdatedAt` | Date | OUT | DD/MM/YYYY | |
| 7 | `colStatus` | Badge | OUT | Đang chạy | `APPROVAL_TYPE.STATUS` |
| 8 | `btnView` | Icon eye | — | | Xem/sửa chi tiết (mục tiêu) |
| 9 | Checkbox + STT + Pagination | | | | Giống list chuẩn |

### 3.5.3 Luồng

Tương tự list luật: search, phân trang, export, thêm mới popup.

---

## 3.6 APPR-TYPE-CREATE — Popup tạo mới loại phê duyệt

### 3.6.1 Thành phần

| STT | Tên | Kiểu [Độ dài] | I/O | Khởi tạo | Mô tả / Mapping |
|---|---|---|---|---|---|
| 1 | `mdlTitle` | Label | OUT | Tạo mới Loại phê duyệt | |
| 2 | `btnCloseX` | Icon | — | | Đóng popup |
| 3 | `txtTypeCode` | Textbox VARCHAR(50) * | IN | VD `XETDUYET_HS_CS` | Mã loại — unique. `APPROVAL_TYPE.CODE` |
| 4 | `txtApiKey` | Textbox NVARCHAR(255) * | IN | VD mô tả/key nghiệp vụ | Theo UI ảnh: nhãn **API Key** — lưu `APPROVAL_TYPE.API_KEY` hoặc `NAME` tùy chốt BA (cần confirm: ảnh có thể map nhầm label; đề xuất: CODE + NAME/API_KEY) |
| 5 | `btnCancel` | Button | — | | Đóng không lưu |
| 6 | `btnSave` | Button | — | | Validate + INSERT |

> **Open point:** Trên screenshot, field 2 nhãn “API Key” nhưng giá trị dạng tên tiếng Việt — cần BA chốt: đó là **Tên loại** hay **API Key** thật. Tài liệu tạm mapping `APPROVAL_TYPE.NAME` nếu là tên hiển thị; nếu là key kỹ thuật thì `API_KEY` và bổ sung field Tên.

### 3.6.2 Luồng

Thêm mới → popup → nhập → Lưu: check trùng `CODE` → insert STATUS=Đang chạy → đóng popup → refresh grid. Hủy/X → đóng.

---

## 3.7 ACT-RULE-LIST — Luật hiển thị nút (Ma trận hành động)

### 3.7.1 Thông tin chung

| | |
|---|---|
| **Mã** | ACT-01 |
| **Mục đích** | Danh sách luật quyết định khi nào hiện nút hành động trên UI hồ sơ |
| **Menu** | Ma trận hành động → tab **Luật hiển thị nút** |

### 3.7.2 Thành phần

| STT | Tên | Kiểu | I/O | Khởi tạo | Mô tả / Mapping |
|---|---|---|---|---|---|
| 1 | `tabsActionMatrix` | Tabs | IN | Tab Luật hiển thị nút | Tabs: Luật hiển thị nút \| Đối soát BPMN \| Danh mục nút |
| 2 | `btnExportExcel` / `btnAddNew` | Button | — | | Xuất / Tạo mới luật hiển thị nút |
| 3 | `txtSearch` | Textbox | IN | | Tìm mã luật / mã hành động / tên |
| 4 | `colRuleCode` | Column | OUT | `LHD-2026-01` | `ACTION_DISPLAY_RULE.CODE` |
| 5 | `colActionCode` | Column | OUT | `APPROVE_STEP`, `REJECT_STEP` | `ACTION_CATALOG.CODE` |
| 6 | `colActionName` | Column | OUT | Đồng ý duyệt / Từ chối duyệt | `ACTION_CATALOG.DEFAULT_NAME` |
| 7 | `colProcess` | Column | OUT | `RD02.02 - …` | `PROCESS_DEF.CODE` + name |
| 8 | `colCreatedAt` / `colUpdatedAt` | Date | OUT | | |
| 9 | `colStatus` | Badge | OUT | Đang chạy | |
| 10 | `btnView` | Icon | — | | Chi tiết/sửa |

### 3.7.3 Luồng

Đổi tab → load dataset tương ứng. CRUD luật hiển thị gắn process + action.

---

## 3.8 ACT-RULE-CREATE — Tạo mới luật hiển thị nút

### 3.8.1 Thành phần

| STT | Tên | Kiểu | I/O | Khởi tạo | Mô tả / Mapping |
|---|---|---|---|---|---|
| 1 | `btnCancel` / `btnSave` | Button | — | | Hủy / Lưu |
| 2 | `cbxAction` | Combobox * | IN | Gửi duyệt (SUBMIT) | Chọn từ danh mục nút. `ACTION_ID` |
| 3 | `txtDisplayName` | Textbox * | IN | Trình duyệt | Nhãn hiển thị trên UI hồ sơ. `DISPLAY_NAME` |
| 4 | `cbxActionKind` | Combobox * | IN | Hành động chính | PRIMARY / MORE / … `ACTION_KIND` |
| 5 | `cbxTone` | Combobox * | IN | Chính | Sắc thái nút (primary/danger…). `TONE` |
| 6 | `cbxScreen` | Combobox * | IN | Chi tiết Hồ sơ | Màn áp dụng. `SCREEN_CODE` |
| 7 | `cbxProcess` | Combobox | IN | RD02.02 - … | Quy trình áp dụng. `PROCESS_CODE` |
| 8 | `cbxStep` | Combobox | IN | 01-Khởi tạo | Bước BPMN/element. `STEP_KEY` |
| 9 | `cbxForm` | Combobox | IN | BM02 - Tạo hồ sơ | Form-js gắn action. `FORM_KEY` |
| 10 | `cbxRole` | Combobox | IN | Chọn vai trò | Vai trò được thấy nút. `ROLE_CODE` / candidateGroup |
| 11 | `lstVersionHistory` | List | OUT | v2.0 Hiện hành | Version luật (nếu có versioning) |

### 3.8.2 Luồng

Khởi tạo load catalog action/process/step/form/role. Lưu → validate * → INSERT rule (+ version) → toast → về list tab Luật hiển thị nút.

**Liên hệ runtime:** Khi mở HS-03, Action Studio/engine đọc rule theo process+step+role+form → quyết định hiện/ẩn nút (tham chiếu simulator đã có trong mock).

---

## 3.9 ACT-BUTTON-CATALOG — Danh mục nút

### 3.9.1 Thành phần (tab Danh mục nút)

| STT | Tên | Kiểu | I/O | Khởi tạo | Mô tả / Mapping |
|---|---|---|---|---|---|
| 1 | `colButtonCode` | Column | OUT | `APPROVE_STEP`, `REJECT_STEP` | `ACTION_CATALOG.CODE` |
| 2 | `colDefaultName` | Column | OUT | Đồng ý duyệt… | `DEFAULT_NAME` |
| 3 | `colAppliedRules` | Tags / Text | OUT | Danh sách luật / label | Luật hiển thị đang áp dụng cho nút |
| 4 | `btnView` | Icon | — | | Chi tiết catalog |
| 5 | Search / Export / Thêm mới / Pagination | | | | Chuẩn list |

### 3.9.2 Luồng

Quản lý master nút độc lập với luật; một nút có thể gắn nhiều luật hiển thị (cột tags).

---

## 3.10 DASH-OPT — Dashboard / Báo cáo Optimize

### 3.10.1 Thông tin chung

| | |
|---|---|
| **Mã** | DASH-04 / OPT-01 |
| **Mục đích** | Theo dõi KPI quy trình, điểm nghẽn, hồ sơ theo đơn vị, vượt SLA |
| **User** | Lãnh đạo / CQ QLKHCN / Admin |
| **Tabs** | Tổng quan \| **Báo cáo Optimize** \| Báo cáo DMN outcome |

### 3.10.2 Thành phần

| STT | Tên | Kiểu | I/O | Khởi tạo | Mô tả / Mapping |
|---|---|---|---|---|---|
| 1 | `tabsReport` | Tabs | IN | Báo cáo Optimize | Đổi báo cáo |
| 2 | `segPeriod` | Segmented | IN | Tháng / Quý / Khoảng | Kỳ báo cáo |
| 3 | `dtpRange` | DateRange | IN | Theo kỳ | Từ ngày – Đến ngày |
| 4 | `kpiTotalProcess` | StatCard | OUT | N | Tổng số quy trình |
| 5 | `kpiRunningProcess` | StatCard | OUT | N | Quy trình đang chạy |
| 6 | `kpiNotDeployed` | StatCard | OUT | N | Chưa triển khai |
| 7 | `kpiRunningDossier` | StatCard | OUT | N | Hồ sơ đang chạy |
| 8 | `chtProcessByGroup` | StackedBar | OUT | | Số quy trình theo nhóm giai đoạn × Cơ sở/Tập đoàn |
| 9 | `chtBottleneck` | Bar | OUT | Top 10 | Thống kê điểm nghẽn theo bước |
| 10 | `grdDossierByUnit` | Table | OUT | | Đơn vị, tổng HS, đang xử lý, hoàn thành, trễ hạn, tỷ lệ quá hạn |
| 11 | `grdSlaBreach` | Table | OUT | | Mã HS, đề tài, quy trình, quá hạn, bước, đơn vị, phụ trách |
| 12 | `cboLevelFilter` | Combobox | IN | Cấp cơ sở | Lọc bảng SLA |

### 3.10.3 Luồng

Đổi kỳ/tab → gọi API aggregate (mock: `optimizeAnalytics`) → refresh KPI/chart/table. Click dòng HS (mục tiêu) → `/ho-so/:id`.

### 3.10.4 API/DB mục tiêu

`GET /api/analytics/optimize?from&to&grain` — nguồn event Camunda + domain HoSo.

---

## 3.11 DASH-DMN — Báo cáo DMN outcome

### 3.11.1 Thành phần

| STT | Tên | Kiểu | I/O | Khởi tạo | Mô tả |
|---|---|---|---|---|---|
| 1 | `chtOutcomeByRd` | 100% StackedBar | OUT | | Đồng ý / Điều chỉnh / Từ chối theo RD01,02,05,06 |
| 2 | `chtOutcomeByBudget` | 100% StackedBar | OUT | | Theo dải ngân sách &lt;5 / 5–20 / &gt;20 tỷ |
| 3 | `chtOutcomeByLevel` | 100% StackedBar | OUT | | Cơ sở vs Tập đoàn |
| 4 | `chtReworkLoops` | Bar | OUT | | Số lần quay lại 0..3 |
| 5 | `grdTopDmnRules` | Table | OUT | | Rule code, điều kiện, lượt khớp, loại (Định tuyến / Chặn) |

**Mapping mục tiêu:** log thực thi DMN (`DMN_EXECUTION_LOG`), outcome enum AGREED/ADJUST/REJECT.

---

# 4. THIẾT KẾ DÙNG CHUNG VÀ TÁI SỬ DỤNG

| Thành phần dùng chung | Mô tả tái sử dụng |
|---|---|
| **Layout PH4** | Sidebar + header + content card trắng, accent đỏ |
| **List chuẩn** | Tiêu đề + Xuất Excel + Thêm mới + Search + Filter + Table (checkbox, STT, …, Trạng thái badge, eye) + Tổng bản ghi + Pagination |
| **Form tạo/sửa** | Header Hủy/Lưu; section có gạch đỏ bên trái; field * bắt buộc |
| **Condition builder** | Dòng Field–Operator–Value + Logic VÀ/HOẶC + add/group/delete |
| **Version history panel** | Cột phải: version, nhãn, thời điểm, badge Hiện hành (dùng ở Chi tiết quy trình, luật hành động) |
| **BPMN canvas toolkit** | Zoom/hand/reset + properties panel |
| **Status badge** | “Đang chạy” = xanh |
| **Empty property panel** | Message hướng dẫn chọn phần tử |
| **Export Excel** | Theo filter hiện tại; (mục tiêu) ghi audit export |
| **Toggle View (nếu áp dụng danh mục)** | Grid / List / Process Map — tham chiếu PORTAL/QT catalog |

---

# 5. THIẾT KẾ ĐẢM BẢO TUÂN THỦ TIÊU CHUẨN QUẢN TRỊ DỮ LIỆU

## 5.1 Quản trị dữ liệu — Bảng danh mục CDE (trích yếu QTKHCN)

| STT | Tên trường dữ liệu | Mô tả | Bảng dữ liệu | Trường dữ liệu | Loại dữ liệu | Chủ sở hữu dữ liệu |
|---|---|---|---|---|---|---|
| 1 | Mã quy trình | Định danh định nghĩa quy trình RD | PROCESS_DEF | CODE | string | Ban QLKHCN / PH4 |
| 2 | Tên quy trình | Tên nghiệp vụ quy trình | PROCESS_DEF | NAME | string | Ban QLKHCN |
| 3 | BPMN XML | Định nghĩa sơ đồ phiên bản | PROCESS_VERSION | BPMN_XML | clob/xml | PH4 Config |
| 4 | Phiên bản quy trình | Số version + hiện hành | PROCESS_VERSION | VERSION_NO, IS_CURRENT | string/bool | PH4 Config |
| 5 | Mã luật phê duyệt | Định danh luật | APPROVAL_RULE | CODE | string | PH4 Config |
| 6 | Điều kiện luật | Field/operator/value/logic | APPROVAL_RULE_CONDITION | FIELD_CODE, OPERATOR, VALUE, LOGIC_OP | string | PH4 Config |
| 7 | Nhóm phê duyệt | candidateGroup / role | APPROVAL_RULE | GROUP_CODE | string | PH2 + PH4 |
| 8 | Mã loại phê duyệt | Danh mục loại | APPROVAL_TYPE | CODE | string | PH4 Config |
| 9 | Mã hành động (nút) | Catalog nút UI | ACTION_CATALOG | CODE | string | PH4 Config |
| 10 | Luật hiển thị nút | Rule hiện nút theo process/step/role | ACTION_DISPLAY_RULE | * | — | PH4 Config |
| 11 | Mã hồ sơ | Correlation nghiệp vụ | HO_SO | MA_HO_SO | string | Ban QLKHCN |
| 12 | Outcome DMN | Kết quả quyết định | DMN_EXECUTION_LOG | OUTCOME | enum | PH4 / Optimize |
| 13 | SLA / quá hạn | Số ngày vượt hạn | HO_SO / TASK metrics | OVERDUE_DAYS | number | Vận hành |
| 14 | Phạm vi dữ liệu user | Scope RBAC | USER_ROLE_ASSIGNMENT | DATA_SCOPE | enum | PH2 |

## 5.2 Bảo mật dữ liệu

- Chỉ Admin/configurer truy cập Ma trận phê duyệt / hành động / sửa BPMN.  
- candidateGroup và luật hiển thị nút **fail-closed** trên hồ sơ.  
- Không đưa business payload vào biến Camunda (D3).  
- Export Excel: kiểm soát quyền + (mục tiêu) audit.

## 5.3 Chất lượng dữ liệu

- Unique `APPROVAL_TYPE.CODE`, `ACTION_CATALOG.CODE`, `PROCESS_DEF.CODE`.  
- Điều kiện luật: bắt buộc đủ bộ field/operator/value.  
- Version BPMN: chỉ 1 `IS_CURRENT=true` / process.

## 5.4 Siêu dữ liệu / lưu trữ

- Catalog rule/action/process là master cấu hình; thay đổi có version history trên UI.  
- Log Optimize/DMN lưu phục vụ báo cáo; retention theo chính sách VHT (TBD).

---

# 6. PHÂN HỆ TÍCH HỢP / ĐỒNG BỘ DỮ LIỆU (thay ETL mẫu BCCS)

> Template gốc nêu ETL khách hàng BCCS/OCS — **không thuộc QTKHCN**. Dưới đây là khung tương đương cho tích hợp KHCN (màn **Tích hợp** + RD03 dataflow).

## 6.1 Luồng đồng bộ tiến độ / nhân sự / mua sắm / chi phí (minh họa)

### Thông tin chung luồng

| Hạng mục | Nội dung (thiết kế mục tiêu) |
|---|---|
| **Tên job** | `JOB_KHCN_SYNC_RD03_*` (NS / MS / SAP / PLM…) |
| **Nguồn** | Hệ thống QLNS, Mua sắm, SAP, PLM (tùy nhánh RD03) |
| **Cách thức** | API / file / message (Connector-Worker Camunda — framing Phase 2) |
| **Tần suất** | Online sự kiện hoặc batch định kỳ |
| **Giám sát** | Màn `/tich-hop` — trạng thái hệ thống, lỗi, retry |
| **DL nhạy cảm** | Nhân sự, chi phí — ghi log truy cập/chia sẻ |

### Luồng nghiệp vụ (tóm tắt)

1. Nhận sự kiện/đồng bộ từ hệ thống nguồn.  
2. Chuẩn hóa về schema domain QTKHCN (không ghi business vào Camunda).  
3. Cập nhật tiến độ/chi phí/SP gắn `NhiemVu`/`HoSo`.  
4. Ghi log tích hợp; cập nhật health trên UI Tích hợp.  
5. Lỗi → retry + cảnh báo dashboard rủi ro/tích hợp.

## 6.2 Luồng xử lý/tổng hợp analytics Optimize–DMN

| Hạng mục | Nội dung |
|---|---|
| **Job** | Aggregate KPI từ event process + outcome DMN |
| **Đích** | Bảng/serving layer cho DASH-OPT / DASH-DMN |
| **Lịch** | Batch giờ/ngày hoặc near-real-time |
| **UI** | Báo cáo Optimize, Báo cáo DMN outcome |

---

# 7. OPEN POINTS (cần BA chốt)

1. Field **API Key** trên popup Loại phê duyệt: là tên hiển thị hay key kỹ thuật?  
2. Version history trên luật hành động: có cho rollback không?  
3. Đối soát BPMN (tab giữa): chưa có screenshot chi tiết — bổ sung ở wave sau.  
4. Đồng bộ mã chức năng UI thiết kế (ảnh) với route hiện tại trong `webapp` (`ApprovalMatrix`, `ActionStudio`) khi implement sát UI mới.

---

*Hết phụ lục mô tả chi tiết theo mẫu thành phần + luồng — gắn với `BM04-Thiet-ke-chi-tiet-QTKHCN.md`.*

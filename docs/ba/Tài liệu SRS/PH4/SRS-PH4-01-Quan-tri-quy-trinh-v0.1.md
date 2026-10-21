---
ma_srs: SRS-PH4-01
ten: Quản trị quy trình
nhom: PH4 — Quản trị quy trình
version: 0.3
tac_gia: BA-AI
ngay_tao: 2026-08-05
trang_thai: Đã rà soát theo UI trangdt
nhap_cho_vts: false
oq_lien_quan: [OQ-QTKHCN-001, OQ-QTKHCN-002, OQ-QTKHCN-005]
blueprint_nguon: "webapp/src/pages/ProcessCatalog.tsx, webapp/src/pages/Dashboard.tsx, webapp/src/pages/ProcessMonitor.tsx, webapp/src/pages/Worklist.tsx"
---

# TÀI LIỆU THIẾT KẾ CHI TIẾT (SRS)
## THIẾT KẾ CHI TIẾT PHÂN HỆ QUẢN TRỊ QUY TRÌNH & NỀN TẢNG BPM (BPM PLATFORM & ACTION STUDIO)

**Phân hệ**: PH4 — Quản trị quy trình (BPM Platform / Action Studio / Process Engine)

### Bảng ghi nhận thay đổi
| Phiên bản | Ngày | Tác giả | Nội dung thay đổi |
|---|---|---|---|
| 0.1 | 2026-08-05 | BA-AI | Khởi tạo bản thảo SRS pilot cho Phân hệ PH4 Quản trị quy trình |
| 0.2 | 2026-08-05 | BA-AI | Cập nhật chi tiết Toggle View (Grid/List/Map), Camunda Optimize Dashboard KPI, BPMN Heatmap, Operate+Optimize Tabs và Worklist Task Rows từ nhánh `trangdt` |
| 0.3 | 2026-08-06 | BA-AI | Bổ sung chi tiết chức năng Giám sát tiến trình và xem chi tiết tiến trình theo mã hồ sơ (Section 12) |

### Trang ký
| Vai trò | Người thực hiện | Chức danh | Ngày ký | Chữ ký |
|---|---|---|---|---|
| Người lập | BA-AI | Business Analyst | 2026-08-05 | |
| Người kiểm tra | | BA Lead / Tech Lead | | |
| Người phê duyệt | | Product Owner | | |
| Đại diện khách hàng | | VTS / VTIT | | |

### Mục lục
- [1. GIỚI THIỆU](#1-giới-thiệu)
- [2. TỔNG QUAN GIẢI PHÁP](#2-tổng-quan-giải-pháp)
- [3. THIẾT KẾ CHI TIẾT](#3-thiết-kế-chi-tiết)
  - [3.0 Quy trình nghiệp vụ tổng thể](#30-quy-trình-nghiệp-vụ-tổng-thể)
  - [3.1 Quản lý quy trình BPMN & Toggle View Mode](#31-quản-lý-quy-trình-bpmn--toggle-view-mode)
  - [3.2 Ma trận quyết định (DMN / Rule Manager)](#32-ma-trận-quyết-định-dmn--rule-manager)
  - [3.3 Ma trận phê duyệt (Approval Matrix)](#33-ma-trận-phê-duyệt-approval-matrix)
  - [3.4 Ma trận hành động (Action Studio)](#34-ma-trận-hành-động-action-studio)
  - [3.5 Worklist — Việc của tôi (User Task Rows & SLA Warnings)](#35-worklist--việc-của-tôi-user-task-rows--sla-warnings)
  - [3.6 Giám sát tiến trình (Process Monitor: Heatmap & Operate/Optimize Tabs)](#36-giám-sát-tiến-trình-process-monitor-heatmap--operateoptimize-tabs)
  - [3.7 Leadership Dashboard (Optimize KPI & Biểu đồ)](#37-leadership-dashboard-optimize-kpi--biểu-đồ)
- [4. THIẾT KẾ DÙNG CHUNG VÀ TÁI SỬ DỤNG](#4-thiết-kế-dùng-chung-và-tái-sử-dụng)
- [5. THIẾT KẾ ĐẢM BẢO TUÂN THỦ TIÊU CHUẨN QUẢN TRỊ DỮ LIỆU](#5-thiết-kế-đảm-bảo-tuân-thủ-tiêu-chuẩn-quản-trị-dữ-liệu)
- [6. PHỤ LỤC](#6-phụ-lục)

---

## 1. GIỚI THIỆU

### 1.1 Mục đích
Tài liệu SRS này mô tả chi tiết thiết kế cho **Phân hệ PH4: Quản trị quy trình (BPM Platform)**. Đây là phân hệ nền tảng điều phối luồng công việc (Workflows), ma trận quyết định (DMN), ma trận phê duyệt (Approval Matrix), ma trận hành động (Action Studio), Worklist công việc và Giám sát tiến trình cho toàn bộ hệ thống QTKHCN.

---

## 2. TỔNG QUAN GIẢI PHÁP

### 2.1 Tổng quan chức năng
Hệ thống áp dụng kiến trúc Seam A (App ↔ Camunda Engine): Camunda Engine làm nhiệm vụ điều phối luồng trạng thái (`instanceKey`, `taskDefinitionKey`), ứng dụng QTKHCN chịu trách nhiệm quản lý dữ liệu nghiệp vụ, hiển thị dashboard Optimize analytics và giao diện người dùng.

---

## 3. THIẾT KẾ CHI TIẾT

### 3.1 Quản lý quy trình BPMN & Toggle View Mode

#### 3.1.1 Chức năng Toggle View Mode (Nhánh `trangdt` - `ProcessCatalog.tsx`)
- Màn hình `/quy-trinh` hỗ trợ 3 chế độ xem danh mục quy trình:
  - **Grid View (Chế độ Thẻ)**: Hiển thị dạng Card lưới gồm thumbnail sơ đồ BPMN, mã quy trình, tên quy trình, cờ `isDeployed`.
  - **List View (Chế độ Bảng)**: Hiển thị dạng Datagrid chi tiết.
  - **Map View (Chế độ Sơ đồ phân nhánh)**: Hiển thị dạng cây liên kết giữa các phân hệ và quy trình.

| STT | Tên | Kiểu dữ liệu [Độ dài] | Input/Output | Giá trị khởi tạo | Mô tả mapping CSDL | Ghi chú |
|---|---|---|---|---|---|---|
| 1 | Toggle View Mode | Radio Group / Segmented | Input | "grid" | Segmented control `grid` / `list` / `map` | Thay đổi hiển thị danh mục |
| 2 | Nút Đồng bộ từ Camunda | Button | Input | Enabled | Tham chiếu chi tiết [SRS-BPM-01](../SRS-BPM-01-Dong-bo-quy-trinh-tu-Camunda-v0.1.md) | Icon Sync |

---

### 3.2 Ma trận quyết định (DMN / Rule Manager)
- Quản lý các bảng quyết định DMN (Decision Table) cho các quy tắc tính toán điểm số hội đồng.

---

### 3.3 Ma trận phê duyệt (Approval Matrix)
- Cấu hình xác định danh tính / vai trò người phê duyệt dựa trên ma trận Tổ chức $\times$ Cấp phê duyệt.

---

### 3.4 Ma trận hành động (Action Studio)
- Cầu nối 2 chiều giữa User Task trên BPMN và Nút bấm Action hiển thị tại màn hình Chi tiết hồ sơ.

---

### 3.5 Worklist — Việc của tôi (User Task Rows & SLA Warnings)

#### 3.5.1 Thông tin chung chức năng (Nhánh `trangdt` - `Worklist.tsx`)
- **Tác nhân**: Cán bộ xử lý / Người phê duyệt.
- **Ý nghĩa**: Giao diện tập trung hiển thị các công việc cần xử lý dạng Task Rows, hỗ trợ cờ Cảnh báo quá hạn SLA (Overdue warning).
- **Đường dẫn**: `/viec-cua-toi`.

#### 3.5.2 Mô tả chi tiết thành phần
| STT | Tên | Kiểu dữ liệu [Độ dài] | Input/Output | Giá trị khởi tạo | Mô tả mapping CSDL | Ghi chú |
|---|---|---|---|---|---|---|
| 1 | Bộ lọc Vai trò / Group | Select | Input | "Tất cả vai trò" | Lọc theo Candidate Group/Role của User Task | |
| 2 | Bộ lọc Trạng thái SLA | Select | Input | "Tất cả" | Lọc theo `Quá hạn SLA` / `Trong hạn` | Highlight màu đỏ khi quá hạn |
| 3 | Cột Mã hồ sơ / Mã NV | Link Column | Output | | `maHoSo` / `maNV` | Click mở màn hình xử lý |
| 4 | Cột Bước quy trình | Tag Column | Output | | Tên User Task hiện tại trên BPMN | |
| 5 | Cột Candidate Role | Tag Column | Output | | Vai trò được giao xử lý bước này | |
| 6 | Cột Hạn xử lý (SLA) | Label Column | Output | | Hạn xử lý + Badge Cảnh báo quá hạn | Badge đỏ "Quá hạn n ngày" |
| 7 | Nút Nhận việc / Xử lý | Button | Input | Enabled | Thao tác Claim Task và mở Form duyệt | |

---

### 3.6 Giám sát tiến trình (Process Monitor: Heatmap & Operate/Optimize Tabs)

#### 3.6.1 Thông tin chung chức năng (Nhánh `trangdt` - `ProcessMonitor.tsx`)
- **Tác nhân**: Quản trị viên quy trình, Admin, Quản lý nghiệp vụ.
- **Ý nghĩa**: Giám sát trạng thái tiến trình hoạt động của các hồ sơ/nhiệm vụ KHCN, phát hiện các điểm nghẽn và sự cố trong runtime.
- **Đường dẫn**: Chọn phân hệ > Quản lý Quy trình > Giám sát tiến trình (`/giam-sat-quy-trinh`).

#### 3.6.2 Màn hình
| STT | Tên màn hình | Mô tả | Ảnh |
|---|---|---|---|
| 1 | Màn hình Giám sát tiến trình (Operate) | Hiển thị danh sách các instance quy trình đang chạy, hoàn tất hoặc lỗi. | `![HÌNH 004 – Giám sát tiến trình](img/SRS-PH4-01/004-process-monitor.png)` |
| 2 | Màn hình Chi tiết tiến trình theo mã hồ sơ | Hiển thị sơ đồ BPMN runtime với các bước đã qua (màu xanh) và bước hiện tại (màu cam/đỏ). | `![HÌNH 005 – Chi tiết tiến trình](img/SRS-PH4-01/005-process-instance-detail.png)` |

#### 3.6.3 Mô tả chi tiết các thành phần (Bảng 7 cột)
| STT | Tên | Kiểu dữ liệu [Độ dài] | Input/Output | Giá trị khởi tạo | Mô tả mapping CSDL | Ghi chú |
|---|---|---|---|---|---|---|
| **Bộ lọc & Điều khiển** | | | | | | |
| 1 | Tab Switcher | Tabs | Input | "operate" | Chuyển đổi tab "Operate (Instances)" & "Optimize (Insights)" | |
| 2 | Tìm kiếm nhanh | Textbox [100] | Input | Blank | Tìm kiếm theo `instanceKey` hoặc `maHoSo` | So khớp chứa |
| **Danh sách Instance quy trình (Datagrid)** | | | | | | |
| 3 | Mã hồ sơ* | Link Column | Output | | `process_instance_log.ma_ho_so` | Click để xem chi tiết tiến trình |
| 4 | Tên quy trình | Label Column | Output | | `process_instance_log.process_name` | |
| 5 | Trạng thái | Tag Column | Output | | Enum: `ACTIVE`, `COMPLETED`, `INCIDENT` | |
| 6 | Thời gian bắt đầu | Label Column | Output | | `process_instance_log.start_time` | Định dạng: `dd/MM/yyyy HH:mm` |
| 7 | Nút Retry Incident | Button | Input | Enabled | Chỉ hiển thị khi trạng thái là `INCIDENT` | Chạy lại bước lỗi |

#### 3.6.4 Luồng nghiệp vụ
##### A. Tra cứu & Giám sát danh sách
| Bước | Mô tả |
|---|---|
| 1 | Người dùng truy cập đường dẫn `/giam-sat-quy-trinh`. |
| 2 | Hệ thống nạp danh sách các instance quy trình hiện tại từ Camunda Engine và hiển thị lên datagrid. |
| 3 | Người dùng có thể tìm kiếm theo mã hồ sơ hoặc lọc theo trạng thái (`ACTIVE`, `COMPLETED`, `INCIDENT`). |

##### B. Xem chi tiết tiến trình theo mã hồ sơ
| Bước | Mô tả |
|---|---|
| 1 | Người dùng click vào **Mã hồ sơ** trên datagrid. |
| 2 | Hệ thống hiển thị Màn hình Chi tiết tiến trình, tải sơ đồ quy trình BPMN tương ứng. |
| 3 | Các bước đã thực hiện xong được highlight màu xanh lục. Bước hiện tại được highlight màu cam (ACTIVE) hoặc màu đỏ (INCIDENT). |
| 4 | Người dùng có thể xem nhật ký chi tiết của từng bước (người thực hiện, thời gian bắt đầu, thời gian hoàn thành). |

#### 3.6.5 Quy tắc nghiệp vụ
| Mã quy tắc | Quy tắc | Áp dụng cho | Trạng thái |
|---|---|---|---|
| `BR-PH4-MON-01` | Chỉ những người dùng có quyền Quản lý (`ROLE_ADMIN` hoặc `ROLE_SECRETARY`) mới có quyền truy cập và thao tác trên màn hình Giám sát tiến trình. | Giám sát tiến trình | Chốt |

---

### 3.7 Leadership Dashboard (Optimize KPI & Biểu đồ)

#### 3.7.1 Thông tin chung chức năng (Nhánh `trangdt` - `Dashboard.tsx`)
- **Tác nhân**: Lãnh đạo VHT / Trưởng phòng KHCN.
- **Đường dẫn**: `/` (Trang chủ Tổng quan).
- **Chỉ số KPI Optimize**:
  - `Tổng số Quy trình đang chạy`: Đếm số instance ACTIVE.
  - `Tỷ lệ xử lý đúng hạn (%)`: Phần trăm hồ sơ xử lý trước SLA.
  - `Thời gian xử lý trung bình`: Thời gian hoàn thành trung bình (ngày).
  - `Số sự cố (Incidents)`: Cảnh báo số lỗi cần can thiệp.

---

## 4. THIẾT KẾ DÙNG CHUNG VÀ TÁI SỬ DỤNG
- Service `WorkflowTaskActionRouting` dùng chung cho toàn bộ giao diện duyệt hồ sơ tại các phân hệ RD01–RD08.

---

## 5. THIẾT KẾ ĐẢM BẢO TUÂN THỦ TIÊU CHUẨN QUẢN TRỊ DỮ LIỆU
- Tuân thủ 7 tiêu chuẩn quản trị dữ liệu (5.1–5.7).

---

## 6. PHỤ LỤC
- Nguồn code: `webapp/src/pages/ProcessCatalog.tsx`, `webapp/src/pages/Dashboard.tsx`, `webapp/src/pages/ProcessMonitor.tsx`, `webapp/src/pages/Worklist.tsx`.
- Bảng CSDL: `catalog`, `process_definition_version`, `action_availability_policy`, `process_instance_log`.

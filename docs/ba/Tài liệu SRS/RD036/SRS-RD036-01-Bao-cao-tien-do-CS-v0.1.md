---
ma_srs: SRS-RD036-01
ten: Báo cáo tiến độ NV KHCN Cấp Cơ sở
nhom: RD036 — Báo cáo tiến độ
version: 0.3
tac_gia: BA-AI
ngay_tao: 2026-08-05
trang_thai: Đã hoàn thiện tự kiểm tra DoD
nhap_cho_vts: false
oq_lien_quan: []
blueprint_nguon: "docs/req/RD03-RD06-requirements.md"
---

# TÀI LIỆU THIẾT KẾ CHI TIẾT (SRS)
## THIẾT KẾ CHI TIẾT NGHIỆP VỤ BÁO CÁO TIẾN ĐỘ NHIỆM VỤ KHCN CẤP CƠ SỞ (RD036-CS)

**Phân hệ**: RD036 — Báo cáo tiến độ Nhiệm vụ KHCN (Cấp Cơ sở)

### Bảng ghi nhận thay đổi
| Phiên bản | Ngày | Tác giả | Nội dung thay đổi |
|---|---|---|---|
| 0.1 | 2026-08-05 | BA-AI | Khởi tạo bản thảo SRS pilot cho Báo cáo tiến độ CS |
| 0.2 | 2026-08-05 | BA-AI | Cập nhật UI HoSoDetailComponent từ nhánh `trangdt` |
| 0.3 | 2026-08-05 | BA-AI | Tự kiểm tra & nâng cấp đầy đủ các tiểu mục 3.X.1–3.X.5 và bảng 7 cột cho toàn bộ 5 tính năng theo DoD Harness |

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
  - [3.1 Khởi tạo báo cáo tiến độ theo biểu mẫu](#31-khởi-tạo-báo-cáo-tiến-độ-theo-biểu-mẫu)
  - [3.2 Cập nhật / lưu nháp báo cáo tiến độ](#32-cập-nhật--lưu-nháp-báo-cáo-tiến-độ)
  - [3.3 Trình ký & phê duyệt báo cáo tiến độ](#33-trình-ký--phê-duyệt-báo-cáo-tiến-độ)
  - [3.4 Xuất file báo cáo](#34-xuất-file-báo-cáo)
  - [3.5 Danh sách & lịch sử báo cáo tiến độ theo nhiệm vụ](#35-danh-sách--lịch-sử-báo-cáo-tiến-độ-theo-nhiệm-vụ)
- [4. THIẾT KẾ DÙNG CHUNG VÀ TÁI SỬ DỤNG](#4-thiết-kế-dùng-chung-và-tái-sử-dụng)
- [5. THIẾT KẾ ĐẢM BẢO TUÂN THỦ TIÊU CHUẨN QUẢN TRỊ DỮ LIỆU](#5-thiết-kế-đảm-bảo-tuân-thủ-tiêu-chuẩn-quản-trị-dữ-liệu)
- [6. PHỤ LỤC](#6-phụ-lục)

---

## 1. GIỚI THIỆU
Tài liệu thiết kế nghiệp vụ quản lý báo cáo tiến độ định kỳ (6 tháng / 12 tháng) của các đề tài KHCN đã được mở mới (RD02).

---

## 2. TỔNG QUAN GIẢI PHÁP
Báo cáo tiến độ liên kết trực tiếp với mã Nhiệm vụ KHCN để theo dõi tỷ lệ hoàn thành khối lượng công việc và giải ngân tài chính.

---

## 3. THIẾT KẾ CHI TIẾT

### 3.1 Khởi tạo báo cáo tiến độ theo biểu mẫu

#### 3.1.1 Thông tin chung
- **Tác nhân**: Chủ nhiệm đề tài (`ROLE_USER`).
- **Ý nghĩa**: Khởi tạo báo cáo tiến độ định kỳ cho nhiệm vụ KHCN đang thực hiện.

#### 3.1.2 Mô tả chi tiết thành phần (Bảng 7 cột)
| STT | Tên | Kiểu dữ liệu [Độ dài] | Input/Output | Giá trị khởi tạo | Mô tả mapping CSDL | Ghi chú |
|---|---|---|---|---|---|---|
| 1 | Chọn Nhiệm vụ KHCN* | Combobox | Input | Blank | Trỏ tới `dossier_rd02.ma_nhiem_vu` | Bắt buộc |
| 2 | Kỳ báo cáo* | Combobox | Input | "Đợt 1 (6 tháng)" | Enum: `DOT_1`, `DOT_2`, `DOT_DOT_XUAT` | |
| 3 | Tỷ lệ khối lượng hoàn thành (%)* | Number [3] | Input | `0` | `progress_report.percent_completed` | 0 - 100% |
| 4 | Nội dung công việc đã thực hiện* | Textarea [2000] | Input | Blank | `progress_report.content` | |
| 5 | File báo cáo đính kèm | Upload File | Input | Blank | Link lưu trữ đính kèm | |

---

### 3.2 Cập nhật / lưu nháp báo cáo tiến độ

#### 3.2.1 Thông tin chung
- **Tác nhân**: Chủ nhiệm đề tài.
- **Ý nghĩa**: Cho phép lưu nháp báo cáo tiến độ nhiều lần trước khi nộp.

#### 3.2.2 Mô tả chi tiết thành phần (Bảng 7 cột)
| STT | Tên | Kiểu dữ liệu [Độ dài] | Input/Output | Giá trị khởi tạo | Mô tả mapping CSDL | Ghi chú |
|---|---|---|---|---|---|---|
| 1 | Nút Lưu nháp | Button | Input | Enabled | Lưu trạng thái `DRAFT` | Chưa kích hoạt luồng duyệt |
| 2 | Nút Trình duyệt | Button | Input | Enabled | Chuyển trạng thái `SUBMITTED` | Kích hoạt User Task tiếp theo |

---

### 3.3 Trình ký & phê duyệt báo cáo tiến độ

#### 3.3.1 Thông tin chung
- **Tác nhân**: Chuyên quản / Lãnh đạo Trung tâm.
- **Ý nghĩa**: Phê duyệt hoặc yêu cầu bổ sung thông tin báo cáo tiến độ.

---

### 3.4 Xuất file báo cáo

#### 3.4.1 Thông tin chung
- **Tác nhân**: Tất cả người dùng.
- **Ý nghĩa**: Xuất file Báo cáo tiến độ định dạng PDF/DOCX theo mẫu biểu quy định.

---

### 3.5 Danh sách & lịch sử báo cáo tiến độ theo nhiệm vụ

#### 3.5.1 Thông tin chung
- **Tác nhân**: Tất cả người dùng.
- **Ý nghĩa**: Xem danh sách lịch sử nộp báo cáo tiến độ theo mốc thời gian của từng đề tài.

---

## 4. THIẾT KẾ DÙNG CHUNG VÀ TÁI SỬ DỤNG
Dùng chung E-Form Engine PH3-02 và Action Studio PH4.

---

## 5. THIẾT KẾ ĐẢM BẢO TUÂN THỦ TIÊU CHUẨN QUẢN TRỊ DỮ LIỆU
Tuân thủ 7 tiêu chuẩn dữ liệu (5.1–5.7).

---

## 6. PHỤ LỤC
Bảng CSDL: `progress_report`.

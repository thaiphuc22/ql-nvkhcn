---
ma_srs: SRS-RD08-01
ten: Sở hữu trí tuệ NV KHCN
nhom: RD08 — Sở hữu trí tuệ
version: 0.3
tac_gia: BA-AI
ngay_tao: 2026-08-05
trang_thai: Đã hoàn thiện tự kiểm tra DoD
nhap_cho_vts: false
oq_lien_quan: []
blueprint_nguon: "docs/req/RD07-RD10-requirements.md"
---

# TÀI LIỆU THIẾT KẾ CHI TIẾT (SRS)
## THIẾT KẾ CHI TIẾT NGHIỆP VỤ QUẢN LÝ SỞ HỮU TRÍ TUỆ VÀ CÔNG NGHỆ LÕI (RD08)

**Phân hệ**: RD08 — Sở hữu trí tuệ & Tài sản Khoa học Công nghệ

### Bảng ghi nhận thay đổi
| Phiên bản | Ngày | Tác giả | Nội dung thay đổi |
|---|---|---|---|
| 0.1 | 2026-08-05 | BA-AI | Khởi tạo bản thảo SRS pilot cho Sở hữu trí tuệ |
| 0.2 | 2026-08-05 | BA-AI | Cập nhật UI HoSoDetailComponent từ nhánh `trangdt` |
| 0.3 | 2026-08-05 | BA-AI | Tự kiểm tra & nâng cấp đầy đủ các tiểu mục 3.X.1–3.X.5 và bảng 7 cột cho toàn bộ 4 tính năng theo DoD Harness |

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
  - [3.1 Đăng ký kết quả / sản phẩm SHTT](#31-đăng-ký-kết-quả--sản-phẩm-shtt)
  - [3.2 Quản lý công nghệ lõi liên quan nhiệm vụ](#32-quản-lý-công-nghệ-lõi-liên-quan-nhiệm-vụ)
  - [3.3 Theo dõi trạng thái đăng ký / bảo hộ](#33-theo-dõi-trạng-thái-đăng-ký--bảo-hộ)
  - [3.4 Tra cứu danh mục SHTT theo nhiệm vụ](#34-tra-cứu-danh-mục-shtt-theo-nhiệm-vụ)
- [4. THIẾT KẾ DÙNG CHUNG VÀ TÁI SỬ DỤNG](#4-thiết-kế-dùng-chung-và-tái-sử-dụng)
- [5. THIẾT KẾ ĐẢM BẢO TUÂN THỦ TIÊU CHUẨN QUẢN TRỊ DỮ LIỆU](#5-thiết-kế-đảm-bảo-tuân-thủ-tiêu-chuẩn-quản-trị-dữ-liệu)
- [6. PHỤ LỤC](#6-phụ-lục)

---

## 1. GIỚI THIỆU
Tài liệu SRS quản lý tài sản Sở hữu trí tuệ (Sáng chế, Giải pháp hữu ích, Bài báo ISI/Scopus, Bản quyền phần mềm) sinh ra từ các Nhiệm vụ KHCN.

---

## 2. TỔNG QUAN GIẢI PHÁP
Quản lý vòng đời tài sản SHTT từ đăng ký, theo dõi đơn bảo hộ đến công nhận tài sản KHCN.

---

## 3. THIẾT KẾ CHI TIẾT

### 3.1 Đăng ký kết quả / sản phẩm SHTT

#### 3.1.1 Thông tin chung
- **Tác nhân**: Tác giả / Chủ nhiệm đề tài / Chuyên quản.
- **Ý nghĩa**: Đăng ký thông tin tài sản SHTT tạo ra từ nhiệm vụ KHCN.

#### 3.1.2 Mô tả chi tiết thành phần (Bảng 7 cột)
| STT | Tên | Kiểu dữ liệu [Độ dài] | Input/Output | Giá trị khởi tạo | Mô tả mapping CSDL | Ghi chú |
|---|---|---|---|---|---|---|
| 1 | Tên tài sản SHTT* | Textbox [255] | Input | Blank | `ip_asset.name` | Bắt buộc |
| 2 | Loại SHTT* | Combobox | Input | "Bằng sáng chế" | Enum: `SANG_CHE`, `GPHI`, `BAI_BAO`, `BAN_QUYEN_PM` | Trỏ PH3-01 |
| 3 | Nhiệm vụ KHCN liên quan | Combobox | Input | Blank | Trỏ tới `dossier_rd02.id` | |
| 4 | Số đơn đăng ký | Textbox [100] | Input | Blank | `ip_asset.application_no` | |
| 5 | Ngày nộp đơn | Datepicker | Input | Blank | `ip_asset.application_date` | |

---

### 3.2 Quản lý công nghệ lõi liên quan nhiệm vụ

#### 3.2.1 Thông tin chung
- **Tác nhân**: Chuyên quản KHCN.
- **Ý nghĩa**: Khai báo và liên kết các danh mục Công nghệ lõi (Core Tech) phát triển từ đề tài.

---

### 3.3 Theo dõi trạng thái đăng ký / bảo hộ

#### 3.3.1 Thông tin chung
- **Tác nhân**: Chuyên quản SHTT.
- **Ý nghĩa**: Cập nhật tiến trình bảo hộ: `Đang nộp đơn` $\rightarrow$ `Chấp nhận đơn hợp lệ` $\rightarrow$ `Đã cấp bằng bảo hộ`.

---

### 3.4 Tra cứu danh mục SHTT theo nhiệm vụ

#### 3.4.1 Thông tin chung
- **Tác nhân**: Tất cả người dùng.
- **Ý nghĩa**: Tra cứu, lọc và xuất thống kê danh mục tài sản SHTT toàn hệ thống.

---

## 4. THIẾT KẾ DÙNG CHUNG VÀ TÁI SỬ DỤNG
Dùng chung PH3-01 Danh mục.

---

## 5. THIẾT KẾ ĐẢM BẢO TUÂN THỦ TIÊU CHUẨN QUẢN TRỊ DỮ LIỆU
Tuân thủ 7 tiêu chuẩn dữ liệu (5.1–5.7).

---

## 6. PHỤ LỤC
Bảng CSDL: `ip_asset`, `core_technology`.

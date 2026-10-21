# TỔNG HỢP BUSINESS RULES VÀ DECISION TABLES HỆ THỐNG QTKHCN

> **Chuẩn áp dụng:** IIBA BABOK v3 (KA-RADD) & `skill-br-extractor`.  
> **Mục đích:** Chuẩn hóa toàn bộ Quy tắc nghiệp vụ (Business Rules) và Bảng quyết định (Decision Tables - DMN) cho Phân hệ Quản lý Nhiệm vụ KHCN và Phân hệ Quản trị Quy trình.  
> **Chỉ số:** 25 Business Rules normalized, 3 Decision Tables chuẩn DMN. 100% Deterministic logic.

---

## 1. DANH MỤC BUSINESS RULES THEO PHÂN HỆ

### 1.1 Phân hệ RD01 — Xét duyệt Chủ trương KHCN
| Mã Rule | Tên Quy tắc | Điều kiện (Condition) | Hành động (Action) | Mức ưu tiên |
|---|---|---|---|---|
| `BR-RD01-001` | Kế hoạch năm | `dossier.keHoachNam == currentYear` và `kheHoachStatus == OPEN` | Cho phép trình nộp hồ sơ xin chủ trương | Must |
| `BR-RD01-002` | Dự toán dương | `dossier.tongKinhPhi > 0` | Cho phép chuyển bước thẩm định CQNV | Must |
| `BR-RD01-003` | Phân cấp Chủ trương | Nếu `tongKinhPhi >= 5000000000` (5 tỷ) HOẶC `hasTapDoanScope == true` | Gán `cap = "TD"`, ngược lại gán `cap = "CS"` | Must |

---

### 1.2 Phân hệ RD02 — Xét duyệt Nhiệm vụ KHCN Mở mới
| Mã Rule | Tên Quy tắc | Điều kiện (Condition) | Hành động (Action) | Mức ưu tiên |
|---|---|---|---|---|
| `BR-RD02-001` | Gate QĐ Chủ trương | `rd01Dossier.status == "PROCESS_COMPLETED"` và `decisionNumber != null` | Mở quyền khởi tạo hồ sơ xét duyệt RD02 | Must |
| `BR-RD02-010` | Sĩ số Hội đồng | `council.members.count >= 5` và `hasChủTịch == true` và `hasThưKý == true` | Cho phép kích hoạt Phiên họp xét duyệt | Must |
| `BR-RD02-011` | Quorum Xét duyệt | `(soPhieuDat / count(members)) >= 0.667` (2/3) | Thiết lập `quorumDat = true`, chuyển bước ban hành QĐ | Must |

---

### 1.3 Phân hệ RD03.6 — Báo cáo Tiến độ Nhiệm vụ KHCN
| Mã Rule | Tên Quy tắc | Điều kiện (Condition) | Hành động (Action) | Mức ưu tiên |
|---|---|---|---|---|
| `BR-RD036-001`| Kỳ báo cáo hợp lệ | `mission.status == "DANG_THUC_HIEN"` và đến mốc báo cáo 6 tháng/12 tháng | Mở form nộp Báo cáo tiến độ cho PM | Must |
| `BR-RD036-002`| Bắt buộc minh chứng | `report.fileDinhKemCount >= 1` và `fileSize <= 50MB` | Cho phép chuyển bước Chuyên quản đánh giá | Must |

---

### 1.4 Phân hệ RD05 — Nghiệm thu Nhiệm vụ KHCN
| Mã Rule | Tên Quy tắc | Điều kiện (Condition) | Hành động (Action) | Mức ưu tiên |
|---|---|---|---|---|
| `BR-RD05-001` | Gate QĐ Mở mới | `rd02Dossier.status == "PROCESS_COMPLETED"` và `decisionNumber != null` | Mở quyền khởi tạo hồ sơ Nghiệm thu RD05 | Must |
| `BR-RD05-010` | Quorum Nghiệm thu | `(soPhieuDat / count(members)) >= 0.667` và `diemTrungBinh >= 70.0` | Đánh giá Nhiệm vụ Nghiệm thu "ĐẠT" | Must |

---

### 1.5 Phân hệ RD06 — Quyết toán & SAP CS
| Mã Rule | Tên Quy tắc | Điều kiện (Condition) | Hành động (Action) | Mức ưu tiên |
|---|---|---|---|---|
| `BR-RD06-001` | Gate QĐ Nghiệm thu | `rd05Dossier.status == "PROCESS_COMPLETED"` | Mở quyền khởi tạo hồ sơ Quyết toán RD06 | Must |
| `BR-RD06-005` | Ngưỡng hạch toán SAP | `sapActualCost <= approvedBudget` | Tự động phê duyệt báo cáo quyết toán chi phí | Must |
| `BR-RD06-006` | Khóa sổ tài chính | `rd06Dossier.status == "BAN_HANH_QD_QUYET_TOAN"` | Khóa hoàn toàn ghi sổ tài chính đối với nhiệm vụ | Must |

---

### 1.6 Phân hệ PH4 — Quản trị Quy trình & Camunda 8
| Mã Rule | Tên Quy tắc | Điều kiện (Condition) | Hành động (Action) | Mức ưu tiên |
|---|---|---|---|---|
| `BR-BPM-001` | Fail-closed RBAC | `task.candidateGroups.isEmpty() == true` và `task.assignee == null` | Chuyển quyền xử lý về duy nhất `ADMIN_SYS` (Fail-closed) | Must |
| `BR-BPM-002` | Immutable Process | `processVersion.status == "DEPLOYED"` | Cấm sửa đổi trực tiếp XML, bắt buộc sinh VersionTag mới | Must |
| `BR-BPM-003` | Binding Outcome | `ActionAvailabilityPolicy` theo `(taskKey, actionCode)` | Tải đúng `formKey` tương ứng khi click nút Action | Must |

---

### 1.7 Phân hệ PH2 — Phân quyền & Identity
| Mã Rule | Tên Quy tắc | Điều kiện (Condition) | Hành động (Action) | Mức ưu tiên |
|---|---|---|---|---|
| `BR-PH2-001` | Token Validation | `token.exp > currentTime` và `token.signature == VALID` | Cho phép truy cập REST API backend | Must |
| `BR-PH2-002` | Scope Overlay (D11) | `UserRoleAssignment` quy định `dataScope` | Lọc kết quả SQL theo `CA_NHAN` / `DON_VI` / `TAP_DOAN` | Must |

---

## 2. BẢNG QUYẾT ĐỊNH DMN (DECISION TABLES)

### 2.1 Decision Table 1: Phân cấp Phê duyệt Nhiệm vụ KHCN (`DMN_PHAN_CAP_NHIEM_VU`)
Bảng quyết định này được gọi bởi Gateway trong BPMN để xác định cấp phê duyệt là Cơ sở (`CS`) hay Tập đoàn (`TD`).

| STT (Rule) | Tổng kinh phí (`tongKinhPhi`) | Phạm vi ứng dụng (`scope`) | Loại nhiệm vụ (`loaiNhiemVu`) | **Cấp phê duyệt (`cap`)** | **Bắt buộc HĐ Tập đoàn (`hasHDTD`)** |
|---|---|---|---|---|---|
| **R1** | $< 5.000.000.000$ VNĐ | NỘI_BỘ_TT | ĐỀ_TÀI_CS | `"CS"` | `false` |
| **R2** | $\ge 5.000.000.000$ VNĐ | NỘI_BỘ_TT | ĐỀ_TÀI_CS | `"TD"` | `true` |
| **R3** | Bất kỳ | TOÀN_TẬP_ĐOÀN | ĐỀ_TÀI_TĐ | `"TD"` | `true` |
| **R4** | Bất kỳ | NỐI_MẠNG_CÁC_ĐV | ĐỀ_TÀI_TĐ | `"TD"` | `true` |

---

### 2.2 Decision Table 2: Đánh giá Kết quả Thẩm định & Hội đồng (`DMN_KET_QUA_THAM_DINH`)
Bảng quyết định này được gọi sau khi Hội đồng hoặc Chuyên quản hoàn thành nộp phiếu.

| STT (Rule) | Tỷ lệ phiếu Đạt (`ratioDat`) | Có yêu cầu hiệu chỉnh (`hasHieuChinh`) | Điểm trung bình (`diemTB`) | **Kết luận (`ketLuan`)** | **Hành động luồng (`flowAction`)** |
|---|---|---|---|---|---|
| **R1** | $\ge 66.7\%$ ($2/3$) | `false` | $\ge 70.0$ | `"DAT"` | Chuyển bước phê duyệt ban hành |
| **R2** | $\ge 66.7\%$ ($2/3$) | `true` | $\ge 70.0$ | `"DONG_Y_BO_SUNG"` | Chuyển luồng sửa đổi (Phiên 2) |
| **R3** | $< 66.7\%$ ($2/3$) | Bất kỳ | $< 70.0$ | `"TU_CHOI"` | Chuyển luồng Từ chối (End Event) |
| **R4** | $< 50.0\%$ ($1/2$) | Bất kỳ | Bất kỳ | `"TU_CHOI"` | Chuyển luồng Từ chối (End Event) |

---

### 2.3 Decision Table 3: Định tuyến Loại điều chỉnh Nhiệm vụ RD04 (`DMN_DIEU_CHINH_RD04`)
Phân loại 10 luồng điều chỉnh đề tài theo Quyết định D5.

| STT (Rule) | Loại thay đổi (`loaiThayDoi`) | Vượt dự toán chủ trương (`vuotDuToan`) | Thay đổi mục tiêu lõi (`thayDoiMucTieu`) | **Mã luồng RD04 (`dieuChinhCode`)** | **Cấp thẩm quyền phê duyệt** |
|---|---|---|---|---|---|
| **R1** | Thay đổi Chủ nhiệm đề tài | `false` | `false` | `RD04_CHU_NHIEM` | TGĐ VHT |
| **R2** | Điều chỉnh kinh phí không tăng tổng | `false` | `false` | `RD04_KP_KHONG_TANG` | CQ_KHCN + CQ_TAI_CHINH |
| **R3** | Điều chỉnh tăng kinh phí trong chủ trương | `false` | `false` | `RD04_KP_TANG_TRONG_CT` | TGĐ VHT |
| **R4** | Điều chỉnh tăng kinh phí vượt chủ trương | `true` | Bất kỳ | `RD04_KP_VUOT_CT` | Cấp Tập đoàn (TĐ) |
| **R5** | Thay đổi Mục tiêu / Sản phẩm lõi | Bất kỳ | `true` | `RD04_MUC_TIEU` | Cấp Tập đoàn (TĐ) |
| **R6** | Tạm dừng / Dừng thực hiện nhiệm vụ | Bất kỳ | Bất kỳ | `RD04_TAM_DUNG` | Cấp Tập đoàn (TĐ) |

# DANH SÁCH USER STORIES CHUẨN IIBA / INVEST CHO HỆ THỐNG QTKHCN

> **Chuẩn áp dụng:** IIBA BABOK v3 & `skill-user-story-generator`.  
> **Tiêu chí Đánh giá (INVEST Criteria):**
> - `Independent`: Các Story độc lập có thể bàn giao riêng từng Sprint.
> - `Negotiable`: Mô tả mục tiêu người dùng, không hardcode giải pháp giao diện.
> - `Valuable`: Mang lại giá trị đo lường được bằng KPI kinh doanh/vận hành.
> - `Estimable`: Có thể ước lượng quy mô (Story Points $1, 2, 3, 5, 8$).
> - `Small`: Quy mô $\le 8$ points, chia nhỏ theo từng hành trình tác nhân.
> - `Testable`: Liên kết 1-1 với bộ Acceptance Criteria tại [Tai-lieu-AC-Cac-Chuc-Nang.md](file:///d:/ql-nvkhcn/docs/ba/Tai-lieu-AC-Cac-Chuc-Nang.md).

---

## 1. PHÂN HỆ RD01 — XÉT DUYỆT CHỦ TRƯƠNG KHCN

### US-RD01-01: Khởi tạo và trình nộp hồ sơ xin chủ trương
* **ID:** `US-RD01-01` | **Epic:** `EPIC-RD01-CHU-TRUONG` | **Story Points:** 3 | **Sprint:** S3
* **Actor:** Chủ nhiệm Nhiệm vụ / Người lập hồ sơ (`PM`/`NNC`)
* **User Story:**
  > Là **Chủ nhiệm nhiệm vụ (PM)**,  
  > Tôi muốn **khởi tạo và nộp hồ sơ xin phê duyệt chủ trương nhiệm vụ KHCN**,  
  > Để **cấp có thẩm quyền thẩm định và phê duyệt chủ trương triển khai đề tài trong Kế hoạch năm**.
* **Business Value:** Rút ngắn thời gian lập và trình nộp hồ sơ từ 7 ngày xuống $\le 1$ ngày; đảm bảo 100% hồ sơ trình nộp đúng mẫu và đúng Kế hoạch năm.
* **Ràng buộc Rule:** `BR-RD01-001` (Hồ sơ thuộc Kế hoạch năm), `BR-RD01-002` (Kinh phí xin chủ trương $> 0$).
* **Ma trận AC:** Liên kết `AC1`–`AC4` tại `F-RD01.1` trong [Tai-lieu-AC-Cac-Chuc-Nang.md](file:///d:/ql-nvkhcn/docs/ba/Tai-lieu-AC-Cac-Chuc-Nang.md#1-phân-hệ-rd01--xét-duyệt-chủ-trương-khcn).

---

### US-RD01-02: Thẩm định hồ sơ chủ trương và lập Báo cáo thẩm định
* **ID:** `US-RD01-02` | **Epic:** `EPIC-RD01-CHU-TRUONG` | **Story Points:** 5 | **Sprint:** S3
* **Actor:** Chuyên quản KHCN (`CQ_KHCN`)
* **User Story:**
  > Là **Chuyên quản KHCN (CQ_KHCN)**,  
  > Tôi muốn **thẩm định nội dung hồ sơ chủ trương và lập Báo cáo thẩm định**,  
  > Để **đánh giá sự phù hợp về định hướng công nghệ và điều kiện trình Hội đồng KHCN**.
* **Business Value:** Chuẩn hóa quy trình thẩm định chuyên môn; loại bỏ 100% việc rò rỉ hồ sơ chưa đủ điều kiện lên cấp Hội đồng.
* **Ma trận AC:** Liên kết `AC1`–`AC3` tại `F-RD01.2`.

---

## 2. PHÂN HỆ RD02 — XÉT DUYỆT NHIỆM VỤ KHCN MỞ MỚI

### US-RD02-01: Khởi tạo hồ sơ xét duyệt mở mới nhiệm vụ KHCN
* **ID:** `US-RD02-01` | **Epic:** `EPIC-RD02-XET-DUYET` | **Story Points:** 3 | **Sprint:** S4
* **Actor:** Chủ nhiệm Nhiệm vụ (`PM`)
* **User Story:**
  > Là **Chủ nhiệm nhiệm vụ (PM)**,  
  > Tôi muốn **khởi tạo hồ sơ xét duyệt mở mới đề tài từ Quyết định chủ trương đã duyệt**,  
  > Để **kế thừa thông tin chủ trương và bổ sung thuyết minh chi tiết nhiệm vụ KHCN**.
* **Business Value:** Tự động điền 80% thông tin đã được phê duyệt ở giai đoạn Chủ trương, loại bỏ rủi ro sai lệch dữ liệu giữa 2 giai đoạn.

---

### US-RD02-02: Hội đồng xét duyệt nộp phiếu đánh giá Phiên 1 & Phiên 2
* **ID:** `US-RD02-02` | **Epic:** `EPIC-RD02-XET-DUYET` | **Story Points:** 8 | **Sprint:** S5
* **Actor:** Thành viên Hội đồng Xét duyệt (`HDKHCN`)
* **User Story:**
  > Là **Thành viên Hội đồng Xét duyệt (HDKHCN)**,  
  > Tôi muốn **nhập phiếu nhận xét đánh giá xét duyệt mở mới trên biểu mẫu eForm**,  
  > Để **hệ thống tự động tổng hợp kết quả Quorum phê duyệt mở mới đề tài**.
* **Business Value:** Tự động hóa tính điểm và tỷ lệ Quorum ($\ge 2/3$); giảm 100% thời gian tổng hợp biên bản họp thủ công bằng tay.
* **Ma trận AC:** Liên kết `AC1`–`AC4` tại `F-RD02.1`.

---

## 3. PHÂN HỆ RD03.6 — BÁO CÁO TIẾN ĐỘ NHIỆM VỤ KHCN

### US-RD036-01: Lập và trình ký Báo cáo tiến độ định kỳ
* **ID:** `US-RD036-01` | **Epic:** `EPIC-RD036-TIEN-DO` | **Story Points:** 3 | **Sprint:** S5
* **Actor:** Chủ nhiệm Nhiệm vụ (`PM`)
* **User Story:**
  > Là **Chủ nhiệm nhiệm vụ (PM)**,  
  > Tôi muốn **lập báo cáo tiến độ thực hiện định kỳ và đính kèm tài liệu minh chứng**,  
  > Để **Chuyên quản KHCN theo dõi khối lượng hoàn thành và kiểm soát tiến độ đề tài**.
* **Business Value:** Đảm bảo 100% nhiệm vụ đang thực hiện được theo dõi tiến độ đúng hạn theo kỳ 6 tháng/12 tháng.
* **Ma trận AC:** Liên kết `AC1`–`AC2` tại `F-RD036.1`.

---

## 4. PHÂN HỆ RD05 — NGHIỆM THU NHIỆM VỤ KHCN

### US-RD05-01: Hội đồng Nghiệm thu chấm điểm và TGĐ ban hành Quyết định công nhận kết quả
* **ID:** `US-RD05-01` | **Epic:** `EPIC-RD05-NGHIEM-THU` | **Story Points:** 8 | **Sprint:** S6
* **Actor:** Hội đồng Nghiệm thu (`HDKHCN`) & Ban Giám đốc VHT (`BGD_VHT`)
* **User Story:**
  > Là **Ban Giám đốc VHT (BGD_VHT)**,  
  > Tôi muốn **ký số ban hành Quyết định công nhận kết quả nghiệm thu nhiệm vụ KHCN**,  
  > Để **chính thức đóng giai đoạn thực hiện đề tài và làm Gate mở sang giai đoạn Quyết toán**.
* **Business Value:** Đảm bảo Quyết định công nhận có đầy đủ tính pháp lý với chữ ký số CA; mở Gate cho phép quyết toán tài chính.
* **Ma trận AC:** Liên kết `AC1`–`AC2` tại `F-RD05.1`.

---

## 5. PHÂN HỆ RD06 — QUYẾT TOÁN & ĐỒNG BỘ SAP CS

### US-RD06-01: Tự động đồng bộ số liệu chi phí thực tế từ SAP CS
* **ID:** `US-RD06-01` | **Epic:** `EPIC-RD06-QUYET-TOAN` | **Story Points:** 8 | **Sprint:** S7
* **Actor:** Chuyên quản Tài chính (`CQ_TAI_CHINH`) & Job Worker Tự động
* **User Story:**
  > Là **Chuyên quản Tài chính (CQ_TAI_CHINH)**,  
  > Tôi muốn **hệ thống tự động kéo số liệu chi phí thực tế hạch toán từ SAP CS theo mã nhiệm vụ**,  
  > Để **đối chiếu với dự toán phê duyệt và lập Báo cáo quyết toán tài chính nhiệm vụ**.
* **Business Value:** Loại bỏ hoàn toàn việc nhập tay chi phí; phát hiện tức thì các ca vượt chi so với dự toán phê duyệt.
* **Ma trận AC:** Liên kết `AC1`–`AC3` tại `F-RD06.1`.

---

## 6. PHÂN HỆ RD07 — QUẢN LÝ DANH MỤC SẢN PHẨM / DỊCH VỤ KHCN

### US-RD07-01: Đăng ký & Đánh giá khả năng thương mại hóa Sản phẩm KHCN
* **ID:** `US-RD07-01` | **Epic:** `EPIC-RD07-SPDV` | **Story Points:** 5 | **Sprint:** S9
* **Actor:** Trung tâm Kinh doanh VHT / Trung tâm NC&PT (`TT_KD_VHT`)
* **User Story:**
  > Là **Cán bộ Trung tâm Kinh doanh VHT**,  
  > Tôi muốn **cập nhật thông tin danh mục Sản phẩm/Dịch vụ KHCN và đánh giá chỉ tiêu kinh doanh**,  
  > Để **quản lý vòng đời thương mại hóa và chuyển giao sản phẩm nghiên cứu vào thực tế**.
* **Business Value:** Số hóa 100% sản phẩm nghiên cứu đầu ra; theo dõi chỉ tiêu doanh thu/chi phí sản phẩm KHCN theo Quý.

---

## 7. PHÂN HỆ RD08 — QUẢN LÝ SỞ HỮU TRÍ TUỆ (SHTT)

### US-RD08-01: Đăng ký bảo hộ SHTT & Đồng bộ kho lưu trữ PLM/DMS
* **ID:** `US-RD08-01` | **Epic:** `EPIC-RD08-SHTT` | **Story Points:** 5 | **Sprint:** S9
* **Actor:** Chuyên quản SHTT (`CQ_SHTT`)
* **User Story:**
  > Là **Chuyên quản SHTT (CQ_SHTT)**,  
  > Tôi muốn **đăng ký hồ sơ bảo hộ SHTT (sáng chế/bài báo) và tự động đồng bộ file sang DMS VHT**,  
  > Để **quản lý tài sản trí tuệ và bảo mật tài liệu công nghệ lõi của VHT**.
* **Business Value:** Đảm bảo bảo hộ tài sản trí tuệ đúng quy trình; tự động lưu trữ tài liệu vào kho tập trung VHT.

---

## 8. PHÂN HỆ PH4 / BPM — QUẢN TRỊ QUY TRÌNH & CAMUNDA 8

### US-BPM-01: Đồng bộ Quy trình tự động từ Camunda 8
* **ID:** `US-BPM-01` | **Epic:** `EPIC-PH4-BPM` | **Story Points:** 5 | **Sprint:** S2
* **Actor:** Quản trị quy trình (`ADMIN_QT`)
* **User Story:**
  > Là **Quản trị quy trình (ADMIN_QT)**,  
  > Tôi muốn **bấm nút đồng bộ danh sách quy trình mới nhất từ Camunda 8 Engine về catalog local**,  
  > Để **cập nhật các quy trình phê duyệt mới nhất mà không cần can thiệp vào mã nguồn**.
* **Business Value:** Giảm 100% thao tác cấu hình thủ công; tự động cập nhật BPMN XML và phiên bản quy trình.
* **Ma trận AC:** Liên kết `AC1`–`AC2` tại `F-BPM.1`.

---

### US-BPM-02: Cấu hình Action Studio & Binding eForm theo Outcome Action
* **ID:** `US-BPM-02` | **Epic:** `EPIC-PH4-BPM` | **Story Points:** 5 | **Sprint:** S2
* **Actor:** Business Analyst (`BA`) / Quản trị quy trình
* **User Story:**
  > Là **Business Analyst (BA)**,  
  > Tôi muốn **gán biểu mẫu eForm theo từng kết quả đầu ra (APPROVE/RETURN/REJECT) của bước quy trình**,  
  > Để **giao diện người dùng tự động hiển thị đúng form nhập liệu tương ứng với nút thao tác**.
* **Business Value:** Tách biệt rõ ràng eForm nhập liệu theo từng loại kết quả phê duyệt (D10).

---

## 9. PHÂN HỆ PH2 — PHÂN QUYỀN, XÁC THỰC & ENTITLEMENT

### US-PH2-01: Đăng nhập Single Sign-On (SSO / OIDC PKCE)
* **ID:** `US-PH2-01` | **Epic:** `EPIC-PH2-RBAC` | **Story Points:** 3 | **Sprint:** S1
* **Actor:** Người dùng hệ thống VHT
* **User Story:**
  > Là **Người dùng hệ thống VHT**,  
  > Tôi muốn **đăng nhập thông qua cổng SSO tập trung của VHT**,  
  > Để **truy cập an toàn vào hệ thống QTKHCN bằng tài khoản định danh duy nhất**.
* **Business Value:** Tuân thủ 100% chính sách an toàn thông tin VHT; bảo mật bằng chuẩn OAuth2/OIDC PKCE.

---

### US-PH2-02: Phân quyền Phạm vi Dữ liệu (`UserRoleAssignment` Data Scope Overlay)
* **ID:** `US-PH2-02` | **Epic:** `EPIC-PH2-RBAC` | **Story Points:** 5 | **Sprint:** S1
* **Actor:** Quản trị hệ thống (`ADMIN_SYS`)
* **User Story:**
  > Là **Quản trị hệ thống (ADMIN_SYS)**,  
  > Tôi muốn **gán phạm vi dữ liệu (Cá nhân / Đơn vị / Tập đoàn) cho từng tài khoản người dùng**,  
  > Để **kiểm soát chính xác phạm vi hiển thị dữ liệu hồ sơ phù hợp với từng người dùng cụ thể**.
* **Business Value:** Đáp ứng mô hình Data Scope Overlay (D11), tách biệt quyền tính năng và phạm vi truy cập dữ liệu.

---

## 10. PHÂN HỆ PH3 — DANH MỤC DÙNG CHUNG & THƯ VIỆN BIỂU MẪU

### US-PH3-01: Thiết kế & Render eForm bằng B-engine Ant Design
* **ID:** `US-PH3-01` | **Epic:** `EPIC-PH3-MASTER` | **Story Points:** 5 | **Sprint:** S2
* **Actor:** Business Analyst (`BA`) & Người dùng nhập liệu
* **User Story:**
  > Là **Người dùng nhập liệu**,  
  > Tôi muốn **biểu mẫu eForm hiển thị theo giao diện Ant Design nhất quán và tự động xử lý logic ẩn hiện**,  
  > Để **nhập dữ liệu dễ dàng, chính xác và không bị lỗi giao diện**.
* **Business Value:** Nhất quán 100% giao diện AntD (ng-zorro); tự động đánh giá logic ẩn hiện bằng FEEL engine ngay tại client (D12).

---

## 11. PHÂN HỆ HD — QUẢN LÝ HỘI ĐỒNG & CHUYÊN GIA KHCN

### US-HD-01: Thành lập & Phân công Chuyên gia vào Hội đồng KHCN
* **ID:** `US-HD-01` | **Epic:** `EPIC-HD-HOI-DONG` | **Story Points:** 5 | **Sprint:** S4
* **Actor:** Chuyên quản KHCN (`CQ_KHCN`)
* **User Story:**
  > Là **Chuyên quản KHCN (CQ_KHCN)**,  
  > Tôi muốn **tạo Hội đồng và phân công Chuyên gia vào các vị trí Chủ tịch, Thư ký, Ủy viên phản biện**,  
  > Để **tổ chức các phiên họp xét duyệt và nghiệm thu nhiệm vụ KHCN đúng quy định**.
* **Business Value:** Tự động kiểm tra không bị trùng lặp vị trí thành viên; quản lý thông tin danh mục chuyên gia tập trung.

---

## TỔNG HỢP MATRIX PHÂN BỎ USER STORIES THEO SPRINT (PHA 1)

| Sprint | Mã US | Tên User Story | Actor | Points | Phụ thuộc |
|---|---|---|---|---|---|
| **S1** | `US-PH2-01` | Đăng nhập SSO (OIDC PKCE) | Tất cả | 3 | Keycloak VHT |
| **S1** | `US-PH2-02` | Gán Data Scope Overlay (`UserRoleAssignment`) | Admin | 5 | US-PH2-01 |
| **S2** | `US-BPM-01` | Đồng bộ Quy trình từ Camunda 8 | Admin QT | 5 | Camunda REST API |
| **S2** | `US-BPM-02` | Binding eForm per Outcome Action | BA | 5 | US-BPM-01 |
| **S2** | `US-PH3-01` | Render eForm B-engine (AntD + FEEL) | BA / User | 5 | US-BPM-02 |
| **S3** | `US-RD01-01` | Khởi tạo & trình hồ sơ xin chủ trương (CS) | PM | 3 | US-PH3-01 |
| **S3** | `US-RD01-02` | CQNV thẩm định hồ sơ chủ trương | CQ_KHCN | 5 | US-RD01-01 |
| **S4** | `US-RD02-01` | Khởi tạo hồ sơ xét duyệt mở mới (CS) | PM | 3 | Gate QĐ Chủ trương |
| **S4** | `US-HD-01` | Thành lập & phân công Hội đồng KHCN | CQ_KHCN | 5 | US-RD02-01 |
| **S5** | `US-RD02-02` | Hội đồng xét duyệt nộp phiếu Phiên 1 & Phiên 2 | HDKHCN | 8 | US-HD-01 |
| **S5** | `US-RD036-01` | Lập & trình ký Báo cáo tiến độ định kỳ | PM | 3 | Gate QĐ Mở mới |
| **S6** | `US-RD05-01` | HĐNT chấm điểm & TGĐ ban hành QĐ Nghiệm thu | BGD_VHT | 8 | Gate HĐNT |
| **S7** | `US-RD06-01` | Tự động đồng bộ số liệu chi phí từ SAP CS | CQ_TAI_CHINH| 8 | Gate QĐ Nghiệm thu + SAP |
| **S9** | `US-RD07-01` | Đăng ký & đánh giá Sản phẩm / Dịch vụ KHCN | TT_KD_VHT | 5 | US-RD05-01 |
| **S9** | `US-RD08-01` | Đăng ký bảo hộ SHTT & đồng bộ DMS VHT | CQ_SHTT | 5 | US-RD05-01 + DMS |

**Tổng dung lượng Pha 1:** $76\text{ Story Points}$ (chia làm 9 Sprints, 1 FE + 1 BE dev team).

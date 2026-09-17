# Catalog quyền theo màn hình — vòng đời hồ sơ KHCN

> **Ngày**: 2026-09-17
> **Mục đích**: điền đủ cột ma trận BA (Module / Menu cấp 1–2 / Tab / Permission / Mã / Ràng buộc / Ràng buộc quyền con theo màn hình) cho danh sách chức năng vòng đời hồ sơ.
> **Trạng thái**: bản BA — **chưa seed** identity-service. Runtime hiện vẫn dùng mã generic `HS01–HS08` trên Feature `DOSSIER` cho mọi loại hồ sơ.
> **Màn hiện có**: một danh sách `/ho-so` + chi tiết `/ho-so/:id` (eForm theo action bundle, chưa tách tab nghiệp vụ dưới đây).

---

## 1. Quy ước

| Cột | Ý nghĩa |
|---|---|
| **Ràng buộc** (`requires`) | Tick quyền con thì phải có cha; bỏ cha thì rớt hết con. |
| **Ràng buộc quyền con theo màn hình** (`screen_children`) | Widget / tab / deep-link trên màn cha. **Không** tự cấp khi gán cha. |
| **CRUD hồ sơ** | `01` list → `02` tạo (`01`) → `03` chi tiết (`01`) → `04` sửa (`03`) → `05` xóa (`03`) → `06` trình duyệt (`04`) → `07` lịch sử (`03`) → `08` tài liệu (`03`) khi BA có liệt kê. |
| **Tab gắn eForm** | Mở tab cần quyền tab; **ghi eForm** cần thêm mã sửa hồ sơ (`*04`). |
| **Jobworker** | Không phải màn hình — **không seed** mã quyền. |

**IA mục tiêu vs UI hiện tại**

- Mục tiêu: mỗi loại hồ sơ là **Menu cấp 2** riêng.
- Hiện tại: một menu `Danh sách Hồ sơ KHCN` (`HS01`). Cột *Màn hiện có* ghi route thật.

**Quan hệ với catalog V8 (2026-09-12)**

| Catalog V8 (đang chạy) | Catalog này |
|---|---|
| `HS01–HS08` một Feature `DOSSIER` | Tách mã theo loại hồ sơ (`CT*`, `XD*`, `CNCS*`, `NT*`, `HSQT*`, …) |
| `HD01–HD06` Hội đồng | Giữ nguyên + bổ sung phiếu / phiên họp / chuyên gia |
| `SP01–SP06`, `SHTT01–SHTT05`, `CBKH01–CBKH05`, `CNL01–CNL05` | Giữ và **bổ sung** mã còn thiếu (trình duyệt, lịch sử, tab) |
| `QT03` đồng bộ quy trình Camunda | **Không** thuộc hồ sơ xét duyệt — xem `OQ-QTKHCN-019` |

Cụm `QT*` = Quản trị quy trình. Hồ sơ quyết toán dùng tiền tố **`HSQT`**.

---

## 2. Điểm lệch BA đã xử lý

| # | Nội dung BA | Xử lý trong catalog | OQ |
|---|---|---|---|
| 1 | Tab **Kết quả** của HS xét duyệt ghi “đồng bộ danh sách quy trình từ Camunda” | Coi là **lỗi dán** từ `QT03`. Tab = lập/ban hành kết quả xét duyệt (QĐ giao NV), gắn eForm. | `OQ-QTKHCN-019` |
| 2 | **Jobworker Tạo mới Hội đồng KHCN** | Không cấp mã quyền màn hình (giống jobworker đồng bộ QT). | `OQ-QTKHCN-020` |
| 3 | Hai dòng **Phiếu đánh giá** | Tách: `PDG01` cấu hình/nhập mẫu; `PDG02` lập và ký PĐG. | `OQ-QTKHCN-021` |
| 4 | “Xóa **sử dụng** Hồ sơ …” | Coi là **Xóa** hồ sơ (`*05`). | `OQ-QTKHCN-022` |
| 5 | HS điều chỉnh / NT / QT **không** liệt kê đính kèm; HS chủ trương / xét duyệt có | Chỉ seed `*08` khi BA ghi rõ. Generic `HS05` vẫn cover đính kèm trên `/ho-so/:id` cho đến khi tách loại. | `OQ-QTKHCN-023` |
| 6 | HS chủ trương: BA không tách cấp CS / Tập đoàn | Một Feature `DOSSIER_CT` cho cả `RD01.01` và `RD01.02`; phân cấp bằng data-scope / biến `cap`, không tách mã quyền. | `OQ-QTKHCN-024` |
| 7 | HS xét duyệt: tương tự | Một Feature `DOSSIER_XD` cho `RD02.01` / `RD02.02`. | `OQ-QTKHCN-024` |
| 8 | **Công nghệ lõi** chỉ 1 dòng “Quản lý…” | Giữ bộ `CNL01–CNL05` đã seed; `CNL01` là quyền vào màn. | — |

---

## 3. Feature (mã identity) đề xuất

| Feature `code` | Tên | App | Nhóm RD |
|---|---|---|---|
| `DOSSIER_CT` | Hồ sơ chủ trương | `qlnvkhcn` | RD01 |
| `DOSSIER_XD` | Hồ sơ xét duyệt nhiệm vụ | `qlnvkhcn` | RD02 |
| `COUNCIL` | Quản lý Hội đồng KHCN | `qlnvkhcn` | HD (dùng chung) |
| `COUNCIL_EVAL` | Phiếu / phiên họp / biên bản | `qlnvkhcn` | HD + RD01/02/05 |
| `EXPERT` | Kho chuyên gia | `qlnvkhcn` | HD |
| `MISSION_EXEC` | Theo dõi thực hiện NV | `qlnvkhcn` | RD03 |
| `DOSSIER_RD0401` … `DOSSIER_RD0410` | 10 loại hồ sơ điều chỉnh | `qlnvkhcn` | RD04 |
| `DOSSIER_IMPACT` | Đánh giá tác động / áp dụng kết quả | `qlnvkhcn` | RD04 |
| `DOSSIER_NT` | Hồ sơ nghiệm thu | `qlnvkhcn` | RD05 |
| `DOSSIER_QT` | Hồ sơ quyết toán | `qlnvkhcn` | RD06 |
| `RESEARCH_PRODUCT` | Sản phẩm nghiên cứu | `qlnvkhcn` | RD07 — đã có |
| `INTELLECTUAL_PROPERTY` | Hồ sơ sở hữu trí tuệ | `qlnvkhcn` | RD08 — đã có, bổ sung mã |
| `PUBLICATION` | Bài báo / sáng chế / GPHI | `qlnvkhcn` | RD08 — đã có |
| `CORE_TECH` | Công nghệ lõi | `qlnvkhcn` | RD08 — đã có |

---

## 4. Ma trận đầy đủ

Cột trống = không áp dụng. *Màn hiện có* không thuộc 8 cột BA; để đối chiếu triển khai.

### 4.1 Hồ sơ chủ trương — RD01 (`DOSSIER_CT`)

Quy trình: `RD01.01` (CS), `RD01.02` (Tập đoàn). Route hiện tại: `/ho-so` lọc `loai=CHU_TRUONG`.

| Module | Menu cấp 1 | Menu cấp 2 | Tab | Permission | Mã | Ràng buộc | Ràng buộc quyền con theo màn hình |
|---|---|---|---|---|---|---|---|
| Quản trị KHCN | Quản trị KHCN | Hồ sơ chủ trương | | Xem danh sách Hồ sơ chủ trương | `CT01` | | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ chủ trương | | Tạo mới Hồ sơ chủ trương | `CT02` | `CT01` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ chủ trương | | Xem chi tiết Hồ sơ chủ trương | `CT03` | `CT01` | `CT07,CT08,CT09,CT10,CT11` |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ chủ trương | | Chỉnh sửa Hồ sơ chủ trương | `CT04` | `CT03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ chủ trương | | Xóa Hồ sơ chủ trương | `CT05` | `CT03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ chủ trương | | Trình duyệt Hồ sơ chủ trương | `CT06` | `CT04` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ chủ trương | | Xem lịch sử Hồ sơ chủ trương | `CT07` | `CT03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ chủ trương | | Upload / Download / Xóa tài liệu đính kèm theo Hồ sơ | `CT08` | `CT03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ chủ trương | Nội dung đề xuất | Khai báo căn cứ, mục tiêu, phạm vi và hiệu quả dự kiến — **có gắn eForm** | `CT09` | `CT04` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ chủ trương | Dự kiến nguồn lực | Khai báo kinh phí, tiến độ và nguồn lực dự kiến — **có gắn eForm** | `CT10` | `CT04` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ chủ trương | Kết quả | Lập và ban hành quyết định chủ trương — **có gắn eForm** | `CT11` | `CT04` | |

Ánh xạ tạm V8: `CT01→HS01`, `CT02→HS02`, `CT03→HS03`, `CT04→HS04`, `CT05→HS07`, `CT06→HS06`, `CT07→HS08`, `CT08→HS05`.

---

### 4.2 Hồ sơ xét duyệt nhiệm vụ — RD02 (`DOSSIER_XD`)

Quy trình: `RD02.01` (CS), `RD02.02` (Tập đoàn). Route: `/ho-so` lọc `loai=XET_DUYET`.

| Module | Menu cấp 1 | Menu cấp 2 | Tab | Permission | Mã | Ràng buộc | Ràng buộc quyền con theo màn hình |
|---|---|---|---|---|---|---|---|
| Quản trị KHCN | Quản trị KHCN | Hồ sơ xét duyệt nhiệm vụ | | Xem danh sách Hồ sơ xét duyệt nhiệm vụ | `XD01` | | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ xét duyệt nhiệm vụ | | Tạo mới Hồ sơ xét duyệt nhiệm vụ | `XD02` | `XD01` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ xét duyệt nhiệm vụ | | Xem chi tiết Hồ sơ xét duyệt nhiệm vụ | `XD03` | `XD01` | `XD07,XD08,XD09,XD10,XD11,XD12` |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ xét duyệt nhiệm vụ | | Chỉnh sửa Hồ sơ xét duyệt nhiệm vụ | `XD04` | `XD03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ xét duyệt nhiệm vụ | | Xóa Hồ sơ xét duyệt nhiệm vụ | `XD05` | `XD03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ xét duyệt nhiệm vụ | | Trình duyệt Hồ sơ xét duyệt nhiệm vụ | `XD06` | `XD04` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ xét duyệt nhiệm vụ | | Xem lịch sử Hồ sơ xét duyệt nhiệm vụ | `XD07` | `XD03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ xét duyệt nhiệm vụ | | Upload / Download / Xóa tài liệu đính kèm theo Hồ sơ | `XD08` | `XD03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ xét duyệt nhiệm vụ | Thuyết minh | Lập thuyết minh nhiệm vụ — **có gắn eForm** | `XD09` | `XD04` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ xét duyệt nhiệm vụ | Dự toán | Lập và thẩm định dự toán — **có gắn eForm** | `XD10` | `XD04` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ xét duyệt nhiệm vụ | Thẩm định | Phân công thẩm định và tổng hợp ý kiến | `XD11` | `XD03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ xét duyệt nhiệm vụ | Kết quả | Lập và ban hành kết quả xét duyệt / QĐ giao nhiệm vụ — **có gắn eForm** *(không phải đồng bộ Camunda)* | `XD12` | `XD04` | |

---

### 4.3 Hội đồng KHCN — (`COUNCIL`)

Giữ mã V8. Route: `/hoi-dong`, `/hoi-dong/tao`, `/hoi-dong/:id`.

| Module | Menu cấp 1 | Menu cấp 2 | Tab | Permission | Mã | Ràng buộc | Ràng buộc quyền con theo màn hình |
|---|---|---|---|---|---|---|---|
| Quản trị KHCN | Quản trị KHCN | Quản lý Hội đồng | | Xem danh sách Hội đồng KHCN | `HD01` | | |
| Quản trị KHCN | Quản trị KHCN | Quản lý Hội đồng | | Tạo mới Hội đồng KHCN | `HD03` | `HD01` | |
| Quản trị KHCN | Quản trị KHCN | Quản lý Hội đồng | | *(Jobworker)* Tạo mới Hội đồng KHCN | — | — | Không seed — worker hệ thống |
| Quản trị KHCN | Quản trị KHCN | Quản lý Hội đồng | | Xem chi tiết Hội đồng KHCN | `HD02` | `HD01` | `PDG01,PDG02,PNX01,PH01,PH02,THHD01,BB01` |
| Quản trị KHCN | Quản trị KHCN | Quản lý Hội đồng | | Chỉnh sửa Hội đồng KHCN | `HD04` | `HD03` | |
| Quản trị KHCN | Quản trị KHCN | Quản lý Hội đồng | | Xóa Hội đồng KHCN | `HD05` | `HD01` | |
| Quản trị KHCN | Quản trị KHCN | Quản lý Hội đồng | | Tạo file QĐ thành lập Hội đồng và trình ký | `HD06` | `HD03` | |

`HD06` đã có từ catalog 2026-09-12 (mã BA lúc đó để trống).

---

### 4.4 Phiếu, phiên họp, biên bản, chuyên gia — (`COUNCIL_EVAL`, `EXPERT`)

Dùng chung RD01 / RD02 / RD05. Chưa có tab riêng trên UI; hiện nằm trong chi tiết hồ sơ / hội đồng.

| Module | Menu cấp 1 | Menu cấp 2 | Tab | Permission | Mã | Ràng buộc | Ràng buộc quyền con theo màn hình |
|---|---|---|---|---|---|---|---|
| Quản trị KHCN | Quản trị KHCN | Quản lý Hội đồng | Phiếu đánh giá | Cấu hình và nhập phiếu đánh giá | `PDG01` | `HD02` | |
| Quản trị KHCN | Quản trị KHCN | Quản lý Hội đồng | Phiếu nhận xét | Lập và ký Phiếu nhận xét (PNX) | `PNX01` | `HD02` | |
| Quản trị KHCN | Quản trị KHCN | Quản lý Hội đồng | Phiếu đánh giá | Lập và ký Phiếu đánh giá (PĐG) | `PDG02` | `PDG01` | |
| Quản trị KHCN | Quản trị KHCN | Quản lý Hội đồng | Phiên họp | Quản lý nhiều phiên họp cho một nhiệm vụ | `PH01` | `HD02` | |
| Quản trị KHCN | Quản trị KHCN | Quản lý Hội đồng | Phiên họp | Kiểm tra tính hợp lệ của phiên họp | `PH02` | `PH01` | |
| Quản trị KHCN | Quản trị KHCN | Quản lý Hội đồng | Tổng hợp | Tổng hợp kết quả chấm và ý kiến | `THHD01` | `HD02` | |
| Quản trị KHCN | Quản trị KHCN | Quản lý Hội đồng | Biên bản | Lập và ban hành biên bản hội đồng | `BB01` | `HD02` | |
| Quản trị KHCN | Quản trị KHCN | Kho chuyên gia | | Quản lý kho chuyên gia | `CG01` | | `CG02` *(dự phòng xem chi tiết — chưa BA tách)* |

---

### 4.5 Theo dõi thực hiện — RD03 (`MISSION_EXEC`)

Tab trên chi tiết nhiệm vụ (`NV03`). Chưa có UI. Nguồn: PLM, QLNS, SAP, MS, QLTS (chỉ đọc, trừ khi BA mở ghi).

| Module | Menu cấp 1 | Menu cấp 2 | Tab | Permission | Mã | Ràng buộc | Ràng buộc quyền con theo màn hình |
|---|---|---|---|---|---|---|---|
| Quản trị KHCN | Quản trị KHCN | Quản lý Nhiệm vụ KHCN | Kế hoạch thực hiện | Đọc cấu trúc công việc và mốc tiến độ từ PLM | `THH01` | `NV03` | |
| Quản trị KHCN | Quản trị KHCN | Quản lý Nhiệm vụ KHCN | Theo dõi tiến độ | Hiển thị % hoàn thành và bằng chứng từ PLM | `THH02` | `NV03` | |
| Quản trị KHCN | Quản trị KHCN | Quản lý Nhiệm vụ KHCN | Cảnh báo | Cảnh báo chậm tiến độ và milestone | `THH03` | `THH02` | |
| Quản trị KHCN | Quản trị KHCN | Quản lý Nhiệm vụ KHCN | Thành viên | Hiển thị nhân sự và trạng thái công việc từ QLNS | `THH04` | `NV03` | |
| Quản trị KHCN | Quản trị KHCN | Quản lý Nhiệm vụ KHCN | Chi phí nhân sự | Theo dõi công sức và chi phí nhân sự | `THH05` | `THH04` | |
| Quản trị KHCN | Quản trị KHCN | Quản lý Nhiệm vụ KHCN | Ngân sách | Hiển thị ngân sách và chi phí từ SAP | `THH06` | `NV03` | |
| Quản trị KHCN | Quản trị KHCN | Quản lý Nhiệm vụ KHCN | Giải ngân | Theo dõi giải ngân và chi phí thực tế | `THH07` | `THH06` | |
| Quản trị KHCN | Quản trị KHCN | Quản lý Nhiệm vụ KHCN | Nhu cầu mua sắm | Hiển thị tờ trình, gói thầu và hợp đồng từ hệ thống MS | `THH08` | `NV03` | |
| Quản trị KHCN | Quản trị KHCN | Quản lý Nhiệm vụ KHCN | Tài sản hình thành | Hiển thị VTLK, CCDC và TSCĐ từ QLTS | `THH09` | `NV03` | |

`NV03` (`MISSION`) bổ sung `screen_children = THH01,THH02,THH03,THH04,THH05,THH06,THH07,THH08,THH09` khi seed.

Luồng RD03: `RD03.01` QLNS, `RD03.02` MS, `RD03.03` SAP, `RD03.04` QLTS, `RD03.05` PLM, `RD03.06` báo cáo tiến độ (Pha 1).

---

### 4.6 Hồ sơ điều chỉnh — RD04 cấp Cơ sở

Mỗi loại = Feature riêng. CRUD 7 mã (BA **không** liệt kê đính kèm). Chưa có UI riêng — `/ho-so` lọc `loai=DIEU_CHINH`.

#### 4.6.1 Đổi chủ nhiệm cấp Cơ sở — `RD04.01` (`DOSSIER_RD0401`, tiền tố `CNCS`)

| Module | Menu cấp 1 | Menu cấp 2 | Tab | Permission | Mã | Ràng buộc | Ràng buộc quyền con theo màn hình |
|---|---|---|---|---|---|---|---|
| Quản trị KHCN | Quản trị KHCN | Hồ sơ đổi chủ nhiệm cấp Cơ sở | | Xem danh sách | `CNCS01` | | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ đổi chủ nhiệm cấp Cơ sở | | Tạo mới | `CNCS02` | `CNCS01` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ đổi chủ nhiệm cấp Cơ sở | | Xem chi tiết | `CNCS03` | `CNCS01` | `CNCS07,DGTT01,ADKQ01` |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ đổi chủ nhiệm cấp Cơ sở | | Chỉnh sửa | `CNCS04` | `CNCS03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ đổi chủ nhiệm cấp Cơ sở | | Xóa | `CNCS05` | `CNCS03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ đổi chủ nhiệm cấp Cơ sở | | Trình duyệt | `CNCS06` | `CNCS04` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ đổi chủ nhiệm cấp Cơ sở | | Xem lịch sử | `CNCS07` | `CNCS03` | |

#### 4.6.2 Điều chỉnh nội dung/dự toán không tăng tổng — CS — `RD04.02` (`NDCS`)

| Module | Menu cấp 1 | Menu cấp 2 | Tab | Permission | Mã | Ràng buộc | Ràng buộc quyền con theo màn hình |
|---|---|---|---|---|---|---|---|
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC nội dung/dự toán không tăng tổng cấp Cơ sở | | Xem danh sách | `NDCS01` | | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC nội dung/dự toán không tăng tổng cấp Cơ sở | | Tạo mới | `NDCS02` | `NDCS01` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC nội dung/dự toán không tăng tổng cấp Cơ sở | | Xem chi tiết | `NDCS03` | `NDCS01` | `NDCS07,DGTT01,ADKQ01` |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC nội dung/dự toán không tăng tổng cấp Cơ sở | | Chỉnh sửa | `NDCS04` | `NDCS03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC nội dung/dự toán không tăng tổng cấp Cơ sở | | Xóa | `NDCS05` | `NDCS03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC nội dung/dự toán không tăng tổng cấp Cơ sở | | Trình duyệt | `NDCS06` | `NDCS04` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC nội dung/dự toán không tăng tổng cấp Cơ sở | | Xem lịch sử | `NDCS07` | `NDCS03` | |

#### 4.6.3 Điều chỉnh mục tiêu/tăng dự toán không vượt chủ trương — CS — `RD04.03` (`MTCS`)

| Module | Menu cấp 1 | Menu cấp 2 | Tab | Permission | Mã | Ràng buộc | Ràng buộc quyền con theo màn hình |
|---|---|---|---|---|---|---|---|
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC mục tiêu/tăng DT không vượt CT cấp Cơ sở | | Xem danh sách | `MTCS01` | | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC mục tiêu/tăng DT không vượt CT cấp Cơ sở | | Tạo mới | `MTCS02` | `MTCS01` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC mục tiêu/tăng DT không vượt CT cấp Cơ sở | | Xem chi tiết | `MTCS03` | `MTCS01` | `MTCS07,DGTT01,ADKQ01` |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC mục tiêu/tăng DT không vượt CT cấp Cơ sở | | Chỉnh sửa | `MTCS04` | `MTCS03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC mục tiêu/tăng DT không vượt CT cấp Cơ sở | | Xóa | `MTCS05` | `MTCS03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC mục tiêu/tăng DT không vượt CT cấp Cơ sở | | Trình duyệt | `MTCS06` | `MTCS04` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC mục tiêu/tăng DT không vượt CT cấp Cơ sở | | Xem lịch sử | `MTCS07` | `MTCS03` | |

#### 4.6.4 Tạm dừng nhiệm vụ cấp Cơ sở — `RD04.04` (`TDCS`)

| Module | Menu cấp 1 | Menu cấp 2 | Tab | Permission | Mã | Ràng buộc | Ràng buộc quyền con theo màn hình |
|---|---|---|---|---|---|---|---|
| Quản trị KHCN | Quản trị KHCN | Hồ sơ tạm dừng nhiệm vụ cấp Cơ sở | | Xem danh sách | `TDCS01` | | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ tạm dừng nhiệm vụ cấp Cơ sở | | Tạo mới | `TDCS02` | `TDCS01` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ tạm dừng nhiệm vụ cấp Cơ sở | | Xem chi tiết | `TDCS03` | `TDCS01` | `TDCS07,DGTT01,ADKQ01` |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ tạm dừng nhiệm vụ cấp Cơ sở | | Chỉnh sửa | `TDCS04` | `TDCS03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ tạm dừng nhiệm vụ cấp Cơ sở | | Xóa | `TDCS05` | `TDCS03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ tạm dừng nhiệm vụ cấp Cơ sở | | Trình duyệt | `TDCS06` | `TDCS04` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ tạm dừng nhiệm vụ cấp Cơ sở | | Xem lịch sử | `TDCS07` | `TDCS03` | |

#### 4.6.5 Dừng nhiệm vụ cấp Cơ sở — `RD04.05` (`DUNGCS`)

| Module | Menu cấp 1 | Menu cấp 2 | Tab | Permission | Mã | Ràng buộc | Ràng buộc quyền con theo màn hình |
|---|---|---|---|---|---|---|---|
| Quản trị KHCN | Quản trị KHCN | Hồ sơ dừng nhiệm vụ cấp Cơ sở | | Xem danh sách | `DUNGCS01` | | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ dừng nhiệm vụ cấp Cơ sở | | Tạo mới | `DUNGCS02` | `DUNGCS01` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ dừng nhiệm vụ cấp Cơ sở | | Xem chi tiết | `DUNGCS03` | `DUNGCS01` | `DUNGCS07,DGTT01,ADKQ01` |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ dừng nhiệm vụ cấp Cơ sở | | Chỉnh sửa | `DUNGCS04` | `DUNGCS03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ dừng nhiệm vụ cấp Cơ sở | | Xóa | `DUNGCS05` | `DUNGCS03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ dừng nhiệm vụ cấp Cơ sở | | Trình duyệt | `DUNGCS06` | `DUNGCS04` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ dừng nhiệm vụ cấp Cơ sở | | Xem lịch sử | `DUNGCS07` | `DUNGCS03` | |

---

### 4.7 Hồ sơ điều chỉnh — RD04 cấp Tập đoàn

#### 4.7.1 Đổi chủ nhiệm cấp Tập đoàn — `RD04.06` (`CNTD`)

| Module | Menu cấp 1 | Menu cấp 2 | Tab | Permission | Mã | Ràng buộc | Ràng buộc quyền con theo màn hình |
|---|---|---|---|---|---|---|---|
| Quản trị KHCN | Quản trị KHCN | Hồ sơ đổi chủ nhiệm cấp Tập đoàn | | Xem danh sách | `CNTD01` | | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ đổi chủ nhiệm cấp Tập đoàn | | Tạo mới | `CNTD02` | `CNTD01` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ đổi chủ nhiệm cấp Tập đoàn | | Xem chi tiết | `CNTD03` | `CNTD01` | `CNTD07,DGTT01,ADKQ01` |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ đổi chủ nhiệm cấp Tập đoàn | | Chỉnh sửa | `CNTD04` | `CNTD03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ đổi chủ nhiệm cấp Tập đoàn | | Xóa | `CNTD05` | `CNTD03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ đổi chủ nhiệm cấp Tập đoàn | | Trình duyệt | `CNTD06` | `CNTD04` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ đổi chủ nhiệm cấp Tập đoàn | | Xem lịch sử | `CNTD07` | `CNTD03` | |

#### 4.7.2 Điều chỉnh nội dung/dự toán không tăng tổng — TĐ — `RD04.07` (`NDTD`)

| Module | Menu cấp 1 | Menu cấp 2 | Tab | Permission | Mã | Ràng buộc | Ràng buộc quyền con theo màn hình |
|---|---|---|---|---|---|---|---|
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC nội dung/dự toán không tăng tổng cấp Tập đoàn | | Xem danh sách | `NDTD01` | | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC nội dung/dự toán không tăng tổng cấp Tập đoàn | | Tạo mới | `NDTD02` | `NDTD01` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC nội dung/dự toán không tăng tổng cấp Tập đoàn | | Xem chi tiết | `NDTD03` | `NDTD01` | `NDTD07,DGTT01,ADKQ01` |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC nội dung/dự toán không tăng tổng cấp Tập đoàn | | Chỉnh sửa | `NDTD04` | `NDTD03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC nội dung/dự toán không tăng tổng cấp Tập đoàn | | Xóa | `NDTD05` | `NDTD03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC nội dung/dự toán không tăng tổng cấp Tập đoàn | | Trình duyệt | `NDTD06` | `NDTD04` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC nội dung/dự toán không tăng tổng cấp Tập đoàn | | Xem lịch sử | `NDTD07` | `NDTD03` | |

#### 4.7.3 Điều chỉnh mục tiêu/tăng dự toán không vượt chủ trương — TĐ — `RD04.08` (`MTTD`)

| Module | Menu cấp 1 | Menu cấp 2 | Tab | Permission | Mã | Ràng buộc | Ràng buộc quyền con theo màn hình |
|---|---|---|---|---|---|---|---|
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC mục tiêu/tăng DT không vượt CT cấp Tập đoàn | | Xem danh sách | `MTTD01` | | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC mục tiêu/tăng DT không vượt CT cấp Tập đoàn | | Tạo mới | `MTTD02` | `MTTD01` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC mục tiêu/tăng DT không vượt CT cấp Tập đoàn | | Xem chi tiết | `MTTD03` | `MTTD01` | `MTTD07,DGTT01,ADKQ01` |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC mục tiêu/tăng DT không vượt CT cấp Tập đoàn | | Chỉnh sửa | `MTTD04` | `MTTD03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC mục tiêu/tăng DT không vượt CT cấp Tập đoàn | | Xóa | `MTTD05` | `MTTD03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC mục tiêu/tăng DT không vượt CT cấp Tập đoàn | | Trình duyệt | `MTTD06` | `MTTD04` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ ĐC mục tiêu/tăng DT không vượt CT cấp Tập đoàn | | Xem lịch sử | `MTTD07` | `MTTD03` | |

#### 4.7.4 Tạm dừng nhiệm vụ cấp Tập đoàn — `RD04.09` (`TDTD`)

| Module | Menu cấp 1 | Menu cấp 2 | Tab | Permission | Mã | Ràng buộc | Ràng buộc quyền con theo màn hình |
|---|---|---|---|---|---|---|---|
| Quản trị KHCN | Quản trị KHCN | Hồ sơ tạm dừng nhiệm vụ cấp Tập đoàn | | Xem danh sách | `TDTD01` | | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ tạm dừng nhiệm vụ cấp Tập đoàn | | Tạo mới | `TDTD02` | `TDTD01` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ tạm dừng nhiệm vụ cấp Tập đoàn | | Xem chi tiết | `TDTD03` | `TDTD01` | `TDTD07,DGTT01,ADKQ01` |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ tạm dừng nhiệm vụ cấp Tập đoàn | | Chỉnh sửa | `TDTD04` | `TDTD03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ tạm dừng nhiệm vụ cấp Tập đoàn | | Xóa | `TDTD05` | `TDTD03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ tạm dừng nhiệm vụ cấp Tập đoàn | | Trình duyệt | `TDTD06` | `TDTD04` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ tạm dừng nhiệm vụ cấp Tập đoàn | | Xem lịch sử | `TDTD07` | `TDTD03` | |

#### 4.7.5 Dừng nhiệm vụ cấp Tập đoàn — `RD04.10` (`DUNGTD`)

| Module | Menu cấp 1 | Menu cấp 2 | Tab | Permission | Mã | Ràng buộc | Ràng buộc quyền con theo màn hình |
|---|---|---|---|---|---|---|---|
| Quản trị KHCN | Quản trị KHCN | Hồ sơ dừng nhiệm vụ cấp Tập đoàn | | Xem danh sách | `DUNGTD01` | | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ dừng nhiệm vụ cấp Tập đoàn | | Tạo mới | `DUNGTD02` | `DUNGTD01` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ dừng nhiệm vụ cấp Tập đoàn | | Xem chi tiết | `DUNGTD03` | `DUNGTD01` | `DUNGTD07,DGTT01,ADKQ01` |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ dừng nhiệm vụ cấp Tập đoàn | | Chỉnh sửa | `DUNGTD04` | `DUNGTD03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ dừng nhiệm vụ cấp Tập đoàn | | Xóa | `DUNGTD05` | `DUNGTD03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ dừng nhiệm vụ cấp Tập đoàn | | Trình duyệt | `DUNGTD06` | `DUNGTD04` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ dừng nhiệm vụ cấp Tập đoàn | | Xem lịch sử | `DUNGTD07` | `DUNGTD03` | |

---

### 4.8 Đánh giá tác động sau điều chỉnh — (`DOSSIER_IMPACT`)

Tab trên chi tiết mọi hồ sơ RD04. Không tự cấp khi gán `*03`.

| Module | Menu cấp 1 | Menu cấp 2 | Tab | Permission | Mã | Ràng buộc | Ràng buộc quyền con theo màn hình |
|---|---|---|---|---|---|---|---|
| Quản trị KHCN | Quản trị KHCN | Hồ sơ điều chỉnh (mọi loại RD04) | Đánh giá tác động | So sánh trước/sau và đánh giá tác động điều chỉnh | `DGTT01` | | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ điều chỉnh (mọi loại RD04) | Áp dụng kết quả | Cập nhật baseline sau phê duyệt | `ADKQ01` | `DGTT01` | |

`requires` để trống vì cha là **một trong** các mã `*03` RD04 — cascade cứng một cha sẽ sai. Gate runtime: có `DGTT01` **và** mã chi tiết loại hồ sơ đang mở.

---

### 4.9 Hồ sơ nghiệm thu — RD05 (`DOSSIER_NT`)

Quy trình: `RD05.01` (CS), `RD05.02` (Tập đoàn). Route: `/ho-so` lọc `loai=NGHIEM_THU`.

| Module | Menu cấp 1 | Menu cấp 2 | Tab | Permission | Mã | Ràng buộc | Ràng buộc quyền con theo màn hình |
|---|---|---|---|---|---|---|---|
| Quản trị KHCN | Quản trị KHCN | Hồ sơ nghiệm thu | | Xem danh sách Hồ sơ nghiệm thu | `NT01` | | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ nghiệm thu | | Tạo mới Hồ sơ nghiệm thu | `NT02` | `NT01` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ nghiệm thu | | Xem chi tiết Hồ sơ nghiệm thu | `NT03` | `NT01` | `NT07,NT08,NT09,NT10,NT11` |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ nghiệm thu | | Chỉnh sửa Hồ sơ nghiệm thu | `NT04` | `NT03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ nghiệm thu | | Xóa Hồ sơ nghiệm thu | `NT05` | `NT03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ nghiệm thu | | Trình duyệt Hồ sơ nghiệm thu | `NT06` | `NT04` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ nghiệm thu | | Xem lịch sử Hồ sơ nghiệm thu | `NT07` | `NT03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ nghiệm thu | Điều kiện | Kiểm tra điều kiện đăng ký nghiệm thu | `NT08` | `NT03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ nghiệm thu | Sản phẩm | Đối chiếu sản phẩm đăng ký và thực tế | `NT09` | `NT03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ nghiệm thu | Kết luận | Xếp loại và công nhận kết quả nghiệm thu | `NT10` | `NT04` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ nghiệm thu | Sau nghiệm thu | Theo dõi hoàn thiện sau nghiệm thu | `NT11` | `NT03` | |

---

### 4.10 Hồ sơ quyết toán — RD06 (`DOSSIER_QT`)

Tiền tố **`HSQT`** (tránh đụng `QT01–QT05` quản trị quy trình). `RD06.01` / `RD06.02`.

| Module | Menu cấp 1 | Menu cấp 2 | Tab | Permission | Mã | Ràng buộc | Ràng buộc quyền con theo màn hình |
|---|---|---|---|---|---|---|---|
| Quản trị KHCN | Quản trị KHCN | Hồ sơ quyết toán | | Xem danh sách Hồ sơ quyết toán | `HSQT01` | | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ quyết toán | | Tạo mới Hồ sơ quyết toán | `HSQT02` | `HSQT01` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ quyết toán | | Xem chi tiết Hồ sơ quyết toán | `HSQT03` | `HSQT01` | `HSQT07,HSQT08,HSQT09,HSQT10,HSQT11` |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ quyết toán | | Chỉnh sửa Hồ sơ quyết toán | `HSQT04` | `HSQT03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ quyết toán | | Xóa Hồ sơ quyết toán | `HSQT05` | `HSQT03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ quyết toán | | Trình duyệt Hồ sơ quyết toán | `HSQT06` | `HSQT04` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ quyết toán | | Xem lịch sử Hồ sơ quyết toán | `HSQT07` | `HSQT03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ quyết toán | Tổng hợp tài chính | Tổng hợp dự toán, giải ngân và thực chi | `HSQT08` | `HSQT03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ quyết toán | Chứng từ | Quản lý chứng từ quyết toán | `HSQT09` | `HSQT04` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ quyết toán | Đối soát | Đối soát dữ liệu tài chính với SAP | `HSQT10` | `HSQT03` | |
| Quản trị KHCN | Quản trị KHCN | Hồ sơ quyết toán | Kết quả | Ban hành kết quả quyết toán và đóng tài chính | `HSQT11` | `HSQT04` | |

---

### 4.11 Sản phẩm nghiên cứu — RD07 (`RESEARCH_PRODUCT`)

Giữ `SP01–SP06` đã seed. Bổ sung đối chiếu. Chưa có route.

| Module | Menu cấp 1 | Menu cấp 2 | Tab | Permission | Mã | Ràng buộc | Ràng buộc quyền con theo màn hình |
|---|---|---|---|---|---|---|---|
| Quản trị KHCN | Quản lý Sản phẩm nghiên cứu | | | Xem danh sách Sản phẩm nghiên cứu | `SP01` | | |
| Quản trị KHCN | Quản lý Sản phẩm nghiên cứu | | | Tạo mới Sản phẩm nghiên cứu | `SP03` | `SP01` | |
| Quản trị KHCN | Quản lý Sản phẩm nghiên cứu | | | Xem chi tiết Sản phẩm nghiên cứu | `SP02` | `SP01` | `SP06,SP07` |
| Quản trị KHCN | Quản lý Sản phẩm nghiên cứu | | | Chỉnh sửa Sản phẩm nghiên cứu | `SP04` | `SP03` | |
| Quản trị KHCN | Quản lý Sản phẩm nghiên cứu | | | Xóa Sản phẩm nghiên cứu | `SP05` | `SP01` | |
| Quản trị KHCN | Quản lý Sản phẩm nghiên cứu | | | Xem doanh thu / chi phí / lợi nhuận | `SP06` | `SP01` | |
| Quản trị KHCN | Quản lý Sản phẩm nghiên cứu | Đối chiếu | Đối chiếu sản phẩm cam kết và thực tế | `SP07` | `SP02` | |

---

### 4.12 Hồ sơ sở hữu trí tuệ — RD08 (`INTELLECTUAL_PROPERTY`)

Bổ sung `SHTT06` trình duyệt, `SHTT07` lịch sử, tab quyền sở hữu / đăng ký bảo hộ. `SHTT03` V8 không `requires SHTT01` — **sửa** thành `SHTT01` cho khớp CRUD.

| Module | Menu cấp 1 | Menu cấp 2 | Tab | Permission | Mã | Ràng buộc | Ràng buộc quyền con theo màn hình |
|---|---|---|---|---|---|---|---|
| Quản trị KHCN | Quản lý Sở hữu trí tuệ | Sở hữu trí tuệ | | Xem danh sách Hồ sơ sở hữu trí tuệ | `SHTT01` | | |
| Quản trị KHCN | Quản lý Sở hữu trí tuệ | Sở hữu trí tuệ | | Tạo mới Hồ sơ sở hữu trí tuệ | `SHTT03` | `SHTT01` | |
| Quản trị KHCN | Quản lý Sở hữu trí tuệ | Sở hữu trí tuệ | | Xem chi tiết Hồ sơ sở hữu trí tuệ | `SHTT02` | `SHTT01` | `SHTT07,SHTT08,SHTT09` |
| Quản trị KHCN | Quản lý Sở hữu trí tuệ | Sở hữu trí tuệ | | Chỉnh sửa Hồ sơ sở hữu trí tuệ | `SHTT04` | `SHTT03` | |
| Quản trị KHCN | Quản lý Sở hữu trí tuệ | Sở hữu trí tuệ | | Xóa Hồ sơ sở hữu trí tuệ | `SHTT05` | `SHTT01` | |
| Quản trị KHCN | Quản lý Sở hữu trí tuệ | Sở hữu trí tuệ | | Trình duyệt Hồ sơ sở hữu trí tuệ | `SHTT06` | `SHTT04` | |
| Quản trị KHCN | Quản lý Sở hữu trí tuệ | Sở hữu trí tuệ | | Xem lịch sử Hồ sơ sở hữu trí tuệ | `SHTT07` | `SHTT02` | |
| Quản trị KHCN | Quản lý Sở hữu trí tuệ | Sở hữu trí tuệ | Quyền sở hữu | Quản lý tác giả, chủ sở hữu và tỷ lệ quyền | `SHTT08` | `SHTT04` | |
| Quản trị KHCN | Quản lý Sở hữu trí tuệ | Sở hữu trí tuệ | Đăng ký bảo hộ | Theo dõi trạng thái đơn và văn bằng bảo hộ | `SHTT09` | `SHTT02` | |

---

### 4.13 Bài báo / Sáng chế / GPHI (`PUBLICATION`)

Giữ `CBKH01–CBKH05`.

| Module | Menu cấp 1 | Menu cấp 2 | Tab | Permission | Mã | Ràng buộc | Ràng buộc quyền con theo màn hình |
|---|---|---|---|---|---|---|---|
| Quản trị KHCN | Quản lý Sở hữu trí tuệ | Công bố khoa học | | Xem danh sách Bài báo / Sáng chế / GPHI | `CBKH01` | | |
| Quản trị KHCN | Quản lý Sở hữu trí tuệ | Công bố khoa học | | Tạo mới | `CBKH03` | `CBKH01` | |
| Quản trị KHCN | Quản lý Sở hữu trí tuệ | Công bố khoa học | | Xem chi tiết | `CBKH02` | `CBKH01` | |
| Quản trị KHCN | Quản lý Sở hữu trí tuệ | Công bố khoa học | | Chỉnh sửa | `CBKH04` | `CBKH01` | |
| Quản trị KHCN | Quản lý Sở hữu trí tuệ | Công bố khoa học | | Xóa | `CBKH05` | `CBKH01` | |

V8: `CBKH04` ràng buộc `CBKH01` (không bắt `CBKH03`). Giữ nguyên.

---

### 4.14 Công nghệ lõi (`CORE_TECH`)

BA: một dòng “Quản lý công nghệ hình thành từ nhiệm vụ”. Giữ bộ đã seed.

| Module | Menu cấp 1 | Menu cấp 2 | Tab | Permission | Mã | Ràng buộc | Ràng buộc quyền con theo màn hình |
|---|---|---|---|---|---|---|---|
| Quản trị KHCN | Quản lý Sở hữu trí tuệ | Công nghệ lõi | | Xem danh sách công nghệ lõi | `CNL01` | | |
| Quản trị KHCN | Quản lý Sở hữu trí tuệ | Công nghệ lõi | | Xem chi tiết | `CNL02` | `CNL01` | |
| Quản trị KHCN | Quản lý Sở hữu trí tuệ | Công nghệ lõi | | Thêm mới | `CNL03` | `CNL01` | |
| Quản trị KHCN | Quản lý Sở hữu trí tuệ | Công nghệ lõi | | Chỉnh sửa | `CNL04` | `CNL01` | |
| Quản trị KHCN | Quản lý Sở hữu trí tuệ | Công nghệ lõi | | Xóa | `CNL05` | `CNL01` | |

---

## 5. Tổng hợp mã mới (chưa có trong V8)

| Nhóm | Mã mới |
|---|---|
| Chủ trương | `CT01`–`CT11` |
| Xét duyệt NV | `XD01`–`XD12` |
| Hội đồng eval | `PDG01`, `PDG02`, `PNX01`, `PH01`, `PH02`, `THHD01`, `BB01`, `CG01` |
| Thực hiện RD03 | `THH01`–`THH09` |
| RD04 CS | `CNCS01–07`, `NDCS01–07`, `MTCS01–07`, `TDCS01–07`, `DUNGCS01–07` |
| RD04 TĐ | `CNTD01–07`, `NDTD01–07`, `MTTD01–07`, `TDTD01–07`, `DUNGTD01–07` |
| Tác động ĐC | `DGTT01`, `ADKQ01` |
| Nghiệm thu | `NT01`–`NT11` |
| Quyết toán | `HSQT01`–`HSQT11` |
| SP / SHTT | `SP07`, `SHTT06`–`SHTT09` |

**Không seed:** Jobworker tạo Hội đồng; `QT03` không gắn HS xét duyệt.

**Đã có V8, tái sử dụng:** `HD01–HD06`, `SP01–SP06`, `SHTT01–SHTT05`, `CBKH01–CBKH05`, `CNL01–CNL05`, `NV03`, `HS01–HS08` (generic, cho đến khi cắt sang mã loại).

---

## 6. Checklist đối chiếu màn hình hiện có

| Yêu cầu BA | Màn / hành động hiện có | Gap |
|---|---|---|
| List / tạo / chi tiết / sửa / xóa / trình duyệt / lịch sử / đính kèm HS chủ trương & xét duyệt | `/ho-so`, `/ho-so/tao`, `/ho-so/:id` + `HS01–HS08` | Chưa lọc menu theo loại; chưa mã `CT*` / `XD*` |
| Tab Nội dung đề xuất / Nguồn lực / Kết quả (eForm) | eForm theo **action bundle** trên chi tiết hồ sơ, không phải tab cố định | Cần tab theo loại + bind eForm |
| Tab Thuyết minh / Dự toán / Thẩm định / Kết quả XD | Như trên | Như trên |
| Hội đồng CRUD | `/hoi-dong` + `HD01–HD06` | Đủ khung list/form; thiếu phiếu / phiên / BB |
| Jobworker tạo HĐ | Backend worker (nếu có) | Không hiện menu |
| PNX / PĐG / phiên họp / tổng hợp / BB / chuyên gia | Chưa có màn riêng | Phải dựng |
| 9 tab thực hiện (PLM/QLNS/SAP/MS/QLTS) | Chưa có trên `/nhiem-vu/:id` | Phải dựng + tích hợp |
| 10 loại HS điều chỉnh | Chung `/ho-so` `DIEU_CHINH` | Chưa tách loại / cấp |
| Đánh giá tác động / baseline | Chưa có | Phải dựng |
| HS nghiệm thu / quyết toán + tab | Chung `/ho-so` | Chưa tab Điều kiện / SP / Kết luận / tài chính |
| SP / SHTT / CBKH / CNL | Catalog V8, **chưa route** | Chỉ gán được trên ma trận |

---

## 7. Việc chưa làm (cố ý)

1. **Không** migration identity V9 — chờ BA chốt OQ-019…024.
2. **Không** tách menu/route 10 loại RD04 hay tab eForm trên chi tiết hồ sơ.
3. Runtime tiếp tục gate generic `HS01–HS08` / `HD*` / `NV*`.

Khi chốt: seed Feature + mã mục 5 → map grant `HS*` theo `loai` hồ sơ → nav/guard theo mã loại → ẩn tab theo `screen_children`.

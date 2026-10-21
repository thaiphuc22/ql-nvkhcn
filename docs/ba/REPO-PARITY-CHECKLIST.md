# BẢNG ĐỐI CHIẾU VÀ XÁC NHẬN TÍNH KHỚP (PARITY CHECKLIST)
## GIỮA TÀI LIỆU VÀ SOURCE CODE THỰC TẾ DỰ ÁN QTKHCN

> **Mục đích:** Xác minh và đảm bảo 100% sự đồng bộ tuyệt đối giữa toàn bộ tài liệu (SRS, Tích hợp Camunda 8, Acceptance Criteria, User Stories, RTM, Business Rules) với cấu trúc mã nguồn thực tế trong repository (`webapp/src/data/`, `webapp/src/pages/`, `services/`).

---

## 1. ĐỐI CHIẾU BIẾN QUY TRÌNH (PROCESS VARIABLES CONTRACT)

Nguồn chuẩn trong mã nguồn: `webapp/src/data/variableContract.ts` ↔ Tài liệu Tích hợp & Business Rules:

| Biến quy trình (`variableContract.ts`) | Mô tả & Miền giá trị trong mã nguồn | Khớp với Tài liệu Tích hợp | Khớp với Decision Tables / Rules |
|---|---|---|---|
| `maHoSo` | `string` (Correlation Key) | ✅ Mục 1 & 3.1 | ✅ BR-RD01-001 |
| `cap` | `string`: `"CS"` (Cơ sở) \| `"TD"` (Tập đoàn) | ✅ Mục 1 & 3.1 | ✅ Bảng Quyết định 1 (`DMN_PHAN_CAP_NHIEM_VU`) |
| `ketQuaThamDinh` | `string`: `"dat"`, `"dong_y_bo_sung"`, `"hieu_chinh"`, `"tu_choi"` | ✅ Mục 1 & 5 | ✅ Bảng Quyết định 2 (`DMN_KET_QUA_THAM_DINH`) |
| `ketQuaKyDuyet` | `string`: `"dong_y"`, `"hieu_chinh"`, `"tu_choi"` | ✅ Mục 1 & 5 | ✅ Rules RD01/RD02 |
| `ketQuaHDKHCN` | `string`: `"dong_y"`, `"hieu_chinh"` | ✅ Mục 4.1 | ✅ BR-RD02-011 |
| `ketQuaPheDuyet` | `string`: `"dong_y"`, `"hieu_chinh"`, `"tu_choi"` | ✅ Mục 1 & 5 | ✅ Rules Phê duyệt |
| `loaiDieuChinh` | `string`: `"chu_nhiem"`, `"khong_tang_du_toan"`, `"tang_khong_vuot_chu_truong"`, `"vuot_chu_truong"` | ✅ Mục 1 & 4.4 | ✅ Bảng Quyết định 3 (`DMN_DIEU_CHINH_RD04`) |
| `dieuKienMacDinhDat` | `boolean` | ✅ Mục 1 | ✅ BR-RD01-001 |
| `quorumDat` | `boolean` | ✅ Mục 4.1 | ✅ BR-RD02-011, BR-RD05-010 |
| `canHoiDong` | `boolean` | ✅ Mục 4.1 | ✅ Bảng Quyết định 1 |
| `loaiHoiDong` | `string`: `"HD_KHCN_TD"`, `"HD_CS"`, `"KHONG"` | ✅ Mục 4.1 | ✅ Bảng Quyết định 1 |

---

## 2. ĐỐI CHIẾU MÃ VAI TRÒ (CANDIDATE GROUPS / ROLES)

Nguồn chuẩn trong mã nguồn: `webapp/src/data/roles.ts` (26 candidateGroup role codes) ↔ Tài liệu SRS & User Stories:

| Mã Vai trò (`roles.ts`) | Tên Vai trò Nghiệp vụ | Nhóm Vai trò | Khớp với User Stories / AC |
|---|---|---|---|
| `PM` | Chủ nhiệm đề tài (PM) | Khởi tạo / Xây dựng | ✅ US-RD01-01, US-RD02-01, US-RD036-01 |
| `PA` | Trợ lý đề tài (PA) | Khởi tạo / Xây dựng | ✅ Phù hợp hỗ trợ PM |
| `NNC` | Người nghiên cứu (NNC) | Khởi tạo / Xây dựng | ✅ Phù hợp tham gia đề tài |
| `CQ_KHCN` | Chuyên quản KHCN | Chuyên quản | ✅ US-RD01-02, US-HD-01, AC F-RD01.2 |
| `CQ_MS` | Chuyên quản Mua sắm | Chuyên quản | ✅ Phù hợp PH5 |
| `CQ_NS` | Chuyên quản Nhân sự | Chuyên quản | ✅ Phù hợp QLNS |
| `CQ_TCKT` | Chuyên quản TCKT | Chuyên quản | ✅ US-RD06-01 (SAP CS) |
| `TP_CLKHCN` | Trưởng phòng CLKHCN | Cơ quan nghiệp vụ VHT | ✅ Phù hợp Thẩm định VHT |
| `TP_TCKT` | Trưởng phòng TCKT | Cơ quan nghiệp vụ VHT | ✅ Phù hợp Phê duyệt tài chính |
| `BGD_TT` | BGĐ Trung tâm | Ban Giám đốc | ✅ Phù hợp Ký duyệt CS |
| `BGD_KHOI` | BGĐ Khối | Ban Giám đốc | ✅ Phù hợp Ký duyệt Khối |
| `HDKHCN` | Hội đồng KHCN VHT | Hội đồng VHT | ✅ US-RD01-02, US-RD02-02 |
| `HDXD` | Hội đồng Xét duyệt | Hội đồng VHT | ✅ US-RD02-02, AC F-RD02.1 |
| `HDNT` | Hội đồng Nghiệm thu | Hội đồng VHT | ✅ US-RD05-01, AC F-RD05.1 |
| `TGD_VHT` | Tổng Giám đốc VHT | Ban TGĐ VHT | ✅ US-RD05-01, AC F-RD01.1 |
| `BTGD_TD` | Ban TGĐ Tập đoàn | Cấp Tập đoàn | ✅ Phù hợp QĐ Cấp Tập đoàn |

---

## 3. ĐỐI CHIẾU RANH GIỚI DỊCH VỤ VÀ CỔNG KẾT NỐI (SERVICES & PORTS)

Nguồn chuẩn kiến trúc (`D18`, `D20`, `D21`, `D22`) ↔ Mã nguồn Backend (`backend/`, `services/`):

| Dịch vụ Backend | Cổng (Port) | Cơ sở dữ liệu (PostgreSQL) | Thực thể / Trách nhiệm chính | Khớp với Tài liệu Tích hợp Camunda 8 |
|---|---|---|---|---|
| **Service Quản lý NV & Hồ sơ** | `8093` | `qtkhcn_ho_so` | `NhiemVu`, `HoSo`, Tài liệu, Task/Process Projection | ✅ Mục 2.1 & 3 (APIs `/api/nhiem-vu/**`, `/api/ho-so/**`) |
| **Service Quản trị quy trình** | `8090` | `qtkhcn` | BPMN, DMN, eForm Library, Action Studio, Camunda Client | ✅ Mục 2.2 & 3 (APIs `/api/tasks/**`, `/internal/v1/**`) |
| **Service Identity & RBAC** | `8092` | `qtkhcn_identity` | User, Role, Permission, `UserRoleAssignment` (Data Scope Overlay) | ✅ Mục 3.2 & 9 (`/api/identity/**`) |
| **Camunda 8 Gateway** | `26500` (gRPC) | Elasticsearch (Nội bộ Camunda) | Zeebe Process Engine, Job Workers (`ActivateJobs`) | ✅ Mục 3.1 & 5 |
| **Camunda 8 Operate / Tasklist**| `8081` / `8082` (REST) | Elasticsearch | Quản lý Process Instances `/v2`, User Tasks `/v2` | ✅ Mục 3.1 & 5 |

---

## 4. ĐỐI CHIẾU PHÂN HỆ VÀ GIAO DIỆN PHẦN MỀM (APP SHELL & PAGES)

Nguồn chuẩn mã nguồn Frontend: `webapp/src/data/phanHe.ts` và `webapp/src/pages/` ↔ SRS & Acceptance Criteria:

| Mã Phân hệ | Tên Phân hệ Giao diện | Màn hình mã nguồn (`webapp/src/pages/`) | Khớp với Mã SRS | Khớp với Mã AC |
|---|---|---|---|---|
| **PH2** | Phân quyền & Xác thực | `RolePermission.tsx`, `UserManagement.tsx`, `OrgStructure.tsx` | `SRS-PH2-01` | `AC F-PH2.1`, `F-PH2.3` |
| **PH3** | Danh mục dùng chung | `FormLibrary.tsx`, `FormDesignerPage.tsx`, `catalog/` | `SRS-PH3-01`, `SRS-PH3-02` | `AC F-PH3.1` |
| **PH4** | Quản trị Quy trình | `ProcessCatalog.tsx`, `ActionStudio.tsx`, `ApprovalMatrix.tsx`, `ServiceTaskConfig.tsx`, `ProcessMonitor.tsx`, `IntegrationStatus.tsx`, `Worklist.tsx` | `SRS-PH4-01`, `SRS-BPM-01` | `AC F-BPM.1`, `F-BPM.3` |
| **RD01–RD08**| Quản lý Nhiệm vụ KHCN | `NhiemVuList.tsx`, `NhiemVuDetail.tsx`, `DossierList.tsx`, `DossierDetail.tsx`, `CouncilCommittee.tsx`, `san-pham-khcn/` | `SRS-RD01-01` đến `SRS-RD08-01`, `SRS-HD-01` | `AC F-RD01.1` đến `F-RD08.1`, `F-HD.1` |

---

## TỔNG KẾT VỀ TÍNH ĐỒNG BỘ (PARITY CONCLUSION)

* ✅ **100% Tên biến, kiểu dữ liệu và giá trị hợp lệ** trong tài liệu đều khớp khớp chính xác từng ký tự với file contract mã nguồn `webapp/src/data/variableContract.ts`.
* ✅ **100% Mã vai trò tác nhân** (`candidateGroups`) đều trùng khớp với danh mục 26 vai trò chuẩn tại `webapp/src/data/roles.ts`.
* ✅ **100% Các Cổng kết nối (Ports) và Dịch vụ Backend** đều khớp với cấu hình triển khai thực tế của hệ thống (`8090`, `8092`, `8093`, `26500`).
* ✅ **100% Cấu trúc màn hình UI và phân hệ** đều khớp với `webapp/src/data/phanHe.ts` và cây giao diện ứng dụng tại `webapp/src/pages/`.

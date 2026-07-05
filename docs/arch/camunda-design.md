# Thiết kế sử dụng Camunda trong hệ thống Quản trị NV KHCN

> **Trạng thái:** F2 — DRAFT (chưa lock cứng) · **Ngày:** 2026-07-03
> **Phạm vi:** cách áp dụng Camunda cho Phân hệ Quản lý Quy trình, phục vụ Phân hệ Quản lý Nhiệm vụ KHCN.
> **Nguồn:** `scope-2-phanhe.md`, `ENGINE-NFR-requirements.md` (REQ-ENG-*, NFR-*), `RTM.md`, catalog RD01–RD10.
> ✅ **License Camunda 8: RESOLVED (2026-07-03)** — khách xác nhận dùng bản có license. Còn treo `OQ-CAM-DEPLOY` (SaaS/Self-Managed) + `OQ-CAM-COMPONENTS` (bộ kèm gì) — xem mục 8.
> 📄 **Topology triển khai + cơ chế BE↔Camunda kết nối:** xem `camunda-integration-explained.md` (sơ đồ K8s Self-Managed VHT, 4 kênh gRPC/REST, OAuth2, checklist bàn giao).
> ⚠️ **Phụ thuộc:** một số pattern chờ khách trả lời OQ-002 (rework), OQ-003 (phiên họp), OQ-006 (NFR), OQ-009 (đồng bộ).

---

## 1. Quyết định kiến trúc (đã thống nhất trong thảo luận)

| # | Quyết định | Trạng thái | Ghi chú |
|---|---|---|---|
| D1 | **Engine = Camunda 8** | ✅ License chốt (2026-07-03); chờ deploy-model | Khách dùng bản có license; SaaS/Self-Managed còn hỏi (OQ-CAM-DEPLOY) |
| D2 | **UI = custom (tiếng Việt, đa vai trò) gọi API Camunda** | Draft | KHÔNG dùng Tasklist mặc định cho luồng chính (có thể dùng cho POC) |
| D3 | **Camunda = lớp điều phối, KHÔNG chứa dữ liệu đề tài** | Nguyên tắc chốt | Process chỉ giữ ID + biến điều khiển |
| D4 | **1 process definition / mỗi luồng RD** + sub-process tái sử dụng | Draft | Không gộp mega-process |
| D5 | **DMN cho quyết định cấu trúc** (định tuyến, phân cấp, Đạt/Chưa đạt) | Draft | Nghiệp vụ sửa luật không cần dev |

---

## 2. Vai trò của Camunda: lớp điều phối (orchestration)

**Nguyên tắc quan trọng nhất** (tránh sai lầm phổ biến nhất khi dùng workflow engine):

```
┌─────────────────────────────────────────────┐
│  UI (custom, tiếng Việt, đa vai trò)          │
├─────────────────────────────────────────────┤
│  Ứng dụng nghiệp vụ QL NV KHCN                 │  ← chứa DỮ LIỆU: hồ sơ đề tài,
│  (hồ sơ, biểu mẫu, phiếu, dự toán, sản phẩm)  │    phiếu nhận xét, QĐ, file
├─────────────────────────────────────────────┤
│  CAMUNDA 8 (điều phối)                         │  ← chứa TRẠNG THÁI LUỒNG:
│  BPMN (luồng) · DMN (luật) · timers · tasks   │    đang ở bước nào, ai, hạn nào
├─────────────────────────────────────────────┤
│  Job workers / Connectors                      │  → QLNS, MS, SAP, QLTS, PLM, SSO/IAM
└─────────────────────────────────────────────┘
```

- **Camunda giữ:** hồ sơ đang ở bước nào, giao cho ai, quá hạn chưa, rẽ nhánh nào.
- **Ứng dụng nghiệp vụ giữ:** nội dung hồ sơ, phiếu, quyết định, chữ ký, file.
- Camunda **gọi** app qua job worker; app **hỏi** Camunda "task của tôi là gì".

### Thành phần Camunda 8 dự kiến dùng
| Thành phần | Dùng làm gì |
|---|---|
| **Zeebe** | Workflow engine (chạy BPMN) |
| **DMN** | Bảng quyết định (định tuyến, phân cấp, Đạt/Chưa đạt) |
| **Operate** | Giám sát instance, xử lý sự cố vận hành |
| **Connectors / Job workers** | Tích hợp 5 hệ thống ngoài |
| **Identity** ↔ **SSO/IAM VHT** | Ánh xạ user/nhóm (⚠️OQ-021 giao thức) |
| **Web/Desktop Modeler** | BA/dev vẽ & quản lý BPMN/DMN |
| ~~Tasklist~~ | Không dùng cho luồng chính (D2) — có thể dùng POC |

---

## 3. Map năng lực Camunda ↔ REQ-ENG

| Đặc thù nghiệp vụ KHCN | Cơ chế Camunda | REQ-ENG | Phụ thuộc |
|---|---|---|---|
| Định tuyến CS/TĐ, loại điều chỉnh RD04 | DMN + gateway | REQ-ENG-007/010 | OQ-008 |
| Hội đồng nhiều người cùng ký | Multi-instance + completion condition (quorum) | REQ-ENG-008 | — |
| Phiên họp 1 & 2 | Sub-process tuần tự / loop | REQ-ENG-009 | OQ-003 |
| Gán việc theo vai trò | User task + candidate group | REQ-ENG-004 | — |
| SLA + nhắc việc | Timer boundary event + escalation | REQ-ENG-013 | OQ-006 |
| Rework khi từ chối/Chưa đạt | Gateway quay lại / error-escalation event | REQ-ENG-011 | OQ-002 |
| Vai trò thay thế (nhập hộ TĐ) | Assignment + audit "on behalf" (ở app) | REQ-ENG-012 | OQ-006 (RBAC) |
| Tích hợp 5 hệ thống | Job worker / Connector (service task) | NFR-INT-001 | OQ-009 |
| Sinh danh sách hội đồng | DMN + service task gọi app | REQ-ENG-010 | AMB-001 |
| Versioning quy trình | Process definition versioning (instance giữ bản cũ) | REQ-ENG-003 | — |
| Audit luồng | Zeebe/Operate history (audit nội dung ở app) | REQ-ENG-014 | — |

---

## 4. Cách mô hình hoá (khuyến nghị)

- **1 process definition / mỗi luồng RD** (RD01.01, RD01.02, …) — versioning độc lập, không gộp mega-process.
- **Sub-process tái sử dụng (call activity)** cho mẫu lặp xuất hiện ở hầu hết RD:
  - *"Thẩm định qua Hội đồng"* (multi-instance + quorum + phiên 1/2)
  - *"Ký duyệt nhiều cấp"*
  - *"Thao tác hộ (act-on-behalf)"*
- **DMN riêng** cho: phân cấp CS/TĐ, định tuyến RD04, Đạt/Chưa đạt → sửa luật không đụng BPMN.
- **Rework** (OQ-002) là điểm nhạy cảm nhất — chưa mô hình hoá được cho tới khi khách trả lời "từ chối thì quay về đâu, giới hạn số vòng".

---

## 5. Ranh giới BPMN ↔ Code (kỷ luật cốt lõi)

> **BPMN trả lời "bước tiếp theo là gì & ai làm"; Code trả lời "thực chất làm gì với dữ liệu".**

### 5.1 Bảng phân bổ

| Mối quan tâm | Đặt ở đâu | Vì sao |
|---|---|---|
| Trình tự bước phê duyệt | **BPMN** | Chính là "quy trình động" |
| Rẽ nhánh CS/TĐ, loại điều chỉnh RD04 | **DMN** (gateway ở BPMN gọi DMN) | Nghiệp vụ tự sửa luật |
| Gán việc theo vai trò | **BPMN** user task + candidate group | Ánh xạ ma trận tác nhân |
| Hội đồng nhiều người ký, quorum | **BPMN** multi-instance + completion condition | Hành vi luồng |
| SLA/hạn, nhắc việc, escalation | **BPMN** timer event | Điều phối thời gian |
| Rework khi từ chối | **BPMN** loop/gateway (chờ OQ-002) | Điều khiển luồng |
| Nội dung hồ sơ, phiếu, dự toán, sản phẩm | **Code/DB app** | Dữ liệu, không phải trạng thái luồng |
| Validation ("kế hoạch năm", "đủ M phiếu", "ngưỡng dự toán") | **Code app** | Truy vấn dữ liệu nhiều nguồn |
| Sinh QĐ/biên bản, chữ ký số, khóa sửa | **Code app** | Nghiệp vụ + bảo mật |
| Gọi QLNS/MS/SAP/QLTS/PLM | **Job worker (code)**; BPMN chỉ có service task "gọi" | Logic tích hợp ở worker |
| RBAC + "act-on-behalf" enforcement | **Code app + IAM** | Camunda gán task, app quyết cho phép |

### 5.2 Kỷ luật process variables

Trong process **chỉ giữ**:
- `maHoSo` — correlation key ↔ dữ liệu ở app
- Biến điều khiển rẽ nhánh (giá trị = slug ASCII, nhãn tiếng Việt chỉ để hiển thị):

| Biến | Kiểu | Giá trị hợp lệ |
|---|---|---|
| `cap` | string | `CS` (Cơ sở) · `TD` (Tập đoàn) |
| `ketQuaThamDinh` | string | `dat` · `dong_y_bo_sung` · `hieu_chinh` · `tu_choi` |
| `ketQuaKyDuyet` | string | `dong_y` · `hieu_chinh` · `tu_choi` |
| `ketQuaHDKHCN` | string | `dong_y` · `hieu_chinh` |
| `ketQuaPheDuyet` | string | `dong_y` · `hieu_chinh` · `tu_choi` |
| `loaiDieuChinh` | string | `chu_nhiem` · `khong_tang_du_toan` · `tang_khong_vuot_chu_truong` · `vuot_chu_truong` |
| `dieuKienMacDinhDat` | boolean | kết quả system check điều kiện mặc định |
| `quorumDat` | boolean | đạt quorum hội đồng |

> **Nguồn chuẩn trong code**: `webapp/src/data/variableContract.ts` — preset điều kiện FEEL
> của editor và lint đều sinh/kiểm tra từ file này. Sửa contract → sửa ở đó trước, tài liệu
> này cập nhật theo.

**Tuyệt đối không** để: nội dung hồ sơ, danh sách phiếu, file PDF, dự toán chi tiết.
→ Camunda phình, khó version, rò rỉ dữ liệu.

### 5.3 Vùng xám: Business Rules đặt DMN hay Code?

| Nếu… | Đặt ở | Ví dụ |
|---|---|---|
| Nghiệp vụ muốn tự chỉnh, đầu vào vài biến đơn giản | **DMN** | định tuyến RD04, phân cấp CS/TĐ, suy Đạt/Chưa đạt |
| Cần dữ liệu phức tạp/nhiều bảng, có side-effect | **Code** | kiểm tra kế hoạch năm, đếm phiếu, đối chiếu dự toán SAP |

---

## 6. Ví dụ đi bộ qua RD01.01 (Xét duyệt Chủ trương cấp Cơ sở)

```
[BPMN]  Start ─▶ User Task "Khởi tạo hồ sơ" (candidate: PM/PA/NNC)
           │        └─[Code] app lưu hồ sơ, validate "trong kế hoạch năm" (BR-RD0101-001)
           ▼
        User Task "Ký cấp TT/Khối" (candidate: BGĐ TT/Khối)
           ▼
        Sub-process "Thẩm định CQNV"  ← call activity tái sử dụng
           │        └─[Code] app quản phiếu nhận xét, chữ ký số
           ▼
        [DMN] "Sinh danh sách HĐ" ─▶ Multi-instance "HĐ KHCN ký" (quorum)
           ▼
        User Task "TGĐ phê duyệt QĐ"
           │        └─[Code] app sinh QĐ + chữ ký số + khóa sửa
           ▼
        End ─▶ [Code] app cập nhật trạng thái đề tài "Đã duyệt chủ trương"
```

Mọi ô "làm gì với dữ liệu" đều ở **Code**; BPMN chỉ nối các ô lại và quyết ai/khi/nhánh nào.

---

## 7. Anti-pattern phải tránh

1. ❌ Nhồi dữ liệu đề tài vào process variables.
2. ❌ Viết validation phức tạp bằng FEEL trong BPMN.
3. ❌ Gọi DB trực tiếp từ BPMN (phải qua job worker).
4. ❌ Mỗi điều kiện nhỏ = 1 gateway → BPMN rối như code.
5. ❌ **Hai nguồn sự thật**: process nghĩ "approved" còn app nghĩ "rejected".
   → Khuyến nghị: **trạng thái luồng do Camunda chủ**, app phản chiếu qua event/callback.

---

## 7b. eForm — biểu mẫu điện tử (bổ sung 2026-07-03)

**Quyết định D6:** dùng **Camunda Forms (form-js)** render bằng `@bpmn-io/form-js` **trong UI custom** — KHÔNG dùng Camunda Tasklist. Biểu mẫu là **cấu hình (JSON schema)**, thiết kế trong Camunda Modeler, BA sửa không cần dev — nhưng UI vẫn của ta.

```
User Task (BPMN) ──formKey──▶ Camunda Form (JSON) ──@bpmn-io/form-js──▶ UI custom
                                                     điền xong → complete task + variables
```

**Tách 2 tầng (đặc thù văn bản KHCN):**

| Tầng | Việc | Công cụ | Map |
|---|---|---|---|
| eForm nhập liệu | Phiếu nhận xét/góp ý, tick Đạt/Chưa đạt, ý kiến | Camunda Forms (form-js) trong UI custom | REQ-ENG (forms) |
| Văn bản đầu ra | Sinh QĐ/Biên bản/Báo cáo thẩm định định dạng chuẩn từ dữ liệu + ký số | Template engine → PDF/DOCX | RD10 (biểu mẫu master) |

**Đã hiện thực (mockup):** biểu mẫu *Phiếu nhận xét / góp ý* (`webapp/src/forms/phieuNhanXet.ts`) render bằng form-js thật (`FormRenderer`), mở qua nút "Xử lý" ở Worklist & Chi tiết hồ sơ; kết luận trong phiếu (Đồng ý/Đề nghị chỉnh sửa) quyết định phê duyệt hay trả lại. Tầng "văn bản đầu ra" chưa làm.

**Phụ thuộc:** mỗi loại bước cần 1 form schema riêng (Phiếu Đạt/Chưa đạt, Báo cáo thẩm định…); chữ ký số & template văn bản gắn OQ-006 + RD10.

## 8. Phụ thuộc & việc cần chốt trước khi lock F2

| Hạng mục | Cần | Mã |
|---|---|---|
| License Camunda 8 | ✅ **RESOLVED (2026-07-03)** — khách xác nhận dùng bản có license | Blocker presale (đã gỡ) |
| **Mô hình triển khai** | SaaS hay **Self-Managed** (nội bộ VHT)? → quyết định vận hành cụm + đường mạng tới SAP/PLM | **OQ-CAM-DEPLOY** (chờ khách) |
| **Component kèm license** | Có Connectors runtime / Web Modeler / Identity không? → quyết định connector cấu hình vs job worker tay | **OQ-CAM-COMPONENTS** (chờ khách) |
| Rework pattern | Đích quay lại từng luồng + giới hạn vòng | OQ-002 / OQ-019 |
| NFR số (SLA, quy mô, uptime) | Khách/kiến trúc sư chốt | OQ-006 |
| SSO/IAM | Sản phẩm + giao thức (OIDC/SAML) của VHT | OQ-021 |
| Đồng bộ 5 hệ thống | real-time/batch + master-of-record | OQ-009 |
| Phiên họp 1/2 | Điều kiện chuyển phiên, có bắt buộc 2 phiên | OQ-003 |
| Ngưỡng định tuyến RD04 | Con số vào DMN | OQ-008 |

---

## 9. Bước tiếp

1. Vẽ **BPMN mẫu RD01.01** đầy đủ (ký hiệu chuẩn) làm khuôn cho các luồng khác.
2. Chốt **danh sách process variables + hợp đồng service task** (giao diện Camunda ↔ app).
3. Thiết kế **pattern rework & hội đồng multi-instance/phiên** (sau khi có OQ-002/OQ-003).
4. Khi license + OQ chốt → nâng tài liệu này từ DRAFT sang **LOCKED (F2)** và ghi vào `decisions`.

# Danh mục & đầu mục SRS — Pha 1 cấp cơ sở (CS) · QTKHCN

> **Mục đích:** brief đưa cho Gemini viết SRS `.md`.  
> **Nguồn:** roadmap 9 Sprint (S1–S9), PH2–PH7 + RD01–RD10, DoD `.harness/rules/srs-definition-of-done.md`.  
> **Phạm vi:** chỉ **cấp cơ sở (CS)**. Không viết delta Tập đoàn, RD03, RD04 trong đợt này.  
> **Định dạng:** Markdown-first (D23). Tên file: `SRS-<MÃ>-<NN>-<slug-không-dấu>-v0.1.md`.  
> **Thư mục output:** `docs/ba/Tài liệu SRS/<nhóm>/`

---

## A. Mapping phân hệ → mã SRS

| Ký hiệu | Tên phân hệ / nghiệp vụ | Mã nhóm SRS | Ghi chú |
|---|---|---|---|
| **PH2** | Phân quyền & Xác thực | `PH2` | Đơn vị, user, vai trò, ma trận quyền |
| **PH3** | Danh mục dùng chung | `PH3` | Loại DM, DM dùng chung, thư viện biểu mẫu |
| **PH4** | Quản trị Quy trình | `PH4` | BPMN, DMN, Action, ma trận phê duyệt, worklist, giám sát |
| **PH5** | Mua sắm | — | **Ngoài Pha 1** |
| **PH6** | Quản lý chi phí nhân công… | — | **Ngoài Pha 1** (một phần chi phí nằm trong RD06+SAP) |
| **PH7** | Quản lý hàng hóa… | — | **Ngoài Pha 1** |
| **RD01–RD10** | Quản lý Nhiệm vụ KHCN | `RD01`…`RD08` | Không gán PH5 (trùng mã “Mua sắm” trong app) |
| Xuyên cắt | Hội đồng & Chuyên gia | `HD` | Dùng chung RD01/02/05 |

**Thứ tự viết (bắt buộc theo phụ thuộc):**  
`SRS-PH2` → `SRS-PH3` → `SRS-PH4` → `SRS-RD01` → `SRS-RD02` → `SRS-HD` (có thể song song RD02) → `SRS-RD036` → `SRS-RD05` → `SRS-RD06` → `SRS-RD08`

---

## B. Danh sách tài liệu SRS cần Gemini viết (12 file)

| # | File | Sprint | Phụ thuộc | Ưu tiên |
|---|---|---|---|---|
| 1 | `SRS-PH2-01-Phan-quyen-Xac-thuc-v0.1.md` | S1 | — | Must |
| 2 | `SRS-PH3-01-Danh-muc-dung-chung-v0.1.md` | S1 | PH2 (phân quyền truy cập) | Must |
| 3 | `SRS-PH3-02-Thu-vien-bieu-mau-v0.1.md` | S2 | PH3-01 | Must |
| 4 | `SRS-PH4-01-Quan-tri-quy-trinh-v0.1.md` | S2 | PH2, PH3-02 | Must |
| 5 | `SRS-RD01-01-Xet-duyet-chu-truong-CS-v0.1.md` | S3–S4 | PH3-02, PH4 | Must |
| 6 | `SRS-RD02-01-Xet-duyet-NV-KHCN-CS-v0.1.md` | S4–S5 | RD01 (QĐ chủ trương) | Must |
| 7 | `SRS-HD-01-Hoi-dong-va-Chuyen-gia-v0.1.md` | S4–S6 | PH2, RD01/02 | Must |
| 8 | `SRS-RD036-01-Bao-cao-tien-do-CS-v0.1.md` | S5 | RD02 (đã mở mới) | Must |
| 9 | `SRS-RD05-01-Nghiem-thu-CS-v0.1.md` | S6 | RD02 | Must |
| 10 | `SRS-RD06-01-Quyet-toan-va-SAP-CS-v0.1.md` | S7–S8 | RD05 + SAP | Must |
| 11 | `SRS-RD08-01-So-huu-tri-tue-v0.1.md` | S9 | RD05 | Should |
| 12 | `SRS-RD07-01-Quan-ly-danh-muc-SPDV-v0.1.md` | (sau lõi CS) | PH3, PH4 | Should |

**Ngoài phạm vi đợt này (không giao Gemini lõi CS):** RD03, RD04, delta Tập đoàn (E14), PH5/PH6/PH7.  
**RD07** (Danh mục SPDV) có mock UI + eform seed sẵn; viết SRS khi batch Should / sau Batch 4.

**Đã có sẵn trong repo (không viết lại từ đầu):**  
`docs/ba/Tài liệu SRS/SRS-BPM-01-Dong-bo-quy-trinh-tu-Camunda-v0.1.md` — tham chiếu khi viết PH4; nếu trùng phạm vi thì **bổ sung/merge**, không tạo bản song song cùng nội dung.

---

## C. Khung bắt buộc mọi SRS (Gemini phải giữ đúng)

```text
Frontmatter YAML (ma_srs, ten, nhom, version, tac_gia, ngay_tao, trang_thai, nhap_cho_vts, oq_lien_quan, blueprint_nguon)
→ Tiêu đề + ## TÀI LIỆU THIẾT KẾ CHI TIẾT (SRS) + dòng Phân hệ
→ Bảng ghi nhận thay đổi
→ Trang ký (để trống)
→ Mục lục

1. GIỚI THIỆU
2. TỔNG QUAN GIẢI PHÁP  (2.2 bắt buộc mermaid flowchart giao tiếp module)
3. THIẾT KẾ CHI TIẾT     (mỗi chức năng = 3.X với 3.X.1 … 3.X.5)
4. THIẾT KẾ DÙNG CHUNG VÀ TÁI SỬ DỤNG
5. THIẾT KẾ ĐẢM BẢO TUÂN THỦ TIÊU CHUẨN QUẢN TRỊ DỮ LIỆU (5.1–5.7)
6. PHỤ LỤC (6.1–6.4, gồm bảng OQ)
```

Mỗi chức năng `3.X`:

| Mục | Nội dung |
|---|---|
| `3.X.1` | Thông tin chung (tác nhân, ý nghĩa, đường dẫn, ràng buộc) |
| `3.X.2` | Danh sách màn hình |
| `3.X.3` | Mô tả chi tiết thành phần — **1 bảng field-level 7 cột** |
| `3.X.4` | Luồng nghiệp vụ (bảng Bước\|Mô tả; sơ đồ `.drawio` 1/chức năng) |
| `3.X.5` | Quy tắc nghiệp vụ (mã BR-…) |

Giả định phải gắn `OQ-QTKHCN-xxx` và liệt kê ở mục 6.3 + `docs/ba/OQ-TRACKER.md`.

---

## D. Đầu mục chức năng (mục 3) theo từng SRS

### 1) `SRS-PH2-01` — Phân quyền & Xác thực · Sprint S1

**Phân hệ:** PH2  
**Done-when sprint:** Master data user/role dùng được.

```
3.1 Quản trị đơn vị / cơ cấu tổ chức
3.2 Quản trị người dùng
3.3 Quản trị vai trò nghiệp vụ
3.4 Ma trận phân quyền (vai trò × chức năng × quyền)
3.5 Gán vai trò / phạm vi dữ liệu cho người dùng (data scope)
3.6 Nhật ký thao tác phân quyền (audit tối thiểu)
```

---

### 2) `SRS-PH3-01` — Danh mục dùng chung · Sprint S1

**Phân hệ:** PH3  
**Done-when:** CRUD loại DM + danh mục dùng chung.

```
3.1 Quản lý loại danh mục dùng chung
3.2 Quản lý danh mục dùng chung (theo loại: ngành, lĩnh vực, loại kết quả NCKH, loại nhiệm vụ, …)
3.3 Trạng thái hiệu lực / ngưng dùng danh mục
3.4 Tra cứu & lọc danh mục (phục vụ form/dropdown toàn hệ thống)
```

---

### 3) `SRS-PH3-02` — Thư viện biểu mẫu · Sprint S2

**Phân hệ:** PH3  
**Done-when:** Form seed + tạo/sửa biểu mẫu không vỡ.

```
3.1 Danh sách thư viện biểu mẫu (tìm kiếm, lọc theo loại/RD)
3.2 Tạo mới biểu mẫu (mã formKey, tên, phiên bản)
3.3 Thiết kế / chỉnh sửa schema biểu mẫu (Camunda Forms / form-js)
3.4 Xem trước biểu mẫu (preview, HTML/field)
3.5 Phiên bản & trạng thái phát hành biểu mẫu
3.6 Gán biểu mẫu vào bước/hành động (tham chiếu tới PH4 Action Studio — không nhúng trùng)
```

---

### 4) `SRS-PH4-01` — Quản trị quy trình · Sprint S2

**Phân hệ:** PH4  
**Done-when:** 1 hồ sơ chạy E2E qua engine (cùng S2).  
**Tham chiếu:** `SRS-BPM-01` nếu đã có phần đồng bộ Camunda.

```
3.0 Quy trình nghiệp vụ tổng thể — từ cấu hình BPMN tới worklist runtime
3.1 Quản lý quy trình BPMN (thiết kế, phiên bản, deploy)
3.2 Ma trận quyết định (DMN / Rule Manager)
3.3 Ma trận phê duyệt (resolve người duyệt)
3.4 Ma trận hành động / Action Studio (scaffold, reconcile, bind formKey)
3.5 Cấu hình service task / tác vụ hệ thống
3.6 Worklist — Việc của tôi (claim/complete task)
3.7 Giám sát tiến trình (instance ACTIVE/COMPLETED/TERMINATED, incident)
3.8 Tích hợp hệ thống ngoài (catalog tích hợp — khung; SAP chi tiết ở RD06)
3.9 Nhật ký vận hành quy trình
```

---

### 5) `SRS-RD01-01` — Xét duyệt Chủ trương (CS) · Sprint S3–S4

**Nghiệp vụ:** RD01 · **Chỉ cấp cơ sở**  
**Done-when:** Ban hành QĐ chủ trương CS.

```
3.0 Quy trình nghiệp vụ tổng thể — Chủ trương CS (end-to-end)
3.1 Khởi tạo & xây dựng hồ sơ chủ trương (nháp, lưu tạm)
3.2 Trình ký & ký duyệt cấp Trung tâm/Khối
3.3 Góp ý / thẩm định CQNV (phiếu nhận xét)
3.4 Lập Báo cáo thẩm định chủ trương
3.5 Thành lập / quản lý danh sách Hội đồng KHCN (tham chiếu SRS-HD-01)
3.6 Hội đồng KHCN phê duyệt Báo cáo thẩm định
3.7 TGĐ VHT ban hành Quyết định chủ trương (CS)
3.8 Xem lịch sử / nhận xét theo bước duyệt
3.9 Danh sách & tra cứu hồ sơ chủ trương
```

**Ngoài phạm vi file này:** luồng cấp Tập đoàn (OQ-001 / E14).

---

### 6) `SRS-RD02-01` — Xét duyệt NV KHCN (CS) · Sprint S4–S5

**Nghiệp vụ:** RD02 · **Chỉ CS** · Gate: đã có QĐ chủ trương CS.

```
3.0 Quy trình nghiệp vụ tổng thể — Xét duyệt NV CS
3.1 Khởi tạo hồ sơ xét duyệt (kế thừa từ chủ trương)
3.2 Chuyên quản thẩm định — trạng thái Đạt / Chưa đạt
3.3 Lập & phê duyệt QĐ thành lập HĐXD
3.4 Hội đồng xét duyệt — phiên 1 (phiếu, biên bản)
3.5 Hội đồng xét duyệt — phiên 2
3.6 HĐ KHCN phê duyệt Báo cáo thẩm định xét duyệt
3.7 TGĐ phê duyệt Quyết định mở mới đề tài
3.8 Danh sách & tra cứu hồ sơ xét duyệt
```

---

### 7) `SRS-HD-01` — Hội đồng & Chuyên gia (xuyên cắt) · Sprint S4–S6

**Dùng chung** RD01 / RD02 / RD05.

```
3.1 Danh mục / hồ sơ chuyên gia
3.2 Quản lý hội đồng (mã hội đồng, liên kết hồ sơ/nhiệm vụ, cấp hội đồng)
3.3 Thành lập hội đồng từ QĐ / đề xuất thành viên theo lĩnh vực
3.4 Gán thành viên, vai trò trong hội đồng (chủ tịch, thư ký, ủy viên…)
3.5 Phiếu nhận xét / đánh giá của thành viên
3.6 Biên bản họp hội đồng
3.7 Theo dõi tiến độ ký / đủ quorum
```

---

### 8) `SRS-RD036-01` — Báo cáo tiến độ (CS) · Sprint S5

**Nghiệp vụ:** RD03.6 · Gate: nhiệm vụ đã mở mới.

```
3.1 Khởi tạo báo cáo tiến độ theo biểu mẫu
3.2 Cập nhật / lưu nháp báo cáo tiến độ
3.3 Trình ký & phê duyệt báo cáo tiến độ
3.4 Xuất file báo cáo
3.5 Danh sách & lịch sử báo cáo tiến độ theo nhiệm vụ
```

---

### 9) `SRS-RD05-01` — Nghiệm thu (CS) · Sprint S6

**Nghiệp vụ:** RD05 · **Chỉ CS** (không Tổ KT / luồng TĐ).

```
3.0 Quy trình nghiệp vụ tổng thể — Nghiệm thu CS
3.1 Khởi tạo hồ sơ nghiệm thu
3.2 QĐ thành lập Hội đồng nghiệm thu (HĐNT)
3.3 Phiếu đánh giá / nhận xét HĐNT
3.4 Tổng hợp kết quả nghiệm thu
3.5 TGĐ công nhận kết quả nghiệm thu
3.6 Gate mở sang quyết toán
3.7 Danh sách & tra cứu hồ sơ nghiệm thu
```

---

### 10) `SRS-RD06-01` — Quyết toán & SAP (CS) · Sprint S7–S8

**Nghiệp vụ:** RD06 · **SAP thật** (không mock).

```
3.0 Quy trình nghiệp vụ tổng thể — Quyết toán CS có SAP
3.1 Kết nối / cấu hình tích hợp SAP (môi trường UAT)
3.2 Đồng bộ / kéo số liệu chi phí nhiệm vụ từ SAP
3.3 Mapping mã nhiệm vụ ↔ mã SAP; xử lý lỗi & retry
3.4 Lập Báo cáo quyết toán từ số liệu SAP
3.5 Trình / phê duyệt Báo cáo quyết toán
3.6 Khoá sửa sau ban hành
3.7 Tra cứu lịch sử đồng bộ & quyết toán
```

---

### 11) `SRS-RD08-01` — Sở hữu trí tuệ · Sprint S9

**Nghiệp vụ:** RD08 · Should.

```
3.1 Đăng ký kết quả / sản phẩm SHTT (bài báo, sáng chế, …)
3.2 Quản lý công nghệ lõi liên quan nhiệm vụ
3.3 Theo dõi trạng thái đăng ký / bảo hộ
3.4 Tra cứu danh mục SHTT theo nhiệm vụ
```

---

### 12) `SRS-RD07-01` — Quản lý Danh mục SPDV · Should (sau lõi CS)

**Nghiệp vụ:** RD07 · 4 tuyến (QLDM SPDV · TT KD VHT · TTNCSP · P.TCKT VHT) · 7 bước.  
**Nguồn BPMN:** sơ đồ *RD07. QUẢN LÝ DANH MỤC DỊCH VỤ, SẢN PHẨM NGHIÊN CỨU*.  
**Mock UI:** `/san-pham-nghien-cuu` · seed `webapp/src/data/rd07Spdv.ts` · eform `eform-rd07-seed.ts`.  
**Prompt chi tiết:** `docs/ba/PROMPTS-GEMINI-RD07-SPDV.md`.

```
3.0 Quy trình nghiệp vụ tổng thể — RD07 (mermaid swimlane / parallel B3–B5 + gateway căn cứ)
3.1 B1 — Cập nhật danh mục & trạng thái SPDV đầu năm (sau KHN / chỉ đạo BTGĐ)
3.2 B2 — Gửi yêu cầu cập nhật (timer ngày 20 tháng cuối Quý N)
3.3 B3 — TT KD VHT cập nhật SPDV kinh doanh TCT (song song)
3.4 B4 — TTNCSP cập nhật SPDV NCPT (song song)
3.5 B5 — P.TCKT VHT cập nhật DT/CP/LN (song song)
3.6 B6 — Tổng hợp & xác thực căn cứ (Đủ → B7 · Không đủ → thông báo, kết thúc)
3.7 B7 — Cập nhật Danh mục SPDV tại Quý N (ghi DB)
3.8 Tra cứu / lọc danh mục SPDV theo tuyến · vòng đời · quý
```

---

## E. Prompt gốc — copy cho Gemini (mỗi lần 1 SRS)

```text
Bạn là BA viết SRS theo chuẩn QTKHCN.

ĐẦU VÀO BẮT BUỘC:
- Viết đúng 1 file Markdown cho: <TÊN FILE SRS>
- Phân hệ / mã: <PH2|PH3|…|RD0x>
- Phạm vi: chỉ cấp cơ sở (CS). Không viết cấp Tập đoàn.
- Giữ đúng khung 6 mục cấp 1 + frontmatter YAML + Trang ký trống.
- Mỗi chức năng trong danh sách dưới đây = một mục 3.X với đủ 3.X.1 → 3.X.5.
- Bảng field-level: đúng 7 cột (STT | Tên | Kiểu dữ liệu [Độ dài] | Input/Output | Giá trị khởi tạo | Mô tả mapping CSDL | Ghi chú).
- §2.2: mermaid flowchart giao tiếp module.
- 3.X.4: mô tả luồng bằng bảng Bước|Mô tả; đánh dấu chỗ cần file .drawio (không bịa API/DB nếu chưa có nguồn — dùng [CẦN XÁC NHẬN] + OQ-QTKHCN-xxx).
- Tiếng Việt, góc nhìn BA/PO không kỹ thuật thừa.
- Không sinh .docx.

DANH SÁCH CHỨC NĂNG (mục 3):
<dán block 3.x tương ứng từ mục D>

RÀNG BUỘC ĐÃ KHOÁ:
- Sprint plan Pha 1 CS, 1 FE + 1 BE, RD06 có SAP thật.
- PH5/PH6/PH7 và RD03/RD04 ngoài phạm vi.
- Nhiệm vụ ≠ Hồ sơ (1–N). Camunda chỉ giữ biến điều phối, không chứa business data.

OUTPUT:
Chỉ nội dung file .md hoàn chỉnh, sẵn sàng lưu vào docs/ba/Tài liệu SRS/<nhóm>/.
```

---

## F. Gợi ý chia batch giao Gemini

| Batch | File | Lý do |
|---|---|---|
| **Batch 1 — Nền** | PH2-01, PH3-01, PH3-02, PH4-01 | Viết trước; các RD phụ thuộc |
| **Batch 2 — Vòng đời đầu** | RD01-01, HD-01, RD02-01 | Chủ trương → xét duyệt |
| **Batch 3 — Vòng đời sau** | RD036-01, RD05-01 | Tiến độ + nghiệm thu |
| **Batch 4 — Tài chính & SHTT** | RD06-01, RD08-01 | SAP nặng nhất; để cuối |
| **Batch 5 — Should** | RD07-01 | Danh mục SPDV; sau lõi CS |

---

## G. Checklist trước khi đưa bản Gemini vào repo

- [ ] Đúng tên file & mã `ma_srs`
- [ ] Chỉ CS; không lọt nội dung Tập đoàn / RD03 / RD04
- [ ] Đủ 6 mục cấp 1; mỗi `3.X` đủ 5 tiểu mục
- [ ] OQ thật đã ghi `docs/ba/OQ-TRACKER.md`
- [ ] Đối chiếu DoD: `.harness/rules/srs-definition-of-done.md`
- [ ] Khung màn hình: `.harness/rules/srs-screen-template.md`

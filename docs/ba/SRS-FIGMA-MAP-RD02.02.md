# Map Figma Mockup RD02.02 → SRS (Pha 1 CS)

> **Nguồn Figma:** [VHT_DRAFT · node `11:56`](https://www.figma.com/design/jC6ldmlIeFmBWKx4dRvn6e/VHT_DRAFT?node-id=11-56)  
> **Canvas:** `Mockup Luồng RD02.02`  
> **Tiêu đề trên Figma:** *Mockup mô tả luồng thêm NV và xét duyệt theo RD02.02. Xét duyệt NV KHCN cấp Tập đoàn*  
> **Ngày map:** 2026-08-06  
> **Mục đích:** brief cho Gemini/BA viết SRS, gắn ảnh/frame thật.

---

## 0. Cảnh báo phạm vi (bắt buộc đọc)

| | Roadmap SRS đã chốt | Mockup Figma hiện có |
|---|---|---|
| Luồng | **RD02 cấp cơ sở (CS)** trong S4–S5 | Ghi rõ **RD02.02 cấp Tập đoàn** |
| Hệ quả | SRS-RD02-01 chỉ viết CS | Nhiều màn dùng chung CS/TĐ; nhãn TĐ trên tiêu đề canvas |

**Quyết định map tạm (OQ):**  
Viết SRS theo **hành vi màn hình** trong mockup, gắn vào `SRS-RD02-01` (CS). Mọi chỗ mockup nói “Tập đoàn / RD02.02” đánh `[CẦN XÁC NHẬN] OQ-QTKHCN-001` — tách file delta TĐ sau (E14), không trộn vào Pha 1 CS trừ khi PO đổi quyết định.

---

## 1. Catalog section Figma (node `11:56`)

| # | Section (Figma) | nodeId | Vai trò chính | SRS đích |
|---|---|---|---|---|
| A | Login | `900:16487` | Tất cả | Ngoài SRS nghiệp vụ (nền IAM/PH2) — ghi chú login SSO |
| B | Chọn phân hệ | `900:26997` | Tất cả | PH2 entitlement + shell 3 App (D19) — tham chiếu `SRS-PH2-01` / shell |
| C | Tạo nhiệm vụ KHCN mới | `907:27090` | PM/PA | **SRS-RD02-01** §3.1 (+ NV master trước hồ sơ) |
| D | PM — gửi hồ sơ xét duyệt | `913:18855` | PM | **SRS-RD02-01** §3.1, 3.8; worklist **SRS-PH4-01** §3.6 |
| E | Chuyên quản KHCN — nhận xét thẩm định | `932:156` | CQ KHCN | **SRS-RD02-01** §3.2 |
| F | Chuyên quản TCKT | `932:176` | CQ TCKT | **SRS-RD02-01** §3.2 |
| G | Chuyên quản MS | `932:196` | CQ MS | **SRS-RD02-01** §3.2 |
| H | Chuyên quản NS | `932:216` | CQ NS | **SRS-RD02-01** §3.2 |
| I | PM — nhận phiếu NX & hoàn chỉnh HSXD | `932:236` | PM | **SRS-RD02-01** §3.1 (rework sau Chưa đạt / phiếu NX) |
| J | Hệ thống tạo Hội đồng xét duyệt | `932:287` | CQ / PM | **SRS-HD-01** §3.2–3.4 + **SRS-RD02-01** §3.3 |
| K | BGĐ — Ký bộ HSXD dự thảo | `932:256` | BGĐ | **SRS-RD02-01** (ký cấp TT/Khối / QĐ dự thảo) — map §3.x bổ sung |
| L | Quản lý — Giám sát tiến trình HS/NV | `941:16909` | Quản trị QT | **SRS-PH4-01** §3.7 |

Banner chữ lớn: *Luồng nhận xét xử lý song song của các bộ phận chuyên quản* → rule song song CQ trong §3.2 + BR.

---

## 2. Map chi tiết frame → đầu mục SRS

### 2.1 `SRS-RD02-01` — Xét duyệt NV KHCN (CS)

| Mục SRS | Nội dung cần viết | Frame / node Figma | Ghi chú UI từ mockup |
|---|---|---|---|
| **3.0** Quy trình E2E | Sơ đồ end-to-end + mermaid §2.2 | Toàn canvas `11:56` | Thứ tự: Login → chọn PH → tạo NV → HSXD → CQ song song → PM hoàn thiện → HĐXD → BGĐ ký |
| **3.1** Khởi tạo hồ sơ XD (kế thừa chủ trương) | Tạo NV + Thêm hồ sơ + đính kèm + e-form | `907:27090` frames: Danh sách NV, Thêm mới NV, Chi tiết NV, Thêm hồ sơ, Upload; `913:18855` Xử lý HS | Có pop-up xác nhận tạo NV; mẫu tài liệu; nhân sự đề tài; filter tiêu chí; **BM.02.02.DTO.NV_2024** |
| **3.2** Chuyên quản Đạt/Chưa đạt | 4 vai trò CQ song song | `932:156` KHCN, `932:176` TCKT, `932:196` MS, `932:216` NS | Worklist → chi tiết → Đồng ý/Từ chối + pop-up nhận xét; tải/xem/xóa/upload tài liệu |
| **3.3** QĐ TL HĐXD | Tạo / lưu hội đồng | `932:287` Danh sách HĐ, Thêm mới HĐ, sau Lưu | Menu Quản lý Hội đồng |
| **3.4 / 3.5** HĐXD phiên 1 & 2 | *(thiếu / mỏng trên canvas)* | — | **GAP:** mockup chưa có frame phiên họp 1/2, phiếu HĐXD, biên bản → đánh OQ hoặc bổ sung Figma |
| **3.6** HĐ KHCN phê duyệt BC thẩm định | *(chưa thấy section riêng)* | — | **GAP** |
| **3.7** TGĐ QĐ mở mới đề tài | *(chưa thấy)* | — | **GAP** — canvas nghiêng TĐ / dừng ở BGĐ ký dự thảo |
| **3.8** Danh sách & tra cứu HSXD | Việc của tôi, chi tiết NV/HS | `913:18855`, `932:236` | Xem BPMN / xem toàn bộ luồng |
| **3.9 (bổ sung)** Ký duyệt cấp BGĐ / QĐ dự thảo | Pop-up ký, Voffice | `932:256` | Mockup có “mở Voffice để ký” → OQ tích hợp chữ ký số |
| **3.10 (bổ sung)** Rework sau phiếu NX | PM nhận phiếu NX, hoàn chỉnh HS | `932:236` | Khớp OQ-002 rework |

### 2.2 `SRS-HD-01` — Hội đồng & Chuyên gia

| Mục SRS | Frame Figma | Ghi chú |
|---|---|---|
| 3.2 Quản lý hội đồng | `932:287` danh sách | |
| 3.3 Thành lập hội đồng | `932:287` Thêm mới | |
| 3.4 Gán thành viên | *(cần zoom form Thêm mới HĐ)* | Chụp chi tiết khi viết SRS |
| 3.5–3.7 Phiếu / biên bản / quorum | **GAP** trên mockup RD02.02 | |

### 2.3 `SRS-PH4-01` — Quản trị quy trình

| Mục SRS | Frame Figma | Ghi chú |
|---|---|---|
| 3.6 Worklist Việc của tôi | Nhiều section (PM, CQ…) | Cùng pattern UI |
| 3.7 Giám sát tiến trình | `941:16909` | Click mã HS xem chi tiết tiến trình |
| 3.1 / BPMN viewer | `913:18855` “Xem BPMN”, “Xem toàn bộ” | Runtime view trên HS, không phải editor |

### 2.4 `SRS-PH2-01` / Shell

| Mục | Frame | Ghi chú |
|---|---|---|
| Login | `900:16487` | Ảnh flow đăng nhập |
| Chọn phân hệ | `900:26997` | QL Quy trình vs QL NV KHCN & HS |

### 2.5 `SRS-PH3-02` — Thư viện biểu mẫu

| Mục | Frame | Ghi chú |
|---|---|---|
| Gán / xem e-form trên bước | `913:18855` nhãn **E-form BM.02.02.DTO.NV_2024** | Trace formKey vào Action / bước XD |

---

## 3. Ma trận màn hình (để Gemini điền 3.X.2 / 3.X.3)

| STT | Tên màn hình (theo Figma) | Section | SRS mục | Ảnh nguồn node |
|---|---|---|---|---|
| 1 | Chọn phân hệ | B | Shell/PH2 | `900:27001` |
| 2 | QL NV KHCN & HS (home) | B, C | RD02 / NV | `907:27069`, `907:27092` |
| 3 | Danh sách NV KHCN | C | RD02 3.1 | `907:27099` |
| 4 | Thêm mới NV KHCN | C | RD02 3.1 | `907:27100` |
| 5 | Chi tiết NV KHCN | C, D | RD02 3.1/3.8 | `907:27101`, `913:18867` |
| 6 | Thêm mới hồ sơ | C | RD02 3.1 | `907:27102` |
| 7 | Tải lên hồ sơ đính kèm | C | RD02 3.1 | `907:27103` |
| 8 | Việc của tôi | D, E–H, I, K | PH4 3.6 + RD02 | nhiều frame cùng pattern |
| 9 | Chi tiết công việc cần xử lý | D | RD02 3.1/3.8 | `913:18865` |
| 10 | Pop-up xác nhận Đồng ý/Từ chối | D, E–H | RD02 3.2 | `932:415` |
| 11 | E-form BM.02.02… | D | PH3-02 + RD02 | `1196:31010` |
| 12 | Xem BPMN / toàn bộ luồng | D | PH4 | `932:410`, `1095:18131` |
| 13 | Danh sách Hội đồng | J | HD-01 | `932:295` |
| 14 | Thêm mới Hội đồng | J | HD-01 / RD02 3.3 | `932:297` |
| 15 | Giám sát tiến trình | L | PH4 3.7 | `941:16919` |
| 16 | BGĐ ký + Voffice | K | RD02 bổ sung | `932:256` |

---

## 4. GAP / OQ đề xuất ghi tracker

| Mã đề xuất | Mức | Nội dung |
|---|---|---|
| OQ-QTKHCN-001 | Cao | Mockup gắn **RD02.02 TĐ** trong khi roadmap Pha 1 chỉ **CS** — giữ CS hay viết luôn TĐ? |
| OQ-QTKHCN-002 | Cao | Thiếu mockup **HĐXD phiên 1/2**, phiếu HĐ, biên bản, HĐ KHCN, TGĐ mở mới |
| OQ-QTKHCN-003 | Trung | Tích hợp **Voffice / chữ ký số** khi BGĐ ký QĐ dự thảo |
| OQ-QTKHCN-004 | Trung | Điều kiện đủ CQ **Đạt** (4 CQ song song) trước khi lập HĐXD |
| OQ-QTKHCN-005 | Trung | Rework khi **Chưa đạt** / từ chối — đích trả về bước nào (liên quan OQ-002 harness) |

---

## 5. Prompt Gemini (batch RD02 từ Figma)

```text
Bạn là BA viết SRS-RD02-01-Xet-duyet-NV-KHCN-CS-v0.1.md.

NGUỒN UI (ưu tiên):
- Figma VHT_DRAFT fileKey=jC6ldmlIeFmBWKx4dRvn6e node=11:56
- Map chi tiết: docs/ba/SRS-FIGMA-MAP-RD02.02.md

PHẠM VI:
- Viết cấp cơ sở (CS). Chỗ mockup ghi Tập đoàn / RD02.02 → [CẦN XÁC NHẬN] OQ-QTKHCN-001.
- Đủ khung 6 mục + mỗi chức năng 3.X.1→3.X.5, bảng field 7 cột.
- Với mỗi màn trong bảng mục 3 của file map: mô tả thành phần theo ảnh Figma; nếu GAP thì ghi rõ và tạo OQ.

BẮT BUỘC cover:
3.0 E2E, 3.1 khởi tạo HSXD+NV, 3.2 CQ song song (KHCN/TCKT/MS/NS), 3.3 HĐXD,
3.8 worklist/chi tiết, 3.9 BGĐ ký (nếu có), 3.10 rework phiếu NX.
Đánh dấu GAP 3.4–3.7 nếu không có frame.

OUTPUT: một file .md hoàn chỉnh.
```

---

## 6. Thứ tự viết đề xuất

1. **SRS-RD02-01** (dùng map này) — ưu tiên  
2. **SRS-HD-01** (section J)  
3. Bổ sung **SRS-PH4-01** §3.6–3.7 từ D + L  
4. Trace **BM.02.02** vào **SRS-PH3-02**

Khi PO chốt OQ-001 (CS vs TĐ), cập nhật lại tiêu đề SRS và phạm vi §1.

# Đánh giá component cần có khi dùng BPMN — hệ thống QTKHCN VHT

> Rà soát lại nhu cầu BPMN **bám sát 26 luồng nghiệp vụ RD01–RD10** trong
> `1. Quy trinh Phan mem KHCN chi tiet (clean).md`, đối chiếu với hiện trạng code
> (`webapp/src/components/BpmnEditor.tsx`, `webapp/src/bpmn/khcnFormModule.ts`).
>
> Ngày lập: 03/07/2026 · Mục tiêu: chốt danh sách component + lộ trình P0→P3 để
> BPMN không chỉ "vẽ được hình" mà **chạy được luồng phê duyệt đa cấp**.

---

## 1. Bản chất tài liệu → hệ quả cho BPMN

Đọc trọn tài liệu, các luồng quy về **2 khuôn mẫu**:

### Khuôn A — Luồng phê duyệt đa cấp (RD01, RD02, RD04, RD05, RD06)
Cùng một khung lặp lại:

```
[Khởi tạo hồ sơ] → [Xây dựng] → [Ký duyệt cấp TT/Khối] → [Thẩm định CQNV]
   → [Lập Báo cáo thẩm định] → [Hội đồng: TLHĐ → PNX/PĐG → BB phiên 1,2]
   → [Phê duyệt cấp cao] → (Đồng ý ▸ kết thúc) | (Từ chối ▸ rework)
```

- **Nhiều nhóm tác nhân** (4–12 lane/luồng) — cột đầu mọi bảng "Tác nhân tham gia".
- **Cổng Đồng ý/Từ chối** ở *mỗi* cấp ký duyệt → **vòng lặp rework**.
- **Nhiều điểm kết thúc**: duyệt / tạm dừng / dừng.

### Khuôn B — Luồng tích hợp gửi/nhận dữ liệu (RD03)
Khác hẳn: QLKHCN ↔ NS/MS/SAP/QLTS/PLM, mỗi bên là một pool, trao đổi qua
**message flow** ("Gửi yêu cầu xuất thông tin" / "Cung cấp dữ liệu").

> **Hệ quả cốt lõi:** Giá trị BPMN ở đây **không nằm ở khả năng vẽ hình** (bpmn-js
> lo sẵn) mà ở **gán được AI–LÀM–GÌ (vai trò)** và **ĐI ĐÂU–KHI–TỪ–CHỐI (rework)**.
> Hiện code mới chỉ gán được `formKey` cho User Task.

---

## 2. Hiện trạng code BPMN

| Đã có | Chi tiết |
|---|---|
| `BpmnModeler` + palette mặc định | Đủ mọi phần tử BPMN gốc (task, gateway, event, pool/lane, data object) |
| Việt hoá nhãn | `TranslateViModule` + `relabel-vi` |
| Properties Panel | `Bpmn` + `Zeebe` provider + custom **"Biểu mẫu KHCN"** (chỉ `formKey`) |
| Tiện ích | Minimap, toolbar zoom/fit/fullscreen, skin thương hiệu |
| moddle | `zeebe-bpmn-moddle` (xuất XML Camunda 8 triển khai được) |

**Kết luận hiện trạng:** hạ tầng vẽ + việt hoá + form binding đã tốt. Thiếu đúng
lớp **ngữ nghĩa nghiệp vụ** (vai trò, rework, mẫu task domain, validation).

---

## 3. Bảng đánh giá component (bám bằng chứng)

Line refs trỏ tới `1. Quy trinh Phan mem KHCN chi tiet (clean).md`.

| # | Component / Module | Bằng chứng trong tài liệu | Hiện trạng | Ưu tiên |
|---|---|---|---|---|
| 1 | **Gán vai trò User Task** — Zeebe `assignee` / `candidateGroups` / `candidateUsers` | Mỗi task thuộc một nhóm tác nhân (PM, BGĐ, CQNV, HĐXD, HĐNT, TGĐ…) — L120‑136, L189‑208, L604‑617 | ❌ **Thiếu** (chỉ formKey) | **P0** |
| 2 | **Pool/Lane theo nhóm tác nhân** + ràng buộc lane→candidateGroup | "Nhóm tác nhân" là cột đầu mọi bảng; VHT vs Tập đoàn = 2 tổ chức — L150‑173, L236‑244 | ⚠️ bpmn-js có lane, **chưa** map lane→vai trò | **P0** |
| 3 | **Mẫu khối "Đồng ý / Từ chối" + đích rework** — XOR + 2 flow gán nhãn + loop | "Phê duyệt/Từ chối", "Đạt/Chưa đạt" ở mọi cấp — L131‑136, L193, L208 | ❌ Thiếu (đích rework = **OQ‑002** chưa chốt) | **P0** |
| 4 | **Element Templates** (task dựng sẵn đúng cấu hình): Ký duyệt · Thẩm định (PNX/PĐG) · Lập Quyết định (QĐ/CV/BB) · Đồng bộ NS/MS/SAP… | Động từ lặp: "Ký duyệt", "Lập Báo cáo thẩm định", "Lập, trình QĐ TLHĐ" — L128‑136, L196‑208, L611‑617 | ❌ Thiếu | **P1** |
| 5 | **Multi‑instance** (Hội đồng N thành viên, mỗi người ký PNX/PĐG) | "Danh sách… sinh theo QĐ thành lập"; mỗi thành viên ký phiếu — L198‑201, L613‑616, L639‑642 | ⚠️ có marker, thiếu preset domain | **P1** |
| 6 | **Sub‑process / Call Activity "Hội đồng" tái dùng** (TLHĐ → họp phiên 1 → phiên 2) | Khối lặp ở RD02/RD04/RD05 — L196‑201, L503‑506, L611‑616 | ⚠️ có sẵn, thiếu template | **P1** |
| 7 | **Service/Send/Receive Task + Message Flow** (tích hợp RD03) | Toàn bộ RD03: gửi/nhận với NS/MS/SAP/QLTS/PLM — L246‑308 | ⚠️ có sẵn, thiếu prop `zeebe:taskDefinition.type` | **P1** |
| 8 | **Timer events** (báo cáo định kỳ, SLA/hạn xử lý) | RD03.06 "báo cáo định kỳ/đột xuất" — L64, L310‑312 | ⚠️ có sẵn, chưa dùng | **P2** |
| 9 | **Routing theo điều kiện** (CS/TĐ, ngưỡng dự toán) — gateway condition / Business Rule / DMN | RD04: "không tăng tổng dự toán" vs "tăng nhưng không vượt chủ trương" — L67‑68, L72‑73 | ❌ chưa có editor điều kiện | **P2** |
| 10 | **Validation / lint BPMN** (mỗi UserTask phải có vai trò + form; XOR phải có default + nhãn; không node treo) | Suy ra từ tính nhất quán của luồng | ❌ Thiếu | **P2** |
| 11 | **Data Object → nối tầng sinh văn bản** (QĐ/CV/BB/PNX/PĐG/BBNT) | Phụ lục viết tắt — L744‑745; PNX/PĐG/BB xuyên suốt | ⚠️ có tầng văn bản riêng, chưa nối node | **P3** |
| 12 | **Palette/stencil domain rút gọn** (chỉ hiện phần tử hợp nghiệp vụ, tên tiếng Việt) | Người vẽ là BA/nghiệp vụ, không phải kỹ sư BPMN | ❌ Thiếu (đang dùng palette đầy đủ) | **P3** |

---

## 4. Nhóm tác nhân (nguồn cho danh mục vai trò)

Rút từ toàn bộ bảng "Tác nhân tham gia" — dùng làm `candidateGroups` (component #1)
và nhãn lane (component #2). Cần khách chuẩn hoá mã vai trò:

| Nhóm | Vai trò (candidateGroup dự kiến) |
|---|---|
| Khởi tạo/xây dựng | `PM`, `PA`, `NNC` (Chủ nhiệm / Trợ lý / Người nghiên cứu) |
| Chuyên quản | `CQ_KHCN`, `CQ_MS`, `CQ_NS`, `CQ_TCKT` |
| Cơ quan nghiệp vụ VHT | `TP_CLKHCN`, `TP_TCKT`, `TP_NS`, `GD_TTMS` |
| Ban GĐ | `BGD_TT`, `BGD_KHOI` |
| Cơ quan QLKHCN | `CQ_QLKHCN` (Chuyên hướng KHCN, TP CLKHCN) |
| Hội đồng | `HDKHCN`, `HDXD`, `HDNT`, `HD_DGHT` (+ `HDXD_DC`) |
| Ban TGĐ VHT | `PTGD_CT`, `TGD_VHT` |
| Cấp Tập đoàn | `CQ_KHCN_TD`, `HDKHCN_TD`, `HDXD_TD`, `HDNT_TD`, `CQNV_TD`, `BTGD_TD` |

> Cấp Tập đoàn "không trực tiếp thao tác — thực hiện qua nhân sự TCT theo ngành dọc"
> (L102) → vai trò TĐ cần cơ chế **đóng thế** (`Chuyên quản CLKHCN` cập nhật thay).
> Ảnh hưởng thiết kế RBAC (OQ‑006).

---

## 5. Lộ trình đề xuất

### P0 — "Phải có", làm được ngay (không chờ chốt OQ)
1. ✅ **ĐÃ LÀM** — **Danh mục vai trò dùng chung** (`webapp/src/data/roles.ts`) — 26
   nhóm ở mục 4 (`code` candidateGroup + `ten` VI + `nhom` phân cấp).
2. ✅ **ĐÃ LÀM** — **Nhóm "Phân công (KHCN)" trong Properties Panel**
   (`webapp/src/bpmn/khcnAssignmentModule.ts`, provider y hệt pattern `khcnFormModule`):
   dropdown **Nhóm phụ trách** ghi `zeebe:AssignmentDefinition.candidateGroups` +
   ô **assignee**. Đã nạp vào `BpmnEditor` (tsc + build pass). Hiện cho UserTask.
3. ✅ **ĐÃ LÀM** — **Map lane → vai trò** (`webapp/src/bpmn/khcnLaneModule.ts`):
   (a) provider nhóm "Vai trò (KHCN)" cho `bpmn:Lane` — chọn vai trò từ ROLES, lưu
   bằng tên lane; (b) behavior tự điền `candidateGroups` cho UserTask khi kéo/thả
   vào lane có vai trò (không đè lựa chọn sẵn có). Helper dùng chung tách ra
   `webapp/src/bpmn/assignmentUtil.ts`.

### P0.5 — Cần khách chốt trước
4. ✅ **ĐÃ LÀM (theo ASSUMPTION A1)** — **Khối "Đồng ý/Từ chối" + rework**
   (`webapp/src/bpmn/khcnDecisionModule.ts`): (a) palette "Cổng Đồng ý/Từ chối" chèn
   ExclusiveGateway đặt sẵn tên "Kết quả duyệt?"; (b) behavior tự gán nhãn 2 flow đi
   ra — flow 1 = **"Đồng ý"** (đặt luôn **default flow**), flow 2 = **"Từ chối"**.
   Không đè nhãn/lựa chọn có sẵn.

   > **ASSUMPTION A1 (OQ‑002 CHƯA chốt):** "Đồng ý" = default đi tiếp; "Từ chối" =
   > rework, **đích do người vẽ tự nối** (khuyến nghị mặc định: về bước "Xây dựng hồ
   > sơ" của PM). **Điều kiện rẽ nhánh để TRỐNG** cho panel điền (phụ thuộc cách phát
   > tín hiệu duyệt/từ chối — OQ‑006). Khi khách chốt OQ‑002 → chỉ chỉnh nhãn/đích
   > trong `khcnDecisionModule.ts`.

### P1 — Tăng tốc dựng luồng
5. ✅ **ĐÃ LÀM** — **Element Templates** (bản nhẹ, không cần Camunda template engine):
   `webapp/src/data/elementTemplates.ts` (11 mẫu: Ký duyệt/Phê duyệt · Thẩm định
   PNX/Đạt‑Chưa đạt · Lập Báo cáo/Quyết định · Đồng bộ QLNS/MS/SAP/QLTS/PLM) +
   PaletteProvider `webapp/src/bpmn/khcnTemplatesModule.ts` — kéo/click ra task dựng
   sẵn: UserTask kèm `candidateGroups`, ServiceTask kèm `zeebe:TaskDefinition.type`.
   → cũng phủ luôn ý #7 (job type Service Task cho RD03).
6. ✅ **ĐÃ LÀM** — **Multi‑instance (Hội đồng) + Call Activity "Hội đồng" tái dùng**
   (mở rộng `elementTemplates.ts` + `khcnTemplatesModule.ts`, nhóm "Hội đồng"):
   - **Thẩm định Hội đồng (đa thành viên)** — UserTask multi‑instance **song song**
     (`bpmn:MultiInstanceLoopCharacteristics` + `zeebe:LoopCharacteristics`
     inputCollection `=thanhVienHoiDong`, inputElement `thanhVien`) + candidateGroups
     `HDXD` → mỗi thành viên một phiên ký PNX/PĐG.
   - **Hội đồng (quy trình con)** — CallActivity `zeebe:CalledElement processId="khcn-hoi-dong"`
     (quy trình con TLHĐ → họp phiên 1 → phiên 2 deploy riêng).
7. ✅ (gộp vào #5) Prop `zeebe:TaskDefinition.type` cho Service Task tích hợp RD03.

### P2 — Chuẩn hoá & an toàn
8. ✅ **ĐÃ LÀM** — **Timer events** (2 mẫu palette, nhóm "Hẹn giờ"): **Định kỳ báo
   cáo** (Start Timer `timeCycle=R/P1M`, cho RD03.06) + **Chờ tới hạn xử lý**
   (Intermediate Catch Timer `timeDuration=PT48H`, cho SLA). Ghi
   `bpmn:TimerEventDefinition`.
9. ✅ **ĐÃ LÀM** — **Điều kiện rẽ nhánh (KHCN)** (`webapp/src/bpmn/khcnConditionModule.ts`):
   nhóm "Điều kiện (KHCN)" cho SequenceFlow ra từ Gateway — dropdown preset nghiệp vụ
   (Cơ sở/Tập đoàn · Đạt/Chưa đạt · các mức điều chỉnh RD04) ghi `bpmn:conditionExpression`
   FEEL dùng **BIẾN** (`=cap = "Tập đoàn"`, `=loaiDieuChinh = "vuot_chu_truong"`…),
   **không hardcode số**. Người vẽ tự thiết lập; ô Condition tự do của Zeebe vẫn dùng
   được cho biểu thức khác.

   > **Đính chính ranh giới:** capability này **không** phụ thuộc khách. Con số ngưỡng
   > dự toán KHÔNG nằm ở gateway mà ở **biến quyết định** (`loaiDieuChinh`) tính từ bước
   > phía trước (business rule/**DMN**). Chỉ **bảng DMN cụ thể** (điền số thật) mới chờ
   > khách — gateway routing thì tự cấu hình được ngay.
10. ✅ **ĐÃ LÀM** — **Validation/lint** (`webapp/src/bpmn/khcnLint.ts`, bản nhẹ không
    cần bpmnlint) + nút **"Kiểm tra"** trong `BpmnEditor` (Modal liệt kê lỗi/cảnh
    báo/gợi ý). Rule: UserTask thiếu vai trò/biểu mẫu · ServiceTask thiếu job type ·
    XOR thiếu default/nhãn nhánh · node treo · thiếu Start/End.

### P3 — Hoàn thiện trải nghiệm
11. Nối Data Object ↔ tầng sinh văn bản đầu ra (QĐ/BB/PNX…).
12. Palette/stencil domain rút gọn cho BA.

---

## 6. Phụ thuộc / Open Questions cần khách chốt

| Mã | Nội dung | Chặn component |
|---|---|---|
| **OQ‑002** | Từ chối thì rework quay về đâu (PM dựng lại vs cấp liền trước)? | #3 (khối rework) |
| **OQ‑006** | RBAC + chữ ký số: candidateGroup ánh xạ IAM thế nào? Ký số ở bước "Ký duyệt/Phê duyệt"? | #1, #4 |
| Mã vai trò | Chuẩn hoá 26 candidateGroup + cơ chế "đóng thế" của cấp Tập đoàn (L102, L166) | #1, #2 |
| Ngưỡng dự toán | Con số ranh giới "không tăng / tăng không vượt chủ trương / vượt" (RD04) | #9 (routing) |

---

## 7. Độ tin cậy

| Nội dung | Độ tin cậy |
|---|---|
| Khuôn A/B + nhu cầu lane/vai trò/rework | ✅ Cao (bằng chứng dày, mọi luồng) |
| Danh mục 26 vai trò | 🟠 Trung bình (rút từ bảng, cần khách chuẩn hoá mã) |
| Đích rework, ngưỡng dự toán, RBAC/ký số | 🔴 Gap — chờ khách (OQ‑002, OQ‑006) |

> Sơ đồ BPMN gốc trong PDF là **ảnh**, không trích được text (đã ghi ở đầu tài liệu
> nguồn) → thứ tự bước/nhánh rework suy từ bảng tác nhân + sự kiện bắt đầu/kết thúc,
> **chưa thay được cho sơ đồ gốc**. Nên đối chiếu lại ảnh khi dựng template luồng.

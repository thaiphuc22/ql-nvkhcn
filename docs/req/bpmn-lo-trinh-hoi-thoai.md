# Nhật ký hội thoại — Lộ trình BPMN components (QTKHCN VHT)

> Bản ghi lại phần trao đổi dẫn tới việc dựng bộ BPMN components: chuỗi yêu cầu của
> người dùng, các quyết định, đính chính và **assumption** đã chốt trong lúc làm.
> Bổ trợ cho `bpmn-components-danh-gia.md` (bảng đánh giá + lộ trình) — tài liệu kia
> nói *"làm gì"*, tài liệu này nói *"vì sao & theo trình tự nào"*.
>
> Ngày: 03/07/2026 · Phạm vi: phân hệ Quản lý Quy trình (Camunda/BPMN).

---

## 1. Bối cảnh khởi đầu

Người dùng yêu cầu **đọc lại** `1. Quy trinh Phan mem KHCN chi tiet (clean).md` và
**đánh giá lại các component cần có khi dùng BPMN**.

Kết luận cốt lõi rút ra (được người dùng chốt hướng): giá trị BPMN ở đây **không phải
"vẽ được hình"** (bpmn-js lo sẵn) mà là **gán được vai trò (ai làm) + rework (từ chối
đi đâu)**. Code lúc đó mới chỉ gán được `formKey`.

→ Sản phẩm bước này: `docs/req/bpmn-components-danh-gia.md` (12 component, xếp
P0→P3, kèm 26 nhóm tác nhân + 4 open question). Người dùng chọn **"Lưu đánh giá ra
docs/req trước"** (chưa code).

---

## 2. Trình tự người dùng chỉ định (và lý do)

Người dùng cho code theo đúng thứ tự ưu tiên, mỗi bước xác nhận trước khi sang bước sau:

| Bước | Người dùng yêu cầu | Ghi chú quyết định |
|---|---|---|
| 1 | **P0 #1 + #2** — gán vai trò + danh mục vai trò | "làm được ngay không cần chờ OQ" |
| 2 | **P0 #3** — lane → vai trò | tiếp nối P0 |
| 3 | **P1** — Element Templates | "giá trị cao cho BA dựng luồng nhanh" |
| 4 | **P0.5 #4** — khối Đồng ý/Từ chối + rework | người dùng cho phép **make assumption** vì OQ‑002 chưa chốt |
| 5 | **P1 #6** — Multi‑instance Hội đồng + Call Activity | phần P1 còn lại |
| 6 | **P2** — timer + validation/lint | |
| 7 | **P2 #9** — routing điều kiện gateway | *(xem đính chính mục 3)* |
| 8 | **P3** — data object→văn bản + palette rút gọn | hoàn thiện |

---

## 3. Hai đính chính / làm rõ quan trọng trong hội thoại

### 3.1. Trình tự tạo NV vs Hồ sơ (dẫn tới màn "Tạo NV mới")
Hỏi: *"user khởi tạo Hồ sơ trước hay Nhiệm vụ trước?"*
Trả lời (bám tài liệu RD01 L112 *"Sự kiện bắt đầu: Khởi tạo nhiệm vụ"*): **Nhiệm vụ
trước — nhưng ra đời NGAY TẠI hồ sơ Chủ trương đầu tiên**; từ hồ sơ #2 mới "có NV rồi
tạo hồ sơ". → dựng màn `/nhiem-vu/moi` sinh đồng thời NV + hồ sơ Chủ trương.

### 3.2. P2 #9 — "Tại sao chờ khách? Gate rẽ nhánh phải cho người dùng tự thiết lập, đúng không?"
Người dùng phản biện đúng. Đính chính đã ghi vào doc:
- **Capability đặt điều kiện rẽ nhánh = component**, phải build, **KHÔNG chờ khách**.
- Con số ngưỡng dự toán **không nằm ở gateway** mà ở **biến quyết định**
  (`loaiDieuChinh`) tính từ bước trước (business rule / **DMN**). Gateway chỉ so biến
  bằng FEEL (`=loaiDieuChinh = "vuot_chu_truong"`).
- Chỉ **bảng DMN điền số thật** mới chờ khách — đó là *nội dung một quy trình cụ thể*,
  không phải component. → P2 #9 được build ngay sau đó.

---

## 4. Assumptions đã chốt trong code (đánh dấu rõ để đổi khi khách trả lời)

### A1 — OQ‑002 (đích rework khi từ chối) — dùng cho khối Đồng ý/Từ chối
- "Đồng ý" = nhánh **default** đi tiếp.
- "Từ chối" = nhánh **rework**; **đích do người vẽ tự nối** (khuyến nghị mặc định: về
  bước "Xây dựng hồ sơ" của PM).
- **Điều kiện rẽ nhánh để TRỐNG** cho panel điền (phụ thuộc cách phát tín hiệu
  duyệt/từ chối — liên quan OQ‑006).
- Chủ ý **không** tự nối đích rework và **không** đặt điều kiện bừa (tự đoán → XML sai
  lệch khó gỡ). Khách chốt OQ‑002 → chỉ sửa nhãn/đích trong `khcnDecisionModule.ts`.

### Quy ước tạm khác (biến/định danh — chờ chuẩn hoá)
- Mã NV KHCN: sinh tạm `RD.2026.NNN` (quy tắc mã tạm/chính thức là gap).
- Multi‑instance Hội đồng: biến `=thanhVienHoiDong`, phần tử `thanhVien`.
- Call Activity Hội đồng: `processId = khcn-hoi-dong` (quy trình con deploy riêng).
- 26 mã vai trò (`candidateGroups`) chờ khách chuẩn hoá + cơ chế "đóng thế" cấp TĐ.

---

## 5. Bản đồ hiện thực (component → file)

Tất cả nạp qua `additionalModules` trong `webapp/src/components/BpmnEditor.tsx`.

| Ưu tiên | Component | File |
|---|---|---|
| P0 #1 | Gán vai trò User Task (candidateGroups/assignee) | `webapp/src/bpmn/khcnAssignmentModule.ts` |
| P0 #2 | Danh mục 26 vai trò | `webapp/src/data/roles.ts` |
| P0 #3 | Lane → vai trò (provider + behavior auto‑assign) | `webapp/src/bpmn/khcnLaneModule.ts` (+ `assignmentUtil.ts`) |
| P0.5 #4 | Khối Đồng ý/Từ chối + auto nhãn *(A1)* | `webapp/src/bpmn/khcnDecisionModule.ts` |
| P1 #5/#6/#7 | Element templates (task/service/MI/call activity) | `webapp/src/data/elementTemplates.ts` + `webapp/src/bpmn/khcnTemplatesModule.ts` |
| P2 #8 | Timer events (định kỳ / chờ hạn) | *(trong)* `elementTemplates.ts` + `khcnTemplatesModule.ts` |
| P2 #9 | Điều kiện rẽ nhánh (preset FEEL theo biến) | `webapp/src/bpmn/khcnConditionModule.ts` |
| P2 #10 | Validation/lint + nút "Kiểm tra" | `webapp/src/bpmn/khcnLint.ts` (+ UI trong `BpmnEditor.tsx`) |
| P3 #11 | Data Object → văn bản đầu ra | `webapp/src/bpmn/khcnDocDataModule.ts` |
| P3 #12 | Palette rút gọn (ẩn Data Store/Group) | *(trong)* `khcnTemplatesModule.ts` (`KhcnPaletteTrim`) |

**Verify mọi bước:** `tsc --noEmit` + `vite build` pass. **Chưa test trực quan trên
trình duyệt** (behavior kéo‑thả / panel) — cần `npm run dev` kiểm mắt.

---

## 6. Còn lại (không phải component — chờ khách)

- Bảng **DMN** điền số ngưỡng dự toán thật (RD04).
- **OQ‑002** đích rework · **OQ‑006** RBAC/chữ ký số · chuẩn hoá 26 mã vai trò.
- Quy trình con `khcn-hoi-dong` (TLHĐ → phiên 1 → phiên 2) author + deploy riêng.

> Sơ đồ BPMN gốc trong PDF là **ảnh** (không trích được text) → thứ tự bước/nhánh rework
> suy từ bảng tác nhân + sự kiện bắt đầu/kết thúc; nên đối chiếu lại ảnh khi dựng
> template luồng thật.

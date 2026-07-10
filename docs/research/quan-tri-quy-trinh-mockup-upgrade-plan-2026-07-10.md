# Kế hoạch nâng cấp mockup theo hướng "Quản trị Quy trình" đa domain

> **Ngày:** 2026-07-10 · **Input:** `docs/research/quan-tri-quy-trinh-bpm-platform-danh-gia-2026-07-10.md`
> (brainstorm, **chưa lock**) · **Phạm vi:** frontend-mock only, không đụng F1 (backend/DB/Camunda
> deployment vẫn blocked, xem `.harness/state/decisions.md`).

## Nguyên tắc chọn việc

Tài liệu đánh giá tự cảnh báo 2 điều ở mục 6 và 7:
1. Đừng xây "nền tảng lý thuyết chưa ai dùng" trước khi NVKHCN chạy thật.
2. Việc nào **rẻ + không hối tiếc dù platform hoá có được chốt hay không** thì làm ngay
   (mục 3.3: thêm `domainCode`); việc nào **ngụ ý một quyết định kiến trúc/hợp đồng chưa
   sign-off** (đổi tên phân hệ, ghi `decisions.md`, đổi scope-2-phanhe.md) thì **không đụng**.

Kế hoạch dưới đây chia theo đúng ranh giới đó — 3 phase, độ rủi ro tăng dần, **user chọn làm tới
đâu**, không mặc định làm hết.

---

## Phase 1 — `domainCode` scaffold trên các engine đã generic (RẺ, khuyến nghị làm ngay)

Mục 3.3 của tài liệu chỉ rõ 4 chỗ cần thêm `domainCode`, đã đối chiếu với code thật:

| Chỗ thêm | File | Hiện trạng |
|---|---|---|
| `RolePermissionPolicy` | `webapp/src/data/rbac.ts:65` | chưa có domainCode |
| `UserRoleAssignment` | `webapp/src/data/rbac.ts:79` | chưa có domainCode |
| `ActionAvailabilityPolicy` | `webapp/src/data/actionAvailabilityPolicy.ts` | chưa có domainCode |
| Action Registry (`ActionDefinition`) | `webapp/src/data/actionRegistry.ts:12` | chưa có domainCode |
| `ApprovalRule` | `webapp/src/data/approvalMatrix.ts` | chưa có domainCode |
| Exception Policy | `webapp/src/data/exceptionPolicy.ts` | chưa có domainCode |

**Cách làm (mirror kỷ luật parity-gate của D11):**
- Thêm `domainCode: string` optional-với-default `'KHCN'` vào 6 type trên + seed data.
- Mọi resolver (`resolveApprovers`, `resolveActionAvailability`, `resolveExceptionPolicy`,
  `getEffectiveDataScopes`...) lọc thêm theo `domainCode` **nhưng** vì hiện chỉ có 1 domain
  thật, hành vi phải **y hệt trước** — verify bằng harness parity giống D11/EPIC06 (chạy lại
  input cũ, so kết quả cũ vs mới, 0 mismatch).
- KHÔNG thêm UI chọn domain ở đâu cả (chỉ 1 domain thật, chọn domain trên UI sẽ là giả vờ có
  tính năng chưa tồn tại).
- KHÔNG đổi `webapp/src/data/rbac.ts` role code 26 role (D9 khoá, đặc thù KHCN, đúng như tài
  liệu xác nhận ở bảng "liabilities").

**Rủi ro:** gần như 0 — thêm field optional, seed default, có parity gate. Đây là bảo hiểm rẻ
tiền: nếu platform hoá không bao giờ được chốt, field này vô hại (luôn `'KHCN'`); nếu được chốt,
tiết kiệm một đợt migrate schema sau này.

**Không làm trong Phase 1:** không đổi `App.tsx` navigation, không đổi tên bất kỳ phân hệ nào.

---

## Phase 2 (TÙY CHỌN) — Khung hiển thị "vai trò Connector" trên `/tich-hop`

Tài liệu mục 4.1 gọi đây là "Connector Worker contract" — nhưng nhìn lại code, **khái niệm này
đã tồn tại một phần**: `IntegrationSystem` (`camundaOps.ts:216`) + Mapping Studio
(`integrationMapping.ts`) đã model SAP/QLNS/MS/QLTS/PLM như hệ ngoài kết nối qua
endpoint/API key + field mapping có kiểm soát (transform enum đóng, validate-before-Active).

Việc **có thể** làm thêm (thuần trình bày, không đổi hành vi):
- Trong `SystemDetailDrawer` (Đợt 1 Slice C), thêm 1 dòng mô tả vai trò: hệ này tham gia platform
  như **data/service endpoint** (không sở hữu quy trình cross-system) — đúng mục 3.2 "không thay
  thế workflow nội bộ vendor".
- Đây là ghi chú/label, **không** thêm cơ chế Zeebe job worker/mTLS thật (đó là việc backend,
  chờ F1 + đặc tả kỹ thuật riêng theo mục 8 của tài liệu gốc).

**Rủi ro:** thấp nhưng dễ bị hiểu nhầm là "đã có Connector Worker thật" nếu không ghi rõ đây chỉ
là khung khái niệm cho mục đích trình bày/thảo luận sign-off với khách. Nên gắn nhãn rõ kiểu
"(khái niệm — chờ đặc tả kỹ thuật)" nếu làm.

---

## Phase 3 (TÙY CHỌN, ưu tiên thấp nhất) — Trang tổng quan khái niệm platform

Một trang/panel mới (vd trong Action Studio hoặc trang riêng) trình bày sơ đồ khái niệm:
platform lõi (Camunda + Config Service + Action/Approval/Exception engine) ở giữa, domain NVKHCN
là module đầu tiên cắm vào, domain khác (SAP/QLNS/PLM...) là placeholder "sắp có" — dùng để hỗ
trợ buổi thảo luận sign-off với khách/kiến trúc sư (mục 8 của tài liệu gốc: cần sign-off trước
khi chính thức hoá).

**Rủi ro:** đây là nội dung có tính "cam kết roadmap" nhiều nhất trong 3 phase — nên chỉ làm nếu
user xác nhận mục đích là tài liệu/slide hỗ trợ họp sign-off, không phải tính năng sản phẩm.

---

## Việc KHÔNG làm ở bất kỳ phase nào (chờ sign-off theo mục 8 tài liệu gốc)

- Không sửa `docs/req/scope-2-phanhe.md`.
- Không ghi bất kỳ mục nào vào `.harness/state/decisions.md`.
- Không đổi tên nav "Quản trị quy trình" (đã đúng tên platform một cách tình cờ, không cần đổi).
- Không thiết kế Connector Worker contract thật (Zeebe job worker/mTLS) — đó là việc kỹ thuật
  riêng sau sign-off.

---

## Đề xuất thứ tự

1. **Phase 1** trước — rẻ, không hối tiếc, đúng khuyến nghị của chính tài liệu.
2. Phase 2/3 chỉ làm nếu user xác nhận mục đích cụ thể (demo nội bộ để trình sign-off, hay chỉ
   là dọn dữ liệu). Không tự ý mở rộng.

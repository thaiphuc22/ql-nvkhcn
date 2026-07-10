# Đánh giá mở rộng phạm vi: "Quản trị Quy trình" — nền tảng BPM cấp tập đoàn

> **Ngày:** 2026-07-10 · **Hình thức:** đánh giá/brainstorm kiến trúc (BA/PM + Solution Architect),
> **chưa phải quyết định chính thức** — không có mục nào trong tài liệu này được ghi vào
> `.harness/state/decisions.md` cho tới khi có sign-off khách hàng/kiến trúc sư.
> **Tên platform đã chốt:** **"Quản trị Quy trình"** (thay cho tên tạm "BPM Platform VHT" dùng
> trong lúc thảo luận).

---

## 1. Bối cảnh / vấn đề đặt ra

VHT có nhiều hệ thống/phân hệ nghiệp vụ khác ngoài KHCN — SAP, QLNS, PLM, v.v. — mỗi hệ thống
có quy trình nghiệp vụ riêng. Câu hỏi đặt ra: **Phân hệ Quản lý Quy trình** (hiện được định
nghĩa trong `docs/req/scope-2-phanhe.md` mục P1 là engine Camunda 8 dùng chung **cho mọi luồng
RD01–RD10 của riêng Phân hệ NVKHCN**) có nên mở rộng thêm một bậc, trở thành **nền tảng quản
trị quy trình dùng chung cho toàn VHT** — nơi các hệ thống khác cũng "cắm" quy trình của họ vào
vận hành, thay vì NVKHCN là lý do duy nhất engine tồn tại?

Đây là thay đổi phạm vi đáng kể so với cách đóng khung ban đầu của dự án QTKHCN
(`docs/req/scope-2-phanhe.md`, `.harness/state/decisions.md`), nên cần đánh giá kỹ trước khi
chốt.

---

## 2. Bức tranh hiện tại (as-is) — vì sao câu hỏi này khả thi

Rà lại các quyết định đã LOCKED (`decisions.md`) và brainstorm sẵn có
(`docs/research/SUMMARY.md`), phát hiện quan trọng: **kiến trúc hiện tại của NVKHCN không hề
gắn cứng vào KHCN như tưởng ban đầu** — phần lõi engine đã được thiết kế domain-agnostic một
cách vô tình (hoặc có chủ đích từ đầu):

### Tài sản tái dùng được (điểm mạnh)

| Quyết định | Vì sao tái dùng được cho platform đa domain |
|---|---|
| **D3** — Camunda chỉ giữ correlation/control data, business data ở DB riêng của app | Điều kiện tiên quyết cho multi-tenant: mỗi domain tự giữ data riêng, Camunda chỉ giữ dữ liệu điều phối chung |
| **D2** — Custom UI gọi thẳng Camunda API, không dùng Tasklist mặc định | Pattern "domain FE module tự vẽ UI, tự gọi API platform" lặp lại được cho domain khác |
| **D10** — Action Registry (STANDARD/SUPPORT/EXCEPTION, action theo outcome) | Shape generic, không hardcode theo RD — namespace theo domain là đủ, không cần thiết kế lại |
| **D12** — form-js schema làm data contract cho eForm | Generic, không phụ thuộc nghiệp vụ KHCN |
| Approval Matrix (`resolveApprovers`, dynamic AND/OR condition engine) | Generic policy engine, tách khỏi RD ngay từ thiết kế refactor 2026-07-08 |
| Exception Policy Engine | Generic — điều kiện/role/evidence đều cấu hình được, không hardcode theo domain |
| `docs/research/configuration-service.md` | Tự đề xuất Configuration Service nên là **"Workflow Platform Configuration Center"** tái dùng ngoài QTKHCN (đầu tư, mua sắm, ISO, CAPEX...) — ý tưởng platform hoá đã được brainstorm từ trước, chỉ chưa ai quyết |
| `docs/research/SUMMARY.md` mục 2 (Integration Layer) | Đã phác thảo Event Bus / Connector Workers / Outbox-Inbox cho QLNS, MS, SAP, QLTS, PLM — đúng pattern cần cho domain khác "cắm" vào platform |

### Điểm gắn cứng vào KHCN (liabilities cần tách nếu platform hoá)

| Quyết định | Vấn đề |
|---|---|
| **D9** — 26 role code (PM, CQ_KHCN, HĐKHCN, TGĐ_VHT...) | Từ vựng riêng KHCN — domain khác sẽ có vai trò hoàn toàn khác |
| **D8** — `NhiemVu`/`HoSo` | Mô hình dữ liệu đặc thù "đề tài" — domain khác không có khái niệm này |
| `App.tsx` — routing/sider theo PH1 (NVKHCN)/PH2 (quản trị)/PH3 (danh mục chung) | Chưa có chỗ cho "domain nghiệp vụ khác" trong navigation |
| Toàn bộ UI copy | Tiếng Việt đặc thù ngôn ngữ nghiệp vụ KHCN |

**Kết luận as-is:** phần **engine/policy layer** (Camunda + Action/Approval/Exception/Config)
đã đủ generic để platform hoá với chi phí vừa phải; phần **domain layer** (RBAC 26 role,
NhiemVu/HoSo, UI) là đặc thù KHCN và nên tiếp tục là vậy — đó chính là "domain module" đầu
tiên trên nền platform, không phải thứ cần generalize.

---

## 3. Định hướng đã thống nhất qua thảo luận (2026-07-10)

Năm điểm dưới đây là **kết quả thảo luận BA/PM + Solution Architect hôm nay**, chưa lock:

### 3.1 Tenant model
Một **platform lõi dùng chung** — Camunda 8 + Configuration Service + Action/Approval/Exception
engine — mỗi domain nghiệp vụ (NVKHCN, và sau này domain khác) có **FE module riêng**, không
dùng chung 1 UI cho mọi domain (nhất quán với D2 — UI phải đặc thù hoá theo nghiệp vụ).

### 3.2 Phạm vi sở hữu quy trình
**"Quản trị Quy trình" chỉ sở hữu quy trình cross-system hoặc quy trình nghiệp vụ VHT tự định
nghĩa** (không có engine sẵn) — **không thay thế** workflow nội bộ thuần giao dịch có sẵn của
các hệ thống vendor (SAP, QLNS, PLM...). Các hệ thống đó tham gia platform với vai trò
**data/service endpoint qua Connector Worker** (đọc/ghi dữ liệu, nhận lệnh từ Service Task) —
đúng pattern Integration Layer đã brainstorm sẵn, giờ nâng thành interface chính thức của
platform thay vì tính năng riêng của KHCN (như RD06 ↔ SAP hiện tại).

> Phương án loại trừ: **không** rút toàn bộ workflow nội bộ của SAP/PLM (kể cả các luồng thuần
> giao dịch nội bộ hệ thống đó) ra khỏi engine gốc của họ để model lại trên Camunda 8 — quy mô
> di dời đó lớn tới mức toàn tập đoàn, đụng chính sách vendor, rủi ro kỹ thuật/chính trị rất
> cao, và không cần thiết cho mục tiêu đặt ra.

### 3.3 Configuration Service — multi-domain ngay từ schema
EPIC01–16 (hiện outline-level, `docs/research/configuration-service.md`) sẽ được chốt theo
hướng multi-domain **ngay từ đầu**, cụ thể: thêm trường `domainCode` vào
`RolePermissionPolicy`/`UserRoleAssignment` (D9/D11), Action Registry + Action Availability
Policy (D10), Approval Matrix (rule + variable registry), Exception Policy — dù hiện tại chỉ
có 1 domain thật (KHCN). Chi phí thêm nhỏ (1 cột định danh domain), tránh đại tu schema khi mở
domain thứ 2.

### 3.4 Deployment model
**Self-Managed** (khách hàng xác nhận) — giải quyết 1/3 open decision đang chặn F1 trong
`decisions.md` (xem mục 5 dưới).

### 3.5 Mức cô lập giữa các domain
**Một cluster Camunda dùng chung, cô lập ở tầng logic** — namespace/tenant field
(`domainCode`) trong dữ liệu + network policy ở tầng ứng dụng, **không** tách cluster/namespace
K8s vật lý riêng theo domain. Hợp lý vì (theo 3.2) domain khác không giữ dữ liệu nhạy cảm gốc
trên platform — chỉ tham chiếu qua Connector Worker, nên rủi ro thấp hơn kịch bản platform tự
lưu business data của mọi hệ thống.

### 3.6 NFR bảo mật
**Bảo mật cực kỳ cao** là yêu cầu khách hàng, áp dụng xuyên suốt toàn platform (không riêng
NVKHCN) — cần đưa vào tiêu chí chọn backend/DB engine (mục còn mở của F1) và vào thiết kế
SSO/IAM (`OQ-021`, vẫn mở).

---

## 4. Việc mới phát sinh — cần làm rõ tiếp trước khi lock

Các mục dưới đây **không chặn cứng** việc tiếp tục đánh giá, nhưng nên xử lý sớm vì ảnh hưởng
thiết kế:

1. **Hợp đồng "Connector Worker"** — cần đặc tả domain khác (SAP/QLNS/PLM) phải cung cấp gì để
   "cắm" vào platform: Zeebe job worker pattern, cơ chế auth (service account/mTLS), data
   contract (input/output theo từng Service Task). Đây là nâng cấp chính thức của "Integration
   Service" đã phác thảo brainstorm (`docs/research/SUMMARY.md` mục 2) — không phải tính năng
   mới hoàn toàn, nhưng cần chuẩn hoá thành interface của platform.
2. **SSO/IAM (`OQ-021` vẫn mở) quan trọng hơn hẳn trong mô hình đa domain**: token/candidateGroup
   phải mang theo `domainCode` để việc "cô lập logic" (mục 3.5) thực sự cô lập được *quyền truy
   cập*, không chỉ cô lập *dữ liệu*. Nếu không, một domain có thể vô tình nhìn thấy/tác động
   task của domain khác trên cùng cluster.
3. **Đặt tên/khung tài liệu**: "Phân hệ Quản lý Quy trình" trong `scope-2-phanhe.md` giờ tương
   ứng với platform **"Quản trị Quy trình"** — tài liệu scope hiện tại (P1–P10) viết cho ngữ
   cảnh "dùng chung cho RD01–RD10", cần rà soát lại câu chữ để phản ánh đúng phạm vi mới (dùng
   chung cho *nhiều domain*, RD01–RD10 chỉ là tập quy trình của domain NVKHCN) khi mục này được
   chính thức hoá.
4. **Domain thứ 2 để validate mô hình** — nên chọn 1 flow cross-system đơn giản (ví dụ một quy
   trình phối hợp giữa NVKHCN và 1 hệ thống khác, không phải toàn bộ nghiệp vụ PLM/SAP) để kiểm
   chứng Connector Worker + namespace cô lập logic hoạt động đúng, **trước khi** cam kết với
   khách đây là nền tảng chung cấp tập đoàn.

---

## 5. Ảnh hưởng tới trạng thái harness hiện tại

- **F1 (Project Scaffold)** — `decisions.md` mục "Open decisions blocking Foundation 1" liệt 4
  câu hỏi mở. Thảo luận hôm nay trả lời được **Camunda deployment model = Self-Managed** (1/4).
  Còn mở: backend language/framework, domain database engine, SSO/IAM protocol — cả 3 giờ có
  thêm tiêu chí lọc là "bảo mật cực kỳ cao" + (SSO/IAM) yêu cầu domain-scoped token cho mô hình
  đa domain.
- **`scope-2-phanhe.md`** — mục 1 (Phân hệ Quản lý Quy trình, P1–P10) sẽ cần một phiên bản mở
  rộng nếu hướng này được chốt chính thức — xem mục 4.3.
- **Chưa có mục nào ở đây được ghi vào `decisions.md`.** Đây là thay đổi phạm vi hợp đồng/dự
  án, cần sign-off khách hàng + kiến trúc sư trước khi coi là quyết định khoá (đúng tinh thần
  "human approval gate" của harness, xem `.harness/workflows/foundations.md`).

---

## 6. Rủi ro nếu triển khai vội

- Backend của QTKHCN hiện **chưa có dòng code nào** (F1 blocked); RBAC 26-role + NhiemVu/HoSo
  đã code sẵn ở FE mock. Nếu mở luôn multi-domain trước khi NVKHCN chạy thật với backend thật,
  rủi ro xây một nền tảng lý thuyết chưa ai dùng, hoặc phải đại tu RBAC/data model sau khi hiểu
  domain thứ 2 thực sự cần gì.
- Domain vendor (SAP đặc biệt) thường có ràng buộc hợp đồng/license về nơi workflow được thực
  thi — mục 3.2 đã chủ động loại trừ kịch bản rủi ro cao (thay thế engine nội bộ), nhưng cần
  xác nhận lại với khách/kiến trúc sư khi làm việc trực tiếp với đội SAP/PLM.

---

## 7. Đề xuất lộ trình (two-track, không làm đồng thời)

1. **Trước mắt**: hoàn thành F1–F5 cho NVKHCN như domain hoàn chỉnh đầu tiên trên Camunda 8
   thật, nhưng thiết kế Configuration Service với `domainCode` ngay từ bây giờ (mục 3.3) — "thiết
   kế cho platform, giao hàng cho 1 domain".
2. **Sau khi NVKHCN chạy thật** (F1–F5 xong, ít nhất RD01/RD02 chạy với Camunda thật) → mở domain
   thứ 2 (một flow cross-system đơn giản, mục 4.4) để validate platform đa domain thật sự hoạt
   động, trước khi cam kết với khách đây là nền tảng "Quản trị Quy trình" cấp tập đoàn.

---

## 8. Việc cần làm để chính thức hoá (nếu hướng này được chốt)

- [ ] Sign-off khách hàng + Solution Architect trên 5 điểm ở mục 3.
- [ ] Cập nhật `scope-2-phanhe.md` mục 1 (Phân hệ Quản lý Quy trình) phản ánh phạm vi "Quản trị
      Quy trình" đa domain.
- [ ] Ghi quyết định vào `decisions.md` (deployment model Self-Managed + tenant/cô lập model +
      multi-domain schema) — chỉ sau khi có sign-off, không tự chốt từ tài liệu brainstorm này.
- [ ] Đặc tả "Connector Worker contract" (mục 4.1) thành tài liệu kỹ thuật riêng.
- [ ] Xác nhận domain thứ 2 để pilot (mục 4.4).

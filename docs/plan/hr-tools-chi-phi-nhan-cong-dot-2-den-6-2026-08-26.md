# HR Tools — Kế hoạch các đợt còn lại (đợt 2 → 6)

> 🚫 **ĐÃ NGỪNG SỬ DỤNG — KHÔNG THI CÔNG THEO FILE NÀY.** Toàn bộ nội dung còn hiệu lực đã được
> chuyển vào [`hr-tools-ke-hoach-thi-cong-2026-08-26.md`](hr-tools-ke-hoach-thi-cong-2026-08-26.md)
> (VOffice → §6.8, trạng thái kỳ → §6.1, kho mẫu thông báo + nợ kỹ thuật → §9.2, model thông báo → §9.3,
> khuôn API → §10.2). Phần còn lại đã sai so với bộ tài liệu nghiệp vụ khách gửi ở `docs/hr_tool/` —
> đặc biệt **công thức CPNC ở mục 1 là SAI** (xem §4.2 của bản hợp nhất). Giữ lại làm hồ sơ lịch sử.

> Lập 2026-08-26. Nối tiếp [`hr-tools-chi-phi-nhan-cong-dot-1-2026-08-26.md`](hr-tools-chi-phi-nhan-cong-dot-1-2026-08-26.md)
> (khung phân hệ + Đề tài + Nhân sự). Trạng thái: **CHỜ DUYỆT** — đợt 2–6 chưa code dòng nào.
> Cập nhật 2026-08-26: 2 quyết định đã chốt, xem mục 7.

## 0. Bản đồ đợt

| Đợt | Nội dung | Phụ thuộc | Vì sao xếp ở đây |
|---|---|---|---|
| 1 | Khung phân hệ + Đề tài + Nhân sự | — | Chốt pattern UI + 2 trục dữ liệu gốc |
| **2** | **Bảng công** + adapter VOffice | Đợt 1 | Nguồn *số công*; VOffice dựng ở đây để đợt 3 dùng lại |
| **3** | **Bảng lương** + phân quyền dữ liệu nhạy cảm | Đợt 2 (dùng lại khung kỳ/xác nhận/trình ký) | Nguồn *đơn giá* |
| **4** | **Báo cáo thống kê CPNC/PBNC** | Đợt 2 + 3 | Không có công và đơn giá thì không có số để báo cáo |
| **5** | **Thông báo** | Độc lập | Có thể kéo lên sớm nếu khách cần demo trước |
| **6** | **Backend thật** (thay mock store) | Đợt 1–5 chốt nghiệp vụ | Đổi model sau khi đã có DB là đắt nhất |

Đợt 5 là đợt duy nhất không phụ thuộc gì. Nếu lịch demo với khách cần "thấy đủ 7 nhóm chức năng",
kéo đợt 5 lên trước đợt 4 là lựa chọn rẻ nhất.

---

## 1. ✅ Công thức CPNC — ĐÃ CHỐT: **phương án A**

> **Chốt ngày 2026-08-26, người dùng quyết trực tiếp.** CPNC tính **từ công thực tế** (bottom-up).
> Hệ quả ràng buộc cho mọi đợt sau: **dòng bảng công BẮT BUỘC có cột đề tài**, và `tyLePhanBo`
> ở đợt 1 mang nghĩa **hạn mức kế hoạch để đối chiếu**, không phải đầu vào tính tiền.

Bảng so sánh dưới đây giữ lại làm hồ sơ quyết định — để sau này ai hỏi "vì sao bảng công lại phải
chấm theo đề tài" thì có câu trả lời, không phải suy luận lại từ đầu.

CPNC của một đề tài được tính theo cách nào?

| | Phương án A — tính từ công thực tế (bottom-up) | Phương án B — phân bổ theo tỷ lệ (top-down) |
|---|---|---|
| Đầu vào | Bảng công ghi **người × đề tài × kỳ × số công** | Bảng công chỉ ghi **người × kỳ**; tỷ lệ PBNC khai ở hồ sơ nhân sự |
| Công thức | `CPNC(đề tài) = Σ (số công của người cho đề tài × đơn giá người đó)` | `CPNC(đề tài) = Σ (tổng chi phí người trong kỳ × %PBNC cho đề tài)` |
| `tyLePhanBo` ở đợt 1 | Là **kế hoạch**, dùng để đối chiếu với thực tế | Là **đầu vào tính tiền** |
| Bảng công phải có cột đề tài | **Có** — đây là điểm khác biệt lớn nhất | Không |
| Ưu | Số liệu đúng thực tế, truy vết được tới từng dòng công | Nhập liệu nhẹ, không cần chấm công theo đề tài |
| Nhược | Người nhập phải bổ đề tài cho từng ngày công | Không phản ánh biến động thực tế; dễ bị chất vấn khi quyết toán |

**Lý do chọn A:** khách đã yêu cầu riêng một báo cáo *"theo dõi nguồn CPNC
của các nhiệm vụ"* và *"danh sách nhiệm vụ sắp hết nguồn"* — hai thứ này đòi số thực chi theo thời
gian, phương án B chỉ cho ra con số kế hoạch chia đều nên không cảnh báo được gì có ý nghĩa. Phương án
A cũng giữ được `tyLePhanBo` của đợt 1 làm **hạn mức kế hoạch** để đối chiếu lệch — chính là giá trị
quản trị mà phân hệ này tồn tại để tạo ra.

**Việc phải làm kèm theo quyết định này** (không làm thì phương án A chỉ nằm trên giấy):

1. **Đợt 1 — đổi nhãn, không đổi cấu trúc.** Nhãn `tyLePhanBo` trên UI phải nói rõ là *kế hoạch*
   (ví dụ "Tỷ lệ phân bổ kế hoạch (%)"), kèm tooltip giải thích chi phí thực tính từ bảng công.
   Để nhãn trống như hiện tại thì người dùng sẽ hiểu đây là con số quyết định tiền.
2. **Đợt 2 — `DongBangCong.deTaiId` là trường bắt buộc**, không nullable, có validate khi import.
3. **Đợt 4 — báo cáo phải có cột lệch kế hoạch vs thực tế.** Đây chính là thứ phương án A mua được
   mà phương án B không có; bỏ cột này thì chọn A hoá vô nghĩa.

---

## 2. Đợt 2 — Quản lý bảng công

Chức năng khách yêu cầu: xem danh sách · bộ lọc · import · xem chi tiết · sửa · xác nhận · xuất excel
theo biểu mẫu · trình ký VOffice · in báo cáo theo biểu mẫu.

### 2.1 Khái niệm kỳ — nền của cả đợt 2, 3, 4

Chưa có khái niệm **kỳ** nào trong repo. Phải dựng ở đợt này vì cả bảng công, bảng lương và báo cáo
đều khoá theo nó.

- `Ky`: `maKy` (`2026-07`), `loai` (`THANG` | `QUY`), `tuNgay`/`denNgay`, `soNgayCongChuan`,
  `trangThai` (`MO` | `DANG_CHOT` | `DA_KHOA`).
- **Đã khoá thì không sửa được** bảng công/bảng lương của kỳ đó. Muốn sửa phải **mở kỳ**, và thao tác
  mở kỳ ghi audit kèm lý do. Không làm điều này thì số báo cáo đợt 4 đổi sau lưng người đã ký.

### 2.2 Model

- `BangCong`: `id`, `kyId`, `donVi`, `trangThai`, `nguoiLap`, `ngayLap`, `soNhanSu`, `tongCong`,
  `soVanBanVOffice?`, `lichSu[]`.
- `DongBangCong`: `bangCongId`, `nhanSuId`, `maNhanVien`, `hoTen`, **`deTaiId`** (theo phương án A),
  `ngay` hoặc `tuanThu`, `soCong`, `loaiCong` (`THUONG` | `NGOAI_GIO` | `NGHI_PHEP` | `NGHI_LE` |
  `CONG_TAC`), `ghiChu`.

Vòng đời: `NHAP → CHO_XAC_NHAN → DA_XAC_NHAN → DA_TRINH_KY → DA_KY` (nhánh phụ `TU_CHOI` quay về `NHAP`).

### 2.3 Import bảng công — nơi dễ ra số sai nhất

Đây là chỗ dữ liệu bẩn lọt vào hệ thống, nên validate phải chặt và **hiển thị được**, không chặn im lặng:

| Luật | Vì sao |
|---|---|
| Người không thuộc đề tài trong kỳ | Chấm công cho đề tài mà người đó không tham gia ⇒ CPNC gán sai đề tài |
| Đề tài không ở trạng thái `HIEU_LUC` trong kỳ | Ghi chi phí vào đề tài đã đóng/tạm dừng |
| Tổng công một người trong ngày > 1 công (trừ dòng `NGOAI_GIO`) | Một người không làm 2 chỗ toàn thời gian cùng lúc |
| Tổng công một người trong kỳ > `soNgayCongChuan` + OT | Vượt trần kỳ |
| Trùng (người × đề tài × ngày) | Nhân đôi chi phí |
| **Lệch với `tyLePhanBo` kế hoạch quá ngưỡng** | Cảnh báo (không chặn) — đây là giá trị quản trị chính |

**Lưu ý đối chiếu với code đợt 1 thực tế:** kế hoạch đợt 1 dự kiến một component dùng chung
`shared/hr/import-preview/`, nhưng bản đã code đặt phần preview **nằm thẳng trong `pages/hr-nhan-su-list`**
(chỉ tách ra `core/utils/upload-file.ts` cho việc lấy `File` từ `nz-upload`). ⇒ Việc đầu tiên của đợt 2
là **tách preview import ra component dùng chung** rồi mới cho bảng công dùng lại — chép sang màn thứ hai
là có hai bộ luật validate sống song song, sửa một bên quên bên kia.

Component sau khi tách cần thêm cột "Cảnh báo" phân biệt **lỗi chặn** và **cảnh báo cho qua**.

### 2.4 Trình ký VOffice — dựng đúng chỗ

VOffice **chưa tồn tại** ở bất kỳ đâu trong repo (đã kiểm tra toàn bộ mã nguồn). Nhưng module Tích hợp
đã có sẵn: `core/models/integration-system.ts` (`IntegrationSystem` với `key`/`kieu`/`syncMode`/
`trangThai`/`endpoint`), service gọi `GET /api/integration-systems`, và màn `/tich-hop`.

⇒ **VOffice đăng ký như một `IntegrationSystem` key `voffice`, kiểu `connector`**, hiện ở màn Tích hợp
chung. HR Tools chỉ gọi adapter, **không dựng màn cấu hình tích hợp riêng**. Làm khác đi là tạo nguồn
cấu hình tích hợp thứ hai — đúng loại lỗi mà `DELIVERY_STATE.md` đã phải dọn nhiều lần (bản sao thứ 5,
thứ 6 của tập mã nút).

- `core/services/hr/voffice.service.ts` — mock adapter: `trinhKy(loaiTaiLieu, id)` trả
  `{ soVanBan, ngayTrinh, trangThai }` sau độ trễ giả lập; có nhánh trả lỗi để test UI thất bại.
- Trạng thái ký hiển thị trên cả bảng công lẫn bảng lương ⇒ đặt ở `shared/hr/trinh-ky-voffice/`
  (nút + modal xác nhận + thẻ trạng thái), dùng chung đợt 2 và 3.

### 2.5 Màn hình

| Route | Nội dung |
|---|---|
| `/hr/bang-cong` | Danh sách bảng công theo kỳ/đơn vị/trạng thái; nút Import, Xuất, In |
| `/hr/bang-cong/:id` | Chi tiết: thông tin kỳ + bảng dòng công (nhóm theo người, cột theo ngày) + nút Xác nhận / Trình ký |

Khuôn: danh sách theo mẫu DMDC; chi tiết theo mẫu *Thêm mới hội đồng* (trang đầy đủ + bảng con), dùng
lại `page-card`, `table-footer`, `advanced-search`, `export-bieu-mau`, `bieu-mau-print` của đợt 1.

---

## 3. Đợt 3 — Quản lý bảng lương

Chức năng: xem danh sách · lọc · xem chi tiết · thêm mới · sửa · import · xác nhận · xuất excel · trình
ký VOffice · in báo cáo.

Cấu trúc gần như song sinh với đợt 2 nên phần lớn là **dùng lại**, không viết mới: kỳ, vòng đời trạng
thái, import-preview, trình ký VOffice, xuất/in biểu mẫu.

### 3.1 Model

- `BangLuong`: `kyId`, `donVi`, `trangThai`, `nguoiLap`, `ngayLap`, `soNhanSu`, `tongChiPhi`,
  `soVanBanVOffice?`, `lichSu[]`.
- `DongBangLuong`: `nhanSuId`, `luongCoBan`, `phuCap`, `bhxhVaKhac`, `tongChiPhi`, **`donGiaCong`**
  (= `tongChiPhi / soCongChuan` của kỳ) — đây là **cầu nối duy nhất sang CPNC**, nên tính một chỗ và
  phơi ra, đừng để mỗi báo cáo tự tính lại.

### 3.2 Phân quyền dữ liệu nhạy cảm — bắt buộc, không để đợt sau

Lương là dữ liệu nhạy cảm; bảng khảo sát NFR của khách nêu thẳng yêu cầu *"phân quyền dữ liệu nhạy cảm
(tài chính, SHTT)"* và *"phân quyền theo khối / theo trung tâm"*.

- Dùng lại `core/services/data-scope.service.ts` (đã có) để giới hạn theo đơn vị, thay vì tự viết bộ lọc.
- Thêm mã quyền riêng cho bảng lương trong catalog quyền (`services/identity-service`), **không dùng
  chung mã với bảng công**. Lưu ý bẫy đã ghi trong bộ nhớ dự án: catalog quyền gate hành động thật —
  deactivate một mã là cắt quyền thật chứ không chỉ ẩn UI.
- Ở bản mock đợt 3: fail-closed — không có quyền thì **không thấy cột tiền**, chứ không phải thấy rồi
  bị chặn khi bấm.

---

## 4. Đợt 4 — Báo cáo thống kê

Chức năng: BC theo dõi nguồn CPNC của các nhiệm vụ · BC tỷ lệ PBNC của đơn vị trong năm · BC tổng hợp
theo khối/toàn đơn vị · lọc theo đơn vị/đề tài · danh sách nhiệm vụ sắp hết nguồn · xuất excel · in.

### 4.1 Một nơi tính, nhiều nơi đọc

Cả 4 báo cáo đều ăn cùng một tập số. Nếu mỗi màn tự tính thì bốn màn sẽ ra bốn con số khác nhau —
lỗi kinh điển của module báo cáo.

⇒ `core/services/hr/cpnc-aggregate.service.ts` là **nguồn tính duy nhất**: nhận (kỳ, đơn vị, đề tài) →
trả `{ nganSach, daChi, conLai, tyLeSuDung, chiTietTheoKy[] }`. Ở bản mock là `computed()` từ 3 store
(đề tài, bảng công, bảng lương); lên backend đợt 6 thì thay ruột bằng API, **giữ nguyên chữ ký hàm** để
các màn báo cáo không phải sửa.

### 4.2 Bốn báo cáo

| Báo cáo | Nội dung | Ghi chú |
|---|---|---|
| Nguồn CPNC theo nhiệm vụ | Bảng: đề tài/nhiệm vụ × (ngân sách, đã chi, còn lại, % dùng), thanh tiến độ | Cột "còn lại" tô theo ngưỡng |
| Tỷ lệ PBNC của đơn vị trong năm | Ma trận: người × đề tài × %, tổng theo người và theo đề tài | Tô đỏ ô tổng > 100% |
| Tổng hợp theo khối / toàn đơn vị | Nhóm theo cây đơn vị, cộng dồn lên khối | Dùng cây đơn vị của `OrganizationService` |
| Nhiệm vụ sắp hết nguồn | Lọc theo ngưỡng cảnh báo | **Ngưỡng là cấu hình, không hardcode** |

**Ngưỡng cảnh báo** (mặc định đề xuất: còn < 15% ngân sách **hoặc** dự kiến hết trước khi đề tài kết
thúc) phải nằm trong màn cấu hình để khách tự chỉnh. Hardcode 15% trong mã là thứ chắc chắn sẽ phải sửa
lại sau buổi nghiệm thu đầu tiên.

Biểu đồ: dùng lại `shared/simple-bar-chart/` đã có, **không thêm thư viện chart**. Nếu khách cần biểu
đồ phức tạp hơn (đường, tròn, stacked) thì đó là một quyết định thêm dependency riêng, không tự làm.

---

## 5. Đợt 5 — Thông báo

Chức năng: cài đặt kênh · cài đặt vai trò nhận · danh sách mẫu · tạo/sửa/xoá mẫu · danh sách đã gửi.

### 5.1 Kho mẫu thông báo — **HOÃN hợp nhất, ghi nợ kỹ thuật**

> **Quyết định 2026-08-26, người dùng chọn: để sau.** HR Tools cứ dựng kho mẫu **của riêng phân hệ**
> ở đợt 5; không đụng vào màn Tác vụ hệ thống của phân hệ Quy trình trong đợt này.

Bối cảnh vẫn cần ghi lại để không quên: service task `SEND_NOTIFICATION` đã có `templateCode`,
`channels: ['email','in_app','sms','zalo']`, `recipientExpression` (`core/models/service-task.ts:134`)
— nhưng **không có bảng catalog mẫu nào trong cả 39 migration**, `templateCode` hiện là **chuỗi gõ tay**.
Khi HR Tools dựng kho riêng, hệ thống sẽ có **hai nguồn mẫu thông báo song song** — chấp nhận có ý
thức, không phải sót.

**Để món nợ này trả được về sau, đợt 5 phải làm đúng 3 việc rẻ tiền sau:**

1. `MauThongBao.code` dùng **cùng quy ước đặt mã** với `templateCode` của service task (chữ thường,
   gạch ngang), để sau này hợp nhất là map thẳng, không phải ánh xạ thủ công từng dòng.
2. Dùng **đúng 4 kênh** `email | in_app | sms | zalo` đã khai ở `SendNotificationConfig`, không tự nghĩ
   thêm kênh mới ở HR Tools.
3. Ghi một dòng nợ kỹ thuật vào `.harness/state/decisions.md`: *"kho mẫu thông báo đang có 2 nguồn —
   HR Tools và `SEND_NOTIFICATION.templateCode`; hợp nhất khi có yêu cầu"*. Không ghi thì 6 tháng nữa
   không ai nhớ đây là lựa chọn có chủ ý.

### 5.2 Model

- `MauThongBao`: `code` (PK, dùng làm `templateCode`), `ten`, `kenh[]`, `tieuDe`, `noiDung` (có
  placeholder `{{...}}`), `bienKhaDung[]`, `trangThai`, `lichSu[]`.
- `CauHinhKenh`: bật/tắt từng kênh + tham số (SMTP/SMS gateway) — ở mock chỉ là form lưu vào store.
- `VaiTroNhanThongBao`: `sukien` × `vaiTroCodes[]` — dùng lại mã vai trò của `core/models/roles.ts`,
  **không tự định nghĩa danh sách vai trò mới**.
- `ThongBaoDaGui`: `mauCode`, `nguoiNhan`, `kenh`, `thoiDiem`, `trangThai` (`GUI_THANH_CONG`/`THAT_BAI`),
  `loi?`.

Màn "danh sách đã gửi" cần cột lý do lỗi — thông báo thất bại mà không nói vì sao thì không ai sửa được.

---

## 6. Đợt 6 — Backend thật

**Ghi chú về tài liệu:** `CLAUDE.md` hiện ghi *"Backend / DB / Camunda deployment model: chưa quyết"*,
nhưng thực tế repo **đã có backend chạy thật** — Spring Boot + Flyway tới `V39`, cộng
`services/identity-service` và `services/ho-so-service`. Mô tả trong `CLAUDE.md` đã lạc hậu và nên được
cập nhật, nếu không mọi phiên làm việc mới đều bắt đầu bằng một giả định sai.

Nội dung đợt 6:

1. Migration cho 8 bảng: `de_tai`, `nhan_su_de_tai`, `ky`, `bang_cong`, `dong_bang_cong`, `bang_luong`,
   `dong_bang_luong`, `mau_thong_bao` (+ `thong_bao_da_gui`).
2. API CRUD + import + duyệt + trình ký, kèm audit actor như `HoiDongService` đang làm
   (`X-QTKHCN-Actor`, `If-Match` cho optimistic locking).
3. Thay ruột các mock service — **giữ nguyên chữ ký public** để các trang không phải sửa. Đây là lý do
   đợt 1 quy định service mock phải phơi đúng bộ `list/get/create/update/remove/submit/approve/reject/
   importRows`.
4. Nối `de_tai` ↔ `nhiem_vu` thật (khoá ngoại + màn chi tiết đề tài liệt kê nhiệm vụ thật).
5. RBAC thật cho HR Tools thay entitlement demo phía client.
6. Adapter VOffice thật thay mock.

**Không đưa bảng công/bảng lương vào biến Camunda.** Quyết định D3 (dữ liệu nghiệp vụ nằm ở DB của app,
Camunda chỉ giữ biến điều khiển/tương quan) vẫn áp dụng nguyên vẹn. Nếu sau này luồng *xác nhận → trình
ký* cần chạy qua Camunda thì chỉ đẩy `maBangCong` + `kỳ` + `đơn vị`, không đẩy dòng công.

---

## 7. Những gì cần khách chốt, theo thứ tự cần gấp

### Đã chốt (2026-08-26)

| Câu hỏi | Kết luận |
|---|---|
| Công thức CPNC: A hay B? | **Phương án A** — tính từ công thực tế (mục 1) |
| Gộp kho mẫu thông báo với `SEND_NOTIFICATION`? | **Để sau** — HR Tools dựng kho riêng, ghi nợ kỹ thuật (mục 5.1) |

### Còn phải hỏi khách

| # | Câu hỏi | Chặn đợt |
|---|---|---|
| 1 | Kỳ theo tháng hay quý, hay cả hai? Ai được mở lại kỳ đã khoá? | 2 |
| 2 | Bảng công chấm theo ngày hay theo tuần/tổng kỳ? | 2 |
| 3 | **Mẫu biểu Excel/in: khách có file mẫu cứng không?** (hiện đang tự dựng theo bố cục chuẩn) | 2, 3, 4 |
| 4 | VOffice: có tài liệu API thật không, hay đợt này cứ mock? | 2 |
| 5 | Ai được xem cột tiền của bảng lương — theo đơn vị, theo khối, hay danh sách chỉ định? | 3 |
| 6 | Ngưỡng "sắp hết nguồn" tính thế nào? | 4 |

Câu 3 nên hỏi sớm nhất — nếu khách có file biểu mẫu cứng (thường là có, kèm chữ ký và quy định
trình bày), thì toàn bộ phần xuất Excel và in của đợt 2–4 phải dựng lại theo file đó.

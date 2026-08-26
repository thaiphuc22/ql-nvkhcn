# HR Tools — Hiệu chỉnh kế hoạch theo bộ tài liệu nghiệp vụ của khách

> 📌 **ĐÃ ĐƯỢC HỢP NHẤT.** Nội dung của file này đã nhập vào
> [`hr-tools-ke-hoach-thi-cong-2026-08-26.md`](hr-tools-ke-hoach-thi-cong-2026-08-26.md) — đó là bản
> đang hiệu lực để thi công. File này giữ lại vì nó là thứ duy nhất ghi **bảng lệch L1–L10** giữa hai
> plan dựng từ Figma và bộ tài liệu nghiệp vụ thật; hữu ích khi cần giải thích *vì sao* đổi, không
> phải để làm theo.

> Lập 2026-08-26. **Thay thế** phần nghiệp vụ của hai plan trước:
> [`đợt 1`](hr-tools-chi-phi-nhan-cong-dot-1-2026-08-26.md) và
> [`đợt 2→6`](hr-tools-chi-phi-nhan-cong-dot-2-den-6-2026-08-26.md).
> Trạng thái: **CHỜ DUYỆT.** Đợt 1 đã code xong theo bản cũ; đợt 2→6 chưa code dòng nào.

## 0. Vì sao có tài liệu này

Hai plan trước được dựng **từ 2 file Figma** — tức là từ *hình dạng màn hình*, không phải từ nghiệp
vụ. Ngày 2026-08-26 khách gửi bộ tài liệu nghiệp vụ thật ở [`docs/hr_tool/`](../hr_tool/):

| File | Là gì | Giá trị |
|---|---|---|
| `VHT_Phan tich bai toan Phan Bo Nhan Cong.docx` | BRD đầy đủ, mã dự án `GPDN.VHT.HRM` | Quy trình 8 bước, phạm vi 9 nhóm chức năng, phân quyền, giới hạn |
| `Phan Bo Nhan Cong Brd.docx` | **Trùng byte-for-byte** với file trên | Không có thông tin mới — bỏ qua |
| `2025.08.01_HR_tool_Khach hang gui.xlsx` | Đặc tả 4 tab màn hình + **BM0→BM5 kèm số liệu thật** | Nguồn chuẩn về màn hình, biểu mẫu, công thức, ma trận quyền |
| `Mo ta phan mem HR_23.06.2025.xlsx` | Bản mô tả cũ hơn (23/06) + log Q&A với khách | Ngữ cảnh vì sao chốt như vậy; cột dữ liệu HRM |
| `Book1.xlsx` | **Phân rã chức năng 5 module** + map Step→Dữ liệu→Master data | Nguồn chuẩn về phạm vi chức năng |
| `NS_Câu hỏi khảo sát nghiệp vụ hệ thống.docx` | Khảo sát phòng Nhân sự (ThuLH) | Hiện trạng: SAP + Excel thủ công; nút thắt = PA chấm công |

Bộ này **thắng Figma** ở mọi điểm nghiệp vụ (mô hình dữ liệu, công thức, trạng thái, quyền, ngưỡng
cảnh báo). Figma vẫn thắng ở mọi điểm hình thức (token, bố cục, khuôn màn). Hai vai trò đó không
xung đột nhau.

---

## 1. Bảng lệch — xếp theo mức thiệt hại nếu bỏ qua

| # | Vấn đề | Bản cũ | Tài liệu khách | Đợt bị chặn |
|---|---|---|---|---|
| L1 | **Thiếu thực thể `NoiDungCongViec`** | Không có | Trục chính: mỗi nhiệm vụ chia thành nhiều nội dung CV; **chấm công là gán ngày → nội dung CV**, không phải gán ngày → đề tài | 2, 3, 4 — chặn cứng |
| L2 | **Chiều phân cấp ngược** | `DeTai` là CHA của `NhiemVu` | BRD: *"Gốc quản trị là nhiệm vụ"*. BM5 chỉ có 1 tầng: dòng `PHÂN LOẠI = Chính` là nhiệm vụ, dòng `Thành phần` là nội dung CV | P1 trong `decisions.md` |
| L3 | **Công thức CPNC chưa có** | "phương án A, tính từ công thực tế" — đúng hướng nhưng chưa có công thức | BM3 có công thức chính xác: chia pro-rata **theo từng khoản mục lương** (13 khoản), mẫu số là *công tính lương của chính người đó* | 3, 4 |
| L4 | **`nguonKinhPhi` sai kiểu** | Danh sách chuỗi tự do ("Quỹ KHCN Tập đoàn"…) | **Phân nguồn** là enum có ràng buộc: `KHCN · SXKD · Bán hàng · Bảo hành · ĐTPT · Quản lý`; PAKD còn thêm tầng **Sản phẩm** | 1, 2 |
| L5 | **`tyLePhanBo` là khái niệm bịa** | Ràng buộc trung tâm của đợt 1 (tổng ≤ 100%) | Không tồn tại trong bất kỳ biểu mẫu nào. Ràng buộc thật là **1 ngày = 1 nội dung CV** | 1, 2 |
| L6 | **Không tách `ĐV chủ trì` / `ĐV phân bổ`** | Chỉ có `donViChuTri` | Hai đơn vị khác nhau — và chính sự khác nhau đó sinh ra bước *"PA/PM chủ trì xác nhận"* | 1, 2 |
| L7 | **Ngưỡng cảnh báo đề xuất sai** | "còn < 15% ngân sách" | Ba luật cụ thể (§8.1), không luật nào là 15% | 4, 5 |
| L8 | **Vai trò PA/PM chưa mô hình hoá** | Dùng vai trò hệ thống | Khách ghi thẳng: *"Quản lý danh sách vai trò PA, PM của nhiệm vụ (khác với chức danh/vị trí của HRM)"* | 1, 2 |
| L9 | **Biểu mẫu tưởng là tự dựng** | Câu hỏi mở #3: "khách có file mẫu cứng không?" | **Có** — BM.03.01, BM.04.01, BM.04.02, BM.06 kèm quốc hiệu và ô ký | 2, 3, 4 |
| L10 | **Đơn vị chỉ 1 cấp** | Chuỗi phẳng | Cây **5 cấp**; nghiệp vụ chạy ở cấp 4 (Khối) và cấp 5 (Trung tâm/Phòng) | 1, 4 |

---

## 2. Mô hình dữ liệu hiệu chỉnh

### 2.1 Quyết định phải chốt trước: chiều `DeTai` ↔ `NhiemVu` (L2)

`P1` trong [`decisions.md`](../../.harness/state/decisions.md) đang ghi *"`DeTai` là thực thể CHA nằm
trên `NhiemVu`"*, trạng thái ĐỀ XUẤT. Bộ tài liệu khách **mâu thuẫn trực tiếp** với nó.

Ba khả năng, theo thứ tự tôi khuyến nghị:

| | Phương án | Nội dung | Hệ quả |
|---|---|---|---|
| **①** | **`DeTai` ≡ nhiệm vụ ở tầng nghiệp vụ HR** — khuyến nghị | HR Tools quản một thực thể duy nhất, đúng như BM5. Nội dung CV là con của nó. Không có tầng cha nào | Sửa nhãn + bổ sung trường ở đợt 1; **không** phát sinh bảng mới. Khớp BRD 100% |
| ② | Giữ `DeTai` làm cha, `NoiDungCongViec` là con của `NhiemVu` | 3 tầng: `DeTai → NhiemVu → NoiDungCongViec` | Cần bằng chứng nghiệp vụ rằng một đề tài sinh nhiều `NhiemVu` — bộ tài liệu này **không có** ví dụ nào |
| ③ | Giữ nguyên bản cũ | `DeTai` cha, chấm công gắn thẳng vào `DeTai` | Không dựng được BM2.1/BM3.1 (cả hai gom theo nội dung CV). **Không khả thi** |

> ⚠ Đây là câu hỏi **chặn**, phải chốt trước khi bắt đầu đợt 2. Lý do: `NoiDungCongViec` trỏ vào đâu
> là quyết định một chiều — sai thì mọi truy vấn báo cáo ở đợt 4 phải viết lại.

Lưu ý riêng cho phương án ①: `NhiemVu` hiện có trong `services/ho-so-service` phục vụ luồng RD01–RD10
(chủ trương → nghiệm thu), **khác phạm vi** với nhiệm vụ của HR Tools (gồm cả SXKD, Bán hàng, Bảo
hành, ĐTPT). Chọn ① nghĩa là HR Tools dùng thực thể riêng cùng *hình dạng*; đến đợt 6 mới quyết gộp
bảng hay giữ hai bảng nối bằng khoá. Không gộp vội ở tầng mock.

### 2.2 Danh sách thực thể sau hiệu chỉnh

| Thực thể | Nguồn | Ghi chú |
|---|---|---|
| `NhiemVu` (HR) | BM5, sheet `1.NhapDeTai` | Đổi tên/bổ sung từ `DeTai` hiện có — xem §3.1 |
| **`NoiDungCongViec`** ★ | BM5 dòng `Thành phần`, BM2.1 cột *Nội dung* | **Mới.** Con của nhiệm vụ; có **ĐV phân bổ riêng** và CPNC phê duyệt riêng |
| **`SanPham`** ★ | BM2.2, `Book1` danh mục | **Mới.** Chỉ dùng cho nhiệm vụ PAKD; tầng gom trên nội dung CV |
| `NhanSuNhiemVu` | BM1 | Từ `NhanSuDeTai` — xem §3.2 |
| **`VaiTroNhiemVu`** ★ | Sheet `1.DS Nhân sự` dòng 41–43 | **Mới.** PM/PA theo nhiệm vụ, tách khỏi chức danh HRM |
| **`Ky`** ★ | BRD 4.7, BM3.2 | **Mới.** Kỳ lương ≠ kỳ trả (BM3.2: *"Kỳ lương 06/2025 - Kỳ trả 07/2025"*) |
| **`BangCongThangImport`** ★ | BM0 (1179 dòng thật) | **Mới.** Ma trận người × 31 ngày, ký hiệu `X:8`/`P:8`/`DL:8`. **Chỉ đọc** |
| **`BangLuongThangImport`** ★ | BM0 (2503 dòng thật) | **Mới.** ~26 cột chi phí. **Chỉ đọc** |
| **`PhanBoCong`** ★ | BM2.1 / BM2.2 | **Mới.** Dòng chấm: `(nhanSu, ngay) → noiDungCongViecId`. Bảng duy nhất PA/PM ghi |
| **`PhanBoChiPhi`** ★ | BM3 | **Mới.** Kết quả tính — sinh ra, không nhập tay |
| `DonVi` (5 cấp) | Sheet `List`, BM0 | Danh mục — cây, xem §2.3 |
| `KyHieuCong` | BM0 (`X`, `P`, `DL`…) | Danh mục mới |
| `NhomCongViec` | `Book1` sheet *Quy trình* | Danh mục mới — gom nội dung CV (Giải pháp/Phát triển/Kiểm thử…) |
| `ThuVienCongViec` | `Book1` module Danh mục | Nội dung CV mẫu, tái dùng khi lập nhiệm vụ |

★ = chưa tồn tại trong repo.

### 2.3 Cây đơn vị — 5 cấp (L10)

Đọc từ cột `Đơn vị cấp 1..5 (F)` của sheet `3.LuongMucTieu` và `BM0.Bang cong thang import`:

```
Cấp 1  Tập đoàn Công nghiệp - Viễn thông Quân đội        (148842)
Cấp 2  Công ty mẹ - Tập đoàn                             (9001803)
Cấp 3  Tổng công ty Công nghiệp Công nghệ cao Viettel    (9013878)
Cấp 4  Khối 1 / Khối 2 / Khối 3 / TT Kinh doanh / TT QLCL   ← "Khối", đơn vị báo cáo
Cấp 5  Trung tâm CHĐK, Phòng Tổng hợp, TT Camera, …        ← "Đơn vị", đơn vị chấm công
```

Toàn bộ nghiệp vụ chạy ở **cấp 4 và cấp 5**; cấp 1–3 chỉ để hiển thị. Sheet `List` liệt kê đủ 5 khối
và ~30 đơn vị cấp 5 — dùng làm seed, không bịa tên mới.

> ⚠ Mã đơn vị đi kèm chuỗi tên trong file import (`"Khối 1 - TCT CNC - 9013948"`) ⇒ parser phải tách
> theo dấu `-` **từ phải sang** để lấy mã, vì tên đơn vị chứa dấu gạch nối.

### 2.4 Phân nguồn và phân loại — hai enum khác nhau, đừng gộp (L4)

| Enum | Giá trị | Ảnh hưởng |
|---|---|---|
| `PhanLoaiNhiemVu` | `KHCN` · `PAKD` · `ĐTPT` · `QPAN` | Quyết định **layout màn chấm công** — 3 biến thể, xem §5.2 |
| `PhanNguon` | `KHCN` · `SXKD` · `Bán hàng` · `Bảo hành` · `ĐTPT` · `Quản lý` | Quyết định **CPNC tính vào nguồn nào** |

Ràng buộc riêng: **nguồn `Bảo hành` chỉ theo dõi số đã phân bổ**, không lập dự toán (sheet `2.Chấm
công` dòng 59) ⇒ cột "còn lại" phải để trống chứ không hiện `0`, vì `0` đọc thành *hết nguồn*.
Nguồn `Quản lý` không do người dùng chọn — hệ thống tự gán cho công thừa (§4.3).

`TinhTrangPhanBo`: `Đang trình phê duyệt` · `Đang phân bổ` · `Đã hết hạn` (sheet `1.NhapDeTai` cột H).

---

## 3. Hiệu chỉnh đợt 1 (đã code — đây là việc sửa, không phải việc mới)

Đợt 1 đã dựng xong: `layout/hr-shell/`, `shared/hr/` (7 component), `core/models/hr/`,
`core/services/hr/`, 5 trang `pages/hr-*`. **Toàn bộ phần khung, shell, component dùng chung, token
DS vẫn đúng và giữ nguyên.** Chỉ tầng model + form + nhãn cần sửa.

### 3.1 `core/models/hr/de-tai.ts`

| Việc | Chi tiết |
|---|---|
| **Bổ sung** `khoi` | Đơn vị cấp 4. Không suy ra từ `donViChuTri` bằng string matching |
| **Bổ sung** `donViPhanBo[]` | Danh sách đơn vị cấp 5 tham gia — khác `donViChuTri` (L6) |
| **Bổ sung** `phanLoai` | Enum `KHCN\|PAKD\|ĐTPT\|QPAN` — quyết định layout chấm công |
| **Bổ sung** `pmMaNhanVien`, `paMaNhanVien` | BM5 cột PM/PA lưu email; ở model dùng mã NV, hiển thị email (L8) |
| **Bổ sung** `chiPhiNhanCongPheDuyet` | **Khác** `tongDuToan`. BM5 có cả hai và chúng chênh nhau ~3× |
| **Bổ sung** `duPhong` | Sheet `3.Báo cáo` dòng 9: nguồn lập dự toán = CPNC phê duyệt **+ dự phòng** |
| **Bổ sung** `tinhTrangPhanBo` | 3 giá trị ở §2.4 — song song với `trangThai` bản khai hiện có |
| **Sửa** `namBatDau`/`namKetThuc` → `tuNgay`/`denNgay` | BM5 dùng ngày đầy đủ; nhiệm vụ bắt đầu 08/04/2025 mà lưu năm thì không khoá ô chấm công đúng được |
| **Sửa** `nguonKinhPhi: string` → `phanNguon: PhanNguon` | L4 |
| **Xoá** `linhVuc` | Không có trong bất kỳ biểu mẫu nào; là trường bịa từ Figma |
| **Đổi nhãn** `DeTai` → "Nhiệm vụ" trên UI | Theo phương án ①. Tên type giữ hay đổi là quyết định kèm §2.1 |

### 3.2 `core/models/hr/nhan-su.ts` — phần cần cân nhắc kỹ nhất

`tyLePhanBo` và cặp hàm `tinhTongPhanBo` / `nhanSuVuotPhanBo` là **trục trung tâm của đợt 1**, và
không có gì tương ứng trong tài liệu khách (L5). BM1 chỉ cần: `TT · MÃ NV · Họ và tên · Chức danh ·
Nội dung công việc tham gia · Thời gian tham gia · Ghi chú`.

Khuyến nghị: **hạ `tyLePhanBo` xuống optional**, đổi nhãn thành *"Tỷ lệ dự kiến (%) — tham khảo"*,
giữ nguyên code kiểm tra ≤ 100% (nó không sai, chỉ là không phải luật của khách), và **thêm ràng buộc
thật**:

- `noiDungCongViecIds: string[]` — BM1 bắt buộc; một người có thể tham gia nhiều nội dung CV.
- Ràng buộc chặn: **1 ngày = 1 nội dung CV** — nhưng ràng buộc này sống ở tầng `PhanBoCong` (đợt 2),
  không ở đây. Ghi chú chéo trong code để người đọc không đi tìm nhầm chỗ.

> Không xoá hẳn `tyLePhanBo`: khách chưa nói là *không* muốn, và cả màn `hr-nhan-su-form` lẫn
> `nhan-su.service.spec.ts` đang dựa vào nó. Hạ cấp rẻ và đảo ngược được; xoá thì không.

### 3.3 Thực thể mới cần thêm ngay ở đợt 1

Vì `NoiDungCongViec` là thứ đợt 2 ăn vào, và màn chi tiết nhiệm vụ phải khai nó:

- `core/models/hr/noi-dung-cong-viec.ts` — `id`, `nhiemVuId`, `ten`, `nhomCongViecId?`, `sanPhamId?`
  (PAKD), `donViPhanBo`, `phanNguon`, `chiPhiNhanCongPheDuyet`, `duPhong`, `tuNgay`, `denNgay`,
  `tinhTrangPhanBo`.
- `core/models/hr/vai-tro-nhiem-vu.ts` — `nhiemVuId`, `maNhanVien`, `vaiTro: 'PM'|'PA'`, `donVi`.
  Luật từ khách: *1 nhiệm vụ có 1 PM và 1 PA đơn vị chủ trì; mỗi đơn vị phân bổ có 1 PA*.
- Màn `hr-de-tai-detail` thêm **tab "Nội dung công việc"** (bảng CRUD + cột CPNC phê duyệt) và
  **tab "Vai trò PM/PA"**. Tab "Nhiệm vụ KHCN" đang để rỗng thì bỏ hoặc đổi công dụng theo §2.1.

### 3.4 Danh mục còn thiếu so với `Book1`

`Book1` liệt kê 6 danh mục, mỗi cái đủ `Danh sách · Chi tiết · CRUD · Import · Export`: **Đơn vị ·
Chức danh · Nhân viên · Nguồn kinh phí · Sản phẩm · Thư viện công việc**. Đợt 1 chưa có màn danh mục
nào. Đề xuất: gom thành **một đợt 1.5** ngắn (một trang danh mục có tab, dùng lại `page-card` +
`table-footer` + import preview) thay vì rải vào các đợt sau — vì đợt 2 cần *Ký hiệu công*, *Sản
phẩm*, *Nhóm công việc* mới chạy được.

---

## 4. Công thức CPNC — bản chính xác từ BM3 (L3)

Đây là phần thay thế mục 1 của plan đợt 2→6. Phương án A (bottom-up từ công thực tế) **vẫn đúng**;
dưới đây là công thức thật, đã đối chiếu với số liệu BM3.

### 4.1 Công thức

Với mỗi (nhân sự × nhiệm vụ × nội dung CV) trong một kỳ:

```
tyLe = congPhanBo / congTinhLuong          ← mẫu số là công tính lương CỦA CHÍNH NGƯỜI ĐÓ
CPNC_phanBo[khoanMuc] = CPNC_thang[khoanMuc] × tyLe      (áp cho TỪNG khoản, không phải tổng)
```

13 khoản mục (BM3 cột 17–31): `Lương tháng` · `Lương tháng (trừ BH cá nhân)` · `Truy thu/truy lĩnh` ·
`Lương SXKD` · `Lương thử việc, tập nghề` · `Lương kinh doanh thử việc` · `BHXH cá nhân` · `BHXH đơn
vị` · `BHYT cá nhân` · `BHYT đơn vị` · `BHTN cá nhân` · `BHTN đơn vị` · `KPCĐ` · `Các khoản ăn ca,
điện thoại, phụ cấp` → `CỘNG`.

**Kiểm chứng bằng số thật** (BM3 dòng 5, Lê Trần Sự, `congTinhLuong = 21`, `congPhanBo = 6`):

| Khoản | CPNC tháng | Kỳ vọng ×6/21 | BM3 ghi |
|---|---|---|---|
| Lương tháng | 113.316.438 | 32.376.125 | 32.376.125 ✓ |
| BHXH cá nhân | 1.503.216 | 429.490 | 429.490 ✓ |
| Ăn ca, điện thoại | 1.730.000 | 494.286 | 494.286 ✓ |

⇒ Pro-rata tuyến tính, làm tròn tới **đồng**. Không có hệ số nào khác.

### 4.2 Hệ quả với plan cũ

Plan đợt 3 cũ ghi `donGiaCong = tongChiPhi / soCongChuan` **của kỳ**. Sai hai chỗ: mẫu số là *công
tính lương của từng người* (BM0 cột cuối, khác nhau giữa người này với người kia trong cùng kỳ), và
CPNC không phải một con số tổng mà là **vector 13 khoản** — gộp lại thì BM3.1/BM3.2 không dựng được
vì hai biểu mẫu này in tách từng khoản.

### 4.3 Quy tắc công thừa — dễ bỏ sót nhất

BM3 dòng 13, nguyên văn: *"Số ngày công của nhân sự đã được phân bổ ở một số nhiệm vụ nhưng chưa full
công tính lương thì sẽ chuyển hết vào Nội dung nhiệm vụ khác và thuộc nguồn Chi phí quản lý."*

⇒ Sau khi PA/PM chấm xong, hệ thống **tự sinh** dòng bù: `nhiemVu = "Nhiệm vụ khác"`,
`phanNguon = Quản lý`, `congPhanBo = congTinhLuong − Σ congDaPhanBo`. Dòng này không do ai nhập, và
nó là lý do tổng CPNC phân bổ luôn khớp 100% quỹ lương — chính là con số mẫu của báo cáo *tỷ lệ PBNC*.

Bỏ quy tắc này thì tỷ lệ PBNC ở §8 luôn < 100% một cách vô nghĩa.

### 4.4 Cột bỏ đi

BM3 có 3 cột kỹ thuật của Excel: `Mã (ghép MNV và ngày công)`, `Số lần xuất hiện mã`, `Số lần xuất
hiện mã đến dòng hiện tại`. Đây là mẹo dò trùng bằng công thức — **không mang sang hệ thống**; thay
bằng ràng buộc khoá duy nhất `(maNhanVien, ngay)` ở `PhanBoCong`.

---

## 5. Đợt 2 viết lại — Import BM0 + Chấm công phân bổ

> Thay thế mục 2 của plan đợt 2→6. Khác biệt lớn nhất: bản cũ coi "bảng công" là **một** thực thể
> CRUD. Thực tế là **hai** thứ tách bạch — dữ liệu HRM nhập vào (chỉ đọc) và bản phân bổ do PA/PM ghi.

### 5.1 Hai thực thể, hai vòng đời

| | `BangCongThangImport` (BM0) | `PhanBoCong` (BM2.1/2.2) |
|---|---|---|
| Ai tạo | HR import từ SAP/HRM | PA/PM chấm trên màn hình |
| Sửa được không | **Không** — chỉ import đè cả kỳ | Có, tới khi submit |
| Hình dạng | Người × 31 ngày, ô là ký hiệu `X:8` | Dòng `(người, ngày) → nội dung CV` |
| Dùng để | Khoá ô + lấy `congTinhLuong` làm mẫu số | Tử số của công thức §4.1 |

Vòng đời `PhanBoCong` theo đúng 4 trạng thái khách ghi ở sheet `1.DS Nhân sự` dòng 23–26:

```
Chưa chấm công → PA đã submit chấm công → PA/PM chủ trì đã xác nhận → HR hoàn thành trình ký
```

Hai nhánh của bước xác nhận (BRD bước 5, và sheet `0.QuyTrinh` dòng 20–21):

- **TH1** — đơn vị chấm công ≠ đơn vị chủ trì ⇒ PA/PM của **đơn vị chủ trì** phải xác nhận.
- **TH2** — đơn vị chấm công = đơn vị chủ trì ⇒ **submit đồng thời là xác nhận**, không sinh bước chờ.

TH2 không phải "trường hợp đặc biệt bỏ qua được": với nhiệm vụ chỉ một đơn vị tham gia thì đây là
đường chạy chính. Bỏ nhánh này là bắt người dùng bấm hai lần cho cùng một việc.

Sau đó là **HR thẩm định** (BRD bước 6): *"HR nhận thông tin, trao đổi tương tác ngoài (nếu có) trước
khi xác nhận trên hệ thống"* — tức là một nút xác nhận, **không** phải một luồng phê duyệt trong hệ
thống. Đừng dựng workflow cho nó.

### 5.2 Ba layout chấm công — không phải một màn có `*ngIf`

Sheet `2.Chấm công` mô tả rõ ba biến thể theo `phanLoai`:

| `phanLoai` | Khối thông tin phía trên | Bảng chấm công |
|---|---|---|
| `KHCN` | Bảng **nội dung CV × (CPNC phê duyệt, đã phân bổ đến N-1, dự phòng, còn lại, tạm tính 6 tháng, tạm tính năm)** | Người × 31 ngày, cột *Nội dung CV tham gia* |
| `PAKD` | Bảng **phân nguồn × sản phẩm × (thời gian, CPNC…)**; nguồn `Bảo hành` chỉ 1 cột | Thêm **dòng nhóm theo sản phẩm** (A, B…); bắt buộc chọn nguồn trước khi chấm |
| `ĐTPT` / `QPAN` | Chỉ một dòng tổng, không có bảng nội dung CV | Như KHCN |

⇒ Kiến trúc: một component bảng chấm công dùng chung + **ba component header** riêng. Nhồi cả ba vào
một template với `@if` lồng nhau là thứ sẽ không ai sửa nổi sau ba tháng.

### 5.3 Luật khoá ô — phần logic nặng nhất của cả phân hệ

Sheet `2.Chấm công` dòng 127: *"Các ngày công nhân sự Nghỉ phép / Ngày T7 CN / Đã submit chấm công ở
NV khác trong cùng tháng / Nhiệm vụ chưa bắt đầu hoặc đã hết hạn: tự động khoá không chấm công được."*

| Luật | Nguồn dữ liệu | Thể hiện |
|---|---|---|
| T7 / CN | Lịch | Ô xám, tooltip "Ngày nghỉ tuần" |
| Nghỉ phép, nghỉ lễ | BM0 bảng công — ký hiệu `P:8`, `DL:8` | Ô xám, hiện ký hiệu gốc |
| Đã chấm ở nhiệm vụ khác | `PhanBoCong` của các nhiệm vụ khác cùng kỳ, **trạng thái ≥ đã submit** | Ô xám, tooltip tên nhiệm vụ đang giữ ngày đó |
| Ngoài `tuNgay`/`denNgay` của nhiệm vụ | `NhiemVu` | Ô xám |

⚠ Hai điểm dễ sai: (a) chỉ khoá khi nhiệm vụ kia **đã submit** — nếu khoá cả bản nháp thì hai PA
chặn nhau vĩnh viễn; (b) khoá phải tính lại khi đổi tháng, vì `PhanBoCong` của tháng khác không liên
quan.

Ngoài ra: **chỉ submit được khi đã điền đủ nội dung CV và nguồn** (dòng 128) — validate ở nút submit,
liệt kê từng ô thiếu, không chỉ báo "dữ liệu chưa hợp lệ".

### 5.4 Tiện ích bắt buộc (dòng 125–126)

- Chọn tháng mới ⇒ **tự gợi ý danh sách nhân sự như tháng gần nhất**. Không có cái này thì mỗi tháng
  PA phải nhập lại từ đầu — đúng thứ khách đang than trong bản khảo sát.
- Gõ mã NV ⇒ tự hiện tên + chức danh.
- Hiển thị **CPNC tạm tính** ngay trên màn, tính theo bảng lương đã import (dòng 27–28).

### 5.5 Import BM0 — validate

Bản cũ liệt kê 6 luật validate cho "import bảng công". Chúng thuộc về `PhanBoCong`, không phải BM0.
Với **BM0** (dữ liệu HRM) luật đúng là:

| Luật | Xử lý |
|---|---|
| Mã NV không có trong danh mục Nhân viên | Chặn dòng, đề xuất thêm vào danh mục |
| Đơn vị cấp 4/5 không khớp cây đơn vị | Chặn dòng |
| Ký hiệu công lạ (ngoài danh mục `KyHieuCong`) | Cảnh báo cho qua, ghi vào danh mục "chờ khai báo" |
| `Công tính lương` ≠ tổng ô trong tháng | Cảnh báo — file HRM có thể có điều chỉnh tay |
| Import lại kỳ đã có | Hỏi rõ **đè cả kỳ**, không merge từng dòng |
| Kỳ đã khoá | Chặn |

Với `PhanBoCong` thì luật là: người không thuộc nội dung CV · nhiệm vụ không ở trạng thái `Đang phân
bổ` · trùng `(người, ngày)` · vượt `congTinhLuong` của kỳ.

**Việc đầu tiên của đợt 2** vẫn giữ như plan cũ: tách phần preview import đang nằm trong
`pages/hr-nhan-su-list` ra `shared/hr/import-preview/`, thêm cột phân biệt *lỗi chặn* và *cảnh báo cho
qua*. Chép sang màn thứ hai là có hai bộ luật sống song song.

### 5.6 Màn hình

| Route | Nội dung |
|---|---|
| `/hr/bang-cong-thang` | BM0 đã import: lọc theo kỳ/đơn vị, xem ma trận, nút Import (HR) |
| `/hr/bang-luong-thang` | BM0 lương đã import — **cột tiền gate theo quyền**, xem §6.2 |
| `/hr/cham-cong` | Màn chính: chọn nhiệm vụ → header theo `phanLoai` → bảng chấm → Submit / Xác nhận |
| `/hr/cham-cong/don-vi` | Màn HR: danh sách đơn vị cấp 5 × trạng thái × tỷ lệ PBNC, click để xem bảng chấm của đơn vị đó |

Màn `/hr/cham-cong` phải cho **chọn đơn vị chủ động**, không mặc định theo đơn vị của người đăng nhập
— sheet `1.DS Nhân sự` dòng 39–40 ghi rõ khách đã đổi yêu cầu này (PA phòng Tổng hợp chấm công hộ đơn
vị khác).

---

## 6. Đợt 3 viết lại — Bảng lương + tính CPNC

Bản cũ hình dung đợt 3 là "CRUD bảng lương". Thực tế bảng lương **chỉ import và chỉ đọc** (BRD giới
hạn: *"không xử lý lương chi tiết"*). Việc thật của đợt 3 là **tính CPNC** — dựng BM3, BM3.1, BM3.2.

### 6.1 Nội dung

1. Import BM0 bảng lương (26 cột, 13 khoản mục chi phí) — validate như §5.5.
2. `core/services/hr/cpnc.service.ts` — cài công thức §4.1 + quy tắc công thừa §4.3. **Một nơi tính
   duy nhất**; mọi biểu mẫu và báo cáo đọc từ đây.
3. Dựng 3 biểu mẫu: BM3 (tổng hợp phân bổ, 51 cột), BM3.1 (bảng lương KHCN theo nội dung CV),
   BM3.2 (bảng lương SXKD theo sản phẩm/nguồn).

### 6.2 Phân quyền dữ liệu lương — đã có đáp án

Plan cũ để ngỏ câu hỏi #5 *"ai được xem cột tiền"*. Ma trận quyền của khách (sheet `2.Chấm công`
dòng 129–138) trả lời thẳng:

| Hành động | PA ĐV chủ trì | PA ĐV khác | PM | HR |
|---|---|---|---|---|
| Chấm công / Thêm / Sửa / Xoá / Submit | ✓ | ✓ | ✓ | ✓ |
| PA/PM chủ trì xác nhận | ✓ | — | ✓ | — |
| Xuất DS nhân sự (BM1) | ✓ | — | ✓ | ✓ |
| Xuất bảng công (BM2.1) | ✓ | — | ✓ | ✓ |
| **Xuất bảng lương (BM3.1/3.2)** | — | — | — | **✓ chỉ HR** |

⇒ Fail-closed: không có quyền thì **không thấy cột tiền**, không phải thấy rồi bị chặn khi bấm. Dùng
lại `core/services/data-scope.service.ts` để giới hạn theo đơn vị; mã quyền bảng lương **tách riêng**
khỏi mã quyền bảng công. Nhắc lại bẫy đã ghi trong bộ nhớ dự án: catalog quyền của
`identity-service` gate hành động thật, deactivate một mã là cắt quyền thật chứ không chỉ ẩn UI.

---

## 7. Đợt 4 — Báo cáo và Dashboard

`Book1` liệt kê **5 dashboard** cụ thể (không phải 4 báo cáo như plan cũ):

| # | Báo cáo | Nguồn | Ghi chú |
|---|---|---|---|
| 1 | Theo dõi nguồn CPNC của các nhiệm vụ | Sheet `3.Báo cáo` dòng 9–14 | Cột: `Nguồn đã lập dự toán` (= CPNC phê duyệt **+ dự phòng**) · `Nguồn đã phân bổ` · `Nguồn cần để phân bổ 6 tháng/năm` · `Nguồn còn lại`. **Còn lại có thể âm** — mẫu của khách ghi `-2000`, đừng clamp về 0 |
| 2 | Tỷ lệ PBNC của đơn vị trong năm | Dòng 18–21 | = Σ CPNC phân bổ tháng / **quỹ lương tháng của đơn vị cấp 5**. Biểu đồ 12 tháng |
| 3 | Tổng hợp PBNC của khối | Dòng 46 | Cộng dồn lên cấp 4 |
| 4 | Tổng hợp PBNC của VHT | Dòng 49–51 | Mẫu số = **tổng bảng lương tháng đã import** |
| 5 | DS nhiệm vụ sắp hết nguồn | Dòng 67–73 | Xuất kèm BM5 toàn VHT |

Cả 5 ăn cùng một nguồn ⇒ giữ nguyên nguyên tắc của plan cũ: `cpnc-aggregate.service.ts` là nơi tính
duy nhất, các màn chỉ đọc. Chữ ký hàm giữ nguyên khi lên backend đợt 6.

Biểu đồ: dùng lại `shared/simple-bar-chart/`, **không thêm thư viện chart**.

---

## 8. Đợt 5 — Cảnh báo và thông báo

### 8.1 Ngưỡng cảnh báo — thay hoàn toàn đề xuất cũ (L7)

Sheet `3.Báo cáo` dòng 36–39 cho ba luật, kèm **người nhận khác nhau từng luật**:

| Luật | PA/PM | GĐTT | BGĐ Khối | HR | Tần suất |
|---|---|---|---|---|---|
| Nhiệm vụ sắp hết nguồn — *nếu CPNC phân bổ tháng N+1 và N+2 bằng tháng N thì không đủ nguồn* | ✓ (N+1 và N+2) | ✓ (chỉ N+1) | — | ✓ (N+1 và N+2) | Theo sự kiện |
| Tỷ lệ PBNC của **đơn vị** < 70% | — | ✓ | — | ✓ | Hàng tháng |
| Tỷ lệ PBNC của **khối** < 70% | — | — | ✓ | ✓ | Hàng quý |

Luật 1 là **phép ngoại suy tuyến tính**, không phải ngưỡng phần trăm: giả định hai tháng tới tiêu
bằng tháng này, nếu nguồn còn lại không đủ thì cảnh báo. Đề xuất "còn < 15% ngân sách" của plan cũ
không đúng và phải bỏ.

Ngưỡng `70%` và tầm nhìn `2 tháng` vẫn phải nằm trong màn cấu hình, không hardcode.

Vai trò nhận thông báo có **GĐTT (Giám đốc Trung tâm)** và **BGĐ Khối** — hai vai trò chưa có trong
`core/models/roles.ts`, phải bổ sung.

### 8.2 Kênh

BRD 4.9: **Email · SMS · thông báo trong hệ thống**. Không có Zalo. Plan cũ ghi 4 kênh
`email|in_app|sms|zalo` theo `SendNotificationConfig` — giữ 4 kênh trong model để sau này hợp nhất
được, nhưng **chỉ bật 3 kênh khách yêu cầu** ở cấu hình mặc định.

Quyết định "hoãn hợp nhất kho mẫu thông báo, ghi nợ kỹ thuật" của plan cũ **vẫn giữ nguyên**.

---

## 9. Đợt 6 — Backend + Tích hợp

### 9.1 Bảng migration (thay danh sách 8 bảng của plan cũ)

`nhiem_vu_hr` · `noi_dung_cong_viec` · `san_pham` · `nhan_su_nhiem_vu` · `vai_tro_nhiem_vu` · `ky` ·
`bang_cong_thang_import` · `dong_bang_cong_import` · `bang_luong_thang_import` ·
`dong_bang_luong_import` · `phan_bo_cong` · `phan_bo_chi_phi` · `don_vi` · `ky_hieu_cong` ·
`nhom_cong_viec` · `thu_vien_cong_viec` · `mau_thong_bao` · `thong_bao_da_gui` · `cau_hinh_canh_bao`.

`dong_bang_cong_import` và `phan_bo_cong` là hai bảng lớn nhất — ước lượng từ file thật: ~1.200
người × 31 ngày × 12 tháng ≈ **450k dòng/năm** mỗi bảng. Cần index `(ky_id, ma_nhan_vien, ngay)` ngay
từ migration đầu, đừng để tối ưu sau.

### 9.2 Tích hợp

| Hệ thống | Hướng | Ghi chú |
|---|---|---|
| **HRM / SAP** | Vào | BRD giới hạn rõ: *"Dữ liệu nhập từ HRM qua file"* ⇒ **không** làm API tích hợp SAP ở phase này |
| **VOffice** | Ra | Trình ký BM1–BM4. Đăng ký như `IntegrationSystem` key `voffice` ở màn Tích hợp chung — giữ nguyên hướng của plan cũ |
| **SSO** | Vào | `Book1` module Cấu hình có mục *Tích hợp SSO* — nối vào `OQ-021` đang mở |

Hai gói trình ký VOffice (sheet `4. Trình ký`):

- **Trình ký theo nhiệm vụ**: BM1 + BM2.1/2.2 + BM3.1/3.2
- **Trình ký bảng tổng hợp**: BM3 + BM4

Giữ nguyên D3: không đưa dòng công/dòng lương vào biến Camunda.

---

## 10. Biểu mẫu — câu hỏi #3 đã có đáp án (L9)

Khách **có** file mẫu cứng, kèm mã biểu mẫu chính thức:

| Mã | Tên | Sheet | Độ khó kết xuất |
|---|---|---|---|
| BM.06 | Danh sách nhân sự tham gia nhiệm vụ KHCN | `BM1.DSNhanSu` | Thấp — 7 cột |
| BM.03.01 | Bảng chấm công theo nội dung công việc | `BM2.1` / `BM2.2` | **Cao** — 47 cột, header 3 tầng merge |
| BM.04.01 | Bảng chi tiết phân bổ CPNC nội bộ | `BM3.1` | **Cao** — header 4 tầng |
| BM.04.02 | Bảng tổng hợp phân bổ CPNC nội bộ | `BM4` | Trung bình |
| — | Bảng tổng hợp phân bổ | `BM3` | **Rất cao** — 51 cột |
| — | Danh sách nhiệm vụ | `BM5` | Trung bình — có cột động theo tháng |

Tất cả đều có quốc hiệu, tiêu ngữ, dòng *"Hà Nội, ngày … tháng … năm 20.."* và vùng ký.

> ⚠ **Quyết định cần lấy:** `core/utils/export-bieu-mau.ts` hiện xuất `.xls` bằng bảng HTML. Cách này
> giữ được `rowspan`/`colspan` nên header đa tầng vẫn ra đúng hình, nhưng **không** kiểm soát được độ
> rộng cột, định dạng số (BM3 có số 12 chữ số), và freeze pane. Đề xuất: **thử BM.03.01 trước** ở đầu
> đợt 2 bằng cách hiện có; nếu khách không chấp nhận thì mới thêm SheetJS — đó là một quyết định thêm
> dependency riêng, không tự làm.

---

## 11. Câu hỏi khách — trạng thái sau khi đọc tài liệu

### Đã có đáp án trong tài liệu (không cần hỏi lại)

| Câu hỏi cũ | Đáp án | Nguồn |
|---|---|---|
| #1 Kỳ theo tháng hay quý? | **Tháng**, cộng mốc lũy kế **6 tháng** và **năm**. Kỳ lương ≠ kỳ trả | BRD 4.4, BM3.2 |
| #2 Chấm công theo ngày hay tuần? | **Theo ngày**, 31 cột | BM2.1 |
| #3 Khách có file mẫu cứng không? | **Có**, 6 biểu mẫu, mã BM.03.01/BM.04.01/BM.04.02/BM.06 | §10 |
| #5 Ai xem cột tiền bảng lương? | **Chỉ HR** được xuất bảng lương | Ma trận §6.2 |
| #6 Ngưỡng "sắp hết nguồn"? | Ngoại suy 2 tháng, không phải ngưỡng % | §8.1 |
| Công thức CPNC | Pro-rata theo `congPhanBo/congTinhLuong`, áp cho 13 khoản | §4.1 |

### Còn phải hỏi — xếp theo mức chặn

| # | Câu hỏi | Chặn |
|---|---|---|
| **Q1** | **`DeTai` là cha của `NhiemVu`, hay hai thứ là một?** (§2.1) | Chặn cứng đợt 2 |
| **Q2** | Ai được **mở lại kỳ đã khoá**, và có cần lý do bắt buộc không? | Đợt 2 |
| **Q3** | VOffice: có tài liệu API thật chưa, hay tiếp tục mock? | Đợt 2 |
| **Q4** | `tyLePhanBo` (§3.2) — khách có thật sự cần chỉ tiêu kế hoạch theo %, hay bỏ hẳn? | Đợt 1 (sửa nhãn) |
| Q5 | Nguồn `ĐTPT` xuất hiện ở cả `PhanLoai` lẫn `PhanNguon` — có phải cùng một thứ? | Đợt 2 |
| Q6 | "Nhiệm vụ khác / Chi phí quản lý" (§4.3) là một nhiệm vụ ảo dùng chung toàn VHT, hay mỗi đơn vị một cái? | Đợt 3 |
| Q7 | Tỷ lệ PBNC lấy mẫu số là quỹ lương của **toàn** đơn vị cấp 5 hay chỉ nhân sự có tham gia nhiệm vụ? | Đợt 4 |
| Q8 | BRD 4.7 nhắc *"quy tắc phân bổ công/lương (tự động/thủ công)"* — "tự động" nghĩa là gì? | Đợt 2 |

Q1 và Q4 nên hỏi trong cùng một buổi vì cả hai đều là câu "mô hình dữ liệu đợt 1 có đúng không".

---

## 12. Thứ tự thi công đề xuất

| Bước | Nội dung | Điều kiện |
|---|---|---|
| **0** | Chốt Q1 + Q4 với khách | — |
| **1** | Hiệu chỉnh đợt 1: model + form + nhãn (§3.1–3.3) | Sau bước 0 |
| **1.5** | Màn danh mục (6 danh mục của `Book1` + Ký hiệu công + Nhóm CV) | Song song bước 1 |
| **2** | Kỳ + import BM0 (công & lương) + tách `import-preview` | Sau 1.5 |
| **3** | Màn chấm công 3 biến thể + luật khoá ô + vòng đời 4 trạng thái | Sau 2 |
| **4** | `cpnc.service` + BM3/BM3.1/BM3.2 + phân quyền cột tiền | Sau 3 |
| **5** | 5 báo cáo/dashboard + BM4/BM5 | Sau 4 |
| **6** | Cảnh báo + thông báo | Song song 5 |
| **7** | Backend + migration + VOffice thật | Sau khi chốt nghiệp vụ 1–6 |

Bước 1.5 kéo lên sớm vì đợt chấm công cần *Sản phẩm*, *Ký hiệu công*, *Nhóm công việc* mới chạy được
— bản cũ xếp danh mục xuống cuối là sai thứ tự phụ thuộc.

---

## 13. Kiểm chứng

Giữ nguyên 7 mục của plan đợt 1, bổ sung:

8. **Đối chiếu số với file khách**: nhập BM0 công + BM0 lương của tháng 5/2025 từ file thật, chấm lại
   đúng phân bổ của BM3 dòng 5–9, kiểm tra hệ thống ra **đúng đến từng đồng** con số BM3 đang ghi.
   Đây là bài kiểm tra duy nhất chứng minh công thức §4.1 đúng — không có nó thì mọi báo cáo sau chỉ
   là số đẹp.
9. **Luật khoá ô**: chấm 1 người vào nhiệm vụ A ngày 05/05, submit; mở nhiệm vụ B cùng người cùng
   ngày → ô phải xám, tooltip nêu tên nhiệm vụ A.
10. **Công thừa**: người có `congTinhLuong = 21`, chấm 6 ngày cho nhiệm vụ ⇒ hệ thống tự sinh 15 ngày
    vào "Nhiệm vụ khác / Chi phí quản lý", tổng CPNC phân bổ = 100% CPNC tháng.
11. **Fail-closed cột tiền**: đăng nhập tài khoản PA → màn bảng lương không render cột tiền (kiểm tra
    trong DOM, không chỉ nhìn mắt).

---

## 14. Cập nhật harness state

Theo `CLAUDE.md`, sau khi plan này được duyệt:

- `.harness/state/decisions.md`:
  - **Sửa `P1`** theo kết quả Q1 — hoặc khoá lại theo phương án ①, hoặc bổ sung bằng chứng cho ②.
    Giữ nguyên trạng thái ĐỀ XUẤT mà không ghi mâu thuẫn với BRD là cách chắc chắn để 3 tháng nữa có
    người code theo bản sai.
  - **Thêm `P3` (đề xuất)**: công thức CPNC pro-rata 13 khoản mục + quy tắc công thừa (§4.1, §4.3) —
    đây là loại logic mà mỗi màn sẽ tự cài lại một kiểu nếu không khoá ở một chỗ.
- `.harness/state/DELIVERY_STATE.md`: ghi đợt 1 đã DONE theo bản cũ và **có nợ hiệu chỉnh** §3.
- `.harness/state/active-task.md`: chuyển sang "HR Tools — hiệu chỉnh đợt 1 theo tài liệu khách".
- `CLAUDE.md`: bổ sung `docs/hr_tool/` vào mục *Where to find things* như **nguồn nghiệp vụ chính
  thức của phân hệ HR Tools**, ngang hàng với `docs/req/`.

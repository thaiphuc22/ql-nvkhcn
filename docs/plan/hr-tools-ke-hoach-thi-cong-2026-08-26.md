# HR Tools — Kế hoạch thi công (bản hợp nhất, đang hiệu lực)

> **Đây là file duy nhất cần đọc để thi công HR Tools.** Lập 2026-08-26 bằng cách hợp nhất:
> - [`hr-tools-hieu-chinh-theo-tai-lieu-khach-2026-08-26.md`](hr-tools-hieu-chinh-theo-tai-lieu-khach-2026-08-26.md) — toàn bộ phần nghiệp vụ, dựng từ bộ tài liệu thật của khách;
> - [`hr-tools-chi-phi-nhan-cong-dot-2-den-6-2026-08-26.md`](hr-tools-chi-phi-nhan-cong-dot-2-den-6-2026-08-26.md) — 5 khối còn hiệu lực (VOffice, trạng thái kỳ, nợ kho mẫu thông báo, model thông báo, khuôn API). **File đó đã ngừng sử dụng.**
>
> [`hr-tools-chi-phi-nhan-cong-dot-1-2026-08-26.md`](hr-tools-chi-phi-nhan-cong-dot-1-2026-08-26.md) **vẫn giữ giá trị** nhưng với vai trò khác: nó là **hồ sơ as-built của đợt 1 đã code xong** (lý do chọn shell riêng, danh sách component, dữ liệu DS đã trích xuất). Phần nghiệp vụ trong đó bị file này thay thế — §3 dưới đây là phiếu sửa.
>
> Trạng thái: **ĐANG THI CÔNG.** **Bước 1 (§3 — hiệu chỉnh đợt 1) đã DONE ngày 2026-08-26**: build GREEN, chạy thử thật, harness state đã cập nhật. Bước 1.5 → 7 chưa code dòng nào.

## 0. Nguồn chuẩn — ai thắng ai

| Chủ đề | Nguồn chuẩn | Ghi chú |
|---|---|---|
| **Nghiệp vụ** (mô hình dữ liệu, công thức, trạng thái, quyền, ngưỡng cảnh báo) | [`docs/hr_tool/`](../hr_tool/) — bộ tài liệu khách gửi 2026-08-26 | Thắng Figma ở mọi điểm |
| **Hình thức** (token màu/chữ, spacing, khuôn màn, shell, component) | [`docs/design-system/`](../design-system/README.md) | Thắng mọi tài liệu khác, kể cả phần chữ trong file Figma gốc |
| **Kiến trúc chung repo** | `.harness/state/decisions.md` + `CLAUDE.md` | D3, D8, D9, D17 áp dụng nguyên vẹn |

Hai vai trò trên không xung đột nhau: khách mô tả *cái gì phải tính đúng*, Figma mô tả *trông ra sao*.

Bộ tài liệu khách gồm:

| File | Là gì | Giá trị |
|---|---|---|
| `VHT_Phan tich bai toan Phan Bo Nhan Cong.docx` | BRD đầy đủ, mã dự án `GPDN.VHT.HRM` | Quy trình 8 bước, phạm vi 9 nhóm chức năng, phân quyền, giới hạn |
| `Phan Bo Nhan Cong Brd.docx` | **Trùng byte-for-byte** với file trên | Không có thông tin mới — bỏ qua |
| `2025.08.01_HR_tool_Khach hang gui.xlsx` | Đặc tả 4 tab màn hình + **BM0→BM5 kèm số liệu thật** | Nguồn chuẩn về màn hình, biểu mẫu, công thức, ma trận quyền |
| `Mo ta phan mem HR_23.06.2025.xlsx` | Bản mô tả cũ hơn + log Q&A với khách | Ngữ cảnh vì sao chốt như vậy; cột dữ liệu HRM |
| `Book1.xlsx` | **Phân rã chức năng 5 module** + map Step→Dữ liệu→Master data | Nguồn chuẩn về phạm vi chức năng |
| `NS_Câu hỏi khảo sát nghiệp vụ hệ thống.docx` | Khảo sát phòng Nhân sự (ThuLH) | Hiện trạng: SAP + Excel thủ công; nút thắt = PA chấm công |

⚠ **Bẫy đã ghi lại để không ai vấp lại:** bảng semantic trong file Figma DS ghi `interactive/primary #F95E00` (cam), nhưng ramp render ra `brand/50 = #EE0033` (đỏ) và toàn bộ màn thiết kế thật đều dùng đỏ. Phần **chữ** trong file DS là dấu vết template cũ ⇒ luôn lấy theo **giá trị render**. Chi tiết ở `docs/design-system/README.md`.

---

## 1. Bối cảnh và phạm vi

**HR Tools** = phân hệ **Quản lý chi phí nhân công cho nhiệm vụ / dự án** của VHT. Ba trục dữ liệu:
**nhiệm vụ** (nơi tiêu tiền) → **nhân sự** (ai tham gia) → **thời gian/tiền** (chấm công → bảng lương → CPNC).

Sản phẩm giai đoạn hiện tại: **màn hình Angular chạy trên mock data, chưa có backend**. Backend là đợt 6, sau khi chốt xong nghiệp vụ 1–5. Vị trí: phân hệ mới ngay trong repo `ql-nvkhcn`, app code `hrtools`.

Phạm vi áp Design System đã chốt ở đợt 1 và **giữ nguyên**: token áp **toàn app** (`theme.less` + `tokens.scss`); chrome (topbar tối full-width + sider trắng) dựng **shell riêng** `layout/hr-shell/` cho HR Tools, các màn cũ giữ shell cũ. Lý do: hạ tầng theme sửa 2 file là xong, còn chrome thì ngược cấu trúc shell hiện tại — sửa shell chung sẽ đổi giao diện mọi màn đang demo. Shell mới viết **không phụ thuộc gì vào HR Tools**, để sau này muốn chuyển cả app sang thiết kế mới thì chỉ đổi một dòng ở `app.routes.ts`.

---

## 2. Mô hình dữ liệu

### 2.1 `NhiemVu` ↔ `DeTai` — ĐÃ CHỐT 2026-08-26

**`DeTai` và `NhiemVu` là hai thứ khác nhau**, và quan hệ giữa chúng là **tham chiếu, không phải phân cấp**.

Bằng chứng khớp từ BM5: cột `MÃ ĐỀ TÀI` và `TÊN ĐỀ TÀI/DỰ ÁN` nằm **trên chính dòng nhiệm vụ** (`PHÂN LOẠI = Chính`, ví dụ thật `011-24-TĐ-RDP-QS`), không phải một dòng riêng ở tầng trên. Tên cột là *"đề tài **hoặc** dự án"* vì nhiệm vụ SXKD `PO-92166` không thuộc đề tài nào — nó định danh bằng mã PO.

```
DeTai  (bên QTKHCN, luồng RD01–RD10, mã 011-24-TĐ-RDP-QS)
   ▲
   │ maDeTai  — nullable, chỉ nhiệm vụ nguồn KHCN mới có
   │
NhiemVu (HR)  =  1 dòng BM5 `PHÂN LOẠI = Chính`
   ├─ NoiDungCongViec   ← dòng `Thành phần`, ĐV phân bổ CHĐK
   ├─ NoiDungCongViec   ← dòng `Thành phần`, ĐV phân bổ KD ĐH
   └─ NoiDungCongViec   ← dòng `Thành phần`, ĐV phân bổ ĐBCL
              ▲
        chấm công gán ngày vào đây (§6.2)
```

Ba hệ quả:

1. `maDeTai` / `tenDeTai` là **cặp trường trên `NhiemVu`, nullable**. Bắt buộc là không khai được nhiệm vụ SXKD / Bán hàng / Bảo hành — và đó là phần lớn dữ liệu thật trong BM5.
2. **HR Tools không quản lý `DeTai` như một thực thể riêng** ở tầng mock. Đề tài sống bên QTKHCN; HR Tools chỉ giữ mã + tên để đối chiếu và hiển thị. Đợt 6 mới nối khoá ngoại.
3. Màn của đợt 1 (`hr-de-tai-*`) **chính là màn nhiệm vụ của BM5**, chỉ đang đặt sai tên — xem §3.1.

> ⚠ **Bẫy tên gọi, phải đọc trước khi đụng đợt 6.** Repo đã có `NhiemVu` trong `services/ho-so-service` phục vụ RD01–RD10 — **thứ đó chính là cái khách gọi là "đề tài"** (mã dạng `011-24-TĐ-RDP-QS`). `NhiemVu` của HR Tools là thực thể **khác**, phạm vi rộng hơn (gồm SXKD, Bán hàng, Bảo hành, ĐTPT). Hai bảng **không được gộp**; chính `maDeTai` của HR là thứ sẽ trỏ sang `nhiem_vu` của ho-so-service.

### 2.2 Danh sách thực thể

| Thực thể | Nguồn | Ghi chú |
|---|---|---|
| `NhiemVu` (HR) | BM5, sheet `1.NhapDeTai` | Đổi tên từ `DeTai` của đợt 1 — xem §3.1. Mang cặp `maDeTai`/`tenDeTai` nullable |
| ~~`DeTai`~~ | — | **Không phải thực thể của HR Tools** (§2.1). Sống bên QTKHCN; ở đây chỉ là mã + tên |
| **`NoiDungCongViec`** ★ | BM5 dòng `Thành phần`, BM2.1 cột *Nội dung* | **Mới.** Con của nhiệm vụ; có **ĐV phân bổ riêng** và CPNC phê duyệt riêng |
| **`SanPham`** ★ | BM2.2, `Book1` danh mục | **Mới.** Chỉ dùng cho nhiệm vụ PAKD; tầng gom trên nội dung CV |
| `NhanSuNhiemVu` | BM1 | Từ `NhanSuDeTai` — xem §3.2 |
| **`VaiTroNhiemVu`** ★ | Sheet `1.DS Nhân sự` dòng 41–43 | **Mới.** PM/PA theo nhiệm vụ, tách khỏi chức danh HRM |
| **`Ky`** ★ | BRD 4.7, BM3.2 | **Mới.** Kỳ lương ≠ kỳ trả (BM3.2: *"Kỳ lương 06/2025 - Kỳ trả 07/2025"*). Trạng thái ở §6.1 |
| **`BangCongThangImport`** ★ | BM0 (1179 dòng thật) | **Mới.** Ma trận người × 31 ngày, ký hiệu `X:8`/`P:8`/`DL:8`. **Chỉ đọc** |
| **`BangLuongThangImport`** ★ | BM0 (2503 dòng thật) | **Mới.** ~26 cột chi phí. **Chỉ đọc** |
| **`PhanBoCong`** ★ | BM2.1 / BM2.2 | **Mới.** Dòng chấm: `(nhanSu, ngay) → noiDungCongViecId`. Bảng duy nhất PA/PM ghi |
| **`PhanBoChiPhi`** ★ | BM3 | **Mới.** Kết quả tính — sinh ra, không nhập tay |
| `DonVi` (5 cấp) | Sheet `List`, BM0 | Danh mục — cây, xem §2.3 |
| `KyHieuCong` | BM0 (`X`, `P`, `DL`…) | Danh mục mới |
| `NhomCongViec` | `Book1` sheet *Quy trình* | Danh mục mới — gom nội dung CV (Giải pháp/Phát triển/Kiểm thử…) |
| `ThuVienCongViec` | `Book1` module Danh mục | Nội dung CV mẫu, tái dùng khi lập nhiệm vụ |

★ = chưa tồn tại trong repo.

### 2.3 Cây đơn vị — 5 cấp

Đọc từ cột `Đơn vị cấp 1..5 (F)` của sheet `3.LuongMucTieu` và `BM0.Bang cong thang import`:

```
Cấp 1  Tập đoàn Công nghiệp - Viễn thông Quân đội        (148842)
Cấp 2  Công ty mẹ - Tập đoàn                             (9001803)
Cấp 3  Tổng công ty Công nghiệp Công nghệ cao Viettel    (9013878)
Cấp 4  Khối 1 / Khối 2 / Khối 3 / TT Kinh doanh / TT QLCL   ← "Khối", đơn vị báo cáo
Cấp 5  Trung tâm CHĐK, Phòng Tổng hợp, TT Camera, …        ← "Đơn vị", đơn vị chấm công
```

Toàn bộ nghiệp vụ chạy ở **cấp 4 và cấp 5**; cấp 1–3 chỉ để hiển thị. Sheet `List` liệt kê đủ 5 khối và ~30 đơn vị cấp 5 — dùng làm seed, **không bịa tên mới**.

> ⚠ Mã đơn vị đi kèm chuỗi tên trong file import (`"Khối 1 - TCT CNC - 9013948"`) ⇒ parser phải tách theo dấu `-` **từ phải sang** để lấy mã, vì tên đơn vị chứa dấu gạch nối.

### 2.4 Phân nguồn và phân loại — hai enum khác nhau, đừng gộp

| Enum | Giá trị | Ảnh hưởng |
|---|---|---|
| `PhanLoaiNhiemVu` | `KHCN` · `PAKD` · `ĐTPT` · `QPAN` | Quyết định **layout màn chấm công** — 3 biến thể, xem §6.3 |
| `PhanNguon` | `KHCN` · `SXKD` · `Bán hàng` · `Bảo hành` · `ĐTPT` · `Quản lý` | Quyết định **CPNC tính vào nguồn nào** |

Ràng buộc riêng: **nguồn `Bảo hành` chỉ theo dõi số đã phân bổ**, không lập dự toán (sheet `2.Chấm công` dòng 59) ⇒ cột "còn lại" phải **để trống** chứ không hiện `0`, vì `0` đọc thành *hết nguồn*. Nguồn `Quản lý` không do người dùng chọn — hệ thống tự gán cho công thừa (§4.3).

`TinhTrangPhanBo`: `Đang trình phê duyệt` · `Đang phân bổ` · `Đã hết hạn` (sheet `1.NhapDeTai` cột H).

---

## 3. Đợt 1 — đã code xong, đây là nợ hiệu chỉnh

Đợt 1 đã dựng: `layout/hr-shell/`, `shared/hr/` (7 component), `core/models/hr/`, `core/services/hr/`, 5 trang `pages/hr-*`. **Toàn bộ khung, shell, component dùng chung, token DS vẫn đúng và giữ nguyên.** Chỉ tầng model + form + nhãn cần sửa.

### 3.1 `core/models/hr/de-tai.ts` → `nhiem-vu.ts`

Theo §2.1, đây là **đổi tên thực thể**, không chỉ đổi nhãn: `DeTai` của đợt 1 chính là dòng `Chính` của BM5. Kéo theo `hr-de-tai-list` → `hr-nhiem-vu-list`, `hr-de-tai-detail` → `hr-nhiem-vu-detail`, route `/hr/de-tai` → `/hr/nhiem-vu`, và `hr-khai-bao-list` là *khai báo nhiệm vụ*. Nhớ cập nhật `nav-items.ts` + `app.routes.ts` cùng hai spec đang khoá chúng (`app.routes.spec.ts`, `nav-items.spec.ts`).


| Việc | Chi tiết |
|---|---|
| **Bổ sung** `maDeTai`, `tenDeTai` | **Nullable** (§2.1). Chỉ nhiệm vụ nguồn KHCN mới có; SXKD/Bán hàng/Bảo hành để trống. BM5 cột `MÃ ĐỀ TÀI` + `TÊN ĐỀ TÀI/DỰ ÁN` |
| **Bổ sung** `khoi` | Đơn vị cấp 4. Không suy ra từ `donViChuTri` bằng string matching |
| **Bổ sung** `donViPhanBo[]` | Danh sách đơn vị cấp 5 tham gia — khác `donViChuTri` |
| **Bổ sung** `phanLoai` | Enum `KHCN\|PAKD\|ĐTPT\|QPAN` — quyết định layout chấm công |
| **Bổ sung** `pmMaNhanVien`, `paMaNhanVien` | BM5 cột PM/PA lưu email; ở model dùng mã NV, hiển thị email |
| **Bổ sung** `chiPhiNhanCongPheDuyet` | **Khác** `tongDuToan`. BM5 có cả hai và chúng chênh nhau ~3× |
| **Bổ sung** `duPhong` | Sheet `3.Báo cáo` dòng 9: nguồn lập dự toán = CPNC phê duyệt **+ dự phòng** |
| **Bổ sung** `tinhTrangPhanBo` | 3 giá trị ở §2.4 — song song với `trangThai` bản khai hiện có |
| **Sửa** `namBatDau`/`namKetThuc` → `tuNgay`/`denNgay` | BM5 dùng ngày đầy đủ; nhiệm vụ bắt đầu 08/04/2025 mà lưu năm thì không khoá ô chấm công đúng được |
| **Sửa** `nguonKinhPhi: string` → `phanNguon: PhanNguon` | §2.4 |
| **Xoá** `linhVuc` | Không có trong bất kỳ biểu mẫu nào; là trường bịa từ Figma |
| **Đổi tên** type `DeTai` → `NhiemVu` (HR) | Đổi cả tên type, tên file, route và nhãn UI — §2.1 đã chốt đây là hai thực thể khác nhau, để tên cũ là mời người sau gộp nhầm với `NhiemVu` của ho-so-service |

### 3.2 `core/models/hr/nhan-su.ts` — phần cần cân nhắc kỹ nhất

`tyLePhanBo` và cặp hàm `tinhTongPhanBo` / `nhanSuVuotPhanBo` là **trục trung tâm của đợt 1**, và không có gì tương ứng trong tài liệu khách. BM1 chỉ cần: `TT · MÃ NV · Họ và tên · Chức danh · Nội dung công việc tham gia · Thời gian tham gia · Ghi chú`.

Khuyến nghị: **hạ `tyLePhanBo` xuống optional**, đổi nhãn thành *"Tỷ lệ dự kiến (%) — tham khảo"*, giữ nguyên code kiểm tra ≤ 100% (nó không sai, chỉ là không phải luật của khách), và **thêm ràng buộc thật**:

- `noiDungCongViecIds: string[]` — BM1 bắt buộc; một người có thể tham gia nhiều nội dung CV.
- Ràng buộc chặn **1 ngày = 1 nội dung CV** sống ở tầng `PhanBoCong` (đợt 2), **không** ở đây. Ghi chú chéo trong code để người đọc không đi tìm nhầm chỗ.

> Không xoá hẳn `tyLePhanBo`: khách chưa nói là *không* muốn, và cả màn `hr-nhan-su-form` lẫn `nhan-su.service.spec.ts` đang dựa vào nó. Hạ cấp thì rẻ và đảo ngược được; xoá thì không.

### 3.3 Thực thể mới cần thêm ngay ở đợt 1

Vì `NoiDungCongViec` là thứ đợt 2 ăn vào, và màn chi tiết nhiệm vụ phải khai nó:

- `core/models/hr/noi-dung-cong-viec.ts` — `id`, `nhiemVuId`, `ten`, `nhomCongViecId?`, `sanPhamId?` (PAKD), `donViPhanBo`, `phanNguon`, `chiPhiNhanCongPheDuyet`, `duPhong`, `tuNgay`, `denNgay`, `tinhTrangPhanBo`.
- `core/models/hr/vai-tro-nhiem-vu.ts` — `nhiemVuId`, `maNhanVien`, `vaiTro: 'PM'|'PA'`, `donVi`. Luật từ khách: *1 nhiệm vụ có 1 PM và 1 PA đơn vị chủ trì; mỗi đơn vị phân bổ có 1 PA*.
- Màn `hr-de-tai-detail` thêm **tab "Nội dung công việc"** (bảng CRUD + cột CPNC phê duyệt) và **tab "Vai trò PM/PA"**. Tab "Nhiệm vụ KHCN" đang để rỗng thì bỏ hoặc đổi công dụng theo §2.1.

---

## 4. Công thức CPNC — bản chính xác từ BM3

Đây là logic sẽ bị mỗi màn tự cài lại một kiểu nếu không khoá ở một chỗ. **Một nơi tính duy nhất: `core/services/hr/cpnc.service.ts`.**

### 4.1 Công thức

Với mỗi (nhân sự × nhiệm vụ × nội dung CV) trong một kỳ:

```
tyLe = congPhanBo / congTinhLuong          ← mẫu số là công tính lương CỦA CHÍNH NGƯỜI ĐÓ
CPNC_phanBo[khoanMuc] = CPNC_thang[khoanMuc] × tyLe      (áp cho TỪNG khoản, không phải tổng)
```

13 khoản mục (BM3 cột 17–31): `Lương tháng` · `Lương tháng (trừ BH cá nhân)` · `Truy thu/truy lĩnh` · `Lương SXKD` · `Lương thử việc, tập nghề` · `Lương kinh doanh thử việc` · `BHXH cá nhân` · `BHXH đơn vị` · `BHYT cá nhân` · `BHYT đơn vị` · `BHTN cá nhân` · `BHTN đơn vị` · `KPCĐ` · `Các khoản ăn ca, điện thoại, phụ cấp` → `CỘNG`.

**Kiểm chứng bằng số thật** (BM3 dòng 5, Lê Trần Sự, `congTinhLuong = 21`, `congPhanBo = 6`):

| Khoản | CPNC tháng | Kỳ vọng ×6/21 | BM3 ghi |
|---|---|---|---|
| Lương tháng | 113.316.438 | 32.376.125 | 32.376.125 ✓ |
| BHXH cá nhân | 1.503.216 | 429.490 | 429.490 ✓ |
| Ăn ca, điện thoại | 1.730.000 | 494.286 | 494.286 ✓ |

⇒ Pro-rata tuyến tính, làm tròn tới **đồng**. Không có hệ số nào khác.

### 4.2 Hai cái bẫy của cách hiểu cũ

Bản kế hoạch trước ghi `donGiaCong = tongChiPhi / soCongChuan` **của kỳ**. Sai hai chỗ:

1. Mẫu số là **công tính lương của từng người** (BM0 cột cuối), khác nhau giữa người này với người kia trong cùng kỳ — không phải số công chuẩn của kỳ.
2. CPNC không phải một con số tổng mà là **vector 13 khoản** — gộp lại thì BM3.1/BM3.2 không dựng được vì hai biểu mẫu này in tách từng khoản.

### 4.3 Quy tắc công thừa — dễ bỏ sót nhất

BM3 dòng 13, nguyên văn: *"Số ngày công của nhân sự đã được phân bổ ở một số nhiệm vụ nhưng chưa full công tính lương thì sẽ chuyển hết vào Nội dung nhiệm vụ khác và thuộc nguồn Chi phí quản lý."*

⇒ Sau khi PA/PM chấm xong, hệ thống **tự sinh** dòng bù: `nhiemVu = "Nhiệm vụ khác"`, `phanNguon = Quản lý`, `congPhanBo = congTinhLuong − Σ congDaPhanBo`. Dòng này không do ai nhập, và nó là lý do tổng CPNC phân bổ luôn khớp 100% quỹ lương — chính là con số mẫu của báo cáo *tỷ lệ PBNC*.

Bỏ quy tắc này thì tỷ lệ PBNC ở §9 luôn < 100% một cách vô nghĩa.

### 4.4 Cột bỏ đi

BM3 có 3 cột kỹ thuật của Excel: `Mã (ghép MNV và ngày công)`, `Số lần xuất hiện mã`, `Số lần xuất hiện mã đến dòng hiện tại`. Đây là mẹo dò trùng bằng công thức — **không mang sang hệ thống**; thay bằng ràng buộc khoá duy nhất `(maNhanVien, ngay)` ở `PhanBoCong`.

---

## 5. Đợt 1.5 — Danh mục

`Book1` liệt kê 6 danh mục, mỗi cái đủ `Danh sách · Chi tiết · CRUD · Import · Export`: **Đơn vị · Chức danh · Nhân viên · Nguồn kinh phí · Sản phẩm · Thư viện công việc**. Cộng thêm **Ký hiệu công** và **Nhóm công việc** (§2.2). Đợt 1 chưa có màn danh mục nào.

Gom thành **một đợt ngắn** — một trang danh mục có tab, dùng lại `page-card` + `table-footer` + import preview — thay vì rải vào các đợt sau. Lý do xếp lên sớm: đợt 2 cần *Ký hiệu công*, *Sản phẩm*, *Nhóm công việc* mới chạy được. Xếp danh mục xuống cuối là sai thứ tự phụ thuộc.

---

## 6. Đợt 2 — Kỳ + Import BM0 + Chấm công phân bổ

Khác biệt lớn nhất so với cách nghĩ ban đầu: "bảng công" không phải **một** thực thể CRUD. Nó là **hai** thứ tách bạch — dữ liệu HRM nhập vào (chỉ đọc) và bản phân bổ do PA/PM ghi.

### 6.1 Khái niệm kỳ — nền của cả đợt 2, 3, 4

Chưa có khái niệm **kỳ** nào trong repo. Phải dựng ở đợt này vì cả bảng công, bảng lương và báo cáo đều khoá theo nó.

- `Ky`: `maKy` (`2026-07`), `loai` (`THANG` | `QUY`), `tuNgay`/`denNgay`, `soNgayCongChuan`, `trangThai` (`MO` | `DANG_CHOT` | `DA_KHOA`), và **kỳ trả** tách khỏi kỳ lương (BM3.2).
- **Đã khoá thì không sửa được** bảng công/bảng lương của kỳ đó. Muốn sửa phải **mở kỳ**, và thao tác mở kỳ **ghi audit kèm lý do**. Không làm điều này thì số báo cáo đợt 4 đổi sau lưng người đã ký.
- Ai được mở lại kỳ đã khoá — câu hỏi Q2 ở §12.

### 6.2 Hai thực thể, hai vòng đời

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

Hai nhánh của bước xác nhận (BRD bước 5, sheet `0.QuyTrinh` dòng 20–21):

- **TH1** — đơn vị chấm công ≠ đơn vị chủ trì ⇒ PA/PM của **đơn vị chủ trì** phải xác nhận.
- **TH2** — đơn vị chấm công = đơn vị chủ trì ⇒ **submit đồng thời là xác nhận**, không sinh bước chờ.

TH2 không phải "trường hợp đặc biệt bỏ qua được": với nhiệm vụ chỉ một đơn vị tham gia thì đây là đường chạy chính. Bỏ nhánh này là bắt người dùng bấm hai lần cho cùng một việc.

Sau đó là **HR thẩm định** (BRD bước 6): *"HR nhận thông tin, trao đổi tương tác ngoài (nếu có) trước khi xác nhận trên hệ thống"* — tức là một nút xác nhận, **không** phải một luồng phê duyệt trong hệ thống. Đừng dựng workflow cho nó.

### 6.3 Ba layout chấm công — không phải một màn có `*ngIf`

Sheet `2.Chấm công` mô tả rõ ba biến thể theo `phanLoai`:

| `phanLoai` | Khối thông tin phía trên | Bảng chấm công |
|---|---|---|
| `KHCN` | Bảng **nội dung CV × (CPNC phê duyệt, đã phân bổ đến N-1, dự phòng, còn lại, tạm tính 6 tháng, tạm tính năm)** | Người × 31 ngày, cột *Nội dung CV tham gia* |
| `PAKD` | Bảng **phân nguồn × sản phẩm × (thời gian, CPNC…)**; nguồn `Bảo hành` chỉ 1 cột | Thêm **dòng nhóm theo sản phẩm** (A, B…); bắt buộc chọn nguồn trước khi chấm |
| `ĐTPT` / `QPAN` | Chỉ một dòng tổng, không có bảng nội dung CV | Như KHCN |

⇒ Kiến trúc: **một** component bảng chấm công dùng chung + **ba** component header riêng. Nhồi cả ba vào một template với `@if` lồng nhau là thứ sẽ không ai sửa nổi sau ba tháng.

### 6.4 Luật khoá ô — phần logic nặng nhất của cả phân hệ

Sheet `2.Chấm công` dòng 127: *"Các ngày công nhân sự Nghỉ phép / Ngày T7 CN / Đã submit chấm công ở NV khác trong cùng tháng / Nhiệm vụ chưa bắt đầu hoặc đã hết hạn: tự động khoá không chấm công được."*

| Luật | Nguồn dữ liệu | Thể hiện |
|---|---|---|
| T7 / CN | Lịch | Ô xám, tooltip "Ngày nghỉ tuần" |
| Nghỉ phép, nghỉ lễ | BM0 bảng công — ký hiệu `P:8`, `DL:8` | Ô xám, hiện ký hiệu gốc |
| Đã chấm ở nhiệm vụ khác | `PhanBoCong` của các nhiệm vụ khác cùng kỳ, **trạng thái ≥ đã submit** | Ô xám, tooltip tên nhiệm vụ đang giữ ngày đó |
| Ngoài `tuNgay`/`denNgay` của nhiệm vụ | `NhiemVu` | Ô xám |

⚠ Hai điểm dễ sai: (a) chỉ khoá khi nhiệm vụ kia **đã submit** — khoá cả bản nháp thì hai PA chặn nhau vĩnh viễn; (b) khoá phải **tính lại khi đổi tháng**, vì `PhanBoCong` của tháng khác không liên quan.

Ngoài ra: **chỉ submit được khi đã điền đủ nội dung CV và nguồn** (dòng 128) — validate ở nút submit, **liệt kê từng ô thiếu**, không chỉ báo "dữ liệu chưa hợp lệ".

### 6.5 Tiện ích bắt buộc (dòng 125–126)

- Chọn tháng mới ⇒ **tự gợi ý danh sách nhân sự như tháng gần nhất**. Không có cái này thì mỗi tháng PA phải nhập lại từ đầu — đúng thứ khách đang than trong bản khảo sát.
- Gõ mã NV ⇒ tự hiện tên + chức danh.
- Hiển thị **CPNC tạm tính** ngay trên màn, tính theo bảng lương đã import (dòng 27–28).

### 6.6 Import — hai bộ luật, đừng trộn

**Việc đầu tiên của đợt 2:** tách phần preview import đang nằm thẳng trong `pages/hr-nhan-su-list` ra `shared/hr/import-preview/`, thêm cột phân biệt **lỗi chặn** và **cảnh báo cho qua**.

> As-built đợt 1: kế hoạch dự kiến component dùng chung `shared/hr/import-preview/`, nhưng bản đã code đặt preview nằm trong trang, chỉ tách ra `core/utils/upload-file.ts` cho việc lấy `File` từ `nz-upload`. Chép sang màn thứ hai trước khi tách là có hai bộ luật validate sống song song, sửa một bên quên bên kia.

Luật validate cho **BM0** (dữ liệu HRM):

| Luật | Xử lý |
|---|---|
| Mã NV không có trong danh mục Nhân viên | Chặn dòng, đề xuất thêm vào danh mục |
| Đơn vị cấp 4/5 không khớp cây đơn vị | Chặn dòng |
| Ký hiệu công lạ (ngoài danh mục `KyHieuCong`) | Cảnh báo cho qua, ghi vào danh mục "chờ khai báo" |
| `Công tính lương` ≠ tổng ô trong tháng | Cảnh báo — file HRM có thể có điều chỉnh tay |
| Import lại kỳ đã có | Hỏi rõ **đè cả kỳ**, không merge từng dòng |
| Kỳ đã khoá | Chặn |

Luật cho **`PhanBoCong`** (khác hẳn, đừng dùng nhầm bộ trên): người không thuộc nội dung CV · nhiệm vụ không ở trạng thái `Đang phân bổ` · trùng `(người, ngày)` · vượt `congTinhLuong` của kỳ.

### 6.7 Màn hình

| Route | Nội dung |
|---|---|
| `/hr/bang-cong-thang` | BM0 đã import: lọc theo kỳ/đơn vị, xem ma trận, nút Import (HR) |
| `/hr/bang-luong-thang` | BM0 lương đã import — **cột tiền gate theo quyền**, xem §7.2 |
| `/hr/cham-cong` | Màn chính: chọn nhiệm vụ → header theo `phanLoai` → bảng chấm → Submit / Xác nhận |
| `/hr/cham-cong/don-vi` | Màn HR: danh sách đơn vị cấp 5 × trạng thái × tỷ lệ PBNC, click để xem bảng chấm của đơn vị đó |

Màn `/hr/cham-cong` phải cho **chọn đơn vị chủ động**, không mặc định theo đơn vị của người đăng nhập — sheet `1.DS Nhân sự` dòng 39–40 ghi rõ khách đã đổi yêu cầu này (PA phòng Tổng hợp chấm công hộ đơn vị khác).

Khuôn màn: danh sách theo mẫu DMDC; chi tiết theo mẫu *Thêm mới hội đồng* (trang đầy đủ + bảng con). Dùng lại `page-card`, `table-footer`, `advanced-search`, `export-bieu-mau`, `bieu-mau-print` của đợt 1.

### 6.8 Trình ký VOffice — dựng đúng chỗ, dùng lại từ đợt 3

VOffice **chưa tồn tại** ở bất kỳ đâu trong repo. Nhưng module Tích hợp đã có sẵn: `core/models/integration-system.ts` (`IntegrationSystem` với `key`/`kieu`/`syncMode`/`trangThai`/`endpoint`), service gọi `GET /api/integration-systems`, và màn `/tich-hop`.

⇒ **VOffice đăng ký như một `IntegrationSystem` key `voffice`, kiểu `connector`**, hiện ở màn Tích hợp chung. HR Tools chỉ gọi adapter, **không dựng màn cấu hình tích hợp riêng**. Làm khác đi là tạo nguồn cấu hình tích hợp thứ hai — đúng loại lỗi mà `DELIVERY_STATE.md` đã phải dọn nhiều lần (bản sao thứ 5, thứ 6 của tập mã nút).

- `core/services/hr/voffice.service.ts` — mock adapter: `trinhKy(loaiTaiLieu, id)` trả `{ soVanBan, ngayTrinh, trangThai }` sau độ trễ giả lập; **có nhánh trả lỗi** để test UI thất bại.
- Trạng thái ký hiển thị trên cả bảng công lẫn bảng lương ⇒ đặt ở `shared/hr/trinh-ky-voffice/` (nút + modal xác nhận + thẻ trạng thái), dùng chung đợt 2 và 3.

Hai gói trình ký (sheet `4. Trình ký`): **theo nhiệm vụ** = BM1 + BM2.1/2.2 + BM3.1/3.2; **bảng tổng hợp** = BM3 + BM4.

---

## 7. Đợt 3 — Bảng lương + tính CPNC

Bảng lương **chỉ import và chỉ đọc** (BRD giới hạn: *"không xử lý lương chi tiết"*). Việc thật của đợt 3 là **tính CPNC** — dựng BM3, BM3.1, BM3.2.

### 7.1 Nội dung

1. Import BM0 bảng lương (26 cột, 13 khoản mục chi phí) — validate như §6.6.
2. `core/services/hr/cpnc.service.ts` — cài công thức §4.1 + quy tắc công thừa §4.3. **Một nơi tính duy nhất**; mọi biểu mẫu và báo cáo đọc từ đây.
3. Dựng 3 biểu mẫu: BM3 (tổng hợp phân bổ, 51 cột), BM3.1 (bảng lương KHCN theo nội dung CV), BM3.2 (bảng lương SXKD theo sản phẩm/nguồn).

### 7.2 Phân quyền dữ liệu lương

Ma trận quyền của khách (sheet `2.Chấm công` dòng 129–138):

| Hành động | PA ĐV chủ trì | PA ĐV khác | PM | HR |
|---|---|---|---|---|
| Chấm công / Thêm / Sửa / Xoá / Submit | ✓ | ✓ | ✓ | ✓ |
| PA/PM chủ trì xác nhận | ✓ | — | ✓ | — |
| Xuất DS nhân sự (BM1) | ✓ | — | ✓ | ✓ |
| Xuất bảng công (BM2.1) | ✓ | — | ✓ | ✓ |
| **Xuất bảng lương (BM3.1/3.2)** | — | — | — | **✓ chỉ HR** |

⇒ **Fail-closed**: không có quyền thì **không render cột tiền**, không phải render rồi chặn khi bấm. Dùng lại `core/services/data-scope.service.ts` để giới hạn theo đơn vị; mã quyền bảng lương **tách riêng** khỏi mã quyền bảng công.

⚠ Nhắc lại bẫy đã ghi trong bộ nhớ dự án: catalog quyền của `identity-service` **gate hành động thật** — deactivate một mã là cắt quyền thật, không chỉ ẩn UI.

---

## 8. Đợt 4 — Báo cáo và Dashboard

`Book1` liệt kê **5 dashboard** cụ thể:

| # | Báo cáo | Nguồn | Ghi chú |
|---|---|---|---|
| 1 | Theo dõi nguồn CPNC của các nhiệm vụ | Sheet `3.Báo cáo` dòng 9–14 | Cột: `Nguồn đã lập dự toán` (= CPNC phê duyệt **+ dự phòng**) · `Nguồn đã phân bổ` · `Nguồn cần để phân bổ 6 tháng/năm` · `Nguồn còn lại`. **Còn lại có thể âm** — mẫu của khách ghi `-2000`, đừng clamp về 0 |
| 2 | Tỷ lệ PBNC của đơn vị trong năm | Dòng 18–21 | = Σ CPNC phân bổ tháng / **quỹ lương tháng của đơn vị cấp 5**. Biểu đồ 12 tháng |
| 3 | Tổng hợp PBNC của khối | Dòng 46 | Cộng dồn lên cấp 4 |
| 4 | Tổng hợp PBNC của VHT | Dòng 49–51 | Mẫu số = **tổng bảng lương tháng đã import** |
| 5 | DS nhiệm vụ sắp hết nguồn | Dòng 67–73 | Xuất kèm BM5 toàn VHT |

Cả 5 ăn cùng một nguồn ⇒ `cpnc-aggregate.service.ts` là **nơi tính duy nhất**, các màn chỉ đọc. **Giữ nguyên chữ ký hàm** khi lên backend đợt 6.

Biểu đồ: dùng lại `shared/simple-bar-chart/`, **không thêm thư viện chart**.

---

## 9. Đợt 5 — Cảnh báo và Thông báo

### 9.1 Ngưỡng cảnh báo

Sheet `3.Báo cáo` dòng 36–39 cho ba luật, kèm **người nhận khác nhau từng luật**:

| Luật | PA/PM | GĐTT | BGĐ Khối | HR | Tần suất |
|---|---|---|---|---|---|
| Nhiệm vụ sắp hết nguồn — *nếu CPNC phân bổ tháng N+1 và N+2 bằng tháng N thì không đủ nguồn* | ✓ (N+1 và N+2) | ✓ (chỉ N+1) | — | ✓ (N+1 và N+2) | Theo sự kiện |
| Tỷ lệ PBNC của **đơn vị** < 70% | — | ✓ | — | ✓ | Hàng tháng |
| Tỷ lệ PBNC của **khối** < 70% | — | — | ✓ | ✓ | Hàng quý |

Luật 1 là **phép ngoại suy tuyến tính**, không phải ngưỡng phần trăm: giả định hai tháng tới tiêu bằng tháng này, nếu nguồn còn lại không đủ thì cảnh báo. Ngưỡng `70%` và tầm nhìn `2 tháng` phải nằm trong **màn cấu hình**, không hardcode.

Vai trò nhận thông báo có **GĐTT (Giám đốc Trung tâm)** và **BGĐ Khối** — hai vai trò chưa có trong `core/models/roles.ts`, phải bổ sung.

### 9.2 Kênh và kho mẫu — HOÃN hợp nhất, ghi nợ kỹ thuật

BRD 4.9 yêu cầu **Email · SMS · thông báo trong hệ thống**. Không có Zalo.

> **Quyết định 2026-08-26, người dùng chọn: để sau.** HR Tools dựng kho mẫu **của riêng phân hệ** ở đợt 5; không đụng vào màn Tác vụ hệ thống của phân hệ Quy trình trong đợt này.

Bối cảnh cần ghi lại để không quên: service task `SEND_NOTIFICATION` đã có `templateCode`, `channels: ['email','in_app','sms','zalo']`, `recipientExpression` (`core/models/service-task.ts:134`) — nhưng **không có bảng catalog mẫu nào trong cả 39 migration**, `templateCode` hiện là **chuỗi gõ tay**. Khi HR Tools dựng kho riêng, hệ thống sẽ có **hai nguồn mẫu thông báo song song** — chấp nhận có ý thức, không phải sót.

**Ba việc rẻ tiền để món nợ này trả được về sau:**

1. `MauThongBao.code` dùng **cùng quy ước đặt mã** với `templateCode` của service task (chữ thường, gạch ngang), để sau này hợp nhất là map thẳng.
2. Giữ **đúng 4 kênh** `email | in_app | sms | zalo` đã khai ở `SendNotificationConfig` trong model (để hợp nhất được), nhưng **chỉ bật 3 kênh khách yêu cầu** ở cấu hình mặc định. Không tự nghĩ thêm kênh mới.
3. Ghi một dòng nợ kỹ thuật vào `.harness/state/decisions.md`: *"kho mẫu thông báo đang có 2 nguồn — HR Tools và `SEND_NOTIFICATION.templateCode`; hợp nhất khi có yêu cầu"*. Không ghi thì 6 tháng nữa không ai nhớ đây là lựa chọn có chủ ý.

### 9.3 Model

- `MauThongBao`: `code` (PK, dùng làm `templateCode`), `ten`, `kenh[]`, `tieuDe`, `noiDung` (có placeholder `{{...}}`), `bienKhaDung[]`, `trangThai`, `lichSu[]`.
- `CauHinhKenh`: bật/tắt từng kênh + tham số (SMTP/SMS gateway) — ở mock chỉ là form lưu vào store.
- `VaiTroNhanThongBao`: `sukien` × `vaiTroCodes[]` — dùng lại mã vai trò của `core/models/roles.ts`, **không tự định nghĩa danh sách vai trò mới** (trừ GĐTT/BGĐ Khối ở §9.1, bổ sung vào đúng file đó).
- `ThongBaoDaGui`: `mauCode`, `nguoiNhan`, `kenh`, `thoiDiem`, `trangThai` (`GUI_THANH_CONG`/`THAT_BAI`), `loi?`.

Màn "danh sách đã gửi" cần **cột lý do lỗi** — thông báo thất bại mà không nói vì sao thì không ai sửa được.

---

## 10. Đợt 6 — Backend + Tích hợp

### 10.1 Bảng migration

`nhiem_vu_hr` · `noi_dung_cong_viec` · `san_pham` · `nhan_su_nhiem_vu` · `vai_tro_nhiem_vu` · `ky` · `bang_cong_thang_import` · `dong_bang_cong_import` · `bang_luong_thang_import` · `dong_bang_luong_import` · `phan_bo_cong` · `phan_bo_chi_phi` · `don_vi` · `ky_hieu_cong` · `nhom_cong_viec` · `thu_vien_cong_viec` · `mau_thong_bao` · `thong_bao_da_gui` · `cau_hinh_canh_bao`.

`dong_bang_cong_import` và `phan_bo_cong` là hai bảng lớn nhất — ước lượng từ file thật: ~1.200 người × 31 ngày × 12 tháng ≈ **450k dòng/năm** mỗi bảng. Cần index `(ky_id, ma_nhan_vien, ngay)` **ngay từ migration đầu**, đừng để tối ưu sau.

### 10.2 API

1. CRUD + import + duyệt + trình ký, kèm audit actor như `HoiDongService` đang làm: header `X-QTKHCN-Actor`, `If-Match` cho optimistic locking.
2. Thay ruột các mock service — **giữ nguyên chữ ký public** để các trang không phải sửa. Đây là lý do đợt 1 quy định service mock phải phơi đúng bộ `list/get/create/update/remove/submit/approve/reject/importRows`.
3. RBAC thật cho HR Tools thay entitlement demo phía client.

### 10.3 Tích hợp

| Hệ thống | Hướng | Ghi chú |
|---|---|---|
| **HRM / SAP** | Vào | BRD giới hạn rõ: *"Dữ liệu nhập từ HRM qua file"* ⇒ **không** làm API tích hợp SAP ở phase này |
| **VOffice** | Ra | Adapter thật thay mock của §6.8; vẫn đăng ký ở màn Tích hợp chung |
| **SSO** | Vào | `Book1` module Cấu hình có mục *Tích hợp SSO* — nối vào `OQ-021` đang mở |

**Giữ nguyên D3:** không đưa dòng công / dòng lương vào biến Camunda. Nếu luồng *xác nhận → trình ký* cần chạy qua Camunda thì chỉ đẩy `maNhiemVu` + `kỳ` + `đơn vị`.

---

## 11. Biểu mẫu — khách có file mẫu cứng

| Mã | Tên | Sheet | Độ khó kết xuất |
|---|---|---|---|
| BM.06 | Danh sách nhân sự tham gia nhiệm vụ KHCN | `BM1.DSNhanSu` | Thấp — 7 cột |
| BM.03.01 | Bảng chấm công theo nội dung công việc | `BM2.1` / `BM2.2` | **Cao** — 47 cột, header 3 tầng merge |
| BM.04.01 | Bảng chi tiết phân bổ CPNC nội bộ | `BM3.1` | **Cao** — header 4 tầng |
| BM.04.02 | Bảng tổng hợp phân bổ CPNC nội bộ | `BM4` | Trung bình |
| — | Bảng tổng hợp phân bổ | `BM3` | **Rất cao** — 51 cột |
| — | Danh sách nhiệm vụ | `BM5` | Trung bình — có cột động theo tháng |

Tất cả đều có quốc hiệu, tiêu ngữ, dòng *"Hà Nội, ngày … tháng … năm 20.."* và vùng ký.

> ⚠ **Quyết định cần lấy:** `core/utils/export-bieu-mau.ts` hiện xuất `.xls` bằng bảng HTML. Cách này giữ được `rowspan`/`colspan` nên header đa tầng vẫn ra đúng hình, nhưng **không** kiểm soát được độ rộng cột, định dạng số (BM3 có số 12 chữ số), và freeze pane. Đề xuất: **thử BM.03.01 trước** ở đầu đợt 2 bằng cách hiện có; nếu khách không chấp nhận thì mới thêm SheetJS — đó là quyết định thêm dependency riêng, **không tự làm**.

---

## 12. Câu hỏi khách

### Đã có đáp án trong tài liệu — không hỏi lại

| Câu hỏi | Đáp án | Nguồn |
|---|---|---|
| Kỳ theo tháng hay quý? | **Tháng**, cộng mốc lũy kế **6 tháng** và **năm**. Kỳ lương ≠ kỳ trả | BRD 4.4, BM3.2 |
| Chấm công theo ngày hay tuần? | **Theo ngày**, 31 cột | BM2.1 |
| Khách có file mẫu cứng không? | **Có**, 6 biểu mẫu | §11 |
| Ai xem cột tiền bảng lương? | **Chỉ HR** được xuất bảng lương | §7.2 |
| Ngưỡng "sắp hết nguồn"? | Ngoại suy 2 tháng, không phải ngưỡng % | §9.1 |
| **`DeTai` là cha của `NhiemVu`?** | **Không** — hai thực thể khác nhau, quan hệ là tham chiếu `maDeTai` nullable. Chốt 2026-08-26 | §2.1, BM5 |
| Công thức CPNC | Pro-rata `congPhanBo/congTinhLuong`, áp cho 13 khoản | §4.1 |

### Còn phải hỏi — xếp theo mức chặn

| # | Câu hỏi | Chặn |
|---|---|---|
| **Q2** | Ai được **mở lại kỳ đã khoá**, và có cần lý do bắt buộc không? (§6.1) | Đợt 2 |
| **Q3** | VOffice: có tài liệu API thật chưa, hay tiếp tục mock? | Đợt 2 |
| **Q4** | `tyLePhanBo` (§3.2) — khách có thật sự cần chỉ tiêu kế hoạch theo %, hay bỏ hẳn? | ~~Đợt 1~~ — đã xử lý tạm bằng cách hạ optional; vẫn cần khách trả lời để gỡ hẳn |
| Q5 | Nguồn `ĐTPT` xuất hiện ở cả `PhanLoai` lẫn `PhanNguon` — có phải cùng một thứ? | Đợt 2 |
| Q6 | "Nhiệm vụ khác / Chi phí quản lý" (§4.3) là một nhiệm vụ ảo dùng chung toàn VHT, hay mỗi đơn vị một cái? | Đợt 3 |
| Q7 | Tỷ lệ PBNC lấy mẫu số là quỹ lương của **toàn** đơn vị cấp 5 hay chỉ nhân sự có tham gia nhiệm vụ? | Đợt 4 |
| Q8 | BRD 4.7 nhắc *"quy tắc phân bổ công/lương (tự động/thủ công)"* — "tự động" nghĩa là gì? | Đợt 2 |

Q1 đã chốt ⇒ **Q4 là câu duy nhất còn chặn việc sửa đợt 1**, và nó rẻ: §3.2 đã chọn cách hạ `tyLePhanBo` xuống optional — đảo ngược được cả hai chiều, nên có thể làm trước rồi xác nhận sau.

---

## 13. Thứ tự thi công

| Bước | Nội dung | Điều kiện |
|---|---|---|
| **0** | ~~Chốt Q1~~ ✅ 2026-08-26 (§2.1). Còn Q4 — không chặn, xem §12 | — |
| **1** | ~~Hiệu chỉnh đợt 1: model + form + nhãn (§3)~~ ✅ **DONE 2026-08-26** | Sau bước 0 |
| **1.5** | Màn danh mục (§5) | Song song bước 1 |
| **2** | Kỳ + import BM0 (công & lương) + tách `import-preview` + adapter VOffice (§6.1, §6.6, §6.8) | Sau 1.5 |
| **3** | Màn chấm công 3 biến thể + luật khoá ô + vòng đời 4 trạng thái (§6.2–6.5, §6.7) | Sau 2 |
| **4** | `cpnc.service` + BM3/BM3.1/BM3.2 + phân quyền cột tiền (§7) | Sau 3 |
| **5** | 5 báo cáo/dashboard + BM4/BM5 (§8) | Sau 4 |
| **6** | Cảnh báo + thông báo (§9) | Song song 5 |
| **7** | Backend + migration + VOffice thật (§10) | Sau khi chốt nghiệp vụ 1–6 |

---

## 14. Kiểm chứng

Bảy mục nền, giữ từ đợt 1:

1. `cd frontend-angular && npx tsc -b --noEmit` — sạch.
2. `npm run test` — không phát sinh fail mới. Baseline có **10 test fail sẵn** ở `nav-items.spec.ts` và `ho-so-detail.spec.ts` (ghi trong `DELIVERY_STATE.md` 2026-08-25).
3. `npm run build` — production build GREEN.
4. **So bằng mắt với thiết kế**: chụp màn và đối chiếu 6 điểm — topbar tối, pill đỏ ở sider, card bo góc, hàng lọc căn phải, cột STT·Thao tác, footer phân trang.
5. Luồng thật end-to-end trên tài khoản `admin@example.com`.
6. **Fail-closed app**: tài khoản không có `hrtools` vào thẳng `/hr/...` phải bị `appChildGuard` đẩy về `/chon-ung-dung`.
7. Hồi quy màu: `/ho-so`, `/nhiem-vu`, `/ma-tran-phe-duyet` không vỡ layout.

Bốn mục bổ sung — đây mới là phần chứng minh nghiệp vụ đúng:

8. **Đối chiếu số với file khách**: nhập BM0 công + BM0 lương tháng 5/2025 từ file thật, chấm lại đúng phân bổ của BM3 dòng 5–9, kiểm tra hệ thống ra **đúng đến từng đồng**. Không có bài này thì mọi báo cáo sau chỉ là số đẹp.
9. **Luật khoá ô**: chấm 1 người vào nhiệm vụ A ngày 05/05, submit; mở nhiệm vụ B cùng người cùng ngày → ô phải xám, tooltip nêu tên nhiệm vụ A.
10. **Công thừa**: người có `congTinhLuong = 21`, chấm 6 ngày cho nhiệm vụ ⇒ hệ thống tự sinh 15 ngày vào "Nhiệm vụ khác / Chi phí quản lý", tổng CPNC phân bổ = 100% CPNC tháng.
11. **Fail-closed cột tiền**: đăng nhập tài khoản PA → màn bảng lương **không render** cột tiền (kiểm tra trong DOM, không chỉ nhìn mắt).

---

## 15. Cập nhật harness state

Theo `CLAUDE.md`, sau khi plan này được duyệt:

- `.harness/state/decisions.md`:
  - **Sửa `P1`** theo kết quả Q1 — hoặc khoá lại theo phương án ①, hoặc bổ sung bằng chứng cho ②. Giữ nguyên trạng thái ĐỀ XUẤT mà không ghi mâu thuẫn với BRD là cách chắc chắn để 3 tháng nữa có người code theo bản sai.
  - **Thêm `P3` (đề xuất)**: công thức CPNC pro-rata 13 khoản mục + quy tắc công thừa (§4.1, §4.3).
  - **Thêm dòng nợ kỹ thuật** kho mẫu thông báo hai nguồn (§9.2 mục 3).
- `.harness/state/DELIVERY_STATE.md`: ghi đợt 1 đã DONE theo bản cũ và **có nợ hiệu chỉnh** §3.
- `.harness/state/active-task.md`: chuyển sang "HR Tools — hiệu chỉnh đợt 1 theo tài liệu khách".
- `CLAUDE.md`: bổ sung `docs/hr_tool/` vào mục *Where to find things* như **nguồn nghiệp vụ chính thức của phân hệ HR Tools**, ngang hàng với `docs/req/`.

# SRS — Definition of Done (checklist rút gọn)

Checklist này dùng để BA **tự chấm nhanh** trước khi gửi SRS đi review (F3), và để reviewer
chấm khi nhận bài. Đây **không phải** bản thay thế cho
[`BA/Ung-dung-AI/0. SRS_Master_Skill.md`](../../BA/Ung-dung-AI/0.%20SRS_Master_Skill.md) (D4)
— chuẩn đầy đủ vẫn ở đó; file này chỉ là danh sách kiểm tra cô đọng, đối chiếu với 4 SRS
Giai đoạn 1 đã viết (nhóm 1 — Thông tin cơ bản, v0.1) để phản ánh đúng thực hành hiện tại,
cộng với 2 điều chỉnh đã được duyệt ở F2 (xem D6 trong `decisions.md`).

Áp dụng từ SRS mới trở đi. **4 SRS nhóm 1 (v0.1) không bắt buộc sửa lại theo checklist này**
— chỉ sửa nếu module đó được nâng version.

> ⚠️ **Cập nhật 2026-08-04 theo D15** — §1.1, §2, §3 và §4 đã được viết lại: mô tả giao diện
> chuyển sang **đánh số hai tầng + 4 khối thành phần**, bảng 8 cột tách thành **4 bộ cột**, sơ đồ
> chuyển từ **mermaid sang draw.io**, và quy ước **mã BR** được thống nhất.
>
> ⚠️ **Cập nhật 2026-08-05 theo D16** (đối chiếu `SAMPLE_TKCT_Kho_v1.0.docx` — mẫu gốc VTS) — §0,
> §1 (mục 5), §2, §3 viết lại thêm một lần: bảng field-level **hợp nhất về 1 bảng 7 cột** (không
> còn tách 5 bộ cột), đánh số lại theo **4 khía cạnh** (`3.X.1` Thông tin chung / `3.X.2` Màn hình
> / `3.X.3` Mô tả chi tiết thành phần / `3.X.4` Luồng nghiệp vụ / `3.X.5` Quy tắc nghiệp vụ) thay
> vì theo từng màn, sơ đồ `.drawio` còn **1/chức năng** (không phải 1/chức năng con), và khung đầu
> trang (Trang ký, Mục lục 7 mục con ở mục 5) được chuẩn hoá. D15 mục 3 (draw.io
> thay mermaid) và mục 4 (mã BR) **không đổi**. Bản mẫu đã điền đầy đủ:
> [`srs-screen-template.md`](srs-screen-template.md) — copy từ đó khi viết màn hình mới.
>
> ⚠️ **Cập nhật 2026-08-05 theo D17** — bỏ **bảng thuộc tính** ("Thuộc tính | Giá trị": Mã hiệu dự
> án/Mã hiệu tài liệu/Phiên bản/Ngày lập) khỏi khung đầu trang — dữ liệu này đã có sẵn trong
> frontmatter YAML (D13), bảng bị trùng lặp và không thêm giá trị cho người đọc. Khung đầu trang từ
> nay chỉ còn: tiêu đề → `## TÀI LIỆU THIẾT KẾ CHI TIẾT (SRS)` → dòng **Phân hệ** → Bảng ghi nhận
> thay đổi → Trang ký → Mục lục.
>
> ⚠️ **Cập nhật 2026-08-05 theo D18** — sơ đồ **§2.2 Giao tiếp module/hệ thống khác** đổi lại từ
> `.drawio` vẽ tay sang **mermaid `flowchart`** (nhúng trực tiếp trong `.md`, không cần file
> `.drawio`/ảnh xuất riêng). Sơ đồ Luồng nghiệp vụ (`3.X.4`, sinh bằng skill) và Máy trạng thái vẫn
> `.drawio` — **không đổi**. §1.1 và §4 dưới đây đã cập nhật theo.

---

## 0. Định dạng & vỏ tài liệu (D12 + D13)

```
☐ File là `.md`, KHÔNG phải `.docx` — AI không sinh .docx/Google Docs (D13). Bản xuất bản chỉ
     được tạo sau khi người dùng duyệt; xem `.harness/workflows/srs-authoring.md` §5
☐ Tên file đúng quy ước D12: `SRS-<MÃ NHÓM>-<NN>-<slug-không-dấu>-v<x.y>.md`
☐ Có frontmatter YAML đủ trường: ma_srs, ten, nhom, version, tac_gia, ngay_tao, trang_thai,
     nhap_cho_vts, oq_lien_quan, blueprint_nguon
☐ (D16, sửa bởi D17) Ngay sau frontmatter, TRƯỚC Mục lục — có khung đầu trang hiển thị cho người
     đọc: tiêu đề + `## TÀI LIỆU THIẾT KẾ CHI TIẾT (SRS)` + dòng **Phân hệ**. **Không có bảng
     thuộc tính** (D17 bỏ — dữ liệu đã có ở frontmatter YAML). Copy nguyên từ
     [`srs-screen-template.md`](srs-screen-template.md) Phần D.1
☐ Có **Bảng ghi nhận thay đổi** và **Trang ký** dưới dạng bảng markdown — Trang ký để trống, ký
     ở D7 bước 2. Trang ký (D16 sửa D7): 4 dòng — Người lập / **Người kiểm tra** (1 dòng gộp,
     thay cho 2× Người xem xét cũ — vai trò review chéo module + BA Lead của D7 không đổi, chỉ
     gộp cách trình bày) / Người phê duyệt / **Đại diện khách hàng** (dòng ký bổ sung, không thay
     thế bước 3 D7 — gửi batch OQ cho VTS/VTIT vẫn giữ nguyên)
☐ Ảnh màn hình nằm trong `img/<mã-srs>/` cạnh file (vd. `img/SRS-QLGD-01/017-hinh-017.png`),
     tham chiếu tương đối bằng `![HÌNH nnn – mô tả](img/<mã-srs>/...)`; không nhúng base64.
     Nguồn ảnh lấy từ `_extracted/.../img/hinh-nnn.png` của blueprint tương ứng — KHÔNG tự vẽ
     lại màn hình. Nếu blueprint không có ảnh cho 1 chức năng, ghi rõ "không có màn hình
     nguồn" thay vì bỏ trống khối `a) Bố cục màn hình`
☐ Nếu còn OQ mức "Cao" đang Mở: nhãn **"Nháp chờ VTS"** + danh sách mã OQ ở ngay đầu tài liệu,
     và `nhap_cho_vts: true` trong frontmatter (D7)
```

Chuyển sang `.md` **không nới lỏng bất kỳ yêu cầu nội dung nào** ở các mục 1–4 dưới đây.

---

## 1. Khung tài liệu (cấp toàn bộ file)

Mọi SRS phải có đủ 6 mục cấp 1, theo đúng thứ tự:

```
☐ 1. GIỚI THIỆU (mục đích, phạm vi, khái niệm/thuật ngữ, tài liệu tham khảo, mô tả tài liệu)
☐ 2. TỔNG QUAN GIẢI PHÁP (tổng quan chức năng, mô hình giao tiếp với module/hệ thống khác —
     mục 2.2 BẮT BUỘC có sơ đồ mermaid `flowchart`, không chỉ bảng — D18, xem mục 1.1 dưới đây)
☐ 3. THIẾT KẾ CHI TIẾT (từng chức năng — xem mục 2 dưới đây)
☐ 4. THIẾT KẾ DÙNG CHUNG VÀ TÁI SỬ DỤNG (viết 1 lần, các chức năng ở mục 3 tham chiếu lại —
     không lặp lại quy tắc chung trong từng chức năng)
☐ 5. THIẾT KẾ ĐẢM BẢO TUÂN THỦ TIÊU CHUẨN QUẢN TRỊ DỮ LIỆU — BẮT BUỘC cho mọi SRS. Đủ **7 mục
     con** (D16 sửa D6 — thêm 5.6, 5.7 vào cuối, giữ nguyên thứ tự 5.1–5.5 đã có trong khung đầu
     trang chuẩn):
     5.1 Chất lượng dữ liệu · 5.2 Lịch sử và khả năng truy vết · 5.3 Phân quyền và kiểm soát
     truy cập · 5.4 Vòng đời và lưu trữ dữ liệu · 5.5 Dữ liệu cá nhân · 5.6 Quản trị dữ liệu ·
     5.7 Kiến trúc & tích hợp dữ liệu
☐ 6. PHỤ LỤC — 4 mục con theo khung đầu trang chuẩn (D16):
     6.1 Mẫu tệp nhập và xuất dữ liệu · 6.2 Đề xuất bổ sung thiết kế cơ sở dữ liệu ·
     6.3 Danh mục điểm chờ xác nhận (**bảng OQ đầy đủ — xem §1.2 dưới đây**) ·
     6.4 Phụ thuộc module/dữ liệu khác (đối chiếu `.harness/state/module-dependency-matrix.md`,
     D11 — thực thể/API tham chiếu sang module khác + trạng thái module sở hữu)
```

Nếu module có quy trình nghiệp vụ xuyên nhiều chức năng (vd. đồng bộ SAP → xử lý trong DMS),
thêm mục `3.X.0 Quy trình nghiệp vụ tổng thể` mô tả luồng end-to-end trước khi vào từng chức
năng riêng lẻ.

### 1.1 Sơ đồ bắt buộc — **draw.io, trừ §2.2 dùng mermaid** (D15, dòng §2.2 sửa bởi D18)

Bổ sung sau phản hồi review `SRS-QLGD-01` (2026-08-04), **viết lại theo D15 cùng ngày** sau khi
một BA khác review `SRS-QLGD-02` yêu cầu *"chỉnh lại sơ đồ như trong tài liệu mẫu — chức năng
hình chữ nhật, các đường nối thẳng"*. Mermaid không chiều được yêu cầu đó cho sơ đồ luồng/máy
trạng thái. Riêng sơ đồ §2.2 (đơn giản hơn — vài node, không bước/rẽ nhánh), D18 (2026-08-05) đổi
lại thành mermaid sau khi người dùng xác nhận trên bản pilot `SRS-QLGD-03 v0.3`.

```
☐ 2.2 Mô hình giao tiếp với module/hệ thống khác — sơ đồ mermaid `flowchart` NHÚNG TRỰC TIẾP
     trong `.md` (D18; node trung tâm = module đang viết, mũi tên có nhãn chiều dữ liệu
     Tiêu thụ/Ghi/Song song/Nền), KHÔNG chỉ dừng ở bảng liệt kê, KHÔNG cần file `.drawio` riêng
☐ 3.X.0 Quy trình nghiệp vụ tổng thể (nếu có) — sơ đồ `.drawio` VẼ TAY tổng hợp các luồng con
     thành 1 pipeline duy nhất, CỘNG VỚI nhúng ảnh sơ đồ luồng gốc của blueprint (nếu có, lấy
     từ `_extracted/.../img/`) ngay dưới bảng liệt kê luồng
☐ Nếu module có máy trạng thái (luồng duyệt, vòng đời chứng từ...) — BẮT BUỘC 1 sơ đồ `.drawio`
     VẼ TAY cho mỗi bộ trạng thái độc lập (vd. trạng thái chứng từ ≠ trạng thái quy trình cấu
     hình), đặt ngay trước bảng mô tả chuyển trạng thái
☐ Luồng nghiệp vụ của TỪNG CHỨC NĂNG (`3.X`, D16 — không phải từng màn `3.X.3.k`) — 1 sơ đồ
     `.drawio` SINH BẰNG SKILL `srs-to-drawio-flows`, mức `medium` là mặc định cho bàn giao SRS
```

**Hai loại vẽ tay (`3.X.0`, máy trạng thái) phải bám đúng màu và kiểu nét của**
`.claude/skills/srs-to-drawio-flows/assets/template.drawio` — nếu không, tài liệu lộ ra hai phong
cách sơ đồ draw.io. Skill **chỉ** sinh được loại thứ ba (luồng theo chức năng), không sinh 2 loại
kia. Sơ đồ §2.2 (mermaid, D18) không thuộc bộ style draw.io này.

**Quy ước lưu và nhúng**:

```
☐ File .drawio nguồn nằm trong `drawio/` CẠNH file SRS — sửa được, diff được theo dòng
☐ Ảnh .png xuất ra `img/<mã-srs>/` và nhúng vào .md bằng `![...](...)`
☐ Lệnh xuất: xem `workflows/srs-authoring.md` §"Vẽ sơ đồ". LƯU Ý `-p` đếm TỪ 1, và không có `-p`
     thì draw.io lặng lẽ xuất trang Template chứ không phải sơ đồ mình cần
```

Quy tắc chung cho sơ đồ: nếu sơ đồ là **tổng hợp/diễn giải của SRS** (không phải chép nguyên
văn 1 hình trong blueprint), phải ghi rõ ngay dưới sơ đồ *"không phải hình gốc blueprint"* để
người đọc không nhầm là bằng chứng trích dẫn — theo đúng tinh thần "mọi phát hiện có neo, diễn
giải tách riêng" của `blueprint-review.md`.

### 1.2 Bảng OQ đầy đủ ở PHỤ LỤC (mục `6.3`)

Bổ sung sau phản hồi review `SRS-QLGD-01` (2026-08-04) — bản trước chỉ tóm tắt số lượng OQ theo
loại (chặn/không chặn) và trỏ link sang tracker, không liệt kê nội dung; không đủ để VTS đọc và
trả lời ngay trên SRS. **Mục đổi từ `6.5` sang `6.3`** theo khung đầu trang chuẩn D16 — nội dung
yêu cầu không đổi.

```
☐ Mục `6.3 Danh mục điểm chờ xác nhận` là BẢNG ĐẦY ĐỦ, không phải tóm tắt/link-only — đủ cột
     Mã · Câu hỏi · Ưu tiên · Chặn? · Phản hồi VTS · Nguồn/Ghi chú
☐ Nội dung cột "Câu hỏi" CHÉP NGUYÊN VĂN từ khối E tương ứng trong `BA/OQ-TRACKER.md` — không diễn
     giải lại, không rút gọn làm mất trích dẫn `¶số`/`Bảng N`/`HÌNH nnn`. Nếu 2 bản lệch nhau,
     tracker là nguồn thắng (ghi rõ 1 câu ngay trên bảng, như `SRS-QLGD-01` đã làm)
☐ Cột **Phản hồi VTS** để trống trong bản nháp — đây là chỗ VTS điền trực tiếp khi đọc SRS, không
     phải chỗ BA tự suy diễn câu trả lời
☐ Sau khi VTS điền: đồng bộ ngược nội dung đó vào `OQ-TRACKER.md` (cột "Phản hồi VTS" ở khối E
     tương ứng) VÀ đổi `Trạng thái: Mở → Đã trả lời` (D9.2) — không chỉ cập nhật một chiều trong SRS
☐ Mã OQ trong bảng khớp đúng danh sách `oq_lien_quan` ở frontmatter — không thiếu, không thừa
```

---

## 2. Mỗi chức năng (mục `3.X`) — đánh số theo 4 khía cạnh (D16 sửa D15)

Đánh số liên tục — **không nhảy số** (đã gặp lỗi nhảy số ở 1 SRS cũ, kiểm kỹ trước khi gửi):

```
☐ 3.X.1 Thông tin chung chức năng — Tác nhân / Ý nghĩa chức năng / Nền tảng / Đường dẫn truy
     cập / Ràng buộc-ngoại lệ. Viết MỘT lần cho cả chức năng, không lặp ở từng màn
☐ 3.X.2 Màn hình — bảng mục lục: STT · Tên màn hình · Mô tả tại mục · Ảnh
☐ 3.X.3 Mô tả chi tiết các thành phần — mỗi màn 1 mục con `3.X.3.k` (k = 1, 2, 3…)
☐ 3.X.4 Luồng nghiệp vụ — 1 sơ đồ `.drawio`/chức năng + bảng `Bước│Mô tả` theo kịch bản
☐ 3.X.5 Quy tắc nghiệp vụ — mục con CUỐI CÙNG (xem §3bis dưới đây)
```

**Ba màn mặc định trong `3.X.3`**: Xem danh sách · Tạo mới · Chỉnh sửa. Thiếu một trong ba →
**phải ghi rõ lý do** ở `3.X.2`, không im lặng bỏ qua.

```
☐ ❌ KHÔNG gộp Tạo mới (3.X.3.2) với Chỉnh sửa (3.X.3.3) vào một mục — đây chính là lỗi đã bị BA
     review trả lại tài liệu `SRS-QLGD-02`. Gộp là mất thông tin "trường nào được phép sửa"
```

### 2.1 Bên trong mỗi màn (`3.X.3.k`) — 1 bảng 7 cột, dòng nhóm in đậm làm hàng (D16)

```
☐ Nhúng ảnh thật `![HÌNH nnn – mô tả](img/<mã-srs>/...)` ngay đầu mục, cho MỌI mã `HÌNH nnn`
     được trích dẫn. Chỉ mô tả bằng chữ mà không nhúng ảnh KHÔNG đạt DoD — kể cả khi ảnh "chưa
     soi" (chưa phân tích sâu ở BRN), vẫn phải nhúng, chỉ cần ghi chú "chưa soi ảnh"
☐ MỘT bảng duy nhất theo bộ cột ở §3 dưới đây — KHÔNG tách 5 bảng riêng theo loại khối
☐ Dòng nhóm (`**Điều kiện tìm kiếm**`, `**Thao tác**`, `**Datagrid**`, `**<Tên khối nhập
     liệu>**`…) là MỘT HÀNG trong bảng, không phải heading Markdown riêng
☐ Màn danh sách: có dòng nhóm `**Điều kiện tìm kiếm**` (kiểu so khớp Chứa/Bằng bắt buộc trong
     Mô tả) và dòng nhóm `**Datagrid**` (nội dung dòng nhóm PHẢI có "Sort theo …", "Phân trang
     theo quy định chung")
☐ Màn Tạo mới / Chỉnh sửa: trường bắt buộc đánh dấu `*` ngay sau tên, KHÔNG tách cột "Bắt buộc"
     riêng (đúng quy ước mẫu gốc VTS)
```

Dòng nhóm nào màn hình không có thì **bỏ dòng nhóm đó**, không viết "không áp dụng" cho có.

### 2.2 Luồng nghiệp vụ (`3.X.4`) — bảng `Bước│Mô tả` theo kịch bản (D16 sửa D15)

**Không viết văn xuôi** (kể cả khi đối chiếu mẫu gốc VTS dùng văn xuôi) — giữ bảng 2 cột `Bước│
Mô tả`, tách theo kịch bản A/B/C…, đúng mẫu ở `srs-screen-template.md` Phần A/B:

```
☐ A. Xem danh sách & tìm kiếm — các bước từ lúc vào màn tới lúc hiển thị/tìm kiếm xong
☐ B. Tạo mới / Chỉnh sửa — có bước **kiểm tra trùng trong CƠ SỞ DỮ LIỆU**: ghi rõ tổ hợp trường
     nào là khoá nhận diện + câu báo lỗi nguyên văn. Chỉ kiểm ở giao diện rồi gọi lệnh lưu là
     KHÔNG đạt. Có bước thông báo thành công (toast) nguyên văn
☐ C. Ngưng/Mở lại (hoặc Xoá) — ghi rõ **điều kiện được phép thực hiện** (trạng thái nào, đã
     phát sinh dữ liệu liên quan thì xử lý ra sao) + xoá vật lý hay chỉ chuyển trạng thái. Đủ
     nhánh 1 dòng / nhiều dòng, thành công / thất bại, kèm nguyên văn dialog/toast
```

### 2.3 Mục thêm khi có

```
☐ Bảng hành động theo trạng thái — BẮT BUỘC nếu chức năng có luồng duyệt/trạng thái nhiều bước
     (đề xuất, phê duyệt, kích hoạt/ngưng...). Là mục RIÊNG, **không dùng chung số** với bảng
     Quy tắc nghiệp vụ (D9 mục 3, sửa bởi D15) — khi có mục này, nó chèn TRƯỚC Quy tắc nghiệp
     vụ (thành `3.X.5`), đẩy Quy tắc nghiệp vụ xuống `3.X.6`; Quy tắc nghiệp vụ luôn là mục con
     CUỐI CÙNG bất kể số thứ tự cụ thể là bao nhiêu
☐ Tích hợp hệ thống ngoài — CHỈ khi có trường lấy dữ liệu từ hệ thống ngoài qua đồng bộ (vd.
     SAP). Nội dung bắt buộc: xem SRS_Master_Skill.md §2.3.6
```

---

## 3. Một bảng field-level 7 cột (D16 — thay 5 bộ cột của D15)

D15 tách 5 bộ cột khác nhau theo loại khối (tìm kiếm/lọc/lưới/trường/nút). Đối chiếu
`SAMPLE_TKCT_Kho_v1.0.docx` (mẫu gốc VTS, `Bảng 5/6/7`) cho thấy VTS dùng **một bảng duy nhất**
cho mọi khối, phân biệt bằng dòng nhóm in đậm. D16 hợp nhất lại theo đúng mẫu gốc. 4 SRS nhóm 1
cũ (6 cột) và 3 SRS Nhóm 3 (D15, 5 bộ cột) giữ nguyên tới khi nâng version.

```
☐ STT · Tên · Kiểu dữ liệu [Độ dài dữ liệu] · Input/Output · Giá trị khởi tạo ·
     Mô tả (Mapping với CSDL nếu có) · Ghi chú — DUY NHẤT một bảng cho cả màn, KHÔNG tách
     riêng bảng cho thanh tìm kiếm/bộ lọc/lưới/trường form/nhóm nút
```

**Cột `Ghi chú` là cột CUỐI (thứ 7) của mọi bảng.** Neo `[¶xxx]`, nhãn `[GIẢ ĐỊNH]`/`[CẦN XÁC
NHẬN]`, mã `OQ` **dồn hết vào đó** — không trộn vào cột Mô tả. Trong đoạn văn: khối `> **Ghi
chú**` ở cuối đoạn. **Nghĩa vụ gắn mã `OQ` thật trong `BA/OQ-TRACKER.md` (D7.1/D14) KHÔNG đổi.**

### 3.1 Dòng nhóm `**Điều kiện tìm kiếm**` (màn danh sách)

Gộp cả tiêu chí tìm kiếm và bộ lọc — mẫu gốc VTS không tách hai khái niệm này.

```
☐ Trường kiểu Textbox: cột Mô tả BẮT BUỘC ghi kiểu so khớp `Chứa` hay `Bằng` + có/không phân
     biệt hoa thường, có/không dấu; ghi rõ tìm kiếm chạy khi bấm nút hay tự động khi gõ
☐ Trường kiểu Combobox: cột "Kiểu dữ liệu" ghi rõ MultiSelect (chọn nhiều) hay không (chọn 1);
     cột Mô tả có tập giá trị + NGUỒN lấy (danh mục/phân hệ nào), phụ thuộc trường khác nếu có
☐ Hai dòng cuối nhóm luôn là nút **Thiết lập lại** và **Tìm kiếm**
```

### 3.2 Dòng nhóm `**Thao tác**` (nhóm nút chức năng)

```
☐ MỌI nút nhìn thấy trên ảnh màn hình đều có 1 dòng — kể cả Tìm kiếm, Thiết lập lại, Đóng, Quay
     lại. Thiếu nút là KHÔNG đạt DoD (lỗi đã bị BA review bắt ở `SRS-QLGD-02`)
☐ Có thể xuất hiện NHIỀU dòng nhóm `**Thao tác**` trong cùng 1 bảng (vd. nhóm nút đầu màn +
     nhóm nút trên từng dòng của lưới) — đúng quy ước mẫu gốc, không phải lỗi trùng heading
☐ Cột Mô tả cụ thể theo trạng thái/quyền hiển thị — KHÔNG ghi chung chung "theo phân quyền"
```

### 3.3 Dòng nhóm `**Datagrid**` (màn danh sách)

```
☐ Nội dung của CHÍNH dòng nhóm (không phải dòng con) phải nêu: nguồn load danh sách, bảng CSDL
     nguồn, **THỨ TỰ SẮP XẾP MẶC ĐỊNH** (trường nào, ASC/DESC), quy định phân trang — thiếu là
     không đạt
☐ Cột lưu MÃ trong CSDL nhưng hiển thị CHỮ → ghi ánh xạ từng giá trị (vd. `1` → "Hoạt động")
☐ Định dạng hiển thị (ngày tháng, tiền tệ, `#,##0`), ghép chuỗi ("Mã - Tên"), điều kiện hiển thị
```

### 3.4 Dòng nhóm khối nhập liệu (màn Tạo mới / Chỉnh sửa)

```
☐ Trường bắt buộc đánh dấu `*` ngay sau tên — KHÔNG tách cột "Bắt buộc" riêng (đúng mẫu gốc)
☐ "Giá trị khởi tạo": Tạo mới ghi "Blank" nếu trống; Chỉnh sửa ghi "(nạp từ bản ghi)"
☐ Mô tả có: gợi ý nhập, định dạng, độ dài/giá trị min-max, kiểm tra trùng + câu báo lỗi,
     điều kiện cho sửa hay chỉ đọc (Disable), nguồn dữ liệu nếu là danh sách chọn, và luôn kết
     bằng "Lưu vào bảng `BẢNG.CỘT`"
☐ Màn Chỉnh sửa là bảng RIÊNG với Tạo mới (`3.X.3.3` ≠ `3.X.3.2`) — không dùng kiểu "chỉ nêu
     khác biệt" nữa, viết đủ như mẫu gốc vì đây vốn đã là bảng tách rời, không có rủi ro gộp nhầm
```

### 3.6 Không còn cột `Mapping API`

```
☐ Phần mô tả màn hình CHỈ nói tới cơ sở dữ liệu (`Mapping DB`)
☐ API chỉ được mô tả ở mục riêng "Tích hợp hệ thống ngoài", và chỉ khi trường lấy dữ liệu từ
     hệ thống ngoài qua đồng bộ (vd. SAP) — xem mục 2.3 trên đây
```

---

## 3bis. Bảng Quy tắc nghiệp vụ (mục `3.X.5`) — D15, số mục sửa bởi D16

Trước D15 có **4 quy ước BR song song** trong cùng bộ tài liệu. Từ nay chỉ một:

```
☐ Bảng 4 cột: Mã · Quy tắc · Áp dụng cho · Trạng thái
☐ Đặt ở CẤP CHỨC NĂNG `3.X`, là mục con cuối cùng (`3.X.5`, xem §2.3 nếu có Bảng hành động
     theo trạng thái chen trước) — KHÔNG đẩy xuống cuối tài liệu
☐ Mã: `BR-<MÃ SRS bỏ dấu gạch>-<số nghiệp vụ 2 chữ số>-<số thứ tự 2 chữ số>`
     ví dụ `BR-QLGD02-04-01`
☐ BR dùng chung nhiều nghiệp vụ: thay số nghiệp vụ bằng chữ `C` → `BR-QLGD01-C-03`
☐ Cột "Áp dụng cho": liệt kê màn chịu quy tắc, tham chiếu đúng mục `3.X.3.k`
     (vd. "Tạo mới (3.4.3.2), Chỉnh sửa (3.4.3.3)")
☐ Cột "Trạng thái": `Chốt` kèm neo, HOẶC `[GIẢ ĐỊNH]`/`[CẦN XÁC NHẬN]` kèm mã OQ. Không để trống
☐ BR dùng chung CHỈ tóm tắt 1 dòng + dẫn chiếu mục 4 — KHÔNG chép nội dung đầy đủ vào 3.X
```

---

## 4. Trước khi gửi review — chấm nhanh

```
☐ Đủ sơ đồ bắt buộc theo §1.1 — 1 sơ đồ mermaid `flowchart` **cho §2.2** (D18) + 2 loại vẽ tay
     `.drawio` (quy trình tổng thể, máy trạng thái nếu có) + 1 sơ đồ luồng **cho mỗi chức năng**
     (D16 — không phải mỗi màn) sinh bằng skill. Kiểm bằng `grep -c '```mermaid'`: phải ra
     **đúng 1** (chỉ ở §2.2) — nếu ra 0 thì thiếu sơ đồ §2.2, nếu >1 thì có chỗ dùng mermaid sai
     nơi lẽ ra phải là `.drawio`
☐ Ảnh sơ đồ xuất ra đúng trang: nhắc lại cái bẫy ở §1.1 — không truyền `-p` thì draw.io lặng lẽ
     xuất trang Template và lệnh vẫn báo thành công
☐ Mọi mã `HÌNH nnn` trích dẫn trong tài liệu đã có ảnh nhúng tương ứng — chạy
     `grep -o 'HÌNH [0-9]\{3\}'` rồi đối chiếu với danh sách `![...]( img/...)` để không sót
☐ Mã BR đúng dạng chuẩn — chạy và phải ra rỗng:
     `grep -ohE "BR-[A-Za-z0-9-]+" <file> | grep -vE "^BR-<MÃSRS>-(C|[0-9]{2})-[0-9]{2}$" | sort -u`
☐ Mọi nút nhìn thấy trên ảnh màn hình đều có 1 dòng trong dòng nhóm `**Thao tác**` (§3.2)
☐ Không còn màn nào gộp Tạo mới (`3.X.3.2`) với Chỉnh sửa (`3.X.3.3`) vào một bảng (§2)
☐ Mẫu file nhập/xuất: VTS chưa gửi thì TỰ ĐỀ XUẤT trong mục 6.1, không để trống chờ (D15)
☐ Mục 6.3 là bảng OQ đầy đủ theo §1.2 (không phải tóm tắt/link-only), số dòng khớp số mã trong
     `oq_lien_quan`, cột Phản hồi VTS còn trống ở bản nháp
☐ Trang ký đúng khung D16: 1 dòng Người kiểm tra (không phải 2), có dòng Đại diện khách hàng
☐ Mục 5 đủ 7 mục con `5.1`–`5.7` (D16 — không phải 6 mục con của D6 gốc)
☐ Tiêu đề tài liệu đúng tên phân hệ (đã từng gặp lỗi copy nhầm tiêu đề từ file khác — kiểm
     tra kỹ khi tạo SRS mới từ template của SRS trước)
☐ Đối chiếu ngược với blueprint VTS nguồn tương ứng — không thiếu chức năng nào trong blueprint
☐ Áp dụng "6. CHECKLIST TRƯỚC KHI HOÀN TẤT" trong SRS_Master_Skill.md (Màn hình Danh sách /
     Form Thêm mới) cho từng chức năng có màn hình tương ứng
☐ Không còn ô trống mơ hồ ("tuỳ chọn", "linh hoạt") — theo quy tắc văn phong §5 của
     SRS_Master_Skill.md, mọi thông số phải cụ thể (số, ngày, tên trạng thái)
☐ Các câu hỏi mở phát sinh khi viết đã được ghi vào `BA/OQ-TRACKER.md` (mã OQ-xxx; D14 —
  **không** ghi vào `SRS-Open-Question-VTIT.xlsx`, file đó đã đóng băng làm di sản),
     không để ngầm định trong tài liệu mà không đánh dấu
☐ Đối chiếu `.harness/state/module-dependency-matrix.md` (D11): mọi thực thể/API tham chiếu
     sang module khác đã được liệt kê đúng dòng trong matrix VÀ trong mục `6.4` của tài liệu
     (D16); nếu module sở hữu thực thể đó chưa viết/chưa review, gắn nhãn rõ trong tài liệu
     (giống cách dùng "Nháp chờ VTS" ở D7) thay vì giả định ngầm định nghĩa đã ổn định
☐ Mỗi OQ đã có sẵn: đã kiểm cột "Phản hồi VTS" — có phản hồi thì đã cập nhật nội dung SRS
     theo phản hồi VÀ đổi trạng thái `Mở → Đã trả lời` (D9.2), không chỉ gắn mã một chiều
☐ Đã chạy skill `ba-doc-review` với đúng 5 nhóm check thu hẹp (D9 + D11) — xem
     `review-policy.md`; KHÔNG dùng INVEST / MoSCoW / AC Given-When-Then
☐ Đã cập nhật `trang_thai` trong frontmatter thành `Chờ review`
```

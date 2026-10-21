# Workflow: Review một Blueprint VTS

> **QTKHCN path overlay (2026-08-05):** `BA/...` → `docs/ba/...`. Blueprint nguồn đặt dưới
> `docs/ba/Blueprint Review/` (hoặc thư mục nguồn đã chỉ định trong task). Công cụ trích:
> `tools/blueprint-extract/`, `tools/document-reader/`. Quyết định liên quan: **D23–D27**.

Quy trình chuẩn để **rà soát một blueprint trước khi viết SRS từ nó**, và ghi
lại phát hiện dưới dạng **Blueprint Review Note (BRN)** có neo truy vết kiểm chứng được.

Đây là bước **đứng trước** [`srs-authoring.md`](srs-authoring.md) §1. Blueprint là đầu vào duy
nhất của SRS; sai ở đây thì sai toàn bộ phần hạ nguồn, và phát hiện muộn thì mất một vòng
phản hồi VTS — vòng phản hồi mới là đường găng tới mốc 30/10/2026, không phải tốc độ gõ.

Quyết định ràng buộc: **D2** (mốc cứng), **D7** (OQ), **D11** (phụ thuộc liên module),
**D13** (`.md`-first).

> ⚠️ **Trạng thái**: quy trình này đã được người dùng duyệt về cấu trúc đầu ra và cách cài
> công cụ (2026-08-03). Mã quyết định **D14** cho giai đoạn review blueprint **chưa được
> khoá** — chưa ghi vào `decisions.md`. Xem §9.

---

## 0. Vì sao cần một quy trình riêng, thay vì "đọc kỹ"

Ba loại lỗi dưới đây **không** lộ ra khi đọc tuần tự một tài liệu, dù đọc kỹ đến đâu:

| Loại | Ví dụ | Chỉ lộ ra khi |
|---|---|---|
| Thiếu tính đóng | Trạng thái "Chờ duyệt lại" có đường vào nhưng không có đường ra | Liệt kê **toàn bộ** trạng thái thành bảng rồi soi |
| Chữ ≠ hình | Sơ đồ có nhánh "Từ chối một phần", phần mô tả các bước không nhắc | Soi **từng cặp** ảnh–đoạn văn quanh nó |
| Xung đột liên tài liệu | Đơn mua hàng cho nhận lệch số lượng, Tồn kho buộc nhận đủ | Có **≥2** sổ đăng ký đặt cạnh nhau |

Nên trình tự bắt buộc là: **trích → lập sổ → chạy phép đóng → đối chiếu chéo**, không phải
"đọc rồi ghi chú".

---

## 1. Ba nguồn độc lập — luôn đối chiếu tay ba

Điểm mạnh lớn nhất của dự án này: cùng một nghiệp vụ được mô tả bởi **ba nguồn độc lập nhau**.
Mâu thuẫn giữa chúng chính là phát hiện có giá trị nhất.

| # | Nguồn | Ở đâu | Đại diện cho |
|---|---|---|---|
| A | **Blueprint VTS** | `BA/DS Blueprint VTS gửi/` | Phía nhà cung cấp — cái VTS định làm |
| B | **HLD + yêu cầu THFC** | `BA/Business Flow/HLD-01..05*.md` | Phía khách hàng — cái THFC yêu cầu (987 yêu cầu `ND0001–ND0987` + Hồ sơ mời thầu) |
| C | **Mô hình dữ liệu nền tảng** | `BA/Thiết kế CSDL/` (`DBD-*.md`, `*_mermaid/*.mmd`) | Cái nền tảng GPMN **thực sự** đang có |

Ý nghĩa của từng cặp lệch:

- **A ≠ B** → blueprint chưa phủ hết yêu cầu khách, hoặc hiểu sai yêu cầu → mã `GAP`.
- **A ≠ C** → blueprint mô tả thứ nền tảng chưa có → rủi ro tuỳ biến/chi phí → mã `HOI`.
- **B ≠ C** → yêu cầu khách vượt nền tảng → rủi ro phạm vi → nêu ở mục "Rủi ro" của BRN.

Mỗi HLD có sẵn mục **"0.1 Bảng giả định chính"** với cột *Ảnh hưởng nếu sai* — đọc bảng này
trước; nó đã chỉ sẵn chỗ mỏng. Ví dụ HLD-03 A04 giả định không có FEFO cứng mà kiểm soát theo
ngưỡng % HSD; nếu blueprint Tồn kho nói khác thì đó là một `XD` rõ ràng.

---

## 2. Trích xuất

```bash
# Windows / Git Bash — PYTHONIOENCODING bắt buộc, nếu không sẽ lỗi cp1252 khi in tiếng Việt
PYTHONIOENCODING=utf-8 ./.venv/Scripts/python.exe tools/blueprint-extract/extract.py \
  "BA/DS Blueprint VTS gửi/3. Quản lý giao dịch/Quản lý Hàng Tồn Kho NPP (Inventory Management)"
```

Đích mặc định: `BA/Blueprint Review/_extracted/<slug>/`, gồm

| File | Dùng để |
|---|---|
| `noi-dung.md` | Toàn văn có `¶số` / `§mục` / `Bảng N` / `[HÌNH nnn]` — nguồn trích dẫn |
| `muc-luc.md` | Chỉ cây heading — **đối chiếu độ phủ chức năng** ở §4 và ở `srs-authoring.md` §4.2 |
| `img/hinh-NNN.png` | Ảnh tách rời, đánh số theo thứ tự xuất hiện — để xem trực tiếp |

**Công cụ đúng cho từng định dạng** (đã kiểm chứng trên bộ blueprint thật):

- `.DOC` của VTS **thực chất là zip/OOXML** (magic `504b0304`) → `python-docx` đọc được hết,
  không cần convert. Đã thử cả 8 file `.DOC`, không file nào lỗi.
- **Không có PDF nào** trong cây blueprint → **không dùng `pymupdf4llm`** ở đây. Nó chỉ dùng cho
  hai PDF `TKCSDL_GPMN_*` trong `BA/Thiết kế CSDL/` (và hai file đó đã có sẵn bản `.mmd`).
- **Không OCR ảnh.** Agent xem ảnh trực tiếp bằng công cụ `Read`. OCR chỉ rút được chữ, trong
  khi thứ cần bắt là *"sơ đồ có nhánh mà chữ không mô tả"* — OCR mù với việc đó.
- Excel: `openpyxl` (`.xlsx`/`.xlsm`), `xlrd<2.0` (`.xls` nhị phân cũ).

Nếu `.venv` thiếu gói:
`./.venv/Scripts/python.exe -m pip install python-docx openpyxl "xlrd<2.0"`

---

## 3. Neo truy vết — **bắt buộc, không có ngoại lệ**

Mọi phát hiện phải dẫn được về đúng chỗ trong blueprint gốc để người khác kiểm chứng độc lập
mà không cần tin agent. Định dạng neo:

```
[<MÃ-TÀI-LIỆU> §<mục> ¶<số đoạn>] "nguyên văn trích"
```

Ba thành phần, mỗi thành phần kiểm chứng được một cách:

| Thành phần | Nguồn | Cách người đọc kiểm |
|---|---|---|
| `§3.1.1.2` | Cây heading. Tiền tố `~` = **số do script sinh** (blueprint dùng auto-number của Word nên số không nằm trong text); không có `~` = số blueprint tự ghi | So với cây mục lục trong Word |
| `¶214` | Chỉ số đoạn theo thứ tự tài liệu, nhúng sẵn trong `noi-dung.md` | Mở `noi-dung.md`, nhảy tới `¶214`, thấy ngữ cảnh trước sau |
| `"nguyên văn"` | Chép nguyên, không diễn giải | **Ctrl+F chuỗi này trong file `.DOC` gốc** |

Biến thể:

| Đối tượng | Neo | Ví dụ |
|---|---|---|
| Đoạn văn | `§mục ¶số` | `[TONKHO §~3.2.1 ¶214]` |
| Ô trong bảng | `Bảng N · dN · cột "…"` | `[TONKHO Bảng 7 · d4 · cột "Trạng thái"]` |
| Ảnh | `HÌNH nnn` + đường dẫn ảnh đã tách | `[TONKHO HÌNH 047 → _extracted/…/img/hinh-047.png]` |
| Ô Excel | `#Sheet · dN · cột "…"` | `[RPO-ALL#Tham so · d12 · cột "Hệ số"]` |
| HLD (nguồn B) | file + mã yêu cầu | `[HLD-03 A04 / ND0309]` |

**Nguyên tắc**: trích dẫn không có nguyên văn thì không tính là phát hiện — nó là ý kiến.
Diễn giải ("blueprint có vẻ ngụ ý…") phải tách khỏi trích dẫn và ghi rõ là diễn giải.

---

## 4. Năm sổ đăng ký

Lập cho **từng phân hệ**, từ `noi-dung.md`. Đây là bước cơ học, không suy luận — mục đích là
biến văn bản trải dài thành bảng để chỗ khuyết tự lộ ra.

| # | Sổ | Ghi gì | Cột tối thiểu |
|---|---|---|---|
| S1 | **Trạng thái** | Mọi trạng thái của mọi đối tượng nghiệp vụ | Đối tượng · Trạng thái · Vào từ · Ra tới · Ai chuyển · Điều kiện · Neo |
| S2 | **Trường dữ liệu** | Mọi trường xuất hiện trên màn hình / bảng đặc tả / file Excel | Màn hình · Trường · Kiểu · Bắt buộc? · Nguồn giá trị · Neo |
| S3 | **Vai trò & quyền** | Mọi actor và thao tác được phép | Vai trò · Chức năng · Thao tác (C/R/U/D/Duyệt) · Neo |
| S4 | **Quy tắc & công thức** | Mọi rule, công thức, ngưỡng, tham số cấu hình | Mã rule · Phát biểu · Tham số · Đơn vị · Ai cấu hình · Neo |
| S5 | **Thông báo** | Mọi message / cảnh báo / lỗi | Mã · Nội dung · Điều kiện kích hoạt · Màn hình · Neo |

Sổ nằm trong chính file BRN, mục 2. Không tách file riêng — chúng chỉ có giá trị khi đọc
cạnh phát hiện.

---

## 5. Năm phép đóng

Mỗi sổ có một tính chất "đóng"; vi phạm tính chất đó **là** một khiếm khuyết, không cần tranh
luận về khẩu vị. Chạy lần lượt:

| # | Phép đóng | Vi phạm = phát hiện |
|---|---|---|
| Đ1 | **Đóng trạng thái** — mọi trạng thái có ≥1 đường vào và ≥1 đường ra (trừ khởi tạo/kết thúc, phải nói rõ là khởi tạo/kết thúc) | Trạng thái cụt, trạng thái mồ côi, chuyển trạng thái nêu ở luồng nhưng không có trong bảng trạng thái |
| Đ2 | **Đóng trường** — mọi trường trên ảnh màn hình có trong bảng đặc tả **và ngược lại**; mọi cột trong file Excel import khớp một trường hoặc được nói rõ là chỉ dùng để import | Trường xuất hiện trên UI mà không có đặc tả (dev tự đoán), cột Excel không ai nhận |
| Đ3 | **Đóng vai trò** — mọi vai trò khai ở §phạm vi xuất hiện trong ≥1 luồng; mọi bước luồng nêu rõ ai thực hiện | Vai trò khai rồi bỏ quên; bước không có chủ thể |
| Đ4 | **Đóng quy tắc** — mọi tham số trong công thức được định nghĩa ở đâu đó, có đơn vị, có nguồn giá trị và người cấu hình; mọi ngưỡng nêu rõ áp cho ai | Công thức dùng biến chưa định nghĩa; ngưỡng không đơn vị; "theo cấu hình" mà không nói cấu hình ở đâu |
| Đ5 | **Đóng thông báo** — mọi nhánh lỗi/từ chối trong luồng có thông báo tương ứng; mọi thông báo gắn với một điều kiện kích hoạt | Nhánh lỗi câm; thông báo không rõ khi nào bắn |

Ghi kết quả từng phép đóng vào mục 3 của BRN, **kể cả khi đạt** — "Đ3 đạt" cũng là thông tin,
nó cho biết phép đã chạy.

---

## 6. Đối chiếu chữ ↔ hình

Đây là phần đắt nhất và cũng là phần bắt được lỗi mà không cách nào khác bắt được. Với mỗi ảnh,
xem ảnh rồi đọc đoạn văn ngay trước/sau nó, kiểm 4 điều:

1. **Nhánh thừa/thiếu** — sơ đồ có nhánh mà phần "Mô tả các bước" không nhắc, hoặc ngược lại.
2. **Lệch nhãn** — tên trạng thái/nút trên hình khác tên trong bảng đặc tả (`Chờ duyệt` vs
   `Chờ phê duyệt` là hai thứ khác nhau đối với dev).
3. **Trường ẩn** — ảnh màn hình có ô nhập/cột mà bảng field-level không liệt kê.
4. **Ảnh lạc phiên bản** — watermark, tên hệ thống cũ, số version trên ảnh khác version tài
   liệu, hoặc ảnh chụp từ hệ thống khác.

### 6.1 Xử lý khoảng trống khi viết SRS (D16) — hợp nguồn, không lấy giao

§6 ở trên dạy cách **phát hiện** lệch chữ↔hình. Khi đã phát hiện xong và tới lúc **viết SRS**,
áp dụng nguyên tắc **hợp cả hai nguồn (union)**, không lấy giao — không được bỏ sót một tính năng
chỉ vì nó chỉ xuất hiện ở một trong hai nguồn:

1. **Blueprint mô tả một tính năng mà ảnh UI không thể hiện** → vẫn viết tính năng đó.
2. **Ảnh UI có nút/chức năng mà blueprint không mô tả bằng chữ** → vẫn viết tính năng đó.
3. **Cả blueprint và ảnh đều không có**, nhưng thuộc nhóm thao tác CRUD tiêu chuẩn (Thêm/Sửa/
   Xoá/Xem/Tìm kiếm cơ bản) → BA **tự suy luận và viết**, không bỏ trống.

Phần suy ra từ một nguồn duy nhất hoặc tự suy luận vẫn phải neo `[HÌNH nnn]` / `¶số` (hoặc ghi rõ
"BA tự suy luận theo mẫu CRUD chuẩn, không có trong nguồn") ở cột `Ghi chú` của bảng field-level —
xem [`rules/srs-screen-template.md`](../rules/srs-screen-template.md) — để dev phân biệt được đâu
là chép nguyên văn, đâu là phần BA bổ sung.

**Phân bổ công sức** (khối lượng thật rất lớn — riêng nhóm 3 đã 500 ảnh):

| Loại ảnh | Độ phủ | Lý do |
|---|---|---|
| Sơ đồ luồng, sơ đồ trạng thái, sơ đồ tích hợp | **100%** | Mật độ lỗi cao nhất; đây là nơi chữ và hình hay lệch |
| Ảnh màn hình chính của mỗi chức năng | 100% | Cần cho Đ2 |
| Ảnh màn hình phụ / popup / lặp lại | Theo nghi vấn | Chỉ soi khi Đ2 báo lệch hoặc sổ S2 có chỗ trống |

Ghi rõ trong BRN mục 5 **số ảnh đã soi / tổng số ảnh**. Không được im lặng bỏ qua — bỏ sót có
khai báo thì người đọc còn tự quyết được, bỏ sót lặng lẽ thì đọc thành "đã phủ hết".

---

## 7. Xung đột liên tài liệu

Không thuộc BRN nào cả — ghi vào sổ chung
[`BA/Blueprint Review/XUNG-DOT-lien-tai-lieu.md`](../../BA/Blueprint%20Review/XUNG-DOT-lien-tai-lieu.md).

**Cách làm**: mỗi khi lập sổ cho một phân hệ, thêm mọi **đối tượng dùng chung** vào bảng
"Đăng ký đối tượng liên tài liệu" ở đầu sổ chung (đơn hàng, phiếu nhập/xuất, kho, lô/HSD,
khách hàng, NPP, sản phẩm, công nợ, chương trình khuyến mãi, tài sản/CCDC…). Với mỗi đối tượng
ghi: tài liệu nào **định nghĩa** nó, tài liệu nào **tiêu thụ** nó. Khi có ≥2 tài liệu chạm cùng
một đối tượng → so ba thứ: **tập trạng thái**, **tên + kiểu trường khoá**, **quy tắc chi phối**.

**Chỗ nghi ngờ cao, kiểm trước:**

- **Lệch phiên bản trong cùng nhóm 3**: Tồn kho `v1_2` · Đơn hàng `v1_2` · Đơn mua hàng
  `v1.1_Saubuoihop_0406` · Giao vận `v1.0` · Công nợ `v1.0`. Bản `v1.x` cũ nhiều khả năng chưa
  hấp thụ thay đổi đã chốt ở bản mới. Riêng hậu tố `_Saubuoihop_0406` cho biết có một cuộc họp
  ngày 04/06 làm đổi nội dung — **đổi ở một file, chưa chắc đổi ở file khác**.
- **Quyết định nằm sai chỗ**: `Chốt nội dung về tách mã tem_không tem.xlsx` chỉ nằm trong thư
  mục Đơn mua hàng, nhưng tách mã tem/không tem ảnh hưởng cả Tồn kho lẫn Công nợ.
- **Excel là trọng tài**: file template import/export và file mapping thường phản ánh chốt mới
  nhất, mới hơn cả phần chữ trong blueprint. Khi Excel ≠ text, **không tự chọn bên nào** — ghi
  `XD` và hỏi VTS.

Xung đột liên tài liệu **luôn có hai neo**, mỗi tài liệu một cái, đặt cạnh nhau — hai neo đó
chính là bằng chứng.

---

## 8. Phân loại & mã

Ba tiền tố, vì hệ quả xử lý khác hẳn nhau:

| Mã | Nghĩa | Hệ quả |
|---|---|---|
| `GAP-xxx` | Blueprint **thiếu** so với yêu cầu THFC (nguồn B) hoặc so với nền tảng (nguồn C) | Phải bổ sung phạm vi — có thể chạm hợp đồng |
| `XD-xxx` | **Xung đột** — trong cùng một file, hoặc giữa các file | Một bên phải sửa tài liệu; thường kéo theo nhiều SRS |
| `HOI-xxx` | **Chưa rõ**, cần VTS làm rõ | VTS trả lời là xong |

Đánh số liên tục toàn dự án, không reset theo nhóm (`GAP-001`, `GAP-002`…), để trích dẫn chéo
không nhập nhằng. Số kế tiếp tra ở
[`00-INDEX.md`](../../BA/Blueprint%20Review/00-INDEX.md).

**Mức độ:**

| Mức | Định nghĩa |
|---|---|
| Cao | Không giải quyết thì **không viết được** mục 3 của SRS, hoặc viết ra sẽ sai chắc chắn |
| Trung bình | Viết được nhưng phải gắn `[GIẢ ĐỊNH]`; sai thì phải sửa lại một phần SRS |
| Thấp | Diễn đạt, chính tả, nhất quán thuật ngữ — không đổi hành vi hệ thống |

**Quan hệ với sổ cái OQ** — quan trọng, dễ sai:

Hai lớp khác nhau, đừng trộn:

| Lớp | Mã | Sống ở đâu | Trả lời câu hỏi |
|---|---|---|---|
| Phát hiện | `GAP` / `XD` / `HOI` | BRN của phân hệ | *Rà blueprint thấy gì?* |
| Câu hỏi gửi VTS | `OQ-xxx` | [`BA/OQ-TRACKER.md`](../../BA/OQ-TRACKER.md) | *Đã hỏi VTS cái gì, họ trả lời chưa?* |

- **Không phải phát hiện nào cũng thành OQ.** Chỉ phát hiện **cần VTS trả lời** mới nâng lên
  `OQ-xxx` trong tracker, ghi nguồn (`XD-004`) ở cột *Nguồn*. Một `GAP` xử lý được nội bộ thì
  đóng tại BRN.
- Giữ tách hai lớp vì D7.3 cần gom được **batch OQ để gửi VTS** và D8 cần **đếm OQ "Cao" đang
  Mở** — cả hai bất khả thi nếu OQ nằm rải trong 25 file BRN.
- Trước khi tạo mã OQ mới, tra tracker xem VTS đã được hỏi/đã trả lời chưa. Trùng ý với OQ cũ
  → vẫn ghi vào BRN nhưng chú `≈ OQ-042` ngay tại dòng đó, **không** tạo OQ mới.
- **`BA/SRS-Open-Question-VTIT.xlsx` đã đóng băng làm di sản** (D14) — chỉ đọc, không ghi thêm,
  không sửa. Toàn bộ 85 OQ đã chuyển sang `OQ-TRACKER.md`, giữ nguyên mã.
- **D7.1 vẫn nguyên hiệu lực khi viết SRS**: tag `[CẦN XÁC NHẬN]`/`[GIẢ ĐỊNH]` trong một file
  SRS vẫn phải có mã `OQ-xxx` thật trong tracker. Mã `GAP/XD/HOI` **không** thay thế OQ trong SRS.

---

## 9. Ghi kết quả ở đâu

```
BA/Blueprint Review/
├── 00-INDEX.md                    ← trạng thái từng BRN + bộ đếm mã đang dùng
├── XUNG-DOT-lien-tai-lieu.md      ← sổ xung đột toàn cục + đăng ký đối tượng dùng chung
├── _TEMPLATE-BRN.md               ← khuôn BRN, copy ra khi bắt đầu một phân hệ
├── _extracted/                    ← bản trích tự động (không sửa tay)
└── <N>. <Tên nhóm>/
    └── BRN-<MÃ NHÓM>-<NN>-<slug>.md
```

**Một file BRN cho một phân hệ**, khớp 1:1 với SRS sẽ viết — mở SRS nào thì mở đúng một BRN.
Ngoại lệ gộp một file cho cả nhóm: **nhóm 6** (17 báo cáo nhỏ, 1 tài liệu) và **nhóm 9**.

Mã BRN dùng lại mã nhóm của **D12** để BRN và SRS soi gương nhau:
`BRN-QLGD-03-Ton-kho-NPP.md` ↔ `SRS-QLGD-03-Ton-kho-NPP-v0.1.md`.

Toàn bộ nằm trong `BA/` nên **không** đẩy lên remote (blueprint là tài liệu mật của khách hàng).

---

## 10. Đóng việc

1. Cập nhật `00-INDEX.md`: trạng thái BRN, số phát hiện theo mức, mã cuối đã dùng.
2. Nếu có xung đột liên tài liệu → đã ghi vào sổ chung, và thêm dòng vào **đăng ký đối tượng
   dùng chung** kể cả khi lần này chưa thấy xung đột (lần sau mới đối chiếu được).
3. Phát hiện chạm phụ thuộc liên module → ghi vào
   [`state/module-dependency-matrix.md`](../state/module-dependency-matrix.md) theo D11.
4. Cập nhật `state/DELIVERY_STATE.md` và `state/active-task.md`.
5. Khi viết SRS từ phân hệ này, `srs-authoring.md` §1 đọc BRN **trước** blueprint gốc.

---

## Danh mục kiểm nhanh (dán vào cuối BRN)

- [ ] Đã trích, đã đọc **hết** `muc-luc.md` — không bỏ heading nào
- [ ] 5 sổ đăng ký đã lập (S1–S5)
- [ ] 5 phép đóng đã chạy, ghi cả kết quả đạt (Đ1–Đ5)
- [ ] Đã đối chiếu 3 nguồn A/B/C — nêu rõ HLD nào được dùng
- [ ] 100% sơ đồ luồng/trạng thái đã soi; đã ghi tỉ lệ ảnh đã soi
- [ ] Đối tượng dùng chung đã đăng ký vào sổ xung đột
- [ ] Mọi phát hiện có neo + **nguyên văn**; diễn giải tách riêng
- [ ] Đã tra [`BA/OQ-TRACKER.md`](../../BA/OQ-TRACKER.md) để tránh hỏi trùng
- [ ] `00-INDEX.md` đã cập nhật

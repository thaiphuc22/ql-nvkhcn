# Workflow: Viết một SRS

> **QTKHCN path overlay (2026-08-05):** Trong repo này, mọi đường dẫn `BA/...` của workflow gốc
> map sang `docs/ba/...` (ví dụ `BA/OQ-TRACKER.md` → `docs/ba/OQ-TRACKER.md`,
> `BA/Tài liệu SRS/` → `docs/ba/Tài liệu SRS/`, `BA/Blueprint Review/` → `docs/ba/Blueprint Review/`).
> Rules/DoD/template nằm ở `.harness/rules/srs-*.md`. Skill sơ đồ: `.claude/skills/srs-to-drawio-flows/`.
> Quyết định SRS cho QTKHCN: **D23–D27** trong `state/decisions.md` (không dùng nguyên D1–D18 của DMS-THTM).

Quy trình chuẩn để sản xuất **một** tài liệu SRS, từ blueprint gốc tới bản được duyệt.
Đúc kết từ lần chạy thật đầu tiên trên DMS-THTM (`SRS-QLGD-05`, 2026-08-03) — dùng lặp lại cho mọi phân hệ.

Quyết định ràng buộc: **D4** (chuẩn nội dung), **D6/D9/D11** (DoD), **D7** (review),
**D12** (đặt tên), **D13** (định dạng `.md` + cổng xuất bản), **D15** (sơ đồ draw.io, mã BR),
**D16** (bảng field-level hợp nhất, đánh số theo 4 khía cạnh, khung đầu trang chuẩn — sửa D15
mục 1–2).

---

## 0. Nguyên tắc bao trùm — Markdown-first (D13)

> **SRS do AI viết chỉ tồn tại ở định dạng `.md`.** Không sinh `.docx`, không tạo Google Docs.
> Bản xuất bản chỉ được tạo **sau khi người dùng duyệt tường minh** — xem §5.

Điều này **không** nới lỏng chuẩn nội dung: bản `.md` vẫn phải đủ 6 mục cấp 1, đủ bảng field-level
7 cột theo **D16**, đủ các kịch bản luồng nghiệp vụ (bảng `Bước│Mô tả`) — y hệt như khi viết
`.docx`. Chỉ đổi vật mang, không đổi chuẩn.

Lý do: bản `.md` diff được, review được theo dòng, và không tốn một vòng dựng khung `.docx` cho
nội dung còn có thể bị sửa nhiều lần trước khi duyệt.

---

## 1. Chuẩn bị đầu vào

> **Bước 0 — chạy [`blueprint-review.md`](blueprint-review.md) trước.** Blueprint là đầu vào duy
> nhất của SRS; sai ở đó thì sai toàn bộ phần hạ nguồn. Nếu phân hệ này **đã có BRN** trong
> `BA/Blueprint Review/` thì đọc BRN **trước** blueprint gốc — nó đã liệt kê sẵn heading, sổ
> trạng thái/trường/vai trò/quy tắc/thông báo, và các điểm `GAP`/`XD`/`HOI` phải xử lý khi viết.
> Nếu **chưa có BRN**, chạy quy trình đó trước, đừng viết SRS từ blueprint chưa rà.

1. **Full-extract blueprint gốc** trong `BA/DS Blueprint VTS gửi/<nhóm>/`:
   - `.DOC` / `.docx` / Excel → `tools/blueprint-extract/extract.py` (sinh bản `.md` có neo
     `¶số` / `§mục` / `Bảng N` / `[HÌNH nnn]` + tách ảnh). Nhiều file VTS có đuôi `.DOC` nhưng
     thực chất là zip/docx nội bộ — `python-docx` vẫn đọc được.
   - PDF hoặc ảnh scan → `python tools/document-reader/extract.py <file|dir>` (có OCR tiếng Việt).
     Cây blueprint **không có file PDF nào**, nên đường này chỉ dùng cho tài liệu ngoài.

   Đọc **toàn bộ**, không đọc lướt: mục tiêu là có danh sách đầy đủ heading chức năng để đối
   chiếu ngược ở §4. Bản `muc-luc.md` do extractor sinh ra chính là danh sách đó.
2. **Đọc các Excel mapping/import-export** liên quan trong cùng thư mục, đối chiếu chéo với text
   blueprint để phát hiện mâu thuẫn (đây là nguồn OQ chất lượng cao nhất).
3. **Mở khối OQ tương ứng** trong [`BA/OQ-TRACKER.md`](../../BA/OQ-TRACKER.md) (D14). Một số
   phân hệ **đã có sẵn** OQ — tái sử dụng, **không tạo trùng**. Nhưng đừng mặc định là có: chỉ
   7 khối A–G tồn tại (nhóm 1, Đơn hàng, Tồn kho, Khuyến mãi). Phân hệ không có khối thì **tạo
   OQ mới từ đầu**, đừng đi tìm file cũ — bộ OQ cũ ở máy khác đã được chỉ đạo bỏ qua (D14 §2).
   Mã kế tiếp tra ở đầu file.
4. **Đọc `state/module-dependency-matrix.md`** — xác định phân hệ này tiêu thụ thực thể nào của
   module khác, và module sở hữu đã viết chưa (cờ 🔴/🟡/🟢).
5. **Đọc HLD tương ứng** trong `BA/Business Flow/` (`HLD-01..05`) — đây là mô tả **độc lập** cùng
   nghiệp vụ, dựng từ 987 yêu cầu THFC. Mục "0.1 Bảng giả định chính" chỉ sẵn chỗ mỏng.

---

## 2. Dựng file

Đặt tại `BA/Tài liệu SRS/<số nhóm>. <Tên nhóm>/<tên file>.md`, tên file theo **D12**:

```
SRS-<MÃ NHÓM>-<NN>-<slug-không-dấu>-v<x.y>.md
ví dụ: SRS-QLGD-02-Don-mua-hang-Auto-RPO-v0.1.md
```

Ảnh màn hình để trong thư mục `img/<mã-srs>/` **cạnh** file `.md`, copy trực tiếp từ
`_extracted/.../img/hinh-nnn.png` của blueprint đã rà — không tự vẽ lại. Tham chiếu bằng đường
dẫn tương đối: `![HÌNH 017 – Cấu hình Bán hàng](img/SRS-QLGD-01/017-hinh-017.png)`. Không nhúng
base64 (làm hỏng diff). **Nhúng ảnh thật cho mọi mã `HÌNH nnn` được trích dẫn** — mô tả bằng chữ
không thay được ảnh, xem `rules/srs-definition-of-done.md` §1.1/§2.

Mở đầu file bằng frontmatter — đây là nguồn máy đọc được cho trạng thái tài liệu:

```yaml
---
ma_srs: SRS-QLGD-02
ten: Đơn mua hàng / Auto RPO
nhom: 3 — Quản lý giao dịch
version: 0.1
tac_gia: BA3
ngay_tao: 2026-08-__
trang_thai: Nháp            # Nháp | Chờ review | Đã review nội bộ | Đã duyệt | Đã xuất bản
nhap_cho_vts: true          # true nếu còn OQ "Cao" đang Mở (D7)
oq_lien_quan: [OQ-120, OQ-121]
blueprint_nguon: "BA/DS Blueprint VTS gửi/3. Quản lý giao dịch/..."
---
```

Sau frontmatter, chèn **khung đầu trang chuẩn** (D16, sửa bởi D17) — copy nguyên từ
[`rules/srs-screen-template.md`](../rules/srs-screen-template.md) Phần D.1, gồm 4 khối theo đúng
thứ tự: tiêu đề + dòng **Phân hệ** (**không có bảng thuộc tính** — D17 bỏ, dữ liệu đã có ở
frontmatter YAML) → **Bảng ghi nhận thay đổi** → **Trang ký** (Người lập / **Người kiểm tra** — 1
dòng gộp, không phải 2× Người xem xét như trước D16 / Người phê duyệt / **Đại diện khách hàng** —
để trống, ký ở bước 2) → **Mục lục** (mục 5 đủ 7 mục con `5.1`–`5.7`, mục 6 đủ 4 mục con
`6.1`–`6.4`).

---

## 3. Viết nội dung

Theo **DoD** (`rules/srs-definition-of-done.md`) — 6 mục cấp 1. Viết mục 3 (Thiết kế chi tiết)
theo **lô 3–4 chức năng con mỗi lượt** (không phải 3–4 nghiệp vụ — một nghiệp vụ thường có 6–8
chức năng con): giữ chất lượng đều và dễ sửa khi phát hiện lệch chuẩn giữa chừng. Xong mục 3 mới
viết mục 4 → 5 → 6.

**Copy khung từ [`rules/srs-screen-template.md`](../rules/srs-screen-template.md)** thay vì gõ
lại từ đầu — file đó có cả khung rỗng lẫn bản mẫu đã điền, cộng bảng "7 lỗi hay mắc".

Đừng để tới cuối mới thêm sơ đồ/ảnh — viết **cùng lúc** với mục tương ứng: sơ đồ giao tiếp module
(mermaid, D18) khi viết §2.2, sơ đồ quy trình + máy trạng thái (draw.io) khi viết §3.X.0, ảnh màn
hình ngay đầu mỗi mục `3.X.3.k` (D16 — không còn khối `a) Bố cục màn hình` riêng, xem DoD
§1.1/§2.1). Thêm sau cùng cho cả tài liệu tốn công gấp nhiều lần vì phải quét lại toàn bộ mã
`HÌNH nnn` đã trích dẫn.

---

## 3bis. Vẽ sơ đồ bằng draw.io (D15 — thay mermaid; §2.2 đổi lại mermaid ở D18)

**§2.2 Giao tiếp với module/hệ thống khác — mermaid `flowchart` (D18)**: nhúng trực tiếp trong
`.md` bằng khối ```` ```mermaid ````, node trung tâm = module đang viết, nhãn mũi tên thể hiện
chiều dữ liệu (Tiêu thụ/Ghi/Song song/Nền). Không cần file `.drawio`/ảnh xuất riêng cho sơ đồ này.

Skill `.claude/skills/srs-to-drawio-flows/` dùng cho hai loại còn lại: nó **chỉ** sinh sơ đồ
**luồng theo từng chức năng**; sơ đồ **máy trạng thái** phải **vẽ tay**, bám đúng màu/kiểu nét của
`assets/template.drawio` để tài liệu không lộ hai phong cách.

### Ba bước

```bash
# 1) Dựng manifest — KHÔNG chạy scripts/extract_srs.py.
#    Script đó đọc .docx; SRS dự án là .md (D13) và đã có BRN với neo đầy đủ.
#    Viết thẳng flow-manifest.json từ bản .md + BRN. Đọc references/manifest-schema.md trước.

# 2) Sinh sơ đồ
./.venv/Scripts/python.exe .claude/skills/srs-to-drawio-flows/scripts/generate_drawio.py \
  --template .claude/skills/srs-to-drawio-flows/assets/template.drawio \
  --manifest "<thư mục làm việc>/flow-manifest.json" \
  --level medium \
  --output-dir "BA/Tài liệu SRS/3. Quản lý giao dịch/drawio/"

# 3) Kiểm — phải trả về "issues": []
./.venv/Scripts/python.exe .claude/skills/srs-to-drawio-flows/scripts/validate_drawio.py \
  --drawio "<file sinh ra>.drawio" \
  --manifest "<thư mục làm việc>/flow-manifest.json" \
  --level medium
```

### Xuất ảnh PNG để nhúng vào `.md`

```bash
"/c/Program Files/draw.io/draw.io.exe" -x -f png -s 2 --crop -p 5 \
  -o "BA/Tài liệu SRS/3. Quản lý giao dịch/img/SRS-QLGD-02/so-do-3-4-3.png" \
  "BA/Tài liệu SRS/3. Quản lý giao dịch/drawio/SRS-QLGD-02-flows.drawio"
```

**Bốn cái bẫy đã vấp thật khi kiểm chuỗi này (2026-08-04)** — đọc trước khi chạy:

| Bẫy | Thực tế |
|---|---|
| **`-p` đếm từ 1, không phải từ 0** | Template có 4 trang, nên chức năng đầu tiên là `-p 5`. Công thức: `-p (4 + thứ tự chức năng trong manifest)` |
| **Không truyền `-p` thì xuất nhầm trang Template** | Lệnh vẫn báo thành công, ảnh vẫn ra — chỉ là sai trang. Đây là cái bẫy nguy hiểm nhất vì không có tín hiệu lỗi |
| **`-a` vô dụng với PNG** | Vẫn chỉ ra 1 file bằng đúng trang 1. Muốn nhiều trang thì gọi lệnh nhiều lần với `-p` khác nhau |
| **`-p 4` báo lỗi** | Trang `Page-4` của template rỗng, draw.io không xuất được trang rỗng. Không phải lỗi cài đặt |

Không cần `--no-sandbox`; lệnh trả exit 0 và không treo.

**Khiếm khuyết trình bày đã biết**: ô chú thích dữ liệu (ô `D` xám) có thể **đè lên thanh tiêu đề**
của trang và che mất vài ký tự đầu dòng nhãn. Kiểm mắt ảnh xuất ra; nếu bị thì kéo ô dữ liệu
xuống thấp hơn hoặc rút gọn nhãn.

### Ràng buộc riêng của dự án

Trường `cases[].source` trong manifest **phải là neo thật** (`[¶xxx]`, `§mục`, `Bảng N`,
`HÌNH nnn`) hoặc chữ `cần xác nhận` kèm mã `OQ` — không được để trống. Đây là nghĩa vụ D14 áp
vào sơ đồ; `validate_drawio.py` đã chặn sẵn manifest thiếu `source`.

Cuối cùng, `references/quality-checklist.md` của skill có phần kiểm mắt — chạy trên ít nhất 1
trang đại diện mỗi loại màn (danh sách, chi tiết, form, thao tác).

Mục `6.3` (danh sách OQ đầy đủ, DoD §1.2, D16) **dựng sau cùng ở bước 6** — khi mọi mã OQ của phân hệ
đã mở xong trong tracker, copy nguyên văn khối E tương ứng vào bảng, không gõ lại tay (sai lệch
với tracker là nguồn lỗi dễ xảy ra nếu gõ lại).

Mỗi khi gặp điểm chưa rõ: gắn `[CẦN XÁC NHẬN]` hoặc `[GIẢ ĐỊNH]` **và tạo mã OQ thật ngay lúc
đó** trong tracker. Gắn nhãn mà không tạo mã là vi phạm D7.1 — đây là lỗi đã xảy ra thật ở
`SRS-QLGD-05` và phải sửa lại sau.

Nếu điểm chưa rõ đó là **phụ thuộc liên module** đã có dòng trong matrix (D11) → không tạo OQ
riêng, mà ghi một dòng vào **Nhật ký rà Tầng 2** của `module-dependency-matrix.md`.

---

## 4. Tự kiểm (D7 bước 1 + 1b)

1. Chấm checklist trong `rules/srs-definition-of-done.md`.
2. Đối chiếu ngược danh sách heading blueprint (§1.1) với mục 3.X — **không thiếu chức năng nào**.
3. Chạy skill `ba-doc-review` với **5 nhóm check đã thu hẹp** — xem `rules/review-policy.md`.
4. Với mỗi OQ đã có sẵn: kiểm cột "Phản hồi VTS". Có phản hồi → cập nhật nội dung SRS theo phản
   hồi **và** đổi trạng thái `Mở → Đã trả lời` (D9.2).
5. Nếu còn OQ "Cao" đang Mở → gắn nhãn **"Nháp chờ VTS"** + liệt kê mã OQ ngay đầu tài liệu, và
   đặt `nhap_cho_vts: true` trong frontmatter.

---

## 5. Cổng duyệt & xuất bản (D13)

```
viết .md ─→ [1] tự chấm ─→ [1b] ba-doc-review ─→ [2] review nội bộ trên .md (ký Trang ký)
                                                              │
                                                     ┌────────┴────────┐
                                                     │ NGƯỜI DÙNG DUYỆT │  ← cổng bắt buộc
                                                     └────────┬────────┘
                                                              ↓
                                              đẩy .md → Google Docs (bằng tool)
```

- Review nội bộ (bước 2) diễn ra **trên bản `.md`**, không cần bản `.docx`. Người xem xét ghi
  tên/ngày trực tiếp vào bảng Trang ký trong file.
- AI **không được** tự chạy bước đẩy Google Docs. Chờ người dùng nói rõ.

**Lệnh đẩy** — dùng tool có sẵn trong repo, [`tools/docs-to-drive/`](../../tools/docs-to-drive/):

```bash
cd tools/docs-to-drive
node publish.js "BA/Tài liệu SRS/3. Quản lý giao dịch/SRS-QLGD-03-Ton-kho-NPP-v0.1.md"
```

Tool convert Markdown → HTML → Google Doc, tự tạo cây thư mục Drive khớp cây thư mục repo, và
ghi `fileId`/`webViewLink` vào `manifest.json`. **Đẩy lại cùng một file `.md` sẽ update đúng
Google Doc cũ, không tạo bản trùng** — nên cứ dùng lại lệnh này cho mọi lần cập nhật.

Sau khi đẩy: đặt `trang_thai: Đã xuất bản` và dán `webViewLink` vào frontmatter.

> ⚠️ **Tool chưa chạy được**: thiếu `tools/docs-to-drive/.credentials/service-account.json` và
> chưa `npm install`. `rootFolderId` thì đã cấu hình sẵn. Theo dõi ở **V-09** trong
> `state/DELIVERY_STATE.md`. Cổng duyệt ở trên vẫn có hiệu lực ngay từ bây giờ.

> ⚠️ **Ảnh không đi kèm**: `publish.js` chỉ đẩy nội dung Markdown; ảnh trong `assets/` tham chiếu
> bằng đường dẫn tương đối sẽ **không** hiển thị trong Google Doc. Với SRS nhiều ảnh màn hình,
> chèn ảnh thủ công sau khi đẩy, hoặc nêu vấn đề này với BA Lead để bổ sung tool.

---

## 6. Đóng việc (bắt buộc, không được bỏ)

1. Cập nhật `state/module-dependency-matrix.md` nếu có kích hoạt Tầng 2.
2. Cập nhật bảng Backlog trong `state/DELIVERY_STATE.md` (cột phân hệ xong / review / OQ Cao).
3. Cập nhật `state/active-task.md` — phân hệ tiếp theo, next concrete action.
4. Nếu phát sinh quyết định mới cần khoá → trình người dùng, chỉ ghi vào `decisions.md` sau khi
   được duyệt.

---

## Di sản `.docx` (không bắt convert ngược)

5 file `.docx` đã tồn tại trước D13 — `SRS-TTCB-01..04-v0.1` (nhóm 1) và `SRS-QLGD-05-Giao-van-
Lo-trinh-v0.1` (nhóm 3) — **giữ nguyên định dạng cũ**. Chỉ khi nào một trong số đó được nâng
version thì mới tái tạo dưới dạng `.md` theo workflow này. Không dành effort convert hàng loạt.

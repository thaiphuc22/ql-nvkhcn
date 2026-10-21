# Prompt Gemini — theo từng SECTION Figma (RD02.02)

> **Cách dùng:** mỗi lần chat Gemini = **1 section**. Copy khối `PROMPT` tương ứng.  
> **Figma:** https://www.figma.com/design/jC6ldmlIeFmBWKx4dRvn6e/VHT_DRAFT?node-id=11-56  
> **fileKey:** `jC6ldmlIeFmBWKx4dRvn6e` · **Canvas node:** `11:56` · tên canvas: `Mockup Luồng RD02.02`  
> **Map đầy đủ:** `docs/ba/SRS-FIGMA-MAP-RD02.02.md`  
> **Khung SRS:** 6 mục cấp 1 + mỗi chức năng `3.X.1`→`3.X.5` + bảng field **7 cột**.  
> **Phạm vi mặc định:** viết mô tả UI/hành vi theo mockup; chỗ ghi Tập đoàn / RD02.02 → `[CẦN XÁC NHẬN] OQ-QTKHCN-001` (roadmap Pha 1 ưu tiên CS).

---

## Prompt hệ thống (dán 1 lần đầu mỗi chat Gemini)

```text
Bạn là Business Analyst viết tài liệu SRS dạng Markdown cho hệ thống QTKHCN (Viettel High Tech).

QUY TẮC BẮT BUỘC:
1. Chỉ output 1 file .md hoàn chỉnh (không giải thích dài ngoài file).
2. Frontmatter YAML: ma_srs, ten, nhom, version=0.1, tac_gia, ngay_tao, trang_thai=nhap, nhap_cho_vts, oq_lien_quan, blueprint_nguon.
3. Sau frontmatter: tiêu đề + ## TÀI LIỆU THIẾT KẾ CHI TIẾT (SRS) + dòng Phân hệ + Bảng ghi nhận thay đổi + Trang ký (để trống) + Mục lục.
4. Đủ 6 mục: 1 Giới thiệu · 2 Tổng quan (2.2 mermaid flowchart) · 3 Thiết kế chi tiết · 4 Dùng chung · 5 Quản trị dữ liệu (5.1–5.7) · 6 Phụ lục (gồm bảng OQ).
5. Mỗi chức năng trong mục 3 = 3.X với đủ 3.X.1 Thông tin chung · 3.X.2 Màn hình · 3.X.3 Thành phần (bảng 7 cột: STT|Tên|Kiểu dữ liệu [Độ dài]|Input/Output|Giá trị khởi tạo|Mô tả mapping CSDL|Ghi chú) · 3.X.4 Luồng (Bước|Mô tả) · 3.X.5 Quy tắc BR-….
6. Bám sát tên màn hình / nhãn nút / luồng ghi trên Figma section được giao. Không bịa API/DB — thiếu thì [CẦN XÁC NHẬN] + mã OQ-QTKHCN-xxx.
7. Tiếng Việt, góc nhìn BA/PO. Không sinh .docx.
8. Nguồn UI: Figma VHT_DRAFT, trích dẫn nodeId section/frame trong Ghi chú / Phụ lục.
```

---

## Thứ tự chạy (khuyến nghị)

| Lần | Section Figma | File output gợi ý |
|---|---|---|
| 1 | Login | `SRS-PH2-01-...` (phần đăng nhập) hoặc phụ lục auth |
| 2 | Chọn phân hệ | Shell / PH2 entitlement |
| 3 | Tạo nhiệm vụ KHCN mới | `SRS-RD02-01` §3.1 (phần NV+HS) |
| 4 | PM - Vai trò gửi hồ sơ xét duyệt | `SRS-RD02-01` §3.1/3.8 |
| 5 | Chuyên quản KHCN - … | `SRS-RD02-01` §3.2 (CQ KHCN) |
| 6 | Chuyên quản TCKT - … | `SRS-RD02-01` §3.2 (CQ TCKT) |
| 7 | Chuyên quản MS - … | `SRS-RD02-01` §3.2 (CQ MS) |
| 8 | Chuyên quản NS - … | `SRS-RD02-01` §3.2 (CQ NS) |
| 9 | PM - Nhận phiếu NX và hoàn chỉnh HSXD | `SRS-RD02-01` §3.10 rework |
| 10 | Hệ thống tạo Hội đồng xét duyệt | `SRS-HD-01` + RD02 §3.3 |
| 11 | BGĐ- Ký bộ HSXD dự thảo | `SRS-RD02-01` §3.9 |
| 12 | Quản lý - Xem tổng quan Tiến trình Hồ sơ/ Nhiệm vụ KHCN | `SRS-PH4-01` §3.7 |
| 13 | *(Gộp)* Banner “Luồng nhận xét xử lý song song…” | BR song song 4 CQ trong RD02 §3.2 / mục 4 |

> Tip: Lần 5–8 có thể dùng cùng template, chỉ đổi tên chuyên quản.  
> Sau khi chạy từng section, bạn (hoặc Gemini) **merge** vào 1 file `SRS-RD02-01-...v0.1.md` theo outline.

---

## 1) Section: `Login` · node `900:16487`

```text
[Áp dụng Prompt hệ thống ở trên]

NHIỆM VỤ:
Viết phần SRS mô tả SECTION Figma tên chính xác: "Login" (nodeId=900:16487) trong canvas Mockup Luồng RD02.02.

PHẠM VI SECTION:
- Các màn/bước đăng nhập xuất hiện trong section Login (ảnh flow trên Figma).
- Không viết sâu SSO protocol nếu chưa có nguồn — dùng OQ.

FILE GỢI Ý: SRS-PH2-01-Phan-quyen-Xac-thuc-v0.1.md (chỉ mục liên quan Đăng nhập) 
hoặc section 3.X trong phụ lục Auth của SRS shell.

ĐẦU MỤC BẮT BUỘC TRONG MỤC 3:
3.X Đăng nhập hệ thống QTKHCN
  - Màn hình login, lỗi sai mật khẩu / hết phiên (nếu thấy trên mockup)
  - Điều kiện sau login: vào màn Chọn phân hệ

Trích dẫn Figma: fileKey=jC6ldmlIeFmBWKx4dRvn6e, section=Login, node=900:16487
Link: https://www.figma.com/design/jC6ldmlIeFmBWKx4dRvn6e/VHT_DRAFT?node-id=900-16487
```

---

## 2) Section: `Chọn phân hệ` · node `900:26997`

```text
[Áp dụng Prompt hệ thống ở trên]

NHIỆM VỤ:
Viết SRS cho SECTION Figma tên chính xác: "Chọn phân hệ" (nodeId=900:26997).

CÁC FRAME TRONG SECTION (bám tên Figma):
- "Màn hình Chọn phân hệ"
- "Màn hình Chọn phân hệ Quản lý KHCN & HS"
- "Chọn phân hệ quản trị quy trình để xem danh sách quy trình"
- "Màn hình Quản lý quy trình"
- "Màn hình QL NV KHCN & HS"
- Các nhãn mũi tên: chọn PH Quản lý quy trình / chọn PH Quản lý NV KHCN & HS

ĐẦU MỤC MỤC 3:
3.1 Chọn phân hệ sau đăng nhập
3.2 Vào Phân hệ Quản trị Quy trình (xem danh sách / tổng quan quy trình)
3.3 Vào Phân hệ Quản lý NV KHCN & Hồ sơ

Gắn SRS: SRS-PH2-01 (entitlement) + shell D19 (3 App).
OQ nếu chưa rõ quyền hiện/ẩn card phân hệ.

Trích dẫn: node=900:26997
Link: https://www.figma.com/design/jC6ldmlIeFmBWKx4dRvn6e/VHT_DRAFT?node-id=900-26997
```

---

## 3) Section: `Tạo nhiệm vụ KHCN mới` · node `907:27090`

```text
[Áp dụng Prompt hệ thống ở trên]

NHIỆM VỤ:
Viết SRS cho SECTION Figma tên chính xác: "Tạo nhiệm vụ KHCN mới" (nodeId=907:27090).

CÁC FRAME / NHÃN BẮT BUỘC BÁM THEO FIGMA:
- Màn hình QL NV KHCN & HS
- Màn hình Danh sách NV KHCN
- Màn hình Thêm mới NV KHCN (có filter tiêu chí, số tiền bằng chữ VNĐ)
- Màn hình Xem chi tiết NV KHCN
- Thêm mới hồ sơ
- Tải lên hồ sơ đính kèm
- Pop-up cảnh báo khi xác nhận Tạo nhiệm vụ
- Chọn Mẫu tài liệu để xem/tải mẫu
- Chọn Nhân sự đề tài (pop-up gắn nhân sự)
- Sau khi Lưu nhiệm vụ → hiển thị Thêm hồ sơ
- "Màn hình Thêm mới sau khi anh Diễn góp ý" (ghi nhận phiên bản UI sau góp ý)

ĐẦU MỤC MỤC 3 (SRS-RD02-01 / phần khởi tạo):
3.1 Danh sách nhiệm vụ KHCN
3.2 Tạo mới nhiệm vụ KHCN
3.3 Xem chi tiết nhiệm vụ KHCN
3.4 Thêm mới hồ sơ gắn nhiệm vụ
3.5 Tải lên / quản lý tệp đính kèm hồ sơ
3.6 Chọn mẫu tài liệu
3.7 Gán nhân sự đề tài

Lưu ý: Mockup thuộc luồng RD02.02; đánh OQ-QTKHCN-001 nếu nội dung nghiêng cấp Tập đoàn.
Gate nghiệp vụ: hồ sơ xét duyệt kế thừa chủ trương đã duyệt — nếu mockup không hiện, ghi [CẦN XÁC NHẬN].

Trích dẫn: node=907:27090
Link: https://www.figma.com/design/jC6ldmlIeFmBWKx4dRvn6e/VHT_DRAFT?node-id=907-27090
```

---

## 4) Section: `PM - Vai trò gửi hồ sơ xét duyệt` · node `913:18855`

```text
[Áp dụng Prompt hệ thống ở trên]

NHIỆM VỤ:
Viết SRS cho SECTION Figma tên chính xác: "PM - Vai trò gửi hồ sơ xét duyệt" (nodeId=913:18855).

CÁC FRAME / NHÃN BẮT BUỘC:
- Màn hình Chọn phân hệ
- Màn hình Danh sách Việc của tôi
- Màn hình Xem chi tiết công việc cần xử lý (và biến thể)
- Màn hình Xem chi tiết NV KHCN
- Màn hình Pop-up xác nhận Đồng ý duyệt/Từ chối duyệt
- Xem BPMN / Xem toàn bộ luồng quy trình
- E-form BM.02.02.DTO.NV_2024
- Hành vi: tải xuống / xem / xóa / upload tài liệu trong hồ sơ
- Chọn Xử lý để bổ sung hồ sơ và gửi xét duyệt
- Sau Đồng ý duyệt → đẩy bước tiếp theo

ĐẦU MỤC MỤC 3:
3.1 Worklist — Việc của tôi (vai trò PM)
3.2 Xử lý / gửi hồ sơ xét duyệt
3.3 Xem & quản lý tài liệu hồ sơ khi xử lý
3.4 Điền / xem E-form BM.02.02.DTO.NV_2024 trên bước
3.5 Xem BPMN của hồ sơ / xem luồng tổng thể
3.6 Xác nhận Đồng ý duyệt hoặc Từ chối duyệt (pop-up)

Gắn: SRS-RD02-01 + SRS-PH4-01 §Worklist + SRS-PH3-02 (formKey).

Trích dẫn: node=913:18855
Link: https://www.figma.com/design/jC6ldmlIeFmBWKx4dRvn6e/VHT_DRAFT?node-id=913-18855
```

---

## 5) Section: `Chuyên quản KHCN - Vai trò nhận xét thẩm định hồ sơ` · node `932:156`

```text
[Áp dụng Prompt hệ thống ở trên]

NHIỆM VỤ:
Viết SRS cho SECTION Figma tên chính xác:
"Chuyên quản KHCN - Vai trò nhận xét thẩm định hồ sơ" (nodeId=932:156).

CỐ ĐỊNH VAI TRÒ: Chuyên quản KHCN.

LUỒNG BẮT BUỘC THEO FIGMA:
- Đăng nhập → chọn phân hệ Quản lý KHCN & HS → Việc của tôi
- Chọn hồ sơ cần xử lý
- Đồng ý duyệt / Từ chối duyệt → pop-up nhập nhận xét → đẩy bước tiếp (nếu đồng ý)
- Tải / xem / xóa / upload tài liệu hồ sơ
- Ghi chú lần xử lý nếu có trên mockup (vd. Lần 8 / Lần 2)

ĐẦU MỤC MỤC 3:
3.2.1 Thẩm định hồ sơ xét duyệt — Chuyên quản KHCN (Đạt/Chưa đạt hoặc Đồng ý/Từ chối theo đúng nhãn Figma)

Phải nêu: đây là một nhánh trong cơ chế **xử lý song song** các chuyên quản (xem banner canvas).
OQ điều kiện đủ tất cả CQ Đạt trước bước HĐXD.

Trích dẫn: node=932:156
Link: https://www.figma.com/design/jC6ldmlIeFmBWKx4dRvn6e/VHT_DRAFT?node-id=932-156
```

---

## 6) Section: `Chuyên quản TCKT- Vai trò nhận xét thẩm định hồ sơ` · node `932:176`

```text
[Áp dụng Prompt hệ thống ở trên]

NHIỆM VỤ:
Viết SRS cho SECTION Figma tên chính xác:
"Chuyên quản TCKT- Vai trò nhận xét thẩm định hồ sơ" (nodeId=932:176).

CỐ ĐỊNH VAI TRÒ: Chuyên quản TCKT.
Cấu trúc output GIỐNG section Chuyên quản KHCN (cùng pattern UI), nhưng:
- Đổi toàn bộ tác nhân / phân quyền / ví dụ sang TCKT
- Đầu mục: 3.2.2 Thẩm định hồ sơ xét duyệt — Chuyên quản TCKT
- Không copy nguyên văn tên KHCN

Trích dẫn: node=932:176
Link: https://www.figma.com/design/jC6ldmlIeFmBWKx4dRvn6e/VHT_DRAFT?node-id=932-176
```

---

## 7) Section: `Chuyên quản MS - Vai trò nhận xét thẩm định hồ sơ` · node `932:196`

```text
[Áp dụng Prompt hệ thống ở trên]

NHIỆM VỤ:
Viết SRS cho SECTION Figma tên chính xác:
"Chuyên quản MS - Vai trò nhận xét thẩm định hồ sơ" (nodeId=932:196).

CỐ ĐỊNH VAI TRÒ: Chuyên quản MS (Mua sắm / MS theo nhãn hệ thống).
Đầu mục: 3.2.3 Thẩm định hồ sơ xét duyệt — Chuyên quản MS
Pattern UI giống CQ KHCN/TCKT; đổi đúng tên section Figma.

Trích dẫn: node=932:196
Link: https://www.figma.com/design/jC6ldmlIeFmBWKx4dRvn6e/VHT_DRAFT?node-id=932-196
```

---

## 8) Section: `Chuyên quản NS - Vai trò nhận xét thẩm định hồ sơ` · node `932:216`

```text
[Áp dụng Prompt hệ thống ở trên]

NHIỆM VỤ:
Viết SRS cho SECTION Figma tên chính xác:
"Chuyên quản NS - Vai trò nhận xét thẩm định hồ sơ" (nodeId=932:216).

CỐ ĐỊNH VAI TRÒ: Chuyên quản NS (Nhân sự).
Đầu mục: 3.2.4 Thẩm định hồ sơ xét duyệt — Chuyên quản NS
Pattern UI giống các CQ khác; giữ đúng nhãn Figma.

Trích dẫn: node=932:216
Link: https://www.figma.com/design/jC6ldmlIeFmBWKx4dRvn6e/VHT_DRAFT?node-id=932-216
```

---

## 9) Section: `PM - Nhận phiếu NX và hoàn chỉnh HSXD` · node `932:236`

```text
[Áp dụng Prompt hệ thống ở trên]

NHIỆM VỤ:
Viết SRS cho SECTION Figma tên chính xác:
"PM - Nhận phiếu NX và hoàn chỉnh HSXD" (nodeId=932:236).

CÁC ĐIỂM BẮT BUỘC:
- Việc của tôi → chọn hồ sơ đang cần xử lý
- PM nhận phiếu nhận xét / hoàn chỉnh hồ sơ xét duyệt
- Đồng ý / Từ chối + pop-up nhận xét
- Quản lý tài liệu hồ sơ (tải/xem/xóa/upload)

ĐẦU MỤC:
3.10 Rework / hoàn chỉnh hồ sơ xét duyệt sau phiếu nhận xét (vai trò PM)

Gắn OQ-QTKHCN-005 / OQ-002: đích trả về khi Chưa đạt hoặc từ chối.

Trích dẫn: node=932:236
Link: https://www.figma.com/design/jC6ldmlIeFmBWKx4dRvn6e/VHT_DRAFT?node-id=932-236
```

---

## 10) Section: `Hệ thống tạo Hội đồng xét duyệt` · node `932:287`

```text
[Áp dụng Prompt hệ thống ở trên]

NHIỆM VỤ:
Viết SRS cho SECTION Figma tên chính xác:
"Hệ thống tạo Hội đồng xét duyệt" (nodeId=932:287).

CÁC FRAME:
- Màn hình QL NV KHCN & HS → menu Quản lý Hội đồng
- Màn hình Danh sách Hội đồng
- Màn hình Thêm mới Hội đồng
- Màn hình Danh sách Hội đồng sau bấm Lưu
- Nhãn: Chọn Tạo hội đồng · Sau khi Nhập thông tin, Lưu Hội đồng

ĐẦU MỤC (ưu tiên file SRS-HD-01, đồng thời map RD02 §3.3):
3.1 Danh sách hội đồng xét duyệt
3.2 Tạo mới hội đồng xét duyệt
3.3 Lưu hội đồng và hiển thị lại danh sách

Nếu form thành viên/vai trò không đọc rõ trên ảnh: [CẦN XÁC NHẬN] + OQ.
GATE: chỉ tạo HĐXD khi đủ điều kiện CQ (OQ-QTKHCN-004).

Trích dẫn: node=932:287
Link: https://www.figma.com/design/jC6ldmlIeFmBWKx4dRvn6e/VHT_DRAFT?node-id=932-287
```

---

## 11) Section: `BGĐ- Ký bộ HSXD dự thảo` · node `932:256`

```text
[Áp dụng Prompt hệ thống ở trên]

NHIỆM VỤ:
Viết SRS cho SECTION Figma tên chính xác:
"BGĐ- Ký bộ HSXD dự thảo" (nodeId=932:256).

CÁC ĐIỂM BẮT BUỘC:
- Việc của tôi → chọn hồ sơ cần xử lý
- Chọn Ký duyệt → mở tài liệu Quyết định dự thảo để kiểm tra
- Điền thông tin → Xác nhận → chuyển Voffice để ký duyệt
- Biến thể màn hình khi “Ký duyệt và quy trình cho phép”

ĐẦU MỤC:
3.9 Ký duyệt bộ hồ sơ xét duyệt / Quyết định dự thảo (vai trò BGĐ)

OQ-QTKHCN-003: tích hợp Voffice / chữ ký số — mô tả theo mockup, không bịa API.

Trích dẫn: node=932:256
Link: https://www.figma.com/design/jC6ldmlIeFmBWKx4dRvn6e/VHT_DRAFT?node-id=932-256
```

---

## 12) Section: `Quản lý - Xem tổng quan Tiến trình Hồ sơ/ Nhiệm vụ KHCN` · node `941:16909`

```text
[Áp dụng Prompt hệ thống ở trên]

NHIỆM VỤ:
Viết SRS cho SECTION Figma tên chính xác:
"Quản lý - Xem tổng quan Tiến trình Hồ sơ/ Nhiệm vụ KHCN" (nodeId=941:16909).

CÁC FRAME:
- Màn hình Chọn phân hệ → chọn Quản lý Quy trình
- Màn hình Giám sát tiến trình
- Click mã hồ sơ để xem chi tiết tiến trình
- (Có frame mang tên Danh sách NV trong section — mô tả đúng vai trò giám sát QT, không nhầm CRUD NV)

ĐẦU MỤC (SRS-PH4-01):
3.7 Giám sát tiến trình hồ sơ / nhiệm vụ KHCN
3.7.x Xem chi tiết tiến trình theo mã hồ sơ

Trích dẫn: node=941:16909
Link: https://www.figma.com/design/jC6ldmlIeFmBWKx4dRvn6e/VHT_DRAFT?node-id=941-16909
```

---

## 13) Gộp rule: banner song song chuyên quản

```text
[Áp dụng Prompt hệ thống ở trên]

NHIỆM VỤ:
Không viết một section UI riêng. Viết mục 4 (Thiết kế dùng chung) + bảng Business Rules
cho quy tắc trên canvas:

"Luồng nhận xét xử lý song song của các bộ phận chuyên quản"

NỘI DUNG BẮT BUỘC:
- 4 chuyên quản: KHCN, TCKT, MS, NS xử lý song song trên cùng hồ sơ xét duyệt
- Điều kiện hội tụ (join) trước khi lập HĐXD — nếu chưa rõ ghi OQ-QTKHCN-004
- Hành vi khi một CQ Từ chối / Chưa đạt (OQ-QTKHCN-005)
- Tham chiếu các section node: 932:156, 932:176, 932:196, 932:216

OUTPUT: đoạn markdown có thể merge vào SRS-RD02-01 mục 4 và 3.2 + phụ lục BR.
```

---

## Prompt MERGE cuối (sau khi chạy hết section)

```text
Bạn là BA. Hãy GỘP các bản nháp SRS theo từng section Figma (Login, Chọn phân hệ, Tạo nhiệm vụ KHCN mới, PM gửi HSXD, 4 Chuyên quản, PM nhận phiếu NX, Hội đồng XD, BGĐ ký, Giám sát tiến trình, BR song song)
thành ĐÚNG MỘT file:

SRS-RD02-01-Xet-duyet-NV-KHCN-CS-v0.1.md

YÊU CẦU MERGE:
- Một frontmatter, một Trang ký, một Mục lục.
- Mục 3 sắp theo outline: 3.0 E2E · 3.1 khởi tạo · 3.2 CQ (4 tiểu mục) · 3.3 HĐXD · 3.8 danh sách/worklist · 3.9 BGĐ · 3.10 rework.
- Đánh GAP rõ cho HĐXD phiên 1/2, HĐ KHCN, TGĐ mở mới nếu không có section Figma.
- Khử trùng lặp mô tả worklist giữa các CQ — để phần dùng chung ở mục 4.
- Giữ mọi OQ đã sinh; thống nhất mã OQ-QTKHCN-xxx.
- Phạm vi mặc định CS; OQ-001 cho lệch TĐ trên tiêu đề mockup.

Đính kèm: toàn bộ các file .md section bạn đã sinh (dán tuần tự vào prompt).
```

---

## Checklist chạy Gemini

- [ ] 1 Login  
- [ ] 2 Chọn phân hệ  
- [ ] 3 Tạo nhiệm vụ KHCN mới  
- [ ] 4 PM gửi hồ sơ xét duyệt  
- [ ] 5 CQ KHCN  
- [ ] 6 CQ TCKT  
- [ ] 7 CQ MS  
- [ ] 8 CQ NS  
- [ ] 9 PM nhận phiếu NX  
- [ ] 10 Hội đồng xét duyệt  
- [ ] 11 BGĐ ký  
- [ ] 12 Giám sát tiến trình  
- [ ] 13 BR song song  
- [ ] MERGE → `SRS-RD02-01-...v0.1.md`  
- [ ] Lưu vào `docs/ba/Tài liệu SRS/` + cập nhật `OQ-TRACKER.md`

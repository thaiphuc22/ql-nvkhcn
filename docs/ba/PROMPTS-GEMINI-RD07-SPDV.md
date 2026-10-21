# Prompt Gemini — SRS RD07 Quản lý Danh mục SPDV

> **Cách dùng:** mỗi lần chat Gemini = **1 chức năng 3.X** (hoặc 1 lần merge cả file).  
> **Nguồn nghiệp vụ:** sơ đồ BPMN *RD07. QUẢN LÝ DANH MỤC DỊCH VỤ, SẢN PHẨM NGHIÊN CỨU*.  
> **Mock đã có:** route `/san-pham-nghien-cuu`, `webapp/src/data/rd07Spdv.ts`, `eform-rd07-seed.ts` (B1–B7).  
> **Outline:** `docs/ba/SRS-OUTLINE-Pha1-CS-cho-Gemini.md` §12.  
> **File output:** `docs/ba/Tài liệu SRS/RD07/SRS-RD07-01-Quan-ly-danh-muc-SPDV-v0.1.md`

---

## Prompt hệ thống (dán 1 lần đầu mỗi chat)

```text
Bạn là Business Analyst viết tài liệu SRS dạng Markdown cho hệ thống QTKHCN (Viettel High Tech).

QUY TẮC BẮT BUỘC:
1. Chỉ output Markdown SRS (không giải thích dài ngoài file).
2. Frontmatter YAML: ma_srs=SRS-RD07-01, ten, nhom=RD07, version=0.1, tac_gia, ngay_tao, trang_thai=nhap, nhap_cho_vts, oq_lien_quan, blueprint_nguon.
3. Sau frontmatter: tiêu đề + ## TÀI LIỆU THIẾT KẾ CHI TIẾT (SRS) + dòng Phân hệ + Bảng ghi nhận thay đổi + Trang ký (trống) + Mục lục.
4. Đủ 6 mục: 1 Giới thiệu · 2 Tổng quan (2.2 mermaid flowchart 4 tuyến) · 3 Thiết kế chi tiết · 4 Dùng chung · 5 Quản trị dữ liệu (5.1–5.7) · 6 Phụ lục (bảng OQ).
5. Mỗi chức năng = 3.X với đủ 3.X.1 → 3.X.5. Bảng field 7 cột: STT|Tên|Kiểu dữ liệu [Độ dài]|Input/Output|Giá trị khởi tạo|Mô tả mapping CSDL|Ghi chú.
6. Bám đúng 4 tuyến: Đơn vị QLDM SPDV · TT KD VHT · TTNCSP · P.TCKT VHT. B3/B4/B5 chạy SONG SONG sau B2. Gateway B6: "Đủ căn cứ" → B7; "Không đủ căn cứ" → gửi thông báo email, kết thúc, KHÔNG ghi DB.
7. Timer B2: ngày 20 tháng cuối của Quý N. Trigger B1: sau KHN phê duyệt hoặc chỉ đạo BTGĐ.
8. Không bịa API/DB — thiếu thì [CẦN XÁC NHẬN] + OQ-QTKHCN-xxx. Tiếng Việt. Không sinh .docx.
```

---

## Thứ tự chạy

| Lần | Chức năng | Ghi chú |
|---|---|---|
| 0 | §3.0 Tổng thể | Mermaid: B1→B2→parallel(B3,B4,B5)→B6→(đủ→B7 DB \| không đủ→email end) |
| 1 | §3.1 B1 đầu năm | Tuyến QLDM SPDV |
| 2 | §3.2 B2 yêu cầu quý | Timer 20 cuối quý |
| 3 | §3.3 B3 TT KD | SPDV kinh doanh TCT |
| 4 | §3.4 B4 TTNCSP | SPDV NCPT |
| 5 | §3.5 B5 P.TCKT | DT / CP / LN |
| 6 | §3.6 B6 gateway căn cứ | Đủ / Không đủ |
| 7 | §3.7 B7 cập nhật Quý N | Ghi Danh mục SPDV |
| 8 | §3.8 Tra cứu danh mục | Lọc tuyến · vòng đời · quý |
| MERGE | Ghép 3.0–3.8 + mục 1,2,4,5,6 | 1 file hoàn chỉnh |

---

## PROMPT — §3.0 Quy trình tổng thể

```text
Viết mục 3.0 cho SRS-RD07-01: Quy trình nghiệp vụ tổng thể Quản lý Danh mục SPDV.

Bắt buộc có:
- 3.0.1 Thông tin chung (tác nhân 4 tuyến; ý nghĩa: duy trì DM SPDV đầu năm + cập nhật quý)
- 3.0.2 Danh sách màn hình liên quan (danh sách kỳ cập nhật, chi tiết SPDV, form B1–B7)
- 3.0.3 (có thể rút gọn) tham chiếu entity: KyCapNhatSpdv, SpdvItem, trạng thái vòng đời (nghiên cứu/nghiệm thu/kinh doanh/cải tiến)
- 3.0.4 Luồng: bảng Bước|Mô tả cho B1→B7; kèm mermaid flowchart (parallel gateway sau B2, exclusive gateway sau B6)
- 3.0.5 BR: timer 20; không ghi DB nếu không đủ căn cứ; B7 chỉ mở khi đủ căn cứ và B3+B4+B5 đã xong

Nguồn: sơ đồ BPMN RD07; mock webapp/src/data/rd07Spdv.ts.
```

---

## PROMPT — §3.1 B1

```text
Viết 3.1 B1 — Cập nhật danh mục SPDV và trạng thái SPDV đầu năm (tuyến Đơn vị QLDM SPDV).
Trigger: sau KHN phê duyệt hoặc chỉ đạo BTGĐ.
Form seed key: bm-07-01-cnhap-dm-spdv-dau-nam.
Đủ 3.1.1→3.1.5; bảng field 7 cột; BR gắn mã BR-RD07-B1-….
```

---

## PROMPT — §3.2 B2

```text
Viết 3.2 B2 — Gửi yêu cầu cập nhật thông tin trong danh mục SPDV.
Timer: ngày 20 tháng cuối Quý N. Sau B2 mở song song B3, B4, B5.
Form: bm-07-02-yeu-cau-cap-nhat.
Đủ 3.2.1→3.2.5.
```

---

## PROMPT — §3.3 B3

```text
Viết 3.3 B3 — TT KD VHT cập nhật thay đổi danh mục SPDV kinh doanh của TCT (song song B4/B5).
Form: bm-07-03-tt-kd-cap-nhat. Đủ 3.3.1→3.3.5.
```

---

## PROMPT — §3.4 B4

```text
Viết 3.4 B4 — TTNCSP cập nhật thay đổi danh mục SPDV NCPT (song song B3/B5).
Có thể liên kết mã NV KHCN. Form: bm-07-04-ttncsp-cap-nhat. Đủ 3.4.1→3.4.5.
```

---

## PROMPT — §3.5 B5

```text
Viết 3.5 B5 — P.TCKT VHT cập nhật doanh thu, chi phí, lợi nhuận cho SPDV (song song B3/B4).
Form: bm-07-05-tckt-dt-cp-ln. Đủ 3.5.1→3.5.5.
```

---

## PROMPT — §3.6 B6

```text
Viết 3.6 B6 — Tổng hợp thông tin và xác thực các căn cứ điều chỉnh (tuyến QLDM SPDV).
Exclusive gateway:
- Đủ căn cứ → chuyển B7
- Không đủ căn cứ → gửi thông báo (email), kết thúc luồng, không cập nhật DB
Form: bm-07-06-tong-hop-xac-thuc. Đủ 3.6.1→3.6.5. BR rõ ràng về điều kiện song song B3+B4+B5 phải xong trước khi B6.
```

---

## PROMPT — §3.7 B7

```text
Viết 3.7 B7 — Cập nhật vào Danh mục SPDV tại Quý N (ghi DB / data store "Cập nhật Danh mục SPDV").
Form: bm-07-07-cap-nhat-dm-quy-n. Đủ 3.7.1→3.7.5.
```

---

## PROMPT — §3.8 Tra cứu

```text
Viết 3.8 Tra cứu / lọc danh mục SPDV (theo tuyến, phân loại KD/NCPT, vòng đời, quý, trạng thái kỳ).
Tham chiếu mock UI SanPhamNghienCuuList / Danh mục SPDV — RD07. Đủ 3.8.1→3.8.5.
```

---

## PROMPT — MERGE

```text
Ghép các mục 3.0–3.8 đã viết thành 1 file SRS-RD07-01 hoàn chỉnh theo khung 6 mục cấp 1.
Bổ sung mục 1, 2 (mermaid 4 swimlane), 4, 5.1–5.7, 6 (OQ).
Đối chiếu DoD: .harness/rules/srs-definition-of-done.md.
Không đổi nghiệp vụ đã khóa: parallel B3–B5; gateway đủ/không đủ căn cứ; timer 20 cuối quý.
```

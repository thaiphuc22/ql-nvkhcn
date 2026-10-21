---
ma: BA-KHAO-SAT-TAC-NHAN-RD06-RD08
version: 0.1
ngay: 2026-09-29
trang_thai: Nháp — giả định tạm khóa, chờ VTS xác nhận
oq: [OQ-QTKHCN-043, OQ-QTKHCN-044]
nguon:
  - docs/req/1. Quy trinh Phan mem KHCN chi tiet (clean).md §6, §8
  - docs/req/RD03-RD06-requirements.md (ASSUMP-005, OQ-010 gốc)
  - docs/req/RD07-RD10-requirements.md (OQ-014 gốc)
  - docs/ba/Tài liệu SRS/RD06/Luong-du-lieu-quyet-toan-RD06.02-v0.1.md
---

# Khảo sát tác nhân RD06 / RD08

Tài liệu gốc **bỏ trống** bảng tác nhân mục 6.1.2 / 6.2.2 và không có bảng tác nhân mục 8. Bản này đề xuất **tạm khóa** để thiết kế BPMN stub + UI mock; mọi dòng đánh `[GIẢ ĐỊNH]` cần VTS/P.TCKT/P.KHCN xác nhận.

## 1. RD06 — Quyết toán

### 1.1 Cơ sở suy luận

| Giả định | Lý do |
|---|---|
| AS-RD06-01 | Khung phê duyệt tương tự RD05 (ASSUMP-005): PM lập → CQ thẩm định → lãnh đạo phê duyệt |
| AS-RD06-02 | P.TCKT / chuyên quản tài chính là tuyến chính đối soát số liệu SAP (REQ-RD06-IR-001) |
| AS-RD06-03 | Cấp TĐ thêm CQ KHCN TĐ + BTGĐ TĐ (cùng pattern RD05.02) |
| AS-RD06-04 | Pha dữ liệu B01–B44 (RD06.02) → map sang nhóm vai trò dưới đây |

### 1.2 Tác nhân đề xuất — RD06.01 (Cấp Cơ sở)

| Nhóm | Tác nhân | Vai trò đề xuất | candidateGroup gợi ý |
|---|---|---|---|
| PM | PM, PA | Khởi tạo HS QT; gắn mã NV–SAP; lập BM dự toán–chi phí; trình ký | `PM` |
| BGĐ TT / Khối | Chỉ huy TT / PGĐ Khối | Ký duyệt HS QT nội bộ đơn vị | `BGD_TT`,`BGD_KHOI` |
| CQ chuyên môn | CQ KHCN, MS, NS | Nhận xét / xác nhận phạm vi NV, mua sắm, nhân sự | `CQ_KHCN`,`CQ_MS`,`CQ_NS` |
| Tài chính | Chuyên quản TCKT; TP TCKT | Đối soát bút toán SAP, quỹ 3561.02, thanh toán, HĐ/công nợ; lập BC QT | `TCKT` |
| CQNV VHT | TP CLKHCN; TP TCKT | Thẩm định chung & trình phê duyệt | `CQNV_VHT` |
| BTGĐ / TGĐ VHT | PTGĐ chuyên trách / TGĐ | Phê duyệt Báo cáo quyết toán cấp CS; khóa số | `BTGD_VHT`,`TGD` |

### 1.3 Tác nhân đề xuất — RD06.02 (Cấp Tập đoàn)

Giữ toàn bộ tuyến CS, bổ sung:

| Nhóm | Tác nhân | Vai trò đề xuất | candidateGroup |
|---|---|---|---|
| CQ KHCN VHT | Chuyên hướng | Lập CV đề nghị QT cấp TĐ | `CQ_KHCN` |
| CQ KHCN TĐ | Chuyên hướng / thay thế CQ VHT | Thẩm định HS; phiếu nhận xét TĐ | `CQ_KHCN_TD` |
| BTGĐ TĐ | TGĐ TĐ / ủy quyền | Phê duyệt BC QT & khóa số cấp TĐ | `BTGD_TD` |

### 1.4 Mapping pha dữ liệu → vai trò (RD06.02)

| Pha | Bước | Vai trò chính |
|---|---|---|
| A Khởi tạo | B01–B04 | PM + TCKT (neo mã SAP) |
| B Lập BM & chứng từ | B05–B13 | TCKT, PM (tài sản), TTMS (HĐ), PNS (nhân công) — song song |
| C Thẩm định VHT | B14–B24 | CQ chuyên môn + CQNV + BTGĐ VHT |
| D Thẩm định TĐ | B25–B37 | CQ KHCN TĐ |
| E Phê duyệt & khóa | B38–B44 | BTGĐ TĐ |

**Câu hỏi còn mở → `OQ-QTKHCN-043`:** VTS xác nhận bảng 1.2/1.3 có đúng tổ chức thực tế không? Có cần thêm Đơn vị chủ trì quỹ / Kiểm toán nội bộ không?

---

## 2. RD08 — Sở hữu trí tuệ

### 2.1 Cơ sở suy luận

| Giả định | Lý do |
|---|---|
| AS-RD08-01 | PM/tác giả khởi tạo hồ sơ gắn NV (BR-RD08-001) |
| AS-RD08-02 | CQ QLKHCN / Pháp chế thẩm định nội bộ trước khi nộp đơn ngoài |
| AS-RD08-03 | Đồng bộ file với Storage / kho tài liệu (REQ-RD08-IR-001) — P.CNTT hỗ trợ kỹ thuật, không phê duyệt nghiệp vụ |
| AS-RD08-04 | Phân loại SC / GPHI / BQTG / NH / KHCN theo PL03.1 |

### 2.2 Tác nhân đề xuất

| Nhóm | Tác nhân | Vai trò đề xuất | candidateGroup |
|---|---|---|---|
| PM / Tác giả | PM, PA, NNC / tác giả | Khởi tạo HS SHTT; cập nhật quyền sở hữu; trình duyệt nội bộ | `PM` |
| BGĐ TT / Khối | Chỉ huy đơn vị | Ký xác nhận đơn vị chủ quản / tỷ lệ quyền | `BGD_TT`,`BGD_KHOI` |
| CQ QLKHCN | Chuyên quản CLKHCN | Thẩm định hồ sơ; theo dõi trạng thái đăng ký bảo hộ | `CQ_KHCN` |
| Pháp chế / SHTT | Nhân sự pháp chế (nếu có) | Rà tỷ lệ quyền, chủ sở hữu, hồ sơ nộp Cục SHTT | `PHAP_CHE` |
| BTGĐ VHT | PTGĐ chuyên trách | Phê duyệt trình nộp đơn / công nhận nội bộ | `BTGD_VHT` |
| Hệ thống | Storage / P.CNTT | Đồng bộ tài liệu (service task, không user task) | — |

**Câu hỏi còn mở → `OQ-QTKHCN-044`:** Có bắt buộc Pháp chế riêng hay CQ KHCN kiêm? Quy trình nộp Cục SHTT có bước ngoài hệ thống không? Ai nhận kết quả văn bằng?

---

## 3. Ảnh hưởng sản phẩm

| Artifact | Cập nhật |
|---|---|
| `rd-lifecycle.ts` | Điền `tacNhan` RD06.01/02, RD08 theo bảng trên |
| Stub BPMN | `candidateGroups` theo cột gợi ý |
| UI SPDV/SHTT | Không phụ thuộc khảo sát này (CRUD master data) |
| OQ-TRACKER | Mở `043`, `044` — trạng thái Mở, chờ VTS |

**Không đánh dấu Đã trả lời** cho đến khi VTS/P.TCKT/P.KHCN phản hồi cột Phản hồi.

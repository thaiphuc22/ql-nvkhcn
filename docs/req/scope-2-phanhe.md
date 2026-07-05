# Phạm vi nghiệp vụ — Phân hệ Quản lý Quy trình & Phân hệ Quản lý Nhiệm vụ KHCN

> **Dự án:** Hệ thống Quản trị Khoa học Công nghệ (QTKHCN) — VHT
> **Ngày:** 2026-07-03 · **Đơn vị lập:** Tư vấn giải pháp (VTIT)
> **Nguồn tổng hợp:** `1. Quy trinh Phan mem KHCN chi tiet (clean).md`, `BC_PRESALE_VTCN_VHT_CDS.md`,
> catalog yêu cầu `RD01-RD02 / RD03-RD06 / RD07-RD10-requirements.md`.
> **Mục đích:** thống nhất với khách phạm vi nghiệp vụ cần đáp ứng của 2 phân hệ trọng tâm.

---

## Bức tranh chung: quan hệ engine ↔ nghiệp vụ

```
Phân hệ QL QUY TRÌNH (Camunda 8) = ENGINE  ──cung cấp──▶  luồng phê duyệt
        │                                                      │
        └── định tuyến, hội đồng, DMN, rework, SLA, chữ ký số   │
                                                                ▼
Phân hệ QL NV KHCN = NGHIỆP VỤ  ── RD01 → RD02 → RD03 → RD05 → RD06 (vòng đời đề tài)
```

- **QL Quy trình** là bộ máy dùng chung, phải sẵn sàng trước (foundation).
- **QL NV KHCN** là nghiệp vụ tiêu thụ engine nhiều nhất (vòng đời một NV KHCN).

---

## 1. Phân hệ Quản lý Quy trình (Camunda 8)

Nền tảng quy trình động, cung cấp năng lực dùng chung cho **mọi** luồng RD01–RD10.

| # | Nghiệp vụ cần đáp ứng | Diễn giải |
|---|---|---|
| P1 | Định nghĩa & vận hành quy trình động (BPMN) | Cấu hình luồng phê duyệt, sửa quy trình không phải đổi code |
| P2 | Định tuyến hồ sơ đa cấp/đa loại | Cơ sở ↔ Tập đoàn; theo loại điều chỉnh (chủ nhiệm/nội dung/mục tiêu/tạm dừng/dừng) |
| P3 | Gán việc theo vai trò + hàng đợi công việc (worklist) | Mỗi bước gán đúng tác nhân; người dùng thấy "việc của tôi" |
| P4 | Duyệt tuần tự & song song, cơ chế hội đồng | Nhiều người ký; phiên họp 1 & 2; tổng hợp phiếu nhận xét/đánh giá |
| P5 | Quy tắc quyết định (DMN/decision table) | Định tuyến điều chỉnh (RD04), trạng thái Đạt/Chưa đạt, sinh danh sách hội đồng tự động/thủ công |
| P6 | Luồng quay lại (rework) khi từ chối/Chưa đạt | Trả hồ sơ về đúng bước, bắt buộc lý do — ⚠️ *đích chưa rõ (OQ-002)* |
| P7 | Vai trò thay thế (proxy) | Chuyên quản VHT nhập liệu hộ tác nhân Tập đoàn |
| P8 | SLA/thời hạn từng bước + nhắc việc | Theo dõi tiến độ, cảnh báo quá hạn — ⚠️ *chưa có số (OQ-006)* |
| P9 | Lịch sử phê duyệt, audit log, chữ ký số | Vết đầy đủ; QĐ khóa sửa sau ban hành — ⚠️ OQ-006 |
| P10 | Versioning quy trình & danh sách hội đồng | Đổi quy trình/thành viên HĐ theo Quyết định mới, giữ bản cũ — ⚠️ AMB-003 |

🚩 **Blocker:** License Camunda 8 chưa chốt (mốc đề xuất 10/07/2026); cần SSO/IAM để xác định tác nhân.

---

## 2. Phân hệ Quản lý Nhiệm vụ KHCN (7/11 quy trình ưu tiên 2026)

Số hoá vòng đời một NV KHCN, chạy trên engine ở trên.

| Mã | Nghiệp vụ | Nội dung phải đáp ứng | Pha |
|---|---|---|---|
| RD01 | Xét duyệt Chủ trương | Khởi tạo → ký cấp TT/Khối → CQNV thẩm định → Báo cáo thẩm định → HĐ KHCN duyệt → TGĐ ban hành QĐ chủ trương (CS & TĐ) | 1 |
| RD02 | Xét duyệt NV KHCN | Kế thừa chủ trương → chuyên quản duyệt Đạt/Chưa đạt → HĐXD (phiên 1&2) → HĐ KHCN → TGĐ phê duyệt mở mới đề tài (CS/TĐ) | 1 |
| RD05 | Nghiệm thu | Khởi tạo hồ sơ → QĐ TL HĐNT → HĐNT đánh giá (cấp TĐ có Tổ KT) → TGĐ/BTGĐ công nhận kết quả | 1 |
| RD06 | Quyết toán | Từ QĐ công nhận KQ → lập & phê duyệt Báo cáo quyết toán chi phí (số liệu từ SAP) | 1 ⚠️ |
| RD08 | Sở hữu trí tuệ | Đăng ký SHTT (bài báo, sáng chế), quản lý công nghệ lõi | 1 ⚠️ |
| RD10 | Lưu trữ hồ sơ/biểu mẫu | Form mẫu hồ sơ/báo cáo, danh sách quy trình/quy định (master data dùng chung) | 1 |
| RD03.06 | Báo cáo tiến độ | Khởi tạo/cập nhật/trình ký/xuất báo cáo tiến độ theo form mẫu | 1 |
| RD03 | Thực hiện NV KHCN | Quản lý nhân sự/mua sắm/chi phí/tài sản/nội dung — tích hợp 5 hệ thống | 2 |
| RD04 | Điều chỉnh NV KHCN | 10 luồng: chủ nhiệm / nội dung / mục tiêu / tạm dừng / dừng (CS & TĐ) | 2 |

**Nghiệp vụ nền xuyên suốt:**
- Quản lý hồ sơ & dữ liệu đề tài thống nhất, kế thừa xuyên giai đoạn (chủ trương → xét duyệt → nghiệm thu → quyết toán).
- Ma trận phân quyền theo nhóm tác nhân (PM, CQNV, các Hội đồng, BTGĐ VHT/Tập đoàn).
- Ràng buộc chuyển giai đoạn (gate): mỗi giai đoạn chỉ mở khi giai đoạn trước có QĐ tương ứng.

🚩 **Blocker:** RD06 (Quyết toán) tài liệu gốc bỏ trống tác nhân/luồng → cần khảo sát; RD04 thiếu ngưỡng định tuyến; NFR toàn phân hệ chưa có.

---

## 3. Thứ tự ưu tiên & điều kiện triển khai

- **QL Quy trình sẵn sàng trước** (nền của RD01–RD06) — foundation F5 trong harness.
- Pha 1 (2026) của QL NV KHCN = **RD01, RD02, RD05, RD06, RD08, RD10, RD03.06** ("7/11 quy trình" presale).
- Đã có backlog **User Story + Acceptance Criteria** cho RD01/RD02/RD05 (xem `EPIC-QLNVKHCN-backlog.md`, `EPIC-QLNVKHCN-AC.md`).

## 4. 3 điểm bắt buộc chốt với khách

| # | Vấn đề | Ảnh hưởng | Mã |
|---|---|---|---|
| 1 | License Camunda 8 | Chặn thiết kế engine (cả 2 phân hệ) | Blocker presale |
| 2 | NFR/RBAC/chữ ký số/SLA | Xuyên suốt cả 2 phân hệ | OQ-006 |
| 3 | Luồng rework khi từ chối + ngưỡng RD04 + khảo sát RD06 | Chặn hoàn thiện AC & thiết kế | OQ-002 / OQ-008 / OQ-010 |

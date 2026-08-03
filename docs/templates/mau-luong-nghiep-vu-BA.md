# Mẫu mô tả luồng nghiệp vụ (dành cho BA)

> Dùng file này khi được giao mô tả chi tiết một luồng RD0x.xx. Copy phần
> "Template trống" ở mục 2 sang file mới đặt tên `RDxx.xx-<ten-luong>.md`,
> điền theo hướng dẫn ở mục 1, đối chiếu checklist ở mục 4 trước khi nộp lại.
>
> Ví dụ điền đầy đủ: xem mục 3 (RD02.02 — Xét duyệt NV KHCN cấp Tập đoàn).

---

## 1. Hướng dẫn điền

### 1.1. Loại bước (bắt buộc dùng đúng 1 trong các giá trị sau)

| Giá trị | Khi nào dùng |
|---|---|
| `Start Event` | Điểm bắt đầu luồng |
| `User Task` | Có người thao tác trên form/UI |
| `Service Task` | Hệ thống tự xử lý (đồng bộ dữ liệu, gọi API, kiểm tra điều kiện...) — không có người thao tác |
| `Exclusive Gateway` | Rẽ nhánh, **chỉ 1** nhánh được đi tiếp (Đạt/Chưa đạt, Đồng ý/Từ chối...) |
| `Parallel Gateway` | Tách/gộp nhiều nhánh chạy **đồng thời**, tất cả đều phải xong mới gộp |
| `Call Activity` | Gọi sang một quy trình con khác (vd. quy trình con Hội đồng) |
| `Timer/Boundary Event` | Có SLA, nhắc việc, hoặc tự động escalate khi quá hạn |
| `End Event` | Điểm kết thúc luồng (hoặc kết thúc 1 nhánh) |

**Lưu ý quan trọng:** nếu một bước có 2 kết quả trở lên (vd. "Đạt" / "Không đạt")
thì đó **luôn luôn là 2 bước riêng**: 1 `Service Task`/`User Task` xử lý, theo
sau bởi 1 `Exclusive Gateway` để rẽ nhánh. Không gộp việc "xử lý" và "rẽ nhánh"
làm một bước — nhầm lẫn này từng khiến quy trình chạy cả hai nhánh cùng lúc.

### 1.2. Giải thích các cột

**Bảng A — Luồng chính**

| Cột | Ý nghĩa | Ghi chú |
|---|---|---|
| Mã bước | Định danh duy nhất, dạng `B01`, `B02`... | Dùng để tham chiếu ở cột "Bước tiếp theo" và Bảng B |
| Tên bước | Tên nghiệp vụ ngắn gọn | |
| Loại bước | Xem bảng 1.1 | |
| Vai trò thực hiện | Mã vai trò (candidateGroup) — lấy từ danh mục vai trò dùng chung, KHÔNG tự đặt tên mới | Chỉ điền khi Loại bước = `User Task`. Nếu chưa có trong danh mục, ghi `[MỚI] <tên đề xuất>` để BE bổ sung |
| Mã biểu mẫu | Mã formKey của biểu mẫu dùng ở bước này | Chỉ điền khi Loại bước = `User Task`. Ghi `N/A` cho các loại khác |
| Action & biến kết quả | Tên nút bấm **và** tên biến + giá trị nghiệp vụ mà nút đó set (vd. `Phê duyệt → ketQuaXetDuyet = "dat"`) | Không chỉ ghi tên nút — phải ghi rõ giá trị, vì đây là chỗ hay lệch giữa các luồng (một luồng dùng `"dat"`, luồng khác dùng `"Đạt"` cho cùng ý nghĩa) |
| Điều kiện / Default | Với `Exclusive Gateway`: mỗi nhánh 1 dòng, ghi điều kiện xét theo biến ở cột trên; đánh dấu đúng 1 nhánh là **Default** | Nhánh Default nên là nhánh an toàn (từ chối/lỗi), **không mặc định là nhánh Đồng ý** |
| Bước tiếp theo | Mã bước đích | Gateway có nhiều dòng → mỗi dòng 1 đích khác nhau |

**Bảng B — Chi tiết bổ sung** (điền cho bước nào cần, không cần điền hết)

| Cột | Ý nghĩa |
|---|---|
| Mã bước | Khớp với Bảng A |
| Dữ liệu vào/ra chính | Các trường nghiệp vụ chính được đọc/ghi ở bước này (không phải biến điều khiển Camunda) |
| Rework khi bị từ chối | Nếu bước trước có thể trả về bước này để làm lại: quay lại bước nào, có giới hạn số vòng không |
| SLA / Thời hạn | Số ngày xử lý, có nhắc việc/escalate không |
| Tích hợp hệ thống ngoài | Chỉ với `Service Task`: hệ thống đích (QLNS/MS/SAP/QLTS/PLM...), xử lý khi lỗi/timeout |
| Ghi chú | Câu hỏi mở, rủi ro, điều chưa chốt |

### 1.3. Quy tắc chung

- Mỗi hàng trong Bảng A = một node BPMN. Không gộp nhiều bước vào 1 hàng.
- Nếu chưa biết câu trả lời (vd. vai trò chưa chốt, điều kiện rẽ nhánh chưa
  rõ) — **ghi rõ là chưa biết**, đừng đoán rồi điền đại. Dùng cột Ghi chú.
- Không tự đặt mã vai trò/mã biểu mẫu mới nếu chưa xác nhận với người phụ
  trách kiến trúc — đánh dấu `[MỚI]` để BE/AR duyệt.

---

## 2. Template trống (copy phần này sang file mới)

```
Quy trình: RDxx.xx - <Tên luồng>
Người soạn: ___ | Ngày: ___ | Phiên bản: v0.1

### Bảng A — Luồng chính

| Mã bước | Tên bước | Loại bước | Vai trò thực hiện | Mã biểu mẫu | Action & biến kết quả | Điều kiện / Default | Bước tiếp theo |
|---|---|---|---|---|---|---|---|
|   |   |   |   |   |   |   |   |

### Bảng B — Chi tiết bổ sung

| Mã bước | Dữ liệu vào/ra chính | Rework khi bị từ chối | SLA / Thời hạn | Tích hợp hệ thống ngoài | Ghi chú |
|---|---|---|---|---|---|
|   |   |   |   |   |   |
```

---

## 3. Ví dụ mẫu — RD02.02: Xét duyệt NV KHCN cấp Tập đoàn

> Dựa theo `docs/req/RD01-RD02-requirements.md` (mục 5) và danh mục vai trò
> `webapp/src/data/roles.ts`. Một số điểm trong ví dụ này **vẫn đang là câu
> hỏi mở** của dự án (OQ-001, OQ-002) — sample chỉ minh hoạ cách điền, không
> phải quyết định đã chốt.

Quy trình: RD02.02 - Xét duyệt NV KHCN cấp Tập đoàn
Người soạn: Nguyễn A | Ngày: 2026-07-15 | Phiên bản: v0.1

### Bảng A — Luồng chính

| Mã bước | Tên bước | Loại bước | Vai trò thực hiện | Mã biểu mẫu | Action & biến kết quả | Điều kiện / Default | Bước tiếp theo |
|---|---|---|---|---|---|---|---|
| B01 | Bắt đầu (nhận hồ sơ từ RD01.02) | Start Event | N/A | N/A | N/A | N/A | B02 |
| B02 | Kiểm tra đã có QĐ phê duyệt chủ trương cấp TĐ (BR-RD0202-001) | Service Task | N/A | N/A | Hệ thống tự kiểm tra → `coQdChuTruongTD = true/false` | N/A | B03 |
| B03 | Rẽ nhánh theo kết quả kiểm tra | Exclusive Gateway | N/A | N/A | N/A | Nhánh 1: `coQdChuTruongTD = true` → đi B04<br>Nhánh 2 (**Default**): `coQdChuTruongTD = false` → đi B99b (từ chối khởi tạo) | B04 / B99b |
| B04 | Ký duyệt CV & HS đề nghị xét duyệt | User Task | `TP_CLKHCN` (đồng thời cần `TP_TCKT`, `TP_NS`, `GD_TTMS` tuỳ loại hồ sơ — **[CHƯA CHỐT] xem Ghi chú B04**) | `F-RD0202-01` *(ví dụ, cần xác nhận mã thật)* | Ký duyệt → `ketQuaKyDuyetCQNV = "dat"` / Từ chối → `ketQuaKyDuyetCQNV = "khong_dat"` | N/A | B05 |
| B05 | HĐXD Tập đoàn thẩm định hồ sơ | User Task | `HDXD_TD` | `F-RD0202-02` *(ví dụ)* | Thông qua → `ketQuaThamDinhHDXD = "dat"` / Yêu cầu bổ sung → `ketQuaThamDinhHDXD = "chua_dat"` | N/A | B06 |
| B06 | Rẽ nhánh theo kết quả HĐXD | Exclusive Gateway | N/A | N/A | N/A | Nhánh 1: `ketQuaThamDinhHDXD = "dat"` → đi B07<br>Nhánh 2 (**Default**): `ketQuaThamDinhHDXD = "chua_dat"` → đi B04 (rework) | B07 / B04 |
| B07 | HĐ KHCN Tập đoàn nhận xét & phê duyệt | User Task | `HDKHCN_TD` | `F-RD0202-03` *(ví dụ)* | Đồng ý → `ketQuaHDKHCN_TD = "dong_y"` / Yêu cầu hiệu chỉnh → `ketQuaHDKHCN_TD = "hieu_chinh"` | N/A | B08 |
| B08 | Rẽ nhánh theo kết quả HĐ KHCN | Exclusive Gateway | N/A | N/A | N/A | Nhánh 1: `ketQuaHDKHCN_TD = "dong_y"` → đi B09<br>Nhánh 2 (**Default**): `ketQuaHDKHCN_TD = "hieu_chinh"` → đi B04 (rework) | B09 / B04 |
| B09 | BTGĐ Tập đoàn phê duyệt QĐ TL HĐXD & QĐ mở mới đề tài | User Task | `BTGD_TD` | `F-RD0202-04` *(ví dụ)* | Phê duyệt → `ketQuaPheDuyetTD = "dat"` | N/A | B10 |
| B10 | Ban hành QĐ phê duyệt NV KHCN cấp Tập đoàn | End Event | N/A | N/A | N/A | N/A | — |
| B99b | Kết thúc — từ chối khởi tạo (chưa có QĐ chủ trương) | End Event | N/A | N/A | N/A | N/A | — |

### Bảng B — Chi tiết bổ sung

| Mã bước | Dữ liệu vào/ra chính | Rework khi bị từ chối | SLA / Thời hạn | Tích hợp hệ thống ngoài | Ghi chú |
|---|---|---|---|---|---|
| B02 | Đọc: `maHoSoRD0102`, trạng thái QĐ chủ trương | N/A | N/A | Đọc dữ liệu nội bộ từ hồ sơ RD01.02 (không phải hệ thống ngoài) | — |
| B04 | Vào: CV đề nghị, HS đề nghị xét duyệt. Ra: bản ký duyệt | **[CHƯA CHỐT]** quay lại đâu nếu từ chối ở bước này — hiện chưa có bước "trước B04" trong luồng TĐ, cần làm rõ | Đề xuất 3 ngày làm việc — **cần khách xác nhận** | — | Yêu cầu 2.2.2 ghi 4 vai trò cùng ký (TP_CLKHCN/TP_TCKT/TP_NS/GD_TTMS) nhưng chưa rõ ký tuần tự hay song song, và có bắt buộc đủ cả 4 không — đề xuất tách rõ khi làm việc với khách |
| B05 | Vào: hồ sơ đã ký duyệt. Ra: biên bản/phiếu nhận xét HĐXD | Quay lại B04 để bổ sung hồ sơ, **giới hạn số vòng: [CHƯA CHỐT — OQ-002]** | — | — | — |
| B07 | Vào: kết quả thẩm định HĐXD. Ra: PNX/PĐG/BB họp HĐ KHCN | Quay lại B04, **giới hạn số vòng: [CHƯA CHỐT — OQ-002]** | — | — | Nhánh "Yêu cầu hiệu chỉnh" đang được đặt là Default ở B08 (an toàn hơn nhánh Đồng ý) — giữ nguyên quy ước này khi vẽ BPMN |
| B09 | Vào: hồ sơ đã qua HĐ KHCN. Ra: QĐ TL HĐXD, QĐ mở mới đề tài | N/A | — | — | Vai trò Tập đoàn không thao tác trực tiếp trên hệ thống — cần xác nhận cơ chế "ký hộ"/vai trò thay thế (xem ASSUMP-001 trong RD01-RD02-requirements.md) |

---

## 4. Checklist tự kiểm tra trước khi nộp

- [ ] Mỗi bước rẽ nhánh (`Exclusive Gateway`/`Parallel Gateway`) có ≥ 2 dòng,
      mỗi dòng 1 điều kiện, đúng 1 dòng được đánh dấu Default.
- [ ] Nhánh Default là nhánh an toàn (từ chối/lỗi), không phải nhánh
      phê duyệt/đồng ý mặc định.
- [ ] Mọi `User Task` có Vai trò thực hiện — không để trống (để trống nghĩa
      là chỉ admin thao tác được).
- [ ] Cột "Action & biến kết quả" có ghi giá trị cụ thể, không chỉ tên nút.
- [ ] Những chỗ chưa biết được đánh dấu `[CHƯA CHỐT]` kèm lý do, không tự
      suy đoán.
- [ ] Đối chiếu "Bước tiếp theo" — không có bước nào bị mồ côi (không ai trỏ
      tới) hoặc trỏ tới mã bước không tồn tại.

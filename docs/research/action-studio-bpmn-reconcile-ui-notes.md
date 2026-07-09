# Action Studio - BPMN reconcile summary in "Luật hiển thị nút"

Ngày ghi chú: 2026-07-08

## Bối cảnh

Màn `/cau-hinh-hanh-dong` hiện có hai phần liên quan chặt chẽ:

- `Đồng bộ BPMN`: đọc/đối soát bước xử lý từ BPMN và sinh các dòng `ActionAvailabilityPolicy`.
- `Luật hiển thị nút`: nơi admin chỉnh chính sách nút nào hiện ở đâu, cho ai, ở trạng thái nào, gắn biểu mẫu nào.

Nhận xét chính: nên ghép hai phần này về trải nghiệm cấu hình, nhưng không nên nhập toàn bộ thành một bảng hoặc một form duy nhất. `Đồng bộ BPMN` là bước khởi tạo/đối soát, còn `Luật hiển thị nút` là bước chỉnh chính sách vận hành.

## Vùng cảnh báo đề xuất trong tab "Luật hiển thị nút"

Thêm một vùng cảnh báo/tóm tắt nhỏ ở đầu tab `Luật hiển thị nút`, ví dụ:

- Có X bước thiếu nút.
- Có Y bước/outcome còn dùng luật chung wildcard.
- Có Z luật orphan.
- Nút hành động: `Xem đối soát BPMN`.

Nút nên là `Xem đối soát BPMN` hơn là chỉ `Đồng bộ từ BPMN`, vì vùng này trước hết là health check để admin hiểu vấn đề. Trong tab đối soát mới nên có thao tác đồng bộ/scaffold.

## Logic hiển thị cảnh báo

Vùng cảnh báo nên lấy dữ liệu từ logic đối soát BPMN <-> `ActionAvailabilityPolicy`, tức logic tương tự `reconcileProcess`.

Nguồn kiểm tra:

- Danh sách quy trình có thể đối soát: các process có `taskSteps` và có bảng routing.
- Danh sách user task: từ `proc.taskSteps`.
- Danh sách outcome của từng user task: từ routing table, ví dụ `SUBMIT`, `APPROVE`, `RETURN`, `REJECT`.
- Mapping outcome -> action button: ví dụ `APPROVE` -> `APPROVE_STEP`, `RETURN` -> `RETURN_STEP`, `REJECT` -> `REJECT_STEP`.
- Tập policy hiện hành: `ActionAvailabilityPolicy[]`.

Một policy được xem là match nếu:

- `enabled = true`.
- `actionCode` đúng với action cần kiểm tra.
- `surface` trống hoặc bằng `DOSSIER_DETAIL`.
- `processCode` trống hoặc bằng process group/code đang kiểm tra.
- `dossierStatus` trống hoặc bằng trạng thái expected của outcome.
- `taskDefinitionKey` trống hoặc bằng key của user task đang kiểm tra.

Các kết quả rollup:

- `missing`: không có policy enabled nào match cho một hoặc nhiều outcome của bước.
- `generic`: có policy match nhưng policy chưa ghim đúng `taskDefinitionKey`, tức đang được phủ bằng luật chung.
- `unfilled`: có policy match nhưng thiếu dữ liệu cần hoàn thiện, đặc biệt là chưa gắn `formKey`.
- `ok`: đã có policy ghim theo bước và đủ thông tin.
- `skipped`: bước được admin đánh dấu bỏ qua có chủ đích.

## "Có X bước thiếu nút" nghĩa là gì?

Một bước bị tính là thiếu nút khi user task có ít nhất một outcome cần action, nhưng không có policy enabled nào match được action tương ứng.

Ví dụ:

- BPMN/routing nói bước `t5` có outcome `APPROVE`, `RETURN`, `REJECT`.
- Hệ thống cần tìm các action `APPROVE_STEP`, `RETURN_STEP`, `REJECT_STEP`.
- Nếu không tìm thấy policy match cho `RETURN_STEP`, bước `t5` bị tính là thiếu nút.

Ý nghĩa nghiệp vụ: hồ sơ có thể tới bước này nhưng người dùng không có nút để xử lý. Vì mô hình fail-closed, đây là lỗi nghiêm trọng và nên hiển thị cảnh báo đỏ.

## "Có Y luật còn dùng wildcard" nghĩa là gì?

Wildcard là policy có điều kiện để trống hoặc `null`, làm rule áp dụng rộng hơn một bước BPMN cụ thể.

Ví dụ:

```ts
{
  actionCode: 'APPROVE_STEP',
  processCode: null,
  taskDefinitionKey: null,
  dossierStatus: 'processing',
  enabled: true,
}
```

Rule này có nghĩa là action `APPROVE_STEP` được phủ cho mọi quy trình, mọi bước, miễn là hồ sơ đang `processing`.

Trong mock/demo, wildcard giúp nhanh có nút ở nhiều bước. Nhưng trong vận hành thật, nó là cảnh báo vì:

- Không biết chính xác nút thuộc bước BPMN nào.
- Khó gắn đúng biểu mẫu theo từng bước.
- Dễ làm nút xuất hiện rộng hơn mong muốn.
- Khó audit vì policy không ghim vào `processCode + taskDefinitionKey`.

Vì vậy chỉ số Y nên hiểu là số bước/outcome đang được phủ bằng luật chung thay vì policy ghim theo bước. Đây là cảnh báo vàng, không phải lỗi đỏ.

## "Có Z luật orphan" nghĩa là gì?

Orphan là policy đang trỏ tới một `taskDefinitionKey` không còn tồn tại trong BPMN hiện tại của quy trình.

Ví dụ:

```ts
{
  processCode: 'RD01',
  taskDefinitionKey: 'Task_ThamDinhCu',
  actionCode: 'APPROVE_STEP',
}
```

Nếu BPMN hiện tại không còn task key `Task_ThamDinhCu`, policy này là orphan.

Nguyên nhân thường gặp:

- Admin sửa BPMN.
- Đổi key user task.
- Xóa bước.
- Deploy/import version BPMN mới.
- Policy cũ chưa được dọn sau khi thay đổi quy trình.

Ý nghĩa nghiệp vụ: policy này thường không làm hiện nút sai ngay lập tức, nhưng tạo rác cấu hình và có thể làm admin hiểu nhầm rằng bước cũ vẫn còn được kiểm soát.

## Plan refactor UI

### P1 - Tính health summary dùng chung

Tạo helper tổng hợp từ `reconcileProcess`, ví dụ:

- Input: `processes`, `policies`, `skipped`.
- Output:
  - `missingStepCount`
  - `genericCoverageCount`
  - `orphanPolicyCount`
  - `unfilledCount`
  - danh sách process/bước liên quan để drill-down.

Mục tiêu: `Đồng bộ BPMN` và `Luật hiển thị nút` dùng cùng một nguồn tính toán, tránh lệch số liệu.

### P2 - Thêm summary banner ở tab "Luật hiển thị nút"

Đặt banner nhỏ phía trên bảng policy:

- Nếu không có vấn đề: trạng thái xanh, "Đối soát BPMN ổn".
- Nếu có missing: cảnh báo đỏ.
- Nếu chỉ có wildcard/unfilled/orphan: cảnh báo vàng/cam.

Banner có nút `Xem đối soát BPMN`.

### P3 - Cho phép chuyển tab sang "Đồng bộ BPMN"

Đổi `Tabs` từ uncontrolled `defaultActiveKey` sang controlled state:

- `activeKey`
- `setActiveKey`

Truyền callback `onOpenReconcile` vào `AvailabilityTab`. Khi bấm `Xem đối soát BPMN`, chuyển sang tab `reconcile`.

### P4 - Đánh dấu nguồn policy trong bảng "Luật hiển thị nút"

Thêm tag/cột nhỏ trong bảng policy:

- `BPMN scaffold`: id bắt đầu bằng `AP-BPMN-`.
- `Luật Chi tiết`: id bắt đầu bằng `AP-EX-`.
- `Luật chung`: thiếu `processCode` hoặc thiếu `taskDefinitionKey`.
- `Ghim theo bước`: có đủ `processCode` và `taskDefinitionKey`.

Mục tiêu: admin nhìn vào bảng là hiểu rule nào do BPMN sinh ra, rule nào đang áp dụng rộng.

### P5 - Hỗ trợ filter nhanh từ cảnh báo

Sau khi có summary, có thể thêm filter:

- Xem luật wildcard.
- Xem luật orphan.
- Xem luật thiếu form.
- Xem luật sinh từ BPMN.

P5 không bắt buộc cho bước đầu; có thể làm sau khi P1-P4 ổn.

## Khuyến nghị triển khai trước

Triển khai tối thiểu nên gồm P1-P3:

1. Có health summary dùng chung.
2. Có banner trong tab `Luật hiển thị nút`.
3. Có nút chuyển sang `Đồng bộ BPMN`.

Sau đó mới làm P4/P5 để tránh làm bảng policy quá dày trong một lần refactor.

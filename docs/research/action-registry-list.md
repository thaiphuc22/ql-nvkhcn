# Action Registry List

## Mục đích

Tài liệu này lưu lại danh sách Action Registry hiện có và đề xuất mở rộng để quay lại thiết kế sau. Nguyên tắc chung:

- Action logic do hệ thống định nghĩa sẵn trong `Action Registry`.
- Người dùng/admin không tự tạo action logic mới.
- Admin chỉ cấu hình cách action xuất hiện: label, tooltip, icon, nhóm UI, thứ tự, policy hiển thị.
- UI nghiệp vụ gọi `available-actions` và render theo kết quả backend/policy, không tự quyết định button nào được phép bấm.

## Registry hiện có

Nguồn hiện tại: `webapp/src/data/actionRegistry.ts`.

> **Cập nhật 2026-07-08**: `PROCESS_STEP` đã được thay bằng 3 action theo outcome
> (`APPROVE_STEP`/`RETURN_STEP`/`REJECT_STEP`, xem Decision D10 trong `decisions.md`) — mục
> "Đánh giá nhanh" và "Đề xuất bổ sung ưu tiên" gốc bên dưới coi như đã xử lý, giữ lại chỉ để
> tham khảo lịch sử.

| Action code                       | Tên hiện tại              | Type        | Ghi chú                                               |
| --------------------------------- | ------------------------- | ----------- | ----------------------------------------------------- |
| `SUBMIT`                          | Gửi duyệt                 | `STANDARD`  | Gửi hồ sơ từ trạng thái khởi tạo vào luồng xử lý.     |
| `APPROVE_STEP`                    | Đồng ý duyệt              | `STANDARD`  | (D10) outcome `APPROVE`. Thay cho `PROCESS_STEP` cũ.  |
| `RETURN_STEP`                     | Yêu cầu điều chỉnh        | `STANDARD`  | (D10) outcome `RETURN`.                               |
| `REJECT_STEP`                     | Từ chối duyệt             | `STANDARD`  | (D10) outcome `REJECT`.                               |
| `ADD_COMMENT`                     | Bổ sung ý kiến            | `SUPPORT`   | Không đổi workflow chính, cần lý do/nội dung ý kiến.  |
| `DOWNLOAD_DOSSIER`                | Tải hồ sơ                 | `SUPPORT`   | Tải/xuất hồ sơ.                                       |
| `VIEW_HISTORY`                    | Xem lịch sử               | `SUPPORT`   | Xem lịch sử xử lý/audit mức cơ bản.                   |
| `REQUEST_BYPASS_COUNCIL`          | Yêu cầu bỏ qua Hội đồng   | `EXCEPTION` | Action Chi tiết, cần kiểm soát bằng Exception Policy. |
| `REQUEST_JUMP_TO_HIGHER_APPROVER` | Yêu cầu trình cấp cao hơn | `EXCEPTION` | Action Chi tiết để đổi tuyến xử lý chuẩn.             |
| `REQUEST_SKIP_STEP`               | Yêu cầu bỏ qua bước       | `EXCEPTION` | Action Chi tiết để bỏ qua một bước BPMN.              |

<details>
<summary>Đánh giá gốc &amp; đề xuất Phase 1 (đã xử lý qua D10 — xem lịch sử)</summary>

Danh sách hiện tại đủ cho prototype nhưng còn thô. `PROCESS_STEP` đang gom quá nhiều hành vi nghiệp vụ khác nhau, làm admin khó cấu hình chính xác theo từng bước BPMN.

Ví dụ trong process seed đang có các hành vi: Ký duyệt, Thẩm định, Lập báo cáo, Lập công văn,
Lập quyết định, Đánh giá, Phê duyệt, Công nhận kết quả.

Nếu tất cả đều dùng `PROCESS_STEP`, màn cấu hình chỉ biết "xử lý bước", không biết bước đó nên
cho phép `APPROVE`, `REJECT`, `RETURN`, `SIGN`, hay `COMPLETE_REVIEW`.

| Action code          | Tên gợi ý                   | Type       | Cờ nên có                                       | Ghi chú                                                                                                     |
| -------------------- | --------------------------- | ---------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `APPROVE`            | Phê duyệt                   | `STANDARD` | `requiresConfirm: true`                         | → đã thành `APPROVE_STEP` (D10).                                                                            |
| `REJECT`             | Từ chối                     | `STANDARD` | `requiresReason: true`, `requiresConfirm: true` | → đã thành `REJECT_STEP` (D10).                                                                             |
| `RETURN`             | Trả lại bước trước          | `STANDARD` | `requiresReason: true`, `requiresConfirm: true` | → đã thành `RETURN_STEP` (D10).                                                                             |
| `REQUEST_SUPPLEMENT` | Yêu cầu bổ sung hồ sơ       | `STANDARD` | `requiresReason: true`                          | Chưa implement — chưa rõ standard hay support, cần chốt riêng.                                              |
| `SIGN`               | Ký duyệt                    | `STANDARD` | `requiresConfirm: true`                         | Chưa implement — có thể chỉ là label khác của `APPROVE_STEP` theo bước (qua Availability Policy), cần chốt. |
| `COMPLETE_REVIEW`    | Hoàn tất thẩm định/đánh giá | `STANDARD` | `requiresConfirm: true`                         | Chưa implement — cùng câu hỏi như `SIGN`.                                                                   |
| `ASSIGN_COUNCIL`     | Thành lập/Gán hội đồng      | `STANDARD` | `requiresConfirm: true`                         | Chưa implement — hợp RD02/RD05.                                                                             |
| `ISSUE_DECISION`     | Ban hành quyết định         | `STANDARD` | `requiresConfirm: true`                         | Chưa implement — hợp QĐ chủ trương, QĐ nghiệm thu, công nhận kết quả.                                       |

</details>

## Đề xuất Support Actions

Nhóm này không đổi workflow chính, nhưng tăng khả năng thao tác hồ sơ.

> **Seed 2026-07-08**: 5 action bên dưới đã được thêm vào `ACTION_REGISTRY`
> (`actionRegistry.ts` → `PROPOSED_SUPPORT_ACTION_CODES`) nên đã hiện trong tab "Danh mục nút"
> (Action Studio). **Chưa có `ActionAvailabilityPolicy` nào tham chiếu** các mã này → chưa xuất
> hiện trên hồ sơ/worklist thật cho tới khi cấu hình policy theo từng bước/quy trình.

| Action code         | Tên gợi ý          | Type      | Ghi chú                                                            |
| ------------------- | ------------------ | --------- | ------------------------------------------------------------------ |
| `UPLOAD_ATTACHMENT` | Tải lên tài liệu   | `SUPPORT` | Bổ sung chiều ngược với `DOWNLOAD_DOSSIER`.                        |
| `VIEW_DOCUMENTS`    | Xem tài liệu       | `SUPPORT` | Tách khỏi download để kiểm soát quyền xem/tải riêng.               |
| `EXPORT_PDF`        | Xuất PDF           | `SUPPORT` | Xuất hồ sơ, tờ trình, phiếu nhận xét, phiếu phê duyệt.             |
| `PRINT_DOSSIER`     | In hồ sơ           | `SUPPORT` | Thường cần cho nghiệp vụ hành chính.                               |
| `VIEW_AUDIT`        | Xem audit chi tiết | `SUPPORT` | Có thể tách khỏi `VIEW_HISTORY` nếu audit là nghiệp vụ quan trọng. |

## Đề xuất Exception Actions

Nhóm này làm thay đổi đường đi chuẩn hoặc xử lý tình huống đặc biệt, nên cần policy riêng, lý do và audit chặt.

> **Seed 2026-07-08**: 5 action bên dưới đã được thêm vào `ACTION_REGISTRY`
> (`actionRegistry.ts` → `PROPOSED_EXCEPTION_ACTION_CODES`) nên đã hiện trong tab "Danh mục nút".
> Khác với `REQUEST_BYPASS_COUNCIL`/`REQUEST_JUMP_TO_HIGHER_APPROVER`/`REQUEST_SKIP_STEP` ở trên,
> 5 mã này **chưa có `ExceptionType` tương ứng** trong `exceptions.ts` nên chưa đi qua được
> `getAvailableActions`/`getDebugActions` (hàm này chỉ lặp qua `EXCEPTION_ACTION_CODE`, map
> 1-1 với `ExceptionType`) — cần một việc riêng: thêm `ExceptionType` + `ExceptionActionPolicy`
> cho từng mã trước khi chúng thật sự xin/duyệt được trên hồ sơ.

| Action code                  | Tên gợi ý                          | Type        | Ghi chú                                                                                             |
| ---------------------------- | ---------------------------------- | ----------- | --------------------------------------------------------------------------------------------------- |
| `REQUEST_ADD_REVIEWER`       | Yêu cầu bổ sung người thẩm định    | `EXCEPTION` | Khi cần thêm CQNV/Hội đồng/người phản biện.                                                         |
| `REQUEST_REPLACE_APPROVER`   | Yêu cầu thay người xử lý/phê duyệt | `EXCEPTION` | Khi người xử lý vắng mặt, sai phân công, hoặc đổi thẩm quyền.                                       |
| `REQUEST_REOPEN_STEP`        | Yêu cầu mở lại bước đã xử lý       | `EXCEPTION` | Cần kiểm soát mạnh vì có thể đảo lại trạng thái hồ sơ. Seed với `requiresEvidence: true`.           |
| `REQUEST_MANUAL_COMPLETION`  | Yêu cầu hoàn tất thủ công          | `EXCEPTION` | Dùng khi lỗi tích hợp, lỗi Camunda, hoặc cần can thiệp vận hành. Seed với `requiresEvidence: true`. |
| `REQUEST_EMERGENCY_APPROVAL` | Yêu cầu phê duyệt khẩn             | `EXCEPTION` | Chỉ nên bật nếu nghiệp vụ có luồng ưu tiên/khẩn.                                                    |

## Khuyến nghị triển khai

Phase 1: ~~Mở rộng `STANDARD` trước~~ — **DONE qua D10** (`APPROVE_STEP`/`RETURN_STEP`/
`REJECT_STEP`, gắn `outcome` + `resolveRouting`). `REQUEST_SUPPLEMENT`/`SIGN`/
`COMPLETE_REVIEW`/`ASSIGN_COUNCIL`/`ISSUE_DECISION` **chưa** làm — câu hỏi "có cần action
riêng hay chỉ là label khác của action outcome hiện có" vẫn mở, xem mục Lưu ý bên dưới.

Phase 2: **Seed xong 2026-07-08** — 5 action đã có trong `ACTION_REGISTRY`/"Danh mục nút",
**chưa** có `ActionAvailabilityPolicy` (chưa hiện trên hồ sơ thật):

- `UPLOAD_ATTACHMENT`
- `VIEW_DOCUMENTS`
- `EXPORT_PDF`
- `PRINT_DOSSIER`
- `VIEW_AUDIT`

Phase 3: **Seed xong 2026-07-08** — 5 action đã có trong `ACTION_REGISTRY`/"Danh mục nút",
**chưa** có `ExceptionType`/`ExceptionActionPolicy` (chưa đi qua được luồng xin/duyệt Chi tiết):

- `REQUEST_ADD_REVIEWER`
- `REQUEST_REPLACE_APPROVER`
- `REQUEST_REOPEN_STEP`
- `REQUEST_MANUAL_COMPLETION`
- `REQUEST_EMERGENCY_APPROVAL`

## Lưu ý thiết kế

`PROCESS_STEP` đã bị bỏ hẳn theo D10 (không còn trong code) — thay bằng 3 action theo outcome
`APPROVE_STEP`/`RETURN_STEP`/`REJECT_STEP`. Nhãn hiển thị cho từng bước (VD "Ký duyệt", "Phê
duyệt", "Công nhận kết quả") lấy qua `ActionPresentation`/Availability Policy theo từng bước
BPMN, không cần action code riêng cho mỗi nhãn — trừ khi hành vi nghiệp vụ thật sự khác
(cần lý do khác, cần bằng chứng khác, complete task Camunda khác outcome).

Điểm cần chốt khi quay lại:

- `APPROVE_STEP`/`RETURN_STEP`/`REJECT_STEP` đã map vào `resolveRouting`/complete task Camunda
  theo outcome tương ứng (D10) — xác nhận lại khi có Camunda thật (F1).
- `SIGN`/`COMPLETE_REVIEW`/`ASSIGN_COUNCIL`/`ISSUE_DECISION`: có cần action code riêng, hay chỉ
  là label khác của `APPROVE_STEP` cấu hình theo bước qua Availability Policy?
- `REQUEST_SUPPLEMENT` là standard workflow branch hay support action có task phụ?
- Có cần tách `VIEW_HISTORY` và `VIEW_AUDIT` thành hai quyền khác nhau không?
- 5 action Phase 3 mới seed: cần chốt `ExceptionType` tương ứng + `ExceptionActionPolicy`
  (ai được xin, ở bước nào, ai duyệt, `maxTimesPerDossier`) trước khi wiring vào
  `getAvailableActions`.

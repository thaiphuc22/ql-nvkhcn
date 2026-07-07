# Action Registry List

## Mục đích

Tài liệu này lưu lại danh sách Action Registry hiện có và đề xuất mở rộng để quay lại thiết kế sau. Nguyên tắc chung:

- Action logic do hệ thống định nghĩa sẵn trong `Action Registry`.
- Người dùng/admin không tự tạo action logic mới.
- Admin chỉ cấu hình cách action xuất hiện: label, tooltip, icon, nhóm UI, thứ tự, policy hiển thị.
- UI nghiệp vụ gọi `available-actions` và render theo kết quả backend/policy, không tự quyết định button nào được phép bấm.

## Registry hiện có

Nguồn hiện tại: `webapp/src/data/actionRegistry.ts`.

| Action code | Tên hiện tại | Type | Ghi chú |
|---|---|---|---|
| `SUBMIT` | Gửi duyệt | `STANDARD` | Gửi hồ sơ từ trạng thái khởi tạo vào luồng xử lý. |
| `PROCESS_STEP` | Xử lý | `STANDARD` | Action tổng quát cho bước BPMN hiện tại. Đang đại diện cho nhiều hành vi như thẩm định, ký duyệt, đánh giá, phê duyệt. |
| `ADD_COMMENT` | Bổ sung ý kiến | `SUPPORT` | Không đổi workflow chính, cần lý do/nội dung ý kiến. |
| `DOWNLOAD_DOSSIER` | Tải hồ sơ | `SUPPORT` | Tải/xuất hồ sơ. |
| `VIEW_HISTORY` | Xem lịch sử | `SUPPORT` | Xem lịch sử xử lý/audit mức cơ bản. |
| `REQUEST_BYPASS_COUNCIL` | Yêu cầu bỏ qua Hội đồng | `EXCEPTION` | Action ngoại lệ, cần kiểm soát bằng Exception Policy. |
| `REQUEST_JUMP_TO_HIGHER_APPROVER` | Yêu cầu trình cấp cao hơn | `EXCEPTION` | Action ngoại lệ để đổi tuyến xử lý chuẩn. |
| `REQUEST_SKIP_STEP` | Yêu cầu bỏ qua bước | `EXCEPTION` | Action ngoại lệ để bỏ qua một bước BPMN. |

## Đánh giá nhanh

Danh sách hiện tại đủ cho prototype nhưng còn thô. `PROCESS_STEP` đang gom quá nhiều hành vi nghiệp vụ khác nhau, làm admin khó cấu hình chính xác theo từng bước BPMN.

Ví dụ trong process seed đang có các hành vi:

- Ký duyệt
- Thẩm định
- Lập báo cáo
- Lập công văn
- Lập quyết định
- Đánh giá
- Phê duyệt
- Công nhận kết quả

Nếu tất cả đều dùng `PROCESS_STEP`, màn cấu hình chỉ biết “xử lý bước”, không biết bước đó nên cho phép `APPROVE`, `REJECT`, `RETURN`, `SIGN`, hay `COMPLETE_REVIEW`.

## Đề xuất bổ sung ưu tiên

Nhóm nên bổ sung trước để đủ cấu hình workflow lõi.

| Action code | Tên gợi ý | Type | Cờ nên có | Ghi chú |
|---|---|---|---|---|
| `APPROVE` | Phê duyệt | `STANDARD` | `requiresConfirm: true` | Action chuẩn cho các bước duyệt. |
| `REJECT` | Từ chối | `STANDARD` | `requiresReason: true`, `requiresConfirm: true` | Cần lý do rõ để audit. |
| `RETURN` | Trả lại bước trước | `STANDARD` | `requiresReason: true`, `requiresConfirm: true` | Rất cần cho thẩm định/xét duyệt khi hồ sơ chưa đạt. |
| `REQUEST_SUPPLEMENT` | Yêu cầu bổ sung hồ sơ | `STANDARD` | `requiresReason: true` | Khác `ADD_COMMENT` vì có tác động workflow. |
| `SIGN` | Ký duyệt | `STANDARD` | `requiresConfirm: true` | Dùng cho bước ký TT/Khối/TGĐ/Hội đồng. |
| `COMPLETE_REVIEW` | Hoàn tất thẩm định/đánh giá | `STANDARD` | `requiresConfirm: true` | Hợp với chuyên quản, hội đồng, tổ thẩm định. |
| `ASSIGN_COUNCIL` | Thành lập/Gán hội đồng | `STANDARD` | `requiresConfirm: true` | Hợp RD02/RD05, khi cần gán hội đồng xét duyệt/nghiệm thu. |
| `ISSUE_DECISION` | Ban hành quyết định | `STANDARD` | `requiresConfirm: true` | Hợp QĐ chủ trương, QĐ nghiệm thu, công nhận kết quả. |

## Đề xuất Support Actions

Nhóm này không đổi workflow chính, nhưng tăng khả năng thao tác hồ sơ.

| Action code | Tên gợi ý | Type | Ghi chú |
|---|---|---|---|
| `UPLOAD_ATTACHMENT` | Tải lên tài liệu | `SUPPORT` | Bổ sung chiều ngược với `DOWNLOAD_DOSSIER`. |
| `VIEW_DOCUMENTS` | Xem tài liệu | `SUPPORT` | Tách khỏi download để kiểm soát quyền xem/tải riêng. |
| `EXPORT_PDF` | Xuất PDF | `SUPPORT` | Xuất hồ sơ, tờ trình, phiếu nhận xét, phiếu phê duyệt. |
| `PRINT_DOSSIER` | In hồ sơ | `SUPPORT` | Thường cần cho nghiệp vụ hành chính. |
| `VIEW_AUDIT` | Xem audit chi tiết | `SUPPORT` | Có thể tách khỏi `VIEW_HISTORY` nếu audit là nghiệp vụ quan trọng. |

## Đề xuất Exception Actions

Nhóm này làm thay đổi đường đi chuẩn hoặc xử lý tình huống đặc biệt, nên cần policy riêng, lý do và audit chặt.

| Action code | Tên gợi ý | Type | Ghi chú |
|---|---|---|---|
| `REQUEST_ADD_REVIEWER` | Yêu cầu bổ sung người thẩm định | `EXCEPTION` | Khi cần thêm CQNV/Hội đồng/người phản biện. |
| `REQUEST_REPLACE_APPROVER` | Yêu cầu thay người xử lý/phê duyệt | `EXCEPTION` | Khi người xử lý vắng mặt, sai phân công, hoặc đổi thẩm quyền. |
| `REQUEST_REOPEN_STEP` | Yêu cầu mở lại bước đã xử lý | `EXCEPTION` | Cần kiểm soát mạnh vì có thể đảo lại trạng thái hồ sơ. |
| `REQUEST_MANUAL_COMPLETION` | Yêu cầu hoàn tất thủ công | `EXCEPTION` | Dùng khi lỗi tích hợp, lỗi Camunda, hoặc cần can thiệp vận hành. |
| `REQUEST_EMERGENCY_APPROVAL` | Yêu cầu phê duyệt khẩn | `EXCEPTION` | Chỉ nên bật nếu nghiệp vụ có luồng ưu tiên/khẩn. |

## Khuyến nghị triển khai

Phase 1: Mở rộng `STANDARD` trước:

- `APPROVE`
- `REJECT`
- `RETURN`
- `REQUEST_SUPPLEMENT`
- `SIGN`
- `COMPLETE_REVIEW`

Phase 2: Bổ sung support thao tác tài liệu:

- `UPLOAD_ATTACHMENT`
- `VIEW_DOCUMENTS`
- `EXPORT_PDF`
- `PRINT_DOSSIER`
- `VIEW_AUDIT`

Phase 3: Bổ sung exception nâng cao:

- `REQUEST_ADD_REVIEWER`
- `REQUEST_REPLACE_APPROVER`
- `REQUEST_REOPEN_STEP`
- `REQUEST_MANUAL_COMPLETION`
- `REQUEST_EMERGENCY_APPROVAL`

## Lưu ý thiết kế

Không nên bỏ hẳn `PROCESS_STEP` ngay. Có thể giữ `PROCESS_STEP` như action generic trong prototype hoặc fallback, nhưng khi cấu hình thật nên dùng các action cụ thể hơn như `APPROVE`, `REJECT`, `RETURN`, `SIGN`, `COMPLETE_REVIEW`.

Điểm cần chốt khi quay lại:

- `PROCESS_STEP` có còn xuất hiện trong UI không, hay chỉ là fallback nội bộ?
- Các action `APPROVE`, `REJECT`, `RETURN` có map trực tiếp vào complete task Camunda với outcome tương ứng không?
- `REQUEST_SUPPLEMENT` là standard workflow branch hay support action có task phụ?
- Có cần tách `VIEW_HISTORY` và `VIEW_AUDIT` thành hai quyền khác nhau không?

Q: Tôi đang có ý tưởng (tuy nhiên chưa được rõ ràng) như thế này: - Với một Hồ sơ chẳng hạn: Tại mỗi bước (hoặc là mỗi trạng thái) sẽ có một nhóm Action Button (Hành động) phụ thuộc vào quy định tại quy trình BPMN được áp dụng cho hồ sơ đó. - Cần có một nhóm action button để đáp ứng được việc xử lý ngoại lệ. Câu hỏi là nhóm Action button ngoại lệ này sẽ được hiện thị trên UI căn cứ theo logic nào? - Hoặc chúng ta cho phép người dùng tự thêm bớt nhóm button sẽ xuất hiện ở trên UI chi tiết của một hồ sơ. --- Chúng ta cùng thảo luận

A: Ý tưởng của bạn đi đúng hướng: UI không nên hard-code button, mà nên render theo Action Availability Model. Điểm cần chốt là: người dùng có thể cấu hình button, nhưng không được “tùy biến vô kiểm soát” làm phá quy trình và audit.
Chúng ta nên tách vấn đề thành 3 lớp:
1. Action Button hiển thị trên UI
2. Business Action phía backend
3. Workflow Transition trong BPMN/Camunda
Không nên coi button chỉ là “nút trên màn hình”. Mỗi button thực chất là một hành động nghiệp vụ có kiểm soát.
1. Tôi đồng ý với hướng của bạn

Với mỗi Hồ sơ, tại mỗi trạng thái/bước xử lý, hệ thống nên hiển thị một tập action phù hợp.

Ví dụ:

Hồ sơ A
Quy trình: RD02 - Xét duyệt NV KHCN
Bước hiện tại: Hội đồng thẩm định
Người dùng hiện tại: Thành viên HĐ

UI có thể hiển thị:

[Nhận xét]
[Đánh giá]
[Ký phiếu]
[Trả lại]
[Yêu cầu bổ sung]

Với người khác, cùng hồ sơ đó, có thể chỉ thấy:

[Xem hồ sơ]
[Tải tài liệu]

Điều này là đúng.

2. Nhưng không nên để người dùng tự do thêm/bớt button

Tôi không khuyến nghị cho người dùng nghiệp vụ tự thêm/bớt button trực tiếp trên UI chi tiết hồ sơ theo kiểu:

Admin tự thêm nút "Trình thẳng TGĐ"
Admin tự xóa nút "Trình Hội đồng"

Vì button không chỉ là giao diện. Nó kéo theo:

quyền thao tác;
validate dữ liệu;
cập nhật trạng thái hồ sơ;
complete task trong Camunda;
ghi audit;
gửi notification;
thay đổi routing;
ảnh hưởng SLA;
ảnh hưởng tính tuân thủ.

Nếu cho cấu hình quá tự do, hệ thống sẽ mất kiểm soát.

3. Mô hình đúng hơn: Action Registry + Action Policy

Thay vì “tự thêm button”, nên thiết kế:

Action Registry
+
Action Availability Policy
+
Exception Action Policy
3.1. Action Registry

Là danh mục tất cả action mà hệ thống hỗ trợ.

Ví dụ:

Standard Actions
├── Submit
├── Approve
├── Reject
├── Return
├── Request Supplement
├── Comment
├── Sign
├── Assign Council
├── Complete Review

Exception Actions
├── Request Skip Step
├── Request Bypass Council
├── Request Route To Higher Approver
├── Request Add Reviewer
├── Request Replace Approver
├── Request Reopen Step
├── Request Manual Completion
├── Request Emergency Approval

Người dùng không tự tạo action logic mới, mà chỉ được cấu hình:

Action nào được phép xuất hiện?
Ở bước nào?
Cho vai trò nào?
Trong điều kiện nào?
Có cần phê duyệt ngoại lệ không?
4. Logic hiển thị button nên dựa trên gì?

Tôi đề xuất UI gọi một API duy nhất:

GET /dossiers/{dossierId}/available-actions

Backend trả về:
[
  {
    "actionCode": "APPROVE",
    "label": "Phê duyệt",
    "type": "STANDARD",
    "enabled": true,
    "requiresConfirm": true
  },
  {
    "actionCode": "REQUEST_BYPASS_COUNCIL",
    "label": "Yêu cầu bỏ qua Hội đồng",
    "type": "EXCEPTION",
    "enabled": true,
    "requiresReason": true,
    "requiresEvidence": true
  }
]
UI chỉ render theo kết quả backend, không tự quyết định.
5. Action Availability Model

Một button được hiển thị khi thỏa đồng thời các nhóm điều kiện sau:

Button hiển thị
=
Workflow Context
+ User Permission
+ Business Rule
+ Dossier State
+ Exception Policy
+ UI Configuration

Cụ thể:

Nhóm điều kiện	Câu hỏi cần trả lời
Workflow Context	Hồ sơ đang ở bước nào trong BPMN?
Task Context	User hiện tại có task đang active không?
Permission	User có quyền thực hiện action này không?
Role Scope	User có đúng vai trò trong hồ sơ này không?
Business Rule	Điều kiện nghiệp vụ có cho phép không?
Dossier State	Hồ sơ đã đủ tài liệu/đủ dữ liệu chưa?
Exception Policy	Ngoại lệ này có được phép tại bước này không?
UI Config	Action này có được bật cho loại hồ sơ/quy trình này không?
6. Phân biệt 3 loại button
Loại 1 — Standard Action

Đây là action đi theo BPMN chuẩn.

Ví dụ:

Submit
Approve
Reject
Return
Sign
Complete Review

Nguồn hiển thị:

Camunda Active User Task
+ Task Definition
+ Candidate User/Group
+ Permission
Loại 2 — Support Action

Không làm thay đổi workflow chính.

Ví dụ:

Comment
Download
View History
Upload Attachment
Export PDF
Print
View Audit

Nguồn hiển thị:

Permission
+ Dossier Status
+ Document Policy
Loại 3 — Exception Action

Làm thay đổi đường đi chuẩn hoặc tạo nhánh đặc biệt.

Ví dụ:

Request Bypass Council
Request Route To Higher Approver
Request Add Reviewer
Request Replace Approver
Request Reopen Step
Request Manual Completion

Nguồn hiển thị:

Exception Policy
+ Current BPMN Step
+ User Role
+ Mission Level
+ Dossier Type
+ Risk Level
+ Required Evidence
7. Với câu hỏi của bạn: Button ngoại lệ hiển thị căn cứ vào logic nào?

Tôi đề xuất logic như sau:

Hiển thị Exception Action
nếu và chỉ nếu:

1. Hồ sơ đang ở bước cho phép phát sinh ngoại lệ
2. Loại ngoại lệ được cấu hình là allowed
3. User có quyền REQUEST_EXCEPTION
4. User thuộc role/scope hợp lệ
5. Hồ sơ chưa ở trạng thái terminal
6. Không có exception request cùng loại đang pending
7. Điều kiện nghiệp vụ thỏa policy

Ví dụ:

Action: Yêu cầu bỏ qua Hội đồng

Chỉ hiển thị khi:
- processCode = RD02
- currentStep = COUNCIL_REVIEW
- dossierStatus = IN_REVIEW
- userRole in [PM, Chuyên quản KHCN]
- missionLevel = Cơ sở
- exceptionPolicy.allowBypassCouncil = true
- no pending bypass request
8. Mô hình cấu hình đề xuất
action_definition
├── action_code
├── action_name
├── action_type: STANDARD / SUPPORT / EXCEPTION
├── handler
├── requires_reason
├── requires_evidence
├── requires_confirm
└── active
action_availability_policy
├── process_code
├── task_definition_key
├── dossier_type
├── dossier_status
├── allowed_roles
├── required_permissions
├── condition_expression
├── display_order
└── active
exception_action_policy
├── exception_type
├── process_code
├── task_definition_key
├── allowed_roles
├── required_approver_role
├── require_reason
├── require_evidence
├── max_times_per_dossier
├── condition_expression
└── active
9. UI nên chia button thành 2 nhóm

Không nên trộn action chuẩn và ngoại lệ cùng một hàng.

Tôi đề xuất:

Primary Actions
[Phê duyệt] [Từ chối] [Trả lại]

More Actions
[Bổ sung ý kiến] [Tải hồ sơ] [Xem lịch sử]

Exception Actions
[Yêu cầu bỏ qua Hội đồng]
[Yêu cầu trình cấp cao hơn]
[Yêu cầu thay người xử lý]

Hoặc gom ngoại lệ vào menu riêng:

[Thao tác ngoại lệ ▼]
    - Yêu cầu bỏ qua Hội đồng
    - Yêu cầu trình cấp cao hơn
    - Yêu cầu mở lại bước đã xử lý

Lý do: ngoại lệ phải tạo cảm giác “đây không phải thao tác thông thường”.

10. Kết luận thiết kế

Tôi sẽ không thiết kế theo kiểu:

User tự thêm/bớt button trên UI

Mà thiết kế theo kiểu:

System có sẵn Action Registry
Admin cấu hình Action Availability Policy
Exception Action được kiểm soát bằng Exception Policy
UI gọi API available-actions để render động
Mọi action đều qua backend validation và audit

Công thức cuối cùng:

Visible Button
=
Action Definition
+ Workflow Step
+ User Role
+ Permission
+ Business Condition
+ Exception Policy
+ Dossier State

Đây là hướng vừa đủ linh hoạt để xử lý ngoại lệ thực tế, vừa không phá governance của hệ thống QTKHCN, vốn có rất nhiều luồng phê duyệt, hội đồng, hồ sơ và cấp xử lý khác nhau.

Q:Trong quá trình thực tế, khách hàng phát sinh rất nhiều ngoại lệ. Ví dụ: Với 1 Hồ sơ A, theo BPMN thì cần trình Hội đồng phê duyệt, nhưng qua các trao đổi trực tiếp, PM có thể trình thẳng hồ sơ lên một cấp cao hơn phê duyệt mà không cần qua Hội đồng. Chúng ta nên kiến trúc như thế nào để đáp ứng việc khách hàng phát sinh nhiều ngoại lệ không lường trước.

A: Vấn đề bạn nêu là điểm sống còn của workflow platform: nếu BPMN quá cứng thì vỡ quy trình, còn nếu cho bypass tự do thì mất kiểm soát/audit. Cách đúng là thiết kế Controlled Exception Mechanism ngay từ đầu.

Đã suy nghĩ trong 9s
Câu trả lời ngắn

Không nên xử lý ngoại lệ bằng cách sửa BPMN liên tục hoặc cho admin nhảy task tùy ý.

Nên thiết kế một lớp riêng gọi là:

Controlled Exception Handling / Quản trị ngoại lệ có kiểm soát

Tức là hệ thống cho phép “đi đường tắt”, “bỏ qua Hội đồng”, “chuyển cấp cao hơn”, “xin phê duyệt đặc biệt”… nhưng mọi ngoại lệ phải có:

lý do;
căn cứ;
người đề xuất;
người được quyền phê duyệt ngoại lệ;
dữ liệu trước/sau;
audit trail;
hiệu lực chỉ cho một hồ sơ cụ thể hoặc một nhóm hồ sơ cụ thể.
1. Tư duy kiến trúc đúng

Với workflow phức tạp như QTKHCN, không nên coi BPMN là “luật tuyệt đối”.

Nên coi BPMN là:

Standard Path / Happy Path

Còn thực tế vận hành sẽ có:

Exception Path / Case-by-case Deviation

Vì vậy kiến trúc nên có 2 lớp:

BPMN Standard Workflow
        +
Exception Governance Layer
2. Mô hình đề xuất
flowchart TB
    A["Hồ sơ A<br/>Đang ở bước cần trình Hội đồng"] --> B{"Có phát sinh ngoại lệ?"}

    B -- Không --> C["Đi theo BPMN chuẩn<br/>Trình Hội đồng"]

    B -- Có --> D["Tạo Exception Request<br/>Yêu cầu xử lý ngoại lệ"]

    D --> E["Exception Rule / Policy<br/>Kiểm tra có được phép ngoại lệ không"]

    E --> F{"Ngoại lệ hợp lệ?"}

    F -- Không --> C

    F -- Có --> G["Exception Approval<br/>Người có thẩm quyền duyệt ngoại lệ"]

    G --> H{"Duyệt ngoại lệ?"}

    H -- Không --> C

    H -- Có --> I["Apply Exception Action"]

    I --> J["Skip Council<br/>Route to Higher Approver"]

    J --> K["Ghi Audit Trail<br/>Lý do, người duyệt, thời điểm"]

    K --> L["Tiếp tục Workflow"]

3. Không nên làm gì?
Không nên hard-code ngoại lệ vào BPMN

Ví dụ không nên làm:

Gateway 1: Có cần Hội đồng?
Gateway 2: Có trao đổi trực tiếp không?
Gateway 3: Có ý kiến lãnh đạo không?
Gateway 4: Có xin bỏ qua Hội đồng không?
Gateway 5: Có trường hợp đặc biệt không?

Kết quả là BPMN sẽ thành “mạng nhện”, rất khó bảo trì.

Không nên để admin sửa process instance tùy tiện

Camunda 8 có cơ chế process instance modification trong Operate để can thiệp vào một process instance đang chạy, ví dụ kích hoạt hoặc hủy một element instance. Tuy nhiên đây nên là công cụ vận hành/kỹ thuật, không nên trở thành cơ chế nghiệp vụ hằng ngày cho khách hàng.

Nếu dùng quá thường xuyên, hệ thống sẽ mất tính kiểm soát nghiệp vụ.

4. Kiến trúc nên có thêm 5 thành phần
4.1. Exception Request Service

Dùng để ghi nhận yêu cầu ngoại lệ.

ExceptionRequest
├── exceptionId
├── missionId
├── dossierId
├── workflowInstanceId
├── currentStep
├── exceptionType
├── requestedAction
├── reason
├── legalBasis / evidence
├── requestedBy
├── requestedAt
├── status
└── approvedBy

Ví dụ:

Exception Type: Skip Council
Requested Action: Route to Higher Approver
Reason: Đã có kết luận trực tiếp của cấp có thẩm quyền
Target Approver: PTGĐ / TGĐ
4.2. Exception Policy Engine

Không phải ngoại lệ nào cũng được phép.

Cần có rule kiểm tra:

Loại hồ sơ nào được xin ngoại lệ?
Bước nào được xin ngoại lệ?
Ai được quyền xin ngoại lệ?
Ai được quyền duyệt ngoại lệ?
Có cần đính kèm căn cứ không?
Có giới hạn theo cấp nhiệm vụ không?
Có giới hạn theo ngân sách không?
Có áp dụng cho cấp Tập đoàn không?

Ví dụ policy:

Nếu Hồ sơ thuộc RD02
AND Current Step = Council Review
AND Mission Level = Cơ sở
THEN Cho phép Skip Council
BUT Exception Approver phải là TGĐ hoặc PTGĐ được ủy quyền
4.3. Exception Approval Workflow

Bản thân yêu cầu ngoại lệ cũng phải là một workflow nhỏ.

Request Exception
→ Review Exception
→ Approve / Reject Exception
→ Apply Exception

Điểm quan trọng:

Người đang muốn bỏ qua Hội đồng không được tự mình quyết định bỏ qua Hội đồng.

Phải có một cấp có thẩm quyền duyệt ngoại lệ.

4.4. Dynamic Routing Service

Sau khi ngoại lệ được duyệt, hệ thống gọi Dynamic Routing Service để xác định bước tiếp theo.

Standard Route:
PM → Hội đồng → TGĐ

Exception Route:
PM → TGĐ

Không nên sửa BPMN cho từng case. Thay vào đó, BPMN nên có một điểm mở:

Resolve Next Route

Sau đó gọi service để trả về bước tiếp theo.

4.5. Audit & Compliance Service

Mọi ngoại lệ phải được lưu như một quyết định nghiệp vụ.

Audit
├── Ai yêu cầu ngoại lệ?
├── Khi nào?
├── Lý do gì?
├── Đính kèm căn cứ nào?
├── Ai duyệt?
├── Bỏ qua bước nào?
├── Chuyển đến ai?
├── Dữ liệu workflow trước/sau ra sao?
└── Có ảnh hưởng SLA không?

Với hệ thống KHCN, phần này rất quan trọng vì sau này còn phục vụ thanh tra, kiểm toán, nghiệm thu, quyết toán và truy vết trách nhiệm.

5. Thiết kế với Camunda 8
Option tốt nhất: BPMN có “Exception Boundary” có kiểm soát

flowchart LR
    A["Review by Council"] --> B["Council Approved"]
    A --> X["Request Exception"]
    X --> Y["Approve Exception"]
    Y --> Z["Route to Higher Approver"]
    Z --> C["Higher Approval"]

Trong Camunda, user task có thể được gán động qua assignee, candidateUsers, candidateGroups; tài liệu Camunda 8 mô tả user tasks hỗ trợ assignment, scheduling, task updates, variable mappings và form.

Điều này cho phép hệ thống không cần hard-code người xử lý trong BPMN.

6. Pattern tôi khuyến nghị
Pattern 1 — Standard Process + Exception Subprocess

BPMN chính vẫn mô tả luồng chuẩn.

PM Submit
→ Review
→ Council
→ Final Approval

Nhưng tại các bước nhạy cảm sẽ có:

Exception Subprocess

Dùng để xử lý:

skip step;
reassign;
add approver;
route to higher approver;
return to previous step;
terminate;
suspend;
reopen.
Pattern 2 — Ad-hoc Subprocess cho vùng nghiệp vụ linh hoạt

Camunda 8 có ad-hoc subprocess, cho phép các activity bên trong được thực hiện linh hoạt hơn so với subprocess thông thường; glossary của Camunda mô tả ad-hoc subprocess là loại subprocess cho phép activity được thực hiện theo thứ tự không cố định, có thể bỏ qua hoặc lặp lại, và được kích hoạt động tại runtime.

Áp dụng cho các vùng như:

Thẩm định hồ sơ
├── Xin ý kiến bổ sung
├── Gửi chuyên gia phản biện
├── Bổ sung tài liệu
├── Xin phê duyệt đặc biệt
├── Bỏ qua hội đồng nếu có căn cứ
└── Trình cấp cao hơn

Nhưng không nên dùng ad-hoc cho toàn bộ quy trình. Chỉ dùng trong “vùng linh hoạt”.

Pattern 3 — Case Management bên ngoài BPMN

Với các ngoại lệ không lường trước, BPMN không nên ôm hết.

Nên có một Case Management Layer:

ResearchMission Case
├── Standard Workflow
├── Exception Requests
├── Manual Decisions
├── Ad-hoc Tasks
├── Notes
├── Evidence
└── Audit Trail

BPMN điều phối các luồng chính, còn Case Management quản lý toàn bộ “bối cảnh hồ sơ”.

7. Các loại ngoại lệ nên chuẩn hóa thành danh mục

Thay vì để người dùng ghi tự do, nên có ExceptionType.

ExceptionType
├── SkipStep
├── JumpToHigherApprover
├── AddAdditionalReviewer
├── ReplaceApprover
├── DelegateApproval
├── ReopenCompletedStep
├── ReturnToPreviousStep
├── BypassCouncil
├── EmergencyApproval
├── ManualCompletion
├── SuspendWorkflow
└── TerminateWorkflow

Với ví dụ của bạn:

BypassCouncil + JumpToHigherApprover
8. BPMN nên thiết kế như thế nào?

Không nên vẽ một BPMN quá chi tiết cho mọi ngoại lệ.

Nên có các “extension point”.

Submit Hồ sơ
→ Validate Hồ sơ
→ Resolve Standard Route
→ User Task / Council Task
→ Exception Checkpoint
→ Resolve Actual Route
→ Final Approval
→ Complete

Trong đó:

Resolve Standard Route = Approval Matrix
Exception Checkpoint = có ngoại lệ không?
Resolve Actual Route = Dynamic Routing + Exception Policy
9. Mô hình dữ liệu tối thiểu
workflow_exception_request
├── id
├── mission_id
├── dossier_id
├── process_instance_key
├── current_activity_id
├── exception_type
├── requested_action
├── target_activity_id
├── target_assignee
├── reason
├── evidence_file_id
├── requested_by
├── requested_at
├── approved_by
├── approved_at
├── status
└── applied_at
workflow_exception_policy
├── id
├── process_code
├── activity_id
├── exception_type
├── condition_expression
├── required_approver_role
├── require_evidence
├── active_flag
└── effective_date
workflow_exception_audit
├── id
├── exception_request_id
├── before_state
├── after_state
├── action
├── actor
├── action_time
└── note
10. Phân quyền ngoại lệ

Cần tách 4 quyền khác nhau:

Quyền	Ý nghĩa
REQUEST_EXCEPTION	Được xin ngoại lệ
APPROVE_EXCEPTION	Được duyệt ngoại lệ
APPLY_EXCEPTION	Được áp dụng ngoại lệ vào workflow
VIEW_EXCEPTION_AUDIT	Được xem lịch sử ngoại lệ

Không nên để một người có cả 3 quyền đầu trong cùng một hồ sơ, trừ Super Admin vận hành kỹ thuật.

11. Luồng cụ thể cho ví dụ của bạn
Tình huống

Theo BPMN chuẩn:

PM Submit Hồ sơ A
→ Hội đồng phê duyệt
→ TGĐ phê duyệt

Thực tế phát sinh:

PM muốn trình thẳng TGĐ, bỏ qua Hội đồng
Luồng đề xuất
1. PM đang ở bước “Trình Hội đồng”
2. PM chọn “Yêu cầu xử lý ngoại lệ”
3. Chọn loại: Bỏ qua Hội đồng
4. Nhập lý do và đính kèm căn cứ
5. Hệ thống kiểm tra policy
6. Hệ thống tạo workflow nhỏ: Duyệt ngoại lệ
7. PTGĐ/TGĐ duyệt ngoại lệ
8. Hệ thống ghi nhận: Hội đồng bị bypass
9. Dynamic Routing tạo task cho TGĐ
10. Hồ sơ tiếp tục theo route ngoại lệ
11. Audit hiển thị đầy đủ trong timeline hồ sơ
12. Cách hiển thị trên UI

Trong timeline hồ sơ nên hiển thị rõ:

[Chuẩn] Cần trình Hội đồng
[ Ngoại lệ ] PM yêu cầu bỏ qua Hội đồng
[ Duyệt ngoại lệ ] PTGĐ đồng ý
[ Bypass ] Bước Hội đồng được bỏ qua
[ Route mới ] Hồ sơ được trình TGĐ

Không nên che giấu ngoại lệ như thể quy trình chuẩn.

13. Khuyến nghị kiến trúc cuối cùng

Tôi sẽ thiết kế theo công thức:

BPMN = Standard Governance Flow
Approval Matrix = Standard Routing
Business Rule = Decision Logic
Exception Policy = Kiểm soát ngoại lệ
Exception Workflow = Duyệt ngoại lệ
Dynamic Routing = Điều hướng thực tế
Audit Trail = Bằng chứng và trách nhiệm

Nói ngắn gọn:

Đừng cố vẽ mọi ngoại lệ vào BPMN.
Hãy biến ngoại lệ thành một đối tượng nghiệp vụ chính thức, có vòng đời, có phê duyệt, có policy và có audit.

Đây là cách vừa đáp ứng thực tế khách hàng, vừa giữ được tính kiểm soát của hệ thống enterprise.
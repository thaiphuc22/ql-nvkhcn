EPIC 06 – Approval Matrix
Theo tôi đây sẽ là Epic lớn nhất.

Entity

Approval Matrix
Approval Rule
Approver
Condition

Ví dụ

Nếu
Mission Level = Tập đoàn
AND
Budget > 5 tỷ
↓
HĐ KHCN
↓
TGĐ
Feature
Drag Drop
Rule Builder
Priority
Simulation


Note 1:
Q: Tại sao chúng ta lại cần Approve Matrix trong khi ở BPMN chúng ta đã có user task và gán user/ nhóm user cho task
Đây là một trong những câu hỏi quan trọng nhất khi thiết kế một nền tảng workflow. Thực tế, rất nhiều đội ngũ khi mới tiếp cận Camunda đều đặt câu hỏi tương tự.

Câu trả lời ngắn gọn là: BPMN trả lời câu hỏi "cần phê duyệt ở đâu", còn Approval Matrix trả lời câu hỏi "ai sẽ phê duyệt".
Hai khái niệm này giải quyết hai vấn đề hoàn toàn khác nhau. Nếu chỉ dùng BPMN
Giả sử có quy trình:
Create Proposal
        │
        ▼
Department Approval
        │
        ▼
Finance Approval
        │
        ▼
CEO Approval

Trong BPMN ta có: 
User Task
Assignee = "phuc"

hoặc

Candidate Group = "Finance"
Điều này hoạt động rất tốt...
...cho đến khi tổ chức thay đổi.

Ví dụ:

CEO nghỉ việc
Finance Manager thay đổi
Phòng Kế toán chia thành 3 nhóm
Có thêm Deputy Director
Công ty mở thêm chi nhánh

Lúc này bạn phải: sửa BPMN, deploy version mới, migrate instance => rất tốn kém. Approval Matrix sinh ra để giải quyết vấn đề đó. Thay vì BPMN ghi: Candidate Group = Finance. BPMN chỉ ghi: Need Role = FINANCE_APPROVER
Sau đó:
Workflow
      │
      ▼
Approval Matrix
      │
      ▼
Who?
      │
      ▼
User A

Như vậy: BPMN không biết ai. Approval Matrix mới biết.
Ví dụ
BPMN
Approve Budget không viết Candidate Group = Finance
mà viết
Approval Role = L2_APPROVER
Sau đó Approval Matrix

| Role | Department | Budget | Approver   |
| ---- | ---------- | ------ | ---------- |
| L2   | IT         | <100M  | Manager A  |
| L2   | IT         | >100M  | Director A |
| L2   | HR         | <100M  | Manager B  |

Workflow hoàn toàn không thay đổi.
Một ví dụ lớn hơn
Giả sử có 200 quy trình. Mỗi quy trình đều có bước:
Department Approval
Nếu dùng BPMN thuần
200 BPMN đều chứa

Candidate Group = Manager
Một ngày: Manager đổi thànhDepartment Head.
Bạn phải sửa 200 BPMN
Nếu dùng Approval Matrix
Bạn chỉ sửa
Approval Matrix
Toàn bộ workflow chạy ngay.
Một vấn đề khác: Điều kiện nghiệp vụ

Ví dụ:
Nếu
Budget < 100 triệu
↓
Manager
Nếu
100-500 triệu
↓
Director
Nếu
>500 triệu
↓
CEO

Nếu chỉ dùng BPMN bạn sẽ phải làm:
Gateway -> Gateway -> Gateway -> Gateway -> Gateway

BPMN bắt đầu trở nên rất lớn.
Trong khi nếu dùng Approval Matrix:
Budget
      │
      ▼
Approval Matrix
      │
      ▼
Approver

Workflow vẫn chỉ có một User Task. Một vấn đề nữa: Delegation

Ví dụ

CEO nghỉ phép.
Approval Matrix:
CEO
↓
Delegate
↓

Vice CEO
Không cần sửa BPMN.

Một vấn đề nữa: Temporary Assignment
01/07 - 15/07
Finance Manager
↓
Temporary Manager
Approval Matrix xử lý.
Workflow không biết.

Một vấn đề nữa: Multi-company
Một hệ thống SaaS.
Tenant A
Finance Manager
Tenant B
Accounting Head
Tenant C
CFO

BPMN vẫn chỉ có:
Finance Approval
Approval Matrix quyết định người thực hiện theo từng tenant.
Vậy User Task trong Camunda nên chứa gì?
Theo kinh nghiệm thiết kế các hệ thống workflow lớn, User Task chỉ nên chứa thông tin liên quan đến vai trò nghiệp vụ, không nên chứa người dùng cụ thể.

Ví dụ:
User Task
taskKey: finance_approval
approvalRole: FINANCE_APPROVER
approvalLevel: L2
Worker khi thực thi:

Camunda
     │
     ▼
Business Rule (DMN)
     │
     ▼
Approval Matrix Service
     │
     ▼
Resolve Users
     │
     ▼
Create Task

Như vậy BPMN chỉ mô tả quy trình, còn việc xác định người xử lý được giao cho một dịch vụ chuyên trách.
Áp dụng vào kiến trúc QTKHCN
Với định hướng của QTKHCN là một Workflow Platform có khả năng cấu hình động, tôi cho rằng nên tách rõ ba tầng:
Thành phần	Trách nhiệm
BPMN	Mô hình hóa luồng công việc: các bước, gateway, event, user task.
DMN / Business Rules	Quyết định cần loại phê duyệt nào, cấp phê duyệt nào hoặc chính sách nào áp dụng dựa trên dữ liệu hồ sơ.
Approval Matrix	Ánh xạ từ vai trò/cấp phê duyệt sang người hoặc nhóm người cụ thể, có xét đến tổ chức, đơn vị, thời gian hiệu lực, người được ủy quyền, tenant...
Theo cách phân tách này:
BPMN quyết định "khi nào cần phê duyệt".
DMN quyết định "cần kiểu/cấp phê duyệt nào".
Approval Matrix quyết định "chính xác ai sẽ thực hiện việc phê duyệt đó".

Đây là mô hình được sử dụng phổ biến trong các nền tảng workflow quy mô doanh nghiệp vì nó giúp quy trình ổn định, trong khi cơ cấu tổ chức và phân quyền có thể thay đổi liên tục mà không phải triển khai lại BPMN. Điều này cũng phù hợp với hướng kiến trúc bạn đang xây dựng cho QTKHCN: tách biệt orchestration (workflow), business rules và organizational assignment để hệ thống dễ mở rộng và bảo trì.

Q: Approval Matrix có được hỗ trợ trong Camunda 8 không
A: Câu trả lời ngắn gọn: Không.
Camunda 8 không có một module "Approval Matrix" như một tính năng sẵn có. Camunda chỉ cung cấp các cơ chế để gán User Task (assignee, candidateUsers, candidateGroups) và cho phép các giá trị này được xác định bằng biểu thức hoặc biến của quy trình. Việc xây dựng Approval Matrix là trách nhiệm của ứng dụng nghiệp vụ hoặc một dịch vụ bên ngoài.

Camunda 8 cung cấp gì?

Trong User Task, bạn có thể cấu hình:
assignee
candidateUsers
candidateGroups
Ví dụ:
candidateGroups = finance_manager
hoặc
candidateGroups = = approverGroup
Ở ví dụ thứ hai, approverGroup là một process variable được tính toán trước đó.

Camunda KHÔNG cung cấp gì?

Camunda không có màn hình hay mô hình dữ liệu để cấu hình:

| Chức năng                   | Camunda 8           |
| --------------------------- | ------------------- |
| Approval Matrix             | ❌                   |
| Approval Chain              | ❌                   |
| Delegation                  | ❌ (cần tự xây dựng) |
| Acting Manager              | ❌                   |
| Organization Hierarchy      | ❌                   |
| Department Tree             | ❌                   |
| Position Management         | ❌                   |
| Dynamic Approver Resolution | ❌                   |


Nói cách khác, Camunda không biết:

Trưởng phòng IT là ai.
Ai đang được ủy quyền thay Giám đốc.
Phòng CNTT thuộc đơn vị nào.
Người phê duyệt cấp L2 của một hồ sơ là ai.
Đó đều là dữ liệu của business domain.
Camunda khuyến nghị làm như thế nào?
Một mô hình rất phổ biến là:

User Task
      │
      ▼
candidateGroup = approverGroup
      │
      ▼
process variable
      │
      ▼
Approval Service
      │
      ▼
Approval Matrix
      │
      ▼
Finance_Manager

Hoặc:

Business Rule Task (DMN)
           │
           ▼
approvalLevel = L2
           │
           ▼
Approval Matrix Service
           │
           ▼
candidateUsers

Đây cũng là cách Camunda minh họa trong ví dụ User Task Assignment based on a DMN Decision Table: DMN quyết định thông tin gán việc, sau đó User Task sử dụng kết quả đó để gán assignee hoặc candidate groups.
Vì sao Camunda không tích hợp Approval Matrix?
Bởi vì Camunda là một workflow engine, không phải một hệ thống quản trị tổ chức (Organization Management).
Ví dụ:

Công ty A:

IT
 ├── Manager A
 └── Director A

Công ty B:

IT
 ├── Team Lead
 ├── Department Head
 └── CIO

Công ty C:

IT
 ├── Branch Manager
 ├── Regional Director
 └── COO

Nếu Camunda tích hợp Approval Matrix thì họ sẽ phải hỗ trợ vô số mô hình tổ chức khác nhau. Thay vào đó, Camunda chỉ cung cấp điểm mở (extension point) để ứng dụng của bạn quyết định ai là người xử lý.
Đối với QTKHCN
Theo kiến trúc mà chúng ta đã thống nhất trong các cuộc trao đổi trước, tôi sẽ không để Approval Matrix nằm trong Camunda.
Tôi sẽ thiết kế như sau:

Camunda BPMN
        │
        ▼
Business Rule (DMN)
        │
        ▼
Approval Matrix Service
        │
        ▼
Organization Service
        │
        ▼
Resolved Users
        │
        ▼
Camunda User Task

Trong đó:
BPMN quyết định có bước phê duyệt.
DMN quyết định cần loại hoặc cấp phê duyệt nào.
Approval Matrix Service quyết định ai là người phê duyệt dựa trên quy tắc nghiệp vụ và cơ cấu tổ chức.
Camunda chỉ nhận danh sách assignee, candidateUsers hoặc candidateGroups đã được tính toán.
Đây cũng là lý do tôi đề xuất Approval Matrix là một microservice độc lập
Đối với QTKHCN, việc tách riêng Approval Matrix Service mang lại nhiều lợi ích:
Có thể tái sử dụng cho nhiều BPMN khác nhau.
Không phụ thuộc vào Camunda, nên có thể thay đổi workflow engine trong tương lai mà không phải viết lại logic phân công.
Dễ mở rộng các khả năng như ủy quyền (delegation), thay thế tạm thời (acting/temporary assignment), phê duyệt theo cơ cấu tổ chức, đa tenant, hoặc điều kiện theo ngân sách và lĩnh vực mà không làm phức tạp mô hình BPMN.

Đây là cách phân tách thường thấy trong các nền tảng workflow doanh nghiệp quy mô lớn, nơi workflow engine chỉ đảm nhiệm orchestration, còn toàn bộ logic xác định người phê duyệt được đặt trong lớp dịch vụ nghiệp vụ.
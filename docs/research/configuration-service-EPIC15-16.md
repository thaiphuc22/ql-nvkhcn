EPIC 15 – Dashboard Configuration

Entity

Dashboard

Widget

Metric

Filter

Feature

Create Dashboard

Create Widget

Permission

Layout

Save View
Mối quan hệ giữa các Epic

Đây mới là thứ BA cần nhìn thấy.

Organization
      │
      ▼
Role & Permission
      │
      ▼
Approval Matrix
      │
      ▼
Workflow Definition
      │
      ▼
BPMN Version
      │
      ▼
Dynamic Form
      │
      ▼
Business Rule
      │
      ▼
Notification
      │
      ▼
SLA
      │
      ▼
Dashboard

Đây là Dependency Graph của Module Configuration.


Theo kinh nghiệm của tôi, còn thiếu một EPIC rất quan trọng
Nếu mục tiêu của bạn là xây dựng một nền tảng Workflow Platform chứ không chỉ phục vụ QTKHCN, tôi sẽ bổ sung thêm:

EPIC 16 – Workflow Runtime Administration
Epic này không dành cho người cấu hình quy trình mà dành cho đội vận hành hệ thống.

Bao gồm:

Quản lý Process Instance.
Tra cứu Workflow Instance.
Retry Failed Job.
Cancel/Terminate Instance.
Restart từ một bước.
Reassign User Task.
Delegate Task.
Batch Operation.
Xem Process Variables.
Incident Management (tích hợp với Camunda Operate hoặc xây dựng giao diện riêng).
Theo dõi SLA của từng instance.

Epic này thường bị bỏ quên ở giai đoạn phân tích, nhưng khi hệ thống đi vào vận hành với hàng nghìn quy trình đang chạy, nó trở thành một trong những module được sử dụng nhiều nhất bởi đội vận hành và quản trị hệ thống.
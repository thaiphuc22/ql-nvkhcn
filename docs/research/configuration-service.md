Đứng dưới góc nhìn của một BA Lead/PO đang xây dựng một Workflow Platform chứ không chỉ là một phần mềm QTKHCN, tôi sẽ không thiết kế module Cấu hình theo menu, mà theo Capability (khả năng của nền tảng).
Lý do là sau này ngoài QTKHCN, công ty có thể dùng chính nền tảng này cho:
Quản lý đầu tư
Quản lý mua sắm
Quản lý ISO
Quản lý văn bản
Quản lý CAPEX
Quản lý R&D
Do đó Module Configuration nên trở thành một Workflow Platform Configuration Center.
Tôi sẽ chia thành 15 EPIC
Configuration Center
│
├── EPIC 01. Organization Management
├── EPIC 02. User & Identity Management
├── EPIC 03. Role & Permission Management
├── EPIC 04. Workflow Definition Management
├── EPIC 05. BPMN Designer & Version Management
├── EPIC 06. Approval Matrix Management
├── EPIC 07. Dynamic Form Management
├── EPIC 08. Document Template Management
├── EPIC 09. Business Rule Management
├── EPIC 10. Notification Management
├── EPIC 11. SLA & Escalation Management
├── EPIC 12. Master Data Management
├── EPIC 13. Integration Configuration
├── EPIC 14. Audit & System Configuration
└── EPIC 15. Dashboard Configuration

Note 1.
Thực tế, EPIC 06 (Approval Matrix) và EPIC 09 (Business Rule Management) có ranh giới khá mờ nếu chưa thiết kế kiến trúc tổng thể.

Theo tôi, nếu xây dựng một Workflow Platform thì phải tách hai EPIC này. Nếu không, sau 1–2 năm hệ thống sẽ xuất hiện hàng trăm rule nằm lẫn trong Approval Matrix và rất khó bảo trì.

Khác biệt cốt lõi
EPIC 06 – Approval Matrix	EPIC 09 – Business Rule
Giải quyết bài toán Routing	Giải quyết bài toán Decision
Trả lời: Ai xử lý tiếp?	Trả lời: Điều gì đúng/sai?
Output là Approver/Step	Output là Decision/Value/Result
Phục vụ Workflow	Phục vụ toàn bộ hệ thống
Thường gọi trong User Task	Có thể gọi ở bất kỳ đâu
Thường thay đổi theo tổ chức	Thường thay đổi theo chính sách nghiệp vụ

Nói ngắn gọn:

Approval Matrix quyết định "Task đi đến ai".
Business Rule quyết định "Hệ thống phải làm gì".

Ví dụ trong QTKHCN

Giả sử người dùng submit hồ sơ RD02.
Camunda bắt đầu Process.

Bước 1
Hệ thống cần biết
Có cần Hội đồng không?
Đây không phải Approval Matrix.
Đây là Business Rule.

Ví dụ:

Nếu

Budget > 10 tỷ
↓
Need Council = TRUE

Hoặc

Research Field = AI
↓
Need Security Review = TRUE

Business Rule trả về
TRUE

Camunda đọc kết quả đó để quyết định rẽ Gateway.

Bước 2

Sau khi biết
Need Council = TRUE

Bây giờ mới hỏi

Hội đồng nào?

Approval Matrix sẽ xử lý
Mission Level = Tập đoàn
↓
HĐ KHCN
↓
TGĐ
Minh họa
                Submit
                   │
                   ▼
        Business Rule Engine
                   │
        Need Council ?
                   │
          TRUE / FALSE
                   │
                   ▼
          Approval Matrix
                   │
     Resolve Approver List
                   │
                   ▼
         Camunda User Task
EPIC 09 làm gì?

Business Rule không chỉ phục vụ Workflow.

Ví dụ:

Rule 1
Budget > 10 tỷ
↓
Need Council
Rule 2
Budget > 30 tỷ
↓
Need TGĐ
Rule 3
Research Type = Confidential
↓
Need Secret Classification
Rule 4
Mission Duration > 24 months
↓
Need Annual Review
Rule 5
Settlement Difference > 5%
↓
Need Financial Audit
Rule 6
Patent Count >= 2
↓
Achievement Level = A
Rule 7
Progress < 60%
↓
Risk = High

Tất cả những rule trên đều không liên quan đến Approver.

Approval Matrix làm gì?

Approval Matrix chỉ xử lý

Input
↓
Mission Level

Budget

Department

Organization

Role
↓
Output
↓
Approver

Ví dụ

Mission Level = Tập đoàn

Budget > 10 tỷ
↓
Step 1

TP CLKHCN
↓
Step 2

HĐ
↓
Step 3

TGĐ

Approval Matrix không quan tâm:

Budget có hợp lệ không.
Có cần Hội đồng không.
Có cần Audit không.

Nó chỉ quan tâm:

Task tiếp theo thuộc về ai.

Một ví dụ đầy đủ

Giả sử người dùng submit hồ sơ.

Business Rule
Budget = 12 tỷ

↓
Rule

Budget > 10 tỷ
↓
Need Council = TRUE
↓

Rule

Need Council
↓
Council Type = HĐ KHCN
↓

Rule

Need Secret Review
↓

FALSE

Business Rule kết thúc.

Approval Matrix mới chạy

Input

Mission Level

Need Council

Council Type

Organization
↓
Output

TP CLKHCN
↓
HĐ KHCN
↓

TGĐ
Tại sao phải tách?

Giả sử sau này công ty thay đổi:

Budget > 15 tỷ

thay vì

Budget > 10 tỷ

Nếu Rule nằm trong Approval Matrix

↓

Bạn phải sửa toàn bộ Approval Matrix.

Trong khi

Approval Matrix thực tế không thay đổi.

Thay đổi chỉ là

Need Council

được tính khác.

Với Camunda 8

Camunda hỗ trợ rất tốt việc tách process khỏi decision thông qua DMN (Decision Model and Notation). BPMN gọi một Business Rule Task, Business Rule Task đánh giá bảng quyết định DMN rồi trả kết quả cho process để tiếp tục điều phối. Điều này giúp quy trình không phải chứa các điều kiện nghiệp vụ phức tạp và rule có thể được quản lý độc lập.

Tôi sẽ thiết kế như sau:

BPMN
        │
        ▼
Business Rule Task
        │
        ▼
DMN Decision Table
        │
        ▼
Decision Result
        │
        ▼
Gateway
        │
        ▼
Approval Matrix
        │
        ▼
User Task

Trong đó:

DMN trả lời "Có cần làm gì không?"
Approval Matrix trả lời "Nếu cần làm, ai sẽ làm?"
Đề xuất cuối cùng

Nếu xây dựng một Workflow Platform có khả năng mở rộng, tôi sẽ chia như sau:

EPIC 06 – Approval Matrix

Chỉ tập trung vào Routing

Resolver người phê duyệt
Approval Chain
Parallel Approval
Sequential Approval
Delegation
Substitute
Dynamic Assignee
EPIC 09 – Business Rule / Decision Management

Chỉ tập trung vào Decision

DMN Decision Table
Decision Tree
FEEL Expression
Rule Set
Rule Version
Rule Test
Rule Simulation
Decision Requirement Diagram (DRD)

Theo tôi, đây là cách phân tách có khả năng mở rộng cao nhất. Khi số lượng quy trình tăng lên, một Business Rule có thể được nhiều workflow dùng chung, trong khi Approval Matrix vẫn chỉ chịu trách nhiệm định tuyến người xử lý. Điều này giảm trùng lặp, giúp thay đổi chính sách nghiệp vụ mà không phải sửa hàng loạt workflow hoặc ma trận phê duyệt.
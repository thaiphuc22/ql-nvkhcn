2. Nguyên tắc kiến trúc chủ đạo
2.1. Camunda 8 không thay thế Core System
Camunda 8 nên quản lý:
BPMN process;
user task;
service task;
timer;
escalation;
message correlation;
workflow state;
process monitoring.
Camunda 8 không nên lưu toàn bộ nghiệp vụ như hồ sơ, ngân sách, hội đồng, tài sản, sản phẩm nghiên cứu. Các dữ liệu này thuộc về các domain service riêng.
Theo tài liệu Camunda, kiến trúc task application điển hình gồm frontend, backend-for-frontend, Camunda clients và các data source/service nghiệp vụ riêng để người dùng xử lý task.
3. Phân lớp kiến trúc
3.1. Layer 1 — Presentation Layer
Web Portal QTKHCN
├── Dashboard lãnh đạo
├── Workspace xử lý nhiệm vụ
├── Màn hình hồ sơ
├── Màn hình task phê duyệt
├── Màn hình hội đồng
├── Màn hình báo cáo
└── Admin Console
Khuyến nghị:
dùng custom task UI thay vì phụ thuộc hoàn toàn vào Tasklist mặc định;
task screen phải hiển thị song song:
thông tin nhiệm vụ;
hồ sơ;
tài liệu;
lịch sử phê duyệt;
action khả dụng;
biểu mẫu động.
3.2. Layer 2 — API Gateway / BFF
BFF
├── Auth context
├── Permission filtering
├── Task aggregation
├── Form rendering metadata
├── Dashboard query composition
└── API composition for UI
Vai trò của BFF là gom dữ liệu từ:
Camunda task;
Mission Service;
Dossier Service;
Approval Service;
Council Service;
Reporting Service.
Tránh để frontend gọi trực tiếp quá nhiều service.
3.3. Layer 3 — Domain Services
Nên bắt đầu bằng modular monolith có ranh giới domain rõ, sau đó tách microservice khi tải hoặc team scale đủ lớn.
QTKHCN Backend
├── Mission Module
├── Dossier Module
├── Workflow Adapter Module
├── Approval Module
├── Council Module
├── Execution Module
├── Budget Module
├── Settlement Module
├── Research Output Module
├── IP Module
├── Reporting Module
├── Configuration Module
└── Integration Module
Khuyến nghị thực tế
| Giai đoạn             | Kiến trúc nên dùng                          |
| --------------------- | ------------------------------------------- |
| MVP / Pha 1           | Modular Monolith + Camunda 8                |
| Khi nghiệp vụ ổn định | Tách Integration Service, Reporting Service |
| Khi tải lớn           | Tách Mission, Dossier, Workflow Adapter     |
| Khi enterprise scale  | Microservices + Event-driven architecture   |
4. Vai trò của Camunda 8
Camunda 8 gồm các năng lực chính như Zeebe cho process execution, Tasklist cho human task, Operate để giám sát và xử lý sự cố process, Identity cho xác thực/phân quyền, Optimize cho phân tích quy trình. Repository chính thức của Camunda cũng mô tả Zeebe là process engine cloud-native, Tasklist cho tác vụ người dùng, Operate cho monitoring/troubleshooting, Identity cho auth, và Optimize cho cải tiến quy trình.
4.1. Camunda 8 nên dùng cho
RD01 - Xét duyệt Chủ trương
RD02 - Xét duyệt Nhiệm vụ
RD04 - Điều chỉnh
RD05 - Nghiệm thu
RD06 - Quyết toán
RD03.06 - Báo cáo tiến độ cần trình ký
RD08 - Hồ sơ sở hữu trí tuệ cần phê duyệt
RD10 - Quy trình lưu trữ/ký duyệt hồ sơ pháp lý
4.2. Camunda8 không nên dùng cho
CRUD danh mục
Dashboard aggregation
Lưu file
Tính toán ngân sách phức tạp
Quản lý dữ liệu sản phẩm chi tiết
Đồng bộ dữ liệu master
Search hồ sơ
Báo cáo BI
5. Thiết kế tích hợp Camunda với Core System
Pattern khuyến nghị
sequenceDiagram
    participant UI as QTKHCN UI
    participant API as QTKHCN API
    participant CORE as Domain Service
    participant ZB as Camunda 8 / Zeebe
    participant W as Worker

    UI->>API: Submit hồ sơ xét duyệt
    API->>CORE: Validate & save Dossier
    CORE->>ZB: Start Process Instance
    ZB->>W: Create service task job
    W->>CORE: Execute business action
    CORE-->>W: Result
    W-->>ZB: Complete job
    ZB-->>API: User task available
    API-->>UI: Show task/action

Quy tắc quan trọng
businessKey nên là missionId hoặc dossierId.
Camunda variable chỉ lưu dữ liệu điều phối, không lưu object nghiệp vụ lớn.
Domain Service là source of truth.
Camunda process instance là source of truth cho trạng thái workflow.
Mỗi action phê duyệt phải ghi audit ở cả domain và workflow.
6. Mô hình service đề xuất
6.1. Mission Service
Quản lý thực thể trung tâm.
Mission Service
├── Mission profile
├── Mission lifecycle status
├── Mission level: Cơ sở / Tập đoàn
├── Mission category
├── Host unit
├── Principal investigator
├── Timeline
└── Mission relationship map
Không xử lý phê duyệt trực tiếp. Chỉ cập nhật trạng thái sau khi nhận event từ workflow.
6.2. Dossier Service
Đây là service cực kỳ quan trọng.
Dossier Service
├── Dossier metadata
├── Dossier type
├── Document checklist
├── Template binding
├── Attachment
├── Versioning
├── Comment
├── Digital signature reference
├── Submission package
└── Archive handover
Mọi quy trình RD01–RD06 đều xoay quanh hồ sơ.
6.3. Workflow Adapter Service
Không nên để mọi service gọi trực tiếp Camunda.
Workflow Adapter Service
├── Deploy BPMN
├── Start process
├── Correlate message
├── Complete task
├── Cancel process
├── Query task
├── Sync process status
└── Map workflow variable
Lợi ích:
- giảm coupling với Camunda API;
- dễ thay đổi phiên bản Camunda;
- dễ kiểm soát audit, retry, idempotency.
Camunda 8.8 có thay đổi kiến trúc quan trọng: Zeebe, Operate, Tasklist và Identity được hợp nhất vào Orchestration Cluster như một deployable artifact, ảnh hưởng đến cách triển khai, quản lý và scale. Vì vậy một adapter layer sẽ giúp hệ thống QTKHCN ít phụ thuộc trực tiếp vào chi tiết triển khai của Camunda.
6.4. Approval Service
Quản lý logic phê duyệt nghiệp vụ.
Approval Service
├── Approval matrix
├── Approval route
├── Approval action
├── Approval opinion
├── Reject / return reason
├── Delegation
├── Substitute role
└── Approval audit
Camunda điều phối bước; Approval Service quyết định nghiệp vụ.
6.5. Council Service
├── Council establishment decision
├── Council member list
├── Member role
├── Council session
├── Review form
├── Evaluation form
├── Voting result
└── Meeting minute
Nên tách riêng vì hội đồng là domain phức tạp, thay đổi theo từng nhiệm vụ, từng giai đoạn, từng quyết định.
6.6. Configuration Service
Configuration Service
├── Organization
├── Role
├── Permission
├── Business role
├── Approval matrix
├── Workflow definition mapping
├── Form template
├── Document checklist
├── SLA
├── Notification template
└── System parameter
Đây là nền tảng để hệ thống mở rộng mà không phải sửa code.
6.7. Integration Service
├── QLNS Adapter
├── MS Adapter
├── SAP Adapter
├── QLTS Adapter
├── PLM Adapter
├── Storage Adapter
├── CRM Adapter
├── Sync job
├── Sync log
├── Mapping config
└── Data reconciliation
Tất cả tích hợp ngoài nên đi qua integration layer, không để domain service gọi trực tiếp hệ thống ngoài.
7. Event-driven architecture
Nên dùng event bus cho các sự kiện nghiệp vụ lớn.
Ví dụ event flow
flowchart LR
    A["DossierApproved"] --> B["Mission Service<br/>Update status"]
    A --> C["Notification Service<br/>Send alert"]
    A --> D["Reporting Service<br/>Update KPI"]
    A --> E["Archive Service<br/>Prepare archive package"]
    A --> F["Integration Service<br/>Sync external systems"]
Nên dùng:
Kafka / RabbitMQ / Pulsar tùy hạ tầng;
Outbox Pattern để tránh mất event;
Inbox Pattern để chống xử lý trùng;
idempotency key cho mọi integration command.
8. Data architecture
8.1. Operational Database
PostgreSQL / Oracle / SQL Server
├── mission schema
├── dossier schema
├── approval schema
├── council schema
├── execution schema
├── budget schema
├── product schema
├── ip schema
├── config schema
└── audit schema
8.2. Object Storage
Dùng cho:
file hồ sơ;
biểu mẫu;
công văn;
quyết định;
biên bản;
phiếu nhận xét;
phiếu đánh giá.

Không nên lưu file binary trực tiếp trong database.

8.3. Search Index
Dùng Elasticsearch/OpenSearch/Solr cho:
tìm hồ sơ;
tìm quyết định;
tìm nhiệm vụ;
tìm sản phẩm nghiên cứu;
tìm sáng chế/bài báo;
full-text search trong metadata tài liệu.
8.4. Data Warehouse / Data Mart
Dùng cho RD09 dashboard.
FactMissionLifecycle
FactApprovalDuration
FactBudgetExecution
FactSettlement
FactPersonnelCost
FactProcurement
FactResearchOutput
FactIPAsset
DimMission
DimTime
DimOrganization
DimResearchField
DimMissionLevel
DimWorkflow
DimUser
9. Deployment architecture
Mô hình khuyến nghị
Kubernetes / OpenShift
├── QTKHCN Web
├── QTKHCN API
├── QTKHCN Worker
├── Integration Worker
├── Reporting Worker
├── Camunda 8 Orchestration Cluster
├── Database
├── Message Broker
├── Object Storage
├── Search Engine
└── Observability Stack
Camunda có reference architecture cho self-managed deployment, trong đó Identity cung cấp access/permission management cho các thành phần Orchestration Cluster như Zeebe, Operate, Tasklist và API REST/gRPC
10. Security architecture
Các lớp bảo mật cần có
Authentication
├── SSO / OIDC / Keycloak / AD
└── MFA nếu cần

Authorization
├── RBAC
├── ABAC theo đơn vị, vai trò, cấp nhiệm vụ
├── Task-level permission
├── Document-level permission
└── Field-level permission nếu hồ sơ mật

Audit
├── Login audit
├── Data change audit
├── Approval audit
├── Digital signature audit
├── Workflow audit
└── Integration audit
Quy tắc quyền quan trọng
Không chỉ kiểm tra:
User has Role = Trưởng phòng
User có phải Trưởng phòng đúng đơn vị?
User có thuộc hội đồng của nhiệm vụ này?
User có đang được giao task này?
User có phải vai trò thay thế hợp lệ?
User có quyền xem hồ sơ cấp Tập đoàn không?
11. Observability & vận hành
Cần có:
Application monitoring
├── API latency
├── Error rate
├── DB query performance
├── Worker failure
└── Integration failure

Workflow monitoring
├── Process instance status
├── Stuck task
├── Failed job
├── Incident
├── SLA breach
└── Retry count

Business monitoring
├── Hồ sơ quá hạn
├── Nhiệm vụ trễ tiến độ
├── Quyết toán quá hạn
├── Hội đồng chưa hoàn tất đánh giá
└── Đồng bộ ngoài thất bại
Camunda Operate được dùng để quản lý, giám sát và xử lý sự cố process instance, còn Optimize phục vụ phân tích, cải tiến quy trình.
12. CI/CD và quản trị BPMN
Pipeline nên có
Source Control
├── Backend code
├── Frontend code
├── BPMN files
├── DMN files
├── Form schemas
├── SQL migration
└── Helm charts / deployment manifests
BPMN governance
BPMN Design
→ Peer Review
→ BA Validation
→ Technical Validation
→ Test Deployment
→ UAT
→ Production Deployment
→ Version Lock
Nguyên tắc versioning
Mỗi quy trình có processCode: RD01.01, RD01.02...
Mỗi BPMN có version.
Nhiệm vụ đang chạy giữ nguyên workflow version cũ.
Chỉ nhiệm vụ mới dùng version mới.
Không sửa trực tiếp BPMN production nếu đang có instance active.
13. Kiến trúc module khả dụng mở rộng
Cấu trúc package gợi ý nếu dùng modular monolith
qtkhcn-backend
├── modules
│   ├── mission
│   ├── dossier
│   ├── workflow
│   ├── approval
│   ├── council
│   ├── execution
│   ├── budget
│   ├── settlement
│   ├── product
│   ├── ip
│   ├── reporting
│   ├── configuration
│   ├── integration
│   └── audit
├── shared
│   ├── security
│   ├── common-domain
│   ├── exception
│   ├── event
│   └── infrastructure
└── workers
    ├── camunda-workers
    ├── integration-workers
    └── reporting-workers
14. Nguyên tắc để dễ bảo trì
Nên làm
Tách workflow orchestration khỏi business data.
Tách form template khỏi code.
Tách approval matrix khỏi BPMN nếu tuyến phê duyệt thay đổi thường xuyên.
Tách document checklist khỏi từng màn hình.
Dùng event bus cho đồng bộ liên module.
Dùng adapter cho mọi hệ thống ngoài.
Dùng audit log bất biến cho hồ sơ và phê duyệt.
Dùng BPMN versioning nghiêm ngặt.
Dùng configuration-driven design cho role, SLA, notification, hội đồng, biểu mẫu.
Không nên làm
Không hard-code tuyến phê duyệt trong backend.
Không nhồi toàn bộ logic nghiệp vụ vào BPMN.
Không để frontend gọi trực tiếp Camunda.
Không lưu object nghiệp vụ lớn trong Camunda variables.
Không để mỗi quy trình có một bộ bảng riêng biệt nếu bản chất giống nhau.
Không đồng bộ trực tiếp point-to-point giữa nhiều module.
15. Kết luận kiến trúc
Kiến trúc phù hợp nhất cho QTKHCN là:
Modular Monolith / Microservice-ready Core
+ Camunda 8 Orchestration Layer
+ Event-driven Integration
+ Document-centric Domain Model
+ Configuration-driven Workflow
+ Strong Audit & Reporting Layer
Trong đó:

Camunda 8 chịu trách nhiệm điều phối quy trình.
QTKHCN Core Services chịu trách nhiệm nghiệp vụ.
Dossier Service là lõi hồ sơ.
Workflow Adapter là lớp chống phụ thuộc trực tiếp vào Camunda.
Integration Hub cô lập các hệ thống ngoài.
Reporting/Data Mart phục vụ điều hành, không truy vấn trực tiếp từ operational tables.
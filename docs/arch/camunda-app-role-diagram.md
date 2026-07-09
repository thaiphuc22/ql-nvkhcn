# Sơ đồ vai trò của Camunda với App QLNVKHCN

> Mục tiêu: làm rõ Camunda nằm ở đâu trong hệ thống đang code, phần nào App chịu trách nhiệm, phần nào Camunda chịu trách nhiệm.

```mermaid
flowchart LR
  User["Người dùng nghiệp vụ<br/>NNC, CQNV, BGD, HDKHCN"]

  subgraph App["App QLNVKHCN"]
    direction TB
    UI["Frontend React<br/>Dashboard, Hồ sơ, Worklist, BPMN Editor,<br/>Rule/DMN, Service Task Config"]
    API["Backend/API nghiệp vụ<br/>RBAC, validation, hồ sơ, biểu mẫu,<br/>phê duyệt, văn bản, audit nghiệp vụ"]
    DB[("DB nghiệp vụ<br/>nhiệm vụ, hồ sơ, phiếu, quyết định,<br/>file, cấu hình, mapping")]
    Workers["Job workers / Integration adapters<br/>thực thi Service Task"]
    Sync["Event/State sync<br/>phản chiếu trạng thái luồng về App"]

    UI -->|"REST/GraphQL API của App"| API
    API -->|"đọc/ghi dữ liệu nghiệp vụ"| DB
    Workers -->|"đọc/ghi dữ liệu qua API nội bộ"| API
    Sync -->|"cập nhật trạng thái hiển thị"| API
  end

  subgraph Camunda["Camunda 8 - lớp điều phối workflow"]
    direction TB
    Zeebe["Zeebe Engine<br/>chạy BPMN, token luồng,<br/>user task, service task, timer"]
    DMN["DMN Decision<br/>luật định tuyến, phân cấp,<br/>kết quả đạt/chưa đạt"]
    TaskAPI["Tasklist API<br/>nguồn task để App hiển thị Worklist"]
    Operate["Operate API/UI<br/>giám sát instance, incident"]
    Identity["Identity<br/>client OAuth, group/role mapping"]

    Zeebe -->|"evaluate decision"| DMN
    Zeebe -->|"user tasks"| TaskAPI
    Zeebe -->|"history, incident"| Operate
    Identity -.->|"token/quyền truy cập"| Zeebe
  end

  External["Hệ thống ngoài<br/>QLNS, MS/Mua sắm, SAP, QLTS, PLM, DMS"]
  IAM["SSO/IAM VHT"]

  User --> UI

  API -->|"1. deploy BPMN/DMN<br/>2. start process instance<br/>3. complete user task<br/>4. query task/status"| Zeebe
  API -->|"lấy việc của tôi"| TaskAPI
  API -->|"giám sát vận hành"| Operate

  Zeebe -->|"activate job"| Workers
  Workers -->|"complete/fail job"| Zeebe
  Workers <-->|"API tích hợp"| External

  IAM <-->|"OIDC/SAML"| Identity
  UI -.->|"không gọi trực tiếp"| Camunda

  classDef app fill:#eaf4ff,stroke:#2563eb,color:#10233f;
  classDef engine fill:#fff4df,stroke:#d97706,color:#3a2502;
  classDef data fill:#ecfdf3,stroke:#16a34a,color:#102f1b;
  classDef external fill:#f8fafc,stroke:#64748b,color:#172033;

  class UI,API,Workers,Sync app;
  class Zeebe,DMN,TaskAPI,Operate,Identity engine;
  class DB data;
  class External,IAM external;
```

## Cách đọc nhanh

Camunda không thay thế App. Camunda là lớp điều phối: biết hồ sơ đang ở bước nào, ai/nhóm nào cần xử lý, nhánh nào được chọn, deadline/timer nào đang chạy, service task nào cần kích hoạt.

App QLNVKHCN vẫn là nơi giữ dữ liệu nghiệp vụ: hồ sơ, nhiệm vụ, phiếu nhận xét, dự toán, quyết định, file, chữ ký, cấu hình hiển thị nút, audit nghiệp vụ.

Frontend chỉ gọi Backend/API của App. Frontend không gọi thẳng Camunda để tránh lộ credential, lệch RBAC, và khó kiểm soát audit.

Backend/API là cửa nối với Camunda: deploy BPMN/DMN, tạo process instance khi mở hồ sơ, complete task khi người dùng bấm duyệt/trả lại/từ chối, query Tasklist/Operate để hiển thị Worklist và giám sát.

Job worker là code của App nhận việc từ Camunda. Khi BPMN tới Service Task, Zeebe tạo job; worker poll job, gọi SAP/QLNS/PLM hoặc chạy logic nội bộ, rồi báo complete/fail về Camunda.

## Ranh giới trách nhiệm

| Việc cần làm                                       | Đặt ở App                                  | Đặt ở Camunda             |
| -------------------------------------------------- | ------------------------------------------ | ------------------------- |
| Nội dung hồ sơ, phiếu, file, quyết định            | Có                                         | Không                     |
| Validation nghiệp vụ phức tạp, truy vấn nhiều bảng | Có                                         | Không                     |
| Trình tự các bước xử lý                            | Không                                      | Có, bằng BPMN             |
| Gán task theo vai trò/candidate group              | App quản role, Camunda giữ task assignment | Có                        |
| Điều kiện rẽ nhánh đơn giản                        | Có thể chuẩn bị biến đầu vào               | Có, bằng gateway/DMN      |
| Service task tích hợp SAP/QLNS/PLM                 | Code worker thực thi                       | Camunda kích hoạt job     |
| Worklist người dùng                                | App hiển thị UI cấu hình                   | Camunda là nguồn task     |
| Giám sát incident/instance                         | App có màn hình tổng hợp                   | Operate là nguồn vận hành |

## Luồng ví dụ: tạo và xử lý một hồ sơ

```mermaid
sequenceDiagram
  participant U as Người dùng
  participant FE as Frontend App
  participant BE as Backend App
  participant DB as DB nghiệp vụ
  participant C as Camunda/Zeebe
  participant W as Job worker
  participant EXT as Hệ thống ngoài

  U->>FE: Tạo hồ sơ / bấm xử lý
  FE->>BE: Gửi request nghiệp vụ
  BE->>DB: Lưu hồ sơ, phiếu, file, audit
  BE->>C: Start instance hoặc complete user task<br/>variables: maHoSo + biến điều khiển
  C-->>BE: Trả processInstanceKey/task result
  BE-->>FE: Trả trạng thái hiển thị

  C->>W: Activate service task job
  W->>BE: Lấy dữ liệu nghiệp vụ theo maHoSo
  W->>EXT: Gọi SAP/QLNS/PLM/DMS nếu cần
  W->>BE: Cập nhật kết quả nghiệp vụ
  W->>C: Complete/fail job

  FE->>BE: Mở Worklist/Giám sát
  BE->>C: Query task/status/incident
  BE->>DB: Ghép dữ liệu hồ sơ để hiển thị
  BE-->>FE: Danh sách việc + trạng thái hồ sơ
```

## Nguyên tắc quan trọng

Camunda variables chỉ nên giữ `maHoSo` và các biến điều khiển rẽ nhánh như `cap`, `ketQuaThamDinh`, `ketQuaPheDuyet`, `quorumDat`. Không đưa nội dung hồ sơ, file, dự toán chi tiết hay phiếu nhận xét vào Camunda variables.

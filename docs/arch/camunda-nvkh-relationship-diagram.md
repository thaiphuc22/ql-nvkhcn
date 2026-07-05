# Sơ đồ quan hệ giữa Camunda 8 và hệ thống Quản lý NVKH

```mermaid
flowchart LR
  User[Người dùng nghiệp vụ]

  subgraph NVKH[Hệ thống Quản lý Nhiệm vụ KHCN]
    direction TB
    UI[Web UI tùy biến<br/>Hồ sơ · Worklist · eForm · Theo dõi]
    API[Backend API nghiệp vụ<br/>RBAC · validation · xử lý hồ sơ]
    DB[(CSDL nghiệp vụ<br/>Hồ sơ · phiếu · quyết định · file)]
    Worker[Job workers / Adapter<br/>thực thi Service Task]
    Event[Đồng bộ trạng thái luồng<br/>event consumer / callback]

    UI -->|REST API| API
    API -->|Đọc / ghi dữ liệu| DB
    Worker -->|Đọc / cập nhật nghiệp vụ| API
    Event -->|Phản chiếu trạng thái| API
  end

  subgraph C8[Camunda 8 — lớp điều phối]
    direction TB
    Gateway[Zeebe Gateway<br/>REST / gRPC]
    Zeebe[Zeebe Workflow Engine<br/>BPMN · task · timer · process variables]
    DMN[Decision Engine<br/>DMN]
    Operate[Operate<br/>Giám sát · incident]
    Identity[Identity<br/>User · group · quyền truy cập]

    Gateway --> Zeebe
    Zeebe -->|Đánh giá quyết định| DMN
    Operate -->|Quan sát / xử lý sự cố| Zeebe
    Identity -.->|Xác thực và phân quyền| Gateway
  end

  IAM[SSO / IAM VHT]
  External[Hệ thống ngoài<br/>QLNS · MS · SAP · QLTS · PLM]

  User --> UI
  API -->|Khởi tạo instance · claim/complete task<br/>đọc trạng thái và biến điều khiển| Gateway
  Gateway -->|Task · trạng thái · kết quả lệnh| API
  Zeebe -->|Activate job| Worker
  Worker -->|Complete / fail job| Gateway
  Zeebe -->|Sự kiện vòng đời process| Event
  Worker <-->|API tích hợp| External
  IAM <-->|OIDC / SAML| Identity
  UI -.->|Không gọi trực tiếp| Gateway

  classDef app fill:#e8f3ff,stroke:#2463a8,color:#132238;
  classDef engine fill:#fff2d9,stroke:#b7791f,color:#33230b;
  classDef data fill:#eaf7ea,stroke:#3c7a3c,color:#173317;
  class UI,API,Worker,Event app;
  class Gateway,Zeebe,DMN,Operate,Identity engine;
  class DB data;
```

## Ranh giới trách nhiệm

- Hệ thống Quản lý NVKH là nguồn dữ liệu nghiệp vụ: hồ sơ, biểu mẫu, phiếu, quyết định và file.
- Camunda là nguồn trạng thái luồng: bước hiện tại, người/nhóm xử lý, thời hạn, nhánh và sự cố.
- Frontend chỉ gọi Backend API, không kết nối trực tiếp Camunda.
- Backend điều khiển instance và User Task qua Zeebe Gateway; Job Worker thực thi Service Task và tích hợp hệ thống ngoài.
- Hai phía tương quan bằng `maHoSo`; Camunda chỉ giữ ID và các biến điều khiển cần thiết.

> Trạng thái thiết kế: mô hình triển khai Camunda SaaS hay Self-Managed vẫn cần được chốt; sơ đồ này thể hiện quan hệ logic, không phụ thuộc mô hình triển khai vật lý.

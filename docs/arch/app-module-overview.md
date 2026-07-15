# Sơ đồ tổng quan App và các phân hệ QTKHCN

> Mục tiêu: cung cấp bản đồ cấp cao để BA, Dev và Kiến trúc sư thống nhất phạm vi toàn hệ thống. Các khối nét liền là năng lực của App QTKHCN; Camunda 8 là nền tảng điều phối độc lập, không thay thế dữ liệu và logic nghiệp vụ của App.

## 1. Bản đồ phân hệ chức năng

```mermaid
flowchart TB
    ACT["Người dùng<br/>PM/PA/NNC · CQNV · Hội đồng<br/>Lãnh đạo · Quản trị viên"]

    subgraph APP["APP QUẢN LÝ NHIỆM VỤ KHCN"]
        direction TB

        subgraph UX["1. Không gian làm việc"]
            DASH["Tổng quan / Dashboard"]
            WORK["Việc của tôi / Worklist"]
            SEARCH["Tra cứu toàn hệ thống"]
            NOTI["Thông báo · Nhắc hạn · Cảnh báo"]
        end

        subgraph BIZ["2. Nghiệp vụ KHCN — vòng đời nhiệm vụ"]
            direction LR
            RD01["RD01<br/>Chủ trương"]
            RD02["RD02<br/>Xét duyệt nhiệm vụ"]
            RD03["RD03<br/>Thực hiện nhiệm vụ"]
            RD04["RD04<br/>Điều chỉnh"]
            RD05["RD05<br/>Nghiệm thu"]
            RD06["RD06<br/>Quyết toán"]
            RD0710["RD07–RD10<br/>Sản phẩm · SHTT<br/>Tổng hợp · Hồ sơ pháp lý"]

            RD01 --> RD02 --> RD03 --> RD05 --> RD06 --> RD0710
            RD03 -. "phát sinh" .-> RD04
            RD04 -. "tiếp tục thực hiện" .-> RD03
        end

        subgraph DOMAIN["3. Các miền nghiệp vụ dùng chung"]
            MISSION["Nhiệm vụ KHCN"]
            DOSSIER["Hồ sơ quy trình"]
            COUNCIL["Hội đồng & Thẩm định"]
            EXEC["Tiến độ · Nhân sự · Milestone"]
            BUDGET["Kinh phí · Chi phí · Quyết toán"]
            OUTPUT["Sản phẩm nghiên cứu · SHTT"]
        end

        subgraph CONFIG["4. Quy trình & Cấu hình nghiệp vụ"]
            PROCESS["Định nghĩa quy trình<br/>BPMN · Version · Deploy"]
            FORM["Biểu mẫu động<br/>Form · Field · Validation"]
            RULE["Luật nghiệp vụ<br/>DMN · FEEL · Simulation"]
            MATRIX["Ma trận phê duyệt<br/>Routing · Approver · Quorum"]
            ACTION["Action Studio<br/>Action · Availability · Outcome"]
            SLA["SLA · Timer · Escalation"]
            TEMPLATE["Mẫu văn bản · Merge field"]
        end

        subgraph DOCREP["5. Hồ sơ, tài liệu & báo cáo"]
            DOC["Tài liệu · Phiên bản · Ký số"]
            ARCHIVE["Lưu trữ · Tìm kiếm toàn văn"]
            REPORT["Báo cáo · Dashboard lãnh đạo · KPI"]
        end

        subgraph OPS["6. Vận hành & Tích hợp"]
            MON["Giám sát process instance"]
            INCIDENT["Incident · Retry · Reassign · Cancel"]
            INTEGRATION["Connector · Job Worker · Đối soát"]
            AUDIT["Audit log · Integration log"]
        end

        subgraph ADMIN["7. Danh mục & Quản trị hệ thống"]
            ORG["Cơ cấu tổ chức"]
            USER["Người dùng · SSO mapping"]
            RBAC["Vai trò · Quyền · Data scope"]
            MASTER["Danh mục nghiệp vụ"]
            PARAM["Tham số · Feature toggle"]
        end
    end

    ACT --> UX
    UX --> BIZ
    BIZ --> DOMAIN
    CONFIG -. "cấu hình cách vận hành" .-> BIZ
    DOMAIN --> DOCREP
    ADMIN -. "tổ chức, quyền, danh mục" .-> UX
    ADMIN -. "dữ liệu nền" .-> BIZ
    BIZ --> OPS
```

## 2. Kiến trúc logic toàn App

```mermaid
flowchart LR
    USER["Người dùng VHT"]
    ADMINUSER["BA / Process Admin"]

    subgraph PRESENT["Presentation Layer"]
        PORTAL["Portal QTKHCN<br/>Dashboard · Worklist · Hồ sơ"]
        DESIGNER["Configuration Center<br/>BPMN · DMN · Form · Matrix"]
        OPSUI["Operations Console<br/>Giám sát · Incident · Audit"]
    end

    subgraph EDGE["API Layer"]
        BFF["API Gateway / BFF<br/>AuthZ · Composition · Audit context"]
    end

    subgraph CORE["QTKHCN Core — nguồn chuẩn dữ liệu nghiệp vụ"]
        MISSION["Mission Service"]
        DOSSIER["Dossier Service"]
        APPROVAL["Approval Service"]
        COUNCIL["Council Service"]
        EXECUTION["Execution Service"]
        FINANCE["Budget & Settlement"]
        RESEARCH["Research Output & IP"]
        CONFIG["Configuration Service"]
        REPORTING["Reporting Service"]
    end

    subgraph ORCH["Workflow Adapter Layer"]
        WFA["Workflow Adapter<br/>Start · Task · Variable · Incident"]
        WORKERS["Job Workers<br/>Rule · Routing · Integration"]
        EVENT["Outbox / Inbox · Event Bus"]
    end

    subgraph CAMUNDA["Camunda 8 Self-Managed — nguồn chuẩn trạng thái luồng"]
        ZEEBE["Zeebe Gateway / Brokers<br/>BPMN · Jobs · Timers"]
        DECISION["Decision Engine<br/>DMN · FEEL"]
        C8API["Orchestration Cluster API"]
        OPERATE["Operate / Runtime Operations"]
        IDENTITY["Identity / Authorization"]
    end

    subgraph DATA["Data Layer"]
        BIZDB[("Operational DB<br/>Nhiệm vụ · Hồ sơ · Hội đồng")]
        CFGDB[("Configuration DB<br/>BPMN XML · DMN · Form · Version")]
        OBJECT[("Object Storage / DMS<br/>File · Quyết định · Minh chứng")]
        SEARCH[("Search Index")]
        DWH[("DWH / KPI")]
        AUDITDB[("Audit Store")]
    end

    subgraph EXT["Hệ thống ngoài"]
        IAM["IAM/SSO VHT"]
        PLM["PLM"]
        SAP["SAP"]
        QLNS["QLNS"]
        MS["Mua sắm"]
        QLTS["QLTS"]
        SIGN["Chữ ký số"]
        MAIL["Email/SMS/App"]
    end

    USER --> PORTAL
    ADMINUSER --> DESIGNER
    ADMINUSER --> OPSUI
    PORTAL --> BFF
    DESIGNER --> BFF
    OPSUI --> BFF

    BFF --> CORE
    CORE --> WFA
    CORE --> EVENT
    WFA --> C8API
    C8API --> ZEEBE
    ZEEBE --> DECISION
    ZEEBE --> WORKERS
    OPSUI --> OPERATE

    CORE --> BIZDB
    CONFIG --> CFGDB
    CORE --> OBJECT
    CORE --> SEARCH
    REPORTING --> DWH
    CORE --> AUDITDB

    BFF <-->|"OIDC/JWT"| IAM
    IDENTITY <-->|"OIDC / group mapping"| IAM
    WORKERS --> PLM
    WORKERS --> SAP
    WORKERS --> QLNS
    WORKERS --> MS
    WORKERS --> QLTS
    WORKERS --> SIGN
    WORKERS --> MAIL
```

## 3. Quan hệ giữa hai phân hệ trọng tâm

```mermaid
flowchart LR
    subgraph QLQT["PHÂN HỆ QUẢN TRỊ QUY TRÌNH"]
        BPMN["BPMN Definition"]
        DMN["DMN / Business Rule"]
        FORM["Dynamic Form"]
        MATRIX["Approval Matrix"]
        ACTION["Action Policy"]
        SLA["SLA / Escalation"]
        VERSION["Review · Version · Deploy"]

        BPMN --> VERSION
        DMN --> VERSION
        FORM --> VERSION
        MATRIX --> VERSION
        ACTION --> VERSION
        SLA --> VERSION
    end

    C8["Camunda 8 Self-Managed<br/>Thực thi BPMN/DMN<br/>Task · Job · Timer · Incident"]

    subgraph QLNV["PHÂN HỆ QUẢN LÝ NHIỆM VỤ KHCN"]
        NV["Nhiệm vụ"]
        HS["Hồ sơ"]
        TASK["Việc cần xử lý"]
        HD["Hội đồng / Phiếu đánh giá"]
        TH["Thực hiện / Tiến độ"]
        TC["Kinh phí / Quyết toán"]
        SP["Sản phẩm / SHTT"]
        TL["Tài liệu / Quyết định"]
    end

    VERSION -->|"Deploy BPMN/DMN/Form"| C8
    QLQT -->|"cấu hình routing, action, SLA"| QLNV
    HS -->|"Start instance<br/>dossierId + control variables"| C8
    C8 -->|"User Task / Worklist"| TASK
    C8 -->|"Activate Job"| QLNV
    QLNV -->|"Complete Job/User Task<br/>control outputs"| C8
    C8 -->|"trạng thái luồng"| HS

    NV --> HS
    HS --> HD
    HS --> TH
    HS --> TC
    HS --> SP
    HS --> TL
```

## 4. Ranh giới trách nhiệm

| Khối | Chịu trách nhiệm | Không nên chịu trách nhiệm |
|---|---|---|
| Quản lý Nhiệm vụ KHCN | Nhiệm vụ, hồ sơ, hội đồng, kinh phí, sản phẩm, tài liệu | Điều khiển token BPMN trực tiếp |
| Quản trị Quy trình | BPMN/DMN/Form, version, approval matrix, action, SLA | Lưu nội dung hồ sơ nghiệp vụ |
| Camunda 8 | Token luồng, user task, job, timer, gateway, incident | Là database nhiệm vụ/hồ sơ/file |
| Workflow Adapter | Cô lập API/SDK Camunda, mapping instance/task/variable | Chứa toàn bộ business logic |
| Job Worker | Thực thi service task, gọi domain/external API, retry | Cho frontend gọi trực tiếp |
| BFF/API Gateway | Xác thực, phân quyền, compose dữ liệu cho UI | Để frontend gọi thẳng Camunda |

## 5. Trạng thái triển khai theo repo hiện tại

- Đã có route/UI nền: Tổng quan, Việc của tôi, Quy trình, Biểu mẫu, Nhiệm vụ, Hồ sơ, Cơ cấu tổ chức, Người dùng, Phân quyền, Giám sát, Tích hợp, Nhật ký, Luật nghiệp vụ, Ma trận phê duyệt và Cấu hình hành động.
- Cần hoàn thiện theo vòng đời nghiệp vụ: Chủ trương/xét duyệt, Hội đồng/thẩm định, Thực hiện, Điều chỉnh, Nghiệm thu, Quyết toán, Sản phẩm nghiên cứu, Báo cáo, Hồ sơ pháp lý và Danh mục nghiệp vụ.
- Camunda 8 Self-Managed là nền tảng độc lập; App kết nối qua Workflow Adapter và Job Worker.


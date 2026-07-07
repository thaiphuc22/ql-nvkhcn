flowchart TB
    UI["Web App / Portal QTKHCN"]
    BFF["Backend for Frontend / API Gateway"]

    subgraph CORE["QTKHCN Core Services"]
        MISSION["Mission Service<br/>Nhiệm vụ KHCN"]
        DOSSIER["Dossier Service<br/>Hồ sơ - Tài liệu"]
        APPROVAL["Approval Service<br/>Phê duyệt"]
        COUNCIL["Council Service<br/>Hội đồng"]
        EXECUTION["Execution Service<br/>Thực hiện nhiệm vụ"]
        BUDGET["Budget & Settlement Service<br/>Dự toán - Quyết toán"]
        PRODUCT["Research Output Service<br/>Sản phẩm - SHTT"]
        REPORT["Reporting Service<br/>Dashboard - KPI"]
        CONFIG["Configuration Service<br/>Danh mục - Role - Form - SLA"]
    end

    subgraph CAMUNDA["Camunda 8 Orchestration Layer"]
        ZEEBE["Zeebe / Orchestration Cluster<br/>BPMN Execution"]
        TASKLIST["Tasklist / Custom Task App"]
        OPERATE["Operate<br/>Monitoring & Troubleshooting"]
        OPTIMIZE["Optimize<br/>Process Analytics"]
        IDENTITY["Identity<br/>AuthZ/AuthN Integration"]
    end

    subgraph INTEGRATION["Integration Layer"]
        EVENTBUS["Event Bus / Message Broker"]
        CONNECTOR["Integration Adapter / Connector Workers"]
        OUTBOX["Outbox / Inbox Pattern"]
    end

    subgraph EXT["External Systems"]
        QLNS["QLNS"]
        MS["MS / Mua sắm"]
        SAP["SAP"]
        QLTS["QLTS"]
        PLM["PLM"]
        STORAGE["Storage / DMS"]
        CRM["CRM"]
    end

    subgraph DATA["Data Layer"]
        DB["Operational DB"]
        AUDIT["Audit Log Store"]
        SEARCH["Search Index"]
        DWH["Data Warehouse / Data Mart"]
        FILE["Object Storage"]
    end

    UI --> BFF
    BFF --> MISSION
    BFF --> DOSSIER
    BFF --> APPROVAL
    BFF --> COUNCIL
    BFF --> REPORT
    BFF --> TASKLIST

    MISSION --> ZEEBE
    APPROVAL --> ZEEBE
    DOSSIER --> ZEEBE
    COUNCIL --> ZEEBE
    EXECUTION --> ZEEBE
    BUDGET --> ZEEBE

    ZEEBE --> TASKLIST
    ZEEBE --> OPERATE
    ZEEBE --> OPTIMIZE
    IDENTITY --> ZEEBE

    CORE --> DB
    DOSSIER --> FILE
    CORE --> AUDIT
    REPORT --> DWH
    DOSSIER --> SEARCH

    CORE --> EVENTBUS
    EVENTBUS --> CONNECTOR
    CONNECTOR --> QLNS
    CONNECTOR --> MS
    CONNECTOR --> SAP
    CONNECTOR --> QLTS
    CONNECTOR --> PLM
    CONNECTOR --> STORAGE
    CONNECTOR --> CRM
    CONNECTOR --> OUTBOX
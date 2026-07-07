# Tóm tắt thư mục `docs/research`

> Tài liệu này tổng hợp nội dung 22 file research/brainstorm về hệ thống **QTKHCN** (Quản lý Nhiệm vụ Khoa học Công nghệ), tập trung vào kiến trúc nền tảng, Module Cấu hình (Configuration Service) và cơ chế xử lý ngoại lệ trong workflow (Camunda 8). Đây là các ghi chú nghiên cứu/tư vấn kiến trúc ở dạng brainstorm, **chưa phải BRD/FRD hoàn chỉnh**.

## ⚠️ Vấn đề cần rà soát trước tiên

- **`camunda-integration-suggest.md` và `kien-truc-muc-tieu.md` trùng lặp 100%** — cả hai chỉ chứa cùng một sơ đồ Mermaid tổng thể (UI → BFF → Core Services → Camunda 8 → Integration Layer → External Systems → Data Layer), không có nội dung riêng theo đúng tên file.
- Nội dung thực chất về "kiến trúc mục tiêu/kiến trúc cấp cao" (nguyên tắc thiết kế, phân lớp, service model, security, deployment, CI/CD...) nằm trọn trong **`hight-level-architech.md`** — file này lại thiếu mục "1." (có thể bị cắt khi tạo file).
- → Cần tái cấu trúc 3 file này cho khớp tên gọi: giữ 1 file sơ đồ tổng quan, 1 file giải thích chi tiết kiến trúc, và viết riêng nội dung "đề xuất tích hợp Camunda" (business key, sequence diagram, worker pattern) đúng như tên `camunda-integration-suggest.md` gợi ý.
- **`key-feature.md`** có vẻ là feature list tham khảo từ sản phẩm "Approval Hub" khác (nhắc Outlook/Teams/Power Apps, ví dụ "yêu cầu nghỉ phép") — chưa rõ có phải yêu cầu chính thức cho QTKHCN hay chỉ là benchmark tham khảo.

---

## 1. Kiến trúc cấp cao (`hight-level-architech.md`)

**Nguyên tắc chủ đạo:** Camunda 8 không thay thế Core System — chỉ điều phối workflow (BPMN, user task, timer, escalation), không lưu dữ liệu nghiệp vụ (hồ sơ, ngân sách, hội đồng...).

**Phân lớp:**
- **Presentation**: Web Portal QTKHCN (Dashboard, Workspace, màn hình hồ sơ/task/hội đồng/báo cáo, Admin Console) — khuyến nghị custom task UI thay vì Tasklist mặc định.
- **API Gateway/BFF**: gom dữ liệu từ Camunda + các domain service, tránh frontend gọi trực tiếp nhiều service.
- **Domain Services**: khởi đầu **Modular Monolith**, tách microservice dần theo tải/team scale. Modules: Mission, Dossier, Workflow Adapter, Approval, Council, Execution, Budget, Settlement, Research Output, IP, Reporting, Configuration, Integration.

**Vai trò Camunda 8**: Zeebe (thực thi), Tasklist (human task), Operate (giám sát/sự cố), Identity (auth), Optimize (phân tích).
- Nên dùng cho: RD01 (Xét duyệt Chủ trương), RD02 (Xét duyệt Nhiệm vụ), RD04 (Điều chỉnh), RD05 (Nghiệm thu), RD06 (Quyết toán), RD03.06, RD08, RD10.
- Không dùng cho: CRUD danh mục, dashboard, lưu file, tính toán ngân sách, search, BI.

**Tích hợp Camunda**: `businessKey` = `missionId`/`dossierId`; Camunda variable chỉ lưu dữ liệu điều phối; Domain Service là source of truth nghiệp vụ, Camunda instance là source of truth trạng thái workflow.

**7 service chính**: Mission Service, Dossier Service (lõi hồ sơ — quan trọng nhất, mọi quy trình RD01–06 xoay quanh), Workflow Adapter Service (cô lập gọi Camunda trực tiếp), Approval Service, Council Service, Configuration Service, Integration Service.

**Event-driven**: ví dụ event `DossierApproved` lan tỏa tới Mission/Notification/Reporting/Archive/Integration Service. Đề xuất Kafka/RabbitMQ/Pulsar + Outbox/Inbox pattern + idempotency key.

**Data**: Operational DB theo schema từng domain; Object Storage cho file; Search Index (Elasticsearch...); Data Warehouse cho dashboard KPI (Fact/Dim tables).

**Deployment**: Kubernetes/OpenShift, Camunda 8 Orchestration Cluster, Observability Stack.

**Security**: SSO/OIDC/MFA; RBAC + ABAC (theo đơn vị/vai trò/cấp nhiệm vụ); audit toàn diện (login, data change, approval, chữ ký số, workflow, integration).

**CI/CD & BPMN governance**: pipeline Design → Peer Review → BA Validation → Technical Validation → Test Deploy → UAT → Production → Version Lock. Nguyên tắc: mỗi quy trình có `processCode` (VD RD01.01), nhiệm vụ đang chạy giữ nguyên version cũ, không sửa BPMN production khi đang có instance active.

**Nguyên tắc bảo trì**: tách workflow khỏi business data, tách form/approval matrix/checklist khỏi code/BPMN, dùng event bus liên module, configuration-driven cho role/SLA/notification/form. Tránh: hard-code tuyến phê duyệt, nhồi logic nghiệp vụ vào BPMN, frontend gọi thẳng Camunda, lưu object lớn trong Camunda variables.

## 2. Sơ đồ kiến trúc tổng thể (`camunda-integration-suggest.md` / `kien-truc-muc-tieu.md`)

Flowchart: **UI → BFF → QTKHCN Core Services** (Mission, Dossier, Approval, Council, Execution, Budget & Settlement, Research Output, Reporting, Configuration) **→ Camunda 8 Orchestration** (Zeebe, Tasklist, Operate, Optimize, Identity) **→ Integration Layer** (Event Bus, Connector Workers, Outbox/Inbox) **→ External Systems** (QLNS, MS, SAP, QLTS, PLM, Storage/DMS, CRM) **→ Data Layer** (Operational DB, Audit Log, Search Index, DWH, Object Storage).

## 3. Module Cấu hình — Configuration Service (`configuration-service.md` + EPIC01–16)

**Định hướng:** thiết kế module Cấu hình như **"Workflow Platform Configuration Center"** tái dùng được cho các nghiệp vụ khác ngoài QTKHCN (đầu tư, mua sắm, ISO, văn bản, CAPEX, R&D), chia thành capability thay vì theo menu.

**Điểm thảo luận trọng tâm — ranh giới EPIC 06 vs EPIC 09:**
| | Approval Matrix (EPIC 06) | Business Rule (EPIC 09) |
|---|---|---|
| Câu hỏi | "Ai xử lý tiếp?" | "Điều gì đúng/sai?" |
| Output | Approver/Step | Decision/Value/Result |
| Gọi ở đâu | User Task | Bất kỳ đâu |
| Thay đổi theo | Tổ chức | Chính sách nghiệp vụ |

Với Camunda 8/DMN: BPMN gọi Business Rule Task → DMN Decision Table → kết quả → Gateway → Approval Matrix resolve người duyệt → User Task. Khuyến nghị: EPIC06 chỉ làm Routing (Resolver, Approval Chain, Delegation, Substitute); EPIC09 chỉ làm Decision (DMN, FEEL Expression, Rule Version, Rule Simulation).

**Danh sách 16 EPIC:**
| EPIC | Tên | Nội dung chính |
|---|---|---|
| 01 | Organization Management | Công ty/Khối/Trung tâm/Phòng ban/Nhóm — nền tảng phân quyền |
| 02 | User & Identity | Không CRUD tài khoản — chỉ mapping AD User → QTKHCN User → Business Role, SSO |
| 03 | Role & Permission | Epic lớn: System Role, Business Role (PM, PA, NNC, TGĐ, HĐ...), Data Scope |
| 04 | Workflow Definition | "Trái tim" hệ thống — Workflow, Version, Category (RD01, RD02, RD05...) |
| 05 | BPMN Designer | Tương đương Camunda Modeler — Design/Deploy/Validate/Diff/Rollback |
| 06 | Approval Matrix | Epic lớn nhất — Routing rule (VD: Mission Level=Tập đoàn AND Budget>5 tỷ → HĐ KHCN → TGĐ) |
| 07 | Dynamic Form | Không hardcode form — Form/Section/Field/Control/Validation |
| 08 | Document Template | Merge field cho Word/PDF (VD `{{MissionName}}`, `{{PM}}`, `{{Budget}}`) |
| 09 | Business Rule | Không hardcode IF-ELSE — Rule/Expression/Condition, có thể map sang DMN |
| 10 | Notification | Template đa kênh: Email/SMS/Web/App/Telegram, Trigger theo sự kiện |
| 11 | SLA & Escalation | Deadline, Escalation Chain, Calendar/Working Day/Holiday |
| 12 | Master Data | Danh mục hệ thống: Research Field, Mission Category, Funding Source... |
| 13 | Integration | Connector/Endpoint/Auth cho SAP, PLM, QLNS, Storage, CRM |
| 14 | Audit & System | System Parameter, Feature Toggle, License, Config history |
| 15 | Dashboard Configuration | Dashboard/Widget/Metric/Filter tùy biến |
| 16 | Workflow Runtime Administration (đề xuất bổ sung) | Quản lý process instance, retry failed job, cancel/restart, reassign task, incident management — **dễ bị bỏ sót khi phân tích nhưng rất quan trọng lúc vận hành thực tế** |

**Dependency Graph:** Organization → Role & Permission → Approval Matrix → Workflow Definition → BPMN Version → Dynamic Form → Business Rule → Notification → SLA → Dashboard.

> Lưu ý: EPIC01–15 hiện chỉ là outline (entity + feature), chưa có field chi tiết/API spec/wireframe. EPIC16 chưa được chốt chính thức vào roadmap — cần xác nhận với stakeholder.

## 4. Mô hình hiển thị Action Button (`action-availability-model.md`)

**Vấn đề:** mỗi hồ sơ ở mỗi bước cần hiển thị nhóm action phụ thuộc BPMN, cộng thêm action xử lý ngoại lệ.

**Quyết định:** không cho user tự thêm/bớt button (vì button kéo theo quyền, validate, đổi trạng thái, complete task Camunda, audit, SLA). Thay vào đó tách 3 lớp: **Action Button (UI) → Business Action (backend) → Workflow Transition (BPMN/Camunda)**, quản lý qua **Action Registry + Action Availability Policy + Exception Action Policy**.

**Phân loại 3 loại action:**
1. **Standard Action** — theo BPMN chuẩn (Submit, Approve, Reject, Return, Sign, Complete Review).
2. **Support Action** — không đổi workflow (Comment, Download, Export PDF, View Audit).
3. **Exception Action** — đổi luồng chuẩn (Request Bypass Council, Request Route To Higher Approver, Request Add Reviewer, Request Reopen Step, Request Manual Completion...).

**Công thức hiển thị:** `Button = Workflow Context + User Permission + Business Rule + Dossier State + Exception Policy + UI Configuration`.

**API đề xuất:** `GET /dossiers/{dossierId}/available-actions` trả về `actionCode`, `label`, `type`, `enabled`, `requiresConfirm`, `requiresReason`, `requiresEvidence` — UI chỉ render theo response backend.

**Data model:** `action_definition`, `action_availability_policy`, `exception_action_policy`.

**UI:** chia 3 nhóm nút — Primary Actions / More Actions / Exception Actions (menu riêng, tạo cảm giác "không phải thao tác thông thường").

## 5. Xử lý ngoại lệ có kiểm soát (`controlled-exception-handling.md`)

**Tình huống ví dụ:** hồ sơ theo BPMN cần qua Hội đồng, nhưng PM muốn trình thẳng cấp cao hơn, bỏ qua Hội đồng.

**Nguyên tắc:** không sửa BPMN liên tục để xử lý case ngoại lệ, không cho admin nhảy task tùy ý qua Operate process instance modification (chỉ dùng cho vận hành kỹ thuật). Thay vào đó xây **Exception Governance Layer** riêng, tách khỏi BPMN Standard Workflow — mọi ngoại lệ phải có lý do, căn cứ, người đề xuất, người duyệt, audit trail, giới hạn phạm vi áp dụng.

**5 thành phần kiến trúc:**
1. **Exception Request Service** — ghi nhận yêu cầu (`ExceptionRequest`: exceptionId, missionId, dossierId, exceptionType, requestedAction, reason, evidence, status...).
2. **Exception Policy Engine** — rule kiểm tra ai được xin, bước nào, ai duyệt, có cần bằng chứng.
3. **Exception Approval Workflow** — bản thân là 1 workflow nhỏ: Request → Review → Approve/Reject → Apply. Người xin bypass không được tự quyết.
4. **Dynamic Routing Service** — xác định bước tiếp theo sau khi ngoại lệ được duyệt (Standard Route vs Exception Route).
5. **Audit & Compliance Service** — ghi đầy đủ ai/khi nào/lý do/căn cứ/ai duyệt/bỏ qua bước nào cho thanh tra/kiểm toán/nghiệm thu.

**3 pattern triển khai trên Camunda 8:**
- **Pattern 1**: Standard Process + Exception Subprocess tại các bước nhạy cảm.
- **Pattern 2**: Ad-hoc Subprocess cho vùng nghiệp vụ linh hoạt (VD vùng "Thẩm định hồ sơ").
- **Pattern 3**: Case Management Layer bên ngoài BPMN cho ngoại lệ không lường trước (`ResearchMission Case` = Standard Workflow + Exception Requests + Manual Decisions + Ad-hoc Tasks + Audit Trail).

**Danh mục ExceptionType chuẩn hóa:** SkipStep, JumpToHigherApprover, AddAdditionalReviewer, ReplaceApprover, DelegateApproval, ReopenCompletedStep, ReturnToPreviousStep, BypassCouncil, EmergencyApproval, ManualCompletion, SuspendWorkflow, TerminateWorkflow.

**Data model:** `workflow_exception_request`, `workflow_exception_policy`, `workflow_exception_audit`.

**Phân quyền tách biệt:** `REQUEST_EXCEPTION`, `APPROVE_EXCEPTION`, `APPLY_EXCEPTION`, `VIEW_EXCEPTION_AUDIT` — một người không nên có cả 3 quyền đầu trên cùng hồ sơ.

**UI:** timeline hồ sơ phải hiển thị rõ từng bước ngoại lệ (không che giấu), ví dụ: [Chuẩn] Cần trình Hội đồng → [Ngoại lệ] PM yêu cầu bỏ qua → [Duyệt ngoại lệ] PTGĐ đồng ý → [Bypass] → [Route mới] Trình TGĐ.

> Liên kết khái niệm: Exception Action (mục 4) ↔ ExceptionType/Exception Policy (mục 5) ↔ Business Rule/DMN (EPIC09, mục 3) — ba tài liệu này mô tả cùng một hệ thống quản trị ngoại lệ nhìn từ 3 góc độ (UI, workflow governance, decision logic) và nên được đọc/triển khai cùng nhau.

## 6. Feature list tham khảo (`key-feature.md`)

Danh sách tính năng ngắn, giống mô tả benchmark từ một sản phẩm "Approval Hub" (nhắc Outlook/Teams/Power Apps, ví dụ "yêu cầu nghỉ phép"): biểu mẫu phê duyệt đa cấp, quy trình nhiều bước không giới hạn, delegation, submit on behalf, tích hợp Outlook/Teams, thảo luận, thông báo, tích hợp Power Apps, đính kèm tài liệu. **Cần xác nhận đây là benchmark tham khảo hay yêu cầu chính thức cho QTKHCN** trước khi đưa vào phạm vi.

---

## Việc cần làm tiếp (rút ra từ toàn bộ tài liệu)

1. Rà soát & tái cấu trúc 3 file trùng lặp: `camunda-integration-suggest.md`, `kien-truc-muc-tieu.md`, `hight-level-architech.md`.
2. Xác nhận nguồn gốc và phạm vi áp dụng của `key-feature.md`.
3. Chốt ranh giới kiến trúc EPIC06 (Approval Matrix) vs EPIC09 (Business Rule) trước khi implement.
4. Xác nhận với stakeholder việc bổ sung EPIC16 (Workflow Runtime Administration) vào roadmap chính thức.
5. Đặc tả chi tiết hơn cho EPIC01–15 (hiện mới ở dạng outline): field, API spec, UI wireframe, permission matrix.
6. Viết spec API/UI mockup cho Exception Request Service và giới hạn cụ thể (`max_times_per_dossier`) cho từng loại ngoại lệ.

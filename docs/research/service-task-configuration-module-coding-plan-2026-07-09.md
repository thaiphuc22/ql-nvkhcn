# Service Task Configuration - Coding Plan

**Ngày lập**: 2026-07-09  
**Plan gốc**: `docs/research/service-task-configuration-module-plan-2026-07-09.md`  
**Trạng thái harness**: Frontend-mock carve-out, theo kiến trúc hiện tại của `webapp`: React + Vite + Ant Design, data mock trong `src/data`, state in-memory qua Context. Chưa nối backend/Camunda thật.

---

## Hướng tiếp cận

Triển khai module mới `Cấu hình Service Task` như một màn cấu hình độc lập, nằm trong nhóm `Quản trị quy trình`, nhưng tái sử dụng các mảnh đã có:

| Vùng hiện có | Cách dùng lại |
| --- | --- |
| `webapp/src/data/jobTypes.ts` | Danh mục `zeebe:TaskDefinition.type` đang dùng cho service task trong BPMN editor. |
| `webapp/src/data/elementTemplates.ts` | Service task template kéo thả trong BPMN editor. |
| `webapp/src/data/integrationMapping.ts` | Mapping/connector đã có cho SAP/QLNS/MS/QLTS/PLM/IAM. |
| `webapp/src/data/camundaOps.ts` | Process instance, incident, job run, process event mock. |
| `webapp/src/data/bpmnReconcile.ts` | Pattern đối soát BPMN ↔ cấu hình của Action Studio. |
| `webapp/src/pages/ActionStudio.tsx` | Pattern tab luồng cấu hình + reconcile + simulator. |
| `webapp/src/components/ui` | `PageHeader`, `StatCard`, `StatusTag`, bảng/list UI dùng chung. |

Nguyên tắc coding:

- MVP không cho nhập script tùy ý.
- Service task config chỉ chọn type/executor đã registry trong code.
- Binding ghim theo `processCode + processVersion + taskDefinitionKey`.
- Validate fail-closed trước khi active.
- Execution log không lưu secret/token, chỉ lưu summary đã mask.
- UI là mock in-memory nhưng model đặt gần backend để sau này thay bằng API.

---

## File chính cần thêm/sửa

| File | Việc cần làm |
| --- | --- |
| `webapp/src/data/serviceTasks.ts` | **MỚI** - domain model, seed type/definition/version/binding/log/audit, validate/preview helper. |
| `webapp/src/data/serviceTaskReconcile.ts` | **MỚI** - đối soát service task BPMN/process metadata ↔ binding/config. |
| `webapp/src/store/ServiceTaskContext.tsx` | **MỚI** - CRUD definition, save version, active/deprecate, bind/unbind, test preview, retry/manual resolve mock. |
| `webapp/src/pages/ServiceTaskConfig.tsx` | **MỚI** - màn chính dạng tab: tổng quan, cấu hình, binding, test, log/audit. |
| `webapp/src/components/ServiceTaskFormDrawer.tsx` | **MỚI** - drawer tạo/sửa cấu hình service task. |
| `webapp/src/components/ServiceTaskMappingEditor.tsx` | **MỚI** - editor input/output mapping dạng bảng key/value an toàn. |
| `webapp/src/components/ServiceTaskTestPanel.tsx` | **MỚI** - preview input, payload, response giả lập, output mapping. |
| `webapp/src/components/ServiceTaskBindingTable.tsx` | **MỚI** - bảng đối soát và gắn config vào task BPMN. |
| `webapp/src/components/ServiceTaskExecutionDrawer.tsx` | **MỚI** - drill-down log/incident theo process instance. |
| `webapp/src/main.tsx` | **SỬA** - bọc `ServiceTaskProvider`. |
| `webapp/src/App.tsx` | **SỬA** - lazy route `/cau-hinh-service-task`, menu item `Tác vụ hệ thống`. |
| `webapp/src/data/processes.ts` | **SỬA NHẸ nếu cần** - bổ sung metadata service task mock cho một số quy trình demo. |
| `webapp/src/data/camundaOps.ts` | **SỬA NHẸ nếu cần** - liên kết `ServiceTaskExecutionLog` với incident/job run hiện có. |

---

## Đợt 0 - Chốt phạm vi frontend MVP

**Mục tiêu**: Không biến scope thành backend runtime thật trong lần đầu.

Quyết định coding:

- Tên route: `/cau-hinh-service-task`.
- Tên menu: `Tác vụ hệ thống`.
- Màn nằm dưới nhóm `Quản trị quy trình`, cùng tầng với `Ma trận Hành động`.
- Backend/API/worker thật để phase sau; trong repo hiện tại chỉ mô phỏng cấu hình, validate, binding, execution log.
- Seed Phase 1 gồm 5 type:
  - `SEND_NOTIFICATION`
  - `CALL_API`
  - `UPDATE_DOSSIER`
  - `GENERATE_DOCUMENT`
  - `EVALUATE_DECISION`

**Verify**: Không code logic runtime thật trong đợt này; chỉ tạo model/mock và UI admin.

---

## Đợt 1 - Domain model & seed data

**Mục tiêu**: Có một nguồn dữ liệu rõ ràng cho toàn module.

### Slice A - Model trong `serviceTasks.ts`

Tạo các type:

```ts
export type ServiceTaskTypeCode =
  | "SEND_NOTIFICATION"
  | "CALL_API"
  | "UPDATE_DOSSIER"
  | "GENERATE_DOCUMENT"
  | "EVALUATE_DECISION";

export type ServiceTaskDefinitionStatus =
  | "DRAFT"
  | "READY"
  | "ACTIVE"
  | "DEPRECATED"
  | "ERROR";

export type ServiceTaskBindingStatus = "ACTIVE" | "INACTIVE" | "ERROR";
export type ServiceTaskConfigVersionStatus = "DRAFT" | "READY" | "ACTIVE" | "ARCHIVED";
export type ServiceTaskExecutionStatus =
  | "RUNNING"
  | "SUCCESS"
  | "FAILED"
  | "RETRYING"
  | "SKIPPED"
  | "MANUAL_RESOLVED";
```

Tạo interface:

- `ServiceTaskType`
- `ServiceTaskDefinition`
- `ServiceTaskBinding`
- `ServiceTaskConfigVersion`
- `ServiceTaskExecutionLog`
- `ServiceTaskAuditEntry`
- `ServiceTaskErrorPolicy`
- `ServiceTaskInputMapping`
- `ServiceTaskOutputMapping`
- `ServiceTaskPreviewResult`

### Slice B - Seed dữ liệu

Seed tối thiểu:

- 5 `ServiceTaskType`.
- 4-6 `ServiceTaskDefinition` demo:
  - thông báo phê duyệt hồ sơ,
  - đồng bộ SAP,
  - cập nhật trạng thái hồ sơ,
  - sinh quyết định,
  - gọi DMN định tuyến.
- 2-3 active config version.
- 3-5 binding vào các process có service task demo.
- Log thành công/thất bại liên kết với `seedInstances`, `seedJobRuns`, `seedEvents`.

### Slice C - Helper validate

Tạo:

- `validateServiceTaskConfig(definition, version, context)`.
- `maskServiceTaskPayload(value)`.
- `resolveInputMapping(mapping, sampleContext)`.
- `applyOutputMapping(response, outputMapping)`.
- `previewServiceTaskConfig(definition, version, sampleContext)`.

Validate chặn active nếu:

- thiếu type hoặc type disabled,
- thiếu config bắt buộc theo type,
- `CALL_API` không tham chiếu connector/mapping active,
- output mapping ghi vào field không whitelist,
- error policy thiếu `timeoutMs` hoặc retry âm,
- mapping expression rỗng/sai format đơn giản.

**Verify**: `npm run typecheck` hoặc `npm run build` không lỗi type.

---

## Đợt 2 - Context/state API in-memory

**Mục tiêu**: UI không sửa trực tiếp seed data, có API nội bộ giống backend.

Tạo `webapp/src/store/ServiceTaskContext.tsx`.

State:

- `types`
- `definitions`
- `versions`
- `bindings`
- `executionLogs`
- `auditEntries`

Actions:

- `createDefinition(input)`.
- `updateDefinition(id, patch)`.
- `duplicateDefinition(id)`.
- `saveDraftVersion(definitionId, patch, changeNote)`.
- `validateVersion(definitionId, versionNo)`.
- `activateVersion(definitionId, versionNo, actor, reason)`.
- `deprecateDefinition(id, actor, reason)`.
- `bindTask(input)`.
- `unbindTask(bindingId)`.
- `runPreview(definitionId, versionNo, sampleContext)`.
- `retryExecution(logId, actor)`.
- `manualResolveExecution(logId, actor, note)`.

Quy ước:

- Active version chỉ có một version active trên một definition.
- Khi active version mới, version cũ chuyển `ARCHIVED`.
- Mọi action quan trọng ghi `auditEntries`.
- Retry/manual resolve chỉ cập nhật mock log, không gọi network.

Sửa `webapp/src/main.tsx`:

- import `ServiceTaskProvider`.
- bọc provider bên trong `IntegrationMappingProvider` hoặc cùng tầng, để service task có thể đọc integration mapping sau này.

**Verify**: build xanh, không đổi behavior các màn hiện có.

---

## Đợt 3 - Màn danh sách & form cấu hình

**Mục tiêu**: Admin tạo/sửa/xem service task config ở trạng thái draft/active.

### Slice A - Route/menu

Sửa `webapp/src/App.tsx`:

- lazy import `ServiceTaskConfig`.
- `ROUTE_BY_KEY["servicetask"] = "/cau-hinh-service-task"`.
- `selectedKey` nhận route mới.
- thêm menu item trong `Quản trị quy trình`:
  - key `servicetask`
  - label `Tác vụ hệ thống`
  - icon ưu tiên `ThunderboltOutlined` hoặc `ApiOutlined`.
- route guard bằng `canManageSystem`.

### Slice B - Page shell

Tạo `ServiceTaskConfig.tsx` với `PageHeader`:

- title: `Cấu hình Service Task`.
- breadcrumb: `Hệ thống QTKHCN / Quản trị quy trình / Cấu hình Service Task`.
- KPI:
  - tổng cấu hình,
  - active,
  - thiếu binding,
  - incident mở.

Tabs:

- `Tổng quan`
- `Cấu hình`
- `Đối soát BPMN`
- `Kiểm thử`
- `Log thực thi`
- `Phiên bản & audit`

### Slice C - Danh sách cấu hình

Bảng cột:

- mã,
- tên,
- loại,
- trạng thái,
- active version,
- số binding,
- success rate 24h/7 ngày,
- incident mở,
- cập nhật gần nhất,
- thao tác.

Filter:

- loại,
- trạng thái,
- quy trình,
- connector/hệ ngoài,
- có incident.

### Slice D - Drawer form

Tạo `ServiceTaskFormDrawer.tsx`:

- Tab `Tổng quan`: code, name, description, type, ownerModule, tags.
- Tab `Cấu hình thực thi`: field động theo type.
- Tab `Input mapping`: dùng `ServiceTaskMappingEditor`.
- Tab `Output mapping`: dùng `ServiceTaskMappingEditor`.
- Tab `Chính sách lỗi`: timeout, maxRetry, retryDelay, backoff, onFailure, notifyRoles.

Không đặt script editor. Với expression chỉ cho text dạng `${variables.xxx}`, `${dossier.xxx}`, `${initiator.xxx}` và validate format.

**Verify**: Tạo/sửa/duplicate definition chạy trong memory, reload mất data là chấp nhận ở MVP mock.

---

## Đợt 4 - BPMN reconcile/binding

**Mục tiêu**: Đối soát service task trong quy trình với cấu hình đã gắn.

### Slice A - Metadata service task cho process

Ưu tiên ít xâm lấn:

- Tạo trong `serviceTasks.ts` hoặc `serviceTaskReconcile.ts` một seed `PROCESS_SERVICE_TASKS`.
- Key theo `processCode`, `processVersion`, `taskDefinitionKey`.
- Có field:
  - `bpmnProcessId`
  - `taskDefinitionKey`
  - `taskName`
  - `jobType`
  - `implementationHint`
  - `critical`

Phase sau mới parse BPMN XML thật từ modeler.

### Slice B - Reconcile engine

Tạo `serviceTaskReconcile.ts`:

- `reconcilableServiceTaskProcesses()`.
- `reconcileServiceTasks(process, bindings, definitions, versions)`.
- `summarizeServiceTaskReconcileHealth(...)`.
- `scaffoldServiceTaskBinding(...)` nếu cần tạo binding nháp.

Status:

- `ok`: có binding active + definition active + config version active.
- `missing`: BPMN có service task nhưng chưa có binding.
- `unfilled`: có binding nhưng config draft/error/chưa active.
- `generic`: binding quá rộng hoặc không ghim đủ version/task key.
- `orphan`: binding trỏ task không còn trong metadata.

### Slice C - UI binding

Tạo `ServiceTaskBindingTable.tsx`:

- chọn process,
- bảng service task BPMN,
- trạng thái reconcile,
- job type,
- definition đã gắn,
- action `Gắn cấu hình`, `Đổi cấu hình`, `Bỏ gắn`.

Khi gắn:

- chọn `ServiceTaskDefinition` active/ready,
- ghi `processCode + processVersion + taskDefinitionKey`,
- nếu definition chưa active thì cảnh báo.

**Verify**: Có thể tạo binding cho task SAP demo, đổi config, thấy trạng thái chuyển `missing -> ok/unfilled`.

---

## Đợt 5 - Test/Preview cấu hình

**Mục tiêu**: Admin nhìn được input sau mapping, payload gửi đi, response giả lập và output mapping preview.

Tạo `ServiceTaskTestPanel.tsx`.

Input:

- definition,
- config version,
- process sample,
- dossier sample,
- variables JSON sample,
- user/org context sample.

Output hiển thị theo tabs nhỏ:

- `Input sau mapping`
- `Payload`
- `Response giả lập`
- `Output mapping`
- `Validation`

Mock executor:

- `SEND_NOTIFICATION`: trả `{ delivered: true, channel, recipientCount }`.
- `CALL_API`: đọc connector/mapping từ integration mock, trả `{ externalId, status, message }`.
- `UPDATE_DOSSIER`: trả preview field sẽ cập nhật, không sửa dossier thật.
- `GENERATE_DOCUMENT`: trả `{ documentId, templateCode, fileName }`.
- `EVALUATE_DECISION`: có thể gọi helper DMN hiện có nếu phù hợp, hoặc mock `{ decision, reason }`.

Không gọi API thật. Nếu connector đang `down` trong `seedIntegrations`, preview hiển thị lỗi validation.

**Verify**: Test một config active và một config lỗi; UI hiển thị rõ valid/error, payload đã mask secret.

---

## Đợt 6 - Execution log, incident, audit

**Mục tiêu**: Người vận hành drill-down được service task đã chạy, lỗi attempt nào, có retry/manual resolve không.

### Slice A - Log tab

Trong `ServiceTaskConfig.tsx`, tab `Log thực thi`:

- filter theo process, definition, status, incident.
- bảng:
  - instance key,
  - process,
  - task key,
  - definition,
  - version,
  - status,
  - attempt,
  - duration,
  - error,
  - incident id.

### Slice B - Drawer chi tiết

Tạo `ServiceTaskExecutionDrawer.tsx`:

- request summary masked,
- response summary masked,
- error code/message,
- error policy áp dụng,
- timeline attempt,
- link mock tới incident/process/job run nếu có.

Action:

- `Retry` nếu status failed và còn quyền mock.
- `Manual resolve` với note.

### Slice C - Audit tab

Tab `Phiên bản & audit`:

- danh sách version theo definition,
- active/deprecate history,
- audit entries cho create/update/activate/bind/test/retry/manual resolve.

**Verify**: Retry một log failed -> status chuyển `RETRYING` hoặc `SUCCESS` theo mock, audit có dòng tương ứng.

---

## Đợt 7 - Tích hợp với màn hiện có

**Mục tiêu**: Các màn vận hành/tích hợp có đường dẫn ngữ cảnh sang service task config.

Các nâng cấp nhỏ:

- `IntegrationStatus.tsx`: trong drawer hệ tích hợp, thêm danh sách service task definition/binding đang dùng hệ đó.
- `ProcessMonitor.tsx`: nếu instance có incident service task, có nút mở log service task tương ứng.
- `ProcessEventLog.tsx`: event `service-task` có tag definition/config version nếu có.
- `ProcessDetail.tsx`: tab/section quy trình hiển thị số service task thiếu config theo health summary.

Làm sau khi màn chính ổn để tránh lan rộng blast radius.

**Verify**: Không làm hỏng các màn hiện có; các link nếu chưa deep-link đầy đủ thì vẫn mở được module service task.

---

## Thứ tự triển khai khuyến nghị

```text
Đợt 1 Domain model
  -> Đợt 2 Context
  -> Đợt 3 List/Form
  -> Đợt 4 BPMN reconcile/binding
  -> Đợt 5 Test/Preview
  -> Đợt 6 Log/Incident/Audit
  -> Đợt 7 Cross-link màn hiện có
```

Nếu cần demo sớm, dừng sau Đợt 4 đã có giá trị lớn: admin thấy được cấu hình, version, và task BPMN nào còn thiếu binding.

---

## Acceptance criteria cho frontend MVP

- Admin vào được `/cau-hinh-service-task`.
- Admin thấy danh sách service task config, filter theo type/status/process.
- Admin tạo/sửa/duplicate được config draft.
- Admin cấu hình input/output mapping và error policy bằng form kiểm soát.
- Hệ thống validate được config trước khi active.
- Admin active được một config version hợp lệ.
- Admin đối soát được service task từ process metadata.
- Admin gắn được config vào `processCode + processVersion + taskDefinitionKey`.
- Admin chạy test/preview với dữ liệu mẫu.
- Người vận hành xem được execution log, incident summary, retry/manual resolve mock.
- Mọi action quan trọng ghi audit in-memory.
- `npm run build` xanh.

---

## Risk & giảm thiểu

| Risk | Mức độ | Giảm thiểu |
| --- | --- | --- |
| Module phình thành backend runtime giả quá lớn | Trung bình | Giữ runtime ở mức preview/log mock, không gọi API thật. |
| Trùng khái niệm với Integration Mapping | Trung bình | `ServiceTaskConfig` chỉ tham chiếu connector/mapping; không sở hữu endpoint/secret. |
| Reconcile cần parse BPMN thật nhưng repo đang dùng metadata mock | Trung bình | Đợt 4 dùng `PROCESS_SERVICE_TASKS`; phase sau thay nguồn bằng parser BPMN. |
| Mapping expression dễ thành script tự do | Cao | Chỉ cho expression placeholder dạng `${scope.path}` và whitelist output target. |
| UI quá dài như form kỹ thuật | Trung bình | Chia tab + drawer, list/binding/test/log tách rõ. |
| Thêm provider/route gây regress menu auth | Thấp | Guard route bằng `canManageSystem`, verify các route cũ. |

---

## Không làm trong kế hoạch coding này

- Backend API thật.
- Worker Zeebe/Camunda thật.
- Secret store thật.
- Script/expression engine tùy ý.
- Marketplace executor/plugin.
- Approval flow khi active config nhạy cảm.
- Parse BPMN XML đầy đủ trong lần đầu; chỉ đặt interface để thay nguồn dữ liệu sau.

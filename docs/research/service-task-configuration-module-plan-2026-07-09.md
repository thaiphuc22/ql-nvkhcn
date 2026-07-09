# Kế hoạch triển khai module Cấu hình Service Task

Ngày ghi nhận: 2026-07-09

## Bối cảnh

Hệ thống hiện đã có các năng lực cấu hình chính cho quy trình:

- Workflow Designer/BPMN: mô tả trình tự xử lý.
- Business Rule/DMN: quyết định nghiệp vụ.
- Approval Matrix: xác định người/nhóm xử lý user task.
- Action Studio: xác định hành động người dùng được phép thực hiện tại từng bước.
- Integration Configuration: quản trị kết nối, endpoint, authentication, retry, mapping.
- Workflow Runtime Administration: theo dõi instance, incident, retry failed job.

Phần còn thiếu là một lớp cấu hình dành riêng cho **service task**, tức các tác vụ hệ thống tự động chạy trong quy trình. Nếu không có lớp này, logic service task dễ bị hard-code trong worker/backend, khiến mỗi thay đổi nhỏ về thông báo, API, mapping hoặc retry đều phải sửa code.

## Kết luận đề xuất

Nên bổ sung module **Cấu hình Service Task / Tác vụ hệ thống** trong nhóm cấu hình workflow platform.

Module này không thay thế Integration Configuration, Notification Management hay Business Rule Management. Nó đóng vai trò là lớp **gắn service task trong BPMN với một cấu hình thực thi cụ thể**:

```text
BPMN serviceTask
  -> Service Task Configuration
  -> Connector/Notification/Document/Data Update/Decision/API Worker
  -> Execution Log + Incident + Audit
```

Nguyên tắc quan trọng: người dùng/admin **không tự viết code hoặc script tùy ý** trong MVP. Admin chỉ chọn loại tác vụ đã được hệ thống hỗ trợ, cấu hình tham số, mapping input/output, chính sách lỗi và kiểm thử trước khi active.

## Mục tiêu

Module cần trả lời 5 câu hỏi:

1. Service task này sẽ làm gì?
2. Lấy dữ liệu đầu vào từ đâu?
3. Gọi hệ thống/tác vụ nào để thực thi?
4. Kết quả trả về được ghi vào biến quy trình hoặc hồ sơ như thế nào?
5. Nếu lỗi thì retry, bỏ qua, dừng quy trình hay tạo incident?

## Phạm vi MVP

### Nên làm trong MVP

- Danh mục loại service task được hệ thống hỗ trợ.
- Tạo/sửa/xem cấu hình service task.
- Gắn cấu hình service task vào `processCode + processVersion + taskDefinitionKey`.
- Mapping input từ process variables, dossier data, user/org context.
- Mapping output về process variables hoặc trường nghiệp vụ cho phép.
- Cấu hình timeout, retry, failure policy.
- Kiểm thử cấu hình với dữ liệu mẫu.
- Validate cấu hình trước khi publish/active.
- Lịch sử phiên bản cấu hình.
- Log thực thi service task theo từng process instance.
- Incident khi service task lỗi.
- Audit thay đổi cấu hình.

### Chưa nên làm trong MVP

- Cho admin nhập script tùy ý.
- Cho phép gọi API bất kỳ không qua whitelist/connector.
- Cho phép cập nhật mọi bảng/trường dữ liệu tùy ý.
- Marketplace plugin service task tự do.
- Thiết kế worker động hoàn toàn không cần backend registry.

Các phần này có thể xem xét sau khi đã có mô hình vận hành, phân quyền và audit đủ chắc.

## Phân ranh với các module hiện có

### So với Action Studio

Action Studio dành cho **user task**:

```text
Người dùng này, tại bước này, được phép bấm nút gì?
```

Service Task Configuration dành cho **service task**:

```text
Hệ thống phải tự động chạy tác vụ gì, với input/output và chính sách lỗi nào?
```

Hai module không nên gộp, vì một bên là tương tác người dùng, một bên là thực thi tự động.

### So với Business Rule/DMN

DMN trả lời câu hỏi quyết định:

```text
Điều kiện này cho ra kết quả gì?
```

Service task thực hiện tác vụ:

```text
Gửi thông báo, gọi API, cập nhật trạng thái, tạo tài liệu, đồng bộ dữ liệu.
```

Service task có thể gọi DMN nếu cần, nhưng không nên nhét rule phức tạp vào service task config.

### So với Integration Configuration

Integration Configuration quản lý kết nối và mapping cấp hệ thống:

- Connector.
- Endpoint.
- Authentication.
- Secret.
- Retry mặc định.
- Field/value mapping.
- Test connection.

Service Task Configuration chỉ tham chiếu lại integration config:

- Dùng connector nào?
- Dùng endpoint/action nào?
- Payload lấy từ đâu?
- Output ghi về biến nào?
- Service task cụ thể trong BPMN nào đang sử dụng cấu hình này?

### So với Notification Management

Notification Management quản lý template, kênh gửi, policy thông báo.

Service Task Configuration tham chiếu template/kênh đó để chạy ở đúng bước quy trình.

## Loại service task đề xuất

### Phase 1

| Loại | Mục đích | Ví dụ |
|---|---|---|
| `SEND_NOTIFICATION` | Gửi email/in-app/SMS/Zalo theo template | Báo hồ sơ đã được phê duyệt |
| `CALL_API` | Gọi API qua connector đã cấu hình | Đồng bộ trạng thái sang SAP/QLNS/PLM |
| `UPDATE_DOSSIER` | Cập nhật trường/trạng thái hồ sơ trong whitelist | Chuyển trạng thái hồ sơ sang `approved` |
| `GENERATE_DOCUMENT` | Sinh tài liệu từ template | Tạo quyết định, tờ trình, phiếu thẩm định |
| `EVALUATE_DECISION` | Gọi DMN/rule và lưu kết quả | Xác định có cần hội đồng hay không |

### Phase 2

| Loại | Mục đích |
|---|---|
| `SYNC_MASTER_DATA` | Đồng bộ danh mục/nhân sự/tài sản |
| `CREATE_RELATED_RECORD` | Tạo bản ghi ở phân hệ khác |
| `DIGITAL_SIGNING` | Gửi tài liệu sang hệ thống ký số |
| `FILE_STORAGE` | Lưu/chuyển file sang DMS/Object Storage |
| `EVENT_PUBLISH` | Phát event ra event bus |

## Mô hình dữ liệu đề xuất

### `ServiceTaskType`

Danh mục loại tác vụ do hệ thống định nghĩa.

Trường chính:

- `code`
- `name`
- `description`
- `category`
- `inputSchema`
- `outputSchema`
- `capabilities`
- `enabled`

Ví dụ `capabilities`:

```json
{
  "supportsRetry": true,
  "supportsPreview": true,
  "requiresConnector": true,
  "allowsOutputMapping": true
}
```

### `ServiceTaskDefinition`

Cấu hình nghiệp vụ mà admin tạo.

Trường chính:

- `id`
- `code`
- `name`
- `description`
- `typeCode`
- `status`: `DRAFT`, `READY`, `ACTIVE`, `DEPRECATED`, `ERROR`
- `ownerModule`
- `tags`
- `createdBy`
- `updatedBy`
- `createdAt`
- `updatedAt`

### `ServiceTaskBinding`

Gắn một cấu hình service task vào BPMN.

Trường chính:

- `id`
- `processCode`
- `processVersion`
- `bpmnProcessId`
- `taskDefinitionKey`
- `taskName`
- `serviceTaskDefinitionId`
- `bindingStatus`
- `effectiveFrom`
- `effectiveTo`

Nguyên tắc: binding nên ghim theo `processCode + processVersion + taskDefinitionKey`, tránh cấu hình wildcard quá rộng trong vận hành thật.

### `ServiceTaskConfigVersion`

Lưu phiên bản cấu hình để rollback/audit.

Trường chính:

- `id`
- `serviceTaskDefinitionId`
- `versionNo`
- `configJson`
- `inputMapping`
- `outputMapping`
- `errorPolicy`
- `status`
- `changeNote`
- `createdBy`
- `createdAt`

### `ServiceTaskExecutionLog`

Log chạy thật theo process instance.

Trường chính:

- `id`
- `processInstanceKey`
- `processCode`
- `processVersion`
- `taskDefinitionKey`
- `serviceTaskDefinitionId`
- `configVersionNo`
- `status`: `RUNNING`, `SUCCESS`, `FAILED`, `RETRYING`, `SKIPPED`, `MANUAL_RESOLVED`
- `startedAt`
- `finishedAt`
- `durationMs`
- `attemptNo`
- `requestSummary`
- `responseSummary`
- `errorCode`
- `errorMessage`
- `incidentId`

Payload nhạy cảm cần mask theo chính sách bảo mật, không lưu toàn bộ secret/token.

## Cấu hình chi tiết

### Input mapping

Nguồn input nên hỗ trợ:

- Process variables.
- Dossier data.
- Form data.
- Current task context.
- Initiator/assignee/org context.
- System constants.
- Output của service task trước đó.

Ví dụ:

```json
{
  "maHoSo": "${dossier.code}",
  "tongDuToan": "${variables.totalBudget}",
  "donVi": "${initiator.orgCode}",
  "nguoiNhan": "${variables.nextApproverEmail}"
}
```

### Output mapping

Đích output nên giới hạn:

- Process variables.
- Một số trường hồ sơ whitelist.
- Integration reference id.
- Execution metadata.

Ví dụ:

```json
{
  "$.externalId": "variables.sapBudgetRequestId",
  "$.status": "variables.sapSyncStatus",
  "$.message": "variables.sapSyncMessage"
}
```

### Error policy

Mỗi cấu hình service task cần có chính sách lỗi:

- `timeoutMs`
- `maxRetry`
- `retryDelay`
- `retryBackoff`: fixed/exponential.
- `retryableErrorCodes`
- `onFailure`: `CREATE_INCIDENT`, `FAIL_PROCESS`, `CONTINUE`, `COMPENSATE`, `MANUAL_TASK`
- `notifyRoles`

Khuyến nghị mặc định: fail-closed với các tác vụ cập nhật dữ liệu quan trọng. Không nên tự động bỏ qua lỗi nếu service task ảnh hưởng trạng thái hồ sơ, tài chính, tài sản hoặc dữ liệu liên hệ hệ thống ngoài.

## Thiết kế UI đề xuất

### 1. Danh sách Service Task

Mục tiêu: quản trị viên thấy được tác vụ nào đang có, trạng thái ra sao, đang được dùng ở quy trình nào.

Cột đề xuất:

- Mã tác vụ.
- Tên tác vụ.
- Loại.
- Trạng thái.
- Phiên bản active.
- Số binding BPMN.
- Tỷ lệ thành công 24h/7 ngày.
- Incident đang mở.
- Người cập nhật gần nhất.
- Thao tác: xem, sửa, nhân bản, kiểm thử, lịch sử, deprecate.

Bộ lọc:

- Loại service task.
- Trạng thái.
- Quy trình.
- Connector/hệ thống ngoài.
- Có incident hay không.

### 2. Form cấu hình Service Task

Nên chia theo tab:

- Tổng quan.
- Cấu hình thực thi.
- Input mapping.
- Output mapping.
- Chính sách lỗi.
- Kiểm thử.
- Phiên bản & audit.

Không nên dồn tất cả vào một form dài.

### 3. Binding BPMN

Màn này dùng để đối soát service task trong BPMN với cấu hình hiện có.

Hiển thị:

- Danh sách service task đọc từ BPMN.
- Task key.
- Task name.
- Job type/implementation hint nếu có.
- Cấu hình đã gắn.
- Trạng thái: `missing`, `generic`, `unfilled`, `ok`, `orphan`.

Tương tự Action Studio có đối soát user task, module này cần đối soát service task để tránh quy trình deploy xong nhưng worker không biết chạy gì.

### 4. Test/Preview

Admin chọn:

- Process mẫu.
- Hồ sơ mẫu.
- Process variables mẫu.
- Config version cần test.

Hệ thống hiển thị:

- Input sau mapping.
- Payload gửi đi.
- Output giả lập hoặc response thật ở chế độ test.
- Output mapping preview.
- Validation error nếu có.

### 5. Execution Log & Incident

Cho phép drill-down từ:

- Quy trình.
- Hồ sơ.
- Service task definition.
- Integration connector.
- Incident.

Thông tin cần thấy:

- Service task nào lỗi.
- Lỗi ở attempt thứ mấy.
- Payload summary.
- Response/error summary.
- Có retry được không.
- Ai đã retry/manual resolve.

## Luồng vận hành

### Luồng cấu hình

```text
Admin tạo ServiceTaskDefinition
  -> Chọn ServiceTaskType
  -> Cấu hình tham số
  -> Mapping input/output
  -> Cấu hình error policy
  -> Test bằng dữ liệu mẫu
  -> Validate
  -> Submit/Approve nếu cần
  -> Active version
  -> Gắn vào BPMN service task
```

### Luồng chạy runtime

```text
Camunda/Zeebe đến service task
  -> Worker nhận job theo job type
  -> Worker tra ServiceTaskBinding bằng process + version + taskDefinitionKey
  -> Load active ServiceTaskConfigVersion
  -> Resolve input mapping
  -> Execute theo type
  -> Apply output mapping
  -> Complete job nếu thành công
  -> Retry hoặc tạo incident nếu lỗi
  -> Ghi ExecutionLog + Audit
```

## Kiến trúc backend đề xuất

### Service Task Registry

Backend cần có registry cho các loại tác vụ được phép chạy:

```text
typeCode -> executor
```

Ví dụ:

- `SEND_NOTIFICATION` -> Notification executor.
- `CALL_API` -> Integration connector executor.
- `UPDATE_DOSSIER` -> Dossier update executor.
- `GENERATE_DOCUMENT` -> Document template executor.
- `EVALUATE_DECISION` -> DMN executor.

Registry này do dev kiểm soát. Admin chỉ cấu hình tham số, không tạo executor mới trong MVP.

### Worker runtime

Có hai hướng:

1. Một generic worker nhận nhiều job type và tra config theo binding.
2. Nhiều worker chuyên biệt theo nhóm tác vụ.

Khuyến nghị MVP: dùng generic orchestration worker nhưng executor bên trong vẫn được typed rõ ràng. Cách này giảm số worker cần vận hành, nhưng vẫn giữ kiểm soát logic thực thi.

### Validate trước khi active

Không cho active nếu:

- Thiếu binding đến connector/template/DMN/document template cần thiết.
- Input mapping tham chiếu biến không hợp lệ.
- Output mapping ghi vào trường không thuộc whitelist.
- Error policy thiếu timeout/retry hợp lệ.
- Service task trong BPMN chưa có cấu hình.
- Cấu hình gọi API nhưng connector đang inactive/error.

## Phân quyền

Nên tách quyền:

- Xem danh sách service task.
- Tạo/sửa cấu hình.
- Active/deprecate version.
- Gắn cấu hình vào BPMN.
- Chạy test.
- Xem log.
- Xem payload nhạy cảm.
- Retry job lỗi.
- Manual resolve incident.

Quyền xem payload nhạy cảm nên tách riêng, vì request/response có thể chứa thông tin cá nhân, tài chính hoặc secret đã mask.

## Audit

Cần audit các sự kiện:

- Tạo/sửa/xóa/deprecate cấu hình.
- Active version.
- Rollback version.
- Gắn/bỏ gắn BPMN service task.
- Test config.
- Retry execution.
- Manual resolve incident.
- Thay đổi secret/connector tham chiếu.

Audit nên ghi rõ:

- Người thực hiện.
- Thời điểm.
- Trước/sau thay đổi.
- Lý do thay đổi nếu active/rollback.
- Phiên bản cấu hình liên quan.

## Lộ trình triển khai

### Phase 0 - Chốt thiết kế

Mục tiêu:

- Chốt tên module: `Cấu hình Service Task` hoặc `Tác vụ hệ thống`.
- Chốt danh sách loại tác vụ Phase 1.
- Chốt ranh giới với Integration, Notification, DMN, Document Template.
- Chốt cách BPMN biểu diễn `taskDefinitionKey`, `jobType`, `processVersion`.

Deliverable:

- Tài liệu BA/SA.
- Data model sơ bộ.
- Wireframe danh sách, form, binding, log.

### Phase 1 - Nền tảng cấu hình

Mục tiêu:

- Tạo danh mục `ServiceTaskType`.
- CRUD `ServiceTaskDefinition`.
- Versioning config.
- Input/output mapping cơ bản.
- Error policy cơ bản.
- Validate trước khi active.

Deliverable:

- API cấu hình.
- UI danh sách và form cấu hình.
- Seed các type: notification, API, dossier update, document generation, decision evaluation.

### Phase 2 - BPMN reconcile/binding

Mục tiêu:

- Đọc danh sách service task từ BPMN/process metadata.
- Đối soát task chưa có cấu hình, cấu hình orphan, cấu hình generic.
- Gắn cấu hình vào `processCode + processVersion + taskDefinitionKey`.

Deliverable:

- Tab/màn `Đối soát Service Task`.
- Health summary cho từng quy trình.
- Cảnh báo trước khi publish/deploy quy trình nếu thiếu cấu hình.

### Phase 3 - Runtime execution

Mục tiêu:

- Worker tra binding/config và thực thi theo executor registry.
- Ghi execution log.
- Áp dụng retry/timeout/failure policy.
- Tạo incident khi lỗi.

Deliverable:

- Generic service task worker.
- Executor Phase 1.
- Execution log API.
- Incident linkage.

### Phase 4 - Test/Preview & vận hành

Mục tiêu:

- Test cấu hình với hồ sơ/process variables mẫu.
- Preview payload và output mapping.
- Cho phép retry/manual resolve theo phân quyền.
- Liên kết log từ hồ sơ, process instance, connector.

Deliverable:

- Màn test config.
- Màn execution log.
- Retry/manual resolve.
- Dashboard lỗi service task.

### Phase 5 - Mở rộng

Mục tiêu:

- Thêm digital signing, event publish, sync master data.
- Hỗ trợ rollback version.
- Hỗ trợ approval flow khi active config nhạy cảm.
- Tối ưu monitoring/SLA service task.

Deliverable:

- Executor mở rộng.
- Version rollback.
- Approval workflow cho cấu hình rủi ro cao.
- Báo cáo độ ổn định service task.

## Acceptance criteria MVP

MVP được xem là đạt khi:

- Admin tạo được service task config ở trạng thái draft.
- Admin test được config bằng dữ liệu mẫu.
- Hệ thống validate được config trước khi active.
- Admin gắn được config vào service task cụ thể trong BPMN.
- Quy trình chạy đến service task thì worker thực thi đúng config active.
- Kết quả service task được map về process variables hoặc trường whitelist.
- Khi lỗi, hệ thống retry/tạo incident theo error policy.
- Người vận hành xem được execution log và retry thủ công nếu có quyền.
- Mọi thay đổi cấu hình quan trọng đều có audit log.

## Rủi ro và kiểm soát

| Rủi ro | Kiểm soát |
|---|---|
| Admin cấu hình API sai gây lỗi hàng loạt | Test/preview, validate, version, rollback |
| Lộ secret/token trong log | Mask payload, tách quyền xem dữ liệu nhạy cảm |
| Service task cập nhật sai dữ liệu | Whitelist field, fail-closed, audit |
| BPMN có service task nhưng chưa có config | BPMN reconcile, chặn publish/deploy nếu critical |
| Retry gây gọi API lặp và tạo dữ liệu trùng | Idempotency key, external reference, retry policy |
| Config thay đổi ảnh hưởng instance đang chạy | Version pinning theo process version/config version |
| Logic nghiệp vụ bị nhét vào service task | Tách DMN/Business Rule, chỉ dùng service task để thực thi |

## Khuyến nghị ưu tiên

Nên triển khai theo thứ tự:

1. Thiết kế data model và registry type trước.
2. Làm UI CRUD + version + validate.
3. Làm BPMN reconcile/binding.
4. Làm runtime worker và execution log.
5. Làm test/preview và incident/retry.

Không nên bắt đầu bằng worker runtime ngay, vì nếu chưa có mô hình cấu hình, binding, version và validate rõ ràng thì service task sẽ nhanh chóng trở thành một lớp hard-code mới trong backend.


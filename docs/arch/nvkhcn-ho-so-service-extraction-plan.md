# Kế hoạch tách Service Quản lý NV KHCN & Hồ sơ

> **HOÀN TẤT 2026-07-20.** Final boundary và guardrail hiện hành nằm tại
> `docs/arch/nvkhcn-workflow-final-service-boundary.md`. Các lát/canary/rollback bên dưới là lịch sử triển
> khai, không phải hướng dẫn vận hành hiện tại.

> Trạng thái: Đã thống nhất hướng kiến trúc, sẵn sàng triển khai theo lát  
> Ngày: 2026-07-16  
> Phạm vi: Tách dữ liệu và nghiệp vụ `NhiemVu`/`HoSo` khỏi service Quản trị quy trình; tích hợp khởi tạo và theo dõi quy trình qua contract ổn định.

## 1. Mục tiêu

Tách backend hiện tại thành hai bounded context có quyền sở hữu dữ liệu rõ ràng:

1. **Service Quản lý NV KHCN & Hồ sơ** quản lý nhiệm vụ, hồ sơ, tài liệu, phiên bản và trạng thái nghiệp vụ.
2. **Service Quản trị quy trình** quản lý BPMN/DMN/eForm/cấu hình hành động, thực thi Camunda và trạng thái điều phối kỹ thuật.

Khi người dùng gửi một hồ sơ vào xử lý, service Hồ sơ gửi một lệnh khởi tạo quy trình chứa định danh và các biến điều khiển tối thiểu. Không sao chép toàn bộ hồ sơ sang service Quy trình hoặc Camunda.

## 2. Nguyên tắc kiến trúc

- `NhiemVu` và `HoSo` tiếp tục là hai entity riêng, quan hệ 1-N.
- Dữ liệu nghiệp vụ chỉ có một nguồn chuẩn: database của service Hồ sơ.
- Camunda chỉ giữ correlation/control variables; không giữ biểu mẫu, tài liệu hay bản sao hồ sơ.
- Hai service không truy cập trực tiếp database của nhau và không có foreign key xuyên database.
- Tạo hồ sơ nháp không khởi tạo Camunda. Chỉ hành động **Gửi hồ sơ/Khởi tạo quy trình** mới phát lệnh start.
- Giao tiếp ghi phải idempotent; timeout/retry không được tạo trùng process instance.
- Không dùng distributed transaction giữa PostgreSQL và Camunda. Dùng transactional outbox và inbox/idempotency.
- Frontend đi qua gateway/reverse proxy để không phụ thuộc địa chỉ vật lý của từng service.
- Tách dần theo strangler pattern; hệ thống phải chạy được sau mỗi lát.

## 3. Ranh giới trách nhiệm

| Năng lực | Service Hồ sơ | Service Quy trình |
|---|---|---|
| Nhiệm vụ KHCN | Chủ sở hữu | Chỉ giữ `nhiemVuId` nếu cần correlation |
| Hồ sơ, tài liệu, phiên bản | Chủ sở hữu | Chỉ giữ `hoSoId`/`businessKey` |
| Trạng thái nghiệp vụ | Chủ sở hữu | Phát sự kiện để service Hồ sơ cập nhật |
| BPMN, DMN, eForm, action policy | Không sở hữu | Chủ sở hữu |
| Deploy process definition | Không | Có |
| Process instance, active task, incident | Lưu projection/tham chiếu cần hiển thị | Chủ sở hữu |
| Candidate group và điều phối task | Cung cấp actor/business context | Thực thi và kiểm tra quyền tại boundary |
| Điều kiện dữ liệu hồ sơ | Cung cấp API/DTO chuyên biệt | Gọi khi worker cần kiểm tra |
| Audit nghiệp vụ | Chủ sở hữu | Phát audit kỹ thuật và correlation |

## 4. Luồng khởi tạo hồ sơ

### 4.1 Tạo nháp

1. Frontend gọi service Hồ sơ để tạo `HoSo` trạng thái `DRAFT`.
2. Người dùng cập nhật dữ liệu, tài liệu và phiên bản.
3. Chưa gọi service Quy trình và chưa tạo process instance.

### 4.2 Gửi hồ sơ vào quy trình

1. Service Hồ sơ kiểm tra điều kiện nghiệp vụ trước khi gửi.
2. Trong cùng transaction, cập nhật hồ sơ sang `START_PENDING` và ghi outbox event `START_WORKFLOW_REQUESTED`.
3. Outbox dispatcher gửi `StartProcessCommand` sang service Quy trình.
4. Service Quy trình kiểm tra idempotency bằng `requestId`, resolve process definition đang hiệu lực và start Camunda.
5. Service Quy trình lưu mapping process và phát `WORKFLOW_STARTED`.
6. Service Hồ sơ nhận sự kiện, lưu `processInstanceId` và chuyển hồ sơ sang `PROCESSING`.
7. Nếu thất bại tạm thời, dispatcher retry. Nếu lỗi không thể retry, hồ sơ chuyển `START_FAILED` và cho phép người có quyền thử lại.

```text
Frontend
   |
   v
Service NV KHCN & Hồ sơ -- outbox/StartProcessCommand --> Service Quản trị quy trình
   |                                                        |
   | PostgreSQL nghiệp vụ                                  | PostgreSQL điều phối
   |                                                        | Camunda
   ^                                                        |
   +-------------------- Workflow events -------------------+
```

## 5. Contract tích hợp phiên bản đầu

### 5.1 Start process

`POST /internal/v1/process-instances`

Header bắt buộc:

- `Idempotency-Key: <requestId>`
- Service authentication/authorization header theo cơ chế nội bộ được chọn.
- `traceparent` hoặc correlation header tương đương.

Request:

```json
{
  "requestId": "c89823fa-0000-4000-8000-000000000001",
  "businessKey": "HS-RD0202-2026-001",
  "processCode": "RD02.02",
  "hoSoId": "HS-001",
  "nhiemVuId": "NV-001",
  "initiatorUserId": "U-001",
  "initialVariables": {
    "maHoSo": "HS-RD0202-2026-001",
    "cap": "TD",
    "loaiNhiemVu": "DE_TAI"
  }
}
```

Response `201 Created` cho lần đầu hoặc `200 OK` cho request idempotent đã tồn tại:

```json
{
  "requestId": "c89823fa-0000-4000-8000-000000000001",
  "processInstanceId": "2251799813689001",
  "processDefinitionId": "Process_RD0202",
  "processVersion": 3,
  "status": "STARTED"
}
```

Quy tắc:

- Cùng `requestId` và cùng payload phải trả cùng kết quả.
- Cùng `requestId` nhưng payload khác phải trả `409 Conflict`.
- `processCode` không tồn tại/không active phải fail-closed.
- Không đưa tài liệu, biểu mẫu hoặc toàn bộ object hồ sơ vào `initialVariables`.

### 5.2 API đọc business context

Worker của service Quy trình chỉ gọi DTO đúng mục đích, ví dụ:

- `GET /internal/v1/ho-so/{hoSoId}/workflow-context`
- `GET /internal/v1/ho-so/{hoSoId}/validation-context?rule=RD0202_DRAFT1`
- `GET /internal/v1/ho-so/{hoSoId}/document-manifest?version={version}`

Các API này không trả JPA entity hoặc schema database nội bộ.

### 5.3 Workflow events

Envelope dùng chung:

```json
{
  "eventId": "uuid",
  "eventType": "WORKFLOW_STARTED",
  "occurredAt": "2026-07-16T10:00:00Z",
  "correlationId": "request-or-trace-id",
  "hoSoId": "HS-001",
  "processInstanceId": "2251799813689001",
  "payload": {}
}
```

Tối thiểu hỗ trợ:

- `WORKFLOW_STARTED`
- `TASK_ACTIVATED`
- `TASK_COMPLETED`
- `WORKFLOW_COMPLETED`
- `WORKFLOW_REJECTED`
- `WORKFLOW_CANCELLED`
- `WORKFLOW_INCIDENT_CREATED`

Consumer của service Hồ sơ có inbox/deduplication theo `eventId`.

## 6. Mô hình trạng thái

### 6.1 Service Hồ sơ

Trạng thái tối thiểu trong giai đoạn tách:

- `DRAFT`
- `START_PENDING`
- `START_FAILED`
- `PROCESSING`
- `APPROVED`
- `REJECTED`
- `CANCELLED`

### 6.2 Service Quy trình

- Trạng thái process instance, active element, task key, incident và deployment version thuộc service Quy trình.
- Service Hồ sơ chỉ lưu `processInstanceId` và projection đủ cho danh sách/chi tiết nghiệp vụ.
- Khi cần dữ liệu realtime sâu, frontend/BFF truy vấn service Quy trình bằng `processInstanceId`.

## 7. Dữ liệu và migration

- Tạo PostgreSQL/database/schema riêng cho service Hồ sơ.
- Chuyển quyền sở hữu các bảng `nhiem_vu`, `ho_so`, bước nghiệp vụ, tài liệu và phiên bản sang service mới.
- Các bảng process definition/draft, DMN, action policy, service-task configuration và process-instance mapping ở service Quy trình.
- Dùng migration versioned và script đối soát số lượng/checksum.
- Trong cutover, không cho hai service cùng ghi một bảng.
- Backfill `processInstanceId` cho hồ sơ đang chạy; hồ sơ chưa chạy giữ nguyên `DRAFT`.
- Chuẩn bị backup và rollback trước khi chuyển write ownership.

## 8. Gateway và frontend

Giữ URL logic ổn định:

- `/api/nhiem-vu/**` → service Hồ sơ.
- `/api/ho-so/**` → service Hồ sơ.
- `/api/process-definitions/**`, `/api/process-definition-drafts/**` → service Quy trình.
- `/api/dmn-rules/**`, `/api/action-studio/**`, `/api/service-tasks/**` → service Quy trình.
- `/api/workflow-instances/**`, `/api/tasks/**` → service Quy trình hoặc BFF nếu cần ghép business view.

Frontend không gọi endpoint `/internal/**` và không biết host nội bộ của service.

## 9. Bảo mật và quan sát hệ thống

- Xác thực service-to-service độc lập với Basic Auth demo; không truyền credential người dùng giữa service dưới dạng header tin cậy không ký.
- Propagate actor ID, role codes và correlation ID; mỗi service tự kiểm tra quyền thuộc phạm vi của mình.
- Log có `requestId`, `hoSoId`, `processInstanceId`, không log nội dung tài liệu hoặc secret.
- Metrics tối thiểu: outbox pending/failed, start latency, duplicate request, callback lag, incident count.
- Có dead-letter/retry dashboard hoặc endpoint quản trị cho message thất bại.

## 10. Các lát triển khai

### Lát 0 — Baseline và khóa contract

- Inventory bảng, API và dependency hiện tại của `NhiemVu`/`HoSo`.
- Chốt tên service, database, port dev và cơ chế service authentication.
- Chốt HTTP + outbox dispatcher cho giai đoạn đầu; broker là nâng cấp sau nếu chưa có hạ tầng.
- Thêm contract test cho API hiện tại để bảo vệ hành vi trước khi tách.
- Chụp baseline test/build và backup dữ liệu demo.

**Done when:** có dependency map, contract v1 được duyệt, baseline xanh và rollback point.

### Lát 1 — Tạo seam trong monolith

- Tạo `WorkflowClient`/port ở phía nghiệp vụ hồ sơ.
- Bọc lời gọi trực tiếp từ `HoSoService` tới xử lý Camunda/RD01.01 sau port này.
- Tách DTO nghiệp vụ khỏi Camunda DTO.
- Dùng implementation in-process để chưa thay đổi topology runtime.

**Done when:** không còn dependency trực tiếp từ domain hồ sơ tới lớp Camunda cụ thể; hành vi cũ không đổi.

### Lát 2 — Scaffold service Hồ sơ

- Tạo Spring Boot service mới theo D14, PostgreSQL/Flyway theo D15.
- Di chuyển model/repository/service/API đọc `NhiemVu` và `HoSo`.
- Tạo health/readiness, error envelope, audit và test nền.
- Gateway route API đọc sang service mới.

**Done when:** frontend đọc danh sách/chi tiết từ service mới; backend quy trình không đọc database hồ sơ trực tiếp.

### Lát 3 — Chuyển write ownership

- Di chuyển create/update/version/document APIs.
- Migrate dữ liệu và đối soát.
- Chặn write vào bảng cũ.
- Thêm optimistic locking và audit.

**Done when:** mọi mutation nhiệm vụ/hồ sơ đi qua service mới; không dual-write.

### Lát 4 — Start process tin cậy

- Thêm outbox ở service Hồ sơ.
- Thêm endpoint idempotent/inbox ở service Quy trình.
- Start Camunda và lưu process-instance mapping.
- Xử lý retry, conflict, timeout và `START_FAILED`.

**Done when:** tạo/gửi hồ sơ thành công; thử timeout và retry không tạo trùng process instance.

### Lát 5 — Đồng bộ workflow event

- Phát/nhận các event v1.
- Cập nhật projection trạng thái hồ sơ.
- Thêm reconciliation job đối chiếu hồ sơ đang xử lý với Camunda.
- Hoàn thiện audit/correlation.

**Done when:** completed/rejected/cancelled/incident phản ánh đúng ở service Hồ sơ và có thể tự hòa giải drift.

### Lát 6 — Cutover frontend và vận hành

- Hoàn thiện gateway routing và CORS/internal auth.
- Chạy E2E tạo nháp → gửi → task → hoàn tất.
- Smoke RD01.01 trước, sau đó RD02.02.
- Cutover theo release workflow hiện hành, giữ release cũ để rollback.

**Done when:** frontend không phụ thuộc topology; demo xuyên service chạy ổn định và rollback được.

### Lát 7 — Dọn monolith

- Xóa entity/repository/API hồ sơ còn lại khỏi service Quy trình.
- Xóa compatibility adapter sau thời gian ổn định.
- Cập nhật tài liệu, dashboard và runbook.

**Done when:** service Quy trình không còn sở hữu hoặc ghi dữ liệu nghiệp vụ hồ sơ.

## 11. Kiểm thử bắt buộc

- Contract test giữa hai service.
- Idempotency: gửi cùng request nhiều lần chỉ có một process instance.
- Timeout sau khi Camunda đã start rồi retry.
- Service Quy trình unavailable: hồ sơ ở `START_PENDING/START_FAILED`, dữ liệu không mất.
- Service Hồ sơ unavailable khi worker cần context: job retry/incident đúng, không đoán dữ liệu.
- Event duplicate/out-of-order không làm lùi trạng thái nghiệp vụ.
- Parallel submit không tạo hai workflow cho cùng hồ sơ.
- Migration checksum/count và rollback restore.
- Authorization fail-closed ở cả public API và internal API.
- E2E RD01.01 để chống regression và RD02.02 cho luồng mục tiêu.

## 12. Rollback

- Mỗi lát có feature flag hoặc route switch để quay về adapter cũ trước khi xóa code.
- Giữ database cũ read-only trong cửa sổ đối soát sau cutover.
- Không rollback bằng dual-write ngược; restore backup hoặc chuyển gateway về release trước.
- Nếu start integration lỗi, dừng dispatcher, giữ outbox để phát lại sau khi khắc phục.
- Chỉ thực hiện Lát 7 sau khi đã qua cửa sổ ổn định và rollback drill.

## 13. Các quyết định cần chốt ở Lát 0

1. Tên chính thức và vị trí source của service mới.
2. Tách database vật lý hay schema riêng trong cùng PostgreSQL ở giai đoạn đầu. Khuyến nghị database riêng; có thể dùng cùng PostgreSQL instance cho dev/demo.
3. HTTP + outbox dispatcher hay message broker ngay từ đầu. Khuyến nghị HTTP idempotent + outbox trước để giảm hạ tầng, giữ event envelope để chuyển broker sau.
4. Cơ chế service authentication cho dev/demo và production.
5. API gateway/BFF nào chịu trách nhiệm ghép business data với task runtime.

## 14. Việc bắt đầu tiếp theo

Thực hiện **Lát 0** trước: inventory dependency và database, đề xuất contract code-level, thêm characterization tests, rồi trình duyệt kết quả trước khi tạo service hoặc migration dữ liệu.

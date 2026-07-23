# qtkhcn-ho-so-service

Service độc lập sở hữu toàn bộ **NV KHCN & Hồ sơ**. Mọi read/write Hồ sơ, Nhiệm vụ, tài liệu và projection
đều vào service này; không còn route fallback về backend Quy trình. Service gửi lệnh start-process bằng
transactional outbox và nhận workflow event bằng inbox/idempotency. Backend Quy trình không truy cập DB
`qtkhcn_ho_so` và không chứa aggregate Hồ sơ/Nhiệm vụ.

## Runtime

- Java 21, Spring Boot 4.0.7, Maven Wrapper 3.9.9.
- Loopback port mặc định: `8093`.
- PostgreSQL database mặc định: `qtkhcn_ho_so`.
- Flyway là nguồn schema; Hibernate chỉ `validate`.
- API `/api/**` yêu cầu `Authorization: Bearer <service-token>`.
- Health probes không yêu cầu token:
  - `/actuator/health/liveness`
  - `/actuator/health/readiness`

## Environment

| Biến | Bắt buộc/mặc định |
|---|---|
| `JAVA_HOME` | JDK 21 |
| `QTKHCN_HO_SO_SERVICE_TOKEN` | Bắt buộc để gọi API; rỗng thì API fail-closed `401` |
| `QTKHCN_HO_SO_DB_URL` | `jdbc:postgresql://localhost:5432/qtkhcn_ho_so` |
| `QTKHCN_HO_SO_DB_USERNAME` | `qtkhcn` cho dev local |
| `QTKHCN_HO_SO_DB_PASSWORD` | `qtkhcn-dev-local` cho dev local |
| `QTKHCN_HO_SO_PORT` | `8093` |
| `QTKHCN_WORKFLOW_BASE_URL` | `http://127.0.0.1:8090` |
| `QTKHCN_WORKFLOW_SERVICE_TOKEN` | Bearer token riêng để gọi internal API service Quy trình |
| `QTKHCN_OUTBOX_DISPATCH_MS` | `1000` |
| `QTKHCN_WORKFLOW_PROJECTION_RECONCILE_MS` | `5000` |
| `QTKHCN_DOCUMENT_STORAGE_PATH` | `./data/ho-so-files`; thư mục lưu nội dung tệp, cần gắn volume bền vững khi deploy |
| `QTKHCN_DOCUMENT_MAX_FILE_SIZE` | `20MB` |
| `QTKHCN_DOCUMENT_MAX_REQUEST_SIZE` | `21MB` |

Không commit token/credential thật. Gateway ở Lát 2B sẽ inject service credential; frontend không gọi trực
tiếp port 8093.

## Build và chạy local

```powershell
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot'
$env:QTKHCN_HO_SO_SERVICE_TOKEN='<local-secret>'
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

## API hiện có

- `GET /api/nhiem-vu`
- `GET /api/nhiem-vu/{ma}`
- `GET /api/ho-so`
- `GET /api/ho-so/{id}`
- `GET /api/my-tasks` (yêu cầu thêm `X-QTKHCN-User-Id`; backend tự ánh xạ role cho tài khoản demo và không tin role do client tự khai)

Lát 3 bổ sung:

- `POST /api/nhiem-vu`, `PUT /api/nhiem-vu/{ma}`.
- `POST /api/ho-so`, `PUT /api/ho-so/{id}` (chỉ hồ sơ `DRAFT`).
- `DELETE /api/nhiem-vu/{ma}` (xóa kèm toàn bộ hồ sơ trực thuộc), `DELETE /api/ho-so/{id}`;
  tạm thời không giới hạn theo giai đoạn/trạng thái.
- `POST/DELETE /api/ho-so/{id}/documents/**` cho phép thêm, xóa tài liệu ở mọi trạng thái hồ sơ;
  `PUT` metadata vẫn chỉ áp dụng khi hồ sơ `DRAFT`.
- `POST /api/ho-so/{id}/documents` với `multipart/form-data` (`file`) để upload tệp ở mọi trạng thái hồ sơ.
- `GET /api/ho-so/{id}/documents/{documentId}/content` để xem inline và
  `GET /api/ho-so/{id}/documents/{documentId}/download` để tải xuống.
- Item GET và mutation response trả `ETag`; update/delete bắt buộc `If-Match`.
- Mutation bắt buộc `X-QTKHCN-Actor` và ghi `domain_mutation_audit`.

Lát 4 bổ sung `POST /api/ho-so/{id}/submit`: đổi hồ sơ sang `START_PENDING` và ghi outbox trong cùng
transaction; dispatcher retry vô hạn với network/5xx/timeout chưa rõ kết quả, rồi chuyển `PROCESSING`
khi reconcile thành công. Chỉ lỗi 4xx không retry mới thành `START_FAILED`; trạng thái này có thể submit
lại với request id mới. `/actions` vẫn ở service Quy
trình tới Lát 5.

Lát 5 bước 1–2 bổ sung `POST /internal/v1/workflow-events`, inbox idempotent và projection workflow.
Mỗi event mới dựng lại task/process projection từ toàn bộ inbox theo `(occurredAt, eventId)`, nên delivery
trùng không tạo task trùng và event đến sai thứ tự không làm trạng thái lùi. `dossier_step`,
`ho_so.buoc_hien_tai` và `ho_so.trang_thai` được cập nhật trong cùng transaction. Reconciler mặc định mỗi
5 giây dựng lại các inbox chưa xử lý (bao gồm row tồn tại trước migration V5) và lưu lỗi để vận hành theo dõi.

Lát 5 bước 3–4 bổ sung `/api/my-tasks` và backend RBAC cho tài khoản demo. Bộ lọc chạy trong database và
chỉ lấy task `ACTIVE` khi user hiện tại là assignee/candidate user hoặc có role khớp candidate group.
`X-QTKHCN-User-Id` được chuẩn hóa rồi ánh xạ vào catalog 5 tài khoản demo phía server; identity lạ trả `403`,
và `X-QTKHCN-Role-Codes` từ request bị bỏ qua. Admin demo được xem toàn bộ task `ACTIVE`. Gateway đã xác
thực phải ghi đè identity header trước khi chuyển tiếp; catalog tạm này sẽ được thay bằng claims/groups từ
OIDC/IAM khi giao thức IAM được chốt.

## E2E smoke task action

Khi Camunda/PostgreSQL, workflow backend `8090` và service này `8093` đã chạy với hai service token
khớp nhau, chạy luồng nghiệm thu tự động:

```powershell
$env:QTKHCN_HO_SO_SERVICE_TOKEN = '<local-ho-so-token>'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Invoke-E2ESmoke.ps1 `
  -WorkflowDevApiKey 'dev-local-only'
```

Script tạo dữ liệu riêng theo timestamp và kiểm tra create → submit → Task 1–4 approve → Task 5 return
→ Task 4 mở lại với task key mới → reject → Hồ sơ `REJECTED`, đồng thời admin không còn thấy active task.
Mỗi action được lấy từ `available-actions` trước khi thực thi; script fail nếu policy hoặc candidate group
không đúng contract runtime.

Smoke riêng cho lát RD02.02 v3 (worker kiểm tra mặc định và sinh HĐXD) chạy bằng:

```powershell
$env:QTKHCN_HO_SO_SERVICE_TOKEN = '<local-ho-so-token>'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\Invoke-RD0202V3E2E.ps1
```

Script đi qua full RD02.02 v3 đang deploy: T01/T02, bốn nhánh T03 song song, bước tổng hợp
T03_PM, T04-T06 và `Generate_HDXD`; sau đó chạy tiếp toàn bộ các bước T07-T33, bao gồm các
cụm song song T09/T12/T14/T23/T26/T28. Script assert hồ sơ kết thúc `APPROVED`, không còn
active task, đã gặp đủ 56 task key của deployed process, rồi xóa riêng nhiệm vụ/hồ sơ test.
Dùng `-KeepData` khi cần giữ artifact để xem trên UI.

## Ownership

`qtkhcn_ho_so` là nguồn dữ liệu duy nhất. Các script backfill/contract comparison từ monolith đã được gỡ
sau final cutover; không được tạo lại dual-write hoặc cơ chế đồng bộ ngược về database workflow.

# Lát 0 — Baseline, inventory và contract tách Service NV KHCN & Hồ sơ

> Ngày khảo sát: 2026-07-16  
> Trạng thái: contract v1 và baseline đã được user duyệt ngày 2026-07-16; chưa tạo migration, chưa commit  
> Phạm vi: `NhiemVu`, `HoSo`, dữ liệu con, public API hiện tại và seam gọi workflow

## 1. Kết luận Lát 0

- Bounded context mới có tên **Service NV KHCN & Hồ sơ**, application name
  `qtkhcn-ho-so-service`, source dự kiến ở `services/ho-so-service/`.
- Service mới sở hữu `NhiemVu`, `HoSo`, bước nghiệp vụ, tài liệu và projection trạng thái hồ sơ.
- Service Quy trình giữ Camunda, BPMN/DMN, action policy và process runtime.
- Giai đoạn đầu dùng **HTTP idempotent + transactional outbox**; chưa thêm message broker.
- Database logic là `qtkhcn_ho_so`, tách khỏi `qtkhcn_workflow`; dev/demo có thể dùng chung một PostgreSQL
  instance nhưng không dùng chung database/schema và không có foreign key xuyên service.
- Port dev dành cho service mới là **8093**. Các port 8090 (demo), 8091 (backend dev tích hợp) và 8092
  (BPMN test REST) giữ nguyên.
- Gateway giữ URL public `/api/nhiem-vu/**` và `/api/ho-so/**`; frontend không gọi `/internal/**`.
- Internal v1 dùng service credential riêng qua header `Authorization: Bearer <service-token>` ở dev/demo.
  Token chỉ lấy từ environment/secret store, không dùng `X-QTKHCN-Dev-Key` và không forward credential
  người dùng. Production thay bằng OAuth2 client credentials hoặc mTLS mà không đổi payload contract.
- Gateway/BFF chịu trách nhiệm ghép business view với task runtime; hai service không gọi DB của nhau.

## 2. Dependency map hiện tại

```text
Angular ho-so-list
  -> GET /api/ho-so
  -> HoSoController
      -> HoSoRepository -> ho_so, dossier_step, dossier_step_code, ho_so_tai_lieu
      -> NhiemVuRepository -> nhiem_vu
      -> HoSoService
          -> HoSoRepository
          -> NhiemVuRepository
          -> Rd0101ProcessService
              -> CamundaClient -> Zeebe/Camunda

NhiemVuController
  -> NhiemVuRepository -> nhiem_vu
```

Điểm ghép cần cắt ở Lát 1 là dependency trực tiếp
`HoSoService -> Rd0101ProcessService -> CamundaClient`. Hiện `submit()` vừa dựng bước và đổi hồ sơ sang
`PROCESSING`, vừa start Zeebe trong cùng lời gọi Java nhưng không cùng transaction vật lý.

Hành vi legacy đáng chú ý cần characterization:

- Chỉ `RD01.01` được submit; process id Camunda thật là `RD01_01`.
- Start Camunda fail-soft: lỗi bị bắt, `zeebeProcessInstanceKey` là `null`, hồ sơ vẫn được lưu
  `PROCESSING`.
- Action xử lý bước fail-closed: gọi Camunda trước; lỗi Camunda không lưu thay đổi domain.
- Sinh mã nhiệm vụ/hồ sơ bằng cách quét toàn bộ bảng và lấy `max + 1`; chưa an toàn khi ghi song song.
- Public `HoSoResponse` là view join Hồ sơ + Nhiệm vụ; không trả `taiLieu` dù entity có dữ liệu tài liệu.
- `HoSoRepository.findAll/findById` dùng entity graph cho `steps` và `steps.vaiTroCodes`; thay đổi fetch
  dễ gây `LazyInitializationException` hoặc `MultipleBagFetchException`.

## 3. Inventory dữ liệu

| Bảng | Chủ sở hữu đích | Quan hệ/phụ thuộc | Số dòng baseline |
|---|---|---|---:|
| `nhiem_vu` | Hồ sơ | PK `ma` | 5 |
| `ho_so` | Hồ sơ | PK `id`, FK `ma_nv -> nhiem_vu.ma` | 5 |
| `dossier_step` | Hồ sơ | FK `ho_so_id`, cascade delete | 30 |
| `dossier_step_code` | Hồ sơ | FK `dossier_step_id`, cascade delete | 50 |
| `ho_so_tai_lieu` | Hồ sơ | FK `ho_so_id`, cascade delete | 10 |

Baseline trạng thái: 4 `PROCESSING`, 1 `REJECTED`; không có hồ sơ `PROCESSING` thiếu
`zeebe_process_instance_key`. Chưa có bảng outbox/inbox. Flyway hiện đã áp dụng thành công V1–V10.

Các cột thuộc service Quy trình nhưng đang nằm trong `ho_so` và phải được thay bằng projection/correlation
khi tách: `quy_trinh`, `quy_trinh_ten`, `zeebe_process_instance_key`. Tên code-level v1 mới dùng
`processCode`, `processInstanceId`; lớp compatibility có thể tiếp tục map sang tên JSON legacy trong thời
gian strangler.

## 4. Public API legacy phải giữ trong giai đoạn strangler

| Method | Path | Hành vi/response hiện tại |
|---|---|---|
| GET | `/api/nhiem-vu` | Mảng `NhiemVuResponse` |
| GET | `/api/nhiem-vu/{ma}` | 200 hoặc 404 `{message}` |
| POST | `/api/nhiem-vu` | Sinh `RD.<year>.<seq3>`, trả 201 |
| GET | `/api/ho-so` | Mảng `HoSoResponse` đã join Nhiệm vụ |
| GET | `/api/ho-so/{id}` | 200 hoặc 404 `{message}` |
| POST | `/api/ho-so` | Tạo `DRAFT`, sinh `HS-<year>-<seq3>`, trả 201 |
| POST | `/api/ho-so/{id}/submit` | Chỉ nhận `RD01.01`; response 200 |
| POST | `/api/ho-so/{id}/actions` | `APPROVE_STEP`, `RETURN_STEP`, `REJECT_STEP`; response 200 |

Public endpoints hiện được chặn bằng `X-QTKHCN-Dev-Key`; CORS preflight được bỏ qua filter. Đây là
demo security legacy, không phải service authentication v1.

`NhiemVuResponse` khóa các field: `ma`, `ten`, `cap`, `chuNhiem`, `donViChuTri`,
`thoiGianThucHien`, `duToan`, `giaiDoan`.

`HoSoResponse` khóa các field: `id`, `maNV`, `loai`, `quyTrinh`, `quyTrinhTen`, `nguoiKhoiTao`,
`ngayTao`, `trangThai`, `buocHienTai`, `zeebeProcessInstanceKey`, `steps`, `maDeTai`, `tenDeTai`,
`chuNhiem`, `donVi`, `duToan`, `cap`.

## 5. Internal start-process contract v1

### Request

`POST /internal/v1/process-instances`

Headers bắt buộc:

```http
Authorization: Bearer <service-token>
Idempotency-Key: c89823fa-0000-4000-8000-000000000001
traceparent: 00-<trace-id>-<span-id>-01
Content-Type: application/json
```

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

Quy tắc khóa:

- `requestId` là UUID và phải bằng `Idempotency-Key`; sai khác trả `400`.
- Các id/code là string không rỗng, tối đa 128 ký tự; `businessKey` tối đa 255 ký tự.
- `initialVariables` chỉ nhận scalar/string array trong allowlist theo `processCode`; cấm object hồ sơ,
  document content, binary/base64 và credential.
- Hash idempotency tính trên canonical JSON của toàn bộ request, không tính header auth/trace.
- Cùng key + cùng hash trả đúng kết quả đã lưu với `200`; lần đầu trả `201`.
- Cùng key + khác hash trả `409 IDEMPOTENCY_CONFLICT` và không start process mới.
- `processCode` không tồn tại/không active trả `422 PROCESS_NOT_ACTIVE`, fail-closed.
- Timeout sau khi Camunda đã start phải được reconcile bằng inbox/mapping trước khi retry start.

### Response

```json
{
  "requestId": "c89823fa-0000-4000-8000-000000000001",
  "processInstanceId": "2251799813689001",
  "processDefinitionId": "Process_RD0202",
  "processVersion": 3,
  "status": "STARTED"
}
```

`processInstanceId` là string ở wire contract để không mất chính xác trên JavaScript dù Camunda hiện trả
`long`. `status` v1 chỉ có `STARTED` trong response thành công.

### Error envelope

```json
{
  "code": "IDEMPOTENCY_CONFLICT",
  "message": "Idempotency-Key đã được dùng với payload khác.",
  "correlationId": "c89823fa-0000-4000-8000-000000000001",
  "details": []
}
```

Mã HTTP khóa: 400 request/header sai; 401/403 service auth; 404 resource business-context không tồn tại;
409 idempotency/parallel-submit conflict; 422 process không active hoặc variable không hợp lệ; 503 workflow
engine tạm thời không sẵn sàng.

## 6. Business-context read contract v1

- `GET /internal/v1/ho-so/{hoSoId}/workflow-context`
- `GET /internal/v1/ho-so/{hoSoId}/validation-context?rule={ruleCode}`
- `GET /internal/v1/ho-so/{hoSoId}/document-manifest?version={version}`

DTO là purpose-specific và versioned; không trả JPA entity, storage path nội bộ, binary tài liệu hoặc toàn bộ
`HoSoResponse` public. Service Quy trình phải retry/incident khi context service unavailable, không dùng dữ
liệu mặc định để đi tiếp.

## 7. Workflow event envelope v1

```json
{
  "eventId": "9d30bcae-54da-4ca9-aa7c-35f8bf500c32",
  "eventType": "WORKFLOW_STARTED",
  "occurredAt": "2026-07-16T10:00:00Z",
  "correlationId": "c89823fa-0000-4000-8000-000000000001",
  "hoSoId": "HS-001",
  "processInstanceId": "2251799813689001",
  "payload": {}
}
```

Event type v1: `WORKFLOW_STARTED`, `TASK_ACTIVATED`, `TASK_COMPLETED`, `WORKFLOW_COMPLETED`,
`WORKFLOW_REJECTED`, `WORKFLOW_CANCELLED`, `WORKFLOW_INCIDENT_CREATED`. Consumer deduplicate bằng
`eventId`; event cũ/out-of-order không được làm lùi trạng thái hồ sơ.

## 8. Characterization test đã khóa trước Lát 1

Các specification dưới đây đã được hiện thực thành test. Full backend baseline chạy chúng cùng toàn bộ suite;
test mô tả collision được giữ `@Disabled` có chủ đích để ghi nhận rủi ro mà không hợp thức hóa hành vi lỗi.

### `NhiemVuHttpContractTest`

1. GET list khóa status, content type và đủ 8 field JSON.
2. GET detail không tồn tại trả 404 `{message}`.
3. POST hợp lệ trả 201, sinh đúng format mã và mặc định `giaiDoan=CHU_TRUONG`.
4. POST thiếu field bắt buộc trả 400 error envelope legacy.
5. Thiếu/sai dev API key trả 401; CORS preflight hợp lệ được phép.

### `HoSoHttpContractTest`

1. GET list khóa đủ 17 field của view join và 11 field mỗi step.
2. POST create khóa default: `DRAFT`, `buocHienTai=0`, một step `DONE`, hai tài liệu được persist nhưng
   không xuất hiện trong response legacy.
3. POST create với `maNV` không tồn tại trả 404; request invalid trả 400.
4. POST submit `RD01.01` khóa chuỗi step, `PROCESSING`, `buocHienTai=1` và process key.
5. POST submit process khác trả 501; submit lần hai trả 409.
6. GET/action hồ sơ không tồn tại trả 404.
7. Action không có process key trả 409 và không gọi Camunda.
8. Thiếu/sai dev API key trả 401; CORS preflight hợp lệ được phép.

### Bổ sung `HoSoServiceTest`

1. `createDraft` khóa format id, default type, step/tài liệu seed và liên kết hai chiều.
2. `submit` khóa thứ tự: start Camunda trước `save`, variables chỉ gồm `maHoSo` và `cap`.
3. Characterize legacy fail-soft: start trả `null` vẫn save `PROCESSING` với process key null. Test này phải
   được đổi có chủ đích khi Lát 4 đưa outbox/`START_PENDING` vào.
4. Parallel id generation hiện có collision risk: ghi test mô tả/disabled issue, không hợp thức hóa hành vi.
5. `RETURN_STEP`/`REJECT_STEP` khóa state transition và thứ tự gọi Camunda trước DB.

## 9. Baseline thực đo

| Hạng mục | Kết quả |
|---|---|
| Backend Maven Wrapper | Maven 3.9.9, JDK 21.0.11; wrapper đặt trong `backend/` |
| Backend chạy lại trong lượt này | `109` test: `108` pass, `0` failure/error, `1` skipped có chủ đích (`parallelDraftCreationCanGenerateTheSameId`) |
| Contract characterization | `NhiemVuHttpContractTest` 5/5; `HoSoHttpContractTest` 8/8; `HoSoServiceTest` 8 pass + 1 skipped |
| Angular unit test chạy trong lượt này | 23/23 file, 102/102 test pass |
| Angular production build | Green; route lazy-load `cau-hinh-service-task` sinh chunk riêng 138.65 kB |
| API read smoke port 8091 | `/api/nhiem-vu` 200 (5); `/api/ho-so` 200 (5) |
| API demo port 8090 với dev key mặc định | 401 đúng vì demo dùng credential riêng |
| Database | PostgreSQL 16, Flyway V1–V10 success, 5 nhiệm vụ/5 hồ sơ |

Angular build còn hai warning không chặn build đã có sẵn: `action-studio.scss` vượt budget 894 bytes và
dependency `classnames` là CommonJS. Baseline và rollback point đã đạt điều kiện kỹ thuật; **Lát 1 chỉ bắt
đầu sau khi contract v1 và kết quả trong tài liệu này được duyệt**.

## 10. Rollback point

- Git HEAD khảo sát: `2b47b702e0140cb976e7724aebb0861d62f3adb0`.
- Working tree đang có nhiều thay đổi chưa commit của các task khác; HEAD không đại diện đầy đủ runtime 8091.
- PostgreSQL custom-format dump đã được kiểm tra bằng `pg_restore --list`:
  `C:\Users\phuctd7\qtkhcn-backups\qtkhcn-slice0-20260716-164558.dump` (451,178 bytes).
- SHA-256: `57395caf30cd0f8bc92fc19bd5dd72bc6680d5cd07bcf723d37d2d729249eaf4`; checksum sidecar ở
  `qtkhcn-slice0-20260716-164558.dump.sha256` và nằm ngoài Git worktree.
- Manifest trạng thái 95 file thay đổi/chưa track tại thời điểm baseline:
  `C:\Users\phuctd7\qtkhcn-backups\qtkhcn-slice0-20260716-164558.worktree-manifest.json`, SHA-256
  `715c170d7cd5741902a58255b9accb64cc243966a895856cfae4e5e923b0cf16` (có sidecar `.sha256`).
- Trước khi sửa Lát 1 phải giữ nguyên dump, manifest và các checksum này để phân biệt chính xác baseline
  runtime với Git HEAD.

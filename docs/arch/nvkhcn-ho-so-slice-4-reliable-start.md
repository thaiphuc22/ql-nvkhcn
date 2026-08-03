# Lát 4 — transactional outbox và start-process idempotent

Ngày triển khai: 2026-07-18.

## Phạm vi đã code

- `ho-so-service` ghi `START_PENDING` và `START_WORKFLOW_REQUESTED` vào `outbox_event` trong cùng
  transaction. Dispatcher dùng HTTP nội bộ, bearer token riêng, exponential backoff và processing
  lease 60 giây để row không bị kẹt khi process chết sau claim.
- Thành công cập nhật cùng transaction local: outbox `SENT`, hồ sơ `PROCESSING`, process instance key.
  Network/5xx/timeout chưa rõ kết quả được retry vô hạn để không mở cửa tạo trùng instance. Chỉ lỗi 4xx
  xác định là không retry mới chuyển `START_FAILED`; người dùng có thể submit lại bằng request id mới.
- Backend Quy trình expose `POST /internal/v1/process-instances`. `requestId` phải trùng
  `Idempotency-Key`; payload được canonicalize và SHA-256 trước khi lưu inbox.
- Cùng key/hash trả result đã lưu; cùng key/khác hash trả `409 IDEMPOTENCY_CONFLICT`.
- Trước khi gọi Camunda, inbox chuyển `UNKNOWN`. Nếu call timeout/mất response, retry chỉ search biến
  `qtkhcnStartRequestId` và hoàn thiện mapping; không start mù lần hai.
- Variables fail-closed: chỉ scalar/string-array trong allowlist, `maHoSo` phải trùng `hoSoId`, RD01.01
  bắt buộc `cap=CS|TD`. Payload không chứa tài liệu hay object hồ sơ.
- Gateway write seam nay route `/submit` sang service Hồ sơ; `/actions` giữ ở monolith tới Lát 5.

## Verify

- Service Hồ sơ: 16/16 test pass; backend Quy trình: 164 test, 0 failure/error, 1 skipped có chủ đích.
- Angular targeted 2/2 pass và production build xanh; PowerShell route script parse sạch.
- Flyway V3/V14 chạy sạch trên PostgreSQL 16 database tạm; Hibernate runtime validate xanh.
- E2E thật qua hai executable JAR + PostgreSQL + Camunda:
  - submit trả 202/`START_PENDING`, sau dispatch thành `PROCESSING`, outbox `SENT`;
  - inbox và mapping cùng giữ một process key;
  - duplicate trả 200 cùng result, payload khác trả 409, mapping count vẫn 1;
  - xóa mapping và ép inbox về `UNKNOWN` để mô phỏng mất response, retry reconcile về đúng key cũ;
    Camunda variable search vẫn chỉ có một correlation/instance.
- Process instance smoke đã cancel; hai DB tạm, hai Java process và port 18090/18093 đã dọn.

## Trạng thái vận hành và rollback

Chưa cutover live. Khi cutover cần cùng một `QTKHCN_WORKFLOW_SERVICE_TOKEN` ở backend Quy trình và
dispatcher service Hồ sơ, đồng thời giữ `QTKHCN_HO_SO_SERVICE_TOKEN` riêng cho gateway. Rollback route
về monolith không xóa outbox; dừng dispatcher trước nếu cần giữ lệnh để phát lại.

Giới hạn có chủ đích: workflow completion/task/incident events chưa cập nhật projection Hồ sơ;
`/actions` chưa chuyển. Đây là phạm vi Lát 5.

# Lát 5, bước 1 — workflow event publisher và inbox/dedup

Ngày triển khai: 2026-07-18.

## Contract v1

Service Quy trình phát năm loại event: `TASK_CREATED`, `TASK_COMPLETED`, `PROCESS_COMPLETED`,
`PROCESS_CANCELLED`, `INCIDENT_CREATED`. Envelope luôn có `eventId`, `occurredAt`, `correlationId`,
`hoSoId`, `processInstanceId` và payload kỹ thuật tối thiểu.

Runtime collector đọc các process đã có trong `workflow_process_mapping` qua Camunda Search API. Event
được nhận diện bằng `source_key` ổn định (process + task/incident/type) và có `eventId` UUID xác định từ
khóa đó. Vì Camunda Search giữ cả task/process đã kết thúc, collector có thể chạy lại sau restart mà
không phát sinh event logic mới.

## Độ tin cậy

- Backend Quy trình ghi `workflow_event_outbox` trước khi gửi HTTP. Dispatcher có processing lease,
  exponential backoff và retry vô hạn cho lỗi chưa rõ kết quả; lỗi 4xx xác định (trừ 408/429) được
  giữ `FAILED` làm dead-letter thay vì retry nóng vô hạn.
- Endpoint nhận là `POST /internal/v1/workflow-events`, bắt buộc bearer
  `QTKHCN_HO_SO_SERVICE_TOKEN`; frontend không gọi endpoint này.
- Service Hồ sơ ghi inbox bằng `INSERT ... ON CONFLICT DO NOTHING`, nên hai delivery/replica đồng thời
  vẫn chỉ tạo một row. Cùng `eventId` và cùng canonical payload trả `200`; payload khác trả `409`.
- Bước này chỉ lưu inbox. Task/status projection, xử lý thứ tự event và reconciliation thuộc bước 2.

## Verify

- Backend Quy trình: 165 test, 0 failure/error, 1 skipped có chủ đích.
- Service Hồ sơ: 20/20 test pass.
- PostgreSQL 16 thật: Flyway backend v15 và service Hồ sơ v4 chạy sạch; Hibernate validate và hai app
  khởi động thành công trên port tạm.
- HTTP thật: first delivery `202`, duplicate `200`, same-id/different-payload `409`, inbox count bằng 1.
- Database, process, port và log tạm đã dọn sau smoke.

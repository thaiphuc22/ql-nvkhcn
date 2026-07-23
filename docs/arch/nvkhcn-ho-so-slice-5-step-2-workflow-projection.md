# Lát 5, bước 2 — task/status projection và reconciliation

Ngày triển khai: 2026-07-18.

## Projection

Flyway V5 tạo hai read model trong Service Hồ sơ:

- `workflow_task_projection`: một dòng theo `taskKey`, gồm `processInstanceId`,
  `taskDefinitionKey`, tên bước, `ACTIVE/COMPLETED`, assignee, hạn và form. Candidate users/groups nằm
  trong hai bảng con có index theo `code`, sẵn cho lọc quyền chính xác ở bước 3.
- `workflow_process_projection`: một dòng theo process, gồm `ACTIVE/COMPLETED/CANCELLED` và incident
  gần nhất.

Projection đồng thời cập nhật aggregate nghiệp vụ đã có: `dossier_step.trang_thai`, người/hạn/form của
bước hiện tại, `ho_so.buoc_hien_tai` và trạng thái hồ sơ (`PROCESSING`, `APPROVED`, `CANCELLED`). Event bị
từ chối nếu `hoSoId` đang trỏ sang một process instance khác, tránh chiếu nhầm dữ liệu giữa hồ sơ.

## Duplicate và out-of-order

Inbox vẫn là nguồn sự thật. Sau mỗi event mới, projector khóa hồ sơ rồi đọc lại toàn bộ event của hồ sơ
theo `(occurred_at, event_id)` và dựng projection xác định từ đầu. Vì vậy:

- duplicate cùng payload vẫn là no-op;
- `TASK_COMPLETED` đến trước `TASK_CREATED` không mở task trở lại khi event create đến muộn;
- process đã kết thúc không bị task event cũ làm lùi về `PROCESSING` hoặc tạo task active;
- cùng transaction chứa inbox mới, task/process projection và cập nhật aggregate Hồ sơ.

Collector phía Service Quy trình định kỳ đọc Camunda Search và phát event với ID ổn định. Ở phía Service
Hồ sơ, `WorkflowProjectionReconciler` mặc định mỗi 5 giây dựng lại các hồ sơ có inbox chưa `processed_at`;
đây là đường phục hồi cho row cũ từ V4 hoặc ca process dừng giữa inbox và projection. Lỗi poison được lưu
ở `processing_error` thay vì đánh dấu đã xử lý.

## Verify

- `ho-so-service`: 23/23 test pass.
- Test mới khóa hai ca out-of-order: completion giao trước creation; process terminal đi cùng task create
  đến muộn. Test inbox hiện có tiếp tục khóa duplicate và same-ID/different-payload conflict.
- PostgreSQL 16 thật: app boot trên database tạm, Flyway áp V1–V5 và Hibernate validate xanh. Smoke
  HTTP giao `TASK_COMPLETED` trước `TASK_CREATED`, rồi giao duplicate: nhận `202 → 202 → 200`, inbox
  `2/2 processed`, task vẫn `COMPLETED`, bước `Task_1` là `DONE`. Process, database và log tạm đã dọn.

Giới hạn có chủ đích: bước này chưa expose `GET /api/my-tasks`; API lọc server-side theo identity/group là
bước 3 và sẽ đọc `workflow_task_projection`.

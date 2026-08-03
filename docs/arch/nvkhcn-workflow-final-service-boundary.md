# Ranh giới cuối cùng: NV KHCN ↔ Quản trị quy trình

Ngày chốt: 2026-07-20. Tài liệu này thay thế các hướng dẫn cutover/canary/rollback trong các tài liệu
Lát 0–5 trước đây; các tài liệu đó chỉ còn giá trị lịch sử triển khai.

## Ownership bắt buộc

| Service | Sở hữu | Database/API |
|---|---|---|
| Quản lý NV KHCN (`8093`) | Nhiệm vụ, Hồ sơ, tài liệu, trạng thái nghiệp vụ, task/process projection | `qtkhcn_ho_so`; `/api/nhiem-vu/**`, `/api/ho-so/**`, `/api/my-tasks` |
| Quản trị quy trình (`8090`) | BPMN/DMN/eForm, Action Studio, Camunda process/task/incident, idempotency và outbox workflow | `qtkhcn`; `/api/tasks/**`, process/config APIs, `/internal/v1/process-instances` |

Service Quy trình không có entity, repository, service hoặc controller cho `NhiemVu`/`HoSo`; Flyway V19
xóa năm bảng legacy khỏi `qtkhcn`. Chỉ các bảng correlation/inbox/outbox của workflow được giữ lại.

## Kênh tích hợp duy nhất

1. 8093 lưu `START_PENDING` và command outbox trong cùng transaction.
2. Dispatcher gọi `POST /internal/v1/process-instances` ở 8090 với idempotency key và control variables
   theo allowlist.
3. 8090 điều khiển Camunda và lưu start/action inbox cùng process mapping.
4. 8090 phát workflow event qua outbox; dispatcher gọi `/internal/v1/workflow-events` ở 8093.
5. 8093 deduplicate event và cập nhật projection/business status trong transaction của mình.

Không dùng distributed transaction, shared repository, shared database, dual-write hoặc in-process
`WorkflowClient` adapter.

## Routing

Gateway route mọi Hồ sơ/Nhiệm vụ/worklist sang 8093 và mọi task action sang 8090. Không còn feature flag,
canary upstream hoặc fallback về monolith. Service owner không healthy thì request fail-closed.

## Guardrail cho thay đổi sau này

- Không thêm `/api/ho-so/**` hay `/api/nhiem-vu/**` vào backend 8090.
- Không thêm JPA mapping tới năm bảng business trong `qtkhcn`.
- Không cho 8090 truy cập `qtkhcn_ho_so` hoặc 8093 truy cập `qtkhcn`.
- Mọi contract liên service phải idempotent, có authentication và chứa correlation/control data tối thiểu.
- Workflow action lấy task key làm trung tâm; kết quả Hồ sơ chỉ thay đổi qua event projection.

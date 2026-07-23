# Lát 5, bước 3 — API Việc của tôi

Ngày triển khai: 2026-07-18.

## Contract

`GET /api/my-tasks` trả các user task đang `ACTIVE` mà danh tính hiện tại có quyền nhận:

- `assignee` trùng `X-QTKHCN-User-Id`;
- hoặc `candidateUsers` chứa user id;
- hoặc ít nhất một `candidateGroups` nằm trong `X-QTKHCN-Role-Codes` (danh sách phân tách bằng dấu phẩy).

Response gồm `processInstanceKey`, `taskKey`, `taskDefinitionKey`, `maHoSo`, `tenBuoc`,
`assignee`, `candidateUsers`, `candidateGroups`, `createdAt`, `dueAt` và `formKey`. Kết quả được sắp
xếp theo hạn, thời điểm tạo và task key để ổn định giữa các lần gọi.

Danh tính không được nhận từ query parameter. Trong seam hiện tại, endpoint vẫn nằm sau bearer service token;
gateway phải xác thực người dùng rồi thay/ghi hai identity header trước khi chuyển tiếp. Đây là trust boundary tạm
thời cho đến khi IAM/OIDC được chốt, không phải cơ chế cho client tự khai role.

## Kiểm thử

Contract test khóa schema 11 trường, cách parse/khử trùng role, yêu cầu user id và service token. Unit test khóa
hai nhánh truy vấn (có/không có group) để tập role rỗng không sinh `IN ()` hoặc vô tình mở rộng quyền.

Kết quả verify: toàn bộ `ho-so-service` 28/28 test pass. Smoke trên PostgreSQL 16 thật áp Flyway V1–V5,
khởi động ứng dụng với Hibernate validate, xác nhận role `PM` nhận đúng task `ACTIVE`; role không liên quan nhận
`[]` và task `COMPLETED` không xuất hiện. Database, tiến trình và cổng tạm đã được dọn.

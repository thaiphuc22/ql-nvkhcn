# Lát 5, bước 6 — Angular Worklist và gateway cutover

Ngày triển khai code: 2026-07-18.

## Angular

`/viec-cua-toi` dùng trực tiếp `GET /api/my-tasks`. Request gửi identity của tài khoản demo hiện tại
qua `X-QTKHCN-User-Id`; frontend không gửi role và không lọc task theo role. Contract 11 trường được
khai báo trong `core/models/my-task.ts`; task/process key giữ kiểu `string` để không mất độ chính xác
của key Zeebe 64-bit.

UI chuyển sang dữ liệu task-native: mã hồ sơ, tên bước, task definition/key, assignee hoặc candidate,
ngày tạo, hạn và form. Nút xử lý mở `/ho-so/:maHoSo`; Worklist không gọi phụ `/api/ho-so`, tránh tạo
hai nguồn quyết định task/quyền.

## Gateway cutover

Caddy có matcher riêng cho `GET /api/my-tasks`, đứng trước fallback `/api/*`. Nhánh này:

- chuyển tới `QTKHCN_MY_TASKS_UPSTREAM`;
- inject `QTKHCN_HO_SO_SERVICE_TOKEN` vào bearer header;
- xóa `X-QTKHCN-Role-Codes` do client tự khai;
- giữ Basic Auth ngoài cùng và identity demo mà Angular gửi.

Giới hạn có chủ đích: Basic Auth demo hiện dùng chung một credential và chưa ràng buộc identity Angular
với một principal gateway. Catalog backend ngăn client tự thêm role nhưng chưa ngăn đổi sang một email demo
khác; production phải để OIDC/IAM xác thực rồi gateway ghi đè identity header.

`Start-DemoProxy.ps1 -EnableMyTasksRoute` và `Switch-MyTasksRoute.ps1 -Target Service` chỉ cutover
sau khi readiness 8093 xanh và probe `/api/my-tasks` bằng identity PM thành công. Target `Monolith`
là rollback route; do monolith không có endpoint này, phải rollback đồng thời release Angular cũ.
Khi reload từ terminal khác, script yêu cầu khai báo hai upstream read/write hiện hành và
fail-closed nếu thiếu; cutover My Tasks không được phép ngầm rollback seam khác.

Runtime 8090 và 8093 phải nhận cùng `QTKHCN_WORKFLOW_SERVICE_TOKEN` cho chiều Service Hồ sơ gọi
Service Quy trình. `QTKHCN_HO_SO_SERVICE_TOKEN` phải giống nhau ở Service Hồ sơ, Service Quy trình
và gateway cho chiều gọi Service Hồ sơ.

## Kiểm thử code

- Worklist targeted: 3/3 pass.
- Angular production build: pass; chỉ còn các warning budget/CommonJS có sẵn.
- Bốn script PowerShell liên quan cutover parse thành công.
- Chưa validate Caddy binary hoặc cutover tiến trình thật vì máy hiện tại không có `caddy` trong PATH.

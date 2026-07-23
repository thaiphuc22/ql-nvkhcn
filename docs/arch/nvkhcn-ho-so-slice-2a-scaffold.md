# Lát 2A — Scaffold Service NV KHCN & Hồ sơ

> Ngày triển khai: 2026-07-16  
> Trạng thái: hoàn tất và verified; chưa chuyển traffic  
> Source: `services/ho-so-service/`

## 1. Phạm vi đã triển khai

- Spring Boot service độc lập `qtkhcn-ho-so-service`, Java 21, Maven Wrapper 3.9.9.
- Port loopback mặc định `8093`; database vật lý riêng `qtkhcn_ho_so` trên PostgreSQL dev hiện tại.
- Flyway V1 tạo các bảng do bounded context Hồ sơ sở hữu: `nhiem_vu`, `ho_so`, `dossier_step`,
  `dossier_step_code`, `ho_so_tai_lieu`.
- Read model/repository/query service độc lập cho Nhiệm vụ và Hồ sơ; không có dependency Camunda.
- Bốn GET endpoint giữ nguyên JSON contract legacy 8 field Nhiệm vụ, 17 field Hồ sơ và 11 field/bước.
- API nội bộ fail-closed bằng Bearer service token lấy từ environment. Token rỗng không cho phép gọi API.
- Audit log đọc có method/path/status/duration/correlation ID; không log Authorization header hoặc token.
- Actuator liveness/readiness mở để runtime probe được trước khi gateway route traffic.

## 2. Verification

- Unit/contract test service mới: **7/7 pass**.
- Executable package: `target/qtkhcn-ho-so-service.jar` build thành công.
- Flyway thật: `1:ho so read schema:true` trên `qtkhcn_ho_so`.
- Hibernate `ddl-auto=validate`: startup thành công với schema thật.
- Runtime smoke trên port tạm 18093: liveness `UP`, readiness `UP`, thiếu token `401`, token đúng trả
  `[]` cho cả `/api/nhiem-vu` và `/api/ho-so`.
- Tiến trình smoke đã dừng; không có listener 8093/18093 được giữ lại.

## 3. Trạng thái dữ liệu và traffic

- Database mới hiện rỗng; chưa snapshot/backfill từ `qtkhcn`.
- Gateway/Caddy/Angular chưa thay đổi; toàn bộ traffic hiện vẫn tới monolith như trước.
- Monolith vẫn là write owner duy nhất. Service mới không expose mutation endpoint và không dual-write.
- Rollback Lát 2A chỉ cần không start service; có thể drop database `qtkhcn_ho_so` vì chưa chứa dữ liệu sở
  hữu và migration có thể tái tạo, nhưng không tự động drop trong workflow bình thường.

## 4. Tiếp theo — Lát 2B

1. Viết snapshot/backfill một chiều từ `qtkhcn` sang `qtkhcn_ho_so`.
2. Đối soát row count và checksum cho 5 bảng; fail nếu thiếu FK hoặc projection lệch.
3. Chạy contract comparison giữa monolith và service mới trên cùng dữ liệu.
4. Thêm gateway read-route feature flag, mặc định giữ route cũ.
5. Chuyển GET canary sang service mới, smoke Angular rồi mới cân nhắc bật toàn bộ read traffic.

Chưa thêm HTTP `WorkflowClient`, outbox/idempotency hoặc mutation API; các phần đó thuộc các lát sau.

# Lát 3 — chuyển write ownership nghiệp vụ Hồ sơ

Ngày triển khai: 2026-07-18.

## Phạm vi đã code

- Service Hồ sơ sở hữu create/update `NhiemVu`, create/update hồ sơ nháp và CRUD metadata tài liệu.
- `@Version` + `ETag`/`If-Match` cho Nhiệm vụ, Hồ sơ và tài liệu; stale version trả `409`.
- Mutation bắt buộc service token và `X-QTKHCN-Actor`; actor Unicode RFC 5987 được decode trước khi audit.
- Flyway V2 thêm version, document identity, business-ID sequence và audit append-only.
- Backfill reset cả business sequence sau restore, tiếp tục một chiều và không dual-write.
- Monolith có `QTKHCN_HO_SO_LEGACY_WRITES_ENABLED`; khi `false`, business create trả `409` nhưng
  `/submit` và `/actions` vẫn hoạt động.
- Gateway có write seam riêng. Chỉ business CRUD đi service Hồ sơ; workflow command vẫn đi monolith.
  `Switch-HoSoWriteRoute.ps1` fail-closed nếu service chưa healthy hoặc legacy write guard chưa đúng state.

## Ngoại lệ gate

User ngày 2026-07-18 cho phép bỏ qua cửa sổ canary 30 phút của Lát 2D để tiếp tục code. Báo cáo
traffic thật Lát 2D không tồn tại; không được ghi nhận như đã PASS.

## Verify

- `ho-so-service`: 13/13 test pass; executable JAR build thành công.
- Backend Quy trình: 158 test, 0 failure/error, 1 skipped có chủ đích.
- PostgreSQL thật: Flyway empty schema → V2; create/update Nhiệm vụ, create Hồ sơ, create/update/delete
  tài liệu đều xanh; stale `If-Match` → 409; `/submit` service Hồ sơ → 404; audit có đủ action.
- Rollback drill: backfill lại từ source, parity 5/5 bảng và business sequence trả về `1:false`.
- Caddy 2.10 validate xanh; ba script PowerShell liên quan parse sạch.
- Angular targeted tests 5/5 pass; production build xanh. Hai trang create gửi actor header.

## Trạng thái vận hành

Môi trường hiện tại không có release root/Caddy/monolith 8090 thường trực, nên **chưa cutover live**.
Local smoke service đã dừng, port 8093 đã giải phóng, dữ liệu smoke đã rollback. Khi cutover:

1. Backfill + parity.
2. Restart monolith với `QTKHCN_HO_SO_LEGACY_WRITES_ENABLED=false`.
3. Chuyển write route sang service bằng `Switch-HoSoWriteRoute.ps1 -Target Service`.
4. Rollback theo thứ tự ngược: bật lại legacy writes rồi `-Target Monolith`.

Next: Lát 4 — transactional outbox và start-process idempotent.

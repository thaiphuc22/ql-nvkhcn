# Lát 2B — snapshot/backfill và read contract gates

Ngày thực hiện: 2026-07-16.

## Phạm vi

- Copy một chiều năm bảng do Service NV KHCN & Hồ sơ sẽ sở hữu từ `qtkhcn` sang `qtkhcn_ho_so`.
- Không tạo mutation API, CDC, dual-write hay write-back về monolith.
- Đối soát count/checksum và JSON contract trước khi tạo seam read-route.
- Read-route flag được thêm ở gateway nhưng mặc định OFF; traffic hiện tại không bị chuyển.

## Cơ chế backfill

`services/ho-so-service/scripts/Invoke-HoSoBackfill.ps1` chạy `pg_dump --data-only` trong container
PostgreSQL để lấy một snapshot nhất quán của năm bảng. Phía target thực hiện `TRUNCATE ... RESTART
IDENTITY`, restore và reset sequence trong cùng một transaction với `ON_ERROR_STOP`.

Đặc tính an toàn:

- Source chỉ được đọc; source và target không được phép cùng tên.
- Giữ nguyên `dossier_step.id`, nên FK từ `dossier_step_code` không đổi.
- Lỗi COPY/FK/check/sequence làm rollback toàn bộ target.
- Có thể chạy lặp; mỗi lần target phản ánh đúng snapshot vừa lấy, không cộng dồn dữ liệu.
- `-WhatIf` không lấy dump và không sửa target.

## Cổng count/checksum

`Test-HoSoDataParity.ps1` chuẩn hóa đầy đủ các cột thành JSON array, sắp theo primary/business key rồi
tính MD5 trên chuỗi kết hợp. MD5 ở đây chỉ là equality checksum, không dùng cho mục đích bảo mật.

Kết quả local sau backfill:

| Bảng | Count | Checksum |
|---|---:|---|
| `nhiem_vu` | 5 | `6e665c7e0aa66c5fa38f3fb2b7ac385a` |
| `ho_so` | 5 | `068e5a51a73db48bf0c750b061518496` |
| `dossier_step` | 30 | `5fb6c99647b9443e9a376693065682d1` |
| `dossier_step_code` | 50 | `51b0871572921034a2e933454917639e` |
| `ho_so_tai_lieu` | 10 | `e166d8c542232cf38eabbae3cd66f2b4` |

Count và checksum source/target đều khớp cho cả năm bảng.

## Cổng HTTP contract

`Compare-HoSoReadContracts.ps1` gọi monolith và service mới trên cùng snapshot, chuẩn hóa thứ tự danh
sách và thứ tự property JSON rồi so sánh exact value/shape. Đã pass:

- `GET /api/nhiem-vu` và năm item endpoint.
- `GET /api/ho-so` và năm item endpoint.
- Tổng cộng 12 phép so sánh.

Service mới vẫn qua Bearer service token; monolith dùng dev API key riêng. Token/key không được ghi vào
script, log báo cáo hay Git.

## Read-route feature flag

`infra/demo-tunnel/Start-DemoProxy.ps1` có switch `-EnableHoSoReadRoute`, mặc định không được truyền nên
hai read route vẫn tới monolith 8090. Khi bật, script fail-closed nếu thiếu service token hoặc readiness/API
check của service 8093 không đạt. Chỉ GET của `/api/ho-so*` và `/api/nhiem-vu*` được chuyển; mutation vẫn
tới monolith.

Rollback route là restart proxy không có switch. Không cần copy dữ liệu ngược.

## Verify

- Backfill thực tế: 5/5 table restore và COMMIT thành công.
- Một lần restore lỗi ở bước sequence đã rollback toàn bộ target, sau đó lỗi được sửa bằng schema-qualified
  relation và chạy lại xanh.
- Data parity: 5/5 count match, 5/5 checksum match.
- HTTP contract: 12/12 pass.
- `services/ho-so-service`: 7/7 Maven test pass và executable JAR build thành công.
- PowerShell parser: 4/4 script liên quan pass.
- Caddy 2.10: `caddy validate` pass cho cấu hình read-route mới.

Chưa bật read-route trên demo/live và không giữ service kiểm tra chạy thường trực.

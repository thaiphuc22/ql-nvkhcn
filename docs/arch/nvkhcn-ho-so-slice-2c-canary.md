# Lát 2C — release runtime, canary GET và rollback route

Ngày thực hiện: 2026-07-16.

## Phạm vi

- Chạy service Hồ sơ read-only thường trực trong cây release, bind loopback `127.0.0.1:8093`.
- Canary đúng bốn GET pattern `/api/ho-so*` và `/api/nhiem-vu*`; mutation và API khác vẫn ở monolith.
- Smoke Angular release và diễn tập trả route về monolith mà không restart Runlocal.
- Không chuyển write ownership, không dual-write và không copy dữ liệu ngược khi rollback.

## Artifact và runtime

- Release: `C:\Users\phuctd7\qtkhcn-demo\service-releases\slice2c-20260716-173255-2b47b70`.
- Source commit ghi trong manifest: `2b47b702e0140cb976e7724aebb0861d62f3adb0`.
- SHA-256 JAR: `71bae31ae12ee3e1a9eba451f9e14dbb967b6b64dbf2f09dad8ed87c8308271e`.
- Token service được sinh ngẫu nhiên và lưu duy nhất trong `infra/demo-tunnel/.env.local` đã git-ignore;
  tài liệu, manifest và log không chứa token.
- Readiness cuối phiên `UP`; listener chỉ ở `127.0.0.1:8093`.

## Chuyển route

`Switch-HoSoReadRoute.ps1` nhận target tường minh:

```powershell
& .\infra\demo-tunnel\Switch-HoSoReadRoute.ps1 -Target Canary
& .\infra\demo-tunnel\Switch-HoSoReadRoute.ps1 -Target Monolith
```

Target Canary fail-closed nếu readiness, Bearer-authenticated API hoặc Caddy validate thất bại. Script
dùng `caddy reload`, kiểm tra upstream thực tế qua admin API và xác nhận Basic Auth vẫn trả `401` cho
request không credential. Target Monolith là rollback route; không dừng service và không restart tunnel.

`Caddyfile.ho-so-canary-smoke` là listener smoke ngắn hạn chỉ bind `127.0.0.1:8444`, có admin endpoint
riêng `127.0.0.1:2020`, dùng cùng Angular artifact và route split nhưng không nối với Runlocal.

## Kết quả verify

- `mvnw.cmd clean package`: 7/7 test pass, executable JAR build thành công.
- Exact HTTP contract được chạy lại ngay trước canary: 12/12 list/item endpoint pass.
- Service auth: thiếu Bearer token trả `401`, token đúng trả 5 hồ sơ.
- Angular release: SPA fallback `/ho-so` trả `200`, assets tải được, Angular boot tới auth guard; gateway
  smoke GET trả đúng 5 hồ sơ từ service. Đăng nhập UI tự động không dùng vì môi trường không lưu Basic
  Auth/client demo credential dạng rõ cho automation.
- Live route đã reload sang `127.0.0.1:8093`, sau đó rollback về `127.0.0.1:8090`.
- Trạng thái cuối: live route ở monolith, service `8093` vẫn resident để quan sát, Runlocal giữ nguyên PID
  và không đổi URL.
- PowerShell parser pass toàn bộ script demo-tunnel; cả Caddyfile live và smoke validate thành công.

## Trạng thái cuối có chủ đích

Read-route flag đang **OFF** sau diễn tập. Đây là rollback drill, không phải quyết định giữ traffic canary
lâu dài. Lát tiếp theo chỉ nên mở canary theo cửa sổ quan sát có metric/log và tiêu chí lỗi rõ ràng; write
ownership vẫn ngoài phạm vi.

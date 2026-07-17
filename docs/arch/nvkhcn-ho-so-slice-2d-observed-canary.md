# Lát 2D — canary GET có thời lượng và quan sát

Ngày thực hiện: 2026-07-16.

## Phạm vi

- Chỉ chuyển bốn GET pattern `/api/ho-so*` và `/api/nhiem-vu*` trong một cửa sổ hữu hạn.
- Theo dõi readiness, số request, lỗi 5xx, độ trễ trung bình/max và `READ_AUDIT` có correlation ID.
- Tự động reload route về monolith trong `finally`, kể cả khi gate/metric/ngưỡng quan sát thất bại.
- Không chuyển mutation, write ownership, không dual-write và không dừng monolith/Runlocal.

## Artifact

- Service release: `C:\Users\phuctd7\qtkhcn-demo\service-releases\slice2d-20260716-175633`.
- Service resident trên loopback `127.0.0.1:8093`; readiness cuối phiên `UP`.
- Báo cáo quan sát nằm ngoài workspace tại
  `C:\Users\phuctd7\qtkhcn-demo\observations\ho-so-read-canary-*.json`; không chứa secret.

## Cơ chế quan sát

`ReadAuditFilter` ghi timer `qtkhcn.read.requests` với ba tag hữu hạn:

- `traffic`: `canary` khi Caddy gắn `X-QTKHCN-Read-Canary: true`, ngược lại là `direct`;
- `route`: chỉ bốn route chuẩn hóa list/item, không dùng ID thật làm tag;
- `outcome`: `success`, `client_error` hoặc `server_error`.

Actuator chỉ expose `health`, `info`, `metrics` trên service bind loopback. Probe gọi thẳng service không
được tính vào traffic canary. Log `READ_AUDIT` có method/path/status/elapsed/traffic/correlation ID và
không log token/Authorization.

`Invoke-HoSoReadCanaryWindow.ps1` mặc định:

- thời lượng 30 phút, poll 30 giây;
- cần ít nhất 5 request canary;
- lỗi 5xx cho phép 0%;
- độ trễ trung bình tối đa 1.000 ms.

Không đủ request là `FAIL` (không đủ bằng chứng), không phải `PASS`. Mọi kết quả đều ghi JSON và terminal
state bắt buộc là `finalRoute=Monolith`, `writeOwnership=Monolith`.

## Cách chạy cửa sổ vận hành

Load ba secret từ `.env.local` vào process environment nhưng không in giá trị, rồi chạy:

```powershell
& .\infra\demo-tunnel\Invoke-HoSoReadCanaryWindow.ps1 `
  -DurationMinutes 30 `
  -MinimumObservedRequests 5 `
  -MaximumServerErrorPercent 0 `
  -MaximumAverageLatencyMs 1000
```

Không chạy script nền không được giám sát. Nếu host/terminal bị kill cứng và `finally` không thể chạy, dùng
ngay `Switch-HoSoReadRoute.ps1 -Target Monolith` và xác nhận admin config chứa `127.0.0.1:8090`.

## Verify

- `mvnw.cmd clean package`: 8/8 test pass; executable JAR build thành công.
- PowerShell 5.1 parser: script cửa sổ và route switch pass.
- Metric contract test: request item canary được đếm đúng, route chuẩn hóa `/api/ho-so/{id}`.
- Diễn tập bounded window sau khi sửa phép tính delta: 5 request, 0 lỗi 5xx, average 12,47 ms,
  current max 26,73 ms; verdict `PASS`.
- Caddy validate/reload Canary và Monolith đều pass; Basic Auth thiếu credential vẫn `401`.
- Trạng thái cuối admin config là monolith `127.0.0.1:8090`; service `8093` readiness `UP`.

Traffic diễn tập dùng request tổng hợp có tag canary để kiểm tra metric trong khi route live thực sự mở;
chưa coi đây là bằng chứng tải người dùng dài hạn. Cửa sổ 30 phút tiếp theo phải có traffic thật đủ mẫu
trước khi cân nhắc giữ/tăng read traffic. Write ownership vẫn ngoài phạm vi.

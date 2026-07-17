# Demo full-stack qua Runlocal

Runbook này chỉ dành cho demo/testing ngắn hạn. Tunnel miễn phí không có SLA, URL ngẫu nhiên thay đổi khi tiến trình tunnel được khởi động lại và máy dev phải luôn bật.

## 1. Cài công cụ một lần

```powershell
winget install --id CaddyServer.Caddy --exact
```

Máy cần Node.js/npm để chạy Runlocal. Script tunnel sẽ tải các package đã ghim phiên bản vào `%LOCALAPPDATA%\qtkhcn-demo\runlocal-runtime`, không ghi vào repository.

## 1.5. Release riêng biệt khỏi workspace code (bắt buộc)

Live demo **không bao giờ** được chạy trực tiếp từ workspace code (`C:\Users\phuctd7\ql-nvkhcn`) —
xem `docs/plan_deploy/standard-deploy-workflow.md`. Mọi bản deploy phải đi qua:

```powershell
# 1) Build + verify release mới trong thư mục riêng (không đụng demo đang sống)
& .\infra\demo-tunnel\New-DemoRelease.ps1
# In ra release-id, ví dụ 2026-07-16.1_fcb71c4

# 2) Cắt traffic sang release đó (dừng backend cũ trên 8090, khởi động release mới, đổi junction
#    C:\Users\phuctd7\qtkhcn-demo\current). Cần QTKHCN_DEV_API_KEY đã set trong terminal, giống
#    giá trị Caddy đang inject (infra/demo-tunnel/.env.local).
$env:QTKHCN_DEV_API_KEY = '<giá-trị-hiện-tại-Caddy-đang-dùng>'
& .\infra\demo-tunnel\Switch-DemoRelease.ps1 -ReleaseId '2026-07-16.1_fcb71c4'
```

`New-DemoRelease.ps1` tạo `git worktree` tại `C:\Users\phuctd7\qtkhcn-demo\releases\<release-id>`,
build backend (`mvn -o package`) + frontend (`npm ci` + `ng build production,demo`), kiểm tra bundle
không leak `localhost:8090`/`dev-local-only`, rồi health-check backend trên port tạm `8091` — hoàn
toàn không đụng port 8090/Caddy/Runlocal đang sống.

`Switch-DemoRelease.ps1` là script DUY NHẤT được phép dừng backend sống (port 8090). Người dùng
thật gián đoạn vài giây trong lúc backend mới khởi động (Flyway validate + Spring context). Caddy
luôn phục vụ từ junction `current` (xem `Start-DemoProxy.ps1` mặc định `-ReleaseRoot`), nên **không
cần đụng Caddy hay Runlocal** ở các lần deploy sau lần đầu tiên trỏ Caddy vào junction.

Giữ ít nhất 1 release cũ trong `releases\` để rollback: chạy lại
`Switch-DemoRelease.ps1 -ReleaseId <release-id-cũ>`.

## 2. Chuẩn bị stack nội bộ

Mọi Docker published port phải có tiền tố `127.0.0.1:`. Recreate container sau khi đổi Compose để binding mới có hiệu lực:

```powershell
cd infra/camunda
docker compose up -d --force-recreate
```

Khởi động backend trong terminal riêng bằng API key nội bộ ngẫu nhiên của phiên demo:

```powershell
$env:QTKHCN_DEV_API_KEY = -join ((1..48) | ForEach-Object { 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[(Get-Random -Maximum 62)] })
$env:QTKHCN_CORS_ALLOWED_ORIGINS = 'http://localhost:4200,https://<current-subdomain>.runlocal.eu'
$env:SERVER_ADDRESS = '127.0.0.1'
# Chạy backend bằng lệnh dev hiện có của dự án trong chính terminal này.
```

Giữ cùng `QTKHCN_DEV_API_KEY` cho Caddy. Đây là key giữa proxy và backend, không gửi cho end user và không ghi vào file tracked.

## 3. Build Angular demo

```powershell
cd frontend-angular
npm ci
npm run build -- --configuration=production,demo
cd ..
```

Demo build gọi `/api/*` cùng origin và không chứa dev API key.

## 4. Chạy Caddy

Trong terminal mới tại repository root:

```powershell
$env:QTKHCN_DEV_API_KEY = '<cùng-key-đã-dùng-khi-start-backend>'
$env:DEMO_BASIC_AUTH_HASH = caddy hash-password
& .\infra\demo-tunnel\Test-DemoReadiness.ps1
& .\infra\demo-tunnel\Start-DemoProxy.ps1
```

Read traffic của `/api/ho-so*` và `/api/nhiem-vu*` vẫn đi monolith theo mặc định. Chỉ sau khi backfill,
count/checksum và contract comparison đều xanh, start service mới rồi bật canary bằng switch tường minh:

```powershell
$env:QTKHCN_HO_SO_SERVICE_TOKEN = '<service-token>'
& .\infra\demo-tunnel\Start-DemoProxy.ps1 -EnableHoSoReadRoute
```

Không truyền switch (hoặc restart proxy không có switch) là rollback read-route về monolith. Mutation
routes luôn đi monolith trong lát này.

Sau khi Caddy đã chạy, ưu tiên reload không gián đoạn thay vì restart proxy:

```powershell
# Các secret được load từ .env.local vào process environment, không in ra console.
& .\infra\demo-tunnel\Switch-HoSoReadRoute.ps1 -Target Canary
& .\infra\demo-tunnel\Switch-HoSoReadRoute.ps1 -Target Monolith
```

Script kiểm tra readiness/API trước canary, validate trước reload, đối chiếu upstream qua Caddy admin và
giữ Basic Auth fail-closed. `Caddyfile.ho-so-canary-smoke` chỉ dành cho smoke Angular trên loopback
`127.0.0.1:8444`; không được nối listener này với Runlocal.

Không giữ canary mở thủ công. Dùng cửa sổ hữu hạn có metric và rollback tự động (mặc định 30 phút):

```powershell
& .\infra\demo-tunnel\Invoke-HoSoReadCanaryWindow.ps1 `
  -DurationMinutes 30 `
  -MinimumObservedRequests 5 `
  -MaximumServerErrorPercent 0 `
  -MaximumAverageLatencyMs 1000
```

Script chỉ tính request đi qua nhánh canary, kiểm tra readiness mỗi 30 giây, ghi report JSON ngoài repo
tại `C:\Users\phuctd7\qtkhcn-demo\observations` và luôn trả GET route về monolith. Không đủ request là
không đủ bằng chứng và bị đánh `FAIL`; mutation route không đổi trong toàn bộ cửa sổ.

`caddy hash-password` hỏi password tương tác. Có thể giữ một Basic Auth password ổn định giữa các lần deploy demo; chỉ rotate khi lộ/nghi ngờ lộ hoặc theo chính sách bảo mật.

Kiểm tra `http://127.0.0.1:8443`: thiếu hoặc sai Basic Auth phải nhận `401`.

## 5. Mở Runlocal tunnel

Sau khi smoke test local xanh, mở terminal khác:

```powershell
& .\infra\demo-tunnel\Start-DemoTunnel.ps1
```

Trên mạng doanh nghiệp dùng PAC/proxy, truyền HTTP proxy mà PAC chỉ định:

```powershell
& .\infra\demo-tunnel\Start-DemoTunnel.ps1 -ProxyUrl 'http://<proxy-host>:<proxy-port>'
```

Không commit địa chỉ proxy nội bộ. Script đặt `NO_PROXY` cho `127.0.0.1` để request từ tunnel tới Caddy không quay lại proxy doanh nghiệp.

Chỉ chia sẻ URL `https://*.runlocal.eu` sau khi kiểm tra công khai:

- Không có/sai Basic Auth trả `401`.
- UI, SPA fallback và `/api/ho-so` với auth đúng trả `200`.
- Không có trang consent hoặc credential phụ của nhà cung cấp tunnel.

Runlocal có request inspector dành cho người sở hữu URL quản trị của phiên. Không chia sẻ URL inspector; chỉ dùng dữ liệu demo/đã ẩn danh vì dịch vụ tunnel chấm dứt TLS ở edge.

## 6. Bật link trên GitHub Pages

Chỉ ghi HTTPS URL công khai vào `webapp/public/be-demo-link.json`; tuyệt đối không ghi username/password/hash, API key nội bộ, proxy URL hoặc inspector URL. Commit/push JSON theo quy trình Git của dự án.

## 7. Đóng phiên

1. Đưa URL trong `be-demo-link.json` về rỗng và deploy Pages.
2. Dừng `Start-DemoTunnel.ps1`/tiến trình Runlocal trước để cắt public access.
3. Dừng Caddy, backend và stack Docker nếu không còn dùng.
4. Rotate credential nếu cần và reset/restore dữ liệu demo.
5. Chạy `git status` để bảo đảm không có secret, log hoặc database dump chuẩn bị được commit.

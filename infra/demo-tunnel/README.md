# Demo full-stack qua Runlocal

Runbook này chỉ dành cho demo/testing ngắn hạn. Tunnel miễn phí không có SLA, URL ngẫu nhiên thay đổi khi tiến trình tunnel được khởi động lại và máy dev phải luôn bật.

## 1. Cài công cụ một lần

```powershell
winget install --id CaddyServer.Caddy --exact
```

Máy cần Node.js/npm để chạy Runlocal. Script tunnel sẽ tải các package đã ghim phiên bản vào `%LOCALAPPDATA%\qtkhcn-demo\runlocal-runtime`, không ghi vào repository.

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

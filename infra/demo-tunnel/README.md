# Demo gateway

Gateway phản ánh ranh giới service đã cutover hoàn toàn:

- `8093` — Service Quản lý NV KHCN: `/api/ho-so/**`, `/api/nhiem-vu/**`, `/api/my-tasks`,
  `/api/internal-integration/status`.
- `8090` — Service Quản trị quy trình: BPMN/DMN/eForm/Action Studio, process instance và
  `/api/tasks/{taskKey}/...`.
- Hai service trao đổi bằng internal API + transactional outbox/inbox; không gọi repository hoặc dùng
  chung database.

Không còn read/write canary, kill switch hoặc fallback về monolith. Nếu 8093 không healthy, gateway
fail-closed thay vì gửi API Hồ sơ sang 8090.

## Biến môi trường

```powershell
$env:QTKHCN_DEV_API_KEY = '<dev-api-key-của-8090>'
$env:QTKHCN_WORKFLOW_SERVICE_TOKEN = '<token-8093-gọi-8090>'
$env:QTKHCN_HO_SO_SERVICE_TOKEN = '<token-gateway/8090-gọi-8093>'
$env:DEMO_BASIC_AUTH_HASH = caddy hash-password
```

Không commit token thật. Cả hai service chỉ bind loopback; Caddy là ingress duy nhất của demo.

## Khởi động

Khởi động PostgreSQL/Camunda, Service Quy trình 8090 và Service NV KHCN 8093 trước. Sau đó:

```powershell
& .\infra\demo-tunnel\Test-DemoReadiness.ps1
& .\infra\demo-tunnel\Start-DemoProxy.ps1
```

`Start-DemoProxy.ps1` bắt buộc kiểm tra readiness và API thật của 8093 trước khi chạy Caddy. Không có
switch chọn upstream. UI được phục vụ tại `http://127.0.0.1:8443` và mọi `/api/*` được route theo owner.

## Release an toàn

```powershell
& .\infra\demo-tunnel\New-DemoRelease.ps1 -Commit <sha>
& .\infra\demo-tunnel\Switch-DemoRelease.ps1 -ReleaseId <release-id>
& .\infra\demo-tunnel\Test-DemoReadiness.ps1
```

Không build trực tiếp vào JAR đang bị tiến trình Java giữ khóa. Release được build trong worktree riêng.

## Tunnel

Sau khi smoke loopback xanh:

```powershell
& .\infra\demo-tunnel\Start-DemoTunnel.ps1
```

Basic Auth phải trả `401` khi thiếu/sai credential. Không mở trực tiếp các port 8090/8093 ra mạng ngoài.

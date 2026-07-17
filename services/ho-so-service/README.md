# qtkhcn-ho-so-service

Read-only scaffold của **Service NV KHCN & Hồ sơ**. Lát 2B đã bổ sung snapshot/backfill một chiều,
count/checksum reconciliation và contract comparison. Service chưa sở hữu write; read-route feature flag
ở gateway mặc định OFF.

## Runtime

- Java 21, Spring Boot 4.0.7, Maven Wrapper 3.9.9.
- Loopback port mặc định: `8093`.
- PostgreSQL database mặc định: `qtkhcn_ho_so`.
- Flyway là nguồn schema; Hibernate chỉ `validate`.
- API `/api/**` yêu cầu `Authorization: Bearer <service-token>`.
- Health probes không yêu cầu token:
  - `/actuator/health/liveness`
  - `/actuator/health/readiness`

## Environment

| Biến | Bắt buộc/mặc định |
|---|---|
| `JAVA_HOME` | JDK 21 |
| `QTKHCN_HO_SO_SERVICE_TOKEN` | Bắt buộc để gọi API; rỗng thì API fail-closed `401` |
| `QTKHCN_HO_SO_DB_URL` | `jdbc:postgresql://localhost:5432/qtkhcn_ho_so` |
| `QTKHCN_HO_SO_DB_USERNAME` | `qtkhcn` cho dev local |
| `QTKHCN_HO_SO_DB_PASSWORD` | `qtkhcn-dev-local` cho dev local |
| `QTKHCN_HO_SO_PORT` | `8093` |

Không commit token/credential thật. Gateway ở Lát 2B sẽ inject service credential; frontend không gọi trực
tiếp port 8093.

## Build và chạy local

```powershell
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot'
$env:QTKHCN_HO_SO_SERVICE_TOKEN='<local-secret>'
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

## API hiện có

- `GET /api/nhiem-vu`
- `GET /api/nhiem-vu/{ma}`
- `GET /api/ho-so`
- `GET /api/ho-so/{id}`

Không có POST/PUT/PATCH/DELETE ở Lát 2A.

## Lát 2B: backfill và các cổng đối soát

Các lệnh dùng PostgreSQL tools bên trong container `qtkhcn-postgres`; không cần cài `psql` trên host.

```powershell
# Xem trước thao tác thay thế dữ liệu phía đích
& .\scripts\Invoke-HoSoBackfill.ps1 -WhatIf

# Snapshot nhất quán từ qtkhcn, restore atomic vào qtkhcn_ho_so
& .\scripts\Invoke-HoSoBackfill.ps1

# Fail nếu count hoặc checksum của bất kỳ bảng nào lệch
& .\scripts\Test-HoSoDataParity.ps1

# Chạy khi monolith và service mới cùng hoạt động trên cùng snapshot
$env:QTKHCN_HO_SO_SERVICE_TOKEN = '<local-secret>'
& .\scripts\Compare-HoSoReadContracts.ps1 `
  -LegacyApiKey '<legacy-dev-key>'
```

Backfill chỉ đọc source, `TRUNCATE + COPY + sequence reset` phía target trong một transaction và có thể
chạy lặp. Script không dual-write và không ghi ngược về monolith.

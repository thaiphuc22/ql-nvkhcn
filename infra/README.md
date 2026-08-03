# Camunda 8 Self-Managed — dev stack local (Mốc 1, D16)

Stack dev local cho QTKHCN: Camunda 8 Self-Managed (bản chính thức, không tự chép tay lại) +
PostgreSQL riêng cho domain DB (D15). Đây **không phải** topology production — mô hình triển khai
production (SaaS vs Self-Managed K8s) vẫn còn mở, xem `.harness/state/decisions.md`.

> **Đã xác minh trực tiếp qua `github.com/camunda/camunda-distributions` (2026-07-15)**, không suy
> đoán từ kiến thức cũ: kể từ khoảng Camunda 8.6+, Zeebe/Operate/Tasklist đã **gộp vào 1 container
> `orchestration`** duy nhất (`camunda/camunda:<version>`), khác hẳn các bản trước 8.6 (Zeebe/
> Operate/Tasklist là 3 image/port riêng: 8081/8082). Bản lightweight mặc định dùng **H2 nhúng**
> làm storage, không bắt buộc Elasticsearch nữa. File dưới đây tham chiếu **camunda-8.9**
> (`CAMUNDA_VERSION=8.9.12` tại thời điểm viết) — kiểm tra lại thư mục
> `docker-compose/versions/` trong repo trên để lấy bản mới hơn nếu có khi thực sự triển khai.

## 1. Lấy bản Camunda chính thức (không tự chép tay)

File cấu hình gốc của Camunda có nhiều file phụ trợ (`configuration/*.yaml` cho H2/Elasticsearch,
`driver-lib/`, `connector-secrets.txt`...) — lấy nguyên cụm từ repo chính thức thay vì chép tay
từng phần để tránh sai lệch so với bản gốc đã được Camunda kiểm thử:

```bash
git clone --no-checkout --depth 1 --branch main https://github.com/camunda/camunda-distributions infra/camunda-src
cd infra/camunda-src
git sparse-checkout set docker-compose/versions/camunda-8.9
git checkout
cd ../..
mkdir -p infra/camunda
cp -r infra/camunda-src/docker-compose/versions/camunda-8.9/. infra/camunda/
rm -rf infra/camunda-src
```

Nếu máy không có `git sparse-checkout` (git cũ), tải trực tiếp thư mục qua giao diện web GitHub:
https://github.com/camunda/camunda-distributions/tree/main/docker-compose/versions/camunda-8.9

Sau bước này `infra/camunda/` có sẵn:
- `docker-compose.yaml` — bản **lightweight**: Orchestration (Zeebe+Operate+Tasklist gộp 1
  container, cổng gRPC 26500 / monitoring 9600 / REST+UI 8080) + Connectors (cổng 8086) + H2 embedded.
- `docker-compose-full.yaml` — thêm Optimize/Identity/Keycloak/Web Modeler/Postgres riêng cho
  Keycloak — **chưa cần ở Mốc 1** (SSO/IAM thật còn chờ OQ-021, xem `decisions.md`).
- `.env` — pin version (`CAMUNDA_VERSION`, `CAMUNDA_CONNECTORS_VERSION`...).
- `configuration/`, `driver-lib/` — file cấu hình nội bộ, giữ nguyên bản gốc.

## 2. Thêm PostgreSQL cho domain DB QTKHCN (D15)

Copy `infra/docker-compose.override.yml` (đã có sẵn trong thư mục này, tự viết, KHÔNG đụng file
Camunda gốc) vào `infra/camunda/`:

```bash
cp infra/docker-compose.override.yml infra/camunda/docker-compose.override.yml
```

Docker Compose tự merge `docker-compose.override.yml` cùng thư mục khi chạy `docker compose up`,
nên không cần chỉnh `docker-compose.yaml` gốc.

## 3. Chạy

```bash
cd infra/camunda
docker compose up -d
```

## 4. Verify (tiêu chí Mốc 1 — chưa DONE cho tới khi chạy được các bước dưới)

- `curl http://localhost:9600/actuator/health/status` → trạng thái `UP` (container `orchestration`).
- Mở `http://localhost:8080` → Operate/Tasklist UI cùng phục vụ qua container `orchestration`
  (khác các bản cũ có port 8081/8082 riêng).
- `docker exec -it qtkhcn-postgres psql -U qtkhcn -d qtkhcn -c '\dt'` chạy được (DB rỗng lúc này —
  bảng thật do Flyway ở Mốc 2 tạo, xem `active-task.md`).
- Deploy thử 1 BPMN qua Camunda REST API (`POST http://localhost:8080/v2/deployments`, multipart
  file) — endpoint chính xác nên đối chiếu lại `docs.camunda.io` tại thời điểm triển khai vì API
  có thể đổi giữa các phiên bản; đây là bước chứng minh cluster nhận được process definition, làm
  tiền đề cho Mốc 3 (deploy RD01.01 thật).

## Ghi chú khi chạy trên Windows (rút ra từ lần chạy thật 2026-07-15)

- **Docker Desktop cần WSL2 đủ mới** — nếu gặp lỗi "Your version of Windows Subsystem for Linux
  (WSL) is too old", chạy `wsl --update` (không cần quyền admin), mở lại Docker Desktop.
- **Đừng dùng `2>&1` với `docker compose up` trong Windows PowerShell 5.1** — log tải ảnh Docker ghi
  ra stderr, PowerShell 5.1 biến MỖI dòng stderr thành `ErrorRecord` và set `$?=$false` dù lệnh
  thật ra không lỗi, khiến tưởng nhầm là fail. Chạy thẳng `docker compose up -d` (không redirect),
  hoặc chạy nền nếu tải ảnh lâu, rồi `docker compose ps` để xác nhận trạng thái thật.
- **`docker-compose.override.yml` KHÔNG được khai báo lại `networks.camunda` với `external: true`**
  — network đó do chính `docker-compose.yaml` gốc của Camunda tạo (không phải tạo sẵn từ trước),
  khai báo `external: true` ở lần chạy đầu sẽ lỗi "declared as external, but could not be found".
  Chỉ cần service tham chiếu `networks: [camunda]`, không cần khai báo lại top-level `networks:`
  trong file override (Compose tự merge theo key với file gốc).

## Lưu ý bảo mật

- Mọi `ports:` của stack dev phải bind host `127.0.0.1` (ví dụ
  `127.0.0.1:8080:8080`), không dùng dạng `8080:8080` vì dạng đó mở listener trên mọi network
  interface. Sau khi đổi Compose phải recreate container và kiểm tra lại bằng
  `Get-NetTCPConnection -State Listen`.
- `.env`/`connector-secrets.txt` tải về từ bản gốc chỉ chứa giá trị demo
  (`demo-postgres-password`...) — **không dùng nguyên các giá trị này** nếu môi trường vượt ra khỏi
  máy dev cá nhân. `infra/camunda/` (tải về ở bước 1) nên thêm vào `.gitignore` của repo nếu chứa
  secret, thay vì commit nguyên bản tải về.

## Camunda engine cô lập cho Test BPMN

`Test BPMN` không deploy vào engine production/dev chính. Khởi động engine thứ hai bằng file profile
chủ đích (storage riêng, gRPC `26510`, REST `8092`, health `9610`, **không có Connectors**):

```powershell
cd infra/camunda
docker compose -f docker-compose.yaml -f docker-compose.override.yml `
  -f docker-compose.bpmn-test.yml up -d bpmn-test-orchestration
```

Sau khi health `UP`, bật backend bằng biến môi trường
`QTKHCN_BPMN_TEST_ENABLED=true`. Backend fail-closed nếu không bật engine này và tuyệt đối không
fallback sang Camunda chính. Definition thử được giữ trong volume test để audit; muốn reset retention
thì chỉ xóa hai volume `bpmn-test-*` khi không còn session cần điều tra — không xóa history engine chính.

Smoke tổng có thể tự start/stop service test engine này (không xóa volume) nếu nó chưa chạy:

```powershell
cd backend
.\scripts\smoke-bpmn-lifecycle.ps1 -ApiBase http://localhost:8091
```

Script yêu cầu `orchestration` và `qtkhcn-postgres` production-dev đã chạy; nó không start/stop hay
xóa hai container đó.

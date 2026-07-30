# Tài liệu API — Use case "Đồng bộ quy trình từ Camunda"

> Đi kèm [`sequence-dong-bo-quy-trinh-tu-camunda.md`](./sequence-dong-bo-quy-trinh-tu-camunda.md).
> Tài liệu này liệt kê **chính xác** những API Camunda mà use case gọi, contract của chúng, và API
> nội bộ của app phơi ra cho FE.
>
> **Nguồn kiểm chứng (2026-07-28):** tên trường/đường dẫn dưới đây được trích trực tiếp từ bytecode
> của `io.camunda:camunda-client-java:8.9.12` trong `~/.m2` — đúng phiên bản backend đang biên dịch,
> nên đây là contract thật của dự án chứ không phải trí nhớ về tài liệu. Trang spec trên
> `docs.camunda.io` **không truy cập được từ máy này** (ECONNREFUSED), các mục đánh dấu
> ⚠️ *chưa xác minh* là những chỗ cần mở tài liệu chính thức đối chiếu.

## 0. Stack đang chạy

| Thành phần | Giá trị | Nguồn |
|---|---|---|
| Camunda | **8.9.12** Self-Managed, container hợp nhất `orchestration` (Zeebe+Operate+Tasklist) | `infra/README.md`, `backend/pom.xml` (`<camunda.version>`) |
| Client | `io.camunda:camunda-spring-boot-starter:8.9.12` (bean `CamundaClient`) | `backend/pom.xml` |
| REST base | `http://localhost:8080` → SDK tự nối `/v2` | `application.yml` → `camunda.client.rest-address` |
| gRPC | `http://localhost:26500` (use case này **không** dùng) | `application.yml` → `camunda.client.grpc-address` |
| Auth mode | `self-managed`, **chưa bật OIDC** ở dev | `application.yml` → `camunda.client.mode` |

> Từ 8.8, cụm API `/v2` được đặt tên là **Orchestration Cluster REST API** và thay thế các API riêng
> của Operate/Tasklist/Zeebe. Use case này thuộc hẳn nhóm `/v2` — không dùng Operate API cũ
> (`/v1/process-definitions/search`).

## 1. Bảng ánh xạ: code → REST API

| Code trong dự án | Java SDK | REST API Camunda |
|---|---|---|
| `CamundaProcessDefinitionLookup.listLatest(500)` | `newProcessDefinitionSearchRequest()` | `POST /v2/process-definitions/search` |
| `CamundaProcessDefinitionLookup.fetchXml(key)` | `newProcessDefinitionGetXmlRequest(key)` | `GET /v2/process-definitions/{processDefinitionKey}/xml` |
| `CamundaProcessDefinitionLookup.findLatest(id)` *(dùng ở luồng deploy lúc khởi động, không thuộc use case này)* | `newProcessDefinitionSearchRequest()` | `POST /v2/process-definitions/search` |

Use case đồng bộ **chỉ đọc** — không gọi `POST /v2/deployments`, không tạo instance.

---

## 2. `POST /v2/process-definitions/search`

Tìm process definition trên engine. Trong use case này dùng để liệt kê **bản mới nhất của mọi quy trình**.

### 2.1 Request

```http
POST http://localhost:8080/v2/process-definitions/search
Content-Type: application/json
```

```json
{
  "filter": { "isLatestVersion": true },
  "page":   { "limit": 500 }
}
```

**`filter`** — các trường hợp lệ (xác minh từ `protocol.rest.ProcessDefinitionFilter`):

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `processDefinitionId` | string | Chính là `bpmn:process/@id` — **không phải** khoá số |
| `processDefinitionKey` | integer (int64) | Khoá kỹ thuật do engine sinh |
| `name` | string | Tên hiển thị của process |
| `resourceName` | string | Tên file `.bpmn` lúc deploy |
| `version` | integer | Số version engine tăng dần theo `processDefinitionId` |
| `versionTag` | string | Nhãn version tự đặt trong BPMN |
| `tenantId` | string | Multi-tenancy |
| `isLatestVersion` | boolean | **Trường use case này dùng** |
| `hasStartForm` | boolean | |

**`page`** — `from`, `limit`, `after`, `before` (xác minh từ `protocol.rest.SearchQueryPageRequest`).
Hai kiểu phân trang: offset (`from`/`limit`) và cursor (`after`/`before`). Code hiện chỉ dùng `limit`.

**`sort`** — mảng `{ field, order }`; use case này không dùng (không phụ thuộc thứ tự).

### 2.2 Response

```json
{
  "items": [
    {
      "processDefinitionId": "rd0202",
      "name": "RD02.02 — Xét duyệt nhiệm vụ",
      "resourceName": "rd0202.bpmn",
      "version": 3,
      "versionTag": null,
      "processDefinitionKey": "2251799813685249",
      "tenantId": "<default>",
      "hasStartForm": false
    }
  ],
  "page": {
    "totalItems": 27,
    "hasMoreTotalItems": false,
    "startCursor": "...",
    "endCursor": "..."
  }
}
```

Ánh xạ vào record của dự án — `CamundaProcessDefinitionLookup.DeployedProcessDefinition`:

| REST | Java SDK getter | Record field |
|---|---|---|
| `processDefinitionId` | `getProcessDefinitionId()` | `bpmnProcessId` |
| `name` | `getName()` | `name` *(có thể null — BPMN không bắt buộc đặt tên)* |
| `resourceName` | `getResourceName()` | `resourceName` |
| `version` | `getVersion()` | `version` |
| `processDefinitionKey` | `getProcessDefinitionKey()` | `processDefinitionKey` — **khoá đối chiếu idempotency của importer** |
| `page.totalItems` | `page().totalItems()` | `DeployedProcessPage.totalOnEngine` |

### 2.3 ⚠️ Ba cạm bẫy của endpoint này với use case

1. **Response KHÔNG có `deploymentKey`.** Đây là lý do
   `DeployedProcessImportWriter` ghi `camundaDeploymentKey = 0`. Muốn có deployment key thật thì phải
   đổi sang đường khác (`GET /v2/deployments/...` hoặc lưu lúc deploy) — hiện chấp nhận `0` vì cột này
   chỉ để truy vết ngược lên Operate.
2. **`page.hasMoreTotalItems` đang bị bỏ qua.** Code so `totalItems > items.size()` để cảnh báo lượt
   quét bị cắt. Nếu engine có nhiều definition hơn ngưỡng đếm nội bộ thì `totalItems` là số bị chặn và
   `hasMoreTotalItems = true` mới là tín hiệu đúng — ⚠️ *ngưỡng cụ thể của 8.9 chưa xác minh*, cần đối
   chiếu tài liệu trước khi coi cảnh báo hiện tại là đủ.
3. **`tenantId` không được lọc.** Engine bật multi-tenancy sẽ trả definition của mọi tenant mà token
   nhìn thấy, và importer kéo hết về một catalog phẳng. Chưa thành vấn đề vì dev chạy `<default>`.

---

## 3. `GET /v2/process-definitions/{processDefinitionKey}/xml`

```http
GET http://localhost:8080/v2/process-definitions/2251799813685249/xml
Accept: text/xml
```

Trả **BPMN XML thô** (không bọc JSON). Bắt buộc với importer vì:
- `process_definition_version.bpmn_xml` là `NOT NULL`;
- `DeployedBpmnRoutingReader` đọc chính cột này để dựng bước/route — nhập mà thiếu XML thì quy trình
  vào catalog nhưng **không sinh được bước nào**.

Tham số là `processDefinitionKey` (khoá số từ bước search), **không phải** `bpmnProcessId`.

Mã lỗi cần xử lý: `404` (key không tồn tại / đã xoá), `401`–`403` (token), `5xx`. Trong code, mọi lỗi
ở đây bị bọc thành `ProcessImportException(kind = DEPLOYMENT)` rồi rơi vào `failures[]` của lượt đồng
bộ — **không** làm hỏng các quy trình khác.

---

## 4. Xác thực

### 4.1 Dev hiện tại — KHÔNG có auth

`application.yml` chỉ khai `mode: self-managed` + địa chỉ, không có khối `auth`. Engine dev chạy
lightweight không bật OIDC nên request `/v2` đi thẳng. **Chỉ hợp lệ trên máy dev** (`server.address:
127.0.0.1`).

### 4.2 Khi bật OIDC (staging/production)

```yaml
camunda:
  client:
    mode: self-managed
    auth:
      method: oidc
      client-id: ${CAMUNDA_CLIENT_ID}
      client-secret: ${CAMUNDA_CLIENT_SECRET}
      issuer-url: http://<keycloak>/auth/realms/camunda-platform
      audience: <client id của Orchestration Cluster>
      scope: <audience>
    grpc-address: http://<host>:26500
    rest-address: http://<host>:8080
```

SDK tự lấy token qua **OAuth2 client credentials** và cache — code trong dự án không đụng tới token.

⚠️ *Chưa xác minh:* quyền cần cấp cho client. Camunda 8.8+ có mô hình authorization theo resource
`PROCESS_DEFINITION`; đồng bộ là thao tác **read-only** nên cần quyền đọc process definition + đọc
XML. Tên permission chính xác phải tra tài liệu trước khi cấu hình Identity — đừng cấp `*` cho tiện.

> Lưu ý bảo mật của use case: người bấm nút chỉ cần quyền trong app QTKHCN; quyền trên Camunda là của
> **service account backend**, không phải của người dùng. Nghĩa là bất kỳ ai vào được màn `/quy-trinh`
> đều kéo được **toàn bộ** process definition trên engine về catalog. Đây là hệ quả có chủ ý của
> quyết định "chủ động bấm nút" — và là lý do nó không được chạy nền.

---

## 5. API nội bộ của app

### `POST /api/process-definitions/sync-from-camunda`

| | |
|---|---|
| Controller | `ProcessDefinitionController.syncFromCamunda` |
| Body | *(rỗng)* |
| Header | `X-QTKHCN-Actor: <tên người thao tác, đã encode>` — tuỳ chọn, dùng ghi audit `importedBy` |
| Vì sao POST | Có ghi dữ liệu (INSERT catalog + version), không idempotent về mặt audit |

**Response `200` — `ProcessSyncResponse`:**

```json
{
  "scanned": 27,
  "imported": 4,
  "alreadyKnown": 22,
  "importedProcesses": [
    {
      "catalogId": "…uuid…",
      "versionId": "…uuid…",
      "bpmnProcessId": "rd0505",
      "name": "RD05.05 — Nghiệm thu",
      "version": 2,
      "newCatalog": true
    }
  ],
  "failures": [
    { "bpmnProcessId": "rd_test_bo", "message": "…root cause…" }
  ],
  "warnings": [
    "Engine đang có 640 quy trình nhưng lượt này chỉ quét 500 — chạy lại sau khi nhập xong đợt đầu."
  ]
}
```

| Trường | Ý nghĩa |
|---|---|
| `scanned` | Số definition (bản mới nhất) đọc được từ engine trong lượt này |
| `imported` | Số dòng version mới ghi vào catalog |
| `alreadyKnown` | Số definition catalog đã biết (khớp `camundaProcessDefinitionKey`) |
| `importedProcesses[].newCatalog` | `true` = quy trình hoàn toàn mới; `false` = version mới của quy trình đã có |
| `failures[]` | Lỗi **từng quy trình** — lượt đồng bộ vẫn trả `200` |
| `warnings[]` | Cảnh báo mức lượt quét (hiện chỉ có "bị cắt theo `MAX_SCAN`") |

**Response lỗi:** chỉ khi *bước quét* hỏng (engine không tới được / 401 / timeout) →
`ProcessImportException(kind = DEPLOYMENT)` → `GlobalExceptionHandler`. FE hiển thị
`"Đồng bộ từ Camunda thất bại"`.

### Nhận biết bản nhập từ Camunda

Dòng ghi ra mang `source = EXTERNAL` (so với `IMPORTED`/deploy qua app) và
`status = DEPLOYED` — dùng để lọc/hiển thị ở màn `/quy-trinh`.

---

## 6. Tái hiện bằng `curl` (debug khi đồng bộ ra kết quả lạ)

```bash
# 1. Engine đang thực sự có những gì?
curl -s -X POST http://localhost:8080/v2/process-definitions/search \
  -H 'Content-Type: application/json' \
  -d '{"filter":{"isLatestVersion":true},"page":{"limit":500}}' | jq '.page, [.items[].processDefinitionId]'

# 2. XML của một definition cụ thể
curl -s http://localhost:8080/v2/process-definitions/2251799813685249/xml

# 3. Gọi chính API đồng bộ của app
curl -s -X POST http://127.0.0.1:8090/api/process-definitions/sync-from-camunda \
  -H 'X-QTKHCN-Actor: Nguyen%20Van%20A' | jq
```

Nếu (1) có quy trình mà sau (3) `imported = 0` và `alreadyKnown` tăng → catalog đã giữ đúng
`camundaProcessDefinitionKey` đó, đây là hành vi đúng chứ không phải lỗi.

---

## 7. Tài liệu Camunda chính thức

| Chủ đề | URL |
|---|---|
| Orchestration Cluster REST API — tổng quan | https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview/ |
| Xác thực API | https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-authentication/ |
| Data fetching / phân trang | https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-data-fetching/ |
| Get process definition | https://docs.camunda.io/docs/apis-tools/orchestration-cluster-api-rest/specifications/get-process-definition/ |
| Camunda Spring Boot Starter | https://docs.camunda.io/docs/apis-tools/camunda-spring-boot-starter/getting-started/ |
| Migrate to the Orchestration Cluster API (bỏ Operate API `/v1`) | https://docs.camunda.io/docs/apis-tools/migration-manuals/migrate-to-camunda-api/ |
| Release announcements 8.9 | https://docs.camunda.io/docs/reference/announcements-release-notes/890/890-announcements/ |
| Docker distribution 8.9 (khớp `infra/`) | https://github.com/camunda/camunda-distributions/tree/main/docker-compose/versions/camunda-8.9 |

## 8. Việc còn treo

- [ ] Đối chiếu tài liệu chính thức để chốt **tên permission** cần cấp cho service account (mục 4.2).
- [ ] Xác minh ngưỡng `totalItems` và dùng `page.hasMoreTotalItems` thay cho phép so hiện tại (mục 2.3.2).
- [ ] Quyết định có lọc `tenantId` hay không trước khi engine bật multi-tenancy (mục 2.3.3).
- [ ] Cân nhắc lấy `deploymentKey` thật nếu màn Đối soát cần deep-link sang Operate (mục 2.3.1).

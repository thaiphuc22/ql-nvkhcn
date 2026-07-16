# QTKHCN backend (D14) — Spring Boot + Camunda 8

Java 21 + Spring Boot + Camunda 8 Java SDK (`io.camunda:camunda-spring-boot-starter`) + PostgreSQL/
Flyway (D15). Backend và luồng RD01.01 đã được build, chạy và kiểm chứng với stack local thật.

## Điều kiện chạy

1. **Hạ tầng Mốc 1 phải chạy trước**: xem `../infra/README.md` — `docker compose up -d` (Camunda
   Self-Managed dev + `qtkhcn-postgres`). Backend trỏ mặc định vào `localhost:5432` (Postgres) và
   `localhost:26500`/`localhost:8080` (Camunda orchestration container), khớp `application.yml`.
2. JDK 21, Maven (xem hướng dẫn cài đặt trong lịch sử hội thoại hoặc `active-task.md`).

## Chạy

```bash
cd backend
mvn spring-boot:run
```

Flyway tự chạy các migration khi khởi động. `ProcessDeploymentRunner` tra BPMN process id `RD01_01`
trên Camunda: engine trống thì deploy `processes/rd0101.bpmn` đúng một lần; definition đã tồn tại thì
skip và log version/key. Runner fail-closed nếu không truy vấn được Camunda, không đoán rồi tạo version
mới. Muốn cập nhật BPMN đóng gói phải gọi import API có chủ đích.

## Gọi thử API (mọi request cần header `X-QTKHCN-Dev-Key: dev-local-only`, xem
`security/DevApiKeyFilter.java`)

```bash
# Tạo Nhiệm vụ mới
curl -X POST http://localhost:8090/api/nhiem-vu \
  -H "X-QTKHCN-Dev-Key: dev-local-only" -H "Content-Type: application/json" \
  -d '{"ten":"Thử nghiệm tích hợp Mốc 2","cap":"CS","chuNhiemHoTen":"Nguyễn Văn A","donViChuTri":"TT Thử nghiệm"}'

# Tạo hồ sơ draft cho Nhiệm vụ vừa tạo (thay <ma> bằng mã trả về ở trên, vd RD.2026.032)
curl -X POST http://localhost:8090/api/ho-so \
  -H "X-QTKHCN-Dev-Key: dev-local-only" -H "Content-Type: application/json" \
  -d '{"maNV":"<ma>","nguoiKhoiTao":"Nguyễn Văn A"}'

# Gửi duyệt (thay <id> bằng mã hồ sơ trả về, vd HS-2026-001) — nếu Camunda (Mốc 1) đang chạy,
# đây là bước thật sự khởi tạo process instance RD01.01 trên Zeebe (Mốc 3).
curl -X POST http://localhost:8090/api/ho-so/<id>/submit \
  -H "X-QTKHCN-Dev-Key: dev-local-only" -H "Content-Type: application/json" \
  -d '{"quyTrinh":"RD01.01","quyTrinhTen":"Xét duyệt Chủ trương cấp Cơ sở"}'

# Xử lý bước hiện tại (đồng ý). Contract API không đổi; bên trong backend sẽ hoàn tất
# io.camunda.zeebe:userTask tương ứng trước khi cập nhật PostgreSQL.
curl -X POST http://localhost:8090/api/ho-so/<id>/actions \
  -H "X-QTKHCN-Dev-Key: dev-local-only" -H "Content-Type: application/json" \
  -d '{"outcome":"APPROVE_STEP","actor":"Đ/c Lê Minh Quang","yKien":"Đồng ý trình xét duyệt."}'
```

## Import và deploy `.bpmn`

API nhận đúng một process executable trong mỗi file, giới hạn 5 MB, chặn DTD/external entity và chỉ
ghi catalog/version sau khi Camunda trả kết quả deploy thành công. Header `X-QTKHCN-Actor` là metadata
audit tùy chọn trong môi trường dev, chưa phải danh tính đã xác thực.

```bash
curl -X POST http://localhost:8090/api/process-definitions/import \
  -H "X-QTKHCN-Dev-Key: dev-local-only" \
  -H "X-QTKHCN-Actor: Nguyen Van A" \
  -F "file=@./my-process.bpmn;type=application/xml"

curl -H "X-QTKHCN-Dev-Key: dev-local-only" \
  http://localhost:8090/api/process-definitions

curl -H "X-QTKHCN-Dev-Key: dev-local-only" \
  http://localhost:8090/api/process-definitions/<catalog-id>

curl -H "X-QTKHCN-Dev-Key: dev-local-only" \
  http://localhost:8090/api/process-definitions/<catalog-id>/versions
```

Import thành công trả HTTP 201 với `id`, `versionId`, `bpmnProcessId`, `name`, `resourceName`,
`camundaDeploymentKey`, `camundaProcessDefinitionKey`, `version`, `status`, checksum, actor/time và
`warnings`. Detail/version response có thêm `bpmnXml` để UI xem lại sau reload. Lỗi file/XML trả HTTP
400; Camunda từ chối hoặc không sẵn sàng trả HTTP 422. Hai loại đều
có contract ổn định:

**Import lại đúng nội dung BPMN cũ** (không sửa gì) trả HTTP 422, không phải 500: Zeebe deploy là
content-addressable, nội dung byte-giống-hệt trả về CÙNG `processDefinitionKey` thay vì tạo version
engine mới, và `ProcessDefinitionService` phát hiện key đó đã có sẵn trong `process_definition_version`
trước khi insert (tránh vỡ unique constraint `camunda_process_definition_key`). Phát hiện thật khi verify
`/quy-trinh` Angular ngày 2026-07-15 — trước bản sửa này, bấm "Nhập từ .bpmn" lần 2 với cùng file sẽ ra
lỗi 500 thô trên UI.

```json
{"message":"File BPMN không hợp lệ.","errors":["Tên file phải có phần mở rộng .bpmn."]}
```

Đã kiểm chứng thật ngày 2026-07-15: Flyway đến V3, import qua business API, catalog còn trong
PostgreSQL, Camunda REST tìm thấy đúng definition/version và tạo được process instance từ version vừa
import. Hardening suite hiện có 17 test, gồm HTTP 201/list/detail/versions/XML, error envelope 400/422,
API key/CORS preflight, Camunda failure và startup deploy if-absent.

## Verify hardening và smoke real stack

```powershell
cd backend
$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot'
mvn verify
.\scripts\smoke-process-import.ps1
```

Smoke import này không dùng mock và fail loud nếu thiếu `orchestration`, `qtkhcn-postgres`, JDK/JAR hoặc
port 8090 đang bị chiếm. Chuỗi kiểm tra: startup không tăng version → import API tạo đúng một engine
version → PostgreSQL có version/correlation keys/XML → Camunda tạo process instance → restart backend
không tăng version → read API vẫn trả XML. Script chủ đích import BPMN nên mỗi lần chạy thành công sẽ
tạo đúng một version Camunda/catalog mới; tuy nhiên re-import byte-identical hiện trả 422 đúng thiết kế,
nên script này chỉ phù hợp khi bundled BPMN vừa thay đổi. Để chạy smoke lặp lại mà không sửa file source,
dùng `scripts/smoke-bpmn-lifecycle.ps1` ở mục Lát C.

Evidence lần chạy 2026-07-15: startup giữ v3, import tạo v4 (`processDefinitionKey=2251799813689491`),
process instance key `2251799813689492`, restart giữ nguyên v4; catalog
`d877084c-005f-4ee6-aa69-a2d9fecc62fc` đọc lại được XML.

## Chỉnh sửa và lưu nháp BPMN (Lát A)

Danh sách nhẹ cho màn hình quản lý (không trả `bpmnXml` hoặc revisions) dùng
`GET /api/process-definition-drafts`. Kết quả luôn sắp xếp `updatedAt DESC` và hỗ trợ các query param
tùy chọn `status=DRAFT|VALID|INVALID|DEPLOYED`, `bpmnProcessId=<exact-id>` và `q=<tên-hoặc-mã>`:

```bash
curl -H "X-QTKHCN-Dev-Key: dev-local-only" \
  "http://localhost:8090/api/process-definition-drafts?status=DRAFT&bpmnProcessId=Process_RD0202"
```

Angular `/quy-trinh` hiển thị riêng tab `Bản nháp` và `Đã deploy`. Import thành công reload và mở
draft vừa tạo; mã trùng phải được người dùng xác nhận. Validate và deploy là hai action riêng, đều gửi
`expectedRevision`; nút deploy hiện chỉ bật cho tài khoản admin demo. Backend vẫn chỉ có dev API key,
chưa phải RBAC production.

Draft là dữ liệu mutable riêng, không phải `ProcessDefinitionVersion`. Tạo, sửa, đọc lại và validate
draft không gọi Camunda. Mỗi mutation tạo snapshot audit bất biến; save có nội dung/metadata giống hệt
trả nguyên `revision`. Client phải gửi `expectedRevision` cho update/validate/deploy; revision cũ trả
HTTP 409 thay vì ghi đè. Chỉ endpoint `/deploy` mới phát hành thành version immutable.

```bash
# Tạo draft (HTTP 201)
curl -X POST http://localhost:8090/api/process-definition-drafts \
  -H "X-QTKHCN-Dev-Key: dev-local-only" -H "X-QTKHCN-Actor: editor-a" \
  -H "Content-Type: application/json" \
  -d '{"resourceName":"demo.bpmn","bpmnProcessId":"demo","name":"Demo","bpmnXml":"<definitions>...</definitions>"}'

# Đọc current state và revisions[] (có XML/checksum/actor/timestamp của từng snapshot)
curl -H "X-QTKHCN-Dev-Key: dev-local-only" \
  http://localhost:8090/api/process-definition-drafts/<draft-id>

# Lưu chỉnh sửa; dùng revision vừa đọc
curl -X PUT http://localhost:8090/api/process-definition-drafts/<draft-id> \
  -H "X-QTKHCN-Dev-Key: dev-local-only" -H "X-QTKHCN-Actor: editor-b" \
  -H "Content-Type: application/json" \
  -d '{"expectedRevision":0,"resourceName":"demo.bpmn","bpmnProcessId":"demo","name":"Demo","bpmnXml":"<definitions>...</definitions>"}'

# Validate tại chỗ, tuyệt đối không deploy
curl -X POST http://localhost:8090/api/process-definition-drafts/<draft-id>/validate \
  -H "X-QTKHCN-Dev-Key: dev-local-only" -H "Content-Type: application/json" \
  -d '{"expectedRevision":1}'

# Phát hành có chủ đích (đây là endpoint duy nhất trong draft API gọi Camunda)
curl -X POST http://localhost:8090/api/process-definition-drafts/<draft-id>/deploy \
  -H "X-QTKHCN-Dev-Key: dev-local-only" -H "Content-Type: application/json" \
  -d '{"expectedRevision":2}'
```

Draft đã deploy không sửa lại được; tạo draft mới nếu cần phát triển version tiếp theo. Có thể có nhiều
draft cho cùng `bpmnProcessId`, còn uniqueness/versioning production vẫn do catalog và Camunda quản lý.
Khóa pessimistic theo draft kết hợp JPA `@Version` bảo đảm hai editor/deployer song song không cùng vượt
qua `expectedRevision`. Rủi ro phân tán Camunda-success/DB-commit-failure vẫn là hạng mục outbox/reconcile
Mốc 6+, giống import API hiện hữu.

## Quản lý luật và phiên bản DMN (Lát A)

API `/api/dmn-rules` quản lý metadata luật và snapshot `dmnXml` trong PostgreSQL. Lát này **không deploy
DMN lên Camunda và không evaluate decision**. `X-QTKHCN-Actor` chỉ dùng cho audit.

- `POST /api/dmn-rules`: tạo metadata luật ở trạng thái `DRAFT`, `latestVersion=0`.
- `GET /api/dmn-rules?status=&category=&q=`: danh sách nhẹ, không trả XML.
- `GET /api/dmn-rules/{id}`: metadata cùng lịch sử version nhẹ.
- `POST /api/dmn-rules/{id}/versions`: lưu snapshot XML bất biến mới; body gồm
  `expectedVersion`, `dmnXml`, `changeNote`.
- `GET /api/dmn-rules/{id}/versions` và `GET /api/dmn-rules/{id}/versions/{version}`: danh sách nhẹ
  và artifact đầy đủ.
- `POST /api/dmn-rules/{id}/versions/{version}/activate`: trỏ `activeVersion` vào một snapshot đã có.
- `POST /api/dmn-rules/{id}/disable`: bỏ con trỏ active và chuyển luật sang `DISABLED`.

`latestVersion` và `activeVersion` cố ý tách nhau: có thể lưu v4 trong khi runtime vẫn đang dùng v3.
Mọi mutation version/lifecycle gửi `expectedVersion` bằng latest version client vừa đọc; stale request
trả HTTP 409. Version không có endpoint update/delete. XML được parse với DTD/external entity bị chặn,
phải có root DMN `definitions`, ít nhất một `decision` và `decisionTable`; lỗi trả HTTP 400
`{message,errors[]}`. Mã luật trùng trả HTTP 409.

## Test BPMN session cô lập (Lát B)

Test BPMN dùng **Camunda engine thứ hai**, storage và cổng riêng, không có Connectors/production
workers. Backend mặc định `qtkhcn.bpmn-test.enabled=false` và không fallback sang engine chính; startup
cũng từ chối nếu gRPC hoặc REST address test trùng address production. Xem lệnh khởi động engine tại
`infra/README.md`, sau đó đặt `QTKHCN_BPMN_TEST_ENABLED=true`.

```bash
# Tạo session từ đúng một immutable draft revision (HTTP 201)
curl -X POST http://localhost:8090/api/bpmn-tests \
  -H "X-QTKHCN-Dev-Key: dev-local-only" -H "X-QTKHCN-Actor: tester-a" \
  -H "Content-Type: application/json" \
  -d '{"draftId":"<uuid>","revision":2,"variables":{"input":"safe"},"ttlSeconds":900}'

# Snapshot: status/currentElements/tasks/variables/incidents/blockedJobs
curl -H "X-QTKHCN-Dev-Key: dev-local-only" http://localhost:8090/api/bpmn-tests/<session-id>

# Hoàn tất task active thuộc đúng instance của session
curl -X POST http://localhost:8090/api/bpmn-tests/<session-id>/tasks/<task-key>/complete \
  -H "X-QTKHCN-Dev-Key: dev-local-only" -H "Content-Type: application/json" \
  -d '{"variables":{"decision":"approve"}}'

# Cancel instance và kết thúc session
curl -X DELETE -H "X-QTKHCN-Dev-Key: dev-local-only" \
  http://localhost:8090/api/bpmn-tests/<session-id>
```

Session có correlation variable bắt buộc `qtkhcnTestCorrelationId`, actor/timestamps, TTL mặc định 15
phút (tối đa 1 giờ) và terminal states `COMPLETED|CANCELLED|TIMED_OUT|FAILED`. Worker type ngoài
allowlist mock (hiện allowlist rỗng) xuất hiện dưới `blockedJobs` và đưa session sang `BLOCKED`, không
được giả lập success. Test definition được giữ trong volume engine test cho audit; cleanup session chỉ
cancel instance, không tuyên bố xóa Camunda history. Reset volume test là thao tác vận hành có chủ đích,
không bao giờ đụng version/history engine chính.

## Lát C — failure/security coverage và smoke DoD tổng

```powershell
cd backend
$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot'
mvn clean verify
.\scripts\smoke-bpmn-lifecycle.ps1 -ApiBase http://localhost:8091
```

`smoke-bpmn-lifecycle.ps1` là chuỗi real-stack lặp lại được cho toàn bộ vòng đời: kiểm tra API key và
Angular CORS preflight; tạo + validate immutable draft; chạy đúng revision trên engine test; xác nhận
definition chưa xuất hiện ở production; complete user task đến `COMPLETED`; deploy draft có chủ đích
sang production; restart backend và xác nhận không sinh thêm version, draft/version correlation còn
nguyên và `RD01_01` không đổi. Script tự bật/tắt test engine nếu nó chưa chạy, chỉ dừng backend/test
engine do chính script khởi động, giữ volume test cho audit. Process smoke dùng id cố định và comment
run-id nên mỗi lần thành công tạo đúng một version mới, không vướng content-addressable redeploy.

Failure/security suite khóa thêm: XML sai và variables không phải JSON object; variables không
serialize được; TTL max + scheduler `TIMED_OUT`; incident snapshot; engine unavailable khi
deploy/snapshot/complete/cancel; API key sai/thiếu; CORS origin allow/deny; stable 400 envelopes. Toàn
bộ contract import/draft/HoSo cũ vẫn chạy trong cùng `mvn clean verify` để phát hiện regression.

DoD của cụm **Lát A + B + C** được coi là đạt khi cả hai lệnh trên xanh. Đây không thay cho các gap
Foundation còn mở như OIDC/SAML thật, outbox/reconcile giao dịch phân tán và topology production.

## Sửa incident CONDITION_ERROR tại chỗ (Nâng cấp UX Test BPMN, 2026-07-16)

Khi một test session dừng ở gateway với incident `CONDITION_ERROR` (không luồng nào thoả điều kiện
và không có default flow), có thể sửa biến và cho engine đánh giá lại **trên cùng session/instance**
— không cần tạo session mới:

```bash
# variables ghi đè/thêm vào scope process instance của session, sau đó incidentKey được resolve
curl -X POST http://localhost:8090/api/bpmn-tests/<session-id>/incidents/<incident-key>/resolve \
  -H "X-QTKHCN-Dev-Key: dev-local-only" -H "Content-Type: application/json" \
  -d '{"variables":{"decision":"approve"}}'
```

`BpmnTestEngineGateway.setVariables()`/`resolveIncident()` gọi thẳng `client.newSetVariablesCommand()`
rồi `client.newResolveIncidentCommand()` của Zeebe, theo đúng thứ tự. Bản đầu tiên dùng
`processInstanceKey` làm scope biến (cấp process instance) — chưa hỗ trợ scope theo flow-scope con
(subprocess/multi-instance). Session terminal hoặc engine từ chối trả HTTP 409 fail-closed, giữ
`failureMessage` để audit; instance/`processInstanceKey` không đổi trong toàn bộ quá trình.

`ProcessDefinitionImportValidator` (bước "Kiểm tra BPMN") trả `issues[]` ổn định với các trường
`code`, `severity` (`ERROR|WARNING|SUGGESTION`), `message`, `elementId`, `elementName`. `errors[]` và
`warnings[]` vẫn được giữ trong giai đoạn chuyển tiếp. ERROR làm draft thành `INVALID` và chặn cả chạy thử
lẫn deploy; WARNING/SUGGESTION không chặn. Bộ lint hiện kiểm tra XML/process, ID và sequence-flow, Start/End,
unreachable/dead-end, gateway/condition/default flow, User Task assignment/form, Service Task job type/retry,
Call Activity, Boundary Event và các gợi ý đặt tên/nhãn. Rule cần registry thật (form, candidate group,
service-task binding, called process) vẫn được tách khỏi lint XML tĩnh để bổ sung khi registry sẵn sàng.

`scripts/smoke-condition-error-resolve.ps1` là smoke thật lặp lại được cho toàn chuỗi: tạo draft có
gateway `Gateway_133yb7i` cố ý thiếu default flow (tái hiện đúng ví dụ thật `Process_RD0202` r1) →
validate xác nhận đúng 1 warning thiếu default flow → tạo session cố ý không set biến `decision` →
gateway phát sinh `CONDITION_ERROR` → gọi API resolve-incident với `decision=approve` → xác nhận
`processInstanceKey` không đổi trong suốt quá trình và session hoàn tất `COMPLETED` đúng nhánh
`flow-approve`. Không đụng production Camunda.

```powershell
cd backend
$env:JAVA_HOME = 'C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot'
.\scripts\smoke-condition-error-resolve.ps1 -ApiBase http://localhost:8091
```

Ở phía Angular, `/quy-trinh/nhap/:draftId/chay-thu` (trang Test BPMN) giờ tự parse BPMN
(`shared/bpmn-variables/bpmn-variable-usage.ts`, thuần TypeScript không phụ thuộc Angular) để sinh
form biến có nhãn tiếng Việt thay ô JSON thô — dùng chung cho "biến khởi tạo" và "biến hoàn tất task"
(component `shared/bpmn-variables/bpmn-variable-form.ts`, có toggle "Nâng cao — JSON thô" khi không
phát hiện được biến hoặc user muốn tự gõ). Incident `CONDITION_ERROR` được tô đỏ trên sơ đồ
(`BpmnViewerComponent` marker `qtkhcn-bpmn-incident`), liệt kê từng luồng ra kèm điều kiện FEEL thật
và biến hiện có/thiếu, với nút "Sửa biến & tiếp tục" gọi API trên. Incident type khác vẫn hiện alert
message thô như trước — ngoài phạm vi bản này.

## Bypass Service Task tạm thời (Test BPMN, 2026-07-16)

Khi một Service Task có `zeebe:taskDefinition type` chưa có worker production thật (allowlist mock
hiện rỗng), job đó xuất hiện trong `blockedJobs` và session chuyển sang `BLOCKED` vô thời hạn — trước
bản này không có cách nào đi tiếp ngoài huỷ session. Endpoint mới cho phép hoàn tất **thủ công** job
đó ngay trên test engine cô lập, coi như worker thật đã chạy xong với output do người test cung cấp:

```bash
# jobKey lấy từ blockedJobs[].key trong snapshot; variables là output giả lập của service task đó
curl -X POST http://localhost:8090/api/bpmn-tests/<session-id>/jobs/<job-key>/bypass \
  -H "X-QTKHCN-Dev-Key: dev-local-only" -H "Content-Type: application/json" \
  -d '{"variables":{"draft1Valid":true}}'
```

`BpmnTestEngineGateway.bypassServiceTask()` xác nhận `jobKey` thuộc đúng `processInstanceKey` của
session và không phải job user task (`io.camunda.zeebe:userTask` đã có đường hoàn tất riêng), rồi gọi
thẳng `client.newCompleteCommand(jobKey)` — cùng cơ chế đã dùng cho user task, chỉ khác ở loại job.
Session terminal, job không còn BLOCKED, hoặc engine từ chối đều trả HTTP 409/404 fail-closed và giữ
`failureMessage` để audit; **không** có allowlist mock nào được bật ngầm, đây thuần là thao tác test
thủ công — chỉ chạy trên test engine cô lập, không bao giờ áp dụng cho production.

Ví dụ thật đã dùng để verify: draft `Process_RD0202` (RD02.02 — Xét duyệt NV KHCN cấp Tập đoàn) có
Service Task `B04` "Kiểm tra điều kiện & thành phần Bộ HSXD dự thảo 1" với
`zeebe:taskDefinition type="rd0202-check-draft1"`; gateway `B05` ngay sau đó rẽ nhánh theo biến
`draft1Valid` (mặc định `Flow_007` "Không đạt" nếu không set). Bypass với
`{"draft1Valid": true}` cho instance đi tiếp nhánh "Đạt" mà không cần triển khai worker thật cho type
đó.

Ở phía Angular, khu vực "Job bị chặn" trên `/quy-trinh/nhap/:draftId/chay-thu` giờ có nút "Bypass"
mở drawer nhập biến output (dùng chung `BpmnVariableFormComponent`, `focusElementId` = `elementId` của
job) rồi gọi API trên; snapshot làm mới ngay sau khi bypass thành công.

## GAP nghiệp vụ có chủ đích (không phải bug — port có kiểm soát từ mock)

- `HoSoService.submit()` chỉ hỗ trợ quy trình `RD01.01` — quy trình khác ném lỗi 501 rõ ràng.
- `HoSoService.applyAction()` dùng mô hình "lùi 1 bước" tuyến tính cho RETURN_STEP thay vì port
  đầy đủ `webapp/src/data/stepRouting.ts::ROUTING_TABLES` (chọn nhánh đích theo nghiệp vụ).
- `/api/ho-so/{id}/actions` giữ nguyên path/body/response. `APPROVE_STEP` hoàn tất user-task job
  thật; `REJECT_STEP` huỷ process instance vì `REJECTED` là trạng thái terminal của domain rút gọn;
  `RETURN_STEP` chỉ được chấp nhận tại user task có nhánh rework rõ ràng trong BPMN. Nếu Camunda
  không sẵn sàng/không xác định được task, request trả 409 và transaction PostgreSQL không tiến bước.
- `SystemCheckJobWorker` luôn trả `dieuKienMacDinhDat=true` — kiểm tra thật (đối chiếu kế hoạch
  năm/ngân sách) chưa có, chờ F2 hoàn thiện dữ liệu PL1–PL6 thật.
- RBAC/permission check chưa có ở tầng API (F3 — chờ OQ-021, OQ-006) — mọi request qua được
  `DevApiKeyFilter` đều có toàn quyền CRUD, không lọc theo `vaiTroCodes` như mock.

Tất cả các GAP trên đã ghi trong Javadoc tương ứng tại nơi phát sinh — xem trước khi mở rộng.

## Deploy và evaluate DMN trên Camunda

`POST /api/dmn-rules/{id}/versions/{version}/activate` deploy artifact bất biến của version lên
Camunda trước khi chuyển luật sang `ACTIVE`. Metadata `deployStatus`, `camundaDeploymentKey`,
`camundaDecisionKey`, `camundaDecisionId`, `camundaDecisionVersion`, `deployedAt` và `deployError`
được trả trong version summary/artifact. Deploy lỗi trả HTTP 422 với `errors[]`, đồng thời trạng thái
`FAILED` và chi tiết lỗi được giữ lại trong DB; gọi activate lại sẽ retry. Version đã `DEPLOYED` được
tái sử dụng, không tạo deployment trùng.

Evaluate decision đang kích hoạt:

```bash
curl -X POST http://localhost:8090/api/dmn-rules/<rule-id>/evaluate \
  -H "X-QTKHCN-Dev-Key: dev-local-only" -H "Content-Type: application/json" \
  -d '{"variables":{"amount":150}}'
```

Response có `outputs`, `matchedRules[]` (rule id/index/output thật từ Camunda) và evaluation/decision
metadata. Luật chưa active hoặc version chưa deploy fail-closed; lỗi FEEL/Camunda trả HTTP 422.
Smoke real-stack lặp lại được cho toàn chuỗi tạo → lưu → activate/deploy → evaluate:

```powershell
cd backend
.\scripts\smoke-dmn-camunda.ps1 -ApiBase http://localhost:8090
```

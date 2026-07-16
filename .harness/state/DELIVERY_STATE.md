# Delivery State

> **⚠️ 2026-07-16 — LIVE DEMO IS PUBLIC, NO RELEASE ISOLATION.** `https://drab-quail.runlocal.eu/` is
> live and has real users on it right now. Verified on-disk: Caddy serves
> `frontend-angular/dist/frontend-angular/browser` and the running backend JAR
> (`backend/target/qtkhcn-backend.jar`) directly from **this dev workspace** — the
> release/workspace-separation design in `docs/plan_deploy/standard-deploy-workflow.md` was never
> implemented (no `qtkhcn-demo/releases/` directory exists). Any edit/rebuild/restart under
> `backend/`, `frontend-angular/`, or `infra/demo-tunnel/` can affect live users immediately. Read
> `.harness/rules/demo-environment-safety.md` before touching those paths. This note stays until the
> release separation is actually built.

> **2026-07-16 — PROPERTIES PANEL (màn Vẽ/Sửa BPMN) VIỆT HOÁ + ICON NHÓM + POLISH LIST DONE + VERIFIED
> (owner Claude):** user yêu cầu lên kế hoạch rồi triển khai nâng cấp UI Properties Panel; qua
> `AskUserQuestion` user chọn polish sâu trên nền CSS skin hiện tại (không rebuild custom AntD như D13).
> Port dictionary Việt hoá có sẵn từ React reference (`webapp/src/branding/translate-vi.ts`, D7-era) sang
> Angular (`shared/bpmn-modeler/bpmn-properties-i18n.ts`), nạp qua module `translate` (didi) —
> `additionalModules` của `BpmnModelerComponent`. Thêm icon theo `data-group-id` thật (CSS mask, tự đổi
> màu theo theme) cho các nhóm hay dùng nhất (general/documentation/taskDefinition/headers/
> assignmentDefinition/form/inputs/outputs/condition/listeners/extensionProperties/multiInstance/
> calledElement/calledDecision) và style empty-state + list-entry/badge/nút thêm-xoá cho nhóm dạng
> ListGroup (Headers/Input-Output mapping/Listeners/Extension properties) trong `styles/
> bpmn-modeler-panel.scss`. `npx ng build` GREEN, `npx ng test --watch=false` **28/28 PASS**. Chưa
> click-through trình duyệt thật. Chi tiết ở đầu `active-task.md`.

> **2026-07-16 — NÂNG CẤP “KIỂM TRA BPMN” THÀNH LINT 3 MỨC DONE + VERIFIED (owner Codex):**
> backend có contract `issues[]` (`code/severity/message/elementId/elementName`), core graph/Camunda static lint
> và ERROR guard cho chạy thử/deploy; vẫn giữ `errors[]`/`warnings[]` tương thích. Angular editor + drawer catalog
> nhóm Lỗi/Cảnh báo/Gợi ý; click issue trong editor focus phần tử. Backend **76/76 PASS**, Angular **30/30 PASS**,
> production build GREEN. Registry-aware lookup chưa bật vì chưa có registry contract; chưa real-stack smoke hoặc
> browser click-through. Chi tiết rule và phạm vi ở đầu `active-task.md`.

> **2026-07-16 — FIX: "event executor terminated" khi tạo Test BPMN trên test engine cô lập (owner
> Claude):** user báo lỗi 409 `Không thể khởi tạo BPMN test session trên test engine cô lập: event
> executor terminated` khi bấm "Chạy thử BPMN". Tái hiện được trực tiếp bằng curl thật trên backend
> 8090 đang chạy (PID 24228, uptime ~40 phút, khởi động 09:43 — không restart lại lần nào trong suốt
> nhiều lượt giao hàng tính năng trong ngày). Nguyên nhân: `BpmnTestClient`/`CamundaClient` (gRPC/Netty)
> của backend sống lâu bị hỏng kênh gRPC nội bộ (Netty event executor đã terminate) dù TCP socket tới
> `bpmn-test-orchestration` (cổng 26510) vẫn ESTABLISHED — không phải do test engine Docker (đã xác
> nhận `Up 2 hours (healthy)`). Thêm phát hiện phụ: `target/qtkhcn-backend.jar` trên đĩa (rebuild
> 10:09) chỉ có `mvn compile`, thiếu bước Spring Boot repackage nên **không có manifest** (`no main
> manifest attribute`) — chạy `java -jar` sẽ fail ngay từ đầu. **Khắc phục**: dừng PID 24228, `mvn -o
> package` để repackage đúng jar Spring Boot (manifest có `Main-Class:
> org.springframework.boot.loader.launch.JarLauncher`), khởi động lại backend cổng 8090 (PID mới
> 22648). Xác nhận bằng real API: tạo lại đúng session từng lỗi → HTTP 201 `status:RUNNING`, cancel
> sạch sau khi verify. Không đụng Docker/test engine, không mất dữ liệu draft nào.
>
> **Bài học/khuyến nghị cho lần sau**: quy trình "sửa code backend xong" phải luôn chạy `mvn -o
> package` (không phải `mvn compile`/`test-compile`) trước khi restart cổng 8090, và nếu backend sống
> đã chạy rất lâu (nhiều giờ, qua nhiều lượt smoke test bằng instance tạm khác cổng) mà Test BPMN báo
> lỗi gRPC lạ ("event executor terminated" hoặc tương tự) trong khi test engine Docker vẫn healthy —
> nghi ngờ đầu tiên là kênh gRPC nội bộ của backend sống bị stale, khắc phục bằng restart sạch backend
> (không cần đụng Docker).

> **2026-07-16 — BPMN EDITOR EXPORT/FULLSCREEN/PANEL POLISH DONE + VERIFIED (owner Codex):** màn
> Vẽ/sửa có kết xuất `.bpmn` về thiết bị, icon Full screen có resize/fit canvas, và Properties Panel
> đã được bố cục/skin lại bằng stylesheet global dành cho DOM bpmn-js (380px, 420px fullscreen,
> header/group/form controls rõ ràng). Angular **28/28 test PASS**, production build **GREEN**;
> không còn warning CSS component budget. Chưa browser click-through.

> **2026-07-16 — BYPASS SERVICE TASK TẠM THỜI (TEST BPMN) DONE + VERIFIED (owner Claude):** user yêu
> cầu tạm thêm khả năng bypass Service Task khi chạy Test BPMN, lấy draft thật `Process_RD0202`
> (RD02.02) làm chuẩn. Service Task duy nhất của draft đó là `B04` (`zeebe:taskDefinition
> type=”rd0202-check-draft1”`), gateway `B05` rẽ nhánh theo `draft1Valid` — xác nhận qua API thật
> trên backend 8090. API mới `POST /api/bpmn-tests/{id}/jobs/{jobKey}/bypass` hoàn tất thủ công job
> BLOCKED (`client.newCompleteCommand`, cùng cơ chế completeTask dùng cho user task) với variables do
> người test cung cấp; Angular có nút “Bypass — hoàn tất thủ công” trong khu “Job bị chặn”. Backend
> `mvn -o test` **71/71 GREEN** (từ 67), Angular `ng build` GREEN + `ng test` **27/27 PASS**. Real-stack
> smoke mới `smoke-bypass-service-task.ps1` (chạy `mvn spring-boot:run` cổng 8091 tạm — không đụng
> `target/qtkhcn-backend.jar` đang bị khoá bởi backend 8090 sống của user — trên test engine cô lập có
> sẵn) tái hiện đúng id/type Service Task thật của RD0202: session BLOCKED tại B04 → bypass
> `draft1Valid=true` → COMPLETED cùng processInstanceKey. Dọn sạch sau smoke, không đụng 8090/Docker.
> Chưa click-through trình duyệt thật. Chi tiết ở đầu `active-task.md`.

> **2026-07-16 — ANGULAR “TẠO & VẼ BPMN” DONE + VERIFIED (owner Codex):** `/quy-trinh` đã có
> luồng tạo mới và mở lại draft để vẽ/sửa bằng `bpmn-js` Modeler + properties panel Camunda 8.
> Lưu dùng đúng REST draft hiện hữu (`POST` tạo, `PUT` cập nhật với expectedRevision), validate tự lưu
> nội dung mới nhất trước; có dirty guard, lỗi/warning và chặn draft đã deploy. Editor lazy-load để giữ
> initial bundle trong budget. Angular **27/27 test PASS**, production build **GREEN**. Chưa browser click-through.

> **2026-07-16 — DMN CAMUNDA DEPLOY/EVALUATE DONE + VERIFIED (owner Codex):** activate version giờ deploy
> `dmnXml` thật lên Camunda rồi mới chuyển rule sang ACTIVE; version lưu `deployStatus`, deployment key,
> decision key/id/version, deployedAt và deployError. API mới `POST /api/dmn-rules/{id}/evaluate` nhận input
> variables, evaluate đúng decision key active và trả outputs + matchedRules; Angular đã bỏ evaluator cục bộ,
> hiển thị lỗi deploy/FEEL và tô matched row. Backend 67/67 PASS, Angular build GREEN + 25/25 PASS. Real-stack
> smoke PASS: deployment `2251799813699262`, decision `2251799813699264`, evaluation `2251799813699265`,
> matched `R_HIGH`, output `APPROVE`. Backend JAR mới chạy cổng 8090 PID 22068. Chi tiết ở đầu
> `active-task.md` và `backend/README.md`.

> **2026-07-16 — Nâng cấp UX Test BPMN DONE + VERIFIED (owner Claude):** form biến thông minh (parse
> BPMN → field có nhãn thay JSON thô, dùng chung biến khởi tạo/hoàn tất task), API mới
> `POST /api/bpmn-tests/{id}/incidents/{incidentKey}/resolve` (setVariables+resolveIncident) sửa
> CONDITION_ERROR tại chỗ trên cùng instance, gateway lỗi tô đỏ trên sơ đồ + giải thích điều kiện thật
> + nút "Sửa biến & tiếp tục", và cảnh báo sớm (không chặn) khi "Kiểm tra BPMN" gặp gateway thiếu
> default flow. Backend `mvn -o test` 63/63 GREEN, Angular `ng build` GREEN + `ng test` 24/24 PASS,
> real-stack smoke mới `scripts/smoke-condition-error-resolve.ps1` PASS 2 lần liên tiếp (gateway
> CONDITION_ERROR thật → resolve-incident → COMPLETED cùng processInstanceKey, không tạo lại instance).
> Chưa click-through trình duyệt thật. Chi tiết đầy đủ ở đầu `active-task.md`.

> **2026-07-16 — DMN Angular persistence DONE:** Angular Rule Manager đã nối `/api/dmn-rules`, lưu bảng cấu
> trúc thành `dmnXml` và parse artifact/version về bảng theo cơ chế fail-closed. Build GREEN, frontend 24/24
> test PASS, backend 63/63 PASS. Backend đã restart trên cổng 8090 (PID 27624), GET contract thật trả 200.
> Duplicate/delete được bỏ khỏi UI vì REST Lát A chưa cung cấp contract; execution/deploy DMN vẫn là lát sau.

**Owner**: Delivery Manager
**Last updated**: 2026-07-16 (**CURRENT — Angular UI cho Test BPMN (`/api/bpmn-tests`), DONE +
VERIFIED, owner Claude**. User hỏi Test BPMN có cần deploy Camunda thật không → trả lời không cần
(session chạy trên test engine cô lập, đọc thẳng draft/revision trong DB App) → user yêu cầu triển
khai FE+BE luôn. Backend Test BPMN đã DONE từ Lát A+B+C trước đó (xác nhận lại `mvn -o test` 44/44
GREEN, không sửa gì thêm); gap duy nhất là Angular UI. Thêm trang mới `pages/bpmn-test-session/`
(route `/quy-trinh/nhap/:draftId/chay-thu`): chọn revision → tạo session → poll snapshot 3s → sơ đồ
BPMN tô sáng phần tử active (`BpmnViewerComponent` + input mới `activeElementIds`, không đổi hành vi
cũ) → hoàn tất user task / huỷ phiên. Nối tối thiểu vào `process-catalog` (nút "Chạy thử BPMN").
`ng build` GREEN (1.39 MB), `ng test` 8/8 PASS. Làm việc song song thật với luồng "hiển thị/quản lý
draft" bên dưới (owner Codex, cùng ngày) trên cùng `frontend-angular/` — đã re-read file dùng chung
ngay trước khi sửa để tránh ghi đè; không đụng logic import/validate/deploy draft của luồng đó. Chưa
click-through trình duyệt thật; chưa chạy real-stack với Docker test engine. Chi tiết ở đầu
`active-task.md`.) Trước đó: (**hiển thị/quản lý draft BPMN trên `/quy-trinh`, DONE + VERIFIED,
owner Codex**. Đã có API list/filter/order draft nhẹ, tab `Bản nháp`/`Đã deploy`, reload+mở draft sau
import, xác nhận mã trùng và drawer validate/deploy dùng expected revision. Backend 44/44, Angular
8/8, real-stack 8091 đọc đúng 5 draft `Process_RD0202`; không deploy/xóa dữ liệu thật. Backend 8090
của user cần restart để nạp code mới. Global Angular build hiện bị workstream `bpmn-test-session`
đồng thời ngoài task chặn; build của task đã xanh trước thay đổi đó. Chi tiết ở đầu `active-task.md`.) Trước đó:
(**đổi modal nhập/deploy BPMN thành lưu nháp,
PLAN READY, owner Codex**. Modal Angular sẽ có file + mã + tên, tự điền metadata từ XML và gọi endpoint
multipart draft mới; `Lưu nháp` chỉ ghi PostgreSQL `DRAFT` + revision, tuyệt đối không gọi Camunda.
Plan gồm 4 lát: BE import/list draft; Angular modal; tab/vòng đời draft với deploy riêng; tests + real
smoke chứng minh Camunda/version bất biến khi save. Tận dụng Flyway V4 và draft CRUD/validate/deploy
đã có; bổ sung gap bắt buộc là list draft để bản nháp không biến mất sau reload. Chi tiết/DoD ở đầu
`active-task.md`; trạng thái `NOT STARTED`.) Trước đó: (**Test BPMN Lát C DONE + VERIFIED, owner Codex** — failure/security
coverage đã khóa invalid XML/variables, TTL scheduler `TIMED_OUT`, incident snapshot, engine outage,
API key/CORS và stable 400 envelopes; snapshot/complete/cancel failure lưu audit và fail-closed. Script
`smoke-bpmn-lifecycle.ps1` chạy lặp lại chuỗi auth/CORS → draft/validate → test exact revision trên
engine cô lập → `COMPLETED` → deploy production → restart idempotent, không đổi `RD01_01`. `mvn clean
verify` 38/38 GREEN; hai real repeat-run liên tiếp tạo production smoke v2 rồi v3 và PASS sau khi sửa polling cho Camunda
eventual indexing. **DoD tổng Lát A+B+C: DONE + VERIFIED. CURRENT NEXT: quay lại roadmap Foundation/F1;
không còn hạng mục Lát C.**) Trước đó: **Angular global CSS bug FIXED, owner Claude** — user's first-ever real
browser screenshot of `/quy-trinh` showed sider menu and modal rendering with almost no Ant Design
styling. Root cause: `frontend-angular/src/theme.less` imported `ng-zorro-antd/style/entry.less`
[theme vars + core only] instead of `ng-zorro-antd/ng-zorro-antd.less` [full bundle incl. every
component's CSS] — a bug present since the Mốc 4 Angular scaffold that had gone undetected because no
prior session had a browser/Playwright tool to visually check. Fixed the import, bumped the
`angular.json` production bundle budget (900kB/1.5MB → 1.8MB/2.5MB, the extra size is legitimate
component CSS, not bloat), confirmed real `.ant-modal-content`/`.ant-btn` rules now compile and the
running dev server hot-reloaded them. See `active-task.md` top entry.). Trước đó (same day):
**Test BPMN Lát B DONE + VERIFIED, owner Codex** — API session cô lập
`/api/bpmn-tests` đã có create/inspect/user-task-complete/cancel, TTL, correlation/audit,
elements/tasks/variables/incidents/blockedJobs; Camunda test engine tách storage/cổng và không có
Connectors/production workers, backend fail-closed nếu tắt hoặc address trùng production. Real smoke:
session `f331957c-1c18-4040-a45a-412b2e9b3482` step đến `COMPLETED`, session thứ hai `CANCELLED`,
worker giả `sap-production-write` quan sát `BLOCKED`; REST engine chứng minh process test production=0,
test engine=1, production `RD01_01` vẫn v5. `mvn clean verify` 31/31 green; backend và test engine smoke
đã dừng sạch, volume test giữ lại cho audit. **Follow-up Lát C nay DONE; xem đầu file.** Trước đó:
**"Nhập từ .bpmn" BE↔FE wiring
verified E2E + real bug fixed DONE,
owner Claude** — user ran backend for real for the first time this session; verifying against it via
curl (no browser tool) found a real HTTP 500 on re-importing byte-identical BPMN content, since Zeebe's
content-addressable deploy returns the same `processDefinitionKey` and the service unconditionally
inserted a new version row, violating a DB unique constraint. Fixed with a pre-insert existence check
that now returns a clean 422 `{message,errors[]}` (no Angular change needed); confirmed the genuine-new-
content happy path still creates a new version (v4→v5); added a regression test,
`mvn test` 25/25 green. See `active-task.md` top entry for full evidence.). Trước đó (same day):
**Test BPMN Lát B hiện DONE; Lát A draft/revision/optimistic locking DONE + VERIFIED**. Trước đó:
**Angular `/quy-trinh` Quản lý quy trình DONE** — real page wired to
`/api/process-definitions/*`, real upload/import/version-history, `ng build` GREEN; owner Claude.
Parallel: **Backend BPMN import/deploy hardening DONE** — startup deploy
if-absent, 17/17 tests, real-stack smoke v3 → import v4 → restart giữ v4; owner Codex. Xem
`active-task.md`.
Earlier 2026-07-10: **PH2/PH3/PH4 mockup upgrade + domainCode scaffold + Phase 2 Connector framing
DONE** — xem `active-task.md` cho chi tiết đầy đủ; tóm tắt: sửa bug mojibake
`data/phanHe.ts` đè `PH4.modules`, đồng bộ `PH4.modules` (thêm Ma trận Hành động/Tác vụ hệ thống/
Tích hợp/Nhật ký), thêm route `/phan-he/PH4/tong-quan`, gộp nav "Vận hành & Tích hợp" vào nhóm
"Quản trị quy trình", thêm field `domainCode` (Configuration Service multi-domain scaffold, xem
`docs/research/quan-tri-quy-trinh-bpm-platform-danh-gia-2026-07-10.md`) vào rbac.ts/rbacEngine.ts
(có filter + parity giữ nguyên) và optional trên ActionAvailabilityPolicy/Action Registry/
ApprovalRule/ExceptionPolicy; thêm ghi chú "vai trò Connector" (khái niệm — chờ đặc tả kỹ thuật)
trong `SystemDetailDrawer` của `/tich-hop` (Phase 2 của plan). `npm run build` GREEN. Frontend-mock,
không đụng F1. Phase 3 (trang tổng quan platform-concept) còn optional, chưa làm.
Earlier 2026-07-10: **Canvas Form Designer — nâng cấp hiển thị đúng AntD cho Ô chữ/Thả
xuống/Số/Ô nhiều dòng DONE** — follow-up polish của D13, thuần CSS trong `bpmnio-skin.css`: font
`--vht-font` thay IBM Plex Sans, viền lỗi đồng bộ `--vht-danger` qua `--color-warning`, menu mở
Thả xuống skin theo Select AntD, dấu `*` đổi màu đỏ. `npm run build` GREEN. Chưa click-through
trình duyệt. See `active-task.md`.
Earlier 2026-07-09: **Gỡ theme `/danh-sach-phan-he`, đưa về design chuẩn các màn khác
DONE** — user đảo chiều bỏ hẳn theme "Đỏ Tác Chiến"; trang portal nay dùng PageHeader + StatCard +
FilterBar + lưới card trên nền sáng, CSS theme đã xóa khỏi `tokens.css`. See Your Next Action /
`active-task.md`. Earlier same day: Theme "Đỏ Tác Chiến" Slice A DONE (đã bị gỡ).
Earlier 2026-07-08: **Action Studio Simulator UI upgrade Đợt 1–5 (Slice A–P) DONE**
— tab Mô phỏng upgraded from debug API inspector to business simulation preview. Đợt 1: 3-card
context form + summary bar + task dropdown + collapsible guide. Đợt 2: `SimulatorPreview.tsx`
renders buttons like real dossier detail (PRIMARY/MORE dropdown/EXCEPTION dashed), Payload API
tab. Đợt 3: `getDebugActions()` in `actionAvailability.ts` returns hidden actions with role/
permission checks; `ActionExplainDrawer.tsx` explains each action's display decision. Đợt 4:
`simulatorPresets.ts` data layer + `SimulatorPresets.tsx` with 4 built-in presets (Người nộp /
Chuyên viên / Lãnh đạo / Admin), localStorage save/load/delete scenarios, copy-context-to-
clipboard. Đợt 5: `SimulatorCompare.tsx` side-by-side diff table + `RegressionRunner` runs all
saved scenarios. All 7 files type-clean; `npm run build` green. Plan:
`docs/research/action-studio-simulation-coding-plan.md`. Earlier same day: **Integration
screen (`/tich-hop`) upgrade Đợt 1+2 (Slice A-G) DONE** + **EPIC06 Approval Matrix refactor
Đợt 1+2 DONE** + **Mojibake encoding repair DONE** + **D11 + D10 DONE**.)

---

## Your Next Action

> **★ Nâng cấp UX Test BPMN — DONE + VERIFIED (2026-07-16, owner Claude).** Cả 5 lát đã triển khai:
> (1) FE parser BPMN + form biến thông minh dùng chung biến khởi tạo/hoàn tất task (thay JSON thô,
> fallback "Nâng cao — JSON thô" khi không phát hiện được biến); (2) BE endpoint mới
> `POST /api/bpmn-tests/{id}/incidents/{incidentKey}/resolve` (`setVariables`+`resolveIncident`) sửa
> CONDITION_ERROR **tại chỗ, cùng instance**, không tạo lại session; (3) FE tô đỏ gateway lỗi trên sơ đồ
> (`qtkhcn-bpmn-incident` marker) + giải thích đúng điều kiện từng luồng ra kèm biến hiện có/thiếu + nút
> "Sửa biến & tiếp tục"; (4) BE cảnh báo sớm (không chặn) khi "Kiểm tra BPMN" gặp gateway thiếu default
> flow — tái dùng `warnings[]` có sẵn, không đổi DTO; FE cũng lần đầu hiển thị warnings này (trước đây
> hoàn toàn không hiện trên UI). Backend `mvn -o test` 63/63 GREEN; Angular `ng build` GREEN + `ng test`
> 24/24 PASS; real-stack smoke `scripts/smoke-condition-error-resolve.ps1` PASS 2 lần liên tiếp trên
> backend owned port 8091 + test engine cô lập có sẵn, không đụng production. Chưa click-through trình
> duyệt thật. Chi tiết/evidence đầy đủ ở đầu `active-task.md`.

> **★ DMN LÁT A DONE + VERIFIED (2026-07-16): REST contract + schema quản lý phiên bản.**
> Flyway V6 + 3 bảng DMN; `/api/dmn-rules` create/list/get/version/activate/disable; immutable XML
> snapshots, expectedVersion, SHA-256, XXE-safe validation và audit. `mvn verify` **60/60 GREEN** trên
> trạng thái hợp nhất cuối; real PostgreSQL applied V6 và authenticated GET trả 200. Có overlap tạm
> với workstream Test BPMN nhưng đã re-read/re-run xanh sau khi bên kia hoàn tất, không ghi đè.
> Next: Angular wiring + grid↔DMN XML, vẫn chưa Camunda execution.

> **Status**: DONE — backend cổng 8090 đã được restart sạch từ JAR mới (`mvn -o package` +
> `java -jar`, PID **22648**, xem entry "FIX: event executor terminated" ở đầu file). `Process_RD0202`
> sẽ xuất hiện trong tab `Bản nháp`; không cần import lại. Không xóa 5 draft trùng cho tới khi user
> chọn bản cần giữ. Workstream `bpmn-test-session` (Angular UI cho Test BPMN, owner Claude) đã hoàn
> tất và tự green — `npx ng build` production PASS sau khi cả hai luồng gộp lại; lỗi build tạm thời
> trước đó (đang giữa lúc viết `bpmn-test-session.html`) đã sửa xong, không còn chặn global production
> build. **Next action còn lại**: user tự `ng serve` + reload `/quy-trinh` để xác nhận UI thật (chưa
> click-through trình duyệt trong các phiên trước).

> **Status**: FOUNDATIONS IN PROGRESS — F0 complete, F1 IN PROGRESS (D14–D17 unblocked
> 2026-07-15, Angular scaffold + two real pages now live). F2/F3/F5 have working
> prototypes in the frontend mock that still need to be formalized server-side. F4 not started.
> **Do not start EPIC work (Configuration Service EPICs or further RD flows) until F1–F5
> are COMPLETE.** See `active-task.md` for the concrete next step.
>
> **★ CURRENT PLAN READY (2026-07-15): “Nhập BPMN” chỉ Lưu nháp, không deploy trực tiếp.** Thực hiện
> theo 4 lát ở đầu `active-task.md`: (1) BE `POST /api/process-definition-drafts/import` multipart +
> `GET /api/process-definition-drafts`, reuse hardened validator nhưng không publication; (2) Angular
> modal file/mã/tên, prefill XML, nút `Lưu nháp`; (3) tab/drawer quản lý draft và đưa deploy thành action
> riêng dùng expected revision; (4) contract tests + Angular build + real-stack smoke chứng minh save
> không đổi Camunda/immutable version, chỉ explicit deploy mới tạo version. **Next concrete action: Lát
> 1 — khóa DTO/HTTP tests trước, sau đó implement controller/service/repository list/import.**
> Review follow-up đã được gộp: Lát 2 phải chứng minh end-to-end `nzOnOk → handler → service → HTTP`
> để không lặp bug modal hiện tại; XML prefill chỉ chọn đúng một process `isExecutable=true|1`, không
> lấy process đầu tiên; 5 debug `console.log('[DEBUG submitImport]...')` tạm đã được gỡ khỏi component;
> cleanup được verify bằng `npx ng build` GREEN (initial 1.70 MB).
>
> **★ LÁT A+B+C DONE + VERIFIED (2026-07-15, owner Codex).** Lát C đã bổ sung HTTP/security/failure
> coverage, stable error envelopes và smoke script repeatable cho chuỗi draft→test→deploy/restart.
> `mvn clean verify` 38/38 GREEN; real smoke v2 rồi v3 đều PASS, test engine/backend owned đã dừng sạch, production
> `RD01_01` giữ v5. **CURRENT NEXT: quay lại roadmap Foundation/F1 và chọn gap kế tiếp theo thứ tự ưu
> tiên; không tự mở EPIC mới.** Chi tiết/evidence trong `active-task.md` và `backend/README.md`.
>
> **★ ACTIVE TASK (2026-07-15): second real Angular page — `/quy-trinh` Quản lý quy trình —
> DONE.** Replaces the `PlaceholderPage` for `/quy-trinh` with a real page calling the real
> `/api/process-definitions/*` contract (backend BPMN import/deploy workstream, already
> DONE+VERIFIED). New `core/models/process-definition.ts` + `core/services/process-definition.
> service.ts` + `pages/process-catalog/`. Catalog table + search; "Nhập từ .bpmn" opens a modal
> with a **real** drag-drop upload (unlike the React reference `ProcessCatalog.tsx`, which only
> simulates upload) — posts multipart `FormData` to the real import endpoint, surfaces real
> 400/422 `{message,errors[]}` failures, toasts success with the real Camunda deployment key, and
> reloads the list; a per-row "Xem phiên bản" drawer calls the real `GET /{id}/versions` and shows
> full version detail (deployment/process-definition keys, checksum, importer, warnings).
> Deliberately simplified vs. the React reference: no "Tạo & vẽ BPMN" (bpmn-js editor not yet
> ported to Angular) and no separate detail route — version history via drawer instead.
> `npx ng build` GREEN (1.09 MB initial, still a budget *warning* not error — up from 929 kB after
> adding upload/modal/drawer/descriptions/message modules). **Not yet verified**: no
> Playwright/browser tool this session, so no real browser click-through of the upload/error/toast
> flow — user should exercise `ng serve` → `/quy-trinh` with a real `.bpmn` file to confirm.
> See `active-task.md` for the full writeup.
>
> **Earlier (2026-07-15): first real Angular page — `/ho-so` Danh sách Hồ sơ KHCN —
> DONE (pending user backend restart to confirm CORS).** Replaces the Mốc-4 `PlaceholderPage`
> for `/ho-so` with a real page calling the real `GET /api/ho-so` (Spring Boot, Mốc 2/3).
> Added `backend/.../config/WebConfig.java` (new — CORS was previously entirely unconfigured,
> which would have silently blocked the browser call despite a 200 response) allowing
> `http://localhost:4200`; new Angular `core/models/ho-so.ts` + `core/services/ho-so.service.ts`
> + `pages/ho-so-list/`. `mvn -o compile` BUILD SUCCESS, `ng build` GREEN (929.51 kB, still a
> budget *warning* not error). Verified the real running backend's JSON payload matches the new
> TS model field-by-field via curl. **Not yet verified**: the currently-running backend process
> (PID from a prior session, not started this session) still runs pre-CORS code — the
> permission system correctly refused an unauthorized `Stop-Process` on it, so CORS itself and
> an actual browser click-through are unconfirmed until the user restarts the backend. See
> `active-task.md` for the full writeup and next suggested page (`DossierDetail`/`DossierCreate`
> or `/nhiem-vu`).
>
> **Earlier (2026-07-10): PH2/PH3/PH4 mockup upgrade + domainCode scaffold + Phase 2
> Connector framing — DONE.** Triggered by
> `docs/research/quan-tri-quy-trinh-bpm-platform-danh-gia-2026-07-10.md` (brainstorm, chưa lock)
> đánh giá mở rộng "Phân hệ Quản lý Quy trình" thành nền tảng đa domain; plan of record
> `docs/research/quan-tri-quy-trinh-mockup-upgrade-plan-2026-07-10.md`. User chọn nâng cấp nhóm
> PH2 (Phân quyền)/PH3 (Danh mục dùng chung)/PH4 (Quản trị quy trình), sau đó xác nhận làm tiếp
> Phase 2 (ghi chú "vai trò Connector" trong `SystemDetailDrawer` của `/tich-hop`). Chi tiết đầy đủ
> ở `active-task.md`. `npm run build` GREEN. Chưa click-through trình duyệt. Phase 3 (trang tổng
> quan platform-concept, ưu tiên thấp nhất) vẫn optional, chưa làm — chờ user xác nhận mục đích cụ
> thể (demo sign-off) trước khi triển khai.
>
> **Trước đó (2026-07-10): Canvas Form Designer — nâng cấp hiển thị đúng AntD (Ô chữ/Thả
> xuống/Số/Ô nhiều dòng) — DONE.** Follow-up polish của D13. Thuần CSS trong `bpmnio-skin.css`:
> font `--vht-font` thay IBM Plex Sans, viền lỗi đồng bộ `--vht-danger` (qua `--color-warning`),
> menu mở Thả xuống skin theo Select AntD, dấu `*` đổi màu đỏ (giữ vị trí sau nhãn). `npm run
> build` GREEN. Chưa click-through trình duyệt. Kế hoạch:
> `C:\Users\phuctd7\.claude\plans\optimized-churning-horizon.md`. Chi tiết `active-task.md`.
>
> **Trước đó (2026-07-09): Gỡ theme `/danh-sach-phan-he` → design chuẩn các màn khác — DONE.**
> User đảo chiều: bỏ hẳn theme "Đỏ Tác Chiến". `SubsystemList.tsx` viết lại theo khuôn
> `ProcessCatalog` (PageHeader + dải StatCard + FilterBar + lưới card, nền sáng); `App.tsx` header
> standalone bỏ glass tối/mono/màu sáng về chuẩn trắng, `Content` bg standalone về
> `var(--vht-surface-2)`; `tokens.css` xóa toàn bộ CSS theme (standalone-bg/constellation/glass/
> mono/keyframes). `npx tsc --noEmit -p tsconfig.json` GREEN. Chi tiết trong `active-task.md`.
>
> **Lịch sử (đã gỡ): Theme `/danh-sach-phan-he` "Đỏ Tác Chiến" (Slice A + follow-up tương phản) — DONE rồi bị gỡ.**
> Follow-up sau soi trực quan của user: glass 0.56–0.72 trên nền tối ra xám đục → nâng
> card/hero/filter lên 0.88–0.92 (chữ phụ `#8c8c8c`→`#737373`); `.qtkhcn-glass-header` đảo sang
> glass tối `rgba(23,9,11,0.72)`; breadcrumb standalone (trùng tiêu đề trang) → wordmark `QTKHCN`
> mono, tên user chữ sáng. Gỡ chặn build: `export` `CATEGORY_GROUPS` unused trong
> `ServiceTaskConfig.tsx` (WIP của user). Build GREEN 16.4s.
> Plan: `docs/research/danh-sach-phan-he-theme-upgrade-plan-2026-07-09.md`. A1 recolor Navy/Gold →
> Đỏ Tác Chiến (`tokens.css` `--blueprint-*` + gradients + beam + glass-header; quét cả gold/navy
> inline trong `SubsystemList.tsx` + nền standalone `App.tsx`); A2 constellation lines chuyển từ
> linear-gradient tĩnh sang SVG động `ConstellationLines` (one-shot stroke-dashoffset draw-in,
> stagger, `prefers-reduced-motion` ⇒ render sẵn + tắt beam/ping); A3 IBM Plex Mono
> (`.qtkhcn-mono`, áp giá trị BentoStatCard + pill trạng thái). Build GREEN 13.6s; grep dist xác
> nhận bundle. Chưa click-through (Playwright chưa cài). Slice B/C + D/E/F ở Backlog của plan.
> Frontend-mock, no F1.
>
> **Earlier 2026-07-09: eForm B-engine renderer — D12. ALL 3 LÁT DONE.** Rewrote
> `webapp/src/components/FormRenderer.tsx` in place to an AntD renderer (kept the
> `FormRendererHandle` contract ⇒ 5 call sites untouched; dropped the form-js `Form` runtime chunk
> ~334 kB). Also grouped eForm under a new **"Danh mục dùng chung" (PH3)** sider submenu in
> `App.tsx` first (user: eForm UI must sit in its correct phân hệ, per
> `docs/research/userflow-sso-app-portal-phan-he-2026-07-09.md`). **Lát 2**: wired `feelin@7`
> (`evalFeel` unwraps `{value}`) for ① conditional (`conditional.hide`, hidden ⇒ excluded from
> validate+submit) + ② computed (`expression`, readonly); seed `forms/phieuDuToanDemo.ts`.
> **Lát 3**: ③ `dynamiclist` → editable table (add/remove rows) via new `DynamicList` comp +
> module-level `deriveState`/`processLevel` (recursive submit → array-of-objects, row error key
> `<idList>#<row>.<field>`); R2 resolved — row FEEL ctx = `{...root, ...row}` so row exprs see both
> scopes and root exprs read the row array (`count(...)`); seed `forms/phieuThanhVienDemo.ts`
> (member list + row-scoped computed `chiPhiUocTinh` + row conditional `ghiChu`). Build green +
> node-harness verified (Lát 2: 3 scenarios; Lát 3: 3 scenarios incl. R2). **Next: end-to-end
> browser click-through when Playwright available**; roadmap "sau" = `filepicker`→Upload (needs F1
> backend), `html/iframe` (sanitize). Design: `docs/arch/eform-b-engine-architecture.md`.
> Frontend-mock, no F1.
>
> **Integration screen upgrade Đợt 1+2 (Slice A-G, frontend-mock) — DONE 2026-07-08.** Tab split +
> richer cards + drawer chi tiết (Đợt 1); Mapping Studio — field/value mapping editor, JSON
> payload preview, fail-closed validate-before-Active (Đợt 2) — on `/tich-hop`. New
> `data/integrationMapping.ts` + `store/IntegrationMappingContext.tsx`. Build green. Slice H
> (version/rollback, reuse `RuleContext` pattern) + Slice I (audit + permissions, reuse
> `RbacContext`/`actionAvailabilityPolicy`) deferred to Đợt 3. Plan:
> `docs/research/integration-screen-upgrade-notes.md`.
>
> **EPIC06 Approval Matrix refactor Đợt 1 + Đợt 2 (frontend-mock) — DONE 2026-07-08** (Slices
> A–I: dynamic conditions, assignment model + builder, shared store, conflict analyzer, audit
> payload, DossierDetail runtime wiring, persistence DTOs). Full build green; harness-verified.
> Follow-up done: repaired pre-existing mojibake (double-encoded UTF-8) in 5 src files that were
> garbling Vietnamese on many screens — build green, 0 remaining. Plan:
> `docs/research/approval-matrix-refactor-plan.md`.

_This section is updated by the Delivery Manager at the end of every session.
If you are ever unsure what to do, read this section._

---

## Foundations

- [x] F0: Workspace & Agent Readiness — `COMPLETE` (CLAUDE.md 105 lines, hooks active, skills present, repo on local path)
- [ ] F1: Project Scaffold (Frontend rebuild + Backend + Camunda topology) — `IN PROGRESS`
      — **Unblocked 2026-07-15**: backend language/framework = Java 21 + Spring Boot (D14), domain
      DB = PostgreSQL (D15), Camunda 8 dev environment = Self-Managed via local Docker Compose
      (D16) — all locked, see `decisions.md`. **Scope also expanded 2026-07-15**: frontend stack
      changes from React+AntD to Angular + ng-zorro-antd (D17, supersedes D7) with a design-system
      token refresh. The old React frontend (`webapp/`, deployed to Vercel) is kept as a living
      reference implementation during migration, not deleted. Migration plan (Mốc 0–6, strangler-
      fig per RD flow starting with RD01.01): `C:\Users\phuctd7\.claude\plans\generic-pondering-parnas.md`.
      Still open: Camunda 8 *production* deployment model (SaaS vs Self-Managed K8s) — D16 only
      covers the dev environment. **Mốc 1–3 và Mốc 5 nhánh (a) backend verified working end-to-end
      2026-07-15** (real run, not
      mock): Docker stack up (3 healthy containers), Spring Boot backend (Java 21 + **Spring Boot
      4.0.7**, bumped from 3.3.4 after real compatibility failures) compiles and starts, RD01.01
      deployed to real Zeebe, full REST flow (create NhiemVu → HoSo draft → submit → real Zeebe
      process instance) verified, and — via Camunda's own REST API — Task_1→Task_2→
      Gateway_SystemCheck (our custom job worker auto-completed it)→Gateway_SystemResult routed
      correctly to Task_3. 6 real bugs found and fixed during this run (Camunda SDK package names,
      Spring Boot 4 module split, dependency version conflict, **a real BPMN casing bug in the
      pre-existing mock** `webapp/src/data/rd0101Bpmn.ts` now fixed, Hibernate bag-fetch conflict)
      — full list in `active-task.md`. **Mốc 5 nhánh (a) backend DONE 2026-07-15 — người thực hiện:
      Codex**: app endpoint
      `/api/ho-so/{id}/actions` now completes the corresponding real
      `io.camunda.zeebe:userTask` job through `CamundaClient` before advancing PostgreSQL; Camunda
      failure/missing task fails closed with 409. `REJECT_STEP` cancels the process instance;
      gateway variables are supplied for approve/return routes. The public path/body/response
      contract is unchanged. Verified via `mvn test` (3/3) and real E2E calls through `/actions`:
      Task_1→Task_2→system worker/gateway→Task_3 ACTIVE while domain advanced 1→3; reject produced
      domain REJECTED + Camunda TERMINATED. Remaining F1/Mốc 5 work is Angular branch (b) plus full
      browser click-through. Residual distributed-commit edge (Camunda success then DB commit
      failure) requires later outbox/reconciliation design.
      **Mốc 4 (Angular app scaffold + design system) DONE 2026-07-15 — owner Claude, parallel to
      Codex's backend work above**: new `frontend-angular/` (Angular 21 — pinned below latest
      22 because ng-zorro-antd's stable release only targets Angular 21 peer deps; the Angular
      22 build of ng-zorro is still beta). ng-zorro-antd themed via Less source (`src/theme.less`,
      not the precompiled CSS ng-zorro ships by default — confirmed the CSS has no `--ant-*`
      custom properties to override, so recompiling from Less was the only way to reach the VHT
      "Military Red" palette) mapped 1:1 from `webapp/src/theme.ts`; VHT `--vht-*` CSS tokens
      ported verbatim from `webapp/src/branding/tokens.css` for hand-written UI; `vi_VN` locale;
      auth stub (5 demo accounts, localStorage session, route guards, an HTTP interceptor that
      attaches the real dev API key header for future backend calls); a layout shell (sider +
      header + content) mirroring `App.tsx`'s nav IA across a single flat sider (deliberately
      simplified — dropped the PH2/PH3 context-switch mini-sider and RBAC-based nav gating,
      neither blocks Mốc 4's goal); a login page; and a shared placeholder page wired to 16
      module routes (no real data yet, matching Mốc 4's scope). Verified `ng build` green and
      `ng serve` reachable via curl; no real browser click-through (no Playwright/browser tool
      available this session, consistent with every prior `webapp/` session). **This is the
      general Angular scaffold, not the narrower `/quy-trinh` BPMN-import page that the newer
      "Mốc 4/5 nhánh (b)" note in `active-task.md` describes** — that page now has the completed
      `/api/process-definitions/*` backend contract available; see
      `active-task.md` for the full distinction.
      **Backend BPMN import/deploy workstream DONE + VERIFIED 2026-07-15 — owner Codex**: stable
      multipart import plus catalog/detail/version APIs; Flyway V2/V3 catalog and immutable version
      history with BPMN XML/checksum/audit/correlation keys; XXE-safe validation and 5 MB/type limits;
      shared deployment service used by startup runner and API; fail-closed DB persistence; stable
      `{message,errors[]}` validation/deploy failures. `mvn verify` green (9/9). Real E2E proved
      business API → PostgreSQL → Camunda definition/version search → process instance creation, then
      backend restart still read the persisted catalog. React/Angular UI remained untouched. Angular
      now owns file-picker/page wiring and later browser click-through. Deferred unchanged: production
      SSO/RBAC, activation/rollback, object storage, dependency registry, transactional outbox and
      production topology. Full evidence/keys are in `active-task.md`.
      **Backend hardening DONE + VERIFIED 2026-07-15, owner Codex**: bundled RD01.01 startup deploy
      is now idempotent/if-absent using Camunda Search on the real engine id `RD01_01`; existing
      definition logs skip with version/key, lookup failure fails closed, while explicit import remains
      the only intentional version-creation path. Added HTTP contract/failure/security/CORS tests and
      repeatable `backend/scripts/smoke-process-import.ps1`. `mvn verify` green (17/17). Real smoke:
      startup held v3, import created exactly v4 with correlated PostgreSQL XML/catalog
      `d877084c-005f-4ee6-aa69-a2d9fecc62fc` and definition key `2251799813689491`, Camunda instance
      `2251799813689492` started, restart stayed v4/read API retained XML. Backend stopped cleanly after
      smoke; Docker remains healthy. API contract handed to Angular is unchanged. Activation/rollback,
      outbox, production SSO/RBAC and deletion of existing engine versions remain deferred. Full
      evidence is in `active-task.md` and `backend/README.md`.
      **Second real Angular page — `/quy-trinh` Quản lý quy trình — DONE 2026-07-15, owner Claude**:
      replaces the Mốc-4 `PlaceholderPage` for `/quy-trinh` with a real page wired to the
      `/api/process-definitions/*` contract above (no backend changes). New
      `core/models/process-definition.ts` + `core/services/process-definition.service.ts` +
      `pages/process-catalog/`: catalog table + search; a real drag-drop import modal (multipart
      `FormData`, unlike the React reference's simulated upload) that surfaces real 400/422
      `{message,errors[]}` failures and toasts the real Camunda deployment key on success; a
      per-row version-history drawer backed by the real `GET /{id}/versions`. Deliberately
      simplified vs. the React reference: no "Tạo & vẽ BPMN" (bpmn-js not yet in Angular), no
      separate detail route. `ng build` GREEN (1.09 MB initial, still a budget warning not error).
      No browser click-through this session (no Playwright/browser tool) — full detail in
      `active-task.md`.
- [ ] F2: Core Data Schema (NhiemVu / HoSo / Organization / Role / User) — `PARTIAL`
      — Data model decided (`docs/req/data-model-NV-vs-HoSo.md`) and prototyped as TS mock
      types (`webapp/src/data/nhiemVu.ts`, `dossiers.ts`, `roles.ts`, `users.ts`, `orgUnits.ts`).
      Missing: real DB schema/migrations, PL6 (dự toán) field definition, mã NV/mã hồ sơ
      generation rule.
- [ ] F3: Access Model (RBAC / Camunda candidateGroup mapping) — `PARTIAL`
      — 26 role/candidateGroup codes + fail-closed step-permission logic prototyped in
      `webapp/src/data/permissions.ts` (frontend-only mock). Missing: server-side enforcement,
      SSO/IAM protocol decision (`OQ-021`), RBAC granularity sign-off (`OQ-006`).
- [ ] F4: Core Domain Engine (Dossier/Mission status + SLA-escalation + DMN routing) — `PARTIAL`
      — DMN management foundation DONE 2026-07-16: Flyway V6, immutable `dmnXml` versions,
      `/api/dmn-rules` REST lifecycle, optimistic expectedVersion and secure artifact validation.
      Missing: Angular wiring/grid↔XML, Camunda deploy/evaluate, runtime routing integration;
      `hanXuLy` (SLA due date) remains mock-only and escalation computation is not built.
- [ ] F5: Auth + App Shell — `PARTIAL`
      — Shell (Sider + Header, routing) exists in `webapp/src/App.tsx`. Login is a mock
      (`DEMO_PASSWORD`), not wired to real SSO/Camunda Identity — blocked on the same
      SSO/IAM protocol decision as F3.

---

## Active Feature Workstreams

<!-- No feature/EPIC work starts until F1–F5 above are COMPLETE. -->

- [x] **Action Studio Simulator UI upgrade (`docs/research/action-studio-simulation-coding-plan.md`)** — `DONE (frontend mock, Đợt 1–5 Slice A–P, 2026-07-08)` — nâng cấp tab "Mô phỏng" (`InspectorTab`) trong Action Studio từ debug API inspector thành phòng thử nghiệp vụ. Same carve-out category as D10/D11/EPIC06/Integration (frontend-mock refactor of a built module, does not touch F1).
  - **Đợt 1 (Slice A–D)**: Chia form input 1 card dài → 3 card (Ngữ cảnh hồ sơ / Người dùng / Chi tiết); summary bar `RD01.01 / Đang xử lý / t2 · Ký duyệt / CQ_KHCN`; `taskDefinitionKey` từ Input → Select dropdown theo `processCode.taskSteps` (reset khi đổi quy trình); Alert hướng dẫn collapse (nút "Xem hướng dẫn"/"Thu gọn").
  - **Đợt 2 (Slice E–G)**: `components/SimulatorPreview.tsx` (mới) — render action dạng button runtime thật: PRIMARY = button row (primary/danger/default theo tone), MORE = Dropdown "Thao tác khác ▾", EXCEPTION = vùng riêng viền dashed đỏ; disabled hiện button khoá + tooltip; badge metadata (Cần lý do/căn cứ/xác nhận + formKey); Tabs "Xem trước giao diện" / "Payload API".
  - **Đợt 3 (Slice H–J)**: `getDebugActions()` trong `data/actionAvailability.ts` — trả về TẤT CẢ action kể cả bị loại với `roleCheck`/`permissionCheck`/`hideReasons`; `components/ActionExplainDrawer.tsx` (mới) — drawer Descriptions giải thích từng action (mã, luật khớp, role/permission check, lý do ẩn/khoá); SimulatorPreview thêm toggle "Không hiển thị" (hiện action bị ẩn kèm lý do).
  - **Đợt 4 (Slice K–M)**: `data/simulatorPresets.ts` (mới) — 4 preset built-in (Người nộp/Chuyên viên/Lãnh đạo/Admin) + localStorage save/load/delete scenarios + `exportContext()` copy JSON; `components/SimulatorPresets.tsx` (mới) — row preset buttons + "Lưu kịch bản" modal + danh sách kịch bản đã lưu + copy context.
  - **Đợt 5 (Slice N–P)**: `components/SimulatorCompare.tsx` (mới) — side-by-side diff table (A vs B) với stats card (thêm/mất/thay đổi) + `RegressionRunner` chạy `getAvailableActions` cho tất cả kịch bản đã lưu, hiển thị bảng pass/fail với expandable JSON payload.
  - **Verified**: `npm run build` green; all 7 files type-clean (0 errors). No browser click-through (Playwright not installed).

- [ ] **Integration screen (`/tich-hop`) upgrade (`docs/research/integration-screen-upgrade-notes.md`)** — `IN PROGRESS (frontend mock, Đợt 1+2 Slice A-G DONE, 2026-07-08)` — evolves the already-built `IntegrationStatus.tsx` (KPI + card grid + connect modal) toward the doc's "Trung tâm quản trị tích hợp" vision (tabs, mapping studio, drawer, preview payload, versioning, audit). Same carve-out category as D10/D11/EPIC06 (frontend-mock refactor of a built module, does not touch F1).
  - **Đợt 1 (Slice A-C)**: `IntegrationStatus.tsx` wrapped in `Tabs` ("Tổng quan" live + placeholder tabs); `SystemCard` metric row upgraded (độ trễ TB, tỷ lệ thành công 24h, hàng đợi, lỗi mở — all derived from existing seed fields, no new seed data); new `SystemDetailDrawer` ("Xem chi tiết") reusing `seedJobRuns`/`seedEvents` already surfaced on `/nhat-ky` instead of duplicating a job-log table. New pure helpers in `data/camundaOps.ts`: `integrationSuccessRate()`, `jobRunsForSystem()`, `openIncidentCount()`, `lastErrorAt()`.
  - **Đợt 2 (Slice D-G)**: new `data/integrationMapping.ts` — `MappingConfig`/`FieldMapping`/`ValueMapping` model, status Draft/Ready/Active/Deprecated/Error, a **closed transform enum** (no free-text script per the doc's "Transform có kiểm soát"), `validateMappingConfig()` (5 pre-Active checks), `previewMapping()`, `sampleRecordsFor()` (pulls real records from `nhiemVu.ts`/`dossiers.ts`, returns `[]` for `TaiSan` rather than fabricating data). 3 seed configs grounded in real mock data (SAP·Dự toán, QLNS·Nhân sự, MS·Hồ sơ — the last one deliberately invalid to exercise the validate gate). New `store/IntegrationMappingContext.tsx` (mounted `main.tsx`, `RuleContext`-style) — **`setStatus('active')` re-validates inside the context itself** (fail-closed defense in depth, flips to `error` + returns errors on failure rather than silently no-op). New `components/MappingFieldEditor.tsx` + `components/MappingStudio.tsx` wired into the "Mapping dữ liệu" tab (list/filter/create/edit/preview-JSON/activate/delete); `SystemDetailDrawer` updated to show real active mappings per system instead of a placeholder note.
  - **Deferred to Đợt 3**: version/rollback (Slice H, reuse `RuleContext`'s save-bump-version pattern but keep history instead of discarding), audit log + granular permissions (Slice I, hang off existing `RbacContext`/`actionAvailabilityPolicy` rather than a new permission table), retry-policy config ("Cấu hình kết nối" tab, still a disabled placeholder), "Kiểm thử" tab (test-connection, separate from mapping preview).
  - **Verified**: `npm run build` GREEN (tsc + vite, confirmed clean on a re-run with explicit exit-code + error-grep check both đợt). No in-browser click-through — Playwright not installed this session; Đợt 2 additionally smoke-tested via Vite's dev transform pipeline (fetched the new/changed modules, confirmed no parse errors) before stopping the throwaway dev server.

- [ ] **RD01/RD02/RD05 dossier flows (EP-05, `docs/req/EPIC-QLNVKHCN-backlog.md`)** — `IN PROGRESS (frontend mock)` — 20 US / 102 pts scoped, ~10 US flagged blocked on OQ-001/002/003/006. Tracked in `docs/req/RTM.md`. Real backend/Camunda wiring waits on F1–F5.
  - **RD01.01 end-to-end demo wiring (Action→Routing + Form Mapping, 2026-07-07)**: nối hành động "Xử lý" với định tuyến đa nhánh thay vì chỉ forward/terminate. Thêm `returnStep(id,toIdx,note,actor)` vào `store/DossierContext.tsx` (rework loop — nhánh "Yêu cầu hiệu chỉnh" của Gateway_5/6/9/11 trong `rd0101Bpmn.ts`): trả hồ sơ về một bước trước, mở lại các bước xen giữa về pending, hồ sơ vẫn `processing` (khác `rejectStep` = kết thúc). `components/TaskFormModal.tsx` giờ tách 2 tầng: Form (data, theo `formKey` bước) vs Routing (Đồng ý→approveStep / Trả lại→returnStep + chọn bước đích / Từ chối→rejectStep). Form Mapping: thêm biểu mẫu soạn thảo `phieu-chu-truong` (sự cần thiết/mục tiêu/dự toán PL1–PL6, không có `ketLuan`) vào `forms/index.ts`, gán `formKey` cho bước Khởi tạo RD01.01/RD01.02 trong `processes.ts`, và nút "Soạn hồ sơ" + modal trong `pages/DossierDetail.tsx` (loại Chủ trương). Lưu trữ/enforcement thật chờ F1. Verified `npm run build` ✓. **Giả định demo (chưa chốt khách)**: OQ-002 (bước quay lại của rework) do người xử lý chọn trong modal; OQ-001 (phân cấp CS/TĐ) chưa đụng.
    - **Routing Matrix khai báo (P1, 2026-07-07)**: tách routing ra dữ liệu — `data/stepRouting.ts` (`ROUTING_TABLES` keyed theo mã quy trình; RD01.01 = 6 bước × nhánh APPROVE/RETURN/REJECT → forward/rework/reject/complete, đích rework bám BPMN Gateway_5/6/11) + resolver DUY NHẤT `resolveRouting(proc, dossierSteps, currentStepTen)` khớp dossier.steps↔taskSteps theo tên → trả `ResolvedBranch[]` có tên+index bước đích. `TaskFormModal.tsx` giờ lấy default đích rework + nhãn nhánh từ resolver (không đổi hành vi: form vẫn quyết outcome, bảng quyết đích). Mục đích: cả nút bấm lẫn sơ đồ nhánh (P2) đọc CHUNG một nguồn, tránh drift BPMN↔chuỗi tuyến tính. Đích rework là GIẢ ĐỊNH DEMO (OQ-002).
    - **Sơ đồ nhánh (P2, 2026-07-07)**: `components/StepRoutingDiagram.tsx` render node "bước hiện tại" → các nhánh kết quả (Action→Routing) từ `ResolvedBranch[]`, mỗi nhánh gắn màu theo `RouteKind` (forward/complete/rework/reject) + tên bước đích + người dự kiến (`resolveGroups`) + hạn xử lý; nhánh terminal (reject/complete) hiển thị điểm kết thúc. Render bằng HTML/flex + AntD Tag (không dùng bpmn-js). Nhúng vào `DossierDetail.tsx`: card Steps cũ nâng thành card **"Quy trình xử lý"** có `Segmented` toggle **Các bước ↔ Sơ đồ nhánh** (chỉ hiện khi có routing, tức hồ sơ đang xử lý & quy trình có bảng — hiện chỉ RD01.01). Đọc CHUNG `resolveRouting` với nút "Xử lý" → không drift. Verified `npm run build` ✓.
    - **P3 (2026-07-07)**: (3a) `StepRoutingDiagram` thêm prop `exceptionBranches` → vẽ nhánh Chi tiết **nét đứt** (volcano) tách khỏi luồng chuẩn; DossierDetail truyền 1 nhánh/loại Chi tiết đang được phép (`enabledExceptionTypes`). (3b) Tái dùng sơ đồ **design-time**: tab mới **"Ma trận định tuyến"** trong `ActionStudio.tsx` (`RoutingMatrixTab`) — chọn quy trình (keys `ROUTING_TABLES`) → render `StepRoutingDiagram` cho từng bước từ `resolveRouting` trên `taskSteps` tổng hợp (không gắn hồ sơ), `showApprovers={false}`. Cùng component/resolver với runtime. (3c) Nút **"Xem BPMN"** ở card Quy trình xử lý → modal `BpmnViewer` (lazy-load) hiển thị BPMN đầy đủ read-only của quy trình.
    - **Hoà giải drift 3 view + BPMN highlight thật (2026-07-07)**: khách phản hồi "Các bước rút gọn không match Sơ đồ nhánh / BPMN / Chi tiết". Chẩn đoán: có **2 nguồn viết tay độc lập** — chuỗi 6 bước (`taskSteps`/`dossier.steps`) vs BPMN ~12 tác vụ; "Các bước" & "Sơ đồ nhánh" vốn CÙNG gốc 6 bước (khớp), nhưng cả cụm 6-bước lệch BPMN (số lượng + thứ tự). Quyết định (khách chọn): (1) **bỏ view "Các bước"** (Steps) — đã có card "Dòng thời gian phê duyệt"; (2) **Sơ đồ nhánh làm chính**, `Segmented` **Bước hiện tại ↔ Toàn bộ sơ đồ** (`flowScope`), full = `RoutingFlow` render `StepRoutingDiagram` cho từng bước, bước hiện tại `variant='active'` (+ người dự kiến + Chi tiết), còn lại `variant='reference'` (viền xám, thêm prop mới); hồ sơ approved/rejected xem full dạng tham chiếu; (3) **BPMN tô sáng bước hiện tại** qua bản đồ rollup mới `data/bpmnStepMap.ts` (`BPMN_STEP_MAP` suy từ swimlane: t1..t6 → node BPMN, vd t1=[Task_1,Task_2]) + `BpmnViewer` thêm props `activeIds`/`exceptionIds` dùng `canvas.addMarker` + CSS `.vht-step-active`/`.vht-step-exception` (bpmnio-skin.css). **Chi tiết trên BPMN (trả lời khách)**: cú "nhảy" Chi tiết KHÔNG phải nhánh BPMN nên chỉ tô được **node ĐÍCH** (viền volcano nét đứt), không có mũi tên nối — modal ghi rõ; quy trình chưa khai map (RD02.01/RD05.01…) tự hạ mức "chưa tô sáng được". Verified `npm run build` ✓. **Còn ngỏ**: `ActionStudio` RoutingMatrixTab vẫn dùng variant mặc định (mọi bước hiện "Đang xử lý") — nên đổi sang `reference`; mở rộng `BPMN_STEP_MAP` + `ROUTING_TABLES` cho RD01.02/RD02.01.
- [ ] **Controlled Exception Handling (`docs/research/controlled-exception-handling.md`)** — `IN PROGRESS (frontend mock, 2026-07-07)` — Full lifecycle now Request → Approve → **Apply** → (or Reject), with approve and apply **split into two separate steps/permissions** (2026-07-07): approving only records authorization (`approved`), a separate Apply action executes the routing (`applied` + `applyExceptionSkip`), so no single person both authorizes and executes. All 4 documented permissions now modeled: `REQUEST_EXCEPTION`/`APPROVE_EXCEPTION`/**`APPLY_EXCEPTION`**/**`VIEW_EXCEPTION_AUDIT`** in `permissions.ts` (last two added 2026-07-07; audit card in `DossierDetail.tsx` is now gated by VIEW_EXCEPTION_AUDIT — only participants/approvers/admin see it). Who-can-approve / require-evidence / max-times-per-dossier moved out of the old static `EXCEPTION_APPROVER_ROLES` table into the Exception Policy Engine (see next bullet). Files: `webapp/src/data/exceptions.ts`, `webapp/src/data/exceptionPolicy.ts`, `webapp/src/store/ExceptionContext.tsx` (`approveException`/`applyException`/`activeFor`), `DossierDetail.tsx`. Taxonomy still 3 of 12 (`BypassCouncil`, `JumpToHigherApprover`, `SkipStep` — reducible to "skip forward"); the rest (AddReviewer/ReplaceApprover/Reopen…) need real F4 mechanisms. Real enforcement/persistence waits on F1–F4.
- [ ] **Action Availability Model (`docs/research/action-availability-model.md`)** — `IN PROGRESS (frontend mock, Phase A, 2026-07-07)` — Standard + Exception action rendering unified behind one evaluator instead of hard-coded per-button JSX: `webapp/src/data/actionRegistry.ts` (Action Registry), `webapp/src/data/actionAvailability.ts` (`getAvailableActions`, mocks the future `GET /dossiers/{id}/available-actions`), `DossierDetail.tsx` refactored to render from it — including filtering the exception-type Select to only policy-enabled types (previously showed all 3 unconditionally). **All 3 action categories now modeled (2026-07-07)**: added the `SUPPORT` type + `SUPPORT_ACTION_CODES` (`ADD_COMMENT`/`DOWNLOAD_DOSSIER`/`VIEW_HISTORY`) to `actionRegistry.ts`; `getAvailableActions` returns support actions in every dossier status (they don't change the main flow) so STANDARD/SUPPORT/EXCEPTION are all rendered. `DossierDetail.tsx` groups support actions into a **"Thao tác khác ▾" dropdown** (doc mục 9's "More Actions"), separate from primary/exception buttons; all 3 work offline in the mock — Comment persists to local state + renders an "Ý kiến trao đổi" card, Xem lịch sử opens a consolidated timeline modal (steps + exceptions + comments), Tải hồ sơ exports a client-side text summary via Blob. Real handlers (persistence, kho tài liệu, audit API) wait on F1. **Exception `conditionExpression` is now evaluated, not just illustrative (2026-07-07)**: new Exception Policy Engine `webapp/src/data/exceptionPolicy.ts` (`EXCEPTION_POLICIES` configurable table keyed by exceptionType × cap + `resolveExceptionPolicy` first-match, mirrors `approvalMatrix.ts`). `getAvailableActions` now resolves policy per exception type to decide allowed (policy exists for this cap), `requireEvidence`, and `maxTimesPerDossier` (blocks a 4th button once the per-dossier cap is hit); the request modal enforces evidence when the resolved policy requires it. Standard-action `conditionExpression` for SUBMIT/PROCESS_STEP remains illustrative. Phase B (real API, DB-backed policy tables, real Camunda task context) waits on F1. **Action Studio admin page (2026-07-07)**: new `webapp/src/pages/ActionStudio.tsx` (routed `/cau-hinh-hanh-dong`, admin-only, under Vận hành & Tích hợp) makes all 4 doc-§10 pillars tangible as a 4-tab mockup — (1) **Action Registry** read-only catalog grouped by STANDARD/SUPPORT/EXCEPTION; (2) **Availability Policy** = the previously-MISSING `action_availability_policy` table (doc §8), now created as `webapp/src/data/actionAvailabilityPolicy.ts` (configurable rule table + `resolveActionAvailability` first-match resolver + `PERMISSIONS` catalog, mirrors approvalMatrix/exceptionPolicy), with full Rule Builder (add/edit/toggle/delete); (3) **Exception Policy** view + inline edit (toggle enabled, requireEvidence, maxTimesPerDossier) over `EXCEPTION_POLICIES`; (4) **API available-actions inspector** — a live simulator that composes the availability-policy resolver (STANDARD/SUPPORT) + exception-policy resolver (EXCEPTION) into the doc-§4 payload, grouped Primary/More/Exception per doc §9, with a raw JSON view; edits in tabs 2/3 flow into it via lifted state. **Evaluators now UNIFIED (2026-07-07)**: `getAvailableActions` (the live DossierDetail path) no longer hard-branches its STANDARD/SUPPORT tier by `dossierStatus`; it runs that tier through the SAME `resolveActionAvailability` + `ACTION_AVAILABILITY_POLICIES` table (doc §8) that the Action Studio inspector uses — so the dossier detail page and the config page share ONE availability-policy model. Bridge: `DossierDetail.tsx` folds its permission booleans (`canCreateHoSo`→SUBMIT_DOSSIER, `canProcessStep`→PROCESS_STEP, support always) into a `userPermissions[]` list + passes `processCode=LOAI_TO_NHOM[d.loai]`, `userRoleCodes`, `isAdmin`; `getAvailableActions` resolves visible/enabled per action from the table and sorts by `displayOrder`. Seed policies reproduce the previous visibility exactly (SUBMIT only in draft, PROCESS_STEP only in processing, support any status), so no behavior regression. The EXCEPTION tier still flows through the Exception Policy Engine (`exceptionPolicy.ts`) unchanged. `getAvailableActions` input dropped `currentStep`/`canCreateHoSo`/`canProcessCurrentStep`, added `policies?`/`processCode`/`userRoleCodes`/`userPermissions`/`isAdmin`. Verified `npm run build` ✓. All still frontend-mock; real DB-backed policy tables + `GET /available-actions` wait on F1.
  - **D10 (eForm binds to Action layer) — DONE end-to-end 2026-07-08 (UI wiring + point 5 BPMN reconcile).**
    - **Point 5 — BPMN ↔ Action reconcile tool (2026-07-08):** new `webapp/src/data/bpmnReconcile.ts` (pure logic, no UI) + a new **"Đồng bộ BPMN"** tab (`ReconcileTab`) in `ActionStudio.tsx`. Pull-based / admin-triggered (matches D10.5 — no auto push-on-deploy). Mock source of "BPMN user tasks" = `proc.taskSteps`; mock source of "outcome branches per task" = `ROUTING_TABLES` (so only processes with a routing table are reconcilable → RD01.01 today, same set as the Routing Matrix tab). It (a) **scaffolds/upserts** one `ActionAvailabilityPolicy` per (user task × outcome branch) with a deterministic id `AP-BPMN-{nhom}-{stepKey}-{outcome}` so re-sync is idempotent (upsert, never duplicates), formKey seeded from the step's form (RETURN/REJECT → `phieu-y-kien`), and displayOrder placed BELOW the generic wildcard seeds so task-pinned rows win first-match; and (b) runs the **two-way coverage check**: 🔴 missing (a branch has no enabled action → fail-closed stuck step), 🟡 generic (wildcard-only coverage, not pinned) / unfilled (no form bound), 🟢 ok (task-pinned + form), ⚪ orphan (a policy pins a `taskDefinitionKey` no longer in BPMN), plus a per-task **"bỏ qua có chủ đích"** switch that suppresses 🔴/🟡. Edits flow through the same lifted `availPolicies` state, so scaffolded rows appear immediately in the Availability + Simulator tabs. Also **completed the dangling form-picker** in the Availability tab (added the `formKey` `Form.Item` + a "Biểu mẫu" column) — the reason the pre-existing `formOptions`/`formTen` unused-var `tsc` errors existed; and removed the dead `Paragraph` import in `RolePermission.tsx`. **Verified**: `npm run build` fully green (tsc 0 errors + vite bundle); reconcile logic exercised end-to-end via an esbuild+node harness against real seed data — 10/10 asserts (6 tasks generic→ok after sync, 16 rows added, idempotent re-sync updates 16/adds 0, skipping t3 scaffolds 13, orphan detected). No in-browser click-through this session (Playwright not installed). Files: `data/bpmnReconcile.ts` (new), `pages/ActionStudio.tsx`, `data/actionAvailabilityPolicy.ts` (unchanged shape — `formKey` already present), `pages/RolePermission.tsx` (dead-import removal).
    - **UI wiring (earlier 2026-07-08):** `decisions.md` D10 locked the model 2026-07-07: per-outcome STANDARD actions (`APPROVE_STEP`/`RETURN_STEP`/`REJECT_STEP`) with `formKey` bound per action row on `ActionAvailabilityPolicy` (1 eForm : n Action). Data layer (registry/policy/presentation) was scaffolded 2026-07-07; **2026-07-08 cut over the actual UI**: `DossierDetail.tsx` now renders 3 buttons (`Từ chối duyệt`/`Yêu cầu điều chỉnh`/`Đồng ý duyệt`, danger/default/primary) sourced from `getAvailableActions()` instead of one "Xử lý" button; `TaskFormModal.tsx` takes the clicked `AvailableAction` directly (`action.outcome` + `action.formKey`) instead of inferring outcome from the form's `ketLuan` field — the RETURN outcome still shows the "Chọn bước sẽ quay lại" target picker (defaulting to the routing table's branch), APPROVE/REJECT show a static banner naming the routing consequence. `Worklist.tsx`'s row-level "Xử lý" now navigates to the dossier detail page instead of opening `TaskFormModal` inline (outcome choice needs the full availability context, doesn't fit a table row). Retired: `STANDARD_ACTION_CODES.PROCESS_STEP` + registry entry, the `AP-02` policy row, the `ketLuan` field on the `phieu-phe-duyet` form (button now carries the decision), and the now-dead `isApprove()` helper in `forms/index.ts`. **Verified**: `npm run build` (this workstream's files are TS-clean) + a headless-Chromium Playwright run against the dev server logging in as admin and opening `HS-2026-018` (RD01.01, step "Hội đồng KHCN phê duyệt") — all 3 buttons render, Return modal opens "Phiếu góp ý" + step picker (defaulted to "Lập Báo cáo thẩm định" per the routing table), Approve modal opens "Phiếu phê duyệt / ký" with only an "Ý kiến phê duyệt" textarea (no ketLuan radio) + a green banner naming "TGĐ phê duyệt Quyết định chủ trương" as the next step; zero console errors (one pre-existing benign antd `destroyOnClose` deprecation warning, unrelated). (D10 point 5 was subsequently implemented — see the "Point 5" sub-bullet above.)
  - **Note (RESOLVED 2026-07-08):** the 3 pre-existing `tsc noUnusedLocals` errors that used to fail `npm run build` — `ActionStudio.tsx` (`formOptions`/`formTen`) and `RolePermission.tsx` (`Paragraph`) — are fixed: the ActionStudio pair by wiring the Availability-tab form-picker they were intended for, the RolePermission one by dropping the dead import. `npm run build` is now fully green (tsc + vite).
- [ ] **RBAC module (Role & Permission mock, EPIC03 slice) — D11 scope-overlay refactor DONE 2026-07-08** — `IN PROGRESS (frontend mock)`. Split `dataScope` out of `RolePermissionPolicy` into a new per-user `UserRoleAssignment` (`data/rbac.ts`): policy = role+feature+permission+enabled; assignment = user+role+dataScope+orgUnit+effective dates. **Scope-overlay** (D11): role membership still derives from `user.vaiTro`/`ROLE_LABEL_TO_CODES` (D9 intact) — the assignment only overlays scope onto roles the user already holds; `getEffectiveDataScopes(user, assignments)` reads assignments (effective-date filtered) not policies, and `getUserAssignments` fail-safe-filters to roles present in the principal. New `store/RbacContext.tsx` = single source for roles/policies/assignments (mounted `main.tsx`), so `/phan-quyen` and `/nguoi-dung` share edits live. `/phan-quyen` reworked to **3 tabs**: Danh mục vai trò (CRUD business roles, System roles protected), Ma trận quyền (checkbox grid, **click a row → "Chi tiết policy" drawer** carrying raw permissions + the `enabled` toggle — replaces the old redundant Policy tab and closes the enabled-without-delete gap), Mô phỏng (split "Quyền thao tác (Role)" vs "Phạm vi dữ liệu (Assignment)"). `/nguoi-dung` gained a per-user **"Phân quyền" drawer** (scope + đơn vị per role) writing into the context + a scope column. **Verified**: `npm run build` green (tsc + vite). No browser click-through (Playwright not installed). Files: `data/rbac.ts`, `data/rbacEngine.ts`, `store/RbacContext.tsx`, `pages/RolePermission.tsx`, `pages/UserManagement.tsx`. See D11 in `decisions.md`. Real DB-backed RBAC + server enforcement still wait on F3.
- [ ] **Configuration Service EPIC01–16 (`docs/research/configuration-service.md`)** — `NOT STARTED` — brainstorm-level only, not yet a committed backlog. EPIC01 (Organization), EPIC02 (User & Identity), EPIC03 (Role & Permission) substantially overlap with Foundations F2/F3 above — implement as part of those foundations rather than as separate EPIC work.
- [ ] **EPIC06 Approval Matrix (`docs/research/configuration-service-EPIC06.md`)** — `IN PROGRESS (frontend mock, 2026-07-07)` — Ma trận phê duyệt prototyped as the "who approves" layer sitting after BPMN ("where") + DMN/EPIC09 ("what level"). `webapp/src/data/approvalMatrix.ts` (rule model + `resolveApprovers` first-match engine + delegation-by-effective-date overlay, mocks the future `POST /approval-matrix/resolve`), `webapp/src/pages/ApprovalMatrix.tsx` (rules table + Rule Builder modal + Simulation panel, mirrors RuleManager UX). Routed at `/ma-tran-phe-duyet` under Vận hành & Tích hợp (admin-only). Reuses existing mock building blocks (roles/users/orgUnits); resolves candidateGroup→users via `ROLE_LABEL_TO_CODES`. Intentionally out of scope: multi-tenant (single VHT org), drag-drop, org-hierarchy acting-manager resolution, real persistence/enforcement — those wait on F1–F4 and a real Approval Matrix Service.
  - **BPMN wiring (Option A, 2026-07-07)**: Approval Matrix now resolves dossier approval steps → concrete people in `webapp/src/pages/DossierDetail.tsx`. Extracted `resolveGroups(codes, ngay)` (org layer: candidateGroup→users + effective-date delegation overlay) shared by the Simulation page and the dossier view; added `DEMO_TODAY='2026-07-07'` so the TGĐ→Phó TGĐ delegation window fires deterministically in the mock. Current approval step shows a "Người nhận việc — Ma trận phê duyệt" card; pending approval steps show resolved "Dự kiến" assignees inline in the timeline (so the delegation swap is visible on downstream TGĐ steps). Deliberately resolves each step's OWN candidateGroups (no coarse slot inference) to avoid fabricating wrong councils; rule-based group selection by cap/budget stays demonstrated on the Ma trận page's Simulation. Real runtime wiring (Zeebe job worker sets `candidateUsers` at task creation) still waits on F1.
  - **Refactor plan adopted (2026-07-08, `docs/research/approval-matrix-refactor-plan.md` + review notes `approval-matrix-conversation-2026-07-08.md`)** — turns the module from hard-coded conditions (`cap`/`loaiHoiDong`/`budgetMin/Max`) + `approverRoleCodes`-only result into a configurable assignment resolver: dynamic condition tree (AND/OR, 11 operators), metadata-driven variable registry, assignment types (GROUP/USER/ORG_POSITION/COUNCIL/EXPRESSION) + modes (ANY_ONE/ALL/SEQUENTIAL), conflict/coverage analyzer, audit payload, and DossierDetail consuming `resolveApprovers(slot+conditions)` instead of `resolveGroups(step.vaiTroCodes)`. Sliced A–I; suggested order in plan §5. **Đợt 1 (plan §9 near-term) — DONE 2026-07-08**: Slice A condition engine `data/approvalConditions.ts` (11 operators + `evaluateConditionTree` + `describeConditionTree`, fail-closed, empty group = wildcard; **35/35 assert harness**) + Slice B variable registry `data/approvalVariableRegistry.ts` (11 seed vars, enum options aligned to `variableContract.ts`, 3 core `simulated:true`) + Slice C schema migration (`ApprovalRule.conditions: ConditionGroup` replacing cap/loaiHoiDong/budgetMin/Max; seed AM-01…AM-07 migrated; `slot` matched separately; `resolveApprovers` via `toEvalContext`) **with parity gate PASSED — 216 contexts, matched-rule identical old-vs-new, 0 mismatch** + Slice D Condition Builder `components/ConditionBuilder.tsx` (recursive AND/OR editor, controls by registry type, live VN preview) wired into the rule modal + table summary + audit-minimum (`ResolveResult.evaluatedRules` → Simulation shows chosen/skipped rules with reasons). Assignment kept **GROUP-only**. The 5 refactor files are **type-clean**; runtime covered by the two harnesses. ⚠️ **Full `npm run build` is RED from PRE-EXISTING unrelated WIP** (`TroGiup.tsx` untracked missing icon imports; `RolePermission.tsx` modified unused vars) — dirty at session start, owned by other workstreams, left untouched. **Đợt 2 — DONE 2026-07-08 (Slices E/F/G/H/I + shared store)**: `store/ApprovalMatrixContext.tsx` (new, mounted `main.tsx`) = single source for rules → page edits reach runtime; Slice E assignment model `ApprovalAssignment{mode,targets}` (GROUP/USER resolve real + delegation; ORG_POSITION/COUNCIL/EXPRESSION placeholders) + `components/AssignmentBuilder.tsx` (other 3 = disabled "sắp có") — **parity still 216-ctx/0-mismatch incl. approver-set**; Slice H `ResolveResult.audit`+`warnings`+`mode`; Slice F `data/approvalMatrixAnalyzer.ts` (empty-assignment error / dup-priority / broad-before-specific shadow / disabled-fallback / no-fallback coverage) → banner + per-row ⚠, harness-verified; Slice G `data/approvalSlotMap.ts` (step→slot, ⚠ DEMO ASSUMPTION plan §8) + `buildApprovalContext` → `DossierDetail` resolves current step via `resolveApprovers(store rules)` (fallback `resolveGroups`) + shows "Khớp luật: …"; Slice I `data/approvalMatrixDto.ts` (5-endpoint DTOs). **Full `npm run build` GREEN + 3 harnesses green.** Fixed to get green: 2 pre-existing mojibake `TS2367` bugs in `DossierDetail.tsx` (`d.cap`/`d.loai` comparisons — were always-false at runtime) + unused `StatCard`/`stats` in `RolePermission.tsx`. **⚠️ `DossierDetail.tsx` has ~214 pre-existing mojibake lines** (garbled Vietnamese UI from prior-session tool damage; this session's edits verified non-corrupting — `ApprovalMatrix.tsx` stayed clean through heavy edits) → needs a **separate encoding-repair pass**. All frontend-mock; real persistence/enforcement waits on F1.
- [ ] **EPIC09 Rule Manager UI/UX upgrade (`docs/research/EPIC09-dmn-design.md` §2/§8/§12.4 "Custom Rule Builder Pha 2")** — `IN PROGRESS (frontend mock, 2026-07-08)` — nâng cấp `/quan-ly-luat` từ 1 trình soạn dmn-js thô (raw Camunda chrome, 1 DRD hardcode) sang mô hình danh sách + CRUD + lưới thân thiện cho người dùng lowtech. Đã làm:
  - **Angular port — danh sách + màn chi tiết soạn/lưu version/chạy thử DONE 2026-07-16:** `frontend-angular` có route `/quan-ly-luat/:id`, bảng luật FIRST-hit chỉnh sửa được theo kiểu dữ liệu, thêm/nhân đôi/xoá dòng, dirty/reset, snapshot version bất biến + nạp version cũ, và form chạy thử/evaluator cục bộ tô dòng khớp. Store/evaluator cố ý chỉ chạy trong bộ nhớ browser vì backend chưa khóa contract quản lý/thực thi DMN; không dựng API giả. Luật SERVICE hiển thị read-only. Verify Angular production build GREEN và **14/14 test PASS**. Chưa browser click-through.
  - **Angular modal Tạo luật — RD áp dụng từ catalog thật DONE 2026-07-16:** trường chọn quy trình gọi `GET /api/process-definitions` qua service hiện hữu, chỉ giữ `DEPLOYED`, hiển thị mã+tên+version, search và chọn nhiều; bỏ chế độ tags/nhập mã tự do. Có loading/empty/error/retry. Build GREEN, 14/14 test PASS; real backend 8090 trả 2/2 process DEPLOYED.
  - **Bước ② (cái ghim kỹ thuật) — DONE & verified:** `webapp/src/dmn/ruleGrid.ts` (mới) = lớp chuyển đổi **hai chiều lưới ↔ DMN XML** (`dmnToGrid`/`gridToDmn` + `feelInputToCondition`/`conditionToFeelInput`/`feelOutputToResult`/`resultToFeelOutput` + `describeCondition`/`describeResult` hiển thị tiếng Việt). Người dùng thao tác trên `GridCondition{op,value}` có cấu trúc, KHÔNG chạm FEEL; DMN XML vẫn là nguồn chuẩn (execution `evaluateDrd`/sau này `EvaluateDecision` không đổi). **Chứng minh round-trip 21/21 assert** qua harness Node (esbuild + `@xmldom/xmldom` polyfill DOMParser, cài `--no-save`) trên seed RD02 thật: parse→grid cấu trúc đúng, grid→XML parse lại + topo-sort đúng, **bất biến ngữ nghĩa `eval(seed)===eval(round-trip)` trên 8 input phủ biên**, idempotent byte-identical, luật mới soạn từ lưới eval đúng. Harness đã xoá sau verify.
  - **Bước ①② lớp dữ liệu + danh sách + chi tiết — DONE (build xanh):** `data/rules.ts` (model `BusinessRule` bọc `dmnXml` nguồn chuẩn + metadata: category/kind DMN|SERVICE theo §7/status/version/rdApDung; **seed 5 luật** đa dạng, các luật nhỏ dogfood `gridToDmn`), `store/RuleContext.tsx` (CRUD: create/update/saveXml-bump-version/duplicate/setStatus/remove; mounted trong `main.tsx`). `pages/RuleList.tsx` (mặt tiền mới cho `/quan-ly-luat`: StatCard + FilterBar + EntityTable + Modal tạo luật + row-action nhân bản/vô hiệu/xoá) thay `pages/RuleManager.tsx` cũ (**đã xoá 2026-07-08**). `pages/RuleDetail.tsx` (route mới `/quan-ly-luat/:id`): Descriptions metadata + tab **"Soạn bảng luật"** + tab **"Chế độ nâng cao (DMN)"** (dmn-js lùi về đây, có nút Lưu → `saveXml`) + panel **Test tổng quát** (tự dựng form input từ biến gốc DRD, `evaluateDrd` client-side); luật SERVICE hiện interface thay vì DMN. `App.tsx` route cả 2. Verified `npm run build` xanh (tsc 0 lỗi + vite bundle). **Chưa**: click-through trình duyệt (Playwright không cài).
  - **Bước ④ trình soạn lưới có thể chỉnh sửa — DONE (build xanh, 2026-07-08):** `components/RuleGridBuilder.tsx` (mới) = trình soạn "bảng luật" edit được, thay lưới read-only ở tab "Soạn bảng luật". Người dùng lowtech: thêm/xoá/nhân đôi **dòng luật**; mỗi ô NẾU = Select toán tử (Bất kỳ/=/≥/>/≤/</trong khoảng theo kiểu cột) + InputNumber/Input/Select giá trị; mỗi ô THÌ = ValueInput theo kiểu; toggle **"Cấu hình cột"** để thêm/xoá/đổi nhãn+kiểu cột NẾU/THÌ + đổi tên bảng + hit policy (Select). Lưới rỗng (luật DMN mới chưa có `dmnXml`) → nút "Tạo bảng quyết định" seed 1 bảng starter. Draft cục bộ (`structuredClone` immutable), badge "Có thay đổi chưa lưu"; **Lưu → `gridToDmn` → `saveXml` (bump version)**; `resetKey=${id}:v${version}` nạp lại draft sau lưu. KHÔNG chạm FEEL ở bất kỳ đâu. `describeCondition`/`describeResult` giờ chỉ dùng cho panel Test kết quả.
    - **Mức đầy đủ đa-bảng (nối chuỗi DRD) — DONE (build xanh, 2026-07-08):** soạn được **nhiều bảng (decision)** trong 1 luật: nút "Thêm bảng quyết định" (append `starterDecision`) + "Xoá bảng" mỗi card + tag "Bảng i/N". Cột NẾU chọn được **Nguồn** (Select trong "Cấu hình cột") = **kết quả bảng khác** hoặc **đầu vào dùng chung** — bind = đặt trùng `variable` ⇒ `gridToDmn` tự suy `requiredDecision`, `parseDmn` tự `topoSort` khi eval (không đổi converter). Khi bind: khoá kiểu theo nguồn + tự suy enum options từ giá trị output của bảng nguồn (chữ) ⇒ dropdown thay nhập tay. `fieldsForDecision(grid, di)` dựng danh sách nguồn (loại trừ chính bảng đó). Lowtech không thấy tên biến/FEEL — chỉ thấy nhãn Việt "Bảng › Cột".
  - **Còn lại (bước ⑤ — chưa làm):** `gridToDmn` **chưa sinh DMNDI** (layout) nên luật soạn thuần bằng lưới khi mở tab nâng cao cần dmn-js auto-layout hoặc bổ sung generator layout tối giản; skin CSS override dmn-js theo token VHT (`dmnio-skin.css` như `bpmnio-skin.css`). Enforcement/persistence/deploy-Zeebe/versionTag thật vẫn chờ F1.

---

## Blockers

- **Live demo has no release isolation (flagged 2026-07-16).** `https://drab-quail.runlocal.eu/` is
  live with real users; Caddy/backend/frontend all serve directly out of this dev workspace (no
  `qtkhcn-demo/releases/` separation exists despite being designed in
  `docs/plan_deploy/standard-deploy-workflow.md`). See `.harness/rules/demo-environment-safety.md`.
  Not a foundation blocker, but changes to `backend/`, `frontend-angular/`, `infra/demo-tunnel/` need
  human awareness/confirmation before rebuild/restart until this is fixed.
- **F1 stack decisions RESOLVED 2026-07-15** (D14–D17: Java/Spring Boot backend, PostgreSQL, Camunda 8 Self-Managed dev via Docker Compose, Angular+ng-zorro-antd frontend). F1 no longer blocked on architect input; it is now in-progress scaffold work — see the migration plan referenced in the F1 line above (Mốc 0 done, Mốc 1+ not started). Camunda 8 **production** deployment model (SaaS vs Self-Managed K8s) remains open, but does not block dev-environment scaffold work.
- **F3/F5 server-side work** blocked on SSO/IAM protocol choice (`OQ-021`) and RBAC granularity sign-off (`OQ-006`). Owner: Solution Architect + client.
- Several RD flows (RD03, RD04, RD06, RD08) remain requirement-only per `RTM.md` — not a foundation blocker, but flagged so Feature work doesn't assume they're ready.

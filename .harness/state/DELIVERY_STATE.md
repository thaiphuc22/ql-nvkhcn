# Delivery State

> **2026-07-29 — ANGULAR PH2: MA TRẬN ROLE×FEATURE×PERMISSION + DATA-SCOPE CATALOG + APP ENTITLEMENT
> ADMIN DONE + RUNTIME VERIFIED (owner Claude).** Theo yêu cầu trực tiếp của user, ghép nốt phần FE cho 3
> mặt cắt Phase 2 identity-service (Codex) mà lát Bước 5–6 ngay dưới chưa chạm tới: `role-permission`
> modal vai trò nay là ma trận tính năng × quyền thật (nạp `GET /api/features`, submit
> `RoleRequest.matrix`) thay multi-select phẳng; `user-management` drawer "Phân quyền" tách tab Vai
> trò (dataScope nay chọn từ `GET /api/data-scopes`, không còn gõ tay) + tab Ứng dụng mới (checkbox theo
> `GET /api/apps`, lưu qua `PUT /api/users/{id}/apps`). **Cố ý chưa nối App-tab này vào
> `AuthService`/`Shell` — D19 vẫn giữ entitlement App runtime tĩnh theo `DemoUser.apps`, tab mới chỉ quản
> trị catalog `user_apps` ở backend.** **Bẫy runtime phát hiện:** identity-service đang chạy (PID 2148)
> là build TRƯỚC Phase 2 — 3 endpoint mới trả 404; đã dừng, `mvn test` **9/9 PASS**, package lại, khởi
> động PID mới **29456** giữ nguyên token liên service (backend 8090/ho-so-service 8093 không phải
> restart). Verify: Angular `ng build production` **GREEN**, full suite **216/218 PASS** (2 fail
> `nav-items.spec.ts` pre-existing, không đổi số). Xác minh trực tiếp qua HTTP thật cả 3 endpoint mới +
> `/api/roles` có `matrix` + `/api/effective-permissions` có `featurePermissions/assignments/apps`.
> **Chưa làm:** click-through Playwright (một phiên khác đang giữ browser MCP dùng chung); `.spec.ts`
> riêng cho 2 trang này (đã thiếu từ trước, không phải hồi quy lát này). Chi tiết đầy đủ ở đầu
> `active-task.md`.

> **2026-07-29 — ANGULAR PHÂN HỆ 2 (BƯỚC 5–6) DONE + RUNTIME VERIFIED (owner Claude).** Theo yêu cầu trực
> tiếp của user, hoàn tất Bước 5–6 của `docs/research/identity-service-phan-he-2-plan-2026-07-29.md`: 3
> trang Angular PH2 (`co-cau-to-chuc`/`nguoi-dung`/`phan-quyen`) từ `PlaceholderPage` → CRUD thật gọi
> `identity-service`, và nối `AuthService` (`refreshCurrentUser()`, gọi từ `Shell` — không phải
> `login()`/constructor, để 4 spec file gọi thẳng `AuthService.login()` không phải mock HTTP) để gỡ bản
> hardcode role/permission thứ 3 (`demo-users.ts`). **Vá 1 gap auth thật phát hiện khi khảo sát:**
> `IdentityController` hoàn toàn không có auth trên `/api/*` — thêm `DevApiKeyFilter` (mirror
> `backend/.../security/DevApiKeyFilter.java`) + 1 endpoint public `GET
> /api/effective-permissions/{identity}` (bản dev-key, song song bản `/internal/...` bearer đã có). Dev/demo
> routing: `proxy.conf.json` + `infra/demo-tunnel/Caddyfile`/`Start-DemoProxy.ps1` đều đã trỏ tới 8095.
> **Bug thật phát hiện qua Playwright:** icon `nzTheme="twotone"` không tồn tại tiền lệ nào trong repo, ném
> lỗi console — đổi về icon phẳng đã đăng ký sẵn. F2/F3 tiến thêm 1 nấc: 3/3 trang PH2 nay CRUD thật (trước
> là placeholder), `AuthService` đọc role/permission thật cho user đang đăng nhập (trước là 100% tĩnh).
> Verify: identity-service 6/6 (2 cũ + 4 mới), backend + ho-so-service full suite PASS không regression,
> Angular 216/218 PASS (2 fail `nav-items.spec.ts` pre-existing), `ng build production` GREEN. Click-through
> Playwright thật: tạo/xoá organization+role+user+role-assignment qua UI, xác nhận `audit_log` ghi đúng,
> xác nhận `Shell` gọi `effective-permissions` thật qua Network tab. Chi tiết đầy đủ ở đầu `active-task.md`.
> **Chưa làm:** cây tổ chức (`nz-tree`), Bước 7 (xoá hardcode `RoleCatalog.java`/`webapp/src/data/{roles,
> rbac}.ts` — cần hỏi lại user vì `webapp/` có thể coi là legacy), `caddy run` thật.

> **2026-07-29 — IDENTITY-SERVICE RUNTIME BACKEND VERIFIED (owner Codex).** Database
> `qtkhcn_identity` đã tạo trên volume dev hiện tại; 8090/8093/8095 đang chạy với token đồng nhất. Smoke
> CRUD → assignment PM → effective-permissions → my-tasks → workflow available-actions PASS; cleanup và
> audit PASS. Bổ sung API `GET /api/audit-log` và ghi audit cho create/delete user/org, assign/revoke role.
> Full tests: backend 280/280, ho-so-service 68/68, identity-service 2/2.

> **2026-07-29 — IDENTITY-SERVICE / PHÂN HỆ 2 BACKEND DONE (source + tests, runtime pending, owner Codex).**
> D22 đã khóa: service Spring Boot độc lập, PostgreSQL `qtkhcn_identity`, không dựng IdP tạm; OQ-021 vẫn mở
> cho SSO thật. Đã có Flyway V1, seed 18 permission + 30+ role, CRUD Organization/Role/Permission/User/
> UserRoleAssignment, internal effective-permissions và kết nối `backend` + `ho-so-service` qua RestClient.
> F2/F3 chuyển từ frontend-only mock sang **PARTIAL — real identity service/backend enforcement seam built**;
> F5 vẫn PARTIAL vì đăng nhập demo chưa được thay bởi SSO VHT.

> **2026-07-28 — RUNTIME QUY TRÌNH ĐỘNG · LÁT 3 + LÁT 4 DONE (source + test), RUNTIME PENDING
> (owner Claude).** Cả 4 lát của hướng "quy trình động" nay đã xong ở mức source + test.
> **Phát hiện quan trọng khi làm Lát 3 — gap E nặng hơn bảng khảo sát ghi:** chỗ chặn thật sự của
> "vẽ BPMN mới rồi chạy hết luồng" KHÔNG phải Action Studio policy mà là
> `WorkflowTaskActionRouting` — nó tra một bảng `switch` cứng theo `processDefinitionId`, nên mọi quy
> trình ngoài RD01_01/RD02_02 rơi vào `default -> Map.of()` (bấm "Đồng ý duyệt" xong Zeebe KHÔNG có
> biến nào để rẽ) và `default -> false` cho RETURN_STEP (không bao giờ trả lại được). Đã sửa: biến
> điều khiển nay suy trực tiếp từ conditionExpression của BPMN đã deploy
> (`DeployedBpmnRoutingReader.actionVariables`, `RouteBranchResponse` thêm trường `variable`); bảng
> cứng RD01.01/RD02.02 GIỮ NGUYÊN vì đã nghiệm thu runtime và mang sắc thái BPMN không nói ra được
> (Task_6 duyệt là `dong_y_bo_sung`). **Phát hiện thứ hai:** seed V10 có 4 luật hiển thị nút CHUNG
> (`process_code`/`task_definition_key` NULL) gắn sẵn biểu mẫu RD01.01 ⇒ quy trình mới luôn bị đối
> soát chấm `generic` chứ không phải `missing`, nên scaffold cũ thành no-op và bước của quy trình
> mới mở ra biểu mẫu của RD01.01. `scaffold()` nay ghim đè khi BPMN tự khai `formKey`. **Lát 3 còn
> có:** bỏ hẳn nhánh dự phòng `BUNDLED_RD0101` (runner đồng bộ catalog cho cả RD01.01, không chỉ
> RD02.02) + không cache map rỗng trong `BpmnUserTaskMetadataCatalog`; tự sinh luật sau khi deploy
> qua `ProcessDeployedEvent` + `@TransactionalEventListener(AFTER_COMMIT)` + `REQUIRES_NEW` (KHÔNG
> nằm trong transaction deploy: lỗi sinh luật sẽ đánh dấu rollback-only và làm mất dòng catalog
> trong khi BPMN đã nằm trên Zeebe); `RoleCatalog` tách khỏi `ActionStudioService`; `JobWorkerRegistry`
> quét `@JobWorker` bằng phản chiếu; **màn đối soát** `GET
> /api/process-definitions/by-bpmn-process-id/{id}/readiness` + drawer "Đối soát" trên `/quy-trinh`
> (biểu mẫu có thật không · vai trò có trong danh mục không · service task có worker không · nhánh
> nào chưa có luật) — đây chính là chỗ các kiểm tra của Lát 0 đã huỷ được chuyển tới, dạng chẩn đoán
> không chặn ai. **Lát 4:** `UserAuthoredProcessAcceptanceTest` (Testcontainers Postgres 16) vẽ một
> BPMN chưa từng xuất hiện ở bất kỳ file Java/migration/resource nào (`quy_trinh_thu_nghiem`:
> start → LapHoSo → DuyetHoSo → gateway 3 nhánh) rồi chạy validate → deploy → catalog → routing →
> biến điều khiển → scaffold → simulate với user KHÔNG phải admin → readiness xanh, **6/6 PASS**.
> **Verify:** full backend **279/279 PASS BUILD SUCCESS**; Angular **213/215** (2 fail
> `layout/nav-items.spec.ts` **pre-existing**); `ng build --configuration production` GREEN.
> **CHƯA làm:** toàn bộ runtime của cả 4 lát — chưa build/restart 8090, chưa click-through trình
> duyệt, chưa deploy BPMN thật lên Zeebe rồi chạy hết luồng. Zeebe bị mock trong Lát 4, nên phần
> "engine thật nhận BPMN và rẽ nhánh theo biến" vẫn là giả định. Chi tiết ở đầu `active-task.md`.

> **2026-07-28 — RUNTIME QUY TRÌNH ĐỘNG · LÁT 2 + LÁT 1 DONE (source + test), RUNTIME PENDING
> (owner Claude).** Lát 2: bỏ bảng hardcode 4 mã quy trình theo (loại hồ sơ, cấp) ở
> `ho-so-detail.ts`, thay bằng `GET /api/process-definitions/selectable`; sửa
> `CamundaReliableWorkflowEngine.start()` tra `bpmnProcessId` thẳng (giữ fallback `replace('.','_')`
> cho hồ sơ cũ). Lát 1: nút **"Đồng bộ từ Camunda"** hút quy trình deploy thẳng lên engine về
> catalog — `CamundaProcessDefinitionLookup.listLatest()/fetchXml()` (API đã xác minh bằng `javap`
> trên `camunda-client-java-8.9.12.jar`, KHÔNG đoán), `DeployedProcessImportService` +
> `DeployedProcessImportWriter` (mỗi quy trình một transaction `REQUIRES_NEW` để 1 bản hỏng không
> kéo đổ cả lượt), migration **V27** thêm cột `process_definition_version.source` (`APP`/`EXTERNAL`),
> `POST /api/process-definitions/sync-from-camunda`, cột "Nguồn" trên `/quy-trinh`. Khoá đối chiếu
> là `camundaProcessDefinitionKey` nên quy trình app tự deploy không bị nhập trùng. **Verify:** full
> backend **253/253 PASS BUILD SUCCESS**; Angular **210/212** (2 fail `layout/nav-items.spec.ts` là
> **pre-existing**, `git status` xác nhận không đụng); `ng build --configuration production` GREEN.
> **Sửa thêm ngoài phạm vi (nhỏ, có chủ ý):** `/quy-trinh` trước nay fetch SVG icon động qua HTTP vì
> chưa nhóm nào đăng ký `reload/upload/plus/search` — đã thêm `PROCESS_CATALOG_ICONS`. **CHƯA làm:**
> runtime cả Lát 1 và Lát 2 (chưa build/restart 8090, chưa click-through, chưa E2E), và toàn bộ
> **Lát 3** (bỏ fallback `BUNDLED_RD0101`, scaffold Action Studio policy, màn đối soát) + **Lát 4**
> (E2E bằng BPMN mới tinh). Chi tiết ở đầu `active-task.md`.

> **2026-07-28 — CHUYỂN HƯỚNG CÓ PHÊ DUYỆT: "RUNTIME QUY TRÌNH ĐỘNG (PROCESS-AGNOSTIC)" — IN
> PROGRESS (owner Claude).** User chấp nhận rời khỏi các follow-up còn treo của RD02.02 v3 để làm
> hướng mới: người dùng tự vẽ BPMN + deploy, hệ thống hút quy trình lên và luồng nghiệp vụ chạy theo
> mà không cần sửa code. **Phạm vi user chốt qua 3 câu hỏi trực tiếp:** (1) tạo BPMN cả 2 đường —
> editor trong app VÀ deploy thẳng lên Camunda rồi hút về; (2) chỉ `userTask` + gateway + eForm —
> service task/DMN/timer/message NGOÀI phạm vi; (3) người dùng chọn quy trình **tự do**, không ràng
> buộc loại hồ sơ ↔ quy trình. **Quyết định đáng chú ý của user:** không làm guard deploy-time
> ("cứ tạm thời cho phép deploy từ App, chưa cần warning hoặc chặn cứng") — hệ quả đã trình bày và
> user giữ nguyên: **BPMN có service task vẫn deploy được nhưng hồ sơ sẽ TREO tại đó cho tới khi có
> job worker**, đúng lớp bug RD02.02 `Check` 2026-07-20. Đổi lại, không phải refactor
> `ProcessDefinitionImportValidator` static→bean (tránh blast radius 15 callers), và các kiểm tra đó
> chuyển sang màn đối soát ở Lát 3 dạng chẩn đoán không chặn. **Phát hiện khi khảo sát:** quy ước
> `bpmnProcessId = processCode.replace('.','_')` không chỉ ở FE mà nằm cả trong
> `CamundaReliableWorkflowEngine.start()` dòng 23 ⇒ BPMN người dùng vẽ với id chứa `_` thật không bao
> giờ khởi động được. Kế hoạch 4 lát (thứ tự đã đổi: **Lát 2 trước Lát 1**): Lát 2 bỏ hardcode chọn
> quy trình + sửa resolve bpmnProcessId; Lát 1 importer hút quy trình deploy ngoài app; Lát 3 bỏ
> fallback `BUNDLED_RD0101` + scaffold Action Studio policy + màn đối soát; Lát 4 E2E bằng một BPMN
> mới tinh. Chi tiết đầy đủ + bảng 7 gap ở đầu `active-task.md`. **Chưa làm: toàn bộ 4 lát.**

> **2026-07-21 — `/giam-sat` ANGULAR: TAB "BÁO CÁO OPTIMIZE" + 2 TAB MỚI "DMN / OUTCOME" + "ĐỀ XUẤT
> CẢI TIẾN" DONE (owner Claude).** Tiếp nối lát port `/tong-quan`. Tab "Báo cáo Optimize" hết còn là
> alert placeholder "Chưa kết nối" — nay có 5 card thật (bảng cycle time, bar chart bottleneck,
> heatmap CSS, bar chart SLA KPI theo ngưỡng 20%, bảng gateway rates), tái dùng
> `SimpleBarChartComponent` sẵn có, không thêm chart lib. Phát hiện khi khảo sát mockup React
> (`ProcessMonitor.tsx`, worktree `ql-nvkhcn-tranngdt-check`): 3 export
> `OPTIMIZE_OUTCOME_CORR`/`OPTIMIZE_DMN_RULE_HITS`/`OPTIMIZE_INSIGHTS` có sẵn trong data file nhưng
> **chưa từng được dùng ở bất kỳ .tsx nào** — 2 tab "DMN / Outcome" và "Đề xuất cải tiến" là UI tự
> thiết kế (bảng + stacked bar + card list), không có mockup 1:1 để đối chiếu. File mới:
> `core/models/optimize-ops-insights.ts`. Verify: `tsc --noEmit` sạch, `ng build production`
> **GREEN**. Chưa làm: click-through trình duyệt thật (Playwright MCP + cổng 4200 đang bị phiên
> khác chiếm giữ), chưa có `.spec.ts`. Chi tiết đầy đủ ở đầu `active-task.md`.

> **2026-07-21 — HS-2026-016/018 KẸT Ở T04_GDTT DO MẤT SỰ KIỆN TASK_COMPLETED: ĐÃ SỬA + RUNTIME
> VERIFIED (owner Claude).** `CamundaWorkflowRuntimeEventReader.read()` chỉ tin native
> `newUserTaskSearchRequest()` và chỉ fallback sang job-backed search khi rỗng hoàn toàn — xác minh
> live view này có thể trả **không rỗng nhưng thiếu item**. Đổi thành luôn chạy cả 2 nhánh (dedupe theo
> `sourceKey` có sẵn ở `WorkflowEventCollector`, an toàn). Đồng thời khôi phục `rd0202.bpmn`: T04/T13/
> T27/T29 tách lại thành 2 userTask GDTT/GDK nối tiếp mỗi cặp, khớp đúng bản v4 đang chạy thật (đối
> chiếu trực tiếp XML deploy qua Zeebe REST) — file repo trước đó bị gộp nhầm, lệch với engine. Verify:
> backend **231/231 PASS**; runtime restart 8090 (PID `32520`) tự phục hồi ngay chu kỳ collector đầu
> tiên — Postgres xác nhận outbox có thêm `TASK_COMPLETED`/`TASK_CREATED` đúng lúc restart, `dossier_step`
> của cả 2 hồ sơ chuyển đúng sang `T05` CURRENT, quét toàn hệ thống còn **0** instance kẹt kiểu này.
> Không redeploy BPMN (cố ý, để user chủ động). Chi tiết đầy đủ ở đầu `active-task.md`.

> **2026-07-21 — DMN CHẤM ĐIỂM HĐXD TẬP ĐOÀN PHIÊN 2 (T24), NGƯỠNG 70 ĐIỂM: DONE CODE, RUNTIME
> PENDING (owner Claude).** Theo yêu cầu trực tiếp của user + kế hoạch đã trình bày/duyệt qua
> AskUserQuestion (chọn tính điểm trung bình nhiều thành viên thay vì điểm đơn, và tái dùng
> `REJECTED` thay vì thêm status riêng). Gồm 6 lát: (0) sinh Hội đồng xét duyệt **cấp Tập đoàn**
> lần đầu tiên (`HoiDongXetDuyetService.sinhTuBuoc18B`, service task `Generate_HDXD_TD` sau T20) —
> tiền đề bắt buộc vì hội đồng này (họp ở T21/T24) trước đây chưa từng có cơ chế sinh thành viên
> khác cấp Cơ sở; (1) DMN mới `rd0202-danh-gia.dmn` (decision `ketQuaDanhGiaT24`, ngưỡng 70, KHÔNG
> phải placeholder); (2) BPMN quanh T24 đổi thành
> `Load_HDXD_TD → T24 (multi-instance) → Tinh_DiemTB_T24 → Rule_DanhGiaT24 (businessRuleTask) →
> G24 → T25 (đạt) / endEvent mới "Hồ sơ không được thông qua" (không đạt)`; (3) job worker
> `Rd0202DanhGiaT24JobWorker` (nạp danh sách + tính trung bình, fail-closed=0 khi rỗng); (4) deploy
> DMN thật lần đầu tiên (`rd0202-routing.dmn` viết từ 2026-07-20 CHƯA từng được deploy — đây là DMN
> đầu tiên thật sự được nối dây) — `CamundaDeploymentService.deployClasspath` đổi thành varargs để
> deploy BPMN+DMN cùng lượt; (5) `CamundaWorkflowRuntimeEventReader` phân biệt endEvent "không thông
> qua" (state COMPLETED bình thường, khác REJECT_STEP vốn TERMINATED) thành `PROCESS_REJECTED`, tái
> dùng nguyên luồng REJECTED có sẵn ở `ho-so-service`. Điểm kỹ thuật đáng chú ý: `formData` theo D3
> không tự vào biến Zeebe, nhưng multi-instance outputCollection là nơi DUY NHẤT gom được N điểm số
> song song (vì `dossier_step` chỉ 1 dòng/`taskDefinitionKey` nên 3 lượt hoàn thành T24 sẽ ghi đè
> nhau) — xử lý bằng exception hẹp `WorkflowTaskActionService.withDiemSoForT24` (chỉ forward field
> `diemSo`, chỉ tại T24/APPROVE_STEP), cùng mẫu "business data ngắn hạn phục vụ DMN" đã có tiền lệ ở
> `checkChuTruongTapDoan`. Verify: backend **231/232 PASS** (1 skip pre-existing), ho-so-service
> **57/57 PASS**, cả 2 module compile+test-compile sạch; test mới `Rd0202DanhGiaT24JobWorkerTest`
> (4 case), `HoiDongXetDuyetServiceTest`/`InternalHoiDongXetDuyetControllerTest` (+2 case mỗi file);
> `Rd0202JobWorkerContractTest` (tự grep toàn bộ BPMN, tự bắt thiếu worker) xanh; BPMN referential
> integrity xác minh bằng script Python riêng (205 element id, 105 sequenceFlow, 0 tham chiếu
> thiếu); API `ElementInstanceFilter.elementId(String)` xác nhận tồn tại bằng `javap` trực tiếp trên
> jar, không đoán. **Tương thích với entry CI check ngay dưới** — full suite chạy sau khi cả hai bộ
> thay đổi cùng có mặt trong working tree, `BundledBpmnDeployedConsistencyTest`/
> `StartupProcessDeploymentServiceTest` đều xanh dù tôi đổi chữ ký `deployClasspath`/`deployIfAbsent`
> sang varargs. **Follow-up ngay trong phiên (theo yêu cầu user):** chưa tự deploy lên Zeebe thật
> được (`deployIfAbsent` chỉ tự chạy trên engine "genuinely empty"), nên đã đưa cả BPMN và DMN lên
> đúng trạng thái **Draft/NOT_DEPLOYED** qua 2 cơ chế có sẵn của hệ thống, gọi API thật trên backend
> dev đang chạy (8090): BPMN draft id `0b66608a-04cf-4261-9186-6ee613cbf813` (status **VALID**,
> revision 1, `/api/process-definition-drafts`) và DMN rule id `85579a41-38db-4b17-a5cf-1e57cb0795af`
> code `RD0202-KETQUA-DANHGIA-T24` (version 1 **NOT_DEPLOYED**, `/api/dmn-rules`) — user tự bấm
> Activate DMN rồi Deploy BPMN trên UI `/quy-trinh` khi sẵn sàng. Đính chính: khẳng định trước đó
> "Zeebe từ chối deploy BPMN nếu calledDecision không resolve được" là SAI — tra lại cho thấy đây là
> lỗi runtime (INCIDENT trên business rule task), không phải lỗi chặn deploy-time. Chi tiết đầy đủ ở
> đầu `active-task.md`. **CHƯA làm — RUNTIME PENDING rõ ràng:** chưa E2E/click-through nhánh mới (đạt lẫn không đạt);
> multi-instance T24 vẫn dùng chung `candidateGroups=HDXD_TD` cho mọi lượt (không có tài khoản gắn
> đúng từng thành viên — chờ OQ-021/IAM); chỉ formData của lượt hoàn thành CUỐI CÙNG của T24 được
> lưu ở `dossier_step` (điểm số không ảnh hưởng vì đi qua Zeebe riêng, nhưng nhận xét chi tiết văn
> bản của 2 thành viên trước bị ghi đè); không seed `service_task_binding` cho 3 job type mới (giống
> tiền lệ `check-default-condition`, sẽ không hiện trên `/cau-hinh-tac-vu`); chưa đụng T10 (cùng
> form `bm-02-12-pdg-dt`, cùng thiếu ngưỡng, ngoài phạm vi yêu cầu lần này). Chi tiết đầy đủ ở đầu
> `active-task.md`.

> **2026-07-21 — #3 CI CHECK "BPMN ĐÃ DEPLOY VS FILE REPO" DONE (owner Claude).** Follow-up item #3 của
> entry RD02.02 v3 ngay dưới. Phát hiện khi khảo sát: `StartupProcessDeploymentService.deployIfAbsent()` +
> `BundledProcessCatalogSyncService.sync()` chỉ đồng bộ file → Zeebe/Postgres catalog **lần đầu tiên**; sửa
> BPMN rồi restart không tự cập nhật bản đang chạy — đúng rủi ro drift #3 muốn CI bắt. Sau khi hỏi user chọn
> giữa 3 phương án, chọn **Maven test + Testcontainers Postgres thật** (không phải script vs dev stack sống,
> không phải golden-checksum lockfile offline). Thêm `backend/src/test/java/vn/vht/qtkhcn/service/
> BundledBpmnDeployedConsistencyTest.java` — chạy pipeline validate→deploy(mock CamundaClient)→persist thật
> cho cả RD01_01/RD02_02, round-trip qua Postgres 16-alpine (Testcontainers, đúng image
> `infra/docker-compose.override.yml`), assert `bpmn_xml`/`checksum_sha256` đọc lại khớp byte-for-byte file
> repo. Thêm `.github/workflows/backend-ci.yml` — **workflow CI backend đầu tiên của repo** (trước đó chỉ có
> `deploy-pages.yml` build Angular, chưa từng chạy `mvn test` trên GitHub Actions). Giới hạn có chủ đích, ghi
> rõ trong Javadoc: CI chạy từ DB rỗng nên không bắt được drift trên engine ĐANG SỐNG bị bỏ qua đồng bộ —
> giới hạn cố hữu của CI stateless. **Bẫy môi trường phát hiện khi build thật:** Spring Boot 4 tách
> `@DataJpaTest`/`@AutoConfigureTestDatabase` sang package/artifact mới (`spring-boot-starter-data-jpa-test`,
> `org.springframework.boot.data.jpa.test.autoconfigure`/`...jdbc.test.autoconfigure`/`...jpa.test.autoconfigure`),
> Testcontainers 2.0.5 đổi artifactId sang tiền tố `testcontainers-*` — xác nhận bằng đọc POM/jar thật trong
> `~/.m2`, không đoán. Verify: `BundledBpmnDeployedConsistencyTest` **2/2 PASS** (Postgres container thật,
> Flyway áp 24 migration, Hibernate insert/select qua Hikari); full backend suite `mvn -o test` **194/194
> PASS, BUILD SUCCESS** (192 cũ + 2 mới, không vỡ gì). Chưa làm: chưa push để tự kiểm chứng workflow chạy
> thật trên GitHub Actions; chưa mở rộng CI sang `ho-so-service`/Angular (ngoài phạm vi #3).

> **2026-07-21 — RD02.02 V3: CẢ 3 GAP CHẶN LUỒNG ĐÃ ĐÓNG + RUNTIME VERIFIED, FULL 56-TASK E2E PASS (owner
> Claude).** Tiếp tục phiên dở dang: phát hiện lượng lớn code thật đã viết thêm nhưng chưa ghi vào harness
> state (`Rd0202ConditionValidator`/`Rd0202DefaultConditionService` — validate thật thay stub, trả `false`
> quay T02 khi hồ sơ thiếu điều kiện; `DeployedBpmnRoutingReader` đọc property zeebe BPMN để sinh đúng
> `APPROVE_STEP`/`REJECT_STEP`; demo users `GD_TTMS`/`TP_NS`/`TP_TCKT`). Verify build/test trước:
> backend **192/192 PASS**, ho-so-service **53/53 PASS**, Angular typecheck sạch + `ho-so-detail.spec.ts`
> **16/16 PASS**. Được user xác nhận, đã dừng 8090/8093 cũ, `mvn package` lại, restart bằng đúng cặp token cũ
> (**PID mới: 8090→20228, 8093→22276**). Chạy `Invoke-RD0202V3E2E.ps1`: lần 1 FAIL đúng thiết kế (mission test
> thiếu field/tài liệu thật cho validator mới → GCheck quay T02 đúng như mong đợi, chứng minh nhánh fail hoạt
> động) — sửa script (thêm field, thêm bước upload tài liệu thật, viết hàm multipart tay vì máy chạy PowerShell
> 5.1 không có `-Form`) rồi chạy lại: **RD02.02 V3 FULL E2E PASS**, đủ 56 task duy nhất `T01→T33`,
> `Check`/`GCheck` nhánh đạt, 4 nhánh T03 song song, `Generate_HDXD` sinh hội đồng 3 thành viên + văn bản QĐ có
> nội dung thật, `submit→PROCESSING→APPROVED`. Click-through Playwright thật xác nhận riêng gap #1: đăng nhập
> `pm@example.com` (không phải admin), nút "Gửi duyệt" hiện và bấm được, mở đúng dialog submit. Dữ liệu test đã
> dọn sạch cả 2 lần chạy hỏng và lần thành công; `GET /api/ho-so` cuối cùng trả rỗng. **Còn lại từ list cải
> thiện user đưa ra, CHƯA làm:** CI check deployed-BPMN-vs-source, form validation/evidence đầy đủ cho các bước
> lớn khác ngoài `Check`, script UI E2E qua browser tái sử dụng được. Chi tiết đầy đủ ở đầu `active-task.md`.

> **2026-07-21 — GAP #1 NÚT "GỬI DUYỆT" LUÔN `permissions: []`: SOURCE DONE, RUNTIME PENDING (owner Claude).**
> `ho-so-detail.ts` (`loadDossierActions()`) đổi `permissions: []` → `permissions: ALL_PERMISSIONS`
> (= toàn bộ `PERMISSION_LABEL` keys), cấp sẵn toàn danh mục quyền cho user đã đăng nhập vì frontend chưa có
> nguồn permission thật theo user — cùng cách backend `WorkflowDemoIdentityProvider` cấp `PROCESS_STEP` cho
> mọi identity demo. RBAC thật không đổi: vẫn do `allowedRoleCodes` (AP-01: PM/PA/NNC) + `candidateGroups`
> quyết định. `tsc --noEmit` sạch; **chưa click-through thật** (cần `pm@example.com` + hồ sơ DRAFT) và chưa
> chạy E2E đầy đủ vì gap #2 (job worker) vẫn RUNTIME PENDING. Chi tiết ở đầu `active-task.md`.

> **2026-07-21 — GAP #2 RD02.02 `Check` THIẾU JOB WORKER: SOURCE + TEST DONE, RUNTIME PENDING (owner Codex).**
> Đã thêm `@JobWorker(type = "khcn.rd0202.check-default-condition")` trả biến gateway
> `dieuKienMacDinhDat=true` (stub có ghi rõ giới hạn nghiệp vụ), unit test và contract test đọc trực tiếp
> bundled `rd0202.bpmn` để bảo đảm mọi job type RD02.02 có subscriber. Focused **18/18 PASS**; full backend
> **188/188 PASS, BUILD SUCCESS**. Kế hoạch, quyết định không dùng nhầm worker `check-chu-truong-td`, bằng
> chứng và follow-up validation thật ở đầu `active-task.md`. Còn phải build/restart 8090 bằng source mới và
> smoke T01→T02→`Check`→`GCheck`→4 task T03 trước khi tuyên bố runtime DONE; không cần deploy BPMN mới.

> **2026-07-20 — TOKEN 8090↔8093 ĐÃ ĐỒNG BỘ LẠI, GAP #3 ĐÃ ĐÓNG (owner Claude).** Restart đồng thời backend
> (8090, PID mới `22880`) và `ho-so-service` (8093, PID mới `9356`) với cặp token tường minh giống nhau
> (`QTKHCN_WORKFLOW_SERVICE_TOKEN=dev-workflow-local-only`, `QTKHCN_HO_SO_SERVICE_TOKEN=dev-ho-so-local-only`).
> Verify HTTP thật cả 2 chiều: 8093→8090 (`POST /internal/v1/process-instances` với token đúng trả 400 validate,
> không còn 401), 8090→8093 (`GET /api/internal-integration/status` với token đúng trả 200). Gap #1 (nút "Gửi
> duyệt" luôn `permissions: []`) và gap #2 (RD02.02 `Check` thiếu job worker) **vẫn CHƯA sửa**. Chi tiết đầy đủ
> ở đầu `active-task.md`.

> **2026-07-20 — SMOKE TEST RD02.02 v3: 3 GAP CHẶN LUỒNG, CHƯA SỬA (owner Claude).** Click-through thật
> qua Playwright (tạo Nhiệm vụ TĐ → Hồ sơ Xét duyệt → Gửi duyệt) phát hiện 3 bug chặn nhau theo chuỗi: (1)
> nút "Gửi duyệt" không bao giờ hiện cho user thường ở BẤT KỲ quy trình nào vì `ho-so-detail.ts` luôn gửi
> `permissions: []` cho Action Studio simulate trong khi mọi policy SUBMIT đều yêu cầu `SUBMIT_DOSSIER` — chỉ
> admin bypass được; (2) RD02.02 service task "Check" (`khcn.rd0202.check-default-condition`) không có
> `@JobWorker` nào subscribe — hồ sơ RD02.02 sẽ treo vĩnh viễn ngay sau T02, không bao giờ tới
> `Generate_HDXD`; (3) môi trường hiện tại: 8093→8090 internal call bị 401, mọi hồ sơ mọi quy trình đều
> `START_FAILED` — nghi token lệch sau khi 8090 restart sau 8093 26 phút (khả năng do restart deploy "v3").
> **Chưa verify được mục tiêu chính của v3** (job `Generate_HDXD` sinh HĐXD + hiển thị đúng trên Angular) vì
> bị chặn bởi (2) và (3). Đã dọn sạch dữ liệu test (`RD.2026.010/011`, `HS-2026-012`), không để lại state.
> Chi tiết đầy đủ + bằng chứng network response ở đầu `active-task.md`.

> **2026-07-20 — UI XEM DANH SÁCH/CHI TIẾT HỘI ĐỒNG XÉT DUYỆT TRÊN CHI TIẾT HỒ SƠ DONE (owner Claude).**
> Nối tiếp mốc sinh HĐXD tự động bên dưới — dữ liệu hội đồng đã sinh trong DB nhưng chưa xem được trên UI.
> `ho-so-service`: `GET /api/ho-so` và `GET /api/ho-so/{id}` nay trả thêm field `hoiDongXetDuyet` (list, DTO
> `HoiDongXetDuyetResponse`/`ThanhVienHoiDongResponse`), `HoiDongXetDuyetRepository` thêm 2 finder
> (`@EntityGraph` trên `thanhVien` để tránh N+1), `HoSoQueryService` batch-load theo `hoSoId`. Angular:
> `ho-so-detail` thêm card "Hội đồng xét duyệt" (cấp, căn cứ pháp lý, ngày sinh, bảng thành viên), chỉ hiện khi
> có dữ liệu; văn bản QĐ HTML tự động xuất hiện trong danh sách "Tài liệu" có sẵn không cần đổi gì thêm. Verify:
> `ho-so-service` **50/51 PASS** (1 fail pre-existing không liên quan), Angular full suite **198/199 PASS** (1
> fail pre-existing ở `ho-so-create.spec.ts`, không đụng file này). Test mới: `ho-so-detail.spec.ts` (2 case),
> `ReadApiContractTest` (assert field + `hasSize(20)`). Cố ý chưa làm: UI tạo/sửa hội đồng thủ công, tương
> đương cấp Tập đoàn.

> **2026-07-20 — SERVICE TASK TỰ ĐỘNG SINH HĐXD CẤP CƠ SỞ SAU BƯỚC 06 (RD02.02) DONE (owner Claude).**
> Theo yêu cầu trực tiếp của user, chèn 1 service task Camunda thật (`Generate_HDXD`,
> `khcn.rd0202.generate-hdxd-decision`) ngay sau T06 ("Phê duyệt QĐ thành lập HĐXD cấp Cơ sở") trong
> `rd0202.bpmn`. Đóng 3 gap nền tảng cùng lúc: (1) `formData` của eForm T05 (`bm-02-08-qdh-nv`) trước đây bị
> bỏ qua hoàn toàn — nay `WorkflowTaskActionService` (backend) gửi kèm trong event `TASK_ACTION_APPLIED`, và
> `ho-so-service` lưu vào cột mới `dossier_step.form_data_json` (Flyway V8) qua `WorkflowProjectionService`;
> (2) sinh Hội đồng xét duyệt (`HoiDongXetDuyet`/`ThanhVienHoiDong`, Flyway V9) nằm ngoài vòng lặp replay của
> projector, gọi đúng 1 lần qua API nội bộ mới `POST /internal/v1/ho-so/{id}/hoi-dong-xet-duyet`, tự
> idempotent theo `(ho_so_id, cap, source_task_definition_key)`; (3) văn bản HĐXD sinh dạng HTML đơn giản
> (không thêm dependency Word/PDF), tạo `TaiLieu` trực tiếp bỏ qua ràng buộc DRAFT-only của
> `DocumentFileService.upload()` vì đây là ghi hệ thống. Job worker mới `GenerateHdxdDocumentJobWorker`
> (backend) gọi đồng bộ sang `ho-so-service`, lỗi thì để Zeebe tự retry theo `retries="3"`. Verify:
> `ho-so-service` **50/51 PASS** (1 fail `DemoIdentityProviderTest` pre-existing, không liên quan), backend
> **186/186 PASS, BUILD SUCCESS**; test mới: `HoiDongXetDuyetServiceTest` (3 case),
> `InternalHoiDongXetDuyetControllerTest`, `WorkflowProjectionServiceTest` (+1 case formData). Cố ý chưa làm:
> cùng mẫu QĐ thành lập HĐXD ở cấp Tập đoàn (T18B→T20), gán candidate thật cho T07/T10 từ danh sách thành
> viên, nâng cấp sang Word/PDF. **Chưa làm:** smoke thật trên Postgres/Camunda sống — mới verify unit/contract
> offline.

> **2026-07-20 — THÊM / XÓA TỆP Ở MỌI TRẠNG THÁI HỒ SƠ DONE (owner Codex).** Upload multipart và
> thêm metadata tài liệu tại `ho-so-service` không còn bị giới hạn ở `DRAFT`; DELETE tài liệu cũng hoạt động
> ở mọi trạng thái, vẫn kiểm tra version độc lập và dọn binary sau commit. Public read view trả thêm `version`
> của từng tài liệu. Angular Chi tiết hồ sơ luôn hiển thị Upload, bổ sung Xóa có popconfirm/loading/toast và
> cập nhật danh sách tại chỗ. Verify backend targeted **19/19 PASS**, Angular detail **12/12 PASS**, production
> build xanh (chỉ warning budget/CommonJS có sẵn). **Runtime 21:29:** đã dừng PID 7144, package JAR mới và
> restart 8093 thành PID `18300` với cặp token local khớp gateway/workflow; readiness `UP`, Flyway V7
> `success=true`, API trực tiếp và proxy 4200 cùng đọc được hồ sơ, read model có `version`, DELETE ID giả trả
> 404 từ đúng route.

> **2026-07-20 — UPLOAD / XEM / TẢI TỆP TẠI CHI TIẾT HỒ SƠ DONE (owner Codex).** `ho-so-service`
> bổ sung Flyway V7, metadata nội dung tệp và kho filesystem cấu hình bằng
> `QTKHCN_DOCUMENT_STORAGE_PATH`; tên vật lý dùng UUID, upload tối đa mặc định 20 MB và có audit. Sau lát mở rộng
> cùng ngày, upload/xóa được phép ở mọi trạng thái hồ sơ. API xem trả inline, API tải trả attachment; xóa tài liệu/hồ sơ dọn binary sau
> commit. Angular `/ho-so/:id` có Upload, Xem, Tải, loading/toast/dung lượng và giữ tương thích tài liệu
> legacy chỉ có metadata. Verify backend targeted **17/17 PASS**, Angular targeted **10/10 PASS**, production
> build xanh. Full backend suite còn 1 lỗi có sẵn do thay đổi role `PTGD_CT` song song chưa cập nhật
> `DemoIdentityProviderTest`, không thuộc lát file.

> **2026-07-20 — XEM BPMN TẠI CHI TIẾT HỒ SƠ DONE (owner Codex).** Backend Quy trình bổ sung API
> đọc process definition theo `bpmnProcessId`; Angular Chi tiết hồ sơ tải BPMN thật khi người dùng bấm
> “Xem BPMN” và tô nổi `taskDefinitionKey` của bước `CURRENT`. Có loading/error/empty guard. Verify contract
> backend 6/6 PASS, Angular targeted 8/8 PASS, production build xanh (chỉ warning có sẵn).

> **2026-07-20 — HỒ SƠ DETAIL ÁP DỤNG ACTION AVAILABILITY ĐỘNG (owner Codex).** Header thao tác
> không còn hard-code các nút gửi duyệt/phê duyệt/trả lại/từ chối: action cấp hồ sơ lấy từ
> `/api/action-studio/simulate`, action task vẫn lấy từ API task-centric theo D20, và toàn bộ label/tone/order
> render từ metadata. Support action có `formKey` tải eForm thật và mở bằng Angular FormRenderer. Đã thêm
> hồi quy cho `AP-1784539922796`/`BM.02.01.DKI`: nút hiện ở hồ sơ draft và tải đúng
> `bm-02-00-cv-dk-xd-nv`. Verify targeted **7/7 PASS**, production build xanh (chỉ warning có sẵn).

> **2026-07-20 — XÓA NHIỆM VỤ KHCN/HỒ SƠ FE+BE DONE (owner Codex).** Service 8093 có hai API DELETE,
> tạm cho phép ở mọi trạng thái; xóa Nhiệm vụ cascade Hồ sơ, xóa Hồ sơ dọn toàn bộ quan hệ kỹ thuật và có
> audit. Hai danh sách Angular có xác nhận, loading/toast và cập nhật dữ liệu tại chỗ. Verify ho-so-service
> **39/39 PASS**, Angular targeted **4/4 PASS**, production build xanh. **Runtime 16:28:** JAR mới đã chạy
> trên 8093 PID `15304`, health `UP`; cả hai DELETE route probe đúng controller và trả 404 cho ID giả.

> **2026-07-20 — ACTION STUDIO ROUTING TỪ BPMN ĐÃ DEPLOY DONE (owner Codex).** Catalog hardcode
> `RD01.01`/`t1..t4` đã được thay bằng reader đọc `bpmnXml` version mới nhất trong PostgreSQL, cache theo
> process-definition key, trả `bpmnProcessId`, userTask, candidateGroups, formKey và nhánh FEEL thật.
> Outcome `dong_y_bo_sung` có action riêng; outcome chưa biết degrade thành `unmapped`, không còn 500.
> V20 chỉ thay seed demo, không xóa policy người dùng; Angular dropdown process/task và empty state đã cập
> nhật. Verify backend 157/157 PASS, Angular production build xanh. **Runtime 15:38:** V20 đã áp thành công,
> backend 8090 restart PID `1668`; API trực tiếp + proxy 4200 trả đúng RD01_01/13 task và RD02_02/7 task,
> metadata/outcome thật của Task_6 đúng BPMN. Catalog còn process `slice_c_lifecycle_smoke` vì đó là row đã
> deploy thật trong DB — đúng nguyên tắc hiển thị toàn bộ quy trình đã deploy.

> **2026-07-20 — `/giam-sat` ĐÃ PORT ANGULAR + GHÉP BACKEND THẬT (owner Codex).** Route placeholder được thay
> bằng màn standalone ng-zorro: stats, search/filter, bảng instance và drawer chi tiết. Endpoint mới
> `GET /api/process-monitor` đọc Camunda process/element instance, ghép process catalog PostgreSQL, trả
> ACTIVE/incident/COMPLETED/TERMINATED và degrade `available=false` nếu engine lỗi. Không port dữ liệu mock
> Optimize; tab này báo chưa kết nối. Verify backend **156/156 PASS**, Angular production build xanh; full
> Angular test compile xanh nhưng suite bị worker OOM sau 146 test pass. **Live verified 15:21:** package +
> restart 8090 PID `8376`; direct API và proxy 4200 (với header của Angular interceptor) cùng trả **200**,
> `available=true`, 12 instance = 7 ACTIVE + 2 COMPLETED + 3 TERMINATED, 0 incident.

> **2026-07-20 — CỘT "INSTANCE ĐANG CHẠY" TRÊN `/quy-trinh` TAB ĐÃ DEPLOY DONE + VERIFIED TRÊN CAMUNDA
> THẬT (owner Claude).** Tab "Đã deploy" có thêm cột số instance đang chạy theo từng quy trình; bấm số
> để mở drawer liệt kê từng process instance kèm **Bước hiện tại**, mã hồ sơ, thời điểm bắt đầu và cờ sự
> cố. Backend mới: `CamundaProcessInstanceQuery` (camunda) + `ProcessInstanceOverviewService` (service) +
> 2 endpoint `GET /api/process-definitions/running-instances` (đếm theo `bpmnProcessId`) và
> `GET /api/process-definitions/{id}/running-instances` (chi tiết). **Tách khỏi `list()` có chủ đích**:
> catalog là read PostgreSQL, cột này đọc Camunda — Camunda sập thì trả `available=false` (HTTP 200) để
> UI hiện "—" thay vì 0 sai, grid vẫn dùng được. Chi tiết dùng 1 lượt search element-instance rồi group
> theo `processInstanceKey`, không N+1 theo từng instance.
>
> **Bug thật phát hiện khi verify trên engine thật (không lộ ra ở unit test):** Camunda trả
> `application/json` **không kèm charset**, nên Camunda Java client decode tên phần tử tiếng Việt bằng
> charset mặc định của Windows (cp1252) → mojibake (`Khởi tạo` → `Kháť¸i táşˇo`). Đã sửa bằng cách lấy tên
> bước từ `BpmnUserTaskMetadataCatalog` (đọc BPMN đã deploy từ PostgreSQL, UTF-8) thay vì
> `ElementInstance.getElementName()` — cũng chính là nguồn tên mà projection worklist đang dùng, nên tên
> bước nhất quán giữa các màn. **Còn treo (chưa sửa, ngoài phạm vi):** lỗi charset gốc của client vẫn còn,
> mọi chỗ khác đọc text tiếng Việt trực tiếp từ response Camunda đều sẽ dính; nên xử lý riêng ở tầng cấu
> hình client.
>
> Verify: backend **156/156 PASS** (5 test mới), Angular **180/180 PASS**, production build xanh. Gọi
> HTTP thật trên server tạm cổng 8095 (`spring-boot:run`, KHÔNG đụng 8090 đang chạy jar cũ, đúng bẫy jar
> lock trong memory): counts trả `{"RD01_01":6}` khớp đúng 6 instance ACTIVE trong Camunda; drawer trả
> đủ 6 instance sắp xếp mới nhất trước, `Task_1`/`Task_3` khớp element-instance search; quy trình không có
> instance trả mảng rỗng. Server tạm đã dừng, cổng 8095 đã giải phóng. **Chưa làm:** click-through trình
> duyệt thật; `businessId` hiện rỗng vì luồng start chưa set — cột "Mã hồ sơ" hiện "—" (trung thực, không
> bịa dữ liệu).

> **2026-07-20 — BACKEND CẤU HÌNH LUẬT HIỂN THỊ NÚT ĐÃ NÂNG CẤP (owner Codex).** Action Studio
> availability policy nay validate đúng giới hạn schema, chuẩn hóa code, không cho bật hai luật trùng
> action/ngữ cảnh, vẫn giữ optimistic locking, và có API đọc audit history cho từng luật (kể cả luật đã
> xóa). Payload cấu hình trả catalog Bề mặt/Trạng thái/Vai trò/Quyền và Biểu mẫu thật từ bảng `eform`;
> modal Angular đã bỏ danh sách mock cứng. Verify: backend **151/151 PASS**, Angular **175/175 PASS**,
> production build xanh. Không có migration; contract chỉ mở rộng thêm field `referenceData`.

> **2026-07-20 — D18/D20 FINAL CUTOVER, MONOLITH HỒ SƠ ĐÃ XÓA (owner Codex).** Theo chỉ đạo trực tiếp
> của user, Service Quản lý NV KHCN (8093) nay là owner duy nhất của Nhiệm vụ/Hồ sơ/tài liệu/projection;
> Service Quản trị quy trình (8090) chỉ sở hữu workflow/task và giao tiếp qua internal API +
> transactional outbox/inbox. Đã đồng bộ bản ghi lệch `HS-2026-006`, parity 5/5 bảng xanh, rồi áp Flyway
> V19 xóa `nhiem_vu`, `ho_so`, `dossier_step`, `dossier_step_code`, `ho_so_tai_lieu` khỏi `qtkhcn`.
> Đã xóa toàn bộ entity/repository/service/controller/DTO/test legacy cùng seam in-process
> `WorkflowClient`/`InProcessWorkflowClient`/`Rd0101ProcessService`; direct 8090 `/api/ho-so` và
> `/api/nhiem-vu` trả 404. Gateway không còn canary/rollback/feature flag: mọi API NV KHCN bắt buộc sang
> 8093, task action bắt buộc sang 8090. Verify: backend 147/147, ho-so-service 38/38, Angular 175/175,
> production build xanh, Caddy validate xanh; localhost:4200 đọc đủ 6 hồ sơ từ 8093 và integration token
> 8093→8090 được xác thực. Full smoke thật sau cutover PASS: create Nhiệm vụ/Hồ sơ → submit → Camunda →
> Task 1–4 approve → Task 5 return → Task 4 mở lại key mới → reject, projection cuối `REJECTED`, không còn
> active task; dữ liệu/process audit test đã dọn sạch. Kiến trúc chuẩn:
> `docs/arch/nvkhcn-workflow-final-service-boundary.md`.

> **2026-07-20 — APPROVAL MATRIX VERIFIED TRÊN HTTP THẬT (owner Claude).** Nối tiếp entry ngay dưới,
> nâng mức xác minh từ build/test lên server thật. **Flyway V9 ĐÃ ÁP** lên DB dev từ 2026-07-16 14:43
> (`success=t`), và Flyway báo `Successfully validated 18 migrations` lúc khởi động ⇒ checksum V9 ở
> workspace khớp bản đã áp. 4 bảng `approval_*` có thật, 6 slot + 8 luật. Gọi live: `GET /rules` **200**
> (8 luật đầy đủ), `GET /slots` **200** (`usageCount` tính đúng), `POST /resolve` **200** phân nhánh
> đúng theo context (CS→AM-01/U-003, TD→AM-02/U-010) kèm audit ghi lý do skip từng luật, `POST /analyze`
> **200** phát hiện trùng priority + thiếu fallback. Luật `AM-26809` do **Lê Văn Cường** tạo (không phải
> `system-seed`) chứng tỏ đường ghi từng chạy thật ở phiên 16/07. Chạy bằng
> `mvn -o spring-boot:run -Dspring-boot.run.arguments=--server.port=8095` vì `mvn package` **fail**:
> tiến trình 8090 đang giữ khoá `target/qtkhcn-backend.jar` (đúng bẫy trong memory
> `qtkhcn-local-stack-run`). Header auth đúng là `X-QTKHCN-Dev-Key` — sai header trả 401, đừng nhầm với
> 404. **✅ TOÀN TUYẾN ĐÃ THÔNG:** ban đầu 8090 chạy JAR cũ (build trước khi port) nên
> `/ma-tran-phe-duyet` vẫn 404; **10:33 một phiên song song đã build lại + restart 8090** (PID 28044,
> jar 89MB / 443 entry `BOOT-INF`). Gọi lại trên 8090 và qua proxy 4200 đều **200 `application/json`**;
> thiếu header trả **401 JSON** (không phải HTML) ⇒ proxy định tuyến đúng, không rơi SPA fallback. Đã
> tắt server tạm 8095. **Sự cố tự gây, đã khỏi:** `mvn package` lúc 10:28 fail repackage do 8090 giữ
> khoá jar, để lại jar **thin 487KB / 0 entry `BOOT-INF`** (`java -jar` sẽ chết); bản build 10:33 đã
> khắc phục. Đừng `mvn package` khi backend đang chạy — dùng `spring-boot:run` cổng khác để test.
> Còn treo: chưa click-through browser, chưa commit workspace chính.
>
> **2026-07-20 — APPROVAL MATRIX BACKEND CỨU KHỎI WORKTREE + PORT VÀO WORKSPACE CHÍNH DONE (owner
> Claude).** User báo "nhớ là đã code backend rồi"; agent grep workspace chính rồi kết luận nhầm là
> "chưa từng viết" — kết luận đó **SAI**, đã đính chính. Sự thật đúng như entry 2026-07-16 bên dưới
> ghi: BE nằm ở worktree `ql-nvkhcn-be-approval-matrix` (branch `fix/approval-matrix-backend`),
> **34 file, toàn bộ ở trạng thái untracked suốt 4 ngày** — chỉ cần một `git clean` là mất trắng
> 91 test đã PASS. **Bước 1 (chốt an toàn):** commit `f366885` trong worktree đó, 65 file / 4380 dòng
> (Approval 34 + Action Studio + eForm — cả jar tổng hợp 3-trong-1), `backend/target/` đã được
> gitignore nên không lẫn build artifact. **Bước 2 (port có chọn lọc, KHÔNG merge branch):** branch đó
> ở baseline 16/07 (`3d3ed24`), workspace chính đã ở `33db320` với D18/D19/D20 + `ho-so-service` +
> Camunda workflow + integration — merge thẳng sẽ kéo ngược baseline cũ. Nên chỉ copy 33 file Approval
> (V9 SQL bỏ qua vì đã identical từ 16/07) và **merge tay `GlobalExceptionHandler.java`**, vốn đã phân
> kỳ cả hai chiều: worktree có `ApprovalMatrixConflictException`, workspace chính có
> `IntegrationConflictException`/`WorkflowStartException`/`TaskActionException` + record
> `InternalErrorBody` — giữ đủ cả 4, không bên nào bị mất. **Bước 3 (verify thật):** `mvn -o compile`
> sạch, `mvn -o test` **180/180 PASS, 1 skipped** (skip `HoSoServiceTest` là pre-existing), BUILD
> SUCCESS; 9 test Approval xanh (`ApprovalConditionEngineTest` 2, `ApprovalMatrixAnalyzerTest` 1,
> `ApprovalMatrixServiceTest` 3, `ApprovalMatrixHttpContractTest` 3). Contract FE↔BE đối chiếu khớp
> 100%: `/api/approval-matrix` rules CRUD/status/versions/audit + `/resolve` + `/analyze`, và
> `/api/approval-matrix/slots` GET/POST/PUT/`{code}/status` — FE cũng không gọi DELETE slot (chỉ retire
> qua status), không có gap. **CHƯA làm:** chưa chạy server thật để gọi HTTP live (chưa xác nhận Flyway
> V9 đã áp lên DB dev đang dùng), chưa click-through `/ma-tran-phe-duyet` trên trình duyệt, chưa commit
> ở workspace chính (giữ nguyên tắc chỉ commit khi user yêu cầu). **Bài học vận hành:** không được kết
> luận "chưa code" chỉ từ grep một worktree — repo này có 6 worktree, phải `git worktree list` trước.

> **2026-07-19 — HIỂN THỊ TÍCH HỢP NỘI BỘ TRÊN `/tich-hop` + `/nhat-ky` DONE (owner Codex).**
> `/tich-hop` có khối riêng “Quản lý NV KHCN ↔ Quản lý quy trình”, thể hiện hai chiều
> command-outbox và workflow-event-inbox, health tổng hợp, số lệnh chờ/lỗi, sự kiện nhận gần nhất và
> liên kết sang nhật ký; không trộn cặp service nội bộ vào registry hệ thống ngoài. `/nhat-ky` đổi tab
> nội bộ thành “Quy trình ↔ NV KHCN”, bổ sung chú giải hai chiều và tên service rõ ràng, vẫn đọc API
> `/api/internal-integration/status` thật. Targeted Angular tests **11/11 PASS**, production build GREEN
> (chỉ còn các warning budget/CommonJS có sẵn, không liên quan). In-app browser không có phiên khả dụng
> nên chưa click-through/chụp ảnh thật.

> **2026-07-19 — D20 LÁT 8 E2E: RẢ THẬT, RERUN SMOKE PASS TOÀN BỘ + 6 TEST CASE BIÊN PASS (owner
> Claude, tự chạy theo yêu cầu user "lên kế hoạch và tự chạy test").** Build+package cả 2 track cùng
> working tree (không phải 2 branch tách): backend `mvn -o test` PASS, `ho-so-service` `mvn -o test`
> PASS, Angular `ng build` production GREEN + `ng test` **174/174 PASS** (không còn 2 flaky trước đó).
> Dựng thật backend cổng **8090** + `ho-so-service` cổng **8093** trên Docker Postgres/Camunda đã chạy
> sẵn (không đụng cổng 8091 dev đang chạy, không đụng live demo — xác nhận cổng 8090 trống trước khi
> dùng). Chạy `Invoke-E2ESmoke.ps1` thật: **SMOKE PASS FULL** — đây là lần đầu tiên script này PASS
> hết; lần chạy trước (2026-07-18) FAIL ở `/api/my-tasks` rỗng do gap `TASK_CREATED`, nay xác nhận Lát 0
> (element-instance fallback) đã đóng gap thật. Thêm 6 test case biên tự viết, tất cả PASS: sai
> candidate group → `403 TASK_FORBIDDEN`; duplicate requestId+payload → cùng kết quả `202`; duplicate
> requestId khác payload → `409 IDEMPOTENCY_CONFLICT`; legacy `/api/ho-so/{id}/actions` khi
> `legacy-writes-enabled=true` (mặc định) vẫn thông (rollback bridge sống); khi `=false` bị chặn
> `409` đúng message; `/api/tasks/**` không bị ảnh hưởng bởi cờ legacy. Đã dọn sạch: cancel process
> instance test qua Camunda REST, xoá toàn bộ row test ở cả 2 DB (`ho_so`/`nhiem_vu`/projection/outbox/
> inbox), dừng 2 tiến trình java tạm, không để lại state. **Chưa làm** (do không có browser tool trong
> phiên): click-through UI thật qua `/viec-cua-toi` → mở task → bấm nút → xem trạng thái "Đang cập
> nhật"; đã hướng dẫn user cài Playwright MCP nếu muốn agent tự lái browser. Với kết quả này, Lát 8 coi
> như **PASS ở tầng API/service** — phần còn lại trước khi cutover live là click-through UI thật + flip
> `legacy-writes-enabled=false` trên môi trường thật + xoá `HoSoService.applyAction()` (release kế
> tiếp). Chi tiết đầy đủ ở đầu `active-task.md`.

> **2026-07-19 — D20 TRACK CLAUDE LÁT 6 WIRING DONE: `ho-so-detail.ts` off the legacy endpoint (owner
> Claude).** User flagged `ho-so-detail.ts:133` still calling `HoSoService.applyAction()` /
> `POST /api/ho-so/{id}/actions`. Mid-investigation, caught Track Codex actively rewriting
> `worklist.ts`/`task-action.service.ts`/`task-action.ts` in real time in the same working tree; paused
> and confirmed with the user before touching anything Codex owned. `ho-so-detail.ts` now reads `taskKey`
> from the query param `worklist.ts` already carries from `/viec-cua-toi`, calls
> `TaskActionService.availableActions()`/`applyAction()` against the real 8090 contract, and never calls
> the legacy endpoint. Deliberate, undecided gap (not fixed here): `HoSoResponse`/`DossierStepResponse`
> carry no `taskKey`, so a dossier opened directly (not via worklist) shows a "no permission to act from
> here" hint instead of action buttons — resolving that needs both tracks to agree on adding `taskKey` to
> the read contract. `ng build` GREEN, full `ng test` **174/174 PASS** (172 Codex + 2 new). Not yet done:
> browser click-through against live 8090/8093 (stopped after Codex's smoke run), flipping
> `legacy-writes-enabled=false`, and deleting `HoSoService.applyAction()`/the old endpoint — joint
> follow-up once both branches are merged. Details in `active-task.md`.

> **2026-07-19 — D20 TRACK CODEX BACKEND LÁT 0–5 DONE + REAL CAMUNDA E2E VERIFIED (owner Codex).**
> Closed the empty `TASK_CREATED` blocker with a user-task API → element-instance/job fallback plus
> BPMN metadata catalog; added task-centric available/execute APIs, server-side candidate + Action
> Studio enforcement, exact task-key execution, durable idempotency/UNKNOWN reconciliation and an
> inflight unique guard. Added `TASK_ACTION_APPLIED`/`PROCESS_REJECTED` outbox facts and projection-only
> dossier updates, including dynamic steps, correct `REJECTED != CANCELLED`, and clean metadata when
> RETURN reopens a previously completed step. The legacy dossier-action path is blocked by the legacy
> write kill switch at cutover and retained only as a rollback bridge until Angular swaps. Real flow
> `HS-2026-004`: approve Task_1→2→3→4, RETURN Task_5→new Task_4, then REJECT→dossier `REJECTED`; Maven
> suites for both backend modules pass and Flyway V16–V18 are applied. Track Claude still must align its
> prepared client with the now-real response wrapper/body/status contract and wire Lát 6; details and
> exact contract are at the top of `active-task.md`.

> **2026-07-19 — TRACK CLAUDE: D20 LÁT 6/7 PREP DONE (owner Claude).** Added, additively, without
> touching the still-live `HoSoService.applyAction()` flow: `core/models/task-action.ts` +
> `core/services/task-action.service.ts` (Angular client for the not-yet-built
> `GET/POST /api/tasks/{taskKey}/{available-actions,actions}`, reusing `HoSoActionOutcome` and
> `SimulatedAction` instead of inventing new shapes) with a `task-action.service.spec.ts` locking the
> contract (3/3 PASS); and a Caddy `@task_actions` matcher in `infra/demo-tunnel/Caddyfile` that strips
> client-declared `X-QTKHCN-Role-Codes` for those paths. Found while reviewing the Caddyfile: `/api/
> tasks/**` and `/api/action-studio/**` already reach 8090 via the existing catch-all — this isn't a
> strangler seam (no old upstream to migrate from), so no new `Switch-*Route.ps1` was needed. `ng build`
> GREEN, full `ng test` **168/170 PASS** (2 pre-existing flaky icon-fetch timeouts, unrelated). Not
> validated: `caddy validate` (no `caddy` binary on this machine, same gap noted in earlier entries).
> Not wired in yet: `ho-so-detail`/`/viec-cua-toi` still call the old endpoint — swapping over happens
> together with gateway cutover once Track Codex's Lát 0-5 API is real, per plan. Details in
> `active-task.md`.

> **2026-07-19 — D20 PLAN SPLIT INTO PARALLEL TRACKS + TASK_CREATED GAP FOLDED IN AS LÁT 0 (owner
> Claude, at user's direction).** Restructured the D20 refactor plan in `active-task.md` into two
> non-colliding tracks so Codex and Claude can work in parallel: **Track Codex** owns
> `backend/.../{camunda,workflow,service,web,domain,repository,security}` +
> `services/ho-so-service/src/main/java/**` — Lát 0 (new: unblock the `TASK_CREATED` gap found below,
> blocks Lát 5/8) run alongside Lát 1–4 (contract, task-centric API, idempotency inbox, Camunda
> execution/authz), then Lát 5 (event/projection) once Lát 0 lands. **Track Claude** owns Angular (Lát
> 6 — build `TaskAction` model/service against the already-locked contract, ask before wiring to any
> stopgap endpoint) + gateway Caddy routes for `/api/tasks/**` and `/api/action-studio/**` (Lát 7) — does
> not touch Codex's backend packages. Lát 8 (E2E) waits for both tracks; verify via an extended
> `Invoke-E2ESmoke.ps1` covering approve/return/reject, not just manual click-through. Full ordering and
> the Lát 0 investigation leads are in `active-task.md`.

> **2026-07-19 — E2E SMOKE SCRIPT WRITTEN + RUN FOR REAL: FOUND A REAL BLOCKING GAP (owner Claude).**
> Added `services/ho-so-service/scripts/Invoke-E2ESmoke.ps1` (create NhiemVu → create HoSo → submit
> RD01.01 → poll `PROCESSING` → `GET /api/my-tasks` as `pm@example.com` → assert `Task_1` /
> `processInstanceKey` match). Actually ran it — stood up temporary backend (8090) + `ho-so-service`
> (8093) against the already-running Docker Postgres/Camunda (created the missing `qtkhcn_ho_so`
> database first), executed the script, then tore everything down and cleaned up test rows. **Result:
> SMOKE FAIL.** The dossier correctly reaches `PROCESSING` with a stable, valid
> `zeebeProcessInstanceKey`, and Camunda's own `/v2/element-instances/search` confirms `Task_1` is
> genuinely `ACTIVE` — but `/api/my-tasks` returns empty for every identity, including admin. Root
> cause isolated precisely via direct Camunda REST calls (bypassing qtkhcn code entirely): Camunda
> 8.9.13's `/v2/user-tasks/search` (the API `CamundaWorkflowRuntimeEventReader` uses to emit
> `TASK_CREATED`) returns **0 items system-wide**, even unfiltered, while `/v2/element-instances/search`
> and `/v2/process-instances/search` work correctly. Confirmed the rest of the pipeline is sound by
> cancelling the two test instances via Camunda REST: the resulting `PROCESS_CANCELLED` event flowed
> correctly through collector → outbox → dispatch → inbox → `workflow_process_projection`. So this is a
> narrow Camunda secondary-storage/indexing gap for the user-task view in the current `orchestration`
> container (`ORCHESTRATION_CONFIG_FILE=application-h2.yaml`), not a bug in `WorkflowEventCollector` or
> `ho-so-service`. This does not contradict the "USER TỰ TEST THÀNH CÔNG" entry below — that test may
> have run against a different container state — but it means the "Việc của tôi" step is **not
> currently reproducible by automation** in this environment, so step 7 (smoke tự động) stays open until
> someone confirms the Camunda container's user-task indexing is actually working. Full root-cause
> writeup in `active-task.md`.

> **2026-07-19 — D20 RUNTIME TASK ACTION OWNERSHIP + REFACTOR PLAN LOCKED (owner user/Codex):** User
> chốt Action Studio và các lệnh `Phê duyệt`/`Trả lại`/`Từ chối` đều thuộc Service Quản trị quy trình;
> Service NVKHCN chỉ sở hữu Hồ sơ và phản ánh workflow event. Gap `/actions` được sửa nghĩa: không chuyển
> sang `ho-so-service`; cần thay endpoint monolith `POST /api/ho-so/{id}/actions` bằng task-centric API
> trên 8090, authorization + Action Studio policy server-side, idempotency/uncertain-result reconcile,
> event `TASK_ACTION_APPLIED`/`PROCESS_REJECTED`, projection-only update ở 8093, rồi Angular/gateway cutover
> và xóa direct write vào legacy `HoSoRepository`. D20 đã LOCKED; kế hoạch 8 lát và E2E AC nằm ở đầu
> `active-task.md`. Trạng thái: **PLAN APPROVED, IMPLEMENTATION NOT STARTED**.

> **2026-07-19 — E2E TẠO HỒ SƠ → GỬI DUYỆT → CAMUNDA → VIỆC CỦA TÔI: USER TỰ TEST THÀNH CÔNG (owner
> user).** User báo đã tự cutover local dev (backend Quy trình cổng 8090 + `ho-so-service` cổng 8093 +
> Caddy) và tự test thành công full luồng qua UI/API: Tạo hồ sơ → Gửi duyệt → đẩy hồ sơ sang Service
> Quản trị quy trình (Camunda) → phản ánh lại trạng thái hồ sơ → thấy việc ở `/viec-cua-toi` (Service
> Quản lý NVKHCN). Đóng gap #7 và bước 6 trong entry E2E gap assessment 2026-07-18 (xem dưới) — agent
> **chưa** trực tiếp quan sát log/output của lần test này, chỉ ghi nhận theo báo cáo trực tiếp của user.
> Còn treo: (a) script smoke tự động hoá cho luồng này (bước 7, khác với test thủ công vừa xong), (b)
> gap #6 `/actions` vẫn dùng implementation monolith trực tiếp sửa Hồ sơ; theo D20 phải giữ action ở
> Service Quy trình nhưng refactor thành task-centric + event-driven, không chuyển sang Service Hồ sơ.
> Chi tiết đầy đủ ở đầu `active-task.md`.

> **2026-07-18 — D19 APP LIST + PHÂN QUYỀN THEO APP DONE + VERIFIED (owner Codex):** Angular giữ một
> shell nhưng có ba App logic `qlnvkhcn`/`quytrinh`/`he-thong`; login luôn vào `/chon-ung-dung`, menu và
> toàn bộ feature route fail-closed theo entitlement + App đang chọn. Demo entitlement nằm trên RBAC hiện
> có và không được coi là backend authorization. `ho-so-service` có read endpoint trạng thái outbox/inbox
> nội bộ + hồ sơ `START_FAILED`; `/nhat-ky` thêm tab "Đồng bộ nội bộ", tách khỏi sáu hệ thống ngoài.
> Backend **35/35 PASS**; frontend targeted **16/16 + 4/4 PASS**, production build GREEN. Full frontend
> **166/167**, chỉ còn một timeout `service-task-config` flaky có sẵn. Browser không có phiên khả dụng nên
> chưa click-through thật; Caddy binary không được cài nên chưa validate config. Chi tiết ở đầu
> `active-task.md`.

> **2026-07-18 — PORT ANGULAR MÀN VIỆC CỦA TÔI (`/viec-cua-toi`) DONE + VERIFIED (owner Claude):**
> route `/viec-cua-toi` (trước đó `PlaceholderPage`) nay là bản port của `webapp/src/pages/
> Worklist.tsx` — Bước 5 của task E2E "Tạo hồ sơ → Gửi duyệt → Camunda → Việc của tôi" (xem entry
> ngay dưới), làm song song và trước Bước 3/4 theo chỉ định của user. Nối thẳng `GET /api/ho-so` thật
> (lọc PROCESSING + `steps[buocHienTai]`); vì Bước 3 (`/api/my-tasks`)/Bước 4 (role mapping đầy đủ)
> chưa xong, đã bổ sung tối thiểu `roleCodes` CLIENT-SIDE vào `DemoUser`
> (`core/auth/demo-users.ts`) + `core/auth/permissions.ts` (port `canProcessStep`/`hasAnyRole` từ
> `webapp/src/data/permissions.ts`) chỉ để lọc UI — không phải RBAC backend thật, Bước 4 đầy đủ vẫn
> là việc của Codex. `npx ng test` **155/157 PASS** (9 test mới), 2 fail còn lại pre-existing/flaky
> (fetch icon mạng, không liên quan); `npx ng build` GREEN. Không đụng file nào của Codex
> (`services/ho-so-service/**`, `backend/.../{camunda,workflow,service,web,domain,repository,
> security}`). Chưa click-through trình duyệt thật; khi Bước 3/4 xong cần đổi nguồn dữ liệu sang
> `/api/my-tasks` và bỏ `roleCodes` tạm. Chi tiết đầy đủ ở đầu `active-task.md`.

> **2026-07-18 — E2E LÁT 5 BƯỚC 2 TASK/STATUS PROJECTION + RECONCILE DONE + VERIFIED (owner Codex):**
> `ho-so-service` nay có Flyway V5 với task/process projection, cập nhật `dossier_step`,
> `ho_so.buoc_hien_tai` và trạng thái hồ sơ trong cùng transaction nhận event. Projector khóa hồ sơ và
> rebuild từ toàn inbox theo `(occurredAt,eventId)`, nên duplicate là no-op, completion giao trước creation
> không mở task lại và process terminal không bị event cũ làm lùi. Reconciler mỗi 5 giây phục hồi row chưa
> processed và lưu lỗi poison. Service **23/23 test PASS**. PostgreSQL 16 thật: Flyway V1–V5 + Hibernate
> validate xanh; smoke HTTP out-of-order/duplicate trả `202 → 202 → 200`, task vẫn `COMPLETED`, bước
> `Task_1` `DONE`, inbox 2/2 processed; process/DB/log tạm đã dọn. **Next:** API `GET /api/my-tasks`
> lọc server-side + contract test. Chi tiết `docs/arch/nvkhcn-ho-so-slice-5-step-2-workflow-projection.md`.

> **2026-07-18 — PORT ANGULAR MÀN NHẬT KÝ (`/nhat-ky`) DONE + VERIFIED (owner Claude):** route
> `/nhat-ky` (trước đó `PlaceholderPage`) nay là bản port đầy đủ của `webapp/src/pages/
> ProcessEventLog.tsx` — 2 tab: "Nhật ký luồng" (lịch sử sự kiện Zeebe per-hồ sơ, giữ mock vì chưa có
> backend lưu history Camunda — `core/models/process-event.ts` mới) và "Nhật ký tích hợp" (bảng job
> worker cross-hồ sơ, nối thẳng `GET /api/integration-systems/{key}/job-runs` thật đã có từ lát
> `/tich-hop` thay vì lặp lại seed mock — qua `AskUserQuestion` user chọn phương án này để giữ một
> nguồn sự thật). `npx ng build` GREEN (chunk `nhat-ky` 17.33 kB); `npx ng test` 4/4 test mới PASS,
> full suite 145/148 (3 fail còn lại là timeout fetch icon qua mạng, pre-existing/flaky, đổi lượt mỗi
> lần chạy — không liên quan). Không đụng file của phiên song song khác đang chạy trên backend/
> `services/ho-so-service` (xem entry E2E gap assessment ngay dưới). Chưa click-through trình duyệt
> thật. Chi tiết đầy đủ ở đầu `active-task.md`.

> **2026-07-18 — E2E LÁT 5 BƯỚC 1 WORKFLOW EVENTS → INBOX/DEDUP DONE + VERIFIED (owner Codex):**
> backend Quy trình nay quét lifecycle thật từ Camunda Search cho các process đã mapping, phát năm
> event `TASK_CREATED`/`TASK_COMPLETED`/`PROCESS_COMPLETED`/`PROCESS_CANCELLED`/`INCIDENT_CREATED`
> qua outbox V15 có source key/event ID ổn định, lease, retry/backoff và internal bearer HTTP.
> `ho-so-service` nhận tại `POST /internal/v1/workflow-events`, lưu inbox V4 atomic bằng
> `INSERT ... ON CONFLICT DO NOTHING`; duplicate cùng payload trả 200, same-id/different-payload 409,
> thiếu token 401. Backend 165 test (1 skipped), service Hồ sơ 20/20 xanh. PostgreSQL 16 smoke thật:
> Flyway/Hibernate validate và hai app khởi động; HTTP 202 → 200 → 409, inbox count=1; tài nguyên tạm
> đã dọn. Bước này cố ý chưa projection. **Next:** task/status projection + reconcile với test
> duplicate/out-of-order. Chi tiết `docs/arch/nvkhcn-ho-so-slice-5-step-1-workflow-events.md`.

> **2026-07-18 — E2E GAP ASSESSMENT: TẠO HỒ SƠ → GỬI DUYỆT → CAMUNDA → VIỆC CỦA TÔI (owner Codex):**
> Luồng đã có code thật tới bước khởi tạo đúng một process instance: Angular tạo/gửi hồ sơ,
> `ho-so-service` submit bằng transactional outbox, backend Quy trình start idempotent và từng được
> E2E với PostgreSQL + Camunda thật. Phần chặn nghiệm thu end-to-end hiện là đường quay về Service
> Quản lý NV KHCN: chưa có workflow task/completion/incident events, inbox/dedup và task/status
> projection trong `ho-so-service`; chưa có API `GET /api/my-tasks` lọc server-side theo assignee /
> candidate groups; Angular `/viec-cua-toi` vẫn là `PlaceholderPage`; demo auth chưa có `userId` /
> `roleCodes` để ánh xạ các nhóm BPMN (`PM`, `CQ_KHCN`, `HDKHCN`, ...). `/actions` vẫn ở monolith và
> chỉ được chuyển sau khi duplicate/out-of-order event tests xanh. Runtime kiểm tra cùng ngày:
> Angular 4200, PostgreSQL và Camunda 8080/26500 đang chạy; backend cũ 8091 chạy nhưng
> `/api/tasks` trả 404 và `/api/ho-so` rỗng; workflow backend 8090 và `ho-so-service` 8093 chưa chạy,
> nên chưa thể test luồng tích hợp trên topology hiện tại. **Next:** Lát 5 theo thứ tự events →
> inbox/dedup → projection + reconcile → `/api/my-tasks` → role mapping → port Worklist Angular →
> ghép/cutover runtime → smoke tự động tạo hồ sơ, submit, chờ `PROCESSING`, rồi xác nhận user nhóm
> `PM` nhìn thấy đúng `maHoSo` và `Task_1`.

> **2026-07-18 — D18 TÁCH SERVICE HỒ SƠ — LÁT 4 CODE DONE + REAL E2E VERIFIED (owner Codex):**
> `ho-so-service` nay submit theo transaction `DRAFT/START_FAILED -> START_PENDING + outbox`, dispatcher
> HTTP có retry/backoff + lease phục hồi crash và chuyển `PROCESSING`/`START_FAILED`. Backend Quy trình
> có internal bearer auth, canonical payload hash, inbox idempotency, process mapping, allowlist variables
> và reconcile Camunda bằng `qtkhcnStartRequestId`; duplicate cùng payload trả 200, payload khác trả 409.
> Gateway seam chuyển `/submit` cùng business writes sang service Hồ sơ; `/actions` vẫn ở monolith tới
> Lát 5. PostgreSQL/Camunda E2E thật: submit 202 -> outbox SENT -> đúng 1 instance, mô phỏng mất response
> bằng inbox UNKNOWN rồi retry vẫn trả process key cũ và correlation count=1. Service 16/16, backend
> 164 test (1 skipped), Angular build + targeted test xanh; smoke process đã cancel, DB/process/port tạm
> đã dọn, chưa cutover live. Next: Lát 5 workflow events/inbox projection. Chi tiết
> `docs/arch/nvkhcn-ho-so-slice-4-reliable-start.md`.

> **2026-07-18 — D18 TÁCH SERVICE HỒ SƠ — LÁT 3 CODE DONE + LOCAL VERIFIED (owner Codex):**
> user cho phép bỏ qua cửa sổ canary traffic thật 30 phút của Lát 2D (gate không có report và không
> được coi PASS) để tiếp tục. `ho-so-service` nay có business CRUD Nhiệm vụ/Hồ sơ nháp/tài liệu,
> optimistic `ETag`/`If-Match`, actor bắt buộc, Flyway V2 + audit và business sequence. Monolith có
> legacy-write kill switch; gateway write seam chỉ route business CRUD, giữ `/submit`/`/actions` ở
> service Quy trình tới Lát 4–5. PostgreSQL real smoke CRUD/version/audit + rollback/backfill parity
> 5/5 xanh; service 13/13 test, backend 158 test (1 skipped), Angular targeted 5/5 + build, Caddy
> validate và PowerShell parser đều xanh. Chưa cutover live vì môi trường hiện tại thiếu release
> root/Caddy/monolith 8090; service smoke đã dừng và port 8093 đã giải phóng. Next: Lát 4 outbox +
> start-process idempotent/inbox. Chi tiết `docs/arch/nvkhcn-ho-so-slice-3-write-ownership.md`.

> **2026-07-18 — PORT ANGULAR + BE MÀN TÍCH HỢP (`/tich-hop`) DONE + VERIFIED (owner Claude):**
> route `/tich-hop` (trước đó `PlaceholderPage`) nay là bản port đầy đủ của `webapp/src/pages/
> IntegrationStatus.tsx` + `MappingStudio.tsx`/`MappingFieldEditor.tsx` — 2 tab thật (Tổng quan: card
> hệ tích hợp + kết nối/ngắt kết nối/xem chi tiết; Mapping dữ liệu: CRUD field mapping + preview +
> kích hoạt fail-closed) và 3 tab "sắp có" giữ nguyên như React. Backend mới hoàn toàn: 3 bảng
> Flyway `V13__integration.sql` (`integration_system` seed 6 hệ QLNS/MS/SAP/QLTS/PLM/IAM,
> `integration_job_run` đọc-chỉ seed 6 dòng, `integration_mapping` seed 3 mapping), API
> `/api/integration-systems` (list/job-runs/connect/disconnect, `If-Match`+actor đúng pattern eForm)
> và `/api/integration-mappings` (CRUD fields + status, port `validateMappingConfig` sang Java,
> fail-closed giữ nguyên "luôn ghi lại trạng thái kể cả khi Active thất bại"). API key chỉ lưu
> SHA-256 hash + 4 ký tự cuối, không có plaintext. Angular `core/services/integration-*.service.ts`
> HTTP-backed ngay từ đầu (không qua giai đoạn mock). Preview payload lấy mẫu từ `NhiemVuService`/
> `HoSoService` thật thay vì seed tĩnh React (NhanSu vẫn rỗng — trung thực về giới hạn contract hiện
> có, giống cách TaiSan được xử lý ở bản gốc). Backend `mvn -o test` **158/158 PASS, 1 skipped**
> (28 test mới); Angular `ng build` GREEN (chunk `integration-status` 50.15 kB), `ng test` giữ
> 130+3 file mới PASS (chỉ `approval-matrix.spec.ts` timeout mạng — xác nhận pre-existing/flaky,
> không liên quan). **Real Postgres smoke thật** trên DB tạm `qtkhcn_v13_verify` + backend tạm cổng
> **8097** (không đụng 8090 live demo/8091 dev): connect/disconnect với optimistic lock (409 đúng khi
> stale), tạo/sửa/activate mapping fail-closed đúng cả 2 nhánh (thiếu field → error; đủ field →
> active), xoá sạch, dừng process + xoá DB tạm sau khi xong. Phát hiện phụ không phải do lát này:
> phiên song song khác đang có bug thật ở `V14__workflow_start_inbox.sql` (cột `payload_hash` sai
> kiểu, Hibernate validate fail khi boot full app) — không sửa, không phải phạm vi. **Chưa ghép vào
> jar tổng hợp cổng dev 8091** (đang chạy jar khác + có phiên song song đang sửa dở) và chưa
> click-through trình duyệt thật. Chi tiết đầy đủ ở đầu `active-task.md`.

> **2026-07-16 — BACKEND DEV 8091 RESTART + FLYWAY V12 APPLIED (owner Codex):** migration
> `V12__eform_rd0202.sql` đã được copy byte-identical vào worktree jar tổng hợp, `clean package`
> **111/111 test PASS**, restart PID 26948 → PID **23944**. Flyway nâng PostgreSQL `qtkhcn.public`
> từ v11 lên **v12** thành công. Real API: eForm HTTP 200 trả **39 form** (8 gốc + 31 RD02.02),
> Approval Matrix HTTP 200, Action Studio HTTP 200. Log tại `backend-8091-v12.log`.

> **2026-07-16 — PORT ANGULAR + GHÉP BE MÀN CHI TIẾT HỒ SƠ DONE + VERIFIED (owner Codex):**
> route lazy `/ho-so/:id` port màn React tham chiếu `/ho-so/HS-2026-031`, gồm thông tin hồ sơ,
> trạng thái/cảnh báo, sơ đồ bước, tài liệu, timeline và các mutation gửi duyệt/phê duyệt/trả lại/
> từ chối gọi API thật. Backend `HoSoResponse` thêm `taiLieu[]` + `thoiGianThucHien`; contract được
> đồng bộ vào service Hồ sơ tách mới để read-canary không lệch shape. Link từ danh sách Hồ sơ và
> Chi tiết Nhiệm vụ đã trỏ tới route mới. Backend chính **127 tests (1 skipped) PASS**; service Hồ
> sơ **8/8 PASS**; Angular **31 files/130 tests PASS**, production build GREEN. Chưa restart jar
> tổng hợp 8091/click-through để không phá topology của các workstream song song.

> **2026-07-16 — KHỞI TẠO eFORM CHO RD02.02 DONE + VERIFIED (owner Claude):** seed 31 eForm mới
> (`backend/src/main/resources/db/migration/V12__eform_rd0202.sql`) vào bảng `eform` có sẵn, theo
> đúng cột "Mã biểu mẫu" ở Bảng A của tài liệu nguồn RD02.02 — 20 mã BM.02.01→BM.02.20 (gộp trùng các
> bước dùng lại cùng bộ biểu mẫu) + 11 mã `[MỚI]` (PNX nội bộ VHT/Tập đoàn, biên bản bàn giao, phiếu
> kiểm tra hồ sơ, CV đề nghị thẩm định); `bm-02-17-ttr-nv` giữ nguyên cảnh báo `[CHƯA CHỐT]` của tài
> liệu nguồn. Mỗi form là bản scaffold (header + vài trường theo Bảng B), cố ý không có trường
> `ketLuan` quyết định (đúng D10). Verify thật: áp `V11`+`V12` vào DB Postgres tạm trên container
> `qtkhcn-postgres` (không đụng `qtkhcn` dùng chung) → 39/39 dòng đúng, JSON hợp lệ, không vi phạm
> CHECK; `EformServiceTest` 7/7 + `EformHttpContractTest` 5/5 PASS. Chưa binding formKey vào Action
> Studio, chưa restart 8091 (giữ nguyên topology cho task song song khác), chưa gộp sang worktree
> Approval Matrix, chưa click-through UI. Chi tiết ở đầu `active-task.md`.

> **2026-07-16 — GHÉP BE VÀO FE `/phan-he/PH3/bieu-mau` (eForm) DONE + VERIFIED (owner Claude):**
> `/api/eform` mới (Flyway `V11__eform.sql`, seed đúng 8 form gốc) thay `EformService` signal
> in-memory bằng HTTP-backed store (`load`/`loadOne`/`addForm`/`updateMeta`/`updateSchema`/
> `removeForm`, optimistic lock `If-Match`, actor header) — đúng pattern Ma trận phê duyệt/Action
> Studio. Xoá ~220 dòng seed data chết khỏi `core/models/eform.ts`. Backend `mvn -o test` full
> suite PASS (2 test file mới); Angular `ng test` **28/28 file, 123/123 PASS**; `ng build` GREEN.
> **Phát hiện + xử lý lệch môi trường có thật** (không phải do lát này): DB Postgres dev dùng chung
> thiếu file `V9__approval_matrix.sql` (chỉ có trong worktree riêng `ql-nvkhcn-be-approval-matrix`)
> khiến workspace chính không restart được — user chọn copy file đó (nguyên byte) vào workspace
> chính qua `AskUserQuestion`; sau đó **real Postgres smoke test PASS đầy đủ** (create/update/
> If-Match 409/delete/404, 8 seed không bị đụng). Theo lựa chọn thứ 2 của user qua
> `AskUserQuestion`, đã **gộp code eForm (9 file, nguyên byte) vào worktree Approval Matrix**
> thành 1 jar tổng hợp 3-trong-1 — `mvn -o test` GREEN tại worktree, real-stack xác nhận cả
> `/api/approval-matrix`, `/api/action-studio`, `/api/eform` cùng sống trên cổng 8091 (PID 26948).
> Angular dev server (`ng serve` trỏ `localhost:8091`) nay gọi `/api/eform` thật được. Live demo
> 8090 không bị đụng trong suốt quá trình. Chi tiết đầy đủ ở đầu `active-task.md`.

> **2026-07-16 — PORT "THƯ VIỆN BIỂU MẪU" (eFORM) REACT → ANGULAR DONE + VERIFIED (owner Claude):**
> route `/phan-he/PH3/bieu-mau` (trước đó `PlaceholderPage`) nay là bản port đầy đủ của
> `webapp/src/pages/FormLibrary.tsx` + `FormDesignerPage.tsx`/`FormDesigner.tsx` (D12 B-engine renderer
> + D13 AntD builder chrome trên engine `@bpmn-io/form-js`). User chọn full parity qua
> `AskUserQuestion`. Thêm dependency mới `@bpmn-io/form-js`/`feelin` + CSS vendor vào `angular.json`
> (bump budget 2.3→2.5MB). 6 lát: `core/models/eform.ts` (+ `eform-runtime.ts` tách logic FEEL/
> validate/dynamiclist) → `core/services/eform.service.ts` (signal store, **cố ý bỏ stat "Đang dùng"**
> vì nguồn mock `ProcessContext.taskSteps` gốc đã bị thay bằng backend BPMN thật, không có dữ liệu
> tương đương) → `shared/form-renderer/` (renderer AntD thuần, không cần engine form-js) →
> `shared/form-designer/` (wrapper `FormEditor` + palette/properties panel AntD tự viết D13, dictionary
> Việt hoá form-js riêng, **cố ý bỏ `khcnFormSimplePanelModule` và phần vá relabel palette/panel
> NATIVE** vì panel đó bị ẩn trong kiến trúc Angular — port sẽ là code chết) → CSS skin canvas scoped
> từ `bpmnio-skin.css` → `pages/form-library/` + `pages/form-designer-page/` + routes/icons
> (`EFORM_ICONS`, 23 icon mới). Không đụng file của phiên song song khác đang chạy "Tách Service Quản
> lý NV KHCN & Hồ sơ" (đã xác nhận qua `git status`). `npx ng build` GREEN (`form-designer-page` lazy
> chunk 509.49 kB, `form-library` 8.45 kB); `npx ng test --watch=false` **28/28 file, 119/119 test
> PASS** (11 test mới). Chưa click-through trình duyệt thật. Chi tiết đầy đủ ở đầu `active-task.md`.

> **2026-07-16 — PORT "TÁC VỤ HỆ THỐNG" (SERVICE TASK CONFIG) REACT → ANGULAR DONE + VERIFIED (owner
> Claude):** route `/cau-hinh-service-task` (trước đó `PlaceholderPage`) nay là bản port đầy đủ 6 tab
> của `webapp/src/pages/ServiceTaskConfig.tsx`. Không backend: signal-based `ServiceTaskService` thay
> `ServiceTaskContext.tsx`. Kiến trúc tách shared component (mapping-editor/form-drawer/binding-table/
> test-panel/execution-drawer) giống Ma trận phê duyệt, cộng 3 data model scoped mới
> (`integration-system.ts`/`integration-mapping.ts`/`process-registry.ts` — subset các file React phụ
> thuộc, bỏ phần chưa cần vì màn Tích hợp/Danh mục quy trình chưa lên Angular). Sửa mojibake encoding
> trong `ServiceTaskExecutionDrawer.tsx` gốc khi port (gõ lại đúng UTF-8, không copy chuỗi hỏng).
> **Đụng độ phiên song song thật**: giữa lúc làm, một phiên khác tự làm y hệt feature này độc lập
> (page 1-file không đủ chức năng, tự nhận "bản port nhanh" — thiếu 2/6 tab và form không lưu được),
> đồng thời cũng đang làm Action Studio (backend Java + Flyway V10) và đụng
> `app.routes.ts`/`app.ts`/`icons-provider.ts`. Dừng lại dùng `AskUserQuestion` báo cáo thay vì tự ý
> ghi đè; user xác nhận phiên kia đã xong và yêu cầu kiểm tra/giữ 1 bản — xóa bản thiếu chức năng, giữ
> `core/models/service-task.ts` (không bị phá), hoàn thiện kiến trúc đầy đủ. `npx ng build` GREEN
> (lazy chunk 138.65 kB); `npx ng test --watch=false` **23/23 file, 102/102 test PASS** (15 test mới).
> Chưa click-through trình duyệt thật. Chi tiết đầy đủ ở đầu `active-task.md`.

> **2026-07-16 — TÁCH SERVICE QUẢN LÝ NV KHCN & HỒ SƠ — LÁT 0 IN PROGRESS (owner Codex):**
> user thống nhất tách `NhiemVu`/`HoSo` và dữ liệu nghiệp vụ sang service mới; service Quản trị quy
> trình chỉ nhận lệnh start chứa correlation/control data tối thiểu và tiếp tục sở hữu Camunda cùng
> cấu hình workflow. Plan tại `docs/arch/nvkhcn-ho-so-service-extraction-plan.md`: transactional
> outbox + start idempotent, workflow events/inbox, DB ownership, gateway routing, migration theo
> strangler, failure tests và rollback. Đã thêm `NhiemVuHttpContractTest` (5 test) và
> `HoSoHttpContractTest` (8 test), khóa schema/status/error/auth/CORS cùng submit/action legacy;
> test riêng 13/13 và toàn backend 103/103 PASS. Next: hoàn tất characterization `HoSoServiceTest`
> và baseline/rollback artifacts của Lát 0.

> **2026-07-16 — ACTION STUDIO ANGULAR ↔ SPRING BOOT INTEGRATION DONE + VERIFIED (owner Codex):**
> `/cau-hinh-hanh-dong` không còn resolve/mutation bằng runtime seed store. Spring Boot + Flyway V10
> lưu action/presentation, luật khả dụng, chính sách Chi tiết và audit; `/api/action-studio` cung cấp
> config, CRUD/status với `If-Match`, simulate fail-closed, reconcile/scaffold. Angular gọi HTTP thật
> cho toàn bộ luồng và chỉ cập nhật signal cache sau thành công. Backend chính 90/90 PASS; backend
> tổng hợp Approval+Action 99/99 PASS + package; Angular 21/21 file · 87/87 PASS, build GREEN.
> PostgreSQL smoke V10 + GET/simulate/create-delete/audit PASS; Approval Matrix không regression.
> Backend dev 8091 đang chạy JAR tổng hợp PID 21584. Chưa browser click-through, chưa commit/deploy.

> **2026-07-16 — APPROVAL MATRIX ANGULAR ↔ SPRING BOOT INTEGRATION DONE + VERIFIED (owner Codex):**
> `/ma-tran-phe-duyet` không còn dùng seed store cho runtime. Angular đã nối đủ rules CRUD/status
> (optimistic `If-Match`), slots CRUD/status (`force=true` sau confirm), versions/audit, analyze và
> resolve vào `/api/approval-matrix`; signal chỉ còn là cache sau HTTP thành công. Full Simulation
> gọi backend thật; mini-simulator bản nháp vẫn chạy local có chủ đích. Angular 20/20 file · 82/82
> test PASS, production build GREEN. Backend 91/91 test PASS. Real PostgreSQL/Flyway smoke trả 7
> rules, 5 slots và resolve `PHE_DUYET + TD + 12 tỷ` → `AM-05 / U-013 / ANY_ONE`. Backend dev 8091
> đã chạy jar mới; backend live 8090/Caddy/Docker không bị đụng. BE nằm ở worktree
> `fix/approval-matrix-backend`, FE ở workspace chính; cả hai chưa commit theo nguyên tắc chỉ commit
> khi user yêu cầu.

> **2026-07-16 — FIX: LƯU NHÁP BPMN BÁO LỖI "process executable" KHI CÓ POOL — DONE + LIVE (owner
> Claude).** `bpmn-modeler.ts` `exportXml()` chỉ nhận diện `bpmn:Process` render trực tiếp trong
> `elementRegistry`; khi sơ đồ có Pool (root đổi thành `bpmn:Collaboration`), process thật nằm ở
> `participant.processRef` nên bị coi là "không có process executable". Thêm
> `executable-process.ts` (`resolveExecutableProcess`, có unit test) xử lý cả 2 trường hợp, dùng
> đúng API `modeling.updateModdleProperties()` cho trường hợp Pool; chặn rõ khi có >1 Pool có
> process (khớp rule backend chỉ 1 process executable). Làm trên nhánh `fix/bpmn-modeler-process-
> executable` (từ `agent/deploy-github-pages`, quy ước `fix/<ten-loi>` ở
> `docs/plan_deploy/standard-deploy-workflow.md`) trong git worktree riêng để không đụng các thay
> đổi chưa commit của workstream khác đang chạy song song trên cùng repo. Verify: `tsc --noEmit`
> sạch, `ng test` 16/16 file · 63/63 test PASS (lỗi icon `plus-o` trong `assignment-builder.spec.ts`
> là pre-existing, không liên quan), `ng build` production GREEN. Đã fast-forward merge vào
> `agent/deploy-github-pages` (commit `2b47b70`), cắt release demo mới (`New-DemoRelease.ps1
> -Commit 2b47b70`, health-check port đổi sang 8095 vì 8091 mặc định bị một tiến trình lạ khác
> chiếm — không kill tiến trình không rõ chủ) và `Switch-DemoRelease.ps1 -ReleaseId
> 2026-07-16.1_2b47b70` theo yêu cầu trực tiếp của user. Live demo `https://drab-quail.runlocal.eu/`
> đã chạy release này (SHA `2b47b70` xác nhận qua `git rev-parse` tại `qtkhcn-demo/current`, chuỗi
> "process executable" xác nhận có trong bundle deploy); post-cutover: backend 8090 healthy, CORS
> đúng origin, Caddy vẫn chạy, `401` không auth qua public URL. Chưa test click-through UI thật
> (không có browser tool) — người dùng nên tự vẽ Pool + lưu nháp trên live để xác nhận UX.

> **2026-07-16 — PORT "MA TRẬN PHÊ DUYỆT" REACT → ANGULAR DONE + VERIFIED (owner Claude):** route
> `/ma-tran-phe-duyet` (trước đó `PlaceholderPage`) nay là bản port đầy đủ của
> `webapp/src/pages/ApprovalMatrix.tsx` — trang lớn/phức tạp nhất trong React app (~5300 dòng gộp cả
> file liên quan). User chọn full parity qua `AskUserQuestion`. Không backend: signal-based service
> (`ApprovalMatrixService`/`ApprovalSlotCatalogService`) thay React Context, y hệt hành vi mock gốc
> (first-match theo priority, uỷ quyền theo hiệu lực, phân tích xung đột/thiếu fallback). UI gồm
> Condition Builder (cây AND/OR **tự đệ quy**), Assignment Builder, Simulation Panel (kịch bản lưu
> `localStorage`), 2 tab (Ma trận / Danh mục Loại phê duyệt). Route lazy-load (đo thực tế thấy eager
> đẩy initial bundle vượt budget 300kB; lazy giữ trong ngưỡng, bump budget tối thiểu 2.2→2.3MB).
> Phát hiện thật khi verify: `nz-icon` chưa đăng ký tĩnh cần mạng để fetch SVG động (vỡ trong unit
> test, không vỡ trong trình duyệt thật có mạng) — đăng ký tĩnh 10 icon mới; `NzModalService` cần
> `NzModalModule` trong `imports` (không phải `providedIn:'root'`). `npx ng build` GREEN (chunk lazy
> riêng 228.78 kB); `npx ng test --watch=false` **19/19 file, 80/80 test PASS** (6 spec mới). Chưa
> click-through trình duyệt thật. Chạy song song với workstream tách release demo Runlocal (owner
> Claude, entry ngay dưới) trên cùng repo — không đụng file deploy/infra của workstream đó; chưa
> commit gì (chỉ commit khi được yêu cầu rõ ràng). Chi tiết đầy đủ ở đầu `active-task.md`.

> **2026-07-16 — LIVE DEMO RELEASE ISOLATION IMPLEMENTED (owner Claude).** The gap flagged earlier
> today (live demo serving directly from this dev workspace) is fixed. Baseline committed
> (`backend/`, `frontend-angular/`, `infra/` were untracked before — see commits `466c224`,
> `82df984`, `c7ed96d`). New scripts `infra/demo-tunnel/New-DemoRelease.ps1` (git worktree under
> `C:\Users\phuctd7\qtkhcn-demo\releases\<release-id>`, builds backend+frontend from a clean
> checkout, dev-secret leak check, health check on a temp port — never touches live 8090/Caddy) and
> `Switch-DemoRelease.ps1` (the only script allowed to stop/restart the live backend; repoints the
> `qtkhcn-demo\current` junction). `Start-DemoProxy.ps1`/`Test-DemoReadiness.ps1` now default to
> serving from that junction. Cutover executed live: release `2026-07-16.1_fcb71c4` verified (health
> check on port 8091, no `localhost:8090`/`dev-local-only` in the demo bundle), then switched onto
> port 8090 with a one-time Caddy reload (config validated first). Post-cutover smoke: `401` with no
> auth and with wrong auth on both `127.0.0.1:8443` and the public
> `https://drab-quail.runlocal.eu/` (UI root and `/api/ho-so`), `200` on direct backend `/api/ho-so`
> with the (unchanged) dev API key, old backend PID confirmed terminated, Docker stack untouched.
> **Not yet done by Claude** (needs the human, since the real Basic Auth password was intentionally
> never read by the agent): log into `https://drab-quail.runlocal.eu/` with the real credential and
> confirm the UI loads and a read flow works, per the Go/No-Go checklist in
> `docs/plan_deploy/v1.md` §11. Future deploys: `New-DemoRelease.ps1` then
> `Switch-DemoRelease.ps1 -ReleaseId <id>` — no more editing this dev workspace's live output or
> touching Caddy/Runlocal for routine releases. `.harness/rules/demo-environment-safety.md` updated
> to match.

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
**Last updated**: 2026-07-17 (**Dashboard Optimize lãnh đạo DONE** trên branch `trangdt` —
rewrite `/tong-quan`: KPI tháng/quý, cycle/SLA/incident, charts tải bước + backlog + outcome DMN,
năng lực đơn vị, heatmap Unit×SLA + heatmap BPMN RD01.01 via `BpmnViewer` heat markers;
seed `data/optimizeAnalytics.ts`; thêm `recharts`. Frontend-mock, không đụng F1. Chi tiết
`active-task.md`.
Trước đó 2026-07-16 (**CURRENT — Angular UI cho Test BPMN (`/api/bpmn-tests`), DONE +
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

> **★ Lỗi C — `WorkflowTaskActionRouting.rd0202()` khoá cứng element id skeleton cũ: DONE + TEST VERIFIED
> (2026-07-21, owner Claude).** Chi tiết đầy đủ ở `.harness/state/active-task.md`. Tóm tắt: routing vẫn
> `switch` trên `Task_2/3/4/7` (id thuộc bản BPMN skeleton 7-task đã bị thay hẳn bởi RD02.02 v3 33-task
> trong commit `773264b`) — các id đó không còn tồn tại trong `processes/rd0202.bpmn` đang deploy. Khảo sát
> xác nhận BPMN v3 không có gateway nào đọc biến do user action set (chỉ `GCheck`/`G24`, cả hai đều
> system/DMN-driven) nên đã sửa `rd0202()` trả `Map.of()` không điều kiện và `RD02_02_RETURNABLE` về rỗng
> (fail-closed có chủ đích — bật RETURN_STEP mà chưa có gateway hiệu chỉnh thật sẽ khiến nó chạy y hệt
> APPROVE_STEP). Thêm `WorkflowTaskActionRoutingTest.java` (22 case, class này trước đó **0 test**).
> `mvn -o test` **231/231 PASS**. Chưa verify runtime (rủi ro thấp vì không gateway nào phụ thuộc thay đổi).

> **★ Ma trận quyết định — DRD nhiều bảng nối chuỗi: DONE + RUNTIME VERIFIED
> (2026-07-21, owner Claude).** Theo plan `docs/arch/update_matran_quyet_dinh_plan.md` (bước 1–2 backend
> đã có từ commit `773264b`, phiên này làm nốt backend 3–7 + toàn bộ frontend). Backend: Flyway **V25**
> `dmn_rule_version_decision` (1 dòng/decision đã deploy, cờ `is_root`), entity/repository mới,
> `DmnRuleService.activate()` lưu đủ mọi decision và trỏ 4 cột số ít cũ vào "primary root" (giữ CHECK V7),
> `evaluate()` chạy từ mọi root + **fallback** cột số ít cho version deploy trước V25;
> `EvaluateDmnDecisionResponse` đổi shape sang `{decisions:[...]}` (breaking có chủ đích, chỉ Angular dùng).
> Frontend: `DecisionGrid` thay `DecisionTableDefinition`, `dmn-xml.ts` viết lại thành
> `dmnXmlToDecisionGrid`/`decisionGridToDmnXml` (tự suy `informationRequirement` theo tên biến, giữ
> hitPolicy verbatim — bỏ hẳn giới hạn FIRST), trang chi tiết thành nhiều `nz-card` 1 bảng/card + cấu hình
> cột + gán nguồn, tab Chạy thử hiển thị 1 card/quyết định.
> **Verify đã chạy:** backend `mvn -o test` **207/207 GREEN**; Angular `ng build` GREEN, `ng test`
> **202/202 GREEN** (đã kiểm chứng spec mới thực sự chạy bằng canary assert cố tình fail rồi revert).
> **Runtime thật ĐÃ CHẠY (2026-07-21, stack Docker → 8090 → 8093 → 4200):** dựng luật `BR-DRD-3-BANG`
> 3 bảng nối chuỗi (`Xac dinh cap nhiem vu` FIRST → `Can hoi dong` UNIQUE → `Loai hoi dong` FIRST) bằng
> **chính UI mới**, không nhập XML tay. V25 apply sạch lên DB dev; activate deploy đủ **3 decision với 3
> `camunda_decision_key` riêng biệt** lên Zeebe thật, `is_root=true` đúng duy nhất ở decision cuối chuỗi,
> `display_order` giữ thứ tự; tab Chạy thử trả đủ 3 card đúng thứ tự và đổi input gốc thì cả chuỗi đổi
> theo (`15 → TAP_DOAN/true/HDXD_TAP_DOAN`, `5 → CO_SO/false/KHONG`), hitPolicy UNIQUE chạy thật OK.
> **Runtime bắt được 1 bug thật mà toàn bộ unit test bỏ lọt:** `decisionGridToDmnXml` không phát ra
> `<variable>` trên `<decision>`, nên Camunda không bind kết quả bảng trước — bảng sau đọc ra null và
> không khớp dòng nào (chuỗi trả sai `KHONG` thay vì `HDXD_TAP_DOAN`). Test cũ chỉ round-trip XML nên
> không phát hiện: **XML round-trip đúng vẫn có thể không chạy được trên engine thật.** Đã sửa: mỗi
> `<decision>` khai báo `<variable>`; bảng 1 cột kết quả đặt tên biến quyết định trùng tên biến output
> (bảng sau tham chiếu thẳng), bảng nhiều cột kết quả trả context nên tham chiếu qua `dv_<id>.<biến>` và
> parser đọc ngược bỏ tiền tố. Thêm 2 test khoá đúng lỗi này. Verify lại sau sửa: `ng test`
> **204/204 GREEN**, `ng build` GREEN, và chạy lại end-to-end trên Camunda thật cho kết quả đúng.
> Fixture `webapp/src/dmn/rd02Routing.dmn.ts` (bản React tham chiếu) **cũng thiếu `<variable>`** — nó
> chưa từng chạy trên Camunda thật (webapp eval bằng `feelin` in-browser), nên đừng coi nó là chuẩn
> runtime. Dữ liệu test `BR-DRD-3-BANG` v1–v3 còn nằm lại trên DB/Zeebe dev.

> **Status**: DONE + RUNTIME VERIFIED (2026-07-21, owner Claude) — cả 3 gap chặn luồng RD02.02 v3 (smoke
> test 2026-07-20) đã đóng và verified trên stack thật, không chỉ source: (1) token
> `QTKHCN_WORKFLOW_SERVICE_TOKEN`/`QTKHCN_HO_SO_SERVICE_TOKEN` giữa 8090↔8093 đã đồng bộ lại (restart
> đồng thời, verify 2 chiều qua HTTP thật); (2) `SystemCheckJobWorker.checkRd0202DefaultCondition()` đã
> nối `@JobWorker(type = "khcn.rd0202.check-default-condition")`, và nâng lên **validate thật** qua
> `Rd0202ConditionValidator`/`Rd0202DefaultConditionService` (không còn stub `true` cứng) — trả `false`
> quay `GCheck` về T02 khi hồ sơ thiếu điều kiện; (3) `ho-so-detail.ts` đổi `permissions: []` →
> `permissions: ALL_PERMISSIONS`, nút "Gửi duyệt" hiện đúng cho user thường (click-through Playwright xác
> nhận). Full E2E `Invoke-RD0202V3E2E.ps1` PASS đủ 56 task `T01→T33`, `submit→PROCESSING→APPROVED`. Chi
> tiết + bằng chứng ở đầu `active-task.md`.
>
> **Next action còn lại (từ list cải thiện user đưa ra, CHƯA làm — không phải blocker):** #3 CI check đối
> chiếu BPMN đã deploy trên Camunda với `rd0202.bpmn` trong repo; #5 form validation/evidence bắt buộc
> cho các bước lớn khác ngoài `Check` (T05 hội đồng, T06...); #6 script Playwright E2E qua browser tái sử
> dụng được cho vài chặng chính (khác với click-through thủ công một lần đã làm). Không có việc nào trong
> 3 việc này chặn foundation hay feature work khác — chờ chỉ đạo tiếp theo của user.

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
> **★ ACTIVE TASK (2026-07-17, branch `trangdt`): Dashboard Optimize lãnh đạo — DONE
> (frontend mock).** Màn `/tong-quan` hiển thị KPI + charts + heatmap BPMN theo mô tả Optimize;
> seed mock, chưa nối API. Chờ feedback UI từ user.
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

- ~~8090↔8093 internal service token lệch (401) — phát hiện 2026-07-20 qua smoke test RD02.02 v3.~~
  **RESOLVED 2026-07-20**, kèm 2 gap còn lại đóng nốt 2026-07-21 (RD02.02 `Check` thiếu job worker, nút
  "Gửi duyệt" gửi `permissions: []`) — cả 3 gap verified runtime, full 56-task E2E PASS. Xem entry đầu
  file này và đầu `active-task.md`.
- ~~Live demo has no release isolation~~ **RESOLVED 2026-07-16.** Fixed same day it was flagged —
  see the dated entry near the top of this file and `.harness/rules/demo-environment-safety.md`.
  Routine deploys now go through `New-DemoRelease.ps1` + `Switch-DemoRelease.ps1`; this dev
  workspace no longer serves the live demo directly. Still open: human should confirm real Basic
  Auth login on the public URL (agent never had the plaintext password).
- **F1 stack decisions RESOLVED 2026-07-15** (D14–D17: Java/Spring Boot backend, PostgreSQL, Camunda 8 Self-Managed dev via Docker Compose, Angular+ng-zorro-antd frontend). F1 no longer blocked on architect input; it is now in-progress scaffold work — see the migration plan referenced in the F1 line above (Mốc 0 done, Mốc 1+ not started). Camunda 8 **production** deployment model (SaaS vs Self-Managed K8s) remains open, but does not block dev-environment scaffold work.
- **F3/F5 server-side work** blocked on SSO/IAM protocol choice (`OQ-021`) and RBAC granularity sign-off (`OQ-006`). Owner: Solution Architect + client.
- Several RD flows (RD03, RD04, RD06, RD08) remain requirement-only per `RTM.md` — not a foundation blocker, but flagged so Feature work doesn't assume they're ready.

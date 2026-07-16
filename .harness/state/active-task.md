# Active Task

## ★ CURRENT — Properties Panel (màn Vẽ/Sửa BPMN): Việt hoá + icon nhóm + polish list — DONE + VERIFIED 2026-07-16

**Yêu cầu của user**: lên kế hoạch rồi triển khai nâng cấp UI cho Properties Panel trong màn Vẽ/Sửa BPMN
(`/quy-trinh/ve`, `/quy-trinh/nhap/:draftId/ve`). Qua `AskUserQuestion`, user chọn **polish sâu trên nền
CSS skin hiện tại** (giữ nguyên engine `bpmn-js-properties-panel`), không rebuild custom AntD (khác D13).

**Phát hiện trước khi code**:
- Panel dùng service `translate` (didi, chuẩn i18n bpmn.io) cho mọi nhãn — override được bằng module
  riêng, không đụng code gốc thư viện.
- Mỗi group DOM có sẵn `data-group-id="group-<id>"` (xác nhận qua `@bpmn-io/properties-panel` source) —
  cho phép gắn icon riêng theo nhóm bằng CSS mask thuần, không cần sửa JS.
- React reference (`webapp/src/branding/translate-vi.ts`) **đã có sẵn** dictionary Việt hoá tương tự cho
  bpmn-js/form-js (D7-era) — port thẳng sang Angular thay vì viết lại, giữ nhất quán thuật ngữ 2 frontend.

**Đã triển khai (`frontend-angular/`)**:
- `shared/bpmn-modeler/bpmn-properties-i18n.ts` (mới): port `VI_DICT` + `translateVi` + `TranslateViModule`
  từ `webapp/src/branding/translate-vi.ts`, đổi `import.meta.env.DEV` → `isDevMode()` (Angular). Thêm vài
  key list-group còn thiếu so với bản gốc (`Create`, `Toggle section`, `Toggle list item`,
  `List contains {numOfItems} item(s)`). Nạp vào `additionalModules` của `BpmnModelerComponent`
  (`bpmn-modeler.ts`), đứng trước `BpmnPropertiesPanelModule`/`BpmnPropertiesProviderModule`/
  `ZeebePropertiesProviderModule` — không đổi hành vi modeler khác.
- `styles/bpmn-modeler-panel.scss` (mở rộng, cùng file skin global đã có từ đợt polish trước):
  - Icon theo nhóm qua `[data-group-id="group-..."]` + CSS `mask-image` (SVG data-URI, tự đổi màu theo
    theme vì dùng `background-color` + mask, không phải asset màu cố định): `general`, `documentation`,
    `taskDefinition`, `headers`, `assignmentDefinition`, `form`, `inputs`, `outputs`, `condition`,
    `Zeebe__ExecutionListeners`/`Zeebe__TaskListeners`, `Zeebe__ExtensionProperties`, `multiInstance`,
    `calledElement`/`calledDecision` — id lấy đúng từ source thật (`GeneralGroup`/`HeaderGroup`/
    `TaskDefinitionGroup`/... trong `bpmn-js-properties-panel` dist), không đoán.
  - Empty-state (`bio-properties-panel-placeholder*`, sinh ra khi chưa chọn phần tử hoặc chọn nhiều phần
    tử — panel gốc đã có icon/text riêng qua `PanelPlaceholderProvider`, trước đây chưa style): căn giữa,
    icon mờ `opacity:.45`, text `--vht-ink-2`, nhất quán empty-state các màn khác.
  - Polish nhóm dạng danh sách (`ListGroup`: Headers/Input mapping/Output mapping/Execution listeners/
    Task listeners/Extension properties) — nhóm Zeebe hay dùng nhất khi cấu hình Service Task/User Task:
    nút "Thêm mục" dạng outline bo góc, badge số lượng mục (biến `--error` khi có lỗi), mỗi dòng list-entry
    thành card viền/bo góc, nút xoá icon đỏ khi hover, mũi tên thu gọn/mở rộng.

**Verify**:
- `npx ng build` (production): **GREEN**, 7.3s, chỉ còn cảnh báo không chặn có sẵn từ trước (`classnames`
  CommonJS trong `@bpmn-io/properties-panel`).
- `npx ng test --watch=false`: **9/9 file, 28/28 test PASS** (không regression; không có test nào assert
  nhãn tiếng Anh cụ thể của properties panel nên Việt hoá không phá test nào).
- Dictionary chỉ dịch phạm vi nhãn/nhóm thực tế dùng trong RD01–RD10 (không dịch hết ~340 chuỗi của thư
  viện ngay từ đầu) — chuỗi chưa dịch tự động giữ nguyên tiếng Anh (an toàn, không vỡ UI); có sẵn cơ chế
  dev-only `__viMissing()` (console) để bổ sung dần khi phát hiện gap qua sử dụng thật.

**⚠️ CHƯA verify được**: chưa click-through trình duyệt thật phiên này (nhất quán các phiên Angular
trước) — icon nhóm, Việt hoá nhãn và polish list mới xác nhận qua build/test + đọc source thật, chưa xác
nhận bằng mắt trên `ng serve`. User nên tự mở `/quy-trinh` → "Vẽ / sửa" một draft, chọn lần lượt Start/
User Task/Service Task/Gateway/Sequence Flow để xem panel đã Việt hoá + có icon nhóm + list Headers/
Input-Output mapping đã polish.

**Ngoài phạm vi lát này** (đã thống nhất qua AskUserQuestion): rebuild properties panel bằng custom AntD
(như D13 đã làm cho eForm builder); dịch toàn bộ 340 chuỗi của thư viện; thêm FEEL autocomplete mới (panel
gốc đã có, không đụng).

---

## ★ CURRENT — Nâng cấp “Kiểm tra BPMN”: Lỗi / Cảnh báo / Gợi ý — DONE + VERIFIED 2026-07-16

**Yêu cầu của user**: mở rộng nút **Kiểm tra BPMN** từ validator cấu trúc cơ bản thành luồng lint có
3 mức rõ ràng, bao gồm các trường hợp như gateway chỉ có một nhánh ra và User Task chưa có cơ chế
phân công.

**Đã triển khai**:
- Backend trả contract `issues[]` gồm `code`, `severity`, `message`, `elementId`, `elementName`, đồng thời giữ
  `errors[]`/`warnings[]` tương thích. ERROR làm draft `INVALID` và chặn cả chạy thử/deploy.
- Static lint có rule XML/process, duplicate ID/broken sequence flow, Start/End, unreachable/dead-end,
  gateway/condition/default flow, User Task assignment/form, Service Task job type/retry, Call Activity,
  Boundary Event và gợi ý tên/nhãn. Assignment động chỉ được miễn cảnh báo khi có marker rõ ràng.
- Angular editor và drawer catalog nhóm Lỗi/Cảnh báo/Gợi ý kèm số lượng/mã/phần tử; click issue trong editor
  chọn và đưa `elementId` vào vùng nhìn.
- Verify: backend **76/76 PASS**; Angular **30/30 PASS**; production build GREEN. Warning build duy nhất vẫn là
  `classnames` CommonJS từ properties panel. Chưa click-through trình duyệt thật/real-stack smoke trong lượt này.
- Backend source mới đã được đóng gói executable và restart thành công trên cổng 8090, PID **23544**; API
  `GET /api/process-definition-drafts` trả HTTP 200 và JAR chứa contract `issues[]` mới (2026-07-16 10:58).
- Registry-aware rules (`FORM_NOT_FOUND`, `CANDIDATE_GROUP_UNKNOWN`, service binding/called-process lookup)
  chưa bật vì ứng dụng chưa có registry contract tương ứng; lint XML tĩnh không giả lập dữ liệu registry.

### Quy ước mức độ

- **ERROR — Lỗi**: mô hình không thể triển khai/chạy an toàn; chặn chạy thử và deploy.
- **WARNING — Cảnh báo**: có nguy cơ lỗi runtime hoặc thiếu cấu hình nghiệp vụ; mặc định không chặn deploy.
- **SUGGESTION — Gợi ý**: cải thiện khả năng đọc, bảo trì và chuẩn hóa mô hình; không chặn.
- Backend là nguồn kết quả chuẩn. Frontend chỉ nhóm/hiển thị theo severity; backend vẫn kiểm tra lại khi deploy.
- Các rule phụ thuộc registry của ứng dụng (form, candidate group, service-task binding) phải tách khỏi rule
  BPMN/XML thuần để test độc lập và trả thông báo đúng nguyên nhân.

### ERROR — chặn chạy thử/deploy

- `XML_INVALID`: XML sai cú pháp, chứa DTD/external entity hoặc không đọc được.
- `PROCESS_MISSING`, `MULTIPLE_EXECUTABLE_PROCESS`, `PROCESS_ID_MISSING`, `PROCESS_ID_MISMATCH`.
- `DUPLICATE_ELEMENT_ID`: trùng ID phần tử BPMN.
- `SEQUENCE_FLOW_BROKEN`: sequence flow thiếu/sai `sourceRef` hoặc `targetRef`.
- `START_EVENT_MISSING`, `START_EVENT_NO_OUTGOING`.
- `FLOW_NODE_UNREACHABLE`: phần tử thực thi không đi tới được từ Start Event.
- `ACTIVE_PATH_DEAD_END`: activity/gateway kết thúc cụt ngoài End Event có chủ đích.
- `GATEWAY_NO_OUTGOING`: gateway phân nhánh không có luồng ra.
- `GATEWAY_CONDITION_MISSING`: nhánh không phải default của gateway phân nhánh thiếu condition bắt buộc.
- `SERVICE_TASK_JOB_TYPE_MISSING`: Service Task thiếu `zeebe:taskDefinition type`.
- `USER_TASK_DEFINITION_INVALID`: cấu hình User Task không thuộc kiểu Camunda 8 được hệ thống hỗ trợ.
- `CALLED_PROCESS_MISSING`: Call Activity thiếu process được gọi.
- `BOUNDARY_EVENT_TARGET_INVALID`: Boundary Event thiếu/sai activity đích.

### WARNING — không chặn, có nguy cơ runtime/nghiệp vụ

- `GATEWAY_SINGLE_OUTGOING`: gateway chỉ có một nhánh ra; có thể dư thừa hoặc chưa hoàn thiện.
- `GATEWAY_DEFAULT_FLOW_MISSING`: Exclusive/Inclusive Gateway có từ hai nhánh ra nhưng thiếu default flow
  (rule hiện có; giữ cảnh báo `CONDITION_ERROR`).
- `GATEWAY_UNCONDITIONAL_BRANCH`, `GATEWAY_MULTIPLE_UNCONDITIONAL`, `GATEWAY_NO_MATCH_RISK`.
- `USER_TASK_ASSIGNMENT_MISSING`: không có `assignee`, `candidateUsers`, `candidateGroups` và cũng không
  được đánh dấu/đăng ký là **phân công động tại runtime**.
- `USER_TASK_FORM_MISSING`, `USER_TASK_NO_OUTGOING`.
- `SERVICE_TASK_BINDING_MISSING`, `SERVICE_TASK_RETRY_MISSING`, `ERROR_HANDLING_MISSING`.
- `EXPRESSION_VARIABLE_UNKNOWN`: condition dùng biến không thấy trong form/input/output mapping đã biết;
  chỉ cảnh báo vì biến có thể được tạo động lúc runtime.
- `FORM_NOT_FOUND`, `CANDIDATE_GROUP_UNKNOWN`, `CALL_ACTIVITY_UNRESOLVED`.
- `POTENTIAL_INFINITE_LOOP`, `END_EVENT_MISSING`, `PARALLEL_SPLIT_JOIN_RISK`,
  `MESSAGE_CORRELATION_MISSING`.

### SUGGESTION — chất lượng mô hình

- `ELEMENT_NAME_MISSING`, `PROCESS_NAME_MISSING`, `TECHNICAL_ELEMENT_NAME`, `TASK_TOO_GENERIC`.
- `GATEWAY_QUESTION_MISSING`, `SEQUENCE_FLOW_LABEL_MISSING`, `DEFAULT_FLOW_LABEL_MISSING`.
- `ELEMENT_DOCUMENTATION_MISSING`, `ID_NAMING_INCONSISTENT`.
- `ASSIGNMENT_TOO_SPECIFIC`: gắn cứng cá nhân thay vì vai trò/nhóm khi không cần thiết.
- `LARGE_PROCESS`, `CROSSING_FLOW_LAYOUT`, `SLA_MISSING`.
- `AUDIT_VARIABLE_MISSING`, `APPROVAL_OUTCOME_INCOMPLETE`, `DIRECT_TASK_TO_END`.

### Thứ tự triển khai đề xuất

1. **Lát 1 — Contract + core graph lint**: đổi response sang issue có `code`, `severity`, `message`,
   `elementId`, `elementName`; giữ tương thích `errors`/`warnings` trong giai đoạn chuyển tiếp. Làm các rule
   gateway, duplicate/broken reference, Start Event, unreachable và dead-end.
2. **Lát 2 — Camunda task configuration**: User Task assignment/form; Service Task job type; message,
   boundary event và call activity ở mức kiểm tra tĩnh.
3. **Lát 3 — Registry-aware lint**: đối chiếu form key, candidate group, service-task binding và called process
   với dữ liệu thật của ứng dụng; fail-closed khi registry không tải được nhưng không biến lỗi hạ tầng thành
   lỗi của BPMN.
4. **Lát 4 — Angular UX**: ba nhóm Lỗi/Cảnh báo/Gợi ý, số lượng trên badge, click issue để focus/highlight
   `elementId` trong editor; drawer catalog hiển thị cùng contract.
5. **Lát 5 — Deploy/test guard + tài liệu**: ERROR chặn deploy và chạy thử; WARNING/SUGGESTION không chặn,
   trừ rule được policy cấu hình nâng mức; cập nhật README và smoke test.

### Bộ rule MVP ưu tiên

1. Gateway không có nhánh ra; gateway chỉ có một nhánh ra.
2. Gateway nhiều nhánh thiếu condition/default flow.
3. User Task thiếu assignment hoặc thiếu form.
4. Service Task thiếu job type hoặc binding active.
5. Candidate Group/Form Key không tồn tại.
6. Phần tử unreachable, sequence flow hỏng và luồng kết thúc cụt.
7. Process/Task/Gateway/nhánh gateway thiếu tên hoặc nhãn.

### Quyết định cần giữ khi triển khai

- Gateway một nhánh ra là **WARNING**, không phải ERROR.
- User Task thiếu assignment mặc định là **WARNING**. Chỉ nâng thành ERROR nếu policy nghiệp vụ xác nhận
  mọi User Task bắt buộc có người/nhóm nhận việc ngay trong BPMN.
- Phân công động phải có dấu hiệu xác nhận rõ ràng (extension/registry/policy); không được tự mặc định để
  làm mất cảnh báo.
- Static lint chỉ kiểm tra sự tồn tại/cấu trúc expression; không tuyên bố condition chắc chắn đúng với mọi
  bộ biến runtime. Deploy Camunda vẫn là lớp validation cuối.

### Acceptance criteria

- Cùng một BPMN cho kết quả rule ổn định, có mã lỗi và `elementId` để truy vết.
- ERROR làm draft `INVALID` và chặn chạy thử/deploy; chỉ WARNING/SUGGESTION vẫn cho phép tiếp tục.
- Không báo `USER_TASK_ASSIGNMENT_MISSING` khi task có assignee/candidate user/candidate group hợp lệ hoặc
  đã được đăng ký phân công động.
- Unit test cho từng rule và test graph; HTTP contract test; Angular component test cho ba severity.
- Regression test rule thiếu default flow hiện tại; backend test, Angular test/build và real-stack smoke xanh.

---

## ★ CURRENT — BPMN editor export/fullscreen/properties-panel polish — DONE + VERIFIED 2026-07-16

**Đã triển khai**:
- Nút **Kết xuất .bpmn** xuất XML hiện tại từ modeler, đồng bộ process id/name và tải file tên an toàn
  về thiết bị; không bắt buộc lưu draft trước.
- Icon button **Toàn màn hình / Thoát toàn màn hình** dùng Fullscreen API; trạng thái icon và canvas
  tự đồng bộ/fit lại sau `fullscreenchange`.
- Properties panel tăng bề rộng 380px (420px khi fullscreen), thu gọn thực sự về 0 khi ẩn; skin global
  riêng cho DOM động của bpmn-js chuẩn hóa header, group sticky, spacing, label, input/select/textarea,
  FEEL control, focus state và scrollbar. CSS được đặt global để không phụ thuộc Angular encapsulation
  và không làm vượt component-style budget.

**Verify**:
- Angular `npm test -- --watch=false`: **28/28 PASS**.
- Angular `npm run build`: **GREEN**, không còn warning component-style budget.
- Warning không chặn duy nhất: `classnames` trong properties panel là CommonJS.
- Chưa click-through/screenshot bằng trình duyệt thật trong phiên này.

---

## ★ CURRENT — Angular “Tạo & vẽ BPMN” — DONE + VERIFIED 2026-07-16

**Đã triển khai**:
- `/quy-trinh` có nút **Tạo & vẽ BPMN**; mỗi draft chưa deploy có action **Vẽ / sửa**.
- Route lazy-load mới `/quy-trinh/ve` và `/quy-trinh/nhap/:draftId/ve` dùng `bpmn-js` Modeler,
  properties panel BPMN/Camunda 8 và `zeebe-bpmn-moddle`; có palette/context pad, undo/redo, zoom,
  fit viewport, đóng/mở panel và cảnh báo thay đổi chưa lưu.
- Tạo mới sinh BPMN executable tối thiểu Start → User Task → End. Trước khi lưu, editor đồng bộ
  `bpmn:process id/name/isExecutable` với metadata, sau đó gọi contract draft thật `POST`/`PUT`
  và khóa optimistic bằng `expectedRevision`; validate luôn lưu thay đổi mới nhất trước rồi gọi API validate.
- Luồng hiển thị lỗi 409/backend, lỗi và warning validate; draft đã deploy bị chặn chỉnh sửa.
- `ProcessDefinitionDraftService` bổ sung `create`/`update` và giữ audit actor Unicode như các API hiện hữu.

**Verify**:
- Angular `npm test -- --watch=false`: **27/27 PASS**.
- Angular `npm run build`: **GREEN**; editor nằm trong lazy chunk riêng, initial bundle 2.18 MB dưới budget lỗi.
- Còn một warning build không chặn: dependency `classnames` bên trong properties panel là CommonJS.
- Chưa click-through trình duyệt thật trong phiên này.

---

## ★ CURRENT — Bypass Service Task tạm thời (Test BPMN) — DONE + VERIFIED 2026-07-16

**Yêu cầu của user**: "Khi chạy test BPM bạn tạm thêm tính năng by pass cho Service Task nhé. Cứ theo
RD02.02 làm chuẩn." — khi một Service Task trong session Test BPMN chưa có worker production thật,
job đó kẹt `BLOCKED` vô thời hạn (allowlist mock hiện rỗng); cần một cách tạm thời hoàn tất thủ công để
đi tiếp, và lấy draft `Process_RD0202` (RD02.02) thật của user làm ví dụ chuẩn.

**Xác nhận trên real stack (đọc trực tiếp draft `Process_RD0202` r3 qua `GET /api/process-definition-drafts`
trên backend 8090 đang chạy)**: Service Task duy nhất trong draft này là `B04` "Kiểm tra điều kiện &
thành phần Bộ HSXD dự thảo 1", `zeebe:taskDefinition type="rd0202-check-draft1"`; gateway `B05` ngay
sau đó rẽ nhánh theo biến `draft1Valid` (default `Flow_007` "Không đạt" nếu không set). Đây là ví dụ
chuẩn dùng để verify tính năng.

**Đã triển khai**:
- `BpmnTestEngineGateway` (interface) thêm `bypassServiceTask(processInstanceKey, jobKey, variables)`.
  `DedicatedBpmnTestEngineGateway` xác nhận job thuộc đúng instance và không phải job user task
  (`io.camunda.zeebe:userTask` đã có đường hoàn tất riêng), rồi gọi thẳng
  `client.newCompleteCommand(jobKey).variables(variables)` — đúng cơ chế đã dùng cho user task, chỉ
  khác loại job. `DisabledBpmnTestEngineGateway` fail-closed như các method khác.
- `BpmnTestSessionService.bypassServiceTask()` theo đúng pattern `completeTask`/`resolveIncident`
  (find/requireActive/expireIfNeeded/requireActive) → gọi engine → 409 + `failureMessage` khi engine
  từ chối hoặc session đã terminal.
- DTO `BypassBpmnTestServiceTaskRequest(variables)`; endpoint mới
  `POST /api/bpmn-tests/{id}/jobs/{jobKey}/bypass`.
- Angular: model/service `bypassServiceTask()`; khu vực "Job bị chặn" trên
  `/quy-trinh/nhap/:draftId/chay-thu` giờ có nút "Bypass — hoàn tất thủ công" mở drawer nhập biến
  output (dùng chung `BpmnVariableFormComponent`, `focusElementId` = elementId của job), gọi API rồi
  làm mới snapshot.
- `backend/README.md` mục mới "Bypass Service Task tạm thời" giải thích endpoint + ví dụ thật RD02.02.

**Verify**:
- Backend `mvn -o test`: **71/71 GREEN** (từ 67; +4 test bypass trong `BpmnTestSessionServiceTest` +
  `BpmnTestSessionHttpContractTest`).
- Angular `npx ng build` (production): GREEN. `npx ng test --watch=false`: **9/9 file, 27/27 test
  PASS** (không regression).
- Real-stack smoke mới `backend/scripts/smoke-bypass-service-task.ps1`: chạy `mvn spring-boot:run`
  (KHÔNG dùng `target/qtkhcn-backend.jar` — file đó đang bị khoá bởi backend 8090 sống của user, PID
  24228) trên cổng 8091 tạm, dùng test engine cô lập có sẵn (`bpmn-test-orchestration`, cổng
  8092/26510, đã chạy sẵn 2 giờ). BPMN test tái hiện đúng id/tên/type của draft thật (`B02`→
  `Gateway_133yb7i`(biến `hopLeKhoiTao`) → `B03` → `B04` type `rd0202-check-draft1` → `B05` biến
  `draft1Valid`) thay vì deploy nguyên draft 70+ node thật (theo đúng tiền lệ
  `smoke-condition-error-resolve.ps1`). Kết quả: session vào `BLOCKED` đúng tại `B04` với type
  `rd0202-check-draft1` → gọi bypass API với `draft1Valid=true` → session `COMPLETED` qua nhánh
  `Flow_006`, cùng `processInstanceKey` suốt quá trình. Sau smoke: backend 8091 tạm đã dừng sạch
  (`taskkill /T /F`, xác nhận bằng `Get-Process java` chỉ còn đúng PID 24228 của user), port 8090 và
  toàn bộ container Docker (`orchestration`/`qtkhcn-postgres`/`bpmn-test-orchestration`/`connectors`)
  không bị đụng.

**Lưu ý kỹ thuật xác nhận qua real run**: response trả về ngay sau lệnh bypass có thể vẫn liệt kê job
vừa bypass trong `blockedJobs` do search index của Zeebe eventually-consistent (đã gặp hiện tượng
tương tự ở Lát C trước đây) — script polling `GET /{id}` lặp lại tới khi `COMPLETED` thay vì assert
ngay trên response của lệnh bypass.

**Trạng thái**: `DONE + VERIFIED`. Next: user tự `ng serve` + bật test engine Docker, mở draft
`Process_RD0202` → "Chạy thử BPMN" → khi tới `B04` bấm nút "Bypass — hoàn tất thủ công" để xác nhận UI
thật (chưa click-through trình duyệt phiên này, nhất quán các phiên Angular trước — verify bằng
build/unit test + smoke API thật).

---

**Last updated**: 2026-07-16
**Agent role**: Delivery Manager / Full-stack scaffold

---

## ★ CURRENT — DMN activate/deploy + evaluate thật qua Camunda — DONE + VERIFIED 2026-07-16

**Đã triển khai**:
- Flyway `V7__dmn_camunda_deployment.sql` bổ sung trạng thái version `NOT_DEPLOYED|DEPLOYED|FAILED`,
  deployment key, decision key/id/version, thời điểm deploy và lỗi deploy. Version mới luôn bắt đầu
  `NOT_DEPLOYED`; deploy thất bại được lưu `FAILED` để audit/retry và không chuyển rule sang `ACTIVE`.
- Activate version gọi Camunda deploy thật trước khi cập nhật con trỏ active. Version đã deploy được tái sử
  dụng, không deploy trùng khi activate lại; version failed có thể activate lại để retry.
- API mới `POST /api/dmn-rules/{id}/evaluate` nhận `{variables:{...}}`, chỉ evaluate decision key của version
  active/deployed, trả evaluation key, decision metadata, `outputs` và `matchedRules[]`. Lỗi Camunda/FEEL trả
  HTTP 422 envelope ổn định; rule chưa active/deployed fail-closed.
- Angular đã bỏ evaluator TypeScript khỏi màn "Chạy thử DMN", gọi API backend thật, có loading/error FEEL,
  tô matched row theo rule id Camunda và hiển thị deployment state/key/error trong lịch sử version.
- Thêm `backend/scripts/smoke-dmn-camunda.ps1` cho chuỗi tạo rule → lưu immutable version → activate/deploy →
  evaluate thật và assert key/matched rule/output; cập nhật contract trong `backend/README.md`.

**Verify**:
- Backend `mvn -o verify` + contract deploy-error bổ sung: **67/67 PASS**, executable JAR đóng gói thành công.
- Angular `npm run build`: GREEN; `npm test -- --watch=false`: **25/25 PASS**.
- Real-stack smoke trên PostgreSQL + production Camunda: rule `BR-SMOKE-DMN-20260716023857`, deployment key
  `2251799813699262`, decision key `2251799813699264`, evaluation key `2251799813699265`, matched rule
  `R_HIGH`, output `APPROVE`.
- Backend JAR mới đã restart ở cổng 8090, PID **22068**; evaluate lại artifact smoke qua 8090 tiếp tục trả
  `R_HIGH / APPROVE`.

**Ghi chú kỹ thuật đã kiểm chứng bằng engine thật**: Camunda 8.9 trả `decisionOutput` dạng scalar khi bảng
FIRST chỉ có một output. Gateway backend chuẩn hóa trường hợp này từ evaluated matched outputs để REST luôn
trả `outputs` dạng object ổn định cho Angular.

---

## ★ CURRENT — DMN Angular ↔ REST contract + bảng luật ↔ dmnXml — DONE + VERIFIED 2026-07-16

**Đã triển khai**:
- `BusinessRuleService` đã bỏ seed/store in-memory và gọi thật `/api/dmn-rules`: list, create, get detail,
  get artifact version, save immutable version với `expectedVersion`, activate và disable. Audit actor tiếp tục đi
  qua `X-QTKHCN-Actor`; cache signal chỉ phản chiếu dữ liệu backend.
- Màn danh sách tải dữ liệu backend, xử lý loading/error/retry; bỏ các thao tác duplicate/delete vì REST Lát A
  không có contract tương ứng. Chỉ cho activate khi đã có ít nhất một version.
- Màn chi tiết tải latest artifact, tải version cũ theo yêu cầu và lưu version mới bất đồng bộ; lỗi 400/409 từ
  backend được hiển thị thay vì cập nhật UI lạc quan.
- Thêm converter fail-closed `dmnXmlToDecisionTable` / `decisionTableToDmnXml` cho bảng FIRST-hit một decision,
  hỗ trợ string/number/boolean và ANY/EQ/GTE/GT/LTE/LT/BETWEEN. FEEL ngoài tập hỗ trợ báo lỗi, không âm thầm
  đổi thành ANY gây sai nghĩa.

**Verify**:
- Angular `npm run build`: GREEN; `npm test -- --watch=false`: **24/24 PASS** (có round-trip byte-idempotent,
  unsupported FEEL fail-closed và HTTP save contract).
- Backend `mvn -o verify`: **63/63 PASS**, JAR đóng gói lại thành công.
- Backend cổng 8090 đã restart bằng JAR mới, PID **27624**; request thật có dev key
  `GET /api/dmn-rules` trả HTTP 200 `[]`, log map đúng `DmnRuleController#list`.

**Giới hạn đúng phạm vi**: converter Angular hiện hỗ trợ một decision table/hit policy FIRST như editor hiện tại;
DMN nhiều decision/DRD hoặc FEEL nâng cao phải được bổ sung model/editor trước khi mở rộng converter. Chưa smoke
ghi dữ liệu thật vì contract không có delete để dọn artifact test.

---

## ★ CURRENT — Nâng cấp UX Test BPMN: form biến thông minh + sửa CONDITION_ERROR tại chỗ + cảnh báo thiếu default flow — DONE + VERIFIED 2026-07-16

**Yêu cầu của user**: tính năng "Chạy thử BPMN" hiện rất khó dùng với end user không rành kỹ thuật.
Cụ thể 2 điểm nêu ra, ví dụ thật trên `Process_RD0202` revision 1:
1. Ô "Biến kết quả (JSON object, tuỳ chọn)" — user không hiểu cần nhập gì.
2. Khi test tới bước Gateway thì báo sự cố `CONDITION_ERROR — Gateway_133yb7i: Expected at least one
   condition to evaluate to true, or to have a default flow.` — user không biết phải làm gì tiếp, và
   nếu cần sửa thì sửa ở đâu để test tiếp được.

**Quyết định phạm vi (chốt qua AskUserQuestion cùng phiên)**:
- Khi CONDITION_ERROR được sửa, hệ thống **sửa tại chỗ và đi tiếp** trên cùng instance test (Camunda
  `setVariables` + `resolveIncident`) — không bắt user chạy lại từ đầu, giữ nguyên tiến trình đã test
  trước incident. Yêu cầu thêm API mới ở backend (Lát 2 dưới đây).
- Lát cảnh báo tĩnh thiếu default flow ở bước "Kiểm tra BPMN" (Lát 4 dưới đây) **đưa vào đợt này**, không
  hoãn.

**Hiện trạng đã xác nhận qua đọc code thật (không đoán)**:
- FE `bpmn-test-session.html:54-63` (biến khởi tạo) và `:209-216` (biến hoàn tất task) chỉ có 1
  `<textarea>` JSON thô — không gợi ý tên biến, kiểu dữ liệu, hay biến dùng để làm gì.
- Backend đã trả incident đầy đủ (`elementId`, `type`, `message`) qua
  `BpmnTestEngineGateway.EngineSnapshot`/`DedicatedBpmnTestEngineGateway.snapshot()`
  (`backend/.../camunda/DedicatedBpmnTestEngineGateway.java:73-77`), nhưng FE
  (`bpmn-test-session.html:161-172`) chỉ hiện nguyên văn message tiếng Anh trong 1 `nz-alert`, không tô
  sáng gateway lỗi trên sơ đồ, không có hành động sửa.
- `BpmnViewerComponent` (`frontend-angular/src/app/shared/bpmn-viewer/bpmn-viewer.ts`) chỉ có 1 marker
  `qtkhcn-bpmn-active` cho phần tử đang active (`activeElementIds` input); chưa có marker riêng cho
  phần tử có incident.
- `BpmnTestEngineGateway` interface (`backend/.../camunda/BpmnTestEngineGateway.java`) hiện chỉ có
  `deployAndStart/snapshot/completeTask/cancel` — chưa có method set-variables/resolve-incident.
- `ProcessDefinitionImportValidator.validateBytes()` (`backend/.../service/
  ProcessDefinitionImportValidator.java:93-108`) đã có sẵn `List<String> warnings` chảy tới tận
  `ProcessDefinitionDraftService.validate()` → `ProcessDefinitionDraftValidationResponse.warnings()` —
  API "Kiểm tra BPMN" đã hỗ trợ warnings không chặn, chỉ cần thêm rule mới, **không cần đổi DTO**.

### Kế hoạch triển khai theo lát

#### Lát 1 — Parser biến BPMN + form biến thông minh (FE, dùng chung 2 nơi)
- Component/service mới (vd. `shared/bpmn-variables/bpmn-variable-usage.ts`) parse BPMN XML (dùng
  bpmn-moddle mà bpmn-js đã có sẵn, không thêm dependency) để tìm mọi `sequenceFlow` có
  `conditionExpression` (FEEL) và trích danh sách biến được tham chiếu (regex trên identifier FEEL,
  loại trừ string/number literal và từ khoá) kèm nơi dùng (`elementId`, tên gateway, nội dung điều
  kiện). Suy luận kiểu dữ liệu tối thiểu: literal chuỗi trong nháy kép → string (nếu nhiều flow cùng
  biến so sánh với các chuỗi khác nhau → render `nz-select` liệt kê các giá trị đó); literal số → number
  input; `true`/`false` → switch; còn lại → text input.
- Component form mới nhận `xml` + `focusElementId?` (optional, để lọc biến liên quan gần 1 task/gateway
  cụ thể) → render field có nhãn = tên biến + hint "dùng tại: <tên gateway> (<điều kiện>)". Có toggle
  "Nâng cao — JSON thô" để chuyển sang textarea hiện tại (không phá luồng cũ nếu form không phát hiện
  được biến nào — fallback về JSON thô y như hiện tại).
- Áp dụng cho form "Biến khởi tạo" (không có `focusElementId`, hiện toàn bộ biến trong BPMN) và drawer
  "Biến kết quả khi hoàn tất task" (`focusElementId` = phần tử ngay sau task đó nếu dò được, có nút "hiện
  tất cả biến" để mở rộng nếu không đủ).
- Không đổi payload gửi lên API — vẫn build `Record<string, unknown>` y hệt luồng cũ, `startSession()`/
  `submitCompleteTask()` trong `bpmn-test-session.ts` không đổi logic gọi API.

#### Lát 2 — Backend: sửa CONDITION_ERROR tại chỗ (setVariables + resolveIncident)
- `BpmnTestEngineGateway` thêm 2 method: `void setVariables(long elementInstanceKey, Map<String,Object>
  variables)` và `void resolveIncident(long incidentKey)`.
- `DedicatedBpmnTestEngineGateway` implement qua `client.newSetVariablesCommand(key).variables(map)
  .send()` rồi `client.newResolveIncidentCommand(incidentKey).send()`. Dùng `processInstanceKey` làm
  `elementInstanceKey` (scope biến ở cấp process instance) — ghi rõ đây là giới hạn có chủ đích cho bản
  đầu tiên; scope theo flow-scope con (subprocess) để sau nếu cần.
- `DisabledBpmnTestEngineGateway` giữ đúng pattern fail-closed hiện có (ném lỗi "Test BPMN đang tắt" như
  các method khác).
- `BpmnTestSessionService` thêm `resolveIncident(UUID sessionId, long incidentKey, Map<String,Object>
  variables)`: `find` + `requireActive` + `expireIfNeeded` + `requireActive` lại (đúng pattern
  `completeTask` hiện có) → gọi `engine.setVariables` rồi `engine.resolveIncident` → bắt
  `RuntimeException` lưu `failureMessage` + ném `IllegalStateException` (fail-closed, đúng pattern các
  method khác trong service) → trả `get(id)` snapshot mới.
- DTO mới `ResolveBpmnTestIncidentRequest(Map<String,Object> variables)`; endpoint mới
  `POST /api/bpmn-tests/{id}/incidents/{incidentKey}/resolve` trên `BpmnTestSessionController`.
- Test: service test (happy path gọi đúng 2 lệnh theo thứ tự, snapshot cập nhật; lỗi engine → 409 +
  failureMessage lưu lại), HTTP contract test (thiếu/sai variables → 400; session đã terminal → 409).

#### Lát 3 — FE: UX incident CONDITION_ERROR (tô sáng + giải thích + nút sửa tại chỗ)
- `bpmn-test.service.ts` thêm `resolveIncident(sessionId, incidentKey, variables)` gọi endpoint Lát 2.
- `BpmnViewerComponent` thêm input `incidentElementIds` (marker CSS riêng `qtkhcn-bpmn-incident`, màu
  đỏ, cùng cơ chế `addMarker/removeMarker` đã có — không đổi hành vi `activeElementIds`).
- `bpmn-test-session.html`: incident có `type === 'CONDITION_ERROR'` được xử lý riêng — dùng parser Lát 1
  để liệt kê từng luồng ra của gateway đó kèm điều kiện FEEL thật, đối chiếu biến hiện có trong
  `s.variables` (đánh dấu biến thiếu/không khớp), thay cho message tiếng Anh thô. Nút "Sửa biến & tiếp
  tục" mở drawer dùng form Lát 1 (`focusElementId` = gateway đó) → submit gọi `resolveIncident()` → cập
  nhật snapshot, tiếp tục polling nếu đã dừng, toast thành công. Incident type khác giữ nguyên hiển thị
  alert như hiện tại (ngoài phạm vi lát này).

#### Lát 4 — Backend: cảnh báo tĩnh thiếu default flow ở "Kiểm tra BPMN"
- Thêm rule mới trong `ProcessDefinitionImportValidator.validateBytes()` (cùng chỗ đang check "process
  không có name"): với mỗi `exclusiveGateway`/`inclusiveGateway` có ≥2 sequence flow đi ra, nếu không có
  flow nào là `default` của gateway đó (thuộc tính `default` trên gateway trỏ tới flow id) → thêm vào
  `warnings` cùng danh sách: "Cổng '<tên/id>' có nhiều luồng ra nhưng không có luồng mặc định (default
  flow) — nếu lúc chạy không luồng nào thoả điều kiện sẽ phát sinh lỗi CONDITION_ERROR." Cảnh báo áp dụng
  bất kể các flow còn lại có `conditionExpression` hay không (đúng khuyến nghị Zeebe — nên luôn có default
  flow phòng trường hợp không có điều kiện nào đúng lúc chạy).
- Không đổi DTO — `warnings[]` đã chảy sẵn tới `ProcessDefinitionDraftValidationResponse` qua
  `ProcessDefinitionDraftService.validate()`. Chỉ cần xác nhận/chỉnh FE hiển thị warnings rõ ràng hơn
  trong kết quả "Kiểm tra BPMN" nếu UI hiện tại đang gộp chung khó phân biệt với errors.
- Test: BPMN mẫu nhỏ có gateway thiếu default flow → validate trả warning đúng nội dung; gateway có
  default flow → không có warning; đảm bảo test cũ về warning "thiếu name" vẫn xanh (không ghi đè logic
  cũ, chỉ nối thêm).

#### Lát 5 — Tests, real-stack smoke, docs
- `mvn -o test` xanh toàn bộ (cũ + mới Lát 2 + Lát 4).
- `npx ng build` + `npx ng test --watch=false` xanh (Lát 1 + Lát 3).
- Real-stack smoke tối thiểu: tạo session có gateway CONDITION_ERROR chủ đích (BPMN test nhỏ) → gọi
  resolve-incident API thật → xác nhận instance đi tiếp đúng nhánh mong muốn, không phải tạo instance
  mới.
- Cập nhật `backend/README.md` mục Test BPMN (endpoint mới) và `active-task.md`/`DELIVERY_STATE.md` khi
  từng lát DONE.

**Definition of Done**:
- Form biến khởi tạo/hoàn tất task hiển thị field có nhãn tiếng Việt cho biến phát hiện được từ BPMN,
  không bắt user tự suy luận cấu trúc JSON cho trường hợp phổ biến; vẫn có lối JSON thô cho trường hợp
  không phát hiện được hoặc user muốn tự gõ.
- Gateway lỗi CONDITION_ERROR được tô đỏ trên sơ đồ, kèm giải thích đúng điều kiện từng luồng ra và biến
  hiện tại — không còn chỉ hiện message tiếng Anh của Camunda.
- User sửa biến ngay trong UI và bấm "tiếp tục" → instance test đi tiếp từ đúng gateway đó (verify bằng
  real Zeebe call), không phải tạo lại session từ đầu.
- "Kiểm tra BPMN" cảnh báo sớm khi gateway thiếu default flow, trước khi user chạy thử và gặp lỗi.
- Tests + build xanh theo từng lát; không phá vỡ hành vi cũ của các incident type khác hay luồng JSON thô
  hiện có.

**Ngoài phạm vi plan này**:
- UX rich cho các incident type khác ngoài CONDITION_ERROR (vd. JOB_NO_RETRIES) — vẫn hiện alert message
  thô như hiện tại.
- Sửa/soạn lại BPMN ngay trong Angular (chưa có bpmn-js editor port sang Angular, theo D17) — tính năng
  này chỉ giúp chẩn đoán/test nhanh hơn, việc sửa file .bpmn gốc (thêm default flow) vẫn cần làm ở nơi
  khác rồi re-import draft mới.
- `setVariables` scope theo flow-scope con (subprocess/multi-instance) — bản đầu dùng scope process
  instance, đủ cho gateway ở cấp process chính.
- Phát hiện biến từ `zeebe:input` mapping của task (chỉ lấy từ `conditionExpression` của sequence flow).

**Đã triển khai (cả 5 lát, người thực hiện: Claude)**:
- Lát 1: `frontend-angular/src/app/shared/bpmn-variables/bpmn-variable-usage.ts` (thuần TypeScript,
  không phụ thuộc Angular) parse BPMN XML bằng `DOMParser` (không thêm dependency mới) để tìm
  `sequenceFlow` có `conditionExpression`, trích biến FEEL tham chiếu + nơi dùng, suy luận kiểu
  (`enum`/`number`/`boolean`/`text`). `bpmn-variable-form.ts/html/scss` render field theo kiểu, có
  focus lọc gateway gần 1 task (`resolveFocusGatewayId`, 1-hop qua sequence flow), nút "hiện tất cả
  biến" và toggle "Nâng cao — JSON thô" (tự bật khi không phát hiện được biến nào). Thay 2 ô
  `<textarea>` JSON thô trong `bpmn-test-session.html` (biến khởi tạo + biến hoàn tất task) mà không
  đổi payload gửi API.
- Lát 2: `BpmnTestEngineGateway` thêm `setVariables(elementInstanceKey, variables)` +
  `resolveIncident(incidentKey)`; `DedicatedBpmnTestEngineGateway` gọi
  `client.newSetVariablesCommand()` rồi `client.newResolveIncidentCommand()` đúng thứ tự;
  `DisabledBpmnTestEngineGateway` fail-closed như các method khác. `BpmnTestSessionService
  .resolveIncident()` theo đúng pattern `completeTask` (find/requireActive/expireIfNeeded), lưu
  `failureMessage` + 409 khi engine từ chối. DTO `ResolveBpmnTestIncidentRequest`, endpoint mới
  `POST /api/bpmn-tests/{id}/incidents/{incidentKey}/resolve`.
- Lát 3: `BpmnViewerComponent` thêm input `incidentElementIds` (marker CSS riêng
  `qtkhcn-bpmn-incident`, đỏ, không đổi hành vi `activeElementIds`). `bpmn-test-session.ts/html` xử lý
  riêng incident `CONDITION_ERROR`: liệt kê từng luồng ra của gateway kèm điều kiện FEEL thật + biến
  hiện có/thiếu (`referencedVariableNames` + `findGateway`), nút "Sửa biến & tiếp tục" mở drawer dùng
  form Lát 1 (`focusElementId` = gateway đó) → gọi `resolveIncident()` → cập nhật snapshot tại chỗ.
  Incident type khác vẫn hiện alert thô như cũ (đúng phạm vi).
- Lát 4: `ProcessDefinitionImportValidator.missingDefaultFlowWarnings()` (mới) — với mỗi
  `exclusiveGateway`/`inclusiveGateway` có ≥2 sequence flow ra mà không có thuộc tính `default` → thêm
  warning vào `warnings[]` đã có sẵn, không đổi DTO. FE `process-catalog.ts/html` giờ hiển thị
  `result.warnings` sau khi "Kiểm tra BPMN" (trước đây validate warnings hoàn toàn không hiện trên
  UI — chỉ có `errors`), thêm signal `validationWarnings` + alert + danh sách trong drawer draft.
- Lát 5: `backend/scripts/smoke-condition-error-resolve.ps1` (mới) — smoke thật lặp lại được, dựng
  gateway `Gateway_133yb7i` thiếu default flow (tái hiện đúng ví dụ thật `Process_RD0202` r1).
  `backend/README.md` có mục mới giải thích endpoint + warning + cách chạy smoke.

**Evidence**:
- `mvn -o test`: **63/63 GREEN** (từ 60; +3 test `resolveIncident` trong
  `BpmnTestSessionServiceTest`/`BpmnTestSessionHttpContractTest`, +3 test default-flow warning trong
  `ProcessDefinitionImportValidatorTest`).
- `npx ng build` (production): GREEN. `npx ng test --watch=false`: **8/8 file, 24/24 test PASS**
  (10 test mới trong `bpmn-variable-usage.spec.ts`).
- Real-stack smoke (`scripts/smoke-condition-error-resolve.ps1`, backend owned port 8091, test engine
  cô lập có sẵn port 8092/26510, không đụng production): chạy **2 lần liên tiếp PASS**. Lần cuối:
  draft `2f8c9ec8-653a-4e97-9ec7-e6cc2fcbbf5a`, session `9e8ff708-f77a-4de0-a700-3fb2c37bb357`,
  `processInstanceKey=2251799813685522` — validate xác nhận đúng 1 warning thiếu default flow; session
  tạo cố ý không set `decision` → gateway `Gateway_133yb7i` phát sinh incident `CONDITION_ERROR` thật
  → gọi `resolve-incident` với `decision=approve` → `processInstanceKey` không đổi trong suốt quá
  trình → session `COMPLETED` đúng nhánh `flow-approve`. Backend owned port 8091 và test engine đã
  dừng/giữ nguyên sạch sau smoke (test engine vốn đã chạy sẵn trước khi bắt đầu, không bị stop).
- Có 1 khoảng ngắn build/test toàn app bị chặn bởi workstream DMN Lát A đang chạy song song
  (refactor `BusinessRuleService` giữa chừng, không liên quan Test BPMN) — đã tự ổn định lại, xác
  nhận không phải do thay đổi của task này bằng git status/mtime của các file `business-rule-*`.

**⚠️ CHƯA verify được**: chưa click-through trình duyệt thật cho Lát 1/3 (không có Playwright/browser
tool phiên này, nhất quán các phiên Angular trước) — form biến/nút "Sửa biến & tiếp tục" mới verify
qua build/unit test + smoke API thật (curl/PowerShell), chưa xác nhận bằng mắt trên `ng serve`.

**Trạng thái**: `DONE + VERIFIED`. Next: user tự `ng serve` + bật test engine Docker, click-through
`/quy-trinh/nhap/:draftId/chay-thu` để xác nhận UI thật (form biến, tô đỏ gateway, drawer sửa incident).

---

## ★ CURRENT — DMN Lát A: REST contract + schema quản lý phiên bản — DONE + VERIFIED 2026-07-16

**Yêu cầu**: khóa contract backend quản lý luật/phiên bản DMN và triển khai PostgreSQL/Flyway + REST;
chưa deploy hoặc evaluate DMN qua Camunda trong lát này.

**Phạm vi đã khóa cho Lát A**:
- Artifact chuẩn phía backend là `dmnXml`; version là snapshot bất biến, đánh số tăng dần trong từng luật.
- `business_rule` giữ metadata + lifecycle (`DRAFT|ACTIVE|DISABLED`), `latestVersion` và
  `activeVersion`; `business_rule_version` giữ XML/checksum/change-note/audit.
- REST tối thiểu: list/create/get luật; list/get/save version với `expectedVersion` optimistic check;
  activate một version bất biến; disable luật. Không có update/delete version.
- Save version chỉ parse/kiểm tra artifact DMN an toàn ở mức contract; không deploy, không gọi Zeebe,
  không thực thi FEEL/decision.
- HTTP error dùng envelope ổn định hiện có; header `X-QTKHCN-Actor` chỉ là audit, không phải production RBAC.

**Đã triển khai**:
- Flyway `V6__dmn_rule_versions.sql`: `dmn_rule`, `dmn_rule_applied_process`,
  `dmn_rule_version`; DB checks cho category/status/version và unique code/(rule,version).
- Domain/repository/service tách hoàn toàn khỏi package Camunda. `latestVersion` và `activeVersion`
  độc lập; save luôn tạo snapshot mới, activate có thể trỏ lại version cũ, disable bỏ active pointer.
- REST `/api/dmn-rules`: create/list/get; list/get/save version; activate version; disable rule.
  List/detail summary không tải `dmnXml`; chỉ GET artifact cụ thể trả XML.
- `DmnArtifactValidator` parse namespace-aware, chặn DTD/XXE/external schema, yêu cầu DMN
  `definitions` + `decision` + `decisionTable`, tính SHA-256. Chưa deploy/evaluate Camunda đúng phạm vi.
- Stable 400 `{message,errors[]}` cho DMN invalid, 409 cho duplicate/stale expectedVersion, 404 cho
  rule/version không tồn tại; request validation cho code/metadata/process list/XML/note.
- Contract được ghi tại `backend/README.md`.

**Verify**:
- `mvn -o verify`: **60/60 GREEN** trên trạng thái hợp nhất cuối (12 test DMN mới:
  validator 3, service 5, HTTP contract 4); JAR đóng gói thành công.
- Real PostgreSQL: backend tạm cổng 8091 chạy thành công, Flyway apply V6 trong 85 ms; query xác nhận
  3 bảng DMN và `flyway_schema_history.version=6`; authenticated `GET /api/dmn-rules` trả HTTP 200 `[]`.
  Instance tạm đã dừng sạch, không tạo/pollute luật smoke.
- Có overlap thật với workstream Test BPMN thêm `resolveIncident(long)` trong lúc verify; lần build
  giữa chừng bị chặn khi interface và implementations chưa đồng bộ. Không sửa/ghi đè phần đó; sau khi
  workstream kia hoàn tất, re-read và chạy lại toàn backend: **60/60 GREEN**.

**Tiếp theo**: nối Angular `BusinessRuleService` sang contract thật và bổ sung chuyển đổi bảng luật
cấu trúc ↔ `dmnXml`; execution/deploy Camunda vẫn là Lát B riêng.

---

## ★ CURRENT — Modal Tạo luật: chọn nhiều quy trình DEPLOYED — DONE + VERIFIED 2026-07-16

**Yêu cầu**: trường `RD áp dụng` trong modal `Tạo luật nghiệp vụ` phải hiển thị danh sách quy trình
đang `DEPLOYED` và cho phép chọn nhiều, không nhập mã tự do.

**Đã làm**:
- `BusinessRuleListPage` gọi lại `ProcessDefinitionService.list()` mỗi lần mở modal; lọc phòng thủ
  `status === 'DEPLOYED'` và sắp xếp theo `bpmnProcessId`.
- Đổi `nz-select` từ `tags` sang `multiple` + search; mỗi option hiển thị `mã — tên (version)` và lưu
  `bpmnProcessId[]` vào `appliedProcesses` như contract UI hiện tại.
- Có loading/disable trong lúc tải, empty-state khi chưa có process deployed, error-state + nút tải lại.
  Điều kiện tạo luật tiếp tục yêu cầu chọn ít nhất một process.

**Verify**:
- `npm run build`: GREEN, bundle 2.09 MB raw / 385.51 kB estimated transfer.
- `npm test -- --watch=false`: **14/14 PASS**.
- Real backend `GET http://localhost:8090/api/process-definitions` với dev-key: HTTP thành công,
  trả 2 process và cả 2 đều `DEPLOYED`; shape có đủ `bpmnProcessId/name/latestVersion` cho option.

---

## ★ CURRENT — Angular màn chi tiết soạn bảng luật, lưu phiên bản và chạy thử DMN — DONE + VERIFIED 2026-07-16

**Yêu cầu**: làm lát tiếp theo sau danh sách Ma trận quyết định: màn chi tiết để soạn bảng luật,
lưu phiên bản và chạy thử DMN. Backend chưa có contract quản lý/thực thi DMN nên không giả lập API.

**Đã triển khai trong `frontend-angular/`**:
- Route `/quan-ly-luat/:id`; tên luật và nút `Mở chi tiết` ở danh sách điều hướng sang màn mới.
- Trình soạn bảng quyết định low-code cho luật DMN: sửa tên bảng, toán tử theo kiểu dữ liệu
  (`ANY/EQ/GTE/GT/LTE/LT/BETWEEN`), giá trị điều kiện/kết quả; thêm, nhân đôi, xoá dòng; cảnh báo
  thay đổi chưa lưu và hoàn tác.
- `BusinessRuleService` vẫn là store bộ nhớ cục bộ, bổ sung definition có cấu trúc và snapshot
  lịch sử. `saveVersion()` clone bất biến nội dung, tăng version, lưu actor/note; có thể nạp một
  version cũ vào bản soạn rồi lưu thành version mới.
- Tab `Chạy thử DMN` tự dựng form từ input columns và đánh giá FIRST-hit ngay trên browser; tô dòng
  khớp, hiển thị output hoặc cảnh báo không khớp. Đây là evaluator cục bộ có chủ đích, không phải
  API/backend/Camunda giả.
- Luật SERVICE có trang chi tiết read-only riêng, không bị giả thành DMN.
- UI ghi rõ phạm vi dữ liệu chỉ tồn tại trong phiên trình duyệt và chưa gọi API quản lý/thực thi DMN.

**Verify**:
- `npm run build`: GREEN, Angular production bundle 2.09 MB raw / 385.27 kB estimated transfer.
- `npm test -- --watch=false`: **14/14 PASS** (6 files), gồm test mới cho boundary/fallback evaluator
  và snapshot version bất biến.
- `git diff --check`: không có whitespace error trong thay đổi được track; repo có nhiều thay đổi
  và file mới từ các workstream trước, không ghi đè/xoá chúng.
- Chưa click-through trình duyệt thật trong phiên này.

**Phạm vi chưa làm đúng theo yêu cầu**: không thêm HttpClient, endpoint backend, DMN XML persistence,
Camunda EvaluateDecision/deploy/versionTag. Khi backend khóa contract, thay implementation của store và
evaluator sau interface hiện tại.

---

## ★ CURRENT — Angular UI cho tính năng Test BPMN (`/api/bpmn-tests`) — DONE + VERIFIED 2026-07-16

**Người thực hiện: Claude.** User hỏi trước "test BPMN có cần deploy lên Camunda 8 thật không, hay
BPMN nháp trong DB App cũng test được" — trả lời: **không cần**, vì `/api/bpmn-tests` (Test BPMN
Lát A+B+C, backend đã DONE+VERIFIED từ 2026-07-15) đọc thẳng `ProcessDefinitionDraftRevision` theo
`draftId`+`revision` và tự deploy XML đó lên một Camunda **test engine cô lập riêng**
(`qtkhcn.bpmn-test.*`, `infra/camunda/docker-compose.bpmn-test.yml`) — không đụng production, không
yêu cầu draft ở trạng thái `DEPLOYED`. Sau đó user yêu cầu triển khai luôn cả FE+BE cho luồng này.

**Phát hiện khi bắt đầu**: toàn bộ BE (`BpmnTestSessionService`/`Controller`/`DedicatedBpmnTestEngineGateway`/
`DisabledBpmnTestEngineGateway`, Flyway V5, DTOs) đã DONE+VERIFIED — xác nhận lại bằng
`mvn -o test`: **44/44 GREEN** (bao gồm `BpmnTestSessionServiceTest` 10 test +
`BpmnTestSessionHttpContractTest` 3 test). Không cần sửa gì ở backend cho tính năng này. Riêng gap
duy nhất còn thiếu là **UI Angular** — `/api/bpmn-tests` chưa có trang nào gọi tới.

**Lưu ý về làm việc song song**: trong lúc phiên này đọc code, một luồng khác (mục "Hiển thị và quản
lý bản nháp BPMN" ngay bên dưới) đang cùng lúc hoàn thiện UI quản lý draft (tab Bản nháp/Đã deploy,
drawer Kiểm tra BPMN/Deploy) trên cùng `frontend-angular/` — phát hiện qua việc đọc lại cùng file
2 lần trong một turn ra nội dung khác nhau. Đã re-read các file dùng chung (`process-catalog.ts/html`,
`app.routes.ts`, `core/models/process-definition.ts`) ngay trước khi sửa để tránh ghi đè; chỉ thêm
phần thuộc riêng Test BPMN (không đụng logic import/validate/deploy draft của luồng kia).

**Đã triển khai (Angular, toàn bộ file mới trừ 4 điểm nối tối thiểu)**:
- `core/models/bpmn-test.ts` (mới): port 1:1 `BpmnTestSessionResponse`/`CreateBpmnTestRequest`/
  `CompleteBpmnTestTaskRequest` từ backend DTO, gồm `BpmnTestStatus` union + hằng
  `BPMN_TEST_TERMINAL_STATUSES`.
- `core/services/bpmn-test.service.ts` (mới): `BpmnTestService.create()/get()/completeTask()/cancel()`
  gọi thẳng `/api/bpmn-tests*`; `create()` đính header `X-QTKHCN-Actor` như các service khác (audit,
  không phải authorization).
- `pages/bpmn-test-session/` (mới, 3 file `.ts/.html/.scss`): trang **"Chạy thử BPMN"**, route
  `/quy-trinh/nhap/:draftId/chay-thu` — tên khác với "Kiểm tra BPMN" (validate schema) để tránh nhầm
  hai khái niệm. Luồng: chọn revision (mặc định = revision hiện tại của draft) → nhập biến khởi tạo
  JSON + TTL tuỳ chọn → `POST /api/bpmn-tests` tạo session → poll `GET /{id}` mỗi 3s (RxJS
  `timer`+`switchMap`+`takeWhile` tới khi status terminal, `catchError` nuốt lỗi poll tạm thời để
  không dừng vòng lặp) → hiển thị sơ đồ BPMN tô sáng phần tử active, bảng user task (nút "Hoàn tất" mở
  drawer nhập biến JSON), danh sách incident/blocked-job, bảng biến process → nút Huỷ phiên
  (`DELETE`, có confirm modal) hoặc Chạy thử lại khi đã terminal. Xử lý rõ lỗi 409 "Test BPMN đang tắt"
  (test engine chưa bật) và 400 (JSON/TTL không hợp lệ) theo đúng envelope `{message, errors[]}`.
- `shared/bpmn-viewer/bpmn-viewer.ts` (sửa, thêm mới không đổi hành vi cũ): input tuỳ chọn
  `activeElementIds` — dùng `canvas.addMarker/removeMarker` (bpmn-js) để tô sáng phần tử đang active
  mà KHÔNG re-import lại diagram (giữ nguyên zoom/pan khi poll cập nhật). `process-detail.ts` (nơi
  dùng component này trước đó) không cần đổi gì vì input mới có default `[]`.
- `shared/bpmn-viewer/bpmn-viewer.scss`: thêm rule `::ng-deep .qtkhcn-bpmn-active` — bắt buộc dùng
  `::ng-deep` vì SVG do bpmn-js vẽ imperatively, không qua Angular template compiler nên style
  scoped thường không áp dụng được.
- `core/models/process-definition.ts`: thêm `ProcessDefinitionDraftRevisionResponse` (trước đó
  `ProcessDefinitionDraftResponse.revisions` gõ kiểu `unknown[]`) để trang Test BPMN lấy đúng
  `bpmnXml` của revision được chọn cho viewer.
- `pages/process-catalog/` + `app.routes.ts`: nối tối thiểu — nút "Chạy thử BPMN" trong drawer chi
  tiết draft, nút "Chạy thử" trên mỗi dòng bảng Bản nháp, và 1 route mới `runTestDraft()` điều hướng
  sang trang trên. Không đổi logic `validateDraft()/deployDraft()`/modal nhập file của luồng kia.

**Verify thật đã làm**:
- `mvn -o test` (JDK 21 Temurin + Maven 3.9.16, full path vì không có sẵn trong PATH bash mới):
  **44/44 GREEN** trước khi đụng code Angular — xác nhận backend không cần sửa.
- `npx ng build` (production): **GREEN**, 5.2s, main bundle 1.39 MB / ~314.8 kB gzip (tăng từ mức
  trước đó do thêm trang mới — chưa chạm ngưỡng `maximumError`).
- `npx ng test --watch=false`: **8/8 PASS** (không có test regressions từ các file đã sửa).
- 1 lỗi build thật phát hiện và sửa: `nz-result[nzSubTitle]` không nhận `string | null` (chỉ nhận
  `string | TemplateRef<void> | undefined`) — sửa `draftError() ?? undefined` trong
  `bpmn-test-session.html`.

**⚠️ CHƯA verify được**:
- Chưa click-through trình duyệt thật (không có Playwright/browser tool phiên này, nhất quán mọi
  phiên Angular trước) — chưa xác nhận bằng mắt: modal cấu hình phiên, việc tô sáng phần tử BPMN khi
  poll, drawer hoàn tất task, và thông báo lỗi 409 khi `qtkhcn.bpmn-test.enabled=false` (mặc định
  trong `application.yml` — cần bật `infra/camunda/docker-compose.bpmn-test.yml` trước khi test session
  thật sự chạy được, nếu không API sẽ trả 409 "Test BPMN đang tắt" đúng như thiết kế fail-closed).
- Chưa chạy real-stack: cần backend + Docker test engine (`docker-compose.bpmn-test.yml`) cùng lúc để
  xác nhận tạo session thật, poll snapshot thật, hoàn tất user task thật qua UI (khác với smoke script
  PowerShell `scripts/smoke-bpmn-lifecycle.ps1` đã verify luồng này qua curl ở Lát C).

**Tiếp theo (gợi ý)**: user tự `ng serve` + bật test engine Docker, click-through
`/quy-trinh` → tab Bản nháp → mở draft → "Chạy thử BPMN" để xác nhận UI thật; sau đó cân nhắc thêm
unit test Angular cho `BpmnTestSessionPage` (parse JSON lỗi, polling dừng đúng khi terminal) nếu cần
tăng độ tin cậy tự động hoá.

---

## ★ CURRENT — Hiển thị và quản lý bản nháp BPMN trên Danh mục quy trình — DONE + VERIFIED 2026-07-16

**Yêu cầu của user**: sau khi nhập thành công `Process_RD0202`, quy trình phải xuất hiện và có thể
được quản lý trên màn hình `/quy-trinh`; ghi task vào STATE và triển khai ngay.

**Nguyên nhân đã xác nhận trên real stack**:
- `Process_RD0202` đã được lưu đúng vào PostgreSQL dưới dạng `DRAFT` (hiện có 5 bản nháp độc lập),
  không bị mất dữ liệu và chưa có bản ghi trong deployed catalog.
- Angular chỉ gọi `GET /api/process-definitions`, còn backend chưa có collection
  `GET /api/process-definition-drafts` (trả HTTP 405), nên UI không có đường đọc lại draft.

**Phạm vi triển khai**:
- Backend: list/filter draft theo thứ tự `updatedAt DESC`, response summary không chứa XML/revisions;
  giữ nguyên import-draft không deploy.
- Angular: tách tab `Bản nháp`/`Đã deploy`; import xong reload và mở draft; cảnh báo/xác nhận khi trùng
  `bpmnProcessId`; xem metadata, kiểm tra BPMN và deploy riêng bằng `expectedRevision`.
- Verify: backend tests, Angular build, gọi API/database real stack; không tự xóa 5 draft trùng hiện có.

**Kết quả triển khai**:
- Backend có `GET /api/process-definition-drafts`, filter `status`/`bpmnProcessId`/`q`, ordering
  `updatedAt DESC`; summary không tải XML/revisions. Contract import/get/validate/deploy cũ giữ nguyên.
- Angular `/quy-trinh` có tab `Bản nháp`/`Đã deploy`; import xong reload và mở đúng draft; mã trùng
  hiện confirm; drawer draft có metadata, `Kiểm tra BPMN` và `Deploy` dùng `expectedRevision`. Deploy
  chỉ bật cho admin demo; backend production RBAC vẫn là gap đã biết.
- Thêm frontend HTTP tests cho list/validate/deploy và sửa boilerplate `app.spec.ts` lỗi thời.

**Evidence**:
- Backend `mvn verify`: **44/44 GREEN**. `clean verify` riêng không chạy được bước clean vì backend 8090
  của user đang giữ log trong `target`; `verify` compile/package/test đầy đủ thành công.
- Angular `npm test -- --watch=false`: **8/8 GREEN**. `npm run build` của task đã GREEN (2.01 MB raw)
  trước khi một workstream đồng thời thêm dở `bpmn-test-session`; build toàn app sau đó đang bị file
  ngoài task này chặn bởi binding `string|null` vào `nzSubTitle`. Không sửa/ghi đè workstream đồng thời.
- Real-stack instance tạm cổng 8091: list có 12 draft; filter trả đúng 5 `Process_RD0202`, mới nhất
  `e5e7e1ac-b023-4157-b9d6-63990aee2be9`; summary không có XML, detail đọc XML dài 70,979 ký tự.
  Instance 8091 đã dừng sạch; backend 8090 của user không bị dừng. Không deploy/xóa draft thật.

**Trạng thái**: `DONE + VERIFIED`. Cần restart backend đang chạy cổng 8090 để browser nhận API list mới.

---

## ★ CURRENT — Đổi “Nhập/deploy BPMN” thành “Nhập và lưu nháp” — PLAN READY 2026-07-15

**Yêu cầu của user**: modal Angular `Nhập / deploy quy trình từ file .bpmn` không được deploy thẳng
lên Camunda. Modal phải cho nhập **Mã quy trình** và **Tên quy trình**, đổi nút chính từ `Deploy`
thành `Lưu nháp`, rồi lưu metadata + BPMN XML vào PostgreSQL của App với trạng thái `DRAFT`.

**Quyết định phạm vi/semantics**:
- Đổi tiêu đề modal thành `Nhập quy trình từ file .bpmn`; bỏ từ “deploy” để UI không hứa sai hành vi.
- `Mã quy trình` ánh xạ trực tiếp với `bpmn:process/@id` (`bpmnProcessId`), không tạo thêm một khái
  niệm “mã App” thứ hai. `Tên quy trình` ánh xạ với metadata `name`; sau khi chọn file, FE đọc XML để
  điền trước `id`/`name`, nhưng BE vẫn là nguồn kiểm tra cuối cùng.
- `Lưu nháp` chỉ ghi `process_definition_draft` + snapshot revision; **không** gọi
  `CamundaDeploymentService`, không tạo `process_definition_version`, không tăng Camunda version.
- Giữ backward-compatible `POST /api/process-definitions/import` cho script/client cũ, nhưng trang
  Angular `/quy-trinh` không còn gọi endpoint deploy trực tiếp từ modal này.
- Cho phép nhiều draft cùng `bpmnProcessId` để phát triển version tiếp theo/song song như model hiện
  hữu; UI phải cảnh báo khi đã có draft cùng mã, không âm thầm làm người dùng tưởng chỉ có một bản.
- Deploy trở thành thao tác phát hành riêng trên bản nháp. API
  `POST /api/process-definition-drafts/{id}/deploy` và optimistic revision hiện có được tái sử dụng;
  không đặt lại deploy vào modal nhập file.

**Hiện trạng tái sử dụng được**:
- Flyway V4, `ProcessDefinitionDraft`, revision audit và status
  `DRAFT|VALID|INVALID|DEPLOYED` đã có.
- JSON create/get/update/validate/deploy draft đã có; create/save được test là không gọi Camunda.
- Thiếu endpoint nhập multipart thành draft, thiếu API list draft và Angular chưa có model/service/UI
  draft. Danh sách `/quy-trinh` hiện chỉ đọc deployed catalog nên draft lưu xong sẽ không xuất hiện.

### Kế hoạch triển khai theo lát

#### Lát 1 — Khóa contract và harden đường nhập file thành draft (BE)
- Thêm contract `POST /api/process-definition-drafts/import`, `multipart/form-data`:
  - part `file`: bắt buộc, chỉ `.bpmn`, tối đa 5 MB, content type theo allowlist hiện hữu;
  - field `bpmnProcessId`: bắt buộc, tối đa 255 ký tự;
  - field `name`: bắt buộc, tối đa 512 ký tự;
  - header audit tùy chọn `X-QTKHCN-Actor`.
- Tái sử dụng `ProcessDefinitionImportValidator` để parse XML an toàn (DTD/external entity bị chặn),
  lấy executable process và đối chiếu `bpmnProcessId` người dùng nhập với `process/@id`. Mismatch trả
  stable HTTP 400 `{message,errors[]}`; không lưu draft nửa vời.
- Publication không được inject/gọi trên đường import-draft. Sau validation upload, tạo draft
  `DRAFT`, lưu tên file/XML/checksum/actor/timestamps và snapshot revision 0 bằng service/repository
  hiện hữu; trả HTTP 201 `ProcessDefinitionDraftResponse`.
- Giữ JSON `POST /api/process-definition-drafts` cho editor/API hiện hữu (kể cả use case lưu nội dung
  đang chỉnh sửa chưa valid); endpoint multipart mới dành riêng cho modal “Nhập file”.
- Thêm `GET /api/process-definition-drafts` trả summary đủ cho danh sách: id, process id, name,
  resource name, status, revision, created/updated actor/time, validation/deployed linkage. Hỗ trợ tối
  thiểu filter `status`, `bpmnProcessId` và query tên/mã; không trả toàn bộ XML/revisions ở list.
- Repository/service phải có ordering ổn định `updatedAt DESC`; không thêm unique constraint trên
  `bpmnProcessId`. Nếu cần cảnh báo trùng, list/query cung cấp dữ liệu cho FE thay vì chặn DB.

#### Lát 2 — Angular modal lưu nháp thật
- Trước khi thay endpoint/copy, tái hiện và khóa nguyên nhân bug đang được báo ở modal hiện tại:
  bấm nút OK có lúc dường như không đi qua `(nzOnOk)="submitImport()"` tới HTTP. Không coi việc
  đổi tên method/nút là fix. Phải có verification quan sát được cho chuỗi
  `click nút chính → handler chạy → service được gọi → request xuất hiện`; nếu lỗi thuộc wiring
  `nz-modal`, sửa dứt điểm trước khi đặt flow `Lưu nháp` lên cùng cơ chế.
- Bổ sung draft DTO/model và `ProcessDefinitionDraftService` cho import/list/get/update/validate/deploy.
- Sửa modal `/quy-trinh`:
  - title `Nhập quy trình từ file .bpmn`;
  - file picker chỉ quảng bá/chấp nhận `.bpmn` (bỏ `.xml`, khớp BE);
  - trường bắt buộc `Mã quy trình`, `Tên quy trình` với trim/max-length và lỗi inline;
  - khi chọn file, parse XML phía client và mirror đúng rule BE: chỉ chọn `bpmn:process` có
    `isExecutable="true"` hoặc `"1"`, yêu cầu đúng một executable process, rồi prefill `process/@id`
    và `process/@name`; không lấy `<process>` đầu tiên một cách mù quáng vì file có thể chứa thêm
    process non-executable. Tên thiếu thì fallback về mã; client parse/mismatch vẫn là best-effort,
    BE là nguồn validate authoritative;
  - nút `Lưu nháp`, loading/disable đúng khi thiếu file hoặc metadata;
  - submit multipart sang `/api/process-definition-drafts/import`, không gọi
    `/api/process-definitions/import`.
- Hiển thị đầy đủ lỗi 400/413/409 theo envelope hiện có. Thành công toast `Đã lưu bản nháp ...`, đóng
  modal, reload danh sách draft và mở/điều hướng tới draft vừa tạo.
- Trước submit, nếu list đã có draft cùng mã thì hiện cảnh báo và yêu cầu xác nhận tạo thêm; không tự
  ghi đè draft hiện có.

#### Lát 3 — Quản lý vòng đời draft trên `/quy-trinh`
- Tách rõ hai tập dữ liệu bằng tab/bộ lọc `Bản nháp` và `Đã deploy`; không trộn draft mutable với
  immutable deployed version trong một row model giả.
- Tab draft hiển thị mã, tên, trạng thái, revision, người cập nhật, thời điểm cập nhật và thao tác mở.
  Reload trình duyệt/backend phải đọc lại được draft từ PostgreSQL.
- Drawer/trang chi tiết draft dùng `GET /{id}` để xem metadata/revision; cung cấp tối thiểu:
  `Kiểm tra BPMN` và `Deploy` riêng. `Deploy` chỉ bật theo quyền UI hiện có và sau xác nhận; luôn gửi
  `expectedRevision`, BE vẫn validate lại fail-closed trước publication.
- Sau deploy thành công: draft thành `DEPLOYED` bất biến, liên kết `deployedVersionId`, reload cả hai
  tab; muốn sửa tiếp phải tạo draft mới. Không thay đổi semantics version đã deploy.
- Quyền server-side thật vẫn phụ thuộc OQ-021/OQ-006; trong lát này không tuyên bố header actor/dev key
  là authorization production. Ghi rõ gap thay vì chỉ khóa nút trên FE.

#### Lát 4 — Tests, real-stack smoke và tài liệu
- Backend tests:
  - multipart happy path trả 201, lưu `DRAFT` + XML/checksum/snapshot và verify không gọi publication;
  - missing/empty/wrong extension/oversize/content-type/DTD/XML invalid/multiple executable process;
  - metadata process-id mismatch trả 400 và không ghi row;
  - list/filter/order/summary không tải XML; duplicate process id vẫn tạo draft riêng có chủ đích;
  - import/deploy API cũ và draft validate/deploy/revision-conflict vẫn backward-compatible.
- Angular verification: unit test cho prefill/mismatch/error state nếu test harness phù hợp; bắt buộc
  có test/click-through chứng minh nút chính phát event tới handler và tạo đúng HTTP request (không chỉ
  test signal/form state), `ng build` green, và cập nhật boilerplate test lỗi thời nếu nó chặn suite
  liên quan.
- Real-stack smoke: ghi số definition/version Camunda + row immutable trước; import multipart draft;
  xác nhận DB đọc lại đúng và Camunda/version immutable **không đổi**; sau đó gọi deploy draft riêng,
  xác nhận chỉ bước đó tạo đúng một engine/DB version và correlation key; restart vẫn đọc được draft.
- Cập nhật `backend/README.md`, tài liệu Angular nếu có, `active-task.md` và `DELIVERY_STATE.md` bằng
  evidence thật. Không đánh dấu DONE chỉ vì build xanh nếu chưa chứng minh “Lưu nháp không deploy”.

**Definition of Done**:
- Modal có file + mã + tên, nút chính là `Lưu nháp`, không còn copy “deploy ngay”.
- Click nút `Lưu nháp` đã được chứng minh đi qua modal event → handler → service → HTTP; không còn bug
  “bấm OK nhưng không có request” của flow cũ.
- Click `Lưu nháp` tạo đúng một draft PostgreSQL trạng thái `DRAFT`; XML/checksum/audit/revision đọc
  lại được sau reload/restart; Camunda và `process_definition_version` không thay đổi.
- Draft xuất hiện ở UI và mở lại được; mã metadata khớp process id trong XML; lỗi có thông báo rõ.
- Deploy chỉ xảy ra qua action riêng trên draft, dùng expected revision, tạo đúng một immutable version.
- Automated contract/regression tests, Angular build và real-stack no-deploy/deploy smoke đều xanh.

**Ngoài phạm vi plan này**:
- Autosave/CRDT/collaborative editing, object storage cho BPMN lớn, approval workflow nhiều cấp trước
  deploy, activation/rollback/migration instance, production SSO/RBAC và distributed outbox/reconcile.

**Trạng thái**: `PLAN READY — NOT STARTED`. Bước triển khai đầu tiên là Lát 1; chưa sửa mã nguồn chức
năng trong lượt lập plan/cập nhật STATE này. Review follow-up cùng ngày đã gộp 3 điểm: gate wiring nút
modal, prefill chỉ executable process, và đã gỡ 5 `console.log('[DEBUG submitImport]...')` tạm khỏi
component trước khi bắt đầu triển khai. Sau cleanup, `npx ng build` GREEN (initial 1.70 MB; không có
compile error).

---

## ★ CURRENT — Test BPMN Lát C: failure/security + smoke repeatable + DoD tổng — DONE + VERIFIED 2026-07-15

**Người thực hiện: Codex.** Hoàn tất lát cuối của cụm chỉnh sửa/lưu nháp/Test BPMN.

**Đã triển khai**:
- Thêm HTTP contract coverage cho `/api/bpmn-tests`: API key thiếu/sai = 401; Angular CORS preflight
  allow origin 4200 và deny origin lạ; TTL invalid và `variables` không phải JSON object trả stable 400
  `{message,errors[]}`. `GlobalExceptionHandler` chuẩn hóa validation/malformed JSON cho toàn API.
- Mở rộng service failure coverage: XML sai, variables không serialize được, scheduler cancel session
  hết TTL thành `TIMED_OUT`, incident/variables snapshot, snapshot engine unavailable. Snapshot/complete/
  cancel failure nay lưu `failureMessage` và fail-closed qua 409; không đánh dấu completion giả.
- Script mới `backend/scripts/smoke-bpmn-lifecycle.ps1`: tự quản backend port riêng + dedicated test
  engine nếu cần; auth/CORS/failure probe → create/validate draft → exact-revision isolated test → complete
  → chứng minh chưa leak production → deploy production → restart idempotency/correlation. Poll Camunda
  search để chịu được indexing eventual-consistency; process id cố định + run-id content nên chạy lại tạo
  đúng một version có chủ đích. Không stop production containers, giữ test volume audit.
- Cập nhật `backend/README.md` và `infra/README.md`; chốt rõ DoD Lát A+B+C không che các gap Foundation
  còn mở (OIDC/SAML, outbox/reconcile, production topology).

**Evidence**:
- `mvn clean verify`: **38/38 GREEN** (từ 31; 10 service tests + 3 HTTP/security tests cho Test BPMN,
  đồng thời toàn bộ contract import/draft/HoSo cũ vẫn xanh — backward compatibility gate).
- Hai real smoke liên tiếp PASS trên backend owned port 8091. Lần mới nhất: draft
  `718c28b5-8ce9-447a-8a1d-75c06a211f4b`, revision 1 → isolated session
  `e74dded4-dd9b-4304-8021-d1b1187bfd82` `COMPLETED` → production smoke version 3 → restart không tăng
  version/correlation còn nguyên; lần trước tạo v2; production `RD01_01` giữ v5.
- Lần chạy ngay trước đó đã tạo version 1 nhưng phát hiện assertion race với Camunda search indexing;
  PostgreSQL/Camunda đều đã ghi thành công. Script được sửa sang poll; hai lần kế tiếp tạo version 2 rồi
  version 3 đều PASS, chứng minh repeat-run trên state có sẵn. Backend 8091 và test-engine container do
  script sở hữu đã dừng sạch; production stack không bị stop.

**DoD tổng Lát A+B+C: DONE + VERIFIED.** Next không còn là Lát C; quay lại roadmap Foundation/F1 và các
gap đã ghi, không tự mở rộng sang EPIC mới.

---

## ★ CURRENT — Angular toàn app thiếu gần hết CSS Ant Design (sai import ng-zorro-antd Less) — FIXED 2026-07-15

**Người thực hiện: Claude.** User gửi ảnh chụp `/quy-trinh` thật trên trình duyệt (lần đầu tiên có ảnh
chụp UI Angular thật trong toàn bộ dự án — mọi phiên trước chỉ verify qua `ng build`/curl, không có
Playwright/browser tool): sider menu render thành list `<li>` trần không style, modal "Nhập từ .bpmn" đè
lên nav thay vì hiện overlay giữa màn hình có nền mờ.

**Nguyên nhân (xác nhận thật qua đọc trực tiếp CSS `ng serve` đang phục vụ + source `node_modules/
ng-zorro-antd/`)**: `frontend-angular/src/theme.less` (viết từ Mốc 4, 2026-07-15) import
`ng-zorro-antd/style/entry.less` — file này chỉ có theme vars + core/animation CSS dùng chung, **hoàn
toàn không có CSS riêng của từng component** (menu/modal/button/table/upload/drawer/...). `entry.less`
≠ "full bundle" như tên gợi ý; ng-zorro-antd tách CSS mỗi component vào `<component>/style/entry.less`
riêng, và `components.less` ở gốc package mới là danh sách import cả ~60 component. Bug này có từ lúc
dựng khung Angular đầu tiên, ảnh hưởng **mọi trang** (`/ho-so`, `/quy-trinh`) suốt từ đó tới giờ, không
ai phát hiện vì chưa từng có ảnh chụp/click-through UI thật trước ảnh này.

**Đã sửa**: `theme.less` đổi sang `@import 'ng-zorro-antd/ng-zorro-antd.less';` (bundle chính thức = theme
vars/core cũ + `patch.less` cdk-overlay + `components.less` toàn bộ ~60 component). Override màu/token
đặt sau import vẫn có hiệu lực nguyên vẹn (Less resolve biến toàn file, không phụ thuộc thứ tự import).

**Verify thật đã làm**:
- `ng build` production: từ FAIL (bundle 1.70 MB vượt `maximumError: 1.5MB`) → nới budget trong
  `angular.json` (`maximumWarning: 900kB→1.8MB`, `maximumError: 1.5MB→2.5MB`, hợp lý vì CSS component
  library đầy đủ là chi phí cố định chính đáng, không phải phình do lỗi) → **GREEN**, 1.70 MB raw /
  ~301 kB gzip transfer.
- Đọc trực tiếp CSS đã build: `.ant-modal-content{border-radius:8px;box-shadow:...}`,
  `.ant-btn{padding:4px 15px;border-radius:8px;...}`, `.ant-upload{...}` — có rule thật, không còn rỗng.
  Đối chiếu `#ee0033` (VHT red token) xuất hiện 158 lần trong CSS đã build — token override vẫn áp dụng
  đúng qua toàn bộ component mới thêm.
- `ng serve` của user (đang chạy sẵn port 4200, Vite dev server) tự hot-reload theo file `theme.less`
  vừa sửa — `styles.css` phục vụ tăng từ 24 KB (rỗng gần hết) → 744 KB (đầy đủ), xác nhận qua curl
  không cần restart dev server.
- `npx ng test --watch=false`: 1 test fail (`app.spec.ts::should render title`) — **pre-existing, không
  liên quan bản sửa này**: đây là test boilerplate mặc định của Angular CLI (`AppComponent` "Hello,
  frontend-angular") chưa được cập nhật từ khi layout shell thật thay thế template mặc định ở Mốc 4;
  `frontend-angular/` chưa từng được commit (untracked) nên không có lịch sử git để xác nhận, nhưng file
  `theme.less`/CSS không liên quan gì tới nội dung `<h1>` mà test này kiểm — để nguyên, chưa thuộc phạm
  vi task này.

**⚠️ CHƯA verify được**: user cần tự F5 lại `http://localhost:4200/quy-trinh` (không cần restart `ng
serve`, đã hot-reload) để xác nhận bằng mắt sider/modal hiển thị đúng — vẫn chưa có Playwright/browser
tool để tự chụp lại ảnh xác nhận.

**Tiếp theo (gợi ý)**: sau khi user xác nhận UI đúng, dọn test `app.spec.ts` lỗi thời (không khẩn); cân
nhắc thêm 1 dòng ghi chú vào README Mốc 4 gốc rằng theming Less cần `ng-zorro-antd.less` chứ không phải
`style/entry.less`, tránh lặp lại nếu có trang Angular mới nào đó lỡ đổi lại theo hướng cũ.

---

## ★ CURRENT — Test BPMN Lát B: session cô lập an toàn — DONE + VERIFIED 2026-07-15

**Người thực hiện: Codex.** Khóa isolation bằng Camunda Orchestration thứ hai trong
`infra/camunda/docker-compose.bpmn-test.yml`: broker/storage/ports riêng (`26510/8092/9610`), không
khởi động Connectors, production workers chỉ nối engine chính. Backend mặc định tắt test runner,
không fallback, và từ chối startup nếu test gRPC/REST address trùng production.

**Đã triển khai**:
- Flyway V5 + `BpmnTestSession` riêng: exact draft revision, variables JSONB, correlation id, actor,
  lifecycle `STARTING|RUNNING|BLOCKED|COMPLETED|CANCELLED|TIMED_OUT|FAILED`, TTL/ended/failure audit.
- Contract `/api/bpmn-tests`: create, snapshot, complete đúng active user task của instance, cancel.
  Snapshot trả current elements, tasks, variables, incidents và blocked jobs.
- Side effect fail-closed: allowlist mock hiện rỗng; engine test không có production worker/Connector.
  Unknown service-task type được báo `BLOCKED` kèm giải thích, không giả success.
- TTL mặc định 900s, tối đa 3600s; scheduler cancel instance quá hạn. Test definition/history giữ trong
  volume engine test cho audit; API cleanup không tuyên bố/xóa engine history.
- Tài liệu cấu hình/API/retention tại `backend/README.md` và `infra/README.md`.

**Evidence**:
- `mvn clean verify`: **31/31 GREEN**, gồm 6 test session mới (exact revision/correlation, blocked
  worker, step, idempotent cancel, engine unavailable fail-closed, TTL max).
- Real-stack user-task smoke: draft `c5cfb7b4-a21a-49ef-a704-f1d73bbab407`, session
  `f331957c-1c18-4040-a45a-412b2e9b3482`, definition `2251799813685319`, instance
  `2251799813685320`, task `2251799813685327` → `COMPLETED`, variable `decision=approve`; session
  `dfc3151e-9d3f-493d-b805-34472d3ff61d` → `CANCELLED`.
- Real-stack side-effect smoke: session `0a7df106-5d4a-4ee3-9542-40a71ea0b2ff` quan sát worker
  `sap-production-write` ở `BLOCKED`, sau đó cancel sạch.
- Isolation proof qua Camunda REST: `isolated_smoke_test` definitions production=0, test engine=1;
  production `RD01_01` vẫn version 5/key `2251799813690160`. Không mutate `HoSo`/`NhiemVu` vì service
  không phụ thuộc domain repositories và test engine không có workers ghi nghiệp vụ.
- Backend smoke port 8091 và `bpmn-test-orchestration` đã dừng; production stack user đang chạy giữ nguyên.

**Follow-up Lát C đã hoàn tất**: xem mục DONE + VERIFIED ở đầu file; 38/38 test và hai repeat-run smoke
liên tiếp đã chốt toàn bộ các gap liệt kê tại đây.

---

## ★ CURRENT — Verify + fix "Nhập từ .bpmn" BE↔FE wiring end-to-end thật (không chỉ build xanh) — DONE 2026-07-15

**Người thực hiện: Claude.** User đã tự chạy `frontend-angular` (`npm start`, port 4200) và gặp
`/quy-trinh` báo "Không kết nối được backend (http://localhost:8090)" vì backend chưa chạy. User nhờ
chạy backend giúp, rồi giao tiếp: "tạo task và làm giúp việc gắn BE vào FE cho luồng tính năng Nhập từ
.bpmn". Việc gắn code UI↔API đã DONE ở phiên trước (`ProcessCatalogPage` gọi thật
`/api/process-definitions/*`, xem mục "Trang Angular thật `/quy-trinh`" bên dưới) — việc phiên này là
**chạy backend thật lần đầu của phiên, verify bằng request thật qua đúng contract UI dùng, và sửa 1 bug
thật phát hiện được** (không có Playwright/browser tool nên verify qua curl mô phỏng đúng request UI gửi,
không phải browser click-through).

**Việc đã làm**:
1. Tìm JDK 21 (`C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot`) + Maven 3.9.16
   (`C:\Users\phuctd7\apache-maven-3.9.16`, không có sẵn trong PATH của phiên bash mới) — chạy
   `mvn spring-boot:run` nền, Flyway giữ v3, Tomcat start port 8090 sạch (Docker stack Camunda +
   `qtkhcn-postgres` đã chạy sẵn từ phiên trước, còn healthy).
2. **Verify GET /api/process-definitions thật**: trả 200 kèm header `Access-Control-Allow-Origin:
   http://localhost:4200` đúng origin Angular dev server — xác nhận CORS (`WebConfig.java`, đã có từ
   phiên trước) hoạt động đúng với contract UI gọi.
3. **Bug thật phát hiện qua verify, không phải giả định**: `curl` import lại đúng file
   `rd0101.bpmn` (không sửa gì) → **HTTP 500** (`DataIntegrityViolationException`, vi phạm unique
   constraint `process_definition_version_camunda_process_definition_key_key`). Nguyên nhân: Zeebe
   deploy content-addressable — nội dung byte-giống-hệt bản đã deploy trả về **CÙNG**
   `processDefinitionKey` thay vì tạo version engine mới, nhưng `ProcessDefinitionService.
   publishValidated()` cứ insert `ProcessDefinitionVersion` mới vô điều kiện → vỡ constraint. Đây là
   tình huống thật người dùng sẽ gặp khi bấm "Nhập từ .bpmn" lần 2 với file chưa sửa gì trên
   `/quy-trinh` — trước bản sửa này sẽ ra lỗi 500 thô trên UI, không phải lỗi mô phỏng.
4. **Sửa**: `ProcessDefinitionVersionRepository` thêm `findByCamundaProcessDefinitionKey`;
   `ProcessDefinitionService.publishValidated()` tra key đó **trước khi** insert — nếu đã tồn tại, ném
   `ProcessImportException(Kind.DEPLOYMENT)` → HTTP 422 với message rõ ràng ("Nội dung BPMN giống hệt
   phiên bản đã deploy trước đó...") kèm chi tiết version/key cũ trong `errors[]`, đúng contract
   `{message, errors[]}` Angular đã xử lý sẵn cho 422 — **không cần sửa gì ở Angular**.
5. `mvn -o compile` xanh → kill sạch process backend cũ (PID tự khởi động phiên này, không phải
   process lạ) → restart nạp bản sửa.
6. **Verify lại thật qua đúng 2 nhánh**:
   - Re-import y hệt `rd0101.bpmn` → **422** với message/errors đúng như thiết kế (không còn 500).
   - Import bản BPMN có nội dung khác thật sự (thêm 1 dòng XML comment vào file tạm ở scratchpad) →
     **201**, tạo đúng version engine mới (v4 → v5), catalog id giữ nguyên
     (`d877084c-005f-4ee6-aa69-a2d9fecc62fc`), `GET /api/process-definitions` phản ánh
     `latestVersion: 5` ngay — xác nhận nhánh "happy path" (nội dung thật sự mới) không bị ảnh hưởng
     bởi bản sửa.
7. Thêm test hồi quy `identicalContentRedeployReturningSameKeyIsRejectedNotInserted` trong
   `ProcessDefinitionServiceTest` (mock `versionRepository.findByCamundaProcessDefinitionKey` trả về
   version có sẵn → khoá đúng: ném `ProcessImportException(Kind.DEPLOYMENT)`, không gọi
   `catalogRepository.save`/`versionRepository.save`). `mvn -o test` **25/25 PASS** (tăng từ 24 —
   24 đã có sẵn từ nhánh drafts/Test-BPMN của Codex đang làm song song, không phải phiên này viết).
8. `backend/README.md` — thêm đoạn giải thích hành vi re-import nội dung giống hệt trả 422 (không phải
   500), kèm bối cảnh phát hiện.

**⚠️ CHƯA verify được**:
- Vẫn chưa có browser click-through thật (không có Playwright/browser tool phiên này, nhất quán mọi
  phiên trước) — mọi verify ở trên đi qua `curl` mô phỏng đúng request Angular gửi (multipart field
  `file`, header `X-QTKHCN-Dev-Key`/`X-QTKHCN-Actor`, `Origin: http://localhost:4200`), không phải click
  thật nút "Nhập từ .bpmn" trên UI. `ng serve` đã chạy sẵn ở port 4200 (do user tự chạy) — **user nên tự
  mở `http://localhost:4200/quy-trinh`, thử tải lên 1 file `.bpmn` thật và xác nhận UI hiển thị đúng
  toast/lỗi** để đóng nốt phần verify này.
- File test tạm `rd0101-verify-test.bpmn` (bản sao `rd0101.bpmn` + 1 dòng comment) chỉ nằm trong
  scratchpad phiên Claude Code, không phải trong `backend/`; catalog RD01_01 trên Docker dev stack giờ
  đứng ở version 5 (đúng hành vi dev như các lần smoke trước, không phải destructive — không xoá version
  cũ).

**Tiếp theo (gợi ý)**: user tự click-through `/quy-trinh` xác nhận UI thật; sau đó nhánh "Backend chỉnh
sửa/lưu nháp quy trình + Test BPMN" (mục "★ CURRENT NEXT" bên dưới, owner Codex) tiếp tục theo lịch đã
chốt.

---

## ★ CURRENT — Trang Angular thật `/quy-trinh` Quản lý quy trình nối `/api/process-definitions/*` — DONE 2026-07-15

**Người thực hiện: Claude.** Đây là nhánh (b) mà mục "★ CURRENT NEXT" (Codex/backend hardening, xem
bên dưới) đã nói tới — backend BPMN import/deploy workstream đã DONE + VERIFIED trước đó cùng ngày,
tạo sẵn contract `POST /api/process-definitions/import`, `GET /api/process-definitions`,
`GET /api/process-definitions/{id}`, `GET /api/process-definitions/{id}/versions`. Việc phiên này:
dựng trang Angular thật thay `PlaceholderPage` cho route `/quy-trinh`, nối thẳng contract đó — không
đổi bất kỳ file `backend/` nào.

**Việc đã làm**:
- `frontend-angular/src/app/core/models/process-definition.ts` (mới): TS type khớp 1:1
  `ProcessDefinitionSummaryResponse`/`DetailResponse`/`VersionResponse`/`ImportResponse` +
  `ProcessImportErrorBody` (khớp `GlobalExceptionHandler.ImportErrorBody` — dùng cho cả lỗi 400
  validate và 422 deploy). `ProcessDefinitionStatus` hiện chỉ có 1 giá trị `DEPLOYED` (enum backend
  thật cũng chỉ có giá trị này — chưa có DRAFT/STOPPED như catalog mock cũ của `webapp/`).
- `frontend-angular/src/app/core/services/process-definition.service.ts` (mới):
  `ProcessDefinitionService` — `list()`/`get(id)`/`versions(id)` (GET) +
  `import(file, actor?)` (POST multipart `FormData`, field `file` đúng tên backend
  `@RequestPart("file")`; actor optional đi vào header `X-QTKHCN-Actor` — audit metadata, KHÔNG
  phải cơ chế phân quyền, đúng comment trong `ProcessDefinitionController.java`). Header dev API
  key vẫn tự đính qua `devApiKeyInterceptor` có sẵn từ Mốc 4, không cần sửa gì thêm.
- `frontend-angular/src/app/pages/process-catalog/` (mới, 3 file `.ts/.html/.scss`): trang danh mục
  quy trình — 2 stat card (Tổng quy trình/Tổng version đã deploy), ô tìm kiếm theo mã/tên,
  `nz-table` 6 cột (Mã BPMN/Tên/Phiên bản/Trạng thái/Cập nhật lúc/Thao tác). Nút **"Nhập từ .bpmn"**
  mở `nz-modal` chứa `nz-upload` dạng kéo-thả **upload THẬT** (khác hẳn bản React tham chiếu
  `ProcessCatalog.tsx` — nút đó chỉ `beforeUpload={() => false}` mô phỏng, ghi rõ "Mô phỏng — không
  upload thật"): chọn file → giữ `File` thật trong signal → bấm Deploy gọi
  `ProcessDefinitionService.import()` thật, hiển thị lỗi **validate 400** hoặc **deploy 422** đúng
  shape `{message, errors[]}` từ backend, thành công thì toast tên/version/deployment key qua
  `NzMessageService` + reload danh sách. Nút **"Xem phiên bản"** mỗi dòng mở `nz-drawer` gọi thật
  `GET /{id}/versions`, hiển thị từng version qua `nz-descriptions` (trạng thái/tên tài
  nguyên/deployment key/process-definition key/checksum SHA-256/người nhập/thời điểm/cảnh báo).
  **Đơn giản hoá có chủ đích so với bản React tham chiếu**: chưa có nút "Tạo & vẽ BPMN" (bpmn-js
  editor chưa port sang Angular) và chưa có route chi tiết riêng (`/quy-trinh/:id`) — xem lịch sử
  version qua drawer thay vì điều hướng trang, đủ dùng vì backend chưa có API sửa/xoá quy trình.
- `frontend-angular/src/app/app.routes.ts`: route `/quy-trinh` trỏ `ProcessCatalogPage` thay
  `PlaceholderPage` (14 route còn lại của Mốc 4 vẫn placeholder, chưa đụng).

**Verify thật đã làm được**:
- `npx ng build` (production) — **GREEN**, 4.5s. Bundle 1.09 MB initial, vượt ngưỡng
  `maximumWarning: 900kB` thêm ~193 kB (chỉ WARNING, chưa chạm `maximumError: 1.5MB`) — do thêm
  `nz-upload`/`nz-modal`/`nz-drawer`/`nz-descriptions`/`nz-message` mới dùng lần đầu; chưa cần nới
  ngân sách, chỉ ghi chú nếu trang tiếp theo đẩy vượt 1.5MB thì mới cần.
- Đối chiếu field-by-field các DTO Java thật (`ProcessDefinitionSummaryResponse.java`,
  `DetailResponse.java`, `VersionResponse.java`, `ImportResponse.java`,
  `GlobalExceptionHandler.ImportErrorBody`) với TS model mới — khớp 100%, không đoán field.

**⚠️ CHƯA verify được (nhất quán với mọi phiên Angular trước, không phải bỏ sót riêng)**:
- **Chưa gọi thật qua trình duyệt** — không có Playwright/browser tool trong phiên này. Cụ thể chưa
  xác nhận: `nz-upload` drag-drop thật hoạt động đúng, modal/drawer render đúng, message toast hiện
  đúng, và luồng lỗi 400/422 hiển thị đúng danh sách `errors[]` khi thử import file sai.
- Backend đang chạy (nếu còn từ phiên trước) cần đã có `WebConfig.java` (CORS cho
  `localhost:4200`) — việc đó đã xong ở phiên trước, không phải việc mới ở đây.
- **Chưa test import với 1 file `.bpmn` thật qua `ng serve` + backend thật** — cần user tự làm để
  xác nhận toàn bộ luồng Angular → Spring Boot → PostgreSQL → Camunda hoạt động qua UI, không chỉ
  qua `curl` như các phiên trước.

**Tiếp theo (gợi ý, chưa làm)**: user click-through `/quy-trinh` trên `ng serve` xác nhận thật; sau
đó cân nhắc port `DossierDetail`/`DossierCreate` hoặc `/nhiem-vu` (cùng pattern `/ho-so`), hoặc BPMN
viewer/editor cho nút "Tạo & vẽ BPMN" (cần `bpmn-js` trong Angular — chưa có, khác gói với
`webapp/`).

---

## ★ CURRENT — Trang Angular thật đầu tiên: `/ho-so` Danh sách Hồ sơ KHCN nối API thật — DONE (chờ user restart backend để xác nhận CORS) 2026-07-15

User yêu cầu (sau khi Mốc 4 scaffold Angular xong, mọi route còn là `PlaceholderPage`): "làm một trang
thật khác trước, ví dụ danh sách hồ sơ". Chọn `/ho-so` vì có sẵn API thật đã verify end-to-end ở
Mốc 2/3 (`GET /api/ho-so`, `HoSoController.list()`), đối chiếu UX với bản tham chiếu
`webapp/src/pages/DossierList.tsx`.

**Việc đã làm**:
- **CORS mới** (`backend/src/main/java/vn/vht/qtkhcn/config/WebConfig.java`, file mới, package
  `config/` trước đó rỗng): `WebMvcConfigurer.addCorsMappings` cho phép origin
  `http://localhost:4200` (Angular dev server) gọi `/api/**` — trước đó **chưa có CORS config nào**
  trong backend, nên gọi API thật từ Angular sẽ bị trình duyệt chặn dù response 200 (do thiếu header
  `Access-Control-Allow-Origin`). Đây là gap thật cần đóng để "trang thật" thực sự nối được, không
  chỉ optimistic.
- `frontend-angular/src/app/core/models/ho-so.ts` (mới): TS type khớp `HoSoResponse.java` +
  `DossierStepResponse.java` — enum giữ nguyên tên hằng số Java (`DRAFT`/`PROCESSING`/...,
  `CHU_TRUONG`/..., `CS`/`TD`) vì Jackson serialize theo `name()` mặc định, kèm bảng nhãn tiếng Việt
  tách riêng (không đổi payload).
- `frontend-angular/src/app/core/services/ho-so.service.ts` (mới): `HoSoService.list()` gọi thật
  `GET {API_BASE_URL}/api/ho-so` qua `HttpClient` (đã có `devApiKeyInterceptor` tự đính header từ
  Mốc 4, không cần sửa gì thêm).
- `frontend-angular/src/app/pages/ho-so-list/` (mới, 3 file `.ts/.html/.scss`): trang danh sách —
  4 stat card (Khởi tạo/Đang xử lý/Đã phê duyệt/Bị từ chối), `nz-segmented` lọc trạng thái +
  `nz-input-group` tìm kiếm (mã hồ sơ/tên đề tài/mã đề tài), `nz-table` 8 cột (Mã hồ sơ/Đề tài/
  Quy trình/Cấp/Loại/Bước hiện tại/Trạng thái/Ngày tạo) với `nz-tag` màu theo `NzStatusColor`. Đơn
  giản hoá có chủ đích so với bản React tham chiếu: **chưa có nút "Tạo hồ sơ" / điều hướng chi
  tiết** vì `DossierCreate`/`DossierDetail` chưa được port sang Angular (việc tiếp theo). Nút "Tải
  lại" gọi lại API, banner `nz-alert` báo lỗi rõ khi backend không kết nối được (status 0) khác lỗi
  HTTP khác.
- `frontend-angular/src/app/app.routes.ts`: route `/ho-so` trỏ `HoSoListPage` thay `PlaceholderPage`
  (15 route còn lại của Mốc 4 vẫn placeholder, chưa đụng).

**Verify thật đã làm được**:
- `mvn -o compile` (offline, Maven 3.9.16 + JDK 21 Temurin tìm thấy tại
  `C:\Users\phuctd7\apache-maven-3.9.16` — không có sẵn trong PATH của phiên bash/powershell mới,
  phải gọi trực tiếp bằng full path + set `JAVA_HOME`) — **BUILD SUCCESS**, `WebConfig.java` biên
  dịch sạch.
- `npx ng build` (production) — **GREEN**, 4.6s. Bundle 929.51 kB initial, vượt ngưỡng
  `maximumWarning: 900kB` đã nới ở Mốc 4 (chỉ WARNING, chưa chạm `maximumError: 1.5MB`) — do thêm
  `nz-table`/`nz-segmented`/`nz-empty`/`nz-alert` mới dùng lần đầu; chưa cần nới thêm ngân sách, chỉ
  ghi chú nếu trang tiếp theo đẩy vượt 1.5MB thì mới cần.
- **Xác nhận contract thật**: backend từ phiên trước (Mốc 2/3/BPMN-import) **vẫn đang chạy** ở
  `localhost:8090` (tìm thấy qua `Get-NetTCPConnection -LocalPort 8090`, PID 1492, start time
  hôm nay) — `curl -H "X-QTKHCN-Dev-Key: dev-local-only" localhost:8090/api/ho-so` trả JSON thật
  khớp 100% cấu trúc `ho-so.ts` (đã đối chiếu field-by-field: `id`/`maNV`/`loai`/`quyTrinh`/
  `trangThai`/`steps[]`/...).

**⚠️ CHƯA verify được (bị chặn có chủ đích, không phải bỏ sót)**:
- **Backend đang chạy là code CŨ** (trước khi thêm `WebConfig.java`) — process đó không phải do
  phiên này khởi động, và hệ thống permission (Auto Mode classifier) **từ chối** lệnh
  `Stop-Process -Id 1492` với lý do "killing a process it did not start this session, without
  explicit user authorization" — đúng, không ép buộc. Nghĩa là: **CORS chưa được nạp vào backend
  đang chạy**, nên `ng serve` → gọi API thật từ trình duyệt hiện tại vẫn sẽ bị CORS chặn cho tới khi
  backend được khởi động lại.
- **Cần user làm 1 trong 2 việc trước khi coi trang này là "chạy được thật" trên trình duyệt**:
  (a) tự restart backend (`Ctrl+C` cửa sổ đang chạy `mvn spring-boot:run` rồi chạy lại), hoặc
  (b) cho phép agent tự kill/restart process cổng 8090 phiên sau.
- Chưa click-through trình duyệt thật (không có Playwright/browser tool phiên này, nhất quán mọi
  phiên trước) — kể cả sau khi backend restart, cần user tự mở `ng serve` → `/ho-so` xác nhận bằng
  mắt.

**Tiếp theo (gợi ý, chưa làm)**: sau khi user xác nhận `/ho-so` chạy được thật qua CORS, port tiếp
`DossierDetail`/`DossierCreate` sang Angular (để nút "Xem chi tiết"/"Tạo hồ sơ" có chỗ điều hướng
tới) hoặc `/nhiem-vu` (NhiemVu list, cùng pattern, đã có `NhiemVuRepository`/API tương tự — chưa
kiểm tra route backend chính xác).

---

## ★ CURRENT — F1 unblock: Java/Spring Boot backend + PostgreSQL + Camunda 8 Self-Managed dev + Angular frontend (D14–D17)

**Bối cảnh (2026-07-15)**: User chốt 4 quyết định trả lời đúng "Open decisions blocking Foundation
1": backend = Java 21 + Spring Boot (**D14**), domain DB = PostgreSQL/Flyway (**D15**), Camunda 8
dev environment = Self-Managed qua Docker Compose local (**D16**), frontend = Angular +
ng-zorro-antd thay React+AntD, kèm design-system token refresh (**D17**, thay thế **D7** — D7 đánh
dấu SUPERSEDED, không xoá). Kế hoạch đầy đủ (Mốc 0–6, chiến lược strangler-fig theo từng luồng RD,
bắt đầu từ RD01.01) đã được user duyệt qua plan mode:
`C:\Users\phuctd7\.claude\plans\generic-pondering-parnas.md`.

**Mốc 0 (khoá quyết định + cập nhật harness) — DONE 2026-07-15**:
- `decisions.md`: thêm D14/D15/D16/D17, đánh dấu D7 SUPERSEDED BY D17, cập nhật mục "Open decisions
  blocking Foundation 1" → resolved cho backend/DB/Camunda-dev, còn mở: Camunda production topology
  + SSO/IAM (OQ-021).
- `DELIVERY_STATE.md`: F1 chuyển `BLOCKED` → `IN PROGRESS`, Blockers cập nhật tương ứng.
- **Chưa đổi code** trong `webapp/` — giữ nguyên làm tài liệu tham chiếu sống theo đúng D17.

**Mốc 1 (hạ tầng dev Camunda + Postgres) — DONE 2026-07-15, VERIFIED THẬT**:
- `infra/README.md` + `infra/docker-compose.override.yml` viết xong. Đã xác minh trực tiếp qua
  `github.com/camunda/camunda-distributions` (không suy đoán từ kiến thức cũ) rằng kiến trúc
  Camunda 8 đã đổi: từ ~8.6+ Zeebe/Operate/Tasklist gộp vào **1 container `orchestration`**
  (`camunda/camunda:8.9.12`), storage mặc định **H2 nhúng** (không bắt buộc Elasticsearch), khác
  hẳn kiến trúc 3-container/port-riêng của các bản cũ. `docker-compose.override.yml` thêm 1 service
  `qtkhcn-postgres` (Postgres 16, domain DB theo D15) chạy cạnh, cùng network `camunda`.
- **Chạy thật + verify PASS 2026-07-15**: user cài Docker Desktop + JDK 21 (Temurin) + Maven
  3.9.16, thêm Maven vào PATH. 2 sự cố gặp và đã sửa (ghi lại trong `infra/README.md` mục "Ghi chú
  khi chạy trên Windows" để phiên sau khỏi lặp lại):
  1. Docker Desktop báo lỗi WSL quá cũ → chạy `wsl --update` (không cần admin) → mở lại Docker
     Desktop → OK.
  2. `docker-compose.override.yml` bản đầu khai `networks.camunda: {external: true}` — SAI, vì
     network đó do chính `docker-compose.yaml` gốc của Camunda tạo (không phải có sẵn từ trước) →
     lỗi "declared as external, but could not be found". Sửa: bỏ khai báo `external`/`name` lặp,
     chỉ để service tham chiếu `networks: [camunda]`, Compose tự merge theo key với file gốc.
     (Riêng lỗi này: đừng dùng `2>&1` với `docker compose up` trên PowerShell 5.1 — biến log tải
     ảnh ở stderr thành `ErrorRecord` giả, làm tưởng nhầm lệnh fail dù thực ra không lỗi.)
  3. `docker compose ps` xác nhận 3 container `orchestration`/`connectors`/`qtkhcn-postgres` đều
     **healthy**; `curl localhost:9600/actuator/health/status` → `{"status":"UP"}`; `psql` vào
     `qtkhcn-postgres` kết nối được (rỗng, đúng dự kiến — Flyway ở Mốc 2 mới tạo bảng).
- `.gitignore` đã thêm `infra/camunda/`, `infra/camunda-src/` (thư mục vendor tải về, chứa secret
  demo — không commit).

**Mốc 2 (backend Spring Boot) — SCAFFOLD DONE 2026-07-15, CHƯA COMPILE/CHẠY THẬT**:
- `backend/` (Maven, Java 21): entity `NhiemVu`/`HoSo`/`DossierStep` + enum (port 1:1 từ
  `webapp/src/data/nhiemVu.ts`/`dossiers.ts`, D8), Flyway `V1__core_schema.sql`, repository, REST
  API (`/api/nhiem-vu`, `/api/ho-so` — create draft/submit/actions theo D10), `HoSoService` (port
  rút gọn từ `DossierContext.tsx`), Camunda integration (`processes/rd0101.bpmn` = bản BPMN thật
  copy từ `rd0101Bpmn.ts`, `ProcessDeploymentRunner` deploy khi start, `Rd0101ProcessService` khởi
  tạo process instance khi Gửi duyệt, `SystemCheckJobWorker` xử lý service task thật), dev API-key
  filter (KHÔNG phải JWT/OIDC thật — chờ OQ-021), `application.yml`, `backend/README.md` (hướng
  dẫn chạy + curl thử + checklist "chưa verify" chi tiết).
- **3 điểm rủi ro cao nhất** (duy nhất đụng Camunda Java SDK, phần còn lại Spring/JPA/SQL chuẩn):
  coordinates `io.camunda:camunda-spring-boot-starter:8.9.12` trong `pom.xml`; tên lớp
  `io.camunda.client.CamundaClient`/`io.camunda.spring.client.annotation.JobWorker`/
  `ActivatedJob` ở 3 file trong `camunda/`; property path `camunda.client.*` trong
  `application.yml`. Cả 3 xác nhận qua tra cứu web (Maven Central, docs) chứ KHÔNG tự
  `mvn compile` được (máy agent không có Maven/JDK) — nếu sai, `mvn compile` sẽ báo lỗi rõ ràng
  ngay, xem `backend/README.md` mục "Chưa verify" để biết sửa ở đâu.
- **GAP nghiệp vụ có chủ đích** (ghi trong Javadoc, không phải bug): `submit()` chỉ hỗ trợ RD01.01;
  `applyAction()` RETURN_STEP dùng mô hình "lùi 1 bước" tuyến tính thay vì port đầy đủ
  `stepRouting.ts::ROUTING_TABLES`; `SystemCheckJobWorker` luôn trả `true` (chưa có business check
  thật); chưa có RBAC/permission ở tầng API (F3 chờ OQ-021/OQ-006).

**Mốc 2 + Mốc 3 — DONE 2026-07-15, VERIFIED END-TO-END THẬT (không chỉ build xanh)**:

User cài xong Docker Desktop + JDK 21 (Temurin) + Maven 3.9.16 cùng phiên. Chạy thật `mvn compile`
→ `mvn spring-boot:run` phát sinh **6 lỗi thật** (không đoán được nếu không chạy) — tất cả đã sửa,
backend start thành công, RD01.01 deploy thật lên Zeebe, và **toàn bộ vòng đời từ Task_1 →
Gateway_SystemCheck (service task, job worker tự viết) → Gateway_SystemResult (gateway điều kiện)
→ Task_3 chạy đúng qua Camunda REST API thật** (`v2/jobs/.../completion`, `v2/element-instances/
search` — không phải mock). Danh sách lỗi + cách sửa (tất cả đã sửa trong code, xem comment tại
chỗ):

1. **`io.camunda.spring.client.annotation.JobWorker` sai package** → đúng là
   `io.camunda.client.annotation.JobWorker` (xác nhận bằng cách liệt kê nội dung jar
   `camunda-spring-boot-starter-8.9.12.jar` trong `~/.m2`, không đoán). `CamundaClient` đoán đúng
   ngay từ đầu. Sửa: `camunda/SystemCheckJobWorker.java`.
2. **Spring Boot 3.3.4 sai hoàn toàn** — `camunda-spring-boot-starter:8.9.12` đòi **Spring Boot
   4.0.7** / Spring Framework 7.0.8 (đọc thẳng POM đã tải, không đoán). Bump `pom.xml` parent lên
   `4.0.7`.
3. **Spring Boot 4 tách autoconfigure thành module nhỏ** — Flyway cần thêm
   `org.springframework.boot:spring-boot-starter-flyway` (module mới `spring-boot-flyway`), có mỗi
   `flyway-core`/`flyway-database-postgresql` KHÔNG đủ → lỗi im lặng (Flyway không chạy, không log
   gì, Hibernate `ddl-auto=validate` fail vì bảng chưa tồn tại — dễ nhầm là lỗi JPA). Xác nhận qua
   `docs.spring.io` (Spring Boot 4 modularization).
4. **`httpclient5` version conflict** — `camunda-client-java:8.9.12` cần `httpclient5:5.6.2`
   (đọc POM của nó) nhưng BOM `spring-boot-starter-parent:4.0.7` kéo `5.5.2` "gần" hơn nên thắng
   Maven mediation → `NoSuchMethodError: HttpAsyncClientBuilder.disableContentCompression()` lúc
   khởi tạo bean `CamundaClient` (lỗi chỉ hiện ở RUNTIME, compile vẫn xanh). Ghim tường minh
   `httpclient5:5.6.2` trong `pom.xml`.
5. **Bug thật trong BPMN nguồn** (`webapp/src/data/rd0101Bpmn.ts`, đã tồn tại từ trước, chưa ai
   phát hiện vì bpmn-js trên trình duyệt không validate chặt như Zeebe engine thật): các phần tử mở
   rộng Zeebe dùng SAI casing — `zeebe:AssignmentDefinition`/`zeebe:FormDefinition`/
   `zeebe:TaskDefinition`/`zeebe:CalledElement` (chữ hoa đầu) thay vì đúng chuẩn
   `zeebe:assignmentDefinition`/`zeebe:formDefinition`/`zeebe:taskDefinition`/`zeebe:calledElement`
   (chữ thường đầu) — Zeebe từ chối deploy với lỗi rõ ràng (`Must have exactly one
   'zeebe:calledElement'/'zeebe:taskDefinition' extension element`). **Đã sửa cả 2 file**
   (`webapp/src/data/rd0101Bpmn.ts` — nguồn chuẩn — VÀ `backend/src/main/resources/processes/
   rd0101.bpmn`) bằng `sed`, 16 chỗ mỗi file. Đây là giá trị thật của việc deploy lên Zeebe thật lần
   đầu — bug ẩn 2+ tuần trong mock không ai thấy vì chưa từng chạy qua engine thật.
6. **`MultipleBagFetchException`** (Hibernate) — không fetch-join được 2 collection kiểu `List`
   (bag, không `@OrderColumn`) lồng nhau (`HoSo.steps` + `DossierStep.vaiTroCodes`) trong 1 query,
   cần khi trả JSON response (đọc lazy collection sau khi transaction đã đóng, `open-in-view:
   false` có chủ đích). Sửa: đổi `DossierStep.vaiTroCodes` từ `List<String>` sang `Set<String>`
   (hợp lý ngữ nghĩa — mã vai trò không cần thứ tự/không nên trùng) + `@EntityGraph(attributePaths
   = {"steps", "steps.vaiTroCodes"})` trên `HoSoRepository.findById`/`findAll`.

**Verify thật (không phải mock, chạy qua curl/PowerShell + Camunda REST API trực tiếp)**:
- `POST /api/nhiem-vu` → tạo `NhiemVu` thật trong Postgres.
- `POST /api/ho-so` → tạo `HoSo` draft thật.
- `POST /api/ho-so/{id}/submit` → `trangThai=PROCESSING`, **`zeebeProcessInstanceKey` thật**
  (vd `2251799813687048`), 6 bước dựng đúng từ `Rd01Steps`.
- `POST /api/ho-so/{id}/actions` (`APPROVE_STEP`) → state machine domain DB đúng (bước hiện tại
  DONE, bước kế CURRENT, `buocHienTai` tăng).
- **Xác nhận độc lập qua chính Camunda REST API** (`v2/process-instances/search`): process instance
  `ACTIVE`, `hasIncident: false`. Hoàn tất Task_1 → Task_2 qua `v2/jobs/{key}/completion` (job type
  `io.camunda.zeebe:userTask`) → **`SystemCheckJobWorker` tự động nhận job
  `khcn.rd0101.check-default-condition` và hoàn tất KHÔNG CẦN can thiệp thủ công** →
  `Gateway_SystemResult` tự đánh giá đúng điều kiện `dieuKienMacDinhDat=true` → tiến sang Task_3.
  Xác nhận qua `v2/element-instances/search`: `Start_RD01_01`/`Task_1`/`Task_2`/
  `Gateway_SystemCheck`/`Gateway_SystemResult` đều `COMPLETED`, `Task_3` `ACTIVE`.

**Mốc 5, nhánh (a) — Codex/backend — DONE + VERIFIED THẬT 2026-07-15**:
- **Người thực hiện: Codex.**
- Giữ nguyên hoàn toàn contract `POST /api/ho-so/{id}/actions` (path, request body
  `HoSoActionRequest`, response `HoSoResponse`); chỉ thay đổi hành vi bên trong service.
- `HoSoService.applyAction()` gọi `Rd0101ProcessService.applyAction()` **trước** khi tiến state
  PostgreSQL. Không có `zeebeProcessInstanceKey`, không tìm được task, hoặc Camunda lỗi → fail-closed
  với HTTP 409 và transaction domain không tiến bước.
- BPMN RD01.01 hiện tạo job loại `io.camunda.zeebe:userTask` (không phải user-task record kiểu mới),
  nên service dùng typed Job Search của `CamundaClient`, lọc theo process-instance + job type +
  `CREATED`, rồi `newCompleteCommand(jobKey)`. Có bounded retry 20 × 250 ms để chịu độ trễ eventual-
  consistency của search index; khi index tạm trả cả job cũ/mới thì chọn Zeebe key mới nhất (RD01.01
  tuần tự, không có parallel user task).
- `APPROVE_STEP` hoàn tất user-task và truyền biến gateway tương ứng; `RETURN_STEP` chỉ cho phép tại
  task có nhánh rework rõ trong BPMN; `REJECT_STEP` huỷ process instance vì `REJECTED` là terminal
  trong domain rút gọn.
- Unit test mới `HoSoServiceTest`: **3/3 PASS** (`mvn test`, BUILD SUCCESS), khoá 3 invariant:
  Camunda chạy trước DB save; Camunda lỗi không tiến/không save domain; thiếu process key fail-closed.
- E2E thật qua chính business API `/actions`: gọi `APPROVE_STEP` hai lần đã hoàn tất `Task_1`,
  `Task_2`; `SystemCheckJobWorker` tự chạy; Camunda REST xác nhận `Task_1`/`Task_2`/service task/
  gateway `COMPLETED`, `Task_3 ACTIVE`, trong khi domain tăng bước 1 → 3. E2E reject xác nhận domain
  `REJECTED` và process instance `TERMINATED`. Response vẫn đủ đúng 17 field cũ.
- GAP "`/actions` chỉ cập nhật PostgreSQL, chưa gọi Zeebe" ở khối trước **ĐÃ ĐÓNG**. Rủi ro phân tán
  còn lại: Camunda có thể hoàn tất nhưng DB commit thất bại sau đó; xử lý tuyệt đối cần transactional
  outbox/reconciliation, để Mốc 6+ thay vì âm thầm tuyên bố atomic cross-system.

**Mốc 4 (scaffold Angular app + design system) — DONE 2026-07-15**:
- **Người thực hiện: Claude (nhánh (b) song song với Codex/nhánh (a) ở trên).**
- `frontend-angular/` mới (Angular CLI, standalone components, control-flow mới `@if/@for`).
  **Pin ở Angular 21 (không phải 22 mới nhất)** — xác nhận qua npm registry: `ng-zorro-antd`
  bản ổn định mới nhất (21.3.2) chỉ khai `peerDependencies` `^21.0.0`; bản cho Angular 22 mới
  có `22.0.0-beta.0`. Chọn Angular 21 + ng-zorro 21.3.2 (cả hai ổn định) thay vì ghép Angular 22
  với UI-kit beta.
- **Theme**: `ng-zorro-antd` v21 chỉ publish CSS đã biên dịch sẵn (`ng-zorro-antd.min.css`,
  không có `--ant-*` CSS variable, không ship Less theo mặc định qua `ng add`) — xác nhận bằng
  cách đọc thẳng file CSS (hex `#1890ff` cứng, 0 custom property). Đã tự chuyển sang biên dịch
  từ nguồn Less (`ng-zorro-antd/style/entry.less`, cần thêm `less` làm devDependency +
  `@root-entry-name: default;` mới import được) tại `frontend-angular/src/theme.less`, override
  đúng bảng màu "VHT Military Red" **port 1:1 từ `webapp/src/theme.ts`** (không phải đoán màu
  mới): `@primary-color`/`@link-color: #ee0033`, `@success/@warning/@error-color`,
  `@border-radius-base: 8px`, `@font-family: Inter…`, và `@layout-header-background`/
  `@menu-dark-inline-submenu-bg: #1c1c1c` (INK — sider nền mực đen, KHÔNG phải nền đỏ đặc, đỏ
  chỉ là điểm nhấn mục đang chọn qua `@menu-dark-item-active-bg` = `@primary-color` tự động).
- **Token layer**: `frontend-angular/src/styles/tokens.scss` — port nguyên văn mọi biến
  `--vht-*` (màu/bo góc/font/scrollbar) từ `webapp/src/branding/tokens.css`, giữ tên biến 1:1
  để đối chiếu; dùng cho phần UI Angular tự viết (shell/login), tách biệt với theme Less của
  ng-zorro (2 cơ chế theming khác nhau, không thể dùng chung 1 nguồn do giới hạn kỹ thuật nêu
  trên).
- **Locale**: `vi_VN` từ `ng-zorro-antd/i18n` + `registerLocaleData(vi)` (Angular `@angular/
  common/locales/vi`) — xác nhận export tồn tại trước khi dùng (đọc thẳng bundle
  `ng-zorro-antd-i18n.mjs`, không đoán tên).
- **Auth stub** (`core/auth/`): `demo-users.ts` (5 tài khoản demo — subset có chủ đích từ 13 tài
  khoản đầy đủ ở `webapp/src/data/users.ts`; port RBAC/permission engine đầy đủ là việc Mốc 6+,
  KHÔNG thuộc phạm vi Mốc 4), `auth.service.ts` (signal-based, login/logout localStorage, port
  tinh thần `AuthContext.tsx`), `auth.guard.ts` (`authGuard`/`loginPageGuard`),
  `dev-api-key.interceptor.ts` (đính header `X-QTKHCN-Dev-Key: dev-local-only` cho request tới
  `API_BASE_URL=http://localhost:8090` — khớp `DevApiKeyFilter.java`/`application.yml` thật của
  Mốc 2, CHƯA gọi thật request nào tới backend phiên này). **Lệch có ghi chú so với câu kế hoạch
  gốc "auth guard stub gọi API JWT tạm của Mốc 2"**: Mốc 2 chỉ có `DevApiKeyFilter` (1 static key
  chặn toàn API), không có endpoint đăng nhập/JWT nào — login vẫn thuần client-side (mock),
  tách biệt với việc đính dev-key vào các request gọi API thật.
- **Layout shell** (`layout/shell.ts/html/scss`): `nz-layout`/`nz-sider` (collapsible,
  dark theme) + `nz-menu` (dùng `nzMatchRouter` — directive chính thức của ng-zorro tự đánh dấu
  menu item chọn theo route hiện tại, xác nhận qua đọc source `ng-zorro-antd-menu.mjs`, không tự
  viết lại logic so khớp route) + `nz-header` (breadcrumb + dropdown user/logout) + `nz-content`
  (`router-outlet`). Icon đăng ký tường minh qua `NzIconService.addIcon()` (`core/icons-provider.ts`,
  21 icon, không kéo cả bộ icon).
- **Nav IA** (`layout/nav-items.ts`): port cấu trúc từ `webapp/src/App.tsx` (menuItemsMain) +
  `webapp/src/data/phanHe.ts` (module PH2/PH3/PH4) — **đơn giản hoá có chủ đích**: gộp thành 1
  sider phẳng duy nhất, bỏ hành vi "đổi ngữ cảnh sider khi vào `/phan-he/PH2`|`/phan-he/PH3`"
  (mini-sider `PH_MENU_MAP` của bản React) và bỏ gating theo quyền (`canManageSystem`/
  `isChuNhiemDeTai`) — mọi module vẫn đủ, chỉ khác cách vào; đây là việc polish tương tác/RBAC
  của Mốc 6+, không chặn mục tiêu Mốc 4 ("layout + nav render đúng nhóm phân hệ, không cần dữ
  liệu thật").
- **Trang**: `pages/login/` (form email/mật khẩu, card "Tài khoản demo" chỉ hiện dev — port
  đúng `webapp/src/pages/Login.tsx`) + `pages/placeholder/` (1 component dùng chung cho **16
  route** module chưa port dữ liệu thật, tiêu đề lấy từ route `data.title`).
- **Verify**: `npx ng build` GREEN (sau khi sửa 2 lỗi build thật: `nzIcon` không phải input hợp
  lệ trên `li[nz-menu-item]` → chuyển sang `<nz-icon>` trong `<a>`; thiếu `@root-entry-name` khi
  import Less entry → thêm `@root-entry-name: default;`). Bundle 708 kB initial — nới ngân sách
  `angular.json` production budget lên 900 kB/1.5 MB (ng-zorro-antd + Inter font vốn nặng hơn
  mặc định Angular CLI 500 kB, không phải regression). `ng serve` smoke-test qua curl (200,
  `main.js`/`styles.css` load được) rồi tắt sạch tiến trình (tìm PID qua `netstat`, `taskkill`
  — không để lại process nền). **Thử jsdom để kiểm không lỗi runtime nhưng thất bại do jsdom
  không chạy được `<script type="module">`/Vite client script (giới hạn jsdom, không phải bug
  app) → bỏ, không kết luận được gì từ đó.** **CHƯA click-through trình duyệt thật** (không có
  Playwright/browser tool trong phiên này, nhất quán với mọi phiên trước của `webapp/`).
- **Chưa làm** (ngoài phạm vi Mốc 4, để Mốc 5/6+): gọi API thật (Mốc 4 không cần dữ liệu thật),
  RBAC/permission gating nav, mini-sider PH2/PH3, các trang thật thay placeholder.

**⚠️ Phát hiện khi cập nhật state (đọc lại file này thấy nội dung mới của Codex đã ghi từ khi
phiên này bắt đầu)**: mục "★ CURRENT NEXT" ngay dưới đây định nghĩa nhánh (b) **hẹp hơn** — cụ
thể là dựng trang `/quy-trinh` (Nhập/deploy `.bpmn`) nối vào contract `/api/process-definitions/*`
**chưa tồn tại** (backend "READY, NOT STARTED"). Việc Mốc 4 ở trên là scaffold khung Angular
tổng quát (đủ để `/quy-trinh` sau này build vào), KHÔNG PHẢI đã hoàn thành riêng trang
`/quy-trinh` nối contract import BPMN đó — hai việc khác nhau, cần user xác nhận có muốn tiếp
tục nhánh hẹp đó khi backend xong hay không.

## ★ CURRENT — Nhập/deploy `.bpmn` thật, backend làm song song Angular — DONE + VERIFIED 2026-07-15

**Người thực hiện: Codex (backend).** Workstream hoàn tất độc lập với UI; không sửa `webapp/` hoặc
`frontend-angular/`.

**Kết quả triển khai + kiểm chứng thật**:
- Thêm đủ contract `POST /api/process-definitions/import`, `GET /api/process-definitions`, detail và
  versions. Import trả HTTP 201 với catalog/version id, BPMN id/name, resource, checksum, actor/time,
  deployment/process-definition key, version, status và warnings. Validation trả `{message,errors[]}`
  (400); lỗi deploy Camunda trả cùng shape (422).
- Flyway V2/V3 tạo catalog + immutable version history + warnings, lưu BPMN XML trong PostgreSQL;
  entity/repository/DTO tách khỏi contract hồ sơ hiện hữu. Import lại cùng BPMN process id thêm version
  mới theo version Camunda, không ghi đè record cũ.
- Validator giới hạn `.bpmn`/content type/5 MB, từ chối file rỗng/XML hỏng, yêu cầu đúng một process
  executable có id, và parse với DTD/external entity/XInclude bị tắt. `CamundaDeploymentService` là
  đường deploy dùng chung cho startup runner và API. DB chỉ ghi sau khi Camunda trả deploy thành công.
- `mvn verify` **BUILD SUCCESS, 9/9 test PASS**: file type/size, XML sai, thiếu executable/id, XXE,
  duplicate/version và Camunda failure không ghi catalog/version thành công.
- E2E thật qua business API: import `rd0101.bpmn` → HTTP 201, Camunda version 2, deployment key
  `2251799813688754`, process-definition key `2251799813688755`; PostgreSQL lưu catalog/version/XML;
  Camunda REST `/v2/process-definitions/search` thấy đúng version/key; tạo process instance version 2
  thành công (key `2251799813688770`). Restart backend/Flyway validate V3 xong, read API vẫn trả catalog
  và version 2 đã lưu. Backend hiện chạy lại ở port 8090; stack Docker vẫn healthy.
- `backend/README.md` đã cập nhật curl contract, response/error semantics và trạng thái verify. Rủi ro
  phân tán còn lại giữ đúng ngoài phạm vi: Camunda có thể deploy xong nhưng DB commit lỗi; cần outbox/
  reconciliation ở Mốc 6+.

**Hiện trạng trước triển khai**:
- React mock `/ql-nvkhcn/#/quy-trinh` có nút "Nhập từ .bpmn" nhưng `Upload.Dragger` chỉ
  `beforeUpload={() => false}`, không có `onChange`/`FileReader`; UI còn ghi rõ "Mô phỏng — không
  upload thật". `submitCreate()` chỉ thêm metadata vào React state, không đọc XML, không gọi backend,
  không deploy Camunda và mất khi reload.
- Angular mới chỉ có nav item `/quy-trinh`; `app.routes.ts` chưa có route/page tương ứng.
- Backend chỉ có `ProcessDeploymentRunner` deploy resource RD01.01 đóng gói sẵn lúc startup; chưa có
  API import, catalog/version persistence hoặc API đọc danh mục quy trình.

**Phạm vi backend có thể làm ngay/song song UI (theo thứ tự)**:
1. **Khoá contract API tối thiểu cho UI** — thêm mới, không thay contract API hồ sơ hiện hữu:
   - `POST /api/process-definitions/import`, `multipart/form-data`, field `file`.
   - `GET /api/process-definitions`, `GET /api/process-definitions/{id}` và
     `GET /api/process-definitions/{id}/versions`.
   - Import response tối thiểu: catalog id, BPMN process id/name, resource name, Camunda deployment
     key, process-definition key/version, trạng thái và danh sách warning; lỗi validation trả payload
     `{message, errors[]}` nhất quán. UI Angular chỉ phụ thuộc contract này, không phụ thuộc entity.
2. **Flyway + persistence** — migration mới cho catalog quy trình và lịch sử version; lưu correlation
   keys Camunda, checksum/resource name, actor/timestamps và BPMN XML (`text`) cho dev/Mốc 5 để xem
   lại sau reload. Không sửa bảng `ho_so`/`nhiem_vu`; không xây object storage ở lát này.
3. **Import/validation an toàn** — giới hạn loại/kích thước file; parse XML với DTD/external entity
   bị tắt (chống XXE); xác nhận có executable BPMN process và ID; từ chối file rỗng/XML sai; giữ lỗi
   engine deploy ở dạng 4xx có thông tin, không biến thành 500 mơ hồ.
4. **Deploy service dùng chung** — tách logic deploy khỏi startup runner thành service; runner và API
   cùng gọi một đường deploy qua `CamundaClient.newDeployResourceCommand()`. Import lại cùng BPMN
   process ID tạo version Camunda mới và thêm version record, không ghi đè lịch sử.
5. **Read APIs + reconciliation tối thiểu** — danh mục/detail/version đọc PostgreSQL; response chứa
   Camunda keys để kiểm chứng độc lập. Không tự tuyên bố deploy thành công nếu Camunda lỗi; DB catalog
   chỉ commit trạng thái thành công sau khi có deployment result.
6. **Test trước khi bàn giao UI**:
   - Unit: file type/size, XML sai, thiếu executable process/ID, XXE bị chặn, duplicate/version rule,
     Camunda failure không tạo bản ghi thành công.
   - Integration thật: import một `.bpmn` qua business API → PostgreSQL còn dữ liệu sau reload →
     Camunda REST search thấy đúng process-definition/version → tạo được process instance thử nghiệm.
   - `mvn test` + curl contract examples trong `backend/README.md`.

**Ngoài phạm vi workstream song song này / chờ Angular hoặc quyết định khác**:
- Không sửa `webapp/` React mock; không dựng trang Angular, file picker, viewer/editor hay browser
  click-through trong nhánh backend.
- Chưa triển khai SSO/RBAC production (OQ-021/OQ-006); tiếp tục dev API key nhưng endpoint phải có
  điểm chặn quyền rõ để nối security sau.
- Chưa làm activation/rollback version, object storage, production topology, transactional outbox,
  hay tự động resolve form/DMN/call-activity dependency. Có thể trả warning cho dependency thiếu,
  nhưng không mở rộng thành registry platform ở Mốc 5.

**Definition of Done nhánh backend import**:
- File `.bpmn` hợp lệ được nhận qua API, validate, deploy thật lên Camunda và lưu catalog/version vào
  PostgreSQL; reload/restart vẫn đọc lại được.
- File lỗi/độc hại hoặc Camunda không sẵn sàng bị fail-closed, không để bản ghi giả thành công.
- E2E tạo được process instance từ definition vừa import; contract có ví dụ đủ để workstream Angular
  nối mà không phải sửa backend.

**Tiếp theo**:
1. **Codex/backend hardening — DONE + VERIFIED 2026-07-15** — kết quả/evidence ngay dưới đây.
2. **Mốc 4 / Mốc 5 nhánh (b)** — workstream Angular dựng `/quy-trinh` và nối contract API; trạng thái
   do workstream frontend cập nhật, nhánh backend không tự đánh dấu.
3. Khi cả hai nhánh xong, chạy click-through Angular → Spring Boot → PostgreSQL → Camunda để chốt
   import thật và walking skeleton, không chỉ build xanh.
4. **Mốc 6+** — activation/rollback, dependency registry, outbox/reconciliation và strangler các
   module còn lại.

## Backend chỉnh sửa/lưu nháp quy trình + Test BPMN — LÁT A + B DONE, LÁT C NEXT

**Owner: Codex. Lát A và Lát B hoàn tất, verify ngày 2026-07-15; Lát C là bước kế.** Backend-only trước;
giữ backward-compatible toàn bộ contract
`/api/process-definitions/*` mà Angular `/quy-trinh` đang dùng. UI Angular/React không thuộc phạm vi
trừ khi user giao riêng sau khi backend contract được khóa.

**Mục tiêu**:
1. Cho phép tạo/chỉnh sửa và lưu nháp BPMN mà không deploy, không làm tăng Camunda version.
2. Cho phép validate rồi phát hành một draft có chủ đích thành immutable deployed version, tái sử dụng
   invariant catalog ↔ engine và error envelope đã harden.
3. Cung cấp Test BPMN dạng test session cô lập: nhận variables, chạy process thử, quan sát trạng thái/
   current elements/tasks/variables/incidents và điều khiển các user task cần thiết mà không ghi vào
   domain `HoSo`/`NhiemVu` hoặc gọi side effect production.

**Phạm vi triển khai theo lát, theo thứ tự**:

### Lát A — Draft model + chỉnh sửa/lưu nháp — DONE 2026-07-15
- Thêm Flyway/entity/repository riêng cho draft và revision/audit; draft **không** dùng chung ý nghĩa
  với immutable `ProcessDefinitionVersion` đã deploy. Lưu BPMN XML, catalog/process metadata, checksum,
  revision, actor/timestamps và trạng thái tối thiểu `DRAFT|VALID|INVALID|DEPLOYED` (tên cuối cùng khóa
  khi code để tránh trùng semantics hiện hữu).
- Optimistic locking bắt buộc (`revision`/ETag hoặc expected revision) để hai editor không silently
  overwrite nhau; conflict trả 409 rõ ràng. Save lặp cùng nội dung phải idempotent theo checksum hoặc
  tạo revision có chủ đích, không âm thầm deploy.
- Contract dự kiến cần khóa trước khi viết controller:
  - `POST /api/process-definition-drafts` — tạo draft mới từ metadata + BPMN XML.
  - `GET /api/process-definition-drafts/{id}` — đọc draft/revision hiện tại.
  - `PUT /api/process-definition-drafts/{id}` — lưu chỉnh sửa với expected revision.
  - `POST /api/process-definition-drafts/{id}/validate` — validate không deploy.
  - `POST /api/process-definition-drafts/{id}/deploy` — phát hành có chủ đích.
- Deploy draft phải đi qua validator + `CamundaDeploymentService` hiện hữu, chỉ ghi immutable version
  sau khi Camunda thành công, giữ response/error contract tương thích. Không sửa/xóa version đã deploy.

**Kết quả Lát A**:
- Flyway `V4__process_definition_drafts.sql`; entity/repository riêng cho current draft và snapshot
  revision bất biến. Draft lưu XML/metadata/checksum/status/actor/timestamps, JPA `@Version`; không
  trộn với `ProcessDefinitionVersion`. Draft đã deploy bất biến; vẫn cho phép tạo draft mới cùng
  `bpmnProcessId` để phát triển version tiếp theo.
- Khóa contract JSON đúng các endpoint dự kiến. `PUT`, `validate`, `deploy` nhận `expectedRevision`;
  stale trả 409. Save trùng toàn bộ metadata + checksum idempotent, giữ nguyên revision. Mọi mutation
  lấy pessimistic row lock trước khi kiểm tra revision, tránh hai deploy song song cùng qua gate.
- `validate` dùng lại hardened XML validator nhưng không gọi Camunda; kết quả `VALID|INVALID`, warnings/
  errors và snapshot audit được lưu. Chỉ `/deploy` gọi publication path dùng chung với import hiện hữu;
  Camunda failure không đánh dấu draft deployed/không tạo snapshot giả, success lưu `deployedVersionId`.
- Backward compatible `/api/process-definitions/*`; tài liệu request/response/curl trong
  `backend/README.md`. Không sửa frontend, không triển khai Test BPMN.
- `mvn clean verify` GREEN: **25 tests**, gồm 6 draft service + HTTP stale-409; test import/read cũ
  vẫn xanh. Real-stack smoke không gọi `/deploy`: draft `f501abaf-0834-4fbd-98a3-04813693a352`,
  revision `0→1→2`, 3 snapshot, reload `VALID`, stale save HTTP 409; Camunda version `5→5`, số row
  immutable `process_definition_version` `3→3`. Backend smoke tạm cổng 8091 đã dừng sạch; backend
  sẵn có cổng 8090 không bị đụng.

### Lát B — Test BPMN session an toàn — DONE + VERIFIED 2026-07-15
- Trước khi code phải khóa isolation model bằng test/POC nhỏ: test definition không được deploy dưới
  production process id/tenant theo cách làm tăng hoặc thay đổi khái niệm “latest” production. Ưu tiên
  test-only identity/tenant hoặc engine test riêng; không tự sửa XML/process id nếu việc đó làm sai
  call-activity/message/reference semantics.
- Contract dự kiến:
  - `POST /api/bpmn-tests` — tạo session từ draft/revision + input variables, validate và start test.
  - `GET /api/bpmn-tests/{id}` — snapshot instance/status/current elements/tasks/variables/incidents.
  - `POST /api/bpmn-tests/{id}/tasks/{taskKey}/complete` — hoàn thành user task test với variables.
  - `DELETE /api/bpmn-tests/{id}` — cancel/cleanup session đang chạy.
- Test session có TTL/timeout, correlation id, actor/audit và trạng thái terminal rõ. Cancel instance
  khi timeout/xóa; ghi rõ retention của test definition theo isolation model thực tế, không tuyên bố
  xóa engine history nếu Camunda topology hiện tại không hỗ trợ an toàn.
- Service task/connector/job worker có side effect phải fail-closed hoặc đi qua allowlist mock/stub test;
  tuyệt đối không gửi email, ghi SAP/hệ ngoài hay mutate bảng nghiệp vụ thật. Unknown worker phải trả
  trạng thái blocked/incident có giải thích thay vì giả success.

### Lát C — Tests, smoke và tài liệu
- Automated tests: draft CRUD/revision conflict/checksum, validation error, deploy failure không đổi
  draft thành deployed/không ghi version giả, deploy success correlation đúng, auth/CORS và backward
  compatibility của import/read API hiện hữu.
- Test-session failure modes: invalid variables/XML, Camunda unavailable, timeout/cancel, unknown worker,
  user-task stepping, incident snapshot và chứng minh không ghi `HoSo`/`NhiemVu`.
- Real-stack smoke lặp lại được: create draft → edit/save/reload → validate → test session/start/step/
  inspect/cancel → deploy draft có chủ đích → PostgreSQL/Camunda correlation → restart/read lại; fail
  loud khi thiếu Docker stack, không biến integration test thành mock xanh.
- Chạy `mvn verify`, smoke thật, cập nhật `backend/README.md` và STATE bằng evidence/key. Backend được
  dừng sạch sau smoke, không tự ý xóa engine versions/history hiện có.

**Definition of Done**:
- Lưu/chỉnh sửa draft và reload không tạo Camunda version; concurrent stale save trả 409, không mất dữ liệu.
- Validate draft không deploy; deploy draft tạo đúng một immutable DB/engine version có correlation keys.
- Test BPMN chạy trong isolation đã chứng minh, quan sát/step/cancel được và không mutate domain hay gọi
  side effect production.
- Contract/failure/security tests + `mvn verify` + real-stack smoke xanh; API Angular hiện hữu không vỡ.

**Ngoài phạm vi**:
- Chưa làm editor UI Angular, autosave UI, collaborative editing/CRDT, production SSO/RBAC, activation/
  rollback production, object storage, dependency registry đầy đủ hoặc transactional outbox.
- Không dùng “Test BPMN” như production dry-run trên dữ liệu thật; không xóa version/history Camunda
  đang có. Nếu isolation cần tenant/engine riêng ngoài topology dev hiện tại, dừng ở boundary đó và báo
  user thay vì hạ tiêu chuẩn an toàn.

---

## ★ COMPLETED — Codex/backend hardening cho BPMN import/deploy — DONE + VERIFIED 2026-07-15

**Owner: Codex. Ưu tiên kế tiếp theo xác nhận của user 2026-07-15.** Làm song song với Claude dựng
trang Angular `/quy-trinh`; nhánh này chỉ sửa `backend/`, test/smoke tooling backend và STATE, không
sửa component/service/route Angular hoặc React mock.

**Kết quả triển khai + evidence**:
- Startup deploy đã chuyển sang if-absent: `CamundaProcessDefinitionLookup` dùng Camunda Search API
  tra đúng BPMN process id `RD01_01` (khác mã nghiệp vụ/API `RD01.01`),
  `StartupProcessDeploymentService` chỉ deploy resource đóng gói khi engine chưa có definition.
  Query lỗi thì fail-closed; existing definition thì log `skipped` cùng version/key. Import API vẫn
  là đường duy nhất tạo version mới có chủ đích và không đổi response contract.
- Thêm automated tests cho first boot deploy đúng một lần, repeated startup skip, lookup unavailable
  không deploy, process-id mismatch fail-closed; HTTP contract khóa multipart field `file`, 201,
  list/detail/versions + `bpmnXml`, error envelope 400/422, dev API key và CORS preflight Angular.
  `DevApiKeyFilter` nay bỏ qua đúng CORS preflight; request API thật vẫn bắt key.
- `mvn verify` **BUILD SUCCESS, 17/17 tests PASS**.
- Thêm `backend/scripts/smoke-process-import.ps1`, kiểm thật và fail loud qua Spring Boot → PostgreSQL
  → Camunda → restart. Run 2026-07-15: startup giữ engine **v3** (không sinh version); import API tạo
  đúng **v4**, catalog `d877084c-005f-4ee6-aa69-a2d9fecc62fc`, process-definition key
  `2251799813689491`; PostgreSQL có record/correlation keys/XML; Camunda tạo instance key
  `2251799813689492`; restart log skip v4 và không sinh v5; read API còn XML. Backend được dừng sạch
  sau smoke; Docker stack vẫn chạy healthy.
- First-boot trên engine trống được khóa bằng test tự động; không xóa version 1–3 để thử destructive
  trên external state, đúng phạm vi đã chốt. README ghi rõ prerequisite/cách chạy lại và việc mỗi smoke
  thành công chủ đích tạo đúng một imported version mới.

**Lý do ưu tiên — drift đã kiểm chứng thật, không phải giả định**:
- `ProcessDeploymentRunner` hiện gọi deploy resource RD01.01 vô điều kiện mỗi lần Spring Boot start.
- Camunda REST đang có RD01.01 version **1, 2, 3**, trong khi PostgreSQL catalog chỉ có version **2**
  (`processDefinitionKey=2251799813688755`). Version 3 phát sinh do restart, không phải import có chủ
  đích. Nếu tiếp tục, mỗi restart tạo thêm version engine và khái niệm "latest" của Camunda lệch với
  version catalog/UI đang hiển thị.
- CORS dev cho `http://localhost:4200` đã có trong `backend/.../config/WebConfig.java`; không mở lại
  CORS thành task riêng.

**Phạm vi triển khai theo thứ tự**:
1. **Startup deploy idempotent / if-absent**:
   - Giữ khả năng first boot tự deploy RD01.01 khi Camunda chưa có process id này.
   - Restart khi definition đã tồn tại phải skip, không tạo version mới.
   - Version mới sau first boot chỉ được tạo qua import API có chủ đích. Nếu cần cập nhật BPMN đóng
     gói, dùng import API hoặc một cờ force tường minh; không âm thầm deploy do restart.
2. **Khoá invariant catalog ↔ engine**:
   - Tách/query nhỏ đủ để runner xác định definition đã tồn tại; log rõ `deployed` hay `skipped` cùng
     process id/version/key.
   - Không tuyên bố catalog version là Camunda latest nếu không có bằng chứng; response import/read
     hiện hữu phải giữ backward-compatible cho Angular đang nối.
3. **HTTP contract tests tự động**:
   - Khoá multipart field `file`, HTTP 201 success, list/detail/versions và `bpmnXml` đọc lại được.
   - Khoá payload lỗi `{message, errors[]}` cho 400 validation và 422 deployment failure.
   - Khoá dev API key/CORS preflight ở mức cần thiết cho Angular localhost:4200.
4. **Failure-mode tests**:
   - Camunda unavailable/deploy rejected không tạo catalog/version thành công.
   - Restart/runner gọi lặp không tạo version mới; first boot vẫn deploy đúng một lần.
5. **Smoke E2E có thể chạy lại**:
   - Tạo script/profile backend chạy chuỗi import API → PostgreSQL verify → Camunda definition search
     → start process instance → restart backend → xác nhận version không tăng và catalog/XML còn đọc.
   - Ghi rõ prerequisite Docker stack; fail loud, không biến test integration thật thành mock xanh.
6. Chạy `mvn verify`, smoke E2E thật, cập nhật `backend/README.md` và STATE bằng evidence/version keys.

**Definition of Done**:
- Hai lần restart liên tiếp không tăng Camunda version của RD01.01; first boot trên engine trống vẫn
  deploy được resource đóng gói.
- Import API vẫn tạo đúng một version mới có record PostgreSQL/correlation keys tương ứng.
- Contract/failure tests tự động xanh; smoke E2E thật chứng minh API → DB → Camunda → restart.
- Không yêu cầu Claude sửa contract Angular đã bắt đầu dùng; không sửa UI trong nhánh này.

**Ngoài phạm vi**:
- Không làm activation/rollback, object storage, dependency registry, SSO/RBAC production hoặc
  transactional outbox trong hardening slice này.
- Không xoá các Camunda version 1–3 hiện có (external state/lịch sử đã sinh); chỉ ngăn drift mới và
  chứng minh invariant từ thời điểm sửa trở đi.

---

## Lịch sử — PH2/PH3/PH4 mockup upgrade + domainCode scaffold + Phase 2 Connector framing — DONE 2026-07-10

**Bối cảnh**: User yêu cầu đọc
`docs/research/quan-tri-quy-trinh-bpm-platform-danh-gia-2026-07-10.md` (brainstorm/đánh giá
BA-PM + Solution Architect, **chưa lock**, đánh giá mở rộng "Phân hệ Quản lý Quy trình" từ engine
riêng của NVKHCN thành nền tảng "Quản trị Quy trình" dùng chung đa domain cho VHT) và lên kế
hoạch nâng cấp mockup. Kế hoạch ghi tại
`docs/research/quan-tri-quy-trinh-mockup-upgrade-plan-2026-07-10.md` (3 phase rủi ro tăng dần —
chỉ Phase 1 domainCode scaffold + phần bug-fix/cấu trúc PH2/PH3/PH4 được chọn triển khai; Phase 2
Connector-Worker framing và Phase 3 trang tổng quan platform-concept **chưa làm**, để tuỳ chọn
sau). Sau khi hỏi lại, user chọn nâng cấp cụ thể 3 nhóm chức năng: **Quản trị quy trình** (PH4),
**Phân quyền** (PH2), **Cấu hình biểu mẫu** (PH3/eForm).

**Phát hiện khi rà code** (trước khi sửa):
1. **Bug thật** (đã sửa) — `webapp/src/data/phanHe.ts` có 1 khối code chết (dòng ~148-156, sau
   khi định nghĩa `DANH_SACH_PHAN_HE` đúng) ghi đè `PH4.modules` bằng text mojibake double-encoded
   UTF-8 ("Quáº£n lÃ½ quy trÃ¬nh"...) — cùng loại lỗi đã sửa cho 5 file khác trong phiên
   2026-07-08 nhưng bỏ sót file này. Đã nằm trong code committed (không phải WIP phiên này).
2. **Bất đối xứng cấu trúc** (đã sửa) — PH2/PH3 có route `/phan-he/PHx/tong-quan` → `PhanHePage`
   (trang "Tổng quan" liệt kê modules), nhưng PH4 redirect thẳng `/quy-trinh`, không có landing
   tương tự; `PH4.modules` cũng thiếu "Ma trận Hành động"/"Tác vụ hệ thống" (đã tồn tại thật trong
   nav "Quản trị quy trình") và "Tích hợp"/"Nhật ký"/"Giám sát tiến trình" (trước đó nằm ở nav
   group riêng "Vận hành & Tích hợp").

**Việc đã làm (frontend-mock, không đụng F1):**
- **Fix bug** `webapp/src/data/phanHe.ts`: xoá khối mojibake ghi đè `PH4.modules`.
- **Đồng bộ `PH4.modules`**: thêm "Ma trận Hành động" (`/cau-hinh-hanh-dong`), "Tác vụ hệ thống"
  (`/cau-hinh-service-task`), "Tích hợp" (`/tich-hop`), "Nhật ký" (`/nhat-ky`) — cạnh 4 module cũ
  (Quản lý quy trình/Ma trận quyết định/Ma trận phê duyệt/Giám sát tiến trình).
- **Route PH4 Tổng quan** (`webapp/src/App.tsx`): `/phan-he/PH4` giờ redirect
  `/phan-he/PH4/tong-quan` (trước: redirect thẳng `/quy-trinh`) → render `<PhanHePage
  phanHeId="PH4" />`, đúng pattern PH2/PH3. Không thêm mini-sider riêng cho PH4 (module routes của
  PH4 là top-level route đã có trong main nav, không giống PH2/PH3 có route namespace
  `/phan-he/PHx/*` riêng — thêm mini-sider sẽ trùng lặp/rối, nên bỏ qua).
- **Gộp nav** (`webapp/src/App.tsx`, theo lựa chọn user): nhóm "Vận hành & Tích hợp" (Giám sát
  tiến trình/Tích hợp/Nhật ký, trước đây `canManageSystem`-gated riêng) nay nằm trong nhóm
  "Quản trị quy trình" (`quytrinh-config`), cùng cấp với "Tác vụ hệ thống" — giữ nguyên toàn bộ
  điều kiện hiển thị cũ (chỉ đổi cây/nhãn, không đổi quyền truy cập). Xoá import
  `DeploymentUnitOutlined` không còn dùng.
- **domainCode scaffold** (Configuration Service multi-domain prep, theo mục 3.3 tài liệu đánh
  giá — hành vi không đổi vì chỉ có 1 domain thật):
  - `webapp/src/data/rbac.ts`: thêm `DomainCode` type (`'KHCN'`) + `DEFAULT_DOMAIN_CODE`; field
    `domainCode: DomainCode` **bắt buộc** trên `RolePermissionPolicy` + `UserRoleAssignment`, tất
    cả seed đã gán `DEFAULT_DOMAIN_CODE`. `webapp/src/data/rbacEngine.ts`: `getMatchedPolicies`/
    `getEffectivePermissions`/`getUserAssignments`/`getEffectiveDataScopes`/`checkPermission`/
    `hasPermission`/`canAccessFeature` đều có thêm param `domainCode` cuối cùng (default
    `DEFAULT_DOMAIN_CODE`) và filter theo domainCode — **backward-compatible 100%** (mọi call
    site cũ không đổi vì param optional ở cuối + default khớp seed). `RbacContext.tsx`
    `upsertAssignment` + `RolePermission.tsx` `ensure()` (tạo policy mới) cũng gán
    `DEFAULT_DOMAIN_CODE`.
  - `webapp/src/data/actionAvailabilityPolicy.ts` (`ActionAvailabilityPolicy`),
    `webapp/src/data/actionRegistry.ts` (`ActionDefinition`),
    `webapp/src/data/approvalMatrix.ts` (`ApprovalRule`),
    `webapp/src/data/exceptionPolicy.ts` (`ExceptionActionPolicy`): thêm field
    **`domainCode?: DomainCode` (optional, KHÔNG bắt buộc)** — quyết định có chủ đích khác với
    rbac.ts: các file này có nhiều seed rows hơn (16+/7+ rows) và nhiều call site resolver hơn
    (dùng ở DossierDetail/Worklist/ActionStudio/bpmnReconcile...); ép field bắt buộc + xâu chuỗi
    param `domainCode` qua toàn bộ resolver sẽ tốn công sửa hàng chục nơi mà **hiện chưa có bất kỳ
    domain thứ 2 nào cần lọc** — over-engineering. Field optional (mặc định hiểu ngầm = KHCN) đã
    đủ để migrate schema rẻ hơn sau này mà không đụng logic/behaviour hiện tại.
- **Phase 2 — khung "vai trò Connector"** (`webapp/src/pages/IntegrationStatus.tsx`,
  `SystemDetailDrawer`): thêm 1 khối ghi chú (viền nét đứt, tách biệt trực quan khỏi phần dữ liệu
  thật) ngay dưới Tag trạng thái/mô tả hệ: "Vai trò trong nền tảng (khái niệm — chờ đặc tả kỹ
  thuật): hệ này tham gia như **data/service endpoint**, không sở hữu hay thay thế workflow nội
  bộ của hệ nguồn." — thuần trình bày/label, gắn nhãn rõ "khái niệm — chờ đặc tả kỹ thuật" đúng
  cảnh báo trong kế hoạch để không bị hiểu nhầm là đã có Connector Worker/Zeebe job worker/mTLS
  thật. Không đổi hành vi, không đổi `IntegrationSystem`/`camundaOps.ts`.
- **Verify**: `npm run build` GREEN (tsc + vite, chạy lại 3 lần xác nhận exit 0, không lỗi TS).
  Chưa click-through trình duyệt (Playwright chưa cài, nhất quán các phiên trước).

**Chưa làm (theo đúng kế hoạch, chờ chọn tiếp)**: Phase 3 (trang tổng quan khái niệm platform đa
domain cho mục đích họp sign-off) — optional, chưa được yêu cầu triển khai. Cũng chưa đụng
`docs/req/scope-2-phanhe.md`, chưa ghi gì vào `decisions.md` — đúng nguyên tắc "chờ sign-off"
của tài liệu đánh giá gốc.

---

## Lịch sử — Canvas Form Designer: nâng cấp hiển thị đúng AntD cho Ô chữ/Thả xuống/Số/Ô nhiều dòng — DONE 2026-07-10

Follow-up polish của D13 (builder AntD chrome) — user chỉ ra canvas (giữa, vẫn là DOM viewer
form-js được skin CSS) còn lệch AntD so với "bản đích" thật (`FormRenderer.tsx`/D12, dùng thẳng
component AntD ở pane Xem trước). Đọc trực tiếp CSS nguồn `@bpmn-io/form-js` tìm ra 3 khoảng lệch
xác nhận được bằng source (không đoán): (1) `--font-family` của form-js là biến RIÊNG (IBM Plex
Sans), không phải `--cds-*` nên không nằm trong bảng ánh xạ token cũ → canvas vẫn hiện sai font;
(2) `--color-warning` (viền lỗi validate) suy từ `--cds-text-error`, cũng không có trong bảng ánh
xạ → 3/4 field (trừ Số đã được vá riêng) lên viền lỗi đỏ Carbon thay vì `--vht-danger`; (3) menu mở
của Thả xuống (`.fjs-dropdownlist`) chưa được skin — 100% mặc định Carbon (bo 3px, hover đảo màu).
User chốt phạm vi: dấu `*` bắt buộc chỉ đổi màu đỏ, GIỮ vị trí sau nhãn (không đụng cấu trúc
label); disabled/readonly để đợt sau.

**Đã sửa — chỉ 1 file, thuần CSS**: `webapp/src/branding/bpmnio-skin.css`, 4 bổ sung nhỏ vào cụm
"Đợt AntD-parity" có sẵn (D13 Lát C, ~dòng 305–500):
- `--font-family`/`font-family: var(--vht-font)` trên `.vht-fd-canvas .fjs-container`.
- `--color-warning: var(--vht-danger)` trên `.vht-fd-canvas .fjs-container` (đồng bộ viền lỗi cả
  4 field qua đúng biến gốc thư viện, không vá riêng lẻ; rule vá riêng cho Số giữ nguyên — vô hại).
- `.fjs-dropdownlist`/`.fjs-dropdownlist-item`/`.focused` theo thông số Select AntD (bo
  `--vht-radius`, đệm option 5px/12px, hover nền `--vht-red-050`/chữ `--vht-red`).
- `.fjs-form-field.required label::after { color: var(--vht-danger) }` — chỉ đổi màu, giữ vị trí.

**Verify**: `npm run build` GREEN (12.87s, tsc + vite). Thuần CSS, không đụng
`FormDesigner.tsx`/`FieldPalette.tsx`/`FieldProperties.tsx`/schema/engine/binding. Kế hoạch:
`C:\Users\phuctd7\.claude\plans\optimized-churning-horizon.md`. **Chưa click-through trình duyệt**
(Playwright chưa cài, nhất quán các phiên trước) — cần user mở `npm run dev` → Form Designer, so
font/màu viền lỗi/menu Thả xuống với pane "Xem trước" (AntD thật) trước khi coi là chốt hẳn.

---

## Lịch sử — Gỡ theme `/danh-sach-phan-he`, đưa về design chuẩn các màn khác — DONE 2026-07-09

User đảo chiều quyết định: **bỏ hẳn theme "Đỏ Tác Chiến"** (nền tối blueprint + constellation +
beam quét + mono + glass tối), thiết kế lại trang portal theo cùng khuôn các màn danh sách khác
(`ProcessCatalog`…): nền sáng `var(--vht-surface-2)`, `PageHeader` chuẩn + dải `StatCard` (4 ô:
Tổng/Có quyền/Chưa có quyền/Sắp ra mắt) + `FilterBar` (chip lọc ở `left`, đếm kết quả ở `right`,
Input.Search) + lưới `PhanHeCard`. Card giữ layout cũ nhưng nền trắng đặc, viền `--vht-border`,
bỏ backdrop-blur & pill mono.
- `SubsystemList.tsx`: viết lại — bỏ `ConstellationLines`/`HeroBanner`/`BentoStatCard`, bỏ class
  `qtkhcn-standalone-bg`/`qtkhcn-mono`, đổi mọi màu chữ sáng-trên-tối → token mực chuẩn.
- `App.tsx`: header standalone bỏ `qtkhcn-glass-header` (dùng header trắng chuẩn), wordmark QTKHCN
  → mực đen (bỏ mono/letter-spacing), tên user/chức danh bỏ override màu sáng, `Content` bg
  standalone `#17090b` → `var(--vht-surface-2)`. Gỡ import chết `DatabaseOutlined`.
- `tokens.css`: xóa toàn bộ CSS theme không còn dùng (standalone-bg + ::before/::after,
  glass-header, glass-card, constellation + keyframes draw/node-in/scan/ping/node-pulse,
  reduced-motion block, `.qtkhcn-mono`, `.qtkhcn-ping-dot`). Giữ tokens :root, scrollbar,
  bento-card, slot-group-separator.

**Verify**: `npx tsc --noEmit -p tsconfig.json` GREEN (0 lỗi). Chưa click-through trình duyệt —
**Next: user mở `/danh-sach-phan-he` xác nhận layout sáng đồng bộ các màn khác.**

---

## Lịch sử — Theme `/danh-sach-phan-he` "Đỏ Tác Chiến" (Slice A) — DONE rồi bị gỡ 2026-07-09

Plan of record: `docs/research/danh-sach-phan-he-theme-upgrade-plan-2026-07-09.md`. Frontend-mock
recolor + hiệu ứng của trang danh sách phân hệ (same carve-out as D10–D13, no F1). 3 quyết định
đã chốt trong plan: giữ nền tối blueprint, giữ `window.open`, đổi Navy/Gold → Đỏ Tác Chiến.

- **A1 recolor**: `tokens.css` — biến `--blueprint-*` + toàn bộ gradient layer (L2/L3/L4, beam
  `::before`, `.qtkhcn-glass-header`) sang `--vht-red`/`--vht-red-chrome` theo bảng palette trong
  plan; đồng thời quét sạch màu gold/navy còn sót ở inline style `SubsystemList.tsx` (section
  title/hero/empty-state/request-access → trắng ánh đỏ `rgba(255,241,243|255,218,216,…)`) và nền
  standalone `App.tsx:591` (`#0a1628`→`#17090b`). Grep xác nhận 0 giá trị palette cũ còn lại.
- **A2 đường nối tự vẽ**: bỏ 3 lớp L5 linear-gradient tĩnh khỏi `background-image`; thêm
  `ConstellationLines` (SVG overlay `.qtkhcn-constellation`, 11 node/11 cạnh, 2 hub khớp
  `--blueprint-hub1/2`) trong `SubsystemList.tsx`. Kỹ thuật: `pathLength={1}` ⇒ dasharray/offset
  chuẩn hoá, animate `qtkhcn-draw` 1.8s ease-out **one-shot forwards**, stagger 130ms/đường +
  node fade-in. `prefers-reduced-motion: reduce` ⇒ render trạng thái vẽ xong ngay + tắt luôn
  beam quét & ping-dot.
- **A3 mono**: `index.html` thêm `IBM+Plex+Mono:wght@400;500;600` vào URL Google Fonts sẵn có;
  `--vht-font-mono` + class `.qtkhcn-mono` trong `tokens.css`; áp cho giá trị số `BentoStatCard`
  và pill trạng thái card (KHÔNG áp tiêu đề/mô tả tiếng Việt).

**Verify**: `npm run build` GREEN (tsc + vite, 13.6s); grep dist xác nhận
`.qtkhcn-constellation`/`#17090b`/IBM Plex Mono vào bundle. CHƯA click-through trình duyệt
(Playwright chưa cài — nhất quán các phiên trước). **Next: user chạy `npm run dev` mở
`/danh-sach-phan-he` soi palette đỏ + animation vẽ đường + font mono; cần test trực quan dấu
tiếng Việt của IBM Plex Mono trên pill trạng thái (plan A3 yêu cầu) trước khi chốt.**

**Follow-up tương phản (user feedback sau khi soi trực quan, 2026-07-09 — DONE)**: glass trắng
64–72% trên nền `#17090b` cho ra xám đục, chữ khó đọc; header trắng + breadcrumb đỏ lạc lõng.
Fix theo "phương án 1: card sáng đục, header tối":
- Card/hero/filter-bar `SubsystemList.tsx`: alpha 0.56–0.72 → 0.88–0.92 (trắng gần đục, giữ blur);
  chữ phụ `#8c8c8c`/`#999` → `#737373`. `.qtkhcn-glass-card` (tokens.css) → 0.92, viền đỏ mờ.
- `.qtkhcn-glass-header` (tokens.css) → glass tối `rgba(23,9,11,0.72)` + viền dưới đỏ 0.28.
- `App.tsx` header standalone: breadcrumb (trùng tiêu đề trang) → wordmark `QTKHCN` mono + ô đỏ;
  tên user/chức danh → chữ sáng (conditional theo `isStandalonePage`).
- Nhân tiện gỡ chặn build: `ServiceTaskConfig.tsx:55` `CATEGORY_GROUPS` unused (WIP module của
  user, untracked) → thêm `export` (giữ data). Build GREEN 16.4s.

**Backlog giữ nguyên (đợt sau)**: Slice B (đồng bộ theme sang `PhanHePage.tsx`), Slice C (luồng
điều hướng PH1/CTA-Modules), D (pendingTasks), E (refactor inline style), F (profile/notification).

---

## ★ CURRENT — eForm builder chrome (D13): palette + panel AntD trên engine form-js — DONE (cả 3 lát, 2026-07-09)

Decision **D13** locked 2026-07-09 (amends D12 §1 "builder unchanged"). User yêu cầu builder
(`FormDesigner`) "theo AntD 100%": **vỏ = AntD tự viết, ruột = form-js giữ nguyên**. Frontend-mock,
no F1 dependency. Slice: **Lát A palette → Lát B properties panel → Lát C polish**.

**Kiến trúc chốt (đã đọc source form-js editor):**
- Editor chỉ export `ContextPadModule`+`FormEditor` ⇒ không gỡ được module palette/panel gọn →
  **portal palette+panel native vào div ẩn** (`display:none`), dựng UI AntD trên service.
- Service dùng: `modeling.addFormField/editFormField/removeFormField`, `selection.get()`+event
  `selection.changed`, `formLayouter.nextRowId()`, `editor._getState().schema` (root field sống).
- **Kéo–thả MIỄN PHÍ**: draggle bind `pointerdown` capture trên `document.documentElement`, dùng
  `isContainer(el)` động (classList). Item AntD mang class `fjs-palette-fields fjs-drag-container
  fjs-no-drop` (wrapper) + `fjs-drag-copy` + `data-field-type` (item) ⇒ dragula tự nhận, thả xuống
  canvas gọi `createNewField` của form-js. Không viết lại drag.

**Lát A — DONE (2026-07-09).**
- Tạo `webapp/src/components/formdesign/FieldPalette.tsx`: palette AntD, 4 nhóm (Nhập liệu / Lựa
  chọn / Trình bày / Bố cục) nhãn tiếng Việt + icon AntD + ô tìm kiếm (`Input`+`Empty`). Mỗi item
  mang class ma thuật form-js (kéo) + `onClick`→`onAdd(type)` (click).
- `FormDesigner.tsx`: import FieldPalette; dock trái render `<FieldPalette onAdd={handleAddField}>`;
  palette native portal vào `<div display:none ref={paletteRef}>`. `handleAddField(type)` dựng attrs
  như `createNewField` (`_parent`, `layout.row=nextRowId()`), thêm vào cuối container đang chọn
  (group/dynamiclist) hoặc root qua `modeling.addFormField`.
- CSS `.vht-fp-*` trong `bpmnio-skin.css` (cùng cụm AntD-parity): item flex + hover đỏ + mirror
  dragula (`.gu-mirror`).
- **Verify**: `npm run build` GREEN (12.0s). Cơ chế kéo–thả xác minh qua đọc source (draggle bind
  document-level pointerdown + isContainer động) — CHƯA click-through trình duyệt (Playwright chưa
  cài). **Next: user chạy `npm run dev` soi palette + thử kéo/click, xác nhận trước khi làm Lát B.**

**Lát B — DONE (2026-07-09).**
- Tạo `webapp/src/components/formdesign/FieldProperties.tsx`: panel AntD cho field đang chọn.
  Sections: Chung (key/label/description) · Nội dung (text/html) · Biểu thức FEEL (expression) ·
  Kiểm tra hợp lệ (required + min/max cho number + minLength/maxLength cho text) · Tùy chọn
  (OptionsEditor value/label cho select/radio/checklist/taglist) · Ẩn/hiện FEEL (conditional.hide) ·
  nút Xóa (Popconfirm). Ô chữ commit-on-blur (mỗi sửa = 1 undo, không mất focus); switch/số commit
  ngay. Type→nhãn VN + id (copyable). Root (type 'default') → ghi chú; không chọn → Empty.
- `FormDesigner.tsx`: nghe `selection.changed` → `setSelectedField`; `commandStack.changed` bump
  `selVersion`; render `<FieldProperties key={id#version}>` (remount nạp lại giá trị sau sửa/undo);
  panel native portal vào `<div display:none>`. `handleEditField` = `modeling.editFormField` (try/catch
  key trùng), `handleRemoveField` = tìm parent+index rồi `modeling.removeFormField`. **Gỡ toggle
  "Nâng cao"** (chỉ điều khiển panel native — không còn ý nghĩa); module `khcnFormSimplePanelModule`
  giữ nhưng nhận `() => false`.
- **Verify**: `npm run build` GREEN (12.9s); dev server HMR nạp lại không lỗi. CHƯA click-through.
  **Next: user thử chọn field trên canvas → sửa key/label/required/options/FEEL/xóa, kiểm undo/redo.**

**Lát C — DONE (2026-07-09). D13 HOÀN TẤT (cả 3 lát).**
- `FieldProperties.tsx`: thêm props theo type còn thiếu — `group` có section "Bố cục nhóm" (nhãn +
  Switch "Hiển thị khung viền" = `showOutline`); `dynamiclist` thêm vào REQUIREABLE nên có công tắc
  *Bắt buộc*. Thêm `showOutline?: boolean` vào FField.
- `bpmnio-skin.css`: **dọn CSS chết** — bỏ các rule skin palette/panel NATIVE (`.vht-fd-palette-dock
  .fjs-palette-*`, `.vht-designer .bio-properties-panel-*` bổ sung phiên này) vì native giờ ẩn trong
  div `display:none` (UI là AntD). Giữ skin CANVAS (`.vht-fd-canvas .fjs-*`) vì canvas vẫn là DOM
  form-js. Cập nhật comment cụm AntD-parity (chỉ còn canvas). Lưu ý: block Đợt 6
  `.vht-designer .bio-properties-panel` + polish `.vht-designer .fjs-palette-*` cũ để lại (vô hại,
  nhắm DOM ẩn; gắn với check:panel-vars/README — không gỡ trong phiên này).
- **Verify**: `npm run build` GREEN (12.5s). CHƯA click-through (Playwright chưa cài).

**Next (không còn lát D13):** kiểm chứng end-to-end trên trình duyệt khi có Playwright — mở Form
Designer, kéo/click thêm field, chọn field sửa key/label/required/options/FEEL/showOutline/xóa,
undo/redo, Lưu → schema round-trip. Việc "sau" (tuỳ chọn): thêm popup FEEL autocomplete (bù D13 §4),
props nâng cao cho image/table/iframe, kéo item palette AntD có preview đẹp hơn.

---

## eForm B-engine renderer (D12) — ALL 3 LÁT DONE (2026-07-09)

Plan of record: `docs/arch/eform-b-engine-architecture.md`. Decision **D12** locked 2026-07-09.
Frontend-mock work (swaps the runtime form renderer only) — same carve-out category as
D10/D11/EPIC06, does NOT touch the F1 blocker.

**PH3 nav grouping (done first, per user) — DONE.** User flagged (from
`docs/research/userflow-sso-app-portal-phan-he-2026-07-09.md`) that eForm UI must sit in its
correct phân hệ. Reorganized `webapp/src/App.tsx` sider: "Thư viện biểu mẫu" is now nested under
a new **"Danh mục dùng chung" (PH3)** submenu (`DatabaseOutlined`) instead of a lone top-level
item — nav-only, route `/bieu-mau` unchanged. Build green. See memory `ui-organize-by-phanhe`.

**Lát 1 — DONE.** Rewrote `webapp/src/components/FormRenderer.tsx` in place to an AntD renderer
(flat fields): `text`→markdown-lite Typography (heading/**bold**, no new dep, XSS-safe),
`textfield`→Input, `textarea`→Input.TextArea, `number`→InputNumber, `checkbox`→Checkbox,
`checklist`→Checkbox.Group, `radio`→Radio.Group, `select`→Select, `taglist`→Select multiple,
`datetime`→DatePicker/TimePicker (dayjs), `separator`→Divider, `spacer`→spacing. Controlled
`formData` state keyed by `component.key`; `validateField` covers required/min/max/minLength/
maxLength/pattern/email; unmapped types render a safe "chưa hỗ trợ" Alert (R4). **Kept the exact
`FormRendererHandle` + `FormSubmitResult` contract** (`submit(): {data, errors}`, errors keyed by
component id) so all 5 call sites are untouched.

**Deviations from the Lát-1 plan (flagged):**
1. **Kept the filename `FormRenderer.tsx`** (rewrote internals) instead of adding a separate
   `AntFormRenderer.tsx`. Rationale: same module path + exports ⇒ zero changes at the 5 call sites
   (`TaskFormModal`, `FormDesigner` preview, `FormLibrary`, `ProcessDetail`, `ActionStudio`).
2. **Did NOT keep the form-js runtime renderer as a fallback (OQ1).** All rendering — modal AND
   every preview — now uses AntD, matching the client's "must look like AntD everywhere" ask. The
   old form-js `Form` runtime is recoverable from git if a Lát-3 (`dynamiclist`) fallback is later
   needed. `@bpmn-io/form-js` stays a dep (builder `FormDesigner` still uses `FormEditor`).

**Verified**: `npm run build` GREEN (tsc + vite, 12.1s). The heavy form-js `Form` runtime chunk
(~334 kB) dropped out of the bundle for TaskFormModal/previews. No in-browser click-through —
Playwright not installed this session (consistent with prior sessions).

**Lát 2 — DONE (2026-07-09).** Cắm `feelin` (`^7.0.1`) vào `FormRenderer.tsx`:
- **`evalFeel(expr, ctx)`** — bỏ tiền tố `=` rồi `evaluate(src, ctx).value` (⚠ `feelin@7` trả
  `{value, warnings}`, KHÔNG phải value trực tiếp như snippet trong arch-doc §4 — đã unwrap
  `.value`). try/catch → `undefined` khi lỗi/parse hỏng (fail-safe, R4). Biến thiếu → `null` +
  warning, không throw.
- **Vòng reactivity** = `derived` useMemo trên `[components, formData]`: (1) tính mọi component
  `type:'expression'` có `key`+`expression` → `computed`; (2) đánh giá `conditional.hide` trên
  context đã trộn `{...formData, ...computed}` (điều kiện có thể tham chiếu trường tính toán) →
  `hidden` Set (keyed theo `idOf`).
- **① Ẩn/hiện**: component trong `hidden` → `return null` khi render, **bỏ khỏi validate + khỏi
  data submit** (tránh chặn nộp vì ô đang ẩn / tránh gửi dữ liệu ô ẩn).
- **② Tự tính**: `expression` có `label` → render Input `disabled readOnly` hiển thị giá trị
  computed; không `label` → headless (`return null`). `onChange` bị chặn cho field computed.
  Thêm hỗ trợ `readonly:true` (disable input) cho field thường.
- **submit()** dùng `derived.ctx` (đã gồm computed) + loại `hidden`. Contract `FormRendererHandle`
  giữ nguyên → 5 call site không đổi.
- **Seed demo mới** (bổ sung, KHÔNG sửa seed cũ): `webapp/src/forms/phieuDuToanDemo.ts`
  (`phieu-du-toan-demo`) — radio Đạt/Chưa đạt; textarea "Lý do chưa đạt" `conditional.hide`
  `=ketLuan != "chua_dat"` + required; number PL1/PL2; expression `tongKinhPhi` =
  `=(if kinhPhiPL1=null then 0 else kinhPhiPL1)+(...)`. Đăng ký trong `forms/index.ts`.

**Verified Lát 2**: `npm run build` GREEN (tsc + vite, 13.2s). Logic kiểm chứng bằng node harness
tái hiện `derived`/`submit` trên seed demo — 3 kịch bản đúng: (a) `ketLuan=dat` ⇒ Lý do ẩn, không
đòi required, không nộp, `tongKinhPhi` tự tính = 15; (b) `chua_dat` + trống Lý do ⇒ lỗi required
trên Lý do (đang hiện); (c) `chua_dat` + có Lý do ⇒ hợp lệ, nộp cả Lý do + `tongKinhPhi`. Không
click-through trình duyệt (Playwright không cài, nhất quán các phiên trước).

**Lát 3 — DONE (2026-07-09).** ③ `dynamiclist` → bảng động (thêm/xoá dòng) trong `FormRenderer.tsx`:
- **Refactor tái dùng**: tách `deriveState(components, data, parent={})` (module-level) — tính
  `{computed, ctx, hidden}` cho MỘT cấp; `parent` = context cấp trên. `derived` memo cấp gốc giờ
  chỉ gọi `deriveState(components, formData)` (hành vi Lát 2 giữ nguyên).
- **Đệ quy submit**: `processLevel(components, data, parent, prefix, errs)` (module-level) walk 1
  cấp, gặp `dynamiclist` thì đệ quy vào từng dòng với `parent = ctx` cấp trên; gom data thành
  **mảng object** (`out[key] = rows.map(...)`); lỗi ghi phẳng, key dòng = `<idList>#<dòng>.<idÔ>`
  (`rowErrKey`). `submit()` giờ = `processLevel(components, formData, {}, '', errs)` — contract
  `FormRendererHandle` GIỮ NGUYÊN. `dynamiclist` có `validate.required` + 0 dòng ⇒ lỗi "Cần ít
  nhất một dòng".
- **Render**: component `DynamicList` (mới, cuối file) — mỗi dòng là card viền, render đệ quy
  component con qua chính `ComponentField` (leaf, tái dùng), nút xoá dòng (`DeleteOutlined`) +
  "Thêm dòng" (`PlusOutlined`, `Button type="dashed" block`). Computed/hidden mỗi dòng suy từ
  `deriveState(children, row, rootCtx)`.
- **R2 (phạm vi biến FEEL trong dòng) — CHỐT**: context dòng = `{ ...gốc(rootCtx), ...dòng }`
  (dòng ưu tiên). ⇒ biểu thức trong dòng thấy cả biến dòng lẫn biến gốc; biểu thức gốc đọc được
  mảng dòng (vd `count(danhSachThanhVien)`).
- **Seed demo mới** (bổ sung, KHÔNG sửa seed cũ): `webapp/src/forms/phieuThanhVienDemo.ts`
  (`phieu-thanh-vien-demo`) — `dynamiclist` `danhSachThanhVien` (required) với con: hoTen(req),
  vaiTro(select), soThang(0–24), heSo(min0), expression `chiPhiUocTinh`=soThang×heSo (②theo dòng),
  textarea `ghiChu` `conditional.hide` `=vaiTro != "chu_nhiem"` (①theo dòng); + gốc: expression
  `soThanhVien`=`count(...)` (đọc mảng dòng), textarea yKien. Đăng ký trong `forms/index.ts`.

**Verified Lát 3**: `npm run build` GREEN (tsc + vite, 13.2s). Node harness tái hiện
`deriveState`/`processLevel` trên seed — 3 kịch bản đúng: (A) DS rỗng+required ⇒ lỗi `ds` "Cần ≥1
dòng", `soThanhVien=0`; (B) 1 chủ nhiệm đủ ⇒ `chiPhiUocTinh=6` (theo dòng), `ghiChu` hiện+vào
payload, `soThanhVien=1`, không lỗi; (C) 2 dòng ⇒ dòng0(thành viên) thiếu hoTen ⇒ `ds#0.ht` bắt
buộc, `ghiChu` dòng0 **ẩn** (không đòi, không nộp); dòng1 soThang=30>24 ⇒ `ds#1.st` MAX; cả 2 dòng
có `chiPhiUocTinh`, `soThanhVien=2`. Không click-through (Playwright không cài).

**Next: (không còn lát) — kiểm chứng end-to-end trên trình duyệt khi có Playwright** (mở
TaskFormModal thật, điền form có dynamiclist, Xác nhận, thấy trạng thái hồ sơ đổi — theo §8 arch).
Việc "sau" trong roadmap: `filepicker`→Upload (chặn bởi backend Foundation 1), `html/iframe`
(sanitize) — chưa làm. Cân nhắc lock đề xuất giữ/bỏ fallback form-js (OQ1) — hiện đã bỏ hoàn toàn.

**Goal of the whole task**: replace the form-js runtime renderer (which the client says looks
inconsistent with AntD) with a custom AntD renderer, while keeping the form-js **schema**,
**builder** (`FormDesigner`), **binding** (`formKey` on `ActionAvailabilityPolicy`), `FormContext`
and seed forms all unchanged. Engine for ①conditional / ②computed via `feelin` (already a dep,
`^7.0.1`); ③`dynamiclist` as an AntD editable table. Delivered in 3 slices.

**Lát 1 scope (this slice — flat fields only)**:
- New `webapp/src/components/AntFormRenderer.tsx` rendering flat form-js components with AntD:
  `text`(markdown)/`textfield`→Input, `textarea`→Input.TextArea, `number`→InputNumber,
  `checkbox`→Checkbox, `checklist`→Checkbox.Group, `radio`→Radio.Group, `select`→Select,
  `taglist`→Select multiple, `datetime`→DatePicker/TimePicker (vi_VN), `separator`→Divider.
- **Preserve the exact `FormRendererHandle` contract**: `submit(): { data, errors }` — validate
  `component.validate` (required/min/max/length/pattern) on visible fields; `data` = keyed by
  `component.key`. So `TaskFormModal.tsx` (checks `Object.keys(res.errors).length`) and
  `buildYKien(res.data)` need NO change.
- Swap `FormRenderer` → `AntFormRenderer` at the two call sites: `TaskFormModal.tsx` and the
  live-preview pane in `FormDesigner.tsx`. Keep `FormRenderer.tsx` (form-js) available as a
  fallback until Lát 3 lands (OQ1 in the design doc).
- **Out of scope this slice** (Lát 2/3): `feelin` wiring (conditional/computed), `dynamiclist`,
  `expression`, `filepicker`, `html/iframe`. Unmapped component types must render a safe
  "chưa hỗ trợ" placeholder, never crash (R4).

**Guardrails**: D10 — renderer must NOT infer outcome from form data (the button is the decision).
D12 — do not touch schema/builder/binding/store/seed. Match surrounding AntD + vi_VN idiom.

**Verify (per `.harness/rules` + /verify)**: `npm run build` green, then drive the real flow —
open a Phê duyệt dossier → TaskFormModal → fill `phieu-phe-duyet`/`phieu-y-kien` → Xác nhận →
confirm dossier status changes (not just preview). Note if Playwright unavailable this session.

---

## Side task (2026-07-08) — Action Registry catalog seed — DONE

Reviewed `docs/research/action-registry-list.md`, found it stale vs. code (still described
`PROCESS_STEP` as current; D10 already replaced it with `APPROVE_STEP`/`RETURN_STEP`/
`REJECT_STEP`). User asked to seed the doc's Phase 2 (Support Actions) and Phase 3 (Exception
Actions) proposals into the Action Registry ("Danh mục nút" tab, Action Studio). Confirmed with
user this was a deliberate short detour from the Integration screen Đợt 3 active task below.

**What shipped**: `webapp/src/data/actionRegistry.ts` — added `PROPOSED_SUPPORT_ACTION_CODES`
(`UPLOAD_ATTACHMENT`/`VIEW_DOCUMENTS`/`EXPORT_PDF`/`PRINT_DOSSIER`/`VIEW_AUDIT`) and
`PROPOSED_EXCEPTION_ACTION_CODES` (`REQUEST_ADD_REVIEWER`/`REQUEST_REPLACE_APPROVER`/
`REQUEST_REOPEN_STEP`/`REQUEST_MANUAL_COMPLETION`/`REQUEST_EMERGENCY_APPROVAL`), both merged
into `ACTION_REGISTRY` with `active: true`. Icons added to `data/actionPresentation.ts`
`ICON_BY_ACTION`. These now render in Action Studio's "Danh mục nút" tab (reads
`Object.values(ACTION_REGISTRY)` directly) but are **catalog-only, not wired**:
- Support actions have no `ActionAvailabilityPolicy` row → won't appear on real dossier/worklist
  screens (`getAvailableActions`'s tier1 only includes actionCodes present in `policies`).
- Exception actions have no `ExceptionType` in `exceptions.ts` → `EXCEPTION_ACTION_CODE` (which
  `getAvailableActions`/`getDebugActions` iterate) doesn't include them yet.

`docs/research/action-registry-list.md` updated to match: marked Phase 1 done (D10), Phase 2/3
marked "seed xong, chưa wiring", added follow-up questions (ExceptionType + policy per new
exception action). **Build verified green** (`npm run build`, 32.5s, no errors).

**Not done / explicit follow-up**: wiring these into real availability (Support) or exception
policy (Exception) — that needs per-step/per-process policy authoring decisions, likely a BA
call, not assumed here.

---

## Task

**Integration screen (`/tich-hop`) upgrade — Đợt 1 (Slice A–C) — DONE 2026-07-08.**
Plan of record: `docs/research/integration-screen-upgrade-notes.md`. Frontend-mock evolution
of the already-built `IntegrationStatus.tsx` module (same carve-out category as D10/D11/
EPIC06 — not new EPIC/backend work, does not touch the F1 blocker). Đợt 1 scope was
deliberately capped to the lowest-risk slices; user chose "A-C only" over also starting the
Mapping Studio (D-F) this round.

**What shipped:**
- **Slice A — tab split**: `IntegrationStatus.tsx` now wraps content in `Tabs` — "Tổng quan"
  (fully wired, existing KPI + card grid) plus 4 disabled placeholder tabs ("Mapping dữ liệu
  (sắp có)", "Job & lỗi (sắp có)", "Cấu hình kết nối (sắp có)", "Kiểm thử (sắp có)") previewing
  the doc's 5-tab roadmap without building dead screens — same "disabled + sắp có" pattern
  `AssignmentBuilder.tsx` used for ORG_POSITION/COUNCIL/EXPRESSION.
- **Slice B — richer cards**: `SystemCard` metric row now shows Độ trễ TB (`s.doTreMs`,
  existing field), Tỷ lệ thành công 24h (new `integrationSuccessRate()` helper, derived from
  existing `banGhi24h`/`loi24h` — no new seed fields), Hàng đợi (existing), Lỗi mở (new
  `openIncidentCount()` helper, derived from existing `seedJobRuns`).
- **Slice C — drawer chi tiết**: new `SystemDetailDrawer` (opened via new "Xem chi tiết" button
  on every card) shows connection info, 24h metrics, lỗi gần nhất (new `lastErrorAt()` helper),
  and the last 5 job runs for that system via new `jobRunsForSystem()` helper — **reuses
  `seedJobRuns`/`seedEvents` already surfaced on `/nhat-ky` (`ProcessEventLog.tsx`) instead of
  duplicating a job-log table**, consistent with the "một nguồn sự thật" pattern from the
  BPMN↔routing work. Drawer explicitly notes mapping/version/quy-trình-linkage are not yet
  built (Slice D+), so it doesn't imply capability that doesn't exist.
- **New pure helpers in `data/camundaOps.ts`** (no new seed data, no schema change):
  `integrationSuccessRate(s)`, `jobRunsForSystem(he)`, `openIncidentCount(he)`, `lastErrorAt(he)`.

**Deferred to Đợt 3** (see below — now done in Đợt 2 except version/rollback + audit/permissions):
version/rollback (Slice H — should reuse the `RuleContext` save-bump-version pattern), audit log +
granular permissions (Slice I — should hang off the existing `RbacContext`/`actionAvailabilityPolicy`,
not a bespoke permission table), retry-policy config (doc's "Cấu hình kết nối" tab, still disabled
placeholder), the "Kiểm thử" tab (test-connection, separate from mapping preview).

**Verification**: `npm run build` GREEN (tsc + vite, ~32s), full output clean. No in-browser
click-through — Playwright not installed this session (consistent with prior sessions); a
throwaway dev server was started, curl-verified serving HTTP 200, then stopped after the check.

---

## Integration screen (`/tich-hop`) upgrade — Đợt 2 (Slice D–G) — DONE 2026-07-08

Continuation of Đợt 1 above, same session. Scope = the doc's own roadmap steps 3–4 ("Mapping
dữ liệu" tab with real field/value mapping + preview JSON + validate trạng thái). Slices H
(version/rollback) and I (audit + granular permissions) intentionally left for Đợt 3.

**What shipped:**
- **Slice D — mapping data model**: new `webapp/src/data/integrationMapping.ts`. `MappingConfig`
  (he/doiTuong/chieu/trạng thái Draft-Ready-Active-Deprecated-Error/version/fields) +
  `FieldMapping` (truongQTKHCN/kieuDuLieu/truongHeNgoai/batBuoc/khoaDinhDanh/transform/
  giaTriMacDinh/valueMappings) + `ValueMapping`. **Transform list is a closed enum**
  (`format-date`/`to-string`/`concat`/`split`/`enum-map`/`default-value`) — no free-text script,
  per the doc's "Transform có kiểm soát" section. 3 seed configs grounded in real mock data (not
  fabricated): SAP·Dự toán (enum-map on `giaiDoan`), QLNS·Nhân sự (default-value on missing
  email), MS·Hồ sơ (the doc's own `trangThai`→`status` value-mapping example, deliberately left
  with an empty `truongHeNgoai` on one field to demonstrate the Slice G validate gate).
  `validateMappingConfig()` implements the doc's 5 pre-Active checks (empty fields / missing
  external field / duplicate external field / enum without value mapping / no identifier key).
  `previewMapping()` applies field+value mapping to a source record → payload + missing/invalid
  list. `sampleRecordsFor(doiTuong)` pulls real records from `data/nhiemVu.ts`/`dossiers.ts` —
  returns `[]` for `TaiSan` (QLTS has no seed data in this mock) rather than inventing one.
- **New store** `store/IntegrationMappingContext.tsx` (mounted in `main.tsx`, same
  `RuleContext`-style pattern): `create`/`saveFields`/`setStatus`/`remove`. **`setStatus(..,
  'active', ..)` re-runs `validateMappingConfig` inside the context itself** (not just the UI) —
  fail-closed defense in depth; on failure it flips the config to `error` status and returns the
  error list instead of silently no-op'ing.
- **Slice E — Mapping Studio UI**: `webapp/src/components/MappingFieldEditor.tsx` (row-based
  field editor + nested value-mapping mini-editor, shown only when `kieuDuLieu==='enum'` or
  `transform==='enum-map'`) + `webapp/src/components/MappingStudio.tsx` (list/filter/create/edit-
  drawer/delete, wired into the previously-disabled "Mapping dữ liệu" tab in
  `IntegrationStatus.tsx`). `SystemDetailDrawer` (Đợt 1, Slice C) updated to list real active
  mappings for that system instead of the old "chưa triển khai" placeholder note.
- **Slice F — preview payload**: `PreviewModal` in `MappingStudio.tsx` — pick a sample record,
  show JSON gốc / JSON sau mapping (`<pre>` block styled like `ActionStudio.tsx`'s existing JSON
  viewer) / missing-or-invalid field list.
- **Slice G — validate-before-active fail-closed gate**: the "Kích hoạt" button calls
  `setStatus(id,'active',actor)`; on failure shows `Modal.error` with the full validation error
  list and does **not** flip to Active (fail-closed, consistent with D9's fail-closed RBAC
  principle). The seed MS·Hồ sơ config is deliberately invalid so this is exercisable immediately
  without needing to hand-craft a broken config first.

**Verification**: `npm run build` GREEN (tsc + vite, confirmed on a clean re-run with explicit
exit-code + error-grep check). Dev-server module transform smoke-test (no Playwright available
this session): fetched `IntegrationStatus.tsx` and `MappingStudio.tsx` through Vite's dev
transform pipeline, confirmed no parse/transform errors, then stopped the throwaway server.

---

### Earlier 2026-07-08 — EPIC06 Approval Matrix refactor — Đợt 1 + Đợt 2 — DONE (Slices A–I, all sliced work).
Plan of record: `docs/research/approval-matrix-refactor-plan.md` (+ review notes
`docs/research/approval-matrix-conversation-2026-07-08.md`). Frontend-mock refactor of the
already-built EPIC06 module (`/ma-tran-phe-duyet`), same category as D10/D11 — evolves existing
mock, does **not** start backend/persistence and does **not** touch the F1 blocker.

**Đợt 2 shipped 2026-07-08 (Slices E, F, G, H, I + shared store):**
- **Shared store** `store/ApprovalMatrixContext.tsx` (new, mounted in `main.tsx`) — single source
  for rules+delegations; `/ma-tran-phe-duyet` now edits through it so changes reach runtime.
- **Slice E — assignment model** (`data/approvalMatrix.ts`): `ApprovalAssignment { mode, targets }`
  replaces `approverRoleCodes`; targets `GROUP|USER|ORG_POSITION|COUNCIL|EXPRESSION`, modes
  `ANY_ONE|ALL|SEQUENTIAL`. `resolveAssignment` resolves GROUP/USER for real (+ delegation);
  ORG_POSITION/COUNCIL/EXPRESSION are placeholders (locked user + warning). New
  `components/AssignmentBuilder.tsx` (GROUP/USER editable; other 3 = disabled "sắp có" options).
  Seed AM-01…AM-07 migrated (HĐ rules got mode `ALL`). **Parity gate still passes — 216 contexts,
  matched-rule + approver-set identical, 0 mismatch.**
- **Slice H — audit payload**: `ResolveResult.audit: ApprovalResolveAudit` (input snapshot,
  matched rule id+version, mode, targets-before-org, final user ids, delegations applied, skipped
  rules) + `warnings` + `mode`. Simulation panel shows mode + warnings.
- **Slice F — analyzer** `data/approvalMatrixAnalyzer.ts` (new): detects empty-assignment (error),
  duplicate-priority, broad-before-specific shadow, disabled-fallback (warning), no-fallback
  coverage (info). Surfaced as a banner above the table + per-row ⚠ tooltip. **Harness-verified.**
- **Slice G — runtime wiring**: `data/approvalSlotMap.ts` (new) maps step candidateGroups → slot
  (⚠ DEMO ASSUMPTION per plan §8 — real slot should come from BPMN metadata) + `buildApprovalContext`.
  `DossierDetail` now resolves the current approval step via `resolveApprovers(store rules, ctx)`
  when a slot is derivable (else falls back to `resolveGroups`), and shows "Khớp luật: …" —
  so editing a rule on the Matrix page changes the predicted approver in the dossier.
- **Slice I — DTOs** `data/approvalMatrixDto.ts` (new): request/response shapes for the 5 future
  endpoints (rules CRUD, resolve, analyze), shaped ≈ mock for a minimal-change API swap.

**Verification**: full `npm run build` GREEN (tsc + vite, 12.2s). Three esbuild+node harnesses
green — engine 35/35, parity 216-ctx/0-mismatch (now incl. approver-set), analyzer all-detections.
No in-browser click-through (Playwright not installed).

**Mojibake encoding repair — DONE 2026-07-08 (follow-up, user-reported "many screens broken").**
Pre-existing corruption (double-encoded UTF-8, **CP1252**-based) from a prior session's editor,
NOT caused by this task (first Read this session showed it before any edit; `ApprovalMatrix.tsx`
stayed clean through heavy edits). Scanned all 119 `src/**/*.{ts,tsx,css}` — exactly **5 files**
were double-encoded: `data/actionAvailability.ts`, `data/actionAvailabilityPolicy.ts`,
`data/bpmnReconcile.ts`, `data/exceptionPolicy.ts`, `pages/DossierDetail.tsx` (the 4 data files
feed action/exception labels across many screens → "nhiều màn hình"). Fixed with a Node
CP1252-aware un-double-encoder (per-run `cp1252 bytes → utf-8`, incl. the 0x80–0x9F special chars
`— " " …` and undefined-byte passthrough for `ề`=E1 BB 81). **Safety guards**: only rewrite a file
if it net-reduces high-byte count, and reject any run whose decode yields a combining mark /
control char (avoids false positives — verified it correctly SKIPS `RuleGridBuilder.tsx` where
proper `THÌ…` would otherwise mangle). Also fixed 2 latent `TS2367` compile bugs in DossierDetail
(`d.cap`/`d.loai` comparisons that were always-false at runtime). **Verified**: full build green,
`0/119` files still double-encoded, spot-checked readable Vietnamese in all 5 (incl. `↔ — §` and
DossierDetail's mixed proper/mojibake regions). Backups kept in scratchpad. Note: Python is not
available in this env (Store stub, exit 49) — use Node for scripting.

**Also fixed to unblock the build (enabling cleanup, flagged)**: removed unused `StatCard` import +
`stats` useMemo in `RolePermission.tsx` (pre-existing D11 WIP leftovers that failed `tsc`).

---

### Đợt 1 (earlier 2026-07-08) — DONE (Slices A–D + audit-min)

**What shipped this đợt:**
- **Slice A — condition engine** `webapp/src/data/approvalConditions.ts` (new): `ConditionNode`/
  `ConditionGroup`/`ConditionLeaf` + `evaluateConditionTree` + 11 operators
  (`eq/neq/gt/gte/lt/lte/between/in/contains/exists/notExists`) + `describeConditionTree`
  (Vietnamese preview) + builder helpers (`group`/`leaf`/`anyCondition`). Fail-closed on missing
  values; empty group = wildcard. **Verified via esbuild+node harness — 35/35 asserts**
  (numeric/enum/bool/missing/AND-OR nesting/describe).
- **Slice B — variable registry** `webapp/src/data/approvalVariableRegistry.ts` (new): 11 seed
  vars (plan §3.3), enum options aligned to `variableContract.ts` for the overlapping ones
  (capNhiemVu↔cap, loaiHoiDong); 3 core vars `simulated:true`, rest authorable-only for now.
  Provides `describeHelpers` (field/value labels) + operator-by-type sets driving the builder.
- **Slice C — schema migration + PARITY GATE (passed).** `ApprovalRule` moved from fixed
  `cap/loaiHoiDong/budgetMin/budgetMax` to `conditions: ConditionGroup`; seed AM-01…AM-07
  migrated (`cap`→`capNhiemVu eq`, `budgetMin`→`tongDuToan gte`, `loaiHoiDong`→`eq`); `slot`
  still matched separately; `ruleMatches`/`resolveApprovers` use the engine via `toEvalContext`.
  **Parity harness: 216 contexts (slot×cap×loaiHoiDong×budget incl. Simulation default
  PHE_DUYET/TD/12 tỷ + budget boundaries), matched-rule identical old-vs-new, 0 mismatch.**
- **Slice D — Condition Builder UI** `webapp/src/components/ConditionBuilder.tsx` (new):
  recursive AND/OR group editor, field/operator/value controls rendered by registry type
  (enum→Select, number→InputNumber w/ VND format + between range, boolean→Có/Không, string→Input,
  `in`→multi-select), add/remove condition + nested group, live Vietnamese preview. Wired into
  the ApprovalMatrix rule modal (replaced the 4 fixed fields); table "Điều kiện" column now shows
  the readable summary; column relabeled "Nhóm phê duyệt" (plan §7 copy).
- **Audit-minimum** (`ResolveResult.evaluatedRules` + Simulation panel): shows all same-slot
  rules evaluated with why (chosen / matched-but-lower-priority / disabled / điều kiện không khớp).
- **Assignment stayed GROUP-only** (Slice E deferred as planned).

**Verification**: the 5 refactor files are **type-clean** (`tsc` reports 0 errors in them) +
engine/parity harnesses green. **Caveat — full `npm run build` is currently RED due to
PRE-EXISTING uncommitted WIP unrelated to this task**: `TroGiup.tsx` (untracked, missing antd
icon imports `AppstoreOutlined`/`SafetyCertificateOutlined`/`SyncOutlined`) and
`RolePermission.tsx` (modified, unused `StatCard`/`stats`). Both were dirty at session start
(git: `?? TroGiup.tsx`, `M RolePermission.tsx`) and are owned by other workstreams — left
untouched. No in-browser click-through (Playwright not installed); harnesses cover runtime logic.

**Đợt 2 is now DONE (see the Đợt 2 block above).** Open questions still to confirm with an
architect (chosen sensibly in the mock, flagged as assumptions — revisit when backend starts):
- Source of `slot` — currently derived from step candidateGroups in `data/approvalSlotMap.ts`
  (DEMO ASSUMPTION per plan §8). Real slot should come from BPMN extension prop / task metadata.
- Official Approval Matrix input variable contract — Registry seeded from plan §3.3; not yet
  ratified. `loaiHoiDong` at runtime is currently derived from `cap` (demo) pending real DMN.
- Approval mode semantics for councils (any-one / quorum / all / chair-only) — `ALL` used for
  the seed HĐ rules as a placeholder.

**Recently completed (context — full detail in `DELIVERY_STATE.md`):**
- **D11 (RBAC scope-overlay refactor) — DONE 2026-07-08.** `dataScope` split out of
  `RolePermissionPolicy` into per-user `UserRoleAssignment`; new `store/RbacContext.tsx`;
  `/phan-quyen` reworked to 3 tabs; `/nguoi-dung` per-user "Phân quyền" drawer. Build green.
- **D10 (eForm binds to Action layer) — DONE end-to-end 2026-07-08** (UI cut-over to 3 outcome
  buttons + point 5 BPMN reconcile tool). `npm run build` fully green.
- **Foundation 1 unblock** — still the real blocker for leaving frontend-mock; owner is the
  Solution Architect/client, not resolvable by this agent. All mock work above (and this
  Approval Matrix refactor) deliberately avoids F1's blocker.

## Current phase

Foundations phase — F0 done, F1 blocked, F2/F3/F5 partial, F4 not started. No NEW EPIC/backend
work starts until F1–F5 are `COMPLETE` per `workflows/foundations.md`. This task is a
frontend-mock refactor of an already-built module (same allowance under which D10/D11/EPIC06
shipped), not new EPIC/backend work.

## Files to read

- `docs/research/integration-screen-upgrade-notes.md` — plan of record for the current task
  (Đợt 1 = Slice A-C DONE, Đợt 2 = Slice D-G DONE; Slice H-I = Đợt 3, not started)
- `webapp/src/pages/IntegrationStatus.tsx` — the module being upgraded (`/tich-hop`)
- `webapp/src/data/integrationMapping.ts` — mapping model, `validateMappingConfig`,
  `previewMapping`, `sampleRecordsFor` (Slice D)
- `webapp/src/store/IntegrationMappingContext.tsx` — mapping CRUD + fail-closed `setStatus`
  (mounted in `main.tsx`)
- `webapp/src/components/MappingFieldEditor.tsx` + `webapp/src/components/MappingStudio.tsx` —
  Mapping Studio UI (Slice E-G), wired into `IntegrationStatus.tsx`'s "Mapping dữ liệu" tab
- `webapp/src/data/camundaOps.ts` — seed data + helpers (`integrationSuccessRate`,
  `jobRunsForSystem`, `openIncidentCount`, `lastErrorAt`); also owns `seedJobRuns`/`seedEvents`
  already consumed by `webapp/src/pages/ProcessEventLog.tsx` (`/nhat-ky`) — reuse, don't duplicate
- Reuse precedent for the remaining slices: `webapp/src/store/RuleContext.tsx` (`saveXml`
  bump-version pattern → mapping version/rollback, Slice H), `webapp/src/store/RbacContext.tsx` +
  `data/actionAvailabilityPolicy.ts` (→ Slice I permissions, don't build a bespoke permission table)
- Older context (EPIC06/D10/D11, superseded as the active task but still relevant background):
  `docs/research/approval-matrix-refactor-plan.md`, `.harness/state/decisions.md` (D3/D9/D10/D11)

## Next concrete action

**Đợt 1 (Slice A-C) and Đợt 2 (Slice D-G) are DONE.** Candidate next steps (pick per instruction):
1. **Slice H — version/rollback**: extend `IntegrationMappingContext` with a version history
   list per `MappingConfig` (mirror `RuleContext.saveXml`'s bump-version, but keep prior versions
   instead of discarding) + a "Xem lịch sử / Khôi phục" action in `MappingStudio.tsx`.
2. **Slice I — audit log + granular permissions**: gate Mapping Studio actions (sửa/kích hoạt/
   xoá) through `RbacContext`/`actionAvailabilityPolicy` instead of leaving them open to any
   logged-in user; add an audit trail (who changed/activated/deactivated which mapping) — mirror
   the audit-minimum pattern already used in `ApprovalMatrixContext`'s `ResolveResult.audit`.
3. **In-browser click-through** of `/tich-hop` (Playwright not installed this session): confirm
   the Mapping Studio create/edit/preview/activate flow end-to-end, including the deliberately-
   invalid seed config (`map-ms-hoso-draft`) correctly blocking Activate with the validation
   errors shown.
4. Resume the parked EPIC06 next-steps (still valid, not started this session): lock the
   Approval Matrix model shape as D12 in `decisions.md`; backend readiness for
   `data/approvalMatrixDto.ts` when F1 unblocks.

**If asked to unblock the project instead:** Foundation 1 is the real blocker — get the
architect/client to decide backend language/framework, domain DB engine, and Camunda 8
deployment model, then lock them (D12/D13/D14 earmarked) in `decisions.md` and scaffold the
backend per `.harness/workflows/foundations.md`.

# Nâng cấp "Ma trận quyết định" — Tab Soạn bảng luật: hỗ trợ DRD nhiều bảng nối chuỗi

## Context

Màn `/quan-ly-luat` (nav "Ma trận quyết định", `business-rule-list`/`business-rule-detail`) đã có
backend Spring Boot + Camunda thật (không phải mock) — khác với bản React ở `webapp/` vốn chỉ là
mockup tham khảo (EPIC09 design). Nhưng tab "Soạn bảng luật" hiện tại **chỉ hỗ trợ đúng 1 bảng
quyết định/luật**, trong khi bản React tham khảo hỗ trợ **DRD — nhiều bảng nối chuỗi** (bảng này
dùng kết quả bảng kia làm điều kiện đầu vào), chọn Hit Policy (FIRST/UNIQUE/COLLECT), và cấu hình
cột (thêm/xoá/đổi tên/đổi kiểu/gán nguồn). Backend hiện tại còn **chặn cứng** deploy DMN có hơn 1
decision (`DmnCamundaGateway.deploy()` ném lỗi nếu `event.getDecisions().size() != 1`).

User đã xác nhận qua AskUserQuestion: làm **full parity** với bản React (DRD nhiều bảng), chấp
nhận sửa cả backend `DmnCamundaGateway` để xác định đúng "decision gốc" khi deploy/evaluate nhiều
decision, và ưu tiên việc này ngay (tạm gác task DMN T24 đang RUNTIME PENDING).

Đã khảo sát kỹ (2 Explore agent + 1 Plan agent) toàn bộ stack thật: `DmnRuleController/Service`,
`DmnCamundaGateway`, `DmnArtifactValidator` (đã decision-count-agnostic, không cần sửa), entity/DTO/
migration (`V6`/`V7`, cột Camunda decision là số ít + CHECK constraint), test hiện có
(`DmnRuleServiceTest`, `DmnRuleHttpContractTest`, `DmnArtifactValidatorTest`), và frontend
(`business-rule.service.ts`, `dmn-xml.ts`, `business-rule-detail.ts/html`). Đã đối chiếu thuật toán
tham khảo trong `webapp/src/dmn/ruleGrid.ts` (`gridToDmn`/`dmnToGrid`) và fixture 3-bảng
`webapp/src/dmn/rd02Routing.dmn.ts` để lấy đúng cú pháp `informationRequirement`/`requiredDecision`/
`requiredInput`. **Không port** `evaluateDmn.ts` (FEEL evaluator client-side bằng `feelin`) sang
Angular — vì Angular đã evaluate thật qua Camunda (`DmnRuleService.evaluate()`), chỉ cần port phần
cấu trúc model + XML serializer.

## Quyết định thiết kế đã chốt

- **Xác định "decision gốc" (terminal)**: `io.camunda.client.api.response.Decision` (xác nhận bằng
  `javap` trên jar) không có thông tin phụ thuộc chéo. Nên gateway phải tự parse lại đúng `dmnXml`
  vừa deploy để tìm cạnh `<informationRequirement><requiredDecision href="#X">`; **terminal = tất cả
  id decision − mọi id bị `requiredDecision` trỏ tới**.
- **Schema DB**: thêm bảng con `dmn_rule_version_decision` (Flyway V25) — mỗi dòng 1 decision đã
  deploy của 1 version, có cờ `is_root`. **Giữ nguyên** 4 cột số ít hiện có trên `dmn_rule_version`
  (`camunda_decision_key/id/version` + `deploy_status`) và CHECK constraint V7 — set từ decision
  terminal đầu tiên theo thứ tự tài liệu ("primary root"), dùng cho tương thích ngược. Không cần
  migration thứ 2 sửa CHECK constraint.
- **Evaluate**: gọi `EvaluateDecision` một lần cho MỖI terminal decisionKey (có thể >1 nếu có bảng
  độc lập không nối chuỗi), gộp + khử trùng theo `decisionKey` từ `getEvaluatedDecisions()` của mỗi
  lần gọi → trả về danh sách kết quả theo từng decision (đúng như panel "Chạy thử" bên React hiển
  thị 1 card/quyết định).
- **Angular**: không port FEEL evaluator; chỉ port model + `gridToDmn`/`dmnToGrid` (đổi tên
  `decisionGridToDmnXml`/`dmnXmlToDecisionGrid`), bỏ hẳn giới hạn hit policy = FIRST.

## Backend

1. **`backend/src/main/java/vn/vht/qtkhcn/service/DmnDrdAnalyzer.java`** (mới) — parse `dmnXml` bằng
   factory an toàn dùng lại từ `DmnArtifactValidator` (đổi `secureFactory()` từ `private` sang
   package-private), trả `Set<String> terminalDecisionIds(String dmnXml)` = tất cả `id` của
   `<decision>` trừ đi mọi target của `<requiredDecision href="#...">`. Ném lỗi nếu rỗng (phòng file
   có chu trình lọt qua validator). Test mới `DmnDrdAnalyzerTest` (đơn — 1 chuỗi 3 bảng theo đúng
   hình `rd0202Routing.dmn.ts` (`capNhiemVu→canHoiDong→loaiHoiDong`, chỉ `loaiHoiDong` terminal) — 2
   bảng độc lập không nối, cả hai đều terminal).

2. **`camunda/DmnCamundaGateway.java`** — thêm dependency `DmnDrdAnalyzer`. Đổi các record:
   `DeployedDecision(decisionKey, decisionId, decisionName, decisionVersion, root)`,
   `DeploymentResult(deploymentKey, List<DeployedDecision>)`,
   `EvaluatedDecisionResult(evaluationKey, decisionId, decisionName, decisionVersion, outputs,
matchedRules)`, `EvaluationResult(List<EvaluatedDecisionResult>)`. `deploy()`: bỏ guard
   `size()!=1`, chỉ yêu cầu không rỗng; gọi `analyzer.terminalDecisionIds(dmnXml)` để gắn cờ `root`
   cho từng decision trả về. `evaluate(List<Long> decisionKeys, variables)` (đổi chữ ký từ `long`
   sang `List<Long>`): gọi `EvaluateDecision` cho từng key, lấy **toàn bộ**
   `getEvaluatedDecisions()` (không lọc còn 1 cái như hiện tại), gộp vào
   `LinkedHashMap<Long, EvaluatedDecisionResult>` (first-seen wins) để khử trùng khi các chuỗi có
   tổ tiên chung. Test mới `DmnCamundaGatewayTest` (chưa tồn tại) — mock `CamundaClient`/fluent
   command builders, cover: chuỗi 3 bảng → đúng 1 root; 2 bảng độc lập → cả 2 root; evaluate 2
   terminal key có tổ tiên chung → khử trùng đúng.

3. **Migration `backend/src/main/resources/db/migration/V25__dmn_rule_version_decisions.sql`** (mới)
   — bảng `dmn_rule_version_decision(id, rule_version_id FK→dmn_rule_version ON DELETE CASCADE,
decision_id, decision_name, camunda_decision_key, camunda_decision_version, is_root,
display_order, UNIQUE(rule_version_id, decision_id))` + index theo `rule_version_id`.

4. **`domain/DmnRuleVersionDecision.java`** (mới, style giống `DmnRuleVersion`) +
   **`repository/DmnRuleVersionDecisionRepository.java`** (mới) —
   `findByRuleVersionIdOrderByDisplayOrder`, `findByRuleVersionIdInOrderByDisplayOrder` (batch cho
   list versions), `deleteByRuleVersionId`.

5. **`service/DmnRuleService.java`** — thêm dependency `DmnRuleVersionDecisionRepository`.
   `activate()`: sau deploy thành công, `deleteByRuleVersionId` (idempotent khi redeploy sau
   FAILED) rồi lưu 1 row/`DeployedDecision`; chọn "primary" =
   `decisions.stream().filter(root).findFirst().orElse(get(0))`, set 4 cột số ít như cũ từ
   primary. `listVersionSummaries`/`getVersion`: batch/đơn lẻ load decisions con, truyền vào
   `DmnRuleVersionSummaryResponse.from`/`DmnRuleVersionResponse.from` (đổi chữ ký thêm tham số
   list). `evaluate()`: lấy toàn bộ decision con của active version, lọc `root=true` thành
   `terminalKeys` (**fallback**: nếu rỗng — version cũ deploy trước migration này — dùng
   `List.of(artifact.getCamundaDecisionKey())` để không vỡ dữ liệu cũ), gọi
   `camunda.evaluate(terminalKeys, variables)`.

6. **DTO**: `DmnRuleVersionDecisionResponse` (mới, record). `DmnRuleVersionResponse`/
   `DmnRuleVersionSummaryResponse`: thêm field `List<DmnRuleVersionDecisionResponse> decisions`,
   đổi `from(...)` nhận thêm list. `EvaluateDmnDecisionResponse`: đổi hẳn từ 1 kết quả phẳng sang
   `record EvaluateDmnDecisionResponse(List<DecisionResultResponse> decisions)` với
   `DecisionResultResponse(evaluationKey, decisionId, decisionName, decisionVersion, outputs,
matchedRules)` — **đổi shape JSON response**, có chủ đích (breaking change nội bộ, chưa ai khác
   dùng ngoài Angular đang sửa cùng lúc).

7. **Test cần sửa theo shape mới**: `DmnRuleServiceTest` (constructor thêm mock repo mới; 2 test
   deploy/evaluate đổi sang record dạng list; thêm test riêng cho nhánh fallback rỗng),
   `DmnRuleHttpContractTest` (3 chỗ dựng `DmnRuleVersionResponse`/`Summary` tay cần thêm
   `List.of()`; test evaluate đổi toàn bộ jsonPath sang `$.decisions[0]....`).
   `DmnArtifactValidatorTest` — không cần sửa (đã decision-count-agnostic).

## Frontend (Angular)

1. **`core/models/business-rule.ts`** — thêm `DmnHitPolicy = 'FIRST'|'UNIQUE'|'COLLECT'`; thêm
   `DecisionColumn.typeRef?: string` (giữ đúng typeRef DMN gốc qua round-trip). Thêm
   `DecisionGridDecision{id,name,hitPolicy:DmnHitPolicy,requires:string[],inputs,outputs,rows}` và
   `DecisionGrid = DecisionGridDecision[]`; `BusinessRule.definition`/`BusinessRuleVersion.definition`
   đổi kiểu sang `DecisionGrid`. Thêm `DmnRuleVersionDecisionResponse`, thêm field `decisions` vào
   `DmnRuleVersionSummaryResponse`/`DmnRuleVersionResponse`. Đổi `DmnDecisionEvaluationResponse`
   thành `{ decisions: DmnDecisionResultResponse[] }` (mỗi phần tử có `decisionId/decisionName/...`
   như DTO backend).

2. **`core/dmn/dmn-xml.ts`** (viết lại) — `dmnXmlToDecisionTable` → `dmnXmlToDecisionGrid(xml):
DecisionGrid` (port `dmnToGrid`: đọc `hitPolicy` trực tiếp, **bỏ throw khi khác FIRST**; đọc
   `requires` từ `<informationRequirement><requiredDecision href="#X">`; giữ nguyên logic parse
   input/output/rule hiện có, chỉ lặp theo từng `<decision>`, giữ đúng thứ tự tài liệu).
   `decisionTableToDmnXml` → `decisionGridToDmnXml(grid, meta): string` (port `gridToDmn`: map
   `producedBy` từ output mọi decision; input không có trong `producedBy` → root input, emit
   `<inputData>` gộp trùng; mỗi decision tự suy `informationRequirement` theo khớp tên biến (chính),
   `requires[]` chỉ bổ sung; emit `hitPolicy` verbatim). Test mới `dmn-xml.spec.ts` — fixture 3 bảng
   phỏng theo `rd02Routing.dmn.ts`, assert round-trip + assert `requiredDecision` được suy ra từ tên
   biến (không phải từ `requires[]`) + assert `UNIQUE` đi qua nguyên vẹn.

3. **`core/services/business-rule.service.ts`** — `getVersionArtifact()` dùng
   `dmnXmlToDecisionGrid`; `saveVersion(id, grid: DecisionGrid, ...)` dùng `decisionGridToDmnXml`.
   Cập nhật `business-rule.service.spec.ts` theo fixture nhiều bảng + response evaluate dạng
   `{decisions:[...]}`.

4. **`pages/business-rule-detail/business-rule-detail.ts` + `.html`** — viết lại theo mẫu
   `webapp/src/components/RuleGridBuilder.tsx`/`DecisionCard`, tái dùng nguyên các module ng-zorro
   đã import (không thêm thư viện UI mới):
   - `draft` đổi từ 1 bảng sang `DecisionGrid` (mảng). Thêm `addDecision`/`removeDecision` (confirm
     vì bảng khác có thể đang tham chiếu), `updateHitPolicy` (dropdown FIRST/UNIQUE/COLLECT, nhãn
     Việt giống bản React).
   - Cấu hình cột: `fieldsForDecision(grid, di)` (liệt kê output các bảng khác + input gốc dùng
     chung làm nguồn khả dụng) + `addInputColumn`/`addOutputColumn`/`removeInputColumn`/
     `removeOutputColumn`/`patchInputColumn`/`patchOutputColumn`/`bindInputSource` — port trực tiếp
     logic React (đổi kiểu cột → reset điều kiện dòng liên quan để tránh lệch kiểu).
   - Thao tác dòng cũ (`addRow`/`duplicateRow`/`removeRow`/`updateCondition`/`changeOperator`/
     `updateOutput`) thêm tham số `decisionIndex` ở đầu.
   - Template: thay `<nz-table>` đơn bằng `@for (decision of draft(); track decision.id)` mỗi bảng 1
     `<nz-card>` (tên sửa được, chọn hit policy, nút xoá bảng, toggle "Cấu hình cột"), rồi tới nút
     "Thêm bảng quyết định".
   - Tab "Chạy thử DMN": input test suy từ `rootInputColumns(grid)` (union input không do bảng nào
     sinh ra, khử trùng theo biến — port `rootInputColumns()` bên React). Kết quả đổi từ 1 khối sang
     `@for (decisionResult of testResult()?.decisions; track decisionResult.decisionId)` — 1 card/
     quyết định. Tô sáng dòng khớp trong tab "Soạn bảng luật" phải tra đúng theo
     `decisionId === decision.id` trước khi so `ruleId` (không còn là 1 kết quả phẳng).
   - Tab "Lịch sử phiên bản": thêm dòng phụ hiển thị số decision đã deploy từ field `decisions`
     mới, cạnh badge "primary" hiện có.

## Việc KHÔNG làm (ngoài phạm vi)

- Không đụng `BusinessRuleKind`/nhánh `SERVICE` (100% scaffold frontend, backend không có khái niệm
  này) — giữ nguyên.
- Không port FEEL evaluator (`evaluateDmn.ts`/thư viện `feelin`) sang Angular — evaluate luôn qua
  Camunda thật.
- Không thêm UI "primary root" riêng (badge chọn tay) — chỉ hiển thị đầy đủ danh sách decision như
  bản React, đúng phạm vi tham khảo.

## Verification

- Backend: `mvn -o test` — chú ý riêng `DmnRuleServiceTest`, `DmnRuleHttpContractTest`,
  `DmnArtifactValidatorTest` (không đổi), `DmnDrdAnalyzerTest` (mới), `DmnCamundaGatewayTest` (mới).
  Full suite phải xanh, không phá test khác đang đứng.
- Frontend: `npx tsc --noEmit` sạch; `ng test` — `business-rule.service.spec.ts` (cập nhật),
  `dmn-xml.spec.ts` (mới) xanh.
- Runtime thật (sau khi build xanh): tạo 1 luật DMN mới trên `/quan-ly-luat`, dựng thử fixture 3
  bảng nối chuỗi giống `rd0202Routing.dmn.ts` bằng chính UI mới (không phải nhập XML tay), Lưu →
  Kích hoạt (activate) → xác nhận cả 3 decision deploy lên Zeebe thật (backend dev đang chạy), Chạy
  thử → xác nhận panel hiển thị đủ 3 card kết quả đúng thứ tự, đổi input gốc → xác nhận cả chuỗi
  cập nhật đúng qua Camunda thật (không phải giả lập).

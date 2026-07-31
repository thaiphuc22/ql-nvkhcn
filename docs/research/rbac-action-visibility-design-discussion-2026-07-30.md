# Thảo luận thiết kế Phân quyền và Luật hiển thị Action

**Ngày:** 30/07/2026  
**Trạng thái:** Đề xuất thiết kế sau thảo luận, chưa mặc nhiên đồng nghĩa với đã triển khai đầy đủ  
**Phạm vi:** Ứng dụng, chức năng, vai trò, quyền chức năng, Action Registry và Luật hiển thị nút trên Chi tiết hồ sơ

## 1. Bối cảnh

Hệ thống hiện có ba ứng dụng nghiệp vụ:

| Mã | Tên ứng dụng |
|---|---|
| `qlnvkhcn` | Quản lý NV KHCN & Hồ sơ |
| `quytrinh` | Quản trị quy trình |
| `he-thong` | Quản trị hệ thống |

Mỗi chức năng thuộc đúng một ứng dụng. Vai trò cũng được lựa chọn theo mô hình **N vai trò - 1 ứng dụng**, tức một vai trò chỉ thuộc một ứng dụng, nhưng một người dùng có thể được gán nhiều vai trò ở các ứng dụng khác nhau.

Luồng lựa chọn trên UI phân quyền được xác định theo thứ tự:

```text
Ứng dụng → Chức năng → Ma trận Vai trò × Quyền chức năng
```

Ứng dụng có giá trị mặc định. Khi đổi ứng dụng, danh sách chức năng và vai trò phải được lọc theo ứng dụng tương ứng.

## 2. Kết luận về Quyền và Danh mục Action

Quyền và Action có liên quan nhưng không phải là một khái niệm.

- **Quyền chức năng** kiểm soát việc truy cập và các thao tác cơ bản trong một chức năng.
- **Action** biểu diễn một hành động nghiệp vụ cụ thể, có thể làm thay đổi workflow hoặc thực hiện một thao tác hỗ trợ.
- **Luật hiển thị Action** xác định Action nào khả dụng trong một ngữ cảnh cụ thể.

Hai danh mục không gộp thành một. Tuy nhiên, không tiếp tục cho người dùng tạo mã quyền tùy ý vì một mã quyền không có code/API kiểm tra đi kèm sẽ không tạo ra khả năng thực tế nào cho hệ thống.

## 3. Quyền chức năng do hệ thống quản lý

Quyền được seed sẵn theo từng chức năng. UI bỏ menu **Danh sách quyền/Tạo quyền** và chỉ hiển thị các quyền đã được hệ thống khai báo cho chức năng đang chọn.

Ví dụ:

| Chức năng | Quyền được seed |
|---|---|
| Quản lý Nhiệm vụ KHCN | Xem danh sách, Tạo mới, Chỉnh sửa, Xóa, Xuất dữ liệu |
| Hồ sơ KHCN | Xem, Tạo mới, Chỉnh sửa, Xóa |
| Cơ cấu tổ chức | Xem, Tạo mới, Chỉnh sửa, Xóa, Quản lý tổ chức |
| Người dùng | Xem, Quản lý người dùng, Gán vai trò |
| Báo cáo | Xem báo cáo, Xuất dữ liệu |
| Nhật ký | Xem audit, Xuất dữ liệu |

Quan hệ dữ liệu đề xuất:

```text
Feature N—N Permission
Role N—N (Feature, Permission)
```

Ràng buộc bắt buộc:

- Ma trận chỉ hiển thị các quyền hợp lệ của chức năng.
- Backend từ chối mọi tổ hợp không được khai báo, ví dụ `ORG_ADMIN + PROCESS_STEP`.
- Không dùng danh sách quyền phẳng để kiểm tra authorization; luôn kiểm tra theo cặp `(featureCode, permissionCode)`.

## 4. Phân chia quyền chức năng và Action nghiệp vụ

Các quyền workflow như `PROCESS_STEP`, `APPROVE`, `RETURN`, `REJECT` không nên đồng thời xuất hiện trong Ma trận quyền nếu việc cho phép thực hiện các Action tương ứng đã được quản lý bởi BPMN, vai trò và Luật hiển thị Action. Nếu giữ cả hai cơ chế, người quản trị phải cấu hình hai nơi và dễ tạo ra kết quả mâu thuẫn.

Phân chia trách nhiệm được chọn:

```text
Ma trận Role × Quyền chức năng
→ truy cập màn hình và CRUD/chức năng cơ bản

Luật hiển thị Action
→ hành động nghiệp vụ theo quy trình, bước, vai trò và điều kiện

Task assignee/candidate
→ quyền xử lý task cụ thể
```

Ví dụ, để thực hiện `APPROVE_STEP`, người dùng phải:

1. Được truy cập ứng dụng Quản lý NV KHCN.
2. Có quyền xem chức năng Hồ sơ KHCN.
3. Có vai trò nằm trong luật của `APPROVE_STEP`.
4. Là assignee/candidate hợp lệ của task hiện tại.
5. Thỏa trạng thái hồ sơ và điều kiện nghiệp vụ của luật.

Luật Action không cấp quyền truy cập chức năng. Người chưa có `DOSSIER/VIEW` không được vào Chi tiết hồ sơ dù vai trò của họ xuất hiện trong luật Action.

## 5. Mô hình Luật hiển thị Action

Luật không còn trường **Quyền yêu cầu** cho người dùng lựa chọn. Các trường chính:

```text
Action
Process/Process version
Task definition key
Dossier status
Allowed roles
Business condition
Form Bundle
Presentation
Lifecycle status
```

Công thức đánh giá:

```text
App access
AND Feature access
AND Action active
AND Matching policy
AND Allowed role
AND Assignee/Candidate
AND Business condition
AND Valid BPMN route (đối với Standard Action)
```

Backend là nơi quyết định cuối cùng. Frontend không được truyền một danh sách Role hoặc Permission tự khai báo để backend tin tưởng.

## 6. Phân loại Action

### Standard Action

Làm thay đổi đường đi workflow, ví dụ:

- `SUBMIT`
- `APPROVE_STEP`
- `RETURN_STEP`
- `REJECT_STEP`

Standard Action bắt buộc gắn với một outgoing sequence flow có thật trong BPMN.

### Support Action

Không complete task và không làm thay đổi workflow, ví dụ:

- Bình luận.
- Tải tài liệu.
- Xem lịch sử.
- In hồ sơ.

Support Action không bắt buộc có outgoing sequence flow.

### Exception Action

Thay đổi đường đi chuẩn hoặc tạo luồng xử lý đặc biệt. Luật phải khai báo rõ đích đến là bước, trạng thái hoặc kết thúc quy trình; không được để đích rỗng.

## 7. Đồng bộ vai trò từ BPMN

Khi đồng bộ User Task từ BPMN, hệ thống đọc:

```text
taskDefinitionKey
candidateGroups
outgoing sequence flows
actionCode/outcome của từng flow
targetRef
```

Với mỗi outgoing flow, hệ thống sinh một luật nháp và điền các vai trò từ Candidate Group.

Nguyên tắc:

- Luật mới mặc định nhận toàn bộ Candidate Group của bước.
- Người quản trị được phép thu hẹp vai trò cho từng Action.
- Không được thêm vai trò nằm ngoài Candidate Group đối với Standard Action.
- Support/Exception Action không gắn trực tiếp với User Task có thể chọn vai trò thủ công.
- Candidate Group không tồn tại trong Identity phải được đánh dấu `ROLE_MISMATCH` hoặc `UNMAPPED`.
- Candidate Group động không thể phân tích tĩnh phải yêu cầu ánh xạ thủ công.

Ví dụ Candidate Group của bước là `TD, TP_CLKHCN`:

```text
APPROVE_STEP → TP_CLKHCN
RETURN_STEP  → TD, TP_CLKHCN
REJECT_STEP  → TP_CLKHCN
```

## 8. Xử lý luật trùng, bao phủ và chồng lấn

Tại một ngữ cảnh cụ thể, mỗi Action chỉ có đúng một luật hiệu lực. Không cộng gộp kết quả của nhiều luật và không dùng `displayOrder` để quyết định luật thắng.

| Trường hợp | Xử lý |
|---|---|
| Hai luật trùng hoàn toàn | Không cho kích hoạt luật thứ hai |
| Một luật là phạm vi con rõ ràng của luật khác | Cho phép; luật cụ thể hơn thắng |
| Hai luật chồng lấn một phần nhưng không có quan hệ cha–con | Không cho kích hoạt |
| Hai luật không giao nhau | Cho phép |

Độ cụ thể đề xuất:

```text
Process version + Task + Status
> Process version + Task
> Process version
> Mọi quy trình
```

Nếu luật cụ thể nhất khớp phạm vi nhưng không thỏa vai trò hoặc điều kiện, hệ thống không fallback về luật tổng quát. Điều này ngăn một luật hạn chế bị vượt qua bởi luật cha.

Không tạo nhiều luật cùng phạm vi và dựa vào các biểu thức điều kiện để giả định chúng loại trừ nhau. Các nhánh điều kiện cần được biểu diễn trong một cây điều kiện của cùng luật, hoặc tách thành các Action nghiệp vụ khác nhau.

Đối với Standard Action, để giữ đơn giản, bắt buộc khai báo process version và task cụ thể. Mỗi khóa sau chỉ có một luật hoạt động:

```text
(processVersion, taskDefinitionKey, actionCode, dossierStatus?)
```

## 9. Ngăn Action đưa hồ sơ vào nơi không xác định

BPMN là nguồn sự thật về đường đi workflow. Luật hiển thị chỉ xác định ai được sử dụng một đường đi đã tồn tại; luật không tự tạo ra đường đi mới.

Ví dụ `REJECT_STEP` chỉ hợp lệ khi User Task có outgoing flow tương ứng:

```text
actionCode = REJECT_STEP
outcome = REJECT
targetRef = End_Rejected
```

Không suy đoán Action từ nhãn hiển thị như “Từ chối”. Metadata Action/outcome phải được khai báo rõ trong BPMN.

Trạng thái đối soát:

| Mã | Ý nghĩa |
|---|---|
| `OK` | Nhánh BPMN và luật khớp |
| `MISSING_POLICY` | BPMN có nhánh nhưng chưa có luật |
| `ORPHAN_POLICY` | Luật có Action nhưng BPMN không có nhánh |
| `UNMAPPED_BRANCH` | BPMN có nhánh nhưng chưa ánh xạ Action |
| `ROLE_MISMATCH` | Vai trò của luật không thuộc Candidate Group |
| `CONFLICT` | Luật bị trùng hoặc chồng lấn |
| `INVALID_TARGET` | Nhánh không có đích hợp lệ |

Các trạng thái `ORPHAN_POLICY`, `UNMAPPED_BRANCH`, `CONFLICT` và `INVALID_TARGET` chặn kích hoạt luật.

Backend phải kiểm tra lại route khi thực thi Action. Nếu không có route:

```http
409 ACTION_ROUTE_NOT_FOUND
```

Trong trường hợp này hệ thống không complete task, không cập nhật trạng thái hồ sơ và phải ghi audit lỗi cấu hình.

## 10. Vòng đời và phiên bản luật

Trạng thái luật đề xuất:

```text
DRAFT
ACTIVE
DISABLED
INVALID
```

- Cho phép lưu luật chưa hoàn chỉnh dưới dạng `DRAFT`.
- Chỉ luật vượt qua kiểm tra xung đột, vai trò và BPMN mới được chuyển sang `ACTIVE`.
- Luật không còn tương thích sau khi BPMN thay đổi chuyển thành `INVALID`.

Luật Standard Action phải gắn với phiên bản BPMN/deployment tương ứng:

```text
RD01 v1 → bộ luật v1
RD01 v2 → bộ luật v2
```

Khi có v2, hệ thống sinh và kiểm tra luật v2 mà không thay đổi luật v1. Hồ sơ đang chạy v1 tiếp tục dùng BPMN và luật v1.

## 11. Trình bày nút thuộc Luật hiển thị

Thông tin trình bày theo ngữ cảnh nằm trong Luật hiển thị:

```text
displayLabel
icon
uiGroup
tone
displayOrder
helpText
```

Danh mục Action chỉ giữ bản chất nghiệp vụ và giá trị trình bày mặc định:

```text
actionCode
actionName
actionType
handler/outcome
requiresReason
requiresEvidence
requiresConfirm
defaultLabel
defaultIcon
defaultUiGroup
defaultTone
active
```

Thứ tự lấy giá trị:

```text
Giá trị override tại Luật → Giá trị mặc định của Action
```

Khi đồng bộ BPMN:

- Nhãn mặc định có thể lấy từ tên sequence flow.
- Icon, nhóm UI và sắc thái lấy từ Action Definition.
- Đồng bộ lại không ghi đè các override thủ công.
- UI có thao tác **Khôi phục mặc định**.

Ràng buộc trình bày:

| Loại Action | Nhóm UI | Sắc thái phù hợp |
|---|---|---|
| Standard | `PRIMARY`, `MORE` | `primary`, `default`, `danger` |
| Support | `MORE` | `default` |
| Exception | `EXCEPTION` | `warning`, `danger` |

`REJECT_STEP` không được mang sắc thái `primary`; Exception Action không được đưa vào nhóm hành động chính. `displayOrder` chỉ quyết định vị trí hiển thị, không tham gia chọn luật hiệu lực.

## 12. Form Bundle tại Luật hiển thị Action

> **Quyết định kiến trúc:** Giữ Form Bundle như một extension nghiệp vụ riêng của ứng dụng
> QL NV KHCN. Đây không phải phần tử hay khái niệm chuẩn của BPMN/Camunda. Camunda tiếp tục quản lý
> User Task và biểu mẫu chính được tham chiếu bởi User Task; tầng ứng dụng chịu trách nhiệm quản lý
> nhiều eForm phát sinh khi thực hiện một Action, phiên bản, dữ liệu submission và điều kiện hoàn thành
> thông qua Form Bundle. Không ghi Form Bundle trở lại BPMN dưới dạng metadata ngầm.

### Quyết định mô hình

`Action Definition` không gắn cố định với eForm. Form được cấu hình tại từng Luật hiển thị Action, vì cùng một Action như `APPROVE_STEP` có thể cần biểu mẫu khác nhau tại từng quy trình, phiên bản và User Task.

```text
Process Version + User Task + Action + Luật hiệu lực
→ một Form Bundle xác định
→ một hoặc nhiều eForm theo thứ tự nghiệp vụ
```

Quan hệ đề xuất:

```text
User Task BPMN
├─ 0..1 biểu mẫu công việc chính
└─ 1..N Luật Action
   └─ 0..1 Form Bundle thuộc riêng luật
      └─ 1..N Form Bundle Item
         └─ một phiên bản eForm
```

Camunda/BPMN vẫn chỉ khai báo tối đa một biểu mẫu công việc chính cho User Task. Một User Task có thể sử dụng nhiều eForm ở tầng ứng dụng thông qua các Action và Form Bundle của từng luật.

Form Bundle ban đầu thuộc riêng một luật, không dùng chung giữa nhiều luật. UI có thể hỗ trợ **Sao chép Bundle** để tái sử dụng cấu hình mà không tạo liên kết ngầm khiến sửa một luật ảnh hưởng luật khác.

### Cấu trúc Form Bundle

Thông tin chung của Bundle:

- Chế độ hiển thị, mặc định là `STEPPER`/wizard.
- Có cho phép lưu nháp hay không.
- Chính sách hoàn thành: tất cả form bắt buộc phải hợp lệ.
- Phiên bản cấu hình Bundle.

Mỗi `Form Bundle Item` gồm tối thiểu:

| Thuộc tính | Ý nghĩa |
|---|---|
| `formKey` | eForm trong Thư viện biểu mẫu |
| `formVersion` hoặc `versionBinding` | Phiên bản eForm được ghim cho luật/phiên bản quy trình |
| `displayOrder` | Thứ tự nghiệp vụ và thứ tự hiển thị |
| `displayTitle` | Tên bước hiển thị tùy chỉnh, có thể dùng tên mặc định của eForm |
| `required` | Có bắt buộc hoàn thành trước khi thực thi Action hay không |
| `mode` | `VIEW` hoặc `EDIT` |
| `skippable` | Người dùng có được chủ động bỏ qua form tùy chọn hay không |
| `conditionExpression` | Điều kiện để form tham gia Bundle ở runtime |
| `outputNamespace` | Không gian dữ liệu đầu ra, tránh trùng khóa giữa các form |

`displayOrder` trong Bundle có ý nghĩa nghiệp vụ: người dùng đi qua các form theo thứ tự này. Nó không liên quan đến `displayOrder` của nút trên UI.

### Quy tắc runtime

Khi người dùng thực hiện một Action:

1. Backend xác định đúng một Luật hiển thị Action có hiệu lực.
2. Backend lấy đúng phiên bản Form Bundle thuộc luật thắng.
3. Hệ thống đánh giá `conditionExpression` của từng item để tạo danh sách form thực tế.
4. UI hiển thị các form dưới dạng stepper/wizard theo `displayOrder`.
5. Người dùng có thể lưu nháp từng form nếu Bundle cho phép.
6. Chỉ khi mọi form bắt buộc đang áp dụng đều hợp lệ, UI mới cho phép xác nhận Action.
7. Backend đánh giá lại quyền truy cập chức năng, vai trò, assignee/candidate, luật, dữ liệu form và route BPMN.
8. Hệ thống lưu các Form Submission và thực thi Action theo một giao dịch nghiệp vụ nhất quán; lỗi ở bất kỳ bước bắt buộc nào thì không hoàn thành User Task.

Luật không có Form Bundle vẫn hợp lệ đối với Action không cần nhập liệu, ví dụ tải hồ sơ hoặc xem lịch sử.

### Ràng buộc an toàn

- Không cho chuyển luật sang `ACTIVE` nếu Bundle tham chiếu eForm không tồn tại, phiên bản không hợp lệ hoặc có hai item trùng thứ tự.
- Không được xóa vật lý eForm/phiên bản đang được luật hoạt động hoặc hồ sơ đang chạy tham chiếu; chỉ được archive/ngừng hoạt động.
- Không fallback âm thầm sang một form mặc định khi không tìm thấy form cấu hình. Runtime phải từ chối Action và ghi nhận lỗi cấu hình.
- Dữ liệu từng form phải được lưu kèm `ruleId`, `bundleVersion`, `formKey`, `formVersion`, `taskKey`, `actionCode` và người thao tác để audit.
- Nếu các form do những người khác nhau xử lý, hoặc phải hoàn thành tại các thời điểm khác nhau, phải tách thành nhiều User Task BPMN. Form Bundle chỉ gom các form thuộc cùng một người xử lý và cùng một lần thực hiện Action.
- Nếu luật cụ thể thắng nhưng người dùng không đáp ứng điều kiện hoặc Bundle không hợp lệ, không fallback sang Bundle của luật rộng hơn.

Ví dụ:

```text
Luật: Phê duyệt tại Hội đồng
Action: APPROVE_STEP

Form Bundle:
1. Phiếu nhận xét      — EDIT — Bắt buộc
2. Phiếu đánh giá      — EDIT — Bắt buộc
3. Tài liệu liên quan  — VIEW — Tùy chọn
4. Phiếu xác nhận      — EDIT — Bắt buộc
```

## 13. UI Ma trận hành động giai đoạn hiện tại

Giai đoạn hiện tại tập trung vào màn Chi tiết hồ sơ. UI có thể mặc định và ẩn các trường:

```text
Ứng dụng đích  = Quản lý NV KHCN
Chức năng đích = Hồ sơ KHCN
Surface         = Chi tiết hồ sơ
Đối tượng       = Hồ sơ
```

Các trường người dùng thao tác:

- Quy trình và phiên bản.
- Bước BPMN.
- Action.
- Vai trò được phép.
- Trạng thái/điều kiện.
- Form Bundle: thêm eForm, kéo thả thứ tự, bắt buộc/tùy chọn, chế độ xem/sửa và điều kiện hiển thị.
- Tên hiển thị, icon, nhóm UI, sắc thái, thứ tự và hướng dẫn.
- Trạng thái luật.

Backend vẫn giữ `targetApp`, `targetFeature` và `surface` để sau này mở rộng sang Worklist, Mobile, Nhiệm vụ KHCN hoặc các đối tượng nghiệp vụ khác.

## 14. Nguyên tắc runtime và bảo mật

Màn nghiệp vụ nên gọi một API theo tài nguyên, ví dụ:

```http
GET /api/dossiers/{dossierId}/available-actions
```

Backend tự lấy người dùng hiện tại, quyền truy cập chức năng, vai trò, task, BPMN và luật. API mô phỏng của Action Studio chỉ phục vụ quản trị, không dùng làm nguồn authorization cho màn nghiệp vụ.

Khi thực thi Action, backend bắt buộc đánh giá lại toàn bộ điều kiện, kể cả khi nút vừa được trả về từ `available-actions`.

Quy tắc UI:

- Thiếu quyền truy cập chức năng hoặc sai vai trò: ẩn Action khỏi người dùng cuối.
- Có quyền và đúng vai trò nhưng thiếu điều kiện nghiệp vụ: hiển thị nút bị khóa kèm lý do.
- Màn mô phỏng quản trị: hiển thị mọi Action và lý do được phép/từ chối.
- Quản trị viên hệ thống không mặc nhiên được phê duyệt nghiệp vụ; quyền quản trị và tư cách xử lý nghiệp vụ là hai khái niệm khác nhau.

## 15. Các tình huống nghiệm thu chính

1. Chọn chức năng Cơ cấu tổ chức không thấy quyền `PROCESS_STEP`.
2. Gửi tổ hợp quyền không thuộc chức năng bằng API bị từ chối.
3. Standard Action không có outgoing flow tương ứng không thể chuyển sang `ACTIVE`.
4. Luật trùng khóa không thể kích hoạt.
5. Luật cha và luật con hợp lệ; trong phạm vi con chỉ luật con được đánh giá.
6. Hai luật chồng lấn một phần bị đánh dấu `CONFLICT`.
7. Role đồng bộ từ Candidate Group; Role ngoài Candidate Group không thể mở rộng Standard Action.
8. BPMN thay đổi làm mất nhánh khiến luật cũ chuyển `INVALID` cho đúng phiên bản.
9. Gọi trực tiếp Action không có route trả `409` và không làm thay đổi hồ sơ/task.
10. Nhãn, nhóm UI và sắc thái có thể khác nhau cho cùng Action ở các bước khác nhau.
11. Đồng bộ BPMN không ghi đè phần trình bày đã override thủ công.
12. Người dùng không có `DOSSIER/VIEW` không thể truy cập Chi tiết hồ sơ dù vai trò xuất hiện trong luật Action.
13. Cùng `APPROVE_STEP` tại hai luật khác nhau có thể sử dụng hai Form Bundle khác nhau.
14. Các form trong Bundle được mở đúng thứ tự; Action bị chặn khi còn form bắt buộc chưa hợp lệ.
15. Form tùy chọn có điều kiện sai không tham gia kiểm tra hoàn thành Bundle.
16. eForm hoặc phiên bản không tồn tại khiến luật không thể chuyển sang `ACTIVE`; runtime không fallback sang form mặc định.
17. Lưu một Form Submission thất bại thì User Task không được hoàn thành và route BPMN không được thực thi.
18. Đồng bộ hoặc sửa BPMN không ghi đè Form Bundle đã cấu hình thủ công cho luật.

## 16. Tóm tắt quyết định

```text
Quyền chức năng
→ system-owned, được seed theo Feature, không tạo động

Vai trò trong Luật Action
→ quyết định ai được dùng Action trong ngữ cảnh BPMN

Candidate/Assignee
→ quyết định ai được xử lý task cụ thể

BPMN
→ nguồn sự thật về đường đi workflow

Luật hiển thị
→ nguồn cấu hình về ngữ cảnh, vai trò, điều kiện, cách trình bày nút và Form Bundle

Form Bundle
→ thuộc từng luật, quy định các eForm, phiên bản, thứ tự và điều kiện hoàn thành Action

Backend
→ nơi thực hiện quyết định authorization cuối cùng
```

## 17. Trạng thái triển khai ngày 30/07/2026

Đã triển khai:

- Chuẩn hóa báo cáo reconciliation với các trạng thái BPMN/luật, gồm luật mồ côi, nhánh chưa ánh xạ,
  lệch vai trò, xung đột và đích không hợp lệ.
- Phân biệt Candidate Group hợp lệ, mã không tồn tại trong danh mục và biểu thức động cần ánh xạ thủ
  công; không scaffold âm thầm luật có mapping vai trò không hợp lệ.
- Cưỡng chế tổ hợp `actionType × uiGroup × tone` và cung cấp thao tác **Khôi phục mặc định** có
  optimistic locking/audit.
- UI Form Bundle hỗ trợ cấu hình display mode, lưu nháp, completion policy, bundle/form version,
  display order, VIEW/EDIT, required, skippable, condition expression, output namespace, kéo-thả và
  sao chép Bundle từ luật khác.
- Runtime đánh giá điều kiện item bằng context hồ sơ/người dùng thật; lưu từng Form Submission kèm
  policy, bundle/form version, task, action và actor. Submission chỉ chuyển `COMPLETED` sau khi kết quả
  Camunda được xác nhận; trạng thái `PENDING` cho phép đối soát/phục hồi khi kết quả chưa chắc chắn.
- API task cho phép lưu nháp độc lập theo `outputNamespace` khi `allowDraft=true` và tải lại lịch sử
  submission của đúng người xử lý; backend kiểm tra lại task, quyền, policy snapshot và mode `EDIT`.
- Màn Chi tiết hồ sơ tải toàn bộ eForm trong Bundle theo `displayOrder`, khôi phục draft theo namespace,
  gom payload namespaced khi xác nhận Action và tự lưu nháp khi đóng modal.
- Bundle version do backend quản lý và tự tăng khi nội dung thay đổi; mỗi phiên bản được lưu thành
  snapshot JSON bất biến theo `(policyId, bundleVersion)`.

Còn cần triển khai/hoàn thiện:

- Cơ chế quản trị/cảnh báo các submission `PENDING` quá hạn.
- Bổ sung test tích hợp database cho transaction Form Submission và snapshot migration, cùng toàn bộ
  ma trận 18 tình huống nghiệm thu chưa được test tự động ở mức end-to-end.

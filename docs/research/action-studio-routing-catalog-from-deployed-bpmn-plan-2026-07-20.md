# Kế hoạch: thay `ActionStudioRoutingCatalog` hardcode bằng routing đọc từ BPMN đã deploy

- **Ngày**: 2026-07-20
- **Trạng thái**: DRAFT — chờ chốt 2 quyết định ở §3 trước khi code
- **Phạm vi**: backend `ActionStudioRoutingCatalog` / `ActionStudioService.reconcile|scaffold|simulate`, migration `action_availability_policy` + `action_exception_policy`, FE dropdown "Quy trình" trong modal *Cấu hình luật hiển thị nút*
- **Xuất phát**: rà soát modal *Cấu hình luật hiển thị nút* (2026-07-20) — trường Quy trình lấy từ danh sách bịa, không phải quy trình đã deploy

---

## 1. Vấn đề

`ActionStudioRoutingCatalog` là một `List.of(...)` viết cứng trong Java
([`ActionStudioRoutingCatalog.java:11-36`](../../backend/src/main/java/vn/vht/qtkhcn/service/ActionStudioRoutingCatalog.java)),
không đọc DB và không gọi Camunda. Nó cấp dữ liệu cho:

- dropdown **Quy trình** trong modal cấu hình luật,
- dropdown **Bước hiện tại** ở tab Mô phỏng,
- toàn bộ tab **Đối soát BPMN** (`reconcile()` gọi `routingCatalog.require(processCode)`),
- `scaffold()` — sinh luật hàng loạt.

### 1.1 Sai lệch định danh quy trình

| Deployed thật (`bpmnProcessId`) | Catalog Action Studio |
|---|---|
| `RD01_01` | `RD01.01` (khác dấu phân tách) |
| `RD02_02` | — (không có) |
| — | `RD02.01` (chưa từng deploy) |
| — | `RD05.01` (chưa từng deploy) |

Giao nhau bằng 0.

### 1.2 Sai lệch định danh bước

Catalog dùng `t1..t4`. BPMN `RD01_01` thật dùng `Task_1`, `Task_2`, … `Task_10a`,
`Task_10b`, `Task_11_HD`, `Task_11_TGD` (13 userTask).

### 1.3 Sai lệch mô hình outcome — **rủi ro thiết kế lớn nhất**

Catalog giả định mỗi bước có nhánh thuộc enum cố định 4 giá trị
`SUBMIT | APPROVE | RETURN | REJECT`, và `outcomeAction()`
([`ActionStudioService.java:494-502`](../../backend/src/main/java/vn/vht/qtkhcn/service/ActionStudioService.java))
**ném exception** với bất kỳ giá trị nào ngoài enum.

BPMN thật không mã hoá outcome như vậy. Nó dùng exclusiveGateway với điều kiện FEEL
trên các sequenceFlow, giá trị tiếng Việt:

```
=ketQuaXetDuyet  = "dong_y"
=ketQuaThamDinh  = "dong_y_bo_sung"   <-- không map được vào enum 4 giá trị
=ketQuaThamDinh  = "hieu_chinh"
=ketQuaKyDuyet   = "dong_y"
=ketQuaPheDuyet  = "hieu_chinh"
```

Hai điểm phải xử lý:

1. Nhánh không treo trực tiếp trên userTask mà qua gateway:
   `userTask → sequenceFlow → exclusiveGateway → N sequenceFlow`. Phải đi 2 chặng.
2. `"dong_y_bo_sung"` (Đồng ý, yêu cầu bổ sung) là outcome thứ 5, hiện **không có
   action code tương ứng** trong `action_studio_action`. Nếu bơm thẳng outcome thật vào
   `outcomeAction()` thì `reconcile()` sẽ 500.

### 1.4 Hệ quả đang tồn tại

- Mọi luật có `taskDefinitionKey` đều không bao giờ khớp lúc runtime — `simulate()` so
  `taskDefinitionKey.equals(...)` với task key thật từ Camunda.
- Tab Đối soát BPMN đang đối soát với sơ đồ không tồn tại; nhãn "ok/missing" vô nghĩa.
- `scaffold()` ghi vào DB những luật chết vĩnh viễn.

### 1.5 Điểm thuận lợi

BPMN thật đã có sẵn hai thứ catalog hardcode phải bịa:

- `zeebe:assignmentDefinition candidateGroups="PM"` → cấp thẳng `ProcessStepResponse.role`
  (đã đúng mã vai trò: `PM`, `CQ_KHCN`, `HDKHCN`, `BGD_TT,BGD_KHOI`…).
- `zeebe:formDefinition formKey="phieu-phe-duyet"` → gợi ý `formKey` mặc định khi scaffold.

Và `ProcessDefinitionVersion.bpmnXml` đã lưu sẵn XML lúc deploy
([`ProcessDefinitionService.java:100`](../../backend/src/main/java/vn/vht/qtkhcn/service/ProcessDefinitionService.java)),
nên **không cần gọi Camunda** để dựng routing — chỉ đọc PostgreSQL.

---

## 2. Mục tiêu

1. Dropdown Quy trình chỉ hiện quy trình **đã deploy thành công** (có row trong
   `process_definition_catalog`).
2. Dropdown Bước hiện tại hiện **userTask id thật** của version mới nhất.
3. Tab Đối soát BPMN đối soát với BPMN thật.
4. Luật đã lưu khớp được lúc runtime.
5. Không gọi Camunda trong đường đọc — degrade độc lập với engine.

---

## 3. Hai quyết định cần chốt trước khi code

### QĐ-1: Không gian định danh của `process_code`

**Đề xuất: đổi sang `bpmnProcessId` (`RD01_01`).**

Lý do không phải lựa chọn thật sự: lúc runtime `simulate()` nhận `processCode` từ process
instance của Camunda, mà Camunda chỉ biết `bpmnProcessId`. Giữ `RD01.01` thì phải duy trì
một bảng ánh xạ hai chiều — thêm điểm gãy, không được gì.

Đánh đổi: `process_code` mất tính "mã nghiệp vụ đọc được". Bù bằng cách hiển thị
`bpmnProcessId + tên catalog` trên UI (đã làm sẵn ở dropdown hiện tại).

### QĐ-2: Xử lý outcome ngoài enum 4 giá trị

| Phương án | Nội dung | Đánh giá |
|---|---|---|
| **A** (đề xuất) | Bỏ enum cứng. `outcome` = giá trị FEEL thật (`dong_y`, `hieu_chinh`, `dong_y_bo_sung`). Thêm bảng ánh xạ outcome→actionCode cấu hình được, có fallback "chưa ánh xạ" thay vì ném exception | Đúng bản chất BPMN; chịu được BPMN mới không cần sửa code |
| **B** | Giữ enum, normalize `dong_y→APPROVE`, `hieu_chinh→RETURN`, `khong_dong_y→REJECT`, bỏ qua outcome lạ | Nhanh hơn nhưng nuốt mất nhánh `dong_y_bo_sung`; mỗi BPMN mới lại phải sửa hàm normalize |

Chọn A thì cần thêm action code cho `dong_y_bo_sung` (ví dụ `APPROVE_WITH_SUPPLEMENT`)
— việc này chạm nghiệp vụ, **cần xác nhận của BA**.

---

## 4. Thiết kế

### 4.1 Thành phần mới: `DeployedBpmnRoutingReader`

Đọc `ProcessDefinitionVersion.bpmnXml` của version mới nhất mỗi catalog, parse ra
`ProcessRoutingResponse`.

Tái dùng cách parse DOM sẵn có trong `ProcessDefinitionImportValidator`
(`DocumentBuilderFactory` + helper `elementsByName`, đã cấu hình chống XXE) — **không**
thêm thư viện BPMN model mới.

Thuật toán trích nhánh cho mỗi `userTask`:

```
userTask
  └─ outgoing sequenceFlow
       ├─ nếu tới exclusiveGateway → mỗi outgoing flow của gateway là 1 branch
       │     outcome = parse FEEL conditionExpression  (vế phải dấu =)
       │     label   = @name của flow ("Đồng ý", "Yêu cầu hiệu chỉnh")
       │     target  = @name của node đích
       │     kind    = suy từ vị trí topo: quay lui = rework, tới endEvent = complete/reject
       └─ nếu tới activity/endEvent trực tiếp → 1 branch outcome mặc định (SUBMIT)
  role    = zeebe:assignmentDefinition/@candidateGroups
  formKey = zeebe:formDefinition/@formKey
```

Nhánh `default="Flow_5_Reject"` trên gateway không có `conditionExpression` — lấy outcome
từ `@name` của flow.

### 4.2 Cache

Parse XML mỗi lần mở màn hình là lãng phí. Cache trong bộ nhớ, khoá theo
`camundaProcessDefinitionKey` (bất biến — deploy nội dung giống hệt trả về cùng key, xem
[`ProcessDefinitionService.java:73-80`](../../backend/src/main/java/vn/vht/qtkhcn/service/ProcessDefinitionService.java)),
nên không cần invalidate thủ công: version mới → key mới → miss → parse lại.

### 4.3 `ActionStudioRoutingCatalog` giữ nguyên interface

Giữ nguyên chữ ký `processes()` và `require(code)`, chỉ đổi ruột thành uỷ quyền cho
`DeployedBpmnRoutingReader`. `ActionStudioService` không phải đổi gì ngoài `outcomeAction()`.

`require(code)` với quy trình chưa deploy: ném lỗi 400 có thông điệp rõ
("Quy trình chưa được deploy"), không phải 500.

### 4.4 Trường hợp danh mục rỗng

Môi trường sạch chưa import BPMN nào → `processes()` trả list rỗng → dropdown Quy trình
trống. Cần empty state ở FE: "Chưa có quy trình nào được deploy — vào Quản trị quy trình
để import BPMN." (Hiện `StartupProcessDeploymentService` tự deploy `rd0101.bpmn` +
`rd0202.bpmn` lúc khởi động nên thực tế hiếm gặp, nhưng không được vỡ.)

---

## 5. Migration dữ liệu

### 5.1 Khảo sát: dữ liệu hiện có đều là seed demo

Toàn bộ row trong `V10__action_studio.sql` có `updated_by = 'system-seed'`. Các row gắn
quy trình:

| id | process_code | task_key | Ghi chú |
|---|---|---|---|
| `AP-BPMN-RD01.01-t1-SUBMIT` | RD01.01 | t1 | |
| `AP-BPMN-RD01.01-t2-APPROVE/RETURN/REJECT` | RD01.01 | t2 | |
| `AP-BPMN-RD01.01-t3-APPROVE` | RD01.01 | t3 | cố tình `form_key = NULL` → demo trạng thái *unfilled* |
| `AP-BPMN-RD01.01-t9-ORPHAN` | RD01.01 | t9 | cố tình trỏ bước không tồn tại → demo *missing* |
| `EP-01` | RD01.01 | t2→t4 | exception policy |
| `EP-03` | RD02.01 | t2 | quy trình không tồn tại |

7 row `AP-01..AP-08` không gắn quy trình (`process_code IS NULL`) → **không bị ảnh hưởng**.

**Cần xác nhận trước khi viết migration**: môi trường demo/staging có luật nào do người
dùng tạo tay (`updated_by <> 'system-seed'`) không. Nếu có thì phải remap thay vì xoá-tạo lại.

```sql
SELECT id, process_code, task_definition_key, updated_by
FROM action_availability_policy
WHERE process_code IS NOT NULL AND updated_by <> 'system-seed';
```

### 5.2 `V20__action_studio_real_bpmn_routing.sql`

Không sửa V10 (đã applied). Migration mới:

1. Xoá các row seed gắn quy trình bịa (cascade sang bảng role/permission).
2. Seed lại theo `RD01_01` thật, giữ nguyên ý đồ demo 4 trạng thái đối soát:
   - `Task_2` (Dự thảo HS) — SUBMIT, có form → *ok*
   - `Task_6` (Thẩm định Chủ trương) — APPROVE/RETURN/REJECT, có form → *ok*
   - một row cố ý `form_key = NULL` → *unfilled*
   - một row trỏ `Task_99` không tồn tại → *missing*
3. `EP-01` remap sang `RD01_01` + task thật; `EP-03` chuyển sang `RD02_02` hoặc xoá
   (chờ QĐ-2 vì liên quan nhánh bổ sung).

Ràng buộc DB `CHECK (task_definition_key IS NULL OR process_code IS NOT NULL)` vẫn giữ nguyên.

### 5.3 Không thêm FK sang `process_definition_catalog`

Cố ý. Luật cấu hình phải sống sót khi một quy trình bị gỡ; ràng buộc mềm (cảnh báo ở tab
Đối soát) đúng hơn ràng buộc cứng làm hỏng deploy.

---

## 6. Các bước triển khai

| # | Việc | File | Phụ thuộc |
|---|---|---|---|
| 1 | Xác nhận không có luật do người dùng tạo (§5.1) | — | — |
| 2 | Chốt QĐ-1, QĐ-2 | — | BA cho QĐ-2 |
| 3 | `DeployedBpmnRoutingReader` + unit test parse `rd0101.bpmn`/`rd0202.bpmn` | `service/DeployedBpmnRoutingReader.java` | 2 |
| 4 | Nới `outcomeAction()` theo QĐ-2, bỏ `throw` | `ActionStudioService.java` | 2 |
| 5 | Đổi ruột `ActionStudioRoutingCatalog` + cache | `ActionStudioRoutingCatalog.java` | 3 |
| 6 | Migration `V20` | `db/migration/V20__*.sql` | 1, 2 |
| 7 | Cập nhật `ActionStudioServiceTest` / `ActionStudioHttpContractTest` (đang assert `RD01.01`, `t1..t4`) | `backend/src/test/**` | 3-6 |
| 8 | Empty state dropdown Quy trình + validate `taskDefinitionKey` cần `processCode` phía FE | `action-studio.html` / `.ts` | 5 |
| 9 | Kiểm thử tay: mở modal → chọn RD01_01 → bước ra Task thật; tab Đối soát ra đúng 4 trạng thái | — | 8 |

---

## 7. Rủi ro

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Outcome FEEL không parse được ở BPMN tương lai (điều kiện phức tạp, nhiều biến) | Cao | Fallback: outcome = `@name` của flow; log cảnh báo; không ném exception |
| BPMN dùng gateway song song/inclusive thay vì exclusive | Trung bình | Giai đoạn này chỉ hỗ trợ exclusiveGateway; loại khác → 1 branch "forward", ghi warning |
| Test hiện có gãy hàng loạt | Trung bình | Đã liệt kê ở bước 7; chạy `mvn -o test` trước khi mở PR |
| Luật do người dùng tạo bị migration xoá nhầm | Cao nếu có | Bước 1 chặn trước; nếu có thì đổi sang remap |
| `bpmnXml` rỗng ở version cũ | Thấp | Cột được ghi từ V2; bỏ qua catalog không có XML, log cảnh báo |

---

## 8. Ngoài phạm vi

- Sửa `simulate()` để lấy `processCode`/`taskDefinitionKey` thật từ process instance đang
  chạy (hiện người dùng tự chọn tay ở tab Mô phỏng).
- Gắn UI cho endpoint `GET /availability-policies/{id}/history` (BE đã có, FE chưa gọi).
- Siết validate `id` theo pattern `[A-Za-z0-9._-]+` phía FE.

Ba việc này ghi nhận ở rà soát 2026-07-20, không thuộc plan này.

---

## 9. Ghi chú harness

Việc này **chưa nằm trong `active-task.md`** (task đang mở: *Integration screen `/tich-hop`
Đợt 1 — DONE 2026-07-08*) và foundations mới 1/6 COMPLETE. Theo `CLAUDE.md`, cần đưa vào
`DELIVERY_STATE.md` và chốt task trước khi bắt đầu code.

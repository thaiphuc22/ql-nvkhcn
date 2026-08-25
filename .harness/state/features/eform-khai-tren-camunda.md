# eForm khai trên Camunda — nhập về App

> **Trạng thái:** BƯỚC 1+2 ĐÃ CODE, test xanh, **chưa chạy trên stack sống**. Bước 3–6 chưa làm. **Ngày:** 2026-08-25 · **Nguồn:** phiên thiết kế với user.
> **Bối cảnh:** khách khai eForm trên Camunda và gắn vào User Task cũng trên Camunda —
> tiếp nối [[camunda-la-noi-tao-quy-trinh]] (Camunda là nơi authoring duy nhất).
> **Phạm vi đã chốt với user:** làm **cả hai** loại form — embedded và linked.

---

## 1. Vấn đề

App render biểu mẫu từ kho của **chính nó** (`eform` / `eform_version`), không phải từ Camunda:

```
BPMN → sync → đọc @formKey → scaffold → action_availability_policy.form_key
     → FE eformService.loadOne(key) → GET /api/eforms/{key} → bảng eform CỦA APP
```

Khách khai form trên Camunda thì mắt xích cuối rỗng. Bốn chỗ vỡ:

| # | Chỗ vỡ | Vị trí |
|---|---|---|
| 1 | Parser chỉ đọc attribute `formKey`; Modeler 8.9 ghi `formId` cho linked form | `BpmnUserTaskMetadataCatalog.java:80`, `DeployedBpmnRoutingReader.java:127`/`:138` |
| 2 | `validateBundle` đòi form phải có sẵn trong bảng `eform` → **fail cả lượt scaffold** | `ActionStudioService.java:950` |
| 3 | `missingRequiredFormFields` ném khi không thấy form → fail lúc submit | `ActionStudioService.java:394` |
| 4 | FE `loadOne(formKey)` → 404 | `ho-so-detail.ts:362`, `:437` |

Ghi chú: `ProcessDefinitionImportValidator.java:214` **đã** biết cả `formId` lẫn `formKey`
(`Set.of("formId","formKey")`) — chỉ hai reader runtime là chưa. Đây là bằng chứng nhánh `formId`
chưa từng chạy end-to-end.

## 2. Ràng buộc CỨNG từ engine (đã kiểm chứng trực tiếp, không suy đoán)

Camunda 8.9.12 đang chạy ở `localhost:8080`. Đã probe thật:

| Route | Kết quả | Nghĩa |
|---|---|---|
| `GET /v2/forms/{key}` | `"No static resource v2/forms/1"` — y hệt route bịa `/v2/nonsense/1` | **KHÔNG tồn tại** |
| `GET /v2/process-definitions/{key}/form` | `"Process Definition with key '1' not found"` | route CÓ — nhưng **chỉ start form** |
| `GET /v2/user-tasks/{userTaskKey}/form` | `"User Task with key '1' not found"` | route CÓ — nhưng **cần instance đang chạy** |

`javap` trên `camunda-client-java-8.9.12.jar` khớp: chỉ có `newProcessDefinitionGetFormRequest(long)`
và `newUserTaskGetFormRequest(long)`. Không có search/get-form-by-id.
`io.camunda.client.api.search.response.Form` trả `getFormId()`, `getVersion()`, `getFormKey()`,
`getSchema()` — `getSchema()` chính là JSON form-js.

**Hệ quả quyết định thiết kế:** với **linked form gắn vào user task giữa quy trình**, app
**không thể** lấy schema tại thời điểm sync/scaffold, vì lúc đó chưa có instance nào chạy.
Mọi thiết kế "hút hết form về lúc đồng bộ" đều bất khả thi cho nhánh này.

## 3. Thiết kế

Tin tốt: **Camunda Forms chính là schema form-js**, đúng thứ `FormRendererComponent` đang render.
Không phải viết renderer mới — chỉ cần đường ống nhập.

### 3a. Embedded form — giải quyết trọn ở design-time

Schema nằm ngay trong BPMN XML (`<zeebe:userTaskForm id="...">{json}</zeebe:userTaskForm>` trong
`bpmn:extensionElements` cấp process), mà app **đã lưu sẵn XML** ở `process_definition_version.bpmn_xml`.
→ Parse thêm lúc sync, **không gọi engine**, có schema trước cả khi scaffold chạy. Trọn vẹn.

### 3b. Linked form — placeholder + hydrate lười (khuyến nghị)

Vì mục 2, chia làm hai thì:

1. **Lúc scaffold:** tạo dòng `eform` *placeholder* khoá theo `formId` của BPMN,
   `source=CAMUNDA`, `schema=null`, trạng thái `CHUA_HUT`. Việc này gỡ chốt chặn ở
   `validateBundle:950` để scaffold chạy trọn lượt.
2. **Lúc chạy thật:** `available()` / `saveDraft()` / submit đều đã cầm `taskKey`
   (`WorkflowTaskActionService.java:90`, `:107`) → gọi `newUserTaskGetFormRequest(taskKey)`,
   ghi `schema` + version engine vào dòng đó, chuyển `DA_HUT`. Lần sau đọc thẳng DB.

Hydrate **đồng bộ ngay trước** `missingRequiredFormFields` chứ không phải nền — nếu không, lần
submit đầu tiên của mỗi task sẽ bỏ qua kiểm tra trường bắt buộc phía server.

Nhân tiện nối luôn `newProcessDefinitionGetFormRequest` cho **start form** — miễn phí, có sẵn
design-time, phủ được bước đầu quy trình.

**Phương án dự phòng (nếu user không chấp nhận hydrate lười):** xin khách file `.form` rồi thêm nút
"Nhập biểu mẫu từ Camunda" trong Thư viện biểu mẫu. Tất định, không phụ thuộc runtime — nhưng thành
thao tác tay mỗi lần khách sửa form, và trái với "sync là đường duy nhất".

### 3c. Khoá và version — hai hệ quy chiếu lệch nhau

| | App | Camunda |
|---|---|---|
| khoá | slug lowercase (`EformService.create` ép `toLowerCase()`) | `formId`, chuỗi tự do |
| version | optimistic-lock (`@Version`) | số deploy của engine |

`ActionStudioService.java:952` đang so `item.formVersion()` với `form.getVersion()` — **hai nghĩa
khác nhau**, nhập thẳng là sai. Cần:
- cột `source` (`APP` \| `CAMUNDA`) + cột riêng cho version engine, không tái dùng cột `@Version`;
- form `source=CAMUNDA` **read-only** trong Thư viện biểu mẫu (không sửa/xoá) — đúng nguyên tắc
  Camunda là nơi authoring duy nhất;
- xử lý va khoá khi `formId` của khách trùng slug form do BA tự vẽ trong app.

### 3d. Đối soát

Thêm trạng thái *"bước có form khai trên Camunda nhưng chưa hút về"* vào màn Đối soát — hiện chỉ có
missing/generic/unfilled/ok.

## 4. TREO — cần user chốt: chiều dữ liệu ra

Khách khai form trên Camunda sẽ **mặc định kỳ vọng** dữ liệu form chảy vào process variables (hành
vi Tasklist chuẩn). App hiện lưu vào `ActionFormSubmission` và chỉ gửi engine gói 4 dòng điều khiển
— đúng **D3** (business data ở DB app, Camunda chỉ correlation).

Giữ D3 là đúng kiến trúc, nhưng **phải nói rõ ranh giới này với khách trước demo**, đừng để lộ ra
lúc chạy. Đây là quyết định nghiệp vụ, không phải code — ứng viên decision mới, vì nó thu hẹp phạm
vi eForm giống như [[camunda-la-noi-tao-quy-trinh]] đã thu hẹp D10.

## 5. Thứ tự làm

| Bước | Nội dung | Trạng thái |
|---|---|---|
| 1 | Đọc `formId`/`formKey`/`externalReference` ở 2 reader | **XONG** — `BpmnFormReference` |
| 2 | Parse embedded form từ XML đã có → bảng `eform` | **XONG** — `EmbeddedFormReader` + `EmbeddedFormImportService` |
| 3 | Cột `source` + read-only ở Thư viện | **XONG một nửa** — xem mục 6 |
| 4 | Placeholder lúc scaffold + hydrate lười qua `taskKey` | chưa — nhánh linked, phần đắt nhất |
| 5 | Start form qua `newProcessDefinitionGetFormRequest` | chưa |
| 6 | Trạng thái mới ở màn Đối soát | chưa |

## 6. Đã làm gì ở bước 1+2 (2026-08-25)

| File | Vai trò |
|---|---|
| `camunda/BpmnFormReference.java` | giải mã 4 dạng tham chiếu form; **mới** |
| `camunda/BpmnUserTaskMetadataCatalog.java` | dùng nó thay vì đọc thẳng `@formKey` |
| `service/DeployedBpmnRoutingReader.java` | nt, 2 chỗ |
| `service/EmbeddedFormReader.java` | bóc `<zeebe:userTaskForm>` khỏi BPMN XML; **mới** |
| `service/EmbeddedFormImportService.java` | ghi vào thư viện, listener `@Order(10)`; **mới** |
| `service/EformService.java` | `importFromCamunda()` + `findEditable()` chặn sửa form nguồn CAMUNDA |
| `domain/Eform.java`, `domain/EformSource.java` | cột `source`, `camunda_form_id` |
| `db/migration/V39__eform_camunda_source.sql` | migration tương ứng |
| `service/DeployedProcessPolicyScaffolder.java` | thêm `@Order(20)` |

Test: 334 xanh (`ProcessDeployedListenerOrderTest` khoá thứ tự 2 listener — đã thử đảo `@Order` để
xác nhận test gãy thật, không phải test rỗng).

**Còn hở, cố ý để lại cho bước 3:** `EformResponse` chưa trả `source`, nên màn Thư viện biểu mẫu vẫn
hiện nút Sửa/Xoá cho biểu mẫu hút từ Camunda — bấm vào thì backend trả 400 kèm lời giải thích chứ
không mất dữ liệu, nhưng UX chưa đúng. Chặn phía server đã có, chặn phía UI thì chưa.

Bước 1+2 là mức tối thiểu chạy được demo **nếu** khách chỉ dùng embedded. User đánh giá khả năng
cao dùng cả hai ⇒ bước 4 nằm trong phạm vi bắt buộc.

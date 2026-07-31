# Postman — bộ test QTKHCN ↔ Camunda 8.9

## Import gì

| File | Import vào | Ghi chú |
| --- | --- | --- |
| `Camunda.postman_collection.json` | Collections | **76 request**. Giữ nguyên `_postman_id` của collection "Camunda" bạn đã tạo ⇒ Postman sẽ hỏi **Replace**, chọn Replace là nó điền đầy vào đúng collection cũ |
| `QTKHCN-local.postman_environment.json` | Environments | **Nhớ chọn ở góc trên phải**, không chọn thì mọi `{{biến}}` đều rỗng |

Sau khi import: chạy folder `00 · Sức khoẻ engine` trước. Engine chưa sống thì mọi thứ khác vô nghĩa.

## Cách collection được dựng

Không request nào viết theo trí nhớ:

- **Phần Camunda** sinh bằng script từ **OpenAPI spec sống** của engine
  (`http://localhost:8080/v3/api-docs` — 200 endpoint). Script fail-fast nếu một path không tồn tại
  trong spec, nên không có endpoint bịa.
- **Phần backend** đọc từ annotation trong `backend/src/main/java/vn/vht/qtkhcn/web/*Controller.java`.
- Toàn bộ request read-only đã được **gọi thật** trên stack dev ngày 2026-07-28 (chi tiết ở mục
  "Đã kiểm chứng" bên dưới).

## Cấu trúc

| Folder | Số req | Dùng khi |
| --- | --- | --- |
| `00 · Sức khoẻ engine` | 4 | Luôn chạy đầu tiên |
| `01 · Process definitions` | 6 | **Lõi use case Đồng bộ** — 2 API mà `CamundaProcessDefinitionLookup` gọi |
| `02 · Deploy BPMN/DMN` | 3 | **Tạo tình huống "quy trình vẽ ngoài app"** |
| `03 · Process instances` | 8 | Chạy thử một hồ sơ |
| `04 · User tasks` | 9 | Bước phê duyệt, form binding |
| `05 · DMN` | 4 | Bảng quyết định, chuỗi nhiều bảng |
| `06 · Chẩn đoán` | 8 | **Hồ sơ đứng im không rõ lý do** |
| `07 · Biến & element instances` | 4 | Soi biến, sửa biến để test nhánh, thử FEEL |
| `08 · Message & signal` | 4 | Đánh thức instance đang chờ |
| `09 · QTKHCN backend` | 26 | API của app (A: Đồng bộ · B: Action Studio · C: phân hệ khác) |

## Quy ước

- **⚠️** trước tên = request **ghi dữ liệu** hoặc phá trạng thái. Đọc description trước khi bấm.
  Không có ⚠️ là read-only.
- Request đánh số **① ② ③** phải chạy theo thứ tự — chúng **tự chuyền biến** cho nhau
  (`processDefinitionKey`, `processInstanceKey`, `userTaskKey`, `incidentKey`…). Bạn không phải copy
  tay key nào.
- Mở **Console** (`Ctrl+Alt+C`): phần lớn thông tin hữu ích in ra đó chứ không ở response body.

## Kịch bản test use case "Đồng bộ quy trình từ Camunda"

| Muốn kiểm | Làm gì | Kỳ vọng |
| --- | --- | --- |
| **Đường hạnh phúc** | `02 → Deploy BPMN` (copy file .bpmn, đổi `<bpmn:process id="...">` thành id chưa từng có) → `09/A → ②` | `imported = 1`, `newCatalog = true` |
| **Idempotency** | Chạy `09/A → ②` hai lần | Lần 2 `imported = 0`, `alreadyKnown` = `scanned` |
| **Cảnh báo quét bị cắt** | Đặt env `maxScan = 1` → `09/A → ②` | `warnings[]` có "Engine đang có N… chỉ quét M" |
| **Lỗi toàn lượt** | `docker stop orchestration` → `09/A → ②` | HTTP lỗi, **không phải** 200 kèm `failures[]` |
| **Thiếu auth** | Xoá header `X-QTKHCN-Dev-Key` | 401 kèm message tiếng Việt |
| **Scaffold luật** | Sau đồng bộ → `09/B → Đối soát BPMN ↔ luật` | Quy trình mới đã có luật hành động chưa |
| **Vào được danh sách chọn** | `09/A → ④` | Quy trình vừa nhập có trong `selectable` |

Bấm **Run collection** trên folder `09/A` để chạy cả chuỗi và xem bảng test.

## Ba cái bẫy

1. **Backend đòi `X-QTKHCN-Dev-Key: dev-local-only`** — thiếu là `401` với mọi endpoint
   ([DevApiKeyFilter.java](../../backend/src/main/java/vn/vht/qtkhcn/security/DevApiKeyFilter.java)).
   Pre-request script của collection tự chèn, và **chỉ** cho request tới `{{appBase}}` — không rò key
   sang Camunda.
2. **Dùng `127.0.0.1:8090`, không phải `localhost:8090`** — `application.yml` khai
   `server.address: 127.0.0.1`.
3. **`X-QTKHCN-Actor` theo RFC 5987**: `UTF-8''<percent-encoded>`, ví dụ
   `UTF-8''Nguy%E1%BB%85n%20V%C4%83n%20A`. Gửi tiếng Việt thô là header hỏng; bỏ trống thì
   `importedBy = "dev-api-key"`.

## Khi bật OIDC

Điền access token vào biến môi trường `bearer`. Pre-request script tự gắn
`Authorization: Bearer <token>` cho **mọi request tới Camunda** và không gửi sang app. Để trống thì
không gắn gì — đúng cho engine dev hiện tại.

## Kiểm chứng tự động — `validate.py`

```bash
python docs/postman/validate.py
```

Script bắn **thật** mọi request read-only vào stack dev (tự lấy `processDefinitionKey`,
`userTaskKey`, `slotCode`… từ chính hệ thống để thay biến), bỏ qua request có ⚠️, rồi báo cái nào
không 2xx. Chạy nó sau mỗi lần sửa collection hoặc nâng version engine.

**Kết quả lần cuối (2026-07-28): 63 OK · 12 skip · 1 FAIL đã biết nguyên nhân.**

Vòng đầu tiên script tìm ra **12 request hỏng** — đều đã sửa theo contract thật:

| Lỗi | Nguyên nhân | Đã sửa |
| --- | --- | --- |
| `page.limit cannot be parsed` | `"limit": "{{maxScan}}"` → Postman thay biến trong chuỗi, engine nhận `"500"` thay vì `500` | Phát biến số **không dấu nháy** |
| `No filter provided` ×2 | `/v2/jobs/statistics/by-types` và `/errors` bắt buộc `filter.from` + `filter.to`; `/errors` cần thêm `jobType` | Thêm filter, `{{from7d}}`/`{{nowIso}}` do pre-request script tự sinh |
| `Required parameter 'from'` | `/v2/jobs/statistics/global` cần `from`/`to` ở **query**, không phải body | Thêm query param |
| `IDENTITY_REQUIRED` | `/api/tasks/*` bắt buộc header **`X-QTKHCN-User-Id`** (khác `X-QTKHCN-Actor`) | Thêm header + biến `{{userId}}` |
| `variables phải là một object` ×2 | Body sai schema `SimulationRequest` / `CreateBpmnTestRequest` | Dựng lại theo DTO thật |
| `trạng thái hồ sơ không hợp lệ` | `dossierStatus` là `draft\|processing\|approved\|rejected` — **chữ thường** | Dùng `processing` |
| `Không tìm thấy slot` | Slot bịa | Lấy `{{slotCode}}` từ `/api/approval-matrix/slots` |
| `slot/context must not be null` | Điều kiện đặt ở cấp gốc thay vì trong `context` | Dựng lại theo `ResolveApprovalRequest` |
| 404 assign/unassign/resolve incident | Lấy task/incident **không lọc trạng thái** | Lọc `CREATED`/`ACTIVE` |

Một lỗi nghiêm trọng hơn cũng lộ ra: request **xoá resource** thiếu dấu ⚠️ nên bị coi là read-only.
Nay đổi thành `⚠️⚠️ XOÁ resource đã deploy` và dùng biến **riêng** `{{resourceKey}}` — cố ý không
nối vào `{{processDefinitionKey}}`, để một cú bấm nhầm không xoá đúng quy trình mà các folder khác
vừa lấy về.

### FAIL còn lại: `Đối soát một quy trình (readiness)` — 404

**Không phải lỗi collection.** Request đúng; backend đang chạy **JAR cũ chưa có endpoint đó**.
Cách phân biệt (đã ghi trong description của chính request):

| Body 404 | Nghĩa |
| --- | --- |
| `{"message":"Không tìm thấy…"}` | Route có, dữ liệu không có ⇒ lỗi nghiệp vụ thật |
| `{"timestamp":…,"error":"Not Found"}` | Route KHÔNG có ⇒ **JAR cũ, cần build + restart backend** |

Kiểm nhanh: gọi một đường dẫn bịa (`.../khong-ton-tai`) — ra cùng hình dạng body thì đúng là JAR cũ.

Các request **⚠️ ghi dữ liệu** (deploy, start instance, complete task, đồng bộ, xoá resource) cố ý
**chưa chạy** — để bạn tự bấm.

## Tài liệu liên quan

- [`../arch/sequence-dong-bo-quy-trinh-tu-camunda.md`](../arch/sequence-dong-bo-quy-trinh-tu-camunda.md) — sequence diagram
- [`../arch/api-camunda-dong-bo-quy-trinh.md`](../arch/api-camunda-dong-bo-quy-trinh.md) — contract API chi tiết + `curl`

## Muốn import toàn bộ 200 endpoint Camunda?

Collection này chỉ lấy phần dùng được cho dự án. Cần đủ 200 thì Postman → **Import → Link**:

```text
http://localhost:8080/v3/api-docs
```

Engine tự phơi OpenAPI 3.1. Swagger UI: <http://localhost:8080/swagger-ui/index.html>
(spec ở `/v3/api-docs` là version của springdoc; API vẫn ở `/v2/...` — hai số không liên quan nhau).

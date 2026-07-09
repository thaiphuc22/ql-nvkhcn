# Kiến trúc eForm "B-engine" — Renderer AntD giữ nguyên schema form-js

> **Loại tài liệu:** Architecture design (docs/arch — thiết kế cụ thể).
> **Trạng thái:** Draft đề xuất — chưa lock decision, chưa implement.
> **Ngày:** 2026-07-09.
> **Bối cảnh phát sinh:** Khách hàng phản ánh eForm render bằng `@bpmn-io/form-js`
> "không đồng bộ với giao diện AntD của app". Xem [Phụ lục A](#phụ-lục-a--mạch-trò-chuyện--quyết-định)
> để có toàn bộ mạch phân tích dẫn tới thiết kế này.

---

## 1. Vấn đề & phạm vi

Người dùng cuối than eForm **xấu / không đồng bộ AntD**. Qua phân tích, "xấu" chỉ nằm ở
**lớp Renderer** (form-js tự vẽ input bằng renderer preact nội bộ, không phải component AntD),
không phải ở builder hay ở cơ chế gắn form vào Task/Action.

Đồng thời đội nghiệp vụ xác định eForm **cần cả 3 năng lực nâng cao**:

- **① Hiển thị có điều kiện** — trường A ẩn/hiện theo giá trị trường B.
- **② Trường tính toán** — giá trị suy ra tự động từ các trường khác (readonly).
- **③ Bảng động** — danh sách dòng thêm/bớt được (thành viên, sản phẩm, hạng mục chi…).

→ Cái phải xây không chỉ là "lớp sơn AntD" mà là một **form engine** (bộ máy reactivity).

## 2. Quyết định kiến trúc (điểm chốt)

**Giữ JSON schema của form-js làm "hợp đồng dữ liệu" (data contract). Chỉ thay lớp
Runtime Renderer bằng AntD; tái dùng `feelin` (FEEL engine, đã cài sẵn) cho ①②;
render `dynamiclist` thành bảng AntD cho ③.**

Lý do chọn B-engine thay vì đổi sang một form-framework khác (vd Formily):

| Tiêu chí | B-engine (chọn) | Đổi sang Formily |
|---|---|---|
| Builder admin ([FormDesigner](../../webapp/src/components/FormDesigner.tsx)) | **Giữ nguyên** | Phải thay/viết converter — mất builder đã dựng |
| Binding `formKey` → Task/Action | **Giữ nguyên** | Giữ được nhưng schema đổi |
| Storage + seed forms | **Giữ nguyên** | Phải migrate |
| Tương thích Camunda Form schema | **Giữ** | Mất |
| Engine ①②③ | Tự wiring + **tái dùng feelin** | Có sẵn (đỡ glue) |
| Rủi ro/tổng công | Tập trung ở 1 file renderer | Trải rộng nhiều lớp |

Yếu tố quyết định: dự án **đã dựng một FormEditor drag-drop custom hoàn chỉnh** và admin
đang dùng nó. Formily buộc phải thay builder đó. B-engine chỉ đụng **runtime renderer**.

> Ràng buộc nền: dự án **không dùng Camunda Tasklist** (render form trong UI custom —
> xem CLAUDE.md › Tech Stack), nên lợi thế "engine có sẵn" của Formily không đủ để đánh
> đổi việc mất builder + mất tương thích schema.

## 3. Ba lớp — cái gì đổi, cái gì giữ

```
┌─────────────────────────────────────────────────────────────────────┐
│  LỚP THIẾT KẾ (Builder)          — GIỮ NGUYÊN                         │
│  FormDesigner.tsx  →  @bpmn-io/form-js FormEditor                     │
│  Admin kéo–thả tạo schema (đã hỗ trợ sẵn conditional/expression/list) │
└───────────────────────────┬─────────────────────────────────────────┘
                            │  xuất ra
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  HỢP ĐỒNG DỮ LIỆU (Data contract) — GIỮ NGUYÊN                        │
│  JSON schema form-js  (FormContext CRUD, seedForms, formKey)          │
│  { type:'default', components:[ {type,key,label,validate,conditional} ]}│
└───────────────────────────┬─────────────────────────────────────────┘
                            │  formKey (binding qua ActionAvailabilityPolicy) — GIỮ NGUYÊN
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  LỚP RENDER (Runtime)             — THAY MỚI  ★                       │
│  AntFormRenderer.tsx  (thay FormRenderer.tsx)                         │
│  ├─ Map component.type → component AntD                               │
│  ├─ Reactivity loop: đổi field → feelin đánh giá conditional/expr     │
│  ├─ dynamiclist → AntD editable rows                                  │
│  └─ submit(): { data, errors }  ← GIỮ NGUYÊN interface                │
└─────────────────────────────────────────────────────────────────────┘
```

**Không đụng tới:** [FormDesigner.tsx](../../webapp/src/components/FormDesigner.tsx),
[FormContext.tsx](../../webapp/src/store/FormContext.tsx),
[forms/index.ts](../../webapp/src/forms/index.ts) (seed),
[TaskFormModal.tsx](../../webapp/src/components/TaskFormModal.tsx),
[actionAvailabilityPolicy.ts](../../webapp/src/data/actionAvailabilityPolicy.ts) (binding).

**Chỉ thay:** [FormRenderer.tsx](../../webapp/src/components/FormRenderer.tsx) → renderer AntD mới.
Giữ **đúng interface** `FormRendererHandle` để phần gọi không phải sửa:

```ts
export interface FormSubmitResult { data: Record<string, unknown>; errors: Record<string, unknown> }
export interface FormRendererHandle { submit: () => FormSubmitResult }
// Props: { schema: unknown; data?: Record<string, unknown> }
```

> Hợp đồng `submit()` phải trả `errors` rỗng khi hợp lệ và có key khi lỗi, vì
> [TaskFormModal.tsx:66](../../webapp/src/components/TaskFormModal.tsx#L66) kiểm tra
> `Object.keys(res.errors).length > 0`.

## 4. Mô hình state & vòng reactivity

Renderer tự quản state (controlled), không để mỗi input tự giữ:

```
formData: Record<string, unknown>          // keyed theo component.key (phẳng) + mảng cho dynamiclist
    │
    │  onChange(key, value)  →  setFormData
    ▼
derive (chạy lại mỗi lần formData đổi, memo hoá):
    for each component:
      hidden  = evalFeel(component.conditional?.hide, formData) === true   // ①
      value   = component.expression ? evalFeel(component.expression, formData) : formData[key]  // ②
      // component hidden → loại khỏi render, khỏi validate, khỏi data submit
    ▼
render danh sách component (visible) bằng AntD
```

`evalFeel(expr, data)`:

```ts
import { evaluate } from 'feelin'
function evalFeel(expr: string | undefined, data: Record<string, unknown>): unknown {
  if (!expr) return undefined
  // form-js viết biểu thức FEEL với tiền tố '='  →  bỏ '=' trước khi eval
  const src = expr.startsWith('=') ? expr.slice(1) : expr
  try { return evaluate(src, data) } catch { return undefined }
}
```

- **① Conditional:** component có `conditional.hide = "=<FEEL>"`. `hidden = evalFeel(...) === true`.
  Trường ẩn: không render, **không đưa vào validate/submit** (tránh chặn nộp vì ô đang ẩn).
- **② Computed:** component mang biểu thức tính (form-js: field `expression`, hoặc component
  type `expression` headless). Giá trị **readonly**, luôn lấy từ `evalFeel`, không cho gõ tay.
- Reactivity đơn giản = **tính lại toàn bộ** trên mỗi thay đổi (form nghiệp vụ nhỏ, không cần
  dependency graph tối ưu). Nếu sau này form lớn → chuyển sang memo theo key phụ thuộc.

## 5. Bảng map `component.type` → AntD

| form-js `type` | Component AntD | Ghi chú | Lát |
|---|---|---|---|
| `text` | `Typography` + render Markdown | form-js hỗ trợ markdown; cần 1 markdown renderer (vd `marked`/`react-markdown`) | 1 |
| `textfield` | `Input` | | 1 |
| `textarea` | `Input.TextArea` | | 1 |
| `number` | `InputNumber` | | 1 |
| `checkbox` | `Checkbox` (boolean đơn) | | 1 |
| `checklist` | `Checkbox.Group` | multi — vd `tieuChi` trong phieu-nhan-xet | 1 |
| `radio` | `Radio.Group` | `values[]` → options | 1 |
| `select` | `Select` | | 1 |
| `taglist` | `Select mode="multiple"` | | 1 |
| `datetime` | `DatePicker` / `TimePicker` | theo `subtype` (date/time/datetime) + locale vi_VN | 1 |
| `separator` | `Divider` | | 1 |
| `spacer` | spacing (margin) | | 1 |
| `image` | `<img>` | | 2 |
| `expression` | (headless) | không render; ghi giá trị tính vào data | 2 |
| `group` | container lồng (bố cục) | nhóm trường | 2 |
| `dynamiclist` | **AntD editable rows / table** | ③ — xem mục 6 | 3 |
| `table` | `Table` (readonly hiển thị) | | 3 |
| `filepicker` | `Upload` | cần backend lưu file (Foundation sau) | sau |
| `html` / `iframe` | cân nhắc bỏ / sanitize | rủi ro XSS — chỉ bật khi cần | sau |
| `button` | (bỏ qua) | nút submit/nộp do TaskFormModal quản lý | — |

Mỗi mapping cần đọc `component.validate` (mục 7) và `component.conditional` (mục 4).

## 6. ③ Bảng động (`dynamiclist`)

`dynamiclist` bind vào một **mảng**; mỗi phần tử là 1 object theo template `components` con.

```
formData[key] : Array<Record<string, unknown>>     // vd danhSachThanhVien: [{hoTen, vaiTro, phanTram}, ...]

Render bằng AntD:
  ┌───────────────────────────────────────────────┐
  │  Table / danh sách row-group                   │
  │   dòng i: render các component con (đệ quy      │
  │           dùng chính renderer AntD, với         │
  │           data = formData[key][i])             │
  │   nút [Xoá dòng]                               │
  │  [+ Thêm dòng]                                 │
  └───────────────────────────────────────────────┘

Validate theo dòng: chạy validate template lên từng phần tử; lỗi gắn theo (key, index, fieldId).
Submit: gom lại thành mảng object.
```

Điểm cần lưu ý:
- Renderer phải **đệ quy** (render component con của mỗi dòng) → thiết kế renderer dạng
  `renderComponent(comp, scopedData, onChange)` để tái dùng cho cả cấp gốc lẫn trong dòng.
- Biểu thức FEEL trong dòng cần context **cục bộ của dòng** (đôi khi cả context gốc) — quyết
  định phạm vi biến khi eval trong `dynamiclist` là điểm dễ sai, cần test kỹ.

## 7. Validate & submit

Đọc `component.validate` của form-js và ánh xạ:

| form-js validate | Hành vi |
|---|---|
| `required: true` | bắt buộc (chỉ áp cho trường **visible**) |
| `minLength` / `maxLength` | độ dài chuỗi |
| `min` / `max` | biên số |
| `pattern` | regex |
| `validationType` (email/phone…) | rule dựng sẵn |

`submit()` chạy một pass validate trên **tập component đang visible**:

```ts
submit(): FormSubmitResult {
  const visible = components.filter(c => !isHidden(c))
  const errors = {}
  for (const c of visible.filter(c => c.key)) {
    const msg = validateField(c, valueOf(c))     // required/min/max/pattern...
    if (msg) errors[c.id] = msg
  }
  // data: chỉ gồm key của component visible (loại trường ẩn khỏi payload)
  const data = pickVisibleData(components, formData)
  return { data, errors }
}
```

→ Khớp nguyên hợp đồng cũ; `TaskFormModal` và `buildYKien(res.data)` không phải đổi.

## 8. Lộ trình theo lát cắt

| Lát | Nội dung | Kết quả nhìn thấy | Phụ thuộc |
|---|---|---|---|
| **1** | Renderer AntD cho **trường phẳng** + validate + submit khớp `FormRendererHandle`. Thay `FormRenderer` trong TaskFormModal & preview của FormDesigner. | KH thấy eForm đồng bộ AntD ngay; phủ phần lớn seed hiện tại | không |
| **2** | Cắm `feelin`: **① conditional** + **② computed** (readonly). | Ẩn/hiện & tự tính | Lát 1 |
| **3** | **③ `dynamiclist`** → editable table + validate theo dòng + render đệ quy. | Bảng động | Lát 1–2 |
| sau | `filepicker`→Upload (cần backend lưu file), `html/iframe` (nếu cần, có sanitize). | | Foundation backend |

Nguyên tắc: sau mỗi lát, **kiểm chứng end-to-end** trên luồng Phê duyệt thật (mở
TaskFormModal từ Chi tiết hồ sơ, điền, Xác nhận, thấy trạng thái hồ sơ đổi) — không chỉ
xem preview.

## 9. Rủi ro & điểm mở

- **R1 — Độ phủ FEEL:** `feelin` cài đặt FEEL của bpmn-io; cần đối chiếu tập biểu thức mà
  builder cho phép admin nhập với tập `feelin` eval được. Rủi ro thấp vì cùng hệ bpmn-io,
  nhưng phải test các hàm hay dùng (số học, so sánh, `if/then/else`, list functions).
- **R2 — Phạm vi biến trong `dynamiclist`:** eval FEEL trong dòng cần đúng context (dòng vs
  gốc). Cần bộ test riêng.
- **R3 — Markdown của `text`:** cần chọn markdown renderer (marked/react-markdown) + sanitize.
- **R4 — Trôi khỏi builder:** builder form-js có thể sinh component/thuộc tính mà renderer AntD
  chưa map → cần **fallback an toàn** (render cảnh báo "component chưa hỗ trợ", không crash) và
  một checklist đồng bộ khi nâng cấp form-js.
- **R5 — File upload (`filepicker`)** phụ thuộc backend lưu trữ (chưa có — Foundation 1 chặn).
- **OQ1 — Có giữ song song FormRenderer form-js làm fallback** cho vài form quá phức tạp ở giai
  đoạn đầu không? (giảm rủi ro lát 3.)

## 10. Ảnh hưởng harness

Đây mới là **thiết kế**, chưa phải task delivery. Không mở feature code trong tài liệu này.
Khi bắt tay implement: đây là công việc **frontend mock** (chưa chạm backend), cần đưa vào
`active-task.md` như một task có phạm vi rõ (theo lát), và tôn trọng các decision đã lock
(D3 Camunda boundary, D10 Nút-là-quyết-định — renderer không được suy outcome từ form).

---

## Phụ lục A — Mạch trò chuyện & quyết định

Ghi lại theo yêu cầu "lưu cả nội dung cuộc trò chuyện". Tóm lược trung thực chuỗi hỏi–đáp
dẫn tới thiết kế trên.

### A.1 — eForm hoạt động thế nào (Nút → Action → Form → đổi trạng thái)

**Hỏi:** Gắn form PHE_DUYET vào nút Phê duyệt; khi người dùng hoàn tất form và ĐỒNG Ý thì hệ
thống làm sao biết để gọi API xuống BE và chuyển trạng thái hồ sơ?

**Đáp (chốt lại nhận thức):**
- Theo quyết định **D10**, **Nút chính là quyết định (outcome)**, không phải trường trong form.
  Một bước phê duyệt có 3 nút độc lập: `APPROVE_STEP` / `RETURN_STEP` / `REJECT_STEP`
  ([actionRegistry.ts](../../webapp/src/data/actionRegistry.ts)). Form chỉ là **dữ liệu hỗ trợ**
  (ý kiến), không chứa trường "kết luận" — tránh encode kết luận 2 lần.
- "Gắn form vào nút" thực chất là **binding qua `formKey`** trong
  [ActionAvailabilityPolicy](../../webapp/src/data/actionAvailabilityPolicy.ts) (quan hệ
  1 eForm : n Action; `formKey` tham chiếu thư viện, không nhúng schema).
- Chuỗi khi bấm "Đồng ý" + Xác nhận: nút mang `outcome`+`formKey` → `TaskFormModal` submit &
  validate form → điều hướng **theo `outcome` của nút** (`approveStep`/`returnStep`/`rejectStep`)
  → đích bước kế tra từ [stepRouting.ts](../../webapp/src/data/stepRouting.ts) (mock của gateway
  BPMN) → [DossierContext](../../webapp/src/store/DossierContext.tsx) đổi trạng thái bước & hồ sơ.
- Hiện tại là **mock thuần frontend**; khi có BE thật ánh xạ 1-1 sang Camunda: complete user task
  kèm biến `outcome` → gateway BPMN chọn nhánh → job worker BE cập nhật **DB nghiệp vụ** (không
  ghi business data vào Camunda — decision D3). Backend/Camunda model **chưa chốt** (Foundation 1).

### A.2 — Có nên tự xây Form Builder? Feasibility

**Hỏi:** KH than eForm render bằng form-js xấu. Muốn tự xây module Form Builder và vẫn gắn được
eForm vào Task/Action — khả thi không?

**Đáp:** Khả thi, và binding **gần như không bị ảnh hưởng** vì nó chỉ là chuỗi `formKey`. Tách 3
lớp: **Builder** (FormDesigner) / **Renderer** (FormRenderer — chỗ "xấu") / **Binding** (formKey).
Đưa 3 hướng: (A) re-skin CSS; (B) **giữ schema form-js, tự viết renderer AntD**; (C) tự định
nghĩa schema + builder + renderer riêng (đắt, mất tương thích Camunda Form). Khuyến nghị **Hướng B**.

### A.3 — Làm rõ mức độ "xấu" và các năng lực form

**Hỏi:** (1) "Xấu" ở mức nào? (2) Khác biệt giữa form phẳng và form cần điều kiện/tính toán/bảng
động là gì?

**Đáp của người dùng:** (1) Ở mức **"không đồng bộ với app AntD"** → cần Hướng B.

**Giải thích ①②③** (kèm ví dụ KHCN):
- ① Conditional: ô "Lý do" chỉ hiện khi chọn "Chưa đạt".
- ② Computed: `tongDuToan` = tổng các PL, readonly; `soThang` = tính từ ngày.
- ③ Dynamic table: danh sách thành viên/sản phẩm số dòng tùy đề tài.
- Ý nghĩa chi phí: form phẳng → renderer rẻ; cần ①②③ → phải có **engine reactivity** (thứ form-js
  cho không). Nhưng có thể **tái dùng `feelin`** cho biểu thức và schema form-js đã mô hình hóa
  sẵn ①②③.

### A.4 — Quyết định & yêu cầu tài liệu

**Người dùng đánh giá: cần cả ①②③.**

**Đáp:** Cần ①②③ = cần một *form engine*, không chỉ renderer. Nhưng 2 thứ đắt nhất tái dùng được:
**`feelin`** (FEEL engine — đã cài `^7.0.1`) và **schema form-js** (đã có `conditional`/`expression`/
`dynamiclist`). Còn đúng 2 hướng thật: **B-engine** (giữ form-js schema+builder, tự viết runtime
renderer AntD + feelin) vs **Formily** (engine có sẵn nhưng thay builder + đổi schema + mất tương
thích). Yếu tố quyết định = **builder**: dự án đã dựng FormDesigner custom → **chọn B-engine**.

**Người dùng yêu cầu:** phác kiến trúc B-engine + lưu lại cuộc trò chuyện → chính là tài liệu này.

### A.5 — Quyết định đã lock: **D12**

> Ghi chú: đề xuất ban đầu gọi là "D11" nhưng mã đó đã dùng cho refactor RBAC scope-overlay,
> nên quyết định eForm được ghi là **D12** trong `.harness/state/decisions.md` (2026-07-09).

1. eForm giữ **JSON schema form-js** làm data contract (không đổi định dạng).
2. Thay **runtime renderer** bằng AntD (`AntFormRenderer`), giữ interface `FormRendererHandle`.
3. Tái dùng **`feelin`** cho ① conditional + ② computed; `dynamiclist` → editable table cho ③.
4. **Giữ nguyên** builder form-js, FormContext, seed, binding `formKey`, TaskFormModal.
5. Triển khai **theo 3 lát cắt** (phẳng → engine → bảng động).

> Khi được đồng ý, chuyển các mục trên vào `.harness/state/decisions.md` (đề xuất mã **D11**)
> và mở task ở `active-task.md`.

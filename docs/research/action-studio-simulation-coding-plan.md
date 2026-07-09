# Action Studio – Tab Mô phỏng: Kế hoạch Coding

**Ngày lập**: 2026-07-08
**Plan gốc**: `docs/research/action-studio-simulation-ui-upgrade-plan.md`
**Trạng thái harness**: Frontend-mock carve-out (cùng loại D10/D11/EPIC06/Integration screen) — nâng cấp module đã built, không chạm F1 blocker.

---

## Tổng quan

Nâng cấp tab "Mô phỏng" (`InspectorTab`) trong `webapp/src/pages/ActionStudio.tsx` từ "debug API inspector" thành "phòng thử nghiệp vụ". File chính cần sửa:

| File                                            | Vai trò                                                                    |
| ----------------------------------------------- | -------------------------------------------------------------------------- |
| `webapp/src/pages/ActionStudio.tsx`             | Tab Mô phỏng hiện tại (component `InspectorTab`, ~200 dòng) + các tab khác |
| `webapp/src/components/SimulatorPreview.tsx`    | **MỚI** — Preview action dạng button runtime (Đợt 2)                       |
| `webapp/src/components/ActionExplainDrawer.tsx` | **MỚI** — Drawer giải thích quyết định hiển thị (Đợt 3)                    |
| `webapp/src/components/SimulatorPresets.tsx`    | **MỚI** — Preset & kịch bản kiểm thử (Đợt 4)                               |
| `webapp/src/components/SimulatorCompare.tsx`    | **MỚI** — So sánh 2 context & regression (Đợt 5)                           |
| `webapp/src/data/actionAvailability.ts`         | **SỬA** — Thêm `getDebugActions()` trả về cả action bị loại + lý do        |
| `webapp/src/data/simulatorPresets.ts`           | **MỚI** — Preset & kịch bản lưu local (Đợt 4)                              |

**Nguyên tắc**: UI vẫn render từ `getAvailableActions`, không tự quyết định. Tái dùng `ACTION_REGISTRY`, `ACTION_PRESENTATIONS`, `ACTION_AVAILABILITY_POLICIES`, `EXCEPTION_POLICIES`.

---

## Đợt 1 — Làm rõ luồng mô phỏng (Slice A–C)

**Mục tiêu**: Người dùng hiểu mình đang mô phỏng cái gì trong 5 giây đầu.

### Slice A — Chia form input thành 3 card ngữ cảnh

Sửa `InspectorTab`: thay 1 card dài `Ngữ cảnh gọi API` thành 3 card nhỏ:

1. **Card "Ngữ cảnh hồ sơ"**: `surface`, `processCode`, `dossierStatus`, `taskDefinitionKey` (đổi sang Select), `cap`
2. **Card "Ngữ cảnh người dùng"**: `roleCodes`, `perms`, `isAdmin`
3. **Card "Điều kiện Chi tiết"**: `canRequestOnCurrentStep`, `hasExceptionTargets`, `hasActiveException`

### Slice B — Summary bar

Thêm `Alert`/`Tag` row ở đầu kết quả mô phỏng:

```
RD01.01 / Đang xử lý / Buớc t2 / CQ_KHCN / PROCESS_STEP
```

Format: `{processCode} / {dossierStatusLabel} / {taskLabel} / {primaryRole} / {primaryPerm}`

### Slice C — Dropdown task thay Input text

- Đọc `seedProcesses` → `processByCode(processCode)?.taskSteps` → map ra options `{value: step.key, label: step.ten}`
- Khi đổi `processCode` → reset `taskDefinitionKey` về `undefined`
- Giữ allowClear để mô phỏng không pin theo bước

### Slice D — Thu gọn Alert hướng dẫn

- Alert hướng dẫn dài → collapse mặc định, chỉ hiện 1 dòng tóm tắt
- Có nút "Xem hướng dẫn" để expand

**Verify**: `npm run build` xanh. Mở tab Mô phỏng → thấy 3 card, summary bar, task là dropdown.

---

## Đợt 2 — Preview giống runtime thật (Slice E–G)

**Mục tiêu**: Người dùng nhìn kết quả như đang ở màn chi tiết hồ sơ.

### Slice E — Component `SimulatorPreview`

Tạo `webapp/src/components/SimulatorPreview.tsx`:

- Nhận `actions: AvailableAction[]`
- Render button thay vì Tag:
  - **PRIMARY actions**: `Button` nổi bật (primary/danger/default theo `tone`), có icon
  - **MORE actions**: Gom vào dropdown `Dropdown` "Thao tác khác ▾"
  - **EXCEPTION actions**: Vùng riêng, viền cảnh báo (volcano/dashed border)
- Action disabled: vẫn hiện button nhưng `disabled` + tooltip lý do ngắn
- Hiển thị metadata quan trọng ngay trên/bên cạnh action:
  - `requiresReason` → badge "Cần lý do"
  - `requiresEvidence` → badge "Cần căn cứ"
  - `requiresConfirm` → badge "Cần xác nhận"
  - `formKey` → icon + tên form

### Slice F — Đưa payload JSON vào tab phụ

- Trong card kết quả: thêm `Tabs` nhỏ: "Xem trước giao diện" (mặc định) | "Payload API"
- Tab Payload API chứa `<pre>` JSON như cũ

### Slice G — Wire vào InspectorTab

- Thay vùng render Tag hiện tại bằng `<SimulatorPreview actions={actions} />`
- Giữ Empty state khi không có action nào

**Verify**: `npm run build` xanh. Mở tab Mô phỏng → thấy button thật, dropdown "Thao tác khác", tab Payload API.

---

## Đợt 3 — Giải thích quyết định hiển thị (Slice H–J)

**Mục tiêu**: Admin biết vì sao kết quả đúng hoặc sai.

### Slice H — `getDebugActions()` trong `actionAvailability.ts`

Thêm hàm mới bên cạnh `getAvailableActions`:

```ts
export interface DebugAction extends AvailableAction {
  visible: boolean;
  hideReasons: string[]; // lý do bị ẩn (nếu !visible)
  matchedPolicyId?: string;
  roleCheck?: { required: string[]; held: string[]; match: boolean };
  permissionCheck?: { required: string[]; held: string[]; match: boolean };
}

export function getDebugActions(input: AvailableActionsInput): DebugAction[];
```

Khác biệt: **không filter** `.filter(({ decision }) => decision.visible)` — trả về TẤT CẢ action kể cả bị loại, kèm lý do. Dùng chung `resolveActionAvailability` → map `decision.reasons` vào `hideReasons`.

### Slice I — Component `ActionExplainDrawer`

Tạo `webapp/src/components/ActionExplainDrawer.tsx`:

- Mở từ nút "?" / "Tại sao?" trên mỗi action trong SimulatorPreview
- Hiển thị:
  - `actionCode`, `actionName`
  - `matchedPolicyId` + `conditionExpression`
  - `formKey`
  - Role check: required vs held
  - Permission check: required vs held
  - Exception policy áp dụng (nếu là EXCEPTION)
  - Trạng thái: ✅ Hiển thị & bấm được | ⚠️ Hiển thị nhưng bị khoá | ❌ Không hiển thị

### Slice J — Nhóm "Không hiển thị"

Trong `SimulatorPreview`, thêm section "Không hiển thị" (chỉ khi debug mode):

- Hiển thị các action `!visible` từ `getDebugActions()`
- Mỗi action: label mờ + lý do ngắn (vd: "Sai surface", "Thiếu quyền PROCESS_STEP", "Không có policy")
- Có toggle để ẩn/hiện nhóm này
- Chỉ hiện khi `isAdmin=true` hoặc có flag debug

**Verify**: `npm run build` xanh. Bật debug → thấy action bị ẩn kèm lý do; bấm "?" → drawer giải thích.

---

## Đợt 4 — Preset & kịch bản kiểm thử (Slice K–M)

**Mục tiêu**: Test nhanh các luồng phổ biến, giảm thao tác lặp lại.

### Slice K — Data layer `simulatorPresets.ts`

Tạo `webapp/src/data/simulatorPresets.ts`:

```ts
export interface SimulatorPreset {
  id: string;
  label: string;
  description: string;
  surface: ActionSurface;
  processCode: string;
  dossierStatus: DossierStatus;
  taskDefinitionKey?: string;
  cap: Cap;
  roleCodes: string[];
  perms: string[];
  isAdmin: boolean;
  hasExceptionTargets: boolean;
  canRequestOnCurrentStep: boolean;
  hasActiveException: boolean;
}

export const BUILT_IN_PRESETS: SimulatorPreset[] = [
  {
    id: "nguoi-nop",
    label: "Người nộp hồ sơ",
    description: "Chủ nhiệm đề tài nộp hồ sơ RD01.01",
    surface: "DOSSIER_DETAIL",
    processCode: "RD01.01",
    dossierStatus: "draft",
    taskDefinitionKey: "t1",
    cap: "Cơ sở",
    roleCodes: ["CN", "PM"],
    perms: ["SUBMIT", "ADD_COMMENT", "DOWNLOAD_DOCUMENT"],
    isAdmin: false,
    hasExceptionTargets: true,
    canRequestOnCurrentStep: true,
    hasActiveException: false,
  },
  // ... thêm: chuyên-viên-xu-ly, lanh-dao-duyet, admin
];
```

### Slice L — Component `SimulatorPresets`

Tạo `webapp/src/components/SimulatorPresets.tsx`:

- Row ngang các nút preset ở đầu InspectorTab
- Bấm preset → set tất cả state context
- Nút "Reset về mặc định"
- Highlight preset đang active (nếu khớp)

### Slice M — Lưu kịch bản local

Trong `SimulatorPresets`:

- Nút "Lưu kịch bản hiện tại" → modal nhập tên → lưu vào `localStorage`
- Danh sách kịch bản đã lưu, có thể xoá
- Nút "Copy context" → copy JSON context vào clipboard (để báo lỗi / trao đổi với team)

**Verify**: `npm run build` xanh. Chọn preset → form tự điền; lưu kịch bản → reload trang vẫn còn.

---

## Đợt 5 — So sánh & regression UI (Slice N–P)

**Mục tiêu**: Biến tab mô phỏng thành công cụ kiểm thử cấu hình an toàn trước khi ban hành.

### Slice N — Component `SimulatorCompare`

Tạo `webapp/src/components/SimulatorCompare.tsx`:

- Layout 2 cột: Context A (trái) | Context B (phải)
- Mỗi bên có form context riêng (tái dùng card context từ Đợt 1)
- Có nút "Sao chép từ A → B"
- Kết quả hiển thị song song: action của A vs action của B
- Diff highlight: action xuất hiện/mất đi/thay đổi trạng thái giữa 2 bên

### Slice O — Expected results & assertion

Trong `SimulatorCompare`:

- Admin có thể đánh dấu expected result cho mỗi action:
  - ✅ Phải hiện
  - 🔒 Phải bị khoá
  - ❌ Không được hiện
- Khi kết quả thực tế lệch expected → cảnh báo đỏ
- Lưu expected results vào kịch bản (Đợt 4)

### Slice P — Regression runner

- Nút "Chạy tất cả kịch bản" → chạy `getDebugActions` cho từng kịch bản đã lưu
- Hiển thị bảng tổng kết: kịch bản nào pass/fail
- Fail → expand xem chi tiết action nào lệch expected

**Verify**: `npm run build` xanh. Lưu 2 kịch bản, chạy regression → bảng pass/fail.

---

## Thứ tự triển khai

```
Đợt 1 (Slice A–D) → Đợt 2 (Slice E–G) → Đợt 3 (Slice H–J) → Đợt 4 (Slice K–M) → Đợt 5 (Slice N–P)
```

Mỗi đợt độc lập, có thể dừng sau bất kỳ đợt nào cũng có giá trị. Đợt 1+2 là quan trọng nhất (chuyển từ debug → preview nghiệp vụ).

---

## Risk & giả định

| Risk                                                          | Mức độ | Giảm thiểu                                                         |
| ------------------------------------------------------------- | ------ | ------------------------------------------------------------------ |
| `getDebugActions` thay đổi contract của `getAvailableActions` | Thấp   | Hàm MỚI độc lập, không sửa hàm cũ                                  |
| Component mới phình to ActionStudio.tsx                       | Thấp   | Tách component riêng từng đợt; InspectorTab giữ role orchestration |
| Preset không khớp thực tế (role/permission demo)              | Thấp   | Ghi rõ "Demo preset", dùng đúng mock data hiện có                  |
| localStorage kịch bản không đồng bộ giữa các tab              | Thấp   | Dùng `window.addEventListener('storage', ...)` nếu cần             |

## Không làm trong kế hoạch này

- Backend `GET /dossiers/{id}/available-actions` thật (chờ F1)
- Persistence kịch bản lên server (chờ F1)
- Multi-tenant / multi-workspace simulator
- AI-assisted test generation từ kịch bản

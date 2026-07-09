# Kế hoạch nâng cấp UI — Tab "Phiên bản & Audit" màn Cấu hình Service Task

> **Ngày**: 2026-07-09 · **Người lập**: Claude Code (đọc mã nguồn, đối chiếu UI/UX review
> toàn app 2026-07-04, design-system.md, và coding plan service task 2026-07-09).
> **Phạm vi**: Tab `key="audit"` trong `pages/ServiceTaskConfig.tsx` + mở rộng data model
> + bổ sung component mới `ServiceTaskVersionDiff`.
> **Tham chiếu chéo**: Pattern version-audit của Rule (`rule-version-audit-coding-plan-2026-07-09.md`)
> đã triển khai timeline + diff + color action. Tab này cần nâng tương đương nhưng phù hợp
> với domain service task (có config version, binding, execution log).

---

## 0. TÓM TẮT ĐÁNH GIÁ

### 0.1 Điểm mạnh (giữ nguyên)

| # | Điểm | Ghi chú |
|---|------|---------|
| S1 | Có layout 2 cột rõ ràng: bên trái version, bên phải audit | Bố cục hợp lý, không cần thay đổi cấu trúc |
| S2 | Có filter definition cho cả 2 bảng | Dropdown lọc definition giúp drill-down theo tác vụ |
| S3 | Audit có `before`/`after` trong payload | Dù hiển thị chưa tốt, data model đã có sẵn diff |
| S4 | Version có `changeNote` | Mỗi version đều có ghi chú thay đổi |
| S5 | Có đầy đủ entity type trong audit | Definition, Version, Binding, ExecutionLog |

### 0.2 Khoảng trống & vấn đề

| # | Vấn đề | Mức | Tham chiếu |
|---|--------|-----|------------|
| **E0** | **Encoding tiếng Việt bị hỏng toàn bộ file** | **Nghiêm trọng** | config-tab plan §0.1 |
| V1 | Bảng version không có `scroll.y` → cuộn toàn trang, mất context | Cao | UX review 3.10 |
| V2 | Không có so sánh 2 phiên bản (diff) | Cao | Rule pattern đã có |
| V3 | Không có rollback/khôi phục phiên bản cũ | Trung bình | MVP có thể chỉ xem |
| V4 | Version status hiển thị là `<Tag>` plain, không có màu sắc ý nghĩa | Trung bình | — |
| V5 | Không hiển thị nội dung config của version (chỉ thấy changeNote) | Cao | Không biết version chứa gì |
| V6 | Không có timeline trực quan cho lịch sử phiên bản | Thấp | Nice-to-have |
| V7 | Không có thống kê: tổng version, active version, version cũ nhất/mới nhất | Thấp | — |
| V8 | Bảng version không sort được theo versionNo/ngày | Thấp | — |
| A1 | Audit payload chỉ hiển thị `Object.keys()` — không thấy giá trị thật | Cao | Mất thông tin diff |
| A2 | Không có filter theo thời gian (date range) | Cao | Không xem được audit trong khoảng |
| A3 | Không có filter theo actor (người thực hiện) | Trung bình | — |
| A4 | Không có filter theo action type | Trung bình | — |
| A5 | Không có color coding cho action | Trung bình | Rule pattern đã có |
| A6 | Không có link drill-down từ audit entry → entity thật | Trung bình | — |
| A7 | Seed audit entries quá ít (chỉ 4 dòng) → demo thiếu thuyết phục | Trung bình | — |
| A8 | Không có search text trong audit | Thấp | — |
| A9 | Audit table không có `scroll.y` | Cao | UX review 3.10 |
| A10 | Không export được audit trail | Thấp | Phase sau |

### 0.3 So sánh với pattern Rule Version & Audit

| Tiêu chí | Rule (đã làm) | Service Task (hiện tại) | Cần nâng? |
|----------|---------------|------------------------|-----------|
| Version timeline | ✅ Timeline + table | ❌ Chỉ table cơ bản | ✅ |
| Version diff | ✅ Drawer so sánh 2 version | ❌ Không có | ✅ |
| Audit color code | ✅ Màu theo action type | ❌ Một màu blue | ✅ |
| Audit filter actor | ✅ Có | ❌ Không có | ✅ |
| Audit filter time | ✅ Có | ❌ Không có | ✅ |
| Audit entity link | ✅ Click mở entity | ❌ Không có link | ✅ |
| Rollback | ❌ Không (MVP) | ❌ Không (MVP) | — |
| Seed đủ demo | ✅ 10+ entries | ❌ Chỉ 4 entries | ✅ |

---

## 1. HIỆN TRẠNG CHI TIẾT

### 1.1 Cấu trúc UI hiện tại

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Tab: [...Kiểm thử] [Log thực thi] [Phiên bản & audit]                   │
├──────────────────────────────────────────────────────────────────────────┤
│  Row gutter=[12,12]                                                      │
│  ┌─────────────────────────┬──────────────────────────────────────────┐  │
│  │ Col lg=10               │ Col lg=14                                │  │
│  │ Card "Lịch sử phiên bản"│ Card "Audit trail"                       │  │
│  │ ┌─────────────────────┐ │ ┌──────────────────────────────────────┐ │  │
│  │ │ Filter: [Def ▾]     │ │ │ Table:                               │ │  │
│  │ ├─────────────────────┤ │ │ Thời điểm | Action | Entity | Actor  │ │  │
│  │ │ Table:              │ │ │ Version | Lý do | Payload (keys)     │ │  │
│  │ │ Def | Ver | Status  │ │ │                                      │ │  │
│  │ │ Người tạo | Ghi chú │ │ │ Pagination: pageSize=8               │ │  │
│  │ │                     │ │ │ scroll.x=980                         │ │  │
│  │ │ Pagination: pSize=6 │ │ └──────────────────────────────────────┘ │  │
│  │ │ scroll.x=820        │ │                                          │  │
│  │ └─────────────────────┘ │                                          │  │
│  └─────────────────────────┴──────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Data model hiện tại

```ts
// ĐÃ CÓ trong serviceTasks.ts:
interface ServiceTaskConfigVersion {
  id: string
  serviceTaskDefinitionId: string
  versionNo: number
  configJson: ServiceTaskExecutionConfig
  inputMapping: ServiceTaskInputMapping[]
  outputMapping: ServiceTaskOutputMapping[]
  errorPolicy: ServiceTaskErrorPolicy
  status: ServiceTaskConfigVersionStatus  // DRAFT | READY | ACTIVE | ARCHIVED | ERROR
  changeNote: string
  createdBy: string
  createdAt: string
}

interface ServiceTaskAuditEntry {
  id: string
  action: ServiceTaskAuditAction  // 12 action types
  entityType: 'ServiceTaskDefinition' | 'ServiceTaskConfigVersion' | 'ServiceTaskBinding' | 'ServiceTaskExecutionLog'
  entityId: string
  actor: string
  at: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  reason?: string
  configVersionNo?: number
}
```

### 1.3 Seed data hiện tại

**Versions** (4 bản):
- `stv-notify-approved-v1` — ACTIVE, thông báo phê duyệt
- `stv-sync-sap-v2` — ACTIVE, đồng bộ SAP
- `stv-update-approved-v1` — READY, cập nhật hồ sơ
- `stv-generate-acceptance-v1` — ACTIVE, sinh QĐ công nhận
- `stv-evaluate-rd02-v1` — DRAFT, gọi DMN định tuyến

**Audit entries** (4 dòng):
- `sta-001`: CREATE_DEFINITION std-sync-sap-budget
- `sta-002`: ACTIVATE_VERSION stv-sync-sap-v2
- `sta-003`: BIND_TASK stb-rd0303-sap
- `sta-004`: TEST_CONFIG stv-generate-acceptance-v1

### 1.4 Biến state trong ServiceTaskConfig.tsx

```ts
// ĐÃ CÓ:
const [auditDefinitionFilter, setAuditDefinitionFilter] = useState<string | undefined>()

// Derived:
const versionRows = serviceTasks.versions.filter((version) =>
  auditDefinitionFilter ? version.serviceTaskDefinitionId === auditDefinitionFilter : true,
)
const auditEntityIds = new Set([...])
const filteredAuditEntries = serviceTasks.auditEntries.filter((entry) =>
  auditDefinitionFilter ? auditEntityIds.has(entry.entityId) : true,
)
```

---

## 2. LAYOUT ĐỀ XUẤT SAU NÂNG CẤP

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Tab: [...Kiểm thử] [Log thực thi] [Phiên bản & audit]                       │
├──────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────────────┐│
│  │ Summary bar: [Tổng: 5 version] [Active: 3] [Audit: 12 mục]              ││
│  │              Filter: [Definition ▾] [Actor ▾] [Từ ngày 📅] [Đến 📅]      ││
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  Row gutter=[12,12]                                                          │
│  ┌────────────────────────────┬─────────────────────────────────────────────┐│
│  │ Col lg=10                  │ Col lg=14                                   ││
│  │ Card "Lịch sử phiên bản"   │ Card "Audit trail"                          ││
│  │ ┌────────────────────────┐ │ ┌─────────────────────────────────────────┐ ││
│  │ │ [So sánh] khi chọn 2   │ │ │ Filter row: [Action ▾] [Search...]      │ ││
│  │ ├────────────────────────┤ │ ├─────────────────────────────────────────┤ ││
│  │ │ Table (scroll.y=380):  │ │ │ Table (scroll.y=380):                   │ ││
│  │ │ ☐ | Def | vNo | Status │ │ │ 🕐 | Action (màu) | Entity (link)      │ ││
│  │ │ Người tạo | Ngày | 📝  │ │ │ Actor | vNo | Lý do | Diff (inline)    │ ││
│  │ │                        │ │ │                                         │ ││
│  │ │ Click row → Drawer     │ │ │ Click row → Drawer chi tiết audit       │ ││
│  │ │ xem chi tiết version   │ │ │ (đầy đủ before/after JSON)             │ ││
│  │ └────────────────────────┘ │ └─────────────────────────────────────────┘ ││
│  └────────────────────────────┴─────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. KẾ HOẠCH THỰC HIỆN

### Đợt 0 — Tiền đề (bắt buộc, làm đầu tiên)

| # | Việc | Effort | File |
|---|------|--------|------|
| 0.1 | Chạy script Node.js khôi phục encoding UTF-8 cho toàn file `ServiceTaskConfig.tsx` | Nhỏ | ServiceTaskConfig.tsx |
| 0.2 | Verify: `npm run typecheck` sạch, chữ Việt đúng | Nhỏ | — |

### Đợt 1 — Data model & seed mở rộng

| # | Việc | Effort | File |
|---|------|--------|------|
| 1.1 | Thêm `VERSION_STATUS_META` (color map cho version status) | Rất nhỏ | serviceTasks.ts |
| 1.2 | Thêm `AUDIT_ACTION_META` (label + color map cho audit action) | Nhỏ | serviceTasks.ts |
| 1.3 | Seed thêm 8-10 audit entries đa dạng action/actor/thời điểm | Vừa | serviceTasks.ts |
| 1.4 | Seed thêm 3-4 version mới (tạo version chain: v1→v2→v3 cho 1 definition) | Vừa | serviceTasks.ts |
| 1.5 | Bổ sung `before`/`after` chi tiết vào audit entries (có giá trị thật, không chỉ keys) | Nhỏ | serviceTasks.ts |

### Đợt 2 — Nâng cấp bảng "Lịch sử phiên bản"

| # | Việc | Effort | File |
|---|------|--------|------|
| 2.1 | Thêm `scroll={{ y: 380 }}` cho bảng version | Rất nhỏ | ServiceTaskConfig.tsx |
| 2.2 | Thêm `sorter` cho cột versionNo, createdAt | Nhỏ | ServiceTaskConfig.tsx |
| 2.3 | Cột Status: thay `<Tag>` plain bằng `StatusTag` hoặc `<Tag color={...}>` theo status | Nhỏ | ServiceTaskConfig.tsx |
| 2.4 | Thêm cột "Ngày tạo" (createdAt) vào bảng version | Nhỏ | ServiceTaskConfig.tsx |
| 2.5 | Thêm row selection (checkbox) để chọn 2 version so sánh | Vừa | ServiceTaskConfig.tsx |
| 2.6 | Thêm nút "So sánh" trên card header, chỉ enable khi chọn đúng 2 version | Vừa | ServiceTaskConfig.tsx |
| 2.7 | Click row → mở drawer xem chi tiết version (config, mapping, errorPolicy dạng JSON) | Vừa | ServiceTaskConfig.tsx |
| 2.8 | Thêm `showSizeChanger` + `showTotal` cho pagination | Rất nhỏ | ServiceTaskConfig.tsx |

### Đợt 3 — Component mới: ServiceTaskVersionDiff

| # | Việc | Effort | File |
|---|------|--------|------|
| 3.1 | Tạo `ServiceTaskVersionDiff.tsx` — drawer so sánh 2 version | Vừa | components/ |
| 3.2 | Hiển thị 2 cột: version cũ (trái) / version mới (phải) | Vừa | components/ |
| 3.3 | So sánh: config type, inputMapping, outputMapping, errorPolicy, changeNote | Vừa | components/ |
| 3.4 | Highlight field thay đổi (diff visual: màu xanh/thêm, đỏ/xóa, vàng/sửa) | Vừa | components/ |
| 3.5 | Export JSON diff summary | Thấp | components/ |

### Đợt 4 — Nâng cấp bảng "Audit trail"

| # | Việc | Effort | File |
|---|------|--------|------|
| 4.1 | Thêm `scroll={{ y: 380 }}` cho bảng audit | Rất nhỏ | ServiceTaskConfig.tsx |
| 4.2 | Cột Action: thay `<Tag color="blue">` bằng màu theo `AUDIT_ACTION_META` | Nhỏ | ServiceTaskConfig.tsx |
| 4.3 | Cột Entity: thêm link drill-down (click → mở drawer chi tiết entity) | Vừa | ServiceTaskConfig.tsx |
| 4.4 | Cột Payload: thay `Object.keys()` bằng inline diff tóm tắt (vd: "+2 fields, -1 field") | Vừa | ServiceTaskConfig.tsx |
| 4.5 | Thêm filter bar: Action dropdown, Actor search, DateRange picker | Vừa | ServiceTaskConfig.tsx |
| 4.6 | Thêm state: `auditActionFilter`, `auditActorFilter`, `auditDateRange` | Nhỏ | ServiceTaskConfig.tsx |
| 4.7 | Thêm `showSizeChanger` + `showTotal` cho pagination | Rất nhỏ | ServiceTaskConfig.tsx |
| 4.8 | Bổ sung cột "Entity ID" để search/filter chính xác | Nhỏ | ServiceTaskConfig.tsx |

### Đợt 5 — Summary bar & cross-link

| # | Việc | Effort | File |
|---|------|--------|------|
| 5.1 | Thêm summary bar đầu tab: tổng version, active, audit count | Nhỏ | ServiceTaskConfig.tsx |
| 5.2 | Thêm filter definition dùng chung cho cả 2 bảng (đã có, tinh chỉnh) | Nhỏ | ServiceTaskConfig.tsx |
| 5.3 | Link 2 chiều: từ version → audit entries liên quan, từ audit → version | Vừa | ServiceTaskConfig.tsx |
| 5.4 | Drawer audit detail: hiển thị before/after dạng JSON formatted | Nhỏ | ServiceTaskConfig.tsx |

---

## 4. THIẾT KẾ CHI TIẾT

### 4.1 VERSION_STATUS_META (mới)

```ts
export const VERSION_STATUS_META: Record<
  ServiceTaskConfigVersionStatus,
  { label: string; color: string }
> = {
  DRAFT: { label: 'Nháp', color: 'default' },
  READY: { label: 'Sẵn sàng', color: 'blue' },
  ACTIVE: { label: 'Đang dùng', color: 'green' },
  ARCHIVED: { label: 'Đã lưu trữ', color: 'default' },
  ERROR: { label: 'Lỗi', color: 'red' },
}
```

### 4.2 AUDIT_ACTION_META (mới)

```ts
export const AUDIT_ACTION_META: Record<
  ServiceTaskAuditAction,
  { label: string; color: string }
> = {
  CREATE_DEFINITION: { label: 'Tạo mới', color: 'green' },
  UPDATE_DEFINITION: { label: 'Cập nhật', color: 'blue' },
  DUPLICATE_DEFINITION: { label: 'Nhân bản', color: 'cyan' },
  SAVE_VERSION: { label: 'Lưu phiên bản', color: 'purple' },
  VALIDATE_VERSION: { label: 'Xác thực', color: 'geekblue' },
  ACTIVATE_VERSION: { label: 'Kích hoạt', color: 'green' },
  DEPRECATE_DEFINITION: { label: 'Ngừng dùng', color: 'orange' },
  BIND_TASK: { label: 'Gắn task', color: 'lime' },
  UNBIND_TASK: { label: 'Bỏ gắn task', color: 'volcano' },
  TEST_CONFIG: { label: 'Kiểm thử', color: 'gold' },
  RETRY_EXECUTION: { label: 'Thử lại', color: 'orange' },
  MANUAL_RESOLVE: { label: 'Xử lý tay', color: 'magenta' },
}
```

### 4.3 Seed data mở rộng

#### Version chain mới (cho `std-notify-approved`):

```ts
// Thêm 2 version nữa cho std-notify-approved để có chain v1 → v2 → v3:
{
  id: 'stv-notify-approved-v2',
  serviceTaskDefinitionId: 'std-notify-approved',
  versionNo: 2,
  configJson: {
    typeCode: 'SEND_NOTIFICATION',
    templateCode: 'tpl-dossier-approved-v2',
    channels: ['email', 'in_app', 'sms'],  // ← thêm SMS
    recipientExpression: '${variables.nextApproverEmail}',
    subjectExpression: 'Hồ sơ ${dossier.id} đã được phê duyệt',
  },
  inputMapping: [...],  // thêm 1 field
  outputMapping: [...],
  errorPolicy: { ...DEFAULT_ERROR_POLICY, maxRetry: 3 },  // ← tăng retry
  status: 'ARCHIVED',
  changeNote: 'Thêm kênh SMS, tăng retry lên 3.',
  createdBy: 'admin',
  createdAt: '2026-07-01 14:20',
},
{
  id: 'stv-notify-approved-v3',
  serviceTaskDefinitionId: 'std-notify-approved',
  versionNo: 3,
  configJson: {
    typeCode: 'SEND_NOTIFICATION',
    templateCode: 'tpl-dossier-approved-v3',
    channels: ['email', 'in_app', 'sms', 'zalo'],  // ← thêm Zalo
    recipientExpression: '${variables.approverList}',
    subjectExpression: '[QTKHCN] Hồ sơ ${dossier.id} - Phê duyệt',
  },
  inputMapping: [...],  // đổi recipient expression
  outputMapping: [...],
  errorPolicy: { ...DEFAULT_ERROR_POLICY, maxRetry: 3 },
  status: 'ACTIVE',
  changeNote: 'Thêm kênh Zalo, gửi danh sách người nhận.',
  createdBy: 'pm01',
  createdAt: '2026-07-05 09:30',
},
```

#### Audit entries mở rộng (thêm ~10 dòng):

```ts
// Đa dạng actor, thời điểm, action:
{ action: 'CREATE_DEFINITION', entityType: 'ServiceTaskDefinition', entityId: 'std-notify-approved', actor: 'admin', at: '2026-07-01 08:00', after: { code: 'NOTIFY_APPROVED', typeCode: 'SEND_NOTIFICATION' } },
{ action: 'SAVE_VERSION', entityType: 'ServiceTaskConfigVersion', entityId: 'stv-notify-approved-v1', actor: 'admin', at: '2026-07-01 08:45', configVersionNo: 1, reason: 'Bản đầu.' },
{ action: 'ACTIVATE_VERSION', entityType: 'ServiceTaskConfigVersion', entityId: 'stv-notify-approved-v1', actor: 'admin', at: '2026-07-01 09:00', configVersionNo: 1, reason: 'Active sau test.' },
{ action: 'BIND_TASK', entityType: 'ServiceTaskBinding', entityId: 'stb-rd0101-notify', actor: 'admin', at: '2026-07-01 09:05', configVersionNo: 1 },
{ action: 'SAVE_VERSION', entityType: 'ServiceTaskConfigVersion', entityId: 'stv-notify-approved-v2', actor: 'admin', at: '2026-07-01 14:20', configVersionNo: 2, reason: 'Thêm SMS, tăng retry.' },
{ action: 'ACTIVATE_VERSION', entityType: 'ServiceTaskConfigVersion', entityId: 'stv-notify-approved-v2', actor: 'admin', at: '2026-07-01 14:30', configVersionNo: 2, reason: 'Active v2 thay v1.' },
{ action: 'SAVE_VERSION', entityType: 'ServiceTaskConfigVersion', entityId: 'stv-notify-approved-v3', actor: 'pm01', at: '2026-07-05 09:30', configVersionNo: 3, reason: 'Thêm Zalo.' },
{ action: 'ACTIVATE_VERSION', entityType: 'ServiceTaskConfigVersion', entityId: 'stv-notify-approved-v3', actor: 'pm01', at: '2026-07-05 09:45', configVersionNo: 3, reason: 'Active v3.' },
{ action: 'RETRY_EXECUTION', entityType: 'ServiceTaskExecutionLog', entityId: 'stel-033-sap', actor: 'admin', at: '2026-07-02 14:10', configVersionNo: 2, reason: 'Retry lần 2.' },
{ action: 'MANUAL_RESOLVE', entityType: 'ServiceTaskExecutionLog', entityId: 'stel-033-sap', actor: 'admin', at: '2026-07-02 14:30', configVersionNo: 2, reason: 'SAP đã hồi phục, xử lý tay OK.' },
{ action: 'TEST_CONFIG', entityType: 'ServiceTaskConfigVersion', entityId: 'stv-update-approved-v1', actor: 'pm01', at: '2026-07-06 10:00', configVersionNo: 1, reason: 'Test mapping cập nhật hồ sơ.' },
{ action: 'VALIDATE_VERSION', entityType: 'ServiceTaskConfigVersion', entityId: 'stv-evaluate-rd02-v1', actor: 'admin', at: '2026-07-08 16:00', configVersionNo: 1, reason: 'Validate trước khi active.' },
```

### 4.4 Component ServiceTaskVersionDiff

```tsx
// Props:
interface ServiceTaskVersionDiffProps {
  open: boolean
  leftVersion: ServiceTaskConfigVersion    // version cũ
  rightVersion: ServiceTaskConfigVersion   // version mới
  leftDefinition?: ServiceTaskDefinition
  rightDefinition?: ServiceTaskDefinition
  onClose: () => void
}

// Layout: Drawer width=900, 2 cột scroll đồng bộ
// ┌──────────────────────────────────────────────┐
// │ So sánh phiên bản                             │
// │ v1 (cũ) ← → v3 (mới)                         │
// ├────────────────────┬─────────────────────────┤
// │ Cấu hình           │ Cấu hình                │
// │ ┌────────────────┐ │ ┌─────────────────────┐ │
// │ │ typeCode:       │ │ │ typeCode:           │ │
// │ │ SEND_NOTIFI...  │ │ │ SEND_NOTIFI...      │ │
// │ │ channels:       │ │ │ channels:           │ │
// │ │ [email,in_app]  │ │ │ [email,in_app,sms,  │ │
// │ │                 │ │ │  zalo]  ⬅ added     │ │
// │ └────────────────┘ │ └─────────────────────┘ │
// ├────────────────────┼─────────────────────────┤
// │ Input mapping      │ Input mapping           │
// │ ...                │ ...                     │
// └────────────────────┴─────────────────────────┘

// Các section so sánh:
// 1. Metadata (status, createdBy, createdAt, changeNote)
// 2. configJson (JSON diff từng field)
// 3. inputMapping (so sánh theo target key)
// 4. outputMapping (so sánh theo sourcePath)
// 5. errorPolicy (từng field: timeoutMs, maxRetry, onFailure...)
```

### 4.5 Filter bar mới cho Audit

```tsx
// State mới trong ServiceTaskConfig.tsx:
const [auditActionFilter, setAuditActionFilter] = useState<ServiceTaskAuditAction | undefined>()
const [auditActorFilter, setAuditActorFilter] = useState<string | undefined>()
const [auditDateFrom, setAuditDateFrom] = useState<string | undefined>()
const [auditDateTo, setAuditDateTo] = useState<string | undefined>()
const [auditSearchText, setAuditSearchText] = useState('')

// Filter bar layout:
<Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
  <Col>
    <Select allowClear placeholder="Hành động" style={{ width: 180 }}
      value={auditActionFilter}
      options={Object.entries(AUDIT_ACTION_META).map(([value, meta]) => ({
        label: meta.label, value,
      }))}
      onChange={setAuditActionFilter} />
  </Col>
  <Col>
    <Select allowClear showSearch placeholder="Người thực hiện" style={{ width: 180 }}
      value={auditActorFilter}
      options={[...new Set(serviceTasks.auditEntries.map(e => e.actor))].map(a => ({ label: a, value: a }))}
      onChange={setAuditActorFilter} />
  </Col>
  <Col>
    <DatePicker placeholder="Từ ngày" style={{ width: 140 }}
      onChange={(d) => setAuditDateFrom(d?.format('YYYY-MM-DD'))} />
  </Col>
  <Col>
    <DatePicker placeholder="Đến ngày" style={{ width: 140 }}
      onChange={(d) => setAuditDateTo(d?.format('YYYY-MM-DD'))} />
  </Col>
  <Col>
    <Input.Search placeholder="Tìm kiếm..." style={{ width: 200 }}
      allowClear onSearch={setAuditSearchText} />
  </Col>
</Row>

// Filter logic:
const filteredAuditEntries = serviceTasks.auditEntries.filter((entry) => {
  if (auditDefinitionFilter && !auditEntityIds.has(entry.entityId)) return false
  if (auditActionFilter && entry.action !== auditActionFilter) return false
  if (auditActorFilter && entry.actor !== auditActorFilter) return false
  if (auditDateFrom && entry.at < auditDateFrom) return false
  if (auditDateTo && entry.at > auditDateTo + 'T23:59:59') return false
  if (auditSearchText) {
    const q = auditSearchText.toLowerCase()
    const haystack = [
      entry.action, entry.entityType, entry.entityId, entry.actor,
      entry.reason ?? '', String(entry.configVersionNo ?? ''),
    ].join(' ').toLowerCase()
    if (!haystack.includes(q)) return false
  }
  return true
})
```

### 4.6 Cột Payload mới (inline diff)

```tsx
{
  title: 'Thay đổi',
  dataIndex: 'before',
  width: 200,
  render: (_: unknown, row: ServiceTaskAuditEntry) => {
    if (!row.before && !row.after) return <Text type="secondary">-</Text>
    const beforeKeys = row.before ? Object.keys(row.before) : []
    const afterKeys = row.after ? Object.keys(row.after) : []
    const added = afterKeys.filter(k => !beforeKeys.includes(k))
    const removed = beforeKeys.filter(k => !afterKeys.includes(k))
    const changed = beforeKeys.filter(k => afterKeys.includes(k) &&
      JSON.stringify(row.before![k]) !== JSON.stringify(row.after![k]))
    return (
      <Space size={2} wrap>
        {added.length > 0 && <Tag color="green" style={{ fontSize: 10 }}>+{added.length}</Tag>}
        {removed.length > 0 && <Tag color="red" style={{ fontSize: 10 }}>-{removed.length}</Tag>}
        {changed.length > 0 && <Tag color="orange" style={{ fontSize: 10 }}>~{changed.length}</Tag>}
        {added.length === 0 && removed.length === 0 && changed.length === 0 && (
          <Text type="secondary" style={{ fontSize: 11 }}>không đổi</Text>
        )}
      </Space>
    )
  },
}
```

### 4.7 Cột Entity với link drill-down

```tsx
{
  title: 'Entity',
  dataIndex: 'entityType',
  width: 220,
  render: (entityType: string, row: ServiceTaskAuditEntry) => {
    let label = entityType
    let entityName = row.entityId
    // Tra cứu entity để lấy tên thân thiện
    if (entityType === 'ServiceTaskDefinition') {
      const def = serviceTasks.getDefinition(row.entityId)
      if (def) entityName = `${def.code} - ${def.name}`
    } else if (entityType === 'ServiceTaskConfigVersion') {
      const ver = serviceTasks.versions.find(v => v.id === row.entityId)
      if (ver) entityName = `v${ver.versionNo} · ${serviceTasks.getDefinition(ver.serviceTaskDefinitionId)?.code ?? ver.serviceTaskDefinitionId}`
    } else if (entityType === 'ServiceTaskBinding') {
      const bind = serviceTasks.bindings.find(b => b.id === row.entityId)
      if (bind) entityName = `${bind.processCode} / ${bind.taskDefinitionKey}`
    } else if (entityType === 'ServiceTaskExecutionLog') {
      const log = serviceTasks.executionLogs.find(l => l.id === row.entityId)
      if (log) entityName = `${log.processInstanceKey} · ${log.taskName}`
    }
    return (
      <Space direction="vertical" size={0}>
        <Text style={{ fontSize: 12 }}>{entityName}</Text>
        <Text type="secondary" style={{ fontSize: 11 }}>{entityType}</Text>
      </Space>
    )
  },
}
```

### 4.8 Summary bar

```tsx
// Đầu tab:
<Row gutter={[12, 8]} style={{ marginBottom: 16 }}>
  <Col>
    <StatCard title="Tổng phiên bản" value={versionRows.length} />
  </Col>
  <Col>
    <StatCard title="Đang active" value={versionRows.filter(v => v.status === 'ACTIVE').length} color="#1677ff" />
  </Col>
  <Col>
    <StatCard title="Audit entries" value={filteredAuditEntries.length} />
  </Col>
  <Col flex="auto" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
    <Space>
      <Select allowClear showSearch optionFilterProp="label"
        placeholder="Lọc definition" style={{ width: 260 }}
        value={auditDefinitionFilter}
        options={definitionOptions}
        onChange={setAuditDefinitionFilter} />
    </Space>
  </Col>
</Row>
```

---

## 5. THỨ TỰ TRIỂN KHAI KHUYẾN NGHỊ

```text
Đợt 0: Sửa encoding tiếng Việt
  → Đợt 1: Mở rộng data model & seed (AUDIT_ACTION_META, VERSION_STATUS_META, thêm entries)
  → Đợt 2: Nâng bảng version (scroll.y, sorter, status color, row selection, drawer detail)
  → Đợt 3: Component ServiceTaskVersionDiff (so sánh 2 version)
  → Đợt 4: Nâng bảng audit (scroll.y, action color, entity link, filter bar, payload diff)
  → Đợt 5: Summary bar & cross-link
```

Nếu cần demo sớm, có thể dừng sau Đợt 2: bảng version đã có scroll, sort, màu, và drawer detail — giá trị đã tăng rõ rệt.

---

## 6. ACCEPTANCE CRITERIA

- [ ] Tab hiển thị chữ Việt đúng (không còn lỗi encoding).
- [ ] Bảng version có scroll.y, không cuộn toàn trang.
- [ ] Version status hiển thị màu theo trạng thái (xanh=ACTIVE, xám=ARCHIVED...).
- [ ] Có thể chọn 2 version và mở drawer so sánh diff.
- [ ] Click row version → drawer xem chi tiết config/mapping/errorPolicy.
- [ ] Audit action hiển thị màu theo loại hành động.
- [ ] Có filter: action, actor, date range, search text.
- [ ] Cột "Thay đổi" hiển thị tóm tắt số field thêm/xóa/sửa.
- [ ] Cột Entity hiển thị tên thân thiện (không chỉ entityId).
- [ ] Summary bar hiển thị tổng version, active, audit count.
- [ ] Seed ít nhất 15 audit entries đa dạng.
- [ ] Seed ít nhất 7-8 versions với chain v1→v2→v3.
- [ ] `npm run build` xanh.

---

## 7. RISK & GIẢM THIỂU

| Risk | Mức độ | Giảm thiểu |
|------|--------|------------|
| Sửa encoding gây regress logic TSX | Thấp | Script chỉ thay đổi encoding byte, không đổi cấu trúc code. Verify bằng `tsc -b`. |
| Version diff component phức tạp | Trung bình | MVP chỉ hiển thị 2 cột JSON formatted, không cần diff algorithm phức tạp. |
| Nhiều filter state gây rối | Thấp | Gom vào 1 object `auditFilters` thay vì 5-6 state riêng. |
| Audit entries quá nhiều gây chậm | Thấp | Mock in-memory, 15-20 entries không đáng kể. |
| Tab quá nhiều UI gây rối | Thấp | Đây là tab cuối cùng, người dùng nâng cao mới cần. |

---

## 8. KHÔNG LÀM TRONG KẾ HOẠCH NÀY

- Rollback/khôi phục version cũ (chỉ xem + so sánh).
- Export audit trail ra file.
- Timeline trực quan dạng Gantt/roadmap cho version.
- Diff trực quan từng dòng config (chỉ diff cấu trúc JSON).
- Audit real-time / WebSocket.
- Tích hợp với hệ thống audit toàn app.

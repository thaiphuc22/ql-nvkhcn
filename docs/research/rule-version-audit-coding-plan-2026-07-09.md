# Rule Version History & Audit — Coding Plan

**Ngày lập**: 2026-07-09
**Màn đích**: `/quan-ly-luat/:id` (RuleDetail)
**Trạng thái harness**: Frontend-mock carve-out, theo kiến trúc hiện tại của `webapp`: React + Vite + Ant Design, data mock trong `src/data`, state in-memory qua Context. Chưa nối backend/Camunda thật.

---

## Hướng tiếp cận

Bổ sung 2 tab mới vào màn chi tiết luật (`RuleDetail.tsx`): **Lịch sử Phiên bản** và **Lịch sử Thay đổi (Audit)**. Toàn bộ hoạt động trong bộ nhớ (mock), không backend.

Nguyên tắc:

- Mỗi lần `saveXml` (lưu DMN mới) hoặc thay đổi `serviceInterface`, hệ thống snapshot toàn bộ trạng thái cũ thành một `RuleVersion` **trước khi** ghi đè.
- Mọi mutation (create / update / saveXml / duplicate / setStatus / remove) ghi một `RuleAuditEntry`.
- Không thay đổi behavior các màn hiện có. Tab cũ (`Soạn bảng luật`, `Chế độ nâng cao`, `Test`) giữ nguyên.
- Audit/version là read-only, không có thao tác rollback trong MVP (chỉ xem).

| Vùng hiện có | Cách dùng lại |
|---|---|
| `webapp/src/data/rules.ts` | Mở rộng model, thêm `RuleVersion`, `RuleAuditEntry`, seed. |
| `webapp/src/store/RuleContext.tsx` | Thêm state `versions` + `auditEntries`, hook vào các action hiện có. |
| `webapp/src/pages/RuleDetail.tsx` | Thêm 2 tab: version timeline + audit table. |
| `webapp/src/components/ui` | `StatusTag`, `PageHeader`, bảng/list UI dùng chung. |

---

## File chính cần thêm/sửa

| File | Việc cần làm |
|---|---|
| `webapp/src/data/rules.ts` | **SỬA** — thêm `RuleVersion`, `RuleAuditEntry`, `RuleAuditAction` types; seed version history + audit entries. |
| `webapp/src/store/RuleContext.tsx` | **SỬA** — thêm state versions/audit; sửa `saveXml` snapshot cũ; ghi audit ở mọi mutation. |
| `webapp/src/pages/RuleDetail.tsx` | **SỬA** — thêm 2 tab: "Lịch sử Phiên bản" + "Lịch sử Thay đổi". |
| `webapp/src/components/RuleVersionTimeline.tsx` | **MỚI** — timeline/table các phiên bản, click xem DMN snapshot. |
| `webapp/src/components/RuleVersionDiff.tsx` | **MỚI** — drawer so sánh 2 phiên bản. |
| `webapp/src/components/RuleAuditTable.tsx` | **MỚI** — bảng audit entries với filter action/actor/time. |

---

## Đợt 0 — Chốt phạm vi MVP

**Mục tiêu**: Không biến thành hệ thống version control đầy đủ.

Quyết định coding:

- Version lưu snapshot toàn bộ `dmnXml` + `serviceInterface` + metadata (tên, mô tả, category...) tại thời điểm lưu.
- Không diff DMN XML trực quan (chỉ hiển thị 2 cột text thô trong MVP).
- Không rollback (khôi phục phiên bản cũ) trong MVP.
- Audit ghi: ai, khi nào, hành động gì, version nào, ghi chú (change note).
- Audit không lưu diff chi tiết (chỉ ghi summary text).

**Verify**: Không thay đổi UX các tab hiện có; build xanh.

---

## Đợt 1 — Data model & seed

**Mục tiêu**: Có type rõ ràng cho version + audit, seed đủ dữ liệu demo.

### Slice A — Types mới trong `rules.ts`

```ts
export type RuleAuditAction =
  | 'CREATE'
  | 'UPDATE_META'
  | 'SAVE_VERSION'
  | 'DUPLICATE'
  | 'SET_STATUS'
  | 'DELETE'

export interface RuleVersion {
  id: string
  ruleId: string
  version: number
  /** Snapshot toàn bộ metadata tại thời điểm lưu. */
  ten: string
  moTa: string
  category: RuleCategory
  kind: RuleKind
  rdApDung: string[]
  trangThai: RuleStatus
  /** Nội dung luật tại phiên bản này. */
  dmnXml?: string
  serviceInterface?: { inputs: string; output: string }
  /** Ai lưu, khi nào, ghi chú gì. */
  capNhat: string
  nguoiCapNhat: string
  changeNote: string
}

export interface RuleAuditEntry {
  id: string
  ruleId: string
  action: RuleAuditAction
  version: number
  actor: string
  timestamp: string
  detail: string
}

export const RULE_AUDIT_ACTION_LABEL: Record<RuleAuditAction, string> = {
  CREATE: 'Tạo mới',
  UPDATE_META: 'Cập nhật thông tin',
  SAVE_VERSION: 'Lưu phiên bản',
  DUPLICATE: 'Nhân bản',
  SET_STATUS: 'Đổi trạng thái',
  DELETE: 'Xoá',
}

export const RULE_AUDIT_ACTION_COLOR: Record<RuleAuditAction, string> = {
  CREATE: 'green',
  UPDATE_META: 'blue',
  SAVE_VERSION: 'purple',
  DUPLICATE: 'cyan',
  SET_STATUS: 'orange',
  DELETE: 'red',
}
```

Field `version` trên `BusinessRule` vẫn là current version number. `RuleVersion.version` là số phiên bản tại snapshot đó.

### Slice B — Seed version history

Tạo `seedRuleVersions: RuleVersion[]`. Với mỗi rule có `version >= 2`, tạo các phiên bản trước đó:

- `rule-rd02-routing` (v3): seed v1 + v2 snapshot (DMN XML giả lập đơn giản hơn, hoặc copy DMN hiện tại với chú thích thay đổi).
- `rule-quy-mo` (v2): seed v1 snapshot.
- Các rule version 1: không có version history (chỉ có bản hiện tại).

### Slice C — Seed audit entries

Tạo `seedRuleAuditEntries: RuleAuditEntry[]`:

- Mỗi rule có ít nhất 1 entry `CREATE`.
- Các rule có version > 1: thêm entry `SAVE_VERSION` cho mỗi lần lưu.
- Rule `rule-doi-chieu-sap`: thêm entry `SET_STATUS` (active → disabled).
- Đảm bảo actor đa dạng (Quản trị hệ thống, Chuyên viên nghiệp vụ...).

**Verify**: `npm run typecheck` hoặc `npm run build` không lỗi type.

---

## Đợt 2 — State (RuleContext mở rộng)

**Mục tiêu**: Context quản lý thêm versions + audit; các action hiện có tự động ghi nhật ký.

### Sửa `RuleContext.tsx`

Thêm state:

```ts
const [versions, setVersions] = useState<RuleVersion[]>(seedRuleVersions)
const [auditEntries, setAuditEntries] = useState<RuleAuditEntry[]>(seedRuleAuditEntries)
```

Thêm vào context value:

```ts
getVersions: (ruleId: string) => RuleVersion[]
getAudit: (ruleId: string) => RuleAuditEntry[]
```

### Sửa các action hiện có để ghi audit + snapshot version:

**`create`**: thêm audit `CREATE`; thêm version v1 snapshot.

**`update`**: thêm audit `UPDATE_META` với detail ghi rõ field nào thay đổi.

**`saveXml`** (quan trọng nhất):
- Trước khi ghi đè, snapshot toàn bộ trạng thái hiện tại của rule thành `RuleVersion` với version = rule.version hiện tại.
- Sau đó mới tăng version và lưu DMN mới.
- Ghi audit `SAVE_VERSION`.

**`duplicate`**: audit `DUPLICATE`; version v1 snapshot cho bản sao.

**`setStatus`**: audit `SET_STATUS` với detail "active → draft" hoặc ngược lại.

**`remove`**: audit `DELETE` trước khi xoá (giữ audit entry sau khi rule bị xoá).

Helper:

```ts
function makeAuditId() { return `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }
function makeVersionId() { return `ver-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }
```

**Verify**: build xanh; tạo mới → sửa → lưu DMN → kiểm tra console log hoặc React DevTools thấy versions + audit tăng.

---

## Đợt 3 — UI: Tab Lịch sử Phiên bản

**Mục tiêu**: Người dùng xem được timeline các phiên bản đã lưu, xem nội dung DMN của từng phiên bản.

### Slice A — Component `RuleVersionTimeline.tsx`

Hiển thị dạng **Timeline** (Ant Design `Timeline`) hoặc **Table**, mỗi dòng là một phiên bản:

- Số phiên bản (badge `v1`, `v2`, ...)
- Ngày cập nhật
- Người cập nhật
- Ghi chú thay đổi (`changeNote`)
- Action: "Xem chi tiết" (mở drawer)

Phiên bản hiện tại (active) được tô màu xanh, đánh dấu `(hiện tại)`.

### Slice B — Component `RuleVersionDiff.tsx`

Drawer xem nội dung một phiên bản:

- Tab `Thông tin`: ten, moTa, category, kind, rdApDung, trangThai tại thời điểm đó.
- Tab `DMN XML`: textarea readonly hiển thị `dmnXml` (hoặc "Không có" với SERVICE).
- Nếu chọn 2 phiên bản: hiển thị 2 cột side-by-side (text thô, không syntax highlight trong MVP).

### Slice C — Tích hợp vào `RuleDetail.tsx`

Thêm tab mới trong `Tabs`:

```tsx
{
  key: 'versions',
  label: <span><HistoryOutlined /> Lịch sử Phiên bản</span>,
  children: <RuleVersionTimeline ruleId={rule.id} />,
}
```

**Verify**: Vào rule `BR-RD02-ROUTING` (v3) → tab Lịch sử Phiên bản → thấy 3 phiên bản → click xem chi tiết v1, v2.

---

## Đợt 4 — UI: Tab Lịch sử Thay đổi (Audit)

**Mục tiêu**: Người dùng xem được toàn bộ lịch sử thao tác trên một luật.

### Slice A — Component `RuleAuditTable.tsx`

Table với các cột:

- Thời gian
- Hành động (Tag màu: CREATE xanh, SAVE_VERSION tím, SET_STATUS cam, DELETE đỏ...)
- Phiên bản liên quan
- Người thực hiện
- Chi tiết (detail text)
- Filter bar:
  - Dropdown filter theo `action`
  - Search theo `actor`

### Slice B — Tích hợp vào `RuleDetail.tsx`

Thêm tab:

```tsx
{
  key: 'audit',
  label: <span><AuditOutlined /> Lịch sử Thay đổi</span>,
  children: <RuleAuditTable ruleId={rule.id} />,
}
```

### Slice C — Context wiring

`RuleAuditTable` gọi `useRules().getAudit(ruleId)` và `useRules().getVersions(ruleId)` để hiển thị.

**Verify**: Vào một rule đã qua nhiều thao tác → tab Audit → thấy danh sách CREATE, UPDATE_META, SAVE_VERSION, SET_STATUS theo thời gian.

---

## Đợt 5 — Polish & cross-link

**Mục tiêu**: UX mượt, liên kết 2 chiều giữa version và audit.

### Slice A — Click từ audit → version

Trong `RuleAuditTable`, với action `SAVE_VERSION`, click vào version number → chuyển sang tab "Lịch sử Phiên bản" và scroll tới phiên bản tương ứng (hoặc mở drawer version đó).

### Slice B — Tab hiện tại highlight version đang active

Trong `RuleVersionTimeline`, phiên bản = `rule.version` hiện tại được đánh dấu `(hiện tại)` với Tag màu xanh, các phiên bản cũ hơn là Tag default.

### Slice C — Responsive

- Tab version: dùng Timeline trên mobile, Table trên desktop.
- Tab audit: Table có `scroll.x` cho cột rộng.

---

## Thứ tự triển khai khuyến nghị

```text
Đợt 1 Data model + seed
  → Đợt 2 RuleContext mở rộng
  → Đợt 3 Tab Lịch sử Phiên bản
  → Đợt 4 Tab Lịch sử Thay đổi
  → Đợt 5 Polish & cross-link
```

---

## Acceptance criteria

- [ ] Trên màn `/quan-ly-luat/:id`, xuất hiện 2 tab mới: "Lịch sử Phiên bản" và "Lịch sử Thay đổi".
- [ ] Tab "Lịch sử Phiên bản": hiển thị danh sách tất cả phiên bản đã lưu (bao gồm cả hiện tại), sắp xếp giảm dần theo version.
- [ ] Click "Xem chi tiết" trên một phiên bản → drawer hiển thị metadata + DMN XML của phiên bản đó.
- [ ] Tab "Lịch sử Thay đổi": hiển thị toàn bộ audit entries, filter được theo loại hành động.
- [ ] Mỗi lần lưu DMN (saveXml), phiên bản cũ được snapshot vào version history trước khi tăng version.
- [ ] Mọi thao tác CRUD đều có audit entry tương ứng.
- [ ] Các tab cũ (Soạn bảng luật, Chế độ nâng cao, Test) không bị ảnh hưởng.
- [ ] `npm run build` xanh.

---

## Risk & giảm thiểu

| Risk | Mức độ | Giảm thiểu |
|---|---|---|
| Tab quá nhiều gây rối UI | Thấp | Chỉ thêm 2 tab; dùng icon rõ ràng, tab version/audit để cuối. |
| DMN XML quá dài trong drawer | Trung bình | Dùng `Input.TextArea` readonly với `rows={20}`, font monospace. |
| Version history phình to vì lưu full DMN XML mỗi lần | Thấp | MVP mock in-memory, phase sau backend sẽ xử lý storage. |
| Audit entries không đồng bộ với version | Thấp | Cùng một Context, ghi tuần tự trong action. |
| Conflict với tab Test (đang để bên phải layout 2 cột) | Trung bình | Tab Version + Audit để chung cột trái (dưới tab Soạn/Nâng cao). Tab Test vẫn cột phải độc lập. |

---

## Không làm trong kế hoạch này

- Rollback/khôi phục phiên bản cũ.
- Diff trực quan DMN (highlight dòng thay đổi).
- Audit log toàn hệ thống (chỉ trong phạm vi `/quan-ly-luat`).
- Xuất báo cáo audit.
- Phân quyền xem audit (dùng chung `canManageSystem`).
- So sánh 2 phiên bản side-by-side có syntax highlight.

# Kế hoạch nâng cấp UI — Tab "Tổng quan" màn Cấu hình Service Task

> **Ngày**: 2026-07-09 · **Người lập**: Claude Code (đọc mã nguồn, đối chiếu UI/UX review
> toàn app 2026-07-04, design-system.md, và coding plan service task 2026-07-09).
> **Phạm vi**: Chỉ tab `key="overview"` trong `pages/ServiceTaskConfig.tsx`, không đụng đến
> các tab khác (Cấu hình, Đối soát BPMN, Kiểm thử, Log thực thi, Phiên bản & audit).
> **Trạng thái hiện tại**: Tab Tổng quan đã có dải stat card + layout 2 cột (bảng "cần chú ý"
> + danh sách loại), code hoạt động ổn, nhưng còn mức độ "prototype hành chính" — thiếu chiều
> sâu trực quan, thiếu empty-state thương hiệu, thiếu khả năng "nhìn một cái là biết tình hình".

---

## 1. Hiện trạng — phân tích từ mã nguồn

### 1.1 Cấu trúc hiện tại

```
┌─────────────────────────────────────────────────────┐
│  PageHeader "Cấu hình Service Task"                  │
│  Breadcrumb + nút "Tạo cấu hình"                     │
├──────────┬──────────┬──────────┬────────────────────┤
│ StatCard │ StatCard │ StatCard │ StatCard            │
│ Tổng c/h │ Đang act │ Thiếu bd │ Incident mở         │
├──────────┴──────────┴──────────┴────────────────────┤
│  Tabs: [Tổng quan] [Cấu hình] [Đối soát] [...]      │
├────────────────────────┬─────────────────────────────┤
│ Card "Cấu hình cần     │ Card "Loại Service Task"    │
│  chú ý"                │                             │
│ Table (8 cột, không    │ List phẳng: name + desc +   │
│ scroll-y, không phân   │ code tag. Không nhóm theo   │
│ trang): chỉ hiện row   │ category, không có visual   │
│ có incident HOẶC       │ hook.                       │
│ binding=0.             │                             │
│                        │                             │
│ Khi rỗng → "No data"   │                             │
│ (Empty mặc định AntD)  │                             │
└────────────────────────┴─────────────────────────────┘
```

### 1.2 Điểm mạnh (giữ nguyên)

- Stat cards dùng chung `StatCard` component, nhất quán toàn app.
- Bảng dùng chung `StatusTag` cho trạng thái, không màu-đơn.
- Có filter ngầm (chỉ hiện row "cần chú ý"), đúng intent: tổng quan = nơi tập trung vấn đề.
- Breadcrumb + PageHeader chuẩn, dùng chung context.

### 1.3 Khoảng trống (theo UI/UX review toàn app & phân tích riêng)

| # | Vấn đề | Mức | Tham chiếu |
|---|--------|-----|------------|
| A | Bảng "Cần chú ý" không có `scroll-y` → khi nhiều row, toàn trang cuộn, mất ngữ cảnh header/filter | Cao | UX review 3.10 |
| B | Bảng "Cần chú ý" không phân trang → nếu 20+ config lỗi, bảng dài vô tận | Trung bình | UX review 3.11 |
| C | Khi không có config nào "cần chú ý", hiển thị "No data" AntD mặc định → bỏ lỡ cơ hội dùng `EmptyState` (SVG thương hiệu đã có sẵn) | Trung bình | UX review 3.1 |
| D | Card "Loại Service Task" quá thô: list phẳng, không nhóm theo category, không hiển thị capabilities, không đếm số config mỗi loại | Thấp–Trung bình | — |
| E | Không có chỉ báo xu hướng (trend) cho stat cards — chỉ là số tĩnh, không biết tăng/giảm so với tuần trước | Thấp | — |
| F | Không có "hành động nhanh" từ overview → muốn tạo config phải lên nút trên PageHeader (cách xa vùng nhìn khi đang ở tab overview) | Thấp | — |
| G | Không có chỉ báo trực quan phân bố trạng thái (active/draft/error/deprecated) — phải sang tab "Cấu hình" mới thấy | Thấp | — |
| H | Thiếu "hoạt động gần đây" (recent changes) — overview nên cho biết ai vừa sửa gì, phiên bản mới nhất | Thấp | — |

---

## 2. Layout đề xuất sau nâng cấp

```
┌──────────────────────────────────────────────────────────────────┐
│  PageHeader "Cấu hình Service Task"          [＋ Tạo cấu hình]   │
│  Breadcrumb: Hệ thống QTKHCN / Quản trị quy trình / ...          │
├──────────┬──────────┬──────────┬──────────┬──────────────────────┤
│ StatCard │ StatCard │ StatCard │ StatCard │ Quick actions        │
│ Tổng c/h │ Đang act │ Thiếu bd │ Incident │ (mini nút: ＋Tạo,    │
│ + trend  │ + trend  │ + trend  │ + icon   │  Đối soát, Xem log)  │
│ (▲/▼ %)  │ (▲/▼ %)  │ (▲/▼ %)  │ cảnh báo │                      │
├──────────┴──────────┴──────────┴──────────┴──────────────────────┤
│  ── Row 1: Tổng quan sức khỏe ──────────────────────────────────  │
│ ┌─────────────────────┬──────────────┬─────────────────────────┐ │
│ │ Phân bố trạng thái  │ Top process  │ Phân bố theo loại       │ │
│ │ (bar mini: Draft /  │ theo binding │ (bar ngang: NOTIF/CALL  │ │
│ │ Ready / Active /    │ count ↓      │ API/DOSSIER/DOC/DEC)    │ │
│ │ Deprecated / Error) │              │                         │ │
│ └─────────────────────┴──────────────┴─────────────────────────┘ │
│  ── Row 2: Chi tiết cần chú ý ─────────────────────────────────  │
│ ┌────────────────────────────────┬──────────────────────────────┐ │
│ │ Card "⚠ Cấu hình cần chú ý"   │ Card "📋 Loại Service Task"  │ │
│ │ (giữ nguyên nhưng nâng cấp)   │ (nâng cấp: nhóm category,    │ │
│ │                                │  hiển thị capabilities icon, │ │
│ │ + scroll-y cố định             │  đếm config/loại, badge      │ │
│ │ + phân trang (nếu > 8 dòng)    │  enabled/disabled)           │ │
│ │ + EmptyState thương hiệu       │                              │ │
│ │   khi sạch → "Tất cả config    │                              │ │
│ │   đều ổn ✅"                   │                              │ │
│ └────────────────────────────────┴──────────────────────────────┘ │
│  ── Row 3: Hoạt động gần đây (mới) ─────────────────────────────  │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ Timeline/List 5 audit entries gần nhất: ai → action → entity  │ │
│ │ (tận dụng audit entries đã có trong ServiceTaskContext)       │ │
│ └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Chi tiết từng hạng mục nâng cấp

### 3.1 [Cao] Thêm `scroll-y` + phân trang cho bảng "Cấu hình cần chú ý"

**Hiện trạng**:
```tsx
<Table
  size="small"
  rowKey="id"
  pagination={false}           // ← KHÔNG phân trang
  dataSource={rows.filter(...)}
  columns={columns.slice(0, 8)}
  scroll={{ x: 1100 }}          // ← KHÔNG có scroll.y
/>
```

**Sau nâng cấp**:
```tsx
<Table
  size="small"
  rowKey="id"
  pagination={{
    pageSize: 6,
    showSizeChanger: true,
    pageSizeOptions: [6, 10, 20],
    showTotal: (total) => `Tổng ${total} config cần chú ý`,
    hideOnSinglePage: true,
  }}
  dataSource={attentionRows}
  columns={columns.slice(0, 8)}
  scroll={{ x: 1100, y: 320 }}  // ← vùng cuộn riêng, header cố định
  locale={{
    emptyText: (
      <EmptyState
        title="Tất cả cấu hình đều ổn"
        description="Không có config nào có incident mở hoặc thiếu binding."
        compact
      />
    ),
  }}
/>
```

**Lý do**:
- `scroll.y = 320` giữ bảng trong vùng nhìn, không đẩy card bên phải xuống.
- Phân trang `hideOnSinglePage: true` — khi ≤ 6 dòng, không hiện pagination (gọn), khi nhiều dòng mới hiện.
- `EmptyState` thay vì "No data" AntD mặc định — dùng SVG thương hiệu đã có (UX review 3.1).
- Nhất quán với pattern `EntityTable` đã có `showSizeChanger` + `showTotal`.

**Effort**: Nhỏ — đổi props Table + import `EmptyState`.

---

### 3.2 [Trung bình] Nâng cấp card "Loại Service Task"

**Hiện trạng**: List phẳng, mỗi dòng là `name + description + code tag`, phân cách bằng `border-bottom` thủ công.

**Sau nâng cấp**:

```tsx
<Card size="small" title="Loại Service Task">
  {/* Nhóm theo category */}
  {categories.map((cat) => (
    <div key={cat.key} style={{ marginBottom: 12 }}>
      <Text type="secondary" strong style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {cat.label}
      </Text>
      {serviceTasks.types
        .filter((t) => t.category === cat.key)
        .map((type) => {
          const count = rows.filter((r) => r.typeCode === type.code).length
          const caps = type.capabilities
          return (
            <div key={type.code} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 0', borderBottom: '1px solid var(--vht-border)',
            }}>
              {/* Icon theo category */}
              <span style={{ fontSize: 18, opacity: 0.6 }}>
                {categoryIcons[cat.key]}
              </span>
              <div style={{ flex: 1 }}>
                <Text strong>{type.name}</Text>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                  {type.description}
                </Text>
              </div>
              {/* Capabilities pills */}
              <Space size={2} wrap>
                {caps.supportsRetry && <Tag color="blue" style={{ fontSize: 10 }}>retry</Tag>}
                {caps.requiresConnector && <Tag color="orange" style={{ fontSize: 10 }}>connector</Tag>}
                {caps.mutatesDossier && <Tag color="purple" style={{ fontSize: 10 }}>mutate</Tag>}
              </Space>
              {/* Count badge */}
              <Tag color={type.enabled ? 'success' : 'default'}>{count}</Tag>
            </div>
          )
        })}
    </div>
  ))}
</Card>
```

**Category grouping** (từ `ServiceTaskCategory`):
| Category | Label | Icon | Types |
|---|---|---|---|
| `communication` | Giao tiếp | `SendOutlined` | `SEND_NOTIFICATION` |
| `integration` | Tích hợp | `ApiOutlined` | `CALL_API` |
| `data` | Dữ liệu | `DatabaseOutlined` | `UPDATE_DOSSIER` |
| `document` | Văn bản | `FileTextOutlined` | `GENERATE_DOCUMENT` |
| `decision` | Quyết định | `BranchesOutlined` | `EVALUATE_DECISION` |

**Lý do**:
- Nhóm category giúp quét nhanh, không phải đọc từng dòng.
- Capabilities pills cho biết ngay loại này hỗ trợ gì (retry, connector, mutate...).
- Count badge `{count}` = số config đang có của loại đó — connect giữa "danh mục loại" và "dữ liệu thực tế".
- Icon tăng tính trực quan, nhất quán với icon dùng trong menu/bảng.

**Effort**: Vừa — cần map `ServiceTaskCategory` → label/icon, thêm count query.

---

### 3.3 [Thấp] Thêm trend indicators cho StatCard

**Hiện trạng**: StatCard hiển thị số tĩnh. Không biết tăng/giảm so với kỳ trước.

**Đề xuất**: Thêm suffix trend với arrow + %:

```tsx
// Mock trend data (sau này thay bằng API)
const trends = useMemo(() => ({
  total: { direction: 'up', pct: 12 },
  active: { direction: 'up', pct: 8 },
  missingBinding: { direction: 'down', pct: 25 },
  incidents: { direction: 'down', pct: 50 },
}), [rows])

<StatCard
  title="Tổng cấu hình"
  value={rows.length}
  suffix={
    <span style={{ fontSize: 12, color: trends.total.direction === 'up' ? '#1677ff' : '#cf1322' }}>
      {trends.total.direction === 'up' ? '▲' : '▼'} {trends.total.pct}%
    </span>
  }
/>
```

**Hoặc** bọc trong component `StatCardWithTrend` nhỏ (tái dùng ở Dashboard sau này).

**Lưu ý**: Khi chưa có dữ liệu thật, trend = mock hằng (không tăng/giảm ảo). Để `VITE_ENABLE_TRENDS=false` gate nếu muốn.

**Effort**: Nhỏ — 4 dòng suffix mỗi card, có thể extract component nếu muốn.

---

### 3.4 [Thấp] Row 1: Tổng quan sức khỏe (3 mini chart)

Đây là row mới nằm giữa stat cards và row "Cấu hình cần chú ý" hiện tại. Mục tiêu: "nhìn 3 giây biết tình hình".

#### 3.4.1 Phân bố trạng thái (mini horizontal bar)

```tsx
<Card size="small" title="Phân bố trạng thái">
  {(['DRAFT','READY','ACTIVE','DEPRECATED','ERROR'] as const).map((status) => {
    const count = rows.filter((r) => r.status === status).length
    const meta = SERVICE_TASK_STATUS_META[status]
    const pct = rows.length ? Math.round((count / rows.length) * 100) : 0
    return (
      <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Text style={{ width: 90, fontSize: 12 }}>{meta.label}</Text>
        <div style={{ flex: 1, height: 10, background: 'var(--vht-border)', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: meta.color, borderRadius: 5, transition: 'width 0.4s' }} />
        </div>
        <Text strong style={{ width: 28, textAlign: 'right', fontSize: 12 }}>{count}</Text>
      </div>
    )
  })}
</Card>
```

#### 3.4.2 Top process theo binding count

```tsx
<Card size="small" title="Process gắn nhiều nhất">
  {topProcesses.slice(0, 5).map((p) => (
    <div key={p.code} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
      <Text style={{ fontSize: 12 }}>{p.code}</Text>
      <Tag>{p.count} binding</Tag>
    </div>
  ))}
  {topProcesses.length === 0 && (
    <EmptyState compact title="Chưa có binding nào" />
  )}
</Card>
```

#### 3.4.3 Phân bố theo loại (mini bar chart ngang)

Tương tự 3.4.1 nhưng theo `ServiceTaskTypeCode` thay vì status.

**Layout Row 1**: 3 card bằng nhau trong 1 `Row`:
```tsx
<Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
  <Col xs={24} sm={8}> {/* Phân bố trạng thái */} </Col>
  <Col xs={24} sm={8}> {/* Top process */} </Col>
  <Col xs={24} sm={8}> {/* Phân bố loại */} </Col>
</Row>
```

**Effort**: Vừa — 3 card mini mới, nhưng dữ liệu đã có sẵn từ `rows` + `reconcileHealth`.

---

### 3.5 [Thấp] Row 3: Hoạt động gần đây

Tận dụng `serviceTasks.auditEntries` đã có sẵn. Hiển thị 5 entry gần nhất:

```tsx
<Card size="small" title="Hoạt động gần đây">
  {serviceTasks.auditEntries
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 5)
    .map((entry) => (
      <div key={entry.id} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '4px 0', borderBottom: '1px solid var(--vht-border)',
      }}>
        <Tag color="blue" style={{ fontSize: 11 }}>{entry.action}</Tag>
        <Text style={{ fontSize: 12, flex: 1 }}>
          {entry.entityType} — {entry.actor}
        </Text>
        <Text type="secondary" style={{ fontSize: 11 }}>
          {entry.at}
        </Text>
      </div>
    ))
  }
  {serviceTasks.auditEntries.length === 0 && (
    <EmptyState compact title="Chưa có hoạt động nào" />
  )}
</Card>
```

**Layout**: Card full-width, dưới row "Cấu hình cần chú ý".

**Effort**: Nhỏ — dữ liệu có sẵn, chỉ cần render.

---

### 3.6 [Thấp] Quick actions mini bar

Thay vì để nút "Tạo cấu hình" chỉ trên `PageHeader`, thêm 1 thanh hành động nhanh mini cạnh stat cards:

```tsx
<Col xs={24} md={4} style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
  <Button type="primary" icon={<PlusOutlined />} block onClick={...}>Tạo mới</Button>
  <Button icon={<CheckCircleOutlined />} block onClick={() => /* scroll to reconcile */}>Đối soát</Button>
  <Button icon={<EyeOutlined />} block onClick={() => /* switch to logs tab */}>Xem log</Button>
</Col>
```

**Lưu ý**: Điều chỉnh stat cards từ `md={6}` → `md={5}` để có chỗ cho quick actions. Responsive: trên mobile, quick actions collapse xuống dưới stat cards.

**Effort**: Nhỏ.

---

## 4. Tổng hợp — danh sách việc theo mức ưu tiên

| # | Hạng mục | Mức ưu tiên | Effort | Ghi chú |
|---|----------|-------------|--------|---------|
| 1 | Thêm `scroll.y` + phân trang cho bảng "Cần chú ý" | **Cao** | Nhỏ | Sửa trực tiếp trong tab overview |
| 2 | `EmptyState` thương hiệu khi bảng "Cần chú ý" rỗng | **Cao** | Nhỏ | Dùng component có sẵn, cần export trong `ui/index.ts` |
| 3 | Nâng cấp card "Loại Service Task" (category + capabilities + count) | **Trung bình** | Vừa | Cần map category→icon/label, thêm count |
| 4 | Row 1: Tổng quan sức khỏe (3 mini chart) | **Thấp** | Vừa | 3 card mini mới, dữ liệu từ `rows` + `reconcileHealth` |
| 5 | Row 3: Hoạt động gần đây (audit timeline) | **Thấp** | Nhỏ | Dữ liệu có sẵn |
| 6 | Trend indicators cho StatCard | **Thấp** | Nhỏ | Mock trend, gate sau biến môi trường |
| 7 | Quick actions mini bar | **Thấp** | Nhỏ | Điều chỉnh Col width stat cards |

---

## 5. Yêu cầu phụ trợ (cần làm trước hoặc song song)

### 5.1 Export `EmptyState` trong `components/ui/index.ts`

Hiện tại `EmptyState` không được export từ barrel (`components/ui/index.ts`), nên không dùng được ở bất kỳ trang nào (UX review 3.1). Cần thêm 2 dòng:

```ts
export { default as EmptyState } from './EmptyState'
export type { EmptyStateProps } from './EmptyState'
```

### 5.2 Import icon mới

Các icon cần thêm (nếu chưa có):
- `SendOutlined` — communication category
- `DatabaseOutlined` — data category
- `FileTextOutlined` — document category
- `BranchesOutlined` — decision category
- `ArrowUpOutlined`, `ArrowDownOutlined` — trend indicators

Tất cả đều có sẵn trong `@ant-design/icons`.

---

## 6. Phác thảo thứ tự thực hiện (Đợt)

### Đợt A — Sửa khẩn cấp (30 phút)
1. Export `EmptyState` trong `ui/index.ts`
2. Thêm `scroll.y` + phân trang + `EmptyState` cho bảng "Cần chú ý"

### Đợt B — Nâng cấp card "Loại Service Task" (45 phút)
3. Định nghĩa map `category → { label, icon }`
4. Viết lại render card "Loại Service Task" với group + capabilities pills + count

### Đợt C — Thêm row sức khỏe + hoạt động gần đây (90 phút)
5. Row 1: 3 card mini (phân bố trạng thái, top process, phân bố loại)
6. Row 3: audit timeline 5 entry gần nhất

### Đợt D — Tinh chỉnh (30 phút)
7. Trend indicators cho stat cards (có gate môi trường)
8. Quick actions mini bar

---

## 7. File cần sửa

| File | Việc |
|------|------|
| `webapp/src/components/ui/index.ts` | **SỬA** — export `EmptyState` |
| `webapp/src/pages/ServiceTaskConfig.tsx` | **SỬA** — toàn bộ nội dung tab `overview` |

Không cần thêm file mới nếu giữ mọi thứ inline trong tab overview. Nếu muốn tách, có thể extract 3 mini chart vào `components/ServiceTaskHealthOverview.tsx` — nhưng không bắt buộc cho MVP.

---

## 8. Tiêu chí hoàn thành

- [ ] Bảng "Cấu hình cần chú ý" có vùng cuộn riêng (`scroll.y`), header cố định khi cuộn.
- [ ] Khi bảng rỗng → hiện `EmptyState` SVG thương hiệu với text "Tất cả cấu hình đều ổn".
- [ ] Card "Loại Service Task" hiển thị theo category, có icon, capabilities pills, count badge.
- [ ] Row mới "Tổng quan sức khỏe" hiển thị 3 mini chart (phân bố trạng thái, top process, phân bố loại).
- [ ] Row "Hoạt động gần đây" hiển thị 5 audit entry gần nhất.
- [ ] Build xanh (`tsc -b --noEmit`), không thay đổi behavior các tab khác.
- [ ] Responsive: trên mobile (< 768px), các card xuống dòng hợp lý, không tràn ngang.

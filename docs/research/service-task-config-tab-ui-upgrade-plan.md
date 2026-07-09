# Kế hoạch nâng cấp UI — Tab "Cấu hình" màn Cấu hình Service Task

> **Ngày**: 2026-07-09 · **Người lập**: Claude Code (đọc mã nguồn, đối chiếu UI/UX review
> toàn app 2026-07-04, design-system.md, và coding plan service task 2026-07-09).
> **Phạm vi**: Tab `key="config"` trong `pages/ServiceTaskConfig.tsx` + sửa lỗi encoding
> tiếng Việt toàn bộ file.
> **Trạng thái hiện tại**: Tab Cấu hình đã có filter bar (5 dropdown) + bảng 10 cột với
> phân trang, code hoạt động ổn, nhưng còn tồn tại các vấn đề về encoding tiếng Việt và
> một số khoảng trống UX.

---

## 0. VẤN ĐỀ NGHIÊM TRỌNG: Encoding tiếng Việt bị hỏng toàn bộ file

### 0.1 Hiện trạng

Toàn bộ file `ServiceTaskConfig.tsx` bị lỗi double-encoding UTF-8 → Latin-1. Mọi chuỗi
tiếng Việt có dấu đều hiển thị sai:

| Đúng | Sai (hiện tại) |
|------|----------------|
| Cấu hình | Cáº¥u hÃ¬nh |
| Loại | Loáº¡i |
| Trạng thái | Tráº¡ng thÃ¡i |
| Tổng quan | Tá»•ng quan |
| Cần chú ý | Cáº§n chÃº Ã½ |
| Thao tác | Thao tÃ¡c |
| Sửa | Sá»­a |
| Đối soát BPMN | Äá»‘i soÃ¡t BPMN |
| Kiểm thử | Kiá»ƒm thá»­ |
| Cập nhật | Cáº­p nháº­t |
| Tạo cấu hình | Táº¡o cáº¥u hÃ¬nh |
| Hệ thống QTKHCN | Há»‡ thá»‘ng QTKHCN |
| Quản trị quy trình | Quáº£n trá»‹ quy trÃ¬nh |

### 0.2 Nguyên nhân

File được lưu với encoding UTF-8, nhưng tại một thời điểm nào đó bị đọc lại với encoding
Latin-1/Windows-1252, gây ra double-encoding. Ví dụ:

- Ký tự "ấ" (U+1EA5) → UTF-8 bytes: `0xE1 0xBA 0xA5`
- Đọc lại bằng Latin-1: `0xE1='á'`, `0xBA='º'`, `0xA5='¥'` → "áº¥"

### 0.3 Cách sửa

Viết Node.js script đọc file dưới dạng binary (`latin1`), encode lại thành UTF-8 buffer,
rồi ghi đè. Cách này khôi phục đúng toàn bộ chuỗi tiếng Việt mà không cần liệt kê từng
chuỗi một.

```js
const fs = require('fs');
const path = 'c:/Users/phuctd7/ql-nvkhcn/webapp/src/pages/ServiceTaskConfig.tsx';
const buf = fs.readFileSync(path); // đọc raw buffer
fs.writeFileSync(path, Buffer.from(buf.toString('latin1'), 'utf8'));
```

**⚠️ Quan trọng**: Script này phải chạy TRƯỚC tất cả các thay đổi UI khác, vì sau khi
sửa encoding, tất cả các chuỗi tiếng Việt sẽ khớp với `replace_string_in_file` tool,
giúp các đợt nâng cấp sau dễ thực hiện hơn.

---

## 1. Hiện trạng — phân tích từ mã nguồn

### 1.1 Cấu trúc hiện tại

```
┌──────────────────────────────────────────────────────────────────┐
│  Tab: [Tổng quan] [Cấu hình] [Đối soát BPMN] [Kiểm thử] [...]   │
├──────────────────────────────────────────────────────────────────┤
│  Card (size="small")                                             │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Filter bar: [Loại ▾] [Trạng thái ▾] [Quy trình ▾]            ││
│  │             [Connector ▾] [Incident ▾]                       ││
│  ├──────────────────────────────────────────────────────────────┤│
│  │ Table 10 cột (scroll.x=1550, pageSize=8)                     ││
│  │ Mã | Tên | Loại | Trạng thái | Active ver | Binding |        ││
│  │ Success 7d | Incident mở | Cập nhật | Thao tác               ││
│  │                                                              ││
│  │ Cột "Thao tác": [Sửa] [Copy] [Validate] [Active]             ││
│  └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

### 1.2 Điểm mạnh (giữ nguyên)

- Filter bar đầy đủ: 5 dropdown với `allowClear`, bao phủ các chiều lọc chính.
- Table có `scroll.x` → không tràn ngang trên màn hình hẹp.
- Có phân trang (`pageSize=8`).
- Cột "Trạng thái" dùng `StatusTag` chuẩn, không chỉ dựa vào màu.
- Cột "Thao tác" có đủ 4 hành động: Sửa (mở drawer), Copy, Validate, Active.
- Cột "Mã" và "Tên" hiển thị stacked info (code + module, name + description) — tiết kiệm
  không gian ngang.

### 1.3 Khoảng trống

| # | Vấn đề | Mức | Tham chiếu |
|---|--------|-----|------------|
| **Encoding** | **Toàn bộ tiếng Việt trong file bị hỏng (double-encoding)** | **Nghiêm trọng** | 0.1 |
| A1 | Bảng không có `scroll.y` → khi nhiều row, toàn trang cuộn, mất filter bar | Cao | UX review 3.10 |
| A2 | Không có `EmptyState` thương hiệu khi filter không có kết quả → dùng "No data" AntD mặc định | Trung bình | UX review 3.1 |
| A3 | Pagination không có `showSizeChanger` → không đổi được số dòng/trang | Trung bình | UX review 3.12 |
| B1 | Cột "Success 7 ngày" hiển thị text thuần (vd. "85%") → thiếu visual cue (progress bar/màu) | Thấp | — |
| B2 | Cột "Incident mở" hiển thị Tag error, nhưng không có link drill-down vào log | Thấp | — |
| B3 | Cột "Thao tác" quá chật: 4 nút ngang (Sửa + Copy + Validate + Active) trên 230px | Trung bình | — |
| B4 | Không có kết quả tóm tắt phía trên bảng (vd. "Hiển thị 12/45 cấu hình") | Thấp | — |
| B5 | Filter bar là `Space wrap` — khi wrap xuống dòng thứ 2, layout hơi lộn xộn | Thấp | — |
| B6 | Không có nút "Xóa bộ lọc" / "Reset filter" khi đã chọn nhiều filter | Thấp | — |
| B7 | Không có khả năng sort theo cột (success rate, incident count, binding count...) | Trung bình | — |
| B8 | Cột "Active version" hiển thị version không rõ ràng — không phân biệt được version nào đang active thật sự | Thấp | — |

---

## 2. Layout đề xuất sau nâng cấp

```
┌──────────────────────────────────────────────────────────────────┐
│  Tab: [Tổng quan] [Cấu hình] [Đối soát BPMN] [Kiểm thử] [...]   │
├──────────────────────────────────────────────────────────────────┤
│  Card "Danh sách cấu hình Service Task"                          │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Filter bar (Row gutter, không wrap lung tung):               ││
│  │ [Loại ▾] [Trạng thái ▾] [Quy trình ▾]                       ││
│  │ [Connector ▾] [Incident ▾] ............ [Xóa bộ lọc] [12/45]││
│  ├──────────────────────────────────────────────────────────────┤│
│  │ Table (scroll.y=400, showSizeChanger, sorter trên các cột    ││
│  │        số, EmptyState khi rỗng)                               ││
│  │ Mã ↑↓ | Tên | Loại | Trạng thái | Active ver | Binding |     ││
│  │ Success 7d ▓▓▓▓░ | Incident mở (link) | Cập nhật | ⋯ |      ││
│  │                                                              ││
│  │ Cột "Thao tác": [Sửa] [⋯] (dropdown gộp Copy/Validate/Active)││
│  └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Kế hoạch thực hiện

### Đợt 0 — SỬA ENCODING TIẾNG VIỆT (bắt buộc, làm đầu tiên)

| # | Việc | Effort |
|---|------|--------|
| 0.1 | Chạy script Node.js khôi phục encoding UTF-8 cho toàn file `ServiceTaskConfig.tsx` | Nhỏ |
| 0.2 | Verify: `tsc -b` sạch, UI không đổi nhưng chữ Việt hiển thị đúng | Nhỏ |

### Đợt A — Sửa khẩn cấp (table scroll-y, EmptyState, showSizeChanger)

| # | Việc | Effort |
|---|------|--------|
| A1 | Thêm `scroll={{ x: 1550, y: 400 }}` cho bảng — giữ filter bar cố định | Rất nhỏ |
| A2 | Thêm `EmptyState` brand SVG vào `locale.emptyText` của bảng khi `filteredRows.length === 0` | Nhỏ |
| A3 | Thêm `showSizeChanger: true, pageSizeOptions: [8, 15, 30, 50], showTotal` vào pagination | Rất nhỏ |

### Đợt B — Tăng cường UX (success rate visual, actions gộp, sort, filter bar)

| # | Việc | Effort |
|---|------|--------|
| B1 | Cột "Success 7 ngày": thay text thuần bằng `Progress percent={...} size="small"` + màu theo ngưỡng (≥90% xanh, ≥70% vàng, <70% đỏ) | Nhỏ |
| B2 | Cột "Incident mở": bọc số trong link/blog sang tab "Log thực thi" với filter sẵn | Vừa |
| B3 | Cột "Thao tác": gộp 3 nút Copy/Validate/Active vào `Dropdown` "⋯" (chỉ giữ nút "Sửa" chính) | Nhỏ |
| B4 | Thêm dòng tóm tắt trên bảng: "Hiển thị X/Y cấu hình" + badge "Đang active: Z" | Nhỏ |
| B5 | Filter bar: chuyển từ `Space wrap` sang `Row gutter={[8, 8]}` + thêm nút "Xóa bộ lọc" khi có filter active | Nhỏ |
| B6 | Thêm `sorter` cho các cột số: "Success 7 ngày" (theo %), "Incident mở", "Binding", "Cập nhật" | Nhỏ |
| B7 | Cột "Binding" hiển thị số + tooltip liệt kê tên process code đầy đủ | Rất nhỏ |

---

## 4. Kiến trúc chi tiết từng thay đổi

### 4.0 Script sửa encoding

```js
// fix-encoding.js — chạy 1 lần từ thư mục webapp
const fs = require('fs');
const filePath = 'src/pages/ServiceTaskConfig.tsx';

// Đọc raw buffer
const buf = fs.readFileSync(filePath);

// Double-encoded: file được viết UTF-8 → đọc lại Latin-1
// Khôi phục: decode as Latin-1, re-encode as UTF-8
const fixed = Buffer.from(buf.toString('latin1'), 'utf8');

fs.writeFileSync(filePath, fixed);
console.log('Fixed encoding for', filePath);
```

### 4.A1 Bảng scroll.y

```tsx
<Table<DefinitionRow>
  rowKey="id"
  dataSource={filteredRows}
  columns={columns}
  scroll={{ x: 1550, y: 400 }}  // ← thêm y
  pagination={{ pageSize: 8 }}
/>
```

### 4.A2 EmptyState

```tsx
// Import (đã có sẵn EmptyState trong import)
// Thêm locale:
<Table
  ...
  locale={{
    emptyText: (
      <EmptyState
        compact
        title="Không tìm thấy cấu hình nào"
        description="Thử thay đổi bộ lọc hoặc tạo cấu hình mới."
      />
    ),
  }}
/>
```

### 4.A3 Pagination nâng cao

```tsx
pagination={{
  pageSize: 8,
  showSizeChanger: true,
  pageSizeOptions: [8, 15, 30, 50],
  showTotal: (total: number, range: [number, number]) =>
    `${range[0]}-${range[1]} / ${total} cấu hình`,
  hideOnSinglePage: false,
}}
```

### 4.B1 Success rate với Progress

```tsx
{
  title: 'Success 7 ngày',
  dataIndex: 'successRate',
  width: 140,
  sorter: (a, b) => {
    const aVal = a.successRate === '-' ? -1 : parseInt(a.successRate)
    const bVal = b.successRate === '-' ? -1 : parseInt(b.successRate)
    return aVal - bVal
  },
  render: (value: string) => {
    if (value === '-') return <Text type="secondary">-</Text>
    const pct = parseInt(value)
    const strokeColor = pct >= 90 ? '#389e0d' : pct >= 70 ? '#fa8c16' : '#cf1322'
    return <Progress percent={pct} size="small" strokeColor={strokeColor} format={() => value} />
  },
}
```

### 4.B2 Incident link sang tab Log

```tsx
{
  title: 'Incident mở',
  dataIndex: 'incidentCount',
  width: 120,
  sorter: (a, b) => a.incidentCount - b.incidentCount,
  render: (value: number, row) =>
    value > 0 ? (
      <Button
        type="link"
        size="small"
        danger
        onClick={() => {
          // Chuyển sang tab log + set filter
          setActiveTab('logs')
          setLogDefinitionFilter(row.id)
        }}
      >
        {value}
      </Button>
    ) : (
      <Tag>0</Tag>
    ),
}
```

Cần thêm state `activeTab` để điều khiển tab active từ trong bảng.

### 4.B3 Actions gộp dropdown

```tsx
{
  title: 'Thao tác',
  width: 160,  // giảm từ 230
  fixed: 'right',
  render: (_, row) => (
    <Space size={4}>
      <Button
        size="small"
        icon={<EditOutlined />}
        onClick={() => { setEditing(row); setDrawerOpen(true) }}
      >
        Sửa
      </Button>
      <Dropdown
        menu={{
          items: [
            { key: 'copy', icon: <CopyOutlined />, label: 'Tạo bản sao', onClick: () => duplicate(row) },
            { key: 'validate', icon: <CheckCircleOutlined />, label: 'Validate', onClick: () => validate(row) },
            { type: 'divider' },
            { key: 'activate', icon: <ThunderboltOutlined />, label: 'Active', onClick: () => activate(row), danger: true },
          ],
        }}
        trigger={['click']}
      >
        <Button size="small" icon={<MoreOutlined />} />
      </Dropdown>
    </Space>
  ),
}
```

Cần import thêm `Dropdown` và `MoreOutlined` từ antd / @ant-design/icons.

### 4.B4 Summary bar

```tsx
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
  <Space>
    <Text type="secondary">
      Hiển thị <Text strong>{filteredRows.length}</Text>/{rows.length} cấu hình
    </Text>
    <Tag color="blue">{rows.filter(r => r.status === 'ACTIVE').length} đang active</Tag>
  </Space>
  {hasActiveFilters && (
    <Button size="small" onClick={resetFilters}>Xóa bộ lọc</Button>
  )}
</div>
```

### 4.B5 Filter bar trong Row

```tsx
<Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
  <Col><Select allowClear placeholder="Loại" style={{ width: 180 }} value={typeFilter} ... /></Col>
  <Col><Select allowClear placeholder="Trạng thái" style={{ width: 170 }} value={statusFilter} ... /></Col>
  <Col><Select allowClear placeholder="Quy trình" style={{ width: 140 }} value={processFilter} ... /></Col>
  <Col><Select allowClear placeholder="Connector" style={{ width: 170 }} value={connectorFilter} ... /></Col>
  <Col><Select allowClear placeholder="Incident" style={{ width: 150 }} value={incidentFilter} ... /></Col>
  <Col flex="auto" style={{ textAlign: 'right' }}>
    {hasActiveFilters && <Button size="small" onClick={resetFilters}>Xóa bộ lọc</Button>}
  </Col>
</Row>
```

### 4.B6 Sorter cho các cột

Thêm `sorter` property cho các cột:
- "Binding": `(a, b) => a.bindingCount - b.bindingCount`
- "Success 7 ngày": như code ở B1
- "Incident mở": như code ở B2
- "Cập nhật": `(a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()`

### 4.B7 Tooltip cho Binding

```tsx
{
  title: 'Binding',
  dataIndex: 'bindingCount',
  width: 120,
  sorter: (a, b) => a.bindingCount - b.bindingCount,
  render: (value, row) => (
    <Tooltip title={row.processCodes.length > 0 ? row.processCodes.join(', ') : 'Chưa gắn'}>
      <Space direction="vertical" size={0}>
        <Text>{value}</Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {row.processCodes.slice(0, 2).join(', ') || 'Chưa gắn'}
          {row.processCodes.length > 2 && ` +${row.processCodes.length - 2}`}
        </Text>
      </Space>
    </Tooltip>
  ),
}
```

---

## 5. Thứ tự ưu tiên thực hiện

| Đợt | Nội dung | Lý do ưu tiên | Effort |
|------|----------|---------------|--------|
| **0** | Sửa encoding tiếng Việt toàn file | Chữ sai gây mất chuyên nghiệp, ảnh hưởng TOÀN BỘ màn hình (tất cả các tab) | Nhỏ |
| **A** | scroll.y + EmptyState + showSizeChanger | 3 sửa nhỏ, impact lớn — bảng không còn "thô" nữa | Nhỏ |
| **B** | Success rate visual + actions gộp + sort + filter bar + summary | Tăng UX đáng kể, làm bảng "chuyên nghiệp" | Vừa |

---

## 6. Lưu ý khi thực hiện

1. **Đợt 0 phải chạy script bằng Node.js đọc/ghi buffer** — không dùng `replace_string_in_file` vì chính nó đang không khớp được tiếng Việt.
2. Sau đợt 0, tất cả các chuỗi tiếng Việt trong file sẽ khớp bình thường → các đợt A, B có thể dùng `replace_string_in_file` bình thường.
3. Các tab khác (Đối soát BPMN, Kiểm thử, Log thực thi, Phiên bản & audit) cũng hưởng lợi từ đợt 0 — chữ Việt trong toàn file sẽ được sửa.
4. Sau khi sửa encoding, có thể cần chạy `tsc -b` để verify không có lỗi cú pháp.
5. Các component con (`ServiceTaskFormDrawer`, `ServiceTaskBindingTable`, `ServiceTaskTestPanel`, `ServiceTaskExecutionDrawer`) có file riêng — cần kiểm tra riêng encoding của từng file đó trong đợt riêng.

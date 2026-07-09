# Phân hệ Routing Migration

**Ngày**: 2026-07-09  
**Mục tiêu**: Chuyển các route module về đúng Phân hệ (PH2, PH3) — mỗi Phân hệ có sidebar menu riêng khi người dùng đang ở trong phạm vi Phân hệ đó.

---

## Tổng quan kiến trúc

Trước migration:

```
Global sidebar menu (không phân biệt Phân hệ)
├── Tổng quan                 → /tong-quan
├── Việc của tôi             → /viec-cua-toi
├── Quản trị KHCN
│   ├── Danh sách NV KHCN     → /nhiem-vu
│   └── Danh sách Hồ sơ KHCN  → /ho-so
├── Quản trị quy trình
│   ├── Quản lý quy trình     → /quy-trinh
│   ├── Ma trận quyết định    → /quan-ly-luat
│   ├── Ma trận phê duyệt     → /ma-tran-phe-duyet
│   └── Ma trận Hành động     → /cau-hinh-hanh-dong
├── Vận hành & Tích hợp
│   ├── Giám sát tiến trình   → /giam-sat
│   ├── Tích hợp              → /tich-hop
│   └── Nhật ký               → /nhat-ky
├── Quản trị tổ chức
│   ├── Quản trị đơn vị       → /co-cau-to-chuc
│   ├── Quản trị người dùng   → /nguoi-dung
│   └── Phân quyền            → /phan-quyen
└── Danh mục dùng chung
    └── Thư viện biểu mẫu     → /bieu-mau
```

Sau migration:

```
Khi ở ngoài Phân hệ → Global sidebar menu (giữ nguyên)
Khi ở trong PH2     → PH2 sidebar (Tổng quan, Quản trị đơn vị, Quản trị người dùng, Phân quyền)
Khi ở trong PH3     → PH3 sidebar (Tổng quan, Thư viện biểu mẫu)
```

---

## Cơ chế hoạt động

```ts
// App.tsx
const phanHeContextId =
  location.pathname.startsWith("/phan-he/PH2") ? "PH2" :
  location.pathname.startsWith("/phan-he/PH3") ? "PH3" :
  null;

const PH_MENU_MAP: Record<string, any[]> = {
  PH2: [
    { key: "ph2-tongquan",   icon: <DashboardOutlined />,    label: "Tổng quan" },
    { key: "ph2-donvi",      icon: <ApartmentOutlined />,    label: "Quản trị đơn vị" },
    { key: "ph2-nguoidung",  icon: <TeamOutlined />,         label: "Quản trị người dùng" },
    { key: "ph2-phanquyen",  icon: <KeyOutlined />,          label: "Phân quyền" },
  ],
  PH3: [
    { key: "ph3-tongquan",   icon: <DashboardOutlined />,    label: "Tổng quan" },
    { key: "ph3-bieumau",    icon: <FormOutlined />,         label: "Thư viện biểu mẫu" },
  ],
};

// Sidebar
<Menu items={(phanHeContextId && PH_MENU_MAP[phanHeContextId]) || menuItemsMain} />
```

---

## PH3 — Danh mục dùng chung

### Route mapping

| Route cũ | Route mới | Component |
|----------|-----------|-----------|
| `/bieu-mau` | `/phan-he/PH3/bieu-mau` | `FormLibrary` |
| `/phan-he/PH3` | `/phan-he/PH3/tong-quan` | `PhanHePage` (redirect) |

### Sidebar PH3 (2 items)

| Key | Label | Route | Icon |
|-----|-------|-------|------|
| `ph3-tongquan` | Tổng quan | `/phan-he/PH3/tong-quan` | `DashboardOutlined` |
| `ph3-bieumau` | Thư viện biểu mẫu | `/phan-he/PH3/bieu-mau` | `FormOutlined` |

### Files changed

| File | Changes |
|------|---------|
| `webapp/src/App.tsx` | `ROUTE_BY_KEY`: `bieumau` → `/phan-he/PH3/bieu-mau`; thêm `ph3-tongquan`, `ph3-bieumau`; `selectedKey` check PH3; `SECTION_TITLE` PH3 entries; `PH_MENU_MAP.PH3`; route `/phan-he/PH3/bieu-mau` + `/phan-he/PH3` redirect + `/phan-he/PH3/tong-quan` |
| `webapp/src/data/phanHe.ts` | PH3 modules: `route: '/bieu-mau'` → `'/phan-he/PH3/bieu-mau'` |
| `webapp/src/pages/PhanHePage.tsx` | Accept optional `phanHeId` prop, fallback to `useParams` |

---

## PH2 — Phân quyền & Xác thực tập trung

### Route mapping

| Route cũ | Route mới | Component |
|----------|-----------|-----------|
| `/co-cau-to-chuc` | `/phan-he/PH2/co-cau-to-chuc` | `OrgStructure` |
| `/nguoi-dung` | `/phan-he/PH2/nguoi-dung` | `UserManagement` |
| `/phan-quyen` | `/phan-he/PH2/phan-quyen` | `RolePermission` |
| `/phan-he/PH2` | `/phan-he/PH2/tong-quan` | `PhanHePage` (redirect) |

### Sidebar PH2 (4 items)

| Key | Label | Route | Icon |
|-----|-------|-------|------|
| `ph2-tongquan` | Tổng quan | `/phan-he/PH2/tong-quan` | `DashboardOutlined` |
| `ph2-donvi` | Quản trị đơn vị | `/phan-he/PH2/co-cau-to-chuc` | `ApartmentOutlined` |
| `ph2-nguoidung` | Quản trị người dùng | `/phan-he/PH2/nguoi-dung` | `TeamOutlined` |
| `ph2-phanquyen` | Phân quyền | `/phan-he/PH2/phan-quyen` | `KeyOutlined` |

### Files changed

| File | Changes |
|------|---------|
| `webapp/src/App.tsx` | `ROUTE_BY_KEY`: `donvi/nguoidung/phanquyen` → PH2 paths; thêm 4 key `ph2-*`; `phanHeContextId` detection; `selectedKey`: 4 check PH2, xóa check cũ; `PH_MENU_MAP.PH2`; `SECTION_TITLE` 4 PH2 entries; route: 3 route cũ → `/phan-he/PH2/*`; redirect + tong-quan |
| `webapp/src/data/phanHe.ts` | PH2 modules: routes → `/phan-he/PH2/...` |

---

## Route ordering (quan trọng)

Tất cả route PH2/PH3 cụ thể phải được khai báo **trước** route động `/phan-he/:id` để React Router match chính xác:

```tsx
{/* PH2 specific routes */}
<Route path="/phan-he/PH2/co-cau-to-chuc" element={...} />
<Route path="/phan-he/PH2/nguoi-dung" element={...} />
<Route path="/phan-he/PH2/phan-quyen" element={...} />
<Route path="/phan-he/PH2" element={<Navigate to="/phan-he/PH2/tong-quan" replace />} />
<Route path="/phan-he/PH2/tong-quan" element={<PhanHePage phanHeId="PH2" />} />

{/* PH3 specific routes */}
<Route path="/phan-he/PH3/bieu-mau" element={...} />
<Route path="/phan-he/PH3" element={<Navigate to="/phan-he/PH3/tong-quan" replace />} />
<Route path="/phan-he/PH3/tong-quan" element={<PhanHePage phanHeId="PH3" />} />

{/* Generic fallback — phải đặt SAU CÙNG */}
<Route path="/phan-he/:id" element={<PhanHePage />} />
```

---

## Mở rộng cho PH4+

Pattern đã sẵn sàng, chỉ cần thêm:

1. `ROUTE_BY_KEY`: thêm các key `ph4-*`
2. `phanHeContextId`: thêm `startsWith("/phan-he/PH4")`
3. `selectedKey`: thêm check PH4 ở đầu chain
4. `PH_MENU_MAP.PH4`: định nghĩa menu items
5. `SECTION_TITLE`: thêm entries `ph4-*`
6. Routes: thêm các route PH4 cụ thể trước `/phan-he/:id`

---

## Các file đã sửa

| File | Số vị trí sửa |
|------|---------------|
| `webapp/src/App.tsx` | 12 |
| `webapp/src/data/phanHe.ts` | 2 |
| `webapp/src/pages/PhanHePage.tsx` | 1 |

## Verify

```bash
cd webapp && npm run build   # ✔ built successfully
```

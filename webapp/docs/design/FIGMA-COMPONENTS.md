# Figma Component Inventory — QTKHCN

> **Reference:** Use alongside [DESIGN.md](./DESIGN.md) for complete design specifications  
> **Components:** 25 core components with all states and variants  
> **Last Updated:** 2026-07-23

---

## Table of Contents

1. [Buttons](#1-buttons)
2. [Cards](#2-cards)
3. [Tables](#3-tables)
4. [Forms](#4-forms)
5. [Tags & Badges](#5-tags--badges)
6. [Navigation](#6-navigation)
7. [Modals & Overlays](#7-modals--overlays)
8. [Feedback & Status](#8-feedback--status)
9. [Layout Components](#9-layout-components)
10. [Page Templates](#10-page-templates)

---

## 1. BUTTONS

### 1.1 Primary Button (CTA)

```
┌─────────────────────┐
│     Nút Primary     │  ← 14px, font-weight: 500, white
└─────────────────────┘
```

| Property | Value |
|----------|-------|
| **Background** | `#ee0033` |
| **Text Color** | `#ffffff` |
| **Height** | 36px (default), 28px (small), 40px (large) |
| **Padding** | 16px horizontal |
| **Border Radius** | 8px |
| **Font** | Inter, 14px, 500 |
| **Hover** | Background darkens 10% → `#d4002e` |
| **Active** | Background darkens 15% → `#c00029` |
| **Disabled** | Opacity 0.5, cursor not-allowed |
| **Loading** | Spinner replaces text, maintains width |

**Figma Specs:**
- Background: `Fill: #ee0033`
- Effects: `Shadow: 0 2px 0 rgba(0,0,0,0.1)` (subtle depth)
- Auto-layout: horizontal, padding 16px 16px

### 1.2 Default Button

```
┌─────────────────────┐
│     Nút Default     │  ← 14px, font-weight: 500, #1c1c1c
└─────────────────────┘
```

| Property | Value |
|----------|-------|
| **Background** | `#ffffff` |
| **Border** | `1px solid #e6e9ee` |
| **Text Color** | `#1c1c1c` |
| **Height** | 36px |
| **Border Radius** | 8px |
| **Hover** | Background: `#f5f3f3`, border-color: `#c7cfda` |
| **Active** | Background: `#e6e9ee` |

### 1.3 Danger Button

| Property | Value |
|----------|-------|
| **Background** | `#ba1a1a` |
| **Text Color** | `#ffffff` |
| **Hover** | `#a80017` |
| **Usage** | Delete, Remove, Destructive actions |

### 1.4 Text/Link Button

| Property | Value |
|----------|-------|
| **Background** | Transparent |
| **Text Color** | `#ee0033` |
| **Padding** | 4px 8px |
| **Hover** | Text decoration: underline |

### 1.5 Icon Button (Ghost)

| Property | Value |
|----------|-------|
| **Background** | Transparent |
| **Icon Color** | `#1c1c1c` or `#ee0033` (brand) |
| **Size** | 28px × 28px (small), 36px × 36px (default) |
| **Border Radius** | 8px |
| **Hover** | Background: `rgba(238, 0, 51, 0.08)` |

### 1.6 Button Group

```
┌──────────┬──────────┬──────────┐
│ Button A │ Button B │ Button C │
└──────────┴──────────┴──────────┘
```

- Gap: 0 (buttons stack with shared border)
- First button: border-radius 8px 0 0 8px
- Last button: border-radius 0 8px 8px 0
- Middle buttons: border-radius 0
- Active button: background `#ee0033`, text white

---

## 2. CARDS

### 2.1 Standard Card

```
┌─────────────────────────────────────────────────┐
│ Card Title                              [actions]│  ← font: 16px/600, color: #1c1c1c
├─────────────────────────────────────────────────┤
│                                                  │
│  Card content goes here                          │
│  - List items                                    │
│  - Tables                                        │
│  - Text blocks                                   │
│                                                  │
└─────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| **Background** | `#ffffff` |
| **Border** | `1px solid #e6e9ee` |
| **Border Radius** | 8px |
| **Header Padding** | 16px |
| **Body Padding** | 24px |
| **Header Border** | `1px solid #e6e9ee` (bottom only) |
| **No Shadow** | Flat design by default |

**Figma Specs:**
- Frame with auto-layout (vertical)
- Header: fixed height, border bottom
- Body: hug contents

### 2.2 Card with Tabs

```
┌─────────────────────────────────────────────────┐
│ [Tab 1]  [Tab 2]  [Tab 3]              [actions]│
├─────────────────────────────────────────────────┤
│                                                  │
│  Tab content                                     │
│                                                  │
└─────────────────────────────────────────────────┘
```

- Tab bar replaces header title area
- Active tab: bottom border 2px `#ee0033`, text `#ee0033`
- Inactive tab: text `#5e3f3e`
- Tab hover: text `#ee0033`

### 2.3 Bento Card (Interactive)

Same as Standard Card but with hover effect:

| Property | Value |
|----------|-------|
| **Default** | No shadow, no transform |
| **Hover** | `translateY(-2px)`, `box-shadow: 0 4px 12px rgba(0,0,0,0.08)` |
| **Transition** | 0.2s ease |

### 2.4 Stat Card (Small)

```
┌─────────────────┐
│      128        │  ← 28px, font-weight: 700, color varies
│  Tổng biểu mẫu  │  ← 12px, color: #5e3f3e
└─────────────────┘
```

| Property | Value |
|----------|-------|
| **Width** | Flexible (in grid) |
| **Height** | Auto (content-driven) |
| **Value Size** | 28px, weight 700 |
| **Label Size** | 12px, color: `#5e3f3e` |
| **Padding** | 16px |
| **Common Colors** | `#ee0033` (brand), `#1677ff` (info), `#8c8c8c` (muted) |

---

## 3. TABLES

### 3.1 Standard Table

```
┌─────┬────────────────┬──────────┬───────────┬─────────────┐
│  ☐  │ Biểu mẫu    ▼ │ Mã      │ Loại     │ Số trường  │ Thao tác  │
├─────┼────────────────┼──────────┼───────────┼─────────────┼─────────────┤
│  ☐  │ Phiếu đánh... │ phieu... │ Góp ý    │     8      │ 👁 ✏️ 🗑   │
│  ☐  │ BM.01 Chủ... │ bm01... │ Phê duyệt│    12      │ 👁 ✏️ 🗑   │
└─────┴────────────────┴──────────┴───────────┴─────────────┴─────────────┘
```

**Header Row:**

| Property | Value |
|----------|-------|
| **Background** | `#f5f3f3` |
| **Text** | 14px, weight 600, color `#1c1c1c` |
| **Padding** | 12px 16px |
| **Sort Icon** | `#ee0033` when active |
| **Border Bottom** | `1px solid #e6e9ee` |

**Data Rows:**

| Property | Value |
|----------|-------|
| **Background** | `#ffffff` |
| **Hover Background** | `#fbf9f9` |
| **Text** | 14px, weight 400, color `#1c1c1c` |
| **Padding** | 12px 16px |
| **Border Bottom** | `1px solid #e6e9ee` |
| **Selection** | Checkbox leftmost column |

**Figma Specs:**
- Use Figma's Table component
- Set column widths explicitly
- Enable sorting indicators

### 3.2 Table Cell Variants

| Type | Style |
|------|-------|
| **Text** | 14px, `#1c1c1c` |
| **Secondary Text** | 14px, `#5e3f3e` |
| **Code/Mono** | 13px mono, `#1c1c1c`, bg `#f5f3f3`, border-radius 4px, padding 2px 6px |
| **Number** | 14px, right-aligned |
| **Status Badge** | Inline Tag component |

### 3.3 Expandable Table Row

```
┌─────┬────────────────┬──────────┬───────────┐
│  ☐  │ Parent Row     │ Data     │ Actions   │
├─────┼────────────────┼──────────┼───────────┤
│     │ ▼ Expanded     │          │           │  ← chevron rotates 90°
│     │   ├─ Child 1   │          │           │  ← indented, lighter bg
│     │   └─ Child 2   │          │           │
└─────┴────────────────┴──────────┴───────────┘
```

- Expand icon: `<DownOutlined />` rotates 90° when expanded
- Child rows: slightly indented (24px), background `#fbf9f9`
- Border between parent and children: 2px solid `#c7cfda`

---

## 4. FORMS

### 4.1 Text Input

```
┌─────────────────────────────────────────────────┐
│ Label                                    (i)    │  ← 12px, color: #5e3f3e, margin-bottom: 4px
│                                                 │
│ Placeholder text                                │  ← 14px, color: #1c1c1c, height: 36px
│                                                 │
└─────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| **Height** | 36px |
| **Border** | `1px solid #e6e9ee` |
| **Border Radius** | 8px |
| **Padding** | 8px 12px |
| **Background** | `#ffffff` |
| **Font** | 14px, `#1c1c1c` |
| **Focus** | Border: `#ee0033`, Box-shadow: `0 0 0 2px rgba(238,0,51,0.1)` |
| **Error** | Border: `#ba1a1a`, helper text below in red |
| **Disabled** | Background: `#f5f3f3`, opacity: 0.6 |

### 4.2 Text Area

| Property | Value |
|----------|-------|
| **Height** | Auto (min 72px, 2 rows default) |
| **Resize** | Vertical only |
| **Same styling as Text Input otherwise** |

### 4.3 Select/Dropdown

```
┌─────────────────────────────────────────────────┐
│ Chọn một giá trị                         ▼     │  ← chevron right-aligned
└─────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| **Same base styling as Text Input** |
| **Chevron** | `#5e3f3e`, positioned right |
| **Dropdown Menu** | White bg, border `#e6e9ee`, shadow `0 4px 12px rgba(0,0,0,0.1)` |
| **Option Hover** | Background: `#fbf9f9` |
| **Selected Option** | Background: `#fff1f3`, text `#ee0033` |
| **Clearable** | X button appears when value selected |

### 4.4 Checkbox

```
☐  Label text
☑  Label text (checked)
```

| Property | Value |
|----------|-------|
| **Size** | 16px × 16px |
| **Unchecked Border** | `1px solid #c7cfda` |
| **Checked Fill** | `#ee0033` |
| **Check Mark** | White, 2px stroke |
| **Label** | 14px, `#1c1c1c` |
| **Disabled** | Opacity 0.5 |

### 4.5 Radio

```
○  Option A
●  Option B (selected)
```

| Property | Value |
|----------|-------|
| **Size** | 16px diameter |
| **Unchecked Border** | `1px solid #c7cfda` |
| **Selected Fill** | `#ee0033` center dot (8px) |
| **Label** | 14px, `#1c1c1c` |

### 4.6 Date Picker

| Property | Value |
|----------|-------|
| **Same base styling as Text Input** |
| **Calendar Icon** | Right side, `#5e3f3e` |
| **Calendar Dropdown** | White bg, shadow, border-radius 8px |
| **Selected Date** | Background: `#ee0033`, text white |
| **Today** | Border: `1px solid #ee0033` |

### 4.7 Form Layout

```
┌─────────────────────────────────────────┐
│ Label                                    │  ← Required indicator: red *
│ [Input Field]                            │
│ [Error message if any]                   │  ← 12px, color: #ba1a1a
├─────────────────────────────────────────┤
│ Label                                    │
│ [Input Field]                            │
│ [Helper text]                            │  ← 12px, color: #5e3f3e
└─────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| **Vertical Gap** | 16px between form items |
| **Label Margin** | 0 (above input only) |
| **Required** | Red asterisk after label |
| **Error Color** | `#ba1a1a` |

---

## 5. TAGS & BADGES

### 5.1 Status Tag (Filled)

```
┌──────────────────┐
│ ● Đang xử lý     │  ← 12px, white on #ee0033
└──────────────────┘
```

| Status | Background | Text |
|--------|------------|------|
| Mới | `#e6f4ff` | `#1677ff` |
| Đang xử lý | `#fff1f3` | `#ee0033` |
| Hoàn thành | `#f6ffed` | `#006e0d` |
| Từ chối | `#fff2f0` | `#ba1a1a` |
| Chờ duyệt | `#fff7e6` | `#daa520` |

| Property | Value |
|----------|-------|
| **Padding** | 2px 8px |
| **Border Radius** | 6px |
| **Font** | 12px, weight 500 |
| **Dot indicator** | 6px circle before text |

### 5.2 Role Tag (Hội đồng)

```
┌──────────────┐
│ 🔴 Chủ tịch  │  ← Red
├──────────────┤
│ 🟠 Phản biện 1│  ← Orange
├──────────────┤
│ 🔵 Ủy viên   │  ← Blue
├──────────────┤
│ 🟢 Thư ký KH │  ← Green
└──────────────┘
```

| Role | Color | Hex |
|------|-------|-----|
| Chủ tịch (CHU_TICH) | Red | `#ee0033` |
| Phản biện 1 (PHAN_BIEN_1) | Orange | `#daa520` |
| Phản biện 2 (PHAN_BIEN_2) | Orange | `#daa520` |
| Ủy viên (UY_VIEN) | Blue | `#1677ff` |
| Thư ký KH (THU_KY_KH) | Green | `#006e0d` |

### 5.3 Count Badge

```
┌───┐
│ 5 │  ← 18px × 18px, white on #ee0033
└───┘
```

| Property | Value |
|----------|-------|
| **Size** | Min 20px × 20px (expands with number) |
| **Border Radius** | 10px (full pill) |
| **Background** | `#ee0033` |
| **Text** | 12px, weight 600, white |
| **Position** | Top-right of parent element |

### 5.4 Usage Tag

```
┌─────────────┐
│ 3 bước     │  ← Shows how many steps reference this item
└─────────────┘
```

- Background: `#ee0033`, text: white
- Used in: Form Library (binding count)

### 5.5 Code Tag

```
┌──────────────────────┐
│ phieu-chu-truong     │  ← Mono font, light background
└──────────────────────┘
```

| Property | Value |
|----------|-------|
| **Font** | IBM Plex Mono, 13px |
| **Background** | `#f5f3f3` |
| **Padding** | 2px 6px |
| **Border Radius** | 4px |

---

## 6. NAVIGATION

### 6.1 Sidebar (Sider)

```
┌────────────────────────┐
│                        │
│  ┌──────┐              │
│  │ VHT  │ QTKHCN       │  ← 82px height, border bottom
│  └──────┘ Quản trị KHCN│
│                        │
├────────────────────────┤
│ 📊 Tổng quan          │
│ 📋 Việc của tôi   (3) │
│ 🧪 Quản trị KHCN  ▶   │  ← expanded
│   └─ Danh sách NV      │
│   └─ Danh sách HS      │
│ ⚙️ Quản trị quy trình▶ │
│   └─ Quản lý quy trình│
│   └─ Ma trận quyết định│
│   └─ Ma trận phê duyệt│
│ ⚡ Giám sát           │
│ 👥 Hội đồng           │
│ 🔗 Tích hợp           │
│                        │
├────────────────────────┤
│ 📖 Hướng dẫn sử dụng  │  ← Fixed bottom, #bf0027 bg
└────────────────────────┘
```

| Property | Value |
|----------|-------|
| **Width** | 230px (expanded), 80px (collapsed) |
| **Background** | `#1c1c1c` (INK) |
| **Header Height** | 82px |
| **Header Background** | `#1c1c1c`, border-bottom: `rgba(255,255,255,0.15)` |
| **Logo Box** | 36px × 36px, border-radius 8px |
| **Item Height** | 40px |
| **Item Padding** | 12px 16px |
| **Item Text** | 14px, `rgba(255,255,255,0.78)` |
| **Item Hover** | Background: `rgba(255,255,255,0.10)` |
| **Item Selected** | Background: `#ee0033`, text: white |
| **Submenu Item** | Indented 24px, text: `rgba(255,255,255,0.65)` |
| **Help Button** | Background: `#bf0027`, hover: `#a80022` |

### 6.2 Breadcrumb

```
Hệ thống QTKHCN / Quản trị KHCN / Hồ sơ
```

| Property | Value |
|----------|-------|
| **Separator** | `/` (slash), color: `#d4a5a3` |
| **Parent Items** | Color: `#bf0027`, hover: `#ee0033` |
| **Current Item** | Color: `#ee0033`, no link |
| **Font** | 14px |
| **Spacing** | 8px between items |

### 6.3 Page Header

```
┌────────────────────────────────────────────────────────────────┐
│ ← [Icon]  Tiêu đề trang                      [Button] [Button]│
│        Breadcrumb / Path / Here                                │
└────────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| **Icon** | 24px, `#ee0033` |
| **Title** | 24px, weight 700, `#1c1c1c` |
| **Actions** | Right-aligned, 8px gap between buttons |
| **Padding** | 24px |
| **Border Bottom** | `1px solid #e6e9ee` |

### 6.4 Tab Navigation

```
┌────────┬────────┬────────┬────────────────┐
│ Tab A  │ Tab B ●│ Tab C  │                │ ← active has bottom border
└────────┴────────┴────────┴────────────────┘
```

| Property | Value |
|----------|-------|
| **Tab Height** | 40px |
| **Tab Padding** | 16px horizontal |
| **Default Text** | 14px, `#5e3f3e` |
| **Active Text** | `#ee0033`, border-bottom: 2px `#ee0033` |
| **Hover** | Text: `#ee0033` |
| **Gap between tabs** | 0 (tabs share border) |

---

## 7. MODALS & OVERLAYS

### 7.1 Modal (Dialog)

```
┌──────────────────────────────────────────────────────────────┐
│ Tiêu đề Modal                                      [X]      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Modal content goes here                                     │
│                                                              │
│  - Forms                                                     │
│  - Tables                                                    │
│  - Information                                               │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                         [Hủy]  [Xác nhận]   │
└──────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| **Width** | 400px (small), 560px (default), 800px (large) |
| **Border Radius** | 12px |
| **Header Padding** | 16px 24px |
| **Header Border** | `1px solid #e6e9ee` (bottom) |
| **Body Padding** | 24px |
| **Footer** | 16px 24px, border-top: `1px solid #e6e9ee` |
| **Footer Buttons** | Right-aligned, 8px gap |
| **Overlay** | `rgba(0, 0, 0, 0.45)` |
| **Close Button** | Top-right, `#5e3f3e` color |

### 7.2 Drawer (Slide-in Panel)

```
┌──────────────────────────────────┐
│ Tiêu đề Drawer            [X]   │
├──────────────────────────────────┤
│                                  │
│  Content                         │
│                                  │
│                                  │
│                                  │
├──────────────────────────────────┤
│              [Cancel]  [OK]      │
└──────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| **Width** | 360px (small), 480px (default), 640px (large) |
| **Position** | Right edge |
| **Background** | `#ffffff` |
| **Border Radius** | 0 (full height) |
| **Shadow** | `-6px 0 16px rgba(0,0,0,0.1)` |
| **Overlay** | `rgba(0, 0, 0, 0.45)` |

### 7.3 Popconfirm (Confirmation Popup)

```
┌─────────────────────────────────┐
│                                 │
│     Xoá biểu mẫu?               │
│     Mô tả cảnh báo...           │
│                                 │
│          [Huỷ]  [Xoá]          │  ← Xoá button is danger style
└─────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| **Min Width** | 200px |
| **Padding** | 12px 16px |
| **Border Radius** | 8px |
| **Shadow** | `0 4px 12px rgba(0,0,0,0.15)` |

---

## 8. FEEDBACK & STATUS

### 8.1 Alert/Message

```
┌─────────────────────────────────────────────────┐
│ ℹ️  This is an informational message            │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ⚠️  This is a warning message                  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ✅  This is a success message                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ ❌  This is an error message                    │
└─────────────────────────────────────────────────┘
```

| Type | Icon | Border | Background | Text |
|------|------|--------|------------|------|
| Info | Blue info | Left 4px blue | `#e6f4ff` | `#1677ff` |
| Success | Green check | Left 4px green | `#f6ffed` | `#006e0d` |
| Warning | Orange warning | Left 4px orange | `#fff7e6` | `#daa520` |
| Error | Red x | Left 4px red | `#fff2f0` | `#ba1a1a` |

| Property | Value |
|----------|-------|
| **Padding** | 12px 16px |
| **Border Radius** | 8px |
| **Font** | 14px |

### 8.2 Spin (Loading)

```
    ◌
  Loading...
```

| Property | Value |
|----------|-------|
| **Size** | 24px (inline), 40px (page) |
| **Color** | `#ee0033` (brand) |
| **Text** | 14px, `#5e3f3e`, below spinner |

### 8.3 Empty State

```
       ┌─────────────────┐
       │   📋            │  ← 48px icon, #8593a3
       │                 │
       │  Chưa có dữ liệu│  ← 16px, weight 600, #1c1c1c
       │                 │
       │  Mô tả ngắn     │  ← 14px, #5e3f3e
       │                 │
       │  [Tạo mới]      │  ← primary button
       └─────────────────┘
```

| Property | Value |
|----------|-------|
| **Icon Size** | 48px, color: `#8593a3` |
| **Title** | 16px, weight 600, `#1c1c1c` |
| **Description** | 14px, `#5e3f3e`, max-width 280px |
| **Centered** | Yes, with flexbox |

### 8.4 Progress

| Property | Value |
|----------|-------|
| **Track** | `#e6e9ee` |
| **Fill** | `#ee0033` |
| **Height** | 8px (line), 4px (small) |
| **Border Radius** | 4px |

### 8.5 Tooltip

```
        ┌────────────────────┐
        │ Tooltip content    │  ← 12px, white on #1c1c1c
        └────────────────────┘
              ▼ (arrow)
```

| Property | Value |
|----------|-------|
| **Background** | `#1c1c1c` |
| **Text** | 12px, white |
| **Padding** | 6px 8px |
| **Border Radius** | 6px |
| **Max Width** | 250px |
| **Position** | Above element (default), can be any side |

---

## 9. LAYOUT COMPONENTS

### 9.1 Divider

```
────────────────────────────
```
or with label:
```
──────── Tiêu đề ────────
```

| Property | Value |
|----------|-------|
| **Color** | `#e6e9ee` |
| **Height** | 1px |
| **Margin** | 16px 0 |

### 9.2 Space

| Size | Value |
|------|-------|
| xs | 4px |
| sm | 8px |
| md | 12px |
| lg | 16px |
| xl | 24px |
| xxl | 32px |

**Usage:** `<Space direction="horizontal" size={16}>...</Space>`

### 9.3 Row & Column (Grid)

- Based on Ant Design Grid (24 columns)
- Gutter: 24px (horizontal), 24px (vertical)
- Breakpoints: xs (<576px), sm, md, lg, xl, xxl

**Example 4-column layout:**
```
Row:
  Col span={6}  │ Col span={6}  │ Col span={6} │ Col span={6}
```

### 9.4 Avatar

```
┌──────┐
│  NV  │  ← Initials
└──────┘
```

| Property | Value |
|----------|-------|
| **Size** | 32px (small), 40px (default), 64px (large) |
| **Background** | `#ffdad8` |
| **Text** | `#bf0027`, weight 700 |
| **Border Radius** | 50% (circle) |
| **Font Size** | 14px (small), 16px (default), 24px (large) |

---

## 10. PAGE TEMPLATES

### 10.1 List Page (e.g., Form Library)

```
┌─────────────────────────────────────────────────────────────────┐
│ Header: [←] [FormOutlined] Thư viện biểu mẫu         [Help]     │
│         Hệ thống QTKHCN / Thư viện biểu mẫu                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                   │
│  │  Tổng  │ │ Đang   │ │ Chưa   │ │ Bước   │  ← Stats row      │
│  │  156   │ │ gán 12 │ │ gán144 │ │ 48     │                   │
│  └────────┘ └────────┘ └────────┘ └────────┘                   │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Biểu mẫu        │ Mã        │ Loại   │ Số trường│ Thao tác│ │
│  ├─────────────────┼───────────┼────────┼──────────┼─────────┤ │
│  │ Phiếu đánh giá  │ phieu...  │ Góp ý  │    8     │ 👁 ✏️ 🗑│ │
│  │ BM.01 Chủ trì   │ bm01...   │ Phê... │   12     │ 👁 ✏️ 🗑│ │
│  └─────────────────┴───────────┴────────┴──────────┴─────────┘ │
│                                                                 │
│  [+ Tạo biểu mẫu]                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 Detail Page (e.g., Dossier Detail)

```
┌─────────────────────────────────────────────────────────────────┐
│ Header: [←] [FileTextOutlined] Chi tiết hồ sơ      [Edit][Del] │
│         Hệ thống QTKHCN / Quản trị KHCN / Hồ sơ               │
├─────────────────────────────────────┬───────────────────────────┤
│ LEFT COLUMN (16/24)                 │ RIGHT COLUMN (8/24)       │
│                                     │                           │
│ ┌─────────────────────────────────┐ │ ┌───────────────────────┐ │
│ │ 📋 Thông tin hồ sơ              │ │ │ 📊 Tóm tắt            │ │
│ │                                   │ │ │ Loại: RD02.02         │ │
│ │ Mã hồ sơ: HS-2026-043           │ │ │ Cấp: Cơ sở            │ │
│ │ Tên đề tài: Nghiên cứu...       │ │ │ Ngày tạo: 2026-01-15  │ │
│ │ Lĩnh vực: AI                    │ │ │ Trạng thái: Đang xử lý│ │
│ │ Chủ nhiệm: Nguyễn Văn A         │ │ └───────────────────────┘ │
│ └─────────────────────────────────┘ │                           │
│                                     │ ┌───────────────────────┐ │
│ ┌─────────────────────────────────┐ │ │ ⚡ Hành động nhanh     │ │
│ │ 📝 Quy trình xử lý              │ │ │                       │ │
│ │                                   │ │ │ [Gửi duyệt]          │ │
│ │  [BPMN Diagram]                  │ │ │ [Từ chối]            │ │
│ │                                   │ │ │ [Yêu cầu bổ sung]    │ │
│ └─────────────────────────────────┘ │ └───────────────────────┘ │
│                                     │                           │
│ ┌─────────────────────────────────┐ │                           │
│ │ 📎 Tài liệu / Phiếu             │ │                           │
│ │   [Document list with actions]  │ │                           │
│ └─────────────────────────────────┘ │                           │
│                                     │                           │
│ ┌─────────────────────────────────┐ │                           │
│ │ 👥 Hội đồng xét duyệt           │ │                           │
│ │   [Member table with roles]     │ │                           │
│ └─────────────────────────────────┘ │                           │
└─────────────────────────────────────┴───────────────────────────┘
```

### 10.3 Form Designer Page

```
┌─────────────────────────────────────────────────────────────────┐
│ Header: [←] [FormOutlined] Thiết kế biểu mẫu      [Cancel][Save]│
│         Hệ thống QTKHCN / Thư viện biểu mẫu / BM.01            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Kéo–thả các trường từ dock Thành phần (trái), chỉnh thuộc tính │
│ ở dock phải, bật Xem trước để thấy form render trực tiếp.     │
│                                                                 │
│ ┌─────────────┐  ┌────────────────────────────────┐  ┌────────┐│
│ │ COMPONENTS  │  │                                │  │ PROPS  ││
│ ├─────────────┤  │                                │  ├────────┤│
│ │ Text Input  │  │     Canvas / Form Preview      │  │ Label  ││
│ │ Text Area   │  │                                │  │ Key    ││
│ │ Number      │  │                                │  │ Req.   ││
│ │ Select      │  │                                │  │ Place. ││
│ │ Date        │  │                                │  │        ││
│ │ Checkbox    │  │                                │  │        ││
│ │ Radio       │  │                                │  │        ││
│ │ File Upload │  │                                │  │        ││
│ │ Signature   │  │                                │  │        ││
│ └─────────────┘  └────────────────────────────────┘  └────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 10.4 Dashboard Page

```
┌─────────────────────────────────────────────────────────────────┐
│ Header: [Breadcrumb]                    [Backend Demo] [User]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Tổng hồ sơ  │  │ Đang xử lý   │  │ Hoàn thành   │          │
│  │     128      │  │     45       │  │     83       │          │
│  │   ↑ 12%      │  │   ↓ 5%       │  │   ↑ 23%      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ┌─────────────────────────────────┐  ┌────────────────────────┐│
│  │ Top 10 người xử lý nhiều HS     │  │ Quy trình active       ││
│  │                                  │  │                        ││
│  │ 1. Nguyễn Văn A     ████████ 56 │  │ • RD02.02 Quy trình... ││
│  │ 2. Trần Thị B       ███████ 48 │  │ • RD01.01 Quy trình... ││
│  │ 3. Lê Văn C         ██████ 40  │  │ • RD05.01 Quy trình... ││
│  │                                  │  │                        ││
│  │                                  │  │                        ││
│  └─────────────────────────────────┘  └────────────────────────┘│
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Hồ sơ gần đây                                             │ │
│  │ ─────────────────────────────────────────────────────────  │ │
│  │ HS-2026-043 | RD02.02 | Đang xử lý | Bước 7/12            │ │
│  │ HS-2026-042 | RD01.01 | Hoàn thành  | Bước 12/12          │ │
│  │ HS-2026-041 | RD05.01 | Từ chối     | Bước 5/8            │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference: Color Tokens for Figma

| Token | Hex | Usage |
|-------|-----|-------|
| `vht-red` | #ee0033 | Primary buttons, links, brand |
| `vht-red-chrome` | #bf0027 | Sidebar, dark headers |
| `vht-success` | #006e0d | Success states |
| `vht-warning` | #daa520 | Warnings, amber |
| `vht-danger` | #ba1a1a | Errors, delete |
| `vht-ink` | #1c1c1c | Primary text |
| `vht-ink-2` | #5e3f3e | Secondary text |
| `vht-surface` | #ffffff | Cards, inputs |
| `vht-surface-2` | #fbf9f9 | Page background |
| `vht-border` | #e6e9ee | Borders |

---

*Last updated: 2026-07-23*
*Based on: Ant Design v5 + VHT Military Red Design System*
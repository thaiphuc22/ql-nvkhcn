# QTKHCN Design System — VHT Military Red

> **Design System Name:** VHT Military Red  
> **Based on:** Ant Design v5 + Material 3 principles  
> **Version:** 1.0  
> **Last Updated:** 2026-07-23

---

## 1. Brand Overview

### 1.1 Brand Identity

| Attribute | Value |
|-----------|-------|
| **Brand Name** | Viettel High Tech (VHT) |
| **Design System Name** | VHT Military Red |
| **Brand Personality** | Authoritative, Professional, Military-grade reliability |
| **Design Principles** | Clear hierarchy, functional minimalism, high contrast for readability |

### 1.2 Color Philosophy

The design uses a **dual-red system** that分层 correctly:
- **CHROME (Sidebar)** = `#bf0027` — deep, authoritative red for navigation chrome
- **ACTION (CTA/Brand)** = `#ee0033` — vibrant brand red for primary actions

This ensures:
- Sidebar is visually recessed (background/chrome)
- Primary buttons and brand elements pop forward (foreground/action)
- Clear visual hierarchy without relying on blue

---

## 2. Color Palette

### 2.1 Brand Colors (Red System)

```css
/* Primary Colors */
--vht-red:           #ee0033;  /* primary-container — CTA / brand / primary buttons */
--vht-red-chrome:    #bf0027;  /* primary — sidebar background, headers */
--vht-red-dark:     #a80022;  /* hover states on chrome */

/* Red Shades (for backgrounds, hover, etc.) */
--vht-red-050:      #fff1f3;  /* lightest red tint */
--vht-red-100:      #ffdad8;  /* primary-fixed / disabled backgrounds */
```

### 2.2 Semantic Colors

```css
/* Success — Tertiary (Green) */
--vht-success:      #006e0d;  /* tertiary — success states */

/* Warning — Amber */
--vht-warning:     #daa520;  /* amber — warnings, pending states */

/* Danger — Error (Red) */
--vht-danger:      #ba1a1a;  /* error — destructive actions, errors */
```

### 2.3 Surface & Foreground Colors

```css
/* Surfaces */
--vht-surface:      #ffffff;  /* surface-container-lowest — cards, inputs */
--vht-surface-2:    #fbf9f9;  /* background / main surface — page background */
--vht-surface-3:    #f5f3f3;  /* surface-container-low — hover backgrounds */

/* Ink (Text) */
--vht-ink:          #1c1c1c;  /* on-surface — primary text */
--vht-ink-2:        #5e3f3e;  /* on-surface-variant — secondary text */
--vht-ink-3:        #8593a3;  /* disabled, placeholder text */

/* Borders */
--vht-border:       #e6e9ee;  /* default borders */
--vht-border-strong: #c7cfda; /* emphasis borders */
--vht-outline:      #e8bcba;  /* outline-variant (warm tone) */
```

### 2.4 Dark Mode / Sidebar Colors

```css
/* For BPMN skin and dark contexts */
--vht-dark:         #0f1722;  /* dark background */
--vht-dark-border:  #1d2937;  /* dark borders */
```

### 2.5 Color Usage Map

| Token | Usage |
|-------|-------|
| `--vht-red` | Primary buttons, links, active states, brand accents |
| `--vht-red-chrome` | Sidebar background, header accents |
| `--vht-red-dark` | Sidebar hover states |
| `--vht-success` | Success badges, completed states |
| `--vht-warning` | Warning badges, pending states |
| `--vht-danger` | Error states, delete buttons, error text |
| `--vht-surface` | Card backgrounds, modal backgrounds |
| `--vht-surface-2` | Page background |
| `--vht-ink` | Primary text, headings |
| `--vht-ink-2` | Secondary text, descriptions |
| `--vht-border` | Table borders, input borders |

---

## 3. Typography

### 3.1 Font Stack

```css
/* Primary Font — for all UI text */
--vht-font: Inter, system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

/* Monospace Font — for code, IDs, technical data */
--vht-font-mono: 'IBM Plex Mono', 'Cascadia Mono', Consolas, monospace;
```

### 3.2 Font Usage Guidelines

| Font | Usage |
|------|-------|
| **Inter** (primary) | All UI text, headings, body, buttons, labels |
| **IBM Plex Mono** | `formKey`, `maHoSo`, `maNhiemVu`, code snippets, IDs |

### 3.3 Type Scale (Based on Ant Design Defaults)

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Page Title | 24px | 700 | 1.2 |
| Section Heading | 18px | 600 | 1.3 |
| Card Title | 16px | 600 | 1.4 |
| Body Text | 14px | 400 | 1.5 |
| Secondary Text | 12px | 400 | 1.5 |
| Small/Caption | 12px | 400 | 1.4 |
| Code/Mono | 13px | 400 | 1.5 |

---

## 4. Spacing System

### 4.1 Base Unit

**4px** is the base unit for all spacing.

### 4.2 Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--vht-space-xs` | 4px | Tight spacing, icon gaps |
| `--vht-space-sm` | 8px | Between related items |
| `--vht-space-md` | 12px | Default padding |
| `--vht-space-lg` | 16px | Card padding, section gaps |
| `--vht-space-xl` | 24px | Page padding, major sections |
| `--vht-space-2xl` | 32px | Between cards/sections |

### 4.3 Border Radius

```css
--vht-radius:      8px;   /* Default — cards, buttons, inputs */
--vht-radius-sm:   6px;   /* Small elements — tags, badges */
--vht-radius-lg:   12px;  /* Large containers — modals */
```

---

## 5. Components

### 5.1 Buttons

#### Primary Button
- Background: `--vht-red` (#ee0033)
- Text: white
- Border-radius: `--vht-radius` (8px)
- Height: 36px (default), 28px (small)
- Hover: darken 10%
- Active: darken 15%
- Disabled: opacity 0.5

#### Default Button
- Background: white
- Border: `--vht-border`
- Text: `--vht-ink`
- Hover: `--vht-surface-3` background
- Border-radius: 8px

#### Text/Link Button
- Background: transparent
- Text: `--vht-red`
- Hover: underline

#### Danger Button
- Background: `--vht-danger` (#ba1a1a)
- Text: white
- Used for: Delete, Remove, Destructive actions

### 5.2 Cards

#### Standard Card
```
┌──────────────────────────────────────┐
│ Title                      [actions] │  ← 16px padding, font-weight: 600
├──────────────────────────────────────┤
│ Content                              │  ← 24px padding
│                                      │
└──────────────────────────────────────┘
- Background: white
- Border-radius: 8px
- Border: 1px solid --vht-border
- Box-shadow: none (flat design)
- Hover (bento cards): translateY(-2px), box-shadow 0 4px 12px rgba(0,0,0,0.08)
```

#### Card Variants
- **Flat Card**: No border, subtle shadow
- **Bento Card**: Hover lift effect for card grids
- **Card with Tabs**: Tabs inside the card header

### 5.3 Tables

#### Standard Table
```
┌─────┬─────────────┬──────────┬────────────┐
│ Col1│ Col2        │ Col3     │ Actions    │  ← header: bg --vht-surface-3, font-weight: 600
├─────┼─────────────┼──────────┼────────────┤
│ ... │ ...         │ ...      │ [btns]     │  ← row hover: --vht-surface-2
│ ... │ ...         │ ...      │ [btns]     │
└─────┴─────────────┴──────────┴────────────┘
```
- Header: `--vht-surface-3` background, 600 weight
- Rows: white background
- Row hover: `--vht-surface-2`
- Border: `--vht-border`
- Border-radius: 8px (card container)
- Cell padding: 12px 16px

#### Table Features
- Sortable columns (sort icons in header)
- Row selection (checkboxes)
- Expandable rows
- Sticky header on scroll

### 5.4 Forms

#### Input Fields
```
┌─────────────────────────────┐
│ Label                       │  ← 12px font, --vht-ink-2, margin-bottom: 4px
├─────────────────────────────┤
│ Placeholder text            │  ← 14px, --vht-ink, 36px height, border-radius: 8px
└─────────────────────────────┘
- Border: 1px solid --vht-border
- Focus: border-color: --vht-red, box-shadow: 0 0 0 2px rgba(238,0,51,0.1)
- Error: border-color: --vht-danger
- Disabled: bg: --vht-surface-3, opacity: 0.6
```

#### Form Layout
- Vertical form with 16px gap between items
- Label above input (not inline)
- Required field: red asterisk (*) after label
- Validation messages: 12px, --vht-danger, below input

### 5.5 Tags & Badges

#### Status Tags

| Status | Color | Background | Text |
|--------|-------|------------|------|
| Mới | Blue | #e6f4ff | #1677ff |
| Đang xử lý | Processing (red) | #fff1f3 | #ee0033 |
| Hoàn thành | Green | #f6ffed | #006e0d |
| Từ chối | Red | #fff2f0 | #ba1a1a |
| Chờ duyệt | Orange | #fff7e6 | #daa520 |

#### Role Tags (Hội đồng)

| Role | Color | Usage |
|------|-------|-------|
| Chủ tịch | Red (#ee0033) | CHU_TICH |
| Phản biện 1 | Orange (#daa520) | PHAN_BIEN_1 |
| Phản biện 2 | Orange (#daa520) | PHAN_BIEN_2 |
| Ủy viên | Blue (#1677ff) | UY_VIEN |
| Thư ký KH | Green (#006e0d) | THU_KY_KH |

#### Count Badges
- Background: `--vht-red`
- Text: white
- Border-radius: 10px (pill shape)
- Min-width: 20px
- Used for: notification counts, pending task counts

### 5.6 Navigation

#### Sidebar (Sider)
```
┌─────────────────┐
│ [Logo/Title]    │  ← 82px height, INK background, white text
├─────────────────┤
│ Dashboard       │  ← Menu items: INK background
│ Việc của tôi    │
│ Quản trị KHCN ▶│  ← With children (collapsible)
│   └ Danh sách   │
│   └ Hồ sơ      │
├─────────────────┤
│ [Help button]   │  ← Fixed bottom, --vht-red-chrome background
└─────────────────┘
```
- Background: `--vht-ink` (#1c1c1c)
- Selected item: `--vht-red` background
- Hover: rgba(255,255,255,0.1) overlay
- Text: rgba(255,255,255,0.78), selected: white
- Width: 230px (expanded), 80px (collapsed)

#### Breadcrumbs
```
Hệ thống QTKHCN / Quản trị KHCN / Hồ sơ RD02.02
```
- Separator: `>`
- Current page: `--vht-red` (brand red)
- Parent pages: `--vht-red-chrome` (deep red)
- Links hover: `--vht-red` (brand red)

### 5.7 Modals

```
┌──────────────────────────────────────────────┐
│ Title                               [X close] │  ← header with border-bottom
├──────────────────────────────────────────────┤
│                                              │
│ Content                                      │  ← body: 24px padding
│                                              │
├──────────────────────────────────────────────┤
│            [Cancel]  [OK / Primary Action]    │  ← footer: 16px padding, right-aligned
└──────────────────────────────────────────────┘
```
- Border-radius: 12px
- Header: 16px padding, border-bottom
- Footer: border-top, buttons right-aligned
- Overlay: rgba(0,0,0,0.45)
- Max-width: 560px (default), 800px (large), 400px (small)

### 5.8 Page Header

```
┌─────────────────────────────────────────────────────────────┐
│ [< Back] [Icon] Title                      [Extra actions] │
│             Breadcrumb > Path > Here                        │
└─────────────────────────────────────────────────────────────┘
```
- Icon: 24-26px, `--vht-red` color
- Title: 24px, font-weight 700
- Extra: right-aligned buttons/actions
- Border-bottom: 1px solid --vht-border
- Padding: 24px

### 5.9 Stat Cards

Small cards showing a metric with label:

```
┌──────────────────┐
│    [Value]       │  ← 28px, font-weight 700, color varies
│    [Label]       │  ← 12px, secondary text
└──────────────────┘
```
- Width: flexible (in grid)
- Background: white
- Border: 1px solid --vht-border
- Border-radius: 8px
- Padding: 16px

### 5.10 Empty States

```
    [Icon - large, muted]
    
    Title (when empty)
    Description text explaining why empty
    [Action Button]
```
- Icon: 48px, --vht-ink-3 color
- Title: 16px, font-weight 600
- Description: 14px, --vht-ink-2
- CTA button: primary style

---

## 6. Layout Patterns

### 6.1 Page Layout (Dashboard/List)

```
┌────────────────────────────────────────────────────────────────┐
│ [Sidebar 230px]  │  Header (Breadcrumb, User menu)              │
│                  ├────────────────────────────────────────────┤
│                  │  Page Header (Title, Actions)               │
│                  ├────────────────────────────────────────────┤
│                  │  Stats Row (if applicable)                  │
│                  ├────────────────────────────────────────────┤
│                  │  Content Area                              │
│                  │  ┌────────────────────────────────────────┐ │
│                  │  │                                        │ │
│                  │  │  Cards / Tables / Forms                │ │
│                  │  │                                        │ │
│                  │  └────────────────────────────────────────┘ │
│                  │                                            │
└────────────────────────────────────────────────────────────────┘
```

### 6.2 Detail Page Layout

```
┌────────────────────────────────────────────────────────────────┐
│ Header: [Back] Title                        [Actions: Edit/Delete/etc]
├────────────────────────────────────────────────────────────────┤
│ Breadcrumb                                                      │
├──────────────────────────────┬─────────────────────────────────┤
│ Left Column (2/3)             │ Right Column (1/3)              │
│ ┌────────────────────────┐  │ ┌────────────────────────────┐  │
│ │ Info Card 1             │  │ │ Summary Card               │  │
│ │ - Key-value pairs       │  │ │ - Status, dates, owner    │  │
│ └────────────────────────┘  │ └────────────────────────────┘  │
│ ┌────────────────────────┐  │ ┌────────────────────────────┐  │
│ │ Related Items Card      │  │ │ Actions Card               │  │
│ │ - Table/List            │  │ │ - Buttons                  │  │
│ └────────────────────────┘  │ └────────────────────────────┘  │
│ ┌────────────────────────┐  │                                 │
│ │ Documents Card          │  │                                 │
│ └────────────────────────┘  │                                 │
└──────────────────────────────┴─────────────────────────────────┘
```

### 6.3 Form Designer Layout

```
┌────────────────────────────────────────────────────────────────┐
│ Header: [Back] Title                          [Cancel] [Save] │
├────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐  ┌───────────────────────────┐  ┌──────────┐ │
│ │ COMPONENTS  │  │                           │  │ PROPS    │ │
│ │             │  │     Canvas (Form Preview)  │  │          │ │
│ │ Text Input  │  │                           │  │ Label    │ │
│ │ Text Area   │  │                           │  │ Key      │ │
│ │ Number      │  │                           │  │ Required │ │
│ │ Select      │  │                           │  │ Placeholder│ │
│ │ Date        │  │                           │  │          │ │
│ │ Checkbox    │  │                           │  │          │ │
│ │ ...         │  │                           │  │          │ │
│ └─────────────┘  └───────────────────────────┘  └──────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### 6.4 Grid System

- Uses Ant Design Row/Col with 24px gutter
- Breakpoints: xs (<576px), sm (≥576px), md (≥768px), lg (≥992px), xl (≥1200px), xxl (≥1600px)
- Common patterns:
  - Stats row: `xs=12 sm=6 lg=3` (4 columns on large, 2 on mobile)
  - Detail page: `xs=24 lg=16` (left) + `xs=24 lg=8` (right)

---

## 7. Icon System

### 7.1 Icon Library

**Ant Design Icons** — the primary icon set

### 7.2 Common Icons by Usage

| Context | Icon | Meaning |
|---------|------|---------|
| Dashboard | `<DashboardOutlined />` | Overview/home |
| Tasks | `<CarryOutOutlined />` | To-do items |
| Process | `<PartitionOutlined />` | Workflow |
| Dossier | `<FileTextOutlined />` | Document |
| Form | `<FormOutlined />` | Form/questionnaire |
| User | `<TeamOutlined />` | People |
| Council | `<TeamOutlined />` | Committee |
| Settings | `<SettingOutlined />` | Configuration |
| Add | `<PlusOutlined />` | Create new |
| Edit | `<EditOutlined />` | Modify |
| Delete | `<DeleteOutlined />` | Remove |
| View | `<EyeOutlined />` | Preview |
| Save | `<SaveOutlined />` | Persist data |
| Back | `<ArrowLeftOutlined />` | Navigate back |
| History | `<HistoryOutlined />` | Audit log |
| Warning | `<WarningOutlined />` | Caution |
| Success | `<CheckCircleOutlined />` | Completed |
| Error | `<CloseCircleOutlined />` | Failed |
| PDF | `<FilePdfOutlined />` | Document type |
| Download | `<DownloadOutlined />` | Export |

### 7.3 Icon Usage Guidelines

- Size: 14px (inline with text), 16px (buttons), 20-24px (standalone)
- Color: inherits from parent (or explicit `--vht-red` for brand emphasis)
- Spacing: 8px between icon and text

---

## 8. Animation & Transitions

### 8.1 Transition Timings

```css
--vht-transition-fast: 0.15s ease;
--vht-transition-normal: 0.2s ease;
--vht-transition-slow: 0.3s ease;
```

### 8.2 Interactive States

| Element | Default | Hover | Active | Disabled |
|---------|---------|-------|--------|----------|
| Primary Button | bg: #ee0033 | bg: darken 10% | bg: darken 15% | opacity: 0.5 |
| Default Button | border: #e6e9ee | bg: #f5f3f3 | bg: #e6e9ee | opacity: 0.5 |
| Menu Item | bg: transparent | bg: rgba(255,255,255,0.1) | bg: #ee0033 | — |
| Card (bento) | no shadow | translateY(-2px), shadow | — | — |

### 8.3 Loading States

- Spinner: Ant Design Spin component, primary color
- Skeleton: for content loading (gray animated bars)
- Progress: for uploads/long operations

---

## 9. Responsive Behavior

### 9.1 Breakpoints

| Name | Min Width | Description |
|------|-----------|-------------|
| xs | 0 | Mobile portrait |
| sm | 576px | Mobile landscape |
| md | 768px | Tablet |
| lg | 992px | Desktop |
| xl | 1200px | Large desktop |
| xxl | 1600px | Wide screens |

### 9.2 Sidebar Responsiveness

- **Desktop (lg+)**: Sidebar visible (230px), collapsible
- **Tablet/Mobile (<lg)**: Sidebar auto-collapses to prevent overflow

### 9.3 Table Responsiveness

- **Desktop**: Full table with all columns
- **Tablet**: Some columns hidden, horizontal scroll
- **Mobile**: Cards instead of table rows (if implemented)

---

## 10. Accessibility

### 10.1 Color Contrast

- All text meets WCAG AA standard (4.5:1 for normal text, 3:1 for large text)
- Primary red on white: ~4.8:1 (passes AA)

### 10.2 Focus States

- All interactive elements have visible focus ring (2px offset, `--vht-red` with 50% opacity)
- Focus trap in modals

### 10.3 Screen Reader

- Semantic HTML elements
- ARIA labels on icon-only buttons
- Proper heading hierarchy (h1 > h2 > h3)

---

## 11. Component Inventory Summary

For detailed Figma-style component specifications (props, states, variants), see [FIGMA-COMPONENTS.md](./FIGMA-COMPONENTS.md).

---

## 12. Design Tokens (CSS Variables)

All design tokens are defined in CSS and available as `--vht-*` custom properties:

```css
/* Colors */
--vht-red, --vht-red-chrome, --vht-red-dark, --vht-red-050, --vht-red-100
--vht-success, --vht-warning, --vht-danger
--vht-ink, --vht-ink-2, --vht-ink-3
--vht-surface, --vht-surface-2, --vht-surface-3
--vht-border, --vht-border-strong, --vht-outline
--vht-dark, --vht-dark-border

/* Typography */
--vht-font, --vht-font-mono

/* Geometry */
--vht-radius, --vht-radius-sm

/* Layout */
--vht-sider-w: 230px
```

---

## 13. Ant Design Theme Configuration

```typescript
// From theme.ts
const theme: ThemeConfig = {
  token: {
    colorPrimary: "#ee0033",
    colorSuccess: "#006e0d",
    colorWarning: "#daa520",
    colorError: "#ba1a1a",
    colorInfo: "#ee0033",
    borderRadius: 8,
    colorTextBase: "#1c1c1c",
    colorBgLayout: "#fbf9f9",
    fontFamily: "Inter, system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    Layout: {
      siderBg: "#1c1c1c",      // INK
      triggerBg: "#bf0027",    // RED_CHROME
      headerBg: "#ffffff",     // SURFACE
      bodyBg: "#fbf9f9",       // SURFACE_2
    },
    Menu: {
      darkItemBg: "#1c1c1c",
      darkSubMenuItemBg: "#1c1c1c",
      darkItemColor: "rgba(255,255,255,0.78)",
      darkItemHoverColor: "#ffffff",
      darkItemHoverBg: "rgba(255,255,255,0.10)",
      darkItemSelectedBg: "#ee0033",
      darkItemSelectedColor: "#ffffff",
    },
    Breadcrumb: {
      lastItemColor: "#ee0033",
      itemColor: "#bf0027",
      linkColor: "#bf0027",
      linkHoverColor: "#ee0033",
      separatorColor: "#d4a5a3",
    },
  },
};
```
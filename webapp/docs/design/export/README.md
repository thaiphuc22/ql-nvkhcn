# QTKHCN Design Export for Figma

## Files Overview

| File | Purpose | How to Use |
|------|---------|------------|
| `design-tokens.json` | Design tokens (colors, typography, spacing) | Import via Figma Tokens plugin or copy manually |
| `components.json` | Component specifications with props and states | Reference to recreate components |
| `screens.json` | Screen layouts and specifications | Reference for screen design |
| `palette.css` | CSS custom properties (drop into Figma) | Paste into Figma CSS variables |
| `FIGMA-COMPONENTS.md` | Detailed component specs (ASCII wireframes) | View in any text editor |
| `DESIGN.md` | Complete design system documentation | Full reference guide |

---

## Quick Start

### Option 1: Import Design Tokens (Recommended)

1. Open Figma
2. Install **Figma Tokens** plugin from the community
3. In the plugin, go to **Settings > Import**
4. Select `design-tokens.json`
5. Tokens will be imported and available as styles

### Option 2: Manual Color Setup

1. Open `design-tokens.json` or `palette.css`
2. Copy the color values
3. In Figma, go to **Assets > Colors**
4. Create color styles with the names provided

---

## Color Palette (Copy-Paste)

### Brand Colors
| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#ee0033` | CTA buttons, links, brand |
| Primary Dark | `#a80022` | Hover states |
| Chrome | `#bf0027` | Sidebar, dark headers |

### Status Colors
| Name | Hex | Usage |
|------|-----|-------|
| Success | `#006e0d` | Completed, positive |
| Warning | `#daa520` | Pending, caution |
| Danger | `#ba1a1a` | Errors, delete |
| Info | `#1677ff` | New, informational |

### Surface & Text
| Name | Hex | Usage |
|------|-----|-------|
| Background | `#fbf9f9` | Page background |
| Surface | `#ffffff` | Cards, inputs |
| Text Primary | `#1c1c1c` | Headings, body |
| Text Secondary | `#5e3f3e` | Descriptions |

### Borders
| Name | Hex | Usage |
|------|-----|-------|
| Default | `#e6e9ee` | Borders, dividers |
| Strong | `#c7cfda` | Emphasis |

---

## Typography Setup

### Font Families
- **Primary:** Inter (Google Fonts)
- **Monospace:** IBM Plex Mono (Google Fonts)

### Text Styles
| Name | Size | Weight | Line Height |
|------|------|--------|-------------|
| Display | 28px | 700 | 1.2 |
| H1 | 24px | 700 | 1.2 |
| H2 | 18px | 600 | 1.3 |
| H3 | 16px | 600 | 1.4 |
| Body | 14px | 400 | 1.5 |
| Small | 12px | 400 | 1.5 |
| Code | 13px | 400 | 1.5 |

### In Figma:
1. Go to **Assets > Text styles**
2. Create styles matching the above
3. Use **"+"** to add from **Text** property panel

---

## Component Quick Reference

### Buttons
```
Primary:   bg #ee0033, text white, radius 8px, height 36px
Default:   bg white, border #e6e9ee, radius 8px, height 36px
Danger:    bg #ba1a1a, text white, radius 8px
Text:      bg transparent, text #ee0033, no border
```

### Cards
```
Standard:  bg white, border #e6e9ee, radius 8px, padding 24px
Stat:      bg white, border #e6e9ee, radius 8px, value 28px bold
```

### Tags
```
Processing: bg #fff1f3, text #ee0033
Completed:  bg #f6ffed, text #006e0d
Pending:    bg #fff7e6, text #daa520
Rejected:   bg #fff2f0, text #ba1a1a
```

### Role Tags (Hội đồng)
```
Chủ tịch:   bg #fff1f3, text #ee0033
Phản biện: bg #fff7e6, text #daa520
Ủy viên:   bg #e6f4ff, text #1677ff
Thư ký KH: bg #f6ffed, text #006e0d
```

---

## Screen Layouts

### Two-Column Detail Page
```
┌──────────────────────────────────────────────────────┐
│ Header: [←] Title                        [Actions]   │
├────────────────────────────┬─────────────────────────┤
│ LEFT (66%)                  │ RIGHT (33%)             │
│ ┌────────────────────────┐ │ ┌────────────────────┐ │
│ │ Info Card               │ │ │ Summary Card       │ │
│ └────────────────────────┘ │ └────────────────────┘ │
│ ┌────────────────────────┐ │ ┌────────────────────┐ │
│ │ Process Card            │ │ │ Actions Card       │ │
│ └────────────────────────┘ │ └────────────────────┘ │
│ ┌────────────────────────┐ │                        │
│ │ Documents Card          │ │                        │
│ └────────────────────────┘ │                        │
└────────────────────────────┴─────────────────────────┘
```

### Form Designer (3-Panel)
```
┌──────────────────────────────────────────────────────┐
│ Header: [←] Title                    [Cancel] [Save] │
├─────────────┬─────────────────────────┬──────────────┤
│ COMPONENTS  │                         │ PROPERTIES   │
│             │    Canvas / Preview      │              │
│ Text Input  │                         │ Label: ...   │
│ Text Area   │                         │ Key: ...     │
│ Number      │                         │ Required: ☐  │
│ Select      │                         │              │
│ Date        │                         │              │
└─────────────┴─────────────────────────┴──────────────┘
```

---

## Icons (Ant Design)

Use **Ant Design Icons** in Figma:
- Search: https://ant.design/components/icon/
- All icons used in this app are from Ant Design Icon set

Common icons used:
- `DashboardOutlined` - Dashboard
- `CarryOutOutlined` - Tasks
- `TeamOutlined` - Users/Committee
- `FormOutlined` - Forms
- `FileTextOutlined` - Dossier
- `PartitionOutlined` - Process
- `CheckCircleOutlined` - Success
- `CloseCircleOutlined` - Error

---

## Useful Links

- **Figma Tokens Plugin:** https://www.figmatokens.com/
- **Ant Design Icons:** https://ant.design/components/icon/
- **Google Fonts (Inter):** https://fonts.google.com/specimen/Inter
- **Google Fonts (IBM Plex Mono):** https://fonts.google.com/specimen/IBM+Plex+Mono
- **Live App:** https://thaiphuc22.github.io/ql-nvkhcn/

---

## Questions?

Check the full design documentation:
- `DESIGN.md` - Complete design system guide
- `FIGMA-COMPONENTS.md` - Detailed component specs

---

*Last updated: 2026-07-23*
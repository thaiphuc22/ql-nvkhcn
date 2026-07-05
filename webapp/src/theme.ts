import type { ThemeConfig } from "antd";

/*
 * QTKHCN theme — áp "VHT Military Red" design system (Google Stitch →
 * docs/design_sample/design-system.md) lên Ant Design v5.
 *
 * Hai sắc đỏ phân tầng đúng như Stitch:
 *   - CHROME (sidebar)   = primary #bf0027  (Stitch `primary` — trầm, "authoritative")
 *   - HÀNH ĐỘNG (CTA)    = #ee0033          (Viettel brand = Stitch `primary-container`, đã LOCKED)
 * Màu ngữ nghĩa, nền, bo góc, font lấy trực tiếp từ design tokens.
 */

// ---- Design tokens (trích design-system.md) ----
export const RED = "#ee0033"; // primary-container — CTA / brand
export const RED_CHROME = "#bf0027"; // primary — sidebar / chrome
export const RED_CHROME_DARK = "#a80022"; // submenu / hover chìm
export const SUCCESS = "#006e0d"; // tertiary
export const WARNING = "#daa520"; // amber (Stitch chưa có token riêng)
export const DANGER = "#ba1a1a"; // error
export const BG = "#fbf9f9"; // background / surface (nền ấm)
export const SURFACE = "#ffffff"; // surface-container-lowest
export const INK = "#1c1c1c"; // on-surface
export const INK_2 = "#5e3f3e"; // on-surface-variant
export const OUTLINE = "#e8bcba"; // outline-variant (viền nhạt ấm)

export const theme: ThemeConfig = {
  token: {
    colorPrimary: RED,
    colorSuccess: SUCCESS,
    colorWarning: WARNING,
    colorError: DANGER,
    colorInfo: RED,
    borderRadius: 8,
    colorTextBase: INK,
    colorBgLayout: BG,
    fontFamily:
      'Inter, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Layout: {
      // Sidebar đỏ trầm — dấu ấn chính của design system.
      siderBg: INK,
      triggerBg: RED_CHROME,
      headerBg: SURFACE,
      bodyBg: BG,
    },
    Menu: {
      // Menu chạy trên nền đỏ → dùng bộ token "dark" nhưng ánh xạ sang sắc đỏ.
      darkItemBg: INK,
      darkSubMenuItemBg: INK,
      darkItemColor: "rgba(255,255,255,0.78)",
      darkItemHoverColor: "#ffffff",
      darkItemHoverBg: "rgba(255,255,255,0.10)",
      darkItemSelectedBg: RED,
      darkItemSelectedColor: "#ffffff",
    },
    Breadcrumb: {
      // Breadcrumb đỏ theo brand: item cuối (trang hiện tại) đỏ tươi nổi bật,
      // các cấp trước + link đỏ trầm, hover về đỏ tươi.
      lastItemColor: RED,
      itemColor: RED_CHROME,
      linkColor: RED_CHROME,
      linkHoverColor: RED,
      separatorColor: "#d4a5a3",
    },
  },
};

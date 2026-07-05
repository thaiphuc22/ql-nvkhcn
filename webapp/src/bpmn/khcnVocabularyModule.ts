/*
 * Đợt 3 (bpmn-editor-ux-upgrade-plan.md) — "Bộ từ vựng BPMN rút gọn KHCN".
 *
 * Người dùng lowcode (BA) chỉ cần ~10 loại phần tử; palette và popup "Đổi loại
 * phần tử" mặc định của bpmn-js liệt kê đủ mọi loại BPMN (data object/store,
 * complex gateway, compensation…) gây rối. Module này LỌC (không xoá tính năng):
 *  - Palette: bỏ data object/store, group.
 *  - Replace/append popup: chỉ giữ whitelist loại phù hợp nghiệp vụ KHCN.
 * Ở "Chế độ nâng cao" (isAdvanced() = true) trả lại nguyên bản — lối thoát khi
 * cần tính năng hiếm. Lọc qua API provider chuẩn nên sống sót qua upgrade.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

/** Palette gốc: các entry BỎ ở chế độ đơn giản. */
const PALETTE_DROP = new Set([
  'create.data-object',
  'create.data-store',
  'create.group',
])

/** Replace menu: entry GIỮ ở chế độ đơn giản (theo id của bpmn-js ReplaceMenuProvider). */
const REPLACE_KEEP = new Set([
  // sự kiện
  'replace-with-none-start',
  'replace-with-none-end',
  'replace-with-timer-start',
  'replace-with-timer-intermediate-catch',
  'replace-with-timer-boundary',
  'replace-with-message-start',
  'replace-with-terminate-end',
  // hoạt động
  'replace-with-task',
  'replace-with-user-task',
  'replace-with-service-task',
  'replace-with-call-activity',
  'replace-with-collapsed-subprocess',
  'replace-with-expanded-subprocess',
  'replace-with-subprocess',
  // gateway
  'replace-with-exclusive-gateway',
  'replace-with-parallel-gateway',
  // sequence flow
  'replace-with-sequence-flow',
  'replace-with-default-flow',
  'replace-with-conditional-flow',
])

class KhcnPaletteFilter {
  private _isAdvanced: () => boolean

  constructor(palette: any, isAdvanced: () => boolean) {
    this._isAdvanced = isAdvanced
    // Priority thấp → chạy SAU các provider khác, thấy đủ entries để lọc.
    palette.registerProvider(200, this)
  }

  getPaletteEntries() {
    return (entries: Record<string, any>) => {
      if (this._isAdvanced()) return entries
      const out: Record<string, any> = {}
      for (const [id, entry] of Object.entries(entries)) {
        if (!PALETTE_DROP.has(id)) out[id] = entry
      }
      return out
    }
  }
}

class KhcnReplaceMenuFilter {
  private _isAdvanced: () => boolean

  constructor(popupMenu: any, isAdvanced: () => boolean) {
    this._isAdvanced = isAdvanced
    popupMenu.registerProvider('bpmn-replace', 200, this)
  }

  getPopupMenuEntries() {
    return (entries: Record<string, any>) => {
      if (this._isAdvanced()) return entries
      const out: Record<string, any> = {}
      for (const [id, entry] of Object.entries(entries)) {
        // toggle-* = header (loop/multi-instance) do getHeaderEntries xử lý; giữ nguyên phần entry thường theo whitelist.
        if (REPLACE_KEEP.has(id)) out[id] = entry
      }
      // Nếu whitelist lọc sạch (element lạ) → trả nguyên bản, không để menu rỗng.
      return Object.keys(out).length > 0 ? out : entries
    }
  }
}

/** Module didi — truyền callback đọc trạng thái "Chế độ nâng cao" từ React. */
export function khcnVocabularyModule(isAdvanced: () => boolean) {
  const paletteFactory = (palette: any) => new KhcnPaletteFilter(palette, isAdvanced)
  paletteFactory.$inject = ['palette']
  const replaceFactory = (popupMenu: any) => new KhcnReplaceMenuFilter(popupMenu, isAdvanced)
  replaceFactory.$inject = ['popupMenu']
  return {
    __init__: ['khcnPaletteFilter', 'khcnReplaceMenuFilter'],
    khcnPaletteFilter: ['factory', paletteFactory],
    khcnReplaceMenuFilter: ['factory', replaceFactory],
  }
}

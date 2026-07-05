/*
 * Việt hoá nhãn form-js editor — form-js render nhãn palette/properties THẲNG
 * (không qua service `translate`), nên phải vá ở tầng DOM.
 *
 * BÀI HỌC QUAN TRỌNG (preact): KHÔNG dùng `el.textContent = ...` — nó xoá text
 * node mà preact đang theo dõi rồi tạo node mới; lần preact render lại, nó chèn
 * lại node tiếng Anh của nó → hiển thị DÍNH cả hai ("Vùng văn bảnText area").
 *
 * Cách đúng: sửa TẠI CHỖ `nodeValue` của đúng text node preact đang giữ
 * (không thêm/xoá node → không thể nhân đôi). Preact có thể revert về tiếng Anh
 * khi render lại → MutationObserver (childList + characterData) vá lại ngay.
 * Chuỗi không có trong từ điển giữ nguyên → an toàn.
 */
import { VI_DICT } from './translate-vi'

const TEXT_SELECTORS = [
  '.fjs-palette-group-title',
  '.bio-properties-panel-group-header-title',
  '.bio-properties-panel-label',
  '.bio-properties-panel-collapsible-entry-header-title',
  '.bio-properties-panel-header-label',
].join(',')

/** Sửa tại chỗ nodeValue của text node đầu tiên (giữ nguyên node của preact). */
function setInPlace(el: Element, vi: string): void {
  const first = el.firstChild
  if (first && first.nodeType === Node.TEXT_NODE) {
    if (first.nodeValue !== vi) first.nodeValue = vi
  }
}

/** Tra từ điển theo text hiện tại (đã trim). */
function viOf(el: Element): string | undefined {
  const cur = (el.textContent ?? '').trim()
  return VI_DICT[cur]
}

/** Vá một lượt. Idempotent: chạy lại khi đã là tiếng Việt sẽ không đổi gì thêm. */
export function applyViLabels(root: HTMLElement): void {
  // Palette: nhãn field (+ tooltip nút). Chỉ đổi node chỉ-có-text.
  root.querySelectorAll('.fjs-palette-field-text').forEach((el) => {
    if (el.childElementCount > 0) return
    const vi = viOf(el)
    if (!vi) return
    setInPlace(el, vi)
    const btn = el.closest('.fjs-palette-field') as HTMLElement | null
    if (btn) btn.title = 'Kéo hoặc bấm để thêm: ' + vi
  })

  // Nhóm palette + nhãn/nhóm trong properties panel (bỏ qua node có element con).
  root.querySelectorAll(TEXT_SELECTORS).forEach((el) => {
    if (el.childElementCount > 0) return
    const vi = viOf(el)
    if (vi) setInPlace(el, vi)
  })

  // Ô tìm kiếm palette (placeholder là thuộc tính — set trực tiếp).
  const search = root.querySelector('.fjs-palette-search input') as HTMLInputElement | null
  if (search) {
    const ph = (search.placeholder ?? '').trim()
    if (VI_DICT[ph]) search.placeholder = VI_DICT[ph]
  }
}

/** Theo dõi & vá lại mỗi khi form-js render lại. Trả hàm huỷ. */
export function observeViLabels(root: HTMLElement): () => void {
  let raf = 0
  const run = () => {
    raf = 0
    applyViLabels(root)
  }
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(run)
  }
  schedule()
  const obs = new MutationObserver(schedule)
  obs.observe(root, { childList: true, subtree: true, characterData: true })
  return () => {
    obs.disconnect()
    if (raf) cancelAnimationFrame(raf)
  }
}

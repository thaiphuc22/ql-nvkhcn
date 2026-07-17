/*
 * Việt hoá các chuỗi form-js render THẲNG trên CANVAS (không qua service `translate`,
 * nên module `form-js-i18n.ts` không dịch được) — vá tại tầng DOM bằng MutationObserver.
 *
 * Port SCOPED từ `webapp/src/branding/relabel-vi.ts`: CHỈ giữ phần vá canvas (select
 * rỗng / footer "Repeatable" / placeholder "Expression..."). Bỏ phần vá palette/
 * properties panel NATIVE của bản gốc — panel đó bị ẩn trong Angular (chrome hiển thị
 * là AntD tự viết, xem `form-field-palette.ts`/`form-field-properties.ts`), nên vá DOM
 * không hiển thị là code chết, không mang lại hiệu quả quan sát được.
 *
 * BÀI HỌC (preact, giữ nguyên từ bản gốc): KHÔNG dùng `el.textContent = ...` — nó xoá
 * text node mà preact đang theo dõi rồi tạo node mới; preact render lại sẽ chèn lại
 * node tiếng Anh của nó → hiển thị dính cả hai. Sửa TẠI CHỖ `nodeValue` của đúng text
 * node preact đang giữ (không thêm/xoá node → không thể nhân đôi).
 */

function setInPlace(el: Element, vi: string): void {
  const first = el.firstChild;
  if (first && first.nodeType === Node.TEXT_NODE) {
    if (first.nodeValue !== vi) first.nodeValue = vi;
  }
}

export function applyCanvasViLabels(root: HTMLElement): void {
  // Select rỗng: chỗ hiển thị đang là 'Select' (form-js hardcode) → 'Chọn…'.
  root.querySelectorAll('.fjs-select-display.fjs-select-placeholder').forEach((el) => {
    const first = el.firstChild;
    if (first && first.nodeType === Node.TEXT_NODE && (first.nodeValue ?? '').trim() === 'Select') {
      setInPlace(el, 'Chọn…');
    }
  });

  // Footer trường lặp lại: 'Repeatable' → 'Có thể lặp lại'.
  root.querySelectorAll('.fjs-repeat-render-footer span').forEach((el) => {
    if (el.childElementCount > 0) return;
    if ((el.textContent ?? '').trim() === 'Repeatable') setInPlace(el, 'Có thể lặp lại');
  });

  // Trường biểu thức (Expression): placeholder = icon + text động. firstChild là
  // <svg> nên phải quét TEXT node riêng (setInPlace không dùng được ở đây).
  root.querySelectorAll('.fjs-form-field-placeholder').forEach((el) => {
    el.childNodes.forEach((n) => {
      if (n.nodeType !== Node.TEXT_NODE) return;
      const cur = (n.nodeValue ?? '').trim();
      if (!cur) return;
      let vi: string | undefined;
      if (cur === 'Expression is empty') vi = 'Chưa nhập biểu thức';
      else if (cur.startsWith('Expression for ')) vi = 'Biểu thức cho ' + cur.slice('Expression for '.length);
      if (vi && n.nodeValue !== vi) n.nodeValue = vi;
    });
  });
}

/** Theo dõi & vá lại mỗi khi form-js render lại canvas. Trả hàm huỷ. */
export function observeCanvasViLabels(root: HTMLElement): () => void {
  let raf = 0;
  const run = () => {
    raf = 0;
    applyCanvasViLabels(root);
  };
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(run);
  };
  schedule();
  const obs = new MutationObserver(schedule);
  obs.observe(root, { childList: true, subtree: true, characterData: true });
  return () => {
    obs.disconnect();
    if (raf) cancelAnimationFrame(raf);
  };
}

#!/usr/bin/env node
/* =============================================================================
 * Kiểm tra BỐ CỤC của `dist/` — thứ `check.js` không bắt được.
 *
 *   node check-layout.js
 *
 * Bắt ba lỗi chỉ lộ ra khi mở trình duyệt, mà mockup thì thường không ai mở đủ 61 file:
 *
 *   1. Bảng lệch cột — hàng có tổng bề rộng khác hàng tiêu đề. Ở bảng dựng bằng div (luật 6 của
 *      `app.css`) thì trình duyệt KHÔNG báo gì cả, nó chỉ vẽ lệch; và khi kết xuất sang Figma thì
 *      thành các frame chồng mép nhau, phải căn tay từng ô.
 *   2. Bảng tràn khung — tổng bề rộng cột lớn hơn chỗ trống thật của khung chứa (đã trừ sider,
 *      padding của `.content`, của từng `.card`, hoặc bề rộng cố định của `.dialog`/`.paper`).
 *      Artboard khai `artboard--wide` thì bỏ qua vì nó tự ôm nội dung.
 *   3. Artboard lồng nhau — mỗi file dist phải có ĐÚNG MỘT `.artboard`.
 *
 * Không phụ thuộc thư viện ngoài: tự dựng cây thẻ `div` bằng một máy trạng thái nhỏ. Chỉ quan tâm
 * `div` vì mọi thứ có bề rộng trong bộ này đều là `div` (bảng, ô, card, hộp thoại).
 * ========================================================================== */
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
if (!fs.existsSync(DIST)) {
  console.error('Chưa có dist/. Chạy `node build.js` trước.');
  process.exit(1);
}

/* Bề rộng khung theo cỡ hộp thoại, đã trừ padding 24px hai bên của `.dialog__body`. */
const DIALOG_W = { confirm: 400, form: 520, wide: 900, picker: 1360 };
const SIDER = 256;
const CONTENT_PAD = 48; // .content padding 24 hai bên
const CARD_PAD = 34; // .card padding 16 hai bên + viền 1px hai bên

/* --------------------------------------------------------------- dựng cây div */
function parse(html) {
  const body = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'));
  const root = { cls: [], style: '', kids: [], parent: null };
  let cur = root;
  const re = /<div\b([^>]*)>|<\/div>/g;
  let m;
  while ((m = re.exec(body))) {
    if (m[0] === '</div>') {
      cur = cur.parent || root;
      continue;
    }
    const attrs = m[1];
    const cls = (attrs.match(/class="([^"]*)"/) || ['', ''])[1].trim().split(/\s+/).filter(Boolean);
    const style = (attrs.match(/style="([^"]*)"/) || ['', ''])[1];
    const node = { cls, style, kids: [], parent: cur };
    cur.kids.push(node);
    cur = node;
  }
  return root;
}

const has = (n, c) => n.cls.includes(c);
const walk = (n, fn) => {
  fn(n);
  n.kids.forEach((k) => walk(k, fn));
};

/* Bề rộng cố định của một ô: lớp `w-NNN` hoặc `width:NNNpx` trong style. `grow` = co giãn. */
function cellWidth(n) {
  const w = n.cls.find((c) => /^w-\d+$/.test(c));
  if (w) return { fixed: Number(w.slice(2)), grow: 0 };
  const inline = n.style.match(/(?:^|;)\s*width:\s*(\d+)px/);
  if (inline) return { fixed: Number(inline[1]), grow: 0 };
  return { fixed: 0, grow: 1 };
}

/* Chỗ trống thật của khung chứa bảng — đi ngược lên tổ tiên MỘT LẦT, theo thứ tự ưu tiên:
 *   1. `.dialog--*` và `.paper` áp bề rộng CỨNG, kể cả khi nằm trong artboard khổ rộng.
 *   2. Artboard khổ rộng tự ôm nội dung ⇒ không có khái niệm tràn.
 *   3. Còn lại: 1440 trừ sider (chỉ khi có shell), trừ padding `.content` và từng `.card`. */
function available(tbl) {
  let cards = 0;
  let coShell = false;
  let coContent = false;
  for (let n = tbl.parent; n; n = n.parent) {
    if (has(n, 'card')) cards++;
    if (has(n, 'shell__body')) coShell = true;
    if (has(n, 'content')) coContent = true;
    const d = n.cls.find((c) => c.startsWith('dialog--'));
    if (d && DIALOG_W[d.slice(8)]) return DIALOG_W[d.slice(8)] - 48 - cards * CARD_PAD;
    if (has(n, 'paper')) {
      const w = Number((n.style.match(/width:\s*(\d+)px/) || [0, 0])[1]);
      return (w || 1240) - 96 - cards * CARD_PAD;
    }
    if (has(n, 'artboard')) {
      if (has(n, 'artboard--wide')) return Infinity;
      return 1440 - (coShell ? SIDER : 0) - (coContent ? CONTENT_PAD : 0) - cards * CARD_PAD;
    }
  }
  return 1440;
}

let loi = 0;
let ok = 0;

for (const f of fs.readdirSync(DIST).filter((x) => x.endsWith('.html') && x !== 'index.html')) {
  const root = parse(fs.readFileSync(path.join(DIST, f), 'utf8'));
  const e = [];

  const artboards = [];
  walk(root, (n) => has(n, 'artboard') && artboards.push(n));
  if (artboards.length !== 1) e.push(`có ${artboards.length} .artboard — phải đúng 1`);

  const tables = [];
  walk(root, (n) => has(n, 'tbl') && tables.push(n));

  tables.forEach((t, ti) => {
    const rows = [];
    // Hàng có thể nằm thẳng trong .tbl hoặc trong .tbl__scroll
    const scan = (n) =>
      n.kids.forEach((k) => {
        if (has(k, 'tbl__head') || has(k, 'tbl__row')) rows.push(k);
        else if (has(k, 'tbl__scroll')) scan(k);
      });
    scan(t);
    if (!rows.length) return;

    const sums = rows.map((r) => {
      let fixed = 0;
      let grow = 0;
      r.kids.forEach((c) => {
        const w = cellWidth(c);
        fixed += w.fixed;
        grow += w.grow;
      });
      return { fixed, grow, n: r.kids.length };
    });

    const base = sums[0];
    sums.forEach((s, i) => {
      // Hàng gộp (tiêu đề nhóm) cố ý ít ô hơn và dùng ô co giãn để lấp phần còn lại — không phải
      // lỗi. Chỉ báo khi hàng RỘNG HƠN tiêu đề, hoặc cùng số ô co giãn mà tổng cố định lại khác.
      const lech = s.fixed > base.fixed || (s.grow === base.grow && s.fixed !== base.fixed);
      if (lech) {
        e.push(
          `bảng #${ti + 1} lệch cột: hàng ${i} = ${s.fixed}px+${s.grow} co giãn (${s.n} ô), ` +
            `hàng 0 = ${base.fixed}px+${base.grow} co giãn (${base.n} ô)`,
        );
      }
    });

    const avail = available(t);
    if (avail !== Infinity && base.fixed > avail) {
      e.push(`bảng #${ti + 1} tràn khung: ${base.fixed}px cột cố định > ${avail}px chỗ trống`);
    }
  });

  if (e.length) {
    loi++;
    console.log(`✗ ${f}`);
    for (const x of e) console.log(`    ${x}`);
  } else ok++;
}

console.log(loi ? `\n${loi} file có vấn đề bố cục, ${ok} file sạch.` : `\n✓ ${ok} file bố cục sạch.`);
process.exit(loi ? 1 : 0);

#!/usr/bin/env node
/* =============================================================================
 * Gộp artboard theo NHÓM: `src/pages/*.page.js` → `dist/bundles/*.html`
 *
 *   node bundle.js              # gộp tất cả các nhóm
 *   node bundle.js "0 · Nền"    # chỉ nhóm có tên khớp (so khớp chuỗi con, không dấu)
 *
 * Vì sao có file này: html.to.design import MỘT trang một lần. 77 artboard rời = 77 lần thao tác.
 * Một trang chứa nhiều `.artboard` xếp dọc thì plugin cho ra một frame bọc Auto Layout dọc, mỗi
 * artboard là một frame con — tức là một lần import ra nguyên một Page Figma đủ nhóm.
 *
 * CSS chỉ nhúng MỘT lần cho cả nhóm (50KB), nên bundle 16 artboard vẫn nhẹ hơn 16 file rời.
 *
 * Luật CSS của `app.css` vẫn giữ nguyên: phần bọc thêm ở đây chỉ dùng flexbox, không
 * `position`, không `::before/::after`, không `transform`.
 * ========================================================================== */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'dist', 'bundles');

const css =
  // Bản gộp nằm ở `dist/bundles/`, sâu hơn `dist/` một cấp, nên `url('fonts/...')` trong tokens.css
  // phải lùi ra một cấp — không sửa thì mở bằng trình duyệt là mất Roboto (@font-face 404).
  fs.readFileSync(path.join(SRC, 'assets/tokens.css'), 'utf8').replace(/url\('fonts\//g, "url('../fonts/") +
  '\n' +
  fs.readFileSync(path.join(SRC, 'assets/app.css'), 'utf8') +
  '\n' +
  /* ---------------------------------------------------------------- lớp bọc bundle */
  `
/* ===================================================================== BUNDLE
   Chỉ tồn tại trong file gộp. Nhãn \`.bundle__label\` là ghi chú cho người dựng —
   XOÁ sau khi import xong, giống dải \`.note\`. */
.bundle {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 80px;
  padding: 64px;
  background: var(--vht-gray-90);
}
.bundle__item { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }
.bundle__item > .artboard { margin: 0; }
.bundle__label {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  background: #1A1A1A;
  color: #FFFFFF;
  font-family: var(--vht-built-font);
  font-size: 13px;
  font-weight: 600;
  line-height: 32px;
}
.bundle__label .bundle__code {
  padding: 0 8px;
  border-radius: 6px;
  background: rgba(255,255,255,0.16);
  font-variant-numeric: tabular-nums;
}
`;

/* -------------------------------------------------------------------- trang */
const files = fs
  .readdirSync(path.join(SRC, 'pages'))
  .filter((f) => f.endsWith('.page.js'))
  .sort();

const pages = [];
for (const f of files) {
  const mod = require(path.join(SRC, 'pages', f));
  for (const p of Array.isArray(mod) ? mod : [mod]) pages.push(p);
}

/* nhóm theo thứ tự xuất hiện — trùng thứ tự build.js dùng cho mục lục */
const groups = [];
for (const p of pages) {
  let g = groups.find((x) => x.name === p.group);
  if (!g) groups.push((g = { name: p.group, items: [] }));
  g.items.push(p);
}

const filter = process.argv[2] ? bo_dau(process.argv[2]) : null;
const chon = filter ? groups.filter((g) => bo_dau(g.name).includes(filter)) : groups;

if (!chon.length) {
  console.error(`Không nhóm nào khớp "${process.argv[2]}". Các nhóm có:`);
  for (const g of groups) console.error(`  ${g.name}`);
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });

for (const g of chon) {
  const stt = String(groups.indexOf(g) + 1).padStart(2, '0');
  const out = `${stt}-${slug(g.name)}.html`;

  const than = g.items
    .map(
      (p) => `  <div class="bundle__item">
    <div class="bundle__label"><span class="bundle__code">${p.code}</span><span>${p.title}</span></div>
${typeof p.body === 'function' ? p.body() : p.body}
  </div>`,
    )
    .join('\n');

  fs.writeFileSync(
    path.join(OUT, out),
    `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1440">
<title>${g.name} · ${g.items.length} artboard</title>
<style>
${css}
</style>
</head>
<body>
<div class="bundle">
${than}
</div>
</body>
</html>
`,
    'utf8',
  );

  const kb = Math.round(fs.statSync(path.join(OUT, out)).size / 1024);
  console.log(`✓ ${out}  —  ${g.items.length} artboard, ${kb}KB`);
  for (const p of g.items) console.log(`    ${p.code}  ${p.title}`);
}

function slug(s) {
  return bo_dau(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
function bo_dau(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

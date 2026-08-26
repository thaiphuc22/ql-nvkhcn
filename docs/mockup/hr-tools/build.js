#!/usr/bin/env node
/* =============================================================================
 * Sinh bộ artboard tĩnh: `src/pages/*.page.js` → `dist/*.html`
 *
 *   node build.js
 *
 * Mỗi file dist là MỘT trang HTML **tự chứa** — CSS nhúng thẳng trong `<style>`, không `<link>`,
 * không `<script>`. Lý do: chế độ *paste code* của html.to.design chỉ nhận đúng những gì được
 * dán vào; để CSS ở file ngoài là dán xong ra trang trắng không style.
 *
 * Font là ngoại lệ có ý thức: `@font-face` trỏ `fonts/roboto/*.woff2` (chép sang `dist/fonts/`)
 * nên mở bằng `file://` thì chữ đúng. Khi dán code, URL đó hỏng — không sao, plugin đọc TÊN font
 * `Roboto` từ `font-family` và Figma có sẵn Roboto.
 * ========================================================================== */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

/* ------------------------------------------------------------------ tiện ích */
function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}
function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name);
    const b = path.join(to, e.name);
    if (e.isDirectory()) copyDir(a, b);
    else fs.copyFileSync(a, b);
  }
}

/* ---------------------------------------------------------------------- CSS */
const css =
  fs.readFileSync(path.join(SRC, 'assets/tokens.css'), 'utf8') +
  '\n' +
  fs.readFileSync(path.join(SRC, 'assets/app.css'), 'utf8');

/* -------------------------------------------------------------------- trang */
const files = fs
  .readdirSync(path.join(SRC, 'pages'))
  .filter((f) => f.endsWith('.page.js'))
  .sort();

if (!files.length) {
  console.error('Không tìm thấy trang nào trong src/pages/');
  process.exit(1);
}

rmrf(DIST);
fs.mkdirSync(DIST, { recursive: true });
copyDir(path.join(SRC, 'assets/fonts'), path.join(DIST, 'fonts'));

const pages = [];

for (const f of files) {
  delete require.cache[require.resolve(path.join(SRC, 'pages', f))];
  const mod = require(path.join(SRC, 'pages', f));
  // Một file nguồn có thể sinh NHIỀU artboard (8 màn danh mục chỉ khác nhau vài cột thì viết
  // thành một mảng rẻ hơn 8 file chép qua chép lại — và không lệch nhau sau vài lần sửa).
  for (const p of Array.isArray(mod) ? mod : [mod]) emit(f, p);
}

function emit(f, p) {
  const required = ['code', 'title', 'group', 'body'];
  for (const k of required) {
    if (!p[k]) throw new Error(`${f}: thiếu trường "${k}"`);
  }
  const out = `${p.code}-${slug(p.title)}.html`;
  const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1440">
<title>${p.code} · ${p.title}</title>
<style>
${css}
</style>
</head>
<body>
${typeof p.body === 'function' ? p.body() : p.body}
</body>
</html>
`;
  fs.writeFileSync(path.join(DIST, out), html, 'utf8');
  pages.push({ ...p, file: out });
}

/* ------------------------------------------------------------------ mục lục */
const groups = [];
for (const p of pages) {
  let g = groups.find((x) => x.name === p.group);
  if (!g) groups.push((g = { name: p.group, items: [] }));
  g.items.push(p);
}

const toc = groups
  .map(
    (g) => `<div class="toc__group">
      <div class="section-title">${g.name}</div>
      <div class="toc__list">
        ${g.items
          .map(
            (p) =>
              `<a class="toc__item" href="${p.file}"><span class="toc__code">${p.code}</span>` +
              `<span class="grow">${p.title}</span>` +
              `<span class="caption">${p.desc || ''}</span></a>`,
          )
          .join('')}
      </div>
    </div>`,
  )
  .join('');

fs.writeFileSync(
  path.join(DIST, 'index.html'),
  `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>HR Tools — mục lục mockup</title>
<style>
${css}
</style>
</head>
<body>
  <div class="toc">
    <div class="col">
      <h1 style="margin:0;font:var(--vht-font-display);font-family:var(--vht-built-font)">HR Tools — bộ mockup tĩnh</h1>
      <div class="caption">${pages.length} artboard · khổ 1440 · design system <strong>@khcn-core</strong> (D23 — bản đã build thắng DS Figma)</div>
    </div>
    <div class="alert">
      ${'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>'}
      <div class="alert__body">
        <div class="alert__title">Trang này chỉ để xem — đừng import vào Figma</div>
        <div>Import từng file artboard. Mỗi file là một frame 1440px, tự chứa CSS.</div>
      </div>
    </div>
    ${toc}
  </div>
</body>
</html>
`,
  'utf8',
);

console.log(`✓ ${pages.length} artboard → dist/`);
for (const g of groups) console.log(`  ${g.name}: ${g.items.length}`);

function slug(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

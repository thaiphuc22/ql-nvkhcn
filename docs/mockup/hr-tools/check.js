#!/usr/bin/env node
/* =============================================================================
 * Kiểm tra `dist/` trước khi import vào Figma.
 *
 *   node check.js
 *
 * Bắt đúng những lỗi làm hỏng bản import mà mắt thường không thấy khi mở trình duyệt:
 * thẻ lệch, icon-font còn sót, CSS vi phạm sáu luật ở đầu `app.css`, và biến template chưa
 * thay (`undefined`, `NaN`, `[object Object]`).
 *
 * Khối `<style>` bị bỏ qua khi soi luật CSS: phần chú thích trong đó có nhắc `display: grid`,
 * `position: absolute`, `<svg>` — nhắc để cấm, không phải để dùng.
 * ========================================================================== */
const fs = require('fs');
const path = require('path');

// Mặc định soi `dist/`; truyền thư mục khác để soi bản gộp: `node check.js dist/bundles`
const DIST = path.resolve(__dirname, process.argv[2] || 'dist');
if (!fs.existsSync(DIST)) {
  console.error(`Chưa có ${path.relative(__dirname, DIST) || 'dist'}/. Chạy \`node build.js\` trước.`);
  process.exit(1);
}

let loi = 0;
let ok = 0;

/* Danh sách trắng của luật 2: chỉ lớp phủ mới được ra khỏi luồng. */
const ALLOW_ABS = ['.stack__dim', '.toaster'];

/** Trả về tên selector của mọi khối CSS có khai `position: absolute|fixed`. */
function selectorsAbsolute(raw) {
  // Bỏ chú thích CSS trước: chính đoạn giải thích luật 2 ở đầu `app.css` có nhắc chữ
  // `position: absolute` — nhắc để cấm, không phải để dùng.
  const style = (raw.match(/<style>([\s\S]*?)<\/style>/) || ['', ''])[1].replace(/\/\*[\s\S]*?\*\//g, '');
  const found = [];
  let sel = '?';
  for (const line of style.split('\n')) {
    const m = line.match(/^\s*([.#][^{]*?)\s*\{/);
    if (m) sel = m[1].trim();
    if (/position:\s*(absolute|fixed)/.test(line) && !found.includes(sel)) found.push(sel);
  }
  return found;
}

for (const f of fs.readdirSync(DIST).filter((x) => x.endsWith('.html'))) {
  const raw = fs.readFileSync(path.join(DIST, f), 'utf8');
  const s = raw.replace(/<style>[\s\S]*?<\/style>/, '');
  const e = [];

  const div = [(s.match(/<div\b/g) || []).length, (s.match(/<\/div>/g) || []).length];
  if (div[0] !== div[1]) e.push(`thẻ div lệch: ${div[0]} mở / ${div[1]} đóng`);

  const svg = [(s.match(/<svg\b/g) || []).length, (s.match(/<\/svg>/g) || []).length];
  if (svg[0] !== svg[1]) e.push(`thẻ svg lệch: ${svg[0]} mở / ${svg[1]} đóng`);

  if (/undefined|NaN|\[object Object\]/.test(s)) e.push('còn undefined / NaN / [object Object]');
  if (/display:\s*grid/.test(s)) e.push('có display:grid — plugin sẽ mất Auto Layout');
  if (/position:\s*(absolute|fixed)/.test(s)) e.push('có position absolute/fixed trong HTML');
  // Trong CSS, `position:absolute` chỉ được phép ở đúng các selector lớp phủ (luật 2, app.css).
  for (const sel of selectorsAbsolute(raw)) {
    if (!ALLOW_ABS.includes(sel)) e.push(`position:absolute ngoài danh sách cho phép: ${sel}`);
  }
  if (/::before|::after/.test(s)) e.push('có pseudo-element — không qua được cầu HTML→Figma');
  if (/class="[^"]*\bpi-/.test(s)) e.push('còn icon-font PrimeIcons — icon sẽ biến mất');
  if (/<script/.test(s)) e.push('có <script> — bản dist phải tĩnh hoàn toàn');
  if (!/font-family: *var\(--vht-built-font\)|Roboto/.test(raw)) e.push('không thấy Roboto');

  if (e.length) {
    loi++;
    console.log(`✗ ${f}`);
    for (const x of e) console.log(`    ${x}`);
  } else ok++;
}

console.log(loi ? `\n${loi} file có vấn đề, ${ok} file sạch.` : `\n✓ ${ok} file sạch — sẵn sàng import.`);
process.exit(loi ? 1 : 0);

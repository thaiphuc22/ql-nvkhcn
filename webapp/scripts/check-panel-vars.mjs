/*
 * Kiểm tra biến CSS ghi đè trong branding/bpmnio-skin.css còn KHỚP với biến
 * mà các gói bpmn.io thực sự định nghĩa (Đợt 6 — bpmn-editor-ux-upgrade-plan.md).
 *
 * Vì skin theme hoá bằng cách ghi đè biến công khai của thư viện, một lần nâng
 * version đổi tên/xoá biến sẽ làm giao diện "rơi" về mặc định MÀ KHÔNG BÁO LỖI.
 * Script này biến sự im lặng đó thành fail rõ ràng:
 *   npm run check:panel-vars   → exit 1 nếu skin override biến không còn tồn tại.
 *
 * Chạy sau MỖI lần nâng @bpmn-io/properties-panel, @bpmn-io/form-js, bpmn-js.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Các file CSS thư viện định nghĩa biến mà skin được phép ghi đè. */
const LIB_CSS = [
  'node_modules/@bpmn-io/properties-panel/dist/assets/properties-panel.css',
]
// form-js phân phối nhiều css — gom cả thư mục assets.
const formJsAssets = join(root, 'node_modules/@bpmn-io/form-js/dist/assets')
for (const f of readdirSync(formJsAssets)) {
  if (f.endsWith('.css')) LIB_CSS.push(join('node_modules/@bpmn-io/form-js/dist/assets', f))
}

const VAR_DEF = /(--[a-z][a-z0-9-]*)\s*:/g

function varsIn(cssText) {
  const found = new Set()
  for (const m of cssText.matchAll(VAR_DEF)) found.add(m[1])
  return found
}

// 1) Tập biến thư viện định nghĩa.
const libVars = new Set()
for (const rel of LIB_CSS) {
  const text = readFileSync(join(root, rel), 'utf8')
  for (const v of varsIn(text)) libVars.add(v)
}

// 2) Tập biến skin ghi đè (bỏ token nội bộ --vht-* và --cds-* của Carbon).
const skinText = readFileSync(join(root, 'src/branding/bpmnio-skin.css'), 'utf8')
const overridden = [...varsIn(skinText)].filter(
  (v) => !v.startsWith('--vht-') && !v.startsWith('--cds-'),
)

// 3) Đối chiếu.
const unknown = overridden.filter((v) => !libVars.has(v))
if (unknown.length > 0) {
  console.error('✗ Skin ghi đè biến KHÔNG còn tồn tại trong thư viện (đổi tên/xoá khi nâng version?):')
  for (const v of unknown) console.error('   ' + v)
  console.error(`\n→ Sửa lại mapping trong src/branding/bpmnio-skin.css (${unknown.length} biến).`)
  process.exit(1)
}
console.log(`✓ ${overridden.length} biến skin ghi đè đều tồn tại trong thư viện bpmn.io.`)

// Thông tin thêm (không fail): biến thư viện có mà skin chưa map — hữu ích khi lib thêm biến mới.
const unmapped = [...libVars].filter((v) => !overridden.includes(v) && !v.startsWith('--color-'))
console.log(`ℹ ${unmapped.length} biến thư viện chưa map (chạy với --verbose để liệt kê).`)
if (process.argv.includes('--verbose')) {
  for (const v of unmapped.sort()) console.log('   ' + v)
}

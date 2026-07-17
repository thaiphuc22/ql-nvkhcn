import { evaluate } from 'feelin';

import { componentsOf, idOf, type FormComponent } from './eform';

// Port của phần logic runtime trong webapp/src/components/FormRenderer.tsx (D12 —
// eForm "B-engine"): eval FEEL (feelin), tính trạng thái suy diễn (computed/hidden)
// và validate/gom dữ liệu khi submit. Tách khỏi component Angular để dùng chung
// giữa `FormRendererComponent` (canvas) và preview trong Form Designer.

export interface FormSubmitResult {
  data: Record<string, unknown>;
  errors: Record<string, string>;
}

/** Đánh giá một biểu thức FEEL của form-js. form-js viết biểu thức với tiền tố
 * '=' → bỏ '=' trước khi eval. Lỗi/parse hỏng → undefined (fail-safe, không sập renderer). */
export function evalFeel(expr: string | undefined, ctx: Record<string, unknown>): unknown {
  if (!expr) return undefined;
  const src = expr.startsWith('=') ? expr.slice(1) : expr;
  try {
    return evaluate(src, ctx).value;
  } catch {
    return undefined;
  }
}

export function isEmpty(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

/** Validate một trường theo component.validate. */
export function validateField(c: FormComponent, value: unknown): string | undefined {
  const v = c.validate;
  if (!v) return undefined;
  if (v.required && isEmpty(value)) return 'Trường này là bắt buộc.';
  if (isEmpty(value)) return undefined;
  if (typeof value === 'string') {
    if (v.minLength != null && value.length < v.minLength) return `Tối thiểu ${v.minLength} ký tự.`;
    if (v.maxLength != null && value.length > v.maxLength) return `Tối đa ${v.maxLength} ký tự.`;
    if (v.pattern && !new RegExp(v.pattern).test(value)) return 'Giá trị không đúng định dạng.';
    if (v.validationType === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return 'Email không hợp lệ.';
  }
  if (typeof value === 'number') {
    if (v.min != null && value < v.min) return `Giá trị tối thiểu là ${v.min}.`;
    if (v.max != null && value > v.max) return `Giá trị tối đa là ${v.max}.`;
  }
  return undefined;
}

export interface DerivedState {
  computed: Record<string, unknown>;
  ctx: Record<string, unknown>;
  hidden: Set<string>;
}

/**
 * Tính trạng thái suy diễn cho MỘT cấp component (gốc hoặc 1 dòng dynamiclist):
 *   - `computed`: giá trị các trường `expression`.
 *   - `ctx`: context để eval/validate = { ...parent, ...data, ...computed }.
 *   - `hidden`: tập id trường đang ẩn (`conditional.hide` === true).
 * `parent` là context cấp trên: dòng dynamiclist truyền context gốc vào đây nên
 * biểu thức FEEL trong dòng thấy cả biến gốc lẫn biến của dòng (dòng ưu tiên).
 */
export function deriveState(
  components: FormComponent[],
  data: Record<string, unknown>,
  parent: Record<string, unknown> = {},
): DerivedState {
  const base = { ...parent, ...data };
  const computed: Record<string, unknown> = {};
  for (const c of components) {
    if (c.type === 'expression' && c.key && c.expression) {
      computed[c.key] = evalFeel(c.expression, base);
    }
  }
  const ctx = { ...base, ...computed };
  const hidden = new Set<string>();
  for (const c of components) {
    const expr = c.conditional?.hide;
    if (expr && evalFeel(expr, ctx) === true) hidden.add(idOf(c));
  }
  return { computed, ctx, hidden };
}

/** Khoá lỗi cho 1 ô trong dynamiclist: `<idList>#<dòng>.<idÔ>`. */
export function rowErrKey(listId: string, index: number, fieldId: string): string {
  return `${listId}#${index}.${fieldId}`;
}

/**
 * Xử lý validate + gom data cho MỘT cấp component (đệ quy vào `dynamiclist`).
 * Ghi lỗi vào `errs` (key phẳng; dòng dùng {@link rowErrKey}). Trả về object data
 * của cấp này (chỉ trường visible; dynamiclist → mảng object).
 */
export function processLevel(
  components: FormComponent[],
  data: Record<string, unknown>,
  parent: Record<string, unknown>,
  prefix: string,
  errs: Record<string, string>,
): Record<string, unknown> {
  const { ctx, hidden } = deriveState(components, data, parent);
  const out: Record<string, unknown> = {};
  for (const c of components) {
    if (!c.key || hidden.has(idOf(c))) continue;
    if (c.type === 'dynamiclist') {
      const rows = Array.isArray(data[c.key]) ? (data[c.key] as Record<string, unknown>[]) : [];
      if (c.validate?.required && rows.length === 0) {
        errs[prefix + idOf(c)] = 'Cần ít nhất một dòng.';
      }
      out[c.key] = rows.map((row, i) =>
        processLevel(c.components ?? [], row ?? {}, ctx, `${prefix}${rowErrKey(idOf(c), i, '')}`, errs),
      );
      continue;
    }
    const msg = validateField(c, ctx[c.key]);
    if (msg) errs[prefix + idOf(c)] = msg;
    if (ctx[c.key] !== undefined) out[c.key] = ctx[c.key];
  }
  return out;
}

export function submitForm(schema: unknown, formData: Record<string, unknown>): FormSubmitResult {
  const errs: Record<string, string> = {};
  const data = processLevel(componentsOf(schema), formData, {}, '', errs);
  return { data, errors: errs };
}

// ── Markdown-lite cho component `text` (không dựng innerHTML → an toàn XSS) ────

export interface MarkdownRun {
  bold: boolean;
  text: string;
}
export interface MarkdownLine {
  kind: 'h4' | 'h5' | 'p';
  runs: MarkdownRun[];
}

function parseInline(line: string): MarkdownRun[] {
  const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((p) => (p.startsWith('**') && p.endsWith('**') ? { bold: true, text: p.slice(2, -2) } : { bold: false, text: p }));
}

/** Hỗ trợ: heading (#/##/###), **đậm**, xuống dòng. `###`/`##` cùng map "h5" — đúng
 * hành vi bản gốc React (`Title level=5` cho cả hai). */
export function parseFormMarkdown(text: string): MarkdownLine[] {
  const out: MarkdownLine[] = [];
  for (const raw of text.split('\n')) {
    const line = raw.trimEnd();
    if (line.trim() === '') continue;
    if (line.startsWith('### ')) out.push({ kind: 'h5', runs: parseInline(line.slice(4)) });
    else if (line.startsWith('## ')) out.push({ kind: 'h5', runs: parseInline(line.slice(3)) });
    else if (line.startsWith('# ')) out.push({ kind: 'h4', runs: parseInline(line.slice(2)) });
    else out.push({ kind: 'p', runs: parseInline(line) });
  }
  return out;
}

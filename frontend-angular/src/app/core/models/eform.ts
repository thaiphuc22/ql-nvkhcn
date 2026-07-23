// Port của webapp/src/forms/*.ts + webapp/src/store/FormContext.tsx (phần dữ liệu) —
// Thư viện biểu mẫu (Camunda Forms / form-js) cho module PH3 "Thư viện biểu mẫu"
// (route /phan-he/PH3/bieu-mau). Ghép backend Spring Boot `/api/eform` — service
// HTTP-backed (core/services/eform.service.ts) đóng vai trò FormContext gốc.

export interface FormMeta {
  key: string;
  ten: string;
  moTa: string;
  /** Loại biểu mẫu — dùng để nhóm/lọc trong thư viện. */
  loai?: 'Soạn thảo' | 'Góp ý' | 'Nhận xét' | 'Thẩm định' | 'Phê duyệt';
  schema: unknown;
  /** Optimistic lock version từ backend — dùng làm If-Match khi sửa/xoá. */
  version: number;
}

/* ─────────────────────── Kiểu schema form-js (dùng chung cho renderer + designer panel) ─────────────────────── */

export interface FormFieldValidate {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  validationType?: string;
}

export interface FormComponent {
  type: string;
  id?: string;
  key?: string;
  label?: string;
  description?: string;
  text?: string;
  subtype?: string;
  validate?: FormFieldValidate;
  values?: { value: string; label: string }[];
  /** Hiển thị có điều kiện — `hide` là biểu thức FEEL, true ⇒ ẩn trường. */
  conditional?: { hide?: string };
  /** Trường tính toán — biểu thức FEEL, giá trị readonly (dùng với type `expression`). */
  expression?: string;
  /** Trường chỉ đọc (không cho nhập tay). */
  readonly?: boolean;
  /** Template component con — dùng cho `dynamiclist` (mỗi dòng render theo template này). */
  components?: FormComponent[];
  showOutline?: boolean;
  _parent?: string;
}

export interface FormSchema {
  type?: string;
  id?: string;
  components?: FormComponent[];
}

export function componentsOf(schema: unknown): FormComponent[] {
  const comps = (schema as FormSchema | undefined)?.components;
  return Array.isArray(comps) ? comps : [];
}

/** Khoá để tra state/errors: ưu tiên id ổn định, fallback key. */
export function idOf(c: FormComponent): string {
  return c.id ?? c.key ?? '';
}

/** Schema rỗng cho biểu mẫu mới tạo — chỉ có tiêu đề, chờ thiết kế trong designer. */
export function emptySchema(key: string, ten: string): FormSchema {
  return {
    type: 'default',
    id: key,
    components: [{ type: 'text', id: 'h', text: `## ${ten}` }],
  };
}

/** Đếm số trường nhập liệu (component có `key`) — bỏ qua text tĩnh. */
export function countFields(schema: unknown): number {
  return componentsOf(schema).filter((c) => !!c.key).length;
}

const TIEU_CHI: Record<string, string> = {
  capThiet: 'Tính cấp thiết',
  khaThi: 'Tính khả thi',
  duToan: 'Dự toán hợp lý',
  nhanSu: 'Năng lực nhân sự',
};

export function buildYKien(data: Record<string, unknown>): string {
  const parts: string[] = [];
  if (data['noiDung']) parts.push(String(data['noiDung']));
  if (data['yKien']) parts.push(String(data['yKien']));
  if (data['kienNghi']) parts.push('Kiến nghị: ' + String(data['kienNghi']));
  const tc = data['tieuChi'];
  if (Array.isArray(tc) && tc.length) {
    parts.push('(Đạt: ' + tc.map((k) => TIEU_CHI[String(k)] ?? String(k)).join(', ') + ')');
  }
  return parts.join(' — ');
}

/** Chuyển tên biểu mẫu → mã (formKey) khi người dùng bỏ trống ô Mã lúc tạo. */
export function slugifyFormKey(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

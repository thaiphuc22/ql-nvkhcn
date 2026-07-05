// Thư viện biểu mẫu (Camunda Forms / form-js) — DỮ LIỆU SEED + tiện ích xử lý kết quả.
//
// Nguồn sống của thư viện là `store/FormContext` (cho phép CRUD). File này chỉ
// giữ: (1) các schema mẫu ban đầu, (2) helper thuần (isApprove / buildYKien).
import { phieuNhanXetSchema } from './phieuNhanXet'

export interface FormMeta {
  key: string
  ten: string
  moTa: string
  /** Loại biểu mẫu — dùng để nhóm/lọc trong thư viện. */
  loai?: 'Góp ý' | 'Nhận xét' | 'Thẩm định' | 'Phê duyệt'
  schema: unknown
}

const phieuYKienSchema = {
  type: 'default',
  id: 'phieu-y-kien',
  components: [
    { type: 'text', id: 'h', text: '## Phiếu góp ý\n\nGhi ý kiến góp ý về hồ sơ.' },
    { type: 'textarea', id: 'yk', key: 'yKien', label: 'Ý kiến góp ý', validate: { required: true } },
  ],
}

const phieuDatChuaDatSchema = {
  type: 'default',
  id: 'phieu-dat-chua-dat',
  components: [
    { type: 'text', id: 'h', text: '## Phiếu thẩm định — Đạt / Chưa đạt' },
    {
      type: 'radio', id: 'kl', key: 'ketLuan', label: 'Kết luận thẩm định', validate: { required: true },
      values: [
        { value: 'dat', label: 'Đạt' },
        { value: 'chua_dat', label: 'Chưa đạt' },
      ],
    },
    { type: 'textarea', id: 'yk', key: 'yKien', label: 'Lý do / ghi chú' },
  ],
}

const baoCaoThamDinhSchema = {
  type: 'default',
  id: 'bao-cao-tham-dinh',
  components: [
    { type: 'text', id: 'h', text: '## Báo cáo thẩm định hồ sơ' },
    { type: 'textarea', id: 'nd', key: 'noiDung', label: 'Nội dung thẩm định', validate: { required: true } },
    {
      type: 'radio', id: 'kl', key: 'ketLuan', label: 'Kết luận', validate: { required: true },
      values: [
        { value: 'thong_qua', label: 'Thông qua' },
        { value: 'khong_thong_qua', label: 'Không thông qua' },
      ],
    },
    { type: 'textarea', id: 'kn', key: 'kienNghi', label: 'Kiến nghị' },
  ],
}

const phieuPheDuyetSchema = {
  type: 'default',
  id: 'phieu-phe-duyet',
  components: [
    { type: 'text', id: 'h', text: '## Phiếu phê duyệt' },
    {
      type: 'radio', id: 'kl', key: 'ketLuan', label: 'Quyết định', validate: { required: true },
      values: [
        { value: 'phe_duyet', label: 'Phê duyệt' },
        { value: 'tu_choi', label: 'Từ chối' },
      ],
    },
    { type: 'textarea', id: 'yk', key: 'yKien', label: 'Ý kiến' },
  ],
}

/** Biểu mẫu mẫu nạp sẵn vào thư viện. FormContext sẽ quản lý CRUD trên tập này. */
export const seedForms: FormMeta[] = [
  { key: 'phieu-y-kien', ten: 'Phiếu góp ý', moTa: 'Ghi ý kiến, không kết luận', loai: 'Góp ý', schema: phieuYKienSchema },
  { key: 'phieu-nhan-xet', ten: 'Phiếu nhận xét', moTa: 'Tiêu chí + kết luận + ý kiến', loai: 'Nhận xét', schema: phieuNhanXetSchema },
  { key: 'phieu-dat-chua-dat', ten: 'Phiếu Đạt / Chưa đạt', moTa: 'Kết luận Đạt/Chưa đạt + lý do', loai: 'Thẩm định', schema: phieuDatChuaDatSchema },
  { key: 'bao-cao-tham-dinh', ten: 'Báo cáo thẩm định', moTa: 'Nội dung + kết luận + kiến nghị', loai: 'Thẩm định', schema: baoCaoThamDinhSchema },
  { key: 'phieu-phe-duyet', ten: 'Phiếu phê duyệt / ký', moTa: 'Phê duyệt / Từ chối + ý kiến', loai: 'Phê duyệt', schema: phieuPheDuyetSchema },
]

/** Schema rỗng cho biểu mẫu mới tạo — chỉ có tiêu đề, chờ thiết kế trong designer. */
export function emptySchema(key: string, ten: string): unknown {
  return {
    type: 'default',
    id: key,
    components: [{ type: 'text', id: 'h', text: `## ${ten}` }],
  }
}

/** Đếm số trường nhập liệu (component có `key`) — bỏ qua text tĩnh. */
export function countFields(schema: unknown): number {
  const comps = (schema as { components?: { key?: string }[] })?.components
  return Array.isArray(comps) ? comps.filter((c) => !!c.key).length : 0
}

const APPROVE = new Set(['dong_y', 'dat', 'thong_qua', 'phe_duyet'])
export function isApprove(ketLuan?: unknown): boolean {
  return ketLuan === undefined || (typeof ketLuan === 'string' && APPROVE.has(ketLuan))
}

const TIEU_CHI: Record<string, string> = {
  capThiet: 'Tính cấp thiết',
  khaThi: 'Tính khả thi',
  duToan: 'Dự toán hợp lý',
  nhanSu: 'Năng lực nhân sự',
}

export function buildYKien(data: Record<string, unknown>): string {
  const parts: string[] = []
  if (data.noiDung) parts.push(String(data.noiDung))
  if (data.yKien) parts.push(String(data.yKien))
  if (data.kienNghi) parts.push('Kiến nghị: ' + String(data.kienNghi))
  const tc = data.tieuChi
  if (Array.isArray(tc) && tc.length) {
    parts.push('(Đạt: ' + tc.map((k) => TIEU_CHI[String(k)] ?? String(k)).join(', ') + ')')
  }
  return parts.join(' — ')
}

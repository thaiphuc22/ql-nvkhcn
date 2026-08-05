// Thư viện biểu mẫu (Camunda Forms / form-js) — DỮ LIỆU SEED + tiện ích xử lý kết quả.
//
// Nguồn sống của thư viện là `store/FormContext` (cho phép CRUD). File này chỉ
// giữ: (1) các schema mẫu ban đầu, (2) helper thuần (buildYKien).
import { phieuNhanXetSchema } from './phieuNhanXet'
import { phieuDuToanDemoSchema } from './phieuDuToanDemo'
import { phieuThanhVienDemoSchema } from './phieuThanhVienDemo'
import { congVanDangKyXetDuyetNvKhcnSchema } from './congVanDangKyXetDuyetNvKhcn'
import { bm0202DtoNv2024Schema } from './bm0202DtoNv2024'

export interface FormMeta {
  key: string
  ten: string
  moTa: string
  /** Loại biểu mẫu — dùng để nhóm/lọc trong thư viện. */
  loai?: 'Soạn thảo' | 'Góp ý' | 'Nhận xét' | 'Thẩm định' | 'Phê duyệt'
  schema: unknown
}

// Biểu mẫu SOẠN THẢO nội dung hồ sơ chủ trương (RD01) — gắn vào bước Khởi tạo.
// Không có trường `ketLuan` (không phải bước phê duyệt): chỉ nhập liệu nội dung HS.
const phieuChuTruongSchema = {
  type: 'default',
  id: 'phieu-chu-truong',
  components: [
    { type: 'text', id: 'h', text: '## Hồ sơ trình duyệt Chủ trương\n\nChủ nhiệm đề tài soạn nội dung hồ sơ chủ trương nhiệm vụ KHCN.' },
    { type: 'textarea', id: 'sct', key: 'suCanThiet', label: 'Sự cần thiết / bối cảnh', validate: { required: true } },
    { type: 'textarea', id: 'mt', key: 'mucTieu', label: 'Mục tiêu & nội dung chính', validate: { required: true } },
    { type: 'textarea', id: 'sp', key: 'sanPham', label: 'Sản phẩm dự kiến' },
    { type: 'textfield', id: 'dt', key: 'duToanTong', label: 'Tổng dự toán PL1–PL6 (triệu đồng)', validate: { required: true } },
  ],
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

// (D10) Gắn với action APPROVE_STEP — nút đã LÀ quyết định "Phê duyệt", nên form không
// còn trường `ketLuan` (tránh encode kết luận hai lần: nút + form).
const phieuPheDuyetSchema = {
  type: 'default',
  id: 'phieu-phe-duyet',
  components: [
    { type: 'text', id: 'h', text: '## Phiếu phê duyệt' },
    { type: 'textarea', id: 'yk', key: 'yKien', label: 'Ý kiến phê duyệt' },
  ],
}

/** Biểu mẫu mẫu nạp sẵn vào thư viện. FormContext sẽ quản lý CRUD trên tập này. */
export const seedForms: FormMeta[] = [
  { key: 'bm-02-00-cv-dang-ky-xet-duyet-nv-khcn', ten: 'BM.02.00/CV — Công văn đăng ký xét duyệt NV KHCN', moTa: 'Lập công văn xin thẩm định hồ sơ đăng ký xét duyệt nhiệm vụ KHCN và khai báo các đầu mối phối hợp', loai: 'Soạn thảo', schema: congVanDangKyXetDuyetNvKhcnSchema },
  {
    key: 'bm-02-02-dto-nv-2024',
    ten: 'BM.02.02.DTO.NV_2024 — Hồ sơ dự toán kinh phí NV KHCN',
    moTa: 'Dự toán kinh phí thực hiện nhiệm vụ KHCN (PL1–PL6): thông tin chung, căn cứ lập dự toán, bảng chi tiết nhân công/NVL/CCDC/thuê ngoài/chi khác/quản lý',
    loai: 'Soạn thảo',
    schema: bm0202DtoNv2024Schema,
  },
  { key: 'phieu-chu-truong', ten: 'Hồ sơ trình duyệt Chủ trương', moTa: 'Soạn nội dung HS chủ trương: sự cần thiết + mục tiêu + dự toán', loai: 'Soạn thảo', schema: phieuChuTruongSchema },
  { key: 'phieu-y-kien', ten: 'Phiếu góp ý', moTa: 'Ghi ý kiến, không kết luận', loai: 'Góp ý', schema: phieuYKienSchema },
  { key: 'phieu-nhan-xet', ten: 'Phiếu nhận xét', moTa: 'Tiêu chí + kết luận + ý kiến', loai: 'Nhận xét', schema: phieuNhanXetSchema },
  { key: 'phieu-dat-chua-dat', ten: 'Phiếu Đạt / Chưa đạt', moTa: 'Kết luận Đạt/Chưa đạt + lý do', loai: 'Thẩm định', schema: phieuDatChuaDatSchema },
  { key: 'bao-cao-tham-dinh', ten: 'Báo cáo thẩm định', moTa: 'Nội dung + kết luận + kiến nghị', loai: 'Thẩm định', schema: baoCaoThamDinhSchema },
  { key: 'phieu-phe-duyet', ten: 'Phiếu phê duyệt / ký', moTa: 'Phê duyệt / Từ chối + ý kiến', loai: 'Phê duyệt', schema: phieuPheDuyetSchema },
  { key: 'phieu-du-toan-demo', ten: 'Phiếu thẩm định dự toán', moTa: 'Demo ẩn/hiện có điều kiện + trường tự tính (eForm B-engine)', loai: 'Thẩm định', schema: phieuDuToanDemoSchema },
  { key: 'phieu-thanh-vien-demo', ten: 'Đăng ký thành viên', moTa: 'Demo bảng động: thêm/xoá dòng + tự tính & ẩn/hiện theo dòng (eForm B-engine)', loai: 'Soạn thảo', schema: phieuThanhVienDemoSchema },
]

/** Schema rỗng cho biểu mẫu mới tạo — chỉ có tiêu đề, chờ thiết kế trong designer. */
export function emptySchema(key: string, ten: string): unknown {
  return {
    type: 'default',
    id: key,
    components: [{ type: 'text', id: 'h', text: `## ${ten}` }],
  }
}

interface CountableComp {
  key?: string
  type?: string
  components?: CountableComp[]
}

/** Đếm số trường nhập liệu (component có `key`) — bỏ qua text tĩnh; đệ quy qua `group`
 *  (container thuần, field con vẫn tính là trường của biểu mẫu). */
function countIn(comps: CountableComp[]): number {
  let n = 0
  for (const c of comps) {
    if (c.type === 'group' && Array.isArray(c.components)) n += countIn(c.components)
    else if (c.key) n += 1
  }
  return n
}

export function countFields(schema: unknown): number {
  const comps = (schema as { components?: CountableComp[] })?.components
  return Array.isArray(comps) ? countIn(comps) : 0
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

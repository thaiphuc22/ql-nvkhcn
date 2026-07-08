// Mapping dữ liệu cho màn Tích hợp (`/tich-hop`) — Đợt 2, Slice D.
//
// Đây là lớp CẤU HÌNH chuyển đổi dữ liệu giữa QTKHCN và hệ ngoài (SAP/QLNS/MS/QLTS/PLM/IAM),
// tách khỏi connection config (endpoint/API key ở data/camundaOps.ts::IntegrationSystem) theo
// đúng đề xuất "Ý tưởng nâng cấp logic #1" trong docs/research/integration-screen-upgrade-notes.md.
//
// Theo mục "Transform có kiểm soát" của tài liệu: KHÔNG cho nhập script tuỳ ý trong MVP — chỉ
// một danh sách transform an toàn cố định (TransformKind bên dưới).

import { seedNhiemVu, type NhiemVu } from './nhiemVu'
import { seedHoSo, joinDossiers, DOSSIER_STATUS, type Dossier } from './dossiers'

/* ─────────────────────────── Model ─────────────────────────── */

export type MappingDirection = 'out' | 'in'

export const MAPPING_DIRECTION_LABEL: Record<MappingDirection, string> = {
  out: 'QTKHCN → hệ ngoài',
  in: 'Hệ ngoài → QTKHCN',
}

export type BusinessObject = 'HoSo' | 'NhiemVu' | 'DuToan' | 'NhanSu' | 'TaiSan'

export const BUSINESS_OBJECT_LABEL: Record<BusinessObject, string> = {
  HoSo: 'Hồ sơ',
  NhiemVu: 'Nhiệm vụ',
  DuToan: 'Dự toán',
  NhanSu: 'Nhân sự',
  TaiSan: 'Tài sản',
}

export type MappingFieldType = 'string' | 'number' | 'boolean' | 'date' | 'enum'

export const MAPPING_FIELD_TYPE_LABEL: Record<MappingFieldType, string> = {
  string: 'Chuỗi',
  number: 'Số',
  boolean: 'Đúng/Sai',
  date: 'Ngày',
  enum: 'Danh mục (enum)',
}

/** Danh sách transform AN TOÀN duy nhất được chọn trong MVP (không cho nhập script tự do). */
export type TransformKind =
  | 'format-date'
  | 'to-string'
  | 'concat'
  | 'split'
  | 'enum-map'
  | 'default-value'

export const TRANSFORM_LABEL: Record<TransformKind, string> = {
  'format-date': 'Định dạng lại ngày',
  'to-string': 'Đổi số sang chuỗi',
  concat: 'Nối field',
  split: 'Tách field',
  'enum-map': 'Đổi enum/trạng thái (theo bảng value mapping)',
  'default-value': 'Gán giá trị mặc định khi rỗng',
}

export interface ValueMapping {
  qtkhcn: string
  heNgoai: string
}

export interface FieldMapping {
  id: string
  truongQTKHCN: string
  kieuDuLieu: MappingFieldType
  truongHeNgoai: string
  batBuoc: boolean
  /** Đánh dấu là khoá định danh (maHoSo/maNhiemVu hoặc id hệ ngoài) — validate #5 cần ≥1 field này. */
  khoaDinhDanh?: boolean
  transform?: TransformKind
  giaTriMacDinh?: string
  /** Chỉ dùng khi kieuDuLieu = 'enum' hoặc transform = 'enum-map'. */
  valueMappings?: ValueMapping[]
}

export type MappingStatus = 'draft' | 'ready' | 'active' | 'deprecated' | 'error'

export const MAPPING_STATUS_META: Record<MappingStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'default' },
  ready: { label: 'Ready', color: 'blue' },
  active: { label: 'Active', color: 'success' },
  deprecated: { label: 'Deprecated', color: 'default' },
  error: { label: 'Error', color: 'error' },
}

export interface MappingConfig {
  id: string
  /** IntegrationSystem.key (data/camundaOps.ts). */
  he: string
  doiTuong: BusinessObject
  chieu: MappingDirection
  trangThai: MappingStatus
  version: number
  capNhatLuc: string
  capNhatBoi: string
  fields: FieldMapping[]
  /** Job type liên quan (camundaOps.JobRun.jobType) — chỉ tham chiếu hiển thị, không sở hữu. */
  jobType?: string
}

/* ─────────────────────────── Seed ─────────────────────────── */

const TODAY = '2026-07-08'

export const seedMappingConfigs: MappingConfig[] = [
  {
    id: 'map-sap-dutoan',
    he: 'SAP',
    doiTuong: 'DuToan',
    chieu: 'out',
    trangThai: 'active',
    version: 3,
    capNhatLuc: `${TODAY} 09:10`,
    capNhatBoi: 'admin',
    jobType: 'sap:sync-budget',
    fields: [
      {
        id: 'f-sap-1',
        truongQTKHCN: 'ma',
        kieuDuLieu: 'string',
        truongHeNgoai: 'taskCode',
        batBuoc: true,
        khoaDinhDanh: true,
      },
      {
        id: 'f-sap-2',
        truongQTKHCN: 'duToan',
        kieuDuLieu: 'string',
        truongHeNgoai: 'budgetAmount',
        batBuoc: true,
      },
      {
        id: 'f-sap-3',
        truongQTKHCN: 'giaiDoan',
        kieuDuLieu: 'enum',
        truongHeNgoai: 'syncStage',
        batBuoc: true,
        transform: 'enum-map',
        valueMappings: [
          { qtkhcn: 'chu_truong', heNgoai: 'PLANNING' },
          { qtkhcn: 'xet_duyet', heNgoai: 'REVIEW' },
          { qtkhcn: 'thuc_hien', heNgoai: 'EXECUTION' },
          { qtkhcn: 'dieu_chinh', heNgoai: 'ADJUST' },
          { qtkhcn: 'nghiem_thu', heNgoai: 'ACCEPTANCE' },
          { qtkhcn: 'quyet_toan', heNgoai: 'SETTLEMENT' },
        ],
      },
    ],
  },
  {
    id: 'map-qlns-nhansu',
    he: 'QLNS',
    doiTuong: 'NhanSu',
    chieu: 'out',
    trangThai: 'active',
    version: 2,
    capNhatLuc: `${TODAY} 08:05`,
    capNhatBoi: 'admin',
    jobType: 'qlns:sync-staff',
    fields: [
      {
        id: 'f-ns-1',
        truongQTKHCN: 'maNhanVien',
        kieuDuLieu: 'string',
        truongHeNgoai: 'employeeId',
        batBuoc: true,
        khoaDinhDanh: true,
      },
      {
        id: 'f-ns-2',
        truongQTKHCN: 'hoTen',
        kieuDuLieu: 'string',
        truongHeNgoai: 'fullName',
        batBuoc: true,
      },
      {
        id: 'f-ns-3',
        truongQTKHCN: 'email',
        kieuDuLieu: 'string',
        truongHeNgoai: 'email',
        batBuoc: false,
        transform: 'default-value',
        giaTriMacDinh: '(chưa có email)',
      },
      {
        id: 'f-ns-4',
        truongQTKHCN: 'donViCongTac',
        kieuDuLieu: 'string',
        truongHeNgoai: 'orgUnit',
        batBuoc: false,
      },
    ],
  },
  {
    id: 'map-ms-hoso-draft',
    he: 'MS',
    doiTuong: 'HoSo',
    chieu: 'out',
    trangThai: 'draft',
    version: 1,
    capNhatLuc: `${TODAY} 07:40`,
    capNhatBoi: 'admin',
    // Ví dụ minh hoạ đúng mục "Value mapping" của tài liệu đề xuất — trạng thái
    // hồ sơ QTKHCN -> status hệ ngoài, tách riêng field mapping và value mapping.
    fields: [
      {
        id: 'f-hs-1',
        truongQTKHCN: 'id',
        kieuDuLieu: 'string',
        truongHeNgoai: 'dossierCode',
        batBuoc: true,
        khoaDinhDanh: true,
      },
      {
        id: 'f-hs-2',
        truongQTKHCN: 'trangThai',
        kieuDuLieu: 'enum',
        truongHeNgoai: '', // cố tình để trống → minh hoạ validate #2 (thiếu trường hệ ngoài) khi Kích hoạt
        batBuoc: true,
        transform: 'enum-map',
        valueMappings: [
          { qtkhcn: 'draft', heNgoai: 'DRAFT' },
          { qtkhcn: 'processing', heNgoai: 'IN_REVIEW' },
          { qtkhcn: 'approved', heNgoai: 'DA_DUYET' },
          { qtkhcn: 'rejected', heNgoai: 'TU_CHOI' },
        ],
      },
    ],
  },
]

/* ─────────────────────────── Validate (fail-closed trước khi Active) ─────────────────────────── */

export interface MappingValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Validate trước khi cho chuyển trạng thái sang Active — theo mục "Validate trước khi active"
 * của tài liệu đề xuất: thiếu field bắt buộc, thiếu value mapping cho enum, map trùng field hệ
 * ngoài, không có khoá định danh. Fail-closed: bất kỳ lỗi nào cũng chặn Active.
 */
export function validateMappingConfig(config: MappingConfig): MappingValidationResult {
  const errors: string[] = []

  if (config.fields.length === 0) {
    errors.push('Chưa có field mapping nào.')
  }

  const seenExternal = new Set<string>()
  let hasKey = false

  for (const f of config.fields) {
    const label = f.truongQTKHCN || '(chưa đặt tên)'
    if (!f.truongQTKHCN.trim()) {
      errors.push('Có dòng thiếu tên trường QTKHCN.')
    }
    if (!f.truongHeNgoai.trim()) {
      errors.push(`Trường "${label}" thiếu trường hệ ngoài tương ứng.`)
    } else {
      if (seenExternal.has(f.truongHeNgoai)) {
        errors.push(`Trường hệ ngoài "${f.truongHeNgoai}" bị map trùng từ nhiều field QTKHCN.`)
      }
      seenExternal.add(f.truongHeNgoai)
    }
    if (f.khoaDinhDanh) hasKey = true
    if ((f.kieuDuLieu === 'enum' || f.transform === 'enum-map') && !(f.valueMappings && f.valueMappings.length > 0)) {
      errors.push(`Trường "${label}" là enum nhưng chưa khai value mapping.`)
    }
  }

  if (!hasKey) {
    errors.push('Chưa có field nào đánh dấu là khoá định danh (maHoSo/maNhiemVu hoặc id hệ ngoài).')
  }

  return { valid: errors.length === 0, errors }
}

/* ─────────────────────────── Preview payload ─────────────────────────── */

export interface FieldPreview {
  fieldId: string
  truongQTKHCN: string
  truongHeNgoai: string
  giaTriGoc: unknown
  giaTriSauMapping: unknown
  thieu: boolean
  loi: boolean
}

export interface PreviewResult {
  payload: Record<string, unknown>
  fields: FieldPreview[]
  missingCount: number
  invalidCount: number
}

/** Áp 1 field mapping lên giá trị nguồn — dùng chung bởi previewMapping. */
function applyField(field: FieldMapping, raw: unknown): { value: unknown; missing: boolean; invalid: boolean } {
  let value = raw
  let missing = value === undefined || value === null || value === ''
  let invalid = false

  if (missing && field.transform === 'default-value' && field.giaTriMacDinh !== undefined) {
    value = field.giaTriMacDinh
    missing = false
  }

  if (!missing && field.transform === 'enum-map') {
    const vm = field.valueMappings?.find((v) => v.qtkhcn === String(value))
    if (vm) value = vm.heNgoai
    else invalid = true
  }

  if (!missing && field.transform === 'to-string') value = String(value)

  return { value, missing, invalid }
}

/** Preview payload: áp toàn bộ field mapping của 1 config lên 1 bản ghi nguồn mẫu. */
export function previewMapping(config: MappingConfig, source: Record<string, unknown>): PreviewResult {
  const fields: FieldPreview[] = []
  const payload: Record<string, unknown> = {}
  let missingCount = 0
  let invalidCount = 0

  for (const f of config.fields) {
    const raw = source[f.truongQTKHCN]
    const { value, missing, invalid } = applyField(f, raw)
    const isMissing = missing && f.batBuoc
    if (isMissing) missingCount += 1
    if (invalid) invalidCount += 1
    if (!missing && f.truongHeNgoai) payload[f.truongHeNgoai] = value
    fields.push({
      fieldId: f.id,
      truongQTKHCN: f.truongQTKHCN,
      truongHeNgoai: f.truongHeNgoai,
      giaTriGoc: raw,
      giaTriSauMapping: missing ? undefined : value,
      thieu: isMissing,
      loi: invalid,
    })
  }

  return { payload, fields, missingCount, invalidCount }
}

/* ─────────────────────────── Bản ghi mẫu (cho Preview) ─────────────────────────── */

export interface SampleRecord {
  id: string
  label: string
  data: Record<string, unknown>
}

/**
 * Bản ghi mẫu theo đối tượng nghiệp vụ — lấy từ mock data đã có (nhiemVu.ts/dossiers.ts),
 * KHÔNG bịa dữ liệu minh hoạ. TaiSan chưa có seed trong mock (QLTS chưa được mô hình hoá) nên
 * trả mảng rỗng — trung thực về giới hạn thay vì giả lập.
 */
export function sampleRecordsFor(doiTuong: BusinessObject): SampleRecord[] {
  switch (doiTuong) {
    case 'NhiemVu':
      return seedNhiemVu.map((nv) => ({
        id: nv.ma,
        label: `${nv.ma} — ${nv.ten}`,
        data: {
          ma: nv.ma,
          ten: nv.ten,
          cap: nv.cap,
          donViChuTri: nv.donViChuTri,
          thoiGianThucHien: nv.thoiGianThucHien,
          duToan: nv.duToan,
          giaiDoan: nv.giaiDoan,
        } satisfies Record<keyof Pick<NhiemVu, 'ma' | 'ten' | 'cap' | 'donViChuTri' | 'thoiGianThucHien' | 'duToan' | 'giaiDoan'>, unknown>,
      }))
    case 'DuToan':
      return seedNhiemVu.map((nv) => ({
        id: nv.ma,
        label: `${nv.ma} — ${nv.ten}`,
        data: { ma: nv.ma, duToan: nv.duToan, giaiDoan: nv.giaiDoan },
      }))
    case 'NhanSu':
      return seedNhiemVu.map((nv) => ({
        id: nv.chuNhiem.maNhanVien ?? nv.ma,
        label: `${nv.chuNhiem.hoTen} (${nv.ma})`,
        data: {
          maNhanVien: nv.chuNhiem.maNhanVien,
          hoTen: nv.chuNhiem.hoTen,
          email: nv.chuNhiem.email,
          donViCongTac: nv.chuNhiem.donViCongTac,
        },
      }))
    case 'HoSo': {
      const dossiers: Dossier[] = joinDossiers(seedHoSo)
      return dossiers.map((d) => ({
        id: d.id,
        label: `${d.id} — ${d.tenDeTai} (${DOSSIER_STATUS[d.trangThai].label})`,
        data: {
          id: d.id,
          maNV: d.maNV,
          loai: d.loai,
          trangThai: d.trangThai,
          ngayTao: d.ngayTao,
        },
      }))
    }
    case 'TaiSan':
      return []
  }
}

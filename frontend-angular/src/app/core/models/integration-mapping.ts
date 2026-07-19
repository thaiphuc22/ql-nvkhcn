// Port của webapp/src/data/integrationMapping.ts. Ban đầu chỉ port phần cần cho
// Service Task (`MappingConfig` + seed + validate dùng trong CALL_API config); nay
// mở rộng thêm nhãn hiển thị + previewMapping cho màn Tích hợp thật (`/tich-hop`,
// xem core/services/integration-mapping.service.ts — GET /api/integration-mappings
// là nguồn dữ liệu thật). `sampleRecordsFor` KHÔNG port theo đúng dạng gốc (đọc từ
// seed tĩnh nhiemVu.ts/dossiers.ts) — Angular đã có backend thật cho NhiemVu/HoSo
// (NhiemVuService/HoSoService), nên trang Tích hợp lấy bản ghi mẫu trực tiếp từ đó
// thay vì fabricate lại một seed riêng; NhanSu vẫn trả rỗng vì NhiemVuResponse hiện
// không tách maNhanVien/email/donViCongTac (trung thực về giới hạn, giống TaiSan).

export type MappingDirection = 'out' | 'in';

export const MAPPING_DIRECTION_LABEL: Record<MappingDirection, string> = {
  out: 'QTKHCN → hệ ngoài',
  in: 'Hệ ngoài → QTKHCN',
};

export type BusinessObject = 'HoSo' | 'NhiemVu' | 'DuToan' | 'NhanSu' | 'TaiSan';

export const BUSINESS_OBJECT_LABEL: Record<BusinessObject, string> = {
  HoSo: 'Hồ sơ',
  NhiemVu: 'Nhiệm vụ',
  DuToan: 'Dự toán',
  NhanSu: 'Nhân sự',
  TaiSan: 'Tài sản',
};

export type MappingFieldType = 'string' | 'number' | 'boolean' | 'date' | 'enum';

export const MAPPING_FIELD_TYPE_LABEL: Record<MappingFieldType, string> = {
  string: 'Chuỗi',
  number: 'Số',
  boolean: 'Đúng/Sai',
  date: 'Ngày',
  enum: 'Danh mục (enum)',
};

/** Danh sách transform AN TOÀN duy nhất được chọn trong MVP (không cho nhập script tự do). */
export type TransformKind =
  | 'format-date'
  | 'to-string'
  | 'concat'
  | 'split'
  | 'enum-map'
  | 'default-value';

export const TRANSFORM_LABEL: Record<TransformKind, string> = {
  'format-date': 'Định dạng lại ngày',
  'to-string': 'Đổi số sang chuỗi',
  concat: 'Nối field',
  split: 'Tách field',
  'enum-map': 'Đổi enum/trạng thái (theo bảng value mapping)',
  'default-value': 'Gán giá trị mặc định khi rỗng',
};

export interface ValueMapping {
  qtkhcn: string;
  heNgoai: string;
}

export interface FieldMapping {
  id: string;
  truongQTKHCN: string;
  kieuDuLieu: MappingFieldType;
  truongHeNgoai: string;
  batBuoc: boolean;
  /** Đánh dấu là khoá định danh (maHoSo/maNhiemVu hoặc id hệ ngoài). */
  khoaDinhDanh?: boolean;
  transform?: TransformKind;
  giaTriMacDinh?: string;
  valueMappings?: ValueMapping[];
}

export type MappingStatus = 'draft' | 'ready' | 'active' | 'deprecated' | 'error';

export const MAPPING_STATUS_META: Record<MappingStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'default' },
  ready: { label: 'Ready', color: 'blue' },
  active: { label: 'Active', color: 'success' },
  deprecated: { label: 'Deprecated', color: 'default' },
  error: { label: 'Error', color: 'error' },
};

export interface MappingConfig {
  id: string;
  /** IntegrationSystem.key (core/models/integration-system.ts). */
  he: string;
  doiTuong: BusinessObject;
  chieu: MappingDirection;
  trangThai: MappingStatus;
  /** JPA @Version — dùng làm ETag cho If-Match khi sửa field/trạng thái (GET /api/integration-mappings). */
  version: number;
  capNhatLuc: string;
  capNhatBoi: string;
  fields: FieldMapping[];
  jobType?: string;
}

export interface CreateMappingRequest {
  he: string;
  doiTuong: BusinessObject;
  chieu: MappingDirection;
}

const TODAY = '2026-07-08';

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
        truongHeNgoai: '',
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
];

export interface MappingValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate trước khi cho chuyển trạng thái sang Active: thiếu field bắt buộc, thiếu
 * value mapping cho enum, map trùng field hệ ngoài, không có khoá định danh. Fail-closed.
 */
export function validateMappingConfig(config: MappingConfig): MappingValidationResult {
  const errors: string[] = [];

  if (config.fields.length === 0) {
    errors.push('Chưa có field mapping nào.');
  }

  const seenExternal = new Set<string>();
  let hasKey = false;

  for (const f of config.fields) {
    const label = f.truongQTKHCN || '(chưa đặt tên)';
    if (!f.truongQTKHCN.trim()) {
      errors.push('Có dòng thiếu tên trường QTKHCN.');
    }
    if (!f.truongHeNgoai.trim()) {
      errors.push(`Trường "${label}" thiếu trường hệ ngoài tương ứng.`);
    } else {
      if (seenExternal.has(f.truongHeNgoai)) {
        errors.push(`Trường hệ ngoài "${f.truongHeNgoai}" bị map trùng từ nhiều field QTKHCN.`);
      }
      seenExternal.add(f.truongHeNgoai);
    }
    if (f.khoaDinhDanh) hasKey = true;
    if ((f.kieuDuLieu === 'enum' || f.transform === 'enum-map') && !(f.valueMappings && f.valueMappings.length > 0)) {
      errors.push(`Trường "${label}" là enum nhưng chưa khai value mapping.`);
    }
  }

  if (!hasKey) {
    errors.push('Chưa có field nào đánh dấu là khoá định danh (maHoSo/maNhiemVu hoặc id hệ ngoài).');
  }

  return { valid: errors.length === 0, errors };
}

/* ─────────────────────────── Preview payload (màn Tích hợp) ─────────────────────────── */

export interface SampleRecord {
  id: string;
  label: string;
  data: Record<string, unknown>;
}

export interface FieldPreview {
  fieldId: string;
  truongQTKHCN: string;
  truongHeNgoai: string;
  giaTriGoc: unknown;
  giaTriSauMapping: unknown;
  thieu: boolean;
  loi: boolean;
}

export interface PreviewResult {
  payload: Record<string, unknown>;
  fields: FieldPreview[];
  missingCount: number;
  invalidCount: number;
}

/** Áp 1 field mapping lên giá trị nguồn — dùng chung bởi previewMapping. */
function applyField(field: FieldMapping, raw: unknown): { value: unknown; missing: boolean; invalid: boolean } {
  let value = raw;
  let missing = value === undefined || value === null || value === '';
  let invalid = false;

  if (missing && field.transform === 'default-value' && field.giaTriMacDinh !== undefined) {
    value = field.giaTriMacDinh;
    missing = false;
  }

  if (!missing && field.transform === 'enum-map') {
    const vm = field.valueMappings?.find((v) => v.qtkhcn === String(value));
    if (vm) value = vm.heNgoai;
    else invalid = true;
  }

  if (!missing && field.transform === 'to-string') value = String(value);

  return { value, missing, invalid };
}

/** Preview payload: áp toàn bộ field mapping của 1 config lên 1 bản ghi nguồn mẫu. */
export function previewMapping(config: MappingConfig, source: Record<string, unknown>): PreviewResult {
  const fields: FieldPreview[] = [];
  const payload: Record<string, unknown> = {};
  let missingCount = 0;
  let invalidCount = 0;

  for (const f of config.fields) {
    const raw = source[f.truongQTKHCN];
    const { value, missing, invalid } = applyField(f, raw);
    const isMissing = missing && f.batBuoc;
    if (isMissing) missingCount += 1;
    if (invalid) invalidCount += 1;
    if (!missing && f.truongHeNgoai) payload[f.truongHeNgoai] = value;
    fields.push({
      fieldId: f.id,
      truongQTKHCN: f.truongQTKHCN,
      truongHeNgoai: f.truongHeNgoai,
      giaTriGoc: raw,
      giaTriSauMapping: missing ? undefined : value,
      thieu: isMissing,
      loi: invalid,
    });
  }

  return { payload, fields, missingCount, invalidCount };
}

// Port scoped của webapp/src/data/integrationMapping.ts — chỉ phần cần cho Service
// Task (`MappingConfig` + seed + validate dùng trong CALL_API config). Không port
// sampleRecordsFor/previewMapping (phụ thuộc nhiemVu.ts/dossiers.ts và chỉ dùng ở
// màn Tích hợp `/tich-hop`, chưa lên Angular).

export type MappingDirection = 'out' | 'in';

export type BusinessObject = 'HoSo' | 'NhiemVu' | 'DuToan' | 'NhanSu' | 'TaiSan';

export type MappingFieldType = 'string' | 'number' | 'boolean' | 'date' | 'enum';

/** Danh sách transform AN TOÀN duy nhất được chọn trong MVP (không cho nhập script tự do). */
export type TransformKind =
  | 'format-date'
  | 'to-string'
  | 'concat'
  | 'split'
  | 'enum-map'
  | 'default-value';

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

export interface MappingConfig {
  id: string;
  /** IntegrationSystem.key (core/models/integration-system.ts). */
  he: string;
  doiTuong: BusinessObject;
  chieu: MappingDirection;
  trangThai: MappingStatus;
  version: number;
  capNhatLuc: string;
  capNhatBoi: string;
  fields: FieldMapping[];
  jobType?: string;
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

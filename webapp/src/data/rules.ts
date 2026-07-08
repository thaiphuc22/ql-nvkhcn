// Danh mục Luật nghiệp vụ (EPIC09 — Business Rule Management). Mock, chưa nối Zeebe.
//
// NGUỒN CHUẨN của một luật DMN-evaluable = `dmnXml` (giữ đúng kỷ luật §2/§8: dù soạn
// bằng lưới native hay dmn-js, execution đồng nhất vì đều compile về DMN XML). Lưới
// thân thiện được suy RA từ dmnXml lúc mở (parseDmn → dmnToGrid), không lưu song song.
//
// Có 2 kiểu luật (§7 ranh giới DMN vs Code):
//   - 'DMN'     : hàm thuần của vài input scalar → mở trình soạn bảng, có dmnXml.
//   - 'SERVICE' : cần join DB / gọi hệ ngoài → chỉ khai interface, dev hiện thực (không dmnXml).

import { gridToDmn, type RuleGrid } from '../dmn/ruleGrid'
import { RD02_ROUTING_DMN } from '../dmn/rd02Routing.dmn'

export type RuleStatus = 'active' | 'draft' | 'disabled'
export type RuleKind = 'DMN' | 'SERVICE'
export type RuleCategory = 'routing' | 'classification' | 'threshold' | 'other'

export interface BusinessRule {
  id: string
  /** Mã luật hiển thị, vd 'BR-RD02-ROUTING'. */
  ma: string
  ten: string
  moTa: string
  category: RuleCategory
  kind: RuleKind
  /** Các quy trình/giai đoạn RD áp dụng, vd ['RD02.01']. */
  rdApDung: string[]
  trangThai: RuleStatus
  version: number
  capNhat: string
  nguoiCapNhat: string
  /** Nguồn chuẩn (chỉ luật kind='DMN'). */
  dmnXml?: string
  /** Mô tả interface cho luật kind='SERVICE' (dev hiện thực ở backend). */
  serviceInterface?: { inputs: string; output: string }
}

export const RULE_CATEGORY_LABEL: Record<RuleCategory, string> = {
  routing: 'Định tuyến',
  classification: 'Phân loại',
  threshold: 'Ngưỡng',
  other: 'Khác',
}

export const RULE_CATEGORY_COLOR: Record<RuleCategory, string> = {
  routing: 'geekblue',
  classification: 'purple',
  threshold: 'gold',
  other: 'default',
}

export const RULE_STATUS_META: Record<RuleStatus, { label: string; color: string }> = {
  active: { label: 'Đang hiệu lực', color: 'green' },
  draft: { label: 'Bản nháp', color: 'gold' },
  disabled: { label: 'Đã vô hiệu', color: 'default' },
}

export const RULE_KIND_META: Record<RuleKind, { label: string; color: string }> = {
  DMN: { label: 'Bảng quyết định ', color: 'blue' },
  SERVICE: { label: 'Khác', color: 'volcano' },
}

// ── Lưới seed cho các luật nhỏ (single-decision) → sinh dmnXml qua gridToDmn ──

const gridCanHoiDongNghiemThu: RuleGrid = [
  {
    id: 'canHoiDongNghiemThu',
    name: 'Cần Hội đồng nghiệm thu',
    hitPolicy: 'FIRST',
    requires: [],
    inputs: [
      { id: 'c1', label: 'Tổng dự toán (đồng)', variable: 'tongDuToan', type: 'number', typeRef: 'number' },
    ],
    outputs: [
      { id: 'o1', label: 'Cần hội đồng nghiệm thu', variable: 'canHoiDongNghiemThu', type: 'boolean', typeRef: 'boolean' },
    ],
    rules: [
      { id: 'r1', when: [{ op: 'gte', value: 3_000_000_000 }], then: [{ value: true }] },
      { id: 'r2', when: [{ op: 'any', value: null }], then: [{ value: false }] },
    ],
  },
]

const gridQuyMo: RuleGrid = [
  {
    id: 'quyMoNhiemVu',
    name: 'Xếp quy mô nhiệm vụ',
    hitPolicy: 'FIRST',
    requires: [],
    inputs: [
      { id: 'c1', label: 'Tổng dự toán (đồng)', variable: 'tongDuToan', type: 'number', typeRef: 'number' },
    ],
    outputs: [
      {
        id: 'o1',
        label: 'Quy mô',
        variable: 'quyMo',
        type: 'string',
        typeRef: 'string',
        options: [
          { value: 'LON', label: 'Lớn' },
          { value: 'VUA', label: 'Vừa' },
          { value: 'NHO', label: 'Nhỏ' },
        ],
      },
    ],
    rules: [
      { id: 'r1', when: [{ op: 'gte', value: 20_000_000_000 }], then: [{ value: 'LON' }] },
      { id: 'r2', when: [{ op: 'gte', value: 5_000_000_000 }], then: [{ value: 'VUA' }] },
      { id: 'r3', when: [{ op: 'any', value: null }], then: [{ value: 'NHO' }] },
    ],
  },
]

const gridKetLuanNghiemThu: RuleGrid = [
  {
    id: 'ketLuanNghiemThu',
    name: 'Kết luận nghiệm thu',
    hitPolicy: 'FIRST',
    requires: [],
    inputs: [
      { id: 'c1', label: 'Điểm tổng kết', variable: 'diemTongKet', type: 'number', typeRef: 'number' },
    ],
    outputs: [
      {
        id: 'o1',
        label: 'Kết luận',
        variable: 'ketLuan',
        type: 'string',
        typeRef: 'string',
        options: [
          { value: 'DAT', label: 'Đạt' },
          { value: 'CHUA_DAT', label: 'Chưa đạt' },
        ],
      },
    ],
    rules: [
      { id: 'r1', when: [{ op: 'gte', value: 50 }], then: [{ value: 'DAT' }] },
      { id: 'r2', when: [{ op: 'any', value: null }], then: [{ value: 'CHUA_DAT' }] },
    ],
  },
]

/** Seed danh mục luật — đủ đa dạng loại/kiểu/trạng thái để danh sách trông thật. */
export const seedRules: BusinessRule[] = [
  {
    id: 'rule-rd02-routing',
    ma: 'BR-RD02-ROUTING',
    ten: 'Định tuyến thẩm định RD02',
    moTa: 'DRD 3 mắt xích: phân cấp CS/TĐ → cần Hội đồng → loại Hội đồng. Điều khiển gateway RD02.01.',
    category: 'routing',
    kind: 'DMN',
    rdApDung: ['RD02.01'],
    trangThai: 'active',
    version: 3,
    capNhat: '2026-07-07',
    nguoiCapNhat: 'Quản trị hệ thống',
    dmnXml: RD02_ROUTING_DMN,
  },
  {
    id: 'rule-quy-mo',
    ma: 'BR-QUY-MO',
    ten: 'Xếp quy mô nhiệm vụ theo dự toán',
    moTa: 'Phân loại Lớn / Vừa / Nhỏ theo tổng dự toán để áp chính sách quản lý tương ứng.',
    category: 'classification',
    kind: 'DMN',
    rdApDung: ['RD01.01', 'RD02.01'],
    trangThai: 'active',
    version: 2,
    capNhat: '2026-07-06',
    nguoiCapNhat: 'Quản trị hệ thống',
    dmnXml: gridToDmn(gridQuyMo, { id: 'drd_quy_mo', name: 'Xếp quy mô nhiệm vụ' }),
  },
  {
    id: 'rule-hoi-dong-nghiem-thu',
    ma: 'BR-RD05-HDNT',
    ten: 'Cần Hội đồng nghiệm thu (RD05)',
    moTa: 'Nhiệm vụ có tổng dự toán ≥ 3 tỷ cần thành lập Hội đồng nghiệm thu cấp cơ sở.',
    category: 'threshold',
    kind: 'DMN',
    rdApDung: ['RD05.01'],
    trangThai: 'draft',
    version: 1,
    capNhat: '2026-07-08',
    nguoiCapNhat: 'Quản trị hệ thống',
    dmnXml: gridToDmn(gridCanHoiDongNghiemThu, {
      id: 'drd_hdnt',
      name: 'Cần Hội đồng nghiệm thu',
    }),
  },
  {
    id: 'rule-ket-luan-nghiem-thu',
    ma: 'BR-KET-LUAN-NT',
    ten: 'Kết luận nghiệm thu Đạt / Chưa đạt',
    moTa: 'Suy kết luận nghiệm thu từ điểm tổng kết của Hội đồng (ngưỡng đạt 50 điểm).',
    category: 'classification',
    kind: 'DMN',
    rdApDung: ['RD05.01', 'RD06.01'],
    trangThai: 'active',
    version: 1,
    capNhat: '2026-07-05',
    nguoiCapNhat: 'Quản trị hệ thống',
    dmnXml: gridToDmn(gridKetLuanNghiemThu, { id: 'drd_ket_luan', name: 'Kết luận nghiệm thu' }),
  },
  {
    id: 'rule-doi-chieu-sap',
    ma: 'BR-DOI-CHIEU-SAP',
    ten: 'Đối chiếu dự toán với SAP',
    moTa: 'Kiểm tra tổng dự toán hồ sơ khớp số liệu kế hoạch năm trên SAP. Cần gọi hệ ngoài → luật dịch vụ, không đưa vào DMN.',
    category: 'other',
    kind: 'SERVICE',
    rdApDung: ['RD02.01', 'RD08.01'],
    trangThai: 'disabled',
    version: 1,
    capNhat: '2026-07-04',
    nguoiCapNhat: 'Quản trị hệ thống',
    serviceInterface: {
      inputs: 'maHoSo, tongDuToan, namKeHoach',
      output: 'khopSAP (boolean), chenhLech (number)',
    },
  },
]

// EPIC06 — Approval Matrix: Variable Registry (Slice B của refactor,
// docs/research/approval-matrix-refactor-plan.md §3.3 / §4.B).
//
// Khai báo METADATA cho các trường điều kiện mà Ma trận phê duyệt được phép so
// khớp. Nhờ registry này, thêm một điều kiện nghiệp vụ mới = thêm một dòng ở đây,
// KHÔNG phải sửa ApprovalMatrix.tsx hay resolver: Condition Builder tự render đúng
// control theo `type`, resolver tự đánh giá qua approvalConditions.
//
// Giá trị enum bám data/variableContract.ts (nguồn chuẩn của biến process) ở những
// biến trùng (capNhiemVu↔cap, loaiHoiDong). Các biến còn lại là seed demo để minh
// hoạ khả năng mở rộng — khi có backend, danh mục này do domain service cấp.
//
// Đợt 1 (mock động): chỉ 3 biến lõi `simulated:true` được panel Mô phỏng cấp giá
// trị (capNhiemVu, loaiHoiDong, tongDuToan) — giữ nguyên hành vi simulation cũ.
// Các biến khác vẫn tạo luật được; ở runtime thật (Đợt 2, Slice G) chúng resolve
// từ context hồ sơ.

import type { ConditionOperator } from './approvalConditions'

export type VariableType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'enum'
  | 'multiEnum'
  | 'date'

export interface ApprovalVariableDef {
  key: string
  label: string
  type: VariableType
  source: 'dossier' | 'mission' | 'process' | 'dmn' | 'organization' | 'system'
  operators: ConditionOperator[]
  options?: { value: string; label: string }[]
  /** Panel Mô phỏng có cấp giá trị cho biến này không (Đợt 1: 3 biến lõi). */
  simulated?: boolean
}

// Bộ toán tử mặc định theo kiểu — Condition Builder đọc để giới hạn lựa chọn.
const NUM_OPS: ConditionOperator[] = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between', 'exists', 'notExists']
const ENUM_OPS: ConditionOperator[] = ['eq', 'neq', 'in', 'exists', 'notExists']
const MULTI_OPS: ConditionOperator[] = ['in', 'contains', 'exists', 'notExists']
const STR_OPS: ConditionOperator[] = ['eq', 'neq', 'contains', 'exists', 'notExists']
const BOOL_OPS: ConditionOperator[] = ['eq', 'exists', 'notExists']

export const APPROVAL_VARIABLES: ApprovalVariableDef[] = [
  {
    key: 'capNhiemVu',
    label: 'Cấp nhiệm vụ',
    type: 'enum',
    source: 'dmn',
    operators: ENUM_OPS,
    options: [
      { value: 'CS', label: 'Cơ sở' },
      { value: 'TD', label: 'Tập đoàn' },
    ],
    simulated: true,
  },
  {
    key: 'loaiHoiDong',
    label: 'Loại hội đồng',
    type: 'enum',
    source: 'dmn',
    operators: ENUM_OPS,
    options: [
      { value: 'HD_KHCN_TD', label: 'Hội đồng KHCN Tập đoàn' },
      { value: 'HD_CS', label: 'Hội đồng Cơ sở' },
      { value: 'KHONG', label: 'Không cần hội đồng' },
    ],
    simulated: true,
  },
  {
    key: 'tongDuToan',
    label: 'Tổng dự toán (đồng)',
    type: 'number',
    source: 'dossier',
    operators: NUM_OPS,
    simulated: true,
  },
  // ── Biến mở rộng (tạo luật được; runtime resolve từ hồ sơ ở Đợt 2) ──────────
  {
    key: 'loaiNhiemVu',
    label: 'Loại nhiệm vụ',
    type: 'enum',
    source: 'mission',
    operators: ENUM_OPS,
    options: [
      { value: 'NCKH', label: 'Nghiên cứu khoa học' },
      { value: 'SXTN', label: 'Sản xuất thử nghiệm' },
      { value: 'DA', label: 'Dự án/Đề án' },
    ],
  },
  {
    key: 'nguonVon',
    label: 'Nguồn vốn',
    type: 'enum',
    source: 'mission',
    operators: ENUM_OPS,
    options: [
      { value: 'VHT', label: 'Ngân sách VHT' },
      { value: 'TD', label: 'Ngân sách Tập đoàn' },
      { value: 'NN', label: 'Ngân sách Nhà nước' },
    ],
  },
  {
    key: 'linhVucKhcn',
    label: 'Lĩnh vực KHCN',
    type: 'enum',
    source: 'mission',
    operators: ENUM_OPS,
    options: [
      { value: 'CNTT', label: 'Công nghệ thông tin' },
      { value: 'VT', label: 'Viễn thông' },
      { value: 'DTVT', label: 'Điện tử viễn thông' },
      { value: 'AN', label: 'An ninh mạng' },
    ],
  },
  {
    key: 'mucDoMat',
    label: 'Mức độ mật',
    type: 'enum',
    source: 'dossier',
    operators: ENUM_OPS,
    options: [
      { value: 'THUONG', label: 'Thường' },
      { value: 'MAT', label: 'Mật' },
      { value: 'TOI_MAT', label: 'Tối mật' },
    ],
  },
  {
    key: 'donViChuTri',
    label: 'Đơn vị chủ trì',
    type: 'string',
    source: 'dossier',
    operators: STR_OPS,
  },
  {
    key: 'coMuaSam',
    label: 'Có mua sắm',
    type: 'boolean',
    source: 'dossier',
    operators: BOOL_OPS,
  },
  {
    key: 'coThueNgoai',
    label: 'Có thuê ngoài',
    type: 'boolean',
    source: 'dossier',
    operators: BOOL_OPS,
  },
  {
    key: 'processCode',
    label: 'Mã quy trình',
    type: 'enum',
    source: 'process',
    operators: MULTI_OPS,
    options: [
      { value: 'RD01', label: 'RD01 — Chủ trương' },
      { value: 'RD02', label: 'RD02 — Xét duyệt' },
      { value: 'RD05', label: 'RD05 — Nghiệm thu' },
    ],
  },
]

const VAR_BY_KEY = new Map(APPROVAL_VARIABLES.map((v) => [v.key, v]))

export function variableDef(key: string): ApprovalVariableDef | undefined {
  return VAR_BY_KEY.get(key)
}

/** Nhãn hiển thị của một biến (fallback = key thô). */
export function variableLabel(key: string): string {
  return VAR_BY_KEY.get(key)?.label ?? key
}

/** Nhãn hiển thị của một giá trị theo biến (enum → nhãn; boolean → Có/Không). */
export function variableValueLabel(key: string, value: unknown): string {
  const def = VAR_BY_KEY.get(key)
  if (!def) return String(value)
  if (def.type === 'boolean') return value ? 'Có' : 'Không'
  if (def.options) {
    return def.options.find((o) => o.value === value)?.label ?? String(value)
  }
  return String(value)
}

/** Helpers dùng cho describeConditionTree — gắn nhãn tiếng Việt đẹp. */
export const describeHelpers = {
  fieldLabel: variableLabel,
  valueLabel: variableValueLabel,
}

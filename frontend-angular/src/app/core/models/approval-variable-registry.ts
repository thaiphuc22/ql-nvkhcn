/**
 * Ma trận phê duyệt — Variable Registry. Port của
 * webapp/src/data/approvalVariableRegistry.ts (EPIC06, D17 Angular migration).
 *
 * Metadata cho các trường điều kiện mà Ma trận phê duyệt được phép so khớp.
 * Condition Builder render đúng control theo `type`; resolver đánh giá qua
 * approval-conditions.ts. Chỉ 8 biến `simulated:true` được panel Mô phỏng cấp
 * giá trị; các biến khác vẫn tạo luật được, resolve từ context hồ sơ ở runtime
 * thật (chưa có ở phạm vi mock này).
 */

import type { ConditionOperator } from './approval-conditions';

export type VariableType = 'string' | 'number' | 'boolean' | 'enum' | 'multiEnum' | 'date';

export interface ApprovalVariableDef {
  key: string;
  label: string;
  type: VariableType;
  source: 'dossier' | 'mission' | 'process' | 'dmn' | 'organization' | 'system';
  operators: ConditionOperator[];
  options?: { value: string; label: string }[];
  /** Panel Mô phỏng có cấp giá trị cho biến này không. */
  simulated?: boolean;
  /** Thứ tự hiển thị trong panel Mô phỏng (số nhỏ = trên cùng). */
  simulationOrder?: number;
  /** Giá trị mặc định cho panel Mô phỏng. */
  simulationDefault?: unknown;
  /** Hiển thị biến này trong panel Mô phỏng chỉ khi slot thuộc danh sách (bỏ trống = luôn hiện). */
  visibleForSlots?: string[];
}

// Bộ toán tử mặc định theo kiểu — Condition Builder đọc để giới hạn lựa chọn.
const NUM_OPS: ConditionOperator[] = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between', 'exists', 'notExists'];
const ENUM_OPS: ConditionOperator[] = ['eq', 'neq', 'in', 'exists', 'notExists'];
const MULTI_OPS: ConditionOperator[] = ['in', 'contains', 'exists', 'notExists'];
const STR_OPS: ConditionOperator[] = ['eq', 'neq', 'contains', 'exists', 'notExists'];
const BOOL_OPS: ConditionOperator[] = ['eq', 'exists', 'notExists'];

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
    simulationOrder: 1,
    simulationDefault: 'TD',
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
    simulationOrder: 3,
    simulationDefault: 'HD_KHCN_TD',
    visibleForSlots: ['HOI_DONG'],
  },
  {
    key: 'tongDuToan',
    label: 'Tổng dự toán (đồng)',
    type: 'number',
    source: 'dossier',
    operators: NUM_OPS,
    simulated: true,
    simulationOrder: 2,
    simulationDefault: 12_000_000_000,
  },
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
    simulated: true,
    simulationOrder: 4,
    simulationDefault: 'NCKH',
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
    simulated: true,
    simulationOrder: 5,
    simulationDefault: '',
  },
  {
    key: 'coMuaSam',
    label: 'Có mua sắm',
    type: 'boolean',
    source: 'dossier',
    operators: BOOL_OPS,
    simulated: true,
    simulationOrder: 6,
    simulationDefault: false,
  },
  {
    key: 'coThueNgoai',
    label: 'Có thuê ngoài',
    type: 'boolean',
    source: 'dossier',
    operators: BOOL_OPS,
    simulated: true,
    simulationOrder: 7,
    simulationDefault: false,
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
    simulated: true,
    simulationOrder: 8,
    simulationDefault: 'RD01',
  },
];

const VAR_BY_KEY = new Map(APPROVAL_VARIABLES.map((v) => [v.key, v]));

export function variableDef(key: string): ApprovalVariableDef | undefined {
  return VAR_BY_KEY.get(key);
}

/** Nhãn hiển thị của một biến (fallback = key thô). */
export function variableLabel(key: string): string {
  return VAR_BY_KEY.get(key)?.label ?? key;
}

/** Nhãn hiển thị của một giá trị theo biến (enum → nhãn; boolean → Có/Không). */
export function variableValueLabel(key: string, value: unknown): string {
  const def = VAR_BY_KEY.get(key);
  if (!def) return String(value);
  if (def.type === 'boolean') return value ? 'Có' : 'Không';
  if (def.options) {
    return def.options.find((o) => o.value === value)?.label ?? String(value);
  }
  return String(value);
}

/** Helpers dùng cho describeConditionTree — gắn nhãn tiếng Việt đẹp. */
export const describeHelpers = {
  fieldLabel: variableLabel,
  valueLabel: variableValueLabel,
};

/** Các biến dùng được trong panel Mô phỏng, sắp xếp theo simulationOrder. */
export function simulationVariables(slot?: string): ApprovalVariableDef[] {
  return APPROVAL_VARIABLES.filter((v) => {
    if (!v.simulated) return false;
    if (v.visibleForSlots && slot && !v.visibleForSlots.includes(slot)) return false;
    return true;
  }).sort((a, b) => (a.simulationOrder ?? 99) - (b.simulationOrder ?? 99));
}

/** Giá trị mặc định cho toàn bộ biến mô phỏng (dùng khởi tạo state). */
export function defaultSimulationContext(slot?: string): Record<string, unknown> {
  const ctx: Record<string, unknown> = {};
  for (const v of simulationVariables(slot)) {
    ctx[v.key] = v.simulationDefault ?? null;
  }
  return ctx;
}

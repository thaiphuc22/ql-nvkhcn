// Contract BIẾN PROCESS dùng chung cho toàn bộ luồng KHCN — NGUỒN CHUẨN DUY NHẤT.
//
// Đồng bộ với docs/arch/camunda-design.md §5.2 (kỷ luật process variables):
// process CHỈ giữ mã hồ sơ (correlation) + các biến điều khiển rẽ nhánh dưới đây.
// Giá trị dùng slug ASCII không dấu (an toàn khi so sánh FEEL, tránh lỗi gõ);
// nhãn tiếng Việt chỉ để hiển thị trên UI.
//
// Mọi nơi sinh/kiểm tra điều kiện FEEL (preset ở khcnConditionModule, lint ở
// khcnLint, seed rd0101Bpmn) đều phải tham chiếu file này — KHÔNG tự bịa tên
// biến hay giá trị mới. Muốn thêm biến → thêm ở đây trước.

export interface VariableValue {
  value: string
  label: string
}

export interface ProcessVariable {
  name: string
  label: string
  type: 'string' | 'boolean'
  /** Tập giá trị hợp lệ (chỉ với type=string có miền giá trị đóng). */
  values?: VariableValue[]
}

export const PROCESS_VARIABLES: ProcessVariable[] = [
  { name: 'maHoSo', label: 'Mã hồ sơ (correlation key)', type: 'string' },
  {
    name: 'cap',
    label: 'Cấp nhiệm vụ',
    type: 'string',
    values: [
      { value: 'CS', label: 'Cơ sở' },
      { value: 'TD', label: 'Tập đoàn' },
    ],
  },
  {
    name: 'ketQuaThamDinh',
    label: 'Kết quả thẩm định',
    type: 'string',
    values: [
      { value: 'dat', label: 'Đạt' },
      { value: 'dong_y_bo_sung', label: 'Đồng ý, yêu cầu bổ sung' },
      { value: 'hieu_chinh', label: 'Yêu cầu hiệu chỉnh' },
      { value: 'tu_choi', label: 'Không đồng ý' },
    ],
  },
  {
    name: 'ketQuaKyDuyet',
    label: 'Kết quả ký duyệt',
    type: 'string',
    values: [
      { value: 'dong_y', label: 'Đồng ý' },
      { value: 'hieu_chinh', label: 'Yêu cầu hiệu chỉnh' },
      { value: 'tu_choi', label: 'Từ chối' },
    ],
  },
  {
    name: 'ketQuaHDKHCN',
    label: 'Kết quả Hội đồng KHCN',
    type: 'string',
    values: [
      { value: 'dong_y', label: 'Đồng ý' },
      { value: 'hieu_chinh', label: 'Yêu cầu hiệu chỉnh' },
    ],
  },
  {
    name: 'ketQuaPheDuyet',
    label: 'Kết quả phê duyệt (TGĐ)',
    type: 'string',
    values: [
      { value: 'dong_y', label: 'Đồng ý' },
      { value: 'hieu_chinh', label: 'Yêu cầu hiệu chỉnh' },
      { value: 'tu_choi', label: 'Không phê duyệt' },
    ],
  },
  {
    name: 'loaiDieuChinh',
    label: 'Loại điều chỉnh (RD04)',
    type: 'string',
    values: [
      { value: 'chu_nhiem', label: 'Chủ nhiệm đề tài' },
      { value: 'khong_tang_du_toan', label: 'Không tăng tổng dự toán' },
      { value: 'tang_khong_vuot_chu_truong', label: 'Tăng, không vượt chủ trương' },
      { value: 'vuot_chu_truong', label: 'Vượt chủ trương' },
    ],
  },
  { name: 'dieuKienMacDinhDat', label: 'Đủ điều kiện mặc định (system check)', type: 'boolean' },
  { name: 'quorumDat', label: 'Đạt quorum hội đồng', type: 'boolean' },
]

/** Tập tên biến hợp lệ — dùng cho lint kiểm tra điều kiện FEEL. */
export const VARIABLE_NAMES: ReadonlySet<string> = new Set(PROCESS_VARIABLES.map((v) => v.name))

export interface ConditionPreset {
  value: string
  label: string
  /** Nhóm hiển thị (optgroup) — theo nhãn biến. */
  group: string
}

/** Preset điều kiện FEEL sinh TỰ ĐỘNG từ contract — khcnConditionModule dùng. */
export const CONDITION_PRESETS: ConditionPreset[] = PROCESS_VARIABLES.flatMap((v) => {
  if (v.type === 'boolean') {
    return [
      { value: `=${v.name} = true`, label: `${v.label}: Có`, group: v.label },
      { value: `=${v.name} = false`, label: `${v.label}: Không`, group: v.label },
    ]
  }
  return (v.values ?? []).map((val) => ({
    value: `=${v.name} = "${val.value}"`,
    label: `${v.label}: ${val.label}`,
    group: v.label,
  }))
})

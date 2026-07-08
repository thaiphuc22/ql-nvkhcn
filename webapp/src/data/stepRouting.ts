// Bảng ROUTING khai báo: (quy trình, bước, kết quả xử lý) → bước đích / điểm kết thúc.
//
// Đây là "Routing Matrix" ở dạng dữ liệu — mock của thứ mà Camunda suy ra từ các
// gateway + conditionExpression trong BPMN (xem rd0101Bpmn.ts: Gateway_5/6/9/11).
// MỘT nguồn sự thật: cả nút bấm (TaskFormModal) lẫn sơ đồ nhánh (Chi tiết hồ sơ /
// Action Studio) đều đọc qua `resolveRouting` để không trôi khỏi nhau.
//
// Hành động "Xử lý" của một bước phê duyệt có 3 KẾT QUẢ (outcome):
//   - APPROVE : kết luận Đồng ý/Thông qua/Đạt → đi tiếp (forward) hoặc hoàn tất (complete)
//   - RETURN  : trả lại để chỉnh sửa → quay về một bước trước (rework loop)
//   - REJECT  : không đồng ý → kết thúc, lưu hồ sơ (terminal)
// Bước Khởi tạo chỉ có 1 kết quả: SUBMIT → bước phê duyệt đầu tiên.

import type { ProcessDef } from './processes'

export type RouteKind = 'forward' | 'rework' | 'reject' | 'complete'

/** Kết quả (outcome) của hành động xử lý một bước — khớp nhánh gateway trong BPMN. */
export type RouteOutcome = 'SUBMIT' | 'APPROVE' | 'RETURN' | 'REJECT'

export interface RouteBranch {
  outcome: RouteOutcome
  /** Nhãn kết quả hiển thị trên nút/sơ đồ (vd "Đồng ý", "Yêu cầu hiệu chỉnh"). */
  label: string
  kind: RouteKind
  /** Bước đích (taskStep.key trong processes.ts). Rỗng nếu kết thúc (reject/complete). */
  toStepKey?: string
  /** Nhãn điểm kết thúc khi không có bước đích. */
  terminalLabel?: string
}

export interface StepRouting {
  /** taskStep.key của bước nguồn. */
  stepKey: string
  branches: RouteBranch[]
}

const TERMINAL_LUU = 'Lưu hồ sơ — kết thúc'

// RD01.01 — Xét duyệt Chủ trương cấp Cơ sở. Nhánh rework bám sát BPMN:
// Gateway_5 "Không đồng ý" → Task_4 (PM hoàn chỉnh); Gateway_6/11 "Hiệu chỉnh"
// → Task_7 (hoàn chỉnh). Trong chuỗi tuyến tính mock, hoàn chỉnh gần nhất là bước
// Lập BC thẩm định (t4) hoặc trả về Khởi tạo (t1) cho PM sửa gốc.
// ⚠ Đích rework là GIẢ ĐỊNH DEMO (OQ-002 chưa chốt) — đổi tại đây, không đụng code UI.
const RD0101_ROUTING: StepRouting[] = [
  {
    stepKey: 't1', // Khởi tạo hồ sơ (PM)
    branches: [{ outcome: 'SUBMIT', label: 'Gửi duyệt', kind: 'forward', toStepKey: 't2' }],
  },
  {
    stepKey: 't2', // Ký duyệt cấp Trung tâm/Khối (BGĐ)
    branches: [
      { outcome: 'APPROVE', label: 'Đồng ý — ký duyệt', kind: 'forward', toStepKey: 't3' },
      { outcome: 'RETURN', label: 'Trả lại chỉnh sửa', kind: 'rework', toStepKey: 't1' },
      { outcome: 'REJECT', label: 'Không đồng ý', kind: 'reject', terminalLabel: TERMINAL_LUU },
    ],
  },
  {
    stepKey: 't3', // Thẩm định Cơ quan nghiệp vụ (CQNV)
    branches: [
      { outcome: 'APPROVE', label: 'Đồng ý thông qua', kind: 'forward', toStepKey: 't4' },
      { outcome: 'RETURN', label: 'Đề nghị chỉnh sửa', kind: 'rework', toStepKey: 't1' },
      { outcome: 'REJECT', label: 'Không thông qua', kind: 'reject', terminalLabel: TERMINAL_LUU },
    ],
  },
  {
    stepKey: 't4', // Lập Báo cáo thẩm định (CQ QLKHCN)
    branches: [
      { outcome: 'APPROVE', label: 'Đồng ý', kind: 'forward', toStepKey: 't5' },
      { outcome: 'RETURN', label: 'Trả lại chỉnh sửa', kind: 'rework', toStepKey: 't1' },
      { outcome: 'REJECT', label: 'Không đồng ý', kind: 'reject', terminalLabel: TERMINAL_LUU },
    ],
  },
  {
    stepKey: 't5', // Hội đồng KHCN phê duyệt (HĐKHCN)
    branches: [
      { outcome: 'APPROVE', label: 'Đồng ý — thông qua', kind: 'forward', toStepKey: 't6' },
      { outcome: 'RETURN', label: 'Yêu cầu hiệu chỉnh', kind: 'rework', toStepKey: 't4' },
      { outcome: 'REJECT', label: 'Không đồng ý', kind: 'reject', terminalLabel: TERMINAL_LUU },
    ],
  },
  {
    stepKey: 't6', // TGĐ phê duyệt Quyết định chủ trương
    branches: [
      { outcome: 'APPROVE', label: 'Phê duyệt — ban hành QĐ', kind: 'complete', terminalLabel: 'Hoàn tất — QĐ Chủ trương' },
      { outcome: 'RETURN', label: 'Yêu cầu hiệu chỉnh', kind: 'rework', toStepKey: 't4' },
      { outcome: 'REJECT', label: 'Không phê duyệt', kind: 'reject', terminalLabel: 'Không phê duyệt — Lưu hồ sơ' },
    ],
  },
]

/** Bảng routing theo mã quy trình. Thêm RD khác tại đây khi mở rộng. */
// RD02.01 — Xét duyệt NV KHCN cấp Cơ sở. Mock tuyến tính để demo đối soát BPMN
// cho nhóm quy trình khác RD01: chuyên quản → HĐXD → HĐ KHCN → TGĐ.
const RD0201_ROUTING: StepRouting[] = [
  {
    stepKey: 't1',
    branches: [{ outcome: 'SUBMIT', label: 'Gửi hồ sơ xét duyệt', kind: 'forward', toStepKey: 't2' }],
  },
  {
    stepKey: 't2',
    branches: [
      { outcome: 'APPROVE', label: 'Đạt — chuyển HĐXD', kind: 'forward', toStepKey: 't3' },
      { outcome: 'RETURN', label: 'Chưa đạt — yêu cầu bổ sung', kind: 'rework', toStepKey: 't1' },
      { outcome: 'REJECT', label: 'Không đủ điều kiện mở mới', kind: 'reject', terminalLabel: TERMINAL_LUU },
    ],
  },
  {
    stepKey: 't3',
    branches: [
      { outcome: 'APPROVE', label: 'HĐXD thống nhất đề xuất', kind: 'forward', toStepKey: 't4' },
      { outcome: 'RETURN', label: 'Yêu cầu làm rõ hồ sơ', kind: 'rework', toStepKey: 't2' },
      { outcome: 'REJECT', label: 'HĐXD không thông qua', kind: 'reject', terminalLabel: TERMINAL_LUU },
    ],
  },
  {
    stepKey: 't4',
    branches: [
      { outcome: 'APPROVE', label: 'HĐ KHCN phê duyệt', kind: 'forward', toStepKey: 't5' },
      { outcome: 'RETURN', label: 'Trả lại HĐXD rà soát', kind: 'rework', toStepKey: 't3' },
      { outcome: 'REJECT', label: 'HĐ KHCN không phê duyệt', kind: 'reject', terminalLabel: TERMINAL_LUU },
    ],
  },
  {
    stepKey: 't5',
    branches: [
      { outcome: 'APPROVE', label: 'TGĐ phê duyệt mở mới', kind: 'complete', terminalLabel: 'Hoàn tất — mở mới nhiệm vụ' },
      { outcome: 'RETURN', label: 'Yêu cầu hiệu chỉnh quyết định', kind: 'rework', toStepKey: 't4' },
      { outcome: 'REJECT', label: 'TGĐ không phê duyệt', kind: 'reject', terminalLabel: TERMINAL_LUU },
    ],
  },
]

// RD05.01 — Nghiệm thu NV KHCN cấp Cơ sở. Dùng để demo quy trình có bước lập
// quyết định chưa gắn form ở seed, giúp tab Đối soát BPMN có cảnh báo biểu mẫu rõ ràng.
const RD0501_ROUTING: StepRouting[] = [
  {
    stepKey: 't1',
    branches: [{ outcome: 'SUBMIT', label: 'Gửi hồ sơ nghiệm thu', kind: 'forward', toStepKey: 't2' }],
  },
  {
    stepKey: 't2',
    branches: [
      { outcome: 'APPROVE', label: 'Đạt điều kiện nghiệm thu', kind: 'forward', toStepKey: 't3' },
      { outcome: 'RETURN', label: 'Yêu cầu bổ sung minh chứng', kind: 'rework', toStepKey: 't1' },
      { outcome: 'REJECT', label: 'Không đủ điều kiện nghiệm thu', kind: 'reject', terminalLabel: TERMINAL_LUU },
    ],
  },
  {
    stepKey: 't3',
    branches: [
      { outcome: 'APPROVE', label: 'Trình HĐ nghiệm thu', kind: 'forward', toStepKey: 't4' },
      { outcome: 'RETURN', label: 'Trả lại chuyên quản rà soát', kind: 'rework', toStepKey: 't2' },
      { outcome: 'REJECT', label: 'Không thành lập HĐ nghiệm thu', kind: 'reject', terminalLabel: TERMINAL_LUU },
    ],
  },
  {
    stepKey: 't4',
    branches: [
      { outcome: 'APPROVE', label: 'HĐ nghiệm thu đạt', kind: 'forward', toStepKey: 't5' },
      { outcome: 'RETURN', label: 'Yêu cầu hoàn thiện kết quả', kind: 'rework', toStepKey: 't1' },
      { outcome: 'REJECT', label: 'HĐ nghiệm thu không đạt', kind: 'reject', terminalLabel: TERMINAL_LUU },
    ],
  },
  {
    stepKey: 't5',
    branches: [
      { outcome: 'APPROVE', label: 'TGĐ công nhận kết quả', kind: 'complete', terminalLabel: 'Hoàn tất — công nhận nghiệm thu' },
      { outcome: 'RETURN', label: 'Yêu cầu hiệu chỉnh biên bản', kind: 'rework', toStepKey: 't4' },
      { outcome: 'REJECT', label: 'Không công nhận kết quả', kind: 'reject', terminalLabel: TERMINAL_LUU },
    ],
  },
]

export const ROUTING_TABLES: Record<string, StepRouting[]> = {
  'RD01.01': RD0101_ROUTING,
  'RD02.01': RD0201_ROUTING,
  'RD05.01': RD0501_ROUTING,
}

/** Một nhánh đã resolve sang tên + index bước đích để UI hiển thị trực tiếp. */
export interface ResolvedBranch extends RouteBranch {
  /** Tên bước đích (nếu có toStepKey). */
  toStepTen?: string
  /** Index của bước đích trong dossier.steps (nếu khớp được theo tên). */
  toStepIndex?: number
}

export interface ResolvedRouting {
  /** taskStep.key của bước hiện tại (nếu resolve được). */
  stepKey?: string
  branches: ResolvedBranch[]
}

/**
 * Resolver DUY NHẤT cho cả nút bấm lẫn sơ đồ. Nhận quy trình + chuỗi bước của hồ sơ
 * + tên bước hiện tại; trả về các nhánh đã gắn tên/index bước đích.
 *
 * Cách khớp: dossier.steps ↔ proc.taskSteps theo `ten` (giống TaskFormModal khớp
 * formKey). taskStep.key → routing → toStepKey → tên bước → index trong dossier.steps.
 */
export function resolveRouting(
  proc: ProcessDef | undefined,
  dossierSteps: { ten: string }[],
  currentStepTen: string | undefined,
): ResolvedRouting {
  if (!proc || !currentStepTen) return { branches: [] }
  const table = ROUTING_TABLES[proc.ma]
  const stepKey = proc.taskSteps?.find((ts) => ts.ten === currentStepTen)?.key
  if (!table || !stepKey) return { stepKey, branches: [] }
  const routing = table.find((r) => r.stepKey === stepKey)
  if (!routing) return { stepKey, branches: [] }

  const tenOfKey = (key?: string): string | undefined =>
    key ? proc.taskSteps?.find((ts) => ts.key === key)?.ten : undefined

  const branches: ResolvedBranch[] = routing.branches.map((b) => {
    const toStepTen = tenOfKey(b.toStepKey)
    const idx = toStepTen ? dossierSteps.findIndex((s) => s.ten === toStepTen) : -1
    return { ...b, toStepTen, toStepIndex: idx >= 0 ? idx : undefined }
  })
  return { stepKey, branches }
}

/** Lấy nhánh theo outcome — tiện cho nút bấm (vd default đích của RETURN). */
export function branchByOutcome(
  routing: ResolvedRouting,
  outcome: RouteOutcome,
): ResolvedBranch | undefined {
  return routing.branches.find((b) => b.outcome === outcome)
}

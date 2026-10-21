/**
 * 10 nhóm nghiệp vụ RD01–RD10 xếp theo vòng đời dự án KHCN
 * (Đề xuất → Tuyển chọn → Thực hiện → Nghiệm thu → Chuyển giao).
 * Nguồn: docs/req/1. Quy trinh Phan mem KHCN chi tiet (clean).md §3.1
 */

export type LifecycleStageId =
  | 'de-xuat'
  | 'tuyen-chon'
  | 'thuc-hien'
  | 'nghiem-thu'
  | 'chuyen-giao'

export interface LifecycleStage {
  id: LifecycleStageId
  label: string
  shortLabel: string
  color: string
  description: string
}

export interface RdGroupMeta {
  code: string
  name: string
  stageId: LifecycleStageId
  /** Pha phát triển theo tài liệu yêu cầu */
  phase: 1 | 2
}

export const LIFECYCLE_STAGES: LifecycleStage[] = [
  {
    id: 'de-xuat',
    label: 'Đề xuất',
    shortLabel: '1. Đề xuất',
    color: '#1677ff',
    description: 'Chủ trương / khởi tạo ý tưởng nhiệm vụ',
  },
  {
    id: 'tuyen-chon',
    label: 'Tuyển chọn',
    shortLabel: '2. Tuyển chọn',
    color: '#722ed1',
    description: 'Xét duyệt nhiệm vụ KHCN',
  },
  {
    id: 'thuc-hien',
    label: 'Thực hiện',
    shortLabel: '3. Thực hiện',
    color: '#13c2c2',
    description: 'Triển khai, tích hợp & điều chỉnh',
  },
  {
    id: 'nghiem-thu',
    label: 'Nghiệm thu',
    shortLabel: '4. Nghiệm thu',
    color: '#fa8c16',
    description: 'Nghiệm thu & quyết toán',
  },
  {
    id: 'chuyen-giao',
    label: 'Chuyển giao',
    shortLabel: '5. Chuyển giao',
    color: '#52c41a',
    description: 'Sản phẩm, SHTT, báo cáo & lưu trữ',
  },
]

/** Đủ 10 nhóm phân hệ nghiệp vụ RD */
export const RD_GROUPS: RdGroupMeta[] = [
  { code: 'RD01', name: 'Xét duyệt Chủ trương', stageId: 'de-xuat', phase: 1 },
  { code: 'RD02', name: 'Xét duyệt NV KHCN', stageId: 'tuyen-chon', phase: 1 },
  { code: 'RD03', name: 'Thực hiện NV KHCN', stageId: 'thuc-hien', phase: 2 },
  { code: 'RD04', name: 'Điều chỉnh NV KHCN', stageId: 'thuc-hien', phase: 2 },
  { code: 'RD05', name: 'Nghiệm thu NV KHCN', stageId: 'nghiem-thu', phase: 1 },
  { code: 'RD06', name: 'Quyết toán NV KHCN', stageId: 'nghiem-thu', phase: 1 },
  { code: 'RD07', name: 'Quản lý danh mục SPDV', stageId: 'chuyen-giao', phase: 2 },
  { code: 'RD08', name: 'Sở hữu trí tuệ', stageId: 'chuyen-giao', phase: 1 },
  { code: 'RD09', name: 'Quản lý, tổng hợp thông tin', stageId: 'chuyen-giao', phase: 2 },
  { code: 'RD10', name: 'Lưu trữ hồ sơ, văn bản pháp lý', stageId: 'chuyen-giao', phase: 1 },
]

export const RD_GROUP_BY_CODE: Record<string, RdGroupMeta> = Object.fromEntries(
  RD_GROUPS.map((g) => [g.code, g]),
)

export function groupsForStage(stageId: LifecycleStageId): RdGroupMeta[] {
  return RD_GROUPS.filter((g) => g.stageId === stageId)
}

export function stageOfRd(code: string): LifecycleStage | undefined {
  const g = RD_GROUP_BY_CODE[code]
  if (!g) return undefined
  return LIFECYCLE_STAGES.find((s) => s.id === g.stageId)
}

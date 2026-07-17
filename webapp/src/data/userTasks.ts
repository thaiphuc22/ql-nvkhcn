/**
 * Camunda 8 User Task instances — mỗi dòng "Việc của tôi" = 1 user task.
 * Metadata (taskKey, processDefinitionKey, elementId, dueDate) + variables
 * tương quan (maHoSo…) theo D3. Frontend mock; thay bằng Tasklist/Zeebe API khi F1.
 */

import type { Dossier, DossierStep } from './dossiers'
import type { Cap } from './nhiemVu'

/** Phân loại task nghiệp vụ (không phải BPMN element type). */
export type UserTaskKind =
  | 'khoi_tao'
  | 'tham_dinh'
  | 'phe_duyet'
  | 'ky_duyet'
  | 'ho_tro'
  | 'khac'

export const USER_TASK_KIND_META: Record<
  UserTaskKind,
  { label: string; color: string }
> = {
  khoi_tao: { label: 'Khởi tạo', color: 'default' },
  tham_dinh: { label: 'Thẩm định', color: 'processing' },
  phe_duyet: { label: 'Phê duyệt', color: 'volcano' },
  ky_duyet: { label: 'Ký duyệt', color: 'geekblue' },
  ho_tro: { label: 'Hỗ trợ', color: 'cyan' },
  khac: { label: 'Khác', color: 'default' },
}

/** Biến process / task variables dùng hiển thị worklist (correlation + nhãn). */
export interface UserTaskVariables {
  maHoSo: string
  maNV: string
  tenDeTai: string
  maDeTai: string
  chuNhiem: string
  cap: Cap
}

/**
 * Một user task instance Camunda (Zeebe user task key).
 * Cột UI lấy từ metadata + variables — không đọc “bước dossier” trực tiếp.
 */
export interface CamundaUserTask {
  /** Zeebe user-task key (khoá dòng worklist). */
  taskKey: string
  /** BPMN element id / task definition key. */
  taskDefinitionKey: string
  processDefinitionKey: string
  processInstanceKey: string
  processTen: string
  /** dueDate metadata. */
  dueDate?: string
  candidateGroups: string[]
  /** Tên activity (element name). */
  elementName: string
  taskKind: UserTaskKind
  variables: UserTaskVariables
  /** Chỉ để điều hướng mock → Chi tiết hồ sơ + check quyền. */
  dossierId: string
  step: DossierStep | undefined
}

function classifyTaskKind(stepTen: string): UserTaskKind {
  const t = stepTen.toLowerCase()
  if (t.includes('khởi tạo') || t.includes('dự thảo') || t.includes('soạn')) return 'khoi_tao'
  if (t.includes('thẩm định') || t.includes('đánh giá') || t.includes('pnx')) return 'tham_dinh'
  if (t.includes('ký')) return 'ky_duyet'
  if (t.includes('phê duyệt') || t.includes('hội đồng') || t.includes('tgđ')) return 'phe_duyet'
  if (t.includes('hỗ trợ') || t.includes('bổ sung') || t.includes('hiệu chỉnh')) return 'ho_tro'
  return 'khac'
}

/** Sinh task key ổn định từ hồ sơ + bước (mock; engine thật cấp key riêng). */
function mockTaskKey(dossierId: string, stepKey: string): string {
  const n = [...`${dossierId}:${stepKey}`].reduce((a, c) => a + c.charCodeAt(0), 0)
  return String(2251799813700000 + (n % 900000))
}

function mockInstanceKey(dossierId: string): string {
  const n = [...dossierId].reduce((a, c) => a + c.charCodeAt(0), 0)
  return String(2251799813600000 + (n % 800000))
}

/**
 * Build worklist từ hồ sơ đang xử lý — mỗi hồ sơ → 1 user task ở bước hiện tại
 * (mock 1:1; Camunda thật có thể có nhiều parallel tasks).
 */
export function buildUserTasksFromDossiers(list: Dossier[]): CamundaUserTask[] {
  return list
    .filter((d) => d.trangThai === 'processing' && d.quyTrinh)
    .map((d) => {
      const step = d.steps[d.buocHienTai]
      const taskDefinitionKey = step?.taskDefinitionKey ?? `t${d.buocHienTai + 1}`
      const elementName = step?.ten ?? '—'
      return {
        taskKey: mockTaskKey(d.id, taskDefinitionKey),
        taskDefinitionKey,
        processDefinitionKey: d.quyTrinh,
        processInstanceKey: mockInstanceKey(d.id),
        processTen: d.quyTrinhTen,
        dueDate: step?.hanXuLy,
        candidateGroups: step?.vaiTroCodes ?? [],
        elementName,
        taskKind: classifyTaskKind(elementName),
        variables: {
          maHoSo: d.id,
          maNV: d.maNV,
          tenDeTai: d.tenDeTai,
          maDeTai: d.maDeTai,
          chuNhiem: d.chuNhiem,
          cap: d.cap,
        },
        dossierId: d.id,
        step,
      } satisfies CamundaUserTask
    })
}

// Bản đồ ROLL-UP: bước nghiệp vụ (taskStep.key) → các node BPMN mà nó GỘP lại.
//
// Chuỗi 6 bước ở Chi tiết hồ sơ là bản TÓM TẮT nghiệp vụ của BPMN ~12 tác vụ
// (rd0101Bpmn.ts). Map này ghi rõ mỗi bước tóm tắt gồm những node BPMN nào, để
// khi "Xem BPMN" có thể tô sáng ĐÚNG node của bước hiện tại — không giả vờ 1-1.
//
// Suy ra từ SWIMLANE của BPMN (laneSet): mỗi bước nghiệp vụ khớp 1 làn vai trò.
//   RD01.01: Lane_PM→t1 · Lane_BGD→t2 · Lane_CQNV→t3 · Lane_CQQL→t4 ·
//            Lane_HDKHCN→t5 · Lane_TGD→t6.
// Chỉ khai cho quy trình đã có BPMN chi tiết + bảng routing (demo RD01.01). Quy
// trình chưa khai → trả rỗng, UI tự hạ mức xuống "chưa tô sáng được" (trung thực).

export const BPMN_STEP_MAP: Record<string, Record<string, string[]>> = {
  'RD01.01': {
    t1: ['Task_1', 'Task_2'], // PM: khởi tạo luồng + dự thảo HS
    t2: ['Task_5', 'Task_8'], // BGĐ TT/Khối: ký HS đề xuất + ký duyệt HS
    t3: ['Task_3', 'Task_9'], // CQNV: PNX + ký duyệt HS
    t4: ['Task_10a', 'Task_10b'], // CQ QLKHCN: lập BC thẩm định + trình ký QĐ
    t5: ['Task_6', 'Task_11_HD'], // HĐ KHCN: thẩm định + ký thông qua BC
    t6: ['Task_11_TGD'], // TGĐ: phê duyệt QĐ chủ trương
  },
}

/** Các node BPMN của một bước nghiệp vụ (rỗng nếu quy trình chưa khai map). */
export function bpmnIdsForStep(
  procMa: string | undefined,
  stepKey: string | undefined,
): string[] {
  if (!procMa || !stepKey) return []
  return BPMN_STEP_MAP[procMa]?.[stepKey] ?? []
}

/** Quy trình đã có bản đồ bước↔BPMN chưa? (để UI quyết định có tô sáng hay không). */
export function hasBpmnStepMap(procMa: string | undefined): boolean {
  return !!procMa && !!BPMN_STEP_MAP[procMa]
}

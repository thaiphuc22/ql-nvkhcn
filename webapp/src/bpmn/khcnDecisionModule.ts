/*
 * P0.5 #4 — Khối "Đồng ý / Từ chối" + rework.
 *
 * Mọi luồng RD01–RD06 đều có cổng phê duyệt: "Phê duyệt/Từ chối", "Đạt/Chưa đạt"
 * ở mỗi cấp, kèm vòng lặp rework. Mẫu chèn nhanh nằm ở drawer "Mẫu nghiệp vụ KHCN"
 * (data/elementTemplates.ts id `decision-gateway`). Module này giữ BEHAVIOR:
 *  tự gán nhãn 2 sequence flow đi ra của cổng đó — flow thứ 1 = "Đồng ý",
 *  flow thứ 2 = "Từ chối" (đặt làm DEFAULT). Không đè nhãn có sẵn.
 *
 * AN TOÀN LUỒNG: nhánh default là "Từ chối" — nếu biến kết quả thiếu hoặc không
 * khớp điều kiện nào, token đi hướng từ chối/rework chứ KHÔNG vô tình phê duyệt.
 * Nhánh "Đồng ý" bắt buộc có điều kiện FEEL (chọn preset từ variableContract ở
 * nhóm "Điều kiện (KHCN)"); lint sẽ báo LỖI nếu nhánh không-default thiếu điều kiện.
 *
 * ⚠️ ASSUMPTION A1 (OQ-002 — đích rework khi từ chối, CHƯA chốt với khách):
 *   - "Từ chối" là nhánh rework; ĐÍCH rework do người vẽ tự nối (mặc định khuyến
 *     nghị: về bước "Xây dựng hồ sơ" của PM).
 * Khi khách chốt OQ-002 → chỉ cần chỉnh nhãn/đích ở đây.
 *
 * Cùng khuôn plain didi module (provider + behavior). Gói bpmn.io không .d.ts → any.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { is, getBusinessObject } from 'bpmn-js/lib/util/ModelUtil'

const DECISION_NAME = 'Kết quả duyệt?'
const APPROVE_LABEL = 'Đồng ý'
const REJECT_LABEL = 'Từ chối'

/** Cổng phê duyệt do ta tạo (nhận diện theo tên mặc định hoặc chứa "Đồng ý/Từ chối"). */
function isApprovalGateway(el: any): boolean {
  if (!el || !is(el, 'bpmn:ExclusiveGateway')) return false
  const name = getBusinessObject(el).get('name') || ''
  return name === DECISION_NAME || /đồng ý.*từ chối/i.test(name)
}

// ── Behavior: tự gán nhãn 2 flow đi ra ──────────────────────────────────────
class KhcnDecisionAutoLabel {
  static $inject = ['eventBus', 'modeling']

  constructor(eventBus: any, modeling: any) {
    eventBus.on('commandStack.connection.create.postExecuted', 500, (e: any) => {
      try {
        const conn = e?.context?.connection
        if (!conn || !is(conn, 'bpmn:SequenceFlow')) return
        const src = conn.source
        if (!isApprovalGateway(src)) return

        // Không đè nhãn người dùng đã đặt.
        if (getBusinessObject(conn).get('name')) return

        const outgoing = (getBusinessObject(src).get('outgoing') || []).filter((f: any) =>
          is(f, 'bpmn:SequenceFlow'),
        )
        const idx = outgoing.indexOf(getBusinessObject(conn))

        if (idx === 0) {
          // "Đồng ý" KHÔNG làm default — người vẽ phải đặt điều kiện FEEL tường minh
          // (lint chặn nếu thiếu). Tránh việc thiếu biến kết quả mà vẫn đi hướng duyệt.
          modeling.updateProperties(conn, { name: APPROVE_LABEL })
        } else if (idx === 1) {
          modeling.updateProperties(conn, { name: REJECT_LABEL })
          // "Từ chối" là nhánh mặc định (fail-safe khi biến thiếu/không khớp).
          modeling.updateProperties(src, { default: getBusinessObject(conn) })
        }
      } catch {
        /* best-effort — không để lỗi behavior phá modeler */
      }
    })
  }
}

/** Module didi — nạp vào additionalModules của BpmnModeler. */
export function khcnDecisionModule() {
  return {
    __init__: ['khcnDecisionAutoLabel'],
    khcnDecisionAutoLabel: ['type', KhcnDecisionAutoLabel],
  }
}

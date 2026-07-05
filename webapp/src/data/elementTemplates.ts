// P1 — Element Templates domain KHCN.
// Các "task dựng sẵn" hay lặp trong RD01–RD06 (phê duyệt/thẩm định/soạn thảo) và
// RD03 (đồng bộ hệ ngoài). BA kéo từ palette ra là có sẵn: đúng loại BPMN +
// vai trò phụ trách (candidateGroups) + (service task) job type Zeebe.
//
// Nguồn: docs/req/bpmn-components-danh-gia.md (mục #4 P1) + bảng "Tác nhân tham gia"
// RD01–RD06 và bảng tích hợp RD03. Vai trò tham chiếu data/roles.ts.

export interface KhcnTemplate {
  id: string
  ten: string
  /** Mô tả ngắn hiển thị trong drawer "Mẫu nghiệp vụ KHCN" (BA đọc hiểu ngay). */
  moTa: string
  nhom: 'Phê duyệt' | 'Thẩm định' | 'Soạn thảo' | 'Tích hợp' | 'Hội đồng' | 'Hẹn giờ'
  bpmnType:
    | 'bpmn:UserTask'
    | 'bpmn:ServiceTask'
    | 'bpmn:CallActivity'
    | 'bpmn:StartEvent'
    | 'bpmn:IntermediateCatchEvent'
    | 'bpmn:ExclusiveGateway'
  /** Giá trị dựng sẵn khi chèn phần tử. */
  defaults: {
    name: string
    /** code vai trò → zeebe:AssignmentDefinition.candidateGroups (UserTask). */
    candidateGroups?: string
    /** zeebe:TaskDefinition.type (ServiceTask). */
    taskType?: string
    /**
     * Multi-instance song song — mỗi thành viên Hội đồng một phiên (UserTask).
     * Ghi bpmn:MultiInstanceLoopCharacteristics + zeebe:LoopCharacteristics.
     */
    multiInstance?: { inputCollection: string; inputElement: string }
    /** processId của quy trình con tái dùng → zeebe:CalledElement (CallActivity). */
    calledElement?: string
    /**
     * Sự kiện hẹn giờ → bpmn:TimerEventDefinition.
     * timeCycle (ISO 8601 lặp, vd R/P1M) cho Start định kỳ; timeDuration (vd PT48H)
     * cho Intermediate chờ tới hạn.
     */
    timer?: { timeCycle?: string; timeDuration?: string }
  }
}

export const KHCN_TEMPLATES: KhcnTemplate[] = [
  // ── Phê duyệt / ký duyệt ──────────────────────────────────────────────────
  {
    id: 'sign-bgd',
    moTa: 'Bước ký của BGĐ Trung tâm/Khối trên hồ sơ trình.',
    ten: 'Ký duyệt cấp TT/Khối',
    nhom: 'Phê duyệt',
    bpmnType: 'bpmn:UserTask',
    defaults: { name: 'Ký duyệt cấp Trung tâm/Khối', candidateGroups: 'BGD_TT' },
  },
  {
    id: 'approve-tgd',
    moTa: 'Bước phê duyệt cuối của Tổng Giám đốc VHT.',
    ten: 'Phê duyệt (TGĐ)',
    nhom: 'Phê duyệt',
    bpmnType: 'bpmn:UserTask',
    defaults: { name: 'Phê duyệt Quyết định', candidateGroups: 'TGD_VHT' },
  },
  {
    id: 'decision-gateway',
    moTa: 'Cổng XOR tự gán nhãn 2 nhánh; "Từ chối" là nhánh mặc định an toàn.',
    ten: 'Cổng Đồng ý/Từ chối',
    nhom: 'Phê duyệt',
    bpmnType: 'bpmn:ExclusiveGateway',
    defaults: { name: 'Kết quả duyệt?' },
  },

  // ── Thẩm định ─────────────────────────────────────────────────────────────
  {
    id: 'review-council',
    moTa: 'Thành viên hội đồng ghi Phiếu nhận xét/đánh giá.',
    ten: 'Thẩm định (Phiếu nhận xét)',
    nhom: 'Thẩm định',
    bpmnType: 'bpmn:UserTask',
    defaults: { name: 'Thẩm định qua Phiếu nhận xét/đánh giá', candidateGroups: 'HDXD' },
  },
  {
    id: 'review-check',
    moTa: 'Chuyên quản KHCN thẩm định, kết luận Đạt/Chưa đạt.',
    ten: 'Thẩm định (Đạt/Chưa đạt)',
    nhom: 'Thẩm định',
    bpmnType: 'bpmn:UserTask',
    defaults: { name: 'Thẩm định Đạt/Chưa đạt', candidateGroups: 'CQ_KHCN' },
  },

  // ── Soạn thảo văn bản ─────────────────────────────────────────────────────
  {
    id: 'draft-report',
    moTa: 'CQ QLKHCN tổng hợp, lập Báo cáo thẩm định.',
    ten: 'Lập Báo cáo thẩm định',
    nhom: 'Soạn thảo',
    bpmnType: 'bpmn:UserTask',
    defaults: { name: 'Lập Báo cáo thẩm định', candidateGroups: 'CQ_QLKHCN' },
  },
  {
    id: 'draft-decision',
    moTa: 'CQ QLKHCN soạn và trình ký Quyết định.',
    ten: 'Lập Quyết định',
    nhom: 'Soạn thảo',
    bpmnType: 'bpmn:UserTask',
    defaults: { name: 'Lập, trình Quyết định', candidateGroups: 'CQ_QLKHCN' },
  },

  // ── Hội đồng (RD02/RD04/RD05) — khối tái dùng ─────────────────────────────
  {
    id: 'council-review-mi',
    moTa: 'Mỗi thành viên HĐ một phiên ký song song (multi-instance).',
    ten: 'Thẩm định Hội đồng (đa thành viên)',
    nhom: 'Hội đồng',
    bpmnType: 'bpmn:UserTask',
    defaults: {
      name: 'Thành viên HĐ ký PNX/PĐG',
      candidateGroups: 'HDXD',
      // Mỗi thành viên trong danh sách Hội đồng → một phiên thẩm định song song.
      multiInstance: { inputCollection: '=thanhVienHoiDong', inputElement: 'thanhVien' },
    },
  },
  {
    id: 'council-call',
    moTa: 'Gọi quy trình con Hội đồng tái dùng (TLHĐ → họp phiên).',
    ten: 'Hội đồng (quy trình con)',
    nhom: 'Hội đồng',
    bpmnType: 'bpmn:CallActivity',
    defaults: {
      name: 'Hội đồng thẩm định',
      // Quy trình con tái dùng: TLHĐ → họp phiên 1 → phiên 2 (deploy riêng).
      calledElement: 'khcn-hoi-dong',
    },
  },

  // ── Hẹn giờ (RD03.06 báo cáo định kỳ · SLA/hạn xử lý) ─────────────────────
  {
    id: 'timer-cycle',
    moTa: 'Tự khởi động quy trình theo chu kỳ (mặc định hàng tháng).',
    ten: 'Định kỳ báo cáo (hàng tháng)',
    nhom: 'Hẹn giờ',
    bpmnType: 'bpmn:StartEvent',
    defaults: { name: 'Định kỳ báo cáo', timer: { timeCycle: 'R/P1M' } },
  },
  {
    id: 'timer-wait',
    moTa: 'Tạm dừng chờ tới hạn SLA (mặc định 48 giờ).',
    ten: 'Chờ tới hạn xử lý',
    nhom: 'Hẹn giờ',
    bpmnType: 'bpmn:IntermediateCatchEvent',
    defaults: { name: 'Chờ tới hạn (SLA)', timer: { timeDuration: 'PT48H' } },
  },

  // ── Tích hợp hệ ngoài (RD03) — Service Task ───────────────────────────────
  {
    id: 'sync-qlns',
    moTa: 'Service Task gọi worker đồng bộ nhân sự QLNS.',
    ten: 'Đồng bộ QLNS',
    nhom: 'Tích hợp',
    bpmnType: 'bpmn:ServiceTask',
    defaults: { name: 'Đồng bộ dữ liệu QLNS', taskType: 'khcn.sync.qlns' },
  },
  {
    id: 'sync-ms',
    moTa: 'Service Task gọi worker đồng bộ Mua sắm.',
    ten: 'Đồng bộ Mua sắm',
    nhom: 'Tích hợp',
    bpmnType: 'bpmn:ServiceTask',
    defaults: { name: 'Đồng bộ dữ liệu Mua sắm', taskType: 'khcn.sync.ms' },
  },
  {
    id: 'sync-sap',
    moTa: 'Service Task gọi worker đồng bộ kinh phí SAP.',
    ten: 'Đồng bộ SAP',
    nhom: 'Tích hợp',
    bpmnType: 'bpmn:ServiceTask',
    defaults: { name: 'Đồng bộ kinh phí SAP', taskType: 'khcn.sync.sap' },
  },
  {
    id: 'sync-qlts',
    moTa: 'Service Task gọi worker đồng bộ tài sản QLTS.',
    ten: 'Đồng bộ QLTS',
    nhom: 'Tích hợp',
    bpmnType: 'bpmn:ServiceTask',
    defaults: { name: 'Đồng bộ tài sản QLTS', taskType: 'khcn.sync.qlts' },
  },
  {
    id: 'sync-plm',
    moTa: 'Service Task gọi worker đồng bộ tiến độ PLM.',
    ten: 'Đồng bộ PLM',
    nhom: 'Tích hợp',
    bpmnType: 'bpmn:ServiceTask',
    defaults: { name: 'Đồng bộ tiến độ PLM', taskType: 'khcn.sync.plm' },
  },
]

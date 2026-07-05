// Danh mục vai trò (candidateGroups) dùng chung cho BPMN — rút từ các bảng
// "Tác nhân tham gia" của RD01–RD10 (docs/req/1. Quy trinh Phan mem KHCN chi tiet
// (clean).md) và docs/req/bpmn-components-danh-gia.md (mục 4).
//
// `code` = candidateGroup ghi vào zeebe:AssignmentDefinition (định danh, không dấu
// cách). `ten` = nhãn tiếng Việt hiển thị. `nhom` = phân cấp để gom nhóm dropdown.
//
// ⚠️ Mã vai trò còn chờ khách chuẩn hoá + cơ chế "đóng thế" của cấp Tập đoàn
// (tài liệu L102, L166) — xem OQ trong bpmn-components-danh-gia.md.

export interface Role {
  code: string
  ten: string
  nhom: string
}

export const ROLES: Role[] = [
  // Khởi tạo / xây dựng hồ sơ
  { code: 'PM', ten: 'Chủ nhiệm đề tài (PM)', nhom: 'Khởi tạo / Xây dựng' },
  { code: 'PA', ten: 'Trợ lý đề tài (PA)', nhom: 'Khởi tạo / Xây dựng' },
  { code: 'NNC', ten: 'Người nghiên cứu (NNC)', nhom: 'Khởi tạo / Xây dựng' },

  // Chuyên quản
  { code: 'CQ_KHCN', ten: 'Chuyên quản KHCN', nhom: 'Chuyên quản' },
  { code: 'CQ_MS', ten: 'Chuyên quản Mua sắm', nhom: 'Chuyên quản' },
  { code: 'CQ_NS', ten: 'Chuyên quản Nhân sự', nhom: 'Chuyên quản' },
  { code: 'CQ_TCKT', ten: 'Chuyên quản TCKT', nhom: 'Chuyên quản' },

  // Cơ quan nghiệp vụ VHT
  { code: 'TP_CLKHCN', ten: 'Trưởng phòng CLKHCN', nhom: 'Cơ quan nghiệp vụ VHT' },
  { code: 'TP_TCKT', ten: 'Trưởng phòng TCKT', nhom: 'Cơ quan nghiệp vụ VHT' },
  { code: 'TP_NS', ten: 'Trưởng phòng Nhân sự', nhom: 'Cơ quan nghiệp vụ VHT' },
  { code: 'GD_TTMS', ten: 'Giám đốc TT Mua sắm', nhom: 'Cơ quan nghiệp vụ VHT' },

  // Ban Giám đốc Trung tâm / Khối
  { code: 'BGD_TT', ten: 'BGĐ Trung tâm', nhom: 'Ban Giám đốc' },
  { code: 'BGD_KHOI', ten: 'BGĐ Khối', nhom: 'Ban Giám đốc' },

  // Cơ quan Quản lý KHCN
  { code: 'CQ_QLKHCN', ten: 'Cơ quan QLKHCN (Chuyên hướng KHCN)', nhom: 'Cơ quan QLKHCN' },

  // Hội đồng cấp VHT
  { code: 'HDKHCN', ten: 'Hội đồng KHCN VHT', nhom: 'Hội đồng VHT' },
  { code: 'HDXD', ten: 'Hội đồng Xét duyệt', nhom: 'Hội đồng VHT' },
  { code: 'HDXD_DC', ten: 'Hội đồng Xét duyệt điều chỉnh', nhom: 'Hội đồng VHT' },
  { code: 'HDNT', ten: 'Hội đồng Nghiệm thu', nhom: 'Hội đồng VHT' },
  { code: 'HD_DGHT', ten: 'Hội đồng Đánh giá hoàn thành', nhom: 'Hội đồng VHT' },

  // Ban Tổng Giám đốc VHT
  { code: 'PTGD_CT', ten: 'Phó TGĐ Chuyên trách', nhom: 'Ban TGĐ VHT' },
  { code: 'TGD_VHT', ten: 'Tổng Giám đốc VHT', nhom: 'Ban TGĐ VHT' },

  // Cấp Tập đoàn
  { code: 'CQ_KHCN_TD', ten: 'Cơ quan KHCN Tập đoàn (Ban CNCNC)', nhom: 'Cấp Tập đoàn' },
  { code: 'CQNV_TD', ten: 'Cơ quan nghiệp vụ Tập đoàn', nhom: 'Cấp Tập đoàn' },
  { code: 'HDKHCN_TD', ten: 'Hội đồng KHCN Tập đoàn', nhom: 'Cấp Tập đoàn' },
  { code: 'HDXD_TD', ten: 'Hội đồng Xét duyệt Tập đoàn', nhom: 'Cấp Tập đoàn' },
  { code: 'HDNT_TD', ten: 'Hội đồng Nghiệm thu Tập đoàn', nhom: 'Cấp Tập đoàn' },
  { code: 'BTGD_TD', ten: 'Ban TGĐ Tập đoàn', nhom: 'Cấp Tập đoàn' },
]

const byCode = new Map(ROLES.map((r) => [r.code, r]))
const byTen = new Map(ROLES.map((r) => [r.ten, r]))

/** Nhãn hiển thị của một vai trò theo code; trả lại chính code nếu không có. */
export function roleLabel(code: string): string {
  return byCode.get(code)?.ten ?? code
}

/** Reverse lookup: từ nhãn (tên lane) → code vai trò; '' nếu không khớp. */
export function roleCodeByLabel(label: string): string {
  return byTen.get(label?.trim())?.code ?? ''
}

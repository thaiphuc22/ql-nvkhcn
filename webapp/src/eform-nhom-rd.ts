// Mã "Nhóm RD" (RD01..RD10) dùng để gắn nhóm quy trình cho biểu mẫu — đối chiếu
// với `process-registry.ts` (RD01..RD08 đã có ở đó) và mở rộng thêm RD07/RD09/
// RD10 đã được bổ sung từ trước. Mục đích ở đây chỉ là **nhóm filter trên Thư
// viện biểu mẫu** (`/phan-he/PH3/bieu-mau`), KHÔNG phải danh mục quy trình —
// tách bạch để sau này backend có cột `nhom_rd` riêng thì mapping 1-1.
//
// (Mirror của `frontend-angular/src/app/core/models/eform-nhom-rd.ts` —
// nếu một bên đổi label/màu, đổi bên kia cho khớp.)

export const NHOM_RD = {
  RD01: 'Xét duyệt Chủ trương',
  RD02: 'Xét duyệt NV KHCN',
  RD03: 'Thực hiện NV KHCN',
  RD04: 'Điều chỉnh NV KHCN',
  RD05: 'Nghiệm thu',
  RD06: 'Quyết toán',
  RD07: 'Quản lý Danh mục DV, SP NC',
  RD08: 'Sở hữu trí tuệ',
  RD09: 'Hỗ trợ tư vấn',
  RD10: 'Phát triển nguồn nhân lực KHCN',
} as const

export type NhomRD = keyof typeof NHOM_RD

/** Danh sách đã sắp xếp theo thứ tự RD01..RD10 — dùng cho dropdown lọc. */
export const NHOM_RD_ORDER: NhomRD[] = Object.keys(NHOM_RD).sort() as NhomRD[]

/** Nhãn tiếng Việt đầy đủ — dùng cho dropdown option label. */
export function nhomRDLabel(code: NhomRD): string {
  return `${code} — ${NHOM_RD[code]}`
}

/** Map mã → màu cho badge (pill) — lấy cảm hứng swimlane từ
 * `ProcessMapView.tsx` đã có ở nhánh `tranngdt`. */
export const NHOM_RD_PILL_COLOR: Record<NhomRD, string> = {
  RD01: '#1677ff', // Xét duyệt CT — xanh dương
  RD02: '#52c41a', // Xét duyệt NV — xanh lá
  RD03: '#fa8c16', // Thực hiện — cam
  RD04: '#f5222d', // Điều chỉnh — đỏ
  RD05: '#722ed1', // Nghiệm thu — tím
  RD06: '#13c2c2', // Quyết toán — cyan
  RD07: '#eb2f96', // DM DV/SP — hồng
  RD08: '#a0d911', // SHTT — xanh chanh
  RD09: '#2f54eb', // Hỗ trợ TV — xanh cô ban
  RD10: '#fa541c', // PT NLNC — cam đậm
}

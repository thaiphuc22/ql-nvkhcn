// Mã "Nhóm RD" (RD01..RD10) dùng để gắn nhóm quy trình cho biểu mẫu — đối chiếu
// với `process-registry.ts`'s `NHOM` (RD01..RD08 đã có ở đó) và mở rộng thêm
// RD07/RD09/RD10 đã được bổ sung từ trước (xem seed `processes.ts` ở worktree
// `tranngdt`). Mục đích ở đây chỉ là **nhóm filter trên Thư viện biểu mẫu**
// (`/phan-he/PH3/bieu-mau`), KHÔNG phải danh mục quy trình — tách bạch để sau
// này backend có cột `nhom_rd` riêng thì mapping 1-1.

export const NHOM_RD = {
  RD01: 'Xét duyệt Chủ trương',
  RD02: 'Xét duyệt NV KHCN',
  RD03: 'Thực hiện NV KHCN',
  RD04: 'Điều chỉnh NV KHCN',
  RD05: 'Nghiệm thu',
  RD06: 'Quyết toán',
  RD07: 'Danh mục SPDV nghiên cứu',
  RD08: 'Sở hữu trí tuệ',
  RD09: 'Dashboard / tổng hợp thông tin',
  RD10: 'Lưu trữ hồ sơ / biểu mẫu',
} as const;

export type NhomRD = keyof typeof NHOM_RD;

/** Danh sách đã sắp xếp theo thứ tự RD01..RD10 — dùng cho dropdown lọc. */
export function nhomRDSorted(): NhomRD[] {
  return Object.keys(NHOM_RD).sort() as NhomRD[];
}

/** Nhãn tiếng Việt đầy đủ — dùng cho dropdown option label. */
export function nhomRDLabel(code: NhomRD): string {
  return `${code} — ${NHOM_RD[code]}`;
}

/** Map mã → class màu cho badge (pill) — lấy cảm hứng swimlane từ
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
  RD09: '#2f54eb', // Dashboard — xanh cô ban
  RD10: '#fa541c', // Lưu trữ — cam đậm
};

/**
 * Vai trò PM/PA **theo nhiệm vụ** — tách hẳn khỏi chức danh HRM và khỏi vai trò hệ thống
 * (`core/models/roles.ts`).
 *
 * Yêu cầu nguyên văn của khách (`docs/hr_tool/trich-xuat/dac-ta-man-hinh.md` dòng 60–61):
 * *"1 nhiệm vụ có 1 PM và 1 PA đơn vị chủ trì. Mỗi đơn vị phân bổ có 1 PA"* và *"Quản lý danh sách
 * vai trò PA, PM của nhiệm vụ (khác với chức danh / vị trí của HRM)"*.
 *
 * Một người có thể là PM ở nhiệm vụ này và PA ở nhiệm vụ khác ⇒ vai trò **không** thuộc về người,
 * nó thuộc về cặp (nhiệm vụ, đơn vị).
 */

export type LoaiVaiTro = 'PM' | 'PA';

export const LOAI_VAI_TRO_LABEL: Record<LoaiVaiTro, string> = {
  PM: 'PM — Chủ nhiệm nhiệm vụ',
  PA: 'PA — Trợ lý nhiệm vụ',
};

export interface VaiTroNhiemVu {
  id: string;
  /** Trỏ tới `NhiemVu.maNhiemVu`. */
  nhiemVuId: string;
  maNhanVien: string;
  vaiTro: LoaiVaiTro;
  /** Đơn vị cấp 5 mà vai trò này phụ trách — với PM luôn là đơn vị chủ trì. */
  donVi: string;
}

/**
 * Soát ba luật của khách trên tập vai trò của MỘT nhiệm vụ. Trả về danh sách lỗi (rỗng = hợp lệ);
 * màn hình quyết định chặn hay chỉ cảnh báo.
 *
 * Không trả `boolean`: người khai cần biết *thiếu PA của đơn vị nào*, chứ "danh sách vai trò không
 * hợp lệ" thì họ phải tự dò.
 */
export function kiemTraVaiTro(
  rows: readonly VaiTroNhiemVu[],
  nhiemVu: { donViChuTri: string; donViPhanBo: readonly string[] },
): string[] {
  const loi: string[] = [];

  const pm = rows.filter((r) => r.vaiTro === 'PM');
  if (pm.length === 0) loi.push('Chưa khai PM của nhiệm vụ.');
  else if (pm.length > 1) loi.push(`Nhiệm vụ chỉ được có 1 PM, đang khai ${pm.length}.`);

  const paChuTri = rows.filter((r) => r.vaiTro === 'PA' && r.donVi === nhiemVu.donViChuTri);
  if (paChuTri.length === 0) loi.push(`Chưa khai PA của đơn vị chủ trì (${nhiemVu.donViChuTri}).`);
  else if (paChuTri.length > 1) loi.push(`Đơn vị chủ trì chỉ được có 1 PA, đang khai ${paChuTri.length}.`);

  // Mỗi đơn vị phân bổ phải có đúng 1 PA — đây là người xác nhận bảng công của đơn vị đó.
  for (const dv of nhiemVu.donViPhanBo) {
    if (dv === nhiemVu.donViChuTri) continue;
    const pa = rows.filter((r) => r.vaiTro === 'PA' && r.donVi === dv);
    if (pa.length === 0) loi.push(`Đơn vị phân bổ ${dv} chưa có PA.`);
    else if (pa.length > 1) loi.push(`Đơn vị phân bổ ${dv} có ${pa.length} PA, chỉ được 1.`);
  }

  return loi;
}

export const seedVaiTroNhiemVu: VaiTroNhiemVu[] = [
  { id: 'vt-001', nhiemVuId: 'NV-2024-001', maNhanVien: 'NV004', vaiTro: 'PM', donVi: 'Trung tâm Chỉ huy điều khiển' },
  { id: 'vt-002', nhiemVuId: 'NV-2024-001', maNhanVien: 'NV002', vaiTro: 'PA', donVi: 'Trung tâm Chỉ huy điều khiển' },
  { id: 'vt-003', nhiemVuId: 'NV-2024-001', maNhanVien: 'NV008', vaiTro: 'PA', donVi: 'Phòng Kinh doanh' },
  // CỐ Ý thiếu PA của Trung tâm Đảm bảo chất lượng: tab Vai trò phải nêu được lỗi này ngay khi mở.
  { id: 'vt-004', nhiemVuId: 'PO-92166', maNhanVien: 'NV006', vaiTro: 'PM', donVi: 'Trung tâm Thông tin Quân sự' },
  { id: 'vt-005', nhiemVuId: 'PO-92166', maNhanVien: 'NV008', vaiTro: 'PA', donVi: 'Trung tâm Thông tin Quân sự' },
  { id: 'vt-006', nhiemVuId: 'PO-92166', maNhanVien: 'NV005', vaiTro: 'PA', donVi: 'Trung tâm sản xuất' },
  { id: 'vt-007', nhiemVuId: 'PO-92166', maNhanVien: 'NV011', vaiTro: 'PA', donVi: 'Trung tâm dịch vụ sau bán hàng' },
  { id: 'vt-008', nhiemVuId: 'NV-2025-014', maNhanVien: 'NV003', vaiTro: 'PM', donVi: 'Phòng Quản lý sản xuất' },
  { id: 'vt-009', nhiemVuId: 'NV-2025-014', maNhanVien: 'NV005', vaiTro: 'PA', donVi: 'Phòng Quản lý sản xuất' },
  { id: 'vt-010', nhiemVuId: 'NV-2025-014', maNhanVien: 'NV009', vaiTro: 'PA', donVi: 'Trung tâm Kỹ thuật công nghệ - TCT CNC' },
  { id: 'vt-011', nhiemVuId: 'NV-2026-003', maNhanVien: 'NV006', vaiTro: 'PM', donVi: 'Trung tâm Nền tảng IOT' },
  { id: 'vt-012', nhiemVuId: 'NV-2026-003', maNhanVien: 'NV009', vaiTro: 'PA', donVi: 'Trung tâm Nền tảng IOT' },
  { id: 'vt-013', nhiemVuId: 'NV-2026-003', maNhanVien: 'NV010', vaiTro: 'PA', donVi: 'Phòng Quản lý chất lượng' },
  { id: 'vt-014', nhiemVuId: 'NV-2025-021', maNhanVien: 'NV007', vaiTro: 'PM', donVi: 'Trung tâm Tác chiến điện tử' },
  { id: 'vt-015', nhiemVuId: 'NV-2025-021', maNhanVien: 'NV010', vaiTro: 'PA', donVi: 'Trung tâm Tác chiến điện tử' },
  { id: 'vt-016', nhiemVuId: 'NV-2024-018', maNhanVien: 'NV003', vaiTro: 'PM', donVi: 'Trung tâm Nghiên cứu Công nghệ truyền dẫn' },
  { id: 'vt-017', nhiemVuId: 'NV-2024-018', maNhanVien: 'NV011', vaiTro: 'PA', donVi: 'Trung tâm Nghiên cứu Công nghệ truyền dẫn' },
];

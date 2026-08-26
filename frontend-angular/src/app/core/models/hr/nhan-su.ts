/**
 * Nhân sự tham gia nhiệm vụ — trục dữ liệu thứ hai của phân hệ Quản lý chi phí nhân công.
 * Tương ứng biểu mẫu **BM1 (BM.06)** *Danh sách nhân sự tham gia nhiệm vụ KHCN*.
 *
 * **`tyLePhanBo` là trường tham khảo, không phải luật của khách.** BM1 chỉ có 7 cột
 * `TT · MÃ NV · Họ và tên · Chức danh · Nội dung công việc tham gia · Thời gian tham gia · Ghi chú`
 * — không có cột tỷ lệ %. Trường này sinh ra từ bản thiết kế Figma của đợt 1; giữ lại vì khách chưa
 * nói là *không* muốn chỉ tiêu kế hoạch theo %, nhưng đã **hạ xuống optional** và đổi nhãn thành
 * *"Tỷ lệ dự kiến (%) — tham khảo"* (xem {@link TY_LE_PHAN_BO_NHAN}). Câu Q4 gửi khách còn treo;
 * hạ cấp thì đảo ngược được cả hai chiều, xoá hẳn thì không.
 *
 * Ràng buộc **thật** của khách là `noiDungCongViecIds`: BM1 bắt buộc khai nội dung công việc tham
 * gia, và một người có thể tham gia nhiều nội dung. Còn luật *một ngày chỉ chấm cho một nội dung
 * công việc* KHÔNG nằm ở đây — nó sống ở tầng `PhanBoCong` của đợt 2, đừng đi tìm trong file này.
 *
 * Kiểm tra ≤ 100% ở {@link tinhTongPhanBo} / {@link nhanSuVuotPhanBo} giữ nguyên để cả màn danh
 * sách, màn form lẫn luồng import dùng CHUNG một cách tính.
 *
 * Seed tái dùng `users` của `core/models/org-users.ts` thay vì bịa danh sách mới, để dữ liệu demo
 * nhất quán với các màn đang có (Ma trận phê duyệt, Hội đồng).
 */
import { users } from '../org-users';
import type { LichSuMuc } from './nhiem-vu';

export type NhanSuTrangThaiDuyet = 'NHAP' | 'CHO_DUYET' | 'DA_DUYET' | 'TU_CHOI';

export const NHAN_SU_TRANG_THAI_LABEL: Record<NhanSuTrangThaiDuyet, string> = {
  NHAP: 'Nháp',
  CHO_DUYET: 'Chờ duyệt',
  DA_DUYET: 'Đã duyệt',
  TU_CHOI: 'Từ chối',
};

/** Xem ghi chú `HrTagMau` ở `nhiem-vu.ts` — cùng lý do. */
export type NhanSuTrangThaiMau = 'default' | 'processing' | 'success' | 'warning' | 'error';

export const NHAN_SU_TRANG_THAI_COLOR: Record<NhanSuTrangThaiDuyet, NhanSuTrangThaiMau> = {
  NHAP: 'default',
  CHO_DUYET: 'processing',
  DA_DUYET: 'success',
  TU_CHOI: 'error',
};

/**
 * Nhãn dùng chung cho ô tỷ lệ. Khai ở một chỗ để mọi màn nói cùng một câu — nếu Q4 chốt là bỏ hẳn
 * thì đây là điểm bắt đầu để gỡ.
 */
export const TY_LE_PHAN_BO_NHAN = 'Tỷ lệ dự kiến (%) — tham khảo';

/** Vai trò tham gia, đọc từ mục I/II của BM2.1. Khác `VaiTroNhiemVu` (PM/PA) — cái đó theo đơn vị. */
export const VAI_TRO_THAM_GIA_OPTIONS: readonly string[] = [
  'Chủ nhiệm nhiệm vụ',
  'Thư ký nhiệm vụ',
  'Thành viên chính',
  'Thành viên',
  'Kỹ thuật viên',
  'Hỗ trợ hành chính',
];

export interface NhanSuNhiemVu {
  /** Khoá dòng — một người tham gia nhiều nhiệm vụ thì có nhiều dòng, nên `maNhanVien` KHÔNG đủ làm khoá. */
  id: string;
  maNhanVien: string;
  hoTen: string;
  email: string;
  donVi: string;
  chucDanh: string;
  /** Trỏ tới `NhiemVu.maNhiemVu`. */
  nhiemVuId: string;
  vaiTroThamGia: string;
  /** Nội dung công việc người này tham gia — BM1 bắt buộc, có thể nhiều. */
  noiDungCongViecIds: string[];
  /** Tỷ lệ dự kiến, **tham khảo**. Không có trong BM1 — xem ghi chú đầu file. */
  tyLePhanBo?: number;
  /** ISO date `yyyy-MM-dd`. */
  tuNgay: string;
  denNgay: string;
  trangThaiDuyet: NhanSuTrangThaiDuyet;
  ghiChu: string;
  lichSu: LichSuMuc[];
}

/** Hai khoảng ngày có chồng lấn không (bao gồm hai đầu mút). */
export function kyChongLan(a: { tuNgay: string; denNgay: string }, b: { tuNgay: string; denNgay: string }): boolean {
  return a.tuNgay <= b.denNgay && b.tuNgay <= a.denNgay;
}

/**
 * Tổng `tyLePhanBo` của một người trên các dòng CHỒNG LẤN KỲ với `moc`. `boQuaId` để màn sửa không
 * tự cộng chính dòng đang sửa vào tổng (nếu không, sửa 60% → 70% sẽ bị tính thành 130%).
 *
 * Dòng bỏ trống tỷ lệ tính là 0 — sau khi hạ trường này xuống optional, phần lớn dữ liệu thật sẽ
 * trống, và khi đó cảnh báo vượt 100% đơn giản là không kích hoạt.
 */
export function tinhTongPhanBo(
  rows: readonly NhanSuNhiemVu[],
  maNhanVien: string,
  moc: { tuNgay: string; denNgay: string },
  boQuaId?: string,
): number {
  return rows
    .filter(
      (r) => r.maNhanVien === maNhanVien && r.id !== boQuaId && r.trangThaiDuyet !== 'TU_CHOI' && kyChongLan(r, moc),
    )
    .reduce((sum, r) => sum + (r.tyLePhanBo ?? 0), 0);
}

/** Tập `maNhanVien` đang vượt 100% — dùng để bôi đỏ dòng ở màn danh sách. */
export function nhanSuVuotPhanBo(rows: readonly NhanSuNhiemVu[]): Set<string> {
  const vuot = new Set<string>();
  for (const row of rows) {
    if (vuot.has(row.maNhanVien)) continue;
    if (tinhTongPhanBo(rows, row.maNhanVien, row) > 100) vuot.add(row.maNhanVien);
  }
  return vuot;
}

/** Mã nhân viên suy từ `AppUser.id` (`U-004` → `NV004`) — giữ ánh xạ 1:1 với org-users. */
function maNhanVienTu(userId: string): string {
  return `NV${userId.replace(/\D/g, '').padStart(3, '0')}`;
}

/** Ứng viên chọn trong Pop-up chọn nhân sự — phẳng hoá `users` về đúng các trường màn HR cần. */
export interface UngVienNhanSu {
  maNhanVien: string;
  hoTen: string;
  email: string;
  donVi: string;
  chucDanh: string;
}

export const UNG_VIEN_NHAN_SU: UngVienNhanSu[] = users.map((u) => ({
  maNhanVien: maNhanVienTu(u.id),
  hoTen: u.hoTen,
  email: u.email,
  donVi: u.donVi,
  chucDanh: u.chucDanh,
}));

export function timUngVien(ma: string): UngVienNhanSu | undefined {
  return UNG_VIEN_NHAN_SU.find((u) => u.maNhanVien === ma);
}

/**
 * Nhãn hiển thị của PM/PA trên màn nhiệm vụ. BM5 lưu hai vai trò này bằng **email**, model lưu mã
 * nhân viên ⇒ chỗ nào in ra người dùng thì dùng hàm này, đừng in mã trần.
 */
export function nhanNhanSu(ma: string | null | undefined): string {
  if (!ma) return '—';
  const u = timUngVien(ma);
  return u ? `${u.hoTen} (${u.email})` : ma;
}

/** Cây đơn vị cho panel trái của Pop-up chọn nhân sự — dựng từ `donVi` có thật trong org-users. */
export const DON_VI_TREE: readonly string[] = [...new Set(UNG_VIEN_NHAN_SU.map((u) => u.donVi))].sort((a, b) =>
  a.localeCompare(b, 'vi'),
);

interface SeedRow {
  maNhanVien: string;
  nhiemVuId: string;
  vaiTroThamGia: string;
  noiDungCongViecIds: string[];
  tyLePhanBo?: number;
  tuNgay: string;
  denNgay: string;
  trangThaiDuyet: NhanSuTrangThaiDuyet;
  ghiChu: string;
}

/**
 * Dòng seed. Hai điểm cố ý:
 *  · cặp NV004 trên `NV-2024-001` (70%) và `NV-2026-007` (50%) **chồng lấn kỳ** và cộng thành 120%,
 *    để cảnh báo vượt phân bổ có dữ liệu chứng minh ngay khi mở màn;
 *  · vài dòng **bỏ trống `tyLePhanBo`** — đó là hình dạng dữ liệu thật theo BM1, và màn hình phải
 *    hiển thị được `—` thay vì `0%` hay `NaN`.
 */
const SEED_ROWS: SeedRow[] = [
  { maNhanVien: 'NV004', nhiemVuId: 'NV-2024-001', vaiTroThamGia: 'Chủ nhiệm nhiệm vụ', noiDungCongViecIds: ['ndcv-001'], tyLePhanBo: 70, tuNgay: '2026-01-01', denNgay: '2026-12-31', trangThaiDuyet: 'DA_DUYET', ghiChu: '' },
  { maNhanVien: 'NV004', nhiemVuId: 'NV-2026-007', vaiTroThamGia: 'Chủ nhiệm nhiệm vụ', noiDungCongViecIds: [], tyLePhanBo: 50, tuNgay: '2026-03-01', denNgay: '2026-12-31', trangThaiDuyet: 'CHO_DUYET', ghiChu: 'Kiêm nhiệm 2 nhiệm vụ.' },
  { maNhanVien: 'NV006', nhiemVuId: 'NV-2024-001', vaiTroThamGia: 'Thành viên chính', noiDungCongViecIds: ['ndcv-001', 'ndcv-003'], tyLePhanBo: 60, tuNgay: '2026-01-01', denNgay: '2026-12-31', trangThaiDuyet: 'DA_DUYET', ghiChu: '' },
  { maNhanVien: 'NV002', nhiemVuId: 'NV-2024-001', vaiTroThamGia: 'Thư ký nhiệm vụ', noiDungCongViecIds: ['ndcv-002'], tuNgay: '2026-01-01', denNgay: '2026-12-31', trangThaiDuyet: 'DA_DUYET', ghiChu: 'Thời gian tham gia: từ đầu năm đến khi kết thúc nhiệm vụ.' },
  { maNhanVien: 'NV003', nhiemVuId: 'PO-92166', vaiTroThamGia: 'Chủ nhiệm nhiệm vụ', noiDungCongViecIds: ['ndcv-004'], tyLePhanBo: 80, tuNgay: '2025-01-01', denNgay: '2025-12-31', trangThaiDuyet: 'DA_DUYET', ghiChu: '' },
  { maNhanVien: 'NV008', nhiemVuId: 'PO-92166', vaiTroThamGia: 'Thành viên', noiDungCongViecIds: ['ndcv-005'], tuNgay: '2025-04-01', denNgay: '2025-12-31', trangThaiDuyet: 'CHO_DUYET', ghiChu: '' },
  { maNhanVien: 'NV005', nhiemVuId: 'PO-92166', vaiTroThamGia: 'Kỹ thuật viên', noiDungCongViecIds: ['ndcv-006'], tyLePhanBo: 25, tuNgay: '2025-07-01', denNgay: '2025-12-31', trangThaiDuyet: 'NHAP', ghiChu: 'Chờ xác nhận của đơn vị.' },
  { maNhanVien: 'NV006', nhiemVuId: 'NV-2026-003', vaiTroThamGia: 'Chủ nhiệm nhiệm vụ', noiDungCongViecIds: ['ndcv-007'], tyLePhanBo: 35, tuNgay: '2026-09-01', denNgay: '2027-08-31', trangThaiDuyet: 'CHO_DUYET', ghiChu: '' },
  { maNhanVien: 'NV009', nhiemVuId: 'NV-2026-003', vaiTroThamGia: 'Thành viên', noiDungCongViecIds: ['ndcv-008'], tyLePhanBo: 45, tuNgay: '2026-09-01', denNgay: '2027-08-31', trangThaiDuyet: 'CHO_DUYET', ghiChu: '' },
  { maNhanVien: 'NV007', nhiemVuId: 'NV-2025-021', vaiTroThamGia: 'Chủ nhiệm nhiệm vụ', noiDungCongViecIds: [], tyLePhanBo: 50, tuNgay: '2025-06-01', denNgay: '2026-05-31', trangThaiDuyet: 'DA_DUYET', ghiChu: 'Nhiệm vụ QPAN — không tách nội dung công việc.' },
  { maNhanVien: 'NV010', nhiemVuId: 'NV-2025-021', vaiTroThamGia: 'Thành viên chính', noiDungCongViecIds: [], tyLePhanBo: 40, tuNgay: '2025-06-01', denNgay: '2026-05-31', trangThaiDuyet: 'TU_CHOI', ghiChu: 'Đã chuyển công tác.' },
  { maNhanVien: 'NV011', nhiemVuId: 'NV-2024-018', vaiTroThamGia: 'Thành viên', noiDungCongViecIds: ['ndcv-009'], tyLePhanBo: 30, tuNgay: '2024-03-01', denNgay: '2025-12-31', trangThaiDuyet: 'DA_DUYET', ghiChu: '' },
];

export const seedNhanSuNhiemVu: NhanSuNhiemVu[] = SEED_ROWS.map((row, index) => {
  const ungVien = timUngVien(row.maNhanVien);
  return {
    id: `ns-seed-${String(index + 1).padStart(3, '0')}`,
    maNhanVien: row.maNhanVien,
    hoTen: ungVien?.hoTen ?? row.maNhanVien,
    email: ungVien?.email ?? '',
    donVi: ungVien?.donVi ?? '',
    chucDanh: ungVien?.chucDanh ?? '',
    nhiemVuId: row.nhiemVuId,
    vaiTroThamGia: row.vaiTroThamGia,
    noiDungCongViecIds: row.noiDungCongViecIds,
    tyLePhanBo: row.tyLePhanBo,
    tuNgay: row.tuNgay,
    denNgay: row.denNgay,
    trangThaiDuyet: row.trangThaiDuyet,
    ghiChu: row.ghiChu,
    lichSu: [{ at: `${row.tuNgay} 08:00`, actor: 'Nguyễn Thu Hương', hanhDong: 'Thêm nhân sự vào nhiệm vụ' }],
  };
});

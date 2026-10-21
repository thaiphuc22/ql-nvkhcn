/** RD08 — Hồ sơ sở hữu trí tuệ (port rút gọn từ webapp/src/data/sanPhamKhcn.ts). */

export type TrangThaiShtt = 'draft' | 'active' | 'submitted' | 'approved' | 'inactive';

export const TRANG_THAI_SHTT_LABEL: Record<TrangThaiShtt, string> = {
  draft: 'Nháp',
  active: 'Đang sử dụng',
  submitted: 'Đã trình duyệt',
  approved: 'Đã duyệt',
  inactive: 'Ngừng sử dụng',
};

export const TRANG_THAI_SHTT_COLOR: Record<TrangThaiShtt, string> = {
  draft: 'default',
  active: 'processing',
  submitted: 'gold',
  approved: 'success',
  inactive: 'warning',
};

export type LoaiShtt = 'SC' | 'GPHI' | 'KHCN' | 'BQTG' | 'NH';

export const LOAI_SHTT_OPTS: { value: LoaiShtt; label: string }[] = [
  { value: 'SC', label: 'SC — Sáng chế' },
  { value: 'GPHI', label: 'GPHI — Giải pháp hữu ích' },
  { value: 'KHCN', label: 'KHCN — Kết quả KHCN' },
  { value: 'BQTG', label: 'BQTG — Bản quyền tác giả' },
  { value: 'NH', label: 'NH — Nhãn hiệu' },
];

export const TRANG_THAI_BAO_HO = [
  'Chưa đăng ký',
  'Đã nộp đơn',
  'Đã chấp nhận đơn',
  'Đã công báo',
  'Đang thẩm định',
  'Được bảo hộ',
  'Từ chối',
  'Hết hạn / cần tái tục',
] as const;

export interface ShttHistory {
  at: string;
  actor: string;
  action: string;
}

export interface HoSoShtt {
  id: string;
  ma: string;
  ten: string;
  loai: LoaiShtt;
  maNV: string;
  tenNV: string;
  donViChuQuan: string;
  tacGia: string;
  tyLeDongGop: string;
  chuSoHuu: string;
  tyLeQuyen: string;
  trangThaiBaoHo: string;
  soDon: string;
  ngayNop: string;
  trangThai: TrangThaiShtt;
  updatedAt: string;
  history: ShttHistory[];
}

export const seedHoSoShtt: HoSoShtt[] = [
  {
    id: 'IP001',
    ma: 'SHTT.2026.001',
    ten: 'Sáng chế phương pháp xử lý tín hiệu radar đa kênh',
    loai: 'SC',
    maNV: 'RD.2026.018',
    tenNV: 'Nghiên cứu công nghệ radar đa chức năng',
    donViChuQuan: 'TT Nghiên cứu Vô tuyến',
    tacGia: 'Trần Minh Đức; Lê Hoàng Nam',
    tyLeDongGop: '60% / 40%',
    chuSoHuu: 'Viettel High Tech',
    tyLeQuyen: 'VHT 100%',
    trangThaiBaoHo: 'Đã chấp nhận đơn',
    soDon: '1-2026-01234',
    ngayNop: '2026-05-12',
    trangThai: 'submitted',
    updatedAt: '2026-06-20',
    history: [
      { at: '2026-05-01', actor: 'Trần Minh Đức', action: 'Tạo hồ sơ' },
      { at: '2026-05-10', actor: 'Trần Minh Đức', action: 'Trình duyệt' },
    ],
  },
  {
    id: 'IP002',
    ma: 'SHTT.2026.002',
    ten: 'Giải pháp hữu ích anten mảng thông minh',
    loai: 'GPHI',
    maNV: 'RD.2026.009',
    tenNV: 'Phát triển hệ thống mô phỏng và thử nghiệm',
    donViChuQuan: 'TT Nghiên cứu Điều khiển',
    tacGia: 'Vũ Quốc Huy',
    tyLeDongGop: '100%',
    chuSoHuu: 'Viettel High Tech; Trung tâm Sản phẩm',
    tyLeQuyen: 'VHT 70% / TTSP 30%',
    trangThaiBaoHo: 'Đã công báo',
    soDon: '2-2026-00456',
    ngayNop: '2026-04-01',
    trangThai: 'active',
    updatedAt: '2026-07-01',
    history: [{ at: '2026-04-01', actor: 'Vũ Quốc Huy', action: 'Tạo hồ sơ' }],
  },
  {
    id: 'IP003',
    ma: 'SHTT.2026.003',
    ten: 'Bản quyền phần mềm nền tảng dữ liệu KHCN',
    loai: 'BQTG',
    maNV: 'RD.2026.021',
    tenNV: 'Xây dựng nền tảng quản trị dữ liệu KHCN',
    donViChuQuan: 'Ban CLKHCN VHT',
    tacGia: 'Phạm Thu Hà; Nguyễn Văn An',
    tyLeDongGop: '55% / 45%',
    chuSoHuu: 'Viettel High Tech',
    tyLeQuyen: 'VHT 100%',
    trangThaiBaoHo: 'Chưa đăng ký',
    soDon: '',
    ngayNop: '',
    trangThai: 'draft',
    updatedAt: '2026-07-08',
    history: [{ at: '2026-07-08', actor: 'Phạm Thu Hà', action: 'Tạo hồ sơ' }],
  },
];

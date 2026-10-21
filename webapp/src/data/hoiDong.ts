// Hội đồng (HĐXD) — quản lý Hội đồng xét duyệt đề tài KHCN (RD02.02).
// Quy tắc nghiệp vụ (mock):
// - Thành phần bắt buộc: CT + 02 UVPB + Thư ký KH
// - Quorum: ≥ 2/3 thành viên có mặt + đủ 4 vai trò bắt buộc có mặt
// - Điểm TB thang 0–100, làm tròn 2 số thập phân, ngưỡng cố định 70
// - Đạt phiên 2 = đủ phiếu bắt buộc (CT+2 UVPB+TK đã gửi) VÀ TB ≥ 70
// - Phiên 1: chỉ “Đã họp” + biên bản + danh sách điều chỉnh
// - Phiên 2: Đạt / Không đạt; <70 → trả về bước 15

/** Vai trò trong Hội đồng xét duyệt (code nội bộ). */
export type VaiTroHoiDong =
  | 'CHU_TICH'     // Chủ tịch
  | 'PHAN_BIEN_1'  // UVPB 1
  | 'PHAN_BIEN_2'  // UVPB 2
  | 'UY_VIEN'      // Ủy viên
  | 'THU_KY_KH'    // Thư ký Khoa học

export const VAI_TRO_BAT_BUOC: VaiTroHoiDong[] = [
  'CHU_TICH',
  'PHAN_BIEN_1',
  'PHAN_BIEN_2',
  'THU_KY_KH',
]

export const NGUONG_DIEM_HD = 70

export const VAI_TRO_HD: Record<
  VaiTroHoiDong,
  { ten: string; mau: string; thuTu: number; batBuoc: boolean }
> = {
  CHU_TICH: { ten: 'Chủ tịch', mau: 'red', thuTu: 1, batBuoc: true },
  PHAN_BIEN_1: { ten: 'UVPB 1', mau: 'blue', thuTu: 2, batBuoc: true },
  PHAN_BIEN_2: { ten: 'UVPB 2', mau: 'cyan', thuTu: 3, batBuoc: true },
  UY_VIEN: { ten: 'Ủy viên', mau: 'green', thuTu: 4, batBuoc: false },
  THU_KY_KH: { ten: 'Thư ký KH', mau: 'orange', thuTu: 5, batBuoc: true },
}

export type TrangThaiPhieuDG = 'chua_nop' | 'da_gui' | 'thu_hoi'

export interface PhieuDanhGiaTV {
  trangThai: TrangThaiPhieuDG
  /** Điểm quy đổi thang 0–100 */
  diemQuyDoi: number
  daKySo: boolean
  /** Thư ký KH đã duyệt phiếu → không còn thu hồi */
  daDuyetBoiThuKy: boolean
}

export interface ThanhVienHoiDong {
  id: string
  userId?: string
  hoTen: string
  vaiTro: VaiTroHoiDong
  donVi: string
  hocHamHocVi?: string
  linhVucChuyenMon: string[]
  email?: string
  dienThoai?: string
  kinhNghiemNam?: number
  trangThai: 'duKien' | 'chapNhan' | 'tuChoi' | 'vangMat'
  /** Có mặt tại phiên họp */
  coMatHop?: boolean
  /** Điểm TB thành viên (0–100) — mirror từ phiếu nếu có */
  diemTrungBinh?: number
  phieuDanhGia?: PhieuDanhGiaTV
  yKienDongGop?: string
}

export type KetQuaHoiDong = 'DAT' | 'KHONG_DAT'

export type KetQuaBanThamDinh = 'DAT' | 'CHUA_DAT'

/** Trạng thái tham dự của 1 thành viên trong phiên họp. */
export type TrangThaiThamGiaPhien = 'tham_gia' | 'khong_tham_gia'

export type TrangThaiPhienHop =
  | 'nhap'
  | 'da_moi'
  | 'dang_hop'
  | 'da_ket_thuc'
  | 'huy'

/** Điểm danh 1 thành viên trong phiên họp (tích chọn tham gia / không). */
export interface DiemDanhPhienHop {
  thanhVienId: string
  trangThai: TrangThaiThamGiaPhien
}

/**
 * Phiên họp hội đồng — bắt buộc khai báo thời gian, địa điểm
 * và tích chọn từng thành viên tham gia / không tham gia.
 */
export interface PhienHopHoiDong {
  id: string
  /** Nhãn hiển thị, vd. "Họp phiên 1", "Họp bổ sung" */
  ten: string
  /** Liên kết với phiên nghiệp vụ 1/2 của HĐ (nếu có) */
  loaiPhien: 1 | 2 | 'khac'
  /** ISO datetime bắt đầu (bắt buộc) */
  thoiGian: string
  /** Địa điểm họp (bắt buộc) */
  diaDiem: string
  trangThai: TrangThaiPhienHop
  /** Điểm danh đủ thành viên HĐ */
  diemDanh: DiemDanhPhienHop[]
  ghiChu?: string
  ngayTao: string
}

export interface TienDeThamDinh4Ban {
  khcn: KetQuaBanThamDinh
  tckt: KetQuaBanThamDinh
  ms: KetQuaBanThamDinh
  ns: KetQuaBanThamDinh
}

export interface HoiDong {
  id: string
  maHoSo: string
  maNhiemVu: string
  tenDeTai: string
  linhVucNghienCuu: string[]
  phiEn: 1 | 2
  ngayThanhLap: string
  ngayHopDuKien: string
  diaDiem?: string
  trangThai: 'sapLap' | 'dangHop' | 'daKetThuc' | 'huyBo'
  thanhVien: ThanhVienHoiDong[]
  /** Danh sách phiên họp đã lập (thời gian / địa điểm / điểm danh) */
  phienHop?: PhienHopHoiDong[]
  bienBanHopFile?: string
  /** Phiên 1: danh sách nội dung cần điều chỉnh / làm rõ */
  danhSachDieuChinh?: string[]
  /** Điểm TB hội đồng (0–100, 2 số thập phân) */
  diemTrungBinhHoiDong?: number
  ketQuaDanhGia?: KetQuaHoiDong
  tomTatKetLuan?: string
  ngayKetThuc?: string
  /** Tiền đề mở phiên 2: thẩm định song song 4 ban */
  tienDeThamDinh?: TienDeThamDinh4Ban
  /** Cờ mock: không đạt → trả về bước 15 */
  traVeBuoc15?: boolean
}

export interface ExpertProfile {
  userId: string
  hoTen: string
  email: string
  donVi: string
  hocHamHocVi: string
  linhVucChuyenMon: string[]
  kinhNghiemNam: number
}

export const EXPERT_POOL: ExpertProfile[] = [
  {
    userId: 'EXP-001',
    hoTen: 'PGS.TS. Nguyễn Văn An',
    email: 'annv@viettel.com.vn',
    donVi: 'TT Nghiên cứu Vô tuyến',
    hocHamHocVi: 'PGS.TS.',
    linhVucChuyenMon: ['Vô tuyến', 'Truyền thông', 'Anten'],
    kinhNghiemNam: 18,
  },
  {
    userId: 'EXP-002',
    hoTen: 'TS. Trần Thị Bình',
    email: 'binhtt@viettel.com.vn',
    donVi: 'TT Nghiên cứu Vô tuyến',
    hocHamHocVi: 'TS.',
    linhVucChuyenMon: ['Vô tuyến', 'Xử lý tín hiệu', 'DSP'],
    kinhNghiemNam: 12,
  },
  {
    userId: 'EXP-003',
    hoTen: 'GS.TSKH. Lê Đình Cường',
    email: 'cuongld@viettel.com.vn',
    donVi: 'TT Nghiên cứu Điều khiển',
    hocHamHocVi: 'GS.TSKH.',
    linhVucChuyenMon: ['Điều khiển', 'AI', 'Hệ thống nhúng'],
    kinhNghiemNam: 25,
  },
  {
    userId: 'EXP-004',
    hoTen: 'TS. Phạm Minh Đức',
    email: 'ducpm@viettel.com.vn',
    donVi: 'TT Nghiên cứu Điều khiển',
    hocHamHocVi: 'TS.',
    linhVucChuyenMon: ['AI', 'Machine Learning', 'Điều khiển'],
    kinhNghiemNam: 10,
  },
  {
    userId: 'EXP-005',
    hoTen: 'PGS.TS. Hoàng Thị Eva',
    email: 'evaht@viettel.com.vn',
    donVi: 'TT Nghiên cứu Vật liệu',
    hocHamHocVi: 'PGS.TS.',
    linhVucChuyenMon: ['Vật liệu', 'Vi điện tử', 'Công nghệ nano'],
    kinhNghiemNam: 15,
  },
  {
    userId: 'EXP-006',
    hoTen: 'TS. Vũ Quang Hùng',
    email: 'hungvq@viettel.com.vn',
    donVi: 'TT Nghiên cứu Vật liệu',
    hocHamHocVi: 'TS.',
    linhVucChuyenMon: ['Vật liệu', 'Cơ khí chính xác'],
    kinhNghiemNam: 9,
  },
  {
    userId: 'EXP-007',
    hoTen: 'GS.TS. Bùi Xuân Lai',
    email: 'laibx@viettel.com.vn',
    donVi: 'TT Nghiên cứu Tác chiến ĐT',
    hocHamHocVi: 'GS.TS.',
    linhVucChuyenMon: ['Tác chiến Điện tử', 'Radar', 'EW'],
    kinhNghiemNam: 22,
  },
  {
    userId: 'EXP-008',
    hoTen: 'TS. Đặng Thị Hương',
    email: 'huongdt@viettel.com.vn',
    donVi: 'TT Nghiên cứu Tác chiến ĐT',
    hocHamHocVi: 'TS.',
    linhVucChuyenMon: ['Tác chiến Điện tử', 'Mô phỏng'],
    kinhNghiemNam: 11,
  },
  {
    userId: 'EXP-009',
    hoTen: 'PGS.TS. Trịnh Đình Long',
    email: 'longtd@viettel.com.vn',
    donVi: 'Ban KHCN VHT',
    hocHamHocVi: 'PGS.TS.',
    linhVucChuyenMon: ['Quản lý KHCN', 'AI', 'IoT'],
    kinhNghiemNam: 20,
  },
  {
    userId: 'EXP-010',
    hoTen: 'ThS. Ngô Thanh Sơn',
    email: 'sonnt@viettel.com.vn',
    donVi: 'Ban KHCN VHT',
    hocHamHocVi: 'ThS.',
    linhVucChuyenMon: ['Quản lý KHCN', 'Tiêu chuẩn'],
    kinhNghiemNam: 8,
  },
  {
    userId: 'EXP-011',
    hoTen: 'ThS. Lê Thị Mai Lan',
    email: 'lanltm@viettel.com.vn',
    donVi: 'TP Tài chính Kế toán',
    hocHamHocVi: 'ThS.',
    linhVucChuyenMon: ['Tài chính', 'Kế toán', 'Quản lý dự án'],
    kinhNghiemNam: 14,
  },
  {
    userId: 'EXP-012',
    hoTen: 'KS. Hoàng Đình Nam',
    email: 'namhd@viettel.com.vn',
    donVi: 'TP Tài chính Kế toán',
    hocHamHocVi: 'KS.',
    linhVucChuyenMon: ['Tài chính', 'Quản lý dự án', 'Đấu thầu'],
    kinhNghiemNam: 7,
  },
  {
    userId: 'EXP-013',
    hoTen: 'ThS. Phạm Thị Ngọc',
    email: 'ngocpt@viettel.com.vn',
    donVi: 'TP Nhân sự',
    hocHamHocVi: 'ThS.',
    linhVucChuyenMon: ['Nhân sự', 'Đào tạo', 'Quản lý'],
    kinhNghiemNam: 12,
  },
  {
    userId: 'EXP-014',
    hoTen: 'GS.TS. Cao Minh Thắng',
    email: 'thangcm@viettel.com.vn',
    donVi: 'Ban CNCNC Tập đoàn',
    hocHamHocVi: 'GS.TS.',
    linhVucChuyenMon: ['AI', 'Big Data', 'Cloud Computing'],
    kinhNghiemNam: 24,
  },
  {
    userId: 'EXP-015',
    hoTen: 'PGS.TS. Đỗ Thu Hà',
    email: 'hadt@viettel.com.vn',
    donVi: 'Ban CNCNC Tập đoàn',
    hocHamHocVi: 'PGS.TS.',
    linhVucChuyenMon: ['An ninh mạng', 'Blockchain', 'IoT'],
    kinhNghiemNam: 16,
  },
]

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function kiemTraThanhPhanBatBuoc(hd: HoiDong): {
  ok: boolean
  thieu: VaiTroHoiDong[]
} {
  const present = new Set(hd.thanhVien.map((t) => t.vaiTro))
  const thieu = VAI_TRO_BAT_BUOC.filter((v) => !present.has(v))
  return { ok: thieu.length === 0, thieu }
}

/** Quorum: ≥ ceil(2/3 tổng TV) có mặt VÀ 4 vai trò bắt buộc đều có mặt. */
export function kiemTraQuorum(hd: HoiDong): {
  ok: boolean
  soCoMat: number
  canThiet: number
  thieuVaiTroBatBuoc: VaiTroHoiDong[]
} {
  const total = hd.thanhVien.length
  const canThiet = total === 0 ? 0 : Math.ceil((total * 2) / 3)
  const soCoMat = hd.thanhVien.filter((t) => t.coMatHop).length
  const thieuVaiTroBatBuoc = VAI_TRO_BAT_BUOC.filter(
    (v) => !hd.thanhVien.some((t) => t.vaiTro === v && t.coMatHop),
  )
  return {
    ok: soCoMat >= canThiet && thieuVaiTroBatBuoc.length === 0,
    soCoMat,
    canThiet,
    thieuVaiTroBatBuoc,
  }
}

export function tinhDiemTrungBinh(hd: HoiDong): number | undefined {
  const scores = hd.thanhVien
    .filter((t) => {
      const st = t.phieuDanhGia?.trangThai
      if (st === 'chua_nop' || st === 'thu_hoi') return false
      if (st === 'da_gui') return true
      return typeof t.diemTrungBinh === 'number'
    })
    .map((t) => t.phieuDanhGia?.diemQuyDoi ?? t.diemTrungBinh)
    .filter((d): d is number => typeof d === 'number' && !Number.isNaN(d))
  if (!scores.length) return undefined
  return round2(scores.reduce((a, b) => a + b, 0) / scores.length)
}

/** Đủ phiếu bắt buộc: CT + 2 UVPB + TK đã gửi phiếu. */
export function duPhieuBatBuoc(hd: HoiDong): boolean {
  return VAI_TRO_BAT_BUOC.every((v) =>
    hd.thanhVien.some(
      (t) => t.vaiTro === v && t.phieuDanhGia?.trangThai === 'da_gui',
    ),
  )
}

export function coTheMoPhien2(hd: HoiDong): boolean {
  const t = hd.tienDeThamDinh
  if (!t) return false
  return t.khcn === 'DAT' && t.tckt === 'DAT' && t.ms === 'DAT' && t.ns === 'DAT'
}

export function danhGiaKetQua(hd: HoiDong): {
  ketQua: KetQuaHoiDong | undefined
  diemTB: number | undefined
  traVeBuoc15: boolean
  lyDo?: string
} {
  if (hd.phiEn !== 2) {
    return {
      ketQua: undefined,
      diemTB: tinhDiemTrungBinh(hd),
      traVeBuoc15: false,
      lyDo: 'Phiên 1 không chấm Đạt/Không đạt — chỉ lập biên bản & danh sách điều chỉnh.',
    }
  }
  const diemTB = tinhDiemTrungBinh(hd)
  if (diemTB === undefined) {
    return { ketQua: undefined, diemTB, traVeBuoc15: false, lyDo: 'Chưa có phiếu điểm.' }
  }
  const duPhieu = duPhieuBatBuoc(hd)
  if (duPhieu && diemTB >= NGUONG_DIEM_HD) {
    return { ketQua: 'DAT', diemTB, traVeBuoc15: false }
  }
  const lyDo = !duPhieu
    ? 'Thiếu phiếu bắt buộc (CT + 02 UVPB + Thư ký KH).'
    : `Điểm TB ${diemTB.toFixed(2)} < ${NGUONG_DIEM_HD}.`
  return { ketQua: 'KHONG_DAT', diemTB, traVeBuoc15: true, lyDo }
}

export function coTheThuHoiPhieu(tv: ThanhVienHoiDong): boolean {
  const p = tv.phieuDanhGia
  return Boolean(p && p.trangThai === 'da_gui' && !p.daDuyetBoiThuKy)
}

export const TRANG_THAI_PHIEN_HOP: Record<
  TrangThaiPhienHop,
  { label: string; color: string }
> = {
  nhap: { label: 'Nháp', color: 'default' },
  da_moi: { label: 'Đã mời', color: 'blue' },
  dang_hop: { label: 'Đang họp', color: 'processing' },
  da_ket_thuc: { label: 'Đã kết thúc', color: 'green' },
  huy: { label: 'Hủy', color: 'red' },
}

/** Kiểm tra phiên họp đã khai báo đủ thời gian, địa điểm và điểm danh mọi thành viên. */
export function kiemTraPhienHopHopLe(
  ph: Pick<PhienHopHoiDong, 'thoiGian' | 'diaDiem' | 'diemDanh'>,
  thanhVienIds: string[],
): { ok: boolean; loi: string[] } {
  const loi: string[] = []
  if (!ph.thoiGian?.trim()) loi.push('Chưa khai báo thời gian họp')
  if (!ph.diaDiem?.trim()) loi.push('Chưa khai báo địa điểm họp')
  const map = new Map(ph.diemDanh.map((d) => [d.thanhVienId, d.trangThai]))
  const thieu = thanhVienIds.filter((id) => !map.has(id))
  if (thieu.length) {
    loi.push(`Chưa tích chọn tham gia/không cho ${thieu.length} thành viên`)
  }
  return { ok: loi.length === 0, loi }
}

export function demThamGiaPhien(ph: PhienHopHoiDong): {
  thamGia: number
  khongThamGia: number
} {
  return {
    thamGia: ph.diemDanh.filter((d) => d.trangThai === 'tham_gia').length,
    khongThamGia: ph.diemDanh.filter((d) => d.trangThai === 'khong_tham_gia')
      .length,
  }
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

export const seedHoiDong: HoiDong[] = [
  {
    id: 'HD-2026-001',
    maHoSo: 'HS-2026-043',
    maNhiemVu: 'RD.2026.021',
    tenDeTai: 'Nghiên cứu xây dựng nền tảng quản trị quy trình KHCN thông minh cho VHT',
    linhVucNghienCuu: ['AI', 'Quản lý KHCN', 'Process Automation'],
    phiEn: 1,
    ngayThanhLap: '2026-07-20',
    ngayHopDuKien: '2026-07-28',
    diaDiem: 'Phòng họp A3 - Tầng 3, Trụ sở VHT',
    trangThai: 'daKetThuc',
    ngayKetThuc: '2026-07-28',
    bienBanHopFile: 'BB-HĐXD-P1-HS-2026-043.pdf',
    danhSachDieuChinh: [
      'Bổ sung phân tích rủi ro kỹ thuật cho module workflow',
      'Làm rõ phương án tích hợp Camunda 8 với hệ thống VO',
      'Điều chỉnh dự toán nhân công giai đoạn triển khai',
    ],
    tomTatKetLuan:
      'Phiên 1 hoàn thành. Hội đồng thống nhất danh sách nội dung cần điều chỉnh trước khi thẩm định 4 ban và họp phiên 2.',
    diemTrungBinhHoiDong: undefined,
    thanhVien: [
      {
        id: 'TV-001',
        userId: 'EXP-009',
        hoTen: 'PGS.TS. Trịnh Đình Long',
        vaiTro: 'CHU_TICH',
        donVi: 'Ban KHCN VHT',
        hocHamHocVi: 'PGS.TS.',
        linhVucChuyenMon: ['Quản lý KHCN', 'AI', 'IoT'],
        email: 'longtd@viettel.com.vn',
        kinhNghiemNam: 20,
        trangThai: 'chapNhan',
        coMatHop: true,
      },
      {
        id: 'TV-002',
        userId: 'EXP-014',
        hoTen: 'GS.TS. Cao Minh Thắng',
        vaiTro: 'PHAN_BIEN_1',
        donVi: 'Ban CNCNC Tập đoàn',
        hocHamHocVi: 'GS.TS.',
        linhVucChuyenMon: ['AI', 'Big Data', 'Cloud Computing'],
        email: 'thangcm@viettel.com.vn',
        kinhNghiemNam: 24,
        trangThai: 'chapNhan',
        coMatHop: true,
      },
      {
        id: 'TV-003',
        userId: 'EXP-011',
        hoTen: 'ThS. Lê Thị Mai Lan',
        vaiTro: 'PHAN_BIEN_2',
        donVi: 'TP Tài chính Kế toán',
        hocHamHocVi: 'ThS.',
        linhVucChuyenMon: ['Tài chính', 'Kế toán', 'Quản lý dự án'],
        email: 'lanltm@viettel.com.vn',
        kinhNghiemNam: 14,
        trangThai: 'chapNhan',
        coMatHop: true,
      },
      {
        id: 'TV-004',
        userId: 'EXP-003',
        hoTen: 'GS.TSKH. Lê Đình Cường',
        vaiTro: 'UY_VIEN',
        donVi: 'TT Nghiên cứu Điều khiển',
        hocHamHocVi: 'GS.TSKH.',
        linhVucChuyenMon: ['Điều khiển', 'AI', 'Hệ thống nhúng'],
        email: 'cuongld@viettel.com.vn',
        kinhNghiemNam: 25,
        trangThai: 'chapNhan',
        coMatHop: true,
      },
      {
        id: 'TV-005',
        userId: 'EXP-001',
        hoTen: 'PGS.TS. Nguyễn Văn An',
        vaiTro: 'UY_VIEN',
        donVi: 'TT Nghiên cứu Vô tuyến',
        hocHamHocVi: 'PGS.TS.',
        linhVucChuyenMon: ['Vô tuyến', 'Truyền thông', 'Anten'],
        email: 'annv@viettel.com.vn',
        kinhNghiemNam: 18,
        trangThai: 'chapNhan',
        coMatHop: false,
      },
      {
        id: 'TV-006',
        userId: 'EXP-004',
        hoTen: 'TS. Phạm Minh Đức',
        vaiTro: 'UY_VIEN',
        donVi: 'TT Nghiên cứu Điều khiển',
        hocHamHocVi: 'TS.',
        linhVucChuyenMon: ['AI', 'Machine Learning', 'Điều khiển'],
        email: 'ducpm@viettel.com.vn',
        kinhNghiemNam: 10,
        trangThai: 'tuChoi',
        coMatHop: false,
        yKienDongGop: 'Lịch họp trùng với công tác triển khai dự án RD.2026.018',
      },
      {
        id: 'TV-007',
        userId: 'EXP-010',
        hoTen: 'ThS. Ngô Thanh Sơn',
        vaiTro: 'THU_KY_KH',
        donVi: 'Ban KHCN VHT',
        hocHamHocVi: 'ThS.',
        linhVucChuyenMon: ['Quản lý KHCN', 'Tiêu chuẩn'],
        email: 'sonnt@viettel.com.vn',
        kinhNghiemNam: 8,
        trangThai: 'chapNhan',
        coMatHop: true,
      },
    ],
    phienHop: [
      {
        id: 'PH-001',
        ten: 'Họp phiên 1',
        loaiPhien: 1,
        thoiGian: '2026-07-28T09:00:00',
        diaDiem: 'Phòng họp A3 - Tầng 3, Trụ sở VHT',
        trangThai: 'da_ket_thuc',
        ngayTao: '2026-07-22',
        diemDanh: [
          { thanhVienId: 'TV-001', trangThai: 'tham_gia' },
          { thanhVienId: 'TV-002', trangThai: 'tham_gia' },
          { thanhVienId: 'TV-003', trangThai: 'tham_gia' },
          { thanhVienId: 'TV-004', trangThai: 'tham_gia' },
          { thanhVienId: 'TV-005', trangThai: 'khong_tham_gia' },
          { thanhVienId: 'TV-006', trangThai: 'khong_tham_gia' },
          { thanhVienId: 'TV-007', trangThai: 'tham_gia' },
        ],
        ghiChu: 'Phiên tư vấn — thống nhất danh sách điều chỉnh.',
      },
    ],
  },
  {
    id: 'HD-2026-002',
    maHoSo: 'HS-2026-043',
    maNhiemVu: 'RD.2026.021',
    tenDeTai: 'Nghiên cứu xây dựng nền tảng quản trị quy trình KHCN thông minh cho VHT',
    linhVucNghienCuu: ['AI', 'Quản lý KHCN', 'Process Automation'],
    phiEn: 2,
    ngayThanhLap: '2026-08-05',
    ngayHopDuKien: '2026-08-15',
    diaDiem: 'Phòng họp A3 - Tầng 3, Trụ sở VHT',
    trangThai: 'dangHop',
    tienDeThamDinh: { khcn: 'DAT', tckt: 'DAT', ms: 'DAT', ns: 'DAT' },
    thanhVien: [
      {
        id: 'TV-101',
        userId: 'EXP-009',
        hoTen: 'PGS.TS. Trịnh Đình Long',
        vaiTro: 'CHU_TICH',
        donVi: 'Ban KHCN VHT',
        hocHamHocVi: 'PGS.TS.',
        linhVucChuyenMon: ['Quản lý KHCN', 'AI', 'IoT'],
        email: 'longtd@viettel.com.vn',
        kinhNghiemNam: 20,
        trangThai: 'chapNhan',
        coMatHop: true,
        diemTrungBinh: 82,
        phieuDanhGia: {
          trangThai: 'da_gui',
          diemQuyDoi: 82,
          daKySo: true,
          daDuyetBoiThuKy: true,
        },
      },
      {
        id: 'TV-102',
        userId: 'EXP-014',
        hoTen: 'GS.TS. Cao Minh Thắng',
        vaiTro: 'PHAN_BIEN_1',
        donVi: 'Ban CNCNC Tập đoàn',
        hocHamHocVi: 'GS.TS.',
        linhVucChuyenMon: ['AI', 'Big Data', 'Cloud Computing'],
        email: 'thangcm@viettel.com.vn',
        kinhNghiemNam: 24,
        trangThai: 'chapNhan',
        coMatHop: true,
        diemTrungBinh: 88,
        phieuDanhGia: {
          trangThai: 'da_gui',
          diemQuyDoi: 88,
          daKySo: true,
          daDuyetBoiThuKy: false,
        },
      },
      {
        id: 'TV-103',
        userId: 'EXP-011',
        hoTen: 'ThS. Lê Thị Mai Lan',
        vaiTro: 'PHAN_BIEN_2',
        donVi: 'TP Tài chính Kế toán',
        hocHamHocVi: 'ThS.',
        linhVucChuyenMon: ['Tài chính', 'Kế toán', 'Quản lý dự án'],
        email: 'lanltm@viettel.com.vn',
        kinhNghiemNam: 14,
        trangThai: 'chapNhan',
        coMatHop: true,
        diemTrungBinh: 75,
        phieuDanhGia: {
          trangThai: 'da_gui',
          diemQuyDoi: 75,
          daKySo: true,
          daDuyetBoiThuKy: false,
        },
      },
      {
        id: 'TV-104',
        userId: 'EXP-003',
        hoTen: 'GS.TSKH. Lê Đình Cường',
        vaiTro: 'UY_VIEN',
        donVi: 'TT Nghiên cứu Điều khiển',
        hocHamHocVi: 'GS.TSKH.',
        linhVucChuyenMon: ['Điều khiển', 'AI', 'Hệ thống nhúng'],
        email: 'cuongld@viettel.com.vn',
        kinhNghiemNam: 25,
        trangThai: 'chapNhan',
        coMatHop: true,
        diemTrungBinh: 80,
        phieuDanhGia: {
          trangThai: 'da_gui',
          diemQuyDoi: 80,
          daKySo: true,
          daDuyetBoiThuKy: false,
        },
      },
      {
        id: 'TV-105',
        userId: 'EXP-001',
        hoTen: 'PGS.TS. Nguyễn Văn An',
        vaiTro: 'UY_VIEN',
        donVi: 'TT Nghiên cứu Vô tuyến',
        hocHamHocVi: 'PGS.TS.',
        linhVucChuyenMon: ['Vô tuyến', 'Truyền thông', 'Anten'],
        email: 'annv@viettel.com.vn',
        kinhNghiemNam: 18,
        trangThai: 'chapNhan',
        coMatHop: true,
        diemTrungBinh: 78,
        phieuDanhGia: {
          trangThai: 'da_gui',
          diemQuyDoi: 78,
          daKySo: true,
          daDuyetBoiThuKy: false,
        },
      },
      {
        id: 'TV-106',
        userId: 'EXP-015',
        hoTen: 'PGS.TS. Đỗ Thu Hà',
        vaiTro: 'UY_VIEN',
        donVi: 'Ban CNCNC Tập đoàn',
        hocHamHocVi: 'PGS.TS.',
        linhVucChuyenMon: ['An ninh mạng', 'Blockchain', 'IoT'],
        email: 'hadt@viettel.com.vn',
        kinhNghiemNam: 16,
        trangThai: 'chapNhan',
        coMatHop: false,
        diemTrungBinh: undefined,
        phieuDanhGia: { trangThai: 'chua_nop', diemQuyDoi: 0, daKySo: false, daDuyetBoiThuKy: false },
      },
      {
        id: 'TV-107',
        userId: 'EXP-010',
        hoTen: 'ThS. Ngô Thanh Sơn',
        vaiTro: 'THU_KY_KH',
        donVi: 'Ban KHCN VHT',
        hocHamHocVi: 'ThS.',
        linhVucChuyenMon: ['Quản lý KHCN', 'Tiêu chuẩn'],
        email: 'sonnt@viettel.com.vn',
        kinhNghiemNam: 8,
        trangThai: 'chapNhan',
        coMatHop: true,
        diemTrungBinh: 79.5,
        phieuDanhGia: {
          trangThai: 'da_gui',
          diemQuyDoi: 79.5,
          daKySo: true,
          daDuyetBoiThuKy: true,
        },
      },
    ],
    phienHop: [
      {
        id: 'PH-002',
        ten: 'Họp phiên 2',
        loaiPhien: 2,
        thoiGian: '2026-08-15T14:00:00',
        diaDiem: 'Phòng họp A3 - Tầng 3, Trụ sở VHT',
        trangThai: 'dang_hop',
        ngayTao: '2026-08-08',
        diemDanh: [
          { thanhVienId: 'TV-101', trangThai: 'tham_gia' },
          { thanhVienId: 'TV-102', trangThai: 'tham_gia' },
          { thanhVienId: 'TV-103', trangThai: 'tham_gia' },
          { thanhVienId: 'TV-104', trangThai: 'tham_gia' },
          { thanhVienId: 'TV-105', trangThai: 'tham_gia' },
          { thanhVienId: 'TV-106', trangThai: 'tham_gia' },
          { thanhVienId: 'TV-107', trangThai: 'tham_gia' },
        ],
      },
    ],
  },
]

// Gán điểm TB HĐ phiên 2 từ seed
;(() => {
  const hd2 = seedHoiDong.find((h) => h.id === 'HD-2026-002')
  if (hd2) {
    const r = danhGiaKetQua(hd2)
    hd2.diemTrungBinhHoiDong = r.diemTB
    hd2.ketQuaDanhGia = r.ketQua
    hd2.traVeBuoc15 = r.traVeBuoc15
  }
})()

let _idCounter = 200
function nextId(prefix: string) {
  return `${prefix}-${++_idCounter}`
}

export function taoMaHoiDong(): string {
  const now = new Date()
  const y = now.getFullYear()
  const s = String(seedHoiDong.length + 1).padStart(3, '0')
  return `HD-${y}-${s}`
}

export function taoPhienHopMacDinh(
  hd: HoiDong,
  opts?: Partial<Pick<PhienHopHoiDong, 'ten' | 'loaiPhien' | 'thoiGian' | 'diaDiem'>>,
): PhienHopHoiDong {
  const loai = opts?.loaiPhien ?? hd.phiEn
  return {
    id: nextId('PH'),
    ten: opts?.ten ?? (loai === 'khac' ? 'Họp bổ sung' : `Họp phiên ${loai}`),
    loaiPhien: loai,
    thoiGian: opts?.thoiGian ?? `${hd.ngayHopDuKien}T09:00:00`,
    diaDiem: opts?.diaDiem ?? hd.diaDiem ?? '',
    trangThai: 'nhap',
    diemDanh: hd.thanhVien.map((tv) => ({
      thanhVienId: tv.id,
      trangThai: (tv.coMatHop === false
        ? 'khong_tham_gia'
        : 'tham_gia') as TrangThaiThamGiaPhien,
    })),
    ngayTao: new Date().toISOString().slice(0, 10),
  }
}

export function parseLinhVucTuDeTai(tenDeTai: string): string[] {
  const t = tenDeTai.toLowerCase()
  const linhVuc: string[] = []
  if (t.includes('ai') || t.includes('trí tuệ') || t.includes('thông minh') || t.includes('machine learning'))
    linhVuc.push('AI')
  if (t.includes('vô tuyến') || t.includes('anten') || t.includes('viba') || t.includes('rf'))
    linhVuc.push('Vô tuyến')
  if (t.includes('điều khiển') || t.includes('định vị') || t.includes('cảm biến'))
    linhVuc.push('Điều khiển')
  if (t.includes('vật liệu') || t.includes('chế tạo'))
    linhVuc.push('Vật liệu')
  if (t.includes('điện tử') || t.includes('vi điều khiển') || t.includes('mạch'))
    linhVuc.push('Điện tử')
  if (t.includes('tác chiến') || t.includes('radar') || t.includes('ew'))
    linhVuc.push('Tác chiến Điện tử')
  if (t.includes('quy trình') || t.includes('workflow') || t.includes('khcn'))
    linhVuc.push('Quản lý KHCN')
  if (t.includes('an ninh') || t.includes('bảo mật') || t.includes('mạng'))
    linhVuc.push('An ninh mạng')
  if (linhVuc.length === 0) linhVuc.push('Công nghệ thông tin')
  return linhVuc
}

export function locExpertsTheoLinhVuc(experts: ExpertProfile[], linhVucDeTai: string[]): ExpertProfile[] {
  return experts
    .map((e) => {
      const overlap = e.linhVucChuyenMon.filter((lv) =>
        linhVucDeTai.some(
          (l) => lv.toLowerCase().includes(l.toLowerCase()) || l.toLowerCase().includes(lv.toLowerCase()),
        ),
      )
      return { expert: e, score: overlap.length }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ expert }) => expert)
}

export function phanBoTheoDonVi(experts: ExpertProfile[]): ExpertProfile[] {
  const usedPerDonVi = new Map<string, number>()
  const result: ExpertProfile[] = []
  for (const e of experts) {
    const cur = usedPerDonVi.get(e.donVi) ?? 0
    if (cur < 2) {
      result.push(e)
      usedPerDonVi.set(e.donVi, cur + 1)
    }
  }
  return result
}

export function taoHoiDongMacDinh(
  maHoSo: string,
  maNhiemVu: string,
  tenDeTai: string,
  phiEn: 1 | 2,
): HoiDong {
  const linhVuc = parseLinhVucTuDeTai(tenDeTai)
  const filtered = locExpertsTheoLinhVuc(EXPERT_POOL, linhVuc)
  const diverse = phanBoTheoDonVi(filtered.length ? filtered : EXPERT_POOL)
  const sorted = [...diverse].sort((a, b) => b.kinhNghiemNam - a.kinhNghiemNam)

  const tcktExperts = sorted.filter((e) =>
    e.linhVucChuyenMon.some(
      (lv) => lv.toLowerCase().includes('tài chính') || lv.toLowerCase().includes('kế toán'),
    ),
  )
  const khcnExperts = sorted.filter(
    (e) =>
      !e.linhVucChuyenMon.some(
        (lv) => lv.toLowerCase().includes('tài chính') || lv.toLowerCase().includes('kế toán'),
      ),
  )

  const toMember = (e: ExpertProfile, vaiTro: VaiTroHoiDong): ThanhVienHoiDong => ({
    id: nextId('TV'),
    userId: e.userId,
    hoTen: e.hoTen,
    vaiTro,
    donVi: e.donVi,
    hocHamHocVi: e.hocHamHocVi,
    linhVucChuyenMon: e.linhVucChuyenMon,
    email: e.email,
    kinhNghiemNam: e.kinhNghiemNam,
    trangThai: 'duKien',
    coMatHop: false,
    phieuDanhGia: {
      trangThai: 'chua_nop',
      diemQuyDoi: 0,
      daKySo: false,
      daDuyetBoiThuKy: false,
    },
  })

  const members: ThanhVienHoiDong[] = []
  let idx = 0

  if (sorted[idx]) members.push(toMember(sorted[idx++], 'CHU_TICH'))

  const pb1 = khcnExperts.find((e) => !members.some((m) => m.userId === e.userId))
  if (pb1) members.push(toMember(pb1, 'PHAN_BIEN_1'))

  const pb2 = tcktExperts.find((e) => !members.some((m) => m.userId === e.userId))
  if (pb2) members.push(toMember(pb2, 'PHAN_BIEN_2'))

  const uyViens = sorted.filter((e) => !members.some((m) => m.userId === e.userId)).slice(0, 3)
  uyViens.forEach((e) => members.push(toMember(e, 'UY_VIEN')))

  const tkkh = sorted.find(
    (e) =>
      !members.some((m) => m.userId === e.userId) &&
      e.linhVucChuyenMon.some(
        (lv) => lv.toLowerCase().includes('quản lý') || lv.toLowerCase().includes('khcn'),
      ),
  )
  if (tkkh) members.push(toMember(tkkh, 'THU_KY_KH'))
  if (!members.some((m) => m.vaiTro === 'THU_KY_KH')) {
    const fallback = sorted.find((e) => !members.some((m) => m.userId === e.userId))
    if (fallback) members.push(toMember(fallback, 'THU_KY_KH'))
  }

  // Bổ sung UVPB còn thiếu từ pool
  for (const role of ['PHAN_BIEN_1', 'PHAN_BIEN_2'] as VaiTroHoiDong[]) {
    if (!members.some((m) => m.vaiTro === role)) {
      const fb = EXPERT_POOL.find((e) => !members.some((m) => m.userId === e.userId))
      if (fb) members.push(toMember(fb, role))
    }
  }

  const now = new Date()
  const hopDate = new Date(now)
  hopDate.setDate(hopDate.getDate() + 7)

  return {
    id: taoMaHoiDong(),
    maHoSo,
    maNhiemVu,
    tenDeTai,
    linhVucNghienCuu: linhVuc,
    phiEn,
    ngayThanhLap: now.toISOString().split('T')[0],
    ngayHopDuKien: hopDate.toISOString().split('T')[0],
    diaDiem: 'Phòng họp A3 - Tầng 3, Trụ sở VHT',
    trangThai: 'sapLap',
    thanhVien: members,
    tienDeThamDinh:
      phiEn === 2
        ? { khcn: 'DAT', tckt: 'DAT', ms: 'DAT', ns: 'DAT' }
        : undefined,
  }
}

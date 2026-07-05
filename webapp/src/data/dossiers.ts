// Hồ sơ (HoSo) — INSTANCE của MỘT luồng nghiệp vụ trên một Nhiệm vụ KHCN.
// Một NhiemVu (data/nhiemVu.ts) có N HoSo. HoSo trỏ về NV qua FK `maNV`.
// UI dùng "view join" (Dossier = HoSo + trường NV) cho tiện — xem toView().
// Tham chiếu: docs/req/data-model-NV-vs-HoSo.md.

import { chuNhiemLabel, getNhiemVu, type Cap, type GiaiDoan, type NhiemVu } from './nhiemVu'

export type StepStatus = 'done' | 'current' | 'pending' | 'rejected'
export type DossierStatus = 'processing' | 'approved' | 'rejected'

/** Loại hồ sơ theo giai đoạn (RD01→RD06). */
export type HoSoLoai = 'Chủ trương' | 'Xét duyệt' | 'Báo cáo' | 'Điều chỉnh' | 'Nghiệm thu' | 'Quyết toán'

/** Ánh xạ loại hồ sơ → giai đoạn vòng đời NV KHCN. */
export const LOAI_TO_GIAIDOAN: Record<HoSoLoai, GiaiDoan> = {
  'Chủ trương': 'chu_truong',
  'Xét duyệt': 'xet_duyet',
  'Báo cáo': 'thuc_hien',
  'Điều chỉnh': 'dieu_chinh',
  'Nghiệm thu': 'nghiem_thu',
  'Quyết toán': 'quyet_toan',
}

export interface DossierStep {
  ten: string
  vaiTro: string
  nguoi?: string
  trangThai: StepStatus
  thoiDiem?: string
  yKien?: string
  hanXuLy?: string
  formKey?: string
}

/** HoSo — bản ghi chuẩn hoá (chỉ giữ dữ liệu cấp hồ sơ + FK về NV). */
export interface HoSo {
  id: string
  /** FK → NhiemVu.ma */
  maNV: string
  loai: HoSoLoai
  quyTrinh: string
  quyTrinhTen: string
  nguoiKhoiTao: string
  ngayTao: string
  trangThai: DossierStatus
  buocHienTai: number
  steps: DossierStep[]
  taiLieu: { ten: string; loai: string }[]
}

/**
 * Dossier — VIEW join (HoSo + thông tin Nhiệm vụ). Dùng cho toàn bộ UI để không
 * phải tra NV thủ công. Lưu trữ vẫn chuẩn hoá 2 bảng (HoSo + NhiemVu).
 */
export interface Dossier extends HoSo {
  nv: NhiemVu
  maDeTai: string
  tenDeTai: string
  chuNhiem: string
  donVi: string
  duToan: string
  cap: Cap
}

export const DOSSIER_STATUS: Record<DossierStatus, { label: string; color: string }> = {
  processing: { label: 'Đang xử lý', color: 'processing' },
  approved: { label: 'Đã phê duyệt', color: 'success' },
  rejected: { label: 'Bị từ chối', color: 'error' },
}

/** Ghép HoSo với NhiemVu master → view hiển thị. */
export function toView(h: HoSo, nv: NhiemVu): Dossier {
  return {
    ...h,
    nv,
    maDeTai: nv.ma,
    tenDeTai: nv.ten,
    chuNhiem: chuNhiemLabel(nv.chuNhiem),
    donVi: nv.donViChuTri,
    duToan: nv.duToan,
    cap: nv.cap,
  }
}

/**
 * Ghép danh sách HoSo với NV (bỏ hồ sơ trỏ về NV không tồn tại).
 * `resolve` mặc định tra seed tĩnh; store truyền resolver động (NhiemVuContext)
 * để hồ sơ của NV vừa tạo cũng join được.
 */
export function joinDossiers(
  hoso: HoSo[],
  resolve: (ma: string) => NhiemVu | undefined = getNhiemVu,
): Dossier[] {
  return hoso.flatMap((h) => {
    const nv = resolve(h.maNV)
    return nv ? [toView(h, nv)] : []
  })
}

/**
 * Dựng hồ sơ Chủ trương (RD01) SINH RA CÙNG một Nhiệm vụ mới.
 * Đúng trình tự tài liệu (RD01 · "Sự kiện bắt đầu: Khởi tạo nhiệm vụ"): NV và hồ sơ
 * Chủ trương ra đời đồng thời — bước "Khởi tạo hồ sơ" đã done, chờ ký duyệt cấp TT/Khối.
 * CS → RD01.01, TĐ → RD01.02.
 */
export function createChuTruongHoSo(
  nv: NhiemVu,
  opts: { id: string; nguoiKhoiTao: string; ngayTao: string; thoiDiemKhoiTao: string; hanXuLy: string },
): HoSo {
  const isTapDoan = nv.cap === 'Tập đoàn'
  const step0: DossierStep = {
    ten: 'Khởi tạo hồ sơ',
    vaiTro: 'Chủ nhiệm đề tài (PM)',
    nguoi: opts.nguoiKhoiTao,
    trangThai: 'done',
    thoiDiem: opts.thoiDiemKhoiTao,
  }
  const step1: DossierStep = {
    ten: 'Ký duyệt cấp Trung tâm/Khối',
    vaiTro: isTapDoan ? 'BGĐ Khối' : 'BGĐ Trung tâm',
    trangThai: 'current',
    hanXuLy: opts.hanXuLy,
  }
  const rest: DossierStep[] = isTapDoan
    ? [
        { ten: 'Thẩm định Cơ quan nghiệp vụ', vaiTro: 'TP CLKHCN, TCKT, NS, GĐ TTMS', trangThai: 'pending' },
        { ten: 'Lập Báo cáo thẩm định', vaiTro: 'CQ QLKHCN', trangThai: 'pending' },
        { ten: 'Hội đồng KHCN Tập đoàn', vaiTro: 'HĐ KHCN TĐ', trangThai: 'pending' },
        { ten: 'TGĐ Tập đoàn phê duyệt Quyết định chủ trương', vaiTro: 'Tổng Giám đốc Tập đoàn', trangThai: 'pending' },
      ]
    : [
        { ten: 'Thẩm định Cơ quan nghiệp vụ', vaiTro: 'TP CLKHCN, TCKT, NS, GĐ TTMS', trangThai: 'pending' },
        { ten: 'Lập Báo cáo thẩm định', vaiTro: 'CQ QLKHCN', trangThai: 'pending' },
        { ten: 'Hội đồng KHCN phê duyệt', vaiTro: 'Hội đồng KHCN VHT', trangThai: 'pending' },
        { ten: 'TGĐ phê duyệt Quyết định chủ trương', vaiTro: 'Tổng Giám đốc VHT', trangThai: 'pending' },
      ]
  return {
    id: opts.id,
    maNV: nv.ma,
    loai: 'Chủ trương',
    quyTrinh: isTapDoan ? 'RD01.02' : 'RD01.01',
    quyTrinhTen: isTapDoan ? 'Xét duyệt Chủ trương cấp Tập đoàn' : 'Xét duyệt Chủ trương cấp Cơ sở',
    nguoiKhoiTao: opts.nguoiKhoiTao,
    ngayTao: opts.ngayTao,
    trangThai: 'processing',
    buocHienTai: 1,
    steps: [step0, step1, ...rest],
    taiLieu: [
      { ten: 'Thuyết minh đề tài.pdf', loai: 'PDF' },
      { ten: 'Dự toán PL1-PL6.xlsx', loai: 'Excel' },
    ],
  }
}

export const seedHoSo: HoSo[] = [
  {
    id: 'HS-2026-018', maNV: 'RD.2026.018', loai: 'Chủ trương',
    quyTrinh: 'RD01.01', quyTrinhTen: 'Xét duyệt Chủ trương cấp Cơ sở',
    nguoiKhoiTao: 'TS. Trần Văn Nam', ngayTao: '2026-06-20',
    trangThai: 'processing', buocHienTai: 4,
    steps: [
      { ten: 'Khởi tạo hồ sơ', vaiTro: 'Chủ nhiệm đề tài (PM)', nguoi: 'TS. Trần Văn Nam', trangThai: 'done', thoiDiem: '20/06/2026 09:12' },
      { ten: 'Ký duyệt cấp Trung tâm/Khối', vaiTro: 'BGĐ Trung tâm', nguoi: 'Đ/c Lê Minh Quang', trangThai: 'done', thoiDiem: '22/06/2026 14:30', yKien: 'Đồng ý trình xét duyệt.' },
      { ten: 'Thẩm định Cơ quan nghiệp vụ', vaiTro: 'TP CLKHCN, TCKT, NS, GĐ TTMS', nguoi: 'Phòng CLKHCN', trangThai: 'done', thoiDiem: '25/06/2026 10:05' },
      { ten: 'Lập Báo cáo thẩm định', vaiTro: 'CQ QLKHCN', nguoi: 'Đ/c Phạm Thu Hà', trangThai: 'done', thoiDiem: '27/06/2026 16:40' },
      { ten: 'Hội đồng KHCN phê duyệt', vaiTro: 'Hội đồng KHCN VHT', trangThai: 'current', hanXuLy: '05/07/2026' },
      { ten: 'TGĐ phê duyệt Quyết định chủ trương', vaiTro: 'Tổng Giám đốc VHT', trangThai: 'pending' },
    ],
    taiLieu: [
      { ten: 'Thuyết minh đề tài.pdf', loai: 'PDF' },
      { ten: 'Dự toán PL1-PL6.xlsx', loai: 'Excel' },
      { ten: 'Phiếu nhận xét CQNV.pdf', loai: 'PDF' },
    ],
  },
  {
    id: 'HS-2026-012', maNV: 'RD.2026.012', loai: 'Xét duyệt',
    quyTrinh: 'RD02.01', quyTrinhTen: 'Xét duyệt NV KHCN cấp Cơ sở',
    nguoiKhoiTao: 'ThS. Nguyễn Thị Lan', ngayTao: '2026-05-30',
    trangThai: 'approved', buocHienTai: 4,
    steps: [
      { ten: 'Khởi tạo hồ sơ', vaiTro: 'Chủ nhiệm đề tài (PM)', nguoi: 'ThS. Nguyễn Thị Lan', trangThai: 'done', thoiDiem: '30/05/2026 08:20' },
      { ten: 'Chuyên quản thẩm định (Đạt/Chưa đạt)', vaiTro: 'CQ KHCN/MS/NS/TCKT', nguoi: 'Các chuyên quản', trangThai: 'done', thoiDiem: '03/06/2026 11:00' },
      { ten: 'Hội đồng Xét duyệt (phiên 1 & 2)', vaiTro: 'HĐXD cấp Cơ sở', nguoi: 'HĐXD', trangThai: 'done', thoiDiem: '10/06/2026 15:30' },
      { ten: 'Hội đồng KHCN phê duyệt', vaiTro: 'Hội đồng KHCN VHT', nguoi: 'HĐ KHCN', trangThai: 'done', thoiDiem: '14/06/2026 09:45' },
      { ten: 'TGĐ phê duyệt mở mới đề tài', vaiTro: 'Tổng Giám đốc VHT', nguoi: 'TGĐ', trangThai: 'done', thoiDiem: '16/06/2026 10:00', yKien: 'Phê duyệt mở mới.' },
    ],
    taiLieu: [
      { ten: 'Hồ sơ xét duyệt.pdf', loai: 'PDF' },
      { ten: 'Biên bản họp HĐXD.pdf', loai: 'PDF' },
    ],
  },
  {
    // Hồ sơ thứ 2 của CÙNG nhiệm vụ RD.2026.012 (minh hoạ 1 NV → N Hồ sơ):
    // đề tài đã xét duyệt xong, nay bước sang nghiệm thu.
    id: 'HS-2026-035', maNV: 'RD.2026.012', loai: 'Nghiệm thu',
    quyTrinh: 'RD05.01', quyTrinhTen: 'Nghiệm thu NV KHCN cấp Cơ sở',
    nguoiKhoiTao: 'ThS. Nguyễn Thị Lan', ngayTao: '2026-06-28',
    trangThai: 'processing', buocHienTai: 2,
    steps: [
      { ten: 'Khởi tạo hồ sơ nghiệm thu', vaiTro: 'Chủ nhiệm đề tài (PM)', nguoi: 'ThS. Nguyễn Thị Lan', trangThai: 'done', thoiDiem: '28/06/2026 09:00' },
      { ten: 'Thẩm định chuyên quản', vaiTro: 'CQ KHCN/MS/NS/TCKT', nguoi: 'Các chuyên quản', trangThai: 'done', thoiDiem: '01/07/2026 10:00' },
      { ten: 'Hội đồng Nghiệm thu đánh giá', vaiTro: 'HĐ Nghiệm thu cấp CS', trangThai: 'current', hanXuLy: '08/07/2026' },
      { ten: 'TGĐ công nhận kết quả', vaiTro: 'Tổng Giám đốc VHT', trangThai: 'pending' },
    ],
    taiLieu: [{ ten: 'Báo cáo tổng kết đề tài.pdf', loai: 'PDF' }],
  },
  {
    id: 'HS-2026-021', maNV: 'RD.2026.021', loai: 'Chủ trương',
    quyTrinh: 'RD01.02', quyTrinhTen: 'Xét duyệt Chủ trương cấp Tập đoàn',
    nguoiKhoiTao: 'TS. Hoàng Đức Anh', ngayTao: '2026-06-18',
    trangThai: 'rejected', buocHienTai: 2,
    steps: [
      { ten: 'Khởi tạo hồ sơ', vaiTro: 'Chủ nhiệm đề tài (PM)', nguoi: 'TS. Hoàng Đức Anh', trangThai: 'done', thoiDiem: '18/06/2026 08:00' },
      { ten: 'Ký duyệt cấp Trung tâm/Khối', vaiTro: 'BGĐ Khối', nguoi: 'Đ/c Vũ Thành Long', trangThai: 'done', thoiDiem: '19/06/2026 13:20' },
      { ten: 'Thẩm định Cơ quan nghiệp vụ', vaiTro: 'TP CLKHCN, TCKT', nguoi: 'Phòng TCKT', trangThai: 'rejected', thoiDiem: '21/06/2026 09:10', yKien: 'Dự toán chưa phù hợp, đề nghị điều chỉnh PL2 và làm rõ nguồn vốn.' },
      { ten: 'Lập Báo cáo thẩm định', vaiTro: 'CQ QLKHCN', trangThai: 'pending' },
      { ten: 'Hội đồng KHCN Tập đoàn', vaiTro: 'HĐ KHCN TĐ', trangThai: 'pending' },
      { ten: 'TGĐ Tập đoàn phê duyệt', vaiTro: 'Tổng Giám đốc Tập đoàn', trangThai: 'pending' },
    ],
    taiLieu: [{ ten: 'Thuyết minh đề tài.pdf', loai: 'PDF' }],
  },
  {
    id: 'HS-2026-009', maNV: 'RD.2026.009', loai: 'Nghiệm thu',
    quyTrinh: 'RD05.01', quyTrinhTen: 'Nghiệm thu NV KHCN cấp Cơ sở',
    nguoiKhoiTao: 'KS. Đỗ Quốc Bảo', ngayTao: '2026-06-10',
    trangThai: 'processing', buocHienTai: 3,
    steps: [
      { ten: 'Khởi tạo hồ sơ nghiệm thu', vaiTro: 'Chủ nhiệm đề tài (PM)', nguoi: 'KS. Đỗ Quốc Bảo', trangThai: 'done', thoiDiem: '10/06/2026 09:00' },
      { ten: 'Thẩm định chuyên quản', vaiTro: 'CQ KHCN/MS/NS/TCKT', nguoi: 'Các chuyên quản', trangThai: 'done', thoiDiem: '13/06/2026 14:00' },
      { ten: 'QĐ thành lập Hội đồng Nghiệm thu', vaiTro: 'CQ QLKHCN', nguoi: 'Đ/c Phạm Thu Hà', trangThai: 'done', thoiDiem: '18/06/2026 10:30' },
      { ten: 'Hội đồng Nghiệm thu đánh giá', vaiTro: 'HĐ Nghiệm thu cấp CS', trangThai: 'current', hanXuLy: '01/07/2026' },
      { ten: 'TGĐ công nhận kết quả', vaiTro: 'Tổng Giám đốc VHT', trangThai: 'pending' },
    ],
    taiLieu: [
      { ten: 'Báo cáo tổng kết đề tài.pdf', loai: 'PDF' },
      { ten: 'Sản phẩm & kết quả.zip', loai: 'Archive' },
    ],
  },
  {
    id: 'HS-2026-025', maNV: 'RD.2026.025', loai: 'Xét duyệt',
    quyTrinh: 'RD02.01', quyTrinhTen: 'Xét duyệt NV KHCN cấp Cơ sở',
    nguoiKhoiTao: 'TS. Phan Anh Tuấn', ngayTao: '2026-06-24',
    trangThai: 'processing', buocHienTai: 1,
    steps: [
      { ten: 'Khởi tạo hồ sơ', vaiTro: 'Chủ nhiệm đề tài (PM)', nguoi: 'TS. Phan Anh Tuấn', trangThai: 'done', thoiDiem: '24/06/2026 08:40' },
      { ten: 'Chuyên quản thẩm định (Đạt/Chưa đạt)', vaiTro: 'CQ KHCN/MS/NS/TCKT', trangThai: 'current', hanXuLy: '30/06/2026' },
      { ten: 'Hội đồng Xét duyệt (phiên 1 & 2)', vaiTro: 'HĐXD cấp Cơ sở', trangThai: 'pending' },
      { ten: 'Hội đồng KHCN phê duyệt', vaiTro: 'Hội đồng KHCN VHT', trangThai: 'pending' },
      { ten: 'TGĐ phê duyệt mở mới đề tài', vaiTro: 'Tổng Giám đốc VHT', trangThai: 'pending' },
    ],
    taiLieu: [{ ten: 'Hồ sơ xét duyệt.pdf', loai: 'PDF' }, { ten: 'Dự toán PL1-PL6.xlsx', loai: 'Excel' }],
  },
  {
    id: 'HS-2026-027', maNV: 'RD.2026.027', loai: 'Chủ trương',
    quyTrinh: 'RD01.01', quyTrinhTen: 'Xét duyệt Chủ trương cấp Cơ sở',
    nguoiKhoiTao: 'ThS. Bùi Quang Huy', ngayTao: '2026-06-29',
    trangThai: 'processing', buocHienTai: 1,
    steps: [
      { ten: 'Khởi tạo hồ sơ', vaiTro: 'Chủ nhiệm đề tài (PM)', nguoi: 'ThS. Bùi Quang Huy', trangThai: 'done', thoiDiem: '29/06/2026 15:10' },
      { ten: 'Ký duyệt cấp Trung tâm/Khối', vaiTro: 'BGĐ Trung tâm', trangThai: 'current', hanXuLy: '08/07/2026' },
      { ten: 'Thẩm định Cơ quan nghiệp vụ', vaiTro: 'TP CLKHCN, TCKT, NS, GĐ TTMS', trangThai: 'pending' },
      { ten: 'Lập Báo cáo thẩm định', vaiTro: 'CQ QLKHCN', trangThai: 'pending' },
      { ten: 'Hội đồng KHCN phê duyệt', vaiTro: 'Hội đồng KHCN VHT', trangThai: 'pending' },
      { ten: 'TGĐ phê duyệt Quyết định chủ trương', vaiTro: 'Tổng Giám đốc VHT', trangThai: 'pending' },
    ],
    taiLieu: [{ ten: 'Thuyết minh đề tài.pdf', loai: 'PDF' }],
  },
  {
    id: 'HS-2026-030', maNV: 'RD.2026.030', loai: 'Nghiệm thu',
    quyTrinh: 'RD05.02', quyTrinhTen: 'Nghiệm thu NV KHCN cấp Tập đoàn',
    nguoiKhoiTao: 'TS. Ngô Việt Hà', ngayTao: '2026-06-08',
    trangThai: 'processing', buocHienTai: 3,
    steps: [
      { ten: 'Khởi tạo hồ sơ nghiệm thu', vaiTro: 'Chủ nhiệm đề tài (PM)', nguoi: 'TS. Ngô Việt Hà', trangThai: 'done', thoiDiem: '08/06/2026 09:00' },
      { ten: 'Thẩm định chuyên quản', vaiTro: 'CQ KHCN/MS/NS/TCKT', nguoi: 'Các chuyên quản', trangThai: 'done', thoiDiem: '14/06/2026 10:00' },
      { ten: 'QĐ TL HĐNT + CV đề nghị nghiệm thu cấp TĐ', vaiTro: 'CQ QLKHCN', nguoi: 'Đ/c Phạm Thu Hà', trangThai: 'done', thoiDiem: '22/06/2026 11:20' },
      { ten: 'Hội đồng Nghiệm thu Tập đoàn (có Tổ KT)', vaiTro: 'HĐ Nghiệm thu Tập đoàn', trangThai: 'current', hanXuLy: '04/07/2026' },
      { ten: 'BTGĐ Tập đoàn công nhận kết quả', vaiTro: 'BTGĐ Tập đoàn', trangThai: 'pending' },
    ],
    taiLieu: [{ ten: 'Báo cáo tổng kết đề tài.pdf', loai: 'PDF' }, { ten: 'Biên bản Tổ KT.pdf', loai: 'PDF' }],
  },
]

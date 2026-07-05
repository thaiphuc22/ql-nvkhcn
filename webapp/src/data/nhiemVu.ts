// Nhiệm vụ KHCN (NV KHCN) — thực thể MASTER, xuyên suốt vòng đời đề tài.
// Một NhiemVu có N HoSo (xem data/dossiers.ts). Khóa ổn định = `ma` (Mã NV KHCN).
// Tham chiếu: docs/req/data-model-NV-vs-HoSo.md (mục 3 — trường master).

export type Cap = 'Cơ sở' | 'Tập đoàn'

/** Chủ nhiệm đề tài (PM) — theo bảng "Thông tin PM" mục 3 của tài liệu. */
export interface ChuNhiem {
  hoTen: string
  hocHamHocVi?: string
  maNhanVien?: string
  email?: string
  sdt?: string
  donViCongTac?: string
}

/** Giai đoạn vòng đời của NV KHCN (RD01→RD06). */
export type GiaiDoan =
  | 'chu_truong'
  | 'xet_duyet'
  | 'thuc_hien'
  | 'dieu_chinh'
  | 'nghiem_thu'
  | 'quyet_toan'

export const GIAI_DOAN: Record<GiaiDoan, string> = {
  chu_truong: 'Chủ trương',
  xet_duyet: 'Xét duyệt',
  thuc_hien: 'Thực hiện',
  dieu_chinh: 'Điều chỉnh',
  nghiem_thu: 'Nghiệm thu',
  quyet_toan: 'Quyết toán',
}

/** Thứ tự vòng đời NV KHCN (chủ trương → quyết toán). */
export const GIAI_DOAN_ORDER: GiaiDoan[] = [
  'chu_truong',
  'xet_duyet',
  'thuc_hien',
  'dieu_chinh',
  'nghiem_thu',
  'quyet_toan',
]

export const GIAI_DOAN_COLOR: Record<GiaiDoan, string> = {
  chu_truong: 'blue',
  xet_duyet: 'geekblue',
  thuc_hien: 'gold',
  dieu_chinh: 'orange',
  nghiem_thu: 'green',
  quyet_toan: 'purple',
}

export interface NhiemVu {
  /** Mã NV KHCN — khóa master, đồng bộ với NS/MS/SAP/QLTS/PLM. */
  ma: string
  ten: string
  cap: Cap
  chuNhiem: ChuNhiem
  donViChuTri: string
  thoiGianThucHien: string
  /** Dự toán tổng (PL1–PL6). */
  duToan: string
  giaiDoan: GiaiDoan
}

export const seedNhiemVu: NhiemVu[] = [
  {
    ma: 'RD.2026.018',
    ten: 'Nghiên cứu, chế tạo module thu phát VHF băng rộng',
    cap: 'Cơ sở',
    chuNhiem: { hoTen: 'Trần Văn Nam', hocHamHocVi: 'TS.', maNhanVien: 'VHT0182', email: 'namtv@viettel.com.vn', donViCongTac: 'TT Nghiên cứu Vô tuyến' },
    donViChuTri: 'TT Nghiên cứu Vô tuyến',
    thoiGianThucHien: '01/2026 – 12/2027',
    duToan: '4.850.000.000 đ',
    giaiDoan: 'chu_truong',
  },
  {
    ma: 'RD.2026.012',
    ten: 'Phát triển thuật toán định vị đa cảm biến',
    cap: 'Cơ sở',
    chuNhiem: { hoTen: 'Nguyễn Thị Lan', hocHamHocVi: 'ThS.', maNhanVien: 'VHT0121', email: 'lannt@viettel.com.vn', donViCongTac: 'TT Nghiên cứu Điều khiển' },
    donViChuTri: 'TT Nghiên cứu Điều khiển',
    thoiGianThucHien: '06/2025 – 06/2026',
    duToan: '2.300.000.000 đ',
    giaiDoan: 'nghiem_thu',
  },
  {
    ma: 'RD.2026.021',
    ten: 'Nghiên cứu vật liệu hấp thụ sóng radar',
    cap: 'Tập đoàn',
    chuNhiem: { hoTen: 'Hoàng Đức Anh', hocHamHocVi: 'TS.', maNhanVien: 'VHT0210', email: 'anhhd@viettel.com.vn', donViCongTac: 'TT Nghiên cứu Vật liệu' },
    donViChuTri: 'TT Nghiên cứu Vật liệu',
    thoiGianThucHien: '01/2026 – 12/2028',
    duToan: '12.500.000.000 đ',
    giaiDoan: 'chu_truong',
  },
  {
    ma: 'RD.2026.009',
    ten: 'Chế tạo thử nghiệm ăng-ten mảng pha',
    cap: 'Cơ sở',
    chuNhiem: { hoTen: 'Đỗ Quốc Bảo', hocHamHocVi: 'KS.', maNhanVien: 'VHT0093', email: 'baodq@viettel.com.vn', donViCongTac: 'TT Nghiên cứu Vô tuyến' },
    donViChuTri: 'TT Nghiên cứu Vô tuyến',
    thoiGianThucHien: '01/2025 – 06/2026',
    duToan: '3.100.000.000 đ',
    giaiDoan: 'nghiem_thu',
  },
  {
    ma: 'RD.2026.025',
    ten: 'Nghiên cứu hệ thống tác chiến điện tử thế hệ mới',
    cap: 'Cơ sở',
    chuNhiem: { hoTen: 'Phan Anh Tuấn', hocHamHocVi: 'TS.', maNhanVien: 'VHT0251', email: 'tuanpa@viettel.com.vn', donViCongTac: 'TT Nghiên cứu Tác chiến ĐT' },
    donViChuTri: 'TT Nghiên cứu Tác chiến ĐT',
    thoiGianThucHien: '06/2026 – 12/2028',
    duToan: '6.700.000.000 đ',
    giaiDoan: 'xet_duyet',
  },
  {
    ma: 'RD.2026.027',
    ten: 'Phát triển phần mềm mô phỏng quỹ đạo bay',
    cap: 'Cơ sở',
    chuNhiem: { hoTen: 'Bùi Quang Huy', hocHamHocVi: 'ThS.', maNhanVien: 'VHT0272', email: 'huybq@viettel.com.vn', donViCongTac: 'TT Nghiên cứu Điều khiển' },
    donViChuTri: 'TT Nghiên cứu Điều khiển',
    thoiGianThucHien: '07/2026 – 06/2027',
    duToan: '1.900.000.000 đ',
    giaiDoan: 'chu_truong',
  },
  {
    ma: 'RD.2026.030',
    ten: 'Chế tạo bộ nguồn công suất lớn cho radar',
    cap: 'Tập đoàn',
    chuNhiem: { hoTen: 'Ngô Việt Hà', hocHamHocVi: 'TS.', maNhanVien: 'VHT0301', email: 'hanv@viettel.com.vn', donViCongTac: 'TT Nghiên cứu Vô tuyến' },
    donViChuTri: 'TT Nghiên cứu Vô tuyến',
    thoiGianThucHien: '01/2025 – 06/2026',
    duToan: '9.200.000.000 đ',
    giaiDoan: 'nghiem_thu',
  },
]

const byMa = new Map(seedNhiemVu.map((n) => [n.ma, n]))
export function getNhiemVu(ma: string): NhiemVu | undefined {
  return byMa.get(ma)
}
/** Tên hiển thị chủ nhiệm: "TS. Trần Văn Nam". */
export function chuNhiemLabel(c: ChuNhiem): string {
  return c.hocHamHocVi ? `${c.hocHamHocVi} ${c.hoTen}` : c.hoTen
}

/**
 * Sinh Mã NV KHCN kế tiếp theo định dạng `RD.<year>.<seq3>` (vd RD.2026.031).
 * seq = max seq hiện có + 1. `seq` trả kèm để đặt mã hồ sơ tương ứng (HS-<year>-<seq3>).
 *
 * ⚠️ Quy tắc sinh mã NV thực tế còn là GAP (mã tạm khi khởi tạo Chủ trương vs mã
 * chính thức sau khi Chủ trương được duyệt) — xem docs/req/data-model-NV-vs-HoSo.md.
 */
export function nextNhiemVuMa(existing: NhiemVu[], year = 2026): { ma: string; seq: number } {
  let max = 0
  for (const n of existing) {
    const m = /RD\.\d{4}\.(\d+)/.exec(n.ma)
    if (m) max = Math.max(max, parseInt(m[1], 10))
  }
  const seq = max + 1
  return { ma: `RD.${year}.${String(seq).padStart(3, '0')}`, seq }
}

/** RD07 — Quản lý Danh mục Dịch vụ, Sản phẩm Nghiên cứu (SPDV).
 * Bám sơ đồ BPMN: 4 tuyến · 7 bước · timer ngày 20 tháng cuối Quý N · gateway đủ/không đủ căn cứ.
 */

export type TuyenSpdv =
  | 'QLDM_SPDV' // Đơn vị Quản lý Danh mục SPDV
  | 'TT_KD_VHT' // TT KD VHT
  | 'TTNCSP' // TTNCSP
  | 'P_TCKT_VHT' // P.TCKT VHT

export const TUYEN_SPDV_LABEL: Record<TuyenSpdv, string> = {
  QLDM_SPDV: 'Đơn vị Quản lý Danh mục SPDV',
  TT_KD_VHT: 'TT KD VHT',
  TTNCSP: 'TTNCSP',
  P_TCKT_VHT: 'P.TCKT VHT',
}

/** Trạng thái vòng đời danh mục SPDV (REQ-RD07-B-001) */
export type VongDoiSpdv = 'nghien_cuu' | 'nghiem_thu' | 'kinh_doanh' | 'cai_tien'

export const VONG_DOI_SPDV_LABEL: Record<VongDoiSpdv, string> = {
  nghien_cuu: 'Nghiên cứu',
  nghiem_thu: 'Nghiệm thu',
  kinh_doanh: 'Kinh doanh',
  cai_tien: 'Cải tiến',
}

export type TrangThaiSpdv =
  | 'draft_dau_nam'
  | 'cho_cap_nhat_quy'
  | 'dang_cap_nhat_song_song'
  | 'cho_tong_hop'
  | 'khong_du_can_cu'
  | 'da_cap_nhat_quy'
  | 'ngung'

export const TRANG_THAI_SPDV_LABEL: Record<TrangThaiSpdv, string> = {
  draft_dau_nam: 'Nháp đầu năm',
  cho_cap_nhat_quy: 'Chờ cập nhật quý',
  dang_cap_nhat_song_song: 'Đang cập nhật song song',
  cho_tong_hop: 'Chờ tổng hợp / xác thực',
  khong_du_can_cu: 'Không đủ căn cứ',
  da_cap_nhat_quy: 'Đã cập nhật Quý N',
  ngung: 'Ngừng dùng',
}

export const TRANG_THAI_SPDV_COLOR: Record<TrangThaiSpdv, string> = {
  draft_dau_nam: 'default',
  cho_cap_nhat_quy: 'gold',
  dang_cap_nhat_song_song: 'processing',
  cho_tong_hop: 'blue',
  khong_du_can_cu: 'error',
  da_cap_nhat_quy: 'success',
  ngung: 'warning',
}

/** Bước 1–7 trên sơ đồ RD07 */
export type BuocRd07 = 1 | 2 | 3 | 4 | 5 | 6 | 7

export const BUOC_RD07: {
  buoc: BuocRd07
  tuyen: TuyenSpdv
  ten: string
  trigger?: string
}[] = [
  {
    buoc: 1,
    tuyen: 'QLDM_SPDV',
    ten: 'Cập nhật danh mục SPDV và trạng thái SPDV đầu năm',
    trigger: 'Sau khi KHN được phê duyệt / Hoặc khi có chỉ đạo của BTGĐ',
  },
  {
    buoc: 2,
    tuyen: 'QLDM_SPDV',
    ten: 'Gửi yêu cầu cập nhật thông tin trong danh mục SPDV',
    trigger: 'Ngày 20 tháng cuối của Quý N (timer)',
  },
  {
    buoc: 3,
    tuyen: 'TT_KD_VHT',
    ten: 'Cập nhật thay đổi trong danh mục SPDV kinh doanh của TCT',
  },
  {
    buoc: 4,
    tuyen: 'TTNCSP',
    ten: 'Cập nhật thay đổi trong danh mục SPDV NCPT',
  },
  {
    buoc: 5,
    tuyen: 'P_TCKT_VHT',
    ten: 'Cập nhật thông tin về doanh thu, chi phí, lợi nhuận cho SPDV',
  },
  {
    buoc: 6,
    tuyen: 'QLDM_SPDV',
    ten: 'Tổng hợp thông tin và xác thực các căn cứ điều chỉnh',
  },
  {
    buoc: 7,
    tuyen: 'QLDM_SPDV',
    ten: 'Cập nhật vào Danh mục SPDV tại Quý N',
  },
]

/** Trạng thái sản phẩm (master) — nghiên cứu / thử nghiệm / kinh doanh… */
export type TrangThaiSanPhamSpdv = 'nghien_cuu' | 'thu_nghiem' | 'kinh_doanh'

export const TRANG_THAI_SAN_PHAM_SPDV_LABEL: Record<TrangThaiSanPhamSpdv, string> = {
  nghien_cuu: 'Nghiên cứu',
  thu_nghiem: 'Thử nghiệm',
  kinh_doanh: 'Kinh doanh',
}

/** Lĩnh vực SPDV (danh mục mẫu) */
export const LINH_VUC_SPDV_OPTIONS = [
  'Radar & Cảm biến',
  'Thông tin & Truyền thông',
  'AI & Dữ liệu',
  'Phần mềm hệ thống',
  'Cơ khí chính xác',
  'An ninh mạng',
] as const

/** Nhóm/Dòng SPDV (danh mục mẫu) */
export const NHOM_DONG_SPDV_OPTIONS = [
  'Dòng Radar đa chức năng',
  'Dòng thiết bị thông tin',
  'Dòng AI nhận dạng',
  'Dịch vụ bảo trì / hỗ trợ',
  'Nền tảng dữ liệu / lab',
  'Giải pháp tích hợp',
] as const

export interface SpdvItem {
  id: string
  ma: string
  ten: string
  /** Lĩnh vực của SPDV */
  linhVuc?: string
  /** Nhóm/Dòng SPDV */
  nhomDong?: string
  /** Công nghệ lõi liên quan (mã) */
  congNgheLoi?: string[]
  /** Tài sản SHTT liên quan (mã) */
  taiSanShtt?: string[]
  /** Trạng thái sản phẩm (nghiên cứu, thử nghiệm, kinh doanh…) */
  trangThaiSanPham?: TrangThaiSanPhamSpdv
  /** Khách hàng — dùng khi SPDV kinh doanh */
  khachHang?: string
  /** Kinh doanh TCT | NCPT | dùng chung */
  phanLoai: 'SPDV_KD' | 'SPDV_NCPT' | 'SPDV_CHUNG'
  vongDoi: VongDoiSpdv
  trangThai: TrangThaiSpdv
  /** Quý đang áp dụng, ví dụ 2026-Q2 */
  quyHienHanh: string
  doanhThu?: number
  chiPhi?: number
  loiNhuan?: number
  maNVLienQuan?: string
  updatedAt: string
  updatedByTuyen?: TuyenSpdv
  canCuDieuChinh?: string
  history: { at: string; actor: string; action: string; buoc?: BuocRd07 }[]
}

export interface KyCapNhatSpdv {
  id: string
  quy: string
  /** Bước hiện tại của kỳ (sau parallel thì 6) */
  buocHienTai: BuocRd07
  trangThaiKy:
    | 'khoi_tao_dau_nam'
    | 'da_gui_yeu_cau'
    | 'cho_3_tuyen'
    | 'dang_tong_hop'
    | 'ket_thuc_khong_du_can_cu'
    | 'da_cap_nhat_db'
  /** Hoàn thành song song bước 3/4/5 */
  ttKdXong: boolean
  ttncspXong: boolean
  tcktXong: boolean
  duCanCu?: boolean | null
  lyDoKhongDuCanCu?: string
  startedAt: string
  closedAt?: string
}

export const seedKyCapNhatSpdv: KyCapNhatSpdv = {
  id: 'KY-2026-Q2',
  quy: '2026-Q2',
  buocHienTai: 6,
  trangThaiKy: 'dang_tong_hop',
  ttKdXong: true,
  ttncspXong: true,
  tcktXong: true,
  duCanCu: null,
  startedAt: '20/06/2026',
}

export const seedSpdvCatalog: SpdvItem[] = [
  {
    id: 'SPDV001',
    ma: 'SPDV.KD.001',
    ten: 'Dịch vụ phân tích tín hiệu radar',
    linhVuc: 'Radar & Cảm biến',
    nhomDong: 'Dòng Radar đa chức năng',
    congNgheLoi: ['CN.2026.001'],
    taiSanShtt: ['SHTT.2026.001'],
    trangThaiSanPham: 'kinh_doanh',
    khachHang: 'Vùng 4 / Khối quốc phòng',
    phanLoai: 'SPDV_KD',
    vongDoi: 'kinh_doanh',
    trangThai: 'cho_tong_hop',
    quyHienHanh: '2026-Q2',
    doanhThu: 12_500_000_000,
    chiPhi: 8_200_000_000,
    loiNhuan: 4_300_000_000,
    maNVLienQuan: 'RD.2026.018',
    updatedAt: '22/06/2026',
    updatedByTuyen: 'TT_KD_VHT',
    canCuDieuChinh: 'Báo cáo doanh thu Q2 từ CRM',
    history: [
      { at: '05/01/2026', actor: 'QLDM SPDV', action: 'Cập nhật đầu năm', buoc: 1 },
      { at: '20/06/2026', actor: 'QLDM SPDV', action: 'Gửi yêu cầu cập nhật quý', buoc: 2 },
      { at: '22/06/2026', actor: 'TT KD VHT', action: 'Cập nhật SPDV kinh doanh TCT', buoc: 3 },
    ],
  },
  {
    id: 'SPDV002',
    ma: 'SPDV.NC.014',
    ten: 'Module AI nhận dạng mục tiêu',
    linhVuc: 'AI & Dữ liệu',
    nhomDong: 'Dòng AI nhận dạng',
    congNgheLoi: ['CN.2026.003'],
    taiSanShtt: [],
    trangThaiSanPham: 'nghien_cuu',
    phanLoai: 'SPDV_NCPT',
    vongDoi: 'nghien_cuu',
    trangThai: 'dang_cap_nhat_song_song',
    quyHienHanh: '2026-Q2',
    maNVLienQuan: 'RD.2026.012',
    updatedAt: '21/06/2026',
    updatedByTuyen: 'TTNCSP',
    history: [
      { at: '05/01/2026', actor: 'QLDM SPDV', action: 'Cập nhật đầu năm', buoc: 1 },
      { at: '20/06/2026', actor: 'QLDM SPDV', action: 'Gửi yêu cầu cập nhật quý', buoc: 2 },
      { at: '21/06/2026', actor: 'TTNCSP', action: 'Cập nhật SPDV NCPT', buoc: 4 },
    ],
  },
  {
    id: 'SPDV003',
    ma: 'SPDV.KD.008',
    ten: 'Gói bảo trì thiết bị thông tin',
    linhVuc: 'Thông tin & Truyền thông',
    nhomDong: 'Dịch vụ bảo trì / hỗ trợ',
    congNgheLoi: ['CN.2026.002'],
    taiSanShtt: ['SHTT.2026.002'],
    trangThaiSanPham: 'kinh_doanh',
    khachHang: 'Các đơn vị thành viên TCT',
    phanLoai: 'SPDV_KD',
    vongDoi: 'cai_tien',
    trangThai: 'cho_tong_hop',
    quyHienHanh: '2026-Q2',
    doanhThu: 3_100_000_000,
    chiPhi: 2_400_000_000,
    loiNhuan: 700_000_000,
    updatedAt: '23/06/2026',
    updatedByTuyen: 'P_TCKT_VHT',
    canCuDieuChinh: 'Bảng DT-CP-LN quý 2',
    history: [
      { at: '05/01/2026', actor: 'QLDM SPDV', action: 'Cập nhật đầu năm', buoc: 1 },
      { at: '20/06/2026', actor: 'QLDM SPDV', action: 'Gửi yêu cầu cập nhật quý', buoc: 2 },
      { at: '23/06/2026', actor: 'P.TCKT VHT', action: 'Cập nhật DT/CP/LN', buoc: 5 },
    ],
  },
  {
    id: 'SPDV004',
    ma: 'SPDV.NC.003',
    ten: 'Nền tảng dữ liệu thử nghiệm lab',
    linhVuc: 'AI & Dữ liệu',
    nhomDong: 'Nền tảng dữ liệu / lab',
    congNgheLoi: ['CN.2026.003'],
    taiSanShtt: ['SHTT.2026.003'],
    trangThaiSanPham: 'thu_nghiem',
    phanLoai: 'SPDV_NCPT',
    vongDoi: 'nghiem_thu',
    trangThai: 'da_cap_nhat_quy',
    quyHienHanh: '2026-Q1',
    doanhThu: 0,
    chiPhi: 1_200_000_000,
    loiNhuan: -1_200_000_000,
    maNVLienQuan: 'RD.2026.021',
    updatedAt: '31/03/2026',
    updatedByTuyen: 'QLDM_SPDV',
    history: [
      { at: '05/01/2026', actor: 'QLDM SPDV', action: 'Cập nhật đầu năm', buoc: 1 },
      { at: '31/03/2026', actor: 'QLDM SPDV', action: 'Cập nhật DM SPDV Quý 1', buoc: 7 },
    ],
  },
]

export function nextSpdvId(list: SpdvItem[]): string {
  const max = list.reduce((acc, x) => {
    const n = Number(/^SPDV(\d+)$/i.exec(x.id)?.[1] ?? 0)
    return Math.max(acc, n)
  }, 0)
  return `SPDV${String(max + 1).padStart(3, '0')}`
}

export function nextSpdvMa(list: SpdvItem[], trangThaiSanPham: TrangThaiSanPhamSpdv): string {
  const prefix = trangThaiSanPham === 'kinh_doanh' ? 'SPDV.KD' : 'SPDV.NC'
  const max = list.reduce((acc, x) => {
    const n = Number(new RegExp(`^${prefix.replace('.', '\\.')}\\.(\\d+)$`, 'i').exec(x.ma)?.[1] ?? 0)
    return Math.max(acc, n)
  }, 0)
  return `${prefix}.${String(max + 1).padStart(3, '0')}`
}

export const PHAN_LOAI_SPDV_LABEL: Record<SpdvItem['phanLoai'], string> = {
  SPDV_KD: 'SPDV kinh doanh (TCT)',
  SPDV_NCPT: 'SPDV NCPT',
  SPDV_CHUNG: 'Dùng chung',
}

export function formatVnd(n?: number): string {
  if (n == null) return '—'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
}

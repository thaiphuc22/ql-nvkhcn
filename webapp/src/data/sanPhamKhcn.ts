/** Sản phẩm KHCN — mock domain cho Quản trị nhiệm vụ KHCN (sản phẩm, SHTT, công bố, công nghệ lõi). */

export type TrangThaiSP = 'draft' | 'active' | 'submitted' | 'approved' | 'inactive' | 'deleted'

export const TRANG_THAI_SP_LABEL: Record<TrangThaiSP, string> = {
  draft: 'Nháp',
  active: 'Đang sử dụng',
  submitted: 'Đã trình duyệt',
  approved: 'Đã duyệt',
  inactive: 'Ngừng sử dụng',
  deleted: 'Đã xóa',
}

export const TRANG_THAI_SP_COLOR: Record<TrangThaiSP, string> = {
  draft: 'default',
  active: 'processing',
  submitted: 'gold',
  approved: 'success',
  inactive: 'warning',
  deleted: 'error',
}

export interface HistoryEntry {
  at: string
  actor: string
  action: string
  note?: string
}

export interface SanPhamNghienCuu {
  id: string
  ma: string
  ten: string
  loai: string
  maNV: string
  tenNV: string
  chiTieuCamKet: string
  ketQuaThucTe: string
  tienDoPct: number
  trangThaiNghiemThu: string
  trangThai: TrangThaiSP
  chuTri: string
  updatedAt: string
  history: HistoryEntry[]
}

export interface HoSoSHTT {
  id: string
  ma: string
  ten: string
  loai: string
  maNV: string
  tenNV: string
  tacGia: string
  chuSoHuu: string
  tyLeQuyen: string
  trangThaiBaoHo: string
  soDon?: string
  ngayNop?: string
  trangThai: TrangThaiSP
  updatedAt: string
  history: HistoryEntry[]
}

export interface CongBoKhoaHoc {
  id: string
  ma: string
  ten: string
  loai: 'Bài báo' | 'Sáng chế' | 'Giải pháp hữu ích'
  maNV: string
  tenNV: string
  tacGia: string
  noiXuatBan?: string
  nam: number
  trangThai: TrangThaiSP
  updatedAt: string
  history: HistoryEntry[]
}

export interface CongNgheLoi {
  id: string
  ma: string
  ten: string
  maNV: string
  tenNV: string
  linhVuc: string
  mucDoChinMuoi: string
  trangThaiChuyenGiao: string
  donViTiepNhan?: string
  trangThai: TrangThaiSP
  updatedAt: string
  history: HistoryEntry[]
}

const hist = (action: string, actor = 'Nguyễn Văn An', at = '15/06/2026 09:30'): HistoryEntry => ({
  at, actor, action,
})

export const seedSanPhamNghienCuu: SanPhamNghienCuu[] = [
  {
    id: 'SP001', ma: 'SP.2026.001', ten: 'Module AI phân tích tín hiệu radar',
    loai: 'Phần mềm', maNV: 'RD.2026.018', tenNV: 'Nghiên cứu công nghệ radar đa chức năng',
    chiTieuCamKet: 'Độ chính xác ≥ 95%', ketQuaThucTe: 'Độ chính xác 96.2%', tienDoPct: 90,
    trangThaiNghiemThu: 'Đạt', trangThai: 'approved', chuTri: 'Trần Minh Đức', updatedAt: '20/07/2026',
    history: [hist('Tạo mới'), hist('Chỉnh sửa chỉ tiêu', 'Trần Minh Đức', '01/07/2026 10:00'), hist('Nghiệm thu đạt', 'CQ QLKHCN', '20/07/2026 14:00')],
  },
  {
    id: 'SP002', ma: 'SP.2026.002', ten: 'Thiết bị thu phát thông tin thế hệ mới',
    loai: 'Phần cứng', maNV: 'RD.2026.012', tenNV: 'Phát triển thiết bị thông tin thế hệ mới',
    chiTieuCamKet: 'Tốc độ ≥ 1 Gbps', ketQuaThucTe: 'Đang thử nghiệm 0.85 Gbps', tienDoPct: 65,
    trangThaiNghiemThu: 'Chưa nghiệm thu', trangThai: 'active', chuTri: 'Lê Hoàng Nam', updatedAt: '18/07/2026',
    history: [hist('Tạo mới', 'Lê Hoàng Nam'), hist('Cập nhật tiến độ', 'Lê Hoàng Nam', '18/07/2026 11:20')],
  },
  {
    id: 'SP003', ma: 'SP.2026.003', ten: 'Nền tảng quản trị dữ liệu KHCN',
    loai: 'Hệ thống', maNV: 'RD.2026.021', tenNV: 'Xây dựng nền tảng quản trị dữ liệu KHCN',
    chiTieuCamKet: 'Hỗ trợ ≥ 10.000 bản ghi/ngày', ketQuaThucTe: 'Chưa đo kiểm', tienDoPct: 40,
    trangThaiNghiemThu: 'Chưa nghiệm thu', trangThai: 'draft', chuTri: 'Phạm Thu Hà', updatedAt: '10/07/2026',
    history: [hist('Tạo mới', 'Phạm Thu Hà', '10/07/2026 08:15')],
  },
  {
    id: 'SP004', ma: 'SP.2026.004', ten: 'Bộ mô phỏng thử nghiệm anten',
    loai: 'Công cụ', maNV: 'RD.2026.009', tenNV: 'Phát triển hệ thống mô phỏng và thử nghiệm',
    chiTieuCamKet: 'Sai số mô phỏng ≤ 3%', ketQuaThucTe: 'Sai số 2.4%', tienDoPct: 100,
    trangThaiNghiemThu: 'Đạt', trangThai: 'approved', chuTri: 'Vũ Quốc Huy', updatedAt: '05/07/2026',
    history: [hist('Tạo mới', 'Vũ Quốc Huy'), hist('Nghiệm thu đạt', 'CQ QLKHCN', '05/07/2026 16:00')],
  },
  {
    id: 'SP005', ma: 'SP.2026.005', ten: 'Thư viện mô hình học máy bảo trì dự báo',
    loai: 'Phần mềm', maNV: 'RD.2026.025', tenNV: 'Phát triển nền tảng học máy cho bảo trì dự báo',
    chiTieuCamKet: 'F1-score ≥ 0.85', ketQuaThucTe: 'F1-score 0.81', tienDoPct: 70,
    trangThaiNghiemThu: 'Chưa đạt — cần hoàn thiện', trangThai: 'active', chuTri: 'Nguyễn Văn An', updatedAt: '22/07/2026',
    history: [hist('Tạo mới'), hist('Đối chiếu cam kết/thực tế', 'CQ QLKHCN', '22/07/2026 09:00')],
  },
]

export const seedHoSoSHTT: HoSoSHTT[] = [
  {
    id: 'IP001', ma: 'SHTT.2026.001', ten: 'Sáng chế phương pháp xử lý tín hiệu radar đa kênh',
    loai: 'Sáng chế', maNV: 'RD.2026.018', tenNV: 'Nghiên cứu công nghệ radar đa chức năng',
    tacGia: 'Trần Minh Đức; Lê Hoàng Nam', chuSoHuu: 'Viettel High Tech', tyLeQuyen: 'VHT 100%',
    trangThaiBaoHo: 'Đã nộp đơn', soDon: '1-2026-01234', ngayNop: '12/05/2026',
    trangThai: 'submitted', updatedAt: '12/05/2026',
    history: [hist('Tạo hồ sơ SHTT', 'Trần Minh Đức'), hist('Trình duyệt', 'Trần Minh Đức', '10/05/2026 14:00'), hist('Nộp đơn bảo hộ', 'CQ QLKHCN', '12/05/2026 09:00')],
  },
  {
    id: 'IP002', ma: 'SHTT.2026.002', ten: 'Giải pháp hữu ích anten mảng thông minh',
    loai: 'Giải pháp hữu ích', maNV: 'RD.2026.009', tenNV: 'Phát triển hệ thống mô phỏng và thử nghiệm',
    tacGia: 'Vũ Quốc Huy', chuSoHuu: 'Viettel High Tech; Trung tâm Sản phẩm', tyLeQuyen: 'VHT 70% / TTSP 30%',
    trangThaiBaoHo: 'Đang thẩm định', soDon: '2-2026-00456', ngayNop: '01/04/2026',
    trangThai: 'active', updatedAt: '01/06/2026',
    history: [hist('Tạo hồ sơ', 'Vũ Quốc Huy'), hist('Cập nhật tỷ lệ quyền', 'Pháp chế', '01/06/2026 10:30')],
  },
  {
    id: 'IP003', ma: 'SHTT.2026.003', ten: 'Bản quyền phần mềm nền tảng dữ liệu KHCN',
    loai: 'Bản quyền phần mềm', maNV: 'RD.2026.021', tenNV: 'Xây dựng nền tảng quản trị dữ liệu KHCN',
    tacGia: 'Phạm Thu Hà; Nguyễn Văn An', chuSoHuu: 'Viettel High Tech', tyLeQuyen: 'VHT 100%',
    trangThaiBaoHo: 'Chưa đăng ký', trangThai: 'draft', updatedAt: '08/07/2026',
    history: [hist('Tạo hồ sơ', 'Phạm Thu Hà', '08/07/2026 11:00')],
  },
]

export const seedCongBoKhoaHoc: CongBoKhoaHoc[] = [
  {
    id: 'CB001', ma: 'CB.2026.001', ten: 'Multi-function radar signal processing using deep learning',
    loai: 'Bài báo', maNV: 'RD.2026.018', tenNV: 'Nghiên cứu công nghệ radar đa chức năng',
    tacGia: 'Trần Minh Đức; Lê Hoàng Nam', noiXuatBan: 'IEEE Transactions on Aerospace', nam: 2026,
    trangThai: 'approved', updatedAt: '15/06/2026',
    history: [hist('Tạo mới', 'Trần Minh Đức'), hist('Duyệt công bố', 'CQ QLKHCN', '15/06/2026 16:00')],
  },
  {
    id: 'CB002', ma: 'CB.2026.002', ten: 'Phương pháp điều khiển anten mảng thích nghi',
    loai: 'Sáng chế', maNV: 'RD.2026.009', tenNV: 'Phát triển hệ thống mô phỏng và thử nghiệm',
    tacGia: 'Vũ Quốc Huy', nam: 2026, trangThai: 'submitted', updatedAt: '20/05/2026',
    history: [hist('Tạo mới', 'Vũ Quốc Huy'), hist('Trình duyệt', 'Vũ Quốc Huy', '20/05/2026 09:45')],
  },
  {
    id: 'CB003', ma: 'CB.2026.003', ten: 'Giải pháp mã hóa dữ liệu KHCN trên blockchain',
    loai: 'Giải pháp hữu ích', maNV: 'RD.2026.021', tenNV: 'Xây dựng nền tảng quản trị dữ liệu KHCN',
    tacGia: 'Phạm Thu Hà', nam: 2026, trangThai: 'draft', updatedAt: '02/07/2026',
    history: [hist('Tạo mới', 'Phạm Thu Hà', '02/07/2026 13:20')],
  },
  {
    id: 'CB004', ma: 'CB.2026.004', ten: 'Predictive maintenance with federated learning for telecom assets',
    loai: 'Bài báo', maNV: 'RD.2026.025', tenNV: 'Phát triển nền tảng học máy cho bảo trì dự báo',
    tacGia: 'Nguyễn Văn An', noiXuatBan: 'Journal of Telecom Research', nam: 2026,
    trangThai: 'active', updatedAt: '25/07/2026',
    history: [hist('Tạo mới'), hist('Cập nhật nơi xuất bản', 'Nguyễn Văn An', '25/07/2026 08:00')],
  },
]

export const seedCongNgheLoi: CongNgheLoi[] = [
  {
    id: 'CN001', ma: 'CN.2026.001', ten: 'Công nghệ xử lý tín hiệu radar đa kênh',
    maNV: 'RD.2026.018', tenNV: 'Nghiên cứu công nghệ radar đa chức năng',
    linhVuc: 'Điện tử — Radar', mucDoChinMuoi: 'TRL 6', trangThaiChuyenGiao: 'Sẵn sàng chuyển giao nội bộ',
    donViTiepNhan: 'Ban Công nghiệp Công nghệ cao', trangThai: 'active', updatedAt: '18/07/2026',
    history: [hist('Ghi nhận công nghệ lõi', 'Trần Minh Đức'), hist('Cập nhật TRL 6', 'CQ QLKHCN', '18/07/2026 10:00')],
  },
  {
    id: 'CN002', ma: 'CN.2026.002', ten: 'Công nghệ anten mảng thông minh',
    maNV: 'RD.2026.009', tenNV: 'Phát triển hệ thống mô phỏng và thử nghiệm',
    linhVuc: 'Viễn thông', mucDoChinMuoi: 'TRL 5', trangThaiChuyenGiao: 'Đang hoàn thiện',
    trangThai: 'active', updatedAt: '12/07/2026',
    history: [hist('Ghi nhận công nghệ lõi', 'Vũ Quốc Huy', '12/07/2026 09:00')],
  },
  {
    id: 'CN003', ma: 'CN.2026.003', ten: 'Nền tảng học máy bảo trì dự báo',
    maNV: 'RD.2026.025', tenNV: 'Phát triển nền tảng học máy cho bảo trì dự báo',
    linhVuc: 'Công nghệ thông tin', mucDoChinMuoi: 'TRL 4', trangThaiChuyenGiao: 'Nghiên cứu',
    trangThai: 'draft', updatedAt: '28/06/2026',
    history: [hist('Ghi nhận công nghệ lõi', 'Nguyễn Văn An', '28/06/2026 15:30')],
  },
]

/** Quyền chức năng đề xuất (mock RBAC labels). */
export const SAN_PHAM_KHCN_PERMISSIONS = [
  { nhom: 'Sản phẩm nghiên cứu', chucNang: 'Sản phẩm nghiên cứu', quyen: 'Xem danh sách Sản phẩm nghiên cứu', code: 'PRODUCT_LIST' },
  { nhom: 'Sản phẩm nghiên cứu', chucNang: 'Sản phẩm nghiên cứu', quyen: 'Tạo mới Sản phẩm nghiên cứu', code: 'PRODUCT_CREATE' },
  { nhom: 'Sản phẩm nghiên cứu', chucNang: 'Sản phẩm nghiên cứu', quyen: 'Xem chi tiết Sản phẩm nghiên cứu', code: 'PRODUCT_VIEW' },
  { nhom: 'Sản phẩm nghiên cứu', chucNang: 'Sản phẩm nghiên cứu', quyen: 'Chỉnh sửa Sản phẩm nghiên cứu', code: 'PRODUCT_EDIT' },
  { nhom: 'Sản phẩm nghiên cứu', chucNang: 'Sản phẩm nghiên cứu', quyen: 'Xóa sử dụng Sản phẩm nghiên cứu', code: 'PRODUCT_DELETE' },
  { nhom: 'Sản phẩm nghiên cứu', chucNang: 'Sản phẩm nghiên cứu', quyen: 'Xem lịch sử Sản phẩm nghiên cứu', code: 'PRODUCT_HISTORY' },
  { nhom: 'Sản phẩm nghiên cứu', chucNang: 'Đối chiếu', quyen: 'Đối chiếu sản phẩm cam kết và thực tế', code: 'PRODUCT_RECONCILE' },
  { nhom: 'Sở hữu trí tuệ', chucNang: 'Hồ sơ sở hữu trí tuệ', quyen: 'Xem danh sách Hồ sơ sở hữu trí tuệ', code: 'IP_LIST' },
  { nhom: 'Sở hữu trí tuệ', chucNang: 'Hồ sơ sở hữu trí tuệ', quyen: 'Tạo mới Hồ sơ sở hữu trí tuệ', code: 'IP_CREATE' },
  { nhom: 'Sở hữu trí tuệ', chucNang: 'Hồ sơ sở hữu trí tuệ', quyen: 'Xem chi tiết Hồ sơ sở hữu trí tuệ', code: 'IP_VIEW' },
  { nhom: 'Sở hữu trí tuệ', chucNang: 'Hồ sơ sở hữu trí tuệ', quyen: 'Chỉnh sửa Hồ sơ sở hữu trí tuệ', code: 'IP_EDIT' },
  { nhom: 'Sở hữu trí tuệ', chucNang: 'Hồ sơ sở hữu trí tuệ', quyen: 'Xóa sử dụng Hồ sơ sở hữu trí tuệ', code: 'IP_DELETE' },
  { nhom: 'Sở hữu trí tuệ', chucNang: 'Hồ sơ sở hữu trí tuệ', quyen: 'Trình duyệt Hồ sơ sở hữu trí tuệ', code: 'IP_SUBMIT' },
  { nhom: 'Sở hữu trí tuệ', chucNang: 'Hồ sơ sở hữu trí tuệ', quyen: 'Xem lịch sử Hồ sơ sở hữu trí tuệ', code: 'IP_HISTORY' },
  { nhom: 'Sở hữu trí tuệ', chucNang: 'Quyền sở hữu', quyen: 'Quản lý tác giả, chủ sở hữu và tỷ lệ quyền', code: 'IP_OWNERSHIP' },
  { nhom: 'Sở hữu trí tuệ', chucNang: 'Đăng ký bảo hộ', quyen: 'Theo dõi trạng thái đơn và văn bằng bảo hộ', code: 'IP_PROTECTION' },
  { nhom: 'Công bố khoa học', chucNang: 'Bài báo/Sáng chế/Giải pháp hữu ích', quyen: 'Xem danh sách Bài báo/Sáng chế/Giải pháp hữu ích', code: 'PUB_LIST' },
  { nhom: 'Công bố khoa học', chucNang: 'Bài báo/Sáng chế/Giải pháp hữu ích', quyen: 'Tạo mới Bài báo/Sáng chế/Giải pháp hữu ích', code: 'PUB_CREATE' },
  { nhom: 'Công bố khoa học', chucNang: 'Bài báo/Sáng chế/Giải pháp hữu ích', quyen: 'Xem chi tiết Bài báo/Sáng chế/Giải pháp hữu ích', code: 'PUB_VIEW' },
  { nhom: 'Công bố khoa học', chucNang: 'Bài báo/Sáng chế/Giải pháp hữu ích', quyen: 'Chỉnh sửa Bài báo/Sáng chế/Giải pháp hữu ích', code: 'PUB_EDIT' },
  { nhom: 'Công bố khoa học', chucNang: 'Bài báo/Sáng chế/Giải pháp hữu ích', quyen: 'Xóa sử dụng Bài báo/Sáng chế/Giải pháp hữu ích', code: 'PUB_DELETE' },
  { nhom: 'Công bố khoa học', chucNang: 'Bài báo/Sáng chế/Giải pháp hữu ích', quyen: 'Xem lịch sử Bài báo/Sáng chế/Giải pháp hữu ích', code: 'PUB_HISTORY' },
  { nhom: 'Công nghệ & chuyển giao', chucNang: 'Công nghệ lõi', quyen: 'Quản lý công nghệ hình thành từ nhiệm vụ', code: 'TECH_CORE_MANAGE' },
] as const

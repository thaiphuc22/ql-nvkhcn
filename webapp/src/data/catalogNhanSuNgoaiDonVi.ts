/**
 * Nhân sự ngoài đơn vị (External Personnel) - Catalog data
 * Part of PH2 - Quản trị đơn vị
 */

export interface NhanSuNgoaiDonVi {
  id: string
  ma: string
  hoTen: string
  ngaySinh?: string
  gioiTinh: 'nam' | 'nữ' | 'khac'
  cccd?: string
  diaChi?: string
  dienThoai?: string
  email?: string
  donViCongTac?: string
  chucDanh?: string
  linhVucChuyenMon?: string
  kinhNghiemNam?: number
  vaiTro: NhanSuVaiTro
  ngayBatDauHopTac?: string
  ngayKetThucHopTac?: string
  taiLieuDinhKem?: { ten: string; url: string; loai: string }[]
  trangThai: 'active' | 'inactive'
}

export type NhanSuVaiTro = 'chuTriHoiDong' | 'phanBien' | 'uyVien' | 'chuTriThamDinh' | 'thanhVien' | 'tuVan'

export const GIOI_TINH: Record<NhanSuNgoaiDonVi['gioiTinh'], string> = {
  nam: 'Nam',
  nữ: 'Nữ',
  khac: 'Khác',
}

export const VAI_TRO_NS: Record<NhanSuNgoaiDonVi['vaiTro'], string> = {
  chuTriHoiDong: 'Chủ trì hội đồng',
  phanBien: 'Phản biện',
  uyVien: 'Ủy viên',
  chuTriThamDinh: 'Chủ trì thẩm định',
  thanhVien: 'Thành viên',
  tuVan: 'Tư vấn',
}

export const VAI_TRO_NS_COLOR: Record<NhanSuNgoaiDonVi['vaiTro'], string> = {
  chuTriHoiDong: 'red',
  phanBien: 'orange',
  uyVien: 'blue',
  chuTriThamDinh: 'purple',
  thanhVien: 'cyan',
  tuVan: 'green',
}

export const TRANG_THAI_OPTIONS = [
  { value: 'active', label: 'Đang hợp tác' },
  { value: 'inactive', label: 'Không còn hợp tác' },
]

export const seedNhanSuNgoaiDonVi: NhanSuNgoaiDonVi[] = [
  {
    id: 'NS001',
    ma: 'NS-NDV-001',
    hoTen: 'GS.TS. Phạm Hùng',
    ngaySinh: '1965-03-15',
    gioiTinh: 'nam',
    cccd: '012345678901',
    diaChi: '123 Đường A, Quận Cầu Giấy, Hà Nội',
    dienThoai: '0912 xxx xxx',
    email: 'pham.hung@university.edu.vn',
    donViCongTac: 'Đại học Quốc gia Hà Nội',
    chucDanh: 'Giáo sư',
    linhVucChuyenMon: 'Công nghệ thông tin',
    kinhNghiemNam: 25,
    vaiTro: 'chuTriHoiDong',
    ngayBatDauHopTac: '2020-01-15',
    taiLieuDinhKem: [
      { ten: 'CV_PhamHung.pdf', url: '/files/cv001.pdf', loai: 'PDF' },
      { ten: 'HDCMD_2023.pdf', url: '/files/hdcmd001.pdf', loai: 'PDF' },
    ],
    trangThai: 'active',
  },
  {
    id: 'NS002',
    ma: 'NS-NDV-002',
    hoTen: 'PGS.TS. Nguyễn Thị Lan',
    ngaySinh: '1970-07-22',
    gioiTinh: 'nữ',
    cccd: '012345678902',
    diaChi: '456 Đường B, Quận Đống Đa, Hà Nội',
    dienThoai: '0913 xxx xxx',
    email: 'lan.nt@viendothi.edu.vn',
    donViCongTac: 'Viện Toán học',
    chucDanh: 'Phó Giáo sư',
    linhVucChuyenMon: 'Toán học ứng dụng',
    kinhNghiemNam: 20,
    vaiTro: 'phanBien',
    ngayBatDauHopTac: '2021-03-01',
    trangThai: 'active',
  },
  {
    id: 'NS003',
    ma: 'NS-NDV-003',
    hoTen: 'TS. Trần Văn Minh',
    ngaySinh: '1980-11-08',
    gioiTinh: 'nam',
    cccd: '012345678903',
    diaChi: '789 Đường C, Quận Ba Đình, Hà Nội',
    dienThoai: '0914 xxx xxx',
    email: 'minh.tv@academicexpert.org',
    donViCongTac: 'Trung tâm Nghiên cứu Quốc tế',
    chucDanh: 'Tiến sĩ',
    linhVucChuyenMon: 'Khoa học dữ liệu',
    kinhNghiemNam: 15,
    vaiTro: 'uyVien',
    ngayBatDauHopTac: '2022-06-15',
    trangThai: 'active',
  },
  {
    id: 'NS004',
    ma: 'NS-NDV-004',
    hoTen: 'GS.TS. Lê Thị Hương',
    ngaySinh: '1968-04-30',
    gioiTinh: 'nữ',
    cccd: '012345678904',
    diaChi: '321 Đường D, TP.HCM',
    dienThoai: '0915 xxx xxx',
    email: 'huong.lt@uit.edu.vn',
    donViCongTac: 'Đại học Công nghệ Thông tin',
    chucDanh: 'Giáo sư',
    linhVucChuyenMon: 'An ninh mạng',
    kinhNghiemNam: 22,
    vaiTro: 'tuVan',
    ngayBatDauHopTac: '2020-09-01',
    trangThai: 'active',
  },
  {
    id: 'NS005',
    ma: 'NS-NDV-005',
    hoTen: 'TS. Hoàng Đức Anh',
    ngaySinh: '1985-09-12',
    gioiTinh: 'nam',
    cccd: '012345678905',
    diaChi: '654 Đường E, Quận 2, TP.HCM',
    dienThoai: '0916 xxx xxx',
    email: 'anh.hd@techcorp.vn',
    donViCongTac: 'Công ty TechCorp',
    chucDanh: 'Giám đốc kỹ thuật',
    linhVucChuyenMon: 'AI và Machine Learning',
    kinhNghiemNam: 12,
    vaiTro: 'thanhVien',
    ngayBatDauHopTac: '2023-01-10',
    trangThai: 'active',
  },
]
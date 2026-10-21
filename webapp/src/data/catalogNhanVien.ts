/**
 * Nhân viên (Employees) - Catalog data
 * Part of PH2 - Quản trị đơn vị
 */

export interface NhanVien {
  id: string
  maNV: string
  hoTen: string
  ngaySinh?: string
  gioiTinh: 'nam' | 'nữ' | 'khac'
  cccd?: string
  ngayCccd?: string
  noiCccd?: string
  dienThoai?: string
  email: string
  diaChi?: string
  donViId: string
  chucDanhId: string
  ngayVaoLam?: string
  trinhDo?: string
  chuyenNganh?: string
  trangThai: 'active' | 'inactive' | 'nghiViec'
  sapId?: string
}

export const GIOI_TINH: Record<NhanVien['gioiTinh'], string> = {
  nam: 'Nam',
  nữ: 'Nữ',
  khac: 'Khác',
}

export const TRANG_THAI_NV_OPTIONS = [
  { value: 'active', label: 'Đang làm việc' },
  { value: 'inactive', label: 'Tạm nghỉ' },
  { value: 'nghiViec', label: 'Nghỉ việc' },
]

export const seedNhanVien: NhanVien[] = [
  {
    id: 'NV001',
    maNV: 'VHT-0001',
    hoTen: 'Nguyễn Văn An',
    ngaySinh: '1985-03-15',
    gioiTinh: 'nam',
    cccd: '012345678901',
    ngayCccd: '2015-03-20',
    noiCccd: 'Hà Nội',
    dienThoai: '0912 xxx xxx',
    email: 'nv.an@viettel.com.vn',
    diaChi: '123 Đường ABC, Quận 1, TP.HCM',
    donViId: 'DV001',
    chucDanhId: 'CD001',
    ngayVaoLam: '2012-06-01',
    trinhDo: 'Thạc sĩ',
    chuyenNganh: 'Quản trị kinh doanh',
    trangThai: 'active',
    sapId: 'SAP-NV001',
  },
  {
    id: 'NV002',
    maNV: 'VHT-0002',
    hoTen: 'Trần Thị Bình',
    ngaySinh: '1988-07-22',
    gioiTinh: 'nữ',
    cccd: '012345678902',
    dienThoai: '0913 xxx xxx',
    email: 'tt.binh@viettel.com.vn',
    donViId: 'DV002',
    chucDanhId: 'CD003',
    ngayVaoLam: '2015-08-15',
    trinhDo: 'Đại học',
    chuyenNganh: 'Kỹ thuật điện tử',
    trangThai: 'active',
    sapId: 'SAP-NV002',
  },
  {
    id: 'NV003',
    maNV: 'VHT-0003',
    hoTen: 'Lê Văn Cường',
    ngaySinh: '1990-11-08',
    gioiTinh: 'nam',
    cccd: '012345678903',
    dienThoai: '0914 xxx xxx',
    email: 'lv.cuong@viettel.com.vn',
    donViId: 'DV002',
    chucDanhId: 'CD005',
    ngayVaoLam: '2018-03-20',
    trinhDo: 'Đại học',
    chuyenNganh: 'Công nghệ thông tin',
    trangThai: 'active',
  },
  {
    id: 'NV004',
    maNV: 'VHT-0004',
    hoTen: 'Phạm Thị Dung',
    ngaySinh: '1992-04-30',
    gioiTinh: 'nữ',
    cccd: '012345678904',
    dienThoai: '0915 xxx xxx',
    email: 'pt.dung@viettel.com.vn',
    donViId: 'DV003',
    chucDanhId: 'CD008',
    ngayVaoLam: '2019-01-10',
    trinhDo: 'Tiến sĩ',
    chuyenNganh: 'Khoa học máy tính',
    trangThai: 'active',
    sapId: 'SAP-NV004',
  },
  {
    id: 'NV005',
    maNV: 'VHT-0005',
    hoTen: 'Hoàng Văn Em',
    ngaySinh: '1987-09-12',
    gioiTinh: 'nam',
    cccd: '012345678905',
    dienThoai: '0916 xxx xxx',
    email: 'hv.em@viettel.com.vn',
    donViId: 'DV005',
    chucDanhId: 'CD004',
    ngayVaoLam: '2014-05-25',
    trinhDo: 'Thạc sĩ',
    chuyenNganh: 'Tài chính ngân hàng',
    trangThai: 'active',
  },
  {
    id: 'NV006',
    maNV: 'VHT-0006',
    hoTen: 'Nguyễn Thị Phương',
    ngaySinh: '1995-12-18',
    gioiTinh: 'nữ',
    cccd: '012345678906',
    dienThoai: '0917 xxx xxx',
    email: 'nt.phuong@viettel.com.vn',
    donViId: 'DV006',
    chucDanhId: 'CD005',
    ngayVaoLam: '2020-07-01',
    trinhDo: 'Đại học',
    chuyenNganh: 'Kế toán',
    trangThai: 'active',
  },
]
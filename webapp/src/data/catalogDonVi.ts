/**
 * Đơn vị (Organizational Units) - Catalog data
 * Part of PH2 - Quản trị đơn vị
 */

export interface DonVi {
  id: string
  ma: string
  ten: string
  loai: DonViLoai
  diaChi?: string
  dienThoai?: string
  email?: string
  parentId?: string
  nguoiQuanLy?: string
  ngayThanhLap?: string
  trangThai: 'active' | 'inactive'
  sapId?: string // SAP integration ID
}

export type DonViLoai = 'truSo' | 'coSo' | 'congTy' | 'phongBan'

export const LOAI_DON_VI: Record<DonVi['loai'], string> = {
  truSo: 'Trụ sở',
  coSo: 'Cơ sở nghiên cứu',
  congTy: 'Công ty con',
  phongBan: 'Phòng ban',
}

export const LOAI_DON_VI_COLOR: Record<DonVi['loai'], string> = {
  truSo: 'red',
  coSo: 'blue',
  congTy: 'green',
  phongBan: 'default',
}

export const TRANG_THAI_OPTIONS = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Không hoạt động' },
]

export const seedDonVi: DonVi[] = [
  {
    id: 'DV001',
    ma: 'VHT-HQ',
    ten: 'Trụ sở VHT',
    loai: 'truSo',
    diaChi: 'Tòa nhà VHT, KM2 Phạm Hùng, Mễ Trì, Nam Từ Liêm, Hà Nội',
    dienThoai: '024 3xxx xxxx',
    email: 'vht-hq@viettel.com.vn',
    nguoiQuanLy: 'Nguyễn Văn A',
    ngayThanhLap: '2012-03-15',
    trangThai: 'active',
    sapId: 'SAP-001',
  },
  {
    id: 'DV002',
    ma: 'VHT-CS1',
    ten: 'Cơ sở nghiên cứu 1',
    loai: 'coSo',
    diaChi: 'Tòa nhà VHT Campus, Khu công nghệ cao Hòa Lạc',
    dienThoai: '024 3xxx xxxx',
    email: 'cs1@viettel.com.vn',
    nguoiQuanLy: 'Trần Thị B',
    ngayThanhLap: '2015-06-20',
    trangThai: 'active',
    sapId: 'SAP-002',
  },
  {
    id: 'DV003',
    ma: 'VHT-CS2',
    ten: 'Cơ sở nghiên cứu 2',
    loai: 'coSo',
    diaChi: 'Khu công nghệ cao TP.HCM',
    dienThoai: '028 3xxx xxxx',
    email: 'cs2@viettel.com.vn',
    nguoiQuanLy: 'Lê Văn C',
    ngayThanhLap: '2018-01-10',
    trangThai: 'active',
    sapId: 'SAP-003',
  },
  {
    id: 'DV004',
    ma: 'VHT-CT1',
    ten: 'Viettel Networks',
    loai: 'congTy',
    diaChi: 'Tòa nhà VHT, Hà Nội',
    dienThoai: '024 3xxx xxxx',
    email: 'networks@viettel.com.vn',
    nguoiQuanLy: 'Phạm Thị D',
    ngayThanhLap: '2019-04-25',
    trangThai: 'active',
  },
  {
    id: 'DV005',
    ma: 'VHT-PKT',
    ten: 'Phòng Kế hoạch Tổng hợp',
    loai: 'phongBan',
    parentId: 'DV001',
    diaChi: 'Tầng 5, Trụ sở VHT',
    dienThoai: '024 3xxx xxxx',
    nguoiQuanLy: 'Hoàng Văn E',
    trangThai: 'active',
  },
  {
    id: 'DV006',
    ma: 'VHT-PKH',
    ten: 'Phòng Khoa học và Công nghệ',
    loai: 'phongBan',
    parentId: 'DV001',
    diaChi: 'Tầng 6, Trụ sở VHT',
    dienThoai: '024 3xxx xxxx',
    nguoiQuanLy: 'Nguyễn Thị F',
    trangThai: 'active',
  },
  {
    id: 'DV007',
    ma: 'VHT-PTC',
    ten: 'Phòng Tài chính Kế toán',
    loai: 'phongBan',
    parentId: 'DV001',
    diaChi: 'Tầng 4, Trụ sở VHT',
    dienThoai: '024 3xxx xxxx',
    nguoiQuanLy: 'Đặng Văn G',
    trangThai: 'inactive',
  },
]
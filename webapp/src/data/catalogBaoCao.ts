/**
 * Bao cao dinh ky/dot xuat (Periodic/Ad-hoc Reports) - Catalog data
 * Part of PH2 - Quan ly bao cao
 */

export type BaoCaoLoai = 'dinhKy' | 'dotXuat'
export type BaoCaoTrangThai = 'soan' | 'choDuyet' | 'daDuyet' | 'tuChoi' | 'huy'

export interface LichSuItem {
  hanhDong: string
  nguoiThucHien: string
  ngay: string
  chiTiet?: string
}

export interface BaoCao {
  id: string
  ma: string
  tieuDe: string
  loai: BaoCaoLoai
  noiDung: string
  trangThai: BaoCaoTrangThai
  nguoiTao: string
  ngayTao: string
  ngayCapNhat?: string
  fileDinhKem?: string[]
  lichSu?: LichSuItem[]
}

export const LOAI_OPTIONS = [
  { value: 'dinhKy', label: 'Dinh ky' },
  { value: 'dotXuat', label: 'Dot xuat' },
]

export const TRANG_THAI_OPTIONS = [
  { value: 'soan', label: 'Dang soan' },
  { value: 'choDuyet', label: 'Cho duyet' },
  { value: 'daDuyet', label: 'Da duyet' },
  { value: 'tuChoi', label: 'Tu choi' },
  { value: 'huy', label: 'Huy' },
]

export const TRANG_THAI_COLORS: Record<BaoCaoTrangThai, string> = {
  soan: 'default',
  choDuyet: 'orange',
  daDuyet: 'green',
  tuChoi: 'red',
  huy: 'default',
}

export const seedBaoCao: BaoCao[] = [
  {
    id: 'BC001',
    ma: 'BC-Q1-2026',
    tieuDe: 'Bao cao tien do thuc hien NV KHCN quy I/2026',
    loai: 'dinhKy',
    noiDung: 'Bao cao tong hop tien do thuc hien cac nhiem vu KH&CN trong quy I nam 2026.\n\n1. Tinh hinh thuc hien:\n- Tong so NV: 15\n- Da hoan thanh: 8\n- Dang thuc hien: 5\n- Chua trien khai: 2\n\n2. Cac noi dung chinh:\n- Tom tat ket qua dat duoc\n- Kha nang tieu ton kinh phi\n- Nhung van de kho khan, van de\n\n3. De xuat, kien nghi',
    trangThai: 'daDuyet',
    nguoiTao: 'admin',
    ngayTao: '2026-03-25',
    ngayCapNhat: '2026-03-30',
    fileDinhKem: ['BC_Q1_2026.pdf', 'PhuLuc_TienDo.xlsx'],
    lichSu: [
      { hanhDong: 'Tao moi', nguoiThucHien: 'admin', ngay: '2026-03-25', chiTiet: 'Tao bao cao Q1' },
      { hanhDong: 'Trinh duyet', nguoiThucHien: 'admin', ngay: '2026-03-26' },
      { hanhDong: 'Phe duyet', nguoiThucHien: 'lanhdanhv', ngay: '2026-03-30', chiTiet: 'Da duyet, cho phep xuat ban' },
    ],
  },
  {
    id: 'BC002',
    ma: 'BC-DX-001',
    tieuDe: 'Bao cao dot xuat ve tinh hinh tre han HDXD RD02.02',
    loai: 'dotXuat',
    noiDung: 'Bao cao dot xuat ve tinh hinh tre han xu ly ho so Hoi dong xet duyet RD02.02.\n\n1. Tom tat noi dung:\n- Co 3 ho so bi tre han hon 15 ngay\n- Nguyen nhan chinh: cham chi, thieu nhan su\n\n2. Tinh hinh cu the:\n- HS RD02.02-001: Tre 20 ngay\n- HS RD02.02-002: Tre 18 ngay\n- HS RD02.02-003: Tre 12 ngay\n\n3. De xuat:\n- Bo sung nhan luc cho buoc nay\n- Rut ngan thoi gian xu ly',
    trangThai: 'choDuyet',
    nguoiTao: 'truongphong',
    ngayTao: '2026-07-15',
    fileDinhKem: ['BC_TreHan_RD02.02.pdf'],
    lichSu: [
      { hanhDong: 'Tao moi', nguoiThucHien: 'truongphong', ngay: '2026-07-15' },
      { hanhDong: 'Trinh duyet', nguoiThucHien: 'truongphong', ngay: '2026-07-15' },
    ],
  },
  {
    id: 'BC003',
    ma: 'BC-Q2-2026',
    tieuDe: 'Bao cao tien do thuc hien NV KHCN quy II/2026',
    loai: 'dinhKy',
    noiDung: 'Bao cao tong hop tien do thuc hien cac nhiem vu KH&CN trong quy II nam 2026.\n\n1. Tinh hinh thuc hien:\n- Tong so NV: 18\n- Da hoan thanh: 10\n- Dang thuc hien: 6\n- Chua trien khai: 2\n\n2. Kinh phi:\n- Tong du toan: 5.000.000.000 VND\n- Da giai ngan: 3.200.000.000 VND\n- Ty le giai ngan: 64%\n\n3. Danh gia chung: Dat',
    trangThai: 'soan',
    nguoiTao: 'admin',
    ngayTao: '2026-07-20',
    lichSu: [
      { hanhDong: 'Tao moi', nguoiThucHien: 'admin', ngay: '2026-07-20' },
    ],
  },
  {
    id: 'BC004',
    ma: 'BC-DX-002',
    tieuDe: 'Bao cao dot xuat ket qua nghiem thu NV RD05.01',
    loai: 'dotXuat',
    noiDung: 'Bao cao dot xuat ve ket qua nghiem thu nhiem vu RD05.01.\n\n1. Thong tin chung:\n- Ma NV: RD05.01\n- Ten: Nghien cuu cong nghe 5G\n- Chu nhiem: TS. Nguyen Van A\n\n2. Ket qua nghiem thu:\n- Diem trung binh: 8.5/10\n- Xep loai: Dat\n- Nhan xet cua hoi dong\n\n3. San pham da hoan thanh:\n- Bao cao tong hop\n- 2 bau phat minh\n- 3 bao cao khoa hoc',
    trangThai: 'daDuyet',
    nguoiTao: 'admin',
    ngayTao: '2026-06-10',
    ngayCapNhat: '2026-06-15',
    fileDinhKem: ['BC_NghiemThu_RD05.01.pdf', 'BienBan_HD.pdf'],
    lichSu: [
      { hanhDong: 'Tao moi', nguoiThucHien: 'admin', ngay: '2026-06-10' },
      { hanhDong: 'Trinh duyet', nguoiThucHien: 'admin', ngay: '2026-06-11' },
      { hanhDong: 'Phe duyet', nguoiThucHien: 'lanhdanhv', ngay: '2026-06-15', chiTiet: 'Dat, nghiem thu thanh cong' },
    ],
  },
  {
    id: 'BC005',
    ma: 'BC-DX-003',
    tieuDe: 'Yeu cau bo sung kinh phi cho NV RD08.02',
    loai: 'dotXuat',
    noiDung: 'Yeu cau bo sung kinh phi cho nhiem vu RD08.02 do thay doi ti gia.\n\n1. Tom tat:\n- NV hien tai: RD08.02\n- Kinh phi duoc duyet: 800.000.000 VND\n- Kinh phi can bo sung: 150.000.000 VND\n\n2. Nguyen nhan:\n- Ti gia tang 10%\n- Mot so thiet bi phai nhap khau them\n\n3. Phuong an:\n- De nghi bo sung 150 trieu VND\n- Rut gon mot so noi dung khong uu tien',
    trangThai: 'tuChoi',
    nguoiTao: 'chuNhiem',
    ngayTao: '2026-05-20',
    ngayCapNhat: '2026-05-25',
    lichSu: [
      { hanhDong: 'Tao moi', nguoiThucHien: 'chuNhiem', ngay: '2026-05-20' },
      { hanhDong: 'Trinh duyet', nguoiThucHien: 'chuNhiem', ngay: '2026-05-21' },
      { hanhDong: 'Tu choi', nguoiThucHien: 'lanhdanhv', ngay: '2026-05-25', chiTiet: 'Khong phep bo sung, can rut gon noi dung' },
    ],
  },
  {
    id: 'BC006',
    ma: 'BC-DX-004',
    tieuDe: 'Bao cao dot xuat ve su co an toan',
    loai: 'dotXuat',
    noiDung: 'Thong bao su co an toan xay ra tai cong trinh RD06.03.\n\n1. Thong tin su co:\n- Thoi gian: 2026-07-18 14:30\n- Dia diem: Tru so VHT\n- Mat: 1\n\n2. Nguyen nhan ban dau:\n- Thiet bi cu may phat sinh hanh lang\n- Con nguoi vi pham quy trinh\n\n3. Bien phap xu ly:\n- Da dung cong viec ngay lap tuc\n- Thu cong cu, kiem tra lai quy trinh\n- Bao cao voi cap tren',
    trangThai: 'daDuyet',
    nguoiTao: 'antoan',
    ngayTao: '2026-07-18',
    ngayCapNhat: '2026-07-19',
    fileDinhKem: ['BC_SuCo_AnToan.pdf', 'BienBan_SuCo.pdf'],
    lichSu: [
      { hanhDong: 'Tao moi', nguoiThucHien: 'antoan', ngay: '2026-07-18' },
      { hanhDong: 'Trinh duyet', nguoiThucHien: 'antoan', ngay: '2026-07-18' },
      { hanhDong: 'Phe duyet', nguoiThucHien: 'lanhdanhv', ngay: '2026-07-19', chiTiet: 'Da tiep nhan, thong bao cac don vi lien quan' },
    ],
  },
  {
    id: 'BC007',
    ma: 'BC-DX-005',
    tieuDe: 'De xuat khen thuong tap the, ca nhan',
    loai: 'dotXuat',
    noiDung: 'De xuat khen thuong mot so tap the, ca nhan co thanh tich xuat sac.\n\n1. Tap the duoc de xuat:\n- Ban quan ly du an RD02\n- To nghien cuu 5G\n\n2. Ca nhan duoc de xuat:\n- TS. Nguyen Van B (Hieu truong)\n- ThS. Tran Thi C (Chu nhiem RD02.01)\n- KS. Le Van D (Ky su phu tram)\n\n3. Ly do:\n- Hoan thanh vuot muc 3 thang\n- Chat luong san pham dat hang dau\n- Tiết kiem kinh phi 15%',
    trangThai: 'huy',
    nguoiTao: 'admin',
    ngayTao: '2026-04-10',
    ngayCapNhat: '2026-04-12',
    lichSu: [
      { hanhDong: 'Tao moi', nguoiThucHien: 'admin', ngay: '2026-04-10' },
      { hanhDong: 'Trinh duyet', nguoiThucHien: 'admin', ngay: '2026-04-11' },
      { hanhDong: 'Huy', nguoiThucHien: 'admin', ngay: '2026-04-12', chiTiet: 'Huy vi thong tin chua day du' },
    ],
  },
  {
    id: 'BC008',
    ma: 'BC-Q2-2026-VHT',
    tieuDe: 'Bao cao tong hop VHT quy II/2026',
    loai: 'dinhKy',
    noiDung: 'Bao cao tong hop hoat dong KH&CN cua VHT quy II nam 2026.\n\n1. Tom tat:\n- Tong so nhiem vu: 25\n- So san pham: 48\n- So bau phat minh: 12\n- So bai bao: 8\n\n2. Tai chinh:\n- Tong kinh phi: 15 tỷ VND\n- Da su dung: 9 tỷ VND\n- Ti le: 60%\n\n3. Nhan xet chung: Tot',
    trangThai: 'choDuyet',
    nguoiTao: 'admin',
    ngayTao: '2026-07-21',
    lichSu: [
      { hanhDong: 'Tao moi', nguoiThucHien: 'admin', ngay: '2026-07-21' },
    ],
  },
]
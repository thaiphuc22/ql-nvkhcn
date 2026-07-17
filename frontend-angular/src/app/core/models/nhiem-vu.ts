export type NhiemVuCap = 'CS' | 'TD';

export type NhiemVuGiaiDoan =
  | 'CHU_TRUONG'
  | 'XET_DUYET'
  | 'THUC_HIEN'
  | 'DIEU_CHINH'
  | 'NGHIEM_THU'
  | 'QUYET_TOAN';

export const NHIEM_VU_CAP_LABEL: Record<NhiemVuCap, string> = {
  CS: 'Cơ sở',
  TD: 'Tập đoàn',
};

export const NHIEM_VU_GIAI_DOAN_LABEL: Record<NhiemVuGiaiDoan, string> = {
  CHU_TRUONG: 'Chủ trương',
  XET_DUYET: 'Xét duyệt',
  THUC_HIEN: 'Thực hiện',
  DIEU_CHINH: 'Điều chỉnh',
  NGHIEM_THU: 'Nghiệm thu',
  QUYET_TOAN: 'Quyết toán',
};

export const NHIEM_VU_GIAI_DOAN_ORDER: NhiemVuGiaiDoan[] = [
  'CHU_TRUONG',
  'XET_DUYET',
  'THUC_HIEN',
  'DIEU_CHINH',
  'NGHIEM_THU',
  'QUYET_TOAN',
];

export const NHIEM_VU_GIAI_DOAN_COLOR: Record<NhiemVuGiaiDoan, string> = {
  CHU_TRUONG: 'blue',
  XET_DUYET: 'geekblue',
  THUC_HIEN: 'gold',
  DIEU_CHINH: 'orange',
  NGHIEM_THU: 'green',
  QUYET_TOAN: 'purple',
};

export interface NhiemVuResponse {
  ma: string;
  ten: string;
  cap: NhiemVuCap;
  chuNhiem: string;
  donViChuTri: string;
  thoiGianThucHien: string | null;
  duToan: string | null;
  giaiDoan: NhiemVuGiaiDoan;
}

export interface CreateNhiemVuRequest {
  ten: string;
  cap: NhiemVuCap;
  chuNhiemHoTen: string;
  chuNhiemHocHamHocVi?: string;
  chuNhiemMaNhanVien?: string;
  chuNhiemEmail?: string;
  donViChuTri: string;
  thoiGianThucHien?: string;
  duToan?: string;
}

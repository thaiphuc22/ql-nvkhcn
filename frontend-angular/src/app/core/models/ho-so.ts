/**
 * Port từ webapp/src/data/dossiers.ts (view type) + backend/.../web/dto/HoSoResponse.java.
 * Đây là hình chiếu API thật (Mốc 2/3 backend), KHÔNG phải mock — enum giữ nguyên tên hằng số
 * Java (Jackson serialize theo `name()`) để khớp payload thật.
 */

export type DossierStatus = 'DRAFT' | 'PROCESSING' | 'APPROVED' | 'REJECTED';

export const DOSSIER_STATUS_LABEL: Record<DossierStatus, string> = {
  DRAFT: 'Khởi tạo',
  PROCESSING: 'Đang xử lý',
  APPROVED: 'Đã phê duyệt',
  REJECTED: 'Bị từ chối',
};

export type HoSoLoai = 'CHU_TRUONG' | 'XET_DUYET' | 'BAO_CAO' | 'DIEU_CHINH' | 'NGHIEM_THU' | 'QUYET_TOAN';

export const HO_SO_LOAI_LABEL: Record<HoSoLoai, string> = {
  CHU_TRUONG: 'Chủ trương',
  XET_DUYET: 'Xét duyệt',
  BAO_CAO: 'Báo cáo',
  DIEU_CHINH: 'Điều chỉnh',
  NGHIEM_THU: 'Nghiệm thu',
  QUYET_TOAN: 'Quyết toán',
};

export type Cap = 'CS' | 'TD';

export const CAP_LABEL: Record<Cap, string> = {
  CS: 'Cơ sở',
  TD: 'Tập đoàn',
};

export type StepStatus = 'PENDING' | 'CURRENT' | 'DONE' | 'SKIPPED';

export interface DossierStepResponse {
  buocIndex: number;
  taskDefinitionKey: string | null;
  ten: string;
  vaiTro: string;
  vaiTroCodes: string[];
  nguoi: string | null;
  trangThai: StepStatus;
  thoiDiem: string | null;
  yKien: string | null;
  hanXuLy: string | null;
  formKey: string | null;
}

export interface HoSoResponse {
  id: string;
  maNV: string;
  loai: HoSoLoai;
  quyTrinh: string | null;
  quyTrinhTen: string | null;
  nguoiKhoiTao: string;
  ngayTao: string;
  trangThai: DossierStatus;
  buocHienTai: number;
  zeebeProcessInstanceKey: number | null;
  steps: DossierStepResponse[];
  maDeTai: string;
  tenDeTai: string;
  chuNhiem: string;
  donVi: string;
  duToan: string;
  cap: Cap;
}

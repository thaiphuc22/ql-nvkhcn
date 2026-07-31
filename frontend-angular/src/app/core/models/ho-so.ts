/**
 * Port từ webapp/src/data/dossiers.ts (view type) + backend/.../web/dto/HoSoResponse.java.
 * Đây là hình chiếu API thật (Mốc 2/3 backend), KHÔNG phải mock — enum giữ nguyên tên hằng số
 * Java (Jackson serialize theo `name()`) để khớp payload thật.
 */

export type DossierStatus = 'DRAFT' | 'START_PENDING' | 'START_FAILED' | 'PROCESSING' |
  'APPROVED' | 'REJECTED' | 'CANCELLED';

export const DOSSIER_STATUS_LABEL: Record<DossierStatus, string> = {
  DRAFT: 'Khởi tạo',
  START_PENDING: 'Đang khởi tạo quy trình',
  START_FAILED: 'Khởi tạo quy trình thất bại',
  PROCESSING: 'Đang xử lý',
  APPROVED: 'Đã phê duyệt',
  REJECTED: 'Bị từ chối',
  CANCELLED: 'Đã hủy',
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

export type StepStatus = 'PENDING' | 'CURRENT' | 'DONE' | 'REJECTED' | 'SKIPPED';

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

export type HoiDongCap = 'CO_SO' | 'TAP_DOAN';

export const HOI_DONG_CAP_LABEL: Record<HoiDongCap, string> = {
  CO_SO: 'Cơ sở',
  TAP_DOAN: 'Tập đoàn',
};

export interface ThanhVienHoiDongResponse {
  hoTen: string;
  userId: string | null;
  vaiTroTrongHoiDong: string | null;
}

export interface HoiDongXetDuyetResponse {
  id: number;
  /** Nhãn nghiệp vụ tự đặt (VD "HD-2026-01"), duy nhất toàn hệ thống — khác `id` tự sinh. */
  maHoiDong: string;
  hoSoId: string;
  cap: HoiDongCap;
  /** null = tạo thủ công qua /hoi-dong, không sinh tự động từ workflow. */
  sourceTaskDefinitionKey: string | null;
  canCuPhapLy: string | null;
  createdAt: string;
  version: number;
  thanhVien: ThanhVienHoiDongResponse[];
}

export interface ThanhVienHoiDongRequest {
  hoTen: string;
  userId?: string | null;
  vaiTroTrongHoiDong?: string | null;
}

export interface CreateHoiDongRequest {
  maHoiDong: string;
  hoSoId: string;
  cap: HoiDongCap;
  canCuPhapLy?: string | null;
  thanhVien: ThanhVienHoiDongRequest[];
}

export interface UpdateHoiDongRequest {
  maHoiDong: string;
  canCuPhapLy?: string | null;
  thanhVien: ThanhVienHoiDongRequest[];
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
  taiLieu: HoSoDocument[];
  maDeTai: string;
  tenDeTai: string;
  chuNhiem: string;
  donVi: string;
  thoiGianThucHien: string | null;
  duToan: string;
  cap: Cap;
  hoiDongXetDuyet: HoiDongXetDuyetResponse[];
  tomTatAi: string | null;
}

export interface HoSoDocument {
  id: number;
  ten: string;
  loai: string;
  version: number;
  contentType: string | null;
  sizeBytes: number | null;
  hasContent: boolean;
}

export type UploadedHoSoDocument = HoSoDocument;

export interface CreateHoSoDocument {
  ten: string;
  loai: 'PDF' | 'Excel' | 'Archive';
}

export interface CreateHoSoRequest {
  maNV: string;
  loai: HoSoLoai;
  nguoiKhoiTao: string;
  ngayTao: string;
  taiLieu: CreateHoSoDocument[];
}

export interface SubmitHoSoRequest {
  quyTrinh: string;
  quyTrinhTen: string;
}

export type HoSoActionOutcome = 'APPROVE_STEP' | 'RETURN_STEP' | 'REJECT_STEP';

export interface HoSoActionRequest {
  outcome: HoSoActionOutcome;
  actor: string;
  yKien: string | null;
}

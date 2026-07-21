// Hồ sơ (HoSo) — INSTANCE của MỘT luồng nghiệp vụ trên một Nhiệm vụ KHCN.
// Một NhiemVu (data/nhiemVu.ts) có N HoSo. HoSo trỏ về NV qua FK `maNV`.
// UI dùng "view join" (Dossier = HoSo + trường NV) cho tiện — xem toView().
// Tham chiếu: docs/req/data-model-NV-vs-HoSo.md.

import { chuNhiemLabel, getNhiemVu, type Cap, type GiaiDoan, type NhiemVu } from './nhiemVu'
import type { TaskStep } from './processes'

export type StepStatus = 'done' | 'current' | 'pending' | 'rejected'
// draft = "Khởi tạo": hồ sơ mới lập, CHƯA gắn quy trình — chờ PM "Gửi duyệt".
// cancelled = hồ sơ bị hủy (không thuộc luồng phê duyệt thông thường).
export type DossierStatus = 'draft' | 'processing' | 'approved' | 'rejected' | 'cancelled'

/** Loại hồ sơ theo giai đoạn (RD01→RD06). */
export type HoSoLoai = 'Chủ trương' | 'Xét duyệt' | 'Báo cáo' | 'Điều chỉnh' | 'Nghiệm thu' | 'Quyết toán'

/** Ánh xạ loại hồ sơ → giai đoạn vòng đời NV KHCN. */
export const LOAI_TO_GIAIDOAN: Record<HoSoLoai, GiaiDoan> = {
  'Chủ trương': 'chu_truong',
  'Xét duyệt': 'xet_duyet',
  'Báo cáo': 'thuc_hien',
  'Điều chỉnh': 'dieu_chinh',
  'Nghiệm thu': 'nghiem_thu',
  'Quyết toán': 'quyet_toan',
}

/**
 * Loại hồ sơ → nhóm quy trình (data/processes.ts::NHOM). Dùng để lọc danh sách
 * quy trình khả dụng khi "Gửi duyệt" một hồ sơ Khởi tạo.
 */
export const LOAI_TO_NHOM: Record<HoSoLoai, string> = {
  'Chủ trương': 'RD01',
  'Xét duyệt': 'RD02',
  'Báo cáo': 'RD03',
  'Điều chỉnh': 'RD04',
  'Nghiệm thu': 'RD05',
  'Quyết toán': 'RD06',
}

export interface DossierStep {
  /** Key của user task trong catalog/BPMN mock, dùng để pin action policy theo bước. */
  taskDefinitionKey?: string
  ten: string
  /** Nhãn vai trò hiển thị (tiếng Việt, tự do). */
  vaiTro: string
  /**
   * Mã candidateGroup (Role.code trong data/roles.ts) — khớp
   * `zeebe:AssignmentDefinition candidateGroups` trong BPMN. Nguồn check quyền
   * xử lý bước (data/permissions.ts::canProcessStep). Rỗng → chỉ admin.
   */
  vaiTroCodes: string[]
  nguoi?: string
  trangThai: StepStatus
  thoiDiem?: string
  yKien?: string
  hanXuLy?: string
  formKey?: string
}

/** HoSo — bản ghi chuẩn hoá (chỉ giữ dữ liệu cấp hồ sơ + FK về NV). */
export interface HoSo {
  id: string
  /** FK → NhiemVu.ma */
  maNV: string
  loai: HoSoLoai
  quyTrinh: string
  quyTrinhTen: string
  nguoiKhoiTao: string
  ngayTao: string
  trangThai: DossierStatus
  buocHienTai: number
  steps: DossierStep[]
  taiLieu: { ten: string; loai: string }[]
}

/**
 * Dossier — VIEW join (HoSo + thông tin Nhiệm vụ). Dùng cho toàn bộ UI để không
 * phải tra NV thủ công. Lưu trữ vẫn chuẩn hoá 2 bảng (HoSo + NhiemVu).
 */
export interface Dossier extends HoSo {
  nv: NhiemVu
  maDeTai: string
  tenDeTai: string
  chuNhiem: string
  donVi: string
  duToan: string
  cap: Cap
}

export const DOSSIER_STATUS: Record<DossierStatus, { label: string; color: string }> = {
  draft: { label: 'Khởi tạo', color: 'default' },
  processing: { label: 'Đang xử lý', color: 'processing' },
  approved: { label: 'Đã phê duyệt', color: 'success' },
  rejected: { label: 'Bị từ chối', color: 'error' },
  cancelled: { label: 'Hủy', color: '#8593a3' },
}

/** Ghép HoSo với NhiemVu master → view hiển thị. */
export function toView(h: HoSo, nv: NhiemVu): Dossier {
  return {
    ...h,
    nv,
    maDeTai: nv.ma,
    tenDeTai: nv.ten,
    chuNhiem: chuNhiemLabel(nv.chuNhiem),
    donVi: nv.donViChuTri,
    duToan: nv.duToan,
    cap: nv.cap,
  }
}

/**
 * Ghép danh sách HoSo với NV (bỏ hồ sơ trỏ về NV không tồn tại).
 * `resolve` mặc định tra seed tĩnh; store truyền resolver động (NhiemVuContext)
 * để hồ sơ của NV vừa tạo cũng join được.
 */
export function joinDossiers(
  hoso: HoSo[],
  resolve: (ma: string) => NhiemVu | undefined = getNhiemVu,
): Dossier[] {
  return hoso.flatMap((h) => {
    const nv = resolve(h.maNV)
    return nv ? [toView(h, nv)] : []
  })
}

export function nextHoSoId(existing: Pick<HoSo, 'id'>[], year = 2026): string {
  let max = 0
  for (const h of existing) {
    const m = /HS-\d{4}-(\d+)/.exec(h.id)
    if (m) max = Math.max(max, parseInt(m[1], 10))
  }
  return `HS-${year}-${String(max + 1).padStart(3, '0')}`
}

/**
 * Dựng hồ sơ MỚI ở trạng thái "Khởi tạo" (draft) — CHƯA gắn quy trình.
 * Hồ sơ Chủ trương SINH RA CÙNG Nhiệm vụ mới (RD01 · "Sự kiện bắt đầu: Khởi tạo
 * nhiệm vụ"); các loại hồ sơ khác (Xét duyệt, Nghiệm thu…) dùng chung hàm này.
 * Quy trình chỉ được chọn khi PM bấm "Gửi duyệt" (DossierContext::submitHoSo) —
 * lúc đó mới dựng các bước phê duyệt từ taskSteps của quy trình (stepsFromTaskSteps).
 */
export function createDraftHoSo(
  nv: NhiemVu,
  opts: {
    id: string
    loai?: HoSoLoai
    nguoiKhoiTao: string
    ngayTao: string
    thoiDiemKhoiTao: string
    taiLieu?: { ten: string; loai: string }[]
  },
): HoSo {
  return {
    id: opts.id,
    maNV: nv.ma,
    loai: opts.loai ?? 'Chủ trương',
    quyTrinh: '',
    quyTrinhTen: 'Chưa vào quy trình',
    nguoiKhoiTao: opts.nguoiKhoiTao,
    ngayTao: opts.ngayTao,
    trangThai: 'draft',
    buocHienTai: 0,
    steps: [
      {
        ten: 'Khởi tạo hồ sơ',
        vaiTro: 'Chủ nhiệm đề tài (PM)',
        vaiTroCodes: ['PM'],
        nguoi: opts.nguoiKhoiTao,
        trangThai: 'done',
        thoiDiem: opts.thoiDiemKhoiTao,
      },
    ],
    taiLieu: opts.taiLieu ?? [
      { ten: 'Thuyết minh đề tài.pdf', loai: 'PDF' },
      { ten: 'Dự toán PL1-PL6.xlsx', loai: 'Excel' },
    ],
  }
}

/**
 * Dựng chuỗi bước phê duyệt từ taskSteps của quy trình được chọn khi Gửi duyệt.
 * Bỏ bước "Khởi tạo" đứng đầu (hồ sơ draft đã có bước này ở trạng thái done);
 * bước kế tiếp thành current kèm hạn xử lý. vaiTroCodes thiếu → [] (fail-closed,
 * chỉ admin xử lý được — xem data/permissions.ts::canProcessStep).
 */
export function stepsFromTaskSteps(
  taskSteps: Pick<TaskStep, 'key' | 'ten' | 'vaiTro' | 'vaiTroCodes' | 'hanhDong' | 'formKey'>[],
  opts: { hanXuLy: string },
): DossierStep[] {
  return taskSteps
    .filter((t, i) => !(i === 0 && t.hanhDong === 'Khởi tạo'))
    .map((t, i) => ({
      taskDefinitionKey: t.key,
      ten: t.ten,
      vaiTro: t.vaiTro,
      vaiTroCodes: t.vaiTroCodes ?? [],
      formKey: t.formKey,
      trangThai: i === 0 ? ('current' as const) : ('pending' as const),
      hanXuLy: i === 0 ? opts.hanXuLy : undefined,
    }))
}

export const seedHoSo: HoSo[] = [
  {
    // Hồ sơ vừa khởi tạo cùng NV — CHƯA gửi duyệt nên chưa gắn quy trình.
    // Demo nút "Gửi duyệt" (chọn quy trình RD01.01/RD01.02) ở màn chi tiết hồ sơ.
    id: 'HS-2026-031', maNV: 'RD.2026.031', loai: 'Chủ trương',
    quyTrinh: '', quyTrinhTen: 'Chưa vào quy trình',
    nguoiKhoiTao: 'ThS. Lê Thị Mai', ngayTao: '2026-07-02',
    trangThai: 'draft', buocHienTai: 0,
    steps: [
      { ten: 'Khởi tạo hồ sơ', vaiTro: 'Chủ nhiệm đề tài (PM)', vaiTroCodes: ['PM'], nguoi: 'ThS. Lê Thị Mai', trangThai: 'done', thoiDiem: '02/07/2026 09:30' },
    ],
    taiLieu: [
      { ten: 'Thuyết minh đề tài.pdf', loai: 'PDF' },
      { ten: 'Dự toán PL1-PL6.xlsx', loai: 'Excel' },
    ],
  },
  {
    id: 'HS-2026-018', maNV: 'RD.2026.018', loai: 'Chủ trương',
    quyTrinh: 'RD01.01', quyTrinhTen: 'Xét duyệt Chủ trương cấp Cơ sở',
    nguoiKhoiTao: 'TS. Trần Văn Nam', ngayTao: '2026-06-20',
    trangThai: 'processing', buocHienTai: 4,
    steps: [
      { ten: 'Khởi tạo hồ sơ', vaiTro: 'Chủ nhiệm đề tài (PM)', vaiTroCodes: ['PM'], nguoi: 'TS. Trần Văn Nam', trangThai: 'done', thoiDiem: '20/06/2026 09:12' },
      { ten: 'Ký duyệt cấp Trung tâm/Khối', vaiTro: 'BGĐ Trung tâm', vaiTroCodes: ['BGD_TT', 'BGD_KHOI'], nguoi: 'Đ/c Lê Minh Quang', trangThai: 'done', thoiDiem: '22/06/2026 14:30', yKien: 'Đồng ý trình xét duyệt.' },
      { ten: 'Thẩm định Cơ quan nghiệp vụ', vaiTro: 'TP CLKHCN, TCKT, NS, GĐ TTMS', vaiTroCodes: ['TP_CLKHCN', 'TP_TCKT', 'TP_NS', 'GD_TTMS'], nguoi: 'Phòng CLKHCN', trangThai: 'done', thoiDiem: '25/06/2026 10:05' },
      { ten: 'Lập Báo cáo thẩm định', vaiTro: 'CQ QLKHCN', vaiTroCodes: ['CQ_QLKHCN'], nguoi: 'Đ/c Phạm Thu Hà', trangThai: 'done', thoiDiem: '27/06/2026 16:40' },
      { ten: 'Hội đồng KHCN phê duyệt', vaiTro: 'Hội đồng KHCN VHT', vaiTroCodes: ['HDKHCN'], trangThai: 'current', hanXuLy: '05/07/2026' },
      { ten: 'TGĐ phê duyệt Quyết định chủ trương', vaiTro: 'Tổng Giám đốc VHT', vaiTroCodes: ['TGD_VHT'], trangThai: 'pending' },
    ],
    taiLieu: [
      { ten: 'Thuyết minh đề tài.pdf', loai: 'PDF' },
      { ten: 'Dự toán PL1-PL6.xlsx', loai: 'Excel' },
      { ten: 'Phiếu nhận xét CQNV.pdf', loai: 'PDF' },
    ],
  },
  {
    id: 'HS-2026-012', maNV: 'RD.2026.012', loai: 'Xét duyệt',
    quyTrinh: 'RD02.01', quyTrinhTen: 'Xét duyệt NV KHCN cấp Cơ sở',
    nguoiKhoiTao: 'ThS. Nguyễn Thị Lan', ngayTao: '2026-05-30',
    trangThai: 'approved', buocHienTai: 4,
    steps: [
      { ten: 'Khởi tạo hồ sơ', vaiTro: 'Chủ nhiệm đề tài (PM)', vaiTroCodes: ['PM'], nguoi: 'ThS. Nguyễn Thị Lan', trangThai: 'done', thoiDiem: '30/05/2026 08:20' },
      { ten: 'Chuyên quản thẩm định (Đạt/Chưa đạt)', vaiTro: 'CQ KHCN/MS/NS/TCKT', vaiTroCodes: ['CQ_KHCN', 'CQ_MS', 'CQ_NS', 'CQ_TCKT'], nguoi: 'Các chuyên quản', trangThai: 'done', thoiDiem: '03/06/2026 11:00' },
      { ten: 'Hội đồng Xét duyệt (phiên 1 & 2)', vaiTro: 'HĐXD cấp Cơ sở', vaiTroCodes: ['HDXD'], nguoi: 'HĐXD', trangThai: 'done', thoiDiem: '10/06/2026 15:30' },
      { ten: 'Hội đồng KHCN phê duyệt', vaiTro: 'Hội đồng KHCN VHT', vaiTroCodes: ['HDKHCN'], nguoi: 'HĐ KHCN', trangThai: 'done', thoiDiem: '14/06/2026 09:45' },
      { ten: 'TGĐ phê duyệt mở mới đề tài', vaiTro: 'Tổng Giám đốc VHT', vaiTroCodes: ['TGD_VHT'], nguoi: 'TGĐ', trangThai: 'done', thoiDiem: '16/06/2026 10:00', yKien: 'Phê duyệt mở mới.' },
    ],
    taiLieu: [
      { ten: 'Hồ sơ xét duyệt.pdf', loai: 'PDF' },
      { ten: 'Biên bản họp HĐXD.pdf', loai: 'PDF' },
    ],
  },
  {
    // Hồ sơ thứ 2 của CÙNG nhiệm vụ RD.2026.012 (minh hoạ 1 NV → N Hồ sơ):
    // đề tài đã xét duyệt xong, nay bước sang nghiệm thu.
    id: 'HS-2026-035', maNV: 'RD.2026.012', loai: 'Nghiệm thu',
    quyTrinh: 'RD05.01', quyTrinhTen: 'Nghiệm thu NV KHCN cấp Cơ sở',
    nguoiKhoiTao: 'ThS. Nguyễn Thị Lan', ngayTao: '2026-06-28',
    trangThai: 'processing', buocHienTai: 2,
    steps: [
      { ten: 'Khởi tạo hồ sơ nghiệm thu', vaiTro: 'Chủ nhiệm đề tài (PM)', vaiTroCodes: ['PM'], nguoi: 'ThS. Nguyễn Thị Lan', trangThai: 'done', thoiDiem: '28/06/2026 09:00' },
      { ten: 'Thẩm định chuyên quản', vaiTro: 'CQ KHCN/MS/NS/TCKT', vaiTroCodes: ['CQ_KHCN', 'CQ_MS', 'CQ_NS', 'CQ_TCKT'], nguoi: 'Các chuyên quản', trangThai: 'done', thoiDiem: '01/07/2026 10:00' },
      { ten: 'Hội đồng Nghiệm thu đánh giá', vaiTro: 'HĐ Nghiệm thu cấp CS', vaiTroCodes: ['HDNT'], trangThai: 'current', hanXuLy: '08/07/2026' },
      { ten: 'TGĐ công nhận kết quả', vaiTro: 'Tổng Giám đốc VHT', vaiTroCodes: ['TGD_VHT'], trangThai: 'pending' },
    ],
    taiLieu: [{ ten: 'Báo cáo tổng kết đề tài.pdf', loai: 'PDF' }],
  },
  {
    id: 'HS-2026-021', maNV: 'RD.2026.021', loai: 'Chủ trương',
    quyTrinh: 'RD01.02', quyTrinhTen: 'Xét duyệt Chủ trương cấp Tập đoàn',
    nguoiKhoiTao: 'TS. Hoàng Đức Anh', ngayTao: '2026-06-18',
    trangThai: 'rejected', buocHienTai: 2,
    steps: [
      { ten: 'Khởi tạo hồ sơ', vaiTro: 'Chủ nhiệm đề tài (PM)', vaiTroCodes: ['PM'], nguoi: 'TS. Hoàng Đức Anh', trangThai: 'done', thoiDiem: '18/06/2026 08:00' },
      { ten: 'Ký duyệt cấp Trung tâm/Khối', vaiTro: 'BGĐ Khối', vaiTroCodes: ['BGD_TT', 'BGD_KHOI'], nguoi: 'Đ/c Vũ Thành Long', trangThai: 'done', thoiDiem: '19/06/2026 13:20' },
      { ten: 'Thẩm định Cơ quan nghiệp vụ', vaiTro: 'TP CLKHCN, TCKT', vaiTroCodes: ['TP_CLKHCN', 'TP_TCKT'], nguoi: 'Phòng TCKT', trangThai: 'rejected', thoiDiem: '21/06/2026 09:10', yKien: 'Dự toán chưa phù hợp, đề nghị điều chỉnh PL2 và làm rõ nguồn vốn.' },
      { ten: 'Lập Báo cáo thẩm định', vaiTro: 'CQ QLKHCN', vaiTroCodes: ['CQ_QLKHCN'], trangThai: 'pending' },
      { ten: 'Hội đồng KHCN Tập đoàn', vaiTro: 'HĐ KHCN TĐ', vaiTroCodes: ['HDKHCN_TD'], trangThai: 'pending' },
      { ten: 'TGĐ Tập đoàn phê duyệt', vaiTro: 'Tổng Giám đốc Tập đoàn', vaiTroCodes: ['BTGD_TD'], trangThai: 'pending' },
    ],
    taiLieu: [{ ten: 'Thuyết minh đề tài.pdf', loai: 'PDF' }],
  },
  {
    id: 'HS-2026-009', maNV: 'RD.2026.009', loai: 'Nghiệm thu',
    quyTrinh: 'RD05.01', quyTrinhTen: 'Nghiệm thu NV KHCN cấp Cơ sở',
    nguoiKhoiTao: 'KS. Đỗ Quốc Bảo', ngayTao: '2026-06-10',
    trangThai: 'processing', buocHienTai: 3,
    steps: [
      { ten: 'Khởi tạo hồ sơ nghiệm thu', vaiTro: 'Chủ nhiệm đề tài (PM)', vaiTroCodes: ['PM'], nguoi: 'KS. Đỗ Quốc Bảo', trangThai: 'done', thoiDiem: '10/06/2026 09:00' },
      { ten: 'Thẩm định chuyên quản', vaiTro: 'CQ KHCN/MS/NS/TCKT', vaiTroCodes: ['CQ_KHCN', 'CQ_MS', 'CQ_NS', 'CQ_TCKT'], nguoi: 'Các chuyên quản', trangThai: 'done', thoiDiem: '13/06/2026 14:00' },
      { ten: 'QĐ thành lập Hội đồng Nghiệm thu', vaiTro: 'CQ QLKHCN', vaiTroCodes: ['CQ_QLKHCN'], nguoi: 'Đ/c Phạm Thu Hà', trangThai: 'done', thoiDiem: '18/06/2026 10:30' },
      { ten: 'Hội đồng Nghiệm thu đánh giá', vaiTro: 'HĐ Nghiệm thu cấp CS', vaiTroCodes: ['HDNT'], trangThai: 'current', hanXuLy: '01/07/2026' },
      { ten: 'TGĐ công nhận kết quả', vaiTro: 'Tổng Giám đốc VHT', vaiTroCodes: ['TGD_VHT'], trangThai: 'pending' },
    ],
    taiLieu: [
      { ten: 'Báo cáo tổng kết đề tài.pdf', loai: 'PDF' },
      { ten: 'Sản phẩm & kết quả.zip', loai: 'Archive' },
    ],
  },
  {
    id: 'HS-2026-025', maNV: 'RD.2026.025', loai: 'Xét duyệt',
    quyTrinh: 'RD02.01', quyTrinhTen: 'Xét duyệt NV KHCN cấp Cơ sở',
    nguoiKhoiTao: 'TS. Phan Anh Tuấn', ngayTao: '2026-06-24',
    trangThai: 'processing', buocHienTai: 1,
    steps: [
      { ten: 'Khởi tạo hồ sơ', vaiTro: 'Chủ nhiệm đề tài (PM)', vaiTroCodes: ['PM'], nguoi: 'TS. Phan Anh Tuấn', trangThai: 'done', thoiDiem: '24/06/2026 08:40' },
      { ten: 'Chuyên quản thẩm định (Đạt/Chưa đạt)', vaiTro: 'CQ KHCN/MS/NS/TCKT', vaiTroCodes: ['CQ_KHCN', 'CQ_MS', 'CQ_NS', 'CQ_TCKT'], trangThai: 'current', hanXuLy: '30/06/2026' },
      { ten: 'Hội đồng Xét duyệt (phiên 1 & 2)', vaiTro: 'HĐXD cấp Cơ sở', vaiTroCodes: ['HDXD'], trangThai: 'pending' },
      { ten: 'Hội đồng KHCN phê duyệt', vaiTro: 'Hội đồng KHCN VHT', vaiTroCodes: ['HDKHCN'], trangThai: 'pending' },
      { ten: 'TGĐ phê duyệt mở mới đề tài', vaiTro: 'Tổng Giám đốc VHT', vaiTroCodes: ['TGD_VHT'], trangThai: 'pending' },
    ],
    taiLieu: [{ ten: 'Hồ sơ xét duyệt.pdf', loai: 'PDF' }, { ten: 'Dự toán PL1-PL6.xlsx', loai: 'Excel' }],
  },
  {
    id: 'HS-2026-027', maNV: 'RD.2026.027', loai: 'Chủ trương',
    quyTrinh: 'RD01.01', quyTrinhTen: 'Xét duyệt Chủ trương cấp Cơ sở',
    nguoiKhoiTao: 'ThS. Bùi Quang Huy', ngayTao: '2026-06-29',
    trangThai: 'processing', buocHienTai: 1,
    steps: [
      { ten: 'Khởi tạo hồ sơ', vaiTro: 'Chủ nhiệm đề tài (PM)', vaiTroCodes: ['PM'], nguoi: 'ThS. Bùi Quang Huy', trangThai: 'done', thoiDiem: '29/06/2026 15:10' },
      { ten: 'Ký duyệt cấp Trung tâm/Khối', vaiTro: 'BGĐ Trung tâm', vaiTroCodes: ['BGD_TT', 'BGD_KHOI'], trangThai: 'current', hanXuLy: '08/07/2026' },
      { ten: 'Thẩm định Cơ quan nghiệp vụ', vaiTro: 'TP CLKHCN, TCKT, NS, GĐ TTMS', vaiTroCodes: ['TP_CLKHCN', 'TP_TCKT', 'TP_NS', 'GD_TTMS'], trangThai: 'pending' },
      { ten: 'Lập Báo cáo thẩm định', vaiTro: 'CQ QLKHCN', vaiTroCodes: ['CQ_QLKHCN'], trangThai: 'pending' },
      { ten: 'Hội đồng KHCN phê duyệt', vaiTro: 'Hội đồng KHCN VHT', vaiTroCodes: ['HDKHCN'], trangThai: 'pending' },
      { ten: 'TGĐ phê duyệt Quyết định chủ trương', vaiTro: 'Tổng Giám đốc VHT', vaiTroCodes: ['TGD_VHT'], trangThai: 'pending' },
    ],
    taiLieu: [{ ten: 'Thuyết minh đề tài.pdf', loai: 'PDF' }],
  },
  {
    id: 'HS-2026-030', maNV: 'RD.2026.030', loai: 'Nghiệm thu',
    quyTrinh: 'RD05.02', quyTrinhTen: 'Nghiệm thu NV KHCN cấp Tập đoàn',
    nguoiKhoiTao: 'TS. Ngô Việt Hà', ngayTao: '2026-06-08',
    trangThai: 'processing', buocHienTai: 3,
    steps: [
      { ten: 'Khởi tạo hồ sơ nghiệm thu', vaiTro: 'Chủ nhiệm đề tài (PM)', vaiTroCodes: ['PM'], nguoi: 'TS. Ngô Việt Hà', trangThai: 'done', thoiDiem: '08/06/2026 09:00' },
      { ten: 'Thẩm định chuyên quản', vaiTro: 'CQ KHCN/MS/NS/TCKT', vaiTroCodes: ['CQ_KHCN', 'CQ_MS', 'CQ_NS', 'CQ_TCKT'], nguoi: 'Các chuyên quản', trangThai: 'done', thoiDiem: '14/06/2026 10:00' },
      { ten: 'QĐ TL HĐNT + CV đề nghị nghiệm thu cấp TĐ', vaiTro: 'CQ QLKHCN', vaiTroCodes: ['CQ_QLKHCN'], nguoi: 'Đ/c Phạm Thu Hà', trangThai: 'done', thoiDiem: '22/06/2026 11:20' },
      { ten: 'Hội đồng Nghiệm thu Tập đoàn (có Tổ KT)', vaiTro: 'HĐ Nghiệm thu Tập đoàn', vaiTroCodes: ['HDNT_TD'], trangThai: 'current', hanXuLy: '04/07/2026' },
      { ten: 'BTGĐ Tập đoàn công nhận kết quả', vaiTro: 'BTGĐ Tập đoàn', vaiTroCodes: ['BTGD_TD'], trangThai: 'pending' },
    ],
    taiLieu: [{ ten: 'Báo cáo tổng kết đề tài.pdf', loai: 'PDF' }, { ten: 'Biên bản Tổ KT.pdf', loai: 'PDF' }],
  },
  {
    // Hồ sơ RD02.02 cho RD.2026.021 — "Việc của tôi" cho PM (TS. Hoàng Đức Anh)
    // Demo: score=81.4 >= 70 → DMN outputs "APPROVED" → Task_11 (thông qua)
    // Đang ở B03: Xây dựng Bộ HSXD dự thảo 1
    // Các biểu mẫu demo: C:\Users\trangdt75\Downloads\RD02_02_DEMO_FORMS\RD02_02_Bo_bieu_mau_demo\
    id: 'HS-2026-043',
    maNV: 'RD.2026.021',
    loai: 'Xét duyệt',
    quyTrinh: 'RD02.02',
    quyTrinhTen: 'Xét duyệt NV KHCN cấp Tập đoàn',
    nguoiKhoiTao: 'TS. Hoàng Đức Anh',
    ngayTao: '2026-07-15',
    trangThai: 'processing',
    buocHienTai: 1,
    steps: [
      { ten: '1. Khởi tạo luồng RD02.02', vaiTro: 'PM', vaiTroCodes: ['PM'], nguoi: 'TS. Hoàng Đức Anh', trangThai: 'done', thoiDiem: '15/07/2026 09:00' },
      { ten: '2. Xây dựng HSXD dự thảo 1', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM', 'PA', 'NNC'], nguoi: 'TS. Hoàng Đức Anh', trangThai: 'current', hanXuLy: '30/07/2026' },
      { ten: '3.1. Thẩm định KHCN', vaiTro: 'CQ KHCN VHT', vaiTroCodes: ['CQ_KHCN'], trangThai: 'pending' },
      { ten: '3.2. Thẩm định TCKT', vaiTro: 'CQ TCKT VHT', vaiTroCodes: ['CQ_TCKT'], trangThai: 'pending' },
      { ten: '3.3. Thẩm định Mua sắm', vaiTro: 'CQ MS VHT', vaiTroCodes: ['CQ_MS'], trangThai: 'pending' },
      { ten: '3.4. Thẩm định Nhân sự', vaiTro: 'CQ NS VHT', vaiTroCodes: ['CQ_NS'], trangThai: 'pending' },
      { ten: '3.5. Nhận PNX và hoàn chỉnh HSXD dự thảo 2', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM', 'PA', 'NNC'], trangThai: 'pending' },
      { ten: '4. Ký HSXD dự thảo 2', vaiTro: 'BGĐ Trung tâm/Khối', vaiTroCodes: ['BGD_TT', 'BGD_KHOI'], trangThai: 'pending' },
      { ten: '5. Lập và trình QĐ thành lập HĐXD VHT', vaiTro: 'TP CLKHCN', vaiTroCodes: ['TP_CLKHCN'], trangThai: 'pending' },
      { ten: '6. Phê duyệt QĐ thành lập HĐXD VHT', vaiTro: 'CQ QLKHCN VHT', vaiTroCodes: ['CQ_QLKHCN'], trangThai: 'pending' },
      { ten: '7. Họp HĐXD VHT phiên 1', vaiTro: 'HĐXD VHT', vaiTroCodes: ['HDXD_VHT'], trangThai: 'pending' },
      { ten: '8. Hoàn thiện HSXD dự thảo 3', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM', 'PA', 'NNC'], trangThai: 'pending' },
      { ten: '9.1. Rà soát KHCN', vaiTro: 'CQ KHCN VHT', vaiTroCodes: ['CQ_KHCN'], trangThai: 'pending' },
      { ten: '9.2. Rà soát TCKT', vaiTro: 'CQ TCKT VHT', vaiTroCodes: ['CQ_TCKT'], trangThai: 'pending' },
      { ten: '9.3. Rà soát Mua sắm', vaiTro: 'CQ MS VHT', vaiTroCodes: ['CQ_MS'], trangThai: 'pending' },
      { ten: '9.4. Rà soát Nhân sự', vaiTro: 'CQ NS VHT', vaiTroCodes: ['CQ_NS'], trangThai: 'pending' },
      { ten: '10. Họp HĐXD VHT phiên 2', vaiTro: 'HĐXD VHT', vaiTroCodes: ['HDXD_VHT'], trangThai: 'pending' },
      { ten: '11. Lập CV đề nghị xét duyệt cấp Tập đoàn', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM', 'PA', 'NNC'], trangThai: 'pending' },
    ],
    taiLieu: [
      // Biểu mẫu RD02.02 — C:\Users\trangdt75\Downloads\RD02_02_DEMO_FORMS\RD02_02_Bo_bieu_mau_demo\
      { ten: 'BM.02.01 - Đơn đăng ký.docx', loai: 'Word' },              // Task_1: Khởi tạo
      { ten: 'BM.02.02 - Tờ trình đề xuất NVKHCN.docx', loai: 'Word' },   // Task_2: Xây dựng HSXD dự thảo 1
      { ten: 'BM.02.03 - Thuyết minh rút gọn.docx', loai: 'Word' },     // Task_2: HSXD rút gọn
      { ten: 'BM.02.03 - Thuyết minh đầy đủ.pdf', loai: 'PDF' },         // Task_2: HSXD đầy đủ
      { ten: 'BM.02.04 - Báo cáo tổng hợp KT-KT ban đầu.docx', loai: 'Word' }, // Task_2
      { ten: 'BM.02.05 - Báo cáo tiến độ thực hiện.docx', loai: 'Word' }, // Task_3–9
      { ten: 'BM.02.06 - Báo cáo nghiệm thu.docx', loai: 'Word' },       // Task_6
      { ten: 'BM.02.07 - Báo cáo quyết toán.docx', loai: 'Word' },       // Task_11
      { ten: 'Checklist kiểm tra đầu vào.pdf', loai: 'PDF' },           // Task_CheckDraft1
      { ten: 'BM.02.08 - QĐ thành lập HĐXD VHT.docx', loai: 'Word' },   // Task_5: Lập QĐ HĐXD
      { ten: 'BM.02.09 - Phiếu nhận xét.docx', loai: 'Word' },           // Task_6, Task_7, Task_10
      { ten: 'BM.02.10 - Đề xuất sản xuất.doc', loai: 'Word' },           // Task_3.5: Hoàn thiện HSXD dự thảo 2
      { ten: 'BM.02.12 - Phiếu đánh giá 8.2 điểm.docx', loai: 'Word' },  // Task_7: Họp HĐXD phiên 1
      { ten: 'BM.02.15 - Biên bản họp HĐXD.docx', loai: 'Word' },       // Task_10: Họp HĐXD phiên 2
      { ten: 'BM.02.16 - Báo cáo hoàn thiện HSXD.docx', loai: 'Word' },  // Task_8: Hoàn thiện HSXD dự thảo 3
      { ten: 'BM.02.17 - Tờ trình phê duyệt.docx', loai: 'Word' },       // Task_11: CV đề nghị xét duyệt Tập đoàn
      { ten: 'Thuyết minh đề tài.pdf', loai: 'PDF' },
      { ten: 'Dự toán PL1-PL6.xlsx', loai: 'Excel' },
      // BM bổ sung từ folder "02-Xet duyet" — BM.02.13, 02.14, 02.18–02.21
      { ten: 'BM.02.13 - Đánh giá thẩm định Sản xuất.doc', loai: 'Word' }, // Task_9.3: Rà soát Mua sắm
      { ten: 'BM.02.14 - Đánh giá thẩm định Dự toán.doc', loai: 'Word' }, // Task_9.x: Thẩm định TCKT
      { ten: 'BM.02.18 - Báo cáo kết quả nghiệm thu.docx', loai: 'Word' }, // Task_6: Báo cáo nghiệm thu
      { ten: 'BM.02.19 - Quyết định công nhận kết quả.doc', loai: 'Word' }, // Task_7: QĐ kết quả
      { ten: 'BM.02.20 - Giấy xác nhận nghiệm thu Văn bản.doc', loai: 'Word' }, // Task_6: Giấy xác nhận
      { ten: 'BM.02.21 - Hướng dẫn điều chỉnh.doc', loai: 'Word' },       // Task_8: Điều chỉnh HSXD
    ],
  },
]

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

  // ─── RD03 — Báo cáo tiến độ / đồng bộ thực hiện ─────────────────────────
  {
    id: 'HS-2026-050',
    maNV: 'RD.2026.033',
    loai: 'Báo cáo',
    quyTrinh: 'RD03.06',
    quyTrinhTen: 'Báo cáo tiến độ thực hiện đề tài',
    nguoiKhoiTao: 'ThS. Nguyễn Thị Lan',
    ngayTao: '2026-08-20',
    trangThai: 'processing',
    buocHienTai: 1,
    steps: [
      { taskDefinitionKey: 'rd0306_t1', ten: 'Khởi tạo / cập nhật Báo cáo tiến độ', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM', 'PA', 'NNC'], nguoi: 'ThS. Nguyễn Thị Lan', trangThai: 'done', thoiDiem: '20/08/2026 09:15' },
      { taskDefinitionKey: 'rd0306_t2', ten: 'Chuyên quản nhận xét (KHCN/MS/NS/TCKT)', vaiTro: 'CQ KHCN/MS/NS/TCKT', vaiTroCodes: ['CQ_KHCN', 'CQ_MS', 'CQ_NS', 'CQ_TCKT'], trangThai: 'current', hanXuLy: '05/09/2026' },
      { taskDefinitionKey: 'rd0306_t3', ten: 'BGĐ TT/Khối ký duyệt', vaiTro: 'BGĐ Trung tâm/Khối', vaiTroCodes: ['BGD_TT', 'BGD_KHOI'], trangThai: 'pending' },
      { taskDefinitionKey: 'rd0306_t4', ten: 'CQNV VHT (TP CLKHCN/TCKT) ký duyệt', vaiTro: 'TP CLKHCN / TP TCKT', vaiTroCodes: ['TP_CLKHCN', 'TP_TCKT'], trangThai: 'pending' },
      { taskDefinitionKey: 'rd0306_t5', ten: 'BTGĐ VHT phê duyệt Báo cáo', vaiTro: 'Phó TGĐ Chuyên trách', vaiTroCodes: ['PTGD_CT'], trangThai: 'pending' },
    ],
    taiLieu: [
      { ten: 'BM.03.06 - Báo cáo tiến độ đợt 1 (6 tháng).docx', loai: 'Word' },
      { ten: 'Phụ lục khối lượng hoàn thành.xlsx', loai: 'Excel' },
      { ten: 'Minh chứng tiến độ.zip', loai: 'Archive' },
    ],
  },
  {
    // Draft — demo Gửi duyệt chọn RD03.06 / RD03.01–03
    id: 'HS-2026-051',
    maNV: 'RD.2026.033',
    loai: 'Báo cáo',
    quyTrinh: '',
    quyTrinhTen: 'Chưa vào quy trình',
    nguoiKhoiTao: 'ThS. Nguyễn Thị Lan',
    ngayTao: '2026-09-01',
    trangThai: 'draft',
    buocHienTai: 0,
    steps: [
      { ten: 'Khởi tạo hồ sơ', vaiTro: 'Chủ nhiệm đề tài (PM)', vaiTroCodes: ['PM'], nguoi: 'ThS. Nguyễn Thị Lan', trangThai: 'done', thoiDiem: '01/09/2026 10:00' },
    ],
    taiLieu: [
      { ten: 'Báo cáo định kỳ.pdf', loai: 'PDF' },
      { ten: 'Phụ lục tiến độ.xlsx', loai: 'Excel' },
    ],
  },
  {
    id: 'HS-2026-052',
    maNV: 'RD.2026.033',
    loai: 'Báo cáo',
    quyTrinh: 'RD03.03',
    quyTrinhTen: 'Tương tác PM QLKHCN ↔ SAP (chi phí)',
    nguoiKhoiTao: 'ThS. Nguyễn Thị Lan',
    ngayTao: '2026-08-25',
    trangThai: 'processing',
    buocHienTai: 2,
    steps: [
      { taskDefinitionKey: 'rd0303_t1', ten: 'Khởi tạo yêu cầu đồng bộ chi phí SAP', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM', 'PA', 'NNC'], nguoi: 'ThS. Nguyễn Thị Lan', trangThai: 'done', thoiDiem: '25/08/2026 08:40' },
      { taskDefinitionKey: 'rd0303_t2', ten: 'Mapping mã NV ↔ Internal Order SAP', vaiTro: 'CQ TCKT VHT', vaiTroCodes: ['CQ_TCKT'], nguoi: 'CQ TCKT', trangThai: 'done', thoiDiem: '26/08/2026 11:20' },
      { taskDefinitionKey: 'rd0303_t3', ten: 'Kéo số liệu kinh phí thực hiện PL1–PL6', vaiTro: 'CQ TCKT VHT', vaiTroCodes: ['CQ_TCKT'], trangThai: 'current', hanXuLy: '10/09/2026' },
      { taskDefinitionKey: 'rd0303_t4', ten: 'Xác nhận số liệu chi phí đề tài', vaiTro: 'TP TCKT', vaiTroCodes: ['TP_TCKT'], trangThai: 'pending' },
    ],
    taiLieu: [
      { ten: 'Bảng mapping IO-SAP.xlsx', loai: 'Excel' },
      { ten: 'Chi phí thực hiện PL1-PL6.xlsx', loai: 'Excel' },
    ],
  },

  // ─── RD04 — Điều chỉnh ───────────────────────────────────────────────────
  {
    id: 'HS-2026-060',
    maNV: 'RD.2026.034',
    loai: 'Điều chỉnh',
    quyTrinh: 'RD04.01',
    quyTrinhTen: 'Điều chỉnh Chủ nhiệm qua CQ KHCN (CS)',
    nguoiKhoiTao: 'TS. Trần Văn Nam',
    ngayTao: '2026-08-18',
    trangThai: 'processing',
    buocHienTai: 2,
    steps: [
      { taskDefinitionKey: 'rd0401_t1', ten: 'Khởi tạo hồ sơ điều chỉnh CNĐT (PM cũ)', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM', 'PA', 'NNC'], nguoi: 'TS. Trần Văn Nam', trangThai: 'done', thoiDiem: '18/08/2026 09:00' },
      { taskDefinitionKey: 'rd0401_t2', ten: 'PM mới ký duyệt tiếp nhận', vaiTro: 'PM (mới)', vaiTroCodes: ['PM'], nguoi: 'ThS. Nguyễn Thị Lan', trangThai: 'done', thoiDiem: '20/08/2026 14:10' },
      { taskDefinitionKey: 'rd0401_t3', ten: 'BGĐ TT/Khối ký duyệt', vaiTro: 'BGĐ Trung tâm/Khối', vaiTroCodes: ['BGD_TT', 'BGD_KHOI'], trangThai: 'current', hanXuLy: '08/09/2026' },
      { taskDefinitionKey: 'rd0401_t4', ten: 'CQ KHCN thẩm định điều kiện', vaiTro: 'CQ KHCN VHT', vaiTroCodes: ['CQ_KHCN', 'TP_CLKHCN'], trangThai: 'pending' },
      { taskDefinitionKey: 'rd0401_t5', ten: 'BTGĐ phê duyệt QĐ điều chỉnh CNĐT', vaiTro: 'TGĐ / Phó TGĐ', vaiTroCodes: ['TGD_VHT', 'PTGD_CT'], trangThai: 'pending' },
    ],
    taiLieu: [
      { ten: 'Tờ trình điều chỉnh CNĐT.docx', loai: 'Word' },
      { ten: 'Lý lịch khoa học PM mới.pdf', loai: 'PDF' },
    ],
  },
  {
    id: 'HS-2026-061',
    maNV: 'RD.2026.034',
    loai: 'Điều chỉnh',
    quyTrinh: 'RD04.03',
    quyTrinhTen: 'Điều chỉnh qua HĐXD ĐC (CS)',
    nguoiKhoiTao: 'TS. Trần Văn Nam',
    ngayTao: '2026-08-22',
    trangThai: 'processing',
    buocHienTai: 1,
    steps: [
      { taskDefinitionKey: 'rd0403_t1', ten: 'Khởi tạo hồ sơ điều chỉnh (HĐXD ĐC)', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM', 'PA', 'NNC'], nguoi: 'TS. Trần Văn Nam', trangThai: 'done', thoiDiem: '22/08/2026 08:30' },
      { taskDefinitionKey: 'rd0403_t2', ten: 'Chuyên quản thẩm định (Đạt/Chưa đạt)', vaiTro: 'CQ KHCN/MS/NS/TCKT', vaiTroCodes: ['CQ_KHCN', 'CQ_MS', 'CQ_NS', 'CQ_TCKT'], trangThai: 'current', hanXuLy: '12/09/2026' },
      { taskDefinitionKey: 'rd0403_t3', ten: 'QĐ thành lập HĐXD điều chỉnh', vaiTro: 'CQ QLKHCN', vaiTroCodes: ['CQ_QLKHCN', 'TP_CLKHCN'], trangThai: 'pending' },
      { taskDefinitionKey: 'rd0403_t4', ten: 'HĐXD ĐC họp phiên 1 & 2', vaiTro: 'HĐXD điều chỉnh', vaiTroCodes: ['HDXD_DC', 'HDXD'], trangThai: 'pending' },
      { taskDefinitionKey: 'rd0403_t5', ten: 'TGĐ phê duyệt QĐ điều chỉnh NV', vaiTro: 'Tổng Giám đốc VHT', vaiTroCodes: ['TGD_VHT'], trangThai: 'pending' },
    ],
    taiLieu: [
      { ten: 'HS điều chỉnh mục tiêu & dự toán.pdf', loai: 'PDF' },
      { ten: 'Dự toán điều chỉnh PL1-PL6.xlsx', loai: 'Excel' },
    ],
  },
  {
    id: 'HS-2026-062',
    maNV: 'RD.2026.012',
    loai: 'Điều chỉnh',
    quyTrinh: '',
    quyTrinhTen: 'Chưa vào quy trình',
    nguoiKhoiTao: 'ThS. Nguyễn Thị Lan',
    ngayTao: '2026-09-02',
    trangThai: 'draft',
    buocHienTai: 0,
    steps: [
      { ten: 'Khởi tạo hồ sơ', vaiTro: 'Chủ nhiệm đề tài (PM)', vaiTroCodes: ['PM'], nguoi: 'ThS. Nguyễn Thị Lan', trangThai: 'done', thoiDiem: '02/09/2026 09:20' },
    ],
    taiLieu: [
      { ten: 'Tờ trình điều chỉnh.docx', loai: 'Word' },
      { ten: 'Thuyết minh điều chỉnh.pdf', loai: 'PDF' },
      { ten: 'Dự toán điều chỉnh.xlsx', loai: 'Excel' },
    ],
  },

  // ─── RD05 bổ sung — nghiệm thu đã duyệt (gate mở RD06) ───────────────────
  {
    id: 'HS-2026-070',
    maNV: 'RD.2026.035',
    loai: 'Nghiệm thu',
    quyTrinh: 'RD05.01',
    quyTrinhTen: 'Nghiệm thu NV KHCN cấp Cơ sở',
    nguoiKhoiTao: 'KS. Đỗ Quốc Bảo',
    ngayTao: '2026-07-10',
    trangThai: 'approved',
    buocHienTai: 5,
    steps: [
      { taskDefinitionKey: 't1', ten: 'Khởi tạo hồ sơ nghiệm thu', vaiTro: 'PM/PA/NNC', vaiTroCodes: ['PM'], nguoi: 'KS. Đỗ Quốc Bảo', trangThai: 'done', thoiDiem: '10/07/2026 09:00' },
      { taskDefinitionKey: 't2', ten: 'BGĐ TT/Khối ký duyệt hồ sơ', vaiTro: 'BGĐ Trung tâm/Khối', vaiTroCodes: ['BGD_TT', 'BGD_KHOI'], nguoi: 'BGĐ TT', trangThai: 'done', thoiDiem: '12/07/2026 10:00' },
      { taskDefinitionKey: 't3', ten: 'Thẩm định chuyên quản', vaiTro: 'CQ KHCN/MS/NS/TCKT', vaiTroCodes: ['CQ_KHCN', 'CQ_MS', 'CQ_NS', 'CQ_TCKT'], nguoi: 'Các chuyên quản', trangThai: 'done', thoiDiem: '18/07/2026 14:00' },
      { taskDefinitionKey: 't4', ten: 'QĐ thành lập Hội đồng Nghiệm thu', vaiTro: 'CQ QLKHCN', vaiTroCodes: ['CQ_QLKHCN', 'TP_CLKHCN'], nguoi: 'Đ/c Phạm Thu Hà', trangThai: 'done', thoiDiem: '22/07/2026 11:00' },
      { taskDefinitionKey: 't5', ten: 'Hội đồng Nghiệm thu đánh giá (phiên 1 & 2)', vaiTro: 'HĐ Nghiệm thu cấp CS', vaiTroCodes: ['HDNT'], nguoi: 'HĐNT', trangThai: 'done', thoiDiem: '05/08/2026 15:30' },
      { taskDefinitionKey: 't6', ten: 'TGĐ công nhận kết quả nghiệm thu', vaiTro: 'TGĐ VHT', vaiTroCodes: ['TGD_VHT'], nguoi: 'TGĐ', trangThai: 'done', thoiDiem: '12/08/2026 10:00', yKien: 'Công nhận kết quả nghiệm thu — Đạt.' },
    ],
    taiLieu: [
      { ten: 'Báo cáo tổng kết đề tài.pdf', loai: 'PDF' },
      { ten: 'Biên bản HĐNT.pdf', loai: 'PDF' },
      { ten: 'QĐ công nhận kết quả.doc', loai: 'Word' },
    ],
  },

  // ─── RD06 — Quyết toán ───────────────────────────────────────────────────
  {
    id: 'HS-2026-080',
    maNV: 'RD.2026.035',
    loai: 'Quyết toán',
    quyTrinh: 'RD06.01',
    quyTrinhTen: 'Quyết toán NV KHCN cấp Cơ sở',
    nguoiKhoiTao: 'CQ TCKT — Đ/c Lê Thu Hà',
    ngayTao: '2026-08-15',
    trangThai: 'processing',
    buocHienTai: 6,
    steps: [
      {
        taskDefinitionKey: 'rd0601_t1',
        ten: '1. Khởi động luồng QT RD06.01',
        vaiTro: 'CQ TCKT',
        vaiTroCodes: ['CQ_TCKT'],
        nguoi: 'Đ/c Lê Thu Hà',
        trangThai: 'done',
        thoiDiem: '15/08/2026 09:00',
      },
      {
        taskDefinitionKey: 'rd0601_t2',
        ten: '2. Gửi VT34, triển khai xây dựng BM',
        vaiTro: 'CQ TCKT',
        vaiTroCodes: ['CQ_TCKT'],
        nguoi: 'Đ/c Lê Thu Hà',
        trangThai: 'done',
        thoiDiem: '15/08/2026 09:30',
      },
      {
        taskDefinitionKey: 'rd0601_t3',
        ten: '3. Lập BM3, 4, 8',
        vaiTro: 'CQ TCKT',
        vaiTroCodes: ['CQ_TCKT'],
        nguoi: 'CQ TCKT',
        trangThai: 'done',
        thoiDiem: '20/08/2026 11:00',
      },
      {
        taskDefinitionKey: 'rd0601_t4',
        ten: '4. Lập BM5, 6, 7; Chứng từ tài sản',
        vaiTro: 'PM',
        vaiTroCodes: ['PM', 'PA', 'NNC'],
        nguoi: 'KS. Đỗ Quốc Bảo',
        trangThai: 'done',
        thoiDiem: '22/08/2026 16:00',
      },
      {
        taskDefinitionKey: 'rd0601_t5',
        ten: '5. Lập BM2',
        vaiTro: 'TTMS',
        vaiTroCodes: ['CQ_MS', 'GD_TTMS'],
        nguoi: 'TTMS',
        trangThai: 'done',
        thoiDiem: '22/08/2026 15:20',
      },
      {
        taskDefinitionKey: 'rd0601_t6',
        ten: '6. Lập BM Chi phí nhân công',
        vaiTro: 'P.NS',
        vaiTroCodes: ['CQ_NS', 'TP_NS'],
        nguoi: 'P.NS',
        trangThai: 'done',
        thoiDiem: '23/08/2026 10:10',
      },
      {
        taskDefinitionKey: 'rd0601_t7',
        ten: '7. Rà soát, thẩm định BM5, 6, 7',
        vaiTro: 'CQ CLKHCN / CQ TS',
        vaiTroCodes: ['CQ_KHCN', 'TP_CLKHCN'],
        trangThai: 'current',
        hanXuLy: '15/09/2026',
      },
      {
        taskDefinitionKey: 'rd0601_t8',
        ten: '8. Tổng hợp, thẩm định chung',
        vaiTro: 'CQ TCKT',
        vaiTroCodes: ['CQ_TCKT'],
        trangThai: 'pending',
      },
      {
        taskDefinitionKey: 'rd0601_t9',
        ten: '9. Lập, trình BC TH Quyết toán; Lập QĐ phê duyệt QT',
        vaiTro: 'CQ TCKT',
        vaiTroCodes: ['CQ_TCKT'],
        trangThai: 'pending',
      },
      {
        taskDefinitionKey: 'rd0601_t10',
        ten: '10. Ký thẩm định HS',
        vaiTro: 'CQ CLKHCN / CQ TS',
        vaiTroCodes: ['CQ_KHCN', 'TP_CLKHCN'],
        trangThai: 'pending',
      },
      {
        taskDefinitionKey: 'rd0601_t11',
        ten: '11. Ký thẩm định HS',
        vaiTro: 'PM',
        vaiTroCodes: ['PM', 'PA', 'NNC'],
        trangThai: 'pending',
      },
      {
        taskDefinitionKey: 'rd0601_t12',
        ten: '12. Ký thẩm định HS',
        vaiTro: 'TTMS',
        vaiTroCodes: ['CQ_MS', 'GD_TTMS'],
        trangThai: 'pending',
      },
      {
        taskDefinitionKey: 'rd0601_t13',
        ten: '13. Ký thẩm định HS',
        vaiTro: 'P.NS',
        vaiTroCodes: ['CQ_NS', 'TP_NS'],
        trangThai: 'pending',
      },
      {
        taskDefinitionKey: 'rd0601_t14',
        ten: '14. Ký duyệt HS',
        vaiTro: 'GĐ TT / BGĐ Khối',
        vaiTroCodes: ['BGD_TT', 'BGD_KHOI'],
        trangThai: 'pending',
      },
      {
        taskDefinitionKey: 'rd0601_t15',
        ten: '15. Ký duyệt BC',
        vaiTro: 'CQNV VHT',
        vaiTroCodes: ['TP_CLKHCN', 'TP_TCKT'],
        trangThai: 'pending',
      },
      {
        taskDefinitionKey: 'rd0601_t16',
        ten: '16. Phê duyệt Quyết định Quyết toán',
        vaiTro: 'BTGĐ VHT',
        vaiTroCodes: ['PTGD_CT', 'TGD_VHT'],
        trangThai: 'pending',
      },
    ],
    taiLieu: [
      { ten: 'VT34 - Triển khai xây dựng BM.pdf', loai: 'PDF' },
      { ten: 'BM2 - TTMS.xlsx', loai: 'Excel' },
      { ten: 'BM3, BM4, BM8 - TCKT.xlsx', loai: 'Excel' },
      { ten: 'BM5, BM6, BM7 - PM.docx', loai: 'Word' },
      { ten: 'BM Chi phí nhân công - P.NS.xlsx', loai: 'Excel' },
      { ten: 'Chứng từ tài sản.pdf', loai: 'PDF' },
      { ten: 'QĐ nghiệm thu (đính kèm).pdf', loai: 'PDF' },
    ],
  },
  {
    id: 'HS-2026-081',
    maNV: 'RD.2026.035',
    loai: 'Quyết toán',
    quyTrinh: '',
    quyTrinhTen: 'Chưa vào quy trình',
    nguoiKhoiTao: 'CQ TCKT — Đ/c Lê Thu Hà',
    ngayTao: '2026-09-03',
    trangThai: 'draft',
    buocHienTai: 0,
    steps: [
      {
        ten: 'Khởi tạo hồ sơ',
        vaiTro: 'CQ TCKT',
        vaiTroCodes: ['CQ_TCKT'],
        nguoi: 'Đ/c Lê Thu Hà',
        trangThai: 'done',
        thoiDiem: '03/09/2026 08:50',
      },
    ],
    taiLieu: [
      { ten: 'QĐ nghiệm thu (đính kèm).pdf', loai: 'PDF' },
      { ten: 'Bảng đối chiếu dự toán-thực chi.xlsx', loai: 'Excel' },
    ],
  },
  {
    id: 'HS-2026-082',
    maNV: 'RD.2026.030',
    loai: 'Quyết toán',
    quyTrinh: 'RD06.02',
    quyTrinhTen: 'Quyết toán NV KHCN cấp Tập đoàn',
    nguoiKhoiTao: 'CQ TCKT — Đ/c Lê Thu Hà',
    ngayTao: '2026-08-28',
    trangThai: 'processing',
    buocHienTai: 16,
    steps: [
      { taskDefinitionKey: 'rd0602_t1', ten: '1. Khởi động luồng quyết toán TĐ RD06.02', vaiTro: 'CQ TCKT', vaiTroCodes: ['CQ_TCKT'], nguoi: 'Đ/c Lê Thu Hà', trangThai: 'done', thoiDiem: '28/08/2026 09:00' },
      { taskDefinitionKey: 'rd0602_t2', ten: '2. Gửi VT34, triển khai xây dựng BM', vaiTro: 'CQ TCKT', vaiTroCodes: ['CQ_TCKT'], nguoi: 'Đ/c Lê Thu Hà', trangThai: 'done', thoiDiem: '28/08/2026 09:30' },
      { taskDefinitionKey: 'rd0602_t3', ten: '3. Lập BM3, 4, 8', vaiTro: 'CQ TCKT', vaiTroCodes: ['CQ_TCKT'], nguoi: 'CQ TCKT', trangThai: 'done', thoiDiem: '01/09/2026 11:00' },
      { taskDefinitionKey: 'rd0602_t4', ten: '4. Lập BM5, 6, 7; Chứng từ tài sản', vaiTro: 'PM', vaiTroCodes: ['PM', 'PA', 'NNC'], nguoi: 'TS. Ngô Việt Hà', trangThai: 'done', thoiDiem: '02/09/2026 16:00' },
      { taskDefinitionKey: 'rd0602_t5', ten: '5. Rà soát, thẩm định BM5, 6, 7', vaiTro: 'CQ CLKHCN / CQ TS', vaiTroCodes: ['CQ_KHCN', 'TP_CLKHCN'], nguoi: 'CQ CLKHCN', trangThai: 'done', thoiDiem: '03/09/2026 10:00' },
      { taskDefinitionKey: 'rd0602_t6', ten: '6. Lập BM2', vaiTro: 'TTMS', vaiTroCodes: ['CQ_MS', 'GD_TTMS'], nguoi: 'TTMS', trangThai: 'done', thoiDiem: '03/09/2026 14:00' },
      { taskDefinitionKey: 'rd0602_t7', ten: '7. Lập BM Chi phí nhân công', vaiTro: 'P.NS', vaiTroCodes: ['CQ_NS', 'TP_NS'], nguoi: 'P.NS', trangThai: 'done', thoiDiem: '03/09/2026 15:30' },
      { taskDefinitionKey: 'rd0602_t8', ten: '8. Tổng hợp, thẩm định chung', vaiTro: 'CQ TCKT', vaiTroCodes: ['CQ_TCKT'], nguoi: 'Đ/c Lê Thu Hà', trangThai: 'done', thoiDiem: '04/09/2026 09:00' },
      { taskDefinitionKey: 'rd0602_t9', ten: '9. Lập BC tổng hợp quyết toán, Tờ trình đề nghị QT', vaiTro: 'CQ TCKT', vaiTroCodes: ['CQ_TCKT'], nguoi: 'Đ/c Lê Thu Hà', trangThai: 'done', thoiDiem: '05/09/2026 11:00' },
      { taskDefinitionKey: 'rd0602_t10', ten: '10. Ký thẩm định HS', vaiTro: 'CQ CLKHCN / CQ TS', vaiTroCodes: ['CQ_KHCN', 'TP_CLKHCN'], trangThai: 'done', thoiDiem: '05/09/2026 15:00' },
      { taskDefinitionKey: 'rd0602_t11', ten: '11. Ký thẩm định HS', vaiTro: 'PM', vaiTroCodes: ['PM', 'PA', 'NNC'], nguoi: 'TS. Ngô Việt Hà', trangThai: 'done', thoiDiem: '05/09/2026 16:00' },
      { taskDefinitionKey: 'rd0602_t12', ten: '12. Ký thẩm định HS', vaiTro: 'TTMS', vaiTroCodes: ['CQ_MS', 'GD_TTMS'], trangThai: 'done', thoiDiem: '06/09/2026 09:00' },
      { taskDefinitionKey: 'rd0602_t13', ten: '13. Ký thẩm định HS', vaiTro: 'P.NS', vaiTroCodes: ['CQ_NS', 'TP_NS'], trangThai: 'done', thoiDiem: '06/09/2026 10:00' },
      { taskDefinitionKey: 'rd0602_t14', ten: '14. Ký duyệt HS', vaiTro: 'GĐ TT / BGĐ Khối', vaiTroCodes: ['BGD_TT', 'BGD_KHOI'], trangThai: 'done', thoiDiem: '06/09/2026 14:00' },
      { taskDefinitionKey: 'rd0602_t15', ten: '15. Ký duyệt HS', vaiTro: 'CQNV VHT', vaiTroCodes: ['TP_CLKHCN', 'TP_TCKT'], trangThai: 'done', thoiDiem: '07/09/2026 09:00' },
      { taskDefinitionKey: 'rd0602_t16', ten: '16. Phê duyệt Tờ trình đề nghị QT', vaiTro: 'BTGĐ VHT', vaiTroCodes: ['PTGD_CT', 'TGD_VHT'], trangThai: 'done', thoiDiem: '07/09/2026 16:00' },
      { taskDefinitionKey: 'rd0602_t17', ten: '17. Lập CV đề nghị thẩm định', vaiTro: 'Phòng QLDA TĐ', vaiTroCodes: ['QLDA_TD'], trangThai: 'current', hanXuLy: '20/09/2026' },
      { taskDefinitionKey: 'rd0602_t18', ten: '18. Thẩm định lần 1, trả PNX', vaiTro: 'Chuyên hướng TĐ', vaiTroCodes: ['CHUYEN_HUONG_TD', 'CQ_KHCN_TD'], trangThai: 'pending' },
      { taskDefinitionKey: 'rd0602_t19', ten: '19. Hoàn thiện HS (TCKT/CLKHCN/PM/TTMS/P.NS)', vaiTro: 'CQ TCKT (+ CS)', vaiTroCodes: ['CQ_TCKT', 'CQ_KHCN', 'PM', 'CQ_MS', 'CQ_NS'], trangThai: 'pending' },
      { taskDefinitionKey: 'rd0602_t20', ten: '20. Thẩm định lần 2', vaiTro: 'Chuyên hướng TĐ', vaiTroCodes: ['CHUYEN_HUONG_TD', 'CQ_KHCN_TD'], trangThai: 'pending' },
      { taskDefinitionKey: 'rd0602_t21', ten: '21. Trả KQ thẩm định', vaiTro: 'Chuyên hướng TĐ', vaiTroCodes: ['CHUYEN_HUONG_TD', 'CQ_KHCN_TD'], trangThai: 'pending' },
      { taskDefinitionKey: 'rd0602_t22', ten: '22. Tổng hợp BC thẩm tra, Trình ký QĐ phê duyệt QT', vaiTro: 'Phòng QLDA TĐ', vaiTroCodes: ['QLDA_TD'], trangThai: 'pending' },
      { taskDefinitionKey: 'rd0602_t23', ten: '23. Ký thẩm định HS', vaiTro: 'Chuyên hướng TĐ', vaiTroCodes: ['CHUYEN_HUONG_TD', 'CQ_KHCN_TD'], trangThai: 'pending' },
      { taskDefinitionKey: 'rd0602_t24', ten: '24. Ký duyệt HS', vaiTro: 'CQ NV TĐ', vaiTroCodes: ['CQNV_TD'], trangThai: 'pending' },
      { taskDefinitionKey: 'rd0602_t26', ten: '26. Phê duyệt QĐ QT', vaiTro: 'BTGĐ Tập đoàn', vaiTroCodes: ['BTGD_TD'], trangThai: 'pending' },
    ],
    taiLieu: [
      { ten: 'VT34 - Triển khai xây dựng BM.pdf', loai: 'PDF' },
      { ten: 'BC tổng hợp quyết toán + Tờ trình đề nghị QT.pdf', loai: 'PDF' },
      { ten: 'QĐ nghiệm thu cấp TĐ (đính kèm).pdf', loai: 'PDF' },
    ],
  },
]

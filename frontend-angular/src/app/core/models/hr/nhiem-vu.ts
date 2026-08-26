/**
 * Nhiệm vụ (HR) — thực thể trung tâm của phân hệ **Quản lý chi phí nhân công**. Một bản ghi ở đây
 * = một dòng `PHÂN LOẠI = Chính` của biểu mẫu BM5 (`docs/hr_tool/trich-xuat/bieu-mau-bm0-bm5.md` §10).
 *
 * ⚠ **Hai cái tên dễ gộp nhầm, đọc trước khi sửa:**
 *
 * 1. `NhiemVu` này **không phải** `NhiemVu` của `services/ho-so-service` (và của
 *    `core/models/nhiem-vu.ts`). Cái kia phục vụ luồng RD01–RD10 và chính là thứ khách gọi là
 *    **"đề tài"** (mã dạng `011-24-TĐ-RDP-QS`). Cái này rộng hơn: gồm cả SXKD, Bán hàng, Bảo hành,
 *    ĐTPT — phần lớn dữ liệu thật của BM5 không thuộc đề tài KHCN nào.
 * 2. Vì thế `maDeTai`/`tenDeTai` ở đây là **cặp trường tham chiếu, nullable**, không phải quan hệ
 *    cha–con. Đề tài sống bên QTKHCN; HR Tools chỉ giữ mã + tên để đối chiếu và hiển thị. Đợt 6
 *    mới nối khoá ngoại sang bảng `nhiem_vu` của ho-so-service.
 *
 * Bằng chứng: BM5 đặt cột `MÃ ĐỀ TÀI` + `TÊN ĐỀ TÀI/DỰ ÁN` **trên chính dòng nhiệm vụ**, và nhiệm
 * vụ SXKD `PO-92166` để trống hai cột đó — nó định danh bằng mã PO. Chốt 2026-08-26, kế hoạch §2.1.
 *
 * Con của nhiệm vụ là {@link ../noi-dung-cong-viec NoiDungCongViec} (dòng `Thành phần` của BM5) —
 * đó mới là nơi chấm công gán ngày vào, không phải nhiệm vụ.
 */

/** Vòng đời **bản khai** nhiệm vụ. `NHAP → CHO_DUYET → HIEU_LUC` là đường thuận; `TU_CHOI` quay lại `NHAP`. */
export type NhiemVuTrangThai = 'NHAP' | 'CHO_DUYET' | 'HIEU_LUC' | 'TAM_DUNG' | 'DONG' | 'TU_CHOI';

export const NHIEM_VU_TRANG_THAI_LABEL: Record<NhiemVuTrangThai, string> = {
  NHAP: 'Nháp',
  CHO_DUYET: 'Chờ duyệt',
  HIEU_LUC: 'Đang hiệu lực',
  TAM_DUNG: 'Tạm dừng',
  DONG: 'Đã đóng',
  TU_CHOI: 'Từ chối',
};

/** Loại màu của tag trạng thái. Union này khớp cấu trúc với `HrTrangThaiLoai` của
 * `shared/hr/trang-thai-tag` — khai ở model để không kéo phụ thuộc UI vào tầng dữ liệu, nhưng vẫn
 * đủ chặt cho `strictTemplates` (dùng `string` là template không compile). */
export type HrTagMau = 'default' | 'processing' | 'success' | 'warning' | 'error';

export const NHIEM_VU_TRANG_THAI_COLOR: Record<NhiemVuTrangThai, HrTagMau> = {
  NHAP: 'default',
  CHO_DUYET: 'processing',
  HIEU_LUC: 'success',
  TAM_DUNG: 'warning',
  DONG: 'default',
  TU_CHOI: 'error',
};

/**
 * **Phân loại** nhiệm vụ — quyết định *layout màn chấm công* (3 biến thể, kế hoạch §6.3).
 * Đừng gộp với {@link PhanNguon}: hai enum khác nhau, chỉ trùng vài giá trị.
 */
export type PhanLoaiNhiemVu = 'KHCN' | 'PAKD' | 'DTPT' | 'QPAN';

export const PHAN_LOAI_LABEL: Record<PhanLoaiNhiemVu, string> = {
  KHCN: 'Đề tài KHCN',
  PAKD: 'Phương án kinh doanh',
  DTPT: 'Dự án ĐTPT',
  QPAN: 'Nhiệm vụ QPAN',
};

/**
 * **Phân nguồn** — quyết định CPNC tính vào nguồn nào.
 *
 * `QUAN_LY` (Chi phí quản lý) **không do người dùng chọn**: hệ thống tự gán cho phần công thừa
 * (kế hoạch §4.3). Để nó trong enum vì báo cáo phải hiển thị được, nhưng form khai không đưa ra
 * lựa chọn này — xem {@link PHAN_NGUON_CHON_DUOC}.
 */
export type PhanNguon = 'KHCN' | 'SXKD' | 'BAN_HANG' | 'BAO_HANH' | 'DTPT' | 'QUAN_LY';

export const PHAN_NGUON_LABEL: Record<PhanNguon, string> = {
  KHCN: 'KHCN',
  SXKD: 'SXKD',
  BAN_HANG: 'Bán hàng',
  BAO_HANH: 'Bảo hành',
  DTPT: 'ĐTPT',
  QUAN_LY: 'Chi phí quản lý',
};

/** Nguồn người dùng chọn được khi khai nhiệm vụ. Thiếu `QUAN_LY` là CỐ Ý — xem {@link PhanNguon}. */
export const PHAN_NGUON_CHON_DUOC: readonly PhanNguon[] = ['KHCN', 'SXKD', 'BAN_HANG', 'BAO_HANH', 'DTPT'];

/**
 * Nguồn `BAO_HANH` chỉ theo dõi số đã phân bổ, **không lập dự toán** (sheet `2.Chấm công` dòng 59).
 * ⇒ Cột "còn lại" của nhiệm vụ/nội dung CV nguồn này phải để TRỐNG, không hiện `0`: `0` đọc thành
 * *hết nguồn*, ngược hẳn nghĩa thật.
 */
export function coLapDuToan(nguon: PhanNguon): boolean {
  return nguon !== 'BAO_HANH';
}

/** Tình trạng phân bổ — cột H sheet `1.NhapDeTai`. Song song với {@link NhiemVuTrangThai}, không thay nó. */
export type TinhTrangPhanBo = 'DANG_TRINH_PHE_DUYET' | 'DANG_PHAN_BO' | 'DA_HET_HAN';

export const TINH_TRANG_PHAN_BO_LABEL: Record<TinhTrangPhanBo, string> = {
  DANG_TRINH_PHE_DUYET: 'Đang trình phê duyệt',
  DANG_PHAN_BO: 'Đang phân bổ',
  DA_HET_HAN: 'Đã hết hạn',
};

export const TINH_TRANG_PHAN_BO_COLOR: Record<TinhTrangPhanBo, HrTagMau> = {
  DANG_TRINH_PHE_DUYET: 'processing',
  DANG_PHAN_BO: 'success',
  DA_HET_HAN: 'default',
};

/** Một dòng nhật ký thao tác. Dùng chung cho `NhiemVu` lẫn `NhanSuNhiemVu`. */
export interface LichSuMuc {
  at: string;
  actor: string;
  hanhDong: string;
  ghiChu?: string;
}

export interface NhiemVu {
  /** Khoá định danh — cũng là tham số route `/hr/nhiem-vu/:ma`. Không có `id` tách riêng. */
  maNhiemVu: string;
  tenNhiemVu: string;
  /** Mã đề tài bên QTKHCN — **null với nhiệm vụ không thuộc đề tài KHCN** (SXKD/Bán hàng/Bảo hành). */
  maDeTai: string | null;
  tenDeTai: string | null;
  /** Đơn vị cấp 4. Lưu tường minh, KHÔNG suy ra từ `donViChuTri` bằng string matching. */
  khoi: string;
  /** Đơn vị cấp 5 chủ trì. */
  donViChuTri: string;
  /** Đơn vị cấp 5 tham gia phân bổ — khác `donViChuTri`, và thường nhiều hơn một (BM5). */
  donViPhanBo: string[];
  phanLoai: PhanLoaiNhiemVu;
  phanNguon: PhanNguon;
  /** BM5 lưu PM/PA bằng **email**; model dùng mã nhân viên, UI hiển thị email tra từ danh mục nhân sự. */
  pmMaNhanVien: string;
  paMaNhanVien: string;
  /** Đơn vị: đồng. */
  tongDuToan: number;
  /** **Khác** `tongDuToan` — BM5 có cả hai và chúng chênh nhau khoảng 3 lần. */
  chiPhiNhanCongPheDuyet: number;
  /** Nguồn đã lập dự toán = `chiPhiNhanCongPheDuyet + duPhong` (sheet `3.Báo cáo` dòng 9). */
  duPhong: number;
  /** ISO date `yyyy-MM-dd` — ngày đầy đủ, không phải năm: khoá ô chấm công cần đúng tới ngày. */
  tuNgay: string;
  denNgay: string;
  tinhTrangPhanBo: TinhTrangPhanBo;
  trangThai: NhiemVuTrangThai;
  moTa: string;
  nguoiKhaiBao: string;
  /** ISO date `yyyy-MM-dd`. */
  ngayKhaiBao: string;
  lichSu: LichSuMuc[];
}

/** Định dạng tiền tệ dùng chung ở các màn HR — tránh mỗi trang tự gọi `Intl` một kiểu. */
export function formatTien(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('vi-VN').format(value) + ' đ';
}

/** `01/2026 - 12/2028` — khuôn hiển thị thời gian nhiệm vụ trên bảng (BM5 in theo tháng/năm). */
export function khoangThoiGian(tuNgay: string, denNgay: string): string {
  const thang = (iso: string) => (iso.length >= 7 ? `${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '—');
  return `${thang(tuNgay)} - ${thang(denNgay)}`;
}

/**
 * Seed nhiệm vụ.
 *
 * Hai dòng đầu là **dữ liệu thật của khách** (BM5, Khối 1 / Trung tâm Chỉ huy điều khiển): nhiệm vụ
 * KHCN `011-24-TĐ-RDP-QS` với tổng dự toán 64,78 tỷ nhưng CPNC phê duyệt chỉ 23,04 tỷ — chính cặp
 * số chứng minh `tongDuToan ≠ chiPhiNhanCongPheDuyet` — và nhiệm vụ SXKD `PO-92166` **không có mã
 * đề tài**, bằng chứng cho `maDeTai` nullable. Các dòng sau dựng thêm để phủ đủ 4 phân loại (3 layout
 * chấm công của đợt 3) và 6 trạng thái bản khai.
 *
 * Tên đơn vị phân bổ lấy từ danh mục thật ở `don-vi.ts`; BM5 viết tắt `KD ĐH` / `ĐBCL` ⇒ đọc là
 * *Phòng Kinh doanh* / *Trung tâm Đảm bảo chất lượng* của Khối 1.
 */
export const seedNhiemVu: NhiemVu[] = [
  {
    maNhiemVu: 'NV-2024-001',
    tenNhiemVu: 'Nghiên cứu, xây dựng nền tảng tự động hoá chỉ huy điều khiển',
    maDeTai: '011-24-TĐ-RDP-QS',
    tenDeTai: 'Nghiên cứu, xây dựng nền tảng tự động hoá chỉ huy điều khiển',
    khoi: 'Khối 1 - TCT CNC',
    donViChuTri: 'Trung tâm Chỉ huy điều khiển',
    donViPhanBo: ['Trung tâm Chỉ huy điều khiển', 'Phòng Kinh doanh', 'Trung tâm Đảm bảo chất lượng'],
    phanLoai: 'KHCN',
    phanNguon: 'KHCN',
    pmMaNhanVien: 'NV004',
    paMaNhanVien: 'NV002',
    tongDuToan: 64_780_261_308,
    chiPhiNhanCongPheDuyet: 23_043_245_371,
    duPhong: 1_150_000_000,
    tuNgay: '2024-04-08',
    denNgay: '2026-12-31',
    tinhTrangPhanBo: 'DANG_PHAN_BO',
    trangThai: 'HIEU_LUC',
    moTa: 'Nhiệm vụ KHCN cấp Tập đoàn, 3 đơn vị cùng phân bổ nhân công.',
    nguoiKhaiBao: 'Nguyễn Thu Hương',
    ngayKhaiBao: '2024-04-02',
    lichSu: [
      { at: '2024-04-02 09:15', actor: 'Nguyễn Thu Hương', hanhDong: 'Khai báo nhiệm vụ' },
      { at: '2024-04-05 14:02', actor: 'Nguyễn Thu Hương', hanhDong: 'Trình duyệt' },
      { at: '2024-04-08 08:40', actor: 'Lê Văn Cường', hanhDong: 'Duyệt bản khai', ghiChu: 'Đủ hồ sơ, cho hiệu lực.' },
    ],
  },
  {
    maNhiemVu: 'PO-92166',
    tenNhiemVu: 'Sản xuất kinh doanh thiết bị thông tin quân sự theo PO-92166',
    // Không thuộc đề tài KHCN nào — định danh bằng mã PO. Để trống là ĐÚNG, không phải thiếu dữ liệu.
    maDeTai: null,
    tenDeTai: null,
    khoi: 'Khối 1 - TCT CNC',
    donViChuTri: 'Trung tâm Thông tin Quân sự',
    donViPhanBo: ['Trung tâm Thông tin Quân sự', 'Trung tâm sản xuất', 'Trung tâm dịch vụ sau bán hàng'],
    phanLoai: 'PAKD',
    phanNguon: 'SXKD',
    pmMaNhanVien: 'NV006',
    paMaNhanVien: 'NV008',
    tongDuToan: 18_420_000_000,
    chiPhiNhanCongPheDuyet: 5_260_000_000,
    duPhong: 0,
    tuNgay: '2025-01-01',
    denNgay: '2025-12-31',
    tinhTrangPhanBo: 'DANG_PHAN_BO',
    trangThai: 'HIEU_LUC',
    moTa: 'Phương án kinh doanh: nguồn SXKD, kèm nội dung công việc nguồn Bán hàng và Bảo hành.',
    nguoiKhaiBao: 'Lê Văn Cường',
    ngayKhaiBao: '2024-12-18',
    lichSu: [
      { at: '2024-12-18 10:20', actor: 'Lê Văn Cường', hanhDong: 'Khai báo nhiệm vụ' },
      { at: '2024-12-20 16:11', actor: 'Lê Văn Cường', hanhDong: 'Trình duyệt' },
      { at: '2024-12-27 09:05', actor: 'Nguyễn Thu Hương', hanhDong: 'Duyệt bản khai' },
    ],
  },
  {
    maNhiemVu: 'NV-2025-014',
    tenNhiemVu: 'Đầu tư dây chuyền kiểm tra tự động cho khu vực lắp ráp',
    maDeTai: null,
    tenDeTai: null,
    khoi: 'Khối 2 - TCT CNC',
    donViChuTri: 'Phòng Quản lý sản xuất',
    donViPhanBo: ['Phòng Quản lý sản xuất', 'Trung tâm Kỹ thuật công nghệ - TCT CNC'],
    phanLoai: 'DTPT',
    phanNguon: 'DTPT',
    pmMaNhanVien: 'NV003',
    paMaNhanVien: 'NV005',
    tongDuToan: 9_600_000_000,
    chiPhiNhanCongPheDuyet: 2_180_000_000,
    duPhong: 120_000_000,
    tuNgay: '2025-03-01',
    denNgay: '2026-06-30',
    tinhTrangPhanBo: 'DANG_PHAN_BO',
    trangThai: 'HIEU_LUC',
    moTa: 'Dự án đầu tư phát triển — chấm công theo biến thể C (một dòng tổng, không có nội dung CV).',
    nguoiKhaiBao: 'Nguyễn Thu Hương',
    ngayKhaiBao: '2025-02-14',
    lichSu: [
      { at: '2025-02-14 11:30', actor: 'Nguyễn Thu Hương', hanhDong: 'Khai báo nhiệm vụ' },
      { at: '2025-02-20 15:47', actor: 'Nguyễn Thu Hương', hanhDong: 'Trình duyệt' },
      { at: '2025-02-28 09:00', actor: 'Lê Văn Cường', hanhDong: 'Duyệt bản khai' },
    ],
  },
  {
    maNhiemVu: 'NV-2026-003',
    tenNhiemVu: 'Vật liệu composite chịu nhiệt cho vỏ thiết bị ngoài trời',
    maDeTai: '027-26-TĐ-RDP-VL',
    tenDeTai: 'Nghiên cứu vật liệu composite chịu nhiệt trên 120°C',
    khoi: 'Khối 3 - TCT CNC',
    donViChuTri: 'Trung tâm Nền tảng IOT',
    donViPhanBo: ['Trung tâm Nền tảng IOT', 'Phòng Quản lý chất lượng'],
    phanLoai: 'KHCN',
    phanNguon: 'KHCN',
    pmMaNhanVien: 'NV006',
    paMaNhanVien: 'NV009',
    tongDuToan: 4_200_000_000,
    chiPhiNhanCongPheDuyet: 1_480_000_000,
    duPhong: 0,
    tuNgay: '2026-09-01',
    denNgay: '2027-08-31',
    tinhTrangPhanBo: 'DANG_TRINH_PHE_DUYET',
    trangThai: 'CHO_DUYET',
    moTa: 'Bản khai đang chờ duyệt — dùng để thử luồng Duyệt / Từ chối.',
    nguoiKhaiBao: 'Nguyễn Thu Hương',
    ngayKhaiBao: '2026-08-14',
    lichSu: [
      { at: '2026-08-14 11:30', actor: 'Nguyễn Thu Hương', hanhDong: 'Khai báo nhiệm vụ' },
      { at: '2026-08-18 15:47', actor: 'Nguyễn Thu Hương', hanhDong: 'Trình duyệt' },
    ],
  },
  {
    maNhiemVu: 'NV-2025-021',
    tenNhiemVu: 'Hệ thống mã hoá đầu cuối cho thiết bị chuyên dụng',
    maDeTai: '008-25-TĐ-RDP-QS',
    tenDeTai: 'Hệ thống mã hoá đầu cuối cho thiết bị chuyên dụng',
    khoi: 'Khối 1 - TCT CNC',
    donViChuTri: 'Trung tâm Tác chiến điện tử',
    donViPhanBo: ['Trung tâm Tác chiến điện tử'],
    phanLoai: 'QPAN',
    phanNguon: 'KHCN',
    pmMaNhanVien: 'NV007',
    paMaNhanVien: 'NV010',
    tongDuToan: 9_100_000_000,
    chiPhiNhanCongPheDuyet: 3_050_000_000,
    duPhong: 0,
    tuNgay: '2025-06-01',
    denNgay: '2026-05-31',
    tinhTrangPhanBo: 'DA_HET_HAN',
    trangThai: 'TAM_DUNG',
    moTa: 'Tạm dừng chờ kết quả thẩm định tiêu chuẩn mật mã của cơ quan chuyên trách.',
    nguoiKhaiBao: 'Nguyễn Thu Hương',
    ngayKhaiBao: '2025-05-22',
    lichSu: [
      { at: '2025-05-22 08:10', actor: 'Nguyễn Thu Hương', hanhDong: 'Khai báo nhiệm vụ' },
      { at: '2025-06-01 09:00', actor: 'Lê Văn Cường', hanhDong: 'Duyệt bản khai' },
      { at: '2026-07-30 13:25', actor: 'Lê Văn Cường', hanhDong: 'Tạm dừng', ghiChu: 'Chờ thẩm định tiêu chuẩn mật mã.' },
    ],
  },
  {
    maNhiemVu: 'NV-2026-007',
    tenNhiemVu: 'Robot kiểm tra tự động dây chuyền lắp ráp',
    maDeTai: null,
    tenDeTai: null,
    khoi: 'Khối 2 - TCT CNC',
    donViChuTri: 'Trung tâm Nghiên cứu Công nghệ chuyển mạch',
    donViPhanBo: ['Trung tâm Nghiên cứu Công nghệ chuyển mạch'],
    phanLoai: 'PAKD',
    phanNguon: 'SXKD',
    pmMaNhanVien: 'NV004',
    paMaNhanVien: 'NV011',
    tongDuToan: 3_600_000_000,
    chiPhiNhanCongPheDuyet: 980_000_000,
    duPhong: 0,
    tuNgay: '2026-03-01',
    denNgay: '2026-12-31',
    tinhTrangPhanBo: 'DANG_TRINH_PHE_DUYET',
    trangThai: 'NHAP',
    moTa: 'Bản khai nháp, chưa trình duyệt.',
    nguoiKhaiBao: 'Lê Văn Cường',
    ngayKhaiBao: '2026-08-25',
    lichSu: [{ at: '2026-08-25 16:40', actor: 'Lê Văn Cường', hanhDong: 'Khai báo nhiệm vụ' }],
  },
  {
    maNhiemVu: 'NV-2024-018',
    tenNhiemVu: 'Tối ưu thuật toán định tuyến cho mạng lõi',
    maDeTai: '004-24-TĐ-RDP-VT',
    tenDeTai: 'Tối ưu thuật toán định tuyến cho mạng lõi',
    khoi: 'Khối 2 - TCT CNC',
    donViChuTri: 'Trung tâm Nghiên cứu Công nghệ truyền dẫn',
    donViPhanBo: ['Trung tâm Nghiên cứu Công nghệ truyền dẫn'],
    phanLoai: 'KHCN',
    phanNguon: 'KHCN',
    pmMaNhanVien: 'NV003',
    paMaNhanVien: 'NV011',
    tongDuToan: 2_400_000_000,
    chiPhiNhanCongPheDuyet: 860_000_000,
    duPhong: 0,
    tuNgay: '2024-03-01',
    denNgay: '2025-12-31',
    tinhTrangPhanBo: 'DA_HET_HAN',
    trangThai: 'DONG',
    moTa: 'Đã nghiệm thu và quyết toán năm 2025.',
    nguoiKhaiBao: 'Nguyễn Thu Hương',
    ngayKhaiBao: '2024-03-04',
    lichSu: [
      { at: '2024-03-04 09:00', actor: 'Nguyễn Thu Hương', hanhDong: 'Khai báo nhiệm vụ' },
      { at: '2024-03-11 10:30', actor: 'Lê Văn Cường', hanhDong: 'Duyệt bản khai' },
      { at: '2025-12-20 17:00', actor: 'Lê Văn Cường', hanhDong: 'Đóng nhiệm vụ', ghiChu: 'Đã quyết toán.' },
    ],
  },
];

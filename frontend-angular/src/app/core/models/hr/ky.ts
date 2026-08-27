/**
 * **Kỳ** — nền của cả đợt 2, 3 và 4 (kế hoạch §6.1).
 *
 * Kỳ là thứ khoá bảng công, bảng lương và mọi báo cáo. Trước đợt này repo **không có** khái niệm
 * kỳ ở đâu cả, nên mọi thứ ăn theo nó phải dựng sau nó, không phải song song.
 *
 * ## Hai điều của khách, không phải quy ước kỹ thuật
 *
 * 1. **Kỳ lương ≠ kỳ trả.** BM3.2 ghi nguyên văn *"Kỳ lương 06/2025 - Kỳ trả 07/2025"*. Hai trường
 *    riêng (`maKy` và `kyTra`), không suy ra bằng "cộng một tháng" — có tháng khách trả cùng kỳ.
 * 2. **Đã khoá thì không sửa được**, kể cả import đè. Muốn sửa phải **mở lại kỳ**, và thao tác mở
 *    ghi audit **kèm lý do bắt buộc**. Thiếu việc này thì số báo cáo đổi sau lưng người đã ký.
 *
 * Ai được mở lại kỳ đã khoá là **câu hỏi Q2 còn treo** với khách (§12). Bản này giả định vai trò
 * nhân sự (`CQ_NS` / `TP_NS`) — xem `quyen-hr.ts`, đổi ở đúng một chỗ khi khách trả lời.
 */

export type KyLoai = 'THANG' | 'QUY';

/**
 * `MO` → đang chấm công · `DANG_CHOT` → HR đang soát, còn sửa được · `DA_KHOA` → đóng sổ.
 *
 * Ba trạng thái chứ không phải hai: giữa "đang chấm" và "đóng sổ" có một quãng HR soát số và trao
 * đổi với đơn vị (BRD bước 6). Gộp lại thì HR buộc phải khoá sớm để không ai sửa nữa, và mọi hiệu
 * chỉnh sau đó đều phải mở lại kỳ — biến thao tác ngoại lệ thành thao tác hằng ngày.
 */
export type KyTrangThai = 'MO' | 'DANG_CHOT' | 'DA_KHOA';

export const KY_TRANG_THAI_LABEL: Record<KyTrangThai, string> = {
  MO: 'Đang mở',
  DANG_CHOT: 'Đang chốt',
  DA_KHOA: 'Đã khoá',
};

export const KY_TRANG_THAI_COLOR: Record<KyTrangThai, 'success' | 'warning' | 'default'> = {
  MO: 'success',
  DANG_CHOT: 'warning',
  DA_KHOA: 'default',
};

export interface Ky {
  /** `2025-05` — vừa là khoá vừa là nhãn người dùng đọc. */
  maKy: string;
  loai: KyLoai;
  /** ISO date `yyyy-MM-dd`. */
  tuNgay: string;
  denNgay: string;
  /** Ngày công chuẩn của kỳ. **Không** phải mẫu số của công thức CPNC — xem `bang-cong.ts`. */
  soNgayCongChuan: number;
  /** Kỳ TRẢ lương, `yyyy-MM`. Khác `maKy` — xem chú thích đầu file. */
  kyTra: string;
  trangThai: KyTrangThai;
  /** Số đơn vị cấp 5 đã chốt chấm công / tổng số đơn vị tham gia. */
  donViDaChot: number;
  tongDonVi: number;
}

export type KyHanhDong = 'TAO' | 'KHOA' | 'MO_LAI';

export const KY_HANH_DONG_LABEL: Record<KyHanhDong, string> = {
  TAO: 'Tạo kỳ',
  KHOA: 'Khoá kỳ',
  MO_LAI: 'Mở lại kỳ',
};

export const KY_HANH_DONG_COLOR: Record<KyHanhDong, 'default' | 'warning' | 'processing'> = {
  TAO: 'processing',
  KHOA: 'default',
  MO_LAI: 'warning',
};

/**
 * Một dòng nhật ký mở/khoá kỳ.
 *
 * Đây **không** phải log kỹ thuật mà là chứng từ: nó trả lời "vì sao số tháng 4 khác với bản lãnh
 * đạo đã ký". Vì vậy `lyDo` bắt buộc ở hành động `MO_LAI` và hiện nguyên văn trên màn.
 */
export interface NhatKyKy {
  id: string;
  /** `dd/MM/yyyy HH:mm` — định dạng người đọc, vì dòng này in ra báo cáo chênh lệch. */
  thoiDiem: string;
  maKy: string;
  hanhDong: KyHanhDong;
  actor: string;
  lyDo: string;
}

// ------------------------------------------------------------------------ lịch

export interface NgayTrongKy {
  /** Ngày trong tháng, 1..31. */
  ngay: number;
  /** Nhãn thứ hai ký tự: `T2`…`CN`. */
  thu: string;
  cuoiTuan: boolean;
  /** ISO `yyyy-MM-dd` — khoá của một ô chấm công. */
  iso: string;
}

const THU_NGAN = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/**
 * Các ngày của một kỳ tháng, kèm cờ cuối tuần.
 *
 * Dựng từ `maKy` chứ không phải từ một mảng 31 phần tử cố định: tháng 2 có 28/29 ngày, và bảng
 * chấm công vẽ đúng số cột của tháng thì tổng công mới cộng đúng. Bẫy này đã được ghi trong
 * `docs/mockup/hr-tools/README.md` — bản nháp mockup xếp dữ liệu vào ngày cuối tuần, luật cuối
 * tuần thắng, ô bị nuốt, **bảng trông vẫn đẹp nhưng tổng công sai**.
 */
export function ngayTrongKy(maKy: string): NgayTrongKy[] {
  const [nam, thang] = maKy.split('-').map(Number);
  if (!nam || !thang) return [];
  const soNgay = new Date(nam, thang, 0).getDate();
  const pad = (n: number) => String(n).padStart(2, '0');

  return Array.from({ length: soNgay }, (_, i) => {
    const ngay = i + 1;
    const d = new Date(nam, thang - 1, ngay);
    const dow = d.getDay();
    return {
      ngay,
      thu: THU_NGAN[dow],
      cuoiTuan: dow === 0 || dow === 6,
      iso: `${nam}-${pad(thang)}-${pad(ngay)}`,
    };
  });
}

/** `2025-05` → `Tháng 05/2025`. */
export function nhanKy(maKy: string): string {
  const [nam, thang] = maKy.split('-');
  return thang ? `Tháng ${thang}/${nam}` : maKy;
}

/** Kỳ còn cho ghi dữ liệu không. `DA_KHOA` chặn cả import đè — §6.1. */
export function kyChoGhi(ky: Ky | undefined): boolean {
  return !!ky && ky.trangThai !== 'DA_KHOA';
}

// ------------------------------------------------------------------------- seed

function ky(
  maKy: string,
  tuNgay: string,
  denNgay: string,
  soNgayCongChuan: number,
  kyTra: string,
  trangThai: KyTrangThai,
  donViDaChot: number,
): Ky {
  return {
    maKy,
    loai: 'THANG',
    tuNgay,
    denNgay,
    soNgayCongChuan,
    kyTra,
    trangThai,
    donViDaChot,
    tongDonVi: 30,
  };
}

/**
 * Seed kỳ — bám đúng dữ liệu artboard 20, và **2025-05 là kỳ có dữ liệu thật** của bộ tài liệu
 * khách (BM0 công 1.179 dòng, BM0 lương 2.503 dòng, BM3 dòng 5 Lê Trần Sự). Mọi màn đợt 2 → 4 mở
 * mặc định vào kỳ này để bài đối chiếu số (§14 mục 8) chạy được mà không phải chọn tay.
 */
export const seedKy: Ky[] = [
  ky('2025-06', '2025-06-01', '2025-06-30', 21, '2025-07', 'MO', 3),
  ky('2025-05', '2025-05-01', '2025-05-31', 20, '2025-06', 'DANG_CHOT', 27),
  ky('2025-04', '2025-04-01', '2025-04-30', 20, '2025-05', 'DA_KHOA', 30),
  ky('2025-03', '2025-03-01', '2025-03-31', 21, '2025-04', 'DA_KHOA', 30),
];

/** Kỳ mặc định mở ra ở mọi màn của đợt 2 — xem chú thích `seedKy`. */
export const KY_MAC_DINH = '2025-05';

export const seedNhatKyKy: NhatKyKy[] = [
  {
    id: 'nk-3',
    thoiDiem: '18/06/2025 09:14',
    maKy: '2025-04',
    hanhDong: 'MO_LAI',
    actor: 'Nguyễn Thu Hà (HR)',
    lyDo: 'Bổ sung 3 nhân sự Trung tâm Camera bị sót trong file HRM',
  },
  {
    id: 'nk-2',
    thoiDiem: '16/06/2025 17:02',
    maKy: '2025-04',
    hanhDong: 'KHOA',
    actor: 'Nguyễn Thu Hà (HR)',
    lyDo: '',
  },
  {
    id: 'nk-1',
    thoiDiem: '02/06/2025 08:30',
    maKy: '2025-05',
    hanhDong: 'TAO',
    actor: 'Hệ thống (tự động)',
    lyDo: 'Sinh kỳ theo lịch tháng',
  },
];

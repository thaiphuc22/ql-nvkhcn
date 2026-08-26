/**
 * Cây đơn vị của TCT Công nghiệp Công nghệ cao Viettel — 5 cấp, dùng cho HR Tools.
 *
 * Toàn bộ nghiệp vụ phân bổ nhân công chạy ở **cấp 4 (Khối)** và **cấp 5 (Đơn vị)**; cấp 1–3 chỉ
 * để hiển thị trên biểu mẫu in. Danh sách dưới đây lấy nguyên văn từ sheet `List` của bộ tài liệu
 * khách (`docs/hr_tool/trich-xuat/dac-ta-man-hinh.md` §5) — **không bịa thêm tên đơn vị**, vì mọi
 * dòng import BM0 sẽ đối chiếu với chính danh sách này.
 *
 * Đợt 1.5 sẽ dựng màn Danh mục đơn vị (CRUD + import) ăn vào seed này; ở đợt 1 nó mới là hằng số
 * để các select "Khối" / "Đơn vị chủ trì" / "Đơn vị phân bổ" có nguồn đúng.
 */

/** Cấp 1–3: cố định, chỉ hiển thị. Mã lấy từ cột `Đơn vị cấp 1..3 (F)` của BM0. */
export const DON_VI_CAP_TREN = [
  { cap: 1, ten: 'Tập đoàn Công nghiệp - Viễn thông Quân đội', ma: '148842' },
  { cap: 2, ten: 'Công ty mẹ - Tập đoàn Công nghiệp - Viễn thông Quân đội', ma: '9001803' },
  { cap: 3, ten: 'Tổng công ty Công nghiệp Công nghệ cao Viettel', ma: '9013878' },
] as const;

/** Đơn vị cấp 4 — "Khối", đơn vị báo cáo. 5 giá trị, đóng. */
export const KHOI_OPTIONS: readonly string[] = [
  'Khối 1 - TCT CNC',
  'Khối 2 - TCT CNC',
  'Khối 3 - TCT CNC',
  'Trung tâm Kinh doanh - TCT CNC',
  'Trung tâm QLCL - TCT CNC',
];

/**
 * Đơn vị cấp 5 — đơn vị chấm công, gom theo khối.
 *
 * `Trung tâm Kinh doanh` và `Trung tâm QLCL` không có đơn vị con trong file khách ⇒ để mảng rỗng
 * chứ không tự sinh; đó là dữ liệu thật, không phải thiếu sót cần vá.
 */
export const DON_VI_CAP_5_THEO_KHOI: Readonly<Record<string, readonly string[]>> = {
  'Khối 1 - TCT CNC': [
    'Ban Giám đốc Khối',
    'Phòng Kinh doanh',
    'Phòng Kiểu dáng và đồ hoạ',
    'Phòng Tổng hợp',
    'Trung tâm Chỉ huy điều khiển',
    'Trung tâm Công nghệ Cơ khí - Tự động hoá',
    'Trung tâm Đảm bảo chất lượng',
    'Trung tâm dịch vụ sau bán hàng',
    'Trung tâm Khí cụ bay',
    'Trung tâm Mô hình mô phỏng',
    'Trung tâm Nghiên cứu giải pháp tích hợp công nghệ cao',
    'Trung tâm Quang điện tử',
    'Trung tâm Rada',
    'Trung tâm sản xuất',
    'Trung tâm Tác chiến điện tử',
    'Trung tâm Thông tin Quân sự',
  ],
  'Khối 2 - TCT CNC': [
    'Ban Giám đốc Khối',
    'Phòng Kinh doanh',
    'Phòng Quản lý sản xuất',
    'Phòng Tổng hợp',
    'Trung tâm dịch vụ sau bán hàng',
    'Trung tâm Kỹ thuật công nghệ - TCT CNC',
    'Trung tâm Nghiên cứu Công nghệ chuyển mạch',
    'Trung tâm Nghiên cứu công nghệ Đa phương tiện',
    'Trung tâm Nghiên cứu Công nghệ truyền dẫn',
    'Trung tâm Nghiên cứu thiết bị vô tuyến băng rộng',
    'Trung tâm Phát triển nền tảng thanh toán',
  ],
  'Khối 3 - TCT CNC': [
    'Ban Giám đốc Khối',
    'Phòng Kinh doanh',
    'Phòng Quản lý chất lượng',
    'Phòng Tổng hợp',
    'Trung tâm Camera',
    'Trung tâm Nền tảng IOT',
  ],
  'Trung tâm Kinh doanh - TCT CNC': [],
  'Trung tâm QLCL - TCT CNC': [],
};

/** Đơn vị cấp 5 của một khối. Khối lạ ⇒ mảng rỗng, không ném lỗi (danh mục còn mở ở đợt 1.5). */
export function donViCap5Cua(khoi: string | null | undefined): readonly string[] {
  return (khoi && DON_VI_CAP_5_THEO_KHOI[khoi]) || [];
}

/** Toàn bộ đơn vị cấp 5, đã khử trùng (tên "Ban Giám đốc Khối" lặp ở cả 3 khối). */
export const DON_VI_CAP_5_TAT_CA: readonly string[] = [
  ...new Set(Object.values(DON_VI_CAP_5_THEO_KHOI).flat()),
].sort((a, b) => a.localeCompare(b, 'vi'));

/**
 * Tách mã đơn vị khỏi chuỗi `"<tên> - <mã>"` của file import BM0.
 *
 * Phải cắt theo dấu `-` **cuối cùng**: tên đơn vị chứa dấu gạch nối
 * (`"Trung tâm Công nghệ Cơ khí - Tự động hoá - 9033xxx"`), nên `split('-')[0]` sẽ cắt cụt tên.
 * Chuỗi không có phần mã thì trả `ma: null` chứ không đoán.
 */
export function tachTenVaMaDonVi(chuoi: string): { ten: string; ma: string | null } {
  const viTri = chuoi.lastIndexOf('-');
  if (viTri < 0) return { ten: chuoi.trim(), ma: null };
  const ma = chuoi.slice(viTri + 1).trim();
  // Chỉ coi là mã khi phần đuôi thuần số — "Cơ khí - Tự động hoá" không được nhận nhầm thành mã.
  if (!/^\d+$/.test(ma)) return { ten: chuoi.trim(), ma: null };
  return { ten: chuoi.slice(0, viTri).trim(), ma };
}

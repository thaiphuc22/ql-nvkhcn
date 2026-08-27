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

// ---------------------------------------------------------------------- cây đơn vị (đợt 1.5)

/**
 * Một nút của cây đơn vị — dạng phẳng, nối bằng `chaMa`.
 *
 * Phẳng chứ không lồng `children[]`: mọi thao tác thật đều là *tra theo mã* (dòng import BM0 mang
 * `"Khối 1 - TCT CNC - 9013948"`, màn chấm công chọn một đơn vị cấp 5), và cây lồng thì mỗi lần tra
 * phải duyệt đệ quy. Dựng cây để hiển thị là việc của một hàm, làm một lần ở nơi cần.
 */
export interface DonViNode {
  ma: string;
  ten: string;
  /** 1..5 — xem sơ đồ đầu file. Nghiệp vụ chỉ chạy ở cấp 4 và 5. */
  cap: number;
  chaMa: string | null;
  hoatDong: boolean;
  /** Số nhân sự thuộc đơn vị (chỉ có nghĩa ở cấp 5). Dữ liệu mô phỏng cho tới khi nối HRM. */
  soNhanSu?: number;
}

/**
 * Mã đơn vị cấp 4 và cấp 5.
 *
 * ⚠ **Đây là mã mô phỏng, không phải mã thật của khách.** File khách chỉ để lộ mã của cấp 1–3
 * (`148842`, `9001803`, `9013878`) và một ví dụ cấp 4 (`9013948`) trong chuỗi tên của BM0. Mã cấp 5
 * chưa từng xuất hiện ở bất kỳ tài liệu nào, nên sinh theo dãy để cây có khoá chạy được; **đợt đầu
 * tiên HR import danh mục đơn vị thật là lúc bộ mã này bị thay**. Đừng dùng chúng làm hằng số ở
 * chỗ khác.
 */
function maSinh(prefix: number, i: number): string {
  return String(prefix + i);
}

/** Cây đơn vị seed — dựng từ đúng ba hằng số phía trên, không khai lại tên đơn vị lần thứ hai. */
export function seedCayDonVi(): DonViNode[] {
  const nodes: DonViNode[] = DON_VI_CAP_TREN.map((d, i) => ({
    ma: d.ma,
    ten: d.ten,
    cap: d.cap,
    chaMa: i === 0 ? null : DON_VI_CAP_TREN[i - 1].ma,
    hoatDong: true,
  }));

  const goc = DON_VI_CAP_TREN[DON_VI_CAP_TREN.length - 1].ma;
  let stt = 0;

  KHOI_OPTIONS.forEach((khoi, i) => {
    const maKhoi = maSinh(9013948, i);
    nodes.push({ ma: maKhoi, ten: khoi, cap: 4, chaMa: goc, hoatDong: true });

    for (const donVi of donViCap5Cua(khoi)) {
      nodes.push({
        ma: maSinh(9014021, stt++),
        ten: donVi,
        cap: 5,
        chaMa: maKhoi,
        hoatDong: true,
        // Số nhân sự mô phỏng, dải 20–180 — đủ để màn báo cáo đợt 4 có hình dạng, không phải số thật.
        soNhanSu: 20 + ((stt * 37) % 160),
      });
    }
  });

  return nodes;
}

/** Con trực tiếp của một nút. `null` = các nút gốc (cấp 1). */
export function conCua(nodes: readonly DonViNode[], chaMa: string | null): DonViNode[] {
  return nodes.filter((n) => n.chaMa === chaMa);
}

/** Đường dẫn từ gốc tới `ma`, gồm cả chính nó — dùng cho dòng “thuộc …” ở khối chi tiết. */
export function duongDan(nodes: readonly DonViNode[], ma: string): DonViNode[] {
  const theoMa = new Map(nodes.map((n) => [n.ma, n]));
  const path: DonViNode[] = [];
  let hienTai = theoMa.get(ma);
  while (hienTai) {
    path.unshift(hienTai);
    hienTai = hienTai.chaMa ? theoMa.get(hienTai.chaMa) : undefined;
  }
  return path;
}

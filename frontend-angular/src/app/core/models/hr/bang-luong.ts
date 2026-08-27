/**
 * **Bảng lương tháng BM0** — import và **chỉ đọc**. Kế hoạch §7.
 *
 * BRD giới hạn rõ: *"không xử lý lương chi tiết"*. Bảng lương ở đây chỉ có một việc: làm **tử số**
 * của công thức phân bổ CPNC (§4.1).
 *
 * ## CPNC là một VECTOR khoản mục, không phải một con số
 *
 * Đây là chỗ bản kế hoạch đầu tiên hiểu sai (§4.2). Công thức áp cho **từng** khoản:
 *
 * ```
 * tyLe = congPhanBo / congTinhLuong          ← mẫu số là công tính lương CỦA CHÍNH NGƯỜI ĐÓ
 * CPNC_phanBo[khoan] = CPNC_thang[khoan] × tyLe
 * ```
 *
 * Gộp 14 khoản thành một tổng rồi chia thì BM3.1 và BM3.2 không dựng được — hai biểu mẫu ấy in
 * tách từng khoản. Kiểm chứng bằng số thật của BM3 dòng 5 (Lê Trần Sự, `congTinhLuong = 21`,
 * `congPhanBo = 6`): Lương tháng 113.316.438 × 6/21 = 32.376.125, khớp tới **từng đồng**.
 *
 * ## Phân quyền là FAIL-CLOSED
 *
 * Ma trận quyền của khách (§7.2): **chỉ HR** được xuất bảng lương. Không có quyền thì **không
 * render cột tiền**, không phải render rồi chặn khi bấm — xem `quyen-hr.ts` và `hr-bang-luong`.
 */

/**
 * 14 khoản mục của BM3, **giữ nguyên thứ tự file gốc**.
 *
 * Mã trùng với danh mục `loai-cpnc` (`LCP-01`…`LCP-14`) để đợt 3 dựng BM3 chỉ việc nối hai bên
 * bằng mã. Danh sách khai lại ở đây thay vì đọc từ `danh-muc.ts` là **có chủ ý**: đây là *hình dạng
 * dữ liệu* (khoá của `Record<string, number>` trên mỗi dòng lương), còn danh mục kia là *dữ liệu
 * người dùng sửa được*. Người dùng tắt một khoản trong danh mục thì cột đó ẩn khỏi báo cáo — nhưng
 * số đã import vẫn còn nguyên trong bản ghi, và đó là điều đúng.
 */
export interface KhoanMucLuong {
  ma: string;
  ten: string;
  /** Nhãn ngắn cho tiêu đề cột — tên đầy đủ dài tới 45 ký tự, bảng 14 cột không chứa nổi. */
  tenNgan: string;
}

export const KHOAN_MUC_LUONG: readonly KhoanMucLuong[] = [
  { ma: 'LCP-01', ten: 'Lương tháng', tenNgan: 'Lương tháng' },
  { ma: 'LCP-02', ten: 'Lương tháng (trừ BH cá nhân)', tenNgan: 'Lương (trừ BH CN)' },
  { ma: 'LCP-03', ten: 'Truy thu/truy lĩnh (lương tháng lần 2)', tenNgan: 'Truy thu/truy lĩnh' },
  { ma: 'LCP-04', ten: 'Lương SXKD (nếu có)', tenNgan: 'Lương SXKD' },
  { ma: 'LCP-05', ten: 'Lương thử việc, tập nghề', tenNgan: 'Lương thử việc' },
  { ma: 'LCP-06', ten: 'Lương kinh doanh thử việc, tập nghề', tenNgan: 'Lương KD thử việc' },
  { ma: 'LCP-07', ten: 'BHXH — Cá nhân', tenNgan: 'BHXH cá nhân' },
  { ma: 'LCP-08', ten: 'BHXH — Đơn vị', tenNgan: 'BHXH đơn vị' },
  { ma: 'LCP-09', ten: 'BHYT — Cá nhân', tenNgan: 'BHYT cá nhân' },
  { ma: 'LCP-10', ten: 'BHYT — Đơn vị', tenNgan: 'BHYT đơn vị' },
  { ma: 'LCP-11', ten: 'BHTN — Cá nhân', tenNgan: 'BHTN cá nhân' },
  { ma: 'LCP-12', ten: 'BHTN — Đơn vị', tenNgan: 'BHTN đơn vị' },
  { ma: 'LCP-13', ten: 'KPCĐ', tenNgan: 'KPCĐ' },
  {
    ma: 'LCP-14',
    ten: 'Các khoản ăn ca, điện thoại, chi phí phụ cấp',
    tenNgan: 'Ăn ca, ĐT, phụ cấp',
  },
];

export interface DongBangLuong {
  id: string;
  kyId: string;
  maNhanVien: string;
  hoTen: string;
  donVi: string;
  /** Lặp lại từ bảng công để BM3.1/BM3.2 không phải join hai bảng chỉ để lấy mẫu số. */
  congTinhLuong: number;
  /** Khoá là `KhoanMucLuong.ma`. Khoản không có ở người này thì **vắng mặt**, không phải `0`. */
  khoan: Record<string, number>;
}

export interface LanNhapBangLuong {
  kyId: string;
  tenFile: string;
  soDong: number;
  nhapLuc: string;
  nhapBoi: string;
}

/** Tổng một dòng lương — cột `CỘNG` của BM3. */
export function tongDongLuong(dong: DongBangLuong): number {
  return KHOAN_MUC_LUONG.reduce((sum, k) => sum + (dong.khoan[k.ma] ?? 0), 0);
}

/**
 * Phân bổ một dòng lương theo tỷ lệ công — **hàm gốc của cả phân hệ**, §4.1.
 *
 * Áp cho TỪNG khoản, làm tròn tới **đồng**. `congTinhLuong = 0` trả về vector rỗng chứ không phải
 * chia cho 0: người nghỉ cả tháng thì không có gì để phân bổ, và `NaN` lọt vào báo cáo là thứ chỉ
 * lộ ra khi khách soi tổng.
 *
 * Đợt 3 sẽ gọi hàm này từ `cpnc.service.ts` — **một nơi tính duy nhất** (§4). Đặt ở model để cả
 * service lẫn test dùng chung mà không phải dựng TestBed.
 */
export function phanBoTheoCong(
  dong: DongBangLuong,
  congPhanBo: number,
): Record<string, number> {
  if (!dong.congTinhLuong) return {};
  const tyLe = congPhanBo / dong.congTinhLuong;
  const kq: Record<string, number> = {};
  for (const k of KHOAN_MUC_LUONG) {
    const v = dong.khoan[k.ma];
    if (v === undefined) continue;
    kq[k.ma] = Math.round(v * tyLe);
  }
  return kq;
}

// ------------------------------------------------------------------------- seed

/** Mức chuẩn của từng khoản, lấy từ artboard 23 (đã đối chiếu độ lớn với BM0 của khách). */
const MUC_CHUAN: Record<string, number> = {
  'LCP-01': 24_500_000,
  'LCP-02': 22_800_000,
  'LCP-04': 3_200_000,
  'LCP-07': 1_960_000,
  'LCP-08': 3_675_000,
  'LCP-09': 367_500,
  'LCP-10': 735_000,
  'LCP-11': 245_000,
  'LCP-12': 245_000,
  'LCP-13': 490_000,
  'LCP-14': 1_850_000,
};

/**
 * Dựng bảng lương seed cho một kỳ.
 *
 * `LCP-03` (truy thu/truy lĩnh) cố ý **âm** ở một người: danh mục ghi rõ khoản này âm được, và một
 * bộ dữ liệu toàn số dương thì không lộ ra chỗ nào lỡ dùng `Math.abs` hay format bỏ dấu trừ.
 * `LCP-05`/`LCP-06` vắng mặt ở mọi người — không phải thiếu sót: không ai đang thử việc, và ô trống
 * phải hiện `—` chứ không phải `0`.
 */
export function dungBangLuong(
  maKy: string,
  nguoi: readonly { maNhanVien: string; hoTen: string; donVi: string; congTinhLuong: number }[],
): DongBangLuong[] {
  const heSo = [1, 0.94, 1.05, 0.88, 1.12, 0.8];
  return nguoi.map((p, i) => {
    const f = heSo[i % heSo.length];
    const khoan: Record<string, number> = {};
    for (const [ma, muc] of Object.entries(MUC_CHUAN)) {
      khoan[ma] = Math.round((muc * f) / 1000) * 1000;
    }
    if (i === 2) khoan['LCP-03'] = -1_240_000;
    return {
      id: `${maKy}-${p.maNhanVien}`,
      kyId: maKy,
      maNhanVien: p.maNhanVien,
      hoTen: p.hoTen,
      donVi: p.donVi,
      congTinhLuong: p.congTinhLuong,
      khoan,
    };
  });
}

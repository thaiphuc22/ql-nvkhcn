/**
 * **Bảng công tháng BM0** — dữ liệu HRM/SAP do HR nhập từ file. Kế hoạch §6.2.
 *
 * ## Đây là MỘT trong HAI thực thể, đừng gộp
 *
 * | | `BangCongThangImport` (file này) | `PhanBoCong` (đợt 3) |
 * |---|---|---|
 * | Ai tạo | HR import từ SAP/HRM | PA/PM chấm trên màn hình |
 * | Sửa được không | **Không** — chỉ import đè cả kỳ | Có, tới khi submit |
 * | Hình dạng | Người × N ngày, ô là ký hiệu `X:8` | Dòng `(người, ngày) → nội dung CV` |
 * | Dùng để | Khoá ô + lấy `congTinhLuong` làm **mẫu số** | **Tử số** của công thức §4.1 |
 *
 * Gộp hai thứ này là hỏng cả hai: bảng công thành thứ sửa được (nên số HRM không còn là số HRM),
 * còn bản phân bổ mất vòng đời 4 trạng thái của nó.
 *
 * ## Mẫu số của CPNC là `congTinhLuong` của TỪNG NGƯỜI
 *
 * Không phải `soNgayCongChuan` của kỳ. Hai số này khác nhau — và khác **giữa người này với người
 * kia trong cùng một kỳ**, vì HRM có điều chỉnh tay. Bản kế hoạch đầu tiên hiểu sai đúng chỗ này
 * (§4.2). `congTinhLuong` có thể **lớn hơn** công chế độ; đó là dữ liệu đúng, không phải lỗi nhập.
 */

import { NgayTrongKy } from './ky';

/**
 * Một ô của bảng công: ký hiệu + số giờ, đọc từ chuỗi `X:8` trong file gốc.
 *
 * `soGio` giữ riêng chứ không nhân vào ký hiệu: file khách có cả `X:8` lẫn `X:4` (nửa ngày), và
 * cột *Công tính lương* phải cộng đúng theo giờ chứ không đếm số ô.
 */
export interface ODongCong {
  kyHieu: string;
  soGio: number;
}

export interface DongBangCong {
  id: string;
  /** Trỏ tới `Ky.maKy`. */
  kyId: string;
  maNhanVien: string;
  hoTen: string;
  chucDanh: string;
  /** Đơn vị cấp 5 — đơn vị chấm công. */
  donVi: string;
  /** Đơn vị cấp 4. */
  khoi: string;
  /**
   * Ô theo ngày, khoá là **số ngày trong tháng** (1..31). Dùng `Record` chứ không phải mảng 31 phần
   * tử: tháng 2 có 28 ngày, mảng cố định buộc phải nhớ bỏ qua phần đuôi ở mọi chỗ đọc.
   */
  o: Record<number, ODongCong>;
  /** Cột cuối của BM0 — **mẫu số** của công thức CPNC. Xem chú thích đầu file. */
  congTinhLuong: number;
}

/** Siêu dữ liệu một lần import — hiện ở thẻ "Nguồn:" đầu màn, để biết số đang xem từ file nào. */
export interface LanNhapBangCong {
  kyId: string;
  tenFile: string;
  soDong: number;
  /** `dd/MM HH:mm`. */
  nhapLuc: string;
  nhapBoi: string;
}

/**
 * Đọc một ô từ chuỗi file gốc (`X:8`, `P:8`, `DL`, rỗng).
 *
 * Thiếu phần `:giờ` thì mặc định **8** — file khách có cột viết tắt chỉ ghi ký hiệu. Trả `null` cho
 * ô rỗng chứ không phải `{ kyHieu: '', soGio: 0 }`: "không có dữ liệu" và "có dữ liệu bằng 0" là hai
 * chuyện khác nhau ở màn chấm công (ô trống chấm được, ô `P` thì không).
 */
export function docOCong(tho: string): ODongCong | null {
  const s = tho.trim();
  if (!s) return null;
  const [kyHieu, gio] = s.split(':');
  if (!kyHieu.trim()) return null;
  const soGio = gio === undefined || gio.trim() === '' ? 8 : Number(gio.replace(',', '.'));
  return { kyHieu: kyHieu.trim().toUpperCase(), soGio: Number.isFinite(soGio) ? soGio : 8 };
}

/** Tổng công quy ra ngày từ các ô — dùng để đối chiếu với cột `congTinhLuong` của file. */
export function tongCongTuO(o: Record<number, ODongCong>, tinhCong: (kyHieu: string) => boolean): number {
  return Object.values(o).reduce((sum, c) => sum + (tinhCong(c.kyHieu) ? c.soGio / 8 : 0), 0);
}

/** Hiển thị số công kiểu Việt: `21,0`. */
export function soCong(v: number): string {
  return v.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// ------------------------------------------------------------------------- seed

/**
 * Sinh ô cho một người trong kỳ.
 *
 * Nghỉ lễ 01/05 và 02/05 là **dữ liệu thật** của tháng 5/2025 (Quốc tế Lao động). Các ngày nghỉ
 * phép rải rác cố ý để luật khoá ô ở màn chấm công (đợt 3) có thứ để khoá — không có ô `P` nào thì
 * màn đó không kiểm chứng được.
 */
function sinhO(ngay: readonly NgayTrongKy[], idx: number, maKy: string): Record<number, ODongCong> {
  const o: Record<number, ODongCong> = {};
  for (const d of ngay) {
    if (maKy === '2025-05' && (d.ngay === 1 || d.ngay === 2)) {
      o[d.ngay] = { kyHieu: 'DL', soGio: 8 };
      continue;
    }
    if (d.cuoiTuan) continue;
    if (idx === 1 && (d.ngay === 12 || d.ngay === 13)) {
      o[d.ngay] = { kyHieu: 'P', soGio: 8 };
      continue;
    }
    if (idx === 3 && d.ngay === 26) {
      o[d.ngay] = { kyHieu: 'P', soGio: 8 };
      continue;
    }
    if (idx === 5 && d.ngay >= 19 && d.ngay <= 23) {
      o[d.ngay] = { kyHieu: 'P', soGio: 8 };
      continue;
    }
    o[d.ngay] = { kyHieu: 'X', soGio: 8 };
  }
  return o;
}

/**
 * Dựng bảng công seed cho một kỳ từ danh mục Nhân viên.
 *
 * Nhận danh sách người **từ ngoài** thay vì import `SEED_DANH_MUC`: `danh-muc.ts` đã import
 * `nhan-su.ts`, và để file này import ngược lại danh mục là dựng một vòng phụ thuộc mà bundler chỉ
 * báo lỗi ở một trong hai chiều, tuỳ thứ tự nạp. Service là nơi ghép hai nguồn.
 */
export function dungBangCong(
  maKy: string,
  ngay: readonly NgayTrongKy[],
  nguoi: readonly { ma: string; ten: string; chucDanh: string; donVi: string; khoi: string }[],
  tinhCong: (kyHieu: string) => boolean,
): DongBangCong[] {
  return nguoi.map((p, i) => {
    const o = sinhO(ngay, i, maKy);
    return {
      id: `${maKy}-${p.ma}`,
      kyId: maKy,
      maNhanVien: p.ma,
      hoTen: p.ten,
      chucDanh: p.chucDanh,
      donVi: p.donVi,
      khoi: p.khoi,
      o,
      // `congTinhLuong` KHÔNG bằng tổng ô ở mọi người: dòng đầu cộng thêm 1 công để tái hiện đúng
      // ca "HRM điều chỉnh tay" mà artboard 12B nêu — luật validate import phải CẢNH BÁO ca này,
      // không được chặn. Không có dữ liệu lệch thì luật đó không kiểm chứng được.
      congTinhLuong: tongCongTuO(o, tinhCong) + (i === 0 ? 1 : 0),
    };
  });
}

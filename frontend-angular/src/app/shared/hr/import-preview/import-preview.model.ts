/**
 * Kiểu dữ liệu chung của **luồng nhập file có preview** — kế hoạch §6.6.
 *
 * Tách khỏi component để tầng service (`danh-muc.service.ts`, và đợt 2 là bảng công / bảng lương)
 * khai được kết quả chấm điểm mà không phải import cả một component Angular.
 *
 * ## Vì sao có hai mức, không phải một
 *
 * Bộ mockup (artboard 19) và kế hoạch đều nói cùng một điều: **lỗi chặn** làm dòng bị bỏ hẳn,
 * **cảnh báo** vẫn nhập nhưng ghi lại để rà sau. Gộp hai thứ thành một cờ `hopLe` là mất luôn khả
 * năng cho qua ký hiệu công lạ — thứ mà khách yêu cầu rõ ("ghi vào danh mục chờ khai báo").
 */

export type ImportMucDo = 'LOI' | 'CANH_BAO';

export interface ImportVanDe {
  mucDo: ImportMucDo;
  moTa: string;
  /** Cách xử lý mà hệ thống sẽ áp — hiện ở cột cuối bảng preview. */
  xuLy?: string;
}

export interface ImportDongPreview {
  /** Số dòng trong file gốc (đếm từ 1, tính cả hàng tiêu đề) — người dùng mở file ra dò theo số này. */
  soDong: number;
  /** Khoá nghiệp vụ của dòng (mã danh mục, mã NV…) — cột định danh của bảng preview. */
  khoa: string;
  /** Nhãn người đọc được (tên, họ tên…). */
  nhan: string;
  vanDe: ImportVanDe[];
  /** `false` khi có ít nhất một `LOI`. Cảnh báo KHÔNG làm dòng mất hợp lệ. */
  hopLe: boolean;
  /** Giá trị thô theo tên trường — service dùng lại khi ghi, màn hình không đụng tới. */
  duLieu?: Record<string, string>;
}

/**
 * Tách nội dung file phân cách thành mảng ô.
 *
 * Nhận **cả CSV lẫn TSV** vì file khách dán từ Excel ra hay là TSV, và bỏ hàng tiêu đề. Không dùng
 * thư viện parse CSV: dữ liệu danh mục không có ô chứa dấu phẩy trong ngoặc kép — nếu sau này có
 * thì đây là chỗ duy nhất phải đổi.
 *
 * `soCot` để đệm cho đủ cột: dòng thiếu ô cuối (Excel hay cắt) không được thành `undefined` rải
 * rác, vì lúc đó lỗi báo ra là "Cannot read property trim of undefined" chứ không phải "thiếu cột".
 */
export function docFilePhanCach(noiDung: string, soCot: number): string[][] {
  const dong = noiDung
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .filter((d) => d.trim().length > 0);
  if (dong.length <= 1) return [];

  const phanCach = dong[0].includes('\t') ? '\t' : ',';
  return dong.slice(1).map((d) => {
    const o = d.split(phanCach).map((v) => v.trim());
    while (o.length < soCot) o.push('');
    return o;
  });
}

export function demTheoMuc(preview: readonly ImportDongPreview[]): {
  hopLe: number;
  loi: number;
  canhBao: number;
} {
  return {
    hopLe: preview.filter((p) => p.hopLe).length,
    loi: preview.filter((p) => !p.hopLe).length,
    // Đếm theo DÒNG có cảnh báo, không phải theo số cảnh báo: người dùng đọc con số này là "bao
    // nhiêu dòng cần rà lại", một dòng hai cảnh báo vẫn là một dòng.
    canhBao: preview.filter((p) => p.hopLe && p.vanDe.some((v) => v.mucDo === 'CANH_BAO')).length,
  };
}

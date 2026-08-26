import { Component, input } from '@angular/core';

/**
 * View in theo biểu mẫu hành chính — tiêu đề quốc hiệu, tên biểu mẫu, dòng thông tin chung, bảng
 * dữ liệu, khối ký. Chỉ hiện khi in (`.hr-print-only`, xem `src/styles/hr-print.scss`).
 *
 * Component chỉ dựng nội dung; quy tắc `@media print` ẩn chrome nằm ở file style GLOBAL vì style
 * component không với tới được `HrLayout`. Trang gọi `window.print()` — xem {@link inTrang}.
 */

export interface PrintColumn {
  header: string;
  value: (row: never) => string | number;
}

@Component({
  selector: 'hr-bieu-mau-print',
  templateUrl: './bieu-mau-print.html',
  styleUrl: './bieu-mau-print.scss',
})
export class HrBieuMauPrint {
  readonly tenBieuMau = input.required<string>();
  readonly moTa = input('');
  /** Các dòng "Nhãn: giá trị" ở phần thông tin chung. */
  readonly thongTin = input<{ nhan: string; giaTri: string }[]>([]);
  readonly cot = input<string[]>([]);
  /** Dữ liệu đã phẳng hoá thành chuỗi — component in không biết gì về model nghiệp vụ. */
  readonly dong = input<string[][]>([]);
  readonly noiKy = input('Hà Nội');
  readonly nguoiLap = input('');
}

/** Gọi hộp thoại in của trình duyệt. Tách thành hàm để trang không phải đụng `window` trực tiếp. */
export function inTrang(): void {
  window.print();
}

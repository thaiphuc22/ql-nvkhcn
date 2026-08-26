import { Component, input } from '@angular/core';

export type HrTrangThaiLoai = 'default' | 'processing' | 'success' | 'warning' | 'error';

/**
 * Tag trạng thái kiểu **chấm tròn + nền nhạt** của bản thiết kế VHT (`● Hoàn thành` trên nền xanh
 * nhạt) — khác hẳn `nz-tag` mặc định (chữ viền, không có chấm). Màu lấy từ cặp token `-50`/`-95`
 * nên tự đúng khi design system đổi giá trị.
 */
@Component({
  selector: 'hr-trang-thai-tag',
  template: `<span class="hr-tt" [class]="'hr-tt hr-tt--' + loai()"
    ><i class="hr-tt__dot"></i>{{ nhan() }}</span
  >`,
  styleUrl: './trang-thai-tag.scss',
})
export class HrTrangThaiTag {
  readonly nhan = input.required<string>();
  readonly loai = input<HrTrangThaiLoai>('default');
}

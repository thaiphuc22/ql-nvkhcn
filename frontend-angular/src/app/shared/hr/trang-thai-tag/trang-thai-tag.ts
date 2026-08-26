import { Component, computed, input } from '@angular/core';

import { CmmTagComponent } from '@khcn-core/ui';

export type HrTrangThaiLoai = 'default' | 'processing' | 'success' | 'warning' | 'error';

/**
 * Tag trạng thái kiểu **chấm tròn + nền nhạt** của bản thiết kế VHT (`● Hoàn thành` trên nền xanh
 * nhạt).
 *
 * Ruột là `CmmTagComponent` của `@khcn-core/ui` (D23) chứ không còn `<span>` tự viết. Nhưng vẫn giữ
 * component bọc này thay vì gọi thẳng `<cmm-tag>` ở 5 màn, vì hai việc `cmm-tag` không làm:
 *
 *   1. **Chấm tròn.** `p-tag` bên dưới chỉ có icon font, không có chấm — chấm vẽ bằng `::before`
 *      trong `.scss` kèm theo.
 *   2. **Bảng màu.** `severity` của PrimeNG là bộ màu riêng của nó, không phải cặp `-50`/`-95` của
 *      design system VHT. Ánh xạ 5 loại về đúng token nằm ở `.scss` cạnh file này.
 *
 * Đổi lại, mọi màn giữ nguyên `<hr-trang-thai-tag [nhan] [loai]>` — thay thư viện lần nữa cũng chỉ
 * sửa đúng ở đây.
 */
@Component({
  selector: 'hr-trang-thai-tag',
  imports: [CmmTagComponent],
  template: `<cmm-tag [value]="nhan()" [rounded]="true" [styleClass]="lop()" />`,
  styleUrl: './trang-thai-tag.scss',
})
export class HrTrangThaiTag {
  readonly nhan = input.required<string>();
  readonly loai = input<HrTrangThaiLoai>('default');

  /** Lớp CSS truyền xuống `p-tag`; `.scss` cạnh file này gắn màu + chấm theo lớp đó. */
  readonly lop = computed(() => `hr-tt hr-tt--${this.loai()}`);
}

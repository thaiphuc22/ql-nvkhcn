import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';

/**
 * Footer phân trang theo bản thiết kế VHT: trái `Hiển thị bản ghi/trang: [25 ▾]`, phải
 * `Tổng số bản ghi: N` + pager `« ‹ 1 2 3 … 99 › »`.
 *
 * Thay footer mặc định của `nz-table` (bảng phải đặt `[nzFrontPagination]="false"`), vì bản thiết
 * kế khác hẳn pager Ant: có nhãn tiếng Việt hai bên, nút nhảy đầu/cuối, và số trang là ô vuông bo
 * 8px chứ không phải hình tròn.
 */
@Component({
  selector: 'hr-table-footer',
  imports: [FormsModule, NzIconModule, NzSelectModule],
  templateUrl: './table-footer.html',
  styleUrl: './table-footer.scss',
})
export class HrTableFooter {
  readonly total = input.required<number>();
  readonly pageIndex = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly pageSizeOptions = input<number[]>([10, 25, 50, 100]);

  readonly pageIndexChange = output<number>();
  readonly pageSizeChange = output<number>();

  readonly soTrang = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));

  /**
   * Dãy số trang có dấu `…`. Luôn giữ trang đầu, trang cuối và cửa sổ ±1 quanh trang hiện tại —
   * đủ để bấm tới lân cận mà không tràn hàng khi có 99 trang.
   */
  readonly cacTrang = computed<(number | '…')[]>(() => {
    const tong = this.soTrang();
    const hienTai = this.pageIndex();
    if (tong <= 7) return Array.from({ length: tong }, (_, i) => i + 1);

    const giu = new Set<number>([1, tong, hienTai, hienTai - 1, hienTai + 1]);
    const sap = [...giu].filter((n) => n >= 1 && n <= tong).sort((a, b) => a - b);

    const ra: (number | '…')[] = [];
    let truoc = 0;
    for (const n of sap) {
      if (truoc && n - truoc > 1) ra.push('…');
      ra.push(n);
      truoc = n;
    }
    return ra;
  });

  laSo(page: number | '…'): page is number {
    return page !== '…';
  }

  doiTrang(page: number): void {
    const clamped = Math.min(Math.max(1, page), this.soTrang());
    if (clamped !== this.pageIndex()) this.pageIndexChange.emit(clamped);
  }

  doiKichThuoc(size: number): void {
    if (size === this.pageSize()) return;
    this.pageSizeChange.emit(size);
    // Đổi số bản ghi/trang có thể làm trang hiện tại vượt quá tổng số trang mới — kéo về trang 1
    // thay vì để bảng trống không giải thích.
    this.pageIndexChange.emit(1);
  }
}

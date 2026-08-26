import { Component, input, output, signal } from '@angular/core';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

/**
 * Khối *Tìm kiếm nâng cao* của bản thiết kế VHT: một khối riêng NẰM TRÊN bảng (không phải hàng lọc
 * trong card), thu gọn được, lưới 3 cột, cặp nút `Làm mới` + `Tìm kiếm` căn phải.
 *
 * Trang gọi chỉ cần chiếu các ô lọc vào slot mặc định; lưới 3 cột do component lo. Khối luôn được
 * render và ẩn bằng CSS thay vì bọc `@if` quanh `ng-content` — giữ nguyên trạng thái các ô lọc khi
 * người dùng thu gọn rồi mở lại.
 */
@Component({
  selector: 'hr-advanced-search',
  imports: [NzButtonModule, NzIconModule],
  templateUrl: './advanced-search.html',
  styleUrl: './advanced-search.scss',
})
export class HrAdvancedSearch {
  readonly tieuDe = input('Tìm kiếm nâng cao');
  readonly moMacDinh = input(true);

  readonly lamMoi = output<void>();
  readonly timKiem = output<void>();

  private readonly moState = signal<boolean | null>(null);

  mo(): boolean {
    return this.moState() ?? this.moMacDinh();
  }

  toggle(): void {
    this.moState.set(!this.mo());
  }
}

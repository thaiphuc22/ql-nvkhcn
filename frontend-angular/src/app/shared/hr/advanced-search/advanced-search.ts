import { Component, computed, input, output, signal } from '@angular/core';

import { CmmButtonComponent } from '@khcn-core/ui';

/**
 * Khối *Tìm kiếm nâng cao* của bản thiết kế VHT: lưới 3 cột ô lọc, cặp nút `Làm mới` + `Tìm kiếm`
 * căn phải, và nút `Ẩn tìm kiếm nâng cao` ở **góc phải trên**.
 *
 * ⚠ Đã đổi vị trí ngày 2026-08-26 (D23, giai đoạn 4): trước đây khối này là **card riêng nằm trên**
 * card bảng. Đối chiếu `docs/design-system/screens/06-tim-kiem-nang-cao.png` thì sai — nó nằm
 * **trong cùng một card với bảng**, ngăn với bảng bằng một đường kẻ. Vì vậy component này KHÔNG tự
 * vẽ card nữa; trang gọi phải đặt nó bên trong `hr-page-card`, ngay phía trên bảng.
 *
 * Trang gọi chỉ cần chiếu các ô lọc vào slot mặc định; lưới 3 cột do component lo. Khối luôn được
 * render và ẩn bằng CSS thay vì bọc `@if` quanh `ng-content` — giữ nguyên trạng thái các ô lọc khi
 * người dùng thu gọn rồi mở lại.
 */
@Component({
  selector: 'hr-advanced-search',
  imports: [CmmButtonComponent],
  templateUrl: './advanced-search.html',
  styleUrl: './advanced-search.scss',
})
export class HrAdvancedSearch {
  readonly tieuDe = input('Tìm kiếm nâng cao');
  readonly moMacDinh = input(true);

  readonly lamMoi = output<void>();
  readonly timKiem = output<void>();

  /** `null` = chưa ai bấm ⇒ theo `moMacDinh()`; bấm rồi thì lựa chọn của người dùng thắng. */
  private readonly moState = signal<boolean | null>(null);

  readonly mo = computed(() => this.moState() ?? this.moMacDinh());

  /** Nhãn nút góc phải đổi theo trạng thái — đúng chữ trong bản thiết kế (`screens/06`). */
  readonly nhanToggle = computed(() =>
    this.mo() ? 'Ẩn tìm kiếm nâng cao' : 'Hiện tìm kiếm nâng cao',
  );

  toggle(): void {
    this.moState.set(!this.mo());
  }
}

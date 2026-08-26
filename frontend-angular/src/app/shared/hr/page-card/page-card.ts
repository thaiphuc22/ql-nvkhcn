import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CardWrapperComponent } from '@khcn-core/ui';

/**
 * Khung trang chuẩn của bản thiết kế VHT: tiêu đề trang bên trái, nút hành động góc phải, toàn bộ
 * nội dung nằm trong một card trắng.
 *
 * Dùng 2 slot chiếu nội dung:
 *   · `[actions]` — cụm nút góc phải (`+ Thêm mới`, hoặc cặp `Huỷ` + nút chính ở trang form);
 *   · nội dung mặc định — phần trong card.
 *
 * `backTo` khác `null` thì hiện nút `←` bên trái tiêu đề, đúng khuôn trang form của thiết kế.
 *
 * Card là `CardWrapperComponent` của `@khcn-core/ui` (D23). Hàng tiêu đề vẫn tự dựng — thư viện
 * không có component nào cho nó, `cmm-section` chỉ là tiêu đề + mô tả, không có chỗ cắm nút.
 *
 * ⚠ `CardWrapperComponent` khai cứng `border-radius: 12px`, còn bản đã build của khách bo **16px**.
 * D23 chốt bản đã build thắng ⇒ chỗ ghi đè nằm ở `styles/khcn-core-compat.scss`, không phải ở đây
 * (overlay/dialog cũng dùng card, cần ghi đè ở tầm toàn cục).
 */
@Component({
  selector: 'hr-page-card',
  imports: [RouterLink, CardWrapperComponent],
  templateUrl: './page-card.html',
  styleUrl: './page-card.scss',
})
export class HrPageCard {
  readonly tieuDe = input.required<string>();
  readonly moTa = input('');
  /** Route của nút quay lại; `null` = không hiện nút. */
  readonly backTo = input<string | null>(null);
  /** Tắt card trắng khi trang tự dựng nhiều khối riêng (vd. hai card cạnh nhau ở trang form). */
  readonly khongCard = input(false);
}

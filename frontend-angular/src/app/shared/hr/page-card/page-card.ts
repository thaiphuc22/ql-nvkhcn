import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NzIconModule } from 'ng-zorro-antd/icon';

/**
 * Khung trang chuẩn của bản thiết kế VHT: tiêu đề trang bên trái, nút hành động góc phải, toàn bộ
 * nội dung nằm trong một card trắng bo 12px shadow nhẹ.
 *
 * Dùng 2 slot chiếu nội dung:
 *   · `[actions]` — cụm nút góc phải (`+ Thêm mới`, hoặc cặp `Huỷ` + nút chính ở trang form);
 *   · nội dung mặc định — phần trong card.
 *
 * `backTo` khác `null` thì hiện nút `←` bên trái tiêu đề, đúng khuôn trang form của thiết kế.
 */
@Component({
  selector: 'hr-page-card',
  imports: [RouterLink, NzIconModule],
  templateUrl: './page-card.html',
  styleUrl: './page-card.scss',
})
export class HrPageCard {
  readonly tieuDe = input.required<string>();
  readonly moTa = input('');
  /** Route của nút quay lại; `null` = không hiện nút. */
  readonly backTo = input<string | null>(null);
  /** Tắt card trắng khi trang tự dựng nhiều khối riêng (vd. tìm kiếm nâng cao + bảng). */
  readonly khongCard = input(false);
}

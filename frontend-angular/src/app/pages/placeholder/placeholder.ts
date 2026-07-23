import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

import { NzResultModule } from 'ng-zorro-antd/result';

/**
 * Trang giữ chỗ cho mọi route Mốc 4 chưa port dữ liệu/logic thật (đúng phạm vi Mốc 4:
 * "layout + nav render đúng nhóm phân hệ, không cần dữ liệu thật"). Nội dung nghiệp vụ
 * từng trang sẽ thay bằng component thật theo pattern strangler-fig ở Mốc 5+ (RD01.01
 * trước), route data `title` chỉ để hiển thị đúng tên module đang đứng ở đâu.
 */
@Component({
  selector: 'app-placeholder',
  imports: [NzResultModule],
  templateUrl: './placeholder.html',
})
export class PlaceholderPage {
  private readonly route = inject(ActivatedRoute);

  readonly title = toSignal(this.route.data.pipe(map((d) => (d['title'] as string) ?? 'Module')), {
    initialValue: 'Module',
  });
}

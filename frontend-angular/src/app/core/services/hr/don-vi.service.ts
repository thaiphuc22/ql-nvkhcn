import { Injectable, signal } from '@angular/core';

import { DonViNode, seedCayDonVi } from '../../models/hr/don-vi';

/**
 * Signal store in-memory cho **cây đơn vị 5 cấp** — cùng khuôn `NhiemVuService` (không `HttpClient`).
 *
 * Tách khỏi `DanhMucService` vì đây là danh mục **duy nhất có cấu trúc cây**: thêm một đơn vị phải
 * biết đơn vị cha, xoá phải chặn khi còn con, và màn hình là cây + chi tiết chứ không phải bảng.
 * Nhồi nó vào store phẳng là ép một `if (loai === 'don-vi')` vào mọi hàm.
 */

@Injectable({ providedIn: 'root' })
export class DonViService {
  private readonly nodesSignal = signal<DonViNode[]>(seedCayDonVi());

  readonly nodes = this.nodesSignal.asReadonly();

  get(ma: string): DonViNode | undefined {
    return this.nodesSignal().find((n) => n.ma === ma);
  }

  daTonTai(ma: string, boQua?: string): boolean {
    const can = ma.trim();
    return this.nodesSignal().some((n) => n.ma === can && n.ma !== boQua);
  }

  create(input: Omit<DonViNode, 'hoatDong'> & { hoatDong?: boolean }): DonViNode {
    const node: DonViNode = { hoatDong: true, ...input, ma: input.ma.trim() };
    this.nodesSignal.update((prev) => [...prev, node]);
    return node;
  }

  update(ma: string, patch: Partial<Omit<DonViNode, 'ma'>>): void {
    this.nodesSignal.update((prev) => prev.map((n) => (n.ma === ma ? { ...n, ...patch, ma: n.ma } : n)));
  }

  /**
   * Xoá một đơn vị — **chỉ khi nó không còn đơn vị con**.
   *
   * Xoá nút giữa cây thì mọi nhánh dưới thành mồ côi (`chaMa` trỏ vào chỗ trống) và biến mất khỏi
   * màn hình mà không có thông báo nào. Trả về `false` để trang nói rõ lý do thay vì im lặng.
   */
  remove(ma: string): boolean {
    if (this.nodesSignal().some((n) => n.chaMa === ma)) return false;
    this.nodesSignal.update((prev) => prev.filter((n) => n.ma !== ma));
    return true;
  }
}

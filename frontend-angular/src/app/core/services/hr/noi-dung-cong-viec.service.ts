import { Injectable, signal } from '@angular/core';

import { NoiDungCongViec, seedNoiDungCongViec } from '../../models/hr/noi-dung-cong-viec';

/**
 * Signal store in-memory cho Nội dung công việc — cùng khuôn `NhiemVuService` (không `HttpClient`,
 * xem ghi chú ở đó).
 *
 * Tách khỏi `NhiemVuService` vì đây là thứ **đợt 2 ăn vào trực tiếp**: bảng chấm công gán ngày cho
 * nội dung công việc, không phải cho nhiệm vụ. Giữ nó là một store riêng để đợt 2 không phải mở
 * service nhiệm vụ ra sửa.
 */

function id(): string {
  return `ndcv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export type NoiDungCongViecInput = Omit<NoiDungCongViec, 'id'>;

@Injectable({ providedIn: 'root' })
export class NoiDungCongViecService {
  private readonly rowsSignal = signal<NoiDungCongViec[]>(seedNoiDungCongViec);

  readonly rows = this.rowsSignal.asReadonly();

  list(): NoiDungCongViec[] {
    return this.rowsSignal();
  }

  get(rowId: string): NoiDungCongViec | undefined {
    return this.rowsSignal().find((r) => r.id === rowId);
  }

  theoNhiemVu(maNhiemVu: string): NoiDungCongViec[] {
    return this.rowsSignal().filter((r) => r.nhiemVuId === maNhiemVu);
  }

  /** Nhãn hiển thị của một danh sách id — dùng ở cột "Nội dung công việc tham gia" của BM1. */
  tenCua(ids: readonly string[]): string[] {
    const theoId = new Map(this.rowsSignal().map((r) => [r.id, r.ten]));
    return ids.map((i) => theoId.get(i) ?? i);
  }

  create(input: NoiDungCongViecInput): NoiDungCongViec {
    const row: NoiDungCongViec = { ...input, id: id() };
    this.rowsSignal.update((prev) => [...prev, row]);
    return row;
  }

  update(rowId: string, patch: Partial<NoiDungCongViecInput>): void {
    this.rowsSignal.update((prev) =>
      // `nhiemVuId` không cho patch đổi: chuyển nội dung CV sang nhiệm vụ khác sẽ làm mồ côi các
      // dòng nhân sự đang trỏ tới nó qua `noiDungCongViecIds`.
      prev.map((r) => (r.id === rowId ? { ...r, ...patch, id: r.id, nhiemVuId: r.nhiemVuId } : r)),
    );
  }

  remove(rowId: string): void {
    this.rowsSignal.update((prev) => prev.filter((r) => r.id !== rowId));
  }
}

import { Injectable, computed, signal } from '@angular/core';

import {
  KY_MAC_DINH,
  Ky,
  KyHanhDong,
  KyTrangThai,
  NhatKyKy,
  seedKy,
  seedNhatKyKy,
} from '../../models/hr/ky';

/**
 * Signal store in-memory cho **Kỳ chấm công** — cùng khuôn `NhiemVuService` (không `HttpClient`).
 *
 * Store này là **cổng ghi của cả đợt 2 → 4**: mọi thao tác ghi vào bảng công, bảng lương hay bản
 * phân bổ đều phải hỏi `choGhi(maKy)` trước. Đặt việc kiểm tra ở đây, một chỗ, thay vì mỗi màn tự
 * kiểm — màn quên kiểm là kỳ đã khoá vẫn sửa được, và triệu chứng chỉ lộ ra khi khách phát hiện số
 * báo cáo cũ đã đổi.
 */

function nowStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

@Injectable({ providedIn: 'root' })
export class KyService {
  private readonly rowsSignal = signal<Ky[]>(seedKy);
  private readonly nhatKySignal = signal<NhatKyKy[]>(seedNhatKyKy);

  readonly rows = this.rowsSignal.asReadonly();
  readonly nhatKy = this.nhatKySignal.asReadonly();

  /** Kỳ mở được để chọn ở các màn nghiệp vụ — sắp mới nhất trước. */
  readonly chonDuoc = computed(() =>
    [...this.rowsSignal()].sort((a, b) => b.maKy.localeCompare(a.maKy)),
  );

  readonly demTheoTrangThai = computed(() => {
    const d: Record<KyTrangThai, number> = { MO: 0, DANG_CHOT: 0, DA_KHOA: 0 };
    for (const k of this.rowsSignal()) d[k.trangThai]++;
    return d;
  });

  get(maKy: string): Ky | undefined {
    return this.rowsSignal().find((k) => k.maKy === maKy);
  }

  /** Kỳ mặc định của mọi màn đợt 2 — xem chú thích `KY_MAC_DINH`. */
  macDinh(): string {
    return this.get(KY_MAC_DINH) ? KY_MAC_DINH : (this.chonDuoc()[0]?.maKy ?? '');
  }

  /**
   * Kỳ còn cho ghi không — **hỏi hàm này trước mọi thao tác ghi**, xem chú thích lớp.
   *
   * Kỳ không tồn tại trả `false` chứ không phải `true`: mã kỳ lạ (gõ tay trên URL, file import ghi
   * sai) không được coi là "kỳ mới, ghi thoải mái".
   */
  choGhi(maKy: string): boolean {
    const k = this.get(maKy);
    return !!k && k.trangThai !== 'DA_KHOA';
  }

  daKhoa(maKy: string): boolean {
    return this.get(maKy)?.trangThai === 'DA_KHOA';
  }

  create(input: Omit<Ky, 'trangThai' | 'donViDaChot'>, actor: string): Ky {
    const row: Ky = { ...input, trangThai: 'MO', donViDaChot: 0 };
    this.rowsSignal.update((prev) => [row, ...prev]);
    this.ghiNhatKy(row.maKy, 'TAO', actor, 'Tạo kỳ thủ công');
    return row;
  }

  daTonTai(maKy: string): boolean {
    return this.rowsSignal().some((k) => k.maKy === maKy);
  }

  chotKy(maKy: string, actor: string): void {
    this.doiTrangThai(maKy, 'DANG_CHOT');
    this.ghiNhatKy(maKy, 'KHOA', actor, 'Chuyển sang trạng thái đang chốt');
  }

  khoaKy(maKy: string, actor: string): void {
    this.doiTrangThai(maKy, 'DA_KHOA');
    this.ghiNhatKy(maKy, 'KHOA', actor, '');
  }

  /**
   * Mở lại kỳ đã khoá — **lý do bắt buộc**, và luôn ghi nhật ký.
   *
   * Trả `false` khi thiếu lý do thay vì ném lỗi: đây là luật nghiệp vụ mà màn hình phải chặn từ
   * trước (nút Xác nhận disabled), nên tới được đây mà thiếu lý do là lỗi lập trình — nhưng lỗi đó
   * không được phép trở thành "mở kỳ không dấu vết".
   *
   * Ai được gọi hàm này là **Q2 còn treo** — xem `QuyenHrService.moLaiKy`.
   */
  moLaiKy(maKy: string, actor: string, lyDo: string): boolean {
    if (!lyDo.trim()) return false;
    this.doiTrangThai(maKy, 'MO');
    this.ghiNhatKy(maKy, 'MO_LAI', actor, lyDo.trim());
    return true;
  }

  private doiTrangThai(maKy: string, trangThai: KyTrangThai): void {
    this.rowsSignal.update((prev) => prev.map((k) => (k.maKy === maKy ? { ...k, trangThai } : k)));
  }

  private ghiNhatKy(maKy: string, hanhDong: KyHanhDong, actor: string, lyDo: string): void {
    const muc: NhatKyKy = {
      id: `nk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      thoiDiem: nowStamp(),
      maKy,
      hanhDong,
      actor,
      lyDo,
    };
    this.nhatKySignal.update((prev) => [muc, ...prev]);
  }
}

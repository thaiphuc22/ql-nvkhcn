import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';

import { DON_VI_TREE, UNG_VIEN_NHAN_SU, UngVienNhanSu } from '../../../core/models/hr/nhan-su';

/**
 * Pop-up chọn nhân sự theo bản thiết kế VHT (node `3161:108022`): cây đơn vị bên trái, bảng ứng
 * viên bên phải có radio (chọn 1) hoặc checkbox (chọn nhiều), ô tìm kiếm phía trên bảng, footer
 * `Huỷ` / `Chọn (n)`.
 *
 * Dùng chung cho cả bảng thành viên đề tài lẫn màn Nhân sự — nguồn ứng viên là `UNG_VIEN_NHAN_SU`
 * (phẳng hoá từ `core/models/org-users.ts`), không tự dựng danh sách riêng.
 *
 * `daCo` là các mã đã nằm trong đề tài: hiện mờ + không chọn được, thay vì cho chọn rồi báo lỗi
 * trùng sau khi bấm — người dùng biết trước vì sao không bấm được.
 */
@Component({
  selector: 'hr-nhan-su-picker',
  imports: [
    FormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzEmptyModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzRadioModule,
  ],
  templateUrl: './nhan-su-picker.html',
  styleUrl: './nhan-su-picker.scss',
})
export class HrNhanSuPicker {
  readonly visible = input.required<boolean>();
  /** `false` = chọn đúng 1 người (radio). */
  readonly nhieu = input(true);
  /** Mã nhân viên đã có sẵn — khoá không cho chọn lại. */
  readonly daCo = input<readonly string[]>([]);

  readonly huy = output<void>();
  readonly xacNhan = output<UngVienNhanSu[]>();

  readonly donViList = DON_VI_TREE;
  readonly donViDangChon = signal<string | null>(null);
  readonly tuKhoa = signal('');
  readonly dangChon = signal<ReadonlySet<string>>(new Set());

  readonly daCoSet = computed(() => new Set(this.daCo()));

  readonly ungVien = computed(() => {
    const q = this.tuKhoa().trim().toLocaleLowerCase('vi');
    const donVi = this.donViDangChon();
    return UNG_VIEN_NHAN_SU.filter((u) => {
      if (donVi && u.donVi !== donVi) return false;
      if (!q) return true;
      return [u.maNhanVien, u.hoTen, u.email, u.chucDanh].some((v) => v.toLocaleLowerCase('vi').includes(q));
    });
  });

  readonly soDaChon = computed(() => this.dangChon().size);

  constructor() {
    // Mở lại pop-up thì xoá lựa chọn cũ — nếu không, lần chọn trước còn dính lại và người dùng vô
    // tình thêm nhầm người.
    effect(() => {
      if (this.visible()) {
        this.dangChon.set(new Set());
        this.tuKhoa.set('');
        this.donViDangChon.set(null);
      }
    });
  }

  bicKhoa(ma: string): boolean {
    return this.daCoSet().has(ma);
  }

  daTich(ma: string): boolean {
    return this.dangChon().has(ma);
  }

  toggle(ma: string): void {
    if (this.bicKhoa(ma)) return;
    if (!this.nhieu()) {
      this.dangChon.set(new Set([ma]));
      return;
    }
    const next = new Set(this.dangChon());
    if (next.has(ma)) next.delete(ma);
    else next.add(ma);
    this.dangChon.set(next);
  }

  chonDonVi(donVi: string | null): void {
    this.donViDangChon.set(donVi);
  }

  xacNhanChon(): void {
    const chon = this.dangChon();
    this.xacNhan.emit(UNG_VIEN_NHAN_SU.filter((u) => chon.has(u.maNhanVien)));
  }
}

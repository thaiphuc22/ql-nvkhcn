import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';

import {
  HanhDongLichHop,
  PhienHopLich,
  PhienHopLichService,
  TrangThaiPhienHop,
} from '../../core/services/phien-hop-lich.service';

export interface ThanhVienLichHop {
  hoTen: string;
  vaiTroTrongHoiDong: string | null;
}

const HANH_DONG_LABEL: Record<HanhDongLichHop, string> = {
  LEN_LICH: 'Lên lịch',
  NHAC_NHO: 'Nhắc nhở',
  DIEU_CHINH: 'Sửa',
  HUY: 'Hủy',
  THEM_PHIEN: 'Thêm phiên họp',
};

const TRANG_THAI_LABEL: Record<TrangThaiPhienHop, string> = {
  chua_dien_ra: 'Chưa diễn ra',
  da_dien_ra: 'Đã diễn ra',
  da_huy: 'Đã hủy',
};

const TRANG_THAI_COLOR: Record<TrangThaiPhienHop, string> = {
  chua_dien_ra: 'blue',
  da_dien_ra: 'green',
  da_huy: 'default',
};

/**
 * Lên lịch, thêm phiên họp, xem chi tiết, sửa và hủy.
 */
@Component({
  selector: 'app-phien-hop-panel',
  imports: [
    DatePipe, FormsModule, NzButtonModule, NzDatePickerModule, NzEmptyModule, NzIconModule, NzInputModule,
    NzModalModule, NzPopconfirmModule, NzTagModule, NzTimePickerModule,
  ],
  templateUrl: './phien-hop-panel.html',
  styleUrl: './phien-hop-panel.scss',
})
export class PhienHopPanelComponent {
  private readonly service = inject(PhienHopLichService);
  private readonly message = inject(NzMessageService);

  readonly hoiDongId = input.required<number>();
  readonly maHoiDong = input('');
  readonly thanhVien = input<ThanhVienLichHop[]>([]);
  readonly nguoiThaoTac = input('Người dùng');

  readonly revision = signal(0);
  readonly modalOpen = signal(false);
  readonly chiTietOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly themPhien = signal(false);
  readonly chiTiet = signal<PhienHopLich | null>(null);
  readonly ten = signal('');
  readonly ngay = signal<Date | null>(null);
  readonly gio = signal<Date | null>(null);
  readonly diaDiem = signal('');
  readonly ghiChu = signal('');

  readonly hanhDongLabel = HANH_DONG_LABEL;
  readonly trangThaiLabel = TRANG_THAI_LABEL;
  readonly trangThaiColor = TRANG_THAI_COLOR;

  readonly phien = computed(() => {
    this.revision();
    return this.service.list(this.hoiDongId());
  });

  readonly laViDu = computed(() => {
    this.revision();
    return this.service.laViDu(this.hoiDongId());
  });

  readonly soPhienTiep = computed(() =>
    this.phien().reduce((max, phien) => Math.max(max, phien.loaiPhien), 0) + 1);

  readonly lichSu = computed(() =>
    this.phien()
      .flatMap((p) => p.lichSu.map((h) => ({ ...h, tenPhien: p.ten, loaiPhien: p.loaiPhien })))
      .sort((a, b) => b.thoiDiem.localeCompare(a.thoiDiem)),
  );

  moLenLich(): void {
    this.moTao(false);
  }

  moThemPhien(): void {
    this.moTao(true);
  }

  private moTao(themPhien: boolean): void {
    this.editingId.set(null);
    this.themPhien.set(themPhien);
    this.ten.set(`Họp phiên ${this.soPhienTiep()}`);
    this.ngay.set(null);
    this.gio.set(null);
    this.diaDiem.set('');
    this.ghiChu.set('');
    this.modalOpen.set(true);
  }

  moChiTiet(phien: PhienHopLich): void {
    this.chiTiet.set(phien);
    this.chiTietOpen.set(true);
  }

  dongChiTiet(): void {
    this.chiTietOpen.set(false);
    this.chiTiet.set(null);
  }

  moSua(phien: PhienHopLich): void {
    if (phien.trangThai !== 'chua_dien_ra') {
      this.message.warning('Chỉ sửa được phiên chưa diễn ra.');
      return;
    }
    this.editingId.set(phien.id);
    this.themPhien.set(false);
    this.ten.set(phien.ten);
    this.ganNgayGio(phien.thoiGian);
    this.diaDiem.set(phien.diaDiem);
    this.ghiChu.set(phien.ghiChu);
    this.modalOpen.set(true);
  }

  dongModal(): void {
    this.modalOpen.set(false);
  }

  luu(): void {
    try {
      const editing = this.editingId();
      if (editing) {
        this.service.dieuChinh(this.hoiDongId(), editing, {
          thoiGian: this.chuoiThoiGian(),
          diaDiem: this.diaDiem(),
          ghiChu: this.ghiChu(),
          nguoi: this.nguoiThaoTac(),
        });
        this.message.success('Đã sửa lịch họp.');
      } else {
        this.service.lenLich(this.hoiDongId(), {
          ten: this.ten(),
          thoiGian: this.chuoiThoiGian(),
          diaDiem: this.diaDiem(),
          ghiChu: this.ghiChu(),
          nguoi: this.nguoiThaoTac(),
        });
        this.message.success(this.themPhien() ? 'Đã thêm phiên họp.' : 'Đã lên lịch họp.');
      }
      this.revision.update((n) => n + 1);
      this.modalOpen.set(false);
    } catch (error) {
      this.message.error(error instanceof Error ? error.message : 'Không lưu được lịch họp.');
    }
  }

  hienNgay(value: string): string {
    const date = this.docThoiGian(value);
    if (!date) return value;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  }

  hienGio(value: string): string {
    const date = this.docThoiGian(value);
    if (!date) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private chuoiThoiGian(): string {
    const ngay = this.ngay();
    const gio = this.gio();
    if (!ngay || !gio) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${ngay.getFullYear()}-${pad(ngay.getMonth() + 1)}-${pad(ngay.getDate())}T${pad(gio.getHours())}:${pad(gio.getMinutes())}`;
  }

  private ganNgayGio(value: string): void {
    const date = this.docThoiGian(value);
    this.ngay.set(date);
    this.gio.set(date ? new Date(date) : null);
  }

  private docThoiGian(value: string): Date | null {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  huy(phien: PhienHopLich): void {
    try {
      this.service.huy(this.hoiDongId(), phien.id, this.nguoiThaoTac());
      this.revision.update((n) => n + 1);
      this.message.success('Đã hủy lịch họp.');
    } catch (error) {
      this.message.error(error instanceof Error ? error.message : 'Không hủy được lịch.');
    }
  }
}

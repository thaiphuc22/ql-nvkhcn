import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';

import {
  LOAI_SHTT_OPTS,
  TRANG_THAI_BAO_HO,
  TRANG_THAI_SHTT_COLOR,
  TRANG_THAI_SHTT_LABEL,
  type HoSoShtt,
  type LoaiShtt,
} from '../../core/models/rd08-shtt';
import { ShttService } from '../../core/services/shtt.service';

@Component({
  selector: 'app-shtt-list',
  imports: [
    FormsModule,
    NzButtonModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
    NzIconModule,
    NzPopconfirmModule,
  ],
  templateUrl: './shtt-list.html',
  styleUrl: './shtt-list.scss',
})
export class ShttListPage {
  private readonly service = inject(ShttService);
  private readonly message = inject(NzMessageService);

  readonly tick = signal(0);
  readonly search = signal('');
  readonly modalOpen = signal(false);
  readonly editing = signal<HoSoShtt | null>(null);

  readonly form = signal({
    ten: '',
    loai: 'SC' as LoaiShtt,
    maNV: '',
    tenNV: '',
    donViChuQuan: '',
    tacGia: '',
    chuSoHuu: 'Viettel High Tech',
    tyLeQuyen: 'VHT 100%',
    trangThaiBaoHo: 'Chưa đăng ký',
    soDon: '',
  });

  readonly rows = computed(() => {
    this.tick();
    const q = this.search().trim().toLowerCase();
    return this.service.list().filter((x) => {
      if (x.trangThai === 'inactive') return false;
      if (!q) return true;
      return [x.ma, x.ten, x.maNV, x.tacGia].join(' ').toLowerCase().includes(q);
    });
  });

  readonly statusLabel = TRANG_THAI_SHTT_LABEL;
  readonly statusColor = TRANG_THAI_SHTT_COLOR;
  readonly loaiOpts = LOAI_SHTT_OPTS;
  readonly baoHoOpts = TRANG_THAI_BAO_HO;

  refresh(): void {
    this.tick.update((n) => n + 1);
  }

  openCreate(): void {
    this.editing.set(null);
    this.form.set({
      ten: '',
      loai: 'SC',
      maNV: '',
      tenNV: '',
      donViChuQuan: '',
      tacGia: '',
      chuSoHuu: 'Viettel High Tech',
      tyLeQuyen: 'VHT 100%',
      trangThaiBaoHo: 'Chưa đăng ký',
      soDon: '',
    });
    this.modalOpen.set(true);
  }

  openEdit(row: HoSoShtt): void {
    this.editing.set(row);
    this.form.set({
      ten: row.ten,
      loai: row.loai,
      maNV: row.maNV,
      tenNV: row.tenNV,
      donViChuQuan: row.donViChuQuan,
      tacGia: row.tacGia,
      chuSoHuu: row.chuSoHuu,
      tyLeQuyen: row.tyLeQuyen,
      trangThaiBaoHo: row.trangThaiBaoHo,
      soDon: row.soDon,
    });
    this.modalOpen.set(true);
  }

  patchForm<K extends keyof ReturnType<ShttListPage['form']>>(key: K, value: ReturnType<ShttListPage['form']>[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  save(): void {
    const f = this.form();
    if (!f.ten.trim()) {
      this.message.warning('Vui lòng nhập tên đăng ký');
      return;
    }
    const edit = this.editing();
    if (edit) {
      this.service.save({
        ...edit,
        ...f,
        updatedAt: new Date().toISOString().slice(0, 10),
        history: [...edit.history, { at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng', action: 'Chỉnh sửa' }],
      });
      this.message.success(`Đã cập nhật ${edit.ma}`);
    } else {
      const created = this.service.createBlank(f);
      this.service.save(created);
      this.message.success(`Đã tạo ${created.ma}`);
    }
    this.modalOpen.set(false);
    this.refresh();
  }

  submit(row: HoSoShtt): void {
    this.service.setStatus(row.id, 'submitted', 'Trình duyệt');
    this.message.success(`Đã trình duyệt ${row.ma}`);
    this.refresh();
  }

  softDelete(row: HoSoShtt): void {
    this.service.setStatus(row.id, 'inactive', 'Ngừng sử dụng');
    this.message.success(`Đã ngừng ${row.ma}`);
    this.refresh();
  }

  loaiLabel(code: string): string {
    return this.loaiOpts.find((o) => o.value === code)?.label ?? code;
  }
}

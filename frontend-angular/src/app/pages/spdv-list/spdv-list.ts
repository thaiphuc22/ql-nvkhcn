import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

import {
  LINH_VUC_SPDV_OPTIONS,
  NHOM_DONG_SPDV_OPTIONS,
  PHAN_LOAI_SPDV_LABEL,
  TRANG_THAI_SAN_PHAM_SPDV_LABEL,
  TRANG_THAI_SPDV_COLOR,
  TRANG_THAI_SPDV_LABEL,
  VONG_DOI_SPDV_LABEL,
  type SpdvItem,
  type TrangThaiSanPhamSpdv,
  type VongDoiSpdv,
} from '../../core/models/rd07-spdv';
import { SpdvService } from '../../core/services/spdv.service';

@Component({
  selector: 'app-spdv-list',
  imports: [
    FormsModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
    NzIconModule,
    NzPopconfirmModule,
  ],
  templateUrl: './spdv-list.html',
  styleUrl: './spdv-list.scss',
})
export class SpdvListPage {
  private readonly service = inject(SpdvService);
  private readonly message = inject(NzMessageService);

  readonly tick = signal(0);
  readonly search = signal('');
  readonly modalOpen = signal(false);
  readonly editing = signal<SpdvItem | null>(null);

  readonly form = signal({
    ten: '',
    linhVuc: LINH_VUC_SPDV_OPTIONS[0] as string,
    nhomDong: NHOM_DONG_SPDV_OPTIONS[0] as string,
    phanLoai: 'SPDV_NCPT' as SpdvItem['phanLoai'],
    vongDoi: 'nghien_cuu' as VongDoiSpdv,
    trangThaiSanPham: 'nghien_cuu' as TrangThaiSanPhamSpdv,
    maNVLienQuan: '',
    khachHang: '',
    doanhThu: 0,
    chiPhi: 0,
  });

  readonly rows = computed(() => {
    this.tick();
    const q = this.search().trim().toLowerCase();
    return this.service.list().filter((x) => {
      if (x.trangThai === 'ngung') return false;
      if (!q) return true;
      return [x.ma, x.ten, x.linhVuc, x.maNVLienQuan].join(' ').toLowerCase().includes(q);
    });
  });

  readonly vongDoiLabel = VONG_DOI_SPDV_LABEL;
  readonly trangThaiLabel = TRANG_THAI_SPDV_LABEL;
  readonly trangThaiColor = TRANG_THAI_SPDV_COLOR;
  readonly phanLoaiLabel = PHAN_LOAI_SPDV_LABEL;
  readonly spStatusLabel = TRANG_THAI_SAN_PHAM_SPDV_LABEL;
  readonly linhVucOpts = LINH_VUC_SPDV_OPTIONS;
  readonly nhomDongOpts = NHOM_DONG_SPDV_OPTIONS;

  refresh(): void {
    this.tick.update((n) => n + 1);
  }

  openCreate(): void {
    this.editing.set(null);
    this.form.set({
      ten: '',
      linhVuc: LINH_VUC_SPDV_OPTIONS[0],
      nhomDong: NHOM_DONG_SPDV_OPTIONS[0],
      phanLoai: 'SPDV_NCPT',
      vongDoi: 'nghien_cuu',
      trangThaiSanPham: 'nghien_cuu',
      maNVLienQuan: '',
      khachHang: '',
      doanhThu: 0,
      chiPhi: 0,
    });
    this.modalOpen.set(true);
  }

  openEdit(row: SpdvItem): void {
    this.editing.set(row);
    this.form.set({
      ten: row.ten,
      linhVuc: row.linhVuc ?? LINH_VUC_SPDV_OPTIONS[0],
      nhomDong: row.nhomDong ?? NHOM_DONG_SPDV_OPTIONS[0],
      phanLoai: row.phanLoai,
      vongDoi: row.vongDoi,
      trangThaiSanPham: row.trangThaiSanPham ?? 'nghien_cuu',
      maNVLienQuan: row.maNVLienQuan ?? '',
      khachHang: row.khachHang ?? '',
      doanhThu: row.doanhThu ?? 0,
      chiPhi: row.chiPhi ?? 0,
    });
    this.modalOpen.set(true);
  }

  patchForm<K extends keyof ReturnType<SpdvListPage['form']>>(key: K, value: ReturnType<SpdvListPage['form']>[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  save(): void {
    const f = this.form();
    if (!f.ten.trim()) {
      this.message.warning('Vui lòng nhập tên SPDV');
      return;
    }
    const edit = this.editing();
    const loiNhuan = (f.doanhThu || 0) - (f.chiPhi || 0);
    if (edit) {
      this.service.save({
        ...edit,
        ...f,
        loiNhuan,
        updatedAt: new Date().toLocaleDateString('vi-VN'),
        history: [...edit.history, { at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng', action: 'Chỉnh sửa' }],
      });
      this.message.success(`Đã cập nhật ${edit.ma}`);
    } else {
      const created = this.service.createBlank({ ...f, loiNhuan });
      this.service.save(created);
      this.message.success(`Đã tạo ${created.ma}`);
    }
    this.modalOpen.set(false);
    this.refresh();
  }

  softDelete(row: SpdvItem): void {
    this.service.remove(row.id);
    this.message.success(`Đã ngừng ${row.ma}`);
    this.refresh();
  }
}

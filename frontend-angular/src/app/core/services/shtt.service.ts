import { Injectable, signal } from '@angular/core';

import { seedHoSoShtt, type HoSoShtt, type TrangThaiShtt } from '../models/rd08-shtt';

const KEY = 'qtkhcn.rd08.shtt.v1';

@Injectable({ providedIn: 'root' })
export class ShttService {
  private readonly revision = signal(0);

  list(): HoSoShtt[] {
    this.revision();
    return this.read() ?? structuredClone(seedHoSoShtt);
  }

  save(item: HoSoShtt): HoSoShtt {
    const list = this.list().filter((x) => x.id !== item.id);
    list.unshift(item);
    localStorage.setItem(KEY, JSON.stringify(list));
    this.revision.update((n) => n + 1);
    return item;
  }

  setStatus(id: string, trangThai: TrangThaiShtt, action: string): void {
    const item = this.list().find((x) => x.id === id);
    if (!item) return;
    this.save({
      ...item,
      trangThai,
      updatedAt: new Date().toISOString().slice(0, 10),
      history: [...item.history, { at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng', action }],
    });
  }

  createBlank(partial: Partial<HoSoShtt> & { ten: string }): HoSoShtt {
    const n = this.list().length + 1;
    return {
      id: `IP${String(n).padStart(3, '0')}`,
      ma: `SHTT.2026.${String(n).padStart(3, '0')}`,
      ten: partial.ten,
      loai: partial.loai ?? 'SC',
      maNV: partial.maNV ?? '',
      tenNV: partial.tenNV ?? '',
      donViChuQuan: partial.donViChuQuan ?? '',
      tacGia: partial.tacGia ?? '',
      tyLeDongGop: partial.tyLeDongGop ?? '100%',
      chuSoHuu: partial.chuSoHuu ?? 'Viettel High Tech',
      tyLeQuyen: partial.tyLeQuyen ?? 'VHT 100%',
      trangThaiBaoHo: partial.trangThaiBaoHo ?? 'Chưa đăng ký',
      soDon: partial.soDon ?? '',
      ngayNop: partial.ngayNop ?? '',
      trangThai: 'draft',
      updatedAt: new Date().toISOString().slice(0, 10),
      history: [{ at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng', action: 'Tạo mới' }],
    };
  }

  private read(): HoSoShtt[] | null {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as HoSoShtt[]) : null;
    } catch {
      return null;
    }
  }
}

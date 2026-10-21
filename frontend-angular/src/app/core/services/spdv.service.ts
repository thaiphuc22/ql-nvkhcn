import { Injectable, signal } from '@angular/core';

import {
  nextSpdvId,
  nextSpdvMa,
  seedSpdvCatalog,
  type SpdvItem,
  type TrangThaiSanPhamSpdv,
} from '../models/rd07-spdv';

const KEY = 'qtkhcn.rd07.spdv.v1';

@Injectable({ providedIn: 'root' })
export class SpdvService {
  private readonly revision = signal(0);

  list(): SpdvItem[] {
    this.revision();
    return this.read() ?? structuredClone(seedSpdvCatalog);
  }

  save(item: SpdvItem): SpdvItem {
    const list = this.list().filter((x) => x.id !== item.id);
    list.unshift(item);
    localStorage.setItem(KEY, JSON.stringify(list));
    this.revision.update((n) => n + 1);
    return item;
  }

  remove(id: string): void {
    const list = this.list().map((x) =>
      x.id === id ? { ...x, trangThai: 'ngung' as const, updatedAt: new Date().toLocaleDateString('vi-VN') } : x,
    );
    localStorage.setItem(KEY, JSON.stringify(list));
    this.revision.update((n) => n + 1);
  }

  createBlank(partial: Partial<SpdvItem> & { ten: string }): SpdvItem {
    const list = this.list();
    const trangThaiSanPham: TrangThaiSanPhamSpdv = partial.trangThaiSanPham ?? 'nghien_cuu';
    return {
      id: nextSpdvId(list),
      ma: nextSpdvMa(list, trangThaiSanPham),
      ten: partial.ten,
      linhVuc: partial.linhVuc,
      nhomDong: partial.nhomDong,
      congNgheLoi: partial.congNgheLoi ?? [],
      taiSanShtt: partial.taiSanShtt ?? [],
      trangThaiSanPham,
      khachHang: partial.khachHang,
      phanLoai: partial.phanLoai ?? 'SPDV_NCPT',
      vongDoi: partial.vongDoi ?? 'nghien_cuu',
      trangThai: partial.trangThai ?? 'draft_dau_nam',
      quyHienHanh: partial.quyHienHanh ?? '2026-Q3',
      doanhThu: partial.doanhThu,
      chiPhi: partial.chiPhi,
      loiNhuan: partial.loiNhuan,
      maNVLienQuan: partial.maNVLienQuan,
      updatedAt: new Date().toLocaleDateString('vi-VN'),
      updatedByTuyen: 'QLDM_SPDV',
      history: [{ at: new Date().toLocaleString('vi-VN'), actor: 'Người dùng', action: 'Tạo mới', buoc: 1 }],
    };
  }

  private read(): SpdvItem[] | null {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as SpdvItem[]) : null;
    } catch {
      return null;
    }
  }
}

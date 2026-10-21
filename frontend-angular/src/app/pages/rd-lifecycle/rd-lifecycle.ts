import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

import {
  RD_LUONGS,
  RD_NHOM_META,
  type RdLuong,
  type RdNhomMeta,
} from '../../core/models/rd-lifecycle';

@Component({
  selector: 'app-rd-lifecycle',
  imports: [
    RouterLink,
    NzButtonModule,
    NzCardModule,
    NzDrawerModule,
    NzIconModule,
    NzTagModule,
    NzEmptyModule,
  ],
  templateUrl: './rd-lifecycle.html',
  styleUrl: './rd-lifecycle.scss',
})
export class RdLifecyclePage {
  readonly nhoms = RD_NHOM_META;
  readonly allLuongs = RD_LUONGS;

  readonly filterNhom = signal<string | 'ALL'>('ALL');
  readonly filterPha = signal<0 | 1 | 2>(0);
  readonly selected = signal<RdLuong | null>(null);
  readonly drawerOpen = signal(false);

  readonly filtered = computed(() => {
    const nhom = this.filterNhom();
    const pha = this.filterPha();
    return this.allLuongs.filter((l) => {
      if (nhom !== 'ALL' && l.nhom !== nhom) return false;
      if (pha !== 0 && l.pha !== pha) return false;
      return true;
    });
  });

  readonly grouped = computed(() => {
    const map = new Map<string, { meta: RdNhomMeta; items: RdLuong[] }>();
    for (const meta of this.nhoms) {
      const items = this.filtered().filter((l) => l.nhom === meta.ma);
      if (items.length) map.set(meta.ma, { meta, items });
    }
    return [...map.values()];
  });

  readonly stats = computed(() => {
    const list = this.filtered();
    return {
      tong: list.length,
      pha1: list.filter((l) => l.pha === 1).length,
      pha2: list.filter((l) => l.pha === 2).length,
      coUi: list.filter((l) => !!l.uiRoute).length,
    };
  });

  setNhom(ma: string | 'ALL'): void {
    this.filterNhom.set(ma);
  }

  setPha(p: 0 | 1 | 2): void {
    this.filterPha.set(p);
  }

  openDetail(l: RdLuong): void {
    this.selected.set(l);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  capLabel(cap: RdLuong['cap']): string {
    switch (cap) {
      case 'CS':
        return 'Cấp Cơ sở';
      case 'TD':
        return 'Cấp Tập đoàn';
      case 'INT':
        return 'Tích hợp hệ thống';
      default:
        return 'Chung';
    }
  }
}

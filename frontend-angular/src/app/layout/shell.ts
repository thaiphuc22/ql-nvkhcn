import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

import { AuthService } from '../core/auth/auth.service';
import { findApp } from '../core/auth/app-registry';
import { isNavGroup, NAV_ITEMS, navItemsForApp, NavGroup, SECTION_TITLE_BY_ROUTE } from './nav-items';

const SIDER_WIDTH = 230;
const SIDER_COLLAPSED_WIDTH = 80;

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzButtonModule,
    NzAvatarModule,
    NzDropDownModule,
    NzBreadCrumbModule,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly navItems = computed(() => navItemsForApp(this.auth.activeApp()));
  readonly siderWidth = SIDER_WIDTH;
  readonly siderCollapsedWidth = SIDER_COLLAPSED_WIDTH;

  readonly collapsed = signal(false);
  readonly currentUrl = signal(this.router.url);
  private readonly manuallyOpened = signal<ReadonlySet<string>>(new Set());
  private readonly manuallyClosed = signal<ReadonlySet<string>>(new Set());

  readonly user = this.auth.user;
  readonly activeApp = computed(() => findApp(this.auth.activeApp()));

  readonly activeGroupKey = computed(() => this.findActiveGroup(this.currentUrl()));
  readonly sectionTitle = computed(() => this.findSectionTitle(this.currentUrl()));

  readonly openKeys = computed(() => {
    const active = this.activeGroupKey();
    const opened = new Set(this.manuallyOpened());
    if (active && !this.manuallyClosed().has(active)) opened.add(active);
    return opened;
  });

  readonly userInitials = computed(() => {
    const name = this.user()?.hoTen ?? '';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  });

  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.currentUrl.set(this.router.url));
  }

  toggleCollapsed(): void {
    this.collapsed.update((v) => !v);
  }

  toggleGroup(key: string, open: boolean): void {
    const opened = new Set(this.manuallyOpened());
    const closed = new Set(this.manuallyClosed());
    if (open) {
      opened.add(key);
      closed.delete(key);
    } else {
      opened.delete(key);
      closed.add(key);
    }
    this.manuallyOpened.set(opened);
    this.manuallyClosed.set(closed);
  }

  isGroup(item: (typeof NAV_ITEMS)[number]): item is NavGroup & { app: (typeof NAV_ITEMS)[number]['app'] } {
    return isNavGroup(item);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/dang-nhap']);
  }

  switchApp(): void {
    this.router.navigate(['/chon-ung-dung']);
  }

  private findActiveGroup(url: string): string | null {
    for (const item of this.navItems()) {
      if (!isNavGroup(item)) continue;
      const hit = item.children.some((leaf) => url === leaf.route || url.startsWith(leaf.route + '/'));
      if (hit) return item.key;
    }
    return null;
  }

  private findSectionTitle(url: string): string {
    let best: { title: string; route: string } | null = null;
    for (const [route, title] of Object.entries(SECTION_TITLE_BY_ROUTE)) {
      if ((url === route || url.startsWith(route + '/')) && (!best || route.length > best.route.length)) {
        best = { title, route };
      }
    }
    return best?.title ?? 'Hệ thống QTKHCN';
  }
}

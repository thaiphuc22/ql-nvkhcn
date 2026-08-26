import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';

import { findApp } from '../../core/auth/app-registry';
import { AuthService } from '../../core/auth/auth.service';
import { isNavGroup, NavGroup, NavItem, navItemsForApp } from '../nav-items';

/**
 * Shell riêng dựng theo design system VHT (topbar tối full-width + sider TRẮNG có pill đỏ) —
 * ngược cấu trúc `layout/shell.ts` (sider tối + header sáng), nên KHÔNG sửa shell chung: đổi shell
 * chung là đổi giao diện mọi màn đang demo, phần đắt và dễ vỡ nhất (plan §3).
 *
 * Component này **không phụ thuộc gì vào HR Tools**: menu đọc từ `navItemsForApp(activeApp())`,
 * thẻ phân hệ đọc từ `APP_REGISTRY`. Muốn chuyển cả app sang thiết kế mới thì đổi `component:` ở
 * `app.routes.ts` — một dòng.
 *
 * Menu render bằng markup thường thay vì `nz-menu`: pill đỏ đặc bo 8px của bản thiết kế khác hẳn
 * item mặc định của Ant (thanh nền nhạt + gạch phải), và ghi đè nó qua `::ng-deep` sẽ mong manh
 * hơn nhiều so với 40 dòng markup tự viết.
 */
@Component({
  selector: 'app-hr-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NzAvatarModule,
    NzBadgeModule,
    NzDropDownModule,
    NzIconModule,
    NzMenuModule,
  ],
  templateUrl: './hr-shell.html',
  styleUrl: './hr-shell.scss',
})
export class HrShell {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly user = this.auth.user;
  readonly activeApp = computed(() => findApp(this.auth.activeApp()));
  readonly navItems = computed(() => navItemsForApp(this.auth.activeApp()));
  readonly year = new Date().getFullYear();

  /** Số thông báo demo — badge chuông ở topbar. Chưa có nguồn thật ở đợt 1. */
  readonly soThongBao = 3;

  readonly collapsed = signal(false);
  readonly currentUrl = signal(this.router.url);
  private readonly manuallyClosed = signal<ReadonlySet<string>>(new Set());

  readonly userInitials = computed(() => {
    const parts = (this.user()?.hoTen ?? '').trim().split(/\s+/);
    return `${parts[0]?.[0] ?? ''}${parts.length > 1 ? parts[parts.length - 1][0] : ''}`.toUpperCase();
  });

  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.currentUrl.set(this.router.url));

    this.auth.refreshCurrentUser();
  }

  isGroup(item: NavItem): item is NavGroup & { app: NavItem['app'] } {
    return isNavGroup(item);
  }

  /** Nhóm mở mặc định khi chứa route đang xem; người dùng đóng tay thì tôn trọng lựa chọn đó. */
  isOpen(group: NavGroup): boolean {
    if (this.manuallyClosed().has(group.key)) return false;
    return true;
  }

  hasActiveChild(group: NavGroup): boolean {
    const url = this.currentUrl();
    return group.children.some((leaf) => url === leaf.route || url.startsWith(leaf.route + '/'));
  }

  toggleGroup(key: string): void {
    const closed = new Set(this.manuallyClosed());
    if (closed.has(key)) closed.delete(key);
    else closed.add(key);
    this.manuallyClosed.set(closed);
  }

  toggleCollapsed(): void {
    this.collapsed.update((v) => !v);
  }

  switchApp(): void {
    void this.router.navigate(['/chon-ung-dung']);
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/dang-nhap']);
  }
}

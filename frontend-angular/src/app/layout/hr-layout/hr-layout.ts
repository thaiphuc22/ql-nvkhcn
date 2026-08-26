import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

import type { MenuItem } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { OverlayBadge } from 'primeng/overlaybadge';
import { CmmMenuComponent, CommonLayoutComponent, ToastComponent } from '@khcn-core/ui';

import { findApp } from '../../core/auth/app-registry';
import { AuthService } from '../../core/auth/auth.service';
import { hrIcon } from '../../core/hr-icons';
import { isNavGroup, NavGroup, NavItem, navItemsForApp } from '../nav-items';

/**
 * Shell của phân hệ **HR Tools** — dựng trên `CommonLayoutComponent` của `@khcn-core/ui` (D23),
 * thay cho `layout/hr-shell/` viết tay bằng ng-zorro.
 *
 * ## `CommonLayoutComponent` cho cái gì, và KHÔNG cho cái gì
 *
 * Nó là **khung**, không phải shell: `<div cmmLayout>` cao 100vh → `[header]` cao tự nhiên →
 * `cmmContent` chia `[left]` / `[right], [content]`, mỗi bên tự cuộn. Nó **không có** topbar, thẻ
 * phân hệ, hay component menu nào — cả `@khcn-core/ui` lẫn `@khcn-core/common` đều không lộ nav
 * component. Nên phần chrome (topbar tối + sider trắng + pill đỏ) vẫn phải tự dựng; giá trị lấy
 * được từ thư viện là bỏ đi toàn bộ phần tính chiều cao/cuộn thủ công của bản cũ.
 *
 * Cũng vì thế **không dùng** `cmm-header` / `cmm-header-management`: đọc style của chúng trong
 * `khcn-core-ui.mjs` thì header ấy cao **80px, nền gradient xám sáng** — khác hẳn topbar **60px
 * nền tối** của DS và của phân hệ Danh mục dùng chung đã build. Dùng vào là lệch ngay điểm dễ thấy
 * nhất. (Ghi lại để phiên sau không "sửa ngược": đây là lựa chọn có đo, không phải bỏ sót.)
 *
 * `cmm-user-action-header` cũng không dùng được: nó bắt buộc `avatarUrl` là ảnh, trong khi model
 * người dùng của hệ thống không có ảnh đại diện — render ra vòng tròn rỗng. Phần chuông + avatar
 * dưới đây dựng lại đúng cấu trúc đó bằng `p-overlaybadge` + `p-avatar [label]` (chữ cái tắt).
 *
 * ## Ràng buộc phải nhớ khi sửa
 *
 * `ScreenProps.leftPanelWidth` để `'auto'` chứ KHÔNG phải `'256px'`: `CmmLeftContentDirective`
 * áp style trong `afterNextRender` **một lần duy nhất**, input không phản ứng lại. Truyền số cụ thể
 * thì nút thu gọn sider bấm xong không đổi được bề rộng. Để `'auto'` thì bề rộng do chính `<aside>`
 * quyết định (CSS `.hr-sider`), thu gọn chạy bình thường.
 *
 * Menu vẫn đọc `navItemsForApp(activeApp())` — không hardcode. Icon dịch qua `hrIcon()` vì
 * `NAV_ITEMS` khai tên icon theo ng-zorro (xem `core/hr-icons.ts`).
 */
@Component({
  selector: 'app-hr-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonLayoutComponent,
    CmmMenuComponent,
    Avatar,
    OverlayBadge,
    ToastComponent,
  ],
  templateUrl: './hr-layout.html',
  styleUrl: './hr-layout.scss',
})
export class HrLayout {
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

  /** Xem chú thích lớp: `'auto'` là bắt buộc, đừng đổi thành `'256px'`. */
  readonly layoutProps = { showLeftPanel: true, leftPanelWidth: 'auto', enableScroll: true };

  readonly userInitials = computed(() => {
    const parts = (this.user()?.hoTen ?? '').trim().split(/\s+/);
    return `${parts[0]?.[0] ?? ''}${parts.length > 1 ? parts[parts.length - 1][0] : ''}`.toUpperCase();
  });

  /** Menu tài khoản ở topbar. `computed` vì nhãn dòng đầu đổi theo người đang đăng nhập. */
  readonly userMenuItems = computed<MenuItem[]>(() => [
    { label: this.user()?.hoTen ?? '', disabled: true },
    { separator: true },
    { label: 'Đổi ứng dụng', icon: 'pi pi-th-large', command: () => this.switchApp() },
    { label: 'Đăng xuất', icon: 'pi pi-sign-out', command: () => this.logout() },
  ]);

  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.currentUrl.set(this.router.url));

    this.auth.refreshCurrentUser();
  }

  readonly icon = hrIcon;

  isGroup(item: NavItem): item is NavGroup & { app: NavItem['app'] } {
    return isNavGroup(item);
  }

  /** Nhóm mở mặc định khi chứa route đang xem; người dùng đóng tay thì tôn trọng lựa chọn đó. */
  isOpen(group: NavGroup): boolean {
    return !this.manuallyClosed().has(group.key);
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

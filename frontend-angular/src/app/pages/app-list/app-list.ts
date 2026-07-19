import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { APP_REGISTRY, AppDefinition } from '../../core/auth/app-registry';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-list',
  imports: [NzAvatarModule, NzButtonModule, NzCardModule, NzEmptyModule, NzIconModule, NzTypographyModule],
  templateUrl: './app-list.html',
  styleUrl: './app-list.scss',
})
export class AppListPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.auth.user;
  readonly apps = computed(() => {
    const entitled = new Set(this.auth.entitledApps());
    return APP_REGISTRY.filter((app) => entitled.has(app.code));
  });

  readonly userInitials = computed(() => {
    const parts = (this.user()?.hoTen ?? '').trim().split(/\s+/);
    return `${parts[0]?.[0] ?? ''}${parts.at(-1)?.[0] ?? ''}`.toUpperCase();
  });

  open(app: AppDefinition): void {
    if (this.auth.selectApp(app.code)) this.router.navigateByUrl(app.defaultRoute);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/dang-nhap']);
  }
}

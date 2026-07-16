import { Component, inject, isDevMode, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';

import { AuthService } from '../../core/auth/auth.service';
import { DEMO_PASSWORD, DEMO_USERS } from '../../core/auth/demo-users';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzIconModule,
    NzAlertModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Card "Tài khoản demo" chỉ hiện ở dev — port đúng ý webapp/src/pages/Login.tsx (không lộ mật khẩu chung ra bản build production thật). */
  readonly showDemoAccounts = isDevMode();
  readonly demoUsers = DEMO_USERS;
  readonly demoPassword = DEMO_PASSWORD;

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);
    const { email, password } = this.form.getRawValue();
    const result = this.auth.login(email, password);
    this.submitting.set(false);
    if (result.ok) {
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/tong-quan';
      this.router.navigateByUrl(returnUrl);
    } else {
      this.errorMessage.set(result.error ?? 'Đăng nhập thất bại');
    }
  }

  fillQuick(email: string): void {
    this.form.patchValue({ email, password: DEMO_PASSWORD });
  }
}

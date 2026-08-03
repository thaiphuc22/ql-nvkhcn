import { Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { AuthService } from '../../core/auth/auth.service';
import { parseImportedFormJson } from '../../core/models/eform-import';
import { EformService } from '../../core/services/eform.service';
import { FormDesignerComponent } from '../../shared/form-designer/form-designer';

// Port của webapp/src/pages/FormDesignerPage.tsx — trang thiết kế biểu mẫu
// (route /phan-he/PH3/bieu-mau/:key/thiet-ke). `FormDesignerComponent` (form-js
// engine + AntD chrome D13) đảm nhiệm canvas/palette/panel; trang này chỉ điều phối
// route param, tải/lưu/huỷ qua `EformService` (`/api/eform`) và cảnh báo khi rời
// trang còn thay đổi chưa lưu.

const ROUTE_BASE = '/phan-he/PH3/bieu-mau';

@Component({
  selector: 'app-form-designer-page',
  standalone: true,
  imports: [NzButtonModule, NzIconModule, NzResultModule, NzSpinModule, FormDesignerComponent],
  templateUrl: './form-designer-page.html',
  styleUrl: './form-designer-page.scss',
})
export class FormDesignerPage {
  @ViewChild(FormDesignerComponent) private designer?: FormDesignerComponent;
  @ViewChild('jsonFileInput') private jsonFileInput?: ElementRef<HTMLInputElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly forms = inject(EformService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly auth = inject(AuthService);

  readonly formKey = signal<string | null>(null);
  readonly meta = computed(() => this.forms.getForm(this.formKey() ?? undefined));
  /** Đang tải form-key hiện tại lần đầu — giữ true cho tới khi loadOne() trả về, tránh chớp
   * "Không tìm thấy" trước khi dữ liệu thật kịp về. */
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly importing = signal(false);
  readonly notFound = signal(false);

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const key = params.get('key');
      this.formKey.set(key);
      this.notFound.set(false);
      if (!key) {
        this.loading.set(false);
        this.notFound.set(true);
        return;
      }
      this.loading.set(true);
      this.forms.loadOne(key).subscribe({
        next: () => this.loading.set(false),
        error: () => {
          this.loading.set(false);
          this.notFound.set(true);
        },
      });
    });
  }

  back(): void {
    if (this.designer?.isDirty()) {
      this.modal.confirm({
        nzTitle: 'Thoát khi chưa lưu?',
        nzContent: 'Thay đổi thiết kế chưa lưu sẽ bị mất.',
        nzOkText: 'Thoát',
        nzOkDanger: true,
        nzCancelText: 'Ở lại',
        nzOnOk: () => this.router.navigateByUrl(ROUTE_BASE),
      });
      return;
    }
    this.router.navigateByUrl(ROUTE_BASE);
  }

  backToLibrary(): void {
    this.router.navigateByUrl(ROUTE_BASE);
  }

  saveDesign(): void {
    const meta = this.meta();
    if (!meta || !this.designer) return;
    const schema = this.designer.getSchema();
    if (!schema) {
      this.message.error('Không lấy được schema từ designer.');
      return;
    }
    this.saving.set(true);
    this.forms.updateSchema(meta, schema, this.actor()).subscribe({
      next: () => {
        this.saving.set(false);
        this.designer?.markSaved();
        this.message.success(`Đã lưu thiết kế biểu mẫu "${meta.ten}".`);
      },
      error: (error) => {
        this.saving.set(false);
        this.message.error(error?.error?.message ?? 'Không lưu được thiết kế biểu mẫu.');
      },
    });
  }

  chooseJsonFile(): void {
    const input = this.jsonFileInput?.nativeElement;
    if (!input) return;
    input.value = '';
    input.click();
  }

  importJson(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    const runImport = (): Promise<void> => this.loadJsonFile(file);
    if (this.designer?.isDirty()) {
      this.modal.confirm({
        nzTitle: 'Thay thế thiết kế chưa lưu?',
        nzContent: 'Import JSON sẽ thay thế toàn bộ thiết kế hiện tại. Thay đổi chưa lưu sẽ bị mất.',
        nzOkText: 'Import và thay thế',
        nzOkDanger: true,
        nzCancelText: 'Huỷ',
        nzOnOk: runImport,
      });
      return;
    }
    void runImport();
  }

  private async loadJsonFile(file: File): Promise<void> {
    if (!this.designer) return;
    this.importing.set(true);
    try {
      const schema = parseImportedFormJson(await file.text(), file.size);
      await this.designer.importSchema(schema);
      this.message.success(`Đã import "${file.name}". Bấm “Lưu thiết kế” để ghi nhận thay đổi.`);
    } catch (error) {
      this.message.error(error instanceof Error ? error.message : 'Không import được tệp JSON.');
    } finally {
      this.importing.set(false);
    }
  }

  private actor(): string {
    return this.auth.user()?.hoTen ?? 'Quản trị hệ thống';
  }
}

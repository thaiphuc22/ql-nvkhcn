import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { AuthService } from '../../../core/auth/auth.service';
import { usageForSlot, type ApprovalSlot } from '../../../core/models/approval-slot-catalog';
import { ApprovalMatrixService } from '../../../core/services/approval-matrix.service';
import { ApprovalSlotCatalogService } from '../../../core/services/approval-slot-catalog.service';

/**
 * Tab "Danh mục Loại phê duyệt" — CRUD trên ApprovalSlotCatalogService: nguồn duy
 * nhất cho các loại phê duyệt (Need Role) mà BPMN gán qua Properties Panel và Ma
 * trận phê duyệt dùng để ánh xạ luật. Port của `SlotCatalogTab()` trong
 * webapp/src/pages/ApprovalMatrix.tsx (D17 Angular migration).
 */
@Component({
  selector: 'app-approval-slot-catalog-tab',
  imports: [
    FormsModule,
    NzAlertModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzSwitchModule,
    NzTableModule,
    NzTagModule,
    NzTypographyModule,
  ],
  templateUrl: './approval-slot-catalog-tab.html',
  styleUrl: './approval-slot-catalog-tab.scss',
})
export class ApprovalSlotCatalogTabPage {
  private readonly slotCatalog = inject(ApprovalSlotCatalogService);
  private readonly matrix = inject(ApprovalMatrixService);
  private readonly auth = inject(AuthService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);

  readonly slots = this.slotCatalog.slots;

  readonly editing = signal<ApprovalSlot | null>(null);
  readonly modalOpen = signal(false);

  readonly formCode = signal('');
  readonly formTen = signal('');
  readonly formMoTa = signal('');
  readonly formNhom = signal<string[]>([]);
  readonly formThuTu = signal(0);

  readonly sortedSlots = computed(() => [...this.slots()].sort((a, b) => a.thuTu - b.thuTu));
  readonly canSave = computed(() => {
    const codeOk = this.editing() !== null || this.formCode().trim().length > 0;
    return codeOk && this.formTen().trim().length > 0;
  });
  readonly modalTitle = computed(() => {
    const editing = this.editing();
    return editing ? `Sửa loại phê duyệt "${editing.code}"` : 'Thêm loại phê duyệt mới';
  });

  usage(code: string): number {
    return usageForSlot(code, this.matrix.rules());
  }

  private actor(): string {
    return this.auth.user()?.hoTen ?? 'Quản trị hệ thống';
  }

  openCreate(): void {
    this.editing.set(null);
    this.formCode.set('');
    this.formTen.set('');
    this.formMoTa.set('');
    this.formNhom.set([]);
    this.formThuTu.set(0);
    this.modalOpen.set(true);
  }

  openEdit(s: ApprovalSlot): void {
    this.editing.set(s);
    this.formCode.set(s.code);
    this.formTen.set(s.ten);
    this.formMoTa.set(s.moTa ?? '');
    this.formNhom.set(s.nhomQuyTrinh ?? []);
    this.formThuTu.set(s.thuTu);
    this.modalOpen.set(true);
  }

  save(): void {
    if (!this.canSave()) return;
    const editing = this.editing();
    const nhomQuyTrinh = this.formNhom().length ? this.formNhom() : undefined;
    const moTa = this.formMoTa().trim() || undefined;

    if (editing) {
      this.slotCatalog.update(
        editing.code,
        { ten: this.formTen().trim(), moTa, nhomQuyTrinh, thuTu: this.formThuTu() },
        this.actor(),
      ).subscribe({
        next: () => {
          this.modalOpen.set(false);
          this.message.success('Đã cập nhật slot.');
        },
        error: (error) => this.message.error(error?.error?.message ?? 'Không cập nhật được slot.'),
      });
      return;
    }

    this.slotCatalog.create(
      { code: this.formCode(), ten: this.formTen().trim(), moTa, nhomQuyTrinh },
      this.actor(),
    ).subscribe({
      next: () => {
        this.modalOpen.set(false);
        this.message.success('Đã thêm slot mới.');
      },
      error: (error) => this.message.error(error?.error?.message ?? error?.message ?? 'Không thêm được slot.'),
    });
  }

  toggleStatus(s: ApprovalSlot, checked: boolean): void {
    const usage = this.usage(s.code);
    const apply = (force: boolean) => {
      this.slotCatalog.setStatus(s.code, checked ? 'active' : 'inactive', force, this.actor()).subscribe({
        next: () => this.message.success(checked ? `Đã kích hoạt lại "${s.code}".` : `Đã huỷ kích hoạt "${s.code}".`),
        error: (error) => this.message.error(error?.error?.message ?? 'Không đổi được trạng thái slot.'),
      });
    };
    if (!checked && usage > 0) {
      this.modal.confirm({
        nzTitle: 'Huỷ kích hoạt loại phê duyệt đang được luật tham chiếu?',
        nzContent: `Loại phê duyệt "${s.code}" đang có ${usage} luật ánh xạ tham chiếu. Huỷ kích hoạt sẽ ẩn loại phê duyệt này khỏi các danh sách chọn (luật mới, mô phỏng) nhưng KHÔNG xoá hay tắt các luật hiện có.`,
        nzOkText: 'Vẫn huỷ kích hoạt',
        nzCancelText: 'Huỷ bỏ',
        nzOkDanger: true,
        nzOnOk: () => apply(true),
      });
      return;
    }
    apply(false);
  }
}

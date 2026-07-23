import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { AuthService } from '../../core/auth/auth.service';
import {
  BUSINESS_RULE_CATEGORY_LABEL,
  BUSINESS_RULE_KIND_LABEL,
  BUSINESS_RULE_STATUS_META,
  BusinessRule,
  BusinessRuleCategory,
  BusinessRuleKind,
  BusinessRuleStatus,
} from '../../core/models/business-rule';
import { ProcessDefinitionSummaryResponse } from '../../core/models/process-definition';
import { BusinessRuleService } from '../../core/services/business-rule.service';
import { ProcessDefinitionService } from '../../core/services/process-definition.service';

@Component({
  selector: 'app-business-rule-list',
  imports: [
    FormsModule,
    NzAlertModule,
    NzButtonModule,
    NzDescriptionsModule,
    NzDrawerModule,
    NzEmptyModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
    NzTypographyModule,
  ],
  templateUrl: './business-rule-list.html',
  styleUrl: './business-rule-list.scss',
})
export class BusinessRuleListPage {
  private readonly store = inject(BusinessRuleService);
  private readonly auth = inject(AuthService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly router = inject(Router);
  private readonly processDefinitions = inject(ProcessDefinitionService);

  readonly categoryLabels = BUSINESS_RULE_CATEGORY_LABEL;
  readonly kindLabels = BUSINESS_RULE_KIND_LABEL;
  readonly statusMeta = BUSINESS_RULE_STATUS_META;
  readonly categories = Object.keys(BUSINESS_RULE_CATEGORY_LABEL) as BusinessRuleCategory[];
  readonly kinds: BusinessRuleKind[] = ['DMN'];
  readonly statuses = Object.keys(BUSINESS_RULE_STATUS_META) as BusinessRuleStatus[];

  readonly query = signal('');
  readonly categoryFilter = signal<BusinessRuleCategory | null>(null);
  readonly kindFilter = signal<BusinessRuleKind | null>(null);
  readonly statusFilter = signal<BusinessRuleStatus | null>(null);
  readonly selectedRule = signal<BusinessRule | null>(null);
  readonly createOpen = signal(false);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly creating = signal(false);

  readonly createName = signal('');
  readonly createDescription = signal('');
  readonly createCategory = signal<BusinessRuleCategory>('THRESHOLD');
  readonly createKind = signal<BusinessRuleKind>('DMN');
  readonly createProcesses = signal<string[]>([]);
  readonly deployedProcesses = signal<ProcessDefinitionSummaryResponse[]>([]);
  readonly deployedProcessesLoading = signal(false);
  readonly deployedProcessesError = signal<string | null>(null);

  readonly stats = computed(() => {
    const rules = this.store.rules();
    return {
      total: rules.length,
      active: rules.filter((rule) => rule.status === 'ACTIVE').length,
      draft: rules.filter((rule) => rule.status === 'DRAFT').length,
      dmn: rules.filter((rule) => rule.kind === 'DMN').length,
    };
  });

  readonly rows = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.store.rules().filter((rule) => {
      const matchesQuery =
        !query ||
        rule.code.toLowerCase().includes(query) ||
        rule.name.toLowerCase().includes(query) ||
        rule.description.toLowerCase().includes(query);
      return (
        matchesQuery &&
        (!this.categoryFilter() || rule.category === this.categoryFilter()) &&
        (!this.kindFilter() || rule.kind === this.kindFilter()) &&
        (!this.statusFilter() || rule.status === this.statusFilter())
      );
    });
  });

  readonly canCreate = computed(
    () =>
      !!this.createName().trim() &&
      !!this.createDescription().trim() &&
      this.createProcesses().length > 0,
  );

  constructor() {
    this.loadRules();
  }

  loadRules(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.store.list().subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.loading.set(false);
        this.loadError.set('Không tải được danh sách luật từ backend.');
      },
    });
  }

  openCreate(): void {
    this.createName.set('');
    this.createDescription.set('');
    this.createCategory.set('THRESHOLD');
    this.createKind.set('DMN');
    this.createProcesses.set([]);
    this.createOpen.set(true);
    this.loadDeployedProcesses();
  }

  create(): void {
    if (!this.canCreate()) return;
    this.creating.set(true);
    this.store
      .create({
        name: this.createName().trim(),
        description: this.createDescription().trim(),
        category: this.createCategory(),
        kind: this.createKind(),
        appliedProcesses: this.createProcesses(),
        actor: this.actor(),
      })
      .subscribe({
        next: (rule) => {
          this.creating.set(false);
          this.createOpen.set(false);
          this.selectedRule.set(rule);
          this.message.success(`Đã tạo bản nháp ${rule.code}.`);
        },
        error: (error) => {
          this.creating.set(false);
          this.message.error(error?.error?.message ?? 'Không tạo được luật.');
        },
      });
  }

  openDetail(rule: BusinessRule): void {
    this.router.navigate(['/quan-ly-luat', rule.id]);
  }

  changeStatus(rule: BusinessRule, status: BusinessRuleStatus): void {
    const verb = status === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa';
    this.modal.confirm({
      nzTitle: `Xác nhận ${verb} luật?`,
      nzContent: `${rule.code} — ${rule.name}`,
      nzOkText: status === 'ACTIVE' ? 'Kích hoạt' : 'Vô hiệu hóa',
      nzCancelText: 'Huỷ',
      nzOnOk: () => {
        const request =
          status === 'ACTIVE'
            ? this.store.activate(rule.id, rule.version, rule.version, this.actor())
            : this.store.disable(rule.id, rule.version, this.actor());
        return new Promise<void>((resolve, reject) => {
          request.subscribe({
            next: (updated) => {
              this.selectedRule.set(
                this.selectedRule()?.id === updated.id ? updated : this.selectedRule(),
              );
              this.message.success(`Đã ${verb} ${rule.code}.`);
              resolve();
            },
            error: (error) => {
              const details = error?.error?.errors?.filter(Boolean)?.join(' · ');
              this.message.error(details || error?.error?.message || `Không thể ${verb} luật.`);
              reject(error);
            },
          });
        });
      },
    });
  }

  clearFilters(): void {
    this.query.set('');
    this.categoryFilter.set(null);
    this.kindFilter.set(null);
    this.statusFilter.set(null);
  }

  loadDeployedProcesses(): void {
    this.deployedProcessesLoading.set(true);
    this.deployedProcessesError.set(null);
    this.processDefinitions.list().subscribe({
      next: (processes) => {
        this.deployedProcesses.set(
          processes
            .filter((process) => process.status === 'DEPLOYED')
            .sort((a, b) => a.bpmnProcessId.localeCompare(b.bpmnProcessId, 'vi')),
        );
        this.deployedProcessesLoading.set(false);
      },
      error: () => {
        this.deployedProcesses.set([]);
        this.deployedProcessesLoading.set(false);
        this.deployedProcessesError.set(
          'Không tải được danh sách quy trình đã deploy. Vui lòng thử lại.',
        );
      },
    });
  }

  private actor(): string {
    return this.auth.user()?.hoTen ?? 'Người dùng';
  }
}

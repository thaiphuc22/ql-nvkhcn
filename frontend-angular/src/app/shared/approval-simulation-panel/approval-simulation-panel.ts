import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import {
  MODE_LABEL,
  VND,
  type ApprovalRule,
  type EvaluatedRule,
  type ResolveResult,
} from '../../core/models/approval-matrix';
import { APPROVAL_SLOTS, type SlotCode } from '../../core/models/approval-slot-catalog';
import {
  defaultSimulationContext,
  simulationVariables,
  type ApprovalVariableDef,
} from '../../core/models/approval-variable-registry';
import { roleLabel } from '../../core/models/roles';
import {
  ApprovalSimulationScenarioService,
  type SavedApprovalScenario,
} from '../../core/services/approval-simulation-scenario.service';
import { ApprovalMatrixService } from '../../core/services/approval-matrix.service';

interface QuickPreset {
  label: string;
  apply: (ctx: Record<string, unknown>) => Record<string, unknown>;
}

const QUICK_PRESETS: QuickPreset[] = [
  {
    label: 'Cấp Tập đoàn, NS ≥ 5 tỷ',
    apply: (ctx) => ({ ...ctx, capNhiemVu: 'TD', tongDuToan: 12_000_000_000 }),
  },
  {
    label: 'Cấp Cơ sở',
    apply: (ctx) => ({ ...ctx, capNhiemVu: 'CS', tongDuToan: 2_000_000_000 }),
  },
  {
    label: 'Cần hội đồng KHCN',
    apply: (ctx) => ({ ...ctx, loaiHoiDong: 'HD_KHCN_TD', capNhiemVu: 'TD' }),
  },
  {
    label: 'Có mua sắm',
    apply: (ctx) => ({ ...ctx, coMuaSam: true }),
  },
];

function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
}

interface EvaluatedSplit {
  relevant: EvaluatedRule[];
  skipped: EvaluatedRule[];
  skippedCount: number;
}

interface ResultDiff {
  added: ResolveResult['approvers'];
  removed: ResolveResult['approvers'];
  changed: boolean;
}

/**
 * Panel "Mô phỏng" — form động render từ APPROVAL_VARIABLES (simulated=true), chạy
 * `resolveApprovers()` và hiện kết quả (người phê duyệt, cảnh báo, "vì sao"), lưu
 * kịch bản vào localStorage qua ApprovalSimulationScenarioService. Port của
 * webapp/src/components/SimulationPanel.tsx (D17 Angular migration).
 */
@Component({
  selector: 'app-approval-simulation-panel',
  imports: [
    FormsModule,
    NzAlertModule,
    NzAvatarModule,
    NzButtonModule,
    NzCardModule,
    NzCheckboxModule,
    NzDatePickerModule,
    NzDividerModule,
    NzEmptyModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzTagModule,
    NzTooltipModule,
    NzTypographyModule,
  ],
  templateUrl: './approval-simulation-panel.html',
  styleUrl: './approval-simulation-panel.scss',
})
export class ApprovalSimulationPanelComponent {
  private readonly scenarioStore = inject(ApprovalSimulationScenarioService);
  private readonly matrix = inject(ApprovalMatrixService);
  private readonly message = inject(NzMessageService);

  readonly rules = input.required<ApprovalRule[]>();

  readonly activeSlots = APPROVAL_SLOTS.filter((s) => s.trangThai === 'active').map((s) => ({
    value: s.code,
    label: s.ten,
  }));
  readonly quickPresets = QUICK_PRESETS;
  readonly roleLabel = roleLabel;
  readonly modeLabel = MODE_LABEL;
  readonly initials = initials;
  readonly vnd = VND;

  readonly simSlot = signal<SlotCode>('PHE_DUYET');
  readonly simCtx = signal<Record<string, unknown>>(defaultSimulationContext('PHE_DUYET'));
  readonly result = signal<ResolveResult | null>(null);
  readonly prevResult = signal<ResolveResult | null>(null);

  readonly scenarios = signal<SavedApprovalScenario[]>(this.scenarioStore.load());
  readonly scenarioName = signal('');
  readonly scenariosExpanded = signal(false);
  readonly showAllEvaluated = signal(false);

  readonly simVars = computed<ApprovalVariableDef[]>(() => simulationVariables(this.simSlot()));

  readonly relevantEvaluated = computed<EvaluatedSplit | null>(() => {
    const r = this.result();
    if (!r || r.evaluatedRules.length === 0) return null;
    const relevant = r.evaluatedRules.filter(
      (e) => e.chosen || (e.matched && e.rule.enabled) || e.rule.id === r.matchedRule?.id,
    );
    const skipped = r.evaluatedRules.filter((e) => !relevant.includes(e));
    return { relevant, skipped, skippedCount: skipped.length };
  });

  readonly diff = computed<ResultDiff | null>(() => {
    const prev = this.prevResult();
    const curr = this.result();
    if (!prev || !curr) return null;
    const prevIds = new Set(prev.approvers.map((a) => a.user.id));
    const currIds = new Set(curr.approvers.map((a) => a.user.id));
    const added = curr.approvers.filter((a) => !prevIds.has(a.user.id));
    const removed = prev.approvers.filter((a) => !currIds.has(a.user.id));
    const changed = prev.matchedRule?.id !== curr.matchedRule?.id || prev.mode !== curr.mode;
    return { added, removed, changed };
  });

  readonly diffMessage = computed(() => {
    const d = this.diff();
    if (!d) return '';
    const parts: string[] = [];
    if (d.changed) parts.push('Luật thắng đã thay đổi.');
    if (d.added.length > 0) parts.push(`+${d.added.length} người mới`);
    if (d.removed.length > 0) parts.push(`-${d.removed.length} người cũ`);
    return parts.join(' ');
  });

  readonly hasDiff = computed(() => {
    const d = this.diff();
    return !!d && (d.changed || d.added.length > 0 || d.removed.length > 0);
  });

  runSim(): void {
    const ctx = this.simCtx();
    this.prevResult.set(this.result());
    this.matrix.resolve({
        slot: this.simSlot(),
        cap: ctx['capNhiemVu'] as 'CS' | 'TD' | undefined,
        loaiHoiDong: ctx['loaiHoiDong'] as string | undefined,
        tongDuToan: ctx['tongDuToan'] as number | undefined,
        vars: ctx,
      }).subscribe({
        next: (result) => this.result.set(result),
        error: (error) => this.message.error(error?.error?.message ?? 'Không mô phỏng được ma trận phê duyệt.'),
      });
  }

  handleSlotChange(slot: SlotCode): void {
    this.simSlot.set(slot);
    this.simCtx.set(defaultSimulationContext(slot));
    this.result.set(null);
    this.prevResult.set(null);
  }

  updateVar(key: string, value: unknown): void {
    this.simCtx.update((prev) => ({ ...prev, [key]: value }));
    this.result.set(null);
  }

  applyPreset(preset: QuickPreset): void {
    this.simCtx.update((prev) => preset.apply({ ...prev }));
    this.result.set(null);
  }

  saveScenario(): void {
    const name = this.scenarioName().trim() || `Kịch bản ${this.scenarios().length + 1}`;
    const scenario: SavedApprovalScenario = {
      id: `SC-${Date.now().toString(36)}`,
      name,
      slot: this.simSlot(),
      context: { ...this.simCtx() },
      savedAt: new Date().toISOString(),
      result: this.result(),
    };
    const next = [...this.scenarios(), scenario];
    this.scenarios.set(next);
    this.scenarioStore.save(next);
    this.scenarioName.set('');
  }

  loadScenario(s: SavedApprovalScenario): void {
    this.simSlot.set(s.slot);
    this.simCtx.set({ ...s.context });
    this.result.set(s.result ?? null);
    this.prevResult.set(null);
  }

  deleteScenario(id: string): void {
    const next = this.scenarios().filter((s) => s.id !== id);
    this.scenarios.set(next);
    this.scenarioStore.save(next);
  }

  copyScenarioContext(s: SavedApprovalScenario): void {
    navigator.clipboard.writeText(JSON.stringify(s.context, null, 2)).catch(() => {
      /* clipboard không khả dụng — bỏ qua */
    });
  }

  toggleShowAllEvaluated(): void {
    this.showAllEvaluated.update((v) => !v);
  }

  toggleScenariosExpanded(): void {
    this.scenariosExpanded.update((v) => !v);
  }

  // ── Value accessors theo kiểu biến (typed, tránh binding `unknown` thẳng vào template) ──
  boolVarValue(key: string): boolean {
    return !!this.simCtx()[key];
  }

  stringVarValue(key: string): string | null {
    const v = this.simCtx()[key];
    return v === undefined || v === null ? null : String(v);
  }

  numberVarValue(key: string): number | null {
    const v = this.simCtx()[key];
    return typeof v === 'number' ? v : null;
  }

  multiVarValue(key: string): string[] {
    const v = this.simCtx()[key];
    return Array.isArray(v) ? (v as string[]) : [];
  }

  dateVarValue(key: string): Date | null {
    const v = this.simCtx()[key];
    return typeof v === 'string' && v ? new Date(v) : null;
  }

  onDateVarChange(key: string, date: Date | null): void {
    this.updateVar(key, date ? date.toISOString().slice(0, 10) : null);
  }

  formatVnd(value: number): string {
    return VND.format(value);
  }

  parseVnd(value: string): number {
    return Number((value ?? '').replace(/\D/g, ''));
  }
}

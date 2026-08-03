import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { AuthService } from '../../../core/auth/auth.service';
import {
  anyCondition,
  describeConditionTree,
  leaf,
  type ConditionGroup,
  type ConditionNode,
} from '../../../core/models/approval-conditions';
import {
  APPROVAL_AUDIT_ACTION_COLOR,
  APPROVAL_AUDIT_ACTION_LABEL,
  LOAI_HOI_DONG_LABEL,
  MODE_LABEL,
  VND,
  describeTarget,
  groupAssignment,
  resolveApprovers,
  type ApprovalAssignment,
  type ApprovalRule,
  type ApprovalRuleAuditEntry,
  type ApprovalRuleVersion,
  type ResolveResult,
  type SlotCode,
} from '../../../core/models/approval-matrix';
import { analyzeRules, warningsByRule, type RuleWarning } from '../../../core/models/approval-matrix-analyzer';
import { usageForSlot, type ApprovalSlot } from '../../../core/models/approval-slot-catalog';
import { describeHelpers } from '../../../core/models/approval-variable-registry';
import { users } from '../../../core/models/org-users';
import { ApprovalMatrixService } from '../../../core/services/approval-matrix.service';
import { ApprovalSlotCatalogService } from '../../../core/services/approval-slot-catalog.service';
import { AssignmentBuilderComponent, type AssignmentTargetIssue } from '../../../shared/assignment-builder/assignment-builder';
import { ConditionBuilderComponent } from '../../../shared/condition-builder/condition-builder';
import { ApprovalSimulationPanelComponent } from '../../../shared/approval-simulation-panel/approval-simulation-panel';

interface RuleFormValues {
  ten: string;
  slot: SlotCode;
  priority: number;
  enabled: boolean;
}

const DEFAULT_RULE_FORM_VALUES: RuleFormValues = {
  ten: '',
  slot: 'THAM_DINH',
  priority: 50,
  enabled: true,
};

/** Preset điều kiện hay dùng — thêm nhanh 1 leaf vào cây điều kiện đang soạn. */
const CONDITION_PRESETS: { label: string; make: () => ConditionNode }[] = [
  { label: 'Cấp Tập đoàn', make: () => leaf('capNhiemVu', 'eq', 'TD') },
  { label: 'Cấp Cơ sở', make: () => leaf('capNhiemVu', 'eq', 'CS') },
  { label: 'Ngân sách ≥ 5 tỷ', make: () => leaf('tongDuToan', 'gte', 5_000_000_000) },
  { label: 'Hội đồng KHCN Tập đoàn', make: () => leaf('loaiHoiDong', 'eq', 'HD_KHCN_TD') },
];

/** Preset target theo role hay dùng nhất mỗi slot (đối chiếu seed AM-01…AM-07). */
const TARGET_PRESETS_BY_SLOT: Partial<Record<SlotCode, { label: string; roleCode: string }[]>> = {
  THAM_DINH: [
    { label: 'Chuyên quản KHCN (cơ sở)', roleCode: 'CQ_KHCN' },
    { label: 'Cơ quan KHCN Tập đoàn', roleCode: 'CQ_KHCN_TD' },
  ],
  HOI_DONG: [
    { label: 'Hội đồng KHCN VHT', roleCode: 'HDKHCN' },
    { label: 'Hội đồng KHCN Tập đoàn', roleCode: 'HDKHCN_TD' },
  ],
  PHE_DUYET: [
    { label: 'Tổng Giám đốc VHT', roleCode: 'TGD_VHT' },
    { label: 'Ban TGĐ Tập đoàn', roleCode: 'BTGD_TD' },
    { label: 'Cơ quan nghiệp vụ Tập đoàn', roleCode: 'CQNV_TD' },
  ],
};

function hasAssignmentTarget(assignment: ApprovalAssignment): boolean {
  return assignment.targets.some(
    (t) =>
      (t.type === 'GROUP' && t.roleCodes.length > 0) ||
      (t.type === 'USER' && t.userIds.length > 0) ||
      (t.type !== 'GROUP' && t.type !== 'USER'),
  );
}

function collectAssignmentTargetIssues(assignment: ApprovalAssignment): AssignmentTargetIssue[] {
  return assignment.targets.flatMap((target, index) => {
    if (target.type === 'GROUP' && target.roleCodes.length === 0) {
      return [{ index, message: 'Chọn ít nhất một nhóm phê duyệt.' }];
    }
    if (target.type === 'USER' && target.userIds.length === 0) {
      return [{ index, message: 'Chọn ít nhất một người cụ thể.' }];
    }
    return [];
  });
}

function isBlankValue(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function collectConditionValueIssues(node: ConditionNode, path = 'Điều kiện'): string[] {
  if (node.kind === 'group') {
    return node.items.flatMap((item, index) => collectConditionValueIssues(item, `${path} ${index + 1}`));
  }
  if (node.operator === 'exists' || node.operator === 'notExists') return [];
  if (node.operator === 'between') {
    const missing: string[] = [];
    if (isBlankValue(node.value)) missing.push(`${path}: thiếu giá trị từ`);
    if (isBlankValue(node.valueTo)) missing.push(`${path}: thiếu giá trị đến`);
    return missing;
  }
  return isBlankValue(node.value) ? [`${path}: thiếu giá trị so sánh`] : [];
}

interface HistoryRow extends ApprovalRuleVersion {
  isCurrent: boolean;
}

/**
 * Tab "Ma trận" — bảng luật ánh xạ (slot phê duyệt + điều kiện AND/OR) → người phê
 * duyệt cụ thể (first-match theo priority), Rule Builder (thêm/sửa/nhân bản/xoá),
 * Mô phỏng, lịch sử phiên bản/audit và Uỷ quyền theo hiệu lực. Port của
 * `MatrixTab()` trong webapp/src/pages/ApprovalMatrix.tsx (D17 Angular migration).
 * State đọc/ghi qua ApprovalMatrixService (signal store dùng chung).
 */
@Component({
  selector: 'app-approval-matrix-rules-tab',
  imports: [
    FormsModule,
    NzAlertModule,
    NzButtonModule,
    NzDividerModule,
    NzDrawerModule,
    NzEmptyModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzSwitchModule,
    NzTableModule,
    NzTagModule,
    NzTooltipModule,
    NzTypographyModule,
    AssignmentBuilderComponent,
    ConditionBuilderComponent,
    ApprovalSimulationPanelComponent,
  ],
  templateUrl: './approval-matrix-rules-tab.html',
  styleUrl: './approval-matrix-rules-tab.scss',
})
export class ApprovalMatrixRulesTabPage {
  private readonly matrix = inject(ApprovalMatrixService);
  private readonly slotCatalog = inject(ApprovalSlotCatalogService);
  private readonly auth = inject(AuthService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);

  readonly rules = this.matrix.rules;
  readonly delegations = this.matrix.delegations;
  readonly users = users;
  readonly modeLabel = MODE_LABEL;
  readonly loaiHoiDongLabel = LOAI_HOI_DONG_LABEL;
  readonly vnd = VND;
  readonly describeTarget = describeTarget;
  readonly conditionPresets = CONDITION_PRESETS;
  readonly auditActionLabel = APPROVAL_AUDIT_ACTION_LABEL;
  readonly auditActionColor = APPROVAL_AUDIT_ACTION_COLOR;

  readonly activeSlots = computed<ApprovalSlot[]>(() => this.slotCatalog.slots().filter((s) => s.trangThai === 'active'));

  // ── Filter ──────────────────────────────────────────────────────────────
  readonly filterSlot = signal<string>('all');
  readonly filterEnabled = signal<string>('all');

  readonly sortedRules = computed(() => [...this.rules()].sort((a, b) => a.priority - b.priority));
  readonly filteredRules = computed(() =>
    this.sortedRules().filter((r) => {
      if (this.filterSlot() !== 'all' && r.slot !== this.filterSlot()) return false;
      if (this.filterEnabled() === 'on' && !r.enabled) return false;
      if (this.filterEnabled() === 'off' && r.enabled) return false;
      return true;
    }),
  );

  readonly warnings = this.matrix.warnings;
  readonly warnByRule = computed(() => warningsByRule(this.warnings()));
  readonly slotWarnings = computed(() => this.warnings().filter((w) => !w.ruleId));
  readonly warningsHaveError = computed(() => this.warnings().some((w) => w.level === 'error'));
  readonly warningsErrorCount = computed(() => this.warnings().filter((w) => w.level === 'error').length);

  // ── Simulation Drawer ──────────────────────────────────────────────────
  readonly simDrawerOpen = signal(false);

  // ── History Drawer ─────────────────────────────────────────────────────
  readonly historyRuleId = signal<string | null>(null);
  readonly historyRows = computed<HistoryRow[]>(() => {
    const ruleId = this.historyRuleId();
    if (!ruleId) return [];
    const rule = this.rules().find((r) => r.id === ruleId);
    const versions = this.matrix.getVersions(ruleId);
    const currentSnap: HistoryRow | null = rule
      ? {
          id: `current-${rule.id}`,
          ruleId: rule.id,
          version: rule.version ?? 1,
          ten: rule.ten,
          slot: rule.slot,
          conditions: rule.conditions,
          assignment: rule.assignment,
          priority: rule.priority,
          enabled: rule.enabled,
          capNhat: this.today,
          nguoiCapNhat: this.actor(),
          changeNote: '(phiên bản hiện tại)',
          isCurrent: true,
        }
      : null;
    const rest: HistoryRow[] = versions
      .filter((v) => v.version !== (rule?.version ?? 1))
      .map((v) => ({ ...v, isCurrent: false }));
    const all = currentSnap ? [currentSnap, ...rest] : rest;
    return all.sort((a, b) => b.version - a.version);
  });
  readonly historyAudit = computed<ApprovalRuleAuditEntry[]>(() => {
    const ruleId = this.historyRuleId();
    return ruleId ? this.matrix.getAudit(ruleId) : [];
  });

  private readonly today = '2026-07-09';

  // ── Rule Builder (drawer) ──────────────────────────────────────────────
  readonly editing = signal<ApprovalRule | null>(null);
  readonly modalOpen = signal(false);
  readonly formTen = signal(DEFAULT_RULE_FORM_VALUES.ten);
  readonly formSlot = signal<SlotCode>(DEFAULT_RULE_FORM_VALUES.slot);
  readonly formPriority = signal(DEFAULT_RULE_FORM_VALUES.priority);
  readonly formEnabled = signal(DEFAULT_RULE_FORM_VALUES.enabled);
  readonly condDraft = signal<ConditionGroup>(anyCondition());
  readonly asgDraft = signal<ApprovalAssignment>(groupAssignment([]));

  readonly conditionValueIssues = computed(() => collectConditionValueIssues(this.condDraft()));
  readonly conditionPreview = computed(() => describeConditionTree(this.condDraft(), describeHelpers));
  readonly assignmentPreview = computed(
    () => this.asgDraft().targets.map(describeTarget).join('; ') || 'Chưa có đích phân công',
  );
  readonly assignmentHasTarget = computed(() => hasAssignmentTarget(this.asgDraft()));
  readonly assignmentTargetIssues = computed(() => collectAssignmentTargetIssues(this.asgDraft()));
  readonly assignmentHasGroupTarget = computed(() => this.asgDraft().targets.some((t) => t.type === 'GROUP'));
  readonly loaiHoiDongEntries = Object.entries(LOAI_HOI_DONG_LABEL).map(([key, value]) => ({ key, value }));

  readonly draftRule = computed<ApprovalRule>(() => ({
    id: this.editing()?.id ?? '__DRAFT_RULE__',
    ten: this.formTen().trim() || 'Luật chưa đặt tên',
    slot: this.formSlot(),
    conditions: this.condDraft(),
    assignment: this.asgDraft(),
    priority: this.formPriority(),
    enabled: this.formEnabled(),
    version: this.editing()?.version,
  }));

  readonly rulesWithDraft = computed<ApprovalRule[]>(() => {
    const editing = this.editing();
    const draft = this.draftRule();
    return editing ? this.rules().map((r) => (r.id === editing.id ? draft : r)) : [...this.rules(), draft];
  });

  readonly draftAnalysisWarnings = computed<RuleWarning[]>(() => {
    if (!this.modalOpen()) return [];
    const draft = this.draftRule();
    const slot = this.formSlot();
    return analyzeRules(this.rulesWithDraft()).filter((w) => w.ruleId === draft.id || (!w.ruleId && w.slot === slot));
  });

  readonly draftShadowedRules = computed<ApprovalRule[]>(() => {
    if (!this.formEnabled() || this.condDraft().items.length > 0) return [];
    const editingId = this.editing()?.id;
    const slot = this.formSlot();
    const priority = this.formPriority();
    return this.rules()
      .filter((r) => r.id !== editingId && r.enabled && r.slot === slot && r.priority > priority)
      .sort((a, b) => a.priority - b.priority);
  });

  readonly actionSummary = computed(() => {
    const name = this.formTen().trim() || 'Luật chưa đặt tên';
    if (!this.formEnabled()) {
      return `${name}: luật đang tắt nên runtime sẽ không tạo action từ cấu hình này.`;
    }
    if (!this.assignmentHasTarget()) {
      return `${name}: chưa có người/nhóm nhận action nên chưa thể tạo công việc phê duyệt.`;
    }
    const slotTen = this.slotCatalog.findByCode(this.formSlot())?.ten ?? this.formSlot();
    return `${name}: khi loại phê duyệt "${slotTen}" và điều kiện khớp, hệ thống sẽ hiện action cho ${this.assignmentPreview()} theo chế độ ${MODE_LABEL[this.asgDraft().mode]}.`;
  });

  readonly draftWarnings = computed<{ level: 'error' | 'warning' | 'info'; message: string }[]>(() => {
    if (!this.modalOpen()) return [];
    const out: { level: 'error' | 'warning' | 'info'; message: string }[] = [];
    const ruleName = this.formTen().trim();
    if (!ruleName) out.push({ level: 'info', message: 'Chưa nhập tên luật.' });
    if (this.condDraft().items.length === 0) {
      out.push({
        level: 'warning',
        message: 'Điều kiện đang để trống, rule sẽ khớp mọi hồ sơ trong slot đã chọn.',
      });
    }
    this.conditionValueIssues().forEach((issue) => out.push({ level: 'error', message: issue }));
    return out;
  });

  readonly previewWarnings = computed(() => [...this.draftWarnings(), ...this.draftAnalysisWarnings()]);
  readonly previewHasError = computed(() => this.previewWarnings().some((w) => w.level === 'error'));

  readonly targetPresets = computed(() => TARGET_PRESETS_BY_SLOT[this.formSlot()] ?? []);

  // ── Thử nhanh với hồ sơ mẫu ngay trong drawer (dùng rulesWithDraft, không cần lưu) ──
  readonly draftSimCap = signal<'CS' | 'TD'>('TD');
  readonly draftSimLoaiHD = signal<string>('HD_KHCN_TD');
  readonly draftSimBudget = signal<number>(12_000_000_000);
  readonly draftSimResult = signal<ResolveResult | null>(null);

  runDraftSim(): void {
    this.draftSimResult.set(
      resolveApprovers(this.rulesWithDraft(), {
        slot: this.formSlot(),
        cap: this.draftSimCap(),
        loaiHoiDong: this.draftSimLoaiHD(),
        tongDuToan: this.draftSimBudget(),
      }),
    );
  }

  addConditionPreset(make: () => ConditionNode): void {
    this.condDraft.update((prev) => ({ ...prev, items: [...prev.items, make()] }));
  }

  addTargetPreset(roleCode: string): void {
    this.asgDraft.update((prev) => ({ ...prev, targets: [...prev.targets, { type: 'GROUP', roleCodes: [roleCode] }] }));
  }

  formatVnd(value: number): string {
    return VND.format(value);
  }

  parseVnd(value: string): number {
    return Number((value ?? '').replace(/\D/g, ''));
  }

  private actor(): string {
    return this.auth.user()?.hoTen ?? 'Quản trị hệ thống';
  }

  private seedForm(values: RuleFormValues): void {
    this.formTen.set(values.ten);
    this.formSlot.set(values.slot);
    this.formPriority.set(values.priority);
    this.formEnabled.set(values.enabled);
  }

  openCreate(): void {
    this.editing.set(null);
    this.seedForm(DEFAULT_RULE_FORM_VALUES);
    this.condDraft.set(anyCondition());
    this.asgDraft.set(groupAssignment([]));
    this.draftSimResult.set(null);
    this.modalOpen.set(true);
  }

  openEdit(r: ApprovalRule): void {
    this.editing.set(r);
    this.seedForm({ ten: r.ten, slot: r.slot, priority: r.priority, enabled: r.enabled });
    this.condDraft.set(structuredClone(r.conditions));
    this.asgDraft.set(structuredClone(r.assignment));
    this.draftSimResult.set(null);
    this.modalOpen.set(true);
  }

  cloneRule(r: ApprovalRule): void {
    this.editing.set(null); // tạo mới, không ghi đè
    this.seedForm({ ten: `${r.ten} (bản sao)`, slot: r.slot, priority: r.priority, enabled: true });
    this.condDraft.set(structuredClone(r.conditions));
    this.asgDraft.set(structuredClone(r.assignment));
    this.draftSimResult.set(null);
    this.modalOpen.set(true);
  }

  saveRule(): void {
    if (!this.formTen().trim()) {
      this.message.error('Nhập tên luật.');
      return;
    }
    if (this.conditionValueIssues().length > 0) {
      this.message.error('Cần nhập đủ giá trị cho các điều kiện trước khi lưu.');
      return;
    }
    if (!this.assignmentHasTarget()) {
      this.message.error('Cần ít nhất một đích phân công (nhóm hoặc người).');
      return;
    }
    const editing = this.editing();
    const next: ApprovalRule = {
      id: editing?.id ?? `AM-${Date.now().toString().slice(-5)}`,
      ten: this.formTen().trim(),
      slot: this.formSlot(),
      conditions: this.condDraft(),
      assignment: this.asgDraft(),
      priority: this.formPriority(),
      enabled: this.formEnabled(),
      version: editing?.version,
    };
    const request = editing
      ? this.matrix.updateRule(next, this.actor())
      : this.matrix.createRule(next, this.actor());
    request.subscribe({
      next: () => {
        this.modalOpen.set(false);
        this.message.success(editing ? 'Đã cập nhật luật.' : 'Đã thêm luật mới.');
        this.refreshAnalysis();
      },
      error: (error) => this.message.error(error?.error?.message ?? 'Không lưu được luật phê duyệt.'),
    });
  }

  confirmRemoveRule(r: ApprovalRule): void {
    this.modal.confirm({
      nzTitle: 'Xoá luật này?',
      nzContent: r.ten,
      nzOkText: 'Xoá',
      nzOkDanger: true,
      nzCancelText: 'Huỷ',
      nzOnOk: () => new Promise<void>((resolve, reject) => {
        this.matrix.removeRule(r, this.actor()).subscribe({
          next: () => {
            this.message.success('Đã xoá luật.');
            this.refreshAnalysis();
            resolve();
          },
          error: (error) => {
            this.message.error(error?.error?.message ?? 'Không xoá được luật.');
            reject(error);
          },
        });
      }),
    });
  }

  toggle(id: string, enabled: boolean): void {
    const rule = this.rules().find((item) => item.id === id);
    if (!rule) return;
    this.matrix.toggleRule(rule, enabled, this.actor()).subscribe({
      next: () => this.refreshAnalysis(),
      error: (error) => this.message.error(error?.error?.message ?? 'Không đổi được trạng thái luật.'),
    });
  }

  openHistory(id: string): void {
    this.historyRuleId.set(id);
    this.matrix.loadHistory(id).subscribe({
      error: (error) => this.message.error(error?.error?.message ?? 'Không tải được lịch sử luật.'),
    });
  }

  private refreshAnalysis(): void {
    this.matrix.analyze().subscribe({
      error: (error) => this.message.error(error?.error?.message ?? 'Không phân tích được ma trận luật.'),
    });
  }

  conditionSummary(r: ApprovalRule): string {
    return r.conditions.items.length === 0 ? 'Mọi hồ sơ' : describeConditionTree(r.conditions, describeHelpers);
  }

  isWildcard(r: ApprovalRule): boolean {
    return r.conditions.items.length === 0;
  }

  slotLabel(code: string): string {
    return this.slotCatalog.findByCode(code)?.ten ?? code;
  }

  warningsFor(ruleId: string): RuleWarning[] {
    return this.warnByRule().get(ruleId) ?? [];
  }

  hasErrorWarning(ruleId: string): boolean {
    return this.warningsFor(ruleId).some((w) => w.level === 'error');
  }

  visibleTargets(r: ApprovalRule) {
    return r.assignment.targets.slice(0, 2);
  }

  overflowCount(r: ApprovalRule): number {
    return r.assignment.targets.length - 2;
  }

  overflowTargets(r: ApprovalRule) {
    return r.assignment.targets.slice(2);
  }

  userNameById(id: string): string {
    return users.find((u) => u.id === id)?.hoTen ?? id;
  }

  rowSlotChangedFrom(index: number): boolean {
    if (index === 0) return false;
    const rows = this.filteredRules();
    return rows[index].slot !== rows[index - 1]?.slot;
  }
}

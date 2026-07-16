import { Injectable, signal } from '@angular/core';

import {
  APPROVAL_MATRIX,
  DELEGATIONS,
  SEED_APPROVAL_AUDIT,
  SEED_APPROVAL_VERSIONS,
  type ApprovalRule,
  type ApprovalRuleAuditAction,
  type ApprovalRuleAuditEntry,
  type ApprovalRuleVersion,
  type Delegation,
} from '../models/approval-matrix';

const TODAY = '2026-07-09';

function makeAuditId(): string {
  return `ama-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
function makeVersionId(): string {
  return `amv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Nguồn duy nhất cho rules + delegations của Ma trận phê duyệt. Port của
 * webapp/src/store/ApprovalMatrixContext.tsx (D17 Angular migration) — signal-based
 * thay React Context, seed đồng bộ trong constructor (không backend, giống bản gốc).
 * `providedIn: 'root'` để một trang runtime hồ sơ tương lai (chưa có trong Angular)
 * có thể đọc/sửa CHUNG một tập luật, giống ý đồ của store React.
 */
@Injectable({ providedIn: 'root' })
export class ApprovalMatrixService {
  private readonly rulesSignal = signal<ApprovalRule[]>(APPROVAL_MATRIX);
  private readonly delegationsSignal = signal<Delegation[]>(DELEGATIONS);
  private readonly versionsSignal = signal<ApprovalRuleVersion[]>(SEED_APPROVAL_VERSIONS);
  private readonly auditEntriesSignal = signal<ApprovalRuleAuditEntry[]>(SEED_APPROVAL_AUDIT);

  readonly rules = this.rulesSignal.asReadonly();
  readonly delegations = this.delegationsSignal.asReadonly();

  getVersions(ruleId: string): ApprovalRuleVersion[] {
    return this.versionsSignal()
      .filter((v) => v.ruleId === ruleId)
      .sort((a, b) => b.version - a.version);
  }

  getAudit(ruleId: string): ApprovalRuleAuditEntry[] {
    return this.auditEntriesSignal()
      .filter((a) => a.ruleId === ruleId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  /** Thêm mới hoặc cập nhật (theo id) một luật. */
  upsertRule(rule: ApprovalRule, actor?: string): void {
    const exists = this.rulesSignal().some((r) => r.id === rule.id);
    if (exists) {
      const old = this.rulesSignal().find((r) => r.id === rule.id)!;
      if (old.version && old.version > 0) {
        const snap: ApprovalRuleVersion = {
          id: makeVersionId(),
          ruleId: old.id,
          version: old.version,
          ten: old.ten,
          slot: old.slot,
          conditions: structuredClone(old.conditions),
          assignment: structuredClone(old.assignment),
          priority: old.priority,
          enabled: old.enabled,
          capNhat: TODAY,
          nguoiCapNhat: actor ?? 'Hệ thống',
          changeNote: `Cập nhật lên phiên bản v${rule.version ?? (old.version ?? 0) + 1}.`,
        };
        this.versionsSignal.update((prev) => [snap, ...prev]);
      }
      this.logAudit(rule.id, 'UPDATE', rule.version ?? 1, actor ?? 'Hệ thống', `Cập nhật luật "${rule.ten}".`);
      this.rulesSignal.update((prev) => prev.map((r) => (r.id === rule.id ? rule : r)));
    } else {
      this.logAudit(rule.id, 'CREATE', rule.version ?? 1, actor ?? 'Hệ thống', `Tạo luật "${rule.ten}".`);
      this.rulesSignal.update((prev) => [...prev, rule]);
    }
  }

  removeRule(id: string, actor?: string): void {
    const target = this.rulesSignal().find((r) => r.id === id);
    if (target) {
      this.logAudit(id, 'DELETE', target.version ?? 1, actor ?? 'Hệ thống', `Xoá luật "${target.ten}".`);
    }
    this.rulesSignal.update((prev) => prev.filter((r) => r.id !== id));
  }

  toggleRule(id: string, enabled: boolean, actor?: string): void {
    this.rulesSignal.update((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        this.logAudit(id, 'TOGGLE', r.version ?? 1, actor ?? 'Hệ thống', `Chuyển trạng thái: ${enabled ? 'Bật' : 'Tắt'}.`);
        return { ...r, enabled };
      }),
    );
  }

  private logAudit(
    ruleId: string,
    action: ApprovalRuleAuditAction,
    version: number,
    actor: string,
    detail: string,
  ): void {
    this.auditEntriesSignal.update((prev) => [
      {
        id: makeAuditId(),
        ruleId,
        action,
        version,
        actor,
        timestamp: `${TODAY} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
        detail,
      },
      ...prev,
    ]);
  }
}

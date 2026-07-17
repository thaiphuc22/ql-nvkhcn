import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, forkJoin, map, tap } from 'rxjs';

import { API_BASE_URL, encodeAuditActor } from '../api-config';
import type { ConditionGroup } from '../models/approval-conditions';
import {
  DELEGATIONS,
  type ApprovalAssignment,
  type ApprovalMode,
  type ApprovalResolveAudit,
  type ApprovalRule,
  type ApprovalRuleAuditAction,
  type ApprovalRuleAuditEntry,
  type ApprovalRuleVersion,
  type ResolveContext,
  type ResolveResult,
  type ResolvedApprover,
} from '../models/approval-matrix';
import type { RuleWarning, WarningLevel } from '../models/approval-matrix-analyzer';
import { users, type AppUser } from '../models/org-users';

const BASE_URL = `${API_BASE_URL}/api/approval-matrix`;

interface ApprovalRuleResponse {
  id: string;
  domainCode: string;
  ten: string;
  slot: string;
  conditions: ConditionGroup;
  assignment: ApprovalAssignment;
  priority: number;
  enabled: boolean;
  version: number;
  updatedAt: string;
  updatedBy: string;
}

interface ApprovalRuleVersionResponse {
  id: string;
  ruleId: string;
  version: number;
  snapshot: ApprovalRuleResponse;
  changeNote: string;
  createdBy: string;
  createdAt: string;
}

interface ApprovalRuleAuditResponse {
  id: string;
  ruleId: string;
  action: ApprovalRuleAuditAction;
  version: number;
  actor: string;
  timestamp: string;
  detail: string;
}

interface ResolveApprovalResponse {
  matchedRuleId: string | null;
  mode: ApprovalMode | null;
  approvers: {
    userId: string;
    viaRoleCode?: string;
    viaTargetType?: ResolvedApprover['viaTargetType'];
    placeholder: boolean;
    delegatedFromUserId?: string;
    delegationLyDo?: string;
  }[];
  reason: string;
  warnings: string[];
  audit: ApprovalResolveAudit;
}

interface ApprovalRuleWarningResponse {
  level: WarningLevel;
  ruleId?: string;
  slot?: string;
  message: string;
}

function actorOptions(actor?: string): { headers: Record<string, string> } | undefined {
  return actor ? { headers: { 'X-QTKHCN-Actor': encodeAuditActor(actor) } } : undefined;
}

function toRule(response: ApprovalRuleResponse): ApprovalRule {
  return {
    id: response.id,
    ten: response.ten,
    slot: response.slot,
    conditions: response.conditions,
    assignment: response.assignment,
    priority: response.priority,
    enabled: response.enabled,
    version: response.version,
  };
}

function fallbackUser(id: string): AppUser {
  return {
    id,
    hoTen: id,
    email: '',
    donVi: '',
    vaiTro: [],
    chucDanh: 'Chưa có dữ liệu danh mục người dùng',
    trangThai: 'active',
  };
}

/** HTTP-backed store cho `/api/approval-matrix`; signal chỉ là cache dùng chung giữa các tab. */
@Injectable({ providedIn: 'root' })
export class ApprovalMatrixService {
  private readonly http = inject(HttpClient);
  private readonly rulesSignal = signal<ApprovalRule[]>([]);
  private readonly versionsSignal = signal<Record<string, ApprovalRuleVersion[]>>({});
  private readonly auditEntriesSignal = signal<Record<string, ApprovalRuleAuditEntry[]>>({});
  private readonly warningsSignal = signal<RuleWarning[]>([]);

  readonly rules = this.rulesSignal.asReadonly();
  readonly delegations = signal(DELEGATIONS).asReadonly();
  readonly warnings = this.warningsSignal.asReadonly();

  load(): Observable<ApprovalRule[]> {
    return this.http.get<ApprovalRuleResponse[]>(`${BASE_URL}/rules`).pipe(
      map((responses) => responses.map(toRule)),
      tap((rules) => this.rulesSignal.set(rules)),
    );
  }

  createRule(rule: ApprovalRule, actor?: string): Observable<ApprovalRule> {
    return this.http.post<ApprovalRuleResponse>(
      `${BASE_URL}/rules`,
      {
        id: rule.id,
        domainCode: 'KHCN',
        ten: rule.ten,
        slot: rule.slot,
        conditions: rule.conditions,
        assignment: rule.assignment,
        priority: rule.priority,
        enabled: rule.enabled,
        changeNote: 'Tạo từ màn Ma trận phê duyệt.',
      },
      actorOptions(actor),
    ).pipe(map(toRule), tap((saved) => this.upsertCache(saved)));
  }

  updateRule(rule: ApprovalRule, actor?: string): Observable<ApprovalRule> {
    const expectedVersion = rule.version ?? 1;
    return this.http.put<ApprovalRuleResponse>(
      `${BASE_URL}/rules/${encodeURIComponent(rule.id)}`,
      {
        ten: rule.ten,
        slot: rule.slot,
        conditions: rule.conditions,
        assignment: rule.assignment,
        priority: rule.priority,
        enabled: rule.enabled,
        changeNote: 'Cập nhật từ màn Ma trận phê duyệt.',
      },
      { headers: { 'If-Match': String(expectedVersion), ...(actorOptions(actor)?.headers ?? {}) } },
    ).pipe(map(toRule), tap((saved) => this.upsertCache(saved)));
  }

  removeRule(rule: ApprovalRule, actor?: string): Observable<void> {
    return this.http.delete<void>(`${BASE_URL}/rules/${encodeURIComponent(rule.id)}`, {
      headers: { 'If-Match': String(rule.version ?? 1), ...(actorOptions(actor)?.headers ?? {}) },
    }).pipe(tap(() => this.rulesSignal.update((rules) => rules.filter((item) => item.id !== rule.id))));
  }

  toggleRule(rule: ApprovalRule, enabled: boolean, actor?: string): Observable<ApprovalRule> {
    return this.http.post<ApprovalRuleResponse>(
      `${BASE_URL}/rules/${encodeURIComponent(rule.id)}/status`,
      { status: enabled ? 'active' : 'inactive', expectedVersion: rule.version ?? 1 },
      actorOptions(actor),
    ).pipe(map(toRule), tap((saved) => this.upsertCache(saved)));
  }

  analyze(): Observable<RuleWarning[]> {
    return this.http.post<ApprovalRuleWarningResponse[]>(`${BASE_URL}/analyze`, {}).pipe(
      map((warnings) => warnings.map((warning) => ({ ...warning }))),
      tap((warnings) => this.warningsSignal.set(warnings)),
    );
  }

  resolve(ctx: ResolveContext): Observable<ResolveResult> {
    const context = {
      capNhiemVu: ctx.cap,
      loaiHoiDong: ctx.loaiHoiDong,
      tongDuToan: ctx.tongDuToan,
      ...(ctx.vars ?? {}),
    };
    Object.keys(context).forEach((key) => context[key as keyof typeof context] === undefined && delete context[key as keyof typeof context]);
    return this.http.post<ResolveApprovalResponse>(`${BASE_URL}/resolve`, {
      slot: ctx.slot,
      ngay: ctx.ngay,
      context,
    }).pipe(map((response) => this.toResolveResult(response, ctx.slot)));
  }

  loadHistory(ruleId: string): Observable<[ApprovalRuleVersion[], ApprovalRuleAuditEntry[]]> {
    const encoded = encodeURIComponent(ruleId);
    return forkJoin([
      this.http.get<ApprovalRuleVersionResponse[]>(`${BASE_URL}/rules/${encoded}/versions`).pipe(
        map((items) => items.map((item) => this.toVersion(item))),
        tap((items) => this.versionsSignal.update((cache) => ({ ...cache, [ruleId]: items }))),
      ),
      this.http.get<ApprovalRuleAuditResponse[]>(`${BASE_URL}/rules/${encoded}/audit`).pipe(
        map((items) => items.map((item) => ({ ...item }))),
        tap((items) => this.auditEntriesSignal.update((cache) => ({ ...cache, [ruleId]: items }))),
      ),
    ]);
  }

  getVersions(ruleId: string): ApprovalRuleVersion[] {
    return this.versionsSignal()[ruleId] ?? [];
  }

  getAudit(ruleId: string): ApprovalRuleAuditEntry[] {
    return this.auditEntriesSignal()[ruleId] ?? [];
  }

  private upsertCache(rule: ApprovalRule): void {
    this.rulesSignal.update((rules) => {
      const index = rules.findIndex((item) => item.id === rule.id);
      if (index < 0) return [...rules, rule];
      const next = [...rules];
      next[index] = rule;
      return next;
    });
  }

  private toVersion(response: ApprovalRuleVersionResponse): ApprovalRuleVersion {
    const snapshot = response.snapshot;
    return {
      id: response.id,
      ruleId: response.ruleId,
      version: response.version,
      ten: snapshot.ten,
      slot: snapshot.slot,
      conditions: snapshot.conditions,
      assignment: snapshot.assignment,
      priority: snapshot.priority,
      enabled: snapshot.enabled,
      capNhat: response.createdAt,
      nguoiCapNhat: response.createdBy,
      changeNote: response.changeNote,
    };
  }

  private toResolveResult(response: ResolveApprovalResponse, slot: string): ResolveResult {
    const matchedRule = response.matchedRuleId
      ? this.rulesSignal().find((rule) => rule.id === response.matchedRuleId) ?? null
      : null;
    const approvers = response.approvers.map((item): ResolvedApprover => ({
      user: users.find((user) => user.id === item.userId) ?? fallbackUser(item.userId),
      viaRoleCode: item.viaRoleCode,
      viaTargetType: item.viaTargetType,
      placeholder: item.placeholder,
      delegatedFrom: item.delegatedFromUserId
        ? users.find((user) => user.id === item.delegatedFromUserId) ?? fallbackUser(item.delegatedFromUserId)
        : undefined,
      delegationLyDo: item.delegationLyDo,
    }));
    const skipped = new Map(response.audit.skipped.map((item) => [item.ruleId, item.reason]));
    const evaluatedRules = this.rulesSignal()
      .filter((rule) => rule.slot === slot)
      .map((rule) => {
        const chosen = rule.id === response.matchedRuleId;
        const note = chosen ? response.reason : skipped.get(rule.id) ?? 'Không được backend đánh giá.';
        return {
          rule,
          chosen,
          matched: chosen || note.includes('ưu tiên thấp hơn'),
          note,
        };
      });
    return { matchedRule, approvers, mode: response.mode, reason: response.reason, warnings: response.warnings, evaluatedRules, audit: response.audit };
  }
}

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, of, switchMap, tap } from 'rxjs';

import { API_BASE_URL, encodeAuditActor } from '../api-config';
import { decisionTableToDmnXml, dmnXmlToDecisionTable } from '../dmn/dmn-xml';
import {
  BusinessRule,
  BusinessRuleCategory,
  BusinessRuleStatus,
  BusinessRuleVersion,
  CreateBusinessRuleInput,
  DecisionTableDefinition,
  DmnRuleDetailResponse,
  DmnRuleSummaryResponse,
  DmnRuleVersionResponse,
  DmnRuleVersionSummaryResponse,
  DmnDecisionEvaluationResponse,
} from '../models/business-rule';

function actorOptions(actor?: string): { headers: Record<string, string> } | undefined {
  return actor ? { headers: { 'X-QTKHCN-Actor': encodeAuditActor(actor) } } : undefined;
}

function toVersion(summary: DmnRuleVersionSummaryResponse): BusinessRuleVersion {
  return {
    id: summary.id,
    version: summary.version,
    savedAt: summary.createdAt,
    savedBy: summary.createdBy,
    note: summary.changeNote,
    checksumSha256: summary.checksumSha256,
    deployStatus: summary.deployStatus,
    camundaDeploymentKey: summary.camundaDeploymentKey,
    camundaDecisionKey: summary.camundaDecisionKey,
    camundaDecisionId: summary.camundaDecisionId,
    camundaDecisionVersion: summary.camundaDecisionVersion,
    deployedAt: summary.deployedAt,
    deployError: summary.deployError,
  };
}

function toRule(
  summary: DmnRuleSummaryResponse,
  versions: DmnRuleVersionSummaryResponse[] = [],
): BusinessRule {
  return {
    id: summary.id,
    code: summary.code,
    name: summary.name,
    description: summary.description,
    category: summary.category,
    kind: 'DMN',
    appliedProcesses: [...summary.appliedProcesses],
    status: summary.status,
    version: summary.latestVersion,
    activeVersion: summary.activeVersion,
    updatedAt: summary.updatedAt,
    updatedBy: summary.updatedBy,
    versions: versions.map(toVersion),
  };
}

@Injectable({ providedIn: 'root' })
export class BusinessRuleService {
  private readonly http = inject(HttpClient);
  private readonly rulesSignal = signal<BusinessRule[]>([]);
  readonly rules = this.rulesSignal.asReadonly();

  list(filters?: {
    status?: BusinessRuleStatus | null;
    category?: BusinessRuleCategory | null;
    q?: string;
  }): Observable<BusinessRule[]> {
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.q?.trim()) params = params.set('q', filters.q.trim());
    return this.http
      .get<DmnRuleSummaryResponse[]>(`${API_BASE_URL}/api/dmn-rules`, { params })
      .pipe(
        map((items) => items.map((item) => toRule(item))),
        tap((items) => this.rulesSignal.set(items)),
      );
  }

  get(id: string): Observable<BusinessRule> {
    return this.http.get<DmnRuleDetailResponse>(`${API_BASE_URL}/api/dmn-rules/${id}`).pipe(
      switchMap((detail) => {
        if (detail.rule.latestVersion === 0) return of(toRule(detail.rule, detail.versions));
        return this.getVersionArtifact(id, detail.rule.latestVersion).pipe(
          map((artifact) => {
            const rule = toRule(detail.rule, detail.versions);
            rule.definition = artifact.definition;
            rule.versions = rule.versions?.map((version) =>
              version.version === artifact.version ? artifact : version,
            );
            return rule;
          }),
        );
      }),
      tap((rule) => this.upsert(rule)),
    );
  }

  create(input: CreateBusinessRuleInput): Observable<BusinessRule> {
    const payload = {
      code: this.makeCode(input.name),
      name: input.name,
      description: input.description,
      category: input.category,
      appliedProcesses: input.appliedProcesses,
    };
    return this.http
      .post<DmnRuleDetailResponse>(
        `${API_BASE_URL}/api/dmn-rules`,
        payload,
        actorOptions(input.actor),
      )
      .pipe(
        map((detail) => toRule(detail.rule, detail.versions)),
        tap((rule) => this.upsert(rule)),
      );
  }

  saveVersion(
    id: string,
    definition: DecisionTableDefinition,
    note: string,
    actor: string,
    expectedVersion: number,
  ): Observable<BusinessRule> {
    const dmnXml = decisionTableToDmnXml(definition, { definitionsId: `definitions_${id}` });
    return this.http
      .post<DmnRuleVersionResponse>(
        `${API_BASE_URL}/api/dmn-rules/${id}/versions`,
        {
          expectedVersion,
          dmnXml,
          changeNote: note.trim() || `Lưu phiên bản v${expectedVersion + 1}`,
        },
        actorOptions(actor),
      )
      .pipe(switchMap(() => this.get(id)));
  }

  getVersionArtifact(id: string, version: number): Observable<BusinessRuleVersion> {
    return this.http
      .get<DmnRuleVersionResponse>(`${API_BASE_URL}/api/dmn-rules/${id}/versions/${version}`)
      .pipe(
        map((artifact) => ({
          ...toVersion(artifact),
          dmnXml: artifact.dmnXml,
          definition: dmnXmlToDecisionTable(artifact.dmnXml),
        })),
      );
  }

  activate(
    id: string,
    version: number,
    expectedVersion: number,
    actor: string,
  ): Observable<BusinessRule> {
    return this.http
      .post<DmnRuleDetailResponse>(
        `${API_BASE_URL}/api/dmn-rules/${id}/versions/${version}/activate`,
        { expectedVersion },
        actorOptions(actor),
      )
      .pipe(
        map((detail) => toRule(detail.rule, detail.versions)),
        tap((rule) => this.upsert(rule)),
      );
  }

  disable(id: string, expectedVersion: number, actor: string): Observable<BusinessRule> {
    return this.http
      .post<DmnRuleDetailResponse>(
        `${API_BASE_URL}/api/dmn-rules/${id}/disable`,
        { expectedVersion },
        actorOptions(actor),
      )
      .pipe(
        map((detail) => toRule(detail.rule, detail.versions)),
        tap((rule) => this.upsert(rule)),
      );
  }

  evaluate(id: string, variables: Record<string, unknown>): Observable<DmnDecisionEvaluationResponse> {
    return this.http.post<DmnDecisionEvaluationResponse>(
      `${API_BASE_URL}/api/dmn-rules/${id}/evaluate`,
      { variables },
    );
  }

  private upsert(rule: BusinessRule): void {
    this.rulesSignal.update((rules) => {
      const existing = rules.findIndex((candidate) => candidate.id === rule.id);
      if (existing < 0) return [rule, ...rules];
      const updated = [...rules];
      updated[existing] = rule;
      return updated;
    });
  }

  private makeCode(name: string): string {
    const slug = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/gi, 'd')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .split('-')
      .slice(0, 3)
      .join('-');
    return `BR-${slug || 'RULE'}`;
  }
}

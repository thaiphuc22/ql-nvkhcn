import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL, encodeAuditActor } from '../api-config';
import {
  ActionAvailabilityPolicy, ActionDefinition, ActionPresentation, ExceptionPolicy,
  ProcessRouting, SimulatedAction, SimulationContext,
} from '../models/action-studio';

const BASE_URL = `${API_BASE_URL}/api/action-studio`;

interface ConfigResponse {
  definitions: ActionDefinition[];
  presentations: ActionPresentation[];
  availabilityPolicies: ActionAvailabilityPolicy[];
  exceptionPolicies: ExceptionPolicy[];
  processes: ProcessRouting[];
}

interface ScaffoldResponse {
  createdCount: number;
  createdPolicies: ActionAvailabilityPolicy[];
  rows: ReconcileRow[];
}

export interface ReconcileRow {
  processCode: string;
  stepKey: string;
  stepName: string;
  outcome: string;
  actionCode: string;
  status: 'ok' | 'generic' | 'unfilled' | 'missing';
  policyId: string | null;
  reason: string;
}

function actorHeaders(actor?: string): Record<string, string> {
  return actor ? { 'X-QTKHCN-Actor': encodeAuditActor(actor) } : {};
}

@Injectable({ providedIn: 'root' })
export class ActionStudioService {
  private readonly http = inject(HttpClient);
  private readonly definitionsSignal = signal<ActionDefinition[]>([]);
  private readonly presentationsSignal = signal<ActionPresentation[]>([]);
  private readonly availabilitySignal = signal<ActionAvailabilityPolicy[]>([]);
  private readonly exceptionSignal = signal<ExceptionPolicy[]>([]);
  private readonly processesSignal = signal<ProcessRouting[]>([]);

  readonly definitions = this.definitionsSignal.asReadonly();
  readonly presentations = this.presentationsSignal.asReadonly();
  readonly availabilityPolicies = this.availabilitySignal.asReadonly();
  readonly exceptionPolicies = this.exceptionSignal.asReadonly();
  readonly processes = this.processesSignal.asReadonly();

  readonly stats = computed(() => ({
    actions: this.definitions().length,
    activeActions: this.definitions().filter((item) => item.active).length,
    policies: this.availabilityPolicies().length,
    enabledPolicies: this.availabilityPolicies().filter((item) => item.enabled).length,
    exceptions: this.exceptionPolicies().filter((item) => item.enabled).length,
  }));

  load(): Observable<ConfigResponse> {
    return this.http.get<ConfigResponse>(BASE_URL).pipe(tap((config) => {
      this.definitionsSignal.set(config.definitions);
      this.presentationsSignal.set(config.presentations);
      this.availabilitySignal.set(config.availabilityPolicies);
      this.exceptionSignal.set(config.exceptionPolicies);
      this.processesSignal.set(config.processes);
    }));
  }

  savePresentation(value: ActionPresentation, actor?: string): Observable<ActionPresentation> {
    return this.http.put<ActionPresentation>(
      `${BASE_URL}/actions/${encodeURIComponent(value.actionCode)}/presentation`,
      { label: value.label, icon: value.icon, uiGroup: value.uiGroup, tone: value.tone, order: value.order, helpText: value.helpText ?? null },
      { headers: { 'If-Match': String(value.version ?? 0), ...actorHeaders(actor) } },
    ).pipe(tap((saved) => {
      this.presentationsSignal.update((items) => items.map((item) => item.actionCode === saved.actionCode ? saved : item));
      this.definitionsSignal.update((items) => items.map((item) => item.actionCode === saved.actionCode ? { ...item, version: saved.version } : item));
    }));
  }

  toggleAction(item: ActionDefinition, active: boolean, actor?: string): Observable<ActionDefinition> {
    return this.http.post<ActionDefinition>(
      `${BASE_URL}/actions/${encodeURIComponent(item.actionCode)}/status`, { enabled: active },
      { headers: { 'If-Match': String(item.version ?? 0), ...actorHeaders(actor) } },
    ).pipe(tap((saved) => {
      this.definitionsSignal.update((items) => items.map((value) => value.actionCode === saved.actionCode ? saved : value));
      this.presentationsSignal.update((items) => items.map((value) => value.actionCode === saved.actionCode ? { ...value, version: saved.version } : value));
    }));
  }

  saveAvailability(value: ActionAvailabilityPolicy, actor?: string): Observable<ActionAvailabilityPolicy> {
    const encoded = encodeURIComponent(value.id);
    const request = value.version == null
      ? this.http.post<ActionAvailabilityPolicy>(`${BASE_URL}/availability-policies`, value, { headers: actorHeaders(actor) })
      : this.http.put<ActionAvailabilityPolicy>(`${BASE_URL}/availability-policies/${encoded}`, value,
          { headers: { 'If-Match': String(value.version), ...actorHeaders(actor) } });
    return request.pipe(tap((saved) => this.upsertAvailability(saved)));
  }

  removeAvailability(value: ActionAvailabilityPolicy, actor?: string): Observable<void> {
    return this.http.delete<void>(`${BASE_URL}/availability-policies/${encodeURIComponent(value.id)}`,
      { headers: { 'If-Match': String(value.version ?? 0), ...actorHeaders(actor) } })
      .pipe(tap(() => this.availabilitySignal.update((items) => items.filter((item) => item.id !== value.id))));
  }

  saveException(value: ExceptionPolicy, actor?: string): Observable<ExceptionPolicy> {
    const encoded = encodeURIComponent(value.id);
    const request = value.version == null
      ? this.http.post<ExceptionPolicy>(`${BASE_URL}/exception-policies`, value, { headers: actorHeaders(actor) })
      : this.http.put<ExceptionPolicy>(`${BASE_URL}/exception-policies/${encoded}`, value,
          { headers: { 'If-Match': String(value.version), ...actorHeaders(actor) } });
    return request.pipe(tap((saved) => this.upsertException(saved)));
  }

  simulate(context: SimulationContext): Observable<SimulatedAction[]> {
    return this.http.post<SimulatedAction[]>(`${BASE_URL}/simulate`, context);
  }

  reconcile(processCode: string): Observable<ReconcileRow[]> {
    return this.http.get<ReconcileRow[]>(`${BASE_URL}/reconcile`, { params: { processCode } });
  }

  scaffold(processCode: string, actor?: string): Observable<ScaffoldResponse> {
    return this.http.post<ScaffoldResponse>(`${BASE_URL}/reconcile/${encodeURIComponent(processCode)}/scaffold`, {},
      { headers: actorHeaders(actor) }).pipe(tap((response) => {
        for (const item of response.createdPolicies) this.upsertAvailability(item);
      }));
  }

  private upsertAvailability(saved: ActionAvailabilityPolicy): void {
    this.availabilitySignal.update((items) => items.some((item) => item.id === saved.id)
      ? items.map((item) => item.id === saved.id ? saved : item) : [...items, saved]);
  }

  private upsertException(saved: ExceptionPolicy): void {
    this.exceptionSignal.update((items) => items.some((item) => item.id === saved.id)
      ? items.map((item) => item.id === saved.id ? saved : item) : [...items, saved]);
  }
}

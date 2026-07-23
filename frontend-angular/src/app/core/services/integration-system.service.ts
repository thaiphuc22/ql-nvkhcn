import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { API_BASE_URL, encodeAuditActor } from '../api-config';
import type { ConnectSystemRequest, IntegrationSystem, JobRun } from '../models/integration-system';

// HTTP-backed store cho `/api/integration-systems` — thay phần state cục bộ
// (`useState<IntegrationSystem[]>`) của webapp/src/pages/IntegrationStatus.tsx.
// Signal chỉ là cache sau khi backend (Spring Boot + PostgreSQL) xác nhận.

const BASE_URL = `${API_BASE_URL}/api/integration-systems`;

function actorHeaders(actor?: string, ifMatch?: number): Record<string, string> {
  const headers: Record<string, string> = {};
  if (actor) headers['X-QTKHCN-Actor'] = encodeAuditActor(actor);
  if (ifMatch !== undefined) headers['If-Match'] = String(ifMatch);
  return headers;
}

@Injectable({ providedIn: 'root' })
export class IntegrationSystemService {
  private readonly http = inject(HttpClient);
  private readonly systemsSignal = signal<IntegrationSystem[]>([]);
  private readonly jobRunsSignal = signal<Record<string, JobRun[]>>({});

  readonly systems = this.systemsSignal.asReadonly();

  load(): Observable<IntegrationSystem[]> {
    return this.http
      .get<IntegrationSystem[]>(BASE_URL)
      .pipe(tap((list) => this.systemsSignal.set(list)));
  }

  loadJobRuns(key: string): Observable<JobRun[]> {
    return this.http.get<JobRun[]>(`${BASE_URL}/${encodeURIComponent(key)}/job-runs`).pipe(
      tap((runs) => this.jobRunsSignal.update((cache) => ({ ...cache, [key]: runs }))),
    );
  }

  jobRunsFor(key: string): JobRun[] {
    return this.jobRunsSignal()[key] ?? [];
  }

  /** Dùng cho cả "Kết nối" (hệ đang down) và "Cấu hình lại" (hệ đã kết nối) — giống
   * handleConnect gốc, luôn set trạng thái 'healthy'. */
  connect(system: IntegrationSystem, payload: ConnectSystemRequest, actor?: string): Observable<IntegrationSystem> {
    return this.http
      .post<IntegrationSystem>(`${BASE_URL}/${encodeURIComponent(system.key)}/connect`, payload, {
        headers: actorHeaders(actor, system.version),
      })
      .pipe(tap((updated) => this.upsertCache(updated)));
  }

  disconnect(system: IntegrationSystem, actor?: string): Observable<IntegrationSystem> {
    return this.http
      .post<IntegrationSystem>(`${BASE_URL}/${encodeURIComponent(system.key)}/disconnect`, null, {
        headers: actorHeaders(actor, system.version),
      })
      .pipe(tap((updated) => this.upsertCache(updated)));
  }

  private upsertCache(updated: IntegrationSystem): void {
    this.systemsSignal.update((list) => list.map((s) => (s.key === updated.key ? updated : s)));
  }
}

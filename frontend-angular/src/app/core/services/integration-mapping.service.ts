import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { API_BASE_URL, encodeAuditActor } from '../api-config';
import type { CreateMappingRequest, FieldMapping, MappingConfig, MappingStatus } from '../models/integration-mapping';

// HTTP-backed store cho `/api/integration-mappings` — thay
// webapp/src/store/IntegrationMappingContext.tsx (React Context in-memory).
// Signal chỉ là cache sau khi backend (Spring Boot + PostgreSQL) xác nhận.

const BASE_URL = `${API_BASE_URL}/api/integration-mappings`;

export interface StatusChangeResult {
  ok: boolean;
  errors: string[];
  mapping: MappingConfig;
}

function actorHeaders(actor?: string, ifMatch?: number): Record<string, string> {
  const headers: Record<string, string> = {};
  if (actor) headers['X-QTKHCN-Actor'] = encodeAuditActor(actor);
  if (ifMatch !== undefined) headers['If-Match'] = String(ifMatch);
  return headers;
}

@Injectable({ providedIn: 'root' })
export class IntegrationMappingService {
  private readonly http = inject(HttpClient);
  private readonly listSignal = signal<MappingConfig[]>([]);

  readonly list = this.listSignal.asReadonly();

  load(): Observable<MappingConfig[]> {
    return this.http.get<MappingConfig[]>(BASE_URL).pipe(tap((list) => this.listSignal.set(list)));
  }

  get(id: string): MappingConfig | undefined {
    return this.listSignal().find((c) => c.id === id);
  }

  listForSystem(he: string): MappingConfig[] {
    return this.listSignal().filter((c) => c.he === he);
  }

  create(input: CreateMappingRequest, actor?: string): Observable<MappingConfig> {
    return this.http
      .post<MappingConfig>(BASE_URL, input, { headers: actorHeaders(actor) })
      .pipe(tap((created) => this.listSignal.update((list) => [created, ...list])));
  }

  /** Ghi đè toàn bộ field mapping — luôn hạ về draft (đúng hành vi saveFields gốc). */
  saveFields(config: MappingConfig, fields: FieldMapping[], actor?: string): Observable<MappingConfig> {
    return this.http
      .put<MappingConfig>(`${BASE_URL}/${encodeURIComponent(config.id)}/fields`, { fields }, {
        headers: actorHeaders(actor, config.version),
      })
      .pipe(tap((updated) => this.upsertCache(updated)));
  }

  /** Đổi trạng thái. Chuyển sang 'active' luôn ghi lại kết quả (dù không hợp lệ thì ghi
   * 'error') — đúng hành vi setStatus gốc, không throw khi validate fail. */
  setStatus(config: MappingConfig, status: MappingStatus, actor?: string): Observable<StatusChangeResult> {
    return this.http
      .put<StatusChangeResult>(`${BASE_URL}/${encodeURIComponent(config.id)}/status`, { status }, {
        headers: actorHeaders(actor, config.version),
      })
      .pipe(tap((result) => this.upsertCache(result.mapping)));
  }

  remove(config: MappingConfig): Observable<void> {
    return this.http
      .delete<void>(`${BASE_URL}/${encodeURIComponent(config.id)}`, { headers: actorHeaders(undefined, config.version) })
      .pipe(tap(() => this.listSignal.update((list) => list.filter((c) => c.id !== config.id))));
  }

  private upsertCache(updated: MappingConfig): void {
    this.listSignal.update((list) => {
      const index = list.findIndex((c) => c.id === updated.id);
      if (index < 0) return [updated, ...list];
      const next = [...list];
      next[index] = updated;
      return next;
    });
  }
}

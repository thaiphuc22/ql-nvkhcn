import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap, throwError } from 'rxjs';

import { API_BASE_URL, encodeAuditActor } from '../api-config';
import type { ApprovalSlot } from '../models/approval-slot-catalog';

const BASE_URL = `${API_BASE_URL}/api/approval-matrix/slots`;

interface ApprovalSlotResponse extends ApprovalSlot {
  usageCount: number;
  updatedAt: string;
  updatedBy: string;
}

export interface CreateApprovalSlotInput {
  code: string;
  ten: string;
  moTa?: string;
  nhomQuyTrinh?: string[];
}

export interface UpdateApprovalSlotInput {
  ten?: string;
  moTa?: string;
  nhomQuyTrinh?: string[];
  thuTu?: number;
}

export function normalizeSlotCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[\s-]+/g, '_');
}

function actorOptions(actor?: string): { headers: Record<string, string> } | undefined {
  return actor ? { headers: { 'X-QTKHCN-Actor': encodeAuditActor(actor) } } : undefined;
}

function toSlot(response: ApprovalSlotResponse): ApprovalSlot {
  return {
    code: response.code,
    ten: response.ten,
    moTa: response.moTa,
    nhomQuyTrinh: response.nhomQuyTrinh,
    trangThai: response.trangThai,
    thuTu: response.thuTu,
  };
}

/** HTTP-backed store cho danh mục Need Role tại `/api/approval-matrix/slots`. */
@Injectable({ providedIn: 'root' })
export class ApprovalSlotCatalogService {
  private readonly http = inject(HttpClient);
  private readonly slotsSignal = signal<ApprovalSlot[]>([]);
  readonly slots = this.slotsSignal.asReadonly();

  load(): Observable<ApprovalSlot[]> {
    return this.http.get<ApprovalSlotResponse[]>(BASE_URL).pipe(
      map((responses) => responses.map(toSlot)),
      tap((slots) => this.slotsSignal.set(slots)),
    );
  }

  findByCode(code: string): ApprovalSlot | undefined {
    return this.slotsSignal().find((slot) => slot.code === code);
  }

  create(input: CreateApprovalSlotInput, actor?: string): Observable<ApprovalSlot> {
    const code = normalizeSlotCode(input.code);
    if (!code) return throwError(() => new Error('Mã slot không được để trống.'));
    const existing = this.findByCode(code);
    if (existing) return throwError(() => new Error(`Mã slot "${code}" đã tồn tại (${existing.ten}).`));
    const thuTu = Math.max(0, ...this.slotsSignal().map((slot) => slot.thuTu)) + 10;
    return this.http.post<ApprovalSlotResponse>(BASE_URL, { ...input, code, thuTu }, actorOptions(actor)).pipe(
      map(toSlot),
      tap((slot) => this.slotsSignal.update((slots) => [...slots, slot])),
    );
  }

  update(code: string, patch: UpdateApprovalSlotInput, actor?: string): Observable<ApprovalSlot> {
    return this.http.put<ApprovalSlotResponse>(`${BASE_URL}/${encodeURIComponent(code)}`, patch, actorOptions(actor)).pipe(
      map(toSlot),
      tap((saved) => this.upsertCache(saved)),
    );
  }

  setStatus(
    code: string,
    trangThai: ApprovalSlot['trangThai'],
    force: boolean,
    actor?: string,
  ): Observable<ApprovalSlot> {
    return this.http.post<ApprovalSlotResponse>(
      `${BASE_URL}/${encodeURIComponent(code)}/status?force=${force}`,
      { status: trangThai },
      actorOptions(actor),
    ).pipe(map(toSlot), tap((saved) => this.upsertCache(saved)));
  }

  private upsertCache(slot: ApprovalSlot): void {
    this.slotsSignal.update((slots) => slots.map((item) => item.code === slot.code ? slot : item));
  }
}

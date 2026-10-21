import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

import { API_BASE_URL, encodeAuditActor } from '../api-config';
import { RD07_FORM_SEEDS } from '../data/eform-rd07-seed';
import { emptySchema, type FormMeta } from '../models/eform';
import type { NhomRD } from '../models/eform-nhom-rd';

// HTTP-backed store cho `/api/eform` — thay `store/FormContext.tsx` (React) /
// signal store in-memory trước đó. Signal chỉ là cache dùng chung giữa danh sách
// và trang thiết kế; server (Spring Boot + PostgreSQL) là nguồn dữ liệu thật.
//
// Fallback seed (RD07_FORM_SEEDS): khi backend trả rỗng, Angular tự nạp seed
// client-side vào cache để user xem được UI ngay — đây là **dữ liệu tạm thời**,
// không qua POST API, không có Flyway migration. Khi backend đã có dữ liệu thật
// thì backend thắng (xem `load()` dưới). Xem
// `.harness/state/DELIVERY_STATE.md` 2026-08-05 để biết lý do và phạm vi.

const BASE_URL = `${API_BASE_URL}/api/eform`;

interface EformResponse {
  key: string;
  ten: string;
  moTa: string;
  loai?: FormMeta['loai'];
  schema: unknown;
  version: number;
  updatedBy: string;
  updatedAt: string;
  createdAt: string;
}

export interface AddFormInput {
  key: string;
  ten: string;
  moTa?: string;
  loai?: FormMeta['loai'];
  nhomRD?: NhomRD;
}

function actorOptions(actor?: string): { headers: Record<string, string> } | undefined {
  return actor ? { headers: { 'X-QTKHCN-Actor': encodeAuditActor(actor) } } : undefined;
}

function toMeta(response: EformResponse): FormMeta {
  return { key: response.key, ten: response.ten, moTa: response.moTa, loai: response.loai,
    schema: response.schema, version: response.version };
}

@Injectable({ providedIn: 'root' })
export class EformService {
  private readonly http = inject(HttpClient);
  private readonly listSignal = signal<FormMeta[]>([]);
  readonly list = this.listSignal.asReadonly();

  /** Bật/tắt fallback seed client-side — mặc định BẬT theo quyết định
   * "seed tạm thời" ghi ở `active-task.md` 2026-08-05. Có thể tắt qua
   * `disableSeedFallback()` nếu user muốn danh sách rỗng thật khi backend rỗng
   * (ví dụ test). */
  private seedEnabled = true;

  disableSeedFallback(): void {
    this.seedEnabled = false;
  }

  enableSeedFallback(): void {
    this.seedEnabled = true;
  }

  isSeedFallbackEnabled(): boolean {
    return this.seedEnabled;
  }

  load(): Observable<FormMeta[]> {
    return this.http.get<EformResponse[]>(BASE_URL).pipe(
      map((responses) => responses.map(toMeta)),
      tap((forms) => {
        // Backend trả rỗng → nạp seed client-side để UI không trống trơn khi
        // dev backend chưa có dữ liệu. Backend có dữ liệu thì backend thắng —
        // TUYỆT ĐỐI không trộn lẫn (tránh "lệch pha" thật/giả).
        if (forms.length === 0 && this.seedEnabled) {
          this.listSignal.set([...RD07_FORM_SEEDS]);
        } else {
          this.listSignal.set(forms);
        }
      }),
    );
  }

  /** Tải đúng 1 biểu mẫu và nạp vào cache — dùng khi vào thẳng trang designer (route con), lúc
   * danh sách chưa chắc đã tải (ví dụ mở lại tab/deep-link). */
  loadOne(key: string, version?: number | null): Observable<FormMeta> {
    const url = version == null
      ? `${BASE_URL}/${encodeURIComponent(key)}`
      : `${BASE_URL}/${encodeURIComponent(key)}/versions/${version}`;
    return this.http.get<EformResponse>(url).pipe(
      map(toMeta),
      tap((meta) => this.upsertCache(meta)),
    );
  }

  getForm(key?: string): FormMeta | undefined {
    return key ? this.listSignal().find((f) => f.key === key) : undefined;
  }

  /** Tạo biểu mẫu mới với schema rỗng. */
  addForm(input: AddFormInput, actor?: string): Observable<FormMeta> {
    const key = input.key.trim().toLowerCase();
    const ten = input.ten.trim();
    return this.http.post<EformResponse>(BASE_URL, {
      key, ten, moTa: input.moTa?.trim() || '', loai: input.loai, schema: emptySchema(key, ten),
    }, actorOptions(actor)).pipe(
      map((response) => {
        const meta = toMeta(response);
        // Backend chưa biết `nhomRD` (chưa có cột) — gắn client-side từ input
        // để filter dropdown hoạt động đúng ngay sau khi tạo.
        if (input.nhomRD) meta.nhomRD = input.nhomRD;
        return meta;
      }),
      tap((meta) => this.upsertCache(meta)),
    );
  }

  updateMeta(meta: FormMeta, patch: Partial<Pick<FormMeta, 'ten' | 'moTa' | 'loai'>>, actor?: string): Observable<FormMeta> {
    const next = { ten: meta.ten, moTa: meta.moTa, loai: meta.loai, ...patch };
    return this.http.put<EformResponse>(`${BASE_URL}/${encodeURIComponent(meta.key)}/meta`, next, {
      headers: { 'If-Match': String(meta.version), ...(actorOptions(actor)?.headers ?? {}) },
    }).pipe(map(toMeta), tap((saved) => this.upsertCache(saved)));
  }

  /** Cập nhật schema sau khi thiết kế trong designer. */
  updateSchema(meta: FormMeta, schema: unknown, actor?: string): Observable<FormMeta> {
    return this.http.put<EformResponse>(`${BASE_URL}/${encodeURIComponent(meta.key)}/schema`, { schema }, {
      headers: { 'If-Match': String(meta.version), ...(actorOptions(actor)?.headers ?? {}) },
    }).pipe(map(toMeta), tap((saved) => this.upsertCache(saved)));
  }

  removeForm(meta: FormMeta): Observable<void> {
    return this.http.delete<void>(`${BASE_URL}/${encodeURIComponent(meta.key)}`, {
      headers: { 'If-Match': String(meta.version) },
    }).pipe(tap(() => this.listSignal.update((forms) => forms.filter((f) => f.key !== meta.key))));
  }

  private upsertCache(meta: FormMeta): void {
    this.listSignal.update((forms) => {
      const index = forms.findIndex((f) => f.key === meta.key);
      if (index < 0) return [meta, ...forms];
      const next = [...forms];
      next[index] = meta;
      return next;
    });
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL, encodeAuditActor } from '../api-config';
import { CreateNhiemVuRequest, NhiemVuResponse } from '../models/nhiem-vu';

@Injectable({ providedIn: 'root' })
export class NhiemVuService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/api/nhiem-vu`;

  list(): Observable<NhiemVuResponse[]> {
    return this.http.get<NhiemVuResponse[]>(this.endpoint);
  }

  get(ma: string): Observable<NhiemVuResponse> {
    return this.http.get<NhiemVuResponse>(`${this.endpoint}/${encodeURIComponent(ma)}`);
  }

  create(payload: CreateNhiemVuRequest, actor: string): Observable<NhiemVuResponse> {
    return this.http.post<NhiemVuResponse>(this.endpoint, payload, {
      headers: { 'X-QTKHCN-Actor': encodeAuditActor(actor) },
    });
  }
}

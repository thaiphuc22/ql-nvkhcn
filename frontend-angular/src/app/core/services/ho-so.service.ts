import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL, encodeAuditActor } from '../api-config';
import {
  CreateHoSoRequest, HoSoActionRequest, HoSoResponse, SubmitHoSoRequest, UploadedHoSoDocument,
} from '../models/ho-so';

/** Gọi thật `GET /api/ho-so` (backend Spring Boot, Mốc 2/3) — không phải mock. */
@Injectable({ providedIn: 'root' })
export class HoSoService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/api/ho-so`;

  list(): Observable<HoSoResponse[]> {
    return this.http.get<HoSoResponse[]>(this.endpoint);
  }

  get(id: string): Observable<HoSoResponse> {
    return this.http.get<HoSoResponse>(`${this.endpoint}/${encodeURIComponent(id)}`);
  }

  create(payload: CreateHoSoRequest, actor: string): Observable<HoSoResponse> {
    return this.http.post<HoSoResponse>(this.endpoint, payload, {
      headers: { 'X-QTKHCN-Actor': encodeAuditActor(actor) },
    });
  }

  delete(id: string, actor: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${encodeURIComponent(id)}`, {
      headers: { 'X-QTKHCN-Actor': encodeAuditActor(actor) },
    });
  }

  uploadDocument(id: string, file: File, actor: string): Observable<UploadedHoSoDocument> {
    const data = new FormData();
    data.append('file', file, file.name);
    return this.http.post<UploadedHoSoDocument>(
      `${this.endpoint}/${encodeURIComponent(id)}/documents`, data,
      { headers: { 'X-QTKHCN-Actor': encodeAuditActor(actor) } },
    );
  }

  viewDocument(id: string, documentId: number): Observable<Blob> {
    return this.http.get(
      `${this.endpoint}/${encodeURIComponent(id)}/documents/${documentId}/content`,
      { responseType: 'blob' },
    );
  }

  downloadDocument(id: string, documentId: number): Observable<Blob> {
    return this.http.get(
      `${this.endpoint}/${encodeURIComponent(id)}/documents/${documentId}/download`,
      { responseType: 'blob' },
    );
  }

  deleteDocument(id: string, documentId: number, version: number, actor: string): Observable<void> {
    return this.http.delete<void>(
      `${this.endpoint}/${encodeURIComponent(id)}/documents/${documentId}`,
      {
        headers: {
          'If-Match': `"${version}"`,
          'X-QTKHCN-Actor': encodeAuditActor(actor),
        },
      },
    );
  }


  submit(id: string, payload: SubmitHoSoRequest, actor: string): Observable<HoSoResponse> {
    return this.http.post<HoSoResponse>(`${this.endpoint}/${encodeURIComponent(id)}/submit`, payload, {
      headers: { 'X-QTKHCN-Actor': encodeAuditActor(actor) },
    });
  }

  applyAction(id: string, payload: HoSoActionRequest): Observable<HoSoResponse> {
    return this.http.post<HoSoResponse>(`${this.endpoint}/${encodeURIComponent(id)}/actions`, payload);
  }
}

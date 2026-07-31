import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL, encodeAuditActor } from '../api-config';
import { CreateHoiDongRequest, HoiDongXetDuyetResponse, UpdateHoiDongRequest } from '../models/ho-so';

/** CRUD thật cho màn quản trị "Quản lý hội đồng" — gọi `ho-so-service` (`/api/hoi-dong`). */
@Injectable({ providedIn: 'root' })
export class HoiDongService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/api/hoi-dong`;

  list(): Observable<HoiDongXetDuyetResponse[]> {
    return this.http.get<HoiDongXetDuyetResponse[]>(this.endpoint);
  }

  get(id: number): Observable<HoiDongXetDuyetResponse> {
    return this.http.get<HoiDongXetDuyetResponse>(`${this.endpoint}/${id}`);
  }

  create(payload: CreateHoiDongRequest, actor: string): Observable<HoiDongXetDuyetResponse> {
    return this.http.post<HoiDongXetDuyetResponse>(this.endpoint, payload, {
      headers: { 'X-QTKHCN-Actor': encodeAuditActor(actor) },
    });
  }

  update(id: number, version: number, payload: UpdateHoiDongRequest, actor: string): Observable<HoiDongXetDuyetResponse> {
    return this.http.put<HoiDongXetDuyetResponse>(`${this.endpoint}/${id}`, payload, {
      headers: { 'If-Match': `"${version}"`, 'X-QTKHCN-Actor': encodeAuditActor(actor) },
    });
  }

  delete(id: number, actor: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`, {
      headers: { 'X-QTKHCN-Actor': encodeAuditActor(actor) },
    });
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api-config';
import { CreateHoSoRequest, HoSoActionRequest, HoSoResponse, SubmitHoSoRequest } from '../models/ho-so';

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

  create(payload: CreateHoSoRequest): Observable<HoSoResponse> {
    return this.http.post<HoSoResponse>(this.endpoint, payload);
  }


  submit(id: string, payload: SubmitHoSoRequest): Observable<HoSoResponse> {
    return this.http.post<HoSoResponse>(`${this.endpoint}/${encodeURIComponent(id)}/submit`, payload);
  }

  applyAction(id: string, payload: HoSoActionRequest): Observable<HoSoResponse> {
    return this.http.post<HoSoResponse>(`${this.endpoint}/${encodeURIComponent(id)}/actions`, payload);
  }
}

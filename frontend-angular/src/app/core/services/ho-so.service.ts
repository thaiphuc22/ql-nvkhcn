import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api-config';
import { HoSoResponse } from '../models/ho-so';

/** Gọi thật `GET /api/ho-so` (backend Spring Boot, Mốc 2/3) — không phải mock. */
@Injectable({ providedIn: 'root' })
export class HoSoService {
  private readonly http = inject(HttpClient);

  list(): Observable<HoSoResponse[]> {
    return this.http.get<HoSoResponse[]>(`${API_BASE_URL}/api/ho-so`);
  }
}

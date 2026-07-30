import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api-config';
import { FeatureResponse } from '../models/identity';

/** Gọi thật `/api/features` (services/identity-service, Phân hệ 2 — D22). Đọc-thôi, catalog cho ma trận role×feature×permission. */
@Injectable({ providedIn: 'root' })
export class FeatureService {
  private readonly http = inject(HttpClient);

  list(): Observable<FeatureResponse[]> {
    return this.http.get<FeatureResponse[]>(`${API_BASE_URL}/api/features`);
  }
}

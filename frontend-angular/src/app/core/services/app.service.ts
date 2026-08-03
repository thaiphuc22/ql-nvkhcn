import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api-config';
import { AppResponse } from '../models/identity';

/** Gọi thật `/api/apps` (services/identity-service, Phân hệ 2 — D22). Danh mục 3 App (D19); đọc-thôi. */
@Injectable({ providedIn: 'root' })
export class AppCatalogService {
  private readonly http = inject(HttpClient);

  list(): Observable<AppResponse[]> {
    return this.http.get<AppResponse[]>(`${API_BASE_URL}/api/apps`);
  }
}

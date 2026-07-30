import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api-config';
import { DataScopeResponse } from '../models/identity';

/** Gọi thật `/api/data-scopes` (services/identity-service, Phân hệ 2 — D22). Đọc-thôi, thay free-text `dataScope` cũ. */
@Injectable({ providedIn: 'root' })
export class DataScopeService {
  private readonly http = inject(HttpClient);

  list(): Observable<DataScopeResponse[]> {
    return this.http.get<DataScopeResponse[]>(`${API_BASE_URL}/api/data-scopes`);
  }
}

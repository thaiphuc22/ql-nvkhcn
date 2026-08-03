import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api-config';
import { AuditLogResponse } from '../models/identity';

/** Gọi thật `/api/audit-log` (services/identity-service, Phân hệ 2 — D22). Đọc-thôi. */
@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly http = inject(HttpClient);

  list(): Observable<AuditLogResponse[]> {
    return this.http.get<AuditLogResponse[]>(`${API_BASE_URL}/api/audit-log`);
  }
}

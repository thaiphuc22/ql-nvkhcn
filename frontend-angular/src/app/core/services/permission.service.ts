import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api-config';
import { PermissionRequest, PermissionResponse } from '../models/identity';

/** Gọi thật `/api/permissions` (services/identity-service, Phân hệ 2 — D22). */
@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly http = inject(HttpClient);

  list(): Observable<PermissionResponse[]> {
    return this.http.get<PermissionResponse[]>(`${API_BASE_URL}/api/permissions`);
  }

  create(request: PermissionRequest): Observable<PermissionResponse> {
    return this.http.post<PermissionResponse>(`${API_BASE_URL}/api/permissions`, request);
  }

  update(id: string, request: PermissionRequest): Observable<PermissionResponse> {
    return this.http.put<PermissionResponse>(`${API_BASE_URL}/api/permissions/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/api/permissions/${id}`);
  }
}

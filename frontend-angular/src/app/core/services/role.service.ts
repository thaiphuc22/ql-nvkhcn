import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api-config';
import { RoleRequest, RoleResponse } from '../models/identity';

/** Gọi thật `/api/roles` (services/identity-service, Phân hệ 2 — D22). Thay `RoleCatalog.java` hardcode. */
@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly http = inject(HttpClient);

  list(): Observable<RoleResponse[]> {
    return this.http.get<RoleResponse[]>(`${API_BASE_URL}/api/roles`);
  }

  create(request: RoleRequest): Observable<RoleResponse> {
    return this.http.post<RoleResponse>(`${API_BASE_URL}/api/roles`, request);
  }

  update(id: string, request: RoleRequest): Observable<RoleResponse> {
    return this.http.put<RoleResponse>(`${API_BASE_URL}/api/roles/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/api/roles/${id}`);
  }
}

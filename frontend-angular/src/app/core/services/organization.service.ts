import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api-config';
import { OrganizationRequest, OrganizationResponse } from '../models/identity';

/** Gọi thật `/api/organizations` (services/identity-service, Phân hệ 2 — D22). */
@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private readonly http = inject(HttpClient);

  list(): Observable<OrganizationResponse[]> {
    return this.http.get<OrganizationResponse[]>(`${API_BASE_URL}/api/organizations`);
  }

  create(request: OrganizationRequest): Observable<OrganizationResponse> {
    return this.http.post<OrganizationResponse>(`${API_BASE_URL}/api/organizations`, request);
  }

  update(id: string, request: OrganizationRequest): Observable<OrganizationResponse> {
    return this.http.put<OrganizationResponse>(`${API_BASE_URL}/api/organizations/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/api/organizations/${id}`);
  }
}

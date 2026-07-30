import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api-config';
import {
  AssignmentRequest,
  AssignmentResponse,
  EffectivePermissionsResponse,
  UserAppsRequest,
  UserAppsResponse,
  UserRequest,
  UserResponse,
} from '../models/identity';

/**
 * Gọi thật `/api/users` (services/identity-service, Phân hệ 2 — D22), gồm cả role-assignments
 * (`/api/users/{id}/role-assignments`) và bản public của effective-permissions (dùng bởi
 * `AuthService` — xem `core/auth/auth.service.ts`).
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  list(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${API_BASE_URL}/api/users`);
  }

  create(request: UserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${API_BASE_URL}/api/users`, request);
  }

  update(id: string, request: UserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${API_BASE_URL}/api/users/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/api/users/${id}`);
  }

  assignments(userId: string): Observable<AssignmentResponse[]> {
    return this.http.get<AssignmentResponse[]>(`${API_BASE_URL}/api/users/${userId}/role-assignments`);
  }

  assign(userId: string, request: AssignmentRequest): Observable<AssignmentResponse> {
    return this.http.post<AssignmentResponse>(
      `${API_BASE_URL}/api/users/${userId}/role-assignments`,
      request,
    );
  }

  revoke(userId: string, assignmentId: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/api/users/${userId}/role-assignments/${assignmentId}`);
  }

  effectivePermissionsByEmail(email: string): Observable<EffectivePermissionsResponse> {
    return this.http.get<EffectivePermissionsResponse>(
      `${API_BASE_URL}/api/effective-permissions/${encodeURIComponent(email)}`,
    );
  }

  apps(userId: string): Observable<UserAppsResponse> {
    return this.http.get<UserAppsResponse>(`${API_BASE_URL}/api/users/${userId}/apps`);
  }

  replaceApps(userId: string, request: UserAppsRequest): Observable<UserAppsResponse> {
    return this.http.put<UserAppsResponse>(`${API_BASE_URL}/api/users/${userId}/apps`, request);
  }
}

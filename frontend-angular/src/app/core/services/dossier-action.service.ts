import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL, DEMO_USER_ID_HEADER } from '../api-config';
import { AuthService } from '../auth/auth.service';
import { SimulatedAction } from '../models/action-studio';

@Injectable({ providedIn: 'root' })
export class DossierActionService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  available(id: string): Observable<{ dossierId: string; actions: SimulatedAction[] }> {
    return this.http.get<{ dossierId: string; actions: SimulatedAction[] }>(
      `${API_BASE_URL}/api/dossiers/${encodeURIComponent(id)}/available-actions`, { headers: this.headers() });
  }
  execute(id: string, request: { actionCode: string; expectedPolicyId: string; expectedPolicyVersion: number;
    processCode: string; processName: string }): Observable<{ dossierId: string; status: string }> {
    return this.http.post<{ dossierId: string; status: string }>(
      `${API_BASE_URL}/api/dossiers/${encodeURIComponent(id)}/actions`, request, { headers: this.headers() });
  }
  private headers(): Record<string, string> {
    return { [DEMO_USER_ID_HEADER]: this.auth.user()?.email.trim().toLowerCase() ?? '' };
  }
}

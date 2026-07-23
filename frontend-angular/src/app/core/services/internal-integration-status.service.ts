import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api-config';
import { InternalIntegrationStatus } from '../models/internal-integration-status';

@Injectable({ providedIn: 'root' })
export class InternalIntegrationStatusService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/api/internal-integration/status`;

  load(): Observable<InternalIntegrationStatus> {
    return this.http.get<InternalIntegrationStatus>(this.endpoint);
  }
}

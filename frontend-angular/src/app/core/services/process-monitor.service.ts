import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-config';
import { ProcessMonitorResponse } from '../models/process-monitor';

@Injectable({ providedIn: 'root' })
export class ProcessMonitorService {
  private readonly http = inject(HttpClient);
  snapshot(): Observable<ProcessMonitorResponse> { return this.http.get<ProcessMonitorResponse>(`${API_BASE_URL}/api/process-monitor`); }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL, encodeAuditActor } from '../api-config';
import {
  ProcessDefinitionDetailResponse,
  ProcessDefinitionImportResponse,
  ProcessDefinitionSummaryResponse,
  ProcessDefinitionVersionResponse,
  RunningInstanceCountsResponse,
  RunningInstanceListResponse,
} from '../models/process-definition';

/** Gọi thật `/api/process-definitions/*` (backend Spring Boot, BPMN import/deploy workstream) — không phải mock. */
@Injectable({ providedIn: 'root' })
export class ProcessDefinitionService {
  private readonly http = inject(HttpClient);

  list(): Observable<ProcessDefinitionSummaryResponse[]> {
    return this.http.get<ProcessDefinitionSummaryResponse[]>(`${API_BASE_URL}/api/process-definitions`);
  }

  get(id: string): Observable<ProcessDefinitionDetailResponse> {
    return this.http.get<ProcessDefinitionDetailResponse>(`${API_BASE_URL}/api/process-definitions/${id}`);
  }

  getByBpmnProcessId(bpmnProcessId: string): Observable<ProcessDefinitionDetailResponse> {
    return this.http.get<ProcessDefinitionDetailResponse>(
      `${API_BASE_URL}/api/process-definitions/by-bpmn-process-id/${encodeURIComponent(bpmnProcessId)}`,
    );
  }

  versions(id: string): Observable<ProcessDefinitionVersionResponse[]> {
    return this.http.get<ProcessDefinitionVersionResponse[]>(
      `${API_BASE_URL}/api/process-definitions/${id}/versions`,
    );
  }

  /** Số instance đang chạy theo từng `bpmnProcessId`. Gọi riêng `list()` để Camunda sập không chặn grid. */
  runningInstanceCounts(): Observable<RunningInstanceCountsResponse> {
    return this.http.get<RunningInstanceCountsResponse>(
      `${API_BASE_URL}/api/process-definitions/running-instances`,
    );
  }

  runningInstances(id: string): Observable<RunningInstanceListResponse> {
    return this.http.get<RunningInstanceListResponse>(
      `${API_BASE_URL}/api/process-definitions/${id}/running-instances`,
    );
  }

  import(file: File, actor?: string): Observable<ProcessDefinitionImportResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<ProcessDefinitionImportResponse>(
      `${API_BASE_URL}/api/process-definitions/import`,
      formData,
      actor ? { headers: { 'X-QTKHCN-Actor': encodeAuditActor(actor) } } : undefined,
    );
  }
}

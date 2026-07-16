import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL, encodeAuditActor } from '../api-config';
import {
  BypassBpmnTestServiceTaskRequest,
  BpmnTestSessionResponse,
  CompleteBpmnTestTaskRequest,
  CreateBpmnTestRequest,
  ResolveBpmnTestIncidentRequest,
} from '../models/bpmn-test';

/** Gọi thẳng `/api/bpmn-tests` (Test BPMN — chạy trên Camunda test engine cô lập, không phải production). */
@Injectable({ providedIn: 'root' })
export class BpmnTestService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE_URL}/api/bpmn-tests`;

  create(request: CreateBpmnTestRequest, actor?: string): Observable<BpmnTestSessionResponse> {
    return this.http.post<BpmnTestSessionResponse>(
      this.base,
      request,
      actor ? { headers: { 'X-QTKHCN-Actor': encodeAuditActor(actor) } } : undefined,
    );
  }

  get(id: string): Observable<BpmnTestSessionResponse> {
    return this.http.get<BpmnTestSessionResponse>(`${this.base}/${id}`);
  }

  completeTask(
    id: string,
    taskKey: number,
    request?: CompleteBpmnTestTaskRequest,
  ): Observable<BpmnTestSessionResponse> {
    return this.http.post<BpmnTestSessionResponse>(
      `${this.base}/${id}/tasks/${taskKey}/complete`,
      request ?? {},
    );
  }

  resolveIncident(
    id: string,
    incidentKey: number,
    request?: ResolveBpmnTestIncidentRequest,
  ): Observable<BpmnTestSessionResponse> {
    return this.http.post<BpmnTestSessionResponse>(
      `${this.base}/${id}/incidents/${incidentKey}/resolve`,
      request ?? {},
    );
  }

  bypassServiceTask(
    id: string,
    jobKey: number,
    request?: BypassBpmnTestServiceTaskRequest,
  ): Observable<BpmnTestSessionResponse> {
    return this.http.post<BpmnTestSessionResponse>(
      `${this.base}/${id}/jobs/${jobKey}/bypass`,
      request ?? {},
    );
  }

  cancel(id: string): Observable<BpmnTestSessionResponse> {
    return this.http.delete<BpmnTestSessionResponse>(`${this.base}/${id}`);
  }
}

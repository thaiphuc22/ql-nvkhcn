import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL, encodeAuditActor } from '../api-config';
import {
  ProcessDefinitionDraftResponse,
  ProcessDefinitionDraftStatus,
  ProcessDefinitionDraftSummaryResponse,
  ProcessDefinitionDraftValidationResponse,
  ProcessDefinitionImportResponse,
} from '../models/process-definition';

@Injectable({ providedIn: 'root' })
export class ProcessDefinitionDraftService {
  private readonly http = inject(HttpClient);

  list(filters?: {
    status?: ProcessDefinitionDraftStatus;
    bpmnProcessId?: string;
    q?: string;
  }): Observable<ProcessDefinitionDraftSummaryResponse[]> {
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.bpmnProcessId?.trim()) params = params.set('bpmnProcessId', filters.bpmnProcessId.trim());
    if (filters?.q?.trim()) params = params.set('q', filters.q.trim());
    return this.http.get<ProcessDefinitionDraftSummaryResponse[]>(
      `${API_BASE_URL}/api/process-definition-drafts`,
      { params },
    );
  }

  get(id: string): Observable<ProcessDefinitionDraftResponse> {
    return this.http.get<ProcessDefinitionDraftResponse>(`${API_BASE_URL}/api/process-definition-drafts/${id}`);
  }

  create(
    input: { resourceName: string; bpmnProcessId: string; name: string; bpmnXml: string },
    actor?: string,
  ): Observable<ProcessDefinitionDraftResponse> {
    return this.http.post<ProcessDefinitionDraftResponse>(
      `${API_BASE_URL}/api/process-definition-drafts`,
      input,
      actor ? { headers: { 'X-QTKHCN-Actor': encodeAuditActor(actor) } } : undefined,
    );
  }

  update(
    id: string,
    input: {
      expectedRevision: number;
      resourceName: string;
      bpmnProcessId: string;
      name: string;
      bpmnXml: string;
    },
    actor?: string,
  ): Observable<ProcessDefinitionDraftResponse> {
    return this.http.put<ProcessDefinitionDraftResponse>(
      `${API_BASE_URL}/api/process-definition-drafts/${id}`,
      input,
      actor ? { headers: { 'X-QTKHCN-Actor': encodeAuditActor(actor) } } : undefined,
    );
  }

  import(file: File, bpmnProcessId: string, name: string, actor?: string): Observable<ProcessDefinitionDraftResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('bpmnProcessId', bpmnProcessId.trim());
    formData.append('name', name.trim());
    return this.http.post<ProcessDefinitionDraftResponse>(
      `${API_BASE_URL}/api/process-definition-drafts/import`,
      formData,
      actor ? { headers: { 'X-QTKHCN-Actor': encodeAuditActor(actor) } } : undefined,
    );
  }

  validate(id: string, expectedRevision: number, actor?: string): Observable<ProcessDefinitionDraftValidationResponse> {
    return this.http.post<ProcessDefinitionDraftValidationResponse>(
      `${API_BASE_URL}/api/process-definition-drafts/${id}/validate`,
      { expectedRevision },
      actor ? { headers: { 'X-QTKHCN-Actor': encodeAuditActor(actor) } } : undefined,
    );
  }

  deploy(id: string, expectedRevision: number, actor?: string): Observable<ProcessDefinitionImportResponse> {
    return this.http.post<ProcessDefinitionImportResponse>(
      `${API_BASE_URL}/api/process-definition-drafts/${id}/deploy`,
      { expectedRevision },
      actor ? { headers: { 'X-QTKHCN-Actor': encodeAuditActor(actor) } } : undefined,
    );
  }

  delete(id: string, expectedRevision: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/api/process-definition-drafts/${id}`, {
      params: new HttpParams().set('expectedRevision', expectedRevision),
    });
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL, encodeAuditActor } from '../api-config';
import {
  ProcessDefinitionDetailResponse,
  ProcessDefinitionImportResponse,
  ProcessDefinitionSummaryResponse,
  ProcessDefinitionVersionResponse,
  ProcessReadinessResponse,
  ProcessSyncResponse,
  RunningInstanceCountsResponse,
  RunningInstanceListResponse,
  SelectableProcessResponse,
} from '../models/process-definition';

/** Gọi thật `/api/process-definitions/*` (backend Spring Boot, BPMN import/deploy workstream) — không phải mock. */
@Injectable({ providedIn: 'root' })
export class ProcessDefinitionService {
  private readonly http = inject(HttpClient);

  list(): Observable<ProcessDefinitionSummaryResponse[]> {
    return this.http.get<ProcessDefinitionSummaryResponse[]>(`${API_BASE_URL}/api/process-definitions`);
  }

  /** Quy trình chọn được khi gửi duyệt — nguồn duy nhất, không còn danh sách hardcode trên FE. */
  selectable(): Observable<SelectableProcessResponse[]> {
    return this.http.get<SelectableProcessResponse[]>(
      `${API_BASE_URL}/api/process-definitions/selectable`,
    );
  }

  /**
   * Hút quy trình deploy thẳng lên Camunda về catalog. Chủ động (bấm nút) chứ không chạy nền —
   * đồng bộ ngầm sẽ âm thầm kéo cả process rác trên engine dev vào danh sách chọn khi gửi duyệt.
   */
  syncFromCamunda(actor?: string): Observable<ProcessSyncResponse> {
    return this.http.post<ProcessSyncResponse>(
      `${API_BASE_URL}/api/process-definitions/sync-from-camunda`,
      null,
      actor ? { headers: { 'X-QTKHCN-Actor': encodeAuditActor(actor) } } : undefined,
    );
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

  /**
   * Đối soát một quy trình đã deploy: biểu mẫu, vai trò, luật hành động, service task có worker chưa.
   * Đọc-thôi — không sửa gì, gọi lại bao nhiêu lần cũng được.
   */
  readiness(bpmnProcessId: string): Observable<ProcessReadinessResponse> {
    return this.http.get<ProcessReadinessResponse>(
      `${API_BASE_URL}/api/process-definitions/by-bpmn-process-id/${encodeURIComponent(bpmnProcessId)}/readiness`,
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

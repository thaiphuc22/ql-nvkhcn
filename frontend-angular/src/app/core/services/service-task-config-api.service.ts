import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api-config';

/**
 * Client cho `/api/service-tasks` — cấu hình tác vụ hệ thống THẬT trong DB, tức là thứ đang chi phối
 * job worker lúc chạy (`ServiceTaskConfigResolver` ở backend đọc đúng mấy bảng này).
 *
 * KHÁC với `ServiceTaskService` (signal store, seed in-memory trong `models/service-task.ts`): store
 * đó là mock cho phần lớn màn `/cau-hinh-service-task` và KHÔNG chi phối runtime. Hai nguồn đang lệch
 * nhau — service này tồn tại để chỗ lệch đó hiện ra trên UI thay vì âm thầm.
 *
 * Các thao tác ghi tạo version bất biến mới ở backend; xóa chỉ áp dụng khi không còn binding.
 */
@Injectable({ providedIn: 'root' })
export class ServiceTaskConfigApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/api/service-tasks`;

  list(filter?: { status?: ServiceTaskApiDefinitionStatus; q?: string }): Observable<ServiceTaskApiDefinitionSummary[]> {
    let params = new HttpParams();
    if (filter?.status) {
      params = params.set('status', filter.status);
    }
    if (filter?.q?.trim()) {
      params = params.set('q', filter.q.trim());
    }
    return this.http.get<ServiceTaskApiDefinitionSummary[]>(this.baseUrl, { params });
  }

  get(id: string): Observable<ServiceTaskApiDefinitionDetail> {
    return this.http.get<ServiceTaskApiDefinitionDetail>(`${this.baseUrl}/${id}`);
  }

  /** Toàn bộ binding — "service task nào trong BPMN đang bị cấu hình nào chi phối". */
  listBindings(): Observable<ServiceTaskApiBinding[]> {
    return this.http.get<ServiceTaskApiBinding[]>(`${this.baseUrl}/bindings`);
  }

  create(request: ServiceTaskApiWriteRequest): Observable<ServiceTaskApiDefinitionDetail> {
    return this.http.post<ServiceTaskApiDefinitionDetail>(this.baseUrl, request);
  }

  update(id: string, request: ServiceTaskApiWriteRequest): Observable<ServiceTaskApiDefinitionDetail> {
    return this.http.put<ServiceTaskApiDefinitionDetail>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

export type ServiceTaskApiDefinitionStatus = 'DRAFT' | 'READY' | 'ACTIVE' | 'DEPRECATED' | 'ERROR';
export type ServiceTaskApiVersionStatus = 'DRAFT' | 'READY' | 'ACTIVE' | 'ARCHIVED' | 'ERROR';
export type ServiceTaskApiBindingStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR';
export type ServiceTaskApiTypeCode =
  | 'SEND_NOTIFICATION'
  | 'CALL_API'
  | 'UPDATE_DOSSIER'
  | 'GENERATE_DOCUMENT'
  | 'EVALUATE_DECISION';

export interface ServiceTaskApiDefinitionSummary {
  id: string;
  code: string;
  name: string;
  description: string;
  typeCode: ServiceTaskApiTypeCode;
  status: ServiceTaskApiDefinitionStatus;
  ownerModule: string;
  latestVersion: number;
  activeVersion: number | null;
  tags: string[];
  bindingCount: number;
  updatedAt: string;
}

export interface ServiceTaskApiDefinitionDetail extends Omit<ServiceTaskApiDefinitionSummary, 'bindingCount'> {
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  versions: ServiceTaskApiConfigVersion[];
  bindings: ServiceTaskApiBinding[];
}

export interface ServiceTaskApiConfigVersion {
  id: string;
  version: number;
  /** `null` khi cột JSONB trong DB hỏng — backend log ERROR chứ không làm sập cả danh sách. */
  config: Record<string, unknown> | null;
  inputMapping: Record<string, unknown>[] | null;
  outputMapping: Record<string, unknown>[] | null;
  errorPolicy: Record<string, unknown> | null;
  status: ServiceTaskApiVersionStatus;
  changeNote: string;
  createdBy: string;
  createdAt: string;
}

export interface ServiceTaskApiBinding {
  id: string;
  bpmnProcessId: string;
  /** `null` = binding rộng theo `jobType`, không ghim một element cụ thể. */
  elementId: string | null;
  jobType: string;
  definitionId: string;
  definitionCode: string;
  bindingStatus: ServiceTaskApiBindingStatus;
  /** Chỉ để hiển thị — backend KHÔNG dùng nó để resolve (resolve theo bpmnProcessId + elementId). */
  processCode: string;
  taskName: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdBy: string;
  updatedAt: string;
}

export interface ServiceTaskApiWriteRequest {
  code: string;
  name: string;
  description: string;
  typeCode: ServiceTaskApiTypeCode;
  ownerModule: string;
  tags: string[];
  config: Record<string, unknown>;
  inputMapping: Record<string, unknown>[];
  outputMapping: Record<string, unknown>[];
  errorPolicy: Record<string, unknown>;
  changeNote: string;
  actor: string;
}

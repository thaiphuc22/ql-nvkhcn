import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL, DEMO_USER_ID_HEADER } from '../api-config';
import { AuthService } from '../auth/auth.service';
import {
  TaskActionRequest,
  TaskActionResult,
  TaskAvailableActionsResponse,
  TaskFormDraftRequest,
  TaskFormSubmission,
} from '../models/task-action';

/**
 * Client cho task-centric API trên Service Quản trị quy trình (8090) — D20 Lát 2
 * Identity is sent as the selected demo user only; roles remain server-owned and are never sent.
 */
@Injectable({ providedIn: 'root' })
export class TaskActionService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly endpoint = `${API_BASE_URL}/api/tasks`;

  availableActions(taskKey: string): Observable<TaskAvailableActionsResponse> {
    return this.http.get<TaskAvailableActionsResponse>(
      `${this.endpoint}/${encodeURIComponent(taskKey)}/available-actions`,
      { headers: this.identityHeaders() },
    );
  }

  applyAction(taskKey: string, request: TaskActionRequest): Observable<TaskActionResult> {
    return this.http.post<TaskActionResult>(
      `${this.endpoint}/${encodeURIComponent(taskKey)}/actions`,
      { ...request, taskKey, formData: request.formData ?? {} },
      { headers: this.identityHeaders() },
    );
  }

  saveFormDraft(taskKey: string, request: TaskFormDraftRequest): Observable<TaskFormSubmission> {
    return this.http.post<TaskFormSubmission>(
      `${this.endpoint}/${encodeURIComponent(taskKey)}/form-submissions/draft`, request,
      { headers: this.identityHeaders() },
    );
  }

  formSubmissions(taskKey: string): Observable<TaskFormSubmission[]> {
    return this.http.get<TaskFormSubmission[]>(
      `${this.endpoint}/${encodeURIComponent(taskKey)}/form-submissions`,
      { headers: this.identityHeaders() },
    );
  }

  /** UUID mới cho `requestId` — một request logic (kể cả khi UI tự retry) phải giữ nguyên một id. */
  newRequestId(): string {
    return crypto.randomUUID();
  }

  private identityHeaders(): Record<string, string> {
    return { [DEMO_USER_ID_HEADER]: this.auth.user()?.email.trim().toLowerCase() ?? '' };
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL, DEMO_USER_ID_HEADER } from '../api-config';
import { MyTaskResponse } from '../models/my-task';

@Injectable({ providedIn: 'root' })
export class MyTaskService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/api/my-tasks`;

  list(userId: string): Observable<MyTaskResponse[]> {
    return this.http.get<MyTaskResponse[]>(this.endpoint, {
      headers: { [DEMO_USER_ID_HEADER]: userId.trim().toLowerCase() },
    });
  }

  activeForHoSo(maHoSo: string, userId: string): Observable<MyTaskResponse> {
    return this.http.get<MyTaskResponse>(
      `${API_BASE_URL}/api/ho-so/${encodeURIComponent(maHoSo)}/active-task`,
      { headers: { [DEMO_USER_ID_HEADER]: userId.trim().toLowerCase() } },
    );
  }
}

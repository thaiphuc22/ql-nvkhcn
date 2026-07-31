import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../api-config';
import { RoleMatrixFeatureRequest, RoleResponse } from '../models/identity';

/**
 * Ghi ma trận Role×Permission theo TỪNG chức năng (`PUT /api/role-matrix/{featureCode}`,
 * services/identity-service — D22).
 *
 * Vì sao không dùng `RoleService.update()`: `PUT /api/roles/{id}` thay TOÀN BỘ ma trận của vai
 * trò (backend xoá theo `deleteByRoleId` rồi ghi lại từ payload), nên lưu một cột chức năng qua
 * đường đó sẽ xoá sạch 11 chức năng còn lại. Endpoint này chỉ chạm đúng `(vai trò, chức năng)`
 * có trong payload.
 *
 * Đọc ma trận không cần service riêng: `GET /api/roles` đã trả `RoleResponse.matrix`.
 */
@Injectable({ providedIn: 'root' })
export class RoleMatrixService {
  private readonly http = inject(HttpClient);

  /** Trả về các vai trò vừa lưu (đã kèm `matrix` mới) theo đúng thứ tự trong payload. */
  replaceFeature(featureCode: string, request: RoleMatrixFeatureRequest): Observable<RoleResponse[]> {
    return this.http.put<RoleResponse[]>(
      `${API_BASE_URL}/api/role-matrix/${encodeURIComponent(featureCode)}`,
      request,
    );
  }
}

import { HoSoActionOutcome } from './ho-so';

/** Action code hợp lệ cho task action — dùng chung enum đã khoá với `/api/ho-so/{id}/actions` cũ và
 * Action Studio catalog (APPROVE_STEP/RETURN_STEP/REJECT_STEP), không phát minh code mới. */
export type TaskActionCode = HoSoActionOutcome;

/** Action returned by the workflow service after policy and authorization checks. */
export interface TaskAvailableAction {
  actionCode: TaskActionCode;
  label: string;
  tone: string;
  requiresReason: boolean;
  requiresEvidence: boolean;
  requiresConfirm: boolean;
  formKey: string | null;
}

/** Wrapper returned by GET /api/tasks/{taskKey}/available-actions. */
export interface TaskAvailableActionsResponse {
  taskKey: string;
  processInstanceKey: string;
  taskDefinitionKey: string;
  actions: TaskAvailableAction[];
}

/** `POST /api/tasks/{taskKey}/actions` request — đúng field đã khoá ở D20 Lát 2/3. */
export interface TaskActionRequest {
  requestId: string;
  taskKey: string;
  actionCode: TaskActionCode;
  comment: string | null;
  formData: Record<string, unknown>;
  expectedTaskState: string;
}

/** Public asynchronous command status returned with HTTP 202. */
export type TaskActionStatus = 'ACCEPTED';

/**
 * `POST /api/tasks/{taskKey}/actions` response — 202 ưu tiên, KHÔNG phải `HoSoResponse` (kế hoạch nêu rõ
 * "không giả định projection đã cập nhật đồng bộ"). Angular phải poll task/Hồ sơ projection riêng.
 */
export interface TaskActionResult {
  requestId: string;
  taskKey: string;
  processInstanceKey: string;
  status: TaskActionStatus;
}

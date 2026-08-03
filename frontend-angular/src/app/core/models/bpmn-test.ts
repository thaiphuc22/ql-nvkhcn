/**
 * Port từ backend/.../web/dto/{BpmnTestSessionResponse,CreateBpmnTestRequest,
 * CompleteBpmnTestTaskRequest}.java — hình chiếu API thật `/api/bpmn-tests` (Test BPMN Lát
 * A+B+C, DONE+VERIFIED). Chạy trên một Camunda test engine cô lập riêng (không phải production);
 * xem `backend/README.md` mục Test BPMN nếu 409 "Test BPMN đang tắt".
 */

export type BpmnTestStatus =
  | 'STARTING'
  | 'RUNNING'
  | 'BLOCKED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'TIMED_OUT'
  | 'FAILED';

export const BPMN_TEST_TERMINAL_STATUSES: readonly BpmnTestStatus[] = [
  'COMPLETED',
  'CANCELLED',
  'TIMED_OUT',
  'FAILED',
];

export interface BpmnTestElement {
  key: number;
  elementId: string;
  name: string | null;
  type: string;
  state: string;
}

export interface BpmnTestTask {
  key: number;
  elementId: string;
  name: string | null;
  state: string;
  candidateGroups: string[];
}

export interface BpmnTestIncident {
  key: number;
  elementId: string;
  type: string;
  message: string;
  state: string;
}

export interface BpmnTestBlockedJob {
  key: number;
  elementId: string;
  type: string;
  explanation: string;
}

export interface BpmnTestSessionResponse {
  id: string;
  draftId: string;
  draftRevision: number;
  correlationId: string;
  actor: string;
  status: BpmnTestStatus;
  processDefinitionKey: number | null;
  processInstanceKey: number | null;
  createdAt: string;
  expiresAt: string;
  endedAt: string | null;
  failureMessage: string | null;
  currentElements: BpmnTestElement[];
  tasks: BpmnTestTask[];
  variables: Record<string, unknown>;
  incidents: BpmnTestIncident[];
  blockedJobs: BpmnTestBlockedJob[];
}

export interface CreateBpmnTestRequest {
  draftId: string;
  revision: number;
  variables?: Record<string, unknown>;
  ttlSeconds?: number;
}

export interface CompleteBpmnTestTaskRequest {
  variables?: Record<string, unknown>;
}

export interface ResolveBpmnTestIncidentRequest {
  variables?: Record<string, unknown>;
}

export interface BypassBpmnTestServiceTaskRequest {
  variables?: Record<string, unknown>;
}

/** Shape khớp `GlobalExceptionHandler.ErrorBody`/`RequestErrorBody` cho lỗi 400/404/409 của API này. */
export interface BpmnTestErrorBody {
  message: string;
  errors?: string[];
}

/**
 * Port từ backend/.../web/dto/ProcessDefinition{Summary,Detail,Version,Import}Response.java.
 * Đây là hình chiếu API thật (`/api/process-definitions/*`, backend "BPMN import/deploy"
 * workstream DONE+VERIFIED 2026-07-15), KHÔNG phải mock.
 */

export type ProcessDefinitionStatus = 'DEPLOYED';

/**
 * `APP` = deploy từ chính app (nhập .bpmn hoặc deploy bản nháp).
 * `EXTERNAL` = deploy thẳng lên Camunda rồi được nút "Đồng bộ từ Camunda" hút về — KHÔNG đi qua
 * validator nên không có warning lint nào.
 */
export type ProcessDefinitionSource = 'APP' | 'EXTERNAL';

export interface ProcessDefinitionSummaryResponse {
  id: string;
  bpmnProcessId: string;
  name: string;
  latestVersion: number;
  resourceName: string;
  status: ProcessDefinitionStatus;
  /** Nguồn của BẢN MỚI NHẤT, không phải của cả quy trình. */
  source: ProcessDefinitionSource;
  updatedAt: string;
}

/** Port từ `ProcessSyncResponse.java` — kết quả một lượt "Đồng bộ từ Camunda". */
export interface ImportedProcessResponse {
  catalogId: string;
  versionId: string;
  bpmnProcessId: string;
  name: string;
  version: number;
  newCatalog: boolean;
}

export interface ProcessSyncFailure {
  bpmnProcessId: string;
  message: string;
}

export interface ProcessSyncResponse {
  scanned: number;
  imported: number;
  alreadyKnown: number;
  importedProcesses: ImportedProcessResponse[];
  failures: ProcessSyncFailure[];
  warnings: string[];
}

/**
 * Quy trình người dùng chọn được khi gửi duyệt (`GET /api/process-definitions/selectable`).
 * Thay cho bảng hardcode 4 mã theo (loại hồ sơ, cấp) từng nằm trong `ho-so-detail.ts`.
 *
 * `userTaskCount === 0` = quy trình không có userTask nào; chọn vào thì hồ sơ chạy tới cuối mà
 * không sinh việc cho ai. Backend cố ý KHÔNG chặn (quyết định user 2026-07-28), UI chỉ cảnh báo.
 */
export interface SelectableProcessResponse {
  id: string;
  bpmnProcessId: string;
  name: string;
  latestVersion: number;
  userTaskCount: number;
  updatedAt: string;
}

export interface ProcessDefinitionVersionResponse {
  id: string;
  version: number;
  resourceName: string;
  checksumSha256: string;
  camundaDeploymentKey: number;
  camundaProcessDefinitionKey: number;
  status: ProcessDefinitionStatus;
  source: ProcessDefinitionSource;
  importedBy: string;
  importedAt: string;
  bpmnXml: string;
  warnings: string[];
}

export interface ProcessDefinitionDetailResponse {
  id: string;
  bpmnProcessId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  latestVersion: ProcessDefinitionVersionResponse;
}

export interface ProcessDefinitionImportResponse {
  id: string;
  versionId: string;
  bpmnProcessId: string;
  name: string;
  resourceName: string;
  camundaDeploymentKey: number;
  camundaProcessDefinitionKey: number;
  version: number;
  status: ProcessDefinitionStatus;
  checksumSha256: string;
  importedBy: string;
  importedAt: string;
  warnings: string[];
}

/**
 * Port từ `ProcessInstanceOverviewDtos.java` — trạng thái runtime đọc từ Camunda, tách khỏi catalog
 * (PostgreSQL). `available=false` nghĩa là không gọi được Camunda: UI phải hiện "—", KHÔNG hiện 0.
 */
export interface RunningInstanceCountsResponse {
  available: boolean;
  message: string | null;
  countsByProcessId: Record<string, number>;
}

export interface CurrentStepResponse {
  elementId: string;
  name: string;
  type: string;
  startedAt: string | null;
  hasIncident: boolean;
}

export interface RunningInstanceResponse {
  processInstanceKey: string;
  businessId: string;
  version: number;
  startedAt: string | null;
  hasIncident: boolean;
  currentSteps: CurrentStepResponse[];
}

export interface RunningInstanceListResponse {
  available: boolean;
  message: string | null;
  bpmnProcessId: string;
  instances: RunningInstanceResponse[];
}

export type ProcessDefinitionDraftStatus = 'DRAFT' | 'VALID' | 'INVALID' | 'DEPLOYED';
export type BpmnIssueSeverity = 'ERROR' | 'WARNING' | 'SUGGESTION';

export interface BpmnLintIssue {
  code: string;
  severity: BpmnIssueSeverity;
  message: string;
  elementId: string | null;
  elementName: string | null;
}

/** Port từ `ProcessDefinitionDraftRevisionResponse.java` — snapshot bất biến của 1 revision draft. */
export interface ProcessDefinitionDraftRevisionResponse {
  id: string;
  revision: number;
  resourceName: string;
  bpmnProcessId: string;
  name: string;
  bpmnXml: string;
  checksumSha256: string;
  status: ProcessDefinitionDraftStatus;
  actor: string;
  createdAt: string;
}

export interface ProcessDefinitionDraftResponse {
  id: string;
  resourceName: string;
  bpmnProcessId: string;
  name: string;
  bpmnXml: string;
  checksumSha256: string;
  status: ProcessDefinitionDraftStatus;
  revision: number;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  validatedAt: string | null;
  deployedVersionId: string | null;
  revisions: ProcessDefinitionDraftRevisionResponse[];
}

export type ProcessDefinitionDraftSummaryResponse = Omit<
  ProcessDefinitionDraftResponse,
  'bpmnXml' | 'checksumSha256' | 'revisions'
>;

export interface ProcessDefinitionDraftValidationResponse {
  valid: boolean;
  revision: number;
  status: ProcessDefinitionDraftStatus;
  checksumSha256: string;
  warnings: string[];
  errors: string[];
  issues: BpmnLintIssue[];
}

/** Shape khớp `GlobalExceptionHandler.ImportErrorBody` — trả cho cả 400 (validation) và 422 (deploy). */
export interface ProcessImportErrorBody {
  message: string;
  errors: string[];
}

/**
 * Đối soát quy trình (`ProcessReadinessResponse` phía backend). Đây là nơi ba kiểm tra vốn định đặt
 * ở cổng deploy được chuyển tới sau khi chốt "cho deploy tự do, không chặn cứng": biểu mẫu có thật
 * không, vai trò có trong danh mục không, service task có worker không. Chẩn đoán thuần, không chặn.
 */
export type ReadinessStatus = 'ok' | 'warn' | 'error';

export interface UserTaskReadiness {
  elementId: string;
  name: string;
  formKey: string | null;
  formExists: boolean;
  candidateGroups: string[];
  unknownRoleCodes: string[];
  dynamicAssignment: boolean;
  boundActions: string[];
  missingActions: string[];
  status: ReadinessStatus;
  issues: string[];
}

export interface ServiceTaskReadiness {
  elementId: string;
  name: string;
  jobType: string | null;
  workerRegistered: boolean;
  status: ReadinessStatus;
  issue: string | null;
}

export interface ProcessReadinessResponse {
  bpmnProcessId: string;
  name: string;
  camundaVersion: number;
  source: ProcessDefinitionSource;
  status: ReadinessStatus;
  userTasks: UserTaskReadiness[];
  serviceTasks: ServiceTaskReadiness[];
  notes: string[];
}

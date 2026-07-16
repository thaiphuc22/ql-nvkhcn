/**
 * Port từ backend/.../web/dto/ProcessDefinition{Summary,Detail,Version,Import}Response.java.
 * Đây là hình chiếu API thật (`/api/process-definitions/*`, backend "BPMN import/deploy"
 * workstream DONE+VERIFIED 2026-07-15), KHÔNG phải mock.
 */

export type ProcessDefinitionStatus = 'DEPLOYED';

export interface ProcessDefinitionSummaryResponse {
  id: string;
  bpmnProcessId: string;
  name: string;
  latestVersion: number;
  resourceName: string;
  status: ProcessDefinitionStatus;
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

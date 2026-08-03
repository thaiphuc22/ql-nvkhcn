export type BusinessRuleStatus = 'ACTIVE' | 'DRAFT' | 'DISABLED';
export type BusinessRuleKind = 'DMN' | 'SERVICE';
export type BusinessRuleCategory = 'ROUTING' | 'CLASSIFICATION' | 'THRESHOLD' | 'OTHER';
export type DecisionValueType = 'number' | 'string' | 'boolean';
export type DecisionOperator = 'ANY' | 'EQ' | 'GTE' | 'GT' | 'LTE' | 'LT' | 'BETWEEN';
export type DmnDeployStatus = 'NOT_DEPLOYED' | 'DEPLOYED' | 'FAILED';
export type DmnHitPolicy = 'FIRST' | 'UNIQUE' | 'COLLECT';

export interface DecisionColumn {
  id: string;
  label: string;
  variable: string;
  type: DecisionValueType;
  /** typeRef DMN gốc, giữ nguyên để round-trip không làm mất kiểu chi tiết (integer/long/double). */
  typeRef?: string;
  options?: string[];
}

export interface DecisionCondition {
  operator: DecisionOperator;
  value: string | number | boolean | null;
  valueTo?: number | null;
}

export interface DecisionRow {
  id: string;
  conditions: DecisionCondition[];
  outputs: Array<string | number | boolean | null>;
}

/**
 * Một bảng quyết định trong DRD. Nhiều bảng có thể nối chuỗi: bảng này dùng output của bảng kia
 * làm cột điều kiện — quan hệ đó suy ra từ tên biến, `requires` chỉ giữ thêm cạnh phụ đọc từ
 * `<requiredDecision>` khi import DMN viết tay.
 */
export interface DecisionGridDecision {
  id: string;
  name: string;
  hitPolicy: DmnHitPolicy;
  requires: string[];
  inputs: DecisionColumn[];
  outputs: DecisionColumn[];
  rows: DecisionRow[];
}

/** Toàn bộ DRD: danh sách bảng quyết định theo đúng thứ tự tài liệu DMN. */
export type DecisionGrid = DecisionGridDecision[];

export interface BusinessRuleVersion {
  id: string;
  version: number;
  savedAt: string;
  savedBy: string;
  note: string;
  checksumSha256: string;
  deployStatus: DmnDeployStatus;
  camundaDeploymentKey: number | null;
  camundaDecisionKey: number | null;
  camundaDecisionId: string | null;
  camundaDecisionVersion: number | null;
  deployedAt: string | null;
  deployError: string | null;
  decisions?: DmnRuleVersionDecisionResponse[];
  dmnXml?: string;
  definition?: DecisionGrid;
}

export interface BusinessRule {
  id: string;
  code: string;
  name: string;
  description: string;
  category: BusinessRuleCategory;
  kind: BusinessRuleKind;
  appliedProcesses: string[];
  status: BusinessRuleStatus;
  version: number;
  activeVersion: number | null;
  updatedAt: string;
  updatedBy: string;
  definition?: DecisionGrid;
  versions?: BusinessRuleVersion[];
  serviceInputs?: string;
  serviceOutput?: string;
}

export interface DmnRuleSummaryResponse {
  id: string;
  code: string;
  name: string;
  description: string;
  category: BusinessRuleCategory;
  status: BusinessRuleStatus;
  appliedProcesses: string[];
  latestVersion: number;
  activeVersion: number | null;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export interface DmnRuleVersionDecisionResponse {
  decisionId: string;
  decisionName: string | null;
  camundaDecisionKey: number;
  camundaDecisionVersion: number;
  root: boolean;
}

export interface DmnRuleVersionSummaryResponse {
  id: string;
  version: number;
  checksumSha256: string;
  changeNote: string;
  createdBy: string;
  createdAt: string;
  deployStatus: DmnDeployStatus;
  camundaDeploymentKey: number | null;
  camundaDecisionKey: number | null;
  camundaDecisionId: string | null;
  camundaDecisionVersion: number | null;
  deployedAt: string | null;
  deployError: string | null;
  decisions: DmnRuleVersionDecisionResponse[];
}

export interface DmnRuleVersionResponse extends DmnRuleVersionSummaryResponse {
  ruleId: string;
  dmnXml: string;
}

export interface DmnRuleDetailResponse {
  rule: DmnRuleSummaryResponse;
  versions: DmnRuleVersionSummaryResponse[];
}

export interface CreateBusinessRuleInput {
  name: string;
  description: string;
  category: BusinessRuleCategory;
  kind: BusinessRuleKind;
  appliedProcesses: string[];
  actor: string;
}

export interface DmnDecisionResultResponse {
  evaluationKey: number;
  decisionId: string;
  decisionName: string | null;
  decisionVersion: number;
  outputs: Record<string, unknown>;
  matchedRules: Array<{
    ruleId: string;
    ruleIndex: number;
    outputs: Record<string, unknown>;
  }>;
}

/** Camunda trả kết quả của mọi decision đã chạy trong DRD, kể cả bảng trung gian. */
export interface DmnDecisionEvaluationResponse {
  decisions: DmnDecisionResultResponse[];
}

export const DMN_HIT_POLICY_LABEL: Record<DmnHitPolicy, string> = {
  FIRST: 'FIRST — lấy dòng khớp đầu tiên',
  UNIQUE: 'UNIQUE — chỉ được khớp đúng một dòng',
  COLLECT: 'COLLECT — gom tất cả dòng khớp',
};

export const BUSINESS_RULE_CATEGORY_LABEL: Record<BusinessRuleCategory, string> = {
  ROUTING: 'Định tuyến',
  CLASSIFICATION: 'Phân loại',
  THRESHOLD: 'Ngưỡng',
  OTHER: 'Khác',
};

export const BUSINESS_RULE_KIND_LABEL: Record<BusinessRuleKind, string> = {
  DMN: 'Bảng quyết định',
  SERVICE: 'Luật dịch vụ',
};

export const BUSINESS_RULE_STATUS_META: Record<
  BusinessRuleStatus,
  { label: string; color: string }
> = {
  ACTIVE: { label: 'Đang hiệu lực', color: 'success' },
  DRAFT: { label: 'Bản nháp', color: 'gold' },
  DISABLED: { label: 'Đã vô hiệu', color: 'default' },
};

export type BusinessRuleStatus = 'ACTIVE' | 'DRAFT' | 'DISABLED';
export type BusinessRuleKind = 'DMN' | 'SERVICE';
export type BusinessRuleCategory = 'ROUTING' | 'CLASSIFICATION' | 'THRESHOLD' | 'OTHER';
export type DecisionValueType = 'number' | 'string' | 'boolean';
export type DecisionOperator = 'ANY' | 'EQ' | 'GTE' | 'GT' | 'LTE' | 'LT' | 'BETWEEN';
export type DmnDeployStatus = 'NOT_DEPLOYED' | 'DEPLOYED' | 'FAILED';

export interface DecisionColumn {
  id: string;
  label: string;
  variable: string;
  type: DecisionValueType;
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

export interface DecisionTableDefinition {
  id: string;
  name: string;
  hitPolicy: 'FIRST';
  inputs: DecisionColumn[];
  outputs: DecisionColumn[];
  rows: DecisionRow[];
}

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
  dmnXml?: string;
  definition?: DecisionTableDefinition;
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
  definition?: DecisionTableDefinition;
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

export interface DmnDecisionEvaluationResponse {
  evaluationKey: number;
  decisionId: string;
  decisionVersion: number;
  outputs: Record<string, unknown>;
  matchedRules: Array<{
    ruleId: string;
    ruleIndex: number;
    outputs: Record<string, unknown>;
  }>;
}

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

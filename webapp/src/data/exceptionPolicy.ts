// Exception Policy Engine (mock) — controlled-exception-handling.md §4.2 (Exception Policy
// Engine), §9 (workflow_exception_policy) và action-availability-model.md §8 (exception_action_policy).
//
// Cùng khuôn với approvalMatrix.ts: một bảng luật CÓ THỂ CẤU HÌNH + resolver first-match,
// chạy client-side. Thay cho bảng tĩnh EXCEPTION_APPROVER_ROLES trước đây — giờ 3 câu hỏi
//   • ai được duyệt Chi tiết (requiredApproverRoleCodes),
//   • có bắt buộc lý do / căn cứ không (requireReason / requireEvidence),
//   • mỗi hồ sơ được áp dụng loại này tối đa bao nhiêu lần (maxTimesPerDossier),
// đều do policy quyết định thay vì hard-code. `condition_expression` trong doc ở mock này
// mới evaluate trên `cap` (cấp nhiệm vụ); process_code / task_definition_key / budget sẽ
// thêm khi có Exception Policy Engine thật (F4).

import type { Cap } from "./nhiemVu";
import type { DossierStatus } from "./dossiers";
import { EXCEPTION_TYPE_LABEL, type ExceptionType } from "./exceptions";
import { EXCEPTION_ACTION_CODE } from "./actionRegistry";

/** Ai được quyền DUYỆT Chi tiết theo cấp nhiệm vụ — khớp role code trong data/roles.ts. */
const APPROVER_BY_CAP: Record<Cap, string[]> = {
  "Cơ sở": ["TGD_VHT"],
  "Tập đoàn": ["BTGD_TD"],
};

/**
 * Một dòng chính sách Chi tiết. Điều kiện `cap = null` nghĩa là "bất kỳ cấp" (wildcard);
 * rule khớp khi mọi điều kiện được khai báo đều thoả context. Rule TỒN TẠI = loại ngoại
 * lệ này được PHÉP tại context đó (không có rule khớp = không cho xin — fail-closed).
 */
export type ExceptionObjectType = "DOSSIER" | "MISSION" | "PROPOSAL";
export type ExceptionTargetType = "STEP" | "STATUS" | "COMPLETE";

export interface ExceptionActionPolicy {
  id: string;
  /** Ten nghiep vu cua ngoai le do admin dat. */
  exceptionName: string;
  description?: string;
  /** Action button tu Action Registry duoc dung de xin ngoai le. */
  actionCode?: string;
  /** Phan loai ky thuat noi bo, suy ra tu actionCode de giu runtime mock hien co. */
  exceptionType: ExceptionType;
  // ── Điều kiện ────────────────────────────────────────────────────────────
  cap?: Cap | null;
  /** Quy trinh ap dung; null = moi quy trinh. */
  processCode?: string | null;
  /** Doi tuong nghiep vu phat sinh ngoai le; mock hien tap trung vao ho so. */
  objectType?: ExceptionObjectType;
  /** Trang thai doi tuong khi duoc xin ngoai le; null = moi trang thai. */
  objectStatus?: DossierStatus | null;
  /** BPMN/user-task noi nut xin ngoai le xuat hien; null = moi buoc. */
  sourceTaskKey?: string | null;
  /** Dich den khi ngoai le duoc duyet. */
  targetType?: ExceptionTargetType;
  targetTaskKey?: string | null;
  targetStatus?: DossierStatus | null;
  /** Dong ActionAvailabilityPolicy sinh kem de hien nut xin ngoai le. */
  availabilityPolicyId?: string | null;
  // ── Kết quả ──────────────────────────────────────────────────────────────
  /** Vai trò được duyệt Chi tiết (snapshot vào ExceptionRequest.approverRoleCodes). */
  requiredApproverRoleCodes: string[];
  requireReason: boolean;
  requireEvidence: boolean;
  /** Số lần tối đa được áp dụng loại Chi tiết này trên một hồ sơ. */
  maxTimesPerDossier: number;
  /** Ưu tiên: SỐ NHỎ = cao. First-match theo priority tăng dần. */
  priority: number;
  enabled: boolean;
}

/** Cấu hình riêng theo từng loại — mức "nhạy cảm" khác nhau nên yêu cầu căn cứ / giới hạn khác nhau. */
const PER_TYPE: Record<
  ExceptionType,
  { requireEvidence: boolean; maxTimesPerDossier: number }
> = {
  // Bỏ qua Hội đồng: nhạy cảm nhất — bắt buộc căn cứ, tối đa 1 lần / hồ sơ.
  BypassCouncil: { requireEvidence: true, maxTimesPerDossier: 1 },
  // Trình thẳng cấp cao hơn: cũng cần căn cứ, tối đa 1 lần.
  JumpToHigherApprover: { requireEvidence: true, maxTimesPerDossier: 1 },
  // Bỏ qua một bước thường: nhẹ hơn — không bắt buộc căn cứ, cho tối đa 2 lần.
  SkipStep: { requireEvidence: false, maxTimesPerDossier: 2 },
};

/**
 * Bảng chính sách mock = tích (ExceptionType × Cap). Sinh từ PER_TYPE + APPROVER_BY_CAP để
 * DRY nhưng vẫn là dữ liệu tĩnh có thể chỉnh tay / thay bằng bảng DB khi có backend.
 */
export const EXCEPTION_POLICIES: ExceptionActionPolicy[] = (
  Object.entries(PER_TYPE) as [
    ExceptionType,
    (typeof PER_TYPE)[ExceptionType],
  ][]
).flatMap(([exceptionType, cfg], ti) =>
  (Object.keys(APPROVER_BY_CAP) as Cap[]).map((cap, ci) => ({
    id: `EP-${String(ti * 10 + ci + 1).padStart(2, "0")}`,
    exceptionType,
    exceptionName: EXCEPTION_TYPE_LABEL[exceptionType],
    description: undefined,
    actionCode: EXCEPTION_ACTION_CODE[exceptionType],
    cap,
    processCode: null,
    objectType: "DOSSIER",
    objectStatus: "processing",
    sourceTaskKey: null,
    targetType: "STEP",
    targetTaskKey: null,
    targetStatus: null,
    availabilityPolicyId: null,
    requiredApproverRoleCodes: APPROVER_BY_CAP[cap],
    requireReason: true,
    requireEvidence: cfg.requireEvidence,
    maxTimesPerDossier: cfg.maxTimesPerDossier,
    priority: 20,
    enabled: true,
  })),
);

export interface ExceptionPolicyContext {
  exceptionType: ExceptionType;
  cap: Cap;
  processCode?: string;
  taskDefinitionKey?: string;
  objectType?: ExceptionObjectType;
  objectStatus?: DossierStatus;
}

/**
 * Trung tâm Exception Policy Engine (mock): (loại Chi tiết + cấp) → dòng policy áp dụng.
 * First-match theo priority tăng dần. Trả `null` khi không loại nào khớp = không được phép.
 * Khi có backend, đây là `POST /exception-policy/resolve`.
 */
export function resolveExceptionPolicy(
  policies: ExceptionActionPolicy[],
  ctx: ExceptionPolicyContext,
): ExceptionActionPolicy | null {
  return (
    policies
      .filter(
        (p) =>
          p.enabled &&
          p.exceptionType === ctx.exceptionType &&
          (p.cap == null || p.cap === ctx.cap) &&
          (p.processCode == null || p.processCode === ctx.processCode) &&
          (p.sourceTaskKey == null ||
            p.sourceTaskKey === ctx.taskDefinitionKey) &&
          (p.objectType == null ||
            p.objectType === (ctx.objectType ?? "DOSSIER")) &&
          (p.objectStatus == null ||
            ctx.objectStatus == null ||
            p.objectStatus === ctx.objectStatus),
      )
      .sort((a, b) => a.priority - b.priority)[0] ?? null
  );
}

/** Diễn giải điều kiện của policy cho UI (thay chuỗi `conditionExpression` minh hoạ cũ). */
export function exceptionConditionExpression(p: ExceptionActionPolicy): string {
  const parts = [
    "dossierStatus = processing",
    "no pending/approved exception request",
    "user in currentStep.vaiTroCodes",
    p.processCode ? `process = ${p.processCode}` : "process = any",
    p.sourceTaskKey ? `task = ${p.sourceTaskKey}` : "task = any",
    p.objectType ? `object = ${p.objectType}` : "object = DOSSIER",
    p.objectStatus ? `status = ${p.objectStatus}` : "status = any",
    p.cap ? `cap = ${p.cap}` : "cap = any",
    `appliedCount < maxTimesPerDossier(${p.maxTimesPerDossier})`,
  ];
  return parts.join(" AND ");
}

/** Hợp các vai trò được duyệt Chi tiết cho một cấp — dùng để gate quyền xem audit. */
export function exceptionApproverCodesForCap(cap: Cap): string[] {
  return [
    ...new Set(
      EXCEPTION_POLICIES.filter(
        (p) => p.enabled && (p.cap == null || p.cap === cap),
      ).flatMap((p) => p.requiredApproverRoleCodes),
    ),
  ];
}

// ── Version History & Audit ──

export type ExcAuditAction = "CREATE" | "UPDATE" | "DELETE" | "TOGGLE";

export interface ExceptionPolicyVersion {
  id: string;
  policyId: string;
  version: number;
  exceptionName: string;
  description?: string;
  actionCode?: string;
  exceptionType: ExceptionType;
  cap?: Cap | null;
  processCode?: string | null;
  objectType?: ExceptionObjectType;
  objectStatus?: DossierStatus | null;
  sourceTaskKey?: string | null;
  targetType?: ExceptionTargetType;
  targetTaskKey?: string | null;
  targetStatus?: DossierStatus | null;
  requiredApproverRoleCodes: string[];
  requireReason: boolean;
  requireEvidence: boolean;
  maxTimesPerDossier: number;
  priority: number;
  enabled: boolean;
  capNhat: string;
  nguoiCapNhat: string;
  changeNote: string;
}

export interface ExceptionPolicyAuditEntry {
  id: string;
  policyId: string;
  action: ExcAuditAction;
  version: number;
  actor: string;
  timestamp: string;
  detail: string;
}

export const EXC_AUDIT_ACTION_LABEL: Record<ExcAuditAction, string> = {
  CREATE: "Tạo mới",
  UPDATE: "Cập nhật",
  DELETE: "Xoá",
  TOGGLE: "Bật/Tắt",
};

export const EXC_AUDIT_ACTION_COLOR: Record<ExcAuditAction, string> = {
  CREATE: "green",
  UPDATE: "blue",
  DELETE: "red",
  TOGGLE: "orange",
};

export const SEED_EXC_VERSIONS: ExceptionPolicyVersion[] = [
  {
    id: "exv-ep01-v1",
    policyId: "EP-01",
    version: 1,
    exceptionName: "Bỏ qua Hội đồng",
    exceptionType: "BypassCouncil",
    cap: "Cơ sở",
    processCode: null,
    objectType: "DOSSIER",
    objectStatus: "processing",
    sourceTaskKey: null,
    targetType: "STEP",
    requiredApproverRoleCodes: ["TGD_VHT"],
    requireReason: true,
    requireEvidence: true,
    maxTimesPerDossier: 1,
    priority: 10,
    enabled: true,
    capNhat: "2026-06-10",
    nguoiCapNhat: "Quản trị hệ thống",
    changeNote: "Phiên bản đầu — TGD_VHT duyệt, bắt buộc căn cứ.",
  },
  {
    id: "exv-ep01-v2",
    policyId: "EP-01",
    version: 2,
    exceptionName: "Bỏ qua Hội đồng (Cơ sở)",
    exceptionType: "BypassCouncil",
    cap: "Cơ sở",
    processCode: null,
    objectType: "DOSSIER",
    objectStatus: "processing",
    sourceTaskKey: null,
    targetType: "STEP",
    requiredApproverRoleCodes: ["TGD_VHT"],
    requireReason: true,
    requireEvidence: true,
    maxTimesPerDossier: 1,
    priority: 10,
    enabled: true,
    capNhat: "2026-07-05",
    nguoiCapNhat: "Chuyên viên nghiệp vụ",
    changeNote:
      'Đổi tên thành "Bỏ qua Hội đồng (Cơ sở)" để phân biệt với cấp Tập đoàn.',
  },
];

export const SEED_EXC_AUDIT: ExceptionPolicyAuditEntry[] = [
  {
    id: "exa-ep01-1",
    policyId: "EP-01",
    action: "CREATE",
    version: 1,
    actor: "Quản trị hệ thống",
    timestamp: "2026-06-10 08:00",
    detail: "Tạo luật Chi tiết Bỏ qua Hội đồng (Cơ sở).",
  },
  {
    id: "exa-ep01-2",
    policyId: "EP-01",
    action: "UPDATE",
    version: 2,
    actor: "Chuyên viên nghiệp vụ",
    timestamp: "2026-07-05 14:00",
    detail: 'Đổi tên thành "Bỏ qua Hội đồng (Cơ sở)".',
  },
  {
    id: "exa-ep02-1",
    policyId: "EP-02",
    action: "CREATE",
    version: 1,
    actor: "Quản trị hệ thống",
    timestamp: "2026-06-10 08:30",
    detail: "Tạo luật Bỏ qua Hội đồng (Tập đoàn).",
  },
  {
    id: "exa-ep03-1",
    policyId: "EP-03",
    action: "CREATE",
    version: 1,
    actor: "Quản trị hệ thống",
    timestamp: "2026-06-10 09:00",
    detail: "Tạo luật Trình thẳng cấp cao hơn (Cơ sở).",
  },
  {
    id: "exa-ep05-1",
    policyId: "EP-05",
    action: "CREATE",
    version: 1,
    actor: "Quản trị hệ thống",
    timestamp: "2026-06-10 09:30",
    detail: "Tạo luật Bỏ qua một bước (Cơ sở).",
  },
];

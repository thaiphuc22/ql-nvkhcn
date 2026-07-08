// Simulator Presets & Scenarios (Đợt 4) — mock/localStorage.
// BUILT_IN_PRESETS: preset mặc định cho các vai trò phổ biến.
// Saved scenarios lưu vào localStorage, keyed by id.

import type { ActionSurface } from "./actionPresentation";
import type { DossierStatus } from "./dossiers";
import type { Cap } from "./nhiemVu";
import { PERMISSIONS } from "./actionAvailabilityPolicy";

export interface SimulatorPreset {
  id: string;
  label: string;
  description: string;
  surface: ActionSurface;
  processCode: string;
  dossierStatus: DossierStatus;
  taskDefinitionKey?: string;
  cap: Cap;
  roleCodes: string[];
  perms: string[];
  isAdmin: boolean;
  hasExceptionTargets: boolean;
  canRequestOnCurrentStep: boolean;
  hasActiveException: boolean;
}

export const BUILT_IN_PRESETS: SimulatorPreset[] = [
  {
    id: "nguoi-nop",
    label: "Người nộp hồ sơ",
    description: "Chủ nhiệm đề tài nộp hồ sơ RD01.01",
    surface: "DOSSIER_DETAIL",
    processCode: "RD01.01",
    dossierStatus: "draft",
    taskDefinitionKey: "t1",
    cap: "Cơ sở",
    roleCodes: ["PM", "PA", "NNC"],
    perms: [
      PERMISSIONS.SUBMIT_DOSSIER,
      PERMISSIONS.ADD_COMMENT,
      PERMISSIONS.DOWNLOAD_DOCUMENT,
    ],
    isAdmin: false,
    hasExceptionTargets: true,
    canRequestOnCurrentStep: true,
    hasActiveException: false,
  },
  {
    id: "chuyen-vien-xu-ly",
    label: "Chuyên viên xử lý",
    description: "CQ_KHCN thẩm định hồ sơ RD01.01 bước t3",
    surface: "DOSSIER_DETAIL",
    processCode: "RD01.01",
    dossierStatus: "processing",
    taskDefinitionKey: "t3",
    cap: "Cơ sở",
    roleCodes: ["CQ_KHCN", "TP_CLKHCN"],
    perms: [
      PERMISSIONS.PROCESS_STEP,
      PERMISSIONS.REQUEST_EXCEPTION,
      PERMISSIONS.ADD_COMMENT,
      PERMISSIONS.DOWNLOAD_DOCUMENT,
      PERMISSIONS.VIEW_AUDIT,
    ],
    isAdmin: false,
    hasExceptionTargets: true,
    canRequestOnCurrentStep: true,
    hasActiveException: false,
  },
  {
    id: "lanh-dao-duyet",
    label: "Lãnh đạo duyệt",
    description: "TGĐ VHT phê duyệt RD01.01 bước t6",
    surface: "DOSSIER_DETAIL",
    processCode: "RD01.01",
    dossierStatus: "processing",
    taskDefinitionKey: "t6",
    cap: "Cơ sở",
    roleCodes: ["TGD_VHT"],
    perms: [
      PERMISSIONS.PROCESS_STEP,
      PERMISSIONS.ADD_COMMENT,
      PERMISSIONS.DOWNLOAD_DOCUMENT,
      PERMISSIONS.VIEW_AUDIT,
    ],
    isAdmin: false,
    hasExceptionTargets: false,
    canRequestOnCurrentStep: true,
    hasActiveException: false,
  },
  {
    id: "admin",
    label: "Admin",
    description: "Quản trị viên toàn quyền, không pin bước",
    surface: "DOSSIER_DETAIL",
    processCode: "RD01.01",
    dossierStatus: "processing",
    taskDefinitionKey: undefined,
    cap: "Cơ sở",
    roleCodes: [],
    perms: Object.values(PERMISSIONS),
    isAdmin: true,
    hasExceptionTargets: true,
    canRequestOnCurrentStep: true,
    hasActiveException: false,
  },
];

export interface SavedScenario {
  id: string;
  name: string;
  createdAt: string;
  preset: SimulatorPreset;
}

const LS_KEY = "simulator-scenarios";

export function loadScenarios(): SavedScenario[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as SavedScenario[]) : [];
  } catch {
    return [];
  }
}

export function saveScenario(
  name: string,
  preset: SimulatorPreset,
): SavedScenario[] {
  const scenarios = loadScenarios();
  const newScenario: SavedScenario = {
    id: `scenario-${Date.now()}`,
    name,
    createdAt: new Date().toISOString(),
    preset,
  };
  scenarios.push(newScenario);
  localStorage.setItem(LS_KEY, JSON.stringify(scenarios));
  return scenarios;
}

export function deleteScenario(id: string): SavedScenario[] {
  const scenarios = loadScenarios().filter((s) => s.id !== id);
  localStorage.setItem(LS_KEY, JSON.stringify(scenarios));
  return scenarios;
}

/** Xuất context hiện tại ra JSON để copy vào clipboard. */
export function exportContext(preset: SimulatorPreset): string {
  return JSON.stringify(preset, null, 2);
}

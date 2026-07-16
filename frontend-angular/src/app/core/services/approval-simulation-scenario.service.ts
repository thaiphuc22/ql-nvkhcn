import { Injectable } from '@angular/core';

import type { SlotCode } from '../models/approval-slot-catalog';
import type { ResolveResult } from '../models/approval-matrix';

export interface SavedApprovalScenario {
  id: string;
  name: string;
  slot: SlotCode;
  context: Record<string, unknown>;
  savedAt: string;
  result?: ResolveResult | null;
}

const LS_KEY = 'approval-matrix-simulation-scenarios';

/**
 * Lưu/khôi phục kịch bản Mô phỏng của Ma trận phê duyệt. Port tinh thần của
 * `loadScenarios`/`saveScenarios` trong webapp/src/components/SimulationPanel.tsx
 * (D17 Angular migration) — tách thành service riêng (React gọi localStorage
 * trực tiếp trong component) chỉ để panel mô phỏng unit-test được mà không đụng
 * `window.localStorage` trực tiếp trong spec, theo đúng cách gọi try/catch trực
 * tiếp mà `core/auth/auth.service.ts` đã dùng (không có wrapper chung nào khác
 * trong codebase để tái dùng).
 */
@Injectable({ providedIn: 'root' })
export class ApprovalSimulationScenarioService {
  load(): SavedApprovalScenario[] {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as SavedApprovalScenario[]) : [];
    } catch {
      return [];
    }
  }

  save(scenarios: SavedApprovalScenario[]): void {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(scenarios));
    } catch {
      /* bỏ qua nếu localStorage không khả dụng */
    }
  }
}

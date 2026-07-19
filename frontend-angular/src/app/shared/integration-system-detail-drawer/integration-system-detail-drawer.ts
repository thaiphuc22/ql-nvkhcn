import { Component, computed, effect, inject, input, output } from '@angular/core';

import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import {
  BUSINESS_OBJECT_LABEL,
  MAPPING_STATUS_META,
} from '../../core/models/integration-mapping';
import {
  INTEG_STATUS,
  JOB_OUTCOME,
  integrationSuccessRate,
  jobRunsForSystem,
  lastErrorAt,
  type IntegrationSystem,
} from '../../core/models/integration-system';
import { IntegrationMappingService } from '../../core/services/integration-mapping.service';
import { IntegrationSystemService } from '../../core/services/integration-system.service';

const SYS_VISUAL: Record<string, { icon: string; bg: string; color: string }> = {
  QLNS: { icon: 'team', bg: '#e6f4ff', color: '#0958d9' },
  MS: { icon: 'shopping-cart', bg: '#fff7e6', color: '#d46b08' },
  SAP: { icon: 'bank', bg: '#f9f0ff', color: '#531dab' },
  QLTS: { icon: 'database', bg: '#fffbe6', color: '#ad8b00' },
  PLM: { icon: 'apartment', bg: '#f6ffed', color: '#389e0d' },
  IAM: { icon: 'safety-certificate', bg: '#fff1f0', color: '#cf1322' },
};
const SYS_VISUAL_FALLBACK = { icon: 'api', bg: '#f5f3f3', color: '#5a6675' };

// Port của SystemDetailDrawer trong webapp/src/pages/IntegrationStatus.tsx — drawer
// "Xem chi tiết" một hệ tích hợp: thông tin kết nối + job/lỗi gần nhất + mapping.

@Component({
  selector: 'app-integration-system-detail-drawer',
  imports: [NzDrawerModule, NzEmptyModule, NzGridModule, NzIconModule, NzTableModule, NzTagModule, NzTypographyModule],
  templateUrl: './integration-system-detail-drawer.html',
  styleUrl: './integration-system-detail-drawer.scss',
})
export class IntegrationSystemDetailDrawer {
  private readonly systems = inject(IntegrationSystemService);
  private readonly mappings = inject(IntegrationMappingService);

  readonly system = input<IntegrationSystem | undefined>(undefined);
  readonly closed = output<void>();

  readonly statusMeta = INTEG_STATUS;
  readonly jobOutcomeMeta = JOB_OUTCOME;
  readonly businessObjectLabel = BUSINESS_OBJECT_LABEL;
  readonly mappingStatusMeta = MAPPING_STATUS_META;

  readonly visual = computed(() => SYS_VISUAL[this.system()?.key ?? ''] ?? SYS_VISUAL_FALLBACK);
  readonly successRate = computed(() => {
    const s = this.system();
    return s ? integrationSuccessRate(s) : null;
  });
  readonly jobs = computed(() => {
    const s = this.system();
    if (!s) return [];
    return jobRunsForSystem(this.systems.jobRunsFor(s.key), s.key).slice(0, 5);
  });
  readonly lastError = computed(() => {
    const s = this.system();
    return s ? lastErrorAt(this.systems.jobRunsFor(s.key), s.key) : undefined;
  });
  readonly systemMappings = computed(() => {
    const s = this.system();
    return s ? this.mappings.listForSystem(s.key) : [];
  });

  constructor() {
    effect(() => {
      const s = this.system();
      if (s) this.systems.loadJobRuns(s.key).subscribe();
    });
  }
}

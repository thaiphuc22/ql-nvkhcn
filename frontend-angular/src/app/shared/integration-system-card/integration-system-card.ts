import { Component, computed, input, output } from '@angular/core';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import {
  INTEG_STATUS,
  integrationSuccessRate,
  openIncidentCount,
  type IntegrationSystem,
  type JobRun,
} from '../../core/models/integration-system';

const SYS_VISUAL: Record<string, { icon: string; bg: string; color: string }> = {
  QLNS: { icon: 'team', bg: '#e6f4ff', color: '#0958d9' },
  MS: { icon: 'shopping-cart', bg: '#fff7e6', color: '#d46b08' },
  SAP: { icon: 'bank', bg: '#f9f0ff', color: '#531dab' },
  QLTS: { icon: 'database', bg: '#fffbe6', color: '#ad8b00' },
  PLM: { icon: 'apartment', bg: '#f6ffed', color: '#389e0d' },
  IAM: { icon: 'safety-certificate', bg: '#fff1f0', color: '#cf1322' },
};
const SYS_VISUAL_FALLBACK = { icon: 'api', bg: '#f5f3f3', color: '#5a6675' };

// Port của SystemCard trong webapp/src/pages/IntegrationStatus.tsx.

@Component({
  selector: 'app-integration-system-card',
  imports: [NzIconModule, NzTooltipModule, NzTypographyModule],
  templateUrl: './integration-system-card.html',
  styleUrl: './integration-system-card.scss',
})
export class IntegrationSystemCard {
  readonly system = input.required<IntegrationSystem>();
  readonly jobRuns = input<JobRun[]>([]);

  readonly connect = output<void>();
  readonly disconnect = output<void>();
  readonly detail = output<void>();

  readonly statusMeta = INTEG_STATUS;

  readonly visual = computed(() => SYS_VISUAL[this.system().key] ?? SYS_VISUAL_FALLBACK);
  readonly connected = computed(() => this.system().trangThai !== 'down');
  readonly successRate = computed(() => integrationSuccessRate(this.system()));
  readonly openIncidents = computed(() => openIncidentCount(this.jobRuns(), this.system().key));
}

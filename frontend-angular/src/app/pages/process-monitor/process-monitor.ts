import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert'; import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card'; import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDrawerModule } from 'ng-zorro-antd/drawer'; import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input'; import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin'; import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs'; import { NzTagModule } from 'ng-zorro-antd/tag';
import { ProcessMonitorInstance, ProcessMonitorStats } from '../../core/models/process-monitor';
import { ProcessMonitorService } from '../../core/services/process-monitor.service';
import { SimpleBarChartComponent, type BarChartItem } from '../../shared/simple-bar-chart/simple-bar-chart';
import {
  INSIGHT_CONFIDENCE_COLOR,
  INSIGHT_CONFIDENCE_LABEL,
  INSIGHT_KIND_LABEL,
  OPTIMIZE_BOTTLENECKS,
  OPTIMIZE_CYCLE_BY_PROCESS,
  OPTIMIZE_DMN_RULE_HITS,
  OPTIMIZE_GATEWAY_RATES,
  OPTIMIZE_INSIGHTS,
  OPTIMIZE_OUTCOME_CORR,
  OPTIMIZE_SLA_KPI,
  bottleneckHeat,
} from '../../core/models/optimize-ops-insights';

const DANGER = '#ba1a1a';
const WARNING = '#daa520';
const APPROVE_GREEN = '#17935a';

@Component({ selector: 'app-process-monitor', imports: [DatePipe, FormsModule, NzAlertModule, NzButtonModule, NzCardModule,
  NzDescriptionsModule, NzDrawerModule, NzGridModule, NzInputModule, NzSelectModule, NzSpinModule, NzTableModule, NzTabsModule, NzTagModule,
  SimpleBarChartComponent],
  templateUrl: './process-monitor.html', styleUrl: './process-monitor.scss' })
export class ProcessMonitorPage {
  private readonly service = inject(ProcessMonitorService);
  readonly insightKindLabel = INSIGHT_KIND_LABEL;
  readonly insightConfidenceLabel = INSIGHT_CONFIDENCE_LABEL;
  readonly insightConfidenceColor = INSIGHT_CONFIDENCE_COLOR;
  readonly cycleByProcess = OPTIMIZE_CYCLE_BY_PROCESS;
  readonly bottlenecks = OPTIMIZE_BOTTLENECKS;
  readonly gatewayRates = OPTIMIZE_GATEWAY_RATES;
  readonly dmnRuleHits = OPTIMIZE_DMN_RULE_HITS;
  readonly outcomeCorr = OPTIMIZE_OUTCOME_CORR;
  readonly insights = OPTIMIZE_INSIGHTS;
  readonly bottleneckHeat = bottleneckHeat;
  readonly outcomeColor = { approve: APPROVE_GREEN, reject: DANGER, rework: WARNING };

  readonly bottleneckChart = computed<BarChartItem[]>(() =>
    this.bottlenecks.map((a) => ({ label: a.activity, value: a.avgHours })),
  );
  readonly slaChart = computed<BarChartItem[]>(() =>
    OPTIMIZE_SLA_KPI.map((r) => ({ label: r.process, value: r.rate, color: r.rate >= 20 ? DANGER : WARNING })),
  );
  readonly dmnHitsChart = computed<BarChartItem[]>(() =>
    this.dmnRuleHits.map((r) => ({ label: r.ruleId, value: r.hits })),
  );
  readonly loading = signal(true); readonly available = signal(true); readonly errorMessage = signal<string | null>(null);
  readonly observedAt = signal<string | null>(null); readonly stats = signal<ProcessMonitorStats>({ active: 0, incidents: 0, completed: 0, terminated: 0 });
  readonly allRows = signal<ProcessMonitorInstance[]>([]); readonly query = signal(''); readonly processFilter = signal<string | null>(null);
  readonly stateFilter = signal<string | null>(null); readonly detail = signal<ProcessMonitorInstance | null>(null);
  readonly processes = computed(() => [...new Set(this.allRows().map(row => row.bpmnProcessId))].sort());
  readonly rows = computed(() => { const q = this.query().trim().toLowerCase(); return this.allRows().filter(row => {
    if (this.processFilter() && row.bpmnProcessId !== this.processFilter()) return false;
    if (this.stateFilter() && row.state !== this.stateFilter()) return false;
    return !q || [row.processInstanceKey, row.businessId, row.bpmnProcessId, row.processName].some(value => value.toLowerCase().includes(q));
  }); });
  constructor() { this.reload(); }
  reload(): void { this.loading.set(true); this.errorMessage.set(null); this.service.snapshot().subscribe({
    next: response => { this.available.set(response.available); this.errorMessage.set(response.message); this.observedAt.set(response.observedAt);
      this.stats.set(response.stats); this.allRows.set(response.instances); this.loading.set(false); },
    error: (error: HttpErrorResponse) => { this.available.set(false); this.errorMessage.set(`Không tải được dữ liệu giám sát (HTTP ${error.status}).`); this.loading.set(false); },
  }); }
  stateLabel(state: string): string { return ({ ACTIVE: 'Đang chạy', COMPLETED: 'Hoàn tất', TERMINATED: 'Đã hủy', UNKNOWN: 'Không xác định' } as Record<string, string>)[state] ?? state; }
  stateColor(row: ProcessMonitorInstance): string { if (row.hasIncident) return 'error'; return ({ ACTIVE: 'processing', COMPLETED: 'success', TERMINATED: 'default', UNKNOWN: 'warning' } as Record<string, string>)[row.state] ?? 'default'; }
}

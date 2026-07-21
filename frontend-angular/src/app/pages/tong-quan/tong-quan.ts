import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { BACKEND_CONNECTION_LABEL } from '../../core/api-config';
import { BpmnViewerComponent } from '../../shared/bpmn-viewer/bpmn-viewer';
import { SimpleBarChartComponent, type BarChartItem } from '../../shared/simple-bar-chart/simple-bar-chart';
import { HoSoService } from '../../core/services/ho-so.service';
import { CAP_LABEL, HoSoResponse } from '../../core/models/ho-so';
import { NHOM } from '../../core/models/process-registry';
import { RD0101_BPMN } from '../../core/models/rd0101-bpmn';
import { RD0102_BPMN } from '../../core/models/rd0102-bpmn';
import { RD0201_BPMN } from '../../core/models/rd0201-bpmn';
import {
  AnalyticsPeriod,
  BPMN_HEAT_PROCESS_OPTIONS,
  BpmnHeatProcessMa,
  STATUS_COLOR,
  STATUS_LABEL,
  StatusBucket,
  getBpmnHeat,
  getOptimizeSnapshot,
  heatClass,
} from '../../core/models/optimize-analytics';

type PeriodMode = AnalyticsPeriod | 'range';

const HEAT_XML: Record<BpmnHeatProcessMa, string> = {
  'RD01.01': RD0101_BPMN,
  'RD01.02': RD0102_BPMN,
  'RD02.01': RD0201_BPMN,
};

/** Hồ sơ đang vượt SLA — bước hiện tại quá hạn so với hạn xử lý (`hanXuLy`, format dd/MM/yyyy). */
interface SlaOverdueItem {
  id: string;
  maNV: string;
  tenDeTai: string;
  step: string;
  /** Số ngày quá hạn (dương = quá hạn). */
  overdueDays: number;
  nguoi: string;
  cap: string;
}

function parseVnDate(value: string | null): Date | null {
  const m = value ? /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim()) : null;
  if (!m) return null;
  const date = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function computeSlaOverdue(dossiers: HoSoResponse[], today: Date): SlaOverdueItem[] {
  const items: SlaOverdueItem[] = [];
  for (const d of dossiers) {
    if (d.trangThai !== 'PROCESSING') continue;
    const currentStep = d.steps.find((s) => s.trangThai === 'CURRENT');
    const deadline = parseVnDate(currentStep?.hanXuLy ?? null);
    if (!currentStep || !deadline) continue;
    const overdueDays = Math.ceil((today.getTime() - deadline.getTime()) / 86_400_000);
    if (overdueDays < 0) continue;
    items.push({
      id: d.id,
      maNV: d.maNV,
      tenDeTai: d.tenDeTai,
      step: currentStep.ten,
      overdueDays,
      nguoi: currentStep.nguoi ?? currentStep.vaiTro,
      cap: CAP_LABEL[d.cap],
    });
  }
  return items.sort((a, b) => b.overdueDays - a.overdueDays);
}

/**
 * Dashboard lãnh đạo — port từ webapp/src/pages/Dashboard.tsx (nhánh tranngdt, frontend-mock React).
 * Route: `/tong-quan`. KPI/biểu đồ tổng hợp + heatmap BPMN vẫn là seed mock (chờ Optimize API thật,
 * F1 chưa xong) — CHỈ bảng "Hồ sơ vượt SLA" gọi `HoSoService` thật vì dữ liệu hồ sơ đã có ở Angular.
 */
@Component({
  selector: 'app-tong-quan',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    NzAlertModule,
    NzCardModule,
    NzGridModule,
    NzSegmentedModule,
    NzSelectModule,
    NzTagModule,
    NzTypographyModule,
    BpmnViewerComponent,
    SimpleBarChartComponent,
  ],
  templateUrl: './tong-quan.html',
  styleUrl: './tong-quan.scss',
})
export class TongQuanPage {
  private readonly router = inject(Router);
  private readonly hoSoService = inject(HoSoService);

  readonly capLabel = CAP_LABEL;
  readonly nhomOptions = Object.entries(NHOM).map(([k, ten]) => ({ value: k, label: `${k} — ${ten}` }));
  readonly heatProcessAllOptions = BPMN_HEAT_PROCESS_OPTIONS;

  readonly periodMode = signal<PeriodMode>('month');
  /** yyyy-MM-dd — khớp giá trị native `<input type="date">`. */
  readonly rangeFrom = signal('2026-06-01');
  readonly rangeTo = signal('2026-06-30');
  readonly processGroup = signal<string | undefined>(undefined);
  readonly heatProcess = signal<BpmnHeatProcessMa>('RD01.01');

  readonly hoSoLoading = signal(true);
  readonly hoSoError = signal<string | null>(null);
  readonly hoSoList = signal<HoSoResponse[]>([]);

  readonly period = computed<AnalyticsPeriod>(() => (this.periodMode() === 'quarter' ? 'quarter' : 'month'));
  readonly snap = computed(() => getOptimizeSnapshot(this.period()));

  readonly periodLabel = computed(() => {
    if (this.periodMode() === 'range') {
      return `${this.formatDate(this.rangeFrom())} – ${this.formatDate(this.rangeTo())}`;
    }
    return this.snap().kpi.periodLabel;
  });

  readonly heatProcessOptions = computed(() => {
    const group = this.processGroup();
    return group ? this.heatProcessAllOptions.filter((o) => o.ma.startsWith(group)) : this.heatProcessAllOptions;
  });

  readonly bpmnHeat = computed(() => getBpmnHeat(this.heatProcess()));
  readonly heatXml = computed(() => HEAT_XML[this.heatProcess()]);
  readonly heatProcessLabel = computed(
    () => this.heatProcessAllOptions.find((o) => o.ma === this.heatProcess())?.ten ?? this.heatProcess(),
  );
  readonly heatMarkers = computed(() => {
    const markers: Record<string, string> = {};
    for (const cell of this.bpmnHeat()) markers[cell.elementId] = heatClass(cell.intensity);
    return markers;
  });
  readonly sortedBpmnHeat = computed(() => [...this.bpmnHeat()].sort((a, b) => b.intensity - a.intensity));

  readonly totalInPeriod = computed(() => {
    const s = this.snap().kpi.byStatus;
    return s.processing + s.approved + s.rejected + s.cancelled;
  });

  readonly statusChart = computed<BarChartItem[]>(() => {
    const byStatus = this.snap().kpi.byStatus;
    return (Object.keys(STATUS_LABEL) as StatusBucket[]).map((k) => ({
      label: STATUS_LABEL[k],
      value: byStatus[k],
      color: STATUS_COLOR[k],
    }));
  });

  readonly capBudgetChart = computed<BarChartItem[]>(() =>
    this.snap().byCapBudget.map((x) => ({ label: `${x.cap} · ${x.budgetBand}`, value: x.count })),
  );

  readonly stepLoadChart = computed<BarChartItem[]>(() =>
    this.snap().stepLoad.map((x) => ({ label: x.step, value: x.count })),
  );

  readonly topSlowStepsChart = computed<BarChartItem[]>(() =>
    this.snap().topSlowSteps.map((x) => ({ label: x.step, value: x.avgDays })),
  );

  readonly heatUnits = computed(() => [...new Set(this.snap().unitMetricHeat.map((x) => x.unit))]);
  readonly heatRows = computed(() => {
    const heat = this.snap().unitMetricHeat;
    const metrics = [...new Set(heat.map((x) => x.metric))];
    return metrics.map((metric) => ({
      metric,
      values: this.heatUnits().map((u) => heat.find((x) => x.unit === u && x.metric === metric)?.value ?? 0),
    }));
  });
  readonly heatRowMax = computed(() => this.heatRows().map((r) => Math.max(...r.values, 1)));

  readonly slaOverdueItems = computed<SlaOverdueItem[]>(() => {
    const items = computeSlaOverdue(this.hoSoList(), new Date());
    const handlers = this.snap().topHandlers;
    return items.map((item) => {
      let resolved = handlers.find((h) => h.name === item.nguoi)?.name;
      if (!resolved) {
        const prefix = item.nguoi.split(' ').slice(0, 2).join(' ');
        resolved = handlers.find((h) => h.name === item.nguoi || h.name.startsWith(prefix))?.name;
      }
      return { ...item, nguoi: resolved ?? item.nguoi };
    });
  });

  constructor() {
    this.reload();
    // Khi đổi nhóm quy trình: nếu quy trình heatmap đang chọn không còn thuộc nhóm → chọn mục đầu.
    effect(() => {
      const options = this.heatProcessOptions();
      if (options.length && !options.some((o) => o.ma === this.heatProcess())) {
        this.heatProcess.set(options[0].ma);
      }
    });
  }

  reload(): void {
    this.hoSoLoading.set(true);
    this.hoSoError.set(null);
    this.hoSoService.list().subscribe({
      next: (list) => {
        this.hoSoList.set(list);
        this.hoSoLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.hoSoError.set(
          err.status === 0
            ? `Không kết nối được backend (${BACKEND_CONNECTION_LABEL}) — kiểm tra backend, proxy và Docker stack (infra/).`
            : `Lỗi tải danh sách hồ sơ cho bảng SLA (HTTP ${err.status}).`,
        );
        this.hoSoLoading.set(false);
      },
    });
  }

  goToHoSo(status?: 'PROCESSING' | 'APPROVED' | 'REJECTED'): void {
    void this.router.navigate(['/ho-so'], status ? { queryParams: { status } } : {});
  }

  openDossier(id: string): void {
    void this.router.navigate(['/ho-so', id]);
  }

  scrollToSla(): void {
    document.getElementById('tq-sla-overdue')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private formatDate(isoDate: string): string {
    const [y, m, d] = isoDate.split('-');
    return y && m && d ? `${d}/${m}/${y}` : isoDate;
  }
}

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NzIconService } from 'ng-zorro-antd/icon';

import { API_BASE_URL } from '../../core/api-config';
import { APPROVAL_MATRIX_ICONS, NAV_ICONS, SERVICE_TASK_ICONS } from '../../core/icons-provider';
import type { ServiceTaskApiBinding } from '../../core/services/service-task-config-api.service';
import type { ServiceTaskApiDefinitionDetail, ServiceTaskApiDefinitionSummary } from '../../core/services/service-task-config-api.service';
import { ServiceTaskConfigPage } from './service-task-config';

const realBinding: ServiceTaskApiBinding = {
  id: 'b5a83e97-1f42-4c68-8d09-6e5b7a2c4f18',
  bpmnProcessId: 'RD02_02',
  elementId: 'Check_ChuTruongTD',
  jobType: 'khcn.rd0202.check-chu-truong-td',
  definitionId: '0e1d6b8a-5c34-4f21-9f8e-2b7a4c9d1e30',
  definitionCode: 'CHECK_CHU_TRUONG_TD',
  bindingStatus: 'ACTIVE',
  processCode: 'RD02.02',
  taskName: 'Hệ thống — Kiểm tra QĐ phê duyệt chủ trương cấp TĐ',
  effectiveFrom: '2026-07-20',
  effectiveTo: null,
  createdBy: 'system-seed',
  updatedAt: '2026-07-20T08:58:58.612314Z',
};

const realDefinition: ServiceTaskApiDefinitionSummary = {
  id: realBinding.definitionId,
  code: realBinding.definitionCode,
  name: 'Kiểm tra QĐ phê duyệt chủ trương cấp TĐ',
  description: 'BR-RD0202-001',
  typeCode: 'EVALUATE_DECISION',
  status: 'ACTIVE',
  ownerModule: 'RD02',
  latestVersion: 1,
  activeVersion: 1,
  tags: ['rd02'],
  bindingCount: 1,
  updatedAt: realBinding.updatedAt,
};
const realDetail: ServiceTaskApiDefinitionDetail = {
  ...realDefinition, createdBy: 'system', createdAt: realDefinition.updatedAt, updatedBy: 'system',
  versions: [{ id: 'v1', version: 1, config: { typeCode: 'EVALUATE_DECISION', decisionCode: 'D1', resultVariable: 'result' }, inputMapping: [], outputMapping: [], errorPolicy: { timeoutMs: 30000 }, status: 'ACTIVE', changeNote: 'seed', createdBy: 'system', createdAt: realDefinition.updatedAt }],
  bindings: [realBinding],
};

describe('ServiceTaskConfigPage', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    TestBed.inject(NzIconService).addIcon(...NAV_ICONS, ...APPROVAL_MATRIX_ICONS, ...SERVICE_TASK_ICONS);
    http = TestBed.inject(HttpTestingController);
  });

  /** Trang luôn gọi /bindings lúc khởi tạo; mặc định trả rỗng cho các test không quan tâm. */
  function create(bindings: ServiceTaskApiBinding[] = [], definitions: ServiceTaskApiDefinitionSummary[] = [realDefinition]) {
    const fixture = TestBed.createComponent(ServiceTaskConfigPage);
    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/api/service-tasks`).flush(definitions);
    http.expectOne(`${API_BASE_URL}/api/service-tasks/bindings`).flush(bindings);
    fixture.detectChanges();
    return fixture;
  }

  it('renders rows from the backend definitions', () => {
    const fixture = create();
    expect(fixture.componentInstance.rows().length).toBeGreaterThan(0);
  }, 15_000);

  it('opens the create drawer with no editing definition', () => {
    const fixture = create();
    fixture.componentInstance.openCreate();
    expect(fixture.componentInstance.drawerOpen()).toBe(true);
    expect(fixture.componentInstance.editing()).toBeUndefined();
  });

  it('opens the edit drawer prefilled with the selected row definition', () => {
    const fixture = create();
    const row = fixture.componentInstance.rows()[0];
    fixture.componentInstance.openEdit(row);
    http.expectOne(`${API_BASE_URL}/api/service-tasks/${row.definition.id}`).flush(realDetail);
    expect(fixture.componentInstance.drawerOpen()).toBe(true);
    expect(fixture.componentInstance.editing()).toEqual(row.definition);
  });

  it('filters rows by status', () => {
    const fixture = create();
    fixture.componentInstance.statusFilter.set('ACTIVE');
    expect(fixture.componentInstance.filteredRows().every((r) => r.definition.status === 'ACTIVE')).toBe(true);
    fixture.componentInstance.clearFilters();
    expect(fixture.componentInstance.activeFilterCount).toBe(0);
  });

  it('duplicates a definition through the backend API', () => {
    const fixture = create();
    const row = fixture.componentInstance.rows()[0];
    fixture.componentInstance.duplicate(row);
    http.expectOne(`${API_BASE_URL}/api/service-tasks/${row.definition.id}`).flush(realDetail);
    const createRequest = http.expectOne(`${API_BASE_URL}/api/service-tasks`);
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body.code).toContain('CHECK_CHU_TRUONG_TD_COPY_');
    createRequest.flush(realDetail);
    http.expectOne(`${API_BASE_URL}/api/service-tasks`).flush([realDefinition]);
    http.expectOne(`${API_BASE_URL}/api/service-tasks/bindings`).flush([realBinding]);
  });

  it('opens the execution log detail drawer and clears it on close', () => {
    const fixture = create();
    const log = fixture.componentInstance.serviceTasks.executionLogs()[0];
    fixture.componentInstance.selectedLogId.set(log.id);
    expect(fixture.componentInstance.selectedLog()).toEqual(log);
    fixture.componentInstance.selectedLogId.set(undefined);
    expect(fixture.componentInstance.selectedLog()).toBeUndefined();
  });

  it('shows the real backend binding, not the in-memory seed, in the source banner', () => {
    const fixture = create([realBinding], [realDefinition]);
    expect(fixture.componentInstance.activeRealBindings().length).toBe(1);

    const banner = fixture.nativeElement.querySelector('.stc-real-source') as HTMLElement;
    expect(banner.textContent).toContain('CHECK_CHU_TRUONG_TD');
    expect(banner.textContent).toContain('khcn.rd0202.check-chu-truong-td');
    expect(banner.textContent).toContain('v1');
  });

  it('excludes non-ACTIVE bindings from the runtime count', () => {
    const fixture = create([realBinding, { ...realBinding, id: 'x', bindingStatus: 'INACTIVE' }]);
    expect(fixture.componentInstance.realBindings().length).toBe(2);
    expect(fixture.componentInstance.activeRealBindings().length).toBe(1);
  });

  it('warns instead of silently showing nothing when the backend is unreachable', () => {
    const fixture = TestBed.createComponent(ServiceTaskConfigPage);
    fixture.detectChanges();
    http.expectOne(`${API_BASE_URL}/api/service-tasks`)
      .error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
    fixture.detectChanges();

    expect(fixture.componentInstance.realConfigError()).toContain('/api/service-tasks');
    expect(fixture.componentInstance.realConfigLoading()).toBe(false);
  });
});

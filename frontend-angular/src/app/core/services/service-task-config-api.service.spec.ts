import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../api-config';
import {
  ServiceTaskConfigApiService,
  type ServiceTaskApiBinding,
  type ServiceTaskApiDefinitionSummary,
} from './service-task-config-api.service';

const summary: ServiceTaskApiDefinitionSummary = {
  id: '0e1d6b8a-5c34-4f21-9f8e-2b7a4c9d1e30',
  code: 'CHECK_CHU_TRUONG_TD',
  name: 'Kiểm tra QĐ phê duyệt chủ trương cấp TĐ',
  description: 'BR-RD0202-001',
  typeCode: 'EVALUATE_DECISION',
  status: 'ACTIVE',
  ownerModule: 'RD02',
  latestVersion: 1,
  activeVersion: 1,
  tags: ['rd02'],
  bindingCount: 1,
  updatedAt: '2026-07-20T08:58:58.612314Z',
};

const binding: ServiceTaskApiBinding = {
  id: 'b5a83e97-1f42-4c68-8d09-6e5b7a2c4f18',
  bpmnProcessId: 'RD02_02',
  elementId: 'Check_ChuTruongTD',
  jobType: 'khcn.rd0202.check-chu-truong-td',
  definitionId: summary.id,
  definitionCode: 'CHECK_CHU_TRUONG_TD',
  bindingStatus: 'ACTIVE',
  processCode: 'RD02.02',
  taskName: 'Hệ thống — Kiểm tra QĐ phê duyệt chủ trương cấp TĐ',
  effectiveFrom: '2026-07-20',
  effectiveTo: null,
  createdBy: 'system-seed',
  updatedAt: '2026-07-20T08:58:58.612314Z',
};

describe('ServiceTaskConfigApiService HTTP contract', () => {
  let service: ServiceTaskConfigApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ServiceTaskConfigApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists definitions without params when no filter is given', () => {
    let result: ServiceTaskApiDefinitionSummary[] | undefined;
    service.list().subscribe((value) => (result = value));

    const req = http.expectOne(`${API_BASE_URL}/api/service-tasks`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush([summary]);

    expect(result?.[0].code).toBe('CHECK_CHU_TRUONG_TD');
    expect(result?.[0].bindingCount).toBe(1);
  });

  it('sends status and trimmed q as query params', () => {
    service.list({ status: 'ACTIVE', q: '  rd02  ' }).subscribe();

    const req = http.expectOne(
      (r) => r.url === `${API_BASE_URL}/api/service-tasks` && r.params.get('q') === 'rd02',
    );
    expect(req.request.params.get('status')).toBe('ACTIVE');
    req.flush([]);
  });

  it('omits q when it is only whitespace', () => {
    service.list({ q: '   ' }).subscribe();

    const req = http.expectOne(`${API_BASE_URL}/api/service-tasks`);
    expect(req.request.params.has('q')).toBe(false);
    req.flush([]);
  });

  it('reads config as a parsed object, not a JSON string', () => {
    let config: unknown;
    service.get(summary.id).subscribe((detail) => (config = detail.versions[0].config));

    http.expectOne(`${API_BASE_URL}/api/service-tasks/${summary.id}`).flush({
      ...summary,
      createdBy: 'system-seed',
      createdAt: summary.updatedAt,
      updatedBy: 'system-seed',
      versions: [
        {
          id: '7c2f9a41-8d63-4e05-b1a7-3f6e8c0d2b54',
          version: 1,
          config: { resultVariable: 'dieuKienMacDinhDat', stubResult: true },
          inputMapping: [],
          outputMapping: [],
          errorPolicy: { maxRetry: 3 },
          status: 'ACTIVE',
          changeNote: 'Seed ban đầu',
          createdBy: 'system-seed',
          createdAt: summary.updatedAt,
        },
      ],
      bindings: [binding],
    });

    expect(config).toEqual({ resultVariable: 'dieuKienMacDinhDat', stubResult: true });
  });

  it('fetches bindings from a path the /{id} route must not swallow', () => {
    let result: ServiceTaskApiBinding[] | undefined;
    service.listBindings().subscribe((value) => (result = value));

    const req = http.expectOne(`${API_BASE_URL}/api/service-tasks/bindings`);
    expect(req.request.method).toBe('GET');
    req.flush([binding]);

    expect(result?.[0].jobType).toBe('khcn.rd0202.check-chu-truong-td');
  });
});

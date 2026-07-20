import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type { IntegrationSystem } from '../models/integration-system';
import { IntegrationSystemService } from './integration-system.service';

function system(overrides: Partial<IntegrationSystem> = {}): IntegrationSystem {
  return {
    key: 'SAP', ten: 'SAP (Tài chính – chi phí)', moTa: '', giaoThuc: 'SOAP/OData',
    kieu: 'job-worker', syncMode: 'batch', trangThai: 'down', lanDongBoCuoi: '01/07/2026 00:00',
    banGhi24h: 0, loi24h: 0, doTreMs: 0, hangDoi: 0, endpoint: 'https://sap-gw.vht.vn/odata/v2',
    ref: 'RD03.03 · NFR-INT-001', version: 0,
    ...overrides,
  };
}

describe('IntegrationSystemService HTTP integration', () => {
  let service: IntegrationSystemService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(IntegrationSystemService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads systems from backend into the signal cache', () => {
    service.load().subscribe();
    http.expectOne('/api/integration-systems').flush([system()]);

    expect(service.systems().map((s) => s.key)).toEqual(['SAP']);
  });

  it('loads job runs for a system into the cache, keyed by system', () => {
    service.loadJobRuns('SAP').subscribe();
    const request = http.expectOne('/api/integration-systems/SAP/job-runs');
    request.flush([{ id: 'j-1', jobType: 'sap:sync-budget', he: 'SAP', maHoSo: 'HS-2026-033', thoiDiem: '02/07/2026 14:06', ketQua: 'failed', retries: 0, thongDiep: 'HTTP 504' }]);

    expect(service.jobRunsFor('SAP')).toHaveLength(1);
    expect(service.jobRunsFor('MS')).toEqual([]);
  });

  it('connects with If-Match from the current cached version and actor header', () => {
    service.load().subscribe();
    http.expectOne('/api/integration-systems').flush([system({ version: 3 })]);

    service.connect(service.systems()[0], { apiKey: 'vht_live_xxxxxxxx', endpoint: 'https://x' }, 'alice').subscribe();
    const request = http.expectOne('/api/integration-systems/SAP/connect');
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('If-Match')).toBe('3');
    expect(request.request.headers.get('X-QTKHCN-Actor')).toContain('alice');
    request.flush(system({ trangThai: 'healthy', apiKeyTail: 'XXXX', version: 4 }));

    expect(service.systems()[0].trangThai).toBe('healthy');
    expect(service.systems()[0].version).toBe(4);
  });

  it('disconnects with If-Match and updates the cache', () => {
    service.load().subscribe();
    http.expectOne('/api/integration-systems').flush([system({ trangThai: 'healthy', version: 1 })]);

    service.disconnect(service.systems()[0], 'alice').subscribe();
    const request = http.expectOne('/api/integration-systems/SAP/disconnect');
    expect(request.request.headers.get('If-Match')).toBe('1');
    request.flush(system({ trangThai: 'down', version: 2 }));

    expect(service.systems()[0].trangThai).toBe('down');
  });
});

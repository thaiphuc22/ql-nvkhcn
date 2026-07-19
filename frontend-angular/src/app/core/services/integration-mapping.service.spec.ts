import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type { MappingConfig } from '../models/integration-mapping';
import { IntegrationMappingService } from './integration-mapping.service';

function mapping(overrides: Partial<MappingConfig> = {}): MappingConfig {
  return {
    id: 'map-sap-dutoan', he: 'SAP', doiTuong: 'DuToan', chieu: 'out', trangThai: 'active',
    version: 0, capNhatLuc: '2026-07-08 09:10', capNhatBoi: 'admin', fields: [], jobType: 'sap:sync-budget',
    ...overrides,
  };
}

describe('IntegrationMappingService HTTP integration', () => {
  let service: IntegrationMappingService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(IntegrationMappingService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads mappings into the signal cache', () => {
    service.load().subscribe();
    http.expectOne('http://localhost:8091/api/integration-mappings').flush([mapping()]);

    expect(service.list().map((m) => m.id)).toEqual(['map-sap-dutoan']);
    expect(service.listForSystem('SAP')).toHaveLength(1);
    expect(service.listForSystem('MS')).toEqual([]);
  });

  it('creates a mapping with actor header and prepends it to the cache', () => {
    service.create({ he: 'SAP', doiTuong: 'DuToan', chieu: 'out' }, 'alice').subscribe();
    const request = http.expectOne('http://localhost:8091/api/integration-mappings');
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('X-QTKHCN-Actor')).toContain('alice');
    request.flush(mapping({ id: 'map-sap-new', trangThai: 'draft' }));

    expect(service.get('map-sap-new')?.trangThai).toBe('draft');
  });

  it('saves fields with If-Match from the config version', () => {
    service.load().subscribe();
    http.expectOne('http://localhost:8091/api/integration-mappings').flush([mapping({ version: 2 })]);

    const config = service.get('map-sap-dutoan')!;
    service.saveFields(config, [], 'alice').subscribe();
    const request = http.expectOne('http://localhost:8091/api/integration-mappings/map-sap-dutoan/fields');
    expect(request.request.headers.get('If-Match')).toBe('2');
    request.flush(mapping({ trangThai: 'draft', version: 3 }));

    expect(service.get('map-sap-dutoan')?.version).toBe(3);
  });

  it('setStatus returns ok:false with errors and still caches the persisted mapping', () => {
    service.load().subscribe();
    http.expectOne('http://localhost:8091/api/integration-mappings').flush([mapping({ trangThai: 'draft', version: 1 })]);

    const config = service.get('map-sap-dutoan')!;
    let result: { ok: boolean; errors: string[] } | undefined;
    service.setStatus(config, 'active', 'alice').subscribe((r) => (result = r));
    const request = http.expectOne('http://localhost:8091/api/integration-mappings/map-sap-dutoan/status');
    expect(request.request.body).toEqual({ status: 'active' });
    request.flush({ ok: false, errors: ['Chưa có field mapping nào.'], mapping: mapping({ trangThai: 'error', version: 2 }) });

    expect(result?.ok).toBe(false);
    expect(service.get('map-sap-dutoan')?.trangThai).toBe('error');
  });

  it('removes with If-Match and drops the cached row', () => {
    service.load().subscribe();
    http.expectOne('http://localhost:8091/api/integration-mappings').flush([mapping({ version: 1 })]);

    const config = service.get('map-sap-dutoan')!;
    service.remove(config).subscribe();
    const request = http.expectOne('http://localhost:8091/api/integration-mappings/map-sap-dutoan');
    expect(request.request.method).toBe('DELETE');
    expect(request.request.headers.get('If-Match')).toBe('1');
    request.flush(null);

    expect(service.get('map-sap-dutoan')).toBeUndefined();
  });
});

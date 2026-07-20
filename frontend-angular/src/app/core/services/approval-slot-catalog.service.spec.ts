import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ApprovalSlotCatalogService, normalizeSlotCode } from './approval-slot-catalog.service';

const slot = { code: 'THAM_DINH', ten: 'Thẩm định', trangThai: 'active' as const, thuTu: 10,
  nhomQuyTrinh: ['RD01'], usageCount: 1, updatedAt: '2026-07-16T00:00:00Z', updatedBy: 'system' };

describe('normalizeSlotCode', () => {
  it('uppercases and turns spaces/dashes into underscores', () => {
    expect(normalizeSlotCode('xyz duyet')).toBe('XYZ_DUYET');
  });
});

describe('ApprovalSlotCatalogService HTTP integration', () => {
  let service: ApprovalSlotCatalogService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ApprovalSlotCatalogService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the catalog into its signal cache', () => {
    service.load().subscribe();
    http.expectOne('/api/approval-matrix/slots').flush([slot]);
    expect(service.findByCode('THAM_DINH')?.ten).toBe('Thẩm định');
  });

  it('normalizes a new code before POST', () => {
    service.create({ code: 'ra soat rui ro', ten: 'Rà soát rủi ro' }, 'tester').subscribe();
    const request = http.expectOne('/api/approval-matrix/slots');
    expect(request.request.body.code).toBe('RA_SOAT_RUI_RO');
    request.flush({ ...slot, code: 'RA_SOAT_RUI_RO', ten: 'Rà soát rủi ro', usageCount: 0 });
    expect(service.findByCode('RA_SOAT_RUI_RO')).toBeTruthy();
  });

  it('updates and changes status through backend endpoints', () => {
    service.load().subscribe();
    http.expectOne('/api/approval-matrix/slots').flush([slot]);
    service.update('THAM_DINH', { ten: 'Tên mới' }).subscribe();
    http.expectOne('/api/approval-matrix/slots/THAM_DINH').flush({ ...slot, ten: 'Tên mới' });
    service.setStatus('THAM_DINH', 'inactive', true).subscribe();
    const status = http.expectOne('/api/approval-matrix/slots/THAM_DINH/status?force=true');
    status.flush({ ...slot, ten: 'Tên mới', trangThai: 'inactive' });
    expect(service.findByCode('THAM_DINH')?.trangThai).toBe('inactive');
  });
});

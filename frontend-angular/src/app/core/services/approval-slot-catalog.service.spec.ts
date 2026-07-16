import { TestBed } from '@angular/core/testing';

import { ApprovalSlotCatalogService, normalizeSlotCode } from './approval-slot-catalog.service';

describe('normalizeSlotCode', () => {
  it('uppercases and turns spaces/dashes into underscores', () => {
    expect(normalizeSlotCode('xyz duyet')).toBe('XYZ_DUYET');
    expect(normalizeSlotCode('rà-soát')).toBe('RÀ_SOÁT');
  });
});

describe('ApprovalSlotCatalogService', () => {
  let service: ApprovalSlotCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApprovalSlotCatalogService);
  });

  it('seeds the store with the mock slot catalog', () => {
    expect(service.slots().length).toBeGreaterThan(0);
    expect(service.findByCode('THAM_DINH')?.ten).toContain('Thẩm định');
  });

  it('creates a slot with a normalized code', () => {
    const result = service.create({ code: 'ra soat rui ro', ten: 'Rà soát rủi ro' });

    expect(result.ok).toBe(true);
    expect(result.slot?.code).toBe('RA_SOAT_RUI_RO');
    expect(result.slot?.trangThai).toBe('active');
    expect(service.findByCode('RA_SOAT_RUI_RO')).toBeTruthy();
  });

  it('rejects a duplicate code even after normalization, without silently overwriting', () => {
    const before = service.slots().length;
    const result = service.create({ code: 'tham_dinh', ten: 'Trùng mã' });

    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toContain('trùng');
    expect(service.slots().length).toBe(before);
  });

  it('updates fields by code', () => {
    service.update('THAM_DINH', { ten: 'Thẩm định (đổi tên)' });
    expect(service.findByCode('THAM_DINH')?.ten).toBe('Thẩm định (đổi tên)');
  });

  it('sets status by code', () => {
    service.setStatus('THAM_DINH', 'inactive');
    expect(service.findByCode('THAM_DINH')?.trangThai).toBe('inactive');
  });
});

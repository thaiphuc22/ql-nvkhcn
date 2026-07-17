import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NzIconService } from 'ng-zorro-antd/icon';

import { APPROVAL_MATRIX_ICONS, NAV_ICONS } from '../../../core/icons-provider';
import { APPROVAL_MATRIX } from '../../../core/models/approval-matrix';
import { APPROVAL_SLOTS } from '../../../core/models/approval-slot-catalog';
import { ApprovalMatrixService } from '../../../core/services/approval-matrix.service';
import { ApprovalSlotCatalogService } from '../../../core/services/approval-slot-catalog.service';
import { ApprovalSlotCatalogTabPage } from './approval-slot-catalog-tab';

describe('ApprovalSlotCatalogTabPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    TestBed.inject(NzIconService).addIcon(...NAV_ICONS, ...APPROVAL_MATRIX_ICONS);
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(ApprovalMatrixService).load().subscribe();
    http.expectOne('http://localhost:8091/api/approval-matrix/rules').flush(APPROVAL_MATRIX.map((rule) => ({
      ...rule, domainCode: 'KHCN', version: rule.version ?? 1, updatedAt: '2026-07-16T00:00:00Z', updatedBy: 'system',
    })));
    TestBed.inject(ApprovalSlotCatalogService).load().subscribe();
    http.expectOne('http://localhost:8091/api/approval-matrix/slots').flush(APPROVAL_SLOTS.map((slot) => ({
      ...slot, usageCount: 0, updatedAt: '2026-07-16T00:00:00Z', updatedBy: 'system',
    })));
  });

  function create() {
    const fixture = TestBed.createComponent(ApprovalSlotCatalogTabPage);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the seeded slot catalog', () => {
    const fixture = create();
    expect(fixture.componentInstance.sortedSlots().length).toBeGreaterThan(0);
  });

  it('opens the create modal with a blank form', () => {
    const fixture = create();
    fixture.componentInstance.openCreate();

    expect(fixture.componentInstance.modalOpen()).toBe(true);
    expect(fixture.componentInstance.editing()).toBeNull();
    expect(fixture.componentInstance.canSave()).toBe(false);
  });

  it('creates a new slot and closes the modal', () => {
    const fixture = create();
    fixture.componentInstance.openCreate();
    fixture.componentInstance.formCode.set('rui ro moi');
    fixture.componentInstance.formTen.set('Rà soát rủi ro mới');

    fixture.componentInstance.save();
    const http = TestBed.inject(HttpTestingController);
    const request = http.expectOne('http://localhost:8091/api/approval-matrix/slots');
    request.flush({ ...request.request.body, trangThai: 'active', usageCount: 0, updatedAt: '2026-07-16T00:00:00Z', updatedBy: 'tester' });

    expect(fixture.componentInstance.modalOpen()).toBe(false);
    expect(fixture.componentInstance.slots().some((s) => s.code === 'RUI_RO_MOI')).toBe(true);
  });

  it('opens the edit modal prefilled from the existing slot', () => {
    const fixture = create();
    const slot = fixture.componentInstance.sortedSlots()[0];

    fixture.componentInstance.openEdit(slot);

    expect(fixture.componentInstance.editing()).toEqual(slot);
    expect(fixture.componentInstance.formCode()).toBe(slot.code);
    expect(fixture.componentInstance.formTen()).toBe(slot.ten);
  });

  it('reports zero usage for a slot with no referencing rules', () => {
    const fixture = create();
    expect(fixture.componentInstance.usage('PHAP_CHE_RASOAT')).toBe(0);
  });

  it('reports non-zero usage for a slot referenced by seeded rules', () => {
    const fixture = create();
    expect(fixture.componentInstance.usage('PHE_DUYET')).toBeGreaterThan(0);
  });
});

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NzIconService } from 'ng-zorro-antd/icon';

import { APPROVAL_MATRIX_ICONS, NAV_ICONS } from '../../core/icons-provider';
import { APPROVAL_MATRIX } from '../../core/models/approval-matrix';
import { APPROVAL_SLOTS } from '../../core/models/approval-slot-catalog';
import { ApprovalMatrixPage } from './approval-matrix';

describe('ApprovalMatrixPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    TestBed.inject(NzIconService).addIcon(...NAV_ICONS, ...APPROVAL_MATRIX_ICONS);
  });

  it('renders both tabs without throwing', () => {
    const fixture = TestBed.createComponent(ApprovalMatrixPage);
    expect(() => fixture.detectChanges()).not.toThrow();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/approval-matrix/rules').flush(APPROVAL_MATRIX.map((rule) => ({
      ...rule, domainCode: 'KHCN', version: rule.version ?? 1, updatedAt: '2026-07-16T00:00:00Z', updatedBy: 'system',
    })));
    http.expectOne('/api/approval-matrix/slots').flush(APPROVAL_SLOTS.map((slot) => ({
      ...slot, usageCount: 0, updatedAt: '2026-07-16T00:00:00Z', updatedBy: 'system',
    })));
    http.expectOne('/api/approval-matrix/analyze').flush([]);
    http.verify();
  }, 15_000);
});

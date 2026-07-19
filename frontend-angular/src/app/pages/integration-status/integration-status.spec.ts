import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NzIconService } from 'ng-zorro-antd/icon';

import {
  APPROVAL_MATRIX_ICONS,
  EFORM_ICONS,
  INTEGRATION_ICONS,
  NAV_ICONS,
  NHIEM_VU_ICONS,
  SERVICE_TASK_ICONS,
} from '../../core/icons-provider';
import { IntegrationStatusPage } from './integration-status';

function system(overrides: Record<string, unknown> = {}) {
  return {
    key: 'SAP', ten: 'SAP (Tài chính – chi phí)', moTa: '', giaoThuc: 'SOAP/OData',
    kieu: 'job-worker', syncMode: 'batch', trangThai: 'down', lanDongBoCuoi: '01/07/2026 00:00',
    banGhi24h: 0, loi24h: 18, doTreMs: 0, hangDoi: 7, endpoint: 'https://sap-gw.vht.vn/odata/v2',
    ref: 'RD03.03 · NFR-INT-001', version: 0,
    ...overrides,
  };
}

describe('IntegrationStatusPage', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    TestBed.inject(NzIconService).addIcon(
      ...NAV_ICONS,
      ...APPROVAL_MATRIX_ICONS,
      ...SERVICE_TASK_ICONS,
      ...EFORM_ICONS,
      ...NHIEM_VU_ICONS,
      ...INTEGRATION_ICONS,
    );
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function create() {
    const fixture = TestBed.createComponent(IntegrationStatusPage);
    fixture.detectChanges();
    http.expectOne('http://localhost:8091/api/internal-integration/status').flush({
      outboxPending: 2,
      outboxFailed: 0,
      latestSent: null,
      latestInboxByType: [{
        eventId: 'e-1', eventType: 'TASK_CREATED', hoSoId: 'HS-2026-001', processInstanceId: '1001',
        occurredAt: '2026-07-18T10:00:03+07:00', receivedAt: '2026-07-18T10:00:04+07:00',
      }],
      startFailedDossiers: [],
    });
    http.expectOne('http://localhost:8091/api/integration-systems').flush([system()]);
    http.expectOne('http://localhost:8091/api/integration-mappings').flush([]);
    http.expectOne('http://localhost:8091/api/integration-systems/SAP/job-runs').flush([]);
    fixture.detectChanges();
    return fixture;
  }

  it('loads systems and renders the KPI stats + system card', () => {
    const fixture = create();
    expect(fixture.componentInstance.stats()).toEqual({ total: 1, connected: 0, errors: 18, queued: 7 });
    expect(fixture.nativeElement.textContent).toContain('SAP');
  });

  it('shows the internal NV KHCN to Workflow integration separately', () => {
    const fixture = create();
    expect(fixture.componentInstance.internalHealth().label).toBe('Đang đồng bộ');
    expect(fixture.componentInstance.latestInternalEvent()?.eventType).toBe('TASK_CREATED');
    expect(fixture.nativeElement.textContent).toContain('Quản lý NV KHCN ↔ Quản lý quy trình');
  });

  it('opens the connect modal prefilled with the current endpoint', () => {
    const fixture = create();
    const cmp = fixture.componentInstance;
    cmp.openConnect(cmp.systems.systems()[0]);

    expect(cmp.target()?.key).toBe('SAP');
    expect(cmp.endpoint()).toBe('https://sap-gw.vht.vn/odata/v2');
  });

  it('rejects a short API key client-side before calling the backend', () => {
    const fixture = create();
    const cmp = fixture.componentInstance;
    cmp.openConnect(cmp.systems.systems()[0]);
    cmp.apiKey.set('short');
    cmp.endpoint.set('https://x');

    cmp.submitConnect();

    http.expectNone('http://localhost:8091/api/integration-systems/SAP/connect');
  });

  it('submits connect with a valid key and closes the modal on success', () => {
    const fixture = create();
    const cmp = fixture.componentInstance;
    cmp.openConnect(cmp.systems.systems()[0]);
    cmp.apiKey.set('vht_live_xxxxxxxx');
    cmp.endpoint.set('https://sap-gw.vht.vn/odata/v2');

    cmp.submitConnect();

    const request = http.expectOne('http://localhost:8091/api/integration-systems/SAP/connect');
    request.flush(system({ trangThai: 'healthy', apiKeyTail: 'XXXX', version: 1 }));

    expect(cmp.target()).toBeUndefined();
    expect(cmp.systems.systems()[0].trangThai).toBe('healthy');
  });

  it('opens and closes the detail drawer for a system', () => {
    const fixture = create();
    const cmp = fixture.componentInstance;
    cmp.openDetail(cmp.systems.systems()[0]);
    expect(cmp.detail()?.key).toBe('SAP');

    cmp.closeDetail();
    expect(cmp.detail()).toBeUndefined();
  });
});

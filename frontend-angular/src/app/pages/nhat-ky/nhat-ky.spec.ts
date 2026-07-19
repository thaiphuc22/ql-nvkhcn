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
import { NhatKyPage } from './nhat-ky';

function system(overrides: Record<string, unknown> = {}) {
  return {
    key: 'SAP', ten: 'SAP (Tài chính – chi phí)', moTa: '', giaoThuc: 'SOAP/OData',
    kieu: 'job-worker', syncMode: 'batch', trangThai: 'down', lanDongBoCuoi: '01/07/2026 00:00',
    banGhi24h: 0, loi24h: 18, doTreMs: 0, hangDoi: 7, endpoint: 'https://sap-gw.vht.vn/odata/v2',
    ref: 'RD03.03 · NFR-INT-001', version: 0,
    ...overrides,
  };
}

function jobRun(overrides: Record<string, unknown> = {}) {
  return {
    id: 'j-1', jobType: 'sap:sync-budget', he: 'SAP', maHoSo: 'HS-2026-033',
    thoiDiem: '02/07/2026 14:06', ketQua: 'failed', retries: 0,
    thongDiep: 'HTTP 504 timeout — tạo incident',
    ...overrides,
  };
}

describe('NhatKyPage', () => {
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
    const fixture = TestBed.createComponent(NhatKyPage);
    fixture.detectChanges();
    http.expectOne('http://localhost:8091/api/integration-systems').flush([system()]);
    http.expectOne('http://localhost:8091/api/integration-systems/SAP/job-runs').flush([jobRun()]);
    http.expectOne('http://localhost:8091/api/internal-integration/status').flush({
      outboxPending: 2,
      outboxFailed: 1,
      latestSent: {
        id: 'o-1', hoSoId: 'HS-2026-001', eventType: 'START_WORKFLOW',
        createdAt: '2026-07-18T10:00:00+07:00', sentAt: '2026-07-18T10:00:02+07:00',
      },
      latestInboxByType: [{
        eventId: 'e-1', eventType: 'TASK_CREATED', hoSoId: 'HS-2026-001', processInstanceId: '1001',
        occurredAt: '2026-07-18T10:00:03+07:00', receivedAt: '2026-07-18T10:00:04+07:00',
      }],
      startFailedDossiers: [{ hoSoId: 'HS-2026-099', reason: 'timeout' }],
    });
    fixture.detectChanges();
    return fixture;
  }

  it('filters flow-log events by hồ sơ and event type (mock Zeebe history)', () => {
    const fixture = create();
    const cmp = fixture.componentInstance;

    cmp.fHoSo.set('HS-2026-018');
    expect(cmp.flowEvents().every((e) => e.maHoSo === 'HS-2026-018')).toBe(true);
    expect(cmp.flowStats().total).toBe(9);
    expect(cmp.flowStats().services).toBe(1);

    cmp.fType.set('incident');
    cmp.fHoSo.set('HS-2026-033');
    expect(cmp.flowEvents().length).toBe(1);
    expect(cmp.flowEvents()[0].loai).toBe('incident');
  });

  it('sorts flow-log events chronologically ascending', () => {
    const fixture = create();
    const cmp = fixture.componentInstance;
    cmp.fHoSo.set('HS-2026-018');
    const times = cmp.flowEvents().map((e) => e.thoiDiem);
    expect(times).toEqual([...times].sort());
  });

  it('loads job runs from the real backend per system and merges them cross-hồ sơ', () => {
    // Nhật ký tích hợp là tab thứ 2 của nz-tabs — không render vào DOM khi chưa active,
    // nên assert qua state (allJobRuns/jobStats) thay vì nativeElement.textContent.
    const cmp = create().componentInstance;

    expect(cmp.allJobRuns().length).toBe(1);
    expect(cmp.allJobRuns()[0].jobType).toBe('sap:sync-budget');
    expect(cmp.jobStats()).toEqual({ total: 1, failed: 1, retry: 0 });
  });

  it('filters the integration-log table by hệ and kết quả', () => {
    const fixture = create();
    const cmp = fixture.componentInstance;

    cmp.fHe.set('SAP');
    expect(cmp.jobRows().length).toBe(1);

    cmp.fKetQua.set('success');
    expect(cmp.jobRows().length).toBe(0);
  });

  it('loads the internal Ho So to Workflow channel status separately from external integrations', () => {
    const status = create().componentInstance.internalStatus();
    expect(status?.outboxPending).toBe(2);
    expect(status?.latestInboxByType[0].eventType).toBe('TASK_CREATED');
    expect(status?.startFailedDossiers[0].hoSoId).toBe('HS-2026-099');
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { NzIconService } from 'ng-zorro-antd/icon';

import {
  APPROVAL_MATRIX_ICONS,
  EFORM_ICONS,
  INTEGRATION_ICONS,
  NAV_ICONS,
  NHIEM_VU_ICONS,
  SERVICE_TASK_ICONS,
} from '../../core/icons-provider';
import { AuthService } from '../../core/auth/auth.service';
import { MyTaskResponse } from '../../core/models/my-task';
import { WorklistPage } from './worklist';

function task(overrides: Partial<MyTaskResponse> = {}): MyTaskResponse {
  return {
    processInstanceKey: '2251799813685249',
    taskKey: '2251799813685250',
    taskDefinitionKey: 'Task_1',
    maHoSo: 'HS-2026-001',
    tenBuoc: 'Chủ nhiệm đề tài lập hồ sơ',
    assignee: null,
    candidateUsers: [],
    candidateGroups: ['PM'],
    createdAt: '2026-07-18T08:00:00Z',
    dueAt: '2020-01-01T00:00:00Z',
    formKey: null,
    ...overrides,
  };
}

describe('WorklistPage', () => {
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

  function create(list: MyTaskResponse[]) {
    const fixture = TestBed.createComponent(WorklistPage);
    fixture.detectChanges();
    const request = http.expectOne('http://localhost:8091/api/my-tasks');
    expect(request.request.headers.get('X-QTKHCN-User-Id')).toBe('pm@example.com');
    request.flush(list);
    fixture.detectChanges();
    return fixture;
  }

  it('uses the server-filtered /api/my-tasks response without client-side role filtering', () => {
    TestBed.inject(AuthService).login('pm@example.com', '123456');
    const list = [task(), task({ taskKey: '2', maHoSo: 'HS-2026-002', candidateGroups: ['HDKHCN'] })];
    const cmp = create(list).componentInstance;

    expect(cmp.tasks().map((t) => t.maHoSo)).toEqual(['HS-2026-001', 'HS-2026-002']);
  });

  it('counts overdue ISO due dates', () => {
    TestBed.inject(AuthService).login('pm@example.com', '123456');
    const list = [
      task(),
      task({ taskKey: '2', dueAt: '2099-01-01T00:00:00Z' }),
    ];
    const cmp = create(list).componentInstance;

    expect(cmp.overdueCount()).toBe(1);
    expect(cmp.isOverdue('2020-01-01T00:00:00Z')).toBe(true);
    expect(cmp.isOverdue('2099-01-01T00:00:00Z')).toBe(false);
    expect(cmp.isOverdue(null)).toBe(false);
  });

  it('renders assignee before candidate groups', () => {
    TestBed.inject(AuthService).login('pm@example.com', '123456');
    const cmp = create([task({ assignee: 'pm@example.com' })]).componentInstance;

    expect(cmp.candidateLabel(cmp.tasks()[0])).toBe('pm@example.com');
  });

  it('keeps taskKey in the detail URL so refresh does not lose task context', () => {
    TestBed.inject(AuthService).login('pm@example.com', '123456');
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const selected = task();
    const cmp = create([selected]).componentInstance;

    cmp.openDetail(selected);

    expect(navigate).toHaveBeenCalledWith(['/ho-so', selected.maHoSo], {
      queryParams: { taskKey: selected.taskKey },
    });
  });
});

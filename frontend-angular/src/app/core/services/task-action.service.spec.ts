import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../api-config';
import { AuthService } from '../auth/auth.service';
import {
  TaskActionRequest,
  TaskActionResult,
  TaskAvailableActionsResponse,
} from '../models/task-action';
import { TaskActionService } from './task-action.service';

describe('TaskActionService', () => {
  let service: TaskActionService;
  let http: HttpTestingController;
  const base = `${API_BASE_URL}/api/tasks`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    TestBed.inject(AuthService).login('pm@example.com', '123456');
    service = TestBed.inject(TaskActionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads available actions for a taskKey', () => {
    const response: TaskAvailableActionsResponse = {
      taskKey: '2251799813697711',
      processInstanceKey: '2251799813697704',
      taskDefinitionKey: 'Task_1',
      actions: [{
        actionCode: 'APPROVE_STEP', label: 'Đồng ý duyệt', icon: 'check', uiGroup: 'PRIMARY', tone: 'primary',
        displayOrder: 10, helpText: null,
        requiresReason: false, requiresEvidence: false, requiresConfirm: true,
        formKey: 'phieu-phe-duyet', policyId: 'AP-01', policyVersion: 3,
      }],
    };
    service.availableActions(response.taskKey).subscribe((result) => expect(result).toEqual(response));
    const request = http.expectOne(`${base}/2251799813697711/available-actions`);
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('X-QTKHCN-User-Id')).toBe('pm@example.com');
    request.flush(response);
  });

  it('posts an action request with the locked contract fields and returns the async result', () => {
    const body: TaskActionRequest = {
      requestId: 'a5f0c2f0-0000-4000-8000-000000000001', taskKey: '2251799813697711', actionCode: 'RETURN_STEP',
      expectedPolicyId: 'AP-02', expectedPolicyVersion: 4,
      comment: 'Thiếu phụ lục tài chính', formData: { yKien: 'Bổ sung phụ lục' }, expectedTaskState: 'ACTIVE',
    };
    const result: TaskActionResult = {
      requestId: body.requestId, taskKey: '2251799813697711', processInstanceKey: '2251799813697704',
      status: 'ACCEPTED',
    };
    service.applyAction('2251799813697711', body).subscribe((response) => expect(response).toEqual(result));
    const request = http.expectOne(`${base}/2251799813697711/actions`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    expect(request.request.headers.get('X-QTKHCN-User-Id')).toBe('pm@example.com');
    request.flush(result);
  });

  it('forces path taskKey and a non-null formData into the backend request', () => {
    const body = {
      requestId: 'a5f0c2f0-0000-4000-8000-000000000002',
      taskKey: 'stale-task-key',
      actionCode: 'APPROVE_STEP' as const,
      expectedPolicyId: 'AP-01', expectedPolicyVersion: 3,
      comment: null,
      formData: undefined as unknown as Record<string, unknown>,
      expectedTaskState: 'ACTIVE',
    };

    service.applyAction('current-task-key', body).subscribe();
    const request = http.expectOne(`${base}/current-task-key/actions`);
    expect(request.request.body.taskKey).toBe('current-task-key');
    expect(request.request.body.formData).toEqual({});
    request.flush({ ...body, taskKey: 'current-task-key', formData: {}, status: 'ACCEPTED' });
  });

  it('generates a fresh UUID requestId per call', () => {
    const first = service.newRequestId();
    const second = service.newRequestId();
    expect(first).not.toBe(second);
    expect(first).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('saves and reloads a namespaced Form Bundle draft', () => {
    const draft = {
      actionCode: 'APPROVE_STEP' as const, expectedPolicyId: 'AP-01', expectedPolicyVersion: 3,
      outputNamespace: 'approval', data: { score: 9 },
    };
    service.saveFormDraft('2001', draft).subscribe();
    const save = http.expectOne(`${base}/2001/form-submissions/draft`);
    expect(save.request.method).toBe('POST');
    expect(save.request.body).toEqual(draft);
    save.flush({ id: '1', taskKey: '2001', taskDefinitionKey: 'Task_1', policyId: 'AP-01',
      bundleVersion: 1, formKey: 'form-1', formVersion: 2, outputNamespace: 'approval',
      actionCode: 'APPROVE_STEP', data: { score: 9 }, status: 'DRAFT', createdAt: '2026-07-30T09:00:00Z', completedAt: null });

    service.formSubmissions('2001').subscribe((items) => expect(items[0].status).toBe('DRAFT'));
    const load = http.expectOne(`${base}/2001/form-submissions`);
    expect(load.request.method).toBe('GET');
    load.flush([{ status: 'DRAFT' }]);
  });
});

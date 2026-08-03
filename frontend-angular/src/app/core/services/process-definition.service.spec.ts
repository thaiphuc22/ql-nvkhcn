import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { API_BASE_URL } from '../api-config';
import { ProcessDefinitionService } from './process-definition.service';
import {
  RunningInstanceCountsResponse,
  RunningInstanceListResponse,
} from '../models/process-definition';

describe('ProcessDefinitionService — runtime instance reads', () => {
  let service: ProcessDefinitionService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ProcessDefinitionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('reads running instance counts keyed by bpmnProcessId', () => {
    let received: RunningInstanceCountsResponse | undefined;
    service.runningInstanceCounts().subscribe((res) => (received = res));

    const request = http.expectOne(`${API_BASE_URL}/api/process-definitions/running-instances`);
    expect(request.request.method).toBe('GET');
    request.flush({ available: true, message: null, countsByProcessId: { RD01_01: 3 } });

    expect(received?.countsByProcessId['RD01_01']).toBe(3);
  });

  it('reads one process instances with their current steps', () => {
    let received: RunningInstanceListResponse | undefined;
    service.runningInstances('cat-1').subscribe((res) => (received = res));

    const request = http.expectOne(`${API_BASE_URL}/api/process-definitions/cat-1/running-instances`);
    expect(request.request.method).toBe('GET');
    request.flush({
      available: true,
      message: null,
      bpmnProcessId: 'RD01_01',
      instances: [
        {
          processInstanceKey: '2251799813685249',
          businessId: 'HS-2026-004',
          version: 3,
          startedAt: '2026-07-20T08:00:00Z',
          hasIncident: false,
          currentSteps: [
            {
              elementId: 'Task_2',
              name: 'Thẩm định hồ sơ',
              type: 'USER_TASK',
              startedAt: '2026-07-20T08:05:00Z',
              hasIncident: false,
            },
          ],
        },
      ],
    });

    expect(received?.instances[0].currentSteps[0].name).toBe('Thẩm định hồ sơ');
  });

  /** Camunda sập trả available=false (HTTP 200) — UI phải phân biệt được với "0 instance". */
  it('surfaces engine unavailability as data rather than an error', () => {
    let received: RunningInstanceCountsResponse | undefined;
    service.runningInstanceCounts().subscribe((res) => (received = res));

    http.expectOne(`${API_BASE_URL}/api/process-definitions/running-instances`).flush({
      available: false,
      message: 'Không đọc được trạng thái runtime từ Camunda: connection refused',
      countsByProcessId: {},
    });

    expect(received?.available).toBe(false);
    expect(received?.countsByProcessId).toEqual({});
  });
});

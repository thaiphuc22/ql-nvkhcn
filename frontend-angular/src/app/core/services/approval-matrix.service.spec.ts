import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { anyCondition } from '../models/approval-conditions';
import { groupAssignment, type ApprovalRule } from '../models/approval-matrix';
import { ApprovalMatrixService } from './approval-matrix.service';

function makeRule(overrides: Partial<ApprovalRule> = {}): ApprovalRule {
  return {
    id: 'AM-TEST', ten: 'Luật test', slot: 'THAM_DINH', conditions: anyCondition(),
    assignment: groupAssignment(['CQ_KHCN']), priority: 99, enabled: true, version: 1, ...overrides,
  };
}

function response(rule: ApprovalRule) {
  return { ...rule, domainCode: 'KHCN', version: rule.version ?? 1, updatedAt: '2026-07-16T00:00:00Z', updatedBy: 'tester' };
}

describe('ApprovalMatrixService HTTP integration', () => {
  let service: ApprovalMatrixService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ApprovalMatrixService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads rules from backend into the signal cache', () => {
    service.load().subscribe();
    http.expectOne('http://localhost:8091/api/approval-matrix/rules').flush([response(makeRule())]);
    expect(service.rules().map((rule) => rule.id)).toEqual(['AM-TEST']);
  });

  it('creates a rule with actor header and updates cache', () => {
    service.createRule(makeRule(), 'Người kiểm thử').subscribe();
    const request = http.expectOne('http://localhost:8091/api/approval-matrix/rules');
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('X-QTKHCN-Actor')).toContain('Ng%C6%B0%E1%BB%9Di');
    request.flush(response(makeRule()));
    expect(service.rules()[0].id).toBe('AM-TEST');
  });

  it('updates with optimistic If-Match and accepts the new server version', () => {
    service.updateRule(makeRule({ version: 3 }), 'tester').subscribe();
    const request = http.expectOne('http://localhost:8091/api/approval-matrix/rules/AM-TEST');
    expect(request.request.method).toBe('PUT');
    expect(request.request.headers.get('If-Match')).toBe('3');
    request.flush(response(makeRule({ version: 4, ten: 'Luật đã sửa' })));
    expect(service.rules()[0].version).toBe(4);
  });

  it('deletes with If-Match and removes the cached row', () => {
    service.createRule(makeRule()).subscribe();
    http.expectOne('http://localhost:8091/api/approval-matrix/rules').flush(response(makeRule()));
    service.removeRule(makeRule(), 'tester').subscribe();
    const request = http.expectOne('http://localhost:8091/api/approval-matrix/rules/AM-TEST');
    expect(request.request.headers.get('If-Match')).toBe('1');
    request.flush(null);
    expect(service.rules()).toEqual([]);
  });

  it('calls backend resolve and maps user IDs to the organization directory', () => {
    service.load().subscribe();
    http.expectOne('http://localhost:8091/api/approval-matrix/rules').flush([response(makeRule())]);
    let matched: string | undefined;
    service.resolve({ slot: 'THAM_DINH', cap: 'CS' }).subscribe((result) => matched = result.matchedRule?.id);
    const request = http.expectOne('http://localhost:8091/api/approval-matrix/resolve');
    expect(request.request.body.context.capNhiemVu).toBe('CS');
    request.flush({
      matchedRuleId: 'AM-TEST', mode: 'ANY_ONE',
      approvers: [{ userId: 'U-003', viaRoleCode: 'CQ_KHCN', viaTargetType: 'GROUP', placeholder: false }],
      reason: 'matched', warnings: [],
      audit: { context: { capNhiemVu: 'CS' }, slot: 'THAM_DINH', matchedRuleId: 'AM-TEST', matchedRuleVersion: 1,
        mode: 'ANY_ONE', targetsBeforeOrg: [], finalUserIds: ['U-003'], delegationsApplied: [], skipped: [], at: '2026-07-16' },
    });
    expect(matched).toBe('AM-TEST');
  });
});

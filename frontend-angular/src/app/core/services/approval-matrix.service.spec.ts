import { TestBed } from '@angular/core/testing';

import { anyCondition } from '../models/approval-conditions';
import { groupAssignment, type ApprovalRule } from '../models/approval-matrix';
import { ApprovalMatrixService } from './approval-matrix.service';

function makeRule(overrides: Partial<ApprovalRule> = {}): ApprovalRule {
  return {
    id: 'AM-TEST',
    ten: 'Luật test',
    slot: 'THAM_DINH',
    conditions: anyCondition(),
    assignment: groupAssignment(['CQ_KHCN']),
    priority: 99,
    enabled: true,
    version: 1,
    ...overrides,
  };
}

describe('ApprovalMatrixService', () => {
  let service: ApprovalMatrixService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApprovalMatrixService);
  });

  it('seeds the store with the mock matrix', () => {
    expect(service.rules().length).toBeGreaterThan(0);
    expect(service.delegations().length).toBeGreaterThan(0);
  });

  it('creates a new rule and logs a CREATE audit entry', () => {
    const rule = makeRule();
    service.upsertRule(rule, 'Người kiểm thử');

    expect(service.rules().some((r) => r.id === 'AM-TEST')).toBe(true);
    const audit = service.getAudit('AM-TEST');
    expect(audit.length).toBe(1);
    expect(audit[0].action).toBe('CREATE');
    expect(audit[0].actor).toBe('Người kiểm thử');
  });

  it('snapshots the previous version and logs UPDATE when an existing rule changes', () => {
    service.upsertRule(makeRule(), 'Người kiểm thử');
    service.upsertRule(makeRule({ ten: 'Luật test (sửa)', version: 2 }), 'Người kiểm thử');

    expect(service.rules().find((r) => r.id === 'AM-TEST')?.ten).toBe('Luật test (sửa)');
    const versions = service.getVersions('AM-TEST');
    expect(versions.length).toBe(1);
    expect(versions[0].ten).toBe('Luật test');
    const audit = service.getAudit('AM-TEST');
    expect(audit.map((a) => a.action)).toEqual(['UPDATE', 'CREATE']);
  });

  it('toggles enabled state and logs a TOGGLE audit entry', () => {
    service.upsertRule(makeRule(), 'Người kiểm thử');
    service.toggleRule('AM-TEST', false, 'Người kiểm thử');

    expect(service.rules().find((r) => r.id === 'AM-TEST')?.enabled).toBe(false);
    expect(service.getAudit('AM-TEST')[0].action).toBe('TOGGLE');
  });

  it('removes a rule and logs a DELETE audit entry', () => {
    service.upsertRule(makeRule(), 'Người kiểm thử');
    service.removeRule('AM-TEST', 'Người kiểm thử');

    expect(service.rules().some((r) => r.id === 'AM-TEST')).toBe(false);
    expect(service.getAudit('AM-TEST')[0].action).toBe('DELETE');
  });
});

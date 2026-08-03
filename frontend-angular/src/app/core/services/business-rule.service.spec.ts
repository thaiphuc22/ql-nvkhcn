import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../api-config';
import { DecisionGrid, DmnRuleSummaryResponse } from '../models/business-rule';
import { BusinessRuleService } from './business-rule.service';

const summary: DmnRuleSummaryResponse = {
  id: '72bd6939-2c25-4437-a383-ae0bd64733aa',
  code: 'BR-APPROVAL',
  name: 'Phân cấp phê duyệt',
  description: 'Phân cấp theo dự toán.',
  category: 'ROUTING',
  status: 'DRAFT',
  appliedProcesses: ['RD02.01'],
  latestVersion: 0,
  activeVersion: null,
  createdBy: 'A',
  createdAt: '2026-07-16T10:00:00+07:00',
  updatedBy: 'A',
  updatedAt: '2026-07-16T10:00:00+07:00',
};

/** DRD 2 bảng nối chuỗi: `level` do bảng approval sinh ra và là input của bảng hoiDong. */
const definition: DecisionGrid = [
  {
    id: 'approval',
    name: 'Phân cấp phê duyệt',
    hitPolicy: 'FIRST',
    requires: [],
    inputs: [{ id: 'i1', label: 'Dự toán', variable: 'budget', type: 'number' }],
    outputs: [{ id: 'o1', label: 'Cấp', variable: 'level', type: 'string' }],
    rows: [{ id: 'R1', conditions: [{ operator: 'GTE', value: 10 }], outputs: ['TẬP ĐOÀN'] }],
  },
  {
    id: 'hoiDong',
    name: 'Loại hội đồng',
    hitPolicy: 'UNIQUE',
    requires: [],
    inputs: [{ id: 'i2', label: 'Cấp', variable: 'level', type: 'string' }],
    outputs: [{ id: 'o2', label: 'Hội đồng', variable: 'hoiDong', type: 'string' }],
    rows: [
      { id: 'R2', conditions: [{ operator: 'EQ', value: 'TẬP ĐOÀN' }], outputs: ['HDXD_TAP_DOAN'] },
    ],
  },
];

describe('BusinessRuleService HTTP contract', () => {
  let service: BusinessRuleService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BusinessRuleService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the real lightweight rule list', () => {
    service.list().subscribe((rules) => {
      expect(rules[0].version).toBe(0);
      expect(rules[0].kind).toBe('DMN');
      expect(service.rules()).toEqual(rules);
    });

    const request = http.expectOne(`${API_BASE_URL}/api/dmn-rules`);
    expect(request.request.method).toBe('GET');
    request.flush([summary]);
  });

  it('serializes the grid to dmnXml and follows the save with a refreshed detail', () => {
    service
      .saveVersion(summary.id, definition, 'Khởi tạo', 'Nguyễn Văn A', 0)
      .subscribe((rule) => expect(rule.version).toBe(1));

    const save = http.expectOne(`${API_BASE_URL}/api/dmn-rules/${summary.id}/versions`);
    expect(save.request.method).toBe('POST');
    expect(save.request.body.expectedVersion).toBe(0);
    expect(save.request.body.dmnXml).toContain('<decision id="approval"');
    expect(save.request.body.dmnXml).toContain('<decision id="hoiDong"');
    expect(save.request.body.dmnXml).toContain('<requiredDecision href="#approval" />');
    expect(save.request.headers.get('X-QTKHCN-Actor')).toContain('Nguy%E1%BB%85n');
    save.flush({
      id: 'version-id',
      ruleId: summary.id,
      version: 1,
      dmnXml: save.request.body.dmnXml,
      checksumSha256: 'abc',
      changeNote: 'Khởi tạo',
      createdBy: 'Nguyễn Văn A',
      createdAt: summary.updatedAt,
    });

    const detail = http.expectOne(`${API_BASE_URL}/api/dmn-rules/${summary.id}`);
    detail.flush({
      rule: { ...summary, latestVersion: 1 },
      versions: [
        {
          id: 'version-id',
          version: 1,
          checksumSha256: 'abc',
          changeNote: 'Khởi tạo',
          createdBy: 'Nguyễn Văn A',
          createdAt: summary.updatedAt,
        },
      ],
    });
    const artifact = http.expectOne(`${API_BASE_URL}/api/dmn-rules/${summary.id}/versions/1`);
    artifact.flush({
      id: 'version-id',
      ruleId: summary.id,
      version: 1,
      dmnXml: save.request.body.dmnXml,
      checksumSha256: 'abc',
      changeNote: 'Khởi tạo',
      createdBy: 'Nguyễn Văn A',
      createdAt: summary.updatedAt,
    });
  });

  it('evaluates through the backend Camunda endpoint', () => {
    service.evaluate(summary.id, { budget: 10 }).subscribe((result) => {
      expect(result.decisions.map((decision) => decision.decisionId)).toEqual([
        'approval',
        'hoiDong',
      ]);
      expect(result.decisions[0].outputs['level']).toBe('TẬP ĐOÀN');
      expect(result.decisions[0].matchedRules[0].ruleId).toBe('R1');
      expect(result.decisions[1].outputs['hoiDong']).toBe('HDXD_TAP_DOAN');
    });

    const request = http.expectOne(`${API_BASE_URL}/api/dmn-rules/${summary.id}/evaluate`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ variables: { budget: 10 } });
    request.flush({
      decisions: [
        {
          evaluationKey: 30,
          decisionId: 'approval',
          decisionName: 'Phân cấp phê duyệt',
          decisionVersion: 1,
          outputs: { level: 'TẬP ĐOÀN' },
          matchedRules: [{ ruleId: 'R1', ruleIndex: 0, outputs: { level: 'TẬP ĐOÀN' } }],
        },
        {
          evaluationKey: 30,
          decisionId: 'hoiDong',
          decisionName: 'Loại hội đồng',
          decisionVersion: 1,
          outputs: { hoiDong: 'HDXD_TAP_DOAN' },
          matchedRules: [{ ruleId: 'R2', ruleIndex: 0, outputs: { hoiDong: 'HDXD_TAP_DOAN' } }],
        },
      ],
    });
  });
});

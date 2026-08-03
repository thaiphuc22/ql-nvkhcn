import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { API_BASE_URL } from '../api-config';
import { ProcessDefinitionDraftService } from './process-definition-draft.service';

describe('ProcessDefinitionDraftService', () => {
  let service: ProcessDefinitionDraftService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ProcessDefinitionDraftService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads draft summaries with encoded filters', () => {
    service.list({ status: 'DRAFT', bpmnProcessId: ' Process_RD0202 ', q: 'xét duyệt' }).subscribe();

    const request = http.expectOne(
      (candidate) => candidate.url === `${API_BASE_URL}/api/process-definition-drafts`
        && candidate.params.get('status') === 'DRAFT'
        && candidate.params.get('bpmnProcessId') === 'Process_RD0202'
        && candidate.params.get('q') === 'xét duyệt',
    );
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('sends expected revision when validating and deploying', () => {
    service.validate('draft-1', 4, 'Nguyễn Văn A').subscribe();
    const validate = http.expectOne(`${API_BASE_URL}/api/process-definition-drafts/draft-1/validate`);
    expect(validate.request.method).toBe('POST');
    expect(validate.request.body).toEqual({ expectedRevision: 4 });
    validate.flush({ valid: true, revision: 5, status: 'VALID', checksumSha256: 'a', warnings: [], errors: [], issues: [] });

    service.deploy('draft-1', 5, 'Nguyễn Văn A').subscribe();
    const deploy = http.expectOne(`${API_BASE_URL}/api/process-definition-drafts/draft-1/deploy`);
    expect(deploy.request.method).toBe('POST');
    expect(deploy.request.body).toEqual({ expectedRevision: 5 });
    deploy.flush({});
  });

  it('creates and updates editor drafts with XML and optimistic revision', () => {
    const content = {
      resourceName: 'Process_DEMO.bpmn',
      bpmnProcessId: 'Process_DEMO',
      name: 'Quy trình demo',
      bpmnXml: '<definitions />',
    };

    service.create(content, 'Nguyễn Văn A').subscribe();
    const create = http.expectOne(`${API_BASE_URL}/api/process-definition-drafts`);
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(content);
    expect(create.request.headers.get('X-QTKHCN-Actor')).toContain('Nguy%E1%BB%85n');
    create.flush({});

    service.update('draft-1', { expectedRevision: 3, ...content, name: 'Bản sửa' }, 'Nguyễn Văn A').subscribe();
    const update = http.expectOne(`${API_BASE_URL}/api/process-definition-drafts/draft-1`);
    expect(update.request.method).toBe('PUT');
    expect(update.request.body).toEqual({ expectedRevision: 3, ...content, name: 'Bản sửa' });
    update.flush({});
  });
});

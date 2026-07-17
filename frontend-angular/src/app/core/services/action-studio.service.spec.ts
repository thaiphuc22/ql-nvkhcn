import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../api-config';
import { ActionAvailabilityPolicy, ActionDefinition, ActionPresentation } from '../models/action-studio';
import { ActionStudioService } from './action-studio.service';

describe('ActionStudioService', () => {
  let service: ActionStudioService;
  let http: HttpTestingController;
  const base = `${API_BASE_URL}/api/action-studio`;

  const definition: ActionDefinition = {
    actionCode: 'APPROVE_STEP', actionName: 'Đồng ý duyệt', actionType: 'STANDARD', outcome: 'APPROVE',
    requiresConfirm: true, active: true, version: 2,
  };
  const presentation: ActionPresentation = {
    actionCode: 'APPROVE_STEP', label: 'Đồng ý duyệt', icon: 'thunderbolt', uiGroup: 'PRIMARY',
    tone: 'primary', order: 11, version: 2,
  };
  const policy: ActionAvailabilityPolicy = {
    id: 'AP-01', actionCode: 'APPROVE_STEP', surface: 'DOSSIER_DETAIL', processCode: 'RD01.01',
    taskDefinitionKey: 't2', dossierStatus: 'processing', allowedRoleCodes: ['TD'],
    requiredPermissions: ['PROCESS_STEP'], formKey: 'phieu-phe-duyet', displayOrder: 11,
    enabled: true, version: 3,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ActionStudioService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the backend configuration into shared signals', () => {
    service.load().subscribe();
    const request = http.expectOne(base);
    expect(request.request.method).toBe('GET');
    request.flush({
      definitions: [definition], presentations: [presentation], availabilityPolicies: [policy],
      exceptionPolicies: [], processes: [{ code: 'RD01.01', name: 'RD01', steps: [] }],
    });

    expect(service.definitions()[0].version).toBe(2);
    expect(service.availabilityPolicies()[0].id).toBe('AP-01');
    expect(service.processes()[0].code).toBe('RD01.01');
  });

  it('updates a policy with If-Match and actor then refreshes its cache', () => {
    seed();
    service.saveAvailability({ ...policy, enabled: false }, 'Lê Văn Cường').subscribe();
    const request = http.expectOne(`${base}/availability-policies/AP-01`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.headers.get('If-Match')).toBe('3');
    expect(request.request.headers.get('X-QTKHCN-Actor')).toContain('L%C3%AA%20V%C4%83n%20C%C6%B0%E1%BB%9Dng');
    request.flush({ ...policy, enabled: false, version: 4 });
    expect(service.availabilityPolicies()[0].enabled).toBe(false);
    expect(service.availabilityPolicies()[0].version).toBe(4);
  });

  it('creates and deletes policies through the REST contract', () => {
    const fresh = { ...policy, id: 'AP-NEW', version: undefined };
    service.saveAvailability(fresh).subscribe();
    const create = http.expectOne(`${base}/availability-policies`);
    expect(create.request.method).toBe('POST');
    create.flush({ ...fresh, version: 0 });
    expect(service.availabilityPolicies().some((item) => item.id === 'AP-NEW')).toBe(true);

    service.removeAvailability({ ...fresh, version: 0 }).subscribe();
    const remove = http.expectOne(`${base}/availability-policies/AP-NEW`);
    expect(remove.request.method).toBe('DELETE');
    expect(remove.request.headers.get('If-Match')).toBe('0');
    remove.flush(null);
    expect(service.availabilityPolicies()).toHaveLength(0);
  });

  it('uses backend simulation and reconcile instead of local seed resolution', () => {
    const context = {
      surface: 'DOSSIER_DETAIL' as const, processCode: 'RD01.01', taskDefinitionKey: 't2',
      dossierStatus: 'processing' as const, roleCodes: ['TD'], permissions: [], isAdmin: false,
    };
    service.simulate(context).subscribe((items) => expect(items[0].policyId).toBe('AP-01'));
    const simulate = http.expectOne(`${base}/simulate`);
    expect(simulate.request.method).toBe('POST');
    expect(simulate.request.body).toEqual(context);
    simulate.flush([{ ...definition, ...presentation, visible: true, enabled: false, policyId: 'AP-01', reasons: ['Thiếu quyền'], formKey: null }]);

    service.reconcile('RD01.01').subscribe((rows) => expect(rows[0].status).toBe('missing'));
    const reconcile = http.expectOne((request) => request.url === `${base}/reconcile` && request.params.get('processCode') === 'RD01.01');
    expect(reconcile.request.method).toBe('GET');
    reconcile.flush([{ processCode: 'RD01.01', stepKey: 't2', stepName: 'Thẩm định', outcome: 'APPROVE', actionCode: 'APPROVE_STEP', status: 'missing', policyId: null, reason: 'Thiếu' }]);
  });

  it('keeps action and presentation versions aligned after status mutation', () => {
    seed();
    service.toggleAction(definition, false, 'admin').subscribe();
    const request = http.expectOne(`${base}/actions/APPROVE_STEP/status`);
    expect(request.request.headers.get('If-Match')).toBe('2');
    request.flush({ ...definition, active: false, version: 3 });
    expect(service.definitions()[0].active).toBe(false);
    expect(service.presentations()[0].version).toBe(3);
  });

  function seed(): void {
    service.load().subscribe();
    http.expectOne(base).flush({
      definitions: [definition], presentations: [presentation], availabilityPolicies: [policy],
      exceptionPolicies: [], processes: [],
    });
  }
});

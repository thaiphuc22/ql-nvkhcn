import { TestBed } from '@angular/core/testing';

import { ServiceTaskService } from './service-task.service';

describe('ServiceTaskService', () => {
  let service: ServiceTaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceTaskService);
  });

  it('seeds definitions/versions/bindings/execution logs/audit entries', () => {
    expect(service.definitions().length).toBeGreaterThan(0);
    expect(service.versions().length).toBeGreaterThan(0);
    expect(service.bindings().length).toBeGreaterThan(0);
    expect(service.executionLogs().length).toBeGreaterThan(0);
    expect(service.auditEntries().length).toBeGreaterThan(0);
  });

  it('creates a definition with a DRAFT version 1 and audits the action', () => {
    const beforeCount = service.definitions().length;
    const id = service.createDefinition({
      code: 'TEST_TASK',
      name: 'Task kiểm thử',
      description: 'Mô tả',
      typeCode: 'SEND_NOTIFICATION',
      ownerModule: 'QA',
      actor: 'tester',
    });

    expect(service.definitions().length).toBe(beforeCount + 1);
    const definition = service.getDefinition(id);
    expect(definition?.status).toBe('DRAFT');
    const version = service.getVersions(id)[0];
    expect(version.versionNo).toBe(1);
    expect(service.auditEntries()[0].action).toBe('CREATE_DEFINITION');
  });

  it('validateVersion marks a CALL_API version invalid when the connector is unknown', () => {
    const id = service.createDefinition({
      code: 'CALL_UNKNOWN',
      name: 'Gọi connector chưa tồn tại',
      description: '',
      typeCode: 'CALL_API',
      ownerModule: 'QA',
      actor: 'tester',
    });
    const result = service.validateVersion(id, 1, 'tester');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('không tồn tại'))).toBe(true);
    expect(service.getDefinition(id)?.status).toBe('ERROR');
  });

  it('activateVersion promotes a valid version to ACTIVE and archives the previous one', () => {
    const definitionId = service.definitions()[0].id;
    const version = service.getVersions(definitionId)[0];

    const result = service.activateVersion(definitionId, version.versionNo, 'tester', 'test activate');

    expect(result.valid).toBe(true);
    expect(service.getDefinition(definitionId)?.status).toBe('ACTIVE');
    expect(service.getDefinition(definitionId)?.activeVersionNo).toBe(version.versionNo);
  });

  it('duplicateDefinition clones the definition and its latest version as a new draft', () => {
    const sourceId = service.definitions()[0].id;
    const duplicateId = service.duplicateDefinition(sourceId, 'tester');

    expect(duplicateId).not.toBeNull();
    const duplicate = service.getDefinition(duplicateId!);
    expect(duplicate?.status).toBe('DRAFT');
    expect(duplicate?.code).toContain('_COPY');
    expect(service.getVersions(duplicateId!).length).toBe(1);
  });

  it('bindTask deactivates the previous active binding for the same task key', () => {
    const definitionId = service.definitions()[0].id;
    const bindingId = service.bindTask({
      processCode: 'RD01.01',
      processVersion: '1.2',
      bpmnProcessId: 'Process_RD0101',
      taskDefinitionKey: 'svc-notify-approval',
      taskName: 'Thông báo hồ sơ đã phê duyệt',
      jobType: 'khcn.notification.send',
      serviceTaskDefinitionId: definitionId,
      actor: 'tester',
    });

    const newBinding = service.bindings().find((b) => b.id === bindingId);
    expect(newBinding?.bindingStatus).toBe('ACTIVE');
    const oldBinding = service.bindings().find((b) => b.id === 'stb-rd0101-notify');
    expect(oldBinding?.bindingStatus).toBe('INACTIVE');
  });

  it('runPreview resolves input mapping and returns a preview result', () => {
    const definition = service.definitions().find((d) => d.code === 'NOTIFY_DOSSIER_APPROVED')!;
    const version = service.getVersions(definition.id)[0];

    const preview = service.runPreview(definition.id, version.versionNo, undefined, 'tester');

    expect(preview).not.toBeNull();
    expect(preview?.resolvedInput['maHoSo']).toBeDefined();
  });

  it('retryExecution moves a FAILED log to RETRYING and bumps attemptNo', () => {
    const failedLog = service.executionLogs().find((l) => l.status === 'FAILED')!;
    const attemptBefore = failedLog.attemptNo;

    service.retryExecution(failedLog.id, 'tester');

    const updated = service.executionLogs().find((l) => l.id === failedLog.id);
    expect(updated?.status).toBe('RETRYING');
    expect(updated?.attemptNo).toBe(attemptBefore + 1);
  });

  it('manualResolveExecution marks a log MANUAL_RESOLVED with the given note', () => {
    const failedLog = service.executionLogs().find((l) => l.status === 'FAILED')!;

    service.manualResolveExecution(failedLog.id, 'tester', 'Đã xử lý tay.');

    const updated = service.executionLogs().find((l) => l.id === failedLog.id);
    expect(updated?.status).toBe('MANUAL_RESOLVED');
    expect(updated?.errorMessage).toBe('Đã xử lý tay.');
  });
});

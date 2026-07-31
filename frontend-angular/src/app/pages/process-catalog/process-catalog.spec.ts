import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NzIconService } from 'ng-zorro-antd/icon';
import { provideNzI18n, vi_VN } from 'ng-zorro-antd/i18n';
import { NzUploadFile } from 'ng-zorro-antd/upload';

import { AuthService } from '../../core/auth/auth.service';
import { NAV_ICONS, PROCESS_CATALOG_ICONS } from '../../core/icons-provider';
import {
  ProcessDefinitionSummaryResponse,
  ProcessSyncResponse,
} from '../../core/models/process-definition';
import { ProcessCatalogPage, nativeUploadFile } from './process-catalog';

describe('nativeUploadFile', () => {
  it('extracts the browser File from an NzUploadFile wrapper', () => {
    const original = new File(['<xml/>'], 'demo.bpmn', { type: 'application/xml' });
    const wrapper = { uid: '1', name: original.name, originFileObj: original } as NzUploadFile;

    expect(nativeUploadFile(wrapper)).toBe(original);
  });

  it('accepts the raw File passed by nzBeforeUpload', () => {
    const original = new File(['<xml/>'], 'demo.bpmn', { type: 'application/xml' });

    expect(nativeUploadFile(original as unknown as NzUploadFile)).toBe(original);
  });

  it('rejects metadata-only upload objects', () => {
    const wrapper = { uid: '1', name: 'demo.bpmn' } as NzUploadFile;

    expect(nativeUploadFile(wrapper)).toBeNull();
  });
});

describe('ProcessCatalogPage — đồng bộ từ Camunda', () => {
  let http: HttpTestingController;

  const appProcess: ProcessDefinitionSummaryResponse = {
    id: 'c1', bpmnProcessId: 'RD01_01', name: 'Xét duyệt chủ trương', latestVersion: 3,
    resourceName: 'rd0101.bpmn', status: 'DEPLOYED', source: 'APP', updatedAt: '2026-07-20T03:00:00Z',
  };
  const externalProcess: ProcessDefinitionSummaryResponse = {
    id: 'c2', bpmnProcessId: 'quy_trinh_ngoai', name: 'Quy trình vẽ ngoài app', latestVersion: 1,
    resourceName: 'ngoai.bpmn', status: 'DEPLOYED', source: 'EXTERNAL', updatedAt: '2026-07-28T03:00:00Z',
  };

  beforeAll(() => {
    globalThis.ResizeObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as typeof ResizeObserver;
  });

  afterEach(() => http.verify());

  /** Constructor gọi reload() -> 3 request song song; test nào cũng phải giải phóng cả 3. */
  function flushInitialLoad(processes: ProcessDefinitionSummaryResponse[]): void {
    http.expectOne('/api/process-definitions').flush(processes);
    http.expectOne('/api/process-definition-drafts').flush([]);
    http.expectOne('/api/process-definitions/running-instances')
      .flush({ available: true, message: null, countsByProcessId: {} });
  }

  function createPage(processes: ProcessDefinitionSummaryResponse[] = [appProcess]) {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideNzI18n(vi_VN)],
    });
    TestBed.inject(NzIconService).addIcon(...NAV_ICONS, ...PROCESS_CATALOG_ICONS);
    TestBed.inject(AuthService).login('pm@example.com', '123456');
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ProcessCatalogPage);
    flushInitialLoad(processes);
    fixture.detectChanges();
    return fixture;
  }

  const syncResult = (over: Partial<ProcessSyncResponse> = {}): ProcessSyncResponse => ({
    scanned: 2, imported: 1, alreadyKnown: 1,
    importedProcesses: [{
      catalogId: 'c2', versionId: 'v2', bpmnProcessId: 'quy_trinh_ngoai',
      name: 'Quy trình vẽ ngoài app', version: 1, newCatalog: true,
    }],
    failures: [], warnings: [], ...over,
  });

  it('nhập được quy trình mới thì tải lại danh mục và hiện tên quy trình vừa hút về', () => {
    const fixture = createPage();

    fixture.componentInstance.syncFromCamunda();
    const request = http.expectOne('/api/process-definitions/sync-from-camunda');
    expect(request.request.method).toBe('POST');
    request.flush(syncResult());
    // imported > 0 -> reload() chạy lại cả 3 request, lần này catalog đã có quy trình ngoài app.
    flushInitialLoad([appProcess, externalProcess]);
    fixture.detectChanges();

    expect(fixture.componentInstance.rawList().length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Quy trình vẽ ngoài app');
    expect(fixture.nativeElement.textContent).toContain('nhập mới 1');
  });

  /** Không có gì mới thì KHÔNG được gọi lại 3 request tải danh mục — `http.verify()` sẽ bắt lỗi này. */
  it('không tải lại danh mục khi Camunda không có quy trình nào mới', () => {
    const fixture = createPage();

    fixture.componentInstance.syncFromCamunda();
    http.expectOne('/api/process-definitions/sync-from-camunda')
      .flush(syncResult({ imported: 0, alreadyKnown: 2, importedProcesses: [] }));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('catalog đã có sẵn 2');
    expect(fixture.nativeElement.textContent).toContain('Không có quy trình nào mới trên Camunda');
  });

  /**
   * Một quy trình lỗi vẫn là 200 kèm `failures`. Banner phải nói ra cả hai vế, nếu nuốt phần lỗi thì
   * người dùng tưởng đã hút đủ.
   */
  it('hiện cả quy trình nhập được lẫn quy trình lỗi trong cùng một lượt', () => {
    const fixture = createPage();

    fixture.componentInstance.syncFromCamunda();
    http.expectOne('/api/process-definitions/sync-from-camunda').flush(syncResult({
      scanned: 3, alreadyKnown: 1,
      failures: [{ bpmnProcessId: 'quy_trinh_hong', message: 'Không đọc được XML' }],
    }));
    flushInitialLoad([appProcess, externalProcess]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('quy_trinh_ngoai');
    expect(fixture.nativeElement.textContent).toContain('quy_trinh_hong');
    expect(fixture.nativeElement.textContent).toContain('Không đọc được XML');
  });

  /**
   * Đối soát là chẩn đoán: mọi thứ đỏ vẫn là 200 kèm chi tiết. Test khoá cả URL (mã BPMN, không phải
   * UUID catalog) lẫn việc dữ liệu về đúng signal cho drawer.
   */
  it('đối soát nạp chẩn đoán theo mã BPMN chứ không theo id catalog', () => {
    const fixture = createPage();

    fixture.componentInstance.openReadiness(appProcess);
    const request = http.expectOne(
      '/api/process-definitions/by-bpmn-process-id/RD01_01/readiness',
    );
    expect(request.request.method).toBe('GET');
    request.flush({
      bpmnProcessId: 'RD01_01', name: 'Xét duyệt chủ trương', camundaVersion: 3, source: 'APP',
      status: 'error',
      userTasks: [{
        elementId: 'Duyet', name: 'Duyệt hồ sơ', formKey: 'phieu-khong-ton-tai', formExists: false,
        candidateGroups: ['TD_KHCN'], unknownRoleCodes: ['TD_KHCN'], dynamicAssignment: false,
        boundActions: [], missingActions: ['APPROVE_STEP'], status: 'error',
        issues: ['Biểu mẫu "phieu-khong-ton-tai" không có trong thư viện biểu mẫu.'],
      }],
      serviceTasks: [{
        elementId: 'Check', name: 'Kiểm tra', jobType: 'khcn.chua-ai-lam', workerRegistered: false,
        status: 'error', issue: 'Không có job worker nào lắng nghe.',
      }],
      notes: [],
    });

    expect(fixture.componentInstance.readinessLoading()).toBe(false);
    expect(fixture.componentInstance.readiness()?.status).toBe('error');
    expect(fixture.componentInstance.readiness()?.userTasks[0].unknownRoleCodes).toEqual(['TD_KHCN']);
    expect(fixture.componentInstance.readinessError()).toBeNull();
  });

  it('lỗi đối soát hiện trong drawer chứ không nuốt mất', () => {
    const fixture = createPage();

    fixture.componentInstance.openReadiness(appProcess);
    http.expectOne('/api/process-definitions/by-bpmn-process-id/RD01_01/readiness')
      .flush({ message: 'Quy trình chưa có version deploy thành công.' }, { status: 404, statusText: 'Not Found' });

    expect(fixture.componentInstance.readiness()).toBeNull();
    expect(fixture.componentInstance.readinessError()).toContain('chưa có version deploy');
  });

  it('màu và nhãn trạng thái đối soát nói đúng mức độ', () => {
    const page = createPage().componentInstance;

    expect(page.readinessColor('ok')).toBe('success');
    expect(page.readinessColor('warn')).toBe('warning');
    expect(page.readinessColor('error')).toBe('error');
    expect(page.readinessLabel('error')).toBe('Sẽ hỏng');
  });

  it('phân biệt nguồn quy trình trên bảng đã deploy', () => {
    const fixture = createPage([appProcess, externalProcess]);
    // Tab mặc định là "Bản nháp"; bảng đã deploy chỉ render ở tab 1.
    fixture.componentInstance.activeTabIndex.set(1);
    fixture.detectChanges();

    expect(fixture.componentInstance.rows().map((row) => row.source)).toEqual(['APP', 'EXTERNAL']);
    expect(fixture.nativeElement.textContent).toContain('Ngoài app');
    expect(fixture.nativeElement.textContent).toContain('Từ app');
  });
});

import { provideHttpClient } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { NzIconService } from 'ng-zorro-antd/icon';
import { provideNzI18n, vi_VN } from 'ng-zorro-antd/i18n';
import { BehaviorSubject } from 'rxjs';

import {
  APPROVAL_MATRIX_ICONS, EFORM_ICONS, NAV_ICONS, NHIEM_VU_ICONS, SERVICE_TASK_ICONS,
} from '../../core/icons-provider';
import { AuthService } from '../../core/auth/auth.service';
import { HoSoResponse } from '../../core/models/ho-so';
import { TaskAvailableActionsResponse } from '../../core/models/task-action';
import { SimulatedAction } from '../../core/models/action-studio';
import { HoSoDetailPage } from './ho-so-detail';

const dossier: HoSoResponse = {
  id: 'HS-2026-031', maNV: 'RD.2026.031', loai: 'CHU_TRUONG', quyTrinh: '',
  quyTrinhTen: 'Chưa vào quy trình', nguoiKhoiTao: 'ThS. Lê Thị Mai', ngayTao: '2026-07-02',
  trangThai: 'DRAFT', buocHienTai: 0, zeebeProcessInstanceKey: null,
  steps: [{
    buocIndex: 0, taskDefinitionKey: null, ten: 'Khởi tạo hồ sơ', vaiTro: 'Chủ nhiệm đề tài (PM)',
    vaiTroCodes: ['PM'], nguoi: 'ThS. Lê Thị Mai', trangThai: 'DONE', thoiDiem: '02/07/2026 09:30',
    yKien: null, hanXuLy: null, formKey: null,
  }],
  taiLieu: [
    { id: 1, ten: 'Thuyết minh đề tài.pdf', loai: 'PDF', version: 0, contentType: null, sizeBytes: null, hasContent: false },
    { id: 2, ten: 'Dự toán PL1-PL6.xlsx', loai: 'Excel', version: 0, contentType: null, sizeBytes: null, hasContent: false },
  ],
  maDeTai: 'RD.2026.031', tenDeTai: 'Nghiên cứu nền tảng xử lý tín hiệu số dùng chung cho radar',
  chuNhiem: 'ThS. Lê Thị Mai', donVi: 'TT Nghiên cứu Vô tuyến', thoiGianThucHien: '09/2026 – 09/2027',
  duToan: '2.750.000.000 đ', cap: 'CS',
  hoiDongXetDuyet: [], tomTatAi: null,
};

const processingDossier: HoSoResponse = {
  ...dossier,
  trangThai: 'PROCESSING', quyTrinh: 'RD01.01', quyTrinhTen: 'Xét duyệt Chủ trương cấp Cơ sở', buocHienTai: 1,
  steps: [
    dossier.steps[0],
    {
      buocIndex: 1, taskDefinitionKey: 't2', ten: 'Thẩm định hồ sơ', vaiTro: 'Phòng Thẩm định',
      vaiTroCodes: ['TD'], nguoi: null, trangThai: 'CURRENT', thoiDiem: null,
      yKien: null, hanXuLy: null, formKey: 'phieu-phe-duyet',
    },
  ],
};

describe('HoSoDetailPage', () => {
  let http: HttpTestingController;
  let paramMap: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let queryParamMap: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  beforeAll(() => {
    globalThis.ResizeObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as typeof ResizeObserver;
  });

  afterEach(() => http.verify());

  function setup(id: string, queryParams: Record<string, string> = {}) {
    paramMap = new BehaviorSubject(convertToParamMap({ id }));
    queryParamMap = new BehaviorSubject(convertToParamMap(queryParams));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideNzI18n(vi_VN),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMap.asObservable(),
            queryParamMap: queryParamMap.asObservable(),
            snapshot: {
              paramMap: convertToParamMap({ id }),
              queryParamMap: convertToParamMap(queryParams),
            },
          },
        },
      ],
    });
    TestBed.inject(NzIconService).addIcon(
      ...NAV_ICONS, ...APPROVAL_MATRIX_ICONS, ...SERVICE_TASK_ICONS, ...EFORM_ICONS, ...NHIEM_VU_ICONS,
    );
    TestBed.inject(AuthService).login('pm@example.com', '123456');
    http = TestBed.inject(HttpTestingController);
  }

  function createPage() {
    setup(dossier.id);
    const fixture = TestBed.createComponent(HoSoDetailPage);
    const get = http.expectOne(`/api/ho-so/${dossier.id}`);
    expect(get.request.method).toBe('GET');
    get.flush(dossier);
    flushSimulation();
    fixture.detectChanges();
    return fixture;
  }

  function flushSimulation(actions: SimulatedAction[] = []) {
    const requests = http.match((request) => request.url.startsWith('/api/dossiers/')
      && request.url.endsWith('/available-actions'));
    if (!requests.length) return;
    expect(requests.length).toBe(1);
    const request = requests[0];
    expect(request.request.method).toBe('GET');
    request.flush({ dossierId: request.request.url.split('/')[3], actions });
  }

  function flushNoActiveTask() {
    http.expectOne(`/api/ho-so/${processingDossier.id}/active-task`)
      .flush(null, { status: 404, statusText: 'Not Found' });
  }

  it('renders live dossier fields and persisted documents', () => {
    const fixture = createPage();
    expect(fixture.nativeElement.textContent).toContain(dossier.tenDeTai);
    expect(fixture.nativeElement.textContent).toContain('Thuyết minh đề tài.pdf');
    expect(fixture.nativeElement.textContent).toContain(dossier.thoiGianThucHien);
  });

  it('shows an explicit error instead of silently hiding actions when availability fails', () => {
    setup(dossier.id);
    const fixture = TestBed.createComponent(HoSoDetailPage);
    http.expectOne(`/api/ho-so/${dossier.id}`).flush(dossier);
    http.expectOne(`/api/dossiers/${dossier.id}/available-actions`)
      .flush({ message: 'Identity service unavailable' }, { status: 503, statusText: 'Service Unavailable' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Không thể tải các thao tác hồ sơ');
    expect(fixture.nativeElement.textContent).toContain('Identity service unavailable');
  });

  it('renders the generated council and its members when present', () => {
    const withCouncil: HoSoResponse = {
      ...dossier,
      hoiDongXetDuyet: [{
        id: 1, maHoiDong: 'HD-2026-01', hoSoId: dossier.id, cap: 'CO_SO', sourceTaskDefinitionKey: 'T05',
        canCuPhapLy: 'QĐ số 01', createdAt: '2026-07-20T03:00:00Z', version: 0,
        thanhVien: [
          { hoTen: 'Nguyễn Văn A', userId: null, vaiTroTrongHoiDong: 'Chủ tịch' },
          { hoTen: 'Trần Thị B', userId: null, vaiTroTrongHoiDong: null },
        ],
      }],
    };
    setup(withCouncil.id);
    const fixture = TestBed.createComponent(HoSoDetailPage);
    http.expectOne(`/api/ho-so/${withCouncil.id}`).flush(withCouncil);
    flushSimulation();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Hội đồng xét duyệt');
    expect(text).toContain('Cấp Cơ sở');
    expect(text).toContain('QĐ số 01');
    expect(text).toContain('Nguyễn Văn A');
    expect(text).toContain('Chủ tịch');
    expect(text).toContain('Trần Thị B');
  });

  it('does not render the council card when there is none yet', () => {
    const fixture = createPage();
    expect(fixture.nativeElement.textContent).not.toContain('Hội đồng xét duyệt');
  });

  it('renders the AI summary when the dossier has one', () => {
    const withSummary: HoSoResponse = {
      ...dossier,
      tomTatAi: 'Hồ sơ đề nghị xét duyệt nhiệm vụ nghiên cứu nền tảng xử lý tín hiệu số dùng chung cho radar.',
    };
    setup(withSummary.id);
    const fixture = TestBed.createComponent(HoSoDetailPage);
    http.expectOne(`/api/ho-so/${withSummary.id}`).flush(withSummary);
    flushSimulation();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Tóm tắt AI');
    expect(text).toContain(withSummary.tomTatAi);
  });

  it('does not render the AI summary card when the dossier has none yet', () => {
    const fixture = createPage();
    expect(fixture.nativeElement.textContent).not.toContain('Tóm tắt AI');
  });

  it('reloads the dossier when Angular reuses the detail route', () => {
    const fixture = createPage();
    const replacement = {
      ...dossier,
      id: 'HS-2026-009',
      taiLieu: [{
        id: 20, ten: 'tai-lieu-moi.pdf', loai: 'PDF', version: 0,
        contentType: 'application/pdf', sizeBytes: 100, hasContent: true,
      }],
    };

    paramMap.next(convertToParamMap({ id: replacement.id }));
    const reload = http.expectOne(`/api/ho-so/${replacement.id}`);
    expect(reload.request.method).toBe('GET');
    reload.flush(replacement);
    flushSimulation();
    fixture.detectChanges();

    expect(fixture.componentInstance.item()?.id).toBe(replacement.id);
    expect(fixture.nativeElement.textContent).toContain('tai-lieu-moi.pdf');
    expect(fixture.nativeElement.textContent).not.toContain('Thuyết minh đề tài.pdf');
  });

  it('uploads a document and appends it to the dossier without a page reload', () => {
    const fixture = createPage();
    const file = new File(['pdf-content'], 'bao-cao.pdf', { type: 'application/pdf' });
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [file] });

    fixture.componentInstance.uploadDocument({ target: input } as unknown as Event);
    const request = http.expectOne(`/api/ho-so/${dossier.id}/documents`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeInstanceOf(FormData);
    request.flush({
      id: 3, ten: 'bao-cao.pdf', loai: 'PDF', version: 0,
      contentType: 'application/pdf', sizeBytes: 11, hasContent: true,
    });

    expect(fixture.componentInstance.item()?.taiLieu.at(-1)?.ten).toBe('bao-cao.pdf');
    expect(fixture.componentInstance.documentUploading()).toBe(false);
  });

  it('uploads a document while the dossier is processing', () => {
    const fixture = createPage();
    fixture.componentInstance.item.set(processingDossier);
    const file = new File(['content'], 'bo-sung.pdf', { type: 'application/pdf' });
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [file] });

    fixture.componentInstance.uploadDocument({ target: input } as unknown as Event);
    const request = http.expectOne(`/api/ho-so/${dossier.id}/documents`);
    expect(request.request.method).toBe('POST');
    request.flush({
      id: 3, ten: 'bo-sung.pdf', loai: 'PDF', version: 0,
      contentType: 'application/pdf', sizeBytes: 7, hasContent: true,
    });

    expect(fixture.componentInstance.item()?.taiLieu.at(-1)?.ten).toBe('bo-sung.pdf');
  });

  it('deletes a document in any dossier status and removes its row locally', () => {
    const fixture = createPage();
    fixture.componentInstance.item.set(processingDossier);
    const target = processingDossier.taiLieu[0];

    fixture.componentInstance.deleteDocument(target);
    const request = http.expectOne(`/api/ho-so/${dossier.id}/documents/${target.id}`);
    expect(request.request.method).toBe('DELETE');
    expect(request.request.headers.get('If-Match')).toBe('"0"');
    request.flush(null);

    expect(fixture.componentInstance.item()?.taiLieu.some((item) => item.id === target.id)).toBe(false);
    expect(fixture.componentInstance.documentDeletingId()).toBeNull();
  });

  it('reloads persisted documents when deleting a stale document returns 404', () => {
    const fixture = createPage();
    const stale = dossier.taiLieu[0];
    const persisted = {
      ...dossier,
      taiLieu: [{
        id: 20, ten: 'tai-lieu-da-upload.pdf', loai: 'PDF', version: 0,
        contentType: 'application/pdf', sizeBytes: 100, hasContent: true,
      }],
    };

    fixture.componentInstance.deleteDocument(stale);
    const deletion = http.expectOne(`/api/ho-so/${dossier.id}/documents/${stale.id}`);
    deletion.flush(
      { message: `Khong tim thay TaiLieu ${stale.id} trong HoSo ${dossier.id}` },
      { status: 404, statusText: 'Not Found' },
    );

    const reload = http.expectOne(`/api/ho-so/${dossier.id}`);
    reload.flush(persisted);
    flushSimulation();
    fixture.detectChanges();

    expect(fixture.componentInstance.item()?.taiLieu.map((item) => item.id)).toEqual([20]);
    expect(fixture.nativeElement.textContent).toContain('tai-lieu-da-upload.pdf');
    expect(fixture.nativeElement.textContent).not.toContain(stale.ten);
  });

  it('requests separate authenticated blob endpoints for viewing and downloading', () => {
    const fixture = createPage();
    const documentWithContent = {
      id: 3, ten: 'bao-cao.pdf', loai: 'PDF', version: 0, contentType: 'application/pdf', sizeBytes: 11, hasContent: true,
    };
    const createObjectUrl = globalThis.URL.createObjectURL;
    const revokeObjectUrl = globalThis.URL.revokeObjectURL;
    const open = window.open;
    globalThis.URL.createObjectURL = () => 'blob:test';
    globalThis.URL.revokeObjectURL = () => undefined;
    window.open = () => null;
    try {
      fixture.componentInstance.viewDocument(documentWithContent);
      const view = http.expectOne(`/api/ho-so/${dossier.id}/documents/3/content`);
      expect(view.request.responseType).toBe('blob');
      view.flush(new Blob(['pdf-content'], { type: 'application/pdf' }));

      fixture.componentInstance.downloadDocument(documentWithContent);
      const download = http.expectOne(`/api/ho-so/${dossier.id}/documents/3/download`);
      expect(download.request.responseType).toBe('blob');
      download.flush(new Blob(['pdf-content'], { type: 'application/pdf' }));
    } finally {
      globalThis.URL.createObjectURL = createObjectUrl;
      globalThis.URL.revokeObjectURL = revokeObjectUrl;
      window.open = open;
    }
  });

  // Từ 2026-07-28 quy trình gửi duyệt KHÔNG còn suy ra từ (loai, cap) mà lấy từ
  // `/api/process-definitions/selectable` và người dùng chọn tự do — kể cả quy trình tự vẽ.
  it('loads the deployed processes when the submit dialog opens and submits the picked one', () => {
    const fixture = createPage();
    fixture.componentInstance.runDossierAction(
      { outcome: 'SUBMIT', actionCode: 'SUBMIT', policyId: 'AP-SUBMIT', policyVersion: 4 } as never,
    );
    http.expectOne('/api/process-definitions/selectable').flush([
      {
        id: 'c1', bpmnProcessId: 'quy_trinh_moi', name: 'Quy trình tự vẽ',
        latestVersion: 3, userTaskCount: 2, updatedAt: '2026-07-28T00:00:00Z',
      },
    ]);
    fixture.detectChanges();

    expect(fixture.componentInstance.submitProcess()).toBeNull();
    fixture.componentInstance.selectedProcessId.set('quy_trinh_moi');
    expect(fixture.componentInstance.submitProcess()?.name).toBe('Quy trình tự vẽ');

    fixture.componentInstance.submit();
    const request = http.expectOne(`/api/dossiers/${dossier.id}/actions`);
    expect(request.request.method).toBe('POST');
    // `quyTrinh` mang thẳng bpmnProcessId, không còn mã có dấu chấm.
    expect(request.request.body).toEqual({ actionCode: 'SUBMIT', expectedPolicyId: 'AP-SUBMIT',
      expectedPolicyVersion: 4, processCode: 'quy_trinh_moi', processName: 'Quy trình tự vẽ' });
    request.flush({ dossierId: dossier.id, status: 'ACCEPTED' });
    http.expectOne(`/api/ho-so/${dossier.id}`).flush({ ...dossier, trangThai: 'START_PENDING', quyTrinh: 'quy_trinh_moi' });
    expect(fixture.componentInstance.item()?.trangThai).toBe('START_PENDING');
  });

  it('does not submit while no process is picked', () => {
    const fixture = createPage();
    fixture.componentInstance.submit();
    http.expectNone(`/api/ho-so/${dossier.id}/submit`);
  });

  it('reports why submit cannot continue when the action policy snapshot is missing', () => {
    const fixture = createPage();
    fixture.componentInstance.selectedProcessId.set('RD02_02');
    fixture.componentInstance.selectableProcesses.set([{
      id: 'rd02', bpmnProcessId: 'RD02_02', name: 'Xét duyệt cấp Tập đoàn',
      latestVersion: 5, userTaskCount: 61, updatedAt: '2026-07-22T00:00:00Z',
    }]);
    fixture.componentInstance.formAction.set({ outcome: 'SUBMIT', actionCode: 'SUBMIT' } as never);

    fixture.componentInstance.submit();

    expect(TestBed.inject(NzMessageService).error).toHaveBeenCalled();
    flushSimulation();
  });

  // Hồ sơ cũ lưu `quyTrinh` dạng "RD01.01" trong khi catalog dùng id "RD01_01" — xem BPMN phải
  // vẫn chạy được, nếu không là hồi quy cho toàn bộ hồ sơ tạo trước 2026-07-28.
  it('falls back to the underscore process id when viewing the BPMN of a legacy dossier', () => {
    const legacy: HoSoResponse = { ...dossier, quyTrinh: 'RD01.01' };
    setup(legacy.id);
    const fixture = TestBed.createComponent(HoSoDetailPage);
    http.expectOne(`/api/ho-so/${legacy.id}`).flush(legacy);
    flushSimulation();
    fixture.detectChanges();

    fixture.componentInstance.openBpmn();
    http.expectOne('/api/process-definitions/by-bpmn-process-id/RD01.01')
      .flush({ message: 'not found' }, { status: 404, statusText: 'Not Found' });
    http.expectOne('/api/process-definitions/by-bpmn-process-id/RD01_01')
      .flush({ latestVersion: { bpmnXml: '<definitions/>' } });

    expect(fixture.componentInstance.bpmnXml()).toBe('<definitions/>');
    expect(fixture.componentInstance.bpmnError()).toBeNull();
  });

  it('shows no action controls when opened directly and no active task belongs to the user', () => {
    setup(processingDossier.id);
    const fixture = TestBed.createComponent(HoSoDetailPage);
    const get = http.expectOne(`/api/ho-so/${processingDossier.id}`);
    get.flush(processingDossier);
    flushSimulation();
    flushNoActiveTask();
    fixture.detectChanges();

    expect(fixture.componentInstance.taskKey()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Không có quyền thao tác task ở bước này');
    expect(fixture.nativeElement.textContent).not.toContain('Đồng ý duyệt');
  });

  it('resolves the current active task when opened directly and then loads task actions', () => {
    setup(processingDossier.id);
    const fixture = TestBed.createComponent(HoSoDetailPage);
    http.expectOne(`/api/ho-so/${processingDossier.id}`).flush(processingDossier);
    flushSimulation();
    http.expectOne(`/api/ho-so/${processingDossier.id}/active-task`).flush({
      processInstanceKey: '2251799813697704',
      taskKey: 't2-key-1',
      taskDefinitionKey: 't2',
      maHoSo: processingDossier.id,
      tenBuoc: 'Thẩm định hồ sơ',
      assignee: null,
      candidateUsers: [],
      candidateGroups: ['TD'],
      createdAt: '2026-07-20T00:00:00Z',
      dueAt: null,
      formKey: 'phieu-phe-duyet',
    });
    http.expectOne('/api/tasks/t2-key-1/available-actions').flush({
      taskKey: 't2-key-1',
      processInstanceKey: '2251799813697704',
      taskDefinitionKey: 't2',
      actions: [{
        actionCode: 'APPROVE_STEP', label: 'Đồng ý duyệt', tone: 'primary',
        requiresReason: false, requiresEvidence: false, requiresConfirm: true, formKey: null,
      }],
    });
    fixture.detectChanges();

    expect(fixture.componentInstance.taskKey()).toBe('t2-key-1');
    expect(fixture.nativeElement.textContent).toContain('Đồng ý duyệt');
    expect(fixture.nativeElement.textContent).not.toContain('Không có quyền thao tác task ở bước này');
  });

  it('loads BPMN by deployed process id and keeps the current task as active node', () => {
    setup(processingDossier.id);
    const fixture = TestBed.createComponent(HoSoDetailPage);
    http.expectOne(`/api/ho-so/${processingDossier.id}`).flush(processingDossier);
    flushSimulation();
    flushNoActiveTask();

    fixture.componentInstance.openBpmn();
    // `quyTrinh` được tra thẳng trước (quy trình tự vẽ dùng id bất kỳ); chỉ khi 404 mới thử bản
    // gạch dưới cho hồ sơ cũ. `processingDossier.quyTrinh` = "RD01.01" nên đi qua cả 2 bước.
    const direct = http.expectOne('/api/process-definitions/by-bpmn-process-id/RD01.01');
    expect(direct.request.method).toBe('GET');
    direct.flush({ message: 'not found' }, { status: 404, statusText: 'Not Found' });
    const request = http.expectOne('/api/process-definitions/by-bpmn-process-id/RD01_01');
    expect(request.request.method).toBe('GET');
    request.flush({ latestVersion: { bpmnXml: '<definitions />' } });

    expect(fixture.componentInstance.bpmnOpen()).toBe(true);
    expect(fixture.componentInstance.bpmnXml()).toBe('<definitions />');
    expect(fixture.componentInstance.currentStep()?.taskDefinitionKey).toBe('t2');
  });

  it('wires task-centric actions when a taskKey is carried from Việc của tôi, never the legacy /actions endpoint', () => {
    setup(processingDossier.id, { taskKey: 't2-key-1' });
    const fixture = TestBed.createComponent(HoSoDetailPage);
    const get = http.expectOne(`/api/ho-so/${processingDossier.id}`);
    get.flush(processingDossier);
    flushSimulation();

    const availableActionsResponse: TaskAvailableActionsResponse = {
      taskKey: 't2-key-1', processInstanceKey: '2251799813697704', taskDefinitionKey: 't2',
      actions: [
        {
          actionCode: 'APPROVE_STEP', label: 'Đồng ý duyệt', icon: 'check', uiGroup: 'PRIMARY', tone: 'primary', displayOrder: 10, helpText: null,
          requiresReason: false, requiresEvidence: false, requiresConfirm: true, formKey: 'phieu-phe-duyet',
          policyId: 'AP-APPROVE', policyVersion: 3,
        },
        {
          actionCode: 'RETURN_STEP', label: 'Trả lại', icon: 'rollback', uiGroup: 'PRIMARY', tone: 'default', displayOrder: 20, helpText: null,
          requiresReason: true, requiresEvidence: false, requiresConfirm: false, formKey: 'phieu-y-kien',
          policyId: 'AP-RETURN', policyVersion: 2,
        },
      ],
    };
    const available = http.expectOne('/api/tasks/t2-key-1/available-actions');
    expect(available.request.method).toBe('GET');
    expect(available.request.headers.get('X-QTKHCN-User-Id')).toBe('pm@example.com');
    available.flush(availableActionsResponse);
    fixture.detectChanges();

    const cmp = fixture.componentInstance;
    expect(cmp.availableActions().some((action) => action.actionCode === 'APPROVE_STEP')).toBe(true);
    expect(cmp.availableActions().some((action) => action.actionCode === 'REJECT_STEP')).toBe(false);
    expect(fixture.nativeElement.textContent).not.toContain('Không có quyền thao tác task ở bước này');

    cmp.openAction('APPROVE_STEP');
    fixture.detectChanges();
    const form = http.expectOne('/api/eform/phieu-phe-duyet');
    form.flush({
      key: 'phieu-phe-duyet', ten: 'Phiếu phê duyệt', moTa: '', schema: { type: 'default', components: [] },
      version: 1, updatedBy: 'admin', updatedAt: '2026-07-20T00:00:00Z', createdAt: '2026-07-20T00:00:00Z',
    });
    fixture.detectChanges();
    cmp.applyAction();

    const post = http.expectOne('/api/tasks/t2-key-1/actions');
    expect(post.request.method).toBe('POST');
    expect(post.request.headers.get('X-QTKHCN-User-Id')).toBe('pm@example.com');
    expect(post.request.body).toEqual({
      requestId: expect.any(String), taskKey: 't2-key-1', actionCode: 'APPROVE_STEP',
      expectedPolicyId: 'AP-APPROVE', expectedPolicyVersion: 3,
      comment: null, formData: {}, expectedTaskState: 'ACTIVE',
    });
    post.flush({
      requestId: post.request.body.requestId, taskKey: 't2-key-1',
      processInstanceKey: '2251799813697704', status: 'ACCEPTED',
    });
    expect(cmp.actionOpen()).toBe(false);

    const nextStepDossier: HoSoResponse = {
      ...processingDossier,
      buocHienTai: 2,
      steps: [
        ...processingDossier.steps.map((step) => step.buocIndex === 1 ? { ...step, trangThai: 'DONE' as const } : step),
        {
          buocIndex: 2, taskDefinitionKey: 't3', ten: 'Phê duyệt hồ sơ', vaiTro: 'Lãnh đạo',
          vaiTroCodes: ['LD'], nguoi: null, trangThai: 'CURRENT', thoiDiem: null,
          yKien: null, hanXuLy: null, formKey: null,
        },
      ],
    };
    const refetch = http.expectOne(`/api/ho-so/${processingDossier.id}`);
    refetch.flush(nextStepDossier);
    http.expectOne(`/api/ho-so/${processingDossier.id}/active-task`).flush({
      processInstanceKey: '2251799813697704',
      taskKey: 't3-key-1',
      taskDefinitionKey: 't3',
      maHoSo: processingDossier.id,
      tenBuoc: 'Phê duyệt hồ sơ',
      assignee: null,
      candidateUsers: [],
      candidateGroups: ['LD'],
      createdAt: '2026-07-20T00:05:00Z',
      dueAt: null,
      formKey: null,
    });
    http.expectOne('/api/tasks/t3-key-1/available-actions').flush({
      taskKey: 't3-key-1',
      processInstanceKey: '2251799813697704',
      taskDefinitionKey: 't3',
      actions: [{
        actionCode: 'APPROVE_STEP', label: 'Phê duyệt bước mới', icon: 'check', uiGroup: 'PRIMARY', tone: 'primary', displayOrder: 10, helpText: null,
        requiresReason: false, requiresEvidence: false, requiresConfirm: true, formKey: null,
        policyId: 'AP-NEXT', policyVersion: 1,
      }],
    } satisfies TaskAvailableActionsResponse);
    fixture.detectChanges();

    expect(cmp.saving()).toBe(false);
    expect(cmp.taskKey()).toBe('t3-key-1');
    expect(cmp.availableActions().map((action) => action.label)).toContain('Phê duyệt bước mới');
    expect(fixture.nativeElement.textContent).toContain('Phê duyệt bước mới');
  });

  it('loads the eForm bound to a real task action and submits the data the user entered', () => {
    setup(processingDossier.id, { taskKey: 't2-key-1' });
    const fixture = TestBed.createComponent(HoSoDetailPage);
    http.expectOne(`/api/ho-so/${processingDossier.id}`).flush(processingDossier);
    flushSimulation();

    http.expectOne('/api/tasks/t2-key-1/available-actions').flush({
      taskKey: 't2-key-1', processInstanceKey: '2251799813697704', taskDefinitionKey: 't2',
      actions: [{
        actionCode: 'APPROVE_STEP', label: 'Đồng ý duyệt', icon: 'check', uiGroup: 'PRIMARY', tone: 'primary', displayOrder: 10, helpText: null,
        requiresReason: false, requiresEvidence: false, requiresConfirm: true, formKey: 'bm-02-08-qdh-nv',
        policyId: 'AP-FORM', policyVersion: 5,
      }],
    } satisfies TaskAvailableActionsResponse);
    fixture.detectChanges();

    const cmp = fixture.componentInstance;
    cmp.openAction('APPROVE_STEP');
    fixture.detectChanges();
    http.expectOne('/api/eform/bm-02-08-qdh-nv').flush({
      key: 'bm-02-08-qdh-nv', ten: 'QĐ thành lập HĐXD', moTa: '',
      schema: { type: 'default', components: [{ type: 'textfield', key: 'canCuPhapLy', label: 'Căn cứ' }] },
      version: 1, updatedBy: 'admin', updatedAt: '2026-07-20T00:00:00Z', createdAt: '2026-07-20T00:00:00Z',
    });
    fixture.detectChanges();

    // Người dùng thật sẽ gõ vào trường form-js render trong modal; giả lập bằng cách gọi thẳng
    // setValue của renderer (đường công khai duy nhất, không phụ thuộc cấu trúc DOM ngzorro).
    const renderer = cmp.taskActionFormRenderer();
    expect(renderer).toBeTruthy();
    renderer!.setValue({ type: 'textfield', key: 'canCuPhapLy' }, 'Quyết định số 123/QĐ-VHT');

    cmp.applyAction();
    const post = http.expectOne('/api/tasks/t2-key-1/actions');
    expect(post.request.body.formData).toEqual({ canCuPhapLy: 'Quyết định số 123/QĐ-VHT' });
    post.flush({ requestId: post.request.body.requestId, taskKey: 't2-key-1',
      processInstanceKey: '2251799813697704', status: 'ACCEPTED' });

    const refetch = http.expectOne(`/api/ho-so/${processingDossier.id}`);
    refetch.flush({ ...processingDossier, buocHienTai: 2 });
    flushNoActiveTask();
  });

  it('renders a draft support action from Action Studio and opens its configured form', () => {
    setup(dossier.id);
    const fixture = TestBed.createComponent(HoSoDetailPage);
    http.expectOne(`/api/ho-so/${dossier.id}`).flush(dossier);
    flushSimulation([{
      actionCode: 'BM.02.01.DKI', actionName: 'Tạo BM.02.01.DKI', actionType: 'SUPPORT', active: true,
      label: 'Tạo BM.02.01.DKI', icon: 'appstore', uiGroup: 'MORE', tone: 'default', order: 62,
      helpText: 'Tạo biểu mẫu đăng ký', visible: true, enabled: true, policyId: 'AP-1784539922796',
      policyVersion: 1, reasons: ['Khớp luật'], formKey: 'bm-02-00-cv-dk-xd-nv',
    }]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Tạo BM.02.01.DKI');
    fixture.componentInstance.runDossierAction(fixture.componentInstance.dossierActions()[0]);
    const form = http.expectOne('/api/eform/bm-02-00-cv-dk-xd-nv');
    form.flush({
      key: 'bm-02-00-cv-dk-xd-nv', ten: 'BM.02.01.DKI', moTa: '', schema: { type: 'default', components: [] },
      version: 1, updatedBy: 'admin', updatedAt: '2026-07-20T00:00:00Z', createdAt: '2026-07-20T00:00:00Z',
    });
    fixture.detectChanges();
    expect(fixture.componentInstance.formAction()?.policyId).toBe('AP-1784539922796');
  });
});

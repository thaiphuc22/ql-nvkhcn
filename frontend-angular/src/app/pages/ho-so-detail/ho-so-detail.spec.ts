import { provideHttpClient } from '@angular/common/http';
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
  hoiDongXetDuyet: [],
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
    const request = http.expectOne('/api/action-studio/simulate');
    expect(request.request.method).toBe('POST');
    request.flush(actions);
  }

  it('renders live dossier fields and persisted documents', () => {
    const fixture = createPage();
    expect(fixture.nativeElement.textContent).toContain(dossier.tenDeTai);
    expect(fixture.nativeElement.textContent).toContain('Thuyết minh đề tài.pdf');
    expect(fixture.nativeElement.textContent).toContain(dossier.thoiGianThucHien);
  });

  it('renders the generated council and its members when present', () => {
    const withCouncil: HoSoResponse = {
      ...dossier,
      hoiDongXetDuyet: [{
        id: 1, cap: 'CO_SO', sourceTaskDefinitionKey: 'T05', canCuPhapLy: 'QĐ số 01',
        createdAt: '2026-07-20T03:00:00Z',
        thanhVien: [
          { hoTen: 'Nguyễn Văn A', vaiTroTrongHoiDong: 'Chủ tịch' },
          { hoTen: 'Trần Thị B', vaiTroTrongHoiDong: null },
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

  it('submits the supported RD01.01 process and refreshes the page state from the response', () => {
    const fixture = createPage();
    fixture.componentInstance.submit();
    const request = http.expectOne(`/api/ho-so/${dossier.id}/submit`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ quyTrinh: 'RD01.01', quyTrinhTen: 'Xét duyệt Chủ trương cấp Cơ sở' });
    request.flush({ ...dossier, trangThai: 'PROCESSING', quyTrinh: 'RD01.01' });
    expect(fixture.componentInstance.item()?.trangThai).toBe('PROCESSING');
  });

  it('submits an XET_DUYET cấp Tập đoàn dossier into RD02.02', () => {
    const tapDoan: HoSoResponse = { ...dossier, loai: 'XET_DUYET', cap: 'TD' };
    setup(tapDoan.id);
    const fixture = TestBed.createComponent(HoSoDetailPage);
    http.expectOne(`/api/ho-so/${tapDoan.id}`).flush(tapDoan);
    flushSimulation();
    fixture.detectChanges();

    expect(fixture.componentInstance.submitProcess()).toEqual(
      { code: 'RD02.02', name: 'Xét duyệt NV KHCN cấp Tập đoàn', supported: true },
    );
    fixture.componentInstance.submit();
    const request = http.expectOne(`/api/ho-so/${tapDoan.id}/submit`);
    expect(request.request.body).toEqual(
      { quyTrinh: 'RD02.02', quyTrinhTen: 'Xét duyệt NV KHCN cấp Tập đoàn' },
    );
    request.flush({ ...tapDoan, trangThai: 'PROCESSING', quyTrinh: 'RD02.02' });
    expect(fixture.componentInstance.item()?.trangThai).toBe('PROCESSING');
  });

  // RD02.02 rẽ theo DMN `capNhiemVu` và loại hồ sơ cấp Cơ sở tại End_KhongThuocTD — gửi duyệt
  // được sẽ tạo instance chết lặng, nên phải chặn ở đây cho tới khi có BPMN cấp Cơ sở.
  it('does not offer a submittable process for an XET_DUYET cấp Cơ sở dossier', () => {
    const coSo: HoSoResponse = { ...dossier, loai: 'XET_DUYET', cap: 'CS' };
    setup(coSo.id);
    const fixture = TestBed.createComponent(HoSoDetailPage);
    http.expectOne(`/api/ho-so/${coSo.id}`).flush(coSo);
    flushSimulation();
    fixture.detectChanges();

    expect(fixture.componentInstance.submitProcess()).toEqual(
      { code: 'RD02.01', name: 'Xét duyệt NV KHCN cấp Cơ sở', supported: false },
    );
    fixture.componentInstance.submit();
    http.expectNone(`/api/ho-so/${coSo.id}/submit`);
  });

  it('shows no action controls and does not call the task API when opened without a taskKey', () => {
    setup(processingDossier.id);
    const fixture = TestBed.createComponent(HoSoDetailPage);
    const get = http.expectOne(`/api/ho-so/${processingDossier.id}`);
    get.flush(processingDossier);
    flushSimulation();
    fixture.detectChanges();

    expect(fixture.componentInstance.taskKey()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Không có quyền thao tác task từ đây');
    expect(fixture.nativeElement.textContent).not.toContain('Phê duyệt');
  });

  it('loads BPMN by deployed process id and keeps the current task as active node', () => {
    setup(processingDossier.id);
    const fixture = TestBed.createComponent(HoSoDetailPage);
    http.expectOne(`/api/ho-so/${processingDossier.id}`).flush(processingDossier);
    flushSimulation();

    fixture.componentInstance.openBpmn();
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
          actionCode: 'APPROVE_STEP', label: 'Đồng ý duyệt', tone: 'primary',
          requiresReason: false, requiresEvidence: false, requiresConfirm: true, formKey: 'phieu-phe-duyet',
        },
        {
          actionCode: 'RETURN_STEP', label: 'Trả lại', tone: 'default',
          requiresReason: true, requiresEvidence: false, requiresConfirm: false, formKey: 'phieu-y-kien',
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
    expect(fixture.nativeElement.textContent).not.toContain('Không có quyền thao tác task từ đây');

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
      comment: null, formData: {}, expectedTaskState: 'ACTIVE',
    });
    post.flush({
      requestId: post.request.body.requestId, taskKey: 't2-key-1',
      processInstanceKey: '2251799813697704', status: 'ACCEPTED',
    });
    expect(cmp.actionOpen()).toBe(false);

    const refetch = http.expectOne(`/api/ho-so/${processingDossier.id}`);
    refetch.flush({ ...processingDossier, buocHienTai: 2 });

    expect(cmp.saving()).toBe(false);
    expect(cmp.taskKey()).toBeNull();
    expect(cmp.availableActions()).toEqual([]);
  });

  it('loads the eForm bound to a real task action and submits the data the user entered', () => {
    setup(processingDossier.id, { taskKey: 't2-key-1' });
    const fixture = TestBed.createComponent(HoSoDetailPage);
    http.expectOne(`/api/ho-so/${processingDossier.id}`).flush(processingDossier);
    flushSimulation();

    http.expectOne('/api/tasks/t2-key-1/available-actions').flush({
      taskKey: 't2-key-1', processInstanceKey: '2251799813697704', taskDefinitionKey: 't2',
      actions: [{
        actionCode: 'APPROVE_STEP', label: 'Đồng ý duyệt', tone: 'primary',
        requiresReason: false, requiresEvidence: false, requiresConfirm: true, formKey: 'bm-02-08-qdh-nv',
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
  });

  it('renders a draft support action from Action Studio and opens its configured form', () => {
    setup(dossier.id);
    const fixture = TestBed.createComponent(HoSoDetailPage);
    http.expectOne(`/api/ho-so/${dossier.id}`).flush(dossier);
    flushSimulation([{
      actionCode: 'BM.02.01.DKI', actionName: 'Tạo BM.02.01.DKI', actionType: 'SUPPORT', active: true,
      label: 'Tạo BM.02.01.DKI', icon: 'appstore', uiGroup: 'MORE', tone: 'default', order: 62,
      helpText: 'Tạo biểu mẫu đăng ký', visible: true, enabled: true, policyId: 'AP-1784539922796',
      reasons: ['Khớp luật'], formKey: 'bm-02-00-cv-dk-xd-nv',
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

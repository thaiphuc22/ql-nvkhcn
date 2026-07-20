import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { NzIconService } from 'ng-zorro-antd/icon';
import { provideNzI18n, vi_VN } from 'ng-zorro-antd/i18n';

import {
  APPROVAL_MATRIX_ICONS, EFORM_ICONS, NAV_ICONS, NHIEM_VU_ICONS, SERVICE_TASK_ICONS,
} from '../../core/icons-provider';
import { AuthService } from '../../core/auth/auth.service';
import { HoSoResponse } from '../../core/models/ho-so';
import { TaskAvailableActionsResponse } from '../../core/models/task-action';
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
  taiLieu: [{ ten: 'Thuyết minh đề tài.pdf', loai: 'PDF' }, { ten: 'Dự toán PL1-PL6.xlsx', loai: 'Excel' }],
  maDeTai: 'RD.2026.031', tenDeTai: 'Nghiên cứu nền tảng xử lý tín hiệu số dùng chung cho radar',
  chuNhiem: 'ThS. Lê Thị Mai', donVi: 'TT Nghiên cứu Vô tuyến', thoiGianThucHien: '09/2026 – 09/2027',
  duToan: '2.750.000.000 đ', cap: 'CS',
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

  afterEach(() => http.verify());

  function setup(id: string, queryParams: Record<string, string> = {}) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideNzI18n(vi_VN),
        {
          provide: ActivatedRoute,
          useValue: {
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
    fixture.detectChanges();
    return fixture;
  }

  it('renders live dossier fields and persisted documents', () => {
    const fixture = createPage();
    expect(fixture.nativeElement.textContent).toContain(dossier.tenDeTai);
    expect(fixture.nativeElement.textContent).toContain('Thuyết minh đề tài.pdf');
    expect(fixture.nativeElement.textContent).toContain(dossier.thoiGianThucHien);
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

  it('shows no action controls and does not call the task API when opened without a taskKey', () => {
    setup(processingDossier.id);
    const fixture = TestBed.createComponent(HoSoDetailPage);
    const get = http.expectOne(`/api/ho-so/${processingDossier.id}`);
    get.flush(processingDossier);
    fixture.detectChanges();

    expect(fixture.componentInstance.taskKey()).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Không có quyền thao tác task từ đây');
    expect(fixture.nativeElement.textContent).not.toContain('Phê duyệt');
  });

  it('wires task-centric actions when a taskKey is carried from Việc của tôi, never the legacy /actions endpoint', () => {
    setup(processingDossier.id, { taskKey: 't2-key-1' });
    const fixture = TestBed.createComponent(HoSoDetailPage);
    const get = http.expectOne(`/api/ho-so/${processingDossier.id}`);
    get.flush(processingDossier);

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
    expect(cmp.hasAction('APPROVE_STEP')).toBe(true);
    expect(cmp.hasAction('REJECT_STEP')).toBe(false);
    expect(fixture.nativeElement.textContent).not.toContain('Không có quyền thao tác task từ đây');

    cmp.openAction('APPROVE_STEP');
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
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { NzIconService } from 'ng-zorro-antd/icon';
import { provideNzI18n, vi_VN } from 'ng-zorro-antd/i18n';

import {
  APPROVAL_MATRIX_ICONS, EFORM_ICONS, NAV_ICONS, NHIEM_VU_ICONS, SERVICE_TASK_ICONS,
} from '../../core/icons-provider';
import { HoSoResponse } from '../../core/models/ho-so';
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

describe('HoSoDetailPage', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideNzI18n(vi_VN),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: dossier.id }) } } },
      ],
    });
    TestBed.inject(NzIconService).addIcon(
      ...NAV_ICONS, ...APPROVAL_MATRIX_ICONS, ...SERVICE_TASK_ICONS, ...EFORM_ICONS, ...NHIEM_VU_ICONS,
    );
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function createPage() {
    const fixture = TestBed.createComponent(HoSoDetailPage);
    const get = http.expectOne(`http://localhost:8091/api/ho-so/${dossier.id}`);
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
    const request = http.expectOne(`http://localhost:8091/api/ho-so/${dossier.id}/submit`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ quyTrinh: 'RD01.01', quyTrinhTen: 'Xét duyệt Chủ trương cấp Cơ sở' });
    request.flush({ ...dossier, trangThai: 'PROCESSING', quyTrinh: 'RD01.01' });
    expect(fixture.componentInstance.item()?.trangThai).toBe('PROCESSING');
  });
});

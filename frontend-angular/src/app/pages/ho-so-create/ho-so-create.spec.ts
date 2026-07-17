import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { registerLocaleData } from '@angular/common';
import viLocale from '@angular/common/locales/vi';
import { convertToParamMap, ActivatedRoute, provideRouter, Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { NzIconService } from 'ng-zorro-antd/icon';
import { provideNzI18n, vi_VN } from 'ng-zorro-antd/i18n';
import { vi } from 'vitest';

import {
  APPROVAL_MATRIX_ICONS,
  EFORM_ICONS,
  NAV_ICONS,
  NHIEM_VU_ICONS,
  SERVICE_TASK_ICONS,
} from '../../core/icons-provider';
import { HoSoCreatePage } from './ho-so-create';

registerLocaleData(viLocale);

const mission = {
  ma: 'RD.2026.018', ten: 'Nghiên cứu module VHF', cap: 'TD' as const,
  chuNhiem: 'TS. Trần Văn Nam', donViChuTri: 'Trung tâm Vô tuyến',
  thoiGianThucHien: '01/2026 – 12/2026', duToan: '4.850.000.000 đ', giaiDoan: 'THUC_HIEN' as const,
};

const created = {
  id: 'HS-2026-042', maNV: mission.ma, loai: 'NGHIEM_THU', quyTrinh: '', quyTrinhTen: 'Chưa vào quy trình',
  nguoiKhoiTao: mission.chuNhiem, ngayTao: '2026-07-16', trangThai: 'DRAFT', buocHienTai: 0,
  zeebeProcessInstanceKey: null, steps: [], taiLieu: [], maDeTai: mission.ma, tenDeTai: mission.ten,
  chuNhiem: mission.chuNhiem, donVi: mission.donViChuTri, thoiGianThucHien: mission.thoiGianThucHien,
  duToan: mission.duToan, cap: mission.cap,
};

describe('HoSoCreatePage', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideNzI18n(vi_VN),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({ maNV: mission.ma }) } },
        },
      ],
    });
    TestBed.inject(NzIconService).addIcon(
      ...NAV_ICONS, ...APPROVAL_MATRIX_ICONS, ...SERVICE_TASK_ICONS, ...EFORM_ICONS, ...NHIEM_VU_ICONS,
    );
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function createPage() {
    const fixture = TestBed.createComponent(HoSoCreatePage);
    http.expectOne('http://localhost:8091/api/nhiem-vu').flush([mission]);
    http.expectOne('http://localhost:8091/api/ho-so').flush([]);
    fixture.detectChanges();
    return fixture;
  }

  it('preselects the mission from query params and fills the initiator', () => {
    const fixture = createPage();
    expect(fixture.componentInstance.form.controls.maNV.value).toBe(mission.ma);
    expect(fixture.componentInstance.form.controls.nguoiKhoiTao.value).toBe(mission.chuNhiem);
    expect(fixture.nativeElement.textContent).toContain('Nghiên cứu module VHF');
  });

  it('posts the selected date, type and documents then returns to the created dossier in the list', () => {
    const fixture = createPage();
    const component = fixture.componentInstance;
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.form.controls.loai.setValue('NGHIEM_THU');
    component.form.controls.ngayTao.setValue(new Date(2026, 6, 15));
    component.toggleDocument('Sản phẩm và kết quả.zip', false);

    component.submit();

    const request = http.expectOne('http://localhost:8091/api/ho-so');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      maNV: mission.ma,
      loai: 'NGHIEM_THU',
      nguoiKhoiTao: mission.chuNhiem,
      ngayTao: '2026-07-15',
      taiLieu: [
        { ten: 'Báo cáo tổng kết.pdf', loai: 'PDF' },
        { ten: 'Biên bản nghiệm thu.pdf', loai: 'PDF' },
      ],
    });
    request.flush(created);

    expect(navigate).toHaveBeenCalledWith(['/ho-so'], { queryParams: { id: created.id } });
  });
});

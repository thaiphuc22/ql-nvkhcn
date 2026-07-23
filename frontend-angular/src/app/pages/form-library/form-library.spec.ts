import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NzIconService } from 'ng-zorro-antd/icon';
import { vi } from 'vitest';

import { APPROVAL_MATRIX_ICONS, EFORM_ICONS, NAV_ICONS, SERVICE_TASK_ICONS } from '../../core/icons-provider';
import { EformService } from '../../core/services/eform.service';
import { FormLibraryPage } from './form-library';

function response(overrides: Record<string, unknown> = {}) {
  return {
    key: 'phieu-nhan-xet', ten: 'Phiếu nhận xét', moTa: '', loai: 'Nhận xét',
    schema: { type: 'default', id: 'phieu-nhan-xet', components: [] },
    version: 1, updatedBy: 'tester', updatedAt: '2026-07-16T00:00:00Z', createdAt: '2026-07-16T00:00:00Z',
    ...overrides,
  };
}

describe('FormLibraryPage', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    TestBed.inject(NzIconService).addIcon(...NAV_ICONS, ...APPROVAL_MATRIX_ICONS, ...SERVICE_TASK_ICONS, ...EFORM_ICONS);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function create() {
    const fixture = TestBed.createComponent(FormLibraryPage);
    fixture.detectChanges();
    http.expectOne('/api/eform').flush([response()]);
    fixture.detectChanges();
    return fixture;
  }

  it('loads and renders the form library from the backend', () => {
    const fixture = create();
    expect(fixture.componentInstance.list().length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Phiếu nhận xét');
  });

  it('shows an error message when the library fails to load', () => {
    const fixture = TestBed.createComponent(FormLibraryPage);
    fixture.detectChanges();
    http.expectOne('/api/eform')
      .flush({ message: 'Lỗi backend' }, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('creates a form and navigates straight to its designer', () => {
    const fixture = create();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    const cmp = fixture.componentInstance;

    cmp.formTen.set('Phiếu kiểm thử');
    cmp.formKey.set('');
    cmp.submitCreate();

    const request = http.expectOne('/api/eform');
    expect(request.request.body.key).toBe('phieu-kiem-thu');
    request.flush(response({ key: 'phieu-kiem-thu', ten: 'Phiếu kiểm thử' }));

    expect(navigateSpy).toHaveBeenCalledWith(['/phan-he/PH3/bieu-mau', 'phieu-kiem-thu', 'thiet-ke']);
    expect(TestBed.inject(EformService).getForm('phieu-kiem-thu')).toBeTruthy();
  });

  it('surfaces a backend conflict when creating a duplicate key', () => {
    const fixture = create();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    const cmp = fixture.componentInstance;

    cmp.formTen.set('Phiếu nhận xét');
    cmp.formKey.set('phieu-nhan-xet');
    cmp.submitCreate();

    http.expectOne('/api/eform')
      .flush({ message: 'Mã biểu mẫu đã tồn tại: phieu-nhan-xet' }, { status: 409, statusText: 'Conflict' });

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('removes a form from the library after the backend confirms', () => {
    const fixture = create();
    const cmp = fixture.componentInstance;
    const meta = cmp.list().find((f) => f.key === 'phieu-nhan-xet')!;

    cmp.removeForm(meta);
    http.expectOne('/api/eform/phieu-nhan-xet').flush(null);

    expect(cmp.list().some((f) => f.key === 'phieu-nhan-xet')).toBe(false);
  });
});

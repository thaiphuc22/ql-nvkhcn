import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NzIconService } from 'ng-zorro-antd/icon';
import { vi } from 'vitest';

import { APPROVAL_MATRIX_ICONS, EFORM_ICONS, NAV_ICONS, SERVICE_TASK_ICONS } from '../../core/icons-provider';
import { EformService } from '../../core/services/eform.service';
import { FormLibraryPage } from './form-library';

@Component({ standalone: true, template: '' })
class StubDesignerComponent {}

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
      providers: [
        provideRouter([
          { path: 'phan-he/PH3/bieu-mau/:key/thiet-ke', component: StubDesignerComponent },
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    TestBed.inject(NzIconService).addIcon(...NAV_ICONS, ...APPROVAL_MATRIX_ICONS, ...SERVICE_TASK_ICONS, ...EFORM_ICONS);
    http = TestBed.inject(HttpTestingController);
    // Tắt fallback seed client-side cho phần lớn test — chỉ bật ở test cuối
    // (tránh danh sách "tự nhiên có 4 form RD07" làm các assertion bên trên
    // khó hiểu).
    TestBed.inject(EformService).disableSeedFallback();
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

  it('blocks a key already in the loaded library without calling the backend', () => {
    const fixture = create();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    const cmp = fixture.componentInstance;

    cmp.formTen.set('Phiếu nhận xét');
    cmp.formKey.set('phieu-nhan-xet');

    expect(cmp.keyTaken()).toBe(true);
    cmp.submitCreate();

    expect(navigateSpy).not.toHaveBeenCalled();
    http.expectNone('/api/eform');
  });

  it('surfaces a backend conflict when the cache is stale (key created concurrently elsewhere)', () => {
    const fixture = create();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    const cmp = fixture.componentInstance;

    // Not in the locally loaded list, so the client-side check passes — the 409 below
    // simulates another tab/user creating the same key just before this request lands.
    cmp.formTen.set('Phiếu vừa được tạo ở nơi khác');
    cmp.formKey.set('phieu-vua-duoc-tao');
    expect(cmp.keyTaken()).toBe(false);
    cmp.submitCreate();

    http.expectOne('/api/eform')
      .flush({ message: 'Mã biểu mẫu đã tồn tại: phieu-vua-duoc-tao' }, { status: 409, statusText: 'Conflict' });

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('previews the auto-generated key before the Mã field is touched', () => {
    const fixture = create();
    const cmp = fixture.componentInstance;

    cmp.formTen.set('Phiếu đánh giá tiến độ');
    expect(cmp.formKeyPreview()).toBe('phieu-danh-gia-tien-do');
  });

  it('removes a form from the library after the backend confirms', () => {
    const fixture = create();
    const cmp = fixture.componentInstance;
    const meta = cmp.list().find((f) => f.key === 'phieu-nhan-xet')!;

    cmp.removeForm(meta);
    http.expectOne('/api/eform/phieu-nhan-xet').flush(null);

    expect(cmp.list().some((f) => f.key === 'phieu-nhan-xet')).toBe(false);
  });

  it('filters the forms by search query and type filter', () => {
    const fixture = TestBed.createComponent(FormLibraryPage);
    fixture.detectChanges();
    http.expectOne('/api/eform').flush([
      response({ key: 'bm-01-01-ttr-nv', ten: 'Tờ trình phê duyệt', loai: 'Soạn thảo' }),
      response({ key: 'bm-02-09-pnx-dt', ten: 'Phiếu nhận xét', loai: 'Nhận xét' }),
      response({ key: 'bm-02-21-hdo-nv', ten: 'Hợp đồng khoa học', loai: 'Phê duyệt' })
    ]);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;

    expect(cmp.filteredList().length).toBe(3);

    // Filter by search query
    cmp.searchQuery.set('trình');
    expect(cmp.filteredList().length).toBe(1);
    expect(cmp.filteredList()[0].key).toBe('bm-01-01-ttr-nv');

    // Filter by type
    cmp.searchQuery.set('');
    cmp.typeFilter.set('Nhận xét');
    expect(cmp.filteredList().length).toBe(1);
    expect(cmp.filteredList()[0].key).toBe('bm-02-09-pnx-dt');

    // Both filters
    cmp.searchQuery.set('Hợp đồng');
    cmp.typeFilter.set('Phê duyệt');
    expect(cmp.filteredList().length).toBe(1);
    expect(cmp.filteredList()[0].key).toBe('bm-02-21-hdo-nv');

    cmp.searchQuery.set('Hợp đồng');
    cmp.typeFilter.set('Nhận xét'); // Non-matching combo
    expect(cmp.filteredList().length).toBe(0);
  });

  // ─────────── Bộ test mới cho bộ lọc Nhóm RD + fallback seed RD07 (2026-08-05) ───────────

  it('lọc theo Nhóm RD chỉ giữ form đúng nhóm; biểu mẫu không có nhomRD thì không nằm trong nhóm nào cụ thể', () => {
    // Bắt đầu với list rỗng (backend trả rỗng, fallback seed đã tắt từ beforeEach),
    // sau đó inject từng form qua addForm để gắn nhomRD client-side.
    const fixture = TestBed.createComponent(FormLibraryPage);
    fixture.detectChanges();
    http.expectOne('/api/eform').flush([]);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;

    expect(cmp.list().length).toBe(0);

    function addFormWithGroup(key: string, ten: string, nhomRD: 'RD07' | 'RD01') {
      cmp.formTen.set(ten);
      cmp.formKey.set(key);
      cmp.formNhomRD.set(nhomRD);
      cmp.submitCreate();
      http.expectOne('/api/eform').flush(response({ key, ten }));
      fixture.detectChanges();
    }
    function addFormWithoutGroup(key: string, ten: string) {
      cmp.formTen.set(ten);
      cmp.formKey.set(key);
      cmp.formNhomRD.set(null);
      cmp.submitCreate();
      http.expectOne('/api/eform').flush(response({ key, ten }));
      fixture.detectChanges();
    }
    addFormWithGroup('bm-07-01-cnhap-dm-spdv-dau-nam', 'Cập nhật DM SPDV đầu năm', 'RD07');
    addFormWithGroup('bm-07-03-tong-hop-thong-tin', 'Tổng hợp thông tin cập nhật DM', 'RD07');
    addFormWithGroup('bm-01-01-ttr-nv', 'Tờ trình phê duyệt', 'RD01');
    addFormWithoutGroup('no-nhom', 'Biểu mẫu chưa gắn nhóm');

    expect(cmp.list().length).toBe(4);
    cmp.nhomRDFilter.set('RD07');
    expect(cmp.filteredList().length).toBe(2);
    expect(cmp.filteredList().every((f) => f.nhomRD === 'RD07')).toBe(true);

    cmp.nhomRDFilter.set('RD01');
    expect(cmp.filteredList().length).toBe(1);
    expect(cmp.filteredList()[0].key).toBe('bm-01-01-ttr-nv');

    cmp.nhomRDFilter.set(null);
    expect(cmp.filteredList().length).toBe(4);

    // nhomRDCounts đếm đúng
    expect(cmp.nhomRDCounts()['RD07']).toBe(2);
    expect(cmp.nhomRDCounts()['RD01']).toBe(1);
    expect(cmp.nhomRDCount('RD07')).toBe(2);
    expect(cmp.nhomRDCount('RD01')).toBe(1);
  });

  it('khi backend trả rỗng và fallback seed BẬT → hiển thị 4 biểu mẫu RD07 mẫu + banner', () => {
    // Bật lại fallback seed cho test này (beforeEach đã tắt)
    TestBed.inject(EformService).enableSeedFallback();

    const fixture = TestBed.createComponent(FormLibraryPage);
    fixture.detectChanges();
    http.expectOne('/api/eform').flush([]);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;

    expect(cmp.list().length).toBe(4);
    expect(cmp.list().every((f) => f.nhomRD === 'RD07')).toBe(true);
    expect(cmp.showingSeedBanner()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Đang hiển thị biểu mẫu mẫu RD07');

    // Lọc RD07 vẫn thấy đủ 4 form
    cmp.nhomRDFilter.set('RD07');
    expect(cmp.filteredList().length).toBe(4);

    // Lọc RD01 → rỗng
    cmp.nhomRDFilter.set('RD01');
    expect(cmp.filteredList().length).toBe(0);
  });

  it('khi backend trả dữ liệu thật thì KHÔNG hiển thị banner seed dù cache có fallback', () => {
    TestBed.inject(EformService).enableSeedFallback();

    const fixture = TestBed.createComponent(FormLibraryPage);
    fixture.detectChanges();
    http.expectOne('/api/eform').flush([
      response({ key: 'bm-02-09-pnx-dt', ten: 'Phiếu nhận xét', loai: 'Nhận xét' }),
    ]);
    fixture.detectChanges();
    const cmp = fixture.componentInstance;

    expect(cmp.list().length).toBe(1);
    expect(cmp.showingSeedBanner()).toBe(false);
  });

  it('createForm: truyền nhomRD qua addForm và cache giữ field ngay sau khi tạo', () => {
    const fixture = create();
    const cmp = fixture.componentInstance;

    cmp.formTen.set('Phiếu test RD07');
    cmp.formNhomRD.set('RD07');
    cmp.submitCreate();

    const request = http.expectOne('/api/eform');
    // Backend không nhận nhomRD (DTO chưa có field), nên request body không kèm
    expect(request.request.body).not.toHaveProperty('nhomRD');
    request.flush(response({ key: 'phieu-test-rd07', ten: 'Phiếu test RD07' }));
    fixture.detectChanges();

    const saved = TestBed.inject(EformService).getForm('phieu-test-rd07');
    expect(saved?.nhomRD).toBe('RD07');
  });
});

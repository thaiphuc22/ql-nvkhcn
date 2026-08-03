import { TestBed } from '@angular/core/testing';
import { NzIconService } from 'ng-zorro-antd/icon';

import { NAV_ICONS } from '../../core/icons-provider';
import { FormRendererComponent } from './form-renderer';

const duToanSchema = {
  type: 'default',
  id: 'phieu-du-toan-demo',
  components: [
    {
      type: 'radio', id: 'kl', key: 'ketLuan', label: 'Kết luận', validate: { required: true },
      values: [
        { value: 'dat', label: 'Đạt' },
        { value: 'chua_dat', label: 'Chưa đạt' },
      ],
    },
    { type: 'textarea', id: 'ld', key: 'lyDoChuaDat', label: 'Lý do', validate: { required: true }, conditional: { hide: '=ketLuan != "chua_dat"' } },
    { type: 'number', id: 'pl1', key: 'kinhPhiPL1', label: 'PL1' },
    { type: 'number', id: 'pl2', key: 'kinhPhiPL2', label: 'PL2' },
    { type: 'expression', id: 'tong', key: 'tongKinhPhi', label: 'Tổng', expression: '=(if kinhPhiPL1 = null then 0 else kinhPhiPL1) + (if kinhPhiPL2 = null then 0 else kinhPhiPL2)' },
  ],
};

const thanhVienSchema = {
  type: 'default',
  id: 'phieu-thanh-vien-demo',
  components: [
    {
      type: 'dynamiclist', id: 'ds', key: 'danhSachThanhVien', label: 'Danh sách',
      components: [
        { type: 'textfield', id: 'ht', key: 'hoTen', label: 'Họ tên', validate: { required: true } },
        { type: 'number', id: 'st', key: 'soThang', label: 'Số tháng' },
        { type: 'number', id: 'hs', key: 'heSo', label: 'Hệ số' },
        { type: 'expression', id: 'cp', key: 'chiPhiUocTinh', label: 'Chi phí', expression: '=(if soThang = null then 0 else soThang) * (if heSo = null then 0 else heSo)' },
      ],
    },
  ],
};

const ungVienSchema = {
  type: 'default',
  id: 'phieu-hoi-dong-demo',
  components: [
    {
      type: 'dynamiclist', id: 'ds', key: 'danhSachThanhVien', label: 'Danh sách thành viên',
      components: [
        { type: 'textfield', id: 'ht', key: 'hoTen', label: 'Họ tên' },
        { type: 'select', id: 'uid', key: 'userId', label: 'Tài khoản', valuesKey: 'ungVienHoiDong' },
      ],
    },
    { type: 'select', id: 'ck', key: 'nguoiKy', label: 'Người ký', valuesKey: 'ungVienHoiDong' },
    { type: 'select', id: 'tt', key: 'trangThai', label: 'Trạng thái', valuesKey: 'khongCoNguon' },
  ],
};

const htmlSchema = {
  type: 'default',
  id: 'phieu-html-demo',
  components: [
    {
      type: 'html',
      id: 'gioithieu',
      content:
        '<style>.gioithieu-title { color: rgb(191, 0, 39); }</style>' +
        '<p class="gioithieu-title" style="font-weight: bold;">Tiêu đề</p>' +
        '<img src="x" onerror="window.__ffHtmlXssProbe = true;" alt="" />',
    },
  ],
};

describe('FormRendererComponent', () => {
  beforeEach(() => {
    TestBed.inject(NzIconService).addIcon(...NAV_ICONS);
  });

  function create(
    schema: unknown,
    data?: Record<string, unknown>,
    valueSources?: Record<string, { value: string; label: string }[]>,
  ) {
    const fixture = TestBed.createComponent(FormRendererComponent);
    fixture.componentRef.setInput('schema', schema);
    if (data) fixture.componentRef.setInput('data', data);
    if (valueSources) fixture.componentRef.setInput('valueSources', valueSources);
    fixture.detectChanges();
    return fixture;
  }

  it('hides a conditional field until its condition is met, and validates it once visible', () => {
    const fixture = create(duToanSchema);
    const cmp = fixture.componentInstance;
    const lyDo = duToanSchema.components[1];

    expect(cmp.isHidden(lyDo)).toBe(true);

    cmp.setValue(duToanSchema.components[0], 'chua_dat');
    fixture.detectChanges();
    expect(cmp.isHidden(lyDo)).toBe(false);

    const result = cmp.submit();
    expect(result.errors['ld']).toBe('Trường này là bắt buộc.');
  });

  it('computes an expression field from feelin and excludes it from submit errors', () => {
    const fixture = create(duToanSchema, { ketLuan: 'dat', kinhPhiPL1: 100, kinhPhiPL2: 50 });
    const cmp = fixture.componentInstance;
    const tong = duToanSchema.components[4];
    expect(cmp.fieldValue(tong)).toBe(150);
  });

  it('adds/removes dynamiclist rows and computes per-row expressions', () => {
    const fixture = create(thanhVienSchema);
    const cmp = fixture.componentInstance;
    const list = thanhVienSchema.components[0];

    cmp.setValue(list, [{ hoTen: 'A', soThang: 3, heSo: 10 }]);
    fixture.detectChanges();
    expect(cmp.listRows(list).length).toBe(1);

    const result = cmp.submit();
    expect(result.data['danhSachThanhVien']).toEqual([{ hoTen: 'A', soThang: 3, heSo: 10, chiPhiUocTinh: 30 }]);
  });

  // `valuesKey` cho phép danh mục biến thiên theo dữ liệu hệ thống (ứng viên Hội đồng xét duyệt lấy
  // từ identity-service) thay vì bị đóng băng trong schema — xem migration V29 cho bm-02-08-qdh-nv.
  it('resolves select options from valueSources for valuesKey fields, at root level and inside a dynamiclist', () => {
    const options = [
      { value: 'a@example.com', label: 'Nguyễn Văn A' },
      { value: 'b@example.com', label: 'Trần Thị B' },
    ];
    const fixture = create(ungVienSchema, { danhSachThanhVien: [{ hoTen: 'A' }] }, {
      ungVienHoiDong: options,
    });
    fixture.detectChanges();

    const selects = fixture.nativeElement.querySelectorAll('nz-select');
    expect(selects.length).toBe(3);

    const labels = Array.from(
      fixture.nativeElement.querySelectorAll('.ff-label') as NodeListOf<HTMLElement>,
    ).map((el) => el.textContent?.trim());
    expect(labels).toContain('Tài khoản');
  });

  it('renders an html field keeping <style> blocks and style="..." attributes, scoped per field', () => {
    (window as unknown as { __ffHtmlXssProbe?: boolean }).__ffHtmlXssProbe = undefined;
    const fixture = create(htmlSchema);

    const container = fixture.nativeElement.querySelector('.ff-html') as HTMLElement;
    expect(container.querySelector('style')).toBeTruthy();
    expect(container.querySelector('p')?.getAttribute('style')).toBe('font-weight: bold;');

    // Angular's default [innerHTML] sanitizer strips both <style> tags and style="..." attributes —
    // if this ever regresses back to a plain [innerHTML]="comp().content" binding, the assertions
    // above would fail because neither would survive.
    const styleText = container.querySelector('style')!.textContent ?? '';
    expect(styleText.trim().startsWith('.gioithieu-title')).toBe(false); // must be scoped, not the raw selector
    expect(styleText).toContain('.ff-html-scope-gioithieu .gioithieu-title');

    // still not executable: DOMPurify must strip the onerror handler attribute before bypassing
    // Angular's sanitizer (the <img> tag itself is a legitimate, allowed element and survives).
    expect(container.querySelector('img')?.getAttribute('onerror')).toBeNull();
    expect((window as unknown as { __ffHtmlXssProbe?: boolean }).__ffHtmlXssProbe).toBeUndefined();
  });

  it('falls back to an empty option list when valuesKey has no matching source instead of throwing', () => {
    const fixture = create(ungVienSchema, undefined, {});
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.componentInstance.submit().errors).toEqual({});
  });
});

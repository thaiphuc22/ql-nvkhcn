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

describe('FormRendererComponent', () => {
  beforeEach(() => {
    TestBed.inject(NzIconService).addIcon(...NAV_ICONS);
  });

  function create(schema: unknown, data?: Record<string, unknown>) {
    const fixture = TestBed.createComponent(FormRendererComponent);
    fixture.componentRef.setInput('schema', schema);
    if (data) fixture.componentRef.setInput('data', data);
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
});

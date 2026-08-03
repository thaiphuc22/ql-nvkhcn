import { TestBed } from '@angular/core/testing';
import { NzIconService } from 'ng-zorro-antd/icon';

import { APPROVAL_MATRIX_ICONS, EFORM_ICONS, NAV_ICONS, SERVICE_TASK_ICONS } from '../../core/icons-provider';
import { type FormComponent } from '../../core/models/eform';
import { type EditFieldEvent, FormFieldPropertiesComponent } from './form-field-properties';

const textField: FormComponent = { type: 'textfield', id: 'a', key: 'hoTen', label: 'Họ tên' };

describe('FormFieldPropertiesComponent', () => {
  beforeEach(() => {
    TestBed.inject(NzIconService).addIcon(...NAV_ICONS, ...APPROVAL_MATRIX_ICONS, ...SERVICE_TASK_ICONS, ...EFORM_ICONS);
  });

  function create(field: FormComponent | null) {
    const fixture = TestBed.createComponent(FormFieldPropertiesComponent);
    fixture.componentRef.setInput('field', field);
    fixture.detectChanges();
    return fixture;
  }

  it('shows an empty state when no field is selected', () => {
    const fixture = create(null);
    expect(fixture.nativeElement.textContent).toContain('Chọn một thành phần để chỉnh sửa');
  });

  it('shows the existing key, label, and description of the selected field', () => {
    const fixture = create({ ...textField, description: 'Điền đầy đủ họ tên' });
    const cmp = fixture.componentInstance;

    expect(cmp.draftKey()).toBe('hoTen');
    expect(cmp.draftLabel()).toBe('Họ tên');
    expect(cmp.draftDescription()).toBe('Điền đầy đủ họ tên');
  });

  it('shows the HTML content already set on an html field (field.content, not field.text)', () => {
    const htmlField: FormComponent = { type: 'html', id: 'b', content: '<b>Xin chào</b>', text: 'không nên dùng cái này' };
    const fixture = create(htmlField);

    expect(fixture.componentInstance.draftContent()).toBe('<b>Xin chào</b>');
  });

  it('shows the FEEL expression already set on an expression field', () => {
    const exprField: FormComponent = { type: 'expression', id: 'c', key: 'tong', expression: '=soThang * heSo' };
    const fixture = create(exprField);

    expect(fixture.componentInstance.draftExpression()).toBe('=soThang * heSo');
  });

  it('shows the FEEL hide condition already set on a field', () => {
    const hiddenField: FormComponent = { ...textField, conditional: { hide: '=vaiTro != "chu_nhiem"' } };
    const fixture = create(hiddenField);

    expect(fixture.componentInstance.draftHide()).toBe('=vaiTro != "chu_nhiem"');
  });

  it('commits the label edit on blur, not on every keystroke', () => {
    const fixture = create(textField);
    const cmp = fixture.componentInstance;
    const emitted: EditFieldEvent[] = [];
    cmp.edit.subscribe((e) => emitted.push(e));

    cmp.draftLabel.set('Họ và tên đầy đủ');
    expect(emitted.length).toBe(0);

    cmp.commitLabel();
    expect(emitted).toEqual([{ field: textField, prop: 'label', value: 'Họ và tên đầy đủ' }]);
  });

  it('merges validate.required into the existing validate object', () => {
    const withValidate: FormComponent = { ...textField, validate: { maxLength: 50 } };
    const fixture = create(withValidate);
    const emitted: EditFieldEvent[] = [];
    fixture.componentInstance.edit.subscribe((e) => emitted.push(e));

    fixture.componentInstance.toggleRequired(true);

    expect(emitted[0]).toEqual({ field: withValidate, prop: 'validate', value: { maxLength: 50, required: true } });
  });

  it('emits remove with the current field', () => {
    const fixture = create(textField);
    const removed: FormComponent[] = [];
    fixture.componentInstance.remove.subscribe((f) => removed.push(f));

    fixture.componentInstance.confirmRemove();

    expect(removed).toEqual([textField]);
  });
});

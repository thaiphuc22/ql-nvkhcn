import { TestBed } from '@angular/core/testing';
import { NzIconService } from 'ng-zorro-antd/icon';

import { APPROVAL_MATRIX_ICONS, EFORM_ICONS, NAV_ICONS, SERVICE_TASK_ICONS } from '../../core/icons-provider';
import { FormFieldPaletteComponent } from './form-field-palette';

describe('FormFieldPaletteComponent', () => {
  beforeEach(() => {
    TestBed.inject(NzIconService).addIcon(...NAV_ICONS, ...APPROVAL_MATRIX_ICONS, ...SERVICE_TASK_ICONS, ...EFORM_ICONS);
  });

  function create() {
    const fixture = TestBed.createComponent(FormFieldPaletteComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('lists all groups by default', () => {
    const fixture = create();
    const ids = fixture.componentInstance.groups().map((g) => g.id);
    expect(ids).toEqual(['input', 'selection', 'presentation', 'container']);
  });

  it('filters entries by search query across groups', () => {
    const fixture = create();
    fixture.componentInstance.query.set('bảng động');
    fixture.detectChanges();
    const groups = fixture.componentInstance.groups();
    expect(groups.length).toBe(1);
    expect(groups[0].entries.map((e) => e.type)).toEqual(['dynamiclist']);
  });

  it('emits the field type when an entry is clicked', () => {
    const fixture = create();
    const emitted: string[] = [];
    fixture.componentInstance.add.subscribe((t) => emitted.push(t));

    const button = fixture.nativeElement.querySelector('button[data-field-type="textfield"]') as HTMLButtonElement;
    button.click();

    expect(emitted).toEqual(['textfield']);
  });
});

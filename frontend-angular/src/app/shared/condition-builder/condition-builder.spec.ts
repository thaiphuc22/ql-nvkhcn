import { TestBed } from '@angular/core/testing';

import { anyCondition, group, leaf, type ConditionGroup } from '../../core/models/approval-conditions';
import { ConditionBuilderComponent } from './condition-builder';

describe('ConditionBuilderComponent', () => {
  function create(value: ConditionGroup) {
    const fixture = TestBed.createComponent(ConditionBuilderComponent);
    fixture.componentRef.setInput('value', value);
    fixture.detectChanges();
    return fixture;
  }

  it('renders an empty root group without throwing and shows the wildcard preview', () => {
    const fixture = create(anyCondition());
    expect(fixture.componentInstance.preview()).toBe('(bất kỳ)');
  });

  it('emits a new group with an appended leaf when addLeaf is called', () => {
    const fixture = create(anyCondition());
    const emitted: ConditionGroup[] = [];
    fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));

    fixture.componentInstance.addLeaf();

    expect(emitted.length).toBe(1);
    expect(emitted[0].items.length).toBe(1);
    expect(emitted[0].items[0].kind).toBe('condition');
  });

  it('emits a new group with a nested AND group when addGroup is called', () => {
    const fixture = create(anyCondition());
    const emitted: ConditionGroup[] = [];
    fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));

    fixture.componentInstance.addGroup();

    expect(emitted[0].items[0].kind).toBe('group');
  });

  it('replaces the field and resets the operator when onFieldChange is called', () => {
    const value = group('AND', [leaf('capNhiemVu', 'eq', 'TD')]);
    const fixture = create(value);
    const emitted: ConditionGroup[] = [];
    fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));

    fixture.componentInstance.onFieldChange(0, 'tongDuToan');

    const item = emitted[0].items[0];
    expect(item.kind).toBe('condition');
    expect(item.kind === 'condition' && item.field).toBe('tongDuToan');
    expect(item.kind === 'condition' && item.operator).toBe('eq');
  });

  it('removes the item at the given index', () => {
    const value = group('AND', [leaf('capNhiemVu', 'eq', 'TD'), leaf('tongDuToan', 'gte', 1)]);
    const fixture = create(value);
    const emitted: ConditionGroup[] = [];
    fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));

    fixture.componentInstance.removeItem(0);

    expect(emitted[0].items.length).toBe(1);
    expect(emitted[0].items[0].kind === 'condition' && emitted[0].items[0].field).toBe('tongDuToan');
  });

  it('renders a nested group without throwing (recursive self-reference)', () => {
    const value = group('AND', [group('OR', [leaf('coMuaSam', 'eq', true)])]);
    expect(() => create(value)).not.toThrow();
  });
});

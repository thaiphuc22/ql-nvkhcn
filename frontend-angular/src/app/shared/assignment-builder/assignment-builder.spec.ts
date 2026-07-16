import { TestBed } from '@angular/core/testing';

import { groupAssignment, type ApprovalAssignment } from '../../core/models/approval-matrix';
import { AssignmentBuilderComponent } from './assignment-builder';

describe('AssignmentBuilderComponent', () => {
  function create(value: ApprovalAssignment) {
    const fixture = TestBed.createComponent(AssignmentBuilderComponent);
    fixture.componentRef.setInput('value', value);
    fixture.detectChanges();
    return fixture;
  }

  it('renders without throwing for an assignment with no targets at all', () => {
    expect(() => create({ mode: 'ANY_ONE', targets: [] })).not.toThrow();
  });

  it('renders without throwing for a GROUP target with no roles selected yet', () => {
    expect(() => create(groupAssignment([]))).not.toThrow();
  });

  it('emits a new assignment with an appended GROUP target when addTarget is called', () => {
    const fixture = create({ mode: 'ANY_ONE', targets: [] });
    const emitted: ApprovalAssignment[] = [];
    fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));

    fixture.componentInstance.addTarget();

    expect(emitted[0].targets.length).toBe(1);
    expect(emitted[0].targets[0]).toEqual({ type: 'GROUP', roleCodes: [] });
  });

  it('replaces the target with an empty shape of the new type when onTypeChange is called', () => {
    const fixture = create(groupAssignment(['CQ_KHCN']));
    const emitted: ApprovalAssignment[] = [];
    fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));

    fixture.componentInstance.onTypeChange(0, 'USER');

    expect(emitted[0].targets[0]).toEqual({ type: 'USER', userIds: [] });
  });

  it('updates the role codes of a GROUP target', () => {
    const fixture = create(groupAssignment(['CQ_KHCN']));
    const emitted: ApprovalAssignment[] = [];
    fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));

    fixture.componentInstance.onGroupChange(0, ['CQ_KHCN', 'TGD_VHT']);

    expect(emitted[0].targets[0]).toEqual({ type: 'GROUP', roleCodes: ['CQ_KHCN', 'TGD_VHT'] });
  });

  it('removes a target by index', () => {
    const fixture = create({
      mode: 'ANY_ONE',
      targets: [
        { type: 'GROUP', roleCodes: ['CQ_KHCN'] },
        { type: 'USER', userIds: ['U-001'] },
      ],
    });
    const emitted: ApprovalAssignment[] = [];
    fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));

    fixture.componentInstance.removeTarget(0);

    expect(emitted[0].targets.length).toBe(1);
    expect(emitted[0].targets[0].type).toBe('USER');
  });

  it('reports an issue message for a target index that has one', () => {
    const fixture = create(groupAssignment([]));
    fixture.componentRef.setInput('issues', [{ index: 0, message: 'Chọn ít nhất một nhóm phê duyệt.' }]);
    fixture.detectChanges();

    expect(fixture.componentInstance.issueFor(0)).toBe('Chọn ít nhất một nhóm phê duyệt.');
    expect(fixture.componentInstance.issueFor(1)).toBeUndefined();
  });
});

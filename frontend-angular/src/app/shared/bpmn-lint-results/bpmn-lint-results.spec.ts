import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BpmnLintIssue } from '../../core/models/process-definition';
import { BpmnLintResultsComponent } from './bpmn-lint-results';

describe('BpmnLintResultsComponent', () => {
  let fixture: ComponentFixture<BpmnLintResultsComponent>;
  const issues: BpmnLintIssue[] = [
    { code: 'GATEWAY_NO_OUTGOING', severity: 'ERROR', message: 'Thiếu nhánh ra.', elementId: 'g1', elementName: 'Duyệt?' },
    { code: 'USER_TASK_ASSIGNMENT_MISSING', severity: 'WARNING', message: 'Thiếu phân công.', elementId: 'u1', elementName: 'Duyệt' },
    { code: 'ELEMENT_NAME_MISSING', severity: 'SUGGESTION', message: 'Nên thêm tên.', elementId: 't1', elementName: null },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BpmnLintResultsComponent] }).compileComponents();
    fixture = TestBed.createComponent(BpmnLintResultsComponent);
    fixture.componentRef.setInput('issues', issues);
    fixture.detectChanges();
  });

  it('renders error, warning and suggestion groups with stable codes', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Lỗi');
    expect(text).toContain('Cảnh báo');
    expect(text).toContain('Gợi ý');
    expect(text).toContain('GATEWAY_NO_OUTGOING');
    expect(text).toContain('USER_TASK_ASSIGNMENT_MISSING');
    expect(text).toContain('ELEMENT_NAME_MISSING');
  });

  it('emits the selected issue so the editor can focus its element', () => {
    const selected: BpmnLintIssue[] = [];
    fixture.componentInstance.issueSelected.subscribe((issue) => selected.push(issue));
    (fixture.nativeElement.querySelector('button:not([disabled])') as HTMLButtonElement).click();
    expect(selected[0].elementId).toBe('g1');
  });
});

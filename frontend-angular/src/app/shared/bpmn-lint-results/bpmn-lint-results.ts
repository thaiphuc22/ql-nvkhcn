import { Component, computed, input, output } from '@angular/core';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { BpmnIssueSeverity, BpmnLintIssue } from '../../core/models/process-definition';

@Component({
  selector: 'app-bpmn-lint-results',
  standalone: true,
  imports: [NzTagModule],
  template: `
    <section class="lint" aria-label="Kết quả kiểm tra BPMN">
      @for (group of groups(); track group.severity) {
        <article class="lint__group lint__group--{{ group.severity.toLowerCase() }}">
          <header><strong>{{ group.label }}</strong><nz-tag>{{ group.issues.length }}</nz-tag><span>{{ group.note }}</span></header>
          @if (group.issues.length) {
            <ul>
              @for (issue of group.issues; track issue.code + ':' + issue.elementId + ':' + $index) {
                <li><button type="button" (click)="issueSelected.emit(issue)" [disabled]="!issue.elementId">
                  <code>{{ issue.code }}</code><span>{{ issue.message }}</span>
                  @if (issue.elementName || issue.elementId) { <small>{{ issue.elementName || issue.elementId }}</small> }
                </button></li>
              }
            </ul>
          } @else { <p>Không có.</p> }
        </article>
      }
    </section>
  `,
  styles: [`
    .lint { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; max-height:230px; overflow:auto }
    .lint__group { border:1px solid var(--vht-border); border-top-width:3px; border-radius:var(--vht-radius); background:var(--vht-surface); padding:10px }
    .lint__group--error { border-top-color:#cf1322 }.lint__group--warning { border-top-color:#d48806 }.lint__group--suggestion { border-top-color:#1677ff }
    header { display:flex; align-items:center; gap:7px } header span,p { color:var(--vht-ink-2); font-size:12px } p { margin:8px 0 0 }
    ul { list-style:none; margin:8px 0 0; padding:0; display:grid; gap:5px }
    button { width:100%; display:grid; grid-template-columns:auto 1fr; gap:2px 7px; padding:6px; border:0; border-radius:4px; background:transparent; text-align:left; cursor:pointer }
    button:not(:disabled):hover { background:#f5f7fa } button:disabled { color:inherit; cursor:default }
    code { font-size:11px; color:var(--vht-ink-2) } button span { font-size:12px } small { grid-column:2; color:var(--vht-ink-2) }
    @media (max-width:900px) { .lint { grid-template-columns:1fr; max-height:none } }
  `],
})
export class BpmnLintResultsComponent {
  readonly issues = input.required<BpmnLintIssue[]>();
  readonly issueSelected = output<BpmnLintIssue>();
  readonly groups = computed(() => [
    this.group('ERROR', 'Lỗi', 'Chặn chạy thử và deploy'),
    this.group('WARNING', 'Cảnh báo', 'Không chặn deploy'),
    this.group('SUGGESTION', 'Gợi ý', 'Cải thiện chất lượng mô hình'),
  ]);

  private group(severity: BpmnIssueSeverity, label: string, note: string) {
    return { severity, label, note, issues: this.issues().filter((issue) => issue.severity === severity) };
  }
}

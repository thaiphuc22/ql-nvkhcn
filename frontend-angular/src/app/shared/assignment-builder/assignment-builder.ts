import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import {
  MODE_LABEL,
  type ApprovalAssignment,
  type ApprovalMode,
  type ApprovalTarget,
  type ApprovalTargetType,
} from '../../core/models/approval-matrix';
import { ROLES } from '../../core/models/roles';
import { users } from '../../core/models/org-users';

export interface AssignmentTargetIssue {
  index: number;
  message: string;
}

const TARGET_TYPE_OPTIONS: { value: ApprovalTargetType; label: string; disabled?: boolean }[] = [
  { value: 'GROUP', label: 'Nhóm phê duyệt' },
  { value: 'USER', label: 'Người cụ thể' },
  { value: 'ORG_POSITION', label: 'Chức danh tổ chức — sắp có', disabled: true },
  { value: 'COUNCIL', label: 'Hội đồng — sắp có', disabled: true },
  { value: 'EXPRESSION', label: 'Biểu thức — sắp có', disabled: true },
];

const ROLE_OPTIONS = ROLES.map((r) => ({ value: r.code, label: `${r.ten} (${r.code})` }));
const USER_OPTIONS = users.map((u) => ({ value: u.id, label: `${u.hoTen}${u.chucDanh ? ` — ${u.chucDanh}` : ''}` }));

const MODE_HELP: Record<ApprovalMode, string> = {
  ANY_ONE: 'Chỉ cần một người trong danh sách hoàn thành phê duyệt.',
  ALL: 'Tất cả người được phân công đều cần phê duyệt.',
  SEQUENTIAL: 'Phê duyệt lần lượt theo thứ tự các đích phân công.',
};

function emptyTargetOf(type: ApprovalTargetType): ApprovalTarget {
  switch (type) {
    case 'GROUP':
      return { type: 'GROUP', roleCodes: [] };
    case 'USER':
      return { type: 'USER', userIds: [] };
    case 'ORG_POSITION':
      return { type: 'ORG_POSITION', positionCode: '', orgScope: 'DON_VI' };
    case 'COUNCIL':
      return { type: 'COUNCIL', councilType: '' };
    case 'EXPRESSION':
      return { type: 'EXPRESSION', expression: '' };
  }
}

/**
 * Trình soạn "kết quả phân công" của một luật Ma trận phê duyệt: chế độ
 * (ANY_ONE/ALL/SEQUENTIAL) + danh sách đích (GROUP/USER resolve thật;
 * ORG_POSITION/COUNCIL/EXPRESSION là placeholder chờ backend). Port của
 * webapp/src/components/AssignmentBuilder.tsx (D17 Angular migration).
 */
@Component({
  selector: 'app-assignment-builder',
  imports: [
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzSegmentedModule,
    NzSelectModule,
    NzTagModule,
    NzTypographyModule,
  ],
  templateUrl: './assignment-builder.html',
  styleUrl: './assignment-builder.scss',
})
export class AssignmentBuilderComponent {
  readonly value = input.required<ApprovalAssignment>();
  readonly issues = input<AssignmentTargetIssue[]>([]);
  readonly valueChange = output<ApprovalAssignment>();

  readonly targetTypeOptions = TARGET_TYPE_OPTIONS;
  readonly roleOptions = ROLE_OPTIONS;
  readonly userOptions = USER_OPTIONS;
  readonly modeOptions = (Object.keys(MODE_LABEL) as ApprovalMode[]).map((m) => ({
    value: m,
    label: MODE_LABEL[m],
  }));

  modeHelp(mode: ApprovalMode): string {
    return MODE_HELP[mode];
  }

  issueFor(i: number): string | undefined {
    return this.issues().find((it) => it.index === i)?.message;
  }

  setMode(mode: string | number): void {
    this.valueChange.emit({ ...this.value(), mode: mode as ApprovalMode });
  }

  setTarget(i: number, target: ApprovalTarget): void {
    this.valueChange.emit({
      ...this.value(),
      targets: this.value().targets.map((it, idx) => (idx === i ? target : it)),
    });
  }

  removeTarget(i: number): void {
    this.valueChange.emit({ ...this.value(), targets: this.value().targets.filter((_, idx) => idx !== i) });
  }

  addTarget(): void {
    this.valueChange.emit({ ...this.value(), targets: [...this.value().targets, { type: 'GROUP', roleCodes: [] }] });
  }

  onTypeChange(i: number, type: ApprovalTargetType): void {
    this.setTarget(i, emptyTargetOf(type));
  }

  groupRoleCodes(target: ApprovalTarget): string[] {
    return target.type === 'GROUP' ? target.roleCodes : [];
  }

  userIds(target: ApprovalTarget): string[] {
    return target.type === 'USER' ? target.userIds : [];
  }

  onGroupChange(i: number, roleCodes: string[]): void {
    this.setTarget(i, { type: 'GROUP', roleCodes });
  }

  onUserChange(i: number, userIds: string[]): void {
    this.setTarget(i, { type: 'USER', userIds });
  }
}

import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import type {
  ServiceTaskInputMapping,
  ServiceTaskInputSource,
  ServiceTaskOutputMapping,
  ServiceTaskOutputTarget,
} from '../../core/models/service-task';

// Port của webapp/src/components/ServiceTaskMappingEditor.tsx — bảng sửa input/
// output mapping dùng chung ở drawer Tạo/Sửa cấu hình Service Task. React dùng
// generic component theo `mode`; Angular không tiện generic input/output nên gộp
// 2 nhánh trong cùng template, ép kiểu nội bộ như bản gốc.

export type ServiceTaskMappingEditorMode = 'input' | 'output';

const INPUT_SOURCE_OPTIONS: Array<{ label: string; value: ServiceTaskInputSource }> = [
  { label: 'Biến quy trình', value: 'variables' },
  { label: 'Hồ sơ', value: 'dossier' },
  { label: 'Biểu mẫu', value: 'form' },
  { label: 'Task', value: 'task' },
  { label: 'Người khởi tạo', value: 'initiator' },
  { label: 'Người xử lý', value: 'assignee' },
  { label: 'Đơn vị', value: 'org' },
  { label: 'Hệ thống', value: 'system' },
  { label: 'Output trước', value: 'previousOutput' },
];

const OUTPUT_TARGET_OPTIONS: Array<{ label: string; value: ServiceTaskOutputTarget }> = [
  { label: 'Biến quy trình', value: 'variables' },
  { label: 'Hồ sơ', value: 'dossier' },
  { label: 'Tham chiếu tích hợp', value: 'integrationRef' },
  { label: 'Metadata thực thi', value: 'executionMetadata' },
];

function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

@Component({
  selector: 'app-service-task-mapping-editor',
  imports: [
    FormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzTableModule,
    NzTypographyModule,
  ],
  templateUrl: './service-task-mapping-editor.html',
  styleUrl: './service-task-mapping-editor.scss',
})
export class ServiceTaskMappingEditor {
  readonly mode = input.required<ServiceTaskMappingEditorMode>();
  readonly value = input<ServiceTaskInputMapping[] | ServiceTaskOutputMapping[]>([]);
  readonly valueChange = output<ServiceTaskInputMapping[] | ServiceTaskOutputMapping[]>();

  readonly inputSourceOptions = INPUT_SOURCE_OPTIONS;
  readonly outputTargetOptions = OUTPUT_TARGET_OPTIONS;

  get inputRows(): ServiceTaskInputMapping[] {
    return this.value() as ServiceTaskInputMapping[];
  }

  get outputRows(): ServiceTaskOutputMapping[] {
    return this.value() as ServiceTaskOutputMapping[];
  }

  updateInput(rowId: string, patch: Partial<ServiceTaskInputMapping>): void {
    this.valueChange.emit(this.inputRows.map((row) => (row.id === rowId ? { ...row, ...patch } : row)));
  }

  removeInput(rowId: string): void {
    this.valueChange.emit(this.inputRows.filter((row) => row.id !== rowId));
  }

  addInput(): void {
    this.valueChange.emit([
      ...this.inputRows,
      { id: nextId('in'), target: '', expression: '', source: 'variables', required: false },
    ]);
  }

  updateOutput(rowId: string, patch: Partial<ServiceTaskOutputMapping>): void {
    this.valueChange.emit(this.outputRows.map((row) => (row.id === rowId ? { ...row, ...patch } : row)));
  }

  removeOutput(rowId: string): void {
    this.valueChange.emit(this.outputRows.filter((row) => row.id !== rowId));
  }

  addOutput(): void {
    this.valueChange.emit([...this.outputRows, { id: nextId('out'), sourcePath: '$.', target: 'variables', targetPath: '' }]);
  }
}

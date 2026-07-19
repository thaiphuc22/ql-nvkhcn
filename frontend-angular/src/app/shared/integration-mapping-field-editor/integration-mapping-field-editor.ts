import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import {
  MAPPING_FIELD_TYPE_LABEL,
  TRANSFORM_LABEL,
  type FieldMapping,
  type MappingFieldType,
  type TransformKind,
  type ValueMapping,
} from '../../core/models/integration-mapping';

// Port của webapp/src/components/MappingFieldEditor.tsx — soạn field mapping + value
// mapping cho 1 MappingConfig. Người dùng thao tác trên danh sách có cấu trúc, không
// nhập script tự do ("Transform có kiểm soát").

let uidSeq = 0;
function uid(): string {
  return `f-${Date.now().toString(36)}-${(uidSeq++).toString(36)}`;
}

export function newField(): FieldMapping {
  return { id: uid(), truongQTKHCN: '', kieuDuLieu: 'string', truongHeNgoai: '', batBuoc: false };
}

@Component({
  selector: 'app-integration-mapping-field-editor',
  imports: [FormsModule, NzButtonModule, NzIconModule, NzInputModule, NzSelectModule, NzSwitchModule, NzTagModule, NzTypographyModule],
  templateUrl: './integration-mapping-field-editor.html',
  styleUrl: './integration-mapping-field-editor.scss',
})
export class IntegrationMappingFieldEditor {
  readonly fields = input.required<FieldMapping[]>();
  readonly fieldsChange = output<FieldMapping[]>();

  readonly typeOptions = (Object.keys(MAPPING_FIELD_TYPE_LABEL) as MappingFieldType[]).map((v) => ({
    label: MAPPING_FIELD_TYPE_LABEL[v],
    value: v,
  }));
  readonly transformOptions = (Object.keys(TRANSFORM_LABEL) as TransformKind[]).map((v) => ({
    label: TRANSFORM_LABEL[v],
    value: v,
  }));

  needsValueMapping(field: FieldMapping): boolean {
    return field.kieuDuLieu === 'enum' || field.transform === 'enum-map';
  }

  update(id: string, patch: Partial<FieldMapping>): void {
    this.fieldsChange.emit(this.fields().map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  remove(id: string): void {
    this.fieldsChange.emit(this.fields().filter((f) => f.id !== id));
  }

  add(): void {
    this.fieldsChange.emit([...this.fields(), newField()]);
  }

  updateValueMappings(field: FieldMapping, rows: ValueMapping[]): void {
    this.update(field.id, { valueMappings: rows });
  }

  addValueMapping(field: FieldMapping): void {
    this.updateValueMappings(field, [...(field.valueMappings ?? []), { qtkhcn: '', heNgoai: '' }]);
  }

  updateValueMappingRow(field: FieldMapping, index: number, patch: Partial<ValueMapping>): void {
    const rows = (field.valueMappings ?? []).map((r, i) => (i === index ? { ...r, ...patch } : r));
    this.updateValueMappings(field, rows);
  }

  removeValueMappingRow(field: FieldMapping, index: number): void {
    this.updateValueMappings(field, (field.valueMappings ?? []).filter((_, i) => i !== index));
  }
}

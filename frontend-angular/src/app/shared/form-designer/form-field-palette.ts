import { Component, computed, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';

// Port của webapp/src/components/formdesign/FieldPalette.tsx (D13 — Lát A). Palette
// AntD tự viết cho Form Designer, NHƯNG vẫn dùng engine form-js:
//
//  • Kéo–thả: mỗi item mang đúng "class ma thuật" của form-js (wrapper
//    `fjs-palette-fields fjs-drag-container fjs-no-drop`, item `fjs-drag-copy` +
//    `data-field-type`). Dragula của form-js kiểm tra classList động khi mousedown
//    trên toàn document, nên item AntD ở dock vẫn thả xuống canvas → `createNewField`
//    của form-js tự thêm field. KHÔNG viết lại drag.
//  • Click: emit `add(type)` (FormDesigner → modeling.addFormField) thêm vào cuối
//    container đang chọn (group/dynamiclist) hoặc root.

interface PaletteEntry {
  type: string;
  label: string;
  icon: string;
}
interface PaletteGroup {
  id: string;
  title: string;
  entries: PaletteEntry[];
}

const GROUPS: PaletteGroup[] = [
  {
    id: 'input',
    title: 'Nhập liệu',
    entries: [
      { type: 'textfield', label: 'Ô chữ', icon: 'font-size' },
      { type: 'textarea', label: 'Ô nhiều dòng', icon: 'align-left' },
      { type: 'number', label: 'Số', icon: 'field-number' },
      { type: 'datetime', label: 'Ngày / giờ', icon: 'calendar' },
      { type: 'expression', label: 'Biểu thức (tự tính)', icon: 'function' },
      { type: 'filepicker', label: 'Tải tệp', icon: 'paper-clip' },
    ],
  },
  {
    id: 'selection',
    title: 'Lựa chọn',
    entries: [
      { type: 'checkbox', label: 'Hộp kiểm', icon: 'check-square' },
      { type: 'checklist', label: 'Danh sách kiểm', icon: 'unordered-list' },
      { type: 'radio', label: 'Chọn một (radio)', icon: 'check-circle' },
      { type: 'select', label: 'Danh sách thả xuống', icon: 'down-square' },
      { type: 'taglist', label: 'Nhãn nhiều chọn', icon: 'tags' },
    ],
  },
  {
    id: 'presentation',
    title: 'Trình bày',
    entries: [
      { type: 'text', label: 'Văn bản tĩnh', icon: 'file-text' },
      { type: 'html', label: 'HTML', icon: 'html5' },
      { type: 'image', label: 'Hình ảnh', icon: 'picture' },
      { type: 'table', label: 'Bảng dữ liệu', icon: 'table' },
      { type: 'separator', label: 'Đường kẻ', icon: 'minus' },
      { type: 'spacer', label: 'Khoảng trống', icon: 'column-height' },
    ],
  },
  {
    id: 'container',
    title: 'Bố cục / nhóm',
    entries: [
      { type: 'group', label: 'Nhóm', icon: 'group' },
      { type: 'dynamiclist', label: 'Bảng động', icon: 'block' },
    ],
  },
];

@Component({
  selector: 'app-form-field-palette',
  standalone: true,
  imports: [FormsModule, NzEmptyModule, NzIconModule, NzInputModule],
  templateUrl: './form-field-palette.html',
  styleUrl: './form-field-palette.scss',
})
export class FormFieldPaletteComponent {
  readonly add = output<string>();

  readonly query = signal('');

  readonly groups = computed<PaletteGroup[]>(() => {
    const kw = this.query().trim().toLowerCase();
    if (!kw) return GROUPS;
    return GROUPS.map((g) => ({
      ...g,
      entries: g.entries.filter((e) => e.label.toLowerCase().includes(kw) || e.type.includes(kw)),
    })).filter((g) => g.entries.length > 0);
  });
}

/*
 * Module `translate` cho @bpmn-io/form-js — Việt hoá nhãn (best-effort) cho palette
 * và properties panel NATIVE (hidden — engine service dùng, không hiển thị; xem
 * `form-designer.ts`) và MỘT SỐ chuỗi canvas đi qua service `translate`.
 * Port CHỈ phần dành cho form-js từ `webapp/src/branding/translate-vi.ts` (dictionary
 * gốc gộp chung bpmn-js + form-js) — không đụng
 * `shared/bpmn-modeler/bpmn-properties-i18n.ts` (đã port riêng cho BPMN modeler,
 * phạm vi khác, tránh trùng lặp bảo trì một dictionary lớn cho 2 việc không liên quan).
 */
import { isDevMode } from '@angular/core';

export const VI_DICT: Record<string, string> = {
  // ── Palette: nhóm + ô tìm kiếm ──────────────────────────────
  Components: 'Thành phần',
  Search: 'Tìm kiếm',
  'Search components': 'Tìm thành phần',
  'Basic input': 'Nhập cơ bản',
  Input: 'Nhập liệu',
  Selection: 'Lựa chọn',
  Presentation: 'Trình bày',
  Containers: 'Vùng chứa',
  Action: 'Hành động',
  'No components found.': 'Không có thành phần khớp.',

  // ── Palette: các loại field (label từ form-js-viewer) ───────
  'Text field': 'Trường văn bản',
  'Text area': 'Vùng văn bản',
  Number: 'Số',
  Date: 'Ngày',
  'Date time': 'Ngày / giờ',
  Datetime: 'Ngày / giờ',
  Checkbox: 'Ô kiểm',
  'Checkbox group': 'Nhóm ô kiểm',
  'Radio group': 'Nhóm chọn (Radio)',
  Radio: 'Chọn một (Radio)',
  Checklist: 'Danh sách kiểm',
  Select: 'Danh sách chọn',
  'Tag list': 'Danh sách thẻ',
  Taglist: 'Danh sách thẻ',
  'Text view': 'Văn bản hiển thị',
  'HTML view': 'Khối HTML',
  HTML: 'Khối HTML',
  'Image view': 'Hình ảnh',
  Image: 'Hình ảnh',
  Table: 'Bảng',
  Button: 'Nút',
  Group: 'Nhóm',
  'Dynamic list': 'Danh sách động',
  Spacer: 'Khoảng trống',
  Separator: 'Đường phân cách',
  'Expression field': 'Trường biểu thức',
  'File picker': 'Chọn tệp',
  iFrame: 'IFrame',
  IFrame: 'IFrame',
  'Document preview': 'Xem tài liệu',

  // ── Properties panel: nhóm & trường hay gặp ─────────────────
  General: 'Chung',
  'Field label': 'Nhãn trường',
  Key: 'Khoá (key)',
  ID: 'ID',
  Description: 'Mô tả',
  'Default value': 'Giá trị mặc định',
  Layout: 'Bố cục',
  Validation: 'Ràng buộc',
  Required: 'Bắt buộc',
  'Read only': 'Chỉ đọc',
  Disabled: 'Vô hiệu hoá',
  Options: 'Tùy chọn',
  'Options source': 'Nguồn tùy chọn',
  'Static options': 'Danh sách cố định',
  Condition: 'Điều kiện',
  'Hide if': 'Ẩn nếu',
  Appearance: 'Giao diện',
  Serialization: 'Tuần tự hoá',
  Constraints: 'Ràng buộc',
  Value: 'Giá trị',
  Label: 'Nhãn',
  Text: 'Nội dung',
  Columns: 'Cột',
  'Custom properties': 'Thuộc tính tuỳ biến',
  Properties: 'Thuộc tính',

  // ── Properties panel (form designer): placeholder + entry hay gặp ──
  'Select a form field to edit its properties.': 'Chọn một trường để chỉnh thuộc tính.',
  'Multiple form fields are selected. Select a single form field to edit its properties.':
    'Đang chọn nhiều trường. Hãy chọn một trường để chỉnh thuộc tính.',
  'Validation pattern': 'Mẫu kiểm tra (regex)',
  'Minimum length': 'Độ dài tối thiểu',
  'Maximum length': 'Độ dài tối đa',
  'Custom regular expression': 'Biểu thức chính quy tuỳ chỉnh',
  Minimum: 'Giá trị nhỏ nhất',
  Maximum: 'Giá trị lớn nhất',
  'Decimal digits': 'Số chữ số thập phân',
  Increment: 'Bước tăng',
  'Field description': 'Mô tả trường',
  'Date label': 'Nhãn ngày',
  'Time label': 'Nhãn giờ',
  'Time format': 'Định dạng giờ',
  'Time interval': 'Bước thời gian (phút)',
  'Disallow past dates': 'Không cho chọn ngày quá khứ',
  Subtype: 'Kiểu con',
  'Use 24h': 'Dùng định dạng 24 giờ',
  Searchable: 'Cho phép tìm kiếm',
  'Input values key': 'Key nguồn dữ liệu (biến)',
  'Options expression': 'Biểu thức tùy chọn',
  Expression: 'Biểu thức',
  'Row count': 'Số dòng',
  'Vertical alignment': 'Căn dọc',
  'Headers source': 'Nguồn cột',
  'Data source': 'Nguồn dữ liệu',
  'Default rows expanded': 'Số dòng mặc định',
  'Alternative text': 'Văn bản thay thế (alt)',
  'Source link': 'Liên kết nguồn',
  Height: 'Chiều cao',
  'Max height': 'Chiều cao tối đa',
  Security: 'Bảo mật',
  'Security attributes': 'Thuộc tính bảo mật',
  'Allow scripts': 'Cho phép script',
  'Same origin': 'Cùng nguồn gốc (same-origin)',
  'Prefix adorner': 'Tiền tố hiển thị',
  'Suffix adorner': 'Hậu tố hiển thị',
  Placeholder: 'Gợi ý trong ô nhập (placeholder)',
};

const missing = new Set<string>();
if (isDevMode() && typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>)['__viMissingFormJs'] = () => {
    // eslint-disable-next-line no-console
    console.table([...missing].sort().map((s) => ({ 'chuỗi chưa dịch': s })));
    return missing.size;
  };
}

export function translateVi(template: string, replacements?: Record<string, string>): string {
  const msg = VI_DICT[template] ?? template;
  if (isDevMode() && !(template in VI_DICT) && /[A-Za-z]/.test(template)) {
    missing.add(template);
  }
  return msg.replace(/{([^}]+)}/g, (_m, key: string) => (replacements && key in replacements ? String(replacements[key]) : '{' + key + '}'));
}

/** Module didi ghi đè service `translate`. Nạp qua additionalModules của FormEditor. */
export const TranslateViModule = {
  translate: ['value', translateVi],
};

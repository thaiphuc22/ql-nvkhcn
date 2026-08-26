/**
 * Kết xuất bảng ra file mở được bằng Excel — **không thêm dependency**.
 *
 * Cách làm: ghi một bảng HTML rồi đặt tên `.xls`; Excel/LibreOffice đọc được định dạng này từ đời
 * Excel 2003 và vẫn mở bình thường tới nay. Đường tải file dùng `Blob` + `URL.createObjectURL` +
 * `<a download>` — đúng cách `pages/bpmn-editor/bpmn-editor.ts` đang kết xuất BPMN, giữ một lối
 * tải file duy nhất trong app.
 *
 * ⚠ Đây KHÔNG phải `.xlsx` chuẩn OOXML. Excel có thể hiện cảnh báo "định dạng không khớp phần mở
 * rộng" ở một số cấu hình bảo mật. Nếu khách bắt buộc `.xlsx` thật thì phải cân nhắc SheetJS —
 * **quyết định riêng, không tự thêm** (plan §4.3).
 */

export interface ExportColumn<T> {
  header: string;
  value: (row: T) => string | number;
}

function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function taiFile(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

/** Chuẩn hoá tên file: bỏ ký tự Windows cấm, gắn đuôi nếu thiếu. */
export function safeFileName(name: string, ext: string): string {
  const base = name.replace(/[\\/:*?"<>|]/g, '-').trim() || 'export';
  return base.toLowerCase().endsWith(ext) ? base : `${base}${ext}`;
}

/**
 * Xuất `rows` ra `.xls`. `BOM` UTF-8 ở đầu file là bắt buộc — thiếu nó Excel đọc tiếng Việt thành
 * ký tự rác, và đó là lỗi người dùng báo lại chứ không phải lỗi thấy ngay khi code.
 */
export function exportTableToXls<T>(
  rows: readonly T[],
  columns: readonly ExportColumn<T>[],
  fileName: string,
  tieuDe?: string,
): void {
  const head = columns.map((c) => `<th>${escapeHtml(c.header)}</th>`).join('');
  const body = rows
    .map((row) => `<tr>${columns.map((c) => `<td>${escapeHtml(c.value(row))}</td>`).join('')}</tr>`)
    .join('');
  const caption = tieuDe
    ? `<caption style="font-size:14pt;font-weight:bold;text-align:left">${escapeHtml(tieuDe)}</caption>`
    : '';

  const html = `﻿<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8" />
<style>table{border-collapse:collapse}th,td{border:1px solid #999;padding:4px 8px;font-family:Arial;font-size:10pt}
th{background:#f1f0f4;font-weight:bold}</style></head><body>
<table>${caption}<thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`;

  taiFile(new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' }), safeFileName(fileName, '.xls'));
}

/** Xuất một chuỗi CSV (dùng cho file mẫu import). */
export function exportCsv(content: string, fileName: string): void {
  taiFile(new Blob([`﻿${content}`], { type: 'text/csv;charset=utf-8' }), safeFileName(fileName, '.csv'));
}

import type { ColumnDefinition } from '@khcn-core/ui';

/**
 * Dựng `columns` cho `<ubck-table>` — **luôn đi qua hàm này**, đừng viết mảng thẳng.
 *
 * `ColumnDefinition.index` khai là **tuỳ chọn** trong `khcn-core-ui.d.ts`, nhưng thân bảng lại lọc
 * cột bằng chính nó:
 *
 * ```js
 * function computedColumn(columns) {
 *   return columns?.flat()?.filter((item) => item?.index)?.sort(...) ?? [];
 * }
 * ```
 *
 * Cột thiếu `index` ⇒ **biến mất khỏi thân bảng**, trong khi hàng tiêu đề (đọc thẳng `columns`) vẫn
 * hiện đủ. Triệu chứng là bảng có 14 tiêu đề, đúng số dòng, mà mọi ô đều trống — không lỗi, không
 * cảnh báo. Phát hiện 2026-08-27 khi soi bằng mắt theo §10.4; đo trước đó (chiều cao ô 56, header
 * 40…) đều "đạt" vì các con số ấy vẫn đúng trên một cái bảng rỗng.
 *
 * Đây là chỗ thứ **5** thư viện không dùng được như kế hoạch giả định — ghi cùng 4 chỗ kia trong
 * `docs/plan/hr-tools-chuyen-sang-khcn-core-2026-08-26.md`.
 *
 * Đánh số theo thứ tự khai (1..n) nên thứ tự cột trong mã nguồn chính là thứ tự hiển thị, và mảng
 * ngoài (các hàng tiêu đề) do hàm bọc luôn — HR Tools chỉ dùng một hàng tiêu đề.
 */
export function hrColumns(cols: readonly ColumnDefinition[]): ColumnDefinition[][] {
  return [cols.map((col, i) => ({ ...col, index: i + 1 }))];
}

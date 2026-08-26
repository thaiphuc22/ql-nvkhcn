import type { PaginatorProps } from '@khcn-core/ui';

/**
 * Bộ chọn số bản ghi/trang dùng chung cho mọi bảng HR Tools.
 *
 * **25 là mặc định** (`HR_PAGE_SIZE_MAC_DINH`), theo `docs/design-system/screens/01` — không phải 10 như
 * phân hệ Danh mục dùng chung đang chạy. Đây là chỗ DS và bản đã build lệch nhau mà D23 **không**
 * xử lý, vì nó là quy ước nghiệp vụ (bảng CPNC dài, 10 dòng/trang là phải bấm quá nhiều) chứ không
 * phải điểm nhận diện giao diện. Đổi mặc định thì đổi ở đây, không đổi rải rác từng màn.
 */
export const HR_PAGE_SIZE_OPTIONS: readonly number[] = [10, 25, 50, 100];

/** Số bản ghi/trang mặc định. Tách hằng riêng để `signal(HR_PAGE_SIZE_MAC_DINH)` ra kiểu `number`
 *  chứ không phải literal `25` — signal literal thì `pageSize.set(50)` sẽ đỏ ở TypeScript. */
export const HR_PAGE_SIZE_MAC_DINH = 25;

/**
 * Dựng `PaginatorProps` cho `<ubck-paginator>` từ state phân trang của trang.
 *
 * Có hàm này thay vì viết thẳng object ở 4 màn để bộ nhãn/tuỳ chọn không lệch nhau sau vài lần sửa.
 *
 * ⚠ `showCurrentPageReport` của `UBCKPaginator` **không** mang nghĩa như tên gọi: nó bật/tắt cụm
 * *"Hiển thị bản ghi/trang: [25 ▾]"* bên TRÁI, chứ không phải dòng "trang X trên Y". Còn
 * `showTotalRecords` mới là *"Tổng số bản ghi: N"* bên PHẢI. Cả hai đều thuộc bản thiết kế nên đều
 * bật; đọc nhầm tên rồi tắt đi là mất luôn ô đổi số bản ghi/trang.
 */
export function hrPaginatorProps(
  total: number,
  pageIndex: number,
  pageSize: number,
): PaginatorProps {
  return {
    totalRecords: total,
    currentPage: pageIndex,
    recordPerPage: pageSize,
    rows: pageSize,
    first: (pageIndex - 1) * pageSize,
    rowsPerPageOptions: HR_PAGE_SIZE_OPTIONS.map((value) => ({ value, label: String(value) })),
    showCurrentPageReport: true,
    showTotalRecords: true,
    showFirstLastIcon: true,
    alwaysShow: true,
  };
}

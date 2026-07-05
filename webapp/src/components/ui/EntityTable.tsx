import type { ReactNode } from 'react'
import { Empty, Table } from 'antd'
import type { TableProps } from 'antd'

export interface EntityTableProps<T> extends Omit<TableProps<T>, 'onRow' | 'locale'> {
  /** Nội dung khi rỗng (mặc định "Không có dữ liệu."). */
  emptyText?: ReactNode
  /** Bấm 1 dòng → gọi callback (thường điều hướng); tự thêm con trỏ tay. */
  onRowClick?: (record: T) => void
  /** Số dòng mỗi trang (mặc định 10). Bỏ qua nếu `pagination={false}`. */
  pageSize?: number
}

/**
 * Chiều cao vùng cuộn dọc mặc định cho BẢNG DANH SÁCH cấp trang — chừa chỗ cho
 * PageHeader + StatCard + FilterBar + thanh phân trang phía dưới. Nhờ vậy chỉ
 * phần thân bảng cuộn, còn tiêu đề/bộ lọc luôn cố định. Bảng nhúng trong trang
 * chi tiết KHÔNG truyền `scroll` nên giữ nguyên hành vi cũ (cao theo nội dung).
 */
export const LIST_SCROLL_Y = 'calc(100vh - 360px)'

/**
 * Bảng chuẩn: phân trang mặc định (luôn hiện, cho chọn số dòng/trang),
 * empty chuẩn, tự chống tràn ngang (`scroll.x`), và điều hướng khi bấm dòng.
 * Truyền `pagination={false}` cho bảng nhúng (không phân trang) và
 * `scroll={{ y: LIST_SCROLL_Y }}` cho bảng danh sách cấp trang để có vùng cuộn riêng.
 * Dùng ở mọi trang có bảng — sửa hành vi mặc định một nơi, mọi bảng đổi theo.
 */
export default function EntityTable<T extends object>({
  emptyText = 'Không có dữ liệu.',
  onRowClick,
  pagination,
  pageSize = 10,
  scroll,
  ...rest
}: EntityTableProps<T>) {
  return (
    <Table<T>
      {...rest}
      // Luôn có scroll.x='max-content' để cột px cố định không tràn ngang; giữ
      // nguyên scroll.y do trang truyền vào (nếu có) để tạo vùng cuộn dọc riêng.
      scroll={{ x: 'max-content', ...scroll }}
      pagination={
        pagination === undefined
          ? {
              pageSize,
              showSizeChanger: true,
              pageSizeOptions: [10, 20, 50, 100],
              showTotal: (total) => `Tổng ${total} dòng`,
            }
          : pagination
      }
      onRow={onRowClick ? (record) => ({ onClick: () => onRowClick(record), style: { cursor: 'pointer' } }) : undefined}
      locale={{ emptyText: <Empty description={emptyText} /> }}
    />
  )
}

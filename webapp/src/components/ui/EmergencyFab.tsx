import type { ReactNode } from 'react'
import { Tooltip } from 'antd'
import { AlertFilled } from '@ant-design/icons'

export interface EmergencyFabProps {
  onClick: () => void
  /** Tooltip khi rê chuột. */
  title?: string
  icon?: ReactNode
}

/**
 * Nút hành động nổi (FAB) khẩn cấp theo mẫu Stitch: tròn đỏ, cố định góc dưới-phải,
 * đổ bóng đỏ (glow) qua class `.vht-fab`. Dùng cho hành động ưu tiên cao (báo sự cố).
 */
export default function EmergencyFab({ onClick, title = 'Báo sự cố khẩn', icon }: EmergencyFabProps) {
  return (
    <Tooltip title={title} placement="left">
      <button className="vht-fab" onClick={onClick} aria-label={title} type="button">
        {icon ?? <AlertFilled />}
      </button>
    </Tooltip>
  )
}

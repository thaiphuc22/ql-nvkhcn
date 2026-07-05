import type { ReactNode } from 'react'

export interface EmptyStateProps {
  /** Tiêu đề (VD "Chưa có nhiệm vụ"). */
  title?: ReactNode
  /** Mô tả phụ. */
  description?: ReactNode
  /** Nút hành động (VD "Tạo nhiệm vụ đầu tiên"). */
  action?: ReactNode
  /** Gọn lại để nhúng trong bảng (SVG nhỏ, ít khoảng đệm). */
  compact?: boolean
}

/**
 * Trạng thái rỗng theo design system Stitch: minh hoạ line-art (SVG) màu đỏ mờ +
 * tiêu đề + mô tả + nút hành động. `compact` cho ô rỗng của bảng; mặc định (full)
 * cho khu vực rỗng cấp trang.
 */
export default function EmptyState({ title, description, action, compact }: EmptyStateProps) {
  const svgW = compact ? 132 : 200
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: compact ? 8 : 16,
        padding: compact ? '20px 16px' : '48px 24px',
      }}
    >
      {/* Line-art minh hoạ (trích design-system.md) */}
      <svg
        width={svgW}
        viewBox="0 0 240 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ color: 'var(--vht-red)', opacity: 0.2 }}
        aria-hidden
      >
        <rect x="70" y="40" width="100" height="80" rx="4" stroke="currentColor" strokeWidth="2" />
        <path d="M70 60H170" stroke="currentColor" strokeWidth="2" />
        <circle cx="120" cy="85" r="15" stroke="currentColor" strokeWidth="2" />
        <path d="M120 70V100M105 85H135" stroke="currentColor" strokeWidth="2" />
        <path d="M40 20L60 40M200 20L180 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>

      <div style={{ maxWidth: 420 }}>
        {title && (
          <div style={{ fontSize: compact ? 15 : 20, fontWeight: 700, color: 'var(--vht-ink)' }}>{title}</div>
        )}
        {description && (
          <div style={{ marginTop: 4, color: 'var(--vht-ink-2)', fontSize: compact ? 13 : 15 }}>{description}</div>
        )}
      </div>

      {action && <div style={{ marginTop: compact ? 2 : 4 }}>{action}</div>}
    </div>
  )
}

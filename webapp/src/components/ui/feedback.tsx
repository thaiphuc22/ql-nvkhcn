import type { ReactNode } from 'react'
import { App } from 'antd'
import {
  CheckCircleFilled,
  WarningFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
} from '@ant-design/icons'

/* Màu ngữ nghĩa (design-system.md) */
const GREEN = '#006e0d'
const AMBER = '#daa520'
const RED = '#bf0027'

/**
 * Toast thông báo theo mẫu Stitch (success / warning / critical): icon tròn màu
 * ngữ nghĩa + tiêu đề + mô tả + vạch nhấn bên trái. Bọc antd `notification` để
 * ăn theme + context. Dùng: `const toast = useToast(); toast.critical('...', '...')`.
 */
export function useToast() {
  const { notification } = App.useApp()

  const open = (accent: string, icon: ReactNode) => (message: ReactNode, description?: ReactNode) =>
    notification.open({
      message,
      description,
      icon,
      placement: 'topRight',
      style: { borderInlineStart: `4px solid ${accent}`, borderRadius: 8 },
    })

  return {
    success: open(GREEN, <CheckCircleFilled style={{ color: GREEN }} />),
    warning: open(AMBER, <WarningFilled style={{ color: AMBER }} />),
    critical: open(RED, <CloseCircleFilled style={{ color: RED }} />),
  }
}

export interface ConfirmConfig {
  title: ReactNode
  content?: ReactNode
  okText?: string
  cancelText?: string
  /** Nút xác nhận màu nguy hiểm (đỏ đậm) thay vì đỏ brand. */
  danger?: boolean
  onOk?: () => void | Promise<void>
}

/**
 * Modal xác nhận theo mẫu Stitch: viền TRÊN đỏ 4px (class `.vht-modal-topred`),
 * icon cảnh báo, 2 nút Huỷ / Xác nhận. Dùng cho hành động không hoàn tác.
 */
export function useConfirm() {
  const { modal } = App.useApp()
  return (cfg: ConfirmConfig) =>
    modal.confirm({
      title: cfg.title,
      content: cfg.content,
      icon: <ExclamationCircleFilled style={{ color: RED }} />,
      okText: cfg.okText ?? 'Xác nhận',
      cancelText: cfg.cancelText ?? 'Huỷ',
      okButtonProps: { danger: cfg.danger },
      className: 'vht-modal-topred',
      onOk: cfg.onOk,
    })
}

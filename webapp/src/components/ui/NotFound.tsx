import type { ReactNode } from 'react'
import { Button, Result } from 'antd'

export interface NotFoundProps {
  title: string
  subTitle?: ReactNode
  onBack: () => void
  backText?: string
}

/** Màn 404 chuẩn khi không tìm thấy bản ghi (quy trình / hồ sơ...). */
export default function NotFound({ title, subTitle, onBack, backText = 'Quay lại' }: NotFoundProps) {
  return (
    <Result
      status="404"
      title={title}
      subTitle={subTitle}
      extra={<Button type="primary" onClick={onBack}>{backText}</Button>}
    />
  )
}

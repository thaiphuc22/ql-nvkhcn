import { useEffect, type CSSProperties, type ReactNode } from 'react'
import { Button, Col, Row, Space, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useBreadcrumb, type Crumb } from '../../store/BreadcrumbContext'

const { Title } = Typography

export interface PageHeaderProps {
  /** Tiêu đề chính (Title level 3). */
  title: ReactNode
  /** Icon lớn bên trái tiêu đề. */
  icon?: ReactNode
  /** Tag trạng thái đặt cạnh tiêu đề. */
  tag?: ReactNode
  /** Dòng mã/metadata nhỏ dưới tiêu đề. */
  code?: ReactNode
  /** Có → hiện nút quay lại (mũi tên) bên trái. */
  onBack?: () => void
  /** Breadcrumb — KHÔNG render tại chỗ; đẩy lên Header layout (một nơi duy nhất). */
  breadcrumb?: Crumb[]
  /** Cụm hành động bên phải (nút bấm...). */
  extra?: ReactNode
  style?: CSSProperties
}

/**
 * Header chuẩn cho mọi trang: nút quay lại + icon + tiêu đề + tag + dòng mã, và
 * cụm hành động bên phải. Breadcrumb được đẩy lên Header của layout (gộp về một
 * nơi). Sửa ở đây → mọi trang đổi theo.
 */
export default function PageHeader({ title, icon, tag, code, onBack, breadcrumb, extra, style }: PageHeaderProps) {
  const { setCrumbs } = useBreadcrumb()
  // Chỉ đồng bộ lại khi NỘI DUNG breadcrumb đổi (so bằng chuỗi), tránh loop.
  const key = JSON.stringify(breadcrumb ?? [])
  useEffect(() => {
    setCrumbs(breadcrumb ?? null)
    return () => setCrumbs(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return (
    <div style={{ marginBottom: 18, ...style }}>
      <Row justify="space-between" align="middle" gutter={[12, 12]}>
        <Col>
          <Space align="center" size={12}>
            {onBack && <Button icon={<ArrowLeftOutlined />} onClick={onBack} />}
            {icon}
            <div>
              <Space align="center" size={10} wrap>
                <Title level={3} style={{ margin: 0 }}>{title}</Title>
                {tag}
              </Space>
              {code && <div>{code}</div>}
            </div>
          </Space>
        </Col>
        {extra && <Col>{extra}</Col>}
      </Row>
    </div>
  )
}

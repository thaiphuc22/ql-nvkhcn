import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Typography, Tag, Space, Button, Result, Descriptions, Badge, Row, Col } from 'antd'
import {
  HomeOutlined,
  SafetyOutlined,
  DatabaseOutlined,
  PartitionOutlined,
  ShoppingOutlined,
  DollarOutlined,
  InboxOutlined,
  AppstoreOutlined,
  ArrowLeftOutlined,
  LockOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { PageHeader } from '../components/ui'
import { usePermissions } from '../store/AuthContext'
import { DANH_SACH_PHAN_HE, getPhanHeStatus, type PhanHePermissions } from '../data/phanHe'
import { openAppRoute } from '../utils/navigation'

const { Text, Paragraph } = Typography

const ICON_MAP: Record<string, React.ReactNode> = {
  HomeOutlined: <HomeOutlined />,
  SafetyOutlined: <SafetyOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  PartitionOutlined: <PartitionOutlined />,
  ShoppingOutlined: <ShoppingOutlined />,
  DollarOutlined: <DollarOutlined />,
  InboxOutlined: <InboxOutlined />,
}

const STATUS_META: Record<string, { label: string; color: string; badge: 'processing' | 'default' | 'error' }> = {
  active: { label: 'Đang hoạt động', color: '#52c41a', badge: 'processing' },
  'no-permission': { label: 'Chưa được cấp quyền', color: '#999', badge: 'default' },
  'coming-soon': { label: 'Sắp ra mắt', color: '#fa8c16', badge: 'default' },
  maintenance: { label: 'Đang bảo trì', color: '#ff4d4f', badge: 'error' },
}

export default function PhanHePage({ phanHeId }: { phanHeId?: string }) {
  const { id: paramId } = useParams<{ id: string }>()
  const id = phanHeId ?? paramId
  const navigate = useNavigate()
  const perms = usePermissions()

  const permCtx: PhanHePermissions = useMemo(
    () => ({
      admin: perms.admin,
      canManageSystem: perms.canManageSystem,
      isChuNhiemDeTai: perms.isChuNhiemDeTai,
    }),
    [perms.admin, perms.canManageSystem, perms.isChuNhiemDeTai],
  )

  const ph = useMemo(() => DANH_SACH_PHAN_HE.find((p) => p.id === id), [id])
  const status = useMemo(() => (ph ? getPhanHeStatus(ph, permCtx) : null), [ph, permCtx])

  if (!ph) {
    return (
      <Result
        status="404"
        title="Không tìm thấy phân hệ"
        subTitle={`Phân hệ "${id}" không tồn tại trong hệ thống.`}
        extra={
          <Button type="primary" onClick={() => navigate('/danh-sach-phan-he')}>
            Về Danh sách Phân hệ
          </Button>
        }
      />
    )
  }

  const meta = status ? STATUS_META[status] : undefined
  const isDisabled = status !== 'active'

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <PageHeader
        title={
          <Space>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/danh-sach-phan-he')}
            />
            <span>{ph.ten}</span>
            {meta && <Badge status={meta.badge} text={meta.label} />}
          </Space>
        }
        breadcrumb={[
          { label: 'Danh sách Phân hệ', to: '/danh-sach-phan-he' },
          { label: ph.ten },
        ]}
        code={ph.moTa}
      />

      {/* Header card */}
      <div
        style={{
          borderRadius: 12,
          border: `1px solid ${isDisabled ? '#f0f0f0' : `${ph.color}20`}`,
          background: '#fff',
          padding: 28,
          marginBottom: 24,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 18,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: isDisabled ? '#e8e8e8' : `${ph.color}15`,
            color: isDisabled ? '#bbb' : ph.color,
            display: 'grid',
            placeItems: 'center',
            fontSize: 24,
            flexShrink: 0,
          }}
        >
          {ICON_MAP[ph.icon] ?? <AppstoreOutlined />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Text strong style={{ fontSize: 18 }}>{ph.ten}</Text>
            <Tag style={{ borderRadius: 4, background: '#f5f5f5', border: 'none', color: '#999', fontSize: 11, fontWeight: 600 }}>{ph.id}</Tag>
            {status === 'no-permission' && (
              <Tag icon={<LockOutlined />} color="default">Chưa có quyền</Tag>
            )}
            {status === 'coming-soon' && (
              <Tag color="orange">Sắp ra mắt</Tag>
            )}
          </div>
          <Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 12 }}>
            {ph.moTa}
          </Paragraph>
          {ph.estimatedRelease && (
            <Text type="warning" style={{ fontSize: 12 }}>⏳ {ph.estimatedRelease}</Text>
          )}
        </div>
      </div>

      {/* Modules */}
      {ph.modules.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>
            Các module trong phân hệ
          </Text>
          <Row gutter={[12, 12]}>
            {ph.modules.map((m) => (
              <Col key={m.route} xs={24} sm={12}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (!isDisabled) openAppRoute(m.route)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isDisabled) openAppRoute(m.route)
                  }}
                  style={{
                    borderRadius: 8,
                    border: `1px solid ${isDisabled ? '#f0f0f0' : `${ph.color}18`}`,
                    padding: '14px 16px',
                    cursor: isDisabled ? 'default' : 'pointer',
                    opacity: isDisabled ? 0.55 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isDisabled) {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = `${ph.color}40`
                      el.style.background = `${ph.color}04`
                    }
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = isDisabled ? '#f0f0f0' : `${ph.color}18`
                    el.style.background = '#fff'
                  }}
                >
                  <Text>{m.label}</Text>
                  {!isDisabled && <RightOutlined style={{ color: ph.color, fontSize: 12 }} />}
                </div>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Meta info */}
      <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Mã phân hệ">{ph.id}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái hệ thống">
          <Badge status={ph.trangThai === 'active' ? 'processing' : 'default'} text={ph.trangThai === 'active' ? 'Đang hoạt động' : 'Sắp ra mắt'} />
        </Descriptions.Item>
        <Descriptions.Item label="Số module">{ph.modules.length}</Descriptions.Item>
        <Descriptions.Item label="Quyền của bạn">{meta?.label ?? '—'}</Descriptions.Item>
      </Descriptions>

      {/* No permission hint */}
      {status === 'no-permission' && (
        <div
          style={{
            borderRadius: 8,
            background: '#fffbe6',
            border: '1px solid #ffe58f',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#ad6800',
            fontSize: 13,
          }}
        >
          <LockOutlined />
          Bạn chưa được cấp quyền vào phân hệ này. Vui lòng liên hệ quản trị viên để được cấp quyền.
        </div>
      )}
    </div>
  )
}

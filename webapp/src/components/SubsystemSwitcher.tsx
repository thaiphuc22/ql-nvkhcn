import { useMemo } from 'react'
import { Popover, Space, Typography, Tag, theme, Button } from 'antd'
import {
  HomeOutlined,
  SafetyOutlined,
  DatabaseOutlined,
  PartitionOutlined,
  ShoppingOutlined,
  DollarOutlined,
  InboxOutlined,
  AppstoreOutlined,
  LockOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { usePermissions } from '../store/AuthContext'
import {
  DANH_SACH_PHAN_HE,
  getPhanHeStatus,
  type PhanHe,
  type PhanHePermissions,
  type PhanHeStatus,
} from '../data/phanHe'

const { Text } = Typography

/** Map tên icon string → component thật. */
const ICON_MAP: Record<string, React.ReactNode> = {
  HomeOutlined: <HomeOutlined />,
  SafetyOutlined: <SafetyOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  PartitionOutlined: <PartitionOutlined />,
  ShoppingOutlined: <ShoppingOutlined />,
  DollarOutlined: <DollarOutlined />,
  InboxOutlined: <InboxOutlined />,
}

const STATUS_LABEL: Record<PhanHeStatus, string> = {
  active: 'Đang hoạt động',
  'no-permission': 'Chưa có quyền',
  'coming-soon': 'Sắp ra mắt',
  maintenance: 'Bảo trì',
}

function PhanHeRow({
  ph,
  status,
  onClick,
}: {
  ph: PhanHe
  status: PhanHeStatus
  onClick: () => void
}) {
  const { token } = theme.useToken()
  const isDisabled = status !== 'active'

  return (
    <div
      onClick={isDisabled ? undefined : onClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '10px 12px',
        borderRadius: token.borderRadiusLG,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.55 : 1,
        background: 'transparent',
        transition: 'background 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!isDisabled)
          (e.currentTarget as HTMLElement).style.background = token.colorFillSecondary
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'transparent'
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: isDisabled ? '#f5f5f5' : `${ph.color}15`,
          color: isDisabled ? '#ccc' : ph.color,
          display: 'grid',
          placeItems: 'center',
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        {ICON_MAP[ph.icon] ?? <AppstoreOutlined />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Text strong style={{ fontSize: 13, lineHeight: '20px' }}>
            {ph.ten}
          </Text>
          {status === 'no-permission' && (
            <LockOutlined style={{ fontSize: 11, color: '#999' }} />
          )}
          {status === 'coming-soon' && (
            <Tag
              color="default"
              style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px', margin: 0 }}
            >
              {STATUS_LABEL[status]}
            </Tag>
          )}
        </div>
        <Text
          type="secondary"
          style={{ fontSize: 11, lineHeight: '16px' }}
          ellipsis
        >
          {status === 'no-permission' ? 'Bạn chưa được cấp quyền vào phân hệ này' : ph.moTa}
        </Text>
      </div>
    </div>
  )
}

export default function SubsystemSwitcher() {
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

  const items = useMemo(
    () =>
      DANH_SACH_PHAN_HE.map((ph) => ({
        ph,
        status: getPhanHeStatus(ph, permCtx),
      })),
    [permCtx],
  )

  const activeCount = items.filter((i) => i.status === 'active').length

  const content = useMemo(
    () => (
      <div style={{ width: 400, maxWidth: 'calc(100vw - 48px)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
            padding: '0 4px',
          }}
        >
          <Text strong style={{ fontSize: 13 }}>
            Danh sách Phân hệ
          </Text>
          <Space size={4}>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {activeCount}/{items.length} khả dụng
            </Text>
            <Button
              type="text"
              size="small"
              icon={<ArrowRightOutlined />}
              onClick={() => navigate('/danh-sach-phan-he')}
              style={{ color: 'var(--vht-red, #bf0027)' }}
            />
          </Space>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map(({ ph, status }) => (
            <PhanHeRow
              key={ph.id}
              ph={ph}
              status={status}
              onClick={() => {
                if (status === 'active') window.open(ph.route, '_blank')
              }}
            />
          ))}
        </div>
      </div>
    ),
    [items, activeCount, navigate],
  )

  return (
    <Popover
      content={content}
      trigger="hover"
      placement="bottomRight"
      overlayStyle={{ maxWidth: 'calc(100vw - 32px)' }}
      mouseEnterDelay={0.15}
      mouseLeaveDelay={0.1}
    >
      <Space
        style={{
          cursor: 'pointer',
          color: 'var(--vht-red, #bf0027)',
          padding: '6px 8px',
          borderRadius: 8,
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = '#fff2f0'
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'transparent'
        }}
        onClick={() => navigate('/danh-sach-phan-he')}
      >
        <AppstoreOutlined style={{ fontSize: 20 }} />
      </Space>
    </Popover>
  )
}

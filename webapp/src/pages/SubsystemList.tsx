import { useState, useMemo, useCallback, useEffect } from 'react'
import { Typography, Input, Row, Col, Space, Button, Dropdown, Tooltip } from 'antd'
import {
  HomeOutlined,
  SafetyOutlined,
  DatabaseOutlined,
  PartitionOutlined,
  ShoppingOutlined,
  DollarOutlined,
  InboxOutlined,
  AppstoreOutlined,
  SearchOutlined,
  ExperimentOutlined,
  DeploymentUnitOutlined,
  ClockCircleOutlined,
  RocketOutlined,
  PushpinOutlined,
  PushpinFilled,
  LockOutlined,
  DownOutlined,
  ArrowRightOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { PageHeader } from '../components/ui'
import { usePermissions } from '../store/AuthContext'
import {
  DANH_SACH_PHAN_HE,
  getPhanHeStatus,
  normalizeVietnamese,
  type PhanHe,
  type PhanHeStatus,
  type PhanHePermissions,
} from '../data/phanHe'

const { Text, Paragraph } = Typography

/* ---------- localStorage keys ---------- */
const LS_RECENT = 'qtkhcn.phanhe.recent'
const LS_PINNED = 'qtkhcn.phanhe.pinned'
const MAX_RECENT = 3

/* ---------- icon map ---------- */
const ICON_MAP: Record<string, React.ReactNode> = {
  HomeOutlined: <HomeOutlined />,
  SafetyOutlined: <SafetyOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  PartitionOutlined: <PartitionOutlined />,
  ShoppingOutlined: <ShoppingOutlined />,
  DollarOutlined: <DollarOutlined />,
  InboxOutlined: <InboxOutlined />,
}

/* ---------- helpers ---------- */
function loadIds(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}
function saveIds(key: string, ids: string[]) {
  localStorage.setItem(key, JSON.stringify(ids))
}

function recordRecent(id: string) {
  const recent = loadIds(LS_RECENT).filter((x) => x !== id)
  recent.unshift(id)
  saveIds(LS_RECENT, recent.slice(0, MAX_RECENT))
}

function togglePinned(id: string): boolean {
  const pinned = loadIds(LS_PINNED)
  const idx = pinned.indexOf(id)
  if (idx >= 0) {
    pinned.splice(idx, 1)
    saveIds(LS_PINNED, pinned)
    return false
  }
  pinned.push(id)
  saveIds(LS_PINNED, pinned)
  return true
}

/* ================================================================
   ConstellationLines — L5 của nền blueprint (xem tokens.css).
   Các đường nối giữa nút kiến thức "tự vẽ ra" 1 lần khi mount
   (stroke-dashoffset 1→0, stagger theo delay); node chấm mờ dần hiện.
   Tọa độ theo viewBox 0..100 (%), 2 hub đầu khớp --blueprint-hub1/2.
   ================================================================ */
const CONSTELLATION_NODES: Array<[number, number]> = [
  [72, 35], // hub 1 — khớp --blueprint-hub1-x/y
  [28, 62], // hub 2 — khớp --blueprint-hub2-x/y
  [38, 12],
  [58, 22],
  [90, 14],
  [94, 52],
  [6, 48],
  [14, 88],
  [52, 86],
  [80, 78],
  [10, 18],
]
const CONSTELLATION_EDGES: Array<[number, number]> = [
  [0, 2], [0, 3], [0, 4], [0, 5], [0, 1],
  [1, 6], [1, 7], [1, 8], [1, 9],
  [10, 2], [5, 9],
]

function ConstellationLines() {
  return (
    <svg
      className="qtkhcn-constellation"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {CONSTELLATION_EDGES.map(([a, b], i) => {
        const [x1, y1] = CONSTELLATION_NODES[a]
        const [x2, y2] = CONSTELLATION_NODES[b]
        return (
          <line
            key={`e${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            pathLength={1}
            vectorEffect="non-scaling-stroke"
            style={{ animationDelay: `${0.3 + i * 0.13}s` }}
          />
        )
      })}
      {CONSTELLATION_NODES.map(([x, y], i) => (
        <circle
          key={`n${i}`}
          cx={x}
          cy={y}
          r={i < 2 ? 0.7 : 0.45}
          style={{ animationDelay: `${0.2 + i * 0.1}s` }}
        />
      ))}
    </svg>
  )
}

/* ---------- trạng thái → màu + nhãn ---------- */
const STATUS_META: Record<PhanHeStatus, { label: string; color: string; badge: 'processing' | 'default' | 'error'; variant: 'active' | 'maintenance' | 'coming' | 'locked' }> = {
  active: { label: 'Sẵn sàng', color: '#52c41a', badge: 'processing', variant: 'active' },
  'no-permission': { label: 'Chưa được cấp quyền', color: '#737373', badge: 'default', variant: 'locked' },
  'coming-soon': { label: 'Sắp ra mắt', color: '#fa8c16', badge: 'default', variant: 'coming' },
  maintenance: { label: 'Đang bảo trì', color: '#ff4d4f', badge: 'error', variant: 'maintenance' },
}

/* ---------- status badge style map (dashboard-inspired) ---------- */
const STATUS_BADGE_STYLE: Record<string, { bg: string; color: string }> = {
  active: { bg: '#f6ffed', color: '#389e0d' },
  maintenance: { bg: '#fff2f0', color: '#cf1322' },
  coming: { bg: '#fff7e6', color: '#d46b08' },
  locked: { bg: '#f5f5f5', color: '#737373' },
}

/* ================================================================
   PhanHeCard — card phân hệ (dashboard-sample inspired)
   Layout: icon + status badge | title | description | footer (meta + CTA)
   ================================================================ */
function PhanHeCard({
  ph,
  status,
  pinned,
  onTogglePin,
  onNavigate,
}: {
  ph: PhanHe
  status: PhanHeStatus
  pinned: boolean
  onTogglePin: () => void
  onNavigate: (route: string) => void
}) {
  const accent = ph.color
  const isDisabled = status !== 'active'
  const meta = STATUS_META[status]
  const badgeStyle = STATUS_BADGE_STYLE[meta.variant]

  const handleClick = () => {
    if (!isDisabled) {
      recordRecent(ph.id)
      onNavigate(ph.route)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isDisabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const moduleMenu = !isDisabled && ph.modules.length > 0
    ? {
        items: ph.modules.map((m) => ({
          key: m.route,
          label: m.label,
          icon: <ArrowRightOutlined />,
        })),
        onClick: ({ key }: { key: string }) => {
          recordRecent(ph.id)
          onNavigate(key)
        },
      }
    : undefined

  // Footer metadata text based on status
  const footerMeta = (() => {
    if (status === 'maintenance') return 'Bảo trì định kỳ'
    if (status === 'coming-soon' && ph.estimatedRelease) return ph.estimatedRelease
    if (status === 'no-permission') return 'Liên hệ quản trị để được cấp quyền'
    if (ph.pendingTasks && ph.pendingTasks > 0) return `${ph.pendingTasks} việc cần xử lý`
    return `${ph.modules.length} module${ph.modules.length !== 1 ? 's' : ''}`
  })()

  return (
    <div
      role={isDisabled ? undefined : 'button'}
      tabIndex={isDisabled ? undefined : 0}
      aria-disabled={isDisabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{
        position: 'relative',
        borderRadius: 8,
        border: `1px solid ${isDisabled ? '#f0f0f0' : '#e8e8e8'}`,
        background: isDisabled ? 'rgba(250,250,250,0.92)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: isDisabled ? 'default' : 'pointer',
        transition: 'all 0.25s ease',
        height: '100%',
        opacity: isDisabled ? 0.7 : 1,
        outline: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={(e) => {
        if (isDisabled) return
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = accent
        el.style.boxShadow = `0 4px 16px ${accent}18`
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = isDisabled ? '#f0f0f0' : '#e8e8e8'
        el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
        el.style.transform = 'translateY(0)'
      }}
      onFocus={(e) => {
        if (isDisabled) return
        ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 2px ${accent}40`
      }}
      onBlur={(e) => {
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
      }}
    >
      {/* ── Body ── */}
      <div style={{ padding: '20px 20px 16px', flex: 1 }}>
        {/* Row 1: icon (left) + status badge (right) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: isDisabled ? '#f0f0f0' : `${accent}12`,
              color: isDisabled ? '#bfbfbf' : accent,
              display: 'grid',
              placeItems: 'center',
              fontSize: 26,
              flexShrink: 0,
              transition: 'background 0.2s',
            }}
          >
            {ICON_MAP[ph.icon] ?? <AppstoreOutlined />}
          </div>
          {/* Status badge pill */}
          <span
            className="qtkhcn-mono"
            style={{
              padding: '2px 10px',
              borderRadius: 4,
              background: badgeStyle.bg,
              color: badgeStyle.color,
              fontSize: 10.5,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.3,
              whiteSpace: 'nowrap',
            }}
          >
            {meta.label}
          </span>
        </div>

        {/* Row 2: title */}
        <Text strong style={{ fontSize: 15, lineHeight: '22px', display: 'block', marginBottom: 6 }}>
          {ph.ten}
        </Text>

        {/* Row 3: description */}
        <Paragraph
          type="secondary"
          style={{ fontSize: 13, lineHeight: '20px', marginBottom: 0 }}
          ellipsis={{ rows: 2 }}
        >
          {ph.moTa}
        </Paragraph>
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          background: 'rgba(0,0,0,0.02)',
        }}
      >
        <span style={{ fontSize: 12, color: status === 'maintenance' ? '#ff4d4f' : '#737373', fontWeight: 500 }}>
          {footerMeta}
        </span>
        <Space size={6}>
          {/* Pin toggle */}
          <Tooltip title={pinned ? 'Bỏ ghim' : 'Ghim phân hệ'}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onTogglePin()
              }}
              aria-label={pinned ? 'Bỏ ghim' : 'Ghim'}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: pinned ? accent : '#d9d9d9',
                fontSize: 14,
                padding: '2px 4px',
                borderRadius: 4,
                lineHeight: 1,
                transition: 'color 0.2s',
              }}
            >
              {pinned ? <PushpinFilled /> : <PushpinOutlined />}
            </button>
          </Tooltip>

          {/* Module dropdown */}
          {moduleMenu && (
            <Dropdown menu={moduleMenu} trigger={['click']}>
              <Button
                size="small"
                type="text"
                style={{ fontSize: 11, color: accent, padding: '0 4px', height: 22 }}
                onClick={(e) => e.stopPropagation()}
              >
                Modules <DownOutlined style={{ fontSize: 10 }} />
              </Button>
            </Dropdown>
          )}

          {/* CTA button */}
          {!isDisabled ? (
            <Button
              type="primary"
              size="small"
              style={{
                background: accent,
                borderColor: accent,
                fontWeight: 600,
                fontSize: 12,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              onClick={(e) => {
                e.stopPropagation()
                handleClick()
              }}
            >
              Truy cập <ArrowRightOutlined style={{ fontSize: 11 }} />
            </Button>
          ) : status === 'maintenance' ? (
            <Button size="small" disabled style={{ fontSize: 12, borderRadius: 4 }}>
              Tạm khóa
            </Button>
          ) : status === 'coming-soon' ? (
            <Button size="small" disabled style={{ fontSize: 12, borderRadius: 4 }}>
              Sắp ra mắt
            </Button>
          ) : (
            <Button size="small" disabled style={{ fontSize: 12, borderRadius: 4 }}>
              <LockOutlined style={{ fontSize: 11 }} /> Yêu cầu quyền
            </Button>
          )}
        </Space>
      </div>
    </div>
  )
}

/* ================================================================
   BentoStatCard — dashboard-sample inspired stat card
   Glass-morphism style with icon, label, value, and optional sub-line.
   ================================================================ */
function BentoStatCard({
  icon,
  label,
  value,
  color,
  sub,
  subColor,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
  sub?: string
  subColor?: string
}) {
  return (
    <div
      style={{
        padding: '16px 20px',
        borderRadius: 8,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        border: `1px solid ${color}18`,
        transition: 'border-color 0.2s, box-shadow 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = `${color}40`
        el.style.boxShadow = `0 2px 12px ${color}12`
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = `${color}18`
        el.style.boxShadow = 'none'
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span className="qtkhcn-mono" style={{ fontSize: 28, fontWeight: 600, color, lineHeight: '36px' }}>{value}</span>
        {icon && (
          <span style={{ color: `${color}99`, fontSize: 18, marginLeft: 'auto' }}>
            {icon}
          </span>
        )}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: subColor || '#737373', marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  )
}

/* ================================================================
   HeroBanner — welcome hero with system status indicator
   (dashboard-sample inspired: dark accent + glass feel)
   ================================================================ */
function HeroBanner({ activeCount, totalCount }: { activeCount: number; totalCount: number }) {
  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        borderRadius: 8,
        border: '1px solid rgba(238, 0, 51, 0.18)',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        padding: '28px 32px',
        marginBottom: 20,
        boxShadow: '0 2px 16px rgba(23, 9, 11, 0.12)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px', color: '#1b1c1c', letterSpacing: '-0.01em' }}>
            Trung tâm Điều hành Hệ thống QTKHCN
          </h2>
          <Paragraph style={{ fontSize: 14, color: '#5a6675', margin: 0, maxWidth: 560 }}>
            Chào mừng trở lại. Bạn có quyền truy cập{' '}
            <strong style={{ color: '#1677ff' }}>{activeCount}/{totalCount}</strong> phân hệ.
            Chọn một phân hệ bên dưới để bắt đầu làm việc.
          </Paragraph>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#389e0d' }}>
          <span style={{ position: 'relative', display: 'flex', width: 10, height: 10 }}>
            <span className="qtkhcn-ping-dot" style={{
              position: 'absolute',
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#52c41a',
              opacity: 0.6,
            }} />
            <span style={{
              position: 'relative',
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#389e0d',
            }} />
          </span>
          Hệ thống đang hoạt động
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   SubsystemList — Trang danh sách phân hệ (dashboard-inspired redesign)
   ================================================================ */
export default function SubsystemList() {
  const perms = usePermissions()

  // filter states
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'no-permission' | 'coming-soon'>('all')

  // pin & recent
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => loadIds(LS_PINNED))
  const [recentIds, setRecentIds] = useState<string[]>(() => loadIds(LS_RECENT))

  const permCtx: PhanHePermissions = useMemo(
    () => ({
      admin: perms.admin,
      canManageSystem: perms.canManageSystem,
      isChuNhiemDeTai: perms.isChuNhiemDeTai,
    }),
    [perms.admin, perms.canManageSystem, perms.isChuNhiemDeTai],
  )

  // refresh recent on mount (other tabs might have updated)
  useEffect(() => {
    setRecentIds(loadIds(LS_RECENT))
    setPinnedIds(loadIds(LS_PINNED))
  }, [])

  const handleTogglePin = useCallback((id: string) => {
    togglePinned(id)
    setPinnedIds(loadIds(LS_PINNED))
  }, [])

  // compute status per phân hệ
  const withStatus = useMemo(
    () =>
      DANH_SACH_PHAN_HE.map((ph) => ({
        ...ph,
        _status: getPhanHeStatus(ph, permCtx),
      })),
    [permCtx],
  )

  // filtered
  const filtered = useMemo(() => {
    const q = normalizeVietnamese(search.trim())
    return withStatus.filter((ph) => {
      if (filter === 'active' && ph._status !== 'active') return false
      if (filter === 'no-permission' && ph._status !== 'no-permission') return false
      if (filter === 'coming-soon' && ph._status !== 'coming-soon') return false
      if (q) {
        return (
          normalizeVietnamese(ph.ten).includes(q) ||
          normalizeVietnamese(ph.moTa).includes(q) ||
          ph.id.toLowerCase().includes(q) ||
          ph.modules.some((m) => normalizeVietnamese(m.label).includes(q))
        )
      }
      return true
    })
  }, [withStatus, search, filter])

  // sections: pinned, recent, all
  const pinned = useMemo(() => filtered.filter((ph) => pinnedIds.includes(ph.id)), [filtered, pinnedIds])
  const recent = useMemo(
    () => filtered.filter((ph) => recentIds.includes(ph.id) && !pinnedIds.includes(ph.id)),
    [filtered, recentIds, pinnedIds],
  )
  const remaining = useMemo(
    () => filtered.filter((ph) => !pinnedIds.includes(ph.id) && !recentIds.includes(ph.id)),
    [filtered, pinnedIds, recentIds],
  )

  // stats (based on permission-aware data)
  const activeCount = withStatus.filter((p) => p._status === 'active').length
  const noPermCount = withStatus.filter((p) => p._status === 'no-permission').length
  const comingCount = withStatus.filter((p) => p._status === 'coming-soon').length
  const totalCount = DANH_SACH_PHAN_HE.length

  const handleNavigate = useCallback(
    (route: string) => window.open(route, '_blank'),
    [],
  )

  const renderSection = (title: string, subtitle: string, items: typeof filtered) => {
    if (items.length === 0) return null
    return (
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
          <Text strong style={{ fontSize: 15, color: 'rgba(255, 241, 243, 0.92)' }}>{title}</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255, 218, 216, 0.65)' }}>{subtitle} · {items.length}</Text>
        </div>
        <Row gutter={[16, 16]}>
          {items.map((ph) => (
            <Col key={ph.id} xs={24} sm={12} lg={8}>
              <PhanHeCard
                ph={ph}
                status={ph._status}
                pinned={pinnedIds.includes(ph.id)}
                onTogglePin={() => handleTogglePin(ph.id)}
                onNavigate={handleNavigate}
              />
            </Col>
          ))}
        </Row>
      </div>
    )
  }

  const FILTER_OPTIONS = [
    { key: 'all', label: 'Tất cả', count: totalCount },
    { key: 'active', label: 'Có quyền', count: activeCount },
    { key: 'no-permission', label: 'Chưa có quyền', count: noPermCount },
    { key: 'coming-soon', label: 'Sắp ra mắt', count: comingCount },
  ] as const

  return (
    <div className="qtkhcn-standalone-bg" style={{ minHeight: 'calc(100vh - 60px)', margin: -24, padding: 24 }}>
      <ConstellationLines />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto' }}>
      <PageHeader
        title={<span style={{ color: 'rgba(255, 241, 243, 0.92)' }}>Danh sách Phân hệ</span>}
        breadcrumb={[{ label: 'Danh sách Phân hệ' }]}
        code={<span style={{ color: 'rgba(255, 218, 216, 0.55)', fontSize: 13 }}>Chọn phân hệ để bắt đầu làm việc. Ghim phân hệ thường dùng để truy cập nhanh.</span>}
      />

      {/* ── Hero Banner ── */}
      <HeroBanner activeCount={activeCount} totalCount={totalCount} />

      {/* ── Bento Stats ── */}
      <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <BentoStatCard
            icon={<DeploymentUnitOutlined />}
            label="Tổng phân hệ"
            value={totalCount}
            color="#1677ff"
            sub="Toàn hệ thống"
          />
        </Col>
        <Col xs={12} sm={6}>
          <BentoStatCard
            icon={<RocketOutlined />}
            label="Có quyền truy cập"
            value={activeCount}
            color="#52c41a"
            sub={`${totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0}% phân hệ`}
            subColor="#389e0d"
          />
        </Col>
        <Col xs={12} sm={6}>
          <BentoStatCard
            icon={<LockOutlined />}
            label="Chưa có quyền"
            value={noPermCount}
            color="#737373"
            sub="Cần được cấp quyền"
          />
        </Col>
        <Col xs={12} sm={6}>
          <BentoStatCard
            icon={<ClockCircleOutlined />}
            label="Sắp ra mắt"
            value={comingCount}
            color="#fa8c16"
            sub="Đang phát triển"
          />
        </Col>
      </Row>

      {/* ── Filter bar + search ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20,
          padding: '6px 8px',
          borderRadius: 8,
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <Space size={4}>
          {FILTER_OPTIONS.map((f) => (
            <Button
              key={f.key}
              size="small"
              type={filter === f.key ? 'primary' : 'text'}
              onClick={() => setFilter(f.key)}
              style={{
                fontWeight: filter === f.key ? 600 : 400,
                borderRadius: 6,
                color: filter === f.key ? undefined : '#595959',
              }}
            >
              {f.label}
              <span style={{
                marginLeft: 4,
                fontSize: 11,
                opacity: 0.7,
                background: filter === f.key ? 'rgba(255,255,255,0.25)' : '#f0f0f0',
                padding: '0 6px',
                borderRadius: 10,
              }}>
                {f.count}
              </span>
            </Button>
          ))}
        </Space>
        <Input
          placeholder="Tìm phân hệ... (hỗ trợ không dấu)"
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          allowClear
          size="middle"
          style={{ width: 280 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Pinned section ── */}
      {renderSection('📌 Đã ghim', 'Truy cập nhanh', pinned)}

      {/* ── Recent section ── */}
      {renderSection('🕐 Gần đây', 'Mới truy cập', recent)}

      {/* ── All remaining ── */}
      {filter === 'all' ? (
        renderSection('📋 Tất cả phân hệ', 'Toàn bộ danh sách', remaining)
      ) : (
        <>
          {remaining.length > 0 && (
            <Row gutter={[16, 16]}>
              {remaining.map((ph) => (
                <Col key={ph.id} xs={24} sm={12} lg={8}>
                  <PhanHeCard
                    ph={ph}
                    status={ph._status}
                    pinned={pinnedIds.includes(ph.id)}
                    onTogglePin={() => handleTogglePin(ph.id)}
                    onNavigate={handleNavigate}
                  />
                </Col>
              ))}
            </Row>
          )}
        </>
      )}

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'rgba(255, 218, 216, 0.45)' }}>
          <ExperimentOutlined style={{ fontSize: 48, marginBottom: 16, color: 'rgba(255, 218, 216, 0.25)' }} />
          <br />
          <Text style={{ color: 'rgba(255, 218, 216, 0.5)' }}>Không tìm thấy phân hệ nào phù hợp.</Text>
          <br />
          <Button
            type="link"
            onClick={() => { setSearch(''); setFilter('all'); }}
            style={{ marginTop: 8 }}
          >
            Xóa bộ lọc
          </Button>
        </div>
      )}

      {/* ── Request-access placeholder (dashboard-inspired dashed card) ── */}
      {activeCount === 0 && noPermCount > 0 && (
        <div
          style={{
            border: '2px dashed rgba(238, 0, 51, 0.25)',
            borderRadius: 8,
            padding: '32px 24px',
            textAlign: 'center',
            marginTop: 8,
            transition: 'border-color 0.2s, background 0.2s',
            cursor: 'pointer',
            background: 'rgba(23, 9, 11, 0.3)',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = 'rgba(238, 0, 51, 0.5)'
            el.style.background = 'rgba(23, 9, 11, 0.5)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.borderColor = 'rgba(238, 0, 51, 0.25)'
            el.style.background = 'rgba(23, 9, 11, 0.3)'
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '2px solid rgba(238, 0, 51, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              color: 'rgba(238, 0, 51, 0.45)',
              fontSize: 20,
              transition: 'color 0.2s, border-color 0.2s',
            }}
          >
            <PlusOutlined />
          </div>
          <Text strong style={{ fontSize: 14, color: 'rgba(255, 218, 216, 0.75)', display: 'block', marginBottom: 4 }}>
            Yêu cầu quyền truy cập
          </Text>
          <Text style={{ fontSize: 12, color: 'rgba(255, 218, 216, 0.45)' }}>
            Bạn chưa có quyền truy cập phân hệ nào. Liên hệ quản trị viên để được cấp quyền.
          </Text>
        </div>
      )}
      </div>
    </div>
  )
}

import { lazy, Suspense, startTransition, useEffect, useState } from 'react'
import { Layout, Menu, Avatar, Typography, Space, Grid, Badge, Breadcrumb, Button, Dropdown, Spin } from 'antd'
import {
  KeyOutlined,
  PartitionOutlined,
  ExperimentOutlined,
  DashboardOutlined,
  CarryOutOutlined,
  FormOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  DeploymentUnitOutlined,
  ThunderboltOutlined,
  ApiOutlined,
  HistoryOutlined,
} from '@ant-design/icons'
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

// Lazy-load các trang còn lại → tách khỏi bundle chính, giảm chi phí render mỗi lần
// điều hướng (nguyên nhân INP khi bấm menu). Dashboard/Login giữ eager vì là trang đầu.
const ProcessCatalog = lazy(() => import('./pages/ProcessCatalog'))
const ProcessCreate = lazy(() => import('./pages/ProcessCreate'))
const ProcessDetail = lazy(() => import('./pages/ProcessDetail'))
const DossierList = lazy(() => import('./pages/DossierList'))
const DossierDetail = lazy(() => import('./pages/DossierDetail'))
const NhiemVuList = lazy(() => import('./pages/NhiemVuList'))
const NhiemVuCreate = lazy(() => import('./pages/NhiemVuCreate'))
const NhiemVuDetail = lazy(() => import('./pages/NhiemVuDetail'))
const Worklist = lazy(() => import('./pages/Worklist'))
const FormLibrary = lazy(() => import('./pages/FormLibrary'))
const UserManagement = lazy(() => import('./pages/UserManagement'))
const ProcessMonitor = lazy(() => import('./pages/ProcessMonitor'))
const IntegrationStatus = lazy(() => import('./pages/IntegrationStatus'))
const ProcessEventLog = lazy(() => import('./pages/ProcessEventLog'))
import { useDossiers } from './store/DossierContext'
import { useBreadcrumb } from './store/BreadcrumbContext'
import { useAuth } from './store/AuthContext'

/** Chữ cái đầu của họ tên → nhãn avatar (tối đa 2 ký tự). */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

const { Header, Sider, Content } = Layout
const { Text } = Typography

const SIDER_W = 230
const SIDER_COLLAPSED_W = 80

const ROUTE_BY_KEY: Record<string, string> = {
  dashboard: '/tong-quan',
  worklist: '/viec-cua-toi',
  quytrinh: '/quy-trinh',
  bieumau: '/bieu-mau',
  nvkhcn: '/nhiem-vu',
  nguoidung: '/nguoi-dung',
  giamsat: '/giam-sat',
  tichhop: '/tich-hop',
  nhatky: '/nhat-ky',
}

export default function App() {
  const [collapsed, setCollapsed] = useState(false)
  const screens = Grid.useBreakpoint()
  const navigate = useNavigate()
  const location = useLocation()
  const { list } = useDossiers()
  const { crumbs } = useBreadcrumb()
  const { user, logout } = useAuth()

  const pending = list.filter((d) => d.trangThai === 'processing').length
  const siderW = collapsed ? SIDER_COLLAPSED_W : SIDER_W

  // Cho Drawer/overlay biết bề rộng sider để né menu.
  useEffect(() => {
    document.documentElement.style.setProperty('--vht-sider-w', `${siderW}px`)
  }, [siderW])

  const selectedKey = location.pathname.startsWith('/tong-quan')
    ? 'dashboard'
    : location.pathname.startsWith('/viec-cua-toi')
    ? 'worklist'
    : location.pathname.startsWith('/giam-sat')
    ? 'giamsat'
    : location.pathname.startsWith('/tich-hop')
    ? 'tichhop'
    : location.pathname.startsWith('/nhat-ky')
    ? 'nhatky'
    : location.pathname.startsWith('/ho-so') || location.pathname.startsWith('/nhiem-vu')
      ? 'nvkhcn'
      : location.pathname.startsWith('/bieu-mau')
        ? 'bieumau'
        : location.pathname.startsWith('/nguoi-dung')
          ? 'nguoidung'
          : 'quytrinh'
  const SECTION_TITLE: Record<string, string> = {
    dashboard: 'Tổng quan',
    worklist: 'Việc của tôi',
    nvkhcn: 'Quản lý NV KHCN',
    bieumau: 'Thư viện biểu mẫu',
    nguoidung: 'Quản trị người dùng',
    giamsat: 'Giám sát tiến trình luồng',
    tichhop: 'Trạng thái tích hợp hệ ngoài',
    nhatky: 'Nhật ký',
    quytrinh: 'Quản lý quy trình',
  }
  const sectionTitle = SECTION_TITLE[selectedKey] ?? 'Quản lý quy trình'

  // Breadcrumb hiển thị ở MỘT nơi (header). Trang set qua PageHeader → crumbs;
  // không set → mặc định Hệ thống / khu chức năng.
  const crumbSource = crumbs && crumbs.length ? crumbs : [{ label: 'Hệ thống QTKHCN' }, { label: sectionTitle }]
  const breadcrumbItems = crumbSource.map((c, i) => ({
    title: c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>,
    key: `${i}-${c.label}`,
  }))

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
    {
      key: 'worklist',
      icon: <CarryOutOutlined />,
      label: (
        <Space>
          Việc của tôi
          <Badge count={pending} size="small" />
        </Space>
      ),
    },
    { key: 'nvkhcn', icon: <ExperimentOutlined />, label: 'Quản lý NV KHCN' },
    { key: 'quytrinh', icon: <PartitionOutlined />, label: 'Quản lý quy trình' },
    {
      key: 'vanhanh',
      icon: <DeploymentUnitOutlined />,
      label: 'Vận hành & Tích hợp',
      children: [
        { key: 'giamsat', icon: <ThunderboltOutlined />, label: 'Giám sát tiến trình' },
        { key: 'tichhop', icon: <ApiOutlined />, label: 'Tích hợp hệ ngoài' },
        { key: 'nhatky', icon: <HistoryOutlined />, label: 'Nhật ký' },
      ],
    },
    { key: 'nguoidung', icon: <KeyOutlined />, label: 'Quản trị người dùng' },
    { key: 'bieumau', icon: <FormOutlined />, label: 'Thư viện biểu mẫu' },
  ]

  // Chưa đăng nhập → hiện màn Đăng nhập, không dựng layout ứng dụng.
  if (!user) return <Login />

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        breakpoint="lg"
        collapsedWidth={SIDER_COLLAPSED_W}
        width={SIDER_W}
        style={{ position: 'fixed', insetInlineStart: 0, top: 0, bottom: 0, height: '100vh', overflow: 'auto', zIndex: 100 }}
      >
        <div
          style={{
            height: 58,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 16px',
            borderBottom: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <div
            style={{
              background: '#fff',
              color: '#bf0027',
              fontWeight: 900,
              width: 36,
              height: 36,
              borderRadius: 8,
              display: 'grid',
              placeItems: 'center',
              flex: '0 0 auto',
            }}
          >
            VHT
          </div>
          {!collapsed && (
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ color: '#fff', fontWeight: 700 }}>QTKHCN</div>
              <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 11 }}>Quản trị KHCN</div>
            </div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={['vanhanh']}
          items={menuItems}
          onClick={({ key }) => {
            const to = ROUTE_BY_KEY[key]
            // startTransition: điều hướng là non-urgent → React paint highlight menu
            // ngay, render trang đích ở nền, không chặn UI (giảm INP).
            if (to) startTransition(() => navigate(to))
          }}
        />
      </Sider>

      <Layout style={{ marginInlineStart: siderW, transition: 'margin-inline-start 0.2s' }}>
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            background: '#fff',
            padding: '8px 20px',
            borderBottom: '1px solid #e6e9ee',
            height: 'auto',
            minHeight: 60,
            lineHeight: 'normal',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <Button
              type="text"
              aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              style={{ color: 'var(--vht-red)' }}
              onClick={() => setCollapsed((v) => !v)}
            />
            <Breadcrumb items={breadcrumbItems} style={{ whiteSpace: 'normal' }} />
          </div>
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                {
                  key: 'me',
                  disabled: true,
                  label: (
                    <div style={{ lineHeight: 1.3 }}>
                      <div style={{ fontWeight: 600 }}>{user.hoTen}</div>
                      <Text type="secondary" style={{ fontSize: 12 }}>{user.email}</Text>
                    </div>
                  ),
                },
                { type: 'divider' },
                { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true },
              ],
              onClick: ({ key }) => {
                if (key === 'logout') logout()
              },
            }}
          >
            <Space size={10} style={{ flex: '0 0 auto', cursor: 'pointer' }}>
              {screens.sm && (
                <Space direction="vertical" size={0} style={{ textAlign: 'right', lineHeight: 1.2 }}>
                  <Text strong style={{ fontSize: 13 }}>{user.hoTen}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{user.chucDanh}</Text>
                </Space>
              )}
              <Avatar style={{ background: '#ffdad8', color: '#bf0027', fontWeight: 700 }}>
                {initials(user.hoTen)}
              </Avatar>
            </Space>
          </Dropdown>
        </Header>

        <Content id="app-scroll" style={{ padding: 24, background: 'var(--vht-surface-2)', position: 'relative' }}>
          <Suspense fallback={<div style={{ display: 'grid', placeItems: 'center', minHeight: '40vh' }}><Spin size="large" /></div>}>
          <Routes>
            <Route path="/tong-quan" element={<Dashboard />} />
            <Route path="/viec-cua-toi" element={<Worklist />} />
            <Route path="/quy-trinh" element={<ProcessCatalog />} />
            <Route path="/quy-trinh/moi" element={<ProcessCreate />} />
            <Route path="/quy-trinh/:ma" element={<ProcessDetail />} />
            <Route path="/bieu-mau" element={<FormLibrary />} />
            <Route path="/nhiem-vu" element={<NhiemVuList />} />
            <Route path="/nhiem-vu/moi" element={<NhiemVuCreate />} />
            <Route path="/nhiem-vu/:ma" element={<NhiemVuDetail />} />
            <Route path="/ho-so" element={<DossierList />} />
            <Route path="/ho-so/:id" element={<DossierDetail />} />
            <Route path="/nguoi-dung" element={<UserManagement />} />
            <Route path="/giam-sat" element={<ProcessMonitor />} />
            <Route path="/tich-hop" element={<IntegrationStatus />} />
            <Route path="/nhat-ky" element={<ProcessEventLog />} />
            <Route path="*" element={<Navigate to="/tong-quan" replace />} />
          </Routes>
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  )
}

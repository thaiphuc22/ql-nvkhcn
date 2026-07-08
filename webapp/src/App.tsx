import { lazy, Suspense, startTransition, useEffect, useState } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Typography,
  Space,
  Grid,
  Badge,
  Breadcrumb,
  Button,
  Dropdown,
  Spin,
} from "antd";
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
  ApartmentOutlined,
  TeamOutlined,
  ClusterOutlined,
  SolutionOutlined,
  ControlOutlined,
  BookOutlined,
} from "@ant-design/icons";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

// Lazy-load các trang còn lại → tách khỏi bundle chính, giảm chi phí render mỗi lần
// điều hướng (nguyên nhân INP khi bấm menu). Dashboard/Login giữ eager vì là trang đầu.
const ProcessCatalog = lazy(() => import("./pages/ProcessCatalog"));
const ProcessCreate = lazy(() => import("./pages/ProcessCreate"));
const ProcessDetail = lazy(() => import("./pages/ProcessDetail"));
const DossierList = lazy(() => import("./pages/DossierList"));
const DossierDetail = lazy(() => import("./pages/DossierDetail"));
const NhiemVuList = lazy(() => import("./pages/NhiemVuList"));
const NhiemVuCreate = lazy(() => import("./pages/NhiemVuCreate"));
const NhiemVuDetail = lazy(() => import("./pages/NhiemVuDetail"));
const Worklist = lazy(() => import("./pages/Worklist"));
const FormLibrary = lazy(() => import("./pages/FormLibrary"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const RolePermission = lazy(() => import("./pages/RolePermission"));
const OrgStructure = lazy(() => import("./pages/OrgStructure"));
const ProcessMonitor = lazy(() => import("./pages/ProcessMonitor"));
const IntegrationStatus = lazy(() => import("./pages/IntegrationStatus"));
const ProcessEventLog = lazy(() => import("./pages/ProcessEventLog"));
const RuleList = lazy(() => import("./pages/RuleList"));
const RuleDetail = lazy(() => import("./pages/RuleDetail"));
const ApprovalMatrix = lazy(() => import("./pages/ApprovalMatrix"));
const ActionStudio = lazy(() => import("./pages/ActionStudio"));
const TroGiup = lazy(() => import("./pages/TroGiup"));
import { useDossiers } from "./store/DossierContext";
import { useBreadcrumb } from "./store/BreadcrumbContext";
import { useAuth, usePermissions } from "./store/AuthContext";

/** Chữ cái đầu của họ tên → nhãn avatar (tối đa 2 ký tự). */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const SIDER_W = 230;
const SIDER_COLLAPSED_W = 80;

const ROUTE_BY_KEY: Record<string, string> = {
  dashboard: "/tong-quan",
  worklist: "/viec-cua-toi",
  quytrinh: "/quy-trinh",
  bieumau: "/bieu-mau",
  nvkhcn: "/nhiem-vu",
  "nhiem-vu": "/nhiem-vu",
  "ho-so": "/ho-so",
  donvi: "/co-cau-to-chuc",
  nguoidung: "/nguoi-dung",
  phanquyen: "/phan-quyen",
  giamsat: "/giam-sat",
  tichhop: "/tich-hop",
  nhatky: "/nhat-ky",
  luat: "/quan-ly-luat",
  matran: "/ma-tran-phe-duyet",
  hanhdong: "/cau-hinh-hanh-dong",
  trogiup: "/tro-giup",
};

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const screens = Grid.useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();
  const { list } = useDossiers();
  const { crumbs } = useBreadcrumb();
  const { user, logout } = useAuth();
  const { admin, canManageSystem, canProcessStep, isChuNhiemDeTai } =
    usePermissions();

  // Badge "Việc của tôi" đồng bộ với bộ lọc Worklist: chỉ đếm bước hiện tại
  // thuộc candidate group của user (admin đếm tất cả hồ sơ đang xử lý).
  const pending = list.filter(
    (d) =>
      d.trangThai === "processing" &&
      (admin || canProcessStep(d.steps[d.buocHienTai])),
  ).length;
  const siderW = collapsed ? SIDER_COLLAPSED_W : SIDER_W;

  // Cho Drawer/overlay biết bề rộng sider để né menu.
  useEffect(() => {
    document.documentElement.style.setProperty("--vht-sider-w", `${siderW}px`);
  }, [siderW]);

  const selectedKey = location.pathname.startsWith("/tong-quan")
    ? "dashboard"
    : location.pathname.startsWith("/viec-cua-toi")
      ? "worklist"
      : location.pathname.startsWith("/giam-sat")
        ? "giamsat"
        : location.pathname.startsWith("/tich-hop")
          ? "tichhop"
          : location.pathname.startsWith("/nhat-ky")
            ? "nhatky"
            : location.pathname.startsWith("/quan-ly-luat")
            ? "luat"
            : location.pathname.startsWith("/ma-tran-phe-duyet")
            ? "matran"
            : location.pathname.startsWith("/cau-hinh-hanh-dong")
            ? "hanhdong"
            : location.pathname.startsWith("/phan-quyen")
            ? "phanquyen"
            : location.pathname.startsWith("/ho-so")
              ? "ho-so"
              : location.pathname.startsWith("/nhiem-vu")
                ? "nhiem-vu"
              : location.pathname.startsWith("/bieu-mau")
                ? "bieumau"
                : location.pathname.startsWith("/co-cau-to-chuc")
                  ? "donvi"
                  : location.pathname.startsWith("/nguoi-dung")
                    ? "nguoidung"
                    : location.pathname.startsWith("/tro-giup")
                    ? "trogiup"
                    : "quytrinh";
  const SECTION_TITLE: Record<string, string> = {
    dashboard: "Tổng quan",
    worklist: "Việc của tôi",
    nvkhcn: "Quản trị KHCN",
    "nhiem-vu": "Quản trị KHCN",
    "ho-so": "Quản trị KHCN",
    bieumau: "Thư viện biểu mẫu",
    donvi: "Quản trị đơn vị",
    nguoidung: "Quản trị người dùng",
    phanquyen: "Phân quyền",
    giamsat: "Giám sát tiến trình luồng",
    tichhop: "Trạng thái Tích hợp",
    nhatky: "Nhật ký",
    luat: "Ma trận quyết định",
    matran: "Ma trận phê duyệt",
    hanhdong: "Ma trận Hành động",
    trogiup: "Hướng dẫn sử dụng",
    quytrinh: "Quản lý quy trình",
  };
  const sectionTitle = SECTION_TITLE[selectedKey] ?? "Quản lý quy trình";

  // Breadcrumb hiển thị ở MỘT nơi (header). Trang set qua PageHeader → crumbs;
  // không set → mặc định Hệ thống / khu chức năng.
  const crumbSource =
    crumbs && crumbs.length
      ? crumbs
      : [{ label: "Hệ thống QTKHCN" }, { label: sectionTitle }];
  const breadcrumbItems = crumbSource.map((c, i) => ({
    title: c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>,
    key: `${i}-${c.label}`,
  }));

  const menuItems: any[] = [
    { key: "dashboard", icon: <DashboardOutlined />, label: "Tổng quan" },
    {
      key: "worklist",
      icon: <CarryOutOutlined />,
      label: (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <span>Việc của tôi</span>
          <Badge count={pending} size="small" overflowCount={99} />
        </div>
      ),
    },
    {
      key: "nvkhcn",
      icon: <ExperimentOutlined />,
      label: "Quản trị KHCN",
      children: [
        { key: "nhiem-vu", icon: null, label: "Danh sách NV KHCN" },
        { key: "ho-so", icon: null, label: "Danh sách Hồ sơ KHCN" },
      ],
    },
    // Quản lý quy trình — không hiển thị với Chủ nhiệm đề tài.
    ...(!isChuNhiemDeTai
      ? [
          {
            key: "quytrinh",
            icon: <PartitionOutlined />,
            label: "Quản lý quy trình",
          },
        ]
      : []),
    // Nhóm Vận hành & Tích hợp chỉ dành cho Quản trị viên hệ thống.
    ...(canManageSystem
      ? [
          {
            key: "vanhanh",
            icon: <DeploymentUnitOutlined />,
            label: "Vận hành & Tích hợp",
            children: [
              {
                key: "giamsat",
                icon: <ThunderboltOutlined />,
                label: "Giám sát tiến trình",
              },
              { key: "tichhop", icon: <ApiOutlined />, label: "Tích hợp" },
              { key: "nhatky", icon: <HistoryOutlined />, label: "Nhật ký" },
              {
                key: "luat",
                icon: <ClusterOutlined />,
                label: "Ma trận quyết định",
              },
              {
                key: "matran",
                icon: <SolutionOutlined />,
                label: "Ma trận phê duyệt",
              },
              {
                key: "hanhdong",
                icon: <ControlOutlined />,
                label: "Ma trận Hành động",
              },
            ],
          },
        ]
      : []),
    // Nhóm Quản trị tổ chức chỉ dành cho Quản trị viên hệ thống.
    ...(canManageSystem
      ? [
          {
            key: "toChuc",
            icon: <KeyOutlined />,
            label: "Quản trị tổ chức",
            children: [
              {
                key: "donvi",
                icon: <ApartmentOutlined />,
                label: "Quản trị đơn vị",
              },
              {
                key: "nguoidung",
                icon: <TeamOutlined />,
                label: "Quản trị người dùng",
              },
              {
                key: "phanquyen",
                icon: <KeyOutlined />,
                label: "Phân quyền",
              },
            ],
          },
        ]
      : []),
    // Thư viện biểu mẫu — không hiển thị với Chủ nhiệm đề tài.
    ...(!isChuNhiemDeTai
      ? [{ key: "bieumau", icon: <FormOutlined />, label: "Thư viện biểu mẫu" }]
      : []),
  ] as const;

  const menuItemsMain = menuItems.filter((i) => i.key !== "trogiup");

  // Chưa đăng nhập → hiện màn Đăng nhập, không dựng layout ứng dụng.
  if (!user) return <Login />;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        breakpoint="lg"
        collapsedWidth={SIDER_COLLAPSED_W}
        width={SIDER_W}
        style={{
          position: "fixed",
          insetInlineStart: 0,
          top: 0,
          bottom: 0,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: 58,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 16px",
            borderBottom: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <div
            style={{
              background: "#fff",
              color: "#bf0027",
              fontWeight: 900,
              width: 36,
              height: 36,
              borderRadius: 8,
              display: "grid",
              placeItems: "center",
              flex: "0 0 auto",
            }}
          >
            VHT
          </div>
          {!collapsed && (
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ color: "#fff", fontWeight: 700 }}>QTKHCN</div>
              <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 11 }}>
                Quản trị KHCN
              </div>
            </div>
          )}
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItemsMain}
            onClick={({ key }) => {
              const to = ROUTE_BY_KEY[key];
              // startTransition: điều hướng là non-urgent → React paint highlight menu
              // ngay, render trang đích ở nền, không chặn UI (giảm INP).
              if (to) startTransition(() => navigate(to));
            }}
          />
        </div>
      </Sider>

        {/* Ghim Hướng dẫn sử dụng sticky dưới cùng góc trái màn hình */}
        <div
          onClick={() => startTransition(() => navigate("/tro-giup"))}
          style={{
            position: "fixed",
            insetInlineStart: 8,
            bottom: 16,
            width: collapsed
              ? SIDER_COLLAPSED_W - 16
              : SIDER_W - 16,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : undefined,
            gap: collapsed ? undefined : 10,
            padding: collapsed ? 0 : "0 8px",
            cursor: "pointer",
            background: "var(--vht-red-chrome, #bf0027)",
            color: "#fff",
            userSelect: "none",
            transition: "background 0.2s, width 0.2s",
            zIndex: 101,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#a00022";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "var(--vht-red-chrome, #bf0027)";
          }}
        >
          <BookOutlined />
          {!collapsed && <span>Hướng dẫn sử dụng</span>}
        </div>

      <Layout
        style={{
          marginInlineStart: siderW,
          transition: "margin-inline-start 0.2s",
        }}
      >
        <Header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            background: "#fff",
            padding: "8px 20px",
            borderBottom: "1px solid #e6e9ee",
            height: "auto",
            minHeight: 60,
            lineHeight: "normal",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              minWidth: 0,
            }}
          >
            <Button
              type="text"
              aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              style={{ color: "var(--vht-red)" }}
              onClick={() => setCollapsed((v) => !v)}
            />
            <Breadcrumb
              items={breadcrumbItems}
              style={{ whiteSpace: "normal" }}
            />
          </div>
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                {
                  key: "me",
                  disabled: true,
                  label: (
                    <div style={{ lineHeight: 1.3 }}>
                      <div style={{ fontWeight: 600 }}>{user.hoTen}</div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {user.email}
                      </Text>
                    </div>
                  ),
                },
                { type: "divider" },
                {
                  key: "logout",
                  icon: <LogoutOutlined />,
                  label: "Đăng xuất",
                  danger: true,
                },
              ],
              onClick: ({ key }) => {
                if (key === "logout") logout();
              },
            }}
          >
            <Space size={10} style={{ flex: "0 0 auto", cursor: "pointer" }}>
              {screens.sm && (
                <Space
                  direction="vertical"
                  size={0}
                  style={{ textAlign: "right", lineHeight: 1.2 }}
                >
                  <Text strong style={{ fontSize: 13 }}>
                    {user.hoTen}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {user.chucDanh}
                  </Text>
                </Space>
              )}
              <Avatar
                style={{
                  background: "#ffdad8",
                  color: "#bf0027",
                  fontWeight: 700,
                }}
              >
                {initials(user.hoTen)}
              </Avatar>
            </Space>
          </Dropdown>
        </Header>

        <Content
          id="app-scroll"
          style={{
            padding: 24,
            background: "var(--vht-surface-2)",
            position: "relative",
          }}
        >
          <Suspense
            fallback={
              <div
                style={{
                  display: "grid",
                  placeItems: "center",
                  minHeight: "40vh",
                }}
              >
                <Spin size="large" />
              </div>
            }
          >
            <Routes>
              <Route path="/tong-quan" element={<Dashboard />} />
              <Route path="/viec-cua-toi" element={<Worklist />} />
              <Route
                path="/quy-trinh"
                element={
                  !isChuNhiemDeTai ? (
                    <ProcessCatalog />
                  ) : (
                    <Navigate to="/tong-quan" replace />
                  )
                }
              />
              <Route
                path="/quy-trinh/moi"
                element={
                  canManageSystem ? (
                    <ProcessCreate />
                  ) : (
                    <Navigate to="/quy-trinh" replace />
                  )
                }
              />
              <Route
                path="/quy-trinh/:ma"
                element={
                  !isChuNhiemDeTai ? (
                    <ProcessDetail />
                  ) : (
                    <Navigate to="/tong-quan" replace />
                  )
                }
              />
              <Route
                path="/bieu-mau"
                element={
                  !isChuNhiemDeTai ? (
                    <FormLibrary />
                  ) : (
                    <Navigate to="/tong-quan" replace />
                  )
                }
              />
              <Route path="/nhiem-vu" element={<NhiemVuList />} />
              <Route path="/nhiem-vu/moi" element={<NhiemVuCreate />} />
              <Route path="/nhiem-vu/:ma" element={<NhiemVuDetail />} />
              <Route path="/ho-so" element={<DossierList />} />
              <Route path="/ho-so/:id" element={<DossierDetail />} />
              <Route
                path="/co-cau-to-chuc"
                element={
                  canManageSystem ? (
                    <OrgStructure />
                  ) : (
                    <Navigate to="/tong-quan" replace />
                  )
                }
              />
              <Route
                path="/nguoi-dung"
                element={
                  canManageSystem ? (
                    <UserManagement />
                  ) : (
                    <Navigate to="/tong-quan" replace />
                  )
                }
              />
              <Route
                path="/phan-quyen"
                element={
                  canManageSystem ? (
                    <RolePermission />
                  ) : (
                    <Navigate to="/tong-quan" replace />
                  )
                }
              />
              <Route
                path="/giam-sat"
                element={
                  canManageSystem ? (
                    <ProcessMonitor />
                  ) : (
                    <Navigate to="/tong-quan" replace />
                  )
                }
              />
              <Route
                path="/tich-hop"
                element={
                  canManageSystem ? (
                    <IntegrationStatus />
                  ) : (
                    <Navigate to="/tong-quan" replace />
                  )
                }
              />
              <Route
                path="/nhat-ky"
                element={
                  canManageSystem ? (
                    <ProcessEventLog />
                  ) : (
                    <Navigate to="/tong-quan" replace />
                  )
                }
              />
              <Route
                path="/quan-ly-luat"
                element={
                  canManageSystem ? (
                    <RuleList />
                  ) : (
                    <Navigate to="/tong-quan" replace />
                  )
                }
              />
              <Route
                path="/quan-ly-luat/:id"
                element={
                  canManageSystem ? (
                    <RuleDetail />
                  ) : (
                    <Navigate to="/tong-quan" replace />
                  )
                }
              />
              <Route
                path="/ma-tran-phe-duyet"
                element={
                  canManageSystem ? (
                    <ApprovalMatrix />
                  ) : (
                    <Navigate to="/tong-quan" replace />
                  )
                }
              />
              <Route
                path="/cau-hinh-hanh-dong"
                element={
                  canManageSystem ? (
                    <ActionStudio />
                  ) : (
                    <Navigate to="/tong-quan" replace />
                  )
                }
              />
              <Route path="/tro-giup" element={<TroGiup />} />
              <Route path="*" element={<Navigate to="/tong-quan" replace />} />
            </Routes>
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
}


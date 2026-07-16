import {
  lazy,
  Suspense,
  startTransition,
  useEffect,
  useRef,
  useState,
} from "react";
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
  Tooltip,
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
  ThunderboltOutlined,
  ApiOutlined,
  HistoryOutlined,
  ApartmentOutlined,
  TeamOutlined,
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
import { openAppRoute } from "./utils/navigation";

const ProcessCatalog = lazy(() => import("./pages/ProcessCatalog"));
const ProcessCreate = lazy(() => import("./pages/ProcessCreate"));
const ProcessDetail = lazy(() => import("./pages/ProcessDetail"));
const DossierList = lazy(() => import("./pages/DossierList"));
const DossierCreate = lazy(() => import("./pages/DossierCreate"));
const DossierDetail = lazy(() => import("./pages/DossierDetail"));
const NhiemVuList = lazy(() => import("./pages/NhiemVuList"));
const NhiemVuCreate = lazy(() => import("./pages/NhiemVuCreate"));
const NhiemVuDetail = lazy(() => import("./pages/NhiemVuDetail"));
const Worklist = lazy(() => import("./pages/Worklist"));
const FormLibrary = lazy(() => import("./pages/FormLibrary"));
const FormDesignerPage = lazy(() => import("./pages/FormDesignerPage"));
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
const ServiceTaskConfig = lazy(() => import("./pages/ServiceTaskConfig"));
const TroGiup = lazy(() => import("./pages/TroGiup"));
const SubsystemList = lazy(() => import("./pages/SubsystemList"));
const PhanHePage = lazy(() => import("./pages/PhanHePage"));
import SubsystemSwitcher from "./components/SubsystemSwitcher";
import { useDossiers } from "./store/DossierContext";
import { useBreadcrumb } from "./store/BreadcrumbContext";
import { useAuth, usePermissions } from "./store/AuthContext";
import { BREAKPOINTS, useViewportBelow } from "./theme/breakpoints";
import { DANH_SACH_PHAN_HE } from "./data/phanHe";

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

type BackendDemoLink = {
  url: string;
  note: string;
};

const ROUTE_BY_KEY: Record<string, string> = {
  dashboard: "/tong-quan",
  worklist: "/viec-cua-toi",
  quytrinh: "/quy-trinh",
  bieumau: "/phan-he/PH3/bieu-mau",
  nvkhcn: "/nhiem-vu",
  "nhiem-vu": "/nhiem-vu",
  "ho-so": "/ho-so",
  donvi: "/phan-he/PH2/co-cau-to-chuc",
  nguoidung: "/phan-he/PH2/nguoi-dung",
  phanquyen: "/phan-he/PH2/phan-quyen",
  giamsat: "/giam-sat",
  tichhop: "/tich-hop",
  nhatky: "/nhat-ky",
  luat: "/quan-ly-luat",
  matran: "/ma-tran-phe-duyet",
  hanhdong: "/cau-hinh-hanh-dong",
  servicetask: "/cau-hinh-service-task",
  trogiup: "/tro-giup",
  "danh-sach-phan-he": "/danh-sach-phan-he",
  "ph2-tongquan": "/phan-he/PH2/tong-quan",
  "ph2-donvi": "/phan-he/PH2/co-cau-to-chuc",
  "ph2-nguoidung": "/phan-he/PH2/nguoi-dung",
  "ph2-phanquyen": "/phan-he/PH2/phan-quyen",
  "ph3-tongquan": "/phan-he/PH3/tong-quan",
  "ph3-bieumau": "/phan-he/PH3/bieu-mau",
};

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [backendDemoLink, setBackendDemoLink] =
    useState<BackendDemoLink | null>(null);
  const screens = Grid.useBreakpoint();
  const isNarrow = useViewportBelow(BREAKPOINTS.lg);
  const wasNarrowRef = useRef(isNarrow);

  useEffect(() => {
    if (isNarrow !== wasNarrowRef.current) {
      setCollapsed(isNarrow);
      wasNarrowRef.current = isNarrow;
    }
  }, [isNarrow]);

  useEffect(() => {
    const controller = new AbortController();

    void fetch(`${import.meta.env.BASE_URL}be-demo-link.json`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<Partial<BackendDemoLink>>;
      })
      .then((value) => {
        const rawUrl = typeof value.url === "string" ? value.url.trim() : "";
        if (!rawUrl) return;

        const parsedUrl = new URL(rawUrl);
        if (parsedUrl.protocol !== "https:") return;

        setBackendDemoLink({
          url: parsedUrl.toString(),
          note: typeof value.note === "string" ? value.note.trim() : "",
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        // Fail closed: the mock remains fully usable when the optional demo link is unavailable.
        setBackendDemoLink(null);
      });

    return () => controller.abort();
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const { list } = useDossiers();
  const { crumbs } = useBreadcrumb();
  const { user, logout } = useAuth();
  const { admin, canManageSystem, canProcessStep, isChuNhiemDeTai } =
    usePermissions();

  const pending = list.filter(
    (d) =>
      d.trangThai === "processing" &&
      (admin || canProcessStep(d.steps[d.buocHienTai])),
  ).length;
  const siderW = collapsed ? SIDER_COLLAPSED_W : SIDER_W;

  useEffect(() => {
    document.documentElement.style.setProperty("--vht-sider-w", `${siderW}px`);
  }, [siderW]);

  const phanHeContextId = location.pathname.startsWith("/phan-he/PH2")
    ? "PH2"
    : location.pathname.startsWith("/phan-he/PH3")
      ? "PH3"
      : null;

  const phanHeInfo = phanHeContextId
    ? DANH_SACH_PHAN_HE.find((p) => p.id === phanHeContextId)
    : null;

  const selectedKey = location.pathname.startsWith("/phan-he/PH2/tong-quan")
    ? "ph2-tongquan"
    : location.pathname.startsWith("/phan-he/PH2/co-cau-to-chuc")
      ? "ph2-donvi"
      : location.pathname.startsWith("/phan-he/PH2/nguoi-dung")
        ? "ph2-nguoidung"
        : location.pathname.startsWith("/phan-he/PH2/phan-quyen")
          ? "ph2-phanquyen"
          : location.pathname.startsWith("/phan-he/PH3/tong-quan")
            ? "ph3-tongquan"
            : location.pathname.startsWith("/phan-he/PH3/bieu-mau")
              ? "ph3-bieumau"
              : location.pathname.startsWith("/tong-quan")
                ? "dashboard"
                : location.pathname.startsWith("/viec-cua-toi")
                  ? "worklist"
                  : location.pathname.startsWith("/giam-sat")
                    ? "giamsat"
                    : location.pathname.startsWith("/tich-hop")
                      ? "tichhop"
                      : location.pathname.startsWith("/nhat-ky")
                        ? "nhatky"
                        : location.pathname.startsWith("/quy-trinh")
                          ? "quytrinh"
                          : location.pathname.startsWith("/quan-ly-luat")
                            ? "luat"
                            : location.pathname.startsWith("/ma-tran-phe-duyet")
                              ? "matran"
                              : location.pathname.startsWith(
                                    "/cau-hinh-hanh-dong",
                                  )
                                ? "hanhdong"
                                : location.pathname.startsWith(
                                      "/cau-hinh-service-task",
                                    )
                                  ? "servicetask"
                                  : location.pathname.startsWith("/ho-so")
                                    ? "ho-so"
                                    : location.pathname.startsWith("/nhiem-vu")
                                      ? "nhiem-vu"
                                      : location.pathname.startsWith(
                                            "/tro-giup",
                                          )
                                        ? "trogiup"
                                        : location.pathname.startsWith(
                                              "/danh-sach-phan-he",
                                            )
                                          ? "danh-sach-phan-he"
                                          : location.pathname.startsWith(
                                                "/phan-he/",
                                              )
                                            ? "danh-sach-phan-he"
                                            : "quytrinh";

  const SECTION_TITLE: Record<string, string> = {
    dashboard: "Tổng quan",
    worklist: "Việc của tôi",
    nvkhcn: "Quản trị KHCN",
    "nhiem-vu": "Quản trị KHCN",
    "ho-so": "Quản trị KHCN",
    "ph2-tongquan": "Tổng quan",
    "ph2-donvi": "Quản trị đơn vị",
    "ph2-nguoidung": "Quản trị người dùng",
    "ph2-phanquyen": "Phân quyền",
    "ph3-tongquan": "Tổng quan",
    "ph3-bieumau": "Thư viện biểu mẫu",
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
    servicetask: "Tác vụ hệ thống",
    trogiup: "Hướng dẫn sử dụng",
    quytrinh: "Quản trị quy trình",
    "danh-sach-phan-he": "Danh sách Phân hệ",
  };
  const sectionTitle = SECTION_TITLE[selectedKey] ?? "Quản trị quy trình";

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
    ...(!isChuNhiemDeTai
      ? [
          {
            key: "quytrinh-config",
            icon: <PartitionOutlined />,
            label: "Quản trị quy trình",
            children: [
              { key: "quytrinh", icon: null, label: "Quản lý quy trình" },
              { key: "luat", icon: null, label: "Ma trận quyết định" },
              { key: "matran", icon: null, label: "Ma trận phê duyệt" },
              { key: "hanhdong", icon: null, label: "Ma trận Hành động" },
              ...(canManageSystem
                ? [
                    {
                      key: "servicetask",
                      icon: null,
                      label: "Tác vụ hệ thống",
                    },
                    {
                      key: "giamsat",
                      icon: <ThunderboltOutlined />,
                      label: "Giám sát tiến trình",
                    },
                    {
                      key: "tichhop",
                      icon: <ApiOutlined />,
                      label: "Tích hợp",
                    },
                    {
                      key: "nhatky",
                      icon: <HistoryOutlined />,
                      label: "Nhật ký",
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
    // ...(canManageSystem
    //   ? [
    //       {
    //         key: "toChuc",
    //         icon: <KeyOutlined />,
    //         label: "Quản trị tổ chức",
    //         children: [
    //           {
    //             key: "donvi",
    //             icon: <ApartmentOutlined />,
    //             label: "Quản trị đơn vị",
    //           },
    //           {
    //             key: "nguoidung",
    //             icon: <TeamOutlined />,
    //             label: "Quản trị người dùng",
    //           },
    //           {
    //             key: "phanquyen",
    //             icon: <KeyOutlined />,
    //             label: "Phân quyền",
    //           },
    //         ],
    //       },
    //     ]
    //   : []),
    // ...(!isChuNhiemDeTai
    //   ? [
    //       {
    //         key: "danhmuc",
    //         icon: <DatabaseOutlined />,
    //         label: "Danh mục dùng chung",
    //         children: [
    //           {
    //             key: "bieumau",
    //             icon: <FormOutlined />,
    //             label: "Thư viện biểu mẫu",
    //           },
    //         ],
    //       },
    //     ]
    //   : []),
  ] as const;

  const menuItemsMain = menuItems.filter((i) => i.key !== "trogiup");

  const PH_MENU_MAP: Record<string, any[]> = {
    PH2: [
      { key: "ph2-tongquan", icon: <DashboardOutlined />, label: "Tổng quan" },
      {
        key: "ph2-donvi",
        icon: <ApartmentOutlined />,
        label: "Quản trị đơn vị",
      },
      {
        key: "ph2-nguoidung",
        icon: <TeamOutlined />,
        label: "Quản trị người dùng",
      },
      { key: "ph2-phanquyen", icon: <KeyOutlined />, label: "Phân quyền" },
    ],
    PH3: [
      { key: "ph3-tongquan", icon: <DashboardOutlined />, label: "Tổng quan" },
      {
        key: "ph3-bieumau",
        icon: <FormOutlined />,
        label: "Thư viện biểu mẫu",
      },
    ],
  };

  const isStandalonePage = location.pathname.startsWith("/danh-sach-phan-he");

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (location.pathname === "/login") {
    return <Navigate to="/danh-sach-phan-he" replace />;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {!isStandalonePage && (
        <>
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            trigger={null}
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
                minHeight: 82,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <div
                style={{
                  background: phanHeInfo ? `${phanHeInfo.color}25` : "#fff",
                  color: phanHeInfo ? phanHeInfo.color : "#bf0027",
                  fontWeight: 900,
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  display: "grid",
                  placeItems: "center",
                  flex: "0 0 auto",
                  fontSize: phanHeInfo ? 12 : undefined,
                }}
              >
                {phanHeInfo ? phanHeInfo.id : "VHT"}
              </div>
              {!collapsed && (
                <Tooltip
                  placement="right"
                  title={
                    phanHeInfo
                      ? `${phanHeInfo.ten} - ${phanHeInfo.moTa}`
                      : "QTKHCN - Quản trị KHCN"
                  }
                >
                  <div style={{ minWidth: 0, lineHeight: 1.15 }}>
                    <div
                      style={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 13,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {phanHeInfo ? phanHeInfo.ten : "QTKHCN"}
                    </div>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.72)",
                        fontSize: 11,
                        marginTop: 3,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {phanHeInfo ? phanHeInfo.moTa : "Quản trị KHCN"}
                    </div>
                  </div>
                </Tooltip>
              )}
            </div>
            <div style={{ flex: 1, overflow: "auto" }}>
              <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[selectedKey]}
                items={
                  (phanHeContextId && PH_MENU_MAP[phanHeContextId]) ||
                  menuItemsMain
                }
                onClick={({ key }) => {
                  const to = ROUTE_BY_KEY[key];
                  if (to) startTransition(() => navigate(to));
                }}
              />
            </div>
          </Sider>

          <div
            onClick={() => openAppRoute("/tro-giup")}
            style={{
              position: "fixed",
              insetInlineStart: 8,
              bottom: 16,
              width: collapsed ? SIDER_COLLAPSED_W - 16 : SIDER_W - 16,
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
        </>
      )}

      <Layout
        style={{
          marginInlineStart: isStandalonePage ? 0 : siderW,
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
            {!isStandalonePage && (
              <Button
                type="text"
                aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                style={{ color: "var(--vht-red)" }}
                onClick={() => setCollapsed((v) => !v)}
              />
            )}
            {isStandalonePage ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: "var(--vht-ink)",
                  userSelect: "none",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 8,
                    height: 8,
                    background: "var(--vht-red)",
                    flexShrink: 0,
                  }}
                />
                QTKHCN
              </span>
            ) : (
              <Breadcrumb
                items={breadcrumbItems}
                style={{ whiteSpace: "normal" }}
              />
            )}
          </div>
          <Space size={4} align="center">
            {backendDemoLink && (
              <Tooltip
                title={
                  backendDemoLink.note || "Mở bản demo kết nối backend thật"
                }
              >
                <Button
                  type="link"
                  icon={<ApiOutlined />}
                  href={backendDemoLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ paddingInline: 8 }}
                >
                  {screens.md ? "Demo có Backend" : "Demo BE"}
                </Button>
              </Tooltip>
            )}
            <SubsystemSwitcher />
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
          </Space>
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
              <Route
                path="/"
                element={<Navigate to="/danh-sach-phan-he" replace />}
              />
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
                path="/phan-he/PH3/bieu-mau"
                element={
                  !isChuNhiemDeTai ? (
                    <FormLibrary />
                  ) : (
                    <Navigate to="/tong-quan" replace />
                  )
                }
              />
              <Route
                path="/phan-he/PH3/bieu-mau/:key/thiet-ke"
                element={
                  !isChuNhiemDeTai ? (
                    <FormDesignerPage />
                  ) : (
                    <Navigate to="/tong-quan" replace />
                  )
                }
              />
              <Route path="/nhiem-vu" element={<NhiemVuList />} />
              <Route path="/nhiem-vu/moi" element={<NhiemVuCreate />} />
              <Route path="/nhiem-vu/:ma" element={<NhiemVuDetail />} />
              <Route path="/ho-so" element={<DossierList />} />
              <Route path="/ho-so/tao-moi" element={<DossierCreate />} />
              <Route path="/ho-so/:id" element={<DossierDetail />} />
              <Route
                path="/phan-he/PH2/co-cau-to-chuc"
                element={
                  canManageSystem ? (
                    <OrgStructure />
                  ) : (
                    <Navigate to="/tong-quan" replace />
                  )
                }
              />
              <Route
                path="/phan-he/PH2/nguoi-dung"
                element={
                  canManageSystem ? (
                    <UserManagement />
                  ) : (
                    <Navigate to="/tong-quan" replace />
                  )
                }
              />
              <Route
                path="/phan-he/PH2/phan-quyen"
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
              <Route
                path="/cau-hinh-service-task"
                element={
                  canManageSystem ? (
                    <ServiceTaskConfig />
                  ) : (
                    <Navigate to="/tong-quan" replace />
                  )
                }
              />
              <Route path="/tro-giup" element={<TroGiup />} />
              <Route path="/danh-sach-phan-he" element={<SubsystemList />} />
              <Route
                path="/phan-he/PH2"
                element={<Navigate to="/phan-he/PH2/tong-quan" replace />}
              />
              <Route
                path="/phan-he/PH2/tong-quan"
                element={<PhanHePage phanHeId="PH2" />}
              />
              <Route
                path="/phan-he/PH3"
                element={<Navigate to="/phan-he/PH3/tong-quan" replace />}
              />
              <Route
                path="/phan-he/PH3/tong-quan"
                element={<PhanHePage phanHeId="PH3" />}
              />
              <Route
                path="/phan-he/PH4"
                element={<Navigate to="/phan-he/PH4/tong-quan" replace />}
              />
              <Route
                path="/phan-he/PH4/tong-quan"
                element={<PhanHePage phanHeId="PH4" />}
              />
              <Route path="/phan-he/:id" element={<PhanHePage />} />
              <Route
                path="*"
                element={<Navigate to="/danh-sach-phan-he" replace />}
              />
            </Routes>
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
}

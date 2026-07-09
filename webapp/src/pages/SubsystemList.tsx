import { useState, useMemo, useCallback, useEffect } from "react";
import { Typography, Row, Col, Space, Button, Dropdown, Tooltip } from "antd";
import {
  HomeOutlined,
  SafetyOutlined,
  DatabaseOutlined,
  PartitionOutlined,
  ShoppingOutlined,
  DollarOutlined,
  InboxOutlined,
  AppstoreOutlined,
  ExperimentOutlined,
  PushpinOutlined,
  PushpinFilled,
  LockOutlined,
  DownOutlined,
  ArrowRightOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { PageHeader, StatCard, FilterBar } from "../components/ui";
import { usePermissions } from "../store/AuthContext";
import {
  DANH_SACH_PHAN_HE,
  getPhanHeStatus,
  normalizeVietnamese,
  type PhanHe,
  type PhanHeStatus,
  type PhanHePermissions,
} from "../data/phanHe";

const { Text, Paragraph } = Typography;

/* ---------- localStorage keys ---------- */
const LS_PINNED = "qtkhcn.phanhe.pinned";

/* ---------- icon map ---------- */
const ICON_MAP: Record<string, React.ReactNode> = {
  HomeOutlined: <HomeOutlined />,
  SafetyOutlined: <SafetyOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  PartitionOutlined: <PartitionOutlined />,
  ShoppingOutlined: <ShoppingOutlined />,
  DollarOutlined: <DollarOutlined />,
  InboxOutlined: <InboxOutlined />,
};

/* ---------- helpers ---------- */
function loadIds(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}
function saveIds(key: string, ids: string[]) {
  localStorage.setItem(key, JSON.stringify(ids));
}

function togglePinned(id: string): boolean {
  const pinned = loadIds(LS_PINNED);
  const idx = pinned.indexOf(id);
  if (idx >= 0) {
    pinned.splice(idx, 1);
    saveIds(LS_PINNED, pinned);
    return false;
  }
  pinned.push(id);
  saveIds(LS_PINNED, pinned);
  return true;
}

/* ---------- trạng thái → màu + nhãn ---------- */
const STATUS_META: Record<
  PhanHeStatus,
  {
    label: string;
    color: string;
    variant: "active" | "maintenance" | "coming" | "locked";
  }
> = {
  active: { label: "Sẵn sàng", color: "#52c41a", variant: "active" },
  "no-permission": {
    label: "Chưa được cấp quyền",
    color: "#737373",
    variant: "locked",
  },
  "coming-soon": { label: "Sắp ra mắt", color: "#fa8c16", variant: "coming" },
  maintenance: {
    label: "Đang bảo trì",
    color: "#ff4d4f",
    variant: "maintenance",
  },
};

/* ---------- status badge style map ---------- */
const STATUS_BADGE_STYLE: Record<string, { bg: string; color: string }> = {
  active: { bg: "#f6ffed", color: "#389e0d" },
  maintenance: { bg: "#fff2f0", color: "#cf1322" },
  coming: { bg: "#fff7e6", color: "#d46b08" },
  locked: { bg: "#f5f5f5", color: "#737373" },
};

/* ================================================================
   PhanHeCard — card phân hệ
   Layout: icon + status badge | title | description | footer (meta + CTA)
   ================================================================ */
function PhanHeCard({
  ph,
  status,
  pinned,
  onTogglePin,
  onNavigate,
}: {
  ph: PhanHe;
  status: PhanHeStatus;
  pinned: boolean;
  onTogglePin: () => void;
  onNavigate: (route: string) => void;
}) {
  const accent = ph.color;
  const isDisabled = status !== "active";
  const meta = STATUS_META[status];
  const badgeStyle = STATUS_BADGE_STYLE[meta.variant];

  const handleClick = () => {
    if (!isDisabled) {
      onNavigate(ph.route);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isDisabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const moduleMenu =
    !isDisabled && ph.modules.length > 0
      ? {
          items: ph.modules.map((m) => ({
            key: m.route,
            label: m.label,
            icon: <ArrowRightOutlined />,
          })),
          onClick: ({ key }: { key: string }) => {
            onNavigate(key);
          },
        }
      : undefined;

  // Footer metadata text based on status
  const footerMeta = (() => {
    if (status === "maintenance") return "Bảo trì định kỳ";
    if (status === "coming-soon" && ph.estimatedRelease)
      return ph.estimatedRelease;
    if (status === "no-permission") return "Liên hệ quản trị để được cấp quyền";
    if (ph.pendingTasks && ph.pendingTasks > 0)
      return `${ph.pendingTasks} việc cần xử lý`;
    return `${ph.modules.length} module${ph.modules.length !== 1 ? "s" : ""}`;
  })();

  return (
    <div
      role={isDisabled ? undefined : "button"}
      tabIndex={isDisabled ? undefined : 0}
      aria-disabled={isDisabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{
        position: "relative",
        borderRadius: 8,
        border: `1px solid ${isDisabled ? "#f0f0f0" : "var(--vht-border)"}`,
        background: isDisabled ? "#fafafa" : "#fff",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        cursor: isDisabled ? "default" : "pointer",
        transition: "all 0.25s ease",
        height: "100%",
        opacity: isDisabled ? 0.75 : 1,
        outline: "none",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={(e) => {
        if (isDisabled) return;
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = accent;
        el.style.boxShadow = `0 4px 16px ${accent}18`;
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = isDisabled ? "#f0f0f0" : "var(--vht-border)";
        el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
        el.style.transform = "translateY(0)";
      }}
      onFocus={(e) => {
        if (isDisabled) return;
        (e.currentTarget as HTMLElement).style.boxShadow =
          `0 0 0 2px ${accent}40`;
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 1px 3px rgba(0,0,0,0.04)";
      }}
    >
      {/* ── Body ── */}
      <div style={{ padding: "20px 20px 16px", flex: 1 }}>
        {/* Row 1: icon (left) + status badge (right) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 12,
              background: isDisabled ? "#f0f0f0" : `${accent}12`,
              color: isDisabled ? "#bfbfbf" : accent,
              display: "grid",
              placeItems: "center",
              fontSize: 26,
              flexShrink: 0,
              transition: "background 0.2s",
            }}
          >
            {ICON_MAP[ph.icon] ?? <AppstoreOutlined />}
          </div>
          {/* Status badge pill */}
          <span
            style={{
              padding: "2px 10px",
              borderRadius: 4,
              background: badgeStyle.bg,
              color: badgeStyle.color,
              fontSize: 11,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {meta.label}
          </span>
        </div>

        {/* Row 2: title */}
        <Text
          strong
          style={{
            fontSize: 15,
            lineHeight: "22px",
            display: "block",
            marginBottom: 6,
          }}
        >
          {ph.ten}
        </Text>

        {/* Row 3: description */}
        <Paragraph
          type="secondary"
          style={{ fontSize: 13, lineHeight: "20px", marginBottom: 0 }}
          ellipsis={{ rows: 2 }}
        >
          {ph.moTa}
        </Paragraph>
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 20px",
          borderTop: "1px solid var(--vht-border)",
          background: "#fafafa",
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: status === "maintenance" ? "#ff4d4f" : "#737373",
            fontWeight: 500,
          }}
        >
          {footerMeta}
        </span>
        <Space size={6}>
          {/* Pin toggle */}
          <Tooltip title={pinned ? "Bỏ ghim" : "Ghim phân hệ"}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin();
              }}
              aria-label={pinned ? "Bỏ ghim" : "Ghim"}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: pinned ? accent : "#bfbfbf",
                fontSize: 14,
                padding: "2px 4px",
                borderRadius: 4,
                lineHeight: 1,
                transition: "color 0.2s",
              }}
            >
              {pinned ? <PushpinFilled /> : <PushpinOutlined />}
            </button>
          </Tooltip>

          {/* Module dropdown */}
          {moduleMenu && (
            <Dropdown menu={moduleMenu} trigger={["click"]}>
              <Button
                size="small"
                type="text"
                style={{
                  fontSize: 11,
                  color: accent,
                  padding: "0 4px",
                  height: 22,
                }}
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
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              Truy cập <ArrowRightOutlined style={{ fontSize: 11 }} />
            </Button>
          ) : status === "maintenance" ? (
            <Button
              size="small"
              disabled
              style={{ fontSize: 12, borderRadius: 4 }}
            >
              Tạm khóa
            </Button>
          ) : status === "coming-soon" ? (
            <Button
              size="small"
              disabled
              style={{ fontSize: 12, borderRadius: 4 }}
            >
              Sắp ra mắt
            </Button>
          ) : (
            <Button
              size="small"
              disabled
              style={{ fontSize: 12, borderRadius: 4 }}
            >
              <LockOutlined style={{ fontSize: 11 }} /> Yêu cầu quyền
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
}

/* ================================================================
   SubsystemList — Trang danh sách phân hệ (App Portal sau đăng nhập)
   Thiết kế đồng bộ các màn danh sách khác: PageHeader + dải StatCard +
   thanh lọc + lưới card. Nền sáng chuẩn, không theme riêng.
   ================================================================ */
export default function SubsystemList() {
  const perms = usePermissions();

  // filter states
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "active" | "no-permission" | "coming-soon"
  >("all");

  // pinned subsystem shortcuts
  const [pinnedIds, setPinnedIds] = useState<string[]>(() =>
    loadIds(LS_PINNED),
  );

  const permCtx: PhanHePermissions = useMemo(
    () => ({
      admin: perms.admin,
      canManageSystem: perms.canManageSystem,
      isChuNhiemDeTai: perms.isChuNhiemDeTai,
    }),
    [perms.admin, perms.canManageSystem, perms.isChuNhiemDeTai],
  );

  // refresh pinned items on mount (other tabs might have updated)
  useEffect(() => {
    setPinnedIds(loadIds(LS_PINNED));
  }, []);

  const handleTogglePin = useCallback((id: string) => {
    togglePinned(id);
    setPinnedIds(loadIds(LS_PINNED));
  }, []);

  // compute status per phân hệ
  const withStatus = useMemo(
    () =>
      DANH_SACH_PHAN_HE.map((ph) => ({
        ...ph,
        _status: getPhanHeStatus(ph, permCtx),
      })),
    [permCtx],
  );

  // filtered
  const filtered = useMemo(() => {
    const q = normalizeVietnamese(search.trim());
    return withStatus.filter((ph) => {
      if (filter === "active" && ph._status !== "active") return false;
      if (filter === "no-permission" && ph._status !== "no-permission")
        return false;
      if (filter === "coming-soon" && ph._status !== "coming-soon")
        return false;
      if (q) {
        return (
          normalizeVietnamese(ph.ten).includes(q) ||
          normalizeVietnamese(ph.moTa).includes(q) ||
          ph.id.toLowerCase().includes(q) ||
          ph.modules.some((m) => normalizeVietnamese(m.label).includes(q))
        );
      }
      return true;
    });
  }, [withStatus, search, filter]);

  // sections: pinned and all remaining
  const pinned = useMemo(
    () => filtered.filter((ph) => pinnedIds.includes(ph.id)),
    [filtered, pinnedIds],
  );
  const remaining = useMemo(
    () => filtered.filter((ph) => !pinnedIds.includes(ph.id)),
    [filtered, pinnedIds],
  );

  // stats (based on permission-aware data)
  const activeCount = withStatus.filter((p) => p._status === "active").length;
  const noPermCount = withStatus.filter(
    (p) => p._status === "no-permission",
  ).length;
  const comingCount = withStatus.filter(
    (p) => p._status === "coming-soon",
  ).length;
  const totalCount = DANH_SACH_PHAN_HE.length;

  const handleNavigate = useCallback(
    (route: string) => window.open(route, "_blank"),
    [],
  );

  const renderSection = (
    title: string,
    subtitle: string,
    items: typeof filtered,
  ) => {
    if (items.length === 0) return null;
    return (
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <Text strong style={{ fontSize: 15 }}>
            {title}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {subtitle} · {items.length}
          </Text>
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
    );
  };

  const FILTER_OPTIONS = [
    { key: "all", label: "Tất cả", count: totalCount },
    { key: "active", label: "Có quyền", count: activeCount },
    { key: "no-permission", label: "Chưa có quyền", count: noPermCount },
    { key: "coming-soon", label: "Sắp ra mắt", count: comingCount },
  ] as const;

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      <PageHeader
        title="Danh sách Phân hệ"
        breadcrumb={[{ label: "Danh sách Phân hệ" }]}
        code={
          <Text type="secondary" style={{ fontSize: 13 }}>
            Chào mừng trở lại. Bạn có quyền truy cập {activeCount}/{totalCount}{" "}
            phân hệ. Chọn phân hệ để bắt đầu; ghim phân hệ thường dùng để truy
            cập nhanh.
          </Text>
        }
      />

      {/* ── Dải chỉ số ── */}
      <Row gutter={14} style={{ marginBottom: 18 }}>
        <Col xs={12} md={6}>
          <StatCard title="Tổng phân hệ" value={totalCount} />
        </Col>
        <Col xs={12} md={6}>
          <StatCard
            title="Có quyền truy cập"
            value={activeCount}
            color="#17935a"
          />
        </Col>
        <Col xs={12} md={6}>
          <StatCard title="Chưa có quyền" value={noPermCount} color="#737373" />
        </Col>
        <Col xs={12} md={6}>
          <StatCard title="Sắp ra mắt" value={comingCount} color="#b06f00" />
        </Col>
      </Row>

      {/* ── Thanh lọc + tìm kiếm ── */}
      <FilterBar
        search={{
          placeholder: "Tìm phân hệ... (hỗ trợ không dấu)",
          value: search,
          onChange: setSearch,
          width: 280,
        }}
        left={
          <Space size={4} wrap>
            {FILTER_OPTIONS.map((f) => (
              <Button
                key={f.key}
                type={filter === f.key ? "primary" : "default"}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: 11,
                    background:
                      filter === f.key ? "rgba(255,255,255,0.25)" : "#f0f0f0",
                    padding: "0 6px",
                    borderRadius: 10,
                  }}
                >
                  {f.count}
                </span>
              </Button>
            ))}
          </Space>
        }
        right={
          <Text type="secondary">
            {filtered.length}/{totalCount} phân hệ
          </Text>
        }
      />

      {/* ── Pinned section ── */}
      {renderSection("📌 Đã ghim", "Truy cập nhanh", pinned)}

      {/* ── All remaining ── */}
      {filter === "all"
        ? renderSection("📋 Tất cả phân hệ", "Toàn bộ danh sách", remaining)
        : remaining.length > 0 && (
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

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            color: "#8593a3",
          }}
        >
          <ExperimentOutlined
            style={{ fontSize: 48, marginBottom: 16, color: "#c7cfda" }}
          />
          <br />
          <Text type="secondary">Không tìm thấy phân hệ nào phù hợp.</Text>
          <br />
          <Button
            type="link"
            onClick={() => {
              setSearch("");
              setFilter("all");
            }}
            style={{ marginTop: 8 }}
          >
            Xóa bộ lọc
          </Button>
        </div>
      )}

      {/* ── Request-access placeholder ── */}
      {activeCount === 0 && noPermCount > 0 && (
        <div
          style={{
            border: "2px dashed var(--vht-border-strong)",
            borderRadius: 8,
            padding: "32px 24px",
            textAlign: "center",
            marginTop: 8,
            background: "#fff",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "2px solid var(--vht-red-100)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              color: "var(--vht-red)",
              fontSize: 20,
            }}
          >
            <PlusOutlined />
          </div>
          <Text
            strong
            style={{ fontSize: 14, display: "block", marginBottom: 4 }}
          >
            Yêu cầu quyền truy cập
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Bạn chưa có quyền truy cập phân hệ nào. Liên hệ quản trị viên để
            được cấp quyền.
          </Text>
        </div>
      )}
    </div>
  );
}

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  App,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Tooltip,
  Typography,
} from "antd";
import {
  ApartmentOutlined,
  ApiOutlined,
  BankOutlined,
  DatabaseOutlined,
  DisconnectOutlined,
  ExclamationCircleFilled,
  LinkOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import HelpButton from '../components/HelpButton'
import { PageHeader, StatCard } from "../components/ui";
import {
  INTEG_STATUS,
  seedIntegrations,
  type IntegrationSystem,
} from "../data/camundaOps";

const { Text } = Typography;

/** Icon + màu tile cho từng hệ (kiểu bento — list-card-sample.md). */
const SYS_VISUAL: Record<string, { icon: ReactNode; bg: string; color: string }> = {
  QLNS: { icon: <TeamOutlined />, bg: "#e6f4ff", color: "#0958d9" },
  MS: { icon: <ShoppingCartOutlined />, bg: "#fff7e6", color: "#d46b08" },
  SAP: { icon: <BankOutlined />, bg: "#f9f0ff", color: "#531dab" },
  QLTS: { icon: <DatabaseOutlined />, bg: "#fffbe6", color: "#ad8b00" },
  PLM: { icon: <ApartmentOutlined />, bg: "#f6ffed", color: "#389e0d" },
  IAM: { icon: <SafetyCertificateOutlined />, bg: "#fff1f0", color: "#cf1322" },
};
const SYS_VISUAL_FALLBACK = { icon: <ApiOutlined />, bg: "#f5f3f3", color: "#5a6675" };

interface ConnectFormValues {
  apiKey: string;
  endpoint: string;
}

/** Trạng thái Tích hợp — Seam B (Camunda ↔ QLNS/MS/SAP/QLTS/PLM/IAM). */
export default function IntegrationStatus() {
  const { message, modal } = App.useApp();
  const [systems, setSystems] = useState<IntegrationSystem[]>(seedIntegrations);
  /** Hệ đang mở popup Kết nối/Cấu hình (null = đóng). */
  const [target, setTarget] = useState<IntegrationSystem | null>(null);
  const [form] = Form.useForm<ConnectFormValues>();

  const stats = useMemo(() => {
    const total = systems.length;
    const connected = systems.filter((s) => s.trangThai !== "down").length;
    const errors = systems.reduce((s, x) => s + x.loi24h, 0);
    const queued = systems.reduce((s, x) => s + x.hangDoi, 0);
    return { total, connected, errors, queued };
  }, [systems]);

  const openConnect = (s: IntegrationSystem) => {
    setTarget(s);
    form.setFieldsValue({ apiKey: "", endpoint: s.endpoint });
  };

  const handleConnect = async () => {
    const v = await form.validateFields();
    if (!target) return;
    const now = new Date();
    const stamp = `${now.toLocaleDateString("vi-VN")} ${now
      .toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
    setSystems((prev) =>
      prev.map((s) =>
        s.key === target.key
          ? {
              ...s,
              trangThai: "healthy",
              endpoint: v.endpoint.trim(),
              apiKeyTail: v.apiKey.trim().slice(-4).toUpperCase(),
              lanDongBoCuoi: stamp,
            }
          : s,
      ),
    );
    setTarget(null);
    form.resetFields();
    message.success(`Đã kết nối hệ ${target.key} — ${target.ten}.`);
  };

  const handleDisconnect = (s: IntegrationSystem) => {
    modal.confirm({
      title: `Ngắt kết nối ${s.key}?`,
      icon: <ExclamationCircleFilled style={{ color: "#bf0027" }} />,
      content: (
        <>
          Các service task gọi <Text strong>{s.ten}</Text> sẽ tạo incident cho
          tới khi kết nối lại. API key hiện tại bị thu hồi khỏi cấu hình.
        </>
      ),
      okText: "Ngắt kết nối",
      okButtonProps: { danger: true },
      cancelText: "Huỷ",
      onOk: () => {
        setSystems((prev) =>
          prev.map((x) =>
            x.key === s.key
              ? { ...x, trangThai: "down", apiKeyTail: undefined }
              : x,
          ),
        );
        message.success(`Đã ngắt kết nối hệ ${s.key}.`);
      },
    });
  };

  return (
    <div>
      <PageHeader
        title="Trạng thái Tích hợp"
        icon={<ApiOutlined style={{ fontSize: 26, color: "#ee0033" }} />}
        code={
          <Text type="secondary" style={{ fontSize: 13 }}>
            Quản lý kết nối tới các hệ thống ngoài — cấu hình API key, endpoint
            và theo dõi đồng bộ.
          </Text>
        }
        extra={<HelpButton section="tichhop" />}
      />

      {/* Dải KPI kiểu bento: vạch nhấn trái theo ngữ nghĩa (list-card-sample.md). */}
      <Row gutter={[14, 14]} style={{ marginBottom: 18 }}>
        <Col xs={12} md={6}>
          <StatCard
            title="Đã kết nối"
            value={`${stats.connected} / ${stats.total}`}
            style={{ borderLeft: "4px solid #ee0033" }}
          />
        </Col>
        <Col xs={12} md={6}>
          <StatCard
            title="Hệ tích hợp"
            value={stats.total}
            style={{ borderLeft: "4px solid #1c1c1c" }}
          />
        </Col>
        <Col xs={12} md={6}>
          <StatCard
            title="Lỗi 24h"
            value={stats.errors}
            color="#cf1322"
            style={{ borderLeft: "4px solid #cf1322" }}
          />
        </Col>
        <Col xs={12} md={6}>
          <StatCard
            title="Job trong hàng đợi"
            value={stats.queued}
            color="#b06f00"
            style={{ borderLeft: "4px solid #daa520" }}
          />
        </Col>
      </Row>

      <Row gutter={[14, 14]} style={{ marginBottom: 20 }}>
        {systems.map((s) => (
          <Col xs={24} sm={12} xl={8} key={s.key}>
            <SystemCard
              s={s}
              onConnect={() => openConnect(s)}
              onDisconnect={() => handleDisconnect(s)}
            />
          </Col>
        ))}
      </Row>

      {/* Popup Kết nối / Cấu hình lại: nhập API key + endpoint. */}
      <Modal
        open={!!target}
        title={
          target
            ? `${target.trangThai === "down" ? "Kết nối" : "Cấu hình kết nối"} ${target.key}`
            : undefined
        }
        onCancel={() => {
          setTarget(null);
          form.resetFields();
        }}
        onOk={handleConnect}
        okText={target?.trangThai === "down" ? "Kết nối" : "Lưu cấu hình"}
        cancelText="Huỷ"
        destroyOnHidden
        className="vht-modal-topred"
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item label="Hệ thống">
            <Input
              value={target ? `${target.key} — ${target.ten}` : ""}
              disabled
            />
          </Form.Item>
          <Form.Item
            name="apiKey"
            label="API Key"
            rules={[
              { required: true, message: "Nhập API key do hệ đích cấp." },
              { min: 8, message: "API key tối thiểu 8 ký tự." },
            ]}
            extra="Key được mã hoá khi lưu; màn hình chỉ hiển thị 4 ký tự cuối."
          >
            <Input.Password placeholder="vd: vht_live_xxxxxxxxxxxxxxxx" />
          </Form.Item>
          <Form.Item
            name="endpoint"
            label="Endpoint"
            rules={[{ required: true, message: "Nhập endpoint của hệ đích." }]}
          >
            <Input placeholder="https://..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

function SystemCard({
  s,
  onConnect,
  onDisconnect,
}: {
  s: IntegrationSystem;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const m = INTEG_STATUS[s.trangThai];
  const visual = SYS_VISUAL[s.key] ?? SYS_VISUAL_FALLBACK;
  const connected = s.trangThai !== "down";

  return (
    <div className="vht-bento-card" style={cardOuterStyle}>
      {/* ── Hàng 1: icon tile + tên/key (2 hàng) + pill trạng thái ── */}
      <div style={cardHeadStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: visual.bg,
              color: visual.color,
              fontSize: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {visual.icon}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Text strong style={{ fontSize: 16, lineHeight: "22px" }}>
              {s.key}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {s.ten}
            </Text>
          </div>
        </div>
        <span
          style={{
            ...statusPillStyle,
            backgroundColor: m.color === "success" ? "#389e0d15" : m.color === "warning" ? "#d4b10615" : "#cf132215",
            color: m.color === "success" ? "#389e0d" : m.color === "warning" ? "#ad8b00" : "#cf1322",
            border: `1px solid ${m.color === "success" ? "#389e0d30" : m.color === "warning" ? "#ad8b0030" : "#cf132230"}`,
          }}
        >
          {m.label}
        </span>
      </div>

      {/* ── Thông tin kết nối (label — value, như mẫu list-card-sample) ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        <InfoRowSample
          label="API Key"
          value={
            s.apiKeyTail ? (
              <span style={{ fontSize: 12, fontFamily: "monospace", color: "#1a1c1e", fontWeight: 500 }}>
                •••• •••• {s.apiKeyTail}
              </span>
            ) : (
              <span style={{ fontSize: 12, fontStyle: "italic", color: "#9ca3af" }}>
                Chưa thiết lập
              </span>
            )
          }
        />
        <InfoRowSample
          label="Endpoint"
          value={
            <Tooltip title={s.endpoint}>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "monospace",
                  color: "#1a1c1e",
                  fontWeight: 500,
                  maxWidth: 180,
                  display: "inline-block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {s.endpoint}
              </span>
            </Tooltip>
          }
        />
        <InfoRowSample
          label="Đồng bộ cuối"
          value={
            connected ? (
              <span style={{ fontSize: 12, color: "#1a1c1e", fontWeight: 500 }}>
                {s.lanDongBoCuoi}
              </span>
            ) : (
              <span style={{ fontSize: 12, fontStyle: "italic", fontWeight: 600, color: "#cf1322" }}>
                Mất kết nối
              </span>
            )
          }
        />
      </div>

      {/* ── Dải chỉ số 24h — border-top thay bg (như sample) ── */}
      <div style={metricRowStyle}>
        <MetricSample label="Bản ghi 24h" value={s.banGhi24h.toLocaleString("vi-VN")} />
        <MetricDivider />
        <MetricSample label="Lỗi 24h" value={s.loi24h} danger={s.loi24h > 0} />
        <MetricDivider />
        <MetricSample label="Hàng đợi" value={s.hangDoi} danger={s.hangDoi > 3} />
      </div>

      {/* ── Đường kẻ chia ── */}
      <div style={{ borderTop: "1px solid #e2e2e5", margin: "14px 0 12px" }} />

      {/* ── Chân card: nút hành động ── */}
      {connected ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button
            type="button"
            onClick={onConnect}
            style={btnOutlineStyle}
          >
            <SettingOutlined style={{ fontSize: 14 }} /> Cấu hình
          </button>
          <button
            type="button"
            onClick={onDisconnect}
            style={btnDangerStyle}
          >
            <DisconnectOutlined style={{ fontSize: 14 }} /> Ngắt kết nối
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onConnect}
          style={btnPrimaryStyle}
        >
          <LinkOutlined style={{ fontSize: 14 }} /> Kết nối
        </button>
      )}

      <div style={{ marginTop: 10 }}>
        <Tooltip title="Requirement/NFR liên quan">
          <span style={{ fontSize: 11, color: "#9ca3af" }}>{s.ref}</span>
        </Tooltip>
      </div>
    </div>
  );
}

/* ─── component nhỏ ─── */

/** Dòng thông tin label — value (như mẫu list-card-sample). */
function InfoRowSample({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={infoRowStyle}>
      <span style={infoLabelStyle}>{label}</span>
      {value}
    </div>
  );
}

/** Ô chỉ số trong dải metrics. */
function MetricSample({
  label,
  value,
  danger,
}: {
  label: string;
  value: ReactNode;
  danger?: boolean;
}) {
  return (
    <div style={{ flex: 1, textAlign: "center" }}>
      <div
        style={{
          fontWeight: 700,
          fontSize: 15,
          color: danger ? "#cf1322" : "#1a1c1e",
          lineHeight: "22px",
        }}
      >
        {danger && (
          <ExclamationCircleFilled style={{ fontSize: 11, marginInlineEnd: 3 }} />
        )}
        {value}
      </div>
      <span style={{ fontSize: 10, color: "#6b7280" }}>{label}</span>
    </div>
  );
}

function MetricDivider() {
  return (
    <div
      style={{
        width: 1,
        height: 28,
        background: "#e2e2e5",
        alignSelf: "center",
      }}
    />
  );
}

/* ─── inline styles ─── */

const cardOuterStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e2e5",
  borderRadius: 10,
  padding: 20,
  display: "flex",
  flexDirection: "column",
  height: "100%",
  cursor: "default",
};

const cardHeadStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 14,
};

const statusPillStyle: CSSProperties = {
  display: "inline-block",
  fontSize: 11,
  fontWeight: 600,
  padding: "2px 10px",
  borderRadius: 999,
  lineHeight: "18px",
  letterSpacing: "0.02em",
  textTransform: "uppercase",
};

const infoRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const infoLabelStyle: CSSProperties = {
  fontSize: 12,
  color: "#6b7280",
  fontWeight: 500,
};

const metricRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  paddingTop: 12,
  borderTop: "1px solid #e2e2e5",
};

const btnBase: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  fontSize: 13,
  fontWeight: 600,
  padding: "8px 0",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  transition: "all 0.15s ease",
  lineHeight: "20px",
  width: "100%",
};

const btnOutlineStyle: CSSProperties = {
  ...btnBase,
  background: "#fff",
  color: "#ee0033",
  border: "1px solid #ee0033",
};

const btnDangerStyle: CSSProperties = {
  ...btnBase,
  background: "#fff",
  color: "#cf1322",
  border: "1px solid #cf1322",
};

const btnPrimaryStyle: CSSProperties = {
  ...btnBase,
  background: "#ee0033",
  color: "#fff",
};



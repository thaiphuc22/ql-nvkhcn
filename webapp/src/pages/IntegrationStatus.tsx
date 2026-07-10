import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  App,
  Col,
  Drawer,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Table,
  Tabs,
  Tag,
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
import type { ColumnsType } from "antd/es/table";
import HelpButton from '../components/HelpButton'
import MappingStudio from "../components/MappingStudio";
import { PageHeader, StatCard, StatusTag } from "../components/ui";
import { useIntegrationMapping } from "../store/IntegrationMappingContext";
import {
  BUSINESS_OBJECT_LABEL,
  MAPPING_STATUS_META,
} from "../data/integrationMapping";
import {
  INTEG_STATUS,
  JOB_OUTCOME,
  integrationSuccessRate,
  jobRunsForSystem,
  lastErrorAt,
  openIncidentCount,
  seedIntegrations,
  type IntegrationSystem,
  type JobOutcome,
  type JobRun,
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
  /** Hệ đang mở drawer "Xem chi tiết" (null = đóng). */
  const [detail, setDetail] = useState<IntegrationSystem | null>(null);
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

      <Tabs
        defaultActiveKey="tongquan"
        items={[
          {
            key: "tongquan",
            label: "Tổng quan",
            children: (
              <>
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
                        onDetail={() => setDetail(s)}
                      />
                    </Col>
                  ))}
                </Row>
              </>
            ),
          },
          {
            key: "mapping",
            label: "Mapping dữ liệu",
            children: <MappingStudio />,
          },
          {
            key: "joblog",
            label: "Job & lỗi (sắp có)",
            disabled: true,
            children: null,
          },
          {
            key: "cauhinh",
            label: "Cấu hình kết nối (sắp có)",
            disabled: true,
            children: null,
          },
          {
            key: "kiemthu",
            label: "Kiểm thử (sắp có)",
            disabled: true,
            children: null,
          },
        ]}
      />

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

      <SystemDetailDrawer system={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

/** Drawer "Xem chi tiết" một hệ tích hợp — thông tin kết nối + job/lỗi gần nhất. */
function SystemDetailDrawer({
  system,
  onClose,
}: {
  system: IntegrationSystem | null;
  onClose: () => void;
}) {
  const { listForSystem } = useIntegrationMapping();
  const jobs = useMemo(
    () => (system ? jobRunsForSystem(system.key).slice(0, 5) : []),
    [system],
  );
  const mappings = useMemo(
    () => (system ? listForSystem(system.key) : []),
    [system, listForSystem],
  );

  if (!system) return null;
  const visual = SYS_VISUAL[system.key] ?? SYS_VISUAL_FALLBACK;
  const m = INTEG_STATUS[system.trangThai];
  const rate = integrationSuccessRate(system);
  const errAt = lastErrorAt(system.key);

  const columns: ColumnsType<JobRun> = [
    {
      title: "Job type",
      dataIndex: "jobType",
      render: (v: string) => (
        <Text code style={{ fontSize: 12 }}>
          {v}
        </Text>
      ),
    },
    { title: "Mã hồ sơ", dataIndex: "maHoSo", width: 120 },
    { title: "Thời điểm", dataIndex: "thoiDiem", width: 140 },
    {
      title: "Kết quả",
      dataIndex: "ketQua",
      width: 110,
      render: (v: JobOutcome) => (
        <StatusTag color={JOB_OUTCOME[v].color} label={JOB_OUTCOME[v].label} />
      ),
    },
  ];

  return (
    <Drawer
      title={
        <Space>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: visual.bg,
              color: visual.color,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
            }}
          >
            {visual.icon}
          </span>
          {system.key} — {system.ten}
        </Space>
      }
      open={!!system}
      onClose={onClose}
      width={480}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        <div>
          <Tag color={m.color === "success" ? "success" : m.color === "warning" ? "warning" : "error"}>
            {m.label}
          </Tag>
          <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 8 }}>
            {system.moTa}
          </Text>
        </div>

        {/* Ghi chú vai trò Connector (Phase 2 — xem docs/research/quan-tri-quy-trinh-mockup-upgrade-plan-2026-07-10.md
            mục "Khung hiển thị vai trò Connector"). Thuần trình bày, KHÔNG phải Connector Worker/Zeebe job worker thật. */}
        <div
          style={{
            background: "#f5f3f3",
            border: "1px dashed #d0d0d5",
            borderRadius: 8,
            padding: "10px 12px",
          }}
        >
          <Text style={{ fontSize: 12, color: "#6b7280" }}>
            <ApartmentOutlined style={{ marginInlineEnd: 6 }} />
            Vai trò trong nền tảng (khái niệm — chờ đặc tả kỹ thuật): hệ này tham
            gia như <Text strong style={{ fontSize: 12 }}>data/service endpoint</Text>,
            không sở hữu hay thay thế workflow nội bộ của hệ nguồn.
          </Text>
        </div>

        <div>
          <Text strong style={{ fontSize: 13 }}>
            Thông tin kết nối
          </Text>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            <InfoRowSample label="Giao thức" value={<Text style={{ fontSize: 12 }}>{system.giaoThuc}</Text>} />
            <InfoRowSample
              label="Endpoint"
              value={
                <Text style={{ fontSize: 12, fontFamily: "monospace" }}>{system.endpoint}</Text>
              }
            />
            <InfoRowSample
              label="API Key"
              value={
                <Text style={{ fontSize: 12, fontFamily: "monospace" }}>
                  {system.apiKeyTail ? `•••• ${system.apiKeyTail}` : "Chưa thiết lập"}
                </Text>
              }
            />
            <InfoRowSample
              label="Đồng bộ cuối"
              value={<Text style={{ fontSize: 12 }}>{system.lanDongBoCuoi}</Text>}
            />
          </div>
        </div>

        <div>
          <Text strong style={{ fontSize: 13 }}>
            Chỉ số 24h
          </Text>
          <Row gutter={10} style={{ marginTop: 8 }}>
            <Col span={8}>
              <StatCard title="Độ trễ TB" value={`${system.doTreMs} ms`} />
            </Col>
            <Col span={8}>
              <StatCard
                title="Tỷ lệ thành công"
                value={rate === null ? "—" : `${rate}%`}
                color={rate !== null && rate < 100 ? "#cf1322" : undefined}
              />
            </Col>
            <Col span={8}>
              <StatCard title="Hàng đợi" value={system.hangDoi} color={system.hangDoi > 3 ? "#b06f00" : undefined} />
            </Col>
          </Row>
          <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 8 }}>
            Lỗi gần nhất: {errAt ? errAt : "Chưa ghi nhận lỗi"}
          </Text>
        </div>

        <div>
          <Text strong style={{ fontSize: 13 }}>
            Job gần nhất
          </Text>
          {jobs.length === 0 ? (
            <Empty
              description="Chưa có job nào ghi nhận cho hệ này."
              style={{ marginTop: 8 }}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              size="small"
              rowKey="id"
              columns={columns}
              dataSource={jobs}
              pagination={false}
              style={{ marginTop: 8 }}
            />
          )}
        </div>

        <div style={{ borderTop: "1px dashed #e2e2e5", paddingTop: 12 }}>
          <Text strong style={{ fontSize: 13 }}>
            Mapping dữ liệu
          </Text>
          {mappings.length === 0 ? (
            <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 6 }}>
              Chưa có mapping nào cho hệ này. Xem tab "Mapping dữ liệu".
            </Text>
          ) : (
            <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
              {mappings.map((m) => (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ fontSize: 12 }}>
                    {BUSINESS_OBJECT_LABEL[m.doiTuong]} · v{m.version}
                  </Text>
                  <Tag color={MAPPING_STATUS_META[m.trangThai].color}>
                    {MAPPING_STATUS_META[m.trangThai].label}
                  </Tag>
                </div>
              ))}
            </div>
          )}
          <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: 10 }}>
            Các quy trình/service task dùng hệ này chưa được liên kết — xem lộ
            trình nâng cấp tại
            <Text code style={{ fontSize: 11 }}>
              {" "}docs/research/integration-screen-upgrade-notes.md
            </Text>
            .
          </Text>
        </div>
      </Space>
    </Drawer>
  );
}

function SystemCard({
  s,
  onConnect,
  onDisconnect,
  onDetail,
}: {
  s: IntegrationSystem;
  onConnect: () => void;
  onDisconnect: () => void;
  onDetail: () => void;
}) {
  const m = INTEG_STATUS[s.trangThai];
  const visual = SYS_VISUAL[s.key] ?? SYS_VISUAL_FALLBACK;
  const connected = s.trangThai !== "down";
  const rate = integrationSuccessRate(s);
  const openIncidents = openIncidentCount(s.key);

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
        <MetricSample label="Độ trễ TB" value={`${s.doTreMs}ms`} />
        <MetricDivider />
        <MetricSample
          label="TL thành công"
          value={rate === null ? "—" : `${rate}%`}
          danger={rate !== null && rate < 100}
        />
        <MetricDivider />
        <MetricSample label="Hàng đợi" value={s.hangDoi} danger={s.hangDoi > 3} />
        <MetricDivider />
        <MetricSample label="Lỗi mở" value={openIncidents} danger={openIncidents > 0} />
      </div>

      {/* ── Đường kẻ chia ── */}
      <div style={{ borderTop: "1px solid #e2e2e5", margin: "14px 0 12px" }} />

      {/* ── Chân card: nút hành động ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button type="button" onClick={onDetail} style={btnOutlineStyle}>
          Xem chi tiết
        </button>
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
      </div>

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



import { useState } from "react";
import {
  Button,
  Dropdown,
  Empty,
  Space,
  Switch,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  DownOutlined,
  ThunderboltOutlined,
  AppstoreOutlined,
  WarningOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  FormOutlined,
  CheckCircleOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import type { AvailableAction, DebugAction } from "../data/actionAvailability";
import { ACTION_UI_GROUP_LABEL } from "../data/actionPresentation";
import type { ActionUiGroup } from "../data/actionPresentation";

const { Text } = Typography;

interface SimulatorPreviewProps {
  actions: AvailableAction[];
  /** (Đợt 3) Debug actions — bao gồm cả action bị ẩn. Nếu có, hiển thị toggle "Không hiển thị". */
  debugActions?: DebugAction[];
  /** Nếu true, hiển thị nút "?" để mở giải thích. */
  showExplain?: boolean;
  onExplain?: (action: AvailableAction) => void;
}

const TONE_TO_TYPE: Record<string, "primary" | "default" | "dashed" | "link"> =
  {
    primary: "primary",
    danger: "primary", // vẫn là primary nhưng danger color xử lý qua style
    warning: "default",
    default: "default",
  };

const TONE_TO_DANGER: Record<string, boolean> = {
  danger: true,
  primary: false,
  warning: false,
  default: false,
};

/**
 * Preview action buttons giống runtime thật của màn chi tiết hồ sơ.
 * Thay thế Tag render cũ trong InspectorTab.
 */
export default function SimulatorPreview({
  actions,
  debugActions,
  showExplain = false,
  onExplain,
}: SimulatorPreviewProps) {
  const [resultTab, setResultTab] = useState<"preview" | "payload">("preview");
  const [showHidden, setShowHidden] = useState(false);

  const hiddenActions = debugActions?.filter((a) => !a.visible) ?? [];

  const byGroup = (g: ActionUiGroup) => actions.filter((a) => a.uiGroup === g);

  const groups: {
    title: string;
    icon: React.ReactNode;
    group: ActionUiGroup;
    hint: string;
  }[] = [
    {
      title: ACTION_UI_GROUP_LABEL.PRIMARY,
      icon: <ThunderboltOutlined />,
      group: "PRIMARY",
      hint: "Hành động chính",
    },
    {
      title: ACTION_UI_GROUP_LABEL.MORE,
      icon: <AppstoreOutlined />,
      group: "MORE",
      hint: "Thao tác khác",
    },
    {
      title: ACTION_UI_GROUP_LABEL.EXCEPTION,
      icon: <WarningOutlined />,
      group: "EXCEPTION",
      hint: "Chi tiết",
    },
  ];

  const renderMetadata = (a: AvailableAction) => (
    <Space size={4} wrap style={{ marginTop: 2 }}>
      {a.requiresReason && (
        <Tag
          color="orange"
          style={{ fontSize: 10, lineHeight: "16px", padding: "0 4px" }}
        >
          Cần lý do
        </Tag>
      )}
      {a.requiresEvidence && (
        <Tag
          color="purple"
          style={{ fontSize: 10, lineHeight: "16px", padding: "0 4px" }}
        >
          Cần căn cứ
        </Tag>
      )}
      {a.requiresConfirm && (
        <Tag
          color="blue"
          style={{ fontSize: 10, lineHeight: "16px", padding: "0 4px" }}
        >
          Cần xác nhận
        </Tag>
      )}
      {a.formKey && (
        <Tag
          icon={<FormOutlined />}
          color="geekblue"
          style={{ fontSize: 10, lineHeight: "16px", padding: "0 4px" }}
        >
          {a.formKey}
        </Tag>
      )}
    </Space>
  );

  const renderButton = (a: AvailableAction) => {
    const isDanger = TONE_TO_DANGER[a.tone] ?? false;
    const btnType =
      a.tone === "danger" ? "primary" : (TONE_TO_TYPE[a.tone] ?? "default");

    const btn = (
      <Button
        key={a.actionCode}
        type={btnType}
        danger={isDanger}
        disabled={!a.enabled}
        icon={a.icon ? undefined : undefined}
        style={{ minWidth: 100 }}
      >
        {a.label}
      </Button>
    );

    const tooltip = a.disabledReason ?? a.tooltip;
    if (tooltip || !a.enabled) {
      return (
        <Tooltip key={a.actionCode} title={tooltip}>
          <span style={{ display: "inline-block" }}>{btn}</span>
        </Tooltip>
      );
    }
    return btn;
  };

  const payload = actions.map((a) => ({
    actionCode: a.actionCode,
    label: a.label,
    type: a.type,
    uiGroup: a.uiGroup,
    tone: a.tone,
    enabled: a.enabled,
    ...(a.requiresConfirm ? { requiresConfirm: true } : {}),
    ...(a.requiresReason ? { requiresReason: true } : {}),
    ...(a.requiresEvidence ? { requiresEvidence: true } : {}),
  }));

  const renderPreview = () => (
    <>
      {actions.length === 0 && (
        <Empty
          description="Không action nào hiển thị ở ngữ cảnh này"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
      {groups.map((g) => {
        const rows = byGroup(g.group);
        if (rows.length === 0) return null;

        // PRIMARY: hiển thị dạng button row
        if (g.group === "PRIMARY") {
          return (
            <div key={g.group} style={{ marginBottom: 16 }}>
              <Space style={{ marginBottom: 8 }}>
                {g.icon}
                <Text strong>{g.title}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {g.hint}
                </Text>
              </Space>
              <div style={{ marginTop: 4 }}>
                <Space wrap size={[8, 8]}>
                  {rows.map((a) => (
                    <div key={a.actionCode}>
                      {renderButton(a)}
                      {renderMetadata(a)}
                      {showExplain && (
                        <Button
                          type="link"
                          size="small"
                          icon={<QuestionCircleOutlined />}
                          onClick={() => onExplain?.(a)}
                          style={{ padding: 0, marginLeft: 4 }}
                        />
                      )}
                    </div>
                  ))}
                </Space>
              </div>
            </div>
          );
        }

        // MORE: gom vào dropdown
        if (g.group === "MORE") {
          return (
            <div key={g.group} style={{ marginBottom: 16 }}>
              <Space style={{ marginBottom: 8 }}>
                {g.icon}
                <Text strong>{g.title}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {g.hint}
                </Text>
              </Space>
              <div style={{ marginTop: 4 }}>
                <Dropdown
                  menu={{
                    items: rows.map((a) => ({
                      key: a.actionCode,
                      label: a.label,
                      disabled: !a.enabled,
                      icon: a.enabled ? <CheckCircleOutlined /> : undefined,
                    })),
                  }}
                >
                  <Button>
                    <Space>
                      Thao tác khác
                      <DownOutlined />
                    </Space>
                  </Button>
                </Dropdown>
              </div>
            </div>
          );
        }

        // EXCEPTION: vùng riêng với viền cảnh báo
        return (
          <div
            key={g.group}
            style={{
              marginBottom: 16,
              padding: "8px 12px",
              border: "1px dashed var(--vht-red)",
              borderRadius: 8,
              background: "var(--vht-surface-2)",
            }}
          >
            <Space style={{ marginBottom: 8 }}>
              {g.icon}
              <Text strong style={{ color: "var(--vht-red)" }}>
                {g.title}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {g.hint}
              </Text>
            </Space>
            <div style={{ marginTop: 4 }}>
              <Space wrap size={[8, 8]}>
                {rows.map((a) => (
                  <div key={a.actionCode}>
                    {renderButton(a)}
                    {renderMetadata(a)}
                    {showExplain && (
                      <Button
                        type="link"
                        size="small"
                        icon={<QuestionCircleOutlined />}
                        onClick={() => onExplain?.(a)}
                        style={{ padding: 0, marginLeft: 4 }}
                      />
                    )}
                  </div>
                ))}
              </Space>
            </div>
          </div>
        );
      })}

      {/* (Đợt 3) Debug: hiển thị action bị ẩn */}
      {hiddenActions.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Space style={{ marginBottom: 8 }}>
            <Switch
              size="small"
              checked={showHidden}
              onChange={setShowHidden}
            />
            <EyeInvisibleOutlined />
            <Text type="secondary">
              Không hiển thị ({hiddenActions.length} action)
            </Text>
          </Space>
          {showHidden && (
            <div
              style={{
                padding: "8px 12px",
                border: "1px dashed #d9d9d9",
                borderRadius: 8,
                background: "var(--vht-surface-2)",
                opacity: 0.7,
              }}
            >
              <Space wrap size={[8, 8]}>
                {hiddenActions.map((a) => (
                  <Tooltip
                    key={a.actionCode}
                    title={a.hideReasons.join("; ") || "Không rõ lý do"}
                  >
                    <Tag
                      color="default"
                      style={{ cursor: "help", opacity: 0.6 }}
                    >
                      {a.label}
                    </Tag>
                  </Tooltip>
                ))}
              </Space>
            </div>
          )}
        </div>
      )}
    </>
  );

  const renderPayload = () => (
    <pre
      style={{
        margin: 0,
        padding: 12,
        borderRadius: 8,
        fontSize: 12,
        lineHeight: 1.5,
        background: "var(--vht-surface-2)",
        overflowX: "auto",
        maxHeight: 400,
      }}
    >
      {JSON.stringify(payload, null, 2)}
    </pre>
  );

  return (
    <Tabs
      activeKey={resultTab}
      onChange={(k) => setResultTab(k as "preview" | "payload")}
      size="small"
      items={[
        {
          key: "preview",
          label: (
            <Space>
              <FileTextOutlined />
              Xem trước giao diện
            </Space>
          ),
          children: renderPreview(),
        },
        {
          key: "payload",
          label: (
            <Space>
              <AppstoreOutlined />
              Payload API
            </Space>
          ),
          children: renderPayload(),
        },
      ]}
    />
  );
}

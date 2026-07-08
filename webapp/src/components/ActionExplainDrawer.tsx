import { Descriptions, Drawer, Tag, Typography } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import type { DebugAction } from "../data/actionAvailability";

const { Text } = Typography;

interface ActionExplainDrawerProps {
  action: DebugAction | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Drawer giải thích quyết định hiển thị của một action trong Simulator.
 * Dùng cho Đợt 3 của Action Studio Simulator upgrade.
 */
export default function ActionExplainDrawer({
  action,
  open,
  onClose,
}: ActionExplainDrawerProps) {
  if (!action) return null;

  const statusIcon = action.visible
    ? action.enabled
      ? {
          icon: <CheckCircleOutlined />,
          color: "green",
          text: "Hiển thị & bấm được",
        }
      : {
          icon: <ExclamationCircleOutlined />,
          color: "orange",
          text: "Hiển thị nhưng bị khoá",
        }
    : { icon: <CloseCircleOutlined />, color: "red", text: "Không hiển thị" };

  return (
    <Drawer
      title={
        <span>
          Giải thích: <Text strong>{action.label}</Text>
        </span>
      }
      open={open}
      onClose={onClose}
      width={480}
      placement="right"
    >
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="Mã action">
          <Text code>{action.actionCode}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Loại">
          <Tag>{action.type}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Nhóm UI">
          <Tag>{action.uiGroup}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={statusIcon.color} icon={statusIcon.icon}>
            {statusIcon.text}
          </Tag>
        </Descriptions.Item>

        {action.matchedPolicyId && (
          <Descriptions.Item label="Luật khớp">
            <Text code>{action.matchedPolicyId}</Text>
          </Descriptions.Item>
        )}

        {action.conditionExpression && (
          <Descriptions.Item label="Điều kiện nghiệp vụ">
            <Text code style={{ fontSize: 12 }}>
              {action.conditionExpression}
            </Text>
          </Descriptions.Item>
        )}

        {action.formKey && (
          <Descriptions.Item label="Biểu mẫu">
            <Tag color="geekblue">{action.formKey}</Tag>
          </Descriptions.Item>
        )}

        {action.roleCheck && (
          <Descriptions.Item label="Vai trò">
            <div style={{ marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Yêu cầu:{" "}
              </Text>
              {action.roleCheck.required.length === 0
                ? "(bất kỳ)"
                : action.roleCheck.required.map((c) => (
                    <Tag key={c} style={{ marginBottom: 2 }}>
                      {c}
                    </Tag>
                  ))}
            </div>
            <div style={{ marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                User có:{" "}
              </Text>
              {action.roleCheck.held.length === 0
                ? "(không có)"
                : action.roleCheck.held.map((c) => (
                    <Tag key={c} color="blue" style={{ marginBottom: 2 }}>
                      {c}
                    </Tag>
                  ))}
            </div>
            <Tag
              color={action.roleCheck.match ? "green" : "red"}
              icon={
                action.roleCheck.match ? (
                  <CheckCircleOutlined />
                ) : (
                  <CloseCircleOutlined />
                )
              }
            >
              {action.roleCheck.match ? "Khớp" : "Không khớp"}
            </Tag>
          </Descriptions.Item>
        )}

        {action.permissionCheck && (
          <Descriptions.Item label="Quyền">
            <div style={{ marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Yêu cầu:{" "}
              </Text>
              {action.permissionCheck.required.length === 0
                ? "(không yêu cầu)"
                : action.permissionCheck.required.map((p) => (
                    <Tag key={p} style={{ marginBottom: 2 }}>
                      {p}
                    </Tag>
                  ))}
            </div>
            {action.permissionCheck.missing.length > 0 && (
              <div style={{ marginBottom: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Thiếu:{" "}
                </Text>
                {action.permissionCheck.missing.map((p) => (
                  <Tag key={p} color="red" style={{ marginBottom: 2 }}>
                    {p}
                  </Tag>
                ))}
              </div>
            )}
            <Tag
              color={action.permissionCheck.match ? "green" : "red"}
              icon={
                action.permissionCheck.match ? (
                  <CheckCircleOutlined />
                ) : (
                  <CloseCircleOutlined />
                )
              }
            >
              {action.permissionCheck.match ? "Đủ" : "Thiếu"}
            </Tag>
          </Descriptions.Item>
        )}

        {!action.visible && action.hideReasons.length > 0 && (
          <Descriptions.Item label="Lý do bị ẩn">
            {action.hideReasons.map((r, i) => (
              <div key={i}>
                <Text type="danger">{r}</Text>
              </div>
            ))}
          </Descriptions.Item>
        )}

        {action.visible && !action.enabled && action.disabledReason && (
          <Descriptions.Item label="Lý do bị khoá">
            <Text type="warning">{action.disabledReason}</Text>
          </Descriptions.Item>
        )}
      </Descriptions>

      <div style={{ marginTop: 16 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          <QuestionCircleOutlined /> Đây là kết quả mock từ getDebugActions().
          Khi backend có thật, kết quả sẽ đến từ{" "}
          <Text code>GET /dossiers/{"{id}"}/available-actions?debug=true</Text>.
        </Text>
      </div>
    </Drawer>
  );
}

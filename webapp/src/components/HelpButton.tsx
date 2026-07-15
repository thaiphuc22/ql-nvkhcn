import { Button, Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { openAppRoute } from "../utils/navigation";

export interface HelpButtonProps {
  /** Section key trên trang trợ giúp (vd: "hoso", "nhiemvu", "quytrinh"). */
  section?: string;
  /** Tooltip hiển thị khi hover. */
  tooltip?: string;
}

/**
 * Nút "?" — mở trang Trợ giúp đến đúng section tương ứng trong tab mới.
 * Dùng trong `extra` của PageHeader hoặc bất kỳ đâu cần hỗ trợ ngữ cảnh.
 */
export default function HelpButton({ section, tooltip }: HelpButtonProps) {
  const href = section ? `/tro-giup?section=${section}` : "/tro-giup";
  return (
    <Tooltip title={tooltip ?? "Hướng dẫn sử dụng"}>
      <Button
        type="text"
        shape="circle"
        icon={<QuestionCircleOutlined />}
        onClick={() => openAppRoute(href)}
        aria-label="Trợ giúp"
        style={{ color: "var(--vht-red, #bf0027)" }}
      />
    </Tooltip>
  );
}

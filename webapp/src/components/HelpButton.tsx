import { Button, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export interface HelpButtonProps {
  /** Section key trên trang trợ giúp (vd: "hoso", "nhiemvu", "quytrinh"). */
  section?: string;
  /** Tooltip hiển thị khi hover. */
  tooltip?: string;
}

/**
 * Nút "?" — mở trang Trợ giúp đến đúng section tương ứng.
 * Dùng trong `extra` của PageHeader hoặc bất kỳ đâu cần hỗ trợ ngữ cảnh.
 */
export default function HelpButton({ section, tooltip }: HelpButtonProps) {
  const navigate = useNavigate();
  const href = section ? `/tro-giup?section=${section}` : '/tro-giup';
  return (
    <Tooltip title={tooltip ?? 'Hướng dẫn sử dụng'}>
      <Button
        type="text"
        shape="circle"
        icon={<QuestionCircleOutlined />}
        onClick={() => navigate(href)}
        aria-label="Trợ giúp"
        style={{ color: 'var(--vht-red, #bf0027)' }}
      />
    </Tooltip>
  );
}

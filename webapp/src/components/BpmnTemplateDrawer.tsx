import { useMemo, useState } from 'react'
import { Button, Empty, Input, Tooltip, Typography } from 'antd'
import { CloseOutlined, SearchOutlined } from '@ant-design/icons'
import { KHCN_TEMPLATES, type KhcnTemplate } from '../data/elementTemplates'
import { TEMPLATE_ICON } from '../bpmn/khcnTemplatesModule'

const { Text } = Typography

interface Props {
  open: boolean
  onClose: () => void
  /** BA bấm/kéo một mẫu → BpmnEditor gọi create.start với event gốc. */
  onPick: (tmpl: KhcnTemplate, event: Event) => void
}

/** Thứ tự nhóm hiển thị cố định (theo tần suất dùng trong RD01–RD06). */
const GROUP_ORDER: KhcnTemplate['nhom'][] = [
  'Phê duyệt', 'Thẩm định', 'Soạn thảo', 'Hội đồng', 'Hẹn giờ', 'Tích hợp',
]

/**
 * Drawer "Mẫu nghiệp vụ KHCN" — thay cho 15 nút palette chung icon (Đợt 3,
 * bpmn-editor-ux-upgrade-plan.md): nhóm rõ, nhãn + mô tả đọc được ngay,
 * tìm kiếm theo tên/mô tả/vai trò. Dock trái, trượt ra/vào như panel thuộc tính.
 */
export default function BpmnTemplateDrawer({ open, onClose, onPick }: Props) {
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('vi')
    const match = (t: KhcnTemplate) =>
      !q ||
      `${t.ten} ${t.moTa} ${t.nhom} ${t.defaults.name} ${t.defaults.candidateGroups ?? ''} ${t.defaults.taskType ?? ''}`
        .toLocaleLowerCase('vi')
        .includes(q)
    return GROUP_ORDER.map((nhom) => ({
      nhom,
      items: KHCN_TEMPLATES.filter((t) => t.nhom === nhom && match(t)),
    })).filter((g) => g.items.length > 0)
  }, [query])

  return (
    <div
      className="khcn-tmpl-drawer"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 264,
        background: '#fff',
        borderRight: '1px solid var(--vht-border)',
        boxShadow: '2px 0 10px rgba(15,23,34,0.06)',
        display: 'flex',
        flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(-264px)',
        transition: 'transform 0.18s ease',
        zIndex: 24,
      }}
    >
      <div
        style={{
          height: 42,
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px 0 14px',
          borderBottom: '1px solid var(--vht-border)',
          background: 'var(--vht-surface-2)',
        }}
      >
        <Text strong>Mẫu nghiệp vụ KHCN</Text>
        <Button type="text" size="small" icon={<CloseOutlined />} onClick={onClose} />
      </div>

      <div style={{ padding: '10px 12px 6px' }}>
        <Input
          allowClear
          size="small"
          prefix={<SearchOutlined style={{ color: 'var(--vht-ink-3)' }} />}
          placeholder="Tìm mẫu (tên, mô tả, vai trò...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 8px 10px' }}>
        {groups.length === 0 && (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có mẫu khớp" style={{ marginTop: 24 }} />
        )}
        {groups.map((g) => (
          <div key={g.nhom}>
            <div
              style={{
                padding: '10px 6px 4px',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--vht-ink-2)',
                letterSpacing: 0.2,
              }}
            >
              {g.nhom}
            </div>
            {g.items.map((t) => (
              <Tooltip key={t.id} title="Bấm rồi di chuột lên canvas để đặt phần tử" mouseEnterDelay={0.6} placement="right">
                <div
                  className="khcn-tmpl-item"
                  // mousedown (không phải click) → create.start nhận đúng cử chỉ kéo-thả.
                  onMouseDown={(e) => onPick(t, e.nativeEvent)}
                >
                  <i className={`khcn-tmpl-icon ${TEMPLATE_ICON[t.bpmnType]}`} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>{t.ten}</div>
                    <div style={{ fontSize: 12, color: 'var(--vht-ink-3)', lineHeight: 1.35 }}>{t.moTa}</div>
                  </div>
                </div>
              </Tooltip>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

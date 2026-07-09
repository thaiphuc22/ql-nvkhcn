import { useMemo, useState } from 'react'
import { Select, Space, Table, Tag, Typography } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import { useRules } from '../store/RuleContext'
import {
  RULE_AUDIT_ACTION_LABEL,
  RULE_AUDIT_ACTION_COLOR,
  type RuleAuditAction,
  type RuleAuditEntry,
} from '../data/rules'

const { Text } = Typography

const ACTION_OPTIONS: { value: RuleAuditAction | ''; label: string }[] = [
  { value: '', label: 'Tất cả hành động' },
  ...(Object.keys(RULE_AUDIT_ACTION_LABEL) as RuleAuditAction[]).map((a) => ({
    value: a,
    label: RULE_AUDIT_ACTION_LABEL[a],
  })),
]

interface Props {
  ruleId: string
  /** Nếu có, tự động focus vào version này (từ cross-link). */
  highlightVersion?: number
}

export default function RuleAuditTable({ ruleId, highlightVersion }: Props) {
  const { getAudit } = useRules()
  const allEntries = getAudit(ruleId)
  const [filterAction, setFilterAction] = useState<RuleAuditAction | ''>('')

  const filtered = useMemo(() => {
    if (!filterAction) return allEntries
    return allEntries.filter((e) => e.action === filterAction)
  }, [allEntries, filterAction])

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <Select
          value={filterAction}
          onChange={(v) => setFilterAction(v)}
          options={ACTION_OPTIONS}
          style={{ width: 200 }}
          size="small"
        />
        <Text type="secondary">{filtered.length} mục</Text>
      </Space>

      <Table<RuleAuditEntry>
        dataSource={filtered}
        rowKey="id"
        size="small"
        pagination={filtered.length > 15 ? { pageSize: 15, showSizeChanger: false } : false}
        columns={[
          {
            title: 'Thời gian',
            dataIndex: 'timestamp',
            width: 150,
            render: (t: string) => (
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {t}
              </Text>
            ),
          },
          {
            title: 'Hành động',
            dataIndex: 'action',
            width: 160,
            render: (a: RuleAuditAction) => (
              <Tag color={RULE_AUDIT_ACTION_COLOR[a]}>{RULE_AUDIT_ACTION_LABEL[a]}</Tag>
            ),
          },
          {
            title: 'Phiên bản',
            dataIndex: 'version',
            width: 80,
            render: (v: number) => (
              <Tag
                color={v === highlightVersion ? 'blue' : 'default'}
                style={v === highlightVersion ? { fontWeight: 600 } : undefined}
              >
                v{v}
              </Tag>
            ),
          },
          {
            title: 'Người thực hiện',
            dataIndex: 'actor',
            width: 150,
          },
          {
            title: 'Chi tiết',
            dataIndex: 'detail',
            ellipsis: true,
          },
        ]}
      />
    </div>
  )
}

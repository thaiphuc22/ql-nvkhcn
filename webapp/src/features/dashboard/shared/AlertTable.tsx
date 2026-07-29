import { Button, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import EntityTable from '../../../components/ui/EntityTable'
import type { RiskAlert } from '../models/dashboard.models'
import { SeverityBadge, AlertStatusBadge } from './StatusBadge'
import { formatDate } from './formatters'

interface AlertTableProps {
  alerts: RiskAlert[]
  onViewMission?: (code: string) => void
  onExport?: () => void
}

export default function AlertTable({ alerts, onViewMission, onExport }: AlertTableProps) {
  const columns: ColumnsType<RiskAlert> = [
    { title: 'Mức độ', dataIndex: 'severity', width: 120, render: (v: RiskAlert['severity']) => <SeverityBadge severity={v} /> },
    { title: 'Mã NV', dataIndex: 'missionCode', width: 120 },
    { title: 'Tên nhiệm vụ', dataIndex: 'missionName', ellipsis: true },
    { title: 'Loại cảnh báo', dataIndex: 'category', width: 160 },
    { title: 'Nội dung', dataIndex: 'message', ellipsis: true },
    { title: 'Đơn vị', dataIndex: 'organizationName', width: 180, ellipsis: true },
    { title: 'Người phụ trách', dataIndex: 'ownerName', width: 140 },
    { title: 'Hạn xử lý', dataIndex: 'dueDate', width: 110, render: (v?: string) => v ? formatDate(v) : '—' },
    { title: 'Trạng thái', dataIndex: 'status', width: 120, render: (v: RiskAlert['status']) => <AlertStatusBadge status={v} /> },
    {
      title: 'Thao tác', key: 'actions', width: 200,
      render: (_, r) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => onViewMission?.(r.missionCode)}>Xem NV</Button>
          <Button type="link" size="small">Giao xử lý</Button>
          <Button type="link" size="small">Đã xử lý</Button>
        </Space>
      ),
    },
  ]

  return (
    <>
      {onExport && <div style={{ marginBottom: 8, textAlign: 'right' }}><Button size="small" onClick={onExport}>Xuất CSV</Button></div>}
      <EntityTable<RiskAlert> rowKey="id" columns={columns} dataSource={alerts} scroll={{ y: 'calc(100vh - 480px)' }} />
    </>
  )
}

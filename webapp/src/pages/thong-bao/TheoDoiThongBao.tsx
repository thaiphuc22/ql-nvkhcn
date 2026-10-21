/**
 * Theo dõi trạng thái gửi thông báo + gửi lại
 * Route: /thong-bao/theo-doi
 */
import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  Col,
  message,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import {
  BellOutlined,
  CloseCircleOutlined,
  MailOutlined,
  MessageOutlined,
  MobileOutlined,
  ReloadOutlined,
  SendOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader } from '../../components/ui'
import {
  cancelPendingLog,
  listSendLogs,
  resendLog,
  SU_KIEN_OPTIONS,
  subscribeThongBao,
  type KenhCode,
  type SendLog,
  type SendStatus,
} from '../../data/catalogMauThongBao'

const { Text } = Typography

const KENH_ICONS: Record<KenhCode, React.ReactNode> = {
  email: <MailOutlined style={{ color: '#1890ff' }} />,
  sms: <MessageOutlined style={{ color: '#52c41a' }} />,
  web: <BellOutlined style={{ color: '#fa8c16' }} />,
  app: <MobileOutlined style={{ color: '#722ed1' }} />,
}

const STATUS_META: Record<SendStatus, { label: string; color: string }> = {
  success: { label: 'Thành công', color: 'green' },
  failed: { label: 'Thất bại', color: 'red' },
  pending: { label: 'Đang chờ', color: 'orange' },
  retrying: { label: 'Đang gửi lại', color: 'blue' },
}

export default function TheoDoiThongBaoPage() {
  const [logs, setLogs] = useState(() => listSendLogs())
  const [filterKenh, setFilterKenh] = useState<string | undefined>()
  const [filterStatus, setFilterStatus] = useState<string | undefined>()

  useEffect(() => subscribeThongBao(() => setLogs(listSendLogs())), [])

  const successCount = logs.filter((l) => l.trangThai === 'success').length
  const failedCount = logs.filter((l) => l.trangThai === 'failed').length
  const pendingCount = logs.filter((l) => l.trangThai === 'pending').length

  const filtered = logs.filter((l) => {
    if (filterKenh && l.kenh !== filterKenh) return false
    if (filterStatus && l.trangThai !== filterStatus) return false
    return true
  })

  function handleResend(id: string) {
    const next = resendLog(id)
    if (!next) return
    if (next.trangThai === 'success') message.success('Gửi lại thành công')
    else message.error(next.loi || 'Gửi lại thất bại')
  }

  const columns: ColumnsType<SendLog> = [
    {
      title: 'Thời gian',
      dataIndex: 'thoiGian',
      width: 150,
      render: (v) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Người nhận',
      dataIndex: 'nguoiNhan',
      width: 180,
      render: (v, r) => (
        <Space direction="vertical" size={0}>
          <Text>{v}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.diaChi}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Kênh',
      dataIndex: 'kenh',
      width: 90,
      align: 'center',
      render: (v: KenhCode) => (
        <Space size={4}>
          {KENH_ICONS[v]}
          <Tag>{v.toUpperCase()}</Tag>
        </Space>
      ),
    },
    {
      title: 'Mẫu',
      key: 'mau',
      width: 200,
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text code>{r.mauMa}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.mauTen}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Sự kiện',
      dataIndex: 'suKien',
      width: 160,
      render: (v) =>
        v ? SU_KIEN_OPTIONS.find((s) => s.value === v)?.label || v : '—',
    },
    {
      title: 'Hồ sơ',
      dataIndex: 'maHoSo',
      width: 120,
      render: (v) => (v ? <Text code>{v}</Text> : '—'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      width: 110,
      align: 'center',
      render: (v: SendStatus) => {
        const m = STATUS_META[v]
        return <Tag color={m.color}>{m.label}</Tag>
      },
    },
    {
      title: 'Lần gửi',
      dataIndex: 'soLanGui',
      width: 80,
      align: 'center',
    },
    {
      title: 'Lỗi',
      dataIndex: 'loi',
      width: 220,
      render: (v) =>
        v ? (
          <Text type="danger" style={{ fontSize: 12 }}>
            {v}
          </Text>
        ) : (
          '—'
        ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, r) => (
        <Space>
          {(r.trangThai === 'failed' || r.trangThai === 'success') && (
            <Tooltip title="Gửi lại">
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => handleResend(r.id)}
              />
            </Tooltip>
          )}
          {r.trangThai === 'pending' && (
            <Tooltip title="Hủy">
              <Button
                size="small"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  cancelPendingLog(r.id)
                  message.info('Đã hủy gửi')
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        icon={<SendOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Theo dõi gửi thông báo"
        code="Trạng thái gửi và gửi lại khi thất bại"
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => setLogs(listSendLogs())}>
            Làm mới
          </Button>
        }
      />

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="Tổng gửi" value={logs.length} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="Thành công" value={successCount} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="Đang chờ" value={pendingCount} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="Thất bại" value={failedCount} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      <Card size="small">
        <Space style={{ marginBottom: 12 }} wrap>
          <Select
            placeholder="Kênh"
            allowClear
            style={{ width: 140 }}
            value={filterKenh}
            onChange={setFilterKenh}
            options={[
              { value: 'email', label: 'Email' },
              { value: 'sms', label: 'SMS' },
              { value: 'web', label: 'Web' },
              { value: 'app', label: 'App' },
            ]}
          />
          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: 140 }}
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: 'success', label: 'Thành công' },
              { value: 'failed', label: 'Thất bại' },
              { value: 'pending', label: 'Đang chờ' },
            ]}
          />
          <Text type="secondary">{filtered.length} bản ghi</Text>
        </Space>

        <Table
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: [10, 20, 50] }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  )
}

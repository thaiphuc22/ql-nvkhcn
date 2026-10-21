/**
 * Mẫu thông báo — danh sách
 * Route: /thong-bao/mau
 * Tạo mới / Chỉnh sửa → màn hình riêng; Xóa → Modal popup
 */
import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  Col,
  Input,
  Modal,
  message,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import {
  BellOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  MailOutlined,
  MessageOutlined,
  MobileOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import { PageHeader, StatCard } from '../../components/ui'
import {
  deleteMauThongBao,
  listMauThongBao,
  LOAI_OPTIONS,
  SU_KIEN_OPTIONS,
  subscribeThongBao,
  TRANG_THAI_OPTIONS,
  upsertMauThongBao,
  type MauThongBao,
  type MauThongBaoLoai,
} from '../../data/catalogMauThongBao'

const { Text } = Typography

const LOAI_ICONS: Record<MauThongBaoLoai, React.ReactNode> = {
  email: <MailOutlined style={{ color: '#1890ff' }} />,
  sms: <MessageOutlined style={{ color: '#52c41a' }} />,
  web: <BellOutlined style={{ color: '#fa8c16' }} />,
  app: <MobileOutlined style={{ color: '#722ed1' }} />,
}

const LOAI_COLORS: Record<MauThongBaoLoai, string> = {
  email: 'blue',
  sms: 'green',
  web: 'orange',
  app: 'purple',
}

export default function MauThongBaoList() {
  const navigate = useNavigate()
  const [data, setData] = useState<MauThongBao[]>(() => listMauThongBao())
  const [searchText, setSearchText] = useState('')
  const [filterLoai, setFilterLoai] = useState<string | undefined>()
  const [filterStatus, setFilterStatus] = useState<string | undefined>()

  useEffect(() => subscribeThongBao(() => setData(listMauThongBao())), [])

  const total = data.length
  const activeCount = data.filter((u) => u.trangThai === 'active').length
  const inactiveCount = data.filter((u) => u.trangThai === 'inactive').length
  const byLoai = (loai: MauThongBaoLoai) => data.filter((u) => u.loai === loai).length

  const filtered = data.filter((u) => {
    if (filterLoai && u.loai !== filterLoai) return false
    if (filterStatus && u.trangThai !== filterStatus) return false
    if (searchText) {
      const s = searchText.toLowerCase()
      if (!u.ma.toLowerCase().includes(s) && !u.ten.toLowerCase().includes(s)) return false
    }
    return true
  })

  function confirmDelete(record: MauThongBao) {
    Modal.confirm({
      title: 'Xóa mẫu thông báo?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            Bạn sắp xóa mẫu <Text strong>{record.ten}</Text> (<Text code>{record.ma}</Text>).
          </p>
          <p style={{ marginBottom: 0, color: '#8c8c8c' }}>
            Trigger gắn với mẫu này cũng sẽ bị gỡ. Hành động không thể hoàn tác.
          </p>
        </div>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      centered: true,
      onOk: () => {
        deleteMauThongBao(record.id)
        message.success('Đã xóa mẫu thông báo')
      },
    })
  }

  function handleDuplicate(record: MauThongBao) {
    const newId = 'TB' + Date.now().toString(36).toUpperCase()
    upsertMauThongBao({
      ...record,
      id: newId,
      ma: record.ma + '-COPY',
      ten: record.ten + ' (Sao chép)',
      nguoiTao: 'admin',
      ngayTao: new Date().toISOString().slice(0, 10),
      ngayCapNhat: undefined,
    })
    message.success('Đã sao chép mẫu: ' + record.ten)
    navigate(`/thong-bao/mau/${newId}/sua`)
  }

  const columns: ColumnsType<MauThongBao> = [
    {
      title: 'STT',
      key: 'stt',
      width: 56,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Mã mẫu',
      dataIndex: 'ma',
      key: 'ma',
      width: 110,
      render: (v) => <Text code>{v}</Text>,
    },
    {
      title: 'Tên mẫu thông báo',
      dataIndex: 'ten',
      key: 'ten',
      render: (v, r) => (
        <Space direction="vertical" size={0}>
          <Text strong>{v}</Text>
          {r.moTa && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {r.moTa}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Kênh',
      dataIndex: 'loai',
      key: 'loai',
      width: 110,
      align: 'center',
      render: (v: MauThongBaoLoai) => (
        <Space size={4}>
          {LOAI_ICONS[v]}
          <Tag color={LOAI_COLORS[v]}>{v.toUpperCase()}</Tag>
        </Space>
      ),
    },
    {
      title: 'Sự kiện gắn',
      key: 'suKien',
      width: 200,
      render: (_, r) => {
        const active = r.bienBanSuKien.filter((b) => b.kichHoat)
        if (!active.length) return <Text type="secondary">—</Text>
        return (
          <Space size={4} wrap>
            {active.map((b) => (
              <Tag key={b.suKien} color="blue" style={{ fontSize: 11 }}>
                {SU_KIEN_OPTIONS.find((s) => s.value === b.suKien)?.label || b.suKien}
              </Tag>
            ))}
          </Space>
        )
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 120,
      align: 'center',
      render: (v) => (
        <Tag color={v === 'active' ? 'green' : 'default'}>
          {v === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'ngayTao',
      key: 'ngayTao',
      width: 110,
      align: 'center',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/thong-bao/mau/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/thong-bao/mau/${record.id}/sua`)}
            />
          </Tooltip>
          <Tooltip title="Sao chép">
            <Button size="small" icon={<CopyOutlined />} onClick={() => handleDuplicate(record)} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => confirmDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        icon={<BellOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Mẫu thông báo"
        code="Quản lý mẫu Email / SMS / Web / App cho sự kiện nghiệp vụ quy trình"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/thong-bao/mau/moi')}
          >
            Tạo mới mẫu thông báo
          </Button>
        }
      />

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6} md={4}>
          <StatCard size="small" title="Tổng mẫu" value={total} color="#1890ff" />
        </Col>
        <Col xs={12} sm={6} md={4}>
          <StatCard size="small" title="Hoạt động" value={activeCount} color="#52c41a" />
        </Col>
        <Col xs={12} sm={6} md={4}>
          <StatCard size="small" title="Tắt" value={inactiveCount} color="#8c8c8c" />
        </Col>
        <Col xs={12} sm={6} md={3}>
          <StatCard size="small" title="Email" value={byLoai('email')} color="#1890ff" />
        </Col>
        <Col xs={12} sm={6} md={3}>
          <StatCard size="small" title="SMS" value={byLoai('sms')} color="#52c41a" />
        </Col>
        <Col xs={12} sm={6} md={3}>
          <StatCard size="small" title="Web" value={byLoai('web')} color="#fa8c16" />
        </Col>
        <Col xs={12} sm={6} md={3}>
          <StatCard size="small" title="App" value={byLoai('app')} color="#722ed1" />
        </Col>
      </Row>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="Tìm mã, tên mẫu..."
              allowClear
              prefix={<SearchOutlined style={{ color: '#8593a3' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Kênh"
              allowClear
              style={{ width: '100%' }}
              value={filterLoai}
              onChange={setFilterLoai}
              options={LOAI_OPTIONS}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Trạng thái"
              allowClear
              style={{ width: '100%' }}
              value={filterStatus}
              onChange={setFilterStatus}
              options={TRANG_THAI_OPTIONS}
            />
          </Col>
          <Col xs={24} md={8}>
            <Text type="secondary">
              Kết quả: <strong>{filtered.length}</strong> mẫu
            </Text>
          </Col>
        </Row>
      </Card>

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          size="small"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            showTotal: (t) => `Tổng ${t} dòng`,
          }}
          scroll={{ x: 'max-content', y: 'calc(100vh - 420px)' }}
        />
      </Card>
    </div>
  )
}

/**
 * Bao cao dinh ky/dot xuat - Danh sach (Report List)
 * Route: /phan-he/PH2/bao-cao
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Card,
  Col,
  Input,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader, StatCard } from '../../components/ui'
import {
  seedBaoCao,
  type BaoCao,
  LOAI_OPTIONS,
  TRANG_THAI_OPTIONS,
  TRANG_THAI_COLORS,
  type BaoCaoTrangThai,
} from '../../data/catalogBaoCao'

const { Text } = Typography

export default function BaoCaoList() {
  const navigate = useNavigate()
  const [data] = useState<BaoCao[]>(seedBaoCao)
  const [searchText, setSearchText] = useState('')
  const [filterLoai, setFilterLoai] = useState<string | undefined>()
  const [filterStatus, setFilterStatus] = useState<string | undefined>()

  const total = data.length
  const soanCount = data.filter((u) => u.trangThai === 'soan').length
  const choDuyetCount = data.filter((u) => u.trangThai === 'choDuyet').length
  const daDuyetCount = data.filter((u) => u.trangThai === 'daDuyet').length

  const filtered = data.filter((u) => {
    if (filterLoai && u.loai !== filterLoai) return false
    if (filterStatus && u.trangThai !== filterStatus) return false
    if (searchText) {
      const s = searchText.toLowerCase()
      if (!u.ma.toLowerCase().includes(s) && !u.tieuDe.toLowerCase().includes(s)) return false
    }
    return true
  })

  const getStatusTag = (status: BaoCaoTrangThai) => {
    const icons: Record<BaoCaoTrangThai, React.ReactNode> = {
      soan: <ClockCircleOutlined />,
      choDuyet: <ClockCircleOutlined />,
      daDuyet: <CheckCircleOutlined />,
      tuChoi: <CloseCircleOutlined />,
      huy: <CloseCircleOutlined />,
    }
    const labels: Record<BaoCaoTrangThai, string> = {
      soan: 'Dang soan',
      choDuyet: 'Cho duyet',
      daDuyet: 'Da duyet',
      tuChoi: 'Tu choi',
      huy: 'Huy',
    }
    return (
      <Tag icon={icons[status]} color={TRANG_THAI_COLORS[status]}>
        {labels[status]}
      </Tag>
    )
  }

  const columns: ColumnsType<BaoCao> = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Ma bao cao',
      dataIndex: 'ma',
      key: 'ma',
      width: 140,
      render: (v) => <Text code>{v}</Text>,
    },
    {
      title: 'Tieu de',
      dataIndex: 'tieuDe',
      key: 'tieuDe',
      render: (v, r) => (
        <Space direction="vertical" size={0}>
          <Text strong>{v}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.loai === 'dinhKy' ? 'Dinh ky' : 'Dot xuat'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Trang thai',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 130,
      align: 'center',
      render: (v: BaoCaoTrangThai) => getStatusTag(v),
    },
    {
      title: 'Nguoi tao',
      dataIndex: 'nguoiTao',
      key: 'nguoiTao',
      width: 120,
      render: (v) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Ngay tao',
      dataIndex: 'ngayTao',
      key: 'ngayTao',
      width: 110,
      align: 'center',
      render: (v) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'File',
      key: 'file',
      width: 80,
      align: 'center',
      render: (_, r) =>
        r.fileDinhKem && r.fileDinhKem.length > 0 ? (
          <Tag color="blue">{r.fileDinhKem.length} file</Tag>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: 'Thao tac',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiet">
            <Button
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => navigate(`/phan-he/PH2/bao-cao/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Chinh sua">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/phan-he/PH2/bao-cao/${record.id}/chinh-sua`)}
              disabled={record.trangThai === 'daDuyet' || record.trangThai === 'huy'}
            />
          </Tooltip>
          <Popconfirm
            title="Xoa bao cao?"
            description="Han dong nay khong the hoan tac."
            okText="Xoa"
            okButtonProps={{ danger: true }}
            cancelText="Huy"
            onConfirm={() => {
              message.success('Da xoa bao cao')
            }}
          >
            <Tooltip title="Xoa">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                disabled={record.trangThai === 'daDuyet'}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        icon={<FileTextOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Bao cao dinh ky / dot xuat"
        code="Quan ly cac loai bao cao dinh ky va bao cao dot xuat"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/phan-he/PH2/bao-cao/tao-moi')}
          >
            Tao bao cao moi
          </Button>
        }
      />

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <StatCard size="small" title="Tong so bao cao" value={total} color="#1890ff" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard size="small" title="Dang soan" value={soanCount} color="#8c8c8c" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard size="small" title="Cho duyet" value={choDuyetCount} color="#faad14" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard size="small" title="Da duyet" value={daDuyetCount} color="#52c41a" />
        </Col>
      </Row>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="Tim ma, tieu de bao cao..."
              allowClear
              prefix={<SearchOutlined style={{ color: '#8593a3' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={(v) => setSearchText(v)}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Loai bao cao"
              allowClear
              style={{ width: '100%' }}
              value={filterLoai}
              onChange={setFilterLoai}
              options={LOAI_OPTIONS}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Trang thai"
              allowClear
              style={{ width: '100%' }}
              value={filterStatus}
              onChange={setFilterStatus}
              options={TRANG_THAI_OPTIONS}
            />
          </Col>
          <Col xs={24} sm={6} md={8}>
            <Text type="secondary">
              Ket qua: <strong>{filtered.length}</strong> bao cao
            </Text>
          </Col>
        </Row>
      </Card>

      <Card bodyStyle={{ padding: 0 }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          size="small"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showTotal: (total) => 'Tong ' + total + ' dong',
          }}
          scroll={{ x: 'max-content', y: 'calc(100vh - 420px)' }}
        />
      </Card>
    </div>
  )
}
/**
 * Bao cao - Lich su (Report History)
 * Route: /phan-he/PH2/bao-cao/:id/lich-su
 */
import { useParams, useNavigate } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  Col,
  Row,
  Space,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { PageHeader } from '../../components/ui'
import { seedBaoCao, type BaoCaoTrangThai } from '../../data/catalogBaoCao'

const { Text } = Typography

const TRANG_THAI_COLORS: Record<BaoCaoTrangThai, string> = {
  soan: 'default',
  choDuyet: 'orange',
  daDuyet: 'green',
  tuChoi: 'red',
  huy: 'default',
}

const TRANG_THAI_LABELS: Record<BaoCaoTrangThai, string> = {
  soan: 'Dang soan',
  choDuyet: 'Cho duyet',
  daDuyet: 'Da duyet',
  tuChoi: 'Tu choi',
  huy: 'Huy',
}

interface HistoryItem {
  key: string
  thoiGian: string
  hanhDong: string
  nguoiThucHien: string
  trangThai?: BaoCaoTrangThai
  chiTiet?: string
}

export default function BaoCaoHistory() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const record = seedBaoCao.find((b) => b.id === id)

  if (!record) {
    return (
      <div style={{ padding: 24 }}>
        <Alert type="error" message="Khong tim thay bao cao" />
        <Button style={{ marginTop: 16 }} onClick={() => navigate('/phan-he/PH2/bao-cao')}>
          Quay lai danh sach
        </Button>
      </div>
    )
  }

  const historyData: HistoryItem[] = record.lichSu
    ? record.lichSu.map((item, idx) => ({
        key: `${idx}`,
        thoiGian: item.ngay,
        hanhDong: item.hanhDong,
        nguoiThucHien: item.nguoiThucHien,
        chiTiet: item.chiTiet,
      }))
    : []

  const getActionTag = (action: string) => {
    switch (action.toLowerCase()) {
      case 'tao moi':
        return <Tag color="blue">Tao moi</Tag>
      case 'trinh duyet':
        return <Tag color="orange">Trinh duyet</Tag>
      case 'phe duyet':
        return <Tag color="green">Phe duyet</Tag>
      case 'tu choi':
        return <Tag color="red">Tu choi</Tag>
      case 'huy':
        return <Tag color="default">Huy</Tag>
      default:
        return <Tag>{action}</Tag>
    }
  }

  const columns: ColumnsType<HistoryItem> = [
    {
      title: 'Thoi gian',
      dataIndex: 'thoiGian',
      key: 'thoiGian',
      width: 130,
      render: (v) => <Text>{v}</Text>,
    },
    {
      title: 'Hanh dong',
      dataIndex: 'hanhDong',
      key: 'hanhDong',
      width: 150,
      render: (v) => getActionTag(v),
    },
    {
      title: 'Nguoi thuc hien',
      dataIndex: 'nguoiThucHien',
      key: 'nguoiThucHien',
      width: 150,
      render: (v) => <Text>{v}</Text>,
    },
    {
      title: 'Chi tiet',
      dataIndex: 'chiTiet',
      key: 'chiTiet',
      render: (v) => (v ? <Text type="secondary">{v}</Text> : <Text type="secondary">-</Text>),
    },
  ]

  return (
    <div>
      <PageHeader
        icon={<FileTextOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Lich su bao cao"
        code={`Ma: ${record.ma} - ${record.tieuDe}`}
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/phan-he/PH2/bao-cao/' + id)}>
            Quay lai chi tiet
          </Button>
        }
        onBack={() => navigate('/phan-he/PH2/bao-cao/' + id)}
      />

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title="Bang lich su thay doi" style={{ marginBottom: 16 }}>
            <Table
              rowKey="key"
              columns={columns}
              dataSource={historyData}
              size="small"
              pagination={false}
            />
          </Card>

          <Card title="Duong day thay doi">
            <Timeline
              items={record.lichSu?.map((item, idx) => ({
                color: idx === 0 ? 'blue' : 'gray',
                dot: idx === 0 ? <ClockCircleOutlined /> : undefined,
                children: (
                  <Space direction="vertical" size={0}>
                    <Text strong>{item.hanhDong}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.nguoiThucHien}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.ngay}</Text>
                    {item.chiTiet && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.chiTiet}
                      </Text>
                    )}
                  </Space>
                ),
              }))}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Thong tin bao cao" style={{ marginBottom: 16 }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">Ma bao cao:</Text>
                <br />
                <Text code>{record.ma}</Text>
              </div>
              <div>
                <Text type="secondary">Tieu de:</Text>
                <br />
                <Text strong>{record.tieuDe}</Text>
              </div>
              <div>
                <Text type="secondary">Loai:</Text>
                <br />
                <Tag color={record.loai === 'dinhKy' ? 'blue' : 'orange'}>
                  {record.loai === 'dinhKy' ? 'Dinh ky' : 'Dot xuat'}
                </Tag>
              </div>
              <div>
                <Text type="secondary">Trang thai hien tai:</Text>
                <br />
                <Tag color={TRANG_THAI_COLORS[record.trangThai]}>
                  {TRANG_THAI_LABELS[record.trangThai]}
                </Tag>
              </div>
              <div>
                <Text type="secondary">Nguoi tao:</Text>
                <br />
                <Text>{record.nguoiTao}</Text>
              </div>
              <div>
                <Text type="secondary">Ngay tao:</Text>
                <br />
                <Text>{record.ngayTao}</Text>
              </div>
            </Space>
          </Card>

          <Card title="Thong ke">
            <Space direction="vertical" size="small">
              <Text>Tong so lan thay doi: <strong>{historyData.length}</strong></Text>
              <Text>Trang thai: <strong>{TRANG_THAI_LABELS[record.trangThai]}</strong></Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
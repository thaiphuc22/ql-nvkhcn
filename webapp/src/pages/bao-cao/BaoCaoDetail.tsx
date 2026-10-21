/**
 * Bao cao - Chi tiet (Report Detail)
 * Route: /phan-he/PH2/bao-cao/:id
 */
import { useParams, useNavigate } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  message,
  Row,
  Space,
  Steps,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  FileOutlined,
  SendOutlined,
} from '@ant-design/icons'
import { PageHeader } from '../../components/ui'
import {
  seedBaoCao,
  TRANG_THAI_COLORS,
  type BaoCaoTrangThai,
} from '../../data/catalogBaoCao'

const { Text } = Typography

const TRANG_THAI_LABELS: Record<BaoCaoTrangThai, string> = {
  soan: 'Dang soan',
  choDuyet: 'Cho duyet',
  daDuyet: 'Da duyet',
  tuChoi: 'Tu choi',
  huy: 'Huy',
}

const getStatusIcon = (status: BaoCaoTrangThai) => {
  switch (status) {
    case 'soan':
      return <ClockCircleOutlined />
    case 'choDuyet':
      return <ClockCircleOutlined />
    case 'daDuyet':
      return <CheckCircleOutlined />
    case 'tuChoi':
    case 'huy':
      return <CloseCircleOutlined />
  }
}

export default function BaoCaoDetail() {
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

  const handleTrinhDuyet = () => {
    message.success('Da trinh duyet bao cao')
    setTimeout(() => navigate('/phan-he/PH2/bao-cao'), 500)
  }

  const getCurrentStep = () => {
    switch (record.trangThai) {
      case 'soan':
        return 0
      case 'choDuyet':
        return 1
      case 'daDuyet':
        return 2
      case 'tuChoi':
      case 'huy':
        return -1
      default:
        return 0
    }
  }

  return (
    <div>
      <PageHeader
        icon={<FileOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title={record.tieuDe}
        code={`Ma: ${record.ma}`}
        extra={
          <Space>
            {record.trangThai === 'soan' && (
              <>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/phan-he/PH2/bao-cao/${record.id}/chinh-sua`)}
                >
                  Chinh sua
                </Button>
                <Button type="primary" icon={<SendOutlined />} onClick={handleTrinhDuyet}>
                  Trinh duyet
                </Button>
              </>
            )}
            {record.trangThai === 'choDuyet' && (
              <Button type="primary" icon={<CheckCircleOutlined />}>
                Phe duyet
              </Button>
            )}
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/phan-he/PH2/bao-cao')}>
              Quay lai
            </Button>
          </Space>
        }
        onBack={() => navigate('/phan-he/PH2/bao-cao')}
      />

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title="Noi dung bao cao" style={{ marginBottom: 16 }}>
            <div
              style={{
                background: '#f5f5f5',
                padding: 16,
                borderRadius: 8,
                whiteSpace: 'pre-wrap',
                fontSize: 14,
                lineHeight: 1.8,
              }}
            >
              {record.noiDung}
            </div>

            {record.fileDinhKem && record.fileDinhKem.length > 0 && (
              <>
                <Divider orientation="left">File dinh kem</Divider>
                <Space direction="vertical" size="small">
                  {record.fileDinhKem.map((file, idx) => (
                    <Button key={idx} type="link" icon={<FileOutlined />}>
                      {file}
                    </Button>
                  ))}
                </Space>
              </>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Trang thai" style={{ marginBottom: 16 }}>
            <Tag
              icon={getStatusIcon(record.trangThai)}
              color={TRANG_THAI_COLORS[record.trangThai]}
              style={{ fontSize: 14, padding: '4px 12px' }}
            >
              {TRANG_THAI_LABELS[record.trangThai]}
            </Tag>

            <Divider />

            <Descriptions column={1} size="small">
              <Descriptions.Item label="Loai">
                {record.loai === 'dinhKy' ? 'Dinh ky' : 'Dot xuat'}
              </Descriptions.Item>
              <Descriptions.Item label="Nguoi tao">{record.nguoiTao}</Descriptions.Item>
              <Descriptions.Item label="Ngay tao">{record.ngayTao}</Descriptions.Item>
              {record.ngayCapNhat && (
                <Descriptions.Item label="Ngay cap nhat">
                  {record.ngayCapNhat}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            <Steps
              size="small"
              current={getCurrentStep()}
              direction="vertical"
              items={[
                {
                  title: 'Soan thao',
                  description: record.ngayTao,
                  status: record.trangThai !== 'soan' ? 'finish' : 'process',
                },
                {
                  title: 'Trinh duyet',
                  description: 'Cho duyet',
                  status:
                    record.trangThai === 'choDuyet'
                      ? 'process'
                      : record.trangThai === 'soan'
                        ? 'wait'
                        : 'finish',
                },
                {
                  title: 'Phe duyet',
                  description: 'Hoan thanh',
                  status:
                    record.trangThai === 'daDuyet'
                      ? 'finish'
                      : record.trangThai === 'tuChoi' || record.trangThai === 'huy'
                        ? 'error'
                        : 'wait',
                },
              ]}
            />
          </Card>

          <Card title="Lich su thay doi">
            {record.lichSu && record.lichSu.length > 0 ? (
              <Timeline
                items={record.lichSu.map((item, idx) => ({
                  color: idx === 0 ? 'blue' : 'gray',
                  children: (
                    <Space direction="vertical" size={0}>
                      <Text strong>{item.hanhDong}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.nguoiThucHien} - {item.ngay}
                      </Text>
                      {item.chiTiet && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.chiTiet}
                        </Text>
                      )}
                    </Space>
                  ),
                }))}
              />
            ) : (
              <Text type="secondary">Chua co lich su thay doi</Text>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
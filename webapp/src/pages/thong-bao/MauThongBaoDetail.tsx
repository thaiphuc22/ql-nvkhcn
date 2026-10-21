/**
 * Mẫu thông báo — xem chi tiết (chỉ đọc)
 * Route: /thong-bao/mau/:id
 * Chỉnh sửa → /thong-bao/mau/:id/sua | Xóa → Modal popup
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Modal,
  message,
  Row,
  Space,
  Tag,
  Typography,
} from 'antd'
import {
  ArrowLeftOutlined,
  BellOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  MailOutlined,
  MessageOutlined,
  MobileOutlined,
} from '@ant-design/icons'
import { PageHeader } from '../../components/ui'
import {
  deleteMauThongBao,
  getMauThongBao,
  SU_KIEN_OPTIONS,
  subscribeThongBao,
  type MauThongBao,
  type MauThongBaoLoai,
} from '../../data/catalogMauThongBao'

const { Text, Paragraph } = Typography

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

export default function MauThongBaoDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [record, setRecord] = useState<MauThongBao | undefined>(() =>
    id ? getMauThongBao(id) : undefined,
  )

  useEffect(() => {
    return subscribeThongBao(() => {
      if (id) setRecord(getMauThongBao(id))
    })
  }, [id])

  if (!record) {
    return (
      <div>
        <Alert type="error" showIcon message="Không tìm thấy mẫu thông báo" />
        <Button style={{ marginTop: 16 }} onClick={() => navigate('/thong-bao/mau')}>
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  function confirmDelete() {
    Modal.confirm({
      title: 'Xóa mẫu thông báo?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            Bạn sắp xóa mẫu <Text strong>{record!.ten}</Text> (<Text code>{record!.ma}</Text>).
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
        deleteMauThongBao(record!.id)
        message.success('Đã xóa mẫu')
        navigate('/thong-bao/mau')
      },
    })
  }

  return (
    <div>
      <PageHeader
        icon={LOAI_ICONS[record.loai]}
        title={record.ten}
        code={record.ma}
        breadcrumb={[
          { label: 'Mẫu thông báo', to: '/thong-bao/mau' },
          { label: record.ma },
        ]}
        onBack={() => navigate('/thong-bao/mau')}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/thong-bao/mau/${record.id}/sua`)}
            >
              Chỉnh sửa
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={confirmDelete}>
              Xóa
            </Button>
          </Space>
        }
      />

      <Row gutter={16}>
        <Col xs={24} lg={10}>
          <Card size="small" title="Thông tin mẫu" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Mã">
                <Text code>{record.ma}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Kênh">
                <Space>
                  {LOAI_ICONS[record.loai]}
                  <Tag color={LOAI_COLORS[record.loai]}>{record.loai.toUpperCase()}</Tag>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={record.trangThai === 'active' ? 'green' : 'default'}>
                  {record.trangThai === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">{record.moTa || '—'}</Descriptions.Item>
              <Descriptions.Item label="Người tạo">{record.nguoiTao}</Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">{record.ngayTao}</Descriptions.Item>
              <Descriptions.Item label="Cập nhật">{record.ngayCapNhat || '—'}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card size="small" title="Sự kiện gắn với mẫu">
            {record.bienBanSuKien.length === 0 ? (
              <Text type="secondary">Chưa gắn sự kiện. Cấu hình tại menu Trigger.</Text>
            ) : (
              <Space direction="vertical" style={{ width: '100%' }}>
                {record.bienBanSuKien.map((b) => (
                  <Space key={b.suKien} style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text>
                      {SU_KIEN_OPTIONS.find((s) => s.value === b.suKien)?.label || b.suKien}
                    </Text>
                    <Tag color={b.kichHoat ? 'green' : 'default'}>
                      {b.kichHoat ? 'Bật' : 'Tắt'}
                    </Tag>
                  </Space>
                ))}
              </Space>
            )}
            <Button
              type="link"
              style={{ paddingLeft: 0, marginTop: 8 }}
              onClick={() => navigate('/thong-bao/trigger')}
            >
              Quản lý Trigger →
            </Button>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card size="small" title="Nội dung mẫu" style={{ marginBottom: 16 }}>
            {record.tieuDe && (
              <>
                <Text type="secondary">Tiêu đề</Text>
                <Paragraph strong style={{ marginTop: 4 }}>
                  {record.tieuDe}
                </Paragraph>
              </>
            )}
            <Text type="secondary">Nội dung</Text>
            <pre
              style={{
                marginTop: 8,
                padding: 12,
                background: '#fafafa',
                border: '1px solid #f0f0f0',
                borderRadius: 6,
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                fontSize: 13,
              }}
            >
              {record.noiDung}
            </pre>
          </Card>

          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/thong-bao/mau')}>
            Quay lại danh sách
          </Button>
        </Col>
      </Row>
    </div>
  )
}

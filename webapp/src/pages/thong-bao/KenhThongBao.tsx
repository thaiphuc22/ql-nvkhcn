/**
 * Kênh thông báo — cấu hình Email / SMS / Web / App
 * Route: /thong-bao/kenh
 */
import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  message,
  Row,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd'
import {
  ApiOutlined,
  BellOutlined,
  MailOutlined,
  MessageOutlined,
  MobileOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import { PageHeader } from '../../components/ui'
import {
  listKenhThongBao,
  subscribeThongBao,
  updateKenhThongBao,
  type KenhCode,
  type KenhThongBao,
} from '../../data/catalogMauThongBao'

const { Text } = Typography

const ICONS: Record<KenhCode, React.ReactNode> = {
  email: <MailOutlined style={{ fontSize: 28, color: '#1890ff' }} />,
  sms: <MessageOutlined style={{ fontSize: 28, color: '#52c41a' }} />,
  web: <BellOutlined style={{ fontSize: 28, color: '#fa8c16' }} />,
  app: <MobileOutlined style={{ fontSize: 28, color: '#722ed1' }} />,
}

const FIELD_LABELS: Record<string, string> = {
  smtpHost: 'SMTP Host',
  port: 'Port',
  tls: 'TLS',
  from: 'From',
  replyTo: 'Reply-To',
  endpoint: 'API Endpoint',
  brandname: 'Brandname',
  balance: 'Số dư',
  encoding: 'Encoding',
  retentionDays: 'Giữ tin (ngày)',
  maxUnread: 'Badge tối đa',
  sound: 'Âm thanh',
  groupByDossier: 'Gom theo hồ sơ',
  provider: 'Provider',
  topicPrefix: 'Topic prefix',
  ttlSeconds: 'TTL (giây)',
  deepLinkBase: 'Deep link',
}

export default function KenhThongBaoPage() {
  const [channels, setChannels] = useState<KenhThongBao[]>(() => listKenhThongBao())
  const [editing, setEditing] = useState<KenhCode | null>(null)
  const [form] = Form.useForm()

  useEffect(() => subscribeThongBao(() => setChannels(listKenhThongBao())), [])

  function openEdit(c: KenhThongBao) {
    setEditing(c.code)
    form.setFieldsValue(c.cauHinh)
  }

  function handleSave() {
    if (!editing) return
    form.validateFields().then((values) => {
      updateKenhThongBao(editing, { cauHinh: values })
      message.success('Đã lưu cấu hình kênh')
      setEditing(null)
    })
  }

  return (
    <div>
      <PageHeader
        icon={<ApiOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Kênh thông báo"
        code="Cấu hình Email / SMS / Web / App"
      />

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Kênh gửi thông báo"
        description="Bật/tắt từng kênh và chỉnh tham số kết nối. Trigger chỉ gửi được qua kênh đang bật."
      />

      <Row gutter={[16, 16]}>
        {channels.map((c) => (
          <Col xs={24} md={12} key={c.code}>
            <Card
              size="small"
              title={
                <Space>
                  {ICONS[c.code]}
                  <span>{c.ten}</span>
                  <Tag color={c.enabled ? 'green' : 'default'}>
                    {c.enabled ? 'Đang bật' : 'Đang tắt'}
                  </Tag>
                </Space>
              }
              extra={
                <Switch
                  checked={c.enabled}
                  checkedChildren="Bật"
                  unCheckedChildren="Tắt"
                  onChange={(checked) => {
                    updateKenhThongBao(c.code, { enabled: checked })
                    message.success(
                      checked ? `Đã bật kênh ${c.ten}` : `Đã tắt kênh ${c.ten}`,
                    )
                  }}
                />
              }
            >
              <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                {c.moTa}
              </Text>

              {editing === c.code ? (
                <>
                  <Form form={form} layout="vertical" size="small">
                    {Object.keys(c.cauHinh).map((key) => (
                      <Form.Item
                        key={key}
                        name={key}
                        label={FIELD_LABELS[key] || key}
                        rules={[{ required: true, message: 'Bắt buộc' }]}
                      >
                        <Input />
                      </Form.Item>
                    ))}
                  </Form>
                  <Space>
                    <Button onClick={() => setEditing(null)}>Hủy</Button>
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                      Lưu cấu hình
                    </Button>
                  </Space>
                </>
              ) : (
                <>
                  <Descriptions column={1} size="small">
                    {Object.entries(c.cauHinh).map(([k, v]) => (
                      <Descriptions.Item key={k} label={FIELD_LABELS[k] || k}>
                        {v}
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                  <Button
                    type="link"
                    style={{ paddingLeft: 0 }}
                    disabled={!c.enabled}
                    onClick={() => openEdit(c)}
                  >
                    Chỉnh sửa cấu hình
                  </Button>
                </>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

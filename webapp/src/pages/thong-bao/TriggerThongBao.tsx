/**
 * Trigger — gắn mẫu thông báo với sự kiện nghiệp vụ
 * Route: /thong-bao/trigger
 */
import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  message,
  Modal,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd'
import {
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader } from '../../components/ui'
import {
  addTriggerThongBao,
  deleteTriggerThongBao,
  listMauThongBao,
  listTriggerThongBao,
  NGUOI_NHAN_RULE_OPTIONS,
  SU_KIEN_OPTIONS,
  subscribeThongBao,
  updateTriggerThongBao,
  type KenhCode,
  type TriggerThongBao,
} from '../../data/catalogMauThongBao'

const { Text } = Typography

interface FormValues {
  suKien: string
  mauId: string
  nguoiNhanRule: string
}

export default function TriggerThongBaoPage() {
  const [triggers, setTriggers] = useState(() => listTriggerThongBao())
  const [templates, setTemplates] = useState(() => listMauThongBao())
  const [form] = Form.useForm<FormValues>()

  useEffect(
    () =>
      subscribeThongBao(() => {
        setTriggers(listTriggerThongBao())
        setTemplates(listMauThongBao())
      }),
    [],
  )

  const activeTemplates = templates.filter((t) => t.trangThai === 'active')

  function handleAdd() {
    form.validateFields().then((values) => {
      const mau = templates.find((t) => t.id === values.mauId)
      if (!mau) {
        message.error('Không tìm thấy mẫu')
        return
      }
      addTriggerThongBao({
        suKien: values.suKien,
        mauId: mau.id,
        mauMa: mau.ma,
        mauTen: mau.ten,
        kenh: mau.loai as KenhCode,
        kichHoat: true,
        nguoiNhanRule: values.nguoiNhanRule,
      })
      message.success('Đã gắn mẫu với sự kiện')
      form.resetFields()
    })
  }

  const columns: ColumnsType<TriggerThongBao> = [
    {
      title: 'Sự kiện nghiệp vụ',
      dataIndex: 'suKien',
      render: (v) => SU_KIEN_OPTIONS.find((s) => s.value === v)?.label || v,
    },
    {
      title: 'Mẫu',
      key: 'mau',
      width: 280,
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
      title: 'Kênh',
      dataIndex: 'kenh',
      width: 90,
      align: 'center',
      render: (v: string) => <Tag>{v.toUpperCase()}</Tag>,
    },
    {
      title: 'Người nhận',
      dataIndex: 'nguoiNhanRule',
      width: 180,
      render: (v) => NGUOI_NHAN_RULE_OPTIONS.find((o) => o.value === v)?.label || v,
    },
    {
      title: 'Kích hoạt',
      dataIndex: 'kichHoat',
      width: 100,
      align: 'center',
      render: (v, r) => (
        <Switch
          size="small"
          checked={v}
          onChange={(checked) => {
            updateTriggerThongBao(r.id, { kichHoat: checked })
            message.success(checked ? 'Đã bật trigger' : 'Đã tắt trigger')
          }}
        />
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'ngayTao',
      width: 110,
    },
    {
      title: '',
      key: 'action',
      width: 60,
      render: (_, r) => (
        <Button
          size="small"
          type="text"
          danger
          icon={<CloseCircleOutlined />}
          onClick={() => {
            Modal.confirm({
              title: 'Gỡ trigger này?',
              icon: <ExclamationCircleOutlined />,
              content: (
                <div>
                  <p>
                    Gỡ gắn mẫu <Text code>{r.mauMa}</Text> với sự kiện{' '}
                    <Text strong>
                      {SU_KIEN_OPTIONS.find((s) => s.value === r.suKien)?.label || r.suKien}
                    </Text>
                    .
                  </p>
                  <p style={{ marginBottom: 0, color: '#8c8c8c' }}>
                    Sự kiện sẽ không còn gửi thông báo theo mẫu này.
                  </p>
                </div>
              ),
              okText: 'Gỡ',
              okType: 'danger',
              cancelText: 'Hủy',
              centered: true,
              onOk: () => {
                deleteTriggerThongBao(r.id)
                message.success('Đã gỡ trigger')
              },
            })
          }}
        />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        icon={<LinkOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Trigger thông báo"
        code="Gắn mẫu thông báo với sự kiện nghiệp vụ quy trình"
      />

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Khi sự kiện xảy ra (trình duyệt, duyệt, quá hạn, incident…), hệ thống gửi theo mẫu và kênh đã gắn."
      />

      <Card size="small" title="Gắn mới" style={{ marginBottom: 16 }}>
        <Form form={form} layout="vertical">
          <Row gutter={12} align="bottom">
            <Col xs={24} md={7}>
              <Form.Item
                name="suKien"
                label="Sự kiện"
                rules={[{ required: true, message: 'Chọn sự kiện' }]}
              >
                <Select
                  placeholder="Chọn sự kiện"
                  options={SU_KIEN_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="mauId"
                label="Mẫu thông báo"
                rules={[{ required: true, message: 'Chọn mẫu' }]}
              >
                <Select
                  placeholder="Chọn mẫu đang hoạt động"
                  options={activeTemplates.map((t) => ({
                    value: t.id,
                    label: `${t.ma} — ${t.ten} (${t.loai})`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={5}>
              <Form.Item
                name="nguoiNhanRule"
                label="Người nhận"
                rules={[{ required: true, message: 'Chọn quy tắc' }]}
                initialValue="assignee"
              >
                <Select options={NGUOI_NHAN_RULE_OPTIONS} />
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item>
                <Button type="primary" icon={<PlusOutlined />} block onClick={handleAdd}>
                  Gắn sự kiện
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card size="small" title={`Danh sách trigger (${triggers.length})`}>
        <Table
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={triggers}
          pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} trigger` }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  )
}

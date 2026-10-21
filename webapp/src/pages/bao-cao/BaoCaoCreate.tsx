/**
 * Bao cao - Tao moi (Create Report)
 * Route: /phan-he/PH2/bao-cao/tao-moi
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  message,
  Row,
  Col,
  Select,
  Space,
  Upload,
  Typography,
} from 'antd'
import {
  ArrowLeftOutlined,
  CloudUploadOutlined,
  SaveOutlined,
  SendOutlined,
} from '@ant-design/icons'
import { PageHeader } from '../../components/ui'
import { LOAI_OPTIONS } from '../../data/catalogBaoCao'

const { Text } = Typography
const { TextArea } = Input
const { Dragger } = Upload

interface FormValues {
  tieuDe: string
  loai: 'dinhKy' | 'dotXuat'
  noiDung: string
}

export default function BaoCaoCreate() {
  const navigate = useNavigate()
  const [form] = Form.useForm<FormValues>()
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSaveDraft = async () => {
    setSaving(true)
    try {
      await form.validateFields()
      message.success('Da luu nhap')
      setTimeout(() => navigate('/phan-he/PH2/bao-cao'), 500)
    } catch {
      message.error('Vui long dien day du thong tin bat buoc')
    }
    setSaving(false)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await form.validateFields()
      message.success('Da trinh duyet bao cao')
      setTimeout(() => navigate('/phan-he/PH2/bao-cao'), 500)
    } catch {
      message.error('Vui long dien day du thong tin bat buoc')
    }
    setSubmitting(false)
  }

  return (
    <div>
      <PageHeader
        icon={<SaveOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Tao bao cao moi"
        code="Dien thong tin de tao bao cao dinh ky hoac dot xuat"
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/phan-he/PH2/bao-cao')}>
              Quay lai
            </Button>
            <Button icon={<SaveOutlined />} onClick={handleSaveDraft} loading={saving}>
              Luu nhap
            </Button>
            <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit} loading={submitting}>
              Trinh duyet
            </Button>
          </Space>
        }
        onBack={() => navigate('/phan-he/PH2/bao-cao')}
      />

      <Alert
        type="info"
        showIcon
        message="Huong dan"
        description="Dien day du thong tin bao cao. Ban co the luu nhap de chinh sua sau hoac trinh duyet ngay."
        style={{ marginBottom: 16 }}
      />

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title="Thong tin bao cao" style={{ marginBottom: 16 }}>
            <Form form={form} layout="vertical" requiredMark="optional">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="loai"
                    label="Loai bao cao"
                    rules={[{ required: true, message: 'Chon loai bao cao' }]}
                  >
                    <Select placeholder="Chon loai bao cao">
                      {LOAI_OPTIONS.map((o) => (
                        <Select.Option key={o.value} value={o.value}>
                          {o.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="tieuDe"
                label="Tieu de bao cao"
                rules={[{ required: true, message: 'Nhap tieu de bao cao' }]}
              >
                <Input placeholder="VD: Bao cao tien do thuc hien NV KHCN quy I/2026" />
              </Form.Item>

              <Form.Item
                name="noiDung"
                label="Noi dung bao cao"
                rules={[{ required: true, message: 'Nhap noi dung bao cao' }]}
              >
                <TextArea
                  rows={16}
                  placeholder={`Nhap noi dung bao cao...

Cau truc goi y:
1. Tom tat noi dung
2. Tinh hinh thuc hien
3. Ket qua dat duoc
4. Kinh phi (neu co)
5. Van de, kho khan
6. De xuat,kien nghi`}
                />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="File dinh kem" style={{ marginBottom: 16 }}>
            <Dragger
              name="files"
              multiple
              action="#"
              beforeUpload={() => false}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg"
            >
              <p className="ant-upload-drag-icon">
                <CloudUploadOutlined style={{ fontSize: 40, color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text">Keo tha file vao day hoac click de chon</p>
              <p className="ant-upload-hint">Ho tro: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG</p>
            </Dragger>
          </Card>

          <Card title="Luu y khi tao bao cao">
            <Space direction="vertical" size="middle">
              <Text type="secondary">
                1. Bao cao dinh ky: Duoc tao theo lich (thang, quy, nam)
              </Text>
              <Text type="secondary">
                2. Bao cao dot xuat: Duoc tao khi co su kien bat thuong
              </Text>
              <Text type="secondary">
                3. Sau khi trinh duyet, bao cao se chuyen den nguoi phu trách phê duyệt
              </Text>
              <Text type="secondary">
                4. Ban co the xem lai lich su thay doi trong phan chi tiet
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
/**
 * Bao cao - Chinh sua (Edit Report)
 * Route: /phan-he/PH2/bao-cao/:id/chinh-sua
 */
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  message,
  Row,
  Select,
  Space,
  Upload,
} from 'antd'
import {
  ArrowLeftOutlined,
  CloudUploadOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import { PageHeader } from '../../components/ui'
import { seedBaoCao, LOAI_OPTIONS } from '../../data/catalogBaoCao'
const { TextArea } = Input
const { Dragger } = Upload

interface FormValues {
  tieuDe: string
  loai: 'dinhKy' | 'dotXuat'
  noiDung: string
}

export default function BaoCaoEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const record = seedBaoCao.find((b) => b.id === id)
  const [form] = Form.useForm<FormValues>()

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

  if (record.trangThai === 'daDuyet' || record.trangThai === 'huy') {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          type="warning"
          message="Khong the chinh sua"
          description="Bao cao da duyet hoac da huy khong the chinh sua."
        />
        <Button style={{ marginTop: 16 }} onClick={() => navigate('/phan-he/PH2/bao-cao')}>
          Quay lai danh sach
        </Button>
      </div>
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await form.validateFields()
      message.success('Da luu thay doi')
      setTimeout(() => navigate('/phan-he/PH2/bao-cao/' + id), 500)
    } catch {
      message.error('Vui long kiem tra lai thong tin')
    }
    setSaving(false)
  }

  return (
    <div>
      <PageHeader
        icon={<SaveOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title="Chinh sua bao cao"
        code={`Ma: ${record.ma}`}
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/phan-he/PH2/bao-cao/' + id)}>
              Huy
            </Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
              Luu
            </Button>
          </Space>
        }
        onBack={() => navigate('/phan-he/PH2/bao-cao/' + id)}
      />

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title="Thong tin bao cao" style={{ marginBottom: 16 }}>
            <Form
              form={form}
              layout="vertical"
              requiredMark="optional"
              initialValues={{
                tieuDe: record.tieuDe,
                loai: record.loai,
                noiDung: record.noiDung,
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="loai" label="Loai bao cao" rules={[{ required: true }]}>
                    <Select>
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
                rules={[{ required: true, message: 'Nhap tieu de' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="noiDung"
                label="Noi dung bao cao"
                rules={[{ required: true, message: 'Nhap noi dung' }]}
              >
                <TextArea rows={16} />
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
            </Dragger>

            {record.fileDinhKem && record.fileDinhKem.length > 0 && (
              <>
                <Divider>File hien tai</Divider>
                <Space direction="vertical" size="small">
                  {record.fileDinhKem.map((file, idx) => (
                    <Button key={idx} type="link" icon={<CloudUploadOutlined />} size="small">
                      {file}
                    </Button>
                  ))}
                </Space>
              </>
            )}
          </Card>

          <Alert
            type="info"
            showIcon
            message="Luu y"
            description="Sau khi chinh sua, ban can trinh duyet lai bao cao de duoc phe duyet."
            style={{ marginBottom: 16 }}
          />
        </Col>
      </Row>
    </div>
  )
}
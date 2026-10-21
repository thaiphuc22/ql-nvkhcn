/**
 * Mẫu thông báo — màn hình Tạo mới / Chỉnh sửa
 * Routes: /thong-bao/mau/moi | /thong-bao/mau/:id/sua
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  Space,
} from 'antd'
import { BellOutlined, SaveOutlined } from '@ant-design/icons'
import { PageHeader } from '../../components/ui'
import {
  getMauThongBao,
  LOAI_OPTIONS,
  TRANG_THAI_OPTIONS,
  upsertMauThongBao,
  type MauThongBao,
  type MauThongBaoLoai,
} from '../../data/catalogMauThongBao'

const { TextArea } = Input

interface FormValues {
  ma: string
  ten: string
  loai: MauThongBaoLoai
  tieuDe?: string
  noiDung: string
  moTa?: string
  trangThai: 'active' | 'inactive'
}

export default function MauThongBaoForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const existing = useMemo(() => (id ? getMauThongBao(id) : undefined), [id])
  const [form] = Form.useForm<FormValues>()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit && existing) {
      form.setFieldsValue({
        ma: existing.ma,
        ten: existing.ten,
        loai: existing.loai,
        tieuDe: existing.tieuDe,
        noiDung: existing.noiDung,
        moTa: existing.moTa,
        trangThai: existing.trangThai,
      })
    } else if (!isEdit) {
      form.setFieldsValue({ trangThai: 'active', loai: 'email' })
    }
  }, [isEdit, existing, form])

  if (isEdit && !existing) {
    return (
      <div>
        <Alert type="error" showIcon message="Không tìm thấy mẫu thông báo" />
        <Button style={{ marginTop: 16 }} onClick={() => navigate('/thong-bao/mau')}>
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  function handleSubmit() {
    form.validateFields().then((values) => {
      setSaving(true)
      try {
        if (isEdit && existing) {
          const updated: MauThongBao = {
            ...existing,
            ma: values.ma.trim().toUpperCase(),
            ten: values.ten.trim(),
            loai: values.loai,
            tieuDe: values.tieuDe,
            noiDung: values.noiDung,
            moTa: values.moTa,
            trangThai: values.trangThai,
            ngayCapNhat: new Date().toISOString().slice(0, 10),
          }
          upsertMauThongBao(updated)
          message.success('Đã cập nhật mẫu thông báo')
          navigate(`/thong-bao/mau/${existing.id}`)
        } else {
          const created: MauThongBao = {
            id: 'TB' + Date.now().toString(36).toUpperCase(),
            ma: values.ma.trim().toUpperCase(),
            ten: values.ten.trim(),
            loai: values.loai,
            tieuDe: values.tieuDe,
            noiDung: values.noiDung,
            moTa: values.moTa,
            trangThai: values.trangThai,
            bienBanSuKien: [],
            nguoiTao: 'admin',
            ngayTao: new Date().toISOString().slice(0, 10),
          }
          upsertMauThongBao(created)
          message.success('Đã tạo mẫu thông báo')
          navigate(`/thong-bao/mau/${created.id}`)
        }
      } finally {
        setSaving(false)
      }
    })
  }

  return (
    <div>
      <PageHeader
        icon={<BellOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
        title={isEdit ? 'Chỉnh sửa mẫu thông báo' : 'Tạo mới mẫu thông báo'}
        code={isEdit ? existing?.ma : 'Nhập thông tin mẫu Email / SMS / Web / App'}
        breadcrumb={[
          { label: 'Mẫu thông báo', to: '/thong-bao/mau' },
          { label: isEdit ? 'Chỉnh sửa' : 'Tạo mới' },
        ]}
        onBack={() =>
          navigate(isEdit && existing ? `/thong-bao/mau/${existing.id}` : '/thong-bao/mau')
        }
        extra={
          <Space>
            <Button
              onClick={() =>
                navigate(isEdit && existing ? `/thong-bao/mau/${existing.id}` : '/thong-bao/mau')
              }
            >
              Hủy
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSubmit}
            >
              {isEdit ? 'Lưu thay đổi' : 'Tạo mới'}
            </Button>
          </Space>
        }
      />

      <Card>
        <Form form={form} layout="vertical" requiredMark="optional" style={{ maxWidth: 880 }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="ma"
                label="Mã mẫu"
                rules={[{ required: true, message: 'Nhập mã mẫu' }]}
              >
                <Input placeholder="VD: EMAIL-001" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="loai"
                label="Kênh"
                rules={[{ required: true, message: 'Chọn kênh' }]}
              >
                <Select options={LOAI_OPTIONS} placeholder="Chọn kênh" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="ten"
            label="Tên mẫu thông báo"
            rules={[{ required: true, message: 'Nhập tên mẫu' }]}
          >
            <Input placeholder="VD: Thông báo tạo hồ sơ mới" />
          </Form.Item>

          <Form.Item name="tieuDe" label="Tiêu đề (Email / Web / App)">
            <Input placeholder="VD: [QTKHCN] Thông báo - {{maHoSo}}" />
          </Form.Item>

          <Form.Item
            name="noiDung"
            label="Nội dung mẫu"
            rules={[{ required: true, message: 'Nhập nội dung' }]}
            extra="Biến hỗ trợ: {{maHoSo}}, {{tenNhiemVu}}, {{nguoiNhan}}, {{buocHienTai}}, …"
          >
            <TextArea rows={12} placeholder="Nhập nội dung mẫu thông báo…" />
          </Form.Item>

          <Form.Item name="moTa" label="Mô tả">
            <Input placeholder="Mô tả ngắn về mẫu này" />
          </Form.Item>

          <Form.Item name="trangThai" label="Trạng thái" rules={[{ required: true }]}>
            <Select options={TRANG_THAI_OPTIONS} style={{ maxWidth: 240 }} />
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

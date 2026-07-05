import { lazy, Suspense, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  App,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Spin,
  Typography,
} from 'antd'
import { DownloadOutlined, PartitionOutlined, SaveOutlined } from '@ant-design/icons'
import { NHOM, type ProcessDef } from '../data/processes'
import { useProcesses } from '../store/ProcessContext'
import { useForms } from '../store/FormContext'
import { type BpmnEditorHandle } from '../components/BpmnEditor'
import { PageHeader } from '../components/ui'

const { Text } = Typography

// bpmn-js nặng → tách chunk, chỉ tải ở màn này.
const BpmnEditor = lazy(() => import('../components/BpmnEditor'))

const TODAY = '2026-07-03'

export default function ProcessCreate() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const { addProcess } = useProcesses()
  const { list: forms } = useForms()
  const [form] = Form.useForm()
  const editorRef = useRef<BpmnEditorHandle>(null)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    let values: { ma: string; ten: string; nhom: string; pha: 1 | 2; moTa?: string }
    try {
      values = await form.validateFields()
    } catch {
      return
    }
    // Cổng lưu: còn lỗi lint (severity=error) thì chặn — modal kết quả tự mở.
    const issues = editorRef.current?.validateForSave() ?? []
    const errorCount = issues.filter((i) => i.severity === 'error').length
    if (errorCount > 0) {
      message.error(`Không thể lưu: sơ đồ còn ${errorCount} lỗi. Bấm vào từng lỗi để tới phần tử cần sửa.`)
      return
    }
    setSaving(true)
    try {
      const bpmnXml = (await editorRef.current?.getXml()) ?? ''
      const ma = values.ma.trim()
      const np: ProcessDef = {
        ma,
        ten: values.ten.trim(),
        nhom: values.nhom,
        pha: values.pha,
        trangThai: 'draft',
        instances: 0,
        capNhat: TODAY,
        moTa: values.moTa?.trim() || 'Quy trình vẽ bằng BPMN editor (mock).',
        versions: [{ v: '1.0', date: TODAY, note: 'Tạo & vẽ BPMN lần đầu' }],
        bpmnXml,
      }
      if (!addProcess(np)) {
        message.error(`Mã ${ma} đã tồn tại.`)
        return
      }
      message.success(`Đã tạo quy trình ${ma} kèm sơ đồ BPMN.`)
      navigate(`/quy-trinh/${encodeURIComponent(ma)}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleDownload() {
    const xml = (await editorRef.current?.getXml()) ?? ''
    const ma = (form.getFieldValue('ma') || 'quy-trinh').toString().trim()
    const blob = new Blob([xml], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${ma}.bpmn`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    // Ghim chiều cao trang theo viewport còn lại (dưới Header ~60 + padding Content
    // 48): form "Thông tin chung" cố định, Card "Sơ đồ BPMN" chiếm phần còn lại nên
    // canvas + drawer + panel chỉ cuộn nội bộ, không kéo cả trang cuộn theo.
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)' }}>
      <PageHeader
        breadcrumb={[
          { label: 'Quản lý quy trình', to: '/quy-trinh' },
          { label: 'Danh mục quy trình', to: '/quy-trinh' },
          { label: 'Tạo mới' },
        ]}
        onBack={() => navigate('/quy-trinh')}
        icon={<PartitionOutlined style={{ fontSize: 24, color: '#ee0033' }} />}
        title="Tạo mới quy trình"
        extra={
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleDownload}>Tải .bpmn</Button>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
              Lưu & tạo quy trình
            </Button>
          </Space>
        }
      />

      {/* ── Section trên: Thông tin chung ─────────────────────────────────── */}
      <Card title="Thông tin chung" size="small" style={{ marginBottom: 16, flex: '0 0 auto' }}>
        <Form form={form} layout="vertical" initialValues={{ nhom: 'RD01', pha: 2 }}>
          <Row gutter={12}>
            <Col xs={24} sm={8} md={5}>
              <Form.Item name="ma" label="Mã quy trình" rules={[{ required: true, message: 'Nhập mã' }]}>
                <Input placeholder="VD: RD07.01" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={16} md={9}>
              <Form.Item name="ten" label="Tên quy trình" rules={[{ required: true, message: 'Nhập tên' }]}>
                <Input placeholder="VD: Quản lý danh mục SPDV" />
              </Form.Item>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Form.Item name="nhom" label="Nhóm" rules={[{ required: true }]}>
                <Select options={Object.entries(NHOM).map(([k, v]) => ({ value: k, label: `${k} · ${v}` }))} />
              </Form.Item>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Form.Item name="pha" label="Pha" rules={[{ required: true }]}>
                <Select options={[{ value: 1, label: 'Pha 1' }, { value: 2, label: 'Pha 2' }]} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="moTa" label="Mô tả luồng" style={{ marginBottom: 0 }}>
                <Input placeholder="Tóm tắt các bước chính của quy trình" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* ── Section dưới: Sơ đồ BPMN (canvas + palette trái + panel dock phải) ── */}
      <Card
        title="Sơ đồ BPMN"
        size="small"
        style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
        styles={{ body: { padding: 0, flex: 1, minHeight: 0 } }}
        extra={<Text type="secondary" style={{ fontSize: 12 }}>Kéo phần tử từ palette · bấm 1 node để cấu hình ở panel phải</Text>}
      >
        <Suspense fallback={<div style={{ padding: 60, textAlign: 'center' }}><Spin tip="Đang tải BPMN editor..." /></div>}>
          <BpmnEditor ref={editorRef} forms={forms} height="100%" />
        </Suspense>
      </Card>
    </div>
  )
}

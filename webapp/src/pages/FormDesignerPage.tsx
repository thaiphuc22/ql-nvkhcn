import { lazy, Suspense, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { App, Button, Card, Space, Spin, Typography } from 'antd'
import { FormOutlined, SaveOutlined } from '@ant-design/icons'
import { useForms } from '../store/FormContext'
import { type FormDesignerHandle } from '../components/FormDesigner'
import { PageHeader, NotFound } from '../components/ui'
import HelpButton from '../components/HelpButton'

// Trình thiết kế form-js khá nặng → chỉ nạp khi vào trang này (tách chunk riêng).
const FormDesigner = lazy(() => import('../components/FormDesigner'))

const { Text, Paragraph } = Typography

const ROUTE_BASE = '/phan-he/PH3/bieu-mau'

export default function FormDesignerPage() {
  const { key } = useParams<{ key: string }>()
  const navigate = useNavigate()
  const { message, modal } = App.useApp()
  const { getForm, updateSchema } = useForms()
  const designerRef = useRef<FormDesignerHandle>(null)

  const meta = getForm(key)

  /** Rời trang — còn thay đổi chưa lưu thì hỏi trước. */
  function back() {
    if (designerRef.current?.isDirty()) {
      modal.confirm({
        title: 'Thoát khi chưa lưu?',
        content: 'Thay đổi thiết kế chưa lưu sẽ bị mất.',
        okText: 'Thoát',
        okButtonProps: { danger: true },
        cancelText: 'Ở lại',
        onOk: () => navigate(ROUTE_BASE),
      })
      return
    }
    navigate(ROUTE_BASE)
  }

  function saveDesign() {
    if (!meta) return
    const schema = designerRef.current?.getSchema()
    if (!schema) {
      message.error('Không lấy được schema từ designer.')
      return
    }
    updateSchema(meta.key, schema)
    designerRef.current?.markSaved()
    message.success(`Đã lưu thiết kế biểu mẫu "${meta.ten}".`)
  }

  if (!meta) {
    return (
      <NotFound
        title="Không tìm thấy biểu mẫu"
        subTitle="Biểu mẫu không tồn tại hoặc đã bị xoá."
        onBack={() => navigate(ROUTE_BASE)}
        backText="Về thư viện biểu mẫu"
      />
    )
  }

  return (
    // Ghim chiều cao trang theo viewport còn lại: header cố định, Card thiết kế
    // chiếm phần còn lại nên designer chỉ cuộn nội bộ, không kéo cả trang cuộn theo.
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)' }}>
      <PageHeader
        breadcrumb={[
          { label: 'Hệ thống QTKHCN' },
          { label: 'Thư viện biểu mẫu', to: ROUTE_BASE },
          { label: meta.ten },
        ]}
        onBack={back}
        icon={<FormOutlined style={{ fontSize: 24, color: 'var(--vht-red)' }} />}
        title={`Thiết kế biểu mẫu — ${meta.ten}`}
        code={<Text code>{meta.key}</Text>}
        extra={
          <Space>
            <Button onClick={back}>Huỷ</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={saveDesign}>
              Lưu thiết kế
            </Button>
            <HelpButton section="bieumau" />
          </Space>
        }
      />

      <Card
        size="small"
        style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
        styles={{ body: { padding: 0, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } }}
      >
        <Paragraph type="secondary" style={{ flex: '0 0 auto', margin: 0, padding: '8px 16px 0' }}>
          Kéo–thả các trường từ dock <Text strong>Thành phần</Text> (trái), chỉnh thuộc tính ở dock phải,
          bật <Text strong>Xem trước</Text> để thấy form render trực tiếp. Đặt <Text code>key</Text> ={' '}
          <Text code>ketLuan</Text> cho trường kết luận để hệ thống tự nhận Đồng ý/Đạt/Thông qua/Phê duyệt.
        </Paragraph>
        <div style={{ flex: 1, minHeight: 0, padding: '8px 16px 16px' }}>
          <Suspense
            fallback={
              <div style={{ padding: 48, textAlign: 'center' }}>
                <Spin tip="Đang tải trình thiết kế..." />
              </div>
            }
          >
            <FormDesigner ref={designerRef} schema={meta.schema} />
          </Suspense>
        </div>
      </Card>
    </div>
  )
}

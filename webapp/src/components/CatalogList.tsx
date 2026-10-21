/**
 * CatalogList - Shared component for displaying catalog entities
 * Reusable across all PH2 catalog categories
 */
import { useMemo, useState } from 'react'
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { PageHeader, StatCard } from './ui'

const { Text } = Typography
const { TextArea } = Input

export interface CatalogColumn<T> {
  title: string
  dataIndex?: keyof T | string[]
  key: string
  width?: number
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, record: T) => React.ReactNode
}

export interface CatalogFormField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'date'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  width?: number
}

export interface CatalogConfig<T> {
  entityName: string
  entityNamePlural: string
  icon: React.ReactNode
  basePath: string
  columns: CatalogColumn<T>[]
  formFields: CatalogFormField[]
  statusField?: keyof T
  statusOptions?: { value: string; label: string; color: string }[]
  stats?: { key: keyof T; label: string; color?: string }[]
  hasSapIntegration?: boolean
  hasFileAttachment?: boolean
  detailFields?: { label: string; dataIndex: keyof T | string[] }[]
}

interface CatalogListProps<T extends { id: string; trangThai: string }> {
  data: T[]
  config: CatalogConfig<T>
  onAdd?: (values: Partial<T>) => void
  onUpdate?: (id: string, values: Partial<T>) => void
  onDelete?: (id: string) => void
  onSapCreate?: (values: Partial<T>) => void
  onSapUpdate?: (id: string, values: Partial<T>) => void
}

export function CatalogList<T extends { id: string; trangThai: string }>({
  data,
  config,
  onAdd,
  onUpdate,
  onDelete,
  onSapCreate,
  onSapUpdate,
}: CatalogListProps<T>) {
  const [q, setQ] = useState('')
  const [fStatus, setFStatus] = useState<string>()
  const [modalOpen, setModalOpen] = useState(false)
  const [sapModalOpen, setSapModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [sapForm] = Form.useForm()

  const stats = useMemo(() => {
    if (!config.stats) return null
    return config.stats.map((s) => ({
      label: s.label,
      value: data.filter((d) => d[s.key] === s.key).length,
      color: s.color,
    }))
  }, [data, config.stats])

  const filtered = useMemo(() => {
    return data.filter((item) => {
      if (fStatus && item.trangThai !== fStatus) return false
      if (q) {
        const s = q.toLowerCase()
        const match = Object.values(item as Record<string, unknown>).some(
          (v) => v && String(v).toLowerCase().includes(s),
        )
        if (!match) return false
      }
      return true
    })
  }, [data, q, fStatus])

  const columns: ColumnsType<T> = useMemo(
    () => [
      ...(config.columns as ColumnsType<T>),
      {
        title: 'Thao tác',
        key: 'action',
        width: 160,
        align: 'center' as const,
        render: (_: unknown, record: T) => (
          <Space>
            <Tooltip title="Sửa">
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  setEditingId(record.id)
                  form.setFieldsValue(record)
                  setModalOpen(true)
                }}
              />
            </Tooltip>
            {config.hasSapIntegration && (
              <Tooltip title="Tích hợp SAP">
                <Button
                  size="small"
                  icon={<CloudUploadOutlined />}
                  onClick={() => {
                    setEditingId(record.id)
                    sapForm.setFieldsValue(record)
                    setSapModalOpen(true)
                  }}
                />
              </Tooltip>
            )}
            <Popconfirm
              title="Xoá?"
              description="Thao tác này không thể hoàn tác."
              okText="Xoá"
              okButtonProps={{ danger: true }}
              cancelText="Huỷ"
              onConfirm={() => {
                onDelete?.(record.id)
                message.success(`Đã xoá ${config.entityName.toLowerCase()}`)
              }}
            >
              <Tooltip title="Xoá">
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [config, form, sapForm, onDelete],
  )

  const handleSubmit = (values: Partial<T>) => {
    if (editingId) {
      onUpdate?.(editingId, values)
      message.success(`Đã cập nhật ${config.entityName.toLowerCase()}`)
    } else {
      onAdd?.(values)
      message.success(`Đã tạo ${config.entityName.toLowerCase()}`)
    }
    setModalOpen(false)
    setEditingId(null)
    form.resetFields()
  }

  const handleSapSubmit = (values: Partial<T>) => {
    if (editingId) {
      onSapUpdate?.(editingId, values)
      message.success(`Đã đồng bộ SAP cho ${config.entityName.toLowerCase()}`)
    } else {
      onSapCreate?.(values)
      message.success(`Đã tạo mới qua SAP ${config.entityName.toLowerCase()}`)
    }
    setSapModalOpen(false)
    setEditingId(null)
    sapForm.resetFields()
  }

  return (
    <div>
      <PageHeader
        icon={config.icon}
        title={config.entityNamePlural}
        extra={
          <Space>
            {config.hasSapIntegration && (
              <Button
                icon={<CloudUploadOutlined />}
                onClick={() => {
                  setEditingId(null)
                  sapForm.resetFields()
                  setSapModalOpen(true)
                }}
              >
                Tạo mới (SAP)
              </Button>
            )}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingId(null)
                form.resetFields()
                setModalOpen(true)
              }}
            >
              Tạo mới
            </Button>
          </Space>
        }
      />

      {/* Stats Row */}
      {stats && (
        <Row gutter={12} style={{ marginBottom: 16 }}>
          {stats.map((s, i) => (
            <Col key={i} xs={12} sm={6}>
              <StatCard size="small" title={s.label} value={s.value} color={s.color} />
            </Col>
          ))}
        </Row>
      )}

      {/* Search & Filter */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Input
              placeholder={`Tìm kiếm ${config.entityName.toLowerCase()}...`}
              prefix={<SearchOutlined style={{ color: '#8593a3' }} />}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              allowClear
            />
          </Col>
          {config.statusOptions && (
            <Col>
              <Space>
                <Text type="secondary">Lọc:</Text>
                <Tag
                  color={!fStatus ? 'processing' : 'default'}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setFStatus(undefined)}
                >
                  Tất cả
                </Tag>
                {config.statusOptions.map((opt) => (
                  <Tag
                    key={opt.value}
                    color={fStatus === opt.value ? opt.color : 'default'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setFStatus(opt.value)}
                  >
                    {opt.label}
                  </Tag>
                ))}
              </Space>
            </Col>
          )}
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          size="small"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        title={`${editingId ? 'Cập nhật' : 'Tạo mới'} ${config.entityName}`}
        okText={editingId ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Huỷ"
        onOk={() => form.submit()}
        onCancel={() => {
          setModalOpen(false)
          setEditingId(null)
          form.resetFields()
        }}
        width={640}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          {config.formFields.map((f) => (
            <Form.Item
              key={f.name}
              name={f.name}
              label={f.label}
              rules={f.required ? [{ required: true, message: `Nhập ${f.label}` }] : []}
            >
              {f.type === 'textarea' ? (
                <TextArea rows={3} placeholder={f.placeholder} />
              ) : f.type === 'select' ? (
                <Input placeholder={f.placeholder} />
              ) : (
                <Input placeholder={f.placeholder} type={f.type} />
              )}
            </Form.Item>
          ))}
        </Form>
      </Modal>

      {/* SAP Integration Modal */}
      {config.hasSapIntegration && (
        <Modal
          open={sapModalOpen}
          title={`Tích hợp SAP - ${editingId ? 'Cập nhật' : 'Tạo mới'}`}
          okText={editingId ? 'Đồng bộ' : 'Tạo qua SAP'}
          cancelText="Huỷ"
          onOk={() => sapForm.submit()}
          onCancel={() => {
            setSapModalOpen(false)
            setEditingId(null)
            sapForm.resetFields()
          }}
          width={640}
        >
          <Form form={sapForm} layout="vertical" onFinish={handleSapSubmit} style={{ marginTop: 16 }}>
            {config.formFields.map((f) => (
              <Form.Item key={f.name} name={f.name} label={f.label}>
                {f.type === 'textarea' ? (
                  <TextArea rows={3} placeholder={f.placeholder} />
                ) : (
                  <Input placeholder={f.placeholder} type={f.type} />
                )}
              </Form.Item>
            ))}
          </Form>
        </Modal>
      )}
    </div>
  )
}

export default CatalogList
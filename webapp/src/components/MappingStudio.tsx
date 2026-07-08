// Tab "Mapping dữ liệu" của màn Tích hợp (`/tich-hop`) — Đợt 2 (Slice E-G).
// Danh sách + soạn field/value mapping (Slice E) + preview payload (Slice F) +
// validate fail-closed trước khi Active (Slice G). Xem
// docs/research/integration-screen-upgrade-notes.md.

import { useMemo, useState } from 'react'
import {
  App,
  Button,
  Col,
  Drawer,
  Empty,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DeleteOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons'
import { FilterBar, StatusTag } from './ui'
import { useAuth } from '../store/AuthContext'
import { useIntegrationMapping } from '../store/IntegrationMappingContext'
import MappingFieldEditor from './MappingFieldEditor'
import { seedIntegrations } from '../data/camundaOps'
import {
  BUSINESS_OBJECT_LABEL,
  MAPPING_DIRECTION_LABEL,
  MAPPING_STATUS_META,
  previewMapping,
  sampleRecordsFor,
  type BusinessObject,
  type FieldMapping,
  type MappingConfig,
  type MappingDirection,
  type SampleRecord,
} from '../data/integrationMapping'

const { Text } = Typography

const OBJECT_OPTIONS = (Object.keys(BUSINESS_OBJECT_LABEL) as BusinessObject[]).map((v) => ({
  value: v,
  label: BUSINESS_OBJECT_LABEL[v],
}))
const DIRECTION_OPTIONS = (Object.keys(MAPPING_DIRECTION_LABEL) as MappingDirection[]).map((v) => ({
  value: v,
  label: MAPPING_DIRECTION_LABEL[v],
}))
const SYSTEM_OPTIONS = seedIntegrations.map((s) => ({ value: s.key, label: `${s.key} — ${s.ten}` }))

export default function MappingStudio() {
  const { user } = useAuth()
  const actor = user?.hoTen ?? 'admin'
  const { list, create, saveFields, setStatus, remove } = useIntegrationMapping()
  const { message, modal } = App.useApp()

  const [fHe, setFHe] = useState<string>()
  const [fDoiTuong, setFDoiTuong] = useState<BusinessObject>()
  const [fChieu, setFChieu] = useState<MappingDirection>()

  const [editing, setEditing] = useState<MappingConfig | null>(null)
  const [draftFields, setDraftFields] = useState<FieldMapping[]>([])
  const [previewing, setPreviewing] = useState<MappingConfig | null>(null)
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<{ he?: string; doiTuong?: BusinessObject; chieu?: MappingDirection }>({})

  const rows = useMemo(
    () =>
      list.filter(
        (c) =>
          (!fHe || c.he === fHe) &&
          (!fDoiTuong || c.doiTuong === fDoiTuong) &&
          (!fChieu || c.chieu === fChieu),
      ),
    [list, fHe, fDoiTuong, fChieu],
  )

  const openEdit = (c: MappingConfig) => {
    setEditing(c)
    setDraftFields(c.fields)
  }

  const saveEdit = () => {
    if (!editing) return
    saveFields(editing.id, draftFields, actor)
    message.success(`Đã lưu mapping ${editing.he} · ${BUSINESS_OBJECT_LABEL[editing.doiTuong]} (đưa về Draft).`)
    setEditing(null)
  }

  const toggleActive = (c: MappingConfig) => {
    if (c.trangThai === 'active') {
      setStatus(c.id, 'deprecated', actor)
      message.success('Đã chuyển sang Deprecated.')
      return
    }
    const result = setStatus(c.id, 'active', actor)
    if (!result.ok) {
      modal.error({
        title: 'Không thể kích hoạt — mapping chưa hợp lệ',
        content: (
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {result.errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        ),
      })
      return
    }
    message.success('Đã kích hoạt mapping.')
  }

  const doCreate = () => {
    if (!createForm.he || !createForm.doiTuong || !createForm.chieu) return
    create({ he: createForm.he, doiTuong: createForm.doiTuong, chieu: createForm.chieu, actor })
    setCreateOpen(false)
    setCreateForm({})
    message.success('Đã tạo mapping mới (Draft) — bấm "Sửa" để soạn field.')
  }

  const columns: ColumnsType<MappingConfig> = [
    { title: 'Hệ', dataIndex: 'he', width: 80, render: (v: string) => <Tag>{v}</Tag> },
    {
      title: 'Đối tượng',
      dataIndex: 'doiTuong',
      width: 110,
      render: (v: BusinessObject) => BUSINESS_OBJECT_LABEL[v],
    },
    {
      title: 'Chiều',
      dataIndex: 'chieu',
      width: 150,
      render: (v: MappingDirection) => <Text style={{ fontSize: 12 }}>{MAPPING_DIRECTION_LABEL[v]}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      width: 110,
      render: (v: MappingConfig['trangThai']) => (
        <StatusTag color={MAPPING_STATUS_META[v].color} label={MAPPING_STATUS_META[v].label} />
      ),
    },
    {
      title: 'Field',
      dataIndex: 'fields',
      width: 70,
      align: 'center',
      render: (fields: FieldMapping[]) => fields.length,
    },
    {
      title: 'Cập nhật',
      dataIndex: 'capNhatLuc',
      width: 160,
      render: (v: string, r) => (
        <Text style={{ fontSize: 12 }}>
          {v} · {r.capNhatBoi}
        </Text>
      ),
    },
    {
      title: '',
      key: 'actions',
      render: (_, c) => (
        <Space size={6}>
          <Button size="small" onClick={() => openEdit(c)}>
            Sửa
          </Button>
          <Tooltip title={c.fields.length === 0 ? 'Chưa có field để xem trước' : undefined}>
            <Button
              size="small"
              icon={<EyeOutlined />}
              disabled={c.fields.length === 0}
              onClick={() => setPreviewing(c)}
            >
              Xem trước
            </Button>
          </Tooltip>
          <Button size="small" type={c.trangThai === 'active' ? 'default' : 'primary'} onClick={() => toggleActive(c)}>
            {c.trangThai === 'active' ? 'Vô hiệu hoá' : 'Kích hoạt'}
          </Button>
          <Popconfirm title={`Xoá mapping ${c.he}?`} onConfirm={() => remove(c.id)} okText="Xoá" cancelText="Huỷ">
            <Button size="small" danger type="text" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <FilterBar
        selects={[
          { key: 'he', placeholder: 'Tất cả hệ', value: fHe, onChange: setFHe, width: 170, options: SYSTEM_OPTIONS },
          {
            key: 'doiTuong',
            placeholder: 'Tất cả đối tượng',
            value: fDoiTuong,
            onChange: setFDoiTuong,
            width: 160,
            options: OBJECT_OPTIONS,
          },
          {
            key: 'chieu',
            placeholder: 'Tất cả chiều',
            value: fChieu,
            onChange: setFChieu,
            width: 190,
            options: DIRECTION_OPTIONS,
          },
        ]}
        right={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            Thêm mapping
          </Button>
        }
      />

      <Table
        size="small"
        rowKey="id"
        columns={columns}
        dataSource={rows}
        pagination={false}
        locale={{ emptyText: <Empty description="Chưa có mapping nào khớp bộ lọc." /> }}
      />

      {/* Tạo mapping mới — chỉ chọn hệ/đối tượng/chiều, soạn field ở bước Sửa. */}
      <Modal
        open={createOpen}
        title="Thêm mapping mới"
        onCancel={() => setCreateOpen(false)}
        onOk={doCreate}
        okButtonProps={{ disabled: !createForm.he || !createForm.doiTuong || !createForm.chieu }}
        okText="Tạo (Draft)"
        cancelText="Huỷ"
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Select
            style={{ width: '100%' }}
            placeholder="Hệ tích hợp"
            options={SYSTEM_OPTIONS}
            value={createForm.he}
            onChange={(v) => setCreateForm((s) => ({ ...s, he: v }))}
          />
          <Select
            style={{ width: '100%' }}
            placeholder="Đối tượng nghiệp vụ"
            options={OBJECT_OPTIONS}
            value={createForm.doiTuong}
            onChange={(v) => setCreateForm((s) => ({ ...s, doiTuong: v }))}
          />
          <Select
            style={{ width: '100%' }}
            placeholder="Chiều dữ liệu"
            options={DIRECTION_OPTIONS}
            value={createForm.chieu}
            onChange={(v) => setCreateForm((s) => ({ ...s, chieu: v }))}
          />
        </Space>
      </Modal>

      {/* Soạn field + value mapping. */}
      <Drawer
        title={editing ? `Soạn mapping · ${editing.he} · ${BUSINESS_OBJECT_LABEL[editing.doiTuong]}` : undefined}
        open={!!editing}
        onClose={() => setEditing(null)}
        width={640}
        extra={
          <Button type="primary" onClick={saveEdit}>
            Lưu
          </Button>
        }
      >
        {editing && (
          <>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
              {MAPPING_DIRECTION_LABEL[editing.chieu]} · lưu sẽ đưa cấu hình về Draft (cần Kích
              hoạt lại sau khi validate qua).
            </Text>
            <MappingFieldEditor fields={draftFields} onChange={setDraftFields} />
          </>
        )}
      </Drawer>

      {previewing && (
        <PreviewModal config={previewing} onClose={() => setPreviewing(null)} />
      )}
    </div>
  )
}

/** Modal preview payload (Slice F): chọn 1 bản ghi mẫu → JSON gốc / JSON sau mapping / lỗi. */
function PreviewModal({ config, onClose }: { config: MappingConfig; onClose: () => void }) {
  const samples = useMemo(() => sampleRecordsFor(config.doiTuong), [config.doiTuong])
  const [sampleId, setSampleId] = useState<string | undefined>(samples[0]?.id)
  const sample: SampleRecord | undefined = samples.find((s) => s.id === sampleId)
  const result = sample ? previewMapping(config, sample.data) : undefined

  return (
    <Modal open title={`Xem trước payload · ${config.he}`} onCancel={onClose} footer={null} width={720}>
      {samples.length === 0 ? (
        <Empty description="Chưa có dữ liệu mẫu cho đối tượng này trong mock hiện tại." />
      ) : (
        <>
          <Select
            style={{ width: '100%', marginBottom: 12 }}
            value={sampleId}
            onChange={setSampleId}
            options={samples.map((s) => ({ value: s.id, label: s.label }))}
          />
          {result && (
            <>
              <Row gutter={12}>
                <Col span={12}>
                  <Text strong style={{ fontSize: 12 }}>
                    Dữ liệu gốc (QTKHCN)
                  </Text>
                  <JsonBlock value={sample!.data} />
                </Col>
                <Col span={12}>
                  <Text strong style={{ fontSize: 12 }}>
                    Payload sau mapping ({config.he})
                  </Text>
                  <JsonBlock value={result.payload} />
                </Col>
              </Row>
              {(result.missingCount > 0 || result.invalidCount > 0) && (
                <div style={{ marginTop: 12 }}>
                  {result.fields
                    .filter((f) => f.thieu || f.loi)
                    .map((f) => (
                      <div key={f.fieldId} style={{ marginBottom: 4 }}>
                        <Tag color={f.thieu ? 'error' : 'warning'}>
                          {f.thieu ? 'Thiếu' : 'Lỗi'}
                        </Tag>
                        <Text style={{ fontSize: 12 }}>
                          {f.truongQTKHCN || '(chưa đặt tên)'} → {f.truongHeNgoai || '(chưa map)'}
                        </Text>
                      </div>
                    ))}
                </div>
              )}
              {result.missingCount === 0 && result.invalidCount === 0 && (
                <Text type="success" style={{ fontSize: 12, display: 'block', marginTop: 12 }}>
                  Không có field thiếu/lỗi với bản ghi mẫu này.
                </Text>
              )}
            </>
          )}
        </>
      )}
    </Modal>
  )
}

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre
      style={{
        margin: '6px 0 0',
        padding: 10,
        borderRadius: 8,
        fontSize: 12,
        lineHeight: 1.5,
        background: 'var(--vht-surface-2)',
        overflowX: 'auto',
        maxHeight: 260,
      }}
    >
      {JSON.stringify(value, null, 2)}
    </pre>
  )
}

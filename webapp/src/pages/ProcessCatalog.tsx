import { useMemo, useState } from 'react'
import {
  App,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Tooltip,
  Typography,
  Upload,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  InboxOutlined,
  PlusOutlined,
  UploadOutlined,
  PartitionOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import {
  NHOM,
  STATUS_META,
  curVer,
  type ProcessDef,
  type ProcessStatus,
} from '../data/processes'
import { RD_GROUPS, stageOfRd } from '../data/processLifecycle'
import { useProcesses } from '../store/ProcessContext'
import { usePermissions } from '../store/AuthContext'
import {
  PageHeader,
  StatCard,
  ProcessStatusTag,
  FilterBar,
  EntityTable,
  LIST_SCROLL_Y,
  ViewModeToggle,
  useCatalogViewMode,
} from '../components/ui'
import ProcessMapView from '../components/ProcessMapView'
import HelpButton from '../components/HelpButton'

const { Text, Paragraph } = Typography

function ProcessCard({
  p,
  onOpen,
}: {
  p: ProcessDef
  onOpen: () => void
}) {
  const stage = stageOfRd(p.nhom)
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      style={{
        height: '100%',
        borderRadius: 8,
        border: '1px solid var(--vht-border, #e8e8e8)',
        background: '#fff',
        padding: '16px 18px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.borderColor = stage?.color ?? '#1677ff'
        el.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)'
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.borderColor = 'var(--vht-border, #e8e8e8)'
        el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
        el.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <Text code style={{ fontSize: 12 }}>{p.ma}</Text>
        <ProcessStatusTag status={p.trangThai} />
      </div>
      <Text strong style={{ fontSize: 14, lineHeight: 1.35 }}>{p.ten}</Text>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {p.nhom} · {NHOM[p.nhom] ?? p.nhom}
        {stage ? ` · ${stage.label}` : ''}
      </Text>
      <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ fontSize: 12, marginBottom: 0, flex: 1 }}>
        {p.moTa}
      </Paragraph>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '1px solid #f0f0f0',
          paddingTop: 8,
          marginTop: 4,
          fontSize: 12,
        }}
      >
        <Text type="secondary">v{curVer(p)}</Text>
        <Text type="secondary">{p.instances > 0 ? `${p.instances} instance` : '—'}</Text>
      </div>
    </div>
  )
}

export default function ProcessCatalog() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { list, addProcess } = useProcesses()
  const { canManageSystem } = usePermissions()
  const routeBase = '/quy-trinh'

  const [q, setQ] = useState('')
  const [fNhom, setFNhom] = useState<string>()
  const [fStatus, setFStatus] = useState<ProcessStatus>()
  const [viewMode, setViewMode] = useCatalogViewMode('qtkhcn.view.quy-trinh', 'list')

  const [createOpen, setCreateOpen] = useState(false)
  const [form] = Form.useForm()

  const stats = useMemo(() => {
    const active = list.filter((p) => p.trangThai === 'active').length
    const notReady = list.filter((p) => p.trangThai === 'draft' || p.trangThai === 'planned').length
    const instances = list.reduce((s, p) => s + p.instances, 0)
    return { total: list.length, active, notReady, instances }
  }, [list])

  const rows = useMemo(() => {
    return list.filter((p) => {
      if (fNhom && p.nhom !== fNhom) return false
      if (fStatus && p.trangThai !== fStatus) return false
      if (q) {
        const s = q.toLowerCase()
        if (!p.ma.toLowerCase().includes(s) && !p.ten.toLowerCase().includes(s)) return false
      }
      return true
    })
  }, [list, q, fNhom, fStatus])

  const mapStats = useMemo(() => {
    const out: Record<string, { count: number; running: number }> = {}
    for (const g of RD_GROUPS) {
      const items = list.filter((p) => p.nhom === g.code)
      out[g.code] = {
        count: items.length,
        running: items.reduce((s, p) => s + p.instances, 0),
      }
    }
    return out
  }, [list])

  function submitCreate() {
    form.validateFields().then((values) => {
      const ma = String(values.ma || '').trim()
      const ten = String(values.ten || '').trim()
      const np: ProcessDef = {
        ma,
        ten,
        nhom: values.nhom,
        trangThai: 'active',
        instances: 0,
        capNhat: '2026-07-03',
        moTa: 'Quy trình mới deploy từ web app (mock).',
        versions: [{ v: '1.0', date: '2026-07-03', note: 'Deploy lần đầu' }],
      }
      if (!addProcess(np)) {
        message.error(`Mã ${ma} đã tồn tại.`)
        return
      }
      message.success(`Đã deploy quy trình mới ${ma} v1.0.`)
      setCreateOpen(false)
      form.resetFields()
    })
  }

  const columns: ColumnsType<ProcessDef> = [
    { title: 'Mã', dataIndex: 'ma', width: 96, render: (v: string) => <Text code>{v}</Text> },
    {
      title: 'Tên quy trình',
      dataIndex: 'ten',
      render: (v: string, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{v}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{NHOM[r.nhom]}</Text>
        </div>
      ),
    },
    { title: 'Nhóm', dataIndex: 'nhom', width: 90, render: (v: string) => <Text>{v}</Text> },
    {
      title: 'Giai đoạn',
      key: 'stage',
      width: 110,
      render: (_, r) => stageOfRd(r.nhom)?.label ?? '—',
    },
    {
      title: 'Phiên bản', key: 'ver', width: 100, align: 'center',
      render: (_, r) => <Text strong>v{curVer(r)}</Text>,
    },
    {
      title: 'Trạng thái', dataIndex: 'trangThai', width: 140, align: 'center',
      render: (v: ProcessStatus) => <ProcessStatusTag status={v} />,
    },
    {
      title: 'Instance', dataIndex: 'instances', width: 100, align: 'right',
      sorter: (a, b) => a.instances - b.instances,
      render: (v: number) => (v > 0 ? v : '—'),
    },
    { title: 'Cập nhật', dataIndex: 'capNhat', width: 110 },
  ]

  return (
    <div>
      <PageHeader
        title="Danh mục quy trình"
        extra={
          <Space>
            <Tooltip title={canManageSystem ? undefined : 'Chỉ Quản trị hệ thống được deploy quy trình.'}>
              <Button icon={<UploadOutlined />} disabled={!canManageSystem} onClick={() => setCreateOpen(true)}>
                Nhập từ .bpmn
              </Button>
            </Tooltip>
            <Tooltip title={canManageSystem ? undefined : 'Chỉ Quản trị hệ thống được tạo quy trình.'}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                disabled={!canManageSystem}
                onClick={() => navigate(`${routeBase}/moi`)}
              >
                Tạo & vẽ BPMN
              </Button>
            </Tooltip>
            <HelpButton section="quytrinh" />
          </Space>
        }
      />

      <Row gutter={14} style={{ marginBottom: 18 }}>
        <Col xs={12} md={6}><StatCard title="Tổng quy trình" value={stats.total} /></Col>
        <Col xs={12} md={6}><StatCard title="Đang chạy" value={stats.active} color="#17935a" /></Col>
        <Col xs={12} md={6}><StatCard title="Nháp / chưa triển khai" value={stats.notReady} color="#b06f00" /></Col>
        <Col xs={12} md={6}><StatCard title="Instance đang chạy" value={stats.instances} suffix="hồ sơ" /></Col>
      </Row>

      <FilterBar
        search={
          viewMode === 'map'
            ? undefined
            : { placeholder: 'Tìm theo mã hoặc tên quy trình...', onChange: setQ }
        }
        selects={
          viewMode === 'map'
            ? undefined
            : [
                {
                  key: 'nhom',
                  placeholder: 'Tất cả nhóm',
                  value: fNhom,
                  onChange: setFNhom,
                  width: 220,
                  options: Object.entries(NHOM).map(([k, v]) => ({ value: k, label: `${k} · ${v}` })),
                },
                {
                  key: 'status',
                  placeholder: 'Tất cả trạng thái',
                  value: fStatus,
                  onChange: setFStatus,
                  options: (Object.keys(STATUS_META) as ProcessStatus[]).map((k) => ({
                    value: k,
                    label: STATUS_META[k].label,
                  })),
                },
              ]
        }
        right={
          <Space>
            {viewMode !== 'map' && (
              <Text type="secondary">{rows.length}/{list.length} quy trình</Text>
            )}
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
          </Space>
        }
      />

      {viewMode === 'list' && (
        <EntityTable<ProcessDef>
          rowKey="ma"
          columns={columns}
          dataSource={rows}
          onRowClick={(record) => navigate(`${routeBase}/${encodeURIComponent(record.ma)}`)}
          emptyText="Không có quy trình khớp bộ lọc."
          scroll={{ y: LIST_SCROLL_Y }}
        />
      )}

      {viewMode === 'grid' && (
        rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#8593a3' }}>
            <PartitionOutlined style={{ fontSize: 40, marginBottom: 12 }} />
            <br />
            <Text type="secondary">Không có quy trình khớp bộ lọc.</Text>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {rows.map((p) => (
              <Col key={p.ma} xs={24} sm={12} lg={8} xl={6}>
                <ProcessCard
                  p={p}
                  onOpen={() => navigate(`${routeBase}/${encodeURIComponent(p.ma)}`)}
                />
              </Col>
            ))}
          </Row>
        )
      )}

      {viewMode === 'map' && (
        <ProcessMapView
          statsByRd={mapStats}
          activeRd={fNhom}
          onSelectGroup={(g) => {
            setViewMode('list')
            setFNhom(g.code)
          }}
          subtitle="Bấm một nhóm RD để lọc danh sách quy trình thuộc nhóm đó."
        />
      )}

      <Modal
        open={createOpen}
        title="Deploy quy trình mới"
        okText="Deploy"
        cancelText="Huỷ"
        onOk={submitCreate}
        onCancel={() => setCreateOpen(false)}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item label="Tệp BPMN">
            <Upload.Dragger beforeUpload={() => false} maxCount={1} accept=".bpmn,.xml">
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">Kéo-thả hoặc bấm chọn tệp .bpmn</p>
              <p className="ant-upload-hint" style={{ fontSize: 12 }}>Mô phỏng — không upload thật.</p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item name="ma" label="Mã quy trình" rules={[{ required: true, message: 'Nhập mã' }]}>
            <Input placeholder="VD: RD07.01" />
          </Form.Item>
          <Form.Item name="ten" label="Tên quy trình" rules={[{ required: true, message: 'Nhập tên' }]}>
            <Input placeholder="VD: Quản lý danh mục SPDV" />
          </Form.Item>
          <Form.Item name="nhom" label="Nhóm" initialValue="RD01" rules={[{ required: true }]}>
            <Select options={Object.entries(NHOM).map(([k, v]) => ({ value: k, label: `${k} · ${v}` }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

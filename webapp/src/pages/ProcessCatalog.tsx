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
  Tag,
  Typography,
  Upload,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { InboxOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import {
  NHOM,
  STATUS_META,
  curVer,
  type ProcessDef,
  type ProcessStatus,
} from '../data/processes'
import { useProcesses } from '../store/ProcessContext'
import { PageHeader, StatCard, ProcessStatusTag, FilterBar, EntityTable, LIST_SCROLL_Y } from '../components/ui'

const { Text } = Typography

export default function ProcessCatalog() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { list, addProcess } = useProcesses()

  const [q, setQ] = useState('')
  const [fNhom, setFNhom] = useState<string>()
  const [fStatus, setFStatus] = useState<ProcessStatus>()

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
    { title: 'Nhóm', dataIndex: 'nhom', width: 90, render: (v: string) => <Tag>{v}</Tag> },
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
            <Button icon={<UploadOutlined />} onClick={() => setCreateOpen(true)}>
              Nhập từ .bpmn
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/quy-trinh/moi')}>
              Tạo & vẽ BPMN
            </Button>
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
        search={{ placeholder: 'Tìm theo mã hoặc tên quy trình...', onChange: setQ }}
        selects={[
          { key: 'nhom', placeholder: 'Tất cả nhóm', value: fNhom, onChange: setFNhom, width: 220,
            options: Object.entries(NHOM).map(([k, v]) => ({ value: k, label: `${k} · ${v}` })) },
          { key: 'status', placeholder: 'Tất cả trạng thái', value: fStatus, onChange: setFStatus,
            options: (Object.keys(STATUS_META) as ProcessStatus[]).map((k) => ({ value: k, label: STATUS_META[k].label })) },
        ]}
        right={<Text type="secondary">{rows.length}/{list.length} quy trình</Text>}
      />

      <EntityTable<ProcessDef>
        rowKey="ma"
        columns={columns}
        dataSource={rows}
        onRowClick={(record) => navigate(`/quy-trinh/${encodeURIComponent(record.ma)}`)}
        emptyText="Không có quy trình khớp bộ lọc."
        scroll={{ y: LIST_SCROLL_Y }}
      />

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

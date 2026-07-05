import { useMemo, useState } from 'react'
import { Alert, Col, Modal, Row, Space, Tag, Tooltip, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { WarningOutlined, ClockCircleOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { PageHeader, StatCard, StatusTag, FilterBar, EntityTable, LIST_SCROLL_Y } from '../components/ui'
import {
  INSTANCE_STATE,
  seedInstances,
  type InstanceState,
  type ProcessInstance,
} from '../data/camundaOps'

const { Text, Paragraph } = Typography

/** Giám sát tiến trình luồng — Operate phiên bản custom (Seam A: App ↔ Camunda). */
export default function ProcessMonitor() {
  const [q, setQ] = useState('')
  const [fProcess, setFProcess] = useState<string>()
  const [fState, setFState] = useState<InstanceState>()
  const [detail, setDetail] = useState<ProcessInstance>()

  const stats = useMemo(() => {
    const active = seedInstances.filter((i) => i.trangThai === 'active').length
    const overdue = seedInstances.filter((i) => i.quaHan).length
    const incident = seedInstances.filter((i) => i.trangThai === 'incident').length
    const done = seedInstances.filter((i) => i.trangThai === 'completed').length
    return { active, overdue, incident, done }
  }, [])

  const processes = useMemo(
    () => Array.from(new Set(seedInstances.map((i) => i.process))).sort(),
    [],
  )

  const rows = useMemo(() => {
    return seedInstances.filter((i) => {
      if (fProcess && i.process !== fProcess) return false
      if (fState && i.trangThai !== fState) return false
      if (q) {
        const s = q.toLowerCase()
        if (!i.maHoSo.toLowerCase().includes(s) && !i.instanceKey.includes(s) && !i.maNV.toLowerCase().includes(s))
          return false
      }
      return true
    })
  }, [q, fProcess, fState])

  const columns: ColumnsType<ProcessInstance> = [
    {
      title: 'Instance key', dataIndex: 'instanceKey', width: 150,
      render: (v: string) => <Text code style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Mã hồ sơ', dataIndex: 'maHoSo', width: 128,
      render: (v: string, r) => (
        <div>
          <Text strong>{v}</Text>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{r.maNV}</Text></div>
        </div>
      ),
    },
    {
      title: 'Quy trình', key: 'process', width: 220,
      render: (_, r) => (
        <div>
          <Space size={6}><Text code>{r.process}</Text><Tag>v{r.version}</Tag></Space>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{r.processTen}</Text></div>
        </div>
      ),
    },
    {
      title: 'Bước hiện tại', dataIndex: 'buocHienTai',
      render: (v: string, r) => (
        <div>
          <div>{v}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.vaiTro}</Text>
        </div>
      ),
    },
    { title: 'Bắt đầu', dataIndex: 'batDau', width: 140, render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    {
      title: 'Trạng thái', key: 'state', width: 128, align: 'center',
      render: (_, r) => {
        const m = INSTANCE_STATE[r.trangThai]
        return (
          <Space direction="vertical" size={2}>
            <StatusTag color={m.color} label={m.label} />
            {r.quaHan && <Tag color="error" icon={<ClockCircleOutlined />}>Quá hạn</Tag>}
          </Space>
        )
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="Giám sát tiến trình luồng"
        icon={<ThunderboltOutlined style={{ fontSize: 26, color: '#ee0033' }} />}
      />

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Trạng thái luồng do Camunda 8 (Zeebe) làm chủ"
        description="Mỗi dòng là một process instance đang được engine điều phối. Nội dung hồ sơ nằm ở ứng dụng nghiệp vụ; ở đây chỉ hiển thị vị trí luồng, người/nhóm được giao, hạn và sự cố. (mock — chưa nối engine thật)"
      />

      <Row gutter={14} style={{ marginBottom: 18 }}>
        <Col xs={12} md={6}><StatCard title="Đang chạy" value={stats.active} color="#1677ff" /></Col>
        <Col xs={12} md={6}><StatCard title="Quá hạn (SLA)" value={stats.overdue} color="#cf1322" /></Col>
        <Col xs={12} md={6}><StatCard title="Sự cố (incident)" value={stats.incident} color="#cf1322" /></Col>
        <Col xs={12} md={6}><StatCard title="Đã hoàn tất" value={stats.done} color="#17935a" /></Col>
      </Row>

      <FilterBar
        search={{ placeholder: 'Tìm mã hồ sơ / NV / instance key...', onChange: setQ, width: 320 }}
        selects={[
          { key: 'process', placeholder: 'Tất cả quy trình', value: fProcess, onChange: setFProcess, width: 160,
            options: processes.map((p) => ({ value: p, label: p })) },
          { key: 'state', placeholder: 'Tất cả trạng thái', value: fState, onChange: setFState, width: 170,
            options: (Object.keys(INSTANCE_STATE) as InstanceState[]).map((k) => ({ value: k, label: INSTANCE_STATE[k].label })) },
        ]}
        right={<Text type="secondary">{rows.length}/{seedInstances.length} instance</Text>}
      />

      <EntityTable<ProcessInstance>
        rowKey="instanceKey"
        columns={columns}
        dataSource={rows}
        onRowClick={setDetail}
        emptyText="Không có instance khớp bộ lọc."
        scroll={{ y: LIST_SCROLL_Y }}
      />

      <Modal
        open={!!detail}
        title={detail && <Space><Text>Instance</Text><Text code>{detail.instanceKey}</Text></Space>}
        footer={null}
        onCancel={() => setDetail(undefined)}
        width={620}
      >
        {detail && (
          <div style={{ marginTop: 8 }}>
            {detail.trangThai === 'incident' && (
              <Alert
                type="error"
                showIcon
                icon={<WarningOutlined />}
                style={{ marginBottom: 14 }}
                message="Instance đang có sự cố (incident)"
                description={detail.incident}
              />
            )}
            <Row gutter={[12, 10]}>
              <Field label="Mã hồ sơ (correlation key)" value={<Text strong>{detail.maHoSo}</Text>} />
              <Field label="Nhiệm vụ KHCN" value={detail.maNV} />
              <Field label="Quy trình" value={<Space><Text code>{detail.process}</Text><Tag>v{detail.version}</Tag></Space>} />
              <Field label="Trạng thái" value={<StatusTag color={INSTANCE_STATE[detail.trangThai].color} label={INSTANCE_STATE[detail.trangThai].label} />} />
              <Field label="Bước hiện tại" value={detail.buocHienTai} span={24} />
              <Field label="Người/nhóm được giao" value={detail.vaiTro} />
              <Field label="Hạn xử lý" value={detail.hanXuLy ? <Tooltip title={detail.quaHan ? 'Đã quá hạn' : 'Trong hạn'}><Tag color={detail.quaHan ? 'error' : 'default'}>{detail.hanXuLy}</Tag></Tooltip> : '—'} />
              <Field label="Bắt đầu" value={detail.batDau} />
              <Field label="Cập nhật gần nhất" value={detail.capNhat} />
            </Row>
            <Paragraph type="secondary" style={{ fontSize: 12, marginTop: 14, marginBottom: 0 }}>
              Nguyên tắc D3: process variables chỉ giữ <Text code>maHoSo</Text> + biến điều khiển
              (<Text code>cap</Text>, <Text code>ketQuaThamDinh</Text>…). Nội dung hồ sơ mở ở màn nghiệp vụ.
            </Paragraph>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Field({ label, value, span = 12 }: { label: string; value: React.ReactNode; span?: number }) {
  return (
    <Col span={span}>
      <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
      <div>{value}</div>
    </Col>
  )
}

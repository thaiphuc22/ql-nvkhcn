import { useMemo, useState } from 'react'
import { Col, Empty, Row, Space, Tabs, Tag, Timeline, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { HistoryOutlined } from '@ant-design/icons'
import { PageHeader, StatCard, StatusTag, FilterBar, EntityTable, LIST_SCROLL_Y } from '../components/ui'
import {
  EVENT_META,
  eventDossiers,
  seedEvents,
  JOB_OUTCOME,
  seedJobRuns,
  type EventType,
  type ProcessEvent,
  type JobOutcome,
  type JobRun,
} from '../data/camundaOps'

const { Text } = Typography

/**
 * Nhật ký — hub lịch sử, 2 tab:
 *  • Nhật ký luồng   → per-hồ sơ, timeline sự kiện Zeebe (audit lớp điều phối).
 *  • Nhật ký tích hợp → cross-hồ sơ, bảng job worker (gọi hệ ngoài).
 */
export default function ProcessEventLog() {
  return (
    <div>
      <PageHeader title="Nhật ký" icon={<HistoryOutlined style={{ fontSize: 26, color: '#ee0033' }} />} />
      <Tabs
        defaultActiveKey="luong"
        items={[
          { key: 'luong', label: 'Nhật ký luồng', children: <FlowLog /> },
          { key: 'tichhop', label: 'Nhật ký tích hợp', children: <IntegrationLog /> },
        ]}
      />
    </div>
  )
}

/* ─────────────────────────── Tab 1: Nhật ký luồng ─────────────────────────── */

function FlowLog() {
  const [fHoSo, setFHoSo] = useState<string>(eventDossiers[0])
  const [fType, setFType] = useState<EventType>()

  const events = useMemo(() => {
    const rows = seedEvents
      .filter((e) => (fHoSo ? e.maHoSo === fHoSo : true))
      .filter((e) => (fType ? e.loai === fType : true))
    return [...rows].sort((a, b) => a.thoiDiem.localeCompare(b.thoiDiem))
  }, [fHoSo, fType])

  const stats = useMemo(() => {
    const scope = seedEvents.filter((e) => (fHoSo ? e.maHoSo === fHoSo : true))
    const services = scope.filter((e) => e.loai === 'service-task').length
    const incidents = scope.filter((e) => e.loai === 'incident').length
    return { total: scope.length, services, incidents }
  }, [fHoSo])

  const items = events.map((e: ProcessEvent) => {
    const m = EVENT_META[e.loai]
    return {
      color: m.color,
      children: (
        <div style={{ paddingBottom: 4 }}>
          <Space size={8} wrap align="center">
            <Text type="secondary" style={{ fontSize: 12 }}>{fmt(e.thoiDiem)}</Text>
            <Tag color={m.color}>{m.label}</Tag>
            <Text strong>{e.element}</Text>
          </Space>
          <div style={{ marginTop: 2 }}>
            <Text style={{ fontSize: 13 }}>{e.chiTiet}</Text>
          </div>
          {e.actor && <Text type="secondary" style={{ fontSize: 12 }}>↳ {e.actor}</Text>}
        </div>
      ),
    }
  })

  return (
    <div>
      <Row gutter={14} style={{ marginBottom: 18 }}>
        <Col xs={8}><StatCard title="Sự kiện" value={stats.total} /></Col>
        <Col xs={8}><StatCard title="Gọi hệ ngoài" value={stats.services} color="#722ed1" /></Col>
        <Col xs={8}><StatCard title="Sự cố" value={stats.incidents} color="#cf1322" /></Col>
      </Row>

      <FilterBar
        selects={[
          { key: 'hoso', placeholder: 'Chọn hồ sơ', value: fHoSo, onChange: (v) => setFHoSo(v), width: 200, allowClear: false,
            options: eventDossiers.map((d) => ({ value: d, label: d })) },
          { key: 'type', placeholder: 'Tất cả loại sự kiện', value: fType, onChange: setFType, width: 220,
            options: (Object.keys(EVENT_META) as EventType[]).map((k) => ({ value: k, label: EVENT_META[k].label })) },
        ]}
        right={<Text type="secondary">{events.length} sự kiện</Text>}
      />

      <div style={{ background: '#fff', border: '1px solid #e6e9ee', borderRadius: 8, padding: '20px 20px 4px' }}>
        {items.length ? <Timeline items={items} /> : <Empty description="Không có sự kiện khớp bộ lọc." />}
      </div>

      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 14 }}>
        Nguồn: lịch sử Zeebe/Operate (mock). Đây là audit <Text strong>lớp điều phối</Text> (luồng đi bước nào,
        rẽ nhánh, gọi hệ ngoài, sự cố). Audit <Text strong>nội dung</Text> (ai sửa dữ liệu gì trong hồ sơ) nằm ở
        ứng dụng nghiệp vụ — REQ-ENG-014.
      </Text>
    </div>
  )
}

/* ─────────────────────────── Tab 2: Nhật ký tích hợp ─────────────────────────── */

function IntegrationLog() {
  const [fHe, setFHe] = useState<string>()
  const [fKetQua, setFKetQua] = useState<JobOutcome>()

  const systems = useMemo(() => Array.from(new Set(seedJobRuns.map((j) => j.he))).sort(), [])

  const rows = useMemo(() => {
    return seedJobRuns
      .filter((j) => (fHe ? j.he === fHe : true))
      .filter((j) => (fKetQua ? j.ketQua === fKetQua : true))
      // Bảng cross-hồ sơ: mới nhất lên đầu.
      .slice()
      .sort((a, b) => b.thoiDiem.localeCompare(a.thoiDiem))
  }, [fHe, fKetQua])

  const stats = useMemo(() => {
    const failed = seedJobRuns.filter((j) => j.ketQua === 'failed').length
    const retry = seedJobRuns.filter((j) => j.ketQua === 'retry').length
    return { total: seedJobRuns.length, failed, retry }
  }, [])

  const columns: ColumnsType<JobRun> = [
    { title: 'Job type', dataIndex: 'jobType', width: 180, render: (v: string) => <Text code style={{ fontSize: 12 }}>{v}</Text> },
    { title: 'Hệ', dataIndex: 'he', width: 74, render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Mã hồ sơ', dataIndex: 'maHoSo', width: 128, render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Thời điểm', dataIndex: 'thoiDiem', width: 150, render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
    {
      title: 'Kết quả', dataIndex: 'ketQua', width: 140, align: 'center',
      render: (v: JobOutcome, r) => (
        <Space direction="vertical" size={2}>
          <StatusTag color={JOB_OUTCOME[v].color} label={JOB_OUTCOME[v].label} />
          <Text type="secondary" style={{ fontSize: 11 }}>retries {r.retries}</Text>
        </Space>
      ),
    },
    { title: 'Thông điệp', dataIndex: 'thongDiep', render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text> },
  ]

  return (
    <div>
      <Row gutter={14} style={{ marginBottom: 18 }}>
        <Col xs={8}><StatCard title="Lần chạy job" value={stats.total} /></Col>
        <Col xs={8}><StatCard title="Đang thử lại" value={stats.retry} color="#b06f00" /></Col>
        <Col xs={8}><StatCard title="Thất bại" value={stats.failed} color="#cf1322" /></Col>
      </Row>

      <FilterBar
        selects={[
          { key: 'he', placeholder: 'Tất cả hệ', value: fHe, onChange: setFHe, width: 160,
            options: systems.map((s) => ({ value: s, label: s })) },
          { key: 'ketqua', placeholder: 'Tất cả kết quả', value: fKetQua, onChange: setFKetQua, width: 170,
            options: (Object.keys(JOB_OUTCOME) as JobOutcome[]).map((k) => ({ value: k, label: JOB_OUTCOME[k].label })) },
        ]}
        right={<Text type="secondary">{rows.length}/{seedJobRuns.length} lần chạy</Text>}
      />

      <EntityTable<JobRun>
        rowKey="id"
        columns={columns}
        dataSource={rows}
        emptyText="Không có lần chạy job khớp bộ lọc."
        scroll={{ y: LIST_SCROLL_Y }}
      />

      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 14 }}>
        Mỗi dòng là một lần <Text strong>job worker</Text> chạy — Camunda giao việc qua service task, worker của app
        gọi hệ ngoài (docs/arch/camunda-design.md mục 5). Xem sức khoẻ tổng thể từng hệ ở màn
        <Text strong> Trạng thái tích hợp hệ ngoài</Text>.
      </Text>
    </div>
  )
}

/** '2026-06-20 09:12' → '20/06/2026 09:12' */
function fmt(s: string): string {
  const [d, t] = s.split(' ')
  const [y, m, dd] = d.split('-')
  return `${dd}/${m}/${y} ${t}`
}

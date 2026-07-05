import { useMemo, useState } from 'react'
import {
  Col,
  Row,
  Segmented,
  Tag,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import { type Dossier, type DossierStatus } from '../data/dossiers'
import { useDossiers } from '../store/DossierContext'
import { PageHeader, StatCard, DossierStatusTag, FilterBar, EntityTable, LIST_SCROLL_Y } from '../components/ui'

const { Text } = Typography

export default function DossierList() {
  const navigate = useNavigate()
  const { list } = useDossiers()
  const [q, setQ] = useState('')
  const [tab, setTab] = useState<DossierStatus | 'all'>('all')

  const stats = useMemo(
    () => ({
      processing: list.filter((d) => d.trangThai === 'processing').length,
      approved: list.filter((d) => d.trangThai === 'approved').length,
      rejected: list.filter((d) => d.trangThai === 'rejected').length,
    }),
    [list],
  )

  const rows = useMemo(
    () =>
      list.filter((d) => {
        if (tab !== 'all' && d.trangThai !== tab) return false
        if (q) {
          const s = q.toLowerCase()
          if (!d.id.toLowerCase().includes(s) && !d.tenDeTai.toLowerCase().includes(s) && !d.maDeTai.toLowerCase().includes(s))
            return false
        }
        return true
      }),
    [list, q, tab],
  )

  const columns: ColumnsType<Dossier> = [
    { title: 'Mã hồ sơ', dataIndex: 'id', width: 130, render: (v: string) => <Text code>{v}</Text> },
    {
      title: 'Đề tài',
      dataIndex: 'tenDeTai',
      render: (v: string, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{v}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.maDeTai} · {r.chuNhiem}</Text>
        </div>
      ),
    },
    { title: 'Quy trình', dataIndex: 'quyTrinh', width: 100, render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Cấp', dataIndex: 'cap', width: 90 },
    {
      title: 'Bước hiện tại',
      key: 'buoc',
      width: 220,
      render: (_, r) =>
        r.trangThai === 'processing' ? (
          <Text>{r.steps[r.buocHienTai]?.ten ?? '—'}</Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      width: 140,
      render: (v: DossierStatus) => <DossierStatusTag status={v} />,
    },
    { title: 'Ngày tạo', dataIndex: 'ngayTao', width: 110 },
  ]

  return (
    <div>
      <PageHeader title="Hồ sơ Nhiệm vụ KHCN" style={{ marginBottom: 0 }} />

      <Row gutter={14} style={{ margin: '18px 0' }}>
        <Col xs={8}><StatCard title="Đang xử lý" value={stats.processing} color="#1677ff" /></Col>
        <Col xs={8}><StatCard title="Đã phê duyệt" value={stats.approved} color="#17935a" /></Col>
        <Col xs={8}><StatCard title="Bị từ chối" value={stats.rejected} color="#cf1322" /></Col>
      </Row>

      <FilterBar
        justify="space-between"
        left={
          <Segmented
            value={tab}
            onChange={(v) => setTab(v as DossierStatus | 'all')}
            options={[
              { label: 'Tất cả', value: 'all' },
              { label: 'Đang xử lý', value: 'processing' },
              { label: 'Đã phê duyệt', value: 'approved' },
              { label: 'Bị từ chối', value: 'rejected' },
            ]}
          />
        }
        search={{ placeholder: 'Tìm mã hồ sơ / đề tài...', onChange: setQ }}
      />

      <EntityTable<Dossier>
        rowKey="id"
        columns={columns}
        dataSource={rows}
        onRowClick={(record) => navigate(`/ho-so/${encodeURIComponent(record.id)}`)}
        emptyText="Không có hồ sơ khớp bộ lọc."
        scroll={{ y: LIST_SCROLL_Y }}
      />
    </div>
  )
}

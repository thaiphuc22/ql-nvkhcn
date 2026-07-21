import { useMemo, useState } from 'react'
import {
  Button,
  Col,
  Row,
  Segmented,
  Space,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { type Dossier, type DossierStatus } from '../data/dossiers'
import { useDossiers } from '../store/DossierContext'
import { usePermissions } from '../store/AuthContext'
import { PageHeader, StatCard, DossierStatusTag, FilterBar, EntityTable, LIST_SCROLL_Y } from '../components/ui'
import HelpButton from '../components/HelpButton'

const { Text } = Typography

/** Kiểm tra hồ sơ có đang vượt SLA không (bước hiện tại đã quá hạn). */
function isSlaOverdue(d: Dossier, now: dayjs.Dayjs): boolean {
  if (d.trangThai !== 'processing') return false
  const current = d.steps.find((s) => s.trangThai === 'current')
  if (!current?.hanXuLy) return false
  const deadline = dayjs(current.hanXuLy, 'DD/MM/YYYY', true)
  if (!deadline.isValid()) return false
  return now.isAfter(deadline, 'day')
}

export default function DossierList() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { list } = useDossiers()
  const { canCreateHoSo } = usePermissions()
  const [q, setQ] = useState('')

  // Initialize tab from ?status= query param if present
  const initialTab = searchParams.get('status') as DossierStatus | 'all' | null
  const [tab, setTab] = useState<DossierStatus | 'all'>(initialTab && ['draft', 'processing', 'approved', 'rejected', 'cancelled', 'all'].includes(initialTab) ? initialTab : 'all')

  // Initialize SLA overdue filter from ?sla=overdue query param
  const slaFilter = searchParams.get('sla') === 'overdue' ? 'overdue' : 'all'
  const now = dayjs('2026-07-21') // current date for SLA calculation

  const stats = useMemo(
    () => ({
      draft: list.filter((d) => d.trangThai === 'draft').length,
      processing: list.filter((d) => d.trangThai === 'processing').length,
      approved: list.filter((d) => d.trangThai === 'approved').length,
      rejected: list.filter((d) => d.trangThai === 'rejected').length,
      cancelled: list.filter((d) => d.trangThai === 'cancelled').length,
    }),
    [list],
  )

  const rows = useMemo(
    () =>
      list.filter((d) => {
        if (tab !== 'all' && d.trangThai !== tab) return false
        if (slaFilter === 'overdue' && !isSlaOverdue(d, now)) return false
        if (q) {
          const s = q.toLowerCase()
          if (!d.id.toLowerCase().includes(s) && !d.tenDeTai.toLowerCase().includes(s) && !d.maDeTai.toLowerCase().includes(s))
            return false
        }
        return true
      }),
    [list, q, tab, slaFilter, now],
  )

  /** Số HS quá hạn SLA (cho StatCard). */
  const slaOverdueCount = useMemo(
    () => list.filter((d) => isSlaOverdue(d, now)).length,
    [list, now],
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
    //  { title: 'Mã nhiệm vụ', dataIndex: 'maNhiemVu', width: 130, render: (v: string) => <Text code>{v}</Text> },
    {
      title: 'Quy trình',
      dataIndex: 'quyTrinh',
      width: 100,
      render: (v: string) => (v ? <Text>{v}</Text> : <Text type="secondary">—</Text>),
    },
    { title: 'Cấp', dataIndex: 'cap', width: 90 },
    { title: 'Loại', dataIndex: 'loai', width: 120 },
    {
      title: 'Bước hiện tại',
      key: 'buoc',
      width: 220,
      render: (_, r) =>
        r.trangThai === 'processing' ? (
          <Text>{r.steps[r.buocHienTai]?.ten ?? '—'}</Text>
        ) : r.trangThai === 'draft' ? (
          <Text type="secondary">Chờ gửi duyệt</Text>
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
      <PageHeader
        title="Hồ sơ Nhiệm vụ KHCN"
        style={{ marginBottom: 0 }}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={!canCreateHoSo}
              onClick={() => navigate('/ho-so/tao-moi')}
            >
              Tạo hồ sơ
            </Button>
            <HelpButton section="hoso" />
          </Space>
        }
      />

      <Row gutter={14} style={{ margin: '18px 0' }}>
        <Col xs={12} md={6}><StatCard title="Khởi tạo" value={stats.draft} color="#8593a3" style={{ cursor: 'pointer' }} onClick={() => navigate('/ho-so?status=draft')} /></Col>
        <Col xs={12} md={6}><StatCard title="Đang xử lý" value={stats.processing} color="#1677ff" style={{ cursor: 'pointer' }} onClick={() => navigate('/ho-so?status=processing')} /></Col>
        <Col xs={12} md={6}><StatCard title="Đã phê duyệt" value={stats.approved} color="#17935a" style={{ cursor: 'pointer' }} onClick={() => navigate('/ho-so?status=approved')} /></Col>
        <Col xs={12} md={6}><StatCard title="Bị từ chối" value={stats.rejected} color="#cf1322" style={{ cursor: 'pointer' }} onClick={() => navigate('/ho-so?status=rejected')} /></Col>
        <Col xs={12} md={6}><StatCard title="Hủy" value={stats.cancelled} color="#8593a3" style={{ cursor: 'pointer' }} onClick={() => navigate('/ho-so?status=cancelled')} /></Col>
        <Col xs={12} md={6}><StatCard title="Quá hạn SLA" value={slaOverdueCount} color="#cf1322" style={{ cursor: 'pointer' }} onClick={() => navigate('/ho-so?sla=overdue')} /></Col>
      </Row>

      <FilterBar
        justify="space-between"
        left={
          <Segmented
            value={tab}
            onChange={(v) => {
              setTab(v as DossierStatus | 'all')
              // Update URL query param without reloading
              const params = new URLSearchParams(searchParams)
              if (v === 'all') {
                params.delete('status')
              } else {
                params.set('status', v as string)
              }
              navigate(`/ho-so?${params.toString()}`, { replace: true })
            }}
            options={[
              { label: 'Tất cả', value: 'all' },
              { label: `Khởi tạo (${stats.draft})`, value: 'draft' },
              { label: `Đang xử lý (${stats.processing})`, value: 'processing' },
              { label: `Đã phê duyệt (${stats.approved})`, value: 'approved' },
              { label: `Bị từ chối (${stats.rejected})`, value: 'rejected' },
              { label: `Hủy (${stats.cancelled})`, value: 'cancelled' },
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

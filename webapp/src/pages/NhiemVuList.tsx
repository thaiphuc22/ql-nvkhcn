import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Col, Row, Space, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { FolderOpenOutlined, PlusOutlined } from '@ant-design/icons'
import {
  chuNhiemLabel,
  GIAI_DOAN,
  GIAI_DOAN_COLOR,
  type Cap,
  type GiaiDoan,
  type NhiemVu,
} from '../data/nhiemVu'
import { useNhiemVu } from '../store/NhiemVuContext'
import { useDossiers } from '../store/DossierContext'
import { PageHeader, StatCard, FilterBar, EntityTable, LIST_SCROLL_Y } from '../components/ui'

const { Text } = Typography

export default function NhiemVuList() {
  const navigate = useNavigate()
  const { list: nhiemVu } = useNhiemVu()
  const { list: dossiers } = useDossiers()

  const [q, setQ] = useState('')
  const [fCap, setFCap] = useState<Cap>()
  const [fGiaiDoan, setFGiaiDoan] = useState<GiaiDoan>()

  // Đếm số hồ sơ theo từng nhiệm vụ.
  const hoSoCount = useMemo(() => {
    const m = new Map<string, number>()
    for (const d of dossiers) m.set(d.maNV, (m.get(d.maNV) ?? 0) + 1)
    return m
  }, [dossiers])

  const stats = useMemo(() => {
    const coSo = nhiemVu.filter((n) => n.cap === 'Cơ sở').length
    const tapDoan = nhiemVu.filter((n) => n.cap === 'Tập đoàn').length
    return { total: nhiemVu.length, coSo, tapDoan, hoso: dossiers.length }
  }, [nhiemVu, dossiers])

  const rows = useMemo(
    () =>
      nhiemVu.filter((n) => {
        if (fCap && n.cap !== fCap) return false
        if (fGiaiDoan && n.giaiDoan !== fGiaiDoan) return false
        if (q) {
          const s = q.toLowerCase()
          if (
            !n.ma.toLowerCase().includes(s) &&
            !n.ten.toLowerCase().includes(s) &&
            !n.chuNhiem.hoTen.toLowerCase().includes(s)
          )
            return false
        }
        return true
      }),
    [nhiemVu, q, fCap, fGiaiDoan],
  )

  const columns: ColumnsType<NhiemVu> = [
    { title: 'Mã NV KHCN', dataIndex: 'ma', width: 140, render: (v: string) => <Text code>{v}</Text> },
    {
      title: 'Tên nhiệm vụ',
      dataIndex: 'ten',
      render: (v: string, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{v}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{chuNhiemLabel(r.chuNhiem)} · {r.donViChuTri}</Text>
        </div>
      ),
    },
    { title: 'Cấp', dataIndex: 'cap', width: 90 },
    { title: 'Dự toán', dataIndex: 'duToan', width: 150, align: 'right' },
    {
      title: 'Giai đoạn',
      dataIndex: 'giaiDoan',
      width: 130,
      render: (v: GiaiDoan) => <Tag color={GIAI_DOAN_COLOR[v]}>{GIAI_DOAN[v]}</Tag>,
    },
    {
      title: 'Số hồ sơ',
      key: 'hoso',
      width: 100,
      align: 'center',
      render: (_, r) => hoSoCount.get(r.ma) ?? 0,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Nhiệm vụ KHCN"
        extra={
          <Space>
            <Button icon={<FolderOpenOutlined />} onClick={() => navigate('/ho-so')}>
              Danh sách hồ sơ
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/nhiem-vu/moi')}>
              Tạo Nhiệm vụ KHCN mới
            </Button>
          </Space>
        }
      />

      <Row gutter={14} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}><StatCard title="Tổng nhiệm vụ" value={stats.total} /></Col>
        <Col xs={12} md={6}><StatCard title="Cấp Cơ sở" value={stats.coSo} color="#1677ff" /></Col>
        <Col xs={12} md={6}><StatCard title="Cấp Tập đoàn" value={stats.tapDoan} color="#722ed1" /></Col>
        <Col xs={12} md={6}><StatCard title="Tổng hồ sơ" value={stats.hoso} color="#ee0033" /></Col>
      </Row>

      <FilterBar
        search={{ placeholder: 'Tìm mã NV / tên / chủ nhiệm...', onChange: setQ }}
        selects={[
          { key: 'cap', placeholder: 'Tất cả cấp', value: fCap, onChange: setFCap, width: 160,
            options: [{ value: 'Cơ sở', label: 'Cơ sở' }, { value: 'Tập đoàn', label: 'Tập đoàn' }] },
          { key: 'giaiDoan', placeholder: 'Tất cả giai đoạn', value: fGiaiDoan, onChange: setFGiaiDoan, width: 180,
            options: (Object.keys(GIAI_DOAN) as GiaiDoan[]).map((k) => ({ value: k, label: GIAI_DOAN[k] })) },
        ]}
        right={<Text type="secondary">{rows.length}/{nhiemVu.length} nhiệm vụ</Text>}
      />

      <EntityTable<NhiemVu>
        rowKey="ma"
        columns={columns}
        dataSource={rows}
        onRowClick={(r) => navigate(`/nhiem-vu/${encodeURIComponent(r.ma)}`)}
        emptyText="Không có nhiệm vụ khớp bộ lọc."
        scroll={{ y: LIST_SCROLL_Y }}
      />
    </div>
  )
}

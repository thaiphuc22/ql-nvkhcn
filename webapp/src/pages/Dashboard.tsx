import { useMemo } from 'react'
import { Card, Col, Row, Space, Tag, Typography, Progress, List, Empty } from 'antd'
import { ClockCircleOutlined, CheckCircleOutlined, FileTextOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import { useDossiers } from '../store/DossierContext'
import { useAuth } from '../store/AuthContext'
import { type Dossier, type DossierStatus } from '../data/dossiers'
import { PageHeader, StatCard, DossierStatusTag, EntityTable } from '../components/ui'

const { Text } = Typography

/** Mốc "hôm nay" của bản mock (đồng bộ với dữ liệu seed). */
const TODAY = new Date(2026, 6, 3) // 03/07/2026

/** Parse 'dd/mm/yyyy' (bỏ phần giờ nếu có) → Date; trả null nếu sai định dạng. */
function parseVNDate(s?: string): Date | null {
  if (!s) return null
  const m = s.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  if (!m) return null
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
}

/** Số ngày còn lại tới hạn (âm = quá hạn). */
function daysLeft(deadline?: string): number | null {
  const d = parseVNDate(deadline)
  if (!d) return null
  return Math.round((d.getTime() - TODAY.getTime()) / 86_400_000)
}

const STATUS_COLOR: Record<DossierStatus, string> = {
  processing: '#1677ff',
  approved: '#17935a',
  rejected: '#cf1322',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { list } = useDossiers()
  const { user } = useAuth()

  const stats = useMemo(() => {
    const processing = list.filter((d) => d.trangThai === 'processing').length
    const approved = list.filter((d) => d.trangThai === 'approved').length
    const rejected = list.filter((d) => d.trangThai === 'rejected').length
    const nhiemVu = new Set(list.map((d) => d.maNV)).size
    return { total: list.length, processing, approved, rejected, nhiemVu }
  }, [list])

  // Phân bố theo loại hồ sơ (giai đoạn vòng đời).
  const byLoai = useMemo(() => {
    const map = new Map<string, number>()
    list.forEach((d) => map.set(d.loai, (map.get(d.loai) ?? 0) + 1))
    return Array.from(map, ([loai, count]) => ({ loai, count })).sort((a, b) => b.count - a.count)
  }, [list])

  // Bước đang chờ xử lý (current) kèm hạn — sắp xếp theo hạn gần nhất.
  const deadlines = useMemo(
    () =>
      list
        .filter((d) => d.trangThai === 'processing')
        .map((d) => {
          const step = d.steps[d.buocHienTai]
          return { d, step, left: daysLeft(step?.hanXuLy) }
        })
        .filter((x) => x.step)
        .sort((a, b) => (a.left ?? 999) - (b.left ?? 999)),
    [list],
  )

  const overdue = deadlines.filter((x) => x.left != null && x.left < 0).length

  // Hoạt động gần đây: các bước đã hoàn tất, mới nhất trước.
  const recent = useMemo(() => {
    const items = list.flatMap((d) =>
      d.steps
        .filter((s) => s.trangThai === 'done' && s.thoiDiem)
        .map((s) => ({ d, ten: s.ten, thoiDiem: s.thoiDiem!, at: parseVNDate(s.thoiDiem)?.getTime() ?? 0 })),
    )
    return items.sort((a, b) => b.at - a.at).slice(0, 6)
  }, [list])

  const recentDossiers = useMemo(
    () => [...list].sort((a, b) => (a.ngayTao < b.ngayTao ? 1 : -1)),
    [list],
  )

  const columns: ColumnsType<Dossier> = [
    { title: 'Mã hồ sơ', dataIndex: 'id', width: 130, render: (v: string) => <Text code>{v}</Text> },
    {
      title: 'Đề tài',
      dataIndex: 'tenDeTai',
      render: (v: string, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{v}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{r.maDeTai} · {r.loai}</Text>
        </div>
      ),
    },
    { title: 'Trạng thái', dataIndex: 'trangThai', width: 140, render: (v: DossierStatus) => <DossierStatusTag status={v} /> },
    { title: 'Ngày tạo', dataIndex: 'ngayTao', width: 110 },
  ]

  const maxLoai = Math.max(1, ...byLoai.map((x) => x.count))

  return (
    <div>
      <PageHeader
        title="Tổng quan"
        style={{ marginBottom: 0 }}
        code={<Text type="secondary">Xin chào, {user?.hoTen} — đây là bức tranh chung hệ thống QTKHCN.</Text>}
      />

      {/* KPI */}
      <Row gutter={14} style={{ margin: '18px 0' }}>
        <Col xs={12} md={6}><StatCard title="Nhiệm vụ KHCN" value={stats.nhiemVu} color="#0958d9" /></Col>
        <Col xs={12} md={6}><StatCard title="Hồ sơ đang xử lý" value={stats.processing} color="#1677ff" /></Col>
        <Col xs={12} md={6}><StatCard title="Đã phê duyệt" value={stats.approved} color="#17935a" /></Col>
        <Col xs={12} md={6}>
          <StatCard title="Bước quá hạn" value={overdue} color={overdue ? '#cf1322' : '#8593a3'} />
        </Col>
      </Row>

      <Row gutter={[14, 14]}>
        {/* Cột trái */}
        <Col xs={24} lg={16}>
          <Card title="Hồ sơ theo trạng thái" style={{ marginBottom: 14 }}>
            <Space direction="vertical" size={14} style={{ width: '100%' }}>
              {(['processing', 'approved', 'rejected'] as DossierStatus[]).map((st) => {
                const count =
                  st === 'processing' ? stats.processing : st === 'approved' ? stats.approved : stats.rejected
                const pct = stats.total ? Math.round((count / stats.total) * 100) : 0
                return (
                  <div key={st}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <DossierStatusTag status={st} />
                      <Text type="secondary">{count} hồ sơ · {pct}%</Text>
                    </div>
                    <Progress percent={pct} showInfo={false} strokeColor={STATUS_COLOR[st]} />
                  </div>
                )
              })}
            </Space>
          </Card>

          <Card
            title="Hồ sơ mới nhất"
            extra={<a onClick={() => navigate('/ho-so')}>Xem tất cả</a>}
            styles={{ body: { paddingTop: 0 } }}
          >
            <EntityTable<Dossier>
              rowKey="id"
              columns={columns}
              dataSource={recentDossiers}
              pageSize={5}
              onRowClick={(r) => navigate(`/ho-so/${encodeURIComponent(r.id)}`)}
            />
          </Card>
        </Col>

        {/* Cột phải */}
        <Col xs={24} lg={8}>
          <Card title="Hạn xử lý sắp tới" style={{ marginBottom: 14 }}>
            {deadlines.length === 0 ? (
              <Empty description="Không có bước nào đang chờ" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <List
                size="small"
                dataSource={deadlines.slice(0, 6)}
                renderItem={({ d, step, left }) => {
                  const overdueItem = left != null && left < 0
                  return (
                    <List.Item
                      style={{ cursor: 'pointer', paddingInline: 0 }}
                      onClick={() => navigate(`/ho-so/${encodeURIComponent(d.id)}`)}
                    >
                      <List.Item.Meta
                        avatar={<ClockCircleOutlined style={{ color: overdueItem ? '#cf1322' : '#faad14', marginTop: 4 }} />}
                        title={<span style={{ fontSize: 13 }}>{step?.ten}</span>}
                        description={
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {d.maDeTai} · {d.id}
                          </Text>
                        }
                      />
                      <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
                        <div style={{ fontSize: 12 }}>{step?.hanXuLy ?? '—'}</div>
                        {left != null && (
                          <Tag color={overdueItem ? 'error' : left <= 3 ? 'warning' : 'default'} style={{ marginInlineEnd: 0 }}>
                            {overdueItem ? `Quá hạn ${-left}n` : `Còn ${left}n`}
                          </Tag>
                        )}
                      </div>
                    </List.Item>
                  )
                }}
              />
            )}
          </Card>

          <Card title="Hồ sơ theo giai đoạn">
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {byLoai.map((x) => (
                <div key={x.loai}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={{ fontSize: 13 }}>{x.loai}</Text>
                    <Text type="secondary">{x.count}</Text>
                  </div>
                  <div style={{ height: 8, background: '#f0f2f5', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(x.count / maxLoai) * 100}%`, background: '#1677ff', borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Hoạt động gần đây */}
      <Card title="Hoạt động gần đây" style={{ marginTop: 14 }}>
        {recent.length === 0 ? (
          <Empty description="Chưa có hoạt động" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List
            dataSource={recent}
            renderItem={({ d, ten, thoiDiem }) => (
              <List.Item
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/ho-so/${encodeURIComponent(d.id)}`)}
                actions={[<Text type="secondary" style={{ fontSize: 12 }}>{thoiDiem}</Text>]}
              >
                <List.Item.Meta
                  avatar={<CheckCircleOutlined style={{ color: '#17935a', fontSize: 18, marginTop: 2 }} />}
                  title={<span style={{ fontSize: 14 }}>{ten}</span>}
                  description={
                    <Space size={6}>
                      <FileTextOutlined style={{ color: '#8593a3' }} />
                      <Text type="secondary" style={{ fontSize: 12 }}>{d.maDeTai} · {d.tenDeTai}</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  )
}
